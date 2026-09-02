"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Clock, Users, Type, AlignLeft } from "lucide-react";

type Campaign = {
  id: string;
  title: string;
  subject: string;
  bodyHtml: string;
  status: "draft" | "scheduled" | "sent";
  targetListId: string | null;
  sentAt: string | null;
};

type MarketingList = {
  id: string;
  name: string;
};

export default function CampaignBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [lists, setLists] = useState<MarketingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      
      const [campRes, listsRes] = await Promise.all([
        fetch(`/api/crm/campaigns/${campaignId}`, { headers: { 'x-org-id': orgId || '' } }),
        fetch(`/api/crm/lists`, { headers: { 'x-org-id': orgId || '' } })
      ]);

      if (campRes.ok) {
        const data = await campRes.json();
        setCampaign(data.campaign);
      }
      
      if (listsRes.ok) {
        const data = await listsRes.json();
        setLists(data.lists || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (statusOverride?: "draft" | "scheduled" | "sent") => {
    if (!campaign) return;
    setIsSaving(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const payload = { ...campaign };
      if (statusOverride) payload.status = statusOverride;

      const res = await fetch(`/api/crm/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!campaign) {
    return <div className="p-12 text-center text-ink/60">Campaign not found.</div>;
  }

  const isReadOnly = campaign.status === "sent";

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-linen rounded-lg transition-colors text-ink/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-ink">{campaign.title}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                campaign.status === 'sent' ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' :
                campaign.status === 'scheduled' ? 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]' :
                'bg-[#F2F4F7] text-[#344054] border-[#D0D5DD]'
              }`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-ink/60">Email Campaign Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={isSaving || isReadOnly}
            onClick={() => handleSave()}
            className="flex items-center gap-2 px-4 py-2 border border-ink/10 rounded-lg text-sm font-medium text-[#344054] hover:bg-linen transition-colors bg-white disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          {!isReadOnly && (
            <button 
              disabled={isSaving}
              onClick={() => handleSave("sent")}
              className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send Now
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 h-full pb-6">
        
        {/* Editor Area */}
        <div className="flex-1 bg-white border border-ink/10 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-ink/10 bg-[#F8F9FC] space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#344054] mb-1">Email Subject</label>
                <div className="relative">
                  <Type className="w-4 h-4 text-ink/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    disabled={isReadOnly}
                    value={campaign.subject}
                    onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                    placeholder="Enter an engaging subject line..." 
                    className="w-full pl-9 pr-4 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread disabled:bg-[#F9FAFB] disabled:text-ink/60"
                  />
                </div>
              </div>
              <div className="w-72">
                <label className="block text-sm font-medium text-[#344054] mb-1">Target Audience (List)</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-ink/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    disabled={isReadOnly}
                    value={campaign.targetListId || ""}
                    onChange={(e) => setCampaign({...campaign, targetListId: e.target.value || null})}
                    className="w-full pl-9 pr-4 py-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread appearance-none bg-white disabled:bg-[#F9FAFB] disabled:text-ink/60"
                  >
                    <option value="">Select a List...</option>
                    {lists.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 flex flex-col bg-linen">
            {/* Super basic rich text placeholder container */}
            <div className="bg-white border border-ink/10 rounded-lg flex-1 flex flex-col overflow-hidden shadow-sm">
              <div className="flex items-center gap-1 p-2 border-b border-ink/10 bg-[#F9FAFB]">
                <button className="p-1.5 hover:bg-[#EAECF0] rounded text-ink/60"><Type className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-[#EAECF0] rounded text-ink/60"><AlignLeft className="w-4 h-4" /></button>
              </div>
              <textarea
                disabled={isReadOnly}
                value={campaign.bodyHtml}
                onChange={(e) => setCampaign({...campaign, bodyHtml: e.target.value})}
                placeholder="Write your email content here..."
                className="flex-1 p-6 text-sm text-ink focus:outline-none resize-none disabled:bg-[#F9FAFB] disabled:text-ink/60"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 bg-white border border-ink/10 rounded-xl p-5 space-y-6">
          <div>
            <h3 className="font-medium text-ink mb-4">Campaign Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-ink/60 mb-1">Status</div>
                <div className="text-ink font-medium capitalize">{campaign.status}</div>
              </div>
              {campaign.sentAt && (
                <div>
                  <div className="text-ink/60 mb-1">Sent Date</div>
                  <div className="text-ink font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-ink/60" />
                    {new Date(campaign.sentAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-6 border-t border-ink/10">
            <h3 className="font-medium text-ink mb-4">Performance</h3>
            <div className="text-sm text-ink/60 italic bg-linen p-4 rounded-lg border border-ink/10">
              {campaign.status === 'sent' ? "Gathering metrics (Opens, Clicks, Bounces)..." : "Campaign has not been sent yet."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
