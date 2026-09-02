import { createDbClient, schema } from '@cordibase/shared-db';
import dotenv from 'dotenv';
import path from 'path';
import { eq } from 'drizzle-orm';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function forceFix() {
  const db = createDbClient(process.env.DATABASE_URL!);
  
  // Find an active organization ID
  const sessions = await db.select().from(schema.session);
  const activeSession = sessions.find(s => s.activeOrganizationId);
  
  if (activeSession) {
    console.log(`Forcing activeOrgId ${activeSession.activeOrganizationId} on all sessions...`);
    await db.update(schema.session).set({ activeOrganizationId: activeSession.activeOrganizationId });
    console.log("Done!");
  } else {
    console.log("No active organization found in any session!");
  }
  process.exit(0);
}
forceFix();
