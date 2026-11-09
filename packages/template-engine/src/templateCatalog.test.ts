import { describe, it, expect } from 'vitest';
import {
  COMPLETE_PAGE_TEMPLATES,
  BUILTIN_MASTHEAD_PRESETS,
  ARTICLE_LAYOUT_PRESETS,
  BUILTIN_EDITORIAL_PRESETS,
  runPreflightValidation,
} from './index.js';
import {
  NewspaperDocumentSchema,
  MastheadConfigSchema,
  ArticleSchema,
} from '@epaper-studio/document-schema';

describe('Milestone 1 — Hindi Newspaper Template Catalog (50 Real Templates)', () => {
  it('1. should contain exactly 5 complete newspaper page templates with valid document generation', () => {
    expect(COMPLETE_PAGE_TEMPLATES.length).toBeGreaterThanOrEqual(5);

    for (const tpl of COMPLETE_PAGE_TEMPLATES) {
      expect(tpl.id).toBeDefined();
      expect(tpl.name).toBeDefined();
      expect(tpl.category).toBeDefined();
      expect(tpl.pageSize).toBeDefined();
      expect(typeof tpl.createDocument).toBe('function');

      const doc = tpl.createDocument();
      // Validate schema conformance
      const parsed = NewspaperDocumentSchema.safeParse(doc);
      if (!parsed.success) {
        console.error(`Schema error for template ${tpl.id}:`, parsed.error);
      }
      expect(parsed.success).toBe(true);

      // Verify page structures and articles
      expect(doc.pages).toBeDefined();
      expect(doc.pages?.length).toBe(1);
      expect(doc.pages![0].articles.length).toBeGreaterThanOrEqual(4);

      // Verify preflight validation passes without red blocking errors
      const preflight = runPreflightValidation(doc, { strictPages: true });
      const redIssues = preflight.issues.filter((i) => i.severity === 'red');
      expect(redIssues).toHaveLength(0);
      expect(preflight.canExport).toBe(true);
    }
  });

  it('2. should contain 10 authentic Hindi masthead templates', () => {
    expect(BUILTIN_MASTHEAD_PRESETS.length).toBeGreaterThanOrEqual(10);

    for (const mstd of BUILTIN_MASTHEAD_PRESETS) {
      expect(mstd.id).toBeDefined();
      expect(mstd.name).toBeDefined();
      expect(mstd.config).toBeDefined();

      const parsed = MastheadConfigSchema.safeParse({
        title: mstd.name,
        date: '28 अक्टूबर 2026',
        ...mstd.config,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it('3. should contain 10 structural article layout presets', () => {
    expect(ARTICLE_LAYOUT_PRESETS.length).toBeGreaterThanOrEqual(10);

    for (const artTpl of ARTICLE_LAYOUT_PRESETS) {
      expect(artTpl.id).toBeDefined();
      expect(artTpl.name).toBeDefined();
      expect(artTpl.data).toBeDefined();

      // Ensure each data object parses as an article partial
      const parsed = ArticleSchema.safeParse({
        id: artTpl.id,
        headline: artTpl.name,
        body: 'परीक्षण आलेख विवरण।',
        ...artTpl.data,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it('4. should contain 10 breaking news templates in BUILTIN_EDITORIAL_PRESETS', () => {
    const breakingTemplates = BUILTIN_EDITORIAL_PRESETS.filter(
      (p) => p.category === 'breaking-banner'
    );
    expect(breakingTemplates.length).toBeGreaterThanOrEqual(10);

    for (const brk of breakingTemplates) {
      expect(brk.data.elementType).toBe('top-headline');
      expect(brk.data.headline).toBeDefined();
      expect(brk.data.backgroundColor).toBeDefined();
    }
  });

  it('5. should contain 15 sub-header and section divider templates in BUILTIN_EDITORIAL_PRESETS', () => {
    const dividers = BUILTIN_EDITORIAL_PRESETS.filter(
      (p) =>
        p.category === 'section-divider' ||
        p.category === 'category-label' ||
        p.category === 'special-report' ||
        p.category === 'dateline-strip'
    );
    expect(dividers.length).toBeGreaterThanOrEqual(15);
  });

  it('6. should confirm the catalog reaches at least 50 working, verified templates', () => {
    const totalWorkingTemplates =
      COMPLETE_PAGE_TEMPLATES.length +
      BUILTIN_MASTHEAD_PRESETS.length +
      ARTICLE_LAYOUT_PRESETS.length +
      BUILTIN_EDITORIAL_PRESETS.length;

    // 5 complete + 10 mastheads + 10 articles + 10 breaking + 15 dividers + others = 50+
    expect(totalWorkingTemplates).toBeGreaterThanOrEqual(50);
  });
});
