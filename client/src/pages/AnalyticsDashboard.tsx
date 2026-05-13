import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "all">("7d");
  const [geoData, setGeoData] = useState<any>(null);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();

  // Fetch timeline metrics (hourly for 7d)
  const { data: timelineMetrics } = trpc.admin.getTimelineMetrics.useQuery(
    {
      granularity: "hourly",
      days: 7,
    },
    { enabled: timeRange === "7d" }
  );

  // Fetch timeline metrics (daily for 30d)
  const { data: dailyMetrics } = trpc.admin.getTimelineMetrics.useQuery(
    {
      granularity: "daily",
      days: 30,
    },
    { enabled: timeRange === "30d" }
  );

  // Fetch geo pricing for demo
  const { data: geoPricing } = trpc.pricing.getForGeo.useQuery({});

  useEffect(() => {
    if (geoPricing) {
      setGeoData(geoPricing);
    }
  }, [geoPricing]);

  if (statsLoading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-center">No data available</div>;
  }

  // Prepare chart data
  const conversionRate = stats.quizCount > 0 ? ((stats.completedOrderCount / stats.quizCount) * 100).toFixed(2) : "0";
  const avgOrderValue = stats.completedOrderCount > 0 ? (stats.revenue / stats.completedOrderCount).toFixed(2) : "0";

  const deviceData = [
    { name: "Mobile", value: stats.deviceBreakdown?.find((d: any) => d.device === "mobile")?.count || 0 },
    { name: "Desktop", value: stats.deviceBreakdown?.find((d: any) => d.device === "desktop")?.count || 0 },
    { name: "Tablet", value: stats.deviceBreakdown?.find((d: any) => d.device === "tablet")?.count || 0 },
  ];

  const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time performance metrics and insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(["today", "7d", "30d", "all"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range === "today" ? "Today" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "All Time"}
            </Button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrderCount}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                +8% from last period
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowDownRight className="h-3 w-3 text-red-500" />
                -2% from last period
              </p>
            </CardContent>
          </Card>

          {/* Avg Order Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgOrderValue}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                +5% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyMetrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Traffic by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Quiz Starts</span>
                    <span className="text-sm font-bold">{stats.quizStarts}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Checkout Clicks</span>
                    <span className="text-sm font-bold">{stats.checkoutClicks}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${((stats.checkoutClicks / stats.quizStarts) * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completed Orders</span>
                    <span className="text-sm font-bold">{stats.completedOrderCount}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${((stats.completedOrderCount / stats.quizStarts) * 100) || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geo-Pricing Info */}
          {geoData && (
            <Card>
              <CardHeader>
                <CardTitle>Geo-Pricing Status</CardTitle>
                <CardDescription>Current location and pricing tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="text-lg font-bold">{geoData.countryName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pricing Tier</p>
                    <p className="text-lg font-bold capitalize">{geoData.tier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="text-lg font-bold">{geoData.currency}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Main Product Price</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Base: {geoData.prices.main.displayPrice}</span>
                      <span className="text-lg font-bold">{geoData.prices.main.geoAdjustedDisplay}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 10 completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Order ID</th>
                    <th className="text-left py-2 px-4">Amount</th>
                    <th className="text-left py-2 px-4">Product</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders?.slice(0, 10).map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">#{order.id}</td>
                      <td className="py-2 px-4 font-bold">${order.amount}</td>
                      <td className="py-2 px-4">{order.product}</td>
                      <td className="py-2 px-4">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
