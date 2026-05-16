# AUDIT-ARCHITECTURE — Production Readiness

**Project**: certification-website
**Stack**: Next.js 16.2.6 (App Router) · React 19.2.6 · TypeScript 6.0.3 · Tailwind v3.4.19 · Vitest 4.1.6
**Branch / commit**: master @ 4af3832 (initial) + uncommitted scaffolding
**Auditor scope**: architecture, code quality, types, error handling, SSR/hydration, data layer, build config, deployment, observability, tests, forward compat
**Out of scope** (other agents): visual design, XSS/headers, Lighthouse/bundle perf
**Date**: 2026-05-16

---

## 0. Executive summary

The codebase is small, clean, and idiomatic for a static index site. There are zero TypeScript errors and 8 passing tests. The main production-readiness gaps are not bugs — they are missing scaffolding that becomes painful at scale: no schema validation at the data boundary, no `not-found.tsx` / `global-error.tsx`, no observability, no explicit ISR/SSG strategy, a Tailwind plugin that is dead weight, a tsconfig missing `noUncheckedIndexedAccess`, and a hydration-window edge case in the Hero "Last verified" chip. The CertExplorer client component has no test coverage at all. Nothing here blocks a first ship, but every item below should be addressed before this site scales past ~50 certs or accepts external data sources.

---

## 1. SSR / hydration safety

### 1.1 `new Date()` in server components produces a date that can drift one tick between RSC render and any client re-render

- **Severity**: low
- **Location**: `src/components/hero.tsx:7`, `src/components/site-footer.tsx:4`
- **What**: `new Date()` is called at server-render time and the result is embedded in HTML. The footer year and the hero's "Last verified YYYY-MM-DD" string are both static once rendered, so no client mismatch occurs in the current tree — but if either component ever becomes a Client Component the server/client render at the UTC date boundary will diverge.
- **Why it matters**: It is also a subtle SEO/CDN cache concern: each SSR render produces a fresh timestamp, defeating static caching of the page.
- **Fix**: For Hero, derive `lastVerified` from the actual data (`max(c.verifiedFreeAt)`), not wall-clock. For SiteFooter, hard-code the launch year or compute it at build time. Either way removes `new Date()` from a Server Component.

### 1.2 Theme bootstrap inline script ships on every page load and lacks a `nonce`

- **Severity**: low
- **Location**: `src/components/theme-script.tsx:13`
- **What**: The inline IIFE injected into `<head>` is the correct pattern for pre-paint theme, but the inline script has no `nonce` attribute, so a future strict CSP will block it.
- **Why it matters**: Security agent owns CSP headers; from an architecture standpoint this couples the theme system to a permissive CSP policy that you may want to tighten later.
- **Fix**: Read the per-request nonce from `headers()` (Next 16 supports this) and pass it as a prop on the `<script>` element. Pre-wire this before adding CSP.

### 1.3 ThemeToggle uses a `mounted` flag but still renders mismatched icon on first paint

- **Severity**: low
- **Location**: `src/components/theme-toggle.tsx:73-100`
- **What**: Initial state is `'system'`, then `useEffect` reads localStorage and re-renders. On the first paint the icon is always the system (monitor) glyph, regardless of stored preference — this can flash briefly.
- **Why it matters**: The pre-paint script already knows the resolved theme at the document level; the toggle icon should mirror it without a re-render.
- **Fix**: Read `document.documentElement.classList.contains('dark')` lazily inside an initializer fn for `useState`, gated by `typeof document !== 'undefined'`. Or, render the icon from a CSS `:is(.dark) ...` pair so it follows the html class without React state.

### 1.4 `suppressHydrationWarning` is on `<html>` only — body class drift still warns

- **Severity**: nit
- **Location**: `src/app/layout.tsx:18`
- **What**: Correct as written, but if any future Client Component reads `window.matchMedia` during initial render the warning may surface on the affected subtree.
- **Why it matters**: Easy to introduce a regression unknowingly.
- **Fix**: Document the invariant in a comment, or move dark-mode reads behind a `useSyncExternalStore` helper to make the pattern reusable.

---

## 2. TypeScript strictness

### 2.1 `noUncheckedIndexedAccess` is not enabled

