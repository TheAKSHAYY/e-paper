# E-Paper Studio — Feature Regression & Recovery Audit

**Document Version:** 1.0.0  
**Audit Date:** November 2026  
**Repository:** `TheAKSHAYY/e-paper`  
**Current Commit Reference:** `e9c5863`

---

## 1. Regression Chronology & Root Cause Analysis

### Commit Timeline

1. **Commit `6e10b58` (Free Layout & Snapping):**
   - Introduced `FreeLayoutLayer`, millimeter positioning (`frame: { x, y, w, h }`), D-pad nudge controls, and per-page `layoutMode: 'auto' | 'free'`.
   - Desktop inspector received coordinate controls; mobile UI was not yet adapted for free layout.
2. **Commit `0765430` & `daab6a7` (Studio Enhancements & Mobile Drawers):**
   - Established the original mobile drawer architecture with 5 tabs: `पेज`, `+ ब्लॉक`, `संपादक / गुण`, `प्रारूप`, `PDF`.
   - Used full-screen opaque overlay backdrops on mobile drawers which obscured the newspaper preview during editing.
3. **Commit `ee5ddb1` (In-Browser Client-Side PDF Export):**
   - Replaced external server renderer requirement with 100% in-browser vector PDF export using `renderNewspaperDocumentToHtml`.
4. **Commit `7843852` (Mobile-First Redesign):**
   - _Intended Improvement:_ Implemented an always-visible canvas preview with dynamic viewport padding (`paddingBottom: calc(40vh + 60px)`) and floating zoom controls.
   - _Regression / Relocation Cause:_ Replaced the 5 authentic newspaper buttons (`पेज`, `+ ब्लॉक`, `संपादक`, `प्रारूप`, `PDF`) with generic app categories (`टेक्स्ट`, `चित्र`, `लेआउट`, `शैली`, `अधिक`). This buried the direct `+ ब्लॉक` and `PDF` actions inside sub-menus, altered familiar newspaper terminology, and omitted the block template picker.
5. **Commit `7bbbdae` (Typography & Paragraph Controls):**
   - Added `article.paragraphTypography` to document schema and template engine.
   - Added font size stepper `[ − ] 14 pt [ + ]`, custom numeric input, range slider, and individual paragraph selection (`[¶ 1] [¶ 2] ... [सभी]`).
6. **Commit `e9c5863` (Toolbar Restoration & Embedded Typography):**
   - Restored the 5 authentic newspaper buttons in `MobileBottomNav.tsx`: `पेज`, `+ ब्लॉक`, `संपादक / गुण`, `प्रारूप`, `PDF`.
   - Embedded `TypographyControls` directly inside the contextual editor drawer.
   - Restored `ELEMENT_PRESETS` in `+ ब्लॉक` drawer and `NEWSPAPER_PRESETS` in `प्रारूप` drawer.

---

## 2. Granular Feature Regression Matrix

