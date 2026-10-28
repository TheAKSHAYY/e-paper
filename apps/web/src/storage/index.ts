import { LocalStorageDraftAdapter } from './LocalStorageDraftAdapter';

export * from './types';
export * from './LocalStorageDraftAdapter';

export const draftStorage = new LocalStorageDraftAdapter();
