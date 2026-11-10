import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const REF_DIR = path.resolve('epaper_assets_sorted (1)');
const PUBLIC_DIR = path.resolve('apps/web/public/design-library');
const REFERENCES_DEST = path.join(PUBLIC_DIR, 'references');
const MANIFEST_PKG_PATH = path.resolve('packages/template-engine/src/designLibrary/manifest.json');
const MANIFEST_PUBLIC_PATH = path.join(PUBLIC_DIR, 'manifest.json');
const CONTACT_SHEET_PATH = path.resolve('docs/design-library-contact-sheet.html');

// Ensure destination directories exist
fs.mkdirSync(REFERENCES_DEST, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST_PKG_PATH), { recursive: true });
fs.mkdirSync(path.dirname(CONTACT_SHEET_PATH), { recursive: true });

function getDimensions(buf) {
  // PNG: signature 8 bytes, IHDR chunk at offset 8. Width at 16, Height at 20 (BE 32-bit uint)
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { type: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const height = buf.readUInt16BE(offset + 5);
        const width = buf.readUInt16BE(offset + 7);
        return { type: 'jpg', width, height };
      }
      const len = buf.readUInt16BE(offset + 2);
      offset += 2 + len;
    }
  }
  // WebP
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    const chunkType = buf.subarray(12, 16).toString('ascii');
    if (chunkType === 'VP8 ') {
      const keyframeOffset = 20 + 3;
      if (buf[keyframeOffset] === 0x9d && buf[keyframeOffset + 1] === 0x01 && buf[keyframeOffset + 2] === 0x2a) {
        const width = buf.readUInt16LE(keyframeOffset + 3) & 0x3fff;
        const height = buf.readUInt16LE(keyframeOffset + 5) & 0x3fff;
        return { type: 'webp-vp8', width, height };
      }
    } else if (chunkType === 'VP8L') {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
      return { type: 'webp-vp8l', width, height };
    } else if (chunkType === 'VP8X') {
      const width = 1 + buf.readUIntLE(24, 3);
      const height = 1 + buf.readUIntLE(27, 3);
      return { type: 'webp-vp8x', width, height };
    }
  }
  return { type: 'unknown', width: 0, height: 0 };
}

function determineComplexity(width, height, category, subcategory) {
  if (category === 'columns') {
    if (subcategory === '12col' || subcategory === '8col' || subcategory === '6col') return 'complex';
    if (subcategory === '4col' || subcategory === '3col') return 'medium';
    return 'simple';
  }
  if (category === 'headers') {
    return height > 180 ? 'complex' : 'medium';
  }
  if (category === 'rashifal') return 'complex';
  if (category === 'calendar') return 'complex';
  if (category === 'subheaders') return 'simple';
  if (category === 'footers') return 'simple';
  if (category === 'start-decor') return 'simple';
  if (category === 'ads') return 'medium';
  return 'medium';
}

console.log('Scanning 278 assets in:', REF_DIR);
const rawFiles = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else {
      const rel = path.relative(REF_DIR, full).replace(/\\/g, '/');
      const buf = fs.readFileSync(full);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      const dim = getDimensions(buf);
      rawFiles.push({
        fullPath: full,
        relPath: rel,
        filename: entry.name,
        size: buf.length,
        hash,
        ...dim,
      });
    }
  }
}

scanDir(REF_DIR);
console.log(`Found ${rawFiles.length} files.`);

// Sort consistently by path
rawFiles.sort((a, b) => a.relPath.localeCompare(b.relPath));

// Cluster designs by category and canonical base name (stripping hex hash prefix)
const clusters = new Map();

rawFiles.forEach((file) => {
  const parts = file.relPath.split('/');
  const category = parts[0];
  const subcategory = parts.length > 2 ? parts[1] : category;

  // Clean name without hash prefix (e.g. 0bb331_col_2_11.PNG -> col_2_11)
  const ext = path.extname(file.filename);
  const cleanName = file.filename.replace(/^[0-9a-f]{6}_/i, '');
  const baseName = path.basename(cleanName, ext).toLowerCase();
  const clusterKey = `${category}/${subcategory}/${baseName}`;

  if (!clusters.has(clusterKey)) {
    clusters.set(clusterKey, {
      clusterKey,
      category,
      subcategory,
      baseName,
      files: [],
    });
  }
  clusters.get(clusterKey).files.push(file);
});

console.log(`Clustered into ${clusters.size} distinct design templates.`);

// Build final asset manifest items
const manifestItems = [];
let idCounter = 1;

