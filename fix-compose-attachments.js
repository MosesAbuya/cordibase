const fs = require('fs');

let file = 'apps/web/src/app/dashboard/emailing/compose/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('import AttachmentPicker')) {
  // Add import
  content = content.replace(
    'import ContactPickerModal from "../components/ContactPickerModal";',
    'import ContactPickerModal from "../components/ContactPickerModal";\nimport AttachmentPicker, { Attachment } from "../components/AttachmentPicker";'
  );
  
  // Add attachments to formData
  content = content.replace(
    'html: "",',
    'html: "",\n    attachments: [] as Attachment[],'
  );

  // Add picker UI
  content = content.replace(
    '<div className="flex-1 flex flex-col min-h-[300px]">',
    `<div className="pb-4">
                <AttachmentPicker 
                  attachments={formData.attachments}
                  onChange={(att) => setFormData({ ...formData, attachments: att })}
                />
              </div>
              <div className="flex-1 flex flex-col min-h-[300px]">`
  );
  
  fs.writeFileSync(file, content);
  console.log("Updated compose/page.tsx");
} else {
  console.log("compose/page.tsx already has AttachmentPicker");
}

