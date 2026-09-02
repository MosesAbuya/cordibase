require('dotenv').config({ path: '../../.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function drop() {
  try {
    await sql`DROP TABLE IF EXISTS customer CASCADE`;
    await sql`DROP TABLE IF EXISTS lead CASCADE`;
    console.log('Tables dropped');
  } catch (err) {
    console.error(err);
  }
}
drop();
