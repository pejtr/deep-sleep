/**
 * Reddit Ads API v3 helper
 * Uses OAuth2 Authorization Code flow with refresh token
 * Docs: https://ads-api.reddit.com/docs/v3/
 */

const REDDIT_ADS_BASE = "https://ads-api.reddit.com/api/v3";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_ADS_CLIENT_ID;
  const clientSecret = process.env.REDDIT_ADS_CLIENT_SECRET;
  const refreshToken = process.env.REDDIT_ADS_REFRESH_TOKEN;
  const username = process.env.REDDIT_ADS_USERNAME;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Reddit Ads OAuth credentials not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `DeepSleepReset/1.0 by ${username || "DeepSleeper"}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit OAuth2 refresh failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  // Try to use stored access token first (from initial OAuth)
  const storedToken = process.env.REDDIT_ADS_ACCESS_TOKEN;
  if (storedToken) {
    cachedToken = {
      token: storedToken,
      expiresAt: Date.now() + 86400 * 1000, // 24h
    };
    return storedToken;
  }

  // Fall back to refresh token to get new access token
  return refreshAccessToken();
}

async function redditAdsRequest<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`${REDDIT_ADS_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const username = process.env.REDDIT_ADS_USERNAME;
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": `DeepSleepReset/1.0 by ${username || "DeepSleeper"}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit Ads API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export interface RedditCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_at: string;
  updated_at: string;
}

export interface RedditReportRow {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  ecpm: number;
  cpc: number;
}

export interface RedditAccountInfo {
  id: string;
  name: string;
  currency: string;
  status: string;
}

/**
 * Get ad account info
 */
export async function getAdAccount(): Promise<RedditAccountInfo> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  const data = await redditAdsRequest<{ data: RedditAccountInfo }>(
    `/ad_accounts/${accountId}`
  );
  return data.data;
}

/**
 * List all campaigns for the account
 */
export async function getCampaigns(): Promise<RedditCampaign[]> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  const data = await redditAdsRequest<{ data: { results: RedditCampaign[] } }>(
    `/ad_accounts/${accountId}/campaigns`
  );
  return data.data?.results ?? [];
}

/**
 * Get campaign performance report
 * Returns daily breakdown of impressions, clicks, CTR, spend, eCPM, CPC
 */
