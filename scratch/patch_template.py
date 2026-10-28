import os

with open('packages/template-engine/src/index.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# Apply 1616 target replacement:
idx1 = c.find('export interface CreateNewspaperOptions')
idx2 = c.find("return {\n    version: '1.0.0',\n    id: docId,\n    metadata: {", idx1)
idx3 = c.find('};\n}', idx2) + len('};\n}')

target1 = c[idx1:idx3]
print('Found target1 len:', len(target1))

# Check replacement 1
replacement1 = '''export interface CreateNewspaperOptions {
  title?: string;
  presetId?: NewspaperPresetId;
  pageSize?: PageSizePreset;
  language?: string;
  direction?: 'ltr' | 'rtl';
  startBlank?: boolean;
  pageCount?: number;
}

export function createNewspaperDocument(options: CreateNewspaperOptions = {}): NewspaperDocument {
  const presetId = options.presetId ?? 'classic-hindi-broadsheet';
  const preset = getNewspaperPreset(presetId);
  const now = new Date().toISOString();
  const title = options.title ?? preset.defaultMasthead.title;
  const pageSize = options.pageSize ?? preset.recommendedPageSize;
  const language = options.language ?? 'hi';
  const direction = options.direction ?? 'ltr';

  const defaultDate =
    language === 'hi'
      ? 'मंगलवार, 27 अक्टूबर 2026'
      : new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

  const masthead: MastheadConfig = {
    ...preset.defaultMasthead,
    title,
    date: defaultDate,
  };

  const layout: NewspaperLayoutConfig = {
    presetId,
    columnCount: preset.defaultColumns,
    columnRule: preset.columnRule,
    mastheadFont:
      preset.mastheadFont ?? (language === 'hi' ? "'Rozha One', serif" : preset.headlineFont),
    headlineFont: preset.headlineFont,
    subheadlineFont: preset.subheadlineFont ?? preset.headlineFont,
    bodyFont: preset.bodyFont,
    headlineWeight: preset.headlineWeight ?? 700,
    bodyFontSizePt: preset.bodyFontSizePt,
    spacingDensity: preset.spacingDensity,
    showFooter: true,
    footerText:
      language === 'hi'
        ? `पृष्ठ 1 • ${title} • मुख्य संस्करण`
        : `Page 1 • ${title} • Official Edition`,
  };

  const articles: Article[] = options.startBlank
    ? [
        {
          id: `art-${Date.now()}-1`,
          headline:
            language === 'hi'
              ? 'यहाँ अपनी मुख्य खबर की हेडलाइन लिखें'
              : 'Your Lead Article Headline Goes Here',
          subheadline:
            language === 'hi'
              ? 'खबर का संक्षिप्त सारांश या उप-शीर्षक यहाँ जोड़ें'
              : 'Add an engaging secondary summary of the story',
          body:
            language === 'hi'
              ? 'अपनी खबर का पूरा विवरण यहाँ लिखें। एक अच्छे समाचार में स्थान, तथ्य, आधिकारिक बयान और स्पष्ट संदर्भ शामिल होते हैं।\\n\\nआप ऊपर दिए गए टूलबार से फोटो लगा सकते हैं, कॉलम का आकार बदल सकते हैं और नई खबरें जोड़ सकते हैं।'
              : 'Write your story text here. Professional newspaper editors craft stories with strong opening datelines, factual paragraphs, and clear attribution.\\n\\nYou can upload images, adjust column spans, and reposition articles using the editor controls on the left.',
          byline: language === 'hi' ? 'विशेष संवाददाता' : 'By Your Name, Staff Writer',
          dateline: language === 'hi' ? 'नई दिल्ली —' : 'CITY DESK —',
          imagePlacement: 'top',
          imageCaption: '',
          columnSpan: layout.columnCount > 2 ? layout.columnCount - 1 : 2,
          priority: 'lead',
          orderIndex: 0,
        },
      ]
    : preset.seedArticles.map((art, index) => ({
        ...art,
        id: `seed-${presetId}-${index + 1}`,
      }));

  const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Construct discrete multi-page structure
  const page1: NewspaperPage = {
    id: `page-1`,
    pageNumber: 1,
    sectionTitle: language === 'hi' ? 'मुख्य पृष्ठ' : 'Front Page',
    articles,
    columnCount: layout.columnCount,
  };

  const targetPageCount = Math.max(1, options.pageCount ?? 1);
  const pages: NewspaperPage[] = [page1];

  for (let p = 2; p <= targetPageCount; p++) {
    pages.push(createNewBlankPage(p, { language }));
  }

  return {
    version: '1.0.0',
    id: docId,
    metadata: {
      id: docId,
      title,
      language,
      direction,
      pageSize,
      orientation: 'portrait',
      createdAt: now,
      updatedAt: now,
    },
    masthead,
    layout,
    articles,
    pages,
  };
}'''

c = c[:idx1] + replacement1 + c[idx3:]

# Apply replacement 2 for imageHtml
target2 = '''          let imageHtml = '';
          if (hasImage) {
            imageHtml = `
              <figure class="article-figure placement-${art.imagePlacement} layout-${art.imageLayout ?? 'full'} aspect-${art.imageAspect ?? 'standard'}">
                <img src="${escapeHtml(art.imageUrl ?? '')}" alt="${escapeHtml(art.imageCaption ?? art.headline ?? '')}" class="article-image aspect-${art.imageAspect ?? 'standard'}" style="object-fit: ${art.imageFit ?? 'cover'}; object-position: ${art.imageFocalPoint ?? 'center'};" onerror="this.style.display='none'" />
                ${
                  art.imageCaption || art.imageCredit
                    ? `
                  <figcaption class="article-caption">
                    ${art.imageCaption ? `<span class="caption-text">${escapeHtml(art.imageCaption)}</span>` : ''}
                    ${art.imageCredit ? `<span class="caption-credit">${escapeHtml(art.imageCredit)}</span>` : ''}
                  </figcaption>
                `
                    : ''
                }
              </figure>
            `;
          }'''

replacement2 = '''          let imageHtml = '';
          if (hasImage) {
            const objectPos = getImageObjectPosition(art);
            const aspectStyle = getImageAspectRatio(art.imageAspect);
            const fit = art.imageFit ?? 'cover';
            imageHtml = `
              <figure class="article-figure placement-${art.imagePlacement} layout-${art.imageLayout ?? 'full'} aspect-${art.imageAspect ?? 'standard'}">
                <img src="${escapeHtml(art.imageUrl ?? '')}" alt="${escapeHtml(art.imageCaption ?? art.headline ?? '')}" class="article-image aspect-${art.imageAspect ?? 'standard'}" style="object-fit: ${fit}; object-position: ${objectPos}; aspect-ratio: ${aspectStyle};" onerror="this.style.display='none'" />
                ${
                  art.imageCaption || art.imageCredit
                    ? `
                  <figcaption class="article-caption">
                    ${art.imageCaption ? `<span class="caption-text">${escapeHtml(art.imageCaption)}</span>` : ''}
                    ${art.imageCredit ? `<span class="caption-credit">${escapeHtml(art.imageCredit)}</span>` : ''}
                  </figcaption>
                `
                    : ''
                }
              </figure>
            `;
          }'''

if target2 in c:
    c = c.replace(target2, replacement2, 1)
    print('Applied replacement2!')
else:
    print('Target2 not found in file (may already be updated)')

with open('packages/template-engine/src/index.ts', 'w', encoding='utf-8') as f:
    f.write(c)
print('Updated packages/template-engine/src/index.ts successfully! Line count:', len(c.splitlines()))
