import mysql from "mysql2/promise";
const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Check orders columns
const [cols] = await conn.query("DESCRIBE orders");
console.log("=== ORDERS COLUMNS ===");
console.table(cols);

// Get all orders
const [orders] = await conn.query("SELECT * FROM orders ORDER BY id DESC");
console.log("\n=== ALL ORDERS ===");
for (const o of orders) {
  console.log(JSON.stringify(o));
}

// Check behavior_events columns
const [bcols] = await conn.query("DESCRIBE behavior_events");
console.log("\n=== BEHAVIOR_EVENTS COLUMNS ===");
console.table(bcols);

// Get recent behavior events count by type
const [bevents] = await conn.query("SELECT event_type, page, COUNT(*) as cnt FROM behavior_events GROUP BY event_type, page ORDER BY cnt DESC LIMIT 30");
console.log("\n=== BEHAVIOR EVENTS SUMMARY ===");
console.table(bevents);

// Quiz results
const [qcols] = await conn.query("DESCRIBE quiz_results");
console.log("\n=== QUIZ_RESULTS COLUMNS ===");
console.table(qcols);

const [quizzes] = await conn.query("SELECT * FROM quiz_results ORDER BY id DESC LIMIT 10");
console.log("\n=== RECENT QUIZZES ===");
for (const q of quizzes) {
  console.log(JSON.stringify(q));
}

// Email leads
const [leads] = await conn.query("SELECT * FROM email_leads ORDER BY id DESC LIMIT 10");
console.log("\n=== RECENT EMAIL LEADS ===");
for (const l of leads) {
  console.log(JSON.stringify(l));
}

await conn.end();
