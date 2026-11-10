import type {
  Article,
  NewspaperDocument,
  NewspaperPage,
} from '@epaper-studio/document-schema';
import { MANIFEST_DATA } from './manifestData.js';
import { POC_DESIGN_TEMPLATES } from './pocDesigns.js';
import { BATCH1_DESIGN_TEMPLATES } from './batch1Designs.js';
import { BATCH2_DESIGN_TEMPLATES } from './batch2Designs.js';
import type { DesignLibraryItem, DesignCategory } from './types.js';

export * from './types.js';
export { POC_DESIGN_TEMPLATES } from './pocDesigns.js';
export { BATCH1_DESIGN_TEMPLATES } from './batch1Designs.js';
export { BATCH2_DESIGN_TEMPLATES } from './batch2Designs.js';

export interface ManifestAssetItem {
  id: string;
  clusterId: string;
  filename: string;
  originalPath: string;
  publicUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  fileSize: number;
  format: string;
  category: string;
  subcategory: string;
  baseName: string;
  isCanonical: boolean;
  variantCount: number;
  relatedFiles: string[];
  sha256: string;
  complexity: 'simple' | 'medium' | 'complex';
  status: string;
}

export interface DesignManifest {
  version: string;
  generatedAt: string;
  totalAssets: number;
  canonicalDesignsCount: number;
  categories: string[];
  items: ManifestAssetItem[];
}

export const DESIGN_MANIFEST: DesignManifest = MANIFEST_DATA as unknown as DesignManifest;

/**
 * Returns all 278 manifest asset items.
 */
export function getAllManifestAssets(): ManifestAssetItem[] {
  return DESIGN_MANIFEST.items;
}

/**
 * Returns canonical designs (147 distinct templates).
 */
export function getCanonicalDesigns(): ManifestAssetItem[] {
  return DESIGN_MANIFEST.items.filter((item) => item.isCanonical);
}

/**
 * Returns all verified and editable design items.
 * Integrates POC verified designs with the full catalog.
 */
export function getAvailableDesignTemplates(): DesignLibraryItem[] {
  // Start with verified POC, Batch 1 and Batch 2 designs
  const validatedMap = new Map<string, DesignLibraryItem>();
  POC_DESIGN_TEMPLATES.forEach((item) => validatedMap.set(item.id, item));
  BATCH1_DESIGN_TEMPLATES.forEach((item) => validatedMap.set(item.id, item));
  BATCH2_DESIGN_TEMPLATES.forEach((item) => validatedMap.set(item.id, item));

  // Build full registry of canonical items
  const canonical = getCanonicalDesigns();
  return canonical.map((asset) => {
    if (validatedMap.has(asset.id)) {
      return validatedMap.get(asset.id)!;
    }

    // Default structure for assets being progressively unlocked
    const kind = deriveKindFromCategory(asset.category, asset.subcategory);
    const category = asset.category as DesignCategory;
    const defaultColumnSpan = deriveColumnSpan(asset.subcategory, asset.aspectRatio);

    return {
      id: asset.id,
      clusterId: asset.clusterId,
      name: deriveDesignTitle(asset),
      category,
      subcategory: asset.subcategory,
      kind,
      description: `${asset.subcategory} प्रारूप आधारित समाचार सज्जा (${asset.width}×${asset.height} px)`,
      thumbnailUrl: asset.publicUrl,
      referenceUrl: asset.publicUrl,
      width: asset.width,
      height: asset.height,
      aspectRatio: asset.aspectRatio,
      complexity: asset.complexity,
      status: 'pending',
      tags: [asset.category, asset.subcategory, asset.baseName],
      payload: {
        kind,
        columnSpan: defaultColumnSpan,
        article: {
          elementType: kind === 'breaking-news' ? 'top-headline' : kind === 'advertisement' ? 'advertisement' : 'block',
          headline: `${deriveDesignTitle(asset)}: प्रमुख समाचार शीर्षक`,
          subheadline: 'संक्षिप्त विवरण एवं प्रादेशिक मुख्य बिंदु',
          body: 'यहाँ समाचार का विस्तृत विवरण प्रस्तुत किया जाएगा। यह ब्लॉक पूरी तरह संपादन योग्य है। आवश्यकतानुसार फॉन्ट, आकार, और रंग बदले जा सकते हैं।',
          columnSpan: defaultColumnSpan,
        },
      },
    };
  });
}

/**
 * Retrieves a specific design by ID.
 */
export function getDesignById(id: string): DesignLibraryItem | undefined {
  return getAvailableDesignTemplates().find((item) => item.id === id);
}

/**
 * Clones a native Article payload to ensure an independent copy with fresh IDs.
 */
