import { describe, it, expect } from 'vitest';
import { THEME_TOKENS, DeviceBadge } from './index';

describe('UI package', () => {
  it('should export theme tokens matching paper and newspaper aesthetics', () => {
    expect(THEME_TOKENS.einkBackground).toBe('#f8f8f6');
    expect(THEME_TOKENS.einkTextPrimary).toBe('#111111');
    expect(THEME_TOKENS.newsprintBackground).toBe('#ffffff');
    expect(THEME_TOKENS.inkPrimary).toBe('#111111');
    expect(THEME_TOKENS.accentCrimson).toBe('#8b0000');
    expect(THEME_TOKENS.accentNavy).toBe('#104e8b');
  });

  it('should provide DeviceBadge component constructor', () => {
    expect(typeof DeviceBadge).toBe('function');
  });
});
