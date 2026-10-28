# E-PAPER STUDIO — IMPLEMENTATION & VERIFICATION PLAN

## 1. Overview & Strategy

This ordered, dependency-aware plan outlines the step-by-step engineering sequence to upgrade E-Paper Studio into a professional, commercial-grade newspaper publishing platform for India.

---

## 2. Implementation Phases & Milestones

### Phase 1: Complete System Design & Architecture (Current Milestone)

- [x] Deliver 11 comprehensive architecture and design specification documents under `docs/product/`:
  - `PRODUCT-STRATEGY.md`
  - `PRODUCT-REQUIREMENTS.md`
  - `INFORMATION-ARCHITECTURE.md`
  - `USER-FLOWS.md`
  - `SYSTEM-ARCHITECTURE.md`
  - `DESIGN-SYSTEM.md`
  - `RESPONSIVE-ARCHITECTURE.md`
  - `DOCUMENT-MODEL.md`
  - `PDF-EXPORT-ARCHITECTURE.md`
  - `MONETIZATION-READINESS.md`
  - `IMPLEMENTATION-PLAN.md`

### Phase 2: Schema & Engine Upgrade (`document-schema` & `template-engine`)

- [ ] Upgrade `packages/document-schema/src/index.ts`:
  - Add `NewspaperPageSchema` supporting explicit multi-page publications (`pages: NewspaperPage[]`).
  - Add `NewspaperBlockType` and block schemas (`masthead`, `lead`, `major`, `minor`, `brief`, `photo`, `editorial`, `notice`).
  - Maintain backward compatibility with single-sheet `articles: Article[]`.
  - Rebuild `document-schema` (`pnpm --filter @epaper-studio/document-schema build`).
- [ ] Upgrade `packages/template-engine/src/index.ts`:
  - Update `createNewspaperDocument` to default to authentic Hindi newspaper _जनवाणी समाचार_ (Janwani Samachar) with comprehensive seed content.
  - Implement multi-page HTML compiler that respects explicit `doc.pages` or falls back to partition logic.
  - Generate inside page folios ("जनवाणी समाचार • पृष्ठ 2 • मंगलवार, 27 अक्टूबर 2026").
  - Rebuild `template-engine` (`pnpm --filter @epaper-studio/template-engine build`).

### Phase 3: Redesign the Studio UI & Components (`apps/web`)

- [ ] Transform `apps/web/src/App.tsx` and create modular components:
  - **Top Application Bar (`TopBar.tsx`)**: Clean English-first publishing bar with publication title, page switcher, save status indicator, undo/redo, responsive view modes, and primary "Export PDF" action.
  - **Left Navigation Drawer (`LeftSidebar.tsx`)**:
    - _Pages Tab_: Visual page list, Add Page (`+`), Duplicate Page, Reorder Up/Down, and Delete Page.
    - _Blocks Tab_: Categorized draggable and clickable newspaper block cards with Hindi preview badges.
    - _Templates Tab_: Visual layout presets with instant preview and safe content preservation.
    - _Drafts Tab_: Local drafts manager.
  - **Contextual Right Inspector (`ContextualInspector.tsx`)**:
    - Dynamically adapts: Page Geometry / Columns when nothing is selected; Masthead settings when page 1 masthead is selected; Story / Headline / Body / Image settings when an article is selected; Typography font picker.
  - **Responsive Newspaper Canvas (`NewspaperCanvas.tsx` / `NewspaperSheet.tsx`)**:
    - High-contrast newsprint background with authentic Devanagari styling.
    - Crisp column rules (`column-rule: 1px solid #d5d0c4`).
    - Visual drop zones, focus rings, and direct reordering action controls.
  - **Mobile Touch Navigation (`MobileBottomNav.tsx`)**:
    - Dedicated touch bottom bar for viewports <= 768px: Pages, Edit, Layout, and Export triggers with touch-friendly drawer sheets.

### Phase 4: Multi-Page Vector PDF Export Verification

- [ ] Verify `apps/renderer/src/index.ts` and `apps/web/vite.config.ts`:
  - Render all pages of multi-page publications in exact sequence into one vector PDF.
  - Ensure RFC 5987 / RFC 6266 Unicode HTTP header compliance for Hindi titles.
  - Test documents with 1, 2, 4, and 8 pages.

### Phase 5: Verification Suite & Viewport Testing

- [ ] Execute validation suite:
  - `pnpm format:check`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`
  - `pnpm build`
- [ ] Verify responsiveness across required viewports:
  - 1440×900 (Desktop Wide)
  - 1280×800 (Laptop)
  - 1024×768 (Tablet Landscape)
  - 768×1024 (Tablet Portrait)
  - 390×844 (Mobile Large)
  - 360×800 (Mobile Standard)
- [ ] Capture real screenshots from running application.

---

## 3. Definition of Done (DoD)

1. UI controls and navigation are clean, modern, and English-first by default.
2. Newspaper canvas is authentic Indian Hindi-first by default (_जनवाणी समाचार_).
3. Full multi-page management operates seamlessly (Add, Duplicate, Reorder, Delete).
4. Drag-and-drop and accessible block reordering work reliably without layout collapse.
5. Contextual right inspector switches controls dynamically based on active selection.
6. Unified multi-page vector PDF exports in correct sequence with verified MediaBox dimensions and zero font clipping.
7. Mobile and desktop interaction models are distinctly optimized for their respective form factors.
8. All linters, TypeScript checks, unit tests, and production builds pass with 0 errors.
