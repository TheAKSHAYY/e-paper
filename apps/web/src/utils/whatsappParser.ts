export interface ParsedWhatsAppStory {
  headline: string;
  subheadline?: string;
  body: string;
  byline?: string;
  dateline?: string;
  source?: string;
  date?: string;
  rawText: string;
}

/**
 * Strips common WhatsApp forward metadata and timestamps:
 * Examples:
 * "[10:45 AM, 11/10/2026] Reporter Ramesh: Forwarded"
 * "10/11/26, 10:45 AM - Ramesh:"
 */
export function sanitizeWhatsAppHeader(text: string): string {
  let cleaned = text;

  // Remove lines that start with date/time like "[10:45 AM, 11/10/2026] Reporter Ramesh: Forwarded"
  // or "10/11/26, 10:45 AM - Ramesh:"
  cleaned = cleaned.replace(
    /^\[?\d{1,2}[/:.-]\d{1,2}[/:.-]\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?\]?\s*[-:]?\s*[^:\n]+:\s*(?:Forwarded|आगे भेजा गया)?\s*$/gim,
    ''
  );
  cleaned = cleaned.replace(
    /^\[?\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?[,\s]+\d{1,2}[/:.-]\d{1,2}[/:.-]\d{2,4}\]?\s*[-:]?\s*[^:\n]+:\s*(?:Forwarded|आगे भेजा गया)?\s*$/gim,
    ''
  );

  // Remove standalone forwarded message lines
  cleaned = cleaned.replace(
    /^(?:Forwarded|Forwarded message|आगे भेजा गया|फ़ॉरवर्ड किया गया)\s*$/gim,
    ''
  );

  return cleaned.trim();
}

/**
 * Splits a dispatch text into individual stories using dividers.
 */
export function splitMultiStoryDispatch(rawText: string): string[] {
  const sanitized = sanitizeWhatsAppHeader(rawText);
  if (!sanitized) return [];

  // Delimiters: standalone line with 3+ dashes/stars/equals, or "====+"
  const delimiterPattern = /(?:\r?\n\s*(?:[-=*#_~]{3,}|\*{3,}|====+)\s*\r?\n)/i;

  const chunks = sanitized
    .split(delimiterPattern)
    .map((c) => c.trim())
    .filter((c) => c.length > 10);

  if (chunks.length > 1) {
    return chunks;
  }

  // Fallback: Check if separated by double blank lines followed by an explicit headline prefix (e.g. *Headline* or 🔴)
  const paragraphChunks = sanitized.split(
    /\n\s*\n\s*(?=(?:🔴|🚨|⚡|📢|📌|🔹|•)|\*[^*]+\*|[^\s\d:—\-#*]{4,}\s*[:—-])/u
  );
  const validParagraphChunks = paragraphChunks.map((c) => c.trim()).filter((c) => c.length > 20);

  if (validParagraphChunks.length > 1) {
    return validParagraphChunks;
  }

  return [sanitized];
}

/**
 * Heuristically parses a single raw text story into structured headline, byline, dateline, and body.
 */
export function parseSingleWhatsAppStory(storyText: string): ParsedWhatsAppStory {
  const rawText = storyText.trim();
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return {
      headline: 'अनाम समाचार (Untitled News)',
      body: '',
      rawText,
    };
  }

  let headline = '';
  let subheadline = '';
  let dateline = '';
  let byline = '';
  const source = 'WhatsApp / ग्राउंड रिपोर्टर';
  const date = new Date().toISOString().split('T')[0];
  const bodyLines: string[] = [];

  // Patterns for detecting Byline: e.g. "ब्यूरो/रिपोर्टर: रमेश शर्मा", "Byline: ", "विशेष संवाददाता"
  const bylineRegex =
    /^(?:विशेष संवाददाता|संवाददाता|ब्यूरो|रिपोर्टर|ब्यूरो रिपोर्ट|प्रतिनिधि|By|Byline|Reporter)[:\s—-]+(.*)$/i;

  // Patterns for detecting Dateline: e.g. "लखनऊ —", "नई दिल्ली —", "Bengaluru —", "Patna:"
  const datelineRegex = /^([^—:\-\n\d]{2,25})\s*(?:—|:|-)\s*(.*)$/;

  let lineIdx = 0;

  // Clean first line
  let firstLine = rawLines[lineIdx] || '';

  // Strip leading emoji indicator like 🔴, 🚨, ⚡, 📢
  firstLine = firstLine.replace(/^(?:🔴|🚨|⚡|📢|📌|🔹|[•–-])+\s*/u, '');

  // Clean markdown bold stars "*Headline*"
  if (firstLine.startsWith('*') && firstLine.endsWith('*') && firstLine.length > 2) {
    firstLine = firstLine.slice(1, -1).trim();
  } else if (firstLine.includes('*')) {
    firstLine = firstLine.replace(/\*/g, '').trim();
  }

  headline = firstLine;
  lineIdx++;

  // Check next lines for subheadline or byline
  if (lineIdx < rawLines.length) {
    const rawSecond = rawLines[lineIdx];
    if (rawSecond !== undefined) {
      let secondLine = rawSecond;
      const bylineMatch = secondLine.match(bylineRegex);
      if (bylineMatch) {
        byline = bylineMatch[1]?.trim() || secondLine;
        lineIdx++;
      } else if (
        secondLine.length > 10 &&
        secondLine.length < 100 &&
        !secondLine.includes('—') &&
        !secondLine.endsWith('।') &&
        !secondLine.endsWith('.')
      ) {
        secondLine = secondLine.replace(/\*/g, '').trim();
        subheadline = secondLine;
        lineIdx++;
      }
    }
  }

  // Process remaining lines for Dateline, Byline, and Body
  for (; lineIdx < rawLines.length; lineIdx++) {
    const currentLine = rawLines[lineIdx];
    if (currentLine === undefined) continue;

    // Check byline if not yet found
    if (!byline) {
      const bylineMatch = currentLine.match(bylineRegex);
      if (bylineMatch) {
        byline = bylineMatch[1]?.trim() || currentLine;
        continue;
      }
    }

    // Check dateline on early body lines
    if (!dateline && bodyLines.length === 0) {
      const datelineMatch = currentLine.match(datelineRegex);
      if (datelineMatch && !currentLine.toLowerCase().startsWith('http')) {
        const place = datelineMatch[1]?.trim() || '';
        dateline = `${place} —`;
        if (datelineMatch[2]) {
          bodyLines.push(datelineMatch[2].trim());
        }
        continue;
      }
    }

    bodyLines.push(currentLine);
  }

  let bodyText = bodyLines.join('\n\n');
  if (!bodyText && headline) {
    bodyText = headline;
    headline = headline.length > 40 ? `${headline.slice(0, 37)}...` : headline;
  }

  return {
    headline: headline || 'अनाम समाचार (Untitled News)',
    subheadline: subheadline || undefined,
    body: bodyText,
    byline: byline || 'विशेष संवाददाता',
    dateline: dateline || undefined,
    source,
    date,
    rawText,
  };
}

export function parseWhatsAppDispatch(rawText: string): ParsedWhatsAppStory[] {
  const storyChunks = splitMultiStoryDispatch(rawText);
  return storyChunks.map(parseSingleWhatsAppStory);
}
