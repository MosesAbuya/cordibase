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
      const res = await fetch("/api/crm/accounting/template");
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
      const res = await fetch("/api/crm/accounting/template", {
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
  
  const previewHtml = `<!DOCTYPE html>
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
  .quote-title { text-align: center; font-size: 22pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2mm; color: #1a1a1a; }
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
  
  html { transform: scale(0.65); transform-origin: top left; width: 153%; height: 153%; }
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
    <div class="quote-title">Quotation</div>
    <hr class="rule">
    <div class="quote-number">
      <span class="qn-prefix">QN-</span><span class="qn-value">01/12/1/24</span>
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
  ${watermarkHtml}
</div>
</body>
</html>`;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-ink p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-ink dark:text-white">Branding & Templates</h1>
          <p className="text-[14px] text-ink/60 mt-1">Configure how your Invoices, Quotations, and Receipts look.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-ink p-6 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm">
            
                        <div>
              <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-4">Company Logo</h3>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-24 h-24 border-2 border-dashed border-ink/10 dark:border-slate-700 rounded-[8px] flex items-center justify-center overflow-hidden bg-[#F9FAFB] dark:bg-slate-800">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <UploadCloud className="text-ink/60" size={24} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-[13px] font-medium text-[#344054] dark:text-slate-300">Upload Logo</label>
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

                    {/* Mini Preview */}
          <div>
            <div className="sticky top-6">
              <h3 className="text-[14px] font-medium text-ink/60 mb-3 uppercase tracking-wider">Live Preview</h3>
              <div className="bg-white shadow-xl border border-gray-200 overflow-hidden relative pointer-events-none" style={{ width: '100%', aspectRatio: '210/297' }}>
                <iframe srcDoc={previewHtml} className="w-full h-full border-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

