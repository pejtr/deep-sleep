import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Check, Clock, Users, Shield, Zap, TrendingUp, X, Star } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/hooks/useSession";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";

const CHRONOTYPE_BENEFITS: Record<Chronotype, string[]> = {
  Lion: [
    "Stop waking at 4 AM — stay asleep through the night",
    "Morning energy protocol calibrated for early risers",
    "7-day cortisol reset sequence for Lions",
  ],
  Bear: [
    "Eliminate morning grogginess permanently",
    "Optimize your 11 PM–7 AM sleep window",
    "Energy timing protocol for Bear chronotype",
  ],
  Wolf: [
    "Quiet your racing mind in under 8 minutes",
    "Shift your sleep window without fighting biology",
    "Night-owl specific wind-down sequence",
  ],
  Dolphin: [
    "Sleep through noise and disturbances",
    "Deep sleep protocol for light sleepers",
    "Nervous system calming technique for Dolphins",
  ],
};

export default function UpsellEntry() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const email = params.get("email") ?? "";
  const sessionId = getSessionId();
  const { currency, isLowTier, formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [liveViewers] = useState(() => Math.floor(Math.random() * 8) + 14);

  const createSession = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to secure checkout...");
        window.location.href = data.url;
      }
    },
    onError: () => {
      setLoading(false);
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleAccept = () => {
    setLoading(true);
    createSession.mutate({
      productId: "main",
      sessionId,
      email: email || undefined,
      chronotype,
      currency: currency.code.toLowerCase(),
      isLowTier,
      origin: window.location.origin,
    });
  };

  const handleDecline = () => {
    navigate("/upsell1");
  };

  const benefits = CHRONOTYPE_BENEFITS[chronotype] ?? CHRONOTYPE_BENEFITS.Bear;

  return (
    <div className="min-h-screen pb-24" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Ambient orbs */}
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-10%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      {/* Urgency banner */}
      <CountdownTimer variant="banner" label="One-time upgrade expires in:" />

      {/* Live viewers */}
      <div className="flex items-center justify-center gap-2 py-2" style={{ background: "oklch(0.12 0.03 255)" }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs" style={{ color: "oklch(0.60 0.04 265)" }}>
          <strong className="text-green-400">{liveViewers} people</strong> upgraded in the last hour
        </span>
      </div>

      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { label: "1-Night", done: true },
            { label: "Full Protocol", active: true },
            { label: "Optimizer", done: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && (
                <div className="w-8 h-0.5" style={{ background: s.active ? "oklch(0.78 0.18 65)" : "oklch(0.25 0.02 265)" }} />
              )}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${s.done ? "bg-green-500" : s.active ? "bg-amber-500 animate-pulse" : ""}`}
                style={!s.done && !s.active ? { background: "oklch(0.20 0.02 265)" } : {}}
              >
                {s.done ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <span className="text-xs font-bold" style={{ color: s.active ? "black" : "oklch(0.40 0.02 265)" }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className="text-xs"
                style={{
                  color: s.done ? "oklch(0.65 0.15 145)" : s.active ? "oklch(0.82 0.16 65)" : "oklch(0.40 0.02 265)",
                  fontWeight: s.active ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Headline — Hormozi "problem → agitate → solution" */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: "oklch(0.65 0.15 145 / 0.15)", border: "1px solid oklch(0.65 0.15 145 / 0.3)" }}>
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-xs font-semibold text-green-300">Your 1-Night Plan is Ready</span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            One Night Won't Fix Years of Bad Sleep
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
            Your 1-Night Optimizer will help <em>tonight</em>. But research shows it takes{" "}
            <strong style={{ color: "oklch(0.82 0.16 65)" }}>7 consecutive nights</strong> to rewire your circadian rhythm.
            Without the full protocol, you'll be back to square one by Thursday.
          </p>
        </div>

        {/* Value stack card — Hormozi "make the offer so good they feel stupid saying no" */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: "oklch(0.11 0.03 255)", border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}
        >
          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: "oklch(0.78 0.18 65 / 0.1)" }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "oklch(0.82 0.16 65)" }}>
              Upgrade to Full 7-Night Protocol
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "oklch(0.78 0.18 65 / 0.2)", color: "oklch(0.82 0.16 65)" }}>
              91% OFF
            </span>
          </div>

          <div className="px-5 py-5">
            {/* What you get */}
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "oklch(0.55 0.04 265)" }}>
              Everything in your 1-Night plan PLUS:
            </p>
            <div className="flex flex-col gap-2.5 mb-5">
              {[
                { text: `${chronotype}-specific 7-night sleep schedule`, value: "$19" },
                { text: "Progressive relaxation audio (Night 1–7)", value: "$12" },
                { text: "Sleep environment optimization checklist", value: "$7" },
                ...benefits.map((b) => ({ text: b, value: "$9" })),
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm" style={{ color: "oklch(0.82 0.04 265)" }}>{item.text}</span>
                    <span className="text-xs line-through ml-2 shrink-0" style={{ color: "oklch(0.40 0.04 265)" }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total value vs price */}
            <div className="rounded-xl p-4 mb-4" style={{ background: "oklch(0.08 0.02 255)", border: "1px solid oklch(0.20 0.03 265)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>Total value:</span>
                <span className="text-sm line-through" style={{ color: "oklch(0.45 0.04 265)" }}>{formatPrice(47)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>Your upgrade price:</span>
                <span className="text-3xl font-display font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>
                  {formatPrice(4)}
                </span>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: "oklch(0.50 0.04 265)" }}>
                That's less than a single coffee for 7 nights of deep sleep
              </p>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2" style={{ borderColor: "oklch(0.11 0.03 255)", background: `oklch(${0.3 + i * 0.08} 0.08 ${200 + i * 20})` }} />
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>12,847 upgraded</span>
            </div>

            {/* CTA */}
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full rounded-xl py-4 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
              style={{
                background: loading ? "oklch(0.55 0.12 65)" : "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.65 0.20 55))",
                color: "oklch(0.10 0.02 255)",
                boxShadow: loading ? "none" : "0 4px 20px oklch(0.78 0.18 65 / 0.4)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Preparing checkout...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Upgrade to Full Protocol — {formatPrice(4)}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
                <Shield className="w-3 h-3" /> 30-day guarantee
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
                <Zap className="w-3 h-3" /> Instant access
              </span>
            </div>
          </div>
        </div>

        {/* Risk reversal — Hormozi guarantee stack */}
        <div className="rounded-xl p-4 mb-6" style={{ background: "oklch(0.10 0.02 255)", border: "1px solid oklch(0.20 0.03 265)" }}>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: "oklch(0.85 0.04 265)" }}>
                Sleep Better or Pay Nothing
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.04 265)" }}>
                Try the full 7-Night Protocol risk-free. If you don't notice a measurable improvement in your sleep quality within 30 days, email us and we'll refund every cent. No questions, no hassle.
              </p>
            </div>
          </div>
        </div>

        {/* Decline link */}
        <button
          onClick={handleDecline}
          className="w-full text-center text-xs py-2"
          style={{ color: "oklch(0.35 0.04 265)" }}
        >
          No thanks, I'll stick with just 1 night
        </button>
      </div>
    </div>
  );
}
