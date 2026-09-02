import { createDbClient } from "@cordibase/shared-db";
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_mn98SBwtFEyG@ep-hidden-glitter-b1c09dzp-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require";
export const db = createDbClient(connectionString);
