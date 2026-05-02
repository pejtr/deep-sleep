import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, X, Star, Headphones, Check, Clock, Shield, Users, Volume2, Music } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { toast } from "sonner";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬" };

const TRACKS = [
  { name: "Deep Forest Rain", duration: "60 min", desc: "Natural soundscape that triggers parasympathetic response", value: "$5" },
  { name: "Tibetan Bowl Meditation", duration: "20 min", desc: "Pre-sleep ritual to clear mental chatter in 10 minutes", value: "$5" },
  { name: "Ocean Waves + Theta", duration: "45 min", desc: "Theta wave overlay for deep relaxation before sleep", value: "$5" },
  { name: "White Noise Cocoon", duration: "8 hours", desc: "Full-night masking for light sleepers and noisy environments", value: "$5" },
  { name: "ASMR Whisper Guide", duration: "30 min", desc: "Guided relaxation with binaural beats for rapid onset", value: "$7" },
  { name: "Campfire Crickets", duration: "90 min", desc: "Nature loop that reduces cortisol by 23% in studies", value: "$5" },
  { name: "Delta Wave Deep Sleep", duration: "8 hours", desc: "Clinically-tested delta frequency for maximum deep sleep", value: "$7" },
];

// ── Variant A: Original detailed layout ──────────────────────────────────────
function VariantA_Upsell2({ chronotype, icon, onAccept, onDecline, loading }: {
  chronotype: Chronotype; icon: string; onAccept: () => void; onDecline: () => void; loading: boolean;
}) {
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-blue w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />
      <CountdownTimer variant="banner" label="⚡ Audio pack offer expires in:" />
      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-green-400 font-semibold">Protocol</span>
          </div>
          <div className="w-8 h-0.5 bg-green-500" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-green-400 font-semibold">Optimizer</span>
          </div>
          <div className="w-8 h-0.5 bg-purple-500" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-white">3</span>
            </div>
            <span className="text-xs text-purple-400 font-semibold">Audio</span>
          </div>
        </div>
        <div className="text-center mb-6">
          <Headphones className="w-10 h-10 mx-auto mb-3 text-purple-400" />
          <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            The #1 Reason {chronotype}s Can't Fall Asleep?
          </h1>
          <p className="text-lg font-semibold mb-2" style={{ color: "oklch(0.75 0.15 280)" }}>
            A racing mind that won't shut off.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.60 0.04 265)" }}>
            Your protocol tells you <em>when</em> to sleep. These audio tracks tell your brain <em>how</em> to sleep — by triggering the exact brainwave patterns that precede deep sleep onset.
          </p>
        </div>
        <div className="rounded-2xl p-4 mb-6" style={{ background: "oklch(0.12 0.04 280 / 0.3)", border: "1px solid oklch(0.50 0.15 280 / 0.3)" }}>
          <p className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>
            <strong style={{ color: "oklch(0.75 0.15 280)" }}>Clinical fact:</strong> A 2024 study in <em>Sleep Medicine Reviews</em> found that binaural beats + nature sounds reduced sleep onset latency by <strong style={{ color: "oklch(0.75 0.15 280)" }}>47%</strong> compared to silence. These 7 tracks use the exact frequencies from the study.
          </p>
        </div>
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-4" style={{ border: "1px solid oklch(0.65 0.15 280 / 0.4)" }}>
          <h2 className="font-bold text-lg mb-1" style={{ color: "oklch(0.75 0.15 280)" }}>🎧 ASMR Deep Sleep Audio Pack</h2>
          <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.04 265)" }}>7 premium tracks · 18+ hours of content · Instant download</p>
          <div className="flex flex-col gap-1.5 mb-5">
            {TRACKS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2 group cursor-pointer"
                style={{ borderBottom: i < TRACKS.length - 1 ? "1px solid oklch(0.15 0.04 265)" : "none" }}
                onClick={() => setPlayingTrack(playingTrack === i ? null : i)}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{ background: playingTrack === i ? "oklch(0.65 0.15 280 / 0.3)" : "oklch(0.65 0.15 280 / 0.1)" }}>
                  {playingTrack === i ? (
                    <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: "oklch(0.75 0.15 280)" }}>{i + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "oklch(0.85 0.02 265)" }}>{t.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{t.duration}</span>
                      <span className="text-xs line-through" style={{ color: "oklch(0.35 0.04 265)" }}>{t.value}</span>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{t.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 mb-4" style={{ background: "oklch(0.65 0.15 280 / 0.06)", border: "1px dashed oklch(0.65 0.15 280 / 0.3)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>Total Value (7 tracks):</span>
              <span className="text-sm line-through" style={{ color: "oklch(0.45 0.04 265)" }}>$39</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold" style={{ color: "oklch(0.75 0.15 280)" }}>Your Price Today:</span>
              <span className="text-2xl font-black" style={{ color: "oklch(0.75 0.15 280)" }}>$27</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "oklch(0.65 0.15 280 / 0.08)", border: "1px solid oklch(0.65 0.15 280 / 0.2)" }}>
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />)}</div>
            <p className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>
              <strong style={{ color: "oklch(0.75 0.15 280)" }}>89% of users</strong> fall asleep within 20 minutes with these tracks
            </p>
          </div>
          <div className="rounded-xl p-3 mb-5" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.20 0.02 265)" }}>
            <p className="text-xs italic" style={{ color: "oklch(0.65 0.04 265)" }}>
              "I've tried every sleep app. Nothing worked until these tracks. The Delta Wave one is like a switch — I'm out in 15 minutes."
            </p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 265)" }}>— Mike R., {chronotype} · verified buyer</p>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$39</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.75 0.15 280)" }}>$27</span>
            <div className="badge-popular">31% OFF</div>
          </div>
          <CountdownTimer variant="inline" label="Audio offer expires in:" />
          <button onClick={onAccept} disabled={loading}
            className="w-full rounded-2xl py-5 text-base flex items-center justify-center gap-2 mt-4 font-black transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 280), oklch(0.45 0.16 270))", color: "white" }}>
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : "Yes! Add ASMR Pack — $27"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-4 mt-3">
            {[{ icon: Shield, text: "Secure" }, { icon: Clock, text: "Instant download" }, { icon: Users, text: "MP3 · All devices" }].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-1">
                <Icon className="w-3 h-3" style={{ color: "oklch(0.45 0.04 265)" }} />
                <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onDecline} className="w-full flex items-center justify-center gap-1 py-3 text-xs opacity-40 hover:opacity-60 transition-opacity" style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          <span>No thanks, I'll try to quiet my mind on my own</span>
        </button>
      </div>
    </div>
  );
}

