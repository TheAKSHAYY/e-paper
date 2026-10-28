import type {
  NewspaperDocument,
  NewspaperPresetId,
  PageSizePreset,
} from '@epaper-studio/document-schema';

export interface DraftSummary {
  id: string;
  title: string;
  edition: string;
  issueNumber: string;
  date: string;
  presetId: NewspaperPresetId;
  pageSize: PageSizePreset;
  updatedAt: string;
  articleCount: number;
}

export interface DraftStorageAdapter {
  listDrafts(): Promise<DraftSummary[]>;
  getDraft(id: string): Promise<NewspaperDocument | null>;
  saveDraft(doc: NewspaperDocument): Promise<void>;
  deleteDraft(id: string): Promise<void>;
}
