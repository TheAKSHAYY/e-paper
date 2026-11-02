import { describe, it, expect, beforeEach } from 'vitest';
import { templateStorage } from './LocalStorageTemplateAdapter';
import { editionStorage } from './LocalStorageEditionAdapter';
import { LocalStorageDraftAdapter } from './LocalStorageDraftAdapter';
import {
  createNewspaperDocument,
  createMasterTemplateFromDocument,
  createDailyEditionFromTemplate,
} from '@epaper-studio/template-engine';

describe('LocalStorage Master Template & Daily Edition Storage', () => {
  let mockStore: Record<string, string> = {};
  const draftStorage = new LocalStorageDraftAdapter();

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

    Object.defineProperty(global, 'window', {
      value: { localStorage: mockLocalStorage },
      writable: true,
      configurable: true,
    });
  });

  it('should list built-in templates out of the box', async () => {
    const list = await templateStorage.listTemplates();
    expect(list.length).toBeGreaterThanOrEqual(6);
    expect(list.some((t) => t.isBuiltIn)).toBe(true);

    const classic = list.find((t) => t.presetId === 'classic-hindi-broadsheet');
    expect(classic).toBeDefined();
    expect(classic?.isBuiltIn).toBe(true);
  });

  it('should save and retrieve custom MasterTemplate', async () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.masthead.title = 'दैनिक प्रभात';
    const template = createMasterTemplateFromDocument(doc, 'प्रभात मास्टर टेम्पलेट');

    await templateStorage.saveTemplate(template);

    const retrieved = await templateStorage.getTemplate(template.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('प्रभात मास्टर टेम्पलेट');
    expect(retrieved?.masthead.title).toBe('दैनिक प्रभात');
    expect(retrieved?.isBuiltIn).toBe(false);

    const list = await templateStorage.listTemplates();
    const customInList = list.find((t) => t.id === template.id);
    expect(customInList).toBeDefined();
    expect(customInList?.isBuiltIn).toBe(false);
  });

  it('should prevent deleting built-in templates', async () => {
    const list = await templateStorage.listTemplates();
    const builtin = list.find((t) => t.isBuiltIn);
    expect(builtin).toBeDefined();

    await expect(templateStorage.deleteTemplate(builtin!.id)).rejects.toThrow(
      'Built-in system templates cannot be deleted.'
    );
  });

  it('should delete custom template cleanly', async () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const template = createMasterTemplateFromDocument(doc, 'हटाने योग्य टेम्पलेट');
    await templateStorage.saveTemplate(template);

    let list = await templateStorage.listTemplates();
    expect(list.some((t) => t.id === template.id)).toBe(true);

    await templateStorage.deleteTemplate(template.id);
    list = await templateStorage.listTemplates();
    expect(list.some((t) => t.id === template.id)).toBe(false);
  });

  it('should save, retrieve and duplicate a DailyEdition', async () => {
    const templates = await templateStorage.listTemplates();
    const firstTemplate = templates[0];
    expect(firstTemplate).toBeDefined();
    const template = (await templateStorage.getTemplate(firstTemplate!.id))!;

    const edition = createDailyEditionFromTemplate(template, {
      editionName: 'प्रातः संस्करण',
      editionDate: '4 नवंबर 2026',
    });

    await editionStorage.saveEdition(edition);

    const loaded = await editionStorage.getEdition(edition.id);
    expect(loaded).toBeDefined();
    expect(loaded?.editionName).toBe('प्रातः संस्करण');
    expect(loaded?.editionDate).toBe('4 नवंबर 2026');

    // Duplicate edition for regional distribution
    const regional = await editionStorage.duplicateEdition(edition.id, 'वाराणसी संस्करण');
    expect(regional.id).not.toBe(edition.id);
    expect(regional.editionName).toBe('वाराणसी संस्करण');

    const list = await editionStorage.listEditions();
    expect(list.length).toBe(2);
  });

  it('should provide backward compatibility by exposing legacy drafts as editions', async () => {
    // 1. Create a legacy draft via draftStorage
    const legacyDoc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    legacyDoc.id = 'legacy-draft-123';
    legacyDoc.metadata.title = 'विरासत समाचार ड्राफ़्ट';
    await draftStorage.saveDraft(legacyDoc);

    // 2. Query via editionStorage
    const editions = await editionStorage.listEditions();
    const legacyEditionSummary = editions.find((e) => e.id === 'legacy-draft-123');
    expect(legacyEditionSummary).toBeDefined();
    expect(legacyEditionSummary?.publicationName).toBe('विरासत समाचार ड्राफ़्ट');
    expect(legacyEditionSummary?.isLegacyDraft).toBe(true);

    // 3. Load via editionStorage.getEdition()
    const loadedEdition = await editionStorage.getEdition('legacy-draft-123');
    expect(loadedEdition).toBeDefined();
    expect(loadedEdition?.id).toBe('legacy-draft-123');
    expect(loadedEdition?.document.metadata.title).toBe('विरासत समाचार ड्राफ़्ट');
  });
});