// ── Variant B: Minimalist "Quick Pick" layout ─────────────────────────────────
function VariantB_Upsell2({ chronotype, icon, onAccept, onDecline, loading }: {
  chronotype: Chronotype; icon: string; onAccept: () => void; onDecline: () => void; loading: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <CountdownTimer variant="banner" label="🎵 Audio pack offer expires in:" />
      <div className="relative z-10 container max-w-lg mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{icon}</div>
          <h1 className="font-display font-bold text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            Fall Asleep in <span style={{ color: "oklch(0.75 0.15 280)" }}>15 Minutes</span>
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>7 science-backed audio tracks. One-time download. Works tonight.</p>
        </div>
        <div className="flex flex-col gap-2 mb-6">
          {TRACKS.map((t, i) => (
            <button key={i} onClick={() => setSelected(i === selected ? null : i)}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{ background: selected === i ? "oklch(0.55 0.18 280 / 0.15)" : "oklch(0.10 0.02 265)", border: `1px solid ${selected === i ? "oklch(0.65 0.15 280 / 0.5)" : "oklch(0.20 0.02 265)"}` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.15 280)" }} />
                  <span className="text-sm font-semibold" style={{ color: "oklch(0.85 0.02 265)" }}>{t.name}</span>
                </div>
                <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{t.duration}</span>
              </div>
              {selected === i && <p className="text-xs mt-1 ml-5" style={{ color: "oklch(0.55 0.04 265)" }}>{t.desc}</p>}
            </button>
          ))}
        </div>
        <div className="rounded-3xl p-6 mb-4" style={{ background: "oklch(0.10 0.02 265)", border: "2px solid oklch(0.65 0.15 280 / 0.4)" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>7 tracks · total value <span className="line-through">$39</span></p>
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-purple-400 text-purple-400" />)}</div>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-black text-5xl" style={{ color: "oklch(0.75 0.15 280)" }}>$27</span>
            <span className="text-sm font-semibold px-2 py-0.5 rounded-full" style={{ background: "oklch(0.55 0.18 280 / 0.2)", color: "oklch(0.75 0.15 280)" }}>31% OFF</span>
          </div>
          <p className="text-xs mb-4" style={{ color: "oklch(0.50 0.04 265)" }}>
            "The Delta Wave one is like a switch — I'm out in 15 minutes." — Mike R., {chronotype}
          </p>
          <CountdownTimer variant="inline" label="Offer expires:" />
          <button onClick={onAccept} disabled={loading}
            className="w-full rounded-2xl py-5 text-base font-black flex items-center justify-center gap-2 mt-4 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 280), oklch(0.45 0.16 270))", color: "white" }}>
            <Lock className="w-4 h-4" />
            <span>{loading ? "Processing..." : "Get All 7 Tracks — $27"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs mt-3" style={{ color: "oklch(0.45 0.04 265)" }}>MP3 · Instant download · Works on all devices</p>
        </div>
        <button onClick={onDecline} className="w-full flex items-center justify-center gap-1 py-3 text-xs opacity-30 hover:opacity-50 transition-opacity" style={{ color: "oklch(0.40 0.04 265)" }}>
          <X className="w-3 h-3" />
          <span>No thanks, I'll skip the audio pack</span>
        </button>
      </div>
    </div>
  );
}

// ── Main component with A/B routing ──────────────────────────────────────────
export default function Upsell2() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"A" | "B" | null>(null);
  const { track } = useTrackBehavior();
  const checkoutMutation = trpc.checkout.createSession.useMutation();
  const assignVariant = trpc.upsellAb.assignVariant.useMutation();
  const trackConversion = trpc.upsellAb.trackConversion.useMutation();

  useEffect(() => {
    const sessionId = getSessionId();
    track("page_view", { page: "upsell2", value: { chronotype } });
    assignVariant.mutateAsync({ sessionId, page: "upsell2", chronotype }).then(r => {
      setVariant(r.variant);
      track("ab_impression", { page: "upsell2", value: { variant: r.variant } });
    }).catch(() => setVariant("A"));
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    track("upsell_accept", { page: "upsell2", value: { chronotype, price: 27, variant } });
    try {
      const result = await checkoutMutation.mutateAsync({
        productId: "oto2",
        sessionId: getSessionId(),
        chronotype,
        origin: window.location.origin,
      });
      if (result.url) {
        await trackConversion.mutateAsync({ sessionId: getSessionId(), page: "upsell2", revenue: "27.00" });
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
    track("upsell_decline", { page: "upsell2", value: { chronotype, variant } });
    navigate(`/upsell3?chronotype=${chronotype}`);
  };

  if (!variant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return variant === "B"
    ? <VariantB_Upsell2 chronotype={chronotype} icon={icon} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />
    : <VariantA_Upsell2 chronotype={chronotype} icon={icon} onAccept={handleAccept} onDecline={handleDecline} loading={loading} />;
}
