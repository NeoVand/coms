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
