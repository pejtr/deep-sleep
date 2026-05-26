import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Copy, DollarSign, MousePointer, ShoppingCart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [lookupDone, setLookupDone] = useState(false);

  const statsQuery = trpc.affiliate.getStats.useQuery(
    { email: email || user?.email || "" },
    { enabled: lookupDone || !!user?.email }
  );

  const stats = statsQuery.data;

  const copyLink = () => {
    if (!stats?.code) return;
    const link = `${window.location.origin}/squeeze?ref=${stats.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Affiliate link copied!");
  };

  if (!user?.email && !lookupDone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
        <div className="max-w-md w-full p-8 rounded-2xl space-y-6" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
          <h1 className="text-xl font-bold text-center" style={{ color: "oklch(0.95 0.01 265)" }}>Affiliate Dashboard</h1>
          <p className="text-sm text-center" style={{ color: "oklch(0.65 0.04 265)" }}>Enter your affiliate email to view your stats.</p>
          <form onSubmit={(e) => { e.preventDefault(); setLookupDone(true); }} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{ background: "oklch(0.08 0.02 265)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.01 265)" }}
            />
            <button type="submit" className="cta-gold cta-shimmer rounded-xl px-6 py-3 font-bold cursor-pointer w-full">
              View My Stats
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (statsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
        <div className="text-center space-y-4">
          <p style={{ color: "oklch(0.70 0.04 265)" }}>No affiliate account found for this email.</p>
          <a href="/affiliates/join" className="text-sm underline" style={{ color: "oklch(0.82 0.16 65)" }}>Join the affiliate program</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>Affiliate Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.60 0.04 265)" }}>Code: <span className="font-mono" style={{ color: "oklch(0.82 0.16 65)" }}>{stats.code}</span></p>
        </div>

        {/* Affiliate link */}
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
          <code className="text-xs flex-1 truncate" style={{ color: "oklch(0.80 0.02 265)" }}>
            {window.location.origin}/squeeze?ref={stats.code}
          </code>
          <button onClick={copyLink} className="p-2 rounded cursor-pointer hover:opacity-80" style={{ background: "oklch(0.20 0.03 265)" }}>
            <Copy className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MousePointer, label: "Clicks", value: stats.clicks?.toString() || "0" },
            { icon: ShoppingCart, label: "Conversions", value: stats.conversions?.toString() || "0" },
            { icon: TrendingUp, label: "Conv. Rate", value: stats.clicks > 0 ? `${((stats.conversions / stats.clicks) * 100).toFixed(1)}%` : "0%" },
            { icon: DollarSign, label: "Earnings", value: `$${(stats.earnings / 100).toFixed(2)}` },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "oklch(0.82 0.16 65)" }} />
              <p className="text-xl font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>{value}</p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Promo tips */}
        <div className="p-6 rounded-xl" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>Promotion Tips</h3>
          <ul className="space-y-2 text-sm" style={{ color: "oklch(0.65 0.04 265)" }}>
            <li>• <strong>Reddit:</strong> Share in r/insomnia, r/sleep, r/selfimprovement — use your /3am-wake-up or /racing-thoughts links</li>
            <li>• <strong>TikTok:</strong> "Things I wish I knew about sleep" + link in bio</li>
            <li>• <strong>YouTube:</strong> "I tried this $4 sleep reset for 7 nights" review</li>
            <li>• <strong>Email:</strong> Forward to friends who complain about sleep</li>
            <li>• <strong>Twitter/X:</strong> Thread about sleep science + CTA at end</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
