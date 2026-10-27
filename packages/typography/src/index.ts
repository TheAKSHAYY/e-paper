export type WritingScript = 'latin' | 'cyrillic' | 'arabic' | 'hebrew' | 'cjk' | 'devanagari';

export interface FontDefinition {
  family: string;
  sourceUrl?: string;
  weights: number[];
  optimalDpiRange: [number, number];
  scripts: WritingScript[];
}

export interface FontCascadeConfig {
  primarySerif: string;
  primarySans: string;
  fallbackMono: string;
  scriptOverrides: Partial<Record<WritingScript, string>>;
}

export const DEFAULT_EPAPER_FONTS: FontDefinition[] = [
  {
    family: 'Literata',
    weights: [400, 600, 700],
    optimalDpiRange: [200, 300],
    scripts: ['latin', 'cyrillic'],
  },
  {
    family: 'Newsreader',
    weights: [400, 500, 700],
    optimalDpiRange: [220, 300],
    scripts: ['latin'],
  },
  {
    family: 'Noto Sans CJK',
    weights: [400, 700],
    optimalDpiRange: [200, 300],
    scripts: ['cjk'],
  },
  {
    family: 'Noto Naskh Arabic',
    weights: [400, 700],
    optimalDpiRange: [200, 300],
    scripts: ['arabic'],
  },
  {
    family: 'Noto Serif Devanagari',
    weights: [400, 600, 700],
    optimalDpiRange: [200, 300],
    scripts: ['devanagari'],
  },
];

export function resolveFontFallback(script: WritingScript): string {
  const matched = DEFAULT_EPAPER_FONTS.find((f) => f.scripts.includes(script));
  return matched ? matched.family : 'serif';
}
