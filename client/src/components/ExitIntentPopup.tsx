import { useEffect, useState, useRef } from "react";
import { X, Moon, Star, Shield, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/hooks/useSession";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export default function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currency, isLowTier, formatPrice } = useCurrency();

  const checkoutMutation = trpc.checkout.createSession.useMutation();
  const leadMutation = trpc.leads.capture.useMutation();

  useEffect(() => {
    // Don't show on order/checkout pages
    if (window.location.pathname.startsWith("/order") || window.location.pathname.startsWith("/checkout")) return;

    const alreadyShown = sessionStorage.getItem("exit_popup_shown");
    if (alreadyShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !shown) {
        // Delay slightly to avoid false triggers
        timerRef.current = setTimeout(() => {
          setVisible(true);
          setShown(true);
          sessionStorage.setItem("exit_popup_shown", "1");
        }, 200);
      }
    };

    // Also trigger after 45 seconds of inactivity on mobile
    const mobileTimer = setTimeout(() => {
      if (!shown && window.innerWidth < 768) {
        setVisible(true);
        setShown(true);
        sessionStorage.setItem("exit_popup_shown", "1");
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(mobileTimer);
    };
  }, [shown]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      // Capture email lead if provided
      if (email && email.includes("@")) {
        await leadMutation.mutateAsync({
          email,
          sessionId,
          source: "exit_popup",
        });
      }
      const result = await checkoutMutation.mutateAsync({
        productId: "discount",
        sessionId,
        email: email || undefined,
        currency: currency.code.toLowerCase(),
        isLowTier,
        origin: window.location.origin,
      });
      if (result.url) {
        window.open(result.url, "_blank");
        handleClose();
      }
    } catch (err) {
      console.error("Exit popup checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "oklch(0.05 0.02 255 / 0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.09 0.025 255)",
          border: "1px solid oklch(0.78 0.18 65 / 0.4)",
          boxShadow: "0 0 60px oklch(0.78 0.18 65 / 0.15)",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full transition-colors"
          style={{ background: "oklch(0.15 0.02 255)", color: "oklch(0.55 0.04 265)" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header stripe */}
        <div
          className="px-6 py-3 text-center text-xs font-bold tracking-widest uppercase"
          style={{ background: "oklch(0.78 0.18 65 / 0.15)", color: "oklch(0.82 0.16 65)" }}
        >
          Wait — Special One-Time Offer
        </div>

        <div className="px-6 py-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.78 0.18 65 / 0.1)", border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}
            >
              <Moon className="w-7 h-7" style={{ color: "oklch(0.82 0.16 65)" }} />
            </div>
          </div>

          {/* Headline */}
          <h2
            className="font-display font-bold text-2xl text-center mb-2"
            style={{ color: "oklch(0.95 0.01 265)" }}
          >
            Wait — One Last Thing
          </h2>
          <p className="text-center text-sm mb-1 font-medium" style={{ color: "oklch(0.82 0.16 65)" }}>
            Tonight is another bad night... unless you act now.
          </p>
          <p className="text-center text-sm mb-5" style={{ color: "oklch(0.65 0.04 265)" }}>
            We're cutting the price to <strong style={{ color: "oklch(0.82 0.16 65)" }}>$4</strong> — less than a coffee — so you have zero excuse.
          </p>

          {/* Price callout */}
          <div
            className="rounded-xl p-4 mb-5 text-center"
            style={{ background: "oklch(0.78 0.18 65 / 0.08)", border: "1px solid oklch(0.78 0.18 65 / 0.25)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "oklch(0.82 0.16 65)" }}>
              Exit Discount — Today Only
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl line-through" style={{ color: "oklch(0.45 0.04 265)" }}>{formatPrice(47)}</span>
              <span className="text-4xl font-display font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>{formatPrice(4)}</span>
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: "oklch(0.78 0.18 65 / 0.2)", color: "oklch(0.82 0.16 65)" }}
              >
                SAVE 93%
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: "oklch(0.55 0.04 265)" }}>
              Full 7-Night Protocol · Instant Access · 30-Day Guarantee
            </p>
          </div>

          {/* Social proof mini */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
            ))}
            <span className="text-xs ml-1" style={{ color: "oklch(0.55 0.04 265)" }}>Rated 4.8/5 by our users</span>
          </div>

          {/* Email input (optional) */}
          <input
            type="email"
            placeholder="Your email (optional — for access link)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm mb-3 outline-none"
            style={{
              background: "oklch(0.13 0.025 255)",
              border: "1px solid oklch(0.25 0.03 265)",
              color: "oklch(0.90 0.01 265)",
            }}
          />

          {/* CTA */}
          <button
            onClick={handleClaim}
            disabled={loading}
            className="w-full rounded-xl py-4 font-bold text-base transition-all"
            style={{
              background: loading ? "oklch(0.55 0.12 65)" : "linear-gradient(135deg, oklch(0.78 0.18 65), oklch(0.65 0.20 55))",
              color: "oklch(0.10 0.02 255)",
              boxShadow: loading ? "none" : "0 4px 24px oklch(0.78 0.18 65 / 0.45)",
              fontSize: "1.05rem",
            }}
          >
            {loading ? "Opening checkout..." : `🔒 Try for $1 — Only $1`}
          </button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
              <Shield className="w-3 h-3" />
              <span>30-day guarantee</span>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
              <Zap className="w-3 h-3" />
              <span>Instant access</span>
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleClose}
            className="w-full text-center text-xs mt-3 py-1"
            style={{ color: "oklch(0.40 0.04 265)" }}
          >
            No thanks, I'll keep struggling with sleep
          </button>
        </div>
      </div>
    </div>
  );
}
