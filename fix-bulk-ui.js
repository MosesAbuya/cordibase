const fs = require('fs');

let file = 'apps/web/src/app/dashboard/emailing/bulk/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('<AttachmentPicker')) {
  content = content.replace(
    '<label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Message Body</label>',
    `<div className="mb-4">
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-2">Attachments</label>
              <AttachmentPicker 
                attachments={formData.attachments}
                onChange={(att) => setFormData({ ...formData, attachments: att })}
              />
            </div>
            <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Message Body</label>`
  );
  fs.writeFileSync(file, content);
  console.log("Fixed bulk/page.tsx attachments UI");
}
