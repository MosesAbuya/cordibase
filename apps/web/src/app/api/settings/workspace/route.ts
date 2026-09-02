import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 400 });

    const settings = await db.query.workspaceSettings.findFirst({
        where: eq(schema.workspaceSettings.organizationId, orgId)
    });

    return NextResponse.json({ settings: settings || {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 400 });

    const body = await req.json();

    const existingSettings = await db.query.workspaceSettings.findFirst({
        where: eq(schema.workspaceSettings.organizationId, orgId)
    });

    if (existingSettings) {
        await db.update(schema.workspaceSettings)
            .set(body)
            .where(eq(schema.workspaceSettings.organizationId, orgId));
    } else {
        await db.insert(schema.workspaceSettings).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            ...body
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
