import { useState } from "react";
import { Moon, ArrowLeft, Star, Gift, Copy, Check } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/hooks/useSession";  // eslint-disable-line

const REWARDS = {
  5: { type: "premium_month", label: "1 Month Premium FREE", code: "THANKYOU5STARS", desc: "Access to all premium ASMR sleep sounds + community" },
  4: { type: "discount_30", label: "30% OFF next purchase", code: "FEEDBACK30", desc: "Use at checkout on any Deep Sleep Reset product" },
  3: { type: "discount_20", label: "20% OFF next purchase", code: "FEEDBACK20", desc: "Thank you for your honest feedback" },
  2: { type: "discount_15", label: "15% OFF + priority support", code: "IMPROVE15", desc: "We take your feedback seriously and want to make it right" },
  1: { type: "full_refund", label: "Full refund + free upgrade", code: "SORRY100", desc: "We're sorry. Email us with this code for a full refund or free upgrade" },
};

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [step, setStep] = useState<"rate" | "details" | "reward">("rate");
  const [liked, setLiked] = useState("");
  const [improved, setImproved] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = trpc.feedback.submit.useMutation();

  const reward = rating > 0 ? REWARDS[rating as keyof typeof REWARDS] : null;

  const handleRatingSelect = (r: number) => {
    setRating(r);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFeedback.mutateAsync({
        sessionId: getSessionId(),
        rating,
        liked,
        improved,
        email: email || undefined,
        rewardCode: reward?.code,
      });
      setStep("reward");
    } catch {
      setStep("reward"); // show reward even if save fails
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (reward) {
      navigator.clipboard.writeText(reward.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="min-h-screen pb-16" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-96 h-96 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-blue w-72 h-72 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Moon className="w-5 h-5" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="font-display font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>
            Deep Sleep Reset
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
          style={{ color: "oklch(0.55 0.04 265)" }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="relative z-10 container max-w-lg mx-auto py-10">

        {/* Step 1: Rating */}
        {step === "rate" && (
          <div className="glass-card rounded-3xl p-8 text-center" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="text-5xl mb-4"></div>
            <h1 className="font-display font-black text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
              How Did We Do?
            </h1>
            <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.04 265)" }}>
              Your honest feedback helps us improve — and we reward you for it.
            </p>

            {/* Stars */}
            <div className="flex gap-3 justify-center mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => handleRatingSelect(i)}
                  onMouseEnter={() => setHoveredRating(i)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-125 active:scale-110"
                >
                  <Star
                    className="w-10 h-10 transition-colors"
                    style={{
                      color: i <= displayRating ? "oklch(0.82 0.16 65)" : "oklch(0.25 0.04 265)",
                      fill: i <= displayRating ? "oklch(0.82 0.16 65)" : "transparent",
                    }}
                  />
                </button>
              ))}
            </div>

            {displayRating > 0 && (
              <p className="text-sm font-semibold animate-reveal" style={{ color: "oklch(0.82 0.16 65)" }}>
                {displayRating === 5 ? "Excellent! 🎉" :
                 displayRating === 4 ? "Great! 👍" :
                 displayRating === 3 ? "Good, room to improve 🙂" :
                 displayRating === 2 ? "We can do better 😔" :
                 "We're sorry to hear that"}
              </p>
            )}

            {/* Reward preview */}
            {displayRating > 0 && REWARDS[displayRating as keyof typeof REWARDS] && (
              <div className="mt-4 rounded-xl p-3 animate-reveal"
                style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
                <p className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>
                  <Gift className="w-3.5 h-3.5 inline mr-1" />
                  Your reward: {REWARDS[displayRating as keyof typeof REWARDS].label}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <div className="glass-card rounded-3xl p-8" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5"
                    style={{ color: i <= rating ? "oklch(0.82 0.16 65)" : "oklch(0.25 0.04 265)", fill: i <= rating ? "oklch(0.82 0.16 65)" : "transparent" }} />
                ))}
              </div>
              <button onClick={() => setStep("rate")} className="text-xs ml-2" style={{ color: "oklch(0.50 0.04 265)" }}>
                (change)
              </button>
            </div>

            <h2 className="font-display font-bold text-xl mb-5" style={{ color: "oklch(0.95 0.01 265)" }}>
              Tell us more (takes 30 seconds)
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>
                  What did you like most?
                </label>
                <textarea
                  value={liked}
                  onChange={e => setLiked(e.target.value)}
                  placeholder="e.g. The Night 4 breathing technique actually worked..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>
                  What could we improve? 🔧
                </label>
                <textarea
                  value={improved}
                  onChange={e => setImproved(e.target.value)}
                  placeholder="e.g. More audio content, video explanations..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>
                  Email (optional — to receive your reward code)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }}
                />
              </div>

              {/* Reward preview */}
              {reward && (
                <div className="rounded-xl p-3" style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
                  <p className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>
                    <Gift className="w-3.5 h-3.5 inline mr-1" />
                    Your reward: <strong>{reward.label}</strong>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.04 265)" }}>{reward.desc}</p>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full cta-gold cta-shimmer rounded-xl py-3.5 text-sm font-bold disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit & Claim My Reward →"}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Reward */}
        {step === "reward" && reward && (
          <div className="glass-card rounded-3xl p-8 text-center" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
            <div className="text-5xl mb-4 animate-float"></div>
            <h2 className="font-display font-black text-2xl mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
              Thank You!
            </h2>
            <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.04 265)" }}>
              Your feedback genuinely helps us improve. Here's your reward:
            </p>

            <div className="rounded-2xl p-6 mb-6" style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.70 0.04 265)" }}>Your reward</p>
              <p className="font-bold text-lg mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>{reward.label}</p>
              <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>{reward.desc}</p>

              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl px-4 py-3 font-mono text-sm font-bold text-center"
                  style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.78 0.18 65 / 0.3)", color: "oklch(0.82 0.16 65)", letterSpacing: "0.1em" }}>
                  {reward.code}
                </div>
                <button onClick={handleCopyCode}
                  className="rounded-xl px-4 py-3 flex items-center gap-1.5 text-sm font-semibold flex-shrink-0"
                  style={{ background: "oklch(0.78 0.18 65 / 0.15)", border: "1px solid oklch(0.78 0.18 65 / 0.3)", color: "oklch(0.82 0.16 65)" }}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <p className="text-xs mb-6" style={{ color: "oklch(0.45 0.04 265)" }}>
              Use this code at checkout on Gumroad. Valid for 30 days.
            </p>

            <Link href="/"
              className="inline-block rounded-xl px-8 py-3 text-sm font-semibold"
              style={{ background: "oklch(0.78 0.18 65 / 0.15)", border: "1px solid oklch(0.78 0.18 65 / 0.3)", color: "oklch(0.82 0.16 65)" }}>
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
