const fs = require('fs');

function updateTemplate(content, isFrontend) {
  content = content.replace('.meta-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 9mm; }', '');
  content = content.replace('.header { display: flex; justify-content: space-between; align-items: flex-start; }', '.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 5mm; margin-bottom: 2mm; }');
  content = content.replace('.quote-title { position: absolute; left: 50%; transform: translateX(-50%); margin-top: -2mm; font-size: 22pt; font-weight: 700; letter-spacing: 0.5px; }', '.quote-title { text-align: center; font-size: 22pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2mm; color: #1a1a1a; }');
  content = content.replace('.watermark { position: absolute; left: -30mm; bottom: -30mm; width: 180mm; height: 180mm; opacity: 0.15; transform: rotate(35deg); z-index: 1; pointer-events: none; }', '.watermark { position: absolute; left: -10mm; bottom: -10mm; width: 90mm; height: 90mm; opacity: 0.15; transform: rotate(35deg); z-index: 1; pointer-events: none; }');
  const stampPattern = /\.stamp \{ text-transform: uppercase; position: absolute; right: 8mm; bottom: 45mm; width: 62mm; border: 1\.5px solid [^;]+; border-radius: 3px; padding: 4mm 5mm; transform: rotate\(-6deg\); color: [^;]+; text-align: center; line-height: 1\.5; \}/;
  content = content.replace(stampPattern, '.stamp { text-transform: uppercase; position: absolute; right: 8mm; bottom: 45mm; width: 62mm; border: 1.5px solid #0055CC; border-radius: 3px; padding: 4mm 5mm; transform: rotate(-6deg); color: #0055CC; text-align: center; line-height: 1.5; }');

  const startIdx = content.indexOf('    <div class="header">');
  const endIdx = content.indexOf('    <hr class="rule">') + '    <hr class="rule">'.length;
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    if (isFrontend) {
      const newHtml = [
'    <div class="header">',
'      <div class="brand" style="flex: 1.2;">',
'        ${form.logoUrl ? "<div class=\'logo-box\'>" + logoTag + "</div>" : \'\'}',
'        <div class="brand-text">',
'          <p class="company-name">${form.companyName || \'Company Name\'}</p>',
'          ${form.companyTagline ? "<p class=\'tagline\'>" + form.companyTagline + "</p>" : \'\'}',
'        </div>',
'      </div>',
'      <div class="to-block" style="flex: 1;">',
'        <span class="label">To</span><br>',
'        <span class="bold">Client Name,</span><br>',
'        <span class="bold">Specification:</span> Standard Request',
'      </div>',
'      <div class="contact-and-date" style="flex: 1; text-align: right;">',
'        <div class="contact-block">',
'          ${form.companyPhone ? "<div>" + form.companyPhone + "</div>" : \'\'}',
'          ${form.companyWebsite ? "<div>" + form.companyWebsite + "</div>" : \'\'}',
'          ${form.companyEmail ? "<div><a href=\'mailto:" + form.companyEmail + "\'>" + form.companyEmail + "</a></div>" : \'\'}',
'          ${form.companyPoBox ? "<div>P.O Box " + form.companyPoBox + "</div>" : \'\'}',
'          ${form.companyCity ? "<div>" + form.companyCity + "</div>" : \'\'}',
'        </div>',
'        <div class="date-block" style="margin-top: 5mm;">',
'          <span class="label">Date</span><br>',
'          <span class="date-value">12 Jan 2024</span>',
'        </div>',
'      </div>',
'    </div>',
'    <div class="quote-title">Quotation</div>',
'    <hr class="rule">'
      ].join('\n');
      content = content.substring(0, startIdx) + newHtml + content.substring(endIdx);
    } else {
      const newHtml = [
'    <div class="header">',
'      <div class="brand" style="flex: 1.2;">',
'        ${t.logoUrl ? `<div class="logo-box">${logoTag}</div>` : \'\'}',
'        <div class="brand-text">',
'          <p class="company-name">${t.companyName || \'\'}</p>',
'          ${t.companyTagline ? `<p class="tagline">${t.companyTagline}</p>` : \'\'}',
'        </div>',
'      </div>',
'      <div class="to-block" style="flex: 1;">',
'        <span class="label">To</span><br>',
'        <span class="bold">${doc.clientName},</span><br>',
'        ${doc.clientCo ? `${doc.clientCo}<br>` : \'\'}',
'        ${doc.clientSpec ? `<span class="bold">Specification:</span> ${doc.clientSpec}` : \'\'}',
'      </div>',
'      <div class="contact-and-date" style="flex: 1; text-align: right;">',
'        <div class="contact-block">',
'          ${t.companyPhone ? `<div>${t.companyPhone}</div>` : \'\'}',
'          ${t.companyWebsite ? `<div>${t.companyWebsite}</div>` : \'\'}',
'          ${t.companyEmail ? `<div><a href="mailto:${t.companyEmail}">${t.companyEmail}</a></div>` : \'\'}',
'          ${t.companyPoBox ? `<div>${t.companyPoBox}</div>` : \'\'}',
'          ${t.companyCity ? `<div>${t.companyCity}</div>` : \'\'}',
'        </div>',
'        <div class="date-block" style="margin-top: 5mm;">',
'          <span class="label">Date</span><br>',
'          <span class="date-value">${quoteDate}</span>',
'        </div>',
'      </div>',
'    </div>',
'    <div class="quote-title">${docTypeLabel}</div>',
'    <hr class="rule">'
      ].join('\n');
      content = content.substring(0, startIdx) + newHtml + content.substring(endIdx);
    }
  }
  return content;
}

let crm = fs.readFileSync('apps/service-crm/src/accounting.ts', 'utf-8');
crm = updateTemplate(crm, false);
fs.writeFileSync('apps/service-crm/src/accounting.ts', crm);

let web = fs.readFileSync('apps/web/src/app/dashboard/accounting/branding/page.tsx', 'utf-8');
web = updateTemplate(web, true);
fs.writeFileSync('apps/web/src/app/dashboard/accounting/branding/page.tsx', web);
console.log('Fixed');
