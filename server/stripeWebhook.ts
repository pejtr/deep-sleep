import { Express, Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { orders, subscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendPurchaseConfirmation, addBrevoContact } from "./emailService";
import { initializeEmailSequence } from "./emailScheduler";
import { dispatchWebhookEvent } from "./outboundWebhookDispatcher";
import { onPurchaseComplete } from "./emailSequenceService";

export function registerStripeWebhook(app: Express) {
  // CRITICAL: raw body parser must be registered BEFORE express.json()
  // This is handled in _core/index.ts by registering this route first
  app.post(
    "/api/stripe/webhook",
    // express.raw is applied in _core/index.ts before this handler
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Stripe Webhook] Signature verification failed:", message);
        return res.status(400).json({ error: `Webhook Error: ${message}` });
      }

      // Handle test events for webhook verification
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.orderId;
            const paymentIntentId = typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id;

            if (orderId) {
              const db = await getDb();
              // ── Idempotency: skip if already completed ──────────────────────
              const existing = await db?.select({ status: orders.status }).from(orders).where(eq(orders.id, parseInt(orderId))).limit(1);
              if (existing?.[0]?.status === "completed") {
                console.log(`[Stripe Webhook] Order ${orderId} already completed — skipping duplicate event ${event.id}`);
                return res.json({ received: true, skipped: true });
              }
              await db
                ?.update(orders)
                .set({
                  status: "completed",
                  stripeSessionId: session.id,
                  stripePaymentIntentId: paymentIntentId ?? null,
                  email: session.customer_email ?? undefined,
                })
                .where(eq(orders.id, parseInt(orderId)));

              console.log(`[Stripe Webhook] Order ${orderId} marked as completed`);

              // ── V1-1: Send purchase confirmation email ──────────────────────
              const buyerEmail = session.customer_email ?? session.metadata?.customer_email;
              const buyerName = session.metadata?.customer_name;
              // Map Stripe product IDs to email service product keys
              const rawProductId = session.metadata?.productId ?? "main";
              const PRODUCT_ID_MAP: Record<string, string> = {
                main: "tripwire",
                discount: "tripwire",
                entry: "tripwire",
                oto1: "oto1",
                oto2: "oto2",
                subscription: "oto3",
              };
              const productId = PRODUCT_ID_MAP[rawProductId] ?? "tripwire";
              const chronotype = session.metadata?.chronotype;
              const amountTotal = (session.amount_total ?? 500) / 100;

              if (buyerEmail) {
                // Send purchase confirmation with download links (fire-and-forget)
                sendPurchaseConfirmation({
                  email: buyerEmail,
                  name: buyerName,
                  product: productId,
                  chronotype,
                  amount: amountTotal,
                }).then(ok => {
                  console.log(`[Stripe Webhook] Purchase confirmation ${ok ? "✅ sent" : "❌ failed"} → ${buyerEmail}`);
                }).catch(() => {/* non-critical */});

        // Initialize 7-day email sequence
        const clientRefId = session.client_reference_id || "0";
        await initializeEmailSequence(
          clientRefId,
          buyerEmail || "",
          chronotype || "Bear",
          ""
        );

                // ── V1-3: Add to Brevo with chronotype tag ──────────────────
                addBrevoContact({
                  email: buyerEmail,
                  name: buyerName,
                  chronotype,
                  product: productId,
                }).then(ok => {
                  console.log(`[Stripe Webhook] Brevo contact ${ok ? "✅ added" : "❌ failed"} → ${buyerEmail} (${chronotype ?? "unknown"})`);
                }).catch(() => {/* non-critical */});
              }

              // Trigger automated email sequence (fire-and-forget)
              if (buyerEmail) {
                onPurchaseComplete(buyerEmail, parseInt(orderId), chronotype ?? "Bear").catch(() => {/* non-critical */});
              }

              // Dispatch outbound webhook event (fire-and-forget)
              dispatchWebhookEvent("new_order", {
                orderId,
                productId,
                amount: amountTotal,
                currency: session.currency?.toUpperCase(),
                email: buyerEmail ?? null,
                chronotype: chronotype ?? null,
                stripeSessionId: session.id,
              }).catch(() => {/* non-critical */});

              // Notify owner of new purchase
              await notifyOwner({
                title: "💰 New Purchase!",
                content: `Order #${orderId} completed. Product: ${productId}. Amount: ${amountTotal} ${session.currency?.toUpperCase()}. Email: ${buyerEmail ?? "unknown"}. Chronotype: ${chronotype ?? "unknown"}`,
              }).catch(() => {/* non-critical */});
            }
            break;
          }

          // ── Subscription lifecycle events ──────────────────────────────────
          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription & { current_period_end?: number };
            void (typeof sub.customer === "string" ? sub.customer : (sub.customer as { id: string }).id);
            const db = await getDb();
            if (!db) break;
            // Upsert subscription record
            try {
              const existing = await db.select().from(subscriptions)
                .where(eq(subscriptions.stripeSubscriptionId, sub.id)).limit(1);
              const periodEnd = sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null;
              // Map Stripe status to DB enum values
              const mapStatus = (s: string): "active" | "past_due" | "cancelled" | "expired" | "trialing" => {
                if (s === "canceled") return "cancelled";
                if (s === "unpaid") return "past_due";
                if (["active", "past_due", "cancelled", "expired", "trialing"].includes(s)) return s as "active" | "past_due" | "cancelled" | "expired" | "trialing";
                return "active";
              };
              const periodEndTs = periodEnd ? String(Math.floor(periodEnd.getTime() / 1000)) : null;
              if (existing.length > 0) {
                await db.update(subscriptions).set({
                  status: mapStatus(sub.status),
                  currentPeriodEnd: periodEndTs as any,
                  cancelAtPeriodEnd: sub.cancel_at_period_end,
                  updatedAt: new Date(),
                }).where(eq(subscriptions.stripeSubscriptionId, sub.id));
              } else {
                await db.insert(subscriptions).values({
                  userId: 0,
                  plan: "basic",
                  status: mapStatus(sub.status),
                  stripeSubscriptionId: sub.id,
                  currentPeriodEnd: periodEndTs as any,
                  cancelAtPeriodEnd: sub.cancel_at_period_end,
                  chronotype: "Bear",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }
              console.log(`[Stripe Webhook] Subscription ${sub.id} ${event.type === "customer.subscription.created" ? "created" : "updated"} — status: ${sub.status}`);
            } catch (e) {
              console.error("[Stripe Webhook] Subscription upsert error:", e);
            }
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const db = await getDb();
            if (!db) break;
            try {
              await db.update(subscriptions).set({
                status: "cancelled" as const,
                updatedAt: new Date(),
              }).where(eq(subscriptions.stripeSubscriptionId, sub.id));
              console.log(`[Stripe Webhook] Subscription ${sub.id} canceled`);
            } catch (e) {
              console.error("[Stripe Webhook] Subscription cancel error:", e);
            }
            break;
          }

          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null };
            const subId = typeof invoice.subscription === "string" ? invoice.subscription : (invoice.subscription as { id: string } | null | undefined)?.id;
            if (subId) {
              const db = await getDb();
              if (!db) break;
              await db.update(subscriptions).set({
                status: "active",
                updatedAt: new Date(),
              }).where(eq(subscriptions.stripeSubscriptionId, subId));
              console.log(`[Stripe Webhook] Invoice paid for subscription ${subId}`);
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null };
            const subId = typeof invoice.subscription === "string" ? invoice.subscription : (invoice.subscription as { id: string } | null | undefined)?.id;
            if (subId) {
              const db = await getDb();
              if (!db) break;
              await db.update(subscriptions).set({
                status: "past_due",
                updatedAt: new Date(),
              }).where(eq(subscriptions.stripeSubscriptionId, subId));
              console.log(`[Stripe Webhook] Invoice payment failed for subscription ${subId}`);
            }
            break;
          }

          case "payment_intent.payment_failed": {
            const pi = event.data.object as Stripe.PaymentIntent;
            const orderId = pi.metadata?.orderId;
            if (orderId) {
              const db = await getDb();
              await db
                ?.update(orders)
                .set({ status: "declined" })
                .where(eq(orders.id, parseInt(orderId)));
              console.log(`[Stripe Webhook] Order ${orderId} marked as declined`);
            }
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] Handler error:", err);
        return res.status(500).json({ error: "Webhook handler failed" });
      }

      return res.json({ received: true });
    }
  );
}
