import { db } from "./db";
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
      .where(
        and(
          eq(emailSequences.status, "pending"),
          lt(emailSequences.scheduledFor, new Date())
        )
      );

    console.log(`[Email Scheduler] Found ${pending.length} pending emails`);

    for (const seq of pending) {
      try {
        const day = seq.dayNumber || 0;
        const email = seq.email || "";

        // Send the email based on day
        await sendDayXEmail({
          email,
          day,
          chronotype: seq.chronotype || "Bear",
          downloadUrl: seq.downloadUrl || "",
        });

        // Mark as sent
        await db
          .update(emailSequences)
          .set({
            status: "sent",
            sentAt: new Date(),
          })
          .where(eq(emailSequences.id, seq.id));

        console.log(`[Email Scheduler] Sent Day ${day} email to ${email}`);
      } catch (err) {
        console.error(`[Email Scheduler] Error sending email:`, err);

        // Increment retry count
        const retryCount = (seq.retryCount || 0) + 1;
        if (retryCount < 3) {
          // Retry in 1 hour
          const nextRetry = new Date(Date.now() + 60 * 60 * 1000);
          await db
            .update(emailSequences)
            .set({
              retryCount,
              scheduledFor: nextRetry,
            })
            .where(eq(emailSequences.id, seq.id));
        } else {
          // Mark as failed after 3 retries
          await db
            .update(emailSequences)
            .set({ status: "failed" })
            .where(eq(emailSequences.id, seq.id));
        }
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
    const now = new Date();

    // Create 7 email records (Day 0-6, Day 7 is optional)
    const emails = [];
    for (let day = 0; day <= 6; day++) {
      const scheduledFor = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      emails.push({
        leadId,
        email,
        dayNumber: day,
        chronotype,
        downloadUrl,
        status: "pending",
        scheduledFor,
        retryCount: 0,
      });
    }

    await db.insert(emailSequences).values(emails);
    console.log(`[Email Scheduler] Initialized 7-day sequence for ${email}`);
  } catch (err) {
    console.error("[Email Scheduler] Error initializing sequence:", err);
  }
}
