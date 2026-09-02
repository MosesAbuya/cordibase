"use client";

import { useSession, signOut, useOrganization, authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Briefcase,
  Mail,
  LogOut,
  Building2,
  Settings,
  CreditCard,
  Search,
  Moon,
  Sun,
  ChevronDown
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: organization, isPending: isOrgPending } = useOrganization();
  
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userOrgs, setUserOrgs] = useState<any[]>([]);

  useEffect(() => {
    authClient.organization.list().then((res: any) => {
      if (res.data) setUserOrgs(res.data);
    });
  }, []);

  useEffect(() => {
    // Strictly force light mode on mount to match the requested design default
    document.documentElement.classList.remove('dark');
    setIsDarkMode(false);
    
    fetch('/api/core/notifications')
      .then(r => r.json())
      .then(d => { if (d.notifications) setNotifications(d.notifications); });
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const delay = setTimeout(() => {
        fetch(`/api/core/search?q=${encodeURIComponent(searchQuery)}`)
          .then(r => r.json())
          .then(d => { if (d.results) setSearchResults(d.results); });
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await fetch(`/api/core/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/login");
      return;
    } 
    
    if (!isOrgPending && session) {
      if (!organization) {
        const cachedOrg = typeof window !== 'undefined' ? localStorage.getItem('cordibase_active_org') : null;
        if (!cachedOrg) {
          router.push("/select-organization");
          return;
        } else {
          // Restore the active organization from localStorage cache
          const hasRestored = typeof window !== 'undefined' ? sessionStorage.getItem('cordibase_org_restored') : null;
          if (!hasRestored) {
            sessionStorage.setItem('cordibase_org_restored', 'true');
            authClient.organization.setActive({ organizationId: cachedOrg }).then(() => {
              window.location.reload();
            });
            return;
          } else {
             // We already tried restoring but it failed (cookie dropped). Fallback.
             // At this point we just let them stay on the dashboard, but organization will be null.
          }
        }
      }

      // Check access status for the active organization
      const orgId = organization?.id || localStorage.getItem('cordibase_active_org');
      if (orgId) {
        fetch('/api/billing/check-access', {
          headers: { 'x-org-id': orgId }
        })
        .then(res => res.json())
        .then(data => {
          if (data.redirect && pathname !== data.redirect && !pathname.startsWith(data.redirect)) {
            // Prevent redirect loop if they are already heading there
            // Only redirect if not already in the target
            if (data.redirect === '/dashboard/settings/billing' && pathname === '/dashboard/settings/billing') {
               return;
            }
            router.push(data.redirect);
          }
        })
        .catch(console.error);
      }
    }
  }, [session, isSessionPending, organization, isOrgPending, router, pathname]);

  if (isSessionPending || isOrgPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linen">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-thread border-t-transparent animate-spin rounded-full mb-4"></div>
          <p className="text-[14px] text-ink/60 font-medium font-sans">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  const activeMember = organization?.members?.find((m: any) => m.userId === session?.user?.id);
  const activeRole = activeMember?.role || 'member';
  const isAdmin = activeRole === 'admin' || activeRole === 'owner';
  
  // Try to parse modules safely (could be string or array)
  let allowedModules: string[] = [];
  if (activeMember?.modules) {
     try {
         allowedModules = typeof activeMember.modules === 'string' ? JSON.parse(activeMember.modules) : activeMember.modules;
     } catch(e) {
         allowedModules = [];
     }
  } else if (isAdmin) {
     allowedModules = ['crm', 'accounting', 'hrm', 'reports', 'emailing'];
  }
  
  const hasModuleAccess = (mod: string) => isAdmin || allowedModules.includes(mod);

    const navItems = [
      { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
      ...(hasModuleAccess('crm') ? [{ name: "CRM", path: "/dashboard/crm", icon: <Users size={18} /> }] : []),
      ...(hasModuleAccess('accounting') ? [{ name: "Accounting", path: "/dashboard/accounting", icon: <BookOpen size={18} /> }] : []),
      ...(hasModuleAccess('hrm') ? [{ name: "HRM", path: "/dashboard/hrm", icon: <Briefcase size={18} /> }] : []),
      { name: "Emailing", path: "/dashboard/emailing", icon: <Mail size={18} /> },
      ...(isAdmin ? [{ name: "Billing", path: "/dashboard/settings/billing", icon: <CreditCard size={18} /> }] : []),
      ...(isAdmin ? [{ name: "Settings", path: "/dashboard/settings/team", icon: <Settings size={18} /> }] : []),
    ];

  return (
    <div className="flex h-screen bg-linen dark:bg-ink font-sans overflow-hidden selection:bg-thread/20 selection:text-ink dark:selection:text-white">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-ink flex flex-col shrink-0 border-r border-ink/10 dark:border-white/10 transition-all duration-200 ease-in-out ${isSidebarCollapsed ? 'w-[80px]' : 'w-[260px] relative'}`}>
        {/* Brand */}
        <div className="h-[64px] flex items-center justify-between px-6 border-b border-ink/10 dark:border-white/10">
          <div className="flex items-center">
             <Building2 className="text-thread" size={24} />
             {!isSidebarCollapsed && <span className="text-[20px] font-bold text-ink dark:text-white ml-2">Cordibase</span>}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="py-4 flex-1 overflow-y-auto">
          {!isSidebarCollapsed && (
             <div className="text-[11px] uppercase tracking-wider text-ink/60 font-semibold mb-2 px-6 mt-2">Main Menu</div>
          )}
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
              const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
              const isActive = item.path === "/dashboard" ? pathname === "/dashboard" : active;
              
              return (
                <Link 
                  key={item.name}
                  href={item.path} 
                  className={`flex items-center mx-4 px-3 py-[10px] rounded-[6px] text-[14px] font-medium transition-colors group relative ${
                    isActive 
                      ? "bg-thread/[0.08] text-thread" 
                      : "text-ink/60 hover:bg-linen dark:hover:bg-slate-800 hover:text-ink dark:hover:text-white"
                  }`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-[3px] h-full bg-thread rounded-r-md"></div>
                  )}
                  <span className={`flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? "text-thread" : "text-ink/60 group-hover:text-ink dark:group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Context */}
        <div className="p-4 border-t border-ink/10 dark:border-white/10">
           {!isSidebarCollapsed ? (
             <div className="flex items-center justify-between">
                  <Link href="/dashboard/settings/profile" className="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-linen border border-ink/10 flex items-center justify-center text-ink font-semibold text-sm overflow-hidden shrink-0">
                      {session.user.image ? (
                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{session.user.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[13px] font-medium text-ink dark:text-white truncate">{session.user.name}</div>
                      <div className="text-[11px] text-ink/60 truncate">{isOrgPending ? "Loading..." : (organization?.name || "Personal Account")}</div>
                    </div>
                  </Link>
                <button 
                  onClick={async () => {
                    await signOut();
                    router.push("/login");
                  }}
                  className="text-ink/60 hover:text-[#F04438] transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#A83C2E]"
                >
                  <LogOut size={16} />
                </button>
             </div>
           ) : (
             <div className="flex justify-center">
               <button 
                  onClick={async () => {
                    await signOut();
                    router.push("/login");
                  }}
                  className="text-ink/60 hover:text-[#F04438] transition-colors p-1"
                >
                  <LogOut size={18} />
                </button>
             </div>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[64px] bg-white dark:bg-ink border-b border-ink/10 dark:border-white/10 flex items-center px-6 shrink-0 justify-between sticky top-0 z-10">
          <div className="flex-1 flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-ink/60 hover:text-ink dark:hover:text-white transition-colors focus:outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-ink dark:text-white hidden sm:block">
              {navItems.find(n => pathname === n.path || pathname.startsWith(`${n.path}/`))?.name || "Dashboard"}
            </h1>
            
            {/* Global Search */}
            <div className="relative w-full max-w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-ink/60" />
              </div>
              <input
                type="text"
                placeholder="Search Keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] text-[14px] leading-5 bg-white dark:bg-ink text-ink dark:text-white placeholder-[#667085] focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-thread transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-ink/60 text-[12px] font-mono border border-ink/10 dark:border-slate-700 rounded px-1.5 py-0.5 bg-linen dark:bg-slate-800">ÃƒÂ¢Ã…â€™Ã‹Å“K</span>
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && searchQuery.length > 1 && (
                <div className="absolute top-[calc(100%+8px)] w-[400px] bg-white dark:bg-slate-900 border border-ink/10 dark:border-slate-700 rounded-[8px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((res: any) => (
                      <Link 
                        key={res.id} 
                        href={res.link}
                        onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                        className="flex items-start p-3 hover:bg-linen dark:hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-[14px] font-medium text-ink dark:text-white">{res.title}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-[12px] text-ink/60 mr-2">{res.type}</span>
                            {res.subtitle && <span className="text-[12px] text-ink/60">&bull; {res.subtitle}</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
              {/* Organization Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowOrgMenu(!showOrgMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink dark:text-white bg-linen dark:bg-slate-800 hover:bg-[#EAECF0] dark:hover:bg-slate-700 rounded-md transition-colors"
                  title="Switch Workspace"
                >
                  <Building2 size={16} className="text-ink/60" />
                  <span className="truncate max-w-[150px]">{isOrgPending ? "Loading..." : (organization?.name || "Personal Account")}</span>
                  <ChevronDown size={14} className="text-ink/60" />
                </button>
                {showOrgMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-ink/10 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-ink/10 dark:border-white/10">
                      <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider">Your Workspaces</span>
                    </div>
                    {userOrgs.length > 0 ? (
                      userOrgs.map(org => (
                        <button
                          key={org.id}
                          onClick={() => {
                            authClient.organization.setActive({ organizationId: org.id }).then(() => {
                              localStorage.setItem("cordibase_active_org", org.id);
                              window.location.href = "/dashboard";
                            });
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-ink dark:text-white hover:bg-linen dark:hover:bg-slate-800 flex items-center justify-between"
                        >
                          <span className="truncate">{org.name}</span>
                          {organization?.id === org.id && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-ink/60">No other workspaces</div>
                    )}
                    <div className="border-t border-ink/10 dark:border-white/10 mt-1">
                      <Link href="/select-organization" className="block px-4 py-2 text-sm text-thread hover:bg-red-50 dark:hover:bg-red-900/10 font-medium">
                        + Create or Join Workspace
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            <button 
              onClick={toggleDarkMode}
              className="text-ink/60 hover:text-ink dark:hover:text-white transition-colors bg-linen dark:bg-slate-800 hover:bg-[#EAECF0] dark:hover:bg-slate-700 rounded-md w-9 h-9 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#A83C2E]"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-full bg-linen dark:bg-slate-800 border border-ink/10 dark:border-slate-700 flex items-center justify-center text-ink dark:text-white overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#A83C2E] shrink-0"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-sm">{session?.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                )}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-ink/10 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-ink/10 dark:border-white/10 flex flex-col">
                    <span className="text-sm font-bold text-ink dark:text-white truncate">{session?.user?.name}</span>
                    <span className="text-xs text-ink/60 truncate mt-0.5">{session?.user?.email}</span>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/settings/profile" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-[#475467] hover:bg-linen dark:text-slate-300 dark:hover:bg-slate-800">
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
                className="text-ink/60 hover:text-ink dark:hover:text-white transition-colors bg-linen dark:bg-slate-800 hover:bg-[#EAECF0] dark:hover:bg-slate-700 rounded-md w-9 h-9 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#A83C2E]"
              >
                <Bell size={18} />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#F04438] rounded-full border-2 border-[#FFFFFF] dark:border-[#0F172A]"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-ink/10 dark:border-slate-700 rounded-[8px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-50">
                  <div className="p-3 border-b border-ink/10 dark:border-white/10 flex justify-between items-center">
                    <h3 className="font-semibold text-ink dark:text-white text-[14px]">Notifications</h3>
                    <span className="text-[11px] bg-thread/10 text-thread font-medium px-2 py-0.5 rounded-full">
                      {notifications.filter(n => !n.isRead).length} New
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-[13px] text-ink/60 text-center">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-4 border-b border-ink/10 dark:border-white/10 hover:bg-linen dark:hover:bg-slate-800 cursor-pointer transition-colors relative ${!n.isRead ? 'bg-thread/[0.02]' : ''}`}
                        >
                          {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-thread"></div>}
                          <p className="text-[13px] font-medium text-ink dark:text-white mb-1">{n.title}</p>
                          <p className="text-[13px] text-ink/60 mb-2 leading-relaxed">{n.message}</p>
                          <p className="text-[11px] text-ink/60">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-ink/10 dark:border-white/10">
                     <a href="#" className="text-[13px] font-medium text-thread hover:underline">View all notifications</a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-9 h-9 rounded-full bg-thread/10 text-thread flex items-center justify-center font-bold text-[14px] cursor-pointer ml-2">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "U")}&background=F6F1E7&color=5B5FF0`} alt="Avatar" className="w-full h-full rounded-full" />
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-[1400px] mx-auto text-ink dark:text-slate-100">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}






