import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior, getUTMData } from "@/hooks/useSession";
import { ArrowRight, Mail, Download, Check, Moon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackPurchase } from "@/lib/conversionTracking";

// Upsell sequence: main → upsell/1, oto1 → upsell/2, oto2 → upsell/3, subscription → thankyou
const NEXT_STEP: Record<string, string> = {
  entry: "/upsell/entry",
  main: "/upsell/1",
  oto1: "/upsell/2",
  oto2: "/upsell/3",
  subscription: "/thankyou",
  discount: "/upsell/1",
};

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const { track } = useTrackBehavior();
  const [productId, setProductId] = useState("main");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [chronotype, setChronotype] = useState("Bear");
  const [countdown, setCountdown] = useState(5);
  const [showReviewPrompt, setShowReviewPrompt] = useState(true);

  const captureLead = trpc.leads.capture.useMutation({
    onSuccess: () => {
      setEmailSubmitted(true);
      toast.success("Protocol sent to your inbox!");
    },
    onError: () => toast.error("Couldn't save email. Please try again."),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("product_id") ?? params.get("productId") ?? "main";
    const oid = params.get("order_id");
    const em = params.get("email");
    const ct = params.get("chronotype") ?? "Bear";
    setProductId(pid);
    setOrderId(oid);
    setChronotype(ct);
    if (em && em.includes("@")) {
      setEmail(em);
      captureLead.mutate({ email: em, sessionId: getSessionId(), source: "stripe_success" });
    }
    // Fire purchase conversion on all platforms
    const priceMap: Record<string, number> = { entry: 1, main: 4, discount: 4, bump: 11, oto1: 37, oto2: 19, subscription: 8 };
    const purchaseValue = priceMap[pid] || 4;
    const utmData = getUTMData();
    trackPurchase({
      value: purchaseValue,
      orderId: oid ?? undefined,
      productId: pid,
      productName: `Deep Sleep Reset - ${pid}`,
      email: em ?? undefined,
    });
    // Internal behavior tracking with UTM attribution
    track("purchase", {
      page: "checkout_success",
      value: {
        product_id: pid,
        order_id: oid,
        value: purchaseValue,
        utm_source: utmData?.utmSource,
        utm_campaign: utmData?.utmCampaign,
        utm_medium: utmData?.utmMedium,
      },
    });
  }, []);

  // NO auto-redirect — user must click to proceed to upsell
  // This prevents the jarring experience of being redirected before reading

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    captureLead.mutate({ email, sessionId: getSessionId(), source: "checkout_success" });
  };

  const goToNextStep = () => {
    const nextStep = NEXT_STEP[productId] ?? "/thankyou";
    navigate(`${nextStep}?chronotype=${chronotype}`);
  };

  // Product-specific success messages
  const successMessages: Record<string, { title: string; subtitle: string; emoji: string }> = {
    main: { title: "Payment Successful!", subtitle: "Your 7-Night Deep Sleep Reset is ready", emoji: "🎉" },
    oto1: { title: "Chronotype Toolkit Added!", subtitle: "Your personalized optimizer is unlocked", emoji: "" },
    oto2: { title: "ASMR Pack Added!", subtitle: "7 premium sleep tracks are yours", emoji: "" },
    subscription: { title: "Welcome to Premium!", subtitle: "Your Sleep Optimizer membership is active", emoji: "👑" },
    discount: { title: "Payment Successful!", subtitle: "Your Deep Sleep Reset is ready", emoji: "🎉" },
  };

  const msg = successMessages[productId] ?? successMessages.main;

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: Math.random() * 2 + 1 + "px", height: Math.random() * 2 + 1 + "px", top: Math.random() * 100 + "%", left: Math.random() * 100 + "%", opacity: Math.random() * 0.6 + 0.2 }} />
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">{msg.emoji} {msg.title}</h1>
        <p className="text-xl text-amber-300 font-semibold mb-2">{msg.subtitle}</p>

        {/* Show protocol access only for main/discount purchases */}
        {(productId === "main" || productId === "discount") && (
          <>
            <p className="text-white/60 mb-6">Your protocol is ready. Start tonight and wake up refreshed.</p>

            {/* Primary CTA — View Protocol */}
            <Link href="/protocol"
              className="flex items-center justify-center gap-2 w-full py-5 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xl rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-3">
              <Moon className="w-6 h-6" />
              Open Your 7-Night Protocol
            </Link>

            {/* PDF Download */}
            <a href="/api/protocol/download?lang=en" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 border border-amber-500/40 hover:border-amber-500/70 text-amber-300 hover:text-amber-200 font-semibold text-sm rounded-xl transition-all mb-6">
              <Download className="w-4 h-4" />
              Download PDF (offline copy)
            </a>
          </>
        )}

        {/* Email capture for main purchase */}
        {(productId === "main" || productId === "discount") && !emailSubmitted ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-amber-400" />
              <p className="text-white font-bold">Get it in your inbox + 7-night reminders</p>
            </div>
            <p className="text-white/50 text-sm mb-4">We'll send the protocol + a daily reminder for each night.</p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60" />
              <button type="submit" disabled={captureLead.isPending}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all disabled:opacity-60">
                {captureLead.isPending ? "..." : "Send"}
              </button>
            </form>
          </div>
        ) : (productId === "main" || productId === "discount") && emailSubmitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm font-semibold">Protocol sent to {email} — check your inbox!</p>
          </div>
        ) : null}

        {/* Review Prompt */}
        {showReviewPrompt && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
            <p className="text-blue-300 text-sm font-semibold mb-3">💬 Help other sleep-deprived people</p>
            <p className="text-white/70 text-xs mb-3">Share your experience with Deep Sleep Reset. Your review helps others make the right decision.</p>
            <div className="flex gap-2">
              <button onClick={() => {
                const reviewUrl = 'https://deep-sleep-reset.com/reviews';
                window.open(reviewUrl, '_blank');
                toast.success('Thanks for reviewing!');
              }}
                className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg text-xs transition-all">
                Leave a Review
              </button>
              <button onClick={() => setShowReviewPrompt(false)}
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white/70 font-semibold rounded-lg text-xs transition-all">
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* One-time upsell offer — user must click, NO auto-redirect */}
        {NEXT_STEP[productId] && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <p className="text-amber-300 font-bold text-lg">🎁 Exclusive One-Time Offer Unlocked</p>
            </div>
            <p className="text-white/60 text-sm mb-4">
              {productId === "main" || productId === "discount"
                ? "Because you just purchased the 7-Night Protocol, you've unlocked a special upgrade offer — available only right now."
                : productId === "oto1"
                ? "Great choice! You've unlocked another exclusive deal that pairs perfectly with your purchase."
                : "Almost done! One more thing that will supercharge your sleep results."
              }
            </p>
            <button onClick={goToNextStep}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-lg rounded-2xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
              <span>See My Exclusive Offer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-white/40 text-xs mt-3 text-center">
              This offer is only available on this page — it disappears when you leave.
            </p>
          </div>
        )}

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-3 text-white/50 text-sm mb-6">
          <span></span>
          <span>30-day money-back guarantee · No questions asked</span>
        </div>

        {orderId && <p className="text-white/30 text-xs mb-6">Order #{orderId}</p>}

        <Link href="/" className="text-amber-400/60 hover:text-amber-400 text-sm transition-colors">
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}
