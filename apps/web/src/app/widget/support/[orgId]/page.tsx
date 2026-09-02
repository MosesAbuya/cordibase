"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function SupportWidgetPage({ params }: { params: { orgId: string } }) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !description) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/public/support/${params.orgId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, description })
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit ticket.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white font-sans text-center">
        <CheckCircle className="w-16 h-16 text-[#027A48] mb-4" />
        <h2 className="text-xl font-semibold text-ink mb-2">Message Sent</h2>
        <p className="text-ink/60 text-sm">Our support team has received your request and will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 font-sans flex flex-col">
      <div className="flex-1 max-w-md w-full mx-auto">
        <h2 className="text-xl font-semibold text-ink mb-1">Contact Support</h2>
        <p className="text-sm text-ink/60 mb-6">How can we help you today?</p>

        {error && (
          <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2.5 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-1">Subject</label>
            <input 
              type="text" 
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full p-2.5 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread"
              placeholder="Brief summary of the issue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-1">How can we help?</label>
            <textarea 
              required
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread resize-none"
              placeholder="Provide as much detail as possible..."
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#1D2939] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#101828] transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
      <div className="mt-8 text-center text-xs text-[#98A2B3]">
        Powered by Cordibase
      </div>
    </div>
  );
}
