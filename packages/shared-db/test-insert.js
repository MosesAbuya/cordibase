require('dotenv').config({ path: '../../.env' });
const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    const orgId = '1bjfjMklsluxkUkBLYrFoSnFY7DpohVG';
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO transaction (id, organization_id, type, amount, description, currency, date, category_id, status)
      VALUES (${id}, ${orgId}, 'expense', 10.00, 'Test', 'KES', NOW(), NULL, 'paid')
    `;
    console.log("Insert with NULL category_id SUCCESS!");
  } catch (err) {
    console.error("Insert failed:", err.message);
  }
}
run();
