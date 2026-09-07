"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, Mail } from "lucide-react";
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
        .receipt-view .info-label { color: var(--receipt-red); text-align: right; font-weight: bold; letter-spacing: 0.5px; }
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
      <div className="receipt-box">
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
          <div className="info-label" style={{ borderLeft: "1px solid #000", paddingLeft: "10px" }}>BILL<br/>TO</div>
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
            <div className="paid-date">{new Date(doc.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="paid-rule"></div>
          </div>
        </div>

        <hr className="rule-single" />
        <div className="tagline">WE DELIVER</div>
      </div>
    </div>
  );

  const renderStandard = () => (
    <div className="bg-white rounded-sm shadow-lg border border-gray-200 p-10 md:p-14 overflow-hidden relative" style={{ minHeight: "842px", color: "#1a1a1a" }}>
      
      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] opacity-[0.03] text-[100px] font-black pointer-events-none whitespace-nowrap z-0">
        {template?.companyName || "CORDIBASE"}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            {template?.logoUrl && (
              <img src={template.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
            )}
            <div>
              <h1 className="text-[24px] font-black tracking-tight" style={{ color: primaryColor }}>{template?.companyName}</h1>
              {template?.companyTagline && <p className="text-[12px] text-gray-500 font-medium">{template.companyTagline}</p>}
            </div>
          </div>
          <div className="text-right text-[12px] text-gray-600 leading-tight">
            {template?.companyPhone && <p>{template.companyPhone}</p>}
            {template?.companyWebsite && <p>{template.companyWebsite}</p>}
            {template?.companyEmail && <p>{template.companyEmail}</p>}
            {template?.companyPoBox && <p>P.O. Box {template.companyPoBox}, {template?.companyCity}</p>}
          </div>
        </div>

        <div className="h-[3px] w-full mb-6" style={{ backgroundColor: primaryColor }}></div>

        {/* Client info */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-[13px] leading-tight">
            <p className="font-bold text-gray-900 border-b-2 border-red-500 w-6 mb-1 pb-1">To</p>
            <p className="font-semibold text-gray-800 text-[14px] mt-2">{doc.clientName}</p>
            {doc.clientCo && <p>C/o {doc.clientCo}</p>}
            {doc.clientSpec && <p>Specification: {doc.clientSpec}</p>}
          </div>
          <div className="text-right text-[13px]">
            <p className="font-bold text-gray-900 border-b-2 border-red-500 w-8 ml-auto mb-1 pb-1">Date</p>
            <p className="font-semibold text-gray-800 mt-2">
              {new Date(doc.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-[32px] font-black uppercase tracking-wide">{docTypeLabel}</h2>
          <div className="h-[2px] w-full max-w-md mx-auto mb-1" style={{ backgroundColor: primaryColor }}></div>
          <p className="font-bold text-[15px]" style={{ color: primaryColor }}>{doc.refNumber}</p>
        </div>

        {/* Table */}
        <table className="w-full text-left text-[13px] border-collapse mb-8">
          <thead>
            <tr className="text-white" style={{ backgroundColor: template?.accentColor || "#1B1B1B" }}>
              <th className="py-2.5 px-3 font-semibold w-12 rounded-tl-sm">No</th>
              <th className="py-2.5 px-3 font-semibold">Particulars</th>
              <th className="py-2.5 px-3 font-semibold text-right w-24">Price</th>
              <th className="py-2.5 px-3 font-semibold text-right w-16">Qty</th>
              <th className="py-2.5 px-3 font-semibold text-right w-32 rounded-tr-sm">Total ({doc.currency})</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id || i} className="border-b border-gray-200">
                <td className="py-3 px-3 font-medium text-gray-900">{i + 1}</td>
                <td className="py-3 px-3 text-gray-800">{item.particulars}</td>
                <td className="py-3 px-3 text-right text-gray-600">{Number(item.price).toLocaleString()}</td>
                <td className="py-3 px-3 text-right text-gray-600">{item.qty}</td>
                <td className="py-3 px-3 text-right font-semibold text-gray-900">{Number(item.total).toLocaleString()}</td>
              </tr>
            ))}
            <tr><td colSpan={5} className="py-2"></td></tr>
            
            {/* Totals */}
            <tr>
              <td colSpan={4} className="py-2 px-3 font-bold text-right text-gray-800">Subtotal</td>
              <td className="py-2 px-3 font-bold text-right border-b border-gray-200">{Number(doc.subtotal).toLocaleString()}</td>
            </tr>
            {Number(doc.vatAmount) > 0 && (
              <tr>
                <td colSpan={4} className="py-2 px-3 font-bold text-right text-gray-800">VAT ({doc.vatRate}%)</td>
                <td className="py-2 px-3 font-bold text-right border-b border-gray-200">{Number(doc.vatAmount).toLocaleString()}</td>
              </tr>
            )}
            <tr>
              <td colSpan={4} className="py-3 px-3 font-black text-right text-[15px]">Total</td>
              <td className="py-3 px-3 font-black text-right text-[15px] bg-gray-100">{Number(doc.total).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Stamp Box */}
        <div className="flex justify-end mt-12">
          <div className="border-[2.5px] border-gray-400 p-4 w-64 text-center transform -rotate-2">
            <p className="font-bold text-[14px] text-gray-800 uppercase mb-1">{template?.companyName}</p>
            <p className="text-[11px] font-semibold text-gray-600">P.O BOX {template?.companyPoBox}</p>
            <p className="text-[11px] font-semibold text-gray-600 mb-1">{template?.companyCity}</p>
            <p className="text-[12px] font-bold text-red-600 mb-2">{new Date(doc.issueDate).toLocaleDateString('en-GB')}</p>
            <p className="text-[12px] font-bold text-gray-800">SIGN ............................</p>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6 flex justify-between items-center bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] p-4 shadow-sm">
        <Link href="/dashboard/accounting/documents" className="flex items-center text-[14px] font-medium text-ink/60 hover:text-ink dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Documents
        </Link>
        <div className="flex items-center gap-3">
            <a href={`/api/accounting/documents/${id}/pdf?download=true`} target="_blank" rel="noreferrer" className="text-white bg-thread hover:bg-[#8B3125] px-4 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center transition-colors shadow-sm">
              <Download size={14} className="mr-1.5" /> Download PDF
            </a>
            <button onClick={handleDelete} className="p-1.5 text-[#F04438] bg-[#F04438]/10 hover:bg-[#F04438]/20 rounded-[6px] transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {doc.type === 'receipt' ? renderReceipt() : renderStandard()}
    </div>
  );
}
