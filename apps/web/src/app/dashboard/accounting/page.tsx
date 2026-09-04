"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Download, Trash2, ArrowRight, Mail } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function AccountingPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const modal = useModal();

  useEffect(() => {
    fetchDocuments();
  }, [filterType]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = filterType === "all" ? "/api/accounting/documents" : `/api/accounting/documents?type=${filterType}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error: any) {
      modal.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, refNumber: string) => {
    const confirmed = await modal.confirm("Delete Document", `Are you sure you want to delete ${refNumber}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/accounting/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDocuments(documents.filter(d => d.id !== id));
    } catch (error: any) {
      modal.alert("Error", error.message);
    }
  };

  const filteredDocs = documents.filter(d => 
    d.refNumber.toLowerCase().includes(search.toLowerCase()) || 
    d.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-ink dark:text-white">Documents</h1>
            <p className="text-[14px] text-ink/60 mt-1">Manage Invoices, Quotations & Receipts.</p>
          </div>
          <Link
            href="/dashboard/accounting/documents/new"
            className="bg-thread text-white px-4 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-[#8B3125] transition-colors flex items-center shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            New Document
          </Link>
        </div>

        <div className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-sm flex flex-col">
          <div className="p-4 border-b border-ink/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-1 p-1 bg-linen dark:bg-slate-800 rounded-[8px]">
              {["all", "invoice", "quotation", "receipt"].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium capitalize transition-all ${
                    filterType === t 
                      ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm" 
                      : "text-ink/60 hover:text-ink dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1E293B] border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread transition-all text-ink dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink/60">Loading...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-linen dark:bg-slate-800 flex items-center justify-center mb-4 text-[#98A2B3]">
                <FileText size={24} />
              </div>
              <h3 className="text-[16px] font-medium text-ink dark:text-white mb-1">No documents found</h3>
              <p className="text-[14px] text-ink/60 mb-4">Create your first invoice, quotation, or receipt.</p>
              <Link
                href="/dashboard/accounting/documents/new"
                className="text-thread text-[14px] font-medium hover:underline flex items-center"
              >
                Create Document <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/10 dark:border-white/10 bg-[#F9FAFB] dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Ref Number</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-800">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#F9FAFB] dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/accounting/documents/${doc.id}`} className="text-[14px] font-medium text-ink dark:text-white hover:text-thread">
                          {doc.refNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium capitalize ${
                          doc.type === 'invoice' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          doc.type === 'quotation' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        }`}>
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-[#475467] dark:text-slate-300">{doc.clientName}</span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-ink/60">
                        {new Date(doc.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium text-ink dark:text-white">
                          {doc.currency} {Number(doc.total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                            doc.status === 'draft' ? 'bg-linen text-ink/60 dark:bg-slate-700 dark:text-slate-300' :
                            doc.status === 'paid' ? 'bg-[#17B26A]/10 text-[#17B26A]' :
                            doc.status === 'sent' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-[#F04438]/10 text-[#F04438]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                               doc.status === 'draft' ? 'bg-[#667085]' :
                               doc.status === 'paid' ? 'bg-[#17B26A]' :
                               doc.status === 'sent' ? 'bg-blue-500' :
                               'bg-[#F04438]'
                            }`}></span>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <Link href={`/api/accounting/documents/${doc.id}/pdf?download=true`} target="_blank" className="p-1.5 text-ink/60 hover:bg-linen dark:hover:bg-slate-700 rounded transition-colors" title="Download PDF">
                              <Download size={16} />
                            </Link>
                            <button onClick={() => window.open(`https://wa.me/?text=Here is the document ${doc.refNumber}: ${window.location.origin}/api/accounting/documents/${doc.id}/pdf`, '_blank')} className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded transition-colors" title="Share via WhatsApp">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
                            </button>
                            <button onClick={() => window.location.href = `mailto:?subject=Document ${doc.refNumber}&body=Here is the document: ${window.location.origin}/api/accounting/documents/${doc.id}/pdf`} className="p-1.5 text-ink/60 hover:bg-linen dark:hover:bg-slate-700 rounded transition-colors" title="Share via Email">
                              <Mail size={16} />
                            </button>
                            <button onClick={() => handleDelete(doc.id, doc.refNumber)} className="p-1.5 text-[#F04438] hover:bg-[#F04438]/10 rounded transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

