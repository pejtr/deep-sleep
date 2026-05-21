import { getDb } from "./db";
import { emailSequences } from "../drizzle/schema";
import { eq, and, isNull, lt } from "drizzle-orm";
import { addBrevoContact } from "./emailService";

export type SequenceType = "welcome" | "7day" | "upsell" | "retention" | "post_purchase";

interface EmailTemplate {
  subject: string;
  htmlBody: string;
}

/**
 * Email templates for each sequence type and email number
 */
const EMAIL_TEMPLATES: Record<SequenceType, Record<number, EmailTemplate>> = {
  welcome: {
    1: {
      subject: "🌙 Your Sleep Chronotype Revealed — Start Your 7-Night Reset",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>Your chronotype is <strong>{{chronotype}}</strong>.</p>
        <p>This means your body naturally thrives on a specific sleep schedule. The Deep Sleep Reset is designed specifically for your chronotype.</p>
        <p><strong>What's Inside:</strong></p>
        <ul>
          <li>7-Night Protocol PDF (personalized for {{chronotype}})</li>
          <li>Sleep Environment Checklist</li>
          <li>Chronotype Guide</li>
          <li>4 ASMR Sleep Tracks</li>
          <li>30-Day Sleep Tracker</li>
        </ul>
        <p>All for just <strong>$4</strong> — one coffee.</p>
        <p><a href="https://{{domain}}/order?chronotype={{chronotype}}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Get Your Protocol Now</a></p>
        <p>Sleep better or your money back — 30-day guarantee.</p>
        <p>— Luna & the Deep Sleep Reset Team</p>
      `,
    },
  },
  "7day": {
    1: {
      subject: "📊 How's Your Sleep? (Day 1 Check-In)",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>It's been 24 hours since you started the 7-Night Deep Sleep Reset.</p>
        <p><strong>Quick check-in:</strong> How are you feeling?</p>
        <ul>
          <li>✅ Already sleeping better?</li>
          <li>⏳ Still adjusting?</li>
          <li>❓ Have questions?</li>
        </ul>
        <p>Reply to this email — I read every message.</p>
        <p>— Luna</p>
      `,
    },
    4: {
      subject: "🎁 Exclusive: Chronotype Optimizer ({{chronotype}} Edition) — $17 → $3",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>You're halfway through the 7-Night Protocol. How's it going?</p>
        <p>Many {{chronotype}}s ask: "How do I optimize my sleep even more?"</p>
        <p><strong>That's why we created the Chronotype Optimizer.</strong></p>
        <p>Normally $17 — but because you're already part of our community, it's just <strong>$3 today</strong>.</p>
        <p><a href="https://{{domain}}/upsell/1?chronotype={{chronotype}}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">See What's Included</a></p>
        <p>This offer expires in 24 hours.</p>
        <p>— Luna</p>
      `,
    },
  },
  upsell: {
    1: {
      subject: "🎵 Premium Sleep Sounds: 7 ASMR Tracks ({{chronotype}} Optimized) — $7",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>The protocol is working. Now let's add the soundtrack.</p>
        <p><strong>The ASMR Sleep Pack includes:</strong></p>
        <ul>
          <li>Rain on Rooftop (30 min)</li>
          <li>Forest Ambience (45 min)</li>
          <li>Ocean Waves (1 hour)</li>
          <li>Thunderstorm (1 hour)</li>
          <li>Fireplace Crackle (45 min)</li>
          <li>Binaural Beats (30 min)</li>
          <li>Guided Sleep Meditation (20 min)</li>
        </ul>
        <p>All scientifically optimized for {{chronotype}} sleep cycles.</p>
        <p><a href="https://{{domain}}/upsell/2?chronotype={{chronotype}}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Add ASMR Pack ($7)</a></p>
        <p>— Luna</p>
      `,
    },
  },
  retention: {
    1: {
      subject: "✨ 30 Days Later: Your Sleep Transformation ({{chronotype}})",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>It's been 30 days since you started the Deep Sleep Reset.</p>
        <p><strong>We'd love to hear:</strong> How has your sleep improved?</p>
        <ul>
          <li>🌙 Falling asleep faster?</li>
          <li>😴 Sleeping deeper?</li>
          <li>⚡ Waking up more energized?</li>
        </ul>
        <p>Share your story — your review helps others transform their sleep too.</p>
        <p><a href="https://{{domain}}/reviews" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Leave a Review</a></p>
        <p>— Luna</p>
      `,
    },
  },
  "post_purchase": {
    1: {
      subject: "🎉 Welcome to Deep Sleep Reset — Start Tonight",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>Your payment is confirmed. Your 7-Night Protocol is ready.</p>
        <p><strong>What to do now:</strong></p>
        <ol>
          <li>Download your personalized protocol (attached)</li>
          <li>Read Night 1 instructions</li>
          <li>Set up your sleep environment</li>
          <li>Start tonight</li>
        </ol>
        <p><a href="https://{{domain}}/protocol" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Your Protocol</a></p>
        <p>Sleep better or your money back.</p>
        <p>— Luna & the Deep Sleep Reset Team</p>
      `,
    },
  },
};


