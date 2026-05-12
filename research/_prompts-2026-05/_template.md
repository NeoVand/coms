# Deep Research Prompt — TEMPLATE v2 (2026-05)

This template is the master used to generate the 16 protocol prompts in this directory.
Differences from the v1 prompt (deep-research-prompts.txt, May 2025):

- Today's date updated to 2026-05-12 with tightened currency demand
- Adds a "Where this fits in the encyclopedia" section listing the 47 already-covered protocols
- Adds a mandatory deliverables checklist (minimum counts on deployments, pioneers, facts, etc.)
- Adds explicit anti-fabrication AND anti-`[needs source]` instructions
  (try ≥3 search variations including academic indices and archive.org before flagging)
- Adds Appendix A — Encyclopedia-ready structured-data extracts in TypeScript-fittable bullets
  (so prose flows directly into src/lib/data/protocols/{id}.ts without hand-translation)
- Adds Appendix B — Simulator step list (6–10 hand-authored simulation steps with layer fields,
  the most expensive authoring surface in this repo)
- Adds bundling-protocol handling (for STUN/TURN/ICE, DKIM/SPF/DMARC, Matter+Thread)

---

# Prompt body (paste below the protocol header into Claude.ai Research)

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, RFCs, books,
engineering blog posts, conference talks, and podcasts on this topic, all
distilled into one document. Surface-level "what is X" content already exists
everywhere — what I need from you is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — who, when, why, what they were trying to fix.
- Mechanics deep enough that someone could re-implement a minimal version of
  the thing after reading the report.
- Real failures and famous outages, named, with the dramatic detail.
- Connections to other protocols that aren't in the obvious list.
- 2024–2026 developments — what's actively changing right now and how
  practice has shifted in the last 24 months.
- Resources someone could actually go learn from today, with the year each
  one was last updated.

**Today's date is 2026-05-12.** Prefer sources from 2024–2026 and explicitly
call out anything that has changed in the last 24 months. Treat older sources
as suspect and verify them against the current state. Define every term you
use — assume the reader is smart but new to this area.

**Sourcing discipline.** Cite every factual claim with a verifiable URL or DOI.
Do not fabricate citations. If a claim has no real source, mark it
`[needs source]` — but before doing that, attempt at least three search
variations including academic indices (Google Scholar, IEEE Xplore, ACM DL,
USENIX), archive.org for older or dead links, and the relevant standards body
(IETF datatracker, IEEE-SA, 3GPP, ITU, Bluetooth SIG, etc.). Past passes have
left 121 `[needs source]` markers across 46 reports — please try harder this
round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. **Your report should explain how the topic relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:**

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard, OSPF,
mDNS/DNS-SD, Kerberos, OpenID Connect, ACME, email-auth (DKIM/SPF/DMARC),
SAML, LDAP, SNMP, Matter+Thread, DTLS, PTP.

# Topic

