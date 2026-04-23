import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { MessageCircle, X, Send, Moon, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGES: Record<string, string> = {
  en: "Hi! I'm Luna 🌙 your AI sleep coach. Ask me anything about sleep, insomnia, or the Deep Sleep Reset guide!",
  cs: "Ahoj! Jsem Luna 🌙 tvůj AI spánkový kouč. Zeptej se mě na cokoliv o spánku, nespavosti nebo průvodci Deep Sleep Reset!",
  de: "Hallo! Ich bin Luna 🌙 dein KI-Schlafcoach. Frag mich alles über Schlaf, Schlaflosigkeit oder den Deep Sleep Reset Guide!",
  es: "¡Hola! Soy Luna 🌙 tu coach de sueño con IA. ¡Pregúntame cualquier cosa sobre el sueño, el insomnio o la guía Deep Sleep Reset!",
  fr: "Bonjour! Je suis Luna 🌙 votre coach de sommeil IA. Posez-moi des questions sur le sommeil, l'insomnie ou le guide Deep Sleep Reset!",
  pt: "Olá! Sou Luna 🌙 sua coach de sono com IA. Pergunte-me qualquer coisa sobre sono, insônia ou o guia Deep Sleep Reset!",
  hi: "नमस्ते! मैं Luna 🌙 हूँ, आपकी AI नींद कोच। मुझसे नींद, अनिद्रा या Deep Sleep Reset गाइड के बारे में कुछ भी पूछें!",
  id: "Halo! Saya Luna 🌙 pelatih tidur AI Anda. Tanyakan apa saja tentang tidur, insomnia, atau panduan Deep Sleep Reset!",
  tl: "Kumusta! Ako si Luna 🌙 ang iyong AI sleep coach. Tanungin mo ako tungkol sa tulog, insomnia, o ang Deep Sleep Reset guide!",
  bn: "হ্যালো! আমি Luna 🌙 আপনার AI ঘুমের কোচ। ঘুম, অনিদ্রা বা Deep Sleep Reset গাইড সম্পর্কে যেকোনো কিছু জিজ্ঞেস করুন!",
  ur: "ہیلو! میں Luna 🌙 ہوں، آپکی AI نیند کوچ۔ نیند، بے خوابی یا Deep Sleep Reset گائیڈ کے بارے میں کچھ بھی پوچھیں!",
  vi: "Xin chào! Tôi là Luna 🌙 huấn luyện viên giấc ngủ AI của bạn. Hỏi tôi bất cứ điều gì về giấc ngủ, mất ngủ hoặc hướng dẫn Deep Sleep Reset!",
  yo: "Ẹ káàárọ̀! Èmi ni Luna 🌙 olùkọ́ oorun AI rẹ. Béèrè lọ́wọ́ mi nípa oorun, àìsùn, tàbí ìtọ́sọ́nà Deep Sleep Reset!",
  sw: "Habari! Mimi ni Luna 🌙 kocha wako wa usingizi wa AI. Niulize chochote kuhusu usingizi, kukosa usingizi, au mwongozo wa Deep Sleep Reset!",
};

const PLACEHOLDER_MESSAGES: Record<string, string> = {
  en: "Ask about sleep tips, insomnia causes...",
  cs: "Zeptej se na spánkové tipy...",
  de: "Frag nach Schlaftipps...",
  es: "Pregunta sobre consejos de sueño...",
  fr: "Posez des questions sur le sommeil...",
  pt: "Pergunte sobre dicas de sono...",
  hi: "नींद के टिप्स के बारे में पूछें...",
  id: "Tanya tentang tips tidur...",
  tl: "Magtanong tungkol sa mga tip sa tulog...",
  bn: "ঘুমের টিপস সম্পর্কে জিজ্ঞেস করুন...",
  ur: "نیند کے ٹپس کے بارے میں پوچھیں...",
  vi: "Hỏi về mẹo ngủ ngon...",
  yo: "Béèrè nípa àwọn ìmọ̀ràn oorun...",
  sw: "Uliza kuhusu vidokezo vya usingizi...",
};

export default function SleepChatBot() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.chat.message.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having a moment. Please try again! 🌙"
      }]);
    },
  });

  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      const welcome = WELCOME_MESSAGES[lang] ?? WELCOME_MESSAGES.en!;
      setMessages([{ role: "assistant", content: welcome }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, hasOpened, lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const newHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(newHistory);
    setInput("");
    chatMutation.mutate({
      message: text,
      lang,
      history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholder = PLACEHOLDER_MESSAGES[lang] ?? PLACEHOLDER_MESSAGES.en!;

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-2xl transition-all hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))",
          boxShadow: "0 4px 24px oklch(0.55 0.18 65 / 0.5)",
        }}
        aria-label="Open sleep chat"
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <Moon className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-semibold hidden sm:inline">Ask Luna</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-40 right-5 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: "min(360px, calc(100vw - 2.5rem))",
            height: "min(480px, calc(100vh - 12rem))",
            background: "oklch(0.08 0.025 255)",
            border: "1px solid oklch(0.22 0.04 265)",
            boxShadow: "0 16px 64px oklch(0 0 0 / 0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, oklch(0.12 0.04 265), oklch(0.10 0.03 255))", borderBottom: "1px solid oklch(0.22 0.04 265)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
              style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))" }}
            >
              🌙
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "oklch(0.92 0.04 265)" }}>Luna</p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 265)" }}>AI Sleep Coach · Online</p>
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
                    style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))" }}
                  >
                    🌙
                  </div>
                )}
                <div
                  className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))", color: "white", borderBottomRightRadius: "4px" }
                      : { background: "oklch(0.14 0.03 265)", color: "oklch(0.85 0.04 265)", border: "1px solid oklch(0.22 0.04 265)", borderBottomLeftRadius: "4px" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mr-2"
                  style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))" }}
                >
                  🌙
                </div>
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                  style={{ background: "oklch(0.14 0.03 265)", border: "1px solid oklch(0.22 0.04 265)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "oklch(0.55 0.18 65)", animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "oklch(0.55 0.18 65)", animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "oklch(0.55 0.18 65)", animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {["Does this really work?", "What's included?", "How fast will I see results?"].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => handleSend(), 0); setInput(q); }}
                  className="text-xs rounded-full px-3 py-1.5 transition-all hover:opacity-80"
                  style={{ background: "oklch(0.14 0.03 265)", color: "oklch(0.65 0.12 65)", border: "1px solid oklch(0.55 0.18 65 / 0.3)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 shrink-0"
            style={{ borderTop: "1px solid oklch(0.22 0.04 265)" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={500}
              className="flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
              style={{
                background: "oklch(0.12 0.025 255)",
                border: "1px solid oklch(0.22 0.04 265)",
                color: "oklch(0.88 0.04 265)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 65), oklch(0.45 0.16 55))" }}
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
