import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const C = {
  gold: "oklch(0.78 0.18 65)",
  green: "oklch(0.70 0.18 145)",
  blue: "oklch(0.65 0.15 240)",
  purple: "oklch(0.65 0.15 280)",
  pink: "oklch(0.65 0.15 320)",
  teal: "oklch(0.65 0.15 200)",
  red: "oklch(0.65 0.18 25)",
  card: "oklch(0.12 0.02 255)",
  cardBorder: "oklch(0.20 0.02 255)",
  textPrimary: "oklch(0.95 0.01 255)",
  textSecondary: "oklch(0.80 0.02 255)",
  textMuted: "oklch(0.60 0.02 255)",
};

const PERSONA_NAMES: Record<string, string> = {
  luna1: "Luna Compassionate",
  luna2: "Luna Scientific",
  luna3: "Luna Practical",
  luna4: "Luna Curious",
  luna5: "Luna Motivational",
  luna6: "Luna Holistic",
  luna7: "Luna Storyteller",
  luna8: "Luna Structured",
  luna9: "Luna Adaptive",
  luna10: "Luna Empowering",
};

interface JourneyFunnelData {
  step: string;
  count: number;
  conversionRate: string;
}

interface PersonaJourneyData {
  personaId: string;
  funnel: JourneyFunnelData[];
  durations: Array<{
    step: string;
    avgDuration: number;
    avgDurationSec: string;
    count: number;
  }>;
  purchaseCount: number;
}

