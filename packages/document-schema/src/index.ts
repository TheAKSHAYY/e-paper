import { z } from 'zod';

/* ====================================================================
 * Existing Device Profiles & Geometry Specifications
 * ==================================================================== */

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
  widthMm: z.number().optional(),
  heightMm: z.number().optional(),
  widthIn: z.number().optional(),
  heightIn: z.number().optional(),
  aspectRatio: z.number().optional(),
  aspectRatioLabel: z.string().optional(),
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

/* ====================================================================
 * Newspaper Publishing Document Schema (Phase 1)
 * ==================================================================== */

export const PageSizePresetSchema = z.enum([
  'broadsheet',
  'tabloid',
  'berliner',
  'a3',
  'a4',
  'a5',
  'custom',
]);

export type PageSizePreset = z.infer<typeof PageSizePresetSchema>;

export interface PageSizeDefinition {
  name: string;
  widthPt: number;
  heightPt: number;
  widthMm: number;
  heightMm: number;
  aspectRatio: string;
  description: string;
}

export const PAGE_SIZE_DEFINITIONS: Record<PageSizePreset, PageSizeDefinition> = {
  broadsheet: {
    name: 'Broadsheet (15" × 22.75")',
    widthPt: 1080,
    heightPt: 1638,
    widthMm: 381,
    heightMm: 578,
    aspectRatio: '1:1.52',
    description: 'Traditional full-format newspaper for major national and international dailies.',
  },
  berliner: {
    name: 'Berliner / Midi (12.4" × 18.5")',
    widthPt: 892.8,
    heightPt: 1332,
    widthMm: 315,
    heightMm: 470,
    aspectRatio: '1:1.49',
    description: 'Mid-sized European format balancing multi-column density with reader comfort.',
  },
  tabloid: {
    name: 'Tabloid / Compact (11" × 17")',
    widthPt: 792,
    heightPt: 1224,
    widthMm: 280,
    heightMm: 432,
    aspectRatio: '1:1.55',
    description:
      'Modern compact format popular for local gazettes, campus papers, and periodicals.',
  },
  a3: {
    name: 'ISO A3 (297mm × 420mm)',
    widthPt: 841.89,
    heightPt: 1190.55,
    widthMm: 297,
    heightMm: 420,
    aspectRatio: '1:1.41',
    description: 'Standard international archival poster and institutional newspaper size.',
  },
  a4: {
    name: 'ISO A4 (210mm × 297mm)',
    widthPt: 595.28,
    heightPt: 841.89,
    widthMm: 210,
    heightMm: 297,
    aspectRatio: '1:1.41',
    description: 'Universal office print format, ideal for desktop printing and digital bulletins.',
  },
  a5: {
    name: 'ISO A5 (148mm × 210mm)',
    widthPt: 419.53,
    heightPt: 595.28,
    widthMm: 148,
    heightMm: 210,
    aspectRatio: '1:1.41',
    description: 'Compact digest format popular for community gazettes and local bulletins.',
  },
  custom: {
    name: 'Custom Dimensions',
    widthPt: 841.89,
    heightPt: 1190.55,
    widthMm: 297,
    heightMm: 420,
    aspectRatio: '1:1.41',
    description: 'User-configured custom newspaper or publication dimensions.',
  },
};

export const PageMarginsSchema = z.object({
  topMm: z.number().min(0).max(100).default(8.5),
  bottomMm: z.number().min(0).max(100).default(8.5),
  leftMm: z.number().min(0).max(100).default(8.5),
  rightMm: z.number().min(0).max(100).default(8.5),
  unit: z.enum(['mm', 'in', 'pt']).default('mm'),
});
export type PageMargins = z.infer<typeof PageMarginsSchema>;

export const ArticlePrioritySchema = z.enum(['lead', 'major', 'minor', 'brief']);
export type ArticlePriority = z.infer<typeof ArticlePrioritySchema>;

export const ImagePlacementSchema = z.enum(['top', 'middle', 'side', 'bottom', 'none']);
export type ImagePlacement = z.infer<typeof ImagePlacementSchema>;

export const ImageLayoutSchema = z.enum(['full', 'side', 'thumbnail', 'card']);
export type ImageLayout = z.infer<typeof ImageLayoutSchema>;

export const ImageAspectSchema = z.enum(['wide', 'standard', 'square', 'portrait', 'original']);
export type ImageAspect = z.infer<typeof ImageAspectSchema>;

export const ImageFitSchema = z.enum(['cover', 'contain', 'fill']);
export type ImageFit = z.infer<typeof ImageFitSchema>;

export const ImageFocalPointSchema = z.enum([
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
]);
export type ImageFocalPoint = z.infer<typeof ImageFocalPointSchema>;

export const ElementTypeSchema = z.enum([
  'block',
  'top-headline',
  'short-news',
  'advertisement',
  'rashifal',
]);
export type ElementType = z.infer<typeof ElementTypeSchema>;

export const BorderStyleSchema = z.enum(['solid', 'double', 'dashed', 'dotted', 'none']);
export type BorderStyle = z.infer<typeof BorderStyleSchema>;

export const SingleBorderConfigSchema = z.object({
  width: z.number().min(0).max(12).default(0),
  style: BorderStyleSchema.default('none'),
  color: z.string().default('#111111'),
});
export type SingleBorderConfig = z.infer<typeof SingleBorderConfigSchema>;

