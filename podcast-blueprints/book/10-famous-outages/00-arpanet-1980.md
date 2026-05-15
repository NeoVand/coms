---
id: famous-outages/arpanet-1980
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: ARPANET 1980 — The First Major Crash
synopsis: A garbled status message brings the network down.
podcast_target_minutes: 12
position_in_book: chapter 64 of 75
listening_order:
  prev: patterns-failures/congestion-history
  next: famous-outages/as-7007-1997
related_protocols: [bgp, tcp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [789, 9293, 7323]
images: []
visual_cues:
  - "A refrigerator-sized Honeywell DDP-516 IMP in a 1980 university machine room, labels and cables visible, captioned 'one of a few hundred'."
  - "Diagram: a single status update with three bit-flips fanning out as three contradictory versions of the same announcement, each tagged 'most recent'."
  - "Map of late-1970s ARPANET sites with one node at Harvard glowing red, arrows of corrupt updates spreading outward."
  - "Side-by-side panels: 'Postel's Law as written' vs 'Postel's Law after 1980' — the second adds 'strict in semantics'."
  - "Cover page of RFC 789, July 1981, Eric Rosen, BBN — 'Vulnerabilities of Network Control Protocols: An Example'."
---

# Part XI, Chapter — ARPANET 1980 — The First Major Crash

## The hook
The first lesson the internet had to learn the hard way: protocols must defend against malformed input even from trusted peers — especially in the periodic background traffic that nobody watches. On 27 October 1980, the entire research internet of the time went dark for a full day. The cause was three bits in a status update.

## The story

### Three Bits, A Whole Network Down
ARPANET in 1980 was a few hundred host machines connected through BBN's IMPs — Interface Message Processors, refrigerator-sized minicomputers built on modified Honeywell DDP-516s. BBN was Bolt, Beranek and Newman, the Cambridge consultancy that won the ARPANET hardware contract in 1968 and built the network's first routers. The IMPs ran a distance-vector routing protocol. Every few seconds each IMP told its neighbours, in effect, "I am alive, here are my reachable destinations and the cost of each."

On 27 October, a faulty IMP at Harvard sent a status update where one of its sequence numbers had three bits flipped. That single message now looked like three different valid versions of the same announcement, each claiming to be the most recent. Receiving IMPs applied their tie-breaking rule — pick the most recent — but each one picked a different version, then propagated its choice. The network entered a state where every IMP believed a different version of the topology was canonical. Routes flapped. Loops formed. Throughput collapsed. The whole research internet was dark for a full day.

### The Six-Hour Diagnosis
Eric Rosen at BBN spent the next six hours instrumenting the wire and reading IMP code. The bug was not in the routing algorithm. It was in the input validation — the code that received a status update assumed any malformed-looking sequence number was simply newer than what it had. It never considered the possibility that one bad IMP could create three legal-looking versions simultaneously.

The fix was to install patched IMP software that rejected sequence numbers from impossible state transitions, then reboot every IMP on the network. Three hours of rollout, five years of organisational change. Rosen wrote up the post-mortem as RFC 789 — *Vulnerabilities of Network Control Protocols: An Example* — and published it in July 1981. It is one of the earliest detailed engineering post-mortems published openly, and the template for every "service A took down service B because of an unhandled edge case" report since.

### Postel's Law had limits
Be conservative in what you send, be liberal in what you accept. A beautiful guideline — until "liberal" means accepting a malformed message and propagating it network-wide. The 1980 collapse forced the field to admit Postel's Law has an important exception: be strict in what you accept from anything that isn't under your operational control. The modern interpretation: be liberal with format, strict with semantics.

## The figures

### RFC 789 — Vulnerabilities of Network Control Protocols: An Example
Eric Rosen's post-mortem of the 27 October 1980 ARPANET collapse, published July 1981. It walks through the three-bit corruption, the tie-breaking failure, and the rollout of patched IMP software. Its lasting contribution is not the fix but the form: a public, detailed root-cause document written by the operator who lived it.

### RFC 9293 — Transmission Control Protocol (TCP)
The current consolidated TCP standard, edited by Wes Eddy and published in 2022. It obsoletes RFC 793 and a half-dozen later patches into a single document. It is the reference TCP episode listeners should reach for when they want the mechanism — header format, sequence numbers, three-way handshake, sliding-window flow control.

### RFC 7323 — TCP Extensions for High Performance
The 2014 standards-track update by Borman, Braden, Jacobson, and Scheffenegger. It defines Window Scale — letting the 16-bit receive window represent up to 2^30 bytes — and Timestamps with PAWS, Protection Against Wrapped Sequences. PAWS is the direct descendant of the lesson at Harvard: never trust a sequence number that claims to be impossibly far in the past or future.

## What it taught the industry
Three changes that are now standard date back to lessons from this incident.

Periodic background traffic gets first-class testing. Before 1980, routing keepalives were considered "infrastructure" — they ran in the background and engineers debugged them only when things broke. After 1980, every routing protocol's keepalive path was instrumented and fuzzed alongside the main code paths. The modern equivalents are BGP route-refresh, OSPF link-state advertisements, and BFD keepalives. How BGP itself does this — OPEN, UPDATE, KEEPALIVE messages every thirty seconds over TCP port 179 — is the BGP episode.

Public post-mortems became the norm. RFC 789 established that engineering organisations publish detailed root-cause analyses of their incidents. The Google SRE book, the Cloudflare incident reports, the Facebook 2021 write-up — all descendants of this practice.

Sequence-number arithmetic is paranoid by default. Modern protocols reject any sequence number that is impossibly far in the past or future, instead of trusting wall-clock-style ordering. TCP's PAWS — Protection Against Wrapped Sequences, defined in RFC 7323 — is one example. The mechanism story for TCP sequence numbers is the TCP episode.

## Listening order

- **Before this chapter:** *"A History of Congestion Control" — sets up why the network's background machinery, not just its application traffic, is where the hardest failures hide.*
- **After this chapter:** *"AS 7007 1997" — the next famous outage, where a single misconfigured router announces the whole internet to itself.*

## Where to go deeper
- The BGP episode picks up the routing-protocol story — path-vector, AS_PATH, eBGP versus iBGP, and what happens when an AS withdraws its own routes, as Facebook did for six hours in October 2021.
- The TCP episode covers the sequence-number machinery in detail — the three-way handshake, sliding-window flow control, and PAWS as the modern guard against the class of bug that took ARPANET down.

## Visual cues for image generation
- A refrigerator-sized Honeywell DDP-516 IMP in a 1980 university machine room, labels and cables visible.
- One status update fanning out as three contradictory "most recent" versions, each propagating to a different neighbour.
- Late-1970s ARPANET map with the Harvard node glowing red and corrupt updates spreading outward.
- Side-by-side panels: Postel's Law as written versus Postel's Law after 1980 — the second adds "strict in semantics."
- The cover page of RFC 789, July 1981, Eric Rosen, BBN.
