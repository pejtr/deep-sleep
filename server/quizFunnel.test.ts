import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://deep-sleep-reset.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("quiz.submit", () => {
  it("returns a valid chronotype for Bear-leaning answers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submit({
      sessionId: "test-funnel-session-001",
      answers: [1, 1, 1, 1, 1], // All Bear answers
      abVariant: "funnel",
    });

    expect(result).toHaveProperty("chronotype");
    expect(["Lion", "Bear", "Wolf", "Dolphin"]).toContain(result.chronotype);
    expect(result.chronotype).toBe("Bear");
  });

  it("returns Lion for all-0 answers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submit({
      sessionId: "test-funnel-session-002",
      answers: [0, 0, 0, 0, 0],
      abVariant: "funnel",
    });

    expect(result.chronotype).toBe("Lion");
  });

  it("returns Wolf for all-2 answers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submit({
      sessionId: "test-funnel-session-003",
      answers: [2, 2, 2, 2, 2],
      abVariant: "funnel",
    });

    expect(result.chronotype).toBe("Wolf");
  });

  it("returns Dolphin for all-3 answers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submit({
      sessionId: "test-funnel-session-004",
      answers: [3, 3, 3, 3, 3],
      abVariant: "funnel",
    });

    expect(result.chronotype).toBe("Dolphin");
  });

  it("handles mixed answers and returns a valid chronotype", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submit({
      sessionId: "test-funnel-session-005",
      answers: [0, 1, 2, 3, 1], // Mixed
      abVariant: "funnel",
    });

    expect(["Lion", "Bear", "Wolf", "Dolphin"]).toContain(result.chronotype);
  });

  it("accepts optional email parameter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submit({
      sessionId: "test-funnel-session-006",
      answers: [1, 1, 1, 1, 1],
      abVariant: "funnel",
      email: "test@example.com",
    });

    expect(result).toHaveProperty("chronotype");
  });
});

describe("leads.capture", () => {
  it("captures a lead with chronotype and source", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.capture({
      email: "funnel-test@example.com",
      sessionId: "test-funnel-session-007",
      chronotype: "Bear",
      source: "quiz_funnel_reddit",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });
});
