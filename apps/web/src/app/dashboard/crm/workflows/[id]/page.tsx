"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Zap, Plus, Settings, Mail, CheckSquare, Webhook, FileEdit, UserPlus, FilePlus, Trash2 } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

type Workflow = {
  id: string;
  title: string;
  description: string | null;
  triggerType: string;
  triggerConfig: string | null;
  isActive: boolean;
};

type Step = {
  id: string;
  workflowId: string;
  stepOrder: number;
  actionType: string;
  actionConfig: string | null;
};

const TRIGGER_LABELS: Record<string, string> = {
  field_change: "Property Change",
  record_created: "New Record",
  stage_change: "Stage Change",
  time_based: "Scheduled",
  manual: "Manual Trigger"
};

const ACTION_LABELS: Record<string, { label: string, icon: React.ReactNode }> = {
  create_record: { label: "Create Record", icon: <FilePlus className="w-5 h-5 text-emerald-500" /> },
  update_record: { label: "Update Record", icon: <FileEdit className="w-5 h-5 text-blue-500" /> },
  send_email: { label: "Send Email", icon: <Mail className="w-5 h-5 text-amber-500" /> },
  create_task: { label: "Create Task", icon: <CheckSquare className="w-5 h-5 text-purple-500" /> },
  webhook: { label: "Trigger Webhook", icon: <Webhook className="w-5 h-5 text-slate-500" /> },
  ai_agent: { label: "AI Agent Action", icon: <Zap className="w-5 h-5 text-rose-500" /> }
};

