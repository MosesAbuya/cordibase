import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authSchema } from "@cordibase/shared-db";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const authRes = await fetch('http://localhost:3001/api/auth/get-session', { headers: { cookie: cookieHeader } });
    const sessionData = await authRes.json();
    const requesterId = sessionData?.user?.id;
    if (!requesterId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orgId, targetUserId, modules, role } = await req.json();
    if (!orgId || !targetUserId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    // Check if requester is admin/owner
    const requesterMembership = await db.query.member.findFirst({
        where: and(eq(authSchema.member.userId, requesterId), eq(authSchema.member.organizationId, orgId))
    });

    if (!requesterMembership || (requesterMembership.role !== 'admin' && requesterMembership.role !== 'owner')) {
        return NextResponse.json({ error: "Forbidden: Only admins can manage member permissions." }, { status: 403 });
    }

    const updates: any = {};
    if (modules !== undefined) updates.modules = modules;
    if (role !== undefined) updates.role = role;

    if (Object.keys(updates).length > 0) {
        await db.update(authSchema.member)
            .set(updates)
            .where(and(eq(authSchema.member.userId, targetUserId), eq(authSchema.member.organizationId, orgId)));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
