"use client";
import { useState, useEffect } from "react";
import { UserPlus, Shield, Trash2, X, ChevronRight, Mail, Calendar, Edit2 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

const ROLES = ["owner", "admin", "member", "viewer"];

const MODULE_PERMISSIONS = [
  { key: "crm",        label: "CRM & Tickets",      desc: "View and manage customers, contacts, deals and support tickets" },
  { key: "accounting", label: "Accounting",          desc: "View invoices, expenses and financial reports" },
  { key: "hrm",        label: "HR & Payroll",        desc: "View and manage employees, payroll and leave requests" },
  { key: "reports",    label: "Reports & Analytics", desc: "Access reporting dashboards and export data" },
  { key: "settings",   label: "Settings",            desc: "Manage workspace settings, billing and team" },
];

const ROLE_DEFAULTS: Record<string, string[]> = {
  owner:  ["crm","accounting","hrm","reports","settings"],
  admin:  ["crm","accounting","hrm","reports","settings"],
  member: ["crm","reports"],
  viewer: ["reports"],
};

const ROLE_DESC: Record<string, string> = {
  owner:  "Full control over the workspace, billing, and all settings.",
  admin:  "Can manage team members and access all modules.",
  member: "Standard access to assigned modules. Cannot manage settings.",
  viewer: "Read-only access. Cannot create or edit any records.",
};

export default function TeamSettings() {
  const modal = useModal();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [editForm, setEditForm] = useState({ role: "member", permissions: [] as string[] });
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "member", permissions: ROLE_DEFAULTS["member"] });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/core/organization/members`);
      if (!res.ok) { const t = await res.text(); throw new Error(`${res.status} ${t}`); }
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const setRole = (role: string) => setForm(f => ({ ...f, role, permissions: ROLE_DEFAULTS[role] }));

  const togglePerm = (key: string) => {
    setForm(prev => {
      const perms = prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: perms };
    });
  };

  const toggleEditPerm = (key: string) => {
    setEditForm(prev => {
      const perms = prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: perms };
    });
  };

  const handleUpdateAccess = async () => {
      if (!selectedMember) return;
      setSaving(true);
      try {
          const orgId = localStorage.getItem("cordibase_active_org");
          const res = await fetch("/api/members/update-modules-admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  orgId,
                  targetUserId: selectedMember.userId || selectedMember.id, // Support pending invites possibly if needed
                  modules: editForm.permissions,
                  role: editForm.role
              })
          });
          
          if (res.ok) {
              modal.alert("Access updated successfully", "Success");
              setShowEditMember(false);
              fetchMembers(); // refresh
          } else {
              const data = await res.json();
              modal.alert(data.error || "Failed to update access", "Error");
          }
      } catch(e) {
          modal.alert("Network error", "Error");
      } finally {
          setSaving(false);
      }
  };

  const handleInvite = async () => {
    if (!form.email) return;
    setSaving(true);
    try {
      const orgId = localStorage.getItem("cordibase_active_org");
      const res = await fetch("/api/auth/organization/invite-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, role: form.role, organizationId: orgId, name: form.name }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) {
           await fetch("/api/invitations/update-modules", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ inviteId: data.id, modules: form.permissions })
           });
        }
        setShowInvite(false);
        setForm({ name: "", email: "", role: "member", permissions: ROLE_DEFAULTS["member"] });
        fetchMembers();
        modal.alert("Success", `An invitation email has been sent to ${form.email}.`);
      } else {
        const err = await res.json().catch(() => ({}));
        const errMsg = err?.message || err?.error?.message || "Failed to send invitation.";
        modal.alert("Error", errMsg);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (memberId: string, memberIdentifier: string, isPending: boolean) => {
    const confirmed = await modal.confirm("Remove Member", `Are you sure you want to remove ${memberIdentifier}?`);
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/core/organization/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedMember?.id === memberId) setSelectedMember(null);
        fetchMembers();
      } else {
        const err = await res.json().catch(() => ({}));
        modal.alert("Error", err?.error || "Failed to remove member.");
      }
    } catch (e) {
      console.error(e);
      modal.alert("Error", "Failed to remove member due to a network error.");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team &amp; Roles</h2>
          <p className="text-sm text-gray-500">Manage who has access to this workspace and what they can do.</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden flex flex-1 max-h-[80vh]">
        <div className={`flex-1 overflow-auto transition-all ${selectedMember ? 'border-r border-ink/10' : ''}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink/10 bg-gray-50 sticky top-0 z-10">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No members yet. Invite your first team member!</td></tr>
              ) : members.map((m: any) => (
                <tr 
                  key={m.id} 
                  className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedMember?.id === m.id ? 'bg-gray-50' : ''}`}
                  onClick={() => setSelectedMember(m)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-thread/10 flex items-center justify-center text-sm font-semibold text-thread">
                        {(m.name || m.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{m.name || "—"}</div>
                        <div className="text-xs text-gray-500">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      <Shield className="w-3 h-3" />{m.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${!m.name ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                      {!m.name ? 'Pending' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedMember(m);
                          let parsedMods = [];
                          try {
                              parsedMods = typeof m.modules === 'string' ? JSON.parse(m.modules) : (m.modules || []);
                          } catch(e) { }
                          if (parsedMods.length === 0) parsedMods = ROLE_DEFAULTS[m.role] || [];
                          setEditForm({ role: m.role, permissions: parsedMods });
                          setShowEditMember(true);
                        }} 
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="Edit Role & Permissions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(m.id, m.name || m.email, !m.name); }} 
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Member Profile Side Panel */}
        {selectedMember && (
          <div className="w-80 bg-gray-50 border-l border-ink/10 flex flex-col h-full animate-in slide-in-from-right-4">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center bg-white">
              <h3 className="font-semibold text-gray-900">Member Profile</h3>
              <button onClick={() => setSelectedMember(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-thread/10 flex items-center justify-center text-3xl font-semibold text-thread mb-4">
                  {(selectedMember.name || selectedMember.email || "?").charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedMember.name || "Pending User"}</h2>
                <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {selectedMember.email}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
                <div className="p-4 border-b border-ink/10 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Role</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                    <Shield className="w-3 h-3" />{selectedMember.role}
                  </span>
                </div>
                <div className="p-4 border-b border-ink/10 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${!selectedMember.name ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                    {!selectedMember.name ? 'Pending' : 'Active'}
                  </span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Added</span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedMember.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Module Access</h4>
                    <button onClick={() => {
                        let parsedMods = [];
                        try {
                            parsedMods = typeof selectedMember.modules === 'string' ? JSON.parse(selectedMember.modules) : (selectedMember.modules || []);
                        } catch(e) { }
                        if (parsedMods.length === 0) parsedMods = ROLE_DEFAULTS[selectedMember.role] || [];
                        setEditForm({ role: selectedMember.role, permissions: parsedMods });
                        setShowEditMember(true);
                    }} className="text-xs font-medium text-thread hover:underline bg-thread/5 px-2 py-1 rounded">
                        Edit Access
                    </button>
                </div>
                <div className="space-y-2">
                  {(() => {
                      let savedMods = [];
                      try {
                          savedMods = typeof selectedMember.modules === 'string' ? JSON.parse(selectedMember.modules) : (selectedMember.modules || []);
                      } catch(e) {}
                      if (savedMods.length === 0) savedMods = ROLE_DEFAULTS[selectedMember.role] || [];
                      return savedMods;
                  })().map((mod: string) => {
                    const moduleInfo = MODULE_PERMISSIONS.find(m => m.key === mod);
                    return (
                      <div key={mod} className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg border border-ink/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        {moduleInfo?.label || mod}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-ink/10 bg-white">
              <button 
                onClick={() => handleDelete(selectedMember.id, selectedMember.name || selectedMember.email, !selectedMember.name)}
                className="w-full flex justify-center items-center gap-2 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove from Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {showEditMember && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-ink/10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Member Access</h3>
                <p className="text-sm text-gray-500 mt-0.5">Update role and module permissions for {selectedMember.name || selectedMember.email}.</p>
              </div>
              <button onClick={() => setShowEditMember(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="grid grid-cols-4 gap-3">
                  {ROLES.map(role => (
                    <button key={role} onClick={() => setEditForm(f => ({ ...f, role, permissions: ROLE_DEFAULTS[role] || f.permissions }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium capitalize transition-all ${editForm.role === role ? "border-thread bg-thread/5 text-thread" : "border-ink/10 text-gray-600 hover:border-gray-300"}`}>
                      <Shield className="w-5 h-5" />{role}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{ROLE_DESC[editForm.role]}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Access</label>
                <p className="text-xs text-gray-500 mb-3">Choose which parts of Cordibase this member can access.</p>
                <div className="space-y-2">
                  {MODULE_PERMISSIONS.map(mod => (
                    <label key={mod.key}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${editForm.permissions.includes(mod.key) ? "border-thread/40 bg-thread/5" : "border-ink/10 hover:border-gray-300"}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{mod.label}</div>
                        <div className="text-xs text-gray-500">{mod.desc}</div>
                      </div>
                      <input type="checkbox" checked={editForm.permissions.includes(mod.key)} onChange={() => toggleEditPerm(mod.key)}
                        className="w-4 h-4 ml-4 flex-shrink-0 accent-[#A83C2E] rounded" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-ink/10 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowEditMember(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-ink/10 rounded-lg hover:bg-white transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdateAccess} disabled={saving}
                className="px-6 py-2 text-sm font-medium bg-thread text-white rounded-lg hover:bg-[#8B3125] disabled:opacity-50 transition-colors flex items-center gap-2">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-ink/10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
                <p className="text-sm text-gray-500 mt-0.5">They will receive an invitation link via email.</p>
              </div>
              <button onClick={() => setShowInvite(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name (Optional)</label>
                  <input type="text" placeholder="e.g. Jane Doe" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-ink/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/30 focus:border-thread" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="jane@company.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-ink/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/30 focus:border-thread" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="grid grid-cols-4 gap-3">
                  {ROLES.map(role => (
                    <button key={role} onClick={() => setRole(role)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium capitalize transition-all ${form.role === role ? "border-thread bg-thread/5 text-thread" : "border-ink/10 text-gray-600 hover:border-gray-300"}`}>
                      <Shield className="w-5 h-5" />{role}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{ROLE_DESC[form.role]}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Access</label>
                <p className="text-xs text-gray-500 mb-3">Choose which parts of Cordibase this member can access.</p>
                <div className="space-y-2">
                  {MODULE_PERMISSIONS.map(mod => (
                    <label key={mod.key}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${form.permissions.includes(mod.key) ? "border-thread/40 bg-thread/5" : "border-ink/10 hover:border-gray-300"}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{mod.label}</div>
                        <div className="text-xs text-gray-500">{mod.desc}</div>
                      </div>
                      <input type="checkbox" checked={form.permissions.includes(mod.key)} onChange={() => togglePerm(mod.key)}
                        className="w-4 h-4 ml-4 flex-shrink-0 accent-[#A83C2E] rounded" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-ink/10 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-ink/10 rounded-lg hover:bg-white transition-colors">
                Cancel
              </button>
              <button onClick={handleInvite} disabled={saving || !form.email}
                className="px-6 py-2 text-sm font-medium bg-thread text-white rounded-lg hover:bg-[#8B3125] disabled:opacity-50 transition-colors flex items-center gap-2">
                {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <><UserPlus className="w-4 h-4" />Send Invitation</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
