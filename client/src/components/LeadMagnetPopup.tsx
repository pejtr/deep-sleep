/**
 * LeadMagnetPopup — Nedvěd funnel Phase 1
 * Triggers: 30s delay OR scroll 50% OR exit intent (desktop)
 * Offer: FREE "7 Sleep Hacks That Work Tonight" PDF guide
 * After email capture → redirect to /special-offer (UJN)
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { X, BookOpen, Zap, Shield, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/hooks/useSession";
import { useLocation } from "wouter";

const STORAGE_KEY = "lead_magnet_shown";
const STORAGE_CAPTURED = "lead_magnet_captured";

interface Props {
  /** Delay in ms before showing (default 30s) */
  delayMs?: number;
  /** Whether to use exit-intent trigger on desktop */
  exitIntent?: boolean;
}

export default function LeadMagnetPopup({ delayMs = 30000, exitIntent = true }: Props) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const shownRef = useRef(false);
  const [, navigate] = useLocation();

  const leadMutation = trpc.leads.capture.useMutation();

  const show = useCallback(() => {
    if (shownRef.current) return;
    // Don't show on order/checkout/quiz pages or if already captured
    const path = window.location.pathname;
    if (
      path.startsWith("/order") ||
      path.startsWith("/checkout") ||
      path.startsWith("/quiz") ||
      path.startsWith("/special-offer") ||
      path.startsWith("/free-guide") ||
      sessionStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(STORAGE_CAPTURED)
    ) return;

    shownRef.current = true;
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(true);
  }, []);

  useEffect(() => {
    // 1. Time-based trigger
    const timer = setTimeout(show, delayMs);

    // 2. Scroll 50% trigger
    const handleScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.5) show();
    };

    // 3. Exit intent (desktop only)
    const handleMouseLeave = (e: MouseEvent) => {
      if (exitIntent && e.clientY <= 5) show();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [show, delayMs, exitIntent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await leadMutation.mutateAsync({
        email,
        sessionId: getSessionId(),
        source: "lead_magnet",
        referrer: document.referrer || undefined,
        landingPage: window.location.pathname,
        language: navigator.language,
        browserLang: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      localStorage.setItem(STORAGE_CAPTURED, "1");
      setSubmitted(true);
      // After 1.5s → redirect to UJN special offer
      setTimeout(() => {
        setVisible(false);
        navigate("/special-offer?source=lead_magnet&email=" + encodeURIComponent(email));
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      style={{ background: "oklch(0.04 0.02 255 / 0.90)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{
          background: "linear-gradient(160deg, oklch(0.10 0.03 255) 0%, oklch(0.07 0.025 260) 100%)",
          border: "1px solid oklch(0.78 0.18 65 / 0.45)",
          boxShadow: "0 0 80px oklch(0.78 0.18 65 / 0.12), 0 25px 50px oklch(0.04 0.02 255 / 0.8)",
        }}
      >
        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full transition-colors hover:opacity-80"
          style={{ background: "oklch(0.18 0.025 255)", color: "oklch(0.55 0.04 265)" }}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top badge */}
        <div
          className="px-6 py-2.5 text-center text-xs font-bold tracking-widest uppercase"
          style={{ background: "oklch(0.78 0.18 65 / 0.12)", color: "oklch(0.82 0.16 65)", borderBottom: "1px solid oklch(0.78 0.18 65 / 0.2)" }}
        >
          FREE DOWNLOAD — Limited Time
        </div>

        <div className="px-6 py-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.78 0.18 65 / 0.12)", border: "1px solid oklch(0.78 0.18 65 / 0.35)" }}
            >
              <BookOpen className="w-8 h-8" style={{ color: "oklch(0.82 0.16 65)" }} />
            </div>
          </div>

          {/* Bulvární headline (Nedvěd: SOK + PŘEKVAPENÍ) */}
          <h2
            className="font-display font-bold text-2xl md:text-3xl text-center mb-2 leading-tight"
            style={{ color: "oklch(0.95 0.01 265)" }}
          >
            Doctors Won't Tell You This:<br />
            <span style={{ color: "oklch(0.82 0.16 65)" }}>7 Sleep Hacks That Work Tonight</span>
          </h2>

          <p className="text-center text-sm mb-1" style={{ color: "oklch(0.65 0.04 265)" }}>
            The exact techniques used by Navy SEALs, Olympic athletes, and sleep scientists.
          </p>
          <p className="text-center text-sm mb-5 font-semibold" style={{ color: "oklch(0.75 0.08 265)" }}>
            FREE PDF — Instant Download. No credit card.
          </p>

          {/* Value bullets */}
          <div className="space-y-2 mb-5">
            {[
              "The 12-minute pre-sleep ritual that drops cortisol by 47%",
              "Why your phone is destroying your sleep (and the 3-minute fix)",
              "The chronotype trick that adds 90 min of deep sleep per night",
              "How to fall asleep in under 8 minutes — every night",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.82 0.16 65)" }} />
                <span className="text-sm" style={{ color: "oklch(0.75 0.04 265)" }}>{item}</span>
              </div>
            ))}
          </div>

          {submitted ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.25)" }}
            >
              {/* Spinning loader */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "oklch(0.78 0.18 65 / 0.3)", borderTopColor: "oklch(0.82 0.16 65)" }}
                />
              </div>
              {/* Animated dots */}
              <p className="font-bold text-base mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>
                Generuji vaši unikátní nabídku
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </span>
              </p>
              <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
                Personalizing your sleep protocol based on your profile
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your best email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "oklch(0.13 0.025 255)",
                  border: `1px solid ${error ? "oklch(0.65 0.20 25)" : "oklch(0.28 0.03 265)"}`,
                  color: "oklch(0.92 0.01 265)",
                }}
                required
                autoFocus
              />
              {error && (
                <p className="text-xs" style={{ color: "oklch(0.65 0.20 25)" }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3.5 font-bold text-base transition-all"
                style={{
                  background: loading
                    ? "oklch(0.55 0.12 65)"
                    : "linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.68 0.22 55))",
                  color: "oklch(0.08 0.02 255)",
                  boxShadow: loading ? "none" : "0 4px 24px oklch(0.78 0.18 65 / 0.40)",
                  transform: loading ? "none" : "translateY(0)",
                }}
              >
                {loading ? "Sending..." : "Send Me the FREE Guide →"}
              </button>
            </form>
          )}

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-5 mt-4">
            <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.42 0.04 265)" }}>
              <Shield className="w-3 h-3" />
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.42 0.04 265)" }}>
              <Zap className="w-3 h-3" />
              <span>Instant delivery</span>
            </div>
          </div>

          <p className="text-center text-xs mt-2" style={{ color: "oklch(0.32 0.03 265)" }}>
            12,847 people already downloaded this guide
          </p>

          {/* Dismiss */}
          <button
            onClick={() => setVisible(false)}
            className="w-full text-center text-xs mt-3 py-1 transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.35 0.03 265)" }}
          >
            No thanks, I'll keep waking up exhausted
          </button>
        </div>
      </div>
    </div>
  );
}
