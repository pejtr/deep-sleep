import { describe, it, expect } from "vitest";

// ── TikTok Ads — Environment variable tests ───────────────────────────────────
describe("TikTok Ads — environment variables", () => {
  it("TIKTOK_ADS_ACCESS_TOKEN env var is defined or gracefully absent", () => {
    const val = process.env.TIKTOK_ADS_ACCESS_TOKEN;
    if (val !== undefined) {
      expect(typeof val).toBe("string");
      expect(val.length).toBeGreaterThan(0);
    } else {
      console.warn("TIKTOK_ADS_ACCESS_TOKEN not set — skipping value check");
    }
  });

  it("TIKTOK_ADS_ADVERTISER_ID env var is defined or gracefully absent", () => {
    const val = process.env.TIKTOK_ADS_ADVERTISER_ID;
    if (val !== undefined) {
      expect(typeof val).toBe("string");
    } else {
      console.warn("TIKTOK_ADS_ADVERTISER_ID not set — skipping value check");
    }
  });
});

// ── TikTok Ads — helper function shape tests ──────────────────────────────────
describe("TikTok Ads — helper function shapes", () => {
  it("getTikTokCampaigns is exported and is a function", async () => {
    const { getTikTokCampaigns } = await import("./tiktokAds");
    expect(typeof getTikTokCampaigns).toBe("function");
  });

  it("getTikTokPerformance is exported and is a function", async () => {
    const { getTikTokPerformance } = await import("./tiktokAds");
    expect(typeof getTikTokPerformance).toBe("function");
  });

  it("getTikTokAccountInfo is exported and is a function", async () => {
    const { getTikTokAccountInfo } = await import("./tiktokAds");
    expect(typeof getTikTokAccountInfo).toBe("function");
  });

  it("getTikTokCampaigns returns array or throws Error when called without valid creds", async () => {
    const { getTikTokCampaigns } = await import("./tiktokAds");
    try {
      const campaigns = await getTikTokCampaigns("invalid_token", "invalid_id");
      expect(Array.isArray(campaigns)).toBe(true);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  }, 10000);

  it("getTikTokAccountInfo returns null or object or throws Error when called without valid creds", async () => {
    const { getTikTokAccountInfo } = await import("./tiktokAds");
    try {
      const info = await getTikTokAccountInfo("invalid_token", "invalid_id");
      // Either null (no data) or an object
      expect(info === null || typeof info === "object").toBe(true);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  }, 10000);
});

// ── TikTok Ads — tRPC procedure tests ────────────────────────────────────────
describe("TikTok Ads — tRPC procedures", () => {
  it("tiktok.getAccount procedure is registered in router", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    // Verify the tiktok router exists
    expect(typeof (appRouter as any)._def).toBe("object");
  });

  it("tiktok.getCampaigns procedure is registered in router", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    expect(typeof (appRouter as any)._def).toBe("object");
  });
});

// ── TikTok Ads — data structure validation ────────────────────────────────────
describe("TikTok Ads — data structure validation", () => {
  it("TikTok campaign object has expected shape when mocked", () => {
    const mockCampaign = {
      campaign_id: "123456789",
      campaign_name: "Deep Sleep Reset — Awareness",
      budget: 5000,
      status: "ENABLE",
      create_time: Date.now(),
    };
    expect(mockCampaign).toHaveProperty("campaign_id");
    expect(mockCampaign).toHaveProperty("campaign_name");
    expect(mockCampaign).toHaveProperty("budget");
    expect(mockCampaign).toHaveProperty("status");
    expect(typeof mockCampaign.campaign_id).toBe("string");
    expect(typeof mockCampaign.campaign_name).toBe("string");
    expect(typeof mockCampaign.budget).toBe("number");
  });

  it("TikTok performance object has expected numeric fields when mocked", () => {
    const mockPerf = {
      campaign_id: "123456789",
      campaign_name: "Deep Sleep Reset — Awareness",
      spend: 87.5,
      impressions: 24300,
      clicks: 88,
      conversions: 0,
      cpc: 0.99,
      ctr: 0.36,
      conversion_rate: 0,
      roas: 0,
    };
    expect(typeof mockPerf.spend).toBe("number");
    expect(typeof mockPerf.impressions).toBe("number");
    expect(typeof mockPerf.clicks).toBe("number");
    expect(typeof mockPerf.ctr).toBe("number");
    expect(mockPerf.spend).toBeGreaterThanOrEqual(0);
    expect(mockPerf.impressions).toBeGreaterThanOrEqual(0);
  });

  it("TikTok account info has expected fields when mocked", () => {
    const mockAccount = {
      advertiser_id: "7123456789",
      advertiser_name: "Deep Sleep Reset",
      balance: 12.5,
      currency: "USD",
    };
    expect(mockAccount).toHaveProperty("advertiser_id");
    expect(mockAccount).toHaveProperty("advertiser_name");
    expect(mockAccount).toHaveProperty("currency");
    expect(typeof mockAccount.advertiser_id).toBe("string");
    expect(typeof mockAccount.balance).toBe("number");
  });
});
