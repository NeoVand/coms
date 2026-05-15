---
id: david-mills
type: pioneer
name: David L. Mills
years: "1938–2024"
title: Inventor of NTP
org: University of Delaware, COMSAT Labs
podcast_target_minutes: 6
protocols: [ntp]
categories: []
related_book_chapters:
  - utilities-security/ntp
awards:
  - { name: "Internet Hall of Fame", year: 2013, url: null }
  - { name: "IEEE Internet Award", year: 2013, url: null }
image:
  src: null
  alt: Portrait of David L. Mills
  credit: null
visual_cues:
  - "Portrait composition: bearded engineer at a 1980s University of Delaware office, an oscilloscope and a GPS antenna on the desk, stratum-1 clock rack behind him"
  - "Diagram on a chalkboard showing Marzullo's algorithm — overlapping time intervals from four servers narrowing into a single agreed instant"
  - "Photograph of an early NSFNET Fuzzball router — a PDP-11 class machine with hand-labelled cables — under a wall clock reading UTC"
  - "Stack of four RFC printouts on a desk: 958, 1119, 1305, 5905, with publication years 1985, 1988, 1992, 2010 in the margins"
---

# David L. Mills

## In one sentence
David Mills is the engineer who, in 1981, designed the protocol that keeps every computer on the internet agreeing on what time it is — and then spent the next forty years personally maintaining it.

## The hook (cold-open)
Every TLS handshake your browser makes today depends on the two endpoints agreeing on the current time, within a few seconds. Every Kerberos ticket. Every distributed log. Every certificate revocation check. The protocol that makes that agreement possible is called NTP — the Network Time Protocol — and one man designed it in 1981 and refined it through four RFCs over the next three decades. His name was David Mills, and when he died in 2024, the internet's clock had been running on his code for forty-three years.

## The work

### NTP, 1981 onward
Mills published the first version of NTP in 1981 and shepherded it through four canonical RFCs: RFC 958 in 1985, RFC 1119 in 1988, RFC 1305 in 1992, and RFC 5905 in 2010. The mechanism we won't unpack here — the NTP episode walks through how stratum levels, polling, and clock discipline actually work on the wire. What matters for the biography is the design choice underneath: Mills paired Keith Marzullo's interval-intersection algorithm with his own clock-discipline mathematics, and the combination has held up since the 1980s against arbitrary network jitter, asymmetric paths, and clocks that drift in the heat. NTP synchronises machines across the public internet to within milliseconds. That number has not needed to change.

### The Fuzzballs and the NSFNET backbone
Before NTP was the only thing he was famous for, Mills built the Fuzzballs — the routers and gateway software that ran the original NSFNET backbone. They were PDP-11 class machines with code Mills wrote himself, and they carried the traffic of the early internet through the mid-1980s. The Fuzzball work is also where a lot of the early thinking about timekeeping in distributed systems came from, because routing decisions and timestamps were entangled from the start.

### Forty years of stewardship
The unusual fact about Mills is the duration. Most pioneers ship a thing and move on. Mills shipped NTP and then maintained the reference implementation, answered the mailing list, and ran the canonical time servers at the University of Delaware for four decades. Every clock-sync protocol that came after — PTP for sub-microsecond precision in datacenters, the discipline loops inside GPS-disciplined oscillators — inherited the mathematics he worked out in the 1980s.

## Awards and recognition
Mills was inducted into the Internet Hall of Fame in 2013 and received the IEEE Internet Award the same year, both citing NTP and the Fuzzball backbone work.

## Where they appear in the book
- Part "Utilities and Security," chapter "NTP" — the protocol Mills designed and the centrepiece chapter for him; that episode is where the mechanism story lives.

## See also (other pioneer episodes)
NTP sits in the utilities layer alongside DNS — if you want the other foundational service the internet runs on, the DNS episode and the Paul Mockapetris episode are the natural companions.

The clock-discipline mathematics Mills worked out is also the substrate underneath every TLS certificate validation — the TLS episode is where the dependency on accurate time becomes load-bearing, and a useful follow-on listen.

## Sources

**Wikipedia**
- [David L. Mills — Wikipedia](https://en.wikipedia.org/wiki/David_L._Mills)
