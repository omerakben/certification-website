# SOURCE_CHECK

## Spec sources

### SC-SPEC-001: Acceptance criterion 1 - browsable list of >=10 entries

- Spec: SPEC.md ## Acceptance criteria, bullet 1
- Quote: "Visiting the site renders a browsable list of at least 10 free certification entries, each showing provider name, certification name, and an outbound link to the provider's enrollment page."


### SC-SPEC-002: Acceptance criterion 2 - links open provider's domain

- Spec: SPEC.md ## Acceptance criteria, bullet 2
- Quote: "Clicking a listing's link opens the provider's official page for that certification (verified by URL belonging to the provider's domain)."


### SC-SPEC-003: Acceptance criterion 3 - confirmed free-to-earn

- Spec: SPEC.md ## Acceptance criteria, bullet 3
- Quote: "Each listed certification has been confirmed free-to-earn at the time of listing (no required paid exam fee, no required paid subscription)."


### SC-SPEC-004: Constraint - verifiably free, recognized providers only

- Spec: SPEC.md ## Constraints, bullet 1
- Quote: "Each listing must link to a verifiably free certification from a recognized provider; paid courses and pay-to-certify programs are excluded."


### SC-SPEC-005: Constraint - listings maintainable as providers change

- Spec: SPEC.md ## Constraints, bullet 2
- Quote: "Listings must be maintainable as providers add, rename, or retire programs."


### SC-SPEC-006: Goal - curated directory of free certifications

- Spec: SPEC.md ## Goals, bullet 1
- Quote: "Host a curated directory of free certification programs from trusted providers (Google, Microsoft, Anthropic, OpenAI, and similar)."

## Reference sources

### SC-REF-NONE-001: No prior code in greenfield project

- Searched: glob '**/*' against project root (/private/var/folders/wz/1yjtgvvj3l1dr77sl4d5nfyh0000gn/T/code-oz-claude-dqGmLI); ls -la against project root and against .code-oz/
- Result: 0 files (project root contains only . and ..); .code-oz/ does not exist
- Why explicit: greenfield repository with no prior code, no design system, and no precedent patterns to extend; every file introduced by this plan is new and authored against the SPEC directly.

## Docs sources

### SC-DOC-NONE-001: No cached docs and PLAN has no network

- Why explicit: PLAN runs with repo_context.network='none' and the project's .code-oz/cache/docs/ directory does not exist, so no authoritative upstream documentation is available to cite at planning time; BUILD will verify Next.js 16 App Router, Tailwind v4 CSS-first config, and node:test runner behavior against live docs when applying each task's patch, and any version-specific divergence will surface as a validation failure on the task's command.

## Coverage

- T-001 -> SC-SPEC-006, SC-REF-NONE-001, SC-DOC-NONE-001
- T-002 -> SC-SPEC-001, SC-SPEC-002, SC-SPEC-003, SC-SPEC-004, SC-SPEC-005, SC-REF-NONE-001, SC-DOC-NONE-001
- T-003 -> SC-SPEC-001, SC-SPEC-002, SC-SPEC-006, SC-REF-NONE-001, SC-DOC-NONE-001
- T-004 -> SC-SPEC-001, SC-SPEC-006, SC-REF-NONE-001, SC-DOC-NONE-001
