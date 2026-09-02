const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/api/billing/check-access/route.ts', 'utf8');
content = content.replace(/redirect: '\/dashboard\/billing'/g, "redirect: '/dashboard/settings/billing'");
fs.writeFileSync('apps/web/src/app/api/billing/check-access/route.ts', content);
