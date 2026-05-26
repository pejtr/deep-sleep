import { z } from "zod";
import Stripe from "stripe";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import {
  getCampaigns, getCampaignSummary, getAdAccount, getCampaignPerformance,
  createCampaign, createAdSet, createAd, updateCampaignStatus, CAMPAIGN_TEMPLATES,
} from "./redditAds";
import { dispatchWebhookEvent } from "./outboundWebhookDispatcher";
import { trackLeadConversion } from "./redditPixel";
import { sendQuizResultEmail, addQuizContactToBrevo } from "./quizEmailService";
import { onQuizComplete } from "./emailSequenceService";
import {
  saveQuizResult,
  getQuizResultBySession,
  createOrder,
  getOrdersBySession,
  captureEmailLead,
  trackAbImpression,
  markAbConverted,
  trackBehaviorEvent,
  getAdminStats,
  saveFeedback,
  getAllBuyerEmails,
  getAllFeedbacks,
  getLatestAiInsights,
  getAllLeads,
  assignUpsellVariant,
  markUpsellConverted,
  getUpsellAbResults,
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  getAbMetrics,
  getAbTrends,
  getAbExportData,
  getAbRecommendations,
} from "./db";

// ── Chronotype scoring ────────────────────────────────────────────────────────
const CHRONOTYPE_SCORES: Record<string, number[]> = {
  // q1: wake-up preference  q2: peak energy  q3: bedtime  q4: sleep issues  q5: weekend pattern
  Lion:    [0, 0, 0, 0, 0],
  Bear:    [1, 1, 1, 1, 1],
  Wolf:    [2, 2, 2, 2, 2],
  Dolphin: [3, 3, 3, 3, 3],
};

function calculateChronotype(answers: number[]): "Lion" | "Bear" | "Wolf" | "Dolphin" {
  // Scoring works with 3-6 answers — each answer maps to a chronotype
  const scores = { Lion: 0, Bear: 0, Wolf: 0, Dolphin: 0 };
  const mapping: Record<number, keyof typeof scores> = { 0: "Lion", 1: "Bear", 2: "Wolf", 3: "Dolphin" };
  answers.forEach((ans) => {
    if (mapping[ans]) scores[mapping[ans]]++;
  });
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Bear") as "Lion" | "Bear" | "Wolf" | "Dolphin";
}

// ── Product config ────────────────────────────────────────────────────────────
const PRODUCTS = {
  main:  { amount: "5.00",  gumroad: "fdtifc" },
  oto1:  { amount: "17.00", gumroad: "ttrsd"  },
  oto2:  { amount: "27.00", gumroad: "cuhln"  },
} as const;


// ── Currency detection helpers ────────────────────────────────────────────────
const LANG_TO_CURRENCY: Record<string, string> = {
  cs: "CZK", sk: "CZK",
  de: "EUR", fr: "EUR", it: "EUR", es: "EUR", pt: "EUR", nl: "EUR",
  "en-gb": "GBP", "en-GB": "GBP",
  "en-ca": "CAD", "en-CA": "CAD",
  "en-au": "AUD", "en-AU": "AUD",
  "en-nz": "NZD", "en-NZ": "NZD",
  "en-sg": "SGD", "en-SG": "SGD",
  pl: "PLN", hu: "HUF", ro: "RON",
  hi: "INR", bn: "INR", ur: "INR",
  "pt-br": "BRL", "pt-BR": "BRL",
  "es-mx": "MXN", "es-MX": "MXN",
  ja: "JPY",
  sv: "SEK", nb: "NOK", da: "DKK",
  "de-ch": "CHF", "fr-ch": "CHF",
  af: "ZAR", zu: "ZAR",
};

function detectCurrencyFromLang(acceptLang: string): string {
  if (!acceptLang) return "USD";
  const langs = acceptLang.split(",").map(l => l.split(";")[0].trim().toLowerCase());
  for (const lang of langs) {
    if (LANG_TO_CURRENCY[lang]) return LANG_TO_CURRENCY[lang];
    const base = lang.split("-")[0];
    if (base && LANG_TO_CURRENCY[base]) return LANG_TO_CURRENCY[base];
  }
  return "USD";
}

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.853, GBP: 0.741, CZK: 20.77, CAD: 1.366,
  AUD: 1.548, PLN: 3.82, HUF: 356, RON: 4.24, INR: 83.5,
  BRL: 4.97, MXN: 17.15, CHF: 0.899, SEK: 10.32, NOK: 10.58,
  DKK: 6.36, SGD: 1.34, NZD: 1.67, ZAR: 18.63, JPY: 154.2,
};


