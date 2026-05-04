import Stripe from "stripe";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
// Using default Stripe API version

export interface ManualPaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  productName: string;
  email: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: "pending" | "completed" | "failed";
  message: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
    iban?: string;
  };
}

/**
 * Create a manual payment request (bank transfer)
 * This creates a payment intent and stores bank details for manual transfer
 */
export async function createManualPayment(
  input: ManualPaymentRequest
): Promise<PaymentResult> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        paymentId: "",
        status: "failed",
        message: "Database connection failed",
      };
    }

    // Create payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100), // Convert to cents
      currency: input.currency.toLowerCase(),
      description: input.description || input.productName,
      metadata: {
        userId: input.userId,
        productName: input.productName,
        paymentMethod: "manual_bank_transfer",
      },
      receipt_email: input.email,
      statement_descriptor: input.productName.substring(0, 22), // Max 22 chars
    });

    // Store order in database
    await db.insert(orders).values({
      sessionId: `manual-${paymentIntent.id}`,
      productId: "manual_payment",
      stripePaymentIntentId: paymentIntent.id,
      amount: input.amount.toString(),
      currency: input.currency,
      status: "pending",
      email: input.email,
    });

    // Return bank details for manual transfer
    const bankDetails = {
      accountName: process.env.BANK_ACCOUNT_NAME || "Deep Sleep Reset",
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || "****1234",
      bankName: process.env.BANK_NAME || "Your Bank",
      swiftCode: process.env.BANK_SWIFT_CODE,
      iban: process.env.BANK_IBAN,
    };

    return {
      success: true,
      paymentId: paymentIntent.id,
      status: "pending",
      message: `Payment pending. Please transfer ${input.amount} ${input.currency} to complete your order.`,
      bankDetails,
    };
  } catch (error) {
    console.error("[Payment] Error creating manual payment:", error);
    return {
      success: false,
      paymentId: "",
      status: "failed",
      message: error instanceof Error ? error.message : "Payment creation failed",
    };
  }
}

/**
 * Verify manual bank transfer payment
 * Called when user confirms they've made the transfer
 */
export async function verifyManualPayment(paymentId: string): Promise<PaymentResult> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        paymentId,
        status: "failed",
        message: "Database connection failed",
      };
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    if (paymentIntent.status === "succeeded") {
      // Update order status
      await db
        .update(orders)
        .set({ status: "completed" })
        .where(eq(orders.stripePaymentIntentId, paymentId));

      return {
        success: true,
        paymentId,
        status: "completed",
        message: "Payment verified and confirmed!",
      };
    }

    return {
      success: false,
      paymentId,
      status: "pending",
      message: "Payment not yet confirmed. Please complete the bank transfer.",
    };
  } catch (error) {
    console.error("[Payment] Error verifying manual payment:", error);
    return {
      success: false,
      paymentId,
      status: "failed",
      message: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Create Stripe Checkout Session with connected account (for direct bank payouts)
 */
export async function createCheckoutSessionWithConnectedAccount(input: {
  userId: string;
  email: string;
  amount: number;
  currency: string;
  productName: string;
  connectedAccountId: string;
}): Promise<{ sessionUrl: string | null; sessionId: string }> {
  try {
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: {
                name: input.productName,
                description: `Deep Sleep Reset - ${input.productName}`,
              },
              unit_amount: Math.round(input.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        customer_email: input.email,
        client_reference_id: input.userId,
        metadata: {
          userId: input.userId,
          productName: input.productName,
        },
      },
      {
        stripeAccount: input.connectedAccountId,
      }
    );

    return {
      sessionUrl: session.url,
      sessionId: session.id,
    };
  } catch (error) {
    console.error("[Payment] Error creating checkout session:", error);
    return {
      sessionUrl: null,
      sessionId: "",
    };
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string): Promise<{
  status: string;
  amount: number;
  currency: string;
  created: number;
}> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      created: paymentIntent.created,
    };
  } catch (error) {
    console.error("[Payment] Error getting payment status:", error);
    return {
      status: "error",
      amount: 0,
      currency: "USD",
      created: 0,
    };
  }
}

/**
 * Refund payment
 */
export async function refundPayment(paymentId: string, reason?: string): Promise<boolean> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      reason: (reason as any) || "requested_by_customer",
    });

    if (refund.status === "succeeded") {
      const db = await getDb();
      if (db) {
        await db
          .update(orders)
          .set({ status: "declined" })
          .where(eq(orders.stripePaymentIntentId, paymentId));
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Payment] Error refunding payment:", error);
    return false;
  }
}
