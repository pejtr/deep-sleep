import mysql from "mysql2/promise";
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [tables] = await conn.query("SHOW TABLES");
console.log("=== TABLES ===");
console.table(tables);

// Check orders
const [orders] = await conn.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 20");
console.log("\n=== ALL ORDERS ===");
console.table(orders);

// Check behavior_events table name
for (const t of tables) {
  const name = Object.values(t)[0];
  if (name.includes('behav') || name.includes('event') || name.includes('view') || name.includes('quiz') || name.includes('email') || name.includes('lead')) {
    console.log(`\nTable: ${name}`);
    const [cols] = await conn.query(`DESCRIBE ${name}`);
    console.table(cols);
    const [count] = await conn.query(`SELECT COUNT(*) as cnt FROM ${name}`);
    console.log(`  Rows: ${count[0].cnt}`);
  }
}

await conn.end();