{{TOPIC PARAGRAPH — see per-protocol prompts}}

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
- [ ] **≥4** dated entries on the history timeline (origin → most recent)
- [ ] A full header / message-format layout with bit widths
- [ ] A state machine (mermaid `stateDiagram-v2`)
- [ ] A sequence diagram of the main exchange (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale numbers, and dates
- [ ] **≥3** pioneer / key-contributor candidates with full bios (name, years, org, contribution, awards, links)
- [ ] **≥3** RFCs (or equivalent specs) with number, year, status, and notable-section pointers
- [ ] **≥2** named failure incidents with year, org, root cause, and citation (CVE numbers where applicable)
- [ ] **≥3** fun facts / anecdotes with sources
- [ ] **≥3** practical pitfalls with concrete tuning advice (sysctls, defaults, tools, debugging moves)
- [ ] **≥3** Wireshark / capture-tool filter examples
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
- [ ] **≥1** 2025–2026 frontier development (active draft, deployment, or research direction)
- [ ] **≥3** history-arc story sections beyond the prose overview (narrative/timeline/callout/image mix)
- [ ] **Prerequisites** — list of concept IDs and protocol IDs the reader should know first
- [ ] **Name-highlight** — bracketed-letter form for the UI
- [ ] **Diagram-definitions entry** — annotated sequence diagram with 8–15 per-step educational notes
- [ ] **Category placement** — which of the 6 categories fits, or proposal for a new one
- [ ] **Embedded media** (`media`) — 2–4 highest-signal videos/podcasts/playgrounds (separate from `learnMore`)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts (see end)
- [ ] **Appendix B** — Simulator step list (see end)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* the topic makes sense. For
each: a one- or two-sentence definition and a link to a clear authoritative
explainer. Cover the relevant layers of the OSI / TCP-IP stack, encoding
schemes, cryptographic primitives if any, and any subfield-specific
vocabulary. Don't assume familiarity with terms like socket, header, checksum,
handshake, stream, frame, datagram — define everything that appears later.

## History and story

Origin, motivation, the people who created it, the milestones in its
development, the version history (RFC versions or spec versions and what
changed between them), the politics or controversies around adoption, the
design alternatives that didn't win and why. Tell the actual narrative — name
names, give years, describe the rooms where the decisions were made. Where
did the original work happen — universities, labs, companies, IETF / IEEE /
3GPP working groups? Who funded it? What drove the timing? If anything has
fundamentally changed in the last 24 months — a draft reaching RFC status,
an old spec being obsoleted, a new version shipping, a major implementation
being deprecated — call it out explicitly here.

## How it actually works

Packet or message format, state machine, full handshake or exchange flow,
encoding rules, **every header field with bit width and what each one does**,
security model, error handling, edge cases. Include real on-the-wire byte
sequences where they are illustrative. Aim for the depth at which someone
could implement a minimal version after reading this section.

Provide **three** diagrams in mermaid-compatible text:
1. A sequence diagram of the main message flow (`sequenceDiagram`)
2. A state diagram of the connection / session lifecycle (`stateDiagram-v2`)
3. A header / PDU layout as either a table with bit offsets, or
   `packet-beta` mermaid if appropriate

## Deep connections to other protocols

For each related protocol listed in the topic section, write a paragraph on
the precise relationship — does it run on top of it, replace it, complement
it, depend on it, supersede part of it, share design DNA with it? Then
proactively name any related protocols missed from the list and explain
those too. Treat the supplied list as a starting point, not as complete.
Be explicit about where this protocol sits in the OSI / TCP-IP stack
relative to its neighbours.

## Real-world deployment

Major implementations — named libraries, named reference servers, named
production systems. Who uses this protocol at scale, the deployment
topologies they use, performance characteristics with real numbers
(latency, throughput, scale limits, memory footprint) where they have been
measured and published. **Minimum 5 named deployments with metrics.**

## Failure modes and famous incidents

Bugs, CVEs (with CVE numbers), real-world outages this protocol caused or
contributed to, common pitfalls that show up in production. Name each
incident: year, the organisation involved, what happened, root cause.
Tell each as a clean sequence: setup → mistake → consequence → resolution.

## Fun facts and anecdotes

Naming origins, design rejections, easter eggs, personal stories from the
people involved, weird historical accidents, RFC April Fools' jokes if
relevant, "why does it work this way" answers that have a story behind
them. Give specific quotable beats with sources — material that would
work in a podcast.

## Practical wisdom

What an engineer actually needs to know to use this protocol well —
tuning parameters (sysctls, registry keys, environment variables),
defaults to be skeptical of, what to monitor, what to look for in
production traces, common debugging moves, common misconfigurations.
Include **at least 3 Wireshark/tcpdump/equivalent capture filter examples**
with what each one is good for.

## Pioneers and key contributors

For each notable person who shaped the protocol: name, birth (–death) years,
primary affiliation, what they contributed (1–2 paragraphs), notable awards,
quotable lines (with sources), Wikipedia URL. Minimum 3 candidates.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated or
published. Highlight any resource that is current as of 2024–2026. Cover:

- Authoritative specifications — RFCs (with section pointers for the
  important parts), W3C / IETF / IEEE / ISO / 3GPP / Bluetooth-SIG drafts.
- Books, with chapter pointers if a single chapter is the gold standard.
- Academic papers (DOI or stable URL).
- Long-form engineering blog posts (Cloudflare, Google Research, AWS,
  Stripe, Discord, Netflix, Meta, Apple, Microsoft, etc.).
- YouTube videos and channels — specific videos by title and creator
  (conference talks, university lectures, well-known explainers).
- Podcasts and specific episodes.
- Free university courses with course numbers and lecture URLs
  (Stanford, MIT OCW, Princeton, Berkeley, CMU, etc.).
- Hands-on tools — visualizers, packet simulators, interactive
  playgrounds, sandbox environments.

## Where things are heading (2025–2026 frontier)

What is actively being deprecated, what is replacing it, what research
direction is hot, where standards work is heading. Are there drafts under
discussion right now? What is the relevant working group focused on?
What are the headline metrics (adoption %, deployment scale, performance
gains)?

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook: the one beat that gets a non-expert to
  listen, written for the ear.
- A striking statistic that captures importance, with source.
- A "pause and think" moment: a fact that should make even a
  knowledgeable reader stop and reconsider, with source.
- A failure-story arc: a real incident retold as a clean dramatic
  sequence — setup, mistake, consequence, resolution.

---

# Appendix A — Encyclopedia-ready structured-data extracts

This is the most important section for downstream productivity. Provide the
following bullets in exactly these shapes — they will be transcribed into
TypeScript records for the encyclopedia. Keep prose tight: a few sentences
per item, not paragraphs.

### A.1 Protocol record candidate

> **Note.** These Appendix-A blocks are transcribed directly into TypeScript
> records (see `src/lib/data/types.ts` `Protocol` interface in the repo). Keep
> field names exactly as shown, use plain strings (not YAML `>`/`|` block
> scalars where the encyclopedia stores a flat string), and reuse the existing
> protocol IDs listed in the "Where this fits" section for `connections`,
> `prerequisites.protocols`, and any cross-references. If a category doesn't
> fit, propose a new one in A.23 and use that ID here.

```
id: <kebab-case>
name: <full official name>
abbreviation: <ABBR>
categoryId: <network-foundations | transport | web-api | async-iot | realtime-av | utilities-security | new-category-id-proposed-in-A.23>
port: <number or "none">
year: <first standardised year>
rfc: <"RFC NNNN" or canonical-spec id>
standardsBody: <ietf | ieee | w3c | iso | itu | industry-consortium | de-facto>
oneLiner: <single sentence — the elevator pitch>
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description } pairs
useCases: 5–7 bullet items
performance: { latency, throughput, overhead }
connections: <list of existing protocol IDs this depends on / interacts with>
links: { wikipedia, rfc, official }
image: { src, alt, caption, credit }  ← prefer Wikimedia Commons URLs
```

### A.2 Header / wire-format layout

```
headerLayout:
  title: <header name>
  rowBits: <usually 32 or 8>
  fields:
    - { name, bits, description, note?, optional? }
  notes: [...]
```

### A.3 State machine

```
stateMachine:
  title: ...
  mermaid: |
    stateDiagram-v2
      ...
  states:
    - { id, name, description, transitions: [{ event, target }] }
```

### A.4 Code example

A minimal working example in **3 languages + a wire-format dump**:
- `python` — most idiomatic single-file example
- `javascript` — Node.js or browser equivalent
- `cli` — common terminal commands (nc, openssl, curl, dig, hcitool, etc.)
- `wire` — sectioned wire-format dump (e.g., "Handshake", "Data", "Close")

### A.5 Recent changes (dated, 2024–2026)

```
- { date: YYYY-MM, title, description, source: { url, label } }
```
Minimum 5 entries.

### A.6 Real-world deployments

```
- { org, scale, description, date?, source? }
```
Minimum 5 entries.

### A.7 Fun facts

```
- { title, text, source? }
```
Minimum 3 entries.

### A.8 Practical wisdom

```
practicalWisdom:
  sysctls: [{ key, defaultValue, recommendation, description }]
  pitfalls: [{ title, text }]
  tools: [{ name, url, description }]
  notes: [{ title, text }]
```

### A.9 Wireshark / capture hints

```
- { filter, description, exampleOutput? }
```
Minimum 3 entries.

### A.10 Learn-more lists

```
learnMore:
  rfcs:    [{ number, title, sections: [...] }]
  books:   [{ title, authors, edition?, year, chapters?, url? }]
  papers:  [{ title, authors, venue, year, url, doi? }]
  posts:   [{ title, author, site, year, url }]
  videos:  [{ title, speaker, venue, year, url }]
  courses: [{ title, institution, code, year, url }]
  podcasts:[{ title, show, year, url }]
  tools:   [{ name, description, url }]
```

### A.11 Pioneer candidates

```
- id: <kebab-case>
  name: ...
  years: "YYYY–" or "YYYY–YYYY"
  title: ...
  org: ...
  contribution: <1–2 paragraphs>
  imagePath: <Wikimedia URL>
  protocols: [...]
  awards: [{ name, year, url? }]
  links: { wikipedia, homepage }
  quotes: [{ text, source: { url, label } }]
```

### A.12 RFC / standard records

```
- number: ...
  title: ...
  year: ...
  authors: ...
  status: <internet-standard | proposed-standard | informational | experimental | historic | draft | best-current-practice>
  obsoletes: [...]
  obsoletedBy: [...]
  url: ...
  abstract: <1–3 paragraphs of plain-English explanation>
  notableSections: [{ ref, description }]
```

### A.13 New glossary concepts

For any term in your prerequisites/glossary section that doesn't already
exist in the encyclopedia, give:

```
- id: <kebab-case>
  term: ...
  definition: ...
  analogy: ...
  wikiUrl: ...
  category: <networking-basics | protocol-mechanics | security | web | messaging | infrastructure>
```

### A.14 Frontier entry (if applicable)

```
- title: ...
  oneLiner: ...
  topic: <security | transport | wireless | web | datacenter | observability | ai-agents | standards | iot | realtime-av>
  status: <shipped | rolling-out | standardizing | experimental>
  date: ...
  description: <2–3 paragraphs>
  metrics: [{ label, value, date?, source? }]
  sources: [{ url, label }]
```

### A.15 Journey suggestion

A multi-protocol narrative this protocol fits into. Format:

```
title: ...
description: ...
scope: <global | category-id>
steps:
  - { protocolId, title, description, transition? }
```

### A.16 Comparison pair

One or two "X vs Y" framings worth a comparison card on the encyclopedia.

### A.17 History arc — long-form story sections

The encyclopedia renders a multi-section history beyond the `overview`
field, using a `StorySection[]` union. Provide 3–6 sections in this shape:

```
- { type: "narrative", title?, text }
- { type: "timeline", entries: [{ year, title, description }] }
- { type: "pioneers", title?, people: [...] }
- { type: "callout", title, text }
- { type: "diagram", title?, definition (mermaid), caption }
- { type: "image", src, alt, caption?, credit?, title? }
```

Mix the types — start with a narrative, drop a timeline, callout an
inflection moment, embed an image of the inventor or a key device.

### A.18 Famous-incident references + new outage proposals

The encyclopedia has an outages registry. Two parts:

1. **References to existing outages** (already in the app):
   `facebook-2021`, `cloudflare-2019-regex`, etc. — propose any that
   this protocol played a role in, with a short `role` description.
2. **New outage proposals** in this shape (if applicable):

```
- id: <kebab-case>
  title: ...
  date: YYYY-MM-DD
  duration: <human-readable>
  scale: <scope>
  oneLiner: ...
  category: <configuration | security | software-bug | hardware | protocol-design | human-error | capacity>
  affectedProtocols: [...]
  cast: [{ name, role }]
  setup: <how it was supposed to work>
  mistake: <what went wrong>
  cascade: [{ time, title, description, protocols, color? }]
  consequence: ...
  resolution: ...
  lesson: ...
  sources: [{ url, label }]
  image?: { src, alt, caption, credit }
```

### A.19 Embedded media (different from learnMore)

`media` carries items embedded directly into the protocol page rather
than recommended further reading. Provide 2–4 of the highest-signal
items:

```
media:
  videos:     [{ title, url, duration, thumb? }]
  podcasts:   [{ title, url, episode? }]
  playgrounds:[{ name, url, description? }]
```

### A.20 Prerequisites

What a reader should understand before tackling this protocol:

```
prerequisites:
  concepts:  [<concept-id>, ...]    ← from the existing concepts.ts
  protocols: [<protocol-id>, ...]   ← from the 47 already-covered list
```

### A.21 Name highlight (UI affordance)

The encyclopedia renders the full name with abbreviation letters bracketed.
Provide one line in the form:

```
"[T]ransmission [C]ontrol [P]rotocol"
"[B]luetooth [L]ow [E]nergy"
```

### A.22 Diagram-definitions entry (animated sequence diagram with annotations)

Separate from the three mermaid diagrams in "How it actually works", the
encyclopedia animates a per-protocol sequence diagram with caption +
per-step educational text:

```
definition: |
  sequenceDiagram
    participant C as Central
    ...
caption: <markdown legend; use **bold** to highlight key tokens in protocol color>
steps:
  0: <educational text explaining what the reader is seeing at this beat>
  1: <next step ...>
  ...
```

Provide 8–15 step annotations. The narrative voice should be "what the
reader sees right now, and why it matters" — not just "this is a SYN".

### A.23 Category placement

The encyclopedia has 6 categories: `network-foundations`, `transport`,
`web-api`, `async-iot`, `realtime-av`, `utilities-security`. State which
fits best — and if none do, propose a new category in this shape:

```
- id: <kebab-case>
  name: ...
  color: <hex>
  glowColor: <hex>
  description: <one sentence>
  icon: <lucide icon name>
```

Likely candidates we expect a new category for: a wireless/PAN category
(Bluetooth, BLE, NFC, UWB, Matter+Thread), an identity category
(OAuth2 + OIDC + SAML + Kerberos + LDAP), or VPN/tunneling (IPsec +
WireGuard).

---

# Appendix B — Simulator step list

The encyclopedia animates each protocol as a step-by-step packet exchange.
Provide a **6–10 step** simulation in the following shape. Each step is one
on-the-wire message (or local event) with the relevant layer stack and
which fields the UI should highlight.

```
title: <e.g., "BLE GATT Read">
description: <one sentence>
actors:
  - { id: "central", label: "Central (Phone)", position: "left" }
  - { id: "peripheral", label: "Peripheral (Sensor)", position: "right" }
userInputs: <optional interactive controls, e.g., MAC address, MTU>
steps:
  - id: step1
    label: <e.g., "Advertising">
    description: <what happens>
    fromActor: peripheral
    toActor: central
    duration: 1200
    highlight: <field names to flash>
    data: <optional payload snippet>
    layers:
      - <layer name>: { field: value, field: value }
      - <next layer up>: { ... }
```

The layers should reflect the actual protocol stack — e.g., for BLE,
PHY → Link Layer → L2CAP → ATT → GATT.

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.
