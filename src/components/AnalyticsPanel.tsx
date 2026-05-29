import React from 'react';
import { 
  BarChart, 
  TrendingUp, 
  MessageSquare, 
  UserCheck, 
  ArrowUpRight, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Briefcase 
} from 'lucide-react';
import { Campaign, Lead } from '../types';

interface AnalyticsPanelProps {
  campaigns: Campaign[];
  leads: Lead[];
}

export default function AnalyticsPanel({ campaigns, leads }: AnalyticsPanelProps) {
  // Compute aggregated stats
  const totalLeads = leads.length;
  const activeSequences = campaigns.filter(c => c.status === 'active').length;
  
  const totalInvitesSent = campaigns.reduce((acc, c) => acc + c.stats.invitesSent, 0);
  const totalInvitesAccepted = campaigns.reduce((acc, c) => acc + c.stats.invitesAccepted, 0);
  const totalReplies = campaigns.reduce((acc, c) => acc + c.stats.repliesReceived, 0);
  const totalProfilesScraped = campaigns.reduce((acc, c) => acc + c.stats.profilesViewed, 0);
  const totalEmailsSent = campaigns.reduce((acc, c) => acc + c.stats.emailsSent, 0);

  const averageAcceptanceRate = Math.round(
    campaigns.reduce((acc, c) => acc + c.acceptanceRate, 0) / (campaigns.length || 1)
  );

  const averageReplyRate = Math.round(
    campaigns.reduce((acc, c) => acc + c.replyRate, 0) / (campaigns.length || 1)
  );

  return (
    <div className="space-y-6" id="analytics-panel">
      
      {/* Top micro performance grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl text-left">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Profiles Scraped</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-zinc-100">{totalProfilesScraped}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-bold">
              <TrendingUp size={11} />
              +14%
            </span>
          </div>
          <span className="text-[9px] text-zinc-600 block mt-1">Average 50 profile pings/day</span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl text-left">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Invites Dispatched</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-indigo-400">{totalInvitesSent}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-bold">
              <TrendingUp size={11} />
              +28%
            </span>
          </div>
          <span className="text-[9px] text-zinc-600 block mt-1">{totalInvitesAccepted} accepted successfully</span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl text-left">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Unified Replies</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-400">{totalReplies}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-bold">
              <TrendingUp size={11} />
              +8%
            </span>
          </div>
          <span className="text-[9px] text-zinc-600 block mt-1">Avg response delay: 14 mins</span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl text-left">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Emails Dispatched</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-zinc-100">{totalEmailsSent}</span>
            <span className="text-[10px] text-amber-500 flex items-center gap-0.5 font-bold">
              <TrendingDown size={11} />
              -2%
            </span>
          </div>
          <span className="text-[9px] text-zinc-600 block mt-1">Wait drip delays apply</span>
        </div>
      </div>

      {/* Main double column graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Conversions Rates and Drip Funnel breakdown */}
        <div className="lg:col-span-7 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-left backdrop-blur-md flex flex-col gap-6">
          <h3 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800">
            <TrendingUp size={15} className="text-indigo-400" />
            LinkedIn Pipeline Outreach Funnel Analytics
          </h3>

          <div className="space-y-4">
            {/* Step 1 Profile Visits */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400 font-medium">1. Automated Profile Visits Simulated</span>
                <span className="font-bold text-zinc-200">{totalProfilesScraped} leads (100%)</span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2 Invites sent */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400 font-medium">2. Connection Invites Sent & Checked</span>
                <span className="font-bold text-zinc-200">{totalInvitesSent} leads ({Math.round(totalInvitesSent/totalProfilesScraped * 100)}%)</span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.round(totalInvitesSent/totalProfilesScraped * 100)}%` }} />
              </div>
            </div>

            {/* Step 3 Connected and Accepted */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400 font-medium">3. Connection Invites Accepted (Acceptance Rate)</span>
                <span className="font-bold text-emerald-400">{totalInvitesAccepted} connections ({averageAcceptanceRate}%)</span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${averageAcceptanceRate}%` }} />
              </div>
            </div>

            {/* Step 4 Replied */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-400 font-medium">4. Drip Follow-ups Replied (Interest Harvested)</span>
                <span className="font-bold text-amber-500">{totalReplies} prospects ({averageReplyRate}%)</span>
              </div>
              <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${averageReplyRate}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed italic">
            <strong>Growth Analyst Note:</strong> Your average reply rate increased by 8% this week, heavily driven by the new Gemini AI optimized follow-up templates integrated on Step 4.
          </div>
        </div>

        {/* Right Column: Campaign Sequence Rankings list */}
        <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-left backdrop-blur-md flex flex-col gap-6">
          <h3 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800">
            <BarChart size={15} className="text-indigo-400" />
            Best Performing Campaigns
          </h3>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {campaigns.map((c) => (
              <div key={c.id} className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="font-bold text-zinc-200 text-xs truncate">{c.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{c.leadsCount} prospects loaded</p>
                </div>
                
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-400 block">{c.replyRate}% Reply</span>
                  <span className="text-[9px] text-zinc-500">Conv: {c.conversionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
