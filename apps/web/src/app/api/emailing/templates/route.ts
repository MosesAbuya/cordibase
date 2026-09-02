import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema } from "@cordibase/shared-db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const { emailTemplate } = emailingSchema;

export async function GET(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const templates = await db.query.emailTemplate.findMany({
      where: eq(emailTemplate.organizationId, orgId),
      orderBy: (emailTemplate, { desc }) => [desc(emailTemplate.createdAt)],
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const { name, subject, bodyHtml, aiInstructions, attachments = [] } = await req.json();

    if (!name || !subject || !bodyHtml) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTemplate = {
      id: uuidv4(),
      organizationId: orgId,
      name,
      subject,
      bodyHtml,
      aiInstructions,
    };

    await db.insert(emailTemplate).values(newTemplate);

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// rebuild