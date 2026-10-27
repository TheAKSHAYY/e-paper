import { describe, it, expect } from 'vitest';
import { compileTemplate, TemplateDefinition, RenderContext } from './index';

describe('TemplateEngine', () => {
  it('should compile a basic template into a minimal document structure', () => {
    const template: TemplateDefinition = {
      id: 'daily-chronicle',
      name: 'Daily Chronicle',
      category: 'newspaper',
      targetDevice: 'kindle-scribe',
      defaultOrientation: 'portrait',
    };

    const context: RenderContext = {
      locale: 'en',
      timestamp: '2026-10-27',
      data: { headlines: ['Breaking News'] },
    };

    const result = compileTemplate(template, context);
    expect(result.success).toBe(true);
    expect(result.document.metadata.device).toBe('kindle-scribe');
    expect(result.document.metadata.title).toContain('Daily Chronicle');
  });
});
