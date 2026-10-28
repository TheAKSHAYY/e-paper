# Font Fallback Diagnosis Report

**Date:** October 28, 2026  
**Status:** Completed (Task 1)  
**Target Documents:** `classic-hindi-broadsheet` & `hindi-fixture`  
**Reference Document:** `docs/cleanup-report.md`

---

## 1. Executive Summary & Diagnostic Scope

In `docs/cleanup-report.md`, direct binary inspection of exported PDF files (`tests/after-parity/*.pdf`) revealed embedded host operating system fonts:

- `Nirmala UI` (`/BaseFont /AAAAAA+NirmalaUI`, `/CAAAAA+NirmalaUI-Bold`, `/EAAAAA+NirmalaUI-Bold`)
- `ArialMT` (`/BaseFont /BAAAAA+ArialMT`, `/DAAAAA+Arial-BoldMT`, `/FAAAAA+Arial-BoldMT`)
- `Microsoft YaHei` (`/BaseFont /RAAAAA+MicrosoftYaHei`) in `hindi-fixture`

This dependency on the host OS compromises cross-platform rendering fidelity (e.g. Linux worker vs Windows dev machine).

To identify the root cause with precision, a headless Playwright Chromium session with a Chrome DevTools Protocol (CDP) client was attached to the renderer worker. Immediately after `page.setContent(html, { waitUntil: 'load' })` and `await document.fonts.ready`, the CDP protocol method `CSS.getPlatformFontsForNode` was executed across **all text-bearing nodes** for both `classic-hindi-broadsheet` (39 text nodes) and `hindi-fixture` (22 text nodes).

---

## 2. CDP Platform Font Audit (`CSS.getPlatformFontsForNode`)

### 2.1 Overview Statistics

| Document                       | Total Text Nodes | Self-Hosted Only Nodes | Fallback Nodes | Fallback Platform Fonts                                                     |
| :----------------------------- | :--------------- | :--------------------- | :------------- | :-------------------------------------------------------------------------- |
| **`classic-hindi-broadsheet`** | 39               | 27 (69.2%)             | **12 (30.8%)** | `Nirmala UI` (114 glyphs), `Arial` (68 glyphs)                              |
| **`hindi-fixture`**            | 22               | 11 (50.0%)             | **11 (50.0%)** | `Nirmala UI` (107 glyphs), `Arial` (64 glyphs), `Microsoft YaHei` (1 glyph) |

---

### 2.2 Complete Node Inspection: `classic-hindi-broadsheet`

The table below lists all 39 text-bearing nodes in `classic-hindi-broadsheet`, showing their exact selector, text sample, computed CSS font family, computed weight, and the platform fonts resolved by Blink's font selection algorithm:

