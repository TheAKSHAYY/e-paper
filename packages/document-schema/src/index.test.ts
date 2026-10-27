import { describe, it, expect } from 'vitest';
import { MinimalDocumentSchema, SupportedDeviceSchema } from './index';

describe('DocumentSchema', () => {
  it('should validate a valid minimal e-paper document', () => {
    const validDoc = {
      schemaVersion: '1.0.0',
      metadata: {
        title: 'Morning Briefing',
        language: 'en',
        direction: 'ltr',
        device: 'remarkable-2',
        orientation: 'portrait',
      },
      pages: [],
    };

    const parsed = MinimalDocumentSchema.safeParse(validDoc);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid device target', () => {
    const invalidResult = SupportedDeviceSchema.safeParse('unsupported-device-xyz');
    expect(invalidResult.success).toBe(false);
  });
});
