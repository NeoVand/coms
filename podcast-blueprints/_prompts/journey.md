# Synthesis prompt — JOURNEY blueprint

You are writing **one podcast blueprint** about a single *journey* — a
cross-cutting story that walks through several protocols in order to
explain what happens during a single user-visible event ("what happens
when you type a URL", "what happens when you tap to pay", "from wire to
web"). The blueprint will be fed to NotebookLM, which will turn it into
a ~12-18 minute conversational audio episode with two AI hosts. A human
listener will hear it in a web app while looking at the journey's
animated graph view, and may click out to other episodes mid-listen.

The full source material for this journey is attached as a
`_raw/journeys/<id>.txt` dump. **Treat that dump as your only source of
facts.** The dump is the lossless concatenation of: the journey's title
and description, every step in order with its protocol, its description
paragraph, and the transition prose to the next step, plus a one-liner
for every protocol referenced.

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
- Past tense for history, present tense for mechanism (most of a journey
  is mechanism narrated as it happens), future tense only when looking
  ahead. Active voice. Short sentences.
- Do not invent facts. The journey is a *narrated walkthrough* — every
  beat must come from the dump's step descriptions.

## What a journey episode is

A journey is the protocol-graph encyclopedia's answer to *"OK but show me
how all of this fits together when something real happens"*. The user
clicks Play and watches a sequence of nodes light up: DNS, then TCP,
then TLS, then HTTP — five protocols cooperating to load one web page.

The journey episode narrates that walkthrough. It is **not a deep dive
on each protocol** — each protocol has its own episode for that. It is
a guided tour that names what's happening, why it's happening, and
hands off to the next step.

The single most important constraint: keep moving. Each step gets a
focused paragraph, then a transition, then the next step. Do not stop
to explain how TCP's congestion controller works — the listener can
take the TCP episode for that. Tell them what TCP is *doing* in this
moment of this journey, and move on.

## How to render cross-references

The dump renders refs as `Term [protocol: TCP (Transmission Control
Protocol)]`. In your output, drop the bracket form and use one of:

- *"the TCP episode"* — for protocol cross-refs
- *"the chapter on the OSI vs TCP/IP war"* — for cross-chapter pointers
- *"Tim Berners-Lee — there's a separate episode on him"* — for pioneer cross-refs
- *"RFC 9293, the current TCP standard"* — for RFC refs (numbers in spoken form)
- The cross-reference must read naturally aloud.

## Template — output exactly this structure

````markdown
---
id: <journey-id>
type: journey
title: <full journey title>
scope: <"global" or category-id>
podcast_target_minutes: <pick one: 10, 12, 15, 18 — based on density>
step_count: <N>
protocols_in_order: [<id>, <id>, ...]            # the unique protocols touched, in step order
related_protocols: [<id>, ...]                   # all protocols touched, deduped
related_book_chapters: [<part-id>/<chapter-id>, ...]   # chapter episodes that pair well
visual_cues:
  - "<one-line prompt for an original infographic>"
  - "<another>"
---

# <Title>

## In one breath
2–3 sentences. What this journey demonstrates and why anyone should
care. Distil from the journey description in the dump.

## The hook (cold-open)
3–4 sentences the host could narrate at the top of the episode. Frame
the user-visible event ("you type google.com and hit enter; here is
what actually happens in the next half-second"). One concrete number if
the dump provides one.

## The journey
The narrative spine of the episode — every step in order, named, and
narrated.

### Step 1 — <step title> (<protocol abbreviation>)
One paragraph: what is happening at this step, why it has to happen
*here* in the order, what the protocol is doing in this moment. Pull
directly from the dump's step description, modernised for audio.

If the protocol has its own episode, end with a short pointer:
*"The full mechanism is in the TCP episode — here we just need to know
that the three-way handshake is what produces the round trip we're
about to spend."*

End the section with the dump's transition prose to the next step,
rephrased for audio. The transition is the bridge — it should leave
the listener understanding why the next step has to happen.

### Step 2 — <step title> (<protocol abbreviation>)
[same shape]

### …

(One subsection per step from the dump. Match the dump's order exactly.
Do not reorder.)

## What the listener now understands
A short closing paragraph or two that names what the journey demonstrated
as a single principle. ("This is the layered stack actually doing its
job — every protocol minds its own concern, and trusts the others to
mind theirs.") Pull from the journey's description if it has one;
otherwise distil from the steps.

## Where this connects in the book
Bulleted list of chapter episodes that pair well with this journey.
Each line ~one sentence on what that chapter adds to the same beats
the journey covered.

## See also (other journeys and protocol episodes)
2–4 short cross-promo paragraphs:

- 1–2 to neighbouring journeys (other walkthroughs that share protocols).
- 1–2 to the protocol episodes that this journey points the listener at.

## Visual cues for image generation
3–5 specific prompt lines. The journey's natural visual is the *graph
walkthrough* — nodes lighting up in sequence. Lean on:

- Sequence diagrams across N protocols
- Stacked-layer diagrams showing what each step adds
- Round-trip-time / wall-clock timelines for the whole journey
- Specific frames from the journey's animation (e.g. "DNS resolver
  walking the hierarchy: . → com → google.com")

## Sources
Most journeys have no source URLs in the dump (they are authored prose
referencing protocol episodes). If the dump has any URLs, list them
here. Otherwise omit this section.
````

## Final checks before you submit

1. No `[[…]]` or `{{…}}` left anywhere — every cross-reference is natural language.
2. No invented facts. Every concrete claim traces to the dump.
3. Sentences read aloud cleanly.
4. Steps are in the same order as the dump. Step count matches the dump.
5. Each step ends with a transition that prepares the listener for the
   next step.
6. The episode keeps moving — no stopping to teach a protocol's mechanism.
7. Length total roughly proportional to `podcast_target_minutes` × 190
   words/min. For 15 min, aim for ~2700–3200 words.
