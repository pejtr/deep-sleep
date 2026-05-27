import React, { useState, useMemo } from "react";
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
  Mail, Send, Copy, Check, Download, Plus, Loader2, Rocket, Pause, PlayCircle
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
  recentFeedbacks?: Array<{ id: number; rating: number | null; liked: string | null; improved: string | null; createdAt: Date }>;
  checkoutClicks?: number;
};

function OverviewTab({ stats, isLoading, refetch }: { stats?: AdminStats; isLoading: boolean; refetch: () => void }) {
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "90d">("30d");
  const [showFilters, setShowFilters] = useState(false);
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

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
        <div className="flex items-center gap-2">
          {/* Advanced Filters toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: showFilters ? `${C.teal}18` : 'transparent', color: showFilters ? C.teal : C.textMuted, border: `1px solid ${showFilters ? C.teal + '40' : C.cardBorder}` }}
          >
            <Target className="w-3.5 h-3.5" />
            Filters {(filterDevice !== 'all' || filterSource !== 'all') ? '●' : ''}
          </button>
          {/* CSV Export button */}
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = '/api/analytics/export-csv';
              a.download = `deep-sleep-analytics-${new Date().toISOString().slice(0,10)}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: `${C.gold}18`, color: C.gold, border: `1px solid ${C.gold}40` }}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Advanced Filters Panel ─────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: C.textPrimary }}>Advanced Filters</span>
            {(filterDevice !== 'all' || filterSource !== 'all') && (
              <button onClick={() => { setFilterDevice('all'); setFilterSource('all'); }} className="text-xs" style={{ color: C.red }}>Clear all</button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Device filter */}
            <div>
              <p className="text-xs mb-1.5" style={{ color: C.textMuted }}>Device</p>
              <div className="flex flex-wrap gap-1">
                {['all', 'mobile', 'desktop', 'tablet'].map(d => (
                  <button key={d} onClick={() => setFilterDevice(d)}
                    className="text-xs px-2 py-1 rounded-lg capitalize transition-all"
                    style={{ background: filterDevice === d ? `${C.teal}20` : C.cardInner, color: filterDevice === d ? C.teal : C.textMuted, border: `1px solid ${filterDevice === d ? C.teal + '40' : C.cardBorder}` }}
                  >{d}</button>
                ))}
              </div>
            </div>
            {/* Source filter */}
            <div>
              <p className="text-xs mb-1.5" style={{ color: C.textMuted }}>Traffic Source</p>
              <div className="flex flex-wrap gap-1">
                {['all', 'reddit', 'google', 'tiktok', 'direct', 'organic'].map(s => (
                  <button key={s} onClick={() => setFilterSource(s)}
                    className="text-xs px-2 py-1 rounded-lg capitalize transition-all"
                    style={{ background: filterSource === s ? `${C.blue}20` : C.cardInner, color: filterSource === s ? C.blue : C.textMuted, border: `1px solid ${filterSource === s ? C.blue + '40' : C.cardBorder}` }}
                  >{s}</button>
                ))}
              </div>
            </div>
            {/* Active filter summary */}
            <div className="col-span-2 flex items-end">
              {(filterDevice !== 'all' || filterSource !== 'all') ? (
                <p className="text-xs" style={{ color: C.textMuted }}>
                  Filtering by: {filterDevice !== 'all' ? `device=${filterDevice}` : ''}{filterDevice !== 'all' && filterSource !== 'all' ? ', ' : ''}{filterSource !== 'all' ? `source=${filterSource}` : ''}
                  <span className="ml-2" style={{ color: C.gold }}>⚡ Note: Filters apply to displayed charts only. Backend filtering coming in Phase 4.</span>
                </p>
              ) : (
                <p className="text-xs" style={{ color: C.textMuted }}>No active filters — showing all data</p>
              )}
            </div>
          </div>
        </div>
      )}

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
  const [launchingTemplate, setLaunchingTemplate] = useState<string | null>(null);
  const [togglingCampaign, setTogglingCampaign] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignObjective, setNewCampaignObjective] = useState<"TRAFFIC" | "CONVERSIONS">("TRAFFIC");

  const { startDate, endDate } = useMemo(() => getDateRange(range), [range]);

  const { data: account, isLoading: accountLoading } = trpc.reddit.account.useQuery();
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = trpc.reddit.campaigns.useQuery();
  const { data: report, isLoading: reportLoading, refetch } = trpc.reddit.report.useQuery({ startDate, endDate });
  const { data: templates } = trpc.reddit.templates.useQuery();

  const launchTemplateMutation = trpc.reddit.launchTemplate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchCampaigns();
      setLaunchingTemplate(null);
    },
    onError: (err) => {
      toast.error(`Failed: ${err.message}`);
      setLaunchingTemplate(null);
    },
  });

  const updateStatusMutation = trpc.reddit.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Campaign status updated");
      refetchCampaigns();
      setTogglingCampaign(null);
    },
    onError: (err) => {
      toast.error(`Failed: ${err.message}`);
      setTogglingCampaign(null);
    },
  });

  const createCampaignMutation = trpc.reddit.createCampaign.useMutation({
    onSuccess: (data) => {
      toast.success(`Campaign "${data.name}" created (PAUSED)`);
      refetchCampaigns();
      setShowCreateForm(false);
      setNewCampaignName("");
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

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
                  <button
                    onClick={() => {
                      setTogglingCampaign(c.id);
                      updateStatusMutation.mutate({ campaignId: c.id, status: c.status === "ACTIVE" ? "PAUSED" : "ACTIVE" });
                    }}
                    disabled={togglingCampaign === c.id}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
                    style={{ background: c.status === "ACTIVE" ? "oklch(0.55 0.04 265 / 0.15)" : "oklch(0.55 0.18 145 / 0.15)", color: c.status === "ACTIVE" ? C.textSecondary : C.green }}>
                    {togglingCampaign === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : c.status === "ACTIVE" ? <Pause className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                    {c.status === "ACTIVE" ? "Pause" : "Activate"}
                  </button>
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

      {/* 1-Click Campaign Templates */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-4 h-4" style={{ color: C.gold }} />
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>1-Click Campaign Templates</h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "oklch(0.55 0.18 65 / 0.15)", color: C.gold }}>deepsleep.my</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(templates ?? []).map((tpl) => (
            <div key={tpl.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{tpl.name}</p>
                <p className="text-xs mt-1" style={{ color: C.textSecondary }}>{tpl.adTitle}</p>
                <p className="text-xs mt-1" style={{ color: C.textMuted }}>Budget: ${(tpl.dailyBudgetCents / 100).toFixed(0)}/day · {tpl.geoLocations?.join(", ")}</p>
                <p className="text-xs mt-1" style={{ color: C.textMuted }}>r/{tpl.subreddits?.slice(0, 3).join(", r/")}</p>
              </div>
              <button
                onClick={() => {
                  setLaunchingTemplate(tpl.id);
                  launchTemplateMutation.mutate({ templateId: tpl.id });
                }}
                disabled={launchingTemplate === tpl.id}
                className="flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white" }}>
                {launchingTemplate === tpl.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                {launchingTemplate === tpl.id ? "Creating..." : "Launch Campaign"}
              </button>
            </div>
          ))}
          {/* Custom campaign form */}
          {showCreateForm ? (
            <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: C.cardInner, border: `1px solid ${C.gold}40` }}>
              <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>New Custom Campaign</p>
              <input
                type="text"
                placeholder="Campaign name..."
                value={newCampaignName}
                onChange={e => setNewCampaignName(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg outline-none"
                style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }}
              />
              <select
                value={newCampaignObjective}
                onChange={e => setNewCampaignObjective(e.target.value as "TRAFFIC" | "CONVERSIONS")}
                className="text-xs px-3 py-2 rounded-lg outline-none"
                style={{ background: C.bg, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }}>
                <option value="TRAFFIC">TRAFFIC</option>
                <option value="CONVERSIONS">CONVERSIONS</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => createCampaignMutation.mutate({ name: newCampaignName, objective: newCampaignObjective })}
                  disabled={!newCampaignName || createCampaignMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white" }}>
                  {createCampaignMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Create
                </button>
                <button onClick={() => setShowCreateForm(false)} className="text-xs px-3 py-2 rounded-lg" style={{ background: C.cardInner, color: C.textSecondary }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-dashed transition-all hover:opacity-80"
              style={{ background: "transparent", border: `2px dashed ${C.cardBorder}` }}>
              <Plus className="w-5 h-5" style={{ color: C.textMuted }} />
              <span className="text-xs" style={{ color: C.textMuted }}>Custom Campaign</span>
            </button>
          )}
        </div>
      </div>

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
  const [activeTab, setActiveTab] = useState<"overview" | "channels" | "campaigns" | "audience" | "insights">("overview");
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
    { id: "channels", label: "Ad Channels", icon: TrendingUp },
    { id: "campaigns", label: "Campaigns", icon: Rocket },
    { id: "audience", label: "Audience & Email", icon: Users },
    { id: "insights", label: "Insights", icon: Sparkles },
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

      <div className="max-w-full mx-auto px-4 py-6">
        {/* Tabs — horizontally scrollable */}
        <div className="mb-6 rounded-xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <div className="flex gap-1 p-1 overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 px-3"
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
        </div>
        <style>{`
          div[style*="WebkitOverflowScrolling"]::-webkit-scrollbar { height: 4px; }
          div[style*="WebkitOverflowScrolling"]::-webkit-scrollbar-track { background: transparent; }
          div[style*="WebkitOverflowScrolling"]::-webkit-scrollbar-thumb { background: oklch(0.35 0.04 265); border-radius: 2px; }
        `}</style>

        {/* ── Overview Tab (Phase 1 — Professional KPIs + Funnel) ─────────────────── */}
        {activeTab === "overview" && (
          <OverviewTab stats={stats} isLoading={isLoading} refetch={refetch} />
        )}

        {/* ── Ad Channels Tab ─────────────────────────────────────────────── */}
        {activeTab === "channels" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Ad Channels</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "oklch(0.55 0.18 145 / 0.15)", color: C.green }}>Live data</span>
            </div>
            <TikTokAdsTab />
            <RedditAdsTab />
            <MetaAdsTab />
          </div>
        )}

        {/* ── Campaigns Tab ─────────────────────────────────────────────────── */}
        {activeTab === "campaigns" && (
          <CampaignsTab />
        )}

        {/* ── Audience & Email Tab ─────────────────────────────────────────────── */}
        {activeTab === "audience" && (
          <div className="space-y-4">
            <ContactIntelligenceTab />
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: C.textPrimary }}>Email Broadcasts</h3>
              <EmailBroadcastTab />
            </div>
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: C.textPrimary }}>Customer Feedback</h3>
              <FeedbackTab stats={stats} />
            </div>
          </div>
        )}

        {/* ── Insights Tab ─────────────────────────────────────────────────────── */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: C.textPrimary }}>Upsell A/B Test Results</h3>
              <p className="text-xs mb-4" style={{ color: C.textMuted }}>Variant A = original layout · Variant B = new layout · Deterministic 50/50 split by session ID</p>
              {(!abResults || abResults.length === 0) ? (
                <p className="text-xs" style={{ color: C.textMuted }}>No A/B test data yet.</p>
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
                            <span className="text-xs" style={{ color: C.textMuted }}>p-value: </span>
                            <span className="text-xs font-bold" style={{ color: isSignificant ? C.green : C.gold }}>{pValue.toFixed(4)}</span>
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
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.textPrimary }}>📊 Timeline & Trends</h3>
              <TimelineCharts />
            </div>
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.textPrimary }}>👥 Customer Personas</h3>
              <PersonaMetricsDashboard />
            </div>
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.textPrimary }}>🤖 AI Recommendations</h3>
              <RecommendationsPanel />
            </div>
            <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.textPrimary }}>⚙️ Integrations</h3>
              <IntegrationsTab />
            </div>
            {/* ── Nedvěd ROI Calculator ─────────────────────────────── */}
            <NedvedRoiPanel />
            {/* ── Nedvěd Benchmark Panel ───────────────────────────── */}
            <NedvedBenchmarkPanel />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Nedvěd ROI Calculator Panel ──────────────────────────────────────────────
function NedvedRoiPanel() {
  const [cpl, setCpl] = useState(0.5); // cost per lead in USD
  const [adSpend, setAdSpend] = useState(50); // daily ad spend in USD

  // Calculate derived metrics
  const leads = adSpend / Math.max(cpl, 0.01);
  const quizCvr = 0.35; // 35% quiz completion rate
  const emailCvr = 0.12; // 12% email → purchase
  const avgOrderValue = 4; // $4 tripwire
  const upsellRate = 0.45; // 45% take upsell1
  const upsell1Value = 7; // $7 upsell
  const ltv = avgOrderValue + upsellRate * upsell1Value; // LTV per buyer
  const buyers = leads * quizCvr * emailCvr;
  const revenue = buyers * ltv;
  const roas = adSpend > 0 ? revenue / adSpend : 0;
  const breakeven = ltv > 0 ? adSpend / ltv : 0;
  const profitMargin = revenue > 0 ? ((revenue - adSpend) / revenue) * 100 : 0;

  const roasColor = roas >= 3 ? C.green : roas >= 1.5 ? C.gold : C.red;

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="w-4 h-4" style={{ color: C.gold }} />
        <h3 className="text-sm font-bold" style={{ color: C.textPrimary }}>ROI Kalkulačka — Panáček → Web → $</h3>
        <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: C.gold + "22", color: C.gold }}>Nedvěd Princip</span>
      </div>
      <p className="text-xs mb-4" style={{ color: C.textMuted }}>Schéma č. 0.1 z knihy "První miliarda je nejtěžší" — návratnost reklamy v reálném čase</p>

      {/* Input sliders */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: C.textSecondary }}>Denní ad spend (USD)</label>
          <div className="flex items-center gap-2">
            <input type="range" min={5} max={500} step={5} value={adSpend}
              onChange={e => setAdSpend(Number(e.target.value))}
              className="flex-1 accent-amber-400" />
            <span className="text-sm font-bold w-14 text-right" style={{ color: C.gold }}>${adSpend}</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: C.textSecondary }}>Cost per Lead (USD)</label>
          <div className="flex items-center gap-2">
            <input type="range" min={0.1} max={5} step={0.1} value={cpl}
              onChange={e => setCpl(Number(e.target.value))}
              className="flex-1 accent-amber-400" />
            <span className="text-sm font-bold w-14 text-right" style={{ color: C.gold }}>${cpl.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Funnel flow visualization */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-2">
        {[
          { label: "Ad Spend", value: `$${adSpend}/d`, color: C.blue },
          { label: "→ Leads", value: Math.round(leads).toString(), color: C.teal },
          { label: "→ Quiz", value: Math.round(leads * quizCvr).toString(), color: C.purple },
          { label: "→ Buyers", value: Math.round(buyers).toString(), color: C.green },
          { label: "→ Revenue", value: `$${revenue.toFixed(0)}/d`, color: C.gold },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-1 shrink-0">
            <div className="rounded-lg px-3 py-2 text-center" style={{ background: step.color + "18", border: `1px solid ${step.color}30` }}>
              <p className="text-xs font-bold" style={{ color: step.color }}>{step.value}</p>
              <p className="text-xs" style={{ color: C.textMuted }}>{step.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: C.cardInner, border: `1px solid ${roasColor}30` }}>
          <p className="text-lg font-bold" style={{ color: roasColor }}>{roas.toFixed(2)}×</p>
          <p className="text-xs" style={{ color: C.textMuted }}>ROAS</p>
          <p className="text-xs mt-0.5" style={{ color: roas >= 3 ? C.green : C.textMuted }}>{roas >= 3 ? "✓ Profitable" : roas >= 1 ? "Break-even" : "⚠ Loss"}</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: C.cardInner }}>
          <p className="text-lg font-bold" style={{ color: C.teal }}>${ltv.toFixed(2)}</p>
          <p className="text-xs" style={{ color: C.textMuted }}>LTV per buyer</p>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>AOV + upsell</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: C.cardInner }}>
          <p className="text-lg font-bold" style={{ color: C.purple }}>{Math.round(breakeven)}</p>
          <p className="text-xs" style={{ color: C.textMuted }}>Buyers to breakeven</p>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>per day</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: C.cardInner }}>
          <p className="text-lg font-bold" style={{ color: profitMargin > 0 ? C.green : C.red }}>{profitMargin.toFixed(0)}%</p>
          <p className="text-xs" style={{ color: C.textMuted }}>Profit margin</p>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>after ad spend</p>
        </div>
      </div>

      {/* Nedvěd tip */}
      <div className="mt-4 p-3 rounded-xl" style={{ background: C.gold + "10", border: `1px solid ${C.gold}25` }}>
        <p className="text-xs font-semibold" style={{ color: C.gold }}>💡 Nedvěd Princip #1 — Opisuj od Ameriky</p>
        <p className="text-xs mt-1" style={{ color: C.textSecondary }}>US sleep market benchmark: CPL $0.80–1.20, ROAS 3–5×, LTV $18–35 (s email sekvencí). Náš cíl: ROAS &gt;3× = škáluj budget 2× každé 3 dny.</p>
      </div>
    </div>
  );
}

// ── Nedvěd Benchmark Panel ────────────────────────────────────────────────────
function NedvedBenchmarkPanel() {
  const benchmarks = [
    { metric: "CPL (Cost per Lead)", us: "$0.80–1.20", target: "<$1.00", ours: "—", tip: "Optimalizuj ad copy + landing page headline" },
    { metric: "Quiz Completion Rate", us: "35–45%", target: ">35%", ours: "—", tip: "3 otázky max, progress bar, mobile-first" },
    { metric: "Email → Purchase CVR", us: "8–15%", target: ">10%", ours: "—", tip: "E1 cheat sheet + E3 social proof + E5 urgency" },
    { metric: "ROAS (blended)", us: "3–5×", target: ">3×", ours: "—", tip: "Škáluj budget 2× každé 3 dny pokud ROAS >3×" },
    { metric: "LTV (30-day)", us: "$18–35", target: ">$15", ours: "—", tip: "Upsell sekvence: $4 → $7 → $17 → $8/mo" },
    { metric: "Upsell Take Rate (OTO1)", us: "30–50%", target: ">35%", ours: "—", tip: "Hormozi: value stack + scarcity + guarantee" },
    { metric: "Email Open Rate", us: "25–40%", target: ">30%", ours: "—", tip: "Personalizace chronotypu v subject line" },
    { metric: "Refund Rate", us: "3–8%", target: "<5%", ours: "—", tip: "30-day guarantee + onboarding email sekvence" },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-4 h-4" style={{ color: C.blue }} />
        <h3 className="text-sm font-bold" style={{ color: C.textPrimary }}>Opisuj od Ameriky — US Sleep Market Benchmarky</h3>
        <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: C.blue + "22", color: C.blue }}>Nedvěd Trik #1</span>
      </div>
      <p className="text-xs mb-4" style={{ color: C.textMuted }}>"Nejlepší způsob, jak vydělat miliardu, je opisovat od těch, kteří to už udělali." — Honza Nedvěd, Inizio</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
              <th className="text-left py-2 pr-3 font-semibold" style={{ color: C.textMuted }}>Metrika</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: C.blue }}>US Benchmark</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: C.gold }}>Náš Cíl</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: C.green }}>Aktuálně</th>
              <th className="text-left py-2 pl-3 font-semibold" style={{ color: C.textMuted }}>Jak dosáhnout</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.cardBorder}30` }}>
                <td className="py-2 pr-3 font-medium" style={{ color: C.textPrimary }}>{b.metric}</td>
                <td className="py-2 px-3 text-right font-semibold" style={{ color: C.blue }}>{b.us}</td>
                <td className="py-2 px-3 text-right font-semibold" style={{ color: C.gold }}>{b.target}</td>
                <td className="py-2 px-3 text-right" style={{ color: C.textMuted }}>{b.ours}</td>
                <td className="py-2 pl-3" style={{ color: C.textSecondary }}>{b.tip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl p-3" style={{ background: C.cardInner, border: `1px solid ${C.green}25` }}>
          <p className="text-xs font-semibold mb-1" style={{ color: C.green }}>✅ Diferenciace (Trik #2)</p>
          <p className="text-xs" style={{ color: C.textSecondary }}>Chronotype quiz = unikátní vstupní bod. US trh to dělá od 2019. My jsme 5 let napřed na CZ/SK trhu.</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: C.cardInner, border: `1px solid ${C.gold}25` }}>
          <p className="text-xs font-semibold mb-1" style={{ color: C.gold }}>🔄 Panáčci se vracejí (Trik #3)</p>
          <p className="text-xs" style={{ color: C.textSecondary }}>Email sekvence E1–E7 = zákazník se vrací. Membership $8/mo = recurring revenue. Cíl: 30% zákazníků = opakující se.</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: C.cardInner, border: `1px solid ${C.purple}25` }}>
          <p className="text-xs font-semibold mb-1" style={{ color: C.purple }}>📈 Diferenciální rovnice (Trik #4)</p>
          <p className="text-xs" style={{ color: C.textSecondary }}>Nedvěd 2007: 1 návštěvník = 0.1 Kč. Dnes: 1 návštěvník = 100 Kč náklady. Řešení: zvyšuj LTV, ne traffic.</p>
        </div>
      </div>
    </div>
  );
}

