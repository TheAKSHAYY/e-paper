# Architecture Principles

1. **Decoupled Engine & Renderer**:
   - The web app (`apps/web`) is a composition UI and layout designer.
   - The renderer (`apps/renderer`) is a headless worker executing batch PDF generation.
   - Both rely on canonical schemas defined in `packages/document-schema` without circular dependencies.

2. **Multilingual First**:
   - Never assume left-to-right (LTR) directionality or fixed Latin character widths.
   - Font cascades in `packages/typography` must be consulted for text measurement and rendering.

3. **E-Paper Hardware Awareness**:
   - Hardware profiles define strict dimensions and DPI ratings. Do not use generic screen breakpoints for document pages.
