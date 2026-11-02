# Publisher Phone Workflow: 10-Stage Mobile Publishing Experience

## Executive Summary

In developing regions, small-town newsrooms, and hyper-local media operations, publishers, editors, and stringers frequently produce daily newspapers or e-papers entirely from an Android smartphone or iPhone without access to a desktop computer.

Desktop-style publishing software fails on smartphones because it shrinks multi-panel interfaces into microscopic touch targets. E-Paper Studio overcomes this with a **dedicated mobile-first architecture** featuring an **always-visible canvas preview**, a **5-button authentic bottom navigation bar** (`पेज | + ब्लॉक | संपादक | प्रारूप | PDF`), and touch-optimized bottom sheets.

This document specifies the step-by-step, 10-stage smartphone publishing workflow engineered for single-handed operation, zero clutter, and rapid daily turnaround.

---

## 1. Ergonomic & Interaction Design Principles

```
┌────────────────────────────────────────────────────────┐
│ MOBILE VIEWPORT (390px × 844px)                       │
├────────────────────────────────────────────────────────┤
│ [Top Bar]: Zoom Level (65%) | Today's Date | Preflight │
├────────────────────────────────────────────────────────┤
│                                                        │
│               ALWAYS-VISIBLE LIVE CANVAS               │
│         (Pinch-to-zoom, Pan, Live vector text)         │
│                                                        │
├────────────────────────────────────────────────────────┤
│ [Bottom Sheet / Drawer]: Contextual Tools              │
│ - Height: Collapsed (48px) / Expanded (45% viewport)  │
│ - Large 44px+ touch targets, Steppers, Sliders         │
├────────────────────────────────────────────────────────┤
│ [5-Button Newspaper Bottom Navigation]:                │
│   पेज   |  + ब्लॉक  |   संपादक   |   प्रारूप   |   PDF   │
└────────────────────────────────────────────────────────┘
```

1. **Always-Visible Live Canvas:** Opening editing tools never hides or obscures the newspaper page. The canvas scales proportionally into the top half of the screen.
2. **Thumb-Zone Optimization:** All primary actions (steppers, sliders, submit buttons) are positioned in the bottom 45% of the screen.
3. **No Unintentional Overwrites:** Haptic feedback and explicit confirm sheets prevent accidental deletions.

---

## 2. The 10-Stage Mobile Publishing Workflow

### Stage 1: Studio Launch & Daily Edition Initialization

- **Action:** The editor taps the E-Paper Studio PWA or web bookmark on their mobile phone.
- **Experience:**
  - The studio automatically recognizes today's date ("शुक्रवार, 2 नवंबर 2026").
  - Displays a clean prompt: **"आज का अंक प्रारंभ करें? (Start Today's Issue?)"** with the newspaper's default Master Template pre-selected.
  - Tapping **"जारी रखें (Continue)"** instantly loads Page 1 with the locked masthead, today's incremented issue number (`#1425`), and preserved advertisement spots.

### Stage 2: Masthead Quick-Tune (Date, Weather, AQI, Price)

- **Action:** Tap the **"संपादक (Editor)"** icon on the bottom toolbar $\to$ select the **"सिरमौर (Masthead)"** tab.
- **Experience:**
  - A compact bottom sheet slides up with large, thumb-friendly steppers:
    - Temperature: `[ − ] 28°C [ + ]`
    - Weather Condition: Dropdown (`धूप / खुला आसमान`, `हल्की वर्षा`, `कोहरा`)
    - Air Quality Index (AQI): `[ − ] 145 [ + ]` (Color-coded yellow/moderate)
    - Edition: `लखनऊ (Lucknow)`
  - Changes immediately update the live vector masthead at the top of the canvas.
  - Swipe down to dismiss sheet.

### Stage 3: News Intake & WhatsApp Staging

- **Action:** Tap the **"+ ब्लॉक (+ Block)"** button $\to$ tap **"समाचार इनबॉक्स (News Inbox)"**.
- **Experience:**
  - The editor pastes raw dispatch text received on WhatsApp into the **"त्वरित समाचार पेस्ट (Quick Paste)"** box.
  - The heuristic parser automatically splits the text into:
    - Headline: _"राजधानी में मूसलाधार बारिश से जनजीवन प्रभावित"_
    - Category: _नगर / Local_
    - Word Count: _164 शब्द_
  - The editor selects priority: `[मुख्य लीड] [प्रमुख] [सामान्य] [संक्षेप]`.
  - Taps **"लाइब्रेरी में जोड़ें (Save to Library)"**; repeat for 4–8 remaining news stories.

### Stage 4: Smart Auto-Arrange (स्वतः संयोजन)

