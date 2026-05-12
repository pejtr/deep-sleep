import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Zap } from "lucide-react";

interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  effort: string;
}

export function RecommendationsPanel() {
  const [language] = useState<"cs" | "en">("cs");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  const { data: recommendations, isLoading } = trpc.recommendations.getRecommendations.useQuery({
    language,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <Zap className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
  };

  const applyMutation = trpc.recommendations.executeRecommendation.useMutation();
  
  const handleApply = async (rec: Recommendation) => {
    try {
      await applyMutation.mutateAsync({
        recommendationId: rec.id,
        title: rec.title,
        description: rec.description,
      });
      handleDismiss(rec.id);
    } catch (error) {
      console.error('[Recommendations] Apply failed:', error);
    }
  };

  const visibleRecommendations = recommendations?.filter(
    (rec: any) => !dismissedIds.has(rec.id)
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (visibleRecommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
        <p className="text-gray-600">
          {language === "cs" ? "Všechna doporučení byla implementována! 🎉" : "All recommendations implemented! 🎉"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {language === "cs" ? "🤖 AI Doporučení" : "🤖 AI Recommendations"}
        </h3>
        <Badge variant="outline">
          {visibleRecommendations.length} {language === "cs" ? "aktivních" : "active"}
        </Badge>
      </div>

      <div className="space-y-3">
        {visibleRecommendations.map((rec: Recommendation) => (
          <Card key={rec.id} className={`p-4 border-2 ${getPriorityColor(rec.priority)}`}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                {getPriorityIcon(rec.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <p className="text-xs opacity-75 mt-1">{rec.description}</p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {rec.priority === "high"
                      ? language === "cs"
                        ? "Vysoká"
                        : "High"
                      : rec.priority === "medium"
                      ? language === "cs"
                        ? "Střední"
                        : "Medium"
                      : language === "cs"
                      ? "Nízká"
                      : "Low"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <span className="opacity-60">
                      {language === "cs" ? "Dopad:" : "Impact:"}
                    </span>
                    <p className="font-medium">{rec.impact}</p>
                  </div>
                  <div>
                    <span className="opacity-60">
                      {language === "cs" ? "Úsilí:" : "Effort:"}
                    </span>
                    <p className="font-medium">{rec.effort}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApply(rec)}
                    disabled={applyMutation.isPending}
                    className="text-xs"
                  >
                    {applyMutation.isPending ? (language === "cs" ? "Aplikuji..." : "Applying...") : (language === "cs" ? "✓ Aplikovat" : "✓ Apply")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismiss(rec.id)}
                    className="text-xs"
                  >
                    {language === "cs" ? "✕ Zavřít" : "✕ Dismiss"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {dismissedIds.size > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissedIds(new Set())}
            className="text-xs"
          >
            {language === "cs" ? "Obnovit všechna doporučení" : "Restore all recommendations"}
          </Button>
        </div>
      )}
    </div>
  );
}
