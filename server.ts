import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for generating with Gemini
async function askGemini(prompt: string, instruction: string, jsonSchema?: any) {
  try {
    const config: any = {
      systemInstruction: instruction,
      temperature: 0.8,
    };

    if (jsonSchema) {
      config.responseMimeType = "application/json";
      config.responseSchema = jsonSchema;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config,
    });

    return response.text ? response.text.trim() : "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to communicate with AI model.");
  }
}

// ---------------- API ENDPOINTS ----------------

// API route: AI Custom message template generator/optimizer
app.post("/api/ai/message", async (req, res) => {
  const { prompt, currentMessage, tone, leadInfo, type } = req.body;
  if (!prompt && !currentMessage) {
    return res.status(400).json({ error: "Please provide a prompt or the current message template to optimize." });
  }

  const defaultRole = "You are a stellar sales copywriter and outreach optimization wizard like Lavender, Outreach, or Dripify. Generate highly engaging LinkedIn connection requests, messages, or marketing emails. Emphasize warm, non-spammy, highly-personalized copy. Limit messages to 300 characters for LinkedIn connection requests and 600 characters for follow-ups.";
  
  const leadContext = leadInfo ? `Target Lead Details: Name: ${leadInfo.name}, Title: ${leadInfo.title}, Company: ${leadInfo.company}, Location: ${leadInfo.location}. Include merge tags like {{firstName}}, {{company}}, {{title}} naturally.` : "Use general merge tags like {{firstName}} and {{company}} naturally to keep it personalizable.";

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

  try {
    const generated = await askGemini(promptBody, defaultRole);
    res.json({ message: generated });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Could not generate custom outreach message with Gemini" });
  }
});

// API route: AI Campaign Suggestion Engine
app.post("/api/ai/campaign-suggestions", async (req, res) => {
  const { audience, offering, goal } = req.body;
  if (!audience || !offering) {
    return res.status(400).json({ error: "Please provide a target audience description and your product offering/value prop." });
  }

  const systemInstruction = "You are an expert LinkedIn growth hacking strategist specializing in multi-channel outreach campaigns. Suggest concrete, highly professional sequence strategies in a clean JSON format.";

  const schema = {
    type: Type.OBJECT,
    properties: {
      campaignName: { type: Type.STRING, description: "A catchy, precise campaign name" },
      strategySummary: { type: Type.STRING, description: "Brief overview of the suggested approach" },
      targetAudienceChecklist: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 key search parameters or keywords to find these leads on LinkedIn Sales Navigator"
      },
      recommendedSequence: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepIndex: { type: Type.INTEGER },
            type: { type: Type.STRING, description: "visit_profile | send_invite | send_message | send_followup | send_email" },
            delayDays: { type: Type.INTEGER, description: "Days to wait before running this step" },
            title: { type: Type.STRING, description: "Action step label" },
            explanation: { type: Type.STRING, description: "Why do we take this action here?" },
            suggestedTemplate: { type: Type.STRING, description: "Complete message template ready to use with merge fields like {{firstName}} and {{company}}" }
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

Please design a premium, highly converting 4-to-5 step multi-day sequence. Make sure the message templates are beautiful, short, and highly clickable.`;

  try {
    const jsonOutput = await askGemini(promptBody, systemInstruction, schema);
    res.json(JSON.parse(jsonOutput));
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Could not generate strategic campaign suggestions" });
  }
});

// API route: AI Reply Categorization & Smart Response Draft Analyzer
app.post("/api/ai/suggest-reply", async (req, res) => {
  const { leadMessage, userHistory, contextNotes } = req.body;
  if (!leadMessage) {
    return res.status(400).json({ error: "Please provide the latest incoming message from the lead." });
  }

  const systemInstruction = "You are an intelligent executive pipeline assistant. Analyze incoming LinkedIn or email messages, categorize the sentiment, and draft a high-converting, personalized reply that progresses the sales cycle.";

  const schema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING, description: "interested | objection_price | objection_timing | not_interested" },
      analysis: { type: Type.STRING, description: "Brief analysis of the lead's state, objections, or concerns" },
      suggestedReply: { type: Type.STRING, description: "A beautifully written, tactical, conversational reply to send" },
      recommendedNextStage: { type: Type.STRING, description: "imported | invited | connected | replied | converted" }
    },
    required: ["sentiment", "analysis", "suggestedReply", "recommendedNextStage"]
  };

  const promptBody = `Analyze the following incoming lead response:
"${leadMessage}"

Conversation History / Context: 
${JSON.stringify(userHistory || [])}

Additional Context:
"${contextNotes || 'No notes yet'}"

Please determine the sentiment categorization and write a superb follow-up draft. Be extremely helpful, address their questions directly, and prompt them to confirm a calendar link or clear next step.`;

  try {
    const jsonOutput = await askGemini(promptBody, systemInstruction, schema);
    res.json(JSON.parse(jsonOutput));
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to analyze reply and generate smart follow-up suggestions" });
  }
});

// API route: Simulated LinkedIn Automation Engine (Simulating Puppeteer / Playwright queue logs)
app.get("/api/automation/queue", (req, res) => {
  res.json({
    status: "active",
    consecutiveFails: 0,
    activeWorkersCount: 1,
    proxyAddress: "104.244.72.109:8800 (US Premium proxy)",
    queueStats: {
      pendingTasks: 4,
      processingTasks: 1,
      completedToday: 28,
      failedToday: 0
    },
    logs: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), level: "info", message: "Browser profile session validated successfully for 'Alex Mercer'." },
      { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), level: "info", message: "Starting campaign batch check for 'Enterprise SaaS CTOs - Europe'" },
      { timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), level: "info", message: "Target page loaded: https://www.linkedin.com/in/marcus-aurelius-roma-tech/" },
      { timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), level: "info", message: "Profile elements scraped: 3 positions found. Simulated mouse movements completed (650ms delay)." },
      { timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), level: "info", message: "LinkedIn chat window detected for Marcus Aurelius. Processing follow-up template..." },
      { timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), level: "success", message: "Message dispatched on LinkedIn: 'Thanks for connecting Marcus! I've been researching scaling bottlenecks...'" },
      { timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), level: "info", message: "Cooling down current socket connection. Applying human-like randomized sleep (84 seconds)." },
      { timestamp: new Date().toISOString(), level: "info", message: "Automation worker ID #105 waiting for next queue execution tick..." }
    ]
  });
});

// Vite middleware flow for full stack App integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
