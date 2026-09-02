require('dotenv').config({ path: '../../.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function drop() {
  try {
    await sql`DROP TABLE IF EXISTS deal CASCADE`;
    await sql`DROP TABLE IF EXISTS deal_contact_role CASCADE`;
    await sql`DROP TABLE IF EXISTS contact_company_role CASCADE`;
    console.log('Tables dropped');
  } catch (err) {
    console.error(err);
  }
}
drop();
