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
