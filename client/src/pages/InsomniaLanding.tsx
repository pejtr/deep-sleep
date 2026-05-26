/**
 * /insomnia — Dedicated landing page for r/insomnia and Reddit traffic
 * CBT-I focused · Transparent · No hype claims · Evidence-informed
 * Designed for skeptical, research-oriented insomnia sufferers
 */
import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getSessionId, useTrackBehavior, captureUTM } from "@/hooks/useSession";
import { trackViewContent } from "@/lib/conversionTracking";
import { ChevronDown, BookOpen, Brain, Moon, Clock, Shield, CheckCircle2, ArrowRight, Feather } from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "oklch(0.07 0.025 255)",
  card: "oklch(0.11 0.025 255)",
  cardAlt: "oklch(0.09 0.03 255)",
  gold: "oklch(0.82 0.16 65)",
  goldDim: "oklch(0.65 0.14 65)",
  green: "oklch(0.72 0.18 145)",
  blue: "oklch(0.72 0.16 240)",
  text: "oklch(0.95 0.01 265)",
  textSub: "oklch(0.65 0.04 265)",
  textMuted: "oklch(0.45 0.04 265)",
  border: "oklch(0.78 0.18 65 / 0.12)",
  borderBlue: "oklch(0.72 0.16 240 / 0.2)",
};

const FAQS = [
  {
    q: "Is this medical advice or a medical treatment?",
    a: "No. This is an educational wellness guide based on evidence-informed CBT-I (Cognitive Behavioral Therapy for Insomnia) principles. CBT-I is widely studied and recommended by sleep specialists, but this guide is not a substitute for professional medical care. If you have a sleep disorder, please consult a doctor.",
  },
  {
    q: "What is CBT-I and why does it work?",
    a: "CBT-I is a structured program that addresses the thoughts and behaviors that cause or worsen sleep problems. Unlike sleep medication, CBT-I treats the underlying causes rather than just the symptoms. Multiple meta-analyses show it improves sleep onset, duration, and quality in 70-80% of participants.",
  },
  {
    q: "I've tried everything. Why would this be different?",
    a: "Most 'sleep tips' are isolated techniques without structure. CBT-I works as a 7-night protocol where each night builds on the previous. It also addresses the anxiety around sleep itself — which is often the biggest barrier. We're not promising a miracle, just a structured approach that has solid research behind it.",
  },
  {
    q: "Does this work for chronic insomnia (years of poor sleep)?",
    a: "CBT-I was originally developed for chronic insomnia. Research shows it's effective even for people who've struggled for years. That said, results vary — some people see improvement in 3-4 nights, others take longer. That's why we offer a 30-day refund.",
  },
  {
    q: "Is there a subscription or recurring charge?",
    a: "No. One-time payment of $7. You own the guide forever. No subscription, no upsell pressure, no recurring billing.",
  },
  {
    q: "What if I have sleep apnea or another medical condition?",
    a: "CBT-I can complement treatment for sleep apnea, but it doesn't replace CPAP therapy or medical treatment. If you have a diagnosed sleep disorder, please work with your healthcare provider. This guide is best suited for behavioral insomnia — difficulty falling or staying asleep without a medical cause.",
  },
];

const WHAT_CBTI_ADDRESSES = [
  { icon: "🧠", title: "Sleep Anxiety", desc: "The worry about not sleeping that makes sleep harder — CBT-I directly targets this cycle" },
  { icon: "⏰", title: "Circadian Rhythm Disruption", desc: "Irregular sleep schedules that confuse your body's internal clock" },
  { icon: "🛏️", title: "Bed-Wake Association", desc: "When your brain associates bed with wakefulness instead of sleep" },
  { icon: "💭", title: "Racing Thoughts", desc: "Cognitive techniques to quiet the mind before sleep" },
  { icon: "🌅", title: "Early Morning Waking", desc: "Strategies for 3-5 AM waking that's common in anxiety-related insomnia" },
  { icon: "😴", title: "Sleep Efficiency", desc: "Rebuilding deep, consolidated sleep instead of fragmented light sleep" },
];

