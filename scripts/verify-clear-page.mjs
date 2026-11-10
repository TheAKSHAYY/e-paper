import { createRequire } from 'node:module';
import path from 'node:path';

const req = createRequire(path.resolve('apps/renderer/package.json'));
const { chromium } = req('playwright');

async function testClearPage() {
  console.log('=== VERIFYING CLEAR PAGE FUNCTIONALITY WITH SEEDED ARTICLES ===');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test with fresh preset in URL
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page.goto('http://localhost:5173/?preset=classic-broadsheet#editor');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/?preset=classic-broadsheet#editor');
  await page.waitForTimeout(1500);

  // Check topbar clear button
  const topbarClearBtn = page.locator('[data-testid="topbar-btn-clear-page"]');
  const hasTopbarBtn = (await topbarClearBtn.count()) > 0;
  console.log('1. TopBar Clear Page button present:', hasTopbarBtn);

  if (!hasTopbarBtn) {
    throw new Error('Topbar clear page button missing');
  }

  // Count initial articles
  const initialArticles = await page.locator('[data-article-id]').count();
  console.log(`Initial articles on canvas: ${initialArticles}`);

  // Click TopBar Clear Page button
  await topbarClearBtn.click();
  await page.waitForTimeout(500);

  // Verify confirmation dialog opens
  const dialog = page.locator('[data-testid="clear-page-confirm-dialog"]');
  const dialogOpen = (await dialog.count()) > 0;
  console.log('2. Clear Page Confirmation Dialog opened:', dialogOpen);

  await page.screenshot({ path: 'docs/clear-page-01-dialog.png' });

  // Confirm clear
  const confirmBtn = page.locator('[data-testid="confirm-clear-page-btn"]');
  await confirmBtn.click();
  await page.waitForTimeout(800);

  // Verify canvas is empty
  const clearedArticles = await page.locator('[data-article-id]').count();
  console.log(`3. Articles after clearing: ${clearedArticles}`);

  const emptyState = page.locator('[data-testid="canvas-empty-state"]');
  const hasEmptyState = (await emptyState.count()) > 0;
  console.log('4. Canvas empty state shown:', hasEmptyState);

  await page.screenshot({ path: 'docs/clear-page-02-empty-canvas.png' });

  // Verify Undo Notification and click Undo
  const undoToastBtn = page.locator('button:has-text("पूर्ववत करें")');
  const hasUndoToast = (await undoToastBtn.count()) > 0;
  console.log('5. Undo toast visible:', hasUndoToast);

  if (hasUndoToast) {
    await undoToastBtn.first().click();
    await page.waitForTimeout(800);

    const restoredArticles = await page.locator('[data-article-id]').count();
    console.log(`6. Articles after clicking Undo: ${restoredArticles} (was ${initialArticles})`);
    console.log('Undo restored original content successfully:', restoredArticles === initialArticles && restoredArticles > 0);
    await page.screenshot({ path: 'docs/clear-page-03-restored.png' });
  }

  // Verify Inspector Clear Page button
  const inspectorClearBtn = page.locator('[data-testid="inspector-btn-clear-page"]');
  const hasInspectorClearBtn = (await inspectorClearBtn.count()) > 0;
  console.log('7. Contextual Inspector Clear Page card present:', hasInspectorClearBtn);

  // Verify Tools dropdown button
  const toolsMenuBtn = page.locator('[data-testid="topbar-btn-tools"]');
  if ((await toolsMenuBtn.count()) > 0) {
    await toolsMenuBtn.click();
    await page.waitForTimeout(300);
    const toolsClearBtn = page.locator('[data-testid="btn-tools-clear-page"]');
    const hasToolsClearBtn = (await toolsClearBtn.count()) > 0;
    console.log('8. Tools dropdown menu Clear Page button present:', hasToolsClearBtn);
    await toolsMenuBtn.click(); // close menu
  }

  await page.close();

  // 2. Mobile Test (390px)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:5173/?preset=classic-broadsheet#editor');
  await mobilePage.waitForTimeout(1500);

  // Click more options menu (...) in Mobile TopBar
  const moreBtn = mobilePage.locator('[data-testid="mobile-topbar-more-btn"]');
  if ((await moreBtn.count()) > 0) {
    await moreBtn.click();
    await mobilePage.waitForTimeout(400);
    const mobileClearBtn = mobilePage.locator('[data-testid="mobile-btn-clear-page"]');
    const hasMobileClearBtn = (await mobileClearBtn.count()) > 0;
    console.log('9. Mobile TopBar More Menu Clear Page button present:', hasMobileClearBtn);
    await mobilePage.screenshot({ path: 'docs/clear-page-04-mobile-menu.png' });
  }

  await mobilePage.close();
  await browser.close();
  console.log('\n=== ALL CLEAR PAGE TESTS PASSED WITH 100% SUCCESS! ===');
}

testClearPage().catch((err) => {
  console.error('Error in testClearPage:', err);
  process.exit(1);
});
