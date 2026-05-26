import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { DollarSign, Users, TrendingUp, CheckCircle, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateJoin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState("");

  const registerMutation = trpc.affiliate.register.useMutation({
    onSuccess: (data) => {
      setAffiliateCode(data.code);
      setSubmitted(true);
      toast.success("Welcome to the Deep Sleep Affiliate Program!");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    registerMutation.mutate({ email, name });
  };

  const copyLink = () => {
    const link = `${window.location.origin}/squeeze?ref=${affiliateCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Affiliate link copied!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
          <CheckCircle className="w-16 h-16 mx-auto" style={{ color: "oklch(0.70 0.18 145)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>You're In!</h1>
          <p style={{ color: "oklch(0.70 0.04 265)" }}>Your affiliate code: <strong className="font-mono" style={{ color: "oklch(0.82 0.16 65)" }}>{affiliateCode}</strong></p>
          
          <div className="p-4 rounded-lg text-left" style={{ background: "oklch(0.08 0.02 265)" }}>
            <p className="text-xs mb-2" style={{ color: "oklch(0.50 0.04 265)" }}>Your affiliate link:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs flex-1 truncate" style={{ color: "oklch(0.80 0.02 265)" }}>
                {window.location.origin}/squeeze?ref={affiliateCode}
              </code>
              <button onClick={copyLink} className="p-2 rounded cursor-pointer hover:opacity-80" style={{ background: "oklch(0.20 0.03 265)" }}>
                <Copy className="w-4 h-4" style={{ color: "oklch(0.82 0.16 65)" }} />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-left" style={{ color: "oklch(0.65 0.04 265)" }}>
            <p><strong>Commission:</strong> 50% on $4 front-end ($2.00/sale)</p>
            <p><strong>Upsell commission:</strong> 30% on all upsells ($5-8/sale)</p>
            <p><strong>Cookie duration:</strong> 30 days</p>
            <p><strong>Payout:</strong> Monthly via PayPal (min $25)</p>
          </div>

          <button
            onClick={() => navigate("/affiliates/dashboard")}
            className="cta-gold cta-shimmer rounded-xl px-6 py-3 font-bold cursor-pointer inline-flex items-center gap-2 w-full justify-center"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16" style={{ background: "linear-gradient(180deg, oklch(0.07 0.025 255), oklch(0.10 0.03 265))" }}>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="font-display font-black text-4xl md:text-5xl" style={{ color: "oklch(0.95 0.01 265)" }}>
            Earn $2–$10 Per Sale
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "oklch(0.70 0.04 265)" }}>
            Promote the 7-Night Deep Sleep Reset and earn 50% commission on every sale. No inventory, no support, no hassle.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: DollarSign, value: "50%", label: "Front-end Commission" },
            { icon: Users, value: "30-day", label: "Cookie Duration" },
            { icon: TrendingUp, value: "$15+", label: "Avg. Earnings/Sale" },
          ].map(({ icon: Icon, value, label }, i) => (
            <div key={i} className="text-center p-6 rounded-xl" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
              <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: "oklch(0.82 0.16 65)" }} />
              <p className="text-2xl font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>{value}</p>
              <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16 p-8 rounded-2xl" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "oklch(0.95 0.01 265)" }}>How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Sign Up", desc: "Get your unique affiliate link in 30 seconds" },
              { step: "2", title: "Share", desc: "Post on Reddit, TikTok, YouTube, email — anywhere" },
              { step: "3", title: "Earn", desc: "Get paid 50% on every sale + 30% on upsells" },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold" style={{ background: "oklch(0.82 0.16 65)", color: "oklch(0.15 0.02 65)" }}>{step}</div>
                <h3 className="font-semibold" style={{ color: "oklch(0.90 0.01 265)" }}>{title}</h3>
                <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration form */}
        <div className="max-w-md mx-auto p-8 rounded-2xl" style={{ background: "oklch(0.12 0.03 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "oklch(0.95 0.01 265)" }}>Join Now — Free</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "oklch(0.70 0.04 265)" }}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{ background: "oklch(0.08 0.02 265)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.01 265)" }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "oklch(0.70 0.04 265)" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{ background: "oklch(0.08 0.02 265)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.01 265)" }}
              />
            </div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="cta-gold cta-shimmer rounded-xl px-6 py-3 font-bold cursor-pointer w-full disabled:opacity-50"
            >
              {registerMutation.isPending ? "Creating your account..." : "Get My Affiliate Link"}
            </button>
          </form>
          <p className="text-xs text-center mt-4" style={{ color: "oklch(0.40 0.04 265)" }}>
            No approval needed. Start promoting immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
