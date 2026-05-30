import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

export default function LeadMagnet() {
  const [, navigate] = useLocation();
  const { lang } = useI18n();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Subscribe to newsletter
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail("");
        // Download PDF tips
        const link = document.createElement('a');
        link.href = '/api/download/free-tips-pdf';
        link.download = 'free-sleep-tips.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: "oklch(0.78 0.18 65 / 0.1)" }}>
        <div className="container py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "oklch(0.50 0.04 265)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-lg font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>
            {lang === "cs" ? "Bezplatné Tipy" : "Free Sleep Tips"}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container py-12 flex flex-col items-center justify-center max-w-md mx-auto">
        {isSubmitted ? (
          // Success state
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto" style={{ color: "oklch(0.78 0.18 65)" }} />
            <h2 className="text-2xl font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>
              {lang === "cs" ? "Děkujeme!" : "Thank You!"}
            </h2>
            <p style={{ color: "oklch(0.50 0.04 265)" }}>
              {lang === "cs"
                ? "Tvůj PDF se stahuje... Zkontroluj také svůj email!"
                : "Your PDF is downloading... Check your email too!"}
            </p>
          </div>
        ) : (
          // Form state
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>
                {lang === "cs" ? "7 Bezplatných Tipů na Spánek" : "7 Free Sleep Tips"}
              </h2>
              <p style={{ color: "oklch(0.50 0.04 265)" }}>
                {lang === "cs"
                  ? "Vědecky ověřené techniky pro lepší spánek bez léků"
                  : "Science-backed techniques for better sleep without pills"}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                lang === "cs" ? "✓ Okamžité tipy" : "✓ Instant tips",
                lang === "cs" ? "✓ Bez spamu" : "✓ No spam",
                lang === "cs" ? "✓ Bezplatné navždy" : "✓ Free forever",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: "oklch(0.78 0.18 65)" }} />
                  <span style={{ color: "oklch(0.50 0.04 265)" }}>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder={lang === "cs" ? "Tvůj email..." : "Your email..."}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border"
                style={{
                  background: "oklch(0.10 0.03 255)",
                  borderColor: "oklch(0.78 0.18 65 / 0.2)",
                  color: "oklch(0.95 0.01 265)",
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "oklch(0.78 0.18 65)",
                  color: "oklch(0.07 0.025 255)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {lang === "cs" ? "Odesílám..." : "Sending..."}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {lang === "cs" ? "Poslat mi tipy" : "Send me tips"}
                  </>
                )}
              </button>
            </form>

            {/* Secondary CTA */}
            <div className="pt-4 border-t" style={{ borderColor: "oklch(0.78 0.18 65 / 0.1)" }}>
              <p className="text-sm text-center mb-3" style={{ color: "oklch(0.50 0.04 265)" }}>
                {lang === "cs" ? "Chceš více?" : "Want more?"}
              </p>
              <button
                onClick={() => navigate("/order")}
                className="w-full py-3 rounded-lg font-semibold"
                style={{
                  background: "oklch(0.78 0.18 65 / 0.1)",
                  color: "oklch(0.78 0.18 65)",
                  border: "1px solid oklch(0.78 0.18 65 / 0.3)",
                }}
              >
                {lang === "cs" ? "Vyzkoušej za $1" : "Try for $1"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
