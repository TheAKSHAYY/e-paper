# AGENTS.md — Agent & Contributor Workflow Guidelines

Welcome to the **E-Paper Studio** monorepo. This document establishes operational guardrails, development patterns, and safety rules for AI agents and human contributors working within this codebase.

---

## 1. Monorepo Organization & Architecture

```
epaper-studio/
├── apps/
│   ├── web/                     # React 19 + TypeScript + Vite studio web application
│   └── renderer/                # Node.js + Playwright worker for vector PDF / e-ink bitmap generation
├── packages/
│   ├── document-schema/         # Canonical Zod schemas, hardware device profiles, and AST definitions
│   ├── template-engine/         # Grid calculations, pagination rules, and data interpolation
│   ├── typography/              # Multilingual font metrics, e-ink optical weight tuners, fallback cascades
│   ├── ui/                      # Shared design tokens, paper aesthetics, preview components
│   └── test-fixtures/           # Standard documents, mock hardware profiles, test suites
├── supabase/
│   ├── migrations/              # PostgreSQL schema migrations and RLS policies
│   └── tests/                   # pgTAP database test definitions
├── tests/
│   ├── e2e/                     # End-to-end browser user flows (Playwright)
│   ├── visual/                  # Visual regression & 16-level grayscale dithering validation
│   └── pdf/                     # PDF geometry and print dimension assertions
├── docs/                        # Architecture, PRD, Roadmap, and ADR records
└── .agent/rules/                # Modular agent behavior rules
```

---

## 2. Safety & Operational Rules

1. **Workspace Boundary**: Never read, write, or execute commands outside this project repository.
2. **Preserve User Changes**: Inspect before modifying; never overwrite user files or configurations without explicit instruction.
3. **No Secrets**: Never hardcode API keys, service role credentials, or production tokens. Use `.env` variables documented in `.env.example`.
4. **No Destructive Commands**: Never run `git reset --hard`, destructive cloud commands, or drop production databases.
5. **Phase Discipline**: Only execute tasks approved for the current implementation phase. Do not implement unrequested product features.

---

## 3. Coding & TypeScript Conventions

- **Strict Mode**: TypeScript strict mode is enabled workspace-wide. No implicit `any`, no untyped exports.
- **Package Imports**: Use workspace aliases (`@epaper-studio/*`). Avoid deep cross-package directory traversal.
- **Exports**: Every package must cleanly re-export its public API from `src/index.ts`.
- **Formatting**: Run `pnpm format` (Prettier) before finishing any edit.
- **Linting**: Ensure `pnpm lint` reports 0 errors and 0 warnings.

---

## 4. Testing & Verification Standard

Before declaring any task or phase complete, run and report the outcome of:

```bash
# 1. Type validation
pnpm typecheck

# 2. Linting
pnpm lint

# 3. Unit test suite
pnpm test

# 4. Production builds
pnpm build
```

---

## 5. E-Paper Domain Specifics

- **Grayscale Optimization**: Target displays utilize 16 levels of electrophoretic grayscale. Avoid delicate low-contrast gradients and sub-400 font weights.
- **Physical Dimensions**: Hardware devices (Kindle Scribe, reMarkable 2, Kobo Elipsa, Boox) have fixed pixel grids and DPI ratings (226–300 DPI). Page geometry must always match the designated device profile.
- **Multilingual Support**: All layout engines and typography configs must support bidirectional text (LTR and RTL Arabic/Hebrew) and CJK/Indic font fallbacks without layout collapse.
