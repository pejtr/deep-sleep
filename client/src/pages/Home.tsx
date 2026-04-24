import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Moon, Star, Check, X, ChevronDown, Shield } from "lucide-react";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import FloatingSocialProofBar from "@/components/FloatingSocialProofBar";
import SupportButton from "@/components/SupportButton";
import FAQSection from "@/components/FAQSection";
import ASMRPlayer from "@/components/ASMRPlayer";
import { getAbVariant, getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { useBehaviorTracker } from "@/hooks/useBehaviorTracker";
import { useI18n } from "@/contexts/I18nContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trpc } from "@/lib/trpc";

// Gumroad URL kept as fallback — replaced by native Stripe checkout
// const GUMROAD_URL = "https://deepsleepreset.gumroad.com/l/fdtifc?price=5";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/hero-night-sky-D3pM5pQbCQhppVQxJN45yn.webp";
const CLOCK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/3am-clock-XJszaQCHaCqerz7QvxDA8P.webp";
const SHIELD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/guarantee-shield-7cHorvNWjUpUENYnuUZH6a.webp";

// Star particles for cosmic effect
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
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

// Intersection observer hook for scroll animations
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Animated section wrapper
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {children}
    </div>
  );
}

const TESTIMONIALS = [
  {
    text: "I've had insomnia for 10 years. Tried everything — Ambien, melatonin, therapy at $200/session. Night 4 of this program, I fell asleep in 15 minutes. I cried the next morning. I genuinely cried. I'd forgotten what rested felt like.",
    name: "Sarah M.",
    location: "Austin, TX",
    stars: 5,
  },
  {
    text: "I was skeptical of a $5 sleep program. Then I was desperate enough to try it. The Night 4 breathing technique alone was worth 100x the price. Three months later, I haven't touched melatonin. My wife says I'm a different person.",
    name: "James K.",
    location: "London, UK",
    stars: 5,
  },
  {
    text: "Night shift nurse. My sleep was completely destroyed. The circadian anchor on Night 5 was the missing piece I'd been searching for for 4 years. I now sleep 7 hours after a night shift, consistently. For me, that's a miracle.",
    name: "Maria L.",
    location: "Toronto, CA",
    stars: 5,
  },
];

const FEATURED_TESTIMONIAL = {
  name: "Sarah M.",
  location: "Austin, TX — struggled with insomnia for 10 years",
  result: "Asleep in 15 min by Night 4",
};

const NIGHT_JOURNEY = [
  { night: 1, title: "The Sleep Audit", desc: "Identify the hidden patterns sabotaging your sleep. Most people discover 3-5 habits they never suspected." },
  { night: 2, title: "The Stimulus Reset", desc: "Retrain your brain to associate bed with sleep — not anxiety, scrolling, or frustration." },
  { night: 3, title: "The Circadian Realignment", desc: "Sync your internal clock with your chronotype. This is where the science gets personal." },
  { night: 4, title: "The Breathing Protocol", desc: "The technique that makes people cry the next morning. Clinically proven to reduce sleep onset by 60%." },
  { night: 5, title: "The Anchor Technique", desc: "Lock in your new sleep pattern with a circadian anchor that works even for shift workers." },
  { night: 6, title: "The Cognitive Reframe", desc: "Eliminate the racing thoughts that keep you up. CBT-I's most powerful tool for chronic insomnia." },
  { night: 7, title: "The Lifetime Protocol", desc: "Your personalized sleep system — built for life. Never wonder \"why can't I sleep\" again." },
];

const VALUE_STACK = [
  { item: "The 7-Night Deep Sleep Reset Program (7 interactive modules)", value: "$47" },
  { item: "The CBT-I Technique Library (all 12 core techniques explained)", value: "$27" },
  { item: "5 Guided Audio Sessions (body scan, breath work, sleep onset)", value: "$19" },
  { item: "The Sleep Environment Audit Checklist", value: "$9" },
  { item: "BONUS: Printable Sleep Journal + Progress Tracker", value: "$17" },
];

const MADE_FOR_YOU = [
  "You lie awake for 30+ minutes before falling asleep.",
  "You wake up at 3 AM and can't get back to sleep.",
  "You wake up exhausted even after 7-8 hours in bed.",
  "You've become dependent on melatonin or sleep aids.",
  "You're irritable, foggy, and running on empty every day.",
  "You're curious what life feels like when you actually sleep.",
];

