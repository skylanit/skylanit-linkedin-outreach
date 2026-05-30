import { LinkedInAccount, Campaign, Lead, ChatMessage, TeamMember, IntegrationSettings } from './types';

// Mock initial data that can be saved in local state or updated
export const initialLinkedInAccount: LinkedInAccount = {
  id: "acc-1",
  connected: true,
  name: "Alex Mercer",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  headline: "Technical Recruiter @ ScaleUp | SaaS Growth Advisor | Ex-LinkedIn Insider",
  connectionsCount: 4218,
  sessionCookie: "li_at=AQEDATk72_8C82BMAAABk...; li_rm=AQEDATk...;",
  proxy: "US-West-1 (Premium Shared Proxy) - 104.244.72.109",
  proxyStatus: 'verified',
  healthStatus: 'healthy',
  isActive: true,
  rateLimits: {
    invitesPerDay: 40,
    messagesPerDay: 80,
    profileViewsPerDay: 50,
    humanDelayMinSec: 45,
    humanDelayMaxSec: 180
  }
};

export const initialCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Enterprise SaaS CTOs - Europe",
    status: 'active',
    leadsCount: 148,
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
    leadsCount: 95,
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
    leadsCount: 112,
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
];

export const initialLeads: Lead[] = [
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
];

export const initialChatMessages: ChatMessage[] = [
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
];

export const initialTeamMembers: TeamMember[] = [
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
];

export const initialIntegrations: IntegrationSettings = {
  zapierWebhookUrl: "https://hooks.zapier.com/hooks/catch/12345/abcde",
  googleCalendarSync: true,
  hubspotSync: false,
  salesforceSync: false,
  customWebhookActive: true,
  customWebhookUrl: "https://yourdomain.com/webhooks/linkedin"
};
