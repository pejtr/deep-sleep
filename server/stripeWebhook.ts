import { Express, Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendPurchaseConfirmation, addBrevoContact } from "./emailService";
import { initializeEmailSequence } from "./emailScheduler";

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
              const productId = session.metadata?.productId ?? "main";
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

              // Notify owner of new purchase
              await notifyOwner({
                title: "💰 New Purchase!",
                content: `Order #${orderId} completed. Product: ${productId}. Amount: ${amountTotal} ${session.currency?.toUpperCase()}. Email: ${buyerEmail ?? "unknown"}. Chronotype: ${chronotype ?? "unknown"}`,
              }).catch(() => {/* non-critical */});
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
