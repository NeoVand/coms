---
id: randall-atkinson
type: pioneer
name: Randall Atkinson
years: "c. 1965–"
title: Original IPsec architect
org: U.S. Naval Research Laboratory, Information Technology Division
podcast_target_minutes: 6
protocols: [ipsec]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Randall Atkinson
  credit: null
visual_cues:
  - "Portrait composition: a U.S. Naval Research Laboratory engineer at a Sun workstation in 1995, three printed RFC drafts on the desk — 1825, 1826, 1827 — each with August 1995 in the header"
  - "Split-screen diagram: on the left, the original 1995 IPsec architecture stack with AH and ESP boxes; on the right, the 2005 RFC 4301 / 4302 / 4303 rewrite, with arrows showing every wire format preserved across the gap"
  - "A modern site-to-site VPN tunnel between two enterprise routers, an IKEv2 handshake on top, and a small inset captioned 'wire format frozen in August 1995 by Randall Atkinson'"
  - "The NRL Information Technology Division building in Washington, D.C., circa mid-1990s, with an early IPv6 testbed cable run visible through the door"
---

# Randall Atkinson

## In one sentence
Randall Atkinson is the U.S. Naval Research Laboratory engineer who lead-authored the first-generation IPsec architecture in August 1995, and whose wire-format decisions every modern IPsec implementation still carries unchanged today.

## The hook (cold-open)
Open any site-to-site VPN, any 3GPP mobile-core backhaul, any IKEv2 client tunnel on macOS, iOS, Windows, or Android, and the bytes on the wire are the bytes Randall Atkinson specified in August 1995. Three RFCs went out that month from the Naval Research Lab — 1825, 1826, and 1827 — under his name as lead author. The IETF rewrote the architecture a decade later. They did not change the wire. That is the bar most protocol designers never clear.

## The work

### RFC 1825, 1826, 1827 — IPsec, August 1995
Atkinson's central contribution is the first-generation IPsec architecture, published as three RFCs in a single month from the U.S. Naval Research Laboratory. RFC 1825 was the security architecture document — the framing for how cryptographic protection would attach to IP itself rather than to any single application above it. RFC 1826 specified AH, the Authentication Header. RFC 1827 specified ESP, the Encapsulating Security Payload. The mechanism — how AH and ESP actually wrap a packet, and how the security associations are negotiated above them — belongs to the IPsec episode. What matters for the biography is that Atkinson was lead author on all three, that he built one of the first interoperable implementations alongside the specifications, and that he shepherded the working-group consensus through the early IETF Security Area when there was no precedent for cryptography at the network layer.

### The 2005 rewrite that preserved the wire
Ten years later, in 2005, the IETF published the second-generation IPsec architecture: RFC 4301 replacing 1825, RFC 4302 replacing 1826, RFC 4303 replacing 1827. The rewrite restructured a great deal — security policy database semantics, processing models, IKEv2 integration. It preserved every wire-format decision Atkinson had made in 1995. That preservation is the quiet measure of the original work. The substrate every modern IPsec implementation builds on — strongSwan on Linux, libreswan, the IKEv2 clients shipped by Apple and Microsoft, the 3GPP mobile-core gateways — is still the substrate Atkinson laid down at NRL.

## Where they appear in the book
The dump lists no book chapters that reference Atkinson directly. The protocol he architected — IPsec — has its own episode, and that is the place to follow the AH and ESP mechanics on the wire.

## See also (other pioneer episodes)
Atkinson shares the IPsec story with the engineers who carried it forward. Charlie Kaufman edited IKEv2 across its full twenty-year lifecycle, from RFC 4306 in 2005 through to the 2014 Internet Standard — there is a separate episode on him. Andreas Steffen founded and led strongSwan, the open-source IPsec stack that ended up running inside every major cloud VPN gateway and every German government SINA box; that episode is the production sequel to Atkinson's specification work. The IPsec protocol episode itself is the place to hear how AH and ESP actually move bytes.

## Sources

**RFCs**
- [RFC 1825 — Security Architecture for the Internet Protocol](https://datatracker.ietf.org/doc/rfc1825/)
