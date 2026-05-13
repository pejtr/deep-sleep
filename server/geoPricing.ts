import geoip from "geoip-lite";
import { getGeoTier, getPriceForGeo } from "./products";

export interface GeoPricingResult {
  country: string;
  countryName: string;
  tier: "low" | "mid" | "high";
  currency: string;
  prices: {
    main: {
      basePriceCents: number;
      displayPrice: string;
      originalPrice: string;
      geoAdjustedCents: number;
      geoAdjustedDisplay: string;
    };
    oto1: {
      basePriceCents: number;
      displayPrice: string;
      originalPrice: string;
      geoAdjustedCents: number;
      geoAdjustedDisplay: string;
    };
    oto2: {
      basePriceCents: number;
      displayPrice: string;
      originalPrice: string;
      geoAdjustedCents: number;
      geoAdjustedDisplay: string;
    };
  };
}

// Product base prices in cents
const BASE_PRICES = {
  main: { cents: 500, display: "$5", original: "$47" },
  oto1: { cents: 1700, display: "$17", original: "$97" },
  oto2: { cents: 2700, display: "$27", original: "$127" },
};

// Currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CZK: "Kč",
  CAD: "C$",
  AUD: "A$",
  PLN: "zł",
  HUF: "Ft",
  RON: "lei",
  INR: "₹",
  BRL: "R$",
  MXN: "$",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  SGD: "S$",
  NZD: "NZ$",
  ZAR: "R",
  JPY: "¥",
};

// Exchange rates (fallback)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CZK: 0.042,
  CAD: 0.74,
  AUD: 0.66,
  PLN: 0.25,
  HUF: 0.0028,
  RON: 0.22,
  INR: 0.012,
  BRL: 0.2,
  MXN: 0.058,
  CHF: 1.1,
  SEK: 0.095,
  NOK: 0.095,
  DKK: 0.145,
  SGD: 0.74,
  NZD: 0.6,
  ZAR: 0.054,
  JPY: 0.0065,
};

// Country to currency mapping
const COUNTRY_CURRENCIES: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  AU: "AUD",
  NZ: "NZD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  HU: "HUF",
  RO: "RON",
  CZ: "CZK",
  IN: "INR",
  BR: "BRL",
  MX: "MXN",
  SG: "SGD",
  JP: "JPY",
  ZA: "ZAR",
};

export function getGeoPricingFromIp(ip: string): GeoPricingResult {
  const geo = geoip.lookup(ip);
  const country = geo?.country || "US";
  const countryName = geo?.country || "United States";
  const tier = getGeoTier(country);
  const currency = COUNTRY_CURRENCIES[country] || "USD";

  // Calculate geo-adjusted prices
  const adjustPrice = (baseCents: number) => {
    const geoAdjustedCents = getPriceForGeo(baseCents, country);
    const dollars = geoAdjustedCents / 100;
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    
    // Convert to local currency if needed
    const rate = EXCHANGE_RATES[currency] || 1;
    const localAmount = dollars * rate;
    
    return {
      cents: geoAdjustedCents,
      display: `${symbol}${Math.round(localAmount)}`,
      localAmount,
    };
  };

  const mainPrice = adjustPrice(BASE_PRICES.main.cents);
  const oto1Price = adjustPrice(BASE_PRICES.oto1.cents);
  const oto2Price = adjustPrice(BASE_PRICES.oto2.cents);

  return {
    country,
    countryName,
    tier,
    currency,
    prices: {
      main: {
        basePriceCents: BASE_PRICES.main.cents,
        displayPrice: BASE_PRICES.main.display,
        originalPrice: BASE_PRICES.main.original,
        geoAdjustedCents: mainPrice.cents,
        geoAdjustedDisplay: mainPrice.display,
      },
      oto1: {
        basePriceCents: BASE_PRICES.oto1.cents,
        displayPrice: BASE_PRICES.oto1.display,
        originalPrice: BASE_PRICES.oto1.original,
        geoAdjustedCents: oto1Price.cents,
        geoAdjustedDisplay: oto1Price.display,
      },
      oto2: {
        basePriceCents: BASE_PRICES.oto2.cents,
        displayPrice: BASE_PRICES.oto2.display,
        originalPrice: BASE_PRICES.oto2.original,
        geoAdjustedCents: oto2Price.cents,
        geoAdjustedDisplay: oto2Price.display,
      },
    },
  };
}

export function getGeoPricingFromCountry(country: string): GeoPricingResult {
  const tier = getGeoTier(country);
  const currency = COUNTRY_CURRENCIES[country] || "USD";

  const adjustPrice = (baseCents: number) => {
    const geoAdjustedCents = getPriceForGeo(baseCents, country);
    const dollars = geoAdjustedCents / 100;
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    
    const rate = EXCHANGE_RATES[currency] || 1;
    const localAmount = dollars * rate;
    
    return {
      cents: geoAdjustedCents,
      display: `${symbol}${Math.round(localAmount)}`,
      localAmount,
    };
  };

  const mainPrice = adjustPrice(BASE_PRICES.main.cents);
  const oto1Price = adjustPrice(BASE_PRICES.oto1.cents);
  const oto2Price = adjustPrice(BASE_PRICES.oto2.cents);

  return {
    country,
    countryName: country,
    tier,
    currency,
    prices: {
      main: {
        basePriceCents: BASE_PRICES.main.cents,
        displayPrice: BASE_PRICES.main.display,
        originalPrice: BASE_PRICES.main.original,
        geoAdjustedCents: mainPrice.cents,
        geoAdjustedDisplay: mainPrice.display,
      },
      oto1: {
        basePriceCents: BASE_PRICES.oto1.cents,
        displayPrice: BASE_PRICES.oto1.display,
        originalPrice: BASE_PRICES.oto1.original,
        geoAdjustedCents: oto1Price.cents,
        geoAdjustedDisplay: oto1Price.display,
      },
      oto2: {
        basePriceCents: BASE_PRICES.oto2.cents,
        displayPrice: BASE_PRICES.oto2.display,
        originalPrice: BASE_PRICES.oto2.original,
        geoAdjustedCents: oto2Price.cents,
        geoAdjustedDisplay: oto2Price.display,
      },
    },
  };
}
