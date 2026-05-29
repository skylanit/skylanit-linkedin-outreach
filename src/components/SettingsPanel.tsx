import React from 'react';
import { 
  Settings, 
  Linkedin, 
  Shield, 
  Bell, 
  Key, 
  CreditCard,
  Network,
  RefreshCw,
  Clock,
  Unlock,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { LinkedInAccount, IntegrationSettings } from '../types';

interface SettingsPanelProps {
  linkedinAccount: LinkedInAccount;
  integrationSettings: IntegrationSettings;
  onUpdateLinkedInAccount: (account: Partial<LinkedInAccount>) => void;
  onUpdateIntegrations: (integrations: Partial<IntegrationSettings>) => void;
}

export default function SettingsPanel({
  linkedinAccount,
  integrationSettings,
  onUpdateLinkedInAccount,
  onUpdateIntegrations
}: SettingsPanelProps) {
  const [sessionCookie, setSessionCookie] = React.useState(linkedinAccount.sessionCookie);
  const [proxy, setProxy] = React.useState(linkedinAccount.proxy);
  const [testingProxy, setTestingProxy] = React.useState(false);
  const [proxyResult, setProxyResult] = React.useState<'success' | 'failed' | null>(null);

  // Rate Limits States
  const [limits, setLimits] = React.useState({
    invitesPerDay: linkedinAccount.rateLimits.invitesPerDay,
    messagesPerDay: linkedinAccount.rateLimits.messagesPerDay,
    profileViewsPerDay: linkedinAccount.rateLimits.profileViewsPerDay,
    humanDelayMinSec: linkedinAccount.rateLimits.humanDelayMinSec,
    humanDelayMaxSec: linkedinAccount.rateLimits.humanDelayMaxSec
  });

  const [savingLimits, setSavingLimits] = React.useState(false);

  // Custom Integration Webhooks States
  const [zapierUrl, setZapierUrl] = React.useState(integrationSettings.zapierWebhookUrl);
  const [customWebhookUrl, setCustomWebhookUrl] = React.useState(integrationSettings.customWebhookUrl);
  const [googleSync, setGoogleSync] = React.useState(integrationSettings.googleCalendarSync);
  const [hubspotSync, setHubspotSync] = React.useState(integrationSettings.hubspotSync);

  const [activeTab, setActiveTab] = React.useState<'linkedin' | 'limits' | 'integrations' | 'billing'>('linkedin');

  const handleTestProxy = () => {
    setTestingProxy(true);
    setProxyResult(null);
    setTimeout(() => {
      setTestingProxy(false);
      setProxyResult('success');
      onUpdateLinkedInAccount({ proxy, proxyStatus: 'verified' });
    }, 1500);
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLimits(true);
    setTimeout(() => {
      onUpdateLinkedInAccount({ rateLimits: limits });
      setSavingLimits(false);
    }, 800);
  };

  const handleSaveLinkedInConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLinkedInAccount({ sessionCookie });
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIntegrations({
      zapierWebhookUrl: zapierUrl,
      customWebhookUrl,
      googleCalendarSync: googleSync,
      hubspotSync
    });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col md:flex-row min-h-[500px]" id="settings-panel">
      
      {/* Settings Navigation sub-menus */}
      <div className="md:w-64 border-r border-zinc-800 p-4 space-y-2 text-xs text-left bg-zinc-950/25">
        <h3 className="font-bold text-zinc-400 uppercase tracking-wider px-3 mb-4 text-[10px]">Settings Management</h3>
        
        <button 
          onClick={() => setActiveTab('linkedin')}
          className={`w-full p-2.5 px-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${activeTab === 'linkedin' ? 'bg-indigo-600 text-zinc-100 font-bold' : 'text-zinc-400 hover:bg-zinc-800/20 hover:text-zinc-200'}`}
        >
          <Linkedin size={14} />
          LinkedIn Profile Auth
        </button>

        <button 
          onClick={() => setActiveTab('limits')}
          className={`w-full p-2.5 px-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${activeTab === 'limits' ? 'bg-indigo-600 text-zinc-100 font-bold' : 'text-zinc-400 hover:bg-zinc-800/20 hover:text-zinc-200'}`}
        >
          <Sliders size={14} />
          Outreach & Safety Limits
        </button>

        <button 
          onClick={() => setActiveTab('integrations')}
          className={`w-full p-2.5 px-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${activeTab === 'integrations' ? 'bg-indigo-600 text-zinc-100 font-bold' : 'text-zinc-400 hover:bg-zinc-800/20 hover:text-zinc-200'}`}
        >
          <Network size={14} />
          Integrations & Webhooks
        </button>

        <button 
          onClick={() => setActiveTab('billing')}
          className={`w-full p-2.5 px-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${activeTab === 'billing' ? 'bg-indigo-600 text-zinc-100 font-bold' : 'text-zinc-400 hover:bg-zinc-800/20 hover:text-zinc-200'}`}
        >
          <CreditCard size={14} />
          Billing & Seat Plan
        </button>
      </div>

      {/* Settings Content Panel */}
      <div className="flex-1 p-6 text-left">
        {activeTab === 'linkedin' && (
          <form onSubmit={handleSaveLinkedInConfig} className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">LinkedIn Profiles Connection</h2>
              <p className="text-xs text-zinc-500 mt-1">Connect your LinkedIn profile using secure session tokens. This simulates a real browser environment securely using randomized headers and fingerprint profiles.</p>
            </div>

            <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <img src={linkedinAccount.avatarUrl} alt={linkedinAccount.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500" />
                <div>
                  <h4 className="font-bold text-zinc-200">{linkedinAccount.name}</h4>
                  <p className="text-[10px] text-zinc-500">{linkedinAccount.headline}</p>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-300 ring-1 ring-emerald-800 rounded-full font-semibold uppercase">Connected</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1.5">LINKEDIN SESSION COOKIE (LI_AT) *</label>
                <textarea 
                  value={sessionCookie}
                  onChange={e => setSessionCookie(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono h-20 resize-none leading-relaxed"
                  placeholder="Paste li_at cookie token here..."
                />
                <span className="text-[10px] text-zinc-600 block mt-1 leading-relaxed">
                  We use secure encrypted Local Storage state. NEVER share this token publicly. 
                </span>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1.5">CUSTOM STATIC RESIDENTIAL PROXY IP</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    required
                    placeholder="e.g. US-West-1 (Premium residential) - 104.244.72.109"
                    value={proxy}
                    onChange={e => setProxy(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="button"
                    onClick={handleTestProxy}
                    disabled={testingProxy}
                    className="p-2 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700/60 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {testingProxy && <RefreshCw size={12} className="animate-spin" />}
                    Verify Proxy
                  </button>
                </div>

                {proxyResult === 'success' && (
                  <div className="mt-2.5 p-2 px-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] flex items-center gap-1.5">
                    <CheckCircle size={13} />
                    Proxy connectivity established successfully. Simulated location: Paris, France.
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit"
              className="p-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl transition-all cursor-pointer text-xs font-bold"
            >
              Update Connected Account Configurations
            </button>
          </form>
        )}

        {/* Safety & Limits Configuration */}
        {activeTab === 'limits' && (
          <form onSubmit={handleSaveLimits} className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Campaign Safety & Daily Rate Limits</h2>
              <p className="text-xs text-zinc-500 mt-1">LinkedIn restricts outreach behavior to protect users. Dripify implements safety limits and human delays by mimicking typing speed, scrolling patterns, and natural breaks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-xs">
                <label className="block text-zinc-500 mb-1">Max Invites / Day</label>
                <input 
                  type="number" 
                  max="100"
                  value={limits.invitesPerDay}
                  onChange={e => setLimits({...limits, invitesPerDay: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono text-center"
                />
                <span className="text-[9px] text-zinc-600 block mt-1.5">Recommended max: 40/day</span>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-xs">
                <label className="block text-zinc-500 mb-1">Max Messages / Day</label>
                <input 
                  type="number" 
                  max="200"
                  value={limits.messagesPerDay}
                  onChange={e => setLimits({...limits, messagesPerDay: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono text-center"
                />
                <span className="text-[9px] text-zinc-600 block mt-1.5">Recommended max: 80/day</span>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-xs">
                <label className="block text-zinc-500 mb-1">Max Profile Views / Day</label>
                <input 
                  type="number" 
                  max="150"
                  value={limits.profileViewsPerDay}
                  onChange={e => setLimits({...limits, profileViewsPerDay: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono text-center"
                />
                <span className="text-[9px] text-zinc-600 block mt-1.5">Recommended max: 50/day</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-300 text-xs pt-2">Human Delay & Sleep Parameters</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Typing/Loading sleep min (seconds)</label>
                  <input 
                    type="number" 
                    value={limits.humanDelayMinSec}
                    onChange={e => setLimits({...limits, humanDelayMinSec: parseInt(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Typing/Loading sleep max (seconds)</label>
                  <input 
                    type="number" 
                    value={limits.humanDelayMaxSec}
                    onChange={e => setLimits({...limits, humanDelayMaxSec: parseInt(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2 leading-relaxed">
                <Clock size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p><strong>SAFETY ALGORITHM WARNING:</strong> Keep delays between 45 seconds and 180 seconds. Short delays can trigger automated scraping detection by LinkedIn session analytics.</p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={savingLimits}
              className="p-2 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-zinc-100 rounded-xl transition-all font-bold cursor-pointer text-xs"
            >
              {savingLimits ? "Saving Safeguards..." : "Commit Safety Safeguards"}
            </button>
          </form>
        )}

        {/* Integration webhooks */}
        {activeTab === 'integrations' && (
          <form onSubmit={handleSaveIntegrations} className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">External CRM & Zapier Webhook syncs</h2>
              <p className="text-xs text-zinc-500 mt-1">Dripify CRM streams deal conversions, message replies, and connection updates instantly into your favorite platforms.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1.5">ZAPIER TRIGGER INBOUND URL</label>
                <input 
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={zapierUrl}
                  onChange={e => setZapierUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1.5">CUSTOM CRM WEBHOOK DISPATCH URL</label>
                <input 
                  type="url"
                  placeholder="https://yourdomain.com/webhooks/linkedin"
                  value={customWebhookUrl}
                  onChange={e => setCustomWebhookUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <span className="block text-zinc-500 font-bold uppercase text-[9px] mb-2">Automated Integrations toggle</span>

                <label className="flex items-center gap-2.5 text-zinc-300">
                  <input 
                    type="checkbox" 
                    checked={googleSync}
                    onChange={e => setGoogleSync(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <span>Automatically sync hot replies with Google Calendar schedule</span>
                </label>

                <label className="flex items-center gap-2.5 text-zinc-300">
                  <input 
                    type="checkbox" 
                    checked={hubspotSync}
                    onChange={e => setHubspotSync(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <span>Automatically dispatch lead contact logs into HubSpot Sales Hub</span>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="p-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl transition-all cursor-pointer font-bold text-xs"
            >
              Update External Webhooks Synced
            </button>
          </form>
        )}

        {/* Saas Plan status and seat Billing options */}
        {activeTab === 'billing' && (
          <div className="space-y-6 max-w-xl text-xs">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">SaaS Active Plan and Billing Overview</h2>
              <p className="text-xs text-zinc-500 mt-1">Check allocated seats, monthly connection limits, billing schedule, or upgrade premium capabilities.</p>
            </div>

            <div className="p-6 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-indigo-400 uppercase font-bold text-[9px]">ACTIVE PACKAGE</span>
                <h3 className="text-zinc-100 font-black text-lg mt-0.5">Enterprise Unlimited Seat Platform</h3>
                <p className="text-zinc-400 mt-1 leading-relaxed">Annual corporate billing. Sync up to 25 separate LinkedIn profiles with custom dedicated proxy IPs safely.</p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center font-mono">
                <span className="text-zinc-500 block text-[9px] font-bold">COST</span>
                <span className="text-xl font-bold text-zinc-200 block">$480/mo</span>
                <span className="text-[9px] text-emerald-400 font-semibold block uppercase">PAID (May 2026)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-left">
              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-zinc-500 font-semibold tracking-wider block text-[10px]">SEAT USAGE</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-zinc-200">3 Active Seats</span>
                  <span className="text-zinc-500">/ 25 Total Max</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded" style={{ width: '12%' }} />
                </div>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="text-zinc-500 font-semibold tracking-wider block text-[10px]">NEXT RENEWAL TIMING</span>
                <span className="text-lg font-bold text-zinc-200 block">January 15th, 2027</span>
                <span className="text-[10px] text-zinc-400 block font-medium">Auto-renew active (Credit Card Card ended with *4084)</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
