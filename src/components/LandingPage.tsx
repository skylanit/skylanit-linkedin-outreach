import React from 'react';
import { 
  Building2, 
  MapPin, 
  Linkedin, 
  Mail, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  ArrowUpRight, 
  Zap, 
  Check, 
  Play, 
  MousePointerClick,
  ChevronRight,
  Monitor,
  AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const features = [
    {
      icon: Sparkles,
      title: "Gemini AI Copywriting Engine",
      desc: "Automatically write highly convincing, warm, customizable LinkedIn connection requests and multi-channel drip templates optimized for high response rates."
    },
    {
      icon: ShieldCheck,
      title: "Secure Residential Proxy Anchors",
      desc: "Assign separate premium proxies and browser fingerprinters for every LinkedIn account. Maximize safety limit metrics without triggering robot filters."
    },
    {
      icon: Zap,
      title: "Multi-Step Campaign Sequence Builder",
      desc: "Add customized timers and waits. Simulate automated profile visits, connection invites, and automatic follow-up messages on autopilot."
    },
    {
      icon: MessageSquare,
      title: "Unified Pipeline Inbox & CRM",
      desc: "Keep team conversations, notes, custom categories, interest sentiment tags, and lead exports in sync in one visual high-speed board."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter Pilot",
      price: "$29",
      period: "per seat / mo",
      features: [
        "1 Connected LinkedIn Profile",
        "100 Automatic Invites / week",
        "Simulated Human-like Delays",
        "CSV Leads Import & Export",
        "Standard Shared Proxy IP Pool"
      ],
      btnText: "Start Free Trial",
      popular: false
    },
    {
      name: "Growth Professional",
      price: "$79",
      period: "per seat / mo",
      features: [
        "Up to 5 Connected Profiles",
        "Unlimited Multi-Step Sequences",
        "Gemini AI Smart Replier Engine",
        "Zapier & Custom Webhooks active",
        "Custom Dedicated Proxy Support",
        "Shared Team Collaboration Seats"
      ],
      btnText: "Upgrade to Professional",
      popular: true
    },
    {
      name: "Corporate Enterprise",
      price: "$480",
      period: "monthly corporate flat",
      features: [
        "Up to 25 Connected Profiles",
        "Unlimited Scraping & Invites",
        "Prioritized Gemini Token Allocations",
        "HubSpot and Salesforce Native Syncs",
        "Strategic Campaign Strategy Planners",
        "Dedicated Residential IP proxies"
      ],
      btnText: "Go Enterprise Plan",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does Dripify authenticate LinkedIn profiles safely?",
      a: "Dripify uses secure token sessions (using the li_at browser cookie) combined with residential static custom proxies. It boots actual containerized Headless Chrome profiles with unique WebGL fingerprinters to mimic real human scrolling and typing patterns."
    },
    {
      q: "Is it possible to integrate AI tools with my custom webhook sync?",
      a: "Yes! Your Dripify campaign pipeline features complete webhook dispatch controls. It automatically transmits lead details, conversation replies, and sentiment analyses into Zapier, Make, or custom API endpoints in real-time."
    },
    {
      q: "Tell me more about Gemini message optimization.",
      a: "Our app is fully integrated on the Google Gemini 3.5 Flash server model. It automatically reviews your outreach sequence templates and active lead responses, analyzing objections and suggesting warm, conversational drafts designed for 2x performance."
    }
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen font-sans overflow-x-hidden selection:bg-indigo-600 selection:text-zinc-100" id="landing-page">
      
      {/* Visual Ambient Blur Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/75 border-b border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-zinc-100 shadow-lg shadow-indigo-500/10">
              D
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-100">
              Dripify <span className="text-zinc-500 font-medium text-xs">LinkedIn Outreach</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-semibold">
            <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-zinc-200 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-zinc-200 transition-colors">Safety FAQ</a>
          </nav>

          <button 
            onClick={onEnterApp}
            className="p-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center gap-1"
          >
            Launch Platform App
            <ChevronRight size={13} />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950/60 ring-1 ring-indigo-900 px-3.5 py-1 rounded-full">
            <Sparkles size={11} className="text-yellow-400" />
            Empowered with Gemini 3.5 Smart Models
          </span>
          
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight text-zinc-100">
            LinkedIn Outreach <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-gradient">Autopilot</span> on Steroids.
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Design multi-channel campaigns, warm sequence templates, residential proxies safely, and let Gemini craft expert, high-converting replies automatically. All under safe rate-limiting guardrails.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={onEnterApp}
              className="w-full sm:w-auto p-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Start Free Outreach Pilot
              <Zap size={13} />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto p-3 px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-800 transition-all flex items-center justify-center gap-1.5"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Floating Mock Preview Image Canvas container */}
        <div className="mt-16 bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl max-w-4xl mx-auto shadow-2xl relative">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl pointer-events-none" />
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden aspect-[16/10] flex flex-col">
            {/* Mock Dashboard Top-bar */}
            <div className="p-2 px-4 border-b border-zinc-900 flex items-center justify-between text-xs text-zinc-600 bg-zinc-950">
              <div className="flex items-center gap-1 rounded bg-zinc-900 p-0.5 px-2 border border-zinc-800 text-[10px]">
                <Monitor size={10} />
                https://dripifyoutreach.com/app/dashboard
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
              </div>
            </div>

            {/* Mock Dashboard preview layout */}
            <div className="flex-1 grid grid-cols-12 text-left bg-zinc-900/40 p-4 gap-4">
              {/* Sidebar mock */}
              <div className="col-span-3 border-r border-zinc-800 pr-3 space-y-3">
                <div className="h-4 bg-indigo-600/30 w-2/3 rounded-lg" />
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 bg-zinc-800 rounded" />
                  <div className="h-3.5 bg-indigo-950 border border-indigo-900/50 rounded" />
                  <div className="h-3.5 bg-zinc-800 rounded" />
                  <div className="h-3.5 bg-zinc-800 rounded" />
                </div>
              </div>

              {/* Main canvas mock */}
              <div className="col-span-9 flex flex-col justify-between gap-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80">
                    <span className="text-[8px] text-zinc-500 block uppercase font-bold text-[8px]">Invites Sent</span>
                    <span className="text-sm font-black text-indigo-400 mt-1 block">120</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80">
                    <span className="text-[8px] text-zinc-500 block uppercase font-bold text-[8px]">Acceptance</span>
                    <span className="text-sm font-black text-emerald-400 mt-1 block">64%</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80">
                    <span className="text-[8px] text-zinc-500 block uppercase font-bold text-[8px]">Replies</span>
                    <span className="text-sm font-black text-amber-500 mt-1 block">38%</span>
                  </div>
                </div>

                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[8px] text-zinc-500 font-bold uppercase pb-1.5 border-b border-zinc-900">
                    <span>Campaign: Enterprise SaaS CTOs</span>
                    <span className="text-emerald-400 font-semibold uppercase">Executing Batch</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="h-2.5 bg-zinc-800/40 rounded w-full" />
                    <div className="h-2.5 bg-zinc-800/40 rounded w-11/12" />
                    <div className="h-2.5 bg-zinc-800/40 rounded w-10/12" />
                  </div>
                  <div className="mt-2.5 p-2 bg-indigo-950/30 border border-indigo-900/40 rounded text-[9px] text-indigo-300 italic">
                    "Smart sequence generated with Gemini suggestions successfully mapped to current outbox queue"
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest block">Safe automation core</span>
          <h2 className="text-2xl lg:text-3xl font-black text-zinc-100 uppercase tracking-tight">Orchestrate Campaigns with Absolute Peace of Mind</h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">Minimize spam flags using our dedicated residential proxy mapping combined with modern multi-step drip delay safeguards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 text-left flex gap-4">
              <div className="p-3 bg-indigo-950/60 rounded-xl text-indigo-400 h-fit border border-indigo-500/25">
                <feat.icon size={18} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider">{feat.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="px-6 py-20 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest block">Premium pricing plan</span>
          <h2 className="text-2xl lg:text-3xl font-black text-zinc-100 uppercase tracking-tight">Flexible Seats Built for Smart Growth Teams</h2>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto">Ready to scale? Select your platform allocation and unlock unlimited multi-step sequencing automation instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pricingPlans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-3xl border text-left flex flex-col justify-between relative ${plan.popular ? 'bg-indigo-950/20 border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'bg-zinc-900/40 border-zinc-800'}`}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 bg-indigo-600 text-zinc-100 font-bold uppercase text-[8px] px-2.5 py-0.5 rounded-full tracking-wider">
                  Popular Plan
                </span>
              )}
              
              <div>
                <h3 className="font-bold text-zinc-100 text-sm uppercase tracking-wider">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mt-4 pb-6 border-b border-zinc-800/60">
                  <span className="text-3xl lg:text-4xl font-extrabold text-zinc-100">{plan.price}</span>
                  <span className="text-[10px] text-zinc-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 pt-6 text-xs text-zinc-400 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check size={14} className="text-indigo-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={onEnterApp}
                className={`w-full p-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-zinc-100' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'}`}
              >
                {plan.btnText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY FAQ */}
      <section id="faq" className="px-6 py-20 max-w-4xl mx-auto border-t border-zinc-900">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10.5px] font-bold text-indigo-400 uppercase tracking-widest block">Safety & compliance</span>
          <h2 className="text-2xl font-black text-zinc-100 uppercase tracking-tight">Expert Platform Dripify Safety FAQ</h2>
          <p className="text-xs text-zinc-400">Everything you need to know about keeping your accounts secure.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 bg-zinc-905/40 rounded-2xl border border-zinc-800 text-left space-y-2">
              <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertCircle size={14} className="text-indigo-400" />
                {faq.q}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed pr-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BLOCK */}
      <section className="bg-gradient-to-r from-indigo-950 via-zinc-950 to-indigo-950 py-20 border-t border-zinc-900 text-center relative px-6">
        <div className="max-w-2xl mx-auto space-y-6 relative">
          <h2 className="text-3xl font-black tracking-tight text-zinc-100 uppercase">Start Automating High-Value Lead Pipelines</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">Join growth builders scaling connection response pipelines on safe residential proxy anchors securely today.</p>
          <button 
            onClick={onEnterApp}
            className="p-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mx-auto"
          >
            Launch Outreach Platform App
            <Zap size={13} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-6 text-center text-xs text-zinc-600">
        <p>© 2026 Dripify Sandbox Platform. Empowered server-side with Google Gemini models. Built for high-growth executive teams.</p>
      </footer>

    </div>
  );
}
