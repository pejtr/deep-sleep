import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star, Headphones } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { toast } from "sonner";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬" };

export default function Upsell2() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";
  const [loading, setLoading] = useState(false);
  const { track } = useTrackBehavior();
  const checkoutMutation = trpc.checkout.createSession.useMutation();

  useEffect(() => {
    track("page_view", { page: "upsell2", value: { chronotype } });
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell2", value: { chronotype, price: 7 } });
    try {
      const result = await checkoutMutation.mutateAsync({
        productId: "oto2",
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
    track("upsell_decline", { page: "upsell2", value: { chronotype } });
    navigate(`/upsell3?chronotype=${chronotype}`);
  };

  const TRACKS = [
    { name: "Delta Wave Deep Sleep", duration: "45 min", desc: "Pure delta brainwave entrainment for stage 3–4 sleep" },
    { name: "Rainfall & Thunder", duration: "60 min", desc: "Binaural brown noise + rain for instant nervous system calm" },
    { name: "432 Hz Sleep Tone", duration: "30 min", desc: "Scientifically tuned frequency that reduces cortisol by 23%" },
    { name: "Forest Night Ambience", duration: "60 min", desc: "Natural soundscape that triggers parasympathetic response" },
    { name: "Tibetan Bowl Meditation", duration: "20 min", desc: "Pre-sleep ritual to clear mental chatter in 10 minutes" },
    { name: "Ocean Waves + Theta", duration: "45 min", desc: "Theta wave overlay for deep relaxation before sleep" },
    { name: "White Noise Cocoon", duration: "8 hours", desc: "Full-night masking for light sleepers and noisy environments" },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-blue w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />
      <CountdownTimer variant="banner" label="Audio pack offer expires in:" />

      <div className="relative z-10 container max-w-lg mx-auto py-10">
        <div className="text-center mb-8">
          <div className="badge-popular mb-3">Exclusive Audio Upgrade</div>
          <div className="text-5xl mb-2">{icon}</div>
          <Headphones className="w-8 h-8 mx-auto mb-3 text-purple-400" />
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            The ASMR Sleep Audio Pack
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>
            7 premium tracks engineered to trigger sleep onset within <strong style={{ color: "oklch(0.82 0.16 65)" }}>20 minutes</strong>. Used by 12,000+ sleep optimizers.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-6" style={{ border: "1px solid oklch(0.65 0.15 280 / 0.4)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "oklch(0.75 0.15 280)" }}>
            🎧 7 Premium Sleep Tracks
          </h2>

          <div className="flex flex-col gap-2 mb-6">
            {TRACKS.map((track, i) => (
              <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: i < TRACKS.length - 1 ? "1px solid oklch(0.18 0.04 265)" : "none" }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ background: "oklch(0.65 0.15 280 / 0.2)", color: "oklch(0.75 0.15 280)" }}>{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "oklch(0.85 0.02 265)" }}>{track.name}</span>
                    <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{track.duration}</span>
                  </div>
                  <span className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{track.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "oklch(0.65 0.15 280 / 0.08)", border: "1px solid oklch(0.65 0.15 280 / 0.2)" }}>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />)}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>
              <strong style={{ color: "oklch(0.75 0.15 280)" }}>89% of users</strong> fall asleep 2x faster with these tracks
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$27</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.75 0.15 280)" }}>$7</span>
            <div className="badge-popular">74% OFF</div>
          </div>

          <CountdownTimer variant="inline" label="Audio offer expires in:" />

          <button onClick={handleAccept} disabled={loading}
            className="w-full rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-6 font-black transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 280), oklch(0.45 0.16 270))", color: "white" }}>
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : "Yes! Add ASMR Pack — $7"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-center mt-2" style={{ color: "oklch(0.40 0.04 265)" }}>
            Instant download · MP3 format · Works on all devices
          </p>
        </div>

        <button onClick={handleDecline}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs"
          style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          No thanks, I'll fall asleep on my own
        </button>
      </div>
    </div>
  );
}
