import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Lock } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

interface Props {
  label?: string;
  price?: string;
  onClick?: () => void;
  href?: string;
  show?: boolean;
}

export default function StickyMobileCTA({
  label = "Get Instant Access",
  price = "$5",
  onClick,
  href,
  show = true,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show || !visible) return null;

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) window.location.href = href;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Countdown strip */}
      <CountdownTimer variant="banner" label="Offer expires:" />

      {/* CTA button */}
      <div className="px-4 pb-4 pt-2"
        style={{ background: "oklch(0.07 0.025 255)", borderTop: "1px solid oklch(0.78 0.18 65 / 0.1)" }}>
        <div className="flex gap-2">
          <button
            onClick={handleClick}
            className="flex-1 cta-gold cta-shimmer rounded-xl py-4 flex items-center justify-center gap-2 text-base"
          >
            <Lock className="w-4 h-4" />
            <span>{label}</span>
            <span className="font-black">— Only {price}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/quiz')}
            className="px-4 py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
            title="Start Quiz"
          >
            📝
          </button>
        </div>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>🔒 Secure</span>
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>✅ Instant access</span>
          <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>💳 All cards</span>
        </div>
      </div>
    </div>
  );
}
