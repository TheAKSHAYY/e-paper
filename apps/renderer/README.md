# @epaper-studio/renderer

Headless Node.js rendering worker utilizing Playwright and Chromium to convert HTML/CSS/SVG layouts into vector PDF and e-paper optimized 16-level grayscale bitmaps.

## Architecture

- Standalone Node.js service designed to scale horizontally as queue workers (Supabase pg_cron / BullMQ / AWS SQS).
- Strict dimension control adhering to hardware device profiles (`kindle-scribe`, `remarkable-2`, etc.).
- Embedded font rendering with full support for complex text shaping (Arabic, CJK, Indic).

## Testing

- Unit tests: `pnpm test`
- Visual regression tests: `pnpm test:e2e` (targeted tests in root `tests/visual/` and `tests/pdf/`)
