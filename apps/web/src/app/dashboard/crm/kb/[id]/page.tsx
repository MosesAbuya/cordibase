"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, EyeOff, LayoutTemplate } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type KBArticle = {
  id: string;
  title: string;
  contentHtml: string;
  category: string;
  contentType?: 'fact' | 'procedure' | 'troubleshooting' | 'policy';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function KBEditorPage() {
  const params = useParams();
  const router = useRouter();
  const modal = useModal();
  const articleId = params.id as string;

  const [article, setArticle] = useState<KBArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [articleId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch(`/api/crm/kb-articles/${articleId}`, { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (publishedState?: boolean) => {
    if (!article) return;
    setIsSaving(true);
    
    const isPublished = publishedState !== undefined ? publishedState : article.isPublished;
    
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch(`/api/crm/kb-articles/${article.id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
        body: JSON.stringify({ ...article, isPublished })
      });
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
        if (publishedState === undefined) {
          await modal.alert("Article saved successfully!", "Success");
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!article) return;
    const newStatus = !article.isPublished;
    const action = newStatus ? "publish" : "unpublish";
    const confirmed = await modal.confirm(`Are you sure you want to ${action} this article?`, "Confirm Status Change");
    if (!confirmed) return;
    handleSave(newStatus);
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!article) {
    return <div className="p-12 text-center text-ink/60">Article not found.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-linen rounded-lg transition-colors text-ink/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-ink">{article.title || "Untitled Article"}</h2>
              {article.isPublished ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                  <Globe className="w-3 h-3" /> Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8F9FC] text-ink/60 border border-ink/10">
                  <EyeOff className="w-3 h-3" /> Draft
                </span>
              )}
            </div>
            <p className="text-sm text-ink/60">Knowledge Base Editor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePublish}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors bg-white ${
              article.isPublished 
                ? 'border-ink/10 text-ink/60 hover:bg-linen'
                : 'border-ink/10 text-[#027A48] hover:bg-[#ECFDF3]'
            }`}
          >
            {article.isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {article.isPublished ? "Unpublish" : "Publish to Help Center"}
          </button>
          <button 
            disabled={isSaving}
            onClick={() => handleSave()}
            className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-full">
        {/* Editor Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-4 border-b border-ink/10 bg-[#F8F9FC] flex justify-between items-center">
              <h3 className="font-medium text-ink">Content Editor</h3>
            </div>
            
            <div className="p-6 border-b border-ink/10">
              <input 
                type="text" 
                value={article.title}
                onChange={(e) => setArticle({...article, title: e.target.value})}
                placeholder="Article Title..."
                className="w-full text-2xl font-semibold border-none focus:outline-none focus:ring-0 text-ink placeholder-[#98A2B3]"
              />
            </div>
            
            <div className="flex-1 p-6 relative">
              <textarea 
                value={article.contentHtml}
                onChange={(e) => setArticle({...article, contentHtml: e.target.value})}
                placeholder="Write your article content here... (Markdown supported)"
                className="w-full h-full resize-none border-none focus:outline-none focus:ring-0 text-[#344054] placeholder-[#98A2B3]"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 space-y-6">
          <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-ink/10 bg-[#F8F9FC]">
              <h3 className="font-medium text-ink flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4" /> Article Settings
              </h3>
            </div>
            <div className="p-5 space-y-5 text-sm">
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1">Content Type</label>
                <select 
                  value={article.contentType || 'fact'}
                  onChange={(e) => setArticle({...article, contentType: e.target.value as any})}
                  className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread bg-white appearance-none"
                >
                  <option value="fact">Fact (Reference)</option>
                  <option value="procedure">Procedure (Step-by-step)</option>
                  <option value="troubleshooting">Troubleshooting</option>
                  <option value="policy">Policy</option>
                </select>
                <p className="mt-1 text-xs text-ink/60">AI processes each type differently.</p>
              </div>
              
              <div className="pt-4 border-t border-ink/10 space-y-3">
                <div className="flex justify-between">
                  <span className="text-ink/60">Created</span>
                  <span className="text-ink">{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink/60">Last modified</span>
                  <span className="text-ink">{new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
