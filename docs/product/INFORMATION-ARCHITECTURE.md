# E-PAPER STUDIO — INFORMATION ARCHITECTURE (IA)

## 1. System Navigation Hierarchy

E-Paper Studio organizes all publishing capabilities into three primary conceptual spaces:

1. **The Publication Hub (Dashboard & Project Setup)**
2. **The Publishing Studio (Core Workspace)**
3. **The Output Engine (Preview & PDF Vector Export)**

```
E-Paper Studio
├── 1. Publication Hub
│   ├── Create New Publication (Wizard / Modal)
│   │   ├── Step 1: Publication Identity (Name, Edition, Date, Language)
│   │   ├── Step 2: Format & Geometry (Broadsheet, Berliner, Tabloid, A3, A4)
│   │   └── Step 3: Template Preset (Classic Hindi, Modern, Local Gazette, Blank)
│   └── Drafts & Publications Manager
│       ├── Recent Drafts List (Thumbnails, Timestamps, Page Counts)
│       └── Draft Operations (Open, Duplicate, Rename, Delete)
│
├── 2. Publishing Studio (Editor Workspace)
│   ├── Top Application Bar
│   │   ├── Brand & Breadcrumb
│   │   ├── Publication Title (Click to rename)
│   │   ├── Page Navigation Dropdown & Page Switcher
│   │   ├── Autosave & Sync Status Indicator
│   │   ├── Canvas Viewport & Zoom Controls (Fit Width, 50%, 75%, 100%, 125%)
│   │   └── Studio Action Bar (Undo/Redo, Preview Toggle, Save, Export PDF)
│   │
│   ├── Left Activity Bar & Drawer (Collapsible)
│   │   ├── Tab: Pages Manager
│   │   │   ├── Page Thumbnails List
│   │   │   ├── Current Page Indicator
│   │   │   ├── Add Blank Page (+) / Add Template Page
│   │   │   └── Per-Page Actions (Duplicate, Move Up, Move Down, Delete)
│   │   ├── Tab: Block Library
│   │   │   ├── Lead Story Block
│   │   │   ├── Standard Story Block (1-Col, 2-Col, 3-Col)
│   │   │   ├── Photo Feature Block
│   │   │   ├── Editorial Column Block
│   │   │   ├── Regional Briefs Ticker
│   │   │   └── Section Divider & Classified Box
│   │   ├── Tab: Templates & Presets
│   │   │   ├── Classic Hindi Broadsheet
│   │   │   ├── Modern Hindi Daily
│   │   │   ├── Local Hindi Gazette
│   │   │   ├── International Broadsheet
│   │   │   └── Magazine Editorial
│   │   └── Tab: Project History & Drafts
│   │
│   ├── Center Canvas Workspace
│   │   ├── Physical Newspaper Sheet (Exact Aspect Ratio & Dimensions)
│   │   ├── Page 1: Traditional Masthead & Ears
│   │   ├── Page 2+: Authentic Inside Folio Rule
│   │   ├── Smart Multi-Column Grid
│   │   ├── Interactive Content Blocks (Click-to-Select, Focus Ring)
│   │   ├── Quick In-Canvas Reorder Controls (Move Up, Move Down, Span +/-)
│   │   └── Bottom Page Folio & Numbering
│   │
│   └── Right Contextual Inspector (Adaptive)
│       ├── Inspector Mode A: Page Settings (Default when no block selected)
│       │   ├── Page Size Preset (Broadsheet, Berliner, Tabloid, A3, A4)
│       │   ├── Orientation (Portrait, Landscape)
│       │   ├── Grid Columns (2, 3, 4, 5, 6 columns)
│       │   ├── Spacing Density (Compact, Normal, Spacious)
│       │   ├── Vertical Column Rules (Toggle On/Off)
│       │   └── Masthead Details (if Page 1)
│       ├── Inspector Mode B: Article / Story Settings (When article selected)
│       │   ├── Headline & Subheadline Inputs
│       │   ├── Byline & Dateline Inputs
│       │   ├── Column Span Slider (1 to Max Columns)
│       │   ├── Editorial Priority (Lead, Major, Minor, Brief)
│       │   ├── Body Textarea with Hindi typography assistance
│       │   └── In-Article Photo Controls (Upload, URL, Caption, Placement)
│       └── Inspector Mode C: Typography Settings
│           ├── Masthead Font (Rozha One, Yatra One, Cinzel, etc.)
│           ├── Headline Font & Optical Weight (300 to 900)
│           ├── Body Font & Point Size (8pt to 16pt)
│           └── Curated Font Pairings
│
└── 3. Output & Export Modal
    ├── Full Publication Multi-Page Preview Carousel
    ├── Page Verification & Diagnostics Checklist
    └── Print-Ready PDF Generation & Download Trigger
```

---

## 2. Screen Responsibilities & Boundaries

| Screen / Area       | Primary Responsibility                          | Information Displayed                                               | Actions Available                                                     |
| :------------------ | :---------------------------------------------- | :------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| **Top Bar**         | Session state, project metadata, global actions | Project name, page counter, save state                              | Rename project, switch pages, toggle view modes, trigger PDF export   |
| **Left Sidebar**    | Document structure & reusable components        | Page thumbnails, available block types, presets                     | Add page, reorder pages, drag/add block to page, switch layout preset |
| **Center Canvas**   | Real-time WYSIWYG newspaper preview             | Scaled authentic newspaper page with columns, lines, and typography | Click to inspect block, reorder blocks, direct visual review          |
| **Right Inspector** | Granular contextual parameter configuration     | Attributes of currently active selection                            | Edit text, adjust columns, change fonts, update photos                |
| **Mobile Drawer**   | Touch-friendly bottom sheet for phone viewports | Selected element controls or page switcher                          | Edit headline, change text, insert image, export PDF                  |

---

## 3. Separation of Concerns & State Boundaries

1. **Application UI Language vs. Publication Content Language**:
   - Application controls, tooltips, dialogs, and notifications are strictly in **English** by default.
   - The newspaper content model defaults to **Hindi (Devanagari)**, with full support for bilingual English or regional text without altering the app UI.
2. **Publication-Level State vs. Page-Level State**:
   - `Publication`: Contains metadata (Title, Created, Modified, Target Page Size, Default Orientation).
   - `Page`: Contains individual page layout rules (Column Count, Spacing Density, Page Number) and the ordered list of `Blocks`.
   - `Block`: Contains isolated editorial content (Headlines, Body, Photo, Span, Priority).