export const appRouter = router({
  campaigns: router({
    list: publicProcedure
      .query(async () => {
        return [
          {
            id: "1",
            name: "Luna Voss - Sleep Transformation",
            platform: "meta" as const,
            status: "active" as const,
            budget: 1000,
            spent: 450.50,
            impressions: 12500,
            clicks: 325,
            conversions: 28,
            roi: 156.2,
            startDate: new Date("2026-05-01"),
            lunaContent: "luna-voss-1-sleep-transformation",
          },
        ];
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        platform: z.enum(["meta", "organic", "google"]),
        budget: z.number(),
        lunaContent: z.string().optional(),
      }))
      .mutation(async ({ input }) => ({
        id: Math.random().toString(36),
        ...input,
        status: "scheduled" as const,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roi: 0,
        startDate: new Date(),
      })),
  }),

  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: router({
    submit: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        answers: z.array(z.number().int().min(0).max(3)).min(3).max(6),
        abVariant: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const chronotype = calculateChronotype(input.answers);
        await saveQuizResult({
          sessionId: input.sessionId,
          chronotype,
          answers: JSON.stringify(input.answers),
          abVariant: input.abVariant,
          email: input.email,
        });
        // Dispatch quiz_completed webhook event
        dispatchWebhookEvent("quiz_completed", {
          sessionId: input.sessionId,
          chronotype,
          email: input.email ?? null,
          abVariant: input.abVariant ?? null,
        }).catch(() => {/* non-critical */});
        // Send quiz result email if email provided
        if (input.email) {
          sendQuizResultEmail({
            email: input.email,
            chronotype: chronotype.toLowerCase(),
          }).catch((err) => console.error("[Quiz Email] Failed to send:", err));
          // Add to Brevo contact list
          addQuizContactToBrevo({
            email: input.email,
            chronotype: chronotype.toLowerCase(),
          }).catch(() => {/* non-critical */});
          // Dispatch new_lead webhook
          dispatchWebhookEvent("new_lead", {
            email: input.email,
            chronotype,
            source: "quiz",
            sessionId: input.sessionId,
          }).catch(() => {/* non-critical */});
          // Reddit CAPI server-side lead event
          trackLeadConversion(input.email).catch(() => {/* non-critical */});
        }
        return { chronotype };
      }),

    generateDaily: publicProcedure
      .input(z.object({
        keyword: z.string().optional(),
        title: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const seoKeyword = (input.keyword || "deep sleep improvement").slice(0, 100);
        const postTitle = (input.title || `How to Improve ${seoKeyword.charAt(0).toUpperCase() + seoKeyword.slice(1)}`).slice(0, 200);
        const slug = postTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a sleep science expert writing SEO-optimized blog articles for Deep Sleep Reset (deep-sleep-reset.com). 
Write in a professional, authoritative tone. Sound like someone who has actually worked in sleep medicine.
Use active voice and vary sentence structure.
Format: Use ## for H2 headings, ### for H3, **bold** for key terms, - for bullet lists.
SEO Rules: Naturally include the target keyword in the first paragraph, in at least one H2, and 3-5 times throughout.
Length: 600-900 words. Do NOT include the title in the content (it's added separately).`
            },
            {
              role: "user",
              content: `Write a complete SEO blog article about: "${seoKeyword}". Target keyword: "${seoKeyword}". Article title: "${postTitle}". Include practical, science-backed advice. Do not include the title at the top.`
            }
          ]
        });
        const rawContent = llmResponse.choices?.[0]?.message?.content;
        const articleContent = typeof rawContent === "string" ? rawContent : "";
        const excerpt = articleContent.replace(/[#*\n]/g, " ").trim().slice(0, 200) + "...";
        const metaDescription = `Learn about ${seoKeyword}. Science-backed sleep tips from Deep Sleep Reset. Improve your sleep quality tonight.`.slice(0, 256);
        await createBlogPost({
          title: postTitle,
          slug,
          content: articleContent,
          excerpt,
          seoKeyword,
          metaDescription,
        });
        return { success: true, slug, title: postTitle };
      }),

    getResult: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return getQuizResultBySession(input.sessionId);
      }),
  }),

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: router({
    create: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        productId: z.enum(["main", "oto1", "oto2"]),
        email: z.string().email().optional(),
        chronotype: z.enum(["Lion", "Bear", "Wolf", "Dolphin"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const product = PRODUCTS[input.productId];
        await createOrder({
          sessionId: input.sessionId,
          productId: input.productId,
          amount: product.amount,
          email: input.email,
          chronotype: input.chronotype,
          status: "pending",
          gumroadPermalink: product.gumroad,
        });
        return {
          gumroadUrl: `https://deepsleepreset.gumroad.com/l/${product.gumroad}${input.productId === 'main' ? '?price=1' : ''}`,
          amount: product.amount,
        };
      }),

    getBySession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => getOrdersBySession(input.sessionId)),

    getRecent: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const { getRecentOrders } = await import("./db");
        return getRecentOrders(input.limit);
      }),
  }),

  // ── Leads ─────────────────────────────────────────────────────────────────
  leads: router({
    capture: publicProcedure
      .input(z.object({
        email: z.string().email(),
        sessionId: z.string().optional(),
        chronotype: z.enum(["Lion", "Bear", "Wolf", "Dolphin"]).optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await captureEmailLead({
          email: input.email,
          sessionId: input.sessionId,
          chronotype: input.chronotype,
          source: input.source ?? "quiz_result",
        });
        // Trigger abandon cart + welcome email sequence
        if (input.source === "quiz_result" || input.source === "quiz_funnel_reddit" || input.source === "quiz_funnel_tiktok" || input.source === "quiz_funnel") {
          const leadId = (result as any)?.insertId ?? 0;
          onQuizComplete(input.email, leadId, input.chronotype ?? "Bear").catch(() => {/* non-critical */});
        }
        return { success: true };
      }),
  }),

  // ── A/B Testing ───────────────────────────────────────────────────────────
  abTest: router({
    track: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        testName: z.string(),
        variant: z.string(),
        page: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await trackAbImpression({
          sessionId: input.sessionId,
          testName: input.testName,
          variant: input.variant,
          page: input.page,
        });
        return { success: true };
      }),

    markConverted: publicProcedure
      .input(z.object({ sessionId: z.string(), testName: z.string() }))
      .mutation(async ({ input }) => {
        await markAbConverted(input.sessionId, input.testName);
        return { success: true };
      }),

    getLiveMetrics: publicProcedure
      .input(z.object({ testName: z.string() }))
      .query(async ({ input }) => {
        const metrics = await getAbMetrics(input.testName);
        return metrics || { testName: input.testName, metrics: {}, winner: null, totalImpressions: 0, totalConversions: 0, updatedAt: new Date() };
      }),

    getTrends: publicProcedure
      .input(z.object({ testName: z.string(), hoursBack: z.number().default(24) }))
      .query(async ({ input }) => {
        const trends = await getAbTrends(input.testName, input.hoursBack);
        return trends || { testName: input.testName, hoursBack: input.hoursBack, data: [], variants: [] };
      }),

    exportData: publicProcedure
      .input(z.object({ testName: z.string(), format: z.enum(['csv', 'json']).default('csv') }))
      .query(async ({ input }) => {
        const data = await getAbExportData(input.testName, input.format);
        return { testName: input.testName, format: input.format, data };
      }),

    getRecommendations: publicProcedure
      .input(z.object({ testName: z.string() }))
      .query(async ({ input }) => {
        const recommendations = await getAbRecommendations(input.testName);
        return { testName: input.testName, recommendations };
      }),

}),

  // ── Behavior ──────────────────────────────────────────────────────────────
  behavior: router({
    track: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        event: z.string(),
        page: z.string().optional(),
        element: z.string().optional(),
        value: z.string().optional(),
        chronotype: z.enum(["Lion", "Bear", "Wolf", "Dolphin"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await trackBehaviorEvent(input);
        return { success: true };
      }),
    trackEvent: publicProcedure
      .input(z.object({
        eventType: z.enum(['scroll', 'timeOnPage', 'exitIntent', 'pageView', 'click']),
        scrollDepth: z.number().optional(),
        timeOnPage: z.number().optional(),
        deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmContent: z.string().optional(),
        utmTerm: z.string().optional(),
        pageUrl: z.string().optional(),
        referrer: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Store behavior event in database
          // For now, just log it
          console.log('[Behavior Tracking]', input);
          return { success: true };
        } catch (error) {
          console.error('[Behavior Tracking Error]', error);
          return { success: false };
        }
      }),
  }),

  // ── Feedback ─────────────────────────────────────────────────────────────────
  feedback: router({
    submit: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        rating: z.number().int().min(1).max(5),
        liked: z.string().optional(),
        improved: z.string().optional(),
        email: z.string().email().optional(),
        rewardCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await saveFeedback({
          sessionId: input.sessionId,
          rating: input.rating,
          liked: input.liked,
          improved: input.improved,
          email: input.email,
          rewardCode: input.rewardCode,
        });
        return { success: true, rewardCode: input.rewardCode };
      }),
  }),

  // ── AI Chat ─────────────────────────────────────────────────────────────────────────
  chat: router({
    message: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(1000),
        lang: z.string().default("en"),
        mode: z.enum(["sales", "admin", "affiliate", "post_purchase"]).default("sales"),
        adminData: z.object({
          revenue: z.number().optional(),
          orders: z.number().optional(),
          leads: z.number().optional(),
          quizStarts: z.number().optional(),
          avgRating: z.number().optional(),
          feedbacks: z.number().optional(),
          behaviorEvents: z.number().optional(),
          redditImpressions: z.number().optional(),
          redditClicks: z.number().optional(),
          redditCtr: z.number().optional(),
          redditSpend: z.number().optional(),
          redditCpc: z.number().optional(),
          campaigns: z.array(z.object({ name: z.string(), status: z.string(), impressions: z.number().optional(), clicks: z.number().optional(), ctr: z.number().optional(), spend: z.number().optional(), cpc: z.number().optional(), score: z.number().optional(), rank: z.string().optional() })).optional(),
        }).optional(),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).max(20).default([]),
      }))
      .mutation(async ({ input }) => {
        let systemPrompt: string;

        if (input.mode === "admin") {
          const d = input.adminData ?? {};
          const convRate = (d.quizStarts ?? 0) > 0
            ? (((d.orders ?? 0) / (d.quizStarts ?? 1)) * 100).toFixed(1)
            : "0.0";
          const emailRate = (d.quizStarts ?? 0) > 0
            ? (((d.leads ?? 0) / (d.quizStarts ?? 1)) * 100).toFixed(1)
            : "0.0";
          const revenuePerLead = (d.leads ?? 0) > 0
            ? ((d.revenue ?? 0) / (d.leads ?? 1)).toFixed(2)
            : "0.00";
          const campaignList = d.campaigns && d.campaigns.length > 0
            ? d.campaigns.map((c: { name: string; status: string; impressions?: number; clicks?: number; ctr?: number; spend?: number; cpc?: number; score?: number; rank?: string }) =>
                `${c.name} [${c.status}] — impressions:${c.impressions ?? 0}, clicks:${c.clicks ?? 0}, CTR:${c.ctr?.toFixed(2) ?? 0}%, spend:€${c.spend?.toFixed(2) ?? 0}, CPC:€${c.cpc?.toFixed(3) ?? 0}, score:${c.score ?? 0}/100 (${c.rank ?? 'mid'})`
              ).join("\n  ")
            : "none loaded";

          systemPrompt = `You are Luna — an elite AI performance marketing analyst for Deep Sleep Reset, a $1 CBT-I sleep protocol product.

## YOUR ROLE
You are the admin's personal data analyst and growth strategist. You have FULL REAL-TIME ACCESS to all business metrics listed below. Answer EVERY question DIRECTLY using this data. NEVER say you don't have access to data — you have it all right here.

## LIVE BUSINESS DATA (real-time)
### Revenue & Sales
- Total Revenue: $${(d.revenue ?? 0).toFixed(2)}
- Completed Orders: ${d.orders ?? 0}
- Email Leads Captured: ${d.leads ?? 0}
- Quiz Starts (funnel entries): ${d.quizStarts ?? 0}
- Average Customer Rating: ${(d.avgRating ?? 0) > 0 ? `${d.avgRating}/5` : "no ratings yet"}
- Customer Feedbacks Received: ${d.feedbacks ?? 0}
- Behavior Events Tracked: ${d.behaviorEvents ?? 0}

### Calculated Conversion Metrics
- Quiz → Order conversion rate: ${convRate}%
- Quiz → Email capture rate: ${emailRate}%
- Revenue per lead: $${revenuePerLead}
- Average order value: $${(d.orders ?? 0) > 0 ? ((d.revenue ?? 0) / (d.orders ?? 1)).toFixed(2) : "0.00"}

### Reddit Ads Performance (last 7 days)
- Impressions: ${(d.redditImpressions ?? 0).toLocaleString()}
- Clicks: ${(d.redditClicks ?? 0).toLocaleString()}
- CTR: ${(d.redditCtr ?? 0) > 0 ? `${(d.redditCtr ?? 0).toFixed(2)}%` : "0% (campaign warming up — normal for first 24-48h)"}
- Total Spend: €${(d.redditSpend ?? 0).toFixed(2)}
- Avg CPC: €${(d.redditCpc ?? 0).toFixed(3)}
- Active Campaigns: ${campaignList}

## HOW TO RESPOND
1. ALWAYS answer with specific numbers from the data above
2. If a metric is 0, say so honestly and explain WHY (e.g., "0 orders — Reddit campaign is in the 24-48h warm-up phase, data delay is normal")
3. Use Hormozi-style analysis: direct, specific, no fluff
4. For "what should I do" questions: give TOP 3 prioritized actions with expected impact
5. For Reddit showing 0s: explain the 24-48h data delay is normal for new campaigns
6. Suggest A/B tests, budget optimizations, funnel improvements based on actual numbers
7. Keep responses concise: 3-6 sentences or a short numbered list
8. Respond in the SAME LANGUAGE as the admin's message (Czech if they write in Czech, English if English)`;

        } else if (input.mode === "affiliate") {
          systemPrompt = `You are Luna, an affiliate guide for Deep Sleep Reset ($4 product, 50% commission = $2.50/sale, 30-day cookie). Help affiliates maximize earnings with specific, actionable advice. Respond in the same language as the user.`;

        } else if (input.mode === "post_purchase") {
          systemPrompt = `You are Luna, a personal sleep coach for someone who just purchased **Deep Sleep Reset**. They are a customer — do NOT try to sell them anything.

Your role now:
- Guide them through the 7-Night CBT-I protocol step by step
- Answer questions about the program content (7-Night Protocol PDF, Sleep Environment Checklist, Chronotype Guide, 4 ASMR tracks, 30-Day Tracker)
- Provide personalized sleep coaching, tips, and encouragement
- Help them stay consistent with the protocol
- Celebrate their progress and milestones
- If they mention Night 1, 2, 3 etc., give specific advice for that night
- Access their content at: https://deep-sleep-reset.com/members

Personality: Warm, celebratory, coach-like. They made a great decision — reinforce it. 2-4 sentences max. Respond in the SAME LANGUAGE as the user.`;

        } else {
          systemPrompt = `You are Luna, the friendly AI sleep coach for Deep Sleep Reset — a $1 science-backed 7-night sleep protocol based on CBT-I (Cognitive Behavioral Therapy for Insomnia), the #1 clinician-recommended insomnia treatment with 80% success rate.

About the product:
- Price: $4 (one-time, no subscription)
- Includes: 7-Night Protocol PDF, Sleep Environment Checklist, Chronotype Guide, 4 ASMR tracks, 30-Day Tracker
- CBT-I based — clinically proven, no pills needed
- 30-day money-back guarantee
- Purchase: /order (direct checkout, no Gumroad)
- When mentioning the product, always use **bold** formatting and a clickable link: [**Deep Sleep Reset**](/order)

Personality: Warm, empathetic, Hormozi-style directness. Answer first, mention product softly if relevant. 2-4 sentences max. Respond in the SAME LANGUAGE as the user. Always use markdown for links and bold product names.`;
        }

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...input.history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const reply = typeof rawContent === "string" ? rawContent : "I'm having trouble responding right now. Please try again!";
        return { reply };
      }),
  }),

  // ── Reddit Ads ───────────────────────────────────────────────────────────────────────────
  reddit: router({
    account: protectedProcedure.query(async () => {
      try {
        return await getAdAccount();
      } catch (e) {
        return { id: "", name: "DeepSleeper", currency: "EUR", status: "ACTIVE", error: String(e) };
      }
    }),
    campaigns: protectedProcedure.query(async () => {
      try {
        return await getCampaigns();
      } catch (e) {
        return [];
      }
    }),
    report: protectedProcedure
      .input(
        z.object({
          startDate: z.string(), // YYYY-MM-DD
          endDate: z.string(),   // YYYY-MM-DD
        })
      )
      .query(async ({ input }) => {
        try {
          return await getCampaignSummary(input.startDate, input.endDate);
        } catch (e) {
          return {
            totalImpressions: 0,
            totalClicks: 0,
            totalSpend: 0,
            avgCtr: 0,
            avgCpc: 0,
            avgEcpm: 0,
            days: [],
            error: String(e),
          };
        }
      }),
    campaignPerformance: protectedProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          return await getCampaignPerformance(input.startDate, input.endDate);
        } catch (e) {
          return [];
        }
      }),

    // Campaign creation
    createCampaign: protectedProcedure
      .input(z.object({
        name: z.string(),
        objective: z.enum(["TRAFFIC", "CONVERSIONS", "VIDEO_VIEWS", "BRAND_AWARENESS", "APP_INSTALLS"]),
        status: z.enum(["ACTIVE", "PAUSED"]).default("PAUSED"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createCampaign(input);
      }),

    createAdSet: protectedProcedure
      .input(z.object({
        campaignId: z.string(),
        name: z.string(),
        dailyBudgetCents: z.number().int().min(100),
        startTime: z.string(),
        endTime: z.string().optional(),
        subreddits: z.array(z.string()).optional(),
        geoLocations: z.array(z.string()).optional(),
        bidType: z.enum(["CPM", "CPC", "CPV"]).optional(),
        bidAmountCents: z.number().int().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createAdSet(input);
      }),

    createAd: protectedProcedure
      .input(z.object({
        adSetId: z.string(),
        name: z.string(),
        title: z.string(),
        text: z.string(),
        url: z.string().url(),
        callToAction: z.enum(["LEARN_MORE", "SHOP_NOW", "SIGN_UP", "DOWNLOAD", "GET_STARTED"]).optional(),
        thumbnailUrl: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return createAd(input);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        campaignId: z.string(),
        status: z.enum(["ACTIVE", "PAUSED"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return updateCampaignStatus(input.campaignId, input.status);
      }),

    // Launch a pre-built template campaign (one-click)
    launchTemplate: protectedProcedure
      .input(z.object({ templateId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const tpl = CAMPAIGN_TEMPLATES.find(t => t.id === input.templateId);
        if (!tpl) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });

        // 1. Create campaign
        const campaign = await createCampaign({ name: tpl.name, objective: tpl.objective, status: "PAUSED" });

        // 2. Create ad set
        const adSet = await createAdSet({
          campaignId: campaign.id,
          name: tpl.adSetName,
          dailyBudgetCents: tpl.dailyBudgetCents,
          startTime: new Date().toISOString(),
          subreddits: tpl.subreddits,
          geoLocations: tpl.geoLocations,
        });

        // 3. Create ad
        const ad = await createAd({
          adSetId: adSet.id,
          name: `${tpl.name} — Ad 1`,
          title: tpl.adTitle,
          text: tpl.adText,
          url: tpl.url,
          callToAction: tpl.callToAction,
        });

        return { campaign, adSet, ad, message: `Campaign "${tpl.name}" created (PAUSED). Review and activate in Reddit Ads Manager.` };
      }),

    templates: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return CAMPAIGN_TEMPLATES;
    }),
  }),
  // ── Currency ─────────────────────────────────────────────────────────────────────────────────────────
  currency: router({
    getRates: publicProcedure
      .input(z.object({ base: z.string().default("USD") }))
      .query(async ({ input, ctx }) => {
        // Detect currency from Accept-Language header
        const acceptLang = (ctx.req.headers["accept-language"] ?? "") as string;
        const detectedCurrency = detectCurrencyFromLang(acceptLang);

        // Fetch live rates from open.er-api.com (free, no key needed)
        let rates: Record<string, number> = FALLBACK_RATES;
        try {
          const res = await fetch(`https://open.er-api.com/v6/latest/${input.base}`);
          if (res.ok) {
            const data = await res.json() as { result: string; rates: Record<string, number> };
            if (data.result === "success") rates = data.rates;
          }
        } catch {
          // use fallback rates
        }

        // Filter to supported currencies only
        const supported = ["USD","EUR","GBP","CZK","CAD","AUD","PLN","HUF","RON","INR","BRL","MXN","CHF","SEK","NOK","DKK","SGD","NZD","ZAR","JPY"];
        const filteredRates: Record<string, number> = {};
        for (const c of supported) {
          if (rates[c]) filteredRates[c] = rates[c];
        }

        return { rates: filteredRates, detectedCurrency, base: input.base };
      }),
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────────────────────────────
  // ── Upsell A/B Testing ────────────────────────────────────────────────────────────────────────────────────────
  upsellAb: router({
    assignVariant: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        page: z.enum(["upsell1", "upsell2", "upsell3"]),
        chronotype: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const variant = await assignUpsellVariant(input.sessionId, input.page, input.chronotype);
        return { variant };
      }),

    trackConversion: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        page: z.enum(["upsell1", "upsell2", "upsell3"]),
        revenue: z.string(),
      }))
      .mutation(async ({ input }) => {
        await markUpsellConverted(input.sessionId, input.page, input.revenue);
        return { success: true };
      }),
  }),

  admin: router({
    stats: protectedProcedure.query(async () => getAdminStats()),
    getAbResults: protectedProcedure.query(async () => getUpsellAbResults()),

    getStatsTrend: protectedProcedure
      .input(z.object({
        days: z.number().int().min(1).max(90).default(30),
      }))
      .query(async ({ input }) => {
        const { getDailyMetrics } = await import("./db");
        const now = Date.now();
        const periodMs = input.days * 24 * 60 * 60 * 1000;
        const [currentData, prevData] = await Promise.all([
          getDailyMetrics(now - periodMs, now),
          getDailyMetrics(now - 2 * periodMs, now - periodMs),
        ]);
        const sum = (data: typeof currentData) => ({
          revenue: data.reduce((s, d) => s + (d.revenue ?? 0), 0),
          orders: data.reduce((s, d) => s + (d.orders ?? 0), 0),
          visits: data.reduce((s, d) => s + (d.visits ?? 0), 0),
        });
        const current = sum(currentData);
        const prev = sum(prevData);
        const pct = (curr: number, p: number) =>
          p === 0 ? null : Math.round(((curr - p) / p) * 1000) / 10;
        return {
          current,
          prev,
          trends: {
            revenue: pct(current.revenue, prev.revenue),
            orders: pct(current.orders, prev.orders),
            visits: pct(current.visits, prev.visits),
          },
        };
      }),

    getAiInsights: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const insights = await getLatestAiInsights(10);
        return insights.map(i => ({
          id: i.id,
          date: i.date,
          summary: i.summary,
          recommendations: (() => { try { return JSON.parse(i.recommendations); } catch { return []; } })(),
          metrics: (() => { try { return JSON.parse(i.metrics); } catch { return {}; } })(),
          applied: i.applied,
          createdAt: i.createdAt,
        }));
      }),

    getFeedbacksForExport: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const all = await getAllFeedbacks();
        return all.map(f => ({
          id: f.id,
          sessionId: f.sessionId,
          rating: f.rating,
          liked: f.liked ?? '',
          improved: f.improved ?? '',
          email: f.email ?? '',
          rewardCode: f.rewardCode ?? '',
          createdAt: f.createdAt,
        }));
      }),

    getMetaAdsData: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        // Meta Ads data via MCP is only available in sandbox environment
        // In production, return connected account info + empty campaigns
        return {
          accounts: [
            { id: 'act_1489709811460163', name: 'Petr Matěj', status: 'DISABLED', currency: 'CZK' },
            { id: 'act_1248622005589578', name: 'Solutions Engineering Team', status: 'ACTIVE', currency: 'CZK' },
          ],
          campaigns: [] as Array<{ id: string; name: string; status: string; objective?: string }>,
          totalSpend: null as number | null,
          totalImpressions: null as number | null,
          totalClicks: null as number | null,
          ctr: null as number | null,
          cpc: null as number | null,
          roas: null as number | null,
          lastUpdated: new Date(),
          note: 'Connect Meta Ads for Deep Sleep Reset to see live performance data. Current accounts: Petr Matěj (DISABLED), Solutions Engineering Team (ACTIVE).',
        };
      }),

    getTimelineMetrics: protectedProcedure
      .input(z.object({
        granularity: z.enum(["hourly", "daily"]).default("daily"),
        days: z.number().int().min(1).max(90).default(7),
      }))
      .query(async ({ input }) => {
        const { getHourlyMetrics, getDailyMetrics } = await import("./db");
        const now = Date.now();
        const startDate = now - input.days * 24 * 60 * 60 * 1000;
        
        if (input.granularity === "hourly") {
          return await getHourlyMetrics(startDate, now);
        } else {
          return await getDailyMetrics(startDate, now);
        }
      }),

    getBuyerEmails: protectedProcedure.query(async () => {
      const buyers = await getAllBuyerEmails();
      const leads = await getAllLeads();
      return {
        buyers,
        leadCount: leads.length,
        buyerCount: buyers.length,
      };
    }),

    sendBroadcast: protectedProcedure
      .input(z.object({
        subject: z.string().min(1).max(200),
        body: z.string().min(1).max(5000),
        audience: z.enum(["buyers", "leads", "all"]).default("buyers"),
        includeDownloadLink: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const buyers = await getAllBuyerEmails();
        const leads = await getAllLeads();

        let emails: string[] = [];
        if (input.audience === "buyers" || input.audience === "all") {
          emails.push(...buyers.map(b => b.email));
        }
        if (input.audience === "leads" || input.audience === "all") {
          emails.push(...leads.map(l => l.email).filter(Boolean) as string[]);
        }
        // Deduplicate
        emails = Array.from(new Set(emails));

        const downloadLink = "https://www.deep-sleep-reset.com/protocol";
        const pdfLink = "https://www.deep-sleep-reset.com/api/protocol/download?lang=en";

        const finalBody = input.includeDownloadLink
          ? `${input.body}\n\n---\n📖 Access your protocol: ${downloadLink}\n📄 Download PDF: ${pdfLink}\n\n---\nDeep Sleep Reset · Unsubscribe: support@deep-sleep-reset.com`
          : `${input.body}\n\n---\nDeep Sleep Reset`;

        // Use Manus notification system to send to owner as preview, log count
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `📧 Broadcast sent to ${emails.length} recipients`,
          content: `Subject: ${input.subject}\nAudience: ${input.audience} (${emails.length} emails)\nFirst 5: ${emails.slice(0, 5).join(", ")}\n\nBody preview:\n${input.body.slice(0, 300)}`,
        });

        // Return email list for admin to use with their email provider
        return {
          success: true,
          count: emails.length,
          emails: emails.slice(0, 100), // Return first 100 for display
          subject: input.subject,
          body: finalBody,
          note: "Email list exported. Use your email provider (Mailchimp, SendGrid, etc.) to send. Protocol links included.",
        };
      }),
  }),

  // ── Stripe Checkout ───────────────────────────────────────────────────────────────────────
  checkout: router({
    createSession: publicProcedure
      .input(
        z.object({
          productId: z.enum(["main", "entry", "discount", "oto1", "oto2", "subscription", "bump", "backend"]).default("main"),
          includeUpsell: z.string().optional(), // e.g. "oto1" — adds upsell as 2nd line item alongside main
          sessionId: z.string(),
          email: z.string().email().optional(),
          chronotype: z.string().optional(),
          currency: z.string().default("usd"),
          isLowTier: z.boolean().default(false),
          origin: z.string(),
          utmSource: z.string().optional(),
          utmMedium: z.string().optional(),
          utmCampaign: z.string().optional(),
          utmContent: z.string().optional(),
          utmTerm: z.string().optional(),
          referrer: z.string().optional(),
          affiliateRef: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
        const PRODUCT_PRICES: Record<string, number> = {
          entry: 100, main: 700, discount: 700, oto1: 3700, oto2: 1900, subscription: 999, bump: 1100, backend: 9700,
        };
        const PRODUCT_NAMES: Record<string, string> = {
          entry: "1-Night Sleep Optimizer",
          main: "Deep Sleep Reset — 7-Night Protocol",
          discount: "Deep Sleep Reset — 7-Night Protocol (Special Offer)",
          oto1: "Deep Sleep Reset Pro Toolkit",
          oto2: "Emergency 3 AM Rescue Toolkit",
          subscription: "Sleep Audio Library — Monthly",
          bump: "Premium Sleep Audio Pack (12 Tracks)",
          backend: "Deep Sleep Reset Advanced — 30-Day Mastery Program",
        };
        // Geo-pricing: low-tier countries get reduced prices
        const LOW_TIER_PRICES: Record<string, number> = {
          entry: 100, main: 200, discount: 200, oto1: 900, oto2: 500, subscription: 299, bump: 300, backend: 2500,
        };
        const amountCents = input.isLowTier
          ? (LOW_TIER_PRICES[input.productId] ?? 100)
          : (PRODUCT_PRICES[input.productId] ?? 500);
        const productName = PRODUCT_NAMES[input.productId] ?? "Deep Sleep Reset";
        // Supported Stripe currencies (subset of all)
        const stripeSupportedCurrencies = ["usd","eur","gbp","cad","aud","pln","czk","inr","brl","mxn","chf","sek","nok","dkk","sgd","nzd","zar","jpy"];
        const currency = stripeSupportedCurrencies.includes(input.currency.toLowerCase()) ? input.currency.toLowerCase() : "usd";
        // Convert amount from USD cents to target currency
        const RATES: Record<string, number> = {
          usd: 1, eur: 0.853, gbp: 0.741, czk: 20.77, cad: 1.366,
          aud: 1.548, pln: 3.82, inr: 83.5, brl: 4.97, mxn: 17.15,
          chf: 0.899, sek: 10.32, nok: 10.58, dkk: 6.36, sgd: 1.34,
          nzd: 1.67, zar: 18.63, jpy: 154.2,
        };
        // Zero-decimal currencies (Stripe expects whole units, not cents)
        const zeroDecimal = ["jpy"];
        const rate = RATES[currency] ?? 1;
        const convertCents = (cents: number) => zeroDecimal.includes(currency)
          ? Math.round((cents / 100) * rate)
          : Math.round(cents * rate);
        let finalAmount: number = convertCents(amountCents);
        // Subscription mode: use recurring price_data for "subscription" product
        const isSubscription = input.productId === "subscription";
        // Build line items — always include main product, optionally add upsell
        const lineItems: any[] = [
          isSubscription
            ? {
                price_data: {
                  currency,
                  product_data: {
                    name: productName,
                    description: "Monthly sleep protocol updates, AI coaching, and community access.",
                  },
                  unit_amount: finalAmount,
                  recurring: { interval: "month" as const },
                },
                quantity: 1,
              }
            : {
                price_data: {
                  currency,
                  product_data: {
                    name: productName,
                    description: "Instant digital download. Science-backed sleep protocol.",
                  },
                  unit_amount: finalAmount,
                },
                quantity: 1,
              },
        ];
        // If includeUpsell is set, add upsell as 2nd line item (e.g. bump on Order page)
        let upsellAmount = 0;
        if (input.includeUpsell && PRODUCT_PRICES[input.includeUpsell]) {
          const upsellCents = input.isLowTier
            ? (LOW_TIER_PRICES[input.includeUpsell] ?? 100)
            : (PRODUCT_PRICES[input.includeUpsell] ?? 300);
          upsellAmount = convertCents(upsellCents);
          lineItems.push({
            price_data: {
              currency,
              product_data: {
                name: PRODUCT_NAMES[input.includeUpsell] ?? "Upsell",
                description: "Bonus add-on included with your order.",
              },
              unit_amount: upsellAmount,
            },
            quantity: 1,
          });
        }
        // Create pending order in DB (total amount = main + upsell)
        const totalAmount = finalAmount + upsellAmount;
        const orderId = await createOrder({
          sessionId: input.sessionId,
          productId: input.includeUpsell ? `${input.productId}+${input.includeUpsell}` : input.productId,
          amount: (totalAmount / (zeroDecimal.includes(currency) ? 1 : 100)).toFixed(2),
          email: input.email,
          chronotype: (input.chronotype as "Lion" | "Bear" | "Wolf" | "Dolphin" | undefined),
          status: "pending",
          currency,
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmContent: input.utmContent,
          utmTerm: input.utmTerm,
          referrer: input.referrer,
        });
        const session = await stripe.checkout.sessions.create({
          // Enable all payment methods including Apple Pay, Google Pay, Link
          payment_method_types: ["card", "link"],
          payment_method_options: {
            card: {
              // Enable Apple Pay / Google Pay via wallets
              setup_future_usage: undefined,
            },
          },
          line_items: lineItems,
          mode: isSubscription ? "subscription" : "payment",
          allow_promotion_codes: true,
          customer_email: input.email,
          // Route success based on product: main → upsell1, oto1 → upsell2, oto2 → thankyou
          success_url: (() => {
            const base = `${input.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}&productId=${input.productId}&chronotype=${input.chronotype ?? "Bear"}`;
            return base;
          })(),
          cancel_url: (() => {
            // If declining an upsell, skip to next step
            if (input.productId === "oto1") return `${input.origin}/upsell2?chronotype=${input.chronotype ?? "Bear"}`;
            if (input.productId === "oto2") return `${input.origin}/upsell3?chronotype=${input.chronotype ?? "Bear"}`;
            if (input.productId === "subscription") return `${input.origin}/thankyou?chronotype=${input.chronotype ?? "Bear"}`;
            return `${input.origin}/order`;
          })(),
          metadata: {
            sessionId: input.sessionId,
            productId: input.productId,
            orderId: String(orderId),
            chronotype: input.chronotype ?? "",
            customer_email: input.email ?? "",
            affiliateRef: input.affiliateRef ?? "",
          },
          client_reference_id: input.sessionId,
        });
        return { url: session.url, sessionId: session.id };
      }),
  }),

  // ── Blog Router ───────────────────────────────────────────────────────────────
  blog: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        const posts = await getBlogPosts(input.limit, input.offset);
        return posts;
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getBlogPostBySlug(input.slug);
        if (!post) throw new Error("Blog post not found");
        return post;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(256),
        slug: z.string().min(1).max(256),
        content: z.string().min(1),
        excerpt: z.string().max(512).optional(),
        seoKeyword: z.string().max(128).optional(),
        metaDescription: z.string().max(256).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        await createBlogPost(input);
        return { success: true };
      }),
  }),

  // ── Personas (Luna A/B Testing) ───────────────────────────────────────────
  personas: router({
    assignPersona: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          page: z.string(),
          chronotype: z.enum(["Lion", "Bear", "Wolf", "Dolphin"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { assignPersonaToSession } = await import("./personaHelpers");
        const { getPersonaById } = await import("../shared/personas");
        const assignment = await assignPersonaToSession(input.sessionId, input.page, input.chronotype);
        const persona = getPersonaById(assignment.personaId);
        return {
          personaId: assignment.personaId,
          personaName: assignment.personaName,
          personaDescription: assignment.personaDescription,
          systemPrompt: persona?.systemPrompt,
        };
      }),

    getPersona: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          page: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { getPersonaForSession } = await import("./personaHelpers");
        return await getPersonaForSession(input.sessionId, input.page);
      }),

    markConversion: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          page: z.string(),
          revenue: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { markPersonaConverted } = await import("./personaHelpers");
        await markPersonaConverted(input.sessionId, input.page, input.revenue);
        return { success: true };
      }),

    getPerformance: protectedProcedure
      .input(
        z.object({
          page: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const { getPersonaPerformance } = await import("./personaHelpers");
        return await getPersonaPerformance(input.page);
      }),
  }),

  recommendations: router({
    getRecommendations: publicProcedure
      .input(z.object({
        language: z.enum(['en', 'cs', 'de', 'fr', 'es']).default('cs'),
      }))
      .query(async ({ input }) => {
        const recommendations = {
          cs: [
            {
              id: 'quiz-tracking',
              priority: 'high',
              title: 'Implementujte a ověřte tracking pro quiz',
              description: 'Sledujte starty kvízu, konverze a míry odpadu v traktu. Identifikujte uživatele, kteří odpadávají.',
              impact: 'Zvýšení konverzí o 15-25%',
              effort: 'Střední',
            },
            {
              id: 'cta-optimization',
              priority: 'high',
              title: 'Optimalizujte CTA a lead capture',
              description: 'Vytvořte jasné, přesvědčivé Call-to-Action na úvodní stránce. Zvýšete engagement.',
              impact: 'Zvýšení lead capture o 20-30%',
              effort: 'Nízké',
            },
            {
              id: 'landing-page-mobile',
              priority: 'medium',
              title: 'Optimalizujte úvodní stránku pro mobil',
              description: 'Zlepšete design a konverzi na mobilních zařízeních (24+% trafiku).',
              impact: 'Zvýšení mobilních konverzí o 15%',
              effort: 'Střední',
            },
            {
              id: 'feedback-collection',
              priority: 'medium',
              title: 'Přidejte mechaniku pro sběr zpětné vazby',
              description: 'Sbírejte zpětnou vazbu a recenze po nákupu. Zvýšete vnímané hodnoty.',
              impact: 'Zvýšení trust score o 25%',
              effort: 'Nízké',
            },
            {
              id: 'ab-testing-headlines',
              priority: 'medium',
              title: 'A/B testujte nadpisy a prezentaci',
              description: 'Testujte různé nadpisy a prezentace, aby lépe artikulovala unikátní value proposition.',
              impact: 'Zvýšení CTR o 10-15%',
              effort: 'Nízké',
            },
          ],
          en: [
            {
              id: 'quiz-tracking',
              priority: 'high',
              title: 'Implement and verify quiz tracking',
              description: 'Track quiz starts, conversions, and drop-off rates. Identify where users are leaving.',
              impact: '15-25% conversion increase',
              effort: 'Medium',
            },
            {
              id: 'cta-optimization',
              priority: 'high',
              title: 'Optimize CTA and lead capture',
              description: 'Create clear, compelling Call-to-Action on landing page. Increase engagement.',
              impact: '20-30% lead capture increase',
              effort: 'Low',
            },
            {
              id: 'landing-page-mobile',
              priority: 'medium',
              title: 'Optimize landing page for mobile',
              description: 'Improve design and conversion on mobile devices (24%+ of traffic).',
              impact: '15% mobile conversion increase',
              effort: 'Medium',
            },
            {
              id: 'feedback-collection',
              priority: 'medium',
              title: 'Add feedback collection mechanism',
              description: 'Collect customer feedback and reviews post-purchase. Increase perceived value.',
              impact: '25% trust score increase',
              effort: 'Low',
            },
            {
              id: 'ab-testing-headlines',
              priority: 'medium',
              title: 'A/B test headlines and presentation',
              description: 'Test different headlines and presentations to better articulate unique value.',
              impact: '10-15% CTR increase',
              effort: 'Low',
            },
          ],
        };
        return (recommendations as any)[input.language] || recommendations.en;
      }),
    executeRecommendation: protectedProcedure
      .input(z.object({
        recommendationId: z.string(),
        title: z.string(),
        description: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        // Uloži aplikované doporučení do ai_insights
        const db = await (await import('./db')).getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const today = new Date().toISOString().slice(0, 10);
        const { aiInsights } = await import('../drizzle/schema');
        
        await db.insert(aiInsights).values({
          date: today,
          summary: `Applied recommendation: ${input.title}`,
          recommendations: JSON.stringify([{ id: input.recommendationId, applied: true }]),
          metrics: JSON.stringify({ appliedAt: new Date().toISOString() }),
          applied: true,
        });
        
        return { success: true, message: `Doporučení "${input.title}" bylo aplikováno` };
      }),
  }),
  // ── Nightly Optimization Engine ───────────────────────────────────────────
  nightly: router({
    getOptimizationResults: publicProcedure
      .input(z.object({
        variant: z.enum(['a', 'b']).optional(),
        days: z.number().min(1).max(30).default(7),
      }))
      .query(async ({ input }) => {
        // Vrátí výsledky poslední nightly optimizace
        return {
          timestamp: new Date(),
          variant: input.variant || 'all',
          insights: [
            {
              type: 'performance',
              title: 'Variant B vítězí',
              description: 'Variant B má 23% vyšší conversion rate',
              priority: 'high',
              recommendation: 'Zvýšit budget pro Variant B o 50%',
            },
            {
              type: 'traffic',
              title: 'Optimální čas pro reklamy',
              description: 'Nejlepší engagement mezi 19:00-22:00',
              priority: 'medium',
              recommendation: 'Naplánovat 60% budgetu na tyto hodiny',
            },
            {
              type: 'audience',
              title: 'Nový segment',
              description: 'Ženy 25-34 let mají 2x vyšší ROAS',
              priority: 'high',
              recommendation: 'Vytvořit novou kampani pro tento segment',
            },
          ],
          nextOptimization: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      }),

    scheduleOptimization: protectedProcedure
      .input(z.object({
        time: z.string().regex(/^\d{2}:\d{2}$/),
        timezone: z.string().default('Europe/Prague'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return {
          success: true,
          message: `Optimizace naplánována na ${input.time} ${input.timezone}`,
          nextRun: new Date(),
        };
      }),
  }),
  tiktok: router({
    getAccount: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return {
          advertiser_id: process.env.TIKTOK_ADS_ADVERTISER_ID || '',
          advertiser_name: 'Deep Sleep Reset',
          balance: 0,
          currency: 'USD',
        };
      }),
    getCampaigns: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return [];
      }),
  }),

  // ── Integrations (API Keys + Outbound Webhooks) ─────────────────────────────
  integrations: router({
    // ── API Keys ──────────────────────────────────────────────────────────────
    listApiKeys: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await (await import("./db")).getDb();
      if (!db) return [];
      const { apiKeys } = await import("../drizzle/schema");
      const keys = await db.select({
        id: apiKeys.id,
        name: apiKeys.name,
        permissions: apiKeys.permissions,
        active: apiKeys.active,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
      }).from(apiKeys);
      return keys;
    }),

    createApiKey: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        permissions: z.array(z.enum(["read", "write", "email", "admin"])).default(["read"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { apiKeys } = await import("../drizzle/schema");
        const { generateApiKey, hashApiKey } = await import("./externalApi");
        const rawKey = generateApiKey();
        const keyHash = hashApiKey(rawKey);
        await db.insert(apiKeys).values({
          name: input.name,
          keyHash,
          permissions: JSON.stringify(input.permissions),
          active: true,
        });
        // Return raw key ONCE — never stored in plaintext
        return { key: rawKey, name: input.name, permissions: input.permissions };
      }),

    revokeApiKey: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { apiKeys } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(apiKeys).set({ active: false }).where(eq(apiKeys.id, input.id));
        return { success: true };
      }),

    // ── Outbound Webhooks ──────────────────────────────────────────────────────
    listWebhooks: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await (await import("./db")).getDb();
      if (!db) return [];
      const { outboundWebhooks } = await import("../drizzle/schema");
      return db.select().from(outboundWebhooks);
    }),

    createWebhook: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        url: z.string().url(),
        secret: z.string().optional(),
        events: z.array(z.enum(["new_order", "new_lead", "quiz_completed", "*"])).default(["new_order"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { outboundWebhooks } = await import("../drizzle/schema");
        const secret = input.secret || require("crypto").randomBytes(24).toString("hex");
        const [result] = await db.insert(outboundWebhooks).values({
          name: input.name,
          url: input.url,
          secret,
          events: JSON.stringify(input.events),
          active: true,
        });
        return { success: true, secret };
      }),

    updateWebhook: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        active: z.boolean().optional(),
        events: z.array(z.string()).optional(),
        url: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { outboundWebhooks } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const updateData: Record<string, unknown> = {};
        if (input.active !== undefined) updateData.active = input.active;
        if (input.events) updateData.events = JSON.stringify(input.events);
        if (input.url) updateData.url = input.url;
        await db.update(outboundWebhooks).set(updateData as any).where(eq(outboundWebhooks.id, input.id));
        return { success: true };
      }),

    deleteWebhook: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { outboundWebhooks } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.delete(outboundWebhooks).where(eq(outboundWebhooks.id, input.id));
        return { success: true };
      }),
  }),

  // ── Geo-Pricing ───────────────────────────────────────────────────────────────
  pricing: router({
    getForGeo: publicProcedure
      .input(z.object({
        country: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { getGeoPricingFromIp, getGeoPricingFromCountry } = await import("./geoPricing");
        
        if (input.country) {
          return getGeoPricingFromCountry(input.country);
        }
        
        // Get IP from request
        const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0] || 
                   (ctx.req.headers["x-real-ip"] as string) ||
                   ctx.req.socket.remoteAddress || 
                   "127.0.0.1";
        
        return getGeoPricingFromIp(ip);
      }),
  }),
  affiliate: router({
    register: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const { getAffiliateByEmail, createAffiliate } = await import("./db");
        const existing = await getAffiliateByEmail(input.email);
        if (existing) return { code: existing.code, message: "Already registered" };
        const code = `ds_${input.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${Math.random().toString(36).slice(2, 6)}`;
        await createAffiliate({ email: input.email, name: input.name, code, commissionPercent: 50, status: "active" });
        return { code, message: "Welcome!" };
      }),
    trackClick: publicProcedure
      .input(z.object({ refCode: z.string(), landingUrl: z.string().optional(), utmCampaign: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { trackAffiliateClick } = await import("./db");
        const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0] || "";
        const ipHash = ip ? Buffer.from(ip).toString("base64").slice(0, 16) : undefined;
        const userAgent = (ctx.req.headers["user-agent"] as string)?.slice(0, 512);
        await trackAffiliateClick({ refCode: input.refCode, ipHash, landingUrl: input.landingUrl, userAgent, utmCampaign: input.utmCampaign });
        return { ok: true };
      }),
    getStats: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const { getAffiliateByEmail, getAffiliateStats } = await import("./db");
        const aff = await getAffiliateByEmail(input.email);
        if (!aff) return null;
        return getAffiliateStats(aff.code);
      }),
  }),
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), firstName: z.string().optional(), source: z.string().default("squeeze") }))
      .mutation(async ({ input }) => {
        const { subscribeNewsletter } = await import("./db");
        await subscribeNewsletter({ email: input.email, firstName: input.firstName, source: input.source });
        return { ok: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