export async function getCampaignReport(
  startDate: string,
  endDate: string,
  campaignIds?: string[]
): Promise<RedditReportRow[]> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  // Build report request body
  const reportBody: Record<string, unknown> = {
    start_time: startDate,
    end_time: endDate,
    granularity: "DAY",
    fields: ["impressions", "clicks", "ctr", "spend", "ecpm", "cpc"],
    breakdowns: [],
  };

  if (campaignIds && campaignIds.length > 0) {
    reportBody.campaign_ids = campaignIds;
  }

  const token = await getAccessToken();
  const username = process.env.REDDIT_ADS_USERNAME;

  const response = await fetch(
    `${REDDIT_ADS_BASE}/ad_accounts/${accountId}/reports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": `DeepSleepReset/1.0 by ${username || "DeepSleeper"}`,
      },
      body: JSON.stringify(reportBody),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit Ads Report error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    data?: { results?: Array<{ date: string; metrics: Record<string, number> }> };
  };

  const results = data.data?.results ?? [];
  return results.map((row) => ({
    date: row.date,
    impressions: row.metrics?.impressions ?? 0,
    clicks: row.metrics?.clicks ?? 0,
    ctr: row.metrics?.ctr ?? 0,
    spend: row.metrics?.spend ?? 0,
    ecpm: row.metrics?.ecpm ?? 0,
    cpc: row.metrics?.cpc ?? 0,
  }));
}

/**
 * Get summary totals for a date range
 */
export async function getCampaignSummary(
  startDate: string,
  endDate: string
): Promise<{
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  avgCtr: number;
  avgCpc: number;
  avgEcpm: number;
  days: RedditReportRow[];
}> {
  const days = await getCampaignReport(startDate, endDate);

  const totals = days.reduce(
    (acc, row) => ({
      totalImpressions: acc.totalImpressions + row.impressions,
      totalClicks: acc.totalClicks + row.clicks,
      totalSpend: acc.totalSpend + row.spend,
    }),
    { totalImpressions: 0, totalClicks: 0, totalSpend: 0 }
  );

  const avgCtr =
    totals.totalImpressions > 0
      ? (totals.totalClicks / totals.totalImpressions) * 100
      : 0;
  const avgCpc =
    totals.totalClicks > 0 ? totals.totalSpend / totals.totalClicks : 0;
  const avgEcpm =
    totals.totalImpressions > 0
      ? (totals.totalSpend / totals.totalImpressions) * 1000
      : 0;

  return {
    ...totals,
    avgCtr,
    avgCpc,
    avgEcpm,
    days,
  };
}


// -- Per-campaign performance --

export interface CampaignPerformance {
  id: string;
  name: string;
  status: string;
  objective: string;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  cpc: number;
  ecpm: number;
  score: number;
  rank: "top" | "mid" | "low";
}

/**
 * Get per-campaign performance metrics for a date range.
 * Fetches campaigns list + report with campaign_id breakdown, then merges.
 */
export async function getCampaignPerformance(
  startDate: string,
  endDate: string
): Promise<CampaignPerformance[]> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  const campaigns = await getCampaigns();
  if (campaigns.length === 0) return [];

  const token = await getAccessToken();
  const username = process.env.REDDIT_ADS_USERNAME;

  const reportBody = {
    start_time: startDate,
    end_time: endDate,
    granularity: "TOTAL",
    fields: ["impressions", "clicks", "ctr", "spend", "ecpm", "cpc"],
    breakdowns: ["campaign_id"],
  };

  const response = await fetch(
    `${REDDIT_ADS_BASE}/ad_accounts/${accountId}/reports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": `DeepSleepReset/1.0 by ${username || "DeepSleeper"}`,
      },
      body: JSON.stringify(reportBody),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit Ads per-campaign report error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as {
    data?: {
      results?: Array<{
        campaign_id?: string;
        metrics?: Record<string, number>;
      }>;
    };
  };

  const results = data.data?.results ?? [];
  const metricsMap = new Map<string, Record<string, number>>();
  for (const row of results) {
    if (row.campaign_id) {
      metricsMap.set(row.campaign_id, row.metrics ?? {});
    }
  }

  const merged: CampaignPerformance[] = campaigns.map((c) => {
    const m = metricsMap.get(c.id) ?? {};
    const impressions = m.impressions ?? 0;
    const clicks = m.clicks ?? 0;
    const spend = m.spend ?? 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : (m.ctr ?? 0);
    const cpc = clicks > 0 ? spend / clicks : (m.cpc ?? 0);
    const ecpm = impressions > 0 ? (spend / impressions) * 1000 : (m.ecpm ?? 0);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      impressions,
      clicks,
      ctr,
      spend,
      cpc,
      ecpm,
      score: 0,
      rank: "mid" as const,
    };
  });

  const maxImpressions = Math.max(...merged.map((c) => c.impressions), 1);
  const maxClicks = Math.max(...merged.map((c) => c.clicks), 1);
  const maxCtr = Math.max(...merged.map((c) => c.ctr), 0.001);
  const activeCpcs = merged.filter((c) => c.cpc > 0).map((c) => c.cpc);
  const minCpc = activeCpcs.length > 0 ? Math.min(...activeCpcs) : 999;

  for (const c of merged) {
    const ctrScore = maxCtr > 0 ? (c.ctr / maxCtr) * 40 : 0;
    const volumeScore =
      (c.impressions / maxImpressions) * 15 + (c.clicks / maxClicks) * 15;
    const efficiencyScore =
      c.cpc > 0 && minCpc > 0 ? (minCpc / c.cpc) * 30 : 0;
    c.score = Math.round(ctrScore + volumeScore + efficiencyScore);
  }

  merged.sort((a, b) => b.score - a.score);
  const n = merged.length;
  merged.forEach((c, i) => {
    if (i < Math.ceil(n / 3)) c.rank = "top";
    else if (i < Math.ceil((2 * n) / 3)) c.rank = "mid";
    else c.rank = "low";
  });

  return merged;
}

