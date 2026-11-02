import type {
  NewspaperDocument,
  NewspaperPresetId,
  PageSizePreset,
  MasterTemplate,
  MasterTemplateCategory,
  DailyEdition,
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

export interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
  category: MasterTemplateCategory;
  presetId: NewspaperPresetId;
  pageSize: PageSizePreset;
  isBuiltIn: boolean;
  updatedAt: string;
  pageCount: number;
}

export interface TemplateStorageAdapter {
  listTemplates(): Promise<TemplateSummary[]>;
  getTemplate(id: string): Promise<MasterTemplate | null>;
  saveTemplate(template: MasterTemplate): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
  restoreBuiltInTemplate(presetId: NewspaperPresetId): Promise<MasterTemplate>;
}

export interface EditionSummary {
  id: string;
  editionName: string;
  editionDate: string;
  publicationName: string;
  templateId: string;
  templateName?: string;
  pageSize: PageSizePreset;
  articleCount: number;
  updatedAt: string;
  saveStatus: 'saved' | 'draft' | 'modified';
  isLegacyDraft?: boolean;
}

export interface EditionStorageAdapter {
  listEditions(): Promise<EditionSummary[]>;
  getEdition(id: string): Promise<DailyEdition | null>;
  saveEdition(edition: DailyEdition): Promise<void>;
  deleteEdition(id: string): Promise<void>;
  duplicateEdition(id: string, newEditionName?: string): Promise<DailyEdition>;
}
