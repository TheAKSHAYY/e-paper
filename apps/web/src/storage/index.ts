import { LocalStorageDraftAdapter } from './LocalStorageDraftAdapter';
import { LocalStorageTemplateAdapter } from './LocalStorageTemplateAdapter';
import { LocalStorageEditionAdapter } from './LocalStorageEditionAdapter';

export * from './types';
export * from './LocalStorageDraftAdapter';
export * from './LocalStorageTemplateAdapter';
export * from './LocalStorageEditionAdapter';

export const draftStorage = new LocalStorageDraftAdapter();
export const templateStorage = new LocalStorageTemplateAdapter();
export const editionStorage = new LocalStorageEditionAdapter();
