const fs = require('fs');
let file = 'apps/web/src/app/dashboard/emailing/components/AttachmentPicker.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  'className="inline-flex items-center gap-2 text-sm text-[#475467] dark:text-slate-400 hover:text-[#1D2939] dark:hover:text-slate-200 cursor-pointer transition-colors"',
  'className="inline-flex items-center gap-2 text-sm bg-white dark:bg-slate-800 border border-[#D0D5DD] dark:border-slate-600 px-4 py-2 rounded-md text-[#344054] dark:text-slate-300 hover:bg-[#F9FAFB] dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm font-medium"'
);

fs.writeFileSync(file, content);
console.log("Updated AttachmentPicker styling");