| Feature                                        | Last Known Fully Working Commit               | Original Component                                   | Component in `7843852` (Before Fix)                            | Current Component (`e9c5863`)                                      | Root Cause of Issue                                                | Recovery Complexity       | Current Status       |
| :--------------------------------------------- | :-------------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------- | :------------------------ | :------------------- |
| **Direct "+ ब्लॉक" Button**                    | `daab6a7`                                     | `MobileBottomNav.tsx` (`mode: 'blocks'`)             | Subsumed under `mode: 'text'` (required scrolling past inputs) | `MobileBottomNav.tsx` + `MobileBottomSheet.tsx` (`mode: 'blocks'`) | Generic 6-item toolbar replaced 5-item newspaper toolbar           | Low (Already Resolved)    | **WORKING**          |
| **Direct "PDF" Export Button in Toolbar**      | `daab6a7`                                     | `MobileBottomNav.tsx` (`onExportPdf`)                | Relocated into `⋯ अधिक` (More) menu                            | `MobileBottomNav.tsx` (`data-testid="mobile-nav-pdf"`)             | Replaced with generic "More" button                                | Low (Already Resolved)    | **WORKING**          |
| **Newspaper Block Template Library on Mobile** | `daab6a7`                                     | `LeftSidebar.tsx` (`activeTab: 'blocks'`)            | Missing (only had single "Add Article" button)                 | `MobileBottomSheet.tsx` renders full `ELEMENT_PRESETS`             | `ELEMENT_PRESETS` was omitted from new bottom sheet                | Low (Already Resolved)    | **WORKING**          |
| **Authentic Hindi Terminology**                | `daab6a7`                                     | Hindi labels (`पेज`, `+ ब्लॉक`, `संपादक`, `प्रारूप`) | Generic labels (`टेक्स्ट`, `चित्र`, `लेआउट`, `शैली`, `अधिक`)   | Restored authentic labels in `MobileBottomNav.tsx`                 | Redesign followed generic smartphone DTP app patterns              | Low (Already Resolved)    | **WORKING**          |
| **Always-Visible Preview on Mobile**           | None (Previously obscured by opaque backdrop) | Full-screen modal overlay                            | `MobileBottomSheet.tsx` + dynamic padding on canvas            | `MobileBottomSheet.tsx` + dynamic padding + floating zoom          | Backdrops previously covered the canvas; dynamic padding solved it | Low (Already Resolved)    | **WORKING**          |
| **Individual Paragraph Typography Targeting**  | None (Previously article-wide only)           | `TypographyControls.tsx` (article level)             | Article-level typography only                                  | `TypographyControls.tsx` + `paragraphTypography`                   | Schema only had `article.typography`; added `paragraphTypography`  | Medium (Already Resolved) | **WORKING**          |
| **Font Size Stepper Controls (`− 14 pt +`)**   | None (Only slider existed)                    | Slider only                                          | Slider + numeric input                                         | Stepper buttons (`−`, `+`), slider, numeric input, badge           | Previous UI lacked quick step buttons                              | Low (Already Resolved)    | **WORKING**          |
| **BorderControls on Mobile**                   | `0765430`                                     | `BorderControls.tsx` (Desktop ContextualInspector)   | Omitted from mobile sheet                                      | Desktop inspector only; missing in `MobileBottomSheet`             | Space optimization omitted advanced border controls                | Low                       | **HIDDEN (Group B)** |
| **Background Color & Padding on Mobile**       | `0765430`                                     | `ContextualInspector.tsx` (Desktop)                  | Omitted from mobile sheet                                      | Desktop inspector only; missing in `MobileBottomSheet`             | Omitted during bottom sheet rebuild                                | Low                       | **HIDDEN (Group B)** |
| **D-Pad Millimeter Nudge Controls on Mobile**  | `6e10b58`                                     | `ContextualInspector.tsx` (Desktop)                  | Omitted from mobile sheet                                      | Desktop inspector only; missing in `MobileBottomSheet`             | Free layout controls were only wired to desktop inspector          | Medium                    | **HIDDEN (Group B)** |
| **Masthead Gallery Modal on Mobile**           | `0765430`                                     | `MastheadGalleryModal.tsx`                           | Omitted from mobile sheet                                      | Desktop inspector only                                             | Trigger button only exists in desktop `MastheadInspectorPanel`     | Low                       | **HIDDEN (Group B)** |
| **Curated Font Combinations on Mobile**        | `0765430`                                     | `ContextualInspector.tsx` (Desktop)                  | Omitted from mobile sheet                                      | Desktop inspector only                                             | Omitted from mobile format drawer                                  | Low                       | **HIDDEN (Group B)** |

---

## 3. Feature Categorization Groups

### Group A: Already Working (Fully Restored & Verified)

1. Five-button authentic mobile bottom toolbar (`पेज | + ब्लॉक | संपादक | प्रारूप | PDF`).
2. Always-visible preview canvas with dynamic padding and floating zoom controls.
3. Block template library in mobile sheet (`ELEMENT_PRESETS`: Lead, 2-Col, Photo, Editorial, Breaking Banner, Rashifal, Ads).
4. Contextual text editor with Headline, Subheadline, Kicker, Dateline, Byline, and Body textarea.
5. Complete Typography Controls with stepper `[ − ] 14 pt [ + ]`, slider, numeric input, font family, font weight, line height, letter spacing, alignment, and text color.
6. Individual paragraph targeting via `article.paragraphTypography` with zero bleed into other paragraphs.
7. Multi-page management: Add, duplicate, delete, reorder left/right, switch page.
8. Newspaper preset switcher (`classic-hindi-broadsheet`, `modern-hindi-daily`, `local-hindi-gazette`, `classic-broadsheet`, etc.).
9. 12-column layout row presets (6+6, 4+4+4, 8+4, 12).
10. Page size presets (Broadsheet, Berliner, Tabloid, A3, A4) and orientation toggle.
11. 100% in-browser vector PDF export with self-hosted font embedding.
12. Fallback Print / Save as PDF modal with Hindi instructions.
13. Free layout engine with millimeter absolute positioning, 8-point handles, collision detection, and snapping.
14. Autosave and LocalStorage/IndexedDB draft persistence with "स्वतः सहेजा गया" indicator.

