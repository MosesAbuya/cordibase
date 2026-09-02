"use client";
import { useEffect, useState } from "react";
import { Trash2, User, Mail, Calendar, Shield } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type UserData = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
};

export default function SuperadminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const modal = useModal();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: UserData) => {
    setEditingId(user.id);
    setEditForm({ name: user.name, email: user.email });
  };

  const saveEdit = async (userId: string) => {
    try {
      const res = await fetch(`/api/superadmin/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, name: editForm.name, email: editForm.email } : u));
        setEditingId(null);
      } else {
        modal.alert("Failed to update user", "Error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId: string) => {
    const isConfirmed = await modal.confirm("Are you sure you want to permanently delete this user? This cannot be undone.", "Delete User");
    if (!isConfirmed) return;
    
    try {
      const res = await fetch(`/api/superadmin/users?id=${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        modal.alert("Failed to delete user", "Error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Platform Users</h1>
        <p className="text-ink/60 mt-1">Manage all registered users across the entire platform.</p>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-ink/10 text-xs uppercase tracking-wider text-ink/60 font-semibold">
              <th className="p-4">User</th>
              <th className="p-4">Authentication</th>
              <th className="p-4">Joined On</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0] text-sm">
            {users.map(u => {
              const isEditing = editingId === u.id;
              
              return (
              <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linen flex items-center justify-center text-ink font-bold border border-ink/10 shrink-0">
                      {u.name?.charAt(0).toUpperCase() || <User size={16} />}
                    </div>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          value={editForm.name} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                          className="border border-ink/10 rounded px-2 py-1 text-sm outline-none focus:border-thread"
                        />
                        <input 
                          type="email" 
                          value={editForm.email} 
                          onChange={e => setEditForm({...editForm, email: e.target.value})}
                          className="border border-ink/10 rounded px-2 py-1 text-sm outline-none focus:border-thread"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-ink">{u.name}</div>
                        <div className="text-ink/60 flex items-center gap-1 text-xs mt-0.5">
                          <Mail size={12} /> {u.email}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${u.emailVerified ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20'}`}>
                    {u.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="p-4 text-ink/60">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="text-slate-500 hover:bg-slate-100 px-3 py-1 rounded text-xs font-bold">Cancel</button>
                      <button onClick={() => saveEdit(u.id)} className="bg-thread text-white px-3 py-1 rounded text-xs font-bold shadow hover:bg-[#8C3125]">Save</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => startEdit(u)}
                        className="text-ink/60 hover:text-ink hover:bg-linen p-2 rounded transition-colors"
                        title="Edit User"
                      >
                        <User size={16} /> {/* Edit icon metaphor */}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="text-[#F04438] hover:bg-[#FEF3F2] p-2 rounded transition-colors inline-flex items-center"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )})}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-ink/60">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
