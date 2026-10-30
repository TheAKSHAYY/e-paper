import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createNewspaperDocument } from '../../packages/template-engine/src/index';
import { RendererWorker, inspectPdf } from '../../apps/renderer/src/index';

const ARTIFACTS_DIR = path.resolve(process.cwd(), 'artifacts', 'pdf-audit');

test.describe('E-Paper Studio — Production PDF Readiness Audit', () => {
  const worker = new RendererWorker({ timeoutMs: 45000 });

  test.beforeAll(() => {
    if (!fs.existsSync(ARTIFACTS_DIR)) {
      fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    }
  });

  test.afterAll(async () => {
    await worker.close();
  });

  test('Audit Case 1: 10 Long Articles with Multiple Images on Broadsheet', async () => {
    const doc = createNewspaperDocument({
      title: 'The Continental Chronicle',
      presetId: 'classic-broadsheet',
      pageSize: 'broadsheet',
    });

    // Provide 10 realistic long articles with varied priority and multiple images
    const sampleImageBase64 =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23e8e2d5"/><text x="300" y="200" font-family="serif" font-size="28" text-anchor="middle" fill="%23333">Press Photographic Archive</text></svg>';

    const articlesData = [
      {
        title:
          'Global Energy Summit Reaches Unprecedented Treaty on Ultra-High Voltage Direct Current Grids',
        sub: 'Ministers from 68 sovereign nations sign binding accord to interlink regional grids by 2035',
        body: 'GENEVA — In an extraordinary late-night plenary session that concluded six days of grueling negotiations, ministers representing sixty-eight nations unanimously ratified the International Grid Accord.\n\nThe framework establishes binding common standards for ultra-high voltage direct current corridors spanning four continents, creating the technical scaffolding for uninterrupted continent-scale renewable power distribution.\n\n"Today we witness the end of energy isolationism," declared chief envoy Dr. Aris Thorne during the signing ceremony. "A storm in the North Atlantic will soon illuminate homes across the Mediterranean without technical friction or geopolitical arbitrage."\n\nUnder the financing provisions, participating multilateral development institutions will seed a $450 billion guarantee pool to underwrite subsea cable installations across the Baltic, Aegean, and Malacca Straits.\n\nIndustrial consortia have already announced standardized converter equipment orders to align grid voltages and harmonic filters across divergent legacy networks.',
        byline: 'By Arthur Sterling, Diplomatic Affairs Editor',
        dateline: 'GENEVA —',
        imageUrl: sampleImageBase64,
        caption:
          'Delegates convene inside the grand assembly hall following the midnight ratification vote.',
        placement: 'top' as const,
        colSpan: 3,
        priority: 'lead' as const,
      },
      {
        title:
          'Central Bank Confirms Accelerated Transition to Post-Quantum Cryptographic Protocols',
        sub: 'Tier-one financial institutions mandated to deploy lattice-based algorithms within eighteen months',
        body: 'FRANKFURT — The Governing Council this morning published definitive technical guidance mandating post-quantum cryptographic primitives across all tier-one interbank settlement mechanisms by the fourth quarter.\n\nFinancial infrastructure operators must immediately commence dual-signing pilot runs. Field tests conducted over the preceding twelve months demonstrated negligible transaction latency increases despite quadrupled key signatures.\n\nGovernor Hélène Dubois stressed that waiting for cryptanalytically relevant quantum machines to emerge in commercial laboratories would leave national payment backbones unacceptably exposed.',
        byline: 'By Clara Vance, Financial Markets Bureau',
        dateline: 'FRANKFURT —',
        imageUrl: '',
        caption: '',
        placement: 'none' as const,
        colSpan: 2,
        priority: 'major' as const,
      },
      {
        title:
          'Excavations in Indus Basin Unearth Intact Bronze Age Astronomical Observatory Complex',
        sub: 'Concentric stone quadrants challenge established regional chronologies and early geometry origins',
        body: 'HARAPPA PROVINCE — Archaeological expeditions working along the paleo-channel of the Ghaggar-Hakra river have unearthed an astonishingly well-preserved stone observatory dating to approximately 2600 BCE.\n\nThe complex consists of twelve perfectly calibrated dressed-sandstone megaliths arranged in elliptical arcs that correspond precisely with equinoctial sunrises and lunar standstill azimuths.',
        byline: 'By Dr. Rajeshwar Sen, Archaeological Survey',
        dateline: 'HARAPPA —',
        imageUrl: sampleImageBase64,
        caption: 'Excavated concentric alignment circles photographed at dawn.',
        placement: 'middle' as const,
        colSpan: 2,
        priority: 'minor' as const,
      },
      {
        title:
          'Maritime Security Council Tightens Oversight of Arctic Deepwater Navigation Channels',
        sub: 'Icebreaker escorts made mandatory as commercial container traffic surges through northern routes',
        body: 'OSLO — Following record reductions in summer polar pack ice, the Northern Maritime Directorate has introduced mandatory ice-pilot credentials for all commercial cargo vessels traversing the Northeast Passage.\n\nEnvironmental watchdog agencies warned that rising vessel density poses grave hazards to seasonal beluga and bowhead migration corridors.',
        byline: 'By Erik Lindqvist, Maritime Bureau',
        dateline: 'OSLO —',
        imageUrl: '',
        caption: '',
        placement: 'none' as const,
        colSpan: 1,
        priority: 'minor' as const,
      },
      {
        title:
          'Agricultural Yields Surge in Arid Corridors Following Sub-Surface Hydrogel Deployments',
        sub: 'Biodegradable cellulose polymers cut irrigation water demand by sixty-two percent across pilot farms',
        body: 'AL-AIN — Commercial agronomy trials across four thousand hectares of desert perimeter in the Gulf have yielded historic cereal production benchmarks using biodegradable cellulose-based hydrogels.\n\nThe polymer particles, applied alongside seed drills at root depth, absorb winter morning condensation and release moisture gradually under intense diurnal heat.',
        byline: 'By Amina Al-Mansoor, Science Correspondent',
        dateline: 'AL-AIN —',
        imageUrl: '',
        caption: '',
        placement: 'none' as const,
        colSpan: 2,
        priority: 'major' as const,
      },
      {
        title: 'High-Altitude Rail Link Connects Trans-Alpine Freight Terminals Four Months Early',
        sub: 'Continuous concrete slip-form engineering overcomes severe winter avalanche hazards',
        body: 'INNSBRUCK — Tunnel engineering teams broke through the final rock face of the Brenner Base Bypass today, finalizing forty-six kilometers of subterranean transit tunnels through high metamorphic gneiss.',
        byline: 'By Klaus Weber, Infrastructure Bureau',
        dateline: 'INNSBRUCK —',
        imageUrl: '',
        caption: '',
        placement: 'none' as const,
        colSpan: 1,
        priority: 'brief' as const,
      },
      {
        title:
          'Synthetic Biology Laboratory Synthesizes Room-Temperature Biological Catalyst for Plastic Breakdown',
        sub: 'Enzymatic cascade breaks polyamides and polyethylene into pure monomer feedstock in under 48 hours',
        body: 'BOSTON — Molecular bioengineers at the Broad Center published structural crystallography data for a mutated PETase variant capable of depolymerizing mixed post-consumer consumer plastics in neutral room-temperature saline.',
        byline: 'By Sarah Jenkins, Technology Correspondent',
        dateline: 'BOSTON —',
        imageUrl: sampleImageBase64,
        caption: 'Electron microscope scan of purified enzymatic crystals.',
        placement: 'bottom' as const,
        colSpan: 2,
        priority: 'minor' as const,
      },
      {
        title:
          'Municipal Transit Authority Approves Autonomous Light-Rail Expansion for Eastern Suburbs',
        sub: 'Electric automated train sets scheduled for service introduction by autumn 2027',
        body: 'METROPOLIS — The Metropolitan Transit Commission voted 8-1 this morning to award the construction contract for thirty kilometers of grade-separated light rail connecting outlying industrial campuses with the central commercial core.',
        byline: 'By David Rossi, Urban Affairs Desk',
        dateline: 'METROPOLIS —',
        imageUrl: '',
        caption: '',
        placement: 'none' as const,
        colSpan: 2,
        priority: 'minor' as const,
      },
      {
        title:
          'Editorial: The End of National Energy Isolationism and the Imperative of Shared Security',
        sub: 'Cross-border power grids require diplomatic maturity matching their high-voltage technical ambition',
        body: 'The ratification of the International Grid Accord in Geneva represents something profoundly more consequential than standard multilateral diplomacy. For nearly a century, energy sovereignty was conceived as self-containment.\n\nTo bind one nation’s electrical stability to the seasonal wind patterns of a distant neighbor requires not merely technical synchronization, but an enduring commitment to mutual dependency.',
        byline: 'By the Editorial Board',
        dateline: '',
        imageUrl: '',
        caption: '',
        placement: 'none' as const,
        colSpan: 2,
        priority: 'major' as const,
      },
      {
        title:
          'Commercial Briefs: Silicon Foundry Expansions, Sovereign Green Bonds, and Shipping Tariffs',
        sub: 'Daily digest of global market developments, currency fluctuations, and commodity benchmarks',
        body: '• European semiconductor consortium breaks ground on Dresden 2-nanometer fabrication cleanroom.\n• Tokyo exchange lists twelve new yen-denominated green municipal bond series.\n• Global Baltic Dry shipping index registers five-week high on seasonal grain chartering.\n• Nordic forestry conglomerates report record cellulose export volume to packaging manufacturers.',
        byline: 'Chronicle Financial Wire',
        dateline: '',
        imageUrl: '',
        caption: '',
        placement: 'none' as const,
        colSpan: 1,
        priority: 'brief' as const,
      },
    ];

    doc.articles = articlesData.map((art, idx) => ({
      id: `audit-art-${idx + 1}`,
      headline: art.title,
      subheadline: art.sub,
      body: art.body,
      byline: art.byline,
      dateline: art.dateline,
      imageUrl: art.imageUrl,
      imageCaption: art.caption,
      imagePlacement: art.placement,
      columnSpan: art.colSpan,
      priority: art.priority,
      orderIndex: idx,
    }));

    // Render through production renderer
    const result = await worker.renderToPdf(doc);
    expect(result.fileSizeBytes).toBeGreaterThan(20000);

    // Save PDF artifact
    const pdfPath = path.join(ARTIFACTS_DIR, '01_broadsheet_10_articles.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(result.pdfBuffer));
    expect(fs.existsSync(pdfPath)).toBe(true);

    // Parse and assert PDF structure
    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(metadata.pageCount).toBeGreaterThanOrEqual(2); // 10 long stories should span 2 or 3 pages
    expect(metadata.mediaBoxes.length).toBeGreaterThanOrEqual(2);

    // Assert exact physical Broadsheet box bounds (1080 x 1638 pt)
    for (const box of metadata.mediaBoxes) {
      expect(Math.abs(box.width - 1080)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(box.height - 1638)).toBeLessThanOrEqual(1.5);
    }
    expect(metadata.hasSelectableText).toBe(true);

    // Render every page to PNG and inspect
    for (let p = 1; p <= metadata.pageCount; p++) {
      const pngBuffer = await worker.renderToImage(doc, { pageNumber: p, scale: 0.5 });
      const pngPath = path.join(ARTIFACTS_DIR, `01_broadsheet_page_${p}.png`);
      fs.writeFileSync(pngPath, Buffer.from(pngBuffer));
      expect(fs.existsSync(pngPath)).toBe(true);
      expect(pngBuffer.length).toBeGreaterThan(10000);
    }
  }, 45000);

  test('Audit Case 2: Tabloid Compact Format (792 x 1224 pt)', async () => {
    const doc = createNewspaperDocument({
      title: 'The City Gazette',
      presetId: 'compact-local',
      pageSize: 'tabloid',
    });

    const result = await worker.renderToPdf(doc);
    const pdfPath = path.join(ARTIFACTS_DIR, '02_tabloid_compact.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(result.pdfBuffer));

    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(Math.abs((metadata.mediaBoxes[0]?.width ?? 0) - 792)).toBeLessThanOrEqual(1.5);
    expect(Math.abs((metadata.mediaBoxes[0]?.height ?? 0) - 1224)).toBeLessThanOrEqual(1.5);

    const pngBuffer = await worker.renderToImage(doc, { pageNumber: 1, scale: 0.5 });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, '02_tabloid_page_1.png'), Buffer.from(pngBuffer));
  }, 30000);

  test('Audit Case 3: ISO A3 Institutional Format (841.89 x 1190.55 pt)', async () => {
    const doc = createNewspaperDocument({
      title: 'Academic & Science Bulletin',
      presetId: 'modern-editorial',
      pageSize: 'a3',
    });

    const result = await worker.renderToPdf(doc);
    const pdfPath = path.join(ARTIFACTS_DIR, '03_a3_institutional.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(result.pdfBuffer));

    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(Math.abs((metadata.mediaBoxes[0]?.width ?? 0) - 841.89)).toBeLessThanOrEqual(1.5);
    expect(Math.abs((metadata.mediaBoxes[0]?.height ?? 0) - 1190.55)).toBeLessThanOrEqual(1.5);

    const pngBuffer = await worker.renderToImage(doc, { pageNumber: 1, scale: 0.5 });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, '03_a3_page_1.png'), Buffer.from(pngBuffer));
  }, 30000);

  test('Audit Case 4: ISO A4 Compact Digest Format (595.28 x 841.89 pt)', async () => {
    const doc = createNewspaperDocument({
      title: 'Weekly Chronicle Digest',
      presetId: 'classic-broadsheet',
      pageSize: 'a4',
    });

    const result = await worker.renderToPdf(doc);
    const pdfPath = path.join(ARTIFACTS_DIR, '04_a4_digest.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(result.pdfBuffer));

    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(Math.abs((metadata.mediaBoxes[0]?.width ?? 0) - 595.28)).toBeLessThanOrEqual(1.5);
    expect(Math.abs((metadata.mediaBoxes[0]?.height ?? 0) - 841.89)).toBeLessThanOrEqual(1.5);

    const pngBuffer = await worker.renderToImage(doc, { pageNumber: 1, scale: 0.5 });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, '04_a4_page_1.png'), Buffer.from(pngBuffer));
  }, 30000);

  test('Audit Case 5: Hindi / Devanagari Multilingual Newspaper with Complex Typography', async () => {
    const doc = createNewspaperDocument({
      title: 'दैनिक नवप्रभात',
      presetId: 'classic-broadsheet',
      pageSize: 'broadsheet',
      language: 'hi',
    });

    doc.masthead.title = 'दैनिक नवप्रभात';
    doc.masthead.subtitle = 'सत्य, निष्ठा एवं राष्ट्रीय चेतना का संवाहक • स्थापना 1947';
    doc.masthead.edition = 'विशेष प्रभात संस्करण';
    doc.masthead.date = 'मंगलवार, 27 अक्टूबर 2026';
    doc.masthead.weatherNotice = 'मौसम: आंशिक बादल • तापमान 24°C';
    doc.masthead.price = '₹5.00';

    doc.articles = [
      {
        id: 'hi-lead',
        headline:
          'वैश्विक स्वच्छ ऊर्जा शिखर सम्मेलन: 68 देशों के बीच ऐतिहासिक अंतरराष्ट्रीय ग्रिड संधि संपन्न',
        subheadline:
          'चार महाद्वीपों में फैले नवीकरणीय ऊर्जा संचरण गलियारों के लिए सामान्य तकनीकी मानक तय',
        body: 'जिनेवा — संयुक्त राष्ट्र के तत्वावधान में आयोजित वैश्विक ऊर्जा सम्मेलन में अड़सठ देशों के ऊर्जा मंत्रियों ने ऐतिहासिक अंतरराष्ट्रीय ग्रिड संधि पर सर्वसम्मति से हस्ताक्षर किए।\n\nइस दूरगामी समझौते के अनुसार, सदस्य देश अपनी राष्ट्रीय विद्युत ग्रिड प्रणालियों को परस्पर उच्च क्षमता वाले प्रत्यक्ष धारा (HVDC) संचरण गलियारों से जोड़ेंगे।\n\nभारतीय प्रतिनिधिमंडल के प्रमुख ने कहा, "यह समझौता केवल ऊर्जा साझा करने का साधन नहीं, बल्कि जलवायु परिवर्तन के विरुद्ध सामूहिक संकल्प का प्रतीक है।"\n\nपरियोजना के पहले चरण में अटलांटिक, भूमध्यसागर और हिंद महासागर के समुद्री केबल मार्गों के लिए वित्तीय सहायता आवंटित की जाएगी।',
        byline: 'ब्यूरो रिपोर्ट, नई दिल्ली',
        dateline: 'जिनेवा —',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 3,
        priority: 'lead',
        orderIndex: 0,
      },
      {
        id: 'hi-major',
        headline: 'सिंधु-घग्गर घाटी में मिली प्राचीनतम कांस्य युगीन खगोलीय वेधशाला के प्रमाण',
        subheadline:
          'सूर्य एवं चंद्र संरेखण के साथ स्थापित प्रस्तर संरचनाएं प्राचीन विज्ञान पर नया प्रकाश डालती हैं',
        body: 'हड़प्पा क्षेत्र — पुरातत्वविदों के संयुक्त दल ने घग्गर नदी के प्राचीन प्रवाह क्षेत्र में ईसा पूर्व 2600 की एक असाधारण खगोलीय वेधशाला खोजी है।\n\nविशेषज्ञों के अनुसार, पत्थरों की यह गोलाकार व्यवस्था विषुव और अयनांत की सटीक गणना के लिए स्थापित की गई थी।',
        byline: 'डॉ. रमेश चंद्र, पुरातत्व विभाग',
        dateline: 'हड़प्पा —',
        imageUrl: '',
        imageCaption: '',
        imagePlacement: 'none',
        columnSpan: 2,
        priority: 'major',
        orderIndex: 1,
      },
    ];

    const result = await worker.renderToPdf(doc);
    const pdfPath = path.join(ARTIFACTS_DIR, '05_hindi_devanagari.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(result.pdfBuffer));

    const metadata = inspectPdf(result.pdfBuffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(metadata.hasSelectableText).toBe(true);

    const pngBuffer = await worker.renderToImage(doc, { pageNumber: 1, scale: 0.5 });
    fs.writeFileSync(path.join(ARTIFACTS_DIR, '05_hindi_page_1.png'), Buffer.from(pngBuffer));
  }, 35000);

  test('Audit Case 6: Browser UI Export Workflow with Real Download Event', async ({ page }) => {
    test.slow();
    let renderEndpointCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/render-pdf')) {
        renderEndpointCalled = true;
      }
    });

    await page.goto('/#editor');

    const exportBtn = page.locator('[data-testid="btn-export-pdf"]');
    await expect(exportBtn).toBeVisible();

    // Trigger download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 50000 });

    await exportBtn.click();

    // Await download completion
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.pdf$/i);

    const downloadPath = path.join(ARTIFACTS_DIR, '06_browser_ui_downloaded.pdf');
    await download.saveAs(downloadPath);

    expect(fs.existsSync(downloadPath)).toBe(true);
    const fileStats = fs.statSync(downloadPath);
    expect(fileStats.size).toBeGreaterThan(15000);

    // Verify downloaded binary header
    const buffer = fs.readFileSync(downloadPath);
    const header = buffer.subarray(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');

    const metadata = inspectPdf(buffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(metadata.mediaBoxes[0]?.width).toBe(1080);
    expect(metadata.mediaBoxes[0]?.height).toBe(1638);
    // Confirm zero external renderer calls
    expect(renderEndpointCalled).toBe(false);
  }, 60000);

  test('Audit Case 7: Mobile Viewport Browser UI Export Workflow with Real Download Event', async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width: 390, height: 844 });

    let renderEndpointCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/render-pdf')) {
        renderEndpointCalled = true;
      }
    });

    await page.goto('/#editor');

    const mobileExportBtn = page.locator('[data-testid="mobile-export-pdf-btn"]');
    await expect(mobileExportBtn).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 50000 });
    await mobileExportBtn.click();

    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.pdf$/i);

    const downloadPath = path.join(ARTIFACTS_DIR, '07_mobile_ui_downloaded.pdf');
    await download.saveAs(downloadPath);

    expect(fs.existsSync(downloadPath)).toBe(true);
    const fileStats = fs.statSync(downloadPath);
    expect(fileStats.size).toBeGreaterThan(15000);

    const buffer = fs.readFileSync(downloadPath);
    const header = buffer.subarray(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');

    const metadata = inspectPdf(buffer);
    expect(metadata.isValidPdf).toBe(true);
    expect(metadata.pageCount).toBeGreaterThanOrEqual(1);
    // Confirm zero external renderer calls
    expect(renderEndpointCalled).toBe(false);
  }, 60000);
});
