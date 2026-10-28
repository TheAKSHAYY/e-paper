import { describe, it, expect } from 'vitest';
import {
  createNewspaperDocument,
  type NewspaperPage,
} from './index';
import {
  autoToFree,
  freeToAuto,
  calculatePageFullness,
  findNearestFreeSlot,
  swapFrames,
  snapFrame,
  checkAabbOverlap,
} from './freeLayout';

describe('freeLayout Unit Tests', () => {
  const doc = createNewspaperDocument({
    presetId: 'classic-hindi-broadsheet',
    title: 'दैनिक नवप्रभात',
  });

  const page = doc.pages[0] as NewspaperPage;

  it('should convert auto layout page to free layout page (autoToFree)', () => {
    const freePage = autoToFree(page, doc);
    expect(freePage.layoutMode).toBe('free');
    expect(freePage.articles.length).toBe(page.articles.length);

    for (const art of freePage.articles) {
      expect(art.frame).toBeDefined();
      expect(art.frame?.w).toBeGreaterThanOrEqual(10);
      expect(art.frame?.h).toBeGreaterThanOrEqual(10);
      expect(art.frame?.x).toBeGreaterThanOrEqual(8.0); // Page margin
      expect(art.frame?.y).toBeGreaterThanOrEqual(50.0); // Below masthead
    }
  });

  it('should round-trip freeToAuto without crashing and report lossy cases', () => {
    const freePage = autoToFree(page, doc);
    const { page: autoPage, lossyWarnings } = freeToAuto(freePage, doc);

    expect(autoPage.layoutMode).toBe('auto');
    expect(autoPage.articles.length).toBe(freePage.articles.length);
    expect(Array.isArray(lossyWarnings)).toBe(true);

    for (const art of autoPage.articles) {
      expect(art.columnSpan).toBeGreaterThanOrEqual(1);
      expect(art.columnSpan).toBeLessThanOrEqual(12);
    }
  });

  it('should detect AABB overlaps correctly', () => {
    const frameA = { x: 10, y: 10, w: 50, h: 50, z: 1 };
    const frameB = { x: 40, y: 40, w: 50, h: 50, z: 1 }; // overlaps
    const frameC = { x: 70, y: 70, w: 50, h: 50, z: 1 }; // does not overlap A

    expect(checkAabbOverlap(frameA, frameB)).toBe(true);
    expect(checkAabbOverlap(frameA, frameC)).toBe(false);
  });

  it('should calculate page fullness correctly', () => {
    const freePage = autoToFree(page, doc);
    const fullness = calculatePageFullness(freePage, doc);

    expect(fullness.totalPrintableAreaMm2).toBeGreaterThan(0);
    expect(fullness.usedAreaMm2).toBeGreaterThan(0);
    expect(fullness.fullnessPercent).toBeGreaterThan(0);
    expect(fullness.fullnessPercent).toBeLessThanOrEqual(100);
    expect(fullness.displayLabel).toContain('% भरा');
  });

  it('should find nearest free slot for adding blocks or report page full', () => {
    // Empty free page
    const emptyPage: NewspaperPage = {
      id: 'empty-page',
      pageNumber: 1,
      layoutMode: 'free',
      articles: [],
    };

    const slot = findNearestFreeSlot(emptyPage, doc, 80, 50);
    expect(slot.found).toBe(true);
    expect(slot.xMm).toBeDefined();
    expect(slot.yMm).toBeDefined();

    // Oversized block that exceeds page dimensions
    const oversizedSlot = findNearestFreeSlot(emptyPage, doc, 9999, 9999);
    expect(oversizedSlot.found).toBe(false);
    expect(oversizedSlot.reason).toBe('Page bhar gaya - naya page jodein?');
  });

  it('should swap two blocks with different sizes if they fit without collisions', () => {
    const testPage: NewspaperPage = {
      id: 'test-page',
      pageNumber: 1,
      layoutMode: 'free',
      articles: [
        {
          id: 'art-1',
          headline: 'Block 1',
          body: 'Content 1',
          orderIndex: 0,
          columnSpan: 6,
          priority: 'major',
          frame: { x: 20, y: 60, w: 80, h: 40, z: 1 },
        },
        {
          id: 'art-2',
          headline: 'Block 2',
          body: 'Content 2',
          orderIndex: 1,
          columnSpan: 6,
          priority: 'major',
          frame: { x: 120, y: 60, w: 100, h: 60, z: 2 },
        },
      ],
    };

    const result = swapFrames(testPage, doc, 'art-1', 'art-2');
    expect(result.success).toBe(true);

    const swappedA = result.page.articles.find((a) => a.id === 'art-1');
    const swappedB = result.page.articles.find((a) => a.id === 'art-2');

    expect(swappedA?.frame?.x).toBe(120);
    expect(swappedA?.frame?.y).toBe(60);
    expect(swappedB?.frame?.x).toBe(20);
    expect(swappedB?.frame?.y).toBe(60);
  });

  it('should reject swap if larger block would overlap a third block', () => {
    const testPageWithObstacle: NewspaperPage = {
      id: 'test-page-obstacle',
      pageNumber: 1,
      layoutMode: 'free',
      articles: [
        {
          id: 'art-small',
          headline: 'Small Block',
          body: 'Content',
          orderIndex: 0,
          columnSpan: 4,
          priority: 'minor',
          frame: { x: 20, y: 60, w: 30, h: 30, z: 1 },
        },
        {
          id: 'art-huge',
          headline: 'Huge Block',
          body: 'Content',
          orderIndex: 1,
          columnSpan: 12,
          priority: 'lead',
          frame: { x: 150, y: 60, w: 200, h: 100, z: 2 },
        },
        {
          id: 'art-obstacle',
          headline: 'Obstacle Block',
          body: 'Content',
          orderIndex: 2,
          columnSpan: 6,
          priority: 'major',
          // Sits at x=60, which huge block would hit if moved to x=20
          frame: { x: 60, y: 60, w: 50, h: 50, z: 3 },
        },
      ],
    };

    const result = swapFrames(testPageWithObstacle, doc, 'art-small', 'art-huge');
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
    expect(result.message?.length).toBeGreaterThan(0);
  });

  it('should snap frame to 12-column horizontal lines and 4mm vertical module', () => {
    const testPage: NewspaperPage = {
      id: 'snap-test',
      pageNumber: 1,
      layoutMode: 'free',
      articles: [],
    };

    const candidate = {
      x: 10.2, // close to margin ~8.47mm
      y: 63.8, // close to 4mm module ~64mm
      w: 80,
      h: 50,
      z: 1,
    };

    const snapped = snapFrame(candidate, testPage, doc, undefined, 4.0);
    expect(snapped.activeGuides.length).toBeGreaterThan(0);
    expect(snapped.frame.x).toBeGreaterThanOrEqual(8.4);
  });
});
