import { renderNewspaperDocumentToHtml } from '@epaper-studio/template-engine';
import type { NewspaperDocument } from '@epaper-studio/document-schema';

export interface PrintExportOptions {
  baseUrl?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  cleanupDelayMs?: number;
}

/**
 * Generates standalone, self-contained HTML for browser printing.
 * Injects explicit print color adjustments, @page sizing, and resolves
 * self-hosted Hindi/Devanagari fonts from the web application's static origin.
 */
export function generatePrintHtml(doc: NewspaperDocument, baseUrl?: string): string {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/`
      : 'http://localhost:5173/';
  const effectiveBaseUrl = baseUrl || origin;

  const html = renderNewspaperDocumentToHtml(doc, { baseUrl: effectiveBaseUrl });

  // Additional print overrides to ensure browser print dialog renders exact backgrounds and dimensions
  const printExtraCss = `
  <style id="browser-print-adjustments">
    @media print {
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: var(--page-bg, #ffffff) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .newspaper-page {
        page-break-after: always !important;
        break-after: page !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .newspaper-page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  </style>
  `;

  return html.replace('</head>', `${printExtraCss}\n</head>`);
}

/**
 * Detects whether the current client is a mobile device or tablet.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  const hasTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0;
  return isMobileUA || (isSmallScreen && hasTouch);
}

/**
 * Prepares and opens the document in a hidden iframe, awaits font readiness,
 * and triggers window.print().
 */
export async function printDocumentViaIframe(
  doc: NewspaperDocument,
  options: PrintExportOptions = {}
): Promise<{ success: boolean }> {
  if (typeof window === 'undefined') {
    throw new Error('प्रिंट सुविधा केवल ब्राउज़र वातावरण में उपलब्ध है (Available only in browser)');
  }

  // Remove any previously orphaned print iframe
  const existingIframe = document.getElementById('epaper-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const html = generatePrintHtml(doc, options.baseUrl);

  const iframe = document.createElement('iframe');
  iframe.id = 'epaper-print-iframe';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error('प्रिंट फ्रेम प्रारंभ करने में असमर्थ (Unable to access print frame document)');
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Wait for self-hosted fonts to load in the iframe context
  try {
    if (iframeDoc.fonts && typeof iframeDoc.fonts.ready !== 'undefined') {
      await iframeDoc.fonts.ready;
    }
  } catch (err) {
    console.warn('Print iframe font readiness check warning:', err);
  }

  // Wait for all embedded images (e.g. data: URI photos) to decode
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

  // Brief pause for browser rendering pipeline layout reflow
  await new Promise((resolve) => setTimeout(resolve, 200));

  options.onBeforePrint?.();

  const printWindow = iframe.contentWindow;
  if (!printWindow) {
    iframe.remove();
    throw new Error('प्रिंट विंडो उपलब्ध नहीं है (Print window not accessible)');
  }

  printWindow.focus();
  printWindow.print();

  options.onAfterPrint?.();

  // Clean up iframe after user dismisses or completes the print dialog
  const cleanupDelay = options.cleanupDelayMs ?? 2000;
  setTimeout(() => {
    try {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    } catch {
      // Ignore cleanup error if already detached
    }
  }, cleanupDelay);

  return { success: true };
}

