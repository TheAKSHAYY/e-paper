import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContextualInspector } from './ContextualInspector';
import { createNewspaperDocument } from '@epaper-studio/template-engine';
import type { Article, NewspaperPage } from '@epaper-studio/document-schema';

describe('ContextualInspector (TASK 1a)', () => {
  const baseDoc = createNewspaperDocument({ presetId: 'classic-hindi-broadsheet' });

  const dummyArticle: Article = {
    ...baseDoc.articles[0]!,
    id: 'art-test-1',
    headline: 'परीक्षण समाचार',
    columnSpan: 3,
  };

  const defaultLayout = baseDoc.layout;
  const defaultMasthead = baseDoc.masthead;

  it('inspector label/picker for an article on a 12-column page shows "x/12" and offers 1..12', () => {
    const twelveColPage: NewspaperPage = {
      id: 'page-1',
      pageNumber: 1,
      sectionTitle: 'मुख्य पृष्ठ',
      articles: [dummyArticle],
      columnCount: 12, // Page-level override
    };

    const html = renderToStaticMarkup(
      <ContextualInspector
        selectedArticle={dummyArticle}
        currentPage={twelveColPage}
        onUpdateArticle={() => {}}
        totalPages={1}
        currentPageIndex={0}
        masthead={defaultMasthead}
        onUpdateMasthead={() => {}}
        layout={defaultLayout}
        onUpdateLayout={() => {}}
        pageSize="broadsheet"
        onPageSizeChange={() => {}}
        orientation="portrait"
        onOrientationChange={() => {}}
        onDeselect={() => {}}
      />
    );

    // (a) Label must show "3/12" (selectedArticle.columnSpan / pageColumnCount)
    expect(html).toContain('कॉलम (3/12)');

    // Options must offer 1..12 columns
    for (let c = 1; c <= 12; c++) {
      expect(html).toMatch(new RegExp(`<option value="${c}"[^>]*>${c} कॉलम</option>`));
    }
    // Must not offer column 13
    expect(html).not.toContain('<option value="13"');
  });

  it('inspector label/picker for an article on a 4-column page shows "x/4" and offers 1..4', () => {
    const fourColPage: NewspaperPage = {
      id: 'page-2',
      pageNumber: 2,
      sectionTitle: 'संपादकीय',
      articles: [dummyArticle],
      columnCount: 4,
    };

    const html = renderToStaticMarkup(
      <ContextualInspector
        selectedArticle={dummyArticle}
        currentPage={fourColPage}
        onUpdateArticle={() => {}}
        totalPages={2}
        currentPageIndex={1}
        masthead={defaultMasthead}
        onUpdateMasthead={() => {}}
        layout={defaultLayout}
        onUpdateLayout={() => {}}
        pageSize="tabloid"
        onPageSizeChange={() => {}}
        orientation="portrait"
        onOrientationChange={() => {}}
        onDeselect={() => {}}
      />
    );

    // Label must show "3/4"
    expect(html).toContain('कॉलम (3/4)');

    // Options must offer 1..4 columns
    for (let c = 1; c <= 4; c++) {
      expect(html).toMatch(new RegExp(`<option value="${c}"[^>]*>${c} कॉलम</option>`));
    }
    // Must not offer column 5
    expect(html).not.toContain('<option value="5"');
  });
});
