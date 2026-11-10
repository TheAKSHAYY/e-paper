import path from 'node:path';
import { createRequire } from 'node:module';

const rendererRequire = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = rendererRequire('playwright');

(async () => {
  const br = await chromium.launch({ headless: true });
  const pg = await br.newPage();
  await pg.setViewportSize({ width: 1366, height: 768 });
  await pg.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Open Studio if needed
  const studioBtn = await pg.$('text=स्टूडियो खोलें');
  if (studioBtn) {
    await studioBtn.click();
    await pg.waitForTimeout(1000);
  }

  // Dismiss wizard
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

  // Wait for topbar
  await pg.waitForSelector('[data-testid="desktop-top-bar"]', { timeout: 10000 });

  console.log('Finding Tools button...');
  // Find tools button
  const toolsBtn = await pg.$('button:has-text("टूल्स"), button:has-text("Tools")');
  if (!toolsBtn) {
    console.error('FAILED TO FIND TOOLS BUTTON!');
    await br.close();
    return;
  }

  console.log('Clicking Tools button...');
  await toolsBtn.click();
  await pg.waitForTimeout(500);

  // Check if dropdown menu is visible
  const menu = await pg.$('[role="menu"]');
  const isVisible = menu ? await menu.isVisible() : false;
  console.log('Menu visible after click:', isVisible);

  const menuItems = await pg.evaluate(() => {
    const m = document.querySelector('[role="menu"]');
    if (!m) return null;
    const rect = m.getBoundingClientRect();
    const computed = window.getComputedStyle(m);
    return {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      zIndex: computed.zIndex,
      display: computed.display,
      buttons: Array.from(m.querySelectorAll('button')).map(b => b.textContent?.trim())
    };
  });
  console.log('Menu evaluation:', JSON.stringify(menuItems, null, 2));

  await pg.screenshot({
    path: 'C:/Users/Pc/.gemini/antigravity/brain/708fb6a9-d309-4b3e-81e3-f0d9355fdf2b/tools-menu-opened-test.png'
  });

  await br.close();
})();

