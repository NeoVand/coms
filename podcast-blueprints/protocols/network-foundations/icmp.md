---
id: icmp
type: protocol
name: Internet Control Message Protocol
abbreviation: ICMP
etymology: "[I]nternet [C]ontrol [M]essage [P]rotocol"
category: network-foundations
year: 1981
rfc: RFC 792
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - story-of-the-internet/the-1981-burst
  - layer-2-3/arp-and-ndp
  - layer-2-3/icmp
  - patterns-failures/failure-modes
related_protocols: [dns, tcp, ip, ipv6, udp, arp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [792, 1071, 1122, 1191, 1256, 4443, 4861, 4884, 4890, 4950, 5508, 6633, 8201, 8899, 9359]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/DEC_VT100_terminal.jpg/500px-DEC_VT100_terminal.jpg
    caption: A DEC VT100 terminal — the kind of glass that early network admins ran ping and traceroute on after Mike Muuss wrote ping in December 1983.
    credit: Photo — Jason Scott / CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "An illustrated 4-byte ICMP header — Type and Code as one byte each in distinct colours, then a 16-bit checksum, then the type-specific 4-byte field. Below it, the 'quoted' inner IP header plus first 8 bytes of payload that error messages echo back."
  - "A traceroute sequence diagram with three columns: source, two intermediate routers, destination. TTL=1 probe gets dropped at hop 1 with an ICMP Type 11 reply; TTL=2 reaches hop 2 with another Type 11; TTL=3 lands at the destination with a Type 3 Code 3 Port Unreachable. Each reply labelled with its source IP and elapsed RTT."
  - "A Path MTU Discovery cartoon. Source on the left with MTU 1500, a router in the middle with a 1400-byte next-hop, destination on the right. A 1500-byte packet with DF=1 hits the router; the router answers with ICMP Type 3 Code 4, 'Next-Hop MTU=1400'; the source caches PMTU(D)=1400 and resends. Beside it, the failure case: the ICMP reply gets dropped by a firewall, and the source retries the 1500-byte packet forever — a black hole."
  - "A historical line chart — September 1981 RFC 792 on the left, December 1983 ping written, RFC 1191 PMTUD in 1990, RFC 4443 ICMPv6 in 2006, RFC 6633 deprecating Source Quench in 2012, RFC 8899 PLPMTUD in 2020. Each milestone annotated with one sentence."
  - "A schematic of the IPv6 stack labelled 'Why ICMPv6 is not optional': arrows from ICMPv6 to NDP (replaces ARP), to Router Advertisement (enables SLAAC), to Packet Too Big (PMTUD), to MLD (multicast). Each one a function IPv6 cannot perform if the firewall drops ICMPv6."
  - "A Smurf-attack diagram: attacker on the left, spoofed source = victim, packets aimed at a network's directed broadcast address; every host on that segment replies to the victim, amplifying the flood. Annotated with 'RFC 2644, August 1999 — directed broadcasts off by default.'"
---

# ICMP — Internet Control Message Protocol

## In one breath

ICMP is the diagnostic protocol that lets the network tell you something went wrong without opening a connection. It is what `ping` sends and what `traceroute` listens for, and it is the only way a router on the path can tell your laptop "your packet died here, and this is why." It rides directly inside IP — no TCP, no UDP, no ports — and despite being defined on a few pages of RFC 792 in September 1981, it is still the protocol everyone reaches for first when something on the internet stops working.

## The pitch

Jon Postel published RFC 792 in September 1981. Forty-five years later, that document is still the canonical specification — STD 5, no revision, no successor. Two years after Postel shipped it, Mike Muuss sat down at a terminal at the U.S. Army Ballistic Research Laboratory in Aberdeen, Maryland, and in a single night wrote the program he called `ping` — named after the sound a sonar pulse makes, not after any acronym. He had to write the kernel raw-ICMP socket support that same night because BSD didn't have it yet. By sunrise, both existed. This episode is about what ICMP does on the wire, why every IPv6 stack on Earth would collapse if you blocked it, and why "drop all ICMP" is, in IETF terms, partially refusing to implement IP.

## How it actually works

ICMP messages are encapsulated directly in IP packets. In IPv4, the IP header's Protocol field is **1**. In IPv6, the Next Header is **58**. There is no port number. There is no connection. Each message is a self-contained four-byte header followed by a body whose layout depends on the type.

The simulator on this protocol's page walks you through the two canonical exchanges. **Ping**: your computer sends a Type 8 Echo Request with an Identifier, a Sequence number, and a timestamp payload; the target answers with a Type 0 Echo Reply that echoes the same Identifier, Sequence, and data; you compare the timestamps to get round-trip time. **Traceroute**: you send probes with TTL=1, then TTL=2, then TTL=3, and so on. Each router on the path decrements TTL; when it hits zero the router drops the packet and sends back a Type 11 Time Exceeded, with the offending IP header quoted inside so you can match the response to the probe. The router's source address tells you the hop. When the TTL is finally large enough to reach the destination, the destination answers with an Echo Reply (or, in the classic UDP variant, a Type 3 Code 3 Port Unreachable), and you stop probing. That is the entire mechanism.

### Header at a glance

Every ICMP message — v4 and v6 — starts with the same four bytes:

- **Type (8 bits).** The message family. Type 8 is Echo Request, Type 0 is Echo Reply, Type 3 is Destination Unreachable, Type 11 is Time Exceeded, Type 5 is Redirect. In ICMPv6 the high bit of Type partitions the space cleanly: 0–127 are error messages, 128–255 are informational. So ICMPv6 Echo Request is Type 128, Reply is 129; Destination Unreachable is 1, Time Exceeded is 3, Packet Too Big is 2.
- **Code (8 bits).** The sub-reason. Type 3 alone has sixteen codes: 0 = network unreachable, 1 = host unreachable, 2 = protocol unreachable, 3 = port unreachable, 4 = fragmentation needed and DF set (the Path MTU Discovery signal), 5 = source route failed, 9 = network administratively prohibited, 13 = communication administratively prohibited.
- **Checksum (16 bits).** The Internet checksum from RFC 1071 — a one's-complement sum with end-around carry. In ICMPv4 it covers only the ICMP message. In ICMPv6 it also covers a synthesised IPv6 pseudo-header (source, destination, payload length, next-header = 58), because IPv6 has no IP-layer checksum to fall back on.
- **Type/Code-specific four bytes.** For Echo, this is the Identifier and Sequence number. For Destination Unreachable Code 4, RFC 1191 carved the previously unused field into a "Next-Hop MTU" — that's the field PMTUD relies on.
- **Body.** For error messages, the body contains the offending IP header plus the first 8 bytes of its payload, so the original sender can see which transport-layer ports were involved and route the error to the right socket. RFC 4884 retrofitted a length attribute so multi-part objects can be appended after that quoted block — used by RFC 4950 to attach MPLS label stacks to traceroute responses, and by RFC 9359 for in-situ OAM.

### State machine in three sentences

ICMP has no state machine. Each message stands alone — there is no handshake, no connection, no sequence beyond what the application puts in the Identifier/Sequence fields of an Echo. A `ping` session is "stateful" only in the sense that the sender keeps a small table of outstanding probe IDs to match replies against; the protocol itself is connectionless and fire-and-forget.

### Reliability, security, and the rules everyone forgets

ICMP has **no authentication of any kind**. Any host on the path — or any host that can spoof a source address — can inject a forged Destination Unreachable or Redirect, and the recipient has no cryptographic way to tell the difference from a real one. That is why TCP added its own sequence-number checks against incoming ICMP errors in RFC 5927, why ICMP Redirect is disabled by default on most modern hosts, and why a Tsinghua draft from February 2025 — `draft-xu-intarea-challenge-icmpv4-02` — is the most concrete current proposal to bolt a challenge-confirm scheme on top using IP options.

Both ICMPv4 (RFC 1812) and ICMPv6 (RFC 4443 §2.4) **require rate-limiting** of error messages. Linux ships defaults of `icmp_msgs_per_sec=1000`, `icmp_msgs_burst=50`, and a per-destination minimum spacing of `icmp_ratelimit=1000` ms for the rate-masked types (Destination Unreachable, Source Quench, Time Exceeded, Parameter Problem). ICMPv6 additionally forbids generating an error in response to another error, a multicast packet, or a link-layer broadcast — with two carve-outs: Packet Too Big (so PMTUD works for multicast) and Parameter Problem code 2 (unrecognised IPv6 option).

And ICMP messages are not just informational decoration: RFC 1122 §3.2.2 says hosts **MUST** pass them up to the relevant transport process. When TCP sees an ICMP Port Unreachable, it surfaces `ECONNREFUSED`. When it sees Host Unreachable, it surfaces `EHOSTUNREACH`. The protocol stack only works if those errors actually arrive.

## Where it shows up in production

**Reference implementations.** Linux ships `iputils` for `ping`, `tracepath`, `arping`, and `clockdiff`; the kernel's ICMP processing lives in `net/ipv4/icmp.c` and `net/ipv6/icmp.c`. Windows ships `ping.exe`, `pathping.exe`, and `tracert.exe`, where `tracert` defaults to ICMP-Echo probes rather than the BSD UDP variant. FreeBSD, OpenBSD, and NetBSD `ping(8)` are direct descendants of Mike Muuss's BRL code from 1983. BusyBox `ping` is on essentially every container and embedded device. Power tools — `hping3`, Nmap's `nping`, `mtr`, `fping` — let you craft anything you need. Wireshark dissects ICMP and ICMPv6, including the RFC 4884/5837 multi-part extensions. Scapy lets you build a probe in one line: `sr1(IP(dst="8.8.8.8")/ICMP())`.

**CDN edges.** Cloudflare, Fastly, and Akamai use ICMP for liveness probes against millions of origin IPs. Cloudflare publicly documented its own PMTUD black-hole incident in 2014 — TCP handshakes were completing for 6in4 tunnel users, then HTTP responses were hanging forever because intermediate routers' ICMP Type 3 Code 4 messages were being filtered before reaching Cloudflare's edge. The fix they shipped was RFC 4821 PLPMTUD, which probes path MTU using actual data segments at the TCP layer instead of trusting that ICMP can traverse the path.

**Synthetic monitoring.** Smokeping (open-source, since 1999), Cisco's ThousandEyes, Catchpoint, Pingdom, Datadog Synthetics, and AWS Route 53 health checks all issue ICMP Echo (and TCP-based) probes from globally distributed agents. The Cloudflare 1.1.1.1 resolver explicitly silences non-DNS ports but accepts ICMP Echo for monitoring — a design choice spelled out in the 2017 APNIC Labs / Cloudflare joint research project.

**RIPE Atlas.** Around 12,000 hardware probes worldwide run user-scheduled ping and traceroute measurements. The dataset is the substrate for most academic studies of ICMP reachability and PMTUD black holes — including van den Hout's NLnet Labs master's thesis on PMTU black holes.

**Scale numbers.** Cloudflare's network capacity passed **321 Tbps across 330 cities by end-2024**. In 2024, Cloudflare mitigated **21.3 million DDoS attacks**, a 53% year-over-year jump, with ICMP reflection a recurring (if minority) network-layer vector behind SYN, DNS, UDP, and SSDP. The single biggest mitigated attack of 2024 peaked at **5.6 Tbps** — a Mirai-variant network-layer flood. A 2020 internet-wide measurement study, SMap, found that **69.8% of Autonomous Systems** still do not filter spoofed packets at ingress, the substrate that keeps ICMP and DNS reflection feasible at terabit scale.

## Things that go wrong

**Ping of Death (1996–1997).** A fragmented IPv4 packet whose reassembled length exceeded 65,535 bytes overflowed the reassembly buffers in many TCP/IP stacks — Windows 95 and NT, early Linux and BSD, Cisco IOS, classic Mac. CERT advisory CA-1996-26 went out on 16 December 1996 and OS vendors patched through 1997. The bug class is closed in modern stacks, but the lesson — that fragment reassembly is one of the most critical security paths in any IP stack — survived into 2024 in CVE-2024-38063, a Windows IPv6 fragment integer-underflow disclosed on 13 August 2024, CVSS 9.8, "exploitable from anywhere on the link."

**Smurf attack (1997–1998).** Dan Moschuk, alias TFreak, wrote `smurf.c` in 1997. The trick: send ICMP Echo Requests with a spoofed source address — the victim — to a network's directed broadcast address. Every host on that segment dutifully replies to the victim, amplifying the attacker's bandwidth by the size of the broadcast domain. The first high-profile incident hit the University of Minnesota in 1998. The IETF response was RFC 2644 in August 1999, which changed the default in routers from "forward directed broadcasts" to "drop." That single line of vendor configuration killed Smurf as a vector everywhere — the attack is now a museum piece, but it is the reason directed-broadcast forwarding is off by default on every router shipped this century.

**PMTUD black hole (chronic, since the 1990s, formalised in RFC 2923 in 2000).** Some link on the path has an MTU lower than 1500. The router sends back ICMP Type 3 Code 4. A firewall in the middle drops it. The TCP three-way handshake completes — small packets get through fine — but the first large segment dies silently, and the connection hangs. Standard monitoring shows nothing. We name this one in detail under Things That Go Wrong in the chapter on Failure Modes; what matters here is the mechanism and that the industry's response — RFC 4821 PLPMTUD for TCP, RFC 8899 PLPMTUD for datagrams, RFC 9869 for UDP Options — is essentially "stop trusting that ICMP can reach you."

**CVE-2020-16898 — "Bad Neighbor" (Microsoft, 13 October 2020).** A stack-based buffer overflow in Windows `tcpip.sys`'s parser for ICMPv6 Router Advertisement RDNSS options (Option Type 25). A length value with the low bit set caused the last 8 bytes of the RDNSS option to be misinterpreted as the start of a second option, allowing arbitrary stack writes. CVSSv3 9.8. McAfee and Quarkslab published proof-of-concepts within days. Weaponising it for remote code execution required a separate info-leak, but the CVSS score reflects how exposed the IPv6 plane is when an attacker can put a packet on the local link.

**Recent kernel CVEs (2024–2025).** **CVE-2024-47678** reordered Linux's ICMP rate limits, fixed in late 2024 and shipped in RHEL 9 via RHSA-2025:6966. **CVE-2024-56647** caused an `OOPS`/`ip_rt_bug` panic when an ICMP error path performed a route relookup under XFRM (IPsec) policy — availability impact in multi-tenant hosts, patched upstream and across the major distros. A 2025 NULL-deref in `icmp_tag_validation` triggers when `ip_no_pmtu_disc=3` and the kernel receives an ICMP Fragmentation Needed message quoting an inner protocol with no registered handler. A related 2025 bridge `nd_tbl` NULL-deref hits when booting with `ipv6.disable=1` and using bridge neighbour-suppress. The Linux kernel team became a CVE Numbering Authority on 13 February 2024 and started filing CVEs for almost every networking fix; **3,108 kernel CVEs in 2024** per NIST NVD, a 79% YoY increase, mostly from process change rather than a real spike in bug rate. Production operators should expect an ICMP-tagged kernel CVE roughly monthly and treat it as routine maintenance.

**ICMP Redirect attacks (chronic).** A spoofed Type 5 message convinces a host to route traffic via the attacker. Mitigation is to default to ignoring redirects from anything other than the configured default gateway, and to set `net.ipv4.conf.all.accept_redirects=0` and the IPv6 mirror.

## Common pitfalls (for the practitioner)

- **"Drop all ICMP" firewall rules.** This is the most common production footgun. It kills Path MTU Discovery, breaks NDP if applied to IPv6 link-local, masks routing problems, and on IPv6 it breaks the network outright — RFC 4890 spells out the message types you must allow. The chapter on ICMP frames the standards-purist view of this: dropping ICMP at your border is, in IETF terms, partially refusing to implement IP.
- **Cloud security groups that disable ICMP.** AWS, Azure, and GCP default templates from 2010-era guides routinely dropped all ICMP. At minimum, re-enable Type 3 Code 4 (IPv4 Fragmentation Needed) and ICMPv6 Type 2 (Packet Too Big), or your customers will file tickets weeks later about hung connections behind the VPN gateway.
- **NAT firmware that drops ICMP errors with NAT-translated inner headers.** RFC 5508 (BCP 148) specifies how to translate the embedded inner packet inside the ICMP payload; older NAT firmware often gets it wrong, and the ICMP error never reaches the original sender.
- **Hosts with `icmp_echo_ignore_all=1` for "stealth."** Breaks RFC 1122 strictly speaking; breaks every monitoring system that probes with ping; lights up Cambridge UIS-style "device must answer ping" policy bots.
- **TCP MSS clamping as a workaround when you cannot fix ICMP filtering.** Pragmatic: `iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu`. It works for TCP. It does nothing for UDP, QUIC, or anything else.
- **Blocking ICMPv6 entirely on IPv6 networks.** NDP fails, hosts cannot resolve link-layer addresses, the entire IPv6 plane is dead. RFC 4890 §4.4 lists the message types that must not be dropped: Types 1, 2, 3, 4, 128, 129, 133, 134, 135, 136, 141, 142, 130–132, 143, 148, 149, 151–153.

## Debugging it

**Wireshark filters.** `icmp` and `icmpv6` for everything; `icmp.type == 3 && icmp.code == 4` for IPv4 PMTUD signalling; `icmpv6.type == 2` for ICMPv6 Packet Too Big.

**tcpdump.** `tcpdump -n -i any 'icmp or icmp6'`. The canonical PMTUD expression is `tcpdump -n 'icmp[0]=3 and icmp[1]=4'`.

**Linux sysctls under `/proc/sys/net/`.** `net.ipv4.icmp_ratelimit` (default 1000 ms) is the per-destination minimum spacing for rate-masked errors — lower it to 100 ms when debugging to make errors more visible. `net.ipv4.icmp_ratemask` (default 6168) is the bitmask of types subject to that limit. `net.ipv4.icmp_msgs_per_sec=1000` and `net.ipv4.icmp_msgs_burst=50` are the global cap. `net.ipv4.icmp_echo_ignore_all=0` (leave it that way unless you really want to be invisible). `net.ipv4.icmp_echo_ignore_broadcasts=1` (default — keep it on, or you reintroduce Smurf). `net.ipv4.conf.all.accept_redirects=0` and `net.ipv4.conf.all.secure_redirects=1`, with the IPv6 mirror at `net.ipv6.conf.all.accept_redirects=0`. `net.ipv6.icmp.ratelimit=1000` for the IPv6 side.

**Common debugging moves.** `ping -M do -s 1472 dest` sends an IPv4 don't-fragment probe sized exactly to fill a 1500-byte MTU (1472 payload + 8 ICMP + 20 IP). Repeat with smaller sizes to find the actual PMTU. `traceroute -I` on Linux or `tracert` on Windows uses ICMP Echo, which often gets through where the BSD UDP variant is filtered. `mtr` interleaves ping and traceroute with packet-loss bookkeeping — the right first call when the question is "is it slow or broken?"

**Counters to monitor in production.** Type 3 Code 4 ("Fragmentation Needed") rates, both received and silently dropped, are the early indicator of PMTUD activity and PMTUD failure. Type 11 Code 0 ("TTL exceeded in transit") at high rate without a corresponding traceroute often means a routing loop. ICMP error-rate spikes on Type 3 unreachable, Type 11 expired, or Type 5 redirect are an early signal of routing instability or scanning activity.

## What's changing in 2026

- **November 2025 — `draft-ali-6man-srv6-vpn-icmp-error-handling-02` (Cisco/Juniper).** Specifies how SRv6 VPN deployments should generate, translate, and propagate ICMP errors across encapsulation boundaries — the latest answer to the perennial "tunnels reduce MTU and PMTUD breaks" problem.
- **December 2025 — `draft-ietf-6man-icmpv6-reflection-19`.** A stateless probe-and-reflect ICMPv6 diagnostic utility, currently active in 6man.
- **August 2025 — `draft-ietf-intarea-extended-icmp-nodeid-04` (Arista).** Adds an originating-node identifier to ICMP errors, useful in IPv6-only or unnumbered-interface environments where the responding interface has no IPv4 address for traceroute to land on.
- **February 2025 — `draft-xu-intarea-challenge-icmpv4-02` (Tsinghua).** Proposes a challenge-confirm scheme using IP options so receivers can verify a router actually saw the original packet. Companion problem statement `draft-xu-intarea-vulnerabilities-forged-icmp-01` published November 2025. The most concrete proposal in years to fix ICMP's "anyone-can-spoof-any-error" weakness.
- **Late 2024 — Linux kernel ICMP CVEs.** CVE-2024-47678 reorders ICMP rate limits; CVE-2024-56647 fixes the `ip_rt_bug` panic on ICMP relookup under XFRM. Shipped through RHEL 9 in RHSA-2025:6966 and the equivalent Ubuntu/Debian trees.
- **September 2020, mainstreaming through 2024–2026 — RFC 8899 Datagram PLPMTUD.** QUIC, SCTP, and modern UDP applications use Packetization Layer PMTUD instead of classical ICMP-driven PMTUD. RFC 9869 extends it to UDP Options. The trajectory is a quiet demotion of classical PMTUD across the transport stack, driven by the operational reality that ICMP cannot be trusted to traverse the public internet.
- **April 2023 — RFC 9359.** Echo Request/Reply for Enabled In Situ OAM Capabilities — a generic format usable in ICMPv6, LSP Ping, and BIER Ping.
- **What is *not* changing.** RFC 792 itself, and RFC 4443 (ICMPv6, STD 89, March 2006). The wire format and message-type semantics are stable, with no RFC-792-bis or RFC-4443-bis on the table. ICMP is in maintenance mode at the core and innovation-only at the extension-object layer.

## Fun facts (host material)

**Ping is named after sonar — not an acronym.** Mike Muuss said so explicitly: "I named it after the sound that sonar makes, inspired by the whole principle of echo-location." The "Packet INternet Groper" backronym is folk etymology that Muuss himself called out as a myth. The right mental image is a submarine pinging the seabed, not a network engineer typing initials.

**The night `ping` was born.** December 1983, Aberdeen Proving Ground, Maryland. Mike Muuss had heard Dave Mills describe his Fuzzball LSI-11 latency-timing experiments at a meeting in Norway. Back at BRL he hit weird IP behaviour, sat down, wrote `ping`, discovered there was no kernel raw-ICMP socket support in BSD, **wrote that too**, and "had everything working well before sunrise." His colleague Chuck "Kermit" Kennedy then diagnosed and fixed the underlying network hardware before Muuss could send the first ping packet.

**Mike Muuss died on Interstate 95 on 20 November 2000**, age 42, at the height of his career as a senior scientist at the U.S. Army Research Laboratory. He also coined the terms "default route" and "default gateway." `ping` itself is now in essentially every operating system shipped, and Berkeley adopted his BSD kernel patches into 4.3BSD; USENIX gave him a Lifetime Achievement "Flame" in 1993.

**ICMP's parent was a routing protocol.** The Gateway-to-Gateway Protocol — RFC 823, September 1982 — was a min-hop distance-vector protocol on BBN's LSI-11 gateways. Postel needed a way for those gateways to talk *to source hosts*, not just to each other, so he carved ICMP out of GGP. GGP itself was the predecessor of EGP (1984) and the grand-uncle of BGP. The diagnostic protocol is older than the routing protocol it grew up next to.

**RFC 1149 — IP datagrams on avian carriers (1 April 1990).** Bergen Linux User Group **actually implemented it in 2001**, achieving 9 packets, 55% loss, and response times between 3,000 and 6,000 seconds. RFC 2549 (1999) added QoS; RFC 6214 (2011) adapted IPoAC for IPv6. The ICMP implications: a Destination Unreachable when a hawk eats the carrier.

**"Give me one ping, Vasily. One ping only, please."** *The Hunt for Red October*, 1990. That scene captures exactly what `ping -c 1` does. Network engineers love it.

## Where this connects in the book

- **Foundations / "The Layer Model"** — where ICMP sits in the seven-layer scaffold and why "control protocol that is considered to be an integral part of IP" is a deliberate architectural choice rather than sloppy layering.
- **Story of the Internet / "The 1981–83 Standardisation Burst"** — the three RFCs Postel shipped in September 1981 (791, 792, 793), the 1 January 1983 ARPANET flag day, and how splitting ICMP off from GGP locked in the diagnostic backplane for the next forty-five years.
- **Layer 2–3 / "ARP and NDP"** — how IPv6 absorbed ARP and ICMP Router Discovery into NDP (Types 133–137 of ICMPv6), why CVE-2020-16898 "Bad Neighbor" and CVE-2024-38063 belong in the same lineage, and why SEND (RFC 3971) remains stillborn in 2026.
- **Layer 2–3 / "ICMP"** — the chapter episode for the Mike Muuss origin story, the Ping of Death / Smurf / PMTUD trio of attacks, and the 2024 kernel CVE wave; this protocol blueprint defers the storytelling to that chapter.
- **Patterns and Failures / "Failure Modes"** — where the MTU black hole is named alongside bufferbloat, head-of-line blocking, microloops, and cascading failures, with the unifying observation that "naming the failure modes is most of the diagnosis."

## See also (other protocol episodes)

If you've heard the **DNS** episode, the contrast is the diagnostic workflow: DNS answers "what is this name?" and ICMP answers "can I reach it?" Network troubleshooting almost always starts with `dig` or `host` and then verifies with `ping`. If DNS succeeds and ICMP fails, the problem is routing or firewalls. If DNS fails, the problem is name resolution. ICMP can also surface a Destination Unreachable when the DNS server itself is down.

The **TCP** episode explains why TCP cares about ICMP at all. TCP ignored Source Quench even before RFC 6633 deprecated it. But TCP **does** rely on ICMP for two things: PMTUD, which feeds the maximum segment size, and connection-failure feedback (Destination Unreachable surfaces as `ECONNREFUSED` or `EHOSTUNREACH`). TCP also has its own protections against forged ICMP errors via the sequence-number checks in RFC 5927; CVE-2024-56647 was the most recent reminder that the TCP/IPsec interaction with ICMP relookup is still a place bugs can hide.

The **UDP** episode is where traceroute lives in its classical Van Jacobson form: UDP probes with low TTL, ICMP Time Exceeded replies coming back. UDP-based applications such as QUIC then have to do their own PMTUD — which is why RFC 8899 PLPMTUD exists and why QUIC deliberately chose not to depend on ICMP-driven PMTUD.

The **IPv4** and **IPv6** episodes set up why ICMP's relationship with each is so different. ICMPv4 is IPv4's optional-but-essential diagnostic companion; if you blackhole it, IPv4 still mostly works. ICMPv6 is *not* optional. NDP, Router Solicitation/Advertisement, SLAAC, PMTUD, and MLD are all carried as ICMPv6 message types. IPv6 literally cannot function without ICMPv6 reaching every host on every link. RFC 4890 spells out the consequence: "overly aggressive filtering of ICMPv6 by firewalls may have a detrimental effect on the establishment and maintenance of IPv6 communications."

The **ARP** episode rounds out the picture. ARP is an L2.5 protocol with its own EtherType (0x0806), not part of ICMP. In IPv6, the ARP function moved bodily into ICMPv6 as Neighbor Solicitation (Type 135) and Neighbor Advertisement (Type 136), using solicited-node multicast rather than broadcast. The ARP episode also covers the operational footguns — AWS not running ARP at all inside a VPC, Linux's `gc_thresh3=1024` quietly dropping traffic at scale — that ICMP itself does not generate.

## Visual cues for image generation

- An illustrated 4-byte ICMP header — Type and Code as one byte each in distinct colours, then a 16-bit checksum, then the type-specific 4-byte field. Below it, the "quoted" inner IP header plus first 8 bytes of payload that error messages echo back.
- A traceroute sequence diagram with three columns: source, two intermediate routers, destination. TTL=1 probe gets dropped at hop 1 with an ICMP Type 11 reply; TTL=2 reaches hop 2 with another Type 11; TTL=3 lands at the destination with a Type 3 Code 3 Port Unreachable. Each reply labelled with its source IP and elapsed RTT.
- A Path MTU Discovery cartoon. Source on the left with MTU 1500, a router in the middle with a 1400-byte next-hop, destination on the right. A 1500-byte packet with DF=1 hits the router; the router answers with ICMP Type 3 Code 4, "Next-Hop MTU=1400"; the source caches PMTU(D)=1400 and resends. Beside it, the failure case: the ICMP reply gets dropped by a firewall, and the source retries the 1500-byte packet forever — a black hole.
- A historical line chart — September 1981 RFC 792, December 1983 ping written, RFC 1191 PMTUD in 1990, RFC 4443 ICMPv6 in 2006, RFC 6633 deprecating Source Quench in 2012, RFC 8899 PLPMTUD in 2020. Each milestone annotated with one sentence.
- A schematic of the IPv6 stack labelled "Why ICMPv6 is not optional": arrows from ICMPv6 to NDP (replaces ARP), to Router Advertisement (enables SLAAC), to Packet Too Big (PMTUD), to MLD (multicast). Each one a function IPv6 cannot perform if the firewall drops ICMPv6.
- A Smurf-attack diagram: attacker on the left, spoofed source = victim, packets aimed at a network's directed broadcast address; every host on that segment replies to the victim, amplifying the flood. Annotated with "RFC 2644, August 1999 — directed broadcasts off by default."

## Sources

### RFCs

- [RFC 792 — Internet Control Message Protocol (STD 5)](https://www.rfc-editor.org/rfc/rfc792.html)
- [RFC 1071 — Computing the Internet Checksum](https://datatracker.ietf.org/doc/html/rfc1071)
- [RFC 1122 — Requirements for Internet Hosts](https://datatracker.ietf.org/doc/html/rfc1122)
- [RFC 1191 — Path MTU Discovery (IPv4)](https://datatracker.ietf.org/doc/html/rfc1191)
- [RFC 1256 — ICMP Router Discovery Messages](https://datatracker.ietf.org/doc/rfc1256/)
- [RFC 4443 — ICMPv6 (STD 89)](https://datatracker.ietf.org/doc/html/rfc4443)
- [RFC 4861 — Neighbor Discovery for IPv6](https://datatracker.ietf.org/doc/html/rfc4861)
- [RFC 4884 — Extended ICMP to Support Multi-Part Messages](https://datatracker.ietf.org/doc/html/rfc4884)
- [RFC 4890 — Recommendations for Filtering ICMPv6 in Firewalls](https://www.rfc-editor.org/rfc/rfc4890.html)
- [RFC 4950 — ICMP Extensions for MPLS](https://www.rfc-editor.org/rfc/rfc4950.html)
- [RFC 5508 — NAT Behavioral Requirements for ICMP (BCP 148)](https://datatracker.ietf.org/doc/rfc5508/)
- [RFC 6633 — Deprecation of ICMP Source Quench](https://www.rfc-editor.org/rfc/rfc6633.html)
- [RFC 8201 — Path MTU Discovery for IPv6 (STD 87)](https://datatracker.ietf.org/doc/html/rfc8201)
- [RFC 8899 — Datagram PLPMTUD](https://datatracker.ietf.org/doc/rfc8899/)
- [RFC 9359 — Echo Request/Reply for IOAM Capabilities](https://datatracker.ietf.org/doc/rfc9359/)
- [RFC 823 — Gateway-to-Gateway Protocol](https://datatracker.ietf.org/doc/html/rfc823)
- [RFC 2923 — TCP Problems with Path MTU Discovery](https://datatracker.ietf.org/doc/html/rfc2923)
- [RFC 9869 — Datagram PLPMTUD for UDP Options](https://datatracker.ietf.org/doc/rfc9869/)
- [draft-ietf-6man-icmpv6-reflection](https://datatracker.ietf.org/doc/draft-ietf-6man-icmpv6-reflection/)
- [draft-ietf-intarea-extended-icmp-nodeid](https://datatracker.ietf.org/doc/draft-ietf-intarea-extended-icmp-nodeid/)
- [draft-xu-intarea-challenge-icmpv4-02](https://datatracker.ietf.org/doc/html/draft-xu-intarea-challenge-icmpv4-02)
- [draft-xu-intarea-vulnerabilities-forged-icmp](https://datatracker.ietf.org/doc/draft-xu-intarea-vulnerabilities-forged-icmp/)
- [draft-ali-6man-srv6-vpn-icmp-error-handling](https://datatracker.ietf.org/doc/draft-ali-6man-srv6-vpn-icmp-error-handling/)
- [IANA — ICMP Type Numbers](https://www.iana.org/assignments/icmp-parameters)
- [IANA — ICMPv6 Parameters](https://www.iana.org/assignments/icmpv6-parameters)

### Papers

- [SMap — Internet-wide Scanning for Spoofing (Dai & Shulman, 2020)](https://arxiv.org/pdf/2003.05813)
- [Discovering Path MTU black holes on the Internet (van den Hout, NLnet Labs)](https://nlnetlabs.nl/downloads/publications/pmtu-black-holes-msc-thesis.pdf)
- [APNIC / Cloudflare 1.1.1.1 long-term joint research project (2017)](https://www.apnic.net/wp-content/uploads/2018/04/APNIC-Cloudflare-Long-Term-Joint-Research-Project-2017.pdf)

### Vendor and engineering blogs

- [Mike Muuss — The Story of the PING Program](https://ftp.arl.mil/mike/ping.html)
- [Cloudflare — Path MTU discovery in practice (2014)](https://blog.cloudflare.com/path-mtu-discovery-in-practice/)
- [Cloudflare — DDoS threat report 2024 Q4](https://blog.cloudflare.com/ddos-threat-report-for-2024-q4/)
- [Cloudflare Radar — DDoS 2024 Q3](https://radar.cloudflare.com/reports/ddos-2024-q3)
- [Cloudflare Learning — Ping (ICMP) flood DDoS attack](https://www.cloudflare.com/learning/ddos/ping-icmp-flood-ddos-attack/)
- [Quarkslab — Bad Neighbor (CVE-2020-16898) analysis](https://blog.quarkslab.com/beware-the-bad-neighbor-analysis-and-poc-of-the-windows-ipv6-router-advertisement-vulnerability-cve-2020-16898.html)
- [Rapid7 — There goes the neighborhood (CVE-2020-16898)](https://www.rapid7.com/blog/post/2020/10/14/there-goes-the-neighborhood-dealing-with-cve-2020-16898-a-k-a-bad-neighbor/)
- [Red Hat — RHSA-2025:6966 (CVE-2024-47678)](https://access.redhat.com/errata/RHSA-2025:6966)
- [Windows Forum — CVE-2024-56647 ICMP relookup ip_rt_bug](https://windowsforum.com/threads/linux-kernel-cve-2024-56647-icmp-relookup-bug-triggers-ip_rt_bug.392721/)
- [APNIC blog — Congestion Control at IETF 110 (Mar 2021)](https://blog.apnic.net/2021/03/30/congestion-control-at-ietf-110/)
- [APNIC blog — Cloudflare measures TCP (Jan 2026)](https://blog.apnic.net/2026/01/12/cloudflare-measures-tcp/)
- [Stonecharioteer — Building traceroute in Rust (2026)](https://tech.stonecharioteer.com/posts/2026/traceroute/)
- [CMU SEI — Filtering ICMPv6 Using Host-Based Firewalls](https://www.sei.cmu.edu/blog/filtering-icmpv6-using-host-based-firewalls/)
- [Coding Horror — The Story About PING](https://blog.codinghorror.com/the-story-about-ping/)
- [NetCraftsmen — The history of ping](https://netcraftsmen.com/the-history-of-ping/)
- [Cisco Community — PMTUD blackhole](https://community.cisco.com/t5/collaboration-knowledge-base/pmtud-blackhole/ta-p/3115561)
- [Linux kernel — ip-sysctl.txt](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt)
- [man7 — icmp(7)](https://man7.org/linux/man-pages/man7/icmp.7.html)
- [iputils on GitHub](https://github.com/iputils/iputils)
- [Linux kernel — net/ipv4/icmp.c](https://github.com/torvalds/linux/blob/master/net/ipv4/icmp.c)
- [Scapy on GitHub](https://github.com/secdev/scapy)
- [CIQ — Linux kernel CVEs in 2025](https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/)
- [Stack.watch — Linux kernel](https://stack.watch/product/linux/linux-kernel/)

### News and reference

- [CISA — HTTP/2 Rapid Reset (CVE-2023-44487)](https://www.cisa.gov/news-events/alerts/2023/10/10/http2-rapid-reset-vulnerability-cve-2023-44487)
- [Cambridge UIS — Ping policy](https://help.uis.cam.ac.uk/policies/governance-and-policy-documents/rules-and-guidelines/network-use/ping)
- [Ubuntu wiki — Improved networking kernel security settings](https://wiki.ubuntu.com/ImprovedNetworking/KernelSecuritySettings)
- [Imperva — Ping of Death](https://www.imperva.com/learn/ddos/ping-of-death/)

### Wikipedia

- [Internet Control Message Protocol](https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol)
- [ICMPv6](https://en.wikipedia.org/wiki/ICMPv6)
- [Neighbor Discovery Protocol](https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol)
- [Internet checksum](https://en.wikipedia.org/wiki/Internet_checksum)
- [Mike Muuss](https://en.wikipedia.org/wiki/Mike_Muuss)
- [Jon Postel](https://en.wikipedia.org/wiki/Jon_Postel)
- [Smurf attack](https://en.wikipedia.org/wiki/Smurf_attack)
- [IP over Avian Carriers](https://en.wikipedia.org/wiki/IP_over_Avian_Carriers)
- [OSI model](https://en.wikipedia.org/wiki/OSI_model)
- [Secure Neighbor Discovery](https://en.wikipedia.org/wiki/Secure_Neighbor_Discovery)