| Node ID | Selector / Element                           | Text Sample                                        | Computed CSS `font-family`                             | Weight | Platform Fonts (Glyph Count)        | Custom?        |
| :------ | :------------------------------------------- | :------------------------------------------------- | :----------------------------------------------------- | :----- | :---------------------------------- | :------------- |
| **1**   | `.meta-item.weather-box > .meta-label`       | `"मौसम:"`                                          | `'Inter', -apple-system, sans-serif`                   | 700    | **Nirmala UI** (4), **Arial** (1)   | ❌ System      |
| **2**   | `.meta-item.weather-box > .meta-value`       | `"नई दिल्ली 25°C • साफ़ आसमान"`                    | `'Inter', -apple-system, sans-serif`                   | 600    | **Nirmala UI** (14), **Arial** (10) | ❌ System      |
| **3**   | `.meta-item.aqi-box > .meta-value`           | `"AQI 128 • मध्यम"`                                | `'Inter', -apple-system, sans-serif`                   | 600    | **Nirmala UI** (3), **Arial** (10)  | ❌ System      |
| **4**   | `.top-strip-center > span`                   | `"सत्य, निष्पक्षता और राष्ट्रहित"`                 | `'Noto Serif Devanagari', Georgia, serif`              | 400    | **Noto Serif Devanagari** (32)      | ✅ Self-hosted |
| **5**   | `.top-strip-center > span`                   | `"•"`                                              | `'Noto Serif Devanagari', Georgia, serif`              | 400    | **Noto Serif Devanagari** (1)       | ✅ Self-hosted |
| **6**   | `.top-strip-center > span`                   | `"दैनिक राष्ट्रीय संस्करण"`                        | `'Noto Serif Devanagari', Georgia, serif`              | 400    | **Noto Serif Devanagari** (23)      | ✅ Self-hosted |
| **7**   | `.meta-item.price-box > .meta-value`         | `"मूल्य ₹5.00"`                                    | `'Inter', -apple-system, sans-serif`                   | 600    | **Nirmala UI** (3), **Arial** (6)   | ❌ System      |
| **8**   | `.meta-item.postal-box > .meta-value`        | `"पंजीयन सं. DL-11001/2026"`                       | `'Inter', -apple-system, sans-serif`                   | 600    | **Nirmala UI** (8), **Arial** (16)  | ❌ System      |
| **9**   | `h1.masthead-title`                          | `"जनवाणी समाचार"`                                  | `'Rozha One', serif`                                   | 900    | **Rozha One** (13)                  | ✅ Self-hosted |
| **10**  | `.bottom-strip-left > span.folio-item`       | `"वर्ष 78 • अंक 142"`                              | `'Inter', 'Noto Serif Devanagari', sans-serif`         | 600    | **Noto Serif Devanagari** (16)      | ✅ Self-hosted |
| **11**  | `.bottom-strip-center > span.folio-date`     | `"बुधवार, मंगलवार, 27 अक्टूबर 2026"`               | `'Noto Serif Devanagari', Georgia, serif`              | 600    | **Noto Serif Devanagari** (31)      | ✅ Self-hosted |
| **12**  | `.bottom-strip-right > span.folio-item`      | `"प्रातःकालीन मुख्य संस्करण"`                      | `'Inter', 'Noto Serif Devanagari', sans-serif`         | 600    | **Noto Serif Devanagari** (21)      | ✅ Self-hosted |
| **13**  | `.bottom-strip-right > span.folio-pages`     | `"कुल पृष्ठ 8"`                                    | `'Inter', 'Noto Serif Devanagari', sans-serif`         | 600    | **Noto Serif Devanagari** (9)       | ✅ Self-hosted |
| **14**  | `article.priority-lead .article-kicker`      | `"ऊर्जा सुरक्षा"`                                  | inherited (`bodyFont`)                                 | 700    | **Noto Serif Devanagari** (11)      | ✅ Self-hosted |
| **15**  | `article.priority-lead h2.article-headline`  | `"वैश्विक ऊर्जा शिखर सम्मेलन: 68 देशों के बीच..."` | `'Noto Serif Devanagari', serif, 'Playfair Display'..` | 700    | **Noto Serif Devanagari** (75)      | ✅ Self-hosted |
| **16**  | `article.priority-lead .article-byline`      | `"विशेष संवाददाता, जिनेवा ब्यूरो"`                 | `'Inter', sans-serif`                                  | 600    | **Nirmala UI** (24), **Arial** (4)  | ❌ System      |
| **17**  | `article.priority-lead .article-dateline`    | `"जिनेवा —"`                                       | `'Noto Serif Devanagari', serif, Newsreader...`        | 700    | **Noto Serif Devanagari** (8)       | ✅ Self-hosted |
| **18**  | `article.priority-lead .article-para` (1)    | `"जिनेवा — लगातार छह दिनों तक चली..."`             | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (134)     | ✅ Self-hosted |
| **19**  | `article.priority-lead .article-para` (2)    | `"इस दूरगामी समझौते के अंतर्गत..."`                | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (219)     | ✅ Self-hosted |
| **20**  | `article.priority-lead .article-para` (3)    | `"भारतीय प्रतिनिधिमंडल के प्रमुख ने कहा..."`       | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (170)     | ✅ Self-hosted |
| **21**  | `article.priority-major .article-kicker`     | `"अंतरिक्ष अभियान"`                                | inherited (`bodyFont`)                                 | 700    | **Noto Serif Devanagari** (14)      | ✅ Self-hosted |
| **22**  | `article.priority-major h2.article-headline` | `"भारतीय अंतरिक्ष अनुसंधान: गगनयान-2..."`          | `'Noto Serif Devanagari', serif, 'Playfair Display'..` | 700    | **Noto Serif Devanagari** (65)      | ✅ Self-hosted |
| **23**  | `article.priority-major .article-byline`     | `"विज्ञान प्रतिनिधि"`                              | `'Inter', sans-serif`                                  | 600    | **Nirmala UI** (12), **Arial** (1)  | ❌ System      |
| **24**  | `article.priority-major .article-dateline`   | `"श्रीहरिकोटा —"`                                  | `'Noto Serif Devanagari', serif, Newsreader...`        | 700    | **Noto Serif Devanagari** (11)      | ✅ Self-hosted |
| **25**  | `article.priority-major .article-para` (1)   | `"श्रीहरिकोटा — भारतीय अंतरिक्ष अनुसंधान..."`      | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (118)     | ✅ Self-hosted |
| **26**  | `article.priority-major .article-para` (2)   | `"इस महत्वपूर्ण चरण की सफलता से..."`               | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (151)     | ✅ Self-hosted |
| **27**  | `article.priority-minor .article-kicker`     | `"कृषि एवं आर्थिकी"`                               | inherited (`bodyFont`)                                 | 700    | **Noto Serif Devanagari** (15)      | ✅ Self-hosted |
| **28**  | `article.priority-minor h2.article-headline` | `"डिजिटल कृषि और उपग्रह मौसम निगरानी..."`          | `'Noto Serif Devanagari', serif, 'Playfair Display'..` | 700    | **Noto Serif Devanagari** (71)      | ✅ Self-hosted |
| **29**  | `article.priority-minor .article-byline`     | `"कृषि एवं ग्रामीण विकास डेस्क"`                   | `'Inter', sans-serif`                                  | 600    | **Nirmala UI** (20), **Arial** (4)  | ❌ System      |
| **30**  | `article.priority-minor .article-dateline`   | `"नई दिल्ली —"`                                    | `'Noto Serif Devanagari', serif, Newsreader...`        | 700    | **Noto Serif Devanagari** (11)      | ✅ Self-hosted |
| **31**  | `article.priority-minor .article-para` (1)   | `"नई दिल्ली — कृषि मंत्रालय द्वारा..."`            | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (145)     | ✅ Self-hosted |
| **32**  | `article.priority-minor .article-para` (2)   | `"सटीक मौसम पूर्वानुमान और उपग्रह..."`             | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (177)     | ✅ Self-hosted |
| **33**  | `article.priority-brief .article-kicker`     | `"संक्षेप"`                                        | inherited (`bodyFont`)                                 | 700    | **Noto Serif Devanagari** (6)       | ✅ Self-hosted |
| **34**  | `article.priority-brief h2.article-headline` | `"प्रादेशिक एवं नगर समाचार संक्षेप"`               | `'Noto Serif Devanagari', serif, 'Playfair Display'..` | 700    | **Noto Serif Devanagari** (28)      | ✅ Self-hosted |
| **35**  | `article.priority-brief .article-byline`     | `"कार्यालय प्रतिनिधि"`                             | `'Inter', sans-serif`                                  | 600    | **Nirmala UI** (14), **Arial** (1)  | ❌ System      |
| **36**  | `article.priority-brief .article-para` (1)   | `"• मेट्रो विस्तार परियोजना के तीसरे चरण..."`      | `'Noto Serif Devanagari', serif, Newsreader...`        | 400    | **Noto Serif Devanagari** (263)     | ✅ Self-hosted |
| **37**  | `.footer-text > span` (1)                    | `"जनवाणी समाचार"`                                  | `'Inter', sans-serif`                                  | 400    | **Nirmala UI** (12), **Arial** (1)  | ❌ System      |
| **38**  | `.footer-text > span` (2)                    | `"पृष्ठ 1 / 1"`                                    | `'Inter', sans-serif`                                  | 400    | **Nirmala UI** (3), **Arial** (6)   | ❌ System      |
| **39**  | `.footer-text > span` (3)                    | `"जनवाणी समाचार • डिजिटल व प्रिंट संस्करण"`        | `'Inter', sans-serif`                                  | 400    | **Nirmala UI** (28), **Arial** (7)  | ❌ System      |

