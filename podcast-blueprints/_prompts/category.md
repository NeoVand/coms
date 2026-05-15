# Synthesis prompt — CATEGORY blueprint

You are writing **one podcast blueprint** about a single category in our
protocol-graph encyclopedia (Network Foundations, Transport, Web/API,
Async/IoT, Real-time A/V, Wireless, or Utilities & Security). The
blueprint will be fed to NotebookLM, which will turn it into a ~25-30
minute conversational audio episode with two AI hosts. A human listener
will hear it in a web app while looking at the category's page in the
graph view, and may click out to other episodes mid-listen.

The full source material for this category is attached as a
`_raw/categories/<id>.txt` dump. **Treat that dump as your only source
of facts.** The dump is the lossless concatenation of the canonical
TypeScript category record, the category-story narrative (pioneers,
timeline, callouts), the category-deep-dive entries (advanced topics
specific to the category), the deep-research markdown (May 2026), and
one-liners for every protocol in the category.

Cross-references in the dump look like
`Term [protocol: TCP (Transmission Control Protocol)]` —
when you see them, render them as natural-language pointers in your
output ("…which we cover in the TCP episode"), never as `[[bracket]]`
syntax.

---

## Audience and tone

- Smart software engineers. Some seasoned, some new.
- The episode will be heard, not read. Sentences must work as speech.
- **Concrete over abstract. Numbers over adjectives. Names over generics.**
- Past tense for history, present tense for mechanism, future tense only
  for dated drafts. Active voice. Short sentences.
- Do not invent facts. If the dump does not contain something you wish
  you could say, omit the section rather than fabricate.

## What a category episode is

Each protocol in the category gets its own episode. Each book chapter
gets its own episode. The category episode is the **bridge**:

- It sets the scene — what problem this whole family of protocols solves.
- It introduces the pioneers — the people who shaped the category.
- It walks the listener through the protocols at one paragraph each,
  pointing them at the per-protocol episode for the deep dive.
- It covers the **advanced topics** that don't fit any single protocol's
  page (VLANs and spanning tree under Network Foundations, ARP security,
  email-stack TLS interactions under Utilities, etc.).
- It names the recurring themes the category teaches.

Defer mechanism details to per-protocol episodes by name. Defer the
historical narrative arcs to the matching book chapters by name.

## How to render cross-references

The dump renders refs as `Term [protocol: TCP (Transmission Control
Protocol)]`. In your output, drop the bracket form and use one of:

- *"the TCP episode"* / *"the QUIC episode"* — for protocol cross-refs
- *"the chapter on the OSI vs TCP/IP war"* — for cross-chapter pointers
- *"Vint Cerf — there's a separate episode on him"* — for pioneer cross-refs
- *"RFC 9293, the current TCP standard"* — for RFC refs (numbers in spoken form)
- *"the L4S launch entry on the Frontier page"* — for frontier
- The cross-reference must read naturally aloud.

## Template — output exactly this structure

````markdown
---
id: <category-id>
type: category
name: <full name, e.g. "Transport">
description: <one-line description from the dump>
podcast_target_minutes: <pick one: 22, 25, 28, 30 — based on density>
protocols: [<id>, ...]                        # in the order they should be toured
related_pioneers: [<id>, ...]
related_book_chapters: [<part-id>/<chapter-id>, ...]
related_outages: [<id>, ...]
related_frontier: [<id>, ...]
images:
  - { src: "<url>", caption: "<plain-text caption>", credit: "<credit>" }
visual_cues:
  - "<one-line prompt for an original infographic>"
  - "<another>"
---

# <Category Name>

## In one breath
2–4 sentences. What this category covers and why anyone running software
on the internet should care. Distilled from the category description and
tagline.

## The pitch (cold-open)
3–4 sentences the host could narrate at the top of the episode. Sets
stakes, names the big idea, hints at the surprise.

## The arc
The narrative backbone of the category, modernised for audio. Walk the
listener through the category-story sections in order — the timeline,
the pioneers, the founding decisions. Use subsection headings that match
the source's section titles where they exist (the chapter authors
already chose them and they should be preserved as the episode's act
structure).

When the arc touches a specific protocol's mechanism, defer to that
protocol's episode by name and don't re-explain. When it touches a
historical inflection that has its own book chapter, point to the
chapter episode.

## The people
Inline expansion of every pioneer the dump references. One short
paragraph each — who they were, what they shipped, why they belong in
this category. Defer the full bio to that pioneer's own episode by name.

### <Pioneer name>
[paragraph]

(Include only pioneers actually in the dump.)

## The protocols (a guided tour)
The heart of the category episode. Walk through every protocol in the
category in the order the source lists them. One paragraph per protocol:
what it is, what problem it solves, why it sits in this category, and a
pointer to its episode for the mechanism story.

### <Protocol abbreviation> — <full name>
[one paragraph]

## Advanced topics (from the deep-dive)
The category-deep-dive sections cover practitioner topics that don't
belong on any single protocol's page. Translate each section to one
prose paragraph or two — VLANs, spanning tree, ARP security, the email
TLS interlock, whatever the category contains. If the dump has no
deep-dive sections, omit this whole block.

### <Topic title>
[paragraph]

## Recurring themes
2–4 paragraphs naming the patterns the category teaches that show up
elsewhere. (Network Foundations: addressing-and-routing layering as a
universal pattern. Transport: the reliability/speed tradeoff. Web/API:
text-on-the-wire vs binary framing. Etc.) Pull from the dump's deep
research where it surfaces them; do not invent.

## Where this connects in the book
Bulleted list of chapter episodes that cover this category's history,
context, or arc. Each line ~one sentence describing what that chapter
adds.

## See also (other category episodes)
2–3 short cross-promo paragraphs to neighbouring categories. *"The
Transport episode is the layer below this one — TCP and UDP are what
HTTP rides on."* / *"The Real-time A/V episode is the high-level cousin
of this one — RTP and SIP solve a related problem with different
constraints."*

## Visual cues for image generation
4–7 specific prompt lines for original infographics. Concrete. Each line
should describe one image — colours, what is in frame, what is being
explained. The category episode is a good place for "the whole family at
one glance" visuals.

## Sources
Deduplicated URLs grouped under: RFCs, papers, vendor / engineering
blogs, news, wikipedia. Markdown links with the source label as the
link text.
````

## Final checks before you submit

1. No `[[…]]` or `{{…}}` left anywhere — every cross-reference is natural language.
2. No invented facts. Every concrete claim traces to the dump.
3. Sentences read aloud cleanly. Reread each section as if you were the host.
4. Numbers wherever the dump provides them. Dates wherever it provides them.
5. The protocol tour names every protocol in the category — none skipped.
6. Length total roughly proportional to `podcast_target_minutes` × 200 words/min.
   For 28 min, aim for ~5000–6000 words. Density matters more than wordcount.
