/**
 * IndexedDB asset storage for heavy images and blobs.
 * Used as a fallback when browser localStorage reaches QuotaExceededError (5MB-10MB limit).
 */

const DB_NAME = 'epaper_studio_assets_db';
const STORE_NAME = 'image_assets';
const DB_VERSION = 1;

class IndexedDbAssetStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public async saveAsset(key: string, dataUrl: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getAsset(key: string): Promise<string | null> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  public async deleteAsset(key: string): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Retrieves all asset storage keys currently persisted in IndexedDB.
   */
  public async getAllAssetKeys(): Promise<string[]> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return [];
    }
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();

        req.onsuccess = () => resolve((req.result as string[]) ?? []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  /**
   * Deletes all offloaded image assets associated with a specific draft ID.
   */
  public async deleteAssetsForDraft(draftId: string): Promise<void> {
    if (!draftId || typeof window === 'undefined' || !window.indexedDB) return;
    try {
      const keys = await this.getAllAssetKeys();
      const prefix = `asset_${draftId}_`;
      const draftKeys = keys.filter((k) => k.startsWith(prefix));
      await Promise.all(draftKeys.map((k) => this.deleteAsset(k)));
    } catch (err) {
      console.warn(`Failed to cleanup IndexedDB assets for draft ${draftId}:`, err);
    }
  }

  /**
   * Scans IndexedDB and deletes all assets whose draft ID is not in activeDraftIds.
   * Returns the count of purged orphaned assets.
   */
  public async cleanOrphanedAssets(activeDraftIds: string[]): Promise<number> {
    if (typeof window === 'undefined' || !window.indexedDB) return 0;
    try {
      const activeSet = new Set(activeDraftIds);
      const keys = await this.getAllAssetKeys();
      let purgedCount = 0;

      for (const key of keys) {
        // Expected key format: asset_<draftId>_<articleId>
        const match = key.match(/^asset_([^_]+)_/);
        if (match && match[1]) {
          const draftId = match[1];
          if (!activeSet.has(draftId)) {
            await this.deleteAsset(key);
            purgedCount++;
          }
        }
      }

      return purgedCount;
    } catch (err) {
      console.warn('Failed to clean orphaned IndexedDB assets:', err);
      return 0;
    }
  }
}

export const indexedDbAssetStorage = new IndexedDbAssetStorage();
