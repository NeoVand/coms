# Synthesis prompt — BOOK CHAPTER blueprint

You are writing **one podcast blueprint** about a single chapter of our book
*The Story of Networking*. The blueprint will be fed to NotebookLM, which
will turn it into a ~12-18 minute conversational audio episode with two AI
hosts. A human listener will hear it in a web app while reading the chapter,
and may click out to other episodes mid-listen.

The full source material for this chapter is attached as a `_raw/<…>.txt`
dump. **Treat that dump as your only source of facts.** The dump is the
lossless concatenation of: every prose / pull-quote / callout in the chapter,
the embedded protocol records, every embedded pioneer / outage / frontier /
RFC, and the chapter that comes before and after this one in the book.
Cross-references in the dump look like
`Term [protocol: TCP (Transmission Control Protocol)]` — render them as
natural-language pointers in your output ("…which we cover in the TCP
episode"), never as `[[bracket]]` syntax.

---

## Audience and tone

- Smart software engineers. Some seasoned, some new. Both should follow.
- The episode will be heard, not read. Sentences must work as speech.
- **Concrete over abstract. Numbers over adjectives. Names over generics.**
  *"In October 1986, throughput between LBL and UC Berkeley collapsed from 32
  kbps to 40 bps"* beats *"TCP suffered congestion problems."*
- Past tense for history, present tense for mechanism, future tense only for
  dated drafts. Active voice. Short sentences.
- Do not invent facts. If the dump does not contain something you wish you
  could say, omit it. The chapter's authors have already done the research.

## The Option-2 split (read this carefully)

This is a **chapter** episode. The chapter is the **primary vehicle for
historical and contextual narrative** — that is your job here. The protocol
blueprints are separate episodes that handle mechanism, production
deployment, and practitioner concerns. Your job is the story.

When the chapter touches a protocol mechanism in passing, **do not stop to
explain it in depth** — name it and tell the listener which protocol episode
covers it: *"how the three-way handshake actually works is the second half of
the TCP episode."*

Same applies to people, outages, and frontier entries — each has its own
episode (or will). Compress the encyclopedia stuff and let the chapter shine
on the storyline.

## How to render cross-references

The dump renders refs as `Term [protocol: TCP (Transmission Control
Protocol)]`. In your output, drop the bracket form and use one of:

- *"the TCP episode"* / *"the QUIC episode"* — for protocol cross-refs
- *"the chapter on the OSI vs TCP/IP war"* — for cross-chapter pointers
- *"Van Jacobson — the next episode is about him"* / *"see the Van Jacobson episode"* — for pioneer cross-refs
- *"RFC 9293, the current TCP standard"* — for RFC refs
- *"the L4S launch entry on the Frontier page"* — for frontier
- The cross-reference must read naturally aloud.

## Template — output exactly this structure

````markdown
---
id: <chapter-id>
type: chapter
part_id: <part-id>
part_label: <Roman numeral or letter, e.g. "II">
part_title: <full part title>
title: <chapter title>
synopsis: <one-line synopsis from dump>
podcast_target_minutes: <pick: 10, 12, 15, 18 — based on density>
position_in_book: <chapter N of 75>
listening_order:
  prev: <prev part-id/chapter-id or null>
  next: <next part-id/chapter-id or null>
related_protocols: [<id>, ...]
related_pioneers: [<id>, ...]
related_outages: [<id>, ...]
related_frontier: [<id>, ...]
related_rfcs: [<number>, ...]
images:
  - { src: "<url>", caption: "<plain-text caption>", credit: "<credit>" }
visual_cues:
  - "<one-line prompt for an original infographic>"
  - "<another>"
---

# Part <label>, Chapter — <Title>

## The hook
2–4 sentences the host opens with. Use the chapter's pull-quote where one
exists; otherwise distil the opening narrative section. Has to land cold —
no prior context.

## The story
The narrative spine of the episode. Walk through the chapter's prose
sections in order, modernized for audio. Use subsection headings that match
the chapter's section titles (they have already been chosen by the chapter
author and should be preserved as the episode's act structure).

When the chapter prose embeds `[[outage:foo]]` / `[[pioneer:bar]]` /
`[[rfc:N]]` references, render them as natural language and let the listener
know there's more to find: *"this is one of the incidents we cover in the
Famous Outages part of the book."*

When the chapter touches a protocol's mechanism, defer to that protocol's
episode by name and don't re-explain.

## The figures
Inline expansion of any pioneer / RFC / outage / frontier slot embedded in
the chapter. One short paragraph each:

### <Pioneer name>
Who they were, what they shipped, why they belong in this chapter. From the
embedded pioneer record in the dump.

### <Outage title>
What happened, in two sentences. Defer the full account to its own chapter
episode in Part X.

### <Frontier entry title>
What's shipping, in two sentences.

### RFC <N> — <Title>
What it specified, in two sentences. Year, status.

(Include only the slots actually present. If the chapter has no embedded
slot of a given kind, omit that subsection.)

## What you'd see in the simulator
Only if the chapter has a `simulation` slot. Narrate the simulator's step
list as a 4–8 sentence walkthrough so the podcast can describe what the
listener would see if they pressed play in the app. From the dump's
"simulation transcript" section.

## What it taught the industry
Many chapters now include a "What changed after this" / "What it taught the
industry" follow-up section. Preserve that framing — modernized prose, same
beats. If the chapter doesn't have one, omit this section.

## Listening order
Two short pointers:

- **Before this chapter:** *"<prev chapter title>" — one sentence on why it sets up this one.*
- **After this chapter:** *"<next chapter title>" — one sentence on what comes next.*

## Where to go deeper
Cross-promo to the protocol episodes that this chapter touches. Each line
~one sentence: *"The TCP episode picks up the mechanism story — slow start,
AIMD, fast retransmit."*

## Visual cues for image generation
3–5 specific prompts for original infographics tied to this chapter's beats.

## Sources
Deduplicated URLs from the chapter's embedded outage / pioneer / frontier /
RFC sources. Markdown links with the source label as the link text. If the
chapter has no source URLs (most chapters' authored prose doesn't),
omit the section.
````

## Final checks before you submit

1. No `[[…]]` or `{{…}}` left anywhere — every cross-reference is natural language.
2. No invented facts. Every concrete claim traces to the dump.
3. Sentences read aloud cleanly.
4. Numbers wherever the dump provides them. Dates wherever it provides them.
5. The story section preserves the chapter's section titles as act structure.
6. Mechanism details for protocols are deferred to those protocols' episodes
   by name, not re-explained.
7. Length total roughly proportional to `podcast_target_minutes` × 180 words/min
   (chapter episodes are slightly slower than protocol episodes — more story,
   less list). For 15 min, aim for ~2500–3000 words.
