# E-Paper Maker — Research & Product Data Pack

**Prepared:** 27 October 2026  
**Product direction:** Hindi-first newspaper editor; classic Hindi newspaper look; responsive on desktop, tablet and phone; users choose a template, replace text/photos, then export a print-quality PDF.

This is a practical product-design research pack, not a claim that every suggested size is an industry standard. The sources support the font/script, print and accessibility facts; layout dimensions and style recipes labelled **recommended baseline** are design starting points to test against actual sample content and print proofs.

## Executive recommendation

Build the product around **content-safe newspaper templates**, not a blank design canvas. Users should start with a preset and edit the story, image, caption, byline and edition details. Let them change fonts and emphasis without making them rebuild the layout. Under the hood, keep the design system tokenized: page format, grid, type roles, spacing, colour, image rules and story hierarchy.

The critical differentiator is not the number of fonts. It is **Hindi/Devanagari-safe typesetting + excellent presets + predictable PDF export**.

## 1. Font system

### Recommended first-party font catalog

| Family                  | Best role                                       | Why it belongs                                                                                 | Guardrails                                                                                              |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Noto Serif Devanagari   | Classic masthead, main headline, long-form body | Serif design; multiple weights and widths; made for Devanagari text                            | Primary classic editorial face. Test headline weights and tiny body sizes in real PDF output.           |
| Noto Sans Devanagari    | Secondary headlines, data labels, captions      | Sans-serif Devanagari family with broad script support                                         | Good when density and modern utility matter.                                                            |
| Noto Sans Devanagari UI | App interface, buttons, inputs, controls        | The family is explicitly designed for UI and website use                                       | Keep UI type separate from newspaper page typography.                                                   |
| Hind                    | Body/UI alternative, bylines and metadata       | Open-source Devanagari/Latin family developed for UI; five styles; designed for legibility     | Especially useful when mixing Hindi and Latin names/numbers.                                            |
| Mukta                   | Modern headline and general-purpose text        | Contemporary humanist family with seven weights; supports several Indian scripts and Latin     | Good modern preset; compare actual boldness at newspaper sizes before defaulting it for tiny body text. |
| Yatra One               | Optional display accent / masthead experiment   | Heavy display face inspired by hand-painted Mumbai local railway signage; OFL source available | Accent only; do not use for long headlines or body copy. Provide a restrained fallback.                 |

### Font roles in the editor

Use separate controls for **अख़बार का नाम**, **मुख्य हेडलाइन**, **छोटी हेडलाइन**, **मुख्य समाचार**, **कैप्शन/बायलाइन**, and **ऐप इंटरफ़ेस**. Do not expose only one global font setting: it tends to ruin hierarchy and makes templates look amateurish.

### Suggested font combinations

1. **क्लासिक हिंदी दैनिक:** Noto Serif Devanagari (masthead/headlines/body) + Hind (metadata and UI).
2. **आधुनिक हिंदी दैनिक:** Mukta (headlines) + Noto Sans Devanagari (body/labels) + Hind (UI).
3. **संपादकीय/विशेषांक:** Noto Serif Devanagari (masthead and lead headline) + Noto Sans Devanagari (supporting modules) + Hind (UI).
4. **स्थानीय समाचार:** Noto Serif Devanagari (lead headline) + Hind or Noto Sans Devanagari (compact supporting content).
5. **Display accent:** Yatra One only for a short masthead/section badge, never as the general text font.

These are recommended pairings, not authoritative rules. Show previews with the same Hindi sample text at the actual size used in the layout.

### Font implementation requirements

- Bundle or self-host the exact font files used by the renderer whenever licensing permits; keep each font's OFL/license and attribution files in the repository.
- Prefer a small set of required weights (usually 400, 500/600 if available, 700 and 800 if available) over loading every weight by default. Only advertise weights that are actually bundled.
- Avoid depending on runtime `@import` alone for export. Wait for `document.fonts.ready`; verify expected faces with `document.fonts.check()` before rendering the PDF.
- Keep a safe, script-compatible fallback stack. Test offline mode and test the generated PDF, not just the browser canvas.
- Do not use positive or negative `letter-spacing` as a routine Hindi headline control. Adjust font size, weight, width or line height instead.
- Do not apply Latin `text-transform: uppercase` logic to Hindi text.
- Add a live Devanagari preview to each font selector; never show only Latin “Aa” specimens.

