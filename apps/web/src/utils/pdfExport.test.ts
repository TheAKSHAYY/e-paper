import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportDocumentToPdf } from './pdfExport';
import { createNewspaperDocument } from '@epaper-studio/template-engine';

// Mock html2canvas and jspdf modules for node/vitest unit testing
vi.mock('html2canvas', () => {
  return {
    default: async () => {
      return {
        toDataURL: () => 'data:image/jpeg;base64,fakeimagebytes',
        width: 1080,
        height: 1638,
      };
    },
  };
});

vi.mock('jspdf', () => {
  return {
    jsPDF: class MockJsPDF {
      addPage = vi.fn();
      addImage = vi.fn();
      output(type: string) {
        const mockPdfBytes = new Uint8Array([
          0x25, 0x50, 0x44, 0x46, 0x2d, // %PDF-
          0x31, 0x2e, 0x34, 0x0a,
          0x25, 0xe2, 0xe3, 0xcf, 0xd3,
        ]);
        if (type === 'blob') {
          return new Blob([mockPdfBytes], { type: 'application/pdf' });
        }
        return mockPdfBytes.buffer;
      }
    },
  };
});

describe('Client-Side PDF Export Engine (pdfExport.ts)', () => {
  beforeEach(() => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      parentNode: {
        removeChild: vi.fn(),
      },
    };

    const mockIframeDoc = {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn(),
      fonts: {
        ready: Promise.resolve(),
      },
      querySelectorAll: vi.fn().mockImplementation((selector: string) => {
        if (selector === 'img') return [];
        if (selector === '.newspaper-page') {
          return [
            {
              getBoundingClientRect: () => ({ width: 1080, height: 1638 }),
            },
          ];
        }
        return [];
      }),
      body: {},
    };

    const mockIframe = {
      id: 'epaper-pdf-render-frame',
      setAttribute: vi.fn(),
      style: {},
      contentDocument: mockIframeDoc,
      contentWindow: { document: mockIframeDoc },
      parentNode: {
        removeChild: vi.fn(),
      },
      remove: vi.fn(),
    };

    (globalThis as unknown as { window: unknown }).window = {
      location: {
        origin: 'http://localhost:5173',
      },
      URL: {
        createObjectURL: vi.fn().mockReturnValue('blob:client-pdf-url'),
        revokeObjectURL: vi.fn(),
      },
      document: {
        createElement: vi.fn().mockImplementation((tag: string) => {
          if (tag === 'iframe') return mockIframe;
          if (tag === 'a') return mockAnchor;
          return {};
        }),
        getElementById: vi.fn().mockReturnValue(null),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      },
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
    vi.clearAllMocks();
  });

  it('rejects with clear error when running in a non-browser environment without DOM', async () => {
    delete (globalThis as unknown as { window?: unknown }).window;

    const doc = createNewspaperDocument({
      title: 'Non Browser Check',
      presetId: 'classic-broadsheet',
    });

    await expect(exportDocumentToPdf(doc)).rejects.toThrow(
      /PDF generation requires a browser environment/
    );
  });

  it('generates a valid client-side PDF document with %PDF- header and triggers download', async () => {
    const doc = createNewspaperDocument({
      title: 'Client Daily',
      presetId: 'classic-broadsheet',
    });

    const progressUpdates: number[] = [];
    const result = await exportDocumentToPdf(doc, {
      onProgress: (current) => progressUpdates.push(current),
    });

    expect(result.success).toBe(true);
    expect(result.filename).toMatch(/Client_Daily.*\.pdf$/);
    expect(result.byteLength).toBeGreaterThan(0);
    expect(progressUpdates.length).toBeGreaterThan(0);
  });

  it('supports custom page formats (A4, Tabloid, Broadsheet) and orientation', async () => {
    const doc = createNewspaperDocument({
      title: 'A4 Landscape Journal',
      presetId: 'modern-editorial',
    });
    doc.metadata.pageSize = 'a4';
    doc.metadata.orientation = 'landscape';

    const result = await exportDocumentToPdf(doc);
    expect(result.success).toBe(true);
    expect(result.filename).toContain('A4_Landscape_Journal');
  });
});
