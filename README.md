# E-Paper Studio

> Scalable, multilingual e-paper publishing and document studio tailored for Kindle Scribe, reMarkable, Kobo, Boox, Supernote, and high-resolution print.

[![CI](https://github.com/organization/epaper-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/organization/epaper-studio/actions)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Prerequisites

Ensure you have the following installed on your workstation:

- **Node.js**: `v20.x` or higher (`v22.x` or `v24.x` recommended)
- **pnpm**: `v9.x` or higher (`v12.x` supported)
- **Git**: `v2.40+`
- **Chromium / Playwright Dependencies** (for PDF and visual rendering tests)
- **Docker Desktop** (optional, required if running local Supabase stack)

---

## 2. Quick Start & Installation

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

---

## 3. Workspace Scripts

| Command             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Starts the interactive Vite web application (`apps/web`)       |
| `pnpm build`        | Compiles all packages and applications                         |
| `pnpm typecheck`    | Runs strict TypeScript validation across the entire workspace  |
| `pnpm lint`         | Runs ESLint across all packages and apps                       |
| `pnpm lint:fix`     | Automatically fixes auto-fixable ESLint warnings               |
| `pnpm test`         | Runs all unit test suites using Vitest                         |
| `pnpm test:watch`   | Runs Vitest in interactive watch mode                          |
| `pnpm test:e2e`     | Runs Playwright browser end-to-end and visual regression tests |
| `pnpm format`       | Formats all files using Prettier                               |
| `pnpm format:check` | Validates formatting consistency without modifying files       |

---

## 4. Monorepo Architecture

```
epaper-studio/
├── apps/
│   ├── web/                     # React 19 + TypeScript + Vite interactive studio
│   └── renderer/                # Node.js + Playwright worker for vector PDF & e-ink bitmap generation
├── packages/
│   ├── document-schema/         # Canonical Zod schemas, hardware device profiles, and AST definitions
│   ├── template-engine/         # Layout calculation, multi-column balance, and data interpolation
│   ├── typography/              # Multilingual font metrics, e-ink optical weight tuners, fallback cascades
│   ├── ui/                      # Shared paper aesthetic tokens, preview components, contrast inspectors
│   └── test-fixtures/           # Standard documents, mock hardware profiles, test suites
├── supabase/
│   ├── migrations/              # PostgreSQL schema migrations and RLS policies
│   └── tests/                   # pgTAP database tests
├── tests/
│   ├── e2e/                     # End-to-end browser user flows
│   ├── visual/                  # Visual regression & 16-level grayscale dithering validation
│   └── pdf/                     # PDF geometry and print dimension assertions
├── docs/                        # Architecture, PRD, Roadmap, and ADR records
└── .agent/rules/                # Modular agent behavior rules
```

---

## 5. Architecture & Subsystems

Detailed documentation is available in the [`docs/`](./docs) directory:

- [**Product Requirements (PRD)**](./docs/PRD.md): Functional and non-functional requirements.
- [**System Architecture**](./docs/ARCHITECTURE.md): Microservice topology, Supabase RLS, rendering pipeline.
- [**Implementation Roadmap**](./docs/ROADMAP.md): Phased delivery milestones and dependencies.
- [**Architecture Decision Records (ADR)**](./docs/ADR.md): Key decisions and tradeoffs.
- [**Agent Guidelines (AGENTS.md)**](./AGENTS.md): Coding standards and security guardrails.

---

## 6. Local Supabase Setup (Optional)

To run the local database and storage services:

```bash
# Start local Supabase containers (requires Docker)
supabase start

# Apply local migrations
supabase migration up

# Run database tests
supabase test db
```

---

## 7. License

MIT
