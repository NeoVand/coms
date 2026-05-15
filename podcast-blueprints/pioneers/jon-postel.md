---
id: jon-postel
type: pioneer
name: Jon Postel
years: "1943–1998"
title: RFC Editor & Protocol Architect
org: USC Information Sciences Institute
podcast_target_minutes: 8
protocols: [tcp, udp, ipv4, icmp, dns, smtp]
categories: []
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - story-of-the-internet/the-1981-burst
  - transport/udp
  - utilities-security/dns
  - utilities-security/email-stack
awards:
  - { name: "Internet Hall of Fame", year: 2012, url: null }
  - { name: "IEEE Internet Award", year: 1999, url: null }
image:
  src: null
  alt: Portrait of Jon Postel
  credit: null
visual_cues:
  - "Portrait composition: Postel in his trademark long beard and sandals, mid-1980s ISI office in Marina del Rey, stacks of numbered RFC printouts on the desk behind him"
  - "Cover sheet of RFC 791, dated September 1981, editor 'Jon Postel,' lying on a desk next to RFC 792 and RFC 793 in the same typeface — the three documents that booted TCP/IP"
  - "RFC 768 — three pages, August 1980 — pinned to a corkboard with the words 'User Datagram Protocol' highlighted, captioned as the most spartan spec in networking"
  - "A printed copy of RFC 760 with the line 'be conservative in what you do, be liberal in what you accept from others' underlined in red"
  - "A wall of paper RFCs filed by number from 1 upward, with a single chair in front — the Editor's seat at ISI"
---

# Jon Postel

## In one sentence
Jon Postel is the engineer who edited the foundational TCP/IP RFCs, ran the RFC series and the numbers registry for nearly thirty years, and wrote down the rule that the internet still tries to live by.

## The hook (cold-open)
In September 1981, three documents came out of USC's Information Sciences Institute in Marina del Rey. RFC 791. RFC 792. RFC 793. IPv4, ICMP, TCP. The editor's name on each one was the same: Jon Postel. A year earlier, in August 1980, he had shipped RFC 768 — UDP, three pages long, the most spartan spec in networking. From then until his death in 1998, Postel was the person who said when an internet standard was a standard. He ran the RFC series, and he ran the numbers.

## The work

### The 1981 standardisation burst
The September 1981 RFCs are the founding stack of the internet that runs today. We won't unpack the mechanism here — the TCP episode, the IPv4 episode, and the ICMP episode each walk through what those protocols actually do on the wire, and there is a separate book chapter, the 1981–83 Standardisation Burst, that tells the wider story of that month. The biographical fact to hold onto is that one editor, at one institute, shepherded all three documents to publication in the same span. Postel did not invent TCP or IP single-handed; he edited them into the form the rest of the world implemented.

### Splitting TCP from IP
Three years earlier, in 1978, Postel argued — together with David Reed — for splitting the original monolithic Transmission Control Program into two layers: an IP layer that just moved packets, and a separate transport layer above it. That architectural call is why UDP exists at all, and it is why decades later QUIC could be built on top of UDP rather than negotiating with the kernel's TCP stack. The UDP episode and the QUIC episode both live downstream of that 1978 decision.

### RFC 768 and UDP
In August 1980, Postel published RFC 768. Three pages. A header with four fields. No connections, no retransmissions, no flow control — just a thin wrapper around IP that gave applications a port number and an optional checksum. The UDP episode covers what got built on top of it. The biographical point is that the spec is still in force, unchanged, more than four decades on.

### RFC Editor for nearly three decades
Postel was the RFC Editor from the early ARPANET years through 1998. Every numbered Request for Comments — the document series that defines the internet — passed through his hands. He set the tone, the format, and the standard for what a working internet specification looked like. The process he ran is the reason "rough consensus and running code" produced an interoperable network at all.

### IANA — the numbers
Postel was also the first steward of what became IANA, the Internet Assigned Numbers Authority. Port numbers, protocol numbers, the original top-level domains — for years, the registry of who-owns-what on the internet was, in practice, Jon Postel at ISI. The DNS episode and the email stack episode both depend on registries that he personally maintained.

### The Robustness Principle
In RFC 760, Postel wrote a single sentence that outlived him: "Be conservative in what you send, be liberal in what you accept." It became known as Postel's Law. Generations of protocol designers have quoted it, argued with it, and tried to refine it. It is probably the most cited line in the entire RFC series.

## Awards and recognition
Postel received the IEEE Internet Award in 1999, the year after his death. He was inducted into the Internet Hall of Fame in 2012, in its inaugural class.

## Quotes
"Be conservative in what you send, be liberal in what you accept." Postel wrote it into the introduction of RFC 760 in 1980, and it travelled because it captured, in one line, the design philosophy that let a network of mismatched implementations actually interoperate.

## Where they appear in the book
- Part "Foundations," chapter "What Is a Protocol?" — Postel's RFCs are the canonical examples of what a protocol specification is.
- Part "Foundations," chapter "The Layer Model" — the IP/TCP split he argued for in 1978 is the architectural backbone of the chapter.
- Part "The Story of the Internet," chapter "The 1981–83 Standardisation Burst" — Postel is at the centre of the burst; the September 1981 RFCs are his.
- Part "Transport," chapter "UDP" — RFC 768 is the chapter's primary text.
- Part "Utilities & Security," chapter "DNS" — Postel's IANA stewardship sits behind the registry that DNS depends on.
- Part "Utilities & Security," chapter "The Email Stack" — SMTP is on the list of protocols he shaped, and the email registries ran through IANA.

## See also (other pioneer episodes)
Vint Cerf and Bob Kahn co-designed the protocol that Postel then edited into RFCs 791 and 793 — see the Cerf and Kahn episodes for the design story that precedes the standardisation story told here.

Paul Mockapetris worked alongside Postel at ISI and designed DNS in the early 1980s under the registry regime Postel ran — the Mockapetris episode picks up the naming half of that story.

David Mills built the timekeeping layer of the same era's internet at the same institute culture — the Mills episode is the closest companion piece on what ISI shipped.

## Sources

**Wikipedia**
- [Jon Postel — Wikipedia](https://en.wikipedia.org/wiki/Jon_Postel)
- [Robustness principle — Wikipedia](https://en.wikipedia.org/wiki/Robustness_principle)
