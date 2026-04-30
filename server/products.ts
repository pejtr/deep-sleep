// Centralized product definitions for Deep Sleep Reset funnel
// All prices in cents (USD)

// ─── Funnel Products (used by funnelRoutes.ts) ─────────────────────────────
// Pricing strategy (Hormozi tripwire funnel):
//   Tripwire: $5  → irresistible entry, HIGH/MID countries pay full, LOW pay ~$2
//   OTO1:    $17  → 30-day transformation
//   OTO2:    $27  → toolkit + audio
//   Membership: $8/month → single subscription tier
export const FUNNEL_PRODUCTS = {
  tripwire: {
    key: "tripwire",
    name: "7-Night Deep Sleep Reset",
    description: "Personalized 7-night sleep protocol for your chronotype",
    price: 500, // $5.00 base
    displayPrice: "$5",
    originalPrice: "$47",
    discountPercent: 89,
    successRedirect: "/upsell/1",
    cancelRedirect: "/order",
  },
  oto1: {
    key: "oto1",
    name: "30-Day Sleep Transformation",
    description: "Complete 30-day program for lasting sleep transformation",
    price: 1700, // $17.00
    displayPrice: "$17",
    originalPrice: "$97",
    discountPercent: 82,
    successRedirect: "/upsell/2",
    cancelRedirect: "/upsell/2",
  },
  oto2: {
    key: "oto2",
    name: "Deep Sleep Toolkit",
    description: "Complete toolkit — journal, tracker, recipes, supplement guide",
    price: 2700, // $27.00
    displayPrice: "$27",
    originalPrice: "$127",
    discountPercent: 79,
    successRedirect: "/thankyou",
    cancelRedirect: "/thankyou",
  },
} as const;
export type ProductKey = keyof typeof FUNNEL_PRODUCTS;

// ─── Geo Pricing Tiers ────────────────────────────────────────────────────────
// Strategy: LOW tier gets 60% discount (targeting volume from developing markets)
// MID tier = full price in local currency (CZ/SK/PL/EU = same $5/$17/$27 as US)
// HIGH tier = full price (US, UK, DE, CA, AU, JP, CH, SE, NO, DK)

// LOW TIER: Truly low-income countries (GDP/capita < $5k) — 60% discount
// Tripwire ~$2, OTO1 ~$7, OTO2 ~$11
const LOW_TIER_COUNTRIES = [
  "IN", "ID", "PH", "VN", "BD", "PK",
  "NG", "KE", "EG", "TH", "MY", "ZA", "UA",
  "GH", "TZ", "ET", "UG", "SN", "CM", "CI", "MZ", "ZM", "MW",
];

// MID TIER: Central/Eastern Europe + LatAm + MENA — NO discount (full price)
// CZ/SK/PL/HU/RO = $5 tripwire (cca 120 Kč), $17 mid, $27 premium
const MID_TIER_COUNTRIES = [
  // Central & Eastern Europe (PRIMARY TARGET MARKET)
  "CZ", "SK", "PL", "HU", "RO", "BG", "HR", "LT", "LV", "EE",
  "SI", "RS", "BA", "MK", "AL", "ME",
  // Southern Europe
  "ES", "PT", "IT", "GR",
  // Latin America
  "MX", "BR", "CL", "AR", "CO", "PE",
  // Middle East & Asia
  "TR", "IL", "AE", "SA", "KR", "TW", "SG", "HK",
  // Other developed
  "NZ", "IE", "FI", "AT", "BE", "NL",
];

export function getGeoTier(country: string): "low" | "mid" | "high" {
  const c = country.toUpperCase();
  if (LOW_TIER_COUNTRIES.includes(c)) return "low";
  if (MID_TIER_COUNTRIES.includes(c)) return "mid";
  return "high";
}

export function getPriceForGeo(basePriceCents: number, country: string): number {
  const tier = getGeoTier(country);
  if (tier === "low") return Math.round(basePriceCents * 0.40); // 60% discount for truly low-income
  // MID and HIGH both pay full price — MID countries just pay in their local currency
  return basePriceCents;
}

// ─── Dashboard Products (used by routers.ts for Stripe checkout) ────────────
export const PRODUCTS = {
  "sleep-reset-7night": {
    name: "7-Night Deep Sleep Reset",
    description: "Personalized 7-night sleep protocol for your chronotype",
    basePrice: 500, // $5.00
    displayPrice: "$5",
    originalPrice: "$47",
    currency: "usd",
  },
  "sleep-transformation-30day": {
    name: "30-Day Sleep Transformation",
    description: "Complete 30-day program with daily protocols",
    basePrice: 1700, // $17.00
    displayPrice: "$17",
    originalPrice: "$97",
    currency: "usd",
  },
  "deep-sleep-toolkit": {
    name: "Deep Sleep Toolkit",
    description: "Complete toolkit — journal, tracker, recipes, supplement guide",
    basePrice: 2700, // $27.00
    displayPrice: "$27",
    originalPrice: "$127",
    currency: "usd",
  },
} as const;
export type ProductId = keyof typeof PRODUCTS;

// ─── Single Membership Subscription Plan ($8/month) ─────────────────────────
export const MEMBERSHIP_PLAN = {
  name: "Sleep Optimizer Membership",
  description: "Monthly sleep protocol updates, community access, and AI coaching",
  basePrice: 800, // $8.00/month
  displayPrice: "$8",
  originalPrice: "$47",
  discountPercent: 83,
  interval: "month" as const,
  features: [
    "Monthly Sleep Protocol Update (PDF)",
    "Weekly Sleep Tips Email",
    "Chronotype-specific meal timing guide",
    "Access to Sleep Optimizer community",
    "Weekly AI Sleep Score Report",
    "Priority email support",
    "Cancel anytime",
  ],
} as const;

// Legacy aliases for backward compatibility
export const MEMBERSHIP_PLANS = {
  basic: MEMBERSHIP_PLAN,
} as const;
export type MembershipPlanId = "basic";

export const SUBSCRIPTION_TIERS = {
  basic: {
    key: "basic",
    name: MEMBERSHIP_PLAN.name,
    tagline: "Your complete sleep optimization system",
    price: MEMBERSHIP_PLAN.basePrice,
    displayPrice: MEMBERSHIP_PLAN.displayPrice,
    originalPrice: MEMBERSHIP_PLAN.originalPrice,
    discountPercent: MEMBERSHIP_PLAN.discountPercent,
    interval: "month" as const,
    features: MEMBERSHIP_PLAN.features,
    valueStack: "$47 value",
    badge: "BEST VALUE",
    color: "gold",
  },
} as const;
export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;
