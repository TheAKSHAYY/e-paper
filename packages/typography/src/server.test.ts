import { describe, it, expect } from 'vitest';
import { getTypographyFontsDir, readSelfHostedFont } from './server';
import * as fs from 'fs';

describe('typography server font loader', () => {
  it('resolves canonical fonts directory containing WOFF2 assets', () => {
    const dir = getTypographyFontsDir();
    expect(fs.existsSync(dir)).toBe(true);
    expect(fs.existsSync(`${dir}/noto-serif-devanagari-devanagari-400.woff2`)).toBe(true);
    expect(fs.existsSync(`${dir}/hind-devanagari-400.woff2`)).toBe(true);
  });

  it('reads self-hosted font binary buffers correctly', () => {
    const buf = readSelfHostedFont('noto-serif-devanagari-devanagari-400.woff2');
    expect(buf).not.toBeNull();
    expect(buf!.length).toBeGreaterThan(50000);
  });

  it('returns null for nonexistent font files', () => {
    const buf = readSelfHostedFont('nonexistent-font.woff2');
    expect(buf).toBeNull();
  });
});
