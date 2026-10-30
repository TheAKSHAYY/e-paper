# E-Paper Studio: Hindi & Multilingual Newspaper Page Builder

> A high-performance Hindi & multilingual newspaper page builder and publishing studio. Features an intuitive visual editor, intelligent auto-fit and free layout with drag-and-drop, customizable editorial themes, JSON project backup & restore, and 100% in-browser print-ready PDF export with self-hosted Devanagari typography.

[![CI](https://github.com/TheAKSHAYY/e-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/TheAKSHAYY/e-paper/actions)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

---

## 1. Key Features

- **Hindi & Multilingual Typography First**: Native, self-hosted Devanagari fonts (Gotu, Hind, Mukta, Noto Serif Devanagari, Poppins, Rozha One, Tiro Devanagari Hindi, Yatra One) with 100% conjunct and matra preservation.
- **Dual Layout Engines**:
  - **Grid & Auto-Fit Engine**: Calculates column spans, balances vertical column heights, and paginates multi-story news across physical page dimensions.
  - **Free Layout Mode**: Precise millimeter-based drag, drop, resize, and positioning for front-page leads, ads, and breaking news alerts.
- **Theme & Palette Customization**: Authentic newspaper themes (Classic Broadsheet, Modern Editorial, Pink Financial, Warm Sepia, Vintage Newspaper, Dark Mode) with per-block color overrides.
- **100% Client-Side PDF Export**: Generates authentic print-ready PDFs directly in the browser matching physical paper dimensions (A4, Tabloid, Berliner, Broadsheet) with self-hosted Devanagari typography. Zero external backend or paid services required.
- **Serverless Static Architecture**: Deployable on Vercel, Cloudflare Pages, Netlify, or any static host with zero server maintenance costs. Optional headless worker (`apps/renderer`) available for automated background batch jobs.

---

## 2. Security Notice

> [!IMPORTANT]
> - **Never commit `.env` or `.env.local` files** containing private secrets, database keys, or production tokens to version control.
> - **`VITE_*` environment variables are public**: In Vite applications (`apps/web`), any variable prefixed with `VITE_` (such as `VITE_RENDERER_URL` or `VITE_RENDERER_API_KEY`) is statically baked into client-side JavaScript bundles during compilation and can be inspected by any visitor. Never store sensitive private keys in `VITE_*` variables.

---

## 3. Prerequisites

Ensure you have the following installed on your workstation:

- **Node.js**: `v20.x` or higher (`v22.x` recommended)
- **pnpm**: `v9.x` or higher (`v12.x` supported)
- **Git**: `v2.40+`
- **Chromium / Playwright Dependencies** (for vector PDF and visual rendering tests)

---

## 4. Quick Start & Installation

Clone the repository and install all workspace dependencies:

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Start the Web Studio local development server
pnpm dev
```

The Web Studio will be available at [http://localhost:5173](http://localhost:5173).

To start the standalone PDF rendering worker locally:
```bash
pnpm --filter @epaper-studio/renderer start
```
The renderer listens on [http://localhost:4000](http://localhost:4000).

---

## 5. Workspace Scripts

| Command             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Starts the interactive Vite web application (`apps/web`)       |
| `pnpm build`        | Compiles all packages and applications                         |
| `pnpm typecheck`    | Runs strict TypeScript validation across the entire workspace  |
| `pnpm lint`         | Runs ESLint across all packages and apps                       |
| `pnpm lint:fix`     | Automatically fixes auto-fixable ESLint warnings               |
| `pnpm test`         | Runs all unit & integration test suites using Vitest           |
| `pnpm test:watch`   | Runs Vitest in interactive watch mode                          |
| `pnpm test:e2e`     | Runs Playwright browser end-to-end user flows                  |
| `pnpm format`       | Formats all files using Prettier                               |
| `pnpm format:check` | Validates formatting consistency without modifying files       |

---

## 6. Monorepo Architecture

```
e-paper/
├── apps/
│   ├── web/                     # React 19 + TypeScript + Vite interactive studio (Cloudflare Pages)
│   └── renderer/                # Node.js + Playwright microservice for vector PDF generation (Render.com)
├── packages/
│   ├── document-schema/         # Canonical Zod schemas, device profiles, and AST definitions
│   ├── template-engine/         # Grid calculations, auto-fit, free layout, and data interpolation
│   ├── typography/              # Multilingual font metrics, self-hosted Devanagari font cascades
│   ├── ui/                      # Shared paper aesthetic tokens, preview components, contrast inspectors
│   └── test-fixtures/           # Standard documents, mock hardware profiles, test suites
├── tests/
│   ├── e2e/                     # End-to-end browser user flows (Playwright)
│   ├── visual/                  # Visual regression & physical coordinate parity assertions
│   └── pdf/                     # PDF geometry and print dimension assertions
├── docs/                        # Architecture, PRD, Roadmap, and ADR records
├── DEPLOY.md                    # Step-by-step split deployment guide for Cloudflare Pages & Render
└── render.yaml                  # Render.com Blueprint specification for containerized renderer
```

---

## 7. Deployment

For step-by-step production deployment instructions (Vercel, Cloudflare Pages, Netlify), see [**DEPLOY.md**](./DEPLOY.md).
