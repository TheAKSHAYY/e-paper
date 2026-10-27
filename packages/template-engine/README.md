# @epaper-studio/template-engine

Layout calculation, block pagination, and data-driven document composition for e-paper targets.

## Responsibilities

- Template definitions for newspapers, digests, calendar planners, and dashboards.
- Dynamic pagination rules preventing orphaned lines, overflowing columns, or bad column splits on fixed-geometry displays.
- Safe markdown and rich text interpolation into e-paper AST blocks.

## Usage

```ts
import { compileTemplate } from '@epaper-studio/template-engine';
```
