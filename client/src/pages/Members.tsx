import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Moon, Download, Play, CheckCircle, Lock, Star, Sparkles, ChevronRight, LogOut, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import SleepChatBot from "@/components/SleepChatBot";

// ── Night progress tracker ────────────────────────────────────────────────────
const NIGHTS = [
  { night: 1, title: "Baseline Assessment & Light Reset", duration: "90 min" },
  { night: 2, title: "Temperature & Breathing Protocol", duration: "60 min" },
  { night: 3, title: "Wind-Down Ritual & Cortisol Reset", duration: "45 min" },
  { night: 4, title: "Sleep Environment Optimization", duration: "30 min" },
  { night: 5, title: "Cognitive Restructuring & Sleep Restriction", duration: "60 min" },
  { night: 6, title: "Stimulus Control & Bed Anchoring", duration: "45 min" },
  { night: 7, title: "Maintenance & Long-Term Protocol", duration: "30 min" },
];

const ASMR_TRACKS = [
  { id: 1, title: "Deep Forest Rain", duration: "45 min", type: "Nature", color: "oklch(0.55 0.18 160)" },
  { id: 2, title: "Ocean Waves & Theta Binaural", duration: "60 min", type: "Binaural", color: "oklch(0.55 0.18 220)" },
  { id: 3, title: "Fireplace Crackling", duration: "30 min", type: "Nature", color: "oklch(0.60 0.18 40)" },
  { id: 4, title: "432Hz Sleep Frequency", duration: "90 min", type: "Frequency", color: "oklch(0.55 0.18 280)" },
];

const RESOURCES = [
  { title: "7-Night Protocol PDF", icon: "📋", desc: "Complete CBT-I protocol guide", href: "/protocol" },
  { title: "Sleep Environment Checklist", icon: "✅", desc: "Optimize your bedroom for deep sleep", href: "#" },
  { title: "Chronotype Guide", icon: "🦁", desc: "Lion, Bear, Wolf, Dolphin profiles", href: "#" },
  { title: "30-Day Sleep Tracker", icon: "📊", desc: "Track your sleep improvement journey", href: "#" },
];

