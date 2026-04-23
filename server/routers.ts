import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
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

  // ── AI Chat ───────────────────────────────────────────────────────────────
  chat: router({
    message: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(500),
        lang: z.string().default("en"),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).max(10).default([]),
      }))
      .mutation(async ({ input }) => {
        const SLEEP_GUIDE_CONTEXT = `You are Luna, the friendly AI sleep coach for Deep Sleep Reset — a $5 science-backed 7-night sleep protocol based on CBT-I (Cognitive Behavioral Therapy for Insomnia), the #1 clinician-recommended insomnia treatment with 80% success rate.

About the product:
- Price: $5 (one-time, no subscription)
- What's included: 7-Night Deep Sleep Protocol PDF, Sleep Environment Optimization Checklist, Chronotype Assessment Guide, 4 ASMR Sleep Sound Tracks, 30-Day Sleep Habit Tracker
- Based on CBT-I — clinically proven, no pills needed
- 30-day money-back guarantee
- Instant digital download via Gumroad
- Purchase link: https://deepsleepreset.gumroad.com/l/fdtifc

Key benefits:
- Falls asleep faster (most users see results by Night 3)
- Fixes root cause of insomnia, not just symptoms
- Works for all chronotypes: Lion (early bird), Bear (normal), Wolf (night owl), Dolphin (light sleeper)
- No melatonin, no sleeping pills, no expensive gadgets

Your personality:
- Warm, empathetic, science-backed
- Use Hormozi-style directness: clear, no fluff, value-first
- Always answer the question first, then softly mention the product if relevant
- Never be pushy — educate first, sell second
- Keep responses concise (2-4 sentences max)
- Respond in the SAME LANGUAGE as the user's message
- If asked about price, always say $5 with the purchase link`;

        const messages = [
          { role: "system" as const, content: SLEEP_GUIDE_CONTEXT },
          ...input.history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        const reply = typeof rawContent === "string" ? rawContent : "I'm having trouble responding right now. Please try again!";
        return { reply };
      }),
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    stats: protectedProcedure.query(async () => getAdminStats()),
  }),
});

export type AppRouter = typeof appRouter;
