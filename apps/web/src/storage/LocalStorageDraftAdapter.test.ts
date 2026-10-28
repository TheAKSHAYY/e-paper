import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageDraftAdapter } from './LocalStorageDraftAdapter';
import { createNewspaperDocument } from '@epaper-studio/template-engine';

describe('LocalStorageDraftAdapter', () => {
  let adapter: LocalStorageDraftAdapter;
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};

    const mockLocalStorage = {
      getItem: (key: string): string | null => mockStore[key] ?? null,
      setItem: (key: string, val: string): void => {
        mockStore[key] = val;
      },
      removeItem: (key: string): void => {
        delete mockStore[key];
      },
      clear: (): void => {
        mockStore = {};
      },
      length: 0,
      key: (_index: number): string | null => null,
    };

    // Attach mock to globalThis
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockLocalStorage,
    };

    adapter = new LocalStorageDraftAdapter();
  });

  afterEach(() => {
    mockStore = {};
  });

  it('should save and list drafts with correct summary metadata', async () => {
    const doc = createNewspaperDocument({
      title: 'The Daily Herald',
      presetId: 'classic-broadsheet',
    });

    await adapter.saveDraft(doc);

    const drafts = await adapter.listDrafts();
    expect(drafts.length).toBe(1);
    expect(drafts[0]?.title).toBe('The Daily Herald');
    expect(drafts[0]?.presetId).toBe('classic-broadsheet');
    expect(drafts[0]?.articleCount).toBe(doc.articles.length);
  });

  it('should load an existing saved draft by id', async () => {
    const doc = createNewspaperDocument({
      title: 'The Evening Gazette',
      presetId: 'compact-local',
    });

    await adapter.saveDraft(doc);

    const loaded = await adapter.getDraft(doc.id);
    expect(loaded).toBeDefined();
    expect(loaded?.id).toBe(doc.id);
    expect(loaded?.metadata.title).toBe('The Evening Gazette');
    expect(loaded?.articles.length).toBe(doc.articles.length);
  });

  it('should return null when draft does not exist', async () => {
    const nonExistent = await adapter.getDraft('non-existent-id-999');
    expect(nonExistent).toBeNull();
  });

  it('should delete a draft and update the index', async () => {
    const doc1 = createNewspaperDocument({ title: 'Paper 1' });
    const doc2 = createNewspaperDocument({ title: 'Paper 2' });

    await adapter.saveDraft(doc1);
    await adapter.saveDraft(doc2);

    let drafts = await adapter.listDrafts();
    expect(drafts.length).toBe(2);

    await adapter.deleteDraft(doc1.id);

    drafts = await adapter.listDrafts();
    expect(drafts.length).toBe(1);
    expect(drafts[0]?.id).toBe(doc2.id);

    const deletedDoc = await adapter.getDraft(doc1.id);
    expect(deletedDoc).toBeNull();
  });

  it('should gracefully handle malformed data in localStorage without throwing', async () => {
    // Inject corrupt JSON into storage
    mockStore['epaper_studio_draft_doc_v1_corrupt'] = '{ broken json';

    const result = await adapter.getDraft('corrupt');
    expect(result).toBeNull();

    // Inject invalid schema JSON
    mockStore['epaper_studio_draft_doc_v1_invalid_schema'] = JSON.stringify({
      version: '9.9.9',
      invalid: true,
    });

    const schemaResult = await adapter.getDraft('invalid_schema');
    expect(schemaResult).toBeNull();
  });
});
