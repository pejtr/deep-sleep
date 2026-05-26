import { drizzle } from "drizzle-orm/mysql2";
import { and, gte, lte, eq, count, desc } from "drizzle-orm";
import { asc } from "drizzle-orm";
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
  subscriptions,
  InsertSubscription,
  discountCodes,
  InsertDiscountCode,
  affiliates,
  InsertAffiliate,
  emailSequences,
  InsertEmailSequence,
  upsellAbTests,
  blogPosts,
  InsertBlogPost,
  affiliateClicks,
  InsertAffiliateClick,
  affiliateConversions,
  InsertAffiliateConversion,
  newsletterSubscribers,
  InsertNewsletterSubscriber,
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

// Get live A/B metrics for dashboard
export async function getAbMetrics(testName: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Get all impressions for this test
    const allImpressions = await db.select().from(abImpressions).where(eq(abImpressions.testName, testName));
    
    // Group by variant and calculate metrics
    const metrics: Record<string, { impressions: number; conversions: number; rate: number }> = {};
    
    allImpressions.forEach((imp) => {
      if (!metrics[imp.variant]) {
        metrics[imp.variant] = { impressions: 0, conversions: 0, rate: 0 };
      }
      metrics[imp.variant].impressions++;
      if (imp.converted) metrics[imp.variant].conversions++;
    });
    
    // Calculate conversion rates
    Object.keys(metrics).forEach((variant) => {
      const m = metrics[variant];
      m.rate = m.impressions > 0 ? (m.conversions / m.impressions) * 100 : 0;
    });
    
    // Determine winner (highest conversion rate)
    const variants = Object.entries(metrics).sort((a, b) => b[1].rate - a[1].rate);
    const winner = variants.length > 0 ? variants[0][0] : null;
    
    return {
      testName,
      metrics,
      winner,
      totalImpressions: allImpressions.length,
      totalConversions: allImpressions.filter(i => i.converted).length,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("[Database] Failed to get A/B metrics:", error);
    return null;
  }
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
  // Orders are stored in local currency (e.g. CZK 103.85 = $4 USD)
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
  // Revenue should ONLY count completed orders (paid)
  const revenue = completedRevenue;
  const avgRating = fbs.length > 0 ? fbs.reduce((sum, f) => sum + (f.rating ?? 0), 0) / fbs.length : 0;
  // Include createdAt timestamp in recentOrders for time display — ONLY COMPLETED ORDERS
  const recentOrders = completedOrders.slice(-10).reverse().map(o => ({ id: o.id, amount: o.amount, product: o.productId, status: o.status, createdAt: o.createdAt, currency: o.currency ?? undefined }));
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

  // Revenue by product (for donut chart)
  const productRevenueMap = new Map<string, number>();
  completedOrders.forEach(o => {
    const product = o.productId ?? 'unknown';
    productRevenueMap.set(product, (productRevenueMap.get(product) ?? 0) + toUsd(o.amount, o.currency));
  });
  const revenueByProduct = Array.from(productRevenueMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([product, value]) => ({ product, value: Math.round(value * 100) / 100 }));

  return { quizCount: quiz.length, orderCount: allOrders.length, completedOrderCount: completedOrders.length, leadCount: leads.length, revenue, feedbackCount: fbs.length, avgRating: Math.round(avgRating * 10) / 10, behaviorCount: behaviors.length, recentOrders, recentFeedbacks, quizStarts, checkoutClicks, uniqueBuyers, duplicateAttempts, referrerBreakdown, orderTimeline, deviceBreakdown, avgTimeToCheckout, revenueByProduct };
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

export async function getAllFeedbacks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedbacks).orderBy(feedbacks.createdAt);
}

