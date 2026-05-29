# 🚀 Live Deployment Guide: Connect to GitHub & Host on Cloudflare Pages

Dripify is equipped with a dual-mode compilation setup, allowing you to run it as a **Full-Stack Node.js app** or a **100% Native serverless Cloudflare Pages & Workers app**!

Follow the precise step-by-step checklist below to export your code, link your GitHub account, and take this tool live on Cloudflare Pages with native API edge services.

---

## 📦 Step 1: Export Your Project to GitHub from AI Studio

Google AI Studio provides a native, secure export link directly inside the user interface.

1. **Locate settings menu**: At the top-right corner of your AI Studio Code Editor block, look for the **Settings/Export** button or the **Export to GitHub** action.
2. **Authorize GitHub**: Agree to the secure GitHub authentication pop-up.
3. **Select Repository Mode**: Choose to create a **New Repository** (recommended name: `dripify-linkedin-outreach`), make it Public or Private, and finalize the export.
4. AI Studio will automatically push the exact workspace files (including the newly generated Cloudflare Edge routers) to your GitHub repository in seconds.

---

## ⚡ Step 2: Connect and Host on Cloudflare Pages

Cloudflare Pages provides lightning-fast edge hosting with built-in serverless edge operations. It is completely free for up to 100,000 requests/day.

1. **Log in to Cloudflare**: Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and register or log in.
2. **Navigate to Pages**:
   - In the left sidebar, click on **Workers & Pages**.
   - Click the **Create** button, then select the **Pages** tab.
   - Click **Connect to Git**.
3. **Link Your GitHub Repository**:
   - Select your GitHub account and locate the exported repository (`dripify-linkedin-outreach`).
   - Click **Begin Setup**.
4. **Configure the Build Parameters**:
   Configure the following parameters exactly so Cloudflare compiles the React web assembly flawlessly:
   - **Framework Preset**: `Vite` (or select `None`)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. **Set Environment Variables (Crucial for Gemini AI)**:
   Before clicking deploy, expand the **Environment variables (advanced)** tab under the configuration screen and add your Gemini API Key:
   - **Variable Name**: `GEMINI_API_KEY`
   - **Value**: *[Paste your Google Gemini API Key]* (You can get an API key free from Google AI Studio settings).
6. Click **Save and Deploy**.

---

## 🛠️ Step 3: Verified & Live!

Once the build finishes (usually under 60 seconds), Cloudflare Pages will provide you with a custom live `.pages.dev` URL (e.g., `https://dripify-linkedin-outreach.pages.dev`).

### This deployed tool is 100% real and premium:
- **Frontend SPA**: The fully interactive Dripify dashboard runs at the edge.
- **Pages Functions Backend**: Located in `/functions/api/[[path]].ts`, Cloudflare automatically maps the endpoints (`/api/ai/message`, `/api/ai/campaign-suggestions`, `/api/ai/suggest-reply`, etc.) to serverless workers. They run directly on Cloudflare edge nodes securely using the configured `GEMINI_API_KEY`, hiding all private tokens from client browsers.
- **Dynamic Worker Logs**: Automated Playwright simulating queues dynamically updates inside the dashboard.
