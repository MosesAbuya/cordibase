"use client";

import { useState, useEffect } from "react";
import { Users, X, Loader2, Search } from "lucide-react";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  source: "CRM" | "HRM";
}

export default function ContactPickerModal({ 
  onClose, 
  onAddSelected 
}: { 
  onClose: () => void;
  onAddSelected: (emails: string[]) => void;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const [crmRes, hrmRes] = await Promise.all([
        fetch("/api/crm/contacts").catch(() => null),
        fetch("/api/hrm/employees").catch(() => null)
      ]);

      let combined: Person[] = [];

      if (crmRes && crmRes.ok) {
        const data = await crmRes.json();
        const contacts = data.contacts || [];
        combined = [
          ...combined,
          ...contacts.map((c: any) => ({
            id: `crm-${c.id}`,
            firstName: c.firstName || "",
            lastName: c.lastName || "",
            email: c.email || "",
            source: "CRM" as const
          }))
        ];
      }

      if (hrmRes && hrmRes.ok) {
        const data = await hrmRes.json();
        const employees = data.employees || [];
        combined = [
          ...combined,
          ...employees.map((e: any) => ({
            id: `hrm-${e.id}`,
            firstName: e.firstName || "",
            lastName: e.lastName || "",
            email: e.email || "",
            source: "HRM" as const
          }))
        ];
      }
      
      // Filter out people without emails
      combined = combined.filter(p => p.email);

      setPeople(combined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPeople.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPeople.map(p => p.id)));
    }
  };

  const handleAdd = () => {
    const selectedEmails = people
      .filter(p => selectedIds.has(p.id))
      .map(p => p.email);
    onAddSelected(selectedEmails);
    onClose();
  };

  const filteredPeople = people.filter(p => {
    const term = search.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(term) || p.email.toLowerCase().includes(term);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-ink rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-ink/10 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-ink dark:text-white flex items-center gap-2">
              <Users size={20} />
              Select from CRM/HRM
            </h2>
            <p className="text-sm text-[#475467] dark:text-slate-400 mt-1">
              Choose contacts or employees to add as recipients.
            </p>
          </div>
          <button onClick={onClose} className="text-[#98A2B3] hover:text-[#344054] dark:hover:text-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-ink/10 dark:border-white/10">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-[#1E293B] text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p>Loading contacts and employees...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-red-600 text-center">
              Failed to load people: {error}
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No contacts or employees found.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-3 p-3 text-sm font-medium text-slate-500 border-b border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md cursor-pointer" onClick={toggleSelectAll}>
                <input type="checkbox" checked={selectedIds.size === filteredPeople.length && filteredPeople.length > 0} readOnly className="rounded border-slate-300 text-thread focus:ring-[#A83C2E]" />
                <span>Select All</span>
              </div>
              {filteredPeople.map(person => (
                <label key={person.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md cursor-pointer transition-colors border border-transparent">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(person.id)}
                    onChange={() => toggleSelect(person.id)}
                    className="rounded border-slate-300 text-thread focus:ring-[#A83C2E]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink dark:text-white truncate">
                      {person.firstName} {person.lastName}
                    </div>
                    <div className="text-sm text-slate-500 truncate">{person.email}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      person.source === "CRM" 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}>
                      {person.source}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-ink/10 dark:border-white/10 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md text-[#344054] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 bg-thread text-white rounded-md hover:bg-thread/90 transition-colors disabled:opacity-50 font-medium"
          >
            Add Selected ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
}
