# Masthead Editability Audit: Modular Newspaper Header Architecture

## Executive Summary

The masthead (सिरमौर / मुख्य शीर्षक पट्टी) is the signature branding element of any authentic daily newspaper. This document delivers an exhaustive component-by-component audit of the existing masthead implementation in E-Paper Studio, contrasting it against the demands of traditional Hindi and English broadsheets (such as Dainik Jagran, Amar Ujala, Dainik Bhaskar, Hindustan, and The Hindu).

A key design requirement is that **the masthead must never be flattened into a static raster image**. It must remain a fully editable, scalable, high-resolution vector system rendered via semantic HTML5, SVG rules/emblems, and clean CSS typography, fully preserving searchability and print-fidelity during client-side PDF export.

---

## 1. Masthead Structural Inventory

An authentic broadsheet masthead consists of three primary horizontal zones:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: TOP STRIP (ऊपरी पट्टी / Header Ear Notices)                   │
│ Weather & Temp | AQI Status | [Emblem] | Postal Reg. No. | Page No.    │
├────────────────────────────────────────────────────────────────────────┤
│ ZONE 2: PRIMARY MASTHEAD BLOCK (मुख्य शीर्षक ब्लॉक)                     │
│ [Left Ear Ad/Notice] | MAIN NEWSPAPER TITLE | [Right Ear Notice/Logo] │
│                      | Subtitle / Tagline   |                          │
│                      | Estd. Year           |                          │
├────────────────────────────────────────────────────────────────────────┤
│ ZONE 3: DATELINE & METADATA BAR (दिनांक एवं विवरण पट्टी)              │
│ City & Edition | Day, Date | Vol. & Issue | Price (₹) | Total Pages    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Element-by-Element Audit & Editability Matrix

The table below audits the 12 core masthead elements defined in `@epaper-studio/document-schema` (`MastheadConfigSchema`) against the 7 standard DTP manipulation operations:

