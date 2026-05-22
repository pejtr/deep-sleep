import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { TimelineCharts } from "@/components/TimelineCharts";
import { PersonaMetricsDashboard } from "@/components/PersonaMetricsDashboard";
import { AbMetricsWidget } from "@/components/AbMetricsWidget";
import { AbExportButton } from "@/components/AbExportButton";
import { AbRecommendations } from "@/components/AbRecommendations";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import {
  BarChart3, DollarSign, Users, MessageSquare, Star, TrendingUp,
  Activity, ExternalLink, RefreshCw, Moon, Zap, Globe, ShoppingCart,
  ChevronRight, AlertCircle, CheckCircle2, Clock, Cpu, Target,
  ArrowUpRight, ArrowDownRight, BarChart2, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Sparkles, Play, ThumbsUp, ThumbsDown,
  Mail, Send, Copy, Check
} from "lucide-react";
import { toast } from "sonner";
import { CampaignDashboard } from '@/components/CampaignDashboard';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

// ── Color palette ────────────────────────────────────────────────────────────
const C = {
  gold: "oklch(0.78 0.18 65)",
  green: "oklch(0.70 0.18 145)",
  blue: "oklch(0.65 0.15 240)",
  purple: "oklch(0.65 0.15 280)",
  pink: "oklch(0.65 0.15 320)",
  teal: "oklch(0.65 0.15 200)",
  red: "oklch(0.65 0.18 25)",
  bg: "oklch(0.06 0.02 255)",
  card: "oklch(0.09 0.025 255)",
  cardBorder: "oklch(0.18 0.04 265)",
  cardInner: "oklch(0.12 0.025 255)",
  textPrimary: "oklch(0.90 0.02 265)",
  textSecondary: "oklch(0.55 0.04 265)",
  textMuted: "oklch(0.35 0.04 265)",
};

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend, trendUp }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  color: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"
            style={{ background: trendUp !== false ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(0.65 0.18 25 / 0.15)", color: trendUp !== false ? C.green : C.red }}>
            {trendUp !== false ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: C.gold }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Chart Card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Custom tooltip for recharts ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs shadow-xl" style={{ background: "oklch(0.11 0.03 265)", border: `1px solid ${C.cardBorder}` }}>
      {label && <p className="mb-2 font-semibold" style={{ color: C.textPrimary }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</span></p>
      ))}
    </div>
  );
}

// ── AI Suggestion card ───────────────────────────────────────────────────────
function AISuggestion({ text, onApply, onDismiss, applied }: { text: string; onApply: () => void; onDismiss: () => void; applied: boolean }) {
  return (
    <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: applied ? "oklch(0.55 0.18 145 / 0.08)" : "oklch(0.12 0.025 255)", border: `1px solid ${applied ? "oklch(0.55 0.18 145 / 0.3)" : C.cardBorder}` }}>
      <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: applied ? C.green : C.gold }} />
      <p className="text-xs flex-1 leading-relaxed" style={{ color: applied ? C.green : C.textPrimary }}>{text}</p>
      {!applied && (
        <div className="flex gap-1.5 shrink-0">
          <button onClick={onApply} className="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:opacity-80" style={{ background: "oklch(0.55 0.18 65 / 0.2)", color: C.gold }}>
            <Play className="w-3 h-3 inline mr-1" />Apply
          </button>
          <button onClick={onDismiss} className="text-xs px-2 py-1.5 rounded-lg transition-all hover:opacity-60" style={{ color: C.textMuted }}>
            <ThumbsDown className="w-3 h-3" />
          </button>
        </div>
      )}
      {applied && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.green }} />}
    </div>
  );
}

// ── Date range helper ────────────────────────────────────────────────────────
function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}
// ── Overview Tab (Phase 1 — Professional KPIs + Waterfall Funnel) ────────────────
type AdminStats = {
  revenue?: number;
  completedOrderCount?: number;
  orderCount?: number;
  leadCount?: number;
  quizStarts?: number;
  quizCount?: number;
  avgRating?: number;
  feedbackCount?: number;
  behaviorCount?: number;
  uniqueBuyers?: number;
  duplicateAttempts?: number;
  avgTimeToCheckout?: number;
  recentOrders?: Array<{ id: number; amount: string; product: string; status?: string; currency?: string; createdAt: Date }>;
  referrerBreakdown?: Array<{ source: string; visits: number }>;
  deviceBreakdown?: Array<{ device: string; count: number }>;
  orderTimeline?: Array<{ hour: string; count: number }>;
  revenueByProduct?: Array<{ product: string; value: number }>;
};

