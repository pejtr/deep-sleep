import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface TrendData {
  time: string;
  timestamp: string;
  [key: string]: string | number;
}

export function AbTrendChart({ testName = "landing_variant" }: { testName?: string }) {
  const [timeRange, setTimeRange] = useState<24 | 168 | 720>(24);

  const { data: trends } = trpc.abTest.getTrends.useQuery(
    { testName, hoursBack: timeRange },
    {
      refetchInterval: 60000,
      staleTime: 30000,
    }
  );

  const chartData = useMemo(() => {
    if (!trends?.data || trends.data.length === 0) return [];
    return trends.data as TrendData[];
  }, [trends?.data]);

  const variants = useMemo(() => {
    if (!trends?.variants) return [];
    return trends.variants as string[];
  }, [trends?.variants]);

  const variantColors: Record<string, string> = {
    A: "#FFB84D",
    B: "#4ADE80",
    C: "#60A5FA",
    D: "#F87171",
    E: "#A78BFA",
  };

  const timeRangeLabel = {
    24: "Last 24 Hours",
    168: "Last 7 Days",
    720: "Last 30 Days",
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Conversion Rate Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>No trend data available yet. Data will appear as impressions accumulate.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Conversion Rate Trends
          </CardTitle>
          <div className="flex gap-2">
            {[24, 168, 720].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range as 24 | 168 | 720)}
                className="text-xs"
              >
                {range === 24 ? "24h" : range === 168 ? "7d" : "30d"}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {timeRangeLabel[timeRange]} • {chartData.length} data points
        </p>
      </CardHeader>

      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: "12px" }}
                tick={{ fill: "rgba(255,255,255,0.7)" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: "12px" }}
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                label={{ value: "Conversion Rate (%)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.9)" }}
                formatter={(value) => {
                  if (typeof value === "number") {
                    return `${value.toFixed(2)}%`;
                  }
                  return value;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />

              {variants.map((variant) => (
                <Line
                  key={`${variant}_rate`}
                  type="monotone"
                  dataKey={`${variant}_rate`}
                  stroke={variantColors[variant] || "#8B5CF6"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name={`Variant ${variant}`}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {variants.map((variant) => {
            const latestData = chartData[chartData.length - 1];
            const rateKey = `${variant}_rate`;
            const currentRate = latestData ? (latestData[rateKey] as number) : 0;

            const previousData = chartData[Math.max(0, chartData.length - 2)];
            const previousRate = previousData ? (previousData[rateKey] as number) : currentRate;

            const trend = currentRate - previousRate;
            const trendPercent = previousRate > 0 ? ((trend / previousRate) * 100) : 0;

            return (
              <div
                key={variant}
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: `${variantColors[variant]}15`,
                  borderColor: `${variantColors[variant]}40`,
                }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: variantColors[variant] }}>
                  Variant {variant}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold" style={{ color: variantColors[variant] }}>
                    {currentRate.toFixed(2)}%
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      trend >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {trend >= 0 ? "↑" : "↓"} {Math.abs(trendPercent).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
