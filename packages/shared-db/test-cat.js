require('dotenv').config({ path: '../../.env' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql`SELECT id FROM transaction_category WHERE id LIKE 'default-%'`.then(res => {
  console.log(res);
  process.exit(0);
}).catch(console.error);