/**
 * Schedule email sequence based on trigger
 */
export async function scheduleEmailSequence(
  leadId: number,
  email: string,
  sequenceType: SequenceType,
  chronotype: string = "Bear",
  delayMinutes: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000);

  // Get email count for this sequence type
  const emailCount = Object.keys(EMAIL_TEMPLATES[sequenceType] || {}).length;

  for (let i = 1; i <= emailCount; i++) {
    const emailDelay = (i - 1) * 24 * 60; // Each email 24 hours apart
    const emailScheduledAt = new Date(Date.now() + (delayMinutes + emailDelay) * 60 * 1000);

    await db!.insert(emailSequences).values({
      leadId,
      email,
      chronotype,
      sequenceType,
      emailNumber: i,
      scheduledAt: emailScheduledAt,
      status: "pending",
    });
  }
}

/**
 * Send pending emails (called by cron job or manual trigger)
 */
export async function sendPendingEmails() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const now = new Date();

  // Get all pending emails that are due
  const pendingEmails = await db!
    .select()
    .from(emailSequences)
    .where(
      and(
        eq(emailSequences.status, "pending"),
        lt(emailSequences.scheduledAt, now),
        isNull(emailSequences.sentAt)
      )
    )
    .limit(100); // Process 100 at a time

  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const emailRecord of pendingEmails) {
    try {
      const template = EMAIL_TEMPLATES[emailRecord.sequenceType as SequenceType]?.[emailRecord.emailNumber];
      if (!template) {
        results.failed++;
        results.errors.push(`No template for ${emailRecord.sequenceType} #${emailRecord.emailNumber}`);
        continue;
      }

      // Replace placeholders
      const domain = process.env.VITE_APP_DOMAIN || "deep-sleep-reset.com";
      const firstName = emailRecord.email?.split("@")[0] || "Friend";
      const subject = template.subject
        .replace("{{firstName}}", firstName)
        .replace("{{chronotype}}", emailRecord.chronotype || "Bear")
        .replace("{{domain}}", domain);

      const htmlBody = template.htmlBody
        .replace("{{firstName}}", firstName)
        .replace("{{chronotype}}", emailRecord.chronotype || "Bear")
        .replace("{{domain}}", domain);

      // Send via Brevo
      await addBrevoContact({
        email: emailRecord.email || "",
        name: firstName,
        chronotype: emailRecord.chronotype || "Bear",
      });

      // Mark as sent
      await db!
        .update(emailSequences)
        .set({ sentAt: new Date(), status: "sent" })
        .where(eq(emailSequences.id, emailRecord.id));

      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to send email ${emailRecord.id}: ${error}`);
      console.error(`Email send failed for ${emailRecord.email}:`, error);
    }
  }

  return results;
}

/**
 * Trigger email sequence on purchase
 */
export async function onPurchaseComplete(email: string, leadId: number, chronotype: string = "Bear") {
  // Send post-purchase email immediately
  await scheduleEmailSequence(leadId, email, "post_purchase", chronotype, 0);

  // Schedule 7-day sequence (starts after 24 hours)
  await scheduleEmailSequence(leadId, email, "7day", chronotype, 24 * 60);

  // Schedule retention email (30 days later)
  await scheduleEmailSequence(leadId, email, "retention", chronotype, 30 * 24 * 60);
}


/**
 * Trigger email sequence on quiz complete
 */
export async function onQuizComplete(email: string, leadId: number, chronotype: string = "Bear") {
  // Send welcome email immediately
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 0);

  // Schedule upsell email (4 days later)
  await scheduleEmailSequence(leadId, email, "upsell", chronotype, 4 * 24 * 60);
}
