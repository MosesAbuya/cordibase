const fs = require('fs');
let file = 'apps/web/src/app/dashboard/emailing/components/ContactPickerModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}
console.log('Fixed backslashes in Modal');
