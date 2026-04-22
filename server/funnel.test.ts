import { describe, expect, it, vi, beforeEach } from "vitest";
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

describe("quiz.submit — chronotype scoring", () => {
  it("returns Lion for all-early answers", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-lion",
      answers: [0, 0, 0, 0, 0],
    });
    expect(result.chronotype).toBe("Lion");
  });

  it("returns Bear for all-mid answers", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-bear",
      answers: [1, 1, 1, 1, 1],
    });
    expect(result.chronotype).toBe("Bear");
  });

  it("returns Wolf for all-late answers", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-wolf",
      answers: [2, 2, 2, 2, 2],
    });
    expect(result.chronotype).toBe("Wolf");
  });

  it("returns Dolphin for all-irregular answers", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-dolphin",
      answers: [3, 3, 3, 3, 3],
    });
    expect(result.chronotype).toBe("Dolphin");
  });

  it("returns a valid chronotype for mixed answers", async () => {
    const result = await caller.quiz.submit({
      sessionId: "test-mixed",
      answers: [0, 1, 2, 1, 0],
    });
    expect(["Lion", "Bear", "Wolf", "Dolphin"]).toContain(result.chronotype);
  });
});

describe("orders.create — product prices", () => {
  it("returns $5 gumroad URL for main product", async () => {
    const result = await caller.orders.create({
      sessionId: "test-order-main",
      productId: "main",
      chronotype: "Bear",
    });
    expect(result.amount).toBe("5.00");
    expect(result.gumroadUrl).toContain("gumroad.com");
  });

  it("returns $7 for OTO1", async () => {
    const result = await caller.orders.create({
      sessionId: "test-oto1",
      productId: "oto1",
    });
    expect(result.amount).toBe("7.00");
  });

  it("returns $17 for OTO2", async () => {
    const result = await caller.orders.create({
      sessionId: "test-oto2",
      productId: "oto2",
    });
    expect(result.amount).toBe("17.00");
  });

  it("returns $27 for OTO3", async () => {
    const result = await caller.orders.create({
      sessionId: "test-oto3",
      productId: "oto3",
    });
    expect(result.amount).toBe("27.00");
  });
});

describe("leads.capture", () => {
  it("accepts valid email", async () => {
    const result = await caller.leads.capture({
      email: "test@example.com",
      sessionId: "test-lead",
      chronotype: "Wolf",
      source: "quiz_result",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    await expect(
      caller.leads.capture({ email: "not-an-email", sessionId: "test-bad" })
    ).rejects.toThrow();
  });
});

describe("behavior.track", () => {
  it("tracks a page view event", async () => {
    const result = await caller.behavior.track({
      sessionId: "test-behavior",
      event: "page_view",
      page: "home",
      value: "variant_A",
    });
    expect(result.success).toBe(true);
  });

  it("tracks a CTA click with chronotype", async () => {
    const result = await caller.behavior.track({
      sessionId: "test-behavior-2",
      event: "cta_click",
      page: "order",
      element: "main_cta",
      chronotype: "Lion",
    });
    expect(result.success).toBe(true);
  });
});

describe("abTest.track", () => {
  it("tracks an A/B impression", async () => {
    const result = await caller.abTest.track({
      sessionId: "test-ab",
      testName: "headline",
      variant: "B",
      page: "home",
    });
    expect(result.success).toBe(true);
  });
});
