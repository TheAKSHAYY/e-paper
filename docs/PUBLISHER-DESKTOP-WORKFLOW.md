# Publisher Desktop / Laptop Workflow: Professional DTP Newsroom Environment

## Executive Summary

While smartphones provide vital agility for breaking editions and field editors, the desktop workstation or laptop remains the primary workhorse for full-scale daily newspaper production. On a 13-inch to 27-inch display, a newspaper publisher expects the ergonomics of a professional Desktop Publishing (DTP) suite: split-screen productivity, drag-and-drop news assignment, multi-page overview grids, fine-grained micro-typography, and comprehensive preflight diagnostics.

This document specifies the 10-stage publishing workflow on laptops and desktops, demonstrating how E-Paper Studio replaces expensive, complex proprietary DTP software with an intuitive, cloud-synchronized, client-side web application.

---

## 1. Desktop Ergonomics & Workspace Layout

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION BAR: Edition Name | Date | Page Selector [1][2][3][4] | Preflight Status | Export │
├─────────────────────────┬───────────────────────────────────────────────┬─────────────────────┤
│ LEFT PANEL:             │ CENTER: HIGH-RESOLUTION LIVE CANVAS           │ RIGHT INSPECTOR:    │
│ STAGING NEWS LIBRARY    │                                               │ CONTEXTUAL DTP TOOL │
│                         │ • Full A3/A4 broadsheet physical ratio        │                     │
│ • Unassigned Stories    │ • Zoom Slider (25% to 400%) & Fit-to-Width   │ • Typography Studio │
│ • Category Badges       │ • Rulers, Guides, Column Grid Outlines        │ • Column Geometry   │
│ • Drag handles (⋮⋮)     │ • Multi-page dual spread (Spreads 2–3)        │ • Image Studio      │
│ • Image asset tray      │ • Real-time vector font rendering             │ • Ad Spot Manager   │
│ • Weather & AQI widgets │ • Direct click-to-edit canvas selection       │ • Copyfit Assistant │
├─────────────────────────┴───────────────────────────────────────────────┴─────────────────────┤
│ STATUS BAR: 8 Columns | Page 1 of 4 | 1,420 / 1,800 Words (Fit) | Font Cache: 100% Embedded   │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 10-Stage Desktop Publishing Workflow

### Stage 1: Master Template Selection & Edition Management

- **Action:** The editor opens the Studio Dashboard on Chrome/Firefox/Edge.
- **Experience:**
  - Displays the **Edition Manager**:
    - "Create Today's Issue" (One-click initialization from default template).
    - "Select from Master Templates" (`दैनिक ब्रॉडशीट 8-कॉलम`, `सांध्य टैब्लॉयड 5-कॉलम`, `व्यापार संस्करण`).
    - "Regional Edition Fork" (Create Lucknow / Kanpur / Varanasi branches).
  - Tapping "Create Today's Issue" loads the full spread with yesterday's geometry locked, date auto-advanced, issue number incremented, and article slots open.

### Stage 2: Masthead Deep Customization & Geometry Tuning

- **Action:** Click anywhere inside the top Masthead banner.
- **Experience:**
  - The right inspector opens **Masthead Studio**:
    - **Zone Management:** Enable/Disable Top Strip, Dateline, Rule Dividers.
    - **Ear Advertisements:** Upload client graphics for Left Ear and Right Ear ($45\text{ mm} \times 40\text{ mm}$).
    - **Live Weather Integration:** Type city or auto-fetch real-time temperature, condition icon, and AQI gauge.
    - **Rule Stylist:** Choose from vector SVG ornamental borders (Oxford Thick-Thin, Double Hairline, Ornate Leaf Motif).
    - **Title Typographer:** Adjust font family (`Yatra One`, `Rozha One`, `Noto Serif Devanagari`), font size ($36\text{ pt}$ to $120\text{ pt}$), tracking, and baseline alignment.

### Stage 3: Multi-File News Ingestion & Library Management

- **Action:** Drag and drop 5 Microsoft Word files (`.docx`), 3 text files (`.txt`), and high-res event photos directly into the Left Staging Tray.
- **Experience:**
  - Client-side parsers process all documents in parallel.
  - The News Library populates with structured cards showing:
    - Extracted headline, deck, word count badge (`245 शब्द`), category pill (`राजनीति`).
  - Attached images appear nested under their respective stories.
  - An **"Unassigned Stories (14)"** counter indicates incoming backlog.

### Stage 4: Drag-and-Drop Page Composition on 8-Column Grid

- **Action:** Drag stories from the Left Tray directly onto the Canvas.
- **Experience:**
  - **Drop Zones:** Hovering over the canvas highlights available column modules.
  - Dragging the Lead Story into the top zone automatically snaps it to a 5-column span with hero photo positioning.
  - Dragging secondary stories into adjacent columns automatically adjusts heights.
  - Alternatively, the editor clicks the **"Auto Compose Page"** button in the top bar to have the 2D priority bin-packing engine place all staged stories in one operation.

### Stage 5: Dual-Monitor & Split-Screen Live Canvas Preview