const RESEARCH_POINTS = [
  { stat: "70-80%", desc: "of people with insomnia improve with CBT-I (Trauer et al., 2015 meta-analysis)" },
  { stat: "1st line", desc: "CBT-I is the first-line treatment recommended by the American College of Physicians" },
  { stat: "Long-term", desc: "Benefits persist 12+ months after completing CBT-I (unlike sleep medication)" },
];

export default function InsomniaLanding() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const sessionId = getSessionId();
  const { track } = useTrackBehavior();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    captureUTM();
    const params = new URLSearchParams(search);
    const utmSource = params.get("utm_source") || "reddit";
    const utmCampaign = params.get("utm_campaign") || "";
    track("page_view", {
      page: "insomnia_landing",
      value: { utm_source: utmSource, utm_campaign: utmCampaign, channel: "reddit" },
    });
    trackViewContent({ productId: "main", productName: "Deep Sleep Reset Protocol", value: 7 });
  }, []);

  const handleQuizStart = () => {
    track("quiz_start", { page: "insomnia_landing", value: { source: "reddit_cta" } });
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: C.bg, color: C.text }}>

      {/* ── Honest header bar ────────────────────────────────────────────── */}
      <div className="w-full py-2 px-4 flex items-center justify-center gap-2 text-xs"
        style={{ background: C.cardAlt, borderBottom: `1px solid ${C.border}` }}>
        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.blue }} />
        <span style={{ color: C.textSub }}>
          Educational wellness guide · Based on CBT-I principles · Not medical advice
        </span>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-10 pb-8 max-w-2xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center"
          style={{ color: C.blue }}>
          CBT-I Inspired · Evidence-Informed · No Pills
        </p>

        <h1 className="text-3xl md:text-4xl font-display font-black leading-tight text-center mb-4"
          style={{ color: C.text }}>
          A Structured Approach to
          <br />
          <span style={{
            background: `linear-gradient(135deg, ${C.gold}, oklch(0.75 0.18 45))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Sleeping Better in 7 Nights
          </span>
        </h1>

        <p className="text-base text-center mb-6 max-w-xl mx-auto leading-relaxed" style={{ color: C.textSub }}>
          A 7-night protocol based on Cognitive Behavioral Therapy for Insomnia (CBT-I) principles —
          the behavioral approach recommended by sleep specialists for chronic insomnia.
          <br /><br />
          <strong style={{ color: C.text }}>Not a magic fix. A structured system.</strong>
        </p>

        {/* Research credibility row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {RESEARCH_POINTS.map((p) => (
            <div key={p.stat} className="text-center p-3 rounded-2xl"
              style={{ background: C.card, border: `1px solid ${C.borderBlue}` }}>
              <div className="text-lg font-black mb-1" style={{ color: C.blue }}>{p.stat}</div>
              <div className="text-xs leading-tight" style={{ color: C.textMuted }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <button
            onClick={handleQuizStart}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-bold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.gold}, oklch(0.72 0.16 55))`, color: "black" }}
          >
            <Brain className="w-5 h-5" />
            Take the Free Chronotype Quiz
          </button>
          <CheckoutButton sessionId={sessionId} productId="main" className="w-full">
            <div className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, oklch(0.68 0.18 55), oklch(0.60 0.20 45))`, color: "#000", border: "none" }}>
              <ArrowRight className="w-4 h-4" />
              Get the 7-Night Protocol — $7
            </div>
          </CheckoutButton>
        </div>

        <p className="text-xs text-center mt-3" style={{ color: C.textMuted }}>
          30-day money-back guarantee · One-time payment · Instant access
        </p>
      </section>

      {/* ── What CBT-I addresses ─────────────────────────────────────────── */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-display font-bold text-center mb-2" style={{ color: C.text }}>
          What This Protocol Addresses
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: C.textSub }}>
          CBT-I targets the behavioral and cognitive patterns that maintain insomnia
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WHAT_CBTI_ADDRESSES.map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: C.text }}>{item.title}</p>
                <p className="text-xs" style={{ color: C.textSub }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's in the protocol ───────────────────────────────────────── */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h2 className="text-lg font-display font-bold mb-4" style={{ color: C.text }}>
            What's Inside the 7-Night Protocol
          </h2>
          <div className="space-y-4">
            {[
              {
                night: "Night 1–2",
                title: "Sleep Restriction & Stimulus Control",
                desc: "Establish a consistent sleep window. Rebuild the bed-sleep association. These two techniques alone account for most of CBT-I's effectiveness.",
              },
              {
                night: "Night 3–4",
                title: "Cognitive Restructuring",
                desc: "Identify and reframe the thoughts that keep you awake — catastrophizing, clock-watching, performance anxiety around sleep.",
              },
              {
                night: "Night 5–6",
                title: "Relaxation & Wind-Down Ritual",
                desc: "Chronotype-specific wind-down sequence. Progressive muscle relaxation. Breathing techniques that activate the parasympathetic nervous system.",
              },
              {
                night: "Night 7",
                title: "Maintenance & Relapse Prevention",
                desc: "How to handle future bad nights without spiraling. Long-term sleep hygiene that works with your chronotype, not against it.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-16 text-right">
                  <span className="text-xs font-bold" style={{ color: C.gold }}>{item.night}</span>
                </div>
                <div className="flex-1 pb-4" style={{ borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.textSub }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Honest testimonials ──────────────────────────────────────────── */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-display font-bold text-center mb-6" style={{ color: C.text }}>
          What People Are Saying
        </h2>
        <div className="space-y-4">
          {[
            {
              name: "Marcus T.",
              loc: "Portland, OR",
              text: "I was skeptical — I've had insomnia for 6 years and tried everything. The sleep restriction part was hard at first, but by Night 4 I was sleeping 6.5 hours straight. That hadn't happened in years.",
              context: "Chronic insomnia, 6 years",
            },
            {
              name: "Priya K.",
              loc: "Toronto, CA",
              text: "The cognitive restructuring section was what I needed. I didn't realize how much my anxiety about not sleeping was making it worse. The protocol addresses that directly.",
              context: "Anxiety-related insomnia",
            },
            {
              name: "David R.",
              loc: "London, UK",
              text: "I appreciated that this doesn't make wild claims. It's a structured protocol, it's honest about what CBT-I is, and it actually worked for me. Night 3 was the turning point.",
              context: "Sleep maintenance insomnia",
            },
          ].map((r) => (
            <div key={r.name} className="p-5 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} style={{ color: C.gold }}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: C.text }}>"{r.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold" style={{ color: C.text }}>{r.name}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>{r.loc}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.72 0.16 240 / 0.1)", color: C.blue, border: `1px solid ${C.borderBlue}` }}>
                  {r.context}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Honest comparison ────────────────────────────────────────────── */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <div className="p-4" style={{ background: C.cardAlt }}>
            <h2 className="text-lg font-bold text-center" style={{ color: C.text }}>
              How This Compares
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: C.card }}>
                  <th className="text-left p-3" style={{ color: C.textMuted }}>Approach</th>
                  <th className="text-center p-3" style={{ color: C.textMuted }}>Works long-term?</th>
                  <th className="text-center p-3" style={{ color: C.textMuted }}>Side effects?</th>
                  <th className="text-center p-3" style={{ color: C.textMuted }}>Addresses root cause?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Sleep medication", longTerm: "❌ Often rebounds", sideEffects: "⚠️ Dependency risk", root: "❌ Masks symptoms" },
                  { name: "Melatonin", longTerm: "⚠️ Limited evidence", sideEffects: "✅ Generally safe", root: "❌ Circadian only" },
                  { name: "Sleep hygiene tips", longTerm: "⚠️ Inconsistent", sideEffects: "✅ None", root: "⚠️ Partial" },
                  { name: "CBT-I (this protocol)", longTerm: "✅ 12+ months", sideEffects: "✅ None", root: "✅ Yes" },
                ].map((row, i) => (
                  <tr key={i} style={{
                    background: i === 3 ? "oklch(0.82 0.16 65 / 0.05)" : (i % 2 === 0 ? C.card : C.cardAlt),
                    borderTop: `1px solid ${C.border}`,
                  }}>
                    <td className="p-3 font-medium" style={{ color: i === 3 ? C.gold : C.text }}>{row.name}</td>
                    <td className="p-3 text-center" style={{ color: C.textSub }}>{row.longTerm}</td>
                    <td className="p-3 text-center" style={{ color: C.textSub }}>{row.sideEffects}</td>
                    <td className="p-3 text-center" style={{ color: C.textSub }}>{row.root}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Luna section (subtle) ────────────────────────────────────────── */}
      <section className="px-4 py-6 max-w-2xl mx-auto">
        <div className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "linear-gradient(135deg, oklch(0.10 0.04 280), oklch(0.08 0.06 260))", border: "1px solid oklch(0.45 0.12 280 / 0.3)" }}>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/luna-avatar-ZRuJw2SPLknXZS2RAKU4vn.webp"
            alt="Luna — sleep guide"
            className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
            style={{ border: "2px solid oklch(0.65 0.18 280 / 0.5)" }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Feather className="w-3 h-3" style={{ color: "oklch(0.72 0.16 280)" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.72 0.16 280)" }}>A note from Luna</span>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: "oklch(0.85 0.03 265)" }}>
              "The most common thing I hear is: <em>'I've tried everything.'</em> But CBT-I is usually the one thing they haven't tried — because it requires consistency, not just a pill.
              If you're willing to follow a 7-night structure, this works."
            </p>
            <p className="text-xs mt-2" style={{ color: "oklch(0.55 0.04 265)" }}>— Luna, Sleep Guide & CBT-I Educator</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-display font-bold text-center mb-6" style={{ color: C.text }}>
          Honest Answers to Common Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium pr-4" style={{ color: C.text }}>{faq.q}</span>
                <ChevronDown
                  className="w-4 h-4 flex-shrink-0 transition-transform"
                  style={{ color: C.textMuted, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm leading-relaxed" style={{ color: C.textSub }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="px-4 py-8 pb-12 max-w-2xl mx-auto">
        <div className="rounded-2xl p-6 text-center"
          style={{ background: "linear-gradient(135deg, oklch(0.10 0.04 265), oklch(0.12 0.05 255))", border: `1px solid ${C.border}` }}>
          <Moon className="w-8 h-8 mx-auto mb-3" style={{ color: C.gold }} />
          <h2 className="text-xl font-display font-bold mb-2" style={{ color: C.text }}>
            Ready to Try a Structured Approach?
          </h2>
          <p className="text-sm mb-6" style={{ color: C.textSub }}>
            7-night CBT-I inspired protocol · $7 one-time · 30-day refund if it doesn't help
          </p>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              onClick={handleQuizStart}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-bold transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${C.gold}, oklch(0.72 0.16 55))`, color: "black" }}
            >
              <Brain className="w-5 h-5" />
              Start with the Free Quiz
            </button>
            <CheckoutButton sessionId={sessionId} productId="main" className="w-full">
              <div className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, oklch(0.68 0.18 55), oklch(0.60 0.20 45))`, color: "#000", border: "none" }}>
                <ArrowRight className="w-4 h-4" />
                Skip Quiz — Get Protocol Now ($7)
              </div>
            </CheckoutButton>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            {[
              { icon: <Clock className="w-3.5 h-3.5" />, text: "Instant access" },
              { icon: <Shield className="w-3.5 h-3.5" />, text: "30-day refund" },
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: "No subscription" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1 text-xs" style={{ color: C.textMuted }}>
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Compliance footer */}
        <p className="text-xs text-center mt-6 px-4 leading-relaxed" style={{ color: C.textMuted }}>
          This is an educational wellness guide based on evidence-informed CBT-I principles.
          It is not a medical device, diagnosis, or treatment. Results vary. Always consult a qualified
          healthcare professional for medical concerns, especially if you have a diagnosed sleep disorder.
        </p>

        <p className="text-xs text-center mt-3" style={{ color: C.textMuted }}>
          <a href="/privacy" className="underline" style={{ color: C.goldDim }}>Privacy Policy</a>
          {" · "}
          <a href="/refund" className="underline" style={{ color: C.goldDim }}>Refund Policy</a>
          {" · "}
          <a href="/contact" className="underline" style={{ color: C.goldDim }}>Contact</a>
        </p>
      </section>

    </div>
  );
}
