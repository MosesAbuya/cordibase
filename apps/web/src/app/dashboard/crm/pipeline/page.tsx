"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, DollarSign, Briefcase, Star, MoreVertical, Trash2, Edit2, ArrowUpDown, LayoutList, LayoutGrid } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Deal = {
  id: string;
  title: string;
  amount: number;
  stage: string;
  probability: number;
  companyId: string | null;
  isStarred: boolean;
};

type Company = {
  id: string;
  name: string;
};

const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
const STAGE_LABELS: Record<string, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export default function PipelinePage() {
  const modal = useModal();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isAdding, setIsAdding] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  
  const [formData, setFormData] = useState({ title: "", amount: "", stage: "prospecting", probability: "10", companyId: "" });
  
  // Table State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: keyof Deal; direction: 'asc' | 'desc' } | null>(null);
  const [activeDropdownMenu, setActiveDropdownMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const [dealsRes, companiesRes] = await Promise.all([
        fetch("/api/crm/deals", { headers: { 'x-org-id': orgId || '' } }),
        fetch("/api/crm/companies", { headers: { 'x-org-id': orgId || '' } })
      ]);
      
      if (dealsRes.ok) {
        const d = await dealsRes.json();
        setDeals(d.deals || []);
      }
      if (companiesRes.ok) {
        const c = await companiesRes.json();
        setCompanies(c.companies || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = localStorage.getItem('cordibase_active_org');
    
    const payload = {
      ...formData,
      amount: Math.round(parseFloat(formData.amount) * 100),
      probability: parseInt(formData.probability, 10),
      companyId: formData.companyId || null
    };

    const res = await fetch("/api/crm/deals", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setIsAdding(false);
      setFormData({ title: "", amount: "", stage: "prospecting", probability: "10", companyId: "" });
      fetchData();
    } else {
      modal.alert("Failed to add deal.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;
    const orgId = localStorage.getItem('cordibase_active_org');

    const payload = {
      ...formData,
      amount: Math.round(parseFloat(formData.amount) * 100),
      probability: parseInt(formData.probability, 10),
      companyId: formData.companyId || null,
      isStarred: editingDeal.isStarred
    };

    const res = await fetch(`/api/crm/deals/${editingDeal.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setEditingDeal(null);
      fetchData();
    } else {
      modal.alert("Failed to update deal.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!await modal.confirm("Are you sure you want to delete this deal?")) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/deals/${id}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' },
    });
    if (res.ok) {
      fetchData();
      setActiveDropdownMenu(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!await modal.confirm(`Are you sure you want to delete ${selectedIds.size} deals?`)) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/deals`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ids: Array.from(selectedIds) })
    });
    if (res.ok) {
      setSelectedIds(new Set());
      fetchData();
    } else {
      modal.alert("Failed to delete deals");
    }
  };

  const toggleStar = async (deal: Deal, e: React.MouseEvent) => {
    e.stopPropagation();
    const orgId = localStorage.getItem('cordibase_active_org');
    
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, isStarred: !d.isStarred } : d));
    
    await fetch(`/api/crm/deals/${deal.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...deal, isStarred: !deal.isStarred }),
    });
  };

  // Table sorting & filtering
  const filteredAndSortedDeals = useMemo(() => {
    let result = [...deals];
    
    // Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) || 
        STAGE_LABELS[d.stage].toLowerCase().includes(q)
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
      // default sort by starred first, then value
      result.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return b.amount - a.amount; // highest amount first
      });
    }
    
    return result;
  }, [deals, searchQuery, sortConfig]);

  const toggleSort = (key: keyof Deal) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedDeals.length && filteredAndSortedDeals.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedDeals.map(d => d.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const openEditModal = (d: Deal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDeal(d);
    setFormData({
      title: d.title, amount: (d.amount / 100).toString(), stage: d.stage, probability: d.probability.toString(), companyId: d.companyId || ""
    });
    setActiveDropdownMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-ink">Pipeline</h2>
          <p className="text-sm text-ink/60">Manage deals and opportunities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsAdding(true); setFormData({title:"", amount:"", stage:"prospecting", probability:"10", companyId:""}); }} className="inline-flex items-center px-4 py-2 bg-thread hover:bg-[#8B3125] text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add Deal
          </button>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl overflow-visible">
        {/* Toolbar */}
        <div className="p-4 border-b border-ink/10 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/60" />
            <input 
              type="text" 
              placeholder="Search deals..." 
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
                      checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedDeals.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-2 py-3 w-8"></th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('title')}>
                    <div className="flex items-center gap-1">Deal Title <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center gap-1">Amount <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('stage')}>
                    <div className="flex items-center gap-1">Stage <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('probability')}>
                    <div className="flex items-center gap-1">Probability <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-4 py-3 w-12 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedDeals.map((d) => (
                  <tr 
                    key={d.id} 
                    onClick={() => router.push(`/dashboard/crm/deals/${d.id}`)}
                    className={`border-b border-ink/10 hover:bg-linen/50 transition-colors cursor-pointer group ${selectedIds.has(d.id) ? 'bg-linen/80' : ''}`}
                  >
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-ink/10 text-thread focus:ring-[#A83C2E]"
                        checked={selectedIds.has(d.id)}
                        onChange={(e) => toggleSelect(d.id, e as any)}
                      />
                    </td>
                    <td className="px-2 py-4 text-center">
                      <button onClick={(e) => toggleStar(d, e)} className="text-ink/60 hover:text-[#F59E0B] transition-colors focus:outline-none">
                        <Star className={`w-4 h-4 ${d.isStarred ? 'fill-[#F59E0B] text-[#F59E0B]' : 'opacity-0 group-hover:opacity-100'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-ink block">{d.title}</span>
                      {d.companyId && (
                        <span className="text-xs text-ink/60 flex items-center gap-1 mt-1">
                          <Briefcase className="w-3 h-3" />
                          {companies.find(c => c.id === d.companyId)?.name || 'Unknown Company'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">${(d.amount / 100).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-linen text-ink border border-ink/10">
                        {STAGE_LABELS[d.stage]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#EAECF0] rounded-full overflow-hidden">
                          <div className={`h-full ${d.probability >= 75 ? 'bg-emerald-500' : d.probability >= 50 ? 'bg-amber-500' : 'bg-thread'}`} style={{ width: `${d.probability}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-ink">{d.probability}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right relative" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => setActiveDropdownMenu(activeDropdownMenu === d.id ? null : d.id)}
                        className="p-1.5 text-ink/60 hover:bg-[#EAECF0] rounded-lg transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeDropdownMenu === d.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownMenu(null)}></div>
                          <div className="absolute right-8 top-10 w-40 bg-white border border-ink/10 shadow-modal rounded-lg py-1 z-20 animate-in fade-in zoom-in-95">
                            <button onClick={(e) => openEditModal(d, e)} className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-linen flex items-center gap-2">
                              <Edit2 className="w-4 h-4 text-ink/60" /> Edit
                            </button>
                            <button onClick={() => handleDelete(d.id)} className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2">
                              <Trash2 className="w-4 h-4 text-[#DC2626]" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAndSortedDeals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center hover:bg-transparent cursor-default">
                      <DollarSign className="w-12 h-12 text-[#EAECF0] mx-auto mb-3" />
                      <p className="text-ink font-medium">No deals found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAdding || editingDeal) && (
        <div className="fixed inset-0 bg-[#1D2939]/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-semibold text-ink">{isAdding ? 'Add Deal' : 'Edit Deal'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingDeal(null); }} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Deal Title *</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Amount ($) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Probability (%) *</label>
                  <input required type="number" min="0" max="100" value={formData.probability} onChange={e => setFormData({...formData, probability: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Stage</label>
                <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                  {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Related Company</label>
                <select value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                  <option value="">None</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingDeal(null); }} className="px-4 py-2 text-sm font-medium text-ink hover:bg-linen rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors">Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