### Group B: Working in Engine but Inaccessible on Mobile (Hidden)

_These features are fully functional on desktop and supported by document schema and template engine, but their UI triggers were omitted from the mobile bottom sheet drawers:_

1. **4-Side Border Controls (`BorderControls.tsx`):** Independent top/right/bottom/left border width, style, and color.
2. **Block Background Color & Padding:** Custom background fill and 0–64px padding slider.
3. **D-Pad Millimeter Nudge Stepper:** Precision $\pm 0.5\text{mm}$, $\pm 1\text{mm}$, $\pm 5\text{mm}$ positioning on free-layout pages.
4. **Block Lock / Unlock Toggle:** Protect blocks from accidental modification.
5. **Layer Ordering (`zIndex` Forward/Backward):** Control stacking order of overlapping blocks.
6. **Masthead Style Gallery Modal:** Traditional masthead rule and emblem switcher.
7. **Curated Devanagari Font Pairings Card:** 1-click pairings for the entire newspaper page.

### Group C: Partially Implemented (Functional with Minor Scope Gaps)

1. **Image Focal Point on Mobile:** Fit modes (Cover, Contain, Fill) are exposed; 9-point coarse focal grid is currently desktop-only.
2. **Masthead Ear Notices on Mobile:** Title, date, edition, and columns are editable on mobile; weather, temperature, AQI, and price ear inputs are desktop-only.
3. **Unequal Custom Grid Columns in Auto-Flow:** Equal-fraction columns (`1fr`) are supported in auto-flow; custom non-uniform column widths require switching the page to Free Layout mode.

### Group D: Recoverable from Git History

_All historical capabilities from commits `6e10b58`, `0765430`, `daab6a7`, and `ee5ddb1` are already in the working tree._ No components need to be resurrected from deleted Git objects; the components (`BorderControls`, `FreeLayoutLayer`, `MastheadGalleryModal`, `LayoutBuilderRow`, `ElementsPanel`) are present in `apps/web/src/components/studio/`.

### Group E: Requires New Implementation

1. **Multi-Touch Pinch-to-Zoom Gesture:** Currently canvas zooming uses floating `+`, `−`, `⊡` buttons. Native 2-finger pinch gesture on canvas would further enhance mobile feel.
2. **Multi-Select Blocks on Mobile:** Selecting multiple blocks simultaneously to move or delete as a group (currently supported one block at a time).

### Group F: Requires Architectural Redesign

_None._ The current monorepo architecture, `@epaper-studio/document-schema`, `@epaper-studio/template-engine`, and React 19 canvas provide a unified, robust foundation for both mobile and desktop.

---

## 4. Recommended Recovery Implementation Sequence

To achieve 100% feature parity without adding clutter to mobile viewports:

1. **Step 1 — Mobile Inspector Advanced Collapsible Section (Recovery of Group B):**
   - Inside `MobileBottomSheet.tsx` under `mode === 'inspector'`, add a collapsible "अतिरिक्त सेटिंग्स (Advanced Settings)" accordion.
   - Embed `BorderControls` (4-side borders), Background color & padding, Lock toggle, and Layer z-index stepper inside this accordion.
2. **Step 2 — Mobile Masthead Customizer Expansion:**
   - When no article is selected in `mode === 'inspector'`, add ear notice fields (Weather, Price, AQI) and a "मास्टहेड शैलियाँ (Gallery)" button triggering `MastheadGalleryModal`.
3. **Step 3 — Curated Font Pairings in Format Sheet:**
   - In `mode === 'presets'`, render the "Curated Devanagari Pairings" card below the newspaper presets.
4. **Step 4 — Verification:**
   - Run typecheck, lint, unit tests, and Playwright E2E suite to confirm zero regressions.
