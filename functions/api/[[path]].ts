// Catch-all Cloudflare Pages Functions API Router
// Automatically routes all incoming API requests to Cloudflare Pages edge workers natively.

interface Env {
  GEMINI_API_KEY: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  APP_URL?: string;
}

// Global edge database memory store to simulate persistence in Serverless Edge runtime
let edgeDB: any = null;

// Initial booster dataset to prevent empty DB and create rich playground environment
const initialDB: any = {
  accounts: [
    {
      id: "acc-1",
      connected: true,
      name: "Alex Mercer",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      headline: "Technical Recruiter @ ScaleUp | SaaS Growth Advisor | Ex-LinkedIn Insider",
      connectionsCount: 4218,
      sessionCookie: "li_at=AQEDATk72_8C82BMAAABk...; li_rm=AQEDATk...;",
      proxy: "US-West-1 (Premium Shared Proxy) - 104.244.72.109",
      proxyStatus: "verified",
      healthStatus: "healthy",
      isActive: true,
      rateLimits: {
        invitesPerDay: 40,
        messagesPerDay: 80,
        profileViewsPerDay: 50,
        humanDelayMinSec: 45,
        humanDelayMaxSec: 180
      }
    }
  ],
  campaigns: [
    {
      id: "camp-1",
      name: "Enterprise SaaS CTOs - Europe",
      status: 'active',
      leadsCount: 2,
      acceptanceRate: 64,
      replyRate: 38,
      conversionRate: 15,
      stats: {
        invitesSent: 120,
        invitesAccepted: 77,
        messagesSent: 77,
        repliesReceived: 29,
        emailsSent: 12,
        profilesViewed: 135
      },
      createdAt: "2026-05-10",
      steps: [
        { id: "step-1-1", type: "visit_profile", delayDays: 0 },
        { id: "step-1-2", type: "send_invite", delayDays: 1, messageTemplate: "Hi {{firstName}}, clicked on your profile and loved your work in building engineering pipelines at {{company}}. Would love to connect and share some thoughts." },
        { id: "step-1-3", type: "wait", delayDays: 2 },
        { id: "step-1-4", type: "send_message", delayDays: 0, messageTemplate: "Thanks for connecting {{firstName}}! I've been researching scaling bottlenecks in {{company}}'s hub, and wrote a quick report on visual flow modeling. Let me know if you want to look at it." },
        { id: "step-1-5", type: "wait", delayDays: 4 },
        { id: "step-1-6", type: "send_followup", delayDays: 0, messageTemplate: "Hey {{firstName}}, I'm sure you are super busy. Quick post here: did you find a solution to that deployment latency hurdle last quarter? Happy to share some tips." }
      ]
    },
    {
      id: "camp-2",
      name: "AI Startup Advisors Recruitment",
      status: 'active',
      leadsCount: 1,
      acceptanceRate: 72,
      replyRate: 46,
      conversionRate: 22,
      stats: {
        invitesSent: 80,
        invitesAccepted: 58,
        messagesSent: 58,
        repliesReceived: 27,
        emailsSent: 0,
        profilesViewed: 90
      },
      createdAt: "2026-05-18",
      steps: [
        { id: "step-2-1", type: "visit_profile", delayDays: 0 },
        { id: "step-2-2", type: "send_invite", delayDays: 1, messageTemplate: "Hi {{firstName}}, your background in advising AI accelerators is incredible. Building a new product and looking for smart builders to have on our advisory board. Let's connect!" },
        { id: "step-2-3", type: "wait", delayDays: 3 },
        { id: "step-2-4", type: "send_message", delayDays: 0, messageTemplate: "Hi again! We are scaling our real-time synchronization suite and looking for a 30-min advise call. Compensation is private equity shares. Let me know!" }
      ]
    },
    {
      id: "camp-3",
      name: "Y-Combinator Founders S25 Outreach",
      status: 'paused',
      leadsCount: 1,
      acceptanceRate: 48,
      replyRate: 22,
      conversionRate: 8,
      stats: {
        invitesSent: 100,
        invitesAccepted: 48,
        messagesSent: 48,
        repliesReceived: 11,
        emailsSent: 30,
        profilesViewed: 110
      },
      createdAt: "2026-05-02",
      steps: [
        { id: "step-3-1", type: "visit_profile", delayDays: 0 },
        { id: "step-3-2", type: "send_invite", delayDays: 1, messageTemplate: "Congrats on launching {{company}} at YC! Super exciting space. Let's connect!" },
        { id: "step-3-3", type: "wait", delayDays: 2 },
        { id: "step-3-4", type: "send_message", delayDays: 0, messageTemplate: "Hey {{firstName}}, noticed your tech stack uses Node/React. We help YC startups integrate low-latency telemetry databases in 1 hour." },
        { id: "step-3-5", type: "wait", delayDays: 3 },
        { id: "step-3-6", type: "send_email", delayDays: 0, messageTemplate: "Hey {{firstName}}, following up via email. We would love to support {{company}} with a $10k free platform credit.", subject: "Intro: High-Perf Telemetry Credit for {{company}}" }
      ]
    }
  ],
  leads: [
    {
      id: "lead-1",
      campaignId: "camp-1",
      campaignName: "Enterprise SaaS CTOs - Europe",
      name: "Marcus Aurelius",
      title: "Chief Technology Officer",
      company: "Roma Tech Studios",
      location: "Milan, Italy",
      linkedinUrl: "https://www.linkedin.com/in/marcus-aurelius-roma-tech/",
      email: "marcus@romatech.io",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      stage: 'replied',
      tags: ["High Value", "Tech Lead"],
      notes: "Very interested in Roma Tech database sync report. Requested pricing model for 25 nodes setup.",
      lastInteractionAt: "2026-05-28T18:30:00Z",
      activities: [
        { id: "act-1", type: "import", timestamp: "2026-05-10T09:00:00Z", description: "Lead discovered and imported from LinkedIn Search" },
        { id: "act-2", type: "visit", timestamp: "2026-05-11T10:15:00Z", description: "Automated profile visit simulated successfully" },
        { id: "act-3", type: "invite_sent", timestamp: "2026-05-12T11:42:00Z", description: "Connection invite sent with customized template" },
        { id: "act-4", type: "invite_accepted", timestamp: "2026-05-13T14:20:00Z", description: "Marcus accepted the invitation" },
        { id: "act-5", type: "message_sent", timestamp: "2026-05-13T15:00:00Z", description: "Follow-up message on visual flow modeling sent" },
        { id: "act-6", type: "reply_received", timestamp: "2026-05-28T18:30:00Z", description: "Received LinkedIn Reply: 'Hey! Sounds intriguing. Send me the visual report.'" }
      ]
    },
    {
      id: "lead-2",
      campaignId: "camp-1",
      campaignName: "Enterprise SaaS CTOs - Europe",
      name: "Sophie Dubois",
      title: "VP of Engineering & Architecture",
      company: "Lumière Hub",
      location: "Paris, France",
      linkedinUrl: "https://www.linkedin.com/in/sophie-dubois-lumiere/",
      email: "sophie.dubois@lumierehub.com",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      stage: 'connected',
      tags: ["Eng Leader", "Inbound Interest"],
      notes: "Accepted invite. Haven't replied to the automated message yet. Recommended wait and personal ping.",
      lastInteractionAt: "2026-05-25T11:20:00Z",
      activities: [
        { id: "act-7", type: "import", timestamp: "2026-05-10T09:00:00Z", description: "Lead imported from French Tech Lead directory" },
        { id: "act-8", type: "visit", timestamp: "2026-05-11T10:25:00Z", description: "Automated profile visit completed" },
        { id: "act-9", type: "invite_sent", timestamp: "2026-05-12T11:45:00Z", description: "Connection request sent" },
        { id: "act-10", type: "invite_accepted", timestamp: "2026-05-25T11:20:00Z", description: "Sophie accepted connection request" }
      ]
    },
    {
      id: "lead-3",
      campaignId: "camp-2",
      campaignName: "AI Startup Advisors Recruitment",
      name: "Richard Feynman",
      title: "Senior AI Researcher",
      company: "QuantumNeural Ltd",
      location: "London, UK",
      linkedinUrl: "https://www.linkedin.com/in/richard-feynman-quantum/",
      email: "r.feynman@quantumneural.com",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      stage: 'replied',
      tags: ["AI Heavyweight", "Advisor Prospect"],
      notes: "Feynman is interested in our custom GPU pooling. Asked about the equity split.",
      lastInteractionAt: "2026-05-29T05:12:00Z",
      activities: [
        { id: "act-11", type: "import", timestamp: "2026-05-18T14:00:00Z", description: "Lead imported from AI Researcher directory" },
        { id: "act-12", type: "visit", timestamp: "2026-05-19T09:12:00Z", description: "Automated profile visit simulated" },
        { id: "act-13", type: "invite_sent", timestamp: "2026-05-20T10:30:00Z", description: "Connection invite sent" },
        { id: "act-14", type: "invite_accepted", timestamp: "2026-05-21T08:15:00Z", description: "Richard accepted on LinkedIn" },
        { id: "act-15", type: "message_sent", timestamp: "2026-05-21T11:00:00Z", description: "Offered advisor position on advisory board with equity parameters" },
        { id: "act-16", type: "reply_received", timestamp: "2026-05-29T05:12:00Z", description: "Richard replied: 'Sounds intriguing. Let's see your advisory governance framework. Do you guys support multi-tenant distributed clusters?'" }
      ]
    },
    {
      id: "lead-4",
      campaignId: "camp-3",
      campaignName: "Y-Combinator Founders S25 Outreach",
      name: "Nikhil Gupta",
      title: "Co-Founder & CEO",
      company: "ByteCraft AI",
      location: "San Francisco, CA",
      linkedinUrl: "https://www.linkedin.com/in/nikhilgupta-bytecode/",
      email: "nikhil@bytecraft.ai",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      stage: 'converted',
      tags: ["YC S25", "Deal Closed"],
      notes: "Fully signed up for our real-time synchronization trial. 10k credits successfully deployed.",
      lastInteractionAt: "2026-05-27T16:40:00Z",
      activities: [
        { id: "act-17", type: "import", timestamp: "2026-05-02T13:00:00Z", description: "Lead imported from Y-Combinator Directory list" },
        { id: "act-18", type: "visit", timestamp: "2026-05-03T11:45:00Z", description: "Automated profile visit completed" },
        { id: "act-19", type: "invite_sent", timestamp: "2026-05-04T10:20:00Z", description: "Connection invite sent" },
        { id: "act-20", type: "invite_accepted", timestamp: "2026-05-09T09:30:00Z", description: "Nikhil accepted invitation" },
        { id: "act-21", type: "message_sent", timestamp: "2026-05-09T14:15:00Z", description: "Telemetry scaling pitch message sent" },
        { id: "act-22", type: "email_sent", timestamp: "2026-05-12T15:30:00Z", description: "Sent 10k credit offer via email" },
        { id: "act-23", type: "reply_received", timestamp: "2026-05-26T14:40:00Z", description: "Nikhil replied: 'Yes! We would love to try the database sync framework. Setup this week?'" },
        { id: "act-24", type: "note_added", timestamp: "2026-05-27T16:40:00Z", description: "Deal agreed. Switched status to Converted." }
      ]
    }
  ],
  chatMessages: [
    {
      id: "msg-1-1",
      leadId: "lead-1",
      sender: 'user',
      text: "Hi Marcus, clicked on your profile and loved your work in building engineering pipelines at Roma Tech Studios. Would love to connect and share some thoughts.",
      timestamp: "2026-05-12T11:42:00Z",
      channel: 'linkedin',
      read: true
    },
    {
      id: "msg-1-2",
      leadId: "lead-1",
      sender: 'user',
      text: "Thanks for connecting Marcus! I've been researching scaling bottlenecks in Roma Tech Studios's hub, and wrote a quick report on visual flow modeling. Let me know if you want to look at it.",
      timestamp: "2026-05-13T15:00:00Z",
      channel: 'linkedin',
      read: true
    },
    {
      id: "msg-1-3",
      leadId: "lead-1",
      sender: 'lead',
      text: "Hey! Sounds intriguing. Send me the visual report.",
      timestamp: "2026-05-28T18:30:00Z",
      channel: 'linkedin',
      read: false
    },
    {
      id: "msg-3-1",
      leadId: "lead-3",
      sender: 'user',
      text: "Hi Richard, your background in advising AI accelerators is incredible. Building a new product and looking for smart builders to have on our advisory board. Let's connect!",
      timestamp: "2026-05-20T10:30:00Z",
      channel: 'linkedin',
      read: true
    },
    {
      id: "msg-3-2",
      leadId: "lead-3",
      sender: 'user',
      text: "Hi again! We are scaling our real-time synchronization suite and looking for a 30-min advise call. Compensation is private equity shares. Let me know!",
      timestamp: "2026-05-21T11:00:00Z",
      channel: 'linkedin',
      read: true
    },
    {
      id: "msg-3-3",
      leadId: "lead-3",
      sender: 'lead',
      text: "Sounds intriguing. Let's see your advisory governance framework. Do you guys support multi-tenant distributed clusters?",
      timestamp: "2026-05-29T05:12:00Z",
      channel: 'linkedin',
      read: false
    }
  ],
  teamMembers: [
    {
      id: "team-1",
      name: "Alex Mercer",
      email: "alex@dripifyoutreach.com",
      role: "owner",
      status: 'active',
      joinedAt: "2026-01-15"
    },
    {
      id: "team-2",
      name: "Jessica Vance",
      email: "jessica@dripifyoutreach.com",
      role: "admin",
      status: 'active',
      joinedAt: "2026-03-02"
    },
    {
      id: "team-3",
      name: "Tom Hardy",
      email: "tom@dripifyoutreach.com",
      role: "member",
      status: 'invited',
      joinedAt: "2026-05-25"
    }
  ],
  integrations: {
    zapierWebhookUrl: "https://hooks.zapier.com/hooks/catch/12345/abcde",
    googleCalendarSync: true,
    hubspotSync: false,
    salesforceSync: false,
    customWebhookActive: true,
    customWebhookUrl: "https://yourdomain.com/webhooks/linkedin"
  },
  automationLogs: [
    { timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), level: "info", message: "Browser profile session validated successfully for 'Alex Mercer'." },
    { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), level: "info", message: "Starting campaign batch check for 'Enterprise SaaS CTOs - Europe'" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), level: "info", message: "Target page loaded: https://www.linkedin.com/in/marcus-aurelius-roma-tech/" },
    { timestamp: new Date().toISOString(), level: "info", message: "Automation worker active. Listening for outreach sequence actions..." }
  ]
};

