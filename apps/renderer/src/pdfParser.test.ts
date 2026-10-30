import { describe, it, expect } from 'vitest';
import * as zlib from 'node:zlib';
import { parsePdfStructure } from './pdfParser';

describe('Structural PDF Parser (pdfParser.ts)', () => {
  it('returns isValidPdf: false on non-PDF buffers', () => {
    const res = parsePdfStructure(Buffer.from('<html><body>404 Not Found</body></html>'));
    expect(res.isValidPdf).toBe(false);
    expect(res.pageCount).toBe(0);
    expect(res.warnings).toContain('Missing %PDF- header magic bytes');
  });

  it('correctly parses an uncompressed synthetic PDF', () => {
    const rawPdf =
      '%PDF-1.7\n' +
      '1 0 obj\n' +
      '<< /Type /Catalog /Pages 2 0 R >>\n' +
      'endobj\n' +
      '2 0 obj\n' +
      '<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 1080 1638] >>\n' +
      'endobj\n' +
      '3 0 obj\n' +
      '<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\n' +
      'endobj\n' +
      '4 0 obj\n' +
      '<< /Length 45 >>\n' +
      'stream\n' +
      'BT\n' +
      '/F1 24 Tf\n' +
      '100 1500 Td\n' +
      '(Samachar Live) Tj\n' +
      'ET\n' +
      'endstream\n' +
      'endobj\n' +
      '%%EOF';

    const res = parsePdfStructure(Buffer.from(rawPdf));
    expect(res.isValidPdf).toBe(true);
    expect(res.version).toBe('1.7');
    expect(res.pageCount).toBe(1);
    expect(res.mediaBoxes).toHaveLength(1);
    expect(res.mediaBoxes[0]?.width).toBe(1080);
    expect(res.mediaBoxes[0]?.height).toBe(1638);
    expect(res.hasSelectableText).toBe(true);
    expect(res.extractedText).toContain('Samachar Live');
  });

  it('decompresses FlateDecode streams to extract text from compressed PDF objects', () => {
    const streamContent = 'BT\n/F1 14 Tf\n(Breaking News: Digital Publishing Studio) Tj\nET\n';
    const compressed = zlib.deflateSync(Buffer.from(streamContent));

    const head =
      '%PDF-1.4\n' +
      '1 0 obj\n' +
      '<< /Type /Pages /Count 1 /MediaBox [0 0 792 1224] >>\n' +
      'endobj\n' +
      '2 0 obj\n' +
      `<< /Length ${compressed.length} /Filter /FlateDecode >>\n` +
      'stream\n';
    const tail = '\nendstream\nendobj\n%%EOF';

    const fullPdf = Buffer.concat([
      Buffer.from(head, 'latin1'),
      compressed,
      Buffer.from(tail, 'latin1'),
    ]);

    const res = parsePdfStructure(fullPdf);
    expect(res.isValidPdf).toBe(true);
    expect(res.hasFlateStreams).toBe(true);
    expect(res.hasSelectableText).toBe(true);
    expect(res.extractedText).toContain('Breaking News: Digital Publishing Studio');
    expect(res.mediaBoxes[0]?.width).toBe(792);
    expect(res.mediaBoxes[0]?.height).toBe(1224);
  });

  it('handles multi-page PDFs with inherited /MediaBox from /Pages root', () => {
    const rawPdf =
      '%PDF-1.5\n' +
      '1 0 obj\n' +
      '<< /Type /Pages /Count 3 /MediaBox [0 0 892.8 1332] >>\n' +
      'endobj\n' +
      '2 0 obj << /Type /Page >> endobj\n' +
      '3 0 obj << /Type /Page >> endobj\n' +
      '4 0 obj << /Type /Page >> endobj\n' +
      '%%EOF';

    const res = parsePdfStructure(Buffer.from(rawPdf));
    expect(res.isValidPdf).toBe(true);
    expect(res.pageCount).toBe(3);
    expect(res.mediaBoxes).toHaveLength(3);
    expect(res.mediaBoxes[0]?.width).toBe(892.8);
    expect(res.mediaBoxes[1]?.pageNumber).toBe(2);
    expect(res.mediaBoxes[2]?.pageNumber).toBe(3);
  });
});

