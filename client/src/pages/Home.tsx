import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Moon, Star, Check, X, ChevronDown, Shield, Lock, Zap } from "lucide-react";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import FloatingSocialProofBar from "@/components/FloatingSocialProofBar";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SupportButton from "@/components/SupportButton";
import FAQSection from "@/components/FAQSection";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { useBehaviorTracker } from "@/hooks/useBehaviorTracker";
import { useI18n } from "@/contexts/I18nContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trpc } from "@/lib/trpc";
import { HeroAnimated } from "@/components/HeroAnimated";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { setMetaTags } from "@/lib/metaTags";
import { useTransition } from "@/contexts/TransitionContext";
import NewsletterSection from "@/components/NewsletterSection";

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
    text: "I was skeptical at first, but after just 10 days following the Deep Sleep Reset protocol, I'm finally waking up feeling genuinely rested. No more lying awake for hours — I fall asleep within 20 minutes now.",
    name: "Sofia R.",
    location: "Los Angeles, CA",
    stars: 5,
    photo: "/manus-storage/customer_review_woman_46805796.png",
  },
  {
    text: "I've had insomnia for 10 years. Night 4 of this program, I fell asleep in 15 minutes. I cried the next morning.",
    name: "Sarah M.",
    location: "Austin, TX",
    stars: 5,
  },
  {
    text: "The Night 4 breathing technique alone was worth 100x the price. Three months later, I haven't touched melatonin.",
    name: "James K.",
    location: "London, UK",
    stars: 5,
  },
  {
    text: "Night shift nurse. The circadian anchor on Night 5 was the missing piece. I now sleep 7 hours after a night shift.",
    name: "Maria L.",
    location: "Toronto, CA",
    stars: 5,
  },
];

const NIGHT_JOURNEY = [
  { night: 1, title: "The Sleep Audit", desc: "Identify the hidden patterns sabotaging your sleep." },
  { night: 2, title: "The Stimulus Reset", desc: "Retrain your brain to associate bed with sleep — not anxiety." },
  { night: 3, title: "The Circadian Realignment", desc: "Sync your internal clock with your chronotype." },
  { night: 4, title: "The Breathing Protocol", desc: "Designed to help you fall asleep faster using evidence-based techniques." },
  { night: 5, title: "The Anchor Technique", desc: "Lock in your new sleep pattern — works even for shift workers." },
  { night: 6, title: "The Cognitive Reframe", desc: "Eliminate the racing thoughts that keep you up." },
  { night: 7, title: "The Lifetime Protocol", desc: "Your personalized sleep system — built for life." },
];

