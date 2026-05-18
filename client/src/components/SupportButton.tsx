import { AlertTriangle } from "lucide-react";

export default function SupportButton() {
  const handleClick = () => {
    window.location.href = "mailto:support@deep-sleep-reset.com?subject=Deep Sleep Reset - Support";
  };

  return (
    <button
      onClick={handleClick}
      title="Contact Support"
      className="fixed bottom-32 md:bottom-[68px] left-4 z-40 flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:scale-110 hover:opacity-100 opacity-70"
      style={{
        background: "oklch(0.13 0.03 265 / 0.95)",
        border: "1px solid oklch(0.78 0.18 65 / 0.2)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 12px oklch(0 0 0 / 0.4)",
      }}
    >
      <AlertTriangle className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
    </button>
  );
}
