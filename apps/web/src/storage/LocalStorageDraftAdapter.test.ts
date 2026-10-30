import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageDraftAdapter } from './LocalStorageDraftAdapter';
import { createNewspaperDocument } from '@epaper-studio/template-engine';
import { indexedDbAssetStorage } from './IndexedDbAssetStorage';

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

    const mockIdbStore: Record<string, unknown> = {};
    const mockIndexedDB = {
      open: () => {
        const req = {
          result: {
            objectStoreNames: { contains: () => true },
            createObjectStore: () => {},
            transaction: () => ({
              objectStore: () => ({
                put: (data: unknown, key: string) => {
                  mockIdbStore[key] = data;
                  const r = { error: null, onsuccess: null as (() => void) | null };
                  setTimeout(() => r.onsuccess?.(), 0);
                  return r;
                },
                get: (key: string) => {
                  const r = {
                    result: mockIdbStore[key] ?? null,
                    error: null,
                    onsuccess: null as (() => void) | null,
                  };
                  setTimeout(() => r.onsuccess?.(), 0);
                  return r;
                },
                delete: (key: string) => {
                  delete mockIdbStore[key];
                  const r = { error: null, onsuccess: null as (() => void) | null };
                  setTimeout(() => r.onsuccess?.(), 0);
                  return r;
                },
                getAllKeys: () => {
                  const r = {
                    result: Object.keys(mockIdbStore),
                    error: null,
                    onsuccess: null as (() => void) | null,
                  };
                  setTimeout(() => r.onsuccess?.(), 0);
                  return r;
                },
              }),
            }),
          },
          error: null,
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
          onupgradeneeded: null as ((ev: unknown) => void) | null,
        };
        setTimeout(() => req.onsuccess?.(), 0);
        return req;
      },
    };

    // Attach mock to globalThis
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockLocalStorage,
      indexedDB: mockIndexedDB,
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

  it('should automatically migrate legacy 1.0.0 drafts on getDraft', async () => {
    const legacyDoc = createNewspaperDocument({
      title: 'Legacy 1.0.0 Newspaper',
      presetId: 'classic-broadsheet',
    });
    legacyDoc.id = 'legacy-draft-1';

    // Simulate legacy 1.0.0 structure without page layoutMode
    const rawLegacy = {
      ...legacyDoc,
      version: '1.0.0',
      pages: [
        {
          id: 'page-1',
          pageNumber: 1,
          sectionTitle: 'Front Page',
          articles: legacyDoc.articles,
          // layoutMode is omitted in 1.0.0
        },
      ],
    };
    mockStore['epaper_studio_draft_doc_v1_legacy-draft-1'] = JSON.stringify(rawLegacy);

    const migrated = await adapter.getDraft('legacy-draft-1');
    expect(migrated).not.toBeNull();
    expect(migrated?.version).toBe('1.1.0');
    expect(migrated?.pages?.[0]?.layoutMode).toBe('auto');
  });

  it('purges offloaded IndexedDB assets when deleting a draft', async () => {
    const doc = createNewspaperDocument({
      title: 'Draft with Images',
      presetId: 'classic-broadsheet',
    });
    doc.id = 'draft-with-assets';
    await adapter.saveDraft(doc);

    // Save an associated asset key in IndexedDB mock
    const assetKey = `asset_${doc.id}_art-1`;
    await indexedDbAssetStorage.saveAsset(assetKey, 'data:image/png;base64,mock');

    const assetBefore = await indexedDbAssetStorage.getAsset(assetKey);
    expect(assetBefore).toBe('data:image/png;base64,mock');

    await adapter.deleteDraft(doc.id);

    const assetAfter = await indexedDbAssetStorage.getAsset(assetKey);
    expect(assetAfter).toBeNull();
  });
});
