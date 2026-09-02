"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle, Clock, Building, HeartPulse, Send, Sparkles, Smile, MessageSquareWarning } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  contactId: string | null;
  companyId: string | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  slaStatus: "on_track" | "at_risk" | "breached";
  createdAt: string;
  queueId: string | null;
  resolvedAt: string | null;
};

type TicketMessage = {
  id: string;
  senderType: "customer" | "agent" | "ai_bot";
  bodyHtml: string;
  isInternal: boolean;
  createdAt: string;
};

type Company = {
  id: string;
  name: string;
  accountHealthScore: number;
};

export default function AgentWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const modal = useModal();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [queues, setQueues] = useState<any[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      
      const [ticketRes, msgsRes, queuesRes] = await Promise.all([
        fetch(`/api/crm/tickets/${ticketId}`, { headers: { 'x-org-id': orgId || '' } }),
        fetch(`/api/crm/tickets/${ticketId}/messages`, { headers: { 'x-org-id': orgId || '' } }),
        fetch('/api/crm/queues', { headers: { 'x-org-id': orgId || '' } })
      ]);
      
      if (ticketRes.ok) {
        const data = await ticketRes.json();
        setTicket(data.ticket);
        
        if (data.ticket.companyId) {
          const compRes = await fetch(`/api/crm/companies/${data.ticket.companyId}`, { headers: { 'x-org-id': orgId || '' } });
          if (compRes.ok) {
            const compData = await compRes.json();
            setCompany(compData.company);
          }
        }
      }
      if (msgsRes.ok) {
        const mData = await msgsRes.json();
        setMessages(mData.messages || []);
      }
      if (queuesRes.ok) {
        const qData = await queuesRes.json();
        setQueues(qData.queues || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!ticket) return;
    const confirmed = await modal.confirm("Mark this ticket as resolved?", "Resolve Ticket");
    if (!confirmed) return;
    
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/tickets/${ticket.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ status: "resolved" })
    });
    if (res.ok) {
      setTicket({ ...ticket, status: "resolved", resolvedAt: new Date().toISOString() });
    }
  };

  const generateDraft = async () => {
    setIsDrafting(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch(`/api/crm/tickets/${ticketId}/copilot/draft`, {
        method: "POST",
        headers: { 'x-org-id': orgId || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setReplyText(data.draft);
      } else {
        await modal.alert("AI Copilot failed. Is GEMINI_API_KEY configured?", "Error");
      }
    } finally {
      setIsDrafting(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch(`/api/crm/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
        body: JSON.stringify({ senderType: 'agent', bodyHtml: replyText, isInternal })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.message]);
        setReplyText("");
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin" /></div>;
  if (!ticket) return <div className="p-12 text-center text-ink/60">Ticket not found.</div>;

  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-linen rounded-lg transition-colors text-ink/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-ink">{ticket.subject}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                ticket.status === 'open' ? 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]' :
                ticket.status === 'resolved' ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' :
                'bg-[#F2F4F7] text-[#344054] border-[#D0D5DD]'
              }`}>
                {ticket.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-ink/60 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> 
                {ticket.slaStatus === 'on_track' ? <span className="text-[#027A48]">SLA On Track</span> : <span className="text-[#DC2626] font-medium">SLA Breached</span>}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                {ticket.sentiment === 'negative' ? <MessageSquareWarning className="w-4 h-4 text-[#DC2626]" /> : <Smile className="w-4 h-4 text-[#027A48]" />}
                Sentiment: {ticket.sentiment || 'Neutral'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isResolved && (
            <button onClick={handleResolve} className="flex items-center gap-2 px-4 py-2 border border-ink/10 rounded-lg text-sm font-medium text-[#027A48] hover:bg-[#ECFDF3] transition-colors bg-white">
              <CheckCircle className="w-4 h-4" />
              Resolve
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 h-full">
        {/* Agent Workspace - Thread */}
        <div className="flex-1 space-y-4 flex flex-col h-[750px]">
          <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-ink/10 bg-[#F8F9FC]">
              <h3 className="font-medium text-ink">Conversation</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9FAFB]">
              {/* Original Description */}
              <div className="flex flex-col items-start gap-2 max-w-3xl">
                <span className="text-xs font-medium text-ink/60 ml-2">Customer (Original Ticket)</span>
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-ink/10 shadow-sm text-sm text-[#344054]">
                  {ticket.description || "No description provided."}
                </div>
              </div>

              {/* Messages */}
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col gap-2 max-w-3xl ${msg.senderType === 'agent' ? 'items-end self-end ml-auto' : 'items-start'}`}>
                  <span className={`text-xs font-medium text-ink/60 ${msg.senderType === 'agent' ? 'mr-2' : 'ml-2'}`}>
                    {msg.senderType === 'agent' ? 'Support Agent' : msg.senderType === 'ai_bot' ? 'AI Bot' : 'Customer'}
                  </span>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                    msg.senderType === 'agent' ? (msg.isInternal ? 'bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] rounded-tr-sm' : 'bg-thread text-white rounded-tr-sm') : 
                    msg.senderType === 'ai_bot' ? 'bg-linen text-[#344054] border border-ink/10 rounded-tl-sm' :
                    'bg-white text-[#344054] border border-ink/10 rounded-tl-sm'
                  }`}>
                    {msg.bodyHtml}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="p-4 bg-white border-t border-ink/10">
              <div className="flex flex-col gap-3">
                <textarea 
                  rows={4}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={isInternal ? "Write an internal note..." : "Type your public reply here..."}
                  className={`w-full p-3 border rounded-lg text-sm focus:outline-none resize-none ${isInternal ? 'bg-[#FFFAEB] border-[#FEDF89] focus:ring-[#F79009]/20 focus:border-[#F79009]' : 'border-ink/10 focus:ring-[#A83C2E]/20 focus:border-thread'}`}
                  
                />
                <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-[#344054] cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded border-[#D0D5DD] text-[#F79009] focus:ring-[#F79009]" />
                  Internal Note
                </label>
                  <button 
                    disabled={isDrafting}
                    onClick={generateDraft}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#F9F5FF] text-[#6941C6] rounded-lg text-sm font-medium hover:bg-[#F4EBFF] transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isDrafting ? "Drafting..." : "Copilot Draft"}
                  </button>
                  <button 
                    disabled={isSending || !replyText.trim()}
                    onClick={sendReply}
                    className="flex items-center gap-2 bg-[#1D2939] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#101828] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CRM Context Panel */}
        <div className="w-80 flex-shrink-0 space-y-6">
          <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-ink/10 bg-[#F8F9FC]">
              <h3 className="font-medium text-ink">Associated Account</h3>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {company ? (
                <>
                  <div className="flex items-center gap-2 font-medium text-ink text-lg">
                    <Building className="w-5 h-5 text-thread" />
                    {company.name}
                  </div>
                  <div>
                    <div className="text-ink/60 mb-2 flex items-center gap-1 font-medium">
                      <HeartPulse className="w-4 h-4" /> Account Health
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#EAECF0] h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${company.accountHealthScore >= 70 ? 'bg-[#12B76A]' : company.accountHealthScore >= 40 ? 'bg-[#F79009]' : 'bg-[#F04438]'}`} 
                          style={{ width: `${company.accountHealthScore}%` }}
                        />
                      </div>
                      <span className="font-medium text-ink w-8 text-right">{company.accountHealthScore}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-ink/60 italic">No company associated.</div>
              )}
            </div>
          </div>
          
          
          <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden p-5">
            <h3 className="font-medium text-ink mb-3">Ticket Routing</h3>
            <label className="block text-sm font-medium text-[#344054] mb-1">Queue / Department</label>
            <select 
              value={ticket.queueId || ""}
              onChange={async (e) => {
                const newQueue = e.target.value;
                setTicket({...ticket, queueId: newQueue});
                const orgId = localStorage.getItem('cordibase_active_org');
                await fetch(`/api/crm/tickets/${ticketId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
                  body: JSON.stringify({ queueId: newQueue })
                });
                modal.alert('Ticket reassigned successfully.', 'Reassigned');
              }}
              className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:outline-none bg-white mb-3"
            >
              <option value="">Unassigned</option>
              {queues.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
          </div>

          <div className="bg-gradient-to-br from-[#F9F5FF] to-[#F4EBFF] border border-[#E9D7FE] rounded-xl shadow-sm overflow-hidden p-5">
            <h3 className="font-semibold text-[#53389E] flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" /> Suggested KB Articles
            </h3>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded-lg border border-[#E9D7FE] text-sm text-[#344054] cursor-pointer hover:border-[#D6BBFB] transition-colors">
                How to reset your billing cycle
              </div>
              <div className="bg-white p-3 rounded-lg border border-[#E9D7FE] text-sm text-[#344054] cursor-pointer hover:border-[#D6BBFB] transition-colors">
                Understanding SLA policies
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