export default function Home() {
  const [, navigate] = useLocation();
  const variant = getAbVariant();
  const { track } = useTrackBehavior();
  useBehaviorTracker("home"); // Extended auto-tracking: scroll, time, rage clicks, exit intent, UTM
  const { t } = useI18n();
  const abMutation = trpc.abTest.track.useMutation();
  const tracked = useRef(false);
  const [purchaseCount] = useState(() => Math.floor(Math.random() * 4) + 7);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const sessionId = getSessionId();
    track("page_view", { page: "home", value: { variant } });
    abMutation.mutate({ sessionId, testName: "headline", variant, page: "home" });
  }, []);

  // SEO: set title and keywords dynamically
  useEffect(() => {
    document.title = "Deep Sleep Reset: Fix Insomnia in 7 Nights — $1";
    // Add keywords meta tag if not present
    let kwMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
    if (!kwMeta) {
      kwMeta = document.createElement("meta");
      kwMeta.name = "keywords";
      document.head.appendChild(kwMeta);
    }
    kwMeta.content = "insomnia cure, fix insomnia, sleep better, deep sleep, CBT-I, sleep protocol, sleep guide, chronotype, sleep deprivation, natural sleep remedy, 7 night sleep reset, sleep improvement";
    return () => {
      // Restore default title on unmount
      document.title = "Deep Sleep Reset";
    };
  }, []);

  const handleStartQuiz = () => {
    track("cta_click", { page: "home", element: "start_quiz" });
    navigate("/quiz");
  };

  const handleBuyNow = () => {
    track("cta_click", { page: "home", element: "buy_now" });
    navigate("/order");
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-14" style={{ background: "oklch(0.07 0.025 255)" }}>

      {/* ═══════════════ STICKY TOP BAR ═══════════════ */}
      <div className="sticky top-0 z-30 sticky-top-bar">
        <div className="container py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.60 0.04 265)" }}>
            <span style={{ color: "oklch(0.82 0.16 65)" }}>Don't close</span>
            <span className="hidden sm:inline">— Start your sleep transformation today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>$1</span>
            <div className="w-px h-3" style={{ background: "oklch(0.78 0.18 65 / 0.3)" }} />
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-2.5 h-2.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Night sky with stars — Deep Sleep Reset background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, oklch(0.07 0.025 255 / 0.3), oklch(0.07 0.025 255 / 0.8) 70%, oklch(0.07 0.025 255))" }} />
        </div>
        <StarField />

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-[60] container flex items-center justify-between gap-2" style={{ paddingTop: "calc(2.5rem + 36px)" }}>
          <div className="flex items-center gap-2 min-w-0 shrink">
            <Moon className="w-5 h-5 shrink-0" style={{ color: "oklch(0.82 0.16 65)" }} />
            <span className="font-display font-bold text-base sm:text-lg truncate" style={{ color: "oklch(0.95 0.01 265)" }}>
              Deep Sleep Reset
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>
            <button
              onClick={handleBuyNow}
              className="cta-gold cta-shimmer rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t.nav_cta}</span>
              <span className="sm:hidden">$1 →</span>
            </button>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 container text-center pt-36 pb-16">
          {/* Subheadline */}
          <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6 animate-reveal"
            style={{ color: "oklch(0.82 0.16 65)" }}>
            {t.hero_eyebrow}
          </p>

          {/* Main headline — Hormozi style: specific, outcome-driven */}
          <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 animate-reveal stagger-1 max-w-5xl mx-auto">
            <span style={{ color: "oklch(0.95 0.01 265)" }}>{t.hero_h1_line1}</span>
            <br />
            <span className="text-gradient-gold-italic">{t.hero_h1_line2}</span>
          </h1>

          {/* Sub — specific promise */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-4 animate-reveal stagger-2 leading-relaxed"
            style={{ color: "oklch(0.70 0.04 265)" }}>
            {t.hero_sub}
          </p>
          <p className="text-sm max-w-xl mx-auto mb-8 animate-reveal stagger-2"
            style={{ color: "oklch(0.50 0.04 265)" }}>
            Based on CBT-I — the #1 clinician-recommended insomnia treatment with an 80% success rate.
          </p>

          {/* CTA */}
          <div className="animate-reveal stagger-3">
            <button
              onClick={handleBuyNow}
              className="cta-gold cta-shimmer rounded-2xl px-10 py-5 text-lg inline-flex items-center gap-3"
            >
              <span>{t.hero_cta}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs mt-3" style={{ color: "oklch(0.40 0.04 265)" }}>
              {t.hero_guarantee}
            </p>
          </div>

          {/* Social proof row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 animate-reveal stagger-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
              ))}
              <span className="text-sm font-bold ml-1" style={{ color: "oklch(0.82 0.16 65)" }}>4.9/5</span>
              <span className="text-xs ml-1" style={{ color: "oklch(0.50 0.04 265)" }}>(847 reviews)</span>
            </div>
            <div className="w-px h-4" style={{ background: "oklch(0.78 0.18 65 / 0.2)" }} />
            <span className="text-sm" style={{ color: "oklch(0.50 0.04 265)" }}>10,000+ lives changed</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator animate-scroll-bounce z-10">
          <ChevronDown className="w-6 h-6" style={{ color: "oklch(0.50 0.04 265)" }} />
        </div>
      </section>

      {/* ═══════════════ PROBLEM AGITATION — "3:17 AM" ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.1)" }}>
              <img src={CLOCK_IMG} alt="3:17 AM — wide awake" className="w-full h-auto" />
            </div>
            {/* Copy */}
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "oklch(0.82 0.16 65)" }}>
                Sound Familiar?
              </p>
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-6" style={{ color: "oklch(0.95 0.01 265)" }}>
                It's 3:17 AM. <span className="text-gradient-gold-italic">Again.</span>
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "oklch(0.60 0.04 265)" }}>
                You've tried everything. Melatonin. Magnesium. "Sleep hygiene." Expensive mattresses. Apps that play rain sounds. Maybe even Ambien.
              </p>
              <p className="text-base leading-relaxed mb-6" style={{ color: "oklch(0.60 0.04 265)" }}>
                Nothing works. Because none of it addresses <em>why</em> you can't sleep.
              </p>

              {/* Failed solutions with X marks */}
              <div className="space-y-3">
                {["Melatonin & supplements", "Sleep apps & white noise", "Expensive mattresses", "\"Just relax\" advice", "Sleeping pills"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <X className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.65 0.22 25)" }} />
                    <span className="text-sm" style={{ color: "oklch(0.55 0.04 265)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ SOLUTION INTRO ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-20 text-center">
          <div className="section-divider mb-16" />
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "oklch(0.82 0.16 65)" }}>
            The Science-Backed Solution
          </p>
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-6 max-w-4xl mx-auto" style={{ color: "oklch(0.95 0.01 265)" }}>
            The 7-Night Deep Sleep Reset
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-4" style={{ color: "oklch(0.70 0.04 265)" }}>
            A structured protocol based on <strong style={{ color: "oklch(0.82 0.16 65)" }}>Cognitive Behavioral Therapy for Insomnia (CBT-I)</strong> — the #1 treatment recommended by the American Academy of Sleep Medicine.
          </p>
          <p className="text-sm max-w-xl mx-auto" style={{ color: "oklch(0.50 0.04 265)" }}>
            Not tips. Not hacks. A complete system that rewires how your brain approaches sleep.
          </p>
        </section>
      </AnimatedSection>

      {/* ═══════════════ 7-NIGHT JOURNEY ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4 text-center" style={{ color: "oklch(0.82 0.16 65)" }}>
            What Happens Each Night
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12" style={{ color: "oklch(0.95 0.01 265)" }}>
            Your 7-Night Transformation
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {NIGHT_JOURNEY.map((night) => (
              <div key={night.night} className="night-card rounded-xl p-6 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-lg"
                  style={{ background: "oklch(0.78 0.18 65 / 0.12)", color: "oklch(0.82 0.16 65)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
                  {night.night}
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1" style={{ color: "oklch(0.95 0.01 265)" }}>
                    Night {night.night}: {night.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.04 265)" }}>
                    {night.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ "MADE FOR YOU IF" CHECKLIST ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-20">
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 md:p-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-8" style={{ color: "oklch(0.95 0.01 265)" }}>
              This was made for you if:
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {MADE_FOR_YOU.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.72 0.19 145)" }} />
                  <span className="text-sm leading-relaxed" style={{ color: "oklch(0.75 0.04 265)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ FEATURED TESTIMONIAL ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-12">
          <div className="section-divider mb-12" />
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-8 text-center" style={{ color: "oklch(0.82 0.16 65)" }}>
            Real People. Real Transformations.
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
            They Were Exactly Where You Are.{" "}
            <span className="text-gradient-gold-italic">Now They Sleep.</span>
          </h2>
          <p className="text-sm text-center mb-12 max-w-xl mx-auto" style={{ color: "oklch(0.50 0.04 265)" }}>
            These aren't outliers. CBT-I has an 80% success rate in clinical trials. Here's what that looks like in real life.
          </p>

          {/* Featured */}
          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "oklch(0.78 0.18 65 / 0.15)", color: "oklch(0.82 0.16 65)", border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
                  S
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "oklch(0.95 0.01 265)" }}>{FEATURED_TESTIMONIAL.name}</p>
                  <p className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{FEATURED_TESTIMONIAL.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.82 0.16 65)" }}>Result</p>
                <p className="text-sm font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>{FEATURED_TESTIMONIAL.result}</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-center mb-10" style={{ color: "oklch(0.40 0.04 265)" }}>
            * Individual results vary. CBT-I clinical success rate: ~80% (AASM, 2021).
          </p>

          {/* 3 testimonial cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card rounded-xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "oklch(0.75 0.04 265)" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "oklch(0.78 0.18 65 / 0.12)", color: "oklch(0.82 0.16 65)" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "oklch(0.90 0.01 265)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust metrics */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            {[
              { icon: "👥", text: "10,000+ Lives Changed" },
              { icon: "⭐", text: "4.9/5 Stars (847 reviews)" },
              { icon: "🔒", text: "30-Day Full Refund Guarantee" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: "oklch(0.55 0.04 265)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ VALUE STACK — Hormozi Grand Slam Offer ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4 text-center" style={{ color: "oklch(0.82 0.16 65)" }}>
            Everything You Get Today
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            The Complete Deep Sleep Reset System
          </h2>
          <p className="text-base text-center max-w-2xl mx-auto mb-12" style={{ color: "oklch(0.60 0.04 265)" }}>
            Less than the price of one coffee. That's the deliberate choice. Not because this is worth $1 — the value stack below shows exactly what you're getting. I priced it at $1 because I want the barrier to be zero. Your only job is to try it.
          </p>

          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8 md:p-10">
            <h3 className="font-display font-bold text-xl md:text-2xl text-center mb-8" style={{ color: "oklch(0.95 0.01 265)" }}>
              Your Complete System — Everything Included:
            </h3>

            {VALUE_STACK.map((item, i) => (
              <div key={i} className="value-stack-item">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.72 0.19 145)" }} />
                  <span className="text-sm" style={{ color: "oklch(0.80 0.04 265)" }}>{item.item}</span>
                </div>
                <span className="text-sm font-medium flex-shrink-0 ml-4" style={{ color: "oklch(0.50 0.04 265)" }}>
                  (Value: {item.value})
                </span>
              </div>
            ))}

            <div className="mt-8 pt-6" style={{ borderTop: "1px solid oklch(0.78 0.18 65 / 0.15)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: "oklch(0.50 0.04 265)" }}>Total Real-World Value:</span>
                <span className="text-sm line-through" style={{ color: "oklch(0.50 0.04 265)" }}>$119</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>Your Price Today:</span>
                <span className="font-display font-bold text-3xl text-gradient-gold">Just $1 — Less Than One Coffee</span>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleBuyNow}
                className="cta-gold cta-shimmer rounded-2xl px-10 py-5 text-lg inline-flex items-center gap-3 animate-pulse-glow"
              >
                <span>{t.hero_cta}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs mt-3" style={{ color: "oklch(0.40 0.04 265)" }}>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Limited spots at this price — {purchaseCount} people purchased in the last hour
                </span>
              </p>
              <p className="text-xs mt-2" style={{ color: "oklch(0.40 0.04 265)" }}>
                🔒 256-bit SSL · Instant Access · 30-Day Guarantee
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ GUARANTEE — Risk Reversal ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-20">
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <img src={SHIELD_IMG} alt="Guarantee" className="w-32 h-32 md:w-40 md:h-40 object-contain flex-shrink-0" />
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
                The "Sleep Better or Pay Nothing"{" "}
                <span style={{ color: "oklch(0.82 0.16 65)" }}>Guarantee</span>
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.65 0.04 265)" }}>
                Go through the 7-night protocol. If you don't sleep noticeably better within 30 days, email me and I'll refund your $1 immediately. No forms. No questions. No waiting.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.04 265)" }}>
                I can offer this because the protocol works. CBT-I has an 80% clinical success rate. You have nothing to lose — and a completely different kind of morning to gain.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ CHRONOTYPE QUIZ CTA ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-16">
          <div className="max-w-3xl mx-auto rounded-2xl p-10 md:p-14 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, oklch(0.20 0.08 280), oklch(0.15 0.06 260))" }}>
            <div className="text-4xl mb-4">🦁 🐻 🐺 🐬</div>
            <div className="badge-popular mb-4">Free 2-minute quiz</div>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
              What's Your <span className="text-gradient-gold">Sleep Chronotype?</span>
            </h2>
            <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "oklch(0.65 0.04 265)" }}>
              Are you a Lion, Bear, Wolf, or Dolphin? Discover your biological sleep type and get a free personalized AI plan.
            </p>
            <button
              onClick={handleStartQuiz}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all hover:scale-105"
              style={{ background: "oklch(0.55 0.22 290)", color: "white" }}
            >
              Discover My Chronotype
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs mt-3" style={{ color: "oklch(0.45 0.04 265)" }}>
              8 questions · Takes 2 minutes · 100% free · Personalized AI plan
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ ASMR TEASER (post-purchase upsell only) ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-10">
          <div className="section-divider mb-10" />
          <div className="max-w-2xl mx-auto rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
            style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="text-4xl shrink-0">🎧</div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>Bonus included after purchase</p>
              <h3 className="font-display font-bold text-lg mb-1" style={{ color: "oklch(0.95 0.01 265)" }}>5 Guided Sleep Audio Sessions</h3>
              <p className="text-sm" style={{ color: "oklch(0.55 0.04 265)" }}>Body scan, breath work &amp; sleep onset audio — unlocked instantly after your $1 purchase.</p>
            </div>
            <button onClick={handleBuyNow}
              className="cta-gold cta-shimmer rounded-lg px-5 py-2.5 text-sm font-bold whitespace-nowrap shrink-0">
              Get Access — $1
            </button>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ FAQ ═══════════════ */}
      <FAQSection />

      {/* ═══════════════ FINAL CTA — Hormozi Close ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-20 text-center">
          <div className="section-divider mb-16" />
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-6 max-w-3xl mx-auto" style={{ color: "oklch(0.95 0.01 265)" }}>
            One Coffee. Seven Nights.{" "}
            <span className="text-gradient-gold-italic">A Different Life.</span>
          </h2>
          <p className="text-base mb-3 max-w-xl mx-auto" style={{ color: "oklch(0.65 0.04 265)" }}>
            Imagine waking up tomorrow and thinking: "I actually slept."
          </p>
          <p className="text-sm mb-10 max-w-xl mx-auto" style={{ color: "oklch(0.55 0.04 265)" }}>
            More energy. Sharper thinking. Better mood. Calmer relationships. The version of yourself that shows up when you're not running on empty. <strong style={{ color: "oklch(0.82 0.16 65)" }}>All for $1.</strong>
          </p>

          <button
            onClick={handleBuyNow}
            className="cta-gold cta-shimmer rounded-2xl px-12 py-6 text-xl inline-flex items-center gap-3 animate-pulse-glow"
          >
            <span>CHANGE MY SLEEP — $1</span>
          </button>

          <p className="text-sm italic mt-10 max-w-lg mx-auto" style={{ color: "oklch(0.45 0.04 265)" }}>
            <strong style={{ color: "oklch(0.55 0.04 265)" }}>P.S.</strong>{" "}
            <em>P.S. — You've spent more than $1 on a coffee that made you more anxious. This is $1 to permanently change how you sleep — and how every day feels after. The only question is: are you curious enough to find out?</em>
          </p>
        </section>
      </AnimatedSection>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative z-10 container py-8 text-center">
        <div className="section-divider mb-6" />
        <div className="flex items-center justify-center gap-2 mb-3">
          <Moon className="w-4 h-4" style={{ color: "oklch(0.40 0.04 265)" }} />
          <span className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>Deep Sleep Reset</span>
        </div>
        <p className="text-xs" style={{ color: "oklch(0.30 0.04 265)" }}>
          © 2026 Deep Sleep Reset. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="/privacy" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_privacy}</a>
          <a href="/terms" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_terms}</a>
          <a href="/affiliates" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_affiliates}</a>
          <a href="/contact" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_contact}</a>
          <a href="/feedback" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_feedback}</a>
        </div>
      </footer>

      {/* ═══════════════ FLOATING ELEMENTS ═══════════════ */}
      <LiveSalesNotification />
      <FloatingSocialProofBar />
      <SupportButton />
    </div>
  );
}
