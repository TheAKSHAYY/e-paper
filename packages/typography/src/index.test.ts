import { describe, it, expect } from 'vitest';
import { resolveFontFallback, DEFAULT_EPAPER_FONTS } from './index';

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
});
