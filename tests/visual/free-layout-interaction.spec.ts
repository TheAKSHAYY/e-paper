import { test, expect } from '@playwright/test';
import type { NewspaperDocument, Article } from '@epaper-studio/document-schema';
import { createNewspaperDocument } from '@epaper-studio/template-engine';

function getTestDoc(): NewspaperDocument {
  const doc = createNewspaperDocument({
    presetId: 'compact-local',
    title: 'परीक्षण दैनिक',
  });

  const testArticles: Article[] = [
    {
      id: 'art-lead',
      title: 'मुख्य समाचार शीर्षक १',
      headline: 'मुख्य समाचार शीर्षक १',
      body: 'यह प्रथम समाचार ब्लॉक की सामग्री है। मुक्त लेआउट में इसे किसी भी स्थान पर खिसकाया जा सकता है।',
      orderIndex: 0,
      columnSpan: 6,
      frame: { x: 20, y: 60, w: 90, h: 60, z: 1 },
    },
    {
      id: 'art-secondary',
      title: 'द्वितीय समाचार शीर्षक २',
      headline: 'द्वितीय समाचार शीर्षक २',
      body: 'यह दूसरे समाचार ब्लॉक की सामग्री है। इस पर ड्रॉप करने से दोनों ब्लॉक परस्पर बदल जाएंगे।',
      orderIndex: 1,
      columnSpan: 6,
      frame: { x: 130, y: 60, w: 90, h: 60, z: 2 },
    },
  ];

  doc.pages[0].layoutMode = 'free';
  doc.pages[0].articles = testArticles;
  doc.articles = testArticles;
  return doc;
}