for (const [clusterKey, cluster] of clusters.entries()) {
  // Sort files in cluster: prefer PNG with highest byte size as primary canonical asset
  cluster.files.sort((a, b) => {
    if (a.type === 'png' && b.type !== 'png') return -1;
    if (b.type === 'png' && a.type !== 'png') return 1;
    return b.size - a.size;
  });

  const canonicalFile = cluster.files[0];
  const clusterId = `des-${String(idCounter).padStart(3, '0')}`;
  idCounter++;

  cluster.files.forEach((file, index) => {
    const isCanonical = index === 0;
    const destFileName = `${clusterId}-${file.filename}`;
    const destPath = path.join(REFERENCES_DEST, destFileName);

    // Copy to public assets for browser serving (never touching original)
    fs.copyFileSync(file.fullPath, destPath);

    const publicUrl = `/design-library/references/${destFileName}`;
    const aspectRatio = file.height > 0 ? Number((file.width / file.height).toFixed(3)) : 1;
    const complexity = determineComplexity(file.width, file.height, cluster.category, cluster.subcategory);

    manifestItems.push({
      id: isCanonical ? clusterId : `${clusterId}-var${index}`,
      clusterId,
      filename: file.filename,
      originalPath: file.relPath,
      publicUrl,
      width: file.width,
      height: file.height,
      aspectRatio,
      fileSize: file.size,
      format: file.type,
      category: cluster.category,
      subcategory: cluster.subcategory,
      baseName: cluster.baseName,
      isCanonical,
      variantCount: cluster.files.length,
      relatedFiles: cluster.files.map((f) => f.filename),
      sha256: file.hash,
      complexity,
      status: 'pending', // will be updated as recreated
    });
  });
}

console.log(`Generated manifest for ${manifestItems.length} assets (${clusters.size} canonical designs).`);

// Save manifest to both template-engine and apps/web/public
const manifestJson = JSON.stringify(
  {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalAssets: manifestItems.length,
    canonicalDesignsCount: clusters.size,
    categories: [
      'headers',
      'columns',
      'subheaders',
      'ads',
      'rashifal',
      'footers',
      'start-decor',
      'calendar',
    ],
    items: manifestItems,
  },
  null,
  2
);

fs.writeFileSync(MANIFEST_PKG_PATH, manifestJson, 'utf8');
fs.writeFileSync(MANIFEST_PUBLIC_PATH, manifestJson, 'utf8');
console.log(`Saved manifest to ${MANIFEST_PKG_PATH} and ${MANIFEST_PUBLIC_PATH}`);

// Generate HTML Visual Contact Sheet
const canonicalItems = manifestItems.filter((item) => item.isCanonical);
const itemsByCategory = {};
for (const item of canonicalItems) {
  if (!itemsByCategory[item.category]) itemsByCategory[item.category] = [];
  itemsByCategory[item.category].push(item);
}

const contactSheetHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>E-Paper Studio — Design Library Reference Contact Sheet</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    h1 { margin: 0 0 8px 0; font-size: 24px; color: #38bdf8; }
    .meta { color: #94a3b8; font-size: 13px; margin-bottom: 24px; }
    .category-section { margin-bottom: 40px; background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .cat-title { font-size: 18px; font-weight: 700; color: #f1f5f9; border-bottom: 2px solid #38bdf8; padding-bottom: 8px; margin-top: 0; display: flex; justify-content: space-between; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
    .card { background: #090d16; border: 1px solid #334155; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
    .card-img-wrap { background: #ffffff; padding: 8px; display: flex; align-items: center; justify-content: center; min-height: 140px; max-height: 220px; overflow: hidden; }
    .card img { max-width: 100%; max-height: 200px; object-fit: contain; }
    .card-info { padding: 10px 12px; font-size: 11.5px; display: flex; flex-direction: column; gap: 4px; }
    .card-id { font-weight: 700; color: #38bdf8; }
    .card-name { font-family: monospace; color: #cbd5e1; word-break: break-all; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .badge-simple { background: #065f46; color: #a7f3d0; }
    .badge-medium { background: #854d0e; color: #fef08a; }
    .badge-complex { background: #991b1b; color: #fecaca; }
  </style>
</head>
<body>
  <h1>📰 E-Paper Studio — 278 Reference Design Library Inventory</h1>
  <div class="meta">
    Total Files: <strong>${manifestItems.length}</strong> | 
    Canonical Designs: <strong>${canonicalItems.length}</strong> | 
    Generated: ${new Date().toLocaleString()}
  </div>

  ${Object.entries(itemsByCategory)
    .map(
      ([cat, items]) => `
    <div class="category-section">
      <div class="cat-title">
        <span>📁 ${cat.toUpperCase()}</span>
        <span style="font-size: 13px; font-weight: 500; color: #94a3b8;">${items.length} designs</span>
      </div>
      <div class="grid">
        ${items
          .map(
            (item) => `
          <div class="card">
            <div class="card-img-wrap">
              <img src="../apps/web/public${item.publicUrl}" alt="${item.id}" loading="lazy">
            </div>
            <div class="card-info">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="card-id">${item.id}</span>
                <span class="badge badge-${item.complexity}">${item.complexity}</span>
              </div>
              <div class="card-name">${item.baseName} (${item.subcategory})</div>
              <div style="color: #64748b; font-size: 10.5px;">${item.width} × ${item.height} px • Aspect ${item.aspectRatio} • ${item.format}</div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;

fs.writeFileSync(CONTACT_SHEET_PATH, contactSheetHtml, 'utf8');
console.log(`Generated Visual Contact Sheet at ${CONTACT_SHEET_PATH}`);

