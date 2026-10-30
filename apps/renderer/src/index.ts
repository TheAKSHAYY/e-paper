import * as path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import {
  type NewspaperDocument,
  type MinimalDocument,
  type PageDimensions,
} from '@epaper-studio/document-schema';
import { renderNewspaperDocumentToHtml, getPageDimensionsPt } from '@epaper-studio/template-engine';
import { readSelfHostedFont } from '@epaper-studio/typography/server';
import { SELF_HOSTED_FONT_FAMILIES, findUnsupportedCharacters } from '@epaper-studio/typography';
import { isSafeUrl, isAllowedAssetOrigin } from './security.js';
import { parsePdfStructure, type StructuralPdfMetadata } from './pdfParser.js';

export { isSafeUrl, isAllowedAssetOrigin, parsePdfStructure, type StructuralPdfMetadata };

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
  isValidPdf?: boolean;
}

export interface PdfMetadata {
  isValidPdf: boolean;
  version: string;
  pageCount: number;
  mediaBoxes: Array<{ width: number; height: number }>;
  hasSelectableText: boolean;
}

/**
 * Parses binary PDF buffer to inspect PDF headers, MediaBox dimensions,
 * page counts, and embedded text stream operators.
 * Uses structural parsing with zlib FlateDecode decompression.
 */
export function inspectPdf(pdfBuffer: Uint8Array): PdfMetadata {
  const structural = parsePdfStructure(pdfBuffer);
  return {
    isValidPdf: structural.isValidPdf,
    version: structural.version,
    pageCount: structural.pageCount,
    mediaBoxes: structural.mediaBoxes.map((b) => ({ width: b.width, height: b.height })),
    hasSelectableText: structural.hasSelectableText,
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
  private browserPromise: Promise<Browser> | null = null;
  private activeJobsCount = 0;
  private queuedJobsCount = 0;
  private totalJobsCompleted = 0;
  private queue: Array<() => void> = [];
  private readonly maxQueueLength = 20;
  private readonly maxJobsBeforeRecycle = 250;

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

  public getQueuedJobsCount(): number {
    return this.queuedJobsCount;
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
   * Acquires a concurrency execution slot or queues the request until a slot frees up.
   */
  private async acquireSlot(timeoutMs: number): Promise<() => void> {
    if (this.activeJobsCount < this.config.concurrency) {
      this.activeJobsCount++;
      return () => this.releaseSlot();
    }

    if (this.queuedJobsCount >= this.maxQueueLength) {
      const err = new Error(
        'Renderer queue is full. All rendering slots are currently utilized. Please retry shortly.'
      );
      (err as Error & { statusCode: number }).statusCode = 503;
      throw err;
    }

    this.queuedJobsCount++;
    return new Promise<() => void>((resolve, reject) => {
      const timer: NodeJS.Timeout = setTimeout(() => {
        const idx = this.queue.indexOf(proceed);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          this.queuedJobsCount--;
        }
        const timeoutErr = new Error(`Renderer queue wait timeout exceeded (${timeoutMs}ms)`);
        (timeoutErr as Error & { statusCode: number }).statusCode = 504;
        reject(timeoutErr);
      }, timeoutMs);

      const proceed = () => {
        clearTimeout(timer);
        this.queuedJobsCount--;
        this.activeJobsCount++;
        resolve(() => this.releaseSlot());
      };

      this.queue.push(proceed);
    });
  }

  /**
   * Releases an active concurrency slot and unblocks the next queued job,
   * or recycles the browser instance if the retirement threshold was reached while idle.
   */
  private releaseSlot(): void {
    this.activeJobsCount--;
    this.totalJobsCompleted++;

    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else if (
      this.activeJobsCount === 0 &&
      this.totalJobsCompleted >= this.maxJobsBeforeRecycle
    ) {
      void this.recycleBrowser();
    }
  }

  /**
   * Gracefully closes and resets the Chromium browser process to reclaim memory.
   */
  private async recycleBrowser(): Promise<void> {
    if (this.browserInstance) {
      try {
        await this.browserInstance.close();
      } catch {
        // Ignored
      }
      this.browserInstance = null;
      this.browserPromise = null;
      this.totalJobsCompleted = 0;
    }
  }

  /**
   * Lazily initializes and reuses a headless Chromium browser instance with atomic promise deduplication.
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browserInstance && this.browserInstance.isConnected()) {
      return this.browserInstance;
    }

    if (this.browserPromise) {
      return this.browserPromise;
    }

    const executablePath =
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      process.env.CHROMIUM_PATH ||
      undefined;

    this.browserPromise = chromium
      .launch({
        headless: true,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=medium',
        ],
      })
      .then((browser) => {
        this.browserInstance = browser;
        browser.on('disconnected', () => {
          this.browserInstance = null;
          this.browserPromise = null;
        });
        return browser;
      })
      .catch((err) => {
        this.browserPromise = null;
        throw err;
      });

    return this.browserPromise;
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

      // Safe local schemes
      if (reqUrl.startsWith('about:')) {
        return route.continue();
      }

      // Check data URIs (ensure no malicious SVG scripts)
      if (reqUrl.startsWith('data:')) {
        if (isSafeUrl(reqUrl)) {
          return route.continue();
        }
        return route.abort('blockedbyclient');
      }

      // Check allowlisted asset origins for external images with strict SSRF validation
      if (isAllowedAssetOrigin(reqUrl, process.env.ALLOWED_ASSET_ORIGINS)) {
        return route.continue();
      }

      // Never route.continue() to the network for unhandled or arbitrary external origins (SSRF prevention)
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
                if (!el)
                  return {
                    tag: 'unknown',
                    className: '',
                    text: '',
                    pageNumber: 1,
                    elementLabel: '',
                  };

                // Find closest newspaper-page to identify page number
                const pageEl = el.closest('.newspaper-page');
                const pageNumber = pageEl
                  ? Number(pageEl.getAttribute('data-page-number')) || 1
                  : 1;

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
              const unsupp = findUnsupportedCharacters(info.fullText || info.text, [
                font.familyName,
              ]);
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
    const timeout = options.timeoutMs ?? this.config.timeoutMs;
    const releaseSlot = await this.acquireSlot(timeout);
    const startTime = Date.now();
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
      releaseSlot();
      await page.close().catch(() => {});
    }
  }

  /**
   * Renders a NewspaperDocument page into a raster PNG image for visual regression testing.
   */
  public async renderToImage(
    doc: NewspaperDocument,
    options: { pageNumber?: number; scale?: number } = {}
  ): Promise<Uint8Array> {
    const releaseSlot = await this.acquireSlot(this.config.timeoutMs);
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
      releaseSlot();
      await page.close().catch(() => {});
    }
  }

  /**
   * Renders all pages of a multi-page document into an array of raster PNG image buffers.
   */
  public async renderAllPagesToImages(
    doc: NewspaperDocument,
    options: { scale?: number } = {}
  ): Promise<Uint8Array[]> {
    const releaseSlot = await this.acquireSlot(this.config.timeoutMs);
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
      releaseSlot();
      await page.close().catch(() => {});
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
