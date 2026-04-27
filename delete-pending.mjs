import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [result] = await connection.execute('DELETE FROM orders WHERE status = ?', ['pending']);
console.log(`Deleted ${result.affectedRows} pending orders`);
await connection.end();
