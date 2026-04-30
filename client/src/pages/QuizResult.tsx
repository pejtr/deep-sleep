import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, Mail, Users } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import TrustBar from "@/components/TrustBar";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { trackQuizComplete, trackLead, trackViewContent } from "@/lib/conversionTracking";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";

const CHRONOTYPE_DATA: Record<Chronotype, {
  icon: string;
  color: string;
  title: string;
  description: string;
  problems: string[];
  solutions: string[];
  worstMistake: string;
}> = {
  Lion: {
    icon: "🦁",
    color: "oklch(0.82 0.16 65)",
    title: "The Lion",
    description: "You're an early riser with peak mental energy in the morning. Lions are natural leaders who dominate the first half of the day — but crash hard by evening.",
    problems: ["Energy crash after 3pm", "Can't stay awake past 9pm socially", "Wake too early and can't fall back asleep"],
    solutions: ["Front-load your hardest work before noon", "Protect your 9pm wind-down ritual", "Use the Lion's 7-Night Deep Sleep Protocol"],
    worstMistake: "Staying up past 10pm 'just to finish one more thing' — this destroys your Lion sleep architecture.",
  },
  Bear: {
    icon: "🐻",
    color: "oklch(0.65 0.18 180)",
    title: "The Bear",
    description: "You follow the solar cycle — the most common chronotype. Bears feel best with a standard schedule but often suffer when life forces them off their natural rhythm.",
    problems: ["Monday morning grogginess", "Afternoon energy dip (2–3pm)", "Inconsistent sleep on weekends"],
    solutions: ["Anchor your wake time 7 days a week", "Use the Bear's afternoon recovery protocol", "Follow the Bear's 7-Night Deep Sleep Protocol"],
    worstMistake: "Sleeping in on weekends. Bears suffer the most from 'social jet lag' — shifting your schedule by even 2 hours wrecks your whole week.",
  },
  Wolf: {
    icon: "🐺",
    color: "oklch(0.65 0.18 290)",
    title: "The Wolf",
    description: "You're a night owl with peak creativity and energy in the evening. Wolves are often misunderstood as lazy — but your biology simply runs on a different clock.",
    problems: ["Can't fall asleep before midnight", "Mornings feel impossible", "Constant social jet lag from 9-to-5 world"],
    solutions: ["Shift your schedule 2 hours later where possible", "Use blue-light blocking after 8pm", "Follow the Wolf's 7-Night Deep Sleep Protocol"],
    worstMistake: "Trying to force yourself into a Lion schedule. Fighting your Wolf chronotype causes chronic sleep deprivation and kills your natural peak performance window.",
  },
  Dolphin: {
    icon: "🐬",
    color: "oklch(0.65 0.18 220)",
    title: "The Dolphin",
    description: "You're a light, irregular sleeper with a hyperactive mind. Dolphins often have anxiety-driven sleep issues and wake easily — but you're also highly intelligent and creative.",
    problems: ["Waking at 3–4am and can't fall back asleep", "Mind racing at bedtime", "Never feeling fully rested"],
    solutions: ["Implement the Dolphin wind-down protocol 90 min before bed", "Use specific breathing techniques for anxious minds", "Follow the Dolphin's 7-Night Deep Sleep Protocol"],
    worstMistake: "Checking your phone when you wake at 3am. This completely resets your cortisol and makes falling back asleep nearly impossible.",
  },
};

