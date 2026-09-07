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

  if (loading) return <div className="p-8 text-center text-ink/60">Loading document...</div>;
  if (!doc) return null;

  const docTypeLabel = doc.type === 'invoice' ? 'INVOICE' : doc.type === 'receipt' ? 'RECEIPT' : 'QUOTATION';
  const primaryColor = template?.primaryColor || "#A83C2E";
  const accentColor = template?.accentColor || "#1B1B1B";

  const renderReceipt = () => (
    <div className="receipt-view" style={{ minHeight: "842px" }}>
      <style dangerouslySetInnerHTML={{ __html: `
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
        .receipt-view .info-label { color: var(--receipt-red); text-align: right; font-weight: bold; letter-spacing: 0.5px; border-right: 1px solid var(--border-black); padding-right: 10px; }
        .receipt-view .info-value { color: var(--receipt-black); text-transform: uppercase; }
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
      `}} />
      <div className="receipt-box print-area">
        <div className="r-header">
          <div className="r-logo">
            {template?.logoUrl && <img src={template.logoUrl} alt="Logo" />}
          </div>
          <div className="r-title">RECEIPT</div>
        </div>
        <hr className="rule-double" />

        <div className="date-line">DATE:{new Date(doc.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</div>

        <div className="info-grid">
          <div className="info-label">MAILING<br/>INFO</div>
          <div className="info-value">
            <strong>{template?.companyName}</strong>
            {template?.companyPoBox && `P.O BOX ${template.companyPoBox}`}{template?.companyCity && `, ${template.companyCity}`}<br/>
            {template?.companyPhone && `TEL: ${template.companyPhone}`}<br/>
            {template?.companyEmail && `EMAIL: ${template.companyEmail}`}<br/>
            {template?.companyWebsite}
          </div>
          <div className="info-label">BILL<br/>TO</div>
          <div className="info-value">
            <strong>{doc.clientName}</strong>
            {doc.clientCo && <span>C/o {doc.clientCo}</span>}
          </div>
        </div>

        <div className="items-head">
          <div>DESCRIPTION</div>
          <div className="amount-col">AMOUNT</div>
        </div>

        {items.map((item, i) => (
          <div className="item-row" key={item.id || i}>
            <div>
              <span className="item-name">{item.particulars}</span>
              {item.qty > 1 && <span className="item-desc">(Qty: {item.qty})</span>}
            </div>
            <div className="item-amount">{Number(item.total).toLocaleString()}</div>
          </div>
        ))}

        <div className="footer-grid">
          <div>
            <div className="comments-label">OTHER COMMENTS</div>
            <div className="comments-value">{doc.notes || 'N/A'}</div>
          </div>
          <div className="totals">
            <div><span className="t-label">TOTAL CONTRACT:</span> <span className="t-value">{Number(doc.total).toLocaleString()}</span></div>
            <div><span className="t-label">TOTAL PAID:</span> <span className="t-value">{Number(doc.amountPaid || doc.total).toLocaleString()}</span></div>
            <div><span className="t-label">BALANCE:</span> <span className="t-value">{Number(doc.balanceDue || 0).toLocaleString()}</span></div>
          </div>
        </div>

        {/* Paid Stamp */}
        <div className="stamp-wrap">
          <div className="stamp">
            <div className="paid-text">PAID</div>
            <div className="paid-date">{new Date(doc.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\//g, ' ')}</div>
            <div className="paid-rule"></div>
          </div>
        </div>

        <hr className="rule-single" />
        <div className="tagline">WE DELIVER</div>
      </div>
    </div>
  );

  const renderStandard = () => (
    <div className="bg-white rounded-sm shadow-lg border border-gray-200 overflow-hidden relative print-area" style={{ minHeight: "297mm", width: "210mm", margin: "0 auto", color: "#1a1a1a" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; }
        .standard-page {
          position: relative; width: 100%; min-height: 100%;
          background: #ffffff; overflow: hidden;
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
          color: #1a1a1a;
        }
        .standard-page::before {
          content: ""; position: absolute; top: 0; left: 0; width: 10mm; height: 100%;
          background: ${primaryColor}; z-index: 5;
        }
        .standard-page .right-tab {
          position: absolute; right: 0; top: 220mm; width: 6mm; height: 35mm;
          background: ${primaryColor}; z-index: 5;
        }
        .standard-page .content {
          position: relative; margin-left: 22mm; margin-right: 15mm;
          padding-top: 12mm; padding-bottom: 20mm; z-index: 2;
        }
        .standard-page .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8mm; }
        .standard-page .brand { display: flex; align-items: center; gap: 4mm; }
        .standard-page .logo-box { width: 26mm; height: 26mm; flex-shrink: 0; margin-left: -4mm; }
        .standard-page .logo-box img { width: 100%; height: 100%; object-fit: contain; }
        .standard-page .brand-text p { margin: 0; }
        .standard-page .company-name { font-size: 15pt; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5mm; }
        .standard-page .tagline { font-size: 10.5pt; color: #444; line-height: 1.2; max-width: 38mm; }
        .standard-page .contact-block { text-align: right; font-size: 8.5pt; line-height: 1.5; color: #444; padding-top: 1mm; }
        .standard-page .contact-block a { color: ${accentColor}; text-decoration: underline; }
        
        .standard-page .to-block { font-size: 9.5pt; line-height: 1.6; }
        .standard-page .label { text-decoration: underline; text-underline-offset: 3px; margin-bottom: 1mm; display: inline-block; }
        .standard-page .bold { font-weight: 700; }
        .standard-page .quote-title { text-align: center; font-size: 22pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2mm; color: #1a1a1a; text-transform: uppercase; }
        .standard-page .date-block { text-align: right; font-size: 9.5pt; }
        .standard-page .date-block .label { text-decoration: underline; text-underline-offset: 3px; display: block; margin-bottom: 1mm; }
        .standard-page .date-value { color: ${primaryColor}; font-weight: 700; }
        .standard-page .rule { border: none; border-top: 1.5px solid ${primaryColor}; margin: 4mm 0 3mm 0; }
        .standard-page .quote-number { text-align: center; font-weight: 700; font-size: 10.5pt; margin-bottom: 5mm; }
        .standard-page .qn-prefix { color: #1a1a1a; }
        .standard-page .qn-value { color: ${primaryColor}; }
        .standard-page table.items { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 15mm;}
        .standard-page table.items thead th { background: #111111; color: #ffffff; text-align: left; padding: 3mm 3mm; font-weight: 700; border: 1px solid #111111; }
        .standard-page table.items thead th.num-col { width: 8%; }
        .standard-page table.items thead th.price-col, .standard-page table.items thead th.qty-col, .standard-page table.items thead th.total-col { text-align: left; width: 12%; }
        .standard-page table.items tbody td { border: 1px solid #111111; padding: 4mm 3mm; vertical-align: top; color: ${accentColor}; }
        .standard-page table.items tbody td.num, .standard-page table.items tbody td.price, .standard-page table.items tbody td.qty, .standard-page table.items tbody td.total { color: #1a1a1a; }
        .standard-page table.items tbody tr.summary-row td { font-weight: 700; padding: 3mm 3mm; color: #1a1a1a; }
        .standard-page table.items tbody tr.summary-row td.total { font-weight: 700; }
        .standard-page .stamp { text-transform: uppercase; position: absolute; right: 8mm; bottom: 45mm; width: 62mm; border: 1.5px solid #0055CC; border-radius: 3px; padding: 4mm 5mm; transform: rotate(-6deg); color: #0055CC; text-align: center; line-height: 1.5; }
        .standard-page .stamp .stamp-title { font-size: 13pt; font-weight: 700; }
        .standard-page .stamp .stamp-line { font-size: 10pt; }
        .standard-page .stamp .stamp-date { color: ${primaryColor}; font-size: 10pt; }
        .standard-page .watermark { position: absolute; left: -10mm; bottom: -10mm; width: 90mm; height: 90mm; opacity: 0.15; transform: rotate(35deg); z-index: 1; pointer-events: none; }
        .standard-page .watermark img { width: 100%; height: 100%; object-fit: contain; }
        .standard-page .meta-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; }
        .standard-page .label-box { margin-bottom: 2mm; }
        .standard-page .label-box .label { font-size: 11pt; color: #1a1a1a; }
        .standard-page .label-line { width: 15px; border-bottom: 2px solid ${primaryColor}; margin-top: 2px; }
      `}} />
      <div className="standard-page">
        <div className="right-tab"></div>
        {template?.watermarkEnabled && template?.logoUrl && (
          <div className="watermark"><img src={template.logoUrl} alt="" /></div>
        )}
        <div className="content">
          <div className="header">
            <div className="brand">
              {template?.logoUrl && <div className="logo-box"><img src={template.logoUrl} alt="Logo" /></div>}
              <div className="brand-text">
                <p className="company-name">{template?.companyName || 'Company Name'}</p>
                {template?.companyTagline && <p className="tagline">{template.companyTagline}</p>}
              </div>
            </div>
            <div className="contact-block">
              {template?.companyPhone && <div>{template.companyPhone}</div>}
              {template?.companyWebsite && <div>{template.companyWebsite}</div>}
              {template?.companyEmail && <div><a href={`mailto:${template.companyEmail}`}>{template.companyEmail}</a></div>}
              {template?.companyPoBox && <div>P.O Box {template.companyPoBox}</div>}
              {template?.companyCity && <div>{template.companyCity}</div>}
            </div>
          </div>
          
          <div className="meta-row">
            <div className="to-block">
              <div className="label-box">
                <div className="label">To</div>
                <div className="label-line"></div>
              </div>
              <span className="bold">{doc.clientName}</span><br/>
              {doc.clientCo && <span>C/o {doc.clientCo}<br/></span>}
              {doc.clientSpec && <span className="bold">Specification: {doc.clientSpec}</span>}
            </div>
            <div className="date-block" style={{ textAlign: "right" }}>
              <div className="label-box" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div className="label">Date</div>
                <div className="label-line"></div>
              </div>
              <span className="date-value bold">{new Date(doc.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="quote-title">{docTypeLabel}</div>
          <hr className="rule" />
          
          <div className="quote-number">
            <span className="qn-prefix"></span><span className="qn-value">{doc.refNumber}</span>
          </div>

          <table className="items">
            <thead>
              <tr>
                <th className="num-col">No</th>
                <th>Particulars</th>
                <th className="price-col">Price</th>
                <th className="qty-col">Qty.</th>
                <th className="total-col">Total<br/>({doc.currency})</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id || i}>
                  <td className="num">{i + 1}</td>
                  <td>{item.particulars}</td>
                  <td className="price">{Number(item.price).toLocaleString()}</td>
                  <td className="qty">{item.qty}</td>
                  <td className="total">{Number(item.total).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="summary-row">
                <td colSpan={4} style={{ textAlign: 'right' }}>Subtotal</td>
                <td className="total">{Number(doc.subtotal).toLocaleString()}</td>
              </tr>
              {Number(doc.vatAmount) > 0 && (
                <tr className="summary-row">
                  <td colSpan={4} style={{ textAlign: 'right' }}>VAT ({doc.vatRate}%)</td>
                  <td className="total">{Number(doc.vatAmount).toLocaleString()}</td>
                </tr>
              )}
              <tr className="summary-row">
                <td colSpan={4} style={{ textAlign: 'right', fontSize: '11pt' }}>Total</td>
                <td className="total" style={{ fontSize: '11pt' }}>{Number(doc.total).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

        </div>
        <div className="stamp">
          <div className="stamp-title">{template?.companyName || 'Company Name'}</div>
          {template?.companyPoBox && <div className="stamp-line">P.O BOX {template.companyPoBox}</div>}
          {template?.companyCity && <div className="stamp-line">{template.companyCity}</div>}
          <div className="stamp-date">{new Date(doc.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })}</div>
          <div className="stamp-sign" style={{ fontSize: "10pt", marginTop: "2mm" }}>SIGN ................................</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 relative">
      
      {/* Dynamic CSS for window.print() */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; margin: 0 !important; width: 210mm !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="mb-6 flex justify-between items-center bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] p-4 shadow-sm no-print">
        <Link href="/dashboard/accounting/documents" className="flex items-center text-[14px] font-medium text-ink/60 hover:text-ink dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Documents
        </Link>
        <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="text-white bg-thread hover:bg-[#8B3125] px-4 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center transition-colors shadow-sm">
              <Printer size={14} className="mr-1.5" /> Download / Print PDF
            </button>
            <button onClick={handleDelete} className="p-1.5 text-[#F04438] bg-[#F04438]/10 hover:bg-[#F04438]/20 rounded-[6px] transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="print-area" style={{ width: "fit-content", margin: "0 auto" }}>
        {doc.type === 'receipt' ? renderReceipt() : renderStandard()}
      </div>
    </div>
  );
}
