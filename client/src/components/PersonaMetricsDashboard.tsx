import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Sparkles, TrendingUp, Users, DollarSign, Percent } from "lucide-react";

export function PersonaMetricsDashboard() {
  const [selectedPage, setSelectedPage] = useState<string | undefined>(undefined);

  // Fetch persona performance metrics
  const { data: metrics, isLoading } = trpc.personas.getPerformance.useQuery(
    { page: selectedPage },
    { enabled: true }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading persona metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Persona Performance</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Personas will appear here as users interact with them.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = metrics.map((m) => ({
    name: m.personaName.split(" ")[1] || m.personaName, // e.g., "Compassionate" from "Luna Compassionate"
    conversions: m.conversions,
    impressions: m.impressions,
    conversionRate: parseFloat(m.conversionRate.toFixed(2)),
    avgRevenue: parseFloat(m.avgRevenue.toFixed(2)),
    totalRevenue: parseFloat(m.totalRevenue.toFixed(2)),
  }));

  // Calculate totals
  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + m.totalRevenue, 0);
  const overallConversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;

  // Find best performing persona
  const bestPersona = metrics.reduce((best, current) =>
    current.conversionRate > best.conversionRate ? current : best
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all personas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalConversions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(overallConversionRate.toFixed(2))}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${(totalRevenue / (totalConversions || 1)).toFixed(2)} per conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Best Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bestPersona.personaName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(bestPersona.conversionRate.toFixed(2))}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="conversion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="impressions">Impressions</TabsTrigger>
        </TabsList>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate by Persona</CardTitle>
              <CardDescription>Percentage of impressions that converted</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: "Conversion Rate (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(2) : value}%`} />
                  <Bar dataKey="conversionRate" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Persona</CardTitle>
              <CardDescription>Total revenue generated per persona</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: "Revenue ($)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toFixed(2) : value}`} />
                  <Bar dataKey="totalRevenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impressions">
          <Card>
            <CardHeader>
              <CardTitle>Impressions vs Conversions</CardTitle>
              <CardDescription>Traffic and conversion comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impressions" fill="#8b5cf6" name="Impressions" />
                  <Bar dataKey="conversions" fill="#ec4899" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Persona Details</CardTitle>
          <CardDescription>Performance metrics for each persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold">Persona</th>
                  <th className="text-right py-2 px-3 font-semibold">Impressions</th>
                  <th className="text-right py-2 px-3 font-semibold">Conversions</th>
                  <th className="text-right py-2 px-3 font-semibold">Conv. Rate</th>
                  <th className="text-right py-2 px-3 font-semibold">Total Revenue</th>
                  <th className="text-right py-2 px-3 font-semibold">Avg Revenue</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.personaId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-3 font-medium">{m.personaName}</td>
                    <td className="text-right py-3 px-3">{m.impressions.toLocaleString()}</td>
                    <td className="text-right py-3 px-3">{m.conversions.toLocaleString()}</td>
                    <td className="text-right py-3 px-3">
                      <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs font-semibold">
                        {parseFloat(m.conversionRate.toFixed(2))}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-3 font-semibold">${m.totalRevenue.toFixed(2)}</td>
                    <td className="text-right py-3 px-3">${m.avgRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
