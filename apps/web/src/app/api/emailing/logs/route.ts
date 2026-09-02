import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema } from "@cordibase/shared-db";
const { emailLog } = emailingSchema;
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const logs = await db.query.emailLog.findMany({
      where: eq(emailLog.organizationId, orgId),
      orderBy: [desc(emailLog.sentAt)],
      limit: 50,
    });
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
