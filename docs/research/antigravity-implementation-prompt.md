# Antigravity Build Prompt — E-Paper Maker Research Pack

Use the research data in this folder as the design baseline for the existing E-Paper Studio repository. This is an implementation task, not a request to create a new standalone app.

## Hard constraints

- Inspect the existing repository, architecture, shared document schema, template engine, typography package, renderer and tests before editing. Reuse existing abstractions; do not create a parallel design system.
- Do not commit, push, deploy, change remote Supabase state, or add paid services.
- Do not claim a feature is complete unless there is an automated test or a reproducible manual verification artifact.
- Preserve all existing document content when changing templates, fonts, page format or responsive mode.
- Keep the current PDF renderer working while making improvements. Do not replace actual PDF export with a screenshot or raster page.
- Use the JSON files in this pack as structured starting data, but validate every font's actual available weight and license file in the downloaded/bundled font source. Never advertise a missing weight.
- Grid, type-size and newspaper dimensions are suggested baselines, not universal industry standards. Keep custom paper sizes supported and label publisher/printer-dependent formats clearly.

## Required implementation

### 1. Typography system

- Turn `font-catalog.json` into a typed, validated catalog matching the current project conventions.
- Add role-based typography settings: masthead, lead headline, secondary headline, brief headline, body, deck, caption/byline/metadata and editor UI.
- Build a searchable font picker with categories, actual Devanagari preview text, weight selection, loading/error status, recommended-pairing label and instant page preview update.
- Bundle or self-host necessary font assets if the license allows; keep license files and source/attribution notes. Avoid Google Fonts-only runtime dependency for PDF production.
- Verify fonts are loaded before exporting; wait for the browser font set and confirm required fonts are available. Add a safe fallback without silently claiming the requested font was used.

### 2. Hindi/Devanagari text safety

- Apply Hindi language metadata to Hindi content and preserve Unicode source text.
- Never split text into glyphs/code points for layout. Use shaping-capable text rendering.
- Avoid `word-break: break-all`, arbitrary character-level breaks, global letter spacing on Hindi, and drop caps by default.
- Prevent danda and double danda from appearing alone at the start of a line where feasible.
- Replace naive JavaScript string-length counters with Unicode-aware segmentation where character/grapheme counting is shown.
- Add automated and visual tests using `qa-checklist.json` proof strings; inspect PDF pages for matra, conjunct and nukta clipping.

### 3. Presets and grid system

- Add the templates described in `layout-presets.json` using the current template engine. Make the first three excellent and easy to identify in Hindi:
  1. क्लासिक हिंदी दैनिक
  2. आधुनिक हिंदी दैनिक
  3. स्थानीय समाचार पत्र
- Add grid-based story spans and reusable editorial modules: lead story, secondary story, brief, photo + caption, quote/fact box, notice/ad slot and folio.
- Use consistent margins, columns, gutters, alignment, rules and clear story priority.
- Apply the paper formats in `paper-sizes.json`; clearly distinguish ISO A3/A4 from printer-dependent newspaper formats. Custom dimensions must remain available.
- When a user switches presets, preserve all publication metadata, stories, image URLs/files, captions, credits and page assignments. Warn about overflow and offer safe actions instead of silently clipping/deleting content.
- Keep the grid overlay editor-only; never print the overlay in PDF.

### 4. Beginner-friendly UX on desktop, tablet and phone

- Organize the workflow as: चुनें → लिखें → सजाएँ → डाउनलोड करें.
- Desktop: page/story navigation, central page preview, properties panel and top actions.
- Tablet: adaptive split view with collapsible properties.
- Mobile: touch-first single-column flow, readable page preview, full-screen article editing and reachable primary actions; never just shrink the desktop layout.
- Test viewports: 360×800, 390×844, 768×1024, 1280×800, 1440×900.
- Aim for 44–48 px/dp touch targets for common controls where practical, with spacing and visible keyboard focus.
- Keep advanced layout controls under an “उन्नत विकल्प” section; use Hindi microcopy, real preset thumbnails and realistic dummy stories the user can replace.

### 5. Export and quality gates

- Add PDF regression tests for all formats and templates. Wait for fonts and image decoding before rendering.
- Verify exact PDF dimensions, selectable text, font inventory/embedding, image crops, multiple-page pagination, folios and overflow.
- Render each test PDF page to PNG and keep the artifacts for visual inspection.
- Test both long and short Hindi headlines/body copy, mixed Hindi/Latin content, prices/numbers, danda punctuation and edge cases.
- Keep the current static/development workflow functioning. Do not claim production readiness until the deployed renderer endpoint/configuration and container runtime have been separately verified.
- Use `qa-checklist.json` as the release checklist; report each check as PASS/FAIL/SKIPPED with evidence.

## Required workflow

1. Inspect existing implementation and map each requirement to existing components/files before editing.
2. Give a short plan, then make the minimum coherent set of changes.
3. Run formatting, lint, typecheck, unit tests, E2E tests and production build.
4. Create screenshots for every required viewport and PDF/PNG output for every page format/template.
5. Review the screenshots/PDF page renderings for visual regressions, not only test exit codes.
6. Report changed files, design decisions, tests and exact output-artifact paths. Clearly list unimplemented items and risks.

Do not stop after writing a plan. Implement the highest-priority complete slice and verify it in the same run, unless the repository lacks a required dependency or the tests demonstrate a blocker.
