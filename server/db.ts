import { drizzle } from "drizzle-orm/mysql2";
import { and, gte, lte, eq } from "drizzle-orm";
import {
  InsertUser,
  users,
  quizResults,
  InsertQuizResult,
  orders,
  InsertOrder,
  emailLeads,
  InsertEmailLead,
  abImpressions,
  InsertAbImpression,
  behaviorEvents,
  InsertBehaviorEvent,
  feedbacks,
  InsertFeedback,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Quiz Results ─────────────────────────────────────────────────────────────
export async function saveQuizResult(data: InsertQuizResult) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(quizResults).values(data);
  return result;
}

export async function getQuizResultBySession(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quizResults).where(eq(quizResults.sessionId, sessionId)).limit(1);
  return result[0] ?? null;
}

// ── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) return null;
  // Drizzle MySQL insert returns [ResultSetHeader, FieldPacket[]] — res[0].insertId is the new row ID
  const result = await db.insert(orders).values(data);
  const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId;
  return insertId ?? null;
}

export async function getOrdersBySession(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.sessionId, sessionId));
}

export async function getOrderStats() {
  const db = await getDb();
  if (!db) return { total: 0, revenue: 0 };
  const all = await db.select().from(orders).where(eq(orders.status, "completed"));
  const revenue = all.reduce((sum, o) => sum + parseFloat(String(o.amount)), 0);
  return { total: all.length, revenue };
}

// ── Email Leads ──────────────────────────────────────────────────────────────
export async function captureEmailLead(data: InsertEmailLead) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(emailLeads).values(data);
}

export async function getLeadCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(emailLeads);
  return result.length;
}

// ── A/B Impressions ──────────────────────────────────────────────────────────
export async function trackAbImpression(data: InsertAbImpression) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(abImpressions).values(data);
}

export async function markAbConverted(sessionId: string, testName: string) {
  const db = await getDb();
  if (!db) return null;
  const { eq: eqFn, and } = await import("drizzle-orm");
  return db.update(abImpressions)
    .set({ converted: true })
    .where(and(eqFn(abImpressions.sessionId, sessionId), eqFn(abImpressions.testName, testName)));
}

// ── Behavior Events ──────────────────────────────────────────────────────────
export async function trackBehaviorEvent(data: InsertBehaviorEvent) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(behaviorEvents).values(data);
}

