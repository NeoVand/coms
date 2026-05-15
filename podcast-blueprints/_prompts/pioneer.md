# Synthesis prompt — PIONEER blueprint

You are writing **one podcast blueprint** about a single networking
pioneer — one of the people whose protocols, papers, or sustained
engineering work shaped the internet. The blueprint will be fed to
NotebookLM, which will turn it into a ~8-12 minute biographical
conversational audio episode with two AI hosts. A human listener will
hear it in a web app while reading the pioneer's profile, and may click
out to other episodes mid-listen.

The full source material for this pioneer is attached as a
`_raw/pioneers/<id>.txt` dump. **Treat that dump as your only source of
facts.** The dump is the lossless concatenation of: the canonical
TypeScript pioneer record (contribution paragraphs, awards, quotes,
links, the protocols they shaped), and the list of book chapters that
reference them with chapter context.

Cross-references in the dump look like
`Term [protocol: TCP (Transmission Control Protocol)]` —
when you see them, render them as natural-language pointers in your
output ("…the protocol we cover in the TCP episode"), never as
`[[bracket]]` syntax.

---

## Audience and tone

- Smart software engineers. Some seasoned, some new.
- The episode will be heard, not read. Sentences must work as speech.
- **Concrete over abstract. Numbers over adjectives. Names over generics.**
- Past tense for history (most of a pioneer episode), present tense only
  for things they're still actively doing. Active voice. Short sentences.
- Do not invent facts. If the dump does not say where they grew up or
  what year they graduated, do not guess. Pioneer episodes are biography;
  invented biography is the most damaging kind of fabrication.

## What a pioneer episode is

This is **biography** — who they are, what they shipped, why it
mattered. It is not a deep dive on the protocols themselves. Each
protocol they touched has its own episode; defer the mechanism story.
Each book chapter they appear in has its own episode; defer the
narrative arc.

The pioneer episode is the place to make the listener care about the
person — the moment of insight, the production they shipped, the second
or third act of their career, the awards that recognised them.

If the dump's contribution paragraphs are thin, the episode should be
short. Do not pad. A 6-minute crisp episode beats a 12-minute padded one.

## How to render cross-references

The dump renders refs as `Term [protocol: TCP (Transmission Control
Protocol)]`. In your output, drop the bracket form and use one of:

- *"the TCP episode"* — for protocol cross-refs
- *"the chapter on the 1986 Congestion Collapse"* — for cross-chapter pointers
- *"Bob Kahn — there's a separate episode on him"* — for other-pioneer cross-refs
- *"RFC 9293, the current TCP standard"* — for RFC refs (numbers in spoken form)
- *"the L4S launch entry on the Frontier page"* — for frontier
- The cross-reference must read naturally aloud.

## Template — output exactly this structure

````markdown
---
id: <pioneer-id>
type: pioneer
name: <full name>
years: <e.g. "1943–" or "1943–2024">
title: <e.g. "Co-inventor of TCP/IP">
org: <primary affiliation, comma-separated if multiple>
podcast_target_minutes: <pick one: 6, 8, 10, 12 — based on density>
protocols: [<id>, ...]                       # protocols they shaped
categories: [<id>, ...]
related_book_chapters: [<part-id>/<chapter-id>, ...]
awards:
  - { name: "<award name>", year: <year or null>, url: "<optional>" }
image:
  src: <image url from dump or null>
  alt: <alt text>
  credit: <credit string>
visual_cues:
  - "<one-line prompt for an original infographic / portrait composition>"
  - "<another>"
---

# <Name>

## In one sentence
The single sentence to introduce them by. Not "X was a network pioneer"
— the *specific* one-sentence reason they have an episode. *"Van
Jacobson is the engineer who shipped the six algorithms that stopped
the internet from collapsing in 1988, and then thirty years later
shipped its replacement at Google."*

## The hook (cold-open)
3–4 sentences the host could narrate at the top of the episode. The
single most arresting fact about them — usually a moment, a paper, or a
machine they built. Sets stakes.

## The work
The narrative spine of the episode. Walk through their contributions in
chronological order, modernised for audio. Use natural subsection
headings keyed to the major works.

For each major contribution, name the year, the venue (paper, RFC,
conference, deployment), and one sentence on *what changed because of
it*. The interesting fact is rarely the protocol; it is the production
or the field that came after.

When the work touches a specific protocol's mechanism, defer to that
protocol's episode by name and don't re-explain. When it touches a
historical inflection that has its own book chapter, point to the
chapter episode.

### <Subsection — major work or career era>
[paragraphs]

## Awards and recognition
A short paragraph naming the major awards, with years. Turing, IEEE
medals, Internet Hall of Fame, ACM SIGCOMM Award, presidential medals,
elected academies. Skip if the dump has no awards. Don't pad.

## Quotes
If the dump has a `quotes` section, expand each quote with one sentence
of context — when they said it, why it travelled. If the dump has no
quotes, omit this section.

## Where they appear in the book
Bulleted list of chapter episodes that mention them. Each line ~one
sentence: *"Part II Chapter 'The 1986 Congestion Collapse' — the
six-algorithm fix is the centrepiece."* Pull from the dump's
`related_chapters` list.

## See also (other pioneer episodes)
2–4 short cross-promo paragraphs to other pioneers in their orbit.
*"Van Jacobson's congestion-control work was the response to a problem
that Vint Cerf and Bob Kahn had set up fifteen years earlier — see the
Cerf and Kahn episodes for the founding context."* If the dump doesn't
imply obvious cross-promos, list 2–3 from the same protocol or category.

## Visual cues for image generation
3–5 specific prompt lines. For pioneers, lean on portrait composition,
the era they worked in, and signature artifacts (the IMP for Cerf/Kahn,
a NeXTcube for Berners-Lee, a chalkboard with slow-start equations for
Jacobson, etc.). Concrete.

## Sources
Deduplicated URLs grouped under: papers, wikipedia, awards pages,
homepage, video / lectures. Markdown links with the source label as the
link text.
````

## Final checks before you submit

1. No `[[…]]` or `{{…}}` left anywhere — every cross-reference is natural language.
2. No invented biography. If the dump doesn't say it, you don't say it.
3. Sentences read aloud cleanly.
4. Years and dates wherever the dump provides them.
5. Protocols and chapters where they show up are all named.
6. Length matches density. A pioneer with two paragraphs of contribution
   and three awards gets a 6-minute episode, not 12.
