const fs = require('fs');

let file = 'apps/web/src/app/dashboard/emailing/bulk/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('import AttachmentPicker')) {
  // Add import
  content = content.replace(
    'import ContactPickerModal from "../components/ContactPickerModal";',
    'import ContactPickerModal from "../components/ContactPickerModal";\nimport AttachmentPicker, { Attachment } from "../components/AttachmentPicker";'
  );
  
  // Add attachments to formData
  content = content.replace(
    'templateId: "",',
    'templateId: "",\n    attachments: [] as Attachment[],'
  );

  // Inject UI right before Send button section
  content = content.replace(
    '<div className="pt-2">',
    `<div className="pt-2">
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-2">Additional Attachments</label>
              <AttachmentPicker 
                attachments={formData.attachments}
                onChange={(att) => setFormData({ ...formData, attachments: att })}
              />
            </div>
            <div className="pt-2">`
  );

  fs.writeFileSync(file, content);
  console.log("Updated bulk/page.tsx");
} else {
  console.log("bulk/page.tsx already updated");
}

