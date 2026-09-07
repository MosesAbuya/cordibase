"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, Mail, Printer } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function DocumentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const modal = useModal();
  const [doc, setDoc] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoc();
  }, [id]);

  const fetchDoc = async () => {
    try {
      const res = await fetch(`/api/accounting/documents/${id}`);
      if (!res.ok) throw new Error("Document not found");
      const data = await res.json();
      setDoc(data.document);
      setItems(data.lineItems || []);
      setTemplate(data.template || {});
    } catch (e: any) {
      modal.alert("Error", e.message);
      router.push("/dashboard/accounting");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await modal.confirm("Delete Document", "Are you sure you want to delete this document? This cannot be undone.");
    if (!confirmed) return;
    try {
      await fetch(`/api/accounting/documents/${id}`, { method: "DELETE" });
      router.push("/dashboard/accounting");
    } catch (e) {}
  };

  const handlePrint = () => {
    const iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      const originalTitle = document.title;
      const pdfTitle = `${docTypeLabel} - ${doc.refNumber || 'Draft'} - ${doc.clientName || 'Client'}`;
      
      document.title = pdfTitle;
      iframe.contentWindow.document.title = pdfTitle;
      
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  if (loading) return <div className="p-8 text-center text-ink/60">Loading document...</div>;
  if (!doc) return null;

  const docTypeLabel = doc.type === 'invoice' ? 'INVOICE' : doc.type === 'receipt' ? 'RECEIPT' : 'QUOTATION';
  const primaryColor = template?.primaryColor || "#A83C2E";
  const accentColor = template?.accentColor || "#1B1B1B";

  const getStandardHtml = () => {
    const logoTag = template?.logoUrl ? `<img src='${template.logoUrl}' alt='Company Logo'>` : '';
    const watermarkHtml = (template?.watermarkEnabled !== false && template?.logoUrl)
      ? `<div class='watermark'><img src='${template.logoUrl}' alt=''></div>` : '';
      
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${docTypeLabel} - ${doc.refNumber || 'Draft'} - ${doc.clientName || 'Client'}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0;
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
  }
  .page {
    position: relative; width: 100%; min-height: 297mm;
    background: #ffffff; overflow: hidden;
  }
  .page::before {
    content: ""; position: absolute; top: 0; left: 0; width: 10mm; height: 100%;
    background: ${primaryColor}; z-index: 5;
  }
  .right-tab {
    position: absolute; right: 0; top: 220mm; width: 6mm; height: 35mm;
    background: ${primaryColor}; z-index: 5;
  }
  .content {
    position: relative; margin-left: 22mm; margin-right: 15mm;
    padding-top: 12mm; padding-bottom: 70mm; z-index: 2;
  }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8mm; }
  .brand { display: flex; align-items: center; gap: 4mm; }
  .logo-box { width: 26mm; height: 26mm; flex-shrink: 0; margin-left: -4mm; }
  .logo-box img { width: 100%; height: 100%; object-fit: contain; }
  .brand-text p { margin: 0; }
  .brand-text .company-name { font-size: 15pt; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5mm; }
  .brand-text .tagline { font-size: 10.5pt; color: #444; line-height: 1.2; max-width: 38mm; }
  .contact-block { text-align: right; font-size: 8.5pt; line-height: 1.5; color: #444; padding-top: 1mm; }
  .contact-block a { color: ${accentColor}; text-decoration: underline; }
  
  .to-block { font-size: 9.5pt; line-height: 1.6; }
  .to-block .label { text-decoration: underline; text-underline-offset: 3px; margin-bottom: 1mm; display: inline-block; }
  .to-block .bold { font-weight: 700; }
  .quote-title { text-align: center; font-size: 22pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2mm; color: #1a1a1a; text-transform: uppercase; }
  .date-block { text-align: right; font-size: 9.5pt; }
  .date-block .label { text-decoration: underline; text-underline-offset: 3px; display: block; margin-bottom: 1mm; }
  .date-block .date-value { color: ${primaryColor}; font-weight: 700; }
  .rule { border: none; border-top: 1.5px solid ${primaryColor}; margin: 4mm 0 3mm 0; }
  .quote-number { text-align: center; font-weight: 700; font-size: 10.5pt; margin-bottom: 5mm; }
  .quote-number .qn-prefix { color: #1a1a1a; }
  .quote-number .qn-value { color: ${primaryColor}; }
  table.items { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 15mm;}
  table.items thead th { background: #111111; color: #ffffff; text-align: left; padding: 3mm 3mm; font-weight: 700; border: 1px solid #111111; }
  table.items thead th.num-col { width: 8%; }
  table.items thead th.price-col, table.items thead th.qty-col, table.items thead th.total-col { text-align: left; width: 12%; }
  table.items tbody td { border: 1px solid #111111; padding: 4mm 3mm; vertical-align: top; color: ${accentColor}; }
  table.items tbody td.num, table.items tbody td.price, table.items tbody td.qty, table.items tbody td.total { color: #1a1a1a; }
  table.items tbody tr.summary-row td { font-weight: 700; padding: 3mm 3mm; color: #1a1a1a; }
  table.items tbody tr.summary-row td.total { font-weight: 700; }
  .stamp { text-transform: uppercase; position: absolute; right: 8mm; bottom: 45mm; width: 62mm; border: 1.5px solid #0055CC; border-radius: 3px; padding: 4mm 5mm; transform: rotate(-6deg); color: #0055CC; text-align: center; line-height: 1.5; }
  .stamp .stamp-title { font-size: 13pt; font-weight: 700; }
  .stamp .stamp-line { font-size: 10pt; }
  .stamp .stamp-date { color: ${primaryColor}; font-size: 10pt; }
  .watermark { position: absolute; left: -10mm; bottom: -10mm; width: 90mm; height: 90mm; opacity: 0.15; transform: rotate(35deg); z-index: 1; pointer-events: none; }
  .watermark img { width: 100%; height: 100%; object-fit: contain; }
  .meta-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; }
  .label-box { margin-bottom: 2mm; }
  .label-box .label { font-size: 11pt; color: #1a1a1a; }
  .label-line { width: 15px; border-bottom: 2px solid ${primaryColor}; margin-top: 2px; }
  
  @media screen {
    html { transform: scale(0.9); transform-origin: top center; }
    body { padding-bottom: 50px; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="right-tab"></div>
  ${watermarkHtml}
  <div class="content">
    <div class="header">
      <div class="brand">
        ${template?.logoUrl ? `<div class='logo-box'>${logoTag}</div>` : ''}
        <div class="brand-text">
          <p class="company-name">${template?.companyName || 'Company Name'}</p>
          ${template?.companyTagline ? `<p class='tagline'>${template.companyTagline}</p>` : ''}
        </div>
      </div>
      <div class="contact-block">
        ${template?.companyPhone ? `<div>${template.companyPhone}</div>` : ''}
        ${template?.companyWebsite ? `<div>${template.companyWebsite}</div>` : ''}
        ${template?.companyEmail ? `<div><a href='mailto:${template.companyEmail}'>${template.companyEmail}</a></div>` : ''}
        ${template?.companyPoBox ? `<div>P.O Box ${template.companyPoBox}</div>` : ''}
        ${template?.companyCity ? `<div>${template.companyCity}</div>` : ''}
      </div>
    </div>
    <div class="meta-row">
      <div class="to-block">
        <div class="label-box">
          <div class="label">To</div>
          <div class="label-line"></div>
        </div>
        <span class="bold">${doc.clientName || ''}</span><br>
        ${doc.clientCo ? `<span>C/o ${doc.clientCo}</span><br>` : ''}
        ${doc.clientSpec ? `<span class="bold">Specification: ${doc.clientSpec}</span>` : ''}
      </div>
      <div class="date-block" style="text-align: right;">
        <div class="label-box" style="display: flex; flex-direction: column; align-items: flex-end;">
          <div class="label">Date</div>
          <div class="label-line"></div>
        </div>
        <span class="date-value bold">${new Date(doc.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
    <div class="quote-title">${docTypeLabel}</div>
    <hr class="rule">
    <div class="quote-number">
      <span class="qn-prefix"></span><span class="qn-value">${doc.refNumber || ''}</span>
    </div>
    <table class="items">
      <thead>
        <tr>
          <th class="num-col">No</th>
          <th>Particulars</th>
          <th class="price-col">Price</th>
          <th class="qty-col">Qty.</th>
          <th class="total-col">Total<br>(${doc.currency || 'KES'})</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.particulars}</td>
            <td class="price">${Number(item.price).toLocaleString()}</td>
            <td class="qty">${item.qty}</td>
            <td class="total">${Number(item.total).toLocaleString()}</td>
          </tr>
        `).join('')}
        <tr class="summary-row">
          <td colspan="4" style="text-align: right;">Subtotal</td>
          <td class="total">${Number(doc.subtotal).toLocaleString()}</td>
        </tr>
        ${Number(doc.vatAmount) > 0 ? `
        <tr class="summary-row">
          <td colspan="4" style="text-align: right;">VAT (${doc.vatRate || 16}%)</td>
          <td class="total">${Number(doc.vatAmount).toLocaleString()}</td>
        </tr>
        ` : ''}
        <tr class="summary-row">
          <td colspan="4" style="text-align: right; font-size: 11pt;">Total</td>
          <td class="total" style="font-size: 11pt;">${Number(doc.total).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="stamp">
    <div class="stamp-title">${template?.companyName || 'Company Name'}</div>
    ${template?.companyPoBox ? `<div class='stamp-line'>P.O BOX ${template.companyPoBox}</div>` : ''}
    ${template?.companyCity ? `<div class='stamp-line'>${template.companyCity}</div>` : ''}
    <div class="stamp-date">${new Date(doc.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}</div>
    <div class="stamp-sign" style="font-size: 10pt; margin-top: 2mm;">SIGN ................................</div>
  </div>
</div>
</body>
</html>`;
  };

  const getReceiptHtml = () => {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${docTypeLabel} - ${doc.refNumber || 'Draft'} - ${doc.clientName || 'Client'}</title>
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; background: #fff; }
  .receipt-view {
    --receipt-red: #E31E26;
    --receipt-black: #1a1a1a;
    --border-black: #000000;
    --font-mono: "Courier New", Courier, monospace;
    background: #fff;
    font-family: var(--font-mono);
    color: var(--receipt-black);
    padding: 24px;
    box-sizing: border-box;
    width: 100%;
    min-height: 297mm;
  }
  .receipt-view .receipt-box {
    max-width: 620px;
    margin: 0 auto;
    border: 1.5px solid var(--border-black);
    padding: 28px 34px;
  }
  .receipt-view .r-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .receipt-view .r-logo img { height: 60px; width: auto; object-fit: contain; }
  .receipt-view .r-title { color: var(--receipt-red); font-weight: bold; letter-spacing: 2px; font-size: 13px; margin-top: 8px; }
  .receipt-view .rule-double { border: none; border-top: 2px solid var(--receipt-red); border-bottom: 1px solid var(--receipt-red); height: 3px; margin: 10px 0 18px; }
  .receipt-view .rule-single { border: none; border-top: 1.5px solid var(--receipt-red); margin: 18px 0 10px; }
  .receipt-view .date-line { color: var(--receipt-red); font-size: 11px; letter-spacing: 1px; margin-bottom: 18px; text-transform: uppercase; }
  .receipt-view .info-grid { display: grid; grid-template-columns: 70px 1fr 40px 1fr; column-gap: 10px; font-size: 10.5px; line-height: 1.5; margin-bottom: 22px; }
  .receipt-view .info-label { color: var(--receipt-red); text-align: right; font-weight: bold; letter-spacing: 0.5px; border-right: 1.5px solid var(--border-black); padding-right: 12px; margin-right: -2px; }
  .receipt-view .info-value { color: var(--receipt-black); text-transform: uppercase; padding-left: 2px; }
  .receipt-view .info-value strong { display: block; margin-bottom: 2px; }
  .receipt-view .items-head { display: grid; grid-template-columns: 1fr 90px; color: var(--receipt-red); font-weight: bold; font-size: 11px; letter-spacing: 1px; padding-bottom: 4px; border-bottom: 1.5px solid var(--receipt-red); }
  .receipt-view .items-head .amount-col { text-align: right; }
  .receipt-view .item-row { display: grid; grid-template-columns: 1fr 90px; column-gap: 12px; padding: 12px 0; border-bottom: 1px dotted var(--border-black); position: relative; }
  .receipt-view .item-row::after { content: ""; position: absolute; top: 0; bottom: 0; right: 90px; border-left: 1px dotted var(--border-black); }
  .receipt-view .item-name { font-weight: bold; font-size: 11px; text-transform: uppercase; }
  .receipt-view .item-desc { font-style: italic; font-size: 10.5px; margin-left: 4px; text-transform: none; }
  .receipt-view .item-amount { text-align: right; font-size: 11px; align-self: start; padding-top: 1px; }
  .receipt-view .footer-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 22px; font-size: 10.5px; }
  .receipt-view .comments-label { color: var(--receipt-red); font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; }
  .receipt-view .comments-value { color: var(--receipt-black); margin-top: 2px; text-transform: uppercase; }
  .receipt-view .totals { text-align: right; line-height: 1.7; }
  .receipt-view .totals .t-label { color: var(--receipt-red); font-weight: bold; }
  .receipt-view .totals .t-value { color: var(--receipt-black); font-weight: bold; }
  .receipt-view .stamp-wrap { display: flex; justify-content: center; margin: 20px 0; }
  .receipt-view .stamp { border: 2.5px solid var(--receipt-red); color: var(--receipt-red); padding: 10px 34px; text-align: center; transform: rotate(-2deg); }
  .receipt-view .stamp .paid-text { font-size: 26px; font-weight: bold; letter-spacing: 3px; line-height: 1; }
  .receipt-view .stamp .paid-date { font-size: 12px; letter-spacing: 2px; margin-top: 4px; text-transform: uppercase; }
  .receipt-view .stamp .paid-rule { border-top: 1px dashed var(--receipt-red); margin-top: 6px; }
  .receipt-view .tagline { text-align: center; color: var(--receipt-red); font-weight: bold; letter-spacing: 2px; font-size: 12px; margin-top: 6px; }
  
  @media screen {
    html { transform: scale(0.9); transform-origin: top center; }
    body { padding-bottom: 50px; }
  }
</style>
</head>
<body>
  <div class="receipt-view">
    <div class="receipt-box">
      <div class="r-header">
        <div class="r-logo">
          ${template?.logoUrl ? `<img src='${template.logoUrl}' alt='Logo' />` : ""}
        </div>
        <div class="r-title">RECEIPT</div>
      </div>
      <hr class="rule-double" />

      <div class="date-line">DATE: ${new Date(doc.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</div>

      <div class="info-grid">
        <div class="info-label">MAILING<br/>INFO</div>
        <div class="info-value">
          <strong>${template?.companyName || 'Company Name'}</strong>
          ${template?.companyPoBox ? 'P.O BOX ' + template.companyPoBox : ''}${template?.companyCity ? ', ' + template.companyCity : ''}<br/>
          ${template?.companyPhone ? 'TEL: ' + template.companyPhone + '<br/>' : ''}
          ${template?.companyEmail ? 'EMAIL: ' + template.companyEmail + '<br/>' : ''}
          ${template?.companyWebsite || ''}
        </div>
        <div class="info-label">BILL<br/>TO</div>
        <div class="info-value">
          <strong>${doc.clientName}</strong>
          ${doc.clientCo ? `<span>C/o ${doc.clientCo}</span>` : ''}
        </div>
      </div>

      <div class="items-head">
        <div>DESCRIPTION</div>
        <div class="amount-col">AMOUNT</div>
      </div>

      ${items.map((item, i) => `
      <div class="item-row">
        <div>
          <span class="item-name">${item.particulars}</span>
          ${item.qty > 1 ? `<span class="item-desc">(Qty: ${item.qty})</span>` : ''}
        </div>
        <div class="item-amount">${Number(item.total).toLocaleString()}</div>
      </div>
      `).join('')}

      <div class="footer-grid">
        <div>
          <div class="comments-label">OTHER COMMENTS</div>
          <div class="comments-value">${doc.notes || 'N/A'}</div>
        </div>
        <div class="totals">
          <div><span class="t-label">TOTAL CONTRACT:</span> <span class="t-value">${Number(doc.total).toLocaleString()}</span></div>
          <div><span class="t-label">TOTAL PAID:</span> <span class="t-value">${Number(doc.amountPaid || doc.total).toLocaleString()}</span></div>
          <div><span class="t-label">BALANCE:</span> <span class="t-value">${Number(doc.balanceDue || 0).toLocaleString()}</span></div>
        </div>
      </div>

      <div class="stamp-wrap">
        <div class="stamp">
          <div class="paid-text">PAID</div>
          <div class="paid-date">${new Date(doc.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\//g, ' ')}</div>
          <div class="paid-rule"></div>
        </div>
      </div>

      <hr class="rule-single" />
      <div class="tagline">WE DELIVER</div>
    </div>
  </div>
</body>
</html>`;
  };

  const htmlContent = doc.type === 'receipt' ? getReceiptHtml() : getStandardHtml();

  return (
    <div className="max-w-5xl mx-auto py-6 relative h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] p-4 shadow-sm flex-shrink-0">
        <Link href="/dashboard/accounting" className="flex items-center text-[14px] font-medium text-ink/60 hover:text-ink dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Documents
        </Link>
        <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="text-white bg-thread hover:bg-[#8B3125] px-4 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center transition-colors shadow-sm">
              <Printer size={14} className="mr-1.5" /> Download / Print PDF
            </button>
            <button onClick={handleDelete} className="p-1.5 text-[#F04438] bg-[#F04438]/10 hover:bg-[#F04438]/20 rounded-[6px] transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-ink/5 p-4 sm:p-8 flex justify-center">
        <div className="bg-white shadow-xl overflow-hidden transition-all relative" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}>
          <iframe 
            id="print-iframe" 
            srcDoc={htmlContent} 
            className="w-full h-full border-none absolute inset-0" 
            title="Document Preview"
          />
        </div>
      </div>
    </div>
  );
}
