"use client";
import { useSession } from "@/lib/auth-client";
import { User, Mail, Shield, Calendar, Camera, Check } from "lucide-react";
import { useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!session?.user) {
    return <div className="p-8 text-slate-500">Loading profile...</div>;
  }

  // Initialize name
  if (!name && session.user.name && !saving) {
    setName(session.user.name);
  }

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await authClient.updateUser({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await authClient.updateUser({ image: base64String });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">My Profile</h1>
        <p className="text-sm text-ink/60 mt-1">Manage your personal account details and avatar.</p>
      </div>

      <div className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-lg overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-ink/10 dark:border-white/10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-full bg-linen flex items-center justify-center text-ink font-bold text-3xl shrink-0 overflow-hidden border border-ink/10">
              {session.user.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                session.user.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               {uploadingAvatar ? (
                 <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
               ) : (
                 <Camera className="text-white" size={20} />
               )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="flex-1 w-full max-w-sm">
            <label className="block text-xs font-semibold text-ink/60 uppercase tracking-wider mb-1">Full Name</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 border border-ink/10 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread dark:bg-slate-800 dark:text-white"
              />
              <button 
                onClick={handleSaveName}
                disabled={saving || name === session.user.name}
                className="bg-thread hover:bg-[#8C3125] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center w-20"
              >
                {saved ? <Check size={16} /> : (saving ? '...' : 'Save')}
              </button>
            </div>
            <div className="flex items-center text-ink/60 mt-3 gap-2 text-sm">
              <Mail size={16} />
              <span className="opacity-80">{session.user.email}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-ink dark:text-white uppercase tracking-wider">Account Information</h3>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="w-8 h-8 rounded-full bg-linen dark:bg-slate-800 flex items-center justify-center text-ink/60">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-ink/60 text-xs font-medium">Authentication</p>
                <p className="text-ink dark:text-white font-medium capitalize">{session.user.emailVerified ? 'Email Verified' : 'Standard Auth'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="w-8 h-8 rounded-full bg-linen dark:bg-slate-800 flex items-center justify-center text-ink/60">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-ink/60 text-xs font-medium">Joined On</p>
                <p className="text-ink dark:text-white font-medium">
                  {new Date(session.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

