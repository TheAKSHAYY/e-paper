import type { MinimalDocument, PageDimensions } from '@epaper-studio/document-schema';

export const DEVICE_PROFILES: Record<string, PageDimensions> = {
  'kindle-scribe': {
    widthPt: 734.4,
    heightPt: 979.2,
    dpi: 300,
    grayscaleLevels: 16,
  },
  'remarkable-2': {
    widthPt: 698.4,
    heightPt: 931.2,
    dpi: 226,
    grayscaleLevels: 16,
  },
  'kobo-elipsa': {
    widthPt: 698.4,
    heightPt: 931.2,
    dpi: 227,
    grayscaleLevels: 16,
  },
  'print-a4': {
    widthPt: 595.28,
    heightPt: 841.89,
    dpi: 300,
    grayscaleLevels: 256,
  },
};

export const SAMPLE_EPAPER_DOCUMENT: MinimalDocument = {
  schemaVersion: '1.0.0',
  metadata: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'The Morning Dispatch — Sample Issue',
    language: 'en',
    direction: 'ltr',
    device: 'remarkable-2',
    orientation: 'portrait',
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  },
  pages: [],
};
