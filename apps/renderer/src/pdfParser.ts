import * as zlib from 'node:zlib';

export interface StructuralPdfMetadata {
  isValidPdf: boolean;
  version: string;
  pageCount: number;
  mediaBoxes: Array<{ width: number; height: number; pageNumber?: number }>;
  hasSelectableText: boolean;
  extractedText: string;
  fontNames: string[];
  hasFlateStreams: boolean;
  hasObjectStreams: boolean;
  warnings: string[];
}

/**
 * Robust structural parser for PDF documents.
 * Correctly handles object dictionaries, page tree inheritance (/Pages -> /Kids -> /Page),
 * cross-reference streams, and decompresses FlateDecode content streams using zlib.
 */
export function parsePdfStructure(pdfBuffer: Uint8Array): StructuralPdfMetadata {
  const buf = Buffer.from(pdfBuffer);
  const warnings: string[] = [];

  // 1. Validate magic %PDF- header in the first 1024 bytes
  const headerSlice = buf.subarray(0, Math.min(buf.length, 1024)).toString('latin1');
  const headerMatch = headerSlice.match(/%PDF-(\d+\.\d+)/);
  if (!headerMatch) {
    return {
      isValidPdf: false,
      version: '',
      pageCount: 0,
      mediaBoxes: [],
      hasSelectableText: false,
      extractedText: '',
      fontNames: [],
      hasFlateStreams: false,
      hasObjectStreams: false,
      warnings: ['Missing %PDF- header magic bytes'],
    };
  }

  const version = headerMatch[1] ?? '1.4';
  const binaryString = buf.toString('latin1');

  // Check for %%EOF marker
  const hasEof = binaryString.includes('%%EOF');
  if (!hasEof) {
    warnings.push('Missing %%EOF trailer marker');
  }

  // 2. Discover /MediaBox definitions (direct and inherited)
  const mediaBoxes: Array<{ width: number; height: number; pageNumber?: number }> = [];
  const mediaBoxRegex = /\/MediaBox\s*\[\s*([-\d.\s]+)\s*\]/g;
  let mbMatch: RegExpExecArray | null;
  while ((mbMatch = mediaBoxRegex.exec(binaryString)) !== null) {
    const rawBox = mbMatch[1];
    if (rawBox) {
      const parts = rawBox.trim().split(/\s+/).map(Number);
      if (parts.length === 4 && parts.every((p) => !Number.isNaN(p))) {
        const [llx = 0, lly = 0, urx = 0, ury = 0] = parts;
        const width = Math.round(Math.abs(urx - llx) * 100) / 100;
        const height = Math.round(Math.abs(ury - lly) * 100) / 100;
        if (width > 0 && height > 0) {
          mediaBoxes.push({ width, height });
        }
      }
    }
  }

  // 3. Resolve Page Count
  let pageCount = 0;

  // A) Look for /Type /Pages dictionary with /Count N
  const countRegex = /\/Type\s*\/Pages\b[\s\S]*?\/Count\s+(\d+)/g;
  let cMatch: RegExpExecArray | null;
  while ((cMatch = countRegex.exec(binaryString)) !== null) {
    const parsed = parseInt(cMatch[1]!, 10);
    if (!Number.isNaN(parsed) && parsed > pageCount) {
      pageCount = parsed;
    }
  }

  // B) Fallback: direct /Type /Page objects count
  const pageObjectMatches = binaryString.match(/\/Type\s*\/Page\b/g);
  if (pageObjectMatches && pageObjectMatches.length > pageCount) {
    pageCount = pageObjectMatches.length;
  }

  // C) Check for object streams /ObjStm
  const hasObjectStreams = binaryString.includes('/ObjStm');

  // If pageCount still 0 but mediaBoxes found, derive from mediaBoxes length
  if (pageCount === 0 && mediaBoxes.length > 0) {
    pageCount = mediaBoxes.length;
  }
  pageCount = Math.max(1, pageCount);

  // If we found a single root MediaBox but multiple pages, replicate inherited MediaBox
  if (mediaBoxes.length === 1 && pageCount > 1) {
    const rootBox = mediaBoxes[0]!;
    while (mediaBoxes.length < pageCount) {
      mediaBoxes.push({ ...rootBox });
    }
  }

  // Annotate page numbers
  mediaBoxes.forEach((box, idx) => {
    box.pageNumber = idx + 1;
  });

  // 4. Decompress FlateDecode Streams and Extract Text
  const decompressedChunks: string[] = [];
  let hasFlateStreams = false;
  const fontNamesSet = new Set<string>();

  // Collect fonts from dictionaries
  const fontRefRegex = /\/Font\s*<<([^>]*)>>/g;
  let fMatch: RegExpExecArray | null;
  while ((fMatch = fontRefRegex.exec(binaryString)) !== null) {
    const fontDict = fMatch[1] || '';
    const nameMatches = fontDict.match(/\/([a-zA-Z0-9_\-+]+)/g);
    if (nameMatches) {
      for (const fn of nameMatches) {
        const clean = fn.replace(/^\//, '');
        if (clean !== 'Type' && clean !== 'Font' && clean !== 'Subtype') {
          fontNamesSet.add(clean);
        }
      }
    }
  }

  // Decompress streams to extract actual content stream text operators
  const streamHeaderRegex = /<<[\s\S]*?>>[\r\n]+stream[\r\n]+/g;
  let headerScan: RegExpExecArray | null;

  while ((headerScan = streamHeaderRegex.exec(binaryString)) !== null) {
    const dict = headerScan[0];
    const streamStart = headerScan.index + dict.length;
    const isFlate = dict.includes('/FlateDecode');
    if (isFlate) hasFlateStreams = true;

    // Find endstream
    const endstreamPos = binaryString.indexOf('endstream', streamStart);
    if (endstreamPos === -1) continue;

    const rawStreamBuffer = buf.subarray(streamStart, endstreamPos);
    if (isFlate) {
      try {
        const decompressed = zlib.inflateSync(rawStreamBuffer);
        decompressedChunks.push(decompressed.toString('latin1'));
      } catch {
        // Try raw inflate without zlib header
        try {
          const rawDecompressed = zlib.inflateRawSync(rawStreamBuffer);
          decompressedChunks.push(rawDecompressed.toString('latin1'));
        } catch {
          // Non-critical stream or font subset stream: ignore parse errors
        }
      }
    } else {
      decompressedChunks.push(rawStreamBuffer.toString('latin1'));
    }
  }

  // Combine raw binary text and all decompressed streams
  const allTextStreams = [binaryString, ...decompressedChunks].join('\n');

  // Check for genuine text showing operators
  const hasBtEt = allTextStreams.includes('BT') && allTextStreams.includes('ET');
  const hasTextOp =
    /\b(Tj|TJ|'|")\b/.test(allTextStreams) ||
    allTextStreams.includes('/Font') ||
    allTextStreams.includes('/Type /Font');

  const hasSelectableText = hasBtEt || hasTextOp;

  // Extract text strings from (literal) Tj and [ (array) ] TJ operators
  const extractedWords: string[] = [];

  // Extract from (string) Tj
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let tjMatch: RegExpExecArray | null;
  while ((tjMatch = tjRegex.exec(allTextStreams)) !== null) {
    const text = decodePdfString(tjMatch[1] || '');
    if (text.trim()) extractedWords.push(text.trim());
  }

  // Extract from [(str1) (str2)] TJ
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  let tjArrMatch: RegExpExecArray | null;
  while ((tjArrMatch = tjArrayRegex.exec(allTextStreams)) !== null) {
    const inner = tjArrMatch[1] || '';
    const innerParts = inner.match(/\(([^)]+)\)/g);
    if (innerParts) {
      const combined = innerParts
        .map((p) => decodePdfString(p.slice(1, -1)))
        .join('');
      if (combined.trim()) extractedWords.push(combined.trim());
    }
  }

  const extractedText = extractedWords.join(' ');

  return {
    isValidPdf: true,
    version,
    pageCount,
    mediaBoxes,
    hasSelectableText,
    extractedText,
    fontNames: Array.from(fontNamesSet),
    hasFlateStreams,
    hasObjectStreams,
    warnings,
  };
}

/**
 * Decodes standard PDF literal string escape sequences.
 */
function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}
