import {
  MasterTemplateSchema,
  type MasterTemplate,
  type NewspaperPresetId,
} from '@epaper-studio/document-schema';
import { getBuiltInMasterTemplates } from '@epaper-studio/template-engine';
import type { TemplateStorageAdapter, TemplateSummary } from './types';

const TEMPLATES_INDEX_KEY = 'epaper_studio_templates_index_v1';
const TEMPLATE_DATA_KEY_PREFIX = 'epaper_studio_template_doc_v1_';

export class LocalStorageTemplateAdapter implements TemplateStorageAdapter {
  private isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__storage_test_tpl__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public async listTemplates(): Promise<TemplateSummary[]> {
    const builtinTemplates = getBuiltInMasterTemplates();
    const builtinSummaries: TemplateSummary[] = builtinTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      presetId: t.presetId,
      pageSize: t.pageSize,
      isBuiltIn: true,
      updatedAt: t.updatedAt,
      pageCount: t.pageBlueprints.length,
    }));

    if (!this.isStorageAvailable()) {
      return builtinSummaries;
    }

    try {
      const rawIndex = window.localStorage.getItem(TEMPLATES_INDEX_KEY);
      if (!rawIndex) {
        return builtinSummaries;
      }
      const parsed: unknown = JSON.parse(rawIndex);
      if (!Array.isArray(parsed)) {
        return builtinSummaries;
      }

      const customSummaries = (parsed as TemplateSummary[]).filter(
        (item) => typeof item === 'object' && item !== null && typeof item.id === 'string'
      );

      // Custom templates first (newest updated), followed by built-in templates
      customSummaries.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      return [...customSummaries, ...builtinSummaries];
    } catch (err) {
      console.warn('Failed to parse templates index from localStorage:', err);
      return builtinSummaries;
    }
  }

  public async getTemplate(id: string): Promise<MasterTemplate | null> {
    // 1. Check built-in templates first if ID matches builtin prefix
    const builtin = getBuiltInMasterTemplates().find((t) => t.id === id);
    if (builtin) {
      return JSON.parse(JSON.stringify(builtin));
    }

    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const rawData = window.localStorage.getItem(`${TEMPLATE_DATA_KEY_PREFIX}${id}`);
      if (!rawData) {
        return null;
      }

      const parsed: unknown = JSON.parse(rawData);
      const validation = MasterTemplateSchema.safeParse(parsed);
      if (!validation.success) {
        console.warn(`Template ${id} failed validation:`, validation.error);
        return null;
      }

      return validation.data;
    } catch (err) {
      console.error(`Error loading template ${id}:`, err);
      return null;
    }
  }

  public async saveTemplate(template: MasterTemplate): Promise<void> {
    if (!this.isStorageAvailable()) {
      throw new Error('Local browser storage is unavailable in this environment.');
    }

    const validation = MasterTemplateSchema.safeParse(template);
    if (!validation.success) {
      throw new Error(`Cannot save invalid master template: ${validation.error.message}`);
    }

    const validTemplate = validation.data;
    const now = new Date().toISOString();
    validTemplate.updatedAt = now;
    validTemplate.isBuiltIn = false; // User-saved templates are never built-in

    const summary: TemplateSummary = {
      id: validTemplate.id,
      name: validTemplate.name,
      description: validTemplate.description,
      category: validTemplate.category,
      presetId: validTemplate.presetId,
      pageSize: validTemplate.pageSize,
      isBuiltIn: false,
      updatedAt: now,
      pageCount: validTemplate.pageBlueprints.length,
    };

    try {
      window.localStorage.setItem(
        `${TEMPLATE_DATA_KEY_PREFIX}${validTemplate.id}`,
        JSON.stringify(validTemplate)
      );

      // Update custom templates index
      const rawIndex = window.localStorage.getItem(TEMPLATES_INDEX_KEY);
      let existingCustom: TemplateSummary[] = [];
      if (rawIndex) {
        try {
          existingCustom = JSON.parse(rawIndex);
        } catch {
          existingCustom = [];
        }
      }

      const updatedCustom = existingCustom.filter((t) => t.id !== validTemplate.id);
      updatedCustom.unshift(summary);

      window.localStorage.setItem(TEMPLATES_INDEX_KEY, JSON.stringify(updatedCustom));
    } catch (err) {
      console.error(`Failed to save template ${validTemplate.id}:`, err);
      throw err;
    }
  }

  public async deleteTemplate(id: string): Promise<void> {
    if (!this.isStorageAvailable()) {
      return;
    }

    // Safety: Cannot delete built-in templates
    if (id.startsWith('builtin-template-')) {
      throw new Error('Built-in system templates cannot be deleted.');
    }

    try {
      window.localStorage.removeItem(`${TEMPLATE_DATA_KEY_PREFIX}${id}`);
      const rawIndex = window.localStorage.getItem(TEMPLATES_INDEX_KEY);
      if (rawIndex) {
        const existingCustom: TemplateSummary[] = JSON.parse(rawIndex);
        const updatedCustom = existingCustom.filter((t) => t.id !== id);
        window.localStorage.setItem(TEMPLATES_INDEX_KEY, JSON.stringify(updatedCustom));
      }
    } catch (err) {
      console.error(`Failed to delete template ${id}:`, err);
      throw err;
    }
  }

  public async restoreBuiltInTemplate(presetId: NewspaperPresetId): Promise<MasterTemplate> {
    const builtin = getBuiltInMasterTemplates().find((t) => t.presetId === presetId);
    if (!builtin) {
      throw new Error(`Built-in template for preset ${presetId} not found.`);
    }
    return JSON.parse(JSON.stringify(builtin));
  }
}

export const templateStorage = new LocalStorageTemplateAdapter();