| #      | Masthead Element                    | Schema Property                               | Text Edit |     Move / Reorder      |    Resize / Scale     |            Hide / Toggle             |       Delete        | Duplicate |     Custom Style (Font/Color)     | Current Implementation Status                |
| :----- | :---------------------------------- | :-------------------------------------------- | :-------: | :---------------------: | :-------------------: | :----------------------------------: | :-----------------: | :-------: | :-------------------------------: | :------------------------------------------- |
| **1**  | **Newspaper Title**                 | `masthead.title`                              |  ✅ Yes   |     ⚠️ Center only      | ✅ Yes (`fontSizePt`) |             ❌ Mandatory             |        ❌ No        |   ❌ No   |      ✅ Font, Size, Tracking      | **Fully Working** (Desktop & Mobile)         |
| **2**  | **Newspaper Logo / Emblem**         | `masthead.emblemUrl` / `logoUrl`              |    N/A    |      ⚠️ Fixed slot      | ⚠️ Max-height clamped |           ✅ `showEmblem`            |    ✅ Reset URL     |   ❌ No   |    ⚠️ Grayscale / Invert only     | **Working** (Desktop gallery & upload)       |
| **3**  | **Tagline (ध्येय वाक्य)**           | `masthead.tagline`                            |  ✅ Yes   |  ❌ Fixed under title   |   ❌ Fixed CSS size   |       ✅ Implicit (clear text)       |       ✅ Yes        |   ❌ No   |         ⚠️ Theme default          | **Partially Working** (No font size control) |
| **4**  | **Establishment Year (स्थापना)**    | `masthead.establishmentYear`                  |  ✅ Yes   |  ❌ Fixed under title   |   ❌ Fixed CSS size   |      ✅ `showEstablishmentYear`      |       ✅ Yes        |   ❌ No   |         ⚠️ Theme default          | **Partially Working** (Fixed position)       |
| **5**  | **Weather Information**             | `weatherCity`, `temperature`, `weatherNotice` |  ✅ Yes   |    ❌ Fixed top-left    |   ❌ Fixed CSS size   |           ✅ `showWeather`           |       ✅ Yes        |   ❌ No   |           ⚠️ Inherited            | **Working on Desktop, Hidden on Mobile**     |
| **6**  | **Air Quality Index (AQI)**         | `masthead.airQuality`                         |  ✅ Yes   |    ❌ Fixed top-left    |   ❌ Fixed CSS size   |         ✅ `showAirQuality`          |       ✅ Yes        |   ❌ No   |           ⚠️ Inherited            | **Working on Desktop, Hidden on Mobile**     |
| **7**  | **Price (मूल्य)**                   | `masthead.price`                              |  ✅ Yes   | ❌ Fixed dateline right |   ❌ Fixed CSS size   |            ✅ `showPrice`            |       ✅ Yes        |   ❌ No   |           ⚠️ Inherited            | **Working**                                  |
| **8**  | **Registration Number (RNI / डाक)** | `masthead.postalRegNumber`                    |  ✅ Yes   |   ❌ Fixed top-right    |   ❌ Fixed CSS size   |          ✅ `showPostalReg`          |       ✅ Yes        |   ❌ No   |           ⚠️ Inherited            | **Working**                                  |
| **9**  | **Edition Date (दिनांक)**           | `masthead.date`                               |  ✅ Yes   | ❌ Fixed dateline left  |   ❌ Fixed CSS size   |            ✅ `showDate`             |       ✅ Yes        |   ❌ No   |           ⚠️ Inherited            | **Working** (Auto-date or manual edit)       |
| **10** | **Edition Details (नगर / संस्करण)** | `masthead.edition`, `issueNumber`             |  ✅ Yes   |    ❌ Fixed dateline    |   ❌ Fixed CSS size   | ✅ `showEdition`, `showIssueNumber`  |       ✅ Yes        |   ❌ No   |           ⚠️ Inherited            | **Working**                                  |
| **11** | **Page Number (पृष्ठ संख्या)**      | Handled by Canvas Page Renderer               |  ⚠️ Auto  | ❌ Fixed footer/header  |   ❌ Fixed CSS size   |            ⚠️ Page toggle            |        ❌ No        |   ❌ No   |           ⚠️ Inherited            | **Working** (Auto-computed per page)         |
| **12** | **Separator Rules (सीमा रेखाएं)**   | `masthead.ruleStyle`                          |    N/A    |   ❌ Fixed top/bottom   |   ⚠️ Preset styles    | ✅ `showTopStrip`, `showBottomStrip` | ✅ Via style `none` |   ❌ No   | ✅ Single, Double, Oxford, Ornate | **Fully Working** (Preset-driven)            |

---

## 3. Analysis of Current Capabilities

### 3.1 What is Already Robust

1. **Vector Rendering Integrity:**
   - The masthead is rendered via native HTML `<div>`, `<span>`, and SVG components inside `NewspaperCanvas.tsx`.
   - In both vector PDF export (via Playwright or jsPDF vector routines) and high-resolution canvas export, the masthead retains 100% vector sharpness with crisp letterforms regardless of zoom level.
2. **Comprehensive Schema Coverage:**
   - `packages/document-schema/src/index.ts` lines 408–465 define over 30 properties on `MastheadConfigSchema`, covering virtually all metadata required for a legal Indian broadsheet (RNI registration, volume, issue, edition, price, weather, AQI).
3. **Thematic Presets:**
   - The 6 core presets (`dainik-classic`, `sandhya-express`, `punarvas-broadsheet`, etc.) configure authentic typographical styling, border weights, and rule styles without manual user configuration.
4. **Desktop Masthead Gallery & Inspector:**
   - `MastheadGalleryModal.tsx` and `MastheadInspectorPanel.tsx` allow desktop users to switch between layout variants (Traditional Broadsheet, Modern Center, Asymmetric Left Title with Right Ear Ad, Tabloid Minimal).

---

## 4. Architectural Gaps & Publisher Friction Points

Despite strong foundational support, the current masthead architecture presents several friction points for non-technical newspaper publishers:

### Gap 1: Inflexible Spatial Layout ("Hardcoded Ear Slots")

