import React from 'react';
import { 
  Building2, 
  Linkedin, 
  Mail, 
  MapPin, 
  Clock, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  ArrowUpRight,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Zap,
  Network,
  Users,
  Inbox,
  LayoutDashboard,
  Settings,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Loader2,
  Sparkles,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Target, // imported for sidebar Contacts CRM
  SlidersHorizontal, // imported for sidebar Safety Settings
  Share2 // imported for sidebar Integrations
} from 'lucide-react';

// Panels
import LandingPage from './components/LandingPage';
import OnboardingGate from './components/OnboardingGate';
import DashboardStats from './components/DashboardStats';
import CampaignsPanel from './components/CampaignsPanel';
import LeadsPanel from './components/LeadsPanel';
import TeamsPanel from './components/TeamsPanel';
import InboxPanel from './components/InboxPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import SettingsPanel from './components/SettingsPanel';
import IntegrationsPanel from './components/IntegrationsPanel';
import BillingPanel from './components/BillingPanel';

// Types and Mock Data
import { Lead, Campaign, CampaignStep, LinkedInAccount, ChatMessage, TeamMember, IntegrationSettings } from './types';
import { 
  initialCampaigns, 
  initialLeads, 
  initialLinkedInAccount, 
  initialChatMessages, 
  initialTeamMembers, 
  initialIntegrations 
} from './data';