export async function getLatestAiInsights(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  const { aiInsights } = await import('../drizzle/schema');
  const { desc: descFn } = await import('drizzle-orm');
  return db.select().from(aiInsights).orderBy(descFn(aiInsights.createdAt)).limit(limit);
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
  
  // Currency conversion rates (same as in getAdminStats)
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
  
  // Group by hour
  const hourMap = new Map<string, { visits: number; orders: number; revenue: number }>();
  
  // Process behavior events (visits/pageviews)
  allBehaviors.forEach(b => {
    const hour = new Date(b.createdAt).toISOString().slice(0, 13) + ':00:00Z';
    if (!hourMap.has(hour)) hourMap.set(hour, { visits: 0, orders: 0, revenue: 0 });
    const h = hourMap.get(hour)!;
    if (b.event === 'page_view') h.visits++;
  });
  
  // Process orders (only COMPLETED)
  allOrders.forEach(o => {
    const hour = new Date(o.createdAt).toISOString().slice(0, 13) + ':00:00Z';
    if (!hourMap.has(hour)) hourMap.set(hour, { visits: 0, orders: 0, revenue: 0 });
    const h = hourMap.get(hour)!;
    if (o.status === 'completed') {
      h.orders++;
      h.revenue += toUsd(o.amount, o.currency);
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
  
  // Currency conversion rates (same as in getAdminStats)
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
  
  // Group by day
  const dayMap = new Map<string, { visits: number; orders: number; revenue: number }>();
  
  // Process behavior events (visits/pageviews)
  allBehaviors.forEach(b => {
    const day = new Date(b.createdAt).toISOString().slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { visits: 0, orders: 0, revenue: 0 });
    const d = dayMap.get(day)!;
    if (b.event === 'page_view') d.visits++;
  });
  
  // Process orders (only COMPLETED)
  allOrders.forEach(o => {
    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { visits: 0, orders: 0, revenue: 0 });
    const d = dayMap.get(day)!;
    if (o.status === 'completed') {
      d.orders++;
      d.revenue += toUsd(o.amount, o.currency);
    }
  });
  
  return Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, data]) => ({ day, ...data }));
}

// ── Subscriptions ────────────────────────────────────────────────────────────
export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(subscriptions).values(data).onDuplicateKeyUpdate({ set: data });
  return result;
}

// ── Discount Codes ──────────────────────────────────────────────────────────
export async function getDiscountByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(discountCodes).where(eq(discountCodes.code, code)).limit(1);
  return result[0] ?? null;
}

export async function createDiscountCode(data: InsertDiscountCode) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(discountCodes).values(data);
}

// ── Affiliates ──────────────────────────────────────────────────────────────
export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(affiliates).where(eq(affiliates.code, code)).limit(1);
  return result[0] ?? null;
}

export async function createAffiliate(data: InsertAffiliate) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(affiliates).values(data);
}

export async function getAffiliateByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(affiliates).where(eq(affiliates.email, email)).limit(1);
  return result[0] ?? null;
}

export async function trackAffiliateClick(data: InsertAffiliateClick) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(affiliateClicks).values(data);
}

export async function createAffiliateConversion(data: InsertAffiliateConversion) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(affiliateConversions).values(data);
}

export async function getAffiliateStats(code: string) {
  const db = await getDb();
  if (!db) return null;
  const [clicks, conversions] = await Promise.all([
    db.select().from(affiliateClicks).where(eq(affiliateClicks.refCode, code)).catch(() => []),
    db.select().from(affiliateConversions).where(eq(affiliateConversions.refCode, code)).catch(() => []),
  ]);
  const earnings = conversions.reduce((sum, c) => sum + c.commissionCents, 0);
  return {
    code,
    clicks: clicks.length,
    conversions: conversions.length,
    earnings,
    pendingEarnings: conversions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionCents, 0),
    paidEarnings: conversions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionCents, 0),
  };
}

// ── Newsletter Subscribers ────────────────────────────────────────────────────────

export async function subscribeNewsletter(data: InsertNewsletterSubscriber) {
  const db = await getDb();
  if (!db) return null;
  // Upsert — if email exists, just update source
  try {
    return await db.insert(newsletterSubscribers).values(data).onDuplicateKeyUpdate({ set: { source: data.source } });
  } catch {
    return null;
  }
}

// ── Email Sequences ────────────────────────────────────────────────────────
export async function createEmailSequence(data: InsertEmailSequence) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(emailSequences).values(data);
}

export async function getEmailSequences(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSequences).where(eq(emailSequences.leadId, leadId));
}
// ── Upsell A/B Tests ──────────────────────────────────────────────────────────
export async function assignUpsellVariant(sessionId: string, page: string, chronotype?: string): Promise<"A" | "B"> {
  const db = await getDb();
  if (!db) return "A";
  // Check if already assigned for this session+page
  const { eq: eqFn, and } = await import("drizzle-orm");
  const existing = await db.select().from(upsellAbTests)
    .where(and(eqFn(upsellAbTests.sessionId, sessionId), eqFn(upsellAbTests.page, page)))
    .limit(1);
  if (existing.length > 0) return existing[0].variant as "A" | "B";
  // Deterministic 50/50 split based on sessionId hash
  const hash = sessionId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const variant: "A" | "B" = hash % 2 === 0 ? "A" : "B";
  await db.insert(upsellAbTests).values({ sessionId, page, variant, chronotype });
  return variant;
}

export async function markUpsellConverted(sessionId: string, page: string, revenue: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const { eq: eqFn, and } = await import("drizzle-orm");
  await db.update(upsellAbTests)
    .set({ converted: true, revenue })
    .where(and(eqFn(upsellAbTests.sessionId, sessionId), eqFn(upsellAbTests.page, page)));
}

