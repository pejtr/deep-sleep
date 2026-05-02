import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);

// 1. Page views by page in last 7 days
console.log("=== PAGE VIEWS BY PAGE (last 7 days) ===");
const pageViews = await db.execute(sql`
  SELECT page, COUNT(*) as views, COUNT(DISTINCT session_id) as unique_sessions
  FROM page_views 
  WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY page 
  ORDER BY views DESC
  LIMIT 20
`);
console.table(pageViews[0]);

// 2. Behavior events by type in last 7 days
console.log("\n=== BEHAVIOR EVENTS (last 7 days) ===");
const events = await db.execute(sql`
  SELECT event_type, page, COUNT(*) as count
  FROM behavior_events 
  WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY event_type, page
  ORDER BY count DESC
  LIMIT 30
`);
console.table(events[0]);

// 3. Orders timeline
console.log("\n=== ORDERS BY DATE ===");
const orders = await db.execute(sql`
  SELECT DATE(created_at) as order_date, COUNT(*) as orders, SUM(amount) as revenue, 
         GROUP_CONCAT(product_id) as products, GROUP_CONCAT(utm_source) as sources
  FROM orders 
  GROUP BY DATE(created_at)
  ORDER BY order_date DESC
`);
console.table(orders[0]);

// 4. Check if there are ANY orders after Apr 24
console.log("\n=== ORDERS AFTER APR 24 ===");
const recentOrders = await db.execute(sql`
  SELECT id, product_id, amount, status, utm_source, utm_campaign, created_at 
  FROM orders 
  WHERE created_at > '2026-04-24'
  ORDER BY created_at DESC
`);
console.table(recentOrders[0]);

// 5. Quiz submissions in last 7 days
console.log("\n=== QUIZ SUBMISSIONS (last 7 days) ===");
const quizzes = await db.execute(sql`
  SELECT DATE(created_at) as quiz_date, COUNT(*) as submissions, 
         GROUP_CONCAT(chronotype) as chronotypes
  FROM quiz_results 
  WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY DATE(created_at)
  ORDER BY quiz_date DESC
`);
console.table(quizzes[0]);

// 6. Email leads in last 7 days
console.log("\n=== EMAIL LEADS (last 7 days) ===");
const leads = await db.execute(sql`
  SELECT DATE(created_at) as lead_date, COUNT(*) as leads, GROUP_CONCAT(source) as sources
  FROM email_leads 
  WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY DATE(created_at)
  ORDER BY lead_date DESC
`);
console.table(leads[0]);

// 7. Referrer data from page views
console.log("\n=== TOP REFERRERS (last 7 days) ===");
const referrers = await db.execute(sql`
  SELECT referrer, COUNT(*) as views
  FROM page_views 
  WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) AND referrer IS NOT NULL AND referrer != ''
  GROUP BY referrer
  ORDER BY views DESC
  LIMIT 15
`);
console.table(referrers[0]);

await conn.end();
