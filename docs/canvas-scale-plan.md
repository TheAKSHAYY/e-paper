# Architectural Plan: Physical Coordinate Space & Unified Canvas Scaling

**Document Status:** Architectural Proposal / Design Specification (FIX C — Plan Only)  
**Author:** Antigravity Senior Engineering Team  
**Date:** 2026-10-28  
**Target Milestone:** Phase 2 Modernization — Shared Renderer Architecture

---

## 1. Executive Summary & Problem Definition

The E-Paper Studio currently suffers from a fundamental **coordinate space bifurcation** between the interactive canvas and the export renderer:

| Dimension / Parameter      | Interactive Canvas (`NewspaperCanvas.tsx`)  | PDF Export Engine (`renderNewspaperDocumentToHtml`) | Ratio / Discrepancy                                 |
| :------------------------- | :------------------------------------------ | :-------------------------------------------------- | :-------------------------------------------------- |
| **Broadsheet Width**       | `800px` (synthetic base)                    | `1440px` (CSS px at 96 DPI for `1080pt`)            | **1.80×** width divergence                          |
| **Broadsheet Height**      | `1213px` (derived via aspect ratio)         | `2184px` (CSS px at 96 DPI for `1638pt`)            | **1.80×** height divergence                         |
| **Body Font Size**         | `13px` (synthetic; `bodyFontSizePt * 1.33`) | `10pt` (`13.33px` CSS px)                           | Font sizes differ in relative ratio to column width |
| **Grid Column Width**      | 12-col: ~`58px` per column                  | 12-col: ~`105px` per column                         | **1.81×** difference                                |
| **Line-Wrapping & Height** | Lines wrap after ~28–35 Hindi chars         | Lines wrap after ~55–65 Hindi chars                 | Content occupies ~45% less vertical height in PDF!  |

Because the canvas renders articles against an 800px layout grid while the PDF engine renders against a 1440px layout grid, **true visual WYSIWYG parity is mathematically impossible** under the current setup. Users layout their paper in the editor thinking the page is full, only to find the exported PDF has 20–30% empty space at the bottom.

This document proposes transitioning `NewspaperCanvas.tsx` to render in the **PDF's physical coordinate space** (1:1 physical dimensions in CSS px or pt) and using CSS `transform: scale()` purely for viewport fit and user zoom.

---

## 2. Complete Inventory of 800px Base & Pixel Font Dependencies

The following table documents every line in `apps/web/src/components/studio/NewspaperCanvas.tsx` that directly depends on the synthetic 800px base width or uses hardcoded pixel font sizes:

### A. Dimensions, Scaling & Spacing Calculations

- **Lines 68–71**:
  ```tsx
  const baseWidth = orientation === 'landscape' ? 1080 : 800;
  const baseHeight = Math.round(baseWidth / aspectRatio);
  const exactWidthPx = Math.round(baseWidth * scale);
  const exactHeightPx = Math.round(baseHeight * scale);
  ```
  _Issue:_ Synthetic 800px base creates the 1.80× coordinate divergence against broadsheet (1080pt / 1440px).
- **Lines 74–75**:
  ```tsx
  const paddingPx = density === 'compact' ? 22 : density === 'spacious' ? 38 : 28;
  const gapPx = density === 'compact' ? 12 : density === 'spacious' ? 22 : 16;
  ```
  _Issue:_ Hardcoded pixel padding and gaps. PDF uses density points: `18pt` / `32pt` / `24pt` (padding) and `10pt` / `20pt` / `14pt` (gap).
- **Lines 82–92**: Word budget estimation thresholds (`1800` to `3500` words) calibrated to 800px canvas text capacity rather than physical column volume.
- **Lines 145, 195–200**: `.newspaper-canvas-scale-container` sizing using `exactWidthPx` and `exactHeightPx`.
- **Lines 221–226**: `.newspaper-sheet-canvas` sizing using `baseWidth` and `baseHeight`.
- **Line 234**: Sheet padding `padding: ${paddingPx}px`.

### B. Masthead & Folio Typography

- **Line 278**: Top strip container `fontSize: '10.5px'` (PDF uses `8pt` / `10.67px`).
- **Line 296**: Weather city & temperature `fontSize: '10px'` (PDF uses `7.5pt` / `10px`).
- **Line 306**: Weather condition / AQI meta item `fontSize: '11px'` (PDF uses `8.5pt` / `11.33px`).
- **Line 336**: Masthead tagline `fontSize: '10px'` (PDF uses `7.5pt` / `10px`).
- **Line 375**: Masthead title `fontSize: ${masthead.fontSizePt || 52}px` (Ties pt schema property directly to CSS px without 96/72 conversion or pt unit).
- **Line 396**: Masthead bottom strip `fontSize: '11px'` (PDF uses `8.5pt` / `11.33px`).
- **Line 412**: Bottom strip date `fontSize: '11.5px'`.
- **Line 423**: Edition label `fontSize: '10px'`.
- **Line 443**: Inside page folio header `fontSize: '11px'` (PDF uses `8.5pt` / `11.33px`).
- **Line 451**: Folio page number `fontSize: '10px'` (PDF uses `8.5pt` / `11.33px`).
- **Line 467**: Folio page count label `fontSize: '10.5px'`.
- **Line 475**: Announcement badge `fontSize: '9px'`.
- **Lines 492, 499, 506, 512**: Secondary header elements (`fontSize: '12px'`, `'15px'`, `'12px'`, `'11px'`).

