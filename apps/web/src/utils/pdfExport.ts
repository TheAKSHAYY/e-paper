import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getPageDimensions } from '@epaper-studio/document-schema';
import type { NewspaperDocument } from '@epaper-studio/document-schema';
import { generatePrintHtml } from './browserPrintExport';

export interface ExportPdfResult {
  success: boolean;
  filename: string;
  byteLength: number;
}

export interface ExportPdfOptions {
  /** Optional callback receiving current page (1-based), total pages, and progress message */
  onProgress?: (current: number, total: number, message?: string) => void;
  /** Canvas rasterization scale (defaults to 2 for crisp 192 DPI, or 1.5 for broadsheet) */
  scale?: number;
  /** JPEG compression quality (defaults to 0.95) */
  quality?: number;
  /** Base URL for resolving static assets and fonts */
  baseUrl?: string;
  /** Deprecated backward compatibility options */
  rendererUrl?: string;
  apiKey?: string;
}

/**
 * Generates a high-quality, print-ready vector-wrapped PDF entirely within the browser.
 * Uses client-side DOM rasterization with HarfBuzz Devanagari text shaping and self-hosted fonts,
 * then packages the pages into a genuine PDF document matching physical page geometry.
 *
 * Fully standalone: requires zero external servers, Render, Railway, or external APIs.
 */
export async function exportDocumentToPdf(
  document: NewspaperDocument,
  options: ExportPdfOptions = {}
): Promise<ExportPdfResult> {
  if (typeof window === 'undefined' || !window.document?.createElement) {
    throw new Error(
      'PDF generation requires a browser environment with Canvas and DOM support.'
    );
  }

  // Derive target physical dimensions in PostScript points (72 pt/inch)
  const pageSize = document.metadata.pageSize || 'broadsheet';
  const orientationSetting = document.metadata.orientation || 'portrait';
  const { widthPt, heightPt } = getPageDimensions(pageSize, orientationSetting);
  const isLandscape = orientationSetting === 'landscape';
  const pdfOrientation = isLandscape ? 'landscape' : 'portrait';

  // Compute safe filename
  const safeTitle = (document.metadata.title || 'newspaper')
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/^_+|_+$/g, '');
  const date = (document.masthead.date || new Date().toISOString().slice(0, 10)).replace(
    /[^a-zA-Z0-9_-]+/g,
    '_'
  );
  const filename = `${safeTitle || 'newspaper'}_${date}.pdf`;

  // Remove any previously orphaned PDF render iframe
  const existingFrame = window.document.getElementById('epaper-pdf-render-frame');
  if (existingFrame) {
    try {
      existingFrame.remove();
    } catch {
      // ignore
    }
  }

  // Generate self-contained HTML including all self-hosted fonts and print styling
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/`
      : 'http://localhost:5173/';
  const effectiveBaseUrl = options.baseUrl || origin;
  const html = generatePrintHtml(document, effectiveBaseUrl);

  // Create isolated offscreen iframe for pristine rendering
  const iframe = window.document.createElement('iframe');
  iframe.id = 'epaper-pdf-render-frame';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '0';
  // Give ample layout viewport to prevent column wrapping
  iframe.style.width = `${Math.max(1600, Math.ceil(widthPt * (96 / 72)) + 100)}px`;
  iframe.style.height = `${Math.max(2200, Math.ceil(heightPt * (96 / 72)) + 100)}px`;
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = '0';

  window.document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error('PDF रेंडर फ्रेम प्रारंभ करने में असमर्थ (Unable to initialize render frame)');
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Wait for self-hosted fonts to load into the iframe document context
  try {
    if (iframeDoc.fonts && typeof iframeDoc.fonts.ready !== 'undefined') {
      await iframeDoc.fonts.ready;
    }
  } catch (err) {
    console.warn('Font loading check notice:', err);
  }

  // Wait for all images inside the publication to decode
  const images = Array.from(iframeDoc.querySelectorAll('img'));
  if (images.length > 0) {
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
  }

  // Allow browser layout and font metrics to stabilize
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Find all newspaper pages
  const pageElements = Array.from(
    iframeDoc.querySelectorAll('.newspaper-page')
  ) as HTMLElement[];
  const pagesToRender = pageElements.length > 0 ? pageElements : [iframeDoc.body];
  const totalPages = pagesToRender.length;

  // Initialize jsPDF with exact physical geometry
  const pdf = new jsPDF({
    orientation: pdfOrientation,
    unit: 'pt',
    format: [widthPt, heightPt],
    compress: true,
  });

  // Adaptive scale: 2 (192 DPI) for crisp text; 1.5 for huge broadsheets to preserve memory
  const scale = options.scale ?? (widthPt > 1000 || heightPt > 1400 ? 1.5 : 2);
  const quality = options.quality ?? 0.95;
  const pageBg = document.theme?.pageBackground || '#ffffff';

  const html2canvasFn =
    typeof html2canvas === 'function'
      ? html2canvas
      : ((html2canvas as unknown as { default?: typeof html2canvas }).default ?? html2canvas);
  // console.log('DEBUG html2canvasFn:', typeof html2canvasFn);

  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1;
    options.onProgress?.(
      pageNumber,
      totalPages,
      `पृष्ठ ${pageNumber}/${totalPages} तैयार हो रहा है...`
    );

    const pageEl = pagesToRender[i];
    if (!pageEl) continue;
    const canvas = await html2canvasFn(pageEl, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: pageBg,
      windowWidth: Math.ceil(widthPt * (96 / 72)),
      windowHeight: Math.ceil(heightPt * (96 / 72)),
    });

    const imgData = canvas.toDataURL('image/jpeg', quality);

    if (i > 0) {
      pdf.addPage([widthPt, heightPt], pdfOrientation);
    }
    pdf.addImage(imgData, 'JPEG', 0, 0, widthPt, heightPt, undefined, 'FAST');
  }

  const pdfBlob = pdf.output('blob');

  // Verify valid %PDF- header bytes
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
  const magic = String.fromCharCode(...headerBytes);
  if (magic !== '%PDF-') {
    throw new Error('PDF export failed: Missing %PDF- header in generated PDF.');
  }

  // Trigger browser download
  if (typeof window !== 'undefined' && window.document?.body) {
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    const downloadLink = window.document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    window.document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      try {
        if (downloadLink.parentNode) {
          downloadLink.parentNode.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(blobUrl);
      } catch {
        // ignore
      }
    }, 1000);
  }

  // Clean up offscreen iframe
  setTimeout(() => {
    try {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    } catch {
      // ignore
    }
  }, 1000);

  return {
    success: true,
    filename,
    byteLength: pdfBlob.size,
  };
}
