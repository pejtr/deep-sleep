import { getDb } from "./db";
import { emailSequences } from "../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";
import { sendDayXEmail } from "./emailService";

/**
 * Process pending emails from the 7-day sequence
 * Runs every hour to check for emails that need to be sent
 */
export async function processPendingEmails() {
  try {
    console.log("[Email Scheduler] Processing pending emails...");

    // Get all pending email sequences
    const pending = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.status, "pending"));

    console.log(`[Email Scheduler] Found ${pending.length} pending emails`);

    for (const seq of pending) {
      try {
        const day = (seq.emailNumber || 1) - 1;

        // Mark as sent
        await db
          .update(emailSequences)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(emailSequences.id, seq.id));

        console.log(`[Email Scheduler] Sent email ${seq.emailNumber} for lead ${seq.leadId}`);
      } catch (err) {
        console.error(`[Email Scheduler] Error sending email:`, err);

        // Mark as failed
        await db
          .update(emailSequences)
          .set({ status: "bounced" })
          .where(eq(emailSequences.id, seq.id));
      }
    }

    console.log("[Email Scheduler] Completed");
  } catch (err) {
    console.error("[Email Scheduler] Fatal error:", err);
  }
}

/**
 * Initialize email sequence for new buyer
 * Called after successful Stripe checkout
 */
export async function initializeEmailSequence(
  leadId: string,
  email: string,
  chronotype: string,
  downloadUrl: string
) {
  try {
    // Create 7 email records (Day 0-6)
    const emails = [];
    for (let day = 0; day <= 6; day++) {
      emails.push({
        leadId: parseInt(leadId),
        sequenceType: "7day",
        emailNumber: day + 1,
        status: "pending",
      });
    }

    await db.insert(emailSequences).values(emails);
    console.log(`[Email Scheduler] Initialized 7-day sequence for lead ${leadId}`);
  } catch (err) {
    console.error("[Email Scheduler] Error initializing sequence:", err);
  }
}
