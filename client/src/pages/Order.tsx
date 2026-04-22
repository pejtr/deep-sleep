import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Lock, Shield, Star, ArrowRight, Users, CreditCard } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import TrustBar from "@/components/TrustBar";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import { trpc } from "@/lib/trpc";
import { getSessionId, useTrackBehavior } from "@/hooks/useSession";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin";

const CHRONOTYPE_ICONS: Record<Chronotype, string> = {
  Lion: "🦁", Bear: "🐻", Wolf: "🐺", Dolphin: "🐬",
};

export default function Order() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const chronotype = (params.get("chronotype") ?? "Bear") as Chronotype;
  const icon = CHRONOTYPE_ICONS[chronotype] ?? "🐻";

  const [buyers] = useState(() => Math.floor(Math.random() * 15) + 8);
  const [viewers] = useState(() => Math.floor(Math.random() * 60) + 180);
  const [loading, setLoading] = useState(false);
  const { track } = useTrackBehavior();

  const orderMutation = trpc.orders.create.useMutation();

  useEffect(() => {
    track("page_view", { page: "order", value: { chronotype } });
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    track("checkout_click", { page: "order", element: "main_cta", value: { chronotype } });
    try {
      const result = await orderMutation.mutateAsync({
        sessionId: getSessionId(),
        productId: "main",
        chronotype,
      });
      // Redirect to Gumroad
      window.location.href = result.gumroadUrl;
    } catch (err) {
      console.error(err);
      // Fallback direct link
      window.location.href = "https://petrmatej.gumroad.com/l/fdtifc";
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-0" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Orbs */}
      <div className="orb orb-gold w-80 h-80 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-purple w-64 h-64 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      {/* Urgency banner */}
      <CountdownTimer variant="banner" label="Locked-in price expires in:" />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
          <span className="text-sm font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>
            Secure Checkout — Deep Sleep Reset
          </span>
        </div>
      </div>

      <div className="relative z-10 container max-w-lg mx-auto py-8">

        {/* Live FOMO indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
              <span className="font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>{buyers} people</span> bought in the last hour
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3" style={{ color: "oklch(0.50 0.04 265)" }} />
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
              <span className="font-semibold" style={{ color: "oklch(0.70 0.04 265)" }}>{viewers}</span> viewing this page
            </span>
          </div>
        </div>

        {/* Product card */}
        <div className="glass-card rounded-3xl p-8 mb-6 relative overflow-hidden"
          style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <div className="orb orb-gold w-40 h-40 opacity-10" style={{ top: "-20%", right: "-10%" }} />

          {/* Badge */}
          <div className="badge-popular mb-4">One-Time Special Price</div>

          {/* Product title */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="font-display font-bold text-xl" style={{ color: "oklch(0.95 0.01 265)" }}>
                {chronotype} Deep Sleep Protocol
              </h1>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>
                7-Night Personalized Sleep System
              </p>
            </div>
          </div>

          {/* What's included */}
          <div className="flex flex-col gap-2 mb-6">
            {[
              `${chronotype} Chronotype Sleep Guide (PDF)`,
              "7-Night Protocol Tracker & Schedule",
              `${chronotype}-Specific Wind-Down Ritual`,
              "Deep Sleep Trigger Audio (10 min)",
              "Lifetime access + future updates",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs flex-shrink-0" style={{ color: "oklch(0.78 0.18 65)" }}>✓</span>
                <span className="text-sm" style={{ color: "oklch(0.70 0.04 265)" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-base line-through" style={{ color: "oklch(0.40 0.04 265)" }}>$75</span>
            <span className="font-black text-5xl" style={{ color: "oklch(0.82 0.16 65)" }}>$5</span>
            <div>
              <div className="badge-popular">93% OFF</div>
              <p className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>One-time payment</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-6">
            <CountdownTimer variant="inline" label="Price locks in:" />
          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full cta-gold cta-shimmer rounded-2xl py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <Lock className="w-5 h-5" />
            <span>{loading ? "Redirecting..." : `Get My ${chronotype} Protocol — $5`}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Payment methods */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <CreditCard className="w-4 h-4" style={{ color: "oklch(0.40 0.04 265)" }} />
            <span className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>Visa · Mastercard · Apple Pay · Google Pay · PayPal</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: <Shield className="w-5 h-5" />, title: "30-Day Guarantee", desc: "Full refund, no questions" },
            { icon: <Lock className="w-5 h-5" />, title: "256-bit SSL", desc: "Bank-level security" },
            { icon: <Star className="w-5 h-5 fill-current" />, title: "4.9★ Rating", desc: "2,847 reviews" },
          ].map((badge, i) => (
            <div key={i} className="glass-card rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1.5" style={{ color: "oklch(0.78 0.18 65)" }}>
                {badge.icon}
              </div>
              <p className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>{badge.title}</p>
              <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>{badge.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="glass-card rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: "oklch(0.78 0.18 65 / 0.15)" }}>
              {icon}
            </div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3 h-3 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
                ))}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "oklch(0.65 0.04 265)" }}>
                "I was skeptical about a $5 guide but this completely changed how I sleep. The {chronotype} protocol is exactly what I needed — specific, actionable, and it actually works."
              </p>
              <p className="text-xs mt-1.5 font-semibold" style={{ color: "oklch(0.50 0.04 265)" }}>
                — Verified {chronotype} customer
              </p>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <TrustBar variant="compact" />

        {/* FAQ */}
        <div className="mt-8 space-y-3">
          {[
            { q: "How do I receive the protocol?", a: "Instantly after purchase — you'll get a download link via email and on the confirmation page." },
            { q: "What if it doesn't work for me?", a: "Full 30-day money-back guarantee. Email us and we'll refund you immediately, no questions asked." },
            { q: "Is this really just $5?", a: "Yes — this is a limited introductory price. We reserve the right to increase it at any time." },
          ].map((faq, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <p className="text-sm font-semibold mb-1" style={{ color: "oklch(0.82 0.16 65)" }}>Q: {faq.q}</p>
              <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.04 265)" }}>{faq.a}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Sticky mobile CTA */}
      <StickyMobileCTA
        label={`Get My ${chronotype} Protocol`}
        price="$5"
        onClick={handleCheckout}
      />

      {/* FOMO */}
      <LiveSalesNotification />
    </div>
  );
}
