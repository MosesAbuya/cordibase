"use client";

import { useState, useEffect } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertTriangle, CheckSquare, Square, Hexagon, Command, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Caps Lock detection is now handled directly on the inputs

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signIn.email({
        email,
        password,
        rememberMe,
      });
      
      if (res.error) {
        setErrorMsg(res.error.message || "Invalid credentials.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'github' | 'apple') => {
    // Placeholder for social login
    console.log("Logging in with " + provider);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-ink">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 xl:p-24 relative">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-16 lg:mb-24 text-thread cursor-pointer" onClick={() => router.push('/')}>
          <Hexagon className="fill-thread" size={28} />
          <span className="font-bold text-xl tracking-tight text-ink">Cordibase</span>
        </div>

        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink tracking-tight mb-3">Sign in to your account</h1>
            <p className="text-ink/60 text-sm">Enter your email and password to access your workspace.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={18} />
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-ink">Password</label>
                <Link href="/forgot-password" className="text-sm text-thread hover:text-thread-dark font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
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

            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
              <div className="text-ink/40 group-hover:text-thread transition-colors">
                {rememberMe ? <CheckSquare size={18} className="text-thread" /> : <Square size={18} />}
              </div>
              <span className="text-sm text-ink/70 select-none">Remember me for 30 days</span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-thread hover:bg-thread-dark text-white font-medium py-3 px-4 rounded-xl transition-all mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Log in"}
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
          <p>Need an account? <Link href="/register" className="text-thread font-medium hover:underline">Sign up here</Link></p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-ink/60 transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-ink/60 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:flex w-1/2 bg-thread relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-thread-dark rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-marigold rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-x-1/3 translate-y-1/3"></div>
        
        {/* Floating Glass UI Panel */}
        <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <Hexagon className="fill-thread text-thread" size={24} />
            </div>
            <div className="text-white/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8l4 4-4 4"/><path d="M3 12h18"/></svg>
            </div>
            <div className="w-12 h-12 bg-ink rounded-xl shadow-sm flex items-center justify-center">
              <Command className="text-white" size={24} />
            </div>
          </div>
          
          <h3 className="text-white font-bold text-xl text-center mb-2">Connect Cordibase to your workflow</h3>
          <p className="text-white/80 text-sm text-center mb-6 leading-relaxed">
            Prioritize deals based on customer needs and build a tighter feedback loop across your teams.
          </p>

          <div className="bg-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-300 shrink-0 mt-0.5" size={16} />
              <p className="text-white text-sm">Access basic company information and details</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-300 shrink-0 mt-0.5" size={16} />
              <p className="text-white text-sm">Access and edit CRM deals and create new tickets</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-300 shrink-0 mt-0.5" size={16} />
              <p className="text-white text-sm">Automate HR payroll and accounting invoices</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-16 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider mb-4 border border-white/10 backdrop-blur-md">WHAT'S NEW?</span>
          <h2 className="text-3xl font-bold text-white mb-4">15 new integrations added</h2>
          <p className="text-white/80 max-w-md mx-auto text-sm leading-relaxed">
            You asked and we listened! We've added a bunch of new integrations to speed up your workflow and connect all your tools.
          </p>
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-8 h-1.5 rounded-full bg-white"></div>
            <div className="w-8 h-1.5 rounded-full bg-white/30"></div>
            <div className="w-8 h-1.5 rounded-full bg-white/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