- **Action:** Toggle view modes in the canvas toolbar.
- **Experience:**
  - **Single Page View (A3 / A4):** Detailed layout work at 100% physical scale.
  - **Two-Page Spread (आमने-सामने के पृष्ठ):** Displays Page 2 and Page 3 side-by-side to verify visual balance and eye flow across the editorial fold.
  - **Bird's Eye Multi-Page Grid (4-Page Overview):** Displays all 4 pages simultaneously as zoomable thumbnails for global issue balancing.

### Stage 6: Advanced Micro-Typography Studio

- **Action:** Select any body paragraph or headline to open the Typography Inspector.
- **Experience:**
  - **Hierarchy Presets:** Instant styling (`H1 Lead`, `H2 Subhead`, `Body Text`, `Pull Quote`, `Dateline Byline`).
  - **Font Controls:**
    - Font Family pairing (Headline: `Yatra One` / Body: `Noto Sans Devanagari`).
    - Numeric stepper + slider for font size ($6\text{ pt}$ to $72\text{ pt}$).
    - Precise line-height ($1.1$ to $2.2$ with $0.05$ step increments).
    - Optical tracking / letter spacing ($-0.05\text{ em}$ to $+0.15\text{ em}$).
  - **Editorial Flourishes:**
    - Drop Cap (ड्रॉप कैप / प्रारंभिक बड़ा अक्षर) toggle with customizable 2-line or 3-line span.
    - Column rules (ऊर्ध्वाधर सीमा रेखाएं) between paragraphs with dashed, dotted, or solid styling.
    - Devanagari Justification Tuner (balanced spacing with zero broken conjuncts).

### Stage 7: Media Studio (High-DPI Images, Cropping, Captions)

- **Action:** Click an image block within an article.
- **Experience:**
  - **Interactive Crop Tool:** Adjust focal point, aspect ratio ($16:9$, $4:3$, $1:1$, $3:2$, freeform), and pan.
  - **E-Ink / Print Optimizer:** One-click toggle for 16-level grayscale dithering preview or CMYK print contrast enhancement.
  - **Caption & Credit Editor:** Integrated caption input with automated photo credit styling (`फोटो: विशेष संवाददाता`).
  - **Image Boundary Guard:** Real-time indicator alerting if image resolution falls below $200\text{ DPI}$ at current column width.

### Stage 8: Copyfitting & Multi-Page Story Continuation

- **Action:** An article displays an overset indicator (`+84 शब्द अधिक`).
- **Experience:**
  - The editor opens the **Copyfit Assistant**:
    - **One-Click Micro-Fit:** Automatically tunes body font size from $10.5\text{ pt} \to 10.0\text{ pt}$ and line height from $1.4 \to 1.35$ to absorb the overset copy without visual compromise.
    - **Story Continuation (Jump Line):** If the article is too long to squeeze, the editor clicks **"Jump to Page 4"**:
      - Slices the text at the column boundary.
      - Inserts `(शेष पृष्ठ 4 पर देखें)` at the base of Page 1.
      - Automatically creates a linked story node on Page 4 with headline `(पृष्ठ 1 का शेष...)`.

### Stage 9: Comprehensive 12-Point Preflight Diagnostics

- **Action:** Click the **"Preflight / प्रीफ़्लाइट जांच"** button in the top bar.
- **Experience:**
  - A modal executes a rigorous 12-point audit across all 4 pages:
    - `[PASS]` Text Overflow: Zero clipped paragraphs across all pages.
    - `[PASS]` Font Integrity: All Devanagari glyphs embedded as vector paths.
    - `[PASS]` Margin & Bleed: Content strictly within printable margins ($12\text{ mm}$ physical border).
    - `[PASS]` Image Quality: All photos $\ge 250\text{ DPI}$.
    - `[PASS]` Masthead Completeness: Today's date, issue number, and registration verified.
    - `[PASS]` Advertisement Audit: All booked commercial spots present and sized.
  - Returns **"PREFLIGHT PASSED: READY FOR COMMERCIAL PRINT"**.

### Stage 10: Vector PDF Export & Print-Ready Distribution

- **Action:** Click **"Export High-Resolution PDF"**.
- **Experience:**
  - Choose export target:
    - **Commercial Web Offset Press:** 300 DPI, Vector text, CMYK color space compatibility, crop marks.
    - **Digital E-Paper Web Edition:** Compact WebP/vector PDF optimized for mobile reading and instant WhatsApp sharing ($< 5\text{ MB}$).
  - Browser executes client-side rendering with multi-page progress indicator.
  - Direct download initiates immediately.
  - Optional: Direct integration to send PDF via webhook or email to printing press facility.

---

## 3. Desktop Keyboard Shortcuts for Rapid DTP Production

To match the speed of seasoned InDesign operators, the desktop environment incorporates standard publishing keybindings:

- `Ctrl + S`: Instant local draft save.
- `Ctrl + Shift + P`: Run Preflight Audit.
- `Ctrl + E`: Trigger PDF Export.
- `[` / `]`: Decrease / Increase selected font size by $1\text{ pt}$.
- `Ctrl + 0`: Fit canvas to screen.
- `Ctrl + 1`: View at 100% physical scale.
- `Space + Drag`: Pan canvas freely across spreads.
- `Tab`: Hide side panels for distraction-free proofreading.
