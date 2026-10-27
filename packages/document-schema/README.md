# @epaper-studio/document-schema

Canonical data model, geometry constants, and validation schemas for E-Paper Studio documents.

## Scope & Responsibilities

- Zod schemas and TypeScript AST for pages, grids, layout blocks, and e-paper displays.
- Hardware profiles (screen aspect ratios, DPI, 16-level grayscale color matrices, Kindle, reMarkable, Kobo).
- Serialization and deserialization contracts for persistence in Supabase and transport to the PDF renderer.

## Usage

```ts
import { MinimalDocumentSchema, SupportedDevice } from '@epaper-studio/document-schema';
```
