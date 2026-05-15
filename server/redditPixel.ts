/**
 * Reddit Conversion Pixel Tracking
 * Fires conversion events for remarketing and audience building
 */

const REDDIT_PIXEL_ID = process.env.REDDIT_PIXEL_ID || "t2_deepsleep";

export interface ConversionEvent {
  type: "PageVisit" | "Purchase" | "Lead" | "AddToCart" | "ViewContent";
  value?: number;
  currency?: string;
  email?: string;
  chronotype?: string;
  source?: string;
}

/**
 * Fire conversion pixel event to Reddit
 * Used for tracking purchases, leads, and audience building
 */
export async function fireRedditPixel(event: ConversionEvent) {
  try {
    if (!process.env.REDDIT_PIXEL_ID) {
      console.warn("[Reddit Pixel] Pixel ID not configured");
      return;
    }

    const payload = {
      pixel_id: REDDIT_PIXEL_ID,
      event_type: event.type,
      timestamp: Math.floor(Date.now() / 1000),
      user_data: {
        email_hash: event.email ? hashEmail(event.email) : undefined,
        external_id: event.email, // For audience matching
      },
      conversion_data: {
        value: event.value || 0,
        currency: event.currency || "USD",
        content_type: "product",
        content_id: event.chronotype || "sleep-protocol",
      },
      metadata: {
        chronotype: event.chronotype,
        source: event.source || "website",
      },
    };

    // Send to Reddit Conversion API
    const response = await fetch("https://ads.reddit.com/api/v2.0/conversions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REDDIT_ADS_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("[Reddit Pixel] Error:", response.statusText);
      return;
    }

    console.log(`[Reddit Pixel] ${event.type} event fired for ${event.email}`);
  } catch (err) {
    console.error("[Reddit Pixel] Fatal error:", err);
  }
}

/**
 * Hash email for privacy-preserving audience matching
 */
function hashEmail(email: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

/**
 * Track purchase conversion
 */
export async function trackPurchaseConversion(
  email: string,
  amount: number,
  chronotype: string
) {
  await fireRedditPixel({
    type: "Purchase",
    value: amount,
    currency: "USD",
    email,
    chronotype,
    source: "stripe-checkout",
  });
}

/**
 * Track lead generation
 */
export async function trackLeadConversion(email: string, chronotype: string) {
  await fireRedditPixel({
    type: "Lead",
    email,
    chronotype,
    source: "quiz-completion",
  });
}

/**
 * Track page view for audience building
 */
export async function trackPageView(email?: string, chronotype?: string) {
  await fireRedditPixel({
    type: "PageVisit",
    email,
    chronotype,
    source: "website-visit",
  });
}

/**
 * Create audience segment based on chronotype
 */
export async function createChronotypeAudience(chronotype: string) {
  try {
    const response = await fetch(
      `https://ads.reddit.com/api/v2.0/audiences`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REDDIT_ADS_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          name: `${chronotype} Sleep Protocol Audience`,
          description: `Users interested in ${chronotype} chronotype sleep solutions`,
          targeting_criteria: {
            interests: ["sleep", "health", "wellness", chronotype.toLowerCase()],
            keywords: [
              `${chronotype} sleep`,
              "sleep protocol",
              "insomnia treatment",
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("[Reddit Audience] Error:", response.statusText);
      return null;
    }

    const data = await response.json();
    console.log(`[Reddit Audience] Created audience for ${chronotype}`);
    return data.id;
  } catch (err) {
    console.error("[Reddit Audience] Error:", err);
    return null;
  }
}
