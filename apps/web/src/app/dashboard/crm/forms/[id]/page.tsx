"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Settings, Code, GripVertical } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type FormField = {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select";
  label: string;
  required: boolean;
  options?: string[]; // For select fields
};

type WebForm = {
  id: string;
  title: string;
  isActive: boolean;
  fieldsConfig: string;
  submitAction: string;
};

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const modal = useModal();
  const formId = params.id as string;

  const [form, setForm] = useState<WebForm | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [formId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch(`/api/crm/forms`, { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        const found = data.forms?.find((f: WebForm) => f.id === formId);
        if (found) {
          setForm(found);
          try {
            setFields(JSON.parse(found.fieldsConfig || "[]"));
          } catch {
            setFields([]);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const payload = { ...form, fieldsConfig: JSON.stringify(fields) };

      const res = await fetch(`/api/crm/forms/${form.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setForm(data.form);
        await modal.alert("Form saved successfully!", "Success");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(7),
      type: "text",
      label: "New Field",
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const showEmbedCode = async () => {
    const code = `<script src="https://cordibase.com/embed.js" data-form-id="${form?.id}"></script>\n<div id="cordibase-form-${form?.id}"></div>`;
    await modal.alert(`Copy and paste this HTML into your website:\n\n${code}`, "Embed Code");
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!form) {
    return <div className="p-12 text-center text-ink/60">Form not found.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-linen rounded-lg transition-colors text-ink/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-ink">{form.title}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                form.isActive ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' : 'bg-[#F2F4F7] text-[#344054] border-[#D0D5DD]'
              }`}>
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-ink/60">Lead Generation Form Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={showEmbedCode}
            className="flex items-center gap-2 px-4 py-2 border border-ink/10 rounded-lg text-sm font-medium text-[#344054] hover:bg-linen transition-colors bg-white"
          >
            <Code className="w-4 h-4" />
            Get Embed Code
          </button>
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-full">
        {/* Editor Area */}
        <div className="flex-1 space-y-4">
          <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-ink/10 bg-[#F8F9FC] flex justify-between items-center">
              <h3 className="font-medium text-ink">Form Fields</h3>
              <button onClick={addField} className="flex items-center gap-1.5 text-sm font-medium text-thread hover:text-[#8B3125]">
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-ink/60 text-sm border-2 border-dashed border-ink/10 rounded-lg">
                  No fields added yet. Click "Add Field" to start building your form.
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start p-4 border border-ink/10 rounded-lg bg-[#F9FAFB] group">
                    <div className="pt-2 text-[#98A2B3] cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ink/60 mb-1">Field Label</label>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink/60 mb-1">Input Type</label>
                        <select 
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as FormField["type"] })}
                          className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread bg-white appearance-none"
                        >
                          <option value="text">Short Text</option>
                          <option value="email">Email Address</option>
                          <option value="phone">Phone Number</option>
                          <option value="textarea">Long Text (Paragraph)</option>
                          <option value="select">Dropdown Menu</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-[#344054] cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                          />
                          Required field
                        </label>
                      </div>
                    </div>
                    <button onClick={() => removeField(field.id)} className="p-2 text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar */}
        <div className="w-96 flex-shrink-0">
          <div className="sticky top-6 bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-ink/10 bg-[#F8F9FC]">
              <h3 className="font-medium text-ink">Live Preview</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xl font-semibold mb-6">{form.title}</div>
              {fields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-[#344054] mb-1">
                    {field.label} {field.required && <span className="text-[#DC2626]">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea disabled className="w-full p-2 border border-ink/10 rounded-lg text-sm bg-[#F9FAFB] text-[#98A2B3]" placeholder="User input..." rows={3} />
                  ) : field.type === 'select' ? (
                    <select disabled className="w-full p-2 border border-ink/10 rounded-lg text-sm bg-[#F9FAFB] text-[#98A2B3]">
                      <option>Select an option...</option>
                    </select>
                  ) : (
                    <input disabled type="text" className="w-full p-2 border border-ink/10 rounded-lg text-sm bg-[#F9FAFB] text-[#98A2B3]" placeholder="User input..." />
                  )}
                </div>
              ))}
              <div className="pt-4">
                <button disabled className="w-full py-2 bg-[#1D2939] text-white rounded-lg text-sm font-medium opacity-50">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
