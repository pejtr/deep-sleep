/**
 * NewsletterSection — Nedvěd funnel: databáze kontaktů
 * Nabídka: 10% sleva na první objednávku + FREE e-book
 * Bulvární titulky: SOK + ZÁVIST pattern
 * Mikro-závazek: email → 10% sleva → nákup
 */
import { useState } from "react";
import { Mail, Zap, BookOpen, Shield, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/hooks/useSession";
import { useLocation } from "wouter";

const BENEFITS = [
  "FREE: 7 Sleep Hacks PDF guide (instant download)",
  "10% discount on your first order",
  "Weekly sleep science tips (not available anywhere else)",
  "Early access to new protocols and tools",
];

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const leadMutation = trpc.leads.capture.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await leadMutation.mutateAsync({
        email,
        sessionId: getSessionId(),
        source: "newsletter",
        referrer: document.referrer || undefined,
        landingPage: window.location.pathname,
        language: navigator.language,
        browserLang: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      localStorage.setItem("lead_magnet_captured", "1");
      setSubmitted(true);
      // After 2s → redirect to UJN
      setTimeout(() => {
        navigate("/special-offer?source=newsletter&email=" + encodeURIComponent(email));
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 container py-14">
      <div
        className="max-w-2xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.10 0.03 255) 0%, oklch(0.08 0.025 260) 100%)",
          border: "1px solid oklch(0.78 0.18 65 / 0.30)",
          boxShadow: "0 0 60px oklch(0.78 0.18 65 / 0.08)",
        }}
      >
        {/* Top badge */}
        <div
          className="px-6 py-2.5 text-center text-xs font-bold tracking-widest uppercase"
          style={{ background: "oklch(0.78 0.18 65 / 0.10)", borderBottom: "1px solid oklch(0.78 0.18 65 / 0.20)", color: "oklch(0.82 0.16 65)" }}
        >
          Join 12,847 People Who Sleep Better Every Night
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "2px solid oklch(0.78 0.18 65 / 0.50)", boxShadow: "0 4px 16px oklch(0.78 0.18 65 / 0.15)" }}>
              <img src="/manus-storage/promo-sleep-model_3a2de508.webp" alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              {/* Bulvární headline — ZÁVIST pattern */}
              <h2
                className="font-display font-bold text-xl md:text-2xl leading-tight mb-1"
                style={{ color: "oklch(0.95 0.01 265)" }}
              >
                The Sleep Tips Top Athletes Get —<br />
                <span style={{ color: "oklch(0.82 0.16 65)" }}>Now Free for You</span>
              </h2>
              <p className="text-sm" style={{ color: "oklch(0.58 0.04 265)" }}>
                Plus: instant 10% off your first order
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2 mb-5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.82 0.16 65)" }} />
                <span className="text-sm" style={{ color: "oklch(0.72 0.04 265)" }}>{b}</span>
              </div>
            ))}
          </div>

          {submitted ? (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "oklch(0.65 0.18 145 / 0.08)", border: "1px solid oklch(0.65 0.18 145 / 0.25)" }}
            >
              <p className="font-bold text-base mb-1" style={{ color: "oklch(0.72 0.16 145)" }}>
                You're in! Check your inbox.
              </p>
              <p className="text-sm" style={{ color: "oklch(0.55 0.04 265)" }}>
                Preparing your special welcome offer...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your best email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: "oklch(0.13 0.025 255)",
                  border: `1px solid ${error ? "oklch(0.65 0.20 25)" : "oklch(0.25 0.03 265)"}`,
                  color: "oklch(0.92 0.01 265)",
                }}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl px-5 py-3 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 justify-center"
                style={{
                  background: loading
                    ? "oklch(0.55 0.12 65)"
                    : "linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.68 0.22 55))",
                  color: "oklch(0.08 0.02 255)",
                  boxShadow: loading ? "none" : "0 4px 16px oklch(0.78 0.18 65 / 0.35)",
                }}
              >
                {loading ? "..." : <><Zap className="w-4 h-4" /> Get FREE Tips</>}
              </button>
            </form>
          )}

          {error && <p className="text-xs mt-2" style={{ color: "oklch(0.65 0.20 25)" }}>{error}</p>}

          {/* Trust signals */}
          <div className="flex items-center gap-5 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.38 0.03 265)" }}>
              <Shield className="w-3 h-3" />
              <span>No spam. Unsubscribe anytime.</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.38 0.03 265)" }}>
              <BookOpen className="w-3 h-3" />
              <span>Free e-book included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
