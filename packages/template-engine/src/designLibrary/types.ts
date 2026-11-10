import type {
  Article,
  MastheadConfig,
  EditorialPreset,
} from '@epaper-studio/document-schema';

export type DesignCategory =
  | 'headers'
  | 'columns'
  | 'subheaders'
  | 'ads'
  | 'rashifal'
  | 'footers'
  | 'start-decor'
  | 'calendar';

export type DesignKind =
  | 'masthead'
  | 'article'
  | 'composite'
  | 'breaking-news'
  | 'rashifal'
  | 'advertisement'
  | 'footer'
  | 'divider'
  | 'calendar';

export interface DesignLibraryItem {
  id: string;
  clusterId: string;
  name: string;
  category: DesignCategory;
  subcategory: string;
  kind: DesignKind;
  description: string;
  thumbnailUrl: string;
  referenceUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  complexity: 'simple' | 'medium' | 'complex';
  status: 'pending' | 'analyzed' | 'recreated' | 'validated' | 'needs_review' | 'failed';
  tags: string[];

  // Native editable payload depending on design kind
  payload: {
    kind: DesignKind;
    masthead?: Partial<MastheadConfig>;
    article?: Partial<Article>;
    articles?: Partial<Article>[];
    editorialPreset?: Partial<EditorialPreset>;
    columnSpan?: number;
    recommendedWidthMm?: number;
    recommendedHeightMm?: number;
  };
}
