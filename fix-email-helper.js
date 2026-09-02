const fs = require('fs');
let file = 'apps/web/src/lib/emailing-helper.ts';
let content = `import { db } from "@/lib/db";
import { emailingSchema, accountingSchema } from "@cordibase/shared-db";
const { emailSettings, emailAccount } = emailingSchema;
const { documentTemplate } = accountingSchema;
import { eq, and } from "drizzle-orm";

export async function buildBrandedEmail(htmlContent: string, orgId: string, accountId?: string) {
  // 1. Fetch Branding
  const branding = await db.query.documentTemplate.findFirst({
    where: eq(documentTemplate.organizationId, orgId)
  });

  const logoUrl = branding?.logoUrl || "";
  const primaryColor = branding?.primaryColor || "#1D2939"; // default dark
  const companyName = branding?.companyName || "Our Company";

  // 2. Fetch Signatures
  let signature = "";
  if (accountId) {
    const account = await db.query.emailAccount.findFirst({
      where: eq(emailAccount.id, accountId)
    });
    if (account?.signatureHtml) {
      signature = account.signatureHtml;
    }
  }

  if (!signature) {
    // Fallback to global setting
    const globalSettings = await db.query.emailSettings.findFirst({
      where: eq(emailSettings.organizationId, orgId)
    });
    if (globalSettings?.defaultSignatureHtml) {
      signature = globalSettings.defaultSignatureHtml;
    }
  }

  // 3. Construct Branded HTML
  const headerHtml = logoUrl 
    ? \`<div style="padding: 20px 0; border-bottom: 2px solid \${primaryColor}; margin-bottom: 20px; text-align: left;">
         <img src="\${logoUrl}" alt="\${companyName}" style="max-height: 50px; max-width: 200px;" />
       </div>\`
    : \`<div style="padding: 20px 0; border-bottom: 2px solid \${primaryColor}; margin-bottom: 20px; text-align: left;">
         <h2 style="color: \${primaryColor}; margin: 0;">\${companyName}</h2>
       </div>\`;

  const signatureHtml = signature 
    ? \`<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #EAECF0;">
         \${signature}
       </div>\`
    : "";

  return \`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1D2939; line-height: 1.6; }
          .email-container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        </style>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #F9FAFB;">
        <div class="email-container" style="border: 1px solid #EAECF0; border-radius: 8px;">
          \${headerHtml}
          
          <div style="font-size: 15px; color: #344054;">
            \${htmlContent}
          </div>

          \${signatureHtml}
        </div>
      </body>
    </html>
  \`;
}
`;
fs.writeFileSync(file, content.replace(/\\`/g, '`').replace(/\\\$/g, '$'));
console.log("Email helper created");
