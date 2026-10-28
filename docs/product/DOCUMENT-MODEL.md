# E-PAPER STUDIO — DOCUMENT MODEL & SCHEMA ARCHITECTURE

## 1. Mathematical Hierarchy & Domain Entities

E-Paper Studio defines a strictly typed, schema-validated document hierarchy structured around professional newspaper publishing concepts:

```
Publication (NewspaperDocument)
├── metadata: NewspaperMetadata
│   ├── id: UUID
│   ├── title: string
│   ├── language: 'hi' | 'en' | string
│   ├── direction: 'ltr' | 'rtl'
│   ├── pageSize: 'broadsheet' | 'berliner' | 'tabloid' | 'a3' | 'a4'
│   └── orientation: 'portrait' | 'landscape'
│
├── masthead: MastheadConfig (Front Page Nameplate)
│   ├── title: string (e.g. 'जनवाणी समाचार')
│   ├── subtitle: string (e.g. 'सत्य, निष्पक्षता और जनसेवा का प्रतीक')
│   ├── edition: string (e.g. 'प्रातःकालीन मुख्य संस्करण')
│   ├── issueNumber: string (e.g. 'वर्ष 78 • अंक 142')
│   ├── date: string (e.g. 'मंगलवार, 27 अक्टूबर 2026')
│   ├── price: string (e.g. 'मूल्य: ₹5.00')
│   └── weatherNotice: string (e.g. 'मौसम: सुहावना, 25° से.')
│
├── layout: NewspaperLayoutConfig (Default Styling Rules)
│   ├── presetId: NewspaperPresetId
│   ├── columnCount: number (2 to 6)
│   ├── columnRule: boolean
│   ├── mastheadFont: string (e.g. "'Rozha One', serif")
│   ├── headlineFont: string (e.g. "'Noto Serif Devanagari', serif")
│   ├── subheadlineFont: string
│   ├── bodyFont: string
│   ├── headlineWeight: number (300 to 900)
│   ├── bodyFontSizePt: number (8 to 16)
│   ├── spacingDensity: 'compact' | 'normal' | 'spacious'
│   └── showFooter: boolean
│
└── pages: NewspaperPage[] (Multi-Page Architecture)
    └── NewspaperPage
        ├── pageNumber: number (1-indexed)
        ├── sectionTitle: string (e.g. 'मुख्य पृष्ठ', 'संपादकीय', 'व्यापार', 'खेल')
        ├── layoutOverrides?: Partial<NewspaperLayoutConfig>
        └── blocks: NewspaperBlock[] (or Article[])
            └── Article / NewspaperBlock
                ├── id: string (UUID)
                ├── blockType: 'lead' | 'major' | 'minor' | 'brief' | 'editorial' | 'photo' | 'notice'
                ├── headline: string
                ├── subheadline?: string
                ├── body: string
                ├── byline?: string
                ├── dateline?: string
                ├── imageUrl?: string
                ├── imageCaption?: string
                ├── imagePlacement: 'top' | 'middle' | 'side' | 'bottom' | 'none'
                ├── columnSpan: number (1 to 6)
                ├── priority: 'lead' | 'major' | 'minor' | 'brief'
                └── orderIndex: number
```

---

## 2. Page Geometry & Dimension Specifications

All physical paper formats map strictly to standard PostScript typography points (72 points per inch):

| Preset Identifier | Standard Format Name            | Width (Points) | Height (Points) | Width (mm) | Height (mm) | Aspect Ratio | Standard Indian Use Case                                          |
| :---------------- | :------------------------------ | :------------- | :-------------- | :--------- | :---------- | :----------- | :---------------------------------------------------------------- |
| `broadsheet`      | Broadsheet (15" × 22.75")       | **1080.0 pt**  | **1638.0 pt**   | 381 mm     | 578 mm      | 1:1.52       | Major national Hindi dailies (Dainik Jagran, Amar Ujala, Janwani) |
| `berliner`        | Berliner / Midi (12.4" × 18.5") | **892.8 pt**   | **1332.0 pt**   | 315 mm     | 470 mm      | 1:1.49       | Modern editorial and metro evening editions                       |
| `tabloid`         | Tabloid / Compact (11" × 17")   | **792.0 pt**   | **1224.0 pt**   | 280 mm     | 432 mm      | 1:1.55       | Regional district gazettes, campus editions, weekly papers        |
| `a3`              | ISO A3 (297mm × 420mm)          | **841.89 pt**  | **1190.55 pt**  | 297 mm     | 420 mm      | 1:1.41       | Institutional bulletin boards and archival prints                 |
| `a4`              | ISO A4 (210mm × 297mm)          | **595.28 pt**  | **841.89 pt**   | 210 mm     | 297 mm      | 1:1.41       | Desktop printers, digital newsletters, single-sheet circulars     |

---

## 3. Zod Schema Verification & Backward Compatibility

The document model maintains backward compatibility with legacy single-page schemas (`articles: Article[]` on root `NewspaperDocument`) while providing clean migration paths to explicit multi-page publications:

```typescript
// Unified access pattern:
export function getPublicationPages(doc: NewspaperDocument): NewspaperPage[] {
  if (doc.pages && doc.pages.length > 0) {
    return doc.pages;
  }
  // Synthesize single page from legacy root articles array
  return [
    {
      pageNumber: 1,
      sectionTitle: 'Front Page',
      blocks: doc.articles,
    },
  ];
}
```

---

## 4. Volume Budgeting & Page Capacity Formulas

Page capacity is estimated using word and glyph density formulas:
$$\text{Effective Weight} = (\text{Word Count} + \text{Image Weight} + \text{Headline Weight}) \times (0.8 + 0.2 \times \text{Column Span})$$

- Standard Broadsheet Budget: ~3,500 to 4,500 words per page.
- Standard Tabloid / A4 Budget: ~1,500 to 2,400 words per page.
- Image Weight factor: ~250 words per photograph.
- Headline Weight factor: ~40 words per display headline.
