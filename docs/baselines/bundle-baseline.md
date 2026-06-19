# Baseline metrics

- Commit: `afa4450` (branch `improvement-pass-1`, captured 2026-06-19)
- Build time: ~10.8s, `npm run build` green

## Client bundle (`build/_app/immutable`)

- **Total raw:** 6.5 MB
- **Total client JS gzipped (sum of all chunks):** **1973 KB (~1.93 MB)**

### Largest client JS chunks (hashes change per build; identity by content)

|     Raw |   Gzip | Contents                                                         |
| ------: | -----: | ---------------------------------------------------------------- |
| 1516 KB | 466 KB | protocol-prose + mermaid + hljs + driver.js (fused shared chunk) |
| 1016 KB | 352 KB | protocol-prose + hljs                                            |
|  584 KB | 211 KB | protocol-prose                                                   |
|  476 KB | 131 KB | mermaid + driver.js                                              |
|  444 KB | 105 KB | mermaid                                                          |

### Key problems confirmed

- `mermaid`, `hljs`, `driver.js`, and protocol prose are fused into the largest shared chunk → loaded eagerly on every page.
- `+layout.svelte` imports `allProtocols` (full registry) just for a count.
- `static/og-image.png` = **1.8 MB** (social card; should be <200 KB).

## Targets after Phase 4

- Largest single chunk < 500 KB raw.
- mermaid / hljs / driver.js split out and loaded on demand.
- Total client JS gzipped reduced meaningfully on cold first paint.

## Phase 4 result (measured on the prerendered `/`)

Method: parse `build/index.html` for its initial chunk set, sum raw+gzip, check
for vendor markers. The Vite build is non-deterministic (chunk hashes vary per
build), so all measurement must happen within a single build.

- **Initial JS on `/`: ~3488 KB raw, ~1171 KB gzip (23 chunks).**
- `highlight.js`: **now lazy** — CodeExample loads core + 8 grammars via dynamic
  `import()` on mount, so ~138 KB gz no longer ships on first paint (only when a
  code example renders). Verified: grammar code absent from the initial chunk
  set; highlighting still applies in-browser.
- `mermaid` and `driver.js`: confirmed lazy (dynamic `import()`); no static
  importer pulls them into the initial graph. (A "sequenceDiagram" string in an
  initial chunk is diagram-definition _content_, not the library.)

## Remaining opportunity (deferred — high blast radius)

Most of the 1171 KB gz initial load is hand-authored **prose** statically
imported via `buildGraphNodes()` (full `Protocol` objects), `concepts.ts`
(~416 KB raw), and `diagram-definitions.ts` (~140 KB raw). The graph only needs
protocol _metadata_ (id/name/category/connections), not the long-form fields.
Splitting `Protocol` into always-loaded metadata + lazily-loaded per-protocol
content would cut first paint substantially — but the content layer resolves
`[[id]]`/`{{concept}}` refs synchronously (text-parser, detail panels), so it's
a real refactor needing care, not a mechanical change. Left for a focused,
well-tested pass rather than this autonomous run.
