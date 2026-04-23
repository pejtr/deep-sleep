import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n, LANGUAGES, Lang } from "@/contexts/I18nContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
        style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.22 0.04 265)", color: "oklch(0.65 0.04 265)" }}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[140px]"
          style={{ background: "oklch(0.10 0.025 255)", border: "1px solid oklch(0.22 0.04 265)", boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)" }}
        >
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors hover:bg-white/5"
              style={{ color: l.code === lang ? "oklch(0.82 0.16 65)" : "oklch(0.65 0.04 265)" }}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && <span className="ml-auto text-xs" style={{ color: "oklch(0.82 0.16 65)" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
