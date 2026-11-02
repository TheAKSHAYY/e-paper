# News Import & News Library Architecture: Staging Engine for Daily Newsrooms

## Executive Summary

In existing consumer layout tools, text must be typed directly into canvas boxes or manually pasted card by card. For a newspaper publisher processing 20 to 50 articles daily from wire services (PTI, UNI, Bhasha), local stringers, email press releases, and WhatsApp dispatches, direct canvas entry causes severe workflow bottlenecks.

This document specifies the architecture for a dedicated **News Import & News Library (समाचार इनबॉक्स एवं लाइब्रेरी)**. The News Library operates as an asynchronous staging area where raw text, images, and metadata are ingested, normalized, parsed, categorized, and prioritized _before_ being assigned to newspaper pages.

---

## 1. Newsroom Ingestion Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│ INTAKE SOURCES (समाचार स्रोत)                                          │
│ • Direct Text Paste (WhatsApp / Telegram / Email)                      │
│ • Bulk File Upload (.docx, .txt, .md, .pdf press releases)             │
│ • Mobile Voice-to-Text / Quick Intake Form                             │
│ • Wire Service RSS / JSON feeds (PTI, Bhasha, UNI)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Ingest & Cleanse
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ NORMALIZATION & PARSING ENGINE                                         │
│ • Unicode Devanagari Normalization (NFC, KrutiDev/Chanakya legacy fix) │
│ • Intelligent Parser: Extracts Headline, Deck, Byline, Body, Location │
│ • Word Counter & Grid Capacity Estimator                               │
│ • High-DPI Image Compression & WebP Optimization                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Stored in Staging State
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PERSISTENT NEWS LIBRARY (समाचार लाइब्रेरी एवं इनबॉक्स)                   │
│ [Unassigned Inbox] [Page 1 Staged] [Sports Staged] [Tomorrow Hold]    │
│ Drag onto Canvas  ◄──────►  One-Click Placement ("Smart Layout")       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Data Schema: `StagedNewsItem`

To ensure full compatibility with the existing `@epaper-studio/document-schema`, the staging entity is designed with full metadata fidelity:

```typescript
import { z } from 'zod';

export const NewsCategorySchema = z.enum([
  'top-story', // मुख्य समाचार (राष्ट्रीय / प्रादेशिक)
  'politics', // राजनीति एवं शासन
  'crime-accident', // अपराध एवं दुर्घटना
  'local-city', // नगर / कस्बा हलचल
  'business-market', // व्यापार एवं मंडी भाव
  'sports', // खेल जगत
  'editorial', // संपादकीय एवं विचार
  'entertainment', // मनोरंजन एवं कला
  'international', // विदेश
  'briefs', // समाचार संक्षेप (1-paragraph snippets)
]);

export const NewsPrioritySchema = z.enum([
  'lead', // मुख्य लीड समाचार (Spans 4-8 cols, hero headline, primary photo)
  'major', // प्रमुख समाचार (Spans 2-4 cols, secondary photo)
  'standard', // सामान्य समाचार (Spans 2-3 cols, text with or without small thumbnail)
  'brief', // एकल कॉलम / संक्षेप (Single column, 40-80 words, no photo)
]);

export const StagedNewsItemSchema = z.object({
  id: z.string().uuid(),
  headline: z.string().min(1),
  kicker: z.string().optional(), // ऊपरी पंक्ति (e.g. "बड़ी खबर:", "विशेष रिपोर्ट:")
  subdeck: z.string().optional(), // उप-शीर्षक (Deck / Summary bullet)
  location: z.string().optional(), // स्थान (e.g. "नई दिल्ली", "लखनऊ (विशेष संवाददाता)")
  byline: z.string().optional(), // लेखक / रिपोर्टर (e.g. "अमित शर्मा द्वारा")
  category: NewsCategorySchema.default('local-city'),
  priority: NewsPrioritySchema.default('standard'),
  bodyParagraphs: z.array(z.string().min(1)),

  // Media attachments
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().url(),
        caption: z.string().optional(),
        photographer: z.string().optional(),
        aspectRatio: z.enum(['16:9', '4:3', '1:1', '3:2']).default('16:9'),
      })
    )
    .default([]),

  // Calculated metrics
  wordCount: z.number().int().nonnegative(),
  characterCount: z.number().int().nonnegative(),
  estimatedColumnInches: z.number().positive(),

  // Status and assignment tracking
  status: z.enum(['inbox', 'placed', 'held_for_tomorrow', 'archived']).default('inbox'),
  assignedPageNumber: z.number().int().positive().optional(),
  assignedArticleId: z.string().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StagedNewsItem = z.infer<typeof StagedNewsItemSchema>;
```

