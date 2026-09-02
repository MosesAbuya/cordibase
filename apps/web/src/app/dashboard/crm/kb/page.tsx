"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, Globe, FileText } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type KBArticle = {
  id: string;
  title: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
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
      const res = await fetch('/api/crm/kb-articles', { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    const title = await modal.prompt("Enter Article Title:", "New Article");
    if (!title) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    
    const res = await fetch('/api/crm/kb-articles', {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ title, category: "General", isPublished: false })
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await modal.confirm("Delete this article?", "Are you sure?");
    if (!confirmed) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/kb-articles/${id}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' }
    });
    if (res.ok) {
      setArticles(prev => prev.filter(a => a.id !== id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleBulkDelete = async () => {
    const confirmed = await modal.confirm(`Delete ${selectedIds.size} articles?`, "Are you sure?");
    if (!confirmed) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/kb-articles`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ids: Array.from(selectedIds) })
    });
    if (res.ok) {
      setArticles(prev => prev.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredArticles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredArticles.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    (a.category && a.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ink">Knowledge Base</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          New Article
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
                placeholder="Search articles..." 
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
                    checked={filteredArticles.length > 0 && selectedIds.size === filteredArticles.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                  />
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Title</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Category</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-ink/60 uppercase tracking-wider border-b border-ink/10">Updated</th>
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
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink/60">
                    No articles found.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F9FAFB] transition-colors group cursor-default">
                    <td className="py-3 px-4">
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(a.id)}
                        onChange={() => toggleSelect(a.id)}
                        className="rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/crm/kb/${a.id}`} className="font-medium text-ink hover:text-thread transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4 text-thread" />
                        {a.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-[#344054] px-2.5 py-1 bg-[#F2F4F7] rounded-md border border-ink/10">
                        {a.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {a.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                          <Globe className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8F9FC] text-ink/60 border border-ink/10">
                          <FileEdit className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-ink/60">
                      {new Date(a.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="relative group/menu">
                        <button className="p-1.5 text-ink/60 hover:text-ink hover:bg-linen rounded-md transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-ink/10 shadow-md rounded-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
                          <Link href={`/dashboard/crm/kb/${a.id}`} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#344054] hover:bg-linen text-left">
                            <FileEdit className="w-4 h-4" /> Edit
                          </Link>
                          <button onClick={() => handleDelete(a.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] text-left">
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
