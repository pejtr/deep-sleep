import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Star, Share2, Copy, Check, Moon } from "lucide-react";
import { useTrackBehavior } from "@/hooks/useSession";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";
const CHRONOTYPE_ICONS: Record<Chronotype, string> = { Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬" };

export default function ThankYou() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";
  const { track } = useTrackBehavior();

  const [showReview, setShowReview] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [rating, setRating] = useState(0);
  const [copied, setCopied] = useState(false);

  const referralUrl = `${window.location.origin}/?ref=${chronotype.toLowerCase()}`;

  useEffect(() => {
    track("page_view", { page: "thankyou", value: { chronotype } });
    // Show review prompt after 3 seconds
    const t1 = setTimeout(() => setShowReview(true), 3000);
    // Show premium upsell after 8 seconds
    const t2 = setTimeout(() => setShowPremium(true), 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      track("referral_copy", { page: "thankyou" });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = (platform: string) => {
    track("referral_share", { page: "thankyou", value: { platform } });
    const text = encodeURIComponent(`I just discovered I'm a ${chronotype} chronotype sleep quiz and finally sleep deeply: ${referralUrl}`);
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-96 h-96 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-blue w-72 h-72 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="font-display font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>
            Deep Sleep Reset
          </span>
        </div>
      </div>

      <div className="relative z-10 container max-w-lg mx-auto py-8">

        {/* Success card */}
        <div className="glass-card rounded-3xl p-8 mb-8 text-center"
          style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="text-6xl mb-4 animate-float">{icon}</div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: "oklch(0.55 0.18 145 / 0.15)", border: "1px solid oklch(0.55 0.18 145 / 0.3)" }}>
            
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
            You're All Set, {chronotype}!
          </h1>
          <p className="text-sm mb-4" style={{ color: "oklch(0.60 0.04 265)" }}>
            Your personalized <strong style={{ color: "oklch(0.82 0.16 65)" }}>{chronotype} Deep Sleep Protocol</strong> is on its way to your inbox. Check your email for the download link.
          </p>
          <div className="rounded-xl p-4 mb-4"
            style={{ background: "oklch(0.55 0.18 145 / 0.08)", border: "1px solid oklch(0.55 0.18 145 / 0.2)" }}>
            <p className="text-xs font-semibold" style={{ color: "oklch(0.65 0.18 145)" }}>
              Check your inbox — download link sent instantly
            </p>
          </div>
          <p className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>
            Didn't receive it? Check your spam folder or contact support.
          </p>
        </div>

        {/* What to do next */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-base mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            🗓️ Your 7-Night Plan Starts Tonight
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { night: "Night 1", action: "Read your protocol and set your new sleep schedule" },
              { night: "Night 2–3", action: "Implement your chronotype wind-down ritual" },
              { night: "Night 4–5", action: "Activate deep sleep triggers from the audio guide" },
              { night: "Night 6–7", action: "Full protocol in place — track your results" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "oklch(0.78 0.18 65 / 0.15)", color: "oklch(0.82 0.16 65)" }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>{step.night}</p>
                  <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{step.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review prompt (appears after 3s) */}
        {showReview && (
          <div className="glass-card rounded-2xl p-6 mb-6 animate-reveal"
            style={{ border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "oklch(0.95 0.01 265)" }}>
              How was your experience so far?
            </h3>
            <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>
              Your feedback helps us improve the protocol for other {chronotype}s.
            </p>
            <div className="flex gap-2 justify-center mb-3">
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setRating(i)}
                  className="transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${i <= rating ? "fill-current" : ""}`}
                    style={{ color: i <= rating ? "oklch(0.82 0.16 65)" : "oklch(0.30 0.04 265)" }} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center">
                <p className="text-xs mb-3" style={{ color: "oklch(0.55 0.04 265)" }}>
                  {rating === 5 ? "🎉 Amazing! Thank you so much!" :
                   rating >= 3 ? "Thanks for the feedback!" :
                   "We're sorry to hear that — we'll do better!"}
                </p>
                <a href={`/feedback?rating=${rating}`}
                  className="inline-block rounded-xl px-5 py-2.5 text-xs font-bold"
                  style={{ background: "oklch(0.78 0.18 65 / 0.15)", border: "1px solid oklch(0.78 0.18 65 / 0.3)", color: "oklch(0.82 0.16 65)" }}>
                  Share full feedback &amp; claim your reward →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Premium upsell reveal (appears after 8s) */}
        {showPremium && (
          <div className="glass-card rounded-2xl p-6 mb-6 animate-reveal"
            style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
            <div className="badge-popular mb-3">Exclusive for Protocol Owners</div>
            <h3 className="font-bold text-base mb-2" style={{ color: "oklch(0.82 0.16 65)" }}>
              👑 Upgrade to Sleep Optimizer Membership
            </h3>
            <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>
              Get monthly new chronotype protocols, live Q&As with sleep experts, and access to our private community — all for less than a coffee per week.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$47/mo</span>
              <span className="font-black text-2xl" style={{ color: "oklch(0.82 0.16 65)" }}>$8/mo</span>
              <div className="badge-popular">83% OFF</div>
            </div>
            <button
              onClick={() => { track("premium_upsell_click", { page: "thankyou" }); window.location.href = `/upsell3?chronotype=${chronotype}`; }}
              className="w-full cta-gold cta-shimmer rounded-xl py-3 text-sm flex items-center justify-center gap-2">
              Join Sleep Optimizer — $8/mo
            </button>
          </div>
        )}

        {/* Referral program */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-base mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
            Share & Help a Friend Sleep Better
          </h3>
          <p className="text-xs mb-4" style={{ color: "oklch(0.55 0.04 265)" }}>
            Know someone who struggles with sleep? Share your referral link — they get the quiz for free and you help them discover their chronotype.
          </p>

          {/* Copy link */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 rounded-lg px-3 py-2 text-xs font-mono truncate"
              style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.78 0.18 65 / 0.15)", color: "oklch(0.55 0.04 265)" }}>
              {referralUrl}
            </div>
            <button onClick={handleCopyLink}
              className="rounded-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
              style={{ background: "oklch(0.78 0.18 65 / 0.15)", border: "1px solid oklch(0.78 0.18 65 / 0.3)", color: "oklch(0.82 0.16 65)" }}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Social share buttons */}
          <div className="flex gap-2">
            <button onClick={() => handleShare("facebook")}
              className="flex-1 rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: "oklch(0.45 0.18 265 / 0.15)", border: "1px solid oklch(0.45 0.18 265 / 0.3)", color: "oklch(0.65 0.18 265)" }}>
              <Share2 className="w-3.5 h-3.5" />
              Facebook
            </button>
            <button onClick={() => handleShare("twitter")}
              className="flex-1 rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: "oklch(0.55 0.18 220 / 0.15)", border: "1px solid oklch(0.55 0.18 220 / 0.3)", color: "oklch(0.65 0.18 220)" }}>
              <Share2 className="w-3.5 h-3.5" />
              X / Twitter
            </button>
            <button onClick={() => handleShare("whatsapp")}
              className="flex-1 rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: "oklch(0.55 0.18 145 / 0.15)", border: "1px solid oklch(0.55 0.18 145 / 0.3)", color: "oklch(0.65 0.18 145)" }}>
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center" style={{ color: "oklch(0.35 0.04 265)" }}>
          Questions? Email us at support@deep-sleep-reset.com
        </p>
      </div>
    </div>
  );
}