### C. Article Typography & Elements

- **Line 777**: Kicker badge `fontSize: '10px'` (PDF uses `8pt` / `10.67px`).
- **Line 791**: Kicker icon `fontSize: '9px'`.
- **Line 841**: Article padding `${article.paddingPx}px`.
- **Line 846**: Selection outline `outline: isSelected ? '1.5px solid #2563eb' : 'none'`.
- **Line 855**: Column rule gutter offset `paddingRight: ${Math.round(gapPx / 2)}px`.
- **Line 868**: Category kicker `fontSize: '10.5px'`.
- **Lines 883–895**: Headline font size calculation:
  ```tsx
  fontSize: isLead
    ? '30px'
    : art.columnSpan >= 8
      ? '25px'
      : art.columnSpan >= 6
        ? '21px'
        : art.columnSpan >= 4
          ? '17px'
          : '15px';
  ```
  _(Contrast with PDF engine: `doc.layout.headlineFontSizePt || (art.columnSpan >= 8 ? 32 : art.columnSpan >= 6 ? 26 : art.columnSpan >= 4 ? 20 : 16)pt`!)_
- **Line 904**: Subheadline `fontSize: isLead ? '13px' : '11.5px'` (PDF uses `11pt` / `14.67px`).
- **Line 918**: Author byline `fontSize: '10.5px'` (PDF uses `8.5pt` / `11.33px`).
- **Lines 950, 957**: Short news title/snippet (`fontSize: '12px'`, `'11px'`).
- **Line 970**: Photo caption `fontSize: '9px'` (PDF uses `8pt` / `10.67px`).
- **Lines 986, 998**: Pull quote & quote author (`fontSize: '12px'`, `'11px'`).
- **Lines 1038, 1044, 1046**: Rashifal horoscope elements (`fontSize: '11px'`, `'10px'`, `'9.5px'`).
- **Line 1057**: Body paragraph font size:
  ```tsx
  fontSize: `${layout.bodyFontSizePt ? Math.round(layout.bodyFontSizePt * 1.33) : 13}px`;
  ```
  _(Synthetic `* 1.33` scalar attempting to simulate 10pt in 800px space)._
- **Line 1104**: Folio footer text `fontSize: '11px'` (PDF uses `8.5pt` / `11.33px`).

---

## 3. Target Coordinate Space Architecture

### 3.1 Physical Coordinate System

Instead of an arbitrary 800px base, the canvas document root will be dimensioned exactly to the physical page dimensions using **points (`pt`)** or **CSS pixels at 96 DPI (`pt * 96 / 72`)**:

```ts
// packages/document-schema/src/index.ts
export function getPhysicalCanvasDimensions(
  pageSize: PageSizePreset,
  orientation: PageOrientation
) {
  const { widthPt, heightPt } = getPageDimensionsPt(pageSize, orientation);
  return {
    widthPt,
    heightPt,
    widthPx: Math.round((widthPt * 96) / 72),
    heightPx: Math.round((heightPt * 96) / 72),
  };
}
```

For Broadsheet:

- `widthPt`: `1080pt` -> `1440px` (CSS px)
- `heightPt`: `1638pt` -> `2184px` (CSS px)

### 3.2 Viewport Zoom & Fit-to-Screen

The canvas wrapper will compute an effective visual scale `zoomFactor`:

```ts
const fitToWidthScale = (viewportWidth - horizontalMargins) / physicalCanvasDimensions.widthPx;
```

The canvas container applies:

```css
.newspaper-sheet-canvas {
  width: 1440px;
  height: 2184px;
  transform: scale(var(--zoom-factor));
  transform-origin: top center; /* or top left */
}
```

---

## 4. Selection Overlays, Drag Handles, and Click Hit-Testing Under Transform Scale

### 4.1 Native Browser Event Propagation

CSS 2D transforms (`transform: scale()`) are natively supported by modern browser hit-testing engines:

- Standard `onClick`, `onMouseEnter`, `onDragEnter`, and `onDrop` events dispatched on DOM nodes inside `.newspaper-sheet-canvas` automatically account for the CSS transform matrix. Clicks land on the exact article/masthead without manual coordinate unprojecting.

### 4.2 Handling Bounding Boxes & Screen Coordinates

Any external UI (floating action bars, tooltips, drag ghost previews, selection bounding box overlays rendered outside the transform tree) that inspects elements via `getBoundingClientRect()` receives **screen coordinates** (already multiplied by `scale`):

