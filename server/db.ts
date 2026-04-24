import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
  if (!db) return { quizCount: 0, orderCount: 0, completedOrderCount: 0, leadCount: 0, revenue: 0, feedbackCount: 0, avgRating: 0, behaviorCount: 0, recentOrders: [], recentFeedbacks: [], quizStarts: 0, checkoutClicks: 0 };
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
  // Revenue: count completed orders (webhook sets status=completed after Stripe payment)
  // Also show total pending revenue for visibility
  const completedRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(String(o.amount)), 0);
  const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(String(o.amount)), 0);
  const revenue = completedRevenue > 0 ? completedRevenue : totalRevenue; // fallback to all if webhook not yet active
  const avgRating = fbs.length > 0 ? fbs.reduce((sum, f) => sum + (f.rating ?? 0), 0) / fbs.length : 0;
  // Include createdAt timestamp in recentOrders for time display
  const recentOrders = allOrders.slice(-10).reverse().map(o => ({ id: o.id, amount: o.amount, product: o.productId, status: o.status, createdAt: o.createdAt, currency: o.currency ?? undefined }));
  const recentFeedbacks = fbs.slice(-5).reverse().map((f: typeof fbs[0]) => ({ id: f.id, rating: f.rating, liked: f.liked, improved: f.improved, createdAt: f.createdAt }));
  return { quizCount: quiz.length, orderCount: allOrders.length, completedOrderCount: completedOrders.length, leadCount: leads.length, revenue, feedbackCount: fbs.length, avgRating: Math.round(avgRating * 10) / 10, behaviorCount: behaviors.length, recentOrders, recentFeedbacks, quizStarts, checkoutClicks };
}
