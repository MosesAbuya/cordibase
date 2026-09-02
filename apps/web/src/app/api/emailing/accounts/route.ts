import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema, authSchema } from "@cordibase/shared-db";
const { emailAccount, emailAccountAccess } = emailingSchema;
import { eq, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const authRes = await fetch("http://localhost:3001/api/auth/get-session", {
      headers: { cookie: cookieHeader }
    });
    const sessionData = await authRes.json();
    const userId = sessionData?.user?.id;
    
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const memberRows = await db.select().from(authSchema.member).where(and(eq(authSchema.member.userId, userId), eq(authSchema.member.organizationId, orgId))).limit(1);
    const role = memberRows[0]?.role;
    const isAdmin = role === 'admin' || role === 'owner';

    let accounts: any[] = [];

    if (isAdmin) {
      accounts = await db.query.emailAccount.findMany({
        where: eq(emailAccount.organizationId, orgId),
      });
      for (const acc of accounts) {
        const accesses = await db.select().from(emailAccountAccess).where(eq(emailAccountAccess.emailAccountId, acc.id));
        (acc as any).assignedUserIds = accesses.map(a => a.userId);
      }
    } else {
      const accesses = await db.select().from(emailAccountAccess).where(eq(emailAccountAccess.userId, userId));
      const accIds = accesses.map(a => a.emailAccountId);
      
      if (accIds.length > 0) {
        accounts = await db.query.emailAccount.findMany({
          where: and(eq(emailAccount.organizationId, orgId), inArray(emailAccount.id, accIds))
        });
      }
    }

    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const authRes = await fetch("http://localhost:3001/api/auth/get-session", {
      headers: { cookie: cookieHeader }
    });
    const sessionData = await authRes.json();
    const userId = sessionData?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const newAccountId = uuidv4();
    const newAccount = {
      id: newAccountId,
      organizationId: orgId,
      name: body.name,
      fromName: body.fromName,
      fromEmail: body.fromEmail,
      smtpHost: body.smtpHost,
      smtpPort: parseInt(body.smtpPort, 10),
      smtpUser: body.smtpUser,
      smtpPassword: body.smtpPassword,
    };
    
    await db.insert(emailAccount).values(newAccount);

    let finalUserIds = Array.isArray(body.assignedUserIds) ? body.assignedUserIds : [];
    if (!finalUserIds.includes(userId)) {
      finalUserIds.push(userId);
    }

    for (const uId of finalUserIds) {
      await db.insert(emailAccountAccess).values({
        id: uuidv4(),
        emailAccountId: newAccountId,
        userId: uId
      });
    }

    return NextResponse.json({ account: { ...newAccount, assignedUserIds: finalUserIds } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