1. **Screen-to-Canvas Mapping:**
   ```ts
   function screenToCanvasPoint(
     screenX: number,
     screenY: number,
     canvasRect: DOMRect,
     scale: number
   ) {
     return {
       x: (screenX - canvasRect.left) / scale,
       y: (screenY - canvasRect.top) / scale,
     };
   }
   ```
2. **In-Tree Selection Overlays (Recommended):**
   Render selection outlines and drag handles **inside** the transformed tree directly on the article node.
   - _Outline scaling problem:_ An outline of `1.5px` at `scale = 0.5` becomes `0.75px` (blurry or invisible).
   - _Fix:_ Use dynamic outline stroke width or CSS custom properties:
     ```css
     outline: calc(1.5px / var(--zoom-factor)) solid #2563eb;
     outline-offset: calc(2px / var(--zoom-factor));
     ```
     This keeps resize handles, column span indicators, and selection rings at a crisp, constant physical size on screen (e.g. always exactly 2px or 8px) regardless of whether the user is zoomed to 35% or 150%.

### 4.3 HTML5 Drag & Drop Ghost Offsets

HTML5 `e.dataTransfer.setDragImage(node, x, y)` expects unscaled pixel offsets relative to the dragged element's unscaled origin. Because dragging an article inside a transformed container can produce offset cursor drift in Chromium, either:

- Set ghost offsets divided by `scale`: `setDragImage(ghostEl, offsetX / scale, offsetY / scale)`.
- Or use pointer events with custom drag-and-drop state instead of native HTML5 drag events.

---

## 5. Integration with Shared `<PaperPage>` Component

Moving to physical coordinate space is the **essential prerequisite** for extracting a shared `<PaperPage>` component shared between the web studio and renderer:

```
epaper-studio/
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── PaperPage.tsx         # Canonical shared page layout component
│   │   │   │   ├── PaperMasthead.tsx     # Authentic 3-row Indian masthead
│   │   │   │   ├── PaperGrid.tsx         # CSS Grid with resolved page columns
│   │   │   │   └── PaperArticle.tsx      # Multi-column article with Hindi typography
```

### Shared Architecture:

1. `<PaperPage>` renders a clean, unadorned physical page (in points/CSS px), matching the exact layout rules of `renderNewspaperDocumentToHtml()`.
2. In **PDF/Renderer Mode**: `<PaperPage>` is rendered headlessly (or rendered to static HTML) with no interactive decorations.
3. In **Studio Canvas Mode**: `<PaperPage>` is wrapped in `<CanvasViewport scale={zoomFactor}>` and receives interactive slot decorators (`interactive={true}`, `selectionId`, `onSelectArticle`, `dropTarget`).

This completely eliminates double-maintenance: any change to font size, grid gap, masthead rule, or column balance applies identically to both canvas and export.

---

## 6. Risks & Safe Rollout Plan

### 6.1 Identified Risks

1. **Initial Zoom Level Shock:** On standard 1080p desktop monitors (viewport width ~1200px available), an unscaled 1440px broadsheet will not fit without zoom. If `scale` defaults to 1.0, the canvas will look huge and horizontally truncated.
   _Mitigation:_ Implement automatic "Fit to Width" calculation on document load (`scale = Math.min(1.0, (canvasContainerWidth - 48) / 1440)`).
2. **Text Sharpening / Blurry Canvas in Chromium:** Some versions of Chromium render scaled text with slight blurriness if rendered as a bitmap backing layer.
   _Mitigation:_ Ensure `will-change: transform` is used only during active pan/zoom animations and removed when idle.
3. **Draft Migration Compatibility:** Saved drafts in localStorage containing custom `paddingPx` might appear smaller relative to the larger 1440px grid.
   _Mitigation:_ Deprecate `paddingPx` in favor of semantic density tokens (`compact` / `standard` / `spacious`).

### 6.2 Safe Phased Rollout Plan

1. **Phase 2A (Feature Flag):**
   - Add a configuration flag in `apps/web`: `usePhysicalCanvasCoordinates: boolean` (default: `false`).
   - Add a toggle in the top bar / developer drawer to switch between Legacy 800px base and Physical 1440px base.
2. **Phase 2B (Visual Regression Baseline Comparison):**
   - Take full-page PNG captures of the canvas at physical scale using Playwright (`tests/visual/canvas-vs-pdf.spec.ts`).
   - Compare canvas pixel output against `tests/after-parity/classic-hindi-broadsheet_page_1.png`.
   - Threshold for signoff: grid columns, line wraps, and vertical heights match within 2% margin.
3. **Phase 2C (Default Switch & Deprecation):**
   - Enable physical coordinate canvas by default.
   - Extract `<PaperPage>` component into `@epaper-studio/ui`.
   - Remove legacy 800px calculations from `NewspaperCanvas.tsx`.

---

_End of Plan — Reference for Phase 2 Implementation._
