export interface PublisherProfile {
  publisherName: string;
  newspaperTitle: string;
  tagline: string;
  primaryLanguage: 'hi' | 'en';
  preferredPageSize: 'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4';
  email?: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PUBLISHER_PROFILE: PublisherProfile = {
  publisherName: 'प्रधान संपादक',
  newspaperTitle: 'दैनिक नवप्रभात',
  tagline: 'सत्य, निष्पक्षता और जनसेवा का प्रतीक',
  primaryLanguage: 'hi',
  preferredPageSize: 'broadsheet',
  isOnboarded: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'epaper_studio_publisher_profile';

export class LocalStoragePublisherProfileAdapter {
  private storage: Storage;

  constructor(storage: Storage = typeof window !== 'undefined' ? window.localStorage : ({} as Storage)) {
    this.storage = storage;
  }

  public getProfile(): PublisherProfile {
    try {
      const data = this.storage.getItem(STORAGE_KEY);
      if (!data) return { ...DEFAULT_PUBLISHER_PROFILE };
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PUBLISHER_PROFILE,
        ...parsed,
      };
    } catch {
      return { ...DEFAULT_PUBLISHER_PROFILE };
    }
  }

  public saveProfile(profile: Partial<PublisherProfile>): PublisherProfile {
    const current = this.getProfile();
    const updated: PublisherProfile = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[PublisherProfile] Failed to persist profile to localStorage', e);
    }
    return updated;
  }

  public completeOnboarding(profileData: {
    publisherName: string;
    newspaperTitle: string;
    tagline?: string;
    primaryLanguage: 'hi' | 'en';
    preferredPageSize?: 'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4';
    email?: string;
  }): PublisherProfile {
    return this.saveProfile({
      ...profileData,
      tagline: profileData.tagline || (profileData.primaryLanguage === 'hi' ? 'सत्य, निष्पक्षता और जनसेवा का प्रतीक' : 'The Voice of Public Discourse'),
      preferredPageSize: profileData.preferredPageSize || 'broadsheet',
      isOnboarded: true,
    });
  }

  public resetProfile(): void {
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }
}

export const publisherProfileStorage = new LocalStoragePublisherProfileAdapter();

