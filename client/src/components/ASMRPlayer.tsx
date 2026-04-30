import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Lock } from "lucide-react";

interface Track {
  id: string;
  title: string;
  duration: string;
  description: string;
  emoji: string;
  free: boolean;
  // For free tracks, we use a Web Audio API generated tone
  frequency?: number;
}

const TRACKS: Track[] = [
  { id: "rain", title: "Deep Rain on Leaves", duration: "8:00", description: "Gentle rainfall for delta wave induction", emoji: "🌧️", free: true, frequency: 40 },
  { id: "ocean", title: "Ocean Theta Waves", duration: "10:00", description: "432Hz ocean waves for deep relaxation", emoji: "🌊", free: true, frequency: 432 },
  { id: "forest", title: "Forest Night Sounds", duration: "12:00", description: "Crickets and wind for nervous system reset", emoji: "🌲", free: false },
  { id: "binaural", title: "Delta Binaural Beats", duration: "20:00", description: "0.5–4Hz delta waves for deep sleep induction", emoji: "🧠", free: false },
  { id: "whitenoise", title: "Pink Noise Sleep Aid", duration: "8:00", description: "Scientifically proven to improve sleep quality", emoji: "🔮", free: false },
  { id: "tibetan", title: "Tibetan Singing Bowls", duration: "15:00", description: "Ancient resonance for mind quieting", emoji: "🪘", free: false },
];

function generateTone(ctx: AudioContext, frequency: number): AudioBufferSourceNode {
  const duration = 5;
  const buffer = ctx.createBuffer(2, ctx.sampleRate * duration, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      // Soft pink noise mixed with tone
      const t = i / ctx.sampleRate;
      const tone = Math.sin(2 * Math.PI * frequency * t) * 0.1;
      const noise = (Math.random() * 2 - 1) * 0.05;
      // Fade in/out
      const fade = Math.min(i / (ctx.sampleRate * 0.5), 1) * Math.min((data.length - i) / (ctx.sampleRate * 0.5), 1);
      data[i] = (tone + noise) * fade;
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

export default function ASMRPlayer({ onUpgradeClick }: { onUpgradeClick?: () => void }) {
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stopAudio = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playTrack = (track: Track) => {
    if (!track.free) {
      onUpgradeClick?.();
      return;
    }
    stopAudio();
    if (activeTrack === track.id && isPlaying) {
      setActiveTrack(null);
      return;
    }
    setActiveTrack(track.id);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const gain = ctx.createGain();
    gain.gain.value = muted ? 0 : volume;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const source = generateTone(ctx, track.frequency ?? 40);
    source.connect(gain);
    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => () => stopAudio(), []);

  return (
    <div className="rounded-3xl p-6" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-lg" style={{ color: "oklch(0.95 0.01 265)" }}>
            Sleep Sound Library
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.04 265)" }}>
            2 free tracks · 4 premium tracks
          </p>
        </div>
        {/* Volume control */}
        <div className="flex items-center gap-2">
          <button onClick={() => setMuted(m => !m)} className="opacity-60 hover:opacity-100 transition-opacity">
            {muted ? <VolumeX className="w-4 h-4" style={{ color: "oklch(0.60 0.04 265)" }} />
                   : <Volume2 className="w-4 h-4" style={{ color: "oklch(0.60 0.04 265)" }} />}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-amber-400 h-1 cursor-pointer" />
        </div>
      </div>

      {/* Track list */}
      <div className="flex flex-col gap-2">
        {TRACKS.map(track => {
          const isActive = activeTrack === track.id;
          const isCurrentlyPlaying = isActive && isPlaying;
          return (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: isActive ? "oklch(0.78 0.18 65 / 0.12)" : "oklch(0.11 0.025 255)",
                border: `1px solid ${isActive ? "oklch(0.78 0.18 65 / 0.35)" : "oklch(0.18 0.04 265)"}`,
              }}
            >
              {/* Play button */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: track.free ? "oklch(0.78 0.18 65 / 0.15)" : "oklch(0.18 0.04 265)" }}>
                {!track.free ? (
                  <Lock className="w-3.5 h-3.5" style={{ color: "oklch(0.45 0.04 265)" }} />
                ) : isCurrentlyPlaying ? (
                  <Pause className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" style={{ color: "oklch(0.82 0.16 65)" }} />
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{track.emoji}</span>
                  <span className="text-sm font-semibold truncate" style={{ color: track.free ? "oklch(0.90 0.02 265)" : "oklch(0.50 0.04 265)" }}>
                    {track.title}
                  </span>
                  {!track.free && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "oklch(0.78 0.18 65 / 0.1)", color: "oklch(0.70 0.12 65)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: "oklch(0.40 0.04 265)" }}>{track.description}</p>
              </div>

              {/* Duration + playing indicator */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>{track.duration}</p>
                {isCurrentlyPlaying && (
                  <div className="flex gap-0.5 justify-end mt-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-0.5 rounded-full animate-pulse"
                        style={{ height: `${6 + i * 3}px`, background: "oklch(0.82 0.16 65)", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      <div className="mt-4 rounded-xl p-4 text-center"
        style={{ background: "oklch(0.78 0.18 65 / 0.06)", border: "1px dashed oklch(0.78 0.18 65 / 0.25)" }}>
        <p className="text-xs mb-2" style={{ color: "oklch(0.55 0.04 265)" }}>
          Unlock all 6 tracks + 20 more premium sounds
        </p>
        <button onClick={onUpgradeClick}
          className="cta-gold rounded-lg px-5 py-2 text-xs font-bold">
          Unlock Premium ASMR — $8/mo
        </button>
      </div>
    </div>
  );
}
