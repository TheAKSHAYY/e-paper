# Content Overflow & Page Boundary Audit: The Copyfitting Engine

## Executive Summary

In physical print newspapers and professional e-papers, **a page is an unyielding, fixed physical container**. Unlike web pages that can expand infinitely downward, an A3 or A4 broadsheet cannot scroll. If an article contains 600 words but its allotted column grid only holds 450 words, one of three catastrophic publication errors occurs:

1. **Silent Clipping:** The final two paragraphs are cut off abruptly mid-sentence (the worst failure mode).
2. **Page Spillage:** The grid pushes content off the bottom margin, breaking page geometry and causing blank/corrupted pages in PDF output.
3. **Column Overlap:** Elements collide, causing text overlapping and unreadable blocks.

This document conducts an in-depth audit of E-Paper Studio’s current overflow budgeting mechanics, evaluates whether current systems prevent text clipping, and specifies a professional **Zero-Loss Copyfitting and Story Continuation Architecture**.

---

## 1. Audit of Current Overflow Detection Mechanisms

### 1.1 The Existing "Page Boundary Warning"

Inside `apps/web/src/components/canvas/NewspaperCanvas.tsx` (lines 139–154 and 986–1015), the application implements an algorithmic word-budget check:

```typescript
// Existing implementation logic in NewspaperCanvas.tsx:
const pageCapacityWords: Record<PageFormat, number> = {
  a3: 1800,
  a4: 850,
  tabloid: 1200,
  broadsheet: 2400,
};

const totalWords = page.articles.reduce(
  (acc, a) => acc + (a.title.split(/\s+/).length + a.content.split(/\s+/).length),
  0
);
const wordBudget = pageCapacityWords[pageFormat] || 1200;
const isOverflown = totalWords > wordBudget || page.articles.length > 7;
```

When `isOverflown` is true, the canvas renders an alert banner:

> **"Page Boundary Warning / पृष्ठ सीमा चेतावनी"**
> "Content exceeds estimated physical capacity (Words: X / Budget: Y). In print/PDF output, overflowing content will be clipped."

### 1.2 Limitations of the Current Approach

While this warning alerts the user, it suffers from four fundamental engineering limitations:

1. **Coarse Heuristic vs. Actual Geometric Measurement:** Word count is an indirect proxy for height. A 500-word story with a 64 pt headline, pull quote, and large photo occupies twice the vertical space of 500 words of 10 pt body text in a 3-column block.
2. **Silent CSS Truncation:** Within individual articles, CSS rules such as `overflow: hidden` and `-webkit-line-clamp` prevent visual bleeding during canvas layout, but effectively mask clipped body copy.
3. **No Automatic Resolution:** When the warning appears, the burden is 100% on the user to manually edit and delete sentences or decrease font sizes until the banner disappears.
4. **No Story Continuation Engine:** The system lacks "Continued on Page X / शेष पृष्ठ X पर देखें" capability to split a long lead story across multiple pages.

---

## 2. Evaluation Against Strict Publishing Criteria

| Publisher Requirement           |  Current Status   | Analysis & Risk Assessment                                                                              |
| :------------------------------ | :---------------: | :------------------------------------------------------------------------------------------------------ |
| **Complete Text Visibility**    |    ⚠️ Partial     | Short articles fit completely. Long articles are visually truncated or hidden by overflow boundaries.   |
| **Correct Page Boundaries**     |    ✅ Enforced    | Canvas uses fixed pixel/mm aspect ratio containers matching physical target devices (A3/A4/Tabloid).    |
| **No Clipped Paragraphs**       | ❌ Not Guaranteed | If body text exceeds column height, the remainder is hidden without an ellipsis or page jump.           |
| **No Text Outside Columns**     |    ✅ Enforced    | Multi-column grid rules and CSS overflow properties confine text strictly within column boundaries.     |
| **Zero Content Lost in PDF**    |      ❌ Risk      | PDF export accurately captures DOM state; if DOM state clipped the text, the PDF prints truncated text. |
| **Interactive Visual Warning**  |  ✅ Implemented   | Global page banner exists; element-level red warning outlines are partially implemented.                |
| **Non-Destructive Copyfitting** |    ⚠️ Limited     | Auto-fit adjusts column spans, but lacks micro-typographic font scaling or tracking adjustment.         |

---

## 3. The 4-Layer Zero-Loss Copyfitting Architecture

