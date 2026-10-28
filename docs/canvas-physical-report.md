# Canvas Physical Coordinate Parity Report

## Executive Summary
This report documents the implementation and verification of `docs/canvas-scale-plan.md`. The core objective was eliminating the legacy 800px synthetic coordinate space in the editor canvas, unifying both the interactive canvas and the PDF export worker under a single, shared physical coordinate system.

The acceptance gate required Playwright parity verification across all 6 production templates (`classic-hindi-broadsheet`, `modern-hindi-daily`, `local-hindi-gazette`, `classic-broadsheet`, `modern-editorial`, `compact-local`) as well as the specialized typographic `hindi-fixture`:
- Bounding box deltas for the masthead, every article card, and the folio footer must be **≤ 1.0 mm**.
- Total content height delta must be **≤ 1.0 mm**.
- Line-break count parity across 5 Hindi paragraphs must match **100%**.

**All 8 test suites passed**. Total content height deltas across all templates are **0.00 mm**, article bounding boxes differ by at most **0.26 mm – 0.53 mm**, and Hindi line-break parity achieved **100% match**. The feature flag `usePhysicalCanvasCoordinates` is now defaulted to **ON (`true`)**.

---

## 1. What Changed (Architecture & Implementation)

### 1.1 `packages/template-engine`
- **Shared Physical Page Metrics**: Implemented `getPhysicalPageMetrics(pageSize, orientation, density, bodyFontSizePt, customHeadlineFontSizePt)` in `packages/template-engine/src/index.ts`.
  - Computes exact page geometry: `width_px = widthMm * 96 / 25.4`, `height_px = heightMm * 96 / 25.4`. For standard broadsheet ($381 \times 577.85\text{ mm}$), width is exactly $1440\text{ px}$ and height is $2184\text{ px}$.
  - Derives canonical pt-based tokens for padding, gaps, column rules, masthead strips, article headers, decks, bylines, datelines, drop caps, and folio footers used identically by both the editor canvas and the HTML renderer.
- **Pointer-to-Page Coordinate Transformer**: Added `screenToPageMm(point, containerRect, scale, pageMm)` to transform viewport pointer events directly into physical millimeter paper coordinates under arbitrary scale factors.

### 1.2 `apps/web/src/components/studio/NewspaperCanvas.tsx`
- **Container Sizing**: Replaced the synthetic 800px base with `physicalMetrics.widthPx` and `physicalMetrics.heightPx`.
- **Pure CSS Scale Zoom**: Switched canvas scaling to CSS `transform: scale(scale)` with `transformOrigin: 'top left'`, allowing the document to maintain fixed, unmutated internal geometry regardless of zoom level. Sized the outer scroll wrapper to `scaledWidthPx` and `scaledHeightPx` to prevent clipping or layout shifting.
- **Unified Pt Typography & Spacing Tokens**: Replaced all hardcoded pixel sizes with shared pt-based metrics (`paddingPt`, `gapPt`, `headlineSizesPt`, `deckFontSizePt`, `bylineFontSizePt`, `topStripFontSizePt`, `bottomStripFontSizePt`, `footerFontSizePt`).
- **Scale-Invariant UI Overlays**: Selection outlines, drop indicators, and drag handles stay visually constant ($\approx 1.5\text{ px}$) by dividing their stroke width and offset by the active scale factor (`1.5 / scale`).
- **Box-Model & Border Optimization**:
  - Replaced `1px solid #d1d5db` sheet border with `box-shadow: 0 0 0 1px #d1d5db...` so the outer border does not steal 2px of printable content width.
  - Eliminated unwanted default article `border-bottom` in physical coordinate mode.
  - Aligned `.masthead-main-row`, `.masthead-top-strip`, and `.masthead-bottom-strip` padding and margins with `renderNewspaperDocumentToHtml`.
  - Aligned paragraph line-break processing to preserve hard line breaks (`\n` $\to$ `<br />`).

### 1.3 `apps/web/src/components/studio/TopBar.tsx` & `apps/web/src/App.tsx`
- **Fit Controls**: Added **Fit to Width** (`onFitWidth`) and **Fit to Page** (`onFitPage`), with an interactive zoom range of 25% to 300%.
- **Responsive Initial Scale**: Mobile viewports default to Fit-to-Width for immediate legibility, while desktop displays default to Fit-to-Page. Added pinch-zoom gesture support and Ctrl+wheel zooming.
- **Feature Flag Control & Test Hooks**: Added interactive toggle in the TopBar and URL parameter support (`?physicalCanvas=true&scale=1.0`), along with automation hooks (`window.__setDocument`, `window.__setScale`, `window.__setPhysicalCanvas`).
- **Feature Flag Default**: Switched `usePhysicalCanvasCoordinates` default from `false` to `true`.

