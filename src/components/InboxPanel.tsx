import React from 'react';
import { 
  Inbox, 
  Search, 
  Send, 
  Sparkles, 
  Linkedin, 
  Mail, 
  Loader2, 
  Clock, 
  CheckCheck,
  Building2,
  Calendar,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { Lead, ChatMessage } from '../types';

interface InboxPanelProps {
  leads: Lead[];
  chatMessages: ChatMessage[];
  onSendMessage: (leadId: string, text: string, channel: 'linkedin' | 'email') => void;
  selectedLeadId: string | null;
  onClearSelectedLeadId: () => void;
}

export default function InboxPanel({
  leads,
  chatMessages,
  onSendMessage,
  selectedLeadId,
  onClearSelectedLeadId
}: InboxPanelProps) {
  // Only focus on hot leads (connected, replied, converted) that might have conversation
  const conversationalLeads = leads.filter(l => ['connected', 'replied', 'converted'].includes(l.stage));
  
  const [activeLead, setActiveLead] = React.useState<Lead | null>(
    leads.find(l => l.id === selectedLeadId) || conversationalLeads[0] || null
  );

  const [newMessage, setNewMessage] = React.useState('');
  const [activeChannel, setActiveChannel] = React.useState<'linkedin' | 'email'>('linkedin');
  const [searchTerm, setSearchTerm] = React.useState('');

  // AI draft states
  const [isAiDrafting, setIsAiDrafting] = React.useState(false);
  const [aiAnalysis, setAiAnalysis] = React.useState<any | null>(null);

  // Sync state if selectedLeadId shifts from parent (e.g., opened from CRM Leads view)
  React.useEffect(() => {
    if (selectedLeadId) {
      const match = leads.find(l => l.id === selectedLeadId);
      if (match) setActiveLead(match);
    }
  }, [selectedLeadId, leads]);

  const filteredConversationalLeads = conversationalLeads.filter(lead => {
    return lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lead.company.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeLeadMessages = chatMessages.filter(msg => msg.leadId === activeLead?.id);

  // Call Gemini Smart Respond API
  const handleGenerateAiSmartReply = async () => {
    if (!activeLead) return;
    
    const lastLeadMessage = [...activeLeadMessages]
      .reverse()
      .find(m => m.sender === 'lead')?.text || "Hi, I am interested in building and optimizing out tech stack.";

    setIsAiDrafting(true);
    setAiAnalysis(null);

    try {
      const response = await fetch("/api/ai/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadMessage: lastLeadMessage,
          userHistory: activeLeadMessages.map(m => ({ role: m.sender, content: m.text })),
          contextNotes: activeLead.notes
        })
      });

      const data = await response.json();
      if (data && data.suggestedReply) {
        setNewMessage(data.suggestedReply);
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleSendDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeLead) return;
    
    onSendMessage(activeLead.id, newMessage, activeChannel);
    setNewMessage('');
    setAiAnalysis(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-180px)]" id="inbox-panel">
      
      {/* LEFT COLUMN: Active Chats Search and Selection */}
      <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2 mb-3 text-xs uppercase tracking-wider">
            <Inbox size={15} className="text-indigo-400" />
            Unified Inbox Conversations
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={14} />
            <input 
              type="text"
              placeholder="Filter active chats..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
          {filteredConversationalLeads.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No active conversational leads found. (Stage must be Connected, Replied, or Converted to trigger messages).
            </div>
          ) : (
            filteredConversationalLeads.map(lead => {
              const lastMsgs = chatMessages.filter(m => m.leadId === lead.id);
              const lastMsg = lastMsgs[lastMsgs.length - 1];
              const unreadCount = lastMsgs.filter(m => m.sender === 'lead' && !m.read).length;

              return (
                <div 
                  key={lead.id}
                  onClick={() => { setActiveLead(lead); onClearSelectedLeadId(); }}
                  className={`p-3 text-left transition-all cursor-pointer flex items-start gap-2.5 relative ${activeLead?.id === lead.id ? 'bg-zinc-800/40 border-l-4 border-indigo-500' : 'hover:bg-zinc-800/10'}`}
                >
                  <img src={lead.avatarUrl} alt={lead.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700 mt-1" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-zinc-200 text-xs truncate">{lead.name}</h4>
                      <span className="text-[9px] text-zinc-500">
                        {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 truncate font-semibold">{lead.company}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-1 italic">
                      {lastMsg ? `${lastMsg.sender === 'user' ? 'Me: ' : ''}${lastMsg.text}` : 'No messages yet'}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <span className="absolute right-3 top-7 w-4.5 h-4.5 bg-indigo-600 text-zinc-100 text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Chat Messages Canvas & Response Pilot */}
      <div className="lg:col-span-8 flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
        {activeLead ? (
          <div className="flex-1 flex flex-col h-full min-h-[500px]">
            
            {/* Header Identity banner */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
              <div className="flex items-center gap-3">
                <img src={activeLead.avatarUrl} alt={activeLead.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-700" />
                <div className="text-left">
                  <h3 className="font-bold text-zinc-200 text-xs flex items-center gap-1">
                    {activeLead.name}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full ring-1 bg-amber-950/60 text-amber-400 ring-amber-800/50 uppercase font-semibold">
                      {activeLead.stage}
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5"><Building2 size={11} /> {activeLead.title} @ {activeLead.company}</p>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-[10px] gap-1">
                <button 
                  onClick={() => setActiveChannel('linkedin')}
                  className={`p-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer font-bold transition-all ${activeChannel === 'linkedin' ? 'bg-indigo-600 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <Linkedin size={11} />
                  LinkedIn
                </button>
                <button 
                  onClick={() => setActiveChannel('email')}
                  className={`p-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer font-bold transition-all ${activeChannel === 'email' ? 'bg-indigo-600 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <Mail size={11} />
                  Email Channel
                </button>
              </div>
            </div>

            {/* Messages Stream Canvas */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[250px] max-h-[350px] bg-zinc-950/25">
              {activeLeadMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs gap-1">
                  <Inbox size={26} className="text-zinc-700" />
                  No direct conversation logs yet. Send a manual message below to ignite.
                </div>
              ) : (
                activeLeadMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl p-3.5 text-xs text-left relative ${msg.sender === 'user' ? 'bg-indigo-600 text-zinc-100 rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${msg.sender === 'user' ? 'text-indigo-200' : 'text-zinc-500'}`}>
                        {msg.channel === 'linkedin' ? <Linkedin size={10} /> : <Mail size={10} />}
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.sender === 'user' && <CheckCheck size={11} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CRM Note snippet reminder */}
            {activeLead.notes && (
              <div className="m-4 mb-2 p-2 px-3 bg-amber-950/20 border border-amber-500/20 rounded-lg text-left text-[10.5px] text-amber-300 flex items-start gap-1.5 leading-relaxed">
                <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p><strong>CRM PROSPECT MEMO:</strong> {activeLead.notes}</p>
              </div>
            )}

            {/* AI SMARTEST REPLY PANEL */}
            {aiAnalysis && (
              <div className="m-4 mb-0 p-3.5 bg-indigo-950/35 border border-indigo-500/30 rounded-xl text-xs text-left space-y-1.5 transition-all">
                <div className="flex items-center gap-1 text-indigo-300 font-bold">
                  <Sparkles size={13} className="text-yellow-400" />
                  Gemini Smart Sentiment Analysis
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-zinc-500 block">Sentiment Type:</span>
                    <span className="font-bold text-indigo-400 uppercase">{aiAnalysis.sentiment}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Suggested Pipeline Move:</span>
                    <span className="font-bold text-indigo-400 uppercase">{aiAnalysis.recommendedNextStage}</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">"{aiAnalysis.analysis}"</p>
              </div>
            )}

            {/* Outbox manual text area & controls */}
            <form onSubmit={handleSendDraft} className="p-4 border-t border-zinc-800 bg-zinc-950/40 flex flex-col gap-3">
              <textarea 
                placeholder={`Draft message to send via ${activeChannel.toUpperCase()}...`}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between gap-4">
                <button 
                  type="button"
                  onClick={handleGenerateAiSmartReply}
                  disabled={isAiDrafting}
                  className="p-1 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-55 text-[10.5px] font-bold text-zinc-200 border border-zinc-700/60 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  {isAiDrafting ? (
                    <Loader2 size={12} className="animate-spin text-indigo-400" />
                  ) : (
                    <Sparkles size={12} className="text-yellow-400" />
                  )}
                  {isAiDrafting ? "Drafting Response..." : "AI Generate Smart Reply"}
                </button>

                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-1.5 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-zinc-100 rounded-lg text-xs font-bold font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Send Message
                  <Send size={11} />
                </button>
              </div>
            </form>

          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2 min-h-[500px]">
            <Inbox size={40} className="text-zinc-700" />
            <p>Select a hot connected/replied conversation on the left panel.</p>
            <p className="text-xs">Your workspace streams real-time messages and replies here automatically.</p>
          </div>
        )}
      </div>

    </div>
  );
}
