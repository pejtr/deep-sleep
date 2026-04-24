// ── Deep Sleep Reset — Product Catalog ────────────────────────────────────────
// Centralized product definitions for Stripe Checkout

export interface Product {
  id: string;
  name: string;
  description: string;
  amountUsd: number; // in cents
  downloadUrl: string; // URL to the digital product
}

export const PRODUCTS: Record<string, Product> = {
  main: {
    id: "main",
    name: "Deep Sleep Reset — 7-Night Protocol",
    description: "Science-backed 7-night sleep reset protocol. Instant PDF download.",
    amountUsd: 500, // $5.00
    downloadUrl: "https://deepsleepreset.gumroad.com/l/fdtifc",
  },
  oto1: {
    id: "oto1",
    name: "Deep Sleep Reset — Chronotype Optimizer",
    description: "Personalized sleep optimization based on your chronotype.",
    amountUsd: 300, // $3.00
    downloadUrl: "https://deepsleepreset.gumroad.com/l/chronotype",
  },
  oto2: {
    id: "oto2",
    name: "Deep Sleep Reset — ASMR Audio Pack",
    description: "Premium sleep audio pack with 7 ASMR tracks.",
    amountUsd: 700, // $7.00
    downloadUrl: "https://deepsleepreset.gumroad.com/l/audiopack",
  },
  oto3: {
    id: "oto3",
    name: "Deep Sleep Reset — Complete Bundle",
    description: "Everything included: protocol + optimizer + audio pack.",
    amountUsd: 1000, // $10.00
    downloadUrl: "https://deepsleepreset.gumroad.com/l/bundle",
  },
};

export function getProduct(productId: string): Product | null {
  return PRODUCTS[productId] ?? null;
}
