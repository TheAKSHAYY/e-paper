import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportDocumentToPdf } from './pdfExport';
import { createNewspaperDocument } from '@epaper-studio/template-engine';

describe('PDF Export Validation (pdfExport.ts)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Provide a comprehensive browser mock on globalThis
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    (globalThis as unknown as { window: unknown }).window = {
      URL: {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      },
      document: {
        createElement: vi.fn().mockReturnValue(mockAnchor),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      },
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete (globalThis as unknown as { window?: unknown }).window;
    vi.restoreAllMocks();
  });

  it('rejects with clear error in production if VITE_RENDERER_URL is empty', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const doc = createNewspaperDocument({
      title: 'Production Check Daily',
      presetId: 'classic-broadsheet',
    });

    try {
      await expect(exportDocumentToPdf(doc, { rendererUrl: '' })).rejects.toThrow(
        /VITE_RENDERER_URL is not configured in production/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('rejects when server returns non-PDF content type (e.g. HTML 200 error page)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
      blob: async () => new Blob(['<html><body>SPA Page</body></html>'], { type: 'text/html' }),
    } as unknown as Response);

    const doc = createNewspaperDocument({
      title: 'HTML Error Check',
      presetId: 'classic-broadsheet',
    });

    await expect(exportDocumentToPdf(doc)).rejects.toThrow(
      /Expected application\/pdf response but received "text\/html/
    );
  });

  it('rejects when received binary data is missing the %PDF- magic signature', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      blob: async () => new Blob(['CORRUPT DATA NOT A PDF'], { type: 'application/pdf' }),
    } as unknown as Response);

    const doc = createNewspaperDocument({
      title: 'Magic Header Check',
      presetId: 'classic-broadsheet',
    });

    await expect(exportDocumentToPdf(doc)).rejects.toThrow(
      /missing %PDF- header/
    );
  });

  it('succeeds and triggers download when response is a genuine PDF', async () => {
    const validPdfBytes = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, // %PDF-
      0x31, 0x2e, 0x34, 0x0a, // 1.4\n
      0x25, 0xe2, 0xe3, 0xcf, 0xd3,
    ]);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="newspaper.pdf"',
      }),
      blob: async () => new Blob([validPdfBytes], { type: 'application/pdf' }),
    } as unknown as Response);

    const doc = createNewspaperDocument({
      title: 'Valid Download Daily',
      presetId: 'classic-broadsheet',
    });

    const result = await exportDocumentToPdf(doc);
    expect(result.success).toBe(true);
    expect(result.byteLength).toBe(validPdfBytes.length);
  });
});
