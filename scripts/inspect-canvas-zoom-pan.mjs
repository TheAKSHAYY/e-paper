import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await page.goto('http://localhost:5173/#editor');
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const vp = document.querySelector('[data-testid="canvas-viewport"]');
    const wrap = document.querySelector('[data-testid="newspaper-canvas-wrapper"]');
    const scaleCont = document.querySelector('.newspaper-canvas-scale-container');
    const sheet = document.querySelector('[data-testid="newspaper-sheet-canvas"]');
    return {
      vp: {
        scrollW: vp?.scrollWidth,
        clientW: vp?.clientWidth,
        scrollL: vp?.scrollLeft,
        overflowX: vp ? window.getComputedStyle(vp).overflowX : null,
      },
      wrap: {
        offsetW: wrap?.offsetWidth,
        scrollW: wrap?.scrollWidth,
        margin: wrap ? window.getComputedStyle(wrap).margin : null,
      },
      scaleCont: {
        offsetW: scaleCont?.offsetWidth,
        offsetL: scaleCont?.offsetLeft,
      },
      sheet: {
        offsetW: sheet?.offsetWidth,
        transform: sheet ? window.getComputedStyle(sheet).transform : null,
      },
    };
  });

  console.log('--- Initial Fit Metrics ---');
  console.log(JSON.stringify(info, null, 2));

  // Now zoom in to scale 1.0 (100%) and check if scrollWidth expands and can pan horizontally
  await page.evaluate(() => {
    window.__setScale?.(1.0);
  });
  await page.waitForTimeout(500);

  const zoomedInfo = await page.evaluate(() => {
    const vp = document.querySelector('[data-testid="canvas-viewport"]');
    const wrap = document.querySelector('[data-testid="newspaper-canvas-wrapper"]');
    const scaleCont = document.querySelector('.newspaper-canvas-scale-container');
    const sheet = document.querySelector('[data-testid="newspaper-sheet-canvas"]');
    
    // Attempt scroll to right
    if (vp) vp.scrollLeft = 500;

    return {
      vp: {
        scrollW: vp?.scrollWidth,
        clientW: vp?.clientWidth,
        scrollL: vp?.scrollLeft,
      },
      wrap: {
        offsetW: wrap?.offsetWidth,
        scrollW: wrap?.scrollWidth,
      },
      scaleCont: {
        offsetW: scaleCont?.offsetWidth,
      },
      canScrollRight: (vp?.scrollWidth ?? 0) > (vp?.clientWidth ?? 0),
    };
  });

  console.log('--- Zoomed (100%) Metrics ---');
  console.log(JSON.stringify(zoomedInfo, null, 2));

  await browser.close();
})();

