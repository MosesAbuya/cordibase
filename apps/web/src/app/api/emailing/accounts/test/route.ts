import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailingSchema } from "@cordibase/shared-db";
const { emailAccount } = emailingSchema;
import { eq, and } from "drizzle-orm";
import nodemailer from "nodemailer";
import { buildBrandedEmail } from "@/lib/emailing-helper";

export async function POST(req: Request) {
  try {
    const orgId = req.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Missing organization" }, { status: 401 });

    const { accountId, testEmail } = await req.json();
    if (!accountId || !testEmail) {
      return NextResponse.json({ error: "Account and test email are required" }, { status: 400 });
    }

    const account = await db.query.emailAccount.findFirst({
      where: and(eq(emailAccount.id, accountId), eq(emailAccount.organizationId, orgId)),
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

    // Verify connection first
    await transporter.verify();

    const now = new Date().toLocaleString("en-US", { timeZone: "UTC", dateStyle: "full", timeStyle: "medium" });

    const testBody = `
      <h2 style="margin:0 0 12px;font-size:20px;color:#1D2939;">✅ SMTP Connection Successful</h2>
      <p style="margin:0 0 24px;color:#475467;font-size:15px;">
        This is a test email sent from Cordibase to confirm your SMTP settings are working correctly.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#344054;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F2F4F7;width:40%;font-weight:600;">Account Name</td>
          <td style="padding:10px 0;border-bottom:1px solid #F2F4F7;">${account.name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F2F4F7;font-weight:600;">Sent From</td>
          <td style="padding:10px 0;border-bottom:1px solid #F2F4F7;">${account.fromEmail}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #F2F4F7;font-weight:600;">SMTP Host</td>
          <td style="padding:10px 0;border-bottom:1px solid #F2F4F7;">${account.smtpHost}:${account.smtpPort}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-weight:600;">Sent At</td>
          <td style="padding:10px 0;">${now} UTC</td>
        </tr>
      </table>
    `;

    const { html: brandedHtml, inlineAttachments } = await buildBrandedEmail(testBody, orgId, account.id);

    await transporter.sendMail({
      from: `"${account.fromName}" <${account.fromEmail}>`,
      to: testEmail,
      subject: "✅ SMTP Test — Cordibase Emailing",
      html: brandedHtml,
      attachments: inlineAttachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
        encoding: a.encoding,
        cid: a.cid,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testEmail} via ${account.smtpHost}:${account.smtpPort}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