export function createIndependentArticleFromDesign(
  design: DesignLibraryItem,
  customOverrides?: Partial<Article>
): Article {
  const base = design.payload.article || {};
  const uniqueId = `art-des-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: uniqueId,
    elementType: base.elementType || 'block',
    headline: base.headline || 'समाचार शीर्षक',
    subheadline: base.subheadline || '',
    body: base.body || 'समाचार का मुख्य भाग...',
    byline: base.byline || '',
    dateline: base.dateline || '',
    imageUrl: base.imageUrl,
    imageCaption: base.imageCaption || '',
    imageCredit: base.imageCredit,
    imagePlacement: base.imagePlacement || 'top',
    imageLayout: base.imageLayout,
    imageAspect: base.imageAspect,
    imageFit: base.imageFit || 'cover',
    columnSpan: base.columnSpan || design.payload.columnSpan || 6,
    priority: base.priority || 'major',
    orderIndex: base.orderIndex || 0,
    kickerText: base.kickerText || '',
    bodyColumnCount: base.bodyColumnCount,
    bodyColumnGapPt: base.bodyColumnGapPt,
    bodyColumnRule: base.bodyColumnRule,
    backgroundColor: base.backgroundColor,
    customColors: base.customColors ? JSON.parse(JSON.stringify(base.customColors)) : undefined,
    rashifalItems: base.rashifalItems ? JSON.parse(JSON.stringify(base.rashifalItems)) : undefined,
    shortNewsItems: base.shortNewsItems ? JSON.parse(JSON.stringify(base.shortNewsItems)) : undefined,
    advertisementData: base.advertisementData ? JSON.parse(JSON.stringify(base.advertisementData)) : undefined,
    calendarData: base.calendarData ? JSON.parse(JSON.stringify(base.calendarData)) : undefined,
    borders: base.borders ? JSON.parse(JSON.stringify(base.borders)) : undefined,
    typography: base.typography ? JSON.parse(JSON.stringify(base.typography)) : undefined,
    ...customOverrides,
  };
}

/**
 * Inserts a design into a NewspaperDocument cleanly without overwriting existing content.
 * Returns the updated immutable document.
 */
export function insertDesignIntoDocument(
  doc: NewspaperDocument,
  design: DesignLibraryItem,
  options?: {
    pageIndex?: number;
    replaceMasthead?: boolean;
    appendMode?: 'start' | 'end';
  }
): NewspaperDocument {
  const pages = doc.pages || [];
  if (pages.length === 0) return doc;

  const pageIdx = Math.max(0, Math.min(options?.pageIndex ?? 0, pages.length - 1));
  const targetPage = pages[pageIdx];
  if (!targetPage) return doc;

  // Case 1: Masthead Design Insertion
  if (design.kind === 'masthead' && design.payload.masthead) {
    return {
      ...doc,
      masthead: {
        ...doc.masthead,
        ...design.payload.masthead,
      },
    };
  }

  // Case 2: Article / Block / Ad / Rashifal / Breaking News Insertion
  const newArticle = createIndependentArticleFromDesign(design);
  const existingArticles = targetPage.articles || [];

  const updatedArticles =
    options?.appendMode === 'start'
      ? [newArticle, ...existingArticles]
      : [...existingArticles, newArticle];

  // Re-index orderIndex
  const reIndexedArticles = updatedArticles.map((art, idx) => ({
    ...art,
    orderIndex: idx,
  }));

  const updatedPage: NewspaperPage = {
    ...targetPage,
    articles: reIndexedArticles,
  };

  const updatedPages = [...pages];
  updatedPages[pageIdx] = updatedPage;

  return {
    ...doc,
    pages: updatedPages,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Helper Derivations
// ─────────────────────────────────────────────────────────────────────────────

function deriveKindFromCategory(category: string, subcategory: string): DesignLibraryItem['kind'] {
  if (category === 'headers') return 'masthead';
  if (category === 'rashifal') return 'rashifal';
  if (category === 'ads') return 'advertisement';
  if (category === 'subheaders') return 'breaking-news';
  if (category === 'footers') return 'footer';
  if (category === 'start-decor') return 'divider';
  if (category === 'calendar') return 'calendar';
  if (subcategory === '6col' || subcategory === '12col') return 'composite';
  return 'article';
}

function deriveColumnSpan(subcategory: string, aspect: number): number {
  if (subcategory === '12col') return 12;
  if (subcategory === '8col') return 8;
  if (subcategory === '6col') return 6;
  if (subcategory === '4col') return 4;
  if (subcategory === '3col') return 3;
  if (subcategory === '2col') return 2;
  if (aspect > 3.0) return 12;
  if (aspect > 1.8) return 6;
  return 4;
}

function deriveDesignTitle(asset: ManifestAssetItem): string {
  const catNames: Record<string, string> = {
    headers: 'मास्टहेड शीर्ष सज्जा',
    columns: 'कॉलम समाचार सज्जा',
    subheaders: 'ब्रेकिंग न्यूज़ व सब-हेडर',
    ads: 'व्यावसायिक विज्ञापन ब्लॉक',
    rashifal: 'दैनिक राशिफल चक्र',
    footers: 'समाचार पत्र पादलेख (Footer)',
    'start-decor': 'विभाजक व सज्जा पट्टी',
    calendar: 'दैनिक पंचांग व कैलेंडर',
  };
  const catLabel = catNames[asset.category] || asset.category;
  return `${catLabel} (${asset.subcategory}/${asset.baseName})`;
}