function OverviewTab({ stats, isLoading, refetch }: { stats?: AdminStats; isLoading: boolean; refetch: () => void }) {
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "90d">("30d");

  // Derived KPIs
  const revenue = stats?.revenue ?? 0;
  const orders = stats?.completedOrderCount ?? stats?.orderCount ?? 0;
  const completedOrders = stats?.completedOrderCount ?? orders;
  const leads = stats?.leadCount ?? 0;
  const quizStarts = stats?.quizStarts ?? stats?.quizCount ?? 0;
  const aov = completedOrders > 0 ? revenue / completedOrders : 0;
  const cvr = quizStarts > 0 ? (completedOrders / quizStarts) * 100 : 0;
  const emailCaptureRate = quizStarts > 0 ? (leads / quizStarts) * 100 : 0;

  // Waterfall funnel data with drop-off
  const funnelSteps = [
    { label: "Quiz Starts", value: quizStarts, color: C.teal, icon: Activity },
    { label: "Email Captured", value: leads, color: C.blue, icon: Mail },
    { label: "Order Page", value: Math.max(leads, completedOrders), color: C.purple, icon: ShoppingCart },
    { label: "Completed Orders", value: completedOrders, color: C.green, icon: CheckCircle2 },
  ];

  const orderTimelineData = stats?.orderTimeline ?? [];

  // Timeline metrics query (daily, driven by dateRange)
  const timelineDays = dateRange === "today" ? 1 : dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const { data: timelineData, isLoading: timelineLoading } = trpc.admin.getTimelineMetrics.useQuery(
    { granularity: "daily", days: timelineDays },
    { refetchOnWindowFocus: false }
  );

  // Trend indicators (% change vs. previous period)
  const { data: trendData } = trpc.admin.getStatsTrend.useQuery(
    { days: timelineDays },
    { refetchOnWindowFocus: false }
  );
  const trends = trendData?.trends;

  // Helper: render trend badge
  const TrendBadge = ({ pct }: { pct: number | null | undefined }) => {
    if (pct === null || pct === undefined) return null;
    const isPos = pct >= 0;
    return (
      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{
        background: isPos ? `${C.green}18` : `${C.red}18`,
        color: isPos ? C.green : C.red,
      }}>
        {isPos ? '▲' : '▼'} {Math.abs(pct)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Date Range Picker ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>Performance Overview</h2>
          <p className="text-xs" style={{ color: C.textMuted }}>All-time data · Completed orders only</p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
          {(["today", "7d", "30d", "90d"] as const).map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: dateRange === r ? C.gold : "transparent",
                color: dateRange === r ? "oklch(0.10 0.02 255)" : C.textMuted,
                fontWeight: dateRange === r ? 700 : 400,
              }}
            >{r}</button>
          ))}
          <button onClick={() => refetch()} className="ml-1 p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: C.textMuted }}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse h-28" style={{ background: C.card }} />
          ))}
        </div>
      ) : (
        <>
          {/* ── Hero KPI Row ─────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Revenue */}
            <div className="rounded-2xl p-5 col-span-1" style={{ background: `linear-gradient(135deg, ${C.card}, oklch(0.11 0.04 145))`, border: `1px solid ${C.green}30` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${C.green}18` }}>
                  <DollarSign className="w-4 h-4" style={{ color: C.green }} />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${C.green}18`, color: C.green }}>Paid only</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>${revenue.toFixed(2)}</p>
                <TrendBadge pct={trends?.revenue} />
              </div>
              <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>Total Revenue</p>
              <p className="text-xs mt-1" style={{ color: C.green }}>AOV: ${aov.toFixed(2)}</p>
            </div>

            {/* Orders */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${C.gold}18` }}>
                <ShoppingCart className="w-4 h-4" style={{ color: C.gold }} />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>{completedOrders}</p>
                <TrendBadge pct={trends?.orders} />
              </div>
              <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>Completed Orders</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>{orders - completedOrders} pending</p>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${C.purple}18` }}>
                <Target className="w-4 h-4" style={{ color: C.purple }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>{cvr.toFixed(1)}%</p>
              <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>Quiz → Order CVR</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>Email cap: {emailCaptureRate.toFixed(1)}%</p>
            </div>

            {/* Leads */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${C.blue}18` }}>
                <Users className="w-4 h-4" style={{ color: C.blue }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>{leads}</p>
              <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>Email Leads</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>RPL: ${leads > 0 ? (revenue / leads).toFixed(2) : "0.00"}</p>
            </div>

            {/* Quiz Starts */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${C.teal}18` }}>
                <Activity className="w-4 h-4" style={{ color: C.teal }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>{quizStarts}</p>
              <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>Quiz Starts</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>Funnel entries</p>
            </div>
          </div>

          {/* ── Waterfall Funnel + Revenue Chart ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Waterfall Funnel */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: C.textPrimary }}>Conversion Funnel</h3>
              <div className="space-y-2">
                {funnelSteps.map((step, i) => {
                  const prevValue = i === 0 ? step.value : funnelSteps[i - 1].value;
                  const dropOff = prevValue > 0 && i > 0 ? (((prevValue - step.value) / prevValue) * 100).toFixed(0) : null;
                  const barWidth = funnelSteps[0].value > 0 ? (step.value / funnelSteps[0].value) * 100 : 0;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.label}>
                      {dropOff && (
                        <div className="flex items-center gap-1 mb-1 ml-2">
                          <ArrowDownRight className="w-3 h-3" style={{ color: C.red }} />
                          <span className="text-xs" style={{ color: C.red }}>{dropOff}% drop-off</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${step.color}18` }}>
                          <StepIcon className="w-3.5 h-3.5" style={{ color: step.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: C.textSecondary }}>{step.label}</span>
                            <span className="text-sm font-bold" style={{ color: step.color }}>{step.value.toLocaleString()}</span>
                          </div>
                          <div className="h-2 rounded-full" style={{ background: C.cardInner }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${step.color}80, ${step.color})` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Trend (daily, date-range driven) */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Revenue Trend</h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${C.green}18`, color: C.green }}>Last {timelineDays}d</span>
              </div>
              {timelineLoading ? (
                <div className="h-44 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${C.gold} transparent transparent transparent` }} />
                </div>
              ) : timelineData && timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={timelineData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.green} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ordGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.gold} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0.04 265)" />
                    <XAxis dataKey="day" tick={{ fill: C.textMuted, fontSize: 9 }} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis yAxisId="rev" orientation="left" tick={{ fill: C.textMuted, fontSize: 9 }} tickFormatter={(v: number) => `$${v}`} />
                    <YAxis yAxisId="ord" orientation="right" tick={{ fill: C.textMuted, fontSize: 9 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "oklch(0.11 0.03 265)", border: `1px solid ${C.cardBorder}`, borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: C.textPrimary }}
                      formatter={(value: number, name: string) => [name === "Revenue" ? `$${value.toFixed(2)}` : value, name]}
                    />
                    <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke={C.green} fill="url(#revGrad2)" strokeWidth={2} dot={false} />
                    <Area yAxisId="ord" type="monotone" dataKey="orders" name="Orders" stroke={C.gold} fill="url(#ordGrad2)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-44 gap-2">
                  <Clock className="w-8 h-8" style={{ color: C.textMuted }} />
                  <p className="text-xs" style={{ color: C.textMuted }}>No revenue data yet</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>Chart appears after first completed order</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Secondary Metrics Row ────────────────────────────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Traffic Sources */}
            <ChartCard title="Traffic Sources">
              {stats?.referrerBreakdown && stats.referrerBreakdown.length > 0 ? (
                <div className="space-y-2">
                  {stats.referrerBreakdown.map((r, i) => {
                    const maxVisits = Math.max(...stats.referrerBreakdown!.map(x => x.visits));
                    const pct = maxVisits > 0 ? (r.visits / maxVisits) * 100 : 0;
                    const colors = [C.gold, C.green, C.blue, C.purple, C.teal, C.pink];
                    return (
                      <div key={r.source} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate max-w-[140px]" style={{ color: C.textPrimary }}>{r.source}</span>
                          <span className="text-xs font-bold" style={{ color: colors[i % colors.length] }}>{r.visits}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: C.cardInner }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-center py-6" style={{ color: C.textMuted }}>No referrer data yet</p>
              )}
            </ChartCard>

            {/* Device Breakdown */}
            <ChartCard title="Devices">
              {stats?.deviceBreakdown && stats.deviceBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={stats.deviceBreakdown.map(d => ({ name: d.device, value: d.count }))} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                      {stats.deviceBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={[C.gold, C.teal, C.purple, C.green][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: C.textMuted }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-center py-6" style={{ color: C.textMuted }}>No device data yet</p>
              )}
            </ChartCard>

            {/* Revenue by Product */}
            <ChartCard title="Revenue by Product">
              {stats?.revenueByProduct && stats.revenueByProduct.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={stats.revenueByProduct.map(p => ({ name: p.product, value: p.value }))}
                        cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value"
                      >
                        {stats.revenueByProduct.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={[C.green, C.gold, C.blue, C.purple, C.teal, C.pink][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-2">
                    {stats.revenueByProduct.slice(0, 4).map((p, i) => {
                      const colors = [C.green, C.gold, C.blue, C.purple, C.teal, C.pink];
                      const totalRev = stats.revenueByProduct!.reduce((s, x) => s + x.value, 0);
                      const pct = totalRev > 0 ? (p.value / totalRev * 100).toFixed(0) : '0';
                      return (
                        <div key={p.product} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                            <span className="text-xs truncate max-w-[90px]" style={{ color: C.textSecondary }}>{p.product}</span>
                          </div>
                          <span className="text-xs font-bold" style={{ color: colors[i % colors.length] }}>${p.value.toFixed(2)} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-xs text-center py-6" style={{ color: C.textMuted }}>No product data yet</p>
              )}
            </ChartCard>

            {/* Buyer Intelligence */}
            <ChartCard title="Buyer Intelligence">
              <div className="space-y-3">
                {[
                  { label: "Unique Buyers", value: String(stats?.uniqueBuyers ?? 0), color: C.green },
                  { label: "Avg Rating", value: stats?.avgRating ? `${stats.avgRating}/5 ★` : "—", color: C.gold },
                  { label: "Feedbacks", value: String(stats?.feedbackCount ?? 0), color: C.pink },
                  { label: "Behavior Events", value: String(stats?.behaviorCount ?? 0), color: C.teal },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
                    <span className="text-xs" style={{ color: C.textSecondary }}>{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* ── Recent Orders ─────────────────────────────────────────────────────────────── */}
          {stats?.recentOrders && stats.recentOrders.length > 0 && (
            <ChartCard title="Recent Orders">
              <div className="space-y-2">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" style={{ color: order.status === 'completed' ? C.green : C.gold }} />
                      <div>
                        <span className="text-xs font-medium" style={{ color: C.textSecondary }}>{order.product}</span>
                        {order.status && order.status !== 'completed' && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'oklch(0.78 0.18 65 / 0.15)', color: C.gold }}>{order.status}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold" style={{ color: order.status === 'completed' ? C.green : C.gold }}>
                        {order.currency ? order.currency.toUpperCase() : 'USD'} {order.amount}
                      </span>
                      <span className="text-xs" style={{ color: C.textMuted }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}

// ── Reddit Ads Tab ───────────────────────────────────────────────────────────────
function RedditAdsTab() {
  const [range, setRange] = useState<7 | 14 | 30>(7);
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("area");
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());

  const { startDate, endDate } = useMemo(() => getDateRange(range), [range]);

  const { data: account, isLoading: accountLoading } = trpc.reddit.account.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.reddit.campaigns.useQuery();
  const { data: report, isLoading: reportLoading, refetch } = trpc.reddit.report.useQuery({ startDate, endDate });

  const isLoading = accountLoading || campaignsLoading || reportLoading;

  // AI suggestions based on data
  const suggestions = useMemo(() => {
    const list = [
      "Increase daily budget to €15/day for r/insomnia targeting — this subreddit has 3x higher purchase intent than r/sleep.",
      "Add a retargeting campaign for users who visited the landing page but didn't purchase — estimated 2-4x ROAS improvement.",
      "Test a video ad creative showing the '7-night transformation' timeline — video ads on Reddit have 40% lower CPM than static.",
      "Expand targeting to r/anxiety and r/mentalhealth — insomnia is a top complaint in these communities (combined 8M members).",
      "Schedule ads for 9-11 PM local time in target countries — peak insomnia browsing window, 35% lower CPC.",
    ];
    return list;
  }, []);

  const CHART_COLORS = [C.gold, C.green, C.blue, C.purple, C.teal];

  // Pie chart data for spend distribution
  const pieData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return [{ name: "DSR-Traffic-Insomnia-01", value: 100 }];
    }
    return campaigns.map((c, i) => ({ name: c.name, value: 1 / (i + 1) }));
  }, [campaigns]);

  const chartData = report?.days ?? [];

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Reddit Ads Performance</h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
            {account ? `Account: ${account.name} · ${account.currency} · ${account.status}` : "Loading account..."}
            {(account as { error?: string })?.error && <span style={{ color: C.red }}> ⚠ API: {(account as { error?: string }).error?.slice(0, 60)}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
            {([7, 14, 30] as const).map(d => (
              <button key={d} onClick={() => setRange(d)}
                className="text-xs px-2.5 py-1 rounded-md font-medium transition-all"
                style={range === d ? { background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white" } : { color: C.textSecondary }}>
                {d}d
              </button>
            ))}
          </div>
          {/* Chart type selector */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
            {([["area", LineChartIcon], ["bar", BarChart2], ["line", LineChartIcon]] as const).map(([type, Icon]) => (
              <button key={type} onClick={() => setChartType(type)}
                className="p-1.5 rounded-md transition-all"
                style={chartType === type ? { background: "oklch(0.55 0.18 65 / 0.2)", color: C.gold } : { color: C.textMuted }}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <button onClick={() => { refetch(); }} className="p-2 rounded-lg transition-all hover:opacity-80" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} style={{ color: C.textSecondary }} />
          </button>
          <a href="https://ads.reddit.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: "oklch(0.55 0.18 25 / 0.15)", color: "oklch(0.75 0.18 25)", border: "1px solid oklch(0.55 0.18 25 / 0.3)" }}>
            <span>🔴</span> Reddit Ads Manager <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Impressions", value: report?.totalImpressions?.toLocaleString() ?? "—", icon: Target, color: C.blue },
          { label: "Clicks", value: report?.totalClicks?.toLocaleString() ?? "—", icon: Activity, color: C.teal },
          { label: "CTR", value: report?.avgCtr ? `${report.avgCtr.toFixed(2)}%` : "—", icon: TrendingUp, color: C.green },
          { label: "Spend", value: report?.totalSpend ? `€${report.totalSpend.toFixed(2)}` : "—", icon: DollarSign, color: C.gold },
          { label: "Avg CPC", value: report?.avgCpc ? `€${report.avgCpc.toFixed(3)}` : "—", icon: BarChart3, color: C.purple },
          { label: "eCPM", value: report?.avgEcpm ? `€${report.avgEcpm.toFixed(2)}` : "—", icon: Zap, color: C.pink },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl p-3 flex flex-col gap-2" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}18` }}>
              <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: C.textPrimary }}>{isLoading ? "..." : kpi.value}</p>
              <p className="text-xs" style={{ color: C.textSecondary }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main performance chart */}
        <div className="lg:col-span-2">
          <ChartCard title={`Performance — Last ${range} days`}>
            {chartData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2">
                <BarChart3 className="w-8 h-8" style={{ color: C.textMuted }} />
                <p className="text-xs" style={{ color: C.textSecondary }}>
                  {isLoading ? "Loading data..." : "No data yet — campaign is warming up"}
                </p>
                <p className="text-xs" style={{ color: C.textMuted }}>Reddit Ads typically take 24-48h to show data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                {chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0.04 265)" />
                    <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: C.textSecondary }} />
                    <Bar dataKey="impressions" name="Impressions" fill={C.blue} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="clicks" name="Clicks" fill={C.green} radius={[3, 3, 0, 0]} />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0.04 265)" />
                    <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: C.textSecondary }} />
                    <Line type="monotone" dataKey="impressions" name="Impressions" stroke={C.blue} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="clicks" name="Clicks" stroke={C.green} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="spend" name="Spend (€)" stroke={C.gold} strokeWidth={2} dot={false} />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.gold} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0.04 265)" />
                    <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: C.textSecondary }} />
                    <Area type="monotone" dataKey="impressions" name="Impressions" stroke={C.blue} fill="url(#colorImpressions)" strokeWidth={2} />
                    <Area type="monotone" dataKey="clicks" name="Clicks" stroke={C.green} fill="url(#colorClicks)" strokeWidth={2} />
                    <Area type="monotone" dataKey="spend" name="Spend (€)" stroke={C.gold} fill="url(#colorSpend)" strokeWidth={2} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Pie chart — campaign distribution */}
        <ChartCard title="Campaign Split">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, "Share"]} contentStyle={{ background: "oklch(0.11 0.03 265)", border: `1px solid ${C.cardBorder}`, borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10, color: C.textSecondary }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* CTR vs Spend comparison bar chart */}
      {chartData.length > 0 && (
        <ChartCard title="CTR vs Spend — Daily Comparison">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0.04 265)" />
              <XAxis dataKey="date" tick={{ fill: C.textMuted, fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fill: C.textMuted, fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: C.textMuted, fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: C.textSecondary }} />
              <Bar yAxisId="left" dataKey="ctr" name="CTR (%)" fill={C.teal} radius={[3, 3, 0, 0]} />
              <Bar yAxisId="right" dataKey="spend" name="Spend (€)" fill={C.gold} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Campaigns list */}
      <ChartCard title="Active Campaigns">
        {campaignsLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: C.cardInner }} />)}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "oklch(0.55 0.18 25 / 0.15)" }}>🔴</div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{c.name}</p>
                    <p className="text-xs" style={{ color: C.textSecondary }}>ID: {c.id} · {c.objective}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: c.status === "ACTIVE" ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(0.55 0.04 265 / 0.15)", color: c.status === "ACTIVE" ? C.green : C.textSecondary }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs" style={{ color: C.textSecondary }}>No campaigns found or API not connected yet</p>
            <a href="https://ads.reddit.com" target="_blank" rel="noopener noreferrer" className="text-xs mt-2 inline-flex items-center gap-1 underline" style={{ color: C.gold }}>
              Open Reddit Ads Manager <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </ChartCard>

      {/* AI Suggestions */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" style={{ color: C.gold }} />
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>AI Optimization Suggestions</h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.55 0.18 65 / 0.15)", color: C.gold }}>
            {suggestions.length - appliedSuggestions.size - dismissedSuggestions.size} active
          </span>
        </div>
        <div className="space-y-2">
          {suggestions.map((s, i) => {
            if (dismissedSuggestions.has(i)) return null;
            return (
              <AISuggestion
                key={i}
                text={s}
                applied={appliedSuggestions.has(i)}
                onApply={() => setAppliedSuggestions(prev => { const s = new Set(prev); s.add(i); return s; })}
                onDismiss={() => setDismissedSuggestions(prev => { const s = new Set(prev); s.add(i); return s; })}
              />
            );
          })}
          {appliedSuggestions.size > 0 && (
            <p className="text-xs mt-2" style={{ color: C.green }}>
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
              {appliedSuggestions.size} suggestion{appliedSuggestions.size > 1 ? "s" : ""} marked for implementation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "tiktok" | "reddit" | "feedback" | "timeline" | "funnel" | "email" | "abtest" | "personas" | "integrations">("overview");
  const { data: abResults } = trpc.admin.getAbResults.useQuery();


  const { data: stats, isLoading, refetch } = trpc.admin.stats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-3">
          <Moon className="w-8 h-8 animate-pulse" style={{ color: C.gold }} />
          <p className="text-sm" style={{ color: C.textSecondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: C.gold }} />
          <p className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Admin Login Required</p>
          <p className="text-sm mb-4" style={{ color: C.textSecondary }}>Please sign in with your admin account</p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${C.gold}, oklch(0.65 0.20 55))`, color: "oklch(0.10 0.02 255)" }}
          >
            Sign In
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <div className="mt-4">
            <button onClick={() => navigate("/")} className="text-xs underline" style={{ color: C.textMuted }}>
              Go to homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "campaigns", label: "Campaigns", icon: TrendingUp },
    { id: "tiktok", label: "TikTok", icon: Zap },
    { id: "reddit", label: "Reddit Ads", icon: Target },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "timeline", label: "Timeline", icon: TrendingUp },
    { id: "funnel", label: "Funnel", icon: Activity },
    { id: "email", label: "Email", icon: Mail },
    { id: "abtest", label: "A/B Tests", icon: Sparkles },
    { id: "personas", label: "Personas", icon: Users },
    { id: "integrations", label: "Integrations", icon: Cpu },
  ] as const;

  // Funnel conversion data for bar chart
  const funnelChartData = [
    { step: "Quiz", value: stats?.quizCount ?? 0 },
    { step: "Email", value: stats?.leadCount ?? 0 },
    { step: "Orders", value: stats?.completedOrderCount ?? stats?.orderCount ?? 0 },
    { step: "Reviews", value: stats?.feedbackCount ?? 0 },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between" style={{ background: "oklch(0.07 0.02 255 / 0.95)", borderBottom: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))" }}>
            <Moon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: C.textPrimary }}>Deep Sleep Reset</p>
            <p className="text-xs" style={{ color: C.textSecondary }}>Admin Dashboard · {user.name}</p>
          </div>
        </div>
        {/* Revenue quick stats in header */}
        {stats && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "oklch(0.55 0.18 145 / 0.12)", border: "1px solid oklch(0.55 0.18 145 / 0.25)" }}>
              <DollarSign className="w-3.5 h-3.5" style={{ color: C.green }} />
              <div className="text-left">
                <p className="text-xs font-bold leading-none" style={{ color: C.green }}>${(stats.revenue ?? 0).toFixed(2)}</p>
                <p className="text-xs leading-none mt-0.5" style={{ color: C.textMuted }}>≈ {((stats.revenue ?? 0) * 23.5).toFixed(0)} Kč</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "oklch(0.78 0.18 65 / 0.12)", border: "1px solid oklch(0.78 0.18 65 / 0.25)" }}>
              <ShoppingCart className="w-3.5 h-3.5" style={{ color: C.gold }} />
              <p className="text-xs font-bold" style={{ color: C.gold }}>{stats.completedOrderCount ?? stats.orderCount} orders</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ background: "oklch(0.12 0.025 255)", border: `1px solid ${C.cardBorder}` }}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} style={{ color: C.textSecondary }} />
          </button>
          <button onClick={() => navigate("/")} className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80" style={{ background: "oklch(0.12 0.025 255)", border: `1px solid ${C.cardBorder}`, color: C.textSecondary }}>
            ← Site
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-fit px-2"
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white" }
                : { color: C.textSecondary }
              }
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Overview Tab (Phase 1 — Professional KPIs + Funnel) ─────────────────── */}
        {activeTab === "overview" && (
          <OverviewTab stats={stats} isLoading={isLoading} refetch={refetch} />
        )}

        {/* ── Campaigns Tab ────────────────────────────────────────────────── */}
        {activeTab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Active Ad Campaigns</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.55 0.18 145 / 0.15)", color: C.green }}>Live data</span>
            </div>

            {/* TikTok */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: C.cardInner }}>🎵</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>TikTok Ads</p>
                    <p className="text-xs" style={{ color: C.textSecondary }}>Deep Sleep Reset — $4</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "oklch(0.78 0.18 65 / 0.15)", color: C.gold }}>Under Review</span>
                  <a href="https://ads.tiktok.com/i18n/manage/campaign?aadvid=7631884469462089744" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: C.textSecondary }} />
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[{ label: "Budget/day", value: "€101/day" }, { label: "Impressions", value: "—" }, { label: "Link clicks", value: "—" }, { label: "CTR", value: "—" }].map(m => (
                  <div key={m.label}>
                    <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{m.value}</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Google */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: C.cardInner }}>🔍</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Google Ads</p>
                    <p className="text-xs" style={{ color: C.textSecondary }}>Deep Sleep Reset — $4</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "oklch(0.55 0.04 265 / 0.15)", color: C.textSecondary }}>Paused</span>
                  <a href="https://ads.google.com/aw/campaigns" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: C.textSecondary }} />
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[{ label: "Budget/day", value: "—" }, { label: "Impressions", value: "151" }, { label: "Link clicks", value: "0" }, { label: "CTR", value: "0%" }].map(m => (
                  <div key={m.label}>
                    <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{m.value}</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Open TikTok Ads Manager", link: "https://ads.tiktok.com/i18n/manage/campaign?aadvid=7631884469462089744", icon: "🎵" },
                  { label: "Open Google Ads", link: "https://ads.google.com/aw/campaigns", icon: "🔍" },
                  { label: "View Gumroad Sales", link: "https://app.gumroad.com/dashboard", icon: "💰" },
                  { label: "Reddit Ads Manager", link: "https://ads.reddit.com", icon: "🔴" },
                ].map(action => (
                  <a key={action.label} href={action.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl transition-all hover:opacity-80"
                    style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                    <span className="text-base">{action.icon}</span>
                    <span className="text-xs flex-1" style={{ color: C.textSecondary }}>{action.label}</span>
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>Optimization Checklist</h3>
              <div className="space-y-2">
                {[
                  { done: true, text: "TikTok campaign created (TESTHNED) — €101/day" },
                  { done: false, text: "TikTok campaign under review — wait 1-24h for approval" },
                  { done: true, text: "Reddit Ads campaign launched — DSR-Traffic-Insomnia-01, €10/day" },
                  { done: false, text: "Google Ads — create new campaign for deepsleep.mom" },
                  { done: false, text: "Microsoft Ads — send appeal email to get account unblocked" },
                  { done: true, text: "Gumroad fixed price $4 set" },
                  { done: true, text: "14-language support live" },
                  { done: true, text: "AI chatbot Luna integrated" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.green }} />
                      : <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.textSecondary }} />
                    }
                    <p className="text-xs" style={{ color: item.done ? C.textSecondary : C.textPrimary }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TikTok Ads Tab ───────────────────────────────────────────────── */}
        {activeTab === "tiktok" && <TikTokAdsTab />}

        {/* ── Reddit Ads Tab ───────────────────────────────────────────────── */}
        {activeTab === "reddit" && <RedditAdsTab />}

        {/* ── Feedback Tab ─────────────────────────────────────────────────── */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <StatCard icon={Star} label="Average Rating" value={stats?.avgRating ? `${stats.avgRating}/5` : "—"} sub="From all reviews" color={C.gold} />
              <StatCard icon={MessageSquare} label="Total Feedbacks" value={stats?.feedbackCount ?? 0} sub="Submitted" color={C.pink} />
            </div>

            {stats?.recentFeedbacks && stats.recentFeedbacks.length > 0 ? (
              <ChartCard title="Recent Feedback">
                <div className="space-y-3">
                  {stats.recentFeedbacks.map((fb: { id: number; rating: number | null; liked: string | null; improved: string | null; createdAt: Date }) => (
                    <div key={fb.id} className="p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className="w-3.5 h-3.5" fill={s <= (fb.rating ?? 0) ? C.gold : "none"} style={{ color: C.gold }} />
                          ))}
                        </div>
                        <span className="text-xs ml-auto" style={{ color: C.textMuted }}>
                          {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      {fb.liked && <p className="text-xs mb-1" style={{ color: C.textSecondary }}>👍 {fb.liked}</p>}
                      {fb.improved && <p className="text-xs" style={{ color: C.textMuted }}>💡 {fb.improved}</p>}
                    </div>
                  ))}
                </div>
              </ChartCard>
            ) : (
              <div className="rounded-2xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: C.textMuted }} />
                <p className="text-sm" style={{ color: C.textSecondary }}>No feedback yet</p>
                <p className="text-xs mt-1" style={{ color: C.textMuted }}>Feedback will appear here after customers submit reviews</p>
          </div>
            )}
          </div>
        )}

        {/* ── Email Broadcast Tab ──────────────────────────────────────────────── */}
        {activeTab === "email" && (
          <EmailBroadcastTab />
        )}

        {/* ── Timeline Tab ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <TimelineCharts />
          </div>
        )}

        {/* ── A/B Test Tab ────────────────────────────────────────────────────────────────────────────────────── */}
        {activeTab === "abtest" && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: C.textPrimary }}>Upsell A/B Test Results</h3>
              <p className="text-xs mb-4" style={{ color: C.textMuted }}>Variant A = original layout · Variant B = new layout · Deterministic 50/50 split by session ID</p>
              {(!abResults || abResults.length === 0) ? (
                <p className="text-xs" style={{ color: C.textMuted }}>No A/B test data yet. Data appears when users visit upsell pages.</p>
              ) : (
                <div className="space-y-3">
                  {["upsell1", "upsell2", "upsell3"].map(page => {
                    const pageResults = abResults.filter(r => r.page === page);
                    if (pageResults.length === 0) return null;
                    const varA = pageResults.find(r => r.variant === "A");
                    const varB = pageResults.find(r => r.variant === "B");
                    const winner = varA && varB ? (varA.convRate > varB.convRate ? "A" : varB.convRate > varA.convRate ? "B" : null) : null;
                    const pValue = varA?.pValue ?? varB?.pValue;
                    const isSignificant = varA?.isSignificant || varB?.isSignificant;
                    return (
                      <div key={page} className="rounded-xl p-4" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold capitalize" style={{ color: C.textPrimary }}>{page.replace("upsell", "Upsell ")} Page</p>
                          <div className="flex items-center gap-2">
                            {isSignificant && winner && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${C.green}20`, color: C.green }}>Variant {winner} wins ✓</span>}
                            {!isSignificant && (varA || varB) && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${C.gold}15`, color: C.gold }}>Collecting data...</span>}
                          </div>
                        </div>
                        {pValue !== undefined && (
                          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg" style={{ background: isSignificant ? `${C.green}08` : `${C.gold}08`, border: `1px solid ${isSignificant ? C.green : C.gold}25` }}>
                            <span className="text-xs" style={{ color: C.textMuted }}>p-value:</span>
                            <span className="text-xs font-bold" style={{ color: isSignificant ? C.green : C.gold }}>{pValue.toFixed(4)}</span>
                            <span className="text-xs" style={{ color: C.textMuted }}>·</span>
                            <span className="text-xs" style={{ color: isSignificant ? C.green : C.gold }}>{isSignificant ? "95%+ confidence" : "Need more samples"}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {[varA, varB].map((v, vi) => v ? (
                            <div key={vi} className="rounded-lg p-3" style={{ background: winner === v.variant && isSignificant ? `${C.green}10` : C.card, border: `1px solid ${winner === v.variant && isSignificant ? `${C.green}40` : C.cardBorder}` }}>
                              <p className="text-xs font-bold mb-2" style={{ color: winner === v.variant && isSignificant ? C.green : C.textSecondary }}>Variant {v.variant} {winner === v.variant && isSignificant ? "★" : ""}</p>
                              <div className="space-y-1">
                                <div className="flex justify-between"><span className="text-xs" style={{ color: C.textMuted }}>Shown</span><span className="text-xs font-semibold" style={{ color: C.textPrimary }}>{v.impressions}</span></div>
                                <div className="flex justify-between"><span className="text-xs" style={{ color: C.textMuted }}>Converted</span><span className="text-xs font-semibold" style={{ color: C.textPrimary }}>{v.conversions}</span></div>
                                <div className="flex justify-between"><span className="text-xs" style={{ color: C.textMuted }}>Conv. Rate</span><span className="text-xs font-bold" style={{ color: winner === v.variant && isSignificant ? C.green : C.textPrimary }}>{v.convRate}%</span></div>
                                <div className="flex justify-between"><span className="text-xs" style={{ color: C.textMuted }}>Revenue</span><span className="text-xs font-semibold" style={{ color: C.gold }}>${v.totalRevenue}</span></div>
                                {v.uplift !== undefined && v.uplift !== 0 && (
                                  <div className="flex justify-between"><span className="text-xs" style={{ color: C.textMuted }}>Uplift</span><span className="text-xs font-bold" style={{ color: (v.uplift ?? 0) > 0 ? C.green : C.red }}>{(v.uplift ?? 0) > 0 ? "+" : ""}{v.uplift}%</span></div>
                                )}
                              </div>
                            </div>
                          ) : null)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="rounded-2xl p-5 mt-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.textPrimary }}>🤖 AI Doporučení</h3>
              <RecommendationsPanel />
            </div>
          </div>
        )}
        {/* ── Funnel Tab ─────────────────────────────────────────────────────────────────── */}
        {/* ── Personas Tab ─────────────────────────────────────────────────────────────────── */}
        {activeTab === "personas" && (
          <PersonaMetricsDashboard />
        )}
        {/* ── Integrations Tab ─────────────────────────────────────────────── */}
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "funnel" && (
          <div className="space-y-4">
            <ChartCard title="Full Funnel Overview">
              <div className="space-y-3">
                {[
                  { step: "1", label: "Ad Click (TikTok/Reddit/Google)", value: "—", note: "Tracking via ad platforms", color: C.purple },
                  { step: "2", label: "Landing Page Visit", value: "—", note: "deep-sleep-reset.com", color: C.blue },
                  { step: "3", label: "Quiz Started", value: String(stats?.quizStarts ?? stats?.quizCount ?? 0), note: "Chronotype assessment", color: C.teal },
                  { step: "4", label: "Email Captured", value: String(stats?.leadCount ?? 0), note: "Lead magnet", color: C.green },
                  { step: "5", label: "Order Completed", value: String(stats?.completedOrderCount ?? stats?.orderCount ?? 0), note: "$4 main product", color: C.gold },
                  { step: "6", label: "Feedback Submitted", value: String(stats?.feedbackCount ?? 0), note: "Post-purchase", color: C.pink },
                ].map(step => (
                  <div key={step.step} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${step.color}20`, color: step.color }}>
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: C.textPrimary }}>{step.label}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>{step.note}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: step.color }}>{step.value}</p>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Funnel visualization */}
            <ChartCard title="Funnel Visualization">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={funnelChartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0.04 265)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: C.textMuted, fontSize: 10 }} />
                  <YAxis type="category" dataKey="step" tick={{ fill: C.textSecondary, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>
                    {funnelChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={[C.teal, C.purple, C.green, C.gold][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>Revenue Breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Main ($4)", pct: "100%", color: C.green },
                  { label: "OTO1 ($7)", pct: "0%", color: C.gold },
                  { label: "OTO2 ($17)", pct: "0%", color: C.purple },
                ].map(r => (
                  <div key={r.label} className="text-center p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                    <p className="text-lg font-bold" style={{ color: r.color }}>{r.pct}</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>{r.label}</p>
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

// ── TikTok Ads Tab Component ─────────────────────────────────────────────────
function TikTokAdsTab() {
  const { data: account } = trpc.tiktok.getAccount.useQuery();
  const { data: campaigns } = trpc.tiktok.getCampaigns.useQuery();

  // KPI metrics — live when API key is set, placeholder until then
  const kpis = [
    { label: "Daily Budget", value: "€101/day", sub: "TESTHNED campaign", color: C.gold, icon: DollarSign },
    { label: "Impressions", value: "—", sub: "Pending approval", color: C.purple, icon: BarChart3 },
    { label: "Link Clicks", value: "—", sub: "Awaiting review", color: C.blue, icon: Activity },
    { label: "CTR", value: "—", sub: "Target: >1.5%", color: C.teal, icon: TrendingUp },
    { label: "CPC", value: "—", sub: "Target: <$0.50", color: C.green, icon: Zap },
    { label: "ROAS", value: "—", sub: "Target: >3×", color: C.pink, icon: Sparkles },
  ];

  const optimizationSteps = [
    { done: true, text: "Campaign TESTHNED created — €101/day budget set" },
    { done: false, text: "Campaign under review — approval expected within 1–24h" },
    { done: false, text: "Add TikTok Pixel to track ViewContent + Purchase events" },
    { done: false, text: "Upload 3–5 creative variants (hook test: problem vs. solution)" },
    { done: false, text: "Enable Advantage+ audience targeting for sleep-related interests" },
    { done: false, text: "Set up Custom Audience from website visitors (retargeting)" },
    { done: false, text: "A/B test landing page: quiz vs. direct VSL" },
    { done: false, text: "Scale winning ad set: 2× budget every 3 days if ROAS >3×" },
  ];

  const creativeIdeas = [
    { hook: "POV: You haven't slept properly in weeks...", type: "Problem-aware", ctr: "High" },
    { hook: "I fixed my sleep in 7 nights with this protocol", type: "Testimonial", ctr: "Very High" },
    { hook: "Sleep doctors don't want you to know this", type: "Curiosity", ctr: "High" },
    { hook: "The 7-night reset that actually works", type: "Solution-aware", ctr: "Medium" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>🎵</div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: C.textPrimary }}>TikTok Ads Manager</h2>
            <p className="text-xs" style={{ color: C.textSecondary }}>Account: {account?.advertiser_name ?? "Deep Sleep Reset"} · ID: {account?.advertiser_id || "7631884469462089744"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "oklch(0.78 0.18 65 / 0.15)", color: C.gold }}>Under Review</span>
          <a href="https://ads.tiktok.com/i18n/manage/campaign?aadvid=7631884469462089744" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all hover:opacity-80"
            style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}`, color: C.textSecondary }}>
            <ExternalLink className="w-3 h-3" />
            Open TikTok Ads
          </a>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
              <p className="text-xs" style={{ color: C.textSecondary }}>{kpi.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: kpi.value === "—" ? C.textMuted : C.textPrimary }}>{kpi.value}</p>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Active Campaigns */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>Active Campaigns</h3>
        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map((c: { campaign_id: string; campaign_name: string; budget: number; status: string }) => (
              <div key={c.campaign_id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{c.campaign_name}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>ID: {c.campaign_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: C.gold }}>€{c.budget}/day</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: c.status === 'ENABLE' ? `${C.green}20` : `${C.gold}20`, color: c.status === 'ENABLE' ? C.green : C.gold }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Placeholder — real data once API token is configured */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>TESTHNED</p>
                <p className="text-xs" style={{ color: C.textMuted }}>Deep Sleep Reset — $4 · Awareness objective</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: C.gold }}>€101/day</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${C.gold}20`, color: C.gold }}>Under Review</span>
              </div>
            </div>
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: C.textMuted }}>💡 Live campaign data available after setting TIKTOK_ADS_ACCESS_TOKEN in Settings → Integrations</p>
      </div>

      {/* Creative Ideas */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>🎬 Creative Hook Ideas</h3>
        <div className="space-y-2">
          {creativeIdeas.map((idea, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${C.purple}20`, color: C.purple }}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: C.textPrimary }}>\"{ idea.hook}\"</p>
                <p className="text-xs" style={{ color: C.textMuted }}>{idea.type}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: idea.ctr === 'Very High' ? `${C.green}20` : `${C.gold}20`, color: idea.ctr === 'Very High' ? C.green : C.gold }}>CTR: {idea.ctr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Checklist */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>✅ TikTok Optimization Checklist</h3>
        <div className="space-y-2">
          {optimizationSteps.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              {item.done
                ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.green }} />
                : <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.textSecondary }} />
              }
              <p className="text-xs" style={{ color: item.done ? C.textSecondary : C.textPrimary }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Audiences */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>🎯 Target Audiences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "Insomnia Sufferers", age: "25–54", interest: "Sleep disorders, health", size: "~2M EU", color: C.purple },
            { name: "Biohackers", age: "22–40", interest: "Optimization, nootropics", size: "~500K EU", color: C.teal },
            { name: "Stressed Professionals", age: "28–45", interest: "Productivity, wellness", size: "~3M EU", color: C.blue },
            { name: "New Parents", age: "25–38", interest: "Baby sleep, exhaustion", size: "~1.5M EU", color: C.gold },
          ].map(aud => (
            <div key={aud.name} className="p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: aud.color }} />
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{aud.name}</p>
              </div>
              <p className="text-xs" style={{ color: C.textMuted }}>Age: {aud.age} · {aud.interest}</p>
              <p className="text-xs mt-0.5" style={{ color: aud.color }}>{aud.size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Integrations Tab Component ─────────────────────────────────────────────
function IntegrationsTab() {
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPerms, setNewKeyPerms] = useState<("read" | "write" | "email")[]>(["read"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [newWHName, setNewWHName] = useState("");
  const [newWHUrl, setNewWHUrl] = useState("");
  const [newWHEvents, setNewWHEvents] = useState<("new_order" | "new_lead" | "quiz_completed")[]>(["new_order"]);
  const [createdWHSecret, setCreatedWHSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const utils = trpc.useUtils();

  const { data: apiKeys, isLoading: keysLoading } = trpc.integrations.listApiKeys.useQuery();
  const { data: webhooks, isLoading: whLoading } = trpc.integrations.listWebhooks.useQuery();

  const createKey = trpc.integrations.createApiKey.useMutation({
    onSuccess: (data) => {
      setCreatedKey(data.key);
      utils.integrations.listApiKeys.invalidate();
      toast.success(`API key "${data.name}" created`);
    },
    onError: () => toast.error("Failed to create API key"),
  });

  const revokeKey = trpc.integrations.revokeApiKey.useMutation({
    onSuccess: () => {
      utils.integrations.listApiKeys.invalidate();
      toast.success("API key revoked");
    },
  });

  const createWH = trpc.integrations.createWebhook.useMutation({
    onSuccess: (data) => {
      setCreatedWHSecret(data.secret ?? null);
      utils.integrations.listWebhooks.invalidate();
      toast.success("Webhook created");
    },
    onError: () => toast.error("Failed to create webhook"),
  });

  const toggleWH = trpc.integrations.updateWebhook.useMutation({
    onSuccess: () => utils.integrations.listWebhooks.invalidate(),
  });

  const deleteWH = trpc.integrations.deleteWebhook.useMutation({
    onSuccess: () => {
      utils.integrations.listWebhooks.invalidate();
      toast.success("Webhook deleted");
    },
  });

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePerm = (p: "read" | "write" | "email") =>
    setNewKeyPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const toggleEvent = (e: "new_order" | "new_lead" | "quiz_completed") =>
    setNewWHEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  return (
    <div className="space-y-6">
      {/* API Documentation */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.textPrimary }}>
          <Cpu className="w-4 h-4" style={{ color: C.blue }} />
          External REST API — LeadOS / CRM Integration
        </h3>
        <p className="text-xs mb-3" style={{ color: C.textSecondary }}>
          Base URL: <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: C.cardInner, color: C.gold }}>https://deep-sleep-reset.com/api/external</code>
        </p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { method: "GET", path: "/leads", desc: "List quiz leads + email leads", perm: "read" },
            { method: "GET", path: "/orders", desc: "List completed orders", perm: "read" },
            { method: "GET", path: "/analytics", desc: "KPI metrics (revenue, orders, CVR, AOV)", perm: "read" },
            { method: "GET", path: "/email-sequences", desc: "Email sequence status per customer", perm: "read" },
            { method: "POST", path: "/leads", desc: "Create/update lead from LeadOS", perm: "write" },
            { method: "POST", path: "/email/send", desc: "Send transactional email via Brevo", perm: "email" },
          ].map(ep => (
            <div key={ep.path} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: ep.method === "GET" ? "oklch(0.55 0.18 145 / 0.2)" : "oklch(0.65 0.15 240 / 0.2)", color: ep.method === "GET" ? C.green : C.blue }}>{ep.method}</span>
              <code className="text-xs" style={{ color: C.gold }}>{ep.path}</code>
              <span className="text-xs flex-1" style={{ color: C.textSecondary }}>{ep.desc}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: C.cardBorder, color: C.textMuted }}>perm:{ep.perm}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: C.textMuted }}>Auth: <code style={{ color: C.textSecondary }}>Authorization: Bearer &lt;api_key&gt;</code></p>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: C.textPrimary }}>
          <Zap className="w-4 h-4" style={{ color: C.gold }} />
          API Keys
        </h3>

        {/* Create new key */}
        <div className="p-4 rounded-xl mb-4" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
          <p className="text-xs font-semibold mb-3" style={{ color: C.textSecondary }}>Generate New API Key</p>
          <div className="flex gap-2 mb-3">
            <input
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. LeadOS Production)"
              className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
              style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }}
            />
          </div>
          <div className="flex gap-2 mb-3">
            {(["read", "write", "email"] as const).map(p => (
              <button
                key={p}
                onClick={() => togglePerm(p)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: newKeyPerms.includes(p) ? `${C.blue}30` : C.bg,
                  border: `1px solid ${newKeyPerms.includes(p) ? C.blue : C.cardBorder}`,
                  color: newKeyPerms.includes(p) ? C.blue : C.textMuted,
                }}
              >{p}</button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!newKeyName.trim()) { toast.error("Enter a key name"); return; }
              if (newKeyPerms.length === 0) { toast.error("Select at least one permission"); return; }
              createKey.mutate({ name: newKeyName.trim(), permissions: newKeyPerms });
              setNewKeyName("");
            }}
            disabled={createKey.isPending}
            className="text-xs px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ background: C.gold, color: "oklch(0.10 0.02 255)" }}
          >
            {createKey.isPending ? "Generating..." : "Generate Key"}
          </button>
        </div>

        {/* Show created key */}
        {createdKey && (
          <div className="p-3 rounded-xl mb-4 flex items-center gap-3" style={{ background: "oklch(0.55 0.18 145 / 0.1)", border: `1px solid ${C.green}` }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.green }} />
            <code className="text-xs flex-1 break-all" style={{ color: C.green }}>{createdKey}</code>
            <button onClick={() => copyText(createdKey, setCopiedKey)} className="shrink-0">
              {copiedKey ? <Check className="w-4 h-4" style={{ color: C.green }} /> : <Copy className="w-4 h-4" style={{ color: C.textMuted }} />}
            </button>
          </div>
        )}
        {createdKey && <p className="text-xs mb-4" style={{ color: C.red }}>⚠ Copy this key now — it will not be shown again.</p>}

        {/* Keys list */}
        {keysLoading ? (
          <p className="text-xs" style={{ color: C.textMuted }}>Loading...</p>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-2">
            {apiKeys.map(k => (
              <div key={k.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: k.active ? C.textPrimary : C.textMuted }}>{k.name}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    Perms: {JSON.parse(k.permissions || "[]").join(", ")} &middot; Created: {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsedAt && ` · Last used: ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: k.active ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(0.65 0.18 25 / 0.15)", color: k.active ? C.green : C.red }}>
                  {k.active ? "Active" : "Revoked"}
                </span>
                {k.active && (
                  <button
                    onClick={() => revokeKey.mutate({ id: k.id })}
                    className="text-xs px-3 py-1 rounded-lg transition-all hover:opacity-80"
                    style={{ background: "oklch(0.65 0.18 25 / 0.15)", color: C.red }}
                  >Revoke</button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: C.textMuted }}>No API keys yet.</p>
        )}
      </div>

      {/* Outbound Webhooks */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: C.textPrimary }}>
          <Send className="w-4 h-4" style={{ color: C.purple }} />
          Outbound Webhooks
        </h3>
        <p className="text-xs mb-4" style={{ color: C.textSecondary }}>
          Push real-time events to LeadOS, Zapier, or any webhook endpoint. Signed with HMAC-SHA256.
        </p>

        {/* Create webhook */}
        <div className="p-4 rounded-xl mb-4" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
          <p className="text-xs font-semibold mb-3" style={{ color: C.textSecondary }}>Add Webhook</p>
          <div className="flex gap-2 mb-2">
            <input
              value={newWHName}
              onChange={e => setNewWHName(e.target.value)}
              placeholder="Name (e.g. LeadOS)"
              className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
              style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }}
            />
          </div>
          <div className="flex gap-2 mb-2">
            <input
              value={newWHUrl}
              onChange={e => setNewWHUrl(e.target.value)}
              placeholder="https://your-crm.com/webhook"
              className="flex-1 text-xs px-3 py-2 rounded-lg outline-none"
              style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }}
            />
          </div>
          <div className="flex gap-2 mb-3">
            {(["new_order", "new_lead", "quiz_completed"] as const).map(e => (
              <button
                key={e}
                onClick={() => toggleEvent(e)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: newWHEvents.includes(e) ? `${C.purple}30` : C.bg,
                  border: `1px solid ${newWHEvents.includes(e) ? C.purple : C.cardBorder}`,
                  color: newWHEvents.includes(e) ? C.purple : C.textMuted,
                }}
              >{e}</button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!newWHName.trim() || !newWHUrl.trim()) { toast.error("Name and URL required"); return; }
              if (newWHEvents.length === 0) { toast.error("Select at least one event"); return; }
              createWH.mutate({ name: newWHName.trim(), url: newWHUrl.trim(), events: newWHEvents });
              setNewWHName(""); setNewWHUrl("");
            }}
            disabled={createWH.isPending}
            className="text-xs px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ background: C.purple, color: "#fff" }}
          >
            {createWH.isPending ? "Adding..." : "Add Webhook"}
          </button>
        </div>

        {/* Show created secret */}
        {createdWHSecret && (
          <div className="p-3 rounded-xl mb-4 flex items-center gap-3" style={{ background: "oklch(0.65 0.15 280 / 0.1)", border: `1px solid ${C.purple}` }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: C.purple }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs mb-1" style={{ color: C.textSecondary }}>Signing Secret (save now):</p>
              <code className="text-xs break-all" style={{ color: C.purple }}>{createdWHSecret}</code>
            </div>
            <button onClick={() => copyText(createdWHSecret, setCopiedSecret)} className="shrink-0">
              {copiedSecret ? <Check className="w-4 h-4" style={{ color: C.purple }} /> : <Copy className="w-4 h-4" style={{ color: C.textMuted }} />}
            </button>
          </div>
        )}

        {/* Webhooks list */}
        {whLoading ? (
          <p className="text-xs" style={{ color: C.textMuted }}>Loading...</p>
        ) : webhooks && webhooks.length > 0 ? (
          <div className="space-y-2">
            {webhooks.map(wh => (
              <div key={wh.id} className="p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{wh.name}</p>
                    <p className="text-xs truncate" style={{ color: C.textMuted }}>{wh.url}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: wh.active ? "oklch(0.55 0.18 145 / 0.15)" : "oklch(0.65 0.18 25 / 0.15)", color: wh.active ? C.green : C.red }}>
                    {wh.active ? "Active" : "Paused"}
                  </span>
                  <button
                    onClick={() => toggleWH.mutate({ id: wh.id, active: !wh.active })}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: C.cardBorder, color: C.textSecondary }}
                  >{wh.active ? "Pause" : "Resume"}</button>
                  <button
                    onClick={() => deleteWH.mutate({ id: wh.id })}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: "oklch(0.65 0.18 25 / 0.15)", color: C.red }}
                  >Delete</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(JSON.parse(wh.events || "[]") as string[]).map(ev => (
                    <span key={ev} className="text-xs px-2 py-0.5 rounded" style={{ background: `${C.purple}20`, color: C.purple }}>{ev}</span>
                  ))}
                  {wh.lastStatus !== null && wh.lastStatus !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: C.cardBorder, color: wh.lastStatus >= 200 && wh.lastStatus < 300 ? C.green : C.red }}>
                      Last: HTTP {wh.lastStatus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: C.textMuted }}>No webhooks configured yet.</p>
        )}
      </div>
    </div>
  );
}

