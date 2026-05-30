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
  const [showLanding, setShowLanding] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');

  // React Global State corresponding to loaded items
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(initialCampaigns);
  const [leads, setLeads] = React.useState<Lead[]>(initialLeads);
  const [linkedinAccount, setLinkedinAccount] = React.useState<LinkedInAccount>(initialLinkedInAccount);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>(initialChatMessages);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(initialTeamMembers);
  const [integrations, setIntegrations] = React.useState<IntegrationSettings>(initialIntegrations);

  // Automation logs and active execution metrics polling
  const [automationQueueStats, setAutomationQueueStats] = React.useState<any>(null);
  
  // Quick channel/inbox routing help
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Poll the automated Playwright/Puppeteer simulated logs queue from Node Express server
    const fetchQueueStats = () => {
      fetch("/api/automation/queue")
        .then(res => res.json())
        .then(data => {
          setAutomationQueueStats(data);
        })
        .catch(err => {
          console.error("Could not poll automated proxy crawler logs queue:", err);
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
    setLeads([newLd, ...leads]);
    
    // Increment leads count for that campaign sequence
    setCampaigns(campaigns.map(c => {
      if (c.id === newLeadData.campaignId) {
        return { ...c, leadsCount: c.leadsCount + 1 };
      }
      return c;
    }));
  };

  const handleUpdateLeadStage = (leadId: string, stage: Lead['stage']) => {
    setLeads(leads.map(l => {
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
    }));
  };

  const handleAddNoteToLead = (leadId: string, noteText: string) => {
    setLeads(leads.map(l => {
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
    }));
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
    setChatMessages([...chatMessages, freshMsg]);

    // Push automatic update in lead's history log
    setLeads(leads.map(l => {
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
    }));
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
    setCampaigns([FreshC, ...campaigns]);
  };

  const handleUpdateCampaignStatus = (campaignId: string, status: Campaign['status']) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, status };
      }
      return c;
    }));
  };

  const handleUpdateSteps = (campaignId: string, steps: CampaignStep[]) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, steps };
      }
      return c;
    }));
  };

  const handleUpdateLinkedInAccount = (updates: Partial<LinkedInAccount>) => {
    setLinkedinAccount({ ...linkedinAccount, ...updates });
  };

  const handleUpdateIntegrations = (updates: Partial<IntegrationSettings>) => {
    setIntegrations({ ...integrations, ...updates });
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
    setTeamMembers([...teamMembers, FreshTeam]);
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(t => t.id !== id));
  };

  const handleUpdateRole = (id: string, role: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(t => t.id === id ? { ...t, role } : t));
  };

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
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
            onClick={() => setShowLanding(true)}
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
              integrationSettings={integrations}
              onUpdateLinkedInAccount={handleUpdateLinkedInAccount}
              onUpdateIntegrations={handleUpdateIntegrations}
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
