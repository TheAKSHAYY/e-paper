# Master Template & Daily Edition Architecture

## Executive Summary

A critical architectural deficiency in generic design tools (and the current single-draft state of E-Paper Studio) is the conflation of **layout geometry** with **daily content payload**. In a professional publishing house, an art director or senior publisher designs the newspaper's layout once, establishing its masthead, column grids, typographic hierarchies, color schemes, and advertisement placements. Thereafter, daily editors and reporters produce daily issues without touching the structural grid.

This document presents the architectural design for decoupling **Master Templates** from **Daily Editions**, enabling one-click daily publishing, multiple regional editions (City, District, Evening), and custom user-saved templates.

---

## 1. Domain Model: Master Template vs. Daily Edition

```
┌────────────────────────────────────────────────────────────────────────┐
│ MASTER TEMPLATE (अपरिवर्तनीय लेआउट एवं ब्रांडिंग ढांचा)                 │
│ • Paper Format (A3, A4, Broadsheet, Tabloid) & Margins                 │
│ • Masthead Architecture: Title font, logo, rules, layout zones         │
│ • Section Geometry: Number of pages, column grid per page (2–12 col)   │
│ • Ad Placements: Locked commercial slots (Ear ads, banner, footer ads) │
│ • Typographic Palette: Font families, headline scales, body leading    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Instantiates / Inherits
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DAILY EDITION (दैनिक अंक / सामयिक समाचार सामग्री)                       │
│ • Edition Metadata: Publication Date, Volume/Issue No., Edition Name   │
│ • Ephemeral Data: Weather temperature/city, AQI, Daily Price           │
│ • Content Payload: Today's Headlines, Lead Stories, Photos, Byline    │
│ • Ad Creative Payload: Specific client graphics for today's issue      │
│ • Status: Draft → Staged → Preflight Approved → Published (Archived)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Formal Schema Definitions (TypeScript / Zod)

The separation is codified into two cleanly decoupled schema models designed to extend `@epaper-studio/document-schema`:

```typescript
import { z } from 'zod';
import {
  PageFormatSchema,
  MastheadConfigSchema,
  GridPresetSchema,
  ArticleSchema,
  AdvertisementSchema,
} from '@epaper-studio/document-schema';

/**
 * 1. Master Template Schema: The structural blueprint
 */
