import * as path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import {
  type NewspaperDocument,
  type MinimalDocument,
  type PageDimensions,
} from '@epaper-studio/document-schema';
import { renderNewspaperDocumentToHtml, getPageDimensionsPt } from '@epaper-studio/template-engine';
import { readSelfHostedFont } from '@epaper-studio/typography/server';
import {
  SELF_HOSTED_FONT_FAMILIES,
  findUnsupportedCharacters,
} from '@epaper-studio/typography';

export interface RenderJobRequest {
  jobId: string;
  document: MinimalDocument;
  dimensions: PageDimensions;
  outputFormat: 'pdf' | 'png-1bit' | 'png-8bit';
  ditherAlgorithm?: 'floyd-steinberg' | 'atkinson' | 'none';
}

export interface RenderJobResponse {
  jobId: string;
  success: boolean;
  byteLength?: number;
  outputUrl?: string;
  error?: string;
}

export interface RendererWorkerConfig {
  concurrency: number;
  timeoutMs: number;
}

export interface RenderPdfResult {
  pdfBuffer: Uint8Array;
  pageCount: number;
  widthPt: number;
  heightPt: number;
  fileSizeBytes: number;
  durationMs: number;
  hasOverflow: boolean;
  warnings: string[];
}

export interface PdfMetadata {
  isValidPdf: boolean;
  version: string;
  pageCount: number;
  mediaBoxes: Array<{ width: number; height: number }>;
  hasSelectableText: boolean;
}

/**
 * Validates that an outbound resource URL does not point to sensitive local,
 * internal, or cloud metadata endpoints (SSRF mitigation).
 */
export function isSafeUrl(urlStr: string): boolean {
  if (!urlStr) return false;
  // Allow inline base64 and SVG data URIs
  if (urlStr.startsWith('data:image/')) return true;

  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    // Block loopback, private ranges, link-local and cloud metadata addresses
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '169.254.169.254' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Parses binary PDF buffer to inspect PDF headers, MediaBox dimensions,
 * page counts, and embedded text stream operators.
 */
export function inspectPdf(pdfBuffer: Uint8Array): PdfMetadata {
  const binaryString = Buffer.from(pdfBuffer).toString('binary');

  // Verify %PDF- header signature
  const headerMatch = binaryString.match(/%PDF-(\d+\.\d+)/);
  const isValidPdf = Boolean(headerMatch);
  const version = headerMatch?.[1] ?? '';

  // Parse MediaBox page bounds [0 0 width height]
  const mediaBoxRegex = /\/MediaBox\s*\[\s*([\d.\s-]+)\s*\]/g;
  const mediaBoxes: Array<{ width: number; height: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = mediaBoxRegex.exec(binaryString)) !== null) {
    const rawBox = match[1];
    if (rawBox) {
      const parts = rawBox.trim().split(/\s+/).map(Number);
      if (parts.length === 4) {
        const [llx = 0, lly = 0, urx = 0, ury = 0] = parts;
        const width = Math.abs(urx - llx);
        const height = Math.abs(ury - lly);
        mediaBoxes.push({ width, height });
      }
    }
  }

  // Page count via /Type /Page occurrences or /Count <N> in /Pages
  let pageCount = 0;
  const pageMatches = binaryString.match(/\/Type\s*\/Page\b/g);
  if (pageMatches) {
    pageCount = pageMatches.length;
  } else {
    const countMatch = binaryString.match(/\/Count\s+(\d+)/);
    if (countMatch?.[1]) {
      pageCount = parseInt(countMatch[1], 10);
    }
  }

  // Verify selectable text streams (BT ... ET or Font objects)
  const hasSelectableText =
    binaryString.includes('BT') ||
    binaryString.includes('/Font') ||
    binaryString.includes('Tj') ||
    binaryString.includes('TJ');

  return {
    isValidPdf,
    version,
    pageCount: Math.max(1, pageCount),
    mediaBoxes,
    hasSelectableText,
  };
}

/**
 * Headless Chromium rendering worker utilizing Playwright to convert
 * structured newspaper documents into print-ready vector PDF documents
 * and high-resolution raster previews.
 */
export class RendererWorker {
  private config: RendererWorkerConfig;
  private browserInstance: Browser | null = null;
  private activeJobsCount = 0;

  constructor(config: Partial<RendererWorkerConfig> = {}) {
    this.config = {
      concurrency: config.concurrency ?? 4,
      timeoutMs: config.timeoutMs ?? 30000,
    };
  }

  public getConfig(): Readonly<RendererWorkerConfig> {
    return this.config;
  }

  public getActiveJobsCount(): number {
    return this.activeJobsCount;
  }

