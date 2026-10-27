import type { MinimalDocument, SupportedDevice } from '@epaper-studio/document-schema';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'newspaper' | 'digest' | 'dashboard' | 'planner' | 'crossword';
  targetDevice: SupportedDevice;
  defaultOrientation: 'portrait' | 'landscape';
}

export interface RenderContext {
  locale: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface TemplateCompileResult {
  success: boolean;
  document: MinimalDocument;
  warnings: string[];
}

/**
 * Placeholder compiler interface for turning templates into canonical e-paper documents.
 */
export function compileTemplate(
  template: TemplateDefinition,
  context: RenderContext
): TemplateCompileResult {
  const minimalDoc: MinimalDocument = {
    schemaVersion: '1.0.0',
    metadata: {
      title: `${template.name} - ${context.timestamp}`,
      language: context.locale,
      direction: 'ltr',
      device: template.targetDevice,
      orientation: template.defaultOrientation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    pages: [],
  };

  return {
    success: true,
    document: minimalDoc,
    warnings: [],
  };
}
