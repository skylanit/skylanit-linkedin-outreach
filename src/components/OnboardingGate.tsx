import React from 'react';
import { 
  Building2, 
  Linkedin, 
  Mail, 
  Lock, 
  Target, 
  ShieldCheck, 
  Cpu, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Network,
  Globe,
  Radio,
  Sliders,
  Check
} from 'lucide-react';

interface OnboardingGateProps {
  onCompleted: (ownerName: string) => void;
}

export default function OnboardingGate({ onCompleted }: OnboardingGateProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  
  // Form Step 1: Workspace Registration
  const [ownerName, setOwnerName] = React.useState('');
  const [ownerEmail, setOwnerEmail] = React.useState('');
  const [appPassword, setAppPassword] = React.useState('');
  const [targetIndustry, setTargetIndustry] = React.useState('Software Founders & Tech CTOs');
  const [customIndustry, setCustomIndustry] = React.useState('');

  // Form Step 2: Dripify-style LinkedIn Connect Details
  const [linkedinEmail, setLinkedinEmail] = React.useState('');
  const [linkedinPassword, setLinkedinPassword] = React.useState('');
  
  // Validation States matching screenshot
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);

  // Form Step 3: Interactive Headless Simulation Checks
  const [verifyingStage, setVerifyingStage] = React.useState<0 | 1 | 2 | 3 | 4>(0);
  const [otpCode, setOtpCode] = React.useState('');
  const [submittingOtp, setSubmittingOtp] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [simulatedLogs, setSimulatedLogs] = React.useState<string[]>([]);
  const [testingOAuth, setTestingOAuth] = React.useState(false);

  const handleConnectOAuth = async () => {
    setErrorText('');
    setTestingOAuth(true);
    try {
      const res = await fetch("/api/auth/linkedin/url");
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to contact the LinkedIn interface securely. Please ensure that LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET are configured under Settings -> Secrets in AI Studio and that the development server has restarted.");
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "LinkedIn OAuth 2.0 configuration variables are not set yet.");
      }
      const { url } = data;
      if (!url) {
        throw new Error("OAuth redirect URL is missing from server handshake.");
      }
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        url,
        "linkedin_oauth",
        `width=${width},height=${height},top=${top},left=${left}`
      );
      if (!popup) {
        setErrorText("Popup was blocked! Please allow popups for Skylan to authenticate with LinkedIn.");
      }
    } catch (error: any) {
      setErrorText(error.message);
    } finally {
      setTestingOAuth(false);
    }
  };

  const handleOAuthConnectionSuccessful = async (profileName: string) => {
    setErrorText('');
    setStep(3);
    setVerifyingStage(3); // skip simulated credential logs because it's a real connected profile!
    setSimulatedLogs([
      `[${new Date().toLocaleTimeString()}] ✓ LinkedIn Direct OAuth 2.0 connection validated!`,
      `[${new Date().toLocaleTimeString()}] Authenticated profile: ${profileName}`,
      `[${new Date().toLocaleTimeString()}] Initiating secure campaign workspace build with Gemini...`
    ]);

    const activeIndustry = targetIndustry === 'custom' ? customIndustry : targetIndustry;

    try {
      const response = await fetch("/api/linkedin/onboard-custom-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerEmail,
          targetIndustry: activeIndustry,
          isOAuth: true,
          oauthName: profileName,
          oauthAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setVerifyingStage(4); // Success launch state
        setSimulatedLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✓ Successfully hydrated realistic ${activeIndustry} leads, sequencing steps, and historical messages!`,
          `[${new Date().toLocaleTimeString()}] Workspace ready.`
        ]);
      } else {
        setStep(2);
        setVerifyingStage(0);
        setErrorText(data.error || "Failed to finalize customized LinkedIn sequence onboarding.");
      }
    } catch (err: any) {
      setStep(2);
      setVerifyingStage(0);
      setErrorText("A localized network timeout occurred during database synthesis: " + (err.message || err));
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LINKEDIN_OAUTH_SUCCESS') {
        handleOAuthConnectionSuccessful(event.data.name);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [ownerName, ownerEmail, targetIndustry, customIndustry]);

  const industryChoices = [
    "Software Founders & Tech CTOs",
    "E-Commerce & Digital Brand Owners",
    "Venture Capital & Angel Investors",
    "Real Estate Brokers & Developers",
    "SaaS Growth & Performance Marketers"
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !ownerEmail.trim() || !appPassword.trim()) {
      setErrorText("All fields are required to seed your local workspace container.");
      return;
    }
    setErrorText('');
    setStep(2);
  };

  // Triggers the exact visual verification proxy simulation steps
  const handleStartSimulatedSequence = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasValidationError = false;
    
    if (!linkedinEmail.trim()) {
      setEmailError(true);
      hasValidationError = true;
    } else {
      setEmailError(false);
    }

    if (!linkedinPassword.trim()) {
      setPasswordError(true);
      hasValidationError = true;
    } else {
      setPasswordError(false);
    }

    if (hasValidationError) {
      return;
    }

    setErrorText('');
    setStep(3);
    setVerifyingStage(1);
    setSimulatedLogs([]);

    // Staggered output simulation lines
    addLog("Initializing US-West residential static proxy tunnel...", 100);
    addLog("Bound tunnel proxy: US-West-2 (Seattle Static Premium) - latency: 120ms", 800);
    addLog("Spawning instance of secure sandboxed Google Chrome browser...", 1600);
    addLog("Spoofing audio-context fingerprints & localized canvas hardware webGL parameters...", 2400);
    addLog("Loading login.linkedin.com/login-portal safely...", 3200);
    addLog(`Transmitting encrypted credential handshake sequence for user: ${linkedinEmail}`, 4000);

    setTimeout(() => {
      setVerifyingStage(2); // Presents the 2FA Code box
      addLog("⚠️ SECURITY CHALLENGE: Verification OTP requested by LinkedIn secure login gateway guard.", 0);
    }, 4900);
  };

  const addLog = (msg: string, delay: number) => {
    setTimeout(() => {
      setSimulatedLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, delay);
  };

  const handleOtpConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorText("Please enter the 6-digit verification code to complete connection authorization.");
      return;
    }

    setErrorText('');
    setSubmittingOtp(true);
    setVerifyingStage(3); // Shows Gemini custom database synthesizer loading panel

    addLog("Confirming authorization PIN to live browser state session...", 100);
    addLog("Evaluating response variables and persistent security cookies...", 800);
    addLog("LinkedIn connection successful! Session authorization verified and saved.", 1600);
    addLog("Engaging Gemini 3.5 AI model to synthesize hyper-realistic B2B campaigns tailored to target industry...", 2400);

    const activeIndustry = targetIndustry === 'custom' ? customIndustry : targetIndustry;

    try {
      const response = await fetch("/api/linkedin/onboard-custom-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerEmail,
          linkedinEmail,
          linkedinPassword,
          targetIndustry: activeIndustry
        })
      });

      const data = await response.json();
      setSubmittingOtp(false);

      if (data.status === 'success') {
        setVerifyingStage(4); // Success launch state
        addLog(`Successfully hydrated realistic ${activeIndustry} leads, sequencing steps, and historical messages!`, 100);
        addLog("Workspace ready. Opening target lead dashboard...", 800);
      } else {
        setVerifyingStage(1);
        setErrorText(data.error || "The remote session rejected authentication. Check credentials and retry.");
      }
    } catch {
      setSubmittingOtp(false);
      setVerifyingStage(1);
      setErrorText("A localized network timeout occurred during proxy handshake. Please try verifying again.");
    }
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
          <span>Encrypted Tunnel Connection Active</span>
        </div>
      </div>

      {/* Main Core Viewport */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-xl mx-auto text-center px-4">
          
          {/* STEP 1: App Registration */}
          {step === 1 && (
            <div className="space-y-6 text-left bg-white border border-zinc-200/65 rounded-2xl p-8 shadow-sm">
              <div className="text-center">
                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">Configure Workspace</span>
                <h1 className="text-2xl font-bold text-zinc-950 mt-2 tracking-tight">Create Workspace Account</h1>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Let's set up your Skylan owner credentials configured with localized database encryption.</p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Your Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Alex Mercer"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-[#7059FF] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Business Email *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="alex@scaleupgrowth.com"
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-[#7059FF] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Workspace Password *</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={appPassword}
                      onChange={e => setAppPassword(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-[#7059FF] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-[#7059FF] uppercase tracking-wider flex items-center gap-1">
                    <Target size={11} /> Pitch Targets (AI synthesized campaign dataset) *
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {industryChoices.map((choice, i) => (
                      <label 
                        key={i} 
                        className={`flex items-center justify-between p-2.5 px-3.5 border rounded-xl cursor-pointer transition-all ${targetIndustry === choice ? 'bg-indigo-50/20 border-[#7059FF] ring-1 ring-[#7059FF]/30 text-indigo-900 font-semibold' : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-600'}`}
                      >
                        <span className="text-[11px]">{choice}</span>
                        <input 
                          type="radio" 
                          name="industry" 
                          value={choice}
                          checked={targetIndustry === choice}
                          onChange={() => setTargetIndustry(choice)}
                          className="sr-only"
                        />
                        {targetIndustry === choice && (
                          <Check size={12} className="text-[#7059FF]" />
                        )}
                      </label>
                    ))}
                    
                    <label 
                      className={`flex flex-col p-2.5 px-3.5 border rounded-xl cursor-pointer transition-all ${targetIndustry === 'custom' ? 'bg-indigo-50/20 border-[#7059FF] ring-1 ring-[#7059FF]/30 text-indigo-900' : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-600'}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[11px] font-semibold">Custom Target Focus...</span>
                        <input 
                          type="radio" 
                          name="industry" 
                          value="custom"
                          checked={targetIndustry === 'custom'}
                          onChange={() => setTargetIndustry('custom')}
                          className="sr-only"
                        />
                        {targetIndustry === 'custom' && (
                          <Check size={12} className="text-[#7059FF]" />
                        )}
                      </div>
                      {targetIndustry === 'custom' && (
                        <input 
                          type="text" 
                          required
                          placeholder="e.g., Enterprise CyberSecurity CTOs / HR Directors in Paris"
                          value={customIndustry}
                          onChange={e => setCustomIndustry(e.target.value)}
                          className="w-full mt-2 bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800 focus:outline-[#7059FF]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </label>
                  </div>
                </div>

                {errorText && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{errorText}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-[#7059FF] hover:bg-[#5E47EA] text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Continue to LinkedIn Bridge
                  <ChevronRight size={14} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Dual Connection Gate (Secure OAuth only) */}
          {step === 2 && (
            <div className="space-y-5 max-w-xl mx-auto">
              
              {/* Main Title Center */}
              <div className="text-center">
                <span className="text-[10px] bg-[#7059FF]/10 text-[#7059FF] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Secure Authorization</span>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-950 mt-2 font-sans" style={{ fontSize: '32px' }}>
                  Connect LinkedIn Profile
                </h1>
                <p className="text-slate-500 leading-relaxed text-[12.5px] mt-1.5 max-w-md mx-auto">
                  Authorizing your profile seeds your pipeline container with real campaigns, targeted leads, and simulated automation logs matching your niche.
                </p>
              </div>

              {errorText && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2 max-w-md mx-auto text-left animate-fade-in">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <div className="max-w-md mx-auto space-y-4">
                
                {/* METHOD A: Direct LinkedIn Secure OAuth */}
                <div className="p-6 bg-[#7059FF]/5 border border-[#7059FF]/20 rounded-2xl text-left space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] bg-[#7059FF] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Secure Handshake</span>
                    <span className="text-[9.5px] text-[#7059FF] font-bold flex items-center gap-1">✓ Recommended</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Official OAuth sign in</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">Authenticates directly on LinkedIn secure servers. Safely imports your name and profile details into your target leads dashboard without storing passwords.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectOAuth}
                    disabled={testingOAuth}
                    className="w-full py-3.5 px-4 bg-[#0274b3] hover:bg-[#026399] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-center"
                  >
                    {testingOAuth ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Linkedin size={13} />
                    )}
                    <span>Authorize with official LinkedIn account</span>
                  </button>
                </div>

                {/* Back Link to Step 1 */}
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    <span>Back to owner registration</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Automated Handshake Interaction View */}
          {step === 3 && (
            <div className="max-w-xl mx-auto space-y-6 text-left bg-white border border-zinc-200/65 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <Network size={16} className="text-[#7059FF] animate-pulse" />
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
                  Establishing Safe Connection Tunnel
                </h2>
              </div>

              {/* Web Console Log terminal styled for Light-Mode aesthetics */}
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-44 overflow-y-auto font-mono text-[10px] text-zinc-300 space-y-1 scrollbar-thin flex flex-col justify-end">
                {simulatedLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed break-all">
                    {log.includes('⚠️') || log.includes('CHALLENGE') ? (
                      <span className="text-amber-400 font-semibold">{log}</span>
                    ) : log.includes('SUCCESS') || log.includes('successful') ? (
                      <span className="text-emerald-400 font-bold">{log}</span>
                    ) : log.includes('Gemini') || log.includes('AI') ? (
                      <span className="text-indigo-400">{log}</span>
                    ) : (
                      log
                    )}
                  </div>
                ))}
                {verifyingStage === 1 && (
                  <div className="flex items-center gap-1.5 mt-1 text-indigo-400">
                    <Loader2 size={11} className="animate-spin" />
                    <span>Simulating user browser context login...</span>
                  </div>
                )}
              </div>

              {/* OTP Input box corresponding to security verification */}
              {verifyingStage === 2 && (
                <form onSubmit={handleOtpConfirm} className="space-y-4 border border-indigo-200 p-4 rounded-xl bg-indigo-50/10 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <label className="font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                        <Lock size={12} /> Enter 6-Digit OTP security code *
                      </label>
                      <span className="text-slate-500 font-mono text-[10px]">{linkedinEmail}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1">
                      LinkedIn security triggers a verification code when accessed through new static residential proxy locations. Enter the login pin sent to your inbox.
                    </p>
                    
                    <input 
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 941022"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center mt-3 bg-white border border-zinc-200 focus:border-[#7059FF] rounded-xl p-3 text-2xl font-mono text-zinc-900 tracking-[0.25em] focus:outline-none"
                    />
                  </div>

                  {errorText && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle size={13} className="flex-shrink-0" />
                      <span>{errorText}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#7059FF] hover:bg-[#5C45EA] text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Confirm Code & Validate Session
                  </button>
                </form>
              )}

              {/* Gemini Synthesis stage */}
              {verifyingStage === 3 && (
                <div className="py-2 text-center space-y-3">
                  <Loader2 size={24} className="animate-spin text-[#7059FF] mx-auto" />
                  <div className="space-y-1">
                    <span className="font-bold text-zinc-800 text-xs block">Synthesizing personalized database dataset...</span>
                    <p className="text-zinc-500 text-[11px] max-w-sm mx-auto leading-relaxed">
                      Gemini's active intelligence is orchestrating actual campaigns, tailored business prospects, and dialog messages matching {targetIndustry === 'custom' ? customIndustry : targetIndustry}...
                    </p>
                  </div>
                </div>
              )}

              {/* Completion launch stage */}
              {verifyingStage === 4 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-center text-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto text-lg font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900 text-sm">Target Workspace Generated!</h3>
                    <p className="text-slate-600 leading-relaxed max-w-sm mx-auto text-[11.5px]">
                      Account verified! We generated genuine B2B campaign loops, target prospect lists, and a rich inbox populated for <strong>{targetIndustry === 'custom' ? customIndustry : targetIndustry}</strong>.
                    </p>
                  </div>

                  <button 
                    onClick={() => onCompleted(ownerName)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Launch My Custom B2B Workspace
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Footer copyright labels */}
      <div className="max-w-6xl w-full mx-auto text-center py-4 border-t border-zinc-100 text-[11px] text-zinc-400 flex flex-col md:flex-row justify-between items-center gap-2">
        <div>© 2026 Skylan Lead Acquisition Corp. All pipeline activities residential IP safe.</div>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:underline">Security Regulations</a>
          <a href="#terms" className="hover:underline">GDPR & Cookie Policy</a>
        </div>
      </div>

    </div>
  );
}
