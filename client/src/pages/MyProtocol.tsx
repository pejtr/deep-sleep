import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Moon, Download, BookOpen, Star, Lock, ChevronRight, ExternalLink, Shield, Clock, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ── Color tokens (matching the app's dark theme) ─────────────────────────────
const C = {
  bg: "oklch(0.08 0.02 255)",
  card: "oklch(0.11 0.025 255)",
  cardInner: "oklch(0.14 0.025 255)",
  cardBorder: "oklch(0.20 0.03 265)",
  gold: "oklch(0.78 0.18 65)",
  green: "oklch(0.65 0.18 145)",
  blue: "oklch(0.65 0.18 240)",
  textPrimary: "oklch(0.95 0.01 255)",
  textSecondary: "oklch(0.75 0.02 255)",
  textMuted: "oklch(0.55 0.02 255)",
};

// ── Product definitions matching Stripe products ─────────────────────────────
const PRODUCTS = [
  {
    id: "main",
    key: "deep-sleep-reset",
    title: "Deep Sleep Reset Protocol",
    subtitle: "7-Night Science-Backed Sleep System",
    description: "Your complete chronotype-based sleep protocol with nightly instructions, breathing techniques, and cortisol reset methods.",
    price: "$4",
    icon: "🌙",
    downloadUrl: "/api/protocol/download?lang=en",
    features: ["7-Night Protocol", "Chronotype Assessment", "Breathing Techniques", "Light Reset Guide"],
    color: C.gold,
  },
  {
    id: "oto1",
    key: "pro-toolkit",
    title: "Pro Sleep Toolkit",
    subtitle: "Advanced Sleep Optimization System",
    description: "Complete toolkit with sleep tracking templates, supplement guide, and advanced CBT-I techniques.",
    price: "$37",
    icon: "⚡",
    downloadUrl: "/api/protocol/download?lang=en&type=pro",
    features: ["Sleep Tracking Templates", "Supplement Guide", "CBT-I Techniques", "Biohacking Protocols"],
    color: C.blue,
  },
  {
    id: "oto2",
    key: "emergency-rescue",
    title: "3AM Emergency Rescue",
    subtitle: "Instant Sleep Recovery System",
    description: "Emergency protocols for when you wake at 3AM and can't fall back asleep. Includes body scan, breathing, and cognitive techniques.",
    price: "$19",
    icon: "🆘",
    downloadUrl: "/api/protocol/download?lang=en&type=rescue",
    features: ["3AM Wake Protocol", "Body Scan Technique", "Cognitive Shuffle", "Rapid Relaxation"],
    color: "oklch(0.65 0.18 20)",
  },
  {
    id: "bump",
    key: "audio-pack",
    title: "Premium Audio Pack",
    subtitle: "Sleep-Inducing Soundscapes",
    description: "8 professionally crafted audio tracks including binaural beats, delta waves, and nature soundscapes for deep sleep.",
    price: "$11",
    icon: "🎵",
    downloadUrl: "/api/protocol/download?lang=en&type=audio",
    features: ["8 Audio Tracks", "Binaural Beats", "Delta Waves", "Nature Soundscapes"],
    color: "oklch(0.65 0.18 300)",
  },
  {
    id: "backend",
    key: "mastery-program",
    title: "30-Day Sleep Mastery",
    subtitle: "Complete Transformation Program",
    description: "Full 30-day program with daily assignments, weekly check-ins, and the complete sleep science curriculum.",
    price: "$97",
    icon: "🏆",
    downloadUrl: "/api/protocol/download?lang=en&type=mastery",
    features: ["30-Day Program", "Daily Assignments", "Weekly Check-ins", "Sleep Science Curriculum"],
    color: C.green,
  },
];

// ── Session ID from localStorage (same as checkout) ──────────────────────────
function getSessionId(): string {
  let sid = localStorage.getItem("dsr_session");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("dsr_session", sid);
  }
  return sid;
}

