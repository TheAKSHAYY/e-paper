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

  describe('findUnsupportedCharacters', () => {
    it('should confirm all required Hindi typography test glyphs are supported', async () => {
      const { findUnsupportedCharacters } = await import('./index');

      // Task 4 required test characters:
      // ₹, Devanagari digits ०१२३४५६७८९, danda । and double danda ॥,
      // curly quotes “ ” ‘ ’, en/em dash – —, ZWJ/ZWNJ sequences,
      // "क्ष त्र ज्ञ श्र" ligatures, nukta letters (क़ ख़ ग़ ज़ ड़ ढ़ फ़), and plain English line
      const richHindiTestText =
        'मूल्य: ₹५०,००० • अंक: ०१२३४५६७८९ । संपूर्ण विराम ॥ ' +
        '“उद्धरण चिन्ह” एवं ‘एकल उद्धरण’ – लघु डैश — दीर्घ डैश • ' +
        'संयुक्ताक्षर: क्षत्रिय, श्रद्धा, द्वारा, कर्त्ता (ZWJ/ZWNJ: \u200D \u200C) ' +
        'नुक्ता अक्षर: क़िस्सा, ख़ास, ग़लत, ज़मीन, पेड़, चढ़ाई, फ़ैसला। ' +
        'Plain English headline text 123.';

      const unsupported = findUnsupportedCharacters(richHindiTestText, [
        'Noto Serif Devanagari',
        'Hind',
      ]);
      expect(unsupported).toEqual([]);
    });

    it('should detect unsupported characters outside the self-hosted font coverage', async () => {
      const { findUnsupportedCharacters } = await import('./index');

      // Include unsupported characters: CJK ideograph (你好), Emoji (🚀), Armenian (Ա)
      const textWithUnsupported = 'शुभ प्रभात 你好 🚀 Test Ա';
      const unsupported = findUnsupportedCharacters(textWithUnsupported, ['Hind']);

      expect(unsupported.length).toBeGreaterThanOrEqual(3);
      const chars = unsupported.map((u) => u.char);
      expect(chars).toContain('你');
      expect(chars).toContain('好');
      expect(chars).toContain('Ա');

      const ni = unsupported.find((u) => u.char === '你');
      expect(ni?.codePoint).toBe('U+4F60');
    });

    it('should detect Devanagari characters when used with Latin-only font stacks', async () => {
      const { findUnsupportedCharacters } = await import('./index');

      const hindiText = 'नमस्ते भारत';
      const unsupported = findUnsupportedCharacters(hindiText, ['Playfair Display']);

      expect(unsupported.length).toBeGreaterThan(0);
      expect(unsupported[0].codePoint).toMatch(/^U\+09/);
    });
  });
});
