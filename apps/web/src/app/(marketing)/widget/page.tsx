import { MessageCircle, Zap, Globe, Code, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WidgetPage() {
  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: "rgba(52,211,153,0.1)", borderColor: "rgba(52,211,153,0.3)", color: "#34d399" }}>
              <MessageCircle size={12} /> Support Widget
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Embed live support<br /><span style={{ color: "#34d399" }}>in 2 minutes.</span>
            </h1>
            <p className="text-white/50 text-xl leading-relaxed mb-8">
              The Cordibase support widget lets your customers reach your team from any page on your website or app. Conversations land directly in your Cordibase inbox.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "One script tag — no backend required",
                "Conversations sync to your CRM contacts",
                "Customizable brand colors and welcome message",
                "Works on any website, React app, or Next.js",
                "Offline message capture with email fallback",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                  <CheckCircle2 size={16} style={{ color: "#34d399" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg justify-center" style={{ background: "linear-gradient(135deg,#059669,#34d399)" }}>
                Get your embed code <ArrowRight size={18} />
              </Link>
              <Link href="/docs/widget" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white/60 text-lg border border-white/15 justify-center hover:border-white/30 transition-all">
                Read the docs
              </Link>
            </div>
          </div>

          {/* Widget preview mock */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Fake browser frame */}
              <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#0a150a" }}>
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#fb7185" }}></div>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }}></div>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#31cb00" }}></div>
                  <div className="flex-1 ml-2 h-4 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}></div>
                </div>
                <div className="p-6 min-h-48 relative">
                  <div className="h-4 w-3/4 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.05)" }}></div>
                  <div className="h-3 w-full rounded-full mb-2" style={{ background: "rgba(255,255,255,0.03)" }}></div>
                  <div className="h-3 w-5/6 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.03)" }}></div>
                  <div className="h-3 w-2/3 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }}></div>

                  {/* Widget bubble */}
                  <div className="absolute bottom-6 right-6">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer" style={{ background: "linear-gradient(135deg,#059669,#34d399)" }}>
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    {/* Chat popup */}
                    <div className="absolute bottom-16 right-0 w-64 rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style={{ background: "#0d1a0d" }}>
                      <div className="px-4 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#059669,#34d399)" }}>
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">C</div>
                        <div>
                          <p className="text-white text-xs font-bold">Cordibase Support</p>
                          <p className="text-white/70 text-xs">Usually replies in 4 min</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="bg-white/5 rounded-xl rounded-tl-none px-3 py-2 text-xs text-white/70">
                          👋 Hi! How can we help you today?
                        </div>
                        <div className="flex justify-end">
                          <div className="rounded-xl rounded-tr-none px-3 py-2 text-xs text-white" style={{ background: "rgba(52,211,153,0.2)" }}>
                            I need help with invoicing
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-2 border-t border-white/5 flex gap-2">
                        <input readOnly className="flex-1 rounded-lg text-xs px-3 py-1.5 text-white/40 outline-none border-none" style={{ background: "rgba(255,255,255,0.05)" }} placeholder="Type a message..." />
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.2)" }}>
                          <ArrowRight size={12} style={{ color: "#34d399" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Up and running in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Code, title: "Copy your embed code", desc: "Log in to Cordibase, navigate to Settings → Widget, and copy your unique embed snippet.", color: "#34d399" },
              { step: "02", icon: Globe, title: "Paste it into your site", desc: "Add the script tag to your HTML <head> or install our npm package for React apps. Takes 60 seconds.", color: "#60a5fa" },
              { step: "03", icon: Zap, title: "Go live instantly", desc: "The widget appears on your site immediately. Conversations arrive in your Cordibase inbox in real time.", color: "#f59e0b" },
            ].map((step) => (
              <div key={step.step} className="rounded-2xl border border-white/10 p-8" style={{ background: "#0d1a0d" }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-4xl font-black" style={{ color: "rgba(255,255,255,0.08)" }}>{step.step}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${step.color}22` }}>
                    <step.icon size={18} style={{ color: step.color }} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 p-6" style={{ background: "#0d1a0d" }}>
            <p className="text-white/40 text-xs font-mono mb-2">Install via npm (React / Next.js)</p>
            <div className="rounded-xl border border-white/5 px-5 py-4 font-mono text-sm" style={{ background: "#0a150a" }}>
              <span style={{ color: "#31cb00" }}>$</span> <span className="text-white/70">npm install @cordibase/widget</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
