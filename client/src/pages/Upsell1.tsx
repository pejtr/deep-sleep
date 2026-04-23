import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";

const CHRONOTYPE_ICONS: Record<Chronotype, string> = {
  Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬",
};

export default function Upsell1() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";
  const [loading, setLoading] = useState(false);
  const { track } = useTrackBehavior();

  const orderMutation = trpc.orders.create.useMutation();

  useEffect(() => {
    track("page_view", { page: "upsell1", value: { chronotype } });
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell1", value: { chronotype, price: 7 } });
    try {
      const result = await orderMutation.mutateAsync({
        sessionId: getSessionId(),
        productId: "oto1",
        chronotype,
      });
      window.location.href = result.gumroadUrl;
    } catch {
      window.location.href = "https://deepsleepreset.gumroad.com/l/ttrsd";
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
            Wait — Your {chronotype} Protocol Just Unlocked This
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>
            Because you're a <strong style={{ color: "oklch(0.82 0.16 65)" }}>{chronotype}</strong>, we've prepared a special add-on that amplifies your results in the first 7 nights.
          </p>
        </div>

        {/* Offer card */}
        <div className="glass-card rounded-3xl p-8 mb-6"
          style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "oklch(0.82 0.16 65)" }}>
            🎯 {chronotype} Sleep Accelerator Pack
          </h2>
          <div className="flex flex-col gap-2 mb-6">
            {[
              `Advanced ${chronotype} sleep stack (supplements guide)`,
              "30-day habit tracker with daily prompts",
              `${chronotype} morning activation protocol`,
              "Sleep environment optimization checklist",
              "Priority email support for 30 days",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }}>✓</span>
                <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$37</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$7</span>
            <div className="badge-popular">81% OFF</div>
          </div>

          <CountdownTimer variant="inline" label="This offer disappears in:" />

          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-6 disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : `Yes! Add the Accelerator Pack — $7`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Decline */}
        <button
          onClick={handleDecline}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs"
          style={{ color: "oklch(0.40 0.04 265)" }}
        >
          <X className="w-3 h-3" />
          No thanks, I don't need the Accelerator Pack
        </button>
      </div>
    </div>
  );
}
