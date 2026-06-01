import React from 'react';
import {
  Building2, Linkedin, Mail, MapPin, Clock, TrendingUp, MessageSquare,
  Users, Inbox, LayoutDashboard, Settings, CreditCard, LogOut, Loader2,
  Search, Target, Network, Zap
} from 'lucide-react';

// Panels
import OnboardingGate from './components/OnboardingGate';
import DashboardStats from './components/DashboardStats';
import CampaignsPanel from './components/CampaignsPanel';
import LeadsPanel from './components/LeadsPanel';
import TeamsPanel from './components/TeamsPanel';
import InboxPanel from './components/InboxPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import SettingsPanel from './components/SettingsPanel';

// Types
import { Lead, Campaign, CampaignStep, LinkedInAccount, ChatMessage, TeamMember, IntegrationSettings } from './types';
import { initialCampaigns, initialLeads, initialLinkedInAccount, initialChatMessages, initialTeamMembers, initialIntegrations } from './data';

export default function App() {
  const [isOnboarding, setIsOnboarding] = React.useState(() => 
    localStorage.getItem("skylan_onboarding_completed") !== "true"
  );
  
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'campaigns' | 'leads' | 'inbox' | 'teams' | 'analytics' | 'settings'>('dashboard');
  
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [integrations, setIntegrations] = React.useState<IntegrationSettings>(initialIntegrations);
  const [linkedinAccounts, setLinkedinAccounts] = React.useState<LinkedInAccount[]>([]);
  const [linkedinAccount, setLinkedinAccount] = React.useState<LinkedInAccount>(initialLinkedInAccount);

  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Load from localStorage + backend
  const refreshDatabase = async () => {
    try {
      const cached = localStorage.getItem("skylan_local_db");
      if (cached) {
        const db = JSON.parse(cached);
        if (db.campaigns) setCampaigns(db.campaigns);
        if (db.leads) setLeads(db.leads);
        if (db.chatMessages) setChatMessages(db.chatMessages);
        if (db.teamMembers) setTeamMembers(db.teamMembers);
        if (db.accounts) {
          setLinkedinAccounts(db.accounts);
          const active = db.accounts.find((a: any) => a.isActive) || db.accounts[0];
          if (active) setLinkedinAccount(active);
        }
      }
    } catch (e) {
      console.warn("Cache restore failed");
    }
  };

  React.useEffect(() => {
    refreshDatabase();
  }, []);

  const saveToDB = (updates: any) => {
    const current = JSON.parse(localStorage.getItem("skylan_local_db") || "{}");
    const next = { ...current, ...updates };
    localStorage.setItem("skylan_local_db", JSON.stringify(next));
    
    fetch("/api/db/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  // === SIMULATED AUTOMATION ACTIONS ===
  const importFromSearchUrl = async (searchUrl: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/linkedin/campaign-from-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchUrl, campaignName: "Search Import Campaign" })
      });
      
      const data = await res.json();
      
      if (data.leads) {
        setLeads(prev => [...data.leads, ...prev]);
        setCampaigns(prev => [...(data.campaign || []), ...prev]);
        alert(`✅ Imported ${data.leads.length} leads from LinkedIn Search!`);
      }
    } catch (err) {
      alert("Search import simulation completed (demo mode)");
      // Fallback demo leads
      const demoLeads = [...initialLeads].map(l => ({...l, id: `demo-${Date.now()}-${Math.random()}`}));
      setLeads(prev => [...demoLeads, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const runSequenceOnLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    alert(`🚀 Running full sequence for ${lead.name}... (Visit → Invite → Message → Follow-up)`);
    
    // Simulate progress
    setTimeout(() => {
      const updatedLeads = leads.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            stage: 'connected' as const,
            lastInteractionAt: new Date().toISOString(),
            activities: [
              { id: `act-${Date.now()}`, type: 'invite_sent', timestamp: new Date().toISOString(), description: 'Automated invite sent' },
              ...l.activities
            ]
          };
        }
        return l;
      });
      setLeads(updatedLeads);
      saveToDB({ leads: updatedLeads });
    }, 1200);
  };

  if (isOnboarding) {
    return (
      <OnboardingGate 
        onCompleted={(name) => {
          localStorage.setItem("skylan_onboarding_completed", "true");
          setIsOnboarding(false);
          refreshDatabase();
        }} 
      />
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-bold">S</div>
          <div className="font-bold text-xl">Skylan</div>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'campaigns', label: 'Campaigns', icon: Network },
            { id: 'leads', label: 'Leads CRM', icon: Target },
            { id: 'inbox', label: 'Inbox', icon: Inbox },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left ${activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800'}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="mt-auto flex items-center gap-2 text-red-400 hover:text-red-500 px-4 py-3"
        >
          <LogOut size={18} /> Disconnect
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'campaigns' && 'Campaigns'}
            {activeTab === 'leads' && 'Leads'}
            {activeTab === 'inbox' && 'Unified Inbox'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'settings' && 'Settings'}
          </h1>

          {activeTab === 'leads' && (
            <div className="flex gap-3">
              <input 
                type="text" 
                id="searchUrlInput"
                placeholder="Paste LinkedIn Search URL here..."
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 w-96 text-sm"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('searchUrlInput') as HTMLInputElement;
                  if (input?.value) importFromSearchUrl(input.value);
                }}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Search />} Import Leads
              </button>
            </div>
          )}
        </header>

        {/* Render Panels */}
        {activeTab === 'dashboard' && <DashboardStats campaigns={campaigns} leads={leads} linkedinAccount={linkedinAccount} />}
        {activeTab === 'campaigns' && <CampaignsPanel campaigns={campaigns} onRefreshDB={refreshDatabase} />}
        {activeTab === 'leads' && (
          <LeadsPanel 
            leads={leads} 
            campaigns={campaigns.map(c => ({id: c.id, name: c.name}))}
            onSelectLeadChat={(id) => { setSelectedLeadId(id); setActiveTab('inbox'); }}
            onRunSequence={runSequenceOnLead}
          />
        )}
        {activeTab === 'inbox' && <InboxPanel leads={leads} chatMessages={chatMessages} selectedLeadId={selectedLeadId} />}
        {activeTab === 'settings' && <SettingsPanel linkedinAccount={linkedinAccount} linkedinAccounts={linkedinAccounts} />}
      </main>
    </div>
  );
}