// Database load-and-save helper inside worker isolate context
function getOrCreateDB() {
  if (!edgeDB) {
    edgeDB = JSON.parse(JSON.stringify(initialDB));
  }
  return edgeDB;
}

// B2B Dynamic database generation schema (uppercase types for direct API compatibility)
const edgeDbBoostSchema = {
  type: "OBJECT",
  properties: {
    campaigns: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          name: { type: "STRING" },
          status: { type: "STRING" },
          leadsCount: { type: "INTEGER" },
          acceptanceRate: { type: "INTEGER" },
          replyRate: { type: "INTEGER" },
          conversionRate: { type: "INTEGER" },
          stats: {
            type: "OBJECT",
            properties: {
              invitesSent: { type: "INTEGER" },
              invitesAccepted: { type: "INTEGER" },
              messagesSent: { type: "INTEGER" },
              repliesReceived: { type: "INTEGER" },
              emailsSent: { type: "INTEGER" },
              profilesViewed: { type: "INTEGER" }
            },
            required: ["invitesSent", "invitesAccepted", "messagesSent", "repliesReceived", "emailsSent", "profilesViewed"]
          },
          createdAt: { type: "STRING" },
          steps: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                type: { type: "STRING" },
                delayDays: { type: "INTEGER" },
                messageTemplate: { type: "STRING" }
              },
              required: ["id", "type", "delayDays", "messageTemplate"]
            }
          }
        },
        required: ["id", "name", "status", "leadsCount", "acceptanceRate", "replyRate", "conversionRate", "stats", "createdAt", "steps"]
      }
    },
    leads: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          campaignId: { type: "STRING" },
          campaignName: { type: "STRING" },
          name: { type: "STRING" },
          title: { type: "STRING" },
          company: { type: "STRING" },
          location: { type: "STRING" },
          linkedinUrl: { type: "STRING" },
          email: { type: "STRING" },
          avatarUrl: { type: "STRING" },
          stage: { type: "STRING" },
          tags: { type: "ARRAY", items: { type: "STRING" } },
          notes: { type: "STRING" },
          activities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                type: { type: "STRING" },
                timestamp: { type: "STRING" },
                description: { type: "STRING" }
              },
              required: ["id", "type", "timestamp", "description"]
            }
          },
          lastInteractionAt: { type: "STRING" }
        },
        required: ["id", "campaignId", "campaignName", "name", "title", "company", "location", "linkedinUrl", "email", "avatarUrl", "stage", "tags", "notes", "activities", "lastInteractionAt"]
      }
    },
    chatMessages: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          leadId: { type: "STRING" },
          sender: { type: "STRING" },
          text: { type: "STRING" },
          timestamp: { type: "STRING" },
          channel: { type: "STRING" },
          read: { type: "BOOLEAN" }
        },
        required: ["id", "leadId", "sender", "text", "timestamp", "channel", "read"]
      }
    }
  },
  required: ["campaigns", "leads", "chatMessages"]
};

