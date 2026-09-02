const { neon } = require("@neondatabase/serverless");
const conn = neon("postgresql://neondb_owner:npg_mn98SBwtFEyG@ep-hidden-glitter-b1c09dzp-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require");
conn`SELECT logo_url, primary_color, company_name FROM document_template LIMIT 1`.then(rows => {
  console.log(JSON.stringify(rows, null, 2));
}).catch(e => console.error(e.message));
