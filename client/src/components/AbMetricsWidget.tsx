import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { AbTrendChart } from "@/components/AbTrendChart";

interface AbMetrics {
  testName: string;
  metrics: Record<string, { impressions: number; conversions: number; rate: number }>;
  winner: string | null;
  totalImpressions: number;
  totalConversions: number;
  updatedAt: Date;
}

export function AbMetricsWidget({ testName = "landing_variant" }: { testName?: string }) {
  const [metrics, setMetrics] = useState<AbMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading } = trpc.abTest.getLiveMetrics.useQuery(
    { testName },
    {
      refetchInterval: autoRefresh ? 5000 : false, // 5-second auto-refresh
      staleTime: 0,
    }
  );

  useEffect(() => {
    if (data) {
      setMetrics(data);
      setLoading(false);
    }
  }, [data]);

  if (loading || !metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            A/B Test Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  const variants = Object.entries(metrics.metrics).sort((a, b) => b[1].rate - a[1].rate);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            A/B Test: {testName}
          </CardTitle>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              autoRefresh
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {autoRefresh ? "🔄 Live" : "⏸ Paused"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Updated: {new Date(metrics.updatedAt).toLocaleTimeString()}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Impressions</p>
            <p className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Conversions</p>
            <p className="text-2xl font-bold">{metrics.totalConversions.toLocaleString()}</p>
          </div>
        </div>

        {/* Overall Conversion Rate */}
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground mb-1">Overall Conversion Rate</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.totalImpressions > 0
              ? ((metrics.totalConversions / metrics.totalImpressions) * 100).toFixed(2)
              : "0.00"}
            %
          </p>
        </div>

        {/* Variant Comparison */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Variant Performance</p>
          {variants.map(([variant, data], index) => {
            const isWinner = metrics.winner === variant;
            const ratePercentage = data.rate.toFixed(2);
            const conversionRate = ((data.conversions / data.impressions) * 100).toFixed(2);

            return (
              <div
                key={variant}
                className={`rounded-lg p-4 border-2 transition-all ${
                  isWinner
                    ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">Variant {variant}</span>
                    {isWinner && (
                      <Badge className="bg-green-600 hover:bg-green-700">🏆 Winner</Badge>
                    )}
                    {index === 0 && !isWinner && (
                      <Badge className="bg-blue-600 hover:bg-blue-700">Leading</Badge>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {ratePercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                    <p className="font-semibold">{data.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                    <p className="font-semibold">{data.conversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conv. Rate</p>
                    <p className="font-semibold">{conversionRate}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isWinner ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(data.rate, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendation */}
        {metrics.winner && variants.length > 1 && (
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              💡 Recommendation
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Variant <strong>{metrics.winner}</strong> is performing best with{" "}
              <strong>{metrics.metrics[metrics.winner]?.rate.toFixed(2)}%</strong> conversion rate.
              Consider scaling this variant.
            </p>
          </div>
        )}

        {/* No Data State */}
        {variants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No data available yet. Impressions will appear as traffic flows in.</p>
          </div>
        )}
      

        {/* Trend Chart */}
        <div className="mt-8 pt-8 border-t border-border">
          <AbTrendChart testName={testName} />
        </div></CardContent>
    </Card>
  );
}
