/**
 * userProfileBuilder.ts
 * Auto-builds and enriches personalized user profiles on email capture.
 * Implements Honza Nedvěd (Inizio) "Give Before You Get" + lead scoring.
 */

import { getDb } from "./db";
import { emailLeads } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProfileInput {
  email: string;
  sessionId?: string;
  chronotype?: "Lion" | "Bear" | "Wolf" | "Dolphin";
  source?: string;
  // Attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
  // Device
  userAgent?: string;
  language?: string;     // Accept-Language header top value (e.g. "cs", "en-US")
  browserLang?: string; // navigator.language from browser (e.g. "cs-CZ")
  country?: string;     // ISO 2-letter country code from IP geolocation
  countryName?: string; // Full country name from IP geolocation
  city?: string;        // City from IP geolocation
  region?: string;      // Region/state from IP geolocation
  timezone?: string;    // Timezone from IP geolocation (e.g. "Europe/Prague")
  // Quiz data
  quizAnswers?: Record<string, string>;
  sleepIssues?: string[];
}

export interface UserProfile {
  id: number;
  email: string;
  chronotype: string | null;
  sleepScore: number | null;
  sleepIssues: string[];
  tags: string[];
  lifecycleStage: string | null;
  leadScore: number;
  persona: string | null;
  // Attribution
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrerDomain: string | null;
  landingPage: string | null;
  // Engagement
  emailSequenceStep: number;
  emailsOpened: number;
  emailsClicked: number;
  pageViewCount: number;
  convertedToCustomer: boolean;
  totalRevenue: string | null;
  createdAt: Date;
}

// ── Sleep Score Calculator ────────────────────────────────────────────────────

/**
 * Computes a 0-100 sleep score from quiz answers.
 * Higher score = worse sleep = more urgent buyer.
 */
export function computeSleepScore(
  quizAnswers: Record<string, string> = {},
  chronotype?: string
): number {
  let score = 50; // baseline

  // Q: How long does it take to fall asleep?
  const fallAsleep = quizAnswers["fall_asleep"] ?? quizAnswers["q1"] ?? "";
  if (fallAsleep.includes("60") || fallAsleep.includes("hour")) score += 20;
  else if (fallAsleep.includes("30")) score += 10;
  else if (fallAsleep.includes("5") || fallAsleep.includes("quickly")) score -= 10;

  // Q: How many hours do you sleep?
  const hours = quizAnswers["sleep_hours"] ?? quizAnswers["q2"] ?? "";
  if (hours.includes("4") || hours.includes("3") || hours.includes("less")) score += 15;
  else if (hours.includes("5") || hours.includes("6")) score += 8;
  else if (hours.includes("8") || hours.includes("9")) score -= 5;

  // Q: Wake up during the night?
  const wakeUp = quizAnswers["wake_up"] ?? quizAnswers["q3"] ?? "";
  if (wakeUp.includes("multiple") || wakeUp.includes("often")) score += 15;
  else if (wakeUp.includes("sometimes")) score += 5;

  // Q: Feel rested in the morning?
  const rested = quizAnswers["rested"] ?? quizAnswers["q4"] ?? "";
  if (rested.includes("never") || rested.includes("rarely")) score += 10;
  else if (rested.includes("sometimes")) score += 5;
  else if (rested.includes("always") || rested.includes("usually")) score -= 10;

  // Chronotype adjustment — Wolves and Dolphins tend to have worse sleep
  if (chronotype === "Wolf" || chronotype === "Dolphin") score += 5;

  return Math.max(0, Math.min(100, score));
}

// ── Tag Builder ───────────────────────────────────────────────────────────────

/**
 * Builds a comprehensive tag array from all available profile data.
 * Tags are used for segmentation, Brevo lists, and Reddit Custom Audiences.
 */
