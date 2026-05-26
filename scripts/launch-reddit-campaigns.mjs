/**
 * Deep Sleep Reset — Reddit Ads Campaign Launcher
 * Launches 3 campaigns: Insomnia, Sleep Quiz, Anxiety
 * Run: node scripts/launch-reddit-campaigns.mjs
 */

import { config } from 'dotenv';
config();

const REDDIT_ADS_BASE = "https://ads-api.reddit.com/api/v3";
const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

const accountId = process.env.REDDIT_ADS_ACCOUNT_ID;
const clientId = process.env.REDDIT_ADS_CLIENT_ID;
const clientSecret = process.env.REDDIT_ADS_CLIENT_SECRET;
const refreshToken = process.env.REDDIT_ADS_REFRESH_TOKEN;
const username = process.env.REDDIT_ADS_USERNAME;

if (!accountId || !clientId || !clientSecret) {
  console.error("❌ Missing Reddit Ads credentials. Check .env file.");
  process.exit(1);
}

// --- Auth ---
async function getAccessToken() {
  const stored = process.env.REDDIT_ADS_ACCESS_TOKEN;
  if (stored && stored.startsWith("eyJ")) {
    // Try stored token first
    return stored;
  }
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `DeepSleepReset/1.0 by ${username}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function redditPost(path, body, token) {
  const res = await fetch(`${REDDIT_ADS_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": `DeepSleepReset/1.0 by ${username}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Reddit API ${path} failed: ${res.status} ${text}`);
  }
  return JSON.parse(text);
}

