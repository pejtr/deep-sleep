import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n, LANGUAGES, Lang } from "@/contexts/I18nContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(o => !o);
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
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
          className="rounded-xl min-w-[160px] overflow-y-auto"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 99999,
            background: "rgb(8, 10, 20)",
            border: "1px solid oklch(0.30 0.06 265)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.08)",
            maxHeight: "min(400px, 70vh)",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
          }}
        >
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as Lang); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left"
              style={{
                color: l.code === lang ? "oklch(0.82 0.16 65)" : "oklch(0.75 0.04 265)",
                background: l.code === lang ? "rgba(255,255,255,0.06)" : "transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = l.code === lang ? "rgba(255,255,255,0.06)" : "transparent")}
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