// ── Campaign / Ad Set / Ad creation ──────────────────────────────────────────

export interface CreateCampaignInput {
  name: string;
  objective: "TRAFFIC" | "CONVERSIONS" | "VIDEO_VIEWS" | "BRAND_AWARENESS" | "APP_INSTALLS";
  status?: "ACTIVE" | "PAUSED";
}

export interface CreateAdSetInput {
  campaignId: string;
  name: string;
  dailyBudgetCents: number; // in cents, e.g. 1000 = $10.00
  startTime: string; // ISO 8601
  endTime?: string;
  subreddits?: string[]; // e.g. ["insomnia", "sleep", "anxiety"]
  geoLocations?: string[]; // e.g. ["US", "GB", "CA"]
  bidType?: "CPM" | "CPC" | "CPV";
  bidAmountCents?: number;
}

export interface CreateAdInput {
  adSetId: string;
  name: string;
  title: string;
  text: string;
  url: string;
  callToAction?: "LEARN_MORE" | "SHOP_NOW" | "SIGN_UP" | "DOWNLOAD" | "GET_STARTED";
  thumbnailUrl?: string;
}

async function redditAdsPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  const username = process.env.REDDIT_ADS_USERNAME;

  const response = await fetch(`${REDDIT_ADS_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": `DeepSleepReset/1.0 by ${username || "DeepSleeper"}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit Ads API POST error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

async function redditAdsPatch<T>(path: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  const username = process.env.REDDIT_ADS_USERNAME;

  const response = await fetch(`${REDDIT_ADS_BASE}${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": `DeepSleepReset/1.0 by ${username || "DeepSleeper"}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit Ads API PATCH error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Create a new campaign
 */
export async function createCampaign(input: CreateCampaignInput): Promise<RedditCampaign> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  const data = await redditAdsPost<{ data: RedditCampaign }>(
    `/ad_accounts/${accountId}/campaigns`,
    {
      name: input.name,
      objective: input.objective,
      status: input.status ?? "PAUSED", // Start paused for review
    }
  );
  return data.data;
}

export interface RedditAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  daily_budget_cents: number;
  start_time: string;
  end_time?: string;
}

/**
 * Create a new ad set (ad group) within a campaign
 */
export async function createAdSet(input: CreateAdSetInput): Promise<RedditAdSet> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  const body: Record<string, unknown> = {
    name: input.name,
    campaign_id: input.campaignId,
    daily_budget_cents: input.dailyBudgetCents,
    start_time: input.startTime,
    status: "PAUSED",
  };

  if (input.endTime) body.end_time = input.endTime;
  if (input.bidType) body.bid_type = input.bidType;
  if (input.bidAmountCents) body.bid_amount_cents = input.bidAmountCents;

  if (input.subreddits && input.subreddits.length > 0) {
    body.targeting = {
      ...(body.targeting as object ?? {}),
      subreddits: input.subreddits.map(s => ({ name: s })),
    };
  }

  if (input.geoLocations && input.geoLocations.length > 0) {
    body.targeting = {
      ...(body.targeting as object ?? {}),
      locations: input.geoLocations.map(c => ({ country: c })),
    };
  }

  const data = await redditAdsPost<{ data: RedditAdSet }>(
    `/ad_accounts/${accountId}/ad_sets`,
    body
  );
  return data.data;
}

