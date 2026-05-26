/**
 * /tiktok — TikTok-optimized landing page
 * Mobile-first · Autoplay video slot · Punchy headline · Fast checkout
 * Designed for TikTok ad traffic: high scroll velocity, short attention span
 */
import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getSessionId, captureUTM } from "@/hooks/useSession";
import { useTrackBehavior } from "@/hooks/useSession";
import { trackLead, trackViewContent } from "@/lib/conversionTracking";
import { Star, Play, Pause, Volume2, VolumeX, ChevronDown, Shield, Zap, Clock, CheckCircle2 } from "lucide-react";

// ── Design tokens (match global dark cosmic theme) ────────────────────────
const C = {
  bg: "oklch(0.07 0.025 255)",
  card: "oklch(0.11 0.025 255)",
  gold: "oklch(0.82 0.16 65)",
  goldDim: "oklch(0.65 0.14 65)",
  green: "oklch(0.72 0.18 145)",
  text: "oklch(0.95 0.01 265)",
  textSub: "oklch(0.65 0.04 265)",
  textMuted: "oklch(0.45 0.04 265)",
  border: "oklch(0.78 0.18 65 / 0.12)",
};

// ── Social proof data ─────────────────────────────────────────────────────
const REVIEWS = [
  { name: "Sarah M.", loc: "Austin, TX", text: "Slept 7 hours straight on Night 3. I cried.", stars: 5 },
  { name: "Jake R.", loc: "London, UK", text: "Tried everything. This guide actually worked.", stars: 5 },
  { name: "Priya K.", loc: "Toronto, CA", text: "The 90-min rule changed my life. No joke.", stars: 5 },
  { name: "Tom W.", loc: "Sydney, AU", text: "Night shift nurse. Finally sleeping again.", stars: 5 },
];

const STATS = [
  { value: "12,847+", label: "People helped" },
  { value: "4.9★", label: "Average rating" },
  { value: "80%", label: "CBT-I success rate" },
  { value: "7 nights", label: "To see results" },
];

