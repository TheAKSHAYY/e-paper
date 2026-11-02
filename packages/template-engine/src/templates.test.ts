import { describe, it, expect } from 'vitest';
import {
  createNewspaperDocument,
  createMasterTemplateFromDocument,
  getBuiltInMasterTemplates,
  createDailyEditionFromTemplate,
  duplicateMasterTemplate,
  duplicateDailyEdition,
} from './index';

describe('Master Template & Daily Edition Engine', () => {
  it('should create built-in master templates for all canonical presets', () => {
    const builtin = getBuiltInMasterTemplates();
    expect(builtin.length).toBe(6);
    expect(builtin.every((t) => t.isBuiltIn)).toBe(true);

    const classicHindi = builtin.find((t) => t.presetId === 'classic-hindi-broadsheet');
    expect(classicHindi).toBeDefined();
    expect(classicHindi?.name).toContain('क्लासिक हिंदी');
    expect(classicHindi?.masthead.title).toBe('जनवाणी समाचार');
  });

  it('should create a custom MasterTemplate from an active NewspaperDocument', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.masthead.title = 'मेरी आवाज दैनिक';
    doc.layout.columnCount = 8;

    const template = createMasterTemplateFromDocument(doc, 'मेरी आवाज मास्टर टेम्पलेट', {
      description: '8-कॉलम का कस्टम लेआउट',
      category: 'broadsheet',
    });

    expect(template.id).toBeDefined();
    expect(template.name).toBe('मेरी आवाज मास्टर टेम्पलेट');
    expect(template.masthead.title).toBe('मेरी आवाज दैनिक');
    expect(template.layout.columnCount).toBe(8);
    expect(template.isBuiltIn).toBe(false);
    expect(template.pageBlueprints.length).toBeGreaterThan(0);
  });

  it('should duplicate a MasterTemplate independently', () => {
    const builtin = getBuiltInMasterTemplates()[0];
    const copy = duplicateMasterTemplate(builtin, 'दैनिक डुप्लिकेट');

    expect(copy.id).not.toBe(builtin.id);
    expect(copy.name).toBe('दैनिक डुप्लिकेट');
    expect(copy.isBuiltIn).toBe(false);

    // Mutating copy does not affect original
    copy.masthead.title = 'बदला हुआ नाम';
    expect(builtin.masthead.title).not.toBe('बदला हुआ नाम');
  });

  it('should create an independent DailyEdition from a MasterTemplate', () => {
    const template = getBuiltInMasterTemplates()[0];
    const edition = createDailyEditionFromTemplate(template, {
      editionDate: '3 नवंबर 2026',
      editionName: 'लखनऊ विशेष संस्करण',
      issueNumber: 501,
    });

    expect(edition.id).toBeDefined();
    expect(edition.templateId).toBe(template.id);
    expect(edition.editionDate).toBe('3 नवंबर 2026');
    expect(edition.editionName).toBe('लखनऊ विशेष संस्करण');
    expect(edition.document.masthead.date).toBe('3 नवंबर 2026');
    expect(edition.document.masthead.edition).toBe('लखनऊ विशेष संस्करण');
    expect(edition.document.masthead.issueNumber).toContain('501');

    // CRITICAL: Modifying edition document must NEVER modify source template!
    edition.document.masthead.title = 'रूपांतरित शीर्षक';
    edition.document.articles[0].headline = 'संपादित हेडलाइन';
    expect(template.masthead.title).not.toBe('रूपांतरित शीर्षक');
    expect(template.pageBlueprints[0].defaultArticles[0].headline).not.toBe('संपादित हेडलाइन');
  });

  it('should duplicate a DailyEdition for a regional fork (e.g. City to District)', () => {
    const template = getBuiltInMasterTemplates()[0];
    const cityEdition = createDailyEditionFromTemplate(template, {
      editionName: 'कानपुर नगर संस्करण',
      editionDate: '3 नवंबर 2026',
    });

    const districtEdition = duplicateDailyEdition(cityEdition, 'कानपुर देहात संस्करण');

    expect(districtEdition.id).not.toBe(cityEdition.id);
    expect(districtEdition.editionName).toBe('कानपुर देहात संस्करण');
    expect(districtEdition.document.id).not.toBe(cityEdition.document.id);
    expect(districtEdition.document.masthead.edition).toBe('कानपुर देहात संस्करण');

    // Independent editing
    districtEdition.document.articles[0].headline = 'देहात समाचार';
    expect(cityEdition.document.articles[0].headline).not.toBe('देहात समाचार');
  });
});
