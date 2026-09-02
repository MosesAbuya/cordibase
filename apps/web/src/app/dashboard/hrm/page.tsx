"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, Phone, Mail, MoreVertical } from "lucide-react";

export default function HRMPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    salary: "",
    hireDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch("/api/hrm/employees", {
        headers: { 'x-org-id': orgId || '' }
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch("/api/hrm/employees", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-org-id": orgId || ''
        },
        body: JSON.stringify({
          ...formData,
          salary: (parseFloat(formData.salary) * 100).toFixed(0), // convert to cents
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add employee");
      }

      setIsFormOpen(false);
      setFormData({
        firstName: "", lastName: "", email: "", phone: "", position: "", salary: "", hireDate: new Date().toISOString().split('T')[0],
      });
      setToast({ message: "Employee added successfully!", type: "success" });
      setTimeout(() => setToast(null), 4000);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || "Failed to add employee");
      setToast({ message: "Failed to add employee.", type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative w-full">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-4 py-3 rounded-[8px] border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex items-center space-x-3 transition-all ${
          toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-[#17B26A]/30' : 'bg-white dark:bg-slate-900 border-[#F04438]/30'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-5 h-5 bg-[#17B26A] flex items-center justify-center rounded-full text-white text-[12px] font-bold">&check;</div>
          ) : (
            <div className="w-5 h-5 bg-[#F04438] flex items-center justify-center rounded-full text-white text-[12px] font-bold">!</div>
          )}
          <p className={`text-[13px] font-medium ${toast.type === 'success' ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
            {toast.message}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-ink dark:text-white">Human Resources</h2>
          <p className="text-[13px] text-ink/60 mt-1">Manage employees, leave requests, and payroll.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center space-x-1.5 bg-thread text-white px-3 py-2 rounded-[6px] text-[13px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.06)] hover:bg-[#8B3125] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:ring-offset-2"
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {error && (
        <div className="bg-[#F04438]/10 border border-[#F04438]/30 rounded-[8px] p-3">
          <p className="text-[13px] text-[#F04438] font-medium">{error}</p>
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-[0_1px_2px_rgba(16,24,40,0.06)] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-ink/10 dark:border-white/10 gap-4">
          <div className="relative w-full max-w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink/60" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-full pl-9 pr-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[6px] text-[13px] leading-5 bg-white dark:bg-ink text-ink dark:text-white placeholder-[#667085] focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
            />
          </div>
          <div className="flex items-center space-x-3">
            <a href="/dashboard/hrm/payroll" className="flex items-center px-3 py-1.5 bg-white dark:bg-slate-700 border border-ink/10 dark:border-slate-600 text-ink dark:text-white text-[13px] font-medium rounded-[6px] shadow-[0_1px_2px_rgba(16,24,40,0.06)] hover:bg-[#F9FAFB] dark:hover:bg-slate-600 transition-colors">
              Run Payroll
            </a>
            <div className="w-px h-5 bg-[#EAECF0] dark:bg-slate-700"></div>
            <div className="flex space-x-1 bg-linen dark:bg-slate-800 p-1 rounded-[8px]">
              <button className="px-3 py-1 text-ink/60 hover:text-ink dark:hover:text-white text-[13px] font-medium rounded-[6px] transition-colors">All</button>
              <button className="px-3 py-1 bg-white dark:bg-slate-700 text-ink dark:text-white text-[13px] font-medium rounded-[6px] shadow-[0_1px_2px_rgba(16,24,40,0.06)]">Active</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-thread border-t-transparent animate-spin rounded-full"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-linen dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-ink/60">
                <Users size={20} />
              </div>
              <h3 className="text-[14px] font-bold text-ink dark:text-white mb-1">No employees found</h3>
              <p className="text-[13px] text-ink/60 max-w-sm mb-4">Add your first employee to start managing your team.</p>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="text-thread font-medium text-[13px] hover:underline"
              >
                + Add employee
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F9FAFB] dark:bg-slate-800/50 border-b border-ink/10 dark:border-white/10">
                    <th className="px-6 py-3 text-[11px] font-semibold text-ink/60 uppercase tracking-wider">Name / Role</th>
                    <th className="px-6 py-3 text-[11px] font-semibold text-ink/60 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-[11px] font-semibold text-ink/60 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-[11px] font-semibold text-ink/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-[11px] font-semibold text-ink/60 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-800">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#F9FAFB] dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-thread/10 text-thread flex items-center justify-center font-bold text-[13px] shrink-0">
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-[14px] font-medium text-ink dark:text-white">{emp.firstName} {emp.lastName}</div>
                            <div className="text-[12px] text-ink/60 mt-0.5">{emp.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="text-[13px] text-ink/60 flex items-center">
                          <Mail size={14} className="mr-2 text-[#98A2B3]" /> {emp.email}
                        </div>
                        {emp.phone && (
                          <div className="text-[13px] text-ink/60 flex items-center mt-1">
                            <Phone size={14} className="mr-2 text-[#98A2B3]" /> {emp.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium text-ink dark:text-white tabular-nums">
                        ${(emp.salary / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}<span className="text-[12px] text-ink/60 font-normal">/mo</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                          emp.status === 'active' ? 'bg-[#17B26A]/10 text-[#17B26A]' :
                          'bg-linen text-ink/60 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                             emp.status === 'active' ? 'bg-[#17B26A]' :
                             'bg-[#667085]'
                          }`}></span>
                          {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#98A2B3] hover:text-ink dark:hover:text-white p-1 rounded hover:bg-linen dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-[#1D2939]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center mb-6 border-b border-ink/10 dark:border-white/10 pb-4">
              <h2 className="text-[18px] font-bold text-ink dark:text-white">Add New Employee</h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-ink/60 hover:text-ink dark:hover:text-white font-medium text-[13px] transition-colors p-1"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="bg-[#F04438]/10 border border-[#F04438]/30 rounded-[8px] p-3 mb-6">
                <p className="text-[13px] text-[#F04438] font-medium">{formError}</p>
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-ink/60">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] bg-white dark:bg-ink text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-ink/60">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] bg-white dark:bg-ink text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-ink/60">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] bg-white dark:bg-ink text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-ink/60">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] bg-white dark:bg-ink text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-ink/60">Job Title / Position *</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] bg-white dark:bg-ink text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-ink/60">Monthly Salary ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] bg-white dark:bg-ink text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-ink/60">Hire Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.hireDate}
                    onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] bg-white dark:bg-ink text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-thread text-white px-4 py-2.5 rounded-[6px] text-[13px] font-medium hover:bg-[#8B3125] transition-colors outline-none focus:ring-2 focus:ring-[#A83C2E] focus:ring-offset-2 disabled:opacity-50 shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
                >
                  {isSubmitting ? "Saving..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
