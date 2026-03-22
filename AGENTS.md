# Repository Guidelines

## Project Structure & Module Organization
This repository is a small TypeScript Pi extension package. Keep runtime code in `src/`, tests in `test/`, and reference material in `docs/`.

- `index.ts`: package entry declared in `package.json -> pi.extensions`
- `src/index.ts`: registers the Pi hook
- `src/model-identity.ts`, `src/resolve.ts`, `src/prompt.ts`: parsing, resolution, and prompt composition
- `src/layers/openai/gpt5/*.ts`: model-specific prompt layers
- `test/*.test.ts`: Vitest coverage for parser, resolver, prompt helpers, and extension behavior

## Build, Test, and Development Commands
There is no build step today; Pi loads raw TypeScript directly.

- `npm install` — install dependencies
- `npm test` — run the full Vitest suite once
- `npm run test:watch` — run tests in watch mode during development
- `npm run check` — same as `npm test`; use in CI-style checks
- `npm pack --dry-run` — verify the package contents before publishing

## Coding Style & Naming Conventions
Use strict TypeScript with ESM modules and explicit `.js` import suffixes, matching the current source.

- Indentation: 2 spaces
- Prefer named, focused modules over large files
- Export fully typed functions; keep behavior deterministic and side-effect light
- File names: lowercase kebab-case where helpful (`model-identity.ts`, `gpt-5.3-codex.ts`)
- Tests: mirror source concerns with `*.test.ts`

No formatter or linter is configured in this repo yet, so match the existing style exactly and rely on `tsconfig.json` strictness plus tests for validation.

## Testing Guidelines
Tests use **Vitest**. Add or update tests for every behavior change, especially when adjusting model matching, layer order, or prompt idempotence.

- Place tests under `test/`
- Name files `feature-name.test.ts`
- Prefer targeted unit tests over broad integration scaffolding
- Run `npm test` before opening a PR

## Commit & Pull Request Guidelines
This repository currently has no Git commit history, so follow a clear, imperative style from the start, e.g. `feat: add gpt-5.4 layer resolution test` or `fix: avoid duplicate prompt markers`.

PRs should include:
- a short summary of the behavior change
- linked issue/context when available
- updated tests and docs when behavior changes
- example model IDs affected (for example `gpt-5.4-codex`)

## Architecture Notes
Keep prompt layers narrow and auditable. If a rule applies to all models, it likely belongs in Pi’s main harness, not this package.
