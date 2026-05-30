// Catch-all Cloudflare Pages Functions API Router
// Automatically routes all incoming API requests to Cloudflare Pages edge workers natively.

interface Env {
  GEMINI_API_KEY: string;
}

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

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

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
function makeResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
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

Please design a premium, highly converting 4-to-5 step multi-day sequence. Make sure the message templates are beautiful, short, and highly clickable.`;

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

      const systemInstruction = "You are an intelligent executive pipeline assistant. Analyze incoming LinkedIn or email messages, categorize the sentiment, and draft a high-converting, personalized reply that progresses the sales cycle.";

      const schema = {
        type: "OBJECT",
        properties: {
          sentiment: { type: "STRING", description: "interested | objection_price | objection_timing | not_interested" },
          analysis: { type: "STRING", description: "Brief analysis of the lead's state, objections, or concerns" },
          suggestedReply: { type: "STRING", description: "A beautifully written, tactical, conversational reply to send" },
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

Please determine the sentiment categorization and write a superb follow-up draft. Be extremely helpful, address their questions directly, and prompt them to confirm a calendar link or clear next step.`;

      const jsonOutput = await fetchGemini(promptBody, systemInstruction, context.env.GEMINI_API_KEY, schema);
      return makeResponse(JSON.parse(jsonOutput));
    }

    // 4. API: Simulated automated agent crawler queue metrics
    if (path === "/api/automation/queue" && method === "GET") {
      return makeResponse({
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
    }

    return makeResponse({ error: "Route not found or unhandled request path: " + path }, 404);
  } catch (error: any) {
    console.error("Cloudflare Edge Function Catch Block:", error);
    return makeResponse({ error: error.message || "Failed in page function edge route processing" }, 500);
  }
};
