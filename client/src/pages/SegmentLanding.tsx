import { useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { ChevronRight, Shield, Clock, Zap } from "lucide-react";
import { useTrackBehavior } from "@/hooks/useSession";

const SEGMENTS: Record<string, {
  headline: string;
  subheadline: string;
  hook: string;
  pain: string;
  solution: string;
  cta: string;
  metaTitle: string;
}> = {
  "/3am-wake-up": {
    headline: "Stop Waking Up at 3 AM",
    subheadline: "A 7-night behavioral reset for people who wake in the middle of the night and can't fall back asleep.",
    hook: "Waking up at 3 AM is not random. Your nervous system may be trained to expect alertness at night.",
    pain: "You've tried melatonin, sleep apps, white noise, magnesium. Nothing sticks because none of them address the root pattern.",
    solution: "The 7-Night Deep Sleep Reset retrains your body's sleep-wake cycle using CBT-I inspired techniques — no pills, no devices.",
    cta: "Take the Free 3 AM Sleep Pattern Quiz",
    metaTitle: "Stop Waking Up at 3 AM — 7-Night Sleep Reset",
  },
  "/racing-thoughts": {
    headline: "Quiet Your Racing Mind at Night",
    subheadline: "For people who are exhausted but can't stop thinking when they get into bed.",
    hook: "Your brain doesn't need to be silenced. It needs a shutdown ritual.",
    pain: "You lie down exhausted, but your mind replays conversations, plans tomorrow, worries about things you can't control. The harder you try to sleep, the more awake you feel.",
    solution: "The 7-Night Deep Sleep Reset gives you a structured wind-down sequence that signals your nervous system it's safe to let go.",
    cta: "Take the Free Sleep Score Quiz",
    metaTitle: "Racing Thoughts at Night — 7-Night Sleep Reset",
  },
  "/melatonin-alternative": {
    headline: "A Non-Pill Sleep Reset",
    subheadline: "For people who want better sleep without another supplement, prescription, or sleep aid.",
    hook: "A behavioral sleep reset for people who want a non-pill routine that actually trains your body to sleep.",
    pain: "Melatonin helped at first, now it doesn't. You've tried everything from magnesium to CBD to prescription sleep aids. None of them fix the underlying pattern.",
    solution: "The 7-Night Deep Sleep Reset uses CBT-I inspired behavioral techniques to retrain your natural sleep drive — without any pills or supplements.",
    cta: "Start the Free Sleep Assessment",
    metaTitle: "Melatonin Alternative — 7-Night Behavioral Sleep Reset",
  },
  "/tired-but-wired": {
    headline: "Tired but Can't Sleep?",
    subheadline: "For high performers, founders, and busy professionals who are exhausted but wired at bedtime.",
    hook: "You're not lazy. Your body is tired, but your nervous system is still in work mode.",
    pain: "You work hard all day, collapse into bed exhausted, but your body won't switch off. Your mind races, your heart rate stays elevated, and sleep feels impossible despite being bone-tired.",
    solution: "The 7-Night Deep Sleep Reset gives you a structured evening downshift sequence that transitions your nervous system from 'go mode' to 'rest mode'.",
    cta: "Take the Free Chronotype Quiz",
    metaTitle: "Tired But Wired — 7-Night Sleep Reset for High Performers",
  },
  "/sleep-reset": {
    headline: "Reset Your Sleep in 7 Nights",
    subheadline: "A structured behavioral protocol to rebuild your natural sleep rhythm — without pills, devices, or guesswork.",
    hook: "Your sleep isn't broken. It's been disrupted. And disrupted patterns can be reset.",
    pain: "You've tried sleep hygiene tips, apps, supplements, and routines. Nothing sticks because they treat symptoms, not the underlying sleep drive.",
    solution: "The 7-Night Deep Sleep Reset uses CBT-I inspired stimulus control and sleep restriction to rebuild your body's natural sleep pressure from scratch.",
    cta: "Start Your Free Sleep Reset Quiz",
    metaTitle: "Reset Your Sleep in 7 Nights — CBT-I Inspired Protocol",
  },
  "/no-pills": {
    headline: "Better Sleep Without Pills",
    subheadline: "A behavioral sleep reset for people who want a sustainable, drug-free sleep routine.",
    hook: "Pills mask the symptom. This protocol fixes the pattern.",
    pain: "Melatonin worked for a week. Magnesium helped a bit. Prescription sleep aids left you groggy. You're tired of depending on something external to fall asleep.",
    solution: "The 7-Night Deep Sleep Reset retrains your body's natural sleep drive using behavioral science — no supplements, no devices, no dependency.",
    cta: "Take the Free Drug-Free Sleep Quiz",
    metaTitle: "Better Sleep Without Pills — 7-Night Behavioral Reset",
  },
  "/productivity-sleep": {
    headline: "Sleep Is Your #1 Productivity System",
    subheadline: "High performers who fix their sleep report 40% better focus, faster decisions, and more energy by noon.",
    hook: "You optimize your calendar, your diet, your workouts. But you're still sleeping like a student.",
    pain: "You wake up unrefreshed, reach for coffee immediately, and hit a wall at 2 PM. Your output suffers, your mood suffers, and no productivity hack fixes what bad sleep breaks.",
    solution: "The 7-Night Deep Sleep Reset is a performance protocol — not a wellness trend. It rebuilds deep sleep architecture so your brain consolidates learning, clears waste, and wakes sharp.",
    cta: "Take the Free Sleep Performance Quiz",
    metaTitle: "Sleep as a Productivity System — 7-Night Deep Sleep Reset",
  },
  "/cbti-inspired": {
    headline: "The CBT-I Inspired Sleep Reset",
    subheadline: "CBT-I is the gold standard for insomnia. This 7-night protocol adapts its core techniques into a practical daily system.",
    hook: "CBT-I has a 70-80% success rate for chronic insomnia. This protocol brings those techniques home.",
    pain: "Therapy waitlists are months long. Sleep clinics are expensive. Most CBT-I apps are confusing or incomplete. You want the real techniques without the barriers.",
    solution: "The 7-Night Deep Sleep Reset distills the core CBT-I principles — stimulus control, sleep restriction, cognitive restructuring — into a clear, step-by-step daily guide.",
    cta: "Start the Free CBT-I Sleep Assessment",
    metaTitle: "CBT-I Inspired Sleep Reset — 7-Night Protocol",
  },
};

export default function SegmentLanding() {
  const [, navigate] = useLocation();
  const { track } = useTrackBehavior();
  const tracked = useRef(false);

  // Get current path
  const [matchedWakeUp] = useRoute("/3am-wake-up");
  const [matchedRacing] = useRoute("/racing-thoughts");
  const [matchedMelatonin] = useRoute("/melatonin-alternative");
  const [matchedTired] = useRoute("/tired-but-wired");
  const [matchedSleepReset] = useRoute("/sleep-reset");
  const [matchedNoPills] = useRoute("/no-pills");
  const [matchedProductivity] = useRoute("/productivity-sleep");
  const [matchedCbti] = useRoute("/cbti-inspired");

  const path = matchedWakeUp ? "/3am-wake-up"
    : matchedRacing ? "/racing-thoughts"
    : matchedMelatonin ? "/melatonin-alternative"
    : matchedTired ? "/tired-but-wired"
    : matchedSleepReset ? "/sleep-reset"
    : matchedNoPills ? "/no-pills"
    : matchedProductivity ? "/productivity-sleep"
    : matchedCbti ? "/cbti-inspired"
    : "/3am-wake-up";
  const segment = SEGMENTS[path] || SEGMENTS["/3am-wake-up"]!;

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    document.title = segment.metaTitle;
    track("page_view", { page: `segment_${path.replace("/", "")}` });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-15" style={{ background: "oklch(0.55 0.18 265)" }} />

        <div className="relative z-10 space-y-6">
          <h1 className="font-display font-black text-4xl md:text-6xl leading-tight" style={{ color: "oklch(0.95 0.01 265)" }}>
            {segment.headline}
          </h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: "oklch(0.70 0.04 265)" }}>
            {segment.subheadline}
          </p>
          <button
            onClick={() => navigate("/squeeze")}
            className="cta-gold cta-shimmer rounded-xl px-8 py-4 text-lg font-bold cursor-pointer inline-flex items-center gap-2"
          >
            {segment.cta} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Hook */}
      <section className="px-4 py-12 max-w-2xl mx-auto">
        <blockquote className="text-xl md:text-2xl italic leading-relaxed text-center" style={{ color: "oklch(0.82 0.16 65)" }}>
          "{segment.hook}"
        </blockquote>
      </section>

      {/* Pain → Solution */}
      <section className="px-4 py-12 max-w-2xl mx-auto space-y-8">
        <div className="p-6 rounded-xl" style={{ background: "oklch(0.12 0.02 265)", border: "1px solid oklch(0.20 0.03 265)" }}>
          <h3 className="font-semibold mb-3" style={{ color: "oklch(0.90 0.01 265)" }}>The Problem:</h3>
          <p className="leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>{segment.pain}</p>
        </div>
        <div className="p-6 rounded-xl" style={{ background: "oklch(0.14 0.04 265)", border: "1px solid oklch(0.82 0.16 65 / 0.2)" }}>
          <h3 className="font-semibold mb-3" style={{ color: "oklch(0.82 0.16 65)" }}>The Solution:</h3>
          <p className="leading-relaxed" style={{ color: "oklch(0.75 0.03 265)" }}>{segment.solution}</p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-4 py-12 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Shield, label: "30-Day Refund" },
            { icon: Clock, label: "Instant Access" },
            { icon: Zap, label: "No Pills Needed" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg" style={{ background: "oklch(0.12 0.02 265)" }}>
              <Icon className="w-6 h-6" style={{ color: "oklch(0.82 0.16 65)" }} />
              <span className="text-xs font-medium" style={{ color: "oklch(0.70 0.04 265)" }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 text-center">
        <button
          onClick={() => navigate("/squeeze")}
          className="cta-gold cta-shimmer rounded-xl px-8 py-4 text-lg font-bold cursor-pointer inline-flex items-center gap-2"
        >
          {segment.cta} <ChevronRight className="w-5 h-5" />
        </button>
        <p className="mt-4 text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>
          Free quiz · No credit card required · Results in 2 minutes
        </p>
      </section>

      {/* Disclaimer */}
      <footer className="px-4 py-8 text-center max-w-xl mx-auto">
        <p className="text-xs leading-relaxed" style={{ color: "oklch(0.35 0.04 265)" }}>
          Disclaimer: This program is for educational purposes only and does not constitute medical advice. 
          It is not a substitute for professional medical diagnosis or treatment. If you have a sleep disorder, 
          please consult a healthcare provider. Individual results may vary.
        </p>
      </footer>
    </div>
  );
}
