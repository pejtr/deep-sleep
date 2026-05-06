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
    <div className="relative min-h-screen overflow-hidden" style={{ background: "oklch(0.07 0.025 255)" }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: "oklch(0.55 0.18 145 / 0.1)" }}></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl" style={{ background: "oklch(0.50 0.18 265 / 0.1)" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div>
              <p className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: "oklch(0.82 0.16 65)" }}>
                Science-Backed Sleep Protocol
              </p>
              <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 max-w-5xl" style={{ color: "oklch(0.95 0.01 265)" }}>
                You're Not Tired.
                <br />
                <span className="text-gradient-gold-italic">You're Sleep-Deprived.</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: "oklch(0.70 0.04 265)" }}>
              The 7-night protocol that fixes insomnia without pills, supplements, or willpower.
            </p>

            <p className="text-sm max-w-xl" style={{ color: "oklch(0.50 0.04 265)" }}>
              Based on CBT-I — the #1 clinician-recommended insomnia treatment with an 80% success rate.
            </p>

            {/* Luna Introduction */}
            {lunaImage && (
              <div className="rounded-lg p-4 backdrop-blur" style={{ background: "oklch(0.15 0.04 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
                <p className="text-sm" style={{ color: "oklch(0.60 0.04 265)" }}>
                  <span className="font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>{lunaImage.name}</span> is your personal sleep guide.
                  She understands your struggle and will help you reclaim your nights.
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="cta-gold cta-shimmer rounded-2xl px-10 py-5 text-lg inline-flex items-center gap-3 font-bold">
                Fix My Sleep Tonight — $5
              </button>
              <button
                onClick={onChatOpen}
                className="border-2 rounded-2xl px-10 py-5 text-lg font-bold transition-all" style={{ borderColor: "oklch(0.82 0.16 65)", color: "oklch(0.82 0.16 65)" }}
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
                    className="w-8 h-8 rounded-full border-2" style={{ background: "oklch(0.82 0.16 65)", borderColor: "oklch(0.07 0.025 255)" }}
                  ></div>
                ))}
              </div>
              <p className="text-sm" style={{ color: "oklch(0.40 0.04 265)" }}>
                <span className="font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>849</span> lives changed this week
              </p>
            </div>
          </div>

          {/* Right: Luna Image */}
          {lunaImage && (
            <div className="relative flex justify-center items-center animate-reveal stagger-2">
              <div className="absolute inset-0 rounded-2xl blur-2xl" style={{ background: "linear-gradient(to right, oklch(0.82 0.16 65 / 0.2), oklch(0.75 0.18 145 / 0.2))" }}></div>
              <img
                src={lunaImage.url}
                alt={lunaImage.alt}
                className="relative w-full max-w-md rounded-2xl shadow-2xl border-2 object-cover aspect-square" style={{ borderColor: "oklch(0.82 0.16 65 / 0.3)" }}
              />
              {/* Floating badge */}
              <div className="absolute top-4 right-4 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse" style={{ background: "oklch(0.75 0.18 145)" }}>
                ● 16 people viewing now
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, oklch(0.82 0.16 65 / 0.5), transparent)" }}></div>
    </div>
  );
}
