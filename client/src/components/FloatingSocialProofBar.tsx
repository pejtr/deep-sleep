import { useState, useEffect, useCallback } from "react";
import { Star, ChevronRight, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const TESTIMONIALS = [
  { text: "4 years of broken sleep. Fixed in 7 nights. This is not normal for me.", name: "Maria L.", location: "Toronto, CA" },
  { text: "I cried the morning after Night 4. I'd forgotten what rested felt like.", name: "Sarah M.", location: "Austin, TX" },
  { text: "I was the biggest skeptic. Now I recommend this to everyone I know.", name: "Emma T.", location: "Berlin, DE" },
  { text: "Woke up this morning and thought: 'That was the best sleep in years.'", name: "David R.", location: "Sydney, AU" },
  { text: "Night shift nurse. This program gave me my sleep back.", name: "Maria L.", location: "Toronto, CA" },
];

const GUMROAD_URL = "https://deepsleepreset.gumroad.com/l/fdtifc?price=5";

export default function FloatingSocialProofBar() {
  const [liveCount, setLiveCount] = useState(849);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [, navigate] = useLocation();

  // Slowly increment live count
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => {
        const change = Math.random() > 0.4 ? 1 : 0;
        return prev + change;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Rotate testimonials
  const rotateTestimonial = useCallback(() => {
    setTestimonialIndex(prev => (prev + 1) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(rotateTestimonial, 6000);
    return () => clearInterval(interval);
  }, [rotateTestimonial]);

  const currentTestimonial = TESTIMONIALS[testimonialIndex]!;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 social-proof-bar">
      <div className="container py-2.5 flex items-center justify-between gap-3">
        {/* Left: Live counter */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" style={{ color: "oklch(0.70 0.04 265)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-lg font-bold" style={{ color: "oklch(0.95 0.01 265)" }}>{liveCount.toLocaleString()}</span>
          </div>
          <span className="text-xs hidden sm:inline" style={{ color: "oklch(0.50 0.04 265)" }}>lives changed<br />this week</span>
        </div>

        {/* Center: Quiz button (mobile) + Testimonial (desktop) */}
        <div className="flex-1 min-w-0 flex items-center justify-center gap-3">
          {/* Quiz button — visible on mobile/tablet where testimonial is hidden */}
          <button
            onClick={() => navigate("/quiz")}
            className="flex sm:hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "oklch(0.14 0.04 265)",
              border: "1px solid oklch(0.55 0.18 65 / 0.4)",
              color: "oklch(0.82 0.16 65)",
            }}
          >
            <span>Find my type</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Rotating testimonial — desktop only */}
          <div className="hidden md:flex items-center gap-3 flex-1 min-w-0 justify-center">
            <div className="flex gap-0.5 flex-shrink-0">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-3 h-3 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
              ))}
            </div>
            <p className="text-xs truncate" style={{ color: "oklch(0.70 0.04 265)" }}>
              "{currentTestimonial.text}"
            </p>
            <span className="text-xs flex-shrink-0" style={{ color: "oklch(0.50 0.04 265)" }}>
              — {currentTestimonial.name}, {currentTestimonial.location}
            </span>
          </div>

          {/* Quiz button — visible on sm (between mobile and md) */}
          <button
            onClick={() => navigate("/quiz")}
            className="hidden sm:flex md:hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "oklch(0.14 0.04 265)",
              border: "1px solid oklch(0.55 0.18 65 / 0.4)",
              color: "oklch(0.82 0.16 65)",
            }}
          >
            <span>Take the Quiz</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right: CTA */}
        <a
          href={GUMROAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-gold cta-shimmer rounded-lg px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 flex-shrink-0"
        >
          Try for $5
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
