import { useEffect, useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";

interface Notification {
  name: string;
  location: string;
  price: string;
  timeAgo: string;
}

const NOTIFICATIONS: Notification[] = [
  { name: "Sarah M.", location: "New York, US", price: "$4", timeAgo: "just now" },
  { name: "James K.", location: "London, UK", price: "$4", timeAgo: "2 min ago" },
  { name: "Luna D.", location: "Paris, FR", price: "$4", timeAgo: "1 min ago" },
  { name: "Marco R.", location: "Milan, IT", price: "$17", timeAgo: "4 min ago" },
  { name: "Yuki T.", location: "Tokyo, JP", price: "$4", timeAgo: "3 min ago" },
  { name: "Anna S.", location: "Stockholm, SE", price: "$27", timeAgo: "5 min ago" },
  { name: "Carlos M.", location: "Madrid, ES", price: "$4", timeAgo: "just now" },
  { name: "Emma W.", location: "Sydney, AU", price: "$4", timeAgo: "2 min ago" },
  { name: "David L.", location: "Toronto, CA", price: "$4", timeAgo: "just now" },
  { name: "Priya N.", location: "Mumbai, IN", price: "$1", timeAgo: "4 min ago" },
  { name: "Felix B.", location: "Berlin, DE", price: "$4", timeAgo: "6 min ago" },
  { name: "Sofia P.", location: "São Paulo, BR", price: "$4", timeAgo: "3 min ago" },
  { name: "Lena V.", location: "Amsterdam, NL", price: "$17", timeAgo: "5 min ago" },
  { name: "Hiroshi K.", location: "Osaka, JP", price: "$4", timeAgo: "1 min ago" },
  { name: "Mia C.", location: "Singapore, SG", price: "$4", timeAgo: "just now" },
];

// How many px to swipe before dismissing
const SWIPE_THRESHOLD = 80;

interface Props {
  enabled?: boolean;
}

export default function LiveSalesNotification({ enabled = true }: Props) {
  const [current, setCurrent] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [index, setIndex] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);

  // Swipe state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDismissed, setSwipeDismissed] = useState(false);

  const { data: recentOrders } = trpc.orders.getRecent.useQuery(
    { limit: 15 },
    { refetchInterval: 30000, enabled }
  );

  useEffect(() => {
    if (recentOrders && recentOrders.length > 0) {
      setOrders(recentOrders);
    }
  }, [recentOrders]);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setSwipeX(0);
      setIsSwiping(false);
    }, 300);
  }, []);

  const showNext = useCallback(() => {
    const combined = [
      ...orders.map((o: any) => ({
        name: o.email?.split("@")[0] || "Customer",
        location: "Worldwide",
        price: o.amount ? `$${(o.amount / 100).toFixed(0)}` : "$4",
        timeAgo: "just now",
      })),
      ...NOTIFICATIONS,
    ];

    const shuffled = [...combined].sort(() => Math.random() - 0.5);
    const next = shuffled[index % shuffled.length];
    setIndex((i) => i + 1);
    setCurrent(next ?? null);
    setVisible(true);
    setExiting(false);
    setSwipeX(0);
    setIsSwiping(false);
    setSwipeDismissed(false);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      dismiss();
    }, 4000);
  }, [index, orders, dismiss]);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(showNext, 7000);
    return () => clearTimeout(t);
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled) return;
    if (!visible && !exiting && !swipeDismissed) {
      const delay = 18000 + Math.random() * 12000;
      const t = setTimeout(showNext, delay);
      return () => clearTimeout(t);
    }
    // After swipe-dismiss, resume normal cycle after a longer pause
    if (!visible && !exiting && swipeDismissed) {
      const t = setTimeout(() => {
        setSwipeDismissed(false);
      }, 30000);
      return () => clearTimeout(t);
    }
  }, [visible, exiting, enabled, swipeDismissed, showNext]);

  // ── Touch handlers ──────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Only track horizontal swipe (ignore vertical scroll)
    if (!isSwiping && Math.abs(dy) > Math.abs(dx)) return;

    setIsSwiping(true);
    setSwipeX(dx);
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(swipeX) >= SWIPE_THRESHOLD) {
      // Snap fully off screen
      setSwipeX(swipeX > 0 ? 400 : -400);
      setSwipeDismissed(true);
      setTimeout(() => {
        setVisible(false);
        setSwipeX(0);
        setIsSwiping(false);
      }, 250);
    } else {
      // Snap back
      setSwipeX(0);
      setIsSwiping(false);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [swipeX]);

  if (!visible || !current) return null;

  const opacity = isSwiping ? Math.max(0, 1 - Math.abs(swipeX) / 200) : 1;

  return (
    <div
      className={`fixed left-4 z-45 max-w-[calc(100vw-80px)] md:max-w-[300px] bottom-[148px] md:bottom-6 md:left-6 ${
        !isSwiping && exiting ? "animate-notification-out" : ""
      } ${!isSwiping && !exiting ? "animate-notification-in" : ""}`}
      style={{
        transform: isSwiping ? `translateX(${swipeX}px) rotate(${swipeX * 0.03}deg)` : undefined,
        opacity,
        transition: isSwiping ? "none" : "transform 0.25s ease, opacity 0.25s ease",
        touchAction: "pan-y",
        cursor: "grab",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="glass-card rounded-xl px-4 py-3 shadow-2xl select-none">
        <div className="flex items-center gap-2">
          {/* Green pulse dot */}
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <p className="text-xs leading-snug flex-1" style={{ color: "oklch(0.80 0.04 265)" }}>
            <span className="font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>{current.name}</span>
            {" "}from {current.location} bought Sleep Reset for{" "}
            <span className="font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>{current.price}</span>
            {" "}<span style={{ color: "oklch(0.45 0.04 265)" }}>· {current.timeAgo}</span>
          </p>
          {/* Swipe hint — subtle arrow on mobile */}
          <span className="text-xs md:hidden flex-shrink-0" style={{ color: "oklch(0.35 0.04 265)" }}>
            ›
          </span>
        </div>
      </div>

      {/* Swipe hint text — appears when dragging */}
      {isSwiping && Math.abs(swipeX) > 30 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold" style={{ color: "oklch(0.55 0.04 265)" }}>
            {swipeX > 0 ? "Dismiss →" : "← Dismiss"}
          </span>
        </div>
      )}
    </div>
  );
}
