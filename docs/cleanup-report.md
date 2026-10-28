# E-Paper Studio: Column-Count Resolver Cleanup & Font Architecture Report

**Document Date:** 2026-10-28  
**Scope:** Verification Report for Task 1 (Column-Count Cleanup), Task 2 (Font-Loading Architecture & PDF Font Embedding), and Task 3 (Status & Verification)  
**Reference Document:** [`docs/parity-fixes-report.md`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/docs/parity-fixes-report.md)  
**Git Commits:**

- `4610992`: `fix(layout): add resolvePageColumnCount and apply per-page grid template` (Fix A)
- `2baa696`: `fix(renderer): add footer flex-shrink, CSS pixel viewport conversion, and export bounding box check` (Fix B)
- `41d6dd3`: `docs: add canvas coordinate scaling plan, parity report, and after snapshots` (Fix C & Snapshots)
- `c78e820`: `fix(layout): finish column-count resolver cleanup in inspector, app, and document-schema` (Task 1 Cleanup)

---

## 1. Task 1: Column-Count Resolver Cleanup

### 1.1 Summary of Changes

All direct reads of `layout.columnCount` / `document.layout.columnCount` used for page-level layout decisions have been replaced with the canonical `resolvePageColumnCount(doc, page)` function:

1. **`ContextualInspector.tsx:497` & `:516` (Span Label & Option Picker):**
   - Added `currentPage?: NewspaperPage` prop to `ContextualInspectorProps`.
   - Computed `const pageColumnCount = resolvePageColumnCount({ layout }, currentPage);`.
   - Line 497: Updated label from `कॉलम ({selectedArticle.columnSpan}/{layout.columnCount})` to `कॉलम ({selectedArticle.columnSpan}/{pageColumnCount})`.
   - Line 516: Replaced hardcoded `Math.max(12, layout.columnCount)` with `pageColumnCount`, offering exactly `1..pageColumnCount` columns (e.g. `1..12` on a 12-column page, or `1..4` on a 4-column page).
2. **`App.tsx:387` (`handleAddBlock` Default Span Calculation):**
   - In `handleAddBlock`, replaced `defaultColumnCount: document.layout.columnCount` with:
     ```ts
     const resolvedColumnCount = resolvePageColumnCount(document, currentPage);
     const newArticle = createArticleFromPreset(blockTemplate, {
       newId,
       defaultColumnCount: resolvedColumnCount,
       orderIndex: currentPage.articles.length,
     });
     ```
   - Passed `currentPage={currentPage}` to `<ContextualInspector ... />` in both desktop and mobile drawer mounts.
3. **`App.tsx:542` (`handleAdjustColumnSpan` Keyboard / Arrow Adjustments):**
   - Replaced `const maxCols = currentPage.columnCount ?? document.layout.columnCount` with `const maxCols = resolvePageColumnCount(document, currentPage);`.
4. **`packages/document-schema/src/index.ts` (`NewspaperPageSchema` & `getPublicationPages`):**
   - Fixed `NewspaperPageSchema.columnCount` validator from `.min(2).max(6).optional()` to `.min(2).max(12).optional()`.
   - Updated `getPublicationPages(doc)`:
     ```ts
     export function getPublicationPages(doc: NewspaperDocument): NewspaperPage[] {
       if (doc.pages && doc.pages.length > 0) {
         return doc.pages;
       }
       return [
         {
           id: 'page-1',
           pageNumber: 1,
           sectionTitle: doc.metadata.language === 'hi' ? 'मुख्य पृष्ठ' : 'Front Page',
           articles: doc.articles,
           columnCount: undefined,
         },
       ];
     }
     ```
     **Semantics explanation:** When explicit multi-page publications exist, `getPublicationPages` returns `doc.pages` as-is, leaving each page's `columnCount` as defined or `undefined`. On legacy documents lacking a `pages` array, the fabricated fallback page explicitly sets `columnCount: undefined`. This guarantees that the page dynamically inherits the document layout column count via `resolvePageColumnCount(doc, page)` rather than freezing a static snapshot.
5. **Usage Status of `NewspaperSheet.tsx`:**
   - A full repository search confirmed `NewspaperSheet.tsx` is **not imported or used anywhere** in `apps/` or `packages/`.
   - It is an unreferenced legacy prototype component. Per instructions, it was preserved without deletion and flagged for retirement in Phase 2.
6. **Interaction of Global Layout Drawer (`ContextualInspector.tsx:1542`) with Per-Page Column Count:**
   - `ContextualInspector.tsx:1542` is the global "Columns per Page" selector modifying `doc.layout.columnCount`.
   - **Interaction semantics:**
     - Pages with an explicit `page.columnCount` override (e.g. `12`) prioritize their own property via `resolvePageColumnCount()`; changing the global drawer control has **no effect** on them.
     - Pages with `page.columnCount === undefined` (default blank pages and legacy pages) dynamically inherit `doc.layout.columnCount`. Changing the global drawer control immediately cascades to all such pages.

