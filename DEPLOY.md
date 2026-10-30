# E-Paper Studio — Production Deployment Guide

E-Paper Studio is a modern, high-performance publishing studio for creating print-ready newspapers and digital publications.

As of the latest architecture, **PDF export is 100% fully client-side**. Publications are rendered and assembled entirely inside the user's web browser using client-side DOM rasterization, native HarfBuzz Devanagari text shaping, self-hosted web fonts, and in-browser PDF packaging.

**No backend server, Render container, Railway service, paid APIs, or external keys are required to generate and download PDFs.**

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   User's Web Browser                   │
│                                                        │
│  ┌─────────────────┐      ┌─────────────────────────┐  │
│  │ Newspaper DOM   │ ───> │ Canvas Rasterizer       │  │
│  │ (HarfBuzz Fonts)│      │ (2x DPI / 192 DPI Crisp)│  │
│  └─────────────────┘      └───────────┬─────────────┘  │
│                                       │                │
│                                       ▼                │
│  ┌─────────────────┐      ┌─────────────────────────┐  │
│  │ Local Download  │ <─── │ jsPDF Packaging Engine  │  │
│  │ (.pdf file)     │      │ (Exact Physical Bounds) │  │
│  └─────────────────┘      └─────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- **Zero Server Costs**: The entire application runs as a static Single Page Application (SPA).
- **Zero Cold Starts**: Instant PDF generation without waking up sleepy container instances.
- **Privacy & Security**: Document content and images never leave the user's device.
- **Exact Physical Geometry**: Supports Broadsheet, Berliner, Tabloid, A3, and A4 with exact point dimensions (`widthPt`, `heightPt`).
- **Devanagari Complex Script Support**: Matras, conjuncts, and half-consonants are shaped accurately by the browser's native text shaping engine using the 41 self-hosted WOFF2 fonts.

---

## Production Deployment Options

### Option 1: Vercel (Recommended)

1. Import your GitHub repository (`e-paper`) in the [Vercel Dashboard](https://vercel.com/new).
2. Set **Root Directory** to `apps/web`.
3. Vercel automatically detects `Vite` and executes:
   ```bash
   pnpm run build
   ```
   *(The build script compiles internal monorepo packages, synchronizes self-hosted fonts to `dist/fonts/`, and bundles the app).*
4. Set **Output Directory** to `dist`.
5. **No Environment Variables Required**: PDF export works out of the box without any backend URL or API key.
6. Click **Deploy**.

Security headers and font caching are preconfigured in `apps/web/vercel.json` (CSP, `X-Frame-Options: SAMEORIGIN`, immutable 1-year font caching, and SPA routing rewrites).

---

### Option 2: Cloudflare Pages

1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
2. Select your repository and branch (`main`).
3. Fill in the build settings:
   - **Framework preset**: `None` (or `Vite`)
   - **Root directory**: `/`
   - **Build command**:
     ```bash
     pnpm build
     ```
   - **Build output directory**:
     ```
     apps/web/dist
     ```
4. Click **Save and Deploy**.

---

### Option 3: Netlify

1. Connect your repository in the Netlify Dashboard.
2. Build settings:
   - **Base directory**: `apps/web`
   - **Build command**: `pnpm run build`
   - **Publish directory**: `dist`
3. Click **Deploy**.

---

## Verification Checklist

1. **Self-Hosted Font Delivery**:
   Open `/fonts/fonts.css` or `/fonts/noto-serif-devanagari-devanagari-400.woff2` on your live site. It must return `200 OK` with proper MIME type (`font/woff2`).
2. **Hindi & Complex Script Rendering**:
   Type Hindi text with conjuncts (e.g. *प्रधानमंत्री, राष्ट्रीय, दृष्टिकोण, प्रौद्योगिकी*). Verify all glyphs render cleanly.
3. **One-Click PDF Export**:
   Click **"PDF"** in the top bar. The browser compiles the publication into a PDF and triggers an automated download with `%PDF-` magic header and crisp 192 DPI typography.
4. **Fallback Print Option**:
   Click **"प्रिंट / Save as PDF"** for the native browser printing dialogue.

---

## (Optional) Headless Renderer Microservice (`apps/renderer`)

The repository retains `apps/renderer` as an optional headless worker for automated background jobs, CLI tools, or batch scheduled exports. If you do not require server-side batch rendering, you do not need to deploy `apps/renderer`.
