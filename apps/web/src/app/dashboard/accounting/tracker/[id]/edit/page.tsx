"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { scanReceiptWithAI } from "@/app/actions/scan-receipt";
import { polishTextWithAI } from "@/app/actions/polish-text";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, Camera, Check, X, Sparkles, Loader2 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

import { useParams } from 'next/navigation';
export default function EditTransaction() {
  const params = useParams();
  const id = params?.id;
  const isEdit = !!id && id !== 'new';
  const router = useRouter();
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`/api/accounting/transactions/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            const t = data;
            setForm({
              type: t.type || "expense",
              date: t.date ? new Date(t.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              amount: t.amount?.toString() || "",
              currency: t.currency || "KES",
              categoryId: t.categoryId || "",
              description: t.description || "",
              vendorOrSource: t.vendorOrSource || "",
              notes: t.notes || "",
              status: t.status || "paid",
              aiExtracted: t.aiExtracted || false
            });
            // If there's an activeTab state for expense/income toggle, you might set it here too if needed
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);
  const [mode, setMode] = useState<"manual" | "scan">("manual");
  const [categories, setCategories] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    currency: "KES",
    categoryId: "",
    description: "",
    vendorOrSource: "",
    notes: "",
    status: "paid",
    aiExtracted: false
  });

  // AI Scanning state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const [polishingDesc, setPolishingDesc] = useState(false);
  const [polishingNotes, setPolishingNotes] = useState(false);

  const handlePolish = async (context: 'description' | 'notes') => {
    const textToPolish = context === 'description' ? form.description : form.notes;
    if (!textToPolish) return;
    
    if (context === 'description') setPolishingDesc(true);
    else setPolishingNotes(true);

    try {
      const res = await polishTextWithAI(textToPolish, context);
      if (res.success && res.polished) {
        setForm(prev => ({
          ...prev,
          [context]: res.polished
        }));
      } else {
        modal.alert("Polish Error", res.error || "Failed to polish text.");
      }
    } catch (e: any) {
      modal.alert("Error", e.message);
    } finally {
      if (context === 'description') setPolishingDesc(false);
      else setPolishingNotes(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [form.type]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/accounting/categories?type=${form.type}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : (data.categories || []));
      }
    } catch (e) {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setScanResult(null);
    }
  };

      const handleScan = async () => {
      if (!file) return;
      setScanning(true);
      
      try {
        // Convert file to base64 using a Promise so we can await it
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = error => reject(error);
        });

        const result = await scanReceiptWithAI(base64, file.type);
        if (!result.success) {
          throw new Error(result.error || "Scan failed");
        }
        
        const extracted = result.extracted;
        
        if (!extracted || Object.keys(extracted).length === 0) {
          throw new Error("AI could not extract any data from this image. Please try a clearer photo.");
        }
        setScanResult(extracted);
        
        // Find best category match
        let matchedCategory = null;
        if (extracted?.suggested_category) {
           matchedCategory = categories.find((c: any) => 
             c.name.toLowerCase().includes(extracted.suggested_category.toLowerCase()) || 
             extracted.suggested_category.toLowerCase().includes(c.name.toLowerCase())
           );
        }
        
        setForm(prev => ({
          ...prev,
          type: "expense", // receipts are usually expenses
          date: extracted?.date || prev.date,
          amount: extracted?.total_amount || "",
          currency: extracted?.currency || prev.currency,
          description: extracted?.description || "",
          notes: extracted?.notes || "",
          vendorOrSource: extracted?.vendor_name || "",
          categoryId: matchedCategory ? matchedCategory.id : "",
          aiExtracted: true
        }));
        
      } catch (error: any) {
        modal.alert("Scan Error", error.message);
      } finally {
        setScanning(false);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      modal.alert("Error", "Please fill required fields (Amount and Description)");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/accounting/transactions/${id}` : "/api/accounting/transactions", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || errData.error || "Failed to save transaction"); }
      
      router.push("/dashboard/accounting/tracker");
    } catch (error: any) {
      modal.alert("Error", error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-ink p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <Link href="/dashboard/accounting/tracker" className="text-ink/60 hover:text-ink dark:hover:text-white flex items-center text-[14px] font-medium transition-colors w-fit">
          <ArrowLeft size={16} className="mr-2" /> Back to Tracker
        </Link>

        <div>
          <h1 className="text-[24px] font-bold text-ink dark:text-white">{isEdit ? "Edit Transaction" : "Add Transaction"}</h1>
          <p className="text-[14px] text-ink/60 mt-1">Log an income or expense, or scan a receipt.</p>
        </div>

        <div className="flex bg-[#EAECF0] dark:bg-slate-800 p-1 rounded-[8px] w-full max-w-sm">
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-[6px] text-[14px] font-medium transition-all ${mode === "manual" ? "bg-white dark:bg-slate-700 shadow-sm text-ink dark:text-white" : "text-ink/60"}`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setMode("scan")}
            className={`flex-1 py-2 rounded-[6px] text-[14px] font-medium transition-all flex justify-center items-center ${mode === "scan" ? "bg-white dark:bg-slate-700 shadow-sm text-thread" : "text-ink/60"}`}
          >
            <Sparkles size={16} className="mr-1.5" /> Scan Receipt
          </button>
        </div>

        <div className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-sm p-6 lg:p-8">
          
          {mode === "scan" && !scanResult && (
            <div className="mb-8">
              {!file ? (
                <div className="border-2 border-dashed border-ink/10 dark:border-slate-700 rounded-[12px] p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Camera size={24} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-ink dark:text-white mb-1">Click or drag a receipt image</h3>
                  <p className="text-[14px] text-ink/60">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <img src={preview!} alt="Receipt preview" className="max-h-[300px] object-contain" />
                    <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                      <X size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={handleScan} 
                    disabled={scanning}
                    className="bg-thread hover:bg-[#8B3125] text-white px-6 py-3 rounded-[8px] text-[15px] font-medium flex items-center shadow-sm disabled:opacity-70 transition-all"
                  >
                    {scanning ? (
                      <><Loader2 size={18} className="mr-2 animate-spin" /> Analyzing with AI...</>
                    ) : (
                      <><Sparkles size={18} className="mr-2" /> Extract Data from Receipt</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {(mode === "manual" || scanResult) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {scanResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-4 flex items-start mb-6">
                  <Sparkles className="text-blue-600 mr-3 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-[14px] font-bold text-blue-900">AI Extraction Complete</h4>
                    <p className="text-[13px] text-blue-800 mt-1">We've auto-filled the form based on your receipt. Please review and adjust if necessary before saving.</p>
                  </div>
                </div>
              )}

              {/* Type Toggle */}
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center py-3 border rounded-[8px] cursor-pointer transition-all ${
                  form.type === "expense" ? "border-red-600 bg-red-50 text-red-700 font-bold" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}>
                  <input type="radio" name="type" className="hidden" checked={form.type === "expense"} onChange={() => setForm({...form, type: "expense"})} />
                  Expense (Money Out)
                </label>
                <label className={`flex-1 flex items-center justify-center py-3 border rounded-[8px] cursor-pointer transition-all ${
                  form.type === "income" ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}>
                  <input type="radio" name="type" className="hidden" checked={form.type === "income"} onChange={() => setForm({...form, type: "income"})} />
                  Income (Money In)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Amount ({form.currency}) *</label>
                  <input required type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread tabular-nums" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Date *</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Description *</label>
                    {form.description && (
                      <button type="button" onClick={() => handlePolish('description')} disabled={polishingDesc} className="text-[12px] text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors">
                        {polishingDesc ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                        {polishingDesc ? "Polishing..." : "Polish"}
                      </button>
                    )}
                  </div>
                  <input required type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder="What was this for?" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Category</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread">
                    <option value="">Select a category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">
                    {form.type === "expense" ? "Vendor / Merchant" : "Source / Client"}
                  </label>
                  <input type="text" value={form.vendorOrSource} onChange={e => setForm({...form, vendorOrSource: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder={form.type === "expense" ? "e.g. Amazon, Uber" : "e.g. Acme Corp"} />
                </div>
                
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread">
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Detailed Notes / Report</label>
                    {form.notes && (
                      <button type="button" onClick={() => handlePolish('notes')} disabled={polishingNotes} className="text-[12px] text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors">
                        {polishingNotes ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                        {polishingNotes ? "Polishing..." : "Polish"}
                      </button>
                    )}
                  </div>
                  <textarea value={form.notes || ""} onChange={e => setForm({...form, notes: e.target.value})} rows={4} className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" placeholder="Add any detailed notes or let AI fill this..."></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-ink/10 dark:border-white/10 flex justify-end gap-3">
                <Link href="/dashboard/accounting/tracker" className="px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-[#344054] dark:text-slate-300 border border-[#D0D5DD] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F9FAFB] dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </Link>
                <button disabled={loading} type="submit" className="px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-white bg-thread hover:bg-[#8B3125] transition-colors flex items-center shadow-sm disabled:opacity-50">
                  <Save size={16} className="mr-2" />
                  {loading ? "Saving..." : isEdit ? "Update Transaction" : "Save Transaction"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