---

## 3. Intelligent Ingestion & Multi-Format Parsing

### 3.1 WhatsApp & Clipboard Text Heuristic Parser

Stringers and reporters commonly send news dispatches via WhatsApp or Telegram in raw format:

```text
*लखनऊ: राजधानी में भारी वर्षा से यातायात ठप*
निजी संवाददाता
लखनऊ। कल रात से हो रही मूसलाधार बारिश के चलते राजधानी के कई निचले इलाकों में जलभराव हो गया है।
नगर निगम के राहत दल मौके पर पहुंच गए हैं।
```

The **News Intake Engine** includes a client-side regular expression parser that automatically:

1. Recognizes asterisks `*` or leading capitalized lines as the **Headline**.
2. Recognizes `[शहर] [ब्यूरो/संवाददाता]` patterns as the **Dateline/Byline**.
3. Treats remaining double-line-broken blocks as **Body Paragraphs**.
4. Computes word count immediately upon pasting.

### 3.2 Bulk File Ingestion (.docx, .txt, .pdf)

- **DOCX Import:** Uses `mammoth.js` client-side to convert Microsoft Word files into structured JSON headings and paragraphs, preserving bold text and bullet points.
- **TXT / Markdown Import:** Directly chunks plain text into headlines and body paragraphs.
- **Image Drag-and-Drop:** Reporters can drop high-resolution JPG/PNG images directly onto the news item; the system automatically compresses the image to 300 DPI WebP using HTML5 Canvas before attaching.

### 3.3 Devanagari Unicode Normalization

A frequent issue in Indian newsrooms is non-Unicode legacy Hindi fonts (KrutiDev 010, Chanakya, Walkman-Chanakya) pasted from legacy desktop archives:

- The parser detects non-Unicode character ranges.
- If raw legacy ASCII glyphs are detected, the system applies an integrated client-side **KrutiDev-to-Unicode converter** before saving to the library, ensuring Noto Sans Devanagari and Yatra One render valid conjuncts.

---

## 4. UI Interaction: The News Library Panel

### 4.1 Desktop Staging Workspace

On desktop laptops, the News Library is accessible via a collapsable side tray (Width: $320\text{ px}$) on the left of the canvas:

- **Filtering Tabs:** All (सभी) | Unplaced (अप्रयुक्त - 8) | Placed (प्रयुक्त - 12) | Category Filter (अपराध, राजनीति, खेल).
- **News Item Card:** Displays Headline preview, Word Count badge (e.g. `185 शब्द`), Priority tag, and image thumbnail.
- **Drag-to-Canvas:** Grabbing an item card and dropping it onto a specific column on the canvas instantly instantiates an `Article` component formatted to the target column grid.
- **Click-to-Assign:** Clicking "Place on Page 1 (पेज 1 पर लगाएं)" sends the article to the first available slot on Page 1.

### 4.2 Mobile Phone Intake Drawer

On mobile phones, a dedicated modal accessible from the bottom navigation bar (`+ ब्लॉक / समाचार इनबॉक्स`) provides:

- **Quick Voice/Text Intake:** Paste text from clipboard with one tap.
- **Status Indicator:** Shows remaining unplaced stories.
- **One-Tap Page Assignment:** Select "पेज 1 पर भेजें" (Send to Page 1) or "पेज 2 पर भेजें" (Send to Page 2).

---

## 5. Persistent News Storage & Editorial Memory

- **Hold for Tomorrow (कल के लिए सुरक्षित):** Excess news that cannot fit today’s physical page budget can be marked "Hold for Tomorrow". When the publisher creates tomorrow’s daily edition, these held stories are automatically present in the Inbox.
- **Multi-Page Archiving:** When an issue is finalized and exported to PDF, placed stories are marked as `published` and archived into the daily edition record, keeping the active inbox pristine for the next news cycle.