// ── Email Broadcast Tab Component ────────────────────────────────────────────
function EmailBroadcastTab() {
  const [subject, setSubject] = useState("Your Deep Sleep Protocol is now available online");
  const [body, setBody] = useState("Hi,\n\nGreat news! Your 7-Night Deep Sleep Reset Protocol is now available as a full interactive web experience.\n\nYou can access it anytime at the link below — no download needed. We've also added a PDF version for offline use.\n\nSleep well,\nDeep Sleep Reset Team");
  const [audience, setAudience] = useState<"buyers" | "leads" | "all">("buyers");
  const [result, setResult] = useState<{ emails: string[]; subject: string; body: string; count: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: emailData } = trpc.admin.getBuyerEmails.useQuery();
  const broadcastMutation = trpc.admin.sendBroadcast.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success(`📧 Email list prepared for ${data.count} recipients!`);
    },
    onError: () => toast.error("Failed to prepare broadcast"),
  });

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.emails.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4" style={{ color: C.gold }} />
            <p className="text-xs" style={{ color: C.textSecondary }}>Buyers with email</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>{emailData?.buyerCount ?? 0}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4" style={{ color: C.purple }} />
            <p className="text-xs" style={{ color: C.textSecondary }}>Email leads</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: C.textPrimary }}>{emailData?.leadCount ?? 0}</p>
        </div>
      </div>

      <div className="rounded-2xl p-5 space-y-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>📧 Compose Broadcast Email</h3>

        <div>
          <p className="text-xs mb-2" style={{ color: C.textSecondary }}>Audience</p>
          <div className="flex gap-2">
            {(["buyers", "leads", "all"] as const).map(a => (
              <button key={a} onClick={() => setAudience(a)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={audience === a
                  ? { background: C.gold + "33", color: C.gold, border: `1px solid ${C.gold}55` }
                  : { background: C.cardInner, color: C.textSecondary, border: `1px solid ${C.cardBorder}` }}>
                {a === "buyers" ? `🛋️ Buyers (${emailData?.buyerCount ?? 0})` : a === "leads" ? `📌 Leads (${emailData?.leadCount ?? 0})` : `🌍 All (${(emailData?.buyerCount ?? 0) + (emailData?.leadCount ?? 0)})`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs mb-1" style={{ color: C.textSecondary }}>Subject</p>
          <input value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm"
            style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }} />
        </div>

        <div>
          <p className="text-xs mb-1" style={{ color: C.textSecondary }}>Message body</p>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
            className="w-full px-3 py-2 rounded-xl text-sm resize-none"
            style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }} />
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Protocol + PDF links will be appended automatically.</p>
        </div>

        <button
          onClick={() => broadcastMutation.mutate({ subject, body, audience, includeDownloadLink: true })}
          disabled={broadcastMutation.isPending}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${C.gold}, oklch(0.65 0.18 55))`, color: "black" }}>
          <Send className="w-4 h-4" />
          {broadcastMutation.isPending ? "Preparing..." : "Prepare Email List & Preview"}
        </button>
      </div>

      {result && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: C.card, border: `1px solid oklch(0.55 0.18 145 / 0.3)` }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
            <p className="text-sm font-semibold" style={{ color: C.green }}>{result.count} email addresses prepared</p>
          </div>
          <p className="text-xs" style={{ color: C.textSecondary }}>Subject: {result.subject}</p>

          <div className="rounded-xl p-3" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
            <p className="text-xs font-mono break-all" style={{ color: C.textMuted }}>
              {result.emails.slice(0, 10).join(", ")}{result.emails.length > 10 ? ` ... +${result.emails.length - 10} more` : ""}
            </p>
          </div>

          <button onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: C.gold + "22", color: C.gold, border: `1px solid ${C.gold}44` }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy all emails"}
          </button>

          <div className="rounded-xl p-3" style={{ background: "oklch(0.55 0.18 65 / 0.08)", border: `1px solid ${C.gold}22` }}>
            <p className="text-xs font-semibold mb-1" style={{ color: C.gold }}>Email body preview:</p>
            <pre className="text-xs whitespace-pre-wrap" style={{ color: C.textSecondary }}>
              {result.body.slice(0, 400)}{result.body.length > 400 ? "..." : ""}
            </pre>
          </div>

          <p className="text-xs" style={{ color: C.textMuted }}>
            Paste the email list into Mailchimp, SendGrid, or your email provider to send.
          </p>
        </div>
      )}
    </div>
  );
}
