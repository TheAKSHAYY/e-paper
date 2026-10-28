import * as fs from 'node:fs';
import * as path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import {
  type NewspaperDocument,
  type MinimalDocument,
  type PageDimensions,
} from '@epaper-studio/document-schema';
import { renderNewspaperDocumentToHtml, getPageDimensionsPt } from '@epaper-studio/template-engine';

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
   * Resolves the directory path containing self-hosted WOFF2 font files.
   */
  private getLocalFontsDir(): string {
    const candidates = [
      path.resolve(process.cwd(), 'apps/web/public/fonts'),
      path.resolve(__dirname, '../../web/public/fonts'),
      path.resolve(__dirname, '../../../apps/web/public/fonts'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }

  /**
   * Sets up local font route interception and SSRF mitigations on a Playwright page.
   */
  private async setupPageRoutes(page: Page): Promise<void> {
    const fontsDir = this.getLocalFontsDir();

    await page.route('**/*', async (route) => {
      const reqUrl = route.request().url();

      // Intercept local font requests and fulfill from disk
      if (reqUrl.includes('/fonts/')) {
        const fontFilename = path.basename(new URL(reqUrl).pathname);
        const fontPath = path.join(fontsDir, fontFilename);
        if (fs.existsSync(fontPath)) {
          const fontData = fs.readFileSync(fontPath);
          return route.fulfill({
            status: 200,
            contentType: 'font/woff2',
            body: fontData,
          });
        }
      }

      if (reqUrl.startsWith('data:') || reqUrl.startsWith('about:')) {
        return route.continue();
      }
      if (!isSafeUrl(reqUrl)) {
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
  }

  /**
   * Waits for document.fonts.ready and checks that all required fonts loaded without error.
   * If any font fails, throws a clear Error aborting export.
   */
  private async waitForFontsAndImages(page: Page): Promise<void> {
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
      // Set viewport matching newspaper aspect ratio
      await page.setViewportSize({
        width: Math.round(widthPt),
        height: Math.round(heightPt),
      });

      // Route interception: serve self-hosted fonts from disk & apply SSRF mitigation
      await this.setupPageRoutes(page);

      // Load HTML document
      await page.setContent(html, {
        waitUntil: 'load',
        timeout,
      });

      // Wait for typography fonts to resolve completely without race timeout
      await this.waitForFontsAndImages(page);

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
        });

        return { hasOverflow, warnings };
      });

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
      await page.setViewportSize({
        width: Math.round(widthPt * scale),
        height: Math.round(heightPt * scale),
      });

      // Route interception: serve self-hosted fonts from disk & apply SSRF mitigation
      await this.setupPageRoutes(page);

      await page.setContent(html, { waitUntil: 'load' });
      await this.waitForFontsAndImages(page);

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
      await page.setViewportSize({
        width: Math.round(widthPt * scale),
        height: Math.round(heightPt * scale),
      });

      // Route interception: serve self-hosted fonts from disk & apply SSRF mitigation
      await this.setupPageRoutes(page);

      await page.setContent(html, { waitUntil: 'load' });
      await this.waitForFontsAndImages(page);

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