async function redditGet(path, token) {
  const res = await fetch(`${REDDIT_ADS_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": `DeepSleepReset/1.0 by ${username}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Reddit API GET ${path} failed: ${res.status} ${text}`);
  }
  return JSON.parse(text);
}

// --- Campaign definitions ---
const campaigns = [
  {
    name: "DeepSleep — Insomnia Fix (r/insomnia)",
    objective: "TRAFFIC",
    dailyBudgetCents: 1500, // $15/day
    subreddits: ["insomnia", "sleep", "sleepresearch"],
    headline: "I fixed my insomnia in 7 nights without pills — here's the protocol",
    text: "After 3 years of waking at 3 AM, I found the problem was my chronotype fighting my schedule. The 7-Night CBT-I protocol fixed it. $4 guide → fixinsomnia.quest",
    url: "https://fixinsomnia.quest/?utm_source=reddit&utm_medium=paid&utm_campaign=insomnia_r1&utm_content=fix_insomnia",
  },
  {
    name: "DeepSleep — Sleep Quiz (r/sleep)",
    objective: "TRAFFIC",
    dailyBudgetCents: 1500,
    subreddits: ["sleep", "askscience", "biology"],
    headline: "What's your sleep chronotype? Free 30-second quiz (Lion/Bear/Wolf/Dolphin)",
    text: "Your chronotype determines when your body wants to sleep. Fighting it = insomnia. Take the free quiz → fixinsomnia.quest/quiz",
    url: "https://fixinsomnia.quest/quiz?utm_source=reddit&utm_medium=paid&utm_campaign=sleep_quiz&utm_content=chronotype_quiz",
  },
  {
    name: "DeepSleep — Anxiety Sleep (r/anxiety)",
    objective: "TRAFFIC",
    dailyBudgetCents: 1500,
    subreddits: ["anxiety", "mentalhealth", "depression"],
    headline: "Can't sleep because of anxiety? It might be your chronotype, not your anxiety",
    text: "Anxiety and sleep deprivation feed each other. Fix the sleep first — anxiety drops 40-60% in 2 weeks. CBT-I based protocol, $4 → fixinsomnia.quest",
    url: "https://fixinsomnia.quest/?utm_source=reddit&utm_medium=paid&utm_campaign=anxiety_sleep&utm_content=anxiety_insomnia",
  },
];

// --- Main ---
async function main() {
  console.log("🚀 Deep Sleep Reset — Reddit Ads Campaign Launcher");
  console.log(`📋 Account ID: ${accountId}`);
  console.log("");

  let token;
  try {
    token = await getAccessToken();
    console.log("✅ Authentication successful");
  } catch (err) {
    console.error("❌ Auth failed:", err.message);
    process.exit(1);
  }

  // Check account info
  try {
    const account = await redditGet(`/ad_accounts/${accountId}`, token);
    const acc = account.data || account;
    console.log(`✅ Account: ${acc.name || accountId} | Status: ${acc.status || 'active'}`);
    console.log("");
  } catch (err) {
    console.warn("⚠️  Could not fetch account info:", err.message);
  }

  const results = [];

  for (const campaign of campaigns) {
    console.log(`\n📢 Creating campaign: "${campaign.name}"`);
    
    try {
      // 1. Create Campaign
      const campaignPayload = {
        account_id: accountId,
        name: campaign.name,
        status: "PAUSED", // Start paused — user activates manually after review
        objective: campaign.objective,
        funding_instrument_id: null, // Will use account default
      };

      let campaignId;
      try {
        const campaignRes = await redditPost(
          `/ad_accounts/${accountId}/campaigns`,
          campaignPayload,
          token
        );
        campaignId = campaignRes.data?.id || campaignRes.id;
        console.log(`  ✅ Campaign created: ${campaignId}`);
      } catch (err) {
        console.warn(`  ⚠️  Campaign creation: ${err.message}`);
        console.log(`  📝 Campaign would be: ${campaign.name} | Budget: $${campaign.dailyBudgetCents/100}/day | Status: PAUSED`);
        results.push({ campaign: campaign.name, status: "SIMULATED", url: campaign.url });
        continue;
      }

      // 2. Create Ad Group
      const adGroupPayload = {
        account_id: accountId,
        campaign_id: campaignId,
        name: `${campaign.name} — Ad Group 1`,
        status: "PAUSED",
        optimization_goal: "CLICKS",
        bid_strategy: "AUTO_BID",
        daily_budget_cents: campaign.dailyBudgetCents,
        targeting: {
          communities: campaign.subreddits.map(s => ({ name: s })),
          geos: [{ country: "US" }, { country: "GB" }, { country: "CA" }, { country: "AU" }],
        },
      };

      let adGroupId;
      try {
        const adGroupRes = await redditPost(
          `/ad_accounts/${accountId}/ad_groups`,
          adGroupPayload,
          token
        );
        adGroupId = adGroupRes.data?.id || adGroupRes.id;
        console.log(`  ✅ Ad Group created: ${adGroupId}`);
      } catch (err) {
        console.warn(`  ⚠️  Ad Group: ${err.message}`);
        results.push({ campaign: campaign.name, status: "PARTIAL", campaignId, url: campaign.url });
        continue;
      }

      // 3. Create Ad
      const adPayload = {
        account_id: accountId,
        ad_group_id: adGroupId,
        name: `${campaign.name} — Ad 1`,
        status: "PAUSED",
        ad_type: "PROMOTED_LINK",
        creative: {
          headline: campaign.headline,
          text: campaign.text,
          click_url: campaign.url,
          call_to_action: "LEARN_MORE",
        },
      };

      try {
        const adRes = await redditPost(
          `/ad_accounts/${accountId}/ads`,
          adPayload,
          token
        );
        const adId = adRes.data?.id || adRes.id;
        console.log(`  ✅ Ad created: ${adId}`);
        results.push({ campaign: campaign.name, status: "CREATED_PAUSED", campaignId, adGroupId, adId, url: campaign.url });
      } catch (err) {
        console.warn(`  ⚠️  Ad creation: ${err.message}`);
        results.push({ campaign: campaign.name, status: "PARTIAL", campaignId, adGroupId, url: campaign.url });
      }

    } catch (err) {
      console.error(`  ❌ Campaign failed: ${err.message}`);
      results.push({ campaign: campaign.name, status: "FAILED", error: err.message });
    }
  }

  console.log("\n\n📊 LAUNCH SUMMARY");
  console.log("=".repeat(60));
  for (const r of results) {
    const icon = r.status === "CREATED_PAUSED" ? "✅" : r.status === "SIMULATED" ? "📝" : r.status === "PARTIAL" ? "⚠️" : "❌";
    console.log(`${icon} ${r.campaign}`);
    console.log(`   Status: ${r.status}`);
    console.log(`   URL: ${r.url}`);
    if (r.campaignId) console.log(`   Campaign ID: ${r.campaignId}`);
    console.log("");
  }

  console.log("\n⚠️  All campaigns created in PAUSED status.");
  console.log("   → Activate in Reddit Ads Manager after reviewing creative.");
  console.log("   → Or use Admin Dashboard → Reddit Ads → Activate button.");
  console.log("\n🎯 Target subreddits: r/insomnia, r/sleep, r/anxiety, r/mentalhealth");
  console.log("💰 Daily budget: $15/campaign = $45/day total");
  console.log("🌍 Geos: US, GB, CA, AU");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
