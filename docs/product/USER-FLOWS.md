# E-PAPER STUDIO — USER FLOWS & INTERACTION JOURNEYS

## 1. Flow Overview & Journeys

This document defines the primary user interaction flows for creating, editing, organizing, and publishing Indian newspapers in E-Paper Studio.

---

## 2. Core User Flows

### Flow 1: First-Time Onboarding & Quick Creation

```mermaid
graph TD
    A[User Opens Application] --> B{Existing Drafts in Storage?}
    B -- Yes --> C[Load Most Recent Publication into Studio]
    B -- No --> D[Open Quick Setup Wizard with Authentic Hindi Default]
    D --> E[Default Preset: Classic Hindi Broadsheet 'जनवाणी समाचार']
    E --> F[User Clicks 'Create Newspaper']
    F --> G[Studio Workspace Initialized with Seed Stories & Masthead]
    G --> H[Show Optional Interactive Feature Tour]
```

### Flow 2: Multi-Page Management Journey

```mermaid
graph TD
    A[Active Workspace: Page 1 Selected] --> B[Open Left Sidebar 'Pages' Tab]
    B --> C[User Clicks '+ Add Page']
    C --> D{Choice: Blank Page or Seed Template?}
    D -- Blank --> E[Append Blank Page with Folio Header]
    D -- Seed Template --> F[Append Page with Interior Editorial Layout]
    E --> G[Canvas Scrolls to New Page]
    F --> G
    G --> H[User Reorders Pages: Click 'Move Up' or 'Move Down']
    H --> I[Updated Page Order Reflected in Canvas and PDF Queue]
    G --> J[User Clicks 'Duplicate Page': Clones All Articles with New IDs]
    G --> K[User Clicks 'Delete Page': Confirmation Modal -> Removes Page]
```

### Flow 3: Content Editing & Contextual Inspector Flow

```mermaid
graph TD
    A[User Clicks on an Article Card on Canvas] --> B[Canvas Focus Ring Activates on Target Block]
    B --> C[Right Contextual Inspector Switches to 'Article Settings']
    C --> D[User Edits Hindi Headline / Subheadline / Body Text]
    D --> E[Real-Time Debounced Update to Newspaper Canvas]
    C --> F[User Adjusts Column Span Slider: 1 col to 4 cols]
    F --> G[CSS Grid Column Span Updates Immediately]
    C --> H[User Replaces In-Article Photo]
    H --> I{Upload Local File or Enter Image URL?}
    I -- File Upload --> J[Read as Data URI & Store in Document Model]
    I -- Image URL --> K[Sanitize URL & Render in Figure Element]
    J --> L[User Adds Caption & Byline]
    K --> L
    L --> M[Real-Time Canvas Update with Proper Figure Alignment]
```

### Flow 4: Block Insertion & Drag-and-Drop / Reordering Flow

```mermaid
graph TD
    A[Open Left Sidebar 'Blocks' Tab] --> B[Browse Categorized Newspaper Blocks]
    B --> C{User Interaction Method}
    C -- Drag & Drop --> D[Drag Block Card over Newspaper Canvas]
    D --> E[Drop Zones Highlight between Existing Blocks]
    E --> F[Release Block into Target Drop Zone]
    C -- Accessible Click --> G[Click 'Add to Page' Button on Block Card]
    G --> H[Append Block to Bottom of Current Active Page]
    F --> I[Block Initialized with Hindi Sample Content]
    H --> I
    I --> J[User Uses Canvas Action Buttons: Move Up / Move Down to Reorder]
    J --> K[Document Model Order Index Automatically Recalculated]
```

### Flow 5: Full Publication PDF Export Journey

```mermaid
graph TD
    A[User Clicks 'Export PDF' in Top Bar] --> B[Client Pre-flight Validation: Check Page Count & Image Safety]
    B --> C[Show Loading Spinner & Progress Status in UI]
    C --> D[Send Full Multi-Page Document Model to /api/render-pdf]
    D --> E[Headless Playwright Chromium Launches]
    E --> F[Set Exact Physical Viewport: Points & MediaBox]
    F --> G[Inject HTML Template with Web Fonts & CSS Grid]
    G --> H[Wait for document.fonts.ready & Image Decoding]
    H --> I[Chromium Print Engine Generates Vector PDF Buffer]
    I --> J[Set RFC 5987 / RFC 6266 Unicode Filename Headers]
    J --> K[Return Binary Buffer to Client with 200 OK]
    K --> L[Client Triggers Native Browser File Download]
    L --> M[Show Success Toast: 'Downloaded Janwani_Samachar.pdf (X KB)']
```

### Flow 6: Error Recovery & Edge Case Journeys

1. **Typographic Overflow Warning Flow**:
   - As body text expands, real-time volume estimator tracks word budget.
   - If estimated words exceed physical page threshold (> 4,000 for Broadsheet, > 2,200 for Tabloid), a non-blocking Amber Warning banner appears above the canvas.
   - User actions provided:
     - Shorten text manually.
     - Reduce body font size (e.g. from 10.5pt to 9.5pt).
     - Move article to subsequent page via "Move to Page" dropdown.
     - Add a new page to the publication.

2. **Unsaved Edits Protection Flow**:
   - If user attempts to close the tab or navigate away while `hasUnsavedChanges === true`:
     - Browser prompts native `beforeunload` dialog: _"Changes you made may not be saved."_
   - Autosave interval runs every 3 seconds of idle time, minimizing data loss risk to zero.

3. **PDF Export Error Recovery Flow**:
   - If server worker times out or network connection fails:
     - Error banner displays human-readable diagnostic message.
     - Clear retry action button provided without reloading the page or losing edits.
