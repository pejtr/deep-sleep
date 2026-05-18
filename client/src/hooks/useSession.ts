import { useMemo } from "react";
import { nanoid } from "nanoid";
import { trpc } from "@/lib/trpc";

const SESSION_KEY = "dsr_session_id";
const CHRONOTYPE_KEY = "dsr_chronotype";
const AB_VARIANT_KEY = "dsr_ab_variant";

export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = nanoid(20);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getChronotype(): string | null {
  return sessionStorage.getItem(CHRONOTYPE_KEY);
}

export function setChronotype(chronotype: string): void {
  sessionStorage.setItem(CHRONOTYPE_KEY, chronotype);
}

export function getAbVariant(): string {
  let variant = sessionStorage.getItem(AB_VARIANT_KEY);
  if (!variant) {
    const variants = ["A", "B", "C", "D", "E"];
    variant = variants[Math.floor(Math.random() * variants.length)] ?? "A";
    sessionStorage.setItem(AB_VARIANT_KEY, variant);
  }
  return variant;
}

// ── UTM Attribution ─────────────────────────────────────────────────────────
const UTM_KEY = "dsr_utm";

export interface UTMData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
}

/** Capture UTM params from URL on first visit and persist in localStorage */
export function captureUTM(): void {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  // Only overwrite if we have new UTM data in the URL
  if (utmSource) {
    const data: UTMData = {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      utmContent: params.get("utm_content") || undefined,
      utmTerm: params.get("utm_term") || undefined,
      referrer: document.referrer || undefined,
    };
    localStorage.setItem(UTM_KEY, JSON.stringify(data));
  } else if (!localStorage.getItem(UTM_KEY)) {
    // First visit without UTM — store referrer at minimum
    const data: UTMData = {
      referrer: document.referrer || "direct",
    };
    localStorage.setItem(UTM_KEY, JSON.stringify(data));
  }
}

/** Get stored UTM data for checkout attribution */
export function getUTMData(): UTMData {
  try {
    const stored = localStorage.getItem(UTM_KEY);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("[UTM] Failed to parse stored data:", e);
      localStorage.removeItem(UTM_KEY);
      return {};
    }
  } catch {
    return {};
  }
}

export function useTrackBehavior() {
  const trackMutation = trpc.behavior.track.useMutation();

  return useMemo(() => ({
    track: (event: string, options?: {
      page?: string;
      element?: string;
      value?: string | object;
      chronotype?: "Lion" | "Bear" | "Wolf" | "Dolphin";
    }) => {
      const sessionId = getSessionId();
      const chronotype = (options?.chronotype ?? getChronotype()) as "Lion" | "Bear" | "Wolf" | "Dolphin" | undefined;
      trackMutation.mutate({
        sessionId,
        event,
        page: options?.page,
        element: options?.element,
        value: options?.value ? (typeof options.value === "string" ? options.value : JSON.stringify(options.value)) : undefined,
        chronotype: ["Lion", "Bear", "Wolf", "Dolphin"].includes(chronotype ?? "") ? chronotype : undefined,
      });
    },
  }), [trackMutation]);
}
