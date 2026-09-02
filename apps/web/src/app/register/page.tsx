"use client";

import { useState, useEffect } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertTriangle, CheckSquare, Square, Hexagon, TrendingUp, Users, FileText } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Caps Lock detection is now handled directly on the inputs

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signUp.email({
        email,
        password,
        name,
      });
      
      if (res.error) {
        setErrorMsg(res.error.message || "An account with this email already exists.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during signup.");
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'github') => {
    // Placeholder for social login
    console.log("Signing up with " + provider);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-ink">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 xl:p-24 relative">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-12 lg:mb-16 text-thread cursor-pointer" onClick={() => router.push('/')}>
          <Hexagon className="fill-thread" size={28} />
          <span className="font-bold text-xl tracking-tight text-ink">Cordibase</span>
        </div>

        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink tracking-tight mb-3">Create your account</h1>
            <p className="text-ink/60 text-sm">Join Cordibase and centralize your business operations.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={18} />
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                required
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white focus:outline-none focus:ring-2 focus:ring-thread/50 focus:border-thread transition-all text-ink placeholder:text-ink/30"
                placeholder="Jane Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Work Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                required
                className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white focus:outline-none focus:ring-2 focus:ring-thread/50 focus:border-thread transition-all text-ink placeholder:text-ink/30"
                placeholder="jane@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-ink/10 bg-white focus:outline-none focus:ring-2 focus:ring-thread/50 focus:border-thread transition-all text-ink placeholder:text-ink/30"
                  placeholder="********"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {capsLockActive && (
                <div className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs font-medium">
                  <AlertTriangle size={12} />
                  <span>Caps Lock is on</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 cursor-pointer group mt-2" onClick={() => setAgreeTerms(!agreeTerms)}>
              <div className="text-ink/40 group-hover:text-thread transition-colors mt-0.5">
                {agreeTerms ? <CheckSquare size={18} className="text-thread" /> : <Square size={18} />}
              </div>
              <span className="text-sm text-ink/70 select-none leading-tight">
                I agree to the <Link href="/terms" className="text-thread hover:underline" onClick={e => e.stopPropagation()}>Terms of Service</Link> and <Link href="/privacy" className="text-thread hover:underline" onClick={e => e.stopPropagation()}>Privacy Policy</Link>.
              </span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-thread hover:bg-thread-dark text-white font-medium py-3 px-4 rounded-xl transition-all mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-ink/40 uppercase tracking-widest font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => socialLogin('google')} className="flex items-center justify-center gap-2 py-2.5 border border-ink/10 rounded-xl hover:bg-ink/5 transition-colors text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button onClick={() => socialLogin('github')} className="flex items-center justify-center gap-2 py-2.5 border border-ink/10 rounded-xl hover:bg-ink/5 transition-colors text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-auto pt-8 flex items-center justify-between text-xs text-ink/40">
          <p>Already have an account? <Link href="/login" className="text-thread font-medium hover:underline">Log in here</Link></p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-ink/60 transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-ink/60 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Right side: Visual (Asymmetrical Layout) */}
      <div className="hidden lg:flex w-1/2 bg-ink relative overflow-hidden flex-col justify-center p-16 xl:p-24">
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-thread/30 rounded-full mix-blend-screen filter blur-[80px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-marigold/20 rounded-full mix-blend-screen filter blur-[80px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <Hexagon className="text-thread mb-8" size={48} strokeWidth={1.5} />
          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-[1.1]">Everything your business needs.</h2>
          <p className="text-white/70 text-lg xl:text-xl mb-12 font-light">
            Cordibase unites your CRM, accounting, and team management into one fluid interface. Stop context-switching and start growing.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="glass-panel p-5 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-thread/20 flex items-center justify-center shrink-0">
                <TrendingUp className="text-thread" size={24} />
              </div>
              <div>
                <h4 className="text-white font-medium">Advanced CRM</h4>
                <p className="text-white/50 text-sm mt-1">Track pipelines, manage leads, and close deals faster.</p>
              </div>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-marigold/20 flex items-center justify-center shrink-0">
                <FileText className="text-marigold" size={24} />
              </div>
              <div>
                <h4 className="text-white font-medium">Accounting Hub</h4>
                <p className="text-white/50 text-sm mt-1">Generate invoices, log expenses, and track your cash flow.</p>
              </div>
            </div>
            
            <div className="glass-panel p-5 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-moss/20 flex items-center justify-center shrink-0">
                <Users className="text-moss" size={24} />
              </div>
              <div>
                <h4 className="text-white font-medium">Team Directory</h4>
                <p className="text-white/50 text-sm mt-1">Manage employee access, roles, and internal communications.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
