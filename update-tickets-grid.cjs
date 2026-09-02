const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/crm/tickets/page.tsx', 'utf8');

const modalImport = `import { useModal } from "@/components/ModalProvider";`;
if (!content.includes('useModal')) {
    content = content.replace('import { useState, useEffect } from "react";', `import { useState, useEffect } from "react";\n${modalImport}`);
}

const embedCode = `
  const modal = useModal();
  const orgId = typeof window !== 'undefined' ? localStorage.getItem('cordibase_active_org') : null;
  
  const showEmbedCode = () => {
    const embedStr = \`<iframe src="https://\${window.location.host}/widget/support/\${orgId}" width="400" height="600" frameborder="0"></iframe>\`;
    modal.prompt(
      'Embed Support Widget',
      'Copy the following HTML to embed the ticketing form on your website:',
      embedStr
    );
  };
`;

if (!content.includes('showEmbedCode')) {
    // Add inside component
    content = content.replace('const [searchTerm, setSearchTerm] = useState("");', `${embedCode}\n  const [searchTerm, setSearchTerm] = useState("");`);
    
    // Add button next to "New Ticket"
    content = content.replace(
        '<button className="flex items-center gap-2 bg-[#1D2939] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#101828] transition-colors">',
        `<button onClick={showEmbedCode} className="flex items-center gap-2 bg-white border border-[#D0D5DD] text-[#344054] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F9FAFB] transition-colors mr-2">
            Get Embed Code
          </button>\n          <button className="flex items-center gap-2 bg-[#1D2939] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#101828] transition-colors">`
    );
    
    fs.writeFileSync('apps/web/src/app/dashboard/crm/tickets/page.tsx', content);
    console.log('Tickets grid updated with embed code button');
} else {
    console.log('Already updated');
}
