# Architecture Decision Records (ADR) — E-Paper Studio

This document records key architectural decisions, their rationale, context, tradeoffs, and open questions.

---

## ADR 001: Monorepo Toolchain (pnpm Workspaces + TypeScript)

- **Status**: Accepted
- **Context**: The platform encompasses shared schemas, calculation engines, front-end web studio, renderer workers, and end-to-end test suites. Managing separate repositories creates synchronization friction and version skew for the document AST.
- **Decision**: Adopt a pnpm workspace monorepo with root-level TypeScript strict configuration, shared ESLint 9, and Vitest.
- **Consequences**:
  - Fast, disk-efficient dependency deduplication via hard links.
  - Zero-latency local package references (`workspace:*`).
  - Strict boundary enforcement between UI and background workers.

---

## ADR 002: PDF Generation Engine (Playwright Headless Chromium vs PDFKit / Puppeteer)

- **Status**: Accepted
- **Context**: E-paper documents require complex typography (multi-script BiDi, ligatures, web fonts), CSS Grid / Flexbox column balancing, and vector fidelity. Low-level imperative libraries (e.g., PDFKit, jsPDF) lack modern CSS layout and multilingual text shaping support.
- **Decision**: Use Playwright with headless Chromium to render HTML/CSS directly to vector PDF via `page.pdf()`.
- **Consequences**:
  - Full support for modern CSS layout (CSS Paged Media, `@page`, columns, flexbox).
  - Native multilingual font rendering and HarfBuzz text shaping handled by the browser engine.
  - Higher memory footprint per worker than raw PDF libraries; mitigated by recycling worker browser contexts.

---

## ADR 003: Database, Auth & Realtime Platform (Supabase PostgreSQL)

- **Status**: Accepted
- **Context**: The platform requires multi-tenant isolation, real-time collaboration, asynchronous job queuing, file storage for PDF assets, and user authentication.
- **Decision**: Standardize on Supabase (PostgreSQL, Row-Level Security, Storage, Auth, pg_cron).
- **Consequences**:
  - Tenant security enforced directly at the database layer via RLS.
  - S3-compatible asset storage integrated without external service sprawl.
  - Local emulation supported via `supabase start` and pgTAP testing.

---

## ADR 004: Multilingual Typography Strategy (Server-Side Bundled Web Fonts)

- **Status**: Accepted
- **Context**: E-ink displays have physical limitations: thin fonts render jaggedly or disappear, while missing glyphs cause catastrophic layout breakage.
- **Decision**: Host curated, e-ink optimized open-source font subsets (Literata, Newsreader, Noto series) directly in the platform storage and embed them into the rendered documents.
- **Consequences**:
  - Predictable rendering without external Google Fonts CDN downtime or layout shifts.
  - Guaranteed fallback chains across Arabic, Hebrew, CJK, and Indic scripts.

---

## ADR 005: 16-Level Grayscale & Dithering Pipeline

- **Status**: Accepted
- **Context**: Most e-paper hardware displays support 16 levels of electrophoretic grayscale. Continuous-tone color photographs or light gray text look muddy or illegible on e-ink.
- **Decision**: Implement client-side e-ink preview filters and optional server-side Floyd-Steinberg / Atkinson error-diffusion dithering for raster imagery.
- **Consequences**:
  - Users can preview exactly how their publication looks on an e-paper device before generating the PDF.
  - Enhanced contrast and crispness for embedded photos and diagrams.

---

## Unresolved Questions & Technical Spikes

1. **Syncing to reMarkable Cloud**: Should reMarkable integration rely on the un-official REST API or prompt users to use the desktop companion app / email?
   - _Status_: Open spike for Phase 6.
2. **Offline-first Studio**: Should `apps/web` support full offline editing using IndexedDB and CRDTs (Yjs)?
   - _Status_: Open for architectural review after Phase 5.
3. **Queue Technology for Massive Concurrency**: For high-volume burst delivery (e.g. 50,000 daily morning deliveries at 6:00 AM), should we utilize PostgreSQL `pg_cron` + `SKIP LOCKED` or transition to Redis BullMQ / AWS SQS?
   - _Status_: Start with PostgreSQL queue table in Phase 4; measure throughput benchmarks before Phase 6.
