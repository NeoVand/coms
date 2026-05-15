---
id: icmp
type: chapter
part_id: layer-2-3
part_label: III
part_title: Layer 2-3 Foundations
title: ICMP
synopsis: Ping, traceroute, and the diagnostic backplane.
podcast_target_minutes: 15
position_in_book: 23 of 75
listening_order:
  prev: layer-2-3/ipv6
  next: layer-2-3/bgp
related_protocols: [icmp, ip, tcp, ipv6, dns, ntp, udp, bgp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [792, 1122, 4821]
images: []
visual_cues:
  - "A scan of Mike Muuss's terminal session from a single December 1983 night at BRL Aberdeen — the first ping, with a sonar pulse waveform overlaid behind it."
  - "A traceroute output for a long international path with each hop annotated by the ICMP Time Exceeded message that produced it, showing the TTL counter ticking down from 30 to 1."
  - "A diagram of the MTU black hole: a TCP three-way handshake completes, then a large HTTP response sits halfway across the path while the ICMP Fragmentation Needed message is silently dropped at a firewall."
  - "A Smurf-attack flow chart from 1998 — a single spoofed Echo Request hitting a directed broadcast address and fanning out into hundreds of replies aimed at the victim — with a stamped 'fixed by RFC 2644, August 1999' overlay."
  - "A timeline from RFC 823 GGP (September 1982) through RFC 792 ICMP (September 1981) to RFC 4821 PLPMTUD (2007) to the 2025 Tsinghua challenge-confirm draft, framed as 'how the internet learns to tell you something is wrong.'"
---

# Part III, Chapter — ICMP

## The hook

In December 1983, at the Ballistic Research Lab in Aberdeen, Maryland, Mike Muuss heard Dave Mills describe Fuzzball latency-timing experiments. That same night, Muuss sat down and wrote a tool. He had to write the kernel raw-ICMP socket support too, because it didn't exist yet. By sunrise, ping was working. He named it after the sound a sonar makes. Forty-three years later, every operator on Earth still types it as the first thing they try when something is broken.

## The story

### Mike Muuss's One-Night Tool

ICMP is the protocol that lets the network tell you something is wrong without opening a connection. It was specified in RFC 792 in September 1981 by Jon Postel — there's an RFC episode for that one — and it sits directly on IP with protocol number 1. No ports. No handshake. Just messages.

When a router drops your packet because the time-to-live counter hit zero, it sends an ICMP Time Exceeded back to you. That is the mechanism traceroute exploits to map every hop along a path. When a destination is unreachable, you get Destination Unreachable. When a router has too small an MTU for your packet and the Don't Fragment bit is set, it sends Fragmentation Needed, and that is what Path MTU Discovery depends on. The mechanics of how ICMP is encoded, what the type and code numbers mean, and how ICMPv6 differs — those live in the ICMP episode itself.

The most famous ICMP message is Echo Request and Echo Reply. That is what ping sends. Mike Muuss wrote ping at BRL Aberdeen in a single night in December 1983. He had everything working well before sunrise. And the name — "ping" — is not an acronym. Muuss debunked the "Packet INternet Groper" backronym himself. He named it after the sound that sonar makes, inspired by the whole principle of echo location. He also coined "default route" and "default gateway." Mike Muuss died on 20 November 2000 in an automobile collision on Interstate 95. He was 42.

There is a callout in the chapter that is worth reading aloud, because it is the source of a long-running argument among security teams. Read literally, RFC 1122 — the Host Requirements RFC, edited by Bob Braden in 1989 — says in section 3.2.2 that ICMP is a control protocol that is considered to be an integral part of IP. Every IP host must answer Echo Requests by spec. So dropping ICMP at your border firewall is, in standards terms, partially refusing to implement IP. It also breaks Path MTU Discovery and creates the MTU black hole — the failure mode where TCP connections hang because the network can neither deliver the large packet nor signal that it cannot. The TCP episode is where the connection hang lives in detail.

### Two Famous Attacks That Renamed the Field

Two ICMP attacks are still in every networking textbook, and both had real fixes that you are running right now without knowing it.

The Smurf attack landed in 1997 and 1998. The tool, smurf.c, was written by Dan Moschuk under the alias TFreak. The trick was simple and devastating: send an ICMP Echo Request with a spoofed source address to a network's directed broadcast address, and every host on that network answers — to the victim. The first high-profile incident hit the University of Minnesota in 1998. The fix was RFC 2644 in August 1999, which changed the router default from "forward directed broadcasts" to "drop." Every modern router has the fix. Smurf is now a museum piece. But it is the reason directed-broadcast forwarding is off by default everywhere.

Ping of Death came a year earlier, in 1996 and 1997. Oversized fragmented ICMP packets, when reassembled, exceeded 65,535 bytes and crashed Windows 95 and NT, early Linux and BSD, Cisco IOS, and the classic Mac. CERT advisory CA-1996-26 went out on 16 December 1996. Modern stacks check for total length overflow before reassembly. The bug is closed. But the lesson — that fragment reassembly is one of the most critical security paths in any IP stack — survives in CVE-2024-38063, the Windows IPv6 fragment integer underflow disclosed on 13 August 2024 with a CVSS score of 9.8 and the chilling note "exploitable from anywhere on the link." The IPv6 episode is the right place for that one.

And then there is the operational story. Cloudflare's 2014 blog post, "Path MTU Discovery in Practice," documented a different kind of failure. ICMP Type 3 Code 4 messages — the Fragmentation Needed signal — were being filtered before they reached Cloudflare's servers. So TCP handshakes completed, then HTTP responses hung forever. That single post drove the industry rollout of RFC 4821, also known as PLPMTUD, or Packetisation-Layer Path MTU Discovery. Mark Allman, Matt Mathis, and John Heffner published it in 2007. The idea is to probe path MTU at the application layer instead of relying on routers to send ICMP back. If you cannot trust the network to tell you the truth, measure it yourself.

### The 2024 CVE Wave and the Frontier

In 2024, Cloudflare mitigated 21.3 million DDoS attacks — up 53 percent year over year — and the single biggest event was a 5.6 terabit-per-second flood from a Mirai variant. ICMP reflection still ranks among network-layer DDoS vectors, though the protocol's role has shrunk. DNS, NTP, and UDP-amplification attacks dominate the headlines now. The DNS episode, the NTP episode, and the UDP episode pick up those mechanics.

On 13 February 2024, Linux became its own CVE Numbering Authority. The result was somewhere between 3,108 and 3,529 kernel CVEs in 2024, depending on whether you count NIST or CIQ — a 79 percent year-over-year increase, mostly from the process change, not from a real spike in bug rate. The ICMP-tagged ones include CVE-2024-47678, an icmp rate limit ordering bug, and CVE-2024-56647, an ICMP host re-lookup that triggered ip_rt_bug.

Then there is the substrate problem. A 2020 internet-wide measurement called the SMap study found that 69.8 percent of autonomous systems still don't filter spoofed packets at ingress. That is the substrate that makes ICMP reflection still feasible. The BGP episode covers what an autonomous system actually is.

The frontier is more hopeful. Tsinghua's draft-xu-intarea-challenge-icmpv4-02, published in February 2025, proposes a challenge-confirm scheme using IP options so receivers can verify that a router actually saw the original packet. It is the most concrete proposal in years to fix ICMP's "anyone-can-spoof-any-error" weakness. And draft-ietf-6man-icmpv6-reflection-19, from December 2025, defines a stateless probe-and-reflect ICMPv6 utility that is currently active.

One last piece of lineage. RFC 823, published in September 1982, defined GGP — the Gateway-to-Gateway Protocol — running on BBN's LSI-11 gateways. GGP is ICMP's parent. It was the predecessor of EGP in 1984 and the grand-uncle of BGP. The diagnostic mechanism predates the routing protocol. The BGP episode picks up that thread.

## The figures

### RFC 792 — Internet Control Message Protocol

Jon Postel, September 1981. Internet standard. The 17-page document that defines Echo, Echo Reply, Destination Unreachable, Time Exceeded, Source Quench, Redirect, Timestamp, and Information Request. Forty-five years later, every router and host on Earth still implements it.

### RFC 1122 — Requirements for Internet Hosts: Communication Layers

Bob Braden, editor, 1989. Internet standard. The document that says ICMP is an integral part of IP — the line that turned every "drop ICMP at the firewall" decision into a standards-compliance argument. Section 3.2.2 is the one operators quote.

### RFC 4821 — Packetization Layer Path MTU Discovery

Matt Mathis and John Heffner, 2007. Proposed standard. The post-ICMP-filter-era answer to Path MTU Discovery: probe MTU from the transport layer instead of trusting routers to send the Fragmentation Needed message back. This is the spec the Cloudflare 2014 post pushed onto everyone's roadmap.

## What you'd see in the simulator

Press play in the ICMP simulator and you watch two tools at once. The first is ping — an Echo Request leaves your host wrapped directly in an IP packet with protocol number 1, no TCP, no UDP, no port. It hits the target. The target replies with Echo Reply. The simulator times the round trip and shows you the milliseconds. The second is traceroute. The simulator sends a packet with TTL set to 1. The first router decrements it to zero, drops the packet, and sends back an ICMP Time Exceeded with the router's own address as the source. The simulator records hop one. Then TTL 2. Then TTL 3. Each hop reveals itself by being the place a packet died. By the end you have a map of every router between you and the destination — built entirely out of error messages.

## Listening order

- **Before this chapter:** "IPv6" — the chapter that introduces ICMPv6 as the protocol that absorbed Neighbor Discovery and address autoconfiguration when IPv4's broadcast model went away.
- **After this chapter:** "BGP" — the routing protocol whose direct ancestor, GGP, is also ICMP's parent; the diagnostic mechanism predates the routing one.

## Where to go deeper

- The ICMP episode picks up the mechanism story — type and code numbers, how Echo and Time Exceeded are encoded, how ICMPv6 differs from ICMPv4, and why ICMPv6 is more critical to IPv6 than ICMP ever was to IPv4.
- The IP episode is the substrate ICMP rides on — TTL, fragmentation, the 20-byte header, protocol numbers.
- The IPv6 episode covers Neighbor Discovery, SLAAC, and the August 2024 CVE-2024-38063 fragment underflow.
- The TCP episode is where the MTU black hole actually hangs the connection — handshake completes, payload vanishes.
- The DNS, NTP, and UDP episodes carry the modern story of amplification DDoS that ICMP reflection has now been mostly dethroned by.
- The BGP episode picks up GGP's lineage and explains what an autonomous system is — the unit of measurement in the SMap spoofing study.

## Visual cues for image generation

- A scan of Mike Muuss's terminal session from a single December 1983 night at BRL Aberdeen — the first ping, with a sonar pulse waveform overlaid behind it.
- A traceroute output for a long international path with each hop annotated by the ICMP Time Exceeded message that produced it, showing the TTL counter ticking down from 30 to 1.
- A diagram of the MTU black hole: a TCP three-way handshake completes, then a large HTTP response sits halfway across the path while the ICMP Fragmentation Needed message is silently dropped at a firewall.
- A Smurf-attack flow chart from 1998 — a single spoofed Echo Request hitting a directed broadcast address and fanning out into hundreds of replies aimed at the victim — with a stamped "fixed by RFC 2644, August 1999" overlay.
- A timeline from RFC 823 GGP (September 1982) through RFC 792 ICMP (September 1981) to RFC 4821 PLPMTUD (2007) to the 2025 Tsinghua challenge-confirm draft, framed as "how the internet learns to tell you something is wrong."
