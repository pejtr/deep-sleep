import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerBehaviorRoutes } from "../behaviorRoutes";
import { registerStripeWebhook } from "../stripeWebhook";
import { appRouter } from "../routers";
import { scheduleNightlyOptimization } from "../jobs/nightlyOptimization";
import { registerProtocolPdfRoute } from "../protocolPdf";
import { registerRedditOAuthRoutes } from "../redditOAuth";
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
  const server = createServer(app);
  // Stripe webhook MUST receive raw body — register BEFORE express.json()
  app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerBehaviorRoutes(app);
  registerStripeWebhook(app);
  registerProtocolPdfRoute(app);
  registerRedditOAuthRoutes(app);

  // ── Sitemap.xml (V2-4) ─────────────────────────────────────────────────────
  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = "https://deepsleep.manus.space";
    const staticPages = ["/", "/quiz-funnel", "/blog", "/order", "/privacy", "/terms", "/refund", "/affiliates", "/contact"];
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
    res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://deepsleep.manus.space/sitemap.xml");
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
      const seoKeyword = keyword || "deep sleep improvement";
      const postTitle = title || `How to Improve ${seoKeyword.charAt(0).toUpperCase() + seoKeyword.slice(1)}`;
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
  });
}

startServer().catch(console.error);
