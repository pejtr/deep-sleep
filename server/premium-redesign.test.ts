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

describe("Gumroad URL — uses deepsleepreset.gumroad.com", () => {
  it("main product URL points to deepsleepreset.gumroad.com", async () => {
    const result = await caller.orders.create({
      sessionId: "test-url-main",
      productId: "main",
      chronotype: "Bear",
    });
    expect(result.gumroadUrl).toBe("https://deepsleepreset.gumroad.com/l/fdtifc");
  });

  it("OTO1 product URL points to deepsleepreset.gumroad.com", async () => {
    const result = await caller.orders.create({
      sessionId: "test-url-oto1",
      productId: "oto1",
    });
    expect(result.gumroadUrl).toBe("https://deepsleepreset.gumroad.com/l/ttrsd");
  });

  it("OTO2 product URL points to deepsleepreset.gumroad.com", async () => {
    const result = await caller.orders.create({
      sessionId: "test-url-oto2",
      productId: "oto2",
    });
    expect(result.gumroadUrl).toBe("https://deepsleepreset.gumroad.com/l/cuhln");
  });

  it("OTO3 product URL points to deepsleepreset.gumroad.com", async () => {
    const result = await caller.orders.create({
      sessionId: "test-url-oto3",
      productId: "oto3",
    });
    expect(result.gumroadUrl).toBe("https://deepsleepreset.gumroad.com/l/ubsxk");
  });
});

describe("Quiz — accepts 5-answer array (from 8-question frontend)", () => {
  it("accepts exactly 5 answers and returns valid chronotype", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-8q-quiz",
      answers: [0, 1, 2, 1, 0],
    });
    expect(["Lion", "Bear", "Wolf", "Dolphin"]).toContain(result.chronotype);
  });

  it("rejects fewer than 5 answers", async () => {
    await expect(
      caller.quiz.submit({
        sessionId: "test-short",
        answers: [0, 1, 2],
      })
    ).rejects.toThrow();
  });

  it("rejects more than 5 answers", async () => {
    await expect(
      caller.quiz.submit({
        sessionId: "test-long",
        answers: [0, 1, 2, 1, 0, 3],
      })
    ).rejects.toThrow();
  });
});

describe("Product pricing integrity", () => {
  const EXPECTED_PRICES = [
    { productId: "main" as const, amount: "5.00" },
    { productId: "oto1" as const, amount: "7.00" },
    { productId: "oto2" as const, amount: "17.00" },
    { productId: "oto3" as const, amount: "27.00" },
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
});
