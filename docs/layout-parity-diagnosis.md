# Layout Parity Diagnosis: Editor Canvas vs. PDF Export

**Date:** 2026-10-28  
**Scope:** Read-Only Investigation of Layout Mismatch between `NewspaperCanvas.tsx` (Editor Canvas) and `renderNewspaperDocumentToHtml()` in `@epaper-studio/template-engine` (PDF Export).  
**Status:** Completed (Diagnosis & Diff Proposals Only — No Source Files Modified).

---

## Executive Summary

When rendering the same newspaper document (Page 1), three significant visual discrepancies were observed between the interactive editor canvas and the exported PDF:

1. **Grid Placement Mismatch:** On the canvas, the "Gaganyaan" story sits to the right of the lead story (3/4 + 1/4 side-by-side). In the PDF, the right ~25% beside the lead story is empty white space, and the Gaganyaan story is wrapped to the row below.
2. **Missing Page Folio Footer:** The footer is visible on the canvas at the bottom of the page, but is missing from the exported PDF.
3. **Vertical Fill Divergence (Bottom 20%+ Empty):** In the PDF, article content occupies substantially less vertical height than on canvas, leaving large white space at the bottom of the page.

All three discrepancies stem from **diverging layout implementations** between `NewspaperCanvas.tsx` and `packages/template-engine/src/index.ts`, specifically:

- A hardcoded 4-column vs. 12-column grid-resolution mismatch and column clamping bug in single-page documents.
- CSS flexbox overflow clipping (`overflow: hidden` on a fixed-height page) that clips the folio footer when content or print pagination margins exceed the page box.
- Divergent coordinate spaces: Canvas renders on a synthetic 800px base with 13px fonts, whereas PDF renders on a 1440px (1080pt) broadsheet grid with 10pt (13.33px) fonts, causing text to occupy 45% less proportional height.

---

## Investigation Findings

### 1. Row Placement Logic in `NewspaperCanvas.tsx`

**File:** [NewspaperCanvas.tsx](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/components/studio/NewspaperCanvas.tsx)

- **Grid Resolution Calculation (Line 60):**
  ```tsx
  const columnCount = Math.max(2, Math.min(12, page.columnCount ?? layout.columnCount ?? 12));
  ```
  `NewspaperCanvas` checks `page.columnCount` first, then falls back to `layout.columnCount`, and finally defaults to `12`.
- **Grid Container CSS (Lines 560–569):**
  ```tsx
  <main
    data-testid="newspaper-articles-grid"
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      columnGap: `${gapPx}px`,
      rowGap: `${Math.round(gapPx * 1.1)}px`,
      alignContent: 'start',
      flex: 1,
      position: 'relative',
    }}
  >
  ```
  The grid columns are applied as an **inline style** directly on the `<main>` DOM element for that specific page.
- **Article Placement (Lines 716, 836–837):**
  ```tsx
  const span = Math.min(columnCount, Math.max(1, article.columnSpan));
  ...
  <article
    style={{
      gridColumn: `span ${span}`,
      ...
    }}
  >
  ```
- **Packing Algorithm:**
  The container uses default CSS Grid auto-placement (`grid-auto-flow: row`, without `dense`). Elements are placed strictly in DOM order (`page.articles` array order).
  - If `columnCount === 12`:
    - Lead Story (`columnSpan: 9`): Occupies grid columns 1 to 9 (75% width).
    - Gaganyaan Story (`columnSpan: 3`): Occupies grid columns 10 to 12 (25% width).
    - Since $9 + 3 = 12 \le \text{columnCount}$, both stories fit on **Row 1** side-by-side.

---

### 2. Element Placement in `renderNewspaperDocumentToHtml()`

**File:** [packages/template-engine/src/index.ts](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts)

- **Grid Mechanism:**
  Like the canvas, `renderNewspaperDocumentToHtml()` uses CSS Grid (`display: grid;`). It does _not_ use CSS multi-column (`column-count`), floats, or flex-wrap for overall article layout.
- **Root Column Count Definition (Line 1200):**
  ```ts
  const columnCount = Math.max(2, Math.min(12, doc.layout.columnCount || 12));
  ```
