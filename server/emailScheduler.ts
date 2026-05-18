import { getDb } from "./db";
import { emailSequences } from "../drizzle/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
import { sendSequenceEmail } from "./emailService";

// Days in the sequence that have actual email content
const SEQUENCE_DAYS = [1, 2, 3, 5, 7];

/**
 * Process pending emails from the 7-day sequence
 * Runs every hour to check for emails that need to be sent
 */
export async function processPendingEmails() {
  try {
    console.log("[Email Scheduler] Processing pending emails...");

    const db = await getDb();
    if (!db) {
      console.error("[Email Scheduler] Database connection failed");
      return;
    }

    const now = new Date();

    // Get pending emails that are due (scheduledAt <= now)
    const pending = await db
      .select()
      .from(emailSequences)
      .where(
        and(
          eq(emailSequences.status, "pending"),
          lte(emailSequences.scheduledAt, now)
        )
      );

    console.log(`[Email Scheduler] Found ${pending.length} emails due to send`);

    for (const seq of pending) {
      try {
        if (!seq.email) {
          console.warn(`[Email Scheduler] No email for sequence ${seq.id} — skipping`);
          await db.update(emailSequences).set({ status: "bounced" }).where(eq(emailSequences.id, seq.id));
          continue;
        }

        // Map emailNumber (1-7) to actual sequence day (1, 2, 3, 5, 7)
        const dayIndex = (seq.emailNumber || 1) - 1;
        const day = SEQUENCE_DAYS[dayIndex] ?? SEQUENCE_DAYS[0];

        const ok = await sendSequenceEmail({
          email: seq.email,
          chronotype: seq.chronotype || "Bear",
          day,
        });

        if (ok) {
          await db
            .update(emailSequences)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(emailSequences.id, seq.id));
          console.log(`[Email Scheduler] ✅ Sent Day ${day} email to ${seq.email}`);
        } else {
          await db
            .update(emailSequences)
            .set({ status: "bounced" })
            .where(eq(emailSequences.id, seq.id));
          console.warn(`[Email Scheduler] ❌ Failed to send Day ${day} email to ${seq.email}`);
        }
      } catch (err) {
        console.error(`[Email Scheduler] Error sending email ${seq.id}:`, err);
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
 * Creates 5 email records scheduled for days 1, 2, 3, 5, 7 after purchase
 */
export async function initializeEmailSequence(
  leadId: string,
  email: string,
  chronotype: string,
  _downloadUrl: string
) {
  try {
    if (!email) {
      console.warn("[Email Scheduler] No email provided — skipping sequence init");
      return;
    }

    const db = await getDb();
    if (!db) {
      console.error("[Email Scheduler] Database connection failed");
      return;
    }

    const now = new Date();

    // Create email records for each day in the sequence
    const emails = SEQUENCE_DAYS.map((day, index) => {
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() + day - 1); // day 1 = today, day 2 = tomorrow, etc.
      // Set to 9am local time (approximate)
      scheduledAt.setHours(9, 0, 0, 0);

      return {
        leadId: parseInt(leadId) || 0,
        email,
        chronotype: chronotype || "Bear",
        sequenceType: "7day",
        emailNumber: index + 1,
        scheduledAt,
        status: "pending" as const,
      };
    });

    await db.insert(emailSequences).values(emails);
    console.log(`[Email Scheduler] ✅ Initialized 5-email sequence for ${email} (chronotype: ${chronotype})`);
  } catch (err) {
    console.error("[Email Scheduler] Error initializing sequence:", err);
  }
}