// ── Feedback ─────────────────────────────────────────────────────────────────
export async function saveFeedback(data: InsertFeedback) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(feedbacks).values(data);
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { quizCount: 0, orderCount: 0, completedOrderCount: 0, leadCount: 0, revenue: 0, feedbackCount: 0, avgRating: 0, behaviorCount: 0, recentOrders: [], recentFeedbacks: [], quizStarts: 0, checkoutClicks: 0, uniqueBuyers: 0, duplicateAttempts: 0, referrerBreakdown: [] as { source: string; visits: number }[], orderTimeline: [] as { hour: string; count: number }[], deviceBreakdown: [] as { device: string; count: number }[], avgTimeToCheckout: 0 };
  // Count ALL orders (not just completed) to show real funnel data
  const [quiz, allOrders, completedOrders, leads] = await Promise.all([
    db.select().from(quizResults).catch(() => []),
    db.select().from(orders).catch(() => []),
    db.select().from(orders).where(eq(orders.status, "completed")).catch(() => []),
    db.select().from(emailLeads).catch(() => []),
  ]);
  // Feedbacks and behavior may not exist yet — graceful fallback
  const [fbs, behaviors] = await Promise.all([
    db.select().from(feedbacks).catch(() => []),
    db.select().from(behaviorEvents).catch(() => []),
  ]);
  // Quiz starts = page_view on quiz page tracked via behavior events
  const quizStarts = behaviors.filter((b: { event: string; page?: string | null }) => b.event === 'page_view' && b.page === 'quiz').length;
  const checkoutClicks = behaviors.filter((b: { event: string }) => b.event === 'checkout_click').length;
  // Revenue: convert all amounts to USD using approximate exchange rates
  // Orders are stored in local currency (e.g. CZK 103.85 = $5 USD)
  const APPROX_RATES_TO_USD: Record<string, number> = {
    usd: 1, eur: 1.172, gbp: 1.349, czk: 0.0482, cad: 0.732, aud: 0.645,
    pln: 0.262, huf: 0.00281, ron: 0.236, inr: 0.012, brl: 0.201, mxn: 0.058,
    chf: 1.112, sek: 0.097, nok: 0.095, dkk: 0.157, sgd: 0.746, nzd: 0.599,
    zar: 0.054, jpy: 0.0065,
  };
  const toUsd = (amount: string | number, currency?: string | null): number => {
    const amt = parseFloat(String(amount));
    if (!currency || currency.toLowerCase() === 'usd') return amt;
    const rate = APPROX_RATES_TO_USD[currency.toLowerCase()] ?? 1;
    return amt * rate;
  };
  const completedRevenue = completedOrders.reduce((sum, o) => sum + toUsd(o.amount, o.currency), 0);
  const totalRevenue = allOrders.reduce((sum, o) => sum + toUsd(o.amount, o.currency), 0);
  const revenue = completedRevenue > 0 ? completedRevenue : totalRevenue; // fallback to all if webhook not yet active
  const avgRating = fbs.length > 0 ? fbs.reduce((sum, f) => sum + (f.rating ?? 0), 0) / fbs.length : 0;
  // Include createdAt timestamp in recentOrders for time display
  const recentOrders = allOrders.slice(-10).reverse().map(o => ({ id: o.id, amount: o.amount, product: o.productId, status: o.status, createdAt: o.createdAt, currency: o.currency ?? undefined }));
  const recentFeedbacks = fbs.slice(-5).reverse().map((f: typeof fbs[0]) => ({ id: f.id, rating: f.rating, liked: f.liked, improved: f.improved, createdAt: f.createdAt }));

  // === PURCHASE INTELLIGENCE ===
  // Unique buyers (unique session IDs)
  const uniqueBuyerSessions = new Set(allOrders.map(o => o.sessionId).filter(Boolean));
  const uniqueBuyers = uniqueBuyerSessions.size;
  const duplicateAttempts = allOrders.length - uniqueBuyers;

  // Referrer breakdown from behavior events (home page_view with referrer in value)
  const referrerMap = new Map<string, number>();
  behaviors.forEach((b: { event: string; page?: string | null; value?: string | null }) => {
    if (b.event === 'page_view' && b.page === 'home' && b.value) {
      try {
        const v = JSON.parse(b.value);
        const ref = v.referrer ? (() => { try { return new URL(v.referrer).hostname.replace('www.', ''); } catch { return 'direct'; } })() : 'direct';
        referrerMap.set(ref, (referrerMap.get(ref) ?? 0) + 1);
      } catch { referrerMap.set('direct', (referrerMap.get('direct') ?? 0) + 1); }
    }
  });
  const referrerBreakdown = Array.from(referrerMap.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([source, visits]) => ({ source, visits }));

  // Hourly order timeline (last 48h)
  const now = Date.now();
  const hourlyMap = new Map<string, number>();
  allOrders.forEach(o => {
    const ts = new Date(o.createdAt).getTime();
    if (now - ts < 48 * 60 * 60 * 1000) {
      const hour = new Date(ts).toISOString().slice(0, 13) + ':00';
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1);
    }
  });
  const orderTimeline = Array.from(hourlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([hour, count]) => ({ hour: hour.slice(11, 16), count }));

  // Device breakdown
  const deviceMap = new Map<string, number>();
  behaviors.forEach((b: { event: string; page?: string | null; value?: string | null }) => {
    if (b.event === 'page_view' && b.page === 'home' && b.value) {
      try {
        const v = JSON.parse(b.value);
        const device = v.device ?? 'unknown';
        deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1);
      } catch {}
    }
  });
  const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({ device, count }));

  // Average time from first page_view to checkout_click (in minutes)
  const sessionFirstView = new Map<string, number>();
  const sessionCheckout = new Map<string, number>();
  behaviors.forEach((b: { sessionId?: string | null; event: string; createdAt: Date | string }) => {
    if (!b.sessionId) return;
    const ts = new Date(b.createdAt).getTime();
    if (b.event === 'page_view' && (!sessionFirstView.has(b.sessionId) || ts < sessionFirstView.get(b.sessionId)!)) sessionFirstView.set(b.sessionId, ts);
    if (b.event === 'checkout_click' && (!sessionCheckout.has(b.sessionId) || ts < sessionCheckout.get(b.sessionId)!)) sessionCheckout.set(b.sessionId, ts);
  });
  let totalTimeMin = 0, timeCount = 0;
  sessionCheckout.forEach((checkoutTs, sid) => {
    const viewTs = sessionFirstView.get(sid);
    if (viewTs && checkoutTs > viewTs) { totalTimeMin += (checkoutTs - viewTs) / 60000; timeCount++; }
  });
  const avgTimeToCheckout = timeCount > 0 ? Math.round(totalTimeMin / timeCount * 10) / 10 : 0;

  return { quizCount: quiz.length, orderCount: allOrders.length, completedOrderCount: completedOrders.length, leadCount: leads.length, revenue, feedbackCount: fbs.length, avgRating: Math.round(avgRating * 10) / 10, behaviorCount: behaviors.length, recentOrders, recentFeedbacks, quizStarts, checkoutClicks, uniqueBuyers, duplicateAttempts, referrerBreakdown, orderTimeline, deviceBreakdown, avgTimeToCheckout };
}

