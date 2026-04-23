import { useEffect, useState } from "react";
import { Link } from "wouter";

const DOWNLOAD_LINKS: Record<string, string> = {
  main: "https://deepsleepreset.gumroad.com/l/fdtifc",
  oto1: "https://deepsleepreset.gumroad.com/l/fdtifc", // fallback
  oto2: "https://deepsleepreset.gumroad.com/l/fdtifc",
  oto3: "https://deepsleepreset.gumroad.com/l/fdtifc",
};

export default function CheckoutSuccess() {
  const [productId, setProductId] = useState("main");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("product_id") ?? "main";
    const oid = params.get("order_id");
    setProductId(pid);
    setOrderId(oid);
  }, []);

  // Auto-redirect countdown to download
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const downloadUrl = DOWNLOAD_LINKS[productId] ?? DOWNLOAD_LINKS.main;

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
          className="block w-full py-5 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xl rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mb-4"
        >
          ⬇️ Download Your Protocol Now
        </a>

        <p className="text-white/40 text-sm mb-8">
          {countdown > 0
            ? `Auto-downloading in ${countdown}s...`
            : "Click the button above to download"}
        </p>

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
