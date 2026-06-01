import React from 'react';
import { 
  Network, 
  Trash2, 
  Plus, 
  HelpCircle, 
  Sparkles, 
  AlertCircle,
  Eye, 
  UserPlus, 
  Clock, 
  MessageSquare, 
  Forward, 
  Mail, 
  Check, 
  Play, 
  Pause,
  Shuffle,
  Loader2
} from 'lucide-react';
import { Campaign, CampaignStep } from '../types';

interface CampaignsPanelProps {
  campaigns: Campaign[];
  onCreateCampaign: (name: string, steps: CampaignStep[]) => void;
  onUpdateCampaignStatus: (campaignId: string, status: Campaign['status']) => void;
  onUpdateSteps: (campaignId: string, steps: CampaignStep[]) => void;
  onRefreshDB: () => void;
}

export default function CampaignsPanel({
  campaigns,
  onCreateCampaign,
  onUpdateCampaignStatus,
  onUpdateSteps,
  onRefreshDB
}: CampaignsPanelProps) {
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(campaigns[0] || null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newCampaignName, setNewCampaignName] = React.useState('');

  // LinkedIn Search URL Importer states
  const [searchUrl, setSearchUrl] = React.useState('');
  const [targetCampaignId, setTargetCampaignId] = React.useState('');
  const [customCampaignName, setCustomCampaignName] = React.useState('');
  const [isImportingSearchUrl, setIsImportingSearchUrl] = React.useState(false);
  const [importError, setImportError] = React.useState('');
  const [importSuccess, setImportSuccess] = React.useState('');

  const handleImportSearchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUrl.trim()) return;
    setIsImportingSearchUrl(true);
    setImportError('');
    setImportSuccess('');

    try {
      const response = await fetch("/api/linkedin/campaign-from-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchUrl: searchUrl.trim(),
          campaignId: targetCampaignId || undefined,
          campaignName: customCampaignName.trim() || undefined
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to crawl target LinkedIn search link.");
      }
      setImportSuccess(data.message || "Leads crawled and imported successfully!");
      setSearchUrl('');
      setCustomCampaignName('');
      setTargetCampaignId('');
      onRefreshDB(); // notify parent to re-fetch database state
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || "Could not link leads. Please check your credentials and retry.");
    } finally {
      setIsImportingSearchUrl(false);
    }
  };
  
  // AI message creator controls
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [aiTone, setAiTone] = React.useState('conversational');
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const [editingStepIndex, setEditingStepIndex] = React.useState<number | null>(null);

  // New campaign steps building blocks
  const [newCampaignSteps, setNewCampaignSteps] = React.useState<CampaignStep[]>([
    { id: "step-sc-1", type: "visit_profile", delayDays: 0 },
    { id: "step-sc-2", type: "send_invite", delayDays: 1, messageTemplate: "Hi {{firstName}}, excited to sync with another growth builder @ {{company}} in visual tech. Let's connect!" }
  ]);

  // AI strategic generator inputs
  const [audienceDesc, setAudienceDesc] = React.useState('');
  const [offeringDesc, setOfferingDesc] = React.useState('');
  const [strategyLoading, setStrategyLoading] = React.useState(false);
  const [strategyResult, setStrategyResult] = React.useState<any>(null);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaign?.id) || selectedCampaign;

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;
    
    onCreateCampaign(newCampaignName, newCampaignSteps);
    setNewCampaignName('');
    setIsCreating(false);
    setNewCampaignSteps([
      { id: "step-sc-1", type: "visit_profile", delayDays: 0 },
      { id: "step-sc-2", type: "send_invite", delayDays: 1, messageTemplate: "Hi {{firstName}}, excited to sync with another growth builder @ {{company}} in visual tech. Let's connect!" }
    ]);
  };

  const handleAddStepToCreator = (type: CampaignStep['type']) => {
    const freshId = `step-sc-${Date.now()}`;
    const defaultTemplate = type === 'send_message' || type === 'send_followup'
      ? "Hi {{firstName}}, checking on your SaaS telemetry setup. Let me know if you are open to trial our dashboard."
      : type === 'send_email'
      ? "Hi {{firstName}}, hoping this email finds you well. I noticed {{company}} lacks real-time LinkedIn CRM syncer..."
      : undefined;

    setNewCampaignSteps([
      ...newCampaignSteps,
      { id: freshId, type, delayDays: 2, messageTemplate: defaultTemplate }
    ]);
  };

  const handleUpdateStepInCreator = (index: number, fields: Partial<CampaignStep>) => {
    const updated = [...newCampaignSteps];
    updated[index] = { ...updated[index], ...fields };
    setNewCampaignSteps(updated);
  };

  const handleRemoveStepFromCreator = (index: number) => {
    const updated = [...newCampaignSteps];
    updated.splice(index, 1);
    setNewCampaignSteps(updated);
  };

  const stepOptions: { type: CampaignStep['type']; icon: any; title: string; color: string }[] = [
    { type: 'visit_profile', icon: Eye, title: 'Visit Profile', color: 'bg-emerald-950 text-emerald-300 ring-emerald-800' },
    { type: 'send_invite', icon: UserPlus, title: 'Send Invite Request', color: 'bg-indigo-950 text-indigo-300 ring-indigo-800' },
    { type: 'send_message', icon: MessageSquare, title: 'First Message', color: 'bg-blue-950 text-blue-300 ring-blue-800' },
    { type: 'send_followup', icon: Forward, title: 'Send Follow-up Message', color: 'bg-purple-950 text-purple-300 ring-purple-800' },
    { type: 'send_email', icon: Mail, title: 'Send Cold Email', color: 'bg-zinc-800 text-zinc-300 ring-zinc-700' }
  ];

  // Call Gemini outreach template optimizer
  const handleOptimizeWithGemini = async (stepIndex: number, currentText: string) => {
    setEditingStepIndex(stepIndex);
    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentMessage: currentText,
          tone: aiTone,
          prompt: aiPrompt,
          type: activeCampaign?.steps[stepIndex]?.type
        })
      });
      const data = await response.json();
      if (data.message) {
        if (activeCampaign) {
          const revised = [...activeCampaign.steps];
          revised[stepIndex] = { ...revised[stepIndex], messageTemplate: data.message, isAiOptimized: true };
          onUpdateSteps(activeCampaign.id, revised);
          setAiPrompt('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
      setEditingStepIndex(null);
    }
  };

  // Strategic AI suggestion tool which gets structural JSON from Gemini
  const handleGenerateStrategicStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audienceDesc || !offeringDesc) return;
    setStrategyLoading(true);
    setStrategyResult(null);

    try {
      const response = await fetch("/api/ai/campaign-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: audienceDesc,
          offering: offeringDesc,
          goal: "Book a sales demonstration or sign up for free trials"
        })
      });
      const data = await response.json();
      if (data && data.campaignName) {
        setStrategyResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleApplyStrategy = () => {
    if (!strategyResult) return;
    
    // Convert strategic schema suggestions into CRM steps
    const newSteps: CampaignStep[] = strategyResult.recommendedSequence.map((step: any, idx: number) => ({
      id: `step-strat-${idx}-${Date.now()}`,
      type: step.type as CampaignStep['type'],
      delayDays: step.delayDays,
      messageTemplate: step.suggestedTemplate,
      isAiOptimized: true
    }));

    onCreateCampaign(strategyResult.campaignName, newSteps);
    setStrategyResult(null);
    setAudienceDesc('');
    setOfferingDesc('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-180px)]" id="campaigns-panel">
      
      {/* LEFT PANEL: Campaign List */}
      <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2 text-xs uppercase tracking-wider">
            <Network size={15} className="text-indigo-400" />
            Outreach Sequences ({campaigns.length})
          </h3>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
          >
            <Plus size={13} />
            Create
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {campaigns.map(c => (
            <div 
              key={c.id}
              onClick={() => { setSelectedCampaign(c); setIsCreating(false); }}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${activeCampaign?.id === c.id ? 'bg-indigo-950/20 border-indigo-500/70' : 'bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-800/20'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-zinc-200 text-xs lines-clamp-1">{c.name}</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ring-1 uppercase font-semibold ${c.status === 'active' ? 'bg-emerald-950/60 text-emerald-400 ring-emerald-800/50' : 'bg-amber-950/60 text-amber-400 ring-amber-800/50'}`}>
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-zinc-950/40 rounded-lg text-[10px] text-center text-zinc-400">
                <div>
                  <span className="block text-zinc-500">PROSPECTS</span>
                  <span className="font-bold text-zinc-200">{c.leadsCount}</span>
                </div>
                <div>
                  <span className="block text-zinc-500">ACCEPT %</span>
                  <span className="font-bold text-emerald-400">{c.acceptanceRate}%</span>
                </div>
                <div>
                  <span className="block text-zinc-500">REPLY %</span>
                  <span className="font-bold text-indigo-400">{c.replyRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI STRATEGY PILOT ASSISTANT CARD */}
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4 text-left">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs mb-1">
            <Sparkles size={14} className="text-yellow-400" />
            Gemini Sequence Generator
          </div>
          <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">
            Feed Gemini your audience profile and value proposition to automatically structure a high-converting, multi-channel outreach strategy.
          </p>

          <form onSubmit={handleGenerateStrategicStrategy} className="space-y-2.5">
            <div>
              <label className="block text-[9px] text-zinc-500 font-bold mb-0.5">TARGET AUDIENCE</label>
              <input 
                type="text"
                required
                placeholder="e.g. CTOs at Paris AI startups with Node.js and Rust"
                value={audienceDesc}
                onChange={e => setAudienceDesc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-[10px] text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-[9px] text-zinc-500 font-bold mb-0.5">YOUR SACRED VALUE PROP</label>
              <input 
                type="text"
                required
                placeholder="e.g. Free $10,000 real-time telemetry cloud credits"
                value={offeringDesc}
                onChange={e => setOfferingDesc(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-[10px] text-zinc-200"
              />
            </div>

            <button 
              type="submit"
              disabled={strategyLoading}
              className="w-full p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-zinc-100 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              {strategyLoading && <Loader2 size={11} className="animate-spin" />}
              {strategyLoading ? "Drafting Campaign..." : "Generate AI Outreach Strategy"}
            </button>
          </form>

          {strategyResult && (
            <div className="mt-3 p-3 bg-zinc-950/80 rounded border border-indigo-800/50 space-y-2 text-[10px]">
              <div className="font-bold text-zinc-100">{strategyResult.campaignName}</div>
              <p className="text-zinc-400 italic">"{strategyResult.strategySummary}"</p>
              <button 
                onClick={handleApplyStrategy}
                className="w-full p-1 bg-emerald-600 hover:bg-emerald-500 text-zinc-100 font-bold rounded cursor-pointer transition-all text-[9.5px]"
              >
                Apply Generated Steps to Active Campaign
              </button>
            </div>
          )}
        </div>

        {/* LINKEDIN SEARCH URL IMPORT SYSTEM */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 text-left space-y-3 shadow-inner ring-1 ring-zinc-800/60">
          <div className="flex items-center gap-1.5 text-zinc-300 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            🔗 LinkedIn Search URL Importer
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            Paste a LinkedIn search results URL containing filters (e.g., location, keywords) to automatically import custom, hyper-targeted executive prospects and queue them under Skylan CRM.
          </p>

          <form onSubmit={handleImportSearchUrl} className="space-y-2.5">
            <div>
              <label className="block text-[9px] text-zinc-500 font-bold mb-0.5">LINKEDIN SEARCH URL</label>
              <textarea
                required
                placeholder="e.g., https://www.linkedin.com/search/results/people/?keywords=ceo%20of%20company..."
                value={searchUrl}
                onChange={e => setSearchUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-[10px] text-zinc-200 h-16 focus:outline-none focus:border-zinc-700 resize-none font-sans leading-normal"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="block text-[9px] text-zinc-500 font-bold mb-0.5">TARGET CAMPAIGN</label>
                <select
                  value={targetCampaignId}
                  onChange={e => setTargetCampaignId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-805 rounded px-1 h-7 text-[10px] text-zinc-300 cursor-pointer focus:outline-none focus:border-zinc-700 font-semibold"
                >
                  <option value="">-- Create Brand New --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 font-bold mb-0.5">NEW CAMPAIGN NAME</label>
                <input
                  type="text"
                  placeholder="Optional name override"
                  disabled={!!targetCampaignId}
                  value={customCampaignName}
                  onChange={e => setCustomCampaignName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 h-7 text-[10px] text-zinc-300 disabled:opacity-50"
                />
              </div>
            </div>

            {importError && (
              <div className="p-2 border border-red-900/30 bg-red-950/10 rounded text-[9.5px] text-red-400 font-medium leading-relaxed">
                ⚠️ {importError}
              </div>
            )}

            {importSuccess && (
              <div className="p-2 border border-emerald-950/30 bg-emerald-950/15 rounded text-[9.5px] text-emerald-400 font-semibold leading-relaxed">
                ✓ {importSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isImportingSearchUrl}
              className="w-full p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-zinc-100 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15"
            >
              {isImportingSearchUrl ? (
                <>
                  <Loader2 size={11} className="animate-spin" />
                  Analyzing Filters & Scrapping Matches...
                </>
              ) : (
                "Scan Filters & Run Sequence"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: Sequence Sequence Details & Workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {isCreating ? (
          /* Create Campaign Card */
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-left backdrop-blur-md">
            <h2 className="text-sm font-bold text-zinc-100 mb-4 uppercase tracking-wider pb-2 border-b border-zinc-800 flex items-center gap-2">
              <Network size={16} className="text-indigo-400" />
              Build Multi-Step Campaign sequence
            </h2>
            
            <form onSubmit={handleCreateCampaignSubmit} className="space-y-6">
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1.5">CAMPAIGN STRATEGY NAME</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. AI Founders SF - Winter batch"
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Creator Sequence Pipeline visual */}
              <div className="space-y-3">
                <span className="block text-xs text-zinc-400 font-bold">DRIP TIMELINE STEPS ({newCampaignSteps.length})</span>
                
                {newCampaignSteps.map((step, idx) => {
                  const matches = stepOptions.find(o => o.type === step.type);
                  return (
                    <div key={step.id} className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 font-bold text-xs">
                        #{idx+1}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 uppercase tracking-wider ${matches?.color}`}>
                            {matches?.title}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveStepFromCreator(idx)}
                            className="text-zinc-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                          <div className="col-span-3">
                            <label className="block text-[9px] text-zinc-500 font-bold mb-1">WAIT DAYS</label>
                            <input 
                              type="number"
                              min="0"
                              max="30"
                              value={step.delayDays}
                              onChange={e => handleUpdateStepInCreator(idx, { delayDays: parseInt(e.target.value) || 0 })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300"
                            />
                          </div>

                          {step.messageTemplate !== undefined && (
                            <div className="col-span-9">
                              <label className="block text-[9px] text-zinc-500 font-bold mb-1">MESSAGE TEMPLATE (SUPPORT MERGE FIELDS)</label>
                              <textarea 
                                value={step.messageTemplate}
                                onChange={e => handleUpdateStepInCreator(idx, { messageTemplate: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 text-[11px] h-16 resize-none focus:outline-none focus:border-indigo-500"
                                placeholder="..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add new sequence action selectors */}
                <div className="pt-3 border-t border-zinc-800/60">
                  <span className="block text-[10px] text-zinc-500 font-bold mb-2">ADD ACTION STEP TO SEQUENCE DRIP:</span>
                  <div className="flex flex-wrap gap-2">
                    {stepOptions.map(opt => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handleAddStepToCreator(opt.type)}
                        className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer border border-zinc-700/50 flex items-center gap-1 transition-all"
                      >
                        <opt.icon size={12} />
                        {opt.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all cursor-pointer font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="p-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl transition-all cursor-pointer font-bold text-xs"
                >
                  Publish & Queue Active Sequences
                </button>
              </div>
            </form>
          </div>
        ) : activeCampaign ? (
          /* Active Selected Campaign Details Workspace and Execution Steps */
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-left backdrop-blur-md flex flex-col gap-6">
            
            {/* Sequence Title and status block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Campaign Sequence Configuration</span>
                <h2 className="text-lg font-bold text-zinc-100 mt-0.5">{activeCampaign.name}</h2>
                <p className="text-xs text-zinc-500 mt-1">First generated: {new Date(activeCampaign.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-2">
                {activeCampaign.status === 'active' ? (
                  <button 
                    onClick={() => onUpdateCampaignStatus(activeCampaign.id, 'paused')}
                    className="p-1.5 px-3 bg-zinc-800 hover:bg-amber-950 text-amber-400 border border-amber-800/40 rounded-xl text-xs flex items-center gap-1 cursor-pointer font-semibold transition-all"
                  >
                    <Pause size={13} />
                    Pause Campaign
                  </button>
                ) : (
                  <button 
                    onClick={() => onUpdateCampaignStatus(activeCampaign.id, 'active')}
                    className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl text-xs flex items-center gap-1 cursor-pointer font-semibold transition-all"
                  >
                    <Play size={13} />
                    Resume Campaign
                  </button>
                )}
              </div>
            </div>

            {/* Campaign Performance Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500">Profiles Scraped</span>
                <span className="block text-sm font-extrabold text-zinc-200 mt-0.5">{activeCampaign.stats.profilesViewed}</span>
              </div>
              <div>
                <span className="text-zinc-500">Invites Dispatched</span>
                <span className="block text-sm font-extrabold text-indigo-400 mt-0.5">{activeCampaign.stats.invitesSent}</span>
              </div>
              <div>
                <span className="text-zinc-500">Replies Harvested</span>
                <span className="block text-sm font-extrabold text-emerald-400 mt-0.5">{activeCampaign.stats.repliesReceived}</span>
              </div>
              <div>
                <span className="text-zinc-500">Acceptance Success</span>
                <span className="block text-sm font-extrabold text-amber-400 mt-0.5">{activeCampaign.acceptanceRate}%</span>
              </div>
            </div>

            {/* Sequence steps timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-300 text-xs uppercase tracking-wider">Dynamic Drip Sequence Pipeline ({activeCampaign.steps.length} Actions)</h3>
              
              <div className="relative space-y-4 before:absolute before:w-0.5 before:bg-zinc-800 before:top-2 before:bottom-2 before:left-[19px]">
                {activeCampaign.steps.map((step, idx) => {
                  const opt = stepOptions.find(o => o.type === step.type);
                  return (
                    <div key={step.id} className="relative flex items-start gap-4 text-left">
                      {/* Left index circle */}
                      <span className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-bold font-mono z-10 flex-shrink-0">
                        #{idx+1}
                      </span>

                      {/* Step configuration panel */}
                      <div className="flex-1 bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/40 pb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 uppercase tracking-wider ${opt?.color}`}>
                              {opt?.title}
                            </span>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-semibold">
                              <Clock size={11} />
                              {step.delayDays === 0 ? "Trigger instantly" : `Wait ${step.delayDays} days`}
                            </span>
                          </div>

                          {step.isAiOptimized && (
                            <span className="bg-amber-950/60 text-amber-400 ring-1 ring-amber-800/40 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                              <Sparkles size={11} />
                              AI Optimized
                            </span>
                          )}
                        </div>

                        {/* Editable delay and template fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                          <div className="col-span-3">
                            <label className="block text-[10px] text-zinc-500 font-bold mb-1">WAIT DELAY (DAYS)</label>
                            <input 
                              type="number" 
                              min="0"
                              max="30"
                              value={step.delayDays}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                const copies = [...activeCampaign.steps];
                                copies[idx] = { ...copies[idx], delayDays: val };
                                onUpdateSteps(activeCampaign.id, copies);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {step.messageTemplate !== undefined && (
                            <div className="col-span-9 space-y-2">
                              <label className="block text-[10px] text-zinc-500 font-bold mb-1">
                                MESSAGE TEMPLATE (SUPPORTS MERGE TAGS: {"{{firstName}}"}, {"{{company}}"}, {"{{title}}"})
                              </label>
                              <textarea 
                                value={step.messageTemplate}
                                onChange={e => {
                                  const copies = [...activeCampaign.steps];
                                  copies[idx] = { ...copies[idx], messageTemplate: e.target.value };
                                  onUpdateSteps(activeCampaign.id, copies);
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-300 text-xs h-20 resize-none focus:outline-none focus:border-indigo-500 leading-relaxed"
                                placeholder="Write customized outreach copy..."
                              />

                              {/* AI message optimization trigger input */}
                              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                <input 
                                  type="text"
                                  placeholder="AI instructions: e.g. Make it shorter, add a question about deployment delays..."
                                  value={editingStepIndex === idx ? aiPrompt : ''}
                                  onChange={e => {
                                    setEditingStepIndex(idx);
                                    setAiPrompt(e.target.value);
                                  }}
                                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleOptimizeWithGemini(idx, step.messageTemplate || '')}
                                  disabled={isGeneratingAi}
                                  className="p-1 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-55 text-[10px] font-bold text-zinc-200 border border-zinc-700/60 rounded cursor-pointer transition-all flex items-center justify-center gap-1"
                                >
                                  {isGeneratingAi && editingStepIndex === idx ? (
                                    <Loader2 size={11} className="animate-spin text-indigo-400" />
                                  ) : (
                                    <Sparkles size={11} className="text-yellow-400" />
                                  )}
                                  Optimize Template
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
            <Network size={40} className="text-zinc-700" />
            <p>No outreach campaign sequence selected.</p>
            <p className="text-xs">Click + Create in Left Panel to orchestrate your smart LinkedIn drips.</p>
          </div>
        )}
      </div>

    </div>
  );
}
