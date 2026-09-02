"use client";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { usePaystackPayment } from "react-paystack";

export default function PaymentOnboardingClient() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "pk_test_placeholder_key";
  
  const config = {
    reference: (new Date()).getTime().toString(),
    email: session?.user?.email || "test@cordibase.app",
    amount: 300, 
    publicKey: paystackKey,
    currency: "KES",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setLoading(true);
    setError(null);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      if (!orgId) throw new Error("No active organization found");

      const res = await fetch('/api/billing/verify-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.reference, orgId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify payment");
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || "Error finalizing workspace setup");
      setLoading(false);
    }
  };

  const onClose = () => {
    
  };

  return (
    <div className="min-h-screen bg-linen flex flex-col items-center justify-center p-4 selection:bg-thread selection:text-white">
      <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Secure Your Workspace</h1>
        
        <p className="text-sm text-slate-600 mb-6 font-medium">
          To prevent abuse and start your 7-day free trial, we need to securely capture a payment method. 
          We will place a temporary authorization of KES 3 on your card, which will be immediately refunded.
        </p>

        {error && (
          <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 mb-6">
            <p className="text-sm text-[#DC2626] font-bold">{error}</p>
          </div>
        )}

        <button 
          onClick={() => initializePayment({ onSuccess, onClose })}
          disabled={loading}
          className="w-full bg-thread text-white px-6 py-4 text-sm font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 flex justify-center"
        >
          {loading ? "Verifying..." : "Add Payment Method & Start Trial"}
        </button>
        
        <p className="text-xs text-slate-400 mt-4 text-center">
          Powered securely by Paystack. Your card will not be charged again until your 7-day trial ends.
        </p>
      </div>
    </div>
  );
}
