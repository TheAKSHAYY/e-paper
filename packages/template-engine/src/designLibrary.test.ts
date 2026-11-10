import { describe, it, expect } from 'vitest';
import {
  getAllManifestAssets,
  getCanonicalDesigns,
  getDesignById,
  insertDesignIntoDocument,
  POC_DESIGN_TEMPLATES,
} from './designLibrary';
import { NewspaperDocumentSchema } from '@epaper-studio/document-schema';
import { createNewspaperDocument } from './index';

describe('Design Library Registry & 278 Asset Manifest', () => {
  it('should load all 278 assets from manifest.json', () => {
    const assets = getAllManifestAssets();
    expect(assets.length).toBe(278);
  });

  it('should identify 147 canonical designs and group variants', () => {
    const canonical = getCanonicalDesigns();
    expect(canonical.length).toBe(147);

    // Verify all canonical items have valid metadata
    canonical.forEach((item) => {
      expect(item.id).toMatch(/^des-\d{3}$/);
      expect(item.width).toBeGreaterThan(0);
      expect(item.height).toBeGreaterThan(0);
      expect(item.publicUrl).toContain('/design-library/references/');
      expect(item.category).toBeTruthy();
    });
  });

  it('should contain all 10 POC designs covering the 6 required categories', () => {
    expect(POC_DESIGN_TEMPLATES.length).toBe(10);

    const categories = POC_DESIGN_TEMPLATES.map((d) => d.category);
    expect(categories).toContain('headers');
    expect(categories).toContain('columns');
    expect(categories).toContain('subheaders');
    expect(categories).toContain('rashifal');
    expect(categories).toContain('ads');

    // 3 Headers
    const headers = POC_DESIGN_TEMPLATES.filter((d) => d.category === 'headers');
    expect(headers.length).toBe(3);

    // 2 Article Layouts + 2 Multi-column Layouts = 4 column layouts
    const columns = POC_DESIGN_TEMPLATES.filter((d) => d.category === 'columns');
    expect(columns.length).toBe(4);

    // 1 Breaking News
    const breaking = POC_DESIGN_TEMPLATES.filter((d) => d.category === 'subheaders');
    expect(breaking.length).toBe(1);

    // 1 Rashifal
    const rashifal = POC_DESIGN_TEMPLATES.filter((d) => d.category === 'rashifal');
    expect(rashifal.length).toBe(1);

    // 1 Advertisement
    const ads = POC_DESIGN_TEMPLATES.filter((d) => d.category === 'ads');
    expect(ads.length).toBe(1);
  });

  it('should retrieve individual designs by ID with native editable payload', () => {
    const header = getDesignById('des-103');
    expect(header).toBeDefined();
    expect(header?.kind).toBe('masthead');
    expect(header?.payload.masthead?.title).toBe('दैनिक सवेरा');

    const rashifal = getDesignById('des-132');
    expect(rashifal).toBeDefined();
    expect(rashifal?.kind).toBe('rashifal');
    expect(rashifal?.payload.article?.rashifalItems?.length).toBe(12);

    const breaking = getDesignById('des-142');
    expect(breaking).toBeDefined();
    expect(breaking?.payload.article?.elementType).toBe('top-headline');

    const ad = getDesignById('des-001');
    expect(ad).toBeDefined();
    expect(ad?.payload.article?.elementType).toBe('advertisement');
  });

  it('should cleanly insert a design into a NewspaperDocument without destroying existing content', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const initialArticleCount = doc.pages[0]?.articles?.length || 0;
    expect(initialArticleCount).toBeGreaterThan(0);

    // Insert Lead Article design
    const leadDesign = getDesignById('des-041')!;
    const updatedDoc = insertDesignIntoDocument(doc, leadDesign);

    const updatedArticles = updatedDoc.pages[0]?.articles || [];
    expect(updatedArticles.length).toBe(initialArticleCount + 1);

    // Verify last inserted article matches the design
    const inserted = updatedArticles[updatedArticles.length - 1];
    expect(inserted.headline).toContain('मुंबई: रियलिटी शो बिग बॉस के सेट पर लगी आग');
    expect(inserted.columnSpan).toBe(4);

    // Schema validation ensures document integrity
    const validated = NewspaperDocumentSchema.safeParse(updatedDoc);
    expect(validated.success).toBe(true);
  });

  it('should support multiple insertions creating completely independent copies with unique IDs', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const adDesign = getDesignById('des-001')!;

    // Insert same design twice
    const doc1 = insertDesignIntoDocument(doc, adDesign);
    const doc2 = insertDesignIntoDocument(doc1, adDesign);

    const articles = doc2.pages[0]?.articles || [];
    const insertedAds = articles.filter((a) => a.elementType === 'advertisement');
    expect(insertedAds.length).toBeGreaterThanOrEqual(2);

    const adCopy1 = insertedAds[insertedAds.length - 2];
    const adCopy2 = insertedAds[insertedAds.length - 1];

    // Unique IDs
    expect(adCopy1.id).not.toBe(adCopy2.id);

    // Mutating copy 1 does NOT affect copy 2
    adCopy1.headline = 'परिवर्तित विज्ञापन शीर्षक';
    expect(adCopy2.headline).not.toBe('परिवर्तित विज्ञापन शीर्षक');
  });

  it('should apply masthead design cleanly to the document masthead', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const modernHeader = getDesignById('des-115')!;

    const updatedDoc = insertDesignIntoDocument(doc, modernHeader);
    expect(updatedDoc.masthead.title).toBe('राष्ट्रीय आवाज़');
    expect(updatedDoc.masthead.tagline).toBe('विश्वसनीय पत्रकारिता, निष्पक्ष दृष्टिकोण');

    const validated = NewspaperDocumentSchema.safeParse(updatedDoc);
    expect(validated.success).toBe(true);
  });

  it('should validate all 10 Batch 1 designs with native editable payloads', () => {
    const batch1Ids = [
      'des-002', 'des-003', 'des-010', 'des-012', 'des-019',
      'des-090', 'des-097', 'des-130', 'des-134', 'des-140'
    ];

    let doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });

    for (const id of batch1Ids) {
      const design = getDesignById(id);
      expect(design, `Design ${id} must exist`).toBeDefined();
      expect(design?.status).toBe('validated');
      expect(design?.payload).toBeDefined();

      if (design?.kind === 'masthead') {
        expect(design.payload.masthead?.title).toBeTruthy();
      } else {
        expect(design?.payload.article?.headline).toBeTruthy();
      }

      // Test insertion into document
      doc = insertDesignIntoDocument(doc, design!);
    }

    const validated = NewspaperDocumentSchema.safeParse(doc);
    expect(validated.success, 'Document with all Batch 1 designs must pass schema validation').toBe(true);
  });

  it('should validate all 20 Batch 2 designs with native editable payloads across 5 categories', () => {
    const batch2Ids = [
      'des-001', 'des-004', 'des-005', 'des-006', 'des-007', 'des-008', 'des-009',
      'des-141', 'des-142', 'des-143', 'des-144', 'des-145', 'des-146', 'des-147',
      'des-131', 'des-133',
      'des-011',
      'des-091', 'des-092', 'des-093'
    ];

    expect(batch2Ids.length).toBe(20);
    let doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });

    for (const id of batch2Ids) {
      const design = getDesignById(id);
      expect(design, `Batch 2 design ${id} must exist`).toBeDefined();
      expect(design?.status).toBe('validated');
      expect(design?.payload).toBeDefined();
      expect(design?.payload.article?.headline).toBeTruthy();

      // Test insertion into document
      const preCount = doc.pages[0]?.articles?.length || 0;
      doc = insertDesignIntoDocument(doc, design!);
      const postCount = doc.pages[0]?.articles?.length || 0;
      expect(postCount).toBe(preCount + 1);

      // Verify inserted article has unique ID
      const inserted = doc.pages[0]?.articles[postCount - 1];
      expect(inserted?.id).toMatch(/^art-des-/);
      expect(inserted?.headline).toBe(design?.payload.article?.headline);
    }

    const validated = NewspaperDocumentSchema.safeParse(doc);
    expect(validated.success, 'Document with all 20 Batch 2 designs must pass schema validation').toBe(true);
  });
});
