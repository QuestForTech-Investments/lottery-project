# Repository Guidelines

This Vite + React + TypeScript frontend targets the lottery dashboard experience; follow the steps below to keep contributions lean and predictable.

## Project Structure & Module Organization
`src/` hosts all runtime code: `main.tsx` bootstraps React, `pages/` defines routed screens, `features/` encapsulates domain flows, and shared UI lives in `components/` plus theme utilities in `theme/` and `styles/`. Data access sits in `services/`, state stores in `store/`, and cross-cutting hooks/utilities in `hooks/` and `utils/`. Static files go in `public/`, while build-managed assets stay under `src/assets/`. End-to-end Playwright specs live in `tests/`, with helper scripts (`test-users-nav.cjs`, etc.) and artifacts under `test-results/` and `playwright-report/`.

## Build, Test, and Development Commands
- `npm run dev` — start the Vite dev server with HMR; point Playwright to this port during debug.
- `npm run build` — type-check via `tsc -b` and emit optimized assets in `dist/`.
- `npm run preview` — serve the production build locally for smoke-testing before a deploy.
- `npm run lint` — run the flat ESLint config in `eslint.config.js`; fix issues before opening a PR.
- `npx vitest run` — execute unit/component suites; use `npx vitest --watch` while iterating.
- `npx playwright test` — run browser flows defined in `tests/*.spec.ts`; pass `--headed` when reproducing bugs.

## Coding Style & Naming Conventions
Use TypeScript, 2-space indentation, and named exports for reusable modules. React components, pages, and Zustand stores should be PascalCase (`TicketPreview.tsx`), hooks start with `use` (`useDrawFilters`), and utility functions stay camelCase. Favor functional components with hooks over classes, keep styling co-located via MUI + Emotion, and run `npm run lint` before committing.

## Testing Guidelines
Write Vitest suites alongside the code they cover using the `.test.ts(x)` suffix and `@testing-library/react` for DOM assertions. Mock API clients from `services/` instead of touching real endpoints. Use Playwright for cross-route flows, store screenshots in `test-results/`, and delete flaky waits in favor of locator assertions. Block merges until new logic has at least one automated test or a documented rationale in the PR description.

## Commit & Pull Request Guidelines
Follow the repo’s conventional history (`feat:`, `fix:`, `chore:`) and keep subject lines under ~72 chars, e.g., `fix: display lottery name in ticket header`. Every PR must describe the change, link the tracking issue, list manual/automated test evidence, and add screenshots or recordings for UI shifts. Keep PRs scoped to a single feature or bug; open follow-ups instead of large mixed changes.

## Security & Configuration Tips
Never commit secrets; Vite only exposes env vars prefixed with `VITE_`, so place private keys in `.env.local` and reference them via `import.meta.env`. Audit new dependencies (`npm audit`) and favor server-side filtering for user-provided values before they enter `services/`.
