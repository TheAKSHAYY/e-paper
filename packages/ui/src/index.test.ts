import { describe, it, expect } from 'vitest';
import { THEME_TOKENS, DeviceBadge } from './index';

describe('UI package', () => {
  it('should export theme tokens matching paper aesthetics', () => {
    expect(THEME_TOKENS.einkBackground).toBe('#f8f8f6');
    expect(THEME_TOKENS.einkTextPrimary).toBe('#111111');
  });

  it('should provide DeviceBadge component constructor', () => {
    expect(typeof DeviceBadge).toBe('function');
  });
});
