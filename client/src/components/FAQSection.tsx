import { useState } from "react";
import { ChevronRight } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Is this just another generic sleep tips PDF?",
    a: "No. This is a structured 7-night protocol based on Cognitive Behavioral Therapy for Insomnia (CBT-I) — the gold standard treatment recommended by the American Academy of Sleep Medicine. Each night builds on the last with specific techniques matched to your chronotype. It's not tips. It's a system.",
  },
  {
    q: "How is this different from melatonin or Ambien?",
    a: "Melatonin and sleep medications treat symptoms — they don't fix the root cause. CBT-I addresses the behavioral and cognitive patterns that cause insomnia. Studies show CBT-I produces lasting results even after treatment ends, while medication effects stop when you stop taking them. This protocol teaches your brain how to sleep again.",
  },
  {
    q: "I've tried everything. Why would this be different?",
    a: "Because \"everything\" you've tried probably wasn't matched to your biology. Most sleep advice is one-size-fits-all. This protocol is built around your specific chronotype — your body's natural sleep-wake rhythm. When you align your protocol with your biology, everything changes. CBT-I has an 80% clinical success rate for a reason.",
  },
  {
    q: "How fast will I see results?",
    a: "Most people notice a significant shift by Night 3-4. The breathing technique on Night 4 is where many people have their breakthrough moment. By Night 7, you'll have a complete system you can use for life. Individual results vary, but CBT-I clinical trials show ~80% success rate.",
  },
  {
    q: "Do I need any equipment, apps, or subscriptions?",
    a: "Nothing. Zero. The entire protocol works with things you already have. No special pillows, no apps, no subscriptions, no supplements. Just the protocol and your commitment to follow it for 7 nights.",
  },
  {
    q: "Why does it only cost $5? What's the catch?",
    a: "There's no catch. I priced it at $5 because I want the barrier to be zero. The total value of everything included is over $110. I'd rather help 10,000 people at $5 than 100 people at $97. Your only job is to try it. If it doesn't work, you get your money back. No questions asked.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "Then you pay nothing. Go through the 7-night protocol. If you don't sleep noticeably better within 30 days, email me and I'll refund your $5 immediately. No forms. No questions. No waiting. I can offer this because CBT-I works. The clinical data is clear.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 container py-20">
      <div className="text-center mb-12">
        <div className="text-2xl mb-4">❓</div>
        <h2
          className="font-display font-bold text-3xl md:text-4xl"
          style={{ color: "oklch(0.95 0.01 265)" }}
        >
          Questions & Honest Answers
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="faq-item">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span
                className="text-sm md:text-base font-medium pr-4"
                style={{ color: "oklch(0.90 0.01 265)" }}
              >
                {item.q}
              </span>
              <ChevronRight
                className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "oklch(0.50 0.04 265)",
                  transform: openIndex === i ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.60 0.04 265)" }}
                >
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
