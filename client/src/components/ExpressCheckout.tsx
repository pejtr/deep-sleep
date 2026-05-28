import { useState, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { getUTMData } from "@/hooks/useSession";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface ExpressCheckoutProps {
  productId?: "main" | "entry" | "oto1" | "oto2" | "subscription" | "discount" | "bump";
  /** When set, adds this product as a 2nd line item alongside the main product */
  includeUpsell?: "oto1" | "oto2" | "bump";
  sessionId: string;
  email?: string;
  chronotype?: string;
  amount: number; // USD amount (e.g. 5)
  label?: string;
}

function ExpressCheckoutInner({
  productId = "main",
  includeUpsell,
  sessionId,
  email,
  chronotype,
  amount,
  label,
}: ExpressCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { currency, isLowTier } = useCurrency();
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  const createSession = trpc.checkout.createSession.useMutation();

  const onConfirm = useCallback(async () => {
    if (!stripe || !elements || loading) return;
    setLoading(true);

    try {
      const utm = getUTMData();
      const affiliateRef = sessionStorage.getItem("affiliate_ref") || undefined;
      const result = await createSession.mutateAsync({
        productId,
        includeUpsell,
        sessionId,
        email,
        chronotype,
        currency: currency.code.toLowerCase(),
        isLowTier,
        origin: window.location.origin,
        affiliateRef,
        ...utm,
      });

      if (result.url) {
        toast.success("Redirecting to secure checkout...");
        window.location.href = result.url;
      } else {
        toast.error("Could not create checkout session. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("[ExpressCheckout] Error:", err);
      toast.error("Payment failed. Please try the card option below.");
      setLoading(false);
    }
  }, [stripe, elements, loading, productId, includeUpsell, sessionId, email, chronotype, currency, isLowTier, createSession]);

  // If ExpressCheckoutElement doesn't render any buttons (no wallets available),
  // it fires onReady but with no available payment methods. We detect this via
  // a timeout — if not ready after 3s, hide the component gracefully.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) {
        setAvailable(false);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [ready]);

  // If wallets are not available, don't render anything
  if (!available) return null;

  return (
    <div className="w-full">
      <ExpressCheckoutElement
        onConfirm={onConfirm}
        onReady={({ availablePaymentMethods }) => {
          // availablePaymentMethods tells us which wallets are available
          if (
            availablePaymentMethods &&
            !availablePaymentMethods.applePay &&
            !availablePaymentMethods.googlePay &&
            !availablePaymentMethods.link
          ) {
            // No wallets available — hide the component
            setAvailable(false);
            return;
          }
          setReady(true);
        }}
        options={{
          buttonType: {
            applePay: "buy",
            googlePay: "buy",
          },
          buttonTheme: {
            applePay: "black",
            googlePay: "black",
          },
          layout: {
            maxColumns: 3,
            maxRows: 1,
            overflow: "never",
          },
        }}
      />
      {!ready && available && (
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "oklch(0.78 0.18 65)", borderTopColor: "transparent" }} />
          <span className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>
            Loading express checkout...
          </span>
        </div>
      )}
    </div>
  );
}

export default function ExpressCheckout(props: ExpressCheckoutProps) {
  const { currency, getGeoPrice } = useCurrency();
  const geoPrice = getGeoPrice(props.amount);
  const [error, setError] = useState(false);

  // Stripe Elements requires amount in smallest currency unit
  const RATES: Record<string, number> = {
    usd: 1, eur: 0.853, gbp: 0.741, czk: 20.77, cad: 1.366,
    aud: 1.548, pln: 3.82, inr: 83.5, brl: 4.97, mxn: 17.15,
    chf: 0.899, sek: 10.32, nok: 10.58, dkk: 6.36, sgd: 1.34,
    nzd: 1.67, zar: 18.63, jpy: 154.2,
  };
  const zeroDecimal = ["jpy"];
  const currCode = currency.code.toLowerCase();
  const rate = RATES[currCode] ?? 1;
  const amountInSmallest = zeroDecimal.includes(currCode)
    ? Math.round(geoPrice * rate)
    : Math.round(geoPrice * 100 * rate);

  // Don't render if Stripe key is missing
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) return null;
  // Don't render if amount is too low for Stripe
  if (amountInSmallest < 50) return null;
  // Don't render on error
  if (error) return null;

  const isSubscription = props.productId === "subscription";

  return (
    <div className="w-full">
      <Elements
        stripe={stripePromise}
        options={isSubscription ? {
          mode: "subscription" as const,
          amount: Math.max(amountInSmallest, 50),
          currency: currCode,
          appearance: {
            theme: "night" as const,
            variables: {
              colorPrimary: "#c9a84c",
              colorBackground: "#0f1729",
              colorText: "#e0ddd5",
              borderRadius: "12px",
            },
          },
        } : {
          mode: "payment" as const,
          amount: Math.max(amountInSmallest, 50),
          currency: currCode,
          appearance: {
            theme: "night" as const,
            variables: {
              colorPrimary: "#c9a84c",
              colorBackground: "#0f1729",
              colorText: "#e0ddd5",
              borderRadius: "12px",
            },
          },
        }}
      >
        <ExpressCheckoutInner {...props} />
      </Elements>
    </div>
  );
}
