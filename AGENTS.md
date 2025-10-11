# Repository Guidelines

Welcome to the Hexlet website repository. This guide outlines the essentials for keeping the Docusaurus-powered site consistent, maintainable, and ready to publish.

## Project Structure & Module Organization
`docs/` holds Markdown guides surfaced in the sidebar; keep frontmatter current so navigation stays accurate. `src/pages/` contains custom React pages (TypeScript, one component per file). Shared assets live under `static/` and are copied verbatim at build time. Site-wide configuration sits in `docusaurus.config.ts`, while navigation lives in `sidebar.ts`; update both when adding new sections.

## Build, Test, and Development Commands
Install dependencies with `npm install` (Node 20+). Use `npm run start` for local preview with hot reload. Run `npm run build` before opening a PR to ensure production assets build cleanly. Execute `npm run typecheck` to catch TypeScript regressions, and `npm run clear` if you need to reset cached Docusaurus state.

## Coding Style & Naming Conventions
Follow the existing 2-space indentation in TypeScript, JSX, and Markdown files. Name React components in PascalCase (`FeatureCard.tsx`) and local utility helpers in camelCase. Place new docs in folders that mirror their URL (e.g., `docs/getting-started/overview.md`) and use kebab-case filenames. Keep Markdown concise; prefer fenced code blocks with language hints and use relative links when referencing site content.

## Testing Guidelines
There is no bespoke test suite; treat `npm run build` as the primary regression gate. Always run `npm run typecheck` when touching TypeScript, and verify modified pages locally via `npm run start`. For content changes, proofread in the browser and validate that sidebar entries render correctly.

## Commit & Pull Request Guidelines
Write imperative, concise commit messages (`Add partner spotlight page`) as seen in the Git history. Group related changes into a single commit whenever practical. Pull requests should summarize the change, reference related issues, and include screenshots or GIFs for UI-impacting updates. Note any manual verification steps so reviewers can reproduce your checks.
