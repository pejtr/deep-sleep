import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { Moon, ArrowRight, Lock, Mail, Star, Shield, Check, Users, ArrowLeft, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId, setChronotype, useTrackBehavior } from "@/hooks/useSession";
import { useBehaviorTracker } from "@/hooks/useBehaviorTracker";
import { useCurrency } from "@/contexts/CurrencyContext";
import CountdownTimer from "@/components/CountdownTimer";
import { CheckoutButton } from "@/components/CheckoutButton";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

// ── Types ─────────────────────────────────────────────────────────────────────
type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
type Phase = "quiz" | "email" | "result";

const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬" };

// ── Quiz questions (5 — optimized for speed) ─────────────────────────────────
const QUESTIONS = [
  {
    text: "If you had no alarm, what time would you naturally wake up?",
    options: [
      "🌅 Before 6:30am — I'm up with the sun",
      "☀️ 6:30–8:30am — A reasonable morning",
      "🌤️ 8:30–10:30am — I need my sleep",
      "After 10:30am — I'm a true night owl",
    ],
  },
  {
    text: "When do you feel most mentally sharp?",
    options: [
      "🌄 Early morning (5–9am)",
      "🌞 Mid-morning to early afternoon (9am–1pm)",
      "🌆 Late afternoon to evening (5–9pm)",
      "🌃 Late night (9pm–2am)",
    ],
  },
  {
    text: "What's your ideal bedtime?",
    options: [
      "Before 9pm",
      "9–11pm",
      "11pm–1am",
      "After 1am",
    ],
  },
  {
    text: "How would you describe your sleep quality?",
    options: [
      "😴 Deep and restful — I sleep like a log",
      "😐 Decent — I wake occasionally",
      "😰 Light and fragmented — I wake often",
      "😩 Terrible — I lie awake for hours",
    ],
  },
  {
    text: "How do you handle stress before bed?",
    options: [
      "😌 I rarely feel stressed at bedtime",
      "I sometimes worry but can let it go",
      "I need distraction to wind down",
      "😰 My mind races — I can't stop thinking",
    ],
  },
];

