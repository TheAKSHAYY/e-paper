import fs from 'fs';
import path from 'path';
import { createNewspaperDocument } from '../packages/template-engine/src/index';
import { RendererWorker, inspectPdf } from '../apps/renderer/src/index';

async function main() {
  const worker = new RendererWorker({ timeoutMs: 35000 });

  try {
    const doc = createNewspaperDocument({
      title: 'जनवाणी समाचार',
      presetId: 'classic-hindi-broadsheet',
      pageSize: 'broadsheet',
    });

    // Populate all authentic Hindi newspaper masthead fields
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

    console.log('Rendering vector PDF...');
    const pdfResult = await worker.renderToPdf(doc);
    const pdfPath = path.resolve('C:/Users/Pc/.gemini/antigravity-ide/brain/1c9bef0a-f8de-40ce-aa81-af1362a42da4/exported_hindi_newspaper.pdf');
    fs.writeFileSync(pdfPath, pdfResult.pdfBuffer);
    console.log(`Saved PDF to ${pdfPath} (${pdfResult.fileSizeBytes} bytes)`);

    const pdfInfo = inspectPdf(pdfResult.pdfBuffer);
    console.log('PDF Inspection:', JSON.stringify(pdfInfo, null, 2));

    console.log('Rendering raster PNG preview of printed page...');
    const previewResult = await worker.renderPreviewPng(doc, { pageIndex: 0, scale: 1.0 });
    const pngPath = path.resolve('C:/Users/Pc/.gemini/antigravity-ide/brain/1c9bef0a-f8de-40ce-aa81-af1362a42da4/exported_hindi_newspaper_page1.png');
    fs.writeFileSync(pngPath, previewResult.pngBuffer);
    console.log(`Saved PNG preview to ${pngPath} (${previewResult.fileSizeBytes} bytes)`);

  } finally {
    await worker.close();
  }
}

main().catch((err) => {
  console.error('Render error:', err);
  process.exit(1);
});