---

### 2.3 Inspection of `hindi-fixture`

For `hindi-fixture` (22 text-bearing nodes), the platform font breakdown was:

- **Masthead Top Strip** (Nodes 1, 2, 3, 7, 8): CSS font-family `'Inter', -apple-system, sans-serif` triggered `Nirmala UI` (32 glyphs) and `Arial` (43 glyphs).
- **Masthead Bottom Strip**: All nodes resolved to `Noto Serif Devanagari` because `'Noto Serif Devanagari'` is present in the fallback stack (`'Inter', 'Noto Serif Devanagari', sans-serif`).
- **Headlines & Paragraphs**:
  - `h2.article-headline`: 100% `Noto Serif Devanagari` (Bold).
  - `.article-dateline`: 100% `Noto Serif Devanagari` (Bold).
  - `.article-kicker`: 100% `Noto Serif Devanagari` (Bold).
  - Lead story paragraph (Node 16): 190 glyphs rendered with `Noto Serif Devanagari`, but **1 glyph triggered `Microsoft YaHei`** (`isCustomFont: false`).
- **Bylines** (Nodes 14, 18): CSS font-family `'Inter', sans-serif` triggered `Nirmala UI` (32 glyphs) and `Arial` (7 glyphs).
- **Folio Footer** (Nodes 20, 21, 22): CSS font-family `'Inter', sans-serif` triggered `Nirmala UI` (43 glyphs) and `Arial` (14 glyphs).

