/**
 * Cash Injection Campaign Engine
 * AI-powered campaign generator + Brevo broadcast launcher
 * Inspired by Cash Injector (Robin Palmer) — adapted for Deep Sleep Reset
 */
import { getDb } from "./db";
import { getAdminStats } from "./db";
import { getAllLeadsWithScores } from "./contactIntelligence";
import type { LeadWithScore } from "./contactIntelligence";
import { invokeLLM } from "./_core/llm";
import { campaigns } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";

export type CampaignType = "FLASH_SALE" | "REACTIVATION" | "VIP_BUNDLE" | "UPSELL_BLAST";

export interface CampaignResult {
  success: boolean;
  campaignId?: string;
  sentCount?: number;
  targetSegment?: string;
  subject?: string;
  error?: string;
}

// ── Campaign Definitions ──────────────────────────────────────────────────────

const CAMPAIGN_CONFIGS: Record<CampaignType, {
  name: string;
  description: string;
  targetFilter: (lead: LeadWithScore) => boolean;
  urgency: string;
  offer: string;
  discount?: string;
}> = {
  FLASH_SALE: {
    name: "48h Flash Sale",
    description: "Limited-time 30% discount for all leads",
    targetFilter: (l) => !l.convertedToCustomer,
    urgency: "48 hours only",
    offer: "7-Night Deep Sleep Protocol",
    discount: "30% OFF — $4.90 instead of $7",
  },
  REACTIVATION: {
    name: "Reactivation Campaign",
    description: "Win back dormant leads (30+ days inactive)",
    targetFilter: (l) => {
      const daysAgo = (Date.now() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo >= 30 && !l.convertedToCustomer;
    },
    urgency: "We've been thinking about you",
    offer: "7-Night Deep Sleep Protocol + 3 FREE bonuses",
    discount: "Still just $7",
  },
  VIP_BUNDLE: {
    name: "VIP Bundle Offer",
    description: "Premium bundle for engaged leads and past buyers",
    targetFilter: (l) => l.computedScore >= 60,
    urgency: "VIP offer — limited spots",
    offer: "Complete Sleep Transformation Bundle",
    discount: "3 products for $19 (save $32)",
  },
  UPSELL_BLAST: {
    name: "Upsell Blast",
    description: "Upsell past buyers to membership",
    targetFilter: (l) => !!l.convertedToCustomer,
    urgency: "Exclusive for existing customers",
    offer: "Deep Sleep Monthly Membership",
    discount: "$8/month — cancel anytime",
  },
};

// ── AI Copy Generator ─────────────────────────────────────────────────────────

async function generateCampaignCopy(type: CampaignType, targetCount: number): Promise<{
  subject: string;
  preheader: string;
  htmlBody: string;
}> {
  const config = CAMPAIGN_CONFIGS[type];

  const prompt = `You are a direct-response email copywriter for Deep Sleep Reset — a $7 sleep protocol product.
Write a SHORT, high-converting email for a ${config.name} campaign.
Target: ${targetCount} leads who haven't purchased yet.
Offer: ${config.offer}
${config.discount ? `Discount: ${config.discount}` : ""}
Urgency: ${config.urgency}

Rules:
- Subject line: max 50 chars, curiosity + benefit, NO spam words
- Preheader: max 80 chars, complements subject
- Email body: 120-180 words MAX. Direct. No fluff.
- Tone: warm but urgent. Leila Hormozi meets sleep doctor.
- CTA: single clear button "Get My Protocol →"
- Include specific number (e.g. "12 minutes to fall asleep")
- End with P.S. that adds urgency

Return JSON: { "subject": "...", "preheader": "...", "htmlBody": "..." }
The htmlBody should be plain HTML with minimal styling — just <p>, <strong>, <a> tags.`;

  try {
    const res = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert email copywriter. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "email_copy",
          strict: true,
          schema: {
            type: "object",
            properties: {
              subject: { type: "string" },
              preheader: { type: "string" },
              htmlBody: { type: "string" },
            },
            required: ["subject", "preheader", "htmlBody"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = res.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("[CampaignEngine] AI copy generation failed:", err);
  }

  // Fallback copy
  return {
    subject: `${type === "FLASH_SALE" ? "⚡ 48h only: Your sleep protocol" : "Still struggling to sleep?"}`,
    preheader: "Your personalized 7-night protocol is waiting",
    htmlBody: `<p>Hi there,</p>
<p>You took the sleep quiz — which means you already know your chronotype and what's keeping you awake.</p>
<p>The 7-Night Deep Sleep Protocol gives you a step-by-step system to fall asleep in 12 minutes and stay asleep all night.</p>
<p><strong>${config.discount || config.offer}</strong></p>
<p><a href="https://deepsleep.manus.space/order">Get My Protocol →</a></p>
<p>P.S. ${config.urgency}. Don't let another bad night pass.</p>`,
  };
}

// ── Campaign Launcher ─────────────────────────────────────────────────────────

export async function launchCampaign(type: CampaignType, source: string = "admin"): Promise<CampaignResult> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  const config = CAMPAIGN_CONFIGS[type];

  try {
    // Get target leads
    const allLeads = await getAllLeadsWithScores();
    const targetLeads = allLeads.filter(config.targetFilter);

    if (targetLeads.length === 0) {
      return { success: false, error: `No eligible leads for ${type} campaign` };
    }

    // Generate AI copy
    const copy = await generateCampaignCopy(type, targetLeads.length);

    // Save campaign to DB
    const campaignId = `camp_${Date.now()}_${type.toLowerCase()}`;
    await db.insert(campaigns).values({
      id: campaignId,
      type,
      name: config.name,
      status: "SENDING",
      targetCount: targetLeads.length,
      sentCount: 0,
      subject: copy.subject,
      preheader: copy.preheader,
      htmlBody: copy.htmlBody,
      source,
      createdAt: new Date(),
    });

    // Send via Brevo (batch)
    let sentCount = 0;
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (BREVO_API_KEY) {
      // Send to each lead via Brevo transactional API
      const batchSize = 50;
      for (let i = 0; i < targetLeads.length; i += batchSize) {
        const batch = targetLeads.slice(i, i + batchSize);
        for (const lead of batch) {
          try {
            const res = await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sender: { name: "Deep Sleep Reset", email: "hello@deepsleep-reset.com" },
                to: [{ email: lead.email }],
                subject: copy.subject,
                htmlContent: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
${copy.htmlBody}
<hr style="margin:30px 0;border:none;border-top:1px solid #eee">
<p style="font-size:12px;color:#999">Deep Sleep Reset · <a href="https://deepsleep.manus.space/unsubscribe?email=${encodeURIComponent(lead.email)}">Unsubscribe</a></p>
</body></html>`,
                headers: { "X-Campaign-ID": campaignId, "X-Campaign-Type": type },
              }),
            });
            if (res.ok) sentCount++;
          } catch {
            // Continue on individual failure
          }
        }
        // Small delay between batches
        if (i + batchSize < targetLeads.length) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
    } else {
      // Simulate in dev mode
      sentCount = targetLeads.length;
      console.log(`[CampaignEngine] DEV MODE — would send ${sentCount} emails for ${type}`);
    }

    // Update campaign status
    await db.update(campaigns)
      .set({ status: "SENT", sentCount, sentAt: new Date() })
      .where(eq(campaigns.id, campaignId));

    console.log(`[CampaignEngine] ${type} campaign sent to ${sentCount} leads`);

    return {
      success: true,
      campaignId,
      sentCount,
      targetSegment: config.name,
      subject: copy.subject,
    };
  } catch (err) {
    console.error("[CampaignEngine] Launch error:", err);
    return { success: false, error: String(err) };
  }
}

// ── Get Campaign History ──────────────────────────────────────────────────────

export async function getCampaignHistory(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(limit);
}

// ── Campaign Stats ────────────────────────────────────────────────────────────

export async function getCampaignStats() {
  const db = await getDb();
  if (!db) return { totalCampaigns: 0, totalSent: 0, totalRevenue: 0 };

  const history = await getCampaignHistory(100);
  return {
    totalCampaigns: history.length,
    totalSent: history.reduce((sum, c) => sum + (c.sentCount || 0), 0),
    lastCampaign: history[0] || null,
  };
}
