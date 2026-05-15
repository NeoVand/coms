---
id: steve-deering
type: pioneer
name: Steve Deering
years: "1951–"
title: Architect of IPv6 and IP Multicast
org: Xerox PARC, Cisco
podcast_target_minutes: 6
protocols: [ipv6]
categories: []
related_book_chapters:
  - layer-2-3/ipv6
  - realtime-av/rtp-and-rtcp
awards:
  - { name: "IEEE Internet Award", year: 2010, url: null }
image:
  src: null
  alt: Portrait of Steve Deering
  credit: null
visual_cues:
  - "Portrait composition: Deering at a late-1980s Stanford workstation, a whiteboard behind him sketching a multicast tree branching from one source to many receivers"
  - "Cover page of the 1991 Stanford PhD thesis 'Multicast Routing in a Datagram Internetwork' on a desk next to a printed copy of RFC 1112"
  - "Split diagram: a 32-bit IPv4 header on the left with all its option fields, the cleaner 40-byte IPv6 fixed header on the right, an arrow labelled RFC 2460 between them"
  - "A modern Google traffic chart showing the IPv6 share crossing 50 percent on 28 March 2026, captioned with the date and the words 'twenty-eight years after the spec'"
---

# Steve Deering

## In one sentence
Steve Deering is the engineer who invented IP multicast in his 1991 Stanford thesis and then, with Bob Hinden, designed IPv6 — the addressing system that on 28 March 2026 finally carried more than half of Google's traffic.

## The hook (cold-open)
Two of the load-bearing pieces of the modern internet trace back to one person. The first is one-to-many delivery — the trick that lets a single stream of market data, IPTV channel, or pub/sub feed reach thousands of receivers without the source sending thousands of copies. The second is the replacement for the 32-bit address space we ran out of. Steve Deering shipped the first as his PhD and the second as a decade of RFCs at Xerox PARC and Cisco.

## The work

### IP multicast and IGMP — Stanford PhD, 1991
Deering's 1991 Stanford thesis invented IP multicast on top of the IPv4 protocol — the protocol covered in the IPv4 episode. The mechanism is the Internet Group Management Protocol, IGMP, which lets hosts join and leave multicast groups so that routers know where to forward a single packet to many receivers. The mechanism story belongs to its own protocol episode; the biographical point is what it enabled afterwards. IPTV, financial market data feeds, and intra-datacentre pub/sub all run on the one-to-many primitive Deering wrote up as a graduate student.

### IPv6 — RFC 1883 (1995), RFC 2460 (1998), RFC 8200 (2017)
At Xerox PARC and then Cisco, Deering became the primary architect of IPv6 with Bob Hinden. The spec went through three major revisions: RFC 1883 in 1995, RFC 2460 in 1998, and the current RFC 8200 in 2017, which is also Internet Standard 86. The design choices in those documents are Deering's fingerprints — the simplified 40-byte fixed header, the extension-header chain that moved options out of the fast path, link-local addressing, and the rule that routers do not fragment in the network. The mechanism details belong to the IPv6 episode and the IPv6 chapter.

### The 28-year deployment curve
The interesting fact about IPv6 is not the spec, it is the calendar. The first version of the protocol shipped in 1995. On 28 March 2026, IPv6 carried 50.1 percent of Google's traffic for the first time — twenty-eight years after the 1998 revision. Few engineers get to see a design they shipped in their thirties cross the halfway line of the global internet in their seventies. Deering did.

## Awards and recognition
Deering received the IEEE Internet Award in 2010 for his work on IP multicast and IPv6.

## Where they appear in the book
- Part "Layer 2-3: Foundations," chapter "IPv6" — the IPv6 design choices and the long deployment curve are the chapter's spine.
- Part "Real-time A/V," chapter "RTP and RTCP" — multicast is the delivery primitive that real-time audio and video assumed for years.

## See also (other pioneer episodes)
Deering's IPv6 work was a direct response to the address-exhaustion problem set up by the original IPv4 design — the Vint Cerf and Bob Kahn episodes cover the founding spec that ran out of room. The multicast lineage runs into real-time media; the Henning Schulzrinne and Jonathan Rosenberg episodes pick up the RTP and SIP story that assumed multicast as a delivery mode.

## Sources

**Wikipedia**
- [Steve Deering — Wikipedia](https://en.wikipedia.org/wiki/Steve_Deering)
