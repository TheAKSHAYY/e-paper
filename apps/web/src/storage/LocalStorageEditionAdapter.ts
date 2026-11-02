import {
  DailyEditionSchema,
  type DailyEdition,
  type Article,
} from '@epaper-studio/document-schema';
import { duplicateDailyEdition } from '@epaper-studio/template-engine';
import type { EditionStorageAdapter, EditionSummary } from './types';
import { indexedDbAssetStorage } from './IndexedDbAssetStorage';
import { LocalStorageDraftAdapter } from './LocalStorageDraftAdapter';

const draftStorage = new LocalStorageDraftAdapter();

const EDITIONS_INDEX_KEY = 'epaper_studio_editions_index_v1';
const EDITION_DATA_KEY_PREFIX = 'epaper_studio_edition_doc_v1_';

export class LocalStorageEditionAdapter implements EditionStorageAdapter {
  private isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__storage_test_edn__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public async listEditions(): Promise<EditionSummary[]> {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      // 1. Fetch saved daily editions
      let editionSummaries: EditionSummary[] = [];
      const rawIndex = window.localStorage.getItem(EDITIONS_INDEX_KEY);
      if (rawIndex) {
        const parsed = JSON.parse(rawIndex);
        if (Array.isArray(parsed)) {
          editionSummaries = parsed.filter(
            (item) => typeof item === 'object' && item !== null && typeof item.id === 'string'
          );
        }
      }

      // 2. Backward Compatibility: Check legacy drafts and merge them if not already in editions
      const legacyDrafts = await draftStorage.listDrafts();
      const existingEditionIds = new Set(editionSummaries.map((e) => e.id));

      for (const draft of legacyDrafts) {
        if (!existingEditionIds.has(draft.id)) {
          editionSummaries.push({
            id: draft.id,
            editionName: draft.edition || 'मुख्य संस्करण (पुराना ड्राफ़्ट)',
            editionDate: draft.date || 'पूर्व संस्करण',
            publicationName: draft.title || 'अख़बार ड्राफ़्ट',
            templateId: `legacy-${draft.presetId}`,
            templateName: `${draft.presetId} (पुराना टेम्पलेट)`,
            pageSize: draft.pageSize,
            articleCount: draft.articleCount,
            updatedAt: draft.updatedAt,
            saveStatus: 'saved',
            isLegacyDraft: true,
          });
        }
      }

      // Sort by newest update first
      editionSummaries.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      return editionSummaries;
    } catch (err) {
      console.warn('Failed to parse editions index from localStorage:', err);
      return [];
    }
  }

  public async getEdition(id: string): Promise<DailyEdition | null> {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const rawData = window.localStorage.getItem(`${EDITION_DATA_KEY_PREFIX}${id}`);
      if (rawData) {
        const parsed: unknown = JSON.parse(rawData);
        const validation = DailyEditionSchema.safeParse(parsed);
        if (validation.success) {
          const validEdition = validation.data;

          // Rehydrate any offloaded indexeddb:// assets
          const rehydrateArticles = async (arts: Article[]) => {
            for (const art of arts) {
              if (art.imageUrl && art.imageUrl.startsWith('indexeddb://')) {
                const assetKey = art.imageUrl.replace('indexeddb://', '');
                const assetData = await indexedDbAssetStorage.getAsset(assetKey);
                if (assetData) {
                  art.imageUrl = assetData;
                }
              }
            }
          };

          await rehydrateArticles(validEdition.document.articles);
          if (validEdition.document.pages) {
            for (const p of validEdition.document.pages) {
              if (p.articles) await rehydrateArticles(p.articles);
            }
          }

          return validEdition;
        }
      }

      // 2. Backward Compatibility: Try loading from legacy draft storage
      const legacyDoc = await draftStorage.getDraft(id);
      if (legacyDoc) {
        const now = new Date().toISOString();
        const synthesizedEdition: DailyEdition = {
          id: legacyDoc.id,
          templateId: legacyDoc.templateId || `legacy-${legacyDoc.layout.presetId}`,
          templateName: `${legacyDoc.layout.presetId} (पुराना टेम्पलेट)`,
          editionName: legacyDoc.masthead.edition || 'मुख्य संस्करण',
          editionDate: legacyDoc.masthead.date || '2 नवंबर 2026',
          publicationName: legacyDoc.masthead.title || 'अख़बार',
          document: legacyDoc,
          saveStatus: 'saved',
          createdAt: legacyDoc.metadata.createdAt || now,
          updatedAt: legacyDoc.metadata.updatedAt || now,
        };
        return synthesizedEdition;
      }

      return null;
    } catch (err) {
      console.error(`Error loading edition ${id}:`, err);
      return null;
    }
  }

  public async saveEdition(edition: DailyEdition): Promise<void> {
    if (!this.isStorageAvailable()) {
      throw new Error('Local browser storage is unavailable in this environment.');
    }

    const validation = DailyEditionSchema.safeParse(edition);
    if (!validation.success) {
      throw new Error(`Cannot save invalid daily edition: ${validation.error.message}`);
    }

    const validEdition = validation.data;
    const now = new Date().toISOString();
    validEdition.updatedAt = now;
    validEdition.document.metadata.updatedAt = now;

    const summary: EditionSummary = {
      id: validEdition.id,
      editionName: validEdition.editionName,
      editionDate: validEdition.editionDate,
      publicationName: validEdition.publicationName,
      templateId: validEdition.templateId,
      templateName: validEdition.templateName,
      pageSize: validEdition.document.metadata.pageSize,
      articleCount: validEdition.document.articles.length,
      updatedAt: now,
      saveStatus: validEdition.saveStatus,
      isLegacyDraft: false,
    };

    try {
      // Also save to legacy draftStorage so existing draft list and backward compatibility tests continue working!
      await draftStorage.saveDraft(validEdition.document);

      // Save daily edition record
      try {
        window.localStorage.setItem(
          `${EDITION_DATA_KEY_PREFIX}${validEdition.id}`,
          JSON.stringify(validEdition)
        );
      } catch (storageErr) {
        // Quota safety handling
        const isQuotaErr =
          (storageErr instanceof Error && storageErr.name === 'QuotaExceededError') ||
          (storageErr instanceof DOMException &&
            (storageErr.name === 'QuotaExceededError' || storageErr.code === 22));

        if (isQuotaErr) {
          const offloadedEdition = JSON.parse(JSON.stringify(validEdition)) as DailyEdition;
          const offloadPromises: Promise<void>[] = [];

          const processArticles = (arts: Article[]) => {
            for (const art of arts) {
              if (art.imageUrl && (art.imageUrl.startsWith('data:') || art.imageUrl.length > 500)) {
                const assetKey = `asset_${validEdition.id}_${art.id}`;
                const originalUrl = art.imageUrl;
                art.imageUrl = `indexeddb://${assetKey}`;
                offloadPromises.push(indexedDbAssetStorage.saveAsset(assetKey, originalUrl));
              }
            }
          };

          processArticles(offloadedEdition.document.articles);
          if (offloadedEdition.document.pages) {
            for (const p of offloadedEdition.document.pages) {
              if (p.articles) processArticles(p.articles);
            }
          }

          await Promise.all(offloadPromises);
          window.localStorage.setItem(
            `${EDITION_DATA_KEY_PREFIX}${validEdition.id}`,
            JSON.stringify(offloadedEdition)
          );
        } else {
          throw storageErr;
        }
      }

      // Update editions index
      const rawIndex = window.localStorage.getItem(EDITIONS_INDEX_KEY);
      let existingEditions: EditionSummary[] = [];
      if (rawIndex) {
        try {
          existingEditions = JSON.parse(rawIndex);
        } catch {
          existingEditions = [];
        }
      }

      const updatedEditions = existingEditions.filter((e) => e.id !== validEdition.id);
      updatedEditions.unshift(summary);

      window.localStorage.setItem(EDITIONS_INDEX_KEY, JSON.stringify(updatedEditions));
    } catch (err) {
      console.error(`Failed to save edition ${validEdition.id}:`, err);
      throw err;
    }
  }

  public async deleteEdition(id: string): Promise<void> {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      window.localStorage.removeItem(`${EDITION_DATA_KEY_PREFIX}${id}`);
      const rawIndex = window.localStorage.getItem(EDITIONS_INDEX_KEY);
      if (rawIndex) {
        const existing: EditionSummary[] = JSON.parse(rawIndex);
        const updated = existing.filter((e) => e.id !== id);
        window.localStorage.setItem(EDITIONS_INDEX_KEY, JSON.stringify(updated));
      }

      // Also clean from legacy draft storage if present
      await draftStorage.deleteDraft(id);
      await indexedDbAssetStorage.deleteAssetsForDraft(id);
    } catch (err) {
      console.error(`Failed to delete edition ${id}:`, err);
      throw err;
    }
  }

  public async duplicateEdition(id: string, newEditionName?: string): Promise<DailyEdition> {
    const existing = await this.getEdition(id);
    if (!existing) {
      throw new Error(`Edition ${id} not found to duplicate.`);
    }

    const cloned = duplicateDailyEdition(existing, newEditionName);
    await this.saveEdition(cloned);
    return cloned;
  }
}

export const editionStorage = new LocalStorageEditionAdapter();
