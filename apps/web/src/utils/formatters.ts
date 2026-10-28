/**
 * Localization and Number Formatting Utilities
 *
 * Strict Rule: E-Paper Studio always displays English digits (0 1 2 3 4 5 6 7 8 9)
 * even within natural Hindi interface strings, newspaper folios, and metadata.
 */

/**
 * Converts any Devanagari numerals within a string into English digits (0-9).
 */
export function toEnglishDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[\u0966-\u096F]/g, (char) => {
    const code = char.charCodeAt(0) - 0x0966;
    return String(code);
  });
}

/**
 * Format a number using Latin digits with Indian numbering conventions (lakhs, crores).
 * Always guarantees Latin digits (0-9).
 */
export function formatNumber(val: number, options?: Intl.NumberFormatOptions): string {
  const formatted = new Intl.NumberFormat('en-IN', options).format(val);
  return toEnglishDigits(formatted);
}

/**
 * Format a price value with rupee symbol and Latin digits.
 * e.g. formatPrice(5) => "₹5.00"
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Format a zoom scale factor as percentage with Latin digits.
 * e.g. 1.0 => "100%", 0.75 => "75%"
 */
export function formatZoom(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

/**
 * Format page folio display in natural Hindi with strict English digits.
 * e.g. formatPageFolio(1, 4) => "पृष्ठ 1 / 4"
 */
export function formatPageFolio(pageNumber: number, totalPages: number): string {
  return `पृष्ठ ${toEnglishDigits(pageNumber)} / ${toEnglishDigits(totalPages)}`;
}

/**
 * Format page folio header text for a given page.
 * e.g. "पृष्ठ 1 • दैनिक नवप्रभात • मुख्य संस्करण"
 */
export function formatInsideFolio(
  pageNumber: number,
  totalPages: number,
  publicationTitle: string,
  sectionTitle?: string
): string {
  const prefix = sectionTitle ? `${sectionTitle} • ` : '';
  return `${prefix}पृष्ठ ${toEnglishDigits(pageNumber)} / ${toEnglishDigits(totalPages)} • ${publicationTitle}`;
}

const HINDI_MONTHS = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

const HINDI_WEEKDAYS = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

/**
 * Formats a Date object or ISO string into natural Hindi date text with Latin digits.
 * e.g. "मंगलवार, 27 अक्टूबर 2026"
 */
export function formatDateHindi(dateInput: Date | string | number): string {
  const d =
    typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;

  if (isNaN(d.getTime())) {
    return toEnglishDigits(String(dateInput));
  }

  const weekday = HINDI_WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = HINDI_MONTHS[d.getMonth()];
  const year = d.getFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}
