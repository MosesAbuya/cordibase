import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Mock unsubscribing by updating onboardingStatus to 'canceled'
    await db.update(schema.organization)
      .set({ onboardingStatus: 'canceled' })
      .where(eq(schema.organization.id, orgId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
