import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface AnalyticsData {
  dateRange: { start: Date; end: Date };
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  dailyMetrics: Array<{
    date: string;
    visits: number;
    orders: number;
    revenue: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  topPages: Array<{
    page: string;
    visits: number;
    conversionRate: number;
  }>;
}

export function generateAnalyticsCSV(data: AnalyticsData): string {
  const lines: string[] = [];

  // Header
  lines.push("Deep Sleep Reset - Analytics Report");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Date Range: ${data.dateRange.start.toISOString()} to ${data.dateRange.end.toISOString()}`);
  lines.push("");

  // KPIs
  lines.push("KEY PERFORMANCE INDICATORS");
  lines.push("Metric,Value");
  lines.push(`Total Revenue,$${data.kpis.totalRevenue.toFixed(2)}`);
  lines.push(`Total Orders,${data.kpis.totalOrders}`);
  lines.push(`Conversion Rate,${data.kpis.conversionRate.toFixed(2)}%`);
  lines.push(`Average Order Value,$${data.kpis.avgOrderValue.toFixed(2)}`);
  lines.push("");

  // Daily Metrics
  lines.push("DAILY METRICS");
  lines.push("Date,Visits,Orders,Revenue");
  data.dailyMetrics.forEach((metric) => {
    lines.push(`${metric.date},${metric.visits},${metric.orders},$${metric.revenue.toFixed(2)}`);
  });
  lines.push("");

  // Device Breakdown
  lines.push("DEVICE BREAKDOWN");
  lines.push("Device,Count,Percentage");
  data.deviceBreakdown.forEach((device) => {
    lines.push(`${device.device},${device.count},${device.percentage.toFixed(2)}%`);
  });
  lines.push("");

  // Top Pages
  lines.push("TOP PAGES");
  lines.push("Page,Visits,Conversion Rate");
  data.topPages.forEach((page) => {
    lines.push(`${page.page},${page.visits},${page.conversionRate.toFixed(2)}%`);
  });

  return lines.join("\n");
}

export function generateAnalyticsPDF(data: AnalyticsData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;

  // Title
  doc.setFontSize(20);
  doc.text("Deep Sleep Reset - Analytics Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Date Range
  doc.setFontSize(10);
  doc.text(
    `Report Period: ${data.dateRange.start.toLocaleDateString()} to ${data.dateRange.end.toLocaleDateString()}`,
    10,
    yPosition
  );
  yPosition += 10;

  // KPIs Section
  doc.setFontSize(14);
  doc.text("Key Performance Indicators", 10, yPosition);
  yPosition += 8;

  const kpiData = [
    ["Metric", "Value"],
    ["Total Revenue", `$${data.kpis.totalRevenue.toFixed(2)}`],
    ["Total Orders", `${data.kpis.totalOrders}`],
    ["Conversion Rate", `${data.kpis.conversionRate.toFixed(2)}%`],
    ["Average Order Value", `$${data.kpis.avgOrderValue.toFixed(2)}`],
  ];

  (doc as any).autoTable({
    head: [kpiData[0]],
    body: kpiData.slice(1),
    startY: yPosition,
    margin: 10,
    theme: "grid",
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Daily Metrics Section
  doc.setFontSize(14);
  doc.text("Daily Metrics", 10, yPosition);
  yPosition += 8;

  const dailyData = [
    ["Date", "Visits", "Orders", "Revenue"],
    ...data.dailyMetrics.map((m) => [m.date, `${m.visits}`, `${m.orders}`, `$${m.revenue.toFixed(2)}`]),
  ];

  (doc as any).autoTable({
    head: [dailyData[0]],
    body: dailyData.slice(1),
    startY: yPosition,
    margin: 10,
    theme: "grid",
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Device Breakdown Section
  doc.setFontSize(14);
  doc.text("Device Breakdown", 10, yPosition);
  yPosition += 8;

  const deviceData = [
    ["Device", "Count", "Percentage"],
    ...data.deviceBreakdown.map((d) => [d.device, `${d.count}`, `${d.percentage.toFixed(2)}%`]),
  ];

  (doc as any).autoTable({
    head: [deviceData[0]],
    body: deviceData.slice(1),
    startY: yPosition,
    margin: 10,
    theme: "grid",
  });

  return Buffer.from(doc.output("arraybuffer"));
}
