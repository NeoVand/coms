---
id: stuart-cheshire
type: pioneer
name: Stuart Cheshire
years: "c. 1968–"
title: Designer of Multicast DNS and DNS-SD
org: Apple
podcast_target_minutes: 8
protocols: [mdns]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Stuart Cheshire
  credit: null
visual_cues:
  - "Portrait composition: a Distinguished Engineer at an IETF microphone in mid-polemic, slide behind him reading 'mDNS vs LLMNR' with a red X through the Microsoft alternative"
  - "A home network diagram: a laptop, a printer, a Chromecast, an AirPlay speaker, and a Matter light bulb all shouting queries at the 224.0.0.251 multicast address with no DHCP-configured DNS server in sight"
  - "Side-by-side: a hand-drawn 1987 BBC Micro screenshot of Bolo tanks on a green grid next to a 1990s Mac Bolo port, captioned '16-player networked tank game, before he wrote any RFCs'"
  - "A bookshelf shot of the 2005 O'Reilly Zero Configuration Networking: The Definitive Guide next to a stack of printed RFCs numbered 3927, 6760, 6761, 6762, 6763, 6886, 6887, 7558, 8765, 8766, 9664, and 9665"
---

# Stuart Cheshire

## In one sentence
Stuart Cheshire is the Apple engineer who designed Multicast DNS and DNS-SD — the reason every printer, Chromecast, AirPlay speaker, and Matter light bulb on your home network can find each other without anyone configuring a thing.

## The hook (cold-open)
Plug a printer into your home network in 2026 and your laptop sees it within seconds, with no DHCP option, no central directory, no manual IP. That works because of a protocol that takes ordinary DNS queries and shouts them at a link-local multicast address, and a companion protocol that uses those queries to advertise services by name. Both were designed by one person at Apple — Stuart Cheshire — and standardised in February 2013 as RFC 6762 and RFC 6763. He has been at Apple since January 1998, and he is still shipping IETF RFCs on the same family of problems; the most recent, RFC 9665 on the Service Registration Protocol, was published in 2025.

## The work

### Cambridge, Stanford, and a framing algorithm
Cheshire took his BA in Computer Science at Sidney Sussex College, Cambridge, in 1989, and his MA there in 1992. He moved to Stanford for an MSc in Computer Networking in 1996 and a PhD in 1998. His dissertation invented Consistent Overhead Byte Stuffing — COBS — a framing algorithm that bounds the worst-case overhead of escaping a delimiter byte inside a binary stream. COBS is now widely used in embedded protocols where you need a clean packet boundary on a serial line and you cannot afford the worst-case blow-up of older byte-stuffing schemes.

### Bolo
Before any of the RFCs, Cheshire wrote Bolo — a 16-player networked tank game, originally for the BBC Micro in 1987 and ported to the Mac in the 1990s. Old-timers at Apple still name-drop it. It is the kind of biographical detail that does not show up in an IETF bio but matters: the person who eventually designed how Apple devices find each other on a LAN had been writing networked multiplayer code on 8-bit hardware as a teenager.

### Apple, January 1998 — and the Zeroconf quartet
Cheshire joined Apple in January 1998 and has been there ever since, currently as a Distinguished Engineer. The defining body of work is the Zeroconf quartet of RFCs, all published in February 2013 after more than a decade of running code shipped as Apple's Bonjour:

- RFC 6760, on the requirements for unicast DNS support of Multicast DNS.
- RFC 6761, which carved out special-use top-level domains.
- RFC 6762, Multicast DNS itself — the protocol we cover in the mDNS and DNS-SD episode.
- RFC 6763, DNS-Based Service Discovery — the layer on top that lets a printer say "I am an IPP printer named 'Office LaserJet'" using nothing but ordinary DNS records.

The mechanism story belongs to that protocol episode. The biographical point is that a single engineer pushed a coherent four-RFC stack through the IETF, after shipping it first inside Apple as the thing that makes AirPort, AirPlay, AirPrint, and the rest of the Apple ecosystem feel like they "just work."

### IPv4 link-local, NAT-PMP, PCP
Around the same period Cheshire authored or co-authored a string of related RFCs that fill in the gaps a zero-configuration LAN needs. RFC 3927 defined IPv4 link-local addressing — the 169.254/16 range a host gives itself when no DHCP server answers. RFC 6886 specified NAT-PMP, Apple's NAT Port Mapping Protocol. RFC 6887, which he co-authored, generalised that into the Port Control Protocol, PCP, the IETF-standard successor. RFC 6335 rewrote the IANA procedures for assigning port numbers — unglamorous but load-bearing plumbing for everyone who runs a registered service.

### The book, and the IETF persona
In 2005 Cheshire and Daniel H. Steinberg published *Zero Configuration Networking: The Definitive Guide* with O'Reilly — the long-form companion to the Zeroconf RFCs. Inside the IETF, Cheshire is famous for animated, opinionated presentations; the most-quoted is his recurring critique of LLMNR, the Microsoft alternative to mDNS, which he argued was a worse design that the industry should not standardise alongside his.

### The second act — DNS-SD scalability and SRP
The work did not stop at RFC 6763. Cheshire kept pushing on the limits of DNS-SD as it left the LAN. RFC 7558 wrote down the scalability requirements. RFC 8765 specified DNS Push notifications, so a client can subscribe to changes instead of polling. RFC 8766 defined the Discovery Proxy, which lets a normal unicast DNS resolver expose mDNS records from a remote link. RFC 9664 added the DNS Update Lease so registered records expire cleanly. And RFC 9665, published in 2025, is the Service Registration Protocol — SRP — the piece Matter and other modern IoT stacks use to register services into DNS-SD across a Thread or Wi-Fi network. Twenty-seven years after joining Apple, he is still the editor on the standard that ships.

## Where they appear in the book
The dump does not list any book chapters that reference Cheshire by name; the obvious next listen is the mDNS and DNS-SD episode, which is the protocol his Zeroconf quartet defined.

## See also (other pioneer episodes)
The closest neighbour in this series is Lennart Poettering, who wrote Avahi — the Linux implementation of the protocols Cheshire designed — and shipped it as the default service-discovery stack in systemd-based distributions. Between Cheshire's Bonjour at Apple and Poettering's Avahi on Linux, mDNS became cross-platform by parallel implementation rather than by committee.

For the broader DNS family the mDNS work sits inside, the DNS episode covers the unicast protocol Cheshire's design re-uses wholesale on the wire — same packet format, same record types, different transport.

## Sources

**Homepage**
- [stuartcheshire.org](https://stuartcheshire.org/)
