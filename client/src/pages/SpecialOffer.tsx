/**
 * /special-offer — Unikátní Jednorázová Nabídka (UJN)
 * Nedvěd funnel Phase 2: po email capture → jednorázová nabídka
 * - 15min odpočítávání (nelze se vrátit)
 * - Mikro-závazek: zákazník dal email → teď kývne na nabídku
 * - Confirmation bias: potvrdí rozhodnutí zákazníka
 */
import { useState, useEffect } from "react";
import { Shield, Zap, Star, Check, Clock, Lock } from "lucide-react";
import { getSessionId } from "@/hooks/useSession";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CheckoutButton } from "@/components/CheckoutButton";

const UJN_TIMER_KEY = "ujn_timer_start";
const UJN_DURATION = 15 * 60; // 15 minutes in seconds

function useUjnCountdown() {
  const [secondsLeft, setSecondsLeft] = useState<number>(UJN_DURATION);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Get or set start time
    let start = parseInt(sessionStorage.getItem(UJN_TIMER_KEY) || "0");
    if (!start) {
      start = Date.now();
      sessionStorage.setItem(UJN_TIMER_KEY, String(start));
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, UJN_DURATION - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) setExpired(true);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return { minutes, seconds, expired, secondsLeft };
}

const VALUE_STACK = [
  { item: "7-Night Deep Sleep Protocol (PDF)", value: "$47" },
  { item: "Chronotype Sleep Optimizer Guide", value: "$27" },
  { item: "ASMR Sleep Audio Pack (8 tracks)", value: "$17" },
  { item: "Sleep Score Assessment Tool", value: "$19" },
  { item: "Lifetime Updates", value: "$29" },
];

const MICRO_COMMITMENTS = [
  "You just told us your sleep is broken.",
  "You took the time to get the free guide.",
  "You clearly want to fix this.",
];

