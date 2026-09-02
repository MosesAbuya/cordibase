import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema } from "@cordibase/shared-db";
const { emailSettings } = emailingSchema;
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 401 });

    let settings = await db.query.emailSettings.findFirst({
      where: eq(emailSettings.organizationId, orgId)
    });

    if (!settings) {
      settings = {
        id: uuidv4(),
        organizationId: orgId,
        defaultSignatureHtml: "",
        updatedAt: new Date(),
      };
      await db.insert(emailSettings).values(settings);
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing org" }, { status: 401 });

    const body = await req.json();

    await db.update(emailSettings)
      .set({
        defaultSignatureHtml: body.defaultSignatureHtml,
        updatedAt: new Date(),
      })
      .where(eq(emailSettings.organizationId, orgId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// rebuild 2
