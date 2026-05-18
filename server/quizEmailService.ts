// Quiz Result Email Service
// Sends personalized email immediately after quiz completion with:
// - Chronotype result + personalized insights
// - Immediate $5 offer (tripwire)
// - Social proof + urgency
// - 7-day follow-up sequence trigger

import { getPersonaById } from "../shared/personas";

const BREVO_API_URL = "https://api.brevo.com/v3";
const SENDER = { name: "Deep Sleep Reset", email: "support@deep-sleep-reset.com" };

const CHRONOTYPE_INFO: Record<string, { emoji: string; title: string; traits: string; bestTime: string }> = {
  lion: {
    emoji: "🦁",
    title: "Lion Chronotype",
    traits: "Early riser, high energy, natural leader. You're at your best in the morning.",
    bestTime: "5-7 AM wake time optimal",
  },
  bear: {
    emoji: "🐻",
    title: "Bear Chronotype",
    traits: "Balanced sleeper, social, follows the sun. You're most productive mid-morning.",
    bestTime: "7-9 AM wake time optimal",
  },
  wolf: {
    emoji: "🐺",
    title: "Wolf Chronotype",
    traits: "Night owl, creative, independent. You hit your stride in the evening.",
    bestTime: "8-10 AM wake time optimal",
  },
  dolphin: {
    emoji: "🐬",
    title: "Dolphin Chronotype",
    traits: "Light sleeper, sensitive, perfectionist. You need consistency and calm.",
    bestTime: "6-8 AM wake time optimal",
  },
};

async function brevoRequest(endpoint: string, body: object): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[Quiz Email] BREVO_API_KEY not set — skipping email");
    return false;
  }

  try {
    const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Quiz Email] Brevo API error ${response.status}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Quiz Email] Network error:", err);
    return false;
  }
}