/**
 * Two-proportion z-test for A/B statistical significance
 * Returns p-value (two-tailed). p < 0.05 = statistically significant.
 */
function twoProportionZTest(n1: number, c1: number, n2: number, c2: number): number {
  if (n1 === 0 || n2 === 0) return 1;
  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pPool = (c1 + c2) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  if (se === 0) return 1;
  const z = Math.abs(p1 - p2) / se;
  // Approximate p-value using normal distribution CDF
  const pValue = 2 * (1 - normalCDF(z));
  return Math.round(pValue * 10000) / 10000;
}
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}

export async function getUpsellAbResults(): Promise<{
  page: string;
  variant: string;
  impressions: number;
  conversions: number;
  convRate: number;
  totalRevenue: number;
  avgRevenue: number;
  pValue?: number;
  isSignificant?: boolean;
  uplift?: number;
}[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(upsellAbTests);
  // Group by page + variant
  const map = new Map<string, { impressions: number; conversions: number; revenue: number }>();
  for (const row of rows) {
    const key = `${row.page}|${row.variant}`;
    const cur = map.get(key) ?? { impressions: 0, conversions: 0, revenue: 0 };
    cur.impressions++;
    if (row.converted) {
      cur.conversions++;
      cur.revenue += parseFloat(row.revenue ?? "0");
    }
    map.set(key, cur);
  }
  const results = Array.from(map.entries()).map(([key, v]) => {
    const [page, variant] = key.split("|");
    return {
      page,
      variant,
      impressions: v.impressions,
      conversions: v.conversions,
      convRate: v.impressions > 0 ? Math.round((v.conversions / v.impressions) * 10000) / 100 : 0,
      totalRevenue: Math.round(v.revenue * 100) / 100,
      avgRevenue: v.conversions > 0 ? Math.round((v.revenue / v.conversions) * 100) / 100 : 0,
    };
  }).sort((a, b) => a.page.localeCompare(b.page) || a.variant.localeCompare(b.variant));

  // Add statistical significance per page (compare A vs B)
  // pages variable unused — kept for readability
  void results.map(r => r.page);
  return results.map(r => {
    const pageResults = results.filter(x => x.page === r.page);
    const varA = pageResults.find(x => x.variant === 'A');
    const varB = pageResults.find(x => x.variant === 'B');
    if (!varA || !varB) return { ...r, pValue: undefined, isSignificant: false, uplift: undefined };
    const pValue = twoProportionZTest(varA.impressions, varA.conversions, varB.impressions, varB.conversions);
    const isSignificant = pValue < 0.05;
    const baseRate = r.variant === 'B' ? varA.convRate : varB.convRate;
    const uplift = baseRate > 0 ? Math.round(((r.convRate - baseRate) / baseRate) * 10000) / 100 : undefined;
    return { ...r, pValue, isSignificant, uplift };
  });
}

// ── Blog Helpers ─────────────────────────────────────────────────────────────
export async function getBlogPosts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).orderBy(blogPosts.publishedAt).limit(limit).offset(offset);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(blogPosts).values(data);
  return result;
}

export async function getBlogPostCount() {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select().from(blogPosts);
  return rows.length;
}

// Get historical A/B trends for time period
export async function getAbTrends(testName: string, hoursBack: number = 24) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Calculate time threshold
    const now = new Date();
    const threshold = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    
    // Get impressions within time range
    const impressions = await db
      .select()
      .from(abImpressions)
      .where(
        and(
          eq(abImpressions.testName, testName),
          gte(abImpressions.createdAt, threshold)
        )
      )
      .orderBy(asc(abImpressions.createdAt));
    
    if (impressions.length === 0) {
      return {
        testName,
        hoursBack,
        data: [],
        variants: [],
      };
    }
    
    // Group by hour and variant
    const hourlyData: Record<string, Record<string, { impressions: number; conversions: number }>> = {};
    
    impressions.forEach((imp) => {
      const hour = new Date(imp.createdAt);
      hour.setMinutes(0, 0, 0);
      const hourKey = hour.toISOString();
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = {};
      }
      
      if (!hourlyData[hourKey][imp.variant]) {
        hourlyData[hourKey][imp.variant] = { impressions: 0, conversions: 0 };
      }
      
      hourlyData[hourKey][imp.variant].impressions++;
      if (imp.converted) hourlyData[hourKey][imp.variant].conversions++;
    });
    
    // Get all variants
    const variants = Array.from(new Set(impressions.map(i => i.variant))).sort();
    
    // Build chart data
    const chartData = Object.entries(hourlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, variantData]) => {
        const dataPoint: Record<string, any> = {
          time: new Date(hour).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          timestamp: hour,
        };
        
        variants.forEach((variant) => {
          const data = variantData[variant];
          if (data) {
            const rate = data.impressions > 0 
              ? (data.conversions / data.impressions) * 100 
              : 0;
            dataPoint[`${variant}_rate`] = parseFloat(rate.toFixed(2));
            dataPoint[`${variant}_impressions`] = data.impressions;
            dataPoint[`${variant}_conversions`] = data.conversions;
          }
        });
        
        return dataPoint;
      });
    
    return {
      testName,
      hoursBack,
      data: chartData,
      variants,
    };
  } catch (error) {
    console.error("[Database] Failed to get A/B trends:", error);
    return null;
  }
}