- **Severity**: medium
- **Location**: `tsconfig.json:11`
- **What**: `strict: true` is on, but `noUncheckedIndexedAccess` is not. `cert-card.tsx:25` does `PROVIDER_PALETTE[hash % …]` and destructures with `const [from, to]` — TS currently types this as `readonly [string, string]` but with the flag enabled it would be `readonly [string, string] | undefined`.
- **Why it matters**: As the codebase grows and people index arrays of dynamic length (e.g. parsing user input, paginated results), silent `undefined` becomes a runtime crash.
- **Fix**: Add `"noUncheckedIndexedAccess": true` to `tsconfig.json`. Then in `cert-card.tsx:25` add a non-null assertion or an explicit fallback: `const [from, to] = PROVIDER_PALETTE[hash % PROVIDER_PALETTE.length] ?? PROVIDER_PALETTE[0]!;`.

### 2.2 No schema validation at the data boundary

- **Severity**: high
- **Location**: `src/lib/certifications/schema.ts`, `src/lib/certifications/data.ts`
- **What**: The schema is a TypeScript `interface` only. There is no runtime parser. The data tests assert presence of fields but a hand-edit that drops `verifiedFreeAt` or makes `id` a string will not be caught until rendering breaks.
- **Why it matters**: When data moves to JSON/CMS/DB this becomes a production hazard. Even today, a missing `verifiedFreeAt` makes `formatVerifiedDate` produce "Invalid Date".
- **Fix**: Adopt `zod` (or the standard-library `valibot`). Define `CertificationSchema = z.object({...})`, export `Certification = z.infer<typeof CertificationSchema>`, and validate in `data.ts` with `z.array(CertificationSchema).parse(rawCertifications)` at module load. Fails the build if data drifts.

### 2.3 `LevelFilter`/`SortMode` casts from `e.target.value`

- **Severity**: low
- **Location**: `src/components/cert-explorer.tsx:159, 180`
- **What**: `onChange` handlers do `setLevel(e.target.value as LevelFilter)`. The cast is unverified — a future option whose value is mistyped will silently produce invalid state.
- **Why it matters**: Refactor footgun. Today the cast is safe; tomorrow it is not.
- **Fix**: Define a `parseLevel(v: string): LevelFilter | null` and bail out on null, or use a typed `<select>` wrapper that does the narrowing once.

### 2.4 No exhaustive switch check on `level`

- **Severity**: nit
- **Location**: `src/components/cert-card.tsx:34-45`
- **What**: `switch (level)` has a `default` case returning gray styles. If a new level (e.g. `'Expert'`) is added to the union, TS will not warn — the default just absorbs it.
- **Why it matters**: Quiet drift.
- **Fix**: Replace `default:` with `const _exhaustive: never = level;` then explicitly handle `undefined` separately. Or use a `Record<NonNullable<Certification['level']>, string>` lookup table.

### 2.5 `@types/node` is pinned to v20 but Next 16 / Vercel runtime targets Node 22

- **Severity**: low
- **Location**: `package.json:25`
- **What**: `"@types/node": "20.0.0"` while production runtime is Node 22.x.
- **Why it matters**: APIs added in Node 22 (e.g. `process.loadEnvFile`, fetch streaming primitives) appear as type errors when used. Also pins TS to a stale `globalThis` shape.
- **Fix**: Bump to `"@types/node": "^22"`. Pin specifically (e.g. `"22.10.0"`) rather than `0.0.0` exact.

---

## 3. Error handling

### 3.1 No `not-found.tsx` or `global-error.tsx`

- **Severity**: high
- **Location**: `src/app/` (missing files)
- **What**: The user's brief mentions these as if they exist, but the directory only contains `layout.tsx`, `page.tsx`, `globals.css`. Unmatched routes fall back to Next's default 404, and runtime errors during render produce a barebones error page with no theme/branding.
- **Why it matters**: First impression for any broken link or production crash is an unstyled Next default page.
- **Fix**: Add `src/app/not-found.tsx` (static, brand-styled) and `src/app/global-error.tsx` (`'use client'`, must render `<html>` and `<body>`, includes a "reset" button). Wire to whichever error tracker you choose in §7.

### 3.2 No `error.tsx` route boundary

- **Severity**: medium
- **Location**: `src/app/` (missing file)
- **What**: There is no `error.tsx` at the route segment level. A throw inside `CertExplorer` (e.g. malformed data) propagates to the global handler.
- **Why it matters**: One bad row crashes the whole page instead of degrading gracefully.
- **Fix**: Add `src/app/error.tsx` (`'use client'`) with a friendly recover UI and a `reset()` retry. Keep the global-error.tsx as the last-resort fallback.

### 3.3 `formatVerifiedDate` silently returns the raw ISO string on invalid input

