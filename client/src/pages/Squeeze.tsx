import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";
import { trackLead } from "@/lib/conversionTracking";

export default function Squeeze() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track affiliate click if ?ref= is present
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("affiliate_ref", ref);
      trackClickMutation.mutate({ refCode: ref, landingUrl: window.location.pathname });
    }
  }, []);
  const [error, setError] = useState("");
  const tracked = useRef(false);

  const { track } = useTrackBehavior();
  const subscribeMutation = trpc.leads.capture.useMutation();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("page_view", { page: "squeeze" });
    document.title = "Free Sleep Score Quiz — Deep Sleep Reset";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      await subscribeMutation.mutateAsync({
        email,
        source: "squeeze",
      });
      track("lead_captured", { page: "squeeze", value: email });
      trackLead({ email });
      // Redirect to quiz after capture
      navigate("/quiz");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20" style={{ background: "oklch(0.55 0.18 265)" }} />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: "oklch(0.82 0.16 65 / 0.1)", color: "oklch(0.82 0.16 65)", border: "1px solid oklch(0.82 0.16 65 / 0.3)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "oklch(0.82 0.16 65)" }} />
          FREE · 2-Minute Quiz
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-3xl md:text-5xl leading-tight" style={{ color: "oklch(0.95 0.01 265)" }}>
          What's Your
          <br />
          <span className="text-gradient-gold-italic">Sleep Chronotype?</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl leading-relaxed max-w-md mx-auto" style={{ color: "oklch(0.70 0.04 265)" }}>
          Take the free 2-minute quiz and get your personalized sleep score — plus a custom protocol based on your chronotype.
        </p>

        {/* What you'll discover */}
        <div className="text-left space-y-3 max-w-sm mx-auto">
          {[
            "Your exact chronotype (Lion, Bear, Wolf, or Dolphin)",
            "Why you wake up at 3 AM (and how to stop it)",
            "Your personalized sleep window for maximum deep sleep",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg mt-0.5" style={{ color: "oklch(0.82 0.16 65)" }}>&#10003;</span>
              <p className="text-sm" style={{ color: "oklch(0.80 0.02 265)" }}>{item}</p>
            </div>
          ))}
        </div>

        {/* Email capture form */}
        <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for results..."
            className="w-full px-5 py-4 rounded-xl text-base outline-none transition-all focus:ring-2"
            style={{
              background: "oklch(0.14 0.03 265)",
              color: "oklch(0.95 0.01 265)",
              border: "1px solid oklch(0.30 0.04 265)",
              // @ts-ignore
              "--tw-ring-color": "oklch(0.82 0.16 65 / 0.5)",
            }}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cta-gold cta-shimmer rounded-xl px-6 py-4 text-lg font-bold cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Starting..." : "START MY FREE SLEEP QUIZ →"}
          </button>
        </form>

        {/* Trust line */}
        <p className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>
          No spam. Unsubscribe anytime. Your results are 100% private.
        </p>

        {/* Skip link */}
        <button
          onClick={() => navigate("/quiz")}
          className="text-xs underline cursor-pointer"
          style={{ color: "oklch(0.50 0.04 265)" }}
        >
          Skip and take the quiz without email
        </button>
      </div>
    </div>
  );
}
