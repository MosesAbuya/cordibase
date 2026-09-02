"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <section className="pt-32 pb-16 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Contact us</p>
          <h1 className="text-5xl font-bold text-white mb-4">We'd love to hear from you.</h1>
          <p className="text-white/50 text-lg">Questions, demos, partnerships, or just a hello — reach out and a human will reply.</p>
        </div>
      </section>

      <section className="pb-32 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-6">Get in touch</h2>
              {[
                { icon: Mail, label: "Email", value: "hello@cordibase.com" },
                { icon: Phone, label: "Phone", value: "+254 700 123 456" },
                { icon: MapPin, label: "Office", value: "Westlands, Nairobi, Kenya" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(17,152,34,0.15)" }}>
                    <item.icon size={18} style={{ color: "#31cb00" }} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-0.5">{item.label}</p>
                    <p className="text-white text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/5 p-6" style={{ background: "#0d1a0d" }}>
              <h3 className="text-white font-semibold mb-2">Response time</h3>
              <p className="text-white/40 text-sm">We reply to all messages within 4 business hours (Mon–Fri, 8am–6pm EAT).</p>
            </div>
            <div className="rounded-xl border border-white/5 p-6" style={{ background: "#0d1a0d" }}>
              <h3 className="text-white font-semibold mb-2">Book a demo</h3>
              <p className="text-white/40 text-sm mb-4">Prefer a live walkthrough? Schedule a 30-minute demo with our team.</p>
              <a href="#" className="text-sm font-semibold" style={{ color: "#31cb00" }}>Book a time →</a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="rounded-2xl border border-white/10 p-12 text-center" style={{ background: "#0d1a0d" }}>
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-white mb-2">Message sent!</h2>
                <p className="text-white/50">We'll get back to you within 4 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 p-8 space-y-5" style={{ background: "#0d1a0d" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { id: "name", label: "Full name", placeholder: "Jane Muthoni", type: "text" },
                    { id: "email", label: "Email address", placeholder: "jane@company.co.ke", type: "email" },
                    { id: "company", label: "Company", placeholder: "BuildCo Kenya", type: "text" },
                    { id: "subject", label: "Subject", placeholder: "Demo request", type: "text" },
                  ].map((field) => (
                    <div key={field.id}>
                      <label className="block text-white/60 text-xs font-medium mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(form as Record<string, string>)[field.id]}
                        onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                        className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors"
                        style={{ background: "#0a150a" }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-2">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-green-500/50 transition-colors resize-none"
                    style={{ background: "#0a150a" }}
                  />
                </div>
                <button type="submit" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
                  Send message <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
