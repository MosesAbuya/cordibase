"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Mail, Phone, UserCircle, Star, MoreVertical, Trash2, Edit2, ArrowUpDown } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  department: string | null;
  isStarred: boolean;
};

export default function ContactsPage() {
  const modal = useModal();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isAdding, setIsAdding] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", title: "", department: "" });
  
  // Table State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: keyof Contact; direction: 'asc' | 'desc' } | null>(null);
  const [activeDropdownMenu, setActiveDropdownMenu] = useState<string | null>(null); // track which row's dropdown is open

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch("/api/crm/contacts", { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setIsAdding(false);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", title: "", department: "" });
      fetchContacts();
    } else {
      modal.alert("Failed to add contact.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/contacts/${editingContact.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...formData, isStarred: editingContact.isStarred }),
    });
    if (res.ok) {
      setEditingContact(null);
      fetchContacts();
    } else {
      modal.alert("Failed to update contact.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!await modal.confirm("Are you sure you want to delete this contact?")) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/contacts/${id}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' },
    });
    if (res.ok) {
      fetchContacts();
      setActiveDropdownMenu(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!await modal.confirm(`Are you sure you want to delete ${selectedIds.size} contacts?`)) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/contacts`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ids: Array.from(selectedIds) })
    });
    if (res.ok) {
      setSelectedIds(new Set());
      fetchContacts();
    } else {
      modal.alert("Failed to delete contacts");
    }
  };

  const toggleStar = async (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    const orgId = localStorage.getItem('cordibase_active_org');
    
    // Optimistic UI update
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, isStarred: !c.isStarred } : c));
    
    await fetch(`/api/crm/contacts/${contact.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...contact, isStarred: !contact.isStarred }),
    });
  };

  // Table sorting & filtering
  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];
    
    // Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.firstName.toLowerCase().includes(q) || 
        c.lastName.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
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
      // default sort by starred first, then name
      result.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return a.firstName.localeCompare(b.firstName);
      });
    }
    
    return result;
  }, [contacts, searchQuery, sortConfig]);

  const toggleSort = (key: keyof Contact) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedContacts.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const openEditModal = (c: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingContact(c);
    setFormData({
      firstName: c.firstName, lastName: c.lastName, email: c.email || "", 
      phone: c.phone || "", title: c.title || "", department: c.department || ""
    });
    setActiveDropdownMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-ink">Contacts</h2>
          <p className="text-sm text-ink/60">Manage the people connected to your workspace.</p>
        </div>
        <button onClick={() => { setIsAdding(true); setFormData({firstName:"",lastName:"",email:"",phone:"",title:"",department:""}); }} className="inline-flex items-center px-4 py-2 bg-thread hover:bg-[#8B3125] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </button>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl overflow-visible">
        {/* Toolbar */}
        <div className="p-4 border-b border-ink/10 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/60" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
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
                      checked={selectedIds.size > 0 && selectedIds.size === filteredAndSortedContacts.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-2 py-3 w-8"></th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('firstName')}>
                    <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('title')}>
                    <div className="flex items-center gap-1">Title / Dept <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-6 py-3 font-medium cursor-pointer hover:bg-[#EAECF0]/50 transition-colors" onClick={() => toggleSort('email')}>
                    <div className="flex items-center gap-1">Contact Info <ArrowUpDown className="w-3.5 h-3.5"/></div>
                  </th>
                  <th className="px-4 py-3 w-12 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedContacts.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => router.push(`/dashboard/crm/contacts/${c.id}`)}
                    className={`border-b border-ink/10 hover:bg-linen/50 transition-colors cursor-pointer group ${selectedIds.has(c.id) ? 'bg-linen/80' : ''}`}
                  >
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-ink/10 text-thread focus:ring-[#A83C2E]"
                        checked={selectedIds.has(c.id)}
                        onChange={(e) => toggleSelect(c.id, e as any)}
                      />
                    </td>
                    <td className="px-2 py-4 text-center">
                      <button onClick={(e) => toggleStar(c, e)} className="text-ink/60 hover:text-[#F59E0B] transition-colors focus:outline-none">
                        <Star className={`w-4 h-4 ${c.isStarred ? 'fill-[#F59E0B] text-[#F59E0B]' : 'opacity-0 group-hover:opacity-100'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F6F1E7] flex items-center justify-center text-thread font-medium uppercase">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <span className="font-medium text-ink">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-ink">{c.title || "-"}</div>
                      <div className="text-xs">{c.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {c.email && <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {c.email}</span>}
                        {c.phone && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {c.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right relative" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => setActiveDropdownMenu(activeDropdownMenu === c.id ? null : c.id)}
                        className="p-1.5 text-ink/60 hover:bg-[#EAECF0] rounded-lg transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {activeDropdownMenu === c.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownMenu(null)}></div>
                          <div className="absolute right-8 top-10 w-40 bg-white border border-ink/10 shadow-modal rounded-lg py-1 z-20 animate-in fade-in zoom-in-95">
                            <button onClick={(e) => openEditModal(c, e)} className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-linen flex items-center gap-2">
                              <Edit2 className="w-4 h-4 text-ink/60" /> Edit
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2">
                              <Trash2 className="w-4 h-4 text-[#DC2626]" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAndSortedContacts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center hover:bg-transparent cursor-default">
                      <UserCircle className="w-12 h-12 text-[#EAECF0] mx-auto mb-3" />
                      <p className="text-ink font-medium">No contacts found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAdding || editingContact) && (
        <div className="fixed inset-0 bg-[#1D2939]/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-semibold text-ink">{isAdding ? 'Add Contact' : 'Edit Contact'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingContact(null); }} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">First Name *</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Last Name *</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Title</label>
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Department</label>
                  <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingContact(null); }} className="px-4 py-2 text-sm font-medium text-ink hover:bg-linen rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
