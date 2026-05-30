import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerBehaviorRoutes } from "../behaviorRoutes";
import { registerStripeWebhook } from "../stripeWebhook";
import { appRouter } from "../routers";
import { scheduleNightlyOptimization } from "../jobs/nightlyOptimization";
import { processPendingEmails } from "../emailScheduler";
import { registerProtocolPdfRoute } from "../protocolPdf";
import { registerRedditOAuthRoutes } from "../redditOAuth";
import { externalApiRouter } from "../externalApi";
import { registerTelegramWebhook, initTelegramWebhook } from "../telegramWebhook";
import { scheduleTelegramReports } from "../telegramLuna";
import { createContext } from "./context";
import { getBlogPosts, createBlogPost } from "../db";
import { invokeLLM } from "./llm";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1); // Trust first proxy (Cloud Run / Manus gateway)
  const server = createServer(app);

  // Domain Redirect Middleware - redirect all non-primary domains to deep-sleep-reset.com
  const PRIMARY_DOMAIN = 'deep-sleep-reset.com';
  const ALLOWED_DOMAINS = [
    'deep-sleep-reset.com',
    'www.deep-sleep-reset.com',
    'deepsleep-z7uhfhzs.manus.space',
    'deepsleep.manus.space',
    'localhost',
  ];

  app.use((req, res, next) => {
    const host = req.headers.host || '';
    const hostname = host.split(':')[0];
    
    if (ALLOWED_DOMAINS.some(domain => host.includes(domain) || hostname === domain)) {
      return next();
    }
    
    const protocol = req.protocol || 'https';
    // Redirect to primary domain without query string, add flag for loader
    const redirectUrl = `${protocol}://${PRIMARY_DOMAIN}${req.path}`;
    console.log(`[Domain Redirect] ${host}${req.originalUrl} -> ${redirectUrl}`);
    return res.redirect(301, redirectUrl);
  });

  // ── Security: Helmet (HTTP security headers) ──────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://www.googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api.reddit.com", "https://api.brevo.com", "https://api.manus.im", "wss:", "ws:"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
        frameAncestors: ["'self'", "https://manus.im", "https://*.manus.im", "https://*.manus.space", "https://*.manus.computer", "https://*.us2.manus.computer", "https://*.us3.manus.computer"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Stripe iframes
    crossOriginOpenerPolicy: false, // Allow iframe embedding
    frameguard: false, // Disable X-Frame-Options header — frameAncestors CSP handles framing policy
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }));

  // ── Security: Rate Limiting ────────────────────────────────────────────────
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: (req) => req.path === "/api/health" || req.path.startsWith("/api/trpc/auth.me") || req.path.includes("behavior.trackEvent") || req.path.includes("behavior.track"),
  });
  const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many checkout attempts, please try again later." },
  });
  const scheduledLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Scheduled task rate limit exceeded." },
  });
  app.use("/api", generalLimiter);
  app.use("/api/trpc/checkout", checkoutLimiter);
  app.use("/api/scheduled", scheduledLimiter);

  // ── Health Check ──────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

  // Stripe webhook MUST receive raw body — register BEFORE express.json()
  app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
  // Configure body parser with reasonable size limit
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ limit: "5mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerBehaviorRoutes(app);
  registerStripeWebhook(app);
  registerProtocolPdfRoute(app);
  registerRedditOAuthRoutes(app);
  // Telegram Luna webhook — receives commands from @lunadeepsleepbot
  registerTelegramWebhook(app);
  // External REST API for LeadOS CRM integration
  app.use("/api/external", externalApiRouter);

  // ── Sitemap.xml (V2-4) ─────────────────────────────────────────────────────
  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = `https://${_req.headers.host || "deep-sleep-reset.com"}`;
    const staticPages = ["/", "/quiz", "/quiz-funnel", "/blog", "/order", "/privacy", "/terms", "/refund", "/affiliates", "/contact", "/feedback", "/chat"];
    let posts: Array<{ slug: string; publishedAt: Date | string }> = [];
    try { posts = await getBlogPosts(100, 0); } catch {}
    const urls = [
      ...staticPages.map(p => `  <url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`),
      ...posts.map(p => `  <url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${new Date(p.publishedAt).toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
    ];
    res.set("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  });

  // ── robots.txt ─────────────────────────────────────────────────────────────
  app.get("/robots.txt", (_req, res) => {
    res.set("Content-Type", "text/plain");
    const host = _req.headers.host || "deep-sleep-reset.com";
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /settings\nDisallow: /analytics\nDisallow: /ab-testing\nSitemap: https://${host}/sitemap.xml`);
  });

  // ── Scheduled Blog Post Endpoint (V2-1) ────────────────────────────────────
  app.post("/api/scheduled/blog-post", async (req, res) => {
    // Auth: scheduled task cookie check
    const sessionCookie = req.cookies?.app_session_id || req.headers["cookie"]?.match(/app_session_id=([^;]+)/)?.[1];
    if (!sessionCookie && req.headers["x-scheduled-task"] !== "true") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { keyword, title } = req.body as { keyword?: string; title?: string };
      const seoKeyword = (keyword || "deep sleep improvement").slice(0, 100); // sanitize length
      const postTitle = (title || `How to Improve ${seoKeyword.charAt(0).toUpperCase() + seoKeyword.slice(1)}`).slice(0, 200);
      const slug = postTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a sleep science expert writing SEO-optimized blog articles for Deep Sleep Reset (deepsleep.manus.space). 
Write in a professional, authoritative tone. Sound like someone who has actually worked in sleep medicine.
Use active voice and vary sentence structure.
Format: Use ## for H2 headings, ### for H3, **bold** for key terms, - for bullet lists.
SEO Rules: Naturally include the target keyword in the first paragraph, in at least one H2, and 3-5 times throughout.
Length: 600-900 words. Do NOT include the title in the content (it's added separately).`
          },
          {
            role: "user",
            content: `Write a complete SEO blog article about: "${seoKeyword}". Target keyword: "${seoKeyword}". Article title: "${postTitle}". Include practical, science-backed advice. Do not include the title at the top.`
          }
        ]
      });

      const rawContent = llmResponse.choices?.[0]?.message?.content;
      const articleContent = typeof rawContent === "string" ? rawContent : "";
      const excerpt = articleContent.replace(/[#*\n]/g, " ").trim().slice(0, 200) + "...";
      const metaDescription = `Learn about ${seoKeyword}. Science-backed sleep tips from Deep Sleep Reset. Improve your sleep quality tonight.`.slice(0, 256);

      await createBlogPost({
        title: postTitle,
        slug,
        content: articleContent,
        excerpt,
        seoKeyword,
        metaDescription,
      });

      return res.json({ success: true, slug, title: postTitle });
    } catch (err) {
      console.error("[Scheduled Blog] Error:", err);
      return res.status(500).json({ error: "Failed to generate blog post" });
    }
  });

    // ── Analytics Export ────────────────────────────────────────────────────────
  app.post("/api/analytics/export-pdf", async (req, res) => {
    try {
      const { generateAnalyticsPDF } = await import("../analyticsExport");
      const { getAdminStats } = await import("../db");
      
      const stats = await getAdminStats();
      const analyticsData = {
        dateRange: { start: new Date(Date.now() - 30*24*60*60*1000), end: new Date() },
        kpis: {
          totalRevenue: stats.revenue,
          totalOrders: stats.orderCount,
          conversionRate: stats.orderCount > 0 ? (stats.completedOrderCount / stats.orderCount) * 100 : 0,
          avgOrderValue: stats.completedOrderCount > 0 ? stats.revenue / stats.completedOrderCount : 0,
        },
        dailyMetrics: [],
        deviceBreakdown: (stats.deviceBreakdown || []).map(d => ({
          device: d.device,
          count: d.count,
          percentage: stats.behaviorCount > 0 ? (d.count / stats.behaviorCount) * 100 : 0,
        })),
        topPages: [],
        recentOrders: stats.recentOrders || [],
      };
      const pdfBuffer = await generateAnalyticsPDF(analyticsData);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=analytics-report.pdf");
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[Analytics Export] Error:", err);
      return res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  app.post("/api/analytics/export-csv", async (req, res) => {
    try {
      const { generateAnalyticsCSV } = await import("../analyticsExport");
      const { getAdminStats } = await import("../db");
      
      const stats = await getAdminStats();
      const analyticsData = {
        dateRange: { start: new Date(Date.now() - 30*24*60*60*1000), end: new Date() },
        kpis: {
          totalRevenue: stats.revenue,
          totalOrders: stats.orderCount,
          conversionRate: stats.orderCount > 0 ? (stats.completedOrderCount / stats.orderCount) * 100 : 0,
          avgOrderValue: stats.completedOrderCount > 0 ? stats.revenue / stats.completedOrderCount : 0,
        },
        dailyMetrics: [],
        deviceBreakdown: (stats.deviceBreakdown || []).map(d => ({
          device: d.device,
          count: d.count,
          percentage: stats.behaviorCount > 0 ? (d.count / stats.behaviorCount) * 100 : 0,
        })),
        topPages: [],
        recentOrders: stats.recentOrders || [],
      };
      const csvContent = generateAnalyticsCSV(analyticsData);
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=analytics-report.csv");
      res.send(csvContent);
    } catch (err) {
      console.error("[Analytics Export] Error:", err);
      return res.status(500).json({ error: "Failed to generate CSV" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start nightly AI optimization scheduler
    scheduleNightlyOptimization();
    // Start email sequence scheduler — runs every hour
    processPendingEmails().catch(console.error); // run immediately on startup
    setInterval(() => {
      processPendingEmails().catch(console.error);
    }, 60 * 60 * 1000); // every hour
    console.log("[Email Scheduler] Started — processing every hour");
    // Start Telegram Luna evening report scheduler (20:00 CET)
    scheduleTelegramReports();
    // Register Telegram webhook URL with Telegram API
    const serverPublicUrl = process.env.SERVER_PUBLIC_URL || `https://fixinsomnia.quest`;
    initTelegramWebhook(serverPublicUrl).catch(console.error);
  });
}

startServer().catch(console.error);
