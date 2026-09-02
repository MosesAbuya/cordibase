"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Zap, Star, MoreVertical, Trash2, Edit2, ArrowUpDown } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Workflow = {
  id: string;
  title: string;
  description: string | null;
  triggerType: string;
  isActive: boolean;
  isStarred: boolean;
};

const TRIGGER_LABELS: Record<string, string> = {
  field_change: "Property Change",
  record_created: "New Record",
  stage_change: "Stage Change",
  time_based: "Scheduled",
  manual: "Manual Trigger"
};

export default function WorkflowsPage() {
  const modal = useModal();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isAdding, setIsAdding] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  
  const [formData, setFormData] = useState({ title: "", description: "", triggerType: "record_created", isActive: false });
  
  // Table State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: keyof Workflow; direction: 'asc' | 'desc' } | null>(null);
  const [activeDropdownMenu, setActiveDropdownMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch("/api/crm/workflows", { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch("/api/crm/workflows", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setIsAdding(false);
      setFormData({ title: "", description: "", triggerType: "record_created", isActive: false });
      fetchWorkflows();
    } else {
      modal.alert("Failed to create workflow.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkflow) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/workflows/${editingWorkflow.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...formData, isStarred: editingWorkflow.isStarred }),
    });
    if (res.ok) {
      setEditingWorkflow(null);
      fetchWorkflows();
    } else {
      modal.alert("Failed to update workflow.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!await modal.confirm("Are you sure you want to delete this workflow?")) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/workflows/${id}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' },
    });
    if (res.ok) {
      fetchWorkflows();
      setActiveDropdownMenu(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!await modal.confirm(`Are you sure you want to delete ${selectedIds.size} workflows?`)) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/workflows`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ids: Array.from(selectedIds) })
    });
    if (res.ok) {
      setSelectedIds(new Set());
      fetchWorkflows();
    } else {
      modal.alert("Failed to delete workflows");
    }
  };

  const toggleStar = async (w: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    const orgId = localStorage.getItem('cordibase_active_org');
    setWorkflows(prev => prev.map(item => item.id === w.id ? { ...item, isStarred: !item.isStarred } : item));
    await fetch(`/api/crm/workflows/${w.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...w, isStarred: !w.isStarred }),
    });
  };

  const toggleActive = async (w: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    const orgId = localStorage.getItem('cordibase_active_org');
    setWorkflows(prev => prev.map(item => item.id === w.id ? { ...item, isActive: !item.isActive } : item));
    await fetch(`/api/crm/workflows/${w.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...w, isActive: !w.isActive }),
    });
  };

  // Table sorting & filtering
  const filteredAndSortedWorkflows = useMemo(() => {
    let result = [...workflows];
    
    // Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => 
        w.title.toLowerCase().includes(q) || 
        (w.description && w.description.toLowerCase().includes(q))
      );
    }
    
    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bVal === null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return a.title.localeCompare(b.title);
      });
    }
    
    return result;
  }, [workflows, searchQuery, sortConfig]);

  const toggleSort = (key: keyof Workflow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedWorkflows.length && filteredAndSortedWorkflows.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedWorkflows.map(w => w.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const openEditModal = (w: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkflow(w);
    setFormData({
      title: w.title, description: w.description || "", triggerType: w.triggerType, isActive: w.isActive
    });
    setActiveDropdownMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-ink">Workflows</h2>
          <p className="text-sm text-ink/60">Automate actions based on CRM events.</p>
        </div>
        <button onClick={() => { setIsAdding(true); setFormData({title:"",description:"",triggerType:"record_created",isActive:false}); }} className="inline-flex items-center px-4 py-2 bg-thread hover:bg-[#8B3125] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Create Workflow
        </button>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl overflow-visible">
        {/* Toolbar */}
        <div className="p-4 border-b border-ink/10 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/60" />
            <input 
              type="text" 
              placeholder="Search workflows..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" 
            />
          </div>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 bg-linen px-3 py-1.5 rounded-lg border border-ink/10 animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-medium text-ink">{selectedIds.size} selected</span>
              <div className="w-px h-4 bg-[#EAECF0]"></div>
              <button onClick={handleBulkDelete} className="text-sm font-medium text-[#DC2626] hover:text-[#B91C1C] flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-left text-ink/60">
              <thead className="text-xs text-ink/60 uppercase bg-linen border-b border-ink/10">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-ink/10 text-thread focus:ring-[#A83C2E]"
                      checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedWorkflows.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-2 py-3 w-8"></th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('title')}>
                    <div className="flex items-center gap-1">Workflow <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('triggerType')}>
                    <div className="flex items-center gap-1">Trigger <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('isActive')}>
                    <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-4 py-3 w-12 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedWorkflows.map((w) => (
                  <tr 
                    key={w.id} 
                    onClick={() => router.push(`/dashboard/crm/workflows/${w.id}`)}
                    className={`border-b border-ink/10 hover:bg-linen/50 transition-colors cursor-pointer group ${selectedIds.has(w.id) ? 'bg-linen/80' : ''}`}
                  >
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-ink/10 text-thread focus:ring-[#A83C2E]"
                        checked={selectedIds.has(w.id)}
                        onChange={(e) => toggleSelect(w.id, e as any)}
                      />
                    </td>
                    <td className="px-2 py-4 text-center">
                      <button onClick={(e) => toggleStar(w, e)} className="text-ink/60 hover:text-[#F59E0B] transition-colors focus:outline-none">
                        <Star className={`w-4 h-4 ${w.isStarred ? 'fill-[#F59E0B] text-[#F59E0B]' : 'opacity-0 group-hover:opacity-100'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-ink block">{w.title}</span>
                      {w.description && <span className="text-xs text-ink/60 mt-1 line-clamp-1">{w.description}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F6F1E7] text-thread border border-thread/20">
                        <Zap className="w-3 h-3 mr-1" />
                        {TRIGGER_LABELS[w.triggerType] || w.triggerType}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={w.isActive} onChange={(e) => toggleActive(w, e as any)} />
                        <div className="w-9 h-5 bg-[#EAECF0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]"></div>
                        <span className="ml-3 text-sm font-medium text-ink">{w.isActive ? 'Active' : 'Draft'}</span>
                      </label>
                    </td>
                    <td className="px-4 py-4 text-right relative" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => setActiveDropdownMenu(activeDropdownMenu === w.id ? null : w.id)}
                        className="p-1.5 text-ink/60 hover:bg-[#EAECF0] rounded-lg transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeDropdownMenu === w.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownMenu(null)}></div>
                          <div className="absolute right-8 top-10 w-40 bg-white border border-ink/10 shadow-modal rounded-lg py-1 z-20 animate-in fade-in zoom-in-95">
                            <button onClick={(e) => openEditModal(w, e)} className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-linen flex items-center gap-2">
                              <Edit2 className="w-4 h-4 text-ink/60" /> Edit Info
                            </button>
                            <button onClick={() => handleDelete(w.id)} className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2">
                              <Trash2 className="w-4 h-4 text-[#DC2626]" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAndSortedWorkflows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center hover:bg-transparent cursor-default">
                      <Zap className="w-12 h-12 text-[#EAECF0] mx-auto mb-3" />
                      <p className="text-ink font-medium">No workflows found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAdding || editingWorkflow) && (
        <div className="fixed inset-0 bg-[#1D2939]/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-semibold text-ink">{isAdding ? 'Create Workflow' : 'Edit Workflow Settings'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingWorkflow(null); }} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Workflow Title *</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. New Lead Welcome Email" className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none resize-none min-h-[60px]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Enrollment Trigger</label>
                <select value={formData.triggerType} onChange={e => setFormData({...formData, triggerType: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                  {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingWorkflow(null); }} className="px-4 py-2 text-sm font-medium text-ink hover:bg-linen rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors">{isAdding ? 'Create' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
