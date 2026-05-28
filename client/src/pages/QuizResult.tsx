import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Lock, Mail, Users, ShieldCheck, Zap } from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import CountdownTimer from "@/components/CountdownTimer";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import TrustBar from "@/components/TrustBar";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { trackQuizComplete, trackLead, trackViewContent } from "@/lib/conversionTracking";
import { useTransition } from "@/contexts/TransitionContext";
import { useCurrency } from "@/contexts/CurrencyContext";

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
    icon: "",
    color: "oklch(0.82 0.16 65)",
    title: "The Lion",
    description: "You're an early riser with peak mental energy in the morning. Lions are natural leaders who dominate the first half of the day — but crash hard by evening.",
    problems: ["Energy crash after 3pm", "Can't stay awake past 9pm socially", "Wake too early and can't fall back asleep"],
    solutions: ["Front-load your hardest work before noon", "Protect your 9pm wind-down ritual", "Use the Lion's 7-Night Deep Sleep Protocol"],
    worstMistake: "Staying up past 10pm 'just to finish one more thing' — this destroys your Lion sleep architecture.",
  },
  Bear: {
    icon: "",
    color: "oklch(0.65 0.18 180)",
    title: "The Bear",
    description: "You follow the solar cycle — the most common chronotype. Bears feel best with a standard schedule but often suffer when life forces them off their natural rhythm.",
    problems: ["Monday morning grogginess", "Afternoon energy dip (2–3pm)", "Inconsistent sleep on weekends"],
    solutions: ["Anchor your wake time 7 days a week", "Use the Bear's afternoon recovery protocol", "Follow the Bear's 7-Night Deep Sleep Protocol"],
    worstMistake: "Sleeping in on weekends. Bears suffer the most from 'social jet lag' — shifting your schedule by even 2 hours wrecks your whole week.",
  },
  Wolf: {
    icon: "",
    color: "oklch(0.65 0.18 290)",
    title: "The Wolf",
    description: "You're a night owl with peak creativity and energy in the evening. Wolves are often misunderstood as lazy — but your biology simply runs on a different clock.",
    problems: ["Can't fall asleep before midnight", "Mornings feel impossible", "Constant social jet lag from 9-to-5 world"],
    solutions: ["Shift your schedule 2 hours later where possible", "Use blue-light blocking after 8pm", "Follow the Wolf's 7-Night Deep Sleep Protocol"],
    worstMistake: "Trying to force yourself into a Lion schedule. Fighting your Wolf chronotype causes chronic sleep deprivation and kills your natural peak performance window.",
  },
  Dolphin: {
    icon: "",
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

  const [email, setEmail] = useState(() => sessionStorage.getItem("user_email") ?? "");
  const [emailSubmitted, setEmailSubmitted] = useState(() => !!sessionStorage.getItem("user_email"));
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewers] = useState(() => Math.floor(Math.random() * 40) + 120);
  const { track } = useTrackBehavior();
  const { formatPrice } = useCurrency();

  const leadMutation = trpc.leads.capture.useMutation();
  const abMutation = trpc.abTest.markConverted.useMutation();

  useEffect(() => {
    track("page_view", { page: "quiz_result", value: { chronotype } });
    // Save chronotype to sessionStorage for quiz-first guard in Order.tsx
    sessionStorage.setItem('quiz_chronotype', chronotype);
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
    setIsSubmitting(true);
    try {
      // Collect attribution data from URL + browser
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source") ?? sessionStorage.getItem("utm_source") ?? undefined;
      const utmMedium = urlParams.get("utm_medium") ?? sessionStorage.getItem("utm_medium") ?? undefined;
      const utmCampaign = urlParams.get("utm_campaign") ?? sessionStorage.getItem("utm_campaign") ?? undefined;
      const utmContent = urlParams.get("utm_content") ?? sessionStorage.getItem("utm_content") ?? undefined;
      const utmTerm = urlParams.get("utm_term") ?? sessionStorage.getItem("utm_term") ?? undefined;
      const referrer = document.referrer || sessionStorage.getItem("referrer") || undefined;
      const landingPage = sessionStorage.getItem("landing_page") ?? window.location.pathname;
      // Quiz answers from sessionStorage
      let quizAnswers: Record<string, string> | undefined;
      try { quizAnswers = JSON.parse(sessionStorage.getItem("quiz_answers") ?? "{}"); } catch { quizAnswers = undefined; }
      // Sleep issues derived from chronotype
      const sleepIssueMap: Record<string, string[]> = {
        Lion: ["early_waking", "evening_crash"],
        Bear: ["social_jet_lag", "monday_grogginess"],
        Wolf: ["sleep_onset", "morning_difficulty"],
        Dolphin: ["anxiety", "3am_waking", "racing_mind"],
      };
      const sleepIssues = sleepIssueMap[chronotype] ?? [];
      await leadMutation.mutateAsync({
        email,
        sessionId: getSessionId(),
        chronotype,
        source: "quiz_result",
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        referrer,
        landingPage,
        userAgent: navigator.userAgent,
        language: navigator.language.split("-")[0], // e.g. "cs" from "cs-CZ"
        browserLang: navigator.language,             // full e.g. "cs-CZ"
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // e.g. "Europe/Prague"
        quizAnswers,
        sleepIssues,
      });
      // Delay success state for smooth animation
      await new Promise(r => setTimeout(r, 600));
      sessionStorage.setItem("user_email", email);
      setEmailSubmitted(true);
      track("email_capture", { page: "quiz_result", value: { chronotype } });
      trackLead({ email });
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { navigateWithTransition } = useTransition();

  const handleGetProtocol = () => {
    track("cta_click", { page: "quiz_result", element: "get_protocol", value: { chronotype } });
    navigateWithTransition(
      () => navigate(`/order?chronotype=${chronotype}`),
      {
        message: `Preparing your ${chronotype} Protocol...`,
        subMessage: "Personalizing your 7-night sleep plan",
        delay: 1400,
      }
    );
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
          {/* NEURO: Identity reveal animation — dopamin spike na odhalení */}
          <div className="text-6xl mb-2 animate-float" style={{filter:"drop-shadow(0 0 16px currentColor)"}}>{data.icon}</div>
          {/* Tribal identity badge — "you belong to a rare group" */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-xs font-bold uppercase tracking-wider"
            style={{background:`${data.color}18`,border:`1px solid ${data.color}40`,color:data.color}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:data.color}} />
            Your Sleep Chronotype
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-1" style={{ color: data.color }}>
            You are a {data.title}
          </h1>
          {/* NEURO: Rarity framing — "only X% of people" — exclusivity trigger */}
          <p className="text-xs font-medium mb-3" style={{color:"oklch(0.55 0.04 265)"}}>
            {chronotype === "Dolphin" ? "Only 10% of people have this chronotype" :
             chronotype === "Lion" ? "Only 15% of people are natural Lions" :
             chronotype === "Wolf" ? "25% of people are Wolves — night is your power" :
             "50% of people share your Bear rhythm — but few optimize it"}
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: "oklch(0.70 0.04 265)" }}>
            {data.description}
          </p>

          {/* Live viewers — NEURO: social proof + FOMO */}
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
            What the {chronotype} Protocol Fixes
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
                disabled={isSubmitting}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none transition-opacity"
                style={{
                  background: "oklch(0.10 0.025 255)",
                  border: "1px solid oklch(0.78 0.18 65 / 0.2)",
                  color: "oklch(0.95 0.01 265)",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              />
              <button type="submit" disabled={isSubmitting}
                className="cta-gold rounded-lg px-5 py-2.5 text-sm font-bold flex-shrink-0 transition-all disabled:opacity-60 relative"
                style={{
                  minWidth: isSubmitting ? "140px" : "auto",
                }}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-transparent border-t-black border-r-black animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Free Sheet"
                )}
              </button>
            </form>
            {emailError && <p className="text-xs mt-2" style={{ color: "oklch(0.65 0.22 25)" }}>{emailError}</p>}
          </div>
        ) : (
          <div className="rounded-2xl p-6 mb-8 text-center animate-in fade-in duration-500"
            style={{ background: "oklch(0.55 0.18 145 / 0.15)", border: "2px solid oklch(0.55 0.18 145 / 0.4)" }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "oklch(0.55 0.18 145)" }}>
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <p className="text-base font-bold" style={{ color: "oklch(0.70 0.18 145)" }}>
                Success! Check your inbox.
              </p>
            </div>
            <p className="text-xs" style={{ color: "oklch(0.55 0.18 145)" }}>
              We've sent your free {chronotype} sleep cheat sheet to <span className="font-semibold">{email}</span>. It should arrive in 1-2 minutes.
            </p>
            <p className="text-xs mt-3 pt-3" style={{ color: "oklch(0.40 0.04 265)", borderTop: "1px solid oklch(0.55 0.18 145 / 0.2)" }}>
              Educational wellness guide based on evidence-informed CBT-I principles. Not medical advice. Results vary.
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

          {/* NEURO: Anchoring — show full value before price reveal */}
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

          {/* NEURO: Price anchor + loss aversion — "less than a coffee" */}
          <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
            <span className="text-sm line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$75</span>
            <span className="font-black text-4xl" style={{ color: "oklch(0.82 0.16 65)" }}>$4</span>
            <span className="badge-popular">93% OFF</span>
          </div>
          <p className="text-xs mb-5 relative z-10" style={{color:"oklch(0.45 0.04 265)"}}>
            Less than a coffee — for sleep that changes everything
          </p>

          {/* INLINE CHECKOUT — skip Order page entirely for max conversion */}
          <CheckoutButton
            productId="main"
            sessionId={getSessionId()}
            email={emailSubmitted ? email : undefined}
            chronotype={chronotype}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-lg"
            variant="primary"
          >
            <Lock className="w-5 h-5" />
            <span>Get My {chronotype} Protocol — {formatPrice(4)}</span>
            <ArrowRight className="w-5 h-5" />
          </CheckoutButton>
          {/* Secondary: see full order page */}
          <button
            onClick={handleGetProtocol}
            className="w-full mt-2 text-xs underline underline-offset-2 opacity-50 hover:opacity-80 transition-opacity relative z-10"
            style={{ color: "oklch(0.55 0.04 265)" }}
          >
            See full order details →
          </button>
          {/* NEURO: Loss aversion micro-copy */}
          <p className="text-xs mt-2 relative z-10 font-medium" style={{ color: "oklch(0.65 0.18 25)" }}>
            ⚠️ This offer expires when the timer hits zero
          </p>
          <p className="text-xs mt-1 relative z-10" style={{ color: "oklch(0.40 0.04 265)" }}>
            Secure checkout · Instant PDF access · 30-day money-back guarantee
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
        {/* Compliance disclaimer */}
        <p className="text-xs text-center mt-4 max-w-md mx-auto" style={{ color: "oklch(0.35 0.04 265)" }}>
          This is an educational wellness guide based on evidence-informed CBT-I principles. Not medical advice. Results vary. Always consult a qualified healthcare professional for medical concerns.
        </p>
      </div>

      {/* Sticky mobile CTA */}
      <StickyMobileCTA
        label={`Get My ${chronotype} Protocol`}
        price={formatPrice(4)}
        onClick={handleGetProtocol}
      />

      {/* FOMO */}
      <LiveSalesNotification />
    </div>
  );
}