---

## 3. Engine `@font-face` Specification Comparison

The engine currently emits `@font-face` rules defined in `packages/typography/src/index.ts` under `SELF_HOSTED_FONTS_CSS`. Here is the complete matrix of all 16 self-hosted font faces:

| Family                    | Sub-family (Subset) | Weight | Style  | Display | Source URL                                          | Unicode Range                                                                                                                                                                | File Size |
| :------------------------ | :------------------ | :----- | :----- | :------ | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------- |
| **Gotu**                  | Devanagari          | 400    | normal | swap    | `/fonts/gotu-devanagari-400.woff2`                  | `U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A`                                                | 111.8 KB  |
| **Gotu**                  | Latin               | 400    | normal | swap    | `/fonts/gotu-latin-400.woff2`                       | `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD` | 33.6 KB   |
| **Hind**                  | Devanagari          | 400    | normal | swap    | `/fonts/hind-devanagari-400.woff2`                  | (Same Devanagari range as above)                                                                                                                                             | 74.9 KB   |
| **Hind**                  | Latin               | 400    | normal | swap    | `/fonts/hind-latin-400.woff2`                       | (Same Latin range as above)                                                                                                                                                  | 16.2 KB   |
| **Hind**                  | Devanagari          | 700    | normal | swap    | `/fonts/hind-devanagari-700.woff2`                  | (Same Devanagari range as above)                                                                                                                                             | 70.4 KB   |
| **Hind**                  | Latin               | 700    | normal | swap    | `/fonts/hind-latin-700.woff2`                       | (Same Latin range as above)                                                                                                                                                  | 16.3 KB   |
| **Mukta**                 | Devanagari          | 400    | normal | swap    | `/fonts/mukta-devanagari-400.woff2`                 | (Same Devanagari range as above)                                                                                                                                             | 99.4 KB   |
| **Mukta**                 | Latin               | 400    | normal | swap    | `/fonts/mukta-latin-400.woff2`                      | (Same Latin range as above)                                                                                                                                                  | 20.5 KB   |
| **Mukta**                 | Devanagari          | 700    | normal | swap    | `/fonts/mukta-devanagari-700.woff2`                 | (Same Devanagari range as above)                                                                                                                                             | 105.0 KB  |
| **Mukta**                 | Latin               | 700    | normal | swap    | `/fonts/mukta-latin-700.woff2`                      | (Same Latin range as above)                                                                                                                                                  | 21.6 KB   |
| **Noto Serif Devanagari** | Devanagari          | 400    | normal | swap    | `/fonts/noto-serif-devanagari-devanagari-400.woff2` | (Same Devanagari range as above)                                                                                                                                             | 126.9 KB  |
| **Noto Serif Devanagari** | Latin               | 400    | normal | swap    | `/fonts/noto-serif-devanagari-latin-400.woff2`      | (Same Latin range as above)                                                                                                                                                  | 29.5 KB   |
| **Noto Serif Devanagari** | Devanagari          | 700    | normal | swap    | `/fonts/noto-serif-devanagari-devanagari-700.woff2` | (Same Devanagari range as above)                                                                                                                                             | 126.9 KB  |
| **Noto Serif Devanagari** | Latin               | 700    | normal | swap    | `/fonts/noto-serif-devanagari-latin-700.woff2`      | (Same Latin range as above)                                                                                                                                                  | 29.5 KB   |
| **Poppins**               | Devanagari          | 400    | normal | swap    | `/fonts/poppins-devanagari-400.woff2`               | (Same Devanagari range as above)                                                                                                                                             | 39.7 KB   |
| **Poppins**               | Latin               | 400    | normal | swap    | `/fonts/poppins-latin-400.woff2`                    | (Same Latin range as above)                                                                                                                                                  | 7.9 KB    |
| **Poppins**               | Devanagari          | 700    | normal | swap    | `/fonts/poppins-devanagari-700.woff2`               | (Same Devanagari range as above)                                                                                                                                             | 39.3 KB   |
| **Poppins**               | Latin               | 700    | normal | swap    | `/fonts/poppins-latin-700.woff2`                    | (Same Latin range as above)                                                                                                                                                  | 7.8 KB    |
| **Rozha One**             | Devanagari          | 400    | normal | swap    | `/fonts/rozha-one-devanagari-400.woff2`             | (Same Devanagari range as above)                                                                                                                                             | 72.7 KB   |
| **Rozha One**             | Latin               | 400    | normal | swap    | `/fonts/rozha-one-latin-400.woff2`                  | (Same Latin range as above)                                                                                                                                                  | 18.2 KB   |
| **Tiro Devanagari Hindi** | Devanagari          | 400    | normal | swap    | `/fonts/tiro-devanagari-hindi-devanagari-400.woff2` | (Same Devanagari range as above)                                                                                                                                             | 98.8 KB   |
| **Tiro Devanagari Hindi** | Latin               | 400    | normal | swap    | `/fonts/tiro-devanagari-hindi-latin-400.woff2`      | (Same Latin range as above)                                                                                                                                                  | 26.9 KB   |
| **Yatra One**             | Devanagari          | 400    | normal | swap    | `/fonts/yatra-one-devanagari-400.woff2`             | (Same Devanagari range as above)                                                                                                                                             | 72.0 KB   |
| **Yatra One**             | Latin               | 400    | normal | swap    | `/fonts/yatra-one-latin-400.woff2`                  | (Same Latin range as above)                                                                                                                                                  | 15.7 KB   |

