/**
 * External REST API for LeadOS CRM integration
 * Endpoints: GET/POST /api/external/*
 * Auth: Bearer API key (SHA-256 hashed, stored in api_keys table)
 */
import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { getDb } from "./db";
import { apiKeys, orders, quizResults, emailSequences, emailLeads } from "../drizzle/schema";
import { eq, and, desc, gte, count, sql } from "drizzle-orm";
import { sendPurchaseConfirmation } from "./emailService";

export const externalApiRouter = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function generateApiKey(): string {
  return "dsr_" + crypto.randomBytes(32).toString("hex");
}

// ── API Key Middleware ────────────────────────────────────────────────────────

async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header. Use: Bearer <api_key>" });
    return;
  }

  const rawKey = authHeader.slice(7).trim();
  const keyHash = hashApiKey(rawKey);

  const db = await getDb();
  if (!db) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.active, true)))
    .limit(1);

  if (!apiKey) {
    res.status(401).json({ error: "Invalid or revoked API key" });
    return;
  }

  // Update lastUsedAt
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  // Attach permissions to request
  (req as any).apiKeyPermissions = JSON.parse(apiKey.permissions || "[]") as string[];
  (req as any).apiKeyId = apiKey.id;
  next();
}

function requirePermission(perm: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const perms: string[] = (req as any).apiKeyPermissions || [];
    if (!perms.includes(perm) && !perms.includes("admin")) {
      res.status(403).json({ error: `Permission '${perm}' required` });
      return;
    }
    next();
  };
}

// Apply auth to all external routes
externalApiRouter.use(apiKeyAuth);

// ── GET /api/external/leads ───────────────────────────────────────────────────

externalApiRouter.get("/leads", requirePermission("read"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "DB unavailable" });

    const page = parseInt((req.query.page as string) || "1");
    const limit = Math.min(parseInt((req.query.limit as string) || "50"), 200);
    const offset = (page - 1) * limit;

    const leads = await db
      .select({
        id: quizResults.id,
        email: quizResults.email,
        chronotype: quizResults.chronotype,
        answers: quizResults.answers,
        createdAt: quizResults.createdAt,
      })
      .from(quizResults)
      .where(sql`${quizResults.email} IS NOT NULL`)
      .orderBy(desc(quizResults.createdAt))
      .limit(limit)
      .offset(offset);

    // Also get email_leads
    const emailLeadsList = await db
      .select()
      .from(emailLeads)
      .orderBy(desc(emailLeads.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        quiz_leads: leads,
        email_leads: emailLeadsList,
        pagination: { page, limit, offset },
      },
    });
  } catch (err) {
    console.error("[ExternalAPI] GET /leads error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/external/orders ──────────────────────────────────────────────────

externalApiRouter.get("/orders", requirePermission("read"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "DB unavailable" });

    const page = parseInt((req.query.page as string) || "1");
    const limit = Math.min(parseInt((req.query.limit as string) || "50"), 200);
    const offset = (page - 1) * limit;
    const status = (req.query.status as string) || "completed";

    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.status, status as any))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, offset },
    });
  } catch (err) {
    console.error("[ExternalAPI] GET /orders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/external/analytics ──────────────────────────────────────────────

externalApiRouter.get("/analytics", requirePermission("read"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "DB unavailable" });

    // Revenue from completed orders
    const [revenueRow] = await db.execute(
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = 'completed'`
    ) as any;
    const totalRevenue = Number(revenueRow?.[0]?.total || 0);

    // Order count
    const [orderRow] = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM orders WHERE status = 'completed'`
    ) as any;
    const totalOrders = Number(orderRow?.[0]?.cnt || 0);

    // Lead count
    const [leadRow] = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM quiz_results WHERE email IS NOT NULL`
    ) as any;
    const totalLeads = Number(leadRow?.[0]?.cnt || 0);

    // Quiz starts
    const [quizRow] = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM quiz_results`
    ) as any;
    const totalQuizStarts = Number(quizRow?.[0]?.cnt || 0);

    const conversionRate = totalLeads > 0 ? ((totalOrders / totalLeads) * 100).toFixed(2) : "0.00";
    const aov = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";

    res.json({
      success: true,
      data: {
        revenue_usd: totalRevenue,
        total_orders: totalOrders,
        total_leads: totalLeads,
        total_quiz_starts: totalQuizStarts,
        conversion_rate_pct: parseFloat(conversionRate),
        average_order_value_usd: parseFloat(aov),
        generated_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[ExternalAPI] GET /analytics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/external/email-sequences ────────────────────────────────────────

externalApiRouter.get("/email-sequences", requirePermission("read"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "DB unavailable" });

    const page = parseInt((req.query.page as string) || "1");
    const limit = Math.min(parseInt((req.query.limit as string) || "50"), 200);
    const offset = (page - 1) * limit;

    const sequences = await db
      .select()
      .from(emailSequences)
      .orderBy(desc(emailSequences.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: sequences,
      pagination: { page, limit, offset },
    });
  } catch (err) {
    console.error("[ExternalAPI] GET /email-sequences error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/external/leads ──────────────────────────────────────────────────

externalApiRouter.post("/leads", requirePermission("write"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "DB unavailable" });

    const { email, source, chronotype } = req.body;
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    // Upsert into email_leads
    await db.insert(emailLeads).values({
      email,
      source: source || "leadOS",
      chronotype: chronotype || undefined,
      createdAt: new Date(),
    }).onDuplicateKeyUpdate({ set: { source: source || undefined } });

    res.status(201).json({ success: true, message: "Lead created/updated", email });
  } catch (err) {
    console.error("[ExternalAPI] POST /leads error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/external/email/send ────────────────────────────────────────────

externalApiRouter.post("/email/send", requirePermission("email"), async (req: Request, res: Response) => {
  try {
    const { to, subject, htmlContent, textContent } = req.body;
    if (!to || !subject || !htmlContent) {
      res.status(400).json({ error: "to, subject, and htmlContent are required" });
      return;
    }

    // Use Brevo directly for custom emails
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      res.status(503).json({ error: "Email service not configured" });
      return;
    }
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Deep Sleep Reset", email: "noreply@deep-sleep-reset.com" },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || "",
      }),
    });
    const result = await brevoRes.json();

    res.json({ success: true, message: "Email sent", result });
  } catch (err) {
    console.error("[ExternalAPI] POST /email/send error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ── API Key Management (admin-only internal tRPC handles this) ────────────────
// Exposed here for documentation purposes — key CRUD is in routers.ts adminProcedure

export { generateApiKey, hashApiKey };
