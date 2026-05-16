import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Moon, ArrowLeft, Zap, Shield, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId, getAbVariant, setChronotype, useTrackBehavior } from "@/hooks/useSession";
import { setMetaTags } from "@/lib/metaTags";

interface Question {
  id: number;
  text: string;
  options: string[];
}

// ── 5 questions — aligned with backend validation (.length(5)) ──────────────
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "If you had no alarm, what time would you naturally wake up?",
    options: [
      "🌅 Before 6:30am — I'm up with the sun",
      "☀️ 6:30–8:30am — A reasonable morning",
      "🌤️ 8:30–10:30am — I need my sleep",
      "🌙 After 10:30am — I'm a true night owl",
    ],
  },
  {
    id: 2,
    text: "When do you feel most mentally sharp?",
    options: [
      "🌄 Early morning (5–9am)",
      "🌞 Mid-morning to early afternoon (9am–1pm)",
      "🌆 Late afternoon to evening (5–9pm)",
      "🌃 Late night (9pm–2am)",
    ],
  },
  {
    id: 3,
    text: "What's your ideal bedtime?",
    options: [
      "🌙 Before 9pm",
      "🌙 9–11pm",
      "🌙 11pm–1am",
      "🌙 After 1am",
    ],
  },
  {
    id: 4,
    text: "How would you describe your sleep quality?",
    options: [
      "😴 Deep and restful — I sleep like a log",
      "😐 Decent — I wake occasionally",
      "😰 Light and fragmented — I wake often",
      "😩 Terrible — I lie awake for hours",
    ],
  },
  {
    id: 5,
    text: "How do you handle stress before bed?",
    options: [
      "😌 I rarely feel stressed at bedtime",
      "📝 I sometimes worry but can let it go",
      "🎵 I need distraction to wind down",
      "😰 My mind races — I can't stop thinking",
    ],
  },
];

// Neuropsychological micro-copy — builds commitment + urgency per question
const MICRO_COPY = [
  "Your body already knows the answer...",
  "This reveals your hidden energy pattern.",
  "Most insomniacs get this wrong.",
  "Be honest — this is the key question.",
  "Last one. Your protocol depends on this.",
];

export default function Quiz() {
  const [, navigate] = useLocation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { track } = useTrackBehavior();
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitMutation = trpc.quiz.submit.useMutation();

  useEffect(() => {
    setMetaTags({
      title: "60-Second Sleep Quiz — Find Your Chronotype | Deep Sleep Reset",
      description: "Discover your sleep chronotype (Lion, Bear, Wolf, or Dolphin) and get a personalized 7-night sleep protocol. Free, instant results.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/hero-night-sky-D3pM5pQbCQhppVQxJN45yn.webp",
      url: window.location.href,
    });
    track("page_view", { page: "quiz" });
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const progress = ((current) / QUESTIONS.length) * 100;
  const question = QUESTIONS[current];

  const advanceQuiz = async (sel: number, currentIdx: number, currentAnswers: number[]) => {
    const newAnswers = [...currentAnswers, sel];
    setAnswers(newAnswers);
    track("quiz_answer", { page: "quiz", value: { question: currentIdx + 1, answer: sel } });

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setSubmitting(true);
      try {
        const sessionId = getSessionId();
        const abVariant = getAbVariant();
        const result = await submitMutation.mutateAsync({
          sessionId,
          answers: newAnswers,
          abVariant,
        });
        setChronotype(result.chronotype);
        track("quiz_complete", { page: "quiz", value: { chronotype: result.chronotype } });
        navigate(`/result?chronotype=${result.chronotype}`);
      } catch (err) {
        console.error(err);
        setSubmitting(false);
      }
    }
  };

  const handleSelect = (idx: number) => {
    if (submitting) return;
    setSelected(idx);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceQuiz(idx, current, answers);
    }, 300);
  };

  const handleBack = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (current === 0) {
      navigate("/");
    } else {
      setCurrent(c => c - 1);
      setSelected(answers[current - 1] ?? null);
      setAnswers(a => a.slice(0, -1));
    }
  };

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
          Buy $5
        </button>
      </div>

      {/* Progress bar — prominent */}
      <div className="relative z-10 container pb-1">
        <div className="progress-bar">
          <div
            className="progress-bar-fill transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
            Question {current + 1} of {QUESTIONS.length}
          </p>
          <p className="text-xs font-medium" style={{ color: "oklch(0.82 0.16 65)" }}>
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>

      {/* Question — centered, max impact */}
      <div className="relative z-10 flex-1 container py-6 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
        <div className="w-full">
          {/* Micro-copy — neuropsychological nudge */}
          <p className="text-xs font-medium mb-3 text-center italic"
            style={{ color: "oklch(0.55 0.12 65)" }}>
            {MICRO_COPY[current]}
          </p>

          {/* Question text */}
          <h2 className="font-display font-bold text-xl md:text-2xl mb-5 leading-snug text-center"
            style={{ color: "oklch(0.95 0.01 265)" }}>
            {question.text}
          </h2>

          {/* Options — tap to auto-advance */}
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

          {/* Tap hint */}
          {selected === null && !submitting && (
            <p className="text-center text-xs mt-4" style={{ color: "oklch(0.40 0.04 265)" }}>
              Tap an answer — it auto-advances
            </p>
          )}

          {/* Submitting state — builds anticipation */}
          {submitting && (
            <div className="mt-6 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "oklch(0.78 0.18 65 / 0.1)", color: "oklch(0.78 0.18 65)" }}>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Analyzing your chronotype...</span>
              </div>
              <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
                Matching you with 1 of 4 sleep profiles...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer — trust signals */}
      <div className="relative z-10 container pb-6">
        <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "oklch(0.35 0.04 265)" }}>
          <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
          <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3" /> No spam</span>
          <span>60 seconds</span>
        </div>
      </div>
    </div>
  );
}
