/**
 * PageTransitionOverlay
 * Full-screen animated overlay that appears when navigating between key funnel pages.
 * Sleep-themed: dark cosmic background, moon/stars, progress bar, contextual message.
 */
import { useEffect, useState } from "react";

interface PageTransitionOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

const SLEEP_MESSAGES = [
  { main: "Analyzing your sleep profile...", sub: "Personalizing your protocol" },
  { main: "Preparing your results...", sub: "Based on your chronotype" },
  { main: "Loading your protocol...", sub: "Tailored for your sleep type" },
  { main: "Almost there...", sub: "Setting up your dashboard" },
];

export default function PageTransitionOverlay({
  isVisible,
  message,
  subMessage,
}: PageTransitionOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"enter" | "active" | "exit">("enter");
  const [msgIndex] = useState(() => Math.floor(Math.random() * SLEEP_MESSAGES.length));

  const displayMessage = message ?? SLEEP_MESSAGES[msgIndex].main;
  const displaySub = subMessage ?? SLEEP_MESSAGES[msgIndex].sub;

  useEffect(() => {
    if (!isVisible) {
      setPhase("exit");
      setProgress(0);
      return;
    }

    setPhase("enter");
    setProgress(0);

    // Animate progress bar: fast to 80%, then slow, then jump to 100% on exit
    const intervals: ReturnType<typeof setInterval>[] = [];

    // Phase 1: 0 → 40% quickly (0–300ms)
    let p = 0;
    const fast = setInterval(() => {
      p += 4;
      setProgress(Math.min(p, 40));
      if (p >= 40) clearInterval(fast);
    }, 30);
    intervals.push(fast);

    // Phase 2: 40 → 75% medium (300–900ms)
    const medium = setTimeout(() => {
      let p2 = 40;
      const mid = setInterval(() => {
        p2 += 1.5;
        setProgress(Math.min(p2, 75));
        if (p2 >= 75) clearInterval(mid);
      }, 40);
      intervals.push(mid);
    }, 300);

    // Phase 3: 75 → 88% slow (900–1800ms)
    const slow = setTimeout(() => {
      let p3 = 75;
      const sl = setInterval(() => {
        p3 += 0.5;
        setProgress(Math.min(p3, 88));
        if (p3 >= 88) clearInterval(sl);
      }, 60);
      intervals.push(sl);
    }, 900);

    return () => {
      clearInterval(fast);
      clearTimeout(medium);
      clearTimeout(slow);
      intervals.forEach(clearInterval);
    };
  }, [isVisible]);

  if (!isVisible && phase === "exit") return null;

  return (
    <div
      className="page-transition-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0.05 0.03 255)",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
        pointerEvents: isVisible ? "all" : "none",
      }}
    >
      {/* Starfield background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: i % 5 === 0 ? "2px" : "1px",
              height: i % 5 === 0 ? "2px" : "1px",
              borderRadius: "50%",
              background: "white",
              top: `${Math.sin(i * 137.5) * 50 + 50}%`,
              left: `${Math.cos(i * 137.5) * 50 + 50}%`,
              opacity: 0.3 + (i % 4) * 0.15,
              animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.15) % 2}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient orbs */}
      <div style={{
        position: "absolute", top: "10%", right: "10%",
        width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, oklch(0.35 0.15 280 / 0.15), transparent 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", left: "5%",
        width: "250px", height: "250px", borderRadius: "50%",
        background: "radial-gradient(circle, oklch(0.35 0.12 260 / 0.12), transparent 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />

      {/* Moon animation */}
      <div style={{ position: "relative", marginBottom: "32px" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, oklch(0.92 0.08 85), oklch(0.72 0.12 75))",
          boxShadow: "0 0 30px oklch(0.82 0.16 65 / 0.4), 0 0 60px oklch(0.82 0.16 65 / 0.15)",
          animation: "moonPulse 2.5s ease-in-out infinite",
        }} />
        {/* Crescent shadow */}
        <div style={{
          position: "absolute", top: "4px", left: "12px",
          width: "64px", height: "64px", borderRadius: "50%",
          background: "oklch(0.05 0.03 255)",
          opacity: 0.45,
        }} />
        {/* Orbiting dot */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "90px", height: "90px",
          marginTop: "-45px", marginLeft: "-45px",
          animation: "orbit 2s linear infinite",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%",
            width: "8px", height: "8px",
            marginLeft: "-4px", marginTop: "-4px",
            borderRadius: "50%",
            background: "oklch(0.75 0.15 280)",
            boxShadow: "0 0 8px oklch(0.75 0.15 280 / 0.8)",
          }} />
        </div>
      </div>

      {/* Message */}
      <p style={{
        fontSize: "1.1rem", fontWeight: 700,
        color: "oklch(0.92 0.02 265)",
        marginBottom: "8px",
        letterSpacing: "0.01em",
        textAlign: "center",
        animation: "fadeSlideUp 0.4s ease both",
      }}>
        {displayMessage}
      </p>
      <p style={{
        fontSize: "0.8rem",
        color: "oklch(0.55 0.06 280)",
        marginBottom: "36px",
        textAlign: "center",
        animation: "fadeSlideUp 0.4s ease 0.1s both",
      }}>
        {displaySub}
      </p>

      {/* Progress bar */}
      <div style={{
        width: "220px", height: "3px",
        borderRadius: "999px",
        background: "oklch(0.18 0.04 265)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          borderRadius: "999px",
          background: "linear-gradient(90deg, oklch(0.55 0.18 280), oklch(0.72 0.18 65))",
          transition: "width 0.15s ease",
          boxShadow: "0 0 8px oklch(0.65 0.18 280 / 0.6)",
        }} />
      </div>

      {/* Dots loader */}
      <div style={{ display: "flex", gap: "6px", marginTop: "20px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "oklch(0.55 0.15 280)",
            animation: `dotBounce 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}
