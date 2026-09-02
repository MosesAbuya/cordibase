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

    const { accountId, to, subject, bodyHtml, attachments = [] } = await req.json();

    const account = await db.query.emailAccount.findFirst({
      where: eq(emailAccount.id, accountId),
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ error: "No recipients specified" }, { status: 400 });
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

    // Build branded email once for all recipients
    const { html: brandedHtml, inlineAttachments } = await buildBrandedEmail(bodyHtml, orgId, account.id);

    // User-provided file attachments
    const fileAttachments = attachments.map((a: any) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
      encoding: "base64" as const,
    }));

    const allAttachments = [
      ...inlineAttachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
        encoding: a.encoding,
        cid: a.cid,
      })),
      ...fileAttachments,
    ];

    const results = [];
    const logs = [];

    for (const recipient of to) {
      try {
        const info = await transporter.sendMail({
          from: `"${account.fromName}" <${account.fromEmail}>`,
          to: recipient,
          subject,
          html: brandedHtml,
          attachments: allAttachments,
        });

        logs.push({
          id: uuidv4(),
          organizationId: orgId,
          emailAccountId: account.id,
          senderUserId: null,
          toEmail: recipient,
          subject,
          status: "SENT",
        });
        results.push({ email: recipient, success: true, messageId: info.messageId });
      } catch (err: any) {
        logs.push({
          id: uuidv4(),
          organizationId: orgId,
          emailAccountId: account.id,
          senderUserId: null,
          toEmail: recipient,
          subject,
          status: "FAILED",
        });
        results.push({ email: recipient, success: false, error: err.message });
      }
    }

    if (logs.length > 0) {
      await db.insert(emailLog).values(logs);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