// ── Chronotype data ──────────────────────────────────────────────────────────
const CHRONOTYPE_DATA: Record<Chronotype, {
  title: string;
  description: string;
  problems: string[];
  worstMistake: string;
  protocolPreview: string[];
}> = {
  Lion: {
    title: "The Lion",
    description: "You're an early riser with peak energy in the morning. Lions dominate the first half of the day but crash hard by evening.",
    problems: ["Energy crash after 3pm", "Can't stay awake past 9pm", "Wake too early and can't fall back asleep"],
    worstMistake: "Staying up past 10pm destroys your Lion sleep architecture.",
    protocolPreview: ["Optimal Lion wake/sleep times", "Morning energy amplification protocol", "Evening wind-down ritual for early chronotypes"],
  },
  Bear: {
    title: "The Bear",
    description: "You follow the solar cycle — the most common chronotype. Bears feel best with a standard schedule but suffer when life disrupts their rhythm.",
    problems: ["Monday morning grogginess", "Afternoon energy dip (2–3pm)", "Inconsistent weekend sleep"],
    worstMistake: "Sleeping in on weekends. Bears suffer the most from 'social jet lag.'",
    protocolPreview: ["Bear-specific wake time anchoring", "Afternoon recovery protocol", "Weekend consistency system"],
  },
  Wolf: {
    title: "The Wolf",
    description: "You're a night owl with peak creativity in the evening. Your biology runs on a different clock — and that's your superpower.",
    problems: ["Can't fall asleep before midnight", "Mornings feel impossible", "Constant social jet lag"],
    worstMistake: "Trying to force yourself into a Lion schedule causes chronic sleep deprivation.",
    protocolPreview: ["Wolf-optimized schedule shift", "Blue-light management protocol", "Night-owl energy optimization"],
  },
  Dolphin: {
    title: "The Dolphin",
    description: "You're a light, irregular sleeper with a hyperactive mind. Dolphins have anxiety-driven sleep issues but are highly intelligent and creative.",
    problems: ["Waking at 3–4am and can't fall back asleep", "Mind racing at bedtime", "Never feeling fully rested"],
    worstMistake: "Checking your phone at 3am resets your cortisol and makes sleep impossible.",
    protocolPreview: ["Dolphin 90-min wind-down protocol", "Anxious-mind breathing techniques", "Deep sleep trigger sequence"],
  },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function QuizFunnel() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const utmSource = params.get("utm_source") ?? "direct";
  const utmCampaign = params.get("utm_campaign") ?? "";

  // State
  const [phase, setPhase] = useState<Phase>("quiz");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [chronotype, setChronotypeState] = useState<Chronotype>("Bear");
  const [viewers] = useState(() => Math.floor(Math.random() * 30) + 80);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { track } = useTrackBehavior();
  const { formatPrice } = useCurrency();
  useBehaviorTracker("quiz_funnel");

  const submitMutation = trpc.quiz.submit.useMutation();
  const leadMutation = trpc.leads.capture.useMutation();

  useEffect(() => {
    track("page_view", { page: "quiz_funnel", value: { utm_source: utmSource, utm_campaign: utmCampaign } });
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); };
  }, []);

  // ── Quiz logic ─────────────────────────────────────────────────────────────
  const advanceQuiz = useCallback(async (sel: number, currentIdx: number, currentAnswers: number[]) => {
    const newAnswers = [...currentAnswers, sel];
    setAnswers(newAnswers);
    track("quiz_answer", { page: "quiz_funnel", value: { question: currentIdx + 1, answer: sel } });

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setSubmitting(true);
      try {
        const result = await submitMutation.mutateAsync({
          sessionId: getSessionId(),
          answers: newAnswers,
          abVariant: "funnel",
        });
        setChronotype(result.chronotype);
        setChronotypeState(result.chronotype as Chronotype);
        track("quiz_complete", { page: "quiz_funnel", value: { chronotype: result.chronotype } });
        setPhase("email");
      } catch {
        setSubmitting(false);
      }
    }
  }, [submitMutation, track]);

  const handleSelect = (idx: number) => {
    if (submitting) return;
    setSelected(idx);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceQuiz(idx, current, answers);
    }, 350);
  };

  const handleBack = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (current === 0) return;
    setCurrent(c => c - 1);
    setSelected(answers[current - 1] ?? null);
    setAnswers(a => a.slice(0, -1));
  };

  // ── Email capture ──────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setEmailError("Please enter a valid email"); return; }
    setEmailError("");
    try {
      await leadMutation.mutateAsync({
        email,
        sessionId: getSessionId(),
        chronotype,
        source: `quiz_funnel_${utmSource}`,
      });
      track("email_capture", { page: "quiz_funnel", value: { chronotype } });
      setPhase("result");
    } catch {
      setEmailError("Something went wrong. Please try again.");
    }
  };

  const handleSkipEmail = () => {
    track("email_skip", { page: "quiz_funnel", value: { chronotype } });
    setPhase("result");
  };

  const handleGetProtocol = () => {
    track("cta_click", { page: "quiz_funnel", element: "get_protocol", value: { chronotype } });
    navigate(`/order?chronotype=${chronotype}`);
  };

  const data = CHRONOTYPE_DATA[chronotype];
  const icon = CHRONOTYPE_ICONS[chronotype];
  const progress = (current / QUESTIONS.length) * 100;
  const question = QUESTIONS[current];

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: QUIZ
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "quiz") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="orb orb-gold w-72 h-72 opacity-15" style={{ top: "-5%", right: "5%" }} />
        <div className="orb orb-blue w-64 h-64 opacity-10" style={{ bottom: "10%", left: "-5%" }} />

        {/* Header */}
        <div className="relative z-10 container py-4 flex items-center justify-between">
          {current > 0 ? (
            <button onClick={handleBack} className="flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.50 0.04 265)" }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
            <span className="text-sm font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>Sleep Type Quiz</span>
          </div>
          <div className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.55 0.18 145 / 0.15)", color: "oklch(0.65 0.18 145)" }}>
            Free
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 container pb-2">
          <div className="progress-bar">
            <div className="progress-bar-fill transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-center text-xs mt-1" style={{ color: "oklch(0.45 0.04 265)" }}>
            {current + 1} of {QUESTIONS.length} — takes 60 seconds
          </p>
        </div>

        {/* Question */}
        <div className="relative z-10 flex-1 container py-8 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <div className="w-full">
            <h2 className="font-display font-bold text-xl md:text-2xl mb-6 leading-snug" style={{ color: "oklch(0.95 0.01 265)" }}>
              {question?.text}
            </h2>
            <div className="flex flex-col gap-3">
              {question?.options.map((option, idx) => (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={submitting}
                  className="w-full text-left rounded-xl p-4 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: selected === idx ? "oklch(0.78 0.18 65 / 0.18)" : "oklch(0.10 0.025 255)",
                    border: `1px solid ${selected === idx ? "oklch(0.78 0.18 65 / 0.6)" : "oklch(0.78 0.18 65 / 0.12)"}`,
                    color: "oklch(0.95 0.01 265)",
                    transform: selected === idx ? "scale(1.015)" : "scale(1)",
                    boxShadow: selected === idx ? "0 0 16px oklch(0.78 0.18 65 / 0.15)" : "none",
                  }}>
                  <span className="text-sm md:text-base">{option}</span>
                </button>
              ))}
            </div>

            {selected === null && !submitting && (
              <p className="text-center text-xs mt-5" style={{ color: "oklch(0.40 0.04 265)" }}>
                Tap an answer to continue
              </p>
            )}

            {submitting && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: "oklch(0.78 0.18 65 / 0.1)", color: "oklch(0.78 0.18 65)" }}>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Analyzing your sleep type...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social proof footer */}
        <div className="relative z-10 container pb-6 text-center">
          <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 12,847+ taken</span>
            <span className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              4.9/5
            </span>
            <span>100% private</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: EMAIL CAPTURE (gate before results)
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "email") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="orb orb-gold w-96 h-96 opacity-15" style={{ top: "-10%", right: "-5%" }} />
        <div className="orb orb-purple w-72 h-72 opacity-10" style={{ bottom: "10%", left: "-10%" }} />

        <div className="relative z-10 container max-w-md mx-auto py-10">
          <div className="glass-card rounded-3xl p-8 text-center" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
            <div className="text-6xl mb-4 animate-float">{icon}</div>
            <div className="badge-popular mb-3">Your Result Is Ready</div>
            <h1 className="font-display font-bold text-2xl mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
              You're {data.title}!
            </h1>
            <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.04 265)" }}>
              Enter your email to unlock your full {chronotype} sleep profile — including your #1 sleep mistake and personalized protocol preview.
            </p>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.55 0.04 265)" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" autoFocus
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "oklch(0.95 0.01 265)" }} />
              </div>
              {emailError && <p className="text-xs" style={{ color: "oklch(0.65 0.22 25)" }}>{emailError}</p>}
              <button type="submit"
                className="w-full cta-gold cta-shimmer rounded-xl py-4 text-sm font-bold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Unlock My {chronotype} Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <button onClick={handleSkipEmail}
              className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>
              Skip — show me my results
            </button>

            <div className="flex items-center justify-center gap-3 mt-4 text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No spam</span>
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE: RESULT + OFFER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-96 h-96 opacity-15" style={{ top: "-5%", right: "-10%" }} />
      <div className="orb orb-blue w-72 h-72 opacity-10" style={{ bottom: "20%", left: "-5%" }} />

      {/* Urgency banner */}
      <CountdownTimer variant="banner" label="Your personalized protocol is reserved for:" />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="font-display font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>
            Deep Sleep Reset
          </span>
        </div>
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto py-6">

        {/* Result card */}
        <div className="glass-card rounded-3xl p-8 mb-6 text-center relative overflow-hidden">
          <div className="text-6xl mb-4 animate-float">{icon}</div>
          <div className="badge-popular mb-3">Your Chronotype</div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-3" style={{ color: "oklch(0.82 0.16 65)" }}>
            You are {data.title}
          </h1>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.70 0.04 265)" }}>
            {data.description}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
              <strong style={{ color: "oklch(0.70 0.04 265)" }}>{viewers} people</strong> viewing {chronotype} results now
            </span>
          </div>
        </div>

        {/* Problems */}
        <div className="glass-card rounded-2xl p-6 mb-4">
          <h3 className="font-bold text-base mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
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
        <div className="rounded-2xl p-5 mb-4" style={{ background: "oklch(0.65 0.22 25 / 0.08)", border: "1px solid oklch(0.65 0.22 25 / 0.2)" }}>
          <h3 className="font-bold text-sm mb-2" style={{ color: "oklch(0.75 0.22 25)" }}>
            ⚠️ The #1 Mistake {chronotype}s Make
          </h3>
          <p className="text-sm" style={{ color: "oklch(0.65 0.04 265)" }}>{data.worstMistake}</p>
        </div>

        {/* Protocol preview */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-base mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            What's Inside Your {chronotype} Protocol
          </h3>
          <div className="flex flex-col gap-2">
            {data.protocolPreview.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }} />
                <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
              </div>
            ))}
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }} />
              <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>7-Night step-by-step sleep reset plan</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }} />
              <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>Deep sleep trigger audio (10 min)</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.18 65)" }} />
              <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>Lifetime access + all future updates</span>
            </div>
          </div>
        </div>

        {/* ═══════ OFFER CARD ═══════ */}
        <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden mb-6"
          style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="orb orb-gold w-48 h-48 opacity-10" style={{ top: "-30%", left: "-10%" }} />

          <div className="badge-popular mb-4">Limited Time Offer</div>
          <h2 className="font-display font-bold text-2xl mb-3 relative z-10" style={{ color: "oklch(0.95 0.01 265)" }}>
            Get Your {chronotype} Deep Sleep Protocol
          </h2>

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

          <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
            <span className="text-sm line-through" style={{ color: "oklch(0.40 0.04 265)" }}>{formatPrice(75)}</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>{formatPrice(5)}</span>
            <span className="badge-popular">93% OFF</span>
          </div>

          <CountdownTimer variant="inline" label="Offer expires in:" />

          <div className="mt-4 relative z-10">
            <CheckoutButton
              productId="main"
              sessionId={getSessionId()}
              email={email || undefined}
              chronotype={chronotype}
              variant="primary"
              className="w-full rounded-2xl py-5 text-lg"
            >
              <Lock className="w-5 h-5" />
              <span>Get My {chronotype} Protocol — {formatPrice(5)}</span>
              <ArrowRight className="w-5 h-5" />
            </CheckoutButton>
          </div>

          <p className="text-xs mt-3 relative z-10" style={{ color: "oklch(0.40 0.04 265)" }}>
            Secure checkout · Instant PDF access · 30-day money-back guarantee
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-4 relative z-10">
            <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
              <Shield className="w-3.5 h-3.5" /> 256-bit SSL
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
              <Zap className="w-3.5 h-3.5" /> Instant access
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
              <Check className="w-3.5 h-3.5" /> All cards accepted
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="rounded-2xl p-5 mb-6 text-center"
          style={{ background: "oklch(0.55 0.18 145 / 0.06)", border: "1px solid oklch(0.55 0.18 145 / 0.2)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "oklch(0.70 0.18 145)" }}>
            Sleep Better or Pay Nothing
          </p>
          <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>
            Try the full protocol for 30 days. If you don't sleep deeper, email us for a complete refund. No questions asked.
          </p>
        </div>

        {/* Testimonials */}
        <div className="mb-8">
          <h3 className="font-bold text-base text-center mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            What {chronotype}s Say After the Protocol
          </h3>
          <TestimonialsCarousel chronotype={chronotype} />
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "oklch(0.35 0.04 265)" }}>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/refund" className="hover:underline">Refund Policy</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </div>
          <p className="text-xs mt-2" style={{ color: "oklch(0.30 0.04 265)" }}>
            © 2026 Deep Sleep Reset. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