export function buildTags(input: ProfileInput): string[] {
  const tags: string[] = [];

  // Chronotype tag
  if (input.chronotype) tags.push(input.chronotype.toLowerCase());

  // UTM source tags
  const src = (input.utmSource ?? "").toLowerCase();
  if (src.includes("reddit")) tags.push("reddit");
  else if (src.includes("tiktok") || src.includes("tik_tok")) tags.push("tiktok");
  else if (src.includes("facebook") || src.includes("fb") || src.includes("meta")) tags.push("meta");
  else if (src.includes("google") || src.includes("adwords")) tags.push("google");
  else if (src.includes("email") || src.includes("newsletter")) tags.push("email");
  else if (src.includes("organic") || src === "") tags.push("organic");

  // UTM medium
  const medium = (input.utmMedium ?? "").toLowerCase();
  if (medium.includes("cpc") || medium.includes("paid")) tags.push("paid");
  else if (medium.includes("social")) tags.push("social");
  else if (medium.includes("email")) tags.push("email-medium");
  else if (medium.includes("organic")) tags.push("organic");

  // Campaign tag (sanitized)
  if (input.utmCampaign) {
    const camp = input.utmCampaign.toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 32);
    tags.push(`campaign:${camp}`);
  }

  // Referrer domain tag
  if (input.referrer) {
    try {
      const domain = new URL(input.referrer).hostname.replace("www.", "");
      tags.push(`ref:${domain}`);
    } catch {
      // invalid URL, skip
    }
  }

  // Landing page tag
  if (input.landingPage) {
    if (input.landingPage.includes("/tiktok")) tags.push("lp:tiktok");
    else if (input.landingPage.includes("/reddit")) tags.push("lp:reddit");
    else if (input.landingPage.includes("/insomnia")) tags.push("lp:insomnia");
    else if (input.landingPage.includes("/quiz")) tags.push("lp:quiz");
    else tags.push("lp:home");
  }

  // Sleep issues tags
  if (input.sleepIssues) {
    for (const issue of input.sleepIssues) {
      tags.push(`issue:${issue.toLowerCase().replace(/\s+/g, "-")}`);
    }
  }

  // Source tag
  if (input.source) tags.push(`src:${input.source}`);

  // Language tag
  if (input.language && input.language !== "en") tags.push(`lang:${input.language}`);
  if (input.browserLang) {
    const bl = input.browserLang.toLowerCase().split("-")[0];
    if (bl !== "en") tags.push(`blang:${bl}`);
  }

  // Country tag
  if (input.country) tags.push(`country:${input.country.toLowerCase()}`);
  if (input.city) tags.push(`city:${input.city.toLowerCase().replace(/\s+/g, "-")}`);

  // Dedup
  return Array.from(new Set(tags));
}

// ── Persona Selector ──────────────────────────────────────────────────────────

/**
 * Assigns a persona based on chronotype and source.
 * Luna = empathetic, Petra = scientific, Lucie = direct.
 */
export function selectPersona(
  chronotype?: string,
  utmSource?: string
): "Luna" | "Petra" | "Lucie" {
  // Reddit users → Petra (scientific, data-driven)
  if (utmSource?.toLowerCase().includes("reddit")) return "Petra";
  // TikTok users → Luna (empathetic, emotional)
  if (utmSource?.toLowerCase().includes("tiktok")) return "Luna";
  // Chronotype-based
  if (chronotype === "Dolphin") return "Luna";    // anxious → empathetic
  if (chronotype === "Wolf") return "Lucie";       // night owl → direct
  if (chronotype === "Lion") return "Petra";       // analytical → scientific
  return "Luna"; // default
}

// ── Referrer Domain Extractor ─────────────────────────────────────────────────

export function extractReferrerDomain(referrer?: string): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

// ── Device Parser ─────────────────────────────────────────────────────────────

export function parseDevice(userAgent?: string): { deviceType: string; browser: string } {
  if (!userAgent) return { deviceType: "unknown", browser: "unknown" };
  const ua = userAgent.toLowerCase();
  const deviceType = /mobile|android|iphone|ipad/.test(ua)
    ? /ipad/.test(ua) ? "tablet" : "mobile"
    : "desktop";
  const browser = /chrome/.test(ua) && !/edg/.test(ua) ? "Chrome"
    : /firefox/.test(ua) ? "Firefox"
    : /safari/.test(ua) && !/chrome/.test(ua) ? "Safari"
    : /edg/.test(ua) ? "Edge"
    : "Other";
  return { deviceType, browser };
}

// ── Lead Score Calculator ─────────────────────────────────────────────────────

/**
 * Computes a 0-100 lead score based on engagement signals.
 * Higher = hotter lead = more likely to buy.
 */
export function computeLeadScore(params: {
  sleepScore?: number;
  chronotype?: string;
  utmSource?: string;
  utmMedium?: string;
  source?: string;
  pageViewCount?: number;
  emailsOpened?: number;
  emailsClicked?: number;
  purchaseAttempts?: number;
}): number {
  let score = 20; // baseline

  // Sleep severity drives urgency
  if (params.sleepScore) {
    if (params.sleepScore >= 80) score += 30;
    else if (params.sleepScore >= 60) score += 20;
    else if (params.sleepScore >= 40) score += 10;
  }

  // Paid traffic = higher intent
  const medium = (params.utmMedium ?? "").toLowerCase();
  if (medium.includes("cpc") || medium.includes("paid")) score += 10;

  // High-intent sources
  const src = (params.utmSource ?? "").toLowerCase();
  if (src.includes("reddit")) score += 8;
  if (src.includes("google")) score += 12;

  // Engagement signals
  if ((params.pageViewCount ?? 0) >= 3) score += 5;
  if ((params.emailsOpened ?? 0) >= 2) score += 8;
  if ((params.emailsClicked ?? 0) >= 1) score += 10;
  if ((params.purchaseAttempts ?? 0) >= 1) score += 15;

  // Dolphins are highest urgency (anxiety-driven insomnia)
  if (params.chronotype === "Dolphin") score += 10;

  return Math.max(0, Math.min(100, score));
}

// ── Main Profile Builder ──────────────────────────────────────────────────────

/**
 * Creates or updates a user profile in email_leads.
 * Called on every email capture event.
 */
