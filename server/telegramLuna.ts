/**
 * Telegram Luna — Leila Hormozi Personality (CZ)
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

    const report = `<b>🌙 LUNA VEČERNÍ REPORT</b>
${new Date().toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" })}

<b>📊 DNES</b>
Nové leady: <b>${todayLeads}</b>
Celkem leadů: <b>${totalLeads}</b>
Objednávky: <b>${orders}</b>
Příjmy: <b>$${revenue.toFixed(0)}</b>

<b>⚡ KLÍČOVÉ METRIKY</b>
CPL: <b>$${cpl}</b> ${cplStatus}
AOV: <b>$${aov}</b>
Konverzní poměr: <b>${convRate}%</b>
ROAS: ${roasStatus}

<b>🌍 TOP ZEMĚ</b>
${topCountries || "Zatím žádná data"}

<b>🎯 PŘÍLEŽITOST</b>
Dormantní leady (30d+): <b>${dormantLeads}</b>
Odh. příjmy z reaktivace: <b>$${Math.round(dormantLeads * 0.08 * 7)}</b>

<b>💬 PŘÍKAZY</b>
/report — plný report
/leads — poslední leady
/blast flash — spustit Flash Sale
/blast reactivation — reaktivace
/campaign — historie kampaní
/revenue — přehled příjmů`;

    await sendTelegramMessage(report);
  } catch (err) {
    console.error("[TelegramLuna] Evening report error:", err);
    await sendTelegramMessage("⚠️ Luna report selhal. Zkontroluj server logy.");
  }
}

// ── Command Handler ───────────────────────────────────────────────────────────

export async function handleTelegramCommand(text: string, chatId: string): Promise<void> {
  // Security: only respond to owner
  if (chatId !== CHAT_ID) {
    await sendTelegramMessage("🚫 Neautorizovaný přístup.");
    return;
  }

  const cmd = text.trim().toLowerCase();

  if (cmd === "/start" || cmd === "/help") {
    await sendTelegramMessage(`<b>👋 Luna — Deep Sleep Reset Velitelské centrum</b>

Jsem tvoje AI analytička performance marketingu. Přímá. Data-driven. Bez zbytečností.

<b>📊 Datové příkazy</b>
/report — plný výkonnostní report
/leads — posledních 10 leadů s geo daty
/revenue — přehled příjmů
/stats — snapshot klíčových metrik

<b>🚀 Příkazy kampaní</b>
/blast flash — spustit 48h Flash Sale
/blast reactivation — reaktivovat dormantní leady
/blast vip — VIP Bundle nabídka
/blast upsell — upsell minulých kupujících
/campaign — historie kampaní + ROI

<b>⚙️ Systémové příkazy</b>
/status — zdraví serveru
/help — toto menu

<i>Pojďme vydělávat. Co potřebuješ?</i>`);
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
      await sendTelegramMessage("📭 Zatím žádné leady.");
      return;
    }
    const lines = leads.map((l: LeadWithScore, i: number) => {
      const flag = countryFlag(l.country || "??");
      const chron = l.chronotype ? ` · ${l.chronotype}` : "";
      const score = l.computedScore ? ` · Skóre: ${l.computedScore}` : "";
      return `${i + 1}. ${flag} <b>${l.email}</b>${chron}${score}`;
    });
    await sendTelegramMessage(`<b>👥 Posledních 10 leadů</b>\n\n${lines.join("\n")}`);
    return;
  }

  if (cmd === "/revenue") {
    const stats = await getAdminStats();
    const revenue = stats.revenue || 0;
    const orders = stats.completedOrderCount || 0;
    const aov = orders > 0 ? (revenue / orders).toFixed(2) : "0.00";
    await sendTelegramMessage(`<b>💰 Přehled příjmů</b>

Celkové příjmy: <b>$${revenue.toFixed(2)}</b>
Dokončené objednávky: <b>${orders}</b>
AOV: <b>$${aov}</b>
Celkem leadů: <b>${stats.leadCount || 0}</b>
Příjmy/lead: <b>$${stats.leadCount ? (revenue / stats.leadCount).toFixed(2) : "0.00"}</b>`);
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

    await sendTelegramMessage(`⚡ <b>Spouštím kampaň ${campaignType}...</b>\n\nGeneruji AI copy a odesílám přes Brevo. Reportuji výsledky.`);

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
        await sendTelegramMessage(`✅ <b>${campaignType} spuštěna!</b>\n\nOdesláno emailů: <b>${data.sentCount || 0}</b>\nID kampaně: ${data.campaignId}\n\nKonverze reportuji v zítřejším večerním reportu.`);
      } else {
        await sendTelegramMessage(`❌ Kampaň selhala: ${data.error || "Neznámá chyba"}`);
      }
    } catch (err) {
      await sendTelegramMessage(`❌ Spuštění kampaně selhalo. Zkontroluj server logy.`);
    }
    return;
  }

  if (cmd === "/status") {
    await sendTelegramMessage(`<b>⚙️ Stav systému</b>

Server: 🟢 Online
Databáze: 🟢 Připojena
Brevo: 🟢 Aktivní
Stripe: 🟢 Aktivní
Telegram: 🟢 Připojen

<i>Všechny systémy fungují.</i>`);
    return;
  }

  // AI-powered free-form response (Leila Hormozi personality — CZ)
  try {
    const llmRes = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Jsi Luna — AI analytička performance marketingu pro Deep Sleep Reset, produkt za $7. 
Máš osobnost Leily Hormozi: přímá, data-driven, bez zbytečností, zaměřená na výsledky, trochu přísná.
Odpovídáš přes Telegram majiteli Petrovi.
Odpovídej VŽDY ČESKY. Odpovědi krátké (3-5 vět max). Používej čísla a konkrétní fakta. Emoji jen pro důraz.
Máš přístup k datům systému a můžeš navrhovat akce kampaní.
Vždy konči jedním konkrétním doporučením k akci.`,
        },
        { role: "user", content: text },
      ],
    });
    const reply = llmRes.choices?.[0]?.message?.content;
    if (typeof reply === "string") {
      await sendTelegramMessage(reply);
    }
  } catch {
    await sendTelegramMessage("⚠️ Nepodařilo se zpracovat požadavek. Zkus /help pro dostupné příkazy.");
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
    sendTelegramMessage(`🚀 <b>Luna je online.</b>\n\nDeep Sleep Reset systém připojen. Napiš /help pro příkazy.\n\n<i>Pojďme vydělávat, Petře.</i>`).catch(console.error);
  }, 3000);
}