// Helper to interact with the raw Gemini API over HTTP Fetch (safe for Edge runtime)
async function fetchGemini(
  prompt: string,
  instruction: string,
  apiKey: string,
  jsonSchema?: any
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add this in your Cloudflare Pages Variables setting.");
  }

  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const requestBody: any = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
        },
        systemInstruction: {
          parts: [
            { text: instruction }
          ]
        }
      };

      if (jsonSchema) {
        requestBody.generationConfig.responseMimeType = "application/json";
        requestBody.generationConfig.responseSchema = jsonSchema;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google Gemini Server API responded with status ${response.status}: ${errText}`);
      }

      const data: any = await response.json();
      const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOut) {
        throw new Error("Empty candidate result returned from Gemini API");
      }

      return textOut.trim();
    } catch (err: any) {
      console.warn(`Model ${modelName} in edge failed. Error:`, err.message || err);
      lastError = err;
    }
  }

  throw new Error(
    `All available Gemini models failover options exhausted on Edge. Last error: ${lastError?.message || lastError}`
  );
}

// CORS Headers helper for Cloudflare native handling
function makeResponse(data: any, status = 200, isHtml = false): Response {
  return new Response(isHtml ? data : JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": isHtml ? "text/html; charset=utf-8" : "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }
  });
}

// Handling Preflights
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }
  });
};

export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const method = context.request.method;

  try {
    // A. REST DB: Get database snapshot
    if (path === "/api/db/get" && method === "GET") {
      const db = getOrCreateDB();
      return makeResponse(db);
    }

    // B. REST DB: Save database state
    if (path === "/api/db/save" && method === "POST") {
      const body: any = await context.request.json();
      const db = getOrCreateDB();

      if (body.accounts) db.accounts = body.accounts;
      if (body.campaigns) db.campaigns = body.campaigns;
      if (body.leads) db.leads = body.leads;
      if (body.chatMessages) db.chatMessages = body.chatMessages;
      if (body.teamMembers) db.teamMembers = body.teamMembers;
      if (body.integrations) db.integrations = body.integrations;
      if (body.automationLogs) db.automationLogs = body.automationLogs;

      return makeResponse({ status: "success", db });
    }

    // C. OAUTH: Initiate LinkedIn OAuth 2.0 URL
    if ((path === "/api/auth/linkedin/url" || path === "/api/connect/li/url") && method === "GET") {
      const isNew = path.includes("/connect/li");
      const clientId = context.env.LINKEDIN_CLIENT_ID || "86ufehp1ori1dk";
      const redirectUri = isNew ? `${url.origin}/api/connect/li/callback` : `${url.origin}/api/auth/linkedin/callback`;
      
      const originParam = url.searchParams.get("origin") || url.origin;
      const stateObj = {
        origin: originParam,
        csrf: Math.random().toString(36).substring(2, 15)
      };
      const state = btoa(JSON.stringify(stateObj));

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state,
        scope: "openid profile email"
      });

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      return makeResponse({ url: authUrl });
    }

    // D. OAUTH: Verify OAuth Credentials Status
    if ((path === "/api/auth/linkedin/status" || path === "/api/connect/li/status") && method === "GET") {
      const clientId = context.env.LINKEDIN_CLIENT_ID || "86ufehp1ori1dk";
      const clientSecret = context.env.LINKEDIN_CLIENT_SECRET || "WPL_AP1.kn9mlO61okp7KkbX.bqENMg==";
      return makeResponse({
        status: "ok",
        hasClientId: !!clientId,
        clientIdLength: clientId ? clientId.length : 0,
        hasClientSecret: !!clientSecret,
        clientSecretLength: clientSecret ? clientSecret.length : 0,
        appUrl: context.env.APP_URL || url.origin,
        nodeEnv: "production"
      });
    }

    // DX. OAUTH: LinkedIn Secure Post Exchange route for client-side routing fallback compatibility (supports trailing slash)
    if ((path === "/api/auth/linkedin/exchange" || path === "/api/auth/linkedin/exchange/" || path === "/api/connect/li/exchange" || path === "/api/connect/li/exchange/") && method === "POST") {
      try {
        const body: any = await context.request.json();
        const { code, state: stateParam } = body;

        if (!code) {
          return makeResponse({ error: "Authorization code missing from POST body request." }, 400);
        }

        let parentOrigin = url.origin;
        try {
          if (stateParam) {
            const decoded = JSON.parse(atob(stateParam));
            if (decoded && decoded.origin) {
              parentOrigin = decoded.origin;
            }
          }
        } catch (e) {
          console.warn("Could not decode state origin on Cloudflare Edge during posture exchange:", e);
          if (stateParam && (stateParam.startsWith("http://") || stateParam.startsWith("https://"))) {
            parentOrigin = stateParam;
          }
        }

        const isNew = true;
        const clientId = context.env.LINKEDIN_CLIENT_ID || "86ufehp1ori1dk";
        const clientSecret = context.env.LINKEDIN_CLIENT_SECRET || "WPL_AP1.kn9mlO61okp7KkbX.bqENMg==";
        const redirectUri = isNew ? `${url.origin}/api/connect/li/callback` : `${url.origin}/api/auth/linkedin/callback`;

        // Exchange code for Access Token
        const tokenParams = new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        });

        const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenParams.toString()
        });

        if (!tokenResponse.ok) {
          const errBody = await tokenResponse.text();
          return makeResponse({ error: `LinkedIn Token exchange failed: ${errBody}` }, 400);
        }

        const tokenData: any = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user profile info
        const userinfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });

        let profileName = "LinkedIn User";
        let email = "oauth-user@linkedin.com";
        let avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
        let headline = "LinkedIn Professional (OAuth Authenticated)";

        if (userinfoResponse.ok) {
          const userInfo: any = await userinfoResponse.json();
          profileName = `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim() || profileName;
          email = userInfo.email || email;
          avatarUrl = userInfo.picture || avatarUrl;
        }

        // Add to our edge database snapshot
        const db = getOrCreateDB();
        const newAccountId = `acc-oauth-${Date.now()}`;
        const newAccount = {
          id: newAccountId,
          connected: true,
          name: profileName,
          avatarUrl: avatarUrl,
          headline: headline,
          connectionsCount: 500,
          sessionCookie: "oauth-authenticated-token",
          proxy: "Direct OAuth Connected (No proxy node required)",
          proxyStatus: "verified",
          healthStatus: "healthy",
          isActive: true,
          rateLimits: {
            invitesPerDay: 40,
            messagesPerDay: 80,
            profileViewsPerDay: 50,
            humanDelayMinSec: 45,
            humanDelayMaxSec: 180
          }
        };

        // Deactivate all old and add this
        db.accounts.forEach((acc: any) => { acc.isActive = false; });
        db.accounts.push(newAccount);

        db.automationLogs.push({
          timestamp: new Date().toISOString(),
          level: "success",
          message: `LinkedIn Profile '${profileName}' successfully linked via OAuth 2.0 exchange!`
        });

        return makeResponse({ status: "success", name: profileName, avatarUrl, headline });
      } catch (err: any) {
        console.error("LinkedIn OAuth POST Exchange error on Edge:", err);
        return makeResponse({ error: err.message || "An unexpected error occurred during state validation." }, 500);
      }
    }

    // E. OAUTH: LinkedIn Callback verification endpoint
    if ((path === "/api/auth/linkedin/callback" || path === "/api/auth/linkedin/callback/" || path === "/api/connect/li/callback" || path === "/api/connect/li/callback/") && method === "GET") {
      const linkedinError = url.searchParams.get("error");
      const linkedinErrorDesc = url.searchParams.get("error_description");
      const code = url.searchParams.get("code");
      const stateParam = url.searchParams.get("state") || "";

      if (linkedinError) {
        return makeResponse(`
          <html>
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #09090b; color: #f4f4f5; margin: 0;">
              <div style="text-align: center; border: 1px solid #27272a; padding: 2rem; border-radius: 1rem; background: #18181b; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <h3 style="color: #ef4444; margin-top: 0;">OAuth Connection Failed</h3>
                <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6;">${linkedinErrorDesc || linkedinError}</p>
                <button onclick="window.close()" style="background: #3f3f46; color: #fff; border: 0; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-top: 1rem; font-weight: 600;">Close Window</button>
              </div>
            </body>
          </html>
        `, 200, true);
      }

      if (!code) {
        return makeResponse("Authorization code missing from LinkedIn redirection query.", 400, true);
      }

      let parentOrigin = url.origin;
      try {
        if (stateParam) {
          const decoded = JSON.parse(atob(stateParam));
          if (decoded && decoded.origin) {
            parentOrigin = decoded.origin;
          }
        }
      } catch (e) {
        console.warn("Could not decode state origin on Cloudflare Edge:", e);
        if (stateParam && (stateParam.startsWith("http://") || stateParam.startsWith("https://"))) {
          parentOrigin = stateParam;
        }
      }

      const isNew = path.includes("/connect/li");
      const clientId = context.env.LINKEDIN_CLIENT_ID || "86ufehp1ori1dk";
      const clientSecret = context.env.LINKEDIN_CLIENT_SECRET || "WPL_AP1.kn9mlO61okp7KkbX.bqENMg==";
      const redirectUri = isNew ? `${url.origin}/api/connect/li/callback` : `${url.origin}/api/auth/linkedin/callback`;

      // Exchange code for Access Token
      const tokenParams = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      });

      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenParams.toString()
      });

      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.text();
        throw new Error(`LinkedIn Token exchange failed: ${errBody}`);
      }

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch user profile info
      const userinfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });

      let profileName = "LinkedIn User";
      let email = "oauth-user@linkedin.com";
      let avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
      let headline = "LinkedIn Professional (OAuth Authenticated)";

      if (userinfoResponse.ok) {
        const userInfo: any = await userinfoResponse.json();
        profileName = `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim() || profileName;
        email = userInfo.email || email;
        avatarUrl = userInfo.picture || avatarUrl;
      }

      // Add to our edge database snapshot
      const db = getOrCreateDB();
      const newAccountId = `acc-oauth-${Date.now()}`;
      const newAccount = {
        id: newAccountId,
        connected: true,
        name: profileName,
        avatarUrl: avatarUrl,
        headline: headline,
        connectionsCount: 500,
        sessionCookie: "oauth-authenticated-token",
        proxy: "Direct OAuth Connected (No proxy node required)",
        proxyStatus: "verified",
        healthStatus: "healthy",
        isActive: true,
        rateLimits: {
          invitesPerDay: 40,
          messagesPerDay: 80,
          profileViewsPerDay: 50,
          humanDelayMinSec: 45,
          humanDelayMaxSec: 180
        }
      };

      // Deactivate all old and add this
      db.accounts.forEach((acc: any) => { acc.isActive = false; });
      db.accounts.push(newAccount);

      db.automationLogs.push({
        timestamp: new Date().toISOString(),
        level: "success",
        message: `LinkedIn Profile '${profileName}' successfully linked via OAuth 2.0!`
      });

      return makeResponse(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #09090b; color: #f4f4f5; margin: 0;">
            <div style="text-align: center; border: 1px solid #27272a; padding: 2.5rem; border-radius: 1rem; background: #18181b; max-width: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              <div style="color: #22c55e; font-size: 40px; margin-bottom: 0.5rem; line-height: 1;">✓</div>
              <h3 style="color: #22c55e; margin-top: 0;">Connection Successful!</h3>
              <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6;">Your LinkedIn account <strong>${profileName}</strong> is now securely connected.</p>
              <p style="font-size: 11px; color: #71717a; margin-top: 1.5rem;">Redirecting you back to your secured workspace...</p>
              <script>
                const parentOrigin = "${parentOrigin}";
                // Attempt standard postMessage callback
                try {
                  if (window.opener) {
                    window.opener.postMessage({ type: "LINKEDIN_OAUTH_SUCCESS", name: "${profileName}" }, "*");
                  }
                } catch (e) {}

                // Universal cross-origin fallback redirect
                setTimeout(() => {
                  window.location.href = parentOrigin + "/?linkedin_oauth_success=true&name=" + encodeURIComponent("${profileName}");
                }, 1800);
              </script>
            </div>
          </body>
        </html>
      `, 200, true);
    }

    function generateProceduralDataset(targetIndustry: string) {
      const normalized = targetIndustry.toLowerCase();
      
      let campaign1Name = `Decision Makers in ${targetIndustry}`;
      let campaign2Name = `Warm Outbound Escalation: ${targetIndustry}`;
      
      let step1Template = `Hi {{firstName}}, love your focus at {{company}}. Would love to compare notes on scaling B2B outreach in our fields. Let's connect!`;
      let step2Template = `Thanks for connecting {{firstName}}! Are you guys currently experiencing any bottlenecks in acquiring qualified pipelines for {{company}}? We have been seeing 2x meetings booked.`;
      
      let lead1Name = "Sarah Jenkins";
      let lead1Title = `VP of Growth & Pipeline`;
      let lead1Company = "ScaleFlow Media";
      let lead1Location = "San Francisco, USA";
      let lead1Notes = "Requested a case study on B2B campaign response rates.";
      let lead1Reply = "Hey! Thanks for the connection request. Curious to see how you achieve 2x booking rates. Do you have a quick case study or a 1-pager?";
      
      let lead2Name = "Alexander Hoffman";
      let lead2Title = `Director of Acquisitions`;
      let lead2Company = "Apex Capital Group";
      let lead2Location = "Austin, USA";
      let lead2Notes = "Highly active in direct acquisition pipelines.";
      let lead2Msg = "Hi Alexander, custom intro sent. Let me know if you would be open to chat.";
    
      let lead3Name = "Elena Rostova";
      let lead3Title = `Chief Executive Officer`;
      let lead3Company = "Nova Ventures";
      let lead3Location = "Miami, USA";
      let lead3Notes = "Agreed to calendar invite for this upcoming Thursday at 2PM.";
      let lead3Reply = "Let's do it. Thursday at 2 PM works. Here's my direct coordinate or send a calendar invite.";
    
      let lead4Name = "Marcus Thorne";
      let lead4Title = `Product Line Architect`;
      let lead4Company = "CoreSystems Inc";
      let lead4Location = "Chicago, USA";
      let lead4Notes = "Imported candidate lead. Preparing automated sequence campaign profile view.";
    
      if (normalized.includes("founder") || normalized.includes("cto") || normalized.includes("software")) {
        campaign1Name = `Tech Founders & High-Growth CTOs`;
        step1Template = `Hi {{firstName}}, respect your technical scale at {{company}}. We've been analyzing software workflow pipelines. Let's connect!`;
        step2Template = `Thanks for connecting {{firstName}}! Out of curiosity, which tech stack/orchestrator is {{company}} using to sync core pipeline tasks under heavy load? We built a zero-latency client.`;
        
        lead1Name = "Dave MacLeod";
        lead1Title = "Co-Founder & CTO";
        lead1Company = "HyperThread Solutions";
        lead1Location = "Seattle, USA";
        lead1Notes = "Very curious about our zero-latency pipeline engine. Asked if it supports TypeScript integration.";
        lead1Reply = "Hey! Interesting value prop on zero-latency sync. Does your system support native TypeScript and custom SDK overrides right out of the box?";
        
        lead3Name = "Clara Vance";
        lead3Title = "VP of Technical Infrastructure";
        lead3Company = "Synapse AI";
        lead3Location = "Boston, USA";
        lead3Notes = "Booking confirmed for technical demo session on Friday 10 AM.";
        lead3Reply = "Sounds like what we are building. Send me a calendar invite for Friday 10 AM EST - clara@synapse.ai.";
      } else if (normalized.includes("e-commerce") || normalized.includes("brand") || normalized.includes("digital")) {
        campaign1Name = `DTC Founders & E-Commerce Brand Owners`;
        step1Template = `Hi {{firstName}}, your digital brand looks magnificent. Keen on tracking DTC growth tactics. Let's connect!`;
        step2Template = `Thanks for connecting {{firstName}}! Are you primarily acquiring clients for {{company}} via paid traffic or direct organic outreach sequences? We helped a brand scale to $140k MRR.`;
        
        lead1Name = "Gabriella Silva";
        lead1Title = "Founder & Creative Principal";
        lead1Company = "LuxeSkin Labs";
        lead1Location = "Los Angeles, USA";
        lead1Notes = "Interested in our direct outreach strategies. Asked for a reference brand.";
        lead1Reply = "Hello! Love the outreach. We are running mostly Meta Ads currently, but seeking organic scale. Do you have examples of fashion/wellness brands you worked with?";
        
        lead3Name = "Ben Thompson";
        lead3Title = "eCom Marketing Lead";
        lead3Company = "BrewBottle Mug";
        lead3Location = "Denver, USA";
        lead3Notes = "Agreed to review our DTC outreach playbook on a call next Wednesday.";
        lead3Reply = "This is timely as we are preparing Q4 campaigns. Let's have a brief call next Wednesday at 3 PM.";
      } else if (normalized.includes("venture") || normalized.includes("angel") || normalized.includes("investor") || normalized.includes("capital")) {
        campaign1Name = `Venture Capitalists & Angel Partners`;
        step1Template = `Hi {{firstName}}, great focus on early-stage founders. Love to connect and share high-potential dealflows.`;
        step2Template = `Hi {{firstName}}, do you guys currently look at SaaS scaling workflows or toolings at {{company}}? Happy to send a pitch stack.`;
        
        lead1Name = "Arjun Mehta";
        lead1Title = "Investment Partner";
        lead1Company = "WestCoast Ventures";
        lead1Location = "Silicon Valley, USA";
        lead1Notes = "Requested the platform overview presentation and user metrics document.";
        lead1Reply = "Hi, useful thesis. Send over your pitch deck and current metrics. We invest in early-stage SaaS workflow structures.";
      }
    
      return {
        campaigns: [
          {
            id: "camp_gen_1",
            name: campaign1Name,
            status: "active",
            leadsCount: 2,
            acceptanceRate: 72,
            replyRate: 44,
            conversionRate: 20,
            stats: {
              invitesSent: 120,
              invitesAccepted: 86,
              messagesSent: 86,
              repliesReceived: 38,
              emailsSent: 0,
              profilesViewed: 154
            },
            createdAt: new Date().toISOString().split('T')[0],
            steps: [
              { id: "step_gen_1_1", type: "visit_profile", delayDays: 0, messageTemplate: "" },
              { id: "step_gen_1_2", type: "send_invite", delayDays: 1, messageTemplate: step1Template },
              { id: "step_gen_1_3", type: "wait", delayDays: 2, messageTemplate: "" },
              { id: "step_gen_1_4", type: "send_message", delayDays: 0, messageTemplate: step2Template }
            ]
          },
          {
            id: "camp_gen_2",
            name: campaign2Name,
            status: "paused",
            leadsCount: 2,
            acceptanceRate: 58,
            replyRate: 25,
            conversionRate: 10,
            stats: {
              invitesSent: 50,
              invitesAccepted: 29,
              messagesSent: 29,
              repliesReceived: 7,
              emailsSent: 15,
              profilesViewed: 70
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
            steps: [
              { id: "step_gen_2_1", type: "visit_profile", delayDays: 0, messageTemplate: "" },
              { id: "step_gen_2_2", type: "send_invite", delayDays: 1, messageTemplate: `Hi {{firstName}}, noticed you look after business development at {{company}}. Let's connect.` },
              { id: "step_gen_2_3", type: "wait", delayDays: 2, messageTemplate: "" },
              { id: "step_gen_2_4", type: "send_message", delayDays: 0, messageTemplate: `Hey {{firstName}}, sent an invite earlier. Hope we can explore synergies across ${targetIndustry} soon.` }
            ]
          }
        ],
        leads: [
          {
            id: "lead_gen_1",
            campaignId: "camp_gen_1",
            campaignName: campaign1Name,
            name: lead1Name,
            title: `${lead1Title} @ ${lead1Company}`,
            company: lead1Company,
            location: lead1Location,
            linkedinUrl: `https://www.linkedin.com/in/${lead1Name.toLowerCase().replace(/\s+/g, '-')}/`,
            email: `info@${lead1Company.toLowerCase().replace(/\s+/g, '')}.com`,
            avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            stage: "replied",
            tags: ["Hot Lead", "High Intent"],
            notes: lead1Notes,
            lastInteractionAt: new Date().toISOString(),
            activities: [
              { id: `act_g_1`, type: "import", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), description: "Lead discovered via targeted Search queries" },
              { id: `act_g_2`, type: "visit", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), description: "Simulated browser node profile visit" },
              { id: `act_g_3`, type: "invite_sent", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: "LinkedIn outreach invitation sent" },
              { id: `act_g_4`, type: "invite_accepted", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: "Accepted connection request" },
              { id: `act_g_5`, type: "message_sent", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), description: "Automated sequence prompt message triggered" },
              { id: `act_g_6`, type: "reply_received", timestamp: new Date().toISOString(), description: `Received message: "${lead1Reply.substring(0, 40)}..."` }
            ]
          },
          {
            id: "lead_gen_2",
            campaignId: "camp_gen_1",
            campaignName: campaign1Name,
            name: lead2Name,
            title: `${lead2Title} @ ${lead2Company}`,
            company: lead2Company,
            location: lead2Location,
            linkedinUrl: `https://www.linkedin.com/in/${lead2Name.toLowerCase().replace(/\s+/g, '-')}/`,
            email: `contact@${lead2Company.toLowerCase().replace(/\s+/g, '')}.com`,
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            stage: "connected",
            tags: ["Sequence Active"],
            notes: lead2Notes,
            lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            activities: [
              { id: `act_g_7`, type: "import", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), description: "Lead discovered" },
              { id: `act_g_8`, type: "visit", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), description: "Residential node navigated profile" },
              { id: `act_g_9`, type: "invite_sent", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: "Connection request transmitted successfully" },
              { id: `act_g_10`, type: "invite_accepted", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: "Accepted our invitation" }
            ]
          },
          {
            id: "lead_gen_3",
            campaignId: "camp_gen_1",
            campaignName: campaign1Name,
            name: lead3Name,
            title: `${lead3Title} @ ${lead3Company}`,
            company: lead3Company,
            location: lead3Location,
            linkedinUrl: `https://www.linkedin.com/in/${lead3Name.toLowerCase().replace(/\s+/g, '-')}/`,
            email: `elena@${lead3Company.toLowerCase().replace(/\s+/g, '')}.com`,
            avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            stage: "converted",
            tags: ["Meeting Scheduled", "Partner Track"],
            notes: lead3Notes,
            lastInteractionAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            activities: [
              { id: `act_g_11`, type: "import", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), description: "Lead imported from high-integrity B2B filters" },
              { id: `act_g_12`, type: "visit", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), description: "Completed humanized profile scan" },
              { id: `act_g_13`, type: "invite_sent", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), description: "Connection request sent" },
              { id: `act_g_14`, type: "invite_accepted", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: "Accepted connection" },
              { id: `act_g_15`, type: "message_sent", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: "Sequence template message send" },
              { id: `act_g_16`, type: "reply_received", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), description: "Replied requesting schedule" },
              { id: `act_g_17`, type: "message_sent", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), description: "Calendar coordinate booking page sent" },
              { id: `act_g_18`, type: "reply_received", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: "Confirmed Thursday scheduling" }
            ]
          },
          {
            id: "lead_gen_4",
            campaignId: "camp_gen_2",
            campaignName: campaign2Name,
            name: lead4Name,
            title: `${lead4Title} @ ${lead4Company}`,
            company: lead4Company,
            location: lead4Location,
            linkedinUrl: `https://www.linkedin.com/in/${lead4Name.toLowerCase().replace(/\s+/g, '-')}/`,
            email: `contact@${lead4Company.toLowerCase().replace(/\s+/g, '')}.com`,
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            stage: "imported",
            tags: ["Niche Lead"],
            notes: lead4Notes,
            lastInteractionAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            activities: [
              { id: `act_g_19`, type: "import", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: "Prospect auto-matched and imported directly to CRM Workspace" }
            ]
          }
        ],
        chatMessages: [
          {
            id: "chat_g_msg_1",
            leadId: "lead_gen_1",
            sender: "user",
            text: `Hi ${lead1Name.split(' ')[0]}, let's connect and compare notes on B2B campaigns!`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            channel: "linkedin",
            read: true
          },
          {
            id: "chat_g_msg_2",
            leadId: "lead_gen_1",
            sender: "user",
            text: `Thanks for connecting ${lead1Name.split(' ')[0]}! Out of curiosity, are you guys experiencing bottlenecks scale-booking qualified campaigns at ${lead1Company}? We are seeing huge 2x rate hikes.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            channel: "linkedin",
            read: true
          },
          {
            id: "chat_g_msg_3",
            leadId: "lead_gen_1",
            sender: "lead",
            text: lead1Reply,
            timestamp: new Date().toISOString(),
            channel: "linkedin",
            read: false
          },
          {
            id: "chat_g_msg_4",
            leadId: "lead_gen_3",
            sender: "user",
            text: `Hi ${lead3Name.split(' ')[0]}, amazing DTC pipeline focus there at ${lead3Company}. Let's discuss synergies.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            channel: "linkedin",
            read: true
          },
          {
            id: "chat_g_msg_5",
            leadId: "lead_gen_3",
            sender: "user",
            text: `Thanks for connecting! Are you looking at direct outreach sequences to scale your premium acquisition threads? We see incredible interest.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
            channel: "linkedin",
            read: true
          },
          {
            id: "chat_g_msg_6",
            leadId: "lead_gen_3",
            sender: "lead",
            text: `Yes, we are exploring sequence scales right now. What's your booking look like? We can do a quick call to check templates.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            channel: "linkedin",
            read: true
          },
          {
            id: "chat_g_msg_7",
            leadId: "lead_gen_3",
            sender: "user",
            text: `Absolutely! Here's our calendar sync link or send over any specific slot that works.`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            channel: "linkedin",
            read: true
          },
          {
            id: "chat_g_msg_8",
            leadId: "lead_gen_3",
            sender: "lead",
            text: lead3Reply,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            channel: "linkedin",
            read: true
          }
        ]
      };
    }

    // F. ONBOARD: Tailored data synthesis on edge via Gemini API
    if (path === "/api/linkedin/onboard-custom-boost" && method === "POST") {
      const body: any = await context.request.url ? await context.request.json() : {};
      const { ownerName, ownerEmail, linkedinEmail, targetIndustry, isOAuth, oauthName, oauthAvatar } = body;

      if (!ownerName || !targetIndustry) {
        return makeResponse({ error: "Required onboarding parameters missing (Full Name, Target Industry/Profession)." }, 400);
      }

      const systemInstruction = "You are an advanced B2B lead generation database builder. Populate high-converting real-looking outreach sequences, targeted prospects, and conversation replies tailored to a target industry or audience niche. Return pristine, valid JSON matching the exact schema provided. Do not include markdown tags or backticks.";

      const boostPrompt = `Generate a highly realistic B2B LinkedIn outreach database customized for:
- User Target Industry/Audience: "${targetIndustry}"

You must output exactly 2 campaigns, exactly 4 leads (prospects) mapped across these campaigns, and highly relevant chat messages representing a realistic progression of dialogue in a unified inbox thread.

Ensure the data matches the following guidelines:
1. Campaigns:
   - Campaign 1: active status, e.g. "Target Decision Makers in ${targetIndustry}"
   - Campaign 2: active or paused status, e.g. "Warm Outbound ${targetIndustry}"
   - Provide realistic stats showing sent/accepted metrics.
   - Include 3 to 4 sequencing steps (visit_profile, send_invite, wait, send_message) with messageTemplates.
2. Leads:
   - Create 4 highly descriptive people titles/names belonging to real-sounding companies matching "${targetIndustry}".
   - Stage distribution: 
     - 1 lead at "imported" stage
     - 1 lead at "connected" stage
     - 1 lead at "replied" stage (having answered user's welcome message but not finalized yet)
     - 1 lead at "converted" stage (who agreed to a calendar booking or call)
   - Add Unsplash avatar URLs that represent high-quality executive business avatars.
   - Generate realistic timelines, notes, and activity histories.
3. ChatMessages:
   - Populate dialog bubbles for the leads in "connected", "replied", and "converted" stages.
   - Ensure the conversation threads flow naturally.

Return the JSON structure strictly formatted to match this schema:
{
  "campaigns": [
    {
      "id": "camp_gen_1",
      "name": "...",
      "status": "active",
      "leadsCount": 2,
      "acceptanceRate": 68,
      "replyRate": 40,
      "conversionRate": 18,
      "stats": {
        "invitesSent": 100,
        "invitesAccepted": 68,
        "messagesSent": 68,
        "repliesReceived": 27,
        "emailsSent": 10,
        "profilesViewed": 120
      },
      "steps": [
        { "id": "step_gen_1_1", "type": "visit_profile", "delayDays": 0 },
        { "id": "step_gen_1_2", "type": "send_invite", "delayDays": 1, "messageTemplate": "Hi {{firstName}}, great profile! Interested in your focus on {{company}}'s scaling. Let's connect." },
        { "id": "step_gen_1_3", "type": "wait", "delayDays": 2 },
        { "id": "step_gen_1_4", "type": "send_message", "delayDays": 0, "messageTemplate": "Thanks for connecting {{firstName}}! Are you guys currently expanding your workflow capabilities?" }
      ]
    }
  ],
  "leads": [
    {
      "id": "lead_gen_1",
      "campaignId": "camp_gen_1",
      "campaignName": "...",
      "name": "John Doe",
      "title": "Vice President @ TechCorp",
      "company": "TechCorp",
      "location": "New York, USA",
      "linkedinUrl": "https://www.linkedin.com/in/john-doe/",
      "email": "john@techcorp.com",
      "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      "stage": "replied",
      "tags": ["Niche Specialist"],
      "notes": "Interested in testing our customized services.",
      "lastInteractionAt": "2026-05-29T10:00:00Z",
      "activities": [
        { "id": "act_gen_1_1", "type": "import", "timestamp": "2026-05-20T08:00:00Z", "description": "Prospect imported" }
      ]
    }
  ],
  "chatMessages": [
    {
      "id": "chat_gen_1_1",
      "leadId": "lead_gen_1",
      "sender": "user",
      "text": "...",
      "timestamp": "2026-05-22T14:30:00Z",
      "channel": "linkedin",
      "read": true
    }
  ]
}`;

      let payload: any;
      try {
        const rawResult = await fetchGemini(boostPrompt, systemInstruction, context.env.GEMINI_API_KEY, edgeDbBoostSchema);
        const cleanJson = rawResult.replace(/```json/gi, "").replace(/```/g, "").trim();
        payload = JSON.parse(cleanJson);
      } catch (err: any) {
        console.warn("Tailored dataset generation via Gemini on edge failed or timed out, loading custom procedural dataset...", err);
        payload = generateProceduralDataset(targetIndustry);
      }

      const db = getOrCreateDB();

      const userProxy = "US-West-2 (Premium Static Residential) - 67.215.102.18";
      const primaryAccount = {
        id: isOAuth ? `acc-oauth-${Date.now()}` : "acc-user-primary",
        connected: true,
        name: isOAuth ? (oauthName || ownerName) : ownerName,
        avatarUrl: isOAuth ? (oauthAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80") : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        headline: `${targetIndustry} Lead Acquisition Lead | Executive Strategy`,
        connectionsCount: 1640,
        sessionCookie: isOAuth ? "oauth-authenticated-token" : `li_at=AQEDATk72_8C82BMAAABkr_${Math.random().toString(36).substring(2)}_extracted; li_rm=AQEDATk_extracted;`,
        proxy: isOAuth ? "Direct OAuth Connected (No proxy node required)" : userProxy,
        proxyStatus: "verified",
        healthStatus: "healthy",
        isActive: true,
        rateLimits: {
          invitesPerDay: 40,
          messagesPerDay: 80,
          profileViewsPerDay: 50,
          humanDelayMinSec: 45,
          humanDelayMaxSec: 180
        }
      };

      db.accounts = [primaryAccount];
      db.campaigns = payload.campaigns;
      db.leads = payload.leads;
      db.chatMessages = payload.chatMessages;

      db.automationLogs.push({
        timestamp: new Date().toISOString(),
        level: "success",
        message: `Edge workspace container generated completely for industry: '${targetIndustry}'!`
      });

      return makeResponse({ status: "success", db });
    }

    // 1. API: Custom Outreach Copywriter Generation
    if (path === "/api/ai/message" && method === "POST") {
      const body: any = await context.request.json();
      const { prompt, currentMessage, tone, leadInfo, type } = body;

      if (!prompt && !currentMessage) {
        return makeResponse({ error: "Please provide a prompt or the current message template to optimize." }, 400);
      }

      const defaultRole = "You are an elite sales copywriter and outreach optimization wizard like Lavender, Outreach, or Dripify. Generate highly engaging LinkedIn connection requests, messages, or marketing emails. Emphasize warm, non-spammy, highly-personalized copy. Limit messages to 300 characters for LinkedIn connection requests and 600 characters for follow-ups.";
      
      const leadContext = leadInfo 
        ? `Target Lead Details: Name: ${leadInfo.name}, Title: ${leadInfo.title}, Company: ${leadInfo.company}, Location: ${leadInfo.location}. Include merge tags like {{firstName}}, {{company}}, {{title}} naturally.` 
        : "Use general merge tags like {{firstName}} and {{company}} naturally to keep it personalizable.";

      const promptBody = currentMessage
        ? `Please optimize the following outreach draft message. Make the tone "${tone || 'conversational'}" and enhance its response rate.
Draft:
"${currentMessage}"

Instruction from user: ${prompt || "Make it shorter, highly relevant, and focused on starting a conversation."}
${leadContext}`
        : `Please write an original outreach message of type "${type || 'linkedin invite message'}".
Goal: ${prompt}
Desired Tone: ${tone || 'professional'}
${leadContext}`;

      const generated = await fetchGemini(promptBody, defaultRole, context.env.GEMINI_API_KEY);
      return makeResponse({ message: generated });
    }

    // 2. API: Strategic Campaign Strategy suggestions
    if (path === "/api/ai/campaign-suggestions" && method === "POST") {
      const body: any = await context.request.json();
      const { audience, offering, goal } = body;

      if (!audience || !offering) {
        return makeResponse({ error: "Please provide target audience description and product offering." }, 400);
      }

      const systemInstruction = "You are an expert LinkedIn growth hacking strategist specializing in multi-channel outreach campaigns. Suggest concrete, highly professional sequence strategies in a clean JSON format.";

      const schema = {
        type: "OBJECT",
        properties: {
          campaignName: { type: "STRING", description: "A catchy, precise campaign name" },
          strategySummary: { type: "STRING", description: "Brief overview of the suggested approach" },
          targetAudienceChecklist: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "3 key search parameters or keywords to find these leads on LinkedIn Sales Navigator"
          },
          recommendedSequence: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                stepIndex: { type: "INTEGER" },
                type: { type: "STRING", description: "visit_profile | send_invite | send_message | send_followup | send_email" },
                delayDays: { type: "INTEGER", description: "Days to wait before running this step" },
                title: { type: "STRING", description: "Action step label" },
                explanation: { type: "STRING", description: "Why do we take this action here?" },
                suggestedTemplate: { type: "STRING", description: "Complete message template ready to use with merge fields like {{firstName}} and {{company}}" }
              },
              required: ["stepIndex", "type", "delayDays", "title", "explanation", "suggestedTemplate"]
            }
          }
        },
        required: ["campaignName", "strategySummary", "targetAudienceChecklist", "recommendedSequence"]
      };

      const promptBody = `I want to build a high-performance LinkedIn Outreach Sequence.
Target Audience: "${audience}"
What I'm offering / value proposition: "${offering}"
Campaign goal: "${goal || 'Get a 30-minute discovery call'}"

Please design a premium, highly converting 4-to-5 step multi-day sequence. Message templates must be short and clickable.`;

      const jsonOutput = await fetchGemini(promptBody, systemInstruction, context.env.GEMINI_API_KEY, schema);
      return makeResponse(JSON.parse(jsonOutput));
    }

    // 3. API: CRM Inbound Smart replier
    if (path === "/api/ai/suggest-reply" && method === "POST") {
      const body: any = await context.request.json();
      const { leadMessage, userHistory, contextNotes } = body;

      if (!leadMessage) {
        return makeResponse({ error: "Please provide the latest incoming message from the lead." }, 400);
      }

      const systemInstruction = "You are an intelligent executive pipeline assistant. Analyze incoming LinkedIn or email messages, categorize the sentiment, and draft a high-converting, personalized reply.";

      const schema = {
        type: "OBJECT",
        properties: {
          sentiment: { type: "STRING", description: "interested | objection_price | objection_timing | not_interested" },
          analysis: { type: "STRING", description: "Brief analysis of the lead's state" },
          suggestedReply: { type: "STRING", description: "A beautifully written conversational reply to send" },
          recommendedNextStage: { type: "STRING", description: "imported | invited | connected | replied | converted" }
        },
        required: ["sentiment", "analysis", "suggestedReply", "recommendedNextStage"]
      };

      const promptBody = `Analyze the following incoming lead response:
"${leadMessage}"

Conversation History / Context: 
${JSON.stringify(userHistory || [])}

Additional Context:
"${contextNotes || 'No notes yet'}"

Please determine the sentiment categorization and write an outreach reply draft.`;

      const jsonOutput = await fetchGemini(promptBody, systemInstruction, context.env.GEMINI_API_KEY, schema);
      return makeResponse(JSON.parse(jsonOutput));
    }

    // 4. API: Simulated automated agent crawler queue metrics
    if (path === "/api/automation/queue" && method === "GET") {
      const db = getOrCreateDB();
      return makeResponse({
        status: "active",
        consecutiveFails: 0,
        activeWorkersCount: db.accounts ? db.accounts.filter((a: any) => a.connected).length : 1,
        proxyAddress: "104.244.72.109:8800 (US Premium proxy)",
        queueStats: {
          pendingTasks: db.leads ? db.leads.filter((l: any) => l.stage === 'imported').length : 4,
          processingTasks: db.leads ? db.leads.filter((l: any) => l.stage === 'invited' || l.stage === 'connected').length : 1,
          completedToday: db.leads ? db.leads.filter((l: any) => l.stage === 'converted' || l.stage === 'replied').length * 4 + 12 : 28,
          failedToday: 0
        },
        logs: db.automationLogs ? db.automationLogs.slice(-15) : [
          { timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), level: "info", message: "Browser profile session validated successfully." },
          { timestamp: new Date().toISOString(), level: "info", message: "Edge Automation queue worker idle." }
        ]
      });
    }

    return makeResponse({ error: "Route not found or unhandled request path: " + path }, 404);
  } catch (error: any) {
    console.error("Cloudflare Edge Function Catch Block:", error);
    return makeResponse({ error: error.message || "Failed in page function edge route processing" }, 500);
  }
};
