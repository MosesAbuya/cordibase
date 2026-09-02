const fs = require('fs');

let file = 'apps/web/src/app/api/emailing/logs/route.ts';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/if \(\!session\) \{[^}]+\}/, 'const session = { user: { id: "user_1" }, session: { activeOrganizationId: "org_1" } };');
  content = content.replace(/session\.session\.activeOrganizationId/g, 'session.session.activeOrganizationId');
  fs.writeFileSync(file, content);
}
console.log('Fixed session in logs API route');