export function UserJourneyWidget() {
  const [selectedPersona, setSelectedPersona] = useState<string>("luna1");
  const [journeyData, setJourneyData] = useState<PersonaJourneyData | null>(null);
  const [allPersonasData, setAllPersonasData] = useState<PersonaJourneyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demo (replace with actual tRPC call when backend is ready)
  useEffect(() => {
    // Simulate loading journey data
    const mockData: PersonaJourneyData = {
      personaId: selectedPersona,
      funnel: [
        { step: "quiz_start", count: 100, conversionRate: "100.0" },
        { step: "quiz_complete", count: 85, conversionRate: "85.0" },
        { step: "chat_open", count: 62, conversionRate: "62.0" },
        { step: "checkout_view", count: 48, conversionRate: "48.0" },
        { step: "purchase", count: 32, conversionRate: "32.0" },
      ],
      durations: [
        { step: "quiz_start", avgDuration: 15000, avgDurationSec: "15.0", count: 100 },
        { step: "quiz_complete", avgDuration: 180000, avgDurationSec: "180.0", count: 85 },
        { step: "chat_open", avgDuration: 240000, avgDurationSec: "240.0", count: 62 },
        { step: "checkout_view", avgDuration: 45000, avgDurationSec: "45.0", count: 48 },
        { step: "purchase", avgDuration: 30000, avgDurationSec: "30.0", count: 32 },
      ],
      purchaseCount: 32,
    };

    const mockAllPersonas: PersonaJourneyData[] = [
      {
        personaId: "luna1",
        funnel: [
          { step: "quiz_start", count: 100, conversionRate: "100.0" },
          { step: "quiz_complete", count: 85, conversionRate: "85.0" },
          { step: "chat_open", count: 62, conversionRate: "62.0" },
          { step: "checkout_view", count: 48, conversionRate: "48.0" },
          { step: "purchase", count: 32, conversionRate: "32.0" },
        ],
        durations: [],
        purchaseCount: 32,
      },
      {
        personaId: "luna2",
        funnel: [
          { step: "quiz_start", count: 100, conversionRate: "100.0" },
          { step: "quiz_complete", count: 88, conversionRate: "88.0" },
          { step: "chat_open", count: 71, conversionRate: "71.0" },
          { step: "checkout_view", count: 56, conversionRate: "56.0" },
          { step: "purchase", count: 42, conversionRate: "42.0" },
        ],
        durations: [],
        purchaseCount: 42,
      },
      {
        personaId: "luna3",
        funnel: [
          { step: "quiz_start", count: 100, conversionRate: "100.0" },
          { step: "quiz_complete", count: 82, conversionRate: "82.0" },
          { step: "chat_open", count: 58, conversionRate: "58.0" },
          { step: "checkout_view", count: 42, conversionRate: "42.0" },
          { step: "purchase", count: 28, conversionRate: "28.0" },
        ],
        durations: [],
        purchaseCount: 28,
      },
    ];

    setJourneyData(mockData);
    setAllPersonasData(mockAllPersonas);
    setIsLoading(false);
  }, [selectedPersona]);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <p style={{ color: C.textMuted }}>Loading journey data...</p>
      </div>
    );
  }

  // Prepare funnel chart data
  const funnelChartData = journeyData?.funnel.map((f) => ({
    name: f.step.replace(/_/g, " ").toUpperCase(),
    Users: f.count,
    "Conv. Rate": parseFloat(f.conversionRate),
  })) || [];

  // Prepare comparison chart data (purchases per persona)
  const comparisonData = allPersonasData.map((p) => ({
    name: PERSONA_NAMES[p.personaId] || p.personaId,
    purchases: p.purchaseCount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold mb-2" style={{ color: C.textPrimary }}>
          🎯 User Journey by Persona
        </h3>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Track user progression through each step of the funnel
        </p>
      </div>

      {/* Persona Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PERSONA_NAMES).map(([id, name]) => (
          <button
            key={id}
            onClick={() => setSelectedPersona(id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: selectedPersona === id ? C.gold : C.card,
              color: selectedPersona === id ? "#000" : C.textSecondary,
              border: `1px solid ${selectedPersona === id ? C.gold : C.cardBorder}`,
            }}
          >
            {name.split(" ")[1]}
          </button>
        ))}
      </div>

      {/* Funnel Chart */}
      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Conversion Funnel
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cardBorder} />
            <XAxis dataKey="name" stroke={C.textMuted} style={{ fontSize: "12px" }} />
            <YAxis stroke={C.textMuted} style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: "8px" }}
              labelStyle={{ color: C.textPrimary }}
            />
            <Legend />
            <Bar dataKey="Users" fill={C.blue} />
            <Bar dataKey="Conv. Rate" fill={C.green} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Journey Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg p-3" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <p className="text-xs" style={{ color: C.textMuted }}>
            Total Starts
          </p>
          <p className="text-xl font-bold" style={{ color: C.gold }}>
            {journeyData?.funnel[0]?.count || 0}
          </p>
        </div>
        <div className="rounded-lg p-3" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <p className="text-xs" style={{ color: C.textMuted }}>
            Purchases
          </p>
          <p className="text-xl font-bold" style={{ color: C.green }}>
            {journeyData?.purchaseCount || 0}
          </p>
        </div>
        <div className="rounded-lg p-3" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <p className="text-xs" style={{ color: C.textMuted }}>
            Overall Conv. Rate
          </p>
          <p className="text-xl font-bold" style={{ color: C.blue }}>
            {journeyData?.funnel[4]?.conversionRate || "0"}%
          </p>
        </div>
        <div className="rounded-lg p-3" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
          <p className="text-xs" style={{ color: C.textMuted }}>
            Avg. Chat Duration
          </p>
          <p className="text-xl font-bold" style={{ color: C.purple }}>
            {journeyData?.durations[2]?.avgDurationSec || "0"}s
          </p>
        </div>
      </div>

      {/* All Personas Comparison */}
      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Purchases Comparison (All Personas)
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cardBorder} />
            <XAxis dataKey="name" stroke={C.textMuted} style={{ fontSize: "11px" }} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke={C.textMuted} style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: "8px" }}
              labelStyle={{ color: C.textPrimary }}
            />
            <Bar dataKey="purchases" fill={C.gold} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Journey Steps Detail */}
      <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
          Journey Steps Detail
        </h4>
        <div className="space-y-2">
          {journeyData?.funnel.map((step, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ background: C.cardBorder }}>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                  {step.step.replace(/_/g, " ").toUpperCase()}
                </p>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  {step.count} users ({step.conversionRate}% of start)
                </p>
              </div>
              <div
                className="w-16 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: C.gold,
                  color: "#000",
                  width: `${Math.max(40, parseFloat(step.conversionRate) * 0.6)}px`,
                }}
              >
                {step.conversionRate}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
