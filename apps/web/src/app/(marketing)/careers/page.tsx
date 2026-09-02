import { MapPin, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const jobs = [
  { title: "Senior Backend Engineer", team: "Engineering", location: "Nairobi (Hybrid)", type: "Full-time", desc: "Build and scale the Cordibase API. You'll work on real-time data pipelines, M-PESA integrations, and performance at scale. Node.js + PostgreSQL stack." },
  { title: "Product Designer (UX/UI)", team: "Product", location: "Remote (Africa)", type: "Full-time", desc: "Own the design system and ship beautiful, intuitive interfaces. Figma-first workflow. Strong collaboration with engineering." },
  { title: "Sales Development Rep", team: "Revenue", location: "Nairobi, Kenya", type: "Full-time", desc: "Reach out to SMEs across East Africa, run demos, and help businesses find the right Cordibase plan. Base + generous commission." },
];

const benefits = [
  { emoji: "🌍", title: "Remote-first", desc: "Work from anywhere in Africa. We care about output, not office hours." },
  { emoji: "📈", title: "Equity for everyone", desc: "Every full-time employee gets meaningful stock options, regardless of seniority." },
  { emoji: "🏥", title: "Health coverage", desc: "Full NHIF contributions plus top-up private health insurance for you and your family." },
  { emoji: "📚", title: "Learning budget", desc: "KES 50,000 per year to spend on courses, books, conferences — whatever sharpens your skills." },
  { emoji: "🏖️", title: "Generous leave", desc: "25 days annual leave plus all Kenyan public holidays. Burnout is not a badge of honour." },
  { emoji: "💻", title: "Great equipment", desc: "MacBook Pro on day one, plus any peripherals you need to do your best work." },
];

export default function CareersPage() {
  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center" style={{ background: "linear-gradient(to bottom, #0d1a0d, #0a150a)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>We're hiring</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Build the future of <br />African business.</h1>
          <p className="text-white/50 text-xl leading-relaxed mb-10">
            Join a small, ambitious team solving real problems for real businesses across Africa. We value craft, speed, and genuine curiosity.
          </p>
          <div className="flex items-center justify-center gap-6 text-white/40 text-sm">
            <span>🇰🇪 Founded in Nairobi</span>
            <span>·</span>
            <span>🌍 Team across 8 countries</span>
            <span>·</span>
            <span>🚀 Series A 2025</span>
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Open positions</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.title} className="rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all group" style={{ background: "#0d1a0d" }}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: "#31cb00", background: "rgba(49,203,0,0.1)" }}>{job.team}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: "#60a5fa", background: "rgba(96,165,250,0.1)" }}>{job.type}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-4">{job.desc}</p>
                    <div className="flex items-center gap-4 text-white/30 text-xs">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {job.type}</span>
                    </div>
                  </div>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white shrink-0 transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
                    Apply <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/5 p-6 text-center" style={{ background: "#0d1a0d" }}>
            <p className="text-white/40 text-sm">Don't see the right role? We're always open to exceptional people.</p>
            <a href="mailto:careers@cordibase.com" className="text-sm font-semibold mt-2 inline-block" style={{ color: "#31cb00" }}>
              Send us your CV → careers@cordibase.com
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Why join Cordibase?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-white/10 p-6" style={{ background: "#0a150a" }}>
                <div className="text-3xl mb-4">{b.emoji}</div>
                <h3 className="text-white font-bold mb-2">{b.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