export default function WorkflowBuilderPage() {
  const modal = useModal();
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [stepActionType, setStepActionType] = useState("send_email");

  const [isEditingTrigger, setIsEditingTrigger] = useState(false);
  const [triggerConfigData, setTriggerConfigData] = useState<any>({});

  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [stepConfigData, setStepConfigData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [workflowId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch(`/api/crm/workflows/${workflowId}`, { headers: { 'x-org-id': orgId || '' } });
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data.workflow);
        setSteps(data.steps || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async () => {
    if (!workflow) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    setWorkflow({ ...workflow, isActive: !workflow.isActive });
    await fetch(`/api/crm/workflows/${workflow.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...workflow, isActive: !workflow.isActive }),
    });
  };

  const addStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = localStorage.getItem('cordibase_active_org');
    const newOrder = steps.length > 0 ? Math.max(...steps.map(s => s.stepOrder)) + 1 : 1;
    
    const res = await fetch(`/api/crm/workflows/${workflowId}/steps`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ actionType: stepActionType, stepOrder: newOrder })
    });
    
    if (res.ok) {
      setIsAddingStep(false);
      fetchData();
    } else {
      modal.alert("Failed to add step");
    }
  };

  const deleteStep = async (stepId: string) => {
    const orgId = localStorage.getItem('cordibase_active_org');
    const res = await fetch(`/api/crm/workflow_steps/${stepId}`, {
      method: "DELETE",
      headers: { 'x-org-id': orgId || '' }
    });
    if (res.ok) {
      fetchData();
    }
  };

  const openTriggerSettings = () => {
    if (!workflow) return;
    try {
      setTriggerConfigData(workflow.triggerConfig ? JSON.parse(workflow.triggerConfig) : {});
    } catch {
      setTriggerConfigData({});
    }
    setIsEditingTrigger(true);
  };

  const saveTriggerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflow) return;
    const orgId = localStorage.getItem('cordibase_active_org');
    
    const newConfig = JSON.stringify(triggerConfigData);
    const res = await fetch(`/api/crm/workflows/${workflow.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ ...workflow, triggerConfig: newConfig }),
    });

    if (res.ok) {
      setIsEditingTrigger(false);
      fetchData();
    } else {
      modal.alert("Failed to save trigger settings");
    }
  };

  const openStepSettings = (step: Step) => {
    try {
      setStepConfigData(step.actionConfig ? JSON.parse(step.actionConfig) : {});
    } catch {
      setStepConfigData({});
    }
    setEditingStep(step);
  };

  const saveStepSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;
    const orgId = localStorage.getItem('cordibase_active_org');

    const newConfig = JSON.stringify(stepConfigData);
    const res = await fetch(`/api/crm/workflow_steps/${editingStep.id}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', 'x-org-id': orgId || '' },
      body: JSON.stringify({ actionConfig: newConfig }),
    });

    if (res.ok) {
      setEditingStep(null);
      fetchData();
    } else {
      modal.alert("Failed to save step settings");
    }
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-thread border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!workflow) {
    return <div className="p-12 text-center text-ink/60">Workflow not found.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-linen rounded-lg transition-colors text-ink/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-ink">{workflow.title}</h2>
            <p className="text-sm text-ink/60">{workflow.description || "No description provided"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <span className={`text-sm font-medium ${workflow.isActive ? 'text-ink' : 'text-ink/60'}`}>
              {workflow.isActive ? 'Workflow Active' : 'Workflow Draft'}
            </span>
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={workflow.isActive} onChange={toggleActive} />
              <div className="w-11 h-6 bg-[#EAECF0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-6 h-full pb-6">
        {/* Main Canvas (Linear Builder) */}
        <div className="flex-1 bg-linen border border-ink/10 rounded-xl p-8 overflow-y-auto relative flex flex-col items-center">
          
          {/* Trigger Node */}
          <div className="w-full max-w-md bg-white border border-ink/10 shadow-sm rounded-xl p-5 mb-8 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#F6F1E7] rounded-lg">
                <Zap className="w-6 h-6 text-thread" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink text-base mb-1">Enrollment Trigger</h3>
                <p className="text-sm text-ink/60 font-medium">{TRIGGER_LABELS[workflow.triggerType] || workflow.triggerType}</p>
              </div>
              <button onClick={openTriggerSettings} className="p-2 hover:bg-linen rounded-md text-ink/60 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Steps */}
          {steps.map((step, idx) => (
            <div key={step.id} className="w-full max-w-md relative flex flex-col items-center group">
              {/* Connector line */}
              <div className="w-px h-8 bg-[#D0D5DD] -mt-8"></div>
              
              <div className="w-full bg-white border border-ink/10 shadow-sm rounded-xl p-5 relative z-10 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-linen rounded-lg">
                    {ACTION_LABELS[step.actionType]?.icon || <Settings className="w-6 h-6 text-ink/60" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-1">Step {idx + 1}</div>
                    <h3 className="font-semibold text-ink text-base mb-1">
                      {ACTION_LABELS[step.actionType]?.label || step.actionType}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openStepSettings(step)} className="p-2 hover:bg-linen rounded-md text-ink/60 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteStep(step.id)} className="p-2 hover:bg-[#FEF2F2] rounded-md text-[#DC2626] transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Step Button */}
          <div className="relative flex flex-col items-center mt-8">
            {steps.length > 0 && <div className="w-px h-8 bg-[#D0D5DD] -mt-8 absolute top-0"></div>}
            <button 
              onClick={() => setIsAddingStep(true)}
              className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border border-[#D0D5DD] rounded-full shadow-sm text-ink/60 hover:text-ink hover:border-[#1D2939] hover:shadow transition-all mt-8"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          
        </div>

        {/* Right Sidebar (Settings & Logs) */}
        <div className="w-80 flex-shrink-0 bg-white border border-ink/10 rounded-xl p-5 space-y-6">
          <div>
            <h3 className="font-medium text-ink mb-4">Workflow Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-ink/60 mb-1">Created By</div>
                <div className="text-ink font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-thread/10 flex items-center justify-center text-thread text-xs font-bold">U</div>
                  Current User
                </div>
              </div>
              <div>
                <div className="text-ink/60 mb-1">Total Steps</div>
                <div className="text-ink font-medium">{steps.length} Actions</div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-ink/10">
            <h3 className="font-medium text-ink mb-4">Execution History</h3>
            <div className="text-sm text-ink/60 italic bg-linen p-4 rounded-lg border border-ink/10">
              No executions yet. Turn on the workflow to start enrolling records.
            </div>
          </div>
        </div>
      </div>

      {/* Add Step Modal */}
      {isAddingStep && (
        <div className="fixed inset-0 bg-[#1D2939]/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-semibold text-ink">Add Next Action</h3>
              <button onClick={() => setIsAddingStep(false)} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={addStep} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-3">Choose Action Type</label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(ACTION_LABELS).map(([val, {label, icon}]) => (
                    <label key={val} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${stepActionType === val ? 'border-thread bg-thread/5 ring-1 ring-[#A83C2E]' : 'border-ink/10 hover:bg-linen'}`}>
                      <input type="radio" name="action_type" value={val} checked={stepActionType === val} onChange={() => setStepActionType(val)} className="sr-only" />
                      <div className="p-1.5 bg-white rounded-md border border-ink/10">{icon}</div>
                      <span className="font-medium text-ink">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-ink/10">
                <button type="button" onClick={() => setIsAddingStep(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-linen rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors">Add Action</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Settings Modal */}
      {isEditingTrigger && (
        <div className="fixed inset-0 bg-[#1D2939]/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-semibold text-ink">Trigger Settings</h3>
              <button onClick={() => setIsEditingTrigger(false)} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={saveTriggerSettings} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Target Object</label>
                <select value={triggerConfigData.object || "contact"} onChange={e => setTriggerConfigData({...triggerConfigData, object: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                  <option value="contact">Contact</option>
                  <option value="company">Company</option>
                  <option value="deal">Deal</option>
                </select>
              </div>
              
              {workflow.triggerType === "stage_change" && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Target Stage</label>
                  <select value={triggerConfigData.stage || "closed_won"} onChange={e => setTriggerConfigData({...triggerConfigData, stage: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                    <option value="qualification">Qualification</option>
                    <option value="proposal">Proposal</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3 border-t border-ink/10">
                <button type="button" onClick={() => setIsEditingTrigger(false)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-linen rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Settings Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-[#1D2939]/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-ink/10 flex justify-between items-center">
              <h3 className="font-semibold text-ink">{ACTION_LABELS[editingStep.actionType]?.label || "Action"} Settings</h3>
              <button onClick={() => setEditingStep(null)} className="text-ink/60 hover:text-ink focus:outline-none">✕</button>
            </div>
            <form onSubmit={saveStepSettings} className="p-4 space-y-4">
              
              {editingStep.actionType === 'send_email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">To</label>
                    <input value={stepConfigData.to || ""} onChange={e => setStepConfigData({...stepConfigData, to: e.target.value})} placeholder="e.g. {{contact.email}}" className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Subject</label>
                    <input value={stepConfigData.subject || ""} onChange={e => setStepConfigData({...stepConfigData, subject: e.target.value})} placeholder="Welcome!" className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Body</label>
                    <textarea value={stepConfigData.body || ""} onChange={e => setStepConfigData({...stepConfigData, body: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none min-h-[100px] resize-none" />
                  </div>
                </>
              )}

              {editingStep.actionType === 'create_task' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Task Title</label>
                    <input value={stepConfigData.title || ""} onChange={e => setStepConfigData({...stepConfigData, title: e.target.value})} placeholder="Follow up call" className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Due In (Days)</label>
                    <input type="number" min="0" value={stepConfigData.dueDays || "1"} onChange={e => setStepConfigData({...stepConfigData, dueDays: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                  </div>
                </>
              )}

              {editingStep.actionType === 'webhook' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Webhook URL</label>
                    <input value={stepConfigData.url || ""} onChange={e => setStepConfigData({...stepConfigData, url: e.target.value})} placeholder="https://api.example.com/webhook" className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Method</label>
                    <select value={stepConfigData.method || "POST"} onChange={e => setStepConfigData({...stepConfigData, method: e.target.value})} className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none bg-white">
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                    </select>
                  </div>
                </>
              )}

              {editingStep.actionType === 'ai_agent' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Prompt / Instructions</label>
                    <textarea value={stepConfigData.prompt || ""} onChange={e => setStepConfigData({...stepConfigData, prompt: e.target.value})} placeholder="Draft a personalized email based on..." className="w-full p-2 border border-ink/10 rounded-lg text-sm focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread outline-none min-h-[100px] resize-none" />
                  </div>
                </>
              )}
              
              {(!['send_email', 'create_task', 'webhook', 'ai_agent'].includes(editingStep.actionType)) && (
                <div className="text-sm text-ink/60 py-4 text-center">
                  Settings configuration for this action type is coming soon.
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-ink/10">
                <button type="button" onClick={() => setEditingStep(null)} className="px-4 py-2 text-sm font-medium text-ink hover:bg-linen rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-thread hover:bg-[#8B3125] rounded-lg transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
