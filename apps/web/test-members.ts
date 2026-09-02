import { db } from '@/lib/db';
import { authSchema } from '@cordibase/shared-db';
import { eq } from 'drizzle-orm';
async function test() {
  const members = await db.select().from(authSchema.member);
  console.log('Members:', members.map(m => ({ orgId: m.organizationId, role: m.role })));
}
test();
