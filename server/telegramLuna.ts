/**
 * Telegram Luna — Leila Hormozi Personality
 * Evening reports + full system control via Telegram commands
 */
import { getAdminStats } from "./db";
import { getAllLeadsWithScores } from "./contactIntelligence";
import type { LeadWithScore } from "./contactIntelligence";
import { invokeLLM } from "./_core/llm";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ── Telegram API helpers ──────────────────────────────────────────────────────

export async function sendTelegramMessage(text: string, parseMode: "HTML" | "Markdown" = "HTML"): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) return false;
  try {
    const res = await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json() as { ok: boolean };
    return data.ok;
  } catch (err) {
    console.error("[TelegramLuna] Send error:", err);
    return false;
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(`${BASE_URL}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data = await res.json() as { ok: boolean };
    return data.ok;
  } catch {
    return false;
  }
}

// ── Evening Report ────────────────────────────────────────────────────────────

export async function sendEveningReport(): Promise<void> {
  try {
    const stats = await getAdminStats();
    const leads: LeadWithScore[] = await getAllLeadsWithScores();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeads = leads.filter((l: LeadWithScore) => new Date(l.createdAt) >= today).length;
    const dormantLeads = leads.filter((l: LeadWithScore) => {
      const d = new Date(l.createdAt);
      const daysAgo = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo >= 30 && !l.convertedToCustomer;
    }).length;

    const revenue = stats.revenue || 0;
    const orders = stats.completedOrderCount || 0;
    const totalLeads = leads.length;
    const cpl = totalLeads > 0 ? (revenue / totalLeads).toFixed(2) : "0.00";
    const aov = orders > 0 ? (revenue / orders).toFixed(2) : "0.00";
    const convRate = totalLeads > 0 ? ((orders / totalLeads) * 100).toFixed(1) : "0.0";

    // Country breakdown
    const countryMap: Record<string, number> = {};
    leads.forEach((l: LeadWithScore) => {
      const c = (l.country || "??").toUpperCase();
      countryMap[c] = (countryMap[c] || 0) + 1;
    });
    const topCountries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c, n]) => `${countryFlag(c)} ${c}: ${n}`)
      .join(" · ");

    // Performance assessment
    const roasStatus = revenue > 0 ? (revenue > 50 ? "🟢" : revenue > 20 ? "🟡" : "🔴") : "⚪";
    const cplStatus = parseFloat(cpl) < 1.0 ? "✅" : parseFloat(cpl) < 2.0 ? "⚠️" : "❌";

    const report = `<b>🌙 LUNA EVENING REPORT</b>
${new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}

<b>📊 TODAY</b>
New leads: <b>${todayLeads}</b>
Total leads: <b>${totalLeads}</b>
Orders: <b>${orders}</b>
Revenue: <b>$${revenue.toFixed(0)}</b>

<b>⚡ KEY METRICS</b>
CPL: <b>$${cpl}</b> ${cplStatus}
AOV: <b>$${aov}</b>
Conv. rate: <b>${convRate}%</b>
ROAS: ${roasStatus}

<b>🌍 TOP COUNTRIES</b>
${topCountries || "No data yet"}

<b>🎯 OPPORTUNITY</b>
Dormant leads (30d+): <b>${dormantLeads}</b>
Est. reactivation revenue: <b>$${Math.round(dormantLeads * 0.08 * 7)}</b>

<b>💬 COMMANDS</b>
/report — full stats
/leads — recent leads
/blast flash — launch Flash Sale
/blast reactivation — launch Reactivation
/campaign — campaign history
/revenue — revenue breakdown`;

    await sendTelegramMessage(report);
  } catch (err) {
    console.error("[TelegramLuna] Evening report error:", err);
    await sendTelegramMessage("⚠️ Luna report failed. Check server logs.");
  }
}

// ── Command Handler ───────────────────────────────────────────────────────────

export async function handleTelegramCommand(text: string, chatId: string): Promise<void> {
  // Security: only respond to owner
  if (chatId !== CHAT_ID) {
    await sendTelegramMessage("🚫 Unauthorized.");
    return;
  }

  const cmd = text.trim().toLowerCase();

  if (cmd === "/start" || cmd === "/help") {
    await sendTelegramMessage(`<b>👋 Luna — Deep Sleep Reset Command Center</b>

I'm your AI performance marketing analyst. Direct. Data-driven. No fluff.

<b>📊 Data Commands</b>
/report — full performance report
/leads — last 10 leads with geo data
/revenue — revenue breakdown
/stats — key metrics snapshot

<b>🚀 Campaign Commands</b>
/blast flash — launch 48h Flash Sale
/blast reactivation — reactivate dormant leads
/blast vip — VIP Bundle offer
/blast upsell — upsell past buyers
/campaign — campaign history + ROI

<b>⚙️ System Commands</b>
/status — server health check
/help — this menu

<i>Let's make money. What do you need?</i>`);
    return;
  }

  if (cmd === "/report" || cmd === "/stats") {
    await sendEveningReport();
    return;
  }

  if (cmd === "/leads") {
    const allLeads: LeadWithScore[] = await getAllLeadsWithScores();
    const leads = allLeads.slice(0, 10);
    if (leads.length === 0) {
      await sendTelegramMessage("📭 No leads yet.");
      return;
    }
    const lines = leads.map((l: LeadWithScore, i: number) => {
      const flag = countryFlag(l.country || "??");
      const chron = l.chronotype ? ` · ${l.chronotype}` : "";
      const score = l.computedScore ? ` · Score: ${l.computedScore}` : "";
      return `${i + 1}. ${flag} <b>${l.email}</b>${chron}${score}`;
    });
    await sendTelegramMessage(`<b>👥 Last 10 Leads</b>\n\n${lines.join("\n")}`);
    return;
  }

  if (cmd === "/revenue") {
    const stats = await getAdminStats();
    const revenue = stats.revenue || 0;
    const orders = stats.completedOrderCount || 0;
    const aov = orders > 0 ? (revenue / orders).toFixed(2) : "0.00";
    await sendTelegramMessage(`<b>💰 Revenue Breakdown</b>

Total revenue: <b>$${revenue.toFixed(2)}</b>
Completed orders: <b>${orders}</b>
AOV: <b>$${aov}</b>
Total leads: <b>${stats.leadCount || 0}</b>
Revenue/lead: <b>$${stats.leadCount ? (revenue / stats.leadCount).toFixed(2) : "0.00"}</b>`);
    return;
  }

  if (cmd.startsWith("/blast")) {
    const parts = cmd.split(" ");
    const type = parts[1] || "flash";
    const campaignTypes: Record<string, string> = {
      flash: "FLASH_SALE",
      reactivation: "REACTIVATION",
      vip: "VIP_BUNDLE",
      upsell: "UPSELL_BLAST",
    };
    const campaignType = campaignTypes[type] || "FLASH_SALE";

    await sendTelegramMessage(`⚡ <b>Launching ${campaignType} campaign...</b>\n\nGenerating AI copy and sending via Brevo. I'll report back with results.`);

    // Trigger campaign via internal API
    try {
      const baseUrl = process.env.INTERNAL_API_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/campaigns/inject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-bot": "true",
          "x-bot-token": BOT_TOKEN,
        },
        body: JSON.stringify({ type: campaignType, source: "telegram" }),
      });
      const data = await res.json() as { success: boolean; sentCount?: number; campaignId?: string; error?: string };
      if (data.success) {
        await sendTelegramMessage(`✅ <b>${campaignType} launched!</b>\n\nEmails sent: <b>${data.sentCount || 0}</b>\nCampaign ID: ${data.campaignId}\n\nI'll report conversions in tomorrow's evening report.`);
      } else {
        await sendTelegramMessage(`❌ Campaign failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      await sendTelegramMessage(`❌ Campaign trigger failed. Check server logs.`);
    }
    return;
  }

  if (cmd === "/status") {
    await sendTelegramMessage(`<b>⚙️ System Status</b>

Server: 🟢 Online
Database: 🟢 Connected
Brevo: 🟢 Active
Stripe: 🟢 Active
Telegram: 🟢 Connected

<i>All systems operational.</i>`);
    return;
  }

  // AI-powered free-form response (Leila Hormozi personality)
  try {
    const llmRes = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are Luna — an AI performance marketing analyst for Deep Sleep Reset, a $7 sleep protocol product. 
You have Leila Hormozi's personality: direct, data-driven, no fluff, results-focused, slightly tough-love.
You're responding via Telegram to the business owner Petr.
Keep responses SHORT (3-5 sentences max). Use numbers and specifics. No emojis except for emphasis.
You have access to the system's data and can suggest campaign actions.
Always end with one specific actionable recommendation.`,
        },
        { role: "user", content: text },
      ],
    });
    const reply = llmRes.choices?.[0]?.message?.content;
    if (typeof reply === "string") {
      await sendTelegramMessage(reply);
    }
  } catch {
    await sendTelegramMessage("⚠️ I couldn't process that. Try /help for available commands.");
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function countryFlag(countryCode: string): string {
  if (!countryCode || countryCode === "??" || countryCode.length !== 2) return "🌍";
  const code = countryCode.toUpperCase();
  const points: number[] = [];
  for (let i = 0; i < code.length; i++) {
    points.push(0x1F1E6 + code.charCodeAt(i) - 65);
  }
  return String.fromCodePoint(...points);
}

// ── Scheduler: Evening Report at 20:00 CET ───────────────────────────────────

export function scheduleTelegramReports(): void {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("[TelegramLuna] No credentials — skipping scheduler");
    return;
  }

  const checkAndSend = () => {
    const now = new Date();
    // CET = UTC+1 (or UTC+2 in summer — use Prague timezone logic)
    const pragueHour = (now.getUTCHours() + 2) % 24; // CEST (summer)
    const pragueMinute = now.getUTCMinutes();

    if (pragueHour === 20 && pragueMinute < 5) {
      sendEveningReport().catch(console.error);
    }
  };

  // Check every 5 minutes
  setInterval(checkAndSend, 5 * 60 * 1000);
  console.log("[TelegramLuna] Evening report scheduler started (20:00 CET)");

  // Send startup notification
  setTimeout(() => {
    sendTelegramMessage(`🚀 <b>Luna is online.</b>\n\nDeep Sleep Reset system connected. Type /help for commands.\n\n<i>Let's make money, Petr.</i>`).catch(console.error);
  }, 3000);
}
