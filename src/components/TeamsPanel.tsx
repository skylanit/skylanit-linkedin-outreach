import React from 'react';
import { 
  Users, 
  UserCheck, 
  Send, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2,
  Mail,
  Users2
} from 'lucide-react';
import { TeamMember } from '../types';

interface TeamsPanelProps {
  teamMembers: TeamMember[];
  onInviteMember: (name: string, email: string, role: TeamMember['role']) => void;
  onRemoveMember: (id: string) => void;
  onUpdateRole: (id: string, role: TeamMember['role']) => void;
}

export default function TeamsPanel({
  teamMembers,
  onInviteMember,
  onRemoveMember,
  onUpdateRole
}: TeamsPanelProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<TeamMember['role']>('member');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onInviteMember(name, email, role);
    setName('');
    setEmail('');
    setRole('member');
    setIsAdding(false);
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left flex flex-col gap-6" id="teams-panel">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Users size={18} className="text-indigo-400" />
            Workspace Team Collaboration
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Manage seat allocations, multiple LinkedIn profile syncing rights, and pipeline campaigns authorization.</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
        >
          <Plus size={14} />
          Invite Team Member
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-950/80 border border-indigo-500/30 rounded-xl space-y-4 max-w-xl transition-all text-xs">
          <div className="font-semibold text-zinc-200">Invite Smart Broker / Seat Linker</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold mb-1">NAME</label>
              <input 
                type="text"
                required
                placeholder="Marcus Aurelius"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold mb-1">EMAIL ADDRESS</label>
              <input 
                type="email"
                required
                placeholder="marcus@dripifyoutreach.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 font-bold mb-1">ROLE PERMISSIONS SET</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as TeamMember['role'])}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-300 w-full focus:outline-none focus:border-indigo-500"
            >
              <option value="member">Campaign Member (Can edit sequences only)</option>
              <option value="admin">SaaS Administrator (Can invite and update proxies)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="p-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="p-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-lg cursor-pointer font-semibold"
            >
              Dispatch Invitation
            </button>
          </div>
        </form>
      )}

      {/* Team Seats Table */}
      <div className="overflow-x-auto border border-zinc-800/80 rounded-xl bg-zinc-950/20">
        <table className="w-full text-xs text-left text-zinc-300">
          <thead className="bg-zinc-950/60 text-zinc-500 uppercase text-[9px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-4 font-semibold">Workspace Member</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Assigned Authority</th>
              <th className="p-4 font-semibold">Seat Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-zinc-900/10">
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-950/60 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold uppercase">
                      {member.name.substring(0,2)}
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-200">{member.name}</span>
                      <span className="text-[9px] text-zinc-500 block truncate">Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-zinc-400 font-medium">
                  {member.email}
                </td>
                <td className="p-4">
                  <select
                    value={member.role}
                    disabled={member.role === 'owner'}
                    onChange={e => onUpdateRole(member.id, e.target.value as TeamMember['role'])}
                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ring-1 font-semibold ${member.status === 'active' ? 'bg-emerald-950/30 text-emerald-400 ring-emerald-800/50' : 'bg-amber-950/30 text-amber-400 ring-amber-800/50'}`}>
                    {member.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    disabled={member.role === 'owner'}
                    onClick={() => onRemoveMember(member.id)}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-all cursor-pointer disabled:opacity-30"
                    title="Remove member seat"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
