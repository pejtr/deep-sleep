import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Moon, ArrowLeft, Zap, Shield, Lock, Mail, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId, getAbVariant, setChronotype, useTrackBehavior } from "@/hooks/useSession";
import { setMetaTags } from "@/lib/metaTags";
import { useTransition } from "@/contexts/TransitionContext";

interface Question {
  id: number;
  text: string;
  subtext?: string;
  options: string[];
  insight?: string[]; // mini-insight per answer selection
}

// ── 3 CORE questions — maximum signal, minimum friction ──────────────────────
const CORE_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What time does your body naturally want to wake up?",
    subtext: "Without an alarm — your biology knows.",
    options: [
      "Before 6:30am — I'm up with the sun",
      "6:30–8:30am — A reasonable morning",
      "8:30–10:30am — I need my sleep",
      "After 10:30am — Night owl energy",
    ],
    insight: [
      "Early riser pattern — possible Lion chronotype",
      "Balanced rhythm — possible Bear chronotype",
      "Evening-shifted — possible Wolf chronotype",
      "Extreme night owl — possible Dolphin or Wolf",
    ],
  },
  {
    id: 2,
    text: "When does your brain feel sharpest?",
    subtext: "Your peak mental performance window reveals everything.",
    options: [
      "Early morning (5–9am)",
      "Mid-morning to early afternoon (9am–1pm)",
      "Late afternoon to evening (5–9pm)",
      "Late night (9pm–2am)",
    ],
    insight: [
      "Morning peak — Lion energy pattern confirmed",
      "Midday peak — classic Bear rhythm",
      "Evening peak — Wolf creative surge",
      "Night peak — Dolphin or extreme Wolf",
    ],
  },
  {
    id: 3,
    text: "What happens when you try to fall asleep?",
    subtext: "This is the key question. Be honest.",
    options: [
      "I fall asleep within minutes — no issues",
      "Takes 15-30 min but I get there",
      "I toss and turn — mind won't shut off",
      "Hours of lying awake — it's torture",
    ],
    insight: [
      "Strong sleep drive — your protocol will be straightforward",
      "Mild sleep onset delay — very fixable in 3 nights",
      "Racing mind pattern — your protocol needs specific wind-down triggers",
      "Severe onset insomnia — your 7-night protocol will target this specifically",
    ],
  },
];

// ── 3 BONUS questions — optional, for "more personalized" results ────────────
const BONUS_QUESTIONS: Question[] = [
  {
    id: 4,
    text: "What's your ideal bedtime?",
    subtext: "When does your body want to sleep?",
    options: [
      "Before 9pm",
      "9–11pm",
      "11pm–1am",
      "After 1am",
    ],
  },
  {
    id: 5,
    text: "How do you feel 2 hours after waking?",
    subtext: "Your morning energy reveals your sleep architecture.",
    options: [
      "Alert and ready to go",
      "Okay after coffee",
      "Groggy — takes a while to feel human",
      "Exhausted no matter what",
    ],
  },
  {
    id: 6,
    text: "What usually wakes you at night?",
    subtext: "This determines which protocol module you need most.",
    options: [
      "Nothing — I sleep through",
      "Bathroom or noise",
      "Anxiety or racing thoughts",
      "I wake at 3am and can't get back to sleep",
    ],
  },
];

// Micro-copy per question — builds commitment
const MICRO_COPY = [
  "Your body already knows the answer...",
  "This reveals your hidden energy pattern.",
  "Most insomniacs get this wrong.",
  "Almost there — refining your profile...",
  "This helps personalize Night 1.",
  "Final detail for your protocol.",
];

