const fs = require('fs');
let code = fs.readFileSync('apps/web/src/app/invite/[id]/page.tsx', 'utf-8');
// Fix UTF-16 BOM if present
if (code.charCodeAt(0) === 0xFEFF || code.charCodeAt(0) === 0xFFFE) {
  code = code.slice(1);
}
code = code.replace(/fetch\\(\\\\/api\\/invitations\\/\\\\\\)/, 'fetch(/api/invitations/\)');
fs.writeFileSync('apps/web/src/app/invite/[id]/page.tsx', code, 'utf-8');
console.log('Fixed');
