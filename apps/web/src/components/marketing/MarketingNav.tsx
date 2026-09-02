"use client";

import Link from "next/link";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-linen/90 backdrop-blur-md border-b border-ink/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* Logo icon representation: A simple 3D pin/circle */}
          <div className="w-8 h-8 rounded-full bg-thread flex items-center justify-center shadow-resting">
            <div className="w-3 h-3 rounded-full bg-cardsurface"></div>
          </div>
          <Link href="/" className="text-2xl font-display font-medium text-ink">
            Cordibase
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setModulesDropdownOpen(true)}
            onMouseLeave={() => setModulesDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 text-base font-medium text-ink/80 hover:text-thread transition-colors relative group">
              Modules <ChevronDown size={14} className={`transition-transform ${modulesDropdownOpen ? "rotate-180" : ""}`} />
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-thread transition-all duration-200 group-hover:w-full"></span>
            </button>
            
            {/* Dropdown */}
            {modulesDropdownOpen && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-56">
                <div className="bg-cardsurface rounded-[18px] shadow-hover flex flex-col p-2 border border-ink/5">
                  <Link href="/modules/crm" className="px-4 py-3 text-sm text-ink/80 hover:text-thread hover:bg-linen rounded-xl transition-colors font-medium">CRM: Connect Sales</Link>
                  <Link href="/modules/accounting" className="px-4 py-3 text-sm text-ink/80 hover:text-thread hover:bg-linen rounded-xl transition-colors font-medium">Accounting: Track Value</Link>
                  <Link href="/modules/hrm" className="px-4 py-3 text-sm text-ink/80 hover:text-thread hover:bg-linen rounded-xl transition-colors font-medium">HRM: Manage People</Link>
                </div>
              </div>
            )}
          </div>
          
          <Link href="/pricing" className="text-base font-medium text-ink/80 hover:text-thread transition-colors relative group">
            Pricing
            <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-thread transition-all duration-200 group-hover:w-full"></span>
          </Link>
          <Link href="#" className="text-base font-medium text-ink/80 hover:text-thread transition-colors relative group">
            Docs
            <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-thread transition-all duration-200 group-hover:w-full"></span>
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {session?.user ? (
            <div className="relative flex items-center gap-4">
              <Link href="/dashboard" className="text-base font-medium px-6 py-2.5 bg-[#1D2939] text-white rounded-full hover:bg-black transition-colors shadow-sm">
                Dashboard
              </Link>
              <div className="relative" onMouseEnter={() => setProfileDropdownOpen(true)} onMouseLeave={() => setProfileDropdownOpen(false)}>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-thread/10 text-thread hover:bg-thread/20 transition-colors cursor-pointer border border-thread/20">
                  <User size={18} />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute top-10 right-0 pt-2 w-48">
                    <div className="bg-white rounded-xl shadow-lg border border-ink/10 p-1 flex flex-col">
                      <div className="px-3 py-2 border-b border-ink/10 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                      <Link href="/dashboard/settings/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-ink rounded-lg transition-colors">
                        <User size={14} /> Profile Settings
                      </Link>
                      <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left">
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-base font-medium text-ink hover:text-thread transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="text-base font-medium px-8 py-3 bg-thread text-cardsurface rounded-full hover:bg-thread-dark hover:-translate-y-[2px] transition-all duration-150 shadow-resting hover:shadow-hover">
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cardsurface border-b border-ink/5 flex flex-col p-6 space-y-6 shadow-xl">
          <Link href="/modules/crm" className="text-ink font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>CRM Module</Link>
          <Link href="/modules/accounting" className="text-ink font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>Accounting Module</Link>
          <Link href="/modules/hrm" className="text-ink font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>HRM Module</Link>
          <Link href="/pricing" className="text-ink font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <div className="h-px bg-ink/10 w-full my-2"></div>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-ink font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</Link>
              <button onClick={handleSignOut} className="text-red-600 font-medium text-lg text-left" onClickCapture={() => setMobileMenuOpen(false)}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link href="/register" className="text-cardsurface font-medium bg-thread px-6 py-3 rounded-full text-center" onClick={() => setMobileMenuOpen(false)}>Start Free Trial</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