## 2. Hindi / Devanagari correctness (non-negotiable)

The W3C Devanagari layout guidance explains that conjuncts/orthographic syllables are important text units and should generally remain intact during editing and line breaking. Words are primarily separated by spaces, and danda punctuation should not be stranded at the start of a line.

Implement and test these rules:

- Set correct document language metadata (`lang="hi"` for Hindi content; tag mixed-language spans where appropriate).
- Use a browser/rendering stack with complex-script shaping; keep the complete text as Unicode and never split the text into glyphs/individual code points to lay it out.
- Do not use `word-break: break-all`. Keep normal word wrapping and check punctuation/conjunct handling.
- Do not insert arbitrary forced line breaks inside words. Avoid cutting a conjunct, matra, nukta sequence or half-form at column boundaries.
- Disable decorative drop caps for Devanagari by default unless an implementation is specifically tested with conjuncts and combining marks.
- Avoid fixed-height text boxes that silently clip upper/lower marks. Use content measurement and explicit overflow warnings.
- Count graphemes/words with Unicode-aware segmentation; a JavaScript string length is not a user-facing character count for Hindi.
- Test at least: `हिन्दी समाचार`, `कृषि और अर्थव्यवस्था`, `शिक्षा`, `प्रौद्योगिकी`, `क्योंकि`, `श्रद्धांजलि`, `क्षेत्र`, `त्रिकोण`, `श्री`, `दृष्टि`, `केंद्र`, `निःशुल्क`, `ज़िला`, `क़ानून`, `भारत।` and `भारत॥`.

## 3. Newspaper anatomy and design language

Every preset should use the same semantic components so the system remains editable and consistent:

- **Masthead / nameplate:** publication name, optional emblem/mark and edition strap.
- **Top line:** date, edition, city, issue number and price.
- **Section slug / kicker:** short category label above a headline.
- **Lead headline:** the highest-priority story; usually the strongest visual anchor.
- **Deck / standfirst:** one short explanatory line or paragraph below the main headline.
- **Byline / dateline:** author, location and timestamp where relevant.
- **Lead art:** a meaningful photo or graphic with crop position, caption and credit.
- **Body columns:** consistent measure and gutter; don't use a different random width for every article.
- **Secondary stories:** clearly subordinate to the lead by size, placement or rule.
- **Pull quote / fact box / score box:** optional modules for visual rhythm.
- **Advertisement module:** reserved area that cannot overlap articles.
- **Folio:** page number, publication or section label and issue details.
- **Continuation/jumpline:** only for multipage documents; must point to a real page/story.

Design principles backed by print-layout references: consistent margins, columns, gutters and alignment; group related elements; preserve white space; repeat visual rules; and make story priority obvious. These are more valuable than simply copying a newspaper's colours.

## 4. Grids and layout presets

A newspaper grid is a system of margins, columns, gutters and horizontal alignment. No one column count is mandatory for every newspaper. Presets below are **recommended baselines** designed for the kinds of pages this app should create; they need visual QA with short and long Hindi content.

