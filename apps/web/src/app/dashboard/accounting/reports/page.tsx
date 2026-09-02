"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function AccountingReports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/crm/accounting/transactions/summary");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading || !data) return <div className="p-12 text-center text-ink/60">Loading reports...</div>;

  const maxExpense = Math.max(...data.byCategory.map((c: any) => c.amount), 1);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-linen dark:bg-ink">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-[24px] font-bold text-ink dark:text-white">Accounting Reports</h1>
          <p className="text-[14px] text-ink/60 mt-1">Overview of your financial performance.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-ink p-6 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center mb-2">
              <TrendingUp className="text-emerald-500 mr-2" size={20} />
              <h3 className="text-[14px] font-medium text-ink/60">Total Income</h3>
            </div>
            <p className="text-[28px] font-bold text-ink dark:text-white">
              KES {Number(data.totalIncome).toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-ink p-6 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center mb-2">
              <TrendingDown className="text-red-500 mr-2" size={20} />
              <h3 className="text-[14px] font-medium text-ink/60">Total Expenses</h3>
            </div>
            <p className="text-[28px] font-bold text-ink dark:text-white">
              KES {Number(data.totalExpenses).toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-ink p-6 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm">
            <div className="flex items-center mb-2">
              <BarChart3 className={data.netPL >= 0 ? "text-emerald-500 mr-2" : "text-red-500 mr-2"} size={20} />
              <h3 className="text-[14px] font-medium text-ink/60">Net Profit / Loss</h3>
            </div>
            <p className={`text-[28px] font-bold ${data.netPL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {data.netPL >= 0 ? "+" : "-"} KES {Math.abs(Number(data.netPL)).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <div className="bg-white dark:bg-ink p-6 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm">
            <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-6">Expenses by Category</h3>
            
            {data.byCategory.length === 0 ? (
              <div className="text-center text-ink/60 py-8">No expense data available</div>
            ) : (
              <div className="space-y-4">
                {data.byCategory.map((cat: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-[13px] font-medium mb-1">
                      <span className="text-[#344054] dark:text-slate-300">{cat.name}</span>
                      <span className="text-ink dark:text-white">KES {Number(cat.amount).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#EAECF0] dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ width: `${(cat.amount / maxExpense) * 100}%`, backgroundColor: cat.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Trend (Simple Table for now, chart later if needed) */}
          <div className="bg-white dark:bg-ink p-6 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm">
            <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-6">Monthly Trend</h3>
            
            {data.byMonth.length === 0 ? (
              <div className="text-center text-ink/60 py-8">No trend data available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink/10 dark:border-white/10 text-ink/60">
                      <th className="py-3 px-2 text-[12px] font-medium uppercase tracking-wider">Month</th>
                      <th className="py-3 px-2 text-[12px] font-medium uppercase tracking-wider text-right">Income</th>
                      <th className="py-3 px-2 text-[12px] font-medium uppercase tracking-wider text-right">Expense</th>
                      <th className="py-3 px-2 text-[12px] font-medium uppercase tracking-wider text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-800">
                    {data.byMonth.map((m: any, i: number) => (
                      <tr key={i}>
                        <td className="py-3 px-2 text-[14px] font-medium text-ink dark:text-white">{m.month}</td>
                        <td className="py-3 px-2 text-[14px] text-right text-emerald-600 dark:text-emerald-400">{Number(m.income).toLocaleString()}</td>
                        <td className="py-3 px-2 text-[14px] text-right text-red-600 dark:text-red-400">{Number(m.expense).toLocaleString()}</td>
                        <td className={`py-3 px-2 text-[14px] text-right font-bold ${m.income - m.expense >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {Number(m.income - m.expense).toLocaleString()}
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
    </div>
  );
}