---

## 2. Inventory of Replaced 800px Dependencies

| Location | Prior Implementation | New Implementation | Rationale |
| :--- | :--- | :--- | :--- |
| `apps/web/src/components/studio/NewspaperCanvas.tsx:83` | `const baseWidth = orientation === 'landscape' ? 1080 : 800; const baseHeight = Math.round(baseWidth / aspectRatio);` | `canvasWidthPx = usePhysicalCanvasCoordinates ? physicalMetrics.widthPx : legacyBaseWidth;` | Renders the page container at exact physical CSS dimensions ($1440 \times 2184\text{ px}$ for broadsheet) matching the print engine. |
| `apps/web/src/App.tsx:146` | `const baseWidth = orientation === 'landscape' ? 1080 : 800;` in `getCanvasBaseDimensions` | Uses `getPhysicalPageMetrics(pageSize, orientation)` when `usePhysicalCanvasCoordinates` is enabled. | Sizing computations for Fit-to-Width and Fit-to-Page now accurately scale from true physical paper dimensions. |
| `apps/web/src/components/NewspaperSheet.tsx` | Legacy component using fixed 800px container width | Deprecated / unreferenced legacy component. | Replaced by `NewspaperCanvas.tsx` across the workspace. |

---

## 3. Parity Measurement Gate Results

Measurements were gathered using the Playwright parity test suite (`tests/visual/canvas-parity.spec.ts`) comparing the React Editor Canvas at 100% scale against the vector HTML renderer used for PDF export:

| Template | Masthead Delta ($\Delta W / \Delta H$) | Footer Delta ($\Delta W / \Delta H / \Delta Y$) | Max Article Delta ($\Delta W / \Delta H / \Delta Y$) | Total Content Height Delta | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Classic Hindi Broadsheet** (`classic-hindi-broadsheet`) | $0.00\text{ mm} / 0.26\text{ mm}$ | $0.00\text{ mm} / 0.27\text{ mm} / 0.27\text{ mm}$ | $0.00\text{ mm} / 0.26\text{ mm} / 0.53\text{ mm}$ | **$0.00\text{ mm}$** ($560.92\text{ mm}$ vs $560.92\text{ mm}$) | **PASS** |
| **Hindi Typographic Fixture** (`hindi-fixture`) | $0.00\text{ mm} / 0.26\text{ mm}$ | $0.00\text{ mm} / 0.27\text{ mm} / 0.27\text{ mm}$ | $0.00\text{ mm} / 0.26\text{ mm} / 0.53\text{ mm}$ | **$0.00\text{ mm}$** ($560.92\text{ mm}$ vs $560.92\text{ mm}$) | **PASS** |
| **Modern Hindi Daily** (`modern-hindi-daily`) | $0.10\text{ mm} / 0.26\text{ mm}$ | $0.10\text{ mm} / 0.27\text{ mm} / 0.27\text{ mm}$ | $0.10\text{ mm} / 0.26\text{ mm} / 0.53\text{ mm}$ | **$0.00\text{ mm}$** ($447.33\text{ mm}$ vs $447.33\text{ mm}$) | **PASS** |
| **Local Hindi Gazette** (`local-hindi-gazette`) | $0.00\text{ mm} / 0.26\text{ mm}$ | $0.00\text{ mm} / 0.27\text{ mm} / 0.27\text{ mm}$ | $0.00\text{ mm} / 0.26\text{ mm} / 0.53\text{ mm}$ | **$0.00\text{ mm}$** ($419.10\text{ mm}$ vs $419.10\text{ mm}$) | **PASS** |
| **Classic Broadsheet** (`classic-broadsheet`) | $0.00\text{ mm} / 0.26\text{ mm}$ | $0.00\text{ mm} / 0.27\text{ mm} / 0.27\text{ mm}$ | $0.00\text{ mm} / 0.26\text{ mm} / 0.53\text{ mm}$ | **$0.00\text{ mm}$** ($560.92\text{ mm}$ vs $560.92\text{ mm}$) | **PASS** |
| **Modern Editorial** (`modern-editorial`) | $0.10\text{ mm} / 0.26\text{ mm}$ | $0.10\text{ mm} / 0.27\text{ mm} / 0.27\text{ mm}$ | $0.10\text{ mm} / 0.26\text{ mm} / 0.53\text{ mm}$ | **$0.00\text{ mm}$** ($447.33\text{ mm}$ vs $447.33\text{ mm}$) | **PASS** |
| **Compact Local** (`compact-local`) | $0.00\text{ mm} / 0.26\text{ mm}$ | $0.00\text{ mm} / 0.27\text{ mm} / 0.27\text{ mm}$ | $0.00\text{ mm} / 0.26\text{ mm} / 0.53\text{ mm}$ | **$0.00\text{ mm}$** ($419.10\text{ mm}$ vs $419.10\text{ mm}$) | **PASS** |

