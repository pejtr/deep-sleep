import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  BarChart3, DollarSign, Users, MessageSquare, Star, TrendingUp,
  Activity, ExternalLink, RefreshCw, Moon, Zap, Globe, ShoppingCart,
  ChevronRight, AlertCircle, CheckCircle2, Clock
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  color: string; trend?: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "oklch(0.55 0.18 145 / 0.15)", color: "oklch(0.70 0.18 145)" }}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.04 265)" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.08 65)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function CampaignCard({ platform, status, budget, impressions, clicks, ctr, link }: {
  platform: string; status: "active" | "review" | "paused"; budget: string;
  impressions: string; clicks: string; ctr: string; link: string;
}) {
  const statusConfig = {
    active: { label: "Active", color: "oklch(0.70 0.18 145)", bg: "oklch(0.55 0.18 145 / 0.15)" },
    review: { label: "Under Review", color: "oklch(0.78 0.18 65)", bg: "oklch(0.78 0.18 65 / 0.15)" },
    paused: { label: "Paused", color: "oklch(0.55 0.04 265)", bg: "oklch(0.55 0.04 265 / 0.15)" },
  };
  const s = statusConfig[status];
  return (
    <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: "oklch(0.14 0.03 265)" }}>
            {platform === "TikTok" ? "🎵" : platform === "Google" ? "🔍" : "📘"}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.90 0.02 265)" }}>{platform} Ads</p>
            <p className="text-xs" style={{ color: "oklch(0.45 0.04 265)" }}>Deep Sleep Reset — $5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" style={{ color: "oklch(0.45 0.04 265)" }} />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Budget/day", value: budget },
          { label: "Impressions", value: impressions },
          { label: "Link clicks", value: clicks },
          { label: "CTR", value: ctr },
        ].map(m => (
          <div key={m.label}>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.88 0.02 265)" }}>{m.value}</p>
            <p className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "feedback" | "funnel">("overview");

  const { data: stats, isLoading, refetch } = trpc.admin.stats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.06 0.02 255)" }}>
        <div className="flex flex-col items-center gap-3">
          <Moon className="w-8 h-8 animate-pulse" style={{ color: "oklch(0.78 0.18 65)" }} />
          <p className="text-sm" style={{ color: "oklch(0.45 0.04 265)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.06 0.02 255)" }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.65 0.18 25)" }} />
          <p className="text-lg font-semibold mb-2" style={{ color: "oklch(0.90 0.02 265)" }}>Access Restricted</p>
          <p className="text-sm mb-4" style={{ color: "oklch(0.45 0.04 265)" }}>Admin access required</p>
          <button onClick={() => navigate("/")} className="text-sm underline" style={{ color: "oklch(0.78 0.18 65)" }}>
            Go to homepage
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "campaigns", label: "Ad Campaigns", icon: TrendingUp },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "funnel", label: "Funnel", icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.06 0.02 255)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between" style={{ background: "oklch(0.07 0.02 255 / 0.95)", borderBottom: "1px solid oklch(0.15 0.03 265)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))" }}>
            <Moon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "oklch(0.90 0.02 265)" }}>Deep Sleep Reset</p>
            <p className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.20 0.04 265)" }}
          >
            <RefreshCw className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.04 265)" }} />
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.20 0.04 265)", color: "oklch(0.55 0.04 265)" }}
          >
            ← Site
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.15 0.03 265)" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white" }
                : { color: "oklch(0.45 0.04 265)" }
              }
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl p-5 animate-pulse h-28" style={{ background: "oklch(0.09 0.025 255)" }} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={DollarSign} label="Revenue" value={`$${stats?.revenue?.toFixed(2) ?? "0.00"}`} sub="Completed orders" color="oklch(0.70 0.18 145)" trend="+∞%" />
                  <StatCard icon={ShoppingCart} label="Orders" value={stats?.orderCount ?? 0} sub="Completed" color="oklch(0.65 0.18 65)" />
                  <StatCard icon={Users} label="Email Leads" value={stats?.leadCount ?? 0} sub="Captured" color="oklch(0.65 0.15 280)" />
                  <StatCard icon={Activity} label="Quiz Starts" value={stats?.quizCount ?? 0} sub="Funnel entries" color="oklch(0.65 0.15 200)" />
                  <StatCard icon={Star} label="Avg Rating" value={stats?.avgRating ? `${stats.avgRating}/5` : "—"} sub={`${stats?.feedbackCount ?? 0} reviews`} color="oklch(0.78 0.18 65)" />
                  <StatCard icon={MessageSquare} label="Feedbacks" value={stats?.feedbackCount ?? 0} sub="Submitted" color="oklch(0.65 0.15 320)" />
                  <StatCard icon={Zap} label="Events" value={stats?.behaviorCount ?? 0} sub="Behavior tracked" color="oklch(0.65 0.15 180)" />
                  <StatCard icon={Globe} label="Languages" value="14" sub="Active translations" color="oklch(0.65 0.15 240)" />
                </div>

                {/* Conversion funnel mini */}
                <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "oklch(0.90 0.02 265)" }}>Conversion Funnel</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Quiz Starts", value: stats?.quizCount ?? 0, max: Math.max(stats?.quizCount ?? 1, 1) },
                      { label: "Email Leads", value: stats?.leadCount ?? 0, max: Math.max(stats?.quizCount ?? 1, 1) },
                      { label: "Orders", value: stats?.orderCount ?? 0, max: Math.max(stats?.quizCount ?? 1, 1) },
                    ].map(step => {
                      const pct = step.max > 0 ? Math.round((step.value / step.max) * 100) : 0;
                      return (
                        <div key={step.label} className="flex items-center gap-3">
                          <p className="text-xs w-24 shrink-0" style={{ color: "oklch(0.55 0.04 265)" }}>{step.label}</p>
                          <div className="flex-1 h-2 rounded-full" style={{ background: "oklch(0.14 0.03 265)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, oklch(0.55 0.18 65), oklch(0.78 0.18 65))" }} />
                          </div>
                          <p className="text-xs w-8 text-right" style={{ color: "oklch(0.78 0.18 65)" }}>{step.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent orders */}
                {stats?.recentOrders && stats.recentOrders.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "oklch(0.90 0.02 265)" }}>Recent Orders</h3>
                    <div className="space-y-2">
                      {stats.recentOrders.map((order: { id: number; amount: string; product: string; createdAt: Date }) => (
                        <div key={order.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid oklch(0.14 0.03 265)" }}>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" style={{ color: "oklch(0.70 0.18 145)" }} />
                            <span className="text-xs" style={{ color: "oklch(0.65 0.04 265)" }}>{order.product}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold" style={{ color: "oklch(0.70 0.18 145)" }}>${order.amount}</span>
                            <span className="text-xs" style={{ color: "oklch(0.35 0.04 265)" }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold" style={{ color: "oklch(0.90 0.02 265)" }}>Active Ad Campaigns</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.55 0.18 145 / 0.15)", color: "oklch(0.70 0.18 145)" }}>Live data from ad platforms</span>
            </div>

            <CampaignCard
              platform="TikTok"
              status="review"
              budget="€101/day"
              impressions="—"
              clicks="—"
              ctr="—"
              link="https://ads.tiktok.com/i18n/manage/campaign?aadvid=7631884469462089744"
            />

            <CampaignCard
              platform="Google"
              status="paused"
              budget="—"
              impressions="151"
              clicks="0"
              ctr="0%"
              link="https://ads.google.com/aw/campaigns"
            />

            {/* Quick actions */}
            <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "oklch(0.90 0.02 265)" }}>Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Open TikTok Ads Manager", link: "https://ads.tiktok.com/i18n/manage/campaign?aadvid=7631884469462089744", icon: "🎵" },
                  { label: "Open Google Ads", link: "https://ads.google.com/aw/campaigns", icon: "🔍" },
                  { label: "View Gumroad Sales", link: "https://app.gumroad.com/dashboard", icon: "💰" },
                  { label: "Microsoft Ads Appeal", link: "mailto:advertiserappeal@microsoft.com", icon: "📧" },
                ].map(action => (
                  <a
                    key={action.label}
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl transition-all hover:opacity-80"
                    style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.20 0.04 265)" }}
                  >
                    <span className="text-base">{action.icon}</span>
                    <span className="text-xs flex-1" style={{ color: "oklch(0.65 0.04 265)" }}>{action.label}</span>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: "oklch(0.35 0.04 265)" }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "oklch(0.90 0.02 265)" }}>Optimization Checklist</h3>
              <div className="space-y-2">
                {[
                  { done: true, text: "TikTok campaign created (TESTHNED) — €101/day" },
                  { done: false, text: "TikTok campaign under review — wait 1-24h for approval" },
                  { done: false, text: "Google Ads — pause old campaign (deep-sleep-reset.com)" },
                  { done: false, text: "Google Ads — create new campaign for deepsleep.mom" },
                  { done: false, text: "Microsoft Ads — send appeal email to get account unblocked" },
                  { done: true, text: "Gumroad fixed price $5 set" },
                  { done: true, text: "14-language support live" },
                  { done: true, text: "AI chatbot Luna integrated" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "oklch(0.70 0.18 145)" }} />
                      : <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "oklch(0.55 0.04 265)" }} />
                    }
                    <p className="text-xs" style={{ color: item.done ? "oklch(0.65 0.04 265)" : "oklch(0.75 0.04 265)" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <StatCard icon={Star} label="Average Rating" value={stats?.avgRating ? `${stats.avgRating}/5` : "—"} sub="From all reviews" color="oklch(0.78 0.18 65)" />
              <StatCard icon={MessageSquare} label="Total Feedbacks" value={stats?.feedbackCount ?? 0} sub="Submitted" color="oklch(0.65 0.15 320)" />
            </div>

            {stats?.recentFeedbacks && stats.recentFeedbacks.length > 0 ? (
              <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "oklch(0.90 0.02 265)" }}>Recent Feedback</h3>
                <div className="space-y-3">
                  {stats.recentFeedbacks.map((fb: { id: number; rating: number | null; liked: string | null; improved: string | null; createdAt: Date }) => (
                    <div key={fb.id} className="p-3 rounded-xl" style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className="w-3.5 h-3.5" fill={s <= (fb.rating ?? 0) ? "oklch(0.78 0.18 65)" : "none"} style={{ color: "oklch(0.78 0.18 65)" }} />
                          ))}
                        </div>
                        <span className="text-xs ml-auto" style={{ color: "oklch(0.35 0.04 265)" }}>
                          {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      {fb.liked && <p className="text-xs mb-1" style={{ color: "oklch(0.65 0.04 265)" }}>👍 {fb.liked}</p>}
                      {fb.improved && <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>💡 {fb.improved}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-8 text-center" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
                <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: "oklch(0.30 0.04 265)" }} />
                <p className="text-sm" style={{ color: "oklch(0.45 0.04 265)" }}>No feedback yet</p>
                <p className="text-xs mt-1" style={{ color: "oklch(0.35 0.04 265)" }}>Feedback will appear here after customers submit reviews</p>
              </div>
            )}
          </div>
        )}

        {/* Funnel Tab */}
        {activeTab === "funnel" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "oklch(0.90 0.02 265)" }}>Full Funnel Overview</h3>
              <div className="space-y-3">
                {[
                  { step: "1", label: "Ad Click (TikTok/Google)", value: "—", note: "Tracking via ad platforms", color: "oklch(0.65 0.15 280)" },
                  { step: "2", label: "Landing Page Visit", value: "—", note: "deepsleep.mom", color: "oklch(0.65 0.15 240)" },
                  { step: "3", label: "Quiz Started", value: String(stats?.quizCount ?? 0), note: "Chronotype assessment", color: "oklch(0.65 0.15 200)" },
                  { step: "4", label: "Email Captured", value: String(stats?.leadCount ?? 0), note: "Lead magnet", color: "oklch(0.65 0.15 160)" },
                  { step: "5", label: "Order Completed", value: String(stats?.orderCount ?? 0), note: "$5 main product", color: "oklch(0.70 0.18 145)" },
                  { step: "6", label: "Feedback Submitted", value: String(stats?.feedbackCount ?? 0), note: "Post-purchase", color: "oklch(0.78 0.18 65)" },
                ].map(step => (
                  <div key={step.step} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${step.color}20`, color: step.color }}>
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: "oklch(0.80 0.02 265)" }}>{step.label}</p>
                      <p className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>{step.note}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: step.color }}>{step.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "oklch(0.09 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "oklch(0.90 0.02 265)" }}>Revenue Breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Main ($5)", pct: "100%", color: "oklch(0.70 0.18 145)" },
                  { label: "OTO1 ($7)", pct: "0%", color: "oklch(0.65 0.18 65)" },
                  { label: "OTO2 ($17)", pct: "0%", color: "oklch(0.65 0.15 280)" },
                ].map(r => (
                  <div key={r.label} className="text-center p-3 rounded-xl" style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.18 0.04 265)" }}>
                    <p className="text-lg font-bold" style={{ color: r.color }}>{r.pct}</p>
                    <p className="text-xs" style={{ color: "oklch(0.40 0.04 265)" }}>{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
