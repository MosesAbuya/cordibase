'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { CreditCard, CheckCircle2 } from 'lucide-react';

type Subscription = {
  moduleSlug: string;
  status: string;
  currentPeriodEnd: string;
};

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/core/billing/subscriptions')
      .then(res => res.json())
      .then(data => {
        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = async (moduleSlug: string, amount: number) => {
    try {
      const res = await fetch('/api/core/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleSlug, amount })
      });
      const data = await res.json();
      
      if (data.access_code && (window as any).PaystackPop) {
        const paystack = new (window as any).PaystackPop();
        paystack.resumeTransaction(data.access_code, {
          onSuccess: (transaction: any) => {
            fetch('/api/core/billing/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: transaction.reference, moduleSlug })
            }).then(() => {
              window.location.reload();
            });
          },
          onCancel: () => {
            console.log('Payment cancelled');
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isSubscribed = (slug: string) => {
    return subscriptions.some(s => s.moduleSlug === slug && s.status === 'active');
  };

  const modules = [
    { slug: 'crm', name: 'CRM Module', description: 'Manage contacts, leads, and pipelines.', price: 20 },
    { slug: 'accounting', name: 'Accounting Module', description: 'Invoices, expenses, and double-entry bookkeeping.', price: 30 },
    { slug: 'hrm', name: 'HRM Module', description: 'Employees, leave, and payroll.', price: 25 },
  ];

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-4 border-thread border-t-transparent animate-spin rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-6 relative w-full">
      <Script src="https://js.paystack.co/v2/inline.js" strategy="lazyOnload" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-ink dark:text-white">Billing & Subscriptions</h2>
          <p className="text-[13px] text-ink/60 mt-1">Manage your active plans and payment methods.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const active = isSubscribed(mod.slug);
          return (
            <div key={mod.slug} className={`bg-white dark:bg-ink border rounded-[12px] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06)] flex flex-col ${active ? 'border-thread ring-1 ring-[#A83C2E]/20' : 'border-ink/10 dark:border-white/10'}`}>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-ink dark:text-white">{mod.name}</h3>
                  {active && <span className="bg-[#17B26A]/10 text-[#17B26A] text-[12px] font-medium px-2 py-0.5 rounded-full flex items-center"><CheckCircle2 size={12} className="mr-1" /> Active</span>}
                </div>
                <p className="text-[13px] text-ink/60 mb-6 min-h-[40px]">{mod.description}</p>
                <div className="flex items-end mb-8">
                  <span className="text-[28px] font-bold text-ink dark:text-white tabular-nums">${mod.price}</span>
                  <span className="text-[13px] text-ink/60 ml-1 mb-1.5">/ month</span>
                </div>
              </div>
              
              {active ? (
                <button disabled className="w-full py-2.5 bg-linen dark:bg-slate-800 text-ink/60 rounded-[6px] text-[13px] font-medium cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button 
                  onClick={() => handleSubscribe(mod.slug, mod.price)}
                  className="w-full py-2.5 bg-thread text-white rounded-[6px] text-[13px] font-medium hover:bg-[#8B3125] transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
                >
                  Subscribe to {mod.name.split(' ')[0]}
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Payment Methods placeholder */}
      <div className="mt-8 bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] shadow-[0_1px_2px_rgba(16,24,40,0.06)] p-6">
        <h3 className="text-[16px] font-bold text-ink dark:text-white mb-4">Payment Methods</h3>
        <div className="flex items-center justify-between border border-ink/10 dark:border-slate-700 rounded-[8px] p-4 bg-[#F9FAFB] dark:bg-slate-800/50">
           <div className="flex items-center gap-3">
             <div className="w-10 h-7 bg-white border border-ink/10 rounded flex items-center justify-center">
               <CreditCard size={16} className="text-ink/60" />
             </div>
             <div>
               <p className="text-[14px] font-medium text-ink dark:text-white">Paystack securely saves your cards after checkout.</p>
               <p className="text-[12px] text-ink/60 mt-0.5">Subscriptions will be auto-renewed.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
