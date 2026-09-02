"use client";
import { useOrganization } from "@/lib/auth-client";
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, ExternalLink, Package, Clock, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useModal } from "@/components/ModalProvider";

export default function BillingSettingsPage() {
  const { data: organization, isPending: orgPending } = useOrganization();
  const [accessData, setAccessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  useEffect(() => {
    if (orgPending) return;
    if (!organization?.id) {
      setLoading(false);
      return;
    }
    
    fetch('/api/billing/check-access', {
      headers: { 'x-org-id': organization.id }
    })
    .then(res => res.json())
    .then(data => {
      setAccessData(data);
      setLoading(false);
    })
    .catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [organization?.id, orgPending]);

  if (orgPending || loading) {
    return <div className="p-8 text-slate-500 flex justify-center items-center h-48">Loading billing details...</div>;
  }
  
  if (!organization) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center h-64">
        <CreditCard size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">No Workspace Selected</h2>
        <p className="text-slate-500 mb-6">Please select a workspace from the top menu to view billing details.</p>
      </div>
    );
  }

  // Determine status display
  let statusColor = "bg-slate-100 text-slate-700";
  let statusText = "Unknown";
  let StatusIcon = Calendar;
  
  const orgData = accessData?.org || {};
  const isCanceled = orgData.onboardingStatus === 'canceled';
  
  let daysLeftInTrial = 0;
  let isTrialing = false;
  if (orgData.onboardingStatus === 'trialing' && orgData.trialEndsAt) {
     const end = new Date(orgData.trialEndsAt).getTime();
     const now = new Date().getTime();
     if (now < end) {
        isTrialing = true;
        daysLeftInTrial = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
     }
  }

  if (isCanceled) {
    statusColor = "bg-slate-50 text-slate-700 ring-1 ring-slate-600/20";
    statusText = "Canceled";
    StatusIcon = AlertTriangle;
  } else if (isTrialing) {
    statusColor = "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20";
    statusText = `Trial (${daysLeftInTrial} days left)`;
    StatusIcon = Clock;
  } else if (accessData?.hasAccess || orgData.onboardingStatus === 'active' || orgData.onboardingStatus === 'trialing') {
    statusColor = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
    statusText = "Active";
    StatusIcon = CheckCircle2;
  } else if (accessData?.reason === 'payment_failed' || orgData.onboardingStatus === 'past_due') {
    statusColor = "bg-red-50 text-red-700 ring-1 ring-red-600/20";
    statusText = "Payment Failed";
    StatusIcon = AlertTriangle;
  } else if (accessData?.reason === 'trial_expired') {
    statusColor = "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
    statusText = "Trial Expired";
    StatusIcon = AlertTriangle;
  }

  const handleUnsubscribe = async () => {
    const confirmed = await modal.confirm("Are you sure you want to unsubscribe? Your access will be revoked.", "Cancel Subscription");
    if (!confirmed) return;

    try {
      const res = await fetch('/api/billing/unsubscribe', {
        method: 'POST',
        headers: { 'x-org-id': organization.id }
      });
      if (res.ok) {
        modal.alert("Your subscription has been canceled.", "Unsubscribed");
        window.location.reload();
      } else {
        modal.alert("Failed to cancel subscription", "Error");
      }
    } catch (err) {
       modal.alert("Network error", "Error");
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-ink/60 mt-1">Manage your subscription, payment methods, and billing history.</p>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-ink/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-thread mb-2 uppercase tracking-wide">
              <Package size={16} />
              Cordibase Standard Package
            </div>
            <h2 className="text-lg font-bold text-ink">Current Subscription</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-black text-ink tracking-tight">KES 3,000</span>
              <span className="text-ink/60 text-sm">/ month</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
               <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                 <StatusIcon size={14} />
                 {statusText}
               </span>
               {!isCanceled && (
                 <span className="text-sm text-ink/60">
                   Next billing cycle: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                 </span>
               )}
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
            <Link 
              href="/dashboard/billing"
              className="bg-[#1D2939] hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors text-center shadow-sm"
            >
              Update Payment Method
            </Link>
            {!isCanceled && (
              <button 
                onClick={handleUnsubscribe}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors text-center shadow-sm"
              >
                Unsubscribe
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6 md:p-8 bg-[#F9FAFB]">
          <div className="flex items-center gap-3 text-ink font-bold mb-4">
            <CreditCard size={20} className="text-thread" />
            <h3>Payment Information</h3>
          </div>
          <div className="bg-white border border-ink/10 rounded-lg p-4">
             {orgData.paystackAuthorizationCode ? (
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-8 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                     <span className="text-xs font-bold text-slate-500">CARD</span>
                   </div>
                   <div>
                     <p className="text-sm font-bold text-ink">Verified Payment Method Attached</p>
                     <p className="text-xs text-ink/60">Active authorization code present</p>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-sm text-ink/60 flex flex-col gap-2">
                 <p>No active payment method found.</p>
                 <Link href="/dashboard/billing" className="text-thread font-medium hover:underline inline-flex items-center gap-1">
                   Add a card to continue <ExternalLink size={14} />
                 </Link>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Upsell / Upgrade Section */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink tracking-tight">Upgrade Your Experience</h2>
          <p className="text-sm text-ink/60 mt-1">Unlock advanced capabilities and scale your operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Plan */}
          <div className="bg-white border border-ink/10 rounded-xl p-6 relative overflow-hidden group hover:border-thread hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={64} className="text-thread" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-ink mb-1">Cordibase Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-black text-ink">KES 8,500</span>
                <span className="text-sm text-ink/60">/ month</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-thread mt-0.5 shrink-0" />
                  <span><strong>Advanced Reporting</strong> - Custom report builder & automated email exports</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-thread mt-0.5 shrink-0" />
                  <span><strong>Priority Support</strong> - 24/7 dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-thread mt-0.5 shrink-0" />
                  <span><strong>Unlimited Workflows</strong> - Automate all your repetitive tasks</span>
                </li>
              </ul>
              
              <button className="w-full bg-slate-50 hover:bg-thread hover:text-white border border-ink/10 hover:border-thread text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors">
                Contact Sales to Upgrade
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gradient-to-br from-[#1D2939] to-[#0f1623] rounded-xl p-6 relative overflow-hidden text-white shadow-lg">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck size={64} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-black text-white">Custom</span>
                <span className="text-sm text-slate-300">Pricing</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Custom Integrations</strong> - Connect with your existing legacy systems</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>White-labeling</strong> - Completely remove Cordibase branding</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span><strong>Dedicated Infrastructure</strong> - Isolated servers for maximum compliance</span>
                </li>
              </ul>
              
              <button className="w-full bg-white hover:bg-gray-100 text-ink font-bold py-2.5 rounded-lg text-sm transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