export default function SpecialOffer() {
  const { minutes, seconds, expired, secondsLeft } = useUjnCountdown();
  const { formatPrice, currency, isLowTier } = useCurrency();
  const [email, setEmail] = useState("");
  const sessionId = getSessionId();
  const isUrgent = !expired && secondsLeft <= 3 * 60; // last 3 minutes

  // Get email from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, []);

  const timerColor = expired
    ? "oklch(0.65 0.20 25)"
    : isUrgent
    ? "oklch(0.62 0.22 25)"
    : minutes < 5
    ? "oklch(0.72 0.20 30)"
    : "oklch(0.82 0.16 65)";

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.06 0.025 255)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.18 65 / 0.05) 0%, transparent 70%)" }} />
      </div>

      {/* ── STICKY TIMER BAR ── */}
      <div
        className={`sticky top-0 z-50 py-2.5 px-4 text-center transition-all duration-500${isUrgent ? " timer-pulse-red" : ""}`}
        style={{
          background: expired
            ? "oklch(0.65 0.20 25 / 0.95)"
            : isUrgent
            ? "oklch(0.22 0.08 25 / 0.97)"
            : "oklch(0.08 0.025 255 / 0.97)",
          borderBottom: `1px solid ${timerColor}60`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-center gap-2 text-sm font-bold">
          <Clock className={`w-4 h-4${isUrgent ? " animate-pulse" : ""}`} style={{ color: timerColor }} />
          {expired ? (
            <span style={{ color: "oklch(0.95 0.01 265)" }}>
              This offer has expired. The price has returned to $47.
            </span>
          ) : (
            <>
              {isUrgent && (
                <span className="text-xs font-bold tracking-widest uppercase animate-pulse" style={{ color: "oklch(0.72 0.22 25)" }}>
                  HURRY —
                </span>
              )}
              <span style={{ color: isUrgent ? "oklch(0.85 0.04 265)" : "oklch(0.75 0.04 265)" }}>
                {isUrgent ? "Offer expires in:" : "This one-time offer expires in:"}
              </span>
              <span
                className={`font-mono text-lg${isUrgent ? " animate-pulse" : ""}`}
                style={{ color: timerColor, textShadow: isUrgent ? `0 0 12px oklch(0.62 0.22 25 / 0.8)` : "none" }}
              >
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span style={{ color: "oklch(0.55 0.04 265)" }}>— cannot be extended</span>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">

        {/* ── CONFIRMATION BIAS OPENER ── */}
        <div
          className="rounded-xl p-5 mb-8 text-center"
          style={{ background: "oklch(0.78 0.18 65 / 0.07)", border: "1px solid oklch(0.78 0.18 65 / 0.25)" }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: "oklch(0.82 0.16 65)" }}>
            You've already made the right decision:
          </p>
          <div className="space-y-2">
            {MICRO_COMMITMENTS.map((c, i) => (
              <div key={i} className="flex items-center gap-2 justify-center">
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.65 0.18 145)" }} />
                <span className="text-sm" style={{ color: "oklch(0.75 0.04 265)" }}>{c}</span>
              </div>
            ))}
          </div>
          <p className="text-sm mt-3 font-semibold" style={{ color: "oklch(0.90 0.01 265)" }}>
            The next step is obvious.
          </p>
        </div>

        {/* ── HEADLINE ── */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: "oklch(0.78 0.18 65 / 0.12)", border: "1px solid oklch(0.78 0.18 65 / 0.35)", color: "oklch(0.82 0.16 65)" }}
          >
            <Lock className="w-3 h-3" />
            One-Time Offer — This Page Cannot Be Revisited
          </div>

          <h1
            className="font-display font-black text-3xl md:text-4xl leading-tight mb-3"
            style={{ color: "oklch(0.95 0.01 265)" }}
          >
            Wait — Your Free Guide Is Ready.<br />
            <span style={{ color: "oklch(0.82 0.16 65)" }}>But First, A Special Offer.</span>
          </h1>

          <p className="text-base" style={{ color: "oklch(0.65 0.04 265)" }}>
            Since you're already committed to fixing your sleep, we want to give you the complete system — at a price you'll never see again.
          </p>
        </div>

        {/* ── VIDEO OFFER ── */}
        <div className="relative rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.30)" }}>
          {/* Promo photo floating badge */}
          <div className="absolute top-3 right-3 w-16 h-16 rounded-xl overflow-hidden z-10" style={{ border: "2px solid oklch(0.78 0.18 65 / 0.6)", boxShadow: "0 4px 16px oklch(0.06 0.025 255 / 0.8)" }}>
            <img src="/manus-storage/promo-sleep-model_fc789a56.png" alt="" className="w-full h-full object-cover object-top" />
          </div>
          <video
            src="/manus-storage/sleep-guide-bed_2e7e0ae5.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full object-cover"
            style={{ maxHeight: "240px", background: "oklch(0.06 0.025 255)" }}
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-4"
            style={{ background: "linear-gradient(to top, oklch(0.06 0.025 255 / 0.92) 0%, transparent 50%)" }}
          >
            <p className="text-base font-bold text-center" style={{ color: "oklch(0.95 0.01 265)" }}>
              "Hi, I will be your deep sleep guide tonight."
            </p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.16 65)" }}>
              Luna — AI Sleep Coach included with your order
            </p>
          </div>
        </div>

        {/* ── VALUE STACK ── */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.20 0.03 265)" }}
        >
          <h2 className="font-bold text-lg mb-4 text-center" style={{ color: "oklch(0.90 0.01 265)" }}>
            Everything Included — Your Complete Sleep System:
          </h2>
          <div className="space-y-3 mb-5">
            {VALUE_STACK.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.65 0.18 145)" }} />
                  <span className="text-sm" style={{ color: "oklch(0.78 0.04 265)" }}>{item.item}</span>
                </div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: "oklch(0.55 0.04 265)" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Price reveal */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.25)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "oklch(0.55 0.04 265)" }}>
              Total Value
            </p>
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-2xl line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$139</span>
              <span className="text-5xl font-display font-black" style={{ color: "oklch(0.82 0.16 65)" }}>
                {expired ? "$47" : formatPrice(5)}
              </span>
            </div>
            {!expired && (
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>
                One-time payment · Instant access · 30-day money-back guarantee
              </p>
            )}
          </div>
        </div>

        {/* ── ORDER BUMP ── */}
        {!expired && (
          <OrderBump />
        )}

        {/* ── CTA ── */}
        {expired ? (
          <div
            className="rounded-xl p-5 text-center mb-6"
            style={{ background: "oklch(0.65 0.20 25 / 0.08)", border: "1px solid oklch(0.65 0.20 25 / 0.3)" }}
          >
            <p className="font-bold text-lg mb-1" style={{ color: "oklch(0.65 0.20 25)" }}>
              This offer has expired.
            </p>
            <p className="text-sm mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>
              You can still get the full system at the regular price.
            </p>
            <CheckoutButton productId="main" email={email || undefined} sessionId={sessionId}>
              Get Full System — {formatPrice(47)}
            </CheckoutButton>
          </div>
        ) : (
          <div className="mb-6">
            <CheckoutButton productId="main" email={email || undefined} sessionId={sessionId}>
              YES — I Want the Full System for {formatPrice(5)} →
            </CheckoutButton>
            <p className="text-center text-xs mt-3" style={{ color: "oklch(0.38 0.03 265)" }}>
              Secure checkout · Instant access · Cancel anytime
            </p>
          </div>
        )}

        {/* ── SOCIAL PROOF ── */}
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />)}
          <span className="text-sm ml-1" style={{ color: "oklch(0.55 0.04 265)" }}>4.9/5 · 2,341 customers</span>
        </div>

        {/* ── GUARANTEE ── */}
        <div
          className="rounded-xl p-4 flex items-start gap-3 mt-6"
          style={{ background: "oklch(0.65 0.18 145 / 0.06)", border: "1px solid oklch(0.65 0.18 145 / 0.2)" }}
        >
          <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.65 0.18 145)" }} />
          <div>
            <p className="font-bold text-sm mb-0.5" style={{ color: "oklch(0.80 0.01 265)" }}>
              30-Day Sleep Better Guarantee
            </p>
            <p className="text-xs" style={{ color: "oklch(0.52 0.04 265)" }}>
              If you don't sleep noticeably better within 30 days, we'll refund every penny. No questions, no hoops.
            </p>
          </div>
        </div>

        {/* ── DISMISS (no hard sell) ── */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs transition-opacity hover:opacity-70"
            style={{ color: "oklch(0.32 0.03 265)" }}
          >
            No thanks, I'll just use the free guide and figure it out myself
          </a>
        </div>
      </div>
    </div>
  );
}

