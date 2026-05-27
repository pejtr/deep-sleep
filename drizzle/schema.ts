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
  // ── CRM / Contact Intelligence fields ────────────────────────────────────
  lifecycleStage: mysqlEnum("lifecycleStage", ["lead", "prospect", "customer", "churned"]).default("lead"),
  leadScore: int("leadScore").default(0), // 0-100 computed score
  tags: text("tags"), // JSON array: ["insomnia", "wolf", "reddit", "high-intent"]
  // ── Attribution ────────────────────────────────────────────────────────────────
  utmSource: varchar("utmSource", { length: 64 }),
  utmMedium: varchar("utmMedium", { length: 64 }),
  utmCampaign: varchar("utmCampaign", { length: 128 }),
  utmContent: varchar("utmContent", { length: 128 }),  // ad set / creative variant
  utmTerm: varchar("utmTerm", { length: 128 }),         // keyword / ad creative name
  referrer: varchar("referrer", { length: 512 }),        // full referrer URL
  referrerDomain: varchar("referrerDomain", { length: 128 }), // e.g. reddit.com, tiktok.com
  landingPage: varchar("landingPage", { length: 512 }),  // first page visited
  // ── User Profile ────────────────────────────────────────────────────────────
  country: varchar("country", { length: 4 }),
  language: varchar("language", { length: 8 }),
  firstName: varchar("firstName", { length: 128 }),
  deviceType: varchar("deviceType", { length: 16 }),    // mobile | desktop | tablet
  browser: varchar("browser", { length: 32 }),
  sleepScore: int("sleepScore"),                         // 0-100 computed from quiz answers
  sleepIssues: text("sleepIssues"),                      // JSON: ["insomnia", "anxiety", "early_waking"]
  quizAnswers: text("quizAnswers"),                      // JSON: full quiz answer map
  persona: varchar("persona", { length: 32 }),           // "Luna" | "Petra" | "Lucie"
  // ── Engagement ──────────────────────────────────────────────────────────────
  lastActivityAt: timestamp("lastActivityAt").defaultNow(),
  convertedToCustomer: boolean("convertedToCustomer").default(false),
  totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).default("0"),
  emailsOpened: int("emailsOpened").default(0),
  emailsClicked: int("emailsClicked").default(0),
  emailSequenceStep: int("emailSequenceStep").default(0), // 0=not started, 1-7=step
  lastEmailSentAt: timestamp("lastEmailSentAt"),
  pageViewCount: int("pageViewCount").default(0),
  timeOnSiteSec: int("timeOnSiteSec").default(0),
  purchaseAttempts: int("purchaseAttempts").default(0),  // clicked buy but didn't complete
  // ── Integrations ────────────────────────────────────────────────────────────
  brevoContactId: varchar("brevoContactId", { length: 64 }),
  redditAudienceUploaded: boolean("redditAudienceUploaded").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
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
  email: varchar("email", { length: 320 }),
  chronotype: varchar("chronotype", { length: 32 }).default("Bear"),
  sequenceType: varchar("sequenceType", { length: 64 }).notNull(), // welcome, 7day, upsell, retention
  emailNumber: int("emailNumber").notNull(), // 1, 2, 3, etc.
  scheduledAt: timestamp("scheduledAt"), // when to send this email
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  status: mysqlEnum("emailStatus", ["pending", "sent", "opened", "clicked", "bounced", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequence = typeof emailSequences.$inferInsert;

// ── Persona A/B Tests (Luna variants) ──────────────────────────────────────────────────
export const personaAssignments = mysqlTable("persona_assignments", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  personaId: varchar("personaId", { length: 32 }).notNull(), // luna1, luna2, ..., luna10
  personaName: varchar("personaName", { length: 128 }).notNull(), // Display name
  personaDescription: text("personaDescription"), // Short description
  page: varchar("page", { length: 64 }).notNull(), // landing, chatbot, upsell1, upsell2, upsell3
  shown: boolean("shown").default(true).notNull(),
  converted: boolean("converted").default(false).notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  chronotype: varchar("chronotype", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PersonaAssignment = typeof personaAssignments.$inferSelect;
export type InsertPersonaAssignment = typeof personaAssignments.$inferInsert;

// ── Blog Posts (SEO auto-generated) ──────────────────────────────────────────────────
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 512 }),
  seoKeyword: varchar("seoKeyword", { length: 128 }),
  metaDescription: varchar("metaDescription", { length: 256 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ── User Journey Events ──────────────────────────────────────────────────────
// Tracks detailed journey steps per persona: quiz_start → quiz_complete → chat_open → checkout_view → purchase
export const userJourneyEvents = mysqlTable("user_journey_events", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  personaId: varchar("personaId", { length: 32 }).notNull(), // luna1, luna2, ..., luna10
  personaName: varchar("personaName", { length: 128 }).notNull(),
  step: varchar("step", { length: 64 }).notNull(), // quiz_start, quiz_complete, chat_open, chat_message, checkout_view, purchase, email_opened, email_clicked
  stepNumber: int("stepNumber").notNull(), // 1, 2, 3, 4, 5 for ordering
  duration: int("duration"), // milliseconds spent on this step
  metadata: text("metadata"), // JSON with additional context
  chronotype: varchar("chronotype", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserJourneyEvent = typeof userJourneyEvents.$inferSelect;
export type InsertUserJourneyEvent = typeof userJourneyEvents.$inferInsert;


// ── Products (upsell tiers) ──────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(), // "7-Night Protocol", "Personalized Plan", "Advanced Access"
  price: int("price").notNull(), // v centimech: 500 = $5, 2900 = $29, 9900 = $99
  description: text("description").notNull(),
  features: text("features").notNull(), // JSON array
  tier: mysqlEnum("tier", ["basic", "pro", "premium"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ── Purchases (order tracking) ───────────────────────────────────────────────
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  productId: int("productId").notNull().references(() => products.id),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }).notNull().unique(),
  amount: int("amount").notNull(), // v centimech
  status: mysqlEnum("status", ["completed", "refunded"]).default("completed").notNull(),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

// ── Personalized Plans (AI-generated) ────────────────────────────────────────
export const personalizedPlans = mysqlTable("personalized_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  chronotype: varchar("chronotype", { length: 16 }).notNull(), // "Lion", "Bear", "Wolf", "Dolphin"
  sleepIssues: text("sleepIssues").notNull(), // JSON array
  planContent: text("planContent").notNull(), // AI-generated personalized plan
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type PersonalizedPlan = typeof personalizedPlans.$inferSelect;
export type InsertPersonalizedPlan = typeof personalizedPlans.$inferInsert;

// ── API Keys (for external integrations like LeadOS) ─────────────────────────
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  keyHash: varchar("keyHash", { length: 128 }).notNull().unique(), // SHA-256 hash of the key
  name: varchar("name", { length: 128 }).notNull(), // e.g. "LeadOS Production"
  permissions: text("permissions").notNull().default("read"), // JSON array: ["read", "write", "email"]
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// ── Outbound Webhooks (push events to LeadOS or other CRMs) ──────────────────
export const outboundWebhooks = mysqlTable("outbound_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(), // e.g. "LeadOS"
  url: text("url").notNull(), // destination URL
  secret: varchar("secret", { length: 128 }), // HMAC signing secret
  events: text("events").notNull().default("[]"), // JSON array: ["new_order", "new_lead", "quiz_completed"]
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  lastStatus: int("lastStatus"), // HTTP status of last delivery
});

export type OutboundWebhook = typeof outboundWebhooks.$inferSelect;
export type InsertOutboundWebhook = typeof outboundWebhooks.$inferInsert;

// ── Affiliate Clicks (tracking each visit with ?ref=CODE) ────────────────────
export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  refCode: varchar("refCode", { length: 64 }).notNull(),
  ipHash: varchar("ipHash", { length: 64 }),
  landingUrl: varchar("landingUrl", { length: 512 }),
  userAgent: varchar("userAgent", { length: 512 }),
  utmCampaign: varchar("utmCampaign", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = typeof affiliateClicks.$inferInsert;

// ── Affiliate Conversions (when an order is attributed to an affiliate) ──────
export const affiliateConversions = mysqlTable("affiliate_conversions", {
  id: int("id").autoincrement().primaryKey(),
  refCode: varchar("refCode", { length: 64 }).notNull(),
  orderId: int("orderId").notNull(),
  orderAmountCents: int("orderAmountCents").notNull(),
  commissionCents: int("commissionCents").notNull(),
  status: mysqlEnum("affConvStatus", ["pending", "approved", "paid", "reversed"]).default("pending").notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  productKey: varchar("productKey", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
});
export type AffiliateConversion = typeof affiliateConversions.$inferSelect;
export type InsertAffiliateConversion = typeof affiliateConversions.$inferInsert;

// ── Affiliate Payouts ────────────────────────────────────────────────────────
export const affiliatePayouts = mysqlTable("affiliate_payouts", {
  id: int("id").autoincrement().primaryKey(),
  refCode: varchar("refCode", { length: 64 }).notNull(),
  amountCents: int("amountCents").notNull(),
  payoutMethod: varchar("payoutMethod", { length: 32 }).default("paypal"),
  payoutAddress: varchar("payoutAddress", { length: 320 }),
  status: mysqlEnum("payoutStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = typeof affiliatePayouts.$inferInsert;

// ── Newsletter Subscribers ───────────────────────────────────────────────────
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 128 }),
  source: varchar("source", { length: 64 }).default("squeeze").notNull(), // squeeze, blog, exit_popup, footer
  confirmed: boolean("confirmed").default(false).notNull(),
  confirmToken: varchar("confirmToken", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
