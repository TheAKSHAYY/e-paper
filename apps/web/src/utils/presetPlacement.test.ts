import { describe, it, expect } from 'vitest';
import { createArticleFromPreset } from './presetPlacement';
import { ELEMENT_PRESETS } from '../components/studio/ElementsPanel';

describe('Preset Placement - createArticleFromPreset', () => {
  it('should preserve all fields for every defined preset in ELEMENT_PRESETS without flattening', () => {
    expect(ELEMENT_PRESETS.length).toBeGreaterThan(0);

    for (const preset of ELEMENT_PRESETS) {
      const created = createArticleFromPreset(preset.data, {
        newId: `test-${preset.id}`,
        defaultColumnCount: 12,
        orderIndex: 3,
      });

      // Basic article metadata
      expect(created.id).toBe(`test-${preset.id}`);
      expect(created.orderIndex).toBe(3);

      // Verify element type matches preset
      if (preset.data.elementType) {
        expect(created.elementType).toBe(preset.data.elementType);
      }

      // Verify borders are preserved
      if (preset.data.borders) {
        expect(created.borders).toBeDefined();
        expect(created.borders).toEqual(preset.data.borders);
      }

      // Verify background colors are preserved
      if (preset.data.backgroundColor) {
        expect(created.backgroundColor).toBe(preset.data.backgroundColor);
      }

      // Verify text colors are preserved
      if (preset.data.textColor) {
        expect(created.textColor).toBe(preset.data.textColor);
      }

      // Verify kicker text is preserved
      if (preset.data.kickerText) {
        expect(created.kickerText).toBe(preset.data.kickerText);
      }

      // Verify short news items are preserved
      if (preset.data.shortNewsItems) {
        expect(created.shortNewsItems).toBeDefined();
        expect(created.shortNewsItems).toEqual(preset.data.shortNewsItems);
      }

      // Verify advertisement data is preserved
      if (preset.data.advertisementData) {
        expect(created.advertisementData).toBeDefined();
        expect(created.advertisementData).toEqual(preset.data.advertisementData);
      }

      // Verify rashifal items are preserved
      if (preset.data.rashifalItems) {
        expect(created.rashifalItems).toBeDefined();
        expect(created.rashifalItems).toEqual(preset.data.rashifalItems);
      }
    }
  });

  describe('Specific Preset Type Verification', () => {
    it('should correctly preserve advertisement preset data (sponsor, phone, cta, dashed border)', () => {
      const adPreset = ELEMENT_PRESETS.find((p) => p.category === 'advertisement');
      expect(adPreset).toBeDefined();
      if (!adPreset) return;

      const created = createArticleFromPreset(adPreset.data);
      expect(created.elementType).toBe('advertisement');
      expect(created.advertisementData).toBeDefined();
      expect(created.advertisementData?.sponsor).toBe(adPreset.data.advertisementData?.sponsor);
      expect(created.advertisementData?.phone).toBe(adPreset.data.advertisementData?.phone);
      expect(created.borders).toEqual(adPreset.data.borders);
      expect(created.backgroundColor).toBe(adPreset.data.backgroundColor);
    });

    it('should correctly preserve rashifal 12 zodiac items and kicker', () => {
      const rashifalPreset = ELEMENT_PRESETS.find((p) => p.id === 'rashifal-12-zodiac-grid');
      expect(rashifalPreset).toBeDefined();
      if (!rashifalPreset) return;

      const created = createArticleFromPreset(rashifalPreset.data);
      expect(created.elementType).toBe('rashifal');
      expect(created.rashifalItems).toHaveLength(12);
      expect(created.rashifalItems?.[0]?.rashi).toBe('मेष (Aries)');
      expect(created.kickerText).toBe('ज्योतिष एवं पंचांग');
    });

    it('should correctly preserve breaking news top-headline with alert background and double rule borders', () => {
      const breakingPreset = ELEMENT_PRESETS.find((p) => p.id === 'top-headline-breaking-banner');
      expect(breakingPreset).toBeDefined();
      if (!breakingPreset) return;

      const created = createArticleFromPreset(breakingPreset.data);
      expect(created.elementType).toBe('top-headline');
      expect(created.backgroundColor).toBe('#fff5f5');
      expect(created.borders?.left).toEqual({ width: 4, style: 'solid', color: '#b91c1c' });
      expect(created.borders?.bottom).toEqual({ width: 3, style: 'double', color: '#b91c1c' });
      expect(created.kickerText).toBe('🚨 ब्रेकिंग न्यूज़ / विशेष बुलेटिन');
    });

    it('should correctly preserve short news bullet digest items', () => {
      const shortNewsPreset = ELEMENT_PRESETS.find((p) => p.id === 'short-news-regional-digest');
      expect(shortNewsPreset).toBeDefined();
      if (!shortNewsPreset) return;

      const created = createArticleFromPreset(shortNewsPreset.data);
      expect(created.elementType).toBe('short-news');
      expect(created.shortNewsItems).toHaveLength(3);
      expect(created.shortNewsItems?.[0]?.title).toBe('मेट्रो विस्तार');
      expect(created.borders?.left?.color).toBe('#2563eb');
    });

    it('should ensure a new block added on a 12-column page gets a valid default span within 12 (TASK 1b)', () => {
      const pageColumnCount = 12;

      // Unspecified columnSpan gets Math.min(2, defaultColumnCount)
      const blockWithoutSpan = createArticleFromPreset(
        {},
        {
          defaultColumnCount: pageColumnCount,
        }
      );
      expect(blockWithoutSpan.columnSpan).toBe(2);
      expect(blockWithoutSpan.columnSpan).toBeLessThanOrEqual(pageColumnCount);

      // Explicit span up to 12 is respected
      const fullWidthBanner = createArticleFromPreset(
        { columnSpan: 12 },
        {
          defaultColumnCount: pageColumnCount,
        }
      );
      expect(fullWidthBanner.columnSpan).toBe(12);
      expect(fullWidthBanner.columnSpan).toBeLessThanOrEqual(pageColumnCount);

      // Presets with defined spans are within 12
      for (const preset of ELEMENT_PRESETS) {
        const created = createArticleFromPreset(preset.data, {
          defaultColumnCount: pageColumnCount,
        });
        expect(created.columnSpan).toBeGreaterThanOrEqual(1);
        expect(created.columnSpan).toBeLessThanOrEqual(12);
      }
    });
  });
});
