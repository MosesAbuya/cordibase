"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [
  { label:"Features", href:"/features" },
  { label:"Pricing",  href:"/pricing" },
  { label:"Modules",  href:"/modules/crm" },
  { label:"Blog",     href:"/blog" },
  { label:"About",    href:"/about" },
  { label:"Contact",  href:"/contact" },
];

const BG = "rgba(13,26,13,0.92)";
const GRAD = "linear-gradient(135deg,#119822,#31cb00)";

export default function Dock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop top bar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center py-3 px-6"
        style={{ background:BG, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid rgba(49,203,0,0.08)", boxShadow:"0 4px 32px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center justify-between w-full max-w-7xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background:GRAD }}>C</div>
            <span className="text-white font-bold text-lg tracking-tight">Cordibase</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  className={"px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 " +
                    (active ? "text-white" : "text-white/60 hover:text-white")}
                  style={active ? { background:"rgba(49,203,0,0.15)", color:"#31cb00" } : {}}>
                  {label}
                </Link>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ background:GRAD, boxShadow:"0 0 20px rgba(49,203,0,0.25)" }}>
              Get Started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 py-3"
        style={{ background:BG, backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(49,203,0,0.08)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background:GRAD }}>C</div>
          <span className="text-white font-bold">Cordibase</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl text-white/70">
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 pt-20 px-5 pb-8 flex flex-col gap-2"
          style={{ background:"rgba(13,26,13,0.98)", backdropFilter:"blur(24px)" }} onClick={()=>setOpen(false)}>
          {navItems.map(({ label, href }) => (
            <Link key={href} href={href}
              className="flex items-center px-5 py-4 rounded-2xl border border-white/10 text-white/80 hover:text-white text-base font-medium">
              {label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Link href="/login" className="flex-1 flex items-center justify-center px-5 py-3.5 rounded-xl border border-white/10 text-white font-medium">Sign In</Link>
            <Link href="/register" className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-semibold" style={{ background:GRAD }}>
              Get Started <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
