# UX / Visual / Accessibility audit — CertFinder

Audit date: 2026-05-16. Scope: visual hierarchy, typography, spacing, color contrast, dark-mode parity, interaction states, responsive layout (390 / 768 / 1440), WCAG 2.2 AA, motion, empty/error states, microcopy. Out of scope: architecture, security, performance.

The site is structurally sound — semantic landmarks, one h1, labels on every form control, working theme bootstrap, `noopener noreferrer` on external links, `motion-reduce` on most transitions. The findings below focus on polish, contrast edge cases, mobile sticky behavior, microcopy specificity, and parity gaps that will trip an audit tool or a screen reader.

---

## 1. Critical

### C1. Sticky filter toolbar collides with sticky header on mobile (and at every breakpoint)
- Location: `src/components/cert-explorer.tsx:101` (`sticky top-2`) and `src/components/site-header.tsx:7` (`sticky top-0 ... h-14`).
- What is wrong: The header is `sticky top-0` and 56px tall. The toolbar is `sticky top-2`, which pins it 8px from the viewport top — **underneath** the header. As the user scrolls the toolbar slides up behind the translucent header instead of resting against its bottom edge. Because both layers use backdrop-blur, the result is a stack of two blurred glass bars with the toolbar partially hidden.
- Why it hurts users: At 390px the toolbar already occupies ~280px of vertical space; losing 56px of it behind the header on scroll means search/filter controls are constantly obscured. Keyboard users tabbing into the search input scroll into a region that is partially under the header (the input is offset but the labels are not).
- Fix (class-only): change to `sticky top-[3.75rem]` (or `top-16`) so the toolbar parks against the bottom of the 56px header with a 4px gap. If you keep the existing translucent stack, add `shadow-sm` only on the toolbar (which it already has) and drop the toolbar's blur — `bg-white/95 dark:bg-slate-900/95` reads more clearly than stacked blurs.

### C2. Native `<select>` controls in dark mode show OS-light dropdown menu
- Location: `src/components/cert-explorer.tsx:135-188` (Provider / Level / Sort selects).
- What is wrong: The select triggers are styled dark (`dark:bg-slate-950 dark:text-slate-100`), but the dropdown popup is OS-native — on Chrome/Edge it inherits OS theme, on Safari it inherits the light UA stylesheet. Open one in dark mode and the menu pane will be white-on-black or worse, white-on-white depending on platform.
- Why it hurts users: Visibly broken in dark mode on Windows/Linux Chrome. Also a contrast failure on Safari macOS in dark mode.
- Fix (class-only, modern): add `[color-scheme:light_dark] dark:[color-scheme:dark]` to `<html>` in `layout.tsx`, or set CSS `color-scheme: light dark` globally. Tailwind 3.4+ supports `dark:[color-scheme:dark]`. This tells the UA to use the matching native widget palette. No JS, no popover replacement needed.

---

## 2. High

