import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

type Chronotype = "Lion" | "Bear" | "Wolf" | "Dolphin" | "all";

interface Testimonial {
  name: string;
  location: string;
  chronotype: Chronotype;
  text: string;
  result: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah M.",
    location: "New York, USA",
    chronotype: "Wolf",
    text: "I finally understand why I couldn't sleep before midnight. The Wolf Protocol completely changed my routine — I sleep 7+ hours now and wake up actually refreshed.",
    result: "Went from 4h to 7.5h sleep",
    avatar: "SM",
  },
  {
    name: "James K.",
    location: "London, UK",
    chronotype: "Bear",
    text: "As a Bear, I always felt guilty for not being a morning person. This guide validated my natural rhythm and gave me a schedule that actually works with my body.",
    result: "Sleep quality improved 60%",
    avatar: "JK",
  },
  {
    name: "Emma W.",
    location: "Sydney, Australia",
    chronotype: "Lion",
    text: "I'm a Lion and I used to crash at 9pm feeling like something was wrong with me. Now I have a protocol that keeps my energy high all day and I sleep deeply.",
    result: "No more 3pm energy crashes",
    avatar: "EW",
  },
  {
    name: "David L.",
    location: "Toronto, Canada",
    chronotype: "Dolphin",
    text: "Dolphin type — I've struggled with light, fragmented sleep my whole life. The Dolphin Protocol gave me specific techniques for my anxious mind. Game changer.",
    result: "Reduced night wakings by 80%",
    avatar: "DL",
  },
  {
    name: "Luna D.",
    location: "Paris, France",
    chronotype: "Wolf",
    text: "Three weeks in and I'm sleeping through the night for the first time in years. The chronotype approach is so much more personalized than generic sleep advice.",
    result: "Sleeping through the night",
    avatar: "LD",
  },
  {
    name: "Marco R.",
    location: "Milan, Italy",
    chronotype: "Bear",
    text: "My Bear schedule was completely off. After following the protocol for 2 weeks, my energy is consistent, I'm not dragging through afternoons anymore.",
    result: "Consistent energy all day",
    avatar: "MR",
  },
  {
    name: "Priya N.",
    location: "Mumbai, India",
    chronotype: "Dolphin",
    text: "As a Dolphin, I was always told I just had anxiety. This guide showed me it's my chronotype and gave me real solutions. I'm sleeping 6 solid hours now.",
    result: "From 3h to 6h solid sleep",
    avatar: "PN",
  },
  {
    name: "Felix B.",
    location: "Berlin, Germany",
    chronotype: "Lion",
    text: "Lion here. I thought waking at 5am was just who I was, but I was fighting my own biology in the evenings. The protocol optimized my entire day around my type.",
    result: "Peak performance every morning",
    avatar: "FB",
  },
];

const CHRONOTYPE_ICONS: Record<string, string> = {
  Lion: "🦁",
  Bear: "🐻",
  Wolf: "🐺",
  Dolphin: "🐬",
  all: "✨",
};

interface Props {
  chronotype?: Chronotype;
  autoPlay?: boolean;
  interval?: number;
}

export default function TestimonialsCarousel({
  chronotype = "all",
  autoPlay = true,
  interval = 5000,
}: Props) {
  const filtered = chronotype === "all"
    ? TESTIMONIALS
    : TESTIMONIALS.filter(t => t.chronotype === chronotype || t.chronotype === "all");

  const items = filtered.length > 0 ? filtered : TESTIMONIALS;
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + items.length) % items.length);
  const next = () => setCurrent(i => (i + 1) % items.length);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const t = items[current];
  if (!t) return null;

  return (
    <div className="relative w-full">
      {/* Main card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Quote mark */}
        <div className="absolute top-4 right-6 text-6xl font-display leading-none select-none"
          style={{ color: "oklch(0.78 0.18 65 / 0.08)" }}>
          "
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mb-4">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-4 h-4 fill-current" style={{ color: "oklch(0.82 0.16 65)" }} />
          ))}
        </div>

        {/* Text */}
        <p className="text-sm md:text-base leading-relaxed mb-5" style={{ color: "oklch(0.80 0.02 265)" }}>
          "{t.text}"
        </p>

        {/* Result badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
          style={{ background: "oklch(0.78 0.18 65 / 0.1)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
          <span className="text-xs">✅</span>
          <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.16 65)" }}>{t.result}</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "oklch(0.78 0.18 65 / 0.15)", color: "oklch(0.82 0.16 65)" }}>
            {t.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>{t.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "oklch(0.78 0.18 65 / 0.1)", color: "oklch(0.78 0.18 65)" }}>
                {CHRONOTYPE_ICONS[t.chronotype]} {t.chronotype}
              </span>
            </div>
            <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>{t.location}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button onClick={prev}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "oklch(0.13 0.03 265)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
          <ChevronLeft className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: i === current ? "oklch(0.78 0.18 65)" : "oklch(0.78 0.18 65 / 0.25)",
                width: i === current ? "1.5rem" : "0.375rem",
              }} />
          ))}
        </div>

        <button onClick={next}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "oklch(0.13 0.03 265)", border: "1px solid oklch(0.78 0.18 65 / 0.2)" }}>
          <ChevronRight className="w-4 h-4" style={{ color: "oklch(0.78 0.18 65)" }} />
        </button>
      </div>
    </div>
  );
}