### 1.2 Automated Verification & Tests Added

- **Component Test (`apps/web/src/components/studio/ContextualInspector.test.tsx`):**
  - Verified that for an article on a 12-column page, the label displays `कॉलम (3/12)` and offers options `1..12` (no column 13).
  - Verified that for an article on a 4-column page, the label displays `कॉलम (3/4)` and offers options `1..4` (no column 5).
- **Preset Placement Test (`apps/web/src/utils/presetPlacement.test.ts`):**
  - Verified that adding a block with unspecified column span on a 12-column page assigns default span `2` (within 12).
  - Verified that an explicit full-width block (`columnSpan: 12`) preserves span `12`.
  - Verified all built-in element presets fall within `[1, 12]`.
- **Document Schema Test (`packages/document-schema/src/index.test.ts`):**
  - Verified `NewspaperPageSchema` parses `columnCount: 12`.
  - Verified `getPublicationPages` fallback page leaves `columnCount: undefined` and dynamically resolves to layout column count.

---

## 2. Task 2: Font-Loading Architecture & PDF Font Embedding

### 2.1 Itemized List of Font-Related Changes

| Commit        | File & Line                                  | Change Description                                                                                                                                     | Why It Was Needed                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :------------ | :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`2baa696`** | `packages/template-engine/src/index.ts:1136` | Added `baseUrl?: string;` to `RenderHtmlOptions` interface.                                                                                            | Allows callers of `renderNewspaperDocumentToHtml()` to specify a base URL for resolving relative assets.                                                                                                                                                                                                                                                                                                                               |
| **`2baa696`** | `packages/template-engine/src/index.ts:1618` | Injected `<base href="${escapeHtml(_options.baseUrl ?? 'http://localhost:5173/')}" />` into `<head>` immediately following `<meta charset="utf-8" />`. | In Playwright headless browser, `page.setContent(html)` initializes documents under `about:blank`. In CSS, `@font-face` uses relative URLs (`url(/fonts/foo.woff2)`). Chromium treats relative URLs on `about:blank` as invalid, fails to dispatch network requests, and marks font faces as `status: 'error'`, aborting PDF export. Adding a `<base href>` provides a valid origin, allowing Chromium to dispatch real HTTP requests. |
| **`2baa696`** | `apps/renderer/src/index.ts:220–241`         | Wrapped route interception in `setupPageRoutes()` in a `try...catch` and validated font file existence before fulfilling.                              | Intercepts all requests matching `/fonts/*`, reads the corresponding WOFF2 file directly from `apps/web/public/fonts/` on local disk, and fulfills the request with HTTP 200 and `contentType: 'font/woff2'`. Completely eliminates external network dependencies.                                                                                                                                                                     |

### 2.2 Font Resolution Sequence During `page.setContent()`

When `RendererWorker.renderToPdf()` or `renderToImage()` executes:

1. **Route Interception Registration:** `setupPageRoutes(page)` attaches `page.route('**/*', handler)` to the Playwright page.
2. **HTML Injection:** `page.setContent(html)` loads the document.
3. **Base Origin Resolution:** Chromium encounters `<base href="http://localhost:5173/">` in `<head>`.
4. **Font Request Dispatch:** Chromium's layout engine parses `@font-face` rules in `<style>` (`src: url(/fonts/*.woff2)`), resolving each to `http://localhost:5173/fonts/*.woff2`, and issues HTTP GET requests.
5. **Local Disk Fulfillment:** Playwright intercepts each font URL, extracts the basename (e.g. `noto-serif-devanagari-devanagari-400.woff2`), verifies the file exists in `apps/web/public/fonts/`, and fulfills it immediately from disk with `route.fulfill({ status: 200, contentType: 'font/woff2', body: fontData })`.
6. **Readiness Await:** `page.evaluate(() => document.fonts.ready)` confirms that all fonts loaded successfully (`status: 'loaded'`).

### 2.3 Font Embedding Audit on `tests/after-parity/*.pdf`

Direct binary inspection of the `/Font` and `/FontDescriptor` dictionaries across the generated PDFs in `tests/after-parity/` revealed the following:

#### A. Successfully Embedded Self-Hosted Fonts (TrueType/OpenType Subsets):

In `tests/after-parity/modern-hindi-daily.pdf` and `tests/after-parity/classic-hindi-broadsheet.pdf`, the following self-hosted web fonts are **fully embedded** as `/FontFile2` or `/FontFile3` binary stream subsets:

