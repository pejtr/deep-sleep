/**
 * Contact Intelligence — Professional Marketing Agency CRM
 * Lead scoring, segmentation, CSV export, Reddit custom audience, Brevo sync
 */
import { getDb } from "./db";
import { emailLeads } from "../drizzle/schema";
import type { EmailLead } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ── Types ─────────────────────────────────────────────────────────────────────
export type LeadSegment =
  | "all"
  | "high_intent"
  | "buyers"
  | "cold_leads"
  | "lion"
  | "bear"
  | "wolf"
  | "dolphin"
  | "reddit"
  | "tiktok"
  | "organic"
  | "new_7d"
  | "not_uploaded_reddit";

export type LifecycleStage = "lead" | "prospect" | "customer" | "churned";

export type LeadWithScore = EmailLead & { computedScore: number };

// ── Lead Scoring Engine ───────────────────────────────────────────────────────
export function computeLeadScore(lead: EmailLead): number {
  let score = 20; // base

  if (lead.source === "quiz_result") score += 25;
  if (lead.source === "squeeze") score += 15;
  if (lead.source === "order") score += 30;

  if (lead.utmSource === "reddit") score += 10;
  if (lead.utmSource === "tiktok") score += 8;
  if (lead.utmMedium === "cpc") score += 5;

  if ((lead.emailsOpened ?? 0) > 0) score += 5;
  if ((lead.emailsOpened ?? 0) > 2) score += 5;
  if ((lead.emailsClicked ?? 0) > 0) score += 10;

  const daysSince = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 1) score += 10;
  else if (daysSince <= 7) score += 5;
  else if (daysSince > 30) score -= 10;

  if (lead.chronotype === "Dolphin") score += 5;
  if (lead.convertedToCustomer) score = 100;

  return Math.min(100, Math.max(0, score));
}

// ── Get all leads with computed scores ───────────────────────────────────────
export async function getAllLeadsWithScores(): Promise<LeadWithScore[]> {
  const db = await getDb();
  if (!db) return [];
  const leads = await db.select().from(emailLeads).orderBy(desc(emailLeads.createdAt));
  return leads.map((lead: EmailLead) => ({
    ...lead,
    computedScore: computeLeadScore(lead),
  }));
}

// ── Segment leads ─────────────────────────────────────────────────────────────
export async function getLeadsBySegment(segment: LeadSegment): Promise<LeadWithScore[]> {
  const leads = await getAllLeadsWithScores();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  switch (segment) {
    case "all": return leads;
    case "high_intent": return leads.filter((l: LeadWithScore) => l.computedScore >= 70);
    case "buyers": return leads.filter((l: LeadWithScore) => l.convertedToCustomer);
    case "cold_leads": return leads.filter((l: LeadWithScore) => l.computedScore < 30 && !l.convertedToCustomer);
    case "lion": return leads.filter((l: LeadWithScore) => l.chronotype === "Lion");
    case "bear": return leads.filter((l: LeadWithScore) => l.chronotype === "Bear");
    case "wolf": return leads.filter((l: LeadWithScore) => l.chronotype === "Wolf");
    case "dolphin": return leads.filter((l: LeadWithScore) => l.chronotype === "Dolphin");
    case "reddit": return leads.filter((l: LeadWithScore) => l.utmSource === "reddit" || (l.source ?? "").includes("reddit"));
    case "tiktok": return leads.filter((l: LeadWithScore) => l.utmSource === "tiktok" || (l.source ?? "").includes("tiktok"));
    case "organic": return leads.filter((l: LeadWithScore) => !l.utmSource || l.utmMedium === "organic");
    case "new_7d": return leads.filter((l: LeadWithScore) => new Date(l.createdAt) >= sevenDaysAgo);
    case "not_uploaded_reddit": return leads.filter((l: LeadWithScore) => !l.redditAudienceUploaded);
    default: return leads;
  }
}