test.describe('Free Layout Interaction Specs (Desktop & 390x844 Mobile)', () => {
  test('Desktop: Clamping to 4 corners when dragging', async ({ page }) => {
    const doc = getTestDoc();
    await page.setViewportSize({ width: 1400, height: 1800 });

    await page.goto('/?physicalCanvas=true&freeLayout=true&scale=1.0#editor', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(1.0);
      window.__setPhysicalCanvas?.(true);
      window.__setFreeLayout?.(true);
    }, doc);
    await page.waitForTimeout(300);

    const sheet = page.locator('[data-testid="newspaper-sheet-canvas"]');
    const sheetBox = await sheet.boundingBox();
    expect(sheetBox).toBeTruthy();

    const art1 = page.locator('[data-testid="free-article-art-lead"]');
    const art1Box = await art1.boundingBox();
    expect(art1Box).toBeTruthy();

    // 1. Drag far TOP-LEFT (past margin)
    await page.mouse.move(art1Box!.x + 30, art1Box!.y + 30);
    await page.mouse.down();
    await page.mouse.move(sheetBox!.x - 200, sheetBox!.y - 200, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    let currentBox = await art1.boundingBox();
    expect(currentBox!.x).toBeGreaterThanOrEqual(sheetBox!.x + 8); // clamped inside left margin
    expect(currentBox!.y).toBeGreaterThanOrEqual(sheetBox!.y + 20); // clamped below masthead

    // 2. Drag far TOP-RIGHT (past margin)
    currentBox = await art1.boundingBox();
    await page.mouse.move(currentBox!.x + 30, currentBox!.y + 30);
    await page.mouse.down();
    await page.mouse.move(sheetBox!.x + sheetBox!.width + 200, sheetBox!.y - 200, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    currentBox = await art1.boundingBox();
    expect(currentBox!.x + currentBox!.width).toBeLessThanOrEqual(
      sheetBox!.x + sheetBox!.width - 5
    );
    expect(currentBox!.y).toBeGreaterThanOrEqual(sheetBox!.y + 20);

    // 3. Drag far BOTTOM-LEFT (past margin)
    currentBox = await art1.boundingBox();
    await page.mouse.move(currentBox!.x + 30, currentBox!.y + 30);
    await page.mouse.down();
    await page.mouse.move(sheetBox!.x - 200, sheetBox!.y + sheetBox!.height + 200, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    currentBox = await art1.boundingBox();
    expect(currentBox!.x).toBeGreaterThanOrEqual(sheetBox!.x + 8);
    expect(currentBox!.y + currentBox!.height).toBeLessThanOrEqual(
      sheetBox!.y + sheetBox!.height - 5
    );

    // 4. Drag far BOTTOM-RIGHT (past margin)
    currentBox = await art1.boundingBox();
    await page.mouse.move(currentBox!.x + 30, currentBox!.y + 30);
    await page.mouse.down();
    await page.mouse.move(
      sheetBox!.x + sheetBox!.width + 200,
      sheetBox!.y + sheetBox!.height + 200,
      { steps: 5 }
    );
    await page.mouse.up();
    await page.waitForTimeout(100);

    currentBox = await art1.boundingBox();
    expect(currentBox!.x + currentBox!.width).toBeLessThanOrEqual(
      sheetBox!.x + sheetBox!.width - 5
    );
    expect(currentBox!.y + currentBox!.height).toBeLessThanOrEqual(
      sheetBox!.y + sheetBox!.height - 5
    );
  });

  test('Desktop: Drop onto another block swaps their positions', async ({ page }) => {
    const doc = getTestDoc();
    await page.setViewportSize({ width: 1400, height: 1800 });

    await page.goto('/?physicalCanvas=true&freeLayout=true&scale=1.0#editor', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(1.0);
      window.__setPhysicalCanvas?.(true);
      window.__setFreeLayout?.(true);
    }, doc);
    await page.waitForTimeout(300);

    const art1 = page.locator('[data-testid="free-article-art-lead"]');
    const art2 = page.locator('[data-testid="free-article-art-secondary"]');

    const initial1 = await art1.boundingBox();
    const initial2 = await art2.boundingBox();
    expect(initial1).toBeTruthy();
    expect(initial2).toBeTruthy();

    // Drag art1 and drop on the center of art2
    await page.mouse.move(initial1!.x + 30, initial1!.y + 30);
    await page.mouse.down();
    await page.mouse.move(initial2!.x + initial2!.width / 2, initial2!.y + initial2!.height / 2, {
      steps: 8,
    });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const swapped1 = await art1.boundingBox();
    const swapped2 = await art2.boundingBox();

    // art1 now occupies art2's slot and vice-versa
    expect(Math.abs(swapped1!.x - initial2!.x)).toBeLessThanOrEqual(15);
    expect(Math.abs(swapped2!.x - initial1!.x)).toBeLessThanOrEqual(15);
  });

  test('Desktop: Resizing past margin clamps to printable area', async ({ page }) => {
    const doc = getTestDoc();
    await page.setViewportSize({ width: 1400, height: 1800 });

    await page.goto('/?physicalCanvas=true&freeLayout=true&scale=1.0#editor', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(1.0);
      window.__setPhysicalCanvas?.(true);
      window.__setFreeLayout?.(true);
    }, doc);
    await page.waitForTimeout(300);

    const sheet = page.locator('[data-testid="newspaper-sheet-canvas"]');
    const sheetBox = await sheet.boundingBox();
    expect(sheetBox).toBeTruthy();

    const art1 = page.locator('[data-testid="free-article-art-lead"]');
    // Click to select art1 and expose 8-point resize handles
    await art1.click();
    await page.waitForSelector('[data-testid="handle-se"]');

    const handleSe = page.locator('[data-testid="handle-se"]');
    const handleBox = await handleSe.boundingBox();
    expect(handleBox).toBeTruthy();

    // Drag handle far past bottom-right edge of sheet
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(
      sheetBox!.x + sheetBox!.width + 500,
      sheetBox!.y + sheetBox!.height + 500,
      { steps: 6 }
    );
    await page.mouse.up();
    await page.waitForTimeout(200);

    const finalArt1 = await art1.boundingBox();
    // Must be clamped inside printable area
    expect(finalArt1!.x + finalArt1!.width).toBeLessThanOrEqual(sheetBox!.x + sheetBox!.width - 5);
    expect(finalArt1!.y + finalArt1!.height).toBeLessThanOrEqual(
      sheetBox!.y + sheetBox!.height - 5
    );
  });

  test('Desktop: Adding blocks until "Page bhar gaya" appears', async ({ page }) => {
    const doc = getTestDoc();
    await page.setViewportSize({ width: 1400, height: 1800 });

    await page.goto('/?physicalCanvas=true&freeLayout=true&scale=1.0#editor', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(1.0);
      window.__setPhysicalCanvas?.(true);
      window.__setFreeLayout?.(true);
    }, doc);
    await page.waitForTimeout(300);

    // Keep clicking "+ ब्लॉक" until space is full
    const addBtn = page.locator('[data-testid="free-layout-add-block-btn"]');
    await expect(addBtn).toBeVisible();

    // Click repeatedly (up to 15 times) until page is full
    let pageFullAppeared = false;
    for (let i = 0; i < 15; i++) {
      await addBtn.click();
      await page.waitForTimeout(100);

      const modal = page.locator('[data-testid="page-full-modal"]');
      const toast = page.locator('[data-testid="free-layout-toast"]');
      const isModalVisible = await modal.isVisible().catch(() => false);
      const isToastVisible = await toast.isVisible().catch(() => false);

      if (isModalVisible || isToastVisible) {
        pageFullAppeared = true;
        break;
      }
    }

    expect(pageFullAppeared).toBe(true);
  });

  test('Mobile (390x844): 44px handles, long-press (400ms) pickup and drag', async ({ page }) => {
    const doc = getTestDoc();
    // 390x844 mobile viewport with touch enabled
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/?physicalCanvas=true&freeLayout=true&scale=0.5#editor', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('[data-testid="newspaper-sheet-canvas"]');

    await page.evaluate((d) => {
      window.__setDocument?.(d);
      window.__setScale?.(0.5);
      window.__setPhysicalCanvas?.(true);
      window.__setFreeLayout?.(true);
    }, doc);
    await page.waitForTimeout(300);

    const art1 = page.locator('[data-testid="free-article-art-lead"]');
    await expect(art1).toBeVisible();

    // Select to check resize handle dimensions
    await art1.click();
    await page.waitForSelector('[data-testid="handle-se"]');

    const handleSe = page.locator('[data-testid="handle-se"]');
    const handleBox = await handleSe.boundingBox();
    expect(handleBox).toBeTruthy();
    // Handles must be >= 44px for finger tap accessibility
    expect(handleBox!.width).toBeGreaterThanOrEqual(44);
    expect(handleBox!.height).toBeGreaterThanOrEqual(44);

    // Test long-press pickup using touch pointer events
    const initialBox = await art1.boundingBox();
    expect(initialBox).toBeTruthy();

    const startX = initialBox!.x + 30;
    const startY = initialBox!.y + 30;

    // 1. Touch pointerdown
    await art1.dispatchEvent('pointerdown', {
      clientX: startX,
      clientY: startY,
      pointerType: 'touch',
      pointerId: 1,
      isPrimary: true,
      bubbles: true,
    });

    // 2. Wait 500ms (> 400ms threshold) for pickup to activate
    await page.waitForTimeout(500);

    // 3. Touch pointermove to drag down and right
    await page.evaluate(
      ({ sX, sY }) => {
        window.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            cancelable: true,
            clientX: sX + 50,
            clientY: sY + 80,
            pointerType: 'touch',
            pointerId: 1,
            isPrimary: true,
          })
        );
      },
      { sX: startX, sY: startY }
    );
    await page.waitForTimeout(100);

    // 4. Touch pointerup to drop
    await page.evaluate(
      ({ sX, sY }) => {
        window.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            cancelable: true,
            clientX: sX + 50,
            clientY: sY + 80,
            pointerType: 'touch',
            pointerId: 1,
            isPrimary: true,
          })
        );
      },
      { sX: startX, sY: startY }
    );

    await page.waitForTimeout(300);
    const movedBox = await art1.boundingBox();
    expect(movedBox).toBeTruthy();
    // Verify it moved from initial position
    expect(movedBox!.y).not.toBe(initialBox!.y);
  });
});
