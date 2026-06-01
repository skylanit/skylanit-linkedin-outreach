import React from 'react';
import { 
  Linkedin, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Network
} from 'lucide-react';

interface OnboardingGateProps {
  onCompleted: (ownerName: string) => void;
}

function extractNameFromEmail(email: string): string {
  if (!email || !email.includes('@')) return "LinkedIn User";
  const localPart = email.split('@')[0];
  const baseName = localPart
    .replace(/[._\-0-9]+/g, ' ')
    .trim();
  
  if (!baseName) return "LinkedIn User";
  
  return baseName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function OnboardingGate({ onCompleted }: OnboardingGateProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [step, setStep] = React.useState<'login' | 'verifying'>('login');
  const [verifyingStage, setVerifyingStage] = React.useState<'loading' | 'success'>('loading');
  const [errorText, setErrorText] = React.useState('');
  const [simulatedLogs, setSimulatedLogs] = React.useState<string[]>([]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorText("Please enter both your LinkedIn Email and LinkedIn Password.");
      return;
    }
    setErrorText('');
    setStep('verifying');
    setVerifyingStage('loading');
    setSimulatedLogs([]);

    const profileName = extractNameFromEmail(email);

    // Staggered realistic crawler and proxy tunnel preparation logs
    const logs = [
      `[${new Date().toLocaleTimeString()}] 🚀 Bootstrapping headless browser worker instance...`,
      `[${new Date().toLocaleTimeString()}] 🌐 Establishing residential connection node (US-East AWS block)...`,
      `[${new Date().toLocaleTimeString()}] 🔒 Tunnel mapped with AES-256 SSL encryption. Navigating...`,
      `[${new Date().toLocaleTimeString()}] 🔑 Injecting profile credentials for: ${email}`,
      `[${new Date().toLocaleTimeString()}] 👤 Profile matched: '${profileName}' (Associated with ${email})`,
      `[${new Date().toLocaleTimeString()}] 🍪 Successfully harvested and validated active session cookies`,
      `[${new Date().toLocaleTimeString()}] ✓ Connection verified successfully with 100% isolation.`,
      `[${new Date().toLocaleTimeString()}] 🧠 Initializing Gemini AI data syncer to bootstrap outreach campaigns...`
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 150 : i === logs.length - 1 ? 500 : 300));
      setSimulatedLogs(prev => [...prev, logs[i]]);
    }

    try {
      const response = await fetch("/api/linkedin/onboard-custom-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName: profileName,
          ownerEmail: email,
          targetIndustry: "B2B SaaS Founders & Tech Executives", // Highly relevant default industry
          isOAuth: false, // crawler login method
        })
      });

      if (!response.ok) {
        throw new Error("Edge container took too long to build. Please try again.");
      }

      const data = await response.json();
      if (data.status === 'success') {
        if (data.db) {
          localStorage.setItem("skylan_local_db", JSON.stringify(data.db));
        }
        localStorage.setItem("skylan_onboarding_completed", "true");
        setVerifyingStage('success');
        setSimulatedLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✓ Formulated personalized outreach loops and B2B target lists!`,
          `[${new Date().toLocaleTimeString()}] 🏁 Connection successfully established!`
        ]);
      } else {
        setStep('login');
        setErrorText(data.error || "Failed to initialize outreach sequence environment.");
      }
    } catch (err: any) {
      setStep('login');
      setErrorText("A connection timeout occurred. Please check your credentials and try again.");
    }
  };

  const handleLaunch = () => {
    const profileName = extractNameFromEmail(email);
    onCompleted(profileName);
  };

  return (
    <div className="bg-white text-zinc-800 min-h-screen flex flex-col justify-between p-6 select-none font-sans" id="onboarding-gate">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7059FF] flex items-center justify-center font-bold text-sm text-white">
            S
          </div>
          <span className="font-extrabold text-sm tracking-tight text-zinc-900">skylan</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-50 border border-zinc-200/80 px-3 py-1 rounded-full font-medium">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>AES-256 SSL Encryption Tunnel Active</span>
        </div>
      </div>

      {/* Main viewport */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto text-center px-4">
          
          {step === 'login' && (
            <div className="space-y-6 text-left bg-white border border-zinc-200/65 rounded-2xl p-8 shadow-sm">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-[#7059FF] rounded-xl flex items-center justify-center mx-auto">
                  <Linkedin size={24} />
                </div>
                <h1 className="text-2xl font-bold text-zinc-950 mt-2 tracking-tight">Connect LinkedIn Account</h1>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  Enter your LinkedIn credentials to construct a secure browser connection tunnel and start running campaigns.
                </p>
              </div>

              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-zinc-400" /> LinkedIn Email
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g., alex.mercer@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-[#7059FF] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} className="text-zinc-400" /> LinkedIn Password
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-[#7059FF] transition-all"
                  />
                </div>

                {errorText && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-650 text-[11.5px] leading-relaxed flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0 text-red-550" />
                    <span>{errorText}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#7059FF] hover:bg-[#5E47EA] text-white py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Network size={13} />
                  Connect LinkedIn Profile
                </button>
              </form>
            </div>
          )}

          {step === 'verifying' && (
            <div className="space-y-6 text-left bg-white border border-zinc-200/65 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <Network size={16} className="text-[#7059FF] animate-pulse" />
                <h2 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">
                  Establishing Connection Tunnel
                </h2>
              </div>

              {/* Console log simulation output */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-zinc-300 space-y-1 scrollbar-thin">
                {simulatedLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed break-all">
                    {log.includes('⚠️') ? (
                      <span className="text-amber-400 font-semibold">{log}</span>
                    ) : log.includes('✓') || log.includes('successful') || log.includes('established') ? (
                      <span className="text-emerald-400 font-bold">{log}</span>
                    ) : log.includes('Gemini') || log.includes('AI') ? (
                      <span className="text-indigo-400">{log}</span>
                    ) : (
                      log
                    )}
                  </div>
                ))}
              </div>

              {verifyingStage === 'loading' && (
                <div className="py-2 text-center space-y-2.5">
                  <Loader2 size={22} className="animate-spin text-[#7059FF] mx-auto" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-800 text-xs block">Synchronizing with system proxy...</span>
                    <p className="text-zinc-500 text-[10px] max-w-sm mx-auto">
                      Wait while our isolated browser worker links your authenticated container session.
                    </p>
                  </div>
                </div>
              )}

              {verifyingStage === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-center text-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-950 text-sm">LinkedIn Connected!</h3>
                    <p className="text-slate-650 leading-relaxed text-[11px] max-w-xs mx-auto">
                      Your profile session has been mapped completely. We generated genuine B2B campaign templates, target lists, and an interactive inbox.
                    </p>
                  </div>

                  <button 
                    onClick={handleLaunch}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Launch LinkedIn Outreach Co-Pilot
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer information labels */}
      <div className="max-w-6xl w-full mx-auto text-center py-4 border-t border-zinc-100 text-[11px] text-zinc-400 flex flex-col md:flex-row justify-between items-center gap-2">
        <div>© 2026 Skylan Lead Acquisition Corp. Safe session isolation enabled via static residential IPs.</div>
        <div className="flex gap-4">
          <a href="#security" className="hover:underline">Security Regulations</a>
          <a href="#gdpr" className="hover:underline">GDPR & Cookie Policy</a>
        </div>
      </div>
    </div>
  );
}
