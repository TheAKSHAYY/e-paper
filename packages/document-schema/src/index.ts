import { z } from 'zod';

export const SupportedDeviceSchema = z.enum([
  'kindle-scribe',
  'remarkable-2',
  'kobo-elipsa',
  'boox-tab-ultra',
  'supernote-a5x',
  'generic-eink-10in',
  'generic-eink-13in',
  'print-a4',
  'print-a5',
]);

export type SupportedDevice = z.infer<typeof SupportedDeviceSchema>;

export const PageOrientationSchema = z.enum(['portrait', 'landscape']);
export type PageOrientation = z.infer<typeof PageOrientationSchema>;

export const PageDimensionsSchema = z.object({
  widthPt: z.number().positive(),
  heightPt: z.number().positive(),
  dpi: z.number().int().positive().default(300),
  grayscaleLevels: z.number().int().min(2).max(256).default(16),
});

export type PageDimensions = z.infer<typeof PageDimensionsSchema>;

export const DocumentMetadataSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  language: z.string().default('en'),
  direction: z.enum(['ltr', 'rtl']).default('ltr'),
  device: SupportedDeviceSchema.default('remarkable-2'),
  orientation: PageOrientationSchema.default('portrait'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export const MinimalDocumentSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  metadata: DocumentMetadataSchema,
  pages: z.array(z.record(z.unknown())).default([]),
});

export type MinimalDocument = z.infer<typeof MinimalDocumentSchema>;
