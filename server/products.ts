// Centralized product definitions for Deep Sleep Reset funnel
// All prices in cents (USD)

// ─── Funnel Products (used by funnelRoutes.ts) ─────────────────────────────
// Pricing strategy (Hormozi tripwire funnel):
//   Tripwire: $5  → irresistible entry, HIGH/MID countries pay full, LOW pay ~$2
//   OTO1:    $17  → 30-day transformation
//   OTO2:    $27  → toolkit + audio
//   OTO3:    $47  → elite bundle
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
    successRedirect: "/upsell/3",
    cancelRedirect: "/upsell/3",
  },
  oto3: {
    key: "oto3",
    name: "Sleep Optimizer Elite Bundle",
    description: "Everything — all protocols, audio pack, toolkit + lifetime updates",
    price: 4700, // $47.00
    displayPrice: "$47",
    originalPrice: "$297",
    discountPercent: 84,
    successRedirect: "/thank-you",
    cancelRedirect: "/thank-you",
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
  "sleep-elite-bundle": {
    name: "Sleep Optimizer Elite Bundle",
    description: "Everything — all protocols, audio pack, toolkit + lifetime updates",
    basePrice: 4700, // $47.00
    displayPrice: "$47",
    originalPrice: "$297",
    currency: "usd",
  },
} as const;
export type ProductId = keyof typeof PRODUCTS;

// ─── Membership Subscription Plans ───────────────────────────────────────────
export const MEMBERSHIP_PLANS = {
  basic: {
    name: "Sleep Optimizer Basic",
    description: "Monthly sleep protocol updates + community access",
    basePrice: 999, // $9.99/month
    interval: "month" as const,
    features: [
      "Monthly Sleep Protocol Update (PDF)",
      "Weekly Sleep Tips Email",
      "Chronotype-specific meal timing guide",
      "Access to Sleep Optimizer community",
      "Cancel anytime",
    ],
  },
  pro: {
    name: "Sleep Optimizer Pro",
    description: "The complete sleep system with AI coaching",
    basePrice: 2700, // $27/month
    interval: "month" as const,
    features: [
      "Everything in Basic",
      "Weekly AI Sleep Score Report",
      "Monthly Protocol Deep-Dive",
      "Exclusive Bonus Guides (2/month)",
      "Private Sleep Optimizers Community",
      "Priority email support",
      "Early access to new protocols",
    ],
    badge: "MOST POPULAR",
  },
  elite: {
    name: "Sleep Optimizer Elite",
    description: "Maximum performance, maximum results",
    basePrice: 4700, // $47/month
    interval: "month" as const,
    features: [
      "Everything in Pro",
      "Personal Sleep Score Dashboard",
      "Monthly AI Sleep Audit",
      "VIP community badge & recognition",
      "Lifetime access to all past protocols",
      "First access to new products (free)",
      "Quarterly deep-dive sleep analysis",
    ],
    badge: "BEST VALUE",
  },
} as const;
export type MembershipPlanId = keyof typeof MEMBERSHIP_PLANS;

// ─── Subscription Tiers (used by v2 frontend pages) ──────────────────────────
export const SUBSCRIPTION_TIERS = {
  basic: {
    key: "basic",
    name: "Sleep Optimizer Basic",
    tagline: "Start your sleep transformation",
    price: 999,
    displayPrice: "$9.99",
    originalPrice: "$47",
    discountPercent: 79,
    interval: "month" as const,
    features: MEMBERSHIP_PLANS.basic.features,
    valueStack: "$97 value",
    badge: null,
    color: "blue",
  },
  pro: {
    key: "pro",
    name: "Sleep Optimizer Pro",
    tagline: "The complete sleep system",
    price: 2700,
    displayPrice: "$27",
    originalPrice: "$275",
    discountPercent: 90,
    interval: "month" as const,
    features: MEMBERSHIP_PLANS.pro.features,
    valueStack: "$275 value",
    badge: "MOST POPULAR",
    color: "purple",
  },
  elite: {
    key: "elite",
    name: "Sleep Optimizer Elite",
    tagline: "Maximum performance, maximum results",
    price: 4700,
    displayPrice: "$47",
    originalPrice: "$497",
    discountPercent: 91,
    interval: "month" as const,
    features: MEMBERSHIP_PLANS.elite.features,
    valueStack: "$497 value",
    badge: "BEST VALUE",
    color: "gold",
  },
} as const;
export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;