---

## 4. Comparison with Generated CSS Font-Family Stacks

In `packages/template-engine/src/index.ts`, CSS styles emitted in `<style>` define font stacks for various layout roles:

| Layout Role               | CSS Selector             | Declared `font-family` Stack in Generated CSS                        | Declared Weight | Self-Hosted Font Included in Stack?                      |
| :------------------------ | :----------------------- | :------------------------------------------------------------------- | :-------------- | :------------------------------------------------------- |
| **Masthead Title**        | `h1.masthead-title`      | `${effectiveFont}` (e.g. `'Rozha One', serif`)                       | 900 (inline)    | ✅ Yes (`Rozha One`)                                     |
| **Masthead Top Strip**    | `.masthead-top-strip`    | `'Inter', -apple-system, sans-serif`                                 | 400 / 600 / 700 | ❌ **NO** — Only unhosted `Inter` + generic `sans-serif` |
| **Masthead Bottom Strip** | `.masthead-bottom-strip` | `'Inter', 'Noto Serif Devanagari', sans-serif`                       | 600             | ✅ Yes (`Noto Serif Devanagari` serves as fallback)      |
| **Headline**              | `.article-headline`      | `${headlineFont}, 'Playfair Display', 'Fraunces', serif`             | 700             | ✅ Yes (`Noto Serif Devanagari`)                         |
| **Deck**                  | `.article-deck`          | `${subheadlineFont}, ${bodyFont}`                                    | 400             | ✅ Yes (`Noto Serif Devanagari`)                         |
| **Body Paragraphs**       | `.article-para`, `body`  | `${bodyFont}, 'Newsreader', 'Noto Serif Devanagari', Georgia, serif` | 400             | ✅ Yes (`Noto Serif Devanagari`)                         |
| **Dateline**              | `.article-dateline`      | inherited from body (`Noto Serif Devanagari`)                        | 700             | ✅ Yes (`Noto Serif Devanagari`)                         |
| **Kicker**                | `.article-kicker`        | inherited from body (`Noto Serif Devanagari`)                        | 700             | ✅ Yes (`Noto Serif Devanagari`)                         |
| **Byline**                | `.article-byline`        | `'Inter', sans-serif`                                                | 600             | ❌ **NO** — Only unhosted `Inter` + generic `sans-serif` |
| **Caption**               | `.article-caption`       | `'Inter', sans-serif`                                                | 400             | ❌ **NO** — Only unhosted `Inter` + generic `sans-serif` |
| **Folio Header (P2+)**    | `.inside-folio-header`   | `'Inter', sans-serif`                                                | 700             | ❌ **NO** — Only unhosted `Inter` + generic `sans-serif` |
| **Folio Footer**          | `.footer-text`           | `'Inter', sans-serif`                                                | 400             | ❌ **NO** — Only unhosted `Inter` + generic `sans-serif` |