- **Severity**: low
- **Location**: `src/components/cert-card.tsx:47-52`
- **What**: `if (Number.isNaN(d.getTime())) return iso;` quietly degrades.
- **Why it matters**: A bad date in production will render "2026-99-99" verbatim with no signal that anything is wrong. Without observability you will never know.
- **Fix**: Either fail loud in dev (`console.warn`) and quiet in prod, or — better — validate at the data boundary (§2.2) so this branch becomes unreachable.

### 3.4 No fetch layer yet but planning hooks are absent

- **Severity**: medium
- **Location**: project-wide
- **What**: The brief plans for an eventual fetch. There is no `lib/api/` directory, no error type, no retry/abort utility, no Result/Either pattern.
- **Why it matters**: When you add the first fetch you will either retrofit error handling (slow) or skip it (worse).
- **Fix**: Stub `src/lib/http.ts` now with a typed `fetchJson<T>(url, schema)` that returns `Result<T, HttpError>`. Use `AbortSignal.timeout(8000)`. Pair with zod from §2.2.

### 3.5 Data growth at 100+ certs: filter is fine, render is not

- **Severity**: medium
- **Location**: `src/components/cert-explorer.tsx:64-94`, `src/components/cert-list.tsx:13-58`
- **What**: The filter pipeline is O(n × text-length) per keystroke and rebuilds on every change. At 100-500 certs it is fine; at 5k it stutters. More importantly, rendering 500 cards eagerly is a layout-thrash and image-heavy DOM. There is no virtualization, debounce, or pagination.
- **Why it matters**: Architecture decision now, not later.
- **Fix**: (a) Debounce search input via `useDeferredValue(query)` (React 19 — no library cost). (b) Pre-build a lowercase haystack per cert at module-load. (c) When count > 60, paginate to "load more" or virtualize with `react-virtuoso` / `@tanstack/react-virtual`. Do not add until cert count justifies.

---

## 4. Component architecture

### 4.1 `CertExplorer` mixes filter UI, sort logic, derived state, and orchestration

- **Severity**: medium
- **Location**: `src/components/cert-explorer.tsx` (entire file, 222 lines)
- **What**: Single component owns four pieces of state, three labeled inputs, a sort comparator, a filter pipeline, an empty state, and the list mount.
- **Why it matters**: Currently fine, but adding a 5th filter (e.g. duration) means more state, more memos, and more JSX in the same file. Testing the filter logic requires rendering the whole tree.
- **Fix**: Extract pure logic to `src/lib/certifications/filter.ts` (`applyFilters({ query, provider, level, sort }, certs)`) and unit-test it directly. Keep the component as a thin shell over the hook + UI. Optionally extract `<FilterBar>` and `<ResultsHeader>` once a third UI iteration arrives — not before.

### 4.2 `Hero` accepts props that are never passed

- **Severity**: nit
- **Location**: `src/components/hero.tsx:1-6`, used at `src/app/page.tsx:8`
- **What**: `providerCount?: number` and `certCount?: number` are declared but `<Hero />` is called with no props, so both StatChips show the fallback ("Curated weekly", "Updated {date}").
- **Why it matters**: The hero advertises a count to users that is never actually wired. Dead-API smell.
- **Fix**: Pass them from `page.tsx`: `<Hero providerCount={new Set(Certifications.map(c=>c.provider)).size} certCount={Certifications.length} lastVerified={maxBy(Certifications, 'verifiedFreeAt')} />`. Also fixes §1.1.

### 4.3 `CertList` and `cert-explorer` both compute empty states

- **Severity**: nit
- **Location**: `src/components/cert-list.tsx:9-11`, `src/components/cert-explorer.tsx:215-219`
- **What**: Two different empty-state UIs. `CertList` returns `<EmptyState />` (its internal fallback); `CertExplorer` short-circuits and renders its own dashed-border box.
- **Why it matters**: Duplicated UX, dead code. The `EmptyState` inside `cert-list.tsx` is unreachable in normal flow because the parent already filters length.
- **Fix**: Delete the `if (certifications.length === 0) return <EmptyState />` branch from `cert-list.tsx` (and `EmptyState` + `EmptyIllustration` helpers), or remove the wrapper short-circuit in `cert-explorer.tsx` and let `CertList` own the empty UI. Keep one.

### 4.4 `cert-card.tsx` SVG icons should be co-located primitives

