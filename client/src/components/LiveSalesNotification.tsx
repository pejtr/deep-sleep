import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface Notification {
  name: string;
  location: string;
  price: string;
  timeAgo: string;
}

// Realistic fallback notifications — global locations
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
    const initialTimer = setTimeout(() => {
      showNext();
    }, 7000);
    return () => clearTimeout(initialTimer);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!visible && !exiting) {
      const delay = 18000 + Math.random() * 12000;
      const timer = setTimeout(showNext, delay);
      return () => clearTimeout(timer);
    }
  }, [visible, exiting, enabled, showNext]);

  if (!visible || !current) return null;

  return (
    <div
      className={`fixed left-4 z-45 max-w-[calc(100vw-80px)] md:max-w-[300px] bottom-[148px] md:bottom-6 md:left-6 ${
        exiting ? "animate-notification-out" : "animate-notification-in"
      }`}
    >
      <div className="glass-card rounded-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-2">
          {/* Green pulse dot */}
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          {/* Simple one-line notification */}
          <p className="text-xs leading-snug" style={{ color: "oklch(0.80 0.04 265)" }}>
            <span className="font-semibold" style={{ color: "oklch(0.95 0.01 265)" }}>{current.name}</span>
            {" "}from {current.location} bought Sleep Reset for{" "}
            <span className="font-bold" style={{ color: "oklch(0.82 0.16 65)" }}>{current.price}</span>
            {" "}<span style={{ color: "oklch(0.45 0.04 265)" }}>· {current.timeAgo}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