export default function Members() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [completedNights, setCompletedNights] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"protocol" | "asmr" | "resources" | "coach">("protocol");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/members/login");
    }
  }, [user, loading, navigate]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dsr_night_progress");
    if (saved) {
      try { setCompletedNights(JSON.parse(saved)); } catch {}
    }
  }, []);

  const toggleNight = (night: number) => {
    setCompletedNights(prev => {
      const next = prev.includes(night) ? prev.filter(n => n !== night) : [...prev, night];
      localStorage.setItem("dsr_night_progress", JSON.stringify(next));
      return next;
    });
  };

  const progressPct = Math.round((completedNights.length / 7) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.06 0.03 255)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "oklch(0.75 0.18 280)" }} />
      </div>
    );
  }

  if (!user) return null;

  const chronotype = (localStorage.getItem("dsr_chronotype") || "Bear") as string;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.06 0.03 255)" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full blur-3xl opacity-10"
          style={{ width: "500px", height: "500px", background: "radial-gradient(circle, oklch(0.55 0.22 280), transparent)", top: "-100px", right: "-100px" }} />
        <div className="absolute rounded-full blur-3xl opacity-8"
          style={{ width: "400px", height: "400px", background: "radial-gradient(circle, oklch(0.65 0.18 65), transparent)", bottom: "0", left: "-100px" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b" style={{ borderColor: "oklch(0.18 0.04 255 / 0.5)", background: "oklch(0.08 0.025 255 / 0.9)", backdropFilter: "blur(20px)" }}>
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5" style={{ color: "oklch(0.82 0.16 65)" }} />
            <span className="font-semibold text-white">Deep Sleep Reset</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "oklch(0.25 0.10 280 / 0.5)", color: "oklch(0.75 0.18 280)" }}>
              Members
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "oklch(0.18 0.06 280)" }}>
                <User className="w-4 h-4" style={{ color: "oklch(0.75 0.18 280)" }} />
              </div>
              <span className="text-sm hidden sm:block" style={{ color: "oklch(0.70 0.04 255)" }}>
                {user.name ?? user.email ?? "Member"}
              </span>
            </div>
            <button
              onClick={() => logout().then(() => navigate("/"))}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "oklch(0.55 0.04 255)", background: "oklch(0.12 0.03 255)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Welcome banner */}
      <div className="relative z-10 container py-6">
        <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(135deg, oklch(0.14 0.06 280 / 0.8), oklch(0.12 0.04 255 / 0.8))", border: "1px solid oklch(0.25 0.08 280 / 0.4)" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                Welcome back, {user.name?.split(" ")[0] ?? "Sleeper"} 🌙
              </h1>
              <p className="text-sm" style={{ color: "oklch(0.65 0.06 255)" }}>
                Your 7-Night Deep Sleep Reset journey
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>
                  {completedNights.length}/7
                </div>
                <div className="text-xs" style={{ color: "oklch(0.55 0.04 255)" }}>Nights done</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="oklch(0.18 0.04 255)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="oklch(0.82 0.16 65)" strokeWidth="6"
                    strokeDasharray={`${progressPct * 1.76} 176`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{progressPct}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "protocol", label: "Protocol", icon: "🌙" },
            { id: "asmr", label: "ASMR Tracks", icon: "🎵" },
            { id: "resources", label: "Resources", icon: "📚" },
            { id: "coach", label: "Ask Luna", icon: "✨" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.id ? "oklch(0.55 0.22 280)" : "oklch(0.12 0.03 255)",
                color: activeTab === tab.id ? "white" : "oklch(0.55 0.04 255)",
                border: `1px solid ${activeTab === tab.id ? "transparent" : "oklch(0.20 0.04 255)"}`,
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Protocol Tab */}
        {activeTab === "protocol" && (
          <div className="space-y-3">
            <p className="text-sm mb-4" style={{ color: "oklch(0.60 0.04 255)" }}>
              Complete each night in order. Check off nights as you complete them.
            </p>
            {NIGHTS.map(({ night, title, duration }) => {
              const done = completedNights.includes(night);
              const isNext = !done && completedNights.length === night - 1;
              return (
                <div
                  key={night}
                  onClick={() => toggleNight(night)}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    background: done
                      ? "oklch(0.14 0.06 160 / 0.5)"
                      : isNext
                      ? "oklch(0.14 0.06 280 / 0.8)"
                      : "oklch(0.10 0.025 255 / 0.8)",
                    border: `1px solid ${done ? "oklch(0.35 0.12 160 / 0.5)" : isNext ? "oklch(0.35 0.12 280 / 0.5)" : "oklch(0.18 0.04 255 / 0.4)"}`,
                  }}
                >
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle className="w-6 h-6" style={{ color: "oklch(0.65 0.20 160)" }} />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                        style={{ borderColor: isNext ? "oklch(0.65 0.18 280)" : "oklch(0.30 0.04 255)", color: isNext ? "oklch(0.65 0.18 280)" : "oklch(0.45 0.04 255)" }}>
                        {night}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: done ? "oklch(0.65 0.20 160)" : isNext ? "oklch(0.65 0.18 280)" : "oklch(0.45 0.04 255)" }}>
                        Night {night}
                      </span>
                      {isNext && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "oklch(0.25 0.10 280 / 0.5)", color: "oklch(0.75 0.18 280)" }}>Tonight</span>}
                    </div>
                    <p className="text-sm font-medium text-white truncate">{title}</p>
                    <p className="text-xs" style={{ color: "oklch(0.50 0.04 255)" }}>{duration} · Tap to {done ? "unmark" : "mark complete"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.40 0.04 255)" }} />
                </div>
              );
            })}
            <a href="/protocol" className="flex items-center justify-center gap-2 mt-4 p-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
              style={{ background: "oklch(0.12 0.04 255)", border: "1px solid oklch(0.22 0.06 280 / 0.5)", color: "oklch(0.75 0.18 280)" }}>
              <Download className="w-4 h-4" />
              View Full Protocol PDF
            </a>
          </div>
        )}

        {/* ASMR Tracks Tab */}
        {activeTab === "asmr" && (
          <div className="space-y-3">
            <p className="text-sm mb-4" style={{ color: "oklch(0.60 0.04 255)" }}>
              Play these tracks during your wind-down ritual for maximum sleep induction.
            </p>
            {ASMR_TRACKS.map(track => (
              <div key={track.id} className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "oklch(0.10 0.025 255 / 0.8)", border: "1px solid oklch(0.18 0.04 255 / 0.4)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${track.color} / 0.2` }}>
                  <Play className="w-5 h-5" style={{ color: track.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{track.title}</p>
                  <p className="text-xs" style={{ color: "oklch(0.50 0.04 255)" }}>{track.type} · {track.duration}</p>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-[1.05]"
                  style={{ background: "oklch(0.18 0.06 280 / 0.5)", color: "oklch(0.75 0.18 280)", border: "1px solid oklch(0.30 0.10 280 / 0.4)" }}>
                  Play
                </button>
              </div>
            ))}
            <div className="mt-4 p-4 rounded-xl" style={{ background: "oklch(0.12 0.04 255 / 0.6)", border: "1px solid oklch(0.22 0.06 280 / 0.3)" }}>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 255)" }}>
                💡 <strong className="text-white">Pro tip:</strong> Use headphones for binaural tracks. Start playing 30 minutes before your target sleep time.
              </p>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-3">
            {RESOURCES.map((res, i) => (
              <a key={i} href={res.href} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: "oklch(0.10 0.025 255 / 0.8)", border: "1px solid oklch(0.18 0.04 255 / 0.4)", textDecoration: "none" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "oklch(0.15 0.04 255)" }}>
                  {res.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{res.title}</p>
                  <p className="text-xs" style={{ color: "oklch(0.50 0.04 255)" }}>{res.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.40 0.04 255)" }} />
              </a>
            ))}

            {/* Membership upgrade CTA */}
            <div className="mt-6 p-5 rounded-2xl" style={{ background: "linear-gradient(135deg, oklch(0.14 0.08 280 / 0.8), oklch(0.12 0.06 300 / 0.8))", border: "1px solid oklch(0.30 0.12 280 / 0.4)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
                <span className="text-sm font-semibold text-white">Premium Membership</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.82 0.16 65 / 0.2)", color: "oklch(0.82 0.16 65)" }}>Coming Soon</span>
              </div>
              <p className="text-xs mb-3" style={{ color: "oklch(0.60 0.04 255)" }}>
                Monthly coaching sessions with Luna, advanced sleep analytics, new protocols every month, and community access.
              </p>
              <button className="text-xs px-4 py-2 rounded-lg font-medium" style={{ background: "oklch(0.55 0.22 280 / 0.3)", color: "oklch(0.75 0.18 280)", border: "1px solid oklch(0.40 0.15 280 / 0.4)" }}>
                Notify me when available →
              </button>
            </div>
          </div>
        )}

        {/* Coach Tab */}
        {activeTab === "coach" && (
          <div className="relative" style={{ height: "60vh", minHeight: "400px" }}>
            <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.18 0.04 255 / 0.4)" }}>
              <SleepChatBot forceMode="post_purchase" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
