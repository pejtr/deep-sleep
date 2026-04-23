import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function SupportButton() {
  return (
    <button
      onClick={() => toast.info("Support chat coming soon! Email us at support@deepsleep.quest")}
      className="fixed bottom-[110px] left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
      style={{
        background: "oklch(0.13 0.03 265 / 0.9)",
        border: "1px solid oklch(0.78 0.18 65 / 0.15)",
        color: "oklch(0.70 0.04 265)",
        backdropFilter: "blur(8px)",
      }}
    >
      <MessageSquare className="w-3.5 h-3.5" />
      Support
    </button>
  );
}
