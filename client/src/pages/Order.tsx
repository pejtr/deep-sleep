import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Lock, Shield, Star, ArrowRight, Users, CreditCard, Plus, Check, Download, Zap, Moon, Brain, Feather, Sparkles } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import TrustBar from "@/components/TrustBar";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior, captureUTM } from "@/hooks/useSession";
import { CheckoutButton } from "@/components/CheckoutButton";
import ExpressCheckout from "@/components/ExpressCheckout";
import { trackViewContent } from "@/lib/conversionTracking";
import { useTransition } from "@/contexts/TransitionContext";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";

const CHRONOTYPE_ICONS: Record<Chronotype, React.ElementType> = {
  Lion: Zap, Bear: Moon, Wolf: Brain, Dolphin: Star,
};

export default function Order() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "") as Chronotype;
  const IconComponent = CHRONOTYPE_ICONS[chronotype as keyof typeof CHRONOTYPE_ICONS] ?? Moon;

  // Quiz-first guard: redirect to quiz if no chronotype in URL
  useEffect(() => {
    if (!params.get("chronotype")) {
      // Check sessionStorage for previously captured chronotype
      const savedChronotype = sessionStorage.getItem('quiz_chronotype');
      if (savedChronotype) {
        navigate(`/order?chronotype=${savedChronotype}`);
      } else {
        navigate('/quiz');
      }
    }
  }, []);
  const [selectedTier, setSelectedTier] = useState<"discount" | "main">("main");

  const [buyers] = useState(() => Math.floor(Math.random() * 15) + 8);
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 60) + 180);
  const [spotsLeft] = useState(() => Math.floor(Math.random() * 8) + 3);
  const [loading, setLoading] = useState(false);
  const [bumpSelected, setBumpSelected] = useState(false);
  const [timerSecs, setTimerSecs] = useState(() => {
    const stored = sessionStorage.getItem('checkout_timer');
    return stored ? parseInt(stored, 10) : 15 * 60;
  });

  // Countdown timer — session-persistent
  useEffect(() => {
    const id = setInterval(() => {
      setTimerSecs(s => {
        const next = s > 0 ? s - 1 : 0;
        sessionStorage.setItem('checkout_timer', String(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Slowly decrease viewers for social proof
  useEffect(() => {
    const id = setInterval(() => {
      setViewers(v => v > 120 ? v - Math.floor(Math.random() * 2) : v);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const timerMins = String(Math.floor(timerSecs / 60)).padStart(2, '0');
  const timerSecStr = String(timerSecs % 60).padStart(2, '0');
  const { track } = useTrackBehavior();
  const { formatPrice, currency } = useCurrency();
  const { isTransitioning } = useTransition();

  // Trigger staggered reveal once the loading overlay has cleared
  const [pageReady, setPageReady] = useState(false);
  useEffect(() => {
    if (!isTransitioning) {
      // Small buffer so the overlay fade-out completes before reveal starts
      const t = setTimeout(() => setPageReady(true), 80);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  useEffect(() => {
    captureUTM();
    track("page_view", { page: "order", value: { chronotype } });
    trackViewContent({ productId: selectedTier === "discount" ? "discount" : "main", productName: selectedTier === "discount" ? "1-Night Optimizer" : "Deep Sleep Reset Protocol", value: selectedTier === "discount" ? 1 : 4 });
  }, [selectedTier]);

  const r = (delay: number) => pageReady ? `checkout-reveal checkout-reveal-d${delay}` : "opacity-0";

  return (
    <div className="min-h-screen pb-32 md:pb-0" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Orbs */}
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      {/* Sticky urgency bar — pulsing red/amber */}
      <div className="sticky top-0 z-50 w-full py-2 px-4 flex items-center justify-center gap-3"
        style={{ background: timerSecs < 300 ? "oklch(0.35 0.18 15)" : "oklch(0.18 0.08 30)", borderBottom: "1px solid oklch(0.55 0.18 45 / 0.5)" }}>
        <span className="text-xs font-black uppercase tracking-wider" style={{ color: timerSecs < 300 ? "oklch(0.95 0.05 65)" : "oklch(0.88 0.14 65)" }}>
          ⚡ Special price expires in:
        </span>
        <span className="font-black text-sm tabular-nums px-2 py-0.5 rounded-md"
          style={{ background: "oklch(0.78 0.18 65)", color: "black", animation: timerSecs < 60 ? "pulse 0.8s infinite" : "none" }}>
          {timerMins}:{timerSecStr}
        </span>
        <span className="text-xs hidden sm:inline" style={{ color: "oklch(0.65 0.08 65)" }}>
          — Price goes to ${selectedTier === "discount" ? "9" : "27"} after
        </span>
      </div>

      {/* Urgency banner */}
      <CountdownTimer variant="banner" label="Locked-in price expires in:" />

      {/* Header */}
      <div className={`relative z-10 container py-4 flex items-center justify-center ${r(0)}`}>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
          <span className="text-sm font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>
            Secure Checkout — Deep Sleep Reset
          </span>
        </div>
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto py-8">

        {/* Live FOMO indicators — 3 badges */}
        <div className={`flex flex-wrap items-center justify-center gap-3 mb-8 ${r(1)}`}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "oklch(0.12 0.04 145 / 0.6)", border: "1px solid oklch(0.45 0.14 145 / 0.4)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "oklch(0.65 0.20 145)" }} />
            <span className="text-xs" style={{ color: "oklch(0.65 0.20 145)" }}>
              <strong>{buyers}</strong> bought in last hour
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "oklch(0.12 0.04 265 / 0.6)", border: "1px solid oklch(0.45 0.08 265 / 0.4)" }}>
            <Users className="w-3 h-3" style={{ color: "oklch(0.65 0.10 265)" }} />
            <span className="text-xs" style={{ color: "oklch(0.65 0.10 265)" }}>
              <strong>{viewers}</strong> viewing now
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "oklch(0.15 0.08 30 / 0.6)", border: "1px solid oklch(0.65 0.18 45 / 0.5)" }}>
            <span className="text-xs font-black" style={{ color: "oklch(0.78 0.18 45)" }}>🔥</span>
            <span className="text-xs" style={{ color: "oklch(0.78 0.18 45)" }}>
              Only <strong>{spotsLeft} spots</strong> at this price
            </span>
          </div>
        </div>

        {/* TikTok viral badge */}
        <div className={`flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-full mx-auto w-fit ${r(2)}`}
          style={{ background: "oklch(0.12 0.03 290)", border: "1px solid oklch(0.55 0.15 290 / 0.5)" }}>
          <span className="text-sm">▶</span>
          <span className="text-xs font-bold" style={{ color: "oklch(0.80 0.14 290)" }}>As seen on TikTok</span>
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>· 244K+ views</span>
        </div>

        {/* Luna Fate Section — NEURO: narrative transportation + micro-commitment */}
        <div className={`rounded-3xl p-6 mb-8 relative overflow-hidden ${r(3)}`}
          style={{ background: "linear-gradient(135deg, oklch(0.10 0.04 280), oklch(0.08 0.06 260))", border: "1px solid oklch(0.45 0.12 280 / 0.4)" }}>
          <div className="orb w-48 h-48 opacity-20" style={{ background: "oklch(0.55 0.18 280)", top: "-30%", right: "-10%", position: "absolute", borderRadius: "50%", filter: "blur(40px)" }} />
          {/* NEURO: Micro-commitment — "you already took the first step" */}
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="flex gap-1">
              {["Quiz","Results","Protocol"].map((step,i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{background: i < 2 ? "oklch(0.55 0.18 145)" : "oklch(0.78 0.18 65)",color:"black"}}>
                    {i < 2 ? "✓" : "3"}
                  </div>
                  <span className="text-xs" style={{color: i < 2 ? "oklch(0.65 0.18 145)" : "oklch(0.78 0.18 65)",fontWeight: i===2?"bold":"normal"}}>{step}</span>
                  {i < 2 && <span className="text-xs" style={{color:"oklch(0.30 0.04 265)"}}>›</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna-avatar-ZRuJw2SPLknXZS2RAKU4vn.webp"
              alt="Luna — your dream guide"
              className="w-16 h-16 rounded-full flex-shrink-0 object-cover"
              style={{ border: "2px solid oklch(0.65 0.18 280 / 0.6)", boxShadow: "0 0 20px oklch(0.55 0.18 280 / 0.3)" }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Feather className="w-3.5 h-3.5" style={{ color: "oklch(0.72 0.16 280)" }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.72 0.16 280)" }}>Luna speaks</span>
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: "oklch(0.88 0.03 265)" }}>
                "The elders say: <strong style={{ color: "oklch(0.82 0.16 65)", fontStyle: "normal" }}>you do not find sleep — sleep finds you</strong>, when you stop fighting your nature.
                You came here for a reason. Your body has been sending signals. Tonight, you answer."
              </p>
              <p className="text-xs mt-2" style={{ color: "oklch(0.55 0.04 265)" }}>— Luna, Dream Guide &amp; Sleep Scientist</p>
            </div>
          </div>
          <div className="mt-4 pt-4 relative z-10" style={{ borderTop: "1px solid oklch(0.25 0.04 280 / 0.5)" }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: "🌙", label: "Nights 1–3", desc: "Fall asleep 47 min faster" },
                { icon: "🦅", label: "Nights 4–5", desc: "Deep sleep +31% longer" },
                { icon: "⭐", label: "Night 7", desc: "Wake refreshed, no alarm" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-2" style={{ background: "oklch(0.12 0.03 265 / 0.6)" }}>
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xs font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>{s.label}</div>
                  <div className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Tiers Selector */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ${r(4)}`}>
          {/* $1 Entry Tier */}
          <div
            onClick={() => setSelectedTier("discount")}
            className="glass-card rounded-3xl p-6 relative overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              border: selectedTier === "discount" ? "2px solid oklch(0.78 0.18 65)" : "1px solid oklch(0.78 0.18 65 / 0.3)",
              transform: selectedTier === "discount" ? "scale(1.02)" : "scale(1)",
            }}
          >
            <div className="orb orb-gold w-32 h-32 opacity-10" style={{ top: "-20%", right: "-10%" }} />
            
            <div className="badge-popular mb-3">Quick Start</div>
            
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-6 h-6" style={{ color: "oklch(0.78 0.18 65)" }} />
              <h2 className="font-display font-bold text-lg" style={{ color: "oklch(0.95 0.01 265)" }}>
                1-Night Optimizer
              </h2>
            </div>

            <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>
              Perfect for testing what works for your {chronotype} chronotype
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {[
                "Tonight's Sleep Optimization Guide",
                "Chronotype-Specific Protocol",
                "Sleep Trigger Audio (5 min)",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.78 0.18 65)" }} />
                  <span className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>{formatPrice(1)}</span>
              <span className="text-xs mt-1" style={{ color: "oklch(0.55 0.04 265)" }}>Quick start — 1 night</span>
              <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>One-time payment</p>
            </div>

            <button
              onClick={() => setSelectedTier("discount")}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: selectedTier === "discount" ? "oklch(0.78 0.18 65)" : "oklch(0.78 0.18 65 / 0.2)",
                color: selectedTier === "discount" ? "black" : "oklch(0.78 0.18 65)",
              }}
            >
              {selectedTier === "discount" ? "Selected" : "Choose"}
            </button>
          </div>

          {/* $7 Full Tier */}
          <div
            onClick={() => setSelectedTier("main")}
            className="glass-card rounded-3xl p-6 relative overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              border: selectedTier === "main" ? "2px solid oklch(0.78 0.18 65)" : "1px solid oklch(0.78 0.18 65 / 0.3)",
              transform: selectedTier === "main" ? "scale(1.02)" : "scale(1)",
            }}
          >
            <div className="orb orb-gold w-32 h-32 opacity-10" style={{ top: "-20%", right: "-10%" }} />
            
            <div className="badge-popular mb-3">Most Popular</div>
            
            <div className="flex items-center gap-2 mb-3">
              <IconComponent className="w-6 h-6" style={{ color: "oklch(0.78 0.18 65)" }} />
              <h2 className="font-display font-bold text-lg" style={{ color: "oklch(0.95 0.01 265)" }}>
                7-Night Full Protocol
              </h2>
            </div>

            <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>
              Complete {chronotype} sleep transformation system
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {[
                `${chronotype} Chronotype Sleep Guide (PDF)`,
                "7-Night Protocol Tracker & Schedule",
                `${chronotype}-Specific Wind-Down Ritual`,
                "Deep Sleep Trigger Audio (10 min)",
                "Lifetime access + future updates",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.78 0.18 65)" }} />
                  <span className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm line-through" style={{ color: "oklch(0.40 0.04 265)" }}>{formatPrice(97)}</span>
              <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>{formatPrice(4)}</span>
              <div className="badge-popular">96% OFF</div>
            </div>

            <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.04 265)" }}>One-time payment</p>

            <button
              onClick={() => setSelectedTier("main")}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: selectedTier === "main" ? "oklch(0.78 0.18 65)" : "oklch(0.78 0.18 65 / 0.2)",
                color: selectedTier === "main" ? "black" : "oklch(0.78 0.18 65)",
              }}
            >
              {selectedTier === "main" ? "Selected" : "Choose"}
            </button>
          </div>
        </div>

        {/* Selected Product Card */}
        <div className={`glass-card rounded-3xl p-8 mb-6 relative overflow-hidden ${r(5)}`}
          style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="orb orb-gold w-40 h-40 opacity-10" style={{ top: "-20%", right: "-10%" }} />

          {/* Badge */}
          <div className="badge-popular mb-4">One-Time Special Price</div>

          {/* Product title */}
          <div className="flex items-center gap-3 mb-4">
            <IconComponent className="w-10 h-10" style={{ color: "oklch(0.78 0.18 65)" }} />
            <div>
              <h1 className="font-display font-bold text-xl" style={{ color: "oklch(0.95 0.01 265)" }}>
                {selectedTier === "discount" ? "1-Night Optimizer" : `${chronotype} Deep Sleep Protocol`}
              </h1>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>
                {selectedTier === "discount" ? "Quick Start System" : "7-Night Personalized Sleep System"}
              </p>
            </div>
          </div>

          {/* What's included — Value Stack */}
          <div className="flex flex-col gap-2 mb-4">
            {(selectedTier === "discount" ? [
              { item: "Tonight's Sleep Optimization Guide", value: "$19" },
              { item: "Chronotype-Specific Protocol", value: "$17" },
              { item: "Sleep Trigger Audio (5 min)", value: "$9" },
            ] : [
              { item: `${chronotype} Chronotype Sleep Guide (PDF)`, value: "$47" },
              { item: "7-Night Protocol Tracker & Schedule", value: "$27" },
              { item: `${chronotype}-Specific Wind-Down Ritual`, value: "$19" },
              { item: "Deep Sleep Trigger Audio (10 min)", value: "$19" },
              { item: "Lifetime access + future updates", value: "$47" },
            ]).map(({ item, value }, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: "oklch(0.78 0.18 65)" }}>✓</span>
                  <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
                </div>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: "oklch(0.55 0.04 265)" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Bonus Bundle — FREE */}
          {selectedTier === "main" && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "oklch(0.78 0.18 65 / 0.07)", border: "1px solid oklch(0.78 0.18 65 / 0.25)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "oklch(0.78 0.18 65)", color: "black" }}>🎁 FREE BONUSES</span>
                <span className="text-xs line-through" style={{ color: "oklch(0.45 0.04 265)" }}>$63 value</span>
              </div>
              {[
                { icon: "📋", name: "Chronotype Blueprint PDF", desc: "Your personalized daily schedule", value: "$27" },
                { icon: "✅", name: "Sleep Trigger Checklist", desc: "17 science-backed sleep triggers", value: "$19" },
                { icon: "🎧", name: "Night 1 ASMR Audio (10 min)", desc: "Guided relaxation for your first night", value: "$17" },
              ].map(({ icon, name, desc, value }, i) => (
                <div key={i} className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "oklch(0.88 0.08 65)" }}>{name}</p>
                      <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold flex-shrink-0" style={{ color: "oklch(0.55 0.04 265)" }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Value Anchoring Total */}
          {selectedTier === "main" && (
            <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
              <span className="text-sm font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>Total value:</span>
              <div className="flex items-center gap-2">
                <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$222</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: "oklch(0.78 0.18 65)", color: "black" }}>TODAY ONLY: $4</span>
              </div>
            </div>
          )}

          {/* Price with currency switcher */}
          <div className="flex items-center gap-3 mb-4">
            {selectedTier === "main" && (
              <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>{formatPrice(97)}</span>
            )}
            <span className="font-black text-5xl" style={{ color: "oklch(0.82 0.16 65)" }}>
              {formatPrice(selectedTier === "discount" ? 1 : 4)}
            </span>
            {selectedTier === "main" && (
              <div>
                <div className="badge-popular">96% OFF</div>
                <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>One-time payment</p>
              </div>
            )}
            {selectedTier === "discount" && (
              <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>One-time payment</p>
            )}
          </div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>Price shown in:</span>
            <CurrencySwitcher />
          </div>

          {/* Countdown */}
          <div className="mb-6">
            <CountdownTimer variant="inline" label="Price locks in:" />
          </div>

          {/* Order Bump — only for main tier */}
          {selectedTier === "main" && (
            <div
              onClick={() => setBumpSelected(b => !b)}
              className="mb-5 rounded-2xl p-4 cursor-pointer transition-all duration-200 select-none"
              style={{
                background: bumpSelected ? "oklch(0.78 0.18 65 / 0.12)" : "oklch(0.12 0.03 290 / 0.8)",
                border: bumpSelected ? "2px solid oklch(0.78 0.18 65 / 0.7)" : "2px dashed oklch(0.35 0.08 65 / 0.6)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
                  style={{
                    background: bumpSelected ? "oklch(0.78 0.18 65)" : "oklch(0.18 0.03 290)",
                    border: bumpSelected ? "none" : "2px solid oklch(0.40 0.08 65)",
                  }}
                >
                  {bumpSelected && <Check className="w-4 h-4 text-black" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "oklch(0.78 0.18 65)", color: "black" }}>YES! Add this</span>
                    <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>Special one-time offer</span>
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: "oklch(0.90 0.04 265)" }}>
                    Chronotype Optimizer — Personalized 30-Day Plan
                  </p>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "oklch(0.55 0.04 265)" }}>
                    Get a fully personalized sleep schedule, meal timing, and light exposure plan built specifically for your {chronotype} chronotype. Most people see 2x faster results.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs line-through" style={{ color: "oklch(0.40 0.04 265)" }}>{formatPrice(27)}</span>
                    <span className="text-base font-black" style={{ color: "oklch(0.78 0.18 65)" }}>Add for just {formatPrice(11)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Express Checkout — Apple Pay / Google Pay / Link */}
          <div className="mb-4">
            <ExpressCheckout
              productId={selectedTier}
              includeUpsell={selectedTier === "main" && bumpSelected ? "bump" : undefined}
              sessionId={getSessionId()}
              chronotype={chronotype}
              amount={selectedTier === "discount" ? 1 : (bumpSelected ? 7 : 4)}
              label={selectedTier === "discount" ? "1-Night Optimizer" : (bumpSelected ? "Protocol + Optimizer" : "Deep Sleep Protocol")}
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "oklch(0.25 0.02 265)" }} />
            <span className="text-xs font-medium" style={{ color: "oklch(0.45 0.04 265)" }}>or pay with card</span>
            <div className="flex-1 h-px" style={{ background: "oklch(0.25 0.02 265)" }} />
          </div>

          {/* Star rating above CTA — V2-6 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-4 h-4" fill="oklch(0.78 0.18 65)" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold" style={{ color: "oklch(0.78 0.18 65)" }}>4.9/5</span>
            <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>from 2,847 verified buyers</span>
          </div>

          {/* Price increase warning */}
          <div className="rounded-lg p-3 mb-4" style={{ background: "oklch(0.15 0.08 15 / 0.2)", border: "1px solid oklch(0.65 0.15 15 / 0.5)" }}>
            <p className="text-xs font-semibold" style={{ color: "oklch(0.65 0.15 15)" }}>
              Price increases to ${selectedTier === "discount" ? "9" : "27"} in 48 hours
            </p>
            <p className="text-xs opacity-75 mt-1" style={{ color: "oklch(0.65 0.15 15)" }}>
              Lock in this special price now before it expires
            </p>
          </div>

          {/* CTA — Native Stripe Checkout */}
          <CheckoutButton
            productId={selectedTier}
            includeUpsell={selectedTier === "main" && bumpSelected ? "bump" : undefined}
            sessionId={getSessionId()}
            chronotype={chronotype}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-lg"
            variant="primary"
          >
            <Lock className="w-5 h-5" />
            <span>
              {selectedTier === "discount" 
                ? `Get 1-Night Optimizer — ${formatPrice(1)}`
                : (bumpSelected ? `Get Protocol + Audio Pack — ${formatPrice(4)} + ${formatPrice(11)}` : `Get My ${chronotype} Protocol — ${formatPrice(4)}`)
              }
            </span>
            <ArrowRight className="w-5 h-5" />
          </CheckoutButton>

          {/* Payment methods */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <CreditCard className="w-4 h-4" style={{ color: "oklch(0.45 0.04 265)" }} />
            <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>Visa • Mastercard • Apple Pay • Google Pay</span>
          </div>
        </div>

        {/* Enhanced Trust Badges */}
        <div className="mt-8 rounded-2xl p-5" style={{ background: "oklch(0.10 0.03 265 / 0.6)", border: "1px solid oklch(0.25 0.04 265 / 0.5)" }}>
          <p className="text-xs font-bold text-center uppercase tracking-widest mb-4" style={{ color: "oklch(0.50 0.04 265)" }}>Your purchase is protected</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "🔒", title: "256-bit SSL", desc: "Bank-level encryption" },
              { icon: "✅", title: "30-Day Guarantee", desc: "Full refund, no questions" },
              { icon: "⚡", title: "Instant Download", desc: "Access in 60 seconds" },
              { icon: "🧠", title: "CBT-I Backed", desc: "#1 evidence-based method" },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1 p-3 rounded-xl" style={{ background: "oklch(0.12 0.03 265 / 0.5)" }}>
                <span className="text-2xl">{b.icon}</span>
                <span className="text-xs font-bold" style={{ color: "oklch(0.82 0.08 265)" }}>{b.title}</span>
                <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{b.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 flex items-center justify-center gap-2" style={{ borderTop: "1px solid oklch(0.20 0.03 265 / 0.5)" }}>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: "oklch(0.78 0.18 65)" }}>★</span>)}
            </div>
            <span className="text-xs font-semibold" style={{ color: "oklch(0.78 0.18 65)" }}>4.9/5</span>
            <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>from 2,847 verified buyers</span>
          </div>
        </div>

        {/* Original TrustBar */}
        <div className={r(6)}><TrustBar /></div>
        {/* Compliance disclaimer */}
        <p className="text-xs text-center mt-4 max-w-md mx-auto" style={{ color: "oklch(0.35 0.04 265)" }}>
          This is an educational wellness guide based on evidence-informed CBT-I principles. Not medical advice. Results vary. Always consult a qualified healthcare professional for medical concerns.
        </p>
      </div>

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />

      {/* Live Sales Notifications */}
      <LiveSalesNotification />
    </div>
  );
}
