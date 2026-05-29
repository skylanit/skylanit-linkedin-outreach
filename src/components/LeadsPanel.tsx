import React from 'react';
import { 
  Building2, 
  MapPin, 
  Linkedin, 
  Mail, 
  Tags, 
  Calendar, 
  User, 
  Plus, 
  Sparkles, 
  Send, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import { Lead, ChatMessage } from '../types';

interface LeadsPanelProps {
  leads: Lead[];
  campaigns: { id: string; name: string }[];
  chatMessages: ChatMessage[];
  onAddLead: (lead: Omit<Lead, 'id' | 'activities' | 'lastInteractionAt'>) => void;
  onUpdateLeadStage: (leadId: string, stage: Lead['stage']) => void;
  onAddNote: (leadId: string, note: string) => void;
  onSelectLeadChat: (leadId: string) => void;
}

export default function LeadsPanel({
  leads,
  campaigns,
  chatMessages,
  onAddLead,
  onUpdateLeadStage,
  onAddNote,
  onSelectLeadChat
}: LeadsPanelProps) {
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(leads[0] || null);
  const [newNote, setNewNote] = React.useState('');
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCampaignFilter, setSelectedCampaignFilter] = React.useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = React.useState<string>('all');
  
  // New Lead form
  const [isAddingLead, setIsAddingLead] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    title: '',
    company: '',
    location: '',
    linkedinUrl: '',
    email: '',
    campaignId: campaigns[0]?.id || '',
    stage: 'imported' as Lead['stage'],
    tags: '',
    notes: ''
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Title', 'Company', 'Location', 'LinkedIn URL', 'Email', 'Stage', 'Campaign', 'Tags', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.title.replace(/"/g, '""')}"`,
        `"${l.company.replace(/"/g, '""')}"`,
        `"${l.location.replace(/"/g, '""')}"`,
        `"${l.linkedinUrl}"`,
        `"${l.email}"`,
        `"${l.stage}"`,
        `"${l.campaignName.replace(/"/g, '""')}"`,
        `"${l.tags.join('; ')}"`,
        `"${l.notes.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "linkedin_outreach_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = selectedCampaignFilter === 'all' || lead.campaignId === selectedCampaignFilter;
    const matchesStage = selectedStageFilter === 'all' || lead.stage === selectedStageFilter;
    return matchesSearch && matchesCampaign && matchesStage;
  });

  // Watch selectedLead changes, sync with updated lead reference
  const currentLead = leads.find(l => l.id === selectedLead?.id) || selectedLead;

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;
    
    onAddLead({
      campaignId: formData.campaignId,
      campaignName: campaigns.find(c => c.id === formData.campaignId)?.name || 'General Outreach',
      name: formData.name,
      title: formData.title,
      company: formData.company,
      location: formData.location,
      linkedinUrl: formData.linkedinUrl,
      email: formData.email,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150&auto=format&fit=crop&q=80`,
      stage: formData.stage,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: formData.notes
    });

    setFormData({
      name: '',
      title: '',
      company: '',
      location: '',
      linkedinUrl: '',
      email: '',
      campaignId: campaigns[0]?.id || '',
      stage: 'imported',
      tags: '',
      notes: ''
    });
    setIsAddingLead(false);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !currentLead) return;
    onAddNote(currentLead.id, newNote);
    setNewNote('');
  };

  const stages: { value: Lead['stage']; label: string; color: string }[] = [
    { value: 'imported', label: 'Lead Discovered', color: 'bg-zinc-800 text-zinc-300 ring-zinc-700' },
    { value: 'invited', label: 'Invite Sent', color: 'bg-indigo-950 text-indigo-300 ring-indigo-800' },
    { value: 'connected', label: 'Connected', color: 'bg-emerald-950 text-emerald-300 ring-emerald-800' },
    { value: 'replied', label: 'Replied / Hot', color: 'bg-amber-950 text-amber-300 ring-amber-800' },
    { value: 'converted', label: 'Deal Closed', color: 'bg-purple-950 text-purple-300 ring-purple-800' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-180px)]" id="leads-panel">
      {/* LEFT COLUMN: Leads Search and List */}
      <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              <User size={18} className="text-indigo-400" />
              Contacts CRM ({filteredLeads.length})
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportCSV}
                className="p-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                title="Export Pipeline to CSV"
              >
                <FileSpreadsheet size={13} />
                Export
              </button>
              <button 
                onClick={() => setIsAddingLead(!isAddingLead)}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium"
              >
                <Plus size={14} />
                Add Lead
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Search keyword: name, company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Campaign</label>
                <select 
                  value={selectedCampaignFilter}
                  onChange={e => setSelectedCampaignFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Campaigns</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">Pipe Stage</label>
                <select 
                  value={selectedStageFilter}
                  onChange={e => setSelectedStageFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Stages</option>
                  <option value="imported">Lead Discovered</option>
                  <option value="invited">Invite Sent</option>
                  <option value="connected">Connected</option>
                  <option value="replied">Replied / Hot</option>
                  <option value="converted">Deal Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Adding Overlay Form */}
        {isAddingLead && (
          <form onSubmit={handleCreateLead} className="p-4 border-b border-zinc-800 bg-zinc-950/90 text-zinc-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-100">Add Lead Manually</span>
              <button type="button" onClick={() => setIsAddingLead(false)} className="text-zinc-500 hover:text-zinc-300">Cancel</button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Marcus Aurelius"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">LinkedIn Role Title</label>
                <input 
                  type="text" 
                  placeholder="CTO or Founder"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">Company *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Roma Tech"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">Location</label>
                <input 
                  type="text" 
                  placeholder="Milan, Italy"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-500 mb-0.5">LinkedIn Profile URL</label>
              <input 
                type="url" 
                placeholder="https://www.linkedin.com/in/..."
                value={formData.linkedinUrl}
                onChange={e => setFormData({...formData, linkedinUrl: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">Email</label>
                <input 
                  type="email" 
                  placeholder="marcus@roma.tech"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">Outreach Campaign</label>
                <select 
                  value={formData.campaignId}
                  onChange={e => setFormData({...formData, campaignId: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none"
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">Initial Stage</label>
                <select 
                  value={formData.stage}
                  onChange={e => setFormData({...formData, stage: e.target.value as Lead['stage']})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200 focus:outline-none"
                >
                  <option value="imported">Lead Discovered</option>
                  <option value="invited">Invite Sent</option>
                  <option value="connected">Connected</option>
                  <option value="replied">Replied / Hot</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 mb-0.5">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="Enterprise, SaaS"
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-200"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full p-2 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded font-medium transition-all text-xs"
            >
              Add to Active CRM Pipeline
            </button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No contacts fit active filters.
            </div>
          ) : (
            filteredLeads.map(lead => {
              const currentStage = stages.find(s => s.value === lead.stage);
              return (
                <div 
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-3 text-left transition-all cursor-pointer ${currentLead?.id === lead.id ? 'bg-zinc-800/40 border-l-4 border-indigo-500' : 'hover:bg-zinc-800/10'}`}
                >
                  <div className="flex items-start gap-2.5">
                    <img 
                      src={lead.avatarUrl} 
                      alt={lead.name} 
                      className="w-9 h-9 rounded-full ring-1 ring-zinc-700 object-cover mt-0.5 flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-semibold text-zinc-200 text-xs truncate">{lead.name}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ring-1 ${currentStage?.color || 'bg-zinc-800 text-zinc-400 font-medium'}`}>
                          {lead.stage === 'imported' ? 'Discovered' : lead.stage}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">{lead.title}</p>
                      <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 mt-1 truncate">
                        <Building2 size={11} className="text-zinc-600" />
                        {lead.company}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Lead Detail Panel and CRM Card */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {currentLead ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6">
            
            {/* Lead Identity Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <img 
                  src={currentLead.avatarUrl} 
                  alt={currentLead.name} 
                  className="w-14 h-14 rounded-full ring-2 ring-indigo-500 object-cover" 
                />
                <div>
                  <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    {currentLead.name}
                    <a href={currentLead.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                      <Linkedin size={16} />
                    </a>
                  </h2>
                  <p className="text-xs text-zinc-300 pr-4">{currentLead.title} @ <span className="text-indigo-300 font-medium">{currentLead.company}</span></p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {currentLead.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={11} />
                      {currentLead.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* CRM Pipeline Stage Controller */}
              <div className="w-full sm:w-auto flex flex-col gap-1 text-xs">
                <span className="text-[10px] text-zinc-500 font-semibold self-start sm:self-end">PIPELINE STAGE</span>
                <select 
                  value={currentLead.stage}
                  onChange={e => onUpdateLeadStage(currentLead.id, e.target.value as Lead['stage'])}
                  className="bg-indigo-950 text-indigo-200 border border-indigo-700/60 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="imported">Lead Discovered (Queued)</option>
                  <option value="invited">Invitation Dispatched</option>
                  <option value="connected">Connected (Awaiting Send)</option>
                  <option value="replied">Replied (Hot Prospect)</option>
                  <option value="converted">Deal Converted (Success)</option>
                </select>
              </div>
            </div>

            {/* Campaign Metadata Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">Assigned Sequence</span>
                <span className="font-semibold text-zinc-300 truncate block">{currentLead.campaignName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Last Outbound Ping</span>
                <span className="font-semibold text-zinc-300">
                  {new Date(currentLead.lastInteractionAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Lead Tags</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {currentLead.tags.map(t => (
                    <span key={t} className="bg-zinc-800 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-zinc-500">Fast Outreach</span>
                <button 
                  onClick={() => onSelectLeadChat(currentLead.id)}
                  className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-lg text-[10px] flex items-center gap-1 font-semibold transition-all cursor-pointer"
                >
                  <MessageSquare size={11} />
                  Open Inbox
                </button>
              </div>
            </div>

            {/* Notebook, Metadata and Interaction History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* CRM Lead Notes Box */}
              <div className="md:col-span-6 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h4 className="font-semibold text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Tags size={13} className="text-amber-400" />
                    Deal Pipeline Notes
                  </h4>
                </div>
                
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 min-h-[120px] max-h-[160px] overflow-y-auto text-xs text-zinc-300 italic whitespace-pre-wrap leading-relaxed">
                  {currentLead.notes || "No context notes entered for Marcus and team yet. Log pricing agreements, custom requests, or target notes below."}
                </div>

                <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type customized prospect notes here..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl border border-zinc-700/60 transition-all font-semibold text-xs"
                  >
                    Save Note
                  </button>
                </form>
              </div>

              {/* Playwright/Puppeteer Automation Micro-Logs / Interaction History */}
              <div className="md:col-span-6 flex flex-col gap-3">
                <h4 className="font-semibold text-zinc-300 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-800">
                  <Calendar size={13} className="text-indigo-400" />
                  Chronological Audit Log
                </h4>

                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {currentLead.activities.map((act) => (
                    <div key={act.id} className="flex gap-2 text-left relative pl-4 border-l border-zinc-800">
                      <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -left-1 top-1.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-500">
                          <span className="font-semibold text-zinc-400">
                            {act.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
            <User size={40} className="text-zinc-700" />
            <p>No contact selected.</p>
            <p className="text-xs">Import a lead list or manually create an entry on the left panel to begin orchestrating LinkedIn smart interactions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
