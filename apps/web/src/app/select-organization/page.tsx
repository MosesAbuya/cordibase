"use client";

import { useState, useEffect } from "react";
import { useSession, useOrganization, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Building2, Hexagon, ArrowRight, Briefcase, User, Sparkles, Server } from "lucide-react";
import Link from "next/link";

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: orgData, isPending: isOrgPending } = useOrganization();
  
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgType, setOrgType] = useState<'business' | 'personal'>('business');
  
  const [existingOrgs, setExistingOrgs] = useState<any[]>([]);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await authClient.organization.list();
        if (res.data) {
          setExistingOrgs(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      } finally {
        setCheckingExisting(false);
      }
    };
    if (session) {
      fetchOrgs();
    } else if (!isSessionPending) {
      setCheckingExisting(false);
    }
  }, [session, isSessionPending]);

  const handleSelectOrg = async (orgId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const setRes = await authClient.organization.setActive({ organizationId: orgId });
      if (setRes.error) {
        setError(setRes.error.message || "Failed to select workspace");
        setIsSubmitting(false);
      } else {
        localStorage.setItem('cordibase_active_org', orgId);
        window.location.href = "/dashboard?t=" + Date.now();
      }
    } catch (err: any) {
      setError(err.message || "Error selecting workspace");
      setIsSubmitting(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const res = await authClient.organization.create({
        name: orgName,
        slug: orgSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      });
      
      if (res.error) {
        throw new Error(res.error.message || "Failed to create organization");
      }
      
      if (res.data?.id) {
        const setRes = await authClient.organization.setActive({ organizationId: res.data.id });
        if (setRes.error) {
          setError(setRes.error.message || "Created, but failed to set active");
        } else {
          localStorage.setItem('cordibase_active_org', res.data.id);
          
          // Configure the custom type and status
          await fetch('/api/billing/onboarding/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgId: res.data.id, type: orgType })
          });
          
          window.location.href = "/onboarding/payment";
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (isSessionPending || isOrgPending || checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-thread border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-ink">
      {/* Left side: Form/Selection */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 xl:p-24 relative overflow-y-auto">
        {/* Brand Logo */}
        <div className="flex items-center justify-between mb-16 lg:mb-24">
          <div className="flex items-center gap-2 text-thread cursor-pointer" onClick={() => router.push('/')}>
            <Hexagon className="fill-thread" size={28} />
            <span className="font-bold text-xl tracking-tight text-ink">Cordibase</span>
          </div>
          {session?.user && (
            <div className="text-xs font-medium px-3 py-1.5 bg-ink/5 rounded-full text-ink/60 border border-ink/10">
              {session.user.email}
            </div>
          )}
        </div>

        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink tracking-tight mb-3">Select your workspace</h1>
            <p className="text-ink/60 text-sm">Cordibase is a multi-tenant platform. Please select or create a workspace to continue.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="text-red-500 mt-0.5">!</div>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {existingOrgs.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xs font-bold text-ink/40 uppercase tracking-widest mb-4">Your Workspaces</h3>
              <div className="space-y-3">
                {existingOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrg(org.id)}
                    disabled={isSubmitting}
                    className="w-full text-left flex items-center justify-between p-4 rounded-xl border border-ink/10 hover:border-thread hover:bg-thread/5 transition-all group focus:outline-none focus:ring-2 focus:ring-thread/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center text-ink group-hover:bg-thread/10 group-hover:text-thread transition-colors">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-ink">{org.name}</div>
                        <div className="text-xs text-ink/50 mt-0.5">cordibase.app/{org.slug}</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-ink/10 flex items-center justify-center text-ink/40 group-hover:bg-thread group-hover:text-white group-hover:border-thread transition-all shadow-sm">
                      <ArrowRight size={16} />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ink/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-ink/40 uppercase tracking-widest font-bold">Or create new</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateOrg} className="space-y-5 bg-ink/5 p-6 lg:p-8 rounded-2xl border border-ink/10">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrgType('business')}
                  className={"flex flex-col items-center justify-center p-4 rounded-xl border transition-all " + (orgType === 'business' ? 'bg-white border-thread shadow-sm text-thread ring-1 ring-thread/20' : 'bg-transparent border-ink/10 text-ink/60 hover:bg-ink/5')}
                >
                  <Briefcase size={24} className="mb-2" />
                  <span className="text-sm font-semibold">Business</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrgType('personal')}
                  className={"flex flex-col items-center justify-center p-4 rounded-xl border transition-all " + (orgType === 'personal' ? 'bg-white border-thread shadow-sm text-thread ring-1 ring-thread/20' : 'bg-transparent border-ink/10 text-ink/60 hover:bg-ink/5')}
                >
                  <User size={24} className="mb-2" />
                  <span className="text-sm font-semibold">Personal</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Workspace Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  if (!orgSlug) {
                    setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white focus:outline-none focus:ring-2 focus:ring-thread/50 focus:border-thread transition-all text-ink placeholder:text-ink/30"
                placeholder={orgType === 'business' ? "Acme Corp" : "John's Workspace"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-2">URL Slug</label>
              <div className="flex border border-ink/10 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-thread/50 focus-within:border-thread transition-all">
                <span className="px-4 py-3 bg-ink/5 border-r border-ink/10 text-ink/50 text-sm font-medium whitespace-nowrap">
                  cordibase.app/
                </span>
                <input
                  type="text"
                  required
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="w-full px-3 py-3 border-none bg-transparent focus:outline-none focus:ring-0 text-sm text-ink"
                  placeholder={orgType === 'business' ? "acme-corp" : "john-doe"}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-thread hover:bg-thread-dark text-white font-medium py-3 px-4 rounded-xl transition-all mt-4 disabled:opacity-70 shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Initialize Workspace"}
            </button>
          </form>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:flex w-1/2 bg-moss relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] opacity-50"></div>
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-thread rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-marigold rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        
        {/* Floating UI Presentation */}
        <div className="relative z-10 w-full max-w-lg glass-panel p-10 rounded-[2rem] shadow-2xl border border-white/20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Server className="text-white" size={32} />
            </div>
            <div>
              <h3 className="text-white font-bold text-2xl">Isolated Environments</h3>
              <p className="text-white/70 text-sm mt-1">Enterprise-grade data separation</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/10 border border-white/10 rounded-xl p-5 backdrop-blur-md transform transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-thread/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-thread" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Dedicated AI Knowledge Base</h4>
                  <p className="text-white/60 text-xs mt-1">Trained exclusively on your workspace's data</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 border border-white/10 rounded-xl p-5 backdrop-blur-md transform transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-marigold/20 flex items-center justify-center">
                  <Building2 size={20} className="text-marigold" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Custom SMTP & Branding</h4>
                  <p className="text-white/60 text-xs mt-1">Emails and invoices carry your organization's brand</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
