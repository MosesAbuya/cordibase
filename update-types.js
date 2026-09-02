const fs = require('fs');

let kbId = fs.readFileSync('apps/web/src/app/dashboard/crm/kb/[id]/page.tsx', 'utf8');
kbId = kbId.replace('category: string;', 'category: string;\n  contentType: "fact" | "procedure" | "troubleshooting" | "policy";');
fs.writeFileSync('apps/web/src/app/dashboard/crm/kb/[id]/page.tsx', kbId);

let kbPage = fs.readFileSync('apps/web/src/app/dashboard/crm/kb/page.tsx', 'utf8');
kbPage = kbPage.replace('category: string;', 'category: string;\n  contentType: "fact" | "procedure" | "troubleshooting" | "policy";\n  viewCount: number;\n  deflectionCount: number;');

kbPage = kbPage.replace('<th className="py-3 px-4 text-xs font-semibold text-[#667085] uppercase tracking-wider border-b border-[#EAECF0]">Category</th>', '<th className="py-3 px-4 text-xs font-semibold text-[#667085] uppercase tracking-wider border-b border-[#EAECF0]">Type</th><th className="py-3 px-4 text-xs font-semibold text-[#667085] uppercase tracking-wider border-b border-[#EAECF0]">Impact</th>');

kbPage = kbPage.replace('<td className="py-3 px-4">\n                      <span className="text-sm text-[#344054] px-2.5 py-1 bg-[#F2F4F7] rounded-md border border-[#EAECF0]">\n                        {a.category || "Uncategorized"}\n                      </span>\n                    </td>', 
\<td className="py-3 px-4">
                      <span className="text-sm text-[#344054] px-2.5 py-1 bg-[#F2F4F7] rounded-md border border-[#EAECF0] capitalize">
                        {a.contentType || "fact"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-[#667085]">
                        <div><span className="font-medium text-[#1D2939]">{a.viewCount || 0}</span> views</div>
                        <div className="text-[#027A48]"><span className="font-medium">{a.deflectionCount || 0}</span> deflections</div>
                      </div>
                    </td>\
);
fs.writeFileSync('apps/web/src/app/dashboard/crm/kb/page.tsx', kbPage);

let ticketPage = fs.readFileSync('apps/web/src/app/dashboard/crm/tickets/[id]/page.tsx', 'utf8');
ticketPage = ticketPage.replace('const res = await fetch(/api/crm/tickets/, {', 
\const payload = { ...ticket };
    const res = await fetch(\\\/api/crm/tickets/\\\\, {\);
ticketPage = ticketPage.replace('body: JSON.stringify(ticket)', 'body: JSON.stringify(payload)');

// Update KB update route to send contentType
let backend = fs.readFileSync('apps/service-crm/src/index.ts', 'utf8');
backend = backend.replace('category: body.category,', 'category: body.category,\n    contentType: body.contentType,');
backend = backend.replace('category: body.category || \'\',', 'category: body.category || \'\',\n    contentType: body.contentType || \'fact\',');
fs.writeFileSync('apps/service-crm/src/index.ts', backend);

console.log('done');
