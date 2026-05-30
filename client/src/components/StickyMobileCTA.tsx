import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Lock, Shield, Zap, CreditCard } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

interface Props {
  label?: string;
  price?: string;
  onClick?: () => void;
  href?: string;
  show?: boolean;
  onSelectProduct?: (productId: string) => void;
}

export default function StickyMobileCTA({
  label = "Get Instant Access",
  price = "$1",
  onClick,
  href,
  show = true,
  onSelectProduct,
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
    if (onSelectProduct) onSelectProduct('entry');
    if (onClick) onClick();
    else if (href) window.location.href = href;
  };

  return (
    <>
      {/* ── Sticky TOP countdown bar — always visible, above everything ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: "oklch(0.07 0.025 255 / 0.97)",
          borderBottom: "1px solid oklch(0.78 0.18 65 / 0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <CountdownTimer variant="banner" label="Offer expires:" />
      </div>

      {/* ── Sticky BOTTOM CTA ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div
          className="px-4 pb-4 pt-2"
          style={{
            background: "oklch(0.07 0.025 255)",
            borderTop: "1px solid oklch(0.78 0.18 65 / 0.1)",
          }}
        >
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
              onClick={() => navigate("/lead-magnet")}
              className="px-4 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              style={{
                background: "oklch(0.50 0.04 265)",
                color: "oklch(0.95 0.01 265)",
              }}
              title="Get Free Tips"
            >
              GET FREE TIPS
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.50 0.04 265)" }}>
              <Shield className="w-3 h-3" /> Secure
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.50 0.04 265)" }}>
              <Zap className="w-3 h-3" /> Instant access
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: "oklch(0.50 0.04 265)" }}>
              <CreditCard className="w-3 h-3" /> All cards
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
