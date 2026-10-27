import { describe, it, expect } from 'vitest';
import { DEVICE_PROFILES, SAMPLE_EPAPER_DOCUMENT } from './index';

describe('TestFixtures', () => {
  it('should provide accurate device profiles for e-paper targets', () => {
    expect(DEVICE_PROFILES['kindle-scribe']?.dpi).toBe(300);
    expect(DEVICE_PROFILES['remarkable-2']?.grayscaleLevels).toBe(16);
  });

  it('should provide a valid sample e-paper document', () => {
    expect(SAMPLE_EPAPER_DOCUMENT.schemaVersion).toBe('1.0.0');
    expect(SAMPLE_EPAPER_DOCUMENT.metadata.title).toBeDefined();
  });
});
