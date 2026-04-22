import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Moon, Star, Users, Zap } from "lucide-react";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import TrustBar from "@/components/TrustBar";
import { getAbVariant, getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { trpc } from "@/lib/trpc";

// 5 A/B headline variants
const HEADLINES: Record<string, { headline: string; sub: string }> = {
  A: {
    headline: "Discover Your Sleep Chronotype & Finally Sleep Deeply Tonight",
    sub: "Take our free 60-second quiz and get a personalized 7-Night Deep Sleep Protocol matched to your biology.",
  },
  B: {
    headline: "Why You Can't Sleep (It's Not What You Think)",
    sub: "Your chronotype is fighting your schedule. A free 60-second quiz reveals the fix — personalized to your biology.",
  },
  C: {
    headline: "Stop Wasting Hours Lying Awake. Your Chronotype Has the Answer.",
    sub: "12,847+ people discovered their sleep type and transformed their nights. Take the free quiz now.",
  },
  D: {
    headline: "The 60-Second Quiz That Reveals Why You're Always Tired",
    sub: "Your body has a built-in sleep clock. We'll identify yours and give you a protocol that actually works.",
  },
  E: {
    headline: "Sleeping 4 Hours and Still Exhausted? Your Chronotype Is the Problem.",
    sub: "Most sleep advice ignores your biology. Our free quiz matches you to the exact protocol your body needs.",
  },
};

const CHRONOTYPE_CARDS = [
  { type: "Lion", icon: "🦁", time: "5–7am", desc: "Early riser, peak energy in morning", color: "oklch(0.82 0.16 65)" },
  { type: "Bear", icon: "🐻", time: "7–9am", desc: "Solar schedule, mid-day peak", color: "oklch(0.65 0.18 180)" },
  { type: "Wolf", icon: "🐺", time: "9–11am", desc: "Night owl, evening peak energy", color: "oklch(0.65 0.18 290)" },
  { type: "Dolphin", icon: "🐬", time: "Variable", desc: "Light sleeper, irregular rhythm", color: "oklch(0.65 0.18 220)" },
];

// Star particles for cosmic effect
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="star-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            "--duration": `${2 + Math.random() * 4}s`,
            "--delay": `${Math.random() * 3}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const variant = getAbVariant();
  const headline = HEADLINES[variant] ?? HEADLINES["A"]!;
  const { track } = useTrackBehavior();
  const abMutation = trpc.abTest.track.useMutation();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const sessionId = getSessionId();
    track("page_view", { page: "home", value: { variant } });
    abMutation.mutate({ sessionId, testName: "headline", variant, page: "home" });
  }, []);

  const handleStartQuiz = () => {
    track("cta_click", { page: "home", element: "start_quiz" });
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Orbs */}
      <div className="orb orb-gold w-96 h-96 opacity-20" style={{ top: "-10%", right: "-5%" }} />
      <div className="orb orb-blue w-80 h-80 opacity-15" style={{ bottom: "20%", left: "-10%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ top: "40%", right: "20%" }} />
      <StarField />

      {/* Nav */}
      <nav className="relative z-10 container py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="font-display font-bold text-lg" style={{ color: "oklch(0.95 0.01 265)" }}>
            Deep Sleep Reset
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-3 h-3 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
          ))}
          <span className="text-xs ml-1" style={{ color: "oklch(0.50 0.04 265)" }}>4.9★ (2,847)</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 container pt-12 pb-16 md:pt-20 md:pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-reveal"
          style={{ background: "oklch(0.78 0.18 65 / 0.1)", border: "1px solid oklch(0.78 0.18 65 / 0.25)" }}>
          <Zap className="w-3.5 h-3.5" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>
            Free 60-Second Chronotype Quiz
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-3xl md:text-5xl lg:text-6xl leading-tight mb-6 animate-reveal stagger-1 max-w-4xl mx-auto">
          <span className="text-gradient-gold">{headline.headline}</span>
        </h1>

        {/* Sub */}
        <p className="text-base md:text-xl max-w-2xl mx-auto mb-8 animate-reveal stagger-2 leading-relaxed"
          style={{ color: "oklch(0.70 0.04 265)" }}>
          {headline.sub}
        </p>

        {/* Social proof numbers */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 animate-reveal stagger-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
            <span className="text-sm font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>12,847+</span>
            <span className="text-sm" style={{ color: "oklch(0.50 0.04 265)" }}>users</span>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
            ))}
            <span className="text-sm font-bold ml-1" style={{ color: "oklch(0.82 0.16 65)" }}>4.9★</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "oklch(0.50 0.04 265)" }}>🌍 Trusted in 40+ countries</span>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-reveal stagger-3">
          <button
            onClick={handleStartQuiz}
            className="cta-gold cta-shimmer rounded-2xl px-10 py-5 text-lg inline-flex items-center gap-3"
          >
            <Moon className="w-5 h-5" />
            <span>Discover My Chronotype — Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs mt-3" style={{ color: "oklch(0.40 0.04 265)" }}>
            Takes 60 seconds · No credit card required · Instant results
          </p>
        </div>

        {/* Live viewers */}
        <div className="flex items-center justify-center gap-2 mt-6 animate-reveal stagger-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
            <span className="font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>247 people</span> are taking the quiz right now
          </span>
        </div>
      </section>

      {/* Trust bar */}
      <div className="relative z-10">
        <TrustBar />
      </div>

      {/* Chronotype cards */}
      <section className="relative z-10 container py-16">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-3"
          style={{ color: "oklch(0.95 0.01 265)" }}>
          Which Sleep Type Are You?
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: "oklch(0.50 0.04 265)" }}>
          Your chronotype determines your optimal sleep schedule, peak energy windows, and deep sleep protocol.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CHRONOTYPE_CARDS.map(card => (
            <button
              key={card.type}
              onClick={handleStartQuiz}
              className="glass-card glass-card-hover rounded-2xl p-5 text-center cursor-pointer"
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-base mb-1" style={{ color: card.color }}>{card.type}</h3>
              <p className="text-xs font-semibold mb-2" style={{ color: "oklch(0.60 0.04 265)" }}>
                Wakes: {card.time}
              </p>
              <p className="text-xs leading-snug" style={{ color: "oklch(0.50 0.04 265)" }}>{card.desc}</p>
            </button>
          ))}
        </div>
        <div className="text-center mt-8">
          <button onClick={handleStartQuiz}
            className="cta-gold cta-shimmer rounded-xl px-8 py-4 text-base inline-flex items-center gap-2">
            <span>Find My Chronotype</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Why section */}
      <section className="relative z-10 container py-12">
        <div className="section-divider mb-12" />
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-8"
            style={{ color: "oklch(0.95 0.01 265)" }}>
            Why Generic Sleep Advice Fails You
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "❌", title: "One-size-fits-all", desc: "Generic \"sleep at 10pm\" advice ignores your unique biology and chronotype." },
              { icon: "❌", title: "Treats symptoms", desc: "Most sleep guides address symptoms, not the root cause — your misaligned schedule." },
              { icon: "✅", title: "Chronotype-matched", desc: "Our protocol is built around your specific sleep type for maximum deep sleep." },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.04 265)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 container py-16 text-center">
        <div className="glass-card rounded-3xl p-10 max-w-2xl mx-auto relative overflow-hidden">
          <div className="orb orb-gold w-64 h-64 opacity-10" style={{ top: "-30%", right: "-20%" }} />
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-4 relative z-10"
            style={{ color: "oklch(0.95 0.01 265)" }}>
            Ready to Sleep Deeply Tonight?
          </h2>
          <p className="text-sm mb-8 relative z-10" style={{ color: "oklch(0.60 0.04 265)" }}>
            Join 12,847+ people who discovered their chronotype and transformed their sleep.
          </p>
          <button onClick={handleStartQuiz}
            className="cta-gold cta-shimmer rounded-2xl px-10 py-5 text-lg inline-flex items-center gap-3 relative z-10">
            <Moon className="w-5 h-5" />
            <span>Take the Free Quiz Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs mt-4 relative z-10" style={{ color: "oklch(0.40 0.04 265)" }}>
            Free · 60 seconds · Instant personalized results
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container py-8 text-center">
        <div className="section-divider mb-6" />
        <p className="text-xs" style={{ color: "oklch(0.35 0.04 265)" }}>
          © 2024 Deep Sleep Reset. All rights reserved. |{" "}
          <a href="#" className="hover:underline">Privacy Policy</a> |{" "}
          <a href="#" className="hover:underline">Terms of Service</a>
        </p>
      </footer>

      {/* FOMO Engine */}
      <LiveSalesNotification />
    </div>
  );
}