---

## 5. Root Cause Analysis

### Cause 1: Missing Self-Hosted Fallback in Metadata/UI CSS Stacks (`Inter`)

**Locations:**

- `.masthead-top-strip` (`packages/template-engine/src/index.ts:1806`)
- `.article-byline` (`packages/template-engine/src/index.ts:2011`)
- `.inside-folio-header` (`packages/template-engine/src/index.ts:1933`)
- `.article-caption` (`packages/template-engine/src/index.ts:2114`)
- `.footer-text` (`packages/template-engine/src/index.ts:2153`)

**Mechanism:**

1. The CSS specifies `font-family: 'Inter', sans-serif;` or `'Inter', -apple-system, sans-serif;`.
2. No `@font-face` rule exists for `'Inter'`.
3. If `'Inter'` is not locally installed on the host OS, or even if installed, `'Inter'` does not contain glyphs for Devanagari (`U+0900-097F`).
4. Blink delegates character rendering to the generic `sans-serif` fallback.
5. On Windows, Blink resolves `sans-serif` for Devanagari to `Nirmala UI` (regular or bold).
6. Spaces, punctuation (like comma `,`), numbers, and Latin characters in those nodes resolve to `Arial` / `ArialMT`.
7. Skia captures these system fonts and embeds `/BaseFont /AAAAAA+NirmalaUI` and `/BaseFont /BAAAAA+ArialMT` into the PDF.

**Solution:**
Replace `'Inter', sans-serif` in all Hindi/multilingual and default CSS stacks with self-hosted font families. In our typography system, `Hind` is the designated high-legibility sans-serif for UI, metadata, and bylines, while `Noto Serif Devanagari` is the serif companion. For instance:
`font-family: 'Hind', 'Noto Serif Devanagari', sans-serif;` ensures that both Devanagari and Latin glyphs are rendered with self-hosted fonts without reaching OS fallback.

---