export async function buildUserProfile(input: ProfileInput): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const sleepScore = computeSleepScore(input.quizAnswers ?? {}, input.chronotype);
  const tags = buildTags(input);
  const persona = selectPersona(input.chronotype, input.utmSource);
  const { deviceType, browser } = parseDevice(input.userAgent);
  const referrerDomain = extractReferrerDomain(input.referrer);
  const leadScore = computeLeadScore({ sleepScore, chronotype: input.chronotype, utmSource: input.utmSource, utmMedium: input.utmMedium, source: input.source });

  // Check if lead already exists
  const existing = await db.select({ id: emailLeads.id })
    .from(emailLeads)
    .where(eq(emailLeads.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    // Update existing profile with new data (don't overwrite non-null fields)
    await db.update(emailLeads)
      .set({
        ...(input.chronotype && { chronotype: input.chronotype }),
        ...(input.utmSource && { utmSource: input.utmSource }),
        ...(input.utmMedium && { utmMedium: input.utmMedium }),
        ...(input.utmCampaign && { utmCampaign: input.utmCampaign }),
        ...(input.utmContent && { utmContent: input.utmContent }),
        ...(input.utmTerm && { utmTerm: input.utmTerm }),
        ...(input.referrer && { referrer: input.referrer }),
        ...(referrerDomain && { referrerDomain }),
        ...(input.landingPage && { landingPage: input.landingPage }),
        ...(input.language && { language: input.language }),
        ...(input.browserLang && { browserLang: input.browserLang }),
        ...(input.country && { country: input.country }),
        ...(input.countryName && { countryName: input.countryName }),
        ...(input.city && { city: input.city }),
        ...(input.region && { region: input.region }),
        ...(input.timezone && { timezone: input.timezone }),
        ...(deviceType !== "unknown" && { deviceType }),
        ...(browser !== "unknown" && { browser }),
        ...(sleepScore && { sleepScore }),
        ...(input.sleepIssues && { sleepIssues: JSON.stringify(input.sleepIssues) }),
        ...(input.quizAnswers && { quizAnswers: JSON.stringify(input.quizAnswers) }),
        persona,
        tags: JSON.stringify(tags),
        leadScore,
        lastActivityAt: new Date(),
      })
      .where(eq(emailLeads.email, input.email));
  }
  // If new lead, the captureEmailLead function handles insertion — we just enrich after
}

/**
 * Enriches an existing lead by ID with profile data.
 * Called after captureEmailLead() returns the new lead ID.
 */
export async function enrichLeadProfile(leadId: number, input: ProfileInput): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const sleepScore = computeSleepScore(input.quizAnswers ?? {}, input.chronotype);
  const tags = buildTags(input);
  const persona = selectPersona(input.chronotype, input.utmSource);
  const { deviceType, browser } = parseDevice(input.userAgent);
  const referrerDomain = extractReferrerDomain(input.referrer);
  const leadScore = computeLeadScore({ sleepScore, chronotype: input.chronotype, utmSource: input.utmSource, utmMedium: input.utmMedium, source: input.source });

  await db.update(emailLeads)
    .set({
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmContent: input.utmContent ?? null,
      utmTerm: input.utmTerm ?? null,
      referrer: input.referrer ?? null,
      referrerDomain: referrerDomain ?? null,
      landingPage: input.landingPage ?? null,
      language: input.language ?? null,
      browserLang: input.browserLang ?? null,
      country: input.country ?? null,
      countryName: input.countryName ?? null,
      city: input.city ?? null,
      region: input.region ?? null,
      timezone: input.timezone ?? null,
      deviceType: deviceType !== "unknown" ? deviceType : null,
      browser: browser !== "unknown" ? browser : null,
      sleepScore,
      sleepIssues: input.sleepIssues ? JSON.stringify(input.sleepIssues) : null,
      quizAnswers: input.quizAnswers ? JSON.stringify(input.quizAnswers) : null,
      persona,
      tags: JSON.stringify(tags),
      leadScore,
      lastActivityAt: new Date(),
    })
    .where(eq(emailLeads.id, leadId));
}

/**
 * Gets a full user profile by email.
 */
export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(emailLeads).where(eq(emailLeads.email, email)).limit(1);
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    email: r.email,
    chronotype: r.chronotype ?? null,
    sleepScore: r.sleepScore ?? null,
    sleepIssues: r.sleepIssues ? JSON.parse(r.sleepIssues) : [],
    tags: r.tags ? JSON.parse(r.tags) : [],
    lifecycleStage: r.lifecycleStage ?? null,
    leadScore: r.leadScore ?? 0,
    persona: r.persona ?? null,
    utmSource: r.utmSource ?? null,
    utmMedium: r.utmMedium ?? null,
    utmCampaign: r.utmCampaign ?? null,
    utmContent: r.utmContent ?? null,
    utmTerm: r.utmTerm ?? null,
    referrerDomain: r.referrerDomain ?? null,
    landingPage: r.landingPage ?? null,
    emailSequenceStep: r.emailSequenceStep ?? 0,
    emailsOpened: r.emailsOpened ?? 0,
    emailsClicked: r.emailsClicked ?? 0,
    pageViewCount: r.pageViewCount ?? 0,
    convertedToCustomer: r.convertedToCustomer ?? false,
    totalRevenue: r.totalRevenue ?? null,
    createdAt: r.createdAt,
  };
}
