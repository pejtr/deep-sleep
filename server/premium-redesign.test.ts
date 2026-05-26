import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB module
vi.mock("./db", () => ({
  saveQuizResult: vi.fn().mockResolvedValue(undefined),
  getQuizResultBySession: vi.fn().mockResolvedValue(null),
  createOrder: vi.fn().mockResolvedValue(undefined),
  getOrdersBySession: vi.fn().mockResolvedValue([]),
  captureEmailLead: vi.fn().mockResolvedValue(undefined),
  trackAbImpression: vi.fn().mockResolvedValue(undefined),
  markAbConverted: vi.fn().mockResolvedValue(undefined),
  trackBehaviorEvent: vi.fn().mockResolvedValue(undefined),
  getAdminStats: vi.fn().mockResolvedValue({ quizResults: 0, orders: 0, leads: 0 }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const caller = appRouter.createCaller(createPublicContext());

describe("Product structure — Stripe-based (Gumroad deprecated)", () => {
  it("main product returns $5.00 amount", async () => {
    const result = await caller.orders.create({
      sessionId: "test-main",
      productId: "main",
      chronotype: "Bear",
    });
    expect(result.amount).toBe("5.00");
  });

  it("OTO1 returns $17.00 amount", async () => {
    const result = await caller.orders.create({
      sessionId: "test-oto1",
      productId: "oto1",
    });
    expect(result.amount).toBe("17.00");
  });

  it("OTO2 returns $27.00 amount", async () => {
    const result = await caller.orders.create({
      sessionId: "test-oto2",
      productId: "oto2",
    });
    expect(result.amount).toBe("27.00");
  });
});

describe("Quiz — accepts 5-answer array (from 8-question frontend)", () => {
  it("accepts 3 core answers and returns valid chronotype", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-3q-quiz",
      answers: [0, 1, 2],
    });
    expect(["Lion", "Bear", "Wolf", "Dolphin"]).toContain(result.chronotype);
  });

  it("accepts 5 answers (core + bonus) and returns valid chronotype", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-5q-quiz",
      answers: [0, 1, 2, 1, 0],
    });
    expect(["Lion", "Bear", "Wolf", "Dolphin"]).toContain(result.chronotype);
  });

  it("accepts 6 answers (core + all bonus) and returns valid chronotype", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-6q-quiz",
      answers: [0, 1, 2, 1, 0, 3],
    });
    expect(["Lion", "Bear", "Wolf", "Dolphin"]).toContain(result.chronotype);
  });

  it("rejects fewer than 3 answers", async () => {
    await expect(
      caller.quiz.submit({
        sessionId: "test-short",
        answers: [0, 1],
      })
    ).rejects.toThrow();
  });

  it("rejects more than 6 answers", async () => {
    await expect(
      caller.quiz.submit({
        sessionId: "test-long",
        answers: [0, 1, 2, 1, 0, 3, 2],
      })
    ).rejects.toThrow();
  });
});

describe("Product pricing integrity", () => {
  const EXPECTED_PRICES = [
    { productId: "main" as const, amount: "5.00" },
    { productId: "oto1" as const, amount: "17.00" },
    { productId: "oto2" as const, amount: "27.00" },
  ];

  EXPECTED_PRICES.forEach(({ productId, amount }) => {
    it(`${productId} costs $${amount}`, async () => {
      const result = await caller.orders.create({
        sessionId: `test-price-${productId}`,
        productId,
      });
      expect(result.amount).toBe(amount);
    });
  });

  it("rejects oto3 as invalid product (removed)", async () => {
    await expect(
      caller.orders.create({
        sessionId: "test-oto3-removed",
        productId: "oto3" as any,
      })
    ).rejects.toThrow();
  });
});
