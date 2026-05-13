import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface Notification {
  name: string;
  location: string;
  chronotype: string;
  timeAgo: string;
  flag: string;
}

// 12+ global locations as required
const NOTIFICATIONS: Notification[] = [
  { name: "Sarah M.", location: "New York, USA", chronotype: "Wolf", timeAgo: "2 min ago", flag: "🇺🇸" },
  { name: "James K.", location: "London, UK", chronotype: "Bear", timeAgo: "4 min ago", flag: "🇬🇧" },
  { name: "Luna D.", location: "Paris, France", chronotype: "Lion", timeAgo: "1 min ago", flag: "🇫🇷" },
  { name: "Marco R.", location: "Milan, Italy", chronotype: "Dolphin", timeAgo: "6 min ago", flag: "🇮🇹" },
  { name: "Yuki T.", location: "Tokyo, Japan", chronotype: "Lion", timeAgo: "3 min ago", flag: "🇯🇵" },
  { name: "Anna S.", location: "Stockholm, Sweden", chronotype: "Wolf", timeAgo: "5 min ago", flag: "🇸🇪" },
  { name: "Carlos M.", location: "Madrid, Spain", chronotype: "Bear", timeAgo: "8 min ago", flag: "🇪🇸" },
  { name: "Emma W.", location: "Sydney, Australia", chronotype: "Dolphin", timeAgo: "2 min ago", flag: "🇦🇺" },
  { name: "David L.", location: "Toronto, Canada", chronotype: "Lion", timeAgo: "7 min ago", flag: "🇨🇦" },
  { name: "Priya N.", location: "Mumbai, India", chronotype: "Wolf", timeAgo: "4 min ago", flag: "🇮🇳" },
  { name: "Felix B.", location: "Berlin, Germany", chronotype: "Bear", timeAgo: "9 min ago", flag: "🇩🇪" },
  { name: "Sofia P.", location: "São Paulo, Brazil", chronotype: "Dolphin", timeAgo: "3 min ago", flag: "🇧🇷" },
  { name: "Lena V.", location: "Amsterdam, Netherlands", chronotype: "Lion", timeAgo: "6 min ago", flag: "🇳🇱" },
  { name: "Hiroshi K.", location: "Osaka, Japan", chronotype: "Bear", timeAgo: "1 min ago", flag: "🇯🇵" },
  { name: "Mia C.", location: "Singapore", chronotype: "Wolf", timeAgo: "5 min ago", flag: "🇸🇬" },
];

const CHRONOTYPE_ICONS: Record<string, string> = {
  Lion: "🦁",
  Bear: "🐻",
  Wolf: "🐺",
  Dolphin: "🐬",
};

interface Props {
  enabled?: boolean;
}

export default function LiveSalesNotification({ enabled = true }: Props) {
  const [current, setCurrent] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [index, setIndex] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch recent orders from DB every 30 seconds
  const { data: recentOrders } = trpc.orders.getRecent.useQuery(
    { limit: 15 },
    { refetchInterval: 30000, enabled }
  );

  useEffect(() => {
    if (recentOrders && recentOrders.length > 0) {
      setOrders(recentOrders);
    }
  }, [recentOrders]);


  const showNext = useCallback(() => {
    // Mix real orders with fallback notifications
    const combined = [
      ...orders.map((o: any) => ({
        name: o.email?.split('@')[0] || 'Customer',
        location: 'Worldwide',
        chronotype: o.chronotype || 'Lion',
        timeAgo: 'just now',
        flag: '🌍',
      })),
      ...NOTIFICATIONS,
    ];
    
    const shuffled = [...combined].sort(() => Math.random() - 0.5);
    const next = shuffled[index % shuffled.length];
    setIndex(i => i + 1);
    setCurrent(next ?? null);
    setVisible(true);
    setExiting(false);

    // Hide after 4 seconds
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 400);
    }, 4000);
  }, [index, orders]);

  useEffect(() => {
    if (!enabled) return;

    // First notification after 7 seconds
    const initialTimer = setTimeout(() => {
      showNext();
    }, 7000);

    return () => clearTimeout(initialTimer);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!visible && !exiting) {
      // Show next notification every 18-30 seconds
      const delay = 18000 + Math.random() * 12000;
      const timer = setTimeout(showNext, delay);
      return () => clearTimeout(timer);
    }
  }, [visible, exiting, enabled, showNext]);

  if (!visible || !current) return null;

  return (
    <div
      className={`fixed bottom-[68px] left-4 z-50 max-w-[280px] ${
        exiting ? "animate-notification-out" : "animate-notification-in"
      }`}
    >
      <div className="glass-card rounded-xl p-3 shadow-2xl">
        <div className="flex items-start gap-2.5">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: "oklch(0.78 0.18 65 / 0.15)", border: "1px solid oklch(0.78 0.18 65 / 0.3)" }}>
            {CHRONOTYPE_ICONS[current.chronotype]}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-xs font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>
                {current.name}
              </span>
              <span className="text-xs">{current.flag}</span>
            </div>
            <p className="text-xs leading-tight" style={{ color: "oklch(0.65 0.04 265)" }}>
              just got the <span style={{ color: "oklch(0.82 0.16 65)" }} className="font-semibold">
                {current.chronotype} Protocol
              </span>
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
                {current.location}
              </span>
              <span className="text-xs" style={{ color: "oklch(0.50 0.04 265)" }}>
                {current.timeAgo}
              </span>
            </div>
          </div>
        </div>
        {/* Green dot indicator */}
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
  );
}
