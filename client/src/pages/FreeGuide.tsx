/**
 * /free-guide — Lead Magnet Landing Page
 * Nedvěd funnel: bulvární titulky (SOK, PŘEKVAPENÍ, STRACH, ZÁVIST)
 * Cíl: email capture → přesměrování na /special-offer (UJN)
 */
import { useState } from "react";
import { BookOpen, ChevronRight, Shield, Zap, Star, Check, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/hooks/useSession";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";

const HACKS = [
  {
    number: "01",
    title: "The 12-Minute Pre-Sleep Ritual",
    teaser: "Drops cortisol by 47% — backed by Stanford sleep lab research",
    preview: "Most people do this completely wrong. The sequence matters more than the duration.",
  },
  {
    number: "02",
    title: "Your Phone Is Sabotaging Your Sleep",
    teaser: "It's not the blue light. It's something far more insidious — and the fix takes 3 minutes",
    preview: "Neuroscientists discovered this in 2023. Your sleep app is making it worse.",
  },
  {
    number: "03",
    title: "The Chronotype Trick",
    teaser: "Adds 90 minutes of deep sleep per night without changing your schedule",
    preview: "Your body has a built-in sleep superpower. 94% of people never activate it.",
  },
  {
    number: "04",
    title: "Fall Asleep in Under 8 Minutes",
    teaser: "The military technique used by Navy SEALs in combat zones",
    preview: "Works even when you're anxious, stressed, or your mind won't stop racing.",
  },
  {
    number: "05",
    title: "The Temperature Secret",
    teaser: "Why your bedroom temperature is destroying your sleep quality",
    preview: "One 2°C adjustment can double your deep sleep. Most people get this backwards.",
  },
  {
    number: "06",
    title: "The Caffeine Cutoff Calculation",
    teaser: "Your last coffee should be at THIS specific time (not 2pm)",
    preview: "Based on your chronotype. Most advice is wrong for 60% of people.",
  },
  {
    number: "07",
    title: "The 90-Minute Sleep Cycle Alarm",
    teaser: "Wake up refreshed every morning — even after only 6 hours",
    preview: "Olympic athletes use this. It's not about hours — it's about cycles.",
  },
];

const TESTIMONIALS = [
  { name: "Sarah M.", location: "New York", text: "I was skeptical. Night 3 I slept 7.5 hours straight for the first time in 2 years.", stars: 5 },
  { name: "James K.", location: "London", text: "Hack #4 alone was worth it. I fall asleep in 6 minutes now. Used to take 45.", stars: 5 },
  { name: "Anna S.", location: "Stockholm", text: "The chronotype section explained everything. I was fighting my own biology.", stars: 5 },
];

export default function FreeGuide() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { t } = useI18n();

  const leadMutation = trpc.leads.capture.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await leadMutation.mutateAsync({
        email,
        sessionId: getSessionId(),
        source: "free_guide",
        referrer: document.referrer || undefined,
        landingPage: "/free-guide",
        language: navigator.language,
        browserLang: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      localStorage.setItem("lead_magnet_captured", "1");
      // Redirect to UJN
      navigate("/special-offer?source=free_guide&email=" + encodeURIComponent(email));
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.06 0.025 255)" }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.18 65 / 0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-6"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.20 280 / 0.05) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10">
        {/* ── HERO ── */}
        <section className="pt-16 pb-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Promo photo brand visual */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: "3px solid oklch(0.78 0.18 65 / 0.6)", boxShadow: "0 0 32px oklch(0.78 0.18 65 / 0.25)" }}>
                  <img src="/manus-storage/promo-sleep-model_3a2de508.webp" alt="Sleep Guide" className="w-full h-full object-cover object-top" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "oklch(0.65 0.18 145)", border: "2px solid oklch(0.06 0.025 255)" }}>
                  <span className="text-xs font-bold" style={{ color: "oklch(0.06 0.025 255)" }}>✓</span>
                </div>
              </div>
            </div>
            {/* Shock badge — Nedvěd: PŘEKVAPENÍ */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ background: "oklch(0.78 0.18 65 / 0.12)", border: "1px solid oklch(0.78 0.18 65 / 0.35)", color: "oklch(0.82 0.16 65)" }}
            >
              <Zap className="w-3 h-3" />
              FREE — No Credit Card Required
            </div>

            {/* Bulvární headline — SOK + STRACH */}
            <h1
              className="font-display font-black text-4xl md:text-5xl leading-tight mb-4"
              style={{ color: "oklch(0.95 0.01 265)" }}
            >
              The Sleep Secret<br />
              <span style={{ color: "oklch(0.82 0.16 65)" }}>Big Pharma Doesn't Want You to Know</span>
            </h1>

            {/* Subheadline — ZÁVIST */}
            <p className="text-lg md:text-xl mb-2" style={{ color: "oklch(0.70 0.04 265)" }}>
              7 science-backed hacks that Olympic athletes, Navy SEALs, and top CEOs use to sleep deeply every night.
            </p>
            <p className="text-base mb-8 font-semibold" style={{ color: "oklch(0.78 0.10 265)" }}>
              Now available for free — for the next 24 hours only.
            </p>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
              <input
                type="email"
                placeholder="Your best email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="flex-1 rounded-xl px-4 py-3.5 text-sm outline-none"
                style={{
                  background: "oklch(0.12 0.025 255)",
                  border: `1px solid ${error ? "oklch(0.65 0.20 25)" : "oklch(0.28 0.03 265)"}`,
                  color: "oklch(0.92 0.01 265)",
                }}
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl px-6 py-3.5 font-bold text-sm whitespace-nowrap transition-all"
                style={{
                  background: loading
                    ? "oklch(0.55 0.12 65)"
                    : "linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.68 0.22 55))",
                  color: "oklch(0.08 0.02 255)",
                  boxShadow: loading ? "none" : "0 4px 20px oklch(0.78 0.18 65 / 0.40)",
                }}
              >
                {loading ? "Sending..." : "Get FREE Guide →"}
              </button>
            </form>
            {error && <p className="text-sm mb-2" style={{ color: "oklch(0.65 0.20 25)" }}>{error}</p>}
            <p className="text-xs" style={{ color: "oklch(0.38 0.03 265)" }}>
              No spam. Unsubscribe anytime. 12,847 people already downloaded this.
            </p>
          </div>
        </section>

        {/* ── SOCIAL PROOF BAR ── */}
        <div
          className="py-3 px-4"
          style={{ background: "oklch(0.78 0.18 65 / 0.08)", borderTop: "1px solid oklch(0.78 0.18 65 / 0.15)", borderBottom: "1px solid oklch(0.78 0.18 65 / 0.15)" }}
        >
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: "oklch(0.65 0.04 265)" }}>
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />)}
              </div>
              <span>4.9/5 from 2,341 readers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.18 145)" }} />
              <span>Science-backed methods</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: "oklch(0.65 0.18 145)" }} />
              <span>No pills, no supplements</span>
            </div>
          </div>
        </div>

        {/* ── FREE SAMPLE TIP ── */}
        <section className="py-10 px-4">
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid oklch(0.78 0.18 65 / 0.30)", background: "oklch(0.10 0.025 255)" }}
            >
              {/* Header */}
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ background: "oklch(0.78 0.18 65 / 0.10)", borderBottom: "1px solid oklch(0.78 0.18 65 / 0.20)" }}
              >
                <BookOpen className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.82 0.16 65)" }}>
                  Free Sample — Hack #4 from the Guide
                </span>
              </div>
              {/* Content */}
              <div className="p-5 md:p-6">
                <h3 className="font-display font-bold text-xl mb-1" style={{ color: "oklch(0.95 0.01 265)" }}>
                  Fall Asleep in Under 8 Minutes
                </h3>
                <p className="text-sm font-semibold mb-4" style={{ color: "oklch(0.82 0.16 65)" }}>
                  The military technique used by Navy SEALs in combat zones
                </p>
                <p className="text-sm mb-3" style={{ color: "oklch(0.72 0.04 265)" }}>
                  In 1981, the US military developed a sleep protocol to help soldiers fall asleep in any
                  environment — even under stress, noise, and discomfort. It works in <strong style={{ color: "oklch(0.88 0.01 265)" }}>96% of cases after 6 weeks of practice</strong>.
                </p>
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: "oklch(0.78 0.18 65 / 0.06)", border: "1px solid oklch(0.78 0.18 65 / 0.18)" }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.78 0.16 65)" }}>The 3-Step Protocol:</p>
                  <ol className="space-y-2">
                    {[
                      { step: "1", text: "Relax every muscle in your face — jaw, tongue, eyes. Let your face go completely slack." },
                      { step: "2", text: "Drop your shoulders as low as they'll go. Let your arms fall to your sides, one at a time." },
                      { step: "3", text: "Exhale and relax your chest. Then your legs, thighs, calves. Picture a warm black room." },
                    ].map(({ step, text }) => (
                      <li key={step} className="flex gap-3">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: "oklch(0.78 0.18 65 / 0.18)", color: "oklch(0.82 0.16 65)" }}
                        >{step}</span>
                        <span className="text-sm" style={{ color: "oklch(0.75 0.04 265)" }}>{text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="text-xs italic" style={{ color: "oklch(0.45 0.04 265)" }}>
                  The remaining 6 hacks in the full guide go even deeper — including the chronotype trick
                  that adds 90 minutes of deep sleep without changing your schedule.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT'S INSIDE ── */}
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <h2
              className="font-display font-bold text-2xl md:text-3xl text-center mb-2"
              style={{ color: "oklch(0.95 0.01 265)" }}
            >
              What You'll Discover Inside
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "oklch(0.55 0.04 265)" }}>
              Each hack is explained in plain English with the science behind it
            </p>

            <div className="space-y-4">
              {HACKS.map((hack) => (
                <div
                  key={hack.number}
                  className="rounded-xl p-4 flex gap-4"
                  style={{
                    background: "oklch(0.10 0.025 255)",
                    border: "1px solid oklch(0.18 0.03 265)",
                  }}
                >
                  <div
                    className="text-2xl font-black font-display flex-shrink-0 w-10 text-right leading-none pt-0.5"
                    style={{ color: "oklch(0.78 0.18 65 / 0.35)" }}
                  >
                    {hack.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-0.5" style={{ color: "oklch(0.90 0.01 265)" }}>
                      {hack.title}
                    </h3>
                    <p className="text-sm mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>
                      {hack.teaser}
                    </p>
                    <p className="text-xs" style={{ color: "oklch(0.48 0.04 265)" }}>
                      {hack.preview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-10 px-4" style={{ background: "oklch(0.08 0.025 255)" }}>
          <div className="max-w-2xl mx-auto">
            <h2
              className="font-display font-bold text-xl text-center mb-6"
              style={{ color: "oklch(0.95 0.01 265)" }}
            >
              What Readers Are Saying
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: "oklch(0.11 0.025 255)", border: "1px solid oklch(0.20 0.03 265)" }}
                >
                  <div className="flex mb-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
                    ))}
                  </div>
                  <p className="text-sm mb-3 italic" style={{ color: "oklch(0.72 0.04 265)" }}>
                    "{t.text}"
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "oklch(0.55 0.04 265)" }}>
                    — {t.name}, {t.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="py-12 px-4">
          <div className="max-w-md mx-auto text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-4" style={{ color: "oklch(0.82 0.16 65)" }} />
            <h2
              className="font-display font-bold text-2xl mb-3"
              style={{ color: "oklch(0.95 0.01 265)" }}
            >
              Get Your Free Copy Now
            </h2>
            <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.04 265)" }}>
              Enter your email and we'll send it instantly. Plus: a special one-time offer you won't see anywhere else.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Your best email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none"
                style={{
                  background: "oklch(0.12 0.025 255)",
                  border: `1px solid ${error ? "oklch(0.65 0.20 25)" : "oklch(0.28 0.03 265)"}`,
                  color: "oklch(0.92 0.01 265)",
                }}
                required
              />
              {error && <p className="text-xs" style={{ color: "oklch(0.65 0.20 25)" }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading
                    ? "oklch(0.55 0.12 65)"
                    : "linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.68 0.22 55))",
                  color: "oklch(0.08 0.02 255)",
                  boxShadow: loading ? "none" : "0 6px 28px oklch(0.78 0.18 65 / 0.40)",
                }}
              >
                {loading ? "Sending..." : <>Send Me the FREE Guide <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="flex items-center justify-center gap-5 mt-4">
              <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.38 0.03 265)" }}>
                <Shield className="w-3 h-3" />
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.38 0.03 265)" }}>
                <Zap className="w-3 h-3" />
                <span>Instant delivery</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
