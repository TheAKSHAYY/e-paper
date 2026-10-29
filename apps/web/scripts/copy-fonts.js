import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import console from 'node:console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function copyFonts() {
  const candidateDirs = [
    path.resolve(__dirname, '../../../packages/typography/fonts'),
    path.resolve(__dirname, '../../packages/typography/fonts'),
    path.resolve(process.cwd(), 'packages/typography/fonts'),
    path.resolve(process.cwd(), '../packages/typography/fonts'),
    path.resolve(process.cwd(), '../../packages/typography/fonts'),
  ];

  const srcDir = candidateDirs.find((d) => fs.existsSync(d));
  if (!srcDir) {
    console.warn('[copy-fonts] Could not locate packages/typography/fonts directory.');
    return { total: 0, copied: 0 };
  }

  const destDir = path.resolve(__dirname, '../public/fonts');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);
  let copied = 0;

  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    if (fs.statSync(srcFile).isFile()) {
      const needsCopy =
        !fs.existsSync(destFile) ||
        fs.statSync(srcFile).size !== fs.statSync(destFile).size;

      if (needsCopy) {
        fs.copyFileSync(srcFile, destFile);
        copied++;
      }
    }
  }

  return { total: files.length, copied };
}

// Execute directly if run as a script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = copyFonts();
  console.log(`[copy-fonts] Synced ${result.total} fonts to public/fonts (${result.copied} updated)`);
}
