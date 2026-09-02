"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Briefcase, Calendar, FileText, CheckSquare, MoreVertical, Star, Edit2, Trash2, Mail, Phone, ExternalLink } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Deal = {
  id: string;
  title: string;
  amount: number;
  stage: string;
  probability: number;
  companyId: string | null;
  isStarred: boolean;
};

type Company = {
  id: string;
  name: string;
};

type Activity = {
  id: string;
  type: "email" | "call" | "meeting" | "note" | "task";
  title: string;
  description: string | null;
  timestamp: string;
};

const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
const STAGE_LABELS: Record<string, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export default function DealDetailPage() {
  const modal = useModal();
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [activityType, setActivityType] = useState<"note" | "call" | "meeting" | "email">("note");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit Modal
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: "", amount: "", stage: "prospecting", probability: "10", companyId: "" });
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dealId]);

  const fetchData = async () => {
    setIsLoading(true);
    const orgId = localStorage.getItem('cordibase_active_org');
    
    try {
      const [dealsRes, compRes, activityRes] = await Promise.all([
        fetch(`/api/crm/deals`, { headers: { 'x-org-id': orgId || '' } }),
        fetch(`/api/crm/companies`, { headers: { 'x-org-id': orgId || '' } }),
        fetch(`/api/crm/activities`, { headers: { 'x-org-id': orgId || '' } })
      ]);

      if (compRes.ok) {
        const d = await compRes.json();
        setCompanies(d.companies || []);
      }

      if (dealsRes.ok) {
        const data = await dealsRes.json();
        const found = (data.deals || []).find((d: any) => d.id === dealId);
        if (found) {
          setDeal(found);
          setFormData({
            title: found.title, amount: (found.amount / 100).toString(), 
            stage: found.stage, probability: found.probability.toString(), companyId: found.companyId || ""
          });
        }
      }
      
      if (activityRes.ok) {
        const data = await activityRes.json();
        const filtered = (data.activities || []).filter((a: any) => a.dealId === dealId);
        const sorted = filtered.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setActivities(sorted);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    
    const payload = {
      ...formData,
      amount: Math.round(parseFloat(formData.amount) * 100),
      probability: parseInt(formData.probability, 10),
      companyId: formData.companyId || null,
      isStarred: deal.isStarred
    };

    const res = await fetch(`/api/crm/deals/${deal.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setIsEditing(false);
      fetchData();
    } else {
      modal.alert("Failed to update deal.");
    }
  };

  const handleDelete = async () => {
    if (!await modal.confirm("Are you sure you want to delete this deal?")) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/deals/${dealId}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' },
    });
    if (res.ok) {
      router.push('/dashboard/crm/pipeline');
    }
  };

  const toggleStar = async () => {
    if (!deal) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    setDeal({ ...deal, isStarred: !deal.isStarred });
    await fetch(`/api/crm/deals/${deal.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...deal, isStarred: !deal.isStarred }),
    });
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    setIsSubmitting(true);
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch("/api/crm/activities", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({
        dealId, // <--- logging to deal
        type: activityType,
        title: activityTitle,
        description: activityDesc
      })
    });

    if (res.ok) {
      setActivityTitle("");
      setActivityDesc("");
      fetchData();
    } else {
      modal.alert("Failed to log activity");
    }
    setIsSubmitting(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'call': return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'note': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-rose-500" />;
      default: return <FileText className="w-4 h-4 text-ink/60" />;
    }
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!deal) {
    return <div className="p-12 text-center text-ink/60">Deal not found.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-linen rounded-lg transition-colors text-ink/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-ink">{deal.title}</h2>
              <button onClick={toggleStar} className="p-1 hover:bg-linen rounded-md transition-colors">
                <Star className={`w-5 h-5 ${deal.isStarred ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#D0D5DD]'}`} />
              </button>
            </div>
            <p className="text-sm text-ink/60">{(deal.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} · {deal.probability}% Probability</p>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowOptions(!showOptions)} className="p-2 text-ink/60 hover:bg-[#EAECF0] rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
          {showOptions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)}></div>
              <div className="absolute right-0 top-10 w-48 bg-white border border-ink/10 shadow-modal rounded-lg py-1 z-20 animate-in zoom-in-95">
                <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-linen flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-ink/60" /> Edit Deal
                </button>
                <div className="h-px bg-[#EAECF0] my-1"></div>
                <button onClick={() => { handleDelete(); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-[#DC2626]" /> Delete Deal
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 items-start h-full pb-6">
        {/* Left Column: Details */}
        <div className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-white border border-ink/10 rounded-xl p-5">
            <h3 className="font-medium text-ink mb-4">Pipeline Info</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-ink/60 mb-1">Stage</div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-linen text-ink border border-ink/10">
                  {STAGE_LABELS[deal.stage]}
                </span>
              </div>
              
              {deal.companyId && (
                <div>
                  <div className="text-ink/60 mb-1">Related Company</div>
                  <div className="flex items-center gap-2 text-ink font-medium">
                    <Briefcase className="w-4 h-4 text-ink/60" />
                    {companies.find(c => c.id === deal.companyId)?.name || 'Unknown'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-ink/10">
              <div className="text-ink/60 mb-2 text-sm">Win Probability</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#EAECF0] rounded-full overflow-hidden">
                  <div className={`h-full ${deal.probability >= 75 ? 'bg-emerald-500' : deal.probability >= 50 ? 'bg-amber-500' : 'bg-thread'}`} style={{ width: `${deal.probability}%` }}></div>
                </div>
                <span className="text-xs font-medium text-ink w-8 text-right">{deal.probability}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="flex-1 bg-white border border-ink/10 rounded-xl p-6 h-full overflow-y-auto">
          {/* Composer */}
          <div className="mb-8 border border-ink/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#A83C2E]/20 focus-within:border-thread transition-all">
            <div className="bg-linen px-4 py-2 border-b border-ink/10 flex gap-4">
              {(["note", "call", "meeting", "email"] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => setActivityType(type)}
                  className={`text-sm font-medium capitalize pb-1 border-b-2 transition-colors ${activityType === type ? 'border-thread text-ink' : 'border-transparent text-ink/60 hover:text-ink'}`}
                >
                  Log {type}
                </button>
              ))}
            </div>
            <form onSubmit={handleLogActivity} className="p-4 bg-white">
              <input 
                placeholder={activityType === 'note' ? "Note title..." : `Subject of the ${activityType}...`}
                required
                value={activityTitle}
                onChange={e => setActivityTitle(e.target.value)}
                className="w-full font-medium text-ink placeholder:font-normal focus:outline-none mb-2"
              />
              <textarea 
                placeholder={`Start typing to log a ${activityType}...`}
                value={activityDesc}
                onChange={e => setActivityDesc(e.target.value)}
                className="w-full text-sm text-ink focus:outline-none resize-none min-h-[60px]"
              />
              <div className="flex justify-end mt-2">
                <button 
                  disabled={isSubmitting || !activityTitle.trim()}
                  type="submit" 
                  className="px-4 py-2 bg-thread text-white text-sm font-medium rounded-lg hover:bg-[#8B3125] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline Feed */}
          <div className="space-y-6">
            <h3 className="font-semibold text-ink">Deal Timeline</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-ink/60">No activity logged yet.</p>
            ) : (
              <div className="relative border-l-2 border-ink/10 ml-3 pl-6 space-y-8">
                {activities.map(activity => (
                  <div key={activity.id} className="relative">
                    <div className="absolute -left-[35px] top-0 p-1.5 bg-white border border-ink/10 rounded-full shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-ink text-sm">{activity.title}</h4>
                        <span className="text-xs text-ink/60">
                          {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-ink/60 capitalize mb-1">{activity.type}</p>
                      {activity.description && (
                        <div className="mt-2 text-sm text-ink bg-linen/50 p-3 rounded-lg border border-ink/10">
                          {activity.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-[#1D2939]/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-semibold text-ink">Edit Deal</h3>
              <button onClick={() => setIsEditing(false)} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Deal Title *</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Amount ($) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Probability (%) *</label>
                  <input required type="number" min="0" max="100" value={formData.probability} onChange={e => setFormData({...formData, probability: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Stage</label>
                <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                  {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Related Company</label>
                <select value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                  <option value="">None</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-linen rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
