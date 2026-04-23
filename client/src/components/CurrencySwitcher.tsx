import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency, SUPPORTED_CURRENCIES, type CurrencyCode } from "@/contexts/CurrencyContext";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-colors"
        style={{
          background: "oklch(0.12 0.025 255)",
          border: "1px solid oklch(0.78 0.18 65 / 0.2)",
          color: "oklch(0.75 0.04 265)",
        }}
        aria-label="Switch currency"
      >
        <span>{currency.flag}</span>
        <span className="font-semibold">{currency.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-52 rounded-xl overflow-hidden z-50 shadow-2xl"
          style={{
            background: "oklch(0.10 0.025 255)",
            border: "1px solid oklch(0.78 0.18 65 / 0.2)",
            maxHeight: "320px",
            overflowY: "auto",
          }}
        >
          {SUPPORTED_CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code as CurrencyCode); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/5"
              style={{
                background: currency.code === c.code ? "oklch(0.78 0.18 65 / 0.1)" : "transparent",
                color: currency.code === c.code ? "oklch(0.82 0.16 65)" : "oklch(0.65 0.04 265)",
              }}
            >
              <span className="text-base">{c.flag}</span>
              <span className="text-xs font-semibold w-8">{c.code}</span>
              <span className="text-xs">{c.name}</span>
              <span className="text-xs ml-auto" style={{ color: "oklch(0.50 0.04 265)" }}>{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
