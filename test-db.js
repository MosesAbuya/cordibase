require('dotenv').config();
const { createDbClient, authSchema } = require('./packages/shared-db/dist/index.js');
const db = createDbClient(process.env.DATABASE_URL);
db.select().from(authSchema.member).then(res => {
  console.log('Members:', res);
  process.exit(0);
});
