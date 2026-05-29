/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LinkedInAccount {
  connected: boolean;
  name: string;
  avatarUrl: string;
  headline: string;
  connectionsCount: number;
  sessionCookie: string;
  proxy: string;
  proxyStatus: 'verified' | 'failed' | 'untested';
  healthStatus: 'healthy' | 'warning' | 'restricted' | 'disconnected';
  rateLimits: {
    invitesPerDay: number;
    messagesPerDay: number;
    profileViewsPerDay: number;
    humanDelayMinSec: number;
    humanDelayMaxSec: number;
  };
}

export interface CampaignStep {
  id: string;
  type: 'visit_profile' | 'send_invite' | 'wait' | 'send_message' | 'send_followup' | 'send_email';
  delayDays: number;
  messageTemplate?: string;
  subject?: string;
  isAiOptimized?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  steps: CampaignStep[];
  leadsCount: number;
  acceptanceRate: number; // in percent
  replyRate: number; // in percent
  conversionRate: number; // in percent
  stats: {
    invitesSent: number;
    invitesAccepted: number;
    messagesSent: number;
    repliesReceived: number;
    emailsSent: number;
    profilesViewed: number;
  };
  createdAt: string;
}

export type LeadStage = 'imported' | 'invited' | 'connected' | 'replied' | 'converted';

export interface LeadActivity {
  id: string;
  type: 'import' | 'visit' | 'invite_sent' | 'invite_accepted' | 'message_sent' | 'reply_received' | 'email_sent' | 'note_added';
  timestamp: string;
  description: string;
}

export interface Lead {
  id: string;
  campaignId: string;
  campaignName: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl: string;
  email: string;
  avatarUrl: string;
  stage: LeadStage;
  tags: string[];
  notes: string;
  activities: LeadActivity[];
  lastInteractionAt: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  sender: 'user' | 'lead';
  text: string;
  timestamp: string;
  channel: 'linkedin' | 'email';
  read: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited';
  joinedAt: string;
}

export interface IntegrationSettings {
  zapierWebhookUrl: string;
  googleCalendarSync: boolean;
  hubspotSync: boolean;
  salesforceSync: boolean;
  customWebhookActive: boolean;
  customWebhookUrl: string;
}
