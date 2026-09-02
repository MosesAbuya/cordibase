const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Creating accounting tables...");

  await client.query(`
    CREATE TABLE IF NOT EXISTS "invoice" (
      "id" varchar(255) PRIMARY KEY,
      "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
      "customer_id" text NOT NULL REFERENCES "customer"("id") ON DELETE RESTRICT,
      "invoice_number" varchar(50) NOT NULL,
      "status" varchar(20) NOT NULL DEFAULT 'draft',
      "issue_date" timestamp NOT NULL DEFAULT now(),
      "due_date" timestamp NOT NULL,
      "subtotal" numeric(12, 2) NOT NULL DEFAULT '0',
      "tax_total" numeric(12, 2) NOT NULL DEFAULT '0',
      "total" numeric(12, 2) NOT NULL DEFAULT '0',
      "notes" text,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS "invoice_item" (
      "id" varchar(255) PRIMARY KEY,
      "invoice_id" varchar(255) NOT NULL REFERENCES "invoice"("id") ON DELETE CASCADE,
      "description" text NOT NULL,
      "quantity" numeric(10, 2) NOT NULL DEFAULT '1',
      "unit_price" numeric(12, 2) NOT NULL DEFAULT '0',
      "amount" numeric(12, 2) NOT NULL DEFAULT '0'
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS "payment" (
      "id" varchar(255) PRIMARY KEY,
      "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
      "invoice_id" varchar(255) NOT NULL REFERENCES "invoice"("id") ON DELETE CASCADE,
      "amount" numeric(12, 2) NOT NULL,
      "payment_date" timestamp NOT NULL DEFAULT now(),
      "payment_method" varchar(50),
      "reference" varchar(255),
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  console.log("Accounting tables created successfully.");
  await client.end();
}

run().catch(console.error);
