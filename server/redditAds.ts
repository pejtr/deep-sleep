/**
 * Reddit Ads API v3 helper
 * Uses OAuth2 client_credentials flow (script app type)
 * Docs: https://ads-api.reddit.com/docs/v3/
 */

const REDDIT_ADS_BASE = "https://ads-api.reddit.com/api/v3";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.REDDIT_ADS_CLIENT_ID;
  const clientSecret = process.env.REDDIT_ADS_CLIENT_SECRET;
  const username = process.env.REDDIT_ADS_USERNAME;

  if (!clientId || !clientSecret) {
    throw new Error("Reddit Ads API credentials not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // Use client_credentials grant (works for script apps without password)
  const body = new URLSearchParams({
    grant_type: "client_credentials",
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
    throw new Error(`Reddit OAuth2 failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
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