// ── A/B Export & Recommendations ────────────────────────────────────────────


export async function getAbExportData(testName: string, format: 'csv' | 'json' = 'csv') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const impressions = await db.select().from(abImpressions).where(eq(abImpressions.testName, testName));

  if (format === 'json') {
    return JSON.stringify(impressions, null, 2);
  }

  // CSV format
  const headers = ['Timestamp', 'Variant', 'Converted', 'Page', 'Session ID'];
  const rows = impressions.map((imp: any) => [
    new Date(imp.createdAt).toISOString(),
    imp.variant,
    imp.converted ? 'Yes' : 'No',
    imp.page || '',
    imp.sessionId || '',
  ]);

  const csv = [headers, ...rows].map((row: any) => row.map((cell: any) => `"${cell}"`).join(',')).join('\n');
  return csv;
}

export async function getAbRecommendations(testName: string) {
  const metrics = await getAbMetrics(testName);
  if (!metrics || !metrics.metrics) return [];

  const recommendations: Array<{ priority: 'high' | 'medium' | 'low'; title: string; description: string }> = [];

  // Analyze metrics
  const variants = Object.entries(metrics.metrics);
  if (variants.length === 0) return recommendations;

  // Find winner
  const winner = variants.reduce((best, [variant, data]: any) => {
    const bestRate = best[1].conversions > 0 ? (best[1].conversions / best[1].impressions) * 100 : 0;
    const currentRate = data.conversions > 0 ? (data.conversions / data.impressions) * 100 : 0;
    return currentRate > bestRate ? [variant, data] : best;
  });

  const winnerRate = winner[1].conversions > 0 ? (winner[1].conversions / winner[1].impressions) * 100 : 0;

  // Recommendation 1: Scale winner
  if (winnerRate > 5) {
    recommendations.push({
      priority: 'high',
      title: `Scale Variant ${winner[0]} - Highest Conversion Rate`,
      description: `Variant ${winner[0]} has a ${winnerRate.toFixed(2)}% conversion rate. Allocate more traffic to this variant.`,
    });
  }

  // Recommendation 2: Low volume warning
  const totalImpressions = metrics.totalImpressions || 0;
  if (totalImpressions < 1000) {
    recommendations.push({
      priority: 'medium',
      title: 'Increase Traffic Volume',
      description: `Current test has only ${totalImpressions} impressions. Collect at least 1000+ impressions for statistical significance.`,
    });
  }

  // Recommendation 3: Pause underperformer
  const underperformer = variants.find(([v]: any) => v !== winner[0]);
  if (underperformer) {
    const underRate = underperformer[1].conversions > 0 ? (underperformer[1].conversions / underperformer[1].impressions) * 100 : 0;
    if (underRate < winnerRate * 0.5) {
      recommendations.push({
        priority: 'high',
        title: `Pause Variant ${underperformer[0]} - Significantly Underperforming`,
        description: `Variant ${underperformer[0]} has ${underRate.toFixed(2)}% conversion rate vs winner's ${winnerRate.toFixed(2)}%. Consider pausing this variant.`,
      });
    }
  }

  return recommendations;
}


// ── Recent Orders (for live notifications) ────────────────────────────────────
export async function getRecentOrders(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Get recent COMPLETED orders with chronotype info
    const recentOrders = await db
      .select({
        id: orders.id,
        amount: orders.amount,
        currency: orders.currency,
        productId: orders.productId,
        chronotype: orders.chronotype,
        email: orders.email,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.status, "completed"))
      .orderBy(orders.createdAt)
      .limit(limit);
    
    return recentOrders.map(o => ({
      id: o.id,
      amount: o.amount,
      currency: o.currency || "usd",
      productId: o.productId,
      chronotype: o.chronotype || "Lion",
      email: o.email || "Customer",
      createdAt: o.createdAt,
    }));
  } catch (error) {
    console.error("[getRecentOrders] Error:", error);
    return [];
  }
}