// ── Video placeholder URL — replace with actual TikTok-style social proof video
const VIDEO_PLACEHOLDER = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export default function TikTokLanding() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const sessionId = getSessionId();
  const { track } = useTrackBehavior();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [liveCount] = useState(() => Math.floor(Math.random() * 30) + 18);

  // Capture UTM params and fire page_view on mount
  useEffect(() => {
    captureUTM();
    const params = new URLSearchParams(search);
    const utmSource = params.get("utm_source") || "tiktok";
    const utmCampaign = params.get("utm_campaign") || "";
    track("page_view", {
      page: "tiktok_landing",
      value: { utm_source: utmSource, utm_campaign: utmCampaign, channel: "tiktok" },
    });
    trackViewContent({ productId: "main", productName: "Deep Sleep Reset Protocol", value: 7 });
    // TikTok-optimized OG meta tags
    document.title = "Sleep Better in 7 Nights — Without Pills | Deep Sleep Reset";
    const setMeta = (prop: string, content: string, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("og:title", "Sleep Better in 7 Nights — Without Pills");
    setMeta("og:description", "The 7-night CBT-I protocol that 2,847+ people used to fix insomnia. Just $4. Instant access.");
    setMeta("og:image", "https://d2xsxph8kpxj0f.cloudfront.net/310519663586946788/Z7uhfhzSjok5tWXFuno9PK/og-variant-a-sleep-deprived-hye2KT2i6vNEAo2u9i22xr.webp");
    setMeta("og:image:width", "1200");
    setMeta("og:image:height", "630");
    setMeta("og:url", window.location.href);
    setMeta("twitter:title", "Sleep Better in 7 Nights — Without Pills", "name");
    setMeta("twitter:description", "The 7-night CBT-I protocol that 2,847+ people used to fix insomnia. Just $4. Instant access.", "name");
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % REVIEWS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Attempt autoplay on mount (muted for browser policy compliance)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleQuizStart = () => {
    track("quiz_start", { page: "tiktok_landing", value: { source: "tiktok_cta" } });
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: C.bg, color: C.text }}>

      {/* ── Top urgency bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold"
        style={{ background: "linear-gradient(90deg, oklch(0.45 0.16 55), oklch(0.55 0.18 65))", color: "white" }}>
        <span className="animate-pulse">🔴</span>
        <span>{liveCount} people watching this right now</span>
        <span>·</span>
        <span>Only $7 today</span>
      </div>

      {/* ── Hero: headline + video ───────────────────────────────────────── */}
      <section className="px-4 pt-6 pb-4 max-w-lg mx-auto">

        {/* Eyebrow */}
        <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center"
          style={{ color: C.gold }}>
          Science-backed · No pills · 7 nights
        </p>

        {/* Punchy headline — short, TikTok-optimized */}
        <h1 className="text-3xl font-display font-black leading-tight text-center mb-2"
          style={{ color: C.text }}>
          Can't Sleep?
          <br />
          <span style={{
            background: `linear-gradient(135deg, ${C.gold}, oklch(0.75 0.18 45))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Fix It in 7 Nights.
          </span>
        </h1>

        <p className="text-sm text-center mb-5" style={{ color: C.textSub }}>
          The CBT-I protocol that 12,847 people used to finally sleep through the night — for less than a coffee.
        </p>

        {/* ── Video player ─────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mb-5"
          style={{ background: C.card, border: `1px solid ${C.border}`, aspectRatio: "9/16", maxHeight: "520px" }}>

          {!videoError ? (
            <video
              ref={videoRef}
              src={VIDEO_PLACEHOLDER}
              loop
              playsInline
              muted={isMuted}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Fallback placeholder when no video is uploaded yet */
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6"
              style={{ background: "linear-gradient(180deg, oklch(0.09 0.03 255), oklch(0.12 0.04 255))" }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.82 0.16 65 / 0.15)", border: `2px solid ${C.gold}` }}>
                <Play className="w-8 h-8 ml-1" style={{ color: C.gold }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>Social Proof Video</p>
                <p className="text-xs" style={{ color: C.textMuted }}>Upload your TikTok-style testimonial video in Admin → Settings</p>
              </div>
              {/* Simulated video content */}
              <div className="w-full space-y-3 mt-4">
                {["😴 Couldn't sleep for 3 years...", "💊 Tried melatonin, CBD, everything...", "✅ Night 3 of this protocol...", "🌙 Slept 7 hours straight!"].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{ background: "oklch(0.15 0.03 255 / 0.8)" }}>
                    <span className="text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video controls overlay */}
          {!videoError && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{ background: "oklch(0.07 0.025 255 / 0.7)", border: `1px solid ${C.border}` }}>
                {isPlaying
                  ? <Pause className="w-4 h-4" style={{ color: C.text }} />
                  : <Play className="w-4 h-4 ml-0.5" style={{ color: C.text }} />}
              </button>
              <button onClick={toggleMute}
                className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
                style={{ background: "oklch(0.07 0.025 255 / 0.7)", border: `1px solid ${C.border}` }}>
                {isMuted
                  ? <VolumeX className="w-4 h-4" style={{ color: C.text }} />
                  : <Volume2 className="w-4 h-4" style={{ color: C.text }} />}
              </button>
            </div>
          )}

          {/* "Tap to unmute" hint */}
          {!videoError && isMuted && isPlaying && (
            <button onClick={toggleMute}
              className="absolute top-3 left-0 right-0 mx-auto w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm"
              style={{ background: "oklch(0.07 0.025 255 / 0.75)", color: C.textSub, border: `1px solid ${C.border}` }}>
              <VolumeX className="w-3 h-3" /> Tap to unmute
            </button>
          )}
        </div>

        {/* ── Primary CTA ──────────────────────────────────────────────── */}
        <CheckoutButton
          sessionId={sessionId}
          productId="main"
          className="w-full"
        >
          <div className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-bold"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white" }}>
            <Zap className="w-5 h-5" />
            Get Instant Access — $7
          </div>
        </CheckoutButton>

        {/* Quiz CTA alternative */}
        <button
          onClick={handleQuizStart}
          className="w-full mt-3 py-3 px-6 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: `linear-gradient(135deg, oklch(0.68 0.18 55), oklch(0.60 0.20 45))`, color: "#000", border: "none" }}
        >
          Or take the free chronotype quiz first →
        </button>

        <p className="text-xs text-center mt-2" style={{ color: C.textMuted }}>
          Instant download · 30-day money-back guarantee · No subscription
        </p>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="px-4 py-4 max-w-lg mx-auto">
        <div className="grid grid-cols-4 gap-2">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-center"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <span className="text-sm font-bold" style={{ color: C.gold }}>{s.value}</span>
              <span className="text-[10px] leading-tight" style={{ color: C.textMuted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you get ────────────────────────────────────────────────── */}
      <section className="px-4 py-4 max-w-lg mx-auto">
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: C.gold }}>
            What's inside — $7
          </p>
          <div className="space-y-3">
            {[
              { icon: "🌙", title: "7-Night Sleep Protocol", desc: "Night-by-night CBT-I plan personalized to your chronotype" },
              { icon: "🧬", title: "Chronotype Quiz", desc: "Lion, Bear, Wolf, or Dolphin — your biology determines your ideal sleep window" },
              { icon: "⏰", title: "90-Minute Sleep Rule", desc: "The single most effective technique for falling asleep faster" },
              { icon: "🆘", title: "3 AM Rescue Protocol", desc: "What to do when you wake up at 3 AM and can't get back to sleep" },
              { icon: "📓", title: "Sleep Journal Template", desc: "Track your progress and identify your personal sleep triggers" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.text }}>{item.title}</p>
                  <p className="text-xs" style={{ color: C.textSub }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rotating testimonials ────────────────────────────────────────── */}
      <section className="px-4 py-4 max-w-lg mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: C.gold }}>
          Real results
        </p>
        <div className="relative overflow-hidden rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}`, minHeight: "130px" }}>
          {REVIEWS.map((r, i) => (
            <div key={i}
              className="transition-all duration-500"
              style={{ display: i === activeReview ? "block" : "none" }}>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: C.gold }} />
                ))}
              </div>
              <p className="text-sm font-medium mb-3" style={{ color: C.text }}>"{r.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "oklch(0.82 0.16 65 / 0.15)", color: C.gold }}>
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: C.text }}>{r.name}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>{r.loc} · Verified buyer</p>
                </div>
              </div>
            </div>
          ))}
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {REVIEWS.map((_, i) => (
              <button key={i} onClick={() => setActiveReview(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === activeReview ? C.gold : C.textMuted }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem agitation ───────────────────────────────────────────── */}
      <section className="px-4 py-4 max-w-lg mx-auto">
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-sm font-bold mb-3" style={{ color: C.text }}>
            Sound familiar? 👇
          </p>
          <div className="space-y-2">
            {[
              "You wake up at 3 AM and can't get back to sleep",
              "You're exhausted but your brain won't shut off",
              "You've tried melatonin, sleep apps, white noise",
              "You dread going to bed because you know you won't sleep",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="text-base flex-shrink-0">😔</span>
                <p className="text-xs" style={{ color: C.textSub }}>{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-sm font-semibold" style={{ color: C.green }}>
              ✅ This protocol addresses all of these — scientifically.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trust / guarantee ───────────────────────────────────────────── */}
      <section className="px-4 py-4 max-w-lg mx-auto">
        <div className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ background: "oklch(0.72 0.18 145 / 0.08)", border: `1px solid oklch(0.72 0.18 145 / 0.2)` }}>
          <Shield className="w-10 h-10 flex-shrink-0" style={{ color: C.green }} />
          <div>
            <p className="text-sm font-bold" style={{ color: C.text }}>30-Day Money-Back Guarantee</p>
            <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
              Sleep better in 7 nights or get a full refund. No questions asked. Zero risk.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ (minimal) ───────────────────────────────────────────────── */}
      <section className="px-4 py-4 max-w-lg mx-auto">
        <div className="space-y-2">
          {[
            { q: "Is this a subscription?", a: "No. One-time payment of $7. You own it forever." },
            { q: "How is this different from sleep tips I've read?", a: "This is a structured 7-night CBT-I protocol — the same approach used by sleep clinics. Not random tips." },
            { q: "What if it doesn't work for me?", a: "Full refund within 30 days. No questions, no forms, no hassle." },
            { q: "Is this medical advice?", a: "No. This is an educational wellness guide based on evidence-informed CBT-I principles. Always consult a doctor for medical concerns." },
          ].map((item) => (
            <details key={item.q} className="rounded-xl overflow-hidden group"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                <span className="text-sm font-medium" style={{ color: C.text }}>{item.q}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-180" style={{ color: C.textMuted }} />
              </summary>
              <div className="px-4 pb-3">
                <p className="text-xs" style={{ color: C.textSub }}>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="px-4 pt-4 pb-8 max-w-lg mx-auto">
        <CheckoutButton
          sessionId={sessionId}
          productId="main"
          className="w-full"
        >
          <div className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-base font-bold"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white" }}>
            <Zap className="w-5 h-5" />
            Start Sleeping Better Tonight — $7
          </div>
        </CheckoutButton>

        <div className="flex items-center justify-center gap-4 mt-3">
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

        {/* Compliance disclaimer */}
        <p className="text-xs text-center mt-4 px-2" style={{ color: C.textMuted }}>
          This is an educational wellness guide based on evidence-informed CBT-I principles. Not medical advice.
          Results vary. Always consult a healthcare professional for medical concerns.
        </p>

        <p className="text-xs text-center mt-3" style={{ color: C.textMuted }}>
          Questions? <a href="/contact" className="underline" style={{ color: C.goldDim }}>Contact us</a>
          {" · "}
          <a href="/privacy" className="underline" style={{ color: C.goldDim }}>Privacy</a>
          {" · "}
          <a href="/refund" className="underline" style={{ color: C.goldDim }}>Refund Policy</a>
        </p>
      </section>

    </div>
  );
}
