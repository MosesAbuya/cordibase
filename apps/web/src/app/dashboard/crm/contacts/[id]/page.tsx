"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, FileText, CheckSquare, MoreVertical, Building2, MessageCircle, Star, Edit2, Trash2 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  department: string | null;
  isStarred: boolean;
};

type Activity = {
  id: string;
  type: "email" | "call" | "meeting" | "note" | "task";
  title: string;
  description: string | null;
  timestamp: string;
};

export default function ContactDetailPage() {
  const modal = useModal();
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [activityType, setActivityType] = useState<"note" | "call" | "meeting" | "email">("note");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit Modal
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", title: "", department: "" });
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    fetchData();
  }, [contactId]);

  const fetchData = async () => {
    setIsLoading(true);
    const orgId = localStorage.getItem('cordibase_active_org');
    
    try {
      const [contactRes, activityRes] = await Promise.all([
        fetch(`/api/crm/contacts/${contactId}`, { headers: { 'x-org-id': orgId || '' } }),
        fetch(`/api/crm/activities?contactId=${contactId}`, { headers: { 'x-org-id': orgId || '' } })
      ]);

      if (contactRes.ok) {
        const data = await contactRes.json();
        setContact(data.contact);
        setFormData({
          firstName: data.contact.firstName, lastName: data.contact.lastName,
          email: data.contact.email || "", phone: data.contact.phone || "",
          title: data.contact.title || "", department: data.contact.department || ""
        });
      }
      
      if (activityRes.ok) {
        const data = await activityRes.json();
        const sorted = (data.activities || []).sort((a: any, b: any) => 
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
    if (!contact) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/contacts/${contact.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...formData, isStarred: contact.isStarred }),
    });
    if (res.ok) {
      setIsEditing(false);
      fetchData();
    } else {
      modal.alert("Failed to update contact.");
    }
  };

  const handleDelete = async () => {
    if (!await modal.confirm("Are you sure you want to delete this contact?")) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/contacts/${contactId}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' },
    });
    if (res.ok) {
      router.push('/dashboard/crm');
    }
  };

  const toggleStar = async () => {
    if (!contact) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    setContact({ ...contact, isStarred: !contact.isStarred });
    await fetch(`/api/crm/contacts/${contact.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...contact, isStarred: !contact.isStarred }),
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
        contactId,
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

  if (!contact) {
    return <div className="p-12 text-center text-ink/60">Contact not found.</div>;
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
              <h2 className="text-xl font-semibold text-ink">{contact.firstName} {contact.lastName}</h2>
              <button onClick={toggleStar} className="p-1 hover:bg-linen rounded-md transition-colors">
                <Star className={`w-5 h-5 ${contact.isStarred ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#D0D5DD]'}`} />
              </button>
            </div>
            <p className="text-sm text-ink/60">{contact.title} {contact.department ? `· ${contact.department}` : ''}</p>
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
                  <Edit2 className="w-4 h-4 text-ink/60" /> Edit Contact
                </button>
                <div className="h-px bg-[#EAECF0] my-1"></div>
                <button onClick={() => { handleDelete(); setShowOptions(false); }} className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-[#DC2626]" /> Delete Contact
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 items-start h-full pb-6">
        {/* Left Column: Contact Details */}
        <div className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-white border border-ink/10 rounded-xl p-5">
            <h3 className="font-medium text-ink mb-4">About</h3>
            <div className="space-y-4 text-sm">
              {contact.email && (
                <div>
                  <div className="text-ink/60 mb-1 flex items-center gap-2"><Mail className="w-4 h-4"/> Email</div>
                  <a href={`mailto:${contact.email}`} className="text-thread hover:underline font-medium">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div>
                  <div className="text-ink/60 mb-1 flex items-center gap-2"><Phone className="w-4 h-4"/> Phone</div>
                  <a href={`tel:${contact.phone}`} className="text-thread hover:underline font-medium">{contact.phone}</a>
                </div>
              )}
              {!contact.email && !contact.phone && (
                <div className="text-ink/60 italic">No contact info provided.</div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-ink/10 flex flex-col gap-2">
              <div className="flex gap-2">
                <a href={contact.email ? `mailto:${contact.email}` : '#'} className={`flex-1 py-2 bg-white border border-ink/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${contact.email ? 'hover:bg-linen text-ink' : 'opacity-50 cursor-not-allowed text-ink/60'}`}>
                  <Mail className="w-4 h-4"/> Email
                </a>
                <a href={contact.phone ? `tel:${contact.phone}` : '#'} className={`flex-1 py-2 bg-white border border-ink/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${contact.phone ? 'hover:bg-linen text-ink' : 'opacity-50 cursor-not-allowed text-ink/60'}`}>
                  <Phone className="w-4 h-4"/> Call
                </a>
              </div>
              <a href={contact.phone ? `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}` : '#'} target="_blank" rel="noopener noreferrer" className={`w-full py-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#128C7E] rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${contact.phone ? 'hover:bg-[#25D366]/20' : 'opacity-50 cursor-not-allowed'}`}>
                <MessageCircle className="w-4 h-4"/> WhatsApp
              </a>
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
                placeholder="Start typing to leave a note..."
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
            <h3 className="font-semibold text-ink">Timeline</h3>
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
              <h3 className="font-semibold text-ink">Edit Contact</h3>
              <button onClick={() => setIsEditing(false)} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">First Name *</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Last Name *</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Title</label>
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Department</label>
                  <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                </div>
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
