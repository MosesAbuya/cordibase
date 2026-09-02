const { neon } = require("@neondatabase/serverless");
const conn = neon("postgresql://neondb_owner:npg_mn98SBwtFEyG@ep-hidden-glitter-b1c09dzp-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require");
conn`SELECT substring(logo_url, 1, 60) as logo_prefix FROM document_template LIMIT 1`.then(rows => {
  console.log("logo prefix:", rows[0]?.logo_prefix);
}).catch(e => console.error(e.message));