export const ElementBordersSchema = z.object({
  top: SingleBorderConfigSchema.optional(),
  right: SingleBorderConfigSchema.optional(),
  bottom: SingleBorderConfigSchema.optional(),
  left: SingleBorderConfigSchema.optional(),
});
export type ElementBorders = z.infer<typeof ElementBordersSchema>;

/**
 * Converts ElementBorders into an inline CSS style string for HTML/PDF rendering.
 */
export function elementBordersToStyleString(
  borders?: ElementBorders,
  fallbackColor?: string
): string {
  if (!borders) return '';
  let str = '';
  if (
    borders.top &&
    borders.top.style &&
    borders.top.style !== 'none' &&
    (borders.top.width ?? 0) > 0
  ) {
    str += `border-top: ${borders.top.width}px ${borders.top.style} ${fallbackColor || borders.top.color || '#111111'}; `;
  }
  if (
    borders.right &&
    borders.right.style &&
    borders.right.style !== 'none' &&
    (borders.right.width ?? 0) > 0
  ) {
    str += `border-right: ${borders.right.width}px ${borders.right.style} ${fallbackColor || borders.right.color || '#111111'}; `;
  }
  if (
    borders.bottom &&
    borders.bottom.style &&
    borders.bottom.style !== 'none' &&
    (borders.bottom.width ?? 0) > 0
  ) {
    str += `border-bottom: ${borders.bottom.width}px ${borders.bottom.style} ${fallbackColor || borders.bottom.color || '#111111'}; `;
  }
  if (
    borders.left &&
    borders.left.style &&
    borders.left.style !== 'none' &&
    (borders.left.width ?? 0) > 0
  ) {
    str += `border-left: ${borders.left.width}px ${borders.left.style} ${fallbackColor || borders.left.color || '#111111'}; `;
  }
  return str;
}

export const RashifalItemSchema = z.object({
  rashi: z.string(),
  sign: z.string(),
  prediction: z.string(),
});
export type RashifalItem = z.infer<typeof RashifalItemSchema>;

export const ShortNewsItemSchema = z.object({
  title: z.string(),
  snippet: z.string(),
});
export type ShortNewsItem = z.infer<typeof ShortNewsItemSchema>;

export const AdvertisementDataSchema = z.object({
  sponsor: z.string().optional(),
  callToAction: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});
export type AdvertisementData = z.infer<typeof AdvertisementDataSchema>;

export const FrameMmSchema = z.object({
  /** Horizontal offset in mm from page top-left */
  x: z.number().min(0, 'Frame x must be >= 0'),
  /** Vertical offset in mm from page top-left */
  y: z.number().min(0, 'Frame y must be >= 0'),
  /** Width in mm (minimum 10mm) */
  w: z.number().min(10, 'Frame width must be at least 10mm'),
  /** Height in mm (minimum 10mm) */
  h: z.number().min(10, 'Frame height must be at least 10mm'),
  /** Stacking order z-index */
  z: z.number().int().default(1),
});

export type FrameMm = z.infer<typeof FrameMmSchema>;