export const MasterTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1), // e.g. "दैनिक जनसंदेश - प्रादेशिक ब्रॉडशीट (A3)"
  description: z.string().optional(),
  category: z.enum(['broadsheet', 'tabloid', 'evening', 'commercial', 'magazine', 'custom']),
  format: PageFormatSchema,
  mastheadTemplate: MastheadConfigSchema.omit({
    date: true,
    issueNumber: true,
    temperature: true,
    weatherNotice: true,
    airQuality: true,
  }),
  defaultGrid: GridPresetSchema,
  pageBlueprints: z.array(
    z.object({
      pageNumber: z.number(),
      sectionName: z.string(), // e.g., "मुख्य पृष्ठ", "देश-विदेश", "व्यापार", "संपादकीय"
      columns: z.number().min(2).max(12),
      lockedAdSlots: z.array(
        z.object({
          slotId: z.string(),
          columnSpan: z.number(),
          rowSpan: z.number(),
          position: z.enum([
            'top-banner',
            'footer-strip',
            'left-ear',
            'right-ear',
            'quarter-page',
            'custom',
          ]),
          lockedDimensionsMm: z.object({ width: z.number(), height: z.number() }),
        })
      ),
      articleSlotTemplates: z.array(
        z.object({
          slotId: z.string(),
          role: z.enum(['lead', 'major-anchor', 'secondary', 'brief', 'editorial']),
          suggestedColumnSpan: z.number(),
          maxWordCount: z.number(),
        })
      ),
    })
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MasterTemplate = z.infer<typeof MasterTemplateSchema>;

/**
 * 2. Daily Edition Schema: The transient daily payload
 */
export const DailyEditionSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(), // Foreign key to MasterTemplate
  editionName: z.string(), // e.g., "लखनऊ संस्करण", "वाराणसी संस्करण"
  publicationDate: z.string(), // YYYY-MM-DD
  volumeNumber: z.number().int().positive(),
  issueNumber: z.number().int().positive(),

  // Daily dynamic weather/environmental data
  weatherData: z.object({
    city: z.string(),
    temperature: z.string(),
    weatherNotice: z.string().optional(),
    airQuality: z.string().optional(),
  }),

  // Content populated into the blueprint slots
  pages: z.array(
    z.object({
      pageNumber: z.number(),
      articles: z.array(ArticleSchema),
      advertisements: z.array(AdvertisementSchema),
    })
  ),

  status: z.enum(['draft', 'in_review', 'preflight_ready', 'published', 'archived']),
  generatedPdfUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DailyEdition = z.infer<typeof DailyEditionSchema>;
```

---

## 3. Daily Publisher Workflow: Step-by-Step

### Stage A: One-Time Master Template Setup

1. The publisher opens the **Template Designer**.
2. Selects physical paper size (e.g. A3 Broadsheet, 8 columns).
3. Configures permanent masthead elements (Title: "दैनिक जनसंदेश", Estd. 1998, RNI: UP-HIN/1998/4567, Logo, Ornate Rule).
4. Locks commercial advertisement slots (Right Ear Ad: $40\text{ mm} \times 40\text{ mm}$, Bottom Footer Banner: $270\text{ mm} \times 45\text{ mm}$).
5. Clicks **"Save as Master Template / मास्टर टेम्पलेट सहेजें"**. The layout is permanently stored in the publisher's template library.

### Stage B: Daily Morning Issue Generation (Zero Layout Fatigue)

1. Every morning at 6:00 AM, the publisher clicks **"Create Today's Edition / आज का अंक बनाएं"**.
2. **Automated Initialization:**
   - The system retrieves the locked Master Template.
   - The date automatically advances to today's date (e.g. "गुरुवार, 2 नवंबर 2026").
   - The issue number increments automatically (`Issue #8742` $\to$ `#8743`).
   - Masthead branding, ad frames, and section rules are populated instantaneously.
   - Article slots are opened clean, ready to receive today's news.
3. **News Inflow:** The editor stages today's 12 stories from the News Library or clicks "Auto Arrange".
4. **Export & Distribution:** The preflight validation checks the issue and produces a high-res PDF in under 15 seconds.

### Stage C: Multi-Edition Workflow (City vs. District vs. Evening)

Publishers frequently publish multiple geographic or temporal editions of the same daily paper:

- **Morning Broadsheet (मुख्य संस्करण):** Full 8-page edition covering state, national, and international news.
- **District Edition (जिला संस्करण):** Identical Master Template, but Page 2 & Page 3 are swapped with local rural/tehsil crime and municipal reports.
- **Evening Express (सांध्य दैनिक):** A 4-page tabloid variant optimized for breaking afternoon sports, stock market close, and civic developments.

The architecture allows:

- **"Duplicate for Regional Edition"**: Clones the current daily issue, allowing localized replacement of specific pages while keeping common national news pages linked.

---

## 4. Built-In Pre-Made Template Gallery

E-Paper Studio already possesses 6 canonical presets within `packages/template-engine/src/index.ts`. These are mapped directly into the Master Template taxonomy:

| Preset Identifier     | Visual Style & Archetype                                         | Target Format       | Primary Use Case                                                           |
| :-------------------- | :--------------------------------------------------------------- | :------------------ | :------------------------------------------------------------------------- |
| `dainik-classic`      | Authentic North Indian Morning Broadsheet (Jagran/Bhaskar style) | A3 (8 Columns)      | Daily morning regional newspaper, authoritative broadsheet layout          |
| `sandhya-express`     | Bold Evening Tabloid (सांध्य दैनिक) with heavy headline ink      | Tabloid (5 Columns) | Fast-paced evening news, sensational breaking stories, crime/sports        |
| `vyapar-samachar`     | Financial & Commodity Broadsheet (व्यापार समाचार)                | A3 (7 Columns)      | Market tables, commodity rates, corporate analysis, dense columns          |
| `e-paper-modern`      | Digital-first Clean Hybrid with generous white space             | A4 / Tablet         | E-ink readers (Boox, reMarkable) and mobile-optimized web PDF              |
| `punarvas-broadsheet` | High-density Editorial Broadsheet (पुनर्वास शैली)                | A3 (8 Columns)      | Deep investigative journalism, multi-column analysis, literary supplements |
| `weekly-magazine`     | 3-Column Magazine / Feature Spread (साप्ताहिक पत्रिका)           | A4 (3 Columns)      | Sunday magazine supplements, lifestyle, interviews, photo features         |

---

## 5. Storage & Persistence Strategy

1. **Local-First Architecture:** Master templates and active daily editions are persisted in IndexedDB via LocalForage/Dexie, ensuring the editor functions completely offline without internet connectivity.
2. **Cloud Synchronization (Supabase):** For multi-user newsrooms, templates and editions sync to PostgreSQL with Row-Level Security (RLS) scoped by `publisher_id`, permitting concurrent multi-reporter workflows.
3. **Version History & Rollback:** Every daily edition maintains an immutable audit log (`editions_history`), enabling an editor to rollback to 7:00 PM draft if late-breaking edits break layout balance.
