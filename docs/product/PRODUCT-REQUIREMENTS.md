# E-PAPER STUDIO — PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Overview & Objectives

E-Paper Studio provides a complete, modern web environment for composing, editing, organizing, and exporting professional multi-page newspapers. This PRD details all functional and non-functional requirements for the upgraded application.

---

## 2. Functional Requirements (FR)

### 2.1 Workspace & Chrome (English-First by Default)

- **FR-1.1 Application Language**: Application interface chrome (menus, buttons, tooltips, dialogs, inspector labels) must be rendered in professional English by default.
- **FR-1.2 Top App Bar**:
  - Publication Title display with inline rename trigger.
  - Page switcher dropdown and page count badge (`Page 1 of 4`).
  - Real-time save status indicator (`Saved`, `Unsaved changes...`, `Saving...`).
  - Viewport mode toggle (Desktop split vs Preview-only vs Responsive zoom).
  - Primary call-to-actions: `Preview`, `Save Draft`, `Export PDF`.
- **FR-1.3 Left Navigation Sidebar**:
  - Collapsible tabbed drawer:
    - **Pages**: Visual list of page thumbnails with actions to Add, Duplicate, Reorder (Up/Down), and Delete.
    - **Blocks**: Draggable / clickable library of newspaper blocks with visual previews and Indian news categories.
    - **Templates**: Preset library (Classic Hindi Broadsheet, Modern Daily, Local Gazette, Berliner Editorial, Compact Tabloid).
    - **Drafts**: Local draft manager with timestamps, page counts, duplicate, and delete actions.
- **FR-1.4 Contextual Right Inspector**:
  - Automatically adapts its control panels based on current selection:
    - **No Selection / Page Selected**: Page geometry (Size, Orientation, Columns: 2–6, Density: Compact/Normal/Spacious, Column Rules toggle, Margin padding).
    - **Masthead Selected**: Publication name, subtitle, edition name, issue number, publication date, price, weather/ear notice.
    - **Article / Story Selected**: Headline text, subheadline / deck, byline, dateline, body text editor, column span slider (1 to max columns), article priority (Lead, Major, Minor, Brief).
    - **Image Selected / In-Article Photo**: Image URL input or local file upload, image caption, image position (Top, Middle, Bottom, None).
    - **Typography Settings**: Font selection for Masthead, Headlines, Subheadlines, and Body text; weight selector (300 to 900); font size adjustment.

### 2.2 Authentic Indian Newspaper Canvas (Hindi-First Default)

- **FR-2.1 Default Publication**: New projects default to _जनवाणी समाचार_ (Janwani Samachar) with authentic Devanagari seed journalism covering national affairs, science, agriculture, and urban civic issues.
- **FR-2.2 Canvas Page Structure**:
  - Page 1: Traditional Masthead (Ear strip with weather/price, large nameplate, bottom date/issue folio rule).
  - Page 2+: Authentic Inside Folio Header ("जनवाणी समाचार • पृष्ठ 2 • मंगलवार, 27 अक्टूबर 2026").
  - Multi-column grid layout with crisp vertical dividing rules (`column-rule: 1px solid #d5d0c4`).
  - Bottom publication folio rule on all pages.
- **FR-2.3 Newspaper Block System**:
  - Each block represents an editorial unit. Supported block types:
    - `masthead`: Front page nameplate and ear notices.
    - `lead-story`: High-impact headline spanning 2-4 columns with prominent image and deck.
    - `standard-story`: 1 or 2 column news article with optional photo and byline.
    - `photo-story`: Dominant image with descriptive Hindi caption and brief report.
    - `breaking-strip`: High-contrast single-row ticker / bulletin.
    - `editorial`: Formal opinion piece with author credit and justified text.
    - `briefs-ticker`: Bulleted civic and regional briefs in a compact box.
    - `classified-notice`: Framed announcement or institutional notice.

### 2.3 Smart Grid & Reordering Engine

- **FR-3.1 Column Constraints**: Articles must constrain to discrete integer column spans (1 to 6) without floating or causing uncontrolled overlapping.
- **FR-3.2 Block Reordering**:
  - Drag-and-drop handles for desktop mouse interaction.
  - Accessible one-click "Move Up" and "Move Down" action buttons for keyboard and touch users.
  - "Move to Page..." action allowing articles to be shifted between pages in multi-page publications.
- **FR-3.3 Layout Integrity**: Switching templates or column counts preserves all story text, headlines, and images without data loss.

### 2.4 Multi-Page Publication Management

- **FR-4.1 Publication Hierarchy**: The system model must follow `Publication → Pages → Layout & Blocks`.
- **FR-4.2 Page Operations**:
  - Add Page: Inserts a new blank page or template page into the publication.
  - Duplicate Page: Clones an existing page with deep-copied, independent block IDs.
  - Delete Page: Deletes the target page with confirmation (guaranteeing at least 1 page remains).
  - Reorder Pages: Moves pages up or down in sequence; this sequence strictly dictates PDF page order.
- **FR-4.3 Page-Level Density Estimation**:
  - Calculates typographic character and word counts against standard print budgets.
  - Displays non-intrusive layout warnings when density exceeds single-sheet print boundaries.

### 2.5 Multi-Page Vector PDF Export

- **FR-5.1 Server / Worker Integration**: Connects to the local Chromium Playwright rendering worker (`/api/render-pdf`).
- **FR-5.2 Complete Unified Document**: Generates a single downloadable PDF file containing all pages in correct sequence.
- **FR-5.3 Physical Geometry**: PDF MediaBox must match physical standard specifications (e.g., Broadsheet: 1080pt × 1638pt; Berliner: 892.8pt × 1332pt; Tabloid: 792pt × 1224pt; A3: 841.89pt × 1190.55pt; A4: 595.28pt × 841.89pt).
- **FR-5.4 Unicode HTTP Headers**: File downloads must use RFC 5987 / RFC 6266 `Content-Disposition` encoding to prevent crashes on native Devanagari titles.

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Typographic Integrity & Hindi Shaping

- **NFR-1.1 Devanagari Font Rendering**: All 8 supported open-source fonts (_Noto Serif Devanagari, Noto Sans Devanagari, Mukta, Hind, Rozha One, Yatra One, Gotu, Tiro Devanagari Hindi_) must render with complete conjunct and matra integrity.
- **NFR-1.2 Punctuation & Danda Handling**: Hindi poorna viram (।) and double danda (॥) must not break awkwardly to new lines or separate from sentence ends.
- **NFR-1.3 Drop Cap Isolation**: Western drop-cap styling is automatically disabled for Devanagari script to avoid severe conjunct splitting.

### 3.2 Performance & Responsiveness

- **NFR-2.1 Canvas Rendering**: Typing in the active article editor must update the canvas smoothly without UI jank.
- **NFR-2.2 PDF Render Time**: 1-to-4 page publications render into vector PDF in under 6 seconds on standard developer hardware.
- **NFR-2.3 Asset Security**: Outbound image fetching in the PDF renderer worker strictly enforces SSRF protection, blocking loopback and private IP ranges.

### 3.3 Persistence & Reliability

- **NFR-3.1 Automatic Local Drafts**: All modifications persist to browser storage via debounced autosave.
- **NFR-3.2 Unsaved Changes Protection**: Closing or refreshing an active editing session triggers standard `beforeunload` warnings if unsaved edits exist.

---

## 4. Explicitly Out-of-Scope (MVP Phase)

- Third-party payment gateway integration (Stripe, Razorpay) — monetization readiness will be architected cleanly without live billing code.
- Remote Supabase production database mutations or user account paywalls.
- Automatic AI article generation or translation engines.
