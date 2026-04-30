import { createConnection } from "mysql2/promise";
const conn = await createConnection(process.env.DATABASE_URL);

// Check orders with source/utm data
const [orders] = await conn.query(`SELECT id, user_id, amount, currency, status, source, created_at FROM orders ORDER BY created_at DESC LIMIT 50`);
console.log("=== ORDERS ===");
console.table(orders);

// Check if there's UTM data in behavior_events
const [events] = await conn.query(`SELECT DISTINCT event_type, COUNT(*) as cnt FROM behavior_events GROUP BY event_type ORDER BY cnt DESC`);
console.log("\n=== EVENT TYPES ===");
console.table(events);

// Check for UTM params in behavior events
const [utmEvents] = await conn.query(`SELECT * FROM behavior_events WHERE event_type LIKE '%utm%' OR event_data LIKE '%utm%' OR event_data LIKE '%source%' LIMIT 20`);
console.log("\n=== UTM EVENTS ===");
console.table(utmEvents);

await conn.end();
