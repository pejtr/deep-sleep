import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star, AlertTriangle, Check, Clock, Users, Shield, Zap, TrendingUp, Feather } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { toast } from "sonner";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "Lion", Bear: "Bear", Wolf: "Wolf", Dolphin: "Dolphin" };
const CHRONOTYPE_TIMES: Record<Chronotype, string> = {
  Lion: "10 PM – 6 AM", Bear: "11 PM – 7 AM", Wolf: "12 AM – 8 AM", Dolphin: "11:30 PM – 6:30 AM",
};
const CHRONOTYPE_PAIN: Record<Chronotype, string> = {
  Lion: "wake up at 4 AM and can't fall back asleep",
  Bear: "feel groggy every morning no matter how long you sleep",
  Wolf: "lie awake until 2 AM with a racing mind",
  Dolphin: "sleep so lightly that every sound wakes you up",
};
const CHRONOTYPE_TESTIMONIALS: Record<Chronotype, { text: string; name: string }> = {
  Lion: { text: "The Optimizer finally stopped my 4 AM wake-ups. 3 months clean.", name: "James T., Lion" },
  Bear: { text: "I stopped feeling groggy after adding the Optimizer to my protocol.", name: "Sarah M., Bear" },
  Wolf: { text: "Racing mind at 2 AM was my life. Not anymore. The Optimizer fixed it.", name: "Alex K., Wolf" },
  Dolphin: { text: "I used to wake at every sound. The Optimizer's sleep environment guide changed everything.", name: "Priya L., Dolphin" },
};

