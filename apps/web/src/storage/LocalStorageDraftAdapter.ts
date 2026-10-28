import { NewspaperDocumentSchema, type NewspaperDocument } from '@epaper-studio/document-schema';
import type { DraftStorageAdapter, DraftSummary } from './types';

const INDEX_KEY = 'epaper_studio_drafts_index_v1';
const DATA_KEY_PREFIX = 'epaper_studio_draft_doc_v1_';

export class LocalStorageDraftAdapter implements DraftStorageAdapter {
  private isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public async listDrafts(): Promise<DraftSummary[]> {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      const rawIndex = window.localStorage.getItem(INDEX_KEY);
      if (!rawIndex) {
        return [];
      }
      const parsed: unknown = JSON.parse(rawIndex);
      if (!Array.isArray(parsed)) {
        return [];
      }

      // Sort by latest update first
      const summaries = (parsed as DraftSummary[]).filter(
        (item) => typeof item === 'object' && item !== null && typeof item.id === 'string'
      );
      summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return summaries;
    } catch (err) {
      console.warn('Failed to parse draft index from localStorage:', err);
      return [];
    }
  }

  public async getDraft(id: string): Promise<NewspaperDocument | null> {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const rawData = window.localStorage.getItem(`${DATA_KEY_PREFIX}${id}`);
      if (!rawData) {
        return null;
      }

      const parsed: unknown = JSON.parse(rawData);
      const validation = NewspaperDocumentSchema.safeParse(parsed);
      if (!validation.success) {
        console.warn(`Draft ${id} failed schema validation:`, validation.error);
        return null;
      }

      return validation.data;
    } catch (err) {
      console.error(`Error loading draft ${id}:`, err);
      return null;
    }
  }

  public async saveDraft(doc: NewspaperDocument): Promise<void> {
    if (!this.isStorageAvailable()) {
      throw new Error('Local browser storage is unavailable in this environment.');
    }

    const validation = NewspaperDocumentSchema.safeParse(doc);
    if (!validation.success) {
      throw new Error(`Cannot save invalid document: ${validation.error.message}`);
    }

    const validDoc = validation.data;
    const now = new Date().toISOString();
    validDoc.metadata.updatedAt = now;

    const summary: DraftSummary = {
      id: validDoc.id,
      title: validDoc.metadata.title,
      edition: validDoc.masthead.edition,
      issueNumber: validDoc.masthead.issueNumber,
      date: validDoc.masthead.date,
      presetId: validDoc.layout.presetId,
      pageSize: validDoc.metadata.pageSize,
      updatedAt: now,
      articleCount: validDoc.articles.length,
    };

    try {
      // 1. Save document payload
      window.localStorage.setItem(`${DATA_KEY_PREFIX}${validDoc.id}`, JSON.stringify(validDoc));

      // 2. Update index
      const existingList = await this.listDrafts();
      const updatedList = existingList.filter((d) => d.id !== validDoc.id);
      updatedList.unshift(summary);

      window.localStorage.setItem(INDEX_KEY, JSON.stringify(updatedList));
    } catch (err) {
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        throw new Error(
          'Browser storage quota exceeded. Please remove older drafts or large images.'
        );
      }
      throw err;
    }
  }

  public async deleteDraft(id: string): Promise<void> {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      window.localStorage.removeItem(`${DATA_KEY_PREFIX}${id}`);
      const existingList = await this.listDrafts();
      const updatedList = existingList.filter((d) => d.id !== id);
      window.localStorage.setItem(INDEX_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error(`Failed to delete draft ${id}:`, err);
      throw err;
    }
  }
}
