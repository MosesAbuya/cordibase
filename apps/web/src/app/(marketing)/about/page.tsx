"use client";

import TiltCard from "@/components/marketing/TiltCard";
import BlurText from "@/components/marketing/BlurText";
import { Compass, Lightbulb, Target, ArrowRight, ShieldCheck, Cpu, Code2 } from "lucide-react";

export default function AboutPage() {
  const values = [
    { icon: Lightbulb, title: "Radical Innovation", color: "#31cb00", desc: "We don't settle for 'good enough'. We challenge industry norms to build smarter, faster, and more intuitive systems for everyone." },
    { icon: ShieldCheck, title: "Uncompromising Quality", color: "#119822", desc: "Every feature we ship is tested rigorously. Our infrastructure is built to scale securely, keeping your data protected at all times." },
    { icon: Target, title: "Customer-Obsessed", color: "#8bc088", desc: "Your success is our success. We listen intently to our community and adapt our roadmap to solve your biggest challenges." },
  ];

  const team = [
    { name: "Executive Team", role: "Leadership & Vision", initials: "ET", icon: Compass },
    { name: "Engineering Core", role: "Architecture & Systems", initials: "EC", icon: Cpu },
    { name: "Product Design", role: "UX/UI & Research", initials: "PD", icon: Code2 },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-24 px-6 border-b border-black/5 dark:border-white/15 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime_green rounded-full blur-[120px]" />
           <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-forest_green rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4 text-lime_green">Our Story</p>
          <h1 className="font-bold text-slate-900 dark:text-white leading-[1.1] mb-6 text-5xl md:text-7xl transition-colors duration-300">
            <BlurText text="Built from frustration." className="inline-block" /> <br/>
            <span className="font-instrument italic font-medium text-lime_green">Grown with purpose.</span>
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Cordibase was born from a simple observation: modern teams are drowning in disconnected tools. We set out to build a unified operating system that finally brings CRM, Accounting, and HR together.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-24 px-6 border-b border-black/5 dark:border-white/15 bg-slate-50 dark:bg-black/20 transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
                The Problem We Set Out to Solve
              </h2>
              <div className="space-y-6 text-slate-600 dark:text-white/60 leading-relaxed text-lg transition-colors duration-300">
                <p>
                  Every major enterprise software platform today is either wildly expensive and bloated, or too simple to handle real growth. Teams are forced to duct-tape solutions together using spreadsheets and brittle integrations.
                </p>
                <p>
                  We started building Cordibase as a centralized hub. A platform where your sales pipeline directly informs your accounting ledgers, and your HR data automatically feeds into payroll—without you lifting a finger.
                </p>
                <p>
                  Today, innovative companies around the world trust Cordibase to streamline their operations, reduce overhead, and scale their businesses efficiently.
                </p>
              </div>
            </div>
            <div className="relative">
               {/* Decorative Timeline */}
               <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-lime_green to-transparent" />
               <div className="rounded-3xl border border-black/10 dark:border-white/10 p-10 space-y-8 bg-white/80 dark:bg-[#0a150a]/80 backdrop-blur-xl shadow-2xl transition-colors duration-300">
                 {[
                   ["Inception", "The initial concept of a unified OS is drafted."],
                   ["Architecture", "Engineering begins on the core shared database."],
                   ["Beta Launch", "First 100 pilot companies onboarded successfully."],
                   ["Module Expansion", "Accounting and HRM modules go live."],
                   ["Global Scale", "Serving thousands of teams worldwide."]
                 ].map(([phase, desc], i) => (
                   <div key={phase} className="flex gap-6 items-start relative z-10">
                     <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center font-black text-lime_green shadow-inner">
                        {i + 1}
                     </div>
                     <div className="pt-2">
                       <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-1">{phase}</h4>
                       <p className="text-slate-500 dark:text-white/50 text-sm leading-relaxed">{desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values (Redesigned Cards) */}
      <section className="py-24 px-6 border-b border-black/5 dark:border-white/15 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl font-semibold text-slate-900 dark:text-white mb-16 text-center transition-colors duration-300">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div key={v.title} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-lime_green/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <TiltCard className="relative h-full rounded-3xl border border-black/5 dark:border-white/10 p-10 bg-slate-50 dark:bg-[#081008] transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300" style={{ background: `${v.color}22` }}>
                      <v.icon size={28} style={{ color: v.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">{v.title}</h3>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-black/10 dark:from-white/10 to-transparent mb-6" />
                  <p className="text-slate-600 dark:text-white/60 leading-relaxed">{v.desc}</p>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-32 px-6 text-center bg-slate-900 dark:bg-black relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-r from-lime_green via-forest_green to-lime_green rounded-[100%] blur-[150px] opacity-30" />
        </div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <h2 className="text-5xl md:text-7xl font-semibold text-white mb-8 tracking-tight">Our Mission</h2>
          <p className="text-white/70 text-2xl leading-relaxed max-w-4xl mx-auto font-light">
            To provide every growing business with a <span className="text-lime_green font-medium">unified operating system</span> that eliminates friction, connects teams, and empowers global scalability.
          </p>
        </div>
      </section>
    </>
  );
}
