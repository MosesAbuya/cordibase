const fs = require('fs');

function updateTemplate(content, isFrontend) {
  // CSS updates:
  // Re-introduce .meta-row
  if (!content.includes('.meta-row {')) {
    content = content.replace('</style>', '  .meta-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; }\n  .label-box { margin-bottom: 2mm; }\n  .label-box .label { font-size: 11pt; color: #1a1a1a; }\n  .label-line { width: 15px; border-bottom: 2px solid ${primaryColor}; margin-top: 2px; }\n</style>');
  } else {
    content = content.replace('.meta-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 9mm; }', '.meta-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; }');
  }
  
  // Fix header margins
  content = content.replace('.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 5mm; margin-bottom: 2mm; }', '.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8mm; }');

  // Replace HTML structure
  const startIdx = content.indexOf('    <div class="header">');
  const endIdx = content.indexOf('    <hr class="rule">') + '    <hr class="rule">'.length;
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    if (isFrontend) {
      const newHtml = [
'    <div class="header">',
'      <div class="brand">',
'        ${form.logoUrl ? "<div class=\'logo-box\'>" + logoTag + "</div>" : \'\'}',
'        <div class="brand-text">',
'          <p class="company-name">${form.companyName || \'Company Name\'}</p>',
'          ${form.companyTagline ? "<p class=\'tagline\'>" + form.companyTagline + "</p>" : \'\'}',
'        </div>',
'      </div>',
'      <div class="contact-block">',
'        ${form.companyPhone ? "<div>" + form.companyPhone + "</div>" : \'\'}',
'        ${form.companyWebsite ? "<div>" + form.companyWebsite + "</div>" : \'\'}',
'        ${form.companyEmail ? "<div><a href=\'mailto:" + form.companyEmail + "\'>" + form.companyEmail + "</a></div>" : \'\'}',
'        ${form.companyPoBox ? "<div>P.O Box " + form.companyPoBox + "</div>" : \'\'}',
'        ${form.companyCity ? "<div>" + form.companyCity + "</div>" : \'\'}',
'      </div>',
'    </div>',
'    <div class="meta-row">',
'      <div class="to-block">',
'        <div class="label-box">',
'          <div class="label">To</div>',
'          <div class="label-line"></div>',
'        </div>',
'        <span class="bold">Client Name,</span><br>',
'        <span class="bold">Specification:</span> Standard Request',
'      </div>',
'      <div class="date-block" style="text-align: right;">',
'        <div class="label-box" style="display: flex; flex-direction: column; align-items: flex-end;">',
'          <div class="label">Date</div>',
'          <div class="label-line"></div>',
'        </div>',
'        <span class="date-value bold">12 Jan 2024</span>',
'      </div>',
'    </div>',
'    <div class="quote-title">Quotation</div>',
'    <hr class="rule">'
      ].join('\n');
      content = content.substring(0, startIdx) + newHtml + content.substring(endIdx);
    } else {
      const newHtml = [
'    <div class="header">',
'      <div class="brand">',
'        ${t.logoUrl ? `<div class="logo-box">${logoTag}</div>` : \'\'}',
'        <div class="brand-text">',
'          <p class="company-name">${t.companyName || \'\'}</p>',
'          ${t.companyTagline ? `<p class="tagline">${t.companyTagline}</p>` : \'\'}',
'        </div>',
'      </div>',
'      <div class="contact-block">',
'        ${t.companyPhone ? `<div>${t.companyPhone}</div>` : \'\'}',
'        ${t.companyWebsite ? `<div>${t.companyWebsite}</div>` : \'\'}',
'        ${t.companyEmail ? `<div><a href="mailto:${t.companyEmail}">${t.companyEmail}</a></div>` : \'\'}',
'        ${t.companyPoBox ? `<div>${t.companyPoBox}</div>` : \'\'}',
'        ${t.companyCity ? `<div>${t.companyCity}</div>` : \'\'}',
'      </div>',
'    </div>',
'    <div class="meta-row">',
'      <div class="to-block">',
'        <div class="label-box">',
'          <div class="label">To</div>',
'          <div class="label-line"></div>',
'        </div>',
'        <span class="bold">${doc.clientName},</span><br>',
'        ${doc.clientCo ? `${doc.clientCo}<br>` : \'\'}',
'        ${doc.clientSpec ? `<span class="bold">Specification:</span> ${doc.clientSpec}` : \'\'}',
'      </div>',
'      <div class="date-block" style="text-align: right;">',
'        <div class="label-box" style="display: flex; flex-direction: column; align-items: flex-end;">',
'          <div class="label">Date</div>',
'          <div class="label-line"></div>',
'        </div>',
'        <span class="date-value bold">${quoteDate}</span>',
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
