import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema, authSchema } from "@cordibase/shared-db";
const { emailAccount } = emailingSchema;
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const cookieHeader = req.headers.get('cookie') || '';
    const authRes = await fetch('http://localhost:3001/api/auth/get-session', { headers: { cookie: cookieHeader } });
    const sessionData = await authRes.json();
    const userId = sessionData?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await db.query.member.findFirst({
        where: and(eq(authSchema.member.userId, userId), eq(authSchema.member.organizationId, orgId))
    });

    if (!member || (member.role !== 'admin' && member.role !== 'owner')) {
        return NextResponse.json({ error: "Forbidden: Only admins can manage default SMTP settings." }, { status: 403 });
    }

    const body = await req.json();
    const { accountId } = body;
    
    if (!accountId) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

    // Unset all global flags for the org
    await db.update(emailAccount)
      .set({ isGlobal: false })
      .where(eq(emailAccount.organizationId, orgId));

    // Set the selected account as global
    await db.update(emailAccount)
      .set({ isGlobal: true })
      .where(and(eq(emailAccount.id, accountId), eq(emailAccount.organizationId, orgId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