export default function QuizResult() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const data = CHRONOTYPE_DATA[chronotype] ?? CHRONOTYPE_DATA.Bear;

  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [viewers] = useState(() => Math.floor(Math.random() * 40) + 120);
  const { track } = useTrackBehavior();

  const leadMutation = trpc.leads.capture.useMutation();
  const abMutation = trpc.abTest.markConverted.useMutation();

  useEffect(() => {
    track("page_view", { page: "quiz_result", value: { chronotype } });
    // Mark quiz as converted for A/B test
    abMutation.mutate({ sessionId: getSessionId(), testName: "headline" });
    // Fire quiz complete conversion on all platforms
    trackQuizComplete(chronotype);
    trackViewContent({ productId: "main", productName: `Deep Sleep Reset - ${chronotype}`, value: 5 });
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setEmailError("Please enter a valid email"); return; }
    setEmailError("");
    try {
      await leadMutation.mutateAsync({
        email,
        sessionId: getSessionId(),
        chronotype,
        source: "quiz_result",
      });
      setEmailSubmitted(true);
      track("email_capture", { page: "quiz_result", value: { chronotype } });
      trackLead({ email });
    } catch {
      setEmailError("Something went wrong. Please try again.");
    }
  };

  const handleGetProtocol = () => {
    track("cta_click", { page: "quiz_result", element: "get_protocol", value: { chronotype } });
    navigate(`/order?chronotype=${chronotype}`);
  };

  return (
    <div className="min-h-screen pb-32 md:pb-0" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Orbs */}
      <div className="orb orb-gold w-96 h-96 opacity-15" style={{ top: "-5%", right: "-10%" }} />
      <div className="orb orb-blue w-72 h-72 opacity-10" style={{ bottom: "20%", left: "-5%" }} />

      {/* Urgency banner */}
      <CountdownTimer variant="banner" label="Your personalized protocol is reserved for:" />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-center">
        <span className="font-display font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>
          Deep Sleep Reset — Your Results
        </span>
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto py-8">

        {/* Result card */}
        <div className="glass-card rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="orb orb-gold w-48 h-48 opacity-10" style={{ top: "-20%", right: "-10%" }} />
          <div className="text-6xl mb-4 animate-float">{data.icon}</div>
          <div className="badge-popular mb-3">Your Chronotype</div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3" style={{ color: data.color }}>
            You are a {data.title}
          </h1>
          <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: "oklch(0.70 0.04 265)" }}>
            {data.description}
          </p>

          {/* Live viewers */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Users className="w-3.5 h-3.5" style={{ color: "oklch(0.50 0.04 265)" }} />
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
              <span className="font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>{viewers} people</span> are viewing {chronotype} results right now
            </span>
          </div>
        </div>

        {/* Problems */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-base mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            😔 Why {chronotype}s Struggle With Sleep
          </h3>
          <div className="flex flex-col gap-2">
            {data.problems.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                <span className="text-sm" style={{ color: "oklch(0.65 0.04 265)" }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worst mistake */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "oklch(0.65 0.22 25 / 0.08)", border: "1px solid oklch(0.65 0.22 25 / 0.2)" }}>
          <h3 className="font-bold text-sm mb-2" style={{ color: "oklch(0.75 0.22 25)" }}>
            ⚠️ The #1 Mistake {chronotype}s Make
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
            {data.worstMistake}
          </p>
        </div>

        {/* Solutions preview */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-base mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            ✅ What the {chronotype} Protocol Fixes
          </h3>
          <div className="flex flex-col gap-2">
            {data.solutions.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }}>✓</span>
                <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email capture */}
        {!emailSubmitted ? (
          <div className="glass-card rounded-2xl p-6 mb-8"
            style={{ border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
              <h3 className="font-bold text-sm" style={{ color: "oklch(0.95 0.01 265)" }}>
                Get Your Free {chronotype} Sleep Cheat Sheet
              </h3>
            </div>
            <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>
              Enter your email and we'll send you a free 1-page {chronotype} sleep optimization cheat sheet — even if you don't purchase today.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "oklch(0.10 0.025 255)",
                  border: "1px solid oklch(0.78 0.18 65 / 0.2)",
                  color: "oklch(0.95 0.01 265)",
                }}
              />
              <button type="submit"
                className="cta-gold rounded-lg px-5 py-2.5 text-sm font-bold flex-shrink-0">
                Send Free Sheet
              </button>
            </form>
            {emailError && <p className="text-xs mt-2" style={{ color: "oklch(0.65 0.22 25)" }}>{emailError}</p>}
          </div>
        ) : (
          <div className="rounded-2xl p-4 mb-8 text-center"
            style={{ background: "oklch(0.55 0.18 145 / 0.1)", border: "1px solid oklch(0.55 0.18 145 / 0.25)" }}>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.70 0.18 145)" }}>
              ✅ Cheat sheet sent! Check your inbox.
            </p>
          </div>
        )}

        {/* Countdown */}
        <div className="text-center mb-8">
          <CountdownTimer variant="inline" label="Your personalized protocol is reserved for:" />
        </div>

        {/* Main CTA */}
        <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden"
          style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="orb orb-gold w-48 h-48 opacity-10" style={{ top: "-30%", left: "-10%" }} />
          <div className="badge-popular mb-4">7-Night Deep Sleep Protocol</div>
          <h2 className="font-display font-bold text-2xl mb-3 relative z-10" style={{ color: "oklch(0.95 0.01 265)" }}>
            Get Your Personalized {chronotype} Protocol
          </h2>
          <p className="text-sm mb-6 relative z-10" style={{ color: "oklch(0.60 0.04 265)" }}>
            A complete 7-night step-by-step protocol built specifically for {chronotype} chronotypes — with your exact sleep schedule, wind-down ritual, and deep sleep triggers.
          </p>

          {/* Value stack */}
          <div className="flex flex-col gap-2 mb-6 text-left relative z-10">
            {[
              { item: `${chronotype} Chronotype Sleep Guide (PDF)`, value: "$27" },
              { item: "7-Night Protocol Tracker", value: "$17" },
              { item: `${chronotype}-Specific Wind-Down Ritual`, value: "$12" },
              { item: "Deep Sleep Trigger Audio (10 min)", value: "$19" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: "oklch(0.10 0.025 255)" }}>
                <span className="text-xs" style={{ color: "oklch(0.70 0.04 265)" }}>✓ {row.item}</span>
                <span className="text-xs line-through" style={{ color: "oklch(0.40 0.04 265)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
            <span className="text-sm line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$75</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$5</span>
            <span className="badge-popular">93% OFF</span>
          </div>

          <button
            onClick={handleGetProtocol}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-lg flex items-center justify-center gap-3 relative z-10"
          >
            <Lock className="w-5 h-5" />
            <span>Get My {chronotype} Protocol — $5</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs mt-3 relative z-10" style={{ color: "oklch(0.40 0.04 265)" }}>
            🔒 Secure checkout · Instant PDF access · 30-day money-back guarantee
          </p>
        </div>

        {/* Testimonials */}
        <div className="mt-10">
          <h3 className="font-bold text-base text-center mb-6" style={{ color: "oklch(0.95 0.01 265)" }}>
            What {chronotype}s Say After Using the Protocol
          </h3>
          <TestimonialsCarousel chronotype={chronotype} />
        </div>

        {/* Trust bar */}
        <div className="mt-10">
          <TrustBar variant="compact" />
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <StickyMobileCTA
        label={`Get My ${chronotype} Protocol`}
        price="$5"
        onClick={handleGetProtocol}
      />

      {/* FOMO */}
      <LiveSalesNotification />
    </div>
  );
}