  public async validateEnvironment(): Promise<boolean> {
    try {
      const browser = await this.getBrowser();
      return Boolean(browser);
    } catch {
      return false;
    }
  }

  /**
   * Lazily initializes and reuses a headless Chromium browser instance.
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browserInstance || !this.browserInstance.isConnected()) {
      this.browserInstance = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=medium',
        ],
      });
    }
    return this.browserInstance;
  }

  /**
   * Sets up local font route interception and SSRF mitigations on a Playwright page.
   * If a requested font file is missing, aborts and records a fatal error, never continuing to the network.
   */
  private async setupPageRoutes(page: Page, onRouteError?: (err: Error) => void): Promise<void> {
    await page.route('**/*', async (route) => {
      const reqUrl = route.request().url();

      // Intercept local font requests and fulfill from canonical @epaper-studio/typography fonts
      if (reqUrl.includes('/fonts/')) {
        try {
          const fontFilename = path.basename(new URL(reqUrl).pathname);
          const fontData = readSelfHostedFont(fontFilename);
          if (fontData) {
            return route.fulfill({
              status: 200,
              contentType: 'font/woff2',
              body: fontData,
            });
          } else {
            const err = new Error(
              `Export aborted: Requested font file "${fontFilename}" not found in @epaper-studio/typography/fonts.`
            );
            if (onRouteError) onRouteError(err);
            return route.abort('failed');
          }
        } catch (err) {
          const routeErr = err instanceof Error ? err : new Error(String(err));
          if (onRouteError) onRouteError(routeErr);
          return route.abort('failed');
        }
      }

      if (reqUrl.startsWith('data:') || reqUrl.startsWith('about:')) {
        return route.continue();
      }
      if (!isSafeUrl(reqUrl)) {
        return route.abort('blockedbyclient');
      }
      // Never route.continue() to the network for unhandled external origins
      return route.abort('blockedbyclient');
    });
  }