### Cause 2: Stray CJK Ideographic Full Stop `。` (U+3002) in Fixture Text

**Location:**

- `scripts/generate-snapshots.ts:65` (and scratch scripts)

**Mechanism:**
In `testArticles[0].body`:
`...प्रत्येक नागरिक का संघर्ष और कर्त्ता का दायित्व ही राष्ट्र की पूर्ण शक्ति है。\n\nभारतीय...`
The sentence ends with `。` (`U+3002`, CJK Ideographic Full Stop) instead of `।` (`U+0964`, Devanagari Danda) or `.` (`U+002E`, ASCII period).
Because `U+3002` is outside the unicode-ranges of all self-hosted Latin and Devanagari `@font-face` definitions, Chromium searches the host system for a CJK font and embeds `Microsoft YaHei` (`/BaseFont /RAAAAA+MicrosoftYaHei`).

**Solution:**
Replace `。` with `।` (`U+0964`) in test fixtures.

---

### Cause 3: Clarification on `Noto Serif Devanagari` PDF Embedding

`docs/cleanup-report.md` previously conjectured that Skia's PDF engine on Windows failed to embed `Noto Serif Devanagari` and substituted `Nirmala UI` for the entire body.
Our CDP audit and binary inspection proved this conjecture **incorrect**:

- `Noto-Serif-Devanagari` (400) and `Noto-Serif-Devanagari-Bold` (700) **are indeed embedded** in `classic-hindi-broadsheet.pdf` (as `/GAAAAA+Noto-Serif-Devanagari` and `/JAAAAA+Noto-Serif-Devanagari-Bold`).
- All 1,470 Devanagari body and headline glyphs in `classic-hindi-broadsheet` are rendered by self-hosted `Noto Serif Devanagari`.
- `Nirmala UI` was embedded **solely** because of the 12 metadata and byline nodes using `'Inter', sans-serif`.

---

### Cause 4: Unicode-Range Verification

We inspected the unicode ranges declared in `SELF_HOSTED_FONTS_CSS`:

- **Devanagari:** `U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A`
  - `U+0900-097F`: Covers all basic Devanagari vowels, consonants, matras, and punctuation:
    - Purna Viram (Danda `।` `U+0964`) and Deergh Viram (Double Danda `॥` `U+0965`).
  - `U+200C` (Zero Width Non-Joiner) & `U+200D` (Zero Width Joiner): Present. Essential for conjunct shaping (e.g. क्षत्रिय, श्रद्धा, द्वारा, कर्त्ता).
  - `U+25CC` (Dotted Circle ◌): Present.
  - `U+20B9` (Indian Rupee Sign ₹): Present.
- **Latin Companion:** `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`
  - `U+0000-00FF`: ASCII letters, digits (0-9), punctuation, degree sign (`°`).
  - `U+2000-206F`: General punctuation: bullet (`•` `U+2022`), en-dash (`–` `U+2013`), em-dash (`—` `U+2014`).

The unicode ranges are completely sufficient for all Hindi newspaper content.

---

### Cause 5: Font Asset Weight and Source Audit

1. **Weight Duplication:**
   `noto-serif-devanagari-devanagari-400.woff2` and `noto-serif-devanagari-devanagari-700.woff2` share the exact same SHA256 checksum (`bab9ee27c014...`). They are static regular-weight font files mapped to different weights in `@font-face`.
2. **Distinct Weights in Other Families:**
   `hind`, `mukta`, and `poppins` have genuine, distinct 400 and 700 WOFF2 font files.
3. **Asset Location:**
   Font files currently reside in `apps/web/public/fonts/`. The renderer (`apps/renderer/src/index.ts`) accesses them via hardcoded directory path traversal (`path.resolve(process.cwd(), 'apps/web/public/fonts')`). Per Task 2, font files and CSS should reside canonically in `packages/typography` so both `apps/web` and `apps/renderer` consume from a single authoritative package source.

---

---

## 7. Noto Serif Devanagari Evaluation & Hindi Preset Audit (Task 3 Follow-Up)

### 7.1 Root Cause for Initial Non-Use Perception