// ─── Quiz Result Email (Immediate) ───────────────────────────────────────────
export async function sendQuizResultEmail({
  email,
  name,
  chronotype,
  personaId,
}: {
  email: string;
  name?: string;
  chronotype: string;
  personaId?: string;
}): Promise<boolean> {
  const chronoInfo = CHRONOTYPE_INFO[chronotype] || CHRONOTYPE_INFO.bear;
  const displayName = name || "there";
  const baseUrl = "https://deep-sleep-reset.com";

  // Get persona
  const persona = personaId ? getPersonaById(personaId as any) : null;
  const senderName = persona ? `${persona.name} — Deep Sleep Reset` : "Deep Sleep Reset";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #0b1120; color: #e0e0e0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #0b1120; }
    .header { background: linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #3d2a5c; }
    .header h1 { margin: 0; font-size: 28px; color: #c9a84c; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 14px; color: #a0a0a0; }
    .content { padding: 40px 20px; }
    .result-box { background: #1a1f3a; border: 1px solid #3d2a5c; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .result-emoji { font-size: 48px; margin-bottom: 12px; }
    .result-title { font-size: 24px; color: #c9a84c; font-weight: 700; margin: 0 0 12px; }
    .result-traits { font-size: 14px; color: #b0b0b0; margin: 0 0 12px; line-height: 1.6; }
    .result-time { font-size: 13px; color: #7fb3d5; background: #0d0b1a; padding: 12px; border-radius: 8px; margin: 0; }
    .offer-box { background: linear-gradient(135deg, #c9a84c15 0%, #7c3aed15 100%); border: 2px solid #c9a84c; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .offer-price { font-size: 36px; color: #c9a84c; font-weight: 700; margin: 0; }
    .offer-desc { font-size: 14px; color: #e0e0e0; margin: 8px 0; }
    .offer-cta { display: inline-block; background: linear-gradient(135deg, #c9a84c, #b8941a); color: #0b1120; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 16px; }
    .offer-cta:hover { opacity: 0.9; }
    .urgency { font-size: 12px; color: #ff6b6b; font-weight: 700; margin-top: 12px; }
    .social-proof { background: #1a1f3a; border-left: 3px solid #7c3aed; padding: 16px; margin: 24px 0; border-radius: 8px; }
    .social-proof p { margin: 0; font-size: 13px; color: #b0b0b0; }
    .social-proof strong { color: #c9a84c; }
    .footer { background: #0d0b1a; padding: 20px; text-align: center; border-top: 1px solid #3d2a5c; font-size: 12px; color: #6b5f8a; }
    .footer a { color: #7c3aed; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Sleep Profile Unlocked ${chronoInfo.emoji}</h1>
      <p>Personalized insights based on your chronotype</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; color: #e0e0e0; margin: 0 0 24px;">Hi ${displayName},</p>

      <p style="font-size: 14px; color: #b0b0b0; margin: 0 0 24px; line-height: 1.6;">
        Thank you for completing the Deep Sleep Assessment. Your answers reveal your unique sleep chronotype — the biological rhythm that determines your natural sleep-wake cycle.
      </p>

      <div class="result-box">
        <div class="result-emoji">${chronoInfo.emoji}</div>
        <h2 class="result-title">${chronoInfo.title}</h2>
        <p class="result-traits">${chronoInfo.traits}</p>
        <p class="result-time">⏰ ${chronoInfo.bestTime}</p>
      </div>

      <p style="font-size: 14px; color: #b0b0b0; margin: 24px 0; line-height: 1.6;">
        Your chronotype is the key to fixing insomnia. Most people fail because they fight their biology. The 7-Night Deep Sleep Reset is specifically designed to align your habits with your natural rhythm.
      </p>

      <div class="offer-box">
        <p style="font-size: 13px; color: #a0a0a0; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Limited Time Offer</p>
        <p class="offer-price">$5</p>
        <p class="offer-desc">7-Night Deep Sleep Reset + Chronotype Mastery Guide</p>
        <p style="font-size: 12px; color: #b0b0b0; margin: 8px 0;">Regular price: $47 (89% off today only)</p>
        <a href="${baseUrl}?utm_source=quiz_email&utm_medium=email&utm_campaign=quiz_result" class="offer-cta">Get Instant Access Now</a>
        <p class="urgency">⚡ Only valid for the next 48 hours</p>
      </div>

      <div class="social-proof">
        <p>✓ <strong>4.9★ rating</strong> from 12,847+ users</p>
        <p>✓ <strong>80% success rate</strong> using CBT-I protocol</p>
        <p>✓ <strong>30-day money-back guarantee</strong> — sleep better or pay nothing</p>
      </div>

      <p style="font-size: 13px; color: #b0b0b0; margin: 24px 0; line-height: 1.6;">
        <strong>What's included:</strong><br>
        • 7-night protocol (15 min/day)<br>
        • Personalized sleep schedule for your ${chronoInfo.title.toLowerCase()}<br>
        • Audio sleep stories (ASMR)<br>
        • Bonus: 30-day sleep tracking template
      </p>

      <p style="font-size: 13px; color: #b0b0b0; margin: 24px 0; line-height: 1.6;">
        Over the next week, I'll send you daily tips tailored to your ${chronoInfo.title.toLowerCase()}. But if you want the complete system today, grab it now at the special price.
      </p>

      <p style="font-size: 13px; color: #b0b0b0; margin: 24px 0;">
        Sleep better,<br>
        <strong>${senderName}</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px;">© 2026 Deep Sleep Reset. All rights reserved.</p>
      <p style="margin: 0;"><a href="${baseUrl}/privacy">Privacy Policy</a> • <a href="${baseUrl}/terms">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return brevoRequest("/smtp/email", {
    sender: { name: senderName, email: SENDER.email },
    to: [{ email, name: displayName }],
    subject: `${chronoInfo.emoji} Your ${chronoInfo.title} Profile + $5 Offer Inside`,
    htmlContent,
    replyTo: { email: SENDER.email, name: senderName },
  });
}

// ─── Add to Brevo Contact List ───────────────────────────────────────────────
export async function addQuizContactToBrevo({
  email,
  name,
  chronotype,
}: {
  email: string;
  name?: string;
  chronotype: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name || "",
          CHRONOTYPE: chronotype,
          SOURCE: "quiz_result",
        },
        listIds: [3], // Quiz completers list
        updateEnabled: true,
      }),
    });

    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}
