/**
 * Upsell3 — Sleep Optimizer Membership $8/month
 * Luna persona · Hormozi value stack · Long-term ecosystem play
 * A/B tested: Variant A (full stack) vs Variant B (minimalist)
 */
import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star, Crown, Zap, Moon, MessageCircle, TrendingUp, Check, Shield, Clock, Feather, Sparkles, Brain } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { toast } from "sonner";
import { useTransition } from "@/contexts/TransitionContext";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";

const MEMBERSHIP_FEATURES = [
  {
    icon: Moon,
    label: "Monthly Sleep Protocol",
    desc: "New evidence-informed protocol every month — seasonal adjustments, advanced CBT-I techniques, latest sleep research",
    value: "$29/mo",
  },
  {
    icon: MessageCircle,
    label: "AI Sleep Coach (Luna)",
    desc: "24/7 AI coach that knows your chronotype, tracks your progress, and answers questions instantly — no waiting for appointments",
    value: "$19/mo",
  },
  {
    icon: TrendingUp,
    label: "Sleep Score Tracking",
    desc: "Daily sleep quality scoring with trend analysis and personalized recommendations based on your chronotype patterns",
    value: "$9/mo",
  },
  {
    icon: Zap,
    label: "Advanced Optimization",
    desc: "Supplement timing, light therapy schedules, and evidence-based biohacking protocols tailored to your chronotype",
    value: "$15/mo",
  },
  {
    icon: Crown,
    label: "VIP Community Access",
    desc: "Private community of 12,847+ sleep optimizers — accountability partners, expert Q&As, and peer support",
    value: "$12/mo",
  },
  {
    icon: Sparkles,
    label: "All Future Products Free",
    desc: "Every new course, protocol, and tool we release — included in your membership at no extra charge",
    value: "Priceless",
  },
];

const CHRONOTYPE_BENEFIT: Record<Chronotype, string> = {
  Lion: "early risers who want to maintain peak energy through the afternoon slump",
  Bear: "the majority chronotype — monthly protocols tuned to your natural 8-hour rhythm",
  Wolf: "night owls who need strategies for functioning in a 9-to-5 world without burning out",
  Dolphin: "light sleepers who need ongoing support to maintain the progress you've made",
};

