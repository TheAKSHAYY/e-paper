# E-Paper Designer Technical Audit Report

**Date**: October 28, 2026  
**Auditor**: Senior Systems & Frontend Engineer  
**Scope**: Read-only technical audit of the E-Paper Designer in the `XRounder` (E-Paper Studio) monorepo.  
**Constraint Verification**: No modifications, renames, refactorings, or package installations have been made to existing files.

---

## A. Executive Summary

1. **Architecture Overview**: The workspace implements an e-paper publishing tool across a React 19 + TypeScript + Vite frontend (`apps/web`), a Playwright/Node.js PDF worker (`apps/renderer`), and workspace packages (`@epaper-studio/document-schema`, `template-engine`, `typography`, `ui`).
2. **Dual-Renderer Divergence**: The editor canvas (`NewspaperCanvas.tsx`) and the PDF generation engine (`template-engine/src/index.ts` via Playwright Chromium) use completely separate rendering implementations, duplicating layout rules, CSS variables, and element structures.
3. **Preset Placement Degradation**: While presets define rich element structures (Rashifal, Ads, Short News, Custom Borders), placing a preset via `handleAddBlock` in `apps/web/src/App.tsx` discards specialized styling, borders, and structured fields, flattening them into generic article instances.
4. **State & Reactivity Bottlenecks**: State management is handled through a single unmemoized `useState` at root (`App.tsx`), triggering full root-to-leaf re-renders on every keystroke in inspector panels. No Undo/Redo mechanism exists.
5. **Persistence Realities**: Cloud persistence is non-existent (Supabase migration is an empty stub with no tables). Storage relies exclusively on client `localStorage`, creating acute data loss risks when storing base64-encoded images.
6. **Devanagari Typography Vulnerabilities**: Google Fonts are loaded over CDN without local offline fallbacks. Default CSS rules (`hyphens: auto`, standard `justify`, CSS drop-caps) threaten ligature formation, shirorekha continuity, and matra placement.
7. **Print Geometry & Sizing**: The Playwright renderer correctly applies exact page dimensions in inches matching standard Indian broadsheet/tabloid standards, but client-side overflow checks are bypassed before PDF delivery.
8. **Recommendation**: RETAIN `@epaper-studio/document-schema` and `@epaper-studio/typography`; REFACTOR `apps/renderer` and state management; REDESIGN `NewspaperCanvas.tsx` and `template-engine` into a single shared page layout engine.

---

## B. Current Architecture Map

### System Component & Data Flow Architecture

```
                                  +---------------------------------------+
                                  |         apps/web/src/App.tsx          |
                                  |  - Root state: document (useState)    |
                                  |  - Selection: selectedArticleId       |
                                  |  - Zoom, Active Page, Tab State       |
                                  +---------------------------------------+
                                        /            |             \
            +--------------------------+             |              +--------------------------+
            | User Action                            | State Flow                              | User Inspection
            v                                        v                                         v
+------------------------+              +--------------------------+              +--------------------------+
| LeftSidebar.tsx /      |              |   NewspaperCanvas.tsx    |              | ContextualInspector.tsx  |
| ElementsPanel.tsx /    |              |                          |              | - Headline / Body edits  |
| MastheadGalleryModal   |              | - Page Dimensions Calc   |              | - BorderControls.tsx     |
| - Preset selection     |              | - Screen DPI Scaling     |              | - Multi-col / Placement  |
| - Add Block / Template |              | - 12-Column Grid (CSS)   |              | - Typography settings    |
+------------------------+              | - Direct React DOM nodes |              +--------------------------+
            |                           +--------------------------+                           |
            | handleAddBlock()                       |                                         | handleUpdateArticle()
            | (DISCARDS preset schema!)              | Live Canvas Render                      | (Creates new doc ref)
            v                                        v                                         v
+------------------------------------------------------------------------------------------------------+
|                                    Document State (NewspaperDocument)                                |
|                                packages/document-schema/src/index.ts                                 |
+------------------------------------------------------------------------------------------------------+
            |                                                                       |
            | Debounced Save (800ms)                                                | Export PDF Click
            v                                                                       v
+------------------------------------------+               +-------------------------------------------+
| LocalStorageDraftAdapter.ts              |               | apps/web/src/utils/pdfExport.ts           |
| - Key: epaper_studio_draft_doc_v1_<id>   |               | - POST /api/render-pdf                    |
| - Key: epaper_studio_drafts_index_v1     |               |   Payload: NewspaperDocument              |
| - Storage: window.localStorage (5-10MB)  |               +-------------------------------------------+
| - Supabase: UNUSED (tables missing)      |                                     |
+------------------------------------------+                                     | Dev: Vite Middleware Plugin
                                                                                 | Prod: Fastify/Node HTTP
                                                                                 v
                                                           +-------------------------------------------+
                                                           | apps/renderer/src/index.ts                |
                                                           | (Playwright Headless Chromium)            |
                                                           +-------------------------------------------+
                                                                                 |
                                                                                 | Calls renderNewspaperDocumentToHtml()
                                                                                 v
                                                           +-------------------------------------------+
                                                           | packages/template-engine/src/index.ts     |
                                                           | - DIVERGENT HTML STRING RENDERER          |
                                                           | - Injects Google Fonts @import            |
                                                           | - Generates multi-page print CSS          |
                                                           +-------------------------------------------+
                                                                                 |
                                                                                 | page.setContent() & page.pdf()
                                                                                 v
                                                           +-------------------------------------------+
                                                           | Raw PDF Buffer -> Browser Blob Download   |
                                                           +-------------------------------------------+
```

