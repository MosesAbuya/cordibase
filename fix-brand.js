const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/accounting/branding/page.tsx', 'utf-8');

const replacement = `
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Company Motto / Tagline</label>
                    <input type="text" value={form.companyTagline} onChange={e => setForm({...form, companyTagline: e.target.value})} className="w-full px-3 py-2 border border-[#EAECF0] dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-[#A83C2E]" placeholder="e.g. Digital Innovation & Media Solutions" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">`;

content = content.replace('<div className="grid grid-cols-2 gap-4">', replacement);

content = content.replace('.watermark { position: absolute; left: -5mm; bottom: 5mm; width: 120mm; height: 120mm; opacity: 0.15;', '.watermark { position: absolute; left: -30mm; bottom: -30mm; width: 180mm; height: 180mm; opacity: 0.15;');
content = content.replace('transform: rotate(-18deg); z-index: 1;', 'transform: rotate(35deg); z-index: 1;');
content = content.replace('.stamp { position: absolute;', '.stamp { text-transform: uppercase; position: absolute;');

const oldStampHtml = `  <div class="stamp">
    <div class="stamp-title">\${form.companyName || 'Company Name'}</div>
    \${form.companyPoBox ? "<div class='stamp-line'>" + form.companyPoBox + "</div>" : ''}
    \${form.companyCity ? "<div class='stamp-line'>" + form.companyCity + "</div>" : ''}
    <div class="stamp-date">12/01/2024</div>
  </div>`;
  
const newStampHtml = `  <div class="stamp">
    <div class="stamp-title">\${form.companyName || 'Company Name'}</div>
    \${form.companyPoBox ? "<div class='stamp-line'>P.O BOX " + form.companyPoBox + "</div>" : ''}
    \${form.companyCity ? "<div class='stamp-line'>" + form.companyCity + " - KENYA</div>" : ''}
    <div class="stamp-date">27/08/2026</div>
    <div class="stamp-sign" style="font-size: 10pt; margin-top: 2mm;">SIGN ................................</div>
  </div>`;
  
content = content.replace(oldStampHtml, newStampHtml);
fs.writeFileSync('apps/web/src/app/dashboard/accounting/branding/page.tsx', content);
