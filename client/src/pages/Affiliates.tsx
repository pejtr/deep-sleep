import { Moon, ArrowLeft, DollarSign, Users, TrendingUp, Gift } from "lucide-react";
import { Link } from "wouter";

export default function Affiliates() {
  return (
    <div className="min-h-screen pb-16" style={{ background: "oklch(0.07 0.025 255)" }}>
      <div className="orb orb-gold w-96 h-96 opacity-15" style={{ top: "-5%", right: "-5%" }} />
      <div className="orb orb-blue w-72 h-72 opacity-10" style={{ bottom: "20%", left: "-10%" }} />

      {/* Header */}
      <div className="relative z-10 container py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Moon className="w-5 h-5" style={{ color: "oklch(0.82 0.16 65)" }} />
          <span className="font-display font-bold text-base" style={{ color: "oklch(0.82 0.16 65)" }}>
            Deep Sleep Reset
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
          style={{ color: "oklch(0.55 0.04 265)" }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="relative z-10 container max-w-3xl mx-auto py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold"
            style={{ background: "oklch(0.78 0.18 65 / 0.1)", border: "1px solid oklch(0.78 0.18 65 / 0.3)", color: "oklch(0.82 0.16 65)" }}>
            💰 Affiliate Program
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-4" style={{ color: "oklch(0.95 0.01 265)" }}>
            Earn While You Help<br />
            <span style={{ color: "oklch(0.82 0.16 65)" }}>People Sleep Better</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "oklch(0.60 0.04 265)" }}>
            Join our affiliate program and earn up to 50% commission on every sale. 
            Our $5 price point converts exceptionally well — low barrier, high volume.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <DollarSign className="w-5 h-5" />, value: "50%", label: "Commission" },
            { icon: <TrendingUp className="w-5 h-5" />, value: "$5", label: "Low price = high CVR" },
            { icon: <Users className="w-5 h-5" />, value: "10,000+", label: "Happy customers" },
            { icon: <Gift className="w-5 h-5" />, value: "30-day", label: "Cookie window" },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2" style={{ color: "oklch(0.82 0.16 65)" }}>{stat.icon}</div>
              <div className="font-black text-xl mb-1" style={{ color: "oklch(0.95 0.01 265)" }}>{stat.value}</div>
              <div className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h2 className="font-display font-bold text-2xl mb-6" style={{ color: "oklch(0.95 0.01 265)" }}>
            How It Works
          </h2>
          <div className="flex flex-col gap-5">
            {[
              { step: "1", title: "Apply to join", desc: "Fill out the form below. We approve most applications within 24 hours." },
              { step: "2", title: "Get your link", desc: "Receive your unique affiliate link and promotional materials (banners, copy, creatives)." },
              { step: "3", title: "Promote", desc: "Share on social media, email list, YouTube, TikTok, blog — wherever your audience is." },
              { step: "4", title: "Earn commissions", desc: "Earn 50% on every sale. Payments processed monthly via PayPal or bank transfer." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: "oklch(0.78 0.18 65 / 0.15)", color: "oklch(0.82 0.16 65)", border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: "oklch(0.90 0.02 265)" }}>{item.title}</p>
                  <p className="text-sm" style={{ color: "oklch(0.55 0.04 265)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apply form */}
        <div className="glass-card rounded-3xl p-8" style={{ border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "oklch(0.95 0.01 265)" }}>
            Apply Now
          </h2>
          <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.04 265)" }}>
            We review all applications personally. Expect a response within 24 hours.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              window.location.href = `mailto:affiliates@deepsleepquest.com?subject=Affiliate Application&body=Email: ${email}`;
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>Your Name</label>
              <input name="name" required placeholder="Jane Smith"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
                style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>Email Address</label>
              <input name="email" type="email" required placeholder="jane@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2"
                style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "oklch(0.70 0.04 265)" }}>Your Platform / Audience</label>
              <textarea name="platform" required placeholder="e.g. TikTok 50k followers, sleep/wellness niche; YouTube channel; email newsletter 10k subscribers..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 resize-none"
                style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.25 0.04 265)", color: "oklch(0.90 0.02 265)" }} />
            </div>
            <button type="submit"
              className="w-full cta-gold cta-shimmer rounded-xl py-3.5 text-sm font-bold">
              Apply to Affiliate Program →
            </button>
          </form>
          <p className="text-xs text-center mt-4" style={{ color: "oklch(0.40 0.04 265)" }}>
            Questions? Email affiliates@deepsleepquest.com
          </p>
        </div>
      </div>
    </div>
  );
}
