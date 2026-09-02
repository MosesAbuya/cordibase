const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/crm/tickets/[id]/page.tsx', 'utf8');
content = content.replace('createdAt: string;', 'createdAt: string;\n  queueId: string | null;');
fs.writeFileSync('apps/web/src/app/dashboard/crm/tickets/[id]/page.tsx', content);
