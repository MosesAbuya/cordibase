import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authSchema } from "@cordibase/shared-db";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const authRes = await fetch('http://localhost:3001/api/auth/get-session', { headers: { cookie: cookieHeader } });
    const sessionData = await authRes.json();
    const userId = sessionData?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId, modules } = await req.json();
    if (!orgId) return NextResponse.json({ error: "Missing orgId" }, { status: 400 });

    await db.update(authSchema.member)
      .set({ modules })
      .where(and(eq(authSchema.member.userId, userId), eq(authSchema.member.organizationId, orgId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
