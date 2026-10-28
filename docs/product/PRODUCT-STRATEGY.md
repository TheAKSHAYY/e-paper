# E-PAPER STUDIO — PRODUCT STRATEGY & MARKET VISION

## 1. Executive Summary

E-Paper Studio is a specialized web-based publishing software platform engineered specifically for independent publishers, regional journalists, media agencies, collegiate institutions, and community organizations in India. While general-purpose layout tools (such as Canva, Adobe InDesign, or QuarkXPress) either oversimplify document structures into non-journalistic posters or impose prohibitive cost and steep learning curves, E-Paper Studio bridges the gap: it delivers a **smart, grid-constrained newspaper publishing environment with authentic Devanagari typography, multi-page edition management, and zero-configuration print/e-paper PDF output**.

---

## 2. Target Users & Personas

### Persona A: The Regional Newspaper Editor (Mr. Rajesh Sharma, Varanasi)

- **Role**: Editor-in-Chief of a district Hindi weekly/daily (_दैनिक जनवाणी_).
- **Core Problem**: Relies on freelance DTP (desktop publishing) operators using pirated PageMaker 7.0 on legacy Windows XP machines. Every layout change incurs turnaround delays, high fees, and broken Unicode fonts.
- **Needs**: Needs to input Hindi stories directly, drop in local photos, maintain a traditional 4-to-6 column newspaper hierarchy, and generate an exact, print-ready PDF for the local press operator by 11:00 PM.
- **Comfort Level**: Familiar with Indian newspaper vocabulary (मास्टहेड, मुख्य समाचार, संपादकीय, बाईलाइन); UI controls must be clean, modern, and uncluttered.

### Persona B: The Campus / School Publication Coordinator (Ms. Ananya Roy, Delhi)

- **Role**: Faculty advisor for college bilingual gazette / bulletin.
- **Core Problem**: Students submit articles in Hindi and English. General-purpose templates look like marketing flyers, not authentic newspapers.
- **Needs**: Multi-page management (4–8 pages), easy story replacement, automated column balancing, and fast digital PDF distribution to WhatsApp groups and Telegram channels.

### Persona C: The Independent Investigative Reporter / Substack Journalist

- **Role**: Self-published investigative writer producing bi-weekly PDF newsletters with a classic broadsheet aesthetic.
- **Needs**: Rapid single-sheet or 4-page layout, high typographic elegance, verified open-source Devanagari web fonts, and instant export without design software overhead.

---

## 3. Product Positioning & Value Proposition

| Dimension             | General Design Tools (Canva, Visme)                  | Legacy Professional DTP (InDesign, Quark)        | E-Paper Studio                                                                          |
| :-------------------- | :--------------------------------------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Domain Model**      | Freeform canvas, graphic poster objects              | Unconstrained typography frames, manual linking  | **Semantic Newspaper Hierarchy (Publication → Page → Grid → Block)**                    |
| **Indian Typography** | Broken matras, Western drop caps, unshaped conjuncts | Complex font engine setup, costly licensing      | **8 Verified OFL Devanagari Fonts, native matra preservation, danda protection**        |
| **Newspaper Grid**    | Manual alignment, inconsistent gutters               | High manual complexity, millimeter ruler setup   | **Smart auto-snapping columns (2 to 6 cols), dynamic vertical rules**                   |
| **Learning Curve**    | Low, but produces posters, not newspapers            | High (months of specialized training)            | **Immediate (< 3 minutes to first printed edition)**                                    |
| **Output Integrity**  | Scaled raster PDF or non-standard page boxes         | Full vector, but requires manual bleed/box setup | **Exact physical points (Broadsheet, Berliner, Tabloid, A3, A4) with single-click PDF** |

---

## 4. The 4 Product Pillars (Differentiation)

1. **Authentic Indian Newspaper Design**:
   - Default master publication: _जनवाणी समाचार_ (Janwani Samachar).
   - Ornate traditional masthead with left/right weather/price ears, sub-nameplates, and issue folios.
   - Genuine multi-column editorial hierarchy (Lead story, major feature, 2-col analysis, brief notice tickers).
   - High-contrast newsprint aesthetics (16-level grayscale compatible, crisp black ink rules, no pastel marketing gradients on canvas).

2. **Smart Newspaper Editor**:
   - Contextual Inspector: Select an article to adjust headline weights, columns, and datelines; select an image to replace, crop, and caption; select the page to change dimensions and margins.
   - Smart Block Grid: Drag, reorder, and span blocks safely without corrupting adjacent columns.
   - Progressive Disclosure: Essential publishing actions visible immediately; granular typographic metrics accessible on demand.

3. **Beginner-Friendly Automation**:
   - Realistic Hindi sample content tailored to national, business, sports, and regional desks.
   - Real-time page capacity budgeting and overflow indicators that advise users before text clipping occurs.
   - Automatic inside page folio generation ("पृष्ठ 2 • जनवाणी समाचार • मंगलवार, 27 अक्टूबर 2026").

4. **Reliable Vector Publishing**:
   - Single-click, unified multi-page PDF generation via headless Playwright engine.
   - Exact physical MediaBox geometry (Broadsheet 15"×22.75", Berliner 12.4"×18.5", Tabloid 11"×17", A3, A4).
   - Full Unicode HTTP header compliance (RFC 5987 / RFC 6266) supporting native Devanagari publication filenames.

---

## 5. Product Scope & Roadmap Horizons

### Phase MVP (Current Release)

- English-first UI workspace with Hindi-first default newspaper content.
- Multi-page publication management (add, duplicate, delete, reorder pages).
- Dynamic block library (Masthead, Lead Story, Multi-Column Article, Photo Story, Editorial, Briefs).
- Contextual right inspector and collapsible sidebar.
- 5 standard newspaper formats (Broadsheet, Berliner, Tabloid, A3, A4) in Portrait/Landscape.
- Single unified multi-page vector PDF download.
- Local draft persistence with auto-save and instant recovery.
- Full responsive editing (Desktop, Tablet, Mobile touch layout).

### Phase 2 (Growth Horizon)

- Classified advertisements builder and obituary notices module.
- Bilingual layout synchronization (side-by-side Hindi and English columns).
- Pre-flight print check (300 DPI image resolution warnings, ink density analysis).
- Cloud storage integration and revision history snapshots.

### Phase 3 (Commercial Scale Horizon)

- Multi-seat editorial collaboration and desk assignments.
- Direct digital kiosk / WhatsApp e-paper distribution API.
- Automated RSS / News wire feed story importer.

---

## 6. Success Metrics & Key Results (OKRs)

- **Time-to-First-Edition (TTFE)**: A new user creates and downloads an authentic 2-page Hindi newspaper in under 4 minutes.
- **PDF Layout Determinism**: 100% parity between canvas screen rendering and downloaded vector PDF geometry.
- **Font Rendering Accuracy**: Zero broken Hindi matras or detached vowel marks across all supported viewports and PDF readers.
- **Zero Data Loss**: 100% of user edits restored upon accidental tab refresh or browser restart via IndexedDB/localStorage.