export interface RedditAd {
  id: string;
  name: string;
  ad_set_id: string;
  status: string;
  title: string;
  text: string;
  url: string;
  call_to_action?: string;
}

/**
 * Create a new ad (creative) within an ad set
 */
export async function createAd(input: CreateAdInput): Promise<RedditAd> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  const body: Record<string, unknown> = {
    name: input.name,
    ad_set_id: input.adSetId,
    status: "PAUSED",
    creative: {
      type: "LINK",
      title: input.title,
      text: input.text,
      url: input.url,
      call_to_action: input.callToAction ?? "LEARN_MORE",
    },
  };

  if (input.thumbnailUrl) {
    (body.creative as Record<string, unknown>).thumbnail_url = input.thumbnailUrl;
  }

  const data = await redditAdsPost<{ data: RedditAd }>(
    `/ad_accounts/${accountId}/ads`,
    body
  );
  return data.data;
}

/**
 * Update campaign status (ACTIVE / PAUSED)
 */
export async function updateCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<RedditCampaign> {
  const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
  if (!accountId) throw new Error("REDDIT_ADS_ACCOUNT_ID not set");

  const data = await redditAdsPatch<{ data: RedditCampaign }>(
    `/ad_accounts/${accountId}/campaigns/${campaignId}`,
    { status }
  );
  return data.data;
}

/**
 * Deep Sleep Reset — pre-built campaign templates
 * Ready to launch with one click
 */
export const CAMPAIGN_TEMPLATES = [
  {
    id: "insomnia_traffic",
    name: "Deep Sleep — Insomnia Traffic (Reddit)",
    objective: "TRAFFIC" as const,
    adSetName: "Insomnia Subreddits — Tier 1",
    dailyBudgetCents: 1500, // $15/day
    subreddits: ["insomnia", "sleep", "anxiety", "mentalhealth", "selfimprovement"],
    geoLocations: ["US", "GB", "CA", "AU"],
    adTitle: "Can't Sleep? Your Brain Is Running the Wrong Program",
    adText: "Most insomniacs have the wrong sleep type. Take the 30-second quiz to find yours — free protocol included.",
    callToAction: "LEARN_MORE" as const,
    url: "https://deepsleep.my/quiz?utm_source=reddit&utm_medium=paid&utm_campaign=insomnia_traffic",
  },
  {
    id: "sleep_science",
    name: "Deep Sleep — Sleep Science (Reddit)",
    objective: "TRAFFIC" as const,
    adSetName: "Sleep Science Subreddits — Tier 1",
    dailyBudgetCents: 1000, // $10/day
    subreddits: ["sleep", "sleephackers", "biohacking", "nootropics", "productivity"],
    geoLocations: ["US", "GB", "CA"],
    adTitle: "Your Chronotype Is Ruining Your Sleep",
    adText: "CBT-I based 7-night protocol. No pills. No supplements. Just your biology, finally working for you.",
    callToAction: "LEARN_MORE" as const,
    url: "https://deepsleep.my/quiz?utm_source=reddit&utm_medium=paid&utm_campaign=sleep_science",
  },
  {
    id: "anxiety_sleep",
    name: "Deep Sleep — Anxiety + Sleep (Reddit)",
    objective: "TRAFFIC" as const,
    adSetName: "Anxiety Subreddits — Tier 1",
    dailyBudgetCents: 1200, // $12/day
    subreddits: ["anxiety", "depression", "mentalhealth", "ptsd", "adhd"],
    geoLocations: ["US", "GB", "CA", "AU"],
    adTitle: "3 AM Wake-Ups? This Isn't Anxiety. It's Your Circadian Rhythm.",
    adText: "Free 3 AM Rescue Protocol — 47,000+ people used it last month. Takes 30 seconds.",
    callToAction: "GET_STARTED" as const,
    url: "https://deepsleep.my/squeeze?utm_source=reddit&utm_medium=paid&utm_campaign=anxiety_sleep",
  },
];
