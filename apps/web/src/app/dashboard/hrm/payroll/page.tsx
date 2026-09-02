"use client";

import { useState } from "react";
import { PlayCircle, DollarSign, Calendar } from "lucide-react";

export default function PayrollPage() {
  const [payrollRun, setPayrollRun] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleRunPayroll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      const res = await fetch("/api/hrm/payroll/run", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-org-id": orgId || ''
        },
        body: JSON.stringify({
          periodStart: firstDay,
          periodEnd: lastDay
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to run payroll");
      }

      const data = await res.json();
      setPayrollRun(data);
      setToast({ message: "Payroll processed successfully! Accounting event dispatched.", type: "success" });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setToast({ message: "Failed to run payroll.", type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 flex items-center space-x-3 transition-all ${
          toast.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center rounded-full text-white font-bold">&check;</div>
          ) : (
            <div className="w-6 h-6 bg-red-500 flex items-center justify-center rounded-full text-white font-bold">!</div>
          )}
          <p className={`text-sm font-bold ${toast.type === 'success' ? 'text-emerald-900' : 'text-red-900'}`}>
            {toast.message}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll</h1>
          <p className="text-slate-500 font-medium">Run payroll and dispatch accounting journal events.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-[#DC2626] p-4">
          <p className="text-sm text-[#DC2626] font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Run Current Period</h2>
            <DollarSign className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 mb-6 font-medium">
            Calculate gross pay, deductions, and net pay for all active employees. This will also trigger a background BullMQ event to the Accounting microservice to log the expense.
          </p>
          <button
            onClick={handleRunPayroll}
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-thread text-white px-4 py-3 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full mr-2"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <PlayCircle size={18} className="mr-2" />
                Run Payroll
              </span>
            )}
          </button>
        </div>

        {payrollRun && (
          <div className="bg-emerald-50 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-bold text-emerald-900 mb-4 border-b-2 border-black pb-2">Latest Run Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-bold text-slate-600">Period</span>
                <span className="text-sm font-bold text-slate-900">{payrollRun.payrollRun.periodStart} to {payrollRun.payrollRun.periodEnd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold text-slate-600">Employees Paid</span>
                <span className="text-sm font-bold text-slate-900">{payrollRun.itemsCount}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/10">
                <span className="text-sm font-bold text-slate-900 uppercase">Total Net Payout</span>
                <span className="text-lg font-bold text-emerald-600">${(payrollRun.payrollRun.totalAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="mt-6 text-xs font-bold text-emerald-700 bg-emerald-100 p-2 border border-emerald-200">
              &#10003; Accounting event dispatched via BullMQ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
