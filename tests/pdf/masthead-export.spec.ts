import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createNewspaperDocument } from '../../packages/template-engine/src/index';
import { RendererWorker, inspectPdf } from '../../apps/renderer/src/index';

test.describe('Authentic Hindi Daily Newspaper Masthead & PDF Verification', () => {
  const worker = new RendererWorker({ timeoutMs: 35000 });

  test.afterAll(async () => {
    await worker.close();
  });

  test('should generate pure-white vector PDF and PNG page preview with authentic 3-row Indian masthead', async () => {
    const doc = createNewspaperDocument({
      title: 'जनवाणी समाचार',
      presetId: 'classic-hindi-broadsheet',
      pageSize: 'broadsheet',
    });

    doc.masthead.title = 'जनवाणी समाचार';
    doc.masthead.tagline = 'सत्य, निष्पक्षता और जनसेवा का प्रतीक';
    doc.masthead.establishmentYear = '1947';
    doc.masthead.weatherCity = 'नई दिल्ली';
    doc.masthead.temperature = '25°C';
    doc.masthead.weatherCondition = 'साफ़ आसमान';
    doc.masthead.airQuality = 'AQI 128 • मध्यम';
    doc.masthead.price = 'मूल्य ₹5.00';
    doc.masthead.postalRegNumber = 'पंजीयन सं. DL-11001/2026';
    doc.masthead.pageCountLabel = 'कुल पृष्ठ 8';
    doc.masthead.dayOfWeek = 'बुधवार';
    doc.masthead.date = '28 अक्टूबर 2026';
    doc.masthead.volumeYear = 'वर्ष 78';
    doc.masthead.issueCount = 'अंक 142';
    doc.masthead.issueNumber = 'वर्ष 78 • अंक 142';
    doc.masthead.edition = 'प्रातःकालीन मुख्य संस्करण';
    doc.masthead.fontFamily = "'Rozha One', serif";
    doc.masthead.fontSizePt = 54;
    doc.masthead.alignment = 'center';
    doc.masthead.ruleStyle = 'ornate-double';
    doc.masthead.emblem = 'ashoka-chakra';
    doc.masthead.showEmblem = true;
    doc.masthead.showTopStrip = true;
    doc.masthead.showWeather = true;
    doc.masthead.showAirQuality = true;
    doc.masthead.showTagline = true;
    doc.masthead.showEstablishment = true;
    doc.masthead.showPrice = true;
    doc.masthead.showPostalReg = true;
    doc.masthead.showBottomStrip = true;
    doc.masthead.showVolumeIssue = true;
    doc.masthead.showDate = true;
    doc.masthead.showEdition = true;

    // 1. Render Vector PDF
    const pdfResult = await worker.renderToPdf(doc);
    expect(pdfResult.fileSizeBytes).toBeGreaterThan(15000);

    const pdfPath = path.resolve(
      'C:/Users/Pc/.gemini/antigravity-ide/brain/1c9bef0a-f8de-40ce-aa81-af1362a42da4/exported_hindi_newspaper.pdf'
    );
    fs.writeFileSync(pdfPath, pdfResult.pdfBuffer);

    const pdfInfo = inspectPdf(pdfResult.pdfBuffer);
    expect(pdfInfo.isValidPdf).toBe(true);
    expect(pdfInfo.mediaBoxes[0]?.width).toBe(1080);
    expect(pdfInfo.mediaBoxes[0]?.height).toBe(1638);

    // 2. Render Page 1 PNG Preview
    const pngBuffer = await worker.renderToImage(doc, { pageNumber: 1, scale: 1.0 });
    expect(pngBuffer.length).toBeGreaterThan(20000);

    const pngPath = path.resolve(
      'C:/Users/Pc/.gemini/antigravity-ide/brain/1c9bef0a-f8de-40ce-aa81-af1362a42da4/exported_hindi_newspaper_page1.png'
    );
    fs.writeFileSync(pngPath, pngBuffer);
  });
});