// ── Variant A: Original value-stack layout ────────────────────────────────────
function VariantA({ chronotype, onAccept, onDecline, loading }: {
  chronotype: Chronotype; onAccept: () => void; onDecline: () => void; loading: boolean;
}) {
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "Bear";
  const pain = CHRONOTYPE_PAIN[chronotype] ?? "struggle with poor sleep quality";
  const [liveViewers] = useState(() => Math.floor(Math.random() * 12) + 23);
  const testimonial = CHRONOTYPE_TESTIMONIALS[chronotype];

  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />
      <CountdownTimer variant="banner" label="One-time offer expires in:" />
      <div className="flex items-center justify-center gap-2 py-2" style={{ background: "oklch(0.12 0.03 255)" }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs" style={{ color: "oklch(0.60 0.04 265)" }}>
          <strong className="text-green-400">{liveViewers} people</strong> are viewing this offer right now
        </span>
      </div>
      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[{ label: "Protocol", done: true }, { label: "Optimizer", active: true }, { label: "Audio", done: false }].map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <div className="w-8 h-0.5" style={{ background: s.active ? "oklch(0.78 0.18 65)" : "oklch(0.25 0.02 265)" }} />}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${s.done ? "bg-green-500" : s.active ? "bg-amber-500 animate-pulse" : ""}`}
                style={!s.done && !s.active ? { background: "oklch(0.20 0.02 265)" } : {}}>
                {s.done ? <Check className="w-3.5 h-3.5 text-white" /> : <span className="text-xs font-bold" style={{ color: s.active ? "black" : "oklch(0.40 0.02 265)" }}>{i + 1}</span>}
              </div>
              <span className="text-xs" style={{ color: s.done ? "oklch(0.65 0.15 145)" : s.active ? "oklch(0.82 0.16 65)" : "oklch(0.40 0.02 265)", fontWeight: s.active ? 600 : 400 }}>{s.label}</span>
            </div>
          ))}
        </div>
        {/* Luna speaks */}
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.10 0.04 280), oklch(0.08 0.06 260))", border: "1px solid oklch(0.45 0.12 280 / 0.4)" }}>
          <div className="flex items-start gap-3">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna-avatar-ZRuJw2SPLknXZS2RAKU4vn.webp"
              alt="Luna" className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
              style={{ border: "2px solid oklch(0.65 0.18 280 / 0.6)" }} />
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Feather className="w-3 h-3" style={{ color: "oklch(0.72 0.16 280)" }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.72 0.16 280)" }}>Luna speaks</span>
              </div>
              <p className="text-xs leading-relaxed italic" style={{ color: "oklch(0.85 0.03 265)" }}>
                "The Lakota say: <em>Mitákuye Oyásʼiŋ</em> — we are all connected. Your sleep rhythm is woven into the same cycles as the moon, the seasons, the stars.
                <strong style={{ color: "oklch(0.82 0.16 65)", fontStyle: "normal" }}> Your {chronotype} nature is not a flaw — it is your medicine.</strong> But medicine without the right ritual fades."
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{icon}</div>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            Your Protocol Is Only Half the Journey
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
            As a <strong style={{ color: "oklch(0.82 0.16 65)" }}>{chronotype}</strong>, you {pain}. The 7-Night Protocol resets your rhythm, but without the <strong style={{ color: "oklch(0.82 0.16 65)" }}>Chronotype Optimizer</strong>, 87% of {chronotype}s return to old patterns within 30 days. The ancestors called it <em>"losing the thread."</em>
          </p>
        </div>
        <div className="rounded-2xl p-4 mb-6" style={{ background: "oklch(0.15 0.06 25 / 0.4)", border: "1px solid oklch(0.60 0.20 25 / 0.3)" }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-sm font-bold text-red-300">Without the Optimizer, here's what typically happens:</p>
          </div>
          <div className="flex flex-col gap-1.5 ml-6">
            {["Week 1-2: Great results from the protocol ✓", "Week 3: Old habits creep back, sleep window shifts", "Week 4: Back to square one — lying awake, exhausted mornings"].map((item, i) => (
              <p key={i} className="text-xs" style={{ color: i < 1 ? "oklch(0.65 0.15 145)" : "oklch(0.60 0.12 25)" }}>{item}</p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-4" style={{ background: "oklch(0.12 0.04 25 / 0.3)", border: "1px solid oklch(0.30 0.08 25 / 0.3)" }}>
            <p className="text-xs font-bold text-red-300 mb-2">❌ Protocol Only</p>
            {["Short-term fix", "Generic advice", "No tracking", "Relapse risk"].map((item, i) => (
              <p key={i} className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{item}</p>
            ))}
          </div>
          <div className="rounded-xl p-4" style={{ background: "oklch(0.12 0.04 145 / 0.2)", border: "1px solid oklch(0.50 0.15 145 / 0.3)" }}>
            <p className="text-xs font-bold text-green-300 mb-2">Protocol + Optimizer</p>
            {["Permanent change", `${chronotype}-specific`, "30-day tracker", "3x faster results"].map((item, i) => (
              <p key={i} className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</p>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-4" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <h2 className="font-bold text-lg mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>{chronotype} Chronotype Optimizer</h2>
          <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.04 265)" }}>The 30-day system that makes your protocol results permanent</p>
          <div className="flex flex-col gap-2 mb-5">
            {[
              { item: `${chronotype}-specific supplement stack guide`, value: "$29" },
              { item: "30-day habit tracker with daily prompts", value: "$19" },
              { item: `${chronotype} morning activation protocol`, value: "$15" },
              { item: "Sleep environment optimization checklist", value: "$12" },
              { item: "Chronotype-matched meal timing guide", value: "$15" },
              { item: "Priority email support for 30 days", value: "$25" },
            ].map(({ item, value }, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }}>✓</span>
                  <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
                </div>
                <span className="text-xs line-through flex-shrink-0" style={{ color: "oklch(0.35 0.04 265)" }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 mb-4" style={{ background: "oklch(0.78 0.18 65 / 0.06)", border: "1px dashed oklch(0.78 0.18 65 / 0.3)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>Total Value:</span>
              <span className="text-sm line-through" style={{ color: "oklch(0.45 0.04 265)" }}>$115</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>Your Price Today:</span>
              <span className="text-2xl font-black" style={{ color: "oklch(0.82 0.16 65)" }}>$17</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
            <p className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}><strong style={{ color: "oklch(0.82 0.16 65)" }}>2,847 {chronotype}s</strong> used this to make results permanent</p>
          </div>
          <div className="rounded-xl p-3 mb-5" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.20 0.02 265)" }}>
            <p className="text-xs italic" style={{ color: "oklch(0.65 0.04 265)" }}>"{testimonial.text}"</p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 265)" }}>— {testimonial.name} · verified buyer</p>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$115</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$17</span>
            <div className="badge-popular">85% OFF</div>
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>today only</span>
          </div>
          <CountdownTimer variant="inline" label="This price disappears in:" />
          <button onClick={onAccept} disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : `Yes! Add the ${chronotype} Optimizer — $17`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-4 mt-3">
            {[{ icon: Shield, text: "Secure" }, { icon: Clock, text: "Instant access" }, { icon: Users, text: "30-day guarantee" }].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-1">
                <Icon className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
                <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onDecline} className="w-full flex items-center justify-center gap-1 py-3 text-xs opacity-40 hover:opacity-60 transition-opacity" style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          <span>No thanks, I'll risk losing my results without the optimizer</span>
        </button>
      </div>
    </div>
  );
}

// ── Variant B: Urgency-first "Quick Decision" layout ──────────────────────────
function VariantB({ chronotype, onAccept, onDecline, loading }: {
  chronotype: Chronotype; onAccept: () => void; onDecline: () => void; loading: boolean;
}) {
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "Bear";
  const testimonial = CHRONOTYPE_TESTIMONIALS[chronotype];

  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-96 h-96 opacity-10" style={{ top: "10%", left: "50%", transform: "translateX(-50%)" }} />
      <CountdownTimer variant="banner" label="This upgrade disappears when you leave:" />

      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        {/* Big bold headline — urgency first */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{icon}</div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: "oklch(0.78 0.18 65 / 0.12)", border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
            <Zap className="w-3.5 h-3.5" style={{ color: "oklch(0.82 0.16 65)" }} />
            <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>One-Time {chronotype} Upgrade</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-3 leading-tight" style={{ color: "oklch(0.95 0.01 265)" }}>
            Make Your Results <span style={{ color: "oklch(0.82 0.16 65)" }}>Permanent</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
            87% of {chronotype}s who skip this relapse within 30 days. Don't be one of them.
          </p>
        </div>

        {/* Social proof bar */}
        <div className="flex items-center justify-center gap-6 mb-6 p-3 rounded-2xl" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.20 0.02 265)" }}>
          {[
            { value: "2,847", label: `${chronotype}s helped` },
            { value: "94%", label: "success rate" },
            { value: "30 days", label: "to permanent change" },
          ].map(({ value, label }, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-black" style={{ color: "oklch(0.82 0.16 65)" }}>{value}</p>
              <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* What you get — compact */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
            <h2 className="font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>The {chronotype} Optimizer includes:</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              `${chronotype}-specific supplement guide`,
              "30-day habit tracker",
              "Morning activation protocol",
              "Sleep environment checklist",
              "Meal timing guide",
              "30-day email support",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.65 0.18 145)" }} />
                <span className="text-xs leading-tight" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: "oklch(0.12 0.04 265 / 0.5)", border: "1px solid oklch(0.78 0.18 65 / 0.15)" }}>
          <div className="flex mb-2">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
          <p className="text-sm italic mb-2" style={{ color: "oklch(0.75 0.04 265)" }}>"{testimonial.text}"</p>
          <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>— {testimonial.name} · verified buyer</p>
        </div>

        {/* Price + CTA — dominant */}
        <div className="rounded-3xl p-6 mb-4" style={{ background: "linear-gradient(135deg, oklch(0.12 0.04 255), oklch(0.10 0.03 255))", border: "2px solid oklch(0.78 0.18 65 / 0.4)" }}>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs mb-1" style={{ color: "oklch(0.50 0.04 265)" }}>Total value: <span className="line-through">$115</span></p>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-5xl" style={{ color: "oklch(0.82 0.16 65)" }}>$17</span>
                <span className="text-sm font-semibold px-2 py-0.5 rounded-full" style={{ background: "oklch(0.55 0.18 145 / 0.2)", color: "oklch(0.65 0.18 145)" }}>85% OFF</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>one-time</p>
              <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>no subscription</p>
            </div>
          </div>
          <CountdownTimer variant="inline" label="Offer expires:" />
          <button onClick={onAccept} disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-lg font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
            <Lock className="w-5 h-5" />
            <span>{loading ? "Processing..." : `Add ${chronotype} Optimizer — $17`}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-xs mt-3" style={{ color: "oklch(0.45 0.04 265)" }}>
            Secure checkout · Instant download · 30-day guarantee
          </p>
        </div>

        <button onClick={onDecline} className="w-full flex items-center justify-center gap-1 py-3 text-xs opacity-30 hover:opacity-50 transition-opacity" style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          <span>No thanks, I don't need permanent results</span>
        </button>
      </div>
    </div>
  );
}

// ── Main component with A/B routing ──────────────────────────────────────────
export default function Upsell1() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"A" | "B" | null>(null);
  const { track } = useTrackBehavior();
  const checkoutMutation = trpc.checkout.createSession.useMutation();
  const assignVariant = trpc.upsellAb.assignVariant.useMutation();
  const trackConversion = trpc.upsellAb.trackConversion.useMutation();

  useEffect(() => {
    const sessionId = getSessionId();
    track("page_view", { page: "upsell1", value: { chronotype } });
    assignVariant.mutateAsync({ sessionId, page: "upsell1", chronotype }).then(r => {
      setVariant(r.variant);
      track("ab_impression", { page: "upsell1", value: { variant: r.variant } });
    }).catch(() => setVariant("A"));
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell1", value: { chronotype, price: 17, variant } });
    try {
      const result = await checkoutMutation.mutateAsync({
        productId: "oto1",
        sessionId: getSessionId(),
        chronotype,
        origin: window.location.origin,
      });
      if (result.url) {
        // Track conversion for A/B test
        await trackConversion.mutateAsync({ sessionId: getSessionId(), page: "upsell1", revenue: "17.00" });
        toast.info("Redirecting to secure checkout...");
        window.open(result.url, "_blank");
      }
    } catch {
      toast.error("Checkout error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    track("upsell_decline", { page: "upsell1", value: { chronotype, variant } });
    navigate(`/upsell2?chronotype=${chronotype}`);
  };

  if (!variant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {variant === "B"
        ? <VariantB chronotype={chronotype} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />
        : <VariantA chronotype={chronotype} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />}
      <StickyMobileCTA />
    </>
  );
}
