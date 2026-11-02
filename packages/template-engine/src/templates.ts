import type {
  NewspaperDocument,
  MasterTemplate,
  DailyEdition,
  TemplatePageBlueprint,
  NewspaperPresetId,
  NewspaperPage,
} from '@epaper-studio/document-schema';
import {
  MasterTemplateSchema,
  DailyEditionSchema,
  getPublicationPages,
  getPageDimensions,
  createNewBlankPage,
} from '@epaper-studio/document-schema';
import { NEWSPAPER_PRESETS, createNewspaperDocument } from './index.js';

/**
 * Creates a reusable MasterTemplate from an existing NewspaperDocument.
 * This decouples the invariant geometry, masthead styling, column layout,
 * and page blueprints from daily news content.
 */
export function createMasterTemplateFromDocument(
  doc: NewspaperDocument,
  name?: string,
  options: Partial<MasterTemplate> = {}
): MasterTemplate {
  const pages = getPublicationPages(doc);
  const now = new Date().toISOString();

  const pageBlueprints: TemplatePageBlueprint[] = pages.map((page, idx) => ({
    pageNumber: page.pageNumber || idx + 1,
    sectionTitle: page.sectionTitle || `पृष्ठ ${idx + 1}`,
    layoutMode: page.layoutMode || 'auto',
    columnCount: page.columnCount,
    // Deep-clone articles as blueprint slot structures
    defaultArticles: JSON.parse(JSON.stringify(page.articles || [])),
  }));

  const template: MasterTemplate = {
    id: options.id || `template-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name || options.name || `${doc.masthead.title} - मास्टर टेम्पलेट`,
    description: options.description || 'कस्टम समाचार पत्र मास्टर टेम्पलेट',
    category: options.category || 'custom',
    presetId: doc.layout.presetId,
    pageSize: doc.metadata.pageSize,
    orientation: doc.metadata.orientation,
    dimensions:
      doc.metadata.dimensions || getPageDimensions(doc.metadata.pageSize, doc.metadata.orientation),
    isBuiltIn: options.isBuiltIn ?? false,
    masthead: JSON.parse(JSON.stringify(doc.masthead)),
    layout: JSON.parse(JSON.stringify(doc.layout)),
    theme: doc.theme ? JSON.parse(JSON.stringify(doc.theme)) : undefined,
    pageBlueprints,
    createdAt: options.createdAt || now,
    updatedAt: now,
  };

  return MasterTemplateSchema.parse(template);
}

let _cachedBuiltinTemplates: MasterTemplate[] | null = null;

/**
 * Returns built-in master templates corresponding to the canonical presets.
 * Lazily evaluated to prevent circular dependency issues during module initialization.
 */
export function getBuiltInMasterTemplates(): MasterTemplate[] {
  if (!_cachedBuiltinTemplates) {
    const presetKeys = Object.keys(NEWSPAPER_PRESETS || {}) as NewspaperPresetId[];
    const now = '2026-11-01T00:00:00.000Z';

    _cachedBuiltinTemplates = presetKeys.map((presetId) => {
      const doc = createNewspaperDocument({ presetId });
      const preset = NEWSPAPER_PRESETS[presetId];

      return createMasterTemplateFromDocument(doc, `${preset.name} (मास्टर टेम्पलेट)`, {
        id: `builtin-template-${presetId}`,
        description: preset.description,
        category:
          presetId === 'classic-hindi-broadsheet' || presetId === 'classic-broadsheet'
            ? 'broadsheet'
            : presetId === 'modern-hindi-daily' || presetId === 'compact-local'
              ? 'tabloid'
              : 'custom',
        isBuiltIn: true,
        createdAt: now,
      });
    });
  }
  return _cachedBuiltinTemplates;
}

export const BUILTIN_MASTER_TEMPLATES: MasterTemplate[] = [];

/**
 * Creates an independent DailyEdition from a MasterTemplate.
 * Clones all page structures and assigns fresh unique IDs to the document and articles,
 * ensuring edits in the daily edition NEVER modify the source master template.
 */
export function createDailyEditionFromTemplate(
  template: MasterTemplate,
  options: {
    editionName?: string;
    editionDate?: string;
    issueNumber?: number;
    volumeNumber?: number;
  } = {}
): DailyEdition {
  const now = new Date().toISOString();
  const editionId = `edition-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const docId = editionId;
  const editionDate = options.editionDate || template.masthead.date || '2 नवंबर 2026';
  const editionName = options.editionName || template.masthead.edition || 'मुख्य संस्करण';

  // Deep clone masthead and layout from template
  const masthead = JSON.parse(JSON.stringify(template.masthead));
  masthead.date = editionDate;
  masthead.edition = editionName;
  if (options.issueNumber !== undefined) {
    masthead.issueNumber = `अंक ${options.issueNumber}`;
    masthead.issueCount = `अंक ${options.issueNumber}`;
  }

  const layout = JSON.parse(JSON.stringify(template.layout));
  const theme = template.theme ? JSON.parse(JSON.stringify(template.theme)) : undefined;

  // Reconstitute pages with fresh article IDs
  const pages: NewspaperPage[] = template.pageBlueprints.map((blueprint, bIdx) => {
    const pageId = `page-${Date.now()}-${bIdx + 1}-${Math.random().toString(36).slice(2, 5)}`;
    const clonedArticles = blueprint.defaultArticles.map((art) => ({
      ...JSON.parse(JSON.stringify(art)),
      id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }));

    return {
      id: pageId,
      pageNumber: blueprint.pageNumber,
      sectionTitle: blueprint.sectionTitle,
      layoutMode: blueprint.layoutMode,
      columnCount: blueprint.columnCount,
      articles: clonedArticles,
    };
  });

  // Ensure at least one page exists
  if (pages.length === 0) {
    pages.push(createNewBlankPage(1, { sectionTitle: 'मुख्य पृष्ठ', language: 'hi' }));
  }

  const document: NewspaperDocument = {
    version: '1.1.0',
    schemaVersion: '1.1.0',
    id: docId,
    templateId: template.id,
    editionId,
    editionDate,
    metadata: {
      id: `meta-${docId}`,
      title: `${template.masthead.title} - ${editionName}`,
      language: 'hi',
      direction: 'ltr',
      pageSize: template.pageSize,
      orientation: template.orientation,
      dimensions: template.dimensions,
      templateId: template.id,
      editionId,
      editionDate,
      createdAt: now,
      updatedAt: now,
    },
    masthead,
    layout,
    theme,
    articles: pages[0]?.articles || [],
    pages,
  };

  const edition: DailyEdition = {
    id: editionId,
    templateId: template.id,
    templateName: template.name,
    editionName,
    editionDate,
    publicationName: template.masthead.title,
    volumeNumber: options.volumeNumber,
    issueNumber: options.issueNumber,
    document,
    saveStatus: 'saved',
    createdAt: now,
    updatedAt: now,
  };

  return DailyEditionSchema.parse(edition);
}

/**
 * Duplicates an existing MasterTemplate with a new name and ID.
 */
export function duplicateMasterTemplate(
  template: MasterTemplate,
  newName?: string
): MasterTemplate {
  const now = new Date().toISOString();
  const copy: MasterTemplate = {
    ...JSON.parse(JSON.stringify(template)),
    id: `template-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: newName || `${template.name} (कॉपी)`,
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };
  return MasterTemplateSchema.parse(copy);
}

/**
 * Duplicates a DailyEdition for another regional edition (e.g. City Edition -> District Edition).
 */
export function duplicateDailyEdition(
  edition: DailyEdition,
  newEditionName?: string
): DailyEdition {
  const now = new Date().toISOString();
  const newEditionId = `edition-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newDocId = newEditionId;
  const targetEditionName = newEditionName || `${edition.editionName} (कॉपी)`;

  const docCopy = JSON.parse(JSON.stringify(edition.document)) as NewspaperDocument;
  docCopy.id = newDocId;
  docCopy.editionId = newEditionId;
  docCopy.metadata.id = `meta-${newDocId}`;
  docCopy.metadata.title = `${docCopy.masthead.title} - ${targetEditionName}`;
  docCopy.metadata.editionId = newEditionId;
  docCopy.metadata.createdAt = now;
  docCopy.metadata.updatedAt = now;
  docCopy.masthead.edition = targetEditionName;

  const copy: DailyEdition = {
    ...JSON.parse(JSON.stringify(edition)),
    id: newEditionId,
    editionName: targetEditionName,
    document: docCopy,
    saveStatus: 'saved',
    createdAt: now,
    updatedAt: now,
  };

  return DailyEditionSchema.parse(copy);
}
