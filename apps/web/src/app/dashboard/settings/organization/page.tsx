"use client";
import { useOrganization } from "@/lib/auth-client";
import { Building2, Camera, MapPin, Briefcase } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useModal } from "@/components/ModalProvider";

export default function OrganizationSettingsPage() {
  const { data: organization, isPending } = useOrganization();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // KYC State
  const [kycData, setKycData] = useState({
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
  const [kycLoading, setKycLoading] = useState(true);
  const [kycSaving, setKycSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modal = useModal();

  useEffect(() => {
    if (!organization?.id) return;
    
    fetch('/api/settings/workspace', {
        headers: { 'x-org-id': organization.id }
    })
    .then(res => res.json())
    .then(data => {
        if (data.settings) {
            setKycData(prev => ({ ...prev, ...data.settings }));
        }
        setKycLoading(false);
    })
    .catch(() => setKycLoading(false));
  }, [organization?.id]);

  if (isPending) {
    return <div className="p-8 text-slate-500 flex justify-center items-center h-48">Loading organization details...</div>;
  }
  
  if (!organization) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center h-64">
        <Building2 size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">No Workspace Selected</h2>
        <p className="text-slate-500 mb-6">Please select a workspace from the top menu to view its settings, or create a new one.</p>
      </div>
    );
  }

  // Initialize fields
  if (!name && organization.name && !saving) {
    setName(organization.name);
    setSlug(organization.slug);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authClient.organization.update({ 
        organizationId: organization.id,
        data: { name, slug }
      });
      if (res.error) {
        modal.alert(res.error.message || "Failed to update organization", "Error");
      } else {
        modal.alert("Organization details updated successfully", "Success");
      }
    } catch (e: any) {
      modal.alert(e.message || "An error occurred", "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleKycSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycSaving(true);
    try {
      const res = await fetch('/api/settings/workspace', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-org-id': organization.id
        },
        body: JSON.stringify(kycData)
      });
      if (res.ok) {
        modal.alert("Business details updated successfully.", "Success");
      } else {
        modal.alert("Failed to update business details.", "Error");
      }
    } catch (e: any) {
      modal.alert("An error occurred.", "Error");
    } finally {
      setKycSaving(false);
    }
  };

  const handleKycChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setKycData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await authClient.organization.update({ 
          organizationId: organization.id,
          data: { logo: base64String } 
        });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      modal.alert(err.message || "Failed to upload logo", "Error");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Organization Settings</h1>
        <p className="text-sm text-ink/60 mt-1">Manage your workspace details and branding.</p>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-ink/10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-2xl bg-linen flex items-center justify-center text-ink font-bold text-4xl shrink-0 overflow-hidden border border-ink/10 shadow-sm">
              {organization.logo ? (
                <img src={organization.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                organization.name?.charAt(0).toUpperCase() || <Building2 size={32} />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               {uploadingLogo ? (
                 <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               ) : (
                 <Camera className="text-white" size={24} />
               )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleLogoUpload}
            />
          </div>
          
          <div className="flex-1 w-full max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink/60 uppercase tracking-wider mb-1.5">Workspace Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/60 uppercase tracking-wider mb-1.5">Workspace Slug (URL)</label>
              <input 
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread"
              />
            </div>
            
            <button 
              onClick={handleSave}
              disabled={saving || (name === organization.name && slug === organization.slug)}
              className="bg-thread hover:bg-[#8C3125] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center w-full sm:w-auto"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {!kycLoading && (
        <form onSubmit={handleKycSave} className="bg-white border border-ink/10 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b border-ink/10 bg-slate-50 flex gap-3 items-center">
            <Building2 className="text-slate-500" size={24} />
            <div>
              <h2 className="text-lg font-bold text-ink">Business Profile (KYC)</h2>
              <p className="text-sm text-ink/60">Update your company registration and contact details.</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
                  <select
                    name="orgType"
                    value={kycData.orgType || "business"}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm bg-white"
                  >
                    <option value="business">Business / Registered Company</option>
                    <option value="personal">Personal / Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Size</label>
                  <select
                    name="companySize"
                    value={kycData.companySize || "1"}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm bg-white"
                  >
                    <option value="1">Just Me (1)</option>
                    <option value="2-10">2 - 10 employees</option>
                    <option value="11-50">11 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="201+">201+ employees</option>
                  </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={kycData.industry || ""}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration / Tax Number</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={kycData.registrationNumber || ""}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                  />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brief Description</label>
              <textarea
                name="description"
                value={kycData.description || ""}
                onChange={handleKycChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm resize-none"
              />
            </div>

            <hr className="border-ink/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={kycData.country || ""}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={kycData.city || ""}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                  />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                name="address"
                value={kycData.address || ""}
                onChange={handleKycChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">P.O. Box</label>
                  <input
                    type="text"
                    name="poBox"
                    value={kycData.poBox || ""}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={kycData.contactPhone || ""}
                    onChange={handleKycChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1D2939] focus:border-transparent text-sm"
                  />
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <button 
                    type="submit"
                    disabled={kycSaving}
                    className="bg-[#1D2939] hover:bg-black text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {kycSaving ? 'Saving...' : 'Update Business Details'}
                </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
