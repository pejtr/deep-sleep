import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { getUTMData } from "@/hooks/useSession";
import { trackInitiateCheckout } from "@/lib/conversionTracking";

interface CheckoutButtonProps {
  productId?: "main" | "entry" | "discount" | "oto1" | "oto2" | "subscription";
  /** When set, adds this product as a 2nd line item alongside the main product */
  includeUpsell?: "oto1" | "oto2";
  sessionId: string;
  email?: string;
  chronotype?: string;
  className?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export function CheckoutButton({
  productId = "main",
  includeUpsell,
  sessionId,
  email,
  chronotype,
  className = "",
  children,
  variant = "primary",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { currency, isLowTier } = useCurrency();

  const createSession = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to secure checkout...");
        // Open Stripe checkout in same tab for best mobile UX
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error("Checkout failed. Please try again.");
      console.error("[Checkout] Error:", err);
    },
  });

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    // Fire conversion tracking event on all platforms
    const priceMap: Record<string, number> = { entry: 1, main: 4, discount: 4, oto1: 17, oto2: 27, subscription: 8 };
    trackInitiateCheckout({
      value: priceMap[productId] || 4,
      productId,
      productName: `Deep Sleep Reset - ${productId}`,
    });
    const utm = getUTMData();
    createSession.mutate({
      productId,
      includeUpsell,
      sessionId,
      email,
      chronotype,
      currency: currency.code.toLowerCase(),
      isLowTier,
      origin: window.location.origin,
      ...utm,
    });
  };

  const baseClasses = "relative inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    ghost: "text-amber-400 hover:text-amber-300 underline underline-offset-2",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Preparing checkout...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