- **Severity**: nit
- **Location**: `src/components/cert-card.tsx:156-211`, also similar inline SVGs in 5 other files
- **What**: Each component file declares its own little SVG functions (Clock, CheckBadge, ArrowRight, GitHub, Sun, Moon, Monitor, Search, Empty, BrandMark).
- **Why it matters**: 10+ icon copies = larger bundle + every redesign touches multiple files. At three duplications, abstract (your DRY-at-3x rule applies).
- **Fix**: Create `src/components/icons/index.tsx` exporting named icons. Or adopt `lucide-react` and tree-shake — adds ~2KB if only the 10 icons used. Not urgent.

### 4.5 Server/client boundary is correct but underdocumented

- **Severity**: nit
- **Location**: across components
- **What**: Only `cert-explorer.tsx` and `theme-toggle.tsx` are `"use client"`. The rest are RSC. Good. But there is no convention that signals which directory holds client-only components, so reviewers must check the first line of each file.
- **Why it matters**: At ~20 components this becomes noisy.
- **Fix**: Adopt a soft convention: client components in `src/components/client/` or suffix `*.client.tsx`. Optional; cosmetic.

---

## 5. Data layer

### 5.1 Hard-coded TS array is fine for 12, breaks at ~100

- **Severity**: high (planning), low (today)
- **Location**: `src/lib/certifications/data.ts`
- **What**: All certifications live in one TS module. Updating a single cert means a code change, PR, and Vercel deploy. There is no separation between content and code.
- **Why it matters**: Content velocity dies at scale, and content editors must use git. Also: import-time cost grows linearly.
- **Fix**: Phased migration plan:
  - Phase A (today, S): Move array to `src/lib/certifications/data.json`. Import via `resolveJsonModule`. Same TS narrowing via `as Certification[]`. Zero deploy change.
  - Phase B (next quarter, M): Move to `content/certifications/*.md` or `*.mdx` parsed at build time by `gray-matter` + zod. Enables per-cert frontmatter, body descriptions, and PR-based content workflow.
  - Phase C (when content > 200 or editors are non-technical, L): Move to a headless CMS (Sanity, Contentlayer, or a thin Postgres on Neon). Add ISR (`export const revalidate = 3600`) so content updates do not require redeploy.

### 5.2 In-browser filtering will not scale past ~500 entries

- **Severity**: medium (forward)
- **Location**: `src/components/cert-explorer.tsx:64`
- **What**: Every keystroke iterates all certs and substring-matches name/description/skills. The full dataset ships in the JS bundle.
- **Why it matters**: At 500 certs the bundle is fine but the input lag becomes perceptible on low-end devices. At 5k it is unusable.
- **Fix**: At Phase B/C of §5.1, swap to a build-time index: `flexsearch` or `minisearch` produces a serializable index that beats naive substring by 50x. Or move filtering server-side via a route handler when the dataset is no longer fully shipped to the client.

### 5.3 Provider list is computed on every render path

- **Severity**: nit
- **Location**: `src/components/cert-explorer.tsx:58-62`
- **What**: `providers` is memoized but recomputed for every new `initialCertifications` reference — and since the parent is a Server Component the prop is stable, so this is fine today. With CMS-backed data the reference can change.
- **Why it matters**: Defensive coding hygiene.
- **Fix**: Compute providers at build/server time in `page.tsx` and pass as a prop. Removes one client memo.

---

## 6. Build configuration

### 6.1 `@tailwindcss/line-clamp` is a dev dependency but is not registered in `tailwind.config.ts`

- **Severity**: medium
- **Location**: `package.json:20`, `tailwind.config.ts:39`
- **What**: The plugin is installed but `plugins: []` is empty. Worse, since Tailwind 3.3 `line-clamp-*` utilities are built in — the plugin is redundant. `cert-card.tsx` uses `line-clamp-2`/`line-clamp-3` and they work via the built-in.
- **Why it matters**: Dead dependency = supply-chain surface area + npm-install time + audit warning.
- **Fix**: `pnpm remove @tailwindcss/line-clamp`. No code changes needed.

### 6.2 `next.config.ts` is minimal and missing standard production flags

