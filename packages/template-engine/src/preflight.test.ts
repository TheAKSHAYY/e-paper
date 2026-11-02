import { describe, it, expect } from 'vitest';
import { createNewspaperDocument, runPreflightValidation } from './index';

describe('PDF Preflight Validation Engine (12-Point Audit)', () => {
  it('should report GREEN status when document is healthy and well-formed', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    const report = runPreflightValidation(doc, {
      currentDate: new Date('2026-10-28T00:00:00Z'),
    });

    // Check what issues are present
    expect(report.issues).toEqual([]);
    expect(report.canExport).toBe(true);
    expect(report.errorCount).toBe(0);
    expect(report.overallStatus).toBe('green');
  });

  it('should detect RED blocker when free-layout text area is overflown', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.pages = [
      {
        id: 'page-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        layoutMode: 'free',
        articles: [
          {
            ...doc.articles[0],
            id: 'art-overflow',
            headline: 'अत्यधिक लंबी खबर',
            // Small frame (50mm x 20mm = 1000mm2) with 500 words
            frame: { x: 20, y: 30, w: 50, h: 20, z: 1 },
            body: new Array(500).fill('समाचार').join(' '),
          },
        ],
      },
    ];

    const report = runPreflightValidation(doc);
    expect(report.errorCount).toBeGreaterThan(0);
    expect(report.canExport).toBe(false);
    expect(report.overallStatus).toBe('red');

    const overflowIssue = report.issues.find((i) => i.type === 'text_overflow');
    expect(overflowIssue).toBeDefined();
    expect(overflowIssue?.severity).toBe('red');
    expect(overflowIssue?.articleId).toBe('art-overflow');
    expect(overflowIssue?.autoFixAvailable).toBe(true);
  });

  it('should detect RED blocker when element exceeds printable page boundaries', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.pages = [
      {
        id: 'page-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        layoutMode: 'free',
        articles: [
          {
            ...doc.articles[0],
            id: 'art-out-of-bounds',
            // Placed at x=500mm on a 381mm broadsheet!
            frame: { x: 500, y: 100, w: 100, h: 50, z: 1 },
          },
        ],
      },
    ];

    const report = runPreflightValidation(doc);
    expect(report.canExport).toBe(false);
    const boundaryIssue = report.issues.find((i) => i.type === 'page_boundaries');
    expect(boundaryIssue).toBeDefined();
    expect(boundaryIssue?.severity).toBe('red');
    expect(boundaryIssue?.articleId).toBe('art-out-of-bounds');
  });

  it('should detect RED blocker for broken or error image URL', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.articles[0].imageUrl = 'broken';

    const report = runPreflightValidation(doc, { currentDate: new Date('2026-10-28T00:00:00Z') });
    const missingImgIssue = report.issues.find((i) => i.type === 'missing_images');
    expect(missingImgIssue).toBeDefined();
    expect(missingImgIssue?.severity).toBe('red');
    expect(report.canExport).toBe(false);
  });

  it('should detect RED blocker for corrupted Devanagari unicode characters', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.articles[0].headline = 'खंडित वर्ण \uFFFD समाचार';

    const report = runPreflightValidation(doc);
    const unicodeIssue = report.issues.find((i) => i.type === 'hindi_rendering');
    expect(unicodeIssue).toBeDefined();
    expect(unicodeIssue?.severity).toBe('red');
    expect(report.canExport).toBe(false);
  });

  it('should detect YELLOW warning for empty headline or empty body', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.articles[0].headline = '   '; // empty!

    const report = runPreflightValidation(doc);
    const emptyIssue = report.issues.find((i) => i.type === 'empty_blocks');
    expect(emptyIssue).toBeDefined();
    expect(emptyIssue?.severity).toBe('yellow');
  });

  it('should detect RED blocker for unexpected blank page', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.pages = [
      {
        id: 'page-1',
        pageNumber: 1,
        sectionTitle: 'मुख्य पृष्ठ',
        layoutMode: 'auto',
        articles: doc.articles,
      },
      {
        id: 'page-2',
        pageNumber: 2,
        sectionTitle: 'खाली पृष्ठ',
        layoutMode: 'auto',
        articles: [], // blank!
      },
    ];

    const report = runPreflightValidation(doc);
    const blankIssue = report.issues.find((i) => i.type === 'blank_pages');
    expect(blankIssue).toBeDefined();
    expect(blankIssue?.severity).toBe('red');
    expect(report.canExport).toBe(false);
  });

  it('should detect YELLOW warning for outdated edition date', () => {
    const doc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });
    doc.masthead.date = '15 अगस्त 2021'; // Outdated past year

    const report = runPreflightValidation(doc, { currentDate: new Date('2026-11-02T00:00:00Z') });
    const dateIssue = report.issues.find((i) => i.type === 'outdated_date');
    expect(dateIssue).toBeDefined();
    expect(dateIssue?.severity).toBe('yellow');
  });
});
