"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, Webhook, ArrowUpRight } from "lucide-react";

import { useModal } from "@/components/ModalProvider";

type WebForm = {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function FormsPage() {
  const [forms, setForms] = useState<WebForm[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const modal = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch('/api/crm/forms', { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        setForms(data.forms || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    const title = await modal.prompt("Enter Form Name:", "New Form");
    if (!title) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    
    const res = await fetch('/api/crm/forms', {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ title })
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await modal.confirm("Delete this form?", "Are you sure?");
    if (!confirmed) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/forms/${id}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' }
    });
    if (res.ok) {
      setForms(prev => prev.filter(f => f.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await modal.confirm(`Delete ${selectedIds.size} forms?`, "Are you sure?");
    if (!confirmed) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/forms`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ids: Array.from(selectedIds) })
    });
    if (res.ok) {
      setForms(prev => prev.filter(f => !selectedIds.has(f.id)));
      setSelectedIds(new Set());
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredForms.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredForms.map(f => f.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleActive = async (form: WebForm) => {
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/forms/${form.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...form, isActive: !form.isActive })
    });
    if (res.ok) {
      setForms(prev => prev.map(f => f.id === form.id ? { ...f, isActive: !f.isActive } : f));
    }
  };

  const filteredForms = forms.filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ink">Web Forms</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Create Form
        </button>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-[#F8F9FC]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search forms..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread w-64 bg-white"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 mr-4 animate-in fade-in slide-in-from-right-4">
                <span className="text-sm text-ink/60 font-medium">{selectedIds.size} selected</span>
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-1.5 bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] rounded-lg text-sm font-medium hover:bg-[#FEE2E2] transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-linen sticky top-0 z-10 border-b border-ink/10">
              <tr>
                <th className="py-3 px-4 w-12 border-b border-ink/10">
                  <input 
                    type="checkbox" 
                    checked={filteredForms.length > 0 && selectedIds.size === filteredForms.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                  />
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Last Updated</th>
                <th className="py-3 px-4 w-16 border-b border-ink/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredForms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink/60">
                    No forms found.
                  </td>
                </tr>
              ) : (
                filteredForms.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F9FAFB] transition-colors group cursor-default">
                    <td className="py-3 px-4">
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(f.id)}
                        onChange={() => toggleSelect(f.id)}
                        className="rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      <div className="flex items-center gap-2">
                        <Webhook className="w-4 h-4 text-thread" />
                        {f.title}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only peer" checked={f.isActive} onChange={() => toggleActive(f)} />
                          <div className="w-9 h-5 bg-[#EAECF0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]"></div>
                        </div>
                        <span className={`text-sm ${f.isActive ? 'text-[#027A48]' : 'text-ink/60'}`}>
                          {f.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="py-3 px-4 text-sm text-ink/60">
                      {new Date(f.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="relative group/menu">
                        <button className="p-1.5 text-ink/60 hover:text-ink hover:bg-linen rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-ink/10 shadow-md rounded-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
                          <Link href={`/dashboard/crm/forms/${f.id}`} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#344054] hover:bg-linen text-left">
                            <FileEdit className="w-4 h-4" /> Edit
                          </Link>
                          <button onClick={() => handleDelete(f.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] text-left">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
