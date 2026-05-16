# HYPOTHESES

## H-001: Directory view ships zero client-side JavaScript

- Phase: plan
- Status: open
- Falsifier: production build output for `/` contains any `_next/static/chunks/*.js` referenced by the page HTML, or Next.js build report lists First Load JS > 0 kB for the route, or any component in the render tree contains a `"use client"` directive.
- Evidence: PLAN T-001 commits to App Router server components; PLAN T-003 explicitly forbids `use client` in `cert-card` and `cert-list` and gates this via a `react-dom/server` render test.
- Risk if false: SPEC constraint "no client JS for the directory view" fails; PLAN T-003 risk materializes and T-001/T-003 require rework to remove client boundaries.

## H-002: Every seeded certification is verified-free at build time

- Phase: plan
- Status: open
- Falsifier: `pnpm test` passes while `src/lib/certifications/data.ts` contains any entry whose schema-required `freeToEarn` flag is false, is missing, or whose `verifiedFreeAt` is older than 90 days relative to test run time.
- Evidence: PLAN T-002 declares a schema with `verifiedFreeAt` ISO date, an integrity test that fails on stale entries, and the SPEC AC requiring free-to-earn entries only.
- Risk if false: SPEC AC for free-only listings fails; users encounter paid offerings via the site; the integrity guarantee that justifies skipping a CMS (PLAN Open Questions item 3) collapses.

## H-003: Listing URLs point at the declared provider's own domain

- Phase: plan
- Status: open
- Falsifier: integrity test in `src/lib/certifications/data.test.ts` passes while any entry's URL hostname does not match (or is not a subdomain of) the entry's declared provider domain, or the URL query string contains keys matching `/^(ref|aff|partner)$/i`.
- Evidence: PLAN T-002 lists this enforcement; PLAN Open Questions item 6 commits to neutral-URL enforcement via the same test.
- Risk if false: trust constraint from SPEC (links to declared provider) breaks; affiliate-link non-goal in PLAN Out-of-scope is violated; curator credibility erodes.

## H-004: Seed data covers at least 10 entries across at least 8 providers

- Phase: plan
- Status: open
- Falsifier: `src/lib/certifications/data.ts` exports fewer than 10 entries, or the set of distinct `provider` values has cardinality below 8, or any provider value falls outside the curated set {Google, Microsoft, Anthropic, OpenAI, AWS, IBM, Meta, HubSpot}.
- Evidence: PLAN T-002 task description; PLAN Open Questions item 4 fixes the eight-provider set.
- Risk if false: directory looks empty or skewed; SPEC AC for a "curated directory" is not credibly met; T-004 provider-section test has too few sections to meaningfully exercise grouping.