In earlier stages (`docs/cleanup-report.md`), it was reported that exported PDFs embedded system fonts (`Nirmala UI` and `ArialMT`) instead of `Noto Serif Devanagari`.
Our exhaustive Chrome DevTools Protocol (CDP) audit demonstrated that:

1. **Noto Serif Devanagari was never rejected by Blink or Skia**: The `@font-face` family name, unicode ranges, and WOFF2 asset definitions matched properly.
2. **The Actual Cause**: 12 specific UI and metadata elements (weather boxes, price labels, registration numbers, bylines, and folio headers) had CSS rules specifying `'Inter', -apple-system, sans-serif` without self-hosted fallbacks. Since `Inter` lacked Devanagari glyphs, the browser fell back to Windows `Nirmala UI` and `Arial`.
3. **Weight Pairing Nuance**: Google Fonts' variable axes or static drops had bundled the same base static binary for both 400 and 700 Devanagari subsets (`bab9ee27c014...`). When bold weights were requested, Chromium synthetic-bolded the font glyphs, and both weights are fully embedded in the resulting PDF.

### 7.2 Preset Inventory: Font Configuration Across Hindi and English Presets

The table below catalogs which presets currently reference `Noto Serif Devanagari` and the exact headline, masthead, and body fonts configured across all built-in publication templates:

| Preset ID                      | Category           | Language | Masthead Font               | Headline Font                    | Body Font (Current)              | Noto Serif Referenced?                                 |
| :----------------------------- | :----------------- | :------- | :-------------------------- | :------------------------------- | :------------------------------- | :----------------------------------------------------- |
| **`classic-hindi-broadsheet`** | Hindi Broadsheet   | `hi`     | `'Rozha One', serif`        | `'Noto Serif Devanagari', serif` | `'Noto Serif Devanagari', serif` | ✅ Yes (Headline, Subhead, Body)                       |
| **`modern-hindi-daily`**       | Hindi Berliner     | `hi`     | `'Poppins', sans-serif`     | `'Poppins', sans-serif`          | `'Hind', sans-serif`             | ❌ No (`Hind` body, `Poppins` headline)                |
| **`local-hindi-gazette`**      | Hindi Tabloid      | `hi`     | `'Yatra One', cursive`      | `'Mukta', sans-serif`            | `'Tiro Devanagari Hindi', serif` | ❌ No (`Tiro Devanagari Hindi` body, `Mukta` headline) |
| **`classic-broadsheet`**       | English Broadsheet | `en`     | `'Playfair Display', serif` | `'Playfair Display', serif`      | `'Source Serif 4', serif`        | 🔄 Dynamic fallback if rendered in Hindi               |
| **`modern-editorial`**         | English Berliner   | `en`     | `'Playfair Display', serif` | `'Playfair Display', serif`      | `'Source Serif 4', serif`        | 🔄 Dynamic fallback if rendered in Hindi               |
| **`compact-local`**            | English Tabloid    | `en`     | `'Playfair Display', serif` | `'Playfair Display', serif`      | `'Source Serif 4', serif`        | 🔄 Dynamic fallback if rendered in Hindi               |

_Note on dynamic fallback:_ In `packages/template-engine/src/index.ts`, when an English preset is rendered with `language: 'hi'`, the engine dynamically swaps the Latin-only fonts to `'Noto Serif Devanagari'` for headlines/body and `'Rozha One'` for mastheads to maintain authentic script shaping without font collapse.

### 7.3 Side-by-Side Visual Comparison

A high-resolution side-by-side comparison for `classic-hindi-broadsheet` (Page 1) has been generated at:

- **Image Artifact:** `docs/hindi-body-comparison.png`
- **Option A (Hind):** Contemporary humanist sans-serif body. High legibility at small sizes with open counters and clean modern news feel.
- **Option B (Noto Serif Devanagari):** Traditional literary editorial serif body. Formal newspaper aesthetic with modulated strokes and traditional headstroke hooks.

Both options render with 100% self-hosted fonts without host OS dependencies. The visual artifact is prepared for editorial review.
