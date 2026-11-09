import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStoragePublisherProfileAdapter } from './PublisherProfileStorage';

describe('LocalStoragePublisherProfileAdapter', () => {
  let mockStorage: Record<string, string>;
  let adapter: LocalStoragePublisherProfileAdapter;

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
      key: () => null,
      length: 0,
    } as Storage;

    adapter = new LocalStoragePublisherProfileAdapter(storageMock);
  });

  it('returns default publisher profile when storage is empty', () => {
    const profile = adapter.getProfile();
    expect(profile.newspaperTitle).toBe('दैनिक नवप्रभात');
    expect(profile.primaryLanguage).toBe('hi');
    expect(profile.isOnboarded).toBe(false);
  });

  it('completes onboarding and updates profile', () => {
    const updated = adapter.completeOnboarding({
      publisherName: 'सुरेश कुमार',
      newspaperTitle: 'प्रभात संदेश',
      primaryLanguage: 'hi',
      preferredPageSize: 'broadsheet',
    });

    expect(updated.isOnboarded).toBe(true);
    expect(updated.publisherName).toBe('सुरेश कुमार');
    expect(updated.newspaperTitle).toBe('प्रभात संदेश');

    const retrieved = adapter.getProfile();
    expect(retrieved.publisherName).toBe('सुरेश कुमार');
    expect(retrieved.isOnboarded).toBe(true);
  });

  it('resets profile back to default', () => {
    adapter.completeOnboarding({
      publisherName: 'Admin',
      newspaperTitle: 'City Times',
      primaryLanguage: 'en',
    });
    adapter.resetProfile();
    const profile = adapter.getProfile();
    expect(profile.isOnboarded).toBe(false);
    expect(profile.newspaperTitle).toBe('दैनिक नवप्रभात');
  });
});
