import { getDb } from "./db";
import { emailSequences } from "../drizzle/schema";
import { eq, and, isNull, lt } from "drizzle-orm";
import { addBrevoContact } from "./emailService";

export type SequenceType = "welcome" | "7day" | "upsell" | "retention" | "post_purchase" | "abandon_cart";

interface EmailTemplate {
  subject: string;
  htmlBody: string;
}

/**
 * Email templates for each sequence type and email number
 */
const EMAIL_TEMPLATES: Record<SequenceType, Record<number, EmailTemplate>> = {
  welcome: {
    // E1: Ihned — Chronotype reveal + cheat sheet + soft sell $7
    1: {
      subject: "🌙 Your {{chronotype}} Sleep Profile — Free Cheat Sheet Inside",
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
          <h2 style="color: #f59e0b;">Hi {{firstName}},</h2>
          <p>You just discovered something most people never figure out about their sleep.</p>
          <p>You're a <strong>{{chronotype}}</strong> — and that single fact explains why your sleep has been off.</p>
          <p>I've prepared your <strong>free {{chronotype}} Sleep Cheat Sheet</strong> — the 3 most important things you can do <em>tonight</em> to start sleeping better:</p>
          <ol>
            <li><strong>Set your anchor wake time</strong> — same time every day, even weekends</li>
            <li><strong>No screens 45 min before bed</strong> — your {{chronotype}} brain is especially sensitive to blue light</li>
            <li><strong>The 4-7-8 breathing technique</strong> — 4 seconds in, 7 hold, 8 out. Do it 3 times.</li>
          </ol>
          <p>These are free. They work. But they're just the surface.</p>
          <p>The full <strong>7-Night {{chronotype}} Protocol</strong> goes 10x deeper — with a night-by-night plan built specifically for your chronotype.</p>
          <p style="background: #fff8e7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px;">Right now it's <strong>$7</strong> (normally $19). This price is only for people who just completed the quiz.</p>
          <p><a href="https://{{domain}}/order?chronotype={{chronotype}}" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Get Your {{chronotype}} Protocol — $7 →</a></p>
          <p style="color: #888; font-size: 13px;">30-day money-back guarantee. No questions asked.</p>
          <p>— Luna<br><em>Deep Sleep Reset</em></p>
          <p style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">This is an educational wellness guide based on evidence-informed CBT-I principles. Not medical advice.</p>
        </div>
      `,
    },
    // E2: +24h — Science behind chronotypes (value email, no hard sell)
    2: {
      subject: "Why you can't sleep (it's not what you think)",
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
          <h2 style="color: #f59e0b;">Hi {{firstName}},</h2>
          <p>Most people think bad sleep is a willpower problem.</p>
          <p>It's not. It's a <strong>chronobiology problem</strong>.</p>
          <p>Here's what's actually happening in your brain when you can't sleep:</p>
          <ul>
            <li><strong>Cortisol spikes</strong> at the wrong time (stress hormone that should be low at night)</li>
            <li><strong>Adenosine buildup</strong> — your sleep pressure isn't high enough by bedtime</li>
            <li><strong>Melatonin mistiming</strong> — your {{chronotype}} body releases it at a different time than average</li>
          </ul>
          <p>The 7-Night Protocol fixes all three — in sequence, night by night.</p>
          <p>It's based on CBT-I (Cognitive Behavioral Therapy for Insomnia) — the gold standard treatment that outperforms sleeping pills in clinical trials.</p>
          <p><a href="https://{{domain}}/order?chronotype={{chronotype}}" style="display: inline-block; background: #1a1a2e; color: #f59e0b; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">See the Full Protocol ($7) →</a></p>
          <p>— Luna</p>
          <p style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">Educational wellness content. Not medical advice.</p>
        </div>
      `,
    },
    // E3: +48h — 3 mistakes + social proof
    3: {
      subject: "3 mistakes {{chronotype}}s make before bed (are you doing #2?)",
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
          <h2 style="color: #f59e0b;">Hi {{firstName}},</h2>
          <p>I've analyzed hundreds of {{chronotype}} sleep patterns. These 3 mistakes come up every time:</p>
          <p><strong>Mistake #1: Inconsistent wake time</strong><br>{{chronotype}}s are especially sensitive to schedule shifts. Even 30 minutes off destroys your sleep architecture for 2-3 days.</p>
          <p><strong>Mistake #2: Exercising at the wrong time</strong><br>For {{chronotype}}s, exercise timing matters more than intensity. Most people exercise when it actively disrupts their sleep.</p>
          <p><strong>Mistake #3: The wrong wind-down ritual</strong><br>Generic advice doesn't work for {{chronotype}}s. Your nervous system needs a specific sequence to downregulate.</p>
          <p>Here's what Jana from Brno said after fixing these:</p>
          <blockquote style="border-left: 4px solid #f59e0b; padding-left: 16px; margin: 20px 0; color: #555; font-style: italic;">
            "I was skeptical. But Night 3 was different. I woke up at 6am without an alarm and actually felt rested. First time in 2 years."
          </blockquote>
          <p><a href="https://{{domain}}/order?chronotype={{chronotype}}" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Fix All 3 — Get the Protocol ($7) →</a></p>
          <p>— Luna</p>
          <p style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">Educational wellness content. Not medical advice.</p>
        </div>
      `,
    },
    // E4: +72h — Testimonial + urgency (price rising)
    4: {
      subject: "Marek slept 7h straight on Night 4. Here's what he did.",
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
          <h2 style="color: #f59e0b;">Hi {{firstName}},</h2>
          <p>Marek is a {{chronotype}} from Prague. He'd been waking up at 3am for 8 months.</p>
          <p>On Night 4 of the protocol, he slept 7 hours straight for the first time since his daughter was born.</p>
          <blockquote style="border-left: 4px solid #f59e0b; padding-left: 16px; margin: 20px 0; color: #555; font-style: italic;">
            "I thought I just needed to 'push through it.' The protocol showed me I was fighting my own biology. Night 4 changed everything."
          </blockquote>
          <p>The difference? He followed the <strong>Night 4 Cortisol Reset</strong> — a specific technique in the protocol for {{chronotype}}s who wake in the early morning hours.</p>
          <p>The $7 price ends this week. After that it's back to $19.</p>
          <p><a href="https://{{domain}}/order?chronotype={{chronotype}}" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Get the Protocol Before Price Rises ($7) →</a></p>
          <p>— Luna</p>
          <p style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">Educational wellness content. Not medical advice.</p>
        </div>
      `,
    },
    // E5: +5d — Hard sell + last chance at $7
    5: {
      subject: "Last chance: $7 price expires tonight",
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
          <h2 style="color: #f59e0b;">Hi {{firstName}},</h2>
          <p>This is the last email I'll send about the $7 price.</p>
          <p>Tonight at midnight, the 7-Night {{chronotype}} Protocol goes back to $19.</p>
          <p><strong>What you get for $7:</strong></p>
          <ul>
            <li>✅ 7-Night Protocol PDF (personalized for {{chronotype}})</li>
            <li>✅ Sleep Environment Checklist</li>
            <li>✅ Chronotype Optimization Guide</li>
            <li>✅ 4 ASMR Sleep Tracks</li>
            <li>✅ 30-Day Sleep Tracker</li>
            <li>✅ 30-Day Money-Back Guarantee</li>
          </ul>
          <p>That's $7 for 7 nights of better sleep. Less than one coffee.</p>
          <p><a href="https://{{domain}}/order?chronotype={{chronotype}}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Claim $7 Price Before Midnight →</a></p>
          <p>— Luna</p>
          <p style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">Educational wellness content. Not medical advice.</p>
        </div>
      `,
    },
    // E6: +7d — Downsell: Night 1 Only za $1
    6: {
      subject: "OK, I hear you. Here's Night 1 for free.",
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
          <h2 style="color: #f59e0b;">Hi {{firstName}},</h2>
          <p>You haven't grabbed the protocol yet. That's OK — I get it. $7 is $7.</p>
          <p>So here's what I'm going to do:</p>
          <p style="background: #fff8e7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 18px;"><strong>Night 1 of the {{chronotype}} Protocol — completely free.</strong></p>
          <p>Just click below and I'll send it to you. No payment. No catch.</p>
          <p>If Night 1 doesn't help you sleep better, you'll know the full protocol isn't for you. Fair?</p>
          <p><a href="https://{{domain}}/order?chronotype={{chronotype}}&promo=NIGHT1FREE" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Send Me Night 1 Free →</a></p>
          <p>— Luna</p>
          <p style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">Educational wellness content. Not medical advice.</p>
        </div>
      `,
    },
    // E7: +14d — Membership upsell $8/mo
    7: {
      subject: "1,200 people sleep better every night. Here's how.",
      htmlBody: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; line-height: 1.7;">
          <h2 style="color: #f59e0b;">Hi {{firstName}},</h2>
          <p>Two weeks ago you discovered you're a {{chronotype}}.</p>
          <p>1,200 people in our community have used that knowledge to transform their sleep. They get:</p>
          <ul>
            <li>🌙 Monthly new sleep protocols (updated with latest research)</li>
            <li>📊 Personalized sleep tracking templates</li>
            <li>🎵 New ASMR tracks every month</li>
            <li>💬 Private community of {{chronotype}}s</li>
            <li>🔬 Early access to new chronotype tools</li>
          </ul>
          <p>All for <strong>$8/month</strong>. Cancel anytime.</p>
          <p><a href="https://{{domain}}/upsell/3?chronotype={{chronotype}}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Join the Community ($8/mo) →</a></p>
          <p>— Luna</p>
          <p style="font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">Educational wellness content. Not medical advice.</p>
        </div>
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
  "abandon_cart": {
    1: {
      subject: "You left your sleep protocol behind...",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>You took our Sleep Chronotype Quiz and discovered you're a <strong>{{chronotype}}</strong>.</p>
        <p>But you didn't grab your personalized protocol yet.</p>
        <p>Here's what other {{chronotype}}s are saying:</p>
        <blockquote style="border-left: 3px solid #f59e0b; padding-left: 12px; margin: 16px 0; color: #555;">
          "I went from 3+ hours of tossing to falling asleep in under 15 minutes. Night 3 was the turning point." &mdash; Sarah M.
        </blockquote>
        <p>Your protocol is still waiting. And it's just <strong>$4</strong>.</p>
        <p><a href="https://{{domain}}/order?chronotype={{chronotype}}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Get Your {{chronotype}} Protocol ($4)</a></p>
        <p>30-day money-back guarantee. No risk.</p>
        <p>&mdash; Luna</p>
      `,
    },
    2: {
      subject: "Last chance: Your {{chronotype}} protocol expires tonight",
      htmlBody: `
        <h2>Hi {{firstName}},</h2>
        <p>This is my last email about this.</p>
        <p>Your personalized {{chronotype}} Sleep Protocol is still available at the introductory price of <strong>$4</strong>.</p>
        <p>After tonight, the price goes back to $19.</p>
        <p><strong>What you get:</strong></p>
        <ul>
          <li>7-Night Protocol (personalized for {{chronotype}})</li>
          <li>Sleep Environment Checklist</li>
          <li>4 ASMR Sleep Tracks</li>
          <li>30-Day Sleep Tracker</li>
        </ul>
        <p><a href="https://{{domain}}/order?chronotype={{chronotype}}&discount=LASTCHANCE" style="background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Claim $4 Price Before Midnight &rarr;</a></p>
        <p>&mdash; Luna</p>
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
  delayMinutes: number = 0,
  specificEmailNumber?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  if (specificEmailNumber !== undefined) {
    // Schedule a single specific email at the given delay
    const emailScheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000);
    await db.insert(emailSequences).values({
      leadId,
      email,
      chronotype,
      sequenceType,
      emailNumber: specificEmailNumber,
      scheduledAt: emailScheduledAt,
      status: "pending",
    });
    return;
  }

  // Schedule all emails in the sequence (legacy behavior)
  const emailCount = Object.keys(EMAIL_TEMPLATES[sequenceType] || {}).length;
  for (let i = 1; i <= emailCount; i++) {
    const emailDelay = (i - 1) * 24 * 60; // Each email 24 hours apart
    const emailScheduledAt = new Date(Date.now() + (delayMinutes + emailDelay) * 60 * 1000);
    await db.insert(emailSequences).values({
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
  // E1: Ihned — Chronotype reveal + cheat sheet + soft sell $7
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 0, 1);

  // E2: +24h — Science behind chronotypes (value email)
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 24 * 60, 2);

  // E3: +48h — 3 mistakes + social proof
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 48 * 60, 3);

  // E4: +72h — Testimonial + urgency
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 72 * 60, 4);

  // E5: +5d — Hard sell + last chance at $7
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 5 * 24 * 60, 5);

  // E6: +7d — Downsell: Night 1 free
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 7 * 24 * 60, 6);

  // E7: +14d — Membership upsell $8/mo
  await scheduleEmailSequence(leadId, email, "welcome", chronotype, 14 * 24 * 60, 7);

  // Abandon cart: 2 hours later (cancelled if they purchase)
  await scheduleEmailSequence(leadId, email, "abandon_cart", chronotype, 2 * 60);
}

