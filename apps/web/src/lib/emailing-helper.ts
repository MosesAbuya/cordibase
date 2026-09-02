import { db } from "@/lib/db";
import { emailingSchema, accountingSchema } from "@cordibase/shared-db";
const { emailSettings, emailAccount } = emailingSchema;
const { documentTemplate } = accountingSchema;
import { eq } from "drizzle-orm";

export type MailAttachment = {
  filename: string;
  content: string;
  contentType: string;
  encoding: "base64";
  cid?: string;
};

export type BrandedEmailResult = {
  html: string;
  inlineAttachments: MailAttachment[];
};

export async function buildBrandedEmail(
  htmlContent: string,
  orgId: string,
  accountId?: string
): Promise<BrandedEmailResult> {
  // 1. Fetch Branding
  const branding = await db.query.documentTemplate.findFirst({
    where: eq(documentTemplate.organizationId, orgId),
  });

  const primaryColor = branding?.primaryColor || "#A83C2E";
  const accentColor = branding?.accentColor || "#1D2939";
  const companyName = branding?.companyName || "Our Company";
  const rawLogoUrl = branding?.logoUrl || "";

  // 2. Fetch Signatures
  let signature = "";
  if (accountId) {
    const account = await db.query.emailAccount.findFirst({
      where: eq(emailAccount.id, accountId),
    });
    if (account?.signatureHtml) {
      signature = account.signatureHtml;
    }
  }

  if (!signature) {
    const globalSettings = await db.query.emailSettings.findFirst({
      where: eq(emailSettings.organizationId, orgId),
    });
    if (globalSettings?.defaultSignatureHtml) {
      signature = globalSettings.defaultSignatureHtml;
    }
  }

  // 3. Handle logo — if it's a data URI, extract base64 and embed as CID inline attachment
  const inlineAttachments: MailAttachment[] = [];
  let logoHtml = "";

  if (rawLogoUrl) {
    const dataUriMatch = rawLogoUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUriMatch) {
      const contentType = dataUriMatch[1];
      const base64Data = dataUriMatch[2];
      const ext = contentType.split("/")[1] || "png";
      const cid = `company-logo@cordibase`;

      inlineAttachments.push({
        filename: `logo.${ext}`,
        content: base64Data,
        contentType,
        encoding: "base64",
        cid,
      });

      logoHtml = `<img src="cid:${cid}" alt="${companyName}" style="max-height:56px; max-width:220px; display:block;" />`;
    } else if (rawLogoUrl.startsWith("http://") || rawLogoUrl.startsWith("https://")) {
      // Regular URL — use directly
      logoHtml = `<img src="${rawLogoUrl}" alt="${companyName}" style="max-height:56px; max-width:220px; display:block;" />`;
    }
  }

  // 4. Signature block
  const signatureBlock = signature
    ? `
    <tr>
      <td style="padding:24px 40px 0; border-top:1px solid #E4E7EC;">
        <div style="font-size:13px; color:#667085; line-height:1.6;">
          ${signature}
        </div>
      </td>
    </tr>`
    : "";

  // 5. Build final branded HTML (table-based for maximum email client compatibility)
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${companyName}</title>
</head>
<body style="margin:0;padding:0;background-color:#F2F4F7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <!--[if mso]><table width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F2F4F7;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);">

          <!-- Header bar with brand color -->
          <tr>
            <td style="background-color:${primaryColor};padding:0;height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo row -->
          <tr>
            <td style="padding:28px 40px 20px;background-color:#ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    ${logoHtml ||
                      `<span style="font-size:22px;font-weight:700;color:${accentColor};letter-spacing:-0.5px;">${companyName}</span>`
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:2px solid ${primaryColor};margin:0;opacity:0.25;" />
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:32px 40px;color:#1D2939;font-size:15px;line-height:1.7;">
              ${htmlContent}
            </td>
          </tr>

          ${signatureBlock}

          <!-- Footer -->
          <tr>
            <td style="background-color:#F9FAFB;padding:20px 40px;border-top:1px solid #E4E7EC;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:12px;color:#98A2B3;line-height:1.5;">
                    &copy; ${new Date().getFullYear()} <strong style="color:${primaryColor};">${companyName}</strong>. All rights reserved.
                    <br />This email was sent via <a href="#" style="color:${primaryColor};text-decoration:none;">Cordibase</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom accent bar -->
          <tr>
            <td style="background-color:${primaryColor};padding:0;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
        <!-- /Card container -->

      </td>
    </tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;

  return { html, inlineAttachments };
}
