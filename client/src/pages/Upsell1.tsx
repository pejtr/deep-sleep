import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star, AlertTriangle, Check, Clock, Users, Shield } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { toast } from "sonner";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬" };
const CHRONOTYPE_TIMES: Record<Chronotype, string> = {
  Lion: "10 PM – 6 AM", Bear: "11 PM – 7 AM", Wolf: "12 AM – 8 AM", Dolphin: "11:30 PM – 6:30 AM",
};
const CHRONOTYPE_PAIN: Record<Chronotype, string> = {
  Lion: "wake up at 4 AM and can't fall back asleep",
  Bear: "feel groggy every morning no matter how long you sleep",
  Wolf: "lie awake until 2 AM with a racing mind",
  Dolphin: "sleep so lightly that every sound wakes you up",
};

export default function Upsell1() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";
  const sleepTime = CHRONOTYPE_TIMES[chronotype] ?? "11 PM – 7 AM";
  const pain = CHRONOTYPE_PAIN[chronotype] ?? "struggle with poor sleep quality";
  const [loading, setLoading] = useState(false);
  const [liveViewers] = useState(() => Math.floor(Math.random() * 12) + 23);
  const { track } = useTrackBehavior();
  const checkoutMutation = trpc.checkout.createSession.useMutation();

  useEffect(() => {
    track("page_view", { page: "upsell1", value: { chronotype } });
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell1", value: { chronotype, price: 17 } });
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

      {/* Urgency banner */}
      <CountdownTimer variant="banner" label="⚡ One-time offer expires in:" />

      {/* Live viewers */}
      <div className="flex items-center justify-center gap-2 py-2" style={{ background: "oklch(0.12 0.03 255)" }}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs" style={{ color: "oklch(0.60 0.04 265)" }}>
          <strong className="text-green-400">{liveViewers} people</strong> are viewing this offer right now
        </span>
      </div>

      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-green-400 font-semibold">Protocol</span>
          </div>
          <div className="w-8 h-0.5 bg-amber-500" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-black">2</span>
            </div>
            <span className="text-xs text-amber-400 font-semibold">Optimizer</span>
          </div>
          <div className="w-8 h-0.5" style={{ background: "oklch(0.25 0.02 265)" }} />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "oklch(0.20 0.02 265)" }}>
              <span className="text-xs font-bold" style={{ color: "oklch(0.40 0.02 265)" }}>3</span>
            </div>
            <span className="text-xs" style={{ color: "oklch(0.40 0.02 265)" }}>Audio</span>
          </div>
        </div>

        {/* Header — Pain Agitation */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{icon}</div>
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            Wait — Your Protocol is Only Half the Solution
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
            As a <strong style={{ color: "oklch(0.82 0.16 65)" }}>{chronotype}</strong>, you {pain}. The 7-Night Protocol fixes your sleep schedule, but without the <strong style={{ color: "oklch(0.82 0.16 65)" }}>Chronotype Optimizer</strong>, most {chronotype}s relapse within 30 days.
          </p>
        </div>

        {/* Warning box — what happens without it */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: "oklch(0.15 0.06 25 / 0.4)", border: "1px solid oklch(0.60 0.20 25 / 0.3)" }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-sm font-bold text-red-300">Without the Optimizer, here's what typically happens:</p>
          </div>
          <div className="flex flex-col gap-1.5 ml-6">
            {[
              "Week 1-2: Great results from the protocol ✓",
              "Week 3: Old habits creep back, sleep window shifts",
              "Week 4: Back to square one — lying awake, exhausted mornings",
            ].map((item, i) => (
              <p key={i} className="text-xs" style={{ color: i < 1 ? "oklch(0.65 0.15 145)" : "oklch(0.60 0.12 25)" }}>
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* Before / After comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-4" style={{ background: "oklch(0.12 0.04 25 / 0.3)", border: "1px solid oklch(0.30 0.08 25 / 0.3)" }}>
            <p className="text-xs font-bold text-red-300 mb-2">❌ Protocol Only</p>
            <div className="flex flex-col gap-1">
              {["Short-term fix", "Generic advice", "No tracking", "Relapse risk"].map((item, i) => (
                <p key={i} className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "oklch(0.12 0.04 145 / 0.2)", border: "1px solid oklch(0.50 0.15 145 / 0.3)" }}>
            <p className="text-xs font-bold text-green-300 mb-2">✅ Protocol + Optimizer</p>
            <div className="flex flex-col gap-1">
              {["Permanent change", `${chronotype}-specific`, "30-day tracker", "3x faster results"].map((item, i) => (
                <p key={i} className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Offer card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-4" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <h2 className="font-bold text-lg mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>
            🎯 {chronotype} Chronotype Optimizer
          </h2>
          <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.04 265)" }}>
            The 30-day system that makes your protocol results permanent
          </p>

          {/* Value stack */}
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

          {/* Total value */}
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

          {/* Social proof */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>
              <strong style={{ color: "oklch(0.82 0.16 65)" }}>2,847 {chronotype}s</strong> used this to make results permanent
            </p>
          </div>

          {/* Testimonial */}
          <div className="rounded-xl p-3 mb-5" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.20 0.02 265)" }}>
            <p className="text-xs italic" style={{ color: "oklch(0.65 0.04 265)" }}>
              "The protocol alone helped, but the Optimizer is what made it stick. I haven't had insomnia in 3 months now."
            </p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 265)" }}>
              — Sarah M., {chronotype} · verified buyer
            </p>
          </div>

          {/* Price display */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$115</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$17</span>
            <div className="badge-popular">85% OFF</div>
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>today only</span>
          </div>

          <CountdownTimer variant="inline" label="This price disappears in:" />

          {/* CTA button */}
          <button onClick={handleAccept} disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : `Yes! Add the ${chronotype} Optimizer — $17`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>Instant access</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>30-day guarantee</span>
            </div>
          </div>
        </div>

        {/* Decline — small, subtle */}
        <button onClick={handleDecline}
          className="w-full flex items-center justify-center gap-1 py-3 text-xs opacity-40 hover:opacity-60 transition-opacity"
          style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          <span>No thanks, I'll risk relapsing without the optimizer</span>
        </button>
      </div>
    </div>
  );
}
