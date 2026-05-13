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

  // Prepare chart data
  const performanceData = currentTest
    ? [
        {
          name: "Variant A",
          conversions: currentTest.variantA.conversions,
          impressions: currentTest.variantA.impressions,
          conversionRate: ((currentTest.variantA.conversions / currentTest.variantA.impressions) * 100).toFixed(2),
          revenue: currentTest.variantA.revenue,
        },
        {
          name: "Variant B",
          conversions: currentTest.variantB.conversions,
          impressions: currentTest.variantB.impressions,
          conversionRate: ((currentTest.variantB.conversions / currentTest.variantB.impressions) * 100).toFixed(2),
          revenue: currentTest.variantB.revenue,
        },
      ]
    : [];

  // Determine winner
  const variantAConvRate = currentTest
    ? currentTest.variantA.conversions / currentTest.variantA.impressions
    : 0;
  const variantBConvRate = currentTest
    ? currentTest.variantB.conversions / currentTest.variantB.impressions
    : 0;
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Variant A Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Variant A</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentTest ? ((currentTest.variantA.conversions / currentTest.variantA.impressions) * 100).toFixed(2) : "0"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentTest?.variantA.conversions || 0} conversions / {currentTest?.variantA.impressions || 0} impressions
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
                {currentTest ? ((currentTest.variantB.conversions / currentTest.variantB.impressions) * 100).toFixed(2) : "0"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentTest?.variantB.conversions || 0} conversions / {currentTest?.variantB.impressions || 0} impressions
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
                  <p className="text-2xl font-bold">${currentTest.variantA.revenue.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Variant B Revenue</p>
                  <p className="text-2xl font-bold">${currentTest.variantB.revenue.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Potential Revenue Gain</p>
                <p className="text-2xl font-bold">
                  ${(Math.max(currentTest.variantA.revenue, currentTest.variantB.revenue) - Math.min(currentTest.variantA.revenue, currentTest.variantB.revenue)).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}
