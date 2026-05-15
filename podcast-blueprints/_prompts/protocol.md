# Synthesis prompt — PROTOCOL blueprint

You are writing **one podcast blueprint** about a single network protocol. The
blueprint will be fed to NotebookLM, which will turn it into a ~15-25 minute
conversational audio episode with two AI hosts. A human listener will hear it
in a web app while looking at the protocol's page in our protocol-graph
encyclopedia, and may click out to other episodes mid-listen.

The full source material for this protocol is attached as a `_raw/<id>.txt`
dump. **Treat that dump as your only source of facts.** The dump is the
lossless concatenation of: the canonical TypeScript record, the deep-research
markdown (May 2026), the simulator transcript, all comparison cards, every
referenced pioneer/outage/frontier entry/RFC, and the book chapters that
mention this protocol. Cross-references in the dump look like
`Term [protocol: TCP (Transmission Control Protocol)]` —
when you see them, render them as natural-language pointers in your output
("…which we cover in the TCP episode"), never as `[[bracket]]` syntax.

---

## Audience and tone

- Smart software engineers. Some are seasoned network folks; some have never
  read an RFC. Both should follow without effort.
- The episode will be heard, not read. Sentences must work as speech.
- **Concrete over abstract. Numbers over adjectives. Names over generics.**
  *"Comcast launched L4S in six US metros in January 2025"* beats *"L4S is
  being deployed in production."*
- Past tense for history, present tense for mechanism, future tense only for
  dated drafts. Active voice. Short sentences. No "ensures that", "is
  responsible for", "plays a critical role", or other padding.
- Do not invent facts. If the dump does not contain something you wish you
  could say, omit the section rather than fabricate.

## The Option-2 split (read this carefully)

The book chapters in our app are the **primary vehicle for historical and
contextual narrative**. The protocol blueprint is the **mechanism +
production + practitioner** episode. Where this protocol shows up in a
chapter (the dump lists every such chapter under "BOOK CHAPTERS" / "related
chapters"), defer the storytelling to the chapter episode by name and keep
the protocol blueprint focused on:

- how it works on the wire,
- where it actually runs in production (named orgs, real numbers),
- what breaks, what to debug,
- what is changing in 2024–2026.

Your cold-open hook can include one historical beat — the rest belongs to
the chapter episodes. Always cross-reference the chapter episode by its
title when you compress.

## How to render cross-references

The dump renders refs as `Term [protocol: TCP (Transmission Control
Protocol)]`. In your output, drop the bracket form completely and use one of:

- *"the TCP episode"* / *"the TCP page in the encyclopedia"* — for protocol cross-refs
- *"the chapter on the 1986 Congestion Collapse"* — for chapter cross-refs
- *"Van Jacobson — there's a separate episode on him"* — for pioneer cross-refs
- *"RFC 9293, the current TCP standard"* — for RFC refs (numbers in spoken form)
- *"the L4S launch entry on the Frontier page"* — for frontier
- The cross-reference must read naturally aloud.

## Template — output exactly this structure

````markdown
---
id: <protocol-id>
type: protocol
name: <full name>
abbreviation: <abbr>
etymology: <highlighted name from the dump, e.g. "[T]ransmission [C]ontrol [P]rotocol">
category: <category-id>
year: <year>
rfc: <primary rfc string or null>
standards_body: <standards body or null>
podcast_target_minutes: <pick one: 15, 18, 20, 22, 25 — based on density>
related_book_chapters: [<part-id>/<chapter-id>, ...]
related_protocols: [<id>, ...]
related_pioneers: [<id>, ...]
related_outages: [<id>, ...]
related_frontier: [<id>, ...]
related_rfcs: [<number>, ...]
related_journeys: [<id>, ...]   # only if listed in dump or obviously applicable
images:
  - { src: "<url>", caption: "<plain-text caption>", credit: "<credit>" }
visual_cues:
  - "<one-line prompt for an original infographic, e.g. 'Slow-start cwnd doubling on a logarithmic scale'>"
  - "<another>"
---

# <Title — usually "<Abbreviation> — <Full Name>">

## In one breath
One paragraph (2–4 sentences). What this protocol is and why anyone running
software on the internet should care. Distilled from one-liner + overview.

## The pitch (cold-open)
3–4 sentences the host could narrate at the top of the episode. Sets stakes,
hints at the surprise, names the big idea. ONE historical beat is allowed
here — pick the most arresting one.

## How it actually works
Plain-language walkthrough. The simulator step list in the dump is the
spine. Treat each step as a paragraph. Subsections:

### Header at a glance
What is in the header, why each field is there. Bullet form OK. No raw
diagrams — describe in words a host could read aloud.

### State machine in three sentences
Distilled from the dump's state-machine section. If there is no state
machine (e.g., a stateless protocol), say so explicitly and explain why.

### Reliability / flow / security mechanics
Whatever the dump emphasises about how the protocol stays correct and safe.
Slow start, AIMD, encryption, authentication, etc. — only what applies.

## Where it shows up in production
Named organisations, real numbers, dated. Each one a paragraph. Pull
directly from the dump's "Real-world deployments" section. If multiple
orgs use the same approach, group them.

## Things that go wrong
Every famous incident the dump references. Each one a self-contained
two-paragraph anecdote: what happened, what it taught the industry. If the
incident has its own chapter episode, name the chapter and compress.

## Common pitfalls (for the practitioner)
The dump's `practicalWisdom.pitfalls` and equivalent research-file material.
Plain language, problem→symptom→cure shape.

## Debugging it
Wireshark filters, key sysctls, CLI tools. From `wireshark` and
`practicalWisdom.sysctls` and `tools` in the dump. If the dump has none,
omit the section.

## What's changing in 2026
Recent-changes timeline + frontier entries. Ordered most-recent first. Each
entry ~2 sentences, dated, with the org or RFC number that landed it.

## Fun facts (host material)
Three to six. Each a single tight paragraph the host can drop in mid-episode.
Pull from `funFacts` in the dump — these are usually the best material the
authors have written.

## Where this connects in the book
Bulleted list of chapter episodes that cover this protocol's history,
context, or arc. Each line ~one sentence: *"Part II Chapter 'The 1986
Congestion Collapse' — the night TCP almost killed itself, and how Van
Jacobson saved it."* Pull from the dump's `related_chapters` list.

## See also (other protocol episodes)
The vs/relationship cards from the dump. Each one ~2-3 sentences. Frame as
cross-promo: *"If you've heard the UDP episode, the contrast is everything…"*

## Visual cues for image generation
3–6 specific prompt lines for original infographics. Concrete. Each line
should describe one image — colours, what is in frame, what is being
explained.

## Sources
Deduplicated URLs grouped under: RFCs, papers, vendor / engineering blogs,
news, wikipedia. Markdown links with the source label as the link text.
````

## Final checks before you submit

1. No `[[…]]` or `{{…}}` left anywhere — every cross-reference is natural language.
2. No invented facts. Every concrete claim traces to the dump.
3. Sentences read aloud cleanly. Reread each section as if you were the host.
4. Numbers wherever the dump provides them. Dates wherever it provides them.
5. The "Where this connects in the book" section names every chapter episode
   in the dump that mentions this protocol — even if briefly.
6. Length total roughly proportional to `podcast_target_minutes` × 200 words/min.
   For 20 min, aim for ~3500–4500 words. Density matters more than wordcount.
