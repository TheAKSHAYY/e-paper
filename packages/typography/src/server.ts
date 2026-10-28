import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolves the canonical directory path containing self-hosted typography WOFF2 fonts.
 */
export function getTypographyFontsDir(): string {
  const candidates = [
    path.resolve(__dirname, '../fonts'),
    path.resolve(__dirname, '../../fonts'),
    path.resolve(process.cwd(), 'packages/typography/fonts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0]!;
}

/**
 * Synchronously reads a self-hosted WOFF2 font file from the canonical typography fonts directory.
 * Returns null if the file does not exist.
 */
export function readSelfHostedFont(filename: string): Buffer | null {
  const fontsDir = getTypographyFontsDir();
  const fontPath = path.join(fontsDir, filename);
  if (fs.existsSync(fontPath)) {
    return fs.readFileSync(fontPath);
  }
  return null;
}
