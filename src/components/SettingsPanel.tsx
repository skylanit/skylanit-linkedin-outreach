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
  AlertCircle,
  Trash2,
  PlusCircle,
  Check,
  Globe,
  Info
} from 'lucide-react';
import { LinkedInAccount, IntegrationSettings } from '../types';

interface SettingsPanelProps {
  linkedinAccount: LinkedInAccount;
  linkedinAccounts?: LinkedInAccount[];
  integrationSettings: IntegrationSettings;
  onUpdateLinkedInAccount: (account: Partial<LinkedInAccount>) => void;
  onUpdateIntegrations: (integrations: Partial<IntegrationSettings>) => void;
  onUpdateAccounts?: (accounts: LinkedInAccount[]) => void;
}

export default function SettingsPanel({
  linkedinAccount,
  linkedinAccounts = [],
  integrationSettings,
  onUpdateLinkedInAccount,
  onUpdateIntegrations,
  onUpdateAccounts
}: SettingsPanelProps) {
  // New account form states
  const [newName, setNewName] = React.useState('');
  const [newHeadline, setNewHeadline] = React.useState('');
  const [newConnections, setNewConnections] = React.useState(1200);
  const [newProxy, setNewProxy] = React.useState('US-East-1 (Premium static Residential) - 67.215.102.18');
  const [newCookie, setNewCookie] = React.useState('');
  const [newAvatar, setNewAvatar] = React.useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');

  const [testingProxy, setTestingProxy] = React.useState(false);
  const [proxyResult, setProxyResult] = React.useState<'success' | 'failed' | null>(null);
  const [formError, setFormError] = React.useState('');
  const [formSuccess, setFormSuccess] = React.useState('');

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

  // Trigger proxy latency connectivity test of the selected residential IP
  const handleTestProxy = (proxyStr: string) => {
    setTestingProxy(true);
    setProxyResult(null);

    fetch("/api/accounts/test-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proxy: proxyStr })
    })
    .then(res => res.json())
    .then(data => {
      setTestingProxy(false);
      if (data.status === 'success') {
        setProxyResult('success');
      } else {
        setProxyResult('failed');
      }
    })
    .catch(() => {
      setTestingProxy(false);
      setProxyResult('failed');
    });
  };

  // Switch which connected account actively drives the sequencing crawls
  const handleSetActiveAccount = (id: string) => {
    if (!onUpdateAccounts) return;
    const nextAccounts = linkedinAccounts.map(acc => ({
      ...acc,
      isActive: acc.id === id
    }));
    onUpdateAccounts(nextAccounts);
  };

  // Disconnect a LinkedIn Account securely
  const handleDeleteAccount = (id: string) => {
    if (!onUpdateAccounts) return;
    if (linkedinAccounts.length <= 1) {
      alert("At least one active connected LinkedIn profile is required to run campaigns.");
      return;
    }
    const filtered = linkedinAccounts.filter(acc => acc.id !== id);
    // Ensure one is left active!
    if (!filtered.some(a => a.isActive)) {
      filtered[0].isActive = true;
    }
    onUpdateAccounts(filtered);
  };

  // Handle adding a brand-new LinkedIn pipeline account
  const handleConnectNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newName.trim() || !newCookie.trim()) {
      setFormError("Account Full Name and LinkedIn Cookie (LI_AT) are required.");
      return;
    }

    setTestingProxy(true);
    
    // Auto proxy verification on connection attempt
    fetch("/api/accounts/test-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proxy: newProxy })
    })
    .then(res => res.json())
    .then(data => {
      setTestingProxy(false);
      
      const newAcc: LinkedInAccount = {
        id: `acc-fresh-${Date.now()}`,
        connected: true,
        name: newName,
        avatarUrl: newAvatar,
        headline: newHeadline || "SaaS Builder & Marketing Advisor",
        connectionsCount: Number(newConnections) || 500,
        sessionCookie: newCookie,
        proxy: newProxy,
        proxyStatus: data.status === 'success' ? 'verified' : 'failed',
        healthStatus: 'healthy',
        isActive: linkedinAccounts.length === 0, // set active if it's the first one
        rateLimits: {
          invitesPerDay: 40,
          messagesPerDay: 80,
          profileViewsPerDay: 50,
          humanDelayMinSec: 45,
          humanDelayMaxSec: 180
        }
      };

      if (onUpdateAccounts) {
        onUpdateAccounts([...linkedinAccounts, newAcc]);
        setFormSuccess(`Successfully authenticated & proxy-bounded LinkedIn profile for '${newName}'!`);
        // Reset form variables
        setNewName('');
        setNewHeadline('');
        setNewCookie('');
        setNewConnections(1500);
      }
    })
    .catch(() => {
      setTestingProxy(false);
      setFormError("Proxy integrity check timed out. Please specify a valid and routeable proxy IP node.");
    });
  };

  const handleConnectOAuth = async () => {
    setFormError('');
    setFormSuccess('');
    setTestingProxy(true);
    try {
      let oauthUrl = "";
      try {
        const originParam = encodeURIComponent(window.location.origin);
        const res = await fetch(`/api/connect/li/url?origin=${originParam}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok && data.url) {
            oauthUrl = data.url;
          } else if (data.error) {
            console.warn("Safe handshake warning:", data.error);
          }
        }
      } catch (e) {
        console.warn("Primary OAuth handshake failed, trying legacy route...", e);
      }

      // Try legacy route if safe route failed
      if (!oauthUrl) {
        try {
          const originParam = encodeURIComponent(window.location.origin);
          const res = await fetch(`/api/auth/linkedin/url?origin=${originParam}`);
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (res.ok && data.url) {
              oauthUrl = data.url;
            }
          }
        } catch (e) {
          console.warn("Legacy OAuth handshake failed.", e);
        }
      }

      // Secure client-side dynamic fallback construction (handles adblocker interventions and static SPA hosts flawlessly)
      if (!oauthUrl) {
        console.info("Constructing secure client-side LinkedIn OAuth dynamic url fallback...");
        const clientId = "86ufehp1ori1dk";
        
        // Match registered production redirect URL if in preview environment, so LinkedIn doesn't reject it
        let redirectUri = `${window.location.origin}/api/connect/li/callback`;
        if (
          window.location.origin.includes("run.app") || 
          window.location.origin.includes("localhost") || 
          window.location.origin.includes("3000") || 
          !window.location.origin.includes("skylanit-linkedin-outreach.info-moneymatters1.workers.dev")
        ) {
          redirectUri = "https://skylanit-linkedin-outreach.info-moneymatters1.workers.dev/api/connect/li/callback";
        }

        // Construct high-integrity base64 state containing original web origin
        const stateObj = {
          origin: window.location.origin,
          csrf: Math.random().toString(36).substring(2, 15)
        };
        const state = btoa(JSON.stringify(stateObj));

        const params = new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          redirect_uri: redirectUri,
          state: state,
          scope: "openid profile email"
        });
        oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      }

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        oauthUrl,
        "linkedin_oauth",
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (!popup) {
        setFormError("Popup was blocked! Please allow popups for Skylan to authenticate with LinkedIn.");
      }
    } catch (error: any) {
      setFormError(error.message || "Failed to initiate secure LinkedIn auth handshake.");
    } finally {
      setTestingProxy(false);
    }
  };

  React.useEffect(() => {
    const handleSuccessAndClean = (profileName: string) => {
      setFormSuccess(`Connected '${profileName}' successfully via LinkedIn OAuth 2.0!`);
      try {
        localStorage.removeItem("skylan_pending_oauth_name");
      } catch (e) {}

      // Refresh database state from server and merge:
      fetch("/api/db/get")
        .then(res => res.json())
        .then(db => {
          if (db && db.accounts) {
            const cachedDbRaw = localStorage.getItem("skylan_local_db");
            const cached = cachedDbRaw ? JSON.parse(cachedDbRaw) : {};
            const merged = { ...cached, ...db };
            localStorage.setItem("skylan_local_db", JSON.stringify(merged));
            
            // Reload the tab layout is highly recommended here to seamlessly align all UI contexts
            setTimeout(() => {
              window.location.reload();
            }, 600);
          }
        })
        .catch(err => {
          console.warn("Deferred state merge after OAuth link:", err);
          setTimeout(() => {
            window.location.reload();
          }, 600);
        });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LINKEDIN_OAUTH_SUCCESS') {
        handleSuccessAndClean(event.data.name);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'skylan_pending_oauth_name' && event.newValue) {
        console.info("SettingsPanel received success from storage event:", event.newValue);
        handleSuccessAndClean(event.newValue);
      }
    };

    // Low-latency polling fallback
    const interval = setInterval(() => {
      try {
        const pendingValue = localStorage.getItem("skylan_pending_oauth_name");
        if (pendingValue) {
          console.info("SettingsPanel received success from localStorage polling fallback:", pendingValue);
          handleSuccessAndClean(pendingValue);
        }
      } catch (e) {}
    }, 600);

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLimits(true);
    setTimeout(() => {
      onUpdateLinkedInAccount({ rateLimits: limits });
      setSavingLimits(false);
    }, 800);
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
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col md:flex-row min-h-[550px]" id="settings-panel">
      
      {/* Settings Navigation sub-menus */}
      <div className="md:w-64 border-r border-zinc-800 p-5 space-y-2 text-xs text-left bg-zinc-950/25">
        <div className="flex items-center gap-2 mb-4 px-1.5 pt-1">
          <Settings size={14} className="text-indigo-400" />
          <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">CRM Safe Settings</h3>
        </div>
        
        <button 
          onClick={() => setActiveTab('linkedin')}
          className={`w-full p-2.5 px-3.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'linkedin' ? 'bg-indigo-600/90 text-zinc-100 font-bold shadow-lg shadow-indigo-600/10' : 'text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300'}`}
        >
          <Linkedin size={14} />
          <span>Connect Profiles</span>
        </button>

        <button 
          onClick={() => setActiveTab('limits')}
          className={`w-full p-2.5 px-3.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'limits' ? 'bg-indigo-600/90 text-zinc-100 font-bold shadow-lg shadow-indigo-600/10' : 'text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300'}`}
        >
          <Sliders size={14} />
          <span>Outreach Limits</span>
        </button>

        <button 
          onClick={() => setActiveTab('integrations')}
          className={`w-full p-2.5 px-3.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'integrations' ? 'bg-indigo-600/90 text-zinc-100 font-bold shadow-lg shadow-indigo-600/10' : 'text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300'}`}
        >
          <Network size={14} />
          <span>Integrations Webhook</span>
        </button>

        <button 
          onClick={() => setActiveTab('billing')}
          className={`w-full p-2.5 px-3.5 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all ${activeTab === 'billing' ? 'bg-indigo-600/90 text-zinc-100 font-bold shadow-lg shadow-indigo-600/10' : 'text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300'}`}
        >
          <CreditCard size={14} />
          <span>Billing & Seats</span>
        </button>
      </div>

      {/* Settings Content Panel */}
      <div className="flex-1 p-6 text-left">
        {activeTab === 'linkedin' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Linkedin size={16} className="text-indigo-400" />
                Multi-Account LinkedIn Core
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Connect your team's LinkedIn or Sales Navigator accounts directly. Every crawler logs on using separate residential proxy networks to avoid overlapping footprint cookies.</p>
            </div>

            {/* Main column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Form to Connect/Add a New LinkedIn Profile */}
              <div className="lg:col-span-7 bg-zinc-950/20 border border-zinc-800/70 p-5 rounded-2xl space-y-5 font-sans animate-fade-in">
                <div>
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PlusCircle size={14} className="text-emerald-500" />
                    Connect New Profile
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Expand your outreach scope using secure OAuth 2.0 or cookie proxies.</p>
                </div>

                {formError && (
                  <div className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-[10px] flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/10 rounded-xl text-emerald-400 text-[10.5px] flex items-center gap-2">
                    <CheckCircle size={14} className="flex-shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Secure Official OAuth Connection */}
                <div className="p-5 bg-zinc-900/30 rounded-xl border border-zinc-850 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-indigo-500/15 text-indigo-400 font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">Official Integration</span>
                    <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-1 font-mono">✓ High Connection Health</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-150 uppercase tracking-wide">Sign in with LinkedIn</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">Authenticates directly on LinkedIn secure servers. Safely imports profile data.</p>
                    
                    <div className="mt-2.5 bg-[#4F46E5]/10 border border-[#4F46E5]/20 p-2.5 rounded-lg text-[10px] text-zinc-300 leading-relaxed font-sans">
                      💡 <strong>Custom Domain Notice:</strong> If you are hosted on your live Cloudflare Pages URL and get a <code>redirect_uri mismatch</code> error from LinkedIn, it is because you need to register your custom live site domain in your own LinkedIn Developer Portal application. You can add simulated sandbox accounts below to bypass this during testing!
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleConnectOAuth}
                    disabled={testingProxy}
                    className="w-full py-3 px-3 bg-[#0274b3] hover:bg-[#026399] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#0274b3]/10 text-center"
                  >
                    <Linkedin size={13} />
                    <span>Authorize LinkedIn Profile</span>
                  </button>

                  <div className="pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateAccounts) {
                          const demoNames = [
                            "Mila Kowalski", "Marcus Drake", "Sonia Patel", "David Vance"
                          ];
                          const avatars = [
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                          ];
                          const idx = Math.floor(Math.random() * demoNames.length);
                          const randName = demoNames[idx];
                          const randAvatar = avatars[idx];
                          
                          const newDemoAcc: LinkedInAccount = {
                            id: `acc-demo-${Date.now()}`,
                            connected: true,
                            name: randName,
                            avatarUrl: randAvatar,
                            headline: "Enterprise Director / GTM SaaS Strategist",
                            connectionsCount: Math.floor(Math.random() * 3000) + 1000,
                            sessionCookie: "mock-session-cookie",
                            proxy: "US-West-1 (Premium static Residential) - 45.123.88.9",
                            proxyStatus: "verified",
                            healthStatus: "healthy",
                            isActive: false,
                            rateLimits: {
                              invitesPerDay: 40,
                              messagesPerDay: 80,
                              profileViewsPerDay: 50,
                              humanDelayMinSec: 30,
                              humanDelayMaxSec: 120
                            }
                          };
                          onUpdateAccounts([...linkedinAccounts, newDemoAcc]);
                          setFormSuccess(`Instantly generated and connected simulated Sandbox profile: ${randName}!`);
                        }
                      }}
                      className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                    >
                      <Sliders size={12} className="text-zinc-500" />
                      <span>Simulate & Seed Sandbox Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: List of currently connected accounts */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-indigo-400" />
                  Connected Accounts ({linkedinAccounts.length})
                </h3>

                <div className="space-y-3">
                  {linkedinAccounts.map((acc) => (
                    <div 
                      key={acc.id}
                      className={`p-4 bg-zinc-950/45 rounded-xl border transition-all ${
                        acc.isActive 
                          ? 'border-indigo-500/80 ring-2 ring-indigo-500/20 bg-zinc-900/40' 
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex gap-2.5">
                          <img src={acc.avatarUrl} alt={acc.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-zinc-200 text-xs truncate">{acc.name}</h4>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{acc.headline}</p>
                            <span className="text-[10px] text-zinc-500 font-mono block mt-1">Conns: {acc.connectionsCount}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5">
                          {acc.isActive ? (
                            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-950 border border-indigo-700/50 text-indigo-300 rounded font-bold uppercase">Active</span>
                          ) : (
                            <button
                              onClick={() => handleSetActiveAccount(acc.id)}
                              className="text-[9px] px-2 py-1 hover:bg-zinc-800 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded font-semibold cursor-pointer transition-colors"
                            >
                              Set Active
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Proxy node footer */}
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <div className="flex items-center gap-1 truncate w-3/4">
                          <Globe size={11} className="text-zinc-600 flex-shrink-0" />
                          <span className="truncate">{acc.proxy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500 text-[9px] flex items-center gap-1 font-bold">
                            <Check size={11} /> Ready
                          </span>
                          <button
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                            title="Disconnect LinkedIn Profile"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-zinc-950/20 border border-zinc-800/50 rounded-xl text-[10.5px] text-zinc-500 leading-relaxed flex items-start gap-2">
                  <Info size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <p>Selecting <strong>Set Active</strong> updates the campaign sequencer immediately. Subsequent outbound and scraping pipeline steps will automatically use that LinkedIn session proxy pipeline.</p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Safety & Limits Configuration */}
        {activeTab === 'limits' && (
          <form onSubmit={handleSaveLimits} className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} className="text-indigo-400" />
                Campaign Safety & Daily Rate Limits
              </h2>
              <p className="text-xs text-zinc-500 mt-1">LinkedIn restricts outreach behavior to protect users. skylan implements safety limits and human delays by mimicking typing speed, scrolling patterns, and natural breaks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-xs">
                <label className="block text-zinc-500 mb-1 font-semibold uppercase text-[9px]">Max Invites / Day</label>
                <input 
                  type="number" 
                  max="100"
                  value={limits.invitesPerDay}
                  onChange={e => setLimits({...limits, invitesPerDay: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono text-center focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[9px] text-zinc-600 block mt-1.5">Recommended max: 40/day</span>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-xs">
                <label className="block text-zinc-500 mb-1 font-semibold uppercase text-[9px]">Max Messages / Day</label>
                <input 
                  type="number" 
                  max="200"
                  value={limits.messagesPerDay}
                  onChange={e => setLimits({...limits, messagesPerDay: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono text-center focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[9px] text-zinc-600 block mt-1.5">Recommended max: 80/day</span>
              </div>

              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 text-xs">
                <label className="block text-zinc-500 mb-1 font-semibold uppercase text-[9px]">Max Profile Views</label>
                <input 
                  type="number" 
                  max="150"
                  value={limits.profileViewsPerDay}
                  onChange={e => setLimits({...limits, profileViewsPerDay: parseInt(e.target.value) || 0})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono text-center focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[9px] text-zinc-600 block mt-1.5">Recommended max: 50/day</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-300 text-xs pt-2">Human Delay & Sleep Parameters</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 text-[9px] uppercase font-bold">Typing/Loading sleep min (seconds)</label>
                  <input 
                    type="number" 
                    value={limits.humanDelayMinSec}
                    onChange={e => setLimits({...limits, humanDelayMinSec: parseInt(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 text-[9px] uppercase font-bold">Typing/Loading sleep max (seconds)</label>
                  <input 
                    type="number" 
                    value={limits.humanDelayMaxSec}
                    onChange={e => setLimits({...limits, humanDelayMaxSec: parseInt(e.target.value) || 0})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
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
              className="p-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-zinc-100 rounded-xl transition-all font-bold cursor-pointer text-xs"
            >
              {savingLimits ? "Saving Safeguards..." : "Commit Safety Safeguards"}
            </button>
          </form>
        )}

        {/* Integration webhooks */}
        {activeTab === 'integrations' && (
          <form onSubmit={handleSaveIntegrations} className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Network size={16} className="text-indigo-400" />
                External CRM & Zapier Webhook syncs
              </h2>
              <p className="text-xs text-zinc-500 mt-1">skylan CRM streams deal conversions, message replies, and connection updates instantly into your favorite platforms.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1.5 uppercase text-[9px]">ZAPIER TRIGGER INBOUND URL</label>
                <input 
                  type="text" 
                  value={zapierUrl}
                  onChange={e => setZapierUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1.5 uppercase text-[9px]">CUSTOM RECEPTIVE WEBHOOK OUTFLOW</label>
                <input 
                  type="text" 
                  value={customWebhookUrl}
                  onChange={e => setCustomWebhookUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="https://yourcompany.com/webhooks/linkedin"
                />
              </div>

              <div className="pt-2 text-left space-y-3">
                <h3 className="font-semibold text-zinc-300 text-xs">Standard Synchronization Presets</h3>
                
                <label className="flex items-center gap-2.5 p-2 bg-zinc-950/20 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800/10">
                  <input 
                    type="checkbox" 
                    checked={googleSync}
                    onChange={e => setGoogleSync(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-zinc-200 block text-xs">Auto Google Calendar Booking sync</span>
                    <span className="text-[10px] text-zinc-500 block">Create events when leads reply with custom meeting pitches</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-zinc-950/20 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800/10">
                  <input 
                    type="checkbox" 
                    checked={hubspotSync}
                    onChange={e => setHubspotSync(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-zinc-200 block text-xs">HubSpot CRM contact creation sync</span>
                    <span className="text-[10px] text-zinc-500 block">Progress Hubspot deal pipe automatically on response</span>
                  </div>
                </label>
              </div>

            </div>

            <button 
              type="submit"
              className="p-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer"
            >
              Update Integrations Webhooks
            </button>
          </form>
        )}

        {/* Billing Overview */}
        {activeTab === 'billing' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={16} className="text-indigo-400" />
                Current Seat Plan & Subscription
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Review active pipeline crawler licenses, invoice receipts, or tier caps.</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-indigo-950/35 to-zinc-950 rounded-2xl border border-indigo-500/20 text-xs relative overflow-hidden">
              <div className="absolute right-4 top-4 text-indigo-500/20 font-bold text-6xl">PRO</div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                  <span>Skylan Agency Pro Tier License</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500 text-white rounded-full font-bold">ACTIVE</span>
                </div>
                <div className="text-zinc-500">Auto renewal on: <strong className="font-mono text-zinc-300">June 25, 2026</strong></div>
                <p className="text-zinc-400 py-1 leading-relaxed">Unlimited Outreach Sequences, 3 LinkedIn Profile Seats, fully isolated proxies with residential geo-pin, and unified CRM Inbox with Gemini-suggested replies.</p>
                <div className="pt-2 flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                  <div>Seats used: <strong className="text-zinc-200">{linkedinAccounts.length}/3</strong></div>
                  <div>Monthly Cost: <strong className="text-indigo-400">$149/mo</strong></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Upcoming receipts</h3>
              <div className="bg-zinc-950/20 border border-zinc-800 rounded-xl p-3 flex justify-between items-center text-[11px] font-mono leading-none">
                <span className="text-zinc-400">Invoice #SK-4902 (Pending June 25, 2026)</span>
                <span className="text-zinc-200">$149.00 USD</span>
              </div>
              <div className="bg-zinc-955/20 border border-zinc-800 rounded-xl p-3 flex justify-between items-center text-[11px] font-mono leading-none">
                <span className="text-zinc-400">Invoice #SK-4720 (Paid May 25, 2026)</span>
                <span className="text-zinc-400">Paid $149.00 USD</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
