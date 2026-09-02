"use client";
import { useState, useEffect } from "react";
import { useSession, useOrganization } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Building, MapPin, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const { data: organization } = useOrganization();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    orgType: "business",
    companySize: "1-10",
    industry: "",
    description: "",
    registrationNumber: "",
    address: "",
    poBox: "",
    city: "",
    country: "",
    contactPhone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    const orgId = localStorage.getItem('cordibase_active_org') || organization?.id;
    if (!orgId) {
      setError("No active workspace found. Please go back and select one.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/onboarding/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, type: formData.orgType, ...formData })
      });
      
      if (!res.ok) throw new Error("Failed to save workspace details");
      
      router.push("/onboarding/payment");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linen flex flex-col items-center justify-center p-4 selection:bg-thread/20 selection:text-ink">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        
        {/* Header Progress */}
        <div className="bg-[#1D2939] px-8 py-6 text-white flex items-center justify-between">
           <div>
             <h1 className="text-xl font-bold tracking-tight mb-1">KYC & Workspace Setup</h1>
             <p className="text-sm text-slate-300 font-medium">
               {step === 1 ? "Step 1: Basics" : step === 2 ? "Step 2: Operations" : "Step 3: Location"}
             </p>
           </div>
           <div className="flex gap-2">
             {[1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-white' : 'bg-slate-600'}`}></div>
             ))}
           </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 text-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Basic Information</h3>
                    <p className="text-xs text-slate-500">Tell us about your organization scale.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                  <select
                    name="orgType"
                    value={formData.orgType}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm bg-white"
                  >
                    <option value="business">Business / Registered Company</option>
                    <option value="personal">Personal / Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Size</label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm bg-white"
                  >
                    <option value="1">Just Me (1)</option>
                    <option value="2-10">2 - 10 employees</option>
                    <option value="11-50">11 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="201+">201+ employees</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 text-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Operational Details</h3>
                    <p className="text-xs text-slate-500">What does your business do?</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    placeholder="e.g. Technology, Retail, Healthcare"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brief Description</label>
                  <textarea
                    name="description"
                    placeholder="What services or products do you offer?"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm resize-none"
                    required
                  />
                </div>
                
                {formData.orgType === 'business' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Registration / Tax Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      placeholder="Company Registration Number or PIN"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 text-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Location & Contact</h3>
                    <p className="text-xs text-slate-500">Where are you based?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="e.g. Kenya"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Nairobi"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Building, Street Name"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">P.O. Box</label>
                    <input
                      type="text"
                      name="poBox"
                      placeholder="e.g. 12345-00100"
                      value={formData.poBox}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      placeholder="+254 700 000000"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-6 flex items-center justify-between">
              {step > 1 ? (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div></div>}
              
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#1D2939] hover:bg-black rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {step < 3 ? (
                  <>Continue <ArrowRight size={16} /></>
                ) : (
                  <>{loading ? "Saving..." : "Finish Setup"} {!loading && <ArrowRight size={16} />}</>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