  /**
   * Waits for document.fonts.ready and checks that all required fonts loaded without error.
   * If any font fails or a route interception error occurred, throws a clear Error aborting export.
   */
  private async waitForFontsAndImages(
    page: Page,
    getRouteError?: () => Error | null
  ): Promise<void> {
    if (getRouteError) {
      const routeErr = getRouteError();
      if (routeErr) throw routeErr;
    }

    const fontCheckResult = await page.evaluate(async () => {
      if (!document.fonts) {
        return { ok: true, failed: [] };
      }

      try {
        await document.fonts.ready;
      } catch (err) {
        return {
          ok: false,
          failed: [err instanceof Error ? err.message : String(err)],
        };
      }

      const failed: string[] = [];
      document.fonts.forEach((font) => {
        if (font.status === 'error') {
          failed.push(`${font.family} (weight: ${font.weight})`);
        }
      });

      return { ok: failed.length === 0, failed };
    });

    if (getRouteError) {
      const routeErr = getRouteError();
      if (routeErr) throw routeErr;
    }

    if (!fontCheckResult.ok) {
      throw new Error(
        `Export aborted: Required typography font(s) failed to load: ${fontCheckResult.failed.join(', ')}. Please verify self-hosted font assets.`
      );
    }

    // Wait for all embedded images to decode or timeout
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve(true);
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            setTimeout(() => resolve(false), 2500);
          });
        })
      );
    });
  }

  /**
   * CDP Platform Font Policy Guard:
   * Asserts via a CDP session that every text-bearing DOM node resolves strictly
   * to an allowlisted self-hosted font family. Throws an explicit Error listing
   * the offending element, text snippet, and platform font family if any fallback occurs.
   */
  public async assertPlatformFontsAllowlisted(page: Page): Promise<void> {
    const cdp = await page.context().newCDPSession(page);
    try {
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const { root } = await cdp.send('DOM.getDocument', { depth: -1 });

      const count = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let c = 0;
        const seen = new Set<Element>();
        let textNode: Node | null;
        while ((textNode = walker.nextNode())) {
          const text = textNode.textContent?.trim();
          if (text && text.length > 0) {
            const el = textNode.parentElement;
            if (el && !seen.has(el)) {
              seen.add(el);
              c++;
              el.setAttribute('data-guard-node-id', String(c));
            }
          }
        }
        return c;
      });

      const violations: string[] = [];

      for (let i = 1; i <= count; i++) {
        const { nodeId } = await cdp.send('DOM.querySelector', {
          nodeId: root.nodeId,
          selector: `[data-guard-node-id="${i}"]`,
        });

        if (nodeId) {
          const res = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
          const fonts = res.fonts || [];
          for (const font of fonts) {
            const isAllowlisted =
              font.isCustomFont ||
              SELF_HOSTED_FONT_FAMILIES.some(
                (f) =>
                  font.familyName.toLowerCase() === f.toLowerCase() ||
                  font.familyName.toLowerCase().includes(f.toLowerCase())
              );

            if (!isAllowlisted) {
              const info = await page.evaluate((id) => {
                const el = document.querySelector(`[data-guard-node-id="${id}"]`);
                if (!el) return { tag: 'unknown', className: '', text: '', pageNumber: 1, elementLabel: '' };

                // Find closest newspaper-page to identify page number
                const pageEl = el.closest('.newspaper-page');
                const pageNumber = pageEl ? Number(pageEl.getAttribute('data-page-number')) || 1 : 1;

                // Find closest article or masthead to get headline or element context
                const articleEl = el.closest('.newspaper-article');
                const headlineEl = articleEl?.querySelector('.article-headline');
                const elementLabel = headlineEl?.textContent?.trim()
                  ? `Headline: "${headlineEl.textContent.trim().slice(0, 45)}..."`
                  : el.closest('.masthead-section')
                  ? 'Masthead Section'
                  : `<${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}>`;

                return {
                  tag: el.tagName.toLowerCase(),
                  className: el.className || '',
                  text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
                  fullText: el.textContent || '',
                  pageNumber,
                  elementLabel,
                };
              }, i);

              // Find the exact unsupported characters with code points
              const unsupp = findUnsupportedCharacters(info.fullText || info.text, [font.familyName]);
              const unsuppSummary =
                unsupp.length > 0
                  ? unsupp
                      .slice(0, 5)
                      .map((u) => `"${u.char}" (${u.codePoint})`)
                      .join(', ') + (unsupp.length > 5 ? ` (+${unsupp.length - 5} more)` : '')
                  : 'N/A';

              violations.push(
                `Page ${info.pageNumber} | Element [${info.elementLabel}] | Sample: "${info.text}" | Unsupported glyph(s): [${unsuppSummary}] | Platform fallback: "${font.familyName}" (${font.glyphCount} glyphs)`
              );
            }
          }
        }
      }

      if (violations.length > 0) {
        throw new Error(
          `Export aborted: Font policy violation. Document contains characters or styles not covered by self-hosted fonts:\n${violations.map((v) => `  • ${v}`).join('\n')}\nAllowed self-hosted families: ${SELF_HOSTED_FONT_FAMILIES.join(', ')}.`
        );
      }
    } finally {
      await cdp.detach().catch(() => {});
    }
  }

  /**
   * Renders a NewspaperDocument into a real vector PDF with exact physical dimensions.
   */
  public async renderToPdf(
    doc: NewspaperDocument,
    options: { timeoutMs?: number } = {}
  ): Promise<RenderPdfResult> {
    this.activeJobsCount++;
    const startTime = Date.now();
    const timeout = options.timeoutMs ?? this.config.timeoutMs;
    const { widthPt, heightPt, widthIn, heightIn } = getPageDimensionsPt(
      doc.metadata.pageSize,
      doc.metadata.orientation
    );

    const html = renderNewspaperDocumentToHtml(doc);
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport matching newspaper physical dimensions in CSS pixels (96 DPI)
      const widthPx = Math.round((widthPt * 96) / 72);
      const heightPx = Math.round((heightPt * 96) / 72);
      await page.setViewportSize({
        width: widthPx,
        height: heightPx,
      });

      let routeFailureError: Error | null = null;
      // Route interception: serve self-hosted fonts from disk & apply SSRF mitigation
      await this.setupPageRoutes(page, (err) => {
        routeFailureError = err;
      });

      // Load HTML document
      await page.setContent(html, {
        waitUntil: 'load',
        timeout,
      });

      // Wait for typography fonts to resolve completely without race timeout
      await this.waitForFontsAndImages(page, () => routeFailureError);

      // Verify zero host OS font fallback via CDP
      await this.assertPlatformFontsAllowlisted(page);

      // Inspect layout for column/page height overflows
      const layoutDiagnostics = await page.evaluate(() => {
        const pages = Array.from(document.querySelectorAll('.newspaper-page'));
        const warnings: string[] = [];
        let hasOverflow = false;

        pages.forEach((p, idx) => {
          const grid = p.querySelector('.newspaper-grid');
          if (grid && grid.scrollHeight > grid.clientHeight + 10) {
            hasOverflow = true;
            warnings.push(
              `Page ${idx + 1} content height (${grid.scrollHeight}px) exceeds physical page grid (${grid.clientHeight}px)`
            );
          }

          // Export-time check: measure whether the footer's bounding box lies inside the page box
          const footer = p.querySelector('.newspaper-folio-footer');
          if (footer) {
            const pageRect = p.getBoundingClientRect();
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.bottom > pageRect.bottom + 1.0 || footerRect.top < pageRect.top) {
              warnings.push(
                `Page ${idx + 1} footer bounding box (bottom: ${footerRect.bottom.toFixed(1)}px) exceeds page box boundary (${pageRect.bottom.toFixed(1)}px)`
              );
            }
          }
        });

        return { hasOverflow, warnings };
      });

      if (layoutDiagnostics.warnings.length > 0) {
        for (const w of layoutDiagnostics.warnings) {
          console.warn(`[PDF Export Warning] ${w}`);
        }
      }

      // Render vector PDF via Chromium print engine
      const pdfBuffer = await page.pdf({
        width: `${widthIn}in`,
        height: `${heightIn}in`,
        printBackground: true,
        margin: { top: '0in', right: '0in', bottom: '0in', left: '0in' },
        preferCSSPageSize: true,
      });

      const metadata = inspectPdf(pdfBuffer);
      const durationMs = Date.now() - startTime;

      return {
        pdfBuffer,
        pageCount: metadata.pageCount,
        widthPt,
        heightPt,
        fileSizeBytes: pdfBuffer.length,
        durationMs,
        hasOverflow: layoutDiagnostics.hasOverflow,
        warnings: layoutDiagnostics.warnings,
      };
    } finally {
      this.activeJobsCount--;
      await page.close();
    }
  }

  /**
   * Renders a NewspaperDocument page into a raster PNG image for visual regression testing.
   */
  public async renderToImage(
    doc: NewspaperDocument,
    options: { pageNumber?: number; scale?: number } = {}
  ): Promise<Uint8Array> {
    this.activeJobsCount++;
    const { widthPt, heightPt } = getPageDimensionsPt(
      doc.metadata.pageSize,
      doc.metadata.orientation
    );
    const scale = options.scale ?? 1;
    const html = renderNewspaperDocumentToHtml(doc);

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const widthPx = Math.round(((widthPt * 96) / 72) * scale);
      const heightPx = Math.round(((heightPt * 96) / 72) * scale);
      await page.setViewportSize({
        width: widthPx,
        height: heightPx,
      });

      let routeFailureError: Error | null = null;
      // Route interception: serve self-hosted fonts from disk & apply SSRF mitigation
      await this.setupPageRoutes(page, (err) => {
        routeFailureError = err;
      });

      await page.setContent(html, { waitUntil: 'load' });
      await this.waitForFontsAndImages(page, () => routeFailureError);
      await this.assertPlatformFontsAllowlisted(page);

      const targetPageNumber = options.pageNumber ?? 1;
      const pageLocator = page.locator(`.newspaper-page[data-page-number="${targetPageNumber}"]`);

      let screenshotBuffer: Uint8Array;
      if ((await pageLocator.count()) > 0) {
        screenshotBuffer = await pageLocator.first().screenshot({ type: 'png' });
      } else {
        screenshotBuffer = await page.screenshot({ type: 'png', fullPage: false });
      }

      return screenshotBuffer;
    } finally {
      this.activeJobsCount--;
      await page.close();
    }
  }

  /**
   * Renders all pages of a multi-page document into an array of raster PNG image buffers.
   */
  public async renderAllPagesToImages(
    doc: NewspaperDocument,
    options: { scale?: number } = {}
  ): Promise<Uint8Array[]> {
    const { widthPt, heightPt } = getPageDimensionsPt(
      doc.metadata.pageSize,
      doc.metadata.orientation
    );
    const scale = options.scale ?? 1;
    const html = renderNewspaperDocumentToHtml(doc);

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const widthPx = Math.round(((widthPt * 96) / 72) * scale);
      const heightPx = Math.round(((heightPt * 96) / 72) * scale);
      await page.setViewportSize({
        width: widthPx,
        height: heightPx,
      });

      let routeFailureError: Error | null = null;
      // Route interception: serve self-hosted fonts from disk & apply SSRF mitigation
      await this.setupPageRoutes(page, (err) => {
        routeFailureError = err;
      });

      await page.setContent(html, { waitUntil: 'load' });
      await this.waitForFontsAndImages(page, () => routeFailureError);
      await this.assertPlatformFontsAllowlisted(page);

      const pageLocators = page.locator('.newspaper-page');
      const count = await pageLocators.count();
      const images: Uint8Array[] = [];

      for (let i = 0; i < count; i++) {
        const buffer = await pageLocators.nth(i).screenshot({ type: 'png' });
        images.push(buffer);
      }

      return images;
    } finally {
      await page.close();
    }
  }

  /**
   * Gracefully shuts down the background Chromium browser process.
   */
  public async close(): Promise<void> {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
    }
  }
}
