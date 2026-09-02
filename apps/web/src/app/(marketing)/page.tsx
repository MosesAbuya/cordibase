import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, Star, Check, Sparkles, Box, Shield, Zap, CircleDashed, BarChart } from "lucide-react";
import CountUp from "@/components/marketing/CountUp";
import InfiniteScroll from "@/components/marketing/InfiniteScroll";
import WebThreads from "@/components/marketing/WebThreads";
import TiltCard from "@/components/marketing/TiltCard";
import ElectricBorder from "@/components/marketing/ElectricBorder";
import Strands from "@/components/marketing/Strands";
import MagicRings from "@/components/marketing/MagicRings";
import { db } from "@/lib/db";
import { platformSchema } from "@cordibase/shared-db";

export default async function MarketingPage() {
  const packages = await db.select().from(platformSchema.pricingPackage).orderBy(platformSchema.pricingPackage.order);

  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="border-b border-black/5 dark:border-white/15 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none z-0">
          <WebThreads
            color1="#119822"
            color2="#31cb00"
            color3="#8bc088"
            threadCount={12}
            speed={0.15}
            brightness={0.4}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white dark:from-[#081008]/40 dark:via-transparent dark:to-[#081008] transition-colors duration-300 pointer-events-none" />
        </div>

        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-40 pb-20 lg:pt-48 lg:pb-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:max-w-xl w-full">
              <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6 transition-colors duration-300">
                Empower Your Work with <br/>
                <span className="font-instrument italic font-medium text-lime_green">Intelligent Systems</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-white/60 mb-10 max-w-lg leading-relaxed transition-colors duration-300">
                Cordibase unites powerful automation with human creativity, surfacing insights, and sparking ideas so you ship faster and focus on what matters.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/register" className="inline-flex items-center justify-center px-6 py-3.5 bg-lime_green text-evergreen font-bold text-sm rounded-xl hover:bg-lime_green/90 transition-colors shadow-[0_0_20px_rgba(49,203,0,0.3)]">
                  Start Your Free Trial
                </Link>
                <Link href="/modules/crm" className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white font-medium text-sm rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  Browse Modules
                </Link>
              </div>
              
              <ul className="mt-10 space-y-3 font-medium text-slate-600 dark:text-white/60 transition-colors duration-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime_green" />
                  <span>From $0 to $500,000 in revenue.</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime_green" />
                  <span>47% growth in new customers.</span>
                </li>
              </ul>
            </div>
            
            {/* HERO IMAGE ENLARGED */}
            <div className="lg:w-[600px] xl:w-[700px] w-full relative">
              <TiltCard className="relative z-10 w-full group">
                <img src="https://riteflow.netlify.app/assets/img/home-v2/banner-thumb.png" alt="Platform Mobile Preview" className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(49,203,0,0.2)] dark:drop-shadow-[0_0_50px_rgba(49,203,0,0.3)] group-hover:scale-105 transition-transform duration-700" />
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS SECTION ── */}
      <section className="border-b border-black/5 dark:border-white/15 transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-16 bg-black/[0.02] dark:bg-white/[0.02]">
          <h2 className="text-center text-slate-400 dark:text-white/40 text-sm font-medium mb-10 tracking-widest uppercase">Trusted by innovative teams</h2>
          <InfiniteScroll speed={25}>
            {["Acme Corp", "GlobalNet", "TechFlow", "Nexus", "Stark Ind", "Wayne Ent", "Globex", "Soylent", "Initech"].map(name => (
              <span key={name} className="text-slate-300 dark:text-white/30 font-bold text-xl tracking-wide hover:text-slate-500 dark:hover:text-white/60 transition-colors whitespace-nowrap mx-8">{name}</span>
            ))}
          </InfiniteScroll>
        </div>
      </section>

      {/* ── ABOUT / SEE IT IN ACTION ── */}
      <section className="border-b border-black/5 dark:border-white/15 transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-24">
          <div className="flex flex-col md:flex-row justify-between gap-12 lg:gap-16">
            <div className="md:w-1/2 relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-100 dark:bg-black/40 group shadow-2xl transition-colors duration-300">
              <div className="aspect-[4/3] relative flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Workflow" className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 dark:from-[#081008]/80 to-transparent opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/20 flex items-center justify-center backdrop-blur-md group-hover:bg-lime_green/20 group-hover:border-lime_green/50 transition-all cursor-pointer shadow-[0_0_20px_rgba(49,203,0,0.2)]">
                     <Play className="w-6 h-6 text-slate-800 dark:text-white group-hover:text-lime_green ml-1 transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-slate-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">
                See Cordibase in Action: <br/>
                <span className="font-instrument italic font-medium text-lime_green">Watch Our Tools Shine</span>
              </h2>
              <p className="text-slate-600 dark:text-white/50 text-lg leading-relaxed mb-10 transition-colors duration-300">
                Play the video to see our flagship business suite turn ideas into results. In under a minute, you'll watch workflows automated, insights revealed, and content created in real time.
              </p>
              <div className="border-t border-black/5 dark:border-white/15 pt-8 mt-2 mb-8 relative transition-colors duration-300">
                <div className="absolute top-0 left-0 w-32 h-[1px] bg-gradient-to-r from-lime_green to-transparent" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center transition-colors duration-300">
                      <CountUp end={700} /> <span className="text-lime_green ml-1">+</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-white/50 transition-colors duration-300">5-Star Reviews</p>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center transition-colors duration-300">
                      <CountUp end={10} /> <span className="text-lime_green ml-1">K+</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-white/50 transition-colors duration-300">Users Worldwide</p>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center transition-colors duration-300">
                      <CountUp end={452} /> <span className="text-lime_green ml-1">K+</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-white/50 transition-colors duration-300">Tasks Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── BENTO GRID (WHY CHOOSE US) REDESIGN (Screenshot 4: Process Cards) ── */}
      <section className="border-b border-black/5 dark:border-white/15 transition-colors duration-300 bg-slate-50 dark:bg-transparent">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-24">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-slate-900 dark:text-white tracking-tight mb-6 transition-colors duration-300">
              Intuitive Systems That Work <br/>
              <span className="font-instrument italic font-medium text-lime_green">Beside You</span>, Seamlessly
            </h2>
            <p className="text-slate-600 dark:text-white/50 text-lg transition-colors duration-300">
              Our tools are built to simplify work, spark ideas, and scale with you. From automation to insights, explore the benefits that set us apart.
            </p>
          </div>

          {/* Process Timeline Style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
             {/* Background connecting dotted line (hidden on mobile) */}
             <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[2px] border-t-2 border-dashed border-slate-300 dark:border-white/20 -translate-y-1/2 z-0" />
             <div className="hidden md:block absolute top-1/4 bottom-1/4 left-1/2 w-[2px] border-l-2 border-dashed border-slate-300 dark:border-white/20 -translate-x-1/2 z-0" />

             {[
               { num: "01", title: "AUTOMATION", icon: Zap, desc: "Enhance your customer support with AI-driven chatbots and virtual assistants. Provide instant replies and improve response times effortlessly." },
               { num: "02", title: "ANALYSIS", icon: BarChart, desc: "Gain deep insights into your business metrics. Real-time dashboards provide you with actionable intelligence at a glance." },
               { num: "03", title: "QUALITY", icon: Shield, desc: "Ensure every deliverable meets the highest standards. Built-in compliance and checks safeguard your operations around the clock." },
               { num: "04", title: "FINANCE", icon: Box, desc: "Connect accounting natively to your CRM. From quotes to cash, manage your bottom line without ever switching apps." },
             ].map((item, i) => (
                <div key={item.num} className={`relative z-10 flex flex-col ${i%2===1 ? 'md:mt-16' : ''}`}>
                  {/* Outer card with solid colored accent block behind it */}
                  <div className="relative pt-6 pl-6 group">
                     {/* Solid colored block acting as shadow/accent (like image 4 top-left) */}
                     <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-lime_green to-forest_green rounded-tl-3xl rounded-br-[40px] opacity-90 transition-transform group-hover:scale-110 duration-500" />
                     <div className="absolute top-2 left-2 text-white font-bold text-xl z-20">{item.num}</div>
                     
                     {/* Frosted Glass Card Body */}
                     <div className="relative bg-white/80 dark:bg-[#101b10]/80 backdrop-blur-xl border border-white dark:border-white/10 rounded-2xl p-8 shadow-xl dark:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-widest">{item.title}</h3>
                        </div>
                        <p className="text-slate-500 dark:text-white/60 leading-relaxed text-sm">
                           {item.desc}
                        </p>
                     </div>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      
      
      {/* ── INFOGRAPHIC SECTION (Matching Quadrant Request) ── */}
      <section className="py-24 px-6 bg-[#040704] border-b border-black/5 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
        {/* Background Smoke/Glow Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-lime_green/20 rounded-full blur-[100px] md:blur-[140px] mix-blend-screen" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[#119822]/20 rounded-full blur-[100px] md:blur-[140px] mix-blend-screen" />
        </div>

        <div className="max-w-[1000px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-[0.2em] mb-4 uppercase">
              Infographic Elements
            </h2>
            <p className="text-white/60 text-sm max-w-lg mx-auto">
              Our platform connects harmoniously with everything you need.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* The 4 cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Card 01 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[1.5rem] flex flex-col justify-start shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-lime_green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-lime_green to-forest_green rounded-xl flex items-center justify-center text-white shadow-lg">
                    <BarChart className="w-7 h-7" />
                  </div>
                  <span className="text-5xl font-bold text-white">01</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">Analytics Sync</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
              
              {/* Card 02 */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[1.5rem] flex flex-col justify-start md:text-right shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-bl from-lime_green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center md:justify-end gap-4 mb-6 relative z-10">
                  <span className="text-5xl font-bold text-white md:order-1 order-2">02</span>
                  <div className="w-14 h-14 bg-gradient-to-br from-lime_green to-forest_green rounded-xl flex items-center justify-center text-white shadow-lg md:order-2 order-1">
                    <Box className="w-7 h-7" />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">Cloud Storage</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>

              {/* Card 04 (Bottom Left) */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[1.5rem] flex flex-col justify-end shadow-2xl relative overflow-hidden group mt-4 md:mt-0 h-[280px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-lime_green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">Workflow</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-lime_green to-forest_green rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Zap className="w-7 h-7" />
                  </div>
                  <span className="text-5xl font-bold text-white">04</span>
                </div>
              </div>

              {/* Card 03 (Bottom Right) */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[1.5rem] flex flex-col justify-end md:text-right shadow-2xl relative overflow-hidden group mt-4 md:mt-0 h-[280px]">
                <div className="absolute inset-0 bg-gradient-to-tl from-lime_green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">Security</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
                <div className="flex items-center md:justify-end gap-4 relative z-10">
                  <span className="text-5xl font-bold text-white md:order-1 order-2">03</span>
                  <div className="w-14 h-14 bg-gradient-to-br from-lime_green to-forest_green rounded-xl flex items-center justify-center text-white shadow-lg md:order-2 order-1">
                    <Shield className="w-7 h-7" />
                  </div>
                </div>
              </div>
            </div>

            {/* Central Circle - absolute positioned */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-[#0d170d] border-[12px] border-[#081008] shadow-[0_0_50px_rgba(0,0,0,0.8)] items-center justify-center z-20">
              <div className="w-40 h-40 rounded-full bg-gradient-to-b from-lime_green to-[#125a1b] flex flex-col items-center justify-center text-center shadow-[inset_0_4px_10px_rgba(255,255,255,0.3)]">
                <span className="text-white/90 text-[10px] tracking-[0.2em] uppercase mb-1">Circular</span>
                <span className="text-white font-bold text-base uppercase tracking-widest">Diagram</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── PRICING CARDS REDESIGN (Screenshot 3: Staggered Dynamic Cards) ── */}
      <section className="border-b border-black/5 dark:border-white/15 relative bg-slate-100 dark:bg-transparent transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-24">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-slate-900 dark:text-white tracking-tight mb-6 transition-colors duration-300">
              Simple, Transparent <br/>
              <span className="font-instrument italic font-medium text-lime_green">Pricing Plans</span>
            </h2>
            <p className="text-slate-500 dark:text-white/50 text-lg transition-colors duration-300">
              Start for free, then upgrade as your team grows. No hidden fees. Select the plan that fits you.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8 items-end lg:h-[550px]">
            {packages.map((pkg, idx) => {
               // Make the middle/popular card taller and styled differently
               const isPopular = pkg.isPopular;
               const delay = idx * 100;
               return (
                  <div key={pkg.id} className={`w-full lg:w-1/3 relative transition-all duration-500 hover:-translate-y-4`} style={{ animationDelay: `${delay}ms` }}>
                    {/* The staggered floating header tab */}
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-[85%] py-3 rounded-xl z-20 text-center font-bold tracking-widest uppercase shadow-xl border border-white/10 backdrop-blur-md transform -skew-x-6 ${isPopular ? 'bg-white text-lime_green' : 'bg-lime_green text-evergreen'}`}>
                       <span className="block transform skew-x-6">{pkg.name}</span>
                    </div>

                    
                    {/* Card Body */}
                    <div className={`pt-12 pb-8 px-8 rounded-[2rem] h-full border ${isPopular ? 'bg-gradient-to-b from-[#e5ebe5] via-[#759575] to-[#1a361a] border-transparent text-white min-h-[500px]' : 'bg-white dark:bg-black/60 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white min-h-[460px]'} shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-colors duration-300 flex flex-col items-center text-center`}>
                       
                       <p className={`text-sm mb-4 ${isPopular ? 'text-white/90' : 'text-slate-500 dark:text-white/50'}`}>
                         {pkg.description || "Perfect for your business."}
                       </p>

                       <div className="flex items-start justify-center mb-8">
                         <span className={`text-3xl font-medium mt-1 ${isPopular ? 'text-white/80' : 'text-slate-900 dark:text-white'}`}>$</span>
                         <span className={`text-7xl font-black tracking-tighter ${isPopular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{pkg.price}</span>
                         <span className={`text-sm font-medium mt-auto mb-3 ml-1 ${isPopular ? 'text-white/70' : 'text-slate-400 dark:text-white/40'}`}>/mo</span>
                       </div>

                       <div className="w-full flex-1 mb-8 text-sm">
                         <p className={`mb-6 font-medium ${isPopular ? 'text-white' : 'text-slate-700 dark:text-white/70'} leading-relaxed text-left`}>
                           Includes these features:
                         </p>
                         <ul className="space-y-4 text-left">
                           {Array.isArray(pkg.features) && pkg.features.map((feat: any, i: number) => (
                             <li key={i} className="flex items-center gap-3">
                               <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-white' : 'text-slate-900 dark:text-white'}`} />
                               <span className={isPopular ? 'text-white' : 'text-slate-600 dark:text-white/70'}>{String(feat)}</span>
                             </li>
                           ))}
                         </ul>
                       </div>

                       <Link href="/register" className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all ${isPopular ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-xl' : 'bg-white border-2 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white dark:bg-transparent hover:border-lime_green hover:text-lime_green shadow-lg'}`}>
                          Select
                       </Link>
                    </div>

                  </div>
               );
            })}
          </div>
        </div>
      </section>

      {/* ── GLOBAL SCALE (MAGIC RINGS) ── */}
      <section className="border-b border-black/5 dark:border-white/15 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
          <MagicRings 
            color="#119822"
            colorTwo="#8bc088"
            speed={1.5}
            ringCount={4}
          />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-32 relative z-10 text-center">
           <h2 className="text-5xl lg:text-7xl font-semibold leading-[1.1] text-slate-900 dark:text-white tracking-tight mb-8 transition-colors duration-300">
              Built for <span className="font-instrument italic font-medium text-lime_green">Global Scale</span>
            </h2>
            <p className="text-slate-600 dark:text-white/70 text-xl max-w-2xl mx-auto mb-10 transition-colors duration-300">
              Cordibase is engineered with unparalleled security and performance. Whether you have 10 users or 10,000, our architecture rings around the globe to deliver instant interactions.
            </p>
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-slate-200 dark:bg-white/10 backdrop-blur-md border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-bold text-lg rounded-full hover:bg-slate-300 dark:hover:bg-white/20 transition-colors shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Explore Our Architecture
            </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="border-b border-black/5 dark:border-white/15 transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-24 bg-gradient-to-t from-slate-100 to-white dark:from-white/[0.01] dark:to-transparent">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-slate-900 dark:text-white tracking-tight mb-6 transition-colors duration-300">
              What Our Happy Users Say <br/>
              <span className="font-instrument italic font-medium text-lime_green">About Cordibase</span>
            </h2>
            <p className="text-slate-500 dark:text-white/50 text-lg mb-10 transition-colors duration-300">
              Discover how professionals in marketing, product, and operations boost results with our platform—saving time, cutting costs, and sparking innovation.
            </p>
            <div className="flex items-center justify-center gap-6">
               <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-[#0d1a0d] bg-gradient-to-br from-forest_green/50 to-evergreen/80 flex items-center justify-center text-xs font-bold text-white shadow-lg">U{i}</div>
                 ))}
               </div>
               <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">4.7/5</span>
                     <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-lime_green text-lime_green" />)}
                     </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer underline underline-offset-4">See all 2300+ reviews</p>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { name: "Jenifer Lawrence", title: "CEO & Engineer", text: "Cordibase has completely transformed the way we manage projects. The automation features save us hours every week." },
               { name: "David Mitchell", title: "Product Manager", text: "The insights provided by the CRM module are unparalleled. We've increased our close rate by 40% since switching." },
               { name: "Sarah Connor", title: "Operations Lead", text: "Unifying HR and Accounting in one platform was a game changer for our back office. Everything is so intuitive." },
            ].map((review, i) => (
               <div key={i} className="p-8 rounded-2xl border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/30 transition-colors relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime_green opacity-0 group-hover:opacity-5 blur-[50px] transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime_green/20 to-transparent flex items-center justify-center border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-medium">{review.name[0]}</div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-medium transition-colors duration-300">{review.name}</h4>
                      <p className="text-slate-500 dark:text-white/40 text-sm transition-colors duration-300">{review.title}</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-black/10 dark:from-white/10 to-transparent mb-6 transition-colors duration-300" />
                  <p className="text-slate-700 dark:text-white/70 leading-relaxed text-sm transition-colors duration-300">"{review.text}"</p>
               </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