- **Action:** Tap **"प्रारूप (Format)"** on the bottom toolbar $\to$ tap **"स्मार्ट कंपोज़ (Smart Compose)"**.
- **Experience:**
  - The layout engine calculates optimal column placements based on priorities and word budgets.
  - In $<1$ second, the canvas organizes the stories into a balanced broadsheet:
    - Lead story receives 5 columns with hero headline.
    - Two secondary stories anchor the right columns.
    - A 1-column sidebar digest packs brief updates.
  - Haptic feedback confirms layout completion.

### Stage 5: Live Canvas Inspection (Touch Navigation)

- **Action:** Direct gestures on the newspaper canvas.
- **Experience:**
  - **Pinch-to-Zoom:** Smoothly zoom from 30% full-page overview to 150% micro-text inspection.
  - **Pan:** Two-finger drag or single-finger pan when zoomed in.
  - **Page Flipping:** Swipe left/right on the bottom page indicator to navigate across Page 1, Page 2, Page 3, and Page 4.

### Stage 6: Headline & Text Editing with Typography Steppers

- **Action:** Tap directly on any headline or body paragraph on the canvas.
- **Experience:**
  - The selected block highlights with a soft cyan focus ring.
  - The bottom sheet automatically switches to the **"संपादक (Editor)"** tab with the selected element active.
  - **Typography Controls:**
    - Font Family: Quick pill switcher (`Noto Sans` / `Noto Serif` / `Yatra One`).
    - Font Size: Large stepper `[ − ] 18 pt [ + ]` and slider. Tapping `+` immediately expands the headline in the live canvas.
    - Alignment: `[ Left ] [ Center ] [ Justify ]`.
    - Line Height: Stepper `[ − ] 1.4 [ + ]`.

### Stage 7: Photo Capture & Image Adjustment

- **Action:** Tap on the article's image slot $\to$ tap **"फोटो बदलें (Replace Photo)"**.
- **Experience:**
  - Tapping opens the native mobile camera or photo gallery.
  - The editor selects a photo shot at the press conference or scene.
  - The app automatically downscales the image to optimal print resolution ($300\text{ DPI}$, WebP) locally on the device—no data-heavy upload.
  - Touch slider allows adjusting zoom and cropping center point within the column container.

### Stage 8: Resolving Page Overflow Warnings

- **Action:** If an article contains excess text, a small red pill appears on the bottom bar: **"⚠️ 1 ओवरफ्लो (1 Overflow)"**.
- **Experience:**
  - Tapping the warning auto-scrolls the canvas to the overflowing article.
  - The editor taps **"स्वचालित फिट (Auto-Fit Copy)"**:
    - The engine subtly compresses line height by $0.05$ and body font size by $0.5\text{ pt}$.
  - If still overflown, the editor selects **"शेष अगले पेज पर भेजें (Send Remainder to Next Page)"**; a jump line (`शेष पृष्ठ 2 पर`) is inserted automatically.
  - The overflow indicator turns green: **"सभी पेज फिट हैं (All Pages Fit)"**.

### Stage 9: One-Touch Preflight Quality Check

- **Action:** Tap the **"PDF"** button on the bottom bar.
- **Experience:**
  - Instead of blind downloading, a preflight validation sheet slides up:
    - ✅ **फॉन्ट (Fonts):** Devanagari Unicode glyphs verified ($100\%$).
    - ✅ **पेज सीमा (Page Limits):** 0 text elements clipped.
    - ✅ **इमेज रिज़ॉल्यूशन (Images):** 3 photos verified for print sharpness.
    - ✅ **दिनांक व अंक (Metadata):** Today's date and Issue #1425 confirmed.
  - Status: **"प्रकाशन के लिए तैयार (Ready for Publishing)"** with green checkmark.

### Stage 10: Client-Side High-Resolution PDF Download & Share

- **Action:** Tap **"PDF डाउनलोड करें (Download High-Res PDF)"**.
- **Experience:**
  - The browser's native client-side PDF engine generates the complete vector PDF directly in mobile memory (zero server roundtrip, zero cloud fees).
  - Progress bar indicates rendering: `पेज 1/4... पेज 2/4... पूर्ण!`.
  - Native mobile share sheet opens automatically:
    - Tap to send directly to local printing press operator via WhatsApp.
    - Tap to upload to e-paper digital subscriber group / website.
    - Saved to phone's "Downloads" folder.

---

## 3. Mobile Performance Safeguards

- **Memory Management on Mobile Browsers (WebKit / Chrome Mobile):** High-resolution A3 rendering at 300 DPI can consume 80MB+ of RAM. On phones, the canvas preview utilizes crisp SVG and CSS vectors, deferring raster canvas buffers strictly to the export phase, preventing browser tab crashes.
- **Offline Resilience:** If the publisher enters a rural zone with spotty cell connectivity, the entire 10-stage workflow functions 100% offline via service workers and client-side storage.
