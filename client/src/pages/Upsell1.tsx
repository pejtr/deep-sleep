import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { toast } from "sonner";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬" };
const CHRONOTYPE_TIMES: Record<Chronotype, string> = {
  Lion: "10 PM – 6 AM", Bear: "11 PM – 7 AM", Wolf: "12 AM – 8 AM", Dolphin: "11:30 PM – 6:30 AM",
};

export default function Upsell1() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";
  const sleepTime = CHRONOTYPE_TIMES[chronotype] ?? "11 PM – 7 AM";
  const [loading, setLoading] = useState(false);
  const { track } = useTrackBehavior();

  const checkoutMutation = trpc.checkout.createSession.useMutation();

  useEffect(() => {
    track("page_view", { page: "upsell1", value: { chronotype } });
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell1", value: { chronotype, price: 3 } });
    try {
      const result = await checkoutMutation.mutateAsync({
        productId: "oto1",
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
    track("upsell_decline", { page: "upsell1", value: { chronotype } });
    navigate(`/upsell2?chronotype=${chronotype}`);
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      <CountdownTimer variant="banner" label="One-time offer expires in:" />

      <div className="relative z-10 container max-w-lg mx-auto py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="badge-popular mb-3">Special One-Time Offer</div>
          <div className="text-5xl mb-4">{icon}</div>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            Your {chronotype} Protocol Just Unlocked This
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>
            Because you're a <strong style={{ color: "oklch(0.82 0.16 65)" }}>{chronotype}</strong>, your optimal sleep window is <strong style={{ color: "oklch(0.82 0.16 65)" }}>{sleepTime}</strong>. This toolkit is built specifically for your biology.
          </p>
        </div>

        {/* Offer card */}
        <div className="glass-card rounded-3xl p-8 mb-6" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "oklch(0.82 0.16 65)" }}>
            🎯 {chronotype} Chronotype Optimizer Toolkit
          </h2>
          <div className="flex flex-col gap-2 mb-6">
            {[
              `${chronotype}-specific supplement stack guide (what to take & when)`,
              "30-day habit tracker with daily prompts",
              `${chronotype} morning activation protocol (first 30 min of your day)`,
              "Sleep environment optimization checklist",
              "Chronotype-matched meal timing guide",
              "Priority email support for 30 days",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }}>✓</span>
                <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>
              <strong style={{ color: "oklch(0.82 0.16 65)" }}>2,847 {chronotype}s</strong> used this to fall asleep 3x faster in week 1
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$37</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$3</span>
            <div className="badge-popular">92% OFF</div>
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>today only</span>
          </div>

          <CountdownTimer variant="inline" label="This offer disappears in:" />

          <button onClick={handleAccept} disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-6 disabled:opacity-60">
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : `Yes! Add the ${chronotype} Toolkit — $3`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-center mt-2" style={{ color: "oklch(0.40 0.04 265)" }}>
            Secure payment · Instant access · 30-day guarantee
          </p>
        </div>

        {/* Decline */}
        <button onClick={handleDecline}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs"
          style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          No thanks, I don't need the {chronotype} Optimizer
        </button>
      </div>
    </div>
  );
}
