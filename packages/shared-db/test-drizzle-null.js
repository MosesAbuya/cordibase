const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { transaction } = require('./dist/schema/accounting.js');
require('dotenv').config({ path: '../../.env' });
const crypto = require('crypto');

async function run() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    const orgId = '1bjfjMklsluxkUkBLYrFoSnFY7DpohVG';
    
    await db.insert(transaction).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      type: 'expense',
      amount: '10.00',
      description: 'Test Drizzle Null',
      currency: 'KES',
      date: new Date(),
      categoryId: null, // TEST THIS
      status: 'paid'
    });
    console.log("Drizzle Insert with NULL category_id SUCCESS!");
  } catch (err) {
    console.error("Insert failed:", err.message);
  }
}
run();
