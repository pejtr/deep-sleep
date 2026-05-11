import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star, Crown, Zap, Moon, MessageCircle, TrendingUp, Check, Shield, Clock } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { toast } from "sonner";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬" };

export default function Upsell3() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"A" | "B">("A");
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

  const handleDecline = () => {
    track("upsell_decline", { page: "upsell3", value: { chronotype, variant } });
    navigate(`/thankyou?chronotype=${chronotype}`);
  };

  const FEATURES = [
    { icon: Moon, label: "Monthly Sleep Protocol", desc: "New protocol every month — seasonal adjustments, advanced techniques, latest research", value: "$29/mo" },
    { icon: MessageCircle, label: "AI Sleep Coach (Luna)", desc: "24/7 AI coach that knows your chronotype, tracks your progress, answers questions instantly", value: "$19/mo" },
    { icon: TrendingUp, label: "Sleep Score Tracking", desc: "Daily sleep quality scoring with trend analysis and personalized recommendations", value: "$9/mo" },
    { icon: Zap, label: "Advanced Optimization", desc: "Supplement timing, light therapy schedules, and biohacking protocols for your type", value: "$15/mo" },
    { icon: Crown, label: "VIP Community Access", desc: "Private community of 12,847+ sleep optimizers — accountability & expert Q&As", value: "$12/mo" },
    { icon: Star, label: "All Future Products Free", desc: "Every new course, protocol, and tool we release — included in your membership", value: "Priceless" },
  ];

  return (
    <>
      <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-purple w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-gold w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      <CountdownTimer variant="banner" label="⚡ Membership offer expires in:" />

      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        {/* Step indicator — all previous steps done */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {["Protocol", "Optimizer", "Audio"].map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <div className="w-6 h-0.5 bg-green-500" />}
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs text-green-400 font-semibold">{label}</span>
            </div>
          ))}
          <div className="w-6 h-0.5 bg-amber-500" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
              <Crown className="w-3 h-3 text-black" />
            </div>
            <span className="text-xs text-amber-400 font-semibold">VIP</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="badge-popular">Final Step — VIP Membership</span>
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-5xl mb-3">{icon}</div>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            What If You Never Had a Bad Night's Sleep Again?
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.60 0.04 265)" }}>
            The 7-night protocol resets your sleep. The membership <strong style={{ color: "oklch(0.82 0.16 65)" }}>keeps it perfect — forever</strong>. An AI sleep coach, monthly protocols, and a community of 12,847+ optimizers — for less than a cup of coffee per week.
          </p>
        </div>

        {/* Cost comparison */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: "oklch(0.12 0.04 25 / 0.3)", border: "1px solid oklch(0.50 0.15 25 / 0.3)" }}>
          <p className="text-xs font-bold text-red-300 mb-2">What poor sleep is costing you RIGHT NOW:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { cost: "$150/mo", label: "Lost productivity" },
              { cost: "$80/mo", label: "Sleep supplements" },
              { cost: "$200/mo", label: "Health consequences" },
              { cost: "Priceless", label: "Relationships & mood" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-300">{item.cost}</span>
                <span className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: "oklch(0.50 0.04 265)" }}>
            Total: <strong className="text-red-300">$430+/month</strong> in hidden costs. The membership is <strong style={{ color: "oklch(0.82 0.16 65)" }}>$8/month</strong>.
          </p>
        </div>

        {/* Offer card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-4" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <h2 className="font-bold text-lg mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>
            Sleep Optimizer Membership
          </h2>
          <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.04 265)" }}>
            Everything you need to sleep perfectly — every single night
          </p>

          {/* Features with value stack */}
          <div className="flex flex-col gap-3 mb-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.78 0.18 65 / 0.12)" }}>
                  <f.icon className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: "oklch(0.85 0.02 265)" }}>{f.label}</p>
                    <span className="text-xs line-through flex-shrink-0" style={{ color: "oklch(0.35 0.04 265)" }}>{f.value}</span>
                  </div>
                  <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total value */}
          <div className="rounded-xl p-3 mb-4" style={{ background: "oklch(0.78 0.18 65 / 0.06)", border: "1px dashed oklch(0.78 0.18 65 / 0.3)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>Total Monthly Value:</span>
              <span className="text-sm line-through" style={{ color: "oklch(0.45 0.04 265)" }}>$84+/mo</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>Your Price:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black" style={{ color: "oklch(0.82 0.16 65)" }}>$8</span>
                <span className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>/month</span>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>
              <strong style={{ color: "oklch(0.82 0.16 65)" }}>4.9/5</strong> from 847 members · avg 6.8 hrs deep sleep after 30 days
            </p>
          </div>

          {/* Testimonials */}
          <div className="flex flex-col gap-2 mb-5">
            {[
              { text: "Luna is like having a sleep doctor on call 24/7. Best $8 I spend each month.", name: "David K." },
              { text: "The monthly protocols keep evolving. Month 3 was a game-changer for my Wolf schedule.", name: "Anna L." },
            ].map((t, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.20 0.02 265)" }}>
                <p className="text-xs italic" style={{ color: "oklch(0.65 0.04 265)" }}>"{t.text}"</p>
                <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 265)" }}>— {t.name}, {chronotype} · member</p>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$47/mo</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$8</span>
            <div>
              <div className="badge-popular">83% OFF</div>
              <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.04 265)" }}>/month · cancel anytime</p>
            </div>
          </div>

          <CountdownTimer variant="inline" label="Membership price locks in:" />

          <button onClick={handleAccept} disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : "Join Sleep Optimizer — $8/mo"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>Instant access</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>30-day guarantee</span>
            </div>
          </div>
        </div>

        {/* Decline */}
        <button onClick={handleDecline}
          className="w-full flex items-center justify-center gap-1 py-3 text-xs opacity-40 hover:opacity-60 transition-opacity"
          style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          <span>No thanks, I'll manage my sleep on my own</span>
        </button>
      </div>
    </div>
      <StickyMobileCTA />
    </>
  );
}
