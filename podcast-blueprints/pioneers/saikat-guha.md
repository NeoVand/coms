---
id: saikat-guha
type: pioneer
name: Saikat Guha
years: "1979–"
title: NAT measurement pioneer
org: Microsoft Research India
podcast_target_minutes: 6
protocols: [stun-turn-ice]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Saikat Guha
  credit: null
visual_cues:
  - "Portrait composition: a researcher at a Cornell whiteboard, packet captures on a monitor behind him, the cover page of the 2005 IMC paper pinned to a corkboard"
  - "Diagram of TCP traversal across NATs: a client behind a home router, a server behind a corporate firewall, arrows showing the SYN exchange that the 2005 IMC paper actually measured in the wild"
  - "Cover page of RFC 5382 — NAT Behavioural Requirements for TCP — with the names Guha, Biswas, Ford, Sivakumar, Srisuresh on the masthead"
  - "A second panel for the Microsoft Research India era: a Glasnost web page on one screen, a responsible-AI evaluation dashboard on another"
---

# Saikat Guha

## In one sentence
Saikat Guha is the Cornell-trained measurement researcher who wrote the 2005 paper that pinned down what NATs actually do to TCP on the wire, and then turned those measurements into the IETF document that tells NAT vendors how to behave.

## The hook (cold-open)
By the mid-2000s, the internet was full of NATs and almost nobody had measured what they really did. The RFCs described an idealised box; the boxes shipping in home routers and enterprise firewalls did something else. In 2005, a Cornell PhD student named Saikat Guha and his advisor Paul Francis published an Internet Measurement Conference paper that tested TCP traversal across actual NATs and firewalls — and the numbers were not what the standards assumed. Three years later, that paper became RFC 5382, the IETF document that fixed the gap.

## The work

### Cornell PhD with Paul Francis
Guha did his PhD at Cornell under Paul Francis, working on the gap between what NAT boxes were specified to do and what they did once you put a packet capture in front of them. The thesis lineage runs straight into the standards work that followed.

### Characterization and Measurement of TCP Traversal Through NATs and Firewalls — IMC 2005
The 2005 Internet Measurement Conference paper with Francis is the canonical reference for *what NATs do to TCP*, as opposed to UDP, which had been studied more. The paper measured a large sample of boxes in the wild, documented their behaviour on the SYN exchange, and showed that the four-flavours folklore taxonomy people used for UDP did not cleanly map onto TCP. The protocol mechanics — STUN, TURN, ICE, hole punching — live in the NAT-traversal episode; what matters for the biography is that this is the paper that made TCP traversal a measurable, citable problem instead of a folklore one.

### NUTSS and the architecture follow-ups
The follow-up work — the NUTSS papers — proposed an architecture in which signalling and data took separate paths through the middleboxes, anticipating the way modern peer-to-peer stacks actually work. It kept the measurement discipline of the IMC paper but pushed toward what the system ought to look like once you took the measurements seriously.

### RFC 5382 — NAT Behavioural Requirements for TCP, 2008
With Bryan Ford — there is a separate episode on him — and Pyda Srisuresh, Guha co-authored RFC 5382 in 2008. It is the document that tells NAT vendors what their boxes have to do for TCP traversal to be possible at all: how long to keep mappings open, how to handle simultaneous opens, how to treat unsolicited SYNs. It took the 2005 measurements and turned them into a standards-track expectation. RFC 5382 is the TCP companion to the broader survey work in RFC 5128.

### Enterprise measurement, Glasnost, and online advertising privacy
The PhD work was the start of a broader measurement career. A 2008 IMC paper on enterprise networks moved the same instinct — measure the thing, don't assume the spec — into corporate environments. In 2010, an NSDI paper introduced *Glasnost*, a tool that let ordinary users test whether their ISP was throttling specific application traffic; it became one of the better-known artefacts of the network-neutrality measurement era. Adjacent work looked at the privacy properties of online advertising systems, again from the measurement angle.

### Microsoft Research India, present day
Guha is now at Microsoft Research, where the work has shifted toward responsible AI and large-scale system measurement. The throughline is consistent across two decades: take a system that everyone has opinions about, instrument it, and publish what it actually does.

## See also (other pioneer episodes)
Bryan Ford is the natural pair — he co-authored RFC 5382 with Guha and came at the same NAT-traversal problem from the academic-measurement side a year earlier with the 2005 USENIX paper that produced the 82-percent UDP and 64-percent TCP numbers. Beyond that, the STUN, TURN, and ICE episode in the NAT-traversal slot is where the protocol mechanics that Guha's RFC underwrites actually get explained.

## Sources

**Homepage**
- [Saikat Guha — Microsoft Research](https://www.microsoft.com/en-us/research/people/saikat/)
</content>
</invoke>