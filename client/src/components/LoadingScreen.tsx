import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Discovering your sleep profile...",
  "Analyzing your chronotype...",
  "Unlocking your sleep secrets...",
  "Calculating your perfect bedtime...",
  "Revealing your sleep potential...",
  "Mapping your sleep architecture...",
  "Decoding your rest patterns...",
  "Optimizing your sleep science...",
];

export function LoadingScreen() {
  const [randomMessage] = useState(() => 
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );

  // Delay loading screen for 3-4 seconds to build anticipation
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" 
           style={{ background: "oklch(0.07 0.025 255)" }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 animate-gradient"
               style={{
                 background: "linear-gradient(45deg, #7c3aed, #5b21b6, #7c3aed)",
                 backgroundSize: "200% 200%",
               }} />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Animated circle - slower rotation */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 border-r-purple-500 animate-spin" 
                   style={{ animationDuration: "4s" }} />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-yellow-300 animate-spin" 
                   style={{ animationDirection: "reverse", animationDuration: "6s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" 
                     style={{ animationDuration: "2s" }} />
              </div>
            </div>
          </div>

          {/* Text - fade in smoothly */}
          <div className="h-8 flex items-center justify-center">
            <p className="text-lg font-medium text-gray-300 animate-fade-in">
              {randomMessage}
            </p>
          </div>

          {/* Dots animation - slower */}
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-yellow-400"
                style={{
                  animation: `pulse 2s infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .animate-gradient {
            animation: gradient 20s ease infinite;
          }

          @keyframes fade-in {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }

          .animate-fade-in {
            animation: fade-in 3.5s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
