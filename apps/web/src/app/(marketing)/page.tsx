"use client";

import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, Star } from "lucide-react";
import BlurText from "@/components/marketing/BlurText";
import CountUp from "@/components/marketing/CountUp";
import InfiniteScroll from "@/components/marketing/InfiniteScroll";
import WebThreads from "@/components/marketing/WebThreads";
import TiltCard from "@/components/marketing/TiltCard";

export default function MarketingPage() {
  return (
    <>
      {/* ── HERO SECTION ── */}
      <section className="border-b border-white/15 relative overflow-hidden">
        {/* WebThreads Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <WebThreads
            color1="#119822"
            color2="#31cb00"
            color3="#8bc088"
            threadCount={12}
            speed={0.15}
            brightness={0.4}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#081008]" />
        </div>

        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 pt-32 pb-20 lg:pt-40 lg:pb-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Content */}
            <div className="lg:max-w-2xl w-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
                <span className="w-2 h-2 rounded-full bg-lime_green animate-pulse" />
                <span className="text-sm font-medium text-white/80">All-in-One Business Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.1] mb-6">
                Empower Your Work with <br/>
                <span className="font-instrument italic font-medium text-lime_green">Intelligent Systems</span>
              </h1>
              
              <p className="text-lg text-white/60 mb-10 max-w-xl leading-relaxed">
                Cordibase unites powerful automation with human creativity, surfacing insights, and sparking ideas so you ship faster and focus on what matters.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/register" className="inline-flex items-center justify-center px-6 py-3.5 bg-lime_green text-evergreen font-bold text-sm rounded-xl hover:bg-lime_green/90 transition-colors shadow-[0_0_20px_rgba(49,203,0,0.3)]">
                  Start Your Free Trial
                </Link>
                <Link href="/modules/crm" className="inline-flex items-center justify-center px-6 py-3.5 bg-white/5 text-white font-medium text-sm rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  Browse Modules
                </Link>
              </div>
              
              <ul className="mt-10 space-y-3 font-medium text-white/60">
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
            
            {/* Right Thumbnail/Preview */}
            <div className="lg:w-[500px] xl:w-[600px] w-full relative">
              <TiltCard className="aspect-[4/3] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-forest_green/30 to-transparent z-0" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime_green/10 blur-[80px] rounded-full" />
                
                {/* Abstract UI Representation */}
                <div className="absolute inset-6 border border-white/10 rounded-xl bg-black/40 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                  {/* Floating abstract chart */}
                  <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden opacity-50">
                     <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                       <path d="M0,200 L0,150 C50,150 80,50 150,100 C220,150 280,20 400,80 L400,200 Z" fill="url(#hero-chart)" />
                       <defs>
                         <linearGradient id="hero-chart" x1="0%" y1="0%" x2="0%" y2="100%">
                           <stop offset="0%" stopColor="#31cb00" stopOpacity="0.5" />
                           <stop offset="100%" stopColor="#31cb00" stopOpacity="0" />
                         </linearGradient>
                       </defs>
                     </svg>
                  </div>
                  
                  <div className="w-16 h-16 rounded-full bg-lime_green/20 border border-lime_green/50 flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(49,203,0,0.3)] relative z-10">
                     <Play className="w-6 h-6 text-lime_green ml-1" />
                  </div>
                </div>
              </TiltCard>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── LOGOS SECTION ── */}
      <section className="border-b border-white/15">
        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 py-16 bg-white/[0.02]">
          <h2 className="text-center text-white/40 text-sm font-medium mb-10 tracking-widest uppercase">Trusted by innovative teams</h2>
          <InfiniteScroll speed={25}>
            {["Acme Corp", "GlobalNet", "TechFlow", "Nexus", "Stark Ind", "Wayne Ent", "Globex", "Soylent", "Initech"].map(name => (
              <span key={name} className="text-white/30 font-bold text-xl tracking-wide hover:text-white/60 transition-colors whitespace-nowrap mx-8">{name}</span>
            ))}
          </InfiniteScroll>
        </div>
      </section>

      {/* ── ABOUT / SEE IT IN ACTION ── */}
      <section className="border-b border-white/15">
        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 py-24">
          <div className="flex flex-col md:flex-row justify-between gap-12 lg:gap-20">
            
            {/* Left: Video Placeholder */}
            <div className="md:w-1/2 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group">
              <div className="aspect-[4/3] relative flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-forest_green/20 to-transparent" />
                 <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300" preserveAspectRatio="none">
                    <path d="M0,150 C100,50 300,250 400,150 L400,300 L0,300 Z" fill="url(#about-wave)" />
                    <defs>
                       <linearGradient id="about-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#119822" />
                          <stop offset="100%" stopColor="#31cb00" />
                       </linearGradient>
                    </defs>
                 </svg>
                 <div className="z-10 text-center">
                    <div className="w-16 h-16 rounded-full border border-lime_green/30 bg-lime_green/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-md cursor-pointer group-hover:scale-110 group-hover:bg-lime_green/20 transition-all shadow-[0_0_20px_rgba(49,203,0,0.2)]">
                       <Play className="w-6 h-6 text-lime_green ml-1" />
                    </div>
                 </div>
              </div>
            </div>

            {/* Right: Stats and Text */}
            <div className="md:w-1/2 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-white mb-6 tracking-tight">
                See Cordibase in Action: <br/>
                <span className="font-instrument italic font-medium text-white/70">Watch Our Tools Shine</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                Play the video to see our flagship business suite turn ideas into results. In under a minute, you'll watch workflows automated, insights revealed, and content created in real time.
              </p>
              
              <div className="border-t border-white/10 pt-8 mt-2 mb-8 relative">
                {/* Subtle glowing divider accent */}
                <div className="absolute top-0 left-0 w-32 h-[1px] bg-gradient-to-r from-lime_green to-transparent" />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl lg:text-4xl font-semibold text-white mb-2 flex items-center">
                      <CountUp end={700} /> <span className="text-lime_green ml-1">+</span>
                    </div>
                    <p className="text-sm text-white/50">5-Star Reviews</p>
                  </div>
                  <div>
                    <div className="text-3xl lg:text-4xl font-semibold text-white mb-2 flex items-center">
                      <CountUp end={10} /> <span className="text-lime_green ml-1">K+</span>
                    </div>
                    <p className="text-sm text-white/50">Users Worldwide</p>
                  </div>
                  <div>
                    <div className="text-3xl lg:text-4xl font-semibold text-white mb-2 flex items-center">
                      <CountUp end={452} /> <span className="text-lime_green ml-1">K+</span>
                    </div>
                    <p className="text-sm text-white/50">Tasks Completed</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-8 relative">
                 <div className="absolute top-0 left-0 w-32 h-[1px] bg-gradient-to-r from-lime_green to-transparent" />
                 <Link href="/get-demo" className="inline-flex items-center justify-center px-6 py-3.5 bg-lime_green text-evergreen font-bold text-sm rounded-xl hover:bg-lime_green/90 transition-colors shadow-[0_0_15px_rgba(49,203,0,0.2)]">
                   Start Your Free Trial
                 </Link>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── BENTO GRID (WHY CHOOSE US) ── */}
      <section className="border-b border-white/15">
        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 py-24 bg-gradient-to-b from-white/[0.01] to-transparent">
          
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white/80 mb-6">
              Why Choose Cordibase
            </div>
            <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-white tracking-tight mb-6">
              Intuitive Systems That Work <br/>
              <span className="font-instrument italic font-medium text-lime_green">Beside You</span>, Seamlessly
            </h2>
            <p className="text-white/50 text-lg">
              Our tools are built to simplify work, spark ideas, and scale with you. From automation to insights, explore the benefits that set us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Large Card 1 */}
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-gradient-to-b from-forest_green/10 to-black/40 p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-lime_green/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="aspect-[2/1] mb-6 rounded-xl border border-white/10 bg-black/50 overflow-hidden relative">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
                 <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-lime_green/30 blur-3xl rounded-full" />
                 <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-forest_green/40 blur-2xl rounded-full" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="px-6 py-3 rounded-lg border border-lime_green/30 bg-black/60 backdrop-blur-md shadow-2xl flex items-center gap-3 transform group-hover:scale-105 transition-transform duration-500">
                     <CheckCircle2 className="w-5 h-5 text-lime_green" />
                     <span className="text-white font-medium">Customer interactions automated</span>
                   </div>
                 </div>
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Automated Customer Interactions</h3>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-4" />
              <p className="text-white/50 text-sm leading-relaxed max-w-md">
                Enhance your customer support with AI-driven chatbots and virtual assistants. Provide instant replies and improve response times effortlessly.
              </p>
            </div>

            {/* Small Card 1 */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-b from-forest_green/10 to-black/40 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-lime_green/15 blur-[60px] rounded-full pointer-events-none" />
              <div className="aspect-[2/1] lg:aspect-auto lg:h-[200px] mb-6 rounded-xl border border-white/10 bg-black/50 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 p-6 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full max-w-[200px] p-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transform -translate-x-4">
                       <div className="w-16 h-2 bg-white/20 rounded mb-2" />
                       <div className="w-full h-2 bg-white/10 rounded" />
                    </div>
                    <div className="w-full max-w-[200px] p-3 rounded-lg border border-lime_green/30 bg-lime_green/10 backdrop-blur-sm transform translate-x-4 shadow-[0_0_20px_rgba(49,203,0,0.1)]">
                       <div className="w-16 h-2 bg-lime_green/50 rounded mb-2" />
                       <div className="w-3/4 h-2 bg-lime_green/30 rounded" />
                    </div>
                  </div>
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Notifications Engine</h3>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-4" />
              <p className="text-white/50 text-sm leading-relaxed">
                Deliver tailored experiences to your users with our intelligent recommendation and notification engine.
              </p>
            </div>
            
            {/* Small Card 2 */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-b from-forest_green/10 to-black/40 p-6 relative overflow-hidden group flex flex-col justify-between">
               <div className="absolute top-0 right-0 w-32 h-32 bg-lime_green/10 blur-[60px] rounded-full pointer-events-none" />
               <div className="mb-6">
                 <h3 className="text-xl font-medium text-white mb-3">Integrated Solutions</h3>
                 <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-4" />
                 <p className="text-white/50 text-sm leading-relaxed mb-6">
                   Cordibase integrates effortlessly with your existing tools, adapting automation to enhance your processes.
                 </p>
               </div>
               <div className="h-32 rounded-xl border border-white/10 bg-black/50 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(49,203,0,0.1)_0%,transparent_70%)]" />
                  <div className="flex items-center gap-2 relative z-10 group-hover:scale-110 transition-transform duration-500">
                     <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/60"><div className="w-3 h-3 rounded-full bg-white/40"/></div>
                     <div className="w-8 h-px bg-white/20" />
                     <div className="w-12 h-12 rounded-full border border-lime_green/40 flex items-center justify-center bg-lime_green/10 shadow-[0_0_15px_rgba(49,203,0,0.2)]"><div className="w-4 h-4 rounded-full bg-lime_green"/></div>
                     <div className="w-8 h-px bg-white/20" />
                     <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/60"><div className="w-3 h-3 rounded-full bg-white/40"/></div>
                  </div>
               </div>
            </div>

            {/* Large Card 2 */}
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-gradient-to-b from-forest_green/10 to-black/40 p-6 relative overflow-hidden group">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-lime_green/20 blur-[80px] rounded-full pointer-events-none" />
               <h3 className="text-xl font-medium text-white mb-3">Smart Workflow Schedule</h3>
               <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-4" />
               <p className="text-white/50 text-sm leading-relaxed max-w-md mb-6">
                 Optimize your business operations by automating repetitive tasks and workflows. Streamline everything from task management to invoicing.
               </p>
               <div className="h-[200px] rounded-xl border border-white/10 bg-black/50 relative flex items-center justify-center overflow-hidden">
                  <div className="w-full flex px-8 gap-4 overflow-hidden">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 h-32 rounded-lg border ${i === 3 ? 'border-lime_green/50 bg-lime_green/10 shadow-[0_0_20px_rgba(49,203,0,0.15)] -translate-y-4' : 'border-white/10 bg-white/5 opacity-40 group-hover:opacity-60'} transform transition-all duration-500 flex flex-col p-3`}>
                         <div className={`w-3/4 h-2 rounded mb-2 ${i===3 ? 'bg-lime_green' : 'bg-white/20'}`} />
                         <div className={`w-1/2 h-2 rounded ${i===3 ? 'bg-lime_green/50' : 'bg-white/10'}`} />
                      </div>
                    ))}
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section className="border-b border-white/15">
        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 py-24">
          
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white/80 mb-6">
              Seamless Integrations
            </div>
            <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-white tracking-tight mb-6">
              Connect Cordibase to Your <br/>
              <span className="font-instrument italic font-medium text-lime_green">Favorite Apps</span>
            </h2>
            <p className="text-white/50 text-lg">
              Plug our system into the tools you already love. Sync data instantly, automate platforms, and keep every workflow unified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "TaskPilot", desc: "Sync tasks, deadlines, and team chat so automations can update status in real time.", cat: "Productivity" },
              { name: "DataBridge", desc: "Low-code data pipeline tool that funnels spreadsheets into Cordibase.", cat: "Data" },
              { name: "ChatSupport", desc: "Omnichannel help-desk platform where bots draft replies and tag sentiment.", cat: "Support" },
              { name: "LeadBoost CRM", desc: "Sales pipeline tracker that pairs with our CRM to score leads and predict closes.", cat: "Sales" },
              { name: "VisualMaker", desc: "Cloud design suite that feeds creatives into marketing teams.", cat: "Design" },
              { name: "InsightPulse BI", desc: "Real-time BI dashboard that streams KPIs into automated forecasts.", cat: "Analytics" },
            ].map(app => (
              <div key={app.name} className="p-6 rounded-2xl border border-white/10 bg-black/20 hover:bg-white/[0.03] transition-colors group flex flex-col relative overflow-hidden h-full">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-forest_green opacity-10 blur-[50px] pointer-events-none" />
                 
                 <div className="flex items-center gap-4 mb-6 relative z-10">
                   <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                      {app.name[0]}
                   </div>
                   <span className="text-lg font-medium text-white">{app.name}</span>
                 </div>
                 
                 <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-5 relative z-10" />
                 
                 <p className="text-white/50 text-sm leading-relaxed flex-1 mb-8 relative z-10">
                   {app.desc}
                 </p>
                 
                 <div className="flex items-center justify-between relative z-10 mt-auto">
                   <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/70">
                     {app.cat}
                   </span>
                   <Link href="/integrations" className="w-10 h-10 rounded-lg bg-gradient-to-b from-forest_green/20 to-transparent border border-white/10 flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(49,203,0,0.1)] hover:bg-forest_green/40 transition-colors">
                     <ArrowRight className="w-4 h-4 text-white transform transition-transform duration-300 group-hover:translate-x-8 group-hover:-translate-y-8" />
                     <ArrowRight className="w-4 h-4 text-white absolute transform -translate-x-8 translate-y-8 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
                   </Link>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="border-b border-white/15">
        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 py-24 bg-gradient-to-t from-white/[0.01] to-transparent">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white/80 mb-6">
              Testimonials
            </div>
            <h2 className="text-4xl lg:text-5xl font-semibold leading-[1.1] text-white tracking-tight mb-6">
              What Our Happy Users Say <br/>
              <span className="font-instrument italic font-medium text-lime_green">About Cordibase</span>
            </h2>
            <p className="text-white/50 text-lg mb-10">
              Discover how professionals in marketing, product, and operations boost results with our platform—saving time, cutting costs, and sparking innovation.
            </p>
            
            <div className="flex items-center justify-center gap-6">
               <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0d1a0d] bg-gradient-to-br from-forest_green/50 to-evergreen/80 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                     U{i}
                   </div>
                 ))}
               </div>
               <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xl font-bold text-white">4.7/5</span>
                     <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-lime_green text-lime_green" />)}
                     </div>
                  </div>
                  <p className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer underline underline-offset-4">See all 2300+ reviews</p>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { name: "Jenifer Lawrence", title: "CEO & Engineer", text: "Cordibase has completely transformed the way we manage projects. The automation features save us hours every week." },
               { name: "David Mitchell", title: "Product Manager", text: "The insights provided by the CRM module are unparalleled. We've increased our close rate by 40% since switching." },
               { name: "Sarah Connor", title: "Operations Lead", text: "Unifying HR and Accounting in one platform was a game changer for our back office. Everything is so intuitive." },
            ].map((review, i) => (
               <div key={i} className="p-8 rounded-2xl border border-white/10 bg-black/20 hover:bg-black/30 transition-colors relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime_green opacity-0 group-hover:opacity-5 blur-[50px] transition-opacity duration-500 pointer-events-none" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime_green/20 to-transparent flex items-center justify-center border border-white/10 text-white font-medium">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{review.name}</h4>
                      <p className="text-white/40 text-sm">{review.title}</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-6" />
                  <p className="text-white/70 leading-relaxed text-sm">
                    "{review.text}"
                  </p>
               </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
