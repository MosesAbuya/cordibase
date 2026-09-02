const fs = require('fs');

let sendFile = 'apps/web/src/app/api/emailing/send/route.ts';
let content = fs.readFileSync(sendFile, 'utf-8');

// Inject imports
if (!content.includes('buildBrandedEmail')) {
  content = content.replace('import { v4 as uuidv4 } from "uuid";', 'import { v4 as uuidv4 } from "uuid";\nimport { buildBrandedEmail } from "@/lib/emailing-helper";');
}

// Extract variables and attachments
content = content.replace(
  'const { accountId, to, subject, html } = await req.json();',
  'const { accountId, to, subject, html, attachments = [] } = await req.json();'
);

// Apply branded email and attachments
content = content.replace(
  'subject,\n      html,',
  'subject,\n      html: await buildBrandedEmail(html, orgId, account.id),\n      attachments: attachments.map((a: any) => ({ filename: a.filename, content: a.content, contentType: a.contentType, encoding: "base64" })),'
);

fs.writeFileSync(sendFile, content);

let bulkFile = 'apps/web/src/app/api/emailing/bulk/send/route.ts';
let bulkContent = fs.readFileSync(bulkFile, 'utf-8');

if (!bulkContent.includes('buildBrandedEmail')) {
  bulkContent = bulkContent.replace('import { v4 as uuidv4 } from "uuid";', 'import { v4 as uuidv4 } from "uuid";\nimport { buildBrandedEmail } from "@/lib/emailing-helper";');
}

bulkContent = bulkContent.replace(
  'const { accountId, to, subject, bodyHtml } = await req.json();',
  'const { accountId, to, subject, bodyHtml, attachments = [] } = await req.json();'
);

bulkContent = bulkContent.replace(
  'subject,\n          html: bodyHtml,',
  'subject,\n          html: await buildBrandedEmail(bodyHtml, orgId, account.id),\n          attachments: attachments.map((a: any) => ({ filename: a.filename, content: a.content, contentType: a.contentType, encoding: "base64" })),'
);

fs.writeFileSync(bulkFile, bulkContent);

console.log("API routes updated with attachments and branding");
