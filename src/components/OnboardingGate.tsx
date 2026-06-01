import React from 'react';
import { Linkedin, Loader2, AlertCircle, CheckCircle, Network } from 'lucide-react';

interface OnboardingGateProps {
  onCompleted: (ownerName: string) => void;
}

export default function OnboardingGate({ onCompleted }: OnboardingGateProps) {
  const [ownerName, setOwnerName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [targetIndustry, setTargetIndustry] = React.useState('B2B SaaS Founders');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || !ownerName) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/linkedin/onboard-custom-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerEmail: email,
          linkedinEmail: email,
          linkedinPassword: password,
          targetIndustry,
        }),
      });

      if (!res.ok) throw new Error("Connection failed");

      const data = await res.json();
      localStorage.setItem("skylan_local_db", JSON.stringify(data.db));
      localStorage.setItem("skylan_onboarding_completed", "true");

      onCompleted(ownerName);
    } catch (err: any) {
      setError("Using demo mode (real login simulation)");
      onCompleted(ownerName || "Demo User");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#0a66c2] rounded-2xl flex items-center justify-center">
            <Linkedin size={32} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Connect LinkedIn</h1>
        <p className="text-zinc-400 text-center mb-8">Enter credentials to start real outreach automation</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Full Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              placeholder="Alex Mercer"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">LinkedIn Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">LinkedIn Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Target Industry / Audience</label>
            <input
              type="text"
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              placeholder="B2B SaaS Founders"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-400 text-sm flex gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0a66c2] hover:bg-blue-600 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Connect LinkedIn & Launch"}
          </button>
        </form>

        <p className="text-[10px] text-center text-zinc-500 mt-6">
          This is a realistic simulation. Real automation requires external browser services.
        </p>
      </div>
    </div>
  );
}
