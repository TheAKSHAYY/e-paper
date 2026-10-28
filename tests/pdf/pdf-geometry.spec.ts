import { test, expect } from '@playwright/test';
import {
  PAGE_SIZE_DEFINITIONS,
  PageSizePresetSchema,
} from '../../packages/document-schema/src/index';
import { createNewspaperDocument } from '../../packages/template-engine/src/index';
import { RendererWorker, inspectPdf } from '../../apps/renderer/src/index';

test.describe('Newspaper Print Dimensions & Point Geometry Specs', () => {
  const worker = new RendererWorker({ timeoutMs: 35000 });

  test.afterAll(async () => {
    await worker.close();
  });

  test('should verify exact physical point and millimeter standards for newspaper page sizes', async () => {
    const presets = PageSizePresetSchema.options;

    for (const preset of presets) {
      const def = PAGE_SIZE_DEFINITIONS[preset];
      expect(def).toBeDefined();

      // Check positive point dimensions
      expect(def.widthPt).toBeGreaterThan(500);
      expect(def.heightPt).toBeGreaterThan(700);

      // Verify aspect ratio height > width for portrait print
      expect(def.heightPt).toBeGreaterThan(def.widthPt);

      // Verify points to millimeter conversion sanity: 1 pt = 25.4 / 72 mm ≈ 0.352778 mm
      const calculatedWidthMm = Math.round(def.widthPt * (25.4 / 72));
      expect(Math.abs(calculatedWidthMm - def.widthMm)).toBeLessThanOrEqual(2);
    }

    // Explicit broadsheet assertion (standard 15" × 22.75" at 72 pt/in = 1080pt × 1638pt)
    const broadsheet = PAGE_SIZE_DEFINITIONS.broadsheet;
    expect(broadsheet.widthPt).toBe(1080);
    expect(broadsheet.heightPt).toBe(1638);
    expect(broadsheet.description).toContain('Traditional full-format');

    // Tabloid assertion (11" × 17" at 72 pt/in = 792pt × 1224pt)
    const tabloid = PAGE_SIZE_DEFINITIONS.tabloid;
    expect(tabloid.widthPt).toBe(792);
    expect(tabloid.heightPt).toBe(1224);
  });

  test('should generate real vector PDF for Broadsheet and assert physical MediaBox bounds', async () => {
    const doc = createNewspaperDocument({
      title: 'Broadsheet Geometry Test',
      presetId: 'classic-broadsheet',
      pageSize: 'broadsheet',
    });

    const result = await worker.renderToPdf(doc);
    expect(result.fileSizeBytes).toBeGreaterThan(10000);

    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(Math.abs((metadata.mediaBoxes[0]?.width ?? 0) - 1080)).toBeLessThanOrEqual(1);
    expect(Math.abs((metadata.mediaBoxes[0]?.height ?? 0) - 1638)).toBeLessThanOrEqual(1);
    expect(metadata.hasSelectableText).toBe(true);
  });

  test('should generate real vector PDF for Berliner format and assert MediaBox bounds', async () => {
    const doc = createNewspaperDocument({
      title: 'Berliner Geometry Test',
      presetId: 'modern-editorial',
      pageSize: 'berliner',
    });

    const result = await worker.renderToPdf(doc);
    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(Math.abs((metadata.mediaBoxes[0]?.width ?? 0) - 892.8)).toBeLessThanOrEqual(1.5);
    expect(Math.abs((metadata.mediaBoxes[0]?.height ?? 0) - 1332)).toBeLessThanOrEqual(1.5);
  });

  test('should generate real vector PDF for ISO A3 and assert MediaBox bounds', async () => {
    const doc = createNewspaperDocument({
      title: 'A3 Geometry Test',
      presetId: 'compact-local',
      pageSize: 'a3',
    });

    const result = await worker.renderToPdf(doc);
    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    // A3 is 841.89 x 1190.55 pt (tolerance <= 1.5 pt ≈ 0.5 mm)
    expect(Math.abs((metadata.mediaBoxes[0]?.width ?? 0) - 841.89)).toBeLessThanOrEqual(1.5);
    expect(Math.abs((metadata.mediaBoxes[0]?.height ?? 0) - 1190.55)).toBeLessThanOrEqual(1.5);
  });

  test('should swap MediaBox axes accurately for Landscape orientation', async () => {
    const doc = createNewspaperDocument({
      title: 'Landscape Broadsheet Test',
      presetId: 'classic-broadsheet',
      pageSize: 'broadsheet',
    });
    doc.metadata.orientation = 'landscape';

    const result = await worker.renderToPdf(doc);
    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(Math.abs((metadata.mediaBoxes[0]?.width ?? 0) - 1638)).toBeLessThanOrEqual(1);
    expect(Math.abs((metadata.mediaBoxes[0]?.height ?? 0) - 1080)).toBeLessThanOrEqual(1);
  });
});