export default function App() {
  const [showLanding, setShowLanding] = React.useState(() => {
    try {
      return localStorage.getItem("skylan_onboarding_completed") !== "true";
    } catch (e) {
      return true;
    }
  });
  const [isOnboarding, setIsOnboarding] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');

  // React Global State corresponding to loaded items
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [linkedinAccount, setLinkedinAccount] = React.useState<LinkedInAccount>(initialLinkedInAccount);
  const [linkedinAccounts, setLinkedinAccounts] = React.useState<LinkedInAccount[]>([]);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [integrations, setIntegrations] = React.useState<IntegrationSettings>(initialIntegrations);
  const [isLoading, setIsLoading] = React.useState(true);

  // Automation logs and active execution metrics polling
  const [automationQueueStats, setAutomationQueueStats] = React.useState<any>(null);
  
  // Quick channel/inbox routing help
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);

  // Helper to save current progress to our Node persistent backend
  const saveToDB = (updates: {
    accounts?: LinkedInAccount[];
    campaigns?: Campaign[];
    leads?: Lead[];
    chatMessages?: ChatMessage[];
    teamMembers?: TeamMember[];
    integrations?: IntegrationSettings;
  }) => {
    // Write instantly to localStorage cache to bypass stateless edge isolates
    try {
      const existingDbRaw = localStorage.getItem("skylan_local_db");
      const existingDb = existingDbRaw ? JSON.parse(existingDbRaw) : {};
      const nextDb = { ...existingDb, ...updates };
      localStorage.setItem("skylan_local_db", JSON.stringify(nextDb));
    } catch (e) {
      console.warn("Storage write backup deferred:", e);
    }

    fetch("/api/db/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    }).catch(err => console.error("Could not sync state to server db:", err));
  };

  // Intercept universal same-origin redirect callback to relay success cross-domain
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("linkedin_oauth_success");
    const name = urlParams.get("name") || "LinkedIn User";
    
    if (success === "true") {
      console.info("Detected LinkedIn OAuth success sweep from URL parameters:", name);
      
      // Store in localStorage immediately so parent can pick it up via storage events/polling
      try {
        localStorage.setItem("skylan_pending_oauth_name", name);
      } catch (e) {
        console.error("Failed to write pending OAuth name to localStorage:", e);
      }
      
      // If we are running inside the popup that was redirected back to parentOrigin
      if (window.opener) {
        try {
          window.opener.postMessage({ type: 'LINKEDIN_OAUTH_SUCCESS', name }, '*');
        } catch (e) {
          console.warn("Failed to communicate with opener from same-origin popup:", e);
        }
      }
      
      // Close the popup window/tab automatically
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {}
      }, 500);
      
      // Clean up the URL query parameters so the Address Bar stays pristine
      const url = new URL(window.location.href);
      url.searchParams.delete("linkedin_oauth_success");
      url.searchParams.delete("name");
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }, []);

  // 1. Load entire database state on first bootstrap mount
  React.useEffect(() => {
    const loadInitDB = () => {
      // Prioritize local state restore instantly:
      const cachedDbRaw = localStorage.getItem("skylan_local_db");
      if (cachedDbRaw) {
        try {
          const db = JSON.parse(cachedDbRaw);
          if (db.campaigns) setCampaigns(db.campaigns);
          if (db.leads) setLeads(db.leads);
          if (db.chatMessages) setChatMessages(db.chatMessages);
          if (db.teamMembers) setTeamMembers(db.teamMembers);
          if (db.integrations) setIntegrations(db.integrations);
          if (db.accounts) {
            setLinkedinAccounts(db.accounts);
            const active = db.accounts.find((a: any) => a.isActive) || db.accounts[0];
            if (active) {
              setLinkedinAccount(active);
            }
          }
          if (localStorage.getItem("skylan_onboarding_completed") === "true") {
            setShowLanding(false);
            setIsOnboarding(false);
          }
          setIsLoading(false);
        } catch (e) {
          console.warn("Could not restore cached DB snapshot:", e);
        }
      }

      fetch("/api/db/get")
        .then(res => res.json())
        .then(db => {
          if (db) {
            // Merge with local state to ensure no loss of connected profiles
            const latestCached = localStorage.getItem("skylan_local_db");
            const cached = latestCached ? JSON.parse(latestCached) : {};
            const mergedDb = { ...cached, ...db };
            localStorage.setItem("skylan_local_db", JSON.stringify(mergedDb));

            if (mergedDb.campaigns) setCampaigns(mergedDb.campaigns);
            if (mergedDb.leads) setLeads(mergedDb.leads);
            if (mergedDb.chatMessages) setChatMessages(mergedDb.chatMessages);
            if (mergedDb.teamMembers) setTeamMembers(mergedDb.teamMembers);
            if (mergedDb.integrations) setIntegrations(mergedDb.integrations);
            if (mergedDb.accounts) {
              setLinkedinAccounts(mergedDb.accounts);
              const active = mergedDb.accounts.find((a: any) => a.isActive) || mergedDb.accounts[0];
              if (active) {
                setLinkedinAccount(active);
              }
            }
          }
          if (localStorage.getItem("skylan_onboarding_completed") === "true") {
            setShowLanding(false);
            setIsOnboarding(false);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch persistent db snapshot:", err);
          setIsLoading(false);
        });
    };
    loadInitDB();
  }, []);

  // 2. Poll changes periodically (e.g. background automation logs and stage progressions)
  React.useEffect(() => {
    const pollDatabaseUpdates = () => {
      fetch("/api/db/get")
        .then(res => res.json())
        .then(db => {
          if (db) {
            // Prevent server recycling default "Alex Mercer" from wiping user-onboarded profile
            const clientDbRaw = localStorage.getItem("skylan_local_db");
            if (clientDbRaw) {
              const clientDb = JSON.parse(clientDbRaw);
              const customAccount = clientDb.accounts?.find((a: any) => a.id.startsWith("acc-oauth-") || a.id.startsWith("acc-fresh-") || a.id.startsWith("acc-demo-"));
              const serverHasCustomAccount = db.accounts?.some((a: any) => a.id.startsWith("acc-oauth-") || a.id.startsWith("acc-fresh-") || a.id.startsWith("acc-demo-"));
              
              if (customAccount && !serverHasCustomAccount) {
                console.info("Re-syncing client database to recycled worker isolate...");
                fetch("/api/db/save", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(clientDb)
                }).catch(err => console.error("Could not sync state to server db:", err));
                return;
              }
            }

            localStorage.setItem("skylan_local_db", JSON.stringify(db));

            if (db.campaigns) setCampaigns(db.campaigns);
            if (db.leads) setLeads(db.leads);
            if (db.chatMessages) setChatMessages(db.chatMessages);
            if (db.teamMembers) setTeamMembers(db.teamMembers);
            if (db.integrations) setIntegrations(db.integrations);
            if (db.accounts) {
              setLinkedinAccounts(db.accounts);
              const active = db.accounts.find((a: any) => a.isActive) || db.accounts[0];
              if (active) {
                setLinkedinAccount(active);
              }
            }
          }
        })
        .catch(err => {
          if (err && (err.message === "Failed to fetch" || err.name === "TypeError")) {
            console.warn("Retrying background snapshot sync with Skylan node...");
          } else {
            console.error("Poll database sync error:", err);
          }
        });
    };

    const dbInterval = setInterval(pollDatabaseUpdates, 15000); // refresh full DB state from backend every 15 seconds
    return () => clearInterval(dbInterval);
  }, [linkedinAccounts, linkedinAccount]);

  // Poll automation logs from Node Express server
  React.useEffect(() => {
    const fetchQueueStats = () => {
      fetch("/api/automation/queue")
        .then(res => res.json())
        .then(data => {
          setAutomationQueueStats(data);
        })
        .catch(err => {
          if (err && (err.message === "Failed to fetch" || err.name === "TypeError")) {
            // Quietly retry on server hot-reload connection drop
          } else {
            console.error("Could not poll automated proxy crawler logs queue:", err);
          }
        });
    };

    fetchQueueStats();
    const interval = setInterval(fetchQueueStats, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // CRM Actions
  const handleAddLead = (newLeadData: Omit<Lead, 'id' | 'activities' | 'lastInteractionAt'>) => {
    const newLd: Lead = {
      ...newLeadData,
      id: `lead-fresh-${Date.now()}`,
      lastInteractionAt: new Date().toISOString(),
      activities: [
        { id: `act-${Date.now()}-1`, type: "import", timestamp: new Date().toISOString(), description: `Lead created manually under sequence: ${newLeadData.campaignName}` }
      ]
    };
    const nextLeads = [newLd, ...leads];
    setLeads(nextLeads);
    
    // Increment leads count for that campaign sequence
    const nextCampaigns = campaigns.map(c => {
      if (c.id === newLeadData.campaignId) {
        return { ...c, leadsCount: c.leadsCount + 1 };
      }
      return c;
    });
    setCampaigns(nextCampaigns);
    saveToDB({ leads: nextLeads, campaigns: nextCampaigns });
  };

  const handleUpdateLeadStage = (leadId: string, stage: Lead['stage']) => {
    const nextLeads = leads.map(l => {
      if (l.id === leadId) {
        const addedActivity = {
          id: `act-stage-${Date.now()}`,
          type: "note_added" as any,
          timestamp: new Date().toISOString(),
          description: `Pipeline stage updated: ${l.stage.toUpperCase()} -> ${stage.toUpperCase()}`
        };
        return {
          ...l,
          stage,
          activities: [addedActivity, ...l.activities],
          lastInteractionAt: new Date().toISOString()
        };
      }
      return l;
    });
    setLeads(nextLeads);
    saveToDB({ leads: nextLeads });
  };

  const handleAddNoteToLead = (leadId: string, noteText: string) => {
    const nextLeads = leads.map(l => {
      if (l.id === leadId) {
        const addedActivity = {
          id: `act-note-${Date.now()}`,
          type: "note_added" as any,
          timestamp: new Date().toISOString(),
          description: `CRM Pipeline Note Saved: "${noteText}"`
        };
        return {
          ...l,
          notes: noteText,
          activities: [addedActivity, ...l.activities],
          lastInteractionAt: new Date().toISOString()
        };
      }
      return l;
    });
    setLeads(nextLeads);
    saveToDB({ leads: nextLeads });
  };

  const handleSendMessage = (leadId: string, text: string, channel: 'linkedin' | 'email') => {
    const freshMsg: ChatMessage = {
      id: `msg-user-fresh-${Date.now()}`,
      leadId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      channel,
      read: true
    };
    const nextMsgs = [...chatMessages, freshMsg];
    setChatMessages(nextMsgs);

    // Push automatic update in lead's history log
    const nextLeads = leads.map(l => {
      if (l.id === leadId) {
        const addedActivity = {
          id: `act-outmsg-${Date.now()}`,
          type: channel === 'linkedin' ? "message_sent" : "email_sent" as any,
          timestamp: new Date().toISOString(),
          description: `Dispatched manual ${channel.toUpperCase()}: "${text.substring(0, 45)}..."`
        };
        return {
          ...l,
          lastInteractionAt: new Date().toISOString(),
          activities: [addedActivity, ...l.activities]
        };
      }
      return l;
    });
    setLeads(nextLeads);
    saveToDB({ chatMessages: nextMsgs, leads: nextLeads });
  };

  // Campaigns sequences actions
  const handleCreateCampaign = (name: string, steps: CampaignStep[]) => {
    const FreshC: Campaign = {
      id: `camp-fresh-${Date.now()}`,
      name,
      status: 'active',
      steps,
      leadsCount: 0,
      acceptanceRate: 0,
      replyRate: 0,
      conversionRate: 0,
      stats: {
        invitesSent: 0,
        invitesAccepted: 0,
        messagesSent: 0,
        repliesReceived: 0,
        emailsSent: 0,
        profilesViewed: 0
      },
      createdAt: new Date().toISOString().split('T')[0]
    };
    const nextCampaigns = [FreshC, ...campaigns];
    setCampaigns(nextCampaigns);
    saveToDB({ campaigns: nextCampaigns });
  };

  const handleUpdateCampaignStatus = (campaignId: string, status: Campaign['status']) => {
    const nextCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, status };
      }
      return c;
    });
    setCampaigns(nextCampaigns);
    saveToDB({ campaigns: nextCampaigns });
  };

  const handleUpdateSteps = (campaignId: string, steps: CampaignStep[]) => {
    const nextCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, steps };
      }
      return c;
    });
    setCampaigns(nextCampaigns);
    saveToDB({ campaigns: nextCampaigns });
  };

  const handleUpdateLinkedInAccount = (updates: Partial<LinkedInAccount>) => {
    const updatedAccount = { ...linkedinAccount, ...updates };
    setLinkedinAccount(updatedAccount);

    const updatedList = linkedinAccounts.map(a => a.id === linkedinAccount.id ? updatedAccount : a);
    setLinkedinAccounts(updatedList);
    saveToDB({ accounts: updatedList });
  };

  const handleUpdateAccounts = (nextAccounts: LinkedInAccount[]) => {
    setLinkedinAccounts(nextAccounts);
    const active = nextAccounts.find(a => a.isActive);
    if (active) {
      setLinkedinAccount(active);
    }
    saveToDB({ accounts: nextAccounts });
  };

  const handleUpdateIntegrations = (updates: Partial<IntegrationSettings>) => {
    const nextIntegrations = { ...integrations, ...updates };
    setIntegrations(nextIntegrations);
    saveToDB({ integrations: nextIntegrations });
  };

  const handleSelectLeadChat = (leadId: string) => {
    setSelectedLeadId(leadId);
    setActiveTab('inbox');
  };

  // Team Collaboration Actions
  const handleInviteMember = (name: string, email: string, role: TeamMember['role']) => {
    const FreshTeam: TeamMember = {
      id: `team-seat-fresh-${Date.now()}`,
      name,
      email,
      role,
      status: 'invited',
      joinedAt: new Date().toISOString().split('T')[0]
    };
    const nextTeam = [...teamMembers, FreshTeam];
    setTeamMembers(nextTeam);
    saveToDB({ teamMembers: nextTeam });
  };

  const handleRemoveMember = (id: string) => {
    const nextTeam = teamMembers.filter(t => t.id !== id);
    setTeamMembers(nextTeam);
    saveToDB({ teamMembers: nextTeam });
  };

  const handleUpdateRole = (id: string, role: TeamMember['role']) => {
    const nextTeam = teamMembers.map(t => t.id === id ? { ...t, role } : t);
    setTeamMembers(nextTeam);
    saveToDB({ teamMembers: nextTeam });
  };

  if (showLanding) {
    return (
      <LandingPage 
        onEnterApp={() => {
          const isCompleted = localStorage.getItem("skylan_onboarding_completed") === "true";
          setShowLanding(false);
          setIsOnboarding(!isCompleted);
        }} 
      />
    );
  }

  if (isOnboarding) {
    return (
      <OnboardingGate 
        onCompleted={(ownerName) => {
          localStorage.setItem("skylan_onboarding_completed", "true");
          setIsOnboarding(false);
          
          // Restore from cached localStorage first for instantaneous transition!
          const cachedDbRaw = localStorage.getItem("skylan_local_db");
          if (cachedDbRaw) {
            try {
              const db = JSON.parse(cachedDbRaw);
              if (db.campaigns) setCampaigns(db.campaigns);
              if (db.leads) setLeads(db.leads);
              if (db.chatMessages) setChatMessages(db.chatMessages);
              if (db.teamMembers) setTeamMembers(db.teamMembers);
              if (db.integrations) setIntegrations(db.integrations);
              if (db.accounts) {
                setLinkedinAccounts(db.accounts);
                const active = db.accounts.find((a: any) => a.isActive) || db.accounts[0];
                if (active) {
                  setLinkedinAccount(active);
                }
              }
            } catch (e) {
              console.error("Failed to parse cached local db during transition:", e);
            }
          }

          setIsLoading(true);
          // Refetch database state directly so we immediately transition with the generated custom industry dataset!
          fetch("/api/db/get")
            .then(res => res.json())
            .then(db => {
              if (db) {
                const latestCached = localStorage.getItem("skylan_local_db");
                if (latestCached) {
                  const cached = JSON.parse(latestCached);
                  const customAccount = cached.accounts?.find((a: any) => a.id.startsWith("acc-oauth-") || a.id.startsWith("acc-fresh-") || a.id.startsWith("acc-demo-"));
                  const serverHasCustomAccount = db.accounts?.some((a: any) => a.id.startsWith("acc-oauth-") || a.id.startsWith("acc-fresh-") || a.id.startsWith("acc-demo-"));
                  
                  if (customAccount && !serverHasCustomAccount) {
                    console.info("Onboarding fetch server re-syncing local copy...");
                    fetch("/api/db/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: latestCached
                    }).catch(err => console.error("Could not sync state to server db:", err));

                    if (cached.campaigns) setCampaigns(cached.campaigns);
                    if (cached.leads) setLeads(cached.leads);
                    if (cached.chatMessages) setChatMessages(cached.chatMessages);
                    if (cached.teamMembers) setTeamMembers(cached.teamMembers);
                    if (cached.integrations) setIntegrations(cached.integrations);
                    if (cached.accounts) {
                      setLinkedinAccounts(cached.accounts);
                      const active = cached.accounts.find((a: any) => a.isActive) || cached.accounts[0];
                      if (active) {
                        setLinkedinAccount(active);
                      }
                    }
                    setIsLoading(false);
                    return;
                  }
                }

                if (db.campaigns) setCampaigns(db.campaigns);
                if (db.leads) setLeads(db.leads);
                if (db.chatMessages) setChatMessages(db.chatMessages);
                if (db.teamMembers) setTeamMembers(db.teamMembers);
                if (db.integrations) setIntegrations(db.integrations);
                if (db.accounts) {
                  setLinkedinAccounts(db.accounts);
                  const active = db.accounts.find((a: any) => a.isActive) || db.accounts[0];
                  if (active) {
                    setLinkedinAccount(active);
                  }
                }
              }
              setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
        }}
      />
    );
  }

  // Active Menu tabs definition to render inside dashboard body context
  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Network },
    { id: 'inbox', label: 'Unified Inbox', icon: Inbox },
    { id: 'leads', label: 'Contacts CRM', icon: Target },
    { id: 'teams', label: 'Teams Seat', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Safety Settings', icon: SlidersHorizontal },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'billing', label: 'Billing Plans', icon: CreditCard }
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans flex flex-col md:flex-row" id="app-root-container">
      
      {/* 1. LEFT SIDE NAVIGATION MENU CONTAINER */}
      <aside className="w-full md:w-64 bg-zinc-900/60 border-r border-zinc-900 p-4 flex flex-col justify-between backdrop-blur-md">
        
        <div className="space-y-6 text-left">
          {/* Brand/logo block */}
          <div className="flex items-center gap-2 px-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm text-zinc-100 shadow-md">
              S
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-tight text-zinc-200">
                skylan <span className="text-zinc-500 font-medium text-[10px]">CRM v1.0</span>
              </span>
            </div>
          </div>

          {/* Core navigation links */}
          <nav className="space-y-1 text-xs">
            {sidebarLinks.map((link) => {
              const IconComp = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => { setActiveTab(link.id); setSelectedLeadId(null); }}
                  className={`w-full p-2.5 px-3.5 rounded-xl cursor-pointer font-semibold transition-all flex items-center gap-2.5 ${activeTab === link.id ? 'bg-indigo-600 text-zinc-100 shadow-lg shadow-indigo-600/10' : 'text-zinc-500 hover:bg-zinc-800/20 hover:text-zinc-300'}`}
                >
                  <IconComp size={15} />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspace Quick Metadata indicators */}
        <div className="pt-6 border-t border-zinc-800/80 text-left space-y-4">
          <div className="space-y-2 text-[10.5px]">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="font-bold block text-[9.5px]">Connected Account:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 block" title="Active worker connection verified." />
            </div>
            <div className="flex items-center gap-2">
              <img src={linkedinAccount.avatarUrl} alt={linkedinAccount.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold text-zinc-300 block truncate">{linkedinAccount.name}</span>
                <span className="text-[9px] text-zinc-500 block truncate">104.244.72.109 (Proxy)</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              localStorage.removeItem("skylan_onboarding_completed");
              localStorage.removeItem("skylan_local_db");
              setShowLanding(true);
            }}
            className="w-full p-1.5 px-3 hover:bg-zinc-800/10 hover:text-red-400 text-zinc-500 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <LogOut size={13} />
            Show Landing page
          </button>
        </div>

      </aside>

      {/* 2. MAIN ACTIVE CANVAS WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        
        {/* Top Sticky Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/45 p-4 border-b border-zinc-900/60 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">LINKEDIN OUTREACH CO-PILOT</span>
            <h1 className="text-base font-extrabold text-zinc-100 tracking-tight uppercase">
              {sidebarLinks.find(l => l.id === activeTab)?.label || 'Workspace'}
            </h1>
          </div>

          {/* Quick Help Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 p-1 px-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-[10px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-zinc-400">Playwright Worker State</span>
            </div>
          </div>
        </header>

        {/* Core dynamic content body context */}
        <section className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardStats 
              campaigns={campaigns} 
              leads={leads} 
              sessionStats={automationQueueStats} 
              linkedinAccount={linkedinAccount}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsPanel 
              campaigns={campaigns}
              onCreateCampaign={handleCreateCampaign}
              onUpdateCampaignStatus={handleUpdateCampaignStatus}
              onUpdateSteps={handleUpdateSteps}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsPanel 
              leads={leads}
              campaigns={campaigns.map(c => ({ id: c.id, name: c.name }))}
              chatMessages={chatMessages}
              onAddLead={handleAddLead}
              onUpdateLeadStage={handleUpdateLeadStage}
              onAddNote={handleAddNoteToLead}
              onSelectLeadChat={handleSelectLeadChat}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxPanel 
              leads={leads}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              selectedLeadId={selectedLeadId}
              onClearSelectedLeadId={() => setSelectedLeadId(null)}
            />
          )}

          {activeTab === 'teams' && (
            <TeamsPanel 
              teamMembers={teamMembers}
              onInviteMember={handleInviteMember}
              onRemoveMember={handleRemoveMember}
              onUpdateRole={handleUpdateRole}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPanel 
              campaigns={campaigns}
              leads={leads}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel 
              linkedinAccount={linkedinAccount}
              linkedinAccounts={linkedinAccounts}
              integrationSettings={integrations}
              onUpdateLinkedInAccount={handleUpdateLinkedInAccount}
              onUpdateIntegrations={handleUpdateIntegrations}
              onUpdateAccounts={handleUpdateAccounts}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsPanel />
          )}

          {activeTab === 'billing' && (
            <BillingPanel />
          )}
        </section>

      </main>

    </div>
  );
}