### H1. Placeholder text fails WCAG AA contrast in light mode
- Location: `src/components/cert-explorer.tsx:123` — `placeholder:text-slate-400`.
- What is wrong: `#94a3b8` on white = **3.34:1**, below WCAG AA 4.5:1 for normal text. Placeholders count as user-perceivable text. SC 1.4.3.
- Fix (class-only): `placeholder:text-slate-500` (#64748b = 5.74:1 on white). Already used in dark mode — match it.

### H2. Hero gradient heading marginal contrast on the brand-500 stop
- Location: `src/components/hero.tsx:25`.
- What is wrong: `text-transparent bg-clip-text` with gradient `from-gray-900 via-brand-700 to-brand-500` on aurora-tinted white. The rightmost characters render at `#2f64e0` ≈ 4.3:1 against white. Because the text is `text-4xl`/`5xl`/`6xl`, it qualifies as "large text" (AA 3:1) — so technically passes — but the gradient mixes contrast across the headline, making the end of the word "verified." visibly thinner than "Free". On the aurora backdrop (which adds a violet-tinted ~12% tint at the headline's right edge), some users will see the brand-500 stop drop below 3:1.
- Why it hurts users: Inconsistent legibility across one headline; users with low vision will read the start and lose the end. WCAG 1.4.11 (non-text contrast) is fine, but legibility for the visual hierarchy suffers.
- Fix (class-only): swap the terminal stop one step darker. `from-gray-900 via-brand-700 to-brand-600` on light and `dark:to-brand-300` (not `-400`) on dark. Brand-600 = 7.65:1, brand-300 = 8.5:1 — both clear AA-large with margin.

### H3. Theme toggle focus ring offset color mismatches body background (dark mode)
- Location: `src/components/theme-toggle.tsx:108` — `dark:focus-visible:ring-offset-slate-900`.
- What is wrong: Body background is `#07091a` (defined in `globals.css:18`), but the toggle's dark focus ring offset is `slate-900` (`#0f172a`). Every other focusable component uses `dark:focus-visible:ring-offset-[#07091a]`. The result is a 4px slate-900 halo around the brand-500 ring sitting on the darker `#07091a` body — visually a doubled ring.
- Why it hurts users: Inconsistent focus styling, marginally distracting. WCAG 2.4.11 / 2.4.13 (focus appearance) is met but visually inconsistent.
- Fix (class-only): replace `dark:focus-visible:ring-offset-slate-900` with `dark:focus-visible:ring-offset-[#07091a]`.

### H4. "About" anchor target does not exist
- Location: `src/components/site-header.tsx:32` (`href="#about"`).
- What is wrong: The page has no `id="about"` anywhere. Clicking "About" does nothing; the URL changes but the viewport does not move. Screen reader users hear a link with no destination feedback.
- Why it hurts users: Broken nav. WCAG 2.4.4 (link purpose) — purpose is not fulfilled.
- Fix: Either (a) remove the link, (b) add an `id="about"` anchor on the footer or hero ("Curated by Ozzy" → expand to an About section), or (c) link to a dedicated route `/about`. Smallest change: rename to "Browse" + scroll to `#browse` only, drop "About". `#browse` itself also has no target — see H5.

### H5. "Browse" anchor target does not exist
- Location: `src/components/site-header.tsx:26` (`href="#browse"`).
- What is wrong: No element on the page has `id="browse"`. Same broken-anchor failure as H4. The toolbar would be the natural target.
- Fix (string-only, in `cert-explorer.tsx:99`): add `id="browse"` to the outer wrapper `<div>` of the explorer (or to the toolbar region). Combined with a `scroll-mt-20` utility so the sticky header does not cover the target after a jump.

### H6. Skip-to-content link missing
- Location: `src/app/layout.tsx`.
- What is wrong: Keyboard users tabbing into the page hit the brand link, then Browse/About/Theme, then the search input — six tabs to reach content. WCAG 2.4.1 (bypass blocks) is best satisfied with a skip link.
- Fix (additive, class-only on a new `<a>`): inject a `Skip to main content` link as the first element in `<body>`:
  ```tsx
  <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow focus:ring-2 focus:ring-brand-500 dark:focus:bg-slate-900 dark:focus:text-gray-50">Skip to main content</a>
  ```
  and `<main id="main" ...>` in `page.tsx:7`.

### H7. Two `<h2 id="No matches">` collisions / empty state has a heading that breaks document outline
- Location: `src/components/cert-list.tsx:74` (`<h2>No matches</h2>`) and `cert-explorer.tsx:216` (plain div empty state).
- What is wrong: The explorer renders one of two empty states depending on whether `filtered.length > 0`. The explorer's own no-match div (`cert-explorer.tsx:213-219`) returns before `CertList` mounts, so `CertList.EmptyState` (line 67) is unreachable from this entry point — **dead code** with an h2 that would have collided with provider-level h2s if it ever ran. Worse, the visible empty state is a plain div, so SR users get no semantic heading and the `aria-live="polite"` count update is the only audible signal.
- Why it hurts users: Inconsistent SR experience between the two empty paths; no visible illustration in the active empty state.
- Fix: Pick one empty-state component. Recommend deleting the `cert-explorer.tsx:213-219` branch and always rendering `<CertList />`, which already has an illustrated empty state via `cert-list.tsx:9-11`. Then promote the empty state's heading to `<h2>` with a stable `id` so it joins the document outline cleanly.

### H8. `aria-live="polite"` is on a container that includes a button
- Location: `src/components/cert-explorer.tsx:192-210`.
- What is wrong: The live region wraps both the count text **and** the "Reset filters" button. When the user types in search, the announcement fires; when they then click Reset, the entire region's text content changes, and the SR may announce "Reset filters" as a live update or duplicate the count. WCAG 4.1.3 (status messages) wants the live region scoped tightly to the changing message.
- Fix (structural, small): make only the `<span>{countLabel}</span>` the live region: split the parent, wrap just the count span with `<p role="status" aria-live="polite">{countLabel}</p>`, and leave the button as a sibling.

### H9. Search input has no `aria-controls` / no result count association
- Location: `src/components/cert-explorer.tsx:117-124`.
- What is wrong: The input does not point at the results region. SR users typing into search are not told what region updates.
- Fix (class-only): add `id="results"` to the `CertList` container (or the empty-state div) in `cert-explorer.tsx`, and on the input add `aria-controls="results"` plus `aria-describedby={countId}` referencing the count span. Combined with H8, this is the canonical pattern.

---

## 3. Medium

### M1. Toolbar at 390px crams four inputs into one column with too much vertical space
- Location: `src/components/cert-explorer.tsx:105` — `grid grid-cols-1 gap-3 md:grid-cols-12`.
- What is wrong: Below the `md` breakpoint (768px) all four controls stack vertically, producing a ~280px tall sticky element that consumes 60% of a 390×844 viewport on iPhone. Search + Provider + Level + Sort all get equal weight.
- Fix (class-only): keep search full-width on mobile; put Level and Sort side-by-side on a single row from `sm:` up; keep Provider full-width because its options are long. Example:
  ```
  grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-12
  ```
  with Search and Provider spanning `col-span-2` on small, and Level / Sort splitting the row.

### M2. Provider/Level/Sort selects are 36px tall — under the 44×44 mobile tap target floor
- Location: `src/components/cert-explorer.tsx:139, 160, 181` — `px-3 py-2 text-sm` yields ~36-38px.
- What is wrong: WCAG 2.5.8 (Target Size, Minimum, AA, level AA in 2.2) requires ≥24×24; 2.5.5 (AAA) wants 44×44. Apple HIG says 44pt. 38px is borderline.
- Fix (class-only): bump padding to `py-2.5` (40px) or set `min-h-[44px]` plus aligning text via `flex items-center`. Same fix applies to the search input.

### M3. Sticky toolbar `top-2` overlap on tablet/desktop
- Already raised in C1; specifically for ≥768px, the same 8px-from-top behavior leaves the toolbar half-under the 56px header on scroll. C1's fix resolves both.

### M4. Card hover translate-y conflicts with focus-visible appearance
- Location: `src/components/cert-card.tsx:72` — `hover:-translate-y-0.5`.
- What is wrong: The card itself is not focusable; only the "Learn more" link is. Hovering the card lifts the entire card, but tabbing focuses just the link — the focus ring renders on the lifted card. This is fine, but the focus ring offset color (`focus-visible:ring-offset-white` on the link, `cert-card.tsx:145`) is calibrated for the page bg, not the card bg — they happen to match in light mode, but in dark mode the card is `dark:bg-white/[0.03]` (~`#101225`) and the offset is `#07091a`. A 1-frame mismatch.
- Fix (class-only): change the link's `dark:focus-visible:ring-offset-[#07091a]` to a transparent offset (`focus-visible:ring-offset-transparent`) or to a matched dark card bg. Cleanest: remove the offset entirely and increase ring width — `focus-visible:ring-2 focus-visible:ring-brand-500/80 focus-visible:ring-offset-0`.

### M5. Card metadata is small (text-xs ≈ 12px) and gray-500 on white
- Location: `src/components/cert-card.tsx:123, 140`.
- What is wrong: 12px gray-500 (#6b7280) on white = 4.83:1 — passes AA by a sliver. With aurora tinting and a soft white card bg this drops in some regions. WCAG SC 1.4.3 met; but on a 1440 screen at typical viewing distance the "Verified Jan 14, 2026" stamp is hard to scan. Information density bleeds into the card foot.
- Fix (class-only): bump the dt/dd row to `text-[13px]` and `text-gray-600 dark:text-gray-300`. Keep the icons at 14px.

### M6. Skill chips share the same neutral as the card background — no visual rhythm
- Location: `src/components/cert-card.tsx:107` — `bg-gray-100 ... dark:bg-white/5`.
- What is wrong: On the card the chip bg is `#f3f4f6` and the card bg is `#ffffff` — only a 1.04 contrast against the card surface, so chips read as a single mass rather than distinct tokens. Dark mode is similar (`white/5` chips on `white/[0.03]` card = barely visible). Chips and overflow indicator are nearly indistinguishable.
- Fix (class-only): add `ring-1 ring-inset ring-gray-200 dark:ring-white/10` to each chip, matching the `+N more` overflow chip. This separates chips from the surface in both modes.

### M7. Provider initial avatar uses a hash that can put red/rose Advanced level chip next to a rose avatar
- Location: `src/components/cert-card.tsx:8-17, 40` (palette and rose-700 advanced styles).
- What is wrong: Provider hash can land on `from-rose-500 to-pink-600`. If that provider hosts an Advanced cert, the avatar and the level chip both read as red — perceptually they fuse. Color-coded semantics (Advanced = red) is undermined.
- Fix (small refactor): seed the hash to skip rose when level is Advanced; or simpler, drop rose-500/pink-600 from the avatar palette since the badge already owns that color. Reduces the palette to seven entries but preserves semantic clarity.

### M8. `<select>` triggers do not have a visible chevron
- Location: `src/components/cert-explorer.tsx:139, 160, 181`.
- What is wrong: Native chevron is visible on most browsers but inconsistent in size/color across Safari/Chrome/Firefox; in dark mode some UAs render a dark chevron on a dark bg. The selects look like text inputs on first glance.
- Fix (class-only): add a styled chevron via background-image utility or `appearance-none` + an SVG layered with `pr-9`. Or accept native and add `bg-no-repeat` rules. Smallest patch: `appearance-none bg-[url('data:image/svg+xml;utf8,...')] bg-no-repeat bg-[right_0.75rem_center] pr-9`.

### M9. No favicon, no theme-color, no OG/Twitter, no manifest, no JSON-LD
- Location: `src/app/layout.tsx` metadata block.
- What is wrong: Tab shows the default Next.js favicon (or none). Sharing on Slack/Twitter shows the URL only. iOS Safari has no theme color match — the white/dark-blue chrome flickers on scroll. Mobile add-to-home-screen falls back to generic icon.
- Fix (additive, no refactor): extend `metadata` in `layout.tsx` with:
  - `icons: { icon: '/favicon.svg', apple: '/apple-icon.png' }`
  - `themeColor: [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }, { media: '(prefers-color-scheme: dark)', color: '#07091a' }]`
  - `openGraph: { title, description, type: 'website', images: ['/og.png'] }`
  - `twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] }`
  - Add a JSON-LD `ItemList` for the cert collection — boosts findability on Google for "free certifications".

### M10. Microcopy on stat chips is non-specific and degrades when props are undefined
- Location: `src/components/hero.tsx:37-41`.
- What is wrong: When `providerCount` / `certCount` are undefined the chips read "Curated weekly" and "Updated 2026-05-16". The page always renders Hero without those props (see `page.tsx:8` — no props passed), so the verifiable claim "Curated weekly" is shown by default but is unverifiable by the visitor. Real values exist (the explorer shows them) — they should flow into the hero.
- Why it hurts users: Vague chips beside a "Last verified" pill of the same date undermine trust. WCAG-adjacent: violates the spirit of "make claims specific" but no SC failure.
- Fix (small refactor, in `page.tsx`): compute counts before rendering:
  ```tsx
  const certCount = Certifications.length;
  const providerCount = new Set(Certifications.map(c => c.provider)).size;
  <Hero providerCount={providerCount} certCount={certCount} />
  ```
  Chips will read "12 providers" and "47 certs" — concrete numbers.

### M11. "Last verified" pill date is `new Date().toISOString().slice(0,10)` — always today
- Location: `src/components/hero.tsx:7`.
- What is wrong: The chip claims the catalog was last verified today, every day. This is a false claim — verification is a periodic editorial action. SR users hearing "Last verified 2026-05-16" assume freshness that the system does not guarantee.
- Why it hurts users: Trust erosion the moment a visitor returns the next day and sees the same chip auto-update. WCAG SC 3.3 family is about correctness — borderline truthfulness issue.
- Fix (small refactor): derive from data — `Math.max(...Certifications.map(c => Date.parse(c.lastUpdated ?? c.verifiedFreeAt)))`, then format. Or accept a `lastVerified` prop from a build-time constant.

### M12. Empty state message in explorer is generic
- Location: `src/components/cert-explorer.tsx:217`.
- What is wrong: "No certifications match the current filters." does not suggest a recovery. The Reset Filters action is in the toolbar above but visually separated.
- Fix (string + small structural): change copy to "No certifications match. Try clearing filters or searching a different skill." and embed a `<button>` Reset Filters inline (re-use the same handler). Move the EmptyState component from `cert-list.tsx` here so the illustration is also shown.

### M13. No `error.tsx` or `not-found.tsx`
- Location: `src/app/`.
- What is wrong: If a route throws (e.g. data import fails) Next.js shows its default error page. If a user types `/foo` they get the default 404. Both are off-brand and not internationalized.
- Fix (additive): add `src/app/not-found.tsx` and `src/app/error.tsx` with branded copy reusing the header/footer.

---

## 4. Low

### L1. Search input lacks a clear (×) button
- Location: `src/components/cert-explorer.tsx:117`.
- What is wrong: `type="search"` adds a native clear button in WebKit only; Firefox shows none. Inconsistent.
- Fix (additive): render a conditional ×-button when `query.length > 0`, abs-positioned right, `aria-label="Clear search"`.

### L2. Brand mark hover rotation is too subtle to notice
- Location: `src/components/site-header.tsx:54` — `group-hover:rotate-3`.
- What is wrong: 3deg is below the perceptual threshold for most users. Either commit to a noticeable affordance (8–10deg) or drop the transition.
- Fix (class-only): change to `group-hover:rotate-6` and add `group-hover:scale-105`.

### L3. Footer "Curated by Ozzy" has lower contrast than copyright
- Location: `src/components/site-footer.tsx:11` — `text-gray-400 dark:text-gray-500`.
- What is wrong: `gray-400` on white is 2.85:1 — **fails** AA 4.5:1 for normal body text. (The copyright span uses `text-gray-500` which is 4.83:1 and passes.)
- Fix (class-only): change to `text-gray-500 dark:text-gray-400` — keeps the visual hierarchy where the credit reads slightly lighter than the copyright while staying above 4.5:1.

### L4. Header glass uses `#07091a/70` — that exact hex appears in 6 places
- Location: `src/components/site-header.tsx:7,16,33`; `cert-card.tsx:145`; `site-footer.tsx:7,17,26`.
- What is wrong: The dark body background is a hardcoded literal repeated as inline arbitrary values. Drift risk: someone tweaks `globals.css` and the focus ring offsets desync silently. A CSS variable solves it.
- Fix (small refactor): in `globals.css`, define `:root { --bg: #ffffff; } .dark { --bg: #07091a; }` and reference via `bg-[var(--bg)]/70` and `ring-offset-[var(--bg)]`.

### L5. Card metadata icons (clock, check) have no accessible relation
- Location: `src/components/cert-card.tsx:125-138`.
- What is wrong: The clock icon paired with the duration string is `aria-hidden`, which is right — but the `dt` is `sr-only` so the SR reads "Self-paced" with no context. Two dts coexist; technically valid but the verbal experience is "Self-paced Verified Jan 14, 2026" with no separator.
- Fix (class-only): wrap each pair in `<div role="group" aria-label="Duration">` so the SR groups them.

### L6. Skill chips do not wrap predictably on long skills
- Location: `src/components/cert-card.tsx:103`.
- What is wrong: `flex flex-wrap gap-1.5` is fine for short tags but a long skill ("Generative AI fundamentals") forces overflow on a 320px column. No truncation; the card grows.
- Fix (class-only): add `max-w-[12rem] truncate` on each `<li>` and a `title={skill}` for the full text.

### L7. Card's "Verified" date is repeated literally on every card
- Location: `src/components/cert-card.tsx:135`.
- What is wrong: Sixteen cards on the page each say "Verified Jan 14, 2026" or similar. Visual repetition without information density gain.
- Fix (string + class-only): when all cards on the page share the same verification date, lift the date into the toolbar ("All entries verified Jan 14, 2026") and remove from the card. Smaller change: hide on `sm:` and only show the duration chip; show date on hover via `title=`.

### L8. Light-mode body color is `#0b1020` but Tailwind defaults to gray scale
- Location: `src/app/globals.css:13`.
- What is wrong: Body color is a custom near-black `#0b1020` while every component uses `text-gray-900` (`#111827`) for headings. The two coexist on the same page (the body color paints anywhere text utilities are not applied). They are close but not identical — slight tone drift.
- Fix (class-only): drop the custom body color and let Tailwind handle it. Use `text-gray-900 dark:text-gray-100` on `<body>` in `layout.tsx`. Already works.

### L9. Reset Filters button has no focus offset
- Location: `src/components/cert-explorer.tsx:198-208` — uses `focus-visible:ring-2 focus-visible:ring-brand-500` without `ring-offset`.
- What is wrong: On the toolbar's translucent white bg the ring is visible, but in dark mode the toolbar is `slate-900/70` and the brand-500 ring (#2f64e0) sits directly on near-identical-luminance pixels in places — ring blends.
- Fix (class-only): add `focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900` (matches the toolbar bg).

---

## 5. Nit

### N1. `text-base` (16px) used for hero subhead at 390px
- `hero.tsx:30`. At narrow widths the subhead measure compresses to ~45ch which is fine; the `text-balance` helps. Could promote to `text-[17px]` for breathing room.

### N2. `motion-reduce` is everywhere except the brand mark's `group-hover:rotate-3`
- `site-header.tsx:54` has `motion-reduce:transition-none motion-reduce:group-hover:rotate-0` — good.
- `cert-card.tsx:206-211` has it on the arrow — good.
- `cert-card.tsx:72` (the card lift) **has** `motion-reduce:transition-none motion-reduce:hover:translate-y-0` — good. Pattern is consistent.
- No issue, audited and clean.

### N3. Aurora gradient is rendered twice — once on `<main>` and once on `<section>` inside Hero
- `page.tsx:7` sets `bg-aurora`, then `hero.tsx:13` re-applies `bg-aurora`. The second one is redundant.
- Fix: remove `bg-aurora` from the hero `<section>` — the main element already provides it.

### N4. `useId` IDs are not visible in DOM tooltips
- `cert-explorer.tsx:53-56`. Fine for SR but harder to inspect manually. Not a finding — just FYI.

### N5. Footer wraps to two rows below 640px — the GitHub icon ends up centered, isolated
- `site-footer.tsx:8` — `flex-col sm:flex-row`. Looks fine; just observe.

---

## 6. Dark-mode parity check

Every component I inspected has a `dark:` variant for color, border, ring, and bg. No hardcoded light-only utilities found in:
- `site-header.tsx`, `site-footer.tsx`, `hero.tsx`, `cert-explorer.tsx`, `cert-list.tsx`, `cert-card.tsx`, `theme-toggle.tsx`.

Minor parity drifts:
- Theme toggle uses `slate-*` tokens; rest of the app uses `gray-*` and `slate-*` mixed. Pick one (`gray` is dominant) — see L8.
- Toolbar uses `slate-200/700` borders; cards use `gray-200`. Same neutral family, different scale steps. Cosmetic.
- Hero gradient stops differ between light and dark (`brand-500` vs `brand-400` terminal) — this is intentional but covered in H2.

---

## 7. Typography & measure

| Element | Size | Line-height | Measure (1440) | Notes |
|---|---|---|---|---|
| Hero h1 | 36/48/60 px | leading-tight (implicit) | ≤25ch on mobile, ~16ch on desktop | OK; centered, balanced |
| Hero subhead | 16/18 | leading-normal | 45-58ch | Within ideal 45-75ch |
| Provider h2 | 18 | tracking-tight | n/a | OK |
| Card h3 | 16 | leading-snug | ~35ch | OK |
| Card description | 14 | leading-normal | ~40ch | OK, line-clamp-3 |
| Card metadata | 12 | normal | n/a | See M5 |
| Filter labels | 12 | normal | n/a | OK |

Font stack: system UI, no Inter / Geist import. This is intentional and ships zero font bytes — keep it. The fallback chain is well-ordered.

Boldface usage: appropriate (only headings and chips). One paragraph in the audit's banned list says minimize boldface — code adheres.

---

## 8. Motion

All transitions are 200ms (`duration-200`) — within the ≤250ms ceiling. Every animated element has `motion-reduce:transition-none` or `motion-reduce:hover:*` variants. No autoplay, no parallax, no infinite loops. The aurora background is static (CSS gradients, no animation). Clean.

---

## 9. Information density

Desktop 1440: 3-column grid groups by provider with a heading + count row, then 1–3 cards. Most providers have only 1–2 certs in the dataset, so groups feel sparse (single card sitting alone with an h2 above it). Consider:
- Allowing single-card groups to render side-by-side if the next group is also single-card (visual rebalancing).
- Or: when filters are non-trivial (search query present), abandon provider grouping and show a flat grid. Provider becomes a card chip only.

Mobile 390: 1-column. Cards stack cleanly. Vertical rhythm is good — 16px gap, 48px between provider groups.

---

## 10. Prioritized FIX PLAN

| # | Finding | Severity | Effort | Type |
|---|---|---|---|---|
| 1 | C1 toolbar sticky offset (`top-2` → `top-16`) | Critical | S | class-only |
| 2 | C2 `color-scheme: light dark` for selects | Critical | S | class-only (one line in layout) |
| 3 | H1 placeholder contrast `slate-400` → `slate-500` | High | S | class-only |
| 4 | H2 hero gradient terminal stop → `brand-600` / `dark:brand-300` | High | S | class-only |
| 5 | H3 theme toggle focus offset → `#07091a` | High | S | class-only |
| 6 | H4 + H5 add `id="browse"` to toolbar, decide on About | High | S | string-only |
| 7 | H6 skip link | High | S | additive markup |
| 8 | H7 unify empty state — delete duplicated branch | High | M | refactor (small) |
| 9 | H8 + H9 split live region, add `aria-controls`/`aria-describedby` | High | M | small refactor |
| 10 | M1 mobile toolbar 2-col grid | Medium | S | class-only |
| 11 | M2 control min-height 44px | Medium | S | class-only |
| 12 | M4 card link focus offset cleanup | Medium | S | class-only |
| 13 | M5 metadata size + contrast bump | Medium | S | class-only |
| 14 | M6 skill chip ring | Medium | S | class-only |
| 15 | M7 remove rose from avatar palette | Medium | S | array edit |
| 16 | M8 styled chevron on selects | Medium | M | class-only with SVG |
| 17 | M9 metadata: favicon, theme-color, OG, JSON-LD | Medium | M | layout.tsx edit + asset files |
| 18 | M10 wire `providerCount`/`certCount` to Hero | Medium | S | page.tsx props |
| 19 | M11 derive "Last verified" from data | Medium | S | hero.tsx logic |
| 20 | M12 empty-state copy + reset button inline | Medium | S | string + small structural |
| 21 | M13 add `error.tsx`, `not-found.tsx` | Medium | M | new files |
| 22 | L1 search clear button | Low | S | additive |
| 23 | L2 brand mark rotation tuning | Low | S | class-only |
| 24 | L3 footer "Curated by" contrast | Low | S | class-only |
| 25 | L4 dark bg CSS variable | Low | M | CSS + global find-and-replace |
| 26 | L5 group dt/dd in card metadata | Low | S | structural |
| 27 | L6 skill chip truncate | Low | S | class-only |
| 28 | L7 lift verified date to toolbar | Low | M | structural |
| 29 | L8 body color → Tailwind utilities | Low | S | class + CSS removal |
| 30 | L9 reset filters focus offset | Low | S | class-only |
| 31 | N3 remove duplicate `bg-aurora` | Nit | S | class-only |

Class/string-only batch (one PR, ~20 minutes): 1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15, 18, 19, 22, 23, 24, 27, 29, 30, 31 — these are 21 of 31 findings with no component restructuring.

Small refactors (second PR): 8, 9, 16, 17, 20, 21, 25, 26, 28.

---

## 11. Quick wins for next sprint

1. Apply the class-only batch (PR1). Resolves C1, C2, H1-H5, half of medium findings.
2. Add `error.tsx`, `not-found.tsx`, skip link, OG/favicon metadata (PR2). Resolves H6, M9, M13.
3. Unify the empty state + improve live region semantics (PR3). Resolves H7, H8, H9, M12.

Each PR is independently shippable, none changes data shape or component contracts. After PR1 alone the WCAG audit score should jump from "passes with two failures" (H1 contrast + H4/H5 broken anchors) to "passes AA cleanly".
