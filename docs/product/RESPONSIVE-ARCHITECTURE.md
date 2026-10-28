# E-PAPER STUDIO — RESPONSIVE ARCHITECTURE SPECIFICATION

## 1. Principles of Responsive Newspaper Editing

Editing a physical newspaper format (which can be as large as 15" × 22.75" in physical print) across screen sizes ranging from 360px mobile viewports to 27" desktop monitors requires distinct workflow architectures, not merely proportional CSS downscaling.

```
+-----------------------------------------------------------------------------------------+
| Viewport Tier      | Width Range    | Layout Strategy               | Interaction Model |
+-----------------------------------------------------------------------------------------+
| Desktop Wide       | >= 1440px      | 3-Pane Split (Nav+Canvas+Insp)| Direct Mouse/Drag |
| Desktop Standard   | 1200px-1439px  | Collapsible Nav + Wide Canvas | Direct Mouse/Drag |
| Tablet Landscape   | 1024px-1199px  | Dual Pane / Adaptive Inspector| Hybrid Touch/Mouse|
| Tablet Portrait    | 768px-1023px   | Center Canvas + Modal Drawers | Touch-First Gestures|
| Mobile Large       | 390px-767px    | Single Column + Bottom Sheet  | Bottom Nav + Touch|
| Mobile Compact     | 360px-389px    | Single Column + Compact Sheet | Bottom Nav + Touch|
+-----------------------------------------------------------------------------------------+
```

---

## 2. Desktop & Laptop Architecture (>= 1200px)

### Layout Anatomy

- **Top Application Bar**: Fixed height 54px. Houses brand, publication title, page switcher, autosave status, zoom controls, and primary CTA buttons (`Preview`, `Save`, `Export PDF`).
- **Left Activity Sidebar**: Width 280px (collapsible to 48px). Houses Tabbed Navigation: `Pages`, `Blocks`, `Templates`, and `Drafts`.
- **Center Canvas**: Flex 1 auto-overflow. Contains the scaled physical newspaper sheet with newsprint background, shadow elevation, and interactive drop zones.
- **Right Contextual Inspector**: Width 340px. Displays detailed controls tailored to the active element (Page Geometry, Masthead, Article, or Photo).

### Interaction Patterns

- Direct click-to-select on any article card.
- Visual focus ring indicates active selection.
- Drag-and-drop handles on block cards.
- Zoom scale dropdown (`Fit Width`, `50%`, `75%`, `100%`, `125%`).

---

## 3. Tablet Architecture (768px to 1199px)

### Layout Anatomy

- **Landscape (1024×768)**:
  - Top bar remains compact.
  - Left sidebar collapses into an icon activity rail (48px) with popover drawers.
  - Right inspector remains visible with compact input padding.
  - Canvas scales smoothly to fit the central viewport without horizontal overflow.
- **Portrait (768×1024)**:
  - Canvas takes dominant center stage.
  - Right inspector transforms into an off-canvas slide-over drawer triggered by tapping any article card or tapping "Inspect" in the top bar.

---

## 4. Mobile Architecture (360px to 767px)

### Critical Mobile Requirements

1. **Zero Unintended Horizontal Overflow**: The page viewport must remain strictly contained within 100vw.
2. **Dedicated Touch-First Workflows**:
   - Replace complex drag-and-drop handles with explicit accessible action buttons:
     - `Move Up` (▲) and `Move Down` (▼)
     - `Expand Columns` and `Narrow Columns`
     - `Move to Page...`
   - Bottom Navigation Bar with 4 primary destinations:
     - `Pages`: Opens bottom sheet to switch, add, duplicate, or delete pages.
     - `Edit`: Opens bottom sheet for active article headline/body text editing.
     - `Layout`: Opens bottom sheet for page dimensions, columns, and fonts.
     - `Export`: Triggers immediate PDF export with download notification.
3. **Optimized Input Controls**:
   - Textareas provide comfortable touch targets with minimum 44px tap targets.
   - Devanagari virtual keyboard support without obstructing action buttons.
4. **Realistic Mobile Canvas Preview**:
   - Canvas dynamically scales to 100% of container width (`width: 100%`, `max-width: 100%`), preserving exact newspaper column ratios and typographic hierarchy.

---

## 5. Viewport Verification Matrix

| Viewport Resolution | Target Device Category                 | Verification Criteria                                       |
| :------------------ | :------------------------------------- | :---------------------------------------------------------- |
| **1440 × 900**      | Standard Laptop / Desktop              | Full 3-pane layout, no panels overlap, canvas crisp         |
| **1280 × 800**      | 13" MacBook / Ultraportable            | Sidebars fit comfortably, canvas auto-scales cleanly        |
| **1024 × 768**      | iPad Landscape / Tablet                | Responsive sidebar collapse, touch interactions responsive  |
| **768 × 1024**      | iPad Portrait / Small Tablet           | Full-width canvas, slide-over inspector drawer              |
| **390 × 844**       | Modern iPhone (iPhone 13/14/15/16)     | Touch bottom bar visible, no horizontal scroll, clean sheet |
| **360 × 800**       | Standard Android Phone (Samsung/Redmi) | Ultra-compact margins, bottom bar fits, readable font sizes |
