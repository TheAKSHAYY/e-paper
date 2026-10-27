# Testing Strategy & Test Suites

This directory contains integration, end-to-end, visual regression, and PDF compliance tests.

## Structure

- `e2e/`: Browser end-to-end tests validating user flows, publication workflows, and studio interactions.
- `visual/`: Visual regression snapshots comparing grayscale dithering and contrast on simulated e-ink screens.
- `pdf/`: Structural assertions for output PDF dimensions, DPI, page margins, and vector text font embedding.

## Running Tests

- Unit tests: `pnpm test` (Vitest across all packages)
- End-to-end tests: `pnpm test:e2e` (Playwright)
