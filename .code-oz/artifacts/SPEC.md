# SPEC

## Goals

- Host a curated directory of free certification programs from trusted providers (Google, Microsoft, Anthropic, OpenAI, and similar).
- Give self-directed learners a single browsable index of legitimate, no-cost credentials with outbound links to the provider's enrollment page.
- Reduce time spent hunting across individual provider sites to find resume-worthy free certifications.

## Users

- Self-directed learners (career changers, students, early-career professionals) hunting for free credentials they can list on a resume without scrolling through provider sites individually.

## Constraints

- Each listing must link to a verifiably free certification from a recognized provider; paid courses and pay-to-certify programs are excluded.
- Listings must be maintainable as providers add, rename, or retire programs.

## Acceptance criteria

- Visiting the site renders a browsable list of at least 10 free certification entries, each showing provider name, certification name, and an outbound link to the provider's enrollment page.
- Clicking a listing's link opens the provider's official page for that certification (verified by URL belonging to the provider's domain).
- Each listed certification has been confirmed free-to-earn at the time of listing (no required paid exam fee, no required paid subscription).

## Open questions

- What is the deployment target (static site on Vercel/GitHub Pages, full web app with a database, something else)?
- Should users be able to filter or search by provider, topic, or skill level, or is a single flat list acceptable for v1?
- Does the site need a backend for user accounts, saved lists, or progress tracking, or is it read-only/anonymous?
- Who maintains the listings — a hand-curated Markdown/JSON file edited by the owner, or a CMS / submission flow?
- What is the initial provider scope beyond Google, Microsoft, Anthropic, and OpenAI (AWS, IBM, Meta, HubSpot, Coursera-hosted free tracks, etc.)?
- Is there a visual design preference (minimal text directory, card-based grid, specific brand styling)?
- Are affiliate or sponsorship links in scope, or must all links be neutral?

## Explicit non-goals

- Not hosting or reproducing certification content, exams, or course material — links only.
- Not issuing, verifying, or tracking the user's own certification progress or completions.
- Not a paid-course marketplace; paid certifications are out of scope even from trusted providers.
- Not a user-generated review or rating platform in v1.