export const ElementTypographySchema = z.object({
  fontFamily: z.string().optional(),
  fontSizePt: z.number().min(6).max(120).optional(),
  headlineFontSizePt: z.number().min(8).max(140).optional(),
  subheadlineFontSizePt: z.number().min(6).max(96).optional(),
  bodyFontSizePt: z.number().min(6).max(120).optional(),
  bylineFontSizePt: z.number().min(6).max(48).optional(),
  captionFontSizePt: z.number().min(6).max(48).optional(),
  fontWeight: z.string().optional(),
  headlineFontWeight: z.string().optional(),
  subheadlineFontWeight: z.string().optional(),
  bodyFontWeight: z.string().optional(),
  lineHeight: z.number().min(0.8).max(3.0).optional(),
  headlineLineHeight: z.number().min(0.8).max(3.0).optional(),
  subheadlineLineHeight: z.number().min(0.8).max(3.0).optional(),
  bodyLineHeight: z.number().min(0.8).max(3.0).optional(),
  letterSpacingPt: z.number().min(-2).max(10).optional(),
  headlineLetterSpacingPt: z.number().min(-2).max(10).optional(),
  subheadlineLetterSpacingPt: z.number().min(-2).max(10).optional(),
  bodyLetterSpacingPt: z.number().min(-2).max(10).optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  headlineTextAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  subheadlineTextAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  bodyTextAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  textColor: z.string().optional(),
  headlineColor: z.string().optional(),
  subheadlineColor: z.string().optional(),
  bodyColor: z.string().optional(),
  headlineFontFamily: z.string().optional(),
  subheadlineFontFamily: z.string().optional(),
  bodyFontFamily: z.string().optional(),
  headlineMarginTopPt: z.number().min(0).max(64).optional(),
  headlineMarginBottomPt: z.number().min(0).max(64).optional(),
  headlinePaddingPt: z.number().min(0).max(32).optional(),
  subheadlineMarginTopPt: z.number().min(0).max(64).optional(),
  subheadlineMarginBottomPt: z.number().min(0).max(64).optional(),
  subheadlinePaddingPt: z.number().min(0).max(32).optional(),
  headlineBorders: ElementBordersSchema.optional(),
  subheadlineBorders: ElementBordersSchema.optional(),
  bodyBorders: ElementBordersSchema.optional(),
  imageBorders: ElementBordersSchema.optional(),
  captionBorders: ElementBordersSchema.optional(),
  headlineBackgroundColor: z.string().optional(),
  subheadlineBackgroundColor: z.string().optional(),
  bodyBackgroundColor: z.string().optional(),
  paragraphSpacingPt: z.number().min(0).max(48).optional(),
  textIndentPt: z.number().min(0).max(64).optional(),
  bodyColumnCount: z.number().int().min(1).max(6).optional(),
  bodyColumnGapPt: z.number().min(0).max(48).optional(),
  bodyColumnRule: z.string().optional(),
  underline: z.boolean().optional(),
  textDecoration: z.enum(['none', 'underline', 'line-through']).optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export type ElementTypography = z.infer<typeof ElementTypographySchema>;

export type SelectedElementPart =
  'headline' | 'subheadline' | 'body' | 'image' | 'caption' | 'block' | null;

export const ContinuationTypeSchema = z.enum(['origin', 'continuation']);
export type ContinuationType = z.infer<typeof ContinuationTypeSchema>;

export const ArticleContinuationSchema = z.object({
  role: ContinuationTypeSchema.default('origin'),
  rootArticleId: z.string().min(1),
  continuationIndex: z.number().int().nonnegative().default(0),
  previousArticleId: z.string().optional(),
  nextArticleId: z.string().optional(),
  targetPageNumber: z.union([z.number().int().positive(), z.literal('auto')]).optional(),
  targetPageId: z.string().optional(),
  jumpToLabel: z.string().optional(),
  jumpFromLabel: z.string().optional(),
  jumpHeadline: z.string().optional(),
  paragraphRange: z.tuple([z.number().int().nonnegative(), z.number().int().positive()]).optional(),
  allowContinuation: z.boolean().default(true),
});

export type ArticleContinuation = z.infer<typeof ArticleContinuationSchema>;

export const ArticleSchema = z.object({
  id: z.string().min(1),
  elementType: ElementTypeSchema.optional(),
  headline: z.string().min(1, 'Headline is required'),
  subheadline: z.string().optional().default(''),
  body: z.string().min(1, 'Body text is required'),
  byline: z.string().optional().default(''),
  dateline: z.string().optional().default(''),
  imageUrl: z.string().optional(),
  imageCaption: z.string().optional().default(''),
  imageCredit: z.string().optional(),
  imagePlacement: ImagePlacementSchema.default('top'),
  imageLayout: ImageLayoutSchema.optional(),
  imageAspect: ImageAspectSchema.optional(),
  /** How the image fills its frame. 'cover' crops; 'contain' letterboxes; 'fill' stretches. */
  imageFit: ImageFitSchema.optional(),
  /**
   * Coarse 9-point focal-point preset, compatible with CSS object-position values.
   * Prefer imageFocalX / imageFocalY for precise positioning.
   */
  imageFocalPoint: ImageFocalPointSchema.optional(),
  /**
   * Precise horizontal focal point as a normalized value 0.0 (left) → 1.0 (right).
   * Overrides the coarse imageFocalPoint when present.
   */
  imageFocalX: z.number().min(0).max(1).optional(),
  /**
   * Precise vertical focal point as a normalized value 0.0 (top) → 1.0 (bottom).
   * Overrides the coarse imageFocalPoint when present.
   */
  imageFocalY: z.number().min(0).max(1).optional(),
  /** Column span within the 12-column grid engine (1 to 12) */
  columnSpan: z.number().int().min(1).max(12).default(6),
  priority: ArticlePrioritySchema.default('major'),
  orderIndex: z.number().int().default(0),

  /** Optional absolute frame in physical mm for free-placement layouts */
  frame: FrameMmSchema.optional(),

  // Independent 4-side borders
  borders: ElementBordersSchema.optional(),
  imageBorders: ElementBordersSchema.optional(),

  // Custom typography & styling
  backgroundColor: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  textColor: z.string().optional(),
  paddingPx: z.number().min(0).max(64).optional(),
  marginPx: z.number().min(0).max(64).optional(),
  kickerText: z.string().optional(),

  // Inner multi-column body flow (Phase 1)
  bodyColumnCount: z.number().int().min(1).max(6).optional(),
  bodyColumnGapPt: z.number().min(0).max(48).optional(),
  bodyColumnRule: z.string().optional(),

  // Dynamic Auto-fit & Manual Control per Block (Task 1 & 2)
  heightMode: z.enum(['auto', 'min-height', 'fixed']).optional(),
  customHeight: z.number().min(10).max(2500).optional(),
  maxLines: z.number().int().min(1).max(100).optional(),
  customFontSizePt: z.number().min(6).max(48).optional(),
  customHeadlineFontSizePt: z.number().min(10).max(96).optional(),
  customImageHeight: z.number().min(10).max(1500).optional(),
  fillSpace: z.boolean().optional(),
  customColors: z
    .object({
      headlineColor: z.string().optional(),
      subheadlineColor: z.string().optional(),
      bodyColor: z.string().optional(),
      bylineColor: z.string().optional(),
      kickerColor: z.string().optional(),
      borderColor: z.string().optional(),
      backgroundColor: z.string().optional(),
    })
    .optional(),

  // Specialized element payload
  rashifalItems: z.array(RashifalItemSchema).optional(),
  shortNewsItems: z.array(ShortNewsItemSchema).optional(),
  advertisementData: AdvertisementDataSchema.optional(),

  // Granular typography and mobile-first element control
  typography: ElementTypographySchema.optional(),
  paragraphTypography: z.record(z.string(), ElementTypographySchema).optional(),
  locked: z.boolean().optional(),
  lockSpan: z.boolean().optional(),
  lockPosition: z.boolean().optional(),
  isReserved: z.boolean().optional(),
  reservationType: z
    .enum(['editorial_whitespace', 'ad_placeholder', 'pullquote_slot', 'photo_sink'])
    .optional(),
  zIndex: z.number().int().optional(),
  imageAlignment: z.enum(['left', 'center', 'right', 'full']).optional(),
  continuation: ArticleContinuationSchema.optional(),
});

export type Article = z.infer<typeof ArticleSchema>;

/**
 * Computes the CSS `object-position` value from an Article's focal point fields.
 * Precise X/Y values (0-1) take priority over the coarse 9-point preset.
 * Falls back to 'center' when no focal point is set.
 */
export function getImageObjectPosition(
  article: Pick<Article, 'imageFocalX' | 'imageFocalY' | 'imageFocalPoint'>
): string {
  const hasExact = article.imageFocalX !== undefined || article.imageFocalY !== undefined;
  if (hasExact) {
    const x = Math.round((article.imageFocalX ?? 0.5) * 100);
    const y = Math.round((article.imageFocalY ?? 0.5) * 100);
    return `${x}% ${y}%`;
  }
  return article.imageFocalPoint ?? 'center';
}

/**
 * Returns the CSS `aspect-ratio` string for a given ImageAspect preset.
 */
export function getImageAspectRatio(aspect: Article['imageAspect']): string {
  switch (aspect) {
    case 'wide':
      return '16 / 9';
    case 'square':
      return '1 / 1';
    case 'portrait':
      return '3 / 4';
    case 'original':
      return 'auto';
    case 'standard':
    default:
      return '4 / 3';
  }
}

export function getPageDimensions(
  pageSize: PageSizePreset,
  orientation: PageOrientation = 'portrait',
  customDims?: Partial<PageDimensions>
): PageDimensions {
  if (
    pageSize === 'custom' &&
    customDims &&
    typeof customDims.widthPt === 'number' &&
    customDims.widthPt > 0 &&
    typeof customDims.heightPt === 'number' &&
    customDims.heightPt > 0
  ) {
    const isLandscape = orientation === 'landscape';
    const rawW = customDims.widthPt;
    const rawH = customDims.heightPt;
    const widthPt = isLandscape ? Math.max(rawW, rawH) : Math.min(rawW, rawH);
    const heightPt = isLandscape ? Math.min(rawW, rawH) : Math.max(rawW, rawH);
    const widthMm = Number(((widthPt * 25.4) / 72).toFixed(1));
    const heightMm = Number(((heightPt * 25.4) / 72).toFixed(1));
    const widthIn = Number((widthPt / 72).toFixed(4));
    const heightIn = Number((heightPt / 72).toFixed(4));
    const aspectRatio = widthPt / heightPt;
    return {
      widthPt,
      heightPt,
      widthMm,
      heightMm,
      widthIn,
      heightIn,
      aspectRatio,
      aspectRatioLabel: `${widthMm}×${heightMm}mm`,
      dpi: customDims.dpi ?? 300,
      grayscaleLevels: customDims.grayscaleLevels ?? 16,
    };
  }

  const def = PAGE_SIZE_DEFINITIONS[pageSize] ?? PAGE_SIZE_DEFINITIONS.broadsheet;
  const isLandscape = orientation === 'landscape';
  const widthPt = isLandscape ? def.heightPt : def.widthPt;
  const heightPt = isLandscape ? def.widthPt : def.heightPt;
  const widthMm = isLandscape ? def.heightMm : def.widthMm;
  const heightMm = isLandscape ? def.widthMm : def.heightMm;
  const widthIn = Number((widthPt / 72).toFixed(4));
  const heightIn = Number((heightPt / 72).toFixed(4));
  const aspectRatio = widthPt / heightPt;
  return {
    widthPt,
    heightPt,
    widthMm,
    heightMm,
    widthIn,
    heightIn,
    aspectRatio,
    aspectRatioLabel: isLandscape
      ? `${def.heightMm}×${def.widthMm}mm`
      : `${def.widthMm}×${def.heightMm}mm`,
    dpi: 300,
    grayscaleLevels: 16,
  };
}

export const MastheadRuleStyleSchema = z.enum([
  'ornate-double',
  'oxford-thick-thin',
  'classic-double',
  'single-hairline',
  'none',
]);
export type MastheadRuleStyle = z.infer<typeof MastheadRuleStyleSchema>;

export const MastheadAlignmentSchema = z.enum(['center', 'left', 'justified']);
export type MastheadAlignment = z.infer<typeof MastheadAlignmentSchema>;

export const MastheadEmblemSchema = z.enum([
  'none',
  'ashoka-chakra',
  'sun',
  'quill',
  'lion-capital',
  'custom',
]);
export type MastheadEmblem = z.infer<typeof MastheadEmblemSchema>;

export const MastheadConfigSchema = z.object({
  // Core title & branding
  title: z.string().min(1, 'Publication name is required').default('जनवाणी समाचार'),
  tagline: z.string().default('सत्य, निष्पक्षता और जनसेवा का प्रतीक'),
  subtitle: z.string().optional().default('सत्य, निष्पक्षता और जनसेवा का प्रतीक • स्थापना 1947'),
  establishmentYear: z.string().default('1947'),

  // Typography & Styling
  fontFamily: z.string().default("'Rozha One', serif"),
  fontSizePt: z.number().default(52),
  alignment: MastheadAlignmentSchema.default('center'),
  ruleStyle: MastheadRuleStyleSchema.default('ornate-double'),
  emblem: MastheadEmblemSchema.default('none'),
  customEmblemUrl: z.string().optional().default(''),

  // Weather & Air Quality
  weatherCity: z.string().default('नई दिल्ली'),
  temperature: z.string().default('25°C'),
  weatherCondition: z.string().default('साफ़ आसमान'),
  weatherNotice: z.string().optional().default('मौसम: साफ़ आसमान, 25°C'),
  airQuality: z.string().default('AQI 128 • मध्यम'),

  // Price & Registration
  price: z.string().optional().default('मूल्य ₹5.00'),
  postalRegNumber: z.string().default('पंजीयन सं. DL-11001/2026'),
  pageCountLabel: z.string().default('कुल पृष्ठ 8'),

  // Date, Volume & Edition
  dayOfWeek: z.string().default('बुधवार'),
  date: z.string().default(() => '28 अक्टूबर 2026'),
  volumeYear: z.string().default('वर्ष 78'),
  issueNumber: z.string().default('वर्ष 78 • अंक 142'),
  issueCount: z.string().default('अंक 142'),
  edition: z.string().default('प्रातःकालीन मुख्य संस्करण'),

  // Secondary header, announcement & publication metadata
  presetStyleId: z.string().optional(),
  announcementStripText: z.string().optional(),
  showAnnouncementStrip: z.boolean().optional(),
  websiteUrl: z.string().optional(),
  secondaryHeaderTitle: z.string().optional(),
  secondaryHeaderSubtitle: z.string().optional(),
  showSecondaryHeader: z.boolean().optional(),

  // Visibility toggles
  showTopStrip: z.boolean().default(true),
  showWeather: z.boolean().default(true),
  showAirQuality: z.boolean().default(true),
  showTagline: z.boolean().default(true),
  showEstablishment: z.boolean().default(true),
  showPrice: z.boolean().default(true),
  showPostalReg: z.boolean().default(true),
  showBottomStrip: z.boolean().default(true),
  showVolumeIssue: z.boolean().default(true),
  showDate: z.boolean().default(true),
  showEdition: z.boolean().default(true),
  showEmblem: z.boolean().default(false),
});

export type MastheadConfig = z.infer<typeof MastheadConfigSchema>;

export const NewspaperPresetIdSchema = z.enum([
  'classic-hindi-broadsheet',
  'modern-hindi-daily',
  'local-hindi-gazette',
  'classic-broadsheet',
  'modern-editorial',
  'compact-local',
]);

export type NewspaperPresetId = z.infer<typeof NewspaperPresetIdSchema>;

export const SpacingDensitySchema = z.enum(['compact', 'normal', 'spacious']);
export type SpacingDensity = z.infer<typeof SpacingDensitySchema>;

export const NewspaperThemeConfigSchema = z.object({
  id: z.string().default('classic-bw'),
  name: z.string().default('क्लासिक ब्लैक & वाइट'),
  mastheadColor: z.string().default('#111111'),
  headlineColor: z.string().default('#111111'),
  subheadlineColor: z.string().default('#333333'),
  bodyColor: z.string().default('#222222'),
  bylineColor: z.string().default('#555555'),
  kickerColor: z.string().default('#b91c1c'),
  borderColor: z.string().default('#c8c5bc'),
  pageBackground: z.string().default('#ffffff'),
});

export type NewspaperThemeConfig = z.infer<typeof NewspaperThemeConfigSchema>;

export const NEWSPAPER_THEME_PRESETS: NewspaperThemeConfig[] = [
  {
    id: 'classic-bw',
    name: 'क्लासिक ब्लैक & वाइट (Classic B&W)',
    mastheadColor: '#111111',
    headlineColor: '#111111',
    subheadlineColor: '#333333',
    bodyColor: '#222222',
    bylineColor: '#555555',
    kickerColor: '#b91c1c',
    borderColor: '#c8c5bc',
    pageBackground: '#ffffff',
  },
  {
    id: 'deep-blue',
    name: 'संपादकीय डीप ब्लू (Editorial Deep Blue)',
    mastheadColor: '#1e3a8a',
    headlineColor: '#1e3a8a',
    subheadlineColor: '#1d4ed8',
    bodyColor: '#1e293b',
    bylineColor: '#475569',
    kickerColor: '#2563eb',
    borderColor: '#93c5fd',
    pageBackground: '#f8fafc',
  },
  {
    id: 'warm-sepia',
    name: 'प्राचीन सेपिया (Warm Sepia)',
    mastheadColor: '#451a03',
    headlineColor: '#78350f',
    subheadlineColor: '#92400e',
    bodyColor: '#3f2e1a',
    bylineColor: '#78350f',
    kickerColor: '#b45309',
    borderColor: '#fde68a',
    pageBackground: '#fffbeb',
  },
  {
    id: 'editorial-crimson',
    name: 'संपादकीय सुर्ख (Editorial Crimson)',
    mastheadColor: '#991b1b',
    headlineColor: '#7f1d1d',
    subheadlineColor: '#991b1b',
    bodyColor: '#1c1917',
    bylineColor: '#57534e',
    kickerColor: '#dc2626',
    borderColor: '#fca5a5',
    pageBackground: '#ffffff',
  },
];

export const ColumnRuleStyleSchema = z.enum(['solid', 'dashed', 'none']);
export type ColumnRuleStyle = z.infer<typeof ColumnRuleStyleSchema>;

export const NewspaperLayoutConfigSchema = z.object({
  presetId: NewspaperPresetIdSchema.default('classic-hindi-broadsheet'),
  /** Standard 12-column newspaper layout engine (2 to 12 columns) */
  columnCount: z.number().int().min(2).max(12).default(12),
  columnRule: z.boolean().default(true),
  columnRuleStyle: ColumnRuleStyleSchema.optional().default('solid'),
  gridRowLayouts: z.array(z.string()).optional(),
  mastheadFont: z.string().default("'Rozha One', serif"),
  headlineFont: z.string().default("'Noto Serif Devanagari', serif"),
  subheadlineFont: z.string().default("'Noto Serif Devanagari', serif"),
  bodyFont: z.string().default("'Noto Serif Devanagari', serif"),
  headlineWeight: z.number().int().min(300).max(900).default(700),
  bodyFontSizePt: z.number().min(8).max(16).default(10),
  spacingDensity: SpacingDensitySchema.default('normal'),
  margins: PageMarginsSchema.optional(),
  showFooter: z.boolean().default(true),
  footerText: z.string().optional().default(''),
  theme: NewspaperThemeConfigSchema.optional(),
});

export type NewspaperLayoutConfig = z.infer<typeof NewspaperLayoutConfigSchema>;

export const NewspaperMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Project title is required').default('दैनिक नवप्रभात'),
  language: z.string().default('hi'),
  direction: z.enum(['ltr', 'rtl']).default('ltr'),
  pageSize: PageSizePresetSchema.default('broadsheet'),
  orientation: PageOrientationSchema.default('portrait'),
  dimensions: PageDimensionsSchema.optional(),
  templateId: z.string().optional(),
  editionId: z.string().optional(),
  editionDate: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type NewspaperMetadata = z.infer<typeof NewspaperMetadataSchema>;

export const NewspaperBlockTypeSchema = z.enum([
  'masthead',
  'lead',
  'major',
  'minor',
  'brief',
  'photo',
  'editorial',
  'notice',
]);
export type NewspaperBlockType = z.infer<typeof NewspaperBlockTypeSchema>;

export const PageLayoutModeSchema = z.enum(['auto', 'free']);
export type PageLayoutMode = z.infer<typeof PageLayoutModeSchema>;

export const NewspaperPageSchema = z.object({
  id: z.string().min(1),
  pageNumber: z.number().int().positive(),
  sectionTitle: z.string().optional().default('मुख्य पृष्ठ'),
  layoutMode: PageLayoutModeSchema.optional().default('auto'),
  articles: z.array(ArticleSchema).default([]),
  columnCount: z.number().int().min(2).max(12).optional(),
});

export type NewspaperPage = z.infer<typeof NewspaperPageSchema>;

export const DocumentSchemaVersionSchema = z.enum(['1.0.0', '1.1.0']);
export type DocumentSchemaVersion = z.infer<typeof DocumentSchemaVersionSchema>;

export const NewspaperDocumentSchema = z.object({
  version: DocumentSchemaVersionSchema.optional().default('1.1.0'),
  schemaVersion: DocumentSchemaVersionSchema.optional().default('1.1.0'),
  id: z.string().min(1),
  metadata: NewspaperMetadataSchema,
  masthead: MastheadConfigSchema,
  layout: NewspaperLayoutConfigSchema,
  theme: NewspaperThemeConfigSchema.optional(),
  templateId: z.string().optional(),
  editionId: z.string().optional(),
  editionDate: z.string().optional(),
  articles: z.array(ArticleSchema).default([]),
  pages: z.array(NewspaperPageSchema).optional(),
});

export type NewspaperDocument = z.infer<typeof NewspaperDocumentSchema>;

/**
 * Returns an array of discrete pages from a NewspaperDocument.
 * If explicit `pages` exist and are non-empty, returns `doc.pages` as-is.
 * Otherwise, wraps root `doc.articles` in a single page model for backward compatibility.
 * Notice: Per-page columnCount is kept undefined on fabricated fallback pages so that
 * it explicitly inherits doc.layout.columnCount dynamically via resolvePageColumnCount(doc, page).
 */
export function getPublicationPages(doc: NewspaperDocument): NewspaperPage[] {
  if (doc.pages && doc.pages.length > 0) {
    return doc.pages;
  }
  return [
    {
      id: 'page-1',
      pageNumber: 1,
      sectionTitle: doc.metadata.language === 'hi' ? 'मुख्य पृष्ठ' : 'Front Page',
      layoutMode: 'auto',
      articles: doc.articles,
      columnCount: undefined,
    },
  ];
}

/**
 * Creates a new blank NewspaperPage with a unique ID and designated page number.
 */
export function createNewBlankPage(
  pageNumber: number,
  options: { sectionTitle?: string; language?: string; layoutMode?: PageLayoutMode } = {}
): NewspaperPage {
  const isHindi = options.language === 'hi';
  const defaultTitle =
    options.sectionTitle ??
    (isHindi
      ? pageNumber === 1
        ? 'मुख्य पृष्ठ'
        : pageNumber === 2
          ? 'संपादकीय एवं विचार'
          : pageNumber === 3
            ? 'देश एवं विदेश'
            : pageNumber === 4
              ? 'व्यापार एवं खेल'
              : `पृष्ठ ${pageNumber}`
      : pageNumber === 1
        ? 'Front Page'
        : pageNumber === 2
          ? 'Opinion & Editorial'
          : pageNumber === 3
            ? 'National & World'
            : pageNumber === 4
              ? 'Business & Sports'
              : `Page ${pageNumber}`);

  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    pageNumber,
    sectionTitle: defaultTitle,
    layoutMode: options.layoutMode ?? 'auto',
    articles: [],
  };
}

/**
 * Resolves the effective column count for a page, prioritizing page-level override,
 * falling back to document layout column count, and finally defaulting to 12.
 * Clamps result between 2 and 12 columns.
 */
export function resolvePageColumnCount(
  docOrLayout?: {
    layout?: { columnCount?: number | null } | null;
    columnCount?: number | null;
  } | null,
  page?: { columnCount?: number | null } | null
): number {
  const layoutColCount =
    docOrLayout && 'layout' in docOrLayout && docOrLayout.layout
      ? docOrLayout.layout.columnCount
      : (docOrLayout as { columnCount?: number | null } | null | undefined)?.columnCount;
  return Math.max(2, Math.min(12, page?.columnCount ?? layoutColCount ?? 12));
}

/**
 * Upgrades legacy 1.0.0 documents to 1.1.0, preserving all existing
 * properties and ensuring every page has an explicit layoutMode ('auto').
 */
export function migrateDocumentSchema(doc: unknown): NewspaperDocument {
  if (!doc || typeof doc !== 'object') {
    throw new Error('Invalid document object for migration');
  }
  const raw = doc as Record<string, unknown>;
  const articles = Array.isArray(raw.articles) ? raw.articles : [];

  let pages: unknown[] | undefined;
  if (Array.isArray(raw.pages) && raw.pages.length > 0) {
    pages = raw.pages.map((p: unknown, idx: number) => {
      if (!p || typeof p !== 'object') return p;
      const pageObj = p as Record<string, unknown>;
      return {
        ...pageObj,
        pageNumber: typeof pageObj.pageNumber === 'number' ? pageObj.pageNumber : idx + 1,
        layoutMode: pageObj.layoutMode ?? 'auto',
      };
    });
  } else if (articles.length > 0) {
    const isHindi = (raw.metadata as Record<string, unknown> | undefined)?.language === 'hi';
    pages = [
      {
        id: 'page-1',
        pageNumber: 1,
        sectionTitle: isHindi ? 'मुख्य पृष्ठ' : 'Front Page',
        layoutMode: 'auto',
        articles,
      },
    ];
  }

  const migrated = {
    ...raw,
    version: '1.1.0',
    schemaVersion: '1.1.0',
    articles,
    pages,
  };
  return NewspaperDocumentSchema.parse(migrated);
}

export interface PrintableAreaBoundsMm {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  contentWidth: number;
  contentHeight: number;
}

/**
 * Derives the printable area bounding box in millimeters from page dimensions and margins.
 */
export function getPrintableAreaBoundsMm(
  pageSize: PageSizePreset,
  orientation: PageOrientation = 'portrait',
  options: {
    paddingPt?: number;
    headerHeightPt?: number;
    footerHeightPt?: number;
  } = {}
): PrintableAreaBoundsMm {
  const dims = getPageDimensions(pageSize, orientation);
  const pageW = dims.widthMm ?? (dims.widthPt * 25.4) / 72;
  const pageH = dims.heightMm ?? (dims.heightPt * 25.4) / 72;
  const paddingMm = ((options.paddingPt ?? 24) * 25.4) / 72;
  const headerHeightMm = ((options.headerHeightPt ?? 0) * 25.4) / 72;
  const footerHeightMm = ((options.footerHeightPt ?? 0) * 25.4) / 72;

  const minX = Number(paddingMm.toFixed(2));
  const maxX = Number((pageW - paddingMm).toFixed(2));
  const minY = Number((paddingMm + headerHeightMm).toFixed(2));
  const maxY = Number((pageH - paddingMm - footerHeightMm).toFixed(2));

  return {
    minX,
    maxX,
    minY,
    maxY,
    contentWidth: Number((maxX - minX).toFixed(2)),
    contentHeight: Number((maxY - minY).toFixed(2)),
  };
}

/**
 * Validates that an article frame lies completely inside the page's printable area.
 */
export function validateFrameInsidePrintableArea(
  frame: FrameMm,
  bounds: PrintableAreaBoundsMm,
  toleranceMm: number = 0.5
): { valid: boolean; reason?: string } {
  if (frame.x < bounds.minX - toleranceMm) {
    return {
      valid: false,
      reason: `Frame x (${frame.x}mm) exceeds left margin (${bounds.minX}mm)`,
    };
  }
  if (frame.y < bounds.minY - toleranceMm) {
    return {
      valid: false,
      reason: `Frame y (${frame.y}mm) encroaches into header zone (${bounds.minY}mm)`,
    };
  }
  if (frame.x + frame.w > bounds.maxX + toleranceMm) {
    return {
      valid: false,
      reason: `Frame right edge (${(frame.x + frame.w).toFixed(1)}mm) exceeds right margin (${bounds.maxX}mm)`,
    };
  }
  if (frame.y + frame.h > bounds.maxY + toleranceMm) {
    return {
      valid: false,
      reason: `Frame bottom edge (${(frame.y + frame.h).toFixed(1)}mm) exceeds bottom margin/footer (${bounds.maxY}mm)`,
    };
  }
  return { valid: true };
}

/**
 * Strictly clamps an article frame to lie completely inside the printable area.
 */
export function clampFrameToPrintableArea(frame: FrameMm, bounds: PrintableAreaBoundsMm): FrameMm {
  const maxW = Math.max(10, bounds.contentWidth);
  const maxH = Math.max(10, bounds.contentHeight);
  const w = Math.min(Math.max(10, frame.w), maxW);
  const h = Math.min(Math.max(10, frame.h), maxH);
  const x = Math.min(Math.max(bounds.minX, frame.x), bounds.maxX - w);
  const y = Math.min(Math.max(bounds.minY, frame.y), bounds.maxY - h);

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    w: Number(w.toFixed(2)),
    h: Number(h.toFixed(2)),
    z: frame.z ?? 1,
  };
}

