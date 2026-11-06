import { describe, it, expect } from 'vitest';
import { THEME_TOKENS, DeviceBadge, getUiTypographyStyle } from './index';

describe('UI package', () => {
  it('should export theme tokens matching paper and newspaper aesthetics', () => {
    expect(THEME_TOKENS.einkBackground).toBe('#f8f8f6');
    expect(THEME_TOKENS.einkTextPrimary).toBe('#111111');
    expect(THEME_TOKENS.newsprintBackground).toBe('#ffffff');
    expect(THEME_TOKENS.inkPrimary).toBe('#111111');
    expect(THEME_TOKENS.accentCrimson).toBe('#8b0000');
    expect(THEME_TOKENS.accentNavy).toBe('#104e8b');
    expect(THEME_TOKENS.warmPaper).toBe('#F4F0E7');
    expect(THEME_TOKENS.inkBlack).toBe('#171717');
    expect(THEME_TOKENS.pressRed).toBe('#9E3029');
    expect(THEME_TOKENS.mutedPaper).toBe('#E6E0D5');
    expect(THEME_TOKENS.pageWhite).toBe('#FFFFFF');
  });

  it('should provide DeviceBadge component constructor', () => {
    expect(typeof DeviceBadge).toBe('function');
  });

  it('should compute script-aware UI typography styles without matra clipping', () => {
    const enDisplay = getUiTypographyStyle('display', 'en', true);
    expect(enDisplay.fontFamily).toContain('Playfair Display');
    expect(enDisplay.letterSpacing).toBe('-0.03em');
    expect(enDisplay.lineHeight).toBe(1.12);

    const hiDisplay = getUiTypographyStyle('display', 'hi', true);
    expect(hiDisplay.fontFamily).toContain('Rozha One');
    expect(hiDisplay.letterSpacing).toBe('0em'); // No letter spacing for Devanagari to avoid broken matras
    expect(hiDisplay.lineHeight).toBe(1.3); // Safe matra clearance

    const hiBody = getUiTypographyStyle('body', 'hi');
    expect(hiBody.fontFamily).toContain('Hind');
    expect(hiBody.lineHeight).toBe(1.6);
  });
});