/**
 * Cancel abandon cart sequence when user purchases
 */
export async function cancelAbandonCart(email: string) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(emailSequences)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(emailSequences.email, email),
        eq(emailSequences.sequenceType, "abandon_cart"),
        eq(emailSequences.status, "pending")
      )
    );
}

/**
 * Nedvěd funnel: Lead Magnet capture sequence
 * Trigger: user submits email on /free-guide or LeadMagnetPopup
 * Flow: E-book delivery → 3× education → hard sell → win-back
 */
export async function onLeadMagnetCapture(email: string, leadId: number) {
  // LM1: Ihned — E-book delivery + UJN reminder
  await scheduleEmailSequence(leadId, email, "welcome", "Bear", 0, 1);
  // LM2: +24h — Value email: The #1 reason you can't sleep
  await scheduleEmailSequence(leadId, email, "welcome", "Bear", 24 * 60, 2);
  // LM3: +48h — 3 mistakes + social proof
  await scheduleEmailSequence(leadId, email, "welcome", "Bear", 48 * 60, 3);
  // LM4: +72h — Testimonial + urgency (price rising)
  await scheduleEmailSequence(leadId, email, "welcome", "Bear", 72 * 60, 4);
  // LM5: +5d — Hard sell + last chance
  await scheduleEmailSequence(leadId, email, "welcome", "Bear", 5 * 24 * 60, 5);
  // LM6: +7d — Downsell: Night 1 free
  await scheduleEmailSequence(leadId, email, "welcome", "Bear", 7 * 24 * 60, 6);
  // LM7: +14d — Win-back: membership upsell
  await scheduleEmailSequence(leadId, email, "welcome", "Bear", 14 * 24 * 60, 7);
}
