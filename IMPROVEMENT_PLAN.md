# Protocol Lab — Improvement Plan

A phased, test-driven plan to address the findings from the codebase audit. The
guiding principle: **establish a safety net before changing anything, and make
every change independently verifiable.** Phases are ordered so that each one is
validated against a known-green baseline established by the phase before it.

Legend: 🔴 high · 🟠 medium · 🟢 low. Each task lists **Change**, **How it's
tested**, and **Commit boundary**.

---

## Phase 0 — Baselines & safety net (prerequisite for everything)

You cannot detect regressions against a red baseline. Before any refactor, we
need (a) a green `check`/`lint`, (b) a test runner, and (c) recorded reference
metrics. Phases 1–2 deliver this.

### Reference metrics to capture first (no code change)

- **Bundle baseline:** record `du -sh build/_app/immutable` and the per-chunk
  sizes (`du -k build/_app/immutable/chunks/*.js | sort -rn | head`). Current:
  total ~4.2 MB, largest chunk `CGRapOf_.js` = **1.2 MB** (contains protocol
  prose + d3 + mermaid + hljs all fused).
- **Visual baseline:** Playwright screenshots of the graph (force/radial/timeline),
  one protocol detail panel, one simulation mid-playback, mobile viewport. These
  become golden references for later refactors.
- Save both into `docs/baselines/` so later phases can diff against them.

---

## Phase 1 — Green the type/lint/format baseline 🔴

**Why first:** a 589-file prettier reformat creates an enormous diff. Doing it
_before_ any logic change keeps real changes reviewable. Each step here is
mechanical and independently verifiable.

### 1a. Fix the 3 TypeScript errors (logic, not formatting)

- `SequencePlayer.svelte:149` — `definition` possibly undefined → add a guard or
  non-null assertion after confirming the invariant.
- `SequencePlayer.svelte:208` — `getBBox` not on `SVGElement` → narrow to
  `SVGGraphicsElement` (which declares `getBBox`).
- `DetailPanel.svelte:734` — a `SubcategoryStory` is passed where `CategoryStory`
  is required. **Investigate the real intent** — this is a genuine type mismatch,
  not a cast. Either the prop type should be a union, or the wrong value is being
  passed. Do not paper over with `as`.
- **How it's tested:** `npm run check` → 0 errors. Manually exercise the
  SequencePlayer (a protocol simulation diagram) and the DetailPanel branch that
  hits line 734 (a subcategory story view) in the browser to confirm no runtime
  break.
- **Commit:** `fix(types): resolve 3 svelte-check errors`

### 1b. Fix non-formatting ESLint errors (the ~67 that aren't escapes)

- `@typescript-eslint/no-unused-vars` (~28): remove dead vars/imports
  (`windowHeight`, `FOUNDATION_TEASERS`, `navigateToBookChapter`,
  `foundationSections`, `totalParts`, …). **Verify each is truly dead** — grep
  for usage before deleting; some may indicate a half-wired feature.
- `svelte/no-navigation-without-resolve` (~13): wrap `goto()`/href targets with
  `resolve()` from `$app/paths` per the lint rule.
- `svelte/no-at-html-tags`: audit each `{@html}` site. The content is
  self-authored (not user input), so these are low-risk, but confirm the source
  is always static data and add an `eslint-disable-next-line` with a justifying
  comment rather than leaving a bare error.
- `svelte/prefer-svelte-reactivity` (Map) and `non_reactive_update`
  (`containerEl` in StoryDiagramModal): these are real reactivity smells — fix
  by using `$state`/`SvelteMap` as the rule suggests.
- **How it's tested:** `npm run check` stays at 0; targeted browser check of each
  touched component; `npx eslint .` error count drops to only the escape errors.
- **Commit:** `fix(lint): clear unused-vars, navigation, and reactivity errors`

### 1c. The 537 `no-useless-escape` errors — surgical, NOT regex

