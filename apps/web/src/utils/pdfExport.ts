import type { NewspaperDocument } from '@epaper-studio/document-schema';

export interface ExportPdfResult {
  success: boolean;
  filename: string;
  byteLength: number;
}

/**
 * Sends the structured NewspaperDocument to the local/server PDF renderer,
 * triggers an automated download of the vector PDF, and returns metadata.
 */
export async function exportDocumentToPdf(document: NewspaperDocument): Promise<ExportPdfResult> {
  const response = await fetch('/api/render-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    let errorMessage = `PDF rendering failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // Ignore JSON parse errors on non-json error responses
    }
    throw new Error(errorMessage);
  }

  const blob = await response.blob();

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

  // Trigger browser download via object URL
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

  return {
    success: true,
    filename,
    byteLength: blob.size,
  };
}