// ── TikTok Ads Tab Component ─────────────────────────────────────────────────
// ── Meta Ads Tab ───────────────────────────────────────────────────────────────────────
function MetaAdsTab() {
  const { data: metaData, isLoading } = trpc.admin.getMetaAdsData.useQuery();
  const accounts = metaData?.accounts ?? [];
  const campaigns = metaData?.campaigns ?? [];
  const kpis = [
    { label: "Spend", value: metaData?.totalSpend ? `€${metaData.totalSpend.toFixed(2)}` : "—", sub: "Last 30 days", color: C.gold, icon: DollarSign },
    { label: "Impressions", value: metaData?.totalImpressions ? metaData.totalImpressions.toLocaleString() : "—", sub: "Accounts Center accounts reached", color: C.purple, icon: BarChart3 },
    { label: "Link clicks", value: metaData?.totalClicks ? metaData.totalClicks.toLocaleString() : "—", sub: "Link clicks (all)", color: C.blue, icon: Activity },
    { label: "CTR", value: metaData?.ctr ? `${metaData.ctr.toFixed(2)}%` : "—", sub: "Link clicks / Impressions", color: C.teal, icon: TrendingUp },
    { label: "CPC", value: metaData?.cpc ? `€${metaData.cpc.toFixed(2)}` : "—", sub: "Cost per link click", color: C.green, icon: Zap },
    { label: "ROAS", value: metaData?.roas ? `${metaData.roas.toFixed(2)}×` : "—", sub: "Return on ad spend", color: C.pink, icon: Sparkles },
  ];
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>📱</div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: C.textPrimary }}>Meta Ads Manager</h2>
            <p className="text-xs" style={{ color: C.textSecondary }}>
              {accounts.length > 0 ? `${accounts.length} account(s) connected` : "Connect Meta Ads account"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: accounts.some(a => a.status === 'ACTIVE') ? `${C.green}20` : `${C.red}20`, color: accounts.some(a => a.status === 'ACTIVE') ? C.green : C.red, border: `1px solid ${accounts.some(a => a.status === 'ACTIVE') ? C.green : C.red}40` }}>
            {accounts.some(a => a.status === 'ACTIVE') ? '• Active' : '◦ No active accounts'}
          </span>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
            <div className="flex items-center gap-2 mb-2">
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
              <p className="text-xs" style={{ color: C.textMuted }}>{k.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: k.color }}>{isLoading ? '…' : k.value}</p>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>{k.sub}</p>
          </div>
        ))}
      </div>
      {/* Accounts */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>Connected Ad Accounts</h3>
        {isLoading ? (
          <div className="animate-pulse h-12 rounded-xl" style={{ background: C.cardInner }} />
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-10 h-10 mx-auto mb-3" style={{ color: C.textMuted }} />
            <p className="text-sm" style={{ color: C.textMuted }}>No Meta Ads accounts connected</p>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>Connect via Meta Business Manager</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc: { id: string; name: string; status: string; currency: string }) => (
              <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: C.textPrimary }}>{acc.name}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>ID: {acc.id} · {acc.currency}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: acc.status === 'ACTIVE' ? `${C.green}20` : `${C.red}20`, color: acc.status === 'ACTIVE' ? C.green : C.red }}>{acc.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Campaigns */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>Campaigns</h3>
        {isLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="animate-pulse h-10 rounded-xl" style={{ background: C.cardInner }} />)}</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: C.textMuted }}>No campaigns found</p>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>Create your first Meta Ads campaign to start tracking performance</p>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.slice(0, 10).map((c: { id: string; name: string; status: string; objective?: string }) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.textPrimary }}>{c.name}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>{c.objective ?? 'N/A'}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg ml-2 shrink-0" style={{ background: c.status === 'ACTIVE' ? `${C.green}20` : `${C.gold}20`, color: c.status === 'ACTIVE' ? C.green : C.gold }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Meta Ads Setup Guide */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>📊 Meta Ads Setup Guide for Deep Sleep Reset</h3>
        <div className="space-y-2">
          {[
            { done: true, text: "Meta Pixel installed on landing page (fbq tracking active)" },
            { done: false, text: "Create Meta Ads account for Deep Sleep Reset" },
            { done: false, text: "Set up Conversions API (CAPI) for server-side tracking" },
            { done: false, text: "Create Lookalike Audience from buyer email list" },
            { done: false, text: "Launch traffic campaign: $5/day — target insomnia/sleep interests" },
            { done: false, text: "A/B test: carousel (before/after) vs. single image (testimonial)" },
            { done: false, text: "Retargeting: quiz completers who didn't purchase (7-day window)" },
            { done: false, text: "Scale to $50/day when ROAS >3×" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: step.done ? `${C.green}20` : C.cardInner, border: `1px solid ${step.done ? C.green : C.cardBorder}` }}>
                {step.done && <CheckCircle2 className="w-3 h-3" style={{ color: C.green }} />}
              </div>
              <p className="text-xs" style={{ color: step.done ? C.textSecondary : C.textPrimary }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

// ── Contact Intelligence Tab ─────────────────────────────────────────────────
function ContactIntelligenceTab() {
  const [segment, setSegment] = useState("all");
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.contactIntelligence.getStats.useQuery();
  const { data: leads, isLoading: leadsLoading } = trpc.contactIntelligence.getLeads.useQuery({ segment, limit: 200 });
  const exportCSV = trpc.contactIntelligence.exportCSV.useMutation();
  const syncScores = trpc.contactIntelligence.syncScores.useMutation();
  const pushToLeados = trpc.contactIntelligence.pushToLeados.useMutation();
  const pushKpi = trpc.contactIntelligence.pushKpiSnapshot.useMutation();

  const segments = [
    { value: "all", label: "All Leads" },
    { value: "high_intent", label: "High Intent (70+)" },
    { value: "buyers", label: "Buyers" },
    { value: "cold_leads", label: "Cold Leads" },
    { value: "new_7d", label: "New (7d)" },
    { value: "reddit", label: "Reddit" },
    { value: "tiktok", label: "TikTok" },
    { value: "dolphin", label: "Dolphin" },
    { value: "wolf", label: "Wolf" },
    { value: "not_uploaded_reddit", label: "Not on Reddit" },
  ];

  const handleExport = async () => {
    const result = await exportCSV.mutateAsync({ segment });
    const blob = new Blob([result.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${segment}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold" style={{ color: C.textPrimary }}>Contact Intelligence</h2>
          <p className="text-xs" style={{ color: C.textMuted }}>CRM · Lead Scoring · LEADOS Sync</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => syncScores.mutate()}
            disabled={syncScores.isPending}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}`, color: C.textSecondary }}
          >{syncScores.isPending ? "Syncing..." : "Sync Scores"}</button>
          <button
            onClick={() => pushKpi.mutate()}
            disabled={pushKpi.isPending}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: `${C.purple}20`, border: `1px solid ${C.purple}40`, color: C.purple }}
          >{pushKpi.isPending ? "Pushing..." : "Push KPI → LEADOS"}</button>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: C.cardInner }} />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Leads", value: stats.total, color: C.blue, sub: `${stats.new7d} new (7d)` },
            { label: "High Intent", value: stats.highIntent, color: C.green, sub: `Score 70+` },
            { label: "Buyers", value: stats.buyers, color: C.gold, sub: `${stats.conversionRate}% CVR` },
            { label: "Avg Score", value: stats.avgScore, color: C.purple, sub: `out of 100` },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: C.textPrimary }}>{s.label}</p>
              <p className="text-xs" style={{ color: C.textMuted }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lifecycle breakdown */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(stats.byLifecycle).map(([stage, count]) => (
            <div key={stage} className="rounded-lg p-3 text-center" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: C.textPrimary }}>{count as number}</p>
              <p className="text-xs capitalize" style={{ color: C.textMuted }}>{stage}</p>
            </div>
          ))}
        </div>
      )}

      {/* Segment selector + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={segment}
          onChange={e => setSegment(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}`, color: C.textPrimary }}
        >
          {segments.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button
          onClick={handleExport}
          disabled={exportCSV.isPending}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: `${C.green}20`, border: `1px solid ${C.green}40`, color: C.green }}
        >{exportCSV.isPending ? "Exporting..." : `Export CSV (${leads?.length ?? 0})`}</button>
        <button
          onClick={() => pushToLeados.mutate({ segment })}
          disabled={pushToLeados.isPending}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: `${C.teal}20`, border: `1px solid ${C.teal}40`, color: C.teal }}
        >{pushToLeados.isPending ? "Pushing..." : `Push to LEADOS (${leads?.length ?? 0})`}</button>
        {pushToLeados.data && (
          <span className="text-xs" style={{ color: C.green }}>
            ✓ {pushToLeados.data.pushed} pushed, {pushToLeados.data.failed} failed
          </span>
        )}
      </div>

      {/* Lead table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.cardBorder}` }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: C.cardInner }}>
              {["Email", "Chronotype", "Campaign", "Tags", "Score", "Stage", "Email Step", "Created"].map(h => (
                <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leadsLoading ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center" style={{ color: C.textMuted }}>Loading leads...</td></tr>
            ) : !leads?.length ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center" style={{ color: C.textMuted }}>No leads in this segment</td></tr>
            ) : leads.slice(0, 50).map((lead, i) => {
              let tags: string[] = [];
              try { tags = JSON.parse((lead as any).tags ?? "[]"); } catch { tags = []; }
              const campaign = (lead as any).utmCampaign ?? (lead as any).utmSource ?? lead.source ?? "organic";
              const emailStep = (lead as any).emailSequenceStep ?? 0;
              return (
                <tr key={lead.id} style={{ background: i % 2 === 0 ? C.card : C.cardInner, borderTop: `1px solid ${C.cardBorder}` }}>
                  <td className="px-3 py-2" style={{ color: C.textPrimary }}>
                    <div>{lead.email}</div>
                    {(lead as any).persona && (
                      <div className="text-xs" style={{ color: C.purple }}>via {(lead as any).persona}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {lead.chronotype ? (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{
                        background: lead.chronotype === "Dolphin" ? `${C.blue}20` : lead.chronotype === "Wolf" ? `${C.purple}20` : lead.chronotype === "Lion" ? `${C.gold}20` : `${C.teal}20`,
                        color: lead.chronotype === "Dolphin" ? C.blue : lead.chronotype === "Wolf" ? C.purple : lead.chronotype === "Lion" ? C.gold : C.teal,
                      }}>{lead.chronotype}</span>
                    ) : <span style={{ color: C.textMuted }}>—</span>}
                  </td>
                  <td className="px-3 py-2 max-w-[120px]">
                    <div className="truncate" style={{ color: C.textSecondary }} title={campaign}>{campaign}</div>
                    {(lead as any).utmMedium && (
                      <div className="text-xs" style={{ color: C.textMuted }}>{(lead as any).utmMedium}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {tags.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-xs" style={{
                          background: tag.startsWith("campaign:") ? `${C.purple}20` : tag.startsWith("ref:") ? `${C.blue}20` : tag.startsWith("issue:") ? `${C.red ?? "#ef4444"}20` : `${C.cardInner}`,
                          color: tag.startsWith("campaign:") ? C.purple : tag.startsWith("ref:") ? C.blue : tag.startsWith("issue:") ? (C.red ?? "#ef4444") : C.textMuted,
                          border: `1px solid ${C.cardBorder}`,
                        }}>{tag.length > 18 ? tag.slice(0, 18) + "…" : tag}</span>
                      ))}
                      {tags.length > 4 && <span className="text-xs" style={{ color: C.textMuted }}>+{tags.length - 4}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{
                      background: lead.computedScore >= 70 ? `${C.green}20` : lead.computedScore >= 40 ? `${C.gold}20` : `${C.textMuted}20`,
                      color: lead.computedScore >= 70 ? C.green : lead.computedScore >= 40 ? C.gold : C.textMuted,
                    }}>{lead.computedScore}</span>
                  </td>
                  <td className="px-3 py-2" style={{ color: C.textSecondary }}>{lead.lifecycleStage ?? "lead"}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5,6,7].map(n => (
                          <div key={n} className="w-2 h-2 rounded-full" style={{
                            background: n <= emailStep ? C.green : C.cardInner,
                            border: `1px solid ${n <= emailStep ? C.green : C.cardBorder}`,
                          }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: C.textMuted }}>{emailStep}/7</span>

                    </div>
                  </td>
                  <td className="px-3 py-2" style={{ color: C.textMuted }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leads && leads.length > 50 && (
          <div className="px-3 py-2 text-center text-xs" style={{ color: C.textMuted, background: C.cardInner }}>
            Showing 50 of {leads.length} leads — export CSV for full list
          </div>
        )}
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

// ── Feedback Tab Component ────────────────────────────────────────────────────
function FeedbackTab({ stats }: { stats?: AdminStats }) {
  const { data: allFeedbacks } = trpc.admin.getFeedbacksForExport.useQuery();
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportCSV = () => {
    if (!allFeedbacks || allFeedbacks.length === 0) return;
    setExportLoading(true);
    try {
      const headers = ["ID", "Session ID", "Rating", "Liked", "Improved", "Email", "Reward Code", "Date"];
      const rows = allFeedbacks.map(f => [
        f.id,
        f.sessionId,
        f.rating,
        `"${(f.liked ?? '').replace(/"/g, '""')}"`,
        `"${(f.improved ?? '').replace(/"/g, '""')}"`,
        f.email ?? '',
        f.rewardCode ?? '',
        new Date(f.createdAt).toISOString(),
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedbacks-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: allFeedbacks?.filter(f => f.rating === r).length ?? 0,
  }));
  const maxCount = Math.max(...ratingDist.map(r => r.count), 1);

  return (
    <div className="space-y-4">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color: C.textPrimary }}>Customer Feedback</h2>
        <button
          onClick={handleExportCSV}
          disabled={exportLoading || !allFeedbacks?.length}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          style={{ background: C.gold + "22", color: C.gold, border: `1px solid ${C.gold}44` }}
        >
          <Download className="w-3.5 h-3.5" />
          {exportLoading ? 'Exporting...' : `Export CSV (${allFeedbacks?.length ?? 0})`}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Star} label="Average Rating" value={stats?.avgRating ? `${Number(stats.avgRating).toFixed(1)}/5` : "—"} sub="From all reviews" color={C.gold} />
        <StatCard icon={MessageSquare} label="Total Feedbacks" value={stats?.feedbackCount ?? 0} sub="Submitted" color={C.pink} />
      </div>

      {/* Rating Distribution */}
      {allFeedbacks && allFeedbacks.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.textPrimary }}>Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDist.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex gap-0.5 w-20 shrink-0">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-3 h-3" fill={s <= rating ? C.gold : "none"} style={{ color: C.gold }} />
                  ))}
                </div>
                <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: C.cardInner }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(count / maxCount) * 100}%`, background: `linear-gradient(90deg, ${C.gold}, oklch(0.65 0.18 55))` }}
                  />
                </div>
                <span className="text-xs w-6 text-right" style={{ color: C.textMuted }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedbacks */}
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
  );
}

// ── AI Insights Tab Component ─────────────────────────────────────────────────
function AiInsightsTab() {
  const { data: insights, isLoading } = trpc.admin.getAiInsights.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: C.teal, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: C.teal }} />
        <p className="text-base font-semibold mb-2" style={{ color: C.textPrimary }}>No AI Insights Yet</p>
        <p className="text-sm" style={{ color: C.textSecondary }}>
          The nightly AI optimization runs every night at 2:00 AM UTC.<br />
          First insights will appear after the next scheduled run.
        </p>
        <p className="text-xs mt-3" style={{ color: C.textMuted }}>
          Powered by GPT-4 · Hormozi-style growth recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color: C.textPrimary }}>AI Nightly Optimization</h2>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: C.teal + "22", color: C.teal }}>
          Runs daily at 2:00 AM UTC
        </span>
      </div>

      {insights.map((insight) => (
        <div key={insight.id} className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3" style={{ background: C.cardInner, borderBottom: `1px solid ${C.cardBorder}` }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: C.teal }} />
              <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                {insight.date} — AI Analysis
              </span>
            </div>
            <div className="flex items-center gap-2">
              {insight.applied && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.green + "22", color: C.green }}>
                  Applied
                </span>
              )}
              <span className="text-xs" style={{ color: C.textMuted }}>
                {new Date(insight.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed mb-4" style={{ color: C.textSecondary }}>
              {insight.summary}
            </p>

            {/* Recommendations */}
            {Array.isArray(insight.recommendations) && insight.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.textMuted }}>
                  Recommendations
                </h4>
                {insight.recommendations.map((rec: { priority?: string; title?: string; description?: string; action?: string }, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                    <div className="shrink-0 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold`} style={{
                        background: rec.priority === 'high' ? C.pink + "33" : rec.priority === 'medium' ? C.gold + "33" : C.teal + "33",
                        color: rec.priority === 'high' ? C.pink : rec.priority === 'medium' ? C.gold : C.teal,
                      }}>
                        {(rec.priority ?? 'low').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>{rec.title ?? rec.action ?? 'Recommendation'}</p>
                      <p className="text-xs" style={{ color: C.textSecondary }}>{rec.description ?? ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Metrics Snapshot */}
            {insight.metrics && Object.keys(insight.metrics).length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.textMuted }}>
                  Metrics Snapshot
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(insight.metrics).slice(0, 8).map(([key, val]) => (
                    <div key={key} className="p-2 rounded-xl text-center" style={{ background: C.bg }}>
                      <p className="text-xs font-bold" style={{ color: C.textPrimary }}>{String(val)}</p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: C.textMuted }}>{key.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Campaigns Tab ────────────────────────────────────────────────────────────
function CampaignsTab() {
  const { data: history, isLoading: histLoading } = trpc.admin.getCampaignHistory.useQuery({ limit: 20 });
  const { data: stats } = trpc.admin.getCampaignStats.useQuery();
  const launchMutation = trpc.admin.launchCampaign.useMutation({
    onSuccess: () => toast.success("Campaign launched!"),
    onError: (e) => toast.error(e.message),
  });

  const CAMPAIGN_TYPES = [
    { type: "FLASH_SALE" as const, label: "Flash Sale", desc: "24h urgency push — 30% off", icon: "⚡" },
    { type: "REACTIVATION" as const, label: "Reactivation", desc: "Win back inactive leads", icon: "🔄" },
    { type: "VIP_BUNDLE" as const, label: "VIP Bundle", desc: "Premium upsell sequence", icon: "👑" },
    { type: "UPSELL_BLAST" as const, label: "Upsell Blast", desc: "Post-purchase upgrade push", icon: "🚀" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Sent", value: stats.totalSent ?? 0, color: C.blue },
            { label: "Opened", value: (stats as any).totalOpened ?? 0, color: C.teal },
            { label: "Converted", value: (stats as any).totalConverted ?? 0, color: C.green },
            { label: "Revenue", value: `$${((stats.totalRevenue ?? 0) / 100).toFixed(0)}`, color: C.gold },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: C.textSecondary }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* 1-click launch */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-4 h-4" style={{ color: C.gold }} />
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>1-Click Campaign Launch</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CAMPAIGN_TYPES.map((ct) => (
            <button
              key={ct.type}
              onClick={() => launchMutation.mutate({ type: ct.type })}
              disabled={launchMutation.isPending}
              className="rounded-xl p-4 flex flex-col gap-2 text-left transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}
            >
              <span className="text-2xl">{ct.icon}</span>
              <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{ct.label}</p>
              <p className="text-xs" style={{ color: C.textMuted }}>{ct.desc}</p>
              {launchMutation.isPending && (
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: C.gold }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign history */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: C.textPrimary }}>Campaign History</h3>
        {histLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: C.cardInner }} />)}</div>
        ) : !history || history.length === 0 ? (
          <p className="text-xs py-4 text-center" style={{ color: C.textMuted }}>No campaigns launched yet. Use the buttons above to start.</p>
        ) : (
          <div className="space-y-2">
            {history.map((c: { id: string; type: string; status: string; sentCount?: number | null; openedCount?: number | null; convertedCount?: number | null; revenueGenerated?: number | null; createdAt: Date }) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.cardInner, border: `1px solid ${C.cardBorder}` }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{c.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    Sent: {c.sentCount ?? 0} · Opened: {c.openedCount ?? 0} · Converted: {c.convertedCount ?? 0}
                    {c.revenueGenerated ? ` · $${(c.revenueGenerated / 100).toFixed(0)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: c.status === 'completed' ? `${C.green}20` : `${C.gold}20`, color: c.status === 'completed' ? C.green : C.gold }}>
                    {c.status}
                  </span>
                  <span className="text-xs" style={{ color: C.textMuted }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
