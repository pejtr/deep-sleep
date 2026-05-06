import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatbotSurveyProps {
  onClose?: () => void;
}

export function ChatbotSurvey({ onClose }: ChatbotSurveyProps) {
  const [selectedLuna, setSelectedLuna] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const lunas = [
    { id: "compassionate", name: "Luna Compassionate", emoji: "❤️", desc: "Empathetic & supportive" },
    { id: "scientific", name: "Luna Scientific", emoji: "🔬", desc: "Evidence-based & credible" },
    { id: "practical", name: "Luna Practical", emoji: "⚡", desc: "Action-oriented & direct" },
    { id: "curious", name: "Luna Curious", emoji: "🤔", desc: "Inquisitive & exploratory" },
    { id: "motivational", name: "Luna Motivational", emoji: "🚀", desc: "Inspiring & uplifting" },
    { id: "holistic", name: "Luna Holistic", emoji: "🌿", desc: "Balanced & integrative" },
    { id: "storyteller", name: "Luna Storyteller", emoji: "📖", desc: "Narrative & relatable" },
    { id: "structured", name: "Luna Structured", emoji: "📋", desc: "Systematic & organized" },
    { id: "adaptive", name: "Luna Adaptive", emoji: "🔄", desc: "Flexible & responsive" },
    { id: "empowering", name: "Luna Empowering", emoji: "👑", desc: "Confident & enabling" },
  ];

  const handleSubmit = () => {
    if (!selectedLuna) return;

    // Track survey response (can be enhanced with analytics later)
    console.log("Luna preference selected:", selectedLuna);
    setSubmitted(true);
    setTimeout(() => onClose?.(), 1500);
  };

  if (submitted) {
    return (
      <div className="p-4 rounded-lg text-center" style={{ background: "oklch(0.15 0.04 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
        <p className="text-sm font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>
          ✨ Great! We've noted your preference.
        </p>
        <p className="text-xs mt-2" style={{ color: "oklch(0.60 0.04 265)" }}>
          Your Luna guide will be even more tailored to you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-lg" style={{ background: "oklch(0.15 0.04 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
      <p className="text-sm font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>
        Which Luna resonates with you most?
      </p>

      <div className="grid grid-cols-2 gap-2">
        {lunas.map((luna) => (
          <button
            key={luna.id}
            onClick={() => setSelectedLuna(luna.id)}
            className="p-3 rounded-lg text-left transition-all text-xs"
            style={{
              background: selectedLuna === luna.id ? "oklch(0.82 0.16 65 / 0.2)" : "oklch(0.20 0.04 265)",
              border: selectedLuna === luna.id ? "1px solid oklch(0.82 0.16 65)" : "1px solid oklch(0.30 0.04 265)",
              color: selectedLuna === luna.id ? "oklch(0.82 0.16 65)" : "oklch(0.70 0.04 265)",
            }}
          >
            <div className="font-semibold text-sm">
              {luna.emoji} {luna.name.split(" ")[1]}
            </div>
            <div className="text-xs opacity-75">{luna.desc}</div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedLuna}
        className="w-full text-sm font-semibold"
        style={{
          background: selectedLuna ? "oklch(0.82 0.16 65)" : "oklch(0.40 0.04 265)",
          color: selectedLuna ? "oklch(0.07 0.025 255)" : "oklch(0.60 0.04 265)",
        }}
      >
        Confirm Preference
      </Button>
    </div>
  );
}
