import { useEffect, useState } from "react";
import { getLunaImage } from "../../../shared/lunaImages";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";

interface HeroWithLunaProps {
  onChatOpen?: () => void;
}

export function HeroWithLuna({ onChatOpen }: HeroWithLunaProps) {
  const auth = useAuth();
  const user = auth?.user;
  const [lunaImage, setLunaImage] = useState<{ url: string; alt: string; name: string } | null>(null);

  // Get user's assigned persona
  const { data: personaData } = trpc.personas.getPersona.useQuery(
    { sessionId: String(user?.id || ""), page: "hero" },
    { enabled: !!user?.id, retry: false }
  );

  // Set Luna image based on persona
  useEffect(() => {
    if (personaData?.personaName) {
      const personaKey = personaData.personaName.toLowerCase().replace(/\s+/g, "-");
      const image = getLunaImage(personaKey);
      setLunaImage(image);
    } else {
      // Default to Compassionate if no persona assigned
      const defaultImage = getLunaImage("compassionate");
      setLunaImage(defaultImage);
    }
  }, [personaData]);

  // Auto-open chatbot after scroll or time
  useEffect(() => {
    if (typeof window === "undefined") return;

    let scrollTriggered = false;
    let timeTriggered = false;

    const handleScroll = () => {
      if (scrollTriggered || timeTriggered) return;

      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercentage > 66) {
        scrollTriggered = true;
        onChatOpen?.();
      }
    };

    // Auto-open after 45 seconds
    const timer = setTimeout(() => {
      if (!scrollTriggered) {
        timeTriggered = true;
        onChatOpen?.();
      }
    }, 45000);

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [onChatOpen]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div>
              <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-4">
                Science-Backed Sleep Protocol
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                You're Not Tired.
                <span className="block text-amber-400 italic">You're Sleep-Deprived.</span>
              </h1>
            </div>

            <p className="text-xl text-slate-300 leading-relaxed">
              The 7-night protocol that fixes insomnia without pills, supplements, or willpower.
            </p>

            <p className="text-base text-slate-400">
              Based on CBT-I — the #1 clinician-recommended insomnia treatment with an 80% success rate.
            </p>

            {/* Luna Introduction */}
            {lunaImage && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-amber-400">{lunaImage.name}</span> is your personal sleep guide.
                  She understands your struggle and will help you reclaim your nights.
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 text-lg">
                Fix My Sleep Tonight — $5
              </button>
              <button
                onClick={onChatOpen}
                className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400/10 font-bold py-4 px-8 rounded-lg transition-all"
              >
                Ask Luna for Free Tips
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-slate-900"
                  ></div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white">849</span> lives changed this week
              </p>
            </div>
          </div>

          {/* Right: Luna Image */}
          {lunaImage && (
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-2xl blur-2xl"></div>
              <img
                src={lunaImage.url}
                alt={lunaImage.alt}
                className="relative w-full max-w-md rounded-2xl shadow-2xl border-2 border-amber-400/30 object-cover aspect-square"
              />
              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                ● 16 people viewing now
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
    </div>
  );
}
