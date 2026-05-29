import React from 'react';
import { 
  Building2, 
  Linkedin, 
  Mail, 
  UserCheck, 
  Sliders, 
  Bell, 
  Key, 
  CreditCard,
  Target,
  Inbox,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  Monitor,
  Share2,
  Lock,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  BarChart2,
  CheckCircle,
  HelpCircle,
  Network
} from 'lucide-react';

export default function BillingPanel() {
  const currentSeatPlan = {
    packageName: "Corporate Unlimited Premium Team Sync",
    cost: "$480",
    billingCycle: "Annually / Corporate Plan",
    seatsUsed: 3,
    seatsMax: 25,
    lastPaid: "May 29, 2026",
    autoRenew: true
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left flex flex-col gap-6" id="billing-panel">
      <div>
        <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <CreditCard size={18} className="text-indigo-400" />
          Active SaaS Package Plan & Invoices
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Review your corporate seat allowances, monthly outreach limit limits, and payment methods securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Package info card */}
        <div className="p-5 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Active Package</span>
            <h3 className="font-extrabold text-zinc-100 text-sm uppercase tracking-wider">{currentSeatPlan.packageName}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed pr-2">Sync up to 25 separate LinkedIn profiles with custom dedicated static residential proxies safely in parallel.</p>
          </div>

          <div className="flex items-baseline gap-2 pb-2">
            <span className="text-3xl font-black text-zinc-100">{currentSeatPlan.cost}</span>
            <span className="text-[10px] text-zinc-500">/{currentSeatPlan.billingCycle}</span>
          </div>
        </div>

        {/* Seat Metrics card */}
        <div className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl text-left flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-zinc-500 font-bold uppercase tracking-wider block text-[10px]">Seat Allocation</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-zinc-200">{currentSeatPlan.seatsUsed} Seats active</span>
                <span className="text-zinc-500">/ {currentSeatPlan.seatsMax} Total Max allocated</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded" style={{ width: `${(currentSeatPlan.seatsUsed/currentSeatPlan.seatsMax)*100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-500 block">Last Invoice:</span>
                <span className="font-bold text-zinc-300">{currentSeatPlan.lastPaid}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Status:</span>
                <span className="font-bold text-emerald-400">PAID & OK</span>
              </div>
            </div>
          </div>

          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-xl transition-all font-semibold text-xs cursor-pointer text-center">
            Modify Corporate Card Settings
          </button>
        </div>

      </div>
    </div>
  );
}
