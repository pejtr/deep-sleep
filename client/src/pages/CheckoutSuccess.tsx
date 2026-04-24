import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/hooks/useSession";
import { CheckoutButton } from "@/components/CheckoutButton";
import { ArrowRight, Mail, Download, Check } from "lucide-react";
import { toast } from "sonner";

const DOWNLOAD_LINKS: Record<string, string> = {
  main: "https://deepsleepreset.gumroad.com/l/fdtifc",
  oto1: "https://deepsleepreset.gumroad.com/l/fdtifc", // fallback
  oto2: "https://deepsleepreset.gumroad.com/l/fdtifc",
  oto3: "https://deepsleepreset.gumroad.com/l/fdtifc",
};

export default function CheckoutSuccess() {
  const [productId, setProductId] = useState("main");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const captureLead = trpc.leads.capture.useMutation({
    onSuccess: () => {
      setEmailSubmitted(true);
      toast.success("✅ Protocol sent to your inbox!");
    },
    onError: () => toast.error("Couldn't save email. Please try again."),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("product_id") ?? "main";
    const oid = params.get("order_id");
    const em = params.get("email");
    setProductId(pid);
    setOrderId(oid);
    // Auto-capture email if Stripe passes it via success URL
    if (em && em.includes("@")) {
      setEmail(em);
      captureLead.mutate({ email: em, sessionId: getSessionId(), source: "stripe_success" });
    }
  }, []);

  const downloadUrl = DOWNLOAD_LINKS[productId] ?? DOWNLOAD_LINKS.main;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    captureLead.mutate({ email, sessionId: getSessionId(), source: "checkout_success" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">
          🎉 Payment Successful!
        </h1>
        <p className="text-xl text-amber-300 font-semibold mb-2">
          Welcome to Deep Sleep Reset
        </p>
        <p className="text-white/60 mb-8">
          Your 7-night protocol is ready. Start tonight and wake up refreshed.
        </p>

        {/* Download CTA */}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-5 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xl rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-6"
        >
          <Download className="w-6 h-6" />
          Download Your Protocol Now
        </a>

        {/* Email capture */}
        {!emailSubmitted ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-amber-400" />
              <p className="text-white font-bold">Get it in your inbox + 7-night reminders</p>
            </div>
            <p className="text-white/50 text-sm mb-4">We'll send the protocol to your email + a daily reminder for each night so you never miss a step.</p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60"
              />
              <button
                type="submit"
                disabled={captureLead.isPending}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all disabled:opacity-60"
              >
                {captureLead.isPending ? "..." : "Send"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm font-semibold">Protocol sent to {email} — check your inbox!</p>
          </div>
        )}

        {/* ONE-TIME UPSELL — ASMR Audio Pack $7 */}
        {productId === "main" && (
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-2xl p-6 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎧</span>
              <div>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">One-Time Offer</span>
                <p className="text-white font-bold text-lg mt-1">ASMR Sleep Audio Pack</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              7 premium ASMR tracks designed to trigger sleep within 20 minutes. Pairs perfectly with your protocol.
              <span className="text-purple-300 font-semibold"> 89% of users fall asleep 2x faster with this.</span>
            </p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-white/30 text-sm line-through">$27</span>
              <span className="text-2xl font-black text-purple-300">$7</span>
              <span className="text-xs text-white/40">one-time, instant download</span>
            </div>
            <CheckoutButton
              productId="oto2"
              sessionId={getSessionId()}
              className="w-full py-4 rounded-xl font-bold text-base bg-purple-600 hover:bg-purple-500 text-white"
              variant="secondary"
            >
              <span>Add ASMR Pack for $7</span>
              <ArrowRight className="w-4 h-4" />
            </CheckoutButton>
            <p className="text-white/30 text-xs text-center mt-2">This offer disappears when you leave this page</p>
          </div>
        )}

        {/* What's next */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left mb-6">
          <h3 className="text-white font-bold text-lg mb-4">🌙 Your 7-Night Plan</h3>
          <div className="space-y-3">
            {[
              { night: "Night 1", action: "Read the protocol & set your sleep window" },
              { night: "Night 2", action: "Apply the temperature & light protocol" },
              { night: "Night 3", action: "Start the wind-down ritual (30 min before bed)" },
              { night: "Night 7", action: "Full reset complete — track your results" },
            ].map(({ night, action }) => (
              <div key={night} className="flex gap-3 items-start">
                <span className="text-amber-400 font-bold text-sm shrink-0 mt-0.5">{night}</span>
                <span className="text-white/70 text-sm">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee reminder */}
        <div className="flex items-center justify-center gap-3 text-white/50 text-sm mb-6">
          <span>🛡️</span>
          <span>30-day money-back guarantee · No questions asked</span>
        </div>

        {/* Order ID */}
        {orderId && (
          <p className="text-white/30 text-xs mb-6">Order #{orderId}</p>
        )}

        <Link href="/" className="text-amber-400/60 hover:text-amber-400 text-sm transition-colors">
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}
