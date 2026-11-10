import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

async function testMobileGestures(viewportWidth, viewportHeight) {
  console.log(`\n======================================================`);
  console.log(`TESTING MOBILE TOUCH & GESTURES @ ${viewportWidth}x${viewportHeight}`);
  console.log(`======================================================`);

  const br = await chromium.launch({ headless: true });
  const context = await br.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
    hasTouch: true,
    isMobile: true
  });
  const pg = await context.newPage();

  await pg.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Open Studio if on landing
  const studioBtn = await pg.$('text=स्टूडियो खोलें');
  if (studioBtn) {
    await studioBtn.click();
    await pg.waitForTimeout(1000);
  }

  // Dismiss wizard if open
  let nextBtn = await pg.$('button:has-text("आगे बढ़ें")');
  while (nextBtn) {
    await nextBtn.click();
    await pg.waitForTimeout(400);
    nextBtn = await pg.$('button:has-text("आगे बढ़ें")');
  }
  const finishBtn = await pg.$('button:has-text("संस्करण बनाएं"), button:has-text("बनाएं")');
  if (finishBtn) {
    await finishBtn.click();
    await pg.waitForTimeout(2000);
  }

  // Check viewport element
  const vpInfo = await pg.evaluate(() => {
    const vp = document.querySelector('[data-testid="canvas-viewport"]');
    if (!vp) return null;
    return {
      scrollWidth: vp.scrollWidth,
      clientWidth: vp.clientWidth,
      scrollHeight: vp.scrollHeight,
      clientHeight: vp.clientHeight,
      scrollLeft: vp.scrollLeft,
      scrollTop: vp.scrollTop,
      overflowX: window.getComputedStyle(vp).overflowX,
      overflowY: window.getComputedStyle(vp).overflowY,
      touchAction: window.getComputedStyle(vp).touchAction
    };
  });
  console.log('1. Initial Canvas Viewport State:', JSON.stringify(vpInfo));

  // Test 2-finger pinch dispatch on viewport
  console.log('2. Simulating 2-Finger Pinch Zoom In...');
  const pinchResult = await pg.evaluate(() => {
    const vp = document.querySelector('[data-testid="canvas-viewport"]');
    if (!vp) return { success: false, reason: 'No viewport' };

    const rect = vp.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Start with 2 fingers 50px apart
    const touch0 = new Touch({ identifier: 0, target: vp, clientX: centerX - 25, clientY: centerY });
    const touch1 = new Touch({ identifier: 1, target: vp, clientX: centerX + 25, clientY: centerY });
    const tsEvent = new TouchEvent('touchstart', {
      touches: [touch0, touch1],
      targetTouches: [touch0, touch1],
      changedTouches: [touch0, touch1],
      bubbles: true,
      cancelable: true
    });
    vp.dispatchEvent(tsEvent);

    // Spread to 150px apart (3x distance -> zoom in)
    const move0 = new Touch({ identifier: 0, target: vp, clientX: centerX - 75, clientY: centerY });
    const move1 = new Touch({ identifier: 1, target: vp, clientX: centerX + 75, clientY: centerY });
    const tmEvent = new TouchEvent('touchmove', {
      touches: [move0, move1],
      targetTouches: [move0, move1],
      changedTouches: [move0, move1],
      bubbles: true,
      cancelable: true
    });
    vp.dispatchEvent(tmEvent);

    const teEvent = new TouchEvent('touchend', {
      touches: [],
      targetTouches: [],
      changedTouches: [move0, move1],
      bubbles: true,
      cancelable: true
    });
    vp.dispatchEvent(teEvent);

    return {
      success: true,
      scrollWidthAfter: vp.scrollWidth,
      scrollLeftAfter: vp.scrollLeft
    };
  });
  console.log('Pinch Dispatch Output:', pinchResult);

  // Test Corner Reachability (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
  console.log('3. Testing 4-Corner Reachability...');
  const cornerAccess = await pg.evaluate(async () => {
    const vp = document.querySelector('[data-testid="canvas-viewport"]');
    if (!vp) return null;

    // Top-Left
    vp.scrollLeft = 0;
    vp.scrollTop = 0;
    const tl = { x: vp.scrollLeft, y: vp.scrollTop };

    // Top-Right
    vp.scrollLeft = vp.scrollWidth;
    vp.scrollTop = 0;
    const tr = { x: vp.scrollLeft, y: vp.scrollTop };

    // Bottom-Left
    vp.scrollLeft = 0;
    vp.scrollTop = vp.scrollHeight;
    const bl = { x: vp.scrollLeft, y: vp.scrollTop };

    // Bottom-Right
    vp.scrollLeft = vp.scrollWidth;
    vp.scrollTop = vp.scrollHeight;
    const br = { x: vp.scrollLeft, y: vp.scrollTop };

    return { tl, tr, bl, br, maxScrollL: vp.scrollWidth - vp.clientWidth, maxScrollT: vp.scrollHeight - vp.clientHeight };
  });
  console.log('Corner Access Coordinates:', JSON.stringify(cornerAccess));

  // Single-finger article touch selection vs 2-finger conflict check
  console.log('4. Testing Article Single-Finger Selection...');
  const articleTouch = await pg.evaluate(() => {
    const art = document.querySelector('[data-testid^="article-"]');
    if (!art) return { found: false };
    const rect = art.getBoundingClientRect();
    const touch = new Touch({ identifier: 10, target: art, clientX: rect.left + 20, clientY: rect.top + 20 });
    art.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], changedTouches: [touch], bubbles: true }));
    art.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touch], bubbles: true }));
    return { found: true, id: art.getAttribute('data-testid') };
  });
  console.log('Article Touch Selection:', articleTouch);

  await pg.screenshot({
    path: `C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/mobile-gestures-${viewportWidth}.png`
  });
  console.log(`Captured screenshot: mobile-gestures-${viewportWidth}.png`);

  await br.close();
}

(async () => {
  await testMobileGestures(390, 844);
  await testMobileGestures(360, 740);
  console.log('\nALL MOBILE GESTURE TESTS FINISHED SUCCESSFULLY!');
})();

