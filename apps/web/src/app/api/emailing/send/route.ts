import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema } from "@cordibase/shared-db";
const { emailAccount, emailLog } = emailingSchema;
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { buildBrandedEmail } from "@/lib/emailing-helper";

export async function POST(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const { accountId, to, subject, html, attachments = [] } = await req.json();

    const account = await db.query.emailAccount.findFirst({
      where: eq(emailAccount.id, accountId),
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpPort === 465,
      auth: {
        user: account.smtpUser,
        pass: account.smtpPassword,
      },
    });

    // Build branded email (returns html + inlineAttachments for logo CID)
    const { html: brandedHtml, inlineAttachments } = await buildBrandedEmail(html, orgId, account.id);

    // User-provided file attachments
    const fileAttachments = attachments.map((a: any) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
      encoding: "base64" as const,
    }));

    const info = await transporter.sendMail({
      from: `"${account.fromName}" <${account.fromEmail}>`,
      to,
      subject,
      html: brandedHtml,
      attachments: [
        // Inline logo (CID embedded)
        ...inlineAttachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
          encoding: a.encoding,
          cid: a.cid,
        })),
        // User file attachments
        ...fileAttachments,
      ],
    });

    const newLog = {
      id: uuidv4(),
      organizationId: orgId,
      emailAccountId: account.id,
      senderUserId: null,
      toEmail: to,
      subject,
      status: "SENT",
    };

    await db.insert(emailLog).values(newLog);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