- **Severity**: medium
- **Location**: `next.config.ts`
- **What**: Only `reactStrictMode`, `images.unoptimized: true`, and a Turbopack `root`. No `output`, no `poweredByHeader: false`, no `compress`, no `trailingSlash`, no `redirects`/`headers`.
- **Why it matters**: Defaults are mostly OK on Vercel, but `images.unoptimized: true` disables the entire `<Image />` optimizer pipeline — fine for an all-SVG site, but you will regret it if you ever add a provider logo.
- **Fix**: Add `poweredByHeader: false` (small infosec win) and a `headers()` function for `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (security agent will own the actual CSP). Re-enable `images.unoptimized: false` and configure `remotePatterns` if/when provider logos are added.

### 6.3 No `output: 'standalone'` — fine for Vercel, blocking for self-host

- **Severity**: low
- **Location**: `next.config.ts`
- **What**: Without `output: 'standalone'`, the build cannot run on a non-Vercel platform (Fly.io, AWS, Docker) without bundling the entire `node_modules`.
- **Why it matters**: Locks you to Vercel forever.
- **Fix**: Add `output: 'standalone'` if you want option-value of leaving Vercel. Otherwise document the lock-in.

### 6.4 TypeScript 6.0.3 is an aggressively bleeding-edge pin

- **Severity**: low
- **Location**: `package.json:32`
- **What**: TypeScript 6.0 is recent. Pinning to exact `6.0.3` (no caret) freezes patch updates.
- **Why it matters**: Pinning is fine; just be deliberate about renovating.
- **Fix**: Add a Renovate/Dependabot config (`.github/renovate.json`) with a monthly `typescript`/`@types/*` group.

### 6.5 `tsconfig.json` includes `.next/dev/types/**/*.ts`

- **Severity**: nit
- **Location**: `tsconfig.json:39`
- **What**: Includes both `.next/types/**` and `.next/dev/types/**`. Next 16 split the route types out; this matches docs but the dev path is only present after `next dev`.
- **Why it matters**: Cold-clone runs of `tsc --noEmit` may warn until first dev/build.
- **Fix**: Already handled by Next's setup; verify by deleting `.next/` and running `pnpm exec tsc --noEmit` from a fresh clone. If it errors, drop the dev include and rely on the build include only.

### 6.6 Vitest's `css: false` works but will not catch CSS-import errors

- **Severity**: nit
- **Location**: `vitest.config.ts:16`
- **What**: Saves test runtime, but a renamed/missing class will not fail a test.
- **Why it matters**: Tradeoff is OK at this scale.
- **Fix**: Leave as is; reconsider when adopting visual regression (Playwright).

---

## 7. Observability

### 7.1 No error tracking

- **Severity**: high
- **Location**: project-wide
- **What**: No Sentry, no Rollbar, no Vercel Logs hooks, no `instrumentation.ts`.
- **Why it matters**: Production crashes go to a black hole. The §3 error boundaries are no-ops without sinks.
- **Fix**: Add `instrumentation.ts` with `@sentry/nextjs` (or `@vercel/otel` if you prefer free + lightweight). Wire `global-error.tsx` and `error.tsx` to `captureException`. ~15 minutes setup.

### 7.2 No analytics / web vitals

- **Severity**: medium
- **Location**: `src/app/layout.tsx`
- **What**: No `@vercel/analytics`, no `next/web-vitals`, no Plausible. There is no way to know if anyone uses search/filter or which providers get clicks.
- **Why it matters**: Product decisions become guesses.
- **Fix**: Add `@vercel/analytics/react` `<Analytics />` and `@vercel/speed-insights/next` `<SpeedInsights />` in `layout.tsx`. Free on Vercel hobby. Adds ~3KB.

### 7.3 No structured logging

- **Severity**: low
- **Location**: project-wide
- **What**: No `pino` or even a `lib/log.ts`. `console.*` is fine for a static site but will not survive a server-route addition.
- **Why it matters**: Future server actions / route handlers will emit unstructured logs that are hard to grep.
- **Fix**: Stub `src/lib/log.ts` with a thin `console`-wrapper that adds `{ts, level, msg, ctx}`. Swap to `pino` when needed.

### 7.4 No build-time data validation report

- **Severity**: low
- **Location**: `package.json` scripts
- **What**: There is no `prebuild` step that runs the data tests or schema validation.
- **Why it matters**: A bad cert merged to main reaches production even though tests exist locally.
- **Fix**: Add `"prebuild": "vitest run"` to `package.json`. Or wire CI to fail the deploy on red tests.

---

## 8. Deployment

### 8.1 No `vercel.json` and no environment-variable scaffolding

- **Severity**: medium
- **Location**: project root (file absent)
- **What**: Brief mentions a missing `vercel.ts`/`vercel.json`. Defaults work for a hobby site. There is no `.env.example`, no `NEXT_PUBLIC_*` discipline, and no documented build command.
- **Why it matters**: First team-member onboard requires Slack archaeology.
- **Fix**:
  - Add `vercel.json` only if you need overrides (cron, redirects, regions). For this site, skip — defaults are fine.
  - Add `.env.example` documenting expected variables (none today, but reserve `NEXT_PUBLIC_SITE_URL`, `SENTRY_DSN`, `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`).
  - Add `engines.node` to `package.json`: `"engines": { "node": ">=22" }` — Vercel honors this.

### 8.2 No explicit rendering strategy declaration

- **Severity**: medium
- **Location**: `src/app/page.tsx`
- **What**: The page is implicitly static (no `cookies()`, no dynamic API). Confirmed by lack of dynamic primitives. But there is no `export const dynamic = 'force-static'` or `export const revalidate = …` directive, so future code changes can accidentally flip to SSR.
- **Why it matters**: Site is ~100% static-cacheable but one accidental `headers()` call demotes the whole route.
- **Fix**: Add `export const dynamic = 'force-static'` and `export const revalidate = 86400` (24h) to `src/app/page.tsx`. Documents intent. Once a CMS arrives, drop `revalidate` to seconds.

### 8.3 Edge vs Node runtime is not declared

- **Severity**: low
- **Location**: `src/app/layout.tsx`, `page.tsx`
- **What**: No `export const runtime = …`. Defaults to Node serverless. Fine for a static site, but edge would be cheaper + faster.
- **Why it matters**: Pure-static pages benefit from edge runtime (lower cold-start, lower cost).
- **Fix**: Once §8.2 is in place and you have zero Node-only deps in render path, add `export const runtime = 'edge'` to `page.tsx` and `layout.tsx`. Test locally with `next dev --turbo` (already on).

### 8.4 `images: { unoptimized: true }` will bite the moment a logo is added

- **Severity**: low
- **Location**: `next.config.ts:6`
- **What**: Disables Next's image optimizer globally. The current SVG icons need none of it.
- **Why it matters**: First provider logo PR will ship unoptimized PNGs.
- **Fix**: Remove the flag now and use `<Image />` for any future raster. SVG icons remain raw `<svg>` JSX.

### 8.5 Build artifact `.next/` is gitignored but `tsconfig.tsbuildinfo` is committed-eligible

- **Severity**: nit
- **Location**: `.gitignore`
- **What**: `tsconfig.tsbuildinfo` (159K) is present and would be committed if `git add .` were run. It is a TS incremental-build cache.
- **Why it matters**: Committing it generates noisy diffs and merge conflicts.
- **Fix**: Add `tsconfig.tsbuildinfo` and `*.tsbuildinfo` to `.gitignore`.

### 8.6 Ghost files in `git status`

- **Severity**: nit
- **Location**: git status (untracked entries `index.html`, `certifications.json`, `styles.css`, `vercel.ts`)
- **What**: The git status snapshot in the prompt lists untracked files at root — but `ls` shows they do not exist. Likely a stale snapshot or files that were deleted but not committed.
- **Why it matters**: Cognitive overhead during code review.
- **Fix**: Confirm the working tree is clean; if those files were intentional artifacts, decide and either commit or ensure they are cleaned. (Audit verified they are absent on disk.)

---

## 9. Testing gaps

### 9.1 `CertExplorer` (the most complex component) has zero tests

- **Severity**: high
- **Location**: `src/components/cert-explorer.tsx` (no companion `.test.tsx`)
- **What**: The component owns search/filter/sort state, two `useMemo` pipelines, and four state setters. None of it is tested.
- **Why it matters**: Every refactor is a regression risk.
- **Fix**: Add `cert-explorer.test.tsx`. Cases: (a) renders count label, (b) typing in search filters list, (c) selecting provider filters list, (d) level filter, (e) sort by A-Z reorders, (f) reset button clears state, (g) empty state appears.

### 9.2 Theme system has no tests

- **Severity**: medium
- **Location**: `src/lib/theme.ts`, `src/components/theme-script.tsx`, `src/components/theme-toggle.tsx`
- **What**: `getStoredTheme`, `resolveTheme`, `applyTheme` are pure-ish and trivially testable.
- **Why it matters**: Theme bugs (e.g. flash, wrong default) hit every user.
- **Fix**: Add `src/lib/theme.test.ts`. Mock `window.matchMedia` and `localStorage` (jsdom supports both). Test: stored values are validated, missing storage falls back to `system`, `applyTheme('dark')` adds `.dark` to `<html>`.

### 9.3 Pure logic is not separated from rendering, so tests must render

- **Severity**: medium
- **Location**: `src/components/cert-explorer.tsx:40-94`, `cert-card.tsx:34-52`
- **What**: `compareUpdated`, the filter pipeline, `formatVerifiedDate`, `providerGradient`, `levelStyles` are all defined inside component files and not exported.
- **Why it matters**: To unit-test the comparator I must render a tree.
- **Fix**: Extract to `src/lib/certifications/filter.ts` and `src/lib/certifications/format.ts`. Export. Test directly. Bonus: trivial to memoize-by-import.

### 9.4 No accessibility test in any test file

- **Severity**: medium
- **Location**: test suite
- **What**: No `axe-core`, no role queries beyond name/role lookups, no keyboard interaction tests.
- **Why it matters**: A11y regressions slip in.
- **Fix**: Add `vitest-axe` (or `@axe-core/react` in dev) and assert `await expect(container).toHaveNoViolations()` on the rendered page. Add one keyboard test that tab-traverses the filter bar.

### 9.5 No CI workflow

- **Severity**: medium
- **Location**: `.github/workflows/` (missing)
- **What**: Tests pass locally; nothing enforces that on PRs.
- **Why it matters**: A green-on-laptop commit can still break main.
- **Fix**: Add `.github/workflows/ci.yml` with `pnpm install --frozen-lockfile`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build`. Pin to `node:22`.

### 9.6 No E2E test

- **Severity**: low
- **Location**: project-wide
- **What**: No Playwright tests. The Tailwind UI is untested for layout regressions and the cross-component flow (page → explorer → card click) is not exercised.
- **Why it matters**: Visual + integration bugs slip through unit tests.
- **Fix**: Add `tests/e2e/home.spec.ts` with Playwright; assert hero renders, search filters, theme toggle persists. Run in CI on `pnpm dev` background.

---

## 10. Forward compatibility

### 10.1 Tailwind v3 → v4 migration is non-trivial — defer deliberately

- **Severity**: medium
- **Location**: `tailwind.config.ts`, `postcss.config.mjs`, `globals.css`
- **What**: The codex SPEC mentions Tailwind v4 but the actual install is v3.4.19. v4 drops `tailwind.config.ts` in favor of `@theme` in CSS; it removes PostCSS plugin in favor of `@tailwindcss/postcss`; some utilities renamed.
- **Why it matters**: A v4 upgrade is a rewrite of `globals.css` plus deletion of `tailwind.config.ts`. Not a `pnpm up`.
- **Fix plan**: Stay on v3.4.x until v4 has its first dot release (v4.0.x reached stable in early 2026, but ecosystem plugins lag). When ready: (a) delete `@tailwindcss/line-clamp`, (b) move `darkMode: 'class'` and `colors.brand` into `@theme` block in `globals.css`, (c) swap `postcss.config.mjs` plugins to `{'@tailwindcss/postcss': {}}`, (d) regression-test visually with Playwright snapshots.

### 10.2 Next 16 → 17 path

- **Severity**: low (forward-looking)
- **Location**: `next.config.ts`, app router files
- **What**: Next 16 stabilized Turbopack and async-by-default `params`/`searchParams`. Next 17 (when released) will likely complete the App Router migration and may break compatibility shims (still-default Pages Router behavior, etc.). Codebase already uses pure App Router and is async-clean.
- **Why it matters**: You are already in the safe lane.
- **Fix**: When v17 lands: audit `next.config.ts` deprecations, run codemod, check Turbopack root path.

### 10.3 React 19 → 20 path

- **Severity**: low (forward-looking)
- **Location**: project-wide
- **What**: React 19 introduced Actions and `useActionState`; this project uses neither. `use client` boundaries are clean.
- **Why it matters**: 19 → 20 is unlikely to break this code.
- **Fix**: No action needed today.

### 10.4 Node 22 baseline alignment

- **Severity**: low
- **Location**: `package.json`
- **What**: No `engines.node` field. Vercel defaults to its current LTS but local devs may run anything.
- **Why it matters**: Subtle API drift (e.g. `import.meta.dirname` is Node 20.11+).
- **Fix**: Add `"engines": { "node": ">=22", "pnpm": ">=9" }` to `package.json`. Aligns with §8.1.

### 10.5 TypeScript 6 → 7 surface

- **Severity**: low
- **Location**: `tsconfig.json`
- **What**: Pinned to TS 6.0.3. TS 7 (port to Go) is in early preview; not a near-term concern.
- **Why it matters**: Just track it.
- **Fix**: No action; monitor TS roadmap.

---

## 11. Prioritized fix plan

Each row = one work item. Effort: S ≤ 30 min, M ≤ 2 h, L > 2 h.

### Ship-today (safe, no design discussion)

| # | Item | Severity | Effort | Depends on |
|---|---|---|---|---|
| 1 | Drop `@tailwindcss/line-clamp` from `package.json` (§6.1) | medium | S | — |
| 2 | Add `tsconfig.tsbuildinfo` and `*.tsbuildinfo` to `.gitignore` (§8.5) | nit | S | — |
| 3 | Add `"engines": { "node": ">=22" }` to `package.json` (§8.1, §10.4) | low | S | — |
| 4 | Bump `@types/node` to `^22` (§2.5) | low | S | — |
| 5 | Add `export const dynamic = 'force-static'; export const revalidate = 86400;` to `src/app/page.tsx` (§8.2) | medium | S | — |
| 6 | Add `poweredByHeader: false` to `next.config.ts` (§6.2) | low | S | — |
| 7 | Pass `providerCount` / `certCount` / `lastVerified` props from `page.tsx` to `<Hero />` (§4.2, §1.1) | nit | S | — |
| 8 | Remove unreachable `if (certifications.length === 0)` branch + `EmptyState` from `cert-list.tsx` (§4.3) | nit | S | — |
| 9 | Add `not-found.tsx`, `error.tsx`, `global-error.tsx` in `src/app/` (§3.1, §3.2) | high | M | — |
| 10 | Add `noUncheckedIndexedAccess: true` + fix the one resulting site in `cert-card.tsx:25` (§2.1) | medium | S | — |
| 11 | Add `.github/workflows/ci.yml` running install / typecheck / test / build (§9.5) | medium | M | — |
| 12 | Add `"prebuild": "vitest run"` to `package.json` (§7.4) | low | S | #11 |

### Next sprint (medium risk, needs review but no architecture call)

| # | Item | Severity | Effort | Depends on |
|---|---|---|---|---|
| 13 | Extract pure logic to `src/lib/certifications/{filter,format}.ts`; export `applyFilters`, `compareUpdated`, `formatVerifiedDate` (§4.1, §9.3) | medium | M | — |
| 14 | Add `cert-explorer.test.tsx` covering search / filter / sort / reset / empty state (§9.1) | high | M | #13 |
| 15 | Add `src/lib/theme.test.ts` (§9.2) | medium | M | — |
| 16 | Adopt `zod` and validate `Certifications` at module load (§2.2, §3.3) | high | M | — |
| 17 | Install + wire `@vercel/analytics` + `@vercel/speed-insights` in `layout.tsx` (§7.2) | medium | S | — |
| 18 | Install + wire `@sentry/nextjs` via `instrumentation.ts`; pipe error boundaries to `captureException` (§7.1) | high | M | #9 |
| 19 | Apply `useDeferredValue` to the search input (§3.5a) — proactive perf hygiene | low | S | — |
| 20 | Replace `level` switch with exhaustive `never` check or lookup table (§2.4) | nit | S | — |
| 21 | Replace `e.target.value as LevelFilter` casts with a parser fn (§2.3) | low | S | — |

### Needs design discussion (architecture decision required)

| # | Item | Severity | Effort | Depends on |
|---|---|---|---|---|
| 22 | Decide data-layer phase: keep TS / move to JSON / MDX / CMS (§5.1) | high (planning) | L | — |
| 23 | Decide on `output: 'standalone'` (commit to Vercel or keep portable) (§6.3) | low | S | — |
| 24 | Decide on `runtime = 'edge'` for `page.tsx` / `layout.tsx` (§8.3) | low | S | #5 |
| 25 | Decide on virtualization / pagination threshold (§3.5c, §5.2) | medium (forward) | L | #22 |
| 26 | Plan Tailwind v3 → v4 migration window + Playwright visual regression coverage (§10.1, §9.6) | medium | L | — |
| 27 | Plan icon library: extract local icons / adopt `lucide-react` (§4.4) | nit | M | — |
| 28 | Plan CSP + nonce for theme bootstrap script (§1.2) — coordinate with security agent | low | M | — |

### Effort summary

- Ship today: 8 × S + 1 × M = ~1 day
- Next sprint: 5 × S + 4 × M = ~2 days
- Needs discussion: 4 × L + 3 × S + 1 × M = bounded by product calls, not engineering hours

---

## 12. What I did not audit (out of scope)

- Visual design quality, color contrast, typography rhythm → UX agent
- Content Security Policy headers, XSS surface, inline-script body content → security agent
- Lighthouse scores, JS bundle weight, image optimization, font-loading strategy → performance agent
- Accessibility beyond test coverage gap mention (axe was not run) → UX or a11y agent

---

*End of report.*
