const fs = require('fs');
let file = 'apps/web/src/app/dashboard/emailing/compose/page.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/react-quill/g, 'react-quill-new');
  fs.writeFileSync(file, content);
}
console.log('Fixed react-quill import');
