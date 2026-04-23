import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
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

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    stats: protectedProcedure.query(async () => getAdminStats()),
  }),
});

export type AppRouter = typeof appRouter;