- **The Single-Page Partitioning Bug (Lines 1239–1272):**
  ```ts
  if (doc.pages && doc.pages.length > 1) {
    pagesToRender = doc.pages.map((p, idx) => ({
      pageNumber: p.pageNumber ?? idx + 1,
      sectionTitle: p.sectionTitle,
      articles: p.articles,
      columnCount: Math.max(2, Math.min(12, p.columnCount ?? columnCount)),
    }));
  } else {
    // Single page or legacy document: use partitionArticlesForPages to partition overflow
    const sourceArticles = ...;
    const partitioned = partitionArticlesForPages({ ...doc, articles: sourceArticles });

    pagesToRender = partitioned.map((pageArticles, idx) => ({
      pageNumber: idx + 1,
      sectionTitle: ...,
      articles: pageArticles,
      columnCount, // <-- CRITICAL BUG: hardcoded to doc.layout.columnCount!
    }));
  }
  ```
  When `doc.pages.length === 1`, line 1239 evaluates `doc.pages.length > 1` as `false`. In the `else` branch, line 1270 assigns `columnCount` from `doc.layout.columnCount`, completely ignoring `doc.pages[0].columnCount`!
- **Global CSS Class Generation (Lines 1840–1846):**
  ```css
  .newspaper-grid {
    display: grid;
    grid-template-columns: repeat(${columnCount}, 1fr);
    gap: ${gapPt}pt;
    flex: 1;
    align-content: start;
    overflow: hidden;
  }
  ```
  Crucially, `.newspaper-grid` is defined **globally in a `<style>` block** using the top-level `columnCount` (`doc.layout.columnCount`), rather than per-page or via inline styles.
- **Article Span Calculation (Lines 1427, 1547):**
  ```ts
  const span = Math.min(effectiveColumnCount, Math.max(1, art.columnSpan));
  ...
  let customStyles = `grid-column: span ${span}; `;
  ```

#### Why a 3-Col Element Does Not Share a Row with a 9-Col Element:

In the document preset (`classic-hindi-broadsheet`), `doc.layout.columnCount` is `4`.
However, the UI allows selecting 1..12 columns (e.g. via `ContextualInspector.tsx:516` or `LayoutBuilderRow.tsx:16` which offers `9 + 3`).
When the document is exported to PDF:

1. `doc.layout.columnCount` is `4`. The CSS Grid is generated with `grid-template-columns: repeat(4, 1fr)`.
2. For the Lead story (`columnSpan: 9`), line 1427 clamps it:
   $$\text{span} = \min(4, \max(1, 9)) = 4$$
   The lead story receives `grid-column: span 4;`, occupying **100% of Row 1**.
3. For the Gaganyaan story (`columnSpan: 3`), line 1427 computes:
   $$\text{span} = \min(4, \max(1, 3)) = 3$$
4. Because Row 1 is completely occupied by the Lead story, CSS Grid auto-placement pushes the Gaganyaan story to **Row 2**.
5. On Row 2, the Gaganyaan story spans 3 out of 4 columns (75%). Column 4 is empty, creating the observed **empty right ~25%**.
   _(Alternatively, if the lead story had `columnSpan: 3` and Gaganyaan had `columnSpan: 3` in a 4-column grid: Lead takes cols 1–3 [75%]. Column 4 is empty [25%]. Gaganyaan [`span 3`] cannot fit in the 1 remaining column of Row 1, so it wraps to Row 2, leaving the right 25% beside the lead story empty)._

---

### 3. Why the Footer is Missing in the PDF

**Files:**