const VALUE_STACK = [
  { item: "7-Night Deep Sleep Reset Program (7 interactive modules)", value: "$47" },
  { item: "CBT-I Technique Library (12 core techniques)", value: "$27" },
  { item: "5 Guided Audio Sessions (body scan, breath work)", value: "$19" },
  { item: "Sleep Environment Audit Checklist", value: "$9" },
  { item: "BONUS: Printable Sleep Journal + Tracker", value: "$17" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { track } = useTrackBehavior();
  useBehaviorTracker("home");
  const { t } = useI18n();
  const { getGeoPrice } = useCurrency();
  const tracked = useRef(false);
  const [purchaseCount] = useState(() => Math.floor(Math.random() * 4) + 7);
  const mainPrice = getGeoPrice(4);
  const entryPrice = getGeoPrice(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  useBehaviorTracking();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const sessionId = getSessionId();
    track("page_view", { page: "home" });

    setMetaTags({
      title: "Deep Sleep Reset — Sleep Better in 7 Nights | $4",
      description: "A CBT-I inspired 7-night sleep protocol for people who wake up tired or wide awake at 3 AM. Instant access. No pills. Just $4.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/og-variant-a-sleep-deprived-hye2KT2i6vNEAo2u9i22xr.webp",
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    document.title = "Deep Sleep Reset — Sleep Better in 7 Nights | $4";
    let kwMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
    if (!kwMeta) {
      kwMeta = document.createElement("meta");
      kwMeta.name = "keywords";
      document.head.appendChild(kwMeta);
    }
    kwMeta.content = "sleep better, sleep protocol, CBT-I, chronotype quiz, deep sleep, sleep reset, 7 night protocol, sleep improvement, natural sleep";
    return () => { document.title = "Deep Sleep Reset"; };
  }, []);

  const { navigateWithTransition } = useTransition();

  const handleStartQuiz = () => {
    track("cta_click", { page: "home", element: "start_quiz" });
    navigateWithTransition(
      () => navigate("/quiz"),
      { message: "Loading your sleep quiz...", subMessage: "30 seconds to your chronotype", delay: 700 }
    );
  };

  const handleBuyNow = () => {
    track("cta_click", { page: "home", element: "buy_now" });
    // Quiz-first flow: always go through quiz before order for personalization
    navigateWithTransition(
      () => navigate("/quiz"),
      { message: "Starting your sleep quiz...", subMessage: "Find your chronotype in 30 seconds", delay: 700 }
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-32 md:pb-14" style={{ background: "oklch(0.07 0.025 255)" }}>

      {/* ═══════════════ ANIMATED HERO — Sleep Dashboard + Brain Waves + Before/After ═══════════════ */}
      <HeroAnimated onChatOpen={() => setIsChatOpen(true)} navigate={navigate} />

      {/* ═══════════════ STICKY TOP BAR ═══════════════ */}
      <div className="sticky top-0 z-30 sticky-top-bar">
        <div className="container py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.60 0.04 265)" }}>
            <span style={{ color: "oklch(0.82 0.16 65)" }}>Don't close</span>
            <span className="hidden sm:inline">— Your sleep transformation starts here</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>${mainPrice}</span>
            <div className="w-px h-3" style={{ background: "oklch(0.78 0.18 65 / 0.3)" }} />
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-2.5 h-2.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SOCIAL PROOF — INSTANT CREDIBILITY ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-10">
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card rounded-xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.75 0.04 265)" }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-2">
                  {(t as any).photo ? (
                    <img src={(t as any).photo} alt={t.name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      style={{ border: "1.5px solid oklch(0.78 0.18 65 / 0.3)" }} />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "oklch(0.78 0.18 65 / 0.12)", color: "oklch(0.82 0.16 65)" }}>
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "oklch(0.90 0.01 265)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-6 font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>
            Rated 4.9/5 by early access users
          </p>
        </section>
      </AnimatedSection>

      {/* ═══════════════ PROBLEM AGITATION — NEUROPSYCHOLOGICAL PAIN AMPLIFICATION ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-14">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.1)" }}>
              <img src={CLOCK_IMG} alt="3:17 AM — wide awake again" className="w-full h-auto" loading="lazy" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: "oklch(0.82 0.16 65)" }}>
                Sound Familiar?
              </p>
              <h2 className="font-display font-bold text-2xl md:text-3xl mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
                It's 3:17 AM. <span className="text-gradient-gold-italic">Again.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "oklch(0.60 0.04 265)" }}>
                You've tried everything. Melatonin. Magnesium. Sleep apps. Expensive mattresses. None of it addresses <em>why</em> you can't sleep.
              </p>
              <div className="space-y-2">
                {["Melatonin & supplements", "Sleep apps & white noise", "Expensive mattresses", "\"Just relax\" advice", "Sleeping pills"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <X className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "oklch(0.65 0.22 25)" }} />
                    <span className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ SOLUTION — CBT-I AUTHORITY ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-14 text-center">
          <div className="section-divider mb-10" />
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: "oklch(0.82 0.16 65)" }}>
            The Science-Backed Solution
          </p>
          <h2 className="font-display font-bold text-2xl md:text-4xl mb-4 max-w-3xl mx-auto" style={{ color: "oklch(0.95 0.01 265)" }}>
            The 7-Night Deep Sleep Reset
          </h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: "oklch(0.60 0.04 265)" }}>
            Based on <strong style={{ color: "oklch(0.82 0.16 65)" }}>CBT-I</strong> — the #1 treatment recommended by the American Academy of Sleep Medicine. 80% clinical success rate.
          </p>
        </section>
      </AnimatedSection>

      {/* ═══════════════ 7-NIGHT JOURNEY — COMPACT ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-10">
          <div className="max-w-2xl mx-auto space-y-3">
            {NIGHT_JOURNEY.map((night) => (
              <div key={night.night} className="night-card rounded-xl p-4 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
                  style={{ background: "oklch(0.78 0.18 65 / 0.12)", color: "oklch(0.82 0.16 65)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
                  {night.night}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5" style={{ color: "oklch(0.95 0.01 265)" }}>
                    Night {night.night}: {night.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.04 265)" }}>
                    {night.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ VALUE STACK — HORMOZI GRAND SLAM ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-14">
          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 md:p-8">
            <h3 className="font-display font-bold text-lg md:text-xl text-center mb-6" style={{ color: "oklch(0.95 0.01 265)" }}>
              Everything You Get Today:
            </h3>

            {VALUE_STACK.map((item, i) => (
              <div key={i} className="value-stack-item">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.72 0.19 145)" }} />
                  <span className="text-sm" style={{ color: "oklch(0.80 0.04 265)" }}>{item.item}</span>
                </div>
                <span className="text-xs font-medium flex-shrink-0 ml-3" style={{ color: "oklch(0.50 0.04 265)" }}>
                  ({item.value})
                </span>
              </div>
            ))}

            <div className="mt-6 pt-4" style={{ borderTop: "1px solid oklch(0.78 0.18 65 / 0.15)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>Total Value:</span>
                <span className="text-xs line-through" style={{ color: "oklch(0.50 0.04 265)" }}>$119</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>Your Price:</span>
                <span className="font-display font-bold text-2xl text-gradient-gold">Just ${mainPrice}</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={handleBuyNow}
                className="cta-gold cta-shimmer rounded-2xl px-8 py-4 text-base inline-flex items-center gap-2 animate-pulse-glow"
              >
                <span>{t.hero_cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs mt-2" style={{ color: "oklch(0.40 0.04 265)" }}>
                256-bit SSL · Instant Access · 30-Day Guarantee
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ GUARANTEE — RISK REVERSAL ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-14">
          <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <img src={SHIELD_IMG} alt="30-Day Money Back Guarantee" className="w-24 h-24 md:w-32 md:h-32 object-contain flex-shrink-0" loading="lazy" />
            <div>
              <h2 className="font-display font-bold text-xl md:text-2xl mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
                Sleep Better or <span style={{ color: "oklch(0.82 0.16 65)" }}>Pay Nothing</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.60 0.04 265)" }}>
                Go through the 7-night protocol. If you don't sleep noticeably better within 30 days, email me and I'll refund your ${mainPrice} immediately. No questions. No forms.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ QUIZ CTA — CURIOSITY GAP ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-12">
          <div className="max-w-2xl mx-auto rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, oklch(0.20 0.08 280), oklch(0.15 0.06 260))" }}>
            <div className="text-xs font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: "oklch(0.65 0.04 265)" }}>LION &middot; BEAR &middot; WOLF &middot; DOLPHIN</div>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
              Why Can't <em>You</em> Sleep? <span className="text-gradient-gold">Your Chronotype Knows.</span>
            </h2>
            <p className="text-sm mb-2 max-w-md mx-auto" style={{ color: "oklch(0.65 0.04 265)" }}>
              5 questions. 60 seconds. Discover your sleep type and get a personalized protocol.
            </p>
            <p className="text-xs mb-6 max-w-md mx-auto font-semibold" style={{ color: "oklch(0.78 0.18 65)" }}>
              ⏰ 47 people already discovered their sleep type today
            </p>
            <button
              onClick={handleStartQuiz}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all hover:scale-105 active:scale-95 animate-pulse-glow shadow-lg"
              style={{ background: "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.7 0.2 45))", color: "oklch(0.1 0.01 265)", boxShadow: "0 4px 24px oklch(0.78 0.18 65 / 0.4)" }}
            >
              🎯 Find My Chronotype
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs mt-3" style={{ color: "oklch(0.45 0.04 265)" }}>
              Free · Instant results · No email required · Takes 60 seconds
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══════════════ FAQ ═══════════════ */}
      <NewsletterSection />
      <FAQSection />

      {/* ═══════════════ FINAL CTA — HORMOZI CLOSE ═══════════════ */}
      <AnimatedSection>
        <section className="relative z-10 container py-14 text-center">
          <div className="section-divider mb-10" />
          <h2 className="font-display font-bold text-2xl md:text-4xl mb-4 max-w-2xl mx-auto" style={{ color: "oklch(0.95 0.01 265)" }}>
            One Coffee. Seven Nights.{" "}
            <span className="text-gradient-gold-italic">A Different Life.</span>
          </h2>
          <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "oklch(0.55 0.04 265)" }}>
            More energy. Sharper thinking. Better mood. The version of yourself that shows up when you're not running on empty. <strong style={{ color: "oklch(0.82 0.16 65)" }}>All for ${mainPrice}.</strong>
          </p>

          <button
            onClick={handleBuyNow}
            className="cta-gold cta-shimmer rounded-2xl px-10 py-5 text-lg inline-flex items-center gap-3 animate-pulse-glow"
          >
            <span>GET MY SLEEP PROTOCOL — ${mainPrice}</span>
          </button>

          <p className="text-xs italic mt-6 max-w-md mx-auto" style={{ color: "oklch(0.45 0.04 265)" }}>
            <strong style={{ color: "oklch(0.55 0.04 265)" }}>P.S.</strong>{" "}
            You've spent more than ${mainPrice} on a coffee that made you more anxious. This is ${mainPrice} to permanently change how you sleep.
          </p>
        </section>
      </AnimatedSection>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative z-10 container py-6 text-center">
        <div className="section-divider mb-4" />
        <div className="flex items-center justify-center gap-2 mb-2">
          <Moon className="w-4 h-4" style={{ color: "oklch(0.40 0.04 265)" }} />
          <span className="text-xs font-semibold" style={{ color: "oklch(0.40 0.04 265)" }}>Deep Sleep Reset</span>
          <span className="text-xs" style={{ color: "oklch(0.30 0.04 265)" }}>·</span>
          <a
            href="https://www.deepsleep.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline transition-colors"
            style={{ color: "oklch(0.55 0.10 65)" }}
          >
            DeepSleep.my
          </a>
        </div>
        <p className="text-xs" style={{ color: "oklch(0.30 0.04 265)" }}>
          © 2026 Deep Sleep Reset. All rights reserved.
        </p>
        <p className="text-xs mt-2 max-w-lg mx-auto" style={{ color: "oklch(0.28 0.04 265)" }}>
          This is an educational wellness guide based on evidence-informed CBT-I principles. Not medical advice. Results vary. Always consult a qualified healthcare professional for medical concerns.
        </p>
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          <a href="/privacy" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_privacy}</a>
          <a href="/terms" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_terms}</a>
          <a href="/refund" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>Refund Policy</a>
          <a href="/affiliates" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_affiliates}</a>
          <a href="/contact" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_contact}</a>
          <a href="/feedback" className="text-xs hover:underline" style={{ color: "oklch(0.35 0.04 265)" }}>{t.footer_feedback}</a>
        </div>
      </footer>

      {/* ═══════════════ FLOATING ELEMENTS ═══════════════ */}
      <LiveSalesNotification />
      <FloatingSocialProofBar />
      <ExitIntentPopup />
      <SupportButton />
      <StickyMobileCTA label="Find My Chronotype" onClick={handleStartQuiz} />
    </div>
  );
}
