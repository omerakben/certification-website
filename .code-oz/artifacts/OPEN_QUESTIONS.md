# OPEN QUESTIONS

## Q-001: Is a 90-day verifiedFreeAt staleness window the right cutoff?

- Phase: plan
- Status: open
- Importance: medium
- DueBy: -
- Context: PLAN T-002 risk mitigation hard-codes a 90-day re-verification window in the integrity test; SPEC did not specify a cadence.
- Resolution attempts: none yet.

## Q-002: Should the eight-provider seed set be locked for v1 or revisited before launch?

- Phase: plan
- Status: open
- Importance: medium
- DueBy: -
- Context: PLAN Open Questions item 4 fixes the provider set to {Google, Microsoft, Anthropic, OpenAI, AWS, IBM, Meta, HubSpot} and excludes Coursera free-track; SPEC did not enumerate providers.
- Resolution attempts: PLAN documents the rationale (Coursera free-track gated by paid subscription) but does not confirm with the maintainer.

## Q-003: Is hand-curated TypeScript the right curation surface beyond v1?

- Phase: plan
- Status: open
- Importance: low
- DueBy: -
- Context: PLAN Open Questions item 3 defaults to a TypeScript data module; a CMS or submission workflow is deferred. Decision may need revisiting as the entry count grows beyond ~20.
- Resolution attempts: PLAN rejects CMS for v1 on scale grounds; no trigger threshold defined for revisiting.

## Q-004: Should the affiliate-key blocklist (`ref|aff|partner`) be expanded?

- Phase: plan
- Status: open
- Importance: low
- DueBy: -
- Context: PLAN Open Questions item 6 enumerates three affiliate-like query keys; other common keys (e.g., `utm_source`, `tag`, `campaign`, `referrer`) are not blocked.
- Resolution attempts: none yet.

## Q-005: Is Vercel the committed deployment target, or is the choice still open?

- Phase: plan
- Status: open
- Importance: medium
- DueBy: -
- Context: PLAN Goals fix Vercel as the host and PLAN Open Questions item 1 documents the default; SPEC did not specify a target, and GitHub Pages was considered and rejected.
- Resolution attempts: PLAN records the rationale (Server Components, maintainer stack) but does not confirm with the maintainer.

## Q-006: Should v1 include sitemap, robots, and analytics, or stay deferred?

- Phase: plan
- Status: open
- Importance: low
- DueBy: -
- Context: PLAN Out-of-scope defers SEO and analytics wiring until the cert set stabilizes; SPEC did not require them.
- Resolution attempts: PLAN explicitly defers; no trigger condition defined.
