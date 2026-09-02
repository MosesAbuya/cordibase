import { createDbClient, schema } from '@cordibase/shared-db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkSessions() {
  const db = createDbClient(process.env.DATABASE_URL!);
  const sessions = await db.select().from(schema.session);
  console.log(sessions.map(s => ({ id: s.id, userId: s.userId, activeOrgId: s.activeOrganizationId })));
  process.exit(0);
}
checkSessions();