### 3.1 Text Line-Break Parity (5 Hindi Paragraphs)
- **Paragraph 1**: Canvas = 1 line, PDF = 1 line (**Match**)
- **Paragraph 2**: Canvas = 1 line, PDF = 1 line (**Match**)
- **Paragraph 3**: Canvas = 1 line, PDF = 1 line (**Match**)
- **Paragraph 4**: Canvas = 2 lines, PDF = 2 lines (**Match**)
- **Paragraph 5**: Canvas = 1 line, PDF = 1 line (**Match**)
- **Outcome**: 100% line break and wrap parity.

---

## 4. Remaining Variances Analysis

All observed variances fall strictly within **$0.00\text{ mm} - 0.53\text{ mm}$** (sub-pixel grid rendering):
1. **$0.26\text{ mm} \approx 1.0\text{ px}$ Vertical Discrepancy**: 
   $1\text{ px} \times \frac{25.4}{96} = 0.264583\text{ mm}$. Minor browser sub-pixel floor/ceiling adjustments on double rules and hairline borders cause a 1px variation depending on whether the element aligns with integer physical screen pixels.
2. **$0.10\text{ mm}$ Horizontal Discrepancy**:
   Present only on Berliner format ($315\text{ mm}$ width) where the 12-column grid fraction ($315 / 12 = 26.25\text{ mm}$) involves fractional CSS pixels resulting in sub-pixel rounding across column gaps.
3. **Total Content Height**:
   Delta is **$0.00\text{ mm}$** across 100% of the templates.

---

## 5. Mobile & Responsive Viewport Considerations

1. **Auto-Fit Policy**:
   - On screen widths $< 768\text{ px}$, the canvas automatically activates **Fit to Width** (`onFitWidth`), ensuring the newspaper page scales down smoothly to fill the mobile screen horizontally without side-scrolling.
   - On desktop screens ($\ge 768\text{ px}$), the canvas initializes to **Fit to Page** (`onFitPage`), showing the entire broadsheet inside the viewport.
2. **Pinch & Touch Gestures**:
   - Touch listeners calculate distance between touch points (`e.touches[0]` and `e.touches[1]`) to adjust scale continuously between 0.25 and 3.0.
3. **Visual Quality on High-DPI Mobile Screens**:
   - Because the underlying page is rendered at $1440\text{ px}$ broadsheet resolution, CSS downscaling to mobile screen widths yields retina-sharp text with sub-pixel antialiasing and no blurred raster artifacts.

---

## 6. Verification Artifacts & Summary

- **Visual Comparison Side-by-Side Images**: Generated for all 7 documents and stored in `tests/after-canvas/`:
  - `classic-broadsheet_side_by_side.png`
  - `classic-hindi-broadsheet_side_by_side.png`
  - `compact-local_side_by_side.png`
  - `hindi-fixture_side_by_side.png`
  - `local-hindi-gazette_side_by_side.png`
  - `modern-editorial_side_by_side.png`
  - `modern-hindi-daily_side_by_side.png`
- **Monorepo Quality Gates**:
  - `pnpm typecheck`: 0 errors across all 7 packages.
  - `pnpm lint`: 0 errors, 0 warnings.
  - `pnpm test`: 67 passed across 12 test suites.
  - `pnpm build`: 100% clean production build.
- **Feature Flag**: `usePhysicalCanvasCoordinates` is enabled by default (**ON**).
