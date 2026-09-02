"use client";
import { useEffect, useState, use } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Building2, Shield, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  
  const [invite, setInvite] = useState<any>(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/invitations/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setInvite(data.invite);
          setHasAccount(data.hasAccount);
        }
        setLoading(false);
      })
      .catch(e => {
        setError("Network error fetching invitation details");
        setLoading(false);
      });
  }, [id]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!session?.user) {
        if (!password || (!hasAccount && !name)) {
          setError("Please fill in all required fields.");
          setSubmitting(false);
          return;
        }
        
        if (hasAccount) {
          const signInRes = await authClient.signIn.email({
            email: invite.email,
            password: password,
          });
          if (signInRes.error) {
            setError(signInRes.error.message);
            setSubmitting(false);
            return;
          }
        } else {
          const signUpRes = await authClient.signUp.email({
            email: invite.email,
            password: password,
            name: name,
          });

          if (signUpRes.error) {
            setError(signUpRes.error.message);
            setSubmitting(false);
            return;
          }
        }
      }

      const acceptRes = await authClient.organization.acceptInvitation({
        invitationId: id
      });

      if (acceptRes.error) {
        setError(acceptRes.error.message || "Failed to accept invitation");
        setSubmitting(false);
      } else {
        if (invite.modules && invite.modules.length > 0) {
            await fetch("/api/members/update-modules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId: invite.orgId, modules: invite.modules })
            }).catch(console.error);
        }
        localStorage.setItem("cordibase_active_org", invite.orgId || "");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setSubmitting(false);
    }
  };

  if (loading || sessionLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Verifying invitation...</div>;
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Invalid Invitation</h1>
          <p className="text-slate-500 mb-8">{error}</p>
          <Link href="/login" className="bg-[#1D2939] text-white px-6 py-3 rounded-lg font-medium inline-block hover:bg-black transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-[#1D2939] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Building2 size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <Building2 className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join {invite.orgName}</h1>
            <p className="text-slate-300 text-sm">You have been invited to join this workspace as a <strong className="text-white uppercase text-xs px-2 py-0.5 bg-white/20 rounded ml-1">{invite.role}</strong></p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-3 mb-6 border border-red-100">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleAccept} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={invite.email} 
                disabled 
                className="w-full border border-ink/10 rounded-lg px-4 py-2.5 text-sm bg-slate-50 text-ink/60 cursor-not-allowed"
              />
            </div>
            
            {!session?.user ? (
              <>
                {hasAccount ? (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 mb-4">
                    <strong>Welcome back!</strong> It looks like you already have a Cordibase account. Please enter your password to sign in and accept this invitation.
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-[#344054] mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="e.g. Jane Doe"
                      className="w-full border border-ink/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#344054] mb-1.5">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full border border-ink/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-thread hover:bg-[#8e3226] text-white px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-6"
                >
                  {submitting ? "Processing..." : (hasAccount ? "Sign In & Accept Invitation" : "Create Account & Accept")}
                </button>
              </>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase shrink-0">
                    {session.user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Signed in as {session.user.name}</div>
                    <div className="text-xs text-slate-500">{session.user.email}</div>
                  </div>
                </div>
                {session.user.email !== invite.email && (
                  <div className="mt-3 text-xs text-amber-600 font-medium">
                    Warning: You are signed in with a different email than the invitation was sent to. If you accept, this invitation will be linked to your current account.
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1D2939] hover:bg-black text-white px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-4"
                >
                  {submitting ? "Accepting..." : "Accept Invitation"} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield size={14} /> Secured by Cordibase Identity
          </div>
        </div>
      </div>
    </div>
  );
}
