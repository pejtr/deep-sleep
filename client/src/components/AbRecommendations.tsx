import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface Recommendation {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
}

export function AbRecommendations({ testName = "landing_variant" }: { testName?: string }) {
  const { data: recommendationsData } = trpc.abTest.getRecommendations.useQuery(
    { testName },
    { refetchInterval: 120000 }
  );

  const recommendations = useMemo(() => {
    if (!recommendationsData?.recommendations) return [];
    return recommendationsData.recommendations as Recommendation[];
  }, [recommendationsData?.recommendations]);

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>No recommendations available yet. Run the test to get insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priorityConfig = {
    high: {
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
    },
    medium: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    low: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Optimization Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, idx) => {
          const config = priorityConfig[rec.priority];
          const Icon = config.icon;

          return (
            <Alert key={idx} className={`${config.bgColor} ${config.borderColor} border-2`}>
              <div className="flex gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                <div className="flex-1">
                  <AlertDescription className="font-semibold text-foreground mb-1">
                    {rec.title}
                  </AlertDescription>
                  <AlertDescription className="text-sm text-muted-foreground">
                    {rec.description}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          );
        })}

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Recommendations are generated based on current metrics. 
            Collect more data for more accurate insights.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