---

## C. Component-by-Component Verdict Table

| File Path | What It Does | Verdict | Evidence (Code Citations) | Risk |
| :--- | :--- | :--- | :--- | :--- |
| `apps/web/src/components/studio/NewspaperCanvas.tsx` | Renders the visual newspaper canvas, paper boundary, grid overlay, masthead, and page articles in the browser workspace. | **REDESIGN** | Lines 71–427: Calculates scale via CSS `transform`, duplicates 12-column CSS grid inline, and hardcodes custom JSX blocks for articles rather than using a unified renderer. | High. Diverges visually and structurally from the PDF output generated by `template-engine`. |
| `apps/web/src/components/studio/LeftSidebar.tsx` | Vertical tool rail managing studio navigation tabs (Templates, Elements, Pages, Masthead, Styles, Print Preview). | **RETAIN** | Lines 1–134: Clean tab navigation, accessible buttons, handles tool switching cleanly with zero state mutation leaks. | Low. Minimal architectural debt. |
| `apps/web/src/components/studio/ElementsPanel.tsx` | Preset gallery offering editorial elements (lead story, banner ads, rashifal, 3-column analysis, breaking alerts). | **REFACTOR** | Lines 18–191 define rich `ELEMENT_PRESETS` with specialized types (`ad`, `rashifal`, `borders`), but `onAddBlock` callback passes them into `App.tsx` which discards these fields. | High. Users expect rich preset layouts, but placing them discards properties. |
| `apps/web/src/components/studio/MastheadGalleryModal.tsx` | Modal presenting curated Hindi and bilingual masthead designs for one-click placement. | **REFACTOR** | Lines 1–280: Renders masthead previews. Applies presets by completely replacing `document.masthead` using deep clone. | Medium. Lacks preview responsiveness and has minor styling divergence from canvas. |
| `apps/web/src/components/studio/LayoutBuilderRow.tsx` | Structural editor row control for manipulating column spans, row ordering, and element insertion. | **RETAIN** | Clean modular component for grid row manipulation with clear props. | Low. Functional helper component. |
| `apps/web/src/components/studio/ContextualInspector.tsx` | Right-side properties inspector for typography, borders, column spans, images, and content editing. | **REFACTOR** | Lines 53–560: Monolithic form directly updating top-level document on every keystroke. Lacks local debounce for text fields. | Medium. Degrades performance on long editorial articles. |
| `apps/web/src/components/studio/BorderControls.tsx` | Sub-inspector component configuring newspaper borders (thin, double, thick header, ornamental). | **RETAIN** | Lines 1–112: Cleanly extracts border styles and updates `ArticleBorder` schema fields. | Low. Clean reusable component. |
| `apps/web/src/components/studio/ProjectSetupModal.tsx` | Initial onboarding wizard for setting publication title, language, paper size, and starter template. | **RETAIN** | Lines 1–268: Cleanly initializes `NewspaperDocument` adhering strictly to `@epaper-studio/document-schema`. | Low. Good onboarding UX. |
| `apps/web/src/components/studio/PageManagerDrawer.tsx` | Bottom drawer for adding, reordering, duplicating, and deleting publication pages. | **RETAIN** | Accurately manages multi-page array within `document.pages`. | Low. Meets functional requirements. |
| `apps/web/src/components/studio/MobileBottomNav.tsx` | Bottom navigation bar for viewport widths `< 768px` to trigger mobile editing drawers. | **RETAIN** | Well-scoped mobile accessibility drawer trigger. | Low. Responsive design utility. |
| `apps/web/src/components/landing/LandingPage.tsx` | Marketing landing page detailing E-Paper Studio capabilities, templates, and entry CTA. | **RETAIN** | Lines 1–350: Independent marketing page. Does not interfere with editor core. | Low. Non-critical to core studio engine. |
| `packages/document-schema/src/index.ts` | Canonical Zod schemas (`NewspaperDocument`, `NewspaperPage`, `Article`, `MastheadConfig`, physical page sizes). | **RETAIN** | Lines 1–326: Robust, strictly typed, comprehensive Zod validation with standard Indian print sizes. | Low. Excellent foundation to build upon. |
| `packages/template-engine/src/index.ts` | Server/PDF HTML generator producing print markup from document data. | **REDESIGN** | Lines 1168–1396: Completely separate string-concatenation renderer duplicating all styling logic found in `NewspaperCanvas.tsx`. | High. Violates Principle #2 (divergent rendering engine). |
| `packages/typography/src/index.ts` | Multilingual font definitions, pairings, Google Fonts URLs, and optical sizing metrics. | **RETAIN** | Lines 1–142: Curates 8 top Devanagari fonts with optical pairing recommendations. | Low. Excellent domain-specific font token repository. |
| `packages/ui/src/index.ts` | Shared UI tokens, paper styling, theme variables, and basic button primitives. | **RETAIN** | Clean token distribution package. | Low. Stable design tokens. |
| `apps/renderer/src/index.ts` & `server.ts` | Playwright Chromium PDF worker, SSRF protection, and print layout execution service. | **REFACTOR** | Chromium execution is solid, but font loading synchronization is fragile (3000ms race) and overflow warnings are swallowed. | Medium. Needs font-ready verification and explicit error propagation. |
| `apps/web/src/storage/LocalStorageDraftAdapter.ts` | Local browser persistence layer for draft autosave and retrieval. | **REFACTOR** | Stores raw base64 images inside `localStorage`, crashing browser quota (5MB). Supabase integration is completely missing. | High. Guaranteed data loss on image-heavy multi-page editions. |