- **`RozhaOne-Regular`** (`/BaseFont /MAAAAA+RozhaOne-Regular`) — Embedded in `classic-hindi-broadsheet.pdf` and `hindi-fixture.pdf`.
- **`Poppins-Bold`** (`/BaseFont /LAAAAA+Poppins-Bold`, `/MAAAAA+Poppins-Bold`) — Embedded in `modern-hindi-daily.pdf`.
- **`Mukta-Regular` & `Mukta-Bold`** (`/BaseFont /NAAAAA+Mukta-Regular`, `/PAAAAA+Mukta-Bold`) — Embedded in `modern-hindi-daily.pdf`.
- **`Hind-Regular` & `Hind-Bold`** (`/BaseFont /TAAAAA+Hind-Regular`, `/RAAAAA+Hind-Bold`) — Embedded in `modern-hindi-daily.pdf`.

#### B. Fallback to System Fonts:

- **`Noto Serif Devanagari`:**
  Although `noto-serif-devanagari-devanagari-400.woff2` and `700.woff2` load into the Chromium DOM with `status: 'loaded'`, Chromium's Skia PDF engine on Windows **does not embed `Noto Serif Devanagari`** into the PDF stream. Instead, Skia's complex-script HarfBuzz shaping pipeline for Devanagari falls back to the host operating system's native Indic font:
  - **`Nirmala UI`** (`/BaseFont /AAAAAA+NirmalaUI`, `/CAAAAA+NirmalaUI-Bold`) for Devanagari glyphs.
  - **`ArialMT`** (`/BaseFont /BAAAAA+ArialMT`, `/DAAAAA+Arial-BoldMT`) for Latin glyphs.
- **`Georgia` & `Arial`:**
  In `classic-broadsheet.pdf` and `compact-local.pdf`, English serif/sans-serif text renders with the system font subsets (`/BaseFont /JAAAAA+Georgia-Bold`, `/KAAAAA+Georgia`, `/JAAAAA+Arial-Black`, `/KAAAAA+Impact`).

---

## 3. Final Verification Artifact

### Visual Inspection: `classic-hindi-broadsheet` Page 1

The final rendered output for `classic-hindi-broadsheet` (Page 1) is saved at:

- **Local Repository Path:** [`tests/after-parity/classic-hindi-broadsheet_page_1.png`](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/tests/after-parity/classic-hindi-broadsheet_page_1.png)
- **Artifact Copy:** [`classic-hindi-broadsheet_page_1.png`](file:///C:/Users/Pc/.gemini/antigravity-ide/brain/1c9bef0a-f8de-40ce-aa81-af1362a42da4/classic-hindi-broadsheet_page_1.png)

![classic-hindi-broadsheet_page_1](C:/Users/Pc/.gemini/antigravity-ide/brain/1c9bef0a-f8de-40ce-aa81-af1362a42da4/classic-hindi-broadsheet_page_1.png)

### Summary of Visual Parity:

1. **Row 1 Element Co-Location:** The 9-col lead story and 3-col Gaganyaan story reside in the same top row (75% + 25% column distribution).
2. **Folio Footer:** The footer bar is visible at the bottom of the page (`flex-shrink: 0`).
3. **Physical Page Box:** PDF geometry measures exactly 381.00 mm × 577.85 mm with no footer overflow warnings.

---

## 4. Test & Build Status

```bash
# 1. Type validation
$ pnpm typecheck
✓ Scope: 7 of 8 workspace projects — 0 errors

# 2. Linting
$ pnpm lint
✓ eslint . — 0 errors, 0 warnings

# 3. Unit & Integration test suite
$ pnpm test
✓ 10 test files passed, 56 tests passed (0 failures)

# 4. Production builds
$ pnpm -r run build
✓ 7 workspace packages and apps built cleanly
```

---

## 5. Items Marked Unverified / Scope Boundaries

1. **Chromium Skia PDF Embedding for Noto Serif Devanagari:**
   While `Mukta`, `Hind`, `Poppins`, and `Rozha One` are confirmed to be embedded into the PDF as binary font subsets, `Noto Serif Devanagari` relies on Windows system font fallback (`Nirmala UI`) in headless Chromium. True embedding of Noto Serif Devanagari in vector PDFs on headless Linux/Windows will require testing TTF (TrueType) font formats instead of WOFF2 in Phase 2.
2. **Phase 2 Coordinate Space Unification:**
   `docs/canvas-scale-plan.md` defines the architectural path for migrating `NewspaperCanvas.tsx` from 800px base to 1440px physical coordinates. As instructed, implementation remains deferred to Phase 2.
