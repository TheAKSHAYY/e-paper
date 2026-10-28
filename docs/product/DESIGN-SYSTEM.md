# E-PAPER STUDIO — DESIGN SYSTEM SPECIFICATION

## 1. Design Philosophy & Aesthetic Principles

E-Paper Studio unites two complementary visual disciplines:

1. **The Modern Publishing SaaS Chrome**: Clean, neutral, high-density, English-first software interface built for focused creative work.
2. **The Authentic Indian Newspaper Canvas**: Warm newsprint texture, deep typographic ink contrast, traditional multi-column rules, ornate Devanagari mastheads, and editorial hierarchy.

---

## 2. Color Palette & Design Tokens

### 2.1 Studio Chrome Palette (Neutral SaaS)

- **Background App Surface**: `#0f172a` (Deep Slate / Dark Navy for studio frame) or `#f8fafc` (Clean Light Studio Mode)
- **Panel Surface**: `#ffffff` (Card & Inspector background)
- **Border Neutral**: `#e2e8f0` (Subtle 1px divider rules)
- **Text Primary (Chrome)**: `#0f172a` (Slate 900 for high-contrast readability)
- **Text Secondary (Chrome)**: `#64748b` (Slate 500 for descriptions & metadata)
- **Brand / Accent**: `#b91c1c` (Editorial Crimson / Post Office Red — evokes traditional Indian masthead accents)
- **Accent Hover**: `#991b1b`
- **Focus Ring**: `rgba(185, 28, 28, 0.4)` (2px outline with 2px offset)
- **Success Badge**: `#15803d` (Green 700) / Background: `#dcfce7`
- **Warning Badge**: `#b45309` (Amber 700) / Background: `#fef3c7`

### 2.2 Newspaper Canvas Palette (Physical Paper & Ink)

- **Newsprint Background**: `#faf8f4` (Slightly warm, natural wood-pulp paper tone)
- **Ink Primary**: `#111111` (Deep archival carbon black)
- **Ink Secondary**: `#2d2d2d` (Body text for comfortable optical density)
- **Ink Muted / Byline**: `#555555` (Sub-decks and datelines)
- **Column Dividing Rules**: `#d5d0c4` (Delicate 1px vertical column rules)
- **Masthead Border Rules**: `#111111` (Bold 2px solid and 3px double rules)
- **Editorial Red Strip**: `#b22222` (Used sparingly for breaking news banners or ticker bars)

---

## 3. Typography Architecture

### 3.1 Studio Interface Typography

- **Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`
- **Hierarchy**:
  - Top Bar Title: 14px, Semi-bold (600)
  - Section Headers: 12px, Bold (700), Upper-case, tracking +0.05em
  - Input Labels: 12px, Medium (500), Slate 700
  - Body / Help Text: 12px, Regular (400), Slate 500
  - Button Text: 13px, Medium (500)

### 3.2 Newspaper Canvas Typography (Devanagari & Latin)

| Typographic Role         | Primary Font Family     | Fallback Stack                 | Recommended Weights   | Optical Notes                                                      |
| :----------------------- | :---------------------- | :----------------------------- | :-------------------- | :----------------------------------------------------------------- |
| **Masthead (Hindi)**     | `Rozha One`             | `Yatra One`, serif             | 400 (Display Regular) | High-contrast classical serif nameplate with ornate terminal loops |
| **Masthead (Latin)**     | `Cinzel`                | `Playfair Display`, serif      | 700, 800              | Roman lapidary majuscules                                          |
| **Main Headlines**       | `Noto Serif Devanagari` | `Playfair Display`, serif      | 700, 900 (Black)      | Maximum punch, zero conjunct clipping                              |
| **Modern Headlines**     | `Mukta`                 | `Poppins`, sans-serif          | 700, 800              | High-legibility contemporary display                               |
| **Subheadlines / Decks** | `Mukta` / `Noto Serif`  | `Hind`, sans-serif             | 500, 600              | Medium density to bridge headline and body                         |
| **Body Journalism**      | `Noto Serif Devanagari` | `Tiro Devanagari Hindi`, serif | 400, 500              | Open counters, clear vowel marks, 10pt–10.5pt                      |
| **Modern Body**          | `Hind`                  | `Mukta`, sans-serif            | 400, 500              | Clean multi-column readability                                     |
| **Bylines & Datelines**  | `Hind`                  | `Inter`, sans-serif            | 600, uppercase        | Compact uppercase tracking                                         |

---

## 4. Layout Rules & Spatial System

### 4.1 Newspaper Column Grid

- **Columns**: 2, 3, 4, 5, or 6 columns per page.
- **Column Gutter**:
  - Compact: `14px`
  - Normal: `20px`
  - Spacious: `28px`
- **Column Rules**: `1px solid #d5d0c4` placed centered between columns.
- **Margins**:
  - Broadsheet: `34px` padding
  - Berliner: `28px` padding
  - Tabloid / A4: `24px` padding

### 4.2 Spacing Scale (8pt Grid)

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px

---

## 5. Component Patterns & Interactive Elements

### 5.1 Buttons

- **Primary Action (Export PDF, Create)**: Crimson background (`#b91c1c`), White text, 6px border radius, subtle hover lift.
- **Secondary Action (Save, Preview)**: Neutral border (`1px solid #cbd5e1`), Slate 800 text, background `#ffffff` with hover `#f1f5f9`.
- **Icon / Utility Button**: 32×32px, transparent background, hover `#e2e8f0`, accessible `title` and `aria-label`.

### 5.2 Contextual Inspector Cards

- Grouped into distinct collapsibles:
  - **Header**: 12px uppercase label with subtle bottom border.
  - **Inputs**: Full width, 34px height, 1px border `#cbd5e1`, 6px border-radius, font size 13px.
  - **Sliders**: Styled track with current integer value display badge (e.g. `2 cols`).

### 5.3 Newspaper Block Focus State

- When clicked on canvas, an active article block receives a 2px Crimson outline (`#b91c1c`) with 4px offset and subtle background tint (`rgba(185, 28, 28, 0.02)`), clearly signaling that the right-side inspector is actively controlling it.