// ── ORDER BUMP COMPONENT ──
function OrderBump() {
  const [checked, setChecked] = useState(false);
  return (
    <div
      className="rounded-2xl p-4 mb-6 cursor-pointer select-none"
      style={{
        background: checked ? "oklch(0.78 0.18 65 / 0.10)" : "oklch(0.09 0.025 255)",
        border: checked ? "2px solid oklch(0.78 0.18 65 / 0.60)" : "2px dashed oklch(0.30 0.04 265)",
        transition: "all 0.2s",
      }}
      onClick={() => setChecked((v) => !v)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div
          className="w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all"
          style={{
            background: checked ? "oklch(0.78 0.18 65)" : "transparent",
            borderColor: checked ? "oklch(0.78 0.18 65)" : "oklch(0.40 0.04 265)",
          }}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
              <path d="M2 6l3 3 5-5" stroke="oklch(0.06 0.025 255)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: "oklch(0.65 0.20 25 / 0.15)", color: "oklch(0.75 0.20 25)" }}
            >
              Add-on — Only $3
            </span>
            <span className="text-xs line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$19 value</span>
          </div>
          <p className="font-bold text-sm mb-1" style={{ color: "oklch(0.90 0.01 265)" }}>
            YES — Add the ASMR Sleep Audio Pack (+$3)
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "oklch(0.58 0.04 265)" }}>
            5 guided ASMR sleep tracks (30–60 min each) narrated by Luna. Proven to reduce sleep onset time by 37%. One-click add — charged with your main order.
          </p>
        </div>
      </div>
    </div>
  );
}
