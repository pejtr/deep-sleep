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


// ── Variant B: Minimalist subscription layout ────────────────────────────────
function VariantA({ chronotype, onAccept, onDecline, loading }: {
  chronotype: string;
  onAccept: () => void;
  onDecline: () => void;
  loading: boolean;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">Upsell 3 - Variant A</h1>
          <p className="text-slate-300 mb-6">Premium sleep optimization for {chronotype}</p>
          <div className="flex gap-4">
            <button onClick={onAccept} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50">
              {loading ? "Processing..." : "Accept"}
            </button>
            <button onClick={onDecline} disabled={loading} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantB({ chronotype, onAccept, onDecline, loading }: {
  chronotype: Chronotype; onAccept: () => void; onDecline: () => void; loading: boolean;
}) {
  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <CountdownTimer variant="banner" label="Exclusive offer expires in:" />
      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            Keep Your Results Forever
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
            Join 2,847+ members getting monthly updates, new protocols, and lifetime support.
          </p>
        </div>
        <div className="glass-card rounded-3xl p-8 mb-6" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2" style={{ color: "oklch(0.82 0.16 65)" }}>$8</div>
            <p className="text-sm" style={{ color: "oklch(0.65 0.04 265)" }}>/month, cancel anytime</p>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {["✓ New sleep protocols monthly", "✓ Chronotype-specific updates", "✓ Community access", "✓ Priority support"].map((item, i) => (
              <p key={i} className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</p>
            ))}
          </div>
          <button
            onClick={onAccept}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold transition-all duration-300"
            style={{
              background: "oklch(0.82 0.16 65)",
              color: "black",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : "Start Membership"}
          </button>
        </div>
        <button
          onClick={onDecline}
          disabled={loading}
          className="w-full py-2 text-sm transition-all"
          style={{ color: "oklch(0.50 0.04 265)" }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}


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
      {variant === "B" ? (
        <VariantB chronotype={chronotype} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />
      ) : (
        <VariantA chronotype={chronotype} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />
      )}
    </>
  );;
}
