import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authSchema } from "@cordibase/shared-db";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { inviteId, modules } = await req.json();
    if (!inviteId) return NextResponse.json({ error: "Missing inviteId" }, { status: 400 });

    await db.update(authSchema.invitation)
      .set({ modules })
      .where(eq(authSchema.invitation.id, inviteId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
