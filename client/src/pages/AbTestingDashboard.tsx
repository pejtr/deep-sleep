import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Target, AlertCircle } from "lucide-react";

export default function AbTestingDashboard() {
  const [selectedTest, setSelectedTest] = useState<"upsell1" | "upsell2" | "upsell3">("upsell1");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch A/B results
  const { data: abResults, isLoading: abLoading } = trpc.admin.getAbResults.useQuery();

  // Trends data not available in current API

  // Recommendations data not available in current API

  if (abLoading) {
    return <div className="p-8 text-center">Loading A/B testing data...</div>;
  }

  if (!abResults) {
    return <div className="p-8 text-center">No A/B testing data available</div>;
  }

  // Get current test data - group by page and variant
  const testData = abResults?.reduce((acc: any, row: any) => {
    if (!acc[row.page]) acc[row.page] = { variantA: null, variantB: null };
    if (row.variant === "A") acc[row.page].variantA = row;
    if (row.variant === "B") acc[row.page].variantB = row;
    return acc;
  }, {}) || {};
  
  const currentTest = testData[selectedTest];

  // Calculate statistical significance (simplified Chi-square)
  const calculateSignificance = (variantA: any, variantB: any) => {
    if (!variantA || !variantB) return 0;
    const convRateA = variantA.conversions / variantA.impressions;
    const convRateB = variantB.conversions / variantB.impressions;
    const diff = Math.abs(convRateA - convRateB);
    const pooled = (variantA.conversions + variantB.conversions) / (variantA.impressions + variantB.impressions);
    const se = Math.sqrt((pooled * (1 - pooled)) * (1 / variantA.impressions + 1 / variantB.impressions));
    const z = diff / se;
    // Rough p-value approximation (95% confidence = z > 1.96)
    return z > 1.96 ? 95 : z > 1.645 ? 90 : z > 1.28 ? 80 : 0;
  };

  const significance = currentTest
    ? calculateSignificance(currentTest.variantA, currentTest.variantB)
    : 0;

  // Prepare chart data — guard against null variants (test may have only one variant so far)
  const safeA = currentTest?.variantA ?? { conversions: 0, impressions: 0, revenue: 0 };
  const safeB = currentTest?.variantB ?? { conversions: 0, impressions: 0, revenue: 0 };

  const performanceData = currentTest
    ? [
        {
          name: "Variant A",
          conversions: safeA.conversions,
          impressions: safeA.impressions,
          conversionRate: safeA.impressions > 0 ? ((safeA.conversions / safeA.impressions) * 100).toFixed(2) : "0.00",
          revenue: safeA.revenue,
        },
        {
          name: "Variant B",
          conversions: safeB.conversions,
          impressions: safeB.impressions,
          conversionRate: safeB.impressions > 0 ? ((safeB.conversions / safeB.impressions) * 100).toFixed(2) : "0.00",
          revenue: safeB.revenue,
        },
      ]
    : [];

  // Determine winner
  const variantAConvRate = safeA.impressions > 0 ? safeA.conversions / safeA.impressions : 0;
  const variantBConvRate = safeB.impressions > 0 ? safeB.conversions / safeB.impressions : 0;
  const winner = variantAConvRate > variantBConvRate ? "A" : "B";
  const winnerLift = Math.abs(variantAConvRate - variantBConvRate) * 100;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Advanced A/B Testing Dashboard</h1>
          <p className="text-muted-foreground">Real-time variant performance & statistical analysis</p>
        </div>

        {/* Test Selector */}
        <div className="flex gap-2 mb-8">
          {(["upsell1", "upsell2", "upsell3"] as const).map((test) => (
            <Button
              key={test}
              variant={selectedTest === test ? "default" : "outline"}
              onClick={() => setSelectedTest(test)}
              className="capitalize"
            >
              {test === "upsell1" ? "Upsell 1" : test === "upsell2" ? "Upsell 2" : "Upsell 3"}
            </Button>
          ))}
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}
            >
              {range === "24h" ? "24 Hours" : range === "7d" ? "7 Days" : "30 Days"}
            </Button>
          ))}
        </div>
        {/* Date Range Filter */}
        <div className="mb-8 p-4 border rounded-lg bg-card">
          <h3 className="font-semibold mb-4">Custom Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  // Apply custom date range
                  console.log("Filtering by date range:", startDate, endDate);
                }}
                className="flex-1"
              >
                Apply Filter
              </Button>
              <Button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>


        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Variant A Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Variant A</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTest && safeA.impressions > 0 ? ((safeA.conversions / safeA.impressions) * 100).toFixed(2) : "0"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {safeA.conversions} conversions / {safeA.impressions} impressions
              </p>
            </CardContent>
          </Card>

          {/* Variant B Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Variant B</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTest && safeB.impressions > 0 ? ((safeB.conversions / safeB.impressions) * 100).toFixed(2) : "0"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {safeB.conversions} conversions / {safeB.impressions} impressions
              </p>
            </CardContent>
          </Card>

          {/* Winner */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Winner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Variant {winner}</div>
              <p className="text-xs text-muted-foreground mt-1">+{winnerLift.toFixed(2)}% lift</p>
            </CardContent>
          </Card>

          {/* Statistical Significance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{significance}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {significance >= 95 ? "✓ Statistically significant" : significance >= 80 ? "⚠ Approaching significance" : "✗ Not significant"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversion Rate Comparison</CardTitle>
            <CardDescription>Variant A vs Variant B performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversionRate" fill="#f59e0b" name="Conversion Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>



        {/* Revenue Impact */}
        {currentTest && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue Impact</CardTitle>
              <CardDescription>Total revenue by variant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Variant A Revenue</p>
                  <p className="text-2xl font-bold">${(safeA.revenue ?? 0).toFixed(2)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Variant B Revenue</p>
                  <p className="text-2xl font-bold">${(safeB.revenue ?? 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Potential Revenue Gain</p>
                <p className="text-2xl font-bold">
                  ${(Math.max(safeA.revenue ?? 0, safeB.revenue ?? 0) - Math.min(safeA.revenue ?? 0, safeB.revenue ?? 0)).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}
