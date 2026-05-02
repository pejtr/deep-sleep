import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Quiz Results ─────────────────────────────────────────────────────────────
export const quizResults = mysqlTable("quiz_results", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  chronotype: mysqlEnum("chronotype", ["Lion", "Bear", "Wolf", "Dolphin"]).notNull(),
  answers: text("answers").notNull(), // JSON array of answer indices
  email: varchar("email", { length: 320 }),
  abVariant: varchar("abVariant", { length: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;

// ── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  productId: varchar("productId", { length: 32 }).notNull(), // main, oto1, oto2, oto3
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  email: varchar("email", { length: 320 }),
  chronotype: mysqlEnum("chronotype", ["Lion", "Bear", "Wolf", "Dolphin"]),
  status: mysqlEnum("status", ["pending", "completed", "declined"]).default("pending").notNull(),
  gumroadPermalink: varchar("gumroadPermalink", { length: 64 }),
  stripeSessionId: varchar("stripeSessionId", { length: 128 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  currency: varchar("currency", { length: 8 }).default("usd"),
  utmSource: varchar("utmSource", { length: 64 }),
  utmMedium: varchar("utmMedium", { length: 64 }),
  utmCampaign: varchar("utmCampaign", { length: 128 }),
  utmContent: varchar("utmContent", { length: 128 }),
  utmTerm: varchar("utmTerm", { length: 128 }),
  referrer: varchar("referrer", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ── Email Leads ──────────────────────────────────────────────────────────────
export const emailLeads = mysqlTable("email_leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  sessionId: varchar("sessionId", { length: 128 }),
  chronotype: mysqlEnum("chronotype", ["Lion", "Bear", "Wolf", "Dolphin"]),
  source: varchar("source", { length: 64 }).default("quiz_result"), // quiz_result | exit_popup | order
  subscribed: boolean("subscribed").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLead = typeof emailLeads.$inferSelect;
export type InsertEmailLead = typeof emailLeads.$inferInsert;

// ── A/B Test Impressions ─────────────────────────────────────────────────────
export const abImpressions = mysqlTable("ab_impressions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  testName: varchar("testName", { length: 64 }).notNull(), // headline, cta, color
  variant: varchar("variant", { length: 8 }).notNull(), // A, B, C, D, E
  converted: boolean("converted").default(false).notNull(),
  page: varchar("page", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AbImpression = typeof abImpressions.$inferSelect;
export type InsertAbImpression = typeof abImpressions.$inferInsert;

// ── Behavior Events ──────────────────────────────────────────────────────────
export const behaviorEvents = mysqlTable("behavior_events", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  event: varchar("event", { length: 64 }).notNull(), // page_view, click, scroll, quiz_complete, etc.
  page: varchar("page", { length: 64 }),
  element: varchar("element", { length: 128 }),
  value: text("value"), // JSON metadata
  chronotype: mysqlEnum("chronotype", ["Lion", "Bear", "Wolf", "Dolphin"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BehaviorEvent = typeof behaviorEvents.$inferSelect;
export type InsertBehaviorEvent = typeof behaviorEvents.$inferInsert;

// ── Feedback ─────────────────────────────────────────────────────────────────
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  liked: text("liked"),
  improved: text("improved"),
  email: varchar("email", { length: 320 }),
  rewardCode: varchar("rewardCode", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

// ── AI Insights (nightly optimization results) ─────────────────────────────────────────
export const aiInsights = mysqlTable("ai_insights", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 16 }).notNull(), // YYYY-MM-DD
  summary: text("summary").notNull(), // AI-generated summary
  recommendations: text("recommendations").notNull(), // JSON array of recommendations
  metrics: text("metrics").notNull(), // JSON snapshot of key metrics
  applied: boolean("applied").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;

// ── Chat Messages (Luna conversation log) ────────────────────────────────────────
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  lang: varchar("lang", { length: 8 }).default("en"),
  isAdmin: boolean("isAdmin").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ── Subscriptions (recurring membership) ─────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: varchar("plan", { length: 64 }).notNull(), // monthly, annual, lifetime
  status: mysqlEnum("subStatus", ["active", "past_due", "cancelled", "expired", "trialing"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodEnd: decimal("currentPeriodEnd", { precision: 15, scale: 0 }), // Unix timestamp
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  chronotype: varchar("chronotype", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ── Discount Codes (for email leads) ─────────────────────────────────────────
export const discountCodes = mysqlTable("discount_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  percentOff: int("percentOff").notNull(),
  maxUses: int("maxUses").default(1),
  usedCount: int("usedCount").default(0),
  expiresAt: timestamp("expiresAt"),
  leadId: int("leadId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;

// ── Affiliates (referral program) ────────────────────────────────────────────
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  commissionPercent: int("commissionPercent").default(20),
  totalCommission: decimal("totalCommission", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("affStatus", ["active", "inactive", "pending"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

// ── Upsell A/B Tests ─────────────────────────────────────────────────────────
export const upsellAbTests = mysqlTable("upsell_ab_tests", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  page: varchar("page", { length: 32 }).notNull(), // upsell1, upsell2, upsell3
  variant: varchar("variant", { length: 4 }).notNull(), // A, B
  shown: boolean("shown").default(true).notNull(),
  converted: boolean("converted").default(false).notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  chronotype: varchar("chronotype", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UpsellAbTest = typeof upsellAbTests.$inferSelect;
export type InsertUpsellAbTest = typeof upsellAbTests.$inferInsert;

// ── Email Sequences (automation templates) ───────────────────────────────────
export const emailSequences = mysqlTable("email_sequences", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  sequenceType: varchar("sequenceType", { length: 64 }).notNull(), // welcome, 7day, upsell, retention
  emailNumber: int("emailNumber").notNull(), // 1, 2, 3, etc.
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  status: mysqlEnum("emailStatus", ["pending", "sent", "opened", "clicked", "bounced"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequence = typeof emailSequences.$inferInsert;
