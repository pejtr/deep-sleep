import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Moon, ArrowLeft, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId, getAbVariant, setChronotype, useTrackBehavior } from "@/hooks/useSession";

interface Question {
  id: number;
  text: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "If you had no alarm and no obligations, what time would you naturally wake up?",
    options: [
      "🌅 Before 6:30am — I'm up with the sun",
      "☀️ 6:30–8:30am — A reasonable morning",
      "🌤️ 8:30–10:30am — I need my sleep",
      "🌙 After 10:30am — I'm a true night owl",
    ],
  },
  {
    id: 2,
    text: "When do you feel most mentally sharp and productive?",
    options: [
      "🌄 Early morning (5–9am)",
      "🌞 Mid-morning to early afternoon (9am–1pm)",
      "🌆 Late afternoon to evening (5–9pm)",
      "🌃 Late night (9pm–2am)",
    ],
  },
  {
    id: 3,
    text: "If you could choose your ideal bedtime, when would you go to sleep?",
    options: [
      "🌙 Before 9pm — I'm done early",
      "🌙 9–11pm — Standard evening",
      "🌙 11pm–1am — Night owl hours",
      "🌙 After 1am — I come alive at night",
    ],
  },
  {
    id: 4,
    text: "How would you describe your sleep quality on most nights?",
    options: [
      "😴 Deep and restful — I sleep like a log",
      "😐 Decent — I wake occasionally but fall back asleep",
      "😰 Light and fragmented — I wake often",
      "😩 Terrible — I lie awake for hours",
    ],
  },
  {
    id: 5,
    text: "On weekends or days off, what happens to your sleep schedule?",
    options: [
      "⏰ Same as weekdays — my body clock is consistent",
      "😴 I sleep 1–2 hours more — I'm catching up",
      "🌅 I sleep 3–4 hours later — I shift significantly",
      "🔄 Completely unpredictable — it varies wildly",
    ],
  },
  {
    id: 6,
    text: "How do you feel about exercise and physical activity?",
    options: [
      "💪 I love morning workouts — they energize my whole day",
      "🏃 I prefer midday or early afternoon exercise",
      "🌆 I feel strongest exercising in the evening",
      "🧘 I struggle to find energy for exercise at any time",
    ],
  },
  {
    id: 7,
    text: "What happens when you eat a big meal late at night?",
    options: [
      "😣 I feel terrible and can't sleep — I avoid it",
      "😐 It doesn't bother me much, I sleep okay",
      "😋 I actually enjoy late dinners and sleep fine after",
      "🤔 My appetite is unpredictable — sometimes I'm starving at midnight",
    ],
  },
  {
    id: 8,
    text: "How do you handle stress and anxiety before bed?",
    options: [
      "😌 I rarely feel stressed at bedtime — I process things early",
      "📝 I sometimes worry but can usually let it go",
      "🎵 I need distraction (music, TV, phone) to wind down",
      "😰 My mind races — I can't stop thinking about tomorrow",
    ],
  },
];

export default function Quiz() {
  const [, navigate] = useLocation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { track } = useTrackBehavior();

  const submitMutation = trpc.quiz.submit.useMutation();

  useEffect(() => {
    track("page_view", { page: "quiz" });
  }, []);

  const progress = ((current) / QUESTIONS.length) * 100;
  const question = QUESTIONS[current];

  const handleSelect = (idx: number) => {
    setSelected(idx);
  };

  const handleNext = async () => {
    if (selected === null) return;

    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    track("quiz_answer", { page: "quiz", value: { question: current + 1, answer: selected } });

    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      // Submit quiz — only send first 5 answers to server (matches schema)
      setSubmitting(true);
      try {
        const sessionId = getSessionId();
        const abVariant = getAbVariant();
        const result = await submitMutation.mutateAsync({
          sessionId,
          answers: newAnswers.slice(0, 5),
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

  const handleBack = () => {
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
      {/* Orbs */}
      <div className="orb orb-gold w-72 h-72 opacity-15" style={{ top: "-5%", right: "5%" }} />
      <div className="orb orb-blue w-64 h-64 opacity-10" style={{ bottom: "10%", left: "-5%" }} />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-between">
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
        <span className="text-sm" style={{ color: "oklch(0.50 0.04 265)" }}>
          {current + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 container pb-2">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="relative z-10 flex-1 container py-10 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="w-full">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span className="badge-popular">Question {current + 1}</span>
          </div>

          {/* Question text */}
          <h2 className="font-display font-bold text-xl md:text-2xl mb-8 leading-snug"
            style={{ color: "oklch(0.95 0.01 265)" }}>
            {question.text}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-8">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  background: selected === idx
                    ? "oklch(0.78 0.18 65 / 0.15)"
                    : "oklch(0.10 0.025 255)",
                  border: `1px solid ${selected === idx
                    ? "oklch(0.78 0.18 65 / 0.5)"
                    : "oklch(0.78 0.18 65 / 0.1)"}`,
                  color: "oklch(0.95 0.01 265)",
                  transform: selected === idx ? "scale(1.01)" : "scale(1)",
                }}
              >
                <span className="text-sm md:text-base">{option}</span>
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={selected === null || submitting}
            className="w-full cta-gold cta-shimmer rounded-xl py-4 flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span>Analyzing your chronotype...</span>
            ) : current === QUESTIONS.length - 1 ? (
              <>
                <span>Reveal My Chronotype</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer note */}
      <div className="relative z-10 container pb-8 text-center">
        <p className="text-xs" style={{ color: "oklch(0.35 0.04 265)" }}>
          🔒 Your answers are private and used only to personalize your protocol.
        </p>
      </div>
    </div>
  );
}
