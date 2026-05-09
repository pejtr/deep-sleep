import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AbExportButton({ testName = "landing_variant" }: { testName?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: exportData } = trpc.abTest.exportData.useQuery(
    { testName, format: "csv" },
    { enabled: false }
  );

  const handleExport = async (format: "csv" | "json") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trpc/abTest.exportData?input=${JSON.stringify({ testName, format })}`);
      const result = await response.json();
      
      if (result.result?.data?.data) {
        const content = result.result.data.data;
        const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ab-test-${testName}-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
