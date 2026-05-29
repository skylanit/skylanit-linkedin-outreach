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
  Zap
} from 'lucide-react';
import { Campaign, Lead, LinkedInAccount } from '../types';

interface DashboardStatsProps {
  campaigns: Campaign[];
  leads: Lead[];
  sessionStats: any;
  linkedinAccount: LinkedInAccount;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardStats({
  campaigns,
  leads,
  sessionStats,
  linkedinAccount,
  onNavigateToTab
}: DashboardStatsProps) {
  // Aggregate campaign stats
  const totalInvitesSent = campaigns.reduce((acc, c) => acc + c.stats.invitesSent, 0);
  const totalInvitesAccepted = campaigns.reduce((acc, c) => acc + c.stats.invitesAccepted, 0);
  const totalMessagesSent = campaigns.reduce((acc, c) => acc + c.stats.messagesSent, 0);
  const totalReplies = campaigns.reduce((acc, c) => acc + c.stats.repliesReceived, 0);
  const totalProfilesScraped = campaigns.reduce((acc, c) => acc + c.stats.profilesViewed, 0);
  const totalEmailsSent = campaigns.reduce((acc, c) => acc + c.stats.emailsSent, 0);

  const averageAcceptanceRate = Math.round(
    campaigns.reduce((acc, c) => acc + c.acceptanceRate, 0) / (campaigns.length || 1)
  );

  const statsCards = [
    { label: 'Invites Dispatched', count: totalInvitesSent, delta: '+24%', state: 'up', color: 'text-indigo-400' },
    { label: 'Follow-ups Sent', count: totalMessagesSent, delta: '+12%', state: 'up', color: 'text-zinc-200' },
    { label: 'Unified Replies', count: totalReplies, delta: '+8%', state: 'up', color: 'text-emerald-400' },
    { label: 'Profiles Scraped', count: totalProfilesScraped, delta: '+18%', state: 'up', color: 'text-amber-400' }
  ];

  return (
    <div className="space-y-6" id="dashboard-stats-panel">
      
      {/* LinkedIn Profile Active Sync Tracker Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md text-left">
        <div className="flex items-center gap-3">
          <img src={linkedinAccount.avatarUrl} alt={linkedinAccount.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500" />
          <div>
            <div className="flex items-center gap-1.5 font-bold text-zinc-100 text-sm">
              {linkedinAccount.name}
              <span className="text-[10px] bg-emerald-950/60 ring-1 ring-emerald-800 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                Active Sync OK
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 pr-4">{linkedinAccount.headline}</p>
          </div>
        </div>

        {/* Sync Proxy Metrics */}
        <div className="flex flex-wrap items-center gap-6 text-[10.5px]">
          <div>
            <span className="text-zinc-500 block uppercase font-bold text-[9px]">Proxy IP Anchor</span>
            <span className="font-semibold text-zinc-300 font-mono">104.244.72.109:8800 (US)</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase font-bold text-[9px]">Downtime Check</span>
            <span className="font-semibold text-emerald-400">100.00%</span>
          </div>
          <div>
            <span className="text-zinc-500 block uppercase font-bold text-[9px]">Sleep Mode Intervals</span>
            <span className="font-semibold text-zinc-300">45s - 180s randomized</span>
          </div>
        </div>
      </div>

      {/* Main Grid Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl text-left flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{card.label}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-2xl font-black ${card.color}`}>{card.count}</span>
              <span className="text-[10.5px] text-emerald-400 flex items-center gap-0.5 font-bold">
                <TrendingUp size={11} />
                {card.delta}
              </span>
            </div>
            <span className="text-[9px] text-zinc-600 block mt-1.5">Last sync tick: 44 seconds ago</span>
          </div>
        ))}
      </div>

      {/* Campaign growth, active sequences and Playwright queue state double panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Campaigns sequence List list */}
        <div className="lg:col-span-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-left backdrop-blur-md flex flex-col gap-5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              Active Campaigns Performance Overview
            </h3>
            <button 
              onClick={() => onNavigateToTab('campaigns')}
              className="text-[10.5px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              Configure Sequences
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5">
            {campaigns.map((camp) => (
              <div 
                key={camp.id} 
                className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() => onNavigateToTab('campaigns')}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-zinc-200 text-xs">{camp.name}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-1 uppercase ${camp.status === 'active' ? 'bg-emerald-950 text-emerald-400 ring-emerald-800/40' : 'bg-zinc-800 text-zinc-400 ring-zinc-700/60'}`}>
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">First published: {new Date(camp.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Accepted rate</span>
                    <span className="font-extrabold text-xs text-indigo-400">{camp.acceptanceRate}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Replies</span>
                    <span className="font-extrabold text-xs text-emerald-400">{camp.replyRate}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Total leads</span>
                    <span className="font-extrabold text-xs text-zinc-200">{camp.leadsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Chromium Puppeteer Session execution queue */}
        <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-left backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" />
              Crawler Automation Worker Logs
            </h3>
            <span className="text-[9.5px] px-1.5 py-0.5 bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800 rounded font-semibold uppercase">ONLINE</span>
          </div>

          <div className="text-[11px] space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {sessionStats?.logs ? (
              sessionStats.logs.map((log: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-zinc-950/60 rounded border border-zinc-800/60 text-left font-mono">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold px-1 rounded ${log.level === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-900 text-zinc-400'}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-[8px] text-zinc-600">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 leading-relaxed">{log.message}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500">
                Warming up cloud selenium browsers...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
