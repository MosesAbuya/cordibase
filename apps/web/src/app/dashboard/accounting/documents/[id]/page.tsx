"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Download, CheckCircle, Trash2, Mail } from "lucide-react";
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
      setItems(data.lineItems);
      setTemplate(data.template);
    } catch (e: any) {
      modal.alert("Error", e.message);
      router.push("/dashboard/accounting");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    try {
      const res = await fetch(`/api/accounting/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" })
      });
      if (res.ok) {
        setDoc({ ...doc, status: "paid" });
        modal.alert("Success", "Document marked as paid");
      }
    } catch (e) {}
  };

  const handleDelete = async () => {
    const confirmed = await modal.confirm("Delete Document", "Are you sure you want to delete this document? This cannot be undone.");
    if (!confirmed) return;
    try {
      await fetch(`/api/accounting/documents/${id}`, { method: "DELETE" });
      router.push("/dashboard/accounting");
    } catch (e) {}
  };

  if (loading || !doc) return <div className="p-12 text-center text-ink/60">Loading preview...</div>;

  const docTypeLabel = doc.type.charAt(0).toUpperCase() + doc.type.slice(1);
  const primaryColor = template?.primaryColor || "#A83C2E";

  return (
    <div className="flex-1 overflow-y-auto bg-linen dark:bg-ink p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/dashboard/accounting" className="text-ink/60 hover:text-ink dark:hover:text-white flex items-center text-[14px] font-medium transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Documents
          </Link>
          
                      <div className="flex items-center gap-3">
              {doc.status !== 'paid' && doc.type === 'invoice' && (
                <button onClick={markAsPaid} className="text-[#15803D] bg-[#15803D]/10 hover:bg-[#15803D]/20 px-3 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center transition-colors">
                  <CheckCircle size={14} className="mr-1.5" /> Mark Paid
                </button>
              )}
              
              <button onClick={() => window.open(`https://wa.me/?text=Here is the document ${doc.refNumber}: ${window.location.origin}/api/accounting/documents/${id}/pdf`, '_blank')} className="text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 px-4 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center transition-colors shadow-sm" title="Share via WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg> WhatsApp
              </button>
              
              <button onClick={() => window.location.href = `mailto:?subject=Document ${doc.refNumber}&body=Here is the document: ${window.location.origin}/api/accounting/documents/${id}/pdf`} className="text-ink/60 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-4 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center transition-colors shadow-sm" title="Share via Email">
                <Mail size={14} className="mr-1.5" /> Email
              </button>

              <a href={`/api/accounting/documents/${id}/pdf?download=true`} target="_blank" rel="noreferrer" className="text-white bg-thread hover:bg-[#8B3125] px-4 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center transition-colors shadow-sm">
                <Download size={14} className="mr-1.5" /> Download PDF
              </a>
              
              <button onClick={handleDelete} className="p-1.5 text-[#F04438] bg-[#F04438]/10 hover:bg-[#F04438]/20 rounded-[6px] transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Paper Document Preview */}
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
                  <tr key={item.id} className="border-b border-gray-200">
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
      </div>
    </div>
  );
}


