/**
 * Reddit Conversions API (CAPI) — Server-side conversion tracking
 * Uses the CONVERSIONAPIMANUS bearer token for ad-blocker-resistant tracking.
 * Docs: https://ads-api.reddit.com/docs/v3/#tag/Conversions
 */

import crypto from "crypto";

const REDDIT_AD_ACCOUNT_ID = "a2_iw4up15u7778";

/** SHA-256 hash a string (lowercase + trimmed) for privacy-safe matching */
function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

export interface CapiEvent {
  event_type: "Purchase" | "Lead" | "ViewContent" | "PageVisit" | "AddToCart";
  event_at?: string; // ISO 8601 — defaults to now
  click_id?: string; // rdt_cid from URL param
  email?: string;
  external_id?: string;
  ip_address?: string;
  user_agent?: string;
  value?: number;
  currency?: string;
  item_count?: number;
  conversion_id?: string; // dedup key — use orderId or sessionId
}

/**
 * Fire a server-side Reddit Conversions API event.
 * Silently swallows errors — never block the purchase flow.
 */
export async function fireRedditCapi(event: CapiEvent): Promise<void> {
  const token = process.env.REDDIT_CAPI_TOKEN;
  if (!token) {
    console.warn("[Reddit CAPI] REDDIT_CAPI_TOKEN not set — skipping");
    return;
  }

  const now = new Date().toISOString();

  const payload = {
    test_mode: false,
    events: [
      {
        event_type: event.event_type,
        event_at: event.event_at ?? now,
        event_metadata: {
          ...(event.value !== undefined && { value: event.value }),
          ...(event.currency && { currency: event.currency }),
          ...(event.item_count !== undefined && { item_count: event.item_count }),
          ...(event.conversion_id && { conversion_id: event.conversion_id }),
        },
        user: {
          ...(event.email && { email: sha256(event.email) }),
          ...(event.external_id && { external_id: sha256(event.external_id) }),
          ...(event.ip_address && { ip_address: event.ip_address }),
          ...(event.user_agent && { user_agent: event.user_agent }),
          ...(event.click_id && { click_id: event.click_id }),
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://ads-api.reddit.com/api/v3/conversions/events/${REDDIT_AD_ACCOUNT_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const body = await res.text();
    if (!res.ok) {
      console.error(`[Reddit CAPI] ${event.event_type} failed ${res.status}: ${body}`);
    } else {
      console.log(`[Reddit CAPI] ✅ ${event.event_type} fired — status ${res.status}`);
    }
  } catch (err) {
    console.error("[Reddit CAPI] Network error:", err);
  }
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export async function trackPurchaseConversion(
  email: string,
  amount: number,
  orderId: string,
  opts?: { ip?: string; userAgent?: string; clickId?: string }
) {
  await fireRedditCapi({
    event_type: "Purchase",
    email,
    external_id: email,
    value: amount,
    currency: "USD",
    item_count: 1,
    conversion_id: `order_${orderId}`,
    ip_address: opts?.ip,
    user_agent: opts?.userAgent,
    click_id: opts?.clickId,
  });
}

export async function trackLeadConversion(
  email: string,
  opts?: { ip?: string; userAgent?: string; clickId?: string }
) {
  await fireRedditCapi({
    event_type: "Lead",
    email,
    external_id: email,
    conversion_id: `lead_${sha256(email)}_${Date.now()}`,
    ip_address: opts?.ip,
    user_agent: opts?.userAgent,
    click_id: opts?.clickId,
  });
}

export async function trackPageView(
  opts?: { email?: string; ip?: string; userAgent?: string; clickId?: string }
) {
  await fireRedditCapi({
    event_type: "PageVisit",
    email: opts?.email,
    external_id: opts?.email,
    ip_address: opts?.ip,
    user_agent: opts?.userAgent,
    click_id: opts?.clickId,
  });
}
