/**
 * Nightly AI Optimization Job
 * Runs at midnight UTC — analyzes all behavior/feedback/order data,
 * generates AI recommendations, saves to ai_insights table, notifies admin.
 */
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import { getAdminStats } from "../db";
import { getDb } from "../db";
import { aiInsights, behaviorEvents, feedbacks } from "../../drizzle/schema";
import { desc, gte } from "drizzle-orm";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]!;
}

function getMidnightUTC(): Date {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight;
}

// ── Main optimization function ────────────────────────────────────────────────
export async function runNightlyOptimization(): Promise<void> {
  console.log("[NightlyOptimization] Starting analysis...");
  const date = getTodayDateString();

  try {
    // 1. Gather all metrics
    const stats = await getAdminStats();
    const db = await getDb();

    // Get behavior event breakdown (last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBehavior = db
      ? await db.select().from(behaviorEvents).where(gte(behaviorEvents.createdAt, yesterday)).catch(() => [])
      : [];

    // Get recent feedbacks
    const recentFeedbacks = db
      ? await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt)).limit(20).catch(() => [])
      : [];

    // Analyze behavior events
    const eventCounts: Record<string, number> = {};
    const scrollDepths: number[] = [];
    const timeOnPage: number[] = [];
    const exitIntents: number[] = [];
    const rageclicks: number[] = [];
    const deviceTypes: Record<string, number> = {};

    for (const event of recentBehavior) {
      eventCounts[event.event] = (eventCounts[event.event] ?? 0) + 1;
      if (event.event === "scroll_depth" && event.value) {
        try {
          const v = JSON.parse(event.value);
          if (v.percent) scrollDepths.push(v.percent);
        } catch {}
      }
      if (event.event === "time_on_page" && event.value) {
        try {
          const v = JSON.parse(event.value);
          if (v.seconds) timeOnPage.push(v.seconds);
        } catch {}
      }
      if (event.event === "exit_intent") exitIntents.push(1);
      if (event.event === "rage_click") rageclicks.push(1);
      if (event.event === "page_view" && event.value) {
        try {
          const v = JSON.parse(event.value);
          if (v.device) deviceTypes[v.device] = (deviceTypes[v.device] ?? 0) + 1;
        } catch {}
      }
    }

    const avgScrollDepth = scrollDepths.length > 0 ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length) : 0;
    const avgTimeOnPage = timeOnPage.length > 0 ? Math.round(timeOnPage.reduce((a, b) => a + b, 0) / timeOnPage.length) : 0;
    const conversionRate = stats.quizCount > 0 ? ((stats.orderCount / stats.quizCount) * 100).toFixed(1) : "0";
    const leadConversionRate = stats.quizCount > 0 ? ((stats.leadCount / stats.quizCount) * 100).toFixed(1) : "0";

    // 2. Build metrics snapshot
    const metricsSnapshot = {
      date,
      revenue: stats.revenue,
      orders: stats.orderCount,
      leads: stats.leadCount,
      quizStarts: stats.quizCount,
      conversionRate: `${conversionRate}%`,
      leadConversionRate: `${leadConversionRate}%`,
      avgRating: stats.avgRating,
      feedbacks: stats.feedbackCount,
      behaviorEvents24h: recentBehavior.length,
      avgScrollDepth: `${avgScrollDepth}%`,
      avgTimeOnPage: `${avgTimeOnPage}s`,
      exitIntents: exitIntents.length,
      rageClicks: rageclicks.length,
      deviceBreakdown: deviceTypes,
      topBehaviorEvents: Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([event, count]) => ({ event, count })),
    };

    // 3. Prepare feedback summary
    const feedbackSummary = recentFeedbacks.slice(0, 5).map(f => ({
      rating: f.rating,
      liked: f.liked?.slice(0, 100),
      improved: f.improved?.slice(0, 100),
    }));

    // 4. Call AI for analysis and recommendations
    const prompt = `You are a performance marketing AI analyst for "Deep Sleep Reset" — a $4 sleep guide sold via Gumroad.

DAILY METRICS (${date}):
- Revenue: $${stats.revenue.toFixed(2)} | Orders: ${stats.orderCount} | Leads: ${stats.leadCount}
- Quiz starts: ${stats.quizCount} | Conversion rate: ${conversionRate}% | Lead rate: ${leadConversionRate}%
- Avg rating: ${stats.avgRating}/5 | Feedbacks: ${stats.feedbackCount}
- Behavior events (24h): ${recentBehavior.length}
- Avg scroll depth: ${avgScrollDepth}% | Avg time on page: ${avgTimeOnPage}s
- Exit intents: ${exitIntents.length} | Rage clicks: ${rageclicks.length}
- Device breakdown: ${JSON.stringify(deviceTypes)}

RECENT FEEDBACK (last 5):
${feedbackSummary.map(f => `- ${f.rating}★: liked="${f.liked ?? "—"}" | improve="${f.improved ?? "—"}"`).join("\n")}

Analyze this data and provide:
1. A concise executive summary (2-3 sentences) of today's performance
2. Top 5 specific, actionable recommendations to increase conversions and revenue
3. Identify the biggest opportunity and biggest risk

Focus on: conversion rate optimization, copy improvements, targeting, pricing, funnel leaks.
Use Hormozi-style thinking: maximize value delivery, reduce friction, increase perceived value.

Respond in JSON format:
{
  "summary": "string",
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
  "biggestOpportunity": "string",
  "biggestRisk": "string"
}`;

    const llmResponse = await invokeLLM({
      messages: [
        { role: "system", content: "You are a performance marketing AI analyst. Always respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "optimization_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              recommendations: { type: "array", items: { type: "string" } },
              biggestOpportunity: { type: "string" },
              biggestRisk: { type: "string" },
            },
            required: ["summary", "recommendations", "biggestOpportunity", "biggestRisk"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = llmResponse.choices?.[0]?.message?.content;
    let analysis = {
      summary: "Analysis unavailable",
      recommendations: ["Check data manually"],
      biggestOpportunity: "—",
      biggestRisk: "—",
    };

    if (typeof rawContent === "string") {
      try {
        analysis = JSON.parse(rawContent);
      } catch {
        analysis.summary = rawContent.slice(0, 500);
      }
    }

    // 5. Save to ai_insights table
    if (db) {
      await db.insert(aiInsights).values({
        date,
        summary: analysis.summary,
        recommendations: JSON.stringify(analysis.recommendations),
        metrics: JSON.stringify(metricsSnapshot),
        applied: false,
      }).catch(e => console.error("[NightlyOptimization] Failed to save insights:", e));
    }

    // 6. Notify admin
    const notificationContent = `📊 **Daily Performance Report — ${date}**

**Revenue:** $${stats.revenue.toFixed(2)} | **Orders:** ${stats.orderCount} | **Conversion:** ${conversionRate}%
**Leads:** ${stats.leadCount} | **Quiz starts:** ${stats.quizCount} | **Avg rating:** ${stats.avgRating}/5

**AI Summary:**
${analysis.summary}

**Top Recommendations:**
${analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

**Biggest Opportunity:** ${analysis.biggestOpportunity}
**Biggest Risk:** ${analysis.biggestRisk}

**Behavior (24h):** ${recentBehavior.length} events | Avg scroll: ${avgScrollDepth}% | Avg time: ${avgTimeOnPage}s | Exit intents: ${exitIntents.length}`;

    const notified = await notifyOwner({
      title: `🌙 Deep Sleep Reset — Daily AI Report (${date})`,
      content: notificationContent,
    }).catch(() => false);

    console.log(`[NightlyOptimization] Complete. Notified: ${notified}. Insights saved for ${date}.`);
  } catch (error) {
    console.error("[NightlyOptimization] Error:", error);
    // Don't throw — we don't want to crash the server
  }
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
export function scheduleNightlyOptimization(): void {
  function scheduleNext() {
    const now = new Date();
    const midnight = getMidnightUTC();
    const msUntilMidnight = midnight.getTime() - now.getTime();
    console.log(`[NightlyOptimization] Scheduled for ${midnight.toISOString()} (in ${Math.round(msUntilMidnight / 60000)} minutes)`);
    setTimeout(async () => {
      await runNightlyOptimization();
      scheduleNext(); // Schedule next midnight
    }, msUntilMidnight);
  }
  scheduleNext();
}