// ── Variant A: Luna-led full value stack ──────────────────────────────────
function VariantA({ chronotype, onAccept, onDecline, loading }: {
  chronotype: Chronotype; onAccept: () => void; onDecline: () => void; loading: boolean;
}) {
  const benefit = CHRONOTYPE_BENEFIT[chronotype];
  const totalValue = MEMBERSHIP_FEATURES.reduce((sum, f) => {
    const val = f.value === "Priceless" ? 0 : parseInt(f.value.replace("$", "").replace("/mo", ""));
    return sum + val;
  }, 0);

  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />
      <CountdownTimer variant="banner" label="Membership offer expires in:" />

      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { label: "Protocol", done: true },
            { label: "Optimizer", done: true },
            { label: "Audio", done: true },
            { label: "Membership", done: false, active: true },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-5 h-0.5" style={{ background: step.done ? "oklch(0.65 0.20 145)" : "oklch(0.82 0.16 65)" }} />}
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: step.done ? "oklch(0.65 0.20 145)" : step.active ? "oklch(0.82 0.16 65)" : "oklch(0.25 0.04 265)" }}>
                  {step.done ? <Check className="w-3 h-3 text-white" /> : <span className="text-[10px] font-bold text-white">{i + 1}</span>}
                </div>
                <span className="text-[10px] font-semibold hidden sm:block" style={{ color: step.done ? "oklch(0.65 0.20 145)" : step.active ? "oklch(0.82 0.16 65)" : "oklch(0.45 0.04 265)" }}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Luna speaks */}
        <div className="rounded-2xl p-5 mb-6 flex items-start gap-4"
          style={{ background: "linear-gradient(135deg, oklch(0.10 0.04 280), oklch(0.08 0.06 260))", border: "1px solid oklch(0.45 0.12 280 / 0.4)" }}>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna-avatar-ZRuJw2SPLknXZS2RAKU4vn.webp"
            alt="Luna"
            className="w-14 h-14 rounded-full flex-shrink-0 object-cover"
            style={{ border: "2px solid oklch(0.65 0.18 280 / 0.6)" }}
          />
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Feather className="w-3 h-3" style={{ color: "oklch(0.72 0.16 280)" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.72 0.16 280)" }}>Luna speaks</span>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: "oklch(0.88 0.03 265)" }}>
              "The 7-night protocol gives you the foundation. But sleep optimization is ongoing —
              your chronotype shifts with seasons, stress, and age.
              The membership keeps you calibrated. It's designed specifically for <strong style={{ color: "oklch(0.82 0.16 65)", fontStyle: "normal" }}>{benefit}</strong>."
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <Crown className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.82 0.16 65)" }} />
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            Keep Your Results — Forever
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.60 0.04 265)" }}>
            The protocol fixed your sleep. The membership ensures it stays fixed —
            with monthly updates, AI coaching, and a community that holds you accountable.
          </p>
        </div>

        {/* Value stack */}
        <div className="glass-card rounded-3xl p-6 mb-4" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
            <h2 className="font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>Sleep Optimizer Membership</h2>
          </div>

          <div className="space-y-3 mb-5">
            {MEMBERSHIP_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-3 py-2"
                  style={{ borderBottom: i < MEMBERSHIP_FEATURES.length - 1 ? "1px solid oklch(0.15 0.04 265)" : "none" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.82 0.16 65 / 0.1)" }}>
                    <Icon className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: "oklch(0.85 0.02 265)" }}>{f.label}</span>
                      <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.04 265)" }}>{f.value}</span>
                    </div>
                    <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{f.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hormozi price reveal */}
          <div className="rounded-xl p-4 mb-4" style={{ background: "oklch(0.08 0.02 265)", border: "1px solid oklch(0.20 0.04 265)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: "oklch(0.55 0.04 265)" }}>Total monthly value</span>
              <span className="text-sm font-black line-through" style={{ color: "oklch(0.45 0.04 265)" }}>${totalValue}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>Your membership price</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black" style={{ color: "oklch(0.82 0.16 65)" }}>$8</span>
                <span className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>/month</span>
              </div>
            </div>
            <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 265)" }}>Cancel anytime · No contracts · Billed monthly</p>
          </div>

          {/* Testimonial */}
          <div className="rounded-xl p-3 mb-5" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.20 0.02 265)" }}>
            <div className="flex gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-xs italic" style={{ color: "oklch(0.65 0.04 265)" }}>
              "I was skeptical about a monthly membership but the AI coaching alone is worth it.
              Luna helped me figure out why my sleep was getting worse in winter — it was my light exposure schedule."
            </p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 265)" }}>— Jennifer K., Bear · 4 months member</p>
          </div>

          <CountdownTimer variant="inline" label="Membership offer expires in:" />

          <button onClick={onAccept} disabled={loading}
            className="w-full rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-4 font-black transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.62 0.16 55))", color: "black" }}>
            <Crown className="w-4 h-4" />
            <span>{loading ? "Processing..." : "Join Sleep Optimizer — $8/mo"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-4 mt-3">
            {[
              { icon: Shield, text: "Cancel anytime" },
              { icon: Clock, text: "Instant access" },
              { icon: Brain, text: "AI coaching" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-1">
                <Icon className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
                <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onDecline}
          className="w-full flex items-center justify-center gap-1 py-3 text-xs opacity-40 hover:opacity-60 transition-opacity"
          style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          <span>No thanks, I don't need ongoing optimization</span>
        </button>
        <p className="text-xs text-center mt-2 max-w-md mx-auto" style={{ color: "oklch(0.28 0.04 265)" }}>
          Educational wellness guide based on evidence-informed CBT-I principles. Not medical advice. Results vary.
        </p>
      </div>
    </div>
  );
}

// ── Variant B: Minimalist subscription layout ─────────────────────────────
function VariantB({ chronotype, onAccept, onDecline, loading }: {
  chronotype: Chronotype; onAccept: () => void; onDecline: () => void; loading: boolean;
}) {
  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <CountdownTimer variant="banner" label="Exclusive offer expires in:" />
      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 mx-auto mb-3" style={{ color: "oklch(0.82 0.16 65)" }} />
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            Keep Your Results Forever
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
            Join 2,847+ members getting monthly protocols, AI coaching, and lifetime support.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-6" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>$8</div>
            <p className="text-sm" style={{ color: "oklch(0.65 0.04 265)" }}>/month · cancel anytime</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {[
              "✓ New sleep protocols monthly",
              "✓ AI coaching with Luna 24/7",
              "✓ Chronotype-specific updates",
              "✓ Community access",
              "✓ All future products free",
            ].map((item, i) => (
              <p key={i} className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</p>
            ))}
          </div>

          <CountdownTimer variant="inline" label="Offer expires:" />

          <button onClick={onAccept} disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-base transition-all mt-4 hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.62 0.16 55))", color: "black" }}>
            {loading ? "Processing..." : "Start Membership — $8/mo"}
          </button>

          <p className="text-center text-xs mt-3" style={{ color: "oklch(0.45 0.04 265)" }}>
            Cancel anytime · No contracts · Instant access
          </p>
        </div>

        <button onClick={onDecline}
          className="w-full py-2 text-sm transition-all opacity-40 hover:opacity-60"
          style={{ color: "oklch(0.50 0.04 265)" }}>
          No thanks, I'll manage on my own
        </button>
        <p className="text-xs text-center mt-2 max-w-md mx-auto" style={{ color: "oklch(0.28 0.04 265)" }}>
          Educational wellness guide based on evidence-informed CBT-I principles. Not medical advice. Results vary.
        </p>
      </div>
    </div>
  );
}

export default function Upsell3() {
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
    track("page_view", { page: "upsell3", value: { chronotype } });
    assignVariant.mutateAsync({ sessionId, page: "upsell3", chronotype }).then(r => {
      setVariant(r.variant);
      track("ab_impression", { page: "upsell3", value: { variant: r.variant } });
    }).catch(() => setVariant("A"));
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell3", value: { chronotype, price: 8, variant } });
    try {
      const result = await checkoutMutation.mutateAsync({
        productId: "subscription",
        sessionId: getSessionId(),
        chronotype,
        origin: window.location.origin,
      });
      if (result.url) {
        await trackConversion.mutateAsync({ sessionId: getSessionId(), page: "upsell3", revenue: "8.00" });
        toast.info("Redirecting to secure checkout...");
        window.open(result.url, "_blank");
      }
    } catch {
      toast.error("Checkout error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { navigateWithTransition } = useTransition();

  const handleDecline = () => {
    track("upsell_decline", { page: "upsell3", value: { chronotype, variant } });
    navigateWithTransition(
      () => navigate(`/thankyou?chronotype=${chronotype}`),
      { message: "Preparing your download...", subMessage: "Your protocol is ready", delay: 800 }
    );
  };

  if (!variant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      {variant === "B"
        ? <VariantB chronotype={chronotype} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />
        : <VariantA chronotype={chronotype} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />}
    </>
  );
}
