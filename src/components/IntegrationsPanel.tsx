import React from 'react';
import { 
  Building2, 
  MapPin, 
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

export default function IntegrationsPanel() {
  const customIntegrations = [
    { name: 'Zapier Webhooks', status: 'Connected', desc: 'Sync Dripify events directly with over 5,000 apps via automated Zapier triggers.', color: 'border-orange-500/30 bg-orange-950/20 text-orange-400' },
    { name: 'HubSpot CRM', status: 'Configure', desc: 'Automatically export converted leads, note logs, and details into your active Sales contacts list.', color: 'border-amber-500/30 bg-amber-950/20 text-amber-400' },
    { name: 'Salesforce Outbox', status: 'Enterprise', desc: 'Enterprise native bidirectional flow syncing replies, acceptance statistics, and deal closure values.', color: 'border-blue-500/30 bg-blue-950/20 text-blue-400' },
    { name: 'Make.com Sync', status: 'Active', desc: 'Run advanced database migrations, parallel processing, and sentiment routing trees using Make modules.', color: 'border-purple-500/30 bg-purple-950/20 text-purple-400' }
  ];

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left flex flex-col gap-6" id="integrations-panel">
      <div>
        <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <Network size={18} className="text-indigo-400" />
          Active Integrations Suite
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Connect your automated LinkedIn outreach CRM data securely with external APIs, databases, and third-party tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customIntegrations.map((item, idx) => (
          <div key={idx} className="p-5 bg-zinc-950/40 border border-zinc-800 rounded-2xl text-left flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">{item.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${item.color}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pr-2">{item.desc}</p>
            </div>

            <button className="p-1 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700/60 cursor-pointer text-xs font-semibold self-start transition-all">
              Manage Webhooks Config
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
