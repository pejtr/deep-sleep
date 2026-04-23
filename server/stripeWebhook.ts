import { Express, Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

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

              // Notify owner of new purchase
              await notifyOwner({
                title: "💰 New Purchase!",
                content: `Order #${orderId} completed. Product: ${session.metadata?.productId ?? "main"}. Amount: ${(session.amount_total ?? 0) / 100} ${session.currency?.toUpperCase()}. Email: ${session.customer_email ?? "unknown"}`,
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
