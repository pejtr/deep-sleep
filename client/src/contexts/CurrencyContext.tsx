import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";

// ── Supported currencies ──────────────────────────────────────────────────────
export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar",        flag: "🇺🇸" },
  { code: "EUR", symbol: "€",  name: "Euro",              flag: "🇪🇺" },
  { code: "GBP", symbol: "£",  name: "British Pound",     flag: "🇬🇧" },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna",      flag: "🇨🇿" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar",   flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty",      flag: "🇵🇱" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint",  flag: "🇭🇺" },
  { code: "RON", symbol: "lei",name: "Romanian Leu",      flag: "🇷🇴" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee",      flag: "🇮🇳" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real",    flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$",name: "Mexican Peso",      flag: "🇲🇽" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc",       flag: "🇨🇭" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona",     flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone",   flag: "🇳🇴" },
  { code: "DKK", symbol: "kr", name: "Danish Krone",      flag: "🇩🇰" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar",  flag: "🇸🇬" },
  { code: "NZD", symbol: "NZ$",name: "New Zealand Dollar",flag: "🇳🇿" },
  { code: "ZAR", symbol: "R",  name: "South African Rand",flag: "🇿🇦" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen",      flag: "🇯🇵" },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]["code"];

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

// Low-tier countries get reduced pricing (CZK removed — default to USD for all EU/CZ traffic)
const LOW_TIER_CURRENCIES: CurrencyCode[] = ["INR", "BRL", "MXN", "ZAR", "PLN", "HUF", "RON"];

// Currencies that should NOT be auto-detected (always show USD instead)
const SKIP_AUTO_DETECT: CurrencyCode[] = ["CZK", "HUF", "RON", "PLN", "SEK", "NOK", "DKK"];

// Geo-pricing: maps standard USD price to low-tier price
const GEO_PRICE_MAP: Record<number, number> = {
  1: 1,   // entry product: $1 stays $1
  4: 1,   // main product: $4 → $1
  17: 5,  // OTO1: $17 → $5
  27: 8,  // OTO2: $27 → $8
  8: 3,   // membership: $8 → $3
};

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
  convertPrice: (usdAmount: number) => string;
  formatPrice: (usdAmount: number) => string;
  /** Returns the geo-adjusted USD base price (e.g. $4→$1 for low-tier) */
  getGeoPrice: (usdAmount: number) => number;
  isLowTier: boolean;
  rates: Record<string, number>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "dsr_currency";

// Format price nicely for each currency
function formatAmount(amount: number, code: string, symbol: string): string {
  // Currencies with no decimals
  const noDecimals = ["JPY", "HUF", "INR", "CZK", "RON"];
  // Currencies where symbol goes after
  const symbolAfter = ["CZK", "HUF", "RON", "PLN", "SEK", "NOK", "DKK"];

  const rounded = noDecimals.includes(code)
    ? Math.round(amount)
    : Math.round(amount * 100) / 100;

  const formatted = noDecimals.includes(code)
    ? rounded.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return symbolAfter.includes(code)
    ? `${formatted} ${symbol}`
    : `${symbol}${formatted}`;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCode, setSelectedCode] = useState<CurrencyCode>("USD");
  const [hasLoaded, setHasLoaded] = useState(false);

  const { data: ratesData, isLoading } = trpc.currency.getRates.useQuery(
    { base: "USD" },
    { staleTime: 1000 * 60 * 30 } // cache 30 min
  );

  const { lang } = useI18n();

  // Language-driven currency: cs → CZK, everything else → USD (or major currency by IP)
  useEffect(() => {
    if (!hasLoaded && ratesData) {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && SUPPORTED_CURRENCIES.find(c => c.code === saved)) {
        setSelectedCode(saved);
      } else if (lang === "cs") {
        // Czech language selected → use CZK
        setSelectedCode("CZK");
      } else if (ratesData.detectedCurrency) {
        const detected = ratesData.detectedCurrency as CurrencyCode;
        // Skip non-major currencies in auto-detect — always show USD for CZK/PLN/HUF etc.
        if (SUPPORTED_CURRENCIES.find(c => c.code === detected) && !SKIP_AUTO_DETECT.includes(detected as CurrencyCode)) {
          setSelectedCode(detected);
        }
        // else: keep USD default
      }
      setHasLoaded(true);
    }
  }, [ratesData, hasLoaded, lang]);

  // When language changes after initial load — switch currency accordingly
  useEffect(() => {
    if (!hasLoaded) return;
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (saved) return; // user manually set currency — don't override
    if (lang === "cs") {
      setSelectedCode("CZK");
    } else if (selectedCode === "CZK") {
      // Switched away from Czech → reset to USD
      setSelectedCode("USD");
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCurrency = useCallback((code: CurrencyCode) => {
    setSelectedCode(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const rates = ratesData?.rates ?? {};

  const convertPrice = useCallback((usdAmount: number): string => {
    const rate = rates[selectedCode] ?? 1;
    return (usdAmount * rate).toFixed(2);
  }, [rates, selectedCode]);

  const isLowTier = LOW_TIER_CURRENCIES.includes(selectedCode);

  const getGeoPrice = useCallback((usdAmount: number): number => {
    if (!isLowTier) return usdAmount;
    return GEO_PRICE_MAP[usdAmount] ?? Math.max(1, Math.round(usdAmount * 0.2));
  }, [isLowTier]);

  const formatPrice = useCallback((usdAmount: number): string => {
    const geoAdjusted = isLowTier ? (GEO_PRICE_MAP[usdAmount] ?? Math.max(1, Math.round(usdAmount * 0.2))) : usdAmount;
    const rate = rates[selectedCode] ?? 1;
    const converted = geoAdjusted * rate;
    const info = SUPPORTED_CURRENCIES.find(c => c.code === selectedCode)!;
    return formatAmount(converted, selectedCode, info.symbol);
  }, [rates, selectedCode, isLowTier]);

  const currency = SUPPORTED_CURRENCIES.find(c => c.code === selectedCode)!;

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      convertPrice,
      formatPrice,
      getGeoPrice,
      isLowTier,
      rates,
      isLoading,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
