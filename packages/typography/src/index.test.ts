import { describe, it, expect } from 'vitest';
import {
  resolveFontFallback,
  DEFAULT_EPAPER_FONTS,
  SELF_HOSTED_FONT_FAMILIES,
  SELF_HOSTED_FONTS_CSS,
} from './index';

describe('Typography', () => {
  it('should list e-ink optimized font definitions with valid weights', () => {
    expect(DEFAULT_EPAPER_FONTS.length).toBeGreaterThan(0);
    const literata = DEFAULT_EPAPER_FONTS.find((f) => f.family === 'Literata');
    expect(literata).toBeDefined();
    expect(literata?.weights).toContain(400);
  });

  it('should resolve fallback font for Arabic and CJK scripts', () => {
    expect(resolveFontFallback('arabic')).toBe('Noto Naskh Arabic');
    expect(resolveFontFallback('cjk')).toBe('Noto Sans CJK');
    expect(resolveFontFallback('devanagari')).toBe('Noto Serif Devanagari');
  });

  it('should export all 10 required self-hosted font families and valid @font-face CSS', () => {
    expect(SELF_HOSTED_FONT_FAMILIES).toHaveLength(10);
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Rozha One');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Yatra One');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Noto Serif Devanagari');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Tiro Devanagari Hindi');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Poppins');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Mukta');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Hind');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Gotu');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Playfair Display');
    expect(SELF_HOSTED_FONT_FAMILIES).toContain('Source Serif 4');

    expect(SELF_HOSTED_FONTS_CSS).toContain('font-display: swap;');
    expect(SELF_HOSTED_FONTS_CSS).toContain('/fonts/');
    for (const family of SELF_HOSTED_FONT_FAMILIES) {
      expect(SELF_HOSTED_FONTS_CSS).toContain(`font-family: '${family}'`);
    }
  });
});