| Preset                   | Page format baseline                               | Grid baseline                                     | Visual behaviour                                                                                                                     |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Classic Hindi Broadsheet | US Broadsheet 381 × 578 mm, custom sizes supported | 8 columns; 8–12 mm outer margin; 3–4 mm gutter    | Traditional masthead, compact edition line, dominant lead story, one large lead image, restrained rules, multiple secondary stories. |
| Classic Berliner         | Berliner 315 × 470 mm                              | 6 columns; 8–10 mm margin; ~3 mm gutter           | Dense but controlled; lead story across 3–4 columns; side rail for briefs.                                                           |
| Modern Hindi Daily       | Berliner or 350 × 500 mm custom                    | 6 columns with modular story spans                | More image-forward, fewer competing headlines, clear section colours and more breathing room.                                        |
| Local News Edition       | Tabloid / Compact 280 × 430 mm baseline            | 4 columns; 7–9 mm margin; ~3 mm gutter            | Community/local stories, small briefs, 1–2 prominent photos, flexible notice/announcement blocks.                                    |
| A3 Special Edition       | A3 297 × 420 mm                                    | 4 columns; 8–10 mm margin; ~3 mm gutter           | School/college event issue, exam result, institutional news, mixed text and images.                                                  |
| A4 Digest / Flyer        | A4 210 × 297 mm                                    | 2 or 3 columns; 8–10 mm margin; 3 mm gutter       | Short digest or one-page newsletter; do not compress it into a full broadsheet's density.                                            |
| Weekend / Feature        | Berliner or custom large sheet                     | 6 columns; larger image zones and more whitespace | Long-read feature, culture, profile and photo essay.                                                                                 |

**Grid maths:** `usableWidth = pageWidth - leftMargin - rightMargin`; `columnWidth = (usableWidth - gutter × (columnCount - 1)) / columnCount`. Each story should use integer grid spans, e.g. 2, 3, 4 or 6 columns. The app should show a grid overlay only in layout/edit mode, not in the exported PDF.

### Recommended starter type scale (print)

The following is an initial type scale to validate—not a universal industry standard. The values are in points and should be adjusted by page format and selected typeface.

| Role                    | Starting range | Notes                                                                            |
| ----------------------- | -------------: | -------------------------------------------------------------------------------- |
| Masthead                |       34–58 pt | Large, but test actual word width; wrap/scale deliberately rather than clipping. |
| Lead headline           |       24–36 pt | Normally 2–4 lines; allow users to set width and span.                           |
| Secondary headline      |       14–22 pt | Distinct from lead, but not too small for Hindi shaping.                         |
| Brief/tertiary headline |       10–14 pt | Avoid extremely narrow columns with long words.                                  |
| Deck / standfirst       |       10–13 pt | Short and clearly subordinate.                                                   |
| Body copy               |    8.5–10.5 pt | Use a font-specific line height; inspect printed proof at actual size.           |
| Byline / dateline       |       7.5–9 pt | Readable metadata, not decorative microcopy.                                     |
| Photo caption / folio   |       7.5–9 pt | Keep sufficient contrast and line height.                                        |
| Section slug / label    |      7.5–10 pt | Weight and rule can create hierarchy without all-caps tricks.                    |

For Devanagari, avoid assuming Latin metrics are adequate. The actual font size and line height must be validated with matras, conjuncts and nukta marks in the PDF.

## 5. Paper format data

Newspaper formats vary by country and printer; the name alone is not enough to guarantee print-ready output. Allow custom width/height and store all sizes in millimetres internally. A3/A4 are ISO paper sizes, while newspaper broadsheet/tabloid variants are publisher/printer dependent.

Recommended initial named sizes (see `paper-sizes.json` for structured data):

