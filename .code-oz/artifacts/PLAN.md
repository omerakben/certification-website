# PLAN

## Goals

- Ship a static Next.js 16 App Router site on Vercel that renders a curated directory of free certifications from trusted providers, served as a Server Component with no client JS for the directory view.
- Enforce listing integrity at build time via a typed schema and an automated test that asserts every entry is flagged free-to-earn and links to the declared provider's domain.
- Keep v1 scope tight: flat list grouped by provider, hand-curated TypeScript data file, no backend, no accounts, no affiliate links.

## Tasks

### T-001: Scaffold Next.js 16 App Router project with TypeScript, Tailwind v4, and node:test runner

- Files: package.json (added), tsconfig.json (added), next.config.ts (added), postcss.config.mjs (added), .gitignore (added), vercel.ts (added), src/app/layout.tsx (added), src/app/page.tsx (added), src/app/globals.css (added)
- Validation: pnpm install --no-frozen-lockfile && pnpm exec tsc --noEmit
- Risk: dep versions drift between PLAN and BUILD; pin exact versions (no carets) for next, react, react-dom, typescript, tailwindcss so install is deterministic and validation is reproducible.
- Hypotheses: H-001
- Sources: SC-SPEC-006, SC-REF-NONE-001, SC-DOC-NONE-001

### T-002: Define cert schema, seed >=10 verified-free entries across 8 providers, add integrity test

- Files: src/lib/certifications/schema.ts (added), src/lib/certifications/data.ts (added), src/lib/certifications/data.test.ts (added), package.json (modified)
- Validation: pnpm install --no-frozen-lockfile && pnpm test
- Risk: a listed certification could transition to paid status between curation date and launch; entry schema includes a verifiedFreeAt ISO date and the test fails on any entry older than 90 days at run time so the curator is forced to re-verify before shipping.
- Hypotheses: H-002, H-003, H-004
- Sources: SC-SPEC-001, SC-SPEC-002, SC-SPEC-003, SC-SPEC-004, SC-SPEC-005, SC-REF-NONE-001, SC-DOC-NONE-001

### T-003: Render certifications directory on home page as a server-rendered card grid

- Files: src/app/page.tsx (modified), src/components/cert-card.tsx (added), src/components/cert-list.tsx (added), src/components/cert-list.test.tsx (added)
- Validation: pnpm install --no-frozen-lockfile && pnpm test
- Risk: accidentally introducing a Client Component (use client) would ship a JS bundle and break the no-client-JS hypothesis; cert-card and cert-list stay pure server components and the render test imports them through react-dom/server which fails fast on client-only hooks.
- Hypotheses: H-001
- Sources: SC-SPEC-001, SC-SPEC-002, SC-SPEC-006, SC-REF-NONE-001, SC-DOC-NONE-001

### T-004: Group listings under provider section headings with accessible region landmarks

- Files: src/components/cert-list.tsx (modified), src/components/cert-list.test.tsx (modified)
- Validation: pnpm install --no-frozen-lockfile && pnpm test
- Risk: heading hierarchy could drift from h1 (layout title) -> h2 (provider) -> card text and break screen-reader navigation; the updated test asserts every provider in the data file appears exactly once as an h2 whose accessible name matches the provider name.
- Hypotheses: none
- Sources: SC-SPEC-001, SC-SPEC-006, SC-REF-NONE-001, SC-DOC-NONE-001

## Sources

- SC-SPEC-001
- SC-SPEC-002
- SC-SPEC-003
- SC-SPEC-004
- SC-SPEC-005
- SC-SPEC-006
- SC-REF-NONE-001
- SC-DOC-NONE-001

## Out of scope

- Search and filtering UI (deferred to a later spec; SPEC AC only requires a browsable list).
- User accounts, saved lists, progress tracking (SPEC explicit non-goal).
- Paid certifications, even from trusted providers (SPEC explicit non-goal).
- User-generated reviews or ratings (SPEC explicit non-goal).
- Affiliate or sponsorship links of any kind on listing URLs.
- Hosting or reproducing course or exam content (SPEC explicit non-goal).
- CMS or external submission workflow (a hand-curated TypeScript module is the data source for v1).
- SEO sitemap, robots, and analytics wiring (deferred until v1 ships and the cert set stabilizes).
- Dark mode, theming, or branded visual design beyond Tailwind defaults.
- E2E browser tests (server-render unit tests are sufficient for v1 acceptance).

## Open questions

- Deployment target was unspecified in SPEC; defaulted to static Next.js 16 on Vercel because it matches the maintainer's stack and supports Server Components natively. Considered GitHub Pages; rejected because static export limits server-side metadata generation and complicates later expansion.
- Filter or search granularity was unspecified; defaulted to a single flat list grouped by provider (T-004). Considered client-side filtering; rejected for v1 because AC only requires "browsable list" and a client filter would force a Client Component and a JS bundle.
- Curation surface was unspecified; defaulted to a hand-curated TypeScript module validated by schema. Considered a CMS or submission flow; rejected as overhead disproportionate to v1 scale (~10-20 entries, single maintainer).
- Provider scope beyond the four named was unspecified; defaulted to {Google, Microsoft, Anthropic, OpenAI, AWS, IBM, Meta, HubSpot}. Considered including Coursera free-track entries; rejected because most are gated by paid subscription for the certificate itself.
- Visual design preference was unspecified; defaulted to a Tailwind v4 card grid with no shadcn install in v1 (avoids extra deps for a static page). Considered shadcn cards; deferred until interactive components are needed.
- Affiliate links were not addressed in the SPEC's constraints; defaulted to neutral URLs only, enforced implicitly by the test in T-002 that asserts hostname matches the provider's declared domain and rejects query parameters with affiliate-like keys (ref, aff, partner).
