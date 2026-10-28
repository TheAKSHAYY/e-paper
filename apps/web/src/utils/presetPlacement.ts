import type { Article } from '@epaper-studio/document-schema';

export interface CreateArticleFromPresetOptions {
  newId?: string;
  defaultColumnCount?: number;
  orderIndex?: number;
}

/**
 * Creates a complete Article element from an editorial preset template,
 * preserving all specialized fields (elementType, borders, background colors,
 * rashifal items, ad fields, short news bullets) while assigning a unique ID
 * and sequential order index.
 */
export function createArticleFromPreset(
  blockTemplate: Partial<Article>,
  options: CreateArticleFromPresetOptions = {}
): Article {
  const newId =
    options.newId ?? `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const defaultCols = options.defaultColumnCount ?? 6;

  return {
    ...blockTemplate,
    id: newId,
    headline: blockTemplate.headline ?? 'यहाँ समाचार का शीर्षक लिखें',
    subheadline: blockTemplate.subheadline ?? '',
    body: blockTemplate.body ?? 'समाचार का विवरण यहाँ लिखें...',
    byline: blockTemplate.byline ?? 'विशेष संवाददाता',
    dateline: blockTemplate.dateline ?? 'नई दिल्ली —',
    imageUrl: blockTemplate.imageUrl ?? '',
    imageCaption: blockTemplate.imageCaption ?? '',
    imagePlacement: blockTemplate.imagePlacement ?? (blockTemplate.imageUrl ? 'top' : 'none'),
    columnSpan: blockTemplate.columnSpan ?? Math.min(2, defaultCols),
    priority: blockTemplate.priority ?? 'major',
    orderIndex: options.orderIndex ?? 0,
  };
}
