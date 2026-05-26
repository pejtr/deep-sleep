import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Download, Clock } from "lucide-react";

export default function Bridge() {
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    document.title = "Your Order is Confirmed — Deep Sleep Reset";
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/upsell1");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ background: "oklch(0.30 0.12 145 / 0.2)", border: "2px solid oklch(0.60 0.18 145)" }}>
          <CheckCircle className="w-10 h-10" style={{ color: "oklch(0.70 0.18 145)" }} />
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-3xl md:text-4xl leading-tight" style={{ color: "oklch(0.95 0.01 265)" }}>
          Your Sleep Reset is Ready
        </h1>

        <p className="text-lg" style={{ color: "oklch(0.70 0.04 265)" }}>
          Your 7-Night Deep Sleep Protocol has been unlocked. Check your email for access details.
        </p>

        {/* What's included */}
        <div className="text-left space-y-4 p-6 rounded-xl" style={{ background: "oklch(0.14 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
          <h3 className="font-semibold text-sm uppercase tracking-wider" style={{ color: "oklch(0.82 0.16 65)" }}>What you just unlocked:</h3>
          {[
            "7-Night Deep Sleep Protocol (personalized to your chronotype)",
            "3 AM Rescue Technique (use tonight)",
            "Sleep Environment Checklist",
            "Nervous System Reset Audio (5 min)",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <Download className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.70 0.18 145)" }} />
              <p className="text-sm" style={{ color: "oklch(0.80 0.02 265)" }}>{item}</p>
            </div>
          ))}
        </div>

        {/* Countdown to upsell */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2" style={{ color: "oklch(0.50 0.04 265)" }}>
            <Clock className="w-4 h-4" />
            <span className="text-sm">One-time offer loading in {countdown}s...</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.20 0.03 265)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${((8 - countdown) / 8) * 100}%`,
                background: "oklch(0.82 0.16 65)",
              }}
            />
          </div>
        </div>

        {/* Skip link */}
        <button
          onClick={() => navigate("/upsell1")}
          className="inline-flex items-center gap-2 text-sm cursor-pointer"
          style={{ color: "oklch(0.60 0.04 265)" }}
        >
          Continue to your special offer <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