- **Problem:** In real newspapers, weather and AQI notices are not always in the top strip. Some newspapers place them on the left ear flanking the title, others inside the dateline, and some replace them entirely with commercial ear ads (विज्ञापन इयर / कॉर्नर विज्ञापन).
- **Current Limitation:** The positions of `weather`, `airQuality`, `price`, and `postalRegNumber` are statically coded into specific flexbox containers inside `NewspaperCanvas.tsx`. A user cannot drag or swap the weather box from top-left to top-right or into the main title ear.
- **Solution Architecture:** Introduce modular "Ear Blocks" (`leftEarBlock`, `rightEarBlock`, `datelineLeftBlock`, `datelineRightBlock`) that can accept any metadata widget or advertisement snippet.

### Gap 2: Mobile Inspector Field Truncation

- **Problem:** In `MobileBottomNav.tsx` and the mobile Editor drawer, only `masthead.title`, `masthead.date`, and `masthead.edition` are exposed for quick editing. A publisher running a morning edition on an Android phone cannot edit the morning temperature, AQI, or RNI registration number without switching to a laptop.
- **Solution Architecture:** Expand the mobile Editor drawer's Masthead tab with expandable accordions: "मौसम एवं वायु गुणवत्ता (Weather & AQI)", "मूल्य एवं पंजीयन (Price & Reg)", and "दिनांक एवं अंक (Date & Issue)".

### Gap 3: Independent Typography for Secondary Masthead Elements

- **Problem:** While `masthead.fontSizePt` allows scaling the main title from 32 pt to 120 pt, secondary elements (Tagline, Dateline, Weather, Registration) use hardcoded `text-xs` or `text-sm` Tailwind utility classes.
- **Impact:** In Tabloid or compact formats, these elements may look disproportionately large or small relative to the newspaper title.
- **Solution Architecture:** Add granular font size modifiers (`taglineSizePt`, `datelineSizePt`, `earNoticeSizePt`) or a global Masthead Scaling Ratio to the schema.

### Gap 4: Commercial "Ear Panel" (इयर विज्ञापन) Support

- **Problem:** Local newspapers fund their daily print run through Left Ear and Right Ear corner advertisements ($4\text{ cm} \times 5\text{ cm}$ sponsored boxes flanking the main title). Currently, the system only supports an SVG emblem or logo URL, not a structured advertisement block with client logo, contact phone, and promotional copy.
- **Solution Architecture:** Add `leftEarAd` and `rightEarAd` properties to `MastheadConfigSchema`, supporting image upload, advertiser headline, and contact details.

---

## 5. Recommended Schema & UI Enhancements (Non-Breaking)

To achieve complete publisher flexibility without breaking existing presets, the following non-breaking enhancements are recommended for future implementation:

```typescript
// Proposed non-breaking extension to MastheadConfigSchema
export const EarContentSchema = z.object({
  type: z.enum([
    'weather-aqi',
    'advertisement',
    'emblem-logo',
    'postal-rni',
    'custom-text',
    'empty',
  ]),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  advertiserName: z.string().optional(),
  advertiserContact: z.string().optional(),
  fontSizePt: z.number().min(6).max(18).optional(),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
});

// Added to MastheadConfigSchema:
// leftEar: EarContentSchema.optional(),
// rightEar: EarContentSchema.optional(),
// datelineFontSizePt: z.number().min(7).max(14).optional(),
```

### UI Interaction Upgrades:

1. **Direct Canvas Click-to-Edit:** Clicking on the weather box directly in `NewspaperCanvas` should highlight the weather editor in the inspector, eliminating manual navigation.
2. **Mobile Quick-Edit Sheet:** A clean, bottom-sheet editor on mobile with dedicated stepper buttons for temperature, AQI, and price.
3. **SVG Rule Customizer:** Dropdown selection for standard newspaper ornamental rules (e.g. Traditional Indian Thick-Thin, Lotus Motif Rule, Double Hairline).

---

## 6. Verification & Safety Safeguards

- **Print Geometry Assertion:** The total height of the masthead must be bounded ($80\text{ mm}$ max on A3, $55\text{ mm}$ on A4) to prevent pushing the lead story off the physical page boundary.
- **Devanagari Font Assertion:** Masthead title rendering must verify font loading before triggering PDF export, ensuring zero glyph substitution or clipping.
