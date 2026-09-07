"use client";

import { useState, useEffect } from "react";
import { Save, UploadCloud } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

const PRESET_PALETTES = [
  { id: "classic", label: "Classic Red", primary: "#A83C2E", accent: "#1B1B1B" },
  { id: "ocean", label: "Ocean Blue", primary: "#1B4FD8", accent: "#0F172A" },
  { id: "forest", label: "Forest Green", primary: "#15803D", accent: "#1C2B1E" },
  { id: "royal", label: "Royal Purple", primary: "#7C3AED", accent: "#2D2D2D" },
  { id: "midnight", label: "Midnight Gold", primary: "#1E293B", accent: "#D97706" },
  { id: "slate", label: "Slate Teal", primary: "#475569", accent: "#0F766E" },
];

export default function BrandingSettings() {
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [previewType, setPreviewType] = useState('standard');
  
  const [form, setForm] = useState({
    companyName: "",
    companyTagline: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
    companyPoBox: "",
    companyCity: "",
    stampText: "",
    logoUrl: "",
    primaryColor: "#A83C2E",
    accentColor: "#1B1B1B",
    watermarkEnabled: true
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await fetch("/api/accounting/template");
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/accounting/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      modal.alert("Success", "Branding settings saved successfully.");
    } catch (e: any) {
      modal.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-12 text-center text-ink/60">Loading settings...</div>;

  const logoTag = form.logoUrl ? "<img src='" + form.logoUrl + "' alt='Company Logo'>" : '';
  const watermarkHtml = (form.watermarkEnabled !== false && form.logoUrl)
    ? "<div class='watermark'><img src='" + form.logoUrl + "' alt=''></div>" : '';
  const primaryColor = form.primaryColor || '#b3122a';
  const accentColor = form.accentColor || '#2f5fbf';
  
  const standardPreviewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @media print { .no-print { display: none !important; } }
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0;
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
  }
  .page {
    position: relative; width: 210mm; min-height: 297mm;
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
    padding-top: 12mm; z-index: 2;
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
  table.items { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
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
  
  
  body { background: transparent; }
  .meta-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; }
  .label-box { margin-bottom: 2mm; }
  .label-box .label { font-size: 11pt; color: #1a1a1a; }
  .label-line { width: 15px; border-bottom: 2px solid ${primaryColor}; margin-top: 2px; }
</style>
</head>
<body>
<div class="page">
  <div class="right-tab"></div>
  ${watermarkHtml}
  <div class="content">
    <div class="header">
      <div class="brand">
        ${form.logoUrl ? "<div class='logo-box'>" + logoTag + "</div>" : ''}
        <div class="brand-text">
          <p class="company-name">${form.companyName || 'Company Name'}</p>
          ${form.companyTagline ? "<p class='tagline'>" + form.companyTagline + "</p>" : ''}
        </div>
      </div>
      <div class="contact-block">
        ${form.companyPhone ? "<div>" + form.companyPhone + "</div>" : ''}
        ${form.companyWebsite ? "<div>" + form.companyWebsite + "</div>" : ''}
        ${form.companyEmail ? "<div><a href='mailto:" + form.companyEmail + "'>" + form.companyEmail + "</a></div>" : ''}
        ${form.companyPoBox ? "<div>P.O Box " + form.companyPoBox + "</div>" : ''}
        ${form.companyCity ? "<div>" + form.companyCity + "</div>" : ''}
      </div>
    </div>
    <div class="meta-row">
      <div class="to-block">
        <div class="label-box">
          <div class="label">To</div>
          <div class="label-line"></div>
        </div>
        <span class="bold">Client Name,</span><br>
        <span class="bold">Specification:</span> Standard Request
      </div>
      <div class="date-block" style="text-align: right;">
        <div class="label-box" style="display: flex; flex-direction: column; align-items: flex-end;">
          <div class="label">Date</div>
          <div class="label-line"></div>
        </div>
        <span class="date-value bold">12 Jan 2024</span>
      </div>
    </div>
    <div class="quote-title">INVOICE</div>
    <hr class="rule">
    <div class="quote-number">
      <span class="qn-prefix">INV-</span><span class="qn-value">01/12/1/24</span>
    </div>
    <table class="items">
      <thead>
        <tr>
          <th class="num-col">No</th>
          <th>Particulars</th>
          <th class="price-col">Price</th>
          <th class="qty-col">Qty.</th>
          <th class="total-col">Total<br>(KES)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="num">1</td>
          <td>Website Development</td>
          <td class="price">150,000</td>
          <td class="qty">1</td>
          <td class="total">150,000</td>
        </tr>
        <tr class="summary-row">
          <td colspan="4">Subtotal</td>
          <td class="total">150,000</td>
        </tr>
        <tr class="summary-row">
          <td colspan="4">Total</td>
          <td class="total">150,000</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="stamp">
    <div class="stamp-title">${form.companyName || 'Company Name'}</div>
    ${form.companyPoBox ? "<div class='stamp-line'>P.O BOX " + form.companyPoBox + "</div>" : ''}
    ${form.companyCity ? "<div class='stamp-line'>" + form.companyCity + " - KENYA</div>" : ''}
    <div class="stamp-date">27/08/2026</div>
    <div class="stamp-sign" style="font-size: 10pt; margin-top: 2mm;">SIGN ................................</div>
  </div>
</div>
</body>
</html>`;

const receiptPreviewHtml = `<!DOCTYPE html>
<html>
<head>
<style>
  
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
  .receipt-view .item-desc { font-style: italic; font-size: 10.5px; margin-left: 4px; }
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
</style>
</head>
<body style="margin: 0; padding: 0;">
  <div class="receipt-view">
    <div class="receipt-box">
      <div class="r-header">
        <div class="r-logo">
          ${form.logoUrl ? "<img src='" + form.logoUrl + "' alt='Logo' />" : ""}
        </div>
        <div class="r-title">RECEIPT</div>
      </div>
      <hr class="rule-double" />

      <div class="date-line">DATE: 20-09-2026</div>

      <div class="info-grid">
        <div class="info-label">MAILING<br/>INFO</div>
        <div class="info-value">
          <strong>${form.companyName || 'Company Name'}</strong>
          ${form.companyPoBox ? 'P.O BOX ' + form.companyPoBox : ''}${form.companyCity ? ', ' + form.companyCity : ''}<br/>
          ${form.companyPhone ? 'TEL: ' + form.companyPhone + '<br/>' : ''}
          ${form.companyEmail ? 'EMAIL: ' + form.companyEmail + '<br/>' : ''}
          ${form.companyWebsite || ''}
        </div>
        <div class="info-label">BILL<br/>TO</div>
        <div class="info-value">
          <strong>KENTAP HOSPITAL</strong>
        </div>
      </div>

      <div class="items-head">
        <div>DESCRIPTION</div>
        <div class="amount-col">AMOUNT</div>
      </div>

      <div class="item-row">
        <div>
          <span class="item-name">Website Development</span>
        </div>
        <div class="item-amount">150,000</div>
      </div>

      <div class="footer-grid">
        <div>
          <div class="comments-label">OTHER COMMENTS</div>
          <div class="comments-value">PART PAYMENT RECEIVED</div>
        </div>
        <div class="totals">
          <div><span class="t-label">TOTAL CONTRACT:</span> <span class="t-value">250,000</span></div>
          <div><span class="t-label">TOTAL PAID:</span> <span class="t-value">150,000</span></div>
          <div><span class="t-label">BALANCE:</span> <span class="t-value">100,000</span></div>
        </div>
      </div>

      <div class="stamp-wrap">
        <div class="stamp">
          <div class="paid-text">PAID</div>
          <div class="paid-date">20 SEP 2026</div>
          <div class="paid-rule"></div>
        </div>
      </div>

      <hr class="rule-single" />
      <div class="tagline">WE DELIVER</div>
    </div>
  </div>
</body>
</html>`;

  const activeHtml = previewType === 'standard' ? standardPreviewHtml : receiptPreviewHtml;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-ink dark:text-white">Branding & Templates</h1>
        <p className="text-[14px] text-ink/60 dark:text-slate-400">Customize how your documents and invoices look.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Settings Form */}
        <div className="space-y-6">
          <form onSubmit={handleSave} className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-sm p-6 space-y-8">
            
            <div>
              <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-4">Company Logo</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[12px] border-2 border-dashed border-ink/20 dark:border-white/20 flex items-center justify-center bg-[#F9FAFB] dark:bg-slate-800 overflow-hidden relative">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <UploadCloud className="text-ink/40 dark:text-white/40" size={24} />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => setForm({...form, logoUrl: reader.result as string});
                      }
                    }}
                    className="block w-full text-[13px] text-ink/60
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-[13px] file:font-semibold
                      file:bg-thread/10 file:text-thread
                      hover:file:bg-thread/20 cursor-pointer"
                  />
                  <p className="text-[11px] text-ink/60">Recommended size: 200x200px (PNG or JPG)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-4">Company Details</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Company Name *</label>
                  <input required type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                </div>
                
                
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Company Motto / Tagline</label>
                    <input type="text" value={form.companyTagline} onChange={e => setForm({...form, companyTagline: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder="e.g. Digital Innovation & Media Solutions" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Phone</label>
                    <input type="text" value={form.companyPhone} onChange={e => setForm({...form, companyPhone: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Email</label>
                    <input type="email" value={form.companyEmail} onChange={e => setForm({...form, companyEmail: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">P.O. Box</label>
                    <input type="text" value={form.companyPoBox} onChange={e => setForm({...form, companyPoBox: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">City</label>
                    <input type="text" value={form.companyCity} onChange={e => setForm({...form, companyCity: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Website</label>
                    <input type="text" value={form.companyWebsite} onChange={e => setForm({...form, companyWebsite: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-ink/10 dark:border-white/10">
              <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-4">Brand Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {PRESET_PALETTES.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setForm({...form, primaryColor: p.primary, accentColor: p.accent})}
                    className={`flex items-center p-2 rounded-[8px] border transition-all ${
                      form.primaryColor === p.primary && form.accentColor === p.accent
                        ? "border-thread bg-thread/5 ring-1 ring-[#A83C2E]"
                        : "border-ink/10 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full mr-1 border border-black/10" style={{ backgroundColor: p.primary }}></div>
                    <div className="w-4 h-4 rounded-full mr-2 border border-black/10" style={{ backgroundColor: p.accent }}></div>
                    <span className="text-[12px] font-medium text-[#344054] dark:text-slate-300">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-ink/10 dark:border-white/10">
              <label className="flex items-center text-[14px] font-medium text-[#344054] dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.watermarkEnabled} onChange={e => setForm({...form, watermarkEnabled: e.target.checked})} className="mr-3 rounded text-thread focus:ring-[#A83C2E]" />
                Enable Document Watermark
              </label>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit" className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-[8px] shadow-sm text-[14px] font-medium text-white bg-thread hover:bg-[#8B3125] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A83C2E] disabled:opacity-50 transition-colors">
                <Save size={18} className="mr-2" /> {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Pane */}
        <div>
          <div className="sticky top-6 bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[15px] font-semibold text-ink dark:text-white uppercase tracking-wider">Live Preview</h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1 shadow-inner border border-ink/5 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => setPreviewType('standard')} 
                  className={`px-3 py-1 text-[12px] font-semibold rounded transition-all ${previewType === 'standard' ? 'bg-white dark:bg-slate-700 shadow text-ink dark:text-white' : 'text-ink/60 dark:text-slate-400 hover:text-ink dark:hover:text-white'}`}
                >
                  Standard
                </button>
                <button 
                  type="button" 
                  onClick={() => setPreviewType('receipt')} 
                  className={`px-3 py-1 text-[12px] font-semibold rounded transition-all ${previewType === 'receipt' ? 'bg-white dark:bg-slate-700 shadow text-ink dark:text-white' : 'text-ink/60 dark:text-slate-400 hover:text-ink dark:hover:text-white'}`}
                >
                  Receipt
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden flex justify-center items-start pt-4" style={{ height: '600px' }}>
              <div className="bg-white shadow-xl pointer-events-none transition-all" style={{ width: '210mm', height: '297mm', transform: 'scale(0.5)', transformOrigin: 'top center' }}>
                <iframe srcDoc={activeHtml} className="w-full h-full border-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}