---

## D. Answers to Questions 1–12 (with Code Citations)

### 1. PDF Renderer: Architecture & Schema Alignment
* **Library/Approach**: Uses **Playwright Headless Chromium** via `chromium.launch({ headless: true })` ([`apps/renderer/src/index.ts:183`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/renderer/src/index.ts#L183)). It calls `page.setContent(html, { waitUntil: 'networkidle' })` ([`apps/renderer/src/index.ts:208`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/renderer/src/index.ts#L208)) followed by `page.pdf(...)` ([`apps/renderer/src/index.ts:241`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/renderer/src/index.ts#L241)).
* **Execution Location**:
  * In development, it runs in Node.js within the Vite development server via a custom Connect middleware plugin `newspaperPdfServerPlugin` ([`apps/web/vite.config.ts:9-39`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/vite.config.ts#L9-L39)) importing `RendererWorker` directly.
  * In standalone production mode, it runs as an HTTP server powered by Node.js built-in `http` on port 4000 ([`apps/renderer/src/server.ts:78-106`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/renderer/src/server.ts#L78-L106)).
* **Schema Consumption**: Yes, it accepts the exact `NewspaperDocument` schema validated via `NewspaperDocumentSchema.parse(payload)` ([`apps/renderer/src/index.ts:175`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/renderer/src/index.ts#L175)).

### 2. Data Flow: Editor Read/Write vs. Document Schema
* The editor reads and writes using the canonical types from `@epaper-studio/document-schema`. Top-level document state is stored directly as a `NewspaperDocument` object in `App.tsx` ([`apps/web/src/App.tsx:34`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/App.tsx#L34)).
* **Step-by-Step Data Flow**:
  1. **User Edit**: User modifies a headline or body text in `ContextualInspector.tsx`.
  2. **State Dispatch**: `ContextualInspector.tsx` calls `onUpdateArticle(updatedArticle)` which triggers `handleUpdateArticle` in `App.tsx:427-440`.
  3. **State Mutation**: `setDocument((prev) => ...)` updates the specific article within `pages[pageIndex].articles` and returns a new document reference.
  4. **Autosave**: A `useEffect` hook in `App.tsx:109-122` detects document changes and schedules a debounced save (800ms) to `draftStorage.saveDraft(document)`.
  5. **Persistence**: `LocalStorageDraftAdapter.ts:74-98` validates the object against `NewspaperDocumentSchema` and writes serialized JSON into `window.localStorage.setItem('epaper_studio_draft_doc_v1_<id>', json)`.
  6. **Reload/Mount**: On page refresh, `App.tsx:75-92` reads the draft ID from URL params or index, calls `draftStorage.getDraft(id)`, and initializes `setDocument(draft)`.
  7. **PDF Generation**: User clicks "Export PDF" in `App.tsx:442`. `exportDocumentToPdf(document)` in `apps/web/src/utils/pdfExport.ts:13-33` sends `POST /api/render-pdf` with the raw document JSON. The backend passes it to `renderNewspaperDocumentToHtml(doc)` in `packages/template-engine/src/index.ts:1168` and returns a binary PDF blob.

### 3. Canvas vs. PDF Renderer Divergence
* **NewspaperCanvas State**: `NewspaperCanvas.tsx` reads directly from the document schema passed via props (`document: NewspaperDocument`, `page: NewspaperPage`).
* **Shared Component Assessment**: **No shared renderer exists**. There are **two completely separate rendering engines**:
  1. **Editor Canvas Renderer**: `apps/web/src/components/studio/NewspaperCanvas.tsx` renders dynamic React JSX elements with inline CSS styles, viewport zoom scaling (`transform: scale(...)`), selection halos, and editing widgets.
  2. **PDF HTML Renderer**: `packages/template-engine/src/index.ts` (`renderNewspaperDocumentToHtml`) generates a monolithic static HTML string via string interpolation with print-specific `@page` CSS rules.
* **Impact**: Visual adjustments made to the canvas (grid gutters, paddings, border calculations, font sizing, line heights) do not automatically reflect in the PDF export unless manually synchronized in both source files.

### 4. Document Model Analysis
* **Schema Definition**: Defined in `packages/document-schema/src/index.ts:187-217` (`NewspaperDocumentSchema`).
* **Hierarchy**: Semi-nested.
  * Root level holds metadata (`id`, `title`, `date`, `edition`, `language`, `paperSize`), global `masthead: MastheadConfigSchema`, and `layout: NewspaperLayoutConfigSchema`.
  * Multi-page hierarchy: `pages: z.array(NewspaperPageSchema)`. Each page contains `pageNumber`, `pageLabel`, and `articles: z.array(ArticleSchema)`.
  * *Legacy Duplication*: The root document also contains a top-level `articles: z.array(ArticleSchema)` property ([`packages/document-schema/src/index.ts:209`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/document-schema/src/index.ts#L209)) alongside `pages[].articles`. In `App.tsx:48`, helper function `getPublicationPages(doc)` normalizes this, but having dual locations for articles introduces synchronization hazards.
* **Schema Versioning**: `version: z.literal('1.0.0')` is enforced ([`packages/document-schema/src/index.ts:192`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/document-schema/src/index.ts#L192)). **No migration engine exists**. If an older document schema is loaded, `parse()` will throw a `ZodError` and fail to open.
* **Units**: **Mixed & Inconsistent**.
  * Physical dimensions in `PAGE_SIZE_DEFINITIONS` are defined in points (`widthPt`, `heightPt`), millimeters (`widthMm`, `heightMm`), and inches (`widthIn`, `heightIn`) ([`packages/document-schema/src/index.ts:11-37`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/document-schema/src/index.ts#L11-L37)).
  * Layout grid configuration stores padding in pixels (`paddingPx: 24`, `columnGapPx: 12`) ([`packages/document-schema/src/index.ts:180-184`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/document-schema/src/index.ts#L180-L184)).
  * Typography stores sizes in points (`headlineSizePt`, `bodySizePt`) ([`packages/document-schema/src/index.ts:60-63`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/document-schema/src/index.ts#L60-L63)).

### 5. Presets & Editability Lifecycles
* **Preset Representation**:
  * Masthead presets are defined as static data objects in `packages/template-engine/src/index.ts:22-104` (`NEWSPAPER_PRESETS`).
  * Article/Block presets are defined in `apps/web/src/components/studio/ElementsPanel.tsx:18-191` (`ELEMENT_PRESETS`).
* **Placement & Deep Copying**:
  * When applying a masthead preset (`App.tsx:476-492`), the preset config is deep-copied via object spread (`...preset.masthead`) into `document.masthead`. It becomes completely independent and editable.
* **CRITICAL DEFECT in Block Placement (`App.tsx:384-425`)**:
  * While `ElementsPanel.tsx` defines distinct element types (e.g., `id: 'banner-ad'`, `id: 'rashifal-daily'`, `id: 'short-news-bulletin'`) with custom borders, background colors, and specialized data structures (`rashifalItems`, `advertisementData`), the insertion function `handleAddBlock` in `App.tsx:384-425` **drops these fields entirely**:
    ```typescript
    // apps/web/src/App.tsx:391-403
    const newArticle: Article = {
      id: `art_${Date.now()}_...`,
      title: preset.title,
      kicker: preset.kicker,
      body: preset.body,
      columnSpan: preset.columnSpan,
      rowSpan: preset.rowSpan,
      category: preset.category || 'General',
      // NOTICE: preset.borders, preset.backgroundColor, preset.textColor,
      // preset.rashifalItems, preset.advertisementData are NOT transferred!
    };
    ```
  * As a consequence, specialized blocks are coerced into standard articles, discarding their preset styling.

### 6. State Management & Re-render Analysis
* **State Framework**: Pure React `useState` at the root component level (`apps/web/src/App.tsx:34-45`). No Zustand, Redux, or React Context is employed.
* **Undo/Redo**: **Not implemented**. There is zero history tracking, command stack, or snapshot buffer. Any accidental deletion or content modification is immediate and irreversible.
* **Selection State**: Stored separately in `App.tsx` local state (`selectedArticleId: string | null`, `isMastheadSelected: boolean`) ([`apps/web/src/App.tsx:40-41`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/App.tsx#L40-L41)). It is not stored in the document schema.
* **Unnecessary Full-Canvas Re-renders**:
  * In `apps/web/src/App.tsx:427-440`, updating any property in `ContextualInspector.tsx` executes:
    ```typescript
    setDocument((prev) => ({ ...prev, pages: updatedPages }));
    ```
  * Because `document` is passed as a top-level prop to `NewspaperCanvas.tsx` without React memoization (`React.memo`) or granular selector subscription, **every single keystroke in the headline or body text input forces a full re-render of the entire newspaper canvas, all sibling articles, the masthead, and all inspector controls**.

### 7. Persistence Architecture & Failure Modes
* **Storage Location**: Exclusively client-side `window.localStorage` via `LocalStorageDraftAdapter.ts` ([`apps/web/src/storage/LocalStorageDraftAdapter.ts:74-98`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/storage/LocalStorageDraftAdapter.ts#L74-L98)).
* **Supabase Status**: **Completely non-functional / unconfigured**.
  * The migration file `supabase/migrations/00000000000000_initial_schema.sql` only enables the `uuid-ossp` extension; it defines zero tables for publications, drafts, articles, or users.
  * No Supabase JavaScript client is instantiated in the studio workspace.
* **Image Handling**: User-uploaded images are read via `FileReader.readAsDataURL()` and written directly into `article.imageUrl` as **raw Base64 strings** ([`apps/web/src/components/studio/ContextualInspector.tsx:392-404`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/components/studio/ContextualInspector.tsx#L392-L404)).
* **Failure Modes & Data Loss**:
  * Writing high-resolution photos as Base64 strings into `localStorage` quickly exceeds the browser quota limit (typically 5MB–10MB).
  * When `localStorage.setItem` throws `QuotaExceededError`, `LocalStorageDraftAdapter.ts:95-97` catches the error, logs `console.error`, and swallows it without alerting the user. The UI indicates "Saved" while local changes are dropped.
* **Reopen Restoration**: If data fits within storage quota, reopening restores text and configuration accurately. However, there is no remote backup or cross-device draft access.

### 8. Hindi (Devanagari) Typography Analysis
* **Fonts Configured**: Defined in `packages/typography/src/index.ts:12-70` (`DEVANAGARI_FONTS`). Curates 8 Google Fonts:
  * Display / Headlines: *Rozha One*, *Yatra One*.
  * Editorial / Body: *Noto Serif Devanagari*, *Tiro Devanagari Hindi*.
  * Modern / Clean: *Poppins*, *Mukta*, *Hind*, *Gotu*.
* **Font Loading Mechanism**:
  * Loaded externally from Google Fonts CDN via stylesheet link:
    `https://fonts.googleapis.com/css2?family=Gotu&family=Hind:...&display=swap` ([`packages/typography/src/index.ts:74-76`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/typography/src/index.ts#L74-L76)).
  * **No self-hosted WOFF2 fonts exist** in the repository.
* **Font Loading Gate before PDF Export**:
  * In `apps/renderer/src/index.ts:210-221`, the renderer executes:
    ```typescript
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);
      }
    });
    ```
  * If Google Fonts CDN experiences network latency or fails in an offline/airgapped environment, the 3-second timeout expires, causing Chromium to fall back to generic system fonts and generating mismatched character metrics in the PDF.
* **Devanagari Typography Risks**:
  1. **Justification Word-Spacing**: `packages/template-engine/src/index.ts:771` sets `text-align: justify`. Without `text-justify: inter-word` and proper micro-typography tuning, Chromium expands letter-spacing or creates huge unsightly gaps between Devanagari words.
  2. **Shirorekha Disruption**: In `NewspaperCanvas.tsx:288`, letter-spacing controls are available. Applying custom `letter-spacing` to Devanagari breaks the continuous top headline hanging line (*shirorekha*).
  3. **Hyphenation Breaking Conjuncts**: `packages/template-engine/src/index.ts:773` sets `hyphens: auto`. Standard CSS auto-hyphenation algorithms lack correct syllable break dictionaries for Hindi, regularly severing half-consonants (*halants*) and separating dependent vowel signs (*matras*) from their base consonants.
  4. **Drop-Caps Severing Clusters**: `packages/template-engine/src/index.ts:784` applies `:first-letter` styling for drop-caps. In Devanagari, conjuncts (e.g., "क्ष" in "क्षत्रिय" or "श्र" in "श्रद्धा") or consonant-vowel combinations (e.g., "कि" in "किताब") are treated by CSS `:first-letter` as single unicode characters rather than grapheme clusters, isolating the vowel sign or half-glyph and corrupting the word.

### 9. Print Fidelity & Physical Geometry
* **Page Sizes & Margins**:
  * Defined in `packages/document-schema/src/index.ts:11-37` (`PAGE_SIZE_DEFINITIONS`):
    * *Broadsheet*: 15.0 in × 22.75 in (381.0 mm × 577.85 mm / 1080 pt × 1638 pt).
    * *Tabloid*: 11.0 in × 17.0 in (279.4 mm × 431.8 mm / 792 pt × 1224 pt).
    * *A3*: 11.69 in × 16.54 in (297.0 mm × 420.0 mm / 841.89 pt × 1190.55 pt).
    * *A4*: 8.27 in × 11.69 in (210.0 mm × 297.0 mm / 595.28 pt × 841.89 pt).
* **Export PDF Page Dimensions**:
  * In `apps/renderer/src/index.ts:241-255`, `page.pdf()` uses physical dimensions directly:
    ```typescript
    width: `${pageSizeDef.widthIn}in`,
    height: `${pageSizeDef.heightIn}in`,
    margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
    printBackground: true,
    preferCSSPageSize: true,
    ```
  * Exported PDF page dimensions strictly match the selected paper size.
* **Editor UI Leakage**:
  * **No editor UI leaks into the PDF**. Because `apps/renderer` uses `renderNewspaperDocumentToHtml()` to build clean static HTML rather than capturing a screenshot or cloning the live editor DOM, selection handles, blue outline rings, and resize bars never appear in the export.

### 10. Overflow & Layout Diagnostics
* **Server-Side Diagnostic**: `apps/renderer/src/index.ts:223-239` executes an overflow check in Chromium:
  ```typescript
  const overflowCheck = await page.evaluate(...)
  ```
  It measures whether `scrollHeight > clientHeight + 10`.
* **Export Gate Failure**: While `RendererWorker` detects overflows and records diagnostics, `apps/web/vite.config.ts:31-35` and `apps/renderer/src/server.ts:98-100` **completely ignore the overflow result and stream the PDF anyway**.
* **Canvas Pre-Flight**: `NewspaperCanvas.tsx:142` has a rudimentary estimated word count alert (`totalWords > wordBudget`), but does not perform real DOM bounding-box clipping analysis. Missing images simply render as empty placeholder boxes without blocking export.

### 11. Testing & Verification Coverage
* **Existing Tests**:
  * `packages/document-schema/src/__tests__/document-schema.test.ts`: Validates Zod schema parsing, defaults, and page sizes.
  * `packages/template-engine/src/__tests__/template-engine.test.ts`: Verifies HTML generation and preset structures.
  * `packages/typography/src/__tests__/typography.test.ts`: Verifies font weights and font cascade pairings.
  * `packages/ui/src/__tests__/ui.test.ts`: Tests basic design tokens and theme variables.
  * `apps/web/src/storage/__tests__/LocalStorageDraftAdapter.test.ts`: Tests local storage CRUD operations and quota handling.
  * `apps/renderer/src/__tests__/renderer.test.ts`: Tests `RendererWorker` instantiations and mock PDF calls.
* **Completely Untested Areas**:
  * No visual regression testing for 12-column grid alignment.
  * Zero tests for Devanagari ligature rendering or conjunct preservation under print scale.
  * No component tests for `NewspaperCanvas.tsx`, `ContextualInspector.tsx`, or `ElementsPanel.tsx`.
  * No end-to-end user journey tests (e.g., Select Template → Edit Headline → Upload Image → Download PDF).

### 12. Mobile & Touch Screen Behavior
* **Responsive Architecture**:
  * Handled via `windowWidth < 768px` in `App.tsx:37` and rendered via `MobileBottomNav.tsx` ([`apps/web/src/components/studio/MobileBottomNav.tsx:1-85`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/components/studio/MobileBottomNav.tsx#L1-L85)).
  * Four mobile drawer tabs: `pages`, `blocks`, `inspector`, and `presets`.
* **Touch & Canvas Constraints**:
  * The canvas is rendered inside an `overflow: auto` container with a manual zoom scale dropdown.
  * Pinch-to-zoom is not natively supported via touch gestures.
  * Dragging elements across a 12-column broadsheet grid on a mobile device is virtually impossible due to dense touch targets and fixed column layouts. The mobile view functions as an emergency content editor rather than a full page layout designer.

---

## E. Top 10 Risks (Ranked by Severity)

| Rank | Risk Category | Risk Description | Code Location | Consequence |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Data Loss** | Base64 images stored inside `window.localStorage` exceed the 5MB browser quota, causing silent autosave failures. | `LocalStorageDraftAdapter.ts:95-97` | User loses entire edition work without warning. |
| **2** | **PDF Mismatch** | Canvas and PDF export run on two independent rendering engines with diverging CSS and HTML structures. | `NewspaperCanvas.tsx` vs `template-engine/src/index.ts` | What user designs on screen does NOT match final printed PDF. |
| **3** | **Data Corruption** | `handleAddBlock` strips away specialized preset properties (`borders`, `backgroundColor`, `rashifalItems`, `advertisementData`). | `apps/web/src/App.tsx:391-403` | Non-standard editorial blocks (Ads, Rashifal) break upon placement. |
| **4** | **Typography Defect** | CSS `:first-letter` drop-caps and `hyphens: auto` sever Devanagari conjuncts and matras. | `template-engine/src/index.ts:773, 784` | Unreadable, linguistically mangled Hindi headlines and paragraphs. |
| **5** | **Offline Vulnerability** | PDF renderer depends on external Google Fonts CDN with an arbitrary 3000ms race timeout. | `apps/renderer/src/index.ts:213-219` | Font loading fails offline or during network spikes, producing broken fallback fonts. |
| **6** | **Performance** | Entire canvas and root tree re-renders on every single keystroke in inspector fields due to unmemoized state. | `apps/web/src/App.tsx:427-440` | Severe input lag and stuttering during text composition on large multi-page documents. |
| **7** | **Zero Recovery** | No Undo/Redo history stack implemented anywhere in the studio application. | Entire `apps/web` codebase | Accidental element deletion or layout destruction cannot be reverted. |
| **8** | **Persistence Gap** | Supabase database tables for publications, drafts, and assets do not exist; schema is an empty stub. | `supabase/migrations/` | Zero multi-device syncing, team collaboration, or persistent storage. |
| **9** | **Silent Overflow** | Server-side text and height overflow detections are logged but ignored before delivering PDF to user. | `apps/renderer/src/server.ts:98-100` | Exported PDFs print with truncated articles and cut-off editorial content. |
| **10** | **Mobile Failure** | Desktop 12-column broadsheet canvas has no responsive touch or pinch-to-zoom interaction engine. | `apps/web/src/components/studio/NewspaperCanvas.tsx` | Mobile users cannot effectively position, resize, or navigate multi-column layouts. |

---

## F. Gaps vs. Redesign Principles

### 1. Principle 1: One Document JSON as Single Source of Truth
* **Status**: **Partially Adhered to with Latent Duplication**.
* **Gaps**:
  * Root-level `articles: z.array(ArticleSchema)` coexists with `pages[].articles: z.array(ArticleSchema)` in `packages/document-schema/src/index.ts:209`.
  * Selection state (`selectedArticleId`, `isMastheadSelected`) is kept outside the document in ad-hoc React state, requiring fragile parallel state tracking.
  * No schema version migration system exists to handle schema evolution.

### 2. Principle 2: One Shared Layout Engine (No Diverging Renderers)
* **Status**: **VIOLATED**.
* **Gaps**:
  * `NewspaperCanvas.tsx` renders dynamic React JSX and inline styles in the browser.
  * `renderNewspaperDocumentToHtml()` in `packages/template-engine/src/index.ts` generates static HTML via string interpolation.
  * Changes to margins, column rules, dividers, font sizes, or padding in one file do not update the other, guaranteeing layout divergence between editor and PDF.

### 3. Principle 3: Presets as Deep-Copied, Independent Document Fragments
* **Status**: **VIOLATED in Article Elements; Partially Upheld in Masthead**.
* **Gaps**:
  * Masthead presets are cleanly deep-copied into `document.masthead`.
  * Article and block presets defined in `ElementsPanel.tsx` are mangled during insertion by `handleAddBlock()` in `App.tsx`, which drops border configurations, custom backgrounds, and specialized sub-items.

### 4. Principle 4: Flawless Hindi (Devanagari) Typography
* **Status**: **UNFULFILLED & VULNERABLE**.
* **Gaps**:
  * No self-hosted fonts; relies entirely on external Google Fonts CDN.
  * Drop-caps use CSS `:first-letter`, which breaks Devanagari unicode grapheme clusters.
  * Auto-hyphenation is enabled without Hindi hyphenation dictionaries, splitting conjuncts and matras across line ends.
  * Letter-spacing controls do not disable tracking for Devanagari scripts, threatening shirorekha continuity.

---

## G. Open Questions for the Product Owner

1. **Storage & Cloud Strategy**: Is Supabase planned to be the primary database for user accounts, publications, and asset uploads, or is the application expected to support an offline-first / local-first architecture?
2. **Image Hosting Infrastructure**: Where should user images be stored? Should we integrate Supabase Storage with signed upload URLs and image optimization transforms, rather than saving Base64 strings?
3. **Collaboration & Undo/Redo**: Is real-time multi-user editing planned for future phases, or should we build a robust single-user Undo/Redo history stack (e.g., using Zustand with temporal middleware)?
4. **Devanagari Drop-Cap Editorial Policy**: In Indian print journalism, drop-caps in Hindi newspapers typically encompass the full syllable cluster (e.g., "प्र", "श्र", "स्था") rather than isolated Latin-style characters. Should drop-caps be disabled by default for Hindi editions or implemented using a grapheme-aware cluster parser?
5. **Print Bleed & Crop Marks**: Do commercial print houses requiring PDF export need professional bleed areas (e.g., 3mm), trim marks, and CMYK color space definitions, or is standard RGB page-dimensioned PDF sufficient?

---

## H. Recommended Next Steps (Small, Incremental, Regression-Minimizing)

The following steps provide an incremental modernization path without breaking existing workflows:

### Step 1: Self-Host Devanagari Fonts in `@epaper-studio/typography`
* Package WOFF2 font files directly into the repository.
* Configure `@font-face` rules to serve local fonts first, eliminating the external Google Fonts CDN dependency and the 3000ms network timeout in the PDF renderer.

### Step 2: Fix Preset Insertion in `App.tsx` (`handleAddBlock`)
* Update `handleAddBlock` in `apps/web/src/App.tsx:384` to preserve all preset properties:
  * Carry over `borders`, `backgroundColor`, `textColor`, `rashifalItems`, `shortNewsItems`, and `advertisementData` into the newly created `Article` object.

### Step 3: Implement an Image Blob Store to Prevent `localStorage` Quota Crashes
* Decouple image data from `localStorage` by implementing an IndexedDB storage adapter (e.g., via `idb-keyval`) for local image blobs, or uploading directly to object storage, storing only URI identifiers in the document JSON.

### Step 4: Unify the Page Layout Engine into a Single Shared Component
* Refactor `packages/template-engine` to export a unified page layout component (or shared HTML/CSS generator) that renders both the browser canvas in `NewspaperCanvas.tsx` and the headless Chromium page in `apps/renderer`.
* This eliminates visual divergence between the editor and exported PDFs.

### Step 5: Implement Zustand State Store with Undo/Redo History
* Replace root-level `useState` in `App.tsx` with a lightweight Zustand store.
* Apply temporal state middleware (`z-undo` or custom history stack) to provide full Undo/Redo capabilities and eliminate unnecessary re-renders via fine-grained component selectors.

### Step 6: Fix Hindi CSS Rules in the Print Engine
* Disable CSS `:first-letter` drop-caps on Devanagari text blocks unless wrapped in a cluster-aware element.
* Set `hyphens: none` for Hindi text containers and enforce `text-justify: inter-word` to ensure proper shirorekha continuity and prevent broken conjuncts.

---

## Hindi Typography Verification & Testing Analysis

### Test Case Strings
The following test strings were evaluated against the codebase typography engine:
* `"क्षत्रिय"` (Conjunct *ksha* + *tri* + *ya*)
* `"श्रद्धा"` (Conjunct *shra* + *ddha*)
* `"द्वारा"` (Conjunct *dva* + *ra*)
* `"कर्त्ता"` (Reph *r* + double *ta*)
* `"पूर्ण"` (Reph *r* + *na*)
* `"संघर्ष"` (Anusvara + conjunct *rsha*)
* `"प्रधानमंत्री नरेंद्र मोदी"` (Complex administrative title with multiple conjuncts and vowel modifiers)
* **Long Justified Paragraph**: Multi-line editorial text with Indian typography rules.

### Read-Only Technical Assessment & Potential Failure Points
Because the running application cannot be altered during this audit, the rendering behavior of these strings was audited directly from the CSS and engine implementation in `packages/template-engine/src/index.ts` and `apps/renderer/src/index.ts`:

1. **Drop-Cap Cluster Severing**:
   * If any article containing `"क्षत्रिय"` or `"श्रद्धा"` is set as a lead story with drop-caps enabled (`enableDropCap: true`), `packages/template-engine/src/index.ts:784` applies:
     ```css
     .newspaper-article-body.has-drop-cap p:first-of-type::first-letter {
       font-size: 3.2em;
       float: left;
       ...
     }
     ```
   * **Failure Mode**: The browser CSS engine isolates only the first unicode scalar value (`U+0915` - क्) rather than the entire conjunct cluster (`क् + ् + ष` = क्ष). The vowel matra or conjunct companion drops down into the regular body font, resulting in an illegible, broken glyph cluster.

2. **Conjunct Severing on Line Wrap**:
   * In `packages/template-engine/src/index.ts:773`, `hyphens: auto` is specified for `.newspaper-article-body p`.
   * **Failure Mode**: Standard Chromium lacks hyphenation dictionaries for Devanagari script. In narrow newspaper columns (e.g., 2-column or 3-column span on a 12-column grid), words like `"प्रधानमंत्री"` or `"संघर्ष"` may be broken mid-conjunct at line ends, leaving a lone halant (`्`) or matra dangling at the start of the next line.

3. **Inter-Word Gaps in Justified Columns**:
   * `packages/template-engine/src/index.ts:771` specifies `text-align: justify` without `text-justify: inter-word`.
   * **Failure Mode**: In narrow columns, Chromium attempts to justify Devanagari lines by adding variable whitespace. Because letter-spacing expansion on Devanagari breaks the top horizontal shirorekha, words become disconnected, creating visual rivers of white space that violate Indian print standards.

### Summary of Typography Test
To achieve flawless print-ready Hindi output, the engine requires:
* Self-hosted Unicode fonts with full GSUB/GPOS OpenType tables.
* `hyphens: none` and `text-justify: inter-word; word-break: keep-all;` on all Devanagari body text.
* Grapheme-cluster-aware parsing for drop-caps rather than standard CSS `:first-letter`.
