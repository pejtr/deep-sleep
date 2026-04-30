import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star, Crown, Zap, Moon, MessageCircle, TrendingUp } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
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
  const { track } = useTrackBehavior();
  const checkoutMutation = trpc.checkout.createSession.useMutation();

  useEffect(() => {
    track("page_view", { page: "upsell3", value: { chronotype } });
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell3", value: { chronotype, price: 8 } });
    try {
      const result = await checkoutMutation.mutateAsync({
        productId: "subscription",
        sessionId: getSessionId(),
        chronotype,
        origin: window.location.origin,
      });
      if (result.url) {
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
    track("upsell_decline", { page: "upsell3", value: { chronotype } });
    navigate(`/thankyou?chronotype=${chronotype}`);
  };

  const FEATURES = [
    { icon: MessageCircle, label: "Luna AI Coach", desc: "24/7 personalized sleep coaching — ask anything, get instant science-backed answers" },
    { icon: Moon, label: "New Protocols Monthly", desc: "Fresh chronotype-specific protocols every month based on latest sleep research" },
    { icon: TrendingUp, label: "Sleep Score Tracking", desc: "Daily sleep quality scoring with trend analysis and personalized recommendations" },
    { icon: Zap, label: "Advanced Optimization", desc: "Supplement timing, light therapy schedules, and biohacking protocols for your type" },
    { icon: Crown, label: "VIP Community Access", desc: "Private community of 12,847+ sleep optimizers — accountability partners & expert Q&As" },
    { icon: Star, label: "All Future Products Free", desc: "Every new course, protocol, and tool we release — included in your membership" },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-purple w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-gold w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />
      <CountdownTimer variant="banner" label="Membership offer expires in:" />

      <div className="relative z-10 container max-w-lg mx-auto py-10">
        <div className="text-center mb-8">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="badge-popular">Sleep Optimizer Membership</span>
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-5xl mb-4">{icon}</div>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            Never Sleep Badly Again
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>
            Your 7-night protocol is just the beginning. <strong style={{ color: "oklch(0.82 0.16 65)" }}>Sleep Optimizer Membership</strong> gives you an AI sleep coach, monthly protocols, and a community of 12,847+ optimizers — all for less than a cup of coffee per week.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-6" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          {/* Features */}
          <div className="flex flex-col gap-3 mb-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "oklch(0.78 0.18 65 / 0.12)" }}>
                  <f.icon className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "oklch(0.85 0.02 265)" }}>{f.label}</p>
                  <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
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

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$47/mo</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$8</span>
            <div>
              <div className="badge-popular">83% OFF</div>
              <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.04 265)" }}>/month · cancel anytime</p>
            </div>
          </div>

          <CountdownTimer variant="inline" label="Membership offer expires in:" />

          <button onClick={handleAccept} disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-6 disabled:opacity-60">
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : "Join Sleep Optimizer — $8/mo"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-center mt-2" style={{ color: "oklch(0.40 0.04 265)" }}>
            Cancel anytime · 30-day money-back guarantee · Instant access
          </p>
        </div>

        <button onClick={handleDecline}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs"
          style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          No thanks, I'll manage my sleep on my own
        </button>
      </div>
    </div>
  );
}