- ⚠️ **Do not** run a global `s/\\'/'/g`. The errors are a mix: `\'` inside
  template literals is unnecessary, but some flagged `` \` `` are inside
  single/double-quoted strings while _other_ backticks inside template literals
  are genuinely required. A blind regex will corrupt template literals.
- **Approach:** write a one-off codemod (`scripts/fix-useless-escapes.ts`) that
  consumes ESLint's JSON output (`eslint --format json`), which gives exact
  `{file, line, column}` for each flagged character, and removes **only** the
  backslash at those precise positions (process each file's edits
  right-to-left so columns don't shift).
- **How it's tested:** This is the highest-risk mechanical change because it
  edits content strings.
  1. Before: `git stash`-clean tree, run `npm run build`, save the built data
     chunk bytes.
  2. Run the codemod.
  3. `npx eslint .` → escape errors gone.
  4. `npm run build` and **diff the rendered text**: write a tiny script that
     imports `allProtocols`/book parts and asserts no string contains a stray
     backslash that changed meaning. Better: render-snapshot a few pages
     (Playwright `textContent`) before and after and diff — the visible text must
     be identical except for the intended apostrophes.
  5. Spot-check the `` \` `` sites (e.g. famous-outages.ts:174) by eye.
- **Commit:** `fix(content): remove unnecessary string escapes (codemod)`

### 1d. Prettier the repo

- `npm run format` (writes 589 files).
- **How it's tested:** `npm run build` output bytes for JS chunks should be
  **byte-identical** to the pre-format build (formatting must not change emitted
  code). Confirm `git diff --stat` shows only whitespace/quote churn.
- **Commit:** `style: apply prettier across repo` (isolated, reviewable as
  "formatting only")

### 1e. Wire the gates into CI

- Add to `.github/workflows/deploy.yml` (and ideally a separate `ci.yml` that
  runs on PRs): `npm run check`, `npm run lint`, `npm run test`.
- Add a lightweight pre-commit guard (lint-staged + a `prepare` hook, or a simple
  `husky` pre-commit) running `prettier --check` + `eslint` on staged files only,
  so the baseline can't regress.
- **How it's tested:** push a branch with a deliberate lint error and confirm CI
  fails; revert.
- **Commit:** `ci: enforce check/lint/test on PRs + pre-commit`

---

## Phase 2 — Test infrastructure (the safety net) 🔴

No unit runner exists today and there is exactly one trivial e2e test. Every
later phase depends on this. Build it before touching engine/data/components.

### 2a. Add Vitest for pure logic

- Install `vitest` + `@vitest/ui`; add `"test:unit": "vitest run"` and fold into
  `"test"`. Configure via `vite.config.ts` (SvelteKit + Vitest share it).
- **Target the pure, high-value functions** (no DOM needed):
  - `src/lib/engine/layouts.ts` — radial/timeline/force target positions:
    assert deterministic coordinates for a fixed node set, no overlaps, correct
    ring assignment.
  - `src/lib/engine/simulation.ts` — `warmUpSimulation`, `syncPositions`
    (regression test for the index-vs-id matching issue in Phase 7).
  - `src/lib/utils/` — `math.ts`, `colors.ts` (`themedDomColor`),
    `text-parser.ts`, `sequence-parser.ts`, `navigation.ts`. These parse the
    `[[id|label]]` / `{{concept}}` markup that the whole content layer relies on —
    they are the highest-leverage unit tests in the repo.
  - The cross-reference validator from Phase 3 (test it against a known-good and
    a deliberately-broken fixture).
- **How it's tested:** `npm run test:unit` green; coverage report shows the
  parser/layout/util modules covered.
- **Commit:** `test: add vitest + unit tests for engine/util/parser logic`

### 2b. Expand Playwright e2e for critical user paths

- Use the `window.__dev` helper (documented in CLAUDE.md) to drive deterministic
  navigation. Add specs:
  1. **Graph loads** → canvas present, node count matches data, no console errors.
  2. **Node select** → `__dev.go('tcp')` opens detail panel with correct title;
     close restores graph.
  3. **Layout switch** → force/radial/timeline each settle without error; compare
     against visual baselines (Playwright `toHaveScreenshot`).
  4. **Simulation** → `__dev.go('tls','simulate'); __dev.step(3)` advances the
     step timeline; play/pause works.
  5. **Search** → type a query, arrow-key to a result, Enter navigates.
  6. **Journey** → `__dev.journey(id)` → next/prev/exit.
  7. **Mobile** → 375px viewport: accordion + detail sheet render; no horizontal
     scroll.
  8. **Routes prerender** → smoke-load `/`, `/p/tcp`, `/rfcs`, `/pioneers`,
     `/outages`, `/glossary`, a `/book/[part]` and `/journey/[id]`; assert 200 +
     `<h1>` + unique `<title>`.
- Mark screenshot tests with a small pixel tolerance to avoid flakiness.
- **How it's tested:** `npm run test:e2e` green locally and in CI.
- **Commit:** `test: e2e coverage for graph, detail, sim, search, journey, mobile`

### 2c. Delete demo scaffolding

- Remove `src/routes/demo/**` (the `/demo` and `/demo/playwright` fixtures) once
  the real e2e suite replaces the placeholder spec.
- **How it's tested:** build + e2e still green; grep confirms nothing links to
  `/demo`.
- **Commit:** `chore: remove demo scaffolding routes`

---

## Phase 3 — Build-time content validation 🔴 (cheap, high insurance)

The data is consistent today, but nothing prevents a typo'd ID across 75
protocol files + journeys + comparisons + RFCs + book slots.

### 3a. Cross-reference validator

- `scripts/validate-cross-references.ts`: load every registry and assert all
  referential IDs resolve:
  - `protocol.connections[]`, `relatedProtocols` → protocol IDs
  - `journey.steps[].protocolId` → protocol IDs
  - `comparison/pairs.ts` ids → protocol IDs
  - `rfcs[].protocols[]`, `outages`/`pioneers` protocol refs → protocol IDs
  - `protocol.categoryId` → category IDs; subcategory `protocolIds` → protocol IDs
  - book `ChapterSlot` targets → existing protocol/sim/story/chapter
  - `[[id|label]]`, `{{concept}}`, `[[rfc:n]]` inline refs across prose (reuse the
    parser from 2a) → resolve to real entries
- Exit non-zero with a readable list on failure.
- Add `"validate": "tsx scripts/validate-cross-references.ts"` and chain into
  `"build": "npm run validate && vite build"` + the CI job.
- **How it's tested:** unit test (2a) feeds it a broken fixture → expects failure;
  run against current repo → expects pass. Intentionally break one ID on a
  branch → CI red.
- **Commit:** `feat(scripts): build-time cross-reference validator + wire to build`

### 3b. (Optional, after 3a is green) Branded ID types

- In `types.ts`, introduce `ProtocolId`/`CategoryId` brands to document intent
  and catch literal typos at review time. Low urgency; do only if it doesn't
  cause churn. Skip if it fights the existing data-authoring ergonomics — the
  runtime validator (3a) already covers correctness.
- **How it's tested:** `npm run check` stays green.

---

## Phase 4 — Bundle & performance 🔴

Now that tests + bundle baselines exist, optimize with proof. Re-measure chunk
sizes after each step and assert the target shrank without breaking e2e.

### 4a. Stop importing the full registry into the root layout

- `+layout.svelte:6` imports `allProtocols` only to show a count. Replace with a
  tiny derived constant (e.g. export `PROTOCOL_COUNT` from a 1-line module, or
  compute at build via the validator). This is the single biggest lever — it
  pulls the entire protocol registry into the entry chunk.
- **How it's tested:** rebuild; assert the entry/layout chunk no longer contains
  protocol prose (`grep -c "Transmission Control Protocol"` on the layout chunk →
  0); e2e count display still correct.
- **Commit:** `perf(bundle): drop full-registry import from root layout`

### 4b. Dynamic-import heavy page-specific data

- Move into route-loader `import()`s so they split out of the entry bundle:
  `journeys.ts` (116 KB), `diagram-definitions.ts` (140 KB), `rfcs.ts` (120 KB),
  `book/parts/*` (580 KB), `concepts.ts` where feasible.
- Each route's `+page.ts` loads only what it renders. Keep prerender working
  (dynamic import is fine under adapter-static).
- **How it's tested:** per-route e2e still green; measure that the protocol
  detail route chunk no longer bundles journeys/book; total transferred JS for a
  cold `/p/tcp` load drops (Playwright network capture).
- **Commit:** `perf(bundle): lazy-load journeys/rfcs/book/diagrams per route`

### 4c. Dynamic-import highlight.js

- `CodeExample.svelte` statically imports hljs core + 8 language packs (~150 KB).
  Switch to `await import()` on mount (mirroring the pattern MermaidDiagram
  already uses). Register only the languages actually present in the data.
- **How it's tested:** e2e on a page with a code example confirms highlighting
  still renders; entry chunk shrinks by ~150 KB.
- **Commit:** `perf(bundle): dynamic-import highlight.js + only used languages`

### 4d. manualChunks for the fused vendor chunk

- The 1.2 MB chunk fuses d3 + mermaid + hljs + content. After 4a–4c, add Vite
  `build.rollupOptions.output.manualChunks` to separate vendor (`d3-force`,
  `d3-quadtree`) from content so the graph engine and prose cache independently.
- **How it's tested:** rebuild; assert no single chunk > ~500 KB; e2e green;
  compare against Phase 0 baseline and record the win in `docs/baselines/`.
- **Commit:** `perf(bundle): split vendor/content chunks`

---

## Phase 5 — Component de-duplication 🟠

Pure refactors — the Phase 2 visual/e2e suite is the regression guard. Refactor
one group at a time, screenshot-diff after each.

### 5a. `GenericLink` for the 6 inline link components

- `detail/inline/{Chapter,Frontier,Glossary,Outage,Pioneer,Protocol}Link.svelte`
  share one shape (fetch entity by id → derive color/tooltip → render `<a>` or
  fallback `<span>`). Extract `GenericLink.svelte` taking `fetch`/`getHref`/
  `getTooltip` callbacks; reduce each to a thin wrapper. ~330 lines reclaimable.
- **How it's tested:** these links appear throughout prose — run the e2e that
  opens several detail pages and asserts links resolve + hover tooltips work;
  screenshot-diff a content-dense page before/after (must be pixel-identical).
- **Commit:** `refactor(inline): unify 6 link components into GenericLink`

### 5b. `ModalShell` for the 3 modals

- `DiagramModal`, `StoryDiagramModal`, `StoryImageModal` share backdrop / header /
  close / escape-key / backdrop-click. Extract `ModalShell.svelte` with content
  slot; fold the focus-trap work from Phase 6 into it (one place to get a11y
  right).
- **How it's tested:** e2e opens each modal type, asserts escape + backdrop-click
  close, content renders; screenshot-diff.
- **Commit:** `refactor(modals): extract ModalShell`

### 5c. Centralize Mermaid init

- Three components duplicate the mermaid `initialize({...})` config. Move to
  `utils/mermaid-helpers.ts` (`initMermaid()` returning the configured instance).
- **How it's tested:** e2e renders a mermaid diagram in each of the three call
  sites; visual-diff.
- **Commit:** `refactor(mermaid): single init helper`

---

## Phase 6 — Accessibility 🟠

### 6a. Focus trap + restore in modals

- Implement in the new `ModalShell` (5b): on open, move focus into the dialog and
  trap Tab; on close, restore focus to the trigger. Add visible focus styling to
  `AccessibleGraph` tree items.
- **How it's tested:** e2e keyboard-only flow — open modal, Tab cycles within,
  Escape closes and focus returns to trigger. Manual screen-reader smoke (VoiceOver).
- **Commit:** `a11y: focus trap/restore in modals + visible tree focus`

### 6b. Respect `prefers-reduced-motion` in DetailPanel

- The slide-in animations (`slideInRight`/`slideInUp`) ignore reduced-motion.
  Add `@media (prefers-reduced-motion: reduce) { animation: none }`. (The graph
  bloom already checks `prefersReducedMotion.current` — match that behavior.)
- **How it's tested:** e2e with `prefersReducedMotion` emulation
  (`page.emulateMedia({ reducedMotion: 'reduce' })`) asserts the panel appears
  without animation; default still animates.
- **Commit:** `a11y: honor reduced-motion in detail panel`

---

## Phase 7 — Engine / render-loop efficiency 🟠

Guarded by the Phase 2a unit tests on `layouts.ts`/`simulation.ts` and the
visual e2e. None of these are correctness bugs today, so land them only with
before/after evidence (FPS via `requestAnimationFrame` timing, or render-call
counts behind a dev flag).

### 7a. `syncPositions` match by id, not index

- `simulation.ts` aligns sim/graph nodes by array index. Switch to id-keyed
  matching to prevent silent desync. **Add the regression unit test first**
  (2a), then change the code so the test proves the fix.
- **Commit:** `fix(engine): match sim positions by id`

### 7b. Memoize per-frame map rebuilds

- `canvas-renderer.ts` rebuilds `NODE_MAP`/connected-id sets every frame. Cache
  keyed on `(nodes.length, selectedNode?.id, journey?.id)`; rebuild only on change.
- **Commit:** `perf(render): memoize node/connection maps`

### 7c. Evict settled hover/dim animations; pool gradients

- Delete animation-map entries when a node settles (`hoverT===0 && target===0`).
  Reuse a small gradient pool instead of `createLinearGradient` per shooting-star
  per frame.
- **Commit:** `perf(render): evict settled anims, pool gradients`

### 7d. Frame-rate-independent viewport lerp

- `app-state.svelte.ts:404` uses a fixed `t=0.09` assuming 60 fps (settles 2×
  fast on 120 Hz). Pass `dt` and use `1 - 0.9^(dt/16.67)`.
- **How it's tested:** unit-test the easing function for equal settle-time across
  simulated dt values; visual e2e unchanged.
- **Commit:** `fix(viewport): delta-time-normalized lerp`

> AppState decomposition (splitting the 30+-property god object into
> chrome/interaction/modal/navigation slices) is noted but **deferred** — high
> blast radius, low immediate payoff. Revisit only if it keeps growing.

---

## Phase 8 — Hygiene & SEO 🟢

### 8a. Sitemap + JSON-LD

- Generate `sitemap.xml` at build (endpoint or prerender script) covering `/`,
  all `/p/[id]`, `/rfcs`, `/pioneers`, `/outages`, `/book/*`, `/journey/*`. Add
  `EducationalResource` JSON-LD in `+layout.svelte`.
- **How it's tested:** build; assert `build/sitemap.xml` lists every prerendered
  route (cross-check against the route manifest); validate XML.
- **Commit:** `feat(seo): sitemap.xml + JSON-LD`

### 8b. Compress og-image

- `static/og-image.png` is 1.8 MB. Re-encode to <200 KB (it's a social card,
  1200×630).
- **How it's tested:** visual check it still looks right; size assertion.
- **Commit:** `chore: compress og-image`

### 8c. Repo cleanup + docs

- Remove `outreach-emails.md` from git (looks like a local artifact); add
  `research/` to `.gitignore` if it's scratch. Add `scripts/README.md`
  documenting the content-pipeline tools (wrap-bare-_, densify-_, audit-\*,
  validate-cross-references) and the content-authoring workflow.
- **How it's tested:** `git status` clean; links in README resolve.
- **Commit:** `docs: document scripts + clean repo artifacts`

---

## Execution order & rollback

1. Phase 0 (measure) → 1 (green baseline) → 2 (tests) → 3 (validator). **These
   four are the foundation; do them strictly in order.**
2. Phases 4–8 can then proceed in roughly any order; recommended 4 → 7 (perf
   together) → 5 → 6 (component + a11y together) → 8 (hygiene last).
3. Every task is a single focused commit on a feature branch with its own
   verification. If a phase's verification fails, revert that commit — no phase
   depends on a later one.

## Definition of done (per task)

- `npm run check` → 0 errors
- `npm run lint` → 0 errors
- `npm run test` (unit + e2e) → green
- For perf tasks: measured before/after recorded in `docs/baselines/`
- For refactors: screenshot-diff identical
- CI green on the PR
