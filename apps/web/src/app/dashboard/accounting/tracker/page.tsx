"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, TrendingUp, TrendingDown, Calendar, FileText, Download, BarChart3 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function TrackerPage() {
  const modal = useModal();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalIncome: 0, totalExpenses: 0, netPL: 0 });
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = filterType === "all" ? "/api/accounting/transactions" : `/api/accounting/transactions?type=${filterType}`;
      const [txRes, sumRes] = await Promise.all([
        fetch(url),
        fetch("/api/accounting/transactions/summary")
      ]);
      
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }
      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, desc: string) => {
    const confirmed = await modal.confirm("Delete Transaction", `Are you sure you want to delete "${desc}"?`);
    if (!confirmed) return;
    try {
      await fetch(`/api/accounting/transactions/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {}
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) || 
    (t.vendorOrSource && t.vendorOrSource.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-linen dark:bg-ink">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-ink dark:text-white">Financial Tracker</h1>
            <p className="text-[14px] text-ink/60 mt-1">Track income, expenses, and AI-scanned receipts.</p>
          </div>
          <Link
            href="/dashboard/accounting/tracker/new"
            className="bg-thread text-white px-4 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-[#8B3125] transition-colors flex items-center shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Add Transaction
          </Link>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-ink p-5 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mr-4">
              <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink/60 mb-1">Total Income</p>
              <h3 className="text-[24px] font-bold text-ink dark:text-white">
                KES {Number(summary.totalIncome).toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-ink p-5 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mr-4">
              <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink/60 mb-1">Total Expenses</p>
              <h3 className="text-[24px] font-bold text-ink dark:text-white">
                KES {Number(summary.totalExpenses).toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-ink p-5 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${summary.netPL >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
              <BarChart3 className={summary.netPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} size={24} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink/60 mb-1">Net P&L</p>
              <h3 className={`text-[24px] font-bold ${summary.netPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {summary.netPL >= 0 ? "+" : "-"} KES {Math.abs(Number(summary.netPL)).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-sm flex flex-col">
          <div className="p-4 border-b border-ink/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-1 p-1 bg-linen dark:bg-slate-800 rounded-[8px]">
              {["all", "income", "expense"].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium capitalize transition-all ${
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
                placeholder="Search description..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1E293B] border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink/60">Loading transactions...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-linen dark:bg-slate-800 flex items-center justify-center mb-4 text-[#98A2B3]">
                <FileText size={24} />
              </div>
              <h3 className="text-[16px] font-medium text-ink dark:text-white mb-1">No transactions found</h3>
              <p className="text-[14px] text-ink/60 mb-4">Upload a receipt or add a transaction manually.</p>
              <Link href="/dashboard/accounting/tracker/new" className="text-thread text-[14px] font-medium hover:underline">
                Add Transaction
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/10 dark:border-white/10 bg-[#F9FAFB] dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Vendor/Source</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-ink/60 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-800">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F9FAFB] dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-[13px] text-[#475467] dark:text-slate-300">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium capitalize ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[14px] font-medium text-ink dark:text-white flex items-center">
                          {t.description}
                          {t.aiExtracted && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded uppercase font-bold tracking-wider" title="Extracted via AI Scan">AI</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-ink/60">
                        {t.vendorOrSource || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {t.categoryName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border border-ink/10 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: t.categoryColor }}></span>
                            {t.categoryName}
                          </span>
                        ) : '-'}
                      </td>
                      <td className={`px-6 py-4 text-right text-[14px] font-bold ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink dark:text-white'
                      }`}>
                        {t.type === 'income' ? '+' : '-'} {t.currency} {Number(t.amount).toLocaleString()}
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