/* ====================================================================
 * Master Template & Daily Edition Publishing Architecture (Phase 1)
 * ==================================================================== */

export const TemplatePageBlueprintSchema = z.object({
  pageNumber: z.number().int().positive(),
  sectionTitle: z.string().default('मुख्य पृष्ठ'),
  layoutMode: PageLayoutModeSchema.default('auto'),
  columnCount: z.number().int().min(2).max(12).optional(),
  defaultArticles: z.array(ArticleSchema).default([]),
});

export type TemplatePageBlueprint = z.infer<typeof TemplatePageBlueprintSchema>;

export const MasterTemplateCategorySchema = z.enum([
  'broadsheet',
  'tabloid',
  'evening',
  'commercial',
  'magazine',
  'custom',
]);

export type MasterTemplateCategory = z.infer<typeof MasterTemplateCategorySchema>;

export const MasterTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional().default(''),
  category: MasterTemplateCategorySchema.default('custom'),
  presetId: NewspaperPresetIdSchema.default('classic-hindi-broadsheet'),
  pageSize: PageSizePresetSchema.default('broadsheet'),
  orientation: PageOrientationSchema.default('portrait'),
  dimensions: PageDimensionsSchema.optional(),
  isBuiltIn: z.boolean().default(false),
  masthead: MastheadConfigSchema,
  layout: NewspaperLayoutConfigSchema,
  theme: NewspaperThemeConfigSchema.optional(),
  pageBlueprints: z.array(TemplatePageBlueprintSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MasterTemplate = z.infer<typeof MasterTemplateSchema>;

export const DailyEditionSchema = z.object({
  id: z.string().min(1),
  templateId: z.string().min(1),
  templateName: z.string().optional(),
  editionName: z.string().min(1).default('मुख्य संस्करण'),
  editionDate: z.string().min(1),
  publicationName: z.string().min(1).default('जनवाणी समाचार'),
  volumeNumber: z.number().int().positive().optional(),
  issueNumber: z.number().int().positive().optional(),
  document: NewspaperDocumentSchema,
  saveStatus: z.enum(['saved', 'draft', 'modified']).default('saved'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DailyEdition = z.infer<typeof DailyEditionSchema>;

/* ====================================================================
 * PDF Preflight & Quality Assurance Specification (Phase 1)
 * ==================================================================== */

export const PreflightSeveritySchema = z.enum(['green', 'yellow', 'red']);
export type PreflightSeverity = z.infer<typeof PreflightSeveritySchema>;

export const PreflightCheckTypeSchema = z.enum([
  'text_overflow',
  'page_boundaries',
  'missing_images',
  'low_res_images',
  'font_availability',
  'font_embedding',
  'hindi_rendering',
  'empty_blocks',
  'page_dimensions',
  'invalid_page_config',
  'outdated_date',
  'blank_pages',
  'layout_overset',
  'continuation_broken',
  'continuation_text_mismatch',
  'continuation_target_invalid',
]);

export type PreflightCheckType = z.infer<typeof PreflightCheckTypeSchema>;

export const PreflightIssueSchema = z.object({
  id: z.string(),
  type: PreflightCheckTypeSchema,
  severity: PreflightSeveritySchema,
  pageIndex: z.number().int().nonnegative().optional(),
  pageNumber: z.number().int().positive().optional(),
  articleId: z.string().optional(),
  headline: z.string().optional(),
  title: z.string(),
  explanation: z.string(),
  suggestedCorrection: z.string(),
  autoFixAvailable: z.boolean().default(false),
  autoFixType: z.string().optional(),
});

export type PreflightIssue = z.infer<typeof PreflightIssueSchema>;

export const PreflightReportSchema = z.object({
  timestamp: z.string(),
  overallStatus: PreflightSeveritySchema,
  totalChecks: z.number(),
  passedChecks: z.number(),
  warningCount: z.number(),
  errorCount: z.number(),
  issues: z.array(PreflightIssueSchema),
  canExport: z.boolean(),
});

export type PreflightReport = z.infer<typeof PreflightReportSchema>;