// ── Segment stats ─────────────────────────────────────────────────────────────
export async function getContactStats() {
  const leads = await getAllLeadsWithScores();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const total = leads.length;
  const buyers = leads.filter((l: LeadWithScore) => l.convertedToCustomer).length;
  const highIntent = leads.filter((l: LeadWithScore) => l.computedScore >= 70 && !l.convertedToCustomer).length;
  const new7d = leads.filter((l: LeadWithScore) => new Date(l.createdAt) >= sevenDaysAgo).length;
  const new30d = leads.filter((l: LeadWithScore) => new Date(l.createdAt) >= thirtyDaysAgo).length;
  const avgScore = total > 0 ? Math.round(leads.reduce((s: number, l: LeadWithScore) => s + l.computedScore, 0) / total) : 0;

  const byChronotype = {
    Lion: leads.filter((l: LeadWithScore) => l.chronotype === "Lion").length,
    Bear: leads.filter((l: LeadWithScore) => l.chronotype === "Bear").length,
    Wolf: leads.filter((l: LeadWithScore) => l.chronotype === "Wolf").length,
    Dolphin: leads.filter((l: LeadWithScore) => l.chronotype === "Dolphin").length,
    Unknown: leads.filter((l: LeadWithScore) => !l.chronotype).length,
  };

  const bySource = leads.reduce((acc: Record<string, number>, l: LeadWithScore) => {
    const src = l.utmSource || l.source || "organic";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  const byLifecycle = {
    lead: leads.filter((l: LeadWithScore) => l.lifecycleStage === "lead" || !l.lifecycleStage).length,
    prospect: leads.filter((l: LeadWithScore) => l.lifecycleStage === "prospect").length,
    customer: leads.filter((l: LeadWithScore) => l.lifecycleStage === "customer").length,
    churned: leads.filter((l: LeadWithScore) => l.lifecycleStage === "churned").length,
  };

  const notUploadedToReddit = leads.filter((l: LeadWithScore) => !l.redditAudienceUploaded).length;
  const conversionRate = total > 0 ? ((buyers / total) * 100).toFixed(1) : "0";

  // Geo stats
  const byCountry = leads.reduce((acc: Record<string, { count: number; name: string }>, l: LeadWithScore) => {
    const code = ((l as any).country ?? "").toUpperCase() || "XX";
    const name = (l as any).countryName ?? code;
    if (!acc[code]) acc[code] = { count: 0, name };
    acc[code].count++;
    return acc;
  }, {});
  const topCountries = Object.entries(byCountry)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([code, { count, name }]) => ({ code, name, count }));

  const byLanguage = leads.reduce((acc: Record<string, number>, l: LeadWithScore) => {
    const lang = ((l as any).browserLang ?? l.language ?? "unknown").split("-")[0].toLowerCase();
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const cityMap = leads
    .filter((l: LeadWithScore) => (l as any).city)
    .reduce((acc: Record<string, number>, l: LeadWithScore) => {
      const city = (l as any).city as string;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }));

  return {
    total,
    buyers,
    highIntent,
    new7d,
    new30d,
    avgScore,
    conversionRate,
    byChronotype,
    bySource,
    byLifecycle,
    notUploadedToReddit,
    topCountries,
    byLanguage,
    topCities,
  };
}

// ── Export to CSV ─────────────────────────────────────────────────────────────
export function leadsToCSV(leads: LeadWithScore[]): string {
  const headers = [
    "id", "email", "firstName", "chronotype", "source",
    "utmSource", "utmMedium", "utmCampaign",
    "lifecycleStage", "leadScore", "computedScore",
    "convertedToCustomer", "totalRevenue",
    "emailsOpened", "emailsClicked",
    "country", "countryName", "city", "region", "timezone", "browserLang", "language", "tags",
    "subscribed", "createdAt",
  ];

  const escape = (v: unknown): string => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = leads.map((l: LeadWithScore) => [
    l.id, l.email, l.firstName ?? "", l.chronotype ?? "", l.source ?? "",
    l.utmSource ?? "", l.utmMedium ?? "", l.utmCampaign ?? "",
    l.lifecycleStage ?? "lead", l.leadScore ?? 0, l.computedScore,
    l.convertedToCustomer ? "yes" : "no", l.totalRevenue ?? "0",
    l.emailsOpened ?? 0, l.emailsClicked ?? 0,
    l.country ?? "", (l as any).countryName ?? "", (l as any).city ?? "",
    (l as any).region ?? "", (l as any).timezone ?? "", (l as any).browserLang ?? "",
    l.language ?? "", l.tags ?? "",
    l.subscribed ? "yes" : "no", new Date(l.createdAt).toISOString(),
  ]);

  return [headers.join(","), ...rows.map((r: unknown[]) => r.map(escape).join(","))].join("\n");
}

// ── Upload to Reddit Ads as Custom Audience ───────────────────────────────────
export async function uploadLeadsToRedditAudience(emails: string[]): Promise<{ audienceId: string; audienceName: string; count: number }> {
  const { createHash } = await import("crypto");
  const accessToken = process.env.REDDIT_ADS_ACCESS_TOKEN;
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    throw new Error("Missing REDDIT_ADS_ACCESS_TOKEN or REDDIT_ADS_ACCOUNT_ID");
  }

  const hashedEmails = emails.map(email =>
    createHash("sha256").update(email.toLowerCase().trim()).digest("hex")
  );

  const payload = {
    name: `Deep Sleep Leads - ${new Date().toISOString().split("T")[0]} (${emails.length})`,
    description: "Email leads from Deep Sleep Reset quiz funnel — custom retargeting audience",
    list: hashedEmails,
    list_type: "EMAIL_SHA256",
  };

  const response = await fetch(
    `https://ads-api.reddit.com/api/v2.0/accounts/${accountId}/audiences`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Reddit API ${response.status}: ${errText}`);
  }

  const result = await response.json() as { id: string; name: string };

  // Mark emails as uploaded
  const db = await getDb();
  if (db) {
    for (const email of emails) {
      await db.update(emailLeads).set({ redditAudienceUploaded: true }).where(eq(emailLeads.email, email));
    }
  }

  return { audienceId: result.id, audienceName: result.name, count: emails.length };
}

// ── Update lead lifecycle stage ───────────────────────────────────────────────
export async function updateLeadLifecycle(email: string, stage: LifecycleStage): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(emailLeads).set({ lifecycleStage: stage, lastActivityAt: new Date() }).where(eq(emailLeads.email, email));
}

// ── Sync lead scores to DB ────────────────────────────────────────────────────
export async function syncLeadScores(): Promise<{ updated: number }> {
  const db = await getDb();
  if (!db) return { updated: 0 };
  const leads = await db.select().from(emailLeads);
  let updated = 0;
  for (const lead of leads as EmailLead[]) {
    const score = computeLeadScore(lead);
    await db.update(emailLeads).set({ leadScore: score }).where(eq(emailLeads.id, lead.id));
    updated++;
  }
  return { updated };
}

// ── Mark lead as customer when order completes ────────────────────────────────
export async function markLeadAsCustomer(email: string, revenue: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(emailLeads).set({
    convertedToCustomer: true,
    lifecycleStage: "customer",
    totalRevenue: String(revenue),
    leadScore: 100,
    lastActivityAt: new Date(),
  }).where(eq(emailLeads.email, email));
}
