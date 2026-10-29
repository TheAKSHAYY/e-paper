# E-Paper Studio — Production Deployment Guide

This guide explains how to deploy the E-Paper Studio monorepo using a **split architecture**:
- **Backend Renderer (`apps/renderer`)**: Deployed as a Docker container on [Render.com](https://render.com) (or Railway / Fly.io / AWS ECS) with headless Chromium and Devanagari fonts pre-installed.
- **Frontend Studio (`apps/web`)**: Deployed on [Cloudflare Pages](https://pages.cloudflare.com) (or Vercel / Netlify) as a high-speed static single-page application (SPA).

---

## Why a Split Deployment?

1. **Chromium & Font Stability**: Serverless functions (like Vercel Serverless or AWS Lambda) have strict package size limits, 4.5MB payload caps, and ephemeral file systems that cause headless Chromium crashes and font rendering failures with complex Indic scripts.
2. **True Vector PDF & Devanagari Typography**: Running Chromium inside a dedicated Linux container with installed Noto Devanagari fonts and self-hosted web fonts guarantees 100% pixel-perfect vector PDFs without missing conjuncts or matra displacement.
3. **Global Edge Performance**: The web editor is delivered instantaneously from Cloudflare's global edge network.

---

## Part 1: Deploy the Renderer Microservice (Render.com)

### Step 1.1: Connect Repository to Render
1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`e-paper`).

### Step 1.2: Configure Web Service
Render will auto-detect the root `render.yaml` blueprint, or you can configure it manually:

- **Name**: `epaper-renderer` (or your choice)
- **Region**: Choose the region closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
- **Runtime / Environment**: `Docker`
- **Docker Context**: `.` (Monorepo root)
- **Dockerfile Path**: `apps/renderer/Dockerfile`
- **Instance Type**: `Starter` (512MB or 1GB RAM recommended for headless Chromium)

### Step 1.3: Set Environment Variables
Add these environment variables in the Render settings tab:

| Variable | Value | Description |
|---|---|---|
| `PORT` | `10000` | Port automatically assigned by Render |
| `NODE_ENV` | `production` | Enables production optimizations |
| `RENDER_CONCURRENCY` | `4` | Max concurrent PDF renders (adjust based on instance RAM) |
| `RENDER_TIMEOUT_MS` | `35000` | Max render job duration before cancellation |
| `MAX_PAYLOAD_MB` | `15` | Request body size limit for articles and embedded images |
| `RATE_LIMIT_MAX_PER_MINUTE` | `60` | Max requests per IP per minute |
| `TRUST_PROXY` | `true` | Enables client IP detection behind Render's reverse proxy |
| `TRUST_PROXY_HOPS` | `1` | Reverse proxy hops (1 for Render ingress) to prevent IP-spoofing rate limit bypasses |
| `ALLOWED_ORIGINS` | `https://<your-frontend>.pages.dev,http://localhost:5173` | Comma-separated list of allowed web origins for CORS |
| `ALLOWED_ASSET_ORIGINS` | *(Optional)* | Comma-separated domains for external images (e.g. `images.unsplash.com`) |
| `RENDER_API_KEY` | *(Optional)* | Optional shared key (leave blank to disable API key requirement) |

### Step 1.4: Verify the Renderer Deployment
Once Render completes building the container:
1. Copy your live Render URL (e.g. `https://epaper-renderer.onrender.com`).
2. Open `https://epaper-renderer.onrender.com/api/health` in your browser or run:
   ```bash
   curl -I https://epaper-renderer.onrender.com/api/health
   ```
3. You should receive a `200 OK` response with:
   ```json
   {
     "status": "healthy",
     "service": "@epaper-studio/renderer",
     "chromiumAvailable": true
   }
   ```

---

## Part 2: Deploy the Web Frontend (Cloudflare Pages or Vercel)

### Option A: Cloudflare Pages

#### Step 2.1: Create a Cloudflare Pages Project
1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select your GitHub repository (`e-paper`) and branch (`main`).

#### Step 2.2: Configure Build Settings
Fill in the exact build configuration:

- **Project name**: `epaper-studio`
- **Framework preset**: `None` (or `Vite`)
- **Root directory**: `/` (leave as root of monorepo)
- **Build command**:
  ```bash
  pnpm build
  ```
- **Build output directory**:
  ```
  apps/web/dist
  ```

#### Step 2.3: Set Frontend Environment Variables
In the Cloudflare Pages settings under **Environment Variables**, add:

| Variable | Value | Description |
|---|---|---|
| `NODE_VERSION` | `22` | Uses Node.js 22 LTS |
| `VITE_RENDERER_URL` | `https://epaper-renderer.onrender.com` | Live URL of your Render backend service |
| `VITE_RENDERER_API_KEY` | *(Optional)* | Must match `RENDER_API_KEY` on Render if enabled |

---

### Option B: Vercel

If deploying the frontend on Vercel:

1. Import your GitHub repository (`e-paper`) in the [Vercel Dashboard](https://vercel.com/new).
2. Set **Root Directory** to `apps/web`.
3. Vercel will automatically detect `Vite` and run `pnpm run build`.
   - The updated build script in `apps/web/package.json` (`pnpm --filter "@epaper-studio/web^..." build && tsc -p tsconfig.json --noEmit && vite build`) will automatically compile the internal monorepo packages first, even on a fresh clone.
4. Set **Output Directory** to `dist` (default for Vite).
5. In **Environment Variables**, add:
   - `VITE_RENDERER_URL`: `https://epaper-renderer.onrender.com`
   - `VITE_RENDERER_API_KEY`: *(Optional shared key matching Render)*
6. Click **Deploy**.

---

### Step 2.4: Update Renderer CORS
Once you have your live Cloudflare Pages URL (e.g. `https://epaper-studio.pages.dev`), return to Render.com and update:
```
ALLOWED_ORIGINS=https://epaper-studio.pages.dev
```

---

## Part 3: End-to-End Verification on Live URLs

To ensure everything works seamlessly between the frontend and backend:

1. **Open Live App**: Open `https://epaper-studio.pages.dev` in your browser.
2. **Switch to Hindi Preset**:
   - In the top bar or presets drawer, choose **"क्लासिक ब्रॉडशीट"** or **"आधुनिक संपादकीय"**.
   - Type Hindi text with conjuncts (e.g. *प्रधानमंत्री, राष्ट्रीय, क्षत्रिय, दृष्टिकोण*).
3. **Export PDF**:
   - Click the **"डाउनलोड PDF"** button in the top navigation bar.
   - The frontend will send the document schema to `https://epaper-renderer.onrender.com/api/render-pdf`.
   - The browser will download a print-ready `.pdf` file.
4. **Inspect PDF**:
   - Open the downloaded PDF in Acrobat Reader or Chrome.
   - Verify:
     - Exact physical page dimensions (A4, Tabloid, Berliner, or Broadsheet).
     - Crisp Devanagari typography with 100% correct conjuncts and matra placement.
     - Text is selectable and searchable (true vector PDF, not a low-res image).

---

## Security & Reliability Summary

### ⚠️ Crucial Security Notice: `RENDER_API_KEY` and `VITE_RENDERER_API_KEY`
- Both `RENDER_API_KEY` (renderer backend) and `VITE_RENDERER_API_KEY` (web frontend) are **completely optional**. If left empty, API key verification is disabled.
- **Why a `VITE_` Key is Not Real Security**:
  Any variable prefixed with `VITE_` is statically embedded directly into client-side JavaScript assets (`apps/web/dist/assets/*.js`) during `vite build`. Anyone who views browser page source, opens DevTools Network tab, or inspects the JS bundle can see this key.
  - A `VITE_` API key acts as basic **obfuscation against automated crawlers**, but **does not provide real secret protection or cryptographic security**.
- **Real Production Defense-in-Depth**:
  1. **Strict CORS (`ALLOWED_ORIGINS`)**: Ensure `ALLOWED_ORIGINS` is set strictly to your frontend domain (e.g. `https://your-project.pages.dev`). Unauthorized web applications in other browser origins will be blocked by browsers.
  2. **IP Rate Limiting Behind Render Proxy**: `RATE_LIMIT_MAX_PER_MINUTE=60` combined with `TRUST_PROXY=true` and `TRUST_PROXY_HOPS=1` accurately resolves client IPs from `X-Forwarded-For` and prevents IP-spoofing rate limit bypasses.
  3. **Strict SSRF Mitigation**: Arbitrary outbound HTTP/HTTPS requests from submitted HTML or articles are rejected; only local fonts and `data:` URIs (or explicitly allowlisted `ALLOWED_ASSET_ORIGINS`) are resolved.
  4. **Payload Protection**: Request bodies are capped at 15MB (`MAX_PAYLOAD_MB`, default: 15) to prevent memory exhaustion, comfortably handling 50+ embedded photos while rejecting oversized payloads with HTTP 413.
  5. **Server-to-Server / Session Auth**: If you require strict user-level access control, route frontend export requests through an authenticated backend API (e.g., Supabase Edge Function or custom Node backend) that checks user sessions before proxying to the renderer with a truly private server-side `RENDER_API_KEY`.