export default function MyProtocol() {
  const [sessionId] = useState(getSessionId);
  const [lang, setLang] = useState("en");
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: orders, isLoading } = trpc.orders.getBySession.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  const purchasedProductIds = new Set(
    (orders ?? []).filter(o => o.status === "completed").map(o => o.productId)
  );

  // Always show main protocol if any purchase exists
  const hasPurchase = purchasedProductIds.size > 0;

  const handleDownload = async (product: typeof PRODUCTS[0]) => {
    setDownloading(product.id);
    try {
      const url = `${product.downloadUrl}&lang=${lang}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${product.key}-${lang}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Downloaded: ${product.title}`);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between" style={{ background: "oklch(0.07 0.02 255 / 0.95)", borderBottom: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))" }}>
            <Moon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: C.textPrimary }}>Deep Sleep Reset</span>
        </Link>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ background: C.card, border: `1px solid ${C.cardBorder}`, color: C.textSecondary }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="cs">🇨🇿 Czech</option>
            <option value="de">🇩🇪 German</option>
          </select>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.gold}30, ${C.gold}10)`, border: `1px solid ${C.gold}30` }}>
            <BookOpen className="w-8 h-8" style={{ color: C.gold }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: C.textPrimary }}>Your Sleep Protocol</h1>
          <p className="text-sm" style={{ color: C.textSecondary }}>Download your purchased products below. All files are in PDF format.</p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Moon className="w-8 h-8 animate-pulse" style={{ color: C.gold }} />
              <p className="text-sm" style={{ color: C.textSecondary }}>Loading your purchases...</p>
            </div>
          </div>
        )}

        {/* No purchase state */}
        {!isLoading && !hasPurchase && (
          <div className="rounded-2xl p-8 text-center mb-6" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
            <Lock className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: C.textMuted }} />
            <p className="text-base font-semibold mb-2" style={{ color: C.textPrimary }}>No purchases found</p>
            <p className="text-sm mb-5" style={{ color: C.textMuted }}>
              It looks like you haven't purchased any products yet, or you're accessing this page from a different device.
            </p>
            <div className="space-y-2">
              <Link href="/order">
                <button className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${C.gold}, oklch(0.65 0.20 55))`, color: "oklch(0.10 0.02 255)" }}>
                  Get the Protocol — $4
                </button>
              </Link>
              <p className="text-xs" style={{ color: C.textMuted }}>
                Already purchased? Make sure you're using the same browser/device as when you bought.
              </p>
            </div>
          </div>
        )}

        {/* Purchased products */}
        {!isLoading && hasPurchase && (
          <div className="space-y-3 mb-8">
            {PRODUCTS.filter(p => {
              // Show main if any purchase exists (it's the base product)
              if (p.id === "main") return hasPurchase;
              return purchasedProductIds.has(p.id);
            }).map(product => (
              <div key={product.id} className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${product.color}15`, border: `1px solid ${product.color}30` }}>
                      {product.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{product.title}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${C.green}20`, color: C.green }}>✓ Purchased</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{product.subtitle}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {product.features.map(f => (
                          <span key={f} className="text-xs px-1.5 py-0.5 rounded" style={{ background: C.cardInner, color: C.textSecondary }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(product)}
                    disabled={downloading === product.id}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${product.color}30, ${product.color}15)`, color: product.color, border: `1px solid ${product.color}40` }}
                  >
                    {downloading === product.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Preparing download...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF ({lang.toUpperCase()})
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upsell section — show products not yet purchased */}
        {!isLoading && hasPurchase && (
          <div>
            {PRODUCTS.filter(p => p.id !== "main" && !purchasedProductIds.has(p.id)).length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px" style={{ background: C.cardBorder }} />
                  <p className="text-xs font-semibold px-2" style={{ color: C.textMuted }}>Upgrade your toolkit</p>
                  <div className="flex-1 h-px" style={{ background: C.cardBorder }} />
                </div>
                <div className="space-y-2">
                  {PRODUCTS.filter(p => p.id !== "main" && !purchasedProductIds.has(p.id)).map(product => (
                    <div key={product.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: `${product.color}15` }}>
                        {product.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{product.title}</p>
                        <p className="text-xs" style={{ color: C.textMuted }}>{product.description.slice(0, 60)}...</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold" style={{ color: product.color }}>{product.price}</span>
                        <Link href={`/order?product=${product.id}`}>
                          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80" style={{ background: `${product.color}20`, color: product.color }}>
                            Get it <ChevronRight className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Support section */}
        <div className="mt-8 rounded-2xl p-5 text-center" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4" style={{ color: C.green }} />
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Need help?</p>
          </div>
          <p className="text-xs mb-3" style={{ color: C.textMuted }}>
            If you have any issues with your downloads or purchases, our support team is here to help.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:support@deep-sleep-reset.com" className="flex items-center gap-1.5 text-xs transition-all hover:opacity-80" style={{ color: C.blue }}>
              <ExternalLink className="w-3 h-3" />
              support@deep-sleep-reset.com
            </a>
            <Link href="/chat" className="flex items-center gap-1.5 text-xs transition-all hover:opacity-80" style={{ color: C.gold }}>
              <Zap className="w-3 h-3" />
              Chat with Luna
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-current" style={{ color: C.gold }} />
            <span className="text-xs" style={{ color: C.textMuted }}>4.9/5 rating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" style={{ color: C.green }} />
            <span className="text-xs" style={{ color: C.textMuted }}>30-day guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: C.blue }} />
            <span className="text-xs" style={{ color: C.textMuted }}>Instant access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
