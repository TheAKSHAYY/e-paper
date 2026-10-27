# Implementation Roadmap & Milestones — E-Paper Studio

This roadmap breaks down the development of E-Paper Studio into logical, decoupled phases. Each phase builds upon the verified foundation of preceding phases.

---

## Phase 0: Development Foundation (Current Phase)

- [x] Environment inspection and toolchain setup (Node.js 24, pnpm 12, Git).
- [x] Monorepo workspace initialization (`apps/*`, `packages/*`, `supabase/*`, `tests/*`).
- [x] Strict TypeScript configuration and shared compiler base.
- [x] Code quality toolchains (ESLint 9 flat config, Prettier, CI GitHub Actions).
- [x] Testing harness setup (Vitest for unit suites, Playwright for e2e / visual / PDF).
- [x] Core documentation suite (`PRD.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `ADR.md`, `AGENTS.md`).

---

## Phase 1: Core Schema & Template Engine

**Prerequisites**: Phase 0 sign-off.

- [ ] Define comprehensive AST schemas in `@epaper-studio/document-schema` (Block, Text, Image, Table, Column, PageBreak).
- [ ] Implement device profiles and aspect ratio math for Kindle Scribe, reMarkable 2, Kobo, and Print A4/A5.
- [ ] Implement multi-column newspaper layout solver in `@epaper-studio/template-engine`.
- [ ] Implement hyperlinked table of contents and internal navigation anchor generator.
- [ ] Unit test coverage > 90% across schema and engine.

---

## Phase 2: Multilingual Typography & E-Ink Optical Engine

**Prerequisites**: Phase 1 AST schemas.

- [ ] Curate and bundle high-legibility open-source e-ink fonts in `@epaper-studio/typography`.
- [ ] Implement bidirectional (BiDi) layout support for Arabic and Hebrew with right-to-left column ordering.
- [ ] Implement CJK and Indic fallback cascade resolution.
- [ ] Optical weight tuning: automated weight boosting for displays below 250 DPI.
- [ ] Visual regression test suite for font contrast and line spacing.

---

## Phase 3: Headless Chromium Renderer Worker

**Prerequisites**: Phase 1 & Phase 2.

- [ ] Implement Playwright browser pooling and worker lifecycle in `apps/renderer`.
- [ ] Implement pixel-perfect HTML-to-PDF vector generation adhering to hardware viewport constraints.
- [ ] Implement optional 1-bit / 16-level grayscale Floyd-Steinberg and Atkinson dithering algorithms for images.
- [ ] Implement automated PDF geometry test suite in `tests/pdf`.

---

## Phase 4: Supabase Database, Auth & Multi-Tenancy

**Prerequisites**: Core schemas finalized.

- [ ] Complete database migration in `supabase/migrations/` (organizations, profiles, publications, issues, templates, render_jobs).
- [ ] Implement Row-Level Security (RLS) policies for multi-tenant isolation.
- [ ] Configure Supabase Storage buckets with access control policies.
- [ ] Implement pgTAP test assertions in `supabase/tests/`.

---

## Phase 5: Web Studio Application UI

**Prerequisites**: Phase 1–4.

- [ ] Build visual document editor canvas in `apps/web`.
- [ ] Implement live 16-level grayscale simulator toggle.
- [ ] Build device switcher (previewing layout instantly on Kindle vs reMarkable vs Print).
- [ ] Implement publication issue manager and template picker.
- [ ] End-to-end user journey tests in `tests/e2e/`.

---

## Phase 6: Subscriptions, Automated Publishing & Distribution

**Prerequisites**: Web UI & Renderer stable.

- [ ] Stripe customer portal and subscription webhook integration.
- [ ] Scheduled issue publisher (daily morning briefing generation).
- [ ] Send-to-Kindle automated email delivery.
- [ ] reMarkable Cloud synchronization integration.
- [ ] Production deployment (Vercel + Cloud Run / ECS).
