import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema } from "@cordibase/shared-db";
const { emailAccount, emailAccountAccess } = emailingSchema;
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const { id } = await context.params;
    const body = await req.json();

    await db
      .update(emailAccount)
      .set({
        name: body.name,
        fromName: body.fromName,
        fromEmail: body.fromEmail,
        smtpHost: body.smtpHost,
        smtpPort: parseInt(body.smtpPort, 10),
        smtpUser: body.smtpUser,
        ...(body.smtpPassword ? { smtpPassword: body.smtpPassword } : {}),
      })
      .where(and(eq(emailAccount.id, id), eq(emailAccount.organizationId, orgId)));

    if (Array.isArray(body.assignedUserIds)) {
      await db.delete(emailAccountAccess).where(eq(emailAccountAccess.emailAccountId, id));
      for (const uId of body.assignedUserIds) {
        await db.insert(emailAccountAccess).values({
          id: uuidv4(),
          emailAccountId: id,
          userId: uId
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT account error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const { id } = await context.params;

    await db
      .delete(emailAccount)
      .where(and(eq(emailAccount.id, id), eq(emailAccount.organizationId, orgId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