- Berliner: 315 × 470 mm (one printer's published specification).
- US Broadsheet: published references differ (for example, 381 × 533 mm versus 381 × 578 mm); treat the name as a configurable starting preset, not a fixed global standard.
- Tabloid/newspaper compact: use a configurable preset around 280 × 430 mm; not the same thing as every country's office tabloid sheet.
- A3: 297 × 420 mm (ISO metric paper size).
- A4: 210 × 297 mm (ISO metric paper size).

For commercial print mode, make trim, bleed, safe area and output profile explicit. A printer's own spec takes precedence. A screen/PDF-download profile may not need commercial-print bleed. The editor must distinguish **page size** from **safe area / printable area**.

## 6. Template catalog roadmap

Ship three polished presets first, then grow based on users' needs:

1. **क्लासिक हिंदी दैनिक** — monochrome-first, large traditional masthead, clear lead, 6/8-column grid, restrained red accent optional.
2. **आधुनिक हिंदी दैनिक** — cleaner negative space, 1–2 strong images, modular tiles, contemporary sans headline support.
3. **स्थानीय समाचार पत्र** — local edition label, locality/date strip, short briefs, notice/ad slot, one main photo.
4. शिक्षा / परीक्षा विशेषांक — result/stat table and school/college news modules.
5. चुनाव / सार्वजनिक सूचना — prominent date/time/area labels and high-contrast data blocks.
6. Weekend / फीचर — large photo, long headline, generous body measure and pull quote.
7. Sports / result page — score cards and standings blocks, not just article columns.
8. Classifieds / announcements — repeated small modules with tight alignment.

Template-switching must preserve all articles, images, captions and metadata. If content doesn't fit, warn the user and offer an explicit choice: “Keep layout and reduce density,” “Move overflowing stories to another page,” or “Use a more compact preset.” Never silently delete/crop content.

## 7. Beginner-friendly editor UX

Recommended flow: **चुनें → लिखें → सजाएँ → डाउनलोड करें**.

### First screen

- Start with three large visual preset cards, each showing a real mini Hindi page preview—not a generic abstract thumbnail.
- Provide “खाली पेज” as a secondary option, not the default.
- Let the user choose paper size, language and page orientation after the preset or under “अधिक विकल्प”.

### Main editor

- Desktop: left side = page/story navigator; center = zoomable page; right side = selected story/style properties; top = save/undo/preview/download.
- Tablet: page remains the primary focus; collapsible property drawer.
- Phone: single-column workflow and bottom action bar; never scale the entire desktop interface down. Article editing should be a focused full-screen sheet with large fields; preview should remain readable with pinch/zoom or fit-to-width.
- Keep common actions visible; place advanced kerning/grid/layout controls under “उन्नत विकल्प”.
- Use specific Hindi labels and helpful microcopy. Show empty states and one sample article the user can replace.
- Photo selection: drag-and-drop and file picker on desktop; camera/gallery file picker on mobile; crop focal point; caption and credit; clear replace/remove actions.
- Undo/redo, autosave status, draft naming, duplicate draft and recovery after reload.
- Warn before leaving with unsaved edits. Autosave locally first; only offer sync once real cloud persistence exists.
- Use actual font specimens, visible weight labels, categories, “इस टेम्पलेट के लिए सुझाया गया” recommendation, and instant live page update.

### Accessibility & responsive checks

WCAG 2.2 Level AA Target Size (Minimum) calls for 24 × 24 CSS pixels or enough spacing, with exceptions. WAI's enhanced guidance recommends 44 × 44 CSS pixels, and Android guidance commonly targets 48 × 48 dp. For a touch-first editor, use about **44–48 px/dp** for high-frequency primary controls where practical, with sufficient spacing.

Test viewport sizes: 360×800, 390×844, 768×1024, 1280×800 and 1440×900. Test keyboard navigation, focus visibility, zoom, touch targets, modal overflow, long Hindi text and landscape phone mode.

## 8. PDF export quality gates

A PDF that opens is not automatically production-ready. The export system must pass all of these:

- Correct physical page box and orientation for the selected format.
- Fonts have loaded before print; critical fonts are embedded/subsetted in the PDF where applicable.
- Hindi text remains selectable/searchable; no accidental full-page rasterization.
- Matras, conjuncts, nukta marks, danda and double danda render without clipping or separation.
- No article, image, caption, byline, folio, ad or rule is clipped by the page edge or hidden under another block.
- No broken/missing images; crop position is preserved; image fit does not distort aspect ratio.
- Correct multipage pagination; folios and continuation links point to the correct pages.
- Overflow detection reports problems before download and offers a fix, not just a generic “export failed”.
- Test offline and on a fresh browser session, not just a warm developer session.
- Print profile explicitly distinguishes ordinary downloadable PDF from a commercial-print file requiring bleed, CMYK/output intent and the printer's required PDF standard.
- Run an automated PDF parse/inspection and render each page to PNG for visual regression. Include text and image coverage checks, page dimensions and font inventory in test artifacts.

## 9. Data model recommendations

Keep these layers separate:

- **Publication:** name, tagline, language, locale, edition, date, issue number, price, logo, publication metadata.
- **Document:** paper format/custom width/height, orientation, margins, bleed, page count, grid definition, style tokens, template id and renderer version.
- **Story:** id, section, priority, headline, kicker, deck, body, author/byline, dateline, image(s), caption, credit, target page, grid span and editorial status.
- **Typography role:** font family id, actual bundled weights, size, line height, alignment, width/measure and optional text colour.
- **Layout block:** story id/module id, column start/span, row/vertical placement rules, image crop, and allowed responsive changes.
- **Export profile:** standard PDF vs print-ready; target page boxes; bleed; color profile; output filename.

Avoid saving a design as only raw CSS. A semantic document model makes templates portable, migration-safe and testable.

## 10. Prioritized build plan

**P0 — correctness:** bundle fonts; apply Hindi-safe shaping/line-breaking rules; font wait/verification for export; no clipping; real PDF inspection; maintain existing content on template changes.

**P1 — quality:** finish role-based font picker; real mini previews; three excellent Hindi templates; grid and type controls; overflow suggestions; desktop/tablet/mobile layouts; undo/redo and draft recovery.

**P2 — breadth:** more page formats, feature/sports/classified templates, custom grids, multi-page story flow and brand kits.

**P3 — service readiness:** deployed renderer URL/configuration, containerized Chromium runtime, proper limits/timeouts/security, observability, and cloud persistence/auth only after designed and tested separately.

## 11. Research sources

1. W3C, Devanagari Layout Requirements — https://www.w3.org/TR/2024/DNOTE-deva-lreq-20240709/
2. W3C, Indic Layout Requirements — https://www.w3.org/TR/2020/WD-ilreq-20200529/
3. Noto Serif Devanagari specimen/docs — https://notofonts.github.io/noto-docs/specimen/NotoSerifDevanagari/
4. Noto Sans Devanagari docs — https://github.com/notofonts/noto-docs/blob/main/docs/specimen/NotoSansDevanagari.md
5. Noto Sans Devanagari UI docs — https://notofonts.github.io/noto-docs/specimen/NotoSansDevanagariUI/
6. Hind family description in Google Fonts repository — https://github.com/google/fonts/blob/main/ofl/hind/DESCRIPTION.en_us.html
7. Mukta family description in Google Fonts repository — https://github.com/google/fonts/blob/main/ofl/mukta/DESCRIPTION.en_us.html
8. Yatra One source/license repository — https://github.com/cathschmidt/yatra-one
9. Google Fonts CSS API (weights, variable fonts and optimized requests) — https://developers.google.com/fonts/docs/css2
10. SIL Open Font License 1.1 — https://openfontlicense.org/
11. OSCE, Layout for print — https://comms.osce.org/guidelines/layout-print
12. Newspaper printing spec example, Berliner 315 × 470 mm — https://www.mafraprint.cz/priprava-dat.aspx?lng=en
13. Paper sizes and newspaper formats — https://print.wiki/data/paper-sizes/ (published sizes vary by source)
14. Newspaper size reference showing another set of format dimensions — https://origamijapan.net/newspaper-paper-sizes/
15. HP, ISO 216 paper dimensions including A3/A4 — https://support.hp.com/in-en/document/bpq04022
16. Adobe, print-ready PDF production — https://helpx.adobe.com/be_en/indesign/desktop/print/print-production-and-file-creation/produce-print-ready-pdf-files.html
17. MDN, print styles and `@page` — https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing
18. W3C WAI, WCAG 2.2 target size minimum — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
19. W3C WAI, enhanced 44 × 44 target size — https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
20. Android Accessibility, touch target sizing — https://support.google.com/accessibility/android/answer/7101858?hl=en
21. CSS font loading specification — https://www.w3.org/TR/css-font-loading/
22. MDN, CSS `hyphens` — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/hyphens

## Final caution

Use these as the first design-system baseline. Before calling a preset “production ready,” generate PDFs containing both short and long Hindi copy, render every page to images, inspect at actual print scale and run the font/overflow checks. The best font list is useless if PDF export uses a fallback font or line-breaking splits Devanagari conjuncts.
