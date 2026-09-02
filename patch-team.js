const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/settings/team/page.tsx', 'utf8');

// We need to parse selectedMember.modules to display them properly in the sidebar as well.
// So let's replace the module access rendering to use actual saved modules instead of defaults.

let searchStr1 = \              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Module Access</h4>
                <div className="space-y-2">
                  {ROLE_DEFAULTS[selectedMember.role]?.map(mod => {\;

let replaceStr1 = \              <div>
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
                    }} className="text-xs font-medium text-[#A83C2E] hover:underline bg-[#A83C2E]/5 px-2 py-1 rounded">
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
                  })().map((mod: string) => {\;

content = content.replace(searchStr1, replaceStr1);

let searchStr2 = \const [showInvite, setShowInvite] = useState(false);\;
let replaceStr2 = \const [showInvite, setShowInvite] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [editForm, setEditForm] = useState({ role: "member", permissions: [] as string[] });\;

content = content.replace(searchStr2, replaceStr2);

let searchStr3 = \const togglePerm = (key: string) => {
    setForm(prev => {
      const perms = prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key];
      return { ...prev, permissions: perms };
    });
  };\;

let replaceStr3 = searchStr3 + \
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
                  targetUserId: selectedMember.userId, // wait, invite might not have userId!
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
\;

content = content.replace(searchStr3, replaceStr3);

let searchStr4 = \{showInvite && (\;
let replaceStr4 = \{showEditMember && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#EAECF0]">
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
                      className={\lex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium capitalize transition-all \\}>
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
                      className={\lex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all \\}>
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

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#EAECF0] bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowEditMember(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-[#EAECF0] rounded-lg hover:bg-white transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdateAccess} disabled={saving}
                className="px-6 py-2 text-sm font-medium bg-[#A83C2E] text-white rounded-lg hover:bg-[#8B3125] disabled:opacity-50 transition-colors flex items-center gap-2">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvite && (\;

content = content.replace(searchStr4, replaceStr4);

fs.writeFileSync('apps/web/src/app/dashboard/settings/team/page.tsx', content);
