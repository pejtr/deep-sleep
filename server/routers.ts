import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getCampaigns, getCampaignSummary, getAdAccount } from "./redditAds";
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
  // Simple scoring: sum per type based on answer index mapping
  const scores = { Lion: 0, Bear: 0, Wolf: 0, Dolphin: 0 };
  const mappings: Array<Record<number, keyof typeof scores>> = [
    { 0: "Lion", 1: "Bear", 2: "Wolf", 3: "Dolphin" },
    { 0: "Lion", 1: "Bear", 2: "Wolf", 3: "Dolphin" },
    { 0: "Lion", 1: "Bear", 2: "Wolf", 3: "Dolphin" },
    { 0: "Lion", 1: "Bear", 2: "Wolf", 3: "Dolphin" },
    { 0: "Lion", 1: "Bear", 2: "Wolf", 3: "Dolphin" },
  ];
  answers.forEach((ans, i) => {
    const mapping = mappings[i];
    if (mapping && mapping[ans]) scores[mapping[ans]]++;
  });
  return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Bear") as "Lion" | "Bear" | "Wolf" | "Dolphin";
}

// ── Product config ────────────────────────────────────────────────────────────
const PRODUCTS = {
  main:  { amount: "5.00",  gumroad: "fdtifc" },
  oto1:  { amount: "7.00",  gumroad: "ttrsd"  },
  oto2:  { amount: "17.00", gumroad: "cuhln"  },
  oto3:  { amount: "27.00", gumroad: "ubsxk"  },
} as const;

export const appRouter = router({
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
        answers: z.array(z.number().int().min(0).max(3)).length(5),
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
        return { chronotype };
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
        productId: z.enum(["main", "oto1", "oto2", "oto3"]),
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
          gumroadUrl: `https://deepsleepreset.gumroad.com/l/${product.gumroad}`,
          amount: product.amount,
        };
      }),

    getBySession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => getOrdersBySession(input.sessionId)),
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
        await captureEmailLead({
          email: input.email,
          sessionId: input.sessionId,
          chronotype: input.chronotype,
          source: input.source ?? "quiz_result",
        });
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
        mode: z.enum(["sales", "admin", "affiliate"]).default("sales"),
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
          campaigns: z.array(z.object({ name: z.string(), status: z.string() })).optional(),
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
          const campaignList = d.campaigns
            ? d.campaigns.map((c: { name: string; status: string }) => `${c.name} [${c.status}]`).join(", ")
            : "none loaded";

          systemPrompt = `You are Luna — an elite AI performance marketing analyst for Deep Sleep Reset, a $5 CBT-I sleep protocol product.

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
          systemPrompt = `You are Luna, an affiliate guide for Deep Sleep Reset ($5 product, 50% commission = $2.50/sale, 30-day cookie). Help affiliates maximize earnings with specific, actionable advice. Respond in the same language as the user.`;

        } else {
          systemPrompt = `You are Luna, the friendly AI sleep coach for Deep Sleep Reset — a $5 science-backed 7-night sleep protocol based on CBT-I (Cognitive Behavioral Therapy for Insomnia), the #1 clinician-recommended insomnia treatment with 80% success rate.

About the product:
- Price: $5 (one-time, no subscription)
- Includes: 7-Night Protocol PDF, Sleep Environment Checklist, Chronotype Guide, 4 ASMR tracks, 30-Day Tracker
- CBT-I based — clinically proven, no pills needed
- 30-day money-back guarantee
- Purchase: https://deepsleepreset.gumroad.com/l/fdtifc

Personality: Warm, empathetic, Hormozi-style directness. Answer first, mention product softly if relevant. 2-4 sentences max. Respond in the SAME LANGUAGE as the user.`;
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
  }),
  // ── Admin ─────────────────────────────────────────────────────────────────────────────────
  admin: router({
    stats: protectedProcedure.query(async () => getAdminStats()),
  }),
});
export type AppRouter = typeof appRouter;
