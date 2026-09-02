const fs = require('fs');

let file = 'apps/web/src/app/dashboard/emailing/templates/new/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('import AttachmentPicker')) {
  // Add import
  content = content.replace(
    'import "react-quill-new/dist/quill.snow.css";',
    'import "react-quill-new/dist/quill.snow.css";\nimport AttachmentPicker, { Attachment } from "../../components/AttachmentPicker";'
  );
  
  // Add attachments to formData
  content = content.replace(
    'aiInstructions: "",',
    'aiInstructions: "",\n    attachments: [] as Attachment[],'
  );

  // Inject UI right before bodyHtml section
  content = content.replace(
    '<div>\n              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Email Body</label>',
    `<div className="mb-4">
                <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-2">Template Attachments</label>
                <AttachmentPicker 
                  attachments={formData.attachments}
                  onChange={(att) => setFormData({ ...formData, attachments: att })}
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Email Body</label>`
  );

  fs.writeFileSync(file, content);
  console.log("Updated templates/new/page.tsx");
} else {
  console.log("templates/new/page.tsx already updated");
}
