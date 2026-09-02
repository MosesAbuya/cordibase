const fs = require('fs');
let code = fs.readFileSync('apps/web/src/app/dashboard/layout.tsx', 'utf-8');

// 1. Add state variables for the dropdowns
code = code.replace(
  'const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);',
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userOrgs, setUserOrgs] = useState([]);
  const [authClient, setAuthClient] = useState(null);
  
  useEffect(() => {
    import("@/lib/auth-client").then(m => {
      setAuthClient(m.authClient);
      m.authClient.organization.list().then(res => {
        if(res.data) setUserOrgs(res.data);
      });
    });
  }, []);
);

// 2. Replace the Organization Switcher button with a Dropdown
const oldOrgSwitcher = {/* Organization Switcher */}
              <button 
                onClick={() => router.push('/select-organization')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#1D2939] dark:text-white bg-[#F4F6FA] dark:bg-slate-800 hover:bg-[#EAECF0] dark:hover:bg-slate-700 rounded-md transition-colors"
                title="Switch Workspace"
              >
                <Building2 size={16} className="text-[#667085]" />
                <span className="truncate max-w-[150px]">{isOrgPending ? "Loading..." : (organization?.name || "Personal Workspace")}</span>
                <ChevronDown size={14} className="text-[#667085]" />
              </button>;

const newOrgSwitcher = {/* Organization Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowOrgMenu(!showOrgMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#1D2939] dark:text-white bg-[#F4F6FA] dark:bg-slate-800 hover:bg-[#EAECF0] dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Switch Workspace"
                >
                  <Building2 size={16} className="text-[#667085]" />
                  <span className="truncate max-w-[150px]">{isOrgPending ? "Loading..." : (organization?.name || "Personal Account")}</span>
                  <ChevronDown size={14} className="text-[#667085]" />
                </button>
                {showOrgMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-[#EAECF0] dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-[#EAECF0] dark:border-slate-800">
                      <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Your Workspaces</span>
                    </div>
                    {userOrgs.length > 0 ? (
                      userOrgs.map(org => (
                        <button
                          key={org.id}
                          onClick={() => {
                            if (authClient) {
                              authClient.organization.setActive({ organizationId: org.id }).then(() => {
                                localStorage.setItem("cordibase_active_org", org.id);
                                window.location.href = "/dashboard";
                              });
                            }
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#1D2939] dark:text-white hover:bg-[#F4F6FA] dark:hover:bg-slate-800 flex items-center justify-between"
                        >
                          <span className="truncate">{org.name}</span>
                          {organization?.id === org.id && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-[#667085]">No other workspaces</div>
                    )}
                    <div className="border-t border-[#EAECF0] dark:border-slate-800 mt-1">
                      <Link href="/select-organization" className="block px-4 py-2 text-sm text-[#A83C2E] hover:bg-red-50 dark:hover:bg-red-900/10 font-medium">
                        + Create or Join Workspace
                      </Link>
                    </div>
                  </div>
                )}
              </div>;

code = code.replace(oldOrgSwitcher, newOrgSwitcher);

// 3. Add Top Right Profile Button next to Dark Mode & Notifications
const oldNotificationBlock = <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-[#667085] hover:text-[#1D2939] dark:hover:text-white transition-colors bg-[#F4F6FA] dark:bg-slate-800 hover:bg-[#EAECF0] dark:hover:bg-slate-700 rounded-md w-9 h-9 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#A83C2E]"
                >
                  <Bell size={18} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F04438] rounded-full border-2 border-[#FFFFFF] dark:border-[#0F172A]"></span>
                  )}
                </button>;

const newNotificationBlock = <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-[#667085] hover:text-[#1D2939] dark:hover:text-white transition-colors bg-[#F4F6FA] dark:bg-slate-800 hover:bg-[#EAECF0] dark:hover:bg-slate-700 rounded-md w-9 h-9 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#A83C2E]"
                >
                  <Bell size={18} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F04438] rounded-full border-2 border-[#FFFFFF] dark:border-[#0F172A]"></span>
                  )}
                </button>
                {/* Omitted the rest of notification dropdown for replace matching, wait, I can just replace the starting tag */}
;
// Let's use a simpler regex or exact replace
code = code.replace(
  '</button>\n              \n              <div className="relative">\n                <button \n                  onClick={() => setShowNotifications(!showNotifications)}',
  </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 rounded-full bg-[#F4F6FA] dark:bg-slate-800 border border-[#EAECF0] dark:border-slate-700 flex items-center justify-center text-[#1D2939] dark:text-white overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#A83C2E] shrink-0"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold text-sm">{session?.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                  )}
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-[#EAECF0] dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#EAECF0] dark:border-slate-800 flex flex-col">
                      <span className="text-sm font-bold text-[#1D2939] dark:text-white truncate">{session?.user?.name}</span>
                      <span className="text-xs text-[#667085] truncate mt-0.5">{session?.user?.email}</span>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard/settings" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-[#475467] hover:bg-[#F4F6FA] dark:text-slate-300 dark:hover:bg-slate-800">
                        Profile & Settings
                      </Link>
                      <button 
                        onClick={async () => {
                          await signOut();
                          router.push("/login");
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-[#F04438] hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
);

// 4. Update the bottom-left profile block to use session.user.image
const oldBottomProfile = <div className="w-8 h-8 rounded-full bg-[#F4F6FA] border border-[#EAECF0] flex items-center justify-center text-[#1D2939] font-semibold text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </div>;
const newBottomProfile = <div className="w-8 h-8 rounded-full bg-[#F4F6FA] border border-[#EAECF0] flex items-center justify-center text-[#1D2939] font-semibold text-sm overflow-hidden shrink-0">
                        {session.user.image ? (
                          <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{session.user.name?.charAt(0).toUpperCase() || "U"}</span>
                        )}
                      </div>;
code = code.replace(oldBottomProfile, newBottomProfile);

// Change the link to point to settings hub instead of raw profile
code = code.replace('Link href="/dashboard/profile"', 'Link href="/dashboard/settings"');
code = code.replace('Personal Workspace', 'Personal Account'); // Ensure fallback is correct

fs.writeFileSync('apps/web/src/app/dashboard/layout.tsx', code);
console.log("Updated layout.tsx successfully.");
