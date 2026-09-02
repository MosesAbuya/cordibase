"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, ArrowUpRight, LifeBuoy } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Ticket = {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const modal = useModal();

  const showEmbedCode = () => {
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('cordibase_active_org') : null;
    const embedStr = `<iframe src="http://localhost:3000/widget/support/${orgId}" width="400" height="600" frameborder="0"></iframe>`;
    modal.prompt(
      'Embed Support Widget',
      'Copy the following HTML to embed the ticketing form on your website:',
      embedStr
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch('/api/crm/tickets', { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    const subject = await modal.prompt("Enter Ticket Subject:", "New Support Ticket");
    if (!subject) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    
    const res = await fetch('/api/crm/tickets', {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ subject, status: "open", priority: "medium" })
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await modal.confirm("Delete this ticket?", "Are you sure?");
    if (!confirmed) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/tickets/${id}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' }
    });
    if (res.ok) {
      setTickets(prev => prev.filter(t => t.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await modal.confirm(`Delete ${selectedIds.size} tickets?`, "Are you sure?");
    if (!confirmed) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/tickets`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ids: Array.from(selectedIds) })
    });
    if (res.ok) {
      setTickets(prev => prev.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTickets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTickets.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ink">Support Tickets</h2>
        <div className="flex gap-2">
          <button onClick={showEmbedCode} className="flex items-center gap-2 bg-white border border-[#D0D5DD] text-[#344054] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F9FAFB] transition-colors shadow-sm">
            Get Embed Code
          </button>
          <button onClick={handleCreate} className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-[#F8F9FC]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread w-64 bg-white"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-ink/10 rounded-lg text-sm font-medium text-[#344054] hover:bg-linen transition-colors bg-white">
              <Filter className="w-4 h-4 text-ink/60" />
              Filters
            </button>
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
                    checked={filteredTickets.length > 0 && selectedIds.size === filteredTickets.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                  />
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Subject</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Priority</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Created</th>
                <th className="py-3 px-4 w-16 border-b border-ink/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink/60">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F9FAFB] transition-colors group cursor-default">
                    <td className="py-3 px-4">
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/crm/tickets/${t.id}`} className="font-medium text-ink hover:text-thread transition-colors flex items-center gap-2">
                        <LifeBuoy className="w-4 h-4 text-thread" />
                        {t.subject}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        t.status === 'open' ? 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]' :
                        t.status === 'in_progress' ? 'bg-[#FEF0C7] text-[#B54708] border-[#FEC84B]' :
                        t.status === 'resolved' ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' :
                        'bg-[#F2F4F7] text-[#344054] border-[#D0D5DD]'
                      }`}>
                        {t.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        t.priority === 'urgent' ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5]' :
                        t.priority === 'high' ? 'bg-[#FFF4ED] text-[#C4320A] border-[#F9DBAF]' :
                        t.priority === 'medium' ? 'bg-[#F8F9FC] text-[#344054] border-[#D0D5DD]' :
                        'bg-[#F8F9FC] text-ink/60 border-ink/10'
                      }`}>
                        {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-ink/60">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="relative group/menu">
                        <button className="p-1.5 text-ink/60 hover:text-ink hover:bg-linen rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-ink/10 shadow-md rounded-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
                          <Link href={`/dashboard/crm/tickets/${t.id}`} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#344054] hover:bg-linen text-left">
                            <FileEdit className="w-4 h-4" /> View
                          </Link>
                          <button onClick={() => handleDelete(t.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] text-left">
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