To guarantee that no news content is ever clipped or lost, E-Paper Studio must implement a comprehensive 4-layer copyfitting architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: PRECISE DOM GEOMETRIC MEASUREMENT                             │
│ Real-time scrollHeight vs. clientHeight per article container          │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: MICRO-TYPOGRAPHIC AUTO-COPYFITTING (स्वचालित आकार समायोजन)     │
│ Optical tracking (±0.5 pt font-size, ±0.1 line-height, letter-spacing) │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: STORY CONTINUATION / JUMP LINES (शेष पृष्ठ X पर)              │
│ Automatic thread splitting: Lead story Page 1 → Jump node Page 4      │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 4: INTERACTIVE NON-DESTRUCTIVE TRUNCATION ASSISTANT              │
│ Visual highlight of overset copy with one-click "Send to Inbox"        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Specifications for Copyfitting Engine

### 4.1 Level 1: Precise Element-Level Overset Detection

Instead of estimating words, the layout engine measures the exact physical render bounds:

```typescript
export interface ElementOverflowReport {
  articleId: string;
  isOverflown: boolean;
  scrollHeight: number;
  clientHeight: number;
  overflowPx: number;
  estimatedOversetCharacters: number;
  oversetPercentage: number;
}
```

- **Behavior:** When `scrollHeight > clientHeight + 4px`, the article card displays a subtle crimson overset badge (`+142 शब्द अधिक / +142 words overset`) at the bottom right corner of the block.

### 4.2 Level 2: Micro-Typographic Auto-Adjustment

Traditional newsrooms use "tracking and squeezing" before cutting editorial copy. The layout engine can attempt a non-destructive fit within strict bounds:

- **Font Size Tuning:** Adjust body font size downward by at most $0.5\text{ pt}$ (e.g. from $11\text{ pt}$ to $10.5\text{ pt}$).
- **Line Height Tuning:** Adjust line height from $1.4$ to $1.32$.
- **Letter Spacing:** Adjust tracking from $0\text{ em}$ to $-0.015\text{ em}$.
- **Result:** In 70% of news stories, a 30–50 word overset fits cleanly onto the grid without the reader noticing any typographic distortion.

### 4.3 Level 3: Story Continuation ("Jump Lines" / शेष पृष्ठ...)

For major lead stories (500–1200 words) that cannot fit on Page 1:

1. **Primary Article Node (Page 1):**
   - Headline, Subheading, Byline, Hero Image, and first 300 words.
   - Concludes with an automated vector rule and jump tag:
     > **`शेष पृष्ठ 4 पर देखें / Continued on Page 4`**
2. **Linked Continuation Node (Page 4):**
   - Carries a matching headline banner:
     > **`पृष्ठ 1 का शेष: [मुख्य शीर्षक] / From Page 1: [Headline]`**
   - Continues the remaining paragraphs seamlessly.
3. **Data Schema Model:**
   - `continuationTargetPageId?: string`
   - `continuationSourceArticleId?: string`
   - Content is stored once in the story object; the renderer slices paragraphs at the overflow point and distributes them across the linked nodes.

### 4.4 Level 4: Interactive Overset Assistant (Non-Destructive Truncation)

When copy cannot be fitted even after Level 2 and the user does not want a jump line:

- The editor opens a side-by-side **Copyfit Drawer**.
- The visible text is highlighted in green; overset text is highlighted in amber/red.
- The user is presented with 3 non-destructive options:
  1. _Smart Summary:_ Generate or accept a concise 2-sentence edit.
  2. _Spill to Inbox:_ Send the remaining paragraphs back to the News Library as an independent "News Brief" (समाचार संक्षेप).
  3. _Expand Column Span:_ Increase article width from 2 columns to 3 columns, automatically reflowing surrounding blocks.

---

## 5. Devanagari Script Specifics for Overflow Management

Devanagari text presents distinct optical dynamics compared to Latin scripts:

- **Matras and Ascenders/Descenders:** Hindi vowels (जैसे कि ि, ी, ु, ू, ृ, ै, ौ) require adequate vertical leading. If line height is compressed below $1.3$, matras collide with lower conjuncts (संयुक्त अक्षर), creating visual artifacts.
- **Hyphenation & Word Breaks:** Devanagari words must never be broken mid-syllable across columns. The copyfitting engine must adhere to Unicode script boundary rules to prevent splitting complex conjuncts (e.g., `सम्पादन` must not break as `सम्प-ादन`).
- **Font Metrics Parity:** Font metrics for Noto Sans Devanagari and Yatra One must be measured with identical canvas line-box standards across both web preview and PDF generation to guarantee $0\text{ px}$ layout shift.

---

## 6. Implementation Priorities & Verification Safeguards

1. **Non-Destructive Guarantee:** Never delete or mutate the original text in the article data model during copyfitting; apply adjustments strictly as display and pagination transformations.
2. **Preflight Blocker:** Any unaddressed overset must be flagged in the Preflight Report prior to final PDF export with an actionable "Fix" button.
