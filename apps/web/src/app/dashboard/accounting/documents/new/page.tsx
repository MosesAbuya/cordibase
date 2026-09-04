"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, FileDown } from "lucide-react";
import Link from "next/link";
import { useModal } from "@/components/ModalProvider";

export default function DocumentBuilder() {
  const router = useRouter();
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("invoice");
  const [settings, setSettings] = useState<any>({ currency: "KES", vatRate: 16, vatEnabled: true });

  const [form, setForm] = useState({
    clientName: "",
    clientCo: "",
    clientSpec: "",
    clientAddress: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  });

  const [items, setItems] = useState([{ id: Date.now(), particulars: "", price: 0, qty: 1 }]);
  const [applyVat, setApplyVat] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/accounting/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setApplyVat(data.vatEnabled);
      }
    } catch (e) {}
  };

  const addItem = () => setItems([...items, { id: Date.now(), particulars: "", price: 0, qty: 1 }]);
  
  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vatAmount = applyVat ? (subtotal * (settings.vatRate / 100)) : 0;
  const total = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName) {
      modal.alert("Validation Error", "Client Name is required");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        type,
        ...form,
        currency: settings.currency,
        vatRate: applyVat ? settings.vatRate : 0,
        subtotal,
        vatAmount,
        total,
        status: "draft",
        lineItems: items.map(item => ({
          particulars: item.particulars,
          price: item.price,
          qty: item.qty,
          total: item.price * item.qty
        }))
      };

      const res = await fetch("/api/accounting/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save document");
      
      router.push(`/dashboard/accounting/documents/${data.id}`);
    } catch (error: any) {
      modal.alert("Error", error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-ink">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        <Link href="/dashboard/accounting" className="text-ink/60 hover:text-ink dark:hover:text-white flex items-center text-[14px] font-medium transition-colors w-fit">
          <ArrowLeft size={16} className="mr-2" /> Back to Documents
        </Link>

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[24px] font-bold text-ink dark:text-white">New Document</h1>
            <p className="text-[14px] text-ink/60 mt-1">Fill in the details to generate a branded PDF.</p>
          </div>
          <div className="flex bg-[#EAECF0] dark:bg-slate-800 p-1 rounded-[8px]">
            {["invoice", "quotation", "receipt"].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-[6px] text-[14px] font-medium capitalize transition-all ${
                  type === t 
                    ? "bg-white dark:bg-slate-700 text-ink dark:text-white shadow-sm" 
                    : "text-ink/60 hover:text-ink dark:hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-sm p-6 space-y-8">
          
          {/* Client Details */}
          <div>
            <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-4 border-b border-ink/10 dark:border-white/10 pb-2">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Client Name *</label>
                <input required type="text" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Care of (C/o)</label>
                <input type="text" value={form.clientCo} onChange={e => setForm({...form, clientCo: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Specification</label>
                <input type="text" value={form.clientSpec} onChange={e => setForm({...form, clientSpec: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder="e.g. Branding Services" />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-4 border-b border-ink/10 dark:border-white/10 pb-2">Document Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Issue Date *</label>
                <input required type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-ink/10 dark:border-white/10 pb-2">
              <h3 className="text-[16px] font-semibold text-ink dark:text-white">Line Items</h3>
              <span className="text-[13px] font-medium text-ink/60">Currency: {settings.currency}</span>
            </div>
            
            <div className="space-y-3">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-12 gap-3 text-[13px] font-medium text-ink/60 px-2">
                <div className="col-span-6">Particulars</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-[#F9FAFB] dark:bg-slate-800/50 p-3 rounded-[8px] relative group">
                  <div className="md:col-span-6 space-y-1">
                    <label className="md:hidden text-[12px] font-medium text-ink/60">Particulars</label>
                    <input required type="text" value={item.particulars} onChange={e => updateItem(item.id, 'particulars', e.target.value)} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[6px] bg-white dark:bg-[#1E293B] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder="Description..." />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="md:hidden text-[12px] font-medium text-ink/60">Price</label>
                    <input required type="number" step="0.01" min="0" value={item.price} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[6px] bg-white dark:bg-[#1E293B] text-[14px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="md:hidden text-[12px] font-medium text-ink/60">Qty</label>
                    <input required type="number" step="0.01" min="0.01" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[6px] bg-white dark:bg-[#1E293B] text-[14px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="md:col-span-2 space-y-1 flex justify-between items-center h-full pt-1 md:pt-0 md:justify-end">
                    <span className="md:hidden text-[12px] font-medium text-ink/60">Total</span>
                    <span className="font-medium text-[15px] tabular-nums">{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="absolute -right-2 -top-2 bg-white dark:bg-slate-700 border border-ink/10 dark:border-slate-600 text-[#F04438] rounded-full p-1 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={addItem} className="mt-4 flex items-center text-[13px] font-medium text-thread hover:text-[#8B3125] transition-colors">
              <Plus size={16} className="mr-1" /> Add Item
            </button>
          </div>

          {/* Totals Box */}
          <div className="flex justify-end pt-4 border-t border-ink/10 dark:border-white/10">
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-ink/60">Subtotal</span>
                <span className="font-medium text-ink dark:text-white tabular-nums">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {settings.vatEnabled && (
                <div className="flex justify-between items-center text-[14px]">
                  <label className="flex items-center text-ink/60 cursor-pointer">
                    <input type="checkbox" checked={applyVat} onChange={(e) => setApplyVat(e.target.checked)} className="mr-2 rounded text-thread focus:ring-[#A83C2E]" />
                    VAT ({settings.vatRate}%)
                  </label>
                  <span className="font-medium text-ink dark:text-white tabular-nums">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[16px] font-bold text-ink dark:text-white border-t border-ink/10 dark:border-white/10 pt-3 mt-1">
                <span>Total ({settings.currency})</span>
                <span className="tabular-nums">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-ink/10 dark:border-white/10">
            <Link href="/dashboard/accounting" className="px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-[#344054] dark:text-slate-300 border border-[#D0D5DD] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F9FAFB] dark:hover:bg-slate-700 transition-colors">
              Cancel
            </Link>
            <button disabled={loading} type="submit" className="px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-white bg-thread hover:bg-[#8B3125] transition-colors flex items-center shadow-sm disabled:opacity-50">
              <Save size={16} className="mr-2" />
              {loading ? "Saving..." : "Save & Preview"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
