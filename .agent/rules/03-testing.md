# Testing & Verification Rules

1. **Unit Tests (Vitest)**:
   - Every package in `packages/*` must have automated unit tests covering its schema, calculation, or utility logic.
   - Tests must run in < 5 seconds across the entire workspace.

2. **Visual & PDF Verification**:
   - Layout engines must verify that text does not overflow designated hardware pixel boundaries.
   - Test fixtures in `packages/test-fixtures` must be used for deterministic test cases.

3. **Pre-flight Checks**:
   - Any pull request or automated commit must pass `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