export default function Quiz() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<"core" | "analyzing" | "email" | "bonus" | "submitting">("core");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [insightText, setInsightText] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { track } = useTrackBehavior();
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitMutation = trpc.quiz.submit.useMutation();
  const captureLead = trpc.leads.capture.useMutation();
  const { navigateWithTransition } = useTransition();

  useEffect(() => {
    setMetaTags({
      title: "Free Sleep Score — Find Your Chronotype | Deep Sleep Reset",
      description: "Discover your sleep chronotype in 30 seconds. Get a personalized sleep protocol based on your biology. Free, instant results.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/hero-night-sky-D3pM5pQbCQhppVQxJN45yn.webp",
      url: window.location.href,
    });
    track("page_view", { page: "quiz" });
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (insightTimer.current) clearTimeout(insightTimer.current);
    };
  }, []);

  const allQuestions = phase === "bonus" ? BONUS_QUESTIONS : CORE_QUESTIONS;
  const questionIndex = phase === "bonus" ? current - CORE_QUESTIONS.length : current;
  const question = allQuestions[questionIndex];
  const totalSteps = phase === "bonus" ? CORE_QUESTIONS.length + BONUS_QUESTIONS.length : CORE_QUESTIONS.length;
  const progress = ((current + 1) / (totalSteps + 1)) * 100; // +1 for email step

  const submitQuiz = async (finalAnswers: number[], userEmail?: string) => {
    setPhase("submitting");
    setSubmitting(true);
    try {
      const sessionId = getSessionId();
      const abVariant = getAbVariant();
      const result = await submitMutation.mutateAsync({
        sessionId,
        answers: finalAnswers,
        abVariant,
        email: userEmail,
      });
      setChronotype(result.chronotype);
      track("quiz_complete", { page: "quiz", value: { chronotype: result.chronotype, questions: finalAnswers.length } });
      navigateWithTransition(
        () => navigate(`/result?chronotype=${result.chronotype}`),
        {
          message: "Analyzing your sleep profile...",
          subMessage: `Calculating your ${result.chronotype} chronotype score`,
          delay: 1600,
        }
      );
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setPhase("core");
    }
  };

  const advanceQuiz = async (sel: number, currentIdx: number, currentAnswers: number[]) => {
    const newAnswers = [...currentAnswers, sel];
    setAnswers(newAnswers);
    track("quiz_answer", { page: "quiz", value: { question: currentIdx + 1, answer: sel } });

    // Show insight for core questions
    if (phase === "core" && CORE_QUESTIONS[currentIdx]?.insight?.[sel]) {
      setInsightText(CORE_QUESTIONS[currentIdx].insight![sel]);
      insightTimer.current = setTimeout(() => setInsightText(null), 1800);
    }

    if (phase === "core" && currentIdx >= CORE_QUESTIONS.length - 1) {
      // Core done → show analyzing animation → then email gate
      setPhase("analyzing");
    } else if (phase === "bonus" && questionIndex >= BONUS_QUESTIONS.length - 1) {
      // Bonus done → submit
      await submitQuiz(newAnswers, email || undefined);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  const handleSelect = (idx: number) => {
    if (submitting) return;
    setSelected(idx);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceQuiz(idx, current, answers);
    }, 350);
  };

   const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Capture lead immediately
      const sessionId = getSessionId();
      captureLead.mutate({ email, sessionId, chronotype: undefined, source: "quiz_result" });
      track("email_capture", { page: "quiz", value: { email } });
      // Mark email as captured so QuizResult hides the Free Cheat Sheet form
      sessionStorage.setItem("user_email", email);
    }
    // Show bonus questions option or submit directly
    setPhase("bonus");
    setCurrent(CORE_QUESTIONS.length);
    setSelected(null);
  };

  const handleSkipEmail = () => {
    // Skip email, go to bonus or submit
    setPhase("bonus");
    setCurrent(CORE_QUESTIONS.length);
    setSelected(null);
  };

  const handleSkipBonus = async () => {
    // Skip bonus questions, submit with core answers only
    await submitQuiz(answers, email || undefined);
  };

  const handleBack = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (phase === "email") {
      setPhase("core");
      setCurrent(CORE_QUESTIONS.length - 1);
      setSelected(answers[answers.length - 1] ?? null);
      setAnswers(a => a.slice(0, -1));
      return;
    }
    if (phase === "bonus" && questionIndex === 0) {
      setPhase("email");
      return;
    }
    if (current === 0) {
      navigate("/");
    } else {
      setCurrent(c => c - 1);
      setSelected(answers[current - 1] ?? null);
      setAnswers(a => a.slice(0, -1));
    }
  };

  // ── Analyzing Animation Screen (builds anticipation) ──────────────────────────────
  useEffect(() => {
    if (phase === "analyzing") {
      const timer = setTimeout(() => setPhase("email"), 3200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === "analyzing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="orb orb-gold w-72 h-72 opacity-10" style={{ top: "-5%", right: "5%" }} />
        <div className="orb orb-blue w-48 h-48 opacity-8" style={{ bottom: "10%", left: "-5%" }} />

        <div className="relative z-10 text-center space-y-6 max-w-sm mx-auto px-4">
          {/* Animated progress ring */}
          <div className="relative mx-auto w-24 h-24">
            <svg className="w-24 h-24 animate-spin" style={{ animationDuration: "3s" }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.78 0.18 65 / 0.15)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.78 0.18 65)" strokeWidth="6"
                strokeDasharray="264" strokeDashoffset="66" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Moon className="w-8 h-8" style={{ color: "oklch(0.82 0.16 65)" }} />
            </div>
          </div>

          {/* Animated steps */}
          <div className="space-y-3">
            <p className="text-sm font-semibold animate-pulse" style={{ color: "oklch(0.82 0.16 65)" }}>
              Analyzing your sleep biology...
            </p>
            <div className="space-y-2 text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>
              <p className="animate-in fade-in slide-in-from-bottom-1 duration-500" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
                ✓ Circadian rhythm pattern detected
              </p>
              <p className="animate-in fade-in slide-in-from-bottom-1 duration-500" style={{ animationDelay: "1.2s", animationFillMode: "both" }}>
                ✓ Matching with chronotype database...
              </p>
              <p className="animate-in fade-in slide-in-from-bottom-1 duration-500" style={{ animationDelay: "2.0s", animationFillMode: "both" }}>
                ✓ Personalizing your 7-night protocol
              </p>
            </div>
          </div>

          {/* Trust bar */}
          <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "oklch(0.15 0.02 255)" }}>
            <div className="h-full rounded-full transition-all ease-out" 
              style={{ 
                background: "linear-gradient(90deg, oklch(0.78 0.18 65), oklch(0.7 0.2 45))",
                width: "100%",
                animation: "grow-bar 3s ease-out forwards",
              }} />
          </div>
        </div>

        <style>{`
          @keyframes grow-bar {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ── Email Gate Screen ──────────────────────────────────────────────────────────
  if (phase === "email") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="orb orb-gold w-72 h-72 opacity-10" style={{ top: "-5%", right: "5%" }} />
        <div className="orb orb-blue w-48 h-48 opacity-8" style={{ bottom: "10%", left: "-5%" }} />

        <div className="relative z-10 container py-3 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm"
            style={{ color: "oklch(0.50 0.04 265)" }}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
            <span className="text-sm font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>
              Deep Sleep Reset
            </span>
          </div>
          <div className="w-16" />
        </div>

        <div className="relative z-10 flex-1 container py-8 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {/* Success indicator */}
          <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "oklch(0.45 0.15 145 / 0.15)", border: "1px solid oklch(0.55 0.15 145 / 0.3)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "oklch(0.7 0.2 145)" }} />
            <span className="text-xs font-medium" style={{ color: "oklch(0.7 0.2 145)" }}>
              Your Sleep Score is ready
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-3 leading-tight"
            style={{ color: "oklch(0.95 0.01 265)" }}>
            Where should we send<br />your results?
          </h2>

          <p className="text-sm text-center mb-6" style={{ color: "oklch(0.55 0.04 265)" }}>
            Get your personalized chronotype profile + a free 3 AM Rescue Protocol
          </p>

          <form onSubmit={handleEmailSubmit} className="w-full space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.50 0.04 265)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "oklch(0.12 0.02 255)",
                  border: "1px solid oklch(0.78 0.18 65 / 0.3)",
                  color: "oklch(0.95 0.01 265)",
                }}
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.7 0.2 45))",
                color: "oklch(0.1 0.01 265)",
                boxShadow: "0 4px 20px oklch(0.78 0.18 65 / 0.3)",
              }}
            >
              <span>See My Sleep Score</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <button
            onClick={handleSkipEmail}
            className="mt-4 text-xs underline underline-offset-2 opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: "oklch(0.55 0.04 265)" }}
          >
            Skip — show results without email
          </button>

          {/* Trust signals */}
          <div className="mt-8 flex items-center justify-center gap-4 text-xs" style={{ color: "oklch(0.35 0.04 265)" }}>
            <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> No spam ever</span>
            <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" /> Unsubscribe anytime</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Submitting Screen ──────────────────────────────────────────────────────
  if (phase === "submitting" || submitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "oklch(0.07 0.025 255)" }}>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
            style={{ background: "oklch(0.78 0.18 65 / 0.1)", color: "oklch(0.78 0.18 65)" }}>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Analyzing your sleep biology...</span>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
            Matching you with 1 of 4 chronotype profiles
          </p>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Subtle orbs */}
      <div className="orb orb-gold w-72 h-72 opacity-10" style={{ top: "-5%", right: "5%" }} />
      <div className="orb orb-blue w-48 h-48 opacity-8" style={{ bottom: "10%", left: "-5%" }} />

      {/* Header — compact */}
      <div className="relative z-10 container py-3 flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm"
          style={{ color: "oklch(0.50 0.04 265)" }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="text-sm font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>
            Deep Sleep Reset
          </span>
        </div>
        <button
          onClick={() => { track("cta_click", { page: "quiz", element: "skip_quiz" }); navigate("/order"); }}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full font-semibold"
          style={{
            color: "oklch(0.78 0.18 65)",
            background: "oklch(0.78 0.18 65 / 0.12)",
            border: "1px solid oklch(0.78 0.18 65 / 0.35)",
          }}
        >
          <Zap className="w-3 h-3" />
          Buy $4
        </button>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 container pb-1">
        <div className="progress-bar">
          <div
            className="progress-bar-fill transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
            {phase === "bonus" ? (
              <span>Bonus question {questionIndex + 1} of {BONUS_QUESTIONS.length}</span>
            ) : (
              <span>Question {current + 1} of {CORE_QUESTIONS.length}</span>
            )}
          </p>
          <p className="text-xs font-medium" style={{ color: "oklch(0.82 0.16 65)" }}>
            {phase === "bonus" ? "Personalizing..." : `${Math.round(progress)}% complete`}
          </p>
        </div>
      </div>

      {/* Question — centered */}
      <div className="relative z-10 flex-1 container py-6 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
        <div className="w-full">

          {/* ── Q1 Mystical Symbol Hook (pattern interrupt + identity priming) ── */}
          {current === 0 && phase === "core" && (
            <div className="flex flex-col items-center mb-5 animate-in fade-in slide-in-from-bottom-3 duration-700">
              {/* Pulsing dreamcatcher SVG */}
              <div className="relative w-28 h-28 mb-3">
                <style>{`
                  @keyframes pulse-ring { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.35;transform:scale(1.08)} }
                  @keyframes slow-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                  @keyframes slow-spin-rev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
                  @keyframes eye-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
                  @keyframes feather-sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
                `}</style>
                {/* Outer pulse rings */}
                <div className="absolute inset-0 rounded-full" style={{animation:"pulse-ring 3s ease-in-out infinite",background:"radial-gradient(circle,oklch(0.78 0.18 65/0.2) 0%,transparent 70%)"}} />
                <div className="absolute inset-2 rounded-full" style={{animation:"pulse-ring 3s ease-in-out infinite",animationDelay:"0.8s",background:"radial-gradient(circle,oklch(0.65 0.18 280/0.15) 0%,transparent 70%)"}} />
                <svg viewBox="0 0 120 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer hoop */}
                  <circle cx="60" cy="52" r="38" fill="none" stroke="oklch(0.78 0.18 65)" strokeWidth="1.5" opacity="0.7" style={{animation:"slow-spin 20s linear infinite",transformOrigin:"60px 52px"}} />
                  {/* Inner sacred web */}
                  <g style={{animation:"slow-spin-rev 30s linear infinite",transformOrigin:"60px 52px"}}>
                    {[0,45,90,135,180,225,270,315].map((angle,i) => {
                      const rad = (angle * Math.PI) / 180;
                      const x = 60 + 38 * Math.sin(rad);
                      const y = 52 - 38 * Math.cos(rad);
                      return <line key={i} x1="60" y1="52" x2={x} y2={y} stroke="oklch(0.78 0.18 65)" strokeWidth="0.6" opacity="0.3" />;
                    })}
                    {[12,22,32].map((r,i) => (
                      <circle key={i} cx="60" cy="52" r={r} fill="none" stroke="oklch(0.65 0.18 280)" strokeWidth="0.5" opacity={0.2 + i*0.1} strokeDasharray={i===1?"3 3":"none"} />
                    ))}
                  </g>
                  {/* Crescent moon */}
                  <path d="M60 30 A14 14 0 1 1 60 30.01" fill="none" stroke="oklch(0.82 0.16 65)" strokeWidth="0" />
                  <path d="M52 36 Q60 24 68 36 Q62 32 56 36 Z" fill="oklch(0.82 0.16 65)" opacity="0.8" />
                  {/* Central eye */}
                  <ellipse cx="60" cy="52" rx="7" ry="5" fill="oklch(0.07 0.025 255)" stroke="oklch(0.78 0.18 65)" strokeWidth="1" style={{animation:"eye-glow 2.5s ease-in-out infinite"}} />
                  <ellipse cx="60" cy="52" rx="3.5" ry="3.5" fill="oklch(0.65 0.18 280)" style={{animation:"eye-glow 2.5s ease-in-out infinite"}} />
                  <circle cx="60" cy="52" r="1.2" fill="oklch(0.95 0.01 265)" />
                  {/* Stars */}
                  {[[45,35],[75,35],[48,68],[72,68],[60,20]].map(([sx,sy],i) => (
                    <circle key={i} cx={sx} cy={sy} r="1.2" fill="oklch(0.82 0.16 65)" opacity="0.7" />
                  ))}
                  {/* Feathers */}
                  <g style={{animation:"feather-sway 4s ease-in-out infinite",transformOrigin:"52px 90px"}}>
                    <line x1="52" y1="90" x2="48" y2="112" stroke="oklch(0.78 0.18 65)" strokeWidth="1" opacity="0.6" />
                    {[93,97,101,105,109].map((fy,i) => (
                      <line key={i} x1={48+i*0.3} y1={fy} x2={48+i*0.3-4+i} y2={fy+2} stroke="oklch(0.65 0.18 280)" strokeWidth="0.8" opacity="0.5" />
                    ))}
                  </g>
                  <g style={{animation:"feather-sway 4s ease-in-out infinite",animationDelay:"0.5s",transformOrigin:"60px 90px"}}>
                    <line x1="60" y1="90" x2="60" y2="115" stroke="oklch(0.82 0.16 65)" strokeWidth="1.2" opacity="0.7" />
                    {[93,98,103,108,113].map((fy,i) => (
                      <line key={i} x1="60" y1={fy} x2={60-4+i} y2={fy+2} stroke="oklch(0.78 0.18 65)" strokeWidth="0.8" opacity="0.5" />
                    ))}
                    <circle cx="60" cy="116" r="1.5" fill="oklch(0.65 0.18 280)" opacity="0.8" />
                  </g>
                  <g style={{animation:"feather-sway 4s ease-in-out infinite",animationDelay:"1s",transformOrigin:"68px 90px"}}>
                    <line x1="68" y1="90" x2="72" y2="112" stroke="oklch(0.78 0.18 65)" strokeWidth="1" opacity="0.6" />
                    {[93,97,101,105,109].map((fy,i) => (
                      <line key={i} x1={72-i*0.3} y1={fy} x2={72-i*0.3+4-i} y2={fy+2} stroke="oklch(0.65 0.18 280)" strokeWidth="0.8" opacity="0.5" />
                    ))}
                  </g>
                  {/* Turquoise beads */}
                  {[[52,91],[60,91],[68,91]].map(([bx,by],i) => (
                    <circle key={i} cx={bx} cy={by} r="2" fill="oklch(0.65 0.25 195)" opacity="0.9" />
                  ))}
                </svg>
              </div>
              {/* Neuro hook: curiosity gap + identity priming */}
              <p className="text-xs text-center font-medium tracking-wider uppercase" style={{color:"oklch(0.65 0.18 280)",letterSpacing:"0.12em"}}>
                The dreamcatcher reveals your sleep spirit
              </p>
            </div>
          )}

          {/* Micro-copy */}
          <p className="text-xs font-medium mb-2 text-center italic"
            style={{ color: "oklch(0.55 0.12 65)" }}>
            {MICRO_COPY[current] ?? "Refining your profile..."}
          </p>

          {/* Question text */}
          <h2 className="font-display font-bold text-xl md:text-2xl mb-2 leading-snug text-center"
            style={{ color: "oklch(0.95 0.01 265)" }}>
            {question.text}
          </h2>

          {/* Subtext */}
          {question.subtext && (
            <p className="text-xs text-center mb-5" style={{ color: "oklch(0.45 0.04 265)" }}>
              {question.subtext}
            </p>
          )}

          {/* Insight flash */}
          {insightText && (
            <div className="mb-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "oklch(0.45 0.15 145 / 0.15)", color: "oklch(0.7 0.2 145)", border: "1px solid oklch(0.55 0.15 145 / 0.3)" }}>
                {insightText}
              </span>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={submitting}
                className="w-full text-left rounded-xl p-4 transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: selected === idx
                    ? "oklch(0.78 0.18 65 / 0.18)"
                    : "oklch(0.10 0.025 255)",
                  border: `1px solid ${selected === idx
                    ? "oklch(0.78 0.18 65 / 0.6)"
                    : "oklch(0.78 0.18 65 / 0.12)"}`,
                  color: "oklch(0.95 0.01 265)",
                  transform: selected === idx ? "scale(1.015)" : "scale(1)",
                  boxShadow: selected === idx ? "0 0 16px oklch(0.78 0.18 65 / 0.15)" : "none",
                }}
              >
                <span className="text-sm md:text-base">{option}</span>
              </button>
            ))}
          </div>

          {/* Skip bonus option */}
          {phase === "bonus" && (
            <button
              onClick={handleSkipBonus}
              className="mt-4 w-full text-center text-xs underline underline-offset-2 opacity-60 hover:opacity-90 transition-opacity py-2"
              style={{ color: "oklch(0.55 0.04 265)" }}
            >
              Skip — show my results now
            </button>
          )}

          {/* Tap hint */}
          {selected === null && !submitting && phase === "core" && (
            <p className="text-center text-xs mt-4" style={{ color: "oklch(0.40 0.04 265)" }}>
              Tap an answer — it auto-advances
            </p>
          )}
        </div>
      </div>

      {/* Footer — trust signals */}
      <div className="relative z-10 container pb-6">
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "oklch(0.35 0.04 265)" }}>
          <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
          <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" /> No spam</span>
          <span>{phase === "core" ? "30 seconds" : "Almost done"}</span>
        </div>
      </div>
    </div>
  );
}
