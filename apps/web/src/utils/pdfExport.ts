import type { NewspaperDocument } from '@epaper-studio/document-schema';

export interface ExportPdfResult {
  success: boolean;
  filename: string;
  byteLength: number;
}

export interface ExportPdfOptions {
  rendererUrl?: string;
  apiKey?: string;
}

/**
 * Sends the structured NewspaperDocument to the local/server PDF renderer,
 * triggers an automated download of the vector PDF, and returns metadata.
 */
export async function exportDocumentToPdf(
  document: NewspaperDocument,
  options: ExportPdfOptions = {}
): Promise<ExportPdfResult> {
  const metaEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env;
  const procEnv = typeof process !== 'undefined' ? process.env : undefined;
  const isProd =
    metaEnv?.PROD === true ||
    metaEnv?.MODE === 'production' ||
    procEnv?.NODE_ENV === 'production';

  const baseUrl = (
    options.rendererUrl !== undefined
      ? options.rendererUrl
      : typeof metaEnv?.VITE_RENDERER_URL === 'string'
        ? metaEnv.VITE_RENDERER_URL
        : procEnv?.VITE_RENDERER_URL || ''
  ).replace(/\/$/, '');

  const apiKey =
    options.apiKey !== undefined
      ? options.apiKey
      : typeof metaEnv?.VITE_RENDERER_API_KEY === 'string'
        ? metaEnv.VITE_RENDERER_API_KEY
        : procEnv?.VITE_RENDERER_API_KEY;

  // In static production hosting (e.g. Vercel), verify that a dedicated renderer URL is defined
  if (!baseUrl && isProd) {
    throw new Error(
      'PDF export failed: VITE_RENDERER_URL is not configured in production. Please configure your live renderer service URL in your hosting environment variables or use the Print / PDF fallback option.'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const endpoint = baseUrl ? `${baseUrl}/api/render-pdf` : '/api/render-pdf';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    let errorMessage = `PDF rendering failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error && errorJson?.message) {
        errorMessage = `${errorJson.error}: ${errorJson.message}`;
      } else if (errorJson?.error) {
        errorMessage = errorJson.error;
      } else if (errorJson?.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Ignore JSON parse errors on non-json error responses
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/pdf')) {
    throw new Error(
      `PDF export failed: Expected application/pdf response but received "${contentType}".`
    );
  }

  const blob = await response.blob();

  // Validate PDF magic bytes (%PDF-)
  const arrayBuffer = await blob.arrayBuffer();
  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
  const magic = String.fromCharCode(...headerBytes);
  if (magic !== '%PDF-') {
    throw new Error(
      'PDF export failed: The received file is not a valid PDF document (missing %PDF- header).'
    );
  }

  // Extract filename from Content-Disposition header if available
  let filename = '';
  const disposition = response.headers.get('Content-Disposition');
  if (disposition) {
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
    if (utf8Match?.[1]) {
      try {
        filename = decodeURIComponent(utf8Match[1]);
      } catch {
        // fallback
      }
    }
    if (!filename && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match?.[1]) {
        filename = match[1];
      }
    }
  }

  if (!filename) {
    const safeTitle = (document.metadata.title || 'newspaper')
      .replace(/[^\p{L}\p{N}_-]+/gu, '_')
      .replace(/^_+|_+$/g, '');
    const date = (document.masthead.date || new Date().toISOString().slice(0, 10)).replace(
      /[^a-zA-Z0-9_-]+/g,
      '_'
    );
    filename = `${safeTitle || 'newspaper'}_${date}.pdf`;
  }

  // Trigger browser download via object URL if running in browser environment
  if (typeof window !== 'undefined' && window.document?.body) {
    const blobUrl = window.URL.createObjectURL(blob);
    const downloadLink = window.document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    window.document.body.appendChild(downloadLink);
    downloadLink.click();

    // Cleanup download DOM node and revoke object URL
    setTimeout(() => {
      window.document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  }

  return {
    success: true,
    filename,
    byteLength: blob.size,
  };
}