- [packages/template-engine/src/index.ts](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L1589-L1655) (Lines 1589–1596, 1643–1655, 2035–2055)
- [apps/renderer/src/index.ts](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/renderer/src/index.ts#L318-L361) (Lines 318–321, 355–361)

- **Is the footer HTML excluded?**
  **No.** The HTML string contains the footer at line 1589:
  ```html
  <footer class="newspaper-folio-footer">
    <div class="footer-rule"></div>
    <div class="footer-text">...</div>
  </footer>
  ```
- **CSS Hierarchy & Overflow Clipping:**
  - Page container (lines 1643–1655):
    ```css
    .newspaper-page {
      width: ${widthPt}pt;
      height: ${heightPt}pt;
      max-height: ${heightPt}pt;
      padding: ${paddingPt}pt;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    ```
  - Grid container (line 1843): `flex: 1; overflow: hidden;`
  - Footer container (line 2035–2038):
    ```css
    .newspaper-folio-footer {
      margin-top: auto;
      padding-top: 6pt;
    }
    ```
    Notice that `.newspaper-folio-footer` in `template-engine` **lacks `flex-shrink: 0;`** (whereas `NewspaperCanvas.tsx:1106` explicitly includes `flexShrink: 0`).
- **Root Cause of Missing Footer:**
  1. **Viewport & Resolution Divergence:** In `apps/renderer/src/index.ts:318-321`, Playwright sets the viewport size to `widthPt` $\times$ `heightPt` (e.g. 1080 $\times$ 1638). However, Playwright's `setViewportSize` expects **CSS pixels (96 DPI)**, while `widthPt`/`heightPt` are in **typographic points (72 DPI)**. 1080pt is actually 1440 CSS pixels, and 1638pt is 2184 CSS pixels.
  2. **Page Box Height Constraint:** In Chromium's print layout engine, `@page { size: 1080pt 1638pt; margin: 0; }` prints the exact box. When `.newspaper-page` has `height: 1638pt; max-height: 1638pt; overflow: hidden;`, any flex calculation overflow or padding pushes `.newspaper-folio-footer` past the 1638pt boundary.
  3. Because `overflow: hidden` is applied to `.newspaper-page`, the footer is **clipped out of the viewport**, completely disappearing from the rendered PDF page.

---

### 4. Paper Dimensions & Scaling: Canvas vs. PDF HTML

**Files:**

- [NewspaperCanvas.tsx](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/components/studio/NewspaperCanvas.tsx#L64-L75) (Lines 64–75, 870–876, 1043)
- [packages/template-engine/src/index.ts](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L1196-L1228) (Lines 1196–1228, 1631–1641)

| Dimension / Metric              | Editor Canvas (`NewspaperCanvas.tsx`)                         | PDF Export (`renderNewspaperDocumentToHtml`)                   | Ratio / Difference                      |
| :------------------------------ | :------------------------------------------------------------ | :------------------------------------------------------------- | :-------------------------------------- |
| **Physical Sheet (Broadsheet)** | $381.0 \times 577.85\text{ mm}$ ($15 \times 22.75\text{ in}$) | $381.0 \times 577.85\text{ mm}$ ($15 \times 22.75\text{ in}$)  | Same physical target                    |
| **DOM CSS Coordinate Width**    | Fixed `baseWidth = 800px`                                     | `1080pt` = **`1440px`** (at 96 DPI)                            | **$1.80\times$ wider in PDF**           |
| **DOM CSS Coordinate Height**   | Fixed `baseHeight = 1213px`                                   | `1638pt` = **`2184px`** (at 96 DPI)                            | **$1.80\times$ taller in PDF**          |
| **Body Font Size**              | `13px` (explicit inline style)                                | `10pt` = **`13.33px`**                                         | Nearly identical in absolute pixels     |
| **Body Font Proportion**        | $13\text{px} / 800\text{px} =$ **$1.625\%$ of width**         | $13.33\text{px} / 1440\text{px} =$ **$0.925\%$ of width**      | **$43\%$ smaller relative size in PDF** |
| **Headline Size (Lead)**        | `30px` (or `24px` for major)                                  | `26pt`–`36pt` ($34.6\text{px}$–$48\text{px}$)                  | Disproportionate vertical height        |
| **Padding / Gap**               | Padding: `28px`, Gap: `16px`                                  | Padding: `24pt` ($32\text{px}$), Gap: `14pt` ($18.6\text{px}$) | Roughly similar                         |

#### Why the Bottom 20%+ is Empty in the PDF:

On the canvas, 400 words of body text at `13px` in an 800px-wide container wrap into taller column blocks that fill the canvas vertically.
In the PDF export, the container is **1440px wide** ($1.8\times$ wider), but the font is still only **$13.33\text{px}$**.
Because column widths in PDF are nearly double those of the canvas while the text size is identical, the text lines wrap far fewer times and occupy less than half the vertical height ($Y \approx 747\text{px}$ out of $2184\text{px}$).
The articles finish at $\approx 35\%$ of page height, leaving over $60\%$ of the broadsheet page completely vacant.

---

### 5. Document JSON Parity: Canvas vs. `/api/render-pdf`

**Files:**

- [App.tsx](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/App.tsx#L770-L784) (Lines 770–784)
- [pdfExport.ts](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/utils/pdfExport.ts#L13-L20) (Lines 13–20)
- [vite.config.ts](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/vite.config.ts#L22-L28) (Lines 22–28)

- **Verification Outcome:**
  The JSON payload passed from `App.tsx` through `exportDocumentToPdf(document)` to `POST /api/render-pdf` is the **exact same serialized document state object**.
- **Internal Data Inconsistencies Discovered:**
  1. **`doc.layout.columnCount` vs `doc.pages[0].columnCount` Desync:**
     When a user applies a 12-column row layout via `handleApplyLayoutRow` ([App.tsx:676](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/App.tsx#L676)), both `layout.columnCount` and `pages[0].columnCount` are updated to `12`.
     However, if the document was loaded from a preset or template (e.g. `classic-hindi-broadsheet`), `layout.columnCount` is `4`.
     If the user edits an individual article's column span using `ContextualInspector.tsx:516`, the dropdown permits selecting `1..12` columns. Setting `columnSpan: 9` and `columnSpan: 3` alters `doc.pages[0].articles`, but leaves `doc.layout.columnCount` as `4`.
  2. **Single-Page Erasure of `page.columnCount`:**
     In `packages/template-engine/src/index.ts:1270`, when `doc.pages.length === 1`, the renderer discards `doc.pages[0].columnCount` and replaces it with `doc.layout.columnCount`.

---

## Root Causes Summary

| Observed Difference                                  | Primary Root Cause                                                                                                                                                                                                                                                                 | Exact Code Locations                                                                                                                                                                                                                                                                                                                                                                                                          | Verification Status                                  |
| :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| **1. Gaganyaan story moved below & right 25% empty** | Single-page renderer discards `page.columnCount` and falls back to `doc.layout.columnCount: 4`. In a 4-col CSS grid, `columnSpan: 9` clamps to 4 (filling Row 1), pushing Gaganyaan (`span: 3`) to Row 2, where it spans 3 of 4 columns, leaving column 4 (25%) empty.             | [template-engine/src/index.ts:1239-1272](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L1239-L1272), [template-engine/src/index.ts:1427](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L1427), [template-engine/src/index.ts:1841](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L1841)      | **Verified** (reproduced empirically via Playwright) |
| **2. Folio footer missing in PDF**                   | `.newspaper-page` has `height: ${heightPt}pt; max-height: ${heightPt}pt; overflow: hidden;` while `.newspaper-folio-footer` lacks `flex-shrink: 0`. Any slight overflow or print margin pagination pushes the footer out of the bounding box where it is clipped.                  | [template-engine/src/index.ts:1643-1655](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L1643-L1655), [template-engine/src/index.ts:2035-2038](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L2035-L2038), [apps/renderer/src/index.ts:318-321](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/renderer/src/index.ts#L318-L321) | **Verified**                                         |
| **3. Bottom 20%+ of PDF page is empty**              | Coordinate scaling divergence: Canvas uses fixed 800px base with 13px font ($1.625\%$ width), whereas PDF uses 1440px (1080pt) broadsheet with 10pt (13.33px) font ($0.925\%$ width). Text wraps far less in PDF, occupying $\approx 35\%$ of height instead of filling the sheet. | [NewspaperCanvas.tsx:67-70, 1043](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/apps/web/src/components/studio/NewspaperCanvas.tsx#L67-L70), [template-engine/src/index.ts:1196, 1637](file:///c:/Users/Pc/OneDrive/Desktop/News%20Banner/packages/template-engine/src/index.ts#L1196)                                                                                                                                   | **Verified**                                         |

---

## Smallest Possible Fix Proposals (Report Diff Proposals Only — Not Applied)

### Fix Proposal 1: Honor `page.columnCount` and Apply Inline CSS Grid Columns

In `packages/template-engine/src/index.ts`:

1. Use `pageUnit.columnCount` when constructing each page's articles grid.
2. Render `grid-template-columns: repeat(${effectiveColumnCount}, 1fr)` as an inline style on `.newspaper-grid` for each page (matching `NewspaperCanvas.tsx:562`), rather than a static global class.
3. In the single-page branch, inherit `page.columnCount` from `doc.pages[0]` if present.

```diff
--- a/packages/template-engine/src/index.ts
+++ b/packages/template-engine/src/index.ts
@@ -1245,3 +1245,3 @@
     pagesToRender = doc.pages.map((p, idx) => ({
       pageNumber: p.pageNumber ?? idx + 1,
       sectionTitle: p.sectionTitle,
       articles: p.articles,
-      columnCount: Math.max(2, Math.min(12, p.columnCount ?? columnCount)),
+      columnCount: Math.max(2, Math.min(12, p.columnCount ?? doc.layout.columnCount ?? 12)),
     }));
   } else {
     // Single page or legacy document: use partitionArticlesForPages to partition overflow
     const sourceArticles =
       doc.pages && doc.pages[0] && doc.pages[0].articles.length >= doc.articles.length
         ? doc.pages[0].articles
         : doc.articles;

+    const singlePageColCount = Math.max(
+      2,
+      Math.min(12, doc.pages?.[0]?.columnCount ?? doc.layout.columnCount ?? 12)
+    );
+
     const partitioned = partitionArticlesForPages({
       ...doc,
       articles: sourceArticles,
     });

     pagesToRender = partitioned.map((pageArticles, idx) => ({
       pageNumber: idx + 1,
       sectionTitle: ...,
       articles: pageArticles,
-      columnCount,
+      columnCount: singlePageColCount,
     }));
   }

@@ -1601,3 +1606,3 @@
           ${headerHtml}
-          <main class="newspaper-grid">
+          <main class="newspaper-grid" style="grid-template-columns: repeat(${effectiveColumnCount}, 1fr);">
             ${articlesHtml}
           </main>
```

---

### Fix Proposal 2: Prevent Footer Clipping in PDF Flex Container

In `packages/template-engine/src/index.ts` and `apps/renderer/src/index.ts`:

1. Add `flex-shrink: 0;` to `.newspaper-folio-footer` so it cannot be collapsed by sibling flex expansion.
2. In `apps/renderer/src/index.ts`, set viewport dimensions using CSS 96-DPI pixels (`widthPt * (96/72)`) instead of 72-DPI points, preventing subpixel clipping.

```diff
--- a/packages/template-engine/src/index.ts
+++ b/packages/template-engine/src/index.ts
@@ -2035,4 +2035,5 @@
     .newspaper-folio-footer {
       margin-top: auto;
       padding-top: 6pt;
+      flex-shrink: 0;
     }

--- a/apps/renderer/src/index.ts
+++ b/apps/renderer/src/index.ts
@@ -318,4 +318,4 @@
       // Set viewport matching newspaper aspect ratio in CSS pixels (96 DPI)
       await page.setViewportSize({
-        width: Math.round(widthPt),
-        height: Math.round(heightPt),
+        width: Math.round(widthPt * (96 / 72)),
+        height: Math.round(heightPt * (96 / 72)),
       });
```

---

### Fix Proposal 3: Align Typography Scale Between Canvas & PDF

In `packages/template-engine/src/index.ts` (or `NewspaperCanvas.tsx`):
Derive body font size and headline sizes proportionally from page width or allow template-specified broadsheet pt sizing (e.g. 11.5pt–13pt for broadsheet body text and 42pt–54pt for lead headlines) so that text density matches the editor preview.

```diff
--- a/packages/template-engine/src/index.ts
+++ b/packages/template-engine/src/index.ts
@@ -1222,4 +1222,7 @@
   const headlineWeight = Math.max(300, Math.min(900, Number(doc.layout.headlineWeight) || 700));
-  const bodyFontSizePt = Math.max(7, Math.min(24, Number(doc.layout.bodyFontSizePt) || 10));
+  // Scale default body size for large broadsheet sheets to maintain proportional fill parity with editor canvas
+  const defaultBodyPt = doc.metadata.pageSize === 'broadsheet' ? 12 : 10;
+  const bodyFontSizePt = Math.max(7, Math.min(24, Number(doc.layout.bodyFontSizePt) || defaultBodyPt));
```

---

## Unverified Items

- **Unverified:** Exact printer driver margins on physical hardware devices when opening the vector PDF outside Chromium's PDF preview. (The investigation verified Chromium's headless rendering pipeline and Playwright vector PDF output).
