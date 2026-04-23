/**
 * useBehaviorTracker — Automatic behavioral tracking hook
 * Tracks: scroll depth, time on page, click events, rage clicks,
 * exit intent, UTM params, device type
 */
import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { getSessionId, getChronotype } from "./useSession";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getUTMParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(k => {
    const v = params.get(k);
    if (v) utm[k] = v;
  });
  return utm;
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useBehaviorTracker(page: string) {
  const trackMutation = trpc.behavior.track.useMutation();
  const trackedScrollRef = useRef<Set<number>>(new Set());
  const trackedTimeRef = useRef<Set<number>>(new Set());
  const clickTimestampsRef = useRef<number[]>([]);
  const pageStartRef = useRef<number>(Date.now());
  const exitIntentFiredRef = useRef(false);
  const pageViewTrackedRef = useRef(false);

  const chronotype = getChronotype() as "Lion" | "Bear" | "Wolf" | "Dolphin" | null;
  const validChronotype = ["Lion", "Bear", "Wolf", "Dolphin"].includes(chronotype ?? "")
    ? (chronotype as "Lion" | "Bear" | "Wolf" | "Dolphin")
    : undefined;

  const track = useCallback((event: string, element?: string, value?: object | string) => {
    const sessionId = getSessionId();
    trackMutation.mutate({
      sessionId,
      event,
      page,
      element,
      value: value ? (typeof value === "string" ? value : JSON.stringify(value)) : undefined,
      chronotype: validChronotype,
    });
  }, [page, trackMutation, validChronotype]);

  // ── Page view + device + UTM ──────────────────────────────────────────────
  useEffect(() => {
    if (pageViewTrackedRef.current) return;
    pageViewTrackedRef.current = true;
    const utmParams = getUTMParams();
    const device = getDeviceType();
    track("page_view", undefined, {
      device,
      referrer: document.referrer || "direct",
      ...utmParams,
    });
  }, [track]);

  // ── Time on page milestones ───────────────────────────────────────────────
  useEffect(() => {
    const milestones = [30, 60, 120, 300]; // seconds
    const timers = milestones.map(seconds => {
      return window.setTimeout(() => {
        if (!trackedTimeRef.current.has(seconds)) {
          trackedTimeRef.current.add(seconds);
          track("time_on_page", undefined, { seconds });
        }
      }, seconds * 1000);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [track]);

  // ── Scroll depth milestones ───────────────────────────────────────────────
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);
      milestones.forEach(m => {
        if (pct >= m && !trackedScrollRef.current.has(m)) {
          trackedScrollRef.current.add(m);
          track("scroll_depth", undefined, { percent: m });
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [track]);

  // ── Rage clicks (3+ clicks within 2 seconds on same element) ─────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const now = Date.now();
      clickTimestampsRef.current = [
        ...clickTimestampsRef.current.filter(t => now - t < 2000),
        now,
      ];
      if (clickTimestampsRef.current.length >= 3) {
        const elementLabel =
          target.getAttribute("data-track") ||
          target.closest("[data-track]")?.getAttribute("data-track") ||
          target.tagName.toLowerCase();
        track("rage_click", elementLabel, { count: clickTimestampsRef.current.length });
        clickTimestampsRef.current = []; // reset after detecting rage click
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [track]);

  // ── CTA click tracking (elements with data-track attribute) ──────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-track]");
      if (target) {
        const label = target.getAttribute("data-track") ?? "unknown";
        track("cta_click", label);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [track]);

  // ── Exit intent (mouse leaves viewport from top) ──────────────────────────
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !exitIntentFiredRef.current) {
        exitIntentFiredRef.current = true;
        const timeSpent = Math.round((Date.now() - pageStartRef.current) / 1000);
        track("exit_intent", undefined, { timeSpent });
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [track]);

  return { track };
}