// ── Email broadcast helpers ───────────────────────────────────────────────────
export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailLeads);
}

export async function getAllBuyerEmails() {
  const db = await getDb();
  if (!db) return [];
  const completed = await db.select().from(orders).where(eq(orders.status, "completed"));
  // Deduplicate emails
  const seen = new Set<string>();
  return completed.filter(o => {
    if (!o.email) return false;
    if (seen.has(o.email)) return false;
    seen.add(o.email);
    return true;
  }).map(o => ({ email: o.email!, productId: o.productId, chronotype: o.chronotype }));
}


/// ── Timeline Metrics ─────────────────────────────────────────────────────
export async function getHourlyMetrics(startDate: number, endDate: number) {
  const db = await getDb();
  if (!db) return [];
  
  const allOrders = await db.select().from(orders).where(
    and(gte(orders.createdAt, new Date(startDate)), lte(orders.createdAt, new Date(endDate)))
  );
  
  const allBehaviors = await db.select().from(behaviorEvents).where(
    and(gte(behaviorEvents.createdAt, new Date(startDate)), lte(behaviorEvents.createdAt, new Date(endDate)))
  );
  
  // Group by hour
  const hourMap = new Map<string, { visits: number; orders: number; revenue: number }>();
  
  // Process behavior events (visits/pageviews)
  allBehaviors.forEach(b => {
    const hour = new Date(b.createdAt).toISOString().slice(0, 13) + ':00:00Z';
    if (!hourMap.has(hour)) hourMap.set(hour, { visits: 0, orders: 0, revenue: 0 });
    const h = hourMap.get(hour)!;
    if (b.event === 'pageview') h.visits++;
  });
  
  // Process orders
  allOrders.forEach(o => {
    const hour = new Date(o.createdAt).toISOString().slice(0, 13) + ':00:00Z';
    if (!hourMap.has(hour)) hourMap.set(hour, { visits: 0, orders: 0, revenue: 0 });
    const h = hourMap.get(hour)!;
    if (o.status === 'completed') {
      h.orders++;
      const amount = parseFloat(o.amount) || 0;
      h.revenue += amount;
    }
  });
  
  return Array.from(hourMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([hour, data]) => ({ hour, ...data }));
}

export async function getDailyMetrics(startDate: number, endDate: number) {
  const db = await getDb();
  if (!db) return [];
  
  const allOrders = await db.select().from(orders).where(
    and(gte(orders.createdAt, new Date(startDate)), lte(orders.createdAt, new Date(endDate)))
  );
  
  const allBehaviors = await db.select().from(behaviorEvents).where(
    and(gte(behaviorEvents.createdAt, new Date(startDate)), lte(behaviorEvents.createdAt, new Date(endDate)))
  );
  
  // Group by day
  const dayMap = new Map<string, { visits: number; orders: number; revenue: number }>();
  
  // Process behavior events (visits/pageviews)
  allBehaviors.forEach(b => {
    const day = new Date(b.createdAt).toISOString().slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { visits: 0, orders: 0, revenue: 0 });
    const d = dayMap.get(day)!;
    if (b.event === 'pageview') d.visits++;
  });
  
  // Process orders
  allOrders.forEach(o => {
    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { visits: 0, orders: 0, revenue: 0 });
    const d = dayMap.get(day)!;
    if (o.status === 'completed') {
      d.orders++;
      const amount = parseFloat(o.amount) || 0;
      d.revenue += amount;
    }
  });
  
  return Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, data]) => ({ day, ...data }));
}
