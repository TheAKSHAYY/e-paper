# Coding Style & Conventions

1. **TypeScript Strictness**:
   - All code must adhere to strict mode (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`).
   - Explicit return types are required for exported package APIs.
   - Avoid using `any`; use `unknown` with type guards or Zod schemas.

2. **Monorepo Package Boundaries**:
   - Use workspace imports (`@epaper-studio/*`) instead of deep relative paths across packages.
   - Internal module details must not leak across package boundaries; rely strictly on `src/index.ts` exports.

3. **E-Paper Specific Design Constraints**:
   - Color palettes must prioritize 16-level grayscale readability.
   - Contrast ratio must exceed WCAG AAA standards for text on simulated paper backgrounds.
   - Avoid hairline borders and thin font weights (below 400) which deteriorate on electrophoretic displays.

4. **Formatting & Linting**:
   - Prettier formatting with 100-character line width, 2-space indentation, single quotes.
   - Zero ESLint warnings in committed code.
