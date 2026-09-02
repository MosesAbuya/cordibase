const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/crm/tickets/[id]/page.tsx', 'utf8');

content = content.replace(
  'const [replyText, setReplyText] = useState("");',
  `const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [queues, setQueues] = useState<any[]>([]);`
);

// Add queues fetch
content = content.replace(
  'const [ticketRes, msgsRes] = await Promise.all([',
  `const [ticketRes, msgsRes, queuesRes] = await Promise.all([`
);

content = content.replace(
  `fetch(\`/api/crm/tickets/\${ticketId}/messages\`, { headers: { 'x-org-id': orgId || '' } })`,
  `fetch(\`/api/crm/tickets/\${ticketId}/messages\`, { headers: { 'x-org-id': orgId || '' } }),
        fetch('/api/crm/queues', { headers: { 'x-org-id': orgId || '' } })`
);

content = content.replace(
  'setMessages(mData.messages || []);\n      }',
  `setMessages(mData.messages || []);\n      }\n      if (queuesRes.ok) {\n        const qData = await queuesRes.json();\n        setQueues(qData.queues || []);\n      }`
);

// Add internal note toggle UI
content = content.replace(
  'placeholder="Type your reply here..."',
  `placeholder={isInternal ? "Write an internal note..." : "Type your public reply here..."}\n                  className={\`w-full p-3 border rounded-lg text-sm focus:outline-none resize-none \${isInternal ? 'bg-[#FFFAEB] border-[#FEDF89] focus:ring-[#F79009]/20 focus:border-[#F79009]' : 'border-[#EAECF0] focus:ring-[#A83C2E]/20 focus:border-[#A83C2E]'}\`}`
);
content = content.replace(
  'className="w-full p-3 border border-[#EAECF0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-[#A83C2E] resize-none"',
  ''
);

content = content.replace(
  '<div className="flex justify-between items-center">',
  `<div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-[#344054] cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded border-[#D0D5DD] text-[#F79009] focus:ring-[#F79009]" />
                  Internal Note
                </label>`
);

content = content.replace(
  `JSON.stringify({ senderType: 'agent', bodyHtml: replyText })`,
  `JSON.stringify({ senderType: 'agent', bodyHtml: replyText, isInternal })`
);

// Add queue assignment UI to CRM Context Panel
const queueSelectHtml = `
          <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden p-5">
            <h3 className="font-medium text-[#1D2939] mb-3">Ticket Routing</h3>
            <label className="block text-sm font-medium text-[#344054] mb-1">Queue / Department</label>
            <select 
              value={ticket.queueId || ""}
              onChange={async (e) => {
                const newQueue = e.target.value;
                setTicket({...ticket, queueId: newQueue});
                const orgId = localStorage.getItem('cordibase_active_org');
                await fetch(\`/api/crm/tickets/\${ticketId}\`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
                  body: JSON.stringify({ queueId: newQueue })
                });
                modal.alert('Ticket reassigned successfully.', 'Reassigned');
              }}
              className="w-full p-2 border border-[#EAECF0] rounded-lg text-sm focus:outline-none bg-white mb-3"
            >
              <option value="">Unassigned</option>
              {queues.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </div>
`;
content = content.replace(
  '<div className="bg-gradient-to-br from-[#F9F5FF] to-[#F4EBFF]',
  queueSelectHtml + '\n          <div className="bg-gradient-to-br from-[#F9F5FF] to-[#F4EBFF]'
);

// Display internal note distinctively
content = content.replace(
  "msg.senderType === 'agent' ? 'bg-[#A83C2E] text-white rounded-tr-sm'",
  "msg.senderType === 'agent' ? (msg.isInternal ? 'bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] rounded-tr-sm' : 'bg-[#A83C2E] text-white rounded-tr-sm')"
);

fs.writeFileSync('apps/web/src/app/dashboard/crm/tickets/[id]/page.tsx', content);
console.log('Agent Workspace updated.');
