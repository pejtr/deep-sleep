/**
 * SleepChatBot — Personalized AI Sleep Coach
 * 
 * Personas (random per session):
 *   Luna   — empathetic, warm, gentle ("I understand how exhausting that is...")
 *   Petra  — scientific, evidence-based ("CBT-I studies show 80% success rate...")
 *   Lucie  — direct, no-nonsense ("Here's exactly what you need to do...")
 * 
 * Modes:
 *   /           → sales persona (Luna/Petra/Lucie) — always selling, never admin
 *   /affiliates → Affiliate Guide mode
 *   /admin      → Admin mode with stats access (admin users only)
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { X, Send, Moon, Loader2, Star, Sparkles, Brain, Zap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  isProactive?: boolean;
}

// ── Persona definitions ───────────────────────────────────────────────────────
type PersonaId = "luna" | "petra" | "lucie";

interface Persona {
  id: PersonaId;
  name: string;
  emoji: string;
  tagline: string;
  style: string; // system prompt style instruction
  welcomeEn: string;
  welcomeCs: string;
  proactiveEn: string;
  proactiveCs: string;
  exitEn: string;
  exitCs: string;
  buttonLabel: string;
  color: string; // accent color
}

const PERSONAS: Record<PersonaId, Persona> = {
  luna: {
    id: "luna",
    name: "Luna",
    emoji: "🌙",
    tagline: "AI Sleep Coach · Online",
    style: "You are Luna, a warm and empathetic AI sleep coach. You speak gently, acknowledge feelings first, then offer solutions. You're like a caring friend who happens to know everything about sleep science. Use phrases like 'I understand how exhausting that is...' and 'You deserve to sleep well.' Always gently guide toward the Deep Sleep Reset guide ($1) as the solution.",
    welcomeEn: "Hi, I'm Luna 🌙 I know how exhausting it is to lie awake night after night. You're not alone — and there IS a solution. What's keeping you up at night?",
    welcomeCs: "Ahoj, jsem Luna 🌙 Vím, jak vyčerpávající je ležet vzhůru noc za nocí. Nejsi v tom sama/sám — a EXISTUJE řešení. Co tě v noci drží vzhůru?",
    proactiveEn: "Still awake? 🌙 I've been here with you. If sleep has been a struggle, I want you to know — it doesn't have to be this way. The Deep Sleep Reset fixed this for 12,847 people. Just $1.",
    proactiveCs: "Stále vzhůru? 🌙 Jsem tu s tebou. Pokud je spánek problém, chci, abys věděl/a — nemusí to tak být. Deep Sleep Reset pomohl 12 847 lidem. Jen $1.",
    exitEn: "Wait 🌙 Before you go — I just want you to know that what you're experiencing is fixable. Most people see results by Night 3. You deserve to sleep well. It's only $1.",
    exitCs: "Počkej 🌙 Než odejdeš — chci, abys věděl/a, že to, co zažíváš, se dá napravit. Většina lidí vidí výsledky do 3. noci. Zasloužíš si dobře spát. Jen $1.",
    buttonLabel: "Ask Luna",
    color: "oklch(0.55 0.18 65)",
  },
  petra: {
    id: "petra",
    name: "Petra",
    emoji: "🔬",
    tagline: "Sleep Science Expert · Online",
    style: "You are Petra, a scientific and evidence-based AI sleep expert. You cite research, use precise language, and explain the neuroscience behind sleep. Use phrases like 'Research shows...', 'CBT-I clinical trials demonstrate...', 'The science is clear...'. You're credible and authoritative. Always guide toward the Deep Sleep Reset guide ($1) as the evidence-based solution.",
    welcomeEn: "Hi, I'm Petra 🔬 Sleep science is my specialty. CBT-I — the method behind Deep Sleep Reset — has an 80% success rate in clinical trials. What sleep challenges can I help you understand?",
    welcomeCs: "Ahoj, jsem Petra 🔬 Spánková věda je moje specializace. CBT-I — metoda za Deep Sleep Reset — má 80% úspěšnost v klinických studiích. Jaké spánkové problémy ti mohu pomoci pochopit?",
    proactiveEn: "Still browsing? 🔬 Quick fact: 68% of adults have clinically significant sleep issues. CBT-I (the method in Deep Sleep Reset) outperforms sleep medication in every study. It's $1 and it works.",
    proactiveCs: "Stále procházíš? 🔬 Rychlý fakt: 68 % dospělých má klinicky významné problémy se spánkem. CBT-I (metoda v Deep Sleep Reset) překonává léky na spaní v každé studii. Stojí $1 a funguje.",
    exitEn: "Before you leave 🔬 — The research is unambiguous: untreated sleep problems worsen over time. CBT-I has an 80% success rate. Deep Sleep Reset is $1. The ROI on your sleep is infinite.",
    exitCs: "Než odejdeš 🔬 — Výzkum je jednoznačný: neléčené problémy se spánkem se časem zhoršují. CBT-I má 80% úspěšnost. Deep Sleep Reset je $1. Návratnost investice do spánku je nekonečná.",
    buttonLabel: "Ask Petra",
    color: "oklch(0.55 0.22 200)",
  },
  lucie: {
    id: "lucie",
    name: "Lucie",
    emoji: "⚡",
    tagline: "Sleep Optimizer · Online",
    style: "You are Lucie, a direct and no-nonsense AI sleep optimizer. You skip the fluff and give actionable steps immediately. Use phrases like 'Here's exactly what you need to do:', 'Stop doing X, start doing Y', 'This is the fix:'. You're efficient and results-focused. Always guide toward the Deep Sleep Reset guide ($1) as the fastest solution.",
    welcomeEn: "Hey, I'm Lucie ⚡ No fluff — just solutions. Tell me your sleep problem and I'll give you the exact fix. Most people see results by Night 3 with the right protocol.",
    welcomeCs: "Ahoj, jsem Lucie ⚡ Žádné kecy — jen řešení. Řekni mi svůj spánkový problém a dám ti přesný postup. Většina lidí vidí výsledky do 3. noci se správným protokolem.",
    proactiveEn: "Still here? ⚡ Quick question: How many nights of bad sleep can you afford? The fix is $1. Deep Sleep Reset. 7 nights. Done. What's stopping you?",
    proactiveCs: "Stále tady? ⚡ Rychlá otázka: Kolik nocí špatného spánku si můžeš dovolit? Řešení stojí $1. Deep Sleep Reset. 7 nocí. Hotovo. Co tě zastavuje?",
    exitEn: "Stop. ⚡ You came here for a reason. Bad sleep costs you energy, focus, health, and years of your life. The fix: $1. Deep Sleep Reset. 7 nights. Go.",
    exitCs: "Stop. ⚡ Přišel/přišla jsi sem z důvodu. Špatný spánek tě stojí energii, soustředění, zdraví a roky života. Řešení: $1. Deep Sleep Reset. 7 nocí. Jdi do toho.",
    buttonLabel: "Ask Lucie",
    color: "oklch(0.55 0.20 145)",
  },
};

// Pick a stable persona per session
function getSessionPersona(): PersonaId {
  const stored = sessionStorage.getItem("chatbot_persona");
  if (stored && (stored === "luna" || stored === "petra" || stored === "lucie")) {
    return stored as PersonaId;
  }
  const personas: PersonaId[] = ["luna", "petra", "lucie"];
  const picked = personas[Math.floor(Math.random() * personas.length)]!;
  sessionStorage.setItem("chatbot_persona", picked);
  return picked;
}

const FEEDBACK_PROMPT_EN = "By the way — how would you rate your sleep problems on a scale of 1-5? (1 = mild, 5 = severe) This helps me give you better advice! 🌙";
const FEEDBACK_PROMPT_CS = "Mimochodem — jak bys ohodnotil/a své problémy se spánkem na škále 1-5? (1 = mírné, 5 = závažné) Pomůže mi to dát ti lepší rady! 🌙";

// ── Component ─────────────────────────────────────────────────────────────────
export default function SleepChatBot() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const [location] = useLocation();

  // Mode detection
  const isAdminPage = location === "/admin";
  const isAffiliatePage = location === "/affiliates";
  const isAdminMode = isAdminPage && user?.role === "admin";
  const isAffiliateMode = isAffiliatePage;
  // On landing page and all other pages: always use sales persona, never admin
  const isSalesMode = !isAdminMode && !isAffiliateMode;

  // Persona (stable per session, only for sales mode)
  const [personaId] = useState<PersonaId>(() => getSessionPersona());
  const persona = PERSONAS[personaId]!;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const [showProactiveBubble, setShowProactiveBubble] = useState(false);
  const [proactiveDismissed, setProactiveDismissed] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [feedbackAsked, setFeedbackAsked] = useState(false);
  const [showFeedbackStars, setShowFeedbackStars] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.chat.message.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      const newCount = exchangeCount + 1;
      setExchangeCount(newCount);
      if (newCount >= 3 && !feedbackAsked && isSalesMode) {
        setFeedbackAsked(true);
        setTimeout(() => {
          const prompt = lang === "cs" ? FEEDBACK_PROMPT_CS : FEEDBACK_PROMPT_EN;
          setMessages(prev => [...prev, { role: "assistant", content: prompt }]);
          setShowFeedbackStars(true);
        }, 1500);
      }
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having a moment. Please try again! 🌙"
      }]);
    },
  });

  // Admin stats (only when admin mode)
  const { data: adminStats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAdminMode && open,
  });
  // Reddit Ads report (only when admin mode)
  const [redditDateRange] = useState(() => {
    const end = new Date().toISOString().split("T")[0]!;
    const start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]!;
    return { startDate: start, endDate: end };
  });
  const { data: redditReport } = trpc.reddit.report.useQuery(redditDateRange, {
    enabled: isAdminMode && open,
  });
  const { data: redditCampaigns } = trpc.reddit.campaigns.useQuery(undefined, {
    enabled: isAdminMode && open,
  });
  const { data: campaignPerformance } = trpc.reddit.campaignPerformance.useQuery(redditDateRange, {
    enabled: isAdminMode && open,
  });

  // ── Get welcome message ────────────────────────────────────────────────────
  const getWelcome = useCallback((triggerType: "manual" | "proactive" | "exit_intent"): string => {
    if (isAdminMode) {
      return `🌙 Luna Admin Mode — Hi ${user?.name ?? "Admin"}! I have access to your stats. Ask me: "How many sales today?" or "What's the conversion rate?" or "Show me insights."`;
    }
    if (isAffiliateMode) {
      return `💰 Hey! I'm Luna — your Affiliate Guide 🌙 Ask me anything about the program: commissions, conversion rates, best promo strategies, or how to maximize your earnings with Deep Sleep Reset!`;
    }
    // Sales mode — use persona
    if (triggerType === "exit_intent") {
      return lang === "cs" ? persona.exitCs : persona.exitEn;
    }
    if (triggerType === "proactive") {
      return lang === "cs" ? persona.proactiveCs : persona.proactiveEn;
    }
    return lang === "cs" ? persona.welcomeCs : persona.welcomeEn;
  }, [isAdminMode, isAffiliateMode, lang, persona, user?.name]);

  // ── Open chat ──────────────────────────────────────────────────────────────
  const openChat = useCallback((triggerType: "manual" | "proactive" | "exit_intent" = "manual") => {
    setOpen(true);
    setShowProactiveBubble(false);
    if (!hasOpened) {
      setHasOpened(true);
      const welcome = getWelcome(triggerType);
      setMessages([{ role: "assistant", content: welcome, isProactive: triggerType !== "manual" }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [hasOpened, getWelcome]);

  // ── 60-second proactive trigger (sales mode only) ──────────────────────────
  useEffect(() => {
    if (proactiveDismissed || hasOpened || !isSalesMode) return;
    const timer = setTimeout(() => {
      if (!open) setShowProactiveBubble(true);
    }, 60000);
    return () => clearTimeout(timer);
  }, [proactiveDismissed, hasOpened, open, isSalesMode]);

  // ── Exit intent trigger (sales mode only) ─────────────────────────────────
  useEffect(() => {
    if (hasOpened || proactiveDismissed || !isSalesMode) return;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !open) openChat("exit_intent");
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasOpened, proactiveDismissed, open, openChat, isSalesMode]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const newHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(newHistory);
    setInput("");
    setShowFeedbackStars(false);

    // Determine mode and build admin data payload
    const mode = isAdminMode ? "admin" : isAffiliateMode ? "affiliate" : "sales";
    const adminDataPayload = isAdminMode ? {
      revenue: adminStats?.revenue ?? 0,
      orders: adminStats?.orderCount ?? 0,
      leads: adminStats?.leadCount ?? 0,
      quizStarts: adminStats?.quizCount ?? 0,
      avgRating: adminStats?.avgRating ?? 0,
      feedbacks: adminStats?.feedbackCount ?? 0,
      behaviorEvents: adminStats?.behaviorCount ?? 0,
      redditImpressions: redditReport?.totalImpressions ?? 0,
      redditClicks: redditReport?.totalClicks ?? 0,
      redditCtr: redditReport?.avgCtr ?? 0,
      redditSpend: redditReport?.totalSpend ?? 0,
      redditCpc: redditReport?.avgCpc ?? 0,
      campaigns: (campaignPerformance ?? redditCampaigns ?? []).slice(0, 8).map((c: { name: string; status: string; impressions?: number; clicks?: number; ctr?: number; spend?: number; cpc?: number; score?: number; rank?: string }) => ({
        name: c.name,
        status: c.status,
        impressions: (c as { impressions?: number }).impressions ?? 0,
        clicks: (c as { clicks?: number }).clicks ?? 0,
        ctr: (c as { ctr?: number }).ctr ?? 0,
        spend: (c as { spend?: number }).spend ?? 0,
        cpc: (c as { cpc?: number }).cpc ?? 0,
        score: (c as { score?: number }).score ?? 0,
        rank: (c as { rank?: string }).rank ?? 'mid',
      })),
    } : undefined;
    chatMutation.mutate({
      message: text,
      lang,
      mode,
      adminData: adminDataPayload,
      history: messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
    });
  }, [input, chatMutation, messages, lang, isAdminMode, isAffiliateMode, adminStats, redditReport, redditCampaigns, campaignPerformance]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedbackStar = (rating: number) => {
    setFeedbackRating(rating);
    setShowFeedbackStars(false);
    const responses: Record<string, string> = {
      luna: rating >= 4
        ? "I hear you — that sounds really exhausting 💙 The good news is that what you're experiencing is exactly what Deep Sleep Reset was designed for. 12,847 people with severe sleep issues have used it. It's $1 and most see results by Night 3. You deserve this."
        : rating === 3
        ? "Thank you for sharing 🌙 Even moderate sleep issues compound over time. The Deep Sleep Reset protocol uses CBT-I — the gold standard. Just $1 and it works for most sleep types."
        : "That's great to hear! 🌙 Even if your sleep is mostly okay, the Deep Sleep Reset can help you optimize it further. Many users report the best sleep of their lives after Night 7. Just $1.",
      petra: rating >= 4
        ? "A severity rating of 4-5 indicates clinically significant insomnia 🔬 Research shows CBT-I has an 80% success rate for exactly this profile. Deep Sleep Reset implements the full CBT-I protocol for $1. The evidence strongly supports trying it."
        : rating === 3
        ? "Moderate sleep disruption (3/5) often progresses without intervention 🔬 CBT-I addresses the root cause — not just symptoms. Deep Sleep Reset is $1 and based on the same protocols used in clinical trials."
        : "Good baseline 🔬 However, sleep quality optimization has measurable benefits even at mild levels. The chronotype-based protocol in Deep Sleep Reset can improve your sleep architecture. $1 investment, significant returns.",
      lucie: rating >= 4
        ? "4-5 out of 5? That's serious. Here's the fix: Deep Sleep Reset. $1. CBT-I protocol. 7 nights. 80% success rate. Stop suffering. Get it now: deepsleepreset.gumroad.com/l/fdtifc ⚡"
        : rating === 3
        ? "3/5 means it's affecting your life. Don't wait for it to get worse. Deep Sleep Reset: $1, 7 nights, CBT-I method. Most people see results by Night 3. Do it. ⚡"
        : "Good. But 'okay' sleep isn't optimal sleep. Deep Sleep Reset will show you what truly rested feels like. $1. Worth it. ⚡",
    };
    const response = responses[personaId] ?? responses.luna!;
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 500);
  };

  // ── Display config ─────────────────────────────────────────────────────────
  const displayName = isAdminMode ? "Luna" : isAffiliateMode ? "Luna" : persona.name;
  const displayEmoji = isAdminMode ? "✨" : isAffiliateMode ? "💰" : persona.emoji;
  const displayTagline = isAdminMode
    ? `Stats: $${adminStats?.revenue?.toFixed(0) ?? "—"} rev · ${adminStats?.orderCount ?? "—"} orders`
    : isAffiliateMode ? "Affiliate Guide · Online"
    : persona.tagline;
  const displayColor = isAdminMode ? "oklch(0.55 0.18 65)" : isAffiliateMode ? "oklch(0.55 0.18 65)" : persona.color;
  const buttonLabel = isAdminMode ? "Luna Admin" : isAffiliateMode ? "Luna Affiliate" : persona.buttonLabel;
  const placeholder = isAdminMode
    ? "Ask about stats, insights, campaigns..."
    : isAffiliateMode
    ? "Ask about commissions, conversions..."
    : lang === "cs" ? "Zeptej se na spánkové tipy..." : "Ask about sleep tips, insomnia...";

  const proactiveMsg = lang === "cs" ? persona.proactiveCs : persona.proactiveEn;

  const quickQuestions = isAdminMode
    ? ["How many sales today?", "Compare campaigns", "Which campaign is best?", "What's the conversion rate?", "Show AI insights"]
    : isAffiliateMode
    ? ["How much can I earn?", "What converts best?", "How to promote?"]
    : lang === "cs"
    ? ["Funguje to opravdu?", "Co je uvnitř?", "Jak rychle uvidím výsledky?"]
    : ["Does this really work?", "What's included?", "How fast will I see results?"];

  return (
    <>
      {/* Proactive bubble (sales mode only) */}
      {showProactiveBubble && !open && isSalesMode && (
        <div
          className="fixed bottom-40 right-5 z-50 max-w-[260px] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4"
          style={{
            background: "oklch(0.10 0.03 255)",
            border: `1px solid ${displayColor} / 0.5)`.replace("/ 0.5)", "/ 0.5)"),
            borderColor: `color-mix(in oklch, ${displayColor} 50%, transparent)`,
            boxShadow: `0 8px 32px color-mix(in oklch, ${displayColor} 30%, transparent)`,
          }}
        >
          <button
            onClick={() => { setShowProactiveBubble(false); setProactiveDismissed(true); }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100"
            style={{ background: "oklch(0.20 0.04 265)" }}
          >
            <X className="w-3 h-3" style={{ color: "oklch(0.70 0.04 265)" }} />
          </button>
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))` }}>
              {displayEmoji}
            </div>
            <p className="text-xs leading-relaxed pr-4" style={{ color: "oklch(0.82 0.04 265)" }}>
              {proactiveMsg}
            </p>
          </div>
          <button
            onClick={() => openChat("proactive")}
            className="w-full py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))`, color: "white" }}
          >
            {lang === "cs" ? `Chci pomoc ${displayEmoji}` : `Get help ${displayEmoji}`}
          </button>
        </div>
      )}

      {/* Floating chat button */}
      <button
        onClick={() => open ? setOpen(false) : openChat("manual")}
        className="fixed bottom-24 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-2xl transition-all hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))`,
          boxShadow: `0 4px 24px color-mix(in oklch, ${displayColor} 50%, transparent)`,
        }}
        aria-label="Open chat"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            {isAdminMode ? (
              <Sparkles className="w-5 h-5 text-white" />
            ) : isAffiliateMode ? (
              <span className="text-white text-base">💰</span>
            ) : personaId === "petra" ? (
              <Brain className="w-5 h-5 text-white" />
            ) : personaId === "lucie" ? (
              <Zap className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
            <span className="text-white text-sm font-semibold hidden sm:inline">{buttonLabel}</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-40 right-5 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: "min(380px, calc(100vw - 2.5rem))",
            height: "min(520px, calc(100vh - 12rem))",
            background: "oklch(0.08 0.025 255)",
            border: "1px solid oklch(0.22 0.04 265)",
            boxShadow: "0 16px 64px oklch(0 0 0 / 0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{
              background: "linear-gradient(135deg, oklch(0.12 0.04 265), oklch(0.10 0.03 255))",
              borderBottom: "1px solid oklch(0.22 0.04 265)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
              style={{ background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))` }}
            >
              {displayEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "oklch(0.92 0.04 265)" }}>
                {displayName}
                {isAdminMode && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.55 0.18 65 / 0.2)", color: "oklch(0.78 0.18 65)" }}>ADMIN</span>
                )}
                {isAffiliateMode && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.55 0.18 65 / 0.15)", color: "oklch(0.78 0.18 65)" }}>AFFILIATE</span>
                )}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>{displayTagline}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2 mt-0.5"
                    style={{ background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))` }}
                  >
                    {displayEmoji}
                  </div>
                )}
                <div
                  className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))`, color: "white", borderBottomRightRadius: "4px" }
                      : { background: msg.isProactive ? "oklch(0.12 0.05 65)" : "oklch(0.14 0.03 265)", color: "oklch(0.85 0.04 265)", border: `1px solid ${msg.isProactive ? "oklch(0.55 0.18 65 / 0.3)" : "oklch(0.22 0.04 265)"}`, borderBottomLeftRadius: "4px" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Feedback stars */}
            {showFeedbackStars && (
              <div className="flex justify-start">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2 mt-0.5"
                  style={{ background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))` }}
                >
                  {displayEmoji}
                </div>
                <div className="flex gap-1.5 items-center p-3 rounded-2xl" style={{ background: "oklch(0.14 0.03 265)", border: "1px solid oklch(0.22 0.04 265)" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => handleFeedbackStar(s)} className="transition-all hover:scale-125">
                      <Star className="w-6 h-6" fill={s <= feedbackRating ? "oklch(0.78 0.18 65)" : "none"} style={{ color: "oklch(0.78 0.18 65)" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2" style={{ background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))` }}>
                  {displayEmoji}
                </div>
                <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: "oklch(0.14 0.03 265)", border: "1px solid oklch(0.22 0.04 265)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: displayColor, animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: displayColor, animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: displayColor, animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {quickQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      setInput(q);
                      // Trigger send after state update
                      const syntheticSend = () => {
                        const newHistory = [...messages, { role: "user" as const, content: q }];
                        setMessages(newHistory);
                        setInput("");
                        const qMode = isAdminMode ? "admin" : isAffiliateMode ? "affiliate" : "sales";
                        chatMutation.mutate({
                          message: q,
                          lang,
                          mode: qMode,
                          adminData: isAdminMode ? {
                            revenue: adminStats?.revenue ?? 0,
                            orders: adminStats?.orderCount ?? 0,
                            leads: adminStats?.leadCount ?? 0,
                            quizStarts: adminStats?.quizCount ?? 0,
                            avgRating: adminStats?.avgRating ?? 0,
                            feedbacks: adminStats?.feedbackCount ?? 0,
                            behaviorEvents: adminStats?.behaviorCount ?? 0,
                            redditImpressions: redditReport?.totalImpressions ?? 0,
                            redditClicks: redditReport?.totalClicks ?? 0,
                            redditCtr: redditReport?.avgCtr ?? 0,
                            redditSpend: redditReport?.totalSpend ?? 0,
                            redditCpc: redditReport?.avgCpc ?? 0,
                            campaigns: (campaignPerformance ?? redditCampaigns ?? []).slice(0, 8).map((c: { name: string; status: string; impressions?: number; clicks?: number; ctr?: number; spend?: number; cpc?: number; score?: number; rank?: string }) => ({
                              name: c.name, status: c.status,
                              impressions: (c as { impressions?: number }).impressions ?? 0,
                              clicks: (c as { clicks?: number }).clicks ?? 0,
                              ctr: (c as { ctr?: number }).ctr ?? 0,
                              spend: (c as { spend?: number }).spend ?? 0,
                              cpc: (c as { cpc?: number }).cpc ?? 0,
                              score: (c as { score?: number }).score ?? 0,
                              rank: (c as { rank?: string }).rank ?? 'mid',
                            })),
                          } : undefined,
                          history: [],
                        });
                      };
                      syntheticSend();
                    }, 50);
                  }}
                  className="text-xs rounded-full px-3 py-1.5 transition-all hover:opacity-80"
                  style={{ background: "oklch(0.14 0.03 265)", color: "oklch(0.65 0.12 65)", border: "1px solid oklch(0.55 0.18 65 / 0.3)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 shrink-0" style={{ borderTop: "1px solid oklch(0.22 0.04 265)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={500}
              className="flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
              style={{ background: "oklch(0.12 0.025 255)", border: "1px solid oklch(0.22 0.04 265)", color: "oklch(0.88 0.04 265)" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${displayColor}, oklch(0.45 0.16 55))` }}
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
