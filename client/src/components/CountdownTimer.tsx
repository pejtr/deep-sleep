import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const SESSION_KEY = "dsr_countdown_end";
const DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getOrCreateEndTime(): number {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    const end = parseInt(stored, 10);
    if (end > Date.now()) return end;
  }
  const end = Date.now() + DURATION_MS;
  sessionStorage.setItem(SESSION_KEY, String(end));
  return end;
}

interface Props {
  onExpire?: () => void;
  variant?: "banner" | "inline" | "compact";
  label?: string;
}

export default function CountdownTimer({
  onExpire,
  variant = "inline",
  label = "Special offer expires in:",
}: Props) {
  const [endTime] = useState<number>(() => getOrCreateEndTime());
  const [remaining, setRemaining] = useState<number>(Math.max(0, endTime - Date.now()));
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      setExpired(true);
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      const left = Math.max(0, endTime - Date.now());
      setRemaining(left);
      if (left === 0) {
        setExpired(true);
        onExpire?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 2 * 60 * 1000; // < 2 minutes

  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "compact") {
    return (
      <span className={`font-mono font-bold tabular-nums ${isUrgent ? "countdown-urgent" : ""}`}
        style={{ color: isUrgent ? "oklch(0.65 0.22 25)" : "oklch(0.82 0.16 65)" }}>
        {pad(minutes)}:{pad(seconds)}
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <div className="w-full py-2.5 px-4 text-center"
        style={{ background: isUrgent ? "oklch(0.65 0.22 25 / 0.15)" : "oklch(0.78 0.18 65 / 0.1)" }}>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isUrgent ? "oklch(0.65 0.22 25)" : "oklch(0.82 0.16 65)" }} />
          <span className="text-xs font-medium" style={{ color: "oklch(0.70 0.04 265)" }}>
            {expired ? "Offer expired" : label}
          </span>
          {!expired && (
            <span className={`font-mono font-bold text-sm tabular-nums ${isUrgent ? "countdown-urgent" : ""}`}
              style={{ color: isUrgent ? "oklch(0.65 0.22 25)" : "oklch(0.82 0.16 65)" }}>
              {pad(minutes)}:{pad(seconds)}
            </span>
          )}
          {isUrgent && !expired && (
            <span className="text-xs font-semibold" style={{ color: "oklch(0.65 0.22 25)" }}>
              — Hurry!
            </span>
          )}
        </div>
      </div>
    );
  }

  // inline (default)
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "oklch(0.50 0.04 265)" }}>
        {expired ? "Offer expired" : label}
      </p>
      {!expired && (
        <div className="flex items-center gap-2">
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center font-mono font-black text-2xl tabular-nums"
              style={{
                background: isUrgent ? "oklch(0.65 0.22 25 / 0.15)" : "oklch(0.78 0.18 65 / 0.1)",
                border: `1px solid ${isUrgent ? "oklch(0.65 0.22 25 / 0.4)" : "oklch(0.78 0.18 65 / 0.25)"}`,
                color: isUrgent ? "oklch(0.65 0.22 25)" : "oklch(0.82 0.16 65)",
              }}>
              {pad(minutes)}
            </div>
            <span className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>min</span>
          </div>
          <span className="text-2xl font-black mb-4" style={{ color: "oklch(0.78 0.18 65)" }}>:</span>
          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-black text-2xl tabular-nums ${isUrgent ? "countdown-urgent" : ""}`}
              style={{
                background: isUrgent ? "oklch(0.65 0.22 25 / 0.15)" : "oklch(0.78 0.18 65 / 0.1)",
                border: `1px solid ${isUrgent ? "oklch(0.65 0.22 25 / 0.4)" : "oklch(0.78 0.18 65 / 0.25)"}`,
                color: isUrgent ? "oklch(0.65 0.22 25)" : "oklch(0.82 0.16 65)",
              }}>
              {pad(seconds)}
            </div>
            <span className="text-xs mt-1" style={{ color: "oklch(0.50 0.04 265)" }}>sec</span>
          </div>
        </div>
      )}
      {isUrgent && !expired && (
        <p className="text-xs font-semibold animate-pulse" style={{ color: "oklch(0.65 0.22 25)" }}>
          ⚠️ Price increases when timer hits zero!
        </p>
      )}
    </div>
  );
}
