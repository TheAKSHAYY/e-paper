import type { EditorialPreset } from '@epaper-studio/document-schema';
import type { MastheadPresetItem } from '@epaper-studio/template-engine';

const EDITORIAL_PRESETS_STORAGE_KEY = '@epaper-studio/custom-editorial-presets';
const MASTHEAD_PRESETS_STORAGE_KEY = '@epaper-studio/custom-masthead-presets';

export interface EditorialPresetsStorage {
  getCustomEditorialPresets(): Promise<EditorialPreset[]>;
  saveCustomEditorialPreset(preset: EditorialPreset): Promise<void>;
  deleteCustomEditorialPreset(id: string): Promise<void>;
  getCustomMastheadPresets(): Promise<MastheadPresetItem[]>;
  saveCustomMastheadPreset(preset: MastheadPresetItem): Promise<void>;
  deleteCustomMastheadPreset(id: string): Promise<void>;
}

export class LocalStorageEditorialPresetsAdapter implements EditorialPresetsStorage {
  public async getCustomEditorialPresets(): Promise<EditorialPreset[]> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(EDITORIAL_PRESETS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Failed to parse custom editorial presets from localStorage:', err);
      return [];
    }
  }

  public async saveCustomEditorialPreset(preset: EditorialPreset): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const current = await this.getCustomEditorialPresets();
    const existingIdx = current.findIndex((p) => p.id === preset.id);
    let updated: EditorialPreset[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = preset;
    } else {
      updated = [preset, ...current];
    }
    window.localStorage.setItem(EDITORIAL_PRESETS_STORAGE_KEY, JSON.stringify(updated));
  }

  public async deleteCustomEditorialPreset(id: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const current = await this.getCustomEditorialPresets();
    const updated = current.filter((p) => p.id !== id);
    window.localStorage.setItem(EDITORIAL_PRESETS_STORAGE_KEY, JSON.stringify(updated));
  }

  public async getCustomMastheadPresets(): Promise<MastheadPresetItem[]> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(MASTHEAD_PRESETS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Failed to parse custom masthead presets from localStorage:', err);
      return [];
    }
  }

  public async saveCustomMastheadPreset(preset: MastheadPresetItem): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const current = await this.getCustomMastheadPresets();
    const existingIdx = current.findIndex((p) => p.id === preset.id);
    let updated: MastheadPresetItem[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = preset;
    } else {
      updated = [preset, ...current];
    }
    window.localStorage.setItem(MASTHEAD_PRESETS_STORAGE_KEY, JSON.stringify(updated));
  }

  public async deleteCustomMastheadPreset(id: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const current = await this.getCustomMastheadPresets();
    const updated = current.filter((p) => p.id !== id);
    window.localStorage.setItem(MASTHEAD_PRESETS_STORAGE_KEY, JSON.stringify(updated));
  }
}

export const editorialPresetsStorage = new LocalStorageEditorialPresetsAdapter();
