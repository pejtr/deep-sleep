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
