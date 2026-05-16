import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/hero-night-sky-D3pM5pQbCQhppVQxJN45yn.webp";

interface HeroAnimatedProps {
  onChatOpen?: () => void;
  navigate?: (path: string) => void;
}

export function HeroAnimated({ onChatOpen, navigate: navProp }: HeroAnimatedProps) {
  const [, routeNavigate] = useLocation();
  const navigate = navProp || routeNavigate;
  const [animationPhase, setAnimationPhase] = useState(0);

  // Cycle through 3 animation phases every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((p) => (p + 1) % 3);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Night sky background */}
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, oklch(0.07 0.025 255 / 0.4), oklch(0.07 0.025 255 / 0.85))" }} />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: "oklch(0.55 0.18 145 / 0.06)" }}></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl" style={{ background: "oklch(0.50 0.18 265 / 0.06)" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div>
              <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: "oklch(0.82 0.16 65)" }}>
                Science-Backed Sleep Protocol
              </p>
              <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 max-w-5xl" style={{ color: "oklch(0.95 0.01 265)" }}>
                You're Not Tired.
                <br />
                <span className="text-gradient-gold-italic">You're Sleep-Deprived.</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: "oklch(0.70 0.04 265)" }}>
              The 7-night protocol that fixes insomnia without pills, supplements, or willpower.
            </p>

            <p className="text-sm max-w-xl" style={{ color: "oklch(0.50 0.04 265)" }}>
              Based on CBT-I — the #1 clinician-recommended insomnia treatment with an 80% success rate.
            </p>

            {/* 3 Checkmarks */}
            <div className="flex flex-wrap gap-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl" style={{ color: "oklch(0.82 0.16 65)" }}>&#10003;</span>
                <div>
                  <p className="font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>CBT-I Certified</p>
                  <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>Clinically proven treatment</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl" style={{ color: "oklch(0.82 0.16 65)" }}>&#10003;</span>
                <div>
                  <p className="font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>80% Success Rate</p>
                  <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>Fastest insomnia fix</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl" style={{ color: "oklch(0.82 0.16 65)" }}>&#10003;</span>
                <div>
                  <p className="font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>No Pills/Supplements</p>
                  <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>100% natural method</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => {
                  navigate?.("/order");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border-2 rounded-xl px-6 py-3 text-base font-bold transition-all cursor-pointer"
                style={{ borderColor: "oklch(0.82 0.16 65)", color: "oklch(0.82 0.16 65)" }}
              >
                TRY FOR $1
              </button>
              <button
                onClick={() => {
                  navigate?.("/order");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="cta-gold cta-shimmer rounded-2xl px-10 py-5 text-lg inline-flex items-center gap-3 font-bold cursor-pointer"
              >
                START MY 7-NIGHT SLEEP PLAN | $4 TODAY
              </button>
              <button
                onClick={() => {
                  // Fire custom event so SleepChatBot (in App.tsx) can open
                  window.dispatchEvent(new CustomEvent('open-sleep-chat'));
                  if (onChatOpen) onChatOpen();
                }}
                className="border-2 rounded-2xl px-10 py-5 text-lg font-bold transition-all cursor-pointer"
                style={{ borderColor: "oklch(0.82 0.16 65)", color: "oklch(0.82 0.16 65)" }}
              >
                GET FREE SLEEP TIPS
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2"
                    style={{ background: "oklch(0.82 0.16 65)", borderColor: "oklch(0.07 0.025 255)" }}
                  ></div>
                ))}
              </div>
              <p className="text-sm" style={{ color: "oklch(0.40 0.04 265)" }}>
                <span className="font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>849</span> lives changed this week
              </p>
            </div>
          </div>

          {/* Right: Animated Hero */}
          <div className="relative flex justify-center items-center h-96 lg:h-full min-h-96">
            {/* Phase 0: Before/After Transformation */}
            {animationPhase === 0 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-1000">
                <svg viewBox="0 0 400 400" className="w-full max-w-md" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))" }}>
                  {/* Before: Stressed face */}
                  <g style={{ opacity: 1, transition: "opacity 1s" }}>
                    <circle cx="100" cy="100" r="60" fill="oklch(0.60 0.08 30)" />
                    <circle cx="85" cy="85" r="8" fill="oklch(0.95 0.01 265)" />
                    <circle cx="115" cy="85" r="8" fill="oklch(0.95 0.01 265)" />
                    <path d="M 85 110 Q 100 115 115 110" stroke="oklch(0.95 0.01 265)" strokeWidth="3" fill="none" />
                    <text x="100" y="200" textAnchor="middle" fontSize="20" fill="oklch(0.50 0.04 265)">
                      INSOMNIA
                    </text>
                    <text x="100" y="230" textAnchor="middle" fontSize="14" fill="oklch(0.40 0.04 265)">
                      Exhausted · Foggy · Anxious
                    </text>
                  </g>

                  {/* Arrow */}
                  <g style={{ opacity: 0.5 }}>
                    <line x1="200" y1="100" x2="200" y2="300" stroke="oklch(0.82 0.16 65)" strokeWidth="2" strokeDasharray="5,5" />
                    <polygon points="200,310 195,300 205,300" fill="oklch(0.82 0.16 65)" />
                  </g>

                  {/* After: Happy face */}
                  <g style={{ opacity: 1, transition: "opacity 1s" }}>
                    <circle cx="300" cy="100" r="60" fill="oklch(0.75 0.18 145)" />
                    <circle cx="285" cy="85" r="8" fill="oklch(0.95 0.01 265)" />
                    <circle cx="315" cy="85" r="8" fill="oklch(0.95 0.01 265)" />
                    <path d="M 285 110 Q 300 120 315 110" stroke="oklch(0.95 0.01 265)" strokeWidth="3" fill="none" />
                    <text x="300" y="200" textAnchor="middle" fontSize="20" fill="oklch(0.82 0.16 65)" fontWeight="bold">
                      DEEP SLEEP
                    </text>
                    <text x="300" y="230" textAnchor="middle" fontSize="14" fill="oklch(0.60 0.04 265)">
                      Rested · Sharp · Calm
                    </text>
                  </g>
                </svg>
              </div>
            )}

            {/* Phase 1: Brain Wave Visualization */}
            {animationPhase === 1 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-1000">
                <svg viewBox="0 0 400 400" className="w-full max-w-md" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))" }}>
                  {/* Brain outline */}
                  <circle cx="200" cy="150" r="80" fill="none" stroke="oklch(0.82 0.16 65)" strokeWidth="2" opacity="0.3" />

                  {/* Animated neurons */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const angle = (i / 5) * Math.PI * 2;
                    const x = 200 + Math.cos(angle) * 70;
                    const y = 150 + Math.sin(angle) * 70;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="8" fill="oklch(0.82 0.16 65)" opacity="0.6" />
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="none"
                          stroke="oklch(0.82 0.16 65)"
                          strokeWidth="2"
                          style={{
                            animation: `pulse 2s ease-in-out ${i * 0.4}s infinite`,
                          }}
                        />
                      </g>
                    );
                  })}

                  {/* Sleep waves */}
                  <path
                    d="M 50 250 Q 75 230 100 250 T 150 250 T 200 250 T 250 250 T 300 250 T 350 250"
                    stroke="oklch(0.75 0.18 145)"
                    strokeWidth="3"
                    fill="none"
                    style={{
                      animation: `wave 3s ease-in-out infinite`,
                    }}
                  />

                  <text x="200" y="330" textAnchor="middle" fontSize="18" fill="oklch(0.82 0.16 65)" fontWeight="bold">
                    Brain Waves Normalizing
                  </text>
                </svg>

                <style>{`
                  @keyframes pulse {
                    0%, 100% { r: 8; opacity: 0.6; }
                    50% { r: 12; opacity: 1; }
                  }
                  @keyframes wave {
                    0%, 100% { d: path("M 50 250 Q 75 230 100 250 T 150 250 T 200 250 T 250 250 T 300 250 T 350 250"); }
                    50% { d: path("M 50 250 Q 75 270 100 250 T 150 250 T 200 250 T 250 250 T 300 250 T 350 250"); }
                  }
                `}</style>
              </div>
            )}

            {/* Phase 2: Sleep Dashboard */}
            {animationPhase === 2 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-1000">
                <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: "oklch(0.15 0.04 265 / 0.9)", border: "1px solid oklch(0.25 0.04 265)", backdropFilter: "blur(12px)" }}>
                  <h3 className="text-xl font-bold mb-6" style={{ color: "oklch(0.95 0.01 265)" }}>
                    Your Sleep Score
                  </h3>

                  {/* Main Score */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="oklch(0.25 0.04 265)" strokeWidth="8" />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="oklch(0.82 0.16 65)"
                          strokeWidth="8"
                          strokeDasharray={`${Math.PI * 100 * 0.85} ${Math.PI * 100}`}
                          style={{
                            animation: `fillScore 2s ease-out forwards`,
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black" style={{ color: "oklch(0.82 0.16 65)" }}>85</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <MetricBar label="Deep Sleep" value={72} />
                    <MetricBar label="REM Sleep" value={68} />
                    <MetricBar label="Heart Rate" value={58} />
                    <MetricBar label="Sleep Duration" value={7.5} isTime />
                  </div>

                  <style>{`
                    @keyframes fillScore {
                      from { stroke-dasharray: 0 ${Math.PI * 100}; }
                      to { stroke-dasharray: ${Math.PI * 100 * 0.85} ${Math.PI * 100}; }
                    }
                  `}</style>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, oklch(0.82 0.16 65 / 0.5), transparent)" }}></div>
    </div>
  );
}

function MetricBar({ label, value, isTime = false }: { label: string; value: number; isTime?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 ml-4">
        <div className="h-2 flex-1 rounded-full" style={{ background: "oklch(0.25 0.04 265)" }}>
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{
              background: "oklch(0.82 0.16 65)",
              width: `${isTime ? (value / 8) * 100 : value}%`,
            }}
          />
        </div>
        <span className="text-sm font-semibold" style={{ color: "oklch(0.82 0.16 65)", minWidth: "40px" }}>
          {isTime ? `${value}h` : `${value}%`}
        </span>
      </div>
    </div>
  );
}
