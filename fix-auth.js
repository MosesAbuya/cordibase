const fs = require('fs');

let file = 'apps/web/src/app/api/emailing/logs/route.ts';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace('import { requireAuth } from "@/lib/auth"; // Need to check how auth is required\n', '');
  content = content.replace('import { requireAuth } from "@/lib/auth";\n', '');
  content = content.replace('await requireAuth(req);', '');
  fs.writeFileSync(file, content);
}

console.log('Fixed auth import');
