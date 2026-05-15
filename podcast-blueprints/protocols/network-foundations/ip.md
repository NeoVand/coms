---
id: ip
type: protocol
name: Internet Protocol
abbreviation: IPv4
etymology: "[I]nternet [P]rotocol"
category: network-foundations
year: 1981
rfc: RFC 791
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - foundations/addressing
  - foundations/packets
  - foundations/ports-sockets
  - foundations/reliability-speed
  - foundations/client-server-p2p
  - story-of-the-internet/before-the-internet
  - story-of-the-internet/the-1981-burst
  - story-of-the-internet/the-web-arrives
  - story-of-the-internet/the-quic-redesign
  - layer-2-3/arp-and-ndp
  - layer-2-3/ipv4
  - layer-2-3/ipv6
  - layer-2-3/icmp
  - layer-2-3/bgp
  - transport/tcp
  - transport/udp
  - transport/sctp
  - transport/quic
  - wireless/the-shared-medium
  - web-api/http3
  - web-api/mcp-and-a2a
  - async-iot/kafka
  - realtime-av/webrtc
  - utilities-security/ntp
  - utilities-security/email-stack
  - patterns-failures/patterns
  - patterns-failures/failure-modes
  - famous-outages/as-7007-1997
  - famous-outages/mitnick-1994
  - famous-outages/china-telecom-2010
  - famous-outages/sack-panic-2019
  - famous-outages/facebook-2021
  - famous-outages/rogers-2022
  - frontier/l4s-everywhere
  - frontier/ipv6-mostly
  - frontier/rpki-aspa
  - frontier/ultra-ethernet
  - how-to-learn-more/books
  - how-to-learn-more/courses
related_protocols: [tcp, udp, ethernet, arp, dns, wifi, ipv6, ospf, ipsec, nat-traversal, icmp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [791, 1122, 1812, 1071, 2474, 3168, 4632, 6864, 6890, 6274, 8200]
related_journeys: [url-bar, wire-to-web]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/IPv4_Packet-en.svg/500px-IPv4_Packet-en.svg.png
    caption: The IPv4 packet header — every packet on the internet carries this 20-byte structure. Key fields include TTL (decremented by each router to prevent loops), Protocol (6 for TCP, 17 for UDP), and the source and destination addresses that make global routing possible.
    credit: Image — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "An annotated IPv4 header — six 32-bit rows. Version and IHL nibbles on the first row in one colour, DSCP and ECN in another, total length on the right. TTL and Protocol on row three, header checksum next to them. Source and destination addresses occupy their own rows in a contrasting colour."
  - "A hop-by-hop diagram of a packet crossing three routers — TTL counter ticking down 64, 63, 62, 61 — with the source and destination IP addresses unchanged across every hop, but the source and destination MAC addresses rewritten on each link."
  - "A side-by-side: a 1981 Class A/B/C diagram next to a 1993 CIDR variable-prefix diagram, with arrows showing how the routing table collapsed from 70,000 to 20,000 entries after CIDR landed."
  - "A timeline of IPv4 exhaustion, dated and labelled — IANA February 2011, APNIC April 2011, RIPE September 2012, LACNIC June 2014, ARIN September 2015, AFRINIC April 2017 — with the AWS $0.005-per-IP-per-hour line item appearing as a vertical mark on 1 February 2024."
  - "Two queues at a router — the classic queue with packets piled deep and a sub-millisecond L4S queue isolated next to it. ECT(1) packets stream into the L4S queue and get marked early, while CUBIC and Reno packets cycle in the larger queue. A DOCSIS 4.0 cable modem sits at the top of the diagram."
  - "A Pakistan-Telecom-to-PCCW BGP announcement spreading across the global routing table at 18:47 UTC on 24 February 2008 — every router on the planet preferring the more-specific /24 toward Karachi instead of YouTube's legitimate /22. Two-hour blackout, recovered through de-aggregation to two /25s."
---

# IPv4 — Internet Protocol

## In one breath

IPv4 is the addressing system of the internet. Every device gets a 32-bit number; every packet gets a source and a destination; routers forward those packets hop by hop until they arrive — best effort, no guarantees, no connections. It is a 1981 specification that was supposed to be a research experiment, that crossed exhaustion in 2011, that AWS now charges five-tenths of a cent per address per hour to use, and that still carries roughly half of all internet traffic in 2026 — the other half having finally tipped onto IPv6.

## The pitch

Vint Cerf has called the 32-bit address field the most regrettable design decision he ever made. He picked it in 1977 for what he expected to be an experiment that would be replaced before it had a million hosts. Forty-five years later, that 32-bit number is still the unit of identity on the internet, the IPv4 secondary market peaked at $60 per address, AWS now charges $43.80 a year for one, and a /14 block transferred at $9 per address in January 2026 because IPv6 is finally taking on real traffic. This episode is about what is in the IPv4 header today, where it actually runs in production, what breaks, and what is changing as the long-promised v6 transition crosses 50% on Google's measurement.

## How it actually works

A packet is constructed at the sender, handed down the stack, framed at the link layer, and pushed onto the wire toward the next hop. Every router along the way does the same three things: examine the destination address, decrement the time-to-live by one, look up the next hop in its routing table, re-encapsulate the packet in a fresh link-layer frame, and forward it. The source and destination IP addresses never change end-to-end. The link-layer addresses change at every hop. That separation — Layer 3 end-to-end, Layer 2 hop-by-hop — is the core insight of the protocol.

The simulator on this protocol's page walks through it concretely. A host on 192.168.1.0/24 wants to reach 93.184.216.34. The destination is not on the local subnet, so the host addresses the Ethernet frame to the router's MAC but leaves the IP destination set to the remote address. The router strips the Ethernet frame, examines the IP header, decrements TTL from 64 to 63, recomputes the header checksum because TTL changed, and re-encapsulates in a brand-new Ethernet frame for the next link with new source and destination MACs. The destination eventually checks that the packet's destination IP matches its own, reads the Protocol field — 6 for TCP, 17 for UDP, 1 for ICMP — and delivers the payload upward.

### Header at a glance

The IPv4 header is **20 bytes minimum, 60 bytes maximum**, and every router on the path inspects it.

- **Version (4 bits)** — always `0100` for IPv4.
- **IHL (4 bits)** — header length in 32-bit words. Five means 20 bytes; fifteen means 60 bytes with options.
- **DSCP (6 bits) plus ECN (2 bits)** — the old eight-bit Type-of-Service byte was redefined in December 1998 (RFC 2474) as Differentiated Services Code Point plus Explicit Congestion Notification (RFC 3168, September 2001). DSCP picks per-hop forwarding behaviour — Expedited Forwarding for voice, Assured Forwarding for video, default for best-effort. ECN's `01` and `10` say "I support ECN"; `11` says "I experienced congestion."
- **Total Length (16 bits)** — entire datagram in bytes, capped at 65,535.
- **Identification (16 bits)** — set by the sender, used only when fragments need to be reassembled. RFC 6864 (February 2013) relaxed the original uniqueness rule for atomic datagrams, retroactively legalising what every implementation already did at high speed.
- **Flags (3 bits)** — bit 0 reserved (the famous "evil bit" of RFC 3514, Steve Bellovin's 1 April 2003 joke that someone in broadcast IP-rights enforcement actually emailed Bellovin about). Bit 1 is Don't Fragment. Bit 2 is More Fragments.
- **Fragment Offset (13 bits)** — in 8-byte units, allowing offsets up to 65,528 bytes.
- **TTL (8 bits)** — originally seconds, now decremented per hop. Zero means drop the packet and send back ICMP Time Exceeded — the mechanism `traceroute` exploits by varying TTL from 1 upward.
- **Protocol (8 bits)** — the next-header demultiplexer. 1 is ICMP, 2 is IGMP, 6 is TCP, 17 is UDP, 41 is IPv6 encapsulation, 47 is GRE, 50 is ESP, 51 is AH, 89 is OSPF, 132 is SCTP. The full list lives at IANA.
- **Header Checksum (16 bits)** — RFC 1071 one's-complement sum over the header only. Recomputed at every router because TTL changes on every hop.
- **Source and Destination Addresses (32 bits each)** — dotted-quad.
- **Options plus padding** — rarely used in production. Most networks drop or de-prioritise packets with options for performance and security; Source Route, Record Route, and Timestamp are particularly suspect.

### State machine in three sentences

IPv4 is **connectionless** — there is no state machine. Every datagram is independent, addressed, and forwarded on its own merits. State lives in the layers above (TCP keeps a connection state machine), in the routers (which carry routing tables built by BGP, OSPF, and IS-IS), and in the link-layer caches (ARP entries, DHCP leases) — but the IP layer itself simply forwards each packet to its next hop and forgets about it.

### Reliability and fragmentation mechanics

There is no reliability. IPv4 makes no guarantees about delivery, ordering, integrity, or duplication. TCP layers reliability on top; UDP adds nothing and that is the point.

The one mechanism IPv4 does have for adapting to the network is **fragmentation**. A router with outbound MTU 1500 receiving a 4000-byte datagram with Don't Fragment cleared splits the payload into chunks of `(MTU − IHL × 4)` rounded down to multiples of 8 octets. It copies the original header into each fragment, sets More Fragments on all but the last, sets Fragment Offset accordingly, recomputes Total Length and Header Checksum, and forwards. The receiver buffers fragments keyed by `(source, destination, protocol, identification)`, runs a 60-second reassembly timer per RFC 1122, and either reassembles or drops on timeout. If Don't Fragment is set and the datagram is too big, the router drops it and returns ICMP Type 3 Code 4 — "Fragmentation Needed" — with the next-hop MTU. That is Path MTU Discovery, and when the ICMP gets filtered by some firewall in the middle, you get the MTU black hole that hangs every TCP handshake larger than the path.

There is **no security model**. RFC 791 has no authentication, no integrity protection, no confidentiality. RFC 6274 is the IETF's 2011 security assessment of IPv4, and the answer is "everything is vulnerable, that is what TLS and IPsec exist for."

## Where it shows up in production

**Linux** is the workhorse stack. The directory `net/ipv4/` is where the kernel implements forwarding; recent additions include BIG TCP for IPv4 in kernel 6.3 (April 2023, broadly deployed in 2024), allowing TSO and GRO superpackets above 64 KB on 100 and 200 Gb NICs and lifting per-flow throughput dramatically. The same tree carries MPTCP and rich XDP/eBPF hooks for line-rate packet handling.

**Netflix** runs FreeBSD descendants of the original 4.4BSD stack on its Open Connect appliances — the BSD lineage is also the source of the Berkeley sockets API every other operating system reimplemented. **Windows 11 and Server 2025** still inherit the dual IPv4/IPv6 "Next-Generation TCP/IP Stack" Microsoft rewrote for Vista in 2006.

**Cisco IOS, IOS XE, IOS XR, and NX-OS** carry the bulk of enterprise and carrier IPv4 routing. **Juniper Junos**, with a FreeBSD-derived control plane, dominates Tier-1 backbones.

**Userspace fast paths** matter at the high end. **DPDK** on Intel E810 NICs hits 14.88 million packets per second per core at 10 GbE and scales to roughly 148 Mpps at 100 GbE on eight cores. A 2025 measurement on AMD EPYC 9005 with 100 GbE Intel E810 found that a single Linux process saturates around 25 Gbps while DPDK reaches near line rate on one core. VPP/FD.io, mTCP, F-Stack, and Snabb are the other names you see in this neighbourhood.

**Embedded stacks** — lwIP on STM32 and ESP32, picoTCP, Adam Dunkels' uIP — are how IPv4 ends up running in countless devices that have no business running an operating system.

**AWS** owns about 1.7% of the entire IPv4 address space — roughly 100 million addresses. Since 1 February 2024 it charges $0.005 per public IPv4 address per hour, $43.80 a year, attached or not. Cloudflare estimated this as a roughly $2 billion "tax on the internet" and built its blog post around it. **Cloudflare** itself runs anycasted IPv4 prefixes from 300-plus cities and publicly mitigated DDoS attacks up to 31.4 Tbps in Q4 2025.

**Carrier-Grade NAT** is now standard in mobile and most wireline ISPs, using 100.64.0.0/10 per RFC 6598. The operational issues are port exhaustion at 64,512 ephemeral ports per public IP per protocol, conntrack table sizing on Linux gateways (`nf_conntrack_max`), and broken inbound connectivity for self-hosters and STUN-dependent applications.

**The default-free zone** crossed **1,000,000 IPv4 prefixes in September 2025**, advertised by roughly 46,800 originating ASNs, growing by about 44,000 entries year-over-year — about 2%.

## Things that go wrong

**Ping of Death (1996–1997).** Oversized fragmented ICMP packets that, when reassembled, exceeded 65,535 bytes and crashed Windows 95/NT, early Linux/BSD, Cisco IOS, and the classic Mac. CERT advisory CA-1996-26 on 16 December 1996. Modern stacks check total length before reassembly, but the lesson — that fragment reassembly is one of the most security-critical paths in any IP stack — was reinforced in August 2018 with **FragmentSmack** (CVE-2018-5391) and **SegmentSmack** (CVE-2018-5390), where Linux's fragment reassembly degenerated into a worst-case linked-list traversal under crafted random offsets, saturating CPU at 30,000 packets per second. Patched by switching to rb-tree reassembly and tightening memory limits.

**Smurf and Teardrop and LAND (late 1990s).** Teardrop sent overlapping fragments to crash reassembly logic; LAND sent packets with source equal to destination for a loopback denial-of-service; Smurf used directed broadcast amplification of ICMP Echo. RFC 2644 in August 1999 made directed-broadcast forwarding off by default in routers, which is why Smurf is now a museum piece.

**SQL Slammer / Sapphire (25 January 2003).** A 376-byte UDP/IPv4 worm — 404 bytes on the wire including headers — doubled in infected hosts every 8.5 seconds and infected roughly 75,000 vulnerable Microsoft SQL Server hosts in ten minutes, crashing routers worldwide. It demonstrated that IPv4's connectionless UDP path could be weaponised at the speed of light.

**AS 7007 incident (25 April 1997).** A small Florida ISP, MAI Network Services, leaked the entire BGP table back as more-specific /24s; tens of thousands of routes funnelled toward AS 7007's tiny edge router. The internet was unreachable for over an hour while every upstream installed manual filters. The chapter on AS 7007 1997 is the full story.

**Pakistan Telecom YouTube hijack (24 February 2008).** PTCL announced 208.65.153.0/24 — a more-specific of YouTube's announced 208.65.152.0/22 — to internally null-route YouTube. PCCW Global propagated the route globally. At 18:47 UTC, the more-specific /24 floods every router; longest-prefix wins, so the world sends YouTube traffic to Karachi for two hours. YouTube clawed back transit by announcing the /24 themselves and de-aggregating into two /25s. The aftermath drove the multi-decade RPKI work.

**Spamhaus DDoS (March 2013).** A DNS amplification attack reached around 300 Gbps — the largest ever publicly reported at the time — launched by CyberBunker and STOPhaus and mitigated by Cloudflare anycast and Tier-1 cooperation. Root cause was open DNS resolvers plus IPv4 source-address spoofing not blocked by BCP38.

**Mirai / Dyn (October 2016).** A 1.1 Tbps IoT-botnet attack on OVH that later took out Dyn DNS and much of the US East Coast internet. Showed that IPv4 plus default IoT credentials equals systemic risk.

**GitHub memcached DDoS (28 February 2018).** 1.35 Tbps using memcached UDP/11211 reflection with up to 51,000× amplification; mitigated by Akamai Prolexic in about ten minutes.

**Facebook outage (4 October 2021).** A backbone-maintenance script ran a command that withdrew Facebook's BGP advertisements for the prefixes carrying their own authoritative DNS, taking facebook.com, instagram.com, and WhatsApp offline globally for six hours. Engineers could not reach their own infrastructure remotely; badge readers at the data centres failed because the authentication system had also gone away. The chapter on Facebook 2021 walks through every cascade step.

**Rogers Communications outage (8 July 2022).** A misconfiguration during a planned maintenance update — removal of an ACL filter on a distribution router — redistributed the full BGP table into OSPF, overloading core router CPU and RAM. 12 million Canadian subscribers lost internet, mobile, landline, Interac debit, and 911 service. The CRTC's 2024 Xona Partners report is the canonical post-mortem. The chapter on Rogers 2022 is where the regulatory aftermath gets unpacked.

**Cloudflare DDoS records, 2024–2025.** Hyper-volumetric attacks scaled 700% year-over-year, peaking at **31.4 Tbps** for a 35-second burst in December 2025, launched by the Aisuru-Kimwolf Android-TV botnet. Cloudflare blocked 47.1 million attacks in 2025; almost all rode IPv4.

## Common pitfalls (for the practitioner)

**Avoid in-network fragmentation.** RFC 6864 and operational experience converge: emit Don't-Fragment atomic datagrams and let TCP MSS or application-level chunking handle path fit. CGNATs, link aggregation groups, and many middleboxes mishandle fragments.

**Path MTU Discovery black holes** are caused by middleboxes that drop ICMP Type 3 Code 4. Symptoms: TLS handshakes complete, then the larger response packets vanish and the connection hangs forever. Mitigations are TCP MSS clamping at the firewall (`iptables ... -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu`) or RFC 4821 Packetisation Layer PMTUD that probes from the application layer instead of relying on routers to send ICMP back.

**TCP MSS clamping** is standard on every consumer router for PPPoE (1492 byte MTU) and is essential on any tunnel — Wireguard at 1420, IPsec ESP transport-mode at around 1438. Without clamping, large segments arrive with Don't Fragment set, the tunnel drops them, the resulting ICMPs disappear, and connections stall.

**CGNAT port exhaustion.** Roughly 64,512 ephemeral ports per public IP per protocol. A subscriber making thousands of concurrent connections — a torrent client, a noisy IoT camera — can exhaust the carrier's pool and break the next user's apps.

**Stale bogon filters** block newly-allocated prefixes — a recurring failure mode for small ISPs after a RIR de-bogonises an address block.

**RFC 1918 leaks into BGP.** When BCP38 / RFC 3704 ingress filtering is missing, private addresses spill onto the public internet, breaking everyone's traceroute and creating phantom unreachable destinations.

**Asymmetric routing breaks stateful firewalls and breaks `rp_filter=1`.** A packet leaves on one path, returns on another; the firewall has no state for the inbound flow and drops it. The cure is either route symmetry, weakened reverse-path filtering, or stateless firewall rules.

**NAT hairpinning failures** — clients can't reach their own public IP from inside their own network — bite every developer testing inbound connectivity for the first time.

## Debugging it

**`tcpdump -nn -i eth0 'icmp[icmptype]==icmp-unreach'`** catches Path MTU Discovery signals.
**`tcpdump -nn -i eth0 '(ip[6:2] & 0x3fff) != 0'`** shows fragments.
**`mtr --tcp -P 443 host`** diagnoses asymmetric paths and per-hop loss.
**`traceroute -F -M 1500 host`** finds the MTU-limiting hop.
**`conntrack -L | wc -l`** sizes CGNAT and firewall tables.
**`ss -intp`** shows live TCP state and congestion-control variables for every socket on the box.

The Linux sysctls that matter on a forwarding host: `net.ipv4.ip_forward=1` to enable forwarding; `net.ipv4.conf.all.rp_filter=1` for strict reverse-path checking per RFC 3704 / BCP 84 to prevent spoofed-source ingress; `net.core.somaxconn` for the accept queue; `net.ipv4.tcp_max_syn_backlog`; `net.netfilter.nf_conntrack_max` and `nf_conntrack_buckets` for NAT and CGNAT scale; `net.ipv4.tcp_tw_reuse` and `tcp_fin_timeout` for high-churn front-ends.

What to monitor: per-link drop counters, TCP retransmits via `ss -i` and `nstat`, ICMP rate (a sudden spike of Type 3 Code 4 means an MTU issue, a flood of Type 11 means a routing loop), conntrack table fill, IP fragmentation counters in `/proc/net/netstat` (the `Ip*Frag*` family), and BGP session flaps.

## What's changing in 2026

**Google's IPv6 measurement crossed 50.1% on 28 March 2026** for a single day for the first time, twenty-eight years after IPv6 was first standardised. APNIC's smoothed view sits at around 43%; the three measurements (Google, APNIC, Cloudflare Radar) reconcile but differ at any given moment. India, France, Germany, and Belgium all run above 70%; the US is just over 50%. Linear extrapolation from 2018 puts the line at roughly 80% by 2030 — but the bigger debate is whether the curve asymptotes at 60–75% with a permanent IPv4 long tail. The frontier chapter on IPv6-Mostly is where this gets unpacked.

**AWS's $0.005-per-hour IPv4 charge** has held since 1 February 2024, GCP and Azure have followed with similar structures, Hetzner charges €1 per IPv4 per month, and the pricing signal is now industry-wide. Within months of the AWS launch, workloads at scale began migrating to IPv6-only architectures with NAT64 gateways for legacy IPv4 destinations — the economic forcing function did more for IPv6 deployment in 2024 than two decades of advocacy.

**The IPv4 secondary market has inverted.** Mid-2024 averages were $32–$36 per IP. In **June 2025, /16 prices fell below $20 per IP** for the first time since 2019 — driven by hyperscalers leaving the buy side after stockpiling. January 2026 mean: $22 per IP, with a /14 transferred at $9 per IP. Lease prices are flatter at $0.38–$0.50 per IP per month.

**BIG TCP for IPv4 in Linux 6.3** (April 2023, broadly deployed in 2024) lifts per-flow throughput dramatically on 100 and 200 Gb NICs by allowing TSO and GRO superpackets above 64 KB. The same vintage of Linux kernel is the one most production fleets are now running.

**RPKI ROA coverage crossed 50% of IPv4 prefixes in May 2024**; by end-2025, around 54% of prefixes and roughly 74% of traffic destined to ROA-covered networks. The June 2024 FCC NPRM was the first US federal proposal to compel the nine largest BIAS providers to file BGP Routing Security Risk Management Plans and quarterly RPKI deployment reports. The frontier chapter on RPKI plus ASPA covers the cleanup wave in detail.

**The 2024–2026 IETF backlog** continues to clean up the protocol's edges. RFC 9637 (August 2024) added `3fff::/20` as a second IPv6 documentation prefix. RFC 9673 (October 2024) finally relaxed Hop-by-Hop Options handling so they are deployable on real router silicon. The 2024 cleanup also officially removed `face:b00c` from Linux kernel traces because the example prefix was being mistaken for a real one in copy-pasted configs.

**L4S launched in production at Comcast in late January 2025** across six US metros — Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville (Maryland), and San Francisco — with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. DOCSIS 4.0 cable modems are shipping L4S-capable AQM through 2024–2025. The frontier chapter on L4S Everywhere walks through how the ECT(1) repurpose actually works.

**Ultra Ethernet Consortium Specification 1.0** was published 11 June 2025 — a 560-page ground-up rethink of how Ethernet carries RDMA traffic for AI training fabrics. AMD's Pensando Pollara 400 GbE is the first UEC-compliant NIC, deployed at Oracle Cloud. The frontier chapter on Ultra Ethernet has the full architecture story.

## Fun facts (host material)

**The word "datagram" comes from CYCLADES**, Louis Pouzin's French research network of 1972. Cerf and Kahn adopted both the word and the connectionless model. "Octet" was preferred over "byte" in RFC 791 because in the 1970s "byte" still varied across hosts — the PDP-10 used 36-bit words and variable bytes; calling everything an octet meant exactly eight bits. That convention has held for half a century.

**The Evil Bit (RFC 3514, 1 April 2003).** Steve Bellovin proposed that the high-order reserved bit of the Flags field signal that "this packet has evil intent." A FreeBSD developer half-seriously implemented it. Bellovin received a worried email from someone in broadcast IP-rights enforcement who wanted to understand the standard's compliance implications.

**RFC 1149 — IP over Avian Carriers**, David Waitzman, 1 April 1990 — was actually demonstrated by the Bergen Linux User Group in April 2001. Nine packets, 55% loss, latency between 3,000 and 6,000 seconds. Updated by RFC 2549 (Quality of Service, 1999) and RFC 6214 (IPv6, 2011). The closest the IETF gets to a tradition.

**Postel's Robustness Principle.** Jon Postel, RFC 793 §2.10, 1981: *be conservative in what you do, be liberal in what you accept from others.* Four decades on it is the most-cited and most-debated design principle in networking; the modern security community argues it incentivises ambiguous receivers and parser bugs, and IETF practice in the 2020s has tilted toward strict validation.

**127.0.0.0/8 is a /8 for loopback.** That is 16,777,216 addresses for "localhost." Postel's choice was generous; 2024 IETF drafts proposed reclaiming 127.1.0.0/16 onwards as unicast. As of May 2026 the proposal has not been adopted.

**Class A handouts of the 1980s.** MIT got 18.0.0.0/8. HP, after merging with DEC, got 16.0.0.0/8. Apple got 17.0.0.0/8. Ford got 19.0.0.0/8. Halliburton got 34.0.0.0/8 — and sold it to AWS for around $110 million in 2017. General Electric, IBM, Xerox, AT&T, the US DoD, and the US Postal Service all received entire /8 blocks in the early years. Many have since been sold or split.

**Microsoft's $7.5M Nortel buy in April 2011** was the first major secondary-market IPv4 transaction at $11.25 per IP. By peak 2021, /16 prices reached $45 to $60 per IP. By January 2026, the mean is $22 per IP and a /14 sold at $9 per IP. The market round-tripped in fifteen years.

**Cerf and Kahn won the 2004 ACM Turing Award** for the design and implementation of the internet's basic communications protocols. They received it in February 2005.

## Where this connects in the book

- **What Is a Protocol?** (Part Foundations) — IP is the canonical example. The chapter starts with the abstraction itself.
- **The Layer Model** (Part Foundations) — IP is Layer 3; everything in the protocol-graph encyclopedia hangs on this layering.
- **Addressing & Identity** (Part Foundations) — hostnames, IPs, MACs, and ports. IP addresses are what packets are addressed to.
- **Packets & Encapsulation** (Part Foundations) — frames inside packets inside segments. IP is the middle layer.
- **Ports & Sockets** (Part Foundations) — IP plus a port is a socket; that is most of what an application sees of the network.
- **Reliability vs Speed** (Part Foundations) — TCP and UDP both ride on IP; the contrast is the entire reason the IP / TCP split exists.
- **Client-Server vs Peer-to-Peer** (Part Foundations) — NAT and IPv4 exhaustion broke true peer-to-peer for a generation.
- **Before the Internet** (Part Story of the Internet) — Xerox PARC, ARPANET, and NCP — the three traditions that flowed into TCP/IP.
- **The 1981–83 Standardisation Burst** (Part Story of the Internet) — RFCs 791, 792, 793, the ARPANET flag day on 1 January 1983, IEEE 802.3 ratified. The three years that locked in the stack.
- **The Web Is Built On Top** (Part Story of the Internet) — Tim Berners-Lee's NeXT cube and the assumption that the transport layer below already worked.
- **The QUIC Redesign** (Part Story of the Internet) — pulling reliable transport into user space and folding TLS into it. QUIC tunnels inside UDP, which tunnels inside IP — every layer above IP is still riding on these envelopes.
- **ARP and NDP** (Part Layer 2-3) — the layer seam between IP and Ethernet. ARP turns IP addresses into MAC addresses on the local segment.
- **IPv4** (Part Layer 2-3) — the deeper survey of IPv4 itself, organised around the chapter format. The historical narrative belongs to that chapter.
- **IPv6** (Part Layer 2-3) — the 28-year transition that crossed 50% on Google on 28 March 2026.
- **ICMP** (Part Layer 2-3) — Mike Muuss writing ping in a single night in December 1983, plus the diagnostic backplane IP needs to be debuggable.
- **BGP** (Part Layer 2-3) — the routing protocol of the internet, Yakov Rekhter and Kirk Lougheed sketching it on cafeteria napkins at IETF 12 in Austin in January 1989.
- **TCP** (Part Transport) — the workhorse rider on top of IP. Pair these episodes.
- **UDP** (Part Transport) — three pages of RFC, no guarantees, ubiquitous. The protocol most amplification DDoS attacks have ridden.
- **SCTP** (Part Transport) — the better TCP that lost the deployment war because middleboxes drop unknown protocol numbers.
- **QUIC** (Part Transport) — the transport that finally shipped because it accepted IPv4 middlebox ossification and tunnelled inside UDP.
- **The Shared Medium** (Part Wireless) — IP packets go over Wi-Fi the same way they go over Ethernet, but the link layer underneath is fundamentally different.
- **HTTP/3** (Part Web/API) — HTTP semantics on QUIC on UDP on IP. The full layering on display.
- **MCP and A2A** (Part Web/API) — the protocol layer for AI agents, deliberately built boring on top of JSON-RPC, HTTP, and SSE.
- **Kafka** (Part Async/IoT) — the Datadog 8 March 2023 outage, where a systemd-networkd update deleted Cilium-managed IP routes on Kubernetes nodes hosting Datadog's Kafka pipeline. The canonical messaging-tier ripple effect.
- **WebRTC** (Part Real-time A/V) — peer-to-peer in the browser; ICE, STUN, TURN; the only way for a browser to send a UDP packet, with all the IPv4 NAT-traversal pain that implies.
- **NTP** (Part Utilities & Security) — the 2014 NTP DDoS amplification disaster, 400 Gbps from monlist amplification on IPv4.
- **The Email Stack** (Part Utilities & Security) — SMTP at 25, Submission at 587, Submissions at 465 — every port lookup that bites a sysadmin happens over IPv4.
- **Recurring Patterns** (Part How Networks Actually Behave) — handshakes, sliding windows, keepalives, ECN, hashing. ECN lives in the IP header.
- **Failure Modes** (Part How Networks Actually Behave) — bufferbloat, ossification, head-of-line blocking, microloops, MTU black holes. Most of the bestiary touches IP.
- **AS 7007 1997** (Part Famous Outages) — a Florida ISP de-aggregating the entire BGP table and routing the world through a single underpowered router.
- **Mitnick vs Shimomura 1994** (Part Famous Outages) — the TCP sequence-prediction attack on Christmas Day; before encryption, source IP was treated as identity.
- **China Telecom 2010** (Part Famous Outages) — 15% of the internet routed through a single AS for 18 minutes.
- **SACK Panic 2019** (Part Famous Outages) — a single TCP packet, no authentication, kernel panic. The Linux fuzzing era began here.
- **Facebook 2021 — The Cascade** (Part Famous Outages) — six hours of BGP, DNS, and badge readers all failing together.
- **Rogers 2022 — A Country Disconnected** (Part Famous Outages) — fifteen hours of half of Canada offline, including 911.
- **L4S Everywhere** (Part Frontier) — sub-millisecond queuing latency for cooperating flows; Comcast launched in production in January 2025.
- **IPv6-Mostly** (Part Frontier) — DHCPv4 Option 108 plus PREF64 plus 464XLAT; the deployment pattern most modern networks now ship.
- **RPKI + ASPA** (Part Frontier) — cryptographic BGP, finally arriving — over 50% of IPv4 prefix space ROA-covered.
- **Ultra Ethernet** (Part Frontier) — replacing RoCEv2 in AI training fabrics. Specification 1.0 published 11 June 2025.
- **Books** and **Courses** (Part How to Learn More) — Stevens' *TCP/IP Illustrated*, Tanenbaum, Kurose & Ross, Stanford CS144 (build a TCP/IPv4 stack from scratch), Berkeley CS168.

## See also (other protocol episodes)

**IPv4 versus IPv6.** Thirty-two-bit addresses in dotted-quad versus 128-bit addresses in colon-hex. Variable 20-to-60-byte header with a checksum and options versus a fixed 40-byte header with no checksum and an extension chain. Routers and hosts can fragment in IPv4; only the source can fragment in IPv6, which means Path MTU Discovery has to work or your packets quietly disappear. ARP broadcast versus NDP solicited-node multicast, far more efficient. DHCP versus SLAAC, where hosts self-configure from the router prefix. Use IPv4 when your environment has not been upgraded, when the tooling assumes /24s and dotted-quads, when your monitoring stack only handles IPv4. Use IPv6 when you want globally unique addresses for every device, when you want to eliminate NAT, when you need efficient multicast, or when AWS's $0.005-per-hour bill has finally exceeded the migration cost.

**IPv4 and ARP.** ARP is the bridge between Layer 3 and Layer 2. IP provides the logical addressing for routing across networks; ARP turns the next-hop IP address into the MAC address actually written into the Ethernet frame. Without ARP, IP packets are routed correctly but never delivered to the right host on the last hop. Every IPv4 unicast on Ethernet starts with an ARP cache lookup; every miss triggers a broadcast that asks "who has this IP?" The ARP episode is the natural companion.

**IPv4 and Ethernet.** IP packets are encapsulated inside Ethernet frames with EtherType 0x0800. The Ethernet frame's destination MAC is either the final host (if local) or the default gateway router. At every router hop, the IP header stays the same but the Ethernet frame is stripped and rebuilt with new MAC addresses. The 1500-byte Ethernet MTU drives almost every IPv4 fragmentation pitfall in production.

**IPv4 and Wi-Fi.** Same encapsulation, different link layer. Wi-Fi frames carry IPv4 with the same EtherType inside an LLC/SNAP header. The access point bridges between Wi-Fi and Ethernet by stripping the 802.11 frame and re-encapsulating in Ethernet (and the reverse). Practical wrinkles: 802.11 fragmentation, retry behaviour, and power-save mode all interact with IPv4 latency in ways that show up as jitter on a video call.

**IPv4 and TCP.** TCP rides on top of IP with Protocol number 6. IP handles addressing and routing across networks but provides no guarantees about delivery, ordering, or duplication. TCP adds reliability — sequence numbers track byte order, acknowledgements confirm delivery, retransmission recovers loss. Together they are TCP/IP, the foundation. The TCP episode is essential pairing.

**IPv4 and UDP.** UDP rides on IP with Protocol number 17. Eight bytes of header — source port, destination port, length, checksum — and that is the entire protocol. Adds port-based demultiplexing so multiple applications can share a host's IP, and gets out of the way. Foundation for DNS, DHCP, NTP, QUIC, and most amplification DDoS vectors.

**IPv4 and ICMP.** ICMP is IP's diagnostic companion, encapsulated directly in IP packets with Protocol number 1. When a router can't deliver an IP packet — TTL expired, destination unreachable, fragmentation needed — it sends an ICMP message back. Ping (Echo Request and Reply) and traceroute (TTL-based hop discovery) are the two operations every networking engineer has typed thousands of times.

**IPv4 and DNS.** DNS is the phone book that turns human-readable names into IPv4 (A) and IPv6 (AAAA) records. Almost every IP packet on the internet is preceded by a DNS query that produced its destination address. Without DNS, users would memorise dotted-quads; without IP, the resolved addresses would have nowhere to route to.

**IPv4 and BGP.** BGP is the inter-domain routing protocol that decides how IP packets traverse autonomous-system boundaries. Routers advertise which IP prefixes they can reach plus AS-path attributes; receiving routers consult the routing table built from those advertisements. Every BGP UPDATE message references IP prefixes; the ~1 million IPv4 prefixes in the global default-free zone are exactly what BGP carries.

## Sources

**Specifications**

- [RFC 791 — Internet Protocol](https://datatracker.ietf.org/doc/html/rfc791)
- [RFC 1071 — Computing the Internet Checksum](https://datatracker.ietf.org/doc/html/rfc1071)
- [RFC 1122 — Requirements for Internet Hosts: Communication Layers](https://datatracker.ietf.org/doc/html/rfc1122)
- [RFC 1812 — Requirements for IP Version 4 Routers](https://datatracker.ietf.org/doc/html/rfc1812)
- [RFC 2474 — Differentiated Services Field (DSCP)](https://datatracker.ietf.org/doc/html/rfc2474)
- [RFC 3168 — Explicit Congestion Notification](https://datatracker.ietf.org/doc/html/rfc3168)
- [RFC 3514 — The Security Flag in the IPv4 Header (Evil Bit)](https://datatracker.ietf.org/doc/html/rfc3514)
- [RFC 4632 — Classless Inter-Domain Routing (CIDR)](https://datatracker.ietf.org/doc/html/rfc4632)
- [RFC 6274 — Security Assessment of IPv4](https://www.rfc-editor.org/rfc/rfc6274.txt)
- [RFC 6864 — Updated Specification of the IPv4 ID Field](https://datatracker.ietf.org/doc/rfc6864/)
- [RFC 6890 — Special-Purpose IP Address Registries](https://datatracker.ietf.org/doc/html/rfc6890)
- [RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification](https://datatracker.ietf.org/doc/html/rfc8200)
- [RFC 1149 — IP over Avian Carriers](https://www.rfc-editor.org/rfc/rfc1149)

**Papers**

- [Cerf & Kahn — A Protocol for Packet Network Intercommunication (IEEE Trans. Commun. 1974)](https://www.cs.princeton.edu/courses/archive/fall06/cos561/papers/cerf74.pdf)
- [Saltzer, Reed & Clark — End-to-End Arguments in System Design (ACM TOCS 1984)](https://web.mit.edu/saltzer/www/publications/endtoend/endtoend.pdf)
- [Cohen — On Holy Wars and a Plea for Peace (IEN 137, 1980)](https://www.ietf.org/rfc/ien/ien137.txt)
- [Moore et al. — The Spread of the Sapphire/Slammer Worm (CAIDA 2003)](https://www.caida.org/catalog/papers/2003_sapphire/)

**Vendor and engineering blogs**

- [Cloudflare — Amazon's $2bn IPv4 tax](https://blog.cloudflare.com/amazon-2bn-ipv4-tax-how-avoid-paying/)
- [Cloudflare DDoS Threat Report Q4 2025](https://blog.cloudflare.com/ddos-threat-report-2025-q4/)
- [Cloudflare — The DDoS that almost broke the Internet (Spamhaus 2013)](https://blog.cloudflare.com/the-ddos-that-almost-broke-the-internet/)
- [Cloudflare — October 2021 Facebook outage](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [APNIC — BGP in 2025](https://blog.apnic.net/2026/01/08/bgp-in-2025/)
- [APNIC — Google hits 50% IPv6](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
- [APNIC — How NAT traversal works concerning CGNATs](https://blog.apnic.net/2022/05/03/how-nat-traversal-works-concerning-cgnats/)
- [AWS — New AWS public IPv4 address charge](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/)
- [AWS — Identify and optimize public IPv4 address usage on AWS](https://aws.amazon.com/blogs/networking-and-content-delivery/identify-and-optimize-public-ipv4-address-usage-on-aws/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Phoronix — Linux 6.3 BIG TCP](https://www.phoronix.com/news/Linux-6.3-Networking-BIG-TCP)
- [Geoff Huston / Potaroo — IPv4 addresses in 2025](https://www.potaroo.net/ispcol/2026-01/addr2025.html)
- [ARIN — IP addresses through 2025](https://www.arin.net/blog/2026/01/22/ip-addresses-through-2025/)
- [Cisco — Configure CGNAT (Carrier-Grade NAT) IPs](https://www.cisco.com/c/en/us/support/docs/security/umbrella/225267-configure-cgnat-carrier-grade-nat-ips.html)
- [DPDK project](https://www.dpdk.org)

**News**

- [The Register — IPv6 hits 50% on Google](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)
- [The Register — AWS says IPv4 addresses cost](https://www.theregister.com/2023/07/31/aws_says_ipv4_addresses_cost/)
- [CRTC — Xona Partners report on the 2022 Rogers outage](https://crtc.gc.ca/eng/publications/reports/xonarp2023.htm)
- [CBC — Rogers outage human error and system deficiencies](https://www.cbc.ca/news/politics/rogers-outage-human-error-system-deficiencies-1.7255641)
- [Hacker News — GitHub memcached DDoS](https://thehackernews.com/2018/03/biggest-ddos-attack-github.html)
- [Krebs on Security — Inside the Spamhaus attack](https://krebsonsecurity.com/2016/08/inside-the-attack-that-almost-broke-the-internet/)
- [NANOG — A brief history of the internet's biggest BGP incidents](https://nanog.org/stories/articles/a-brief-history-of-the-internets-biggest-bgp-incidents/)
- [RIPE — YouTube hijacking case study](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
- [IPbnb — IPv4 address price 2026](https://ipbnb.com/blog/ipv4-address-price-2026)
- [IPXO — IPv4 lease price trends 2025](https://www.ipxo.com/blog/ipv4-lease-price-trends-2025/)

**Wikipedia**

- [Wikipedia — Internet Protocol](https://en.wikipedia.org/wiki/Internet_Protocol)
- [Wikipedia — IPv4](https://en.wikipedia.org/wiki/IPv4)
- [Wikipedia — IPv4 address exhaustion](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)
- [Wikipedia — Default-free zone](https://en.wikipedia.org/wiki/Default-free_zone)
- [Wikipedia — Morris worm](https://en.wikipedia.org/wiki/Morris_worm)
- [Wikipedia — SQL Slammer](https://en.wikipedia.org/wiki/SQL_Slammer)
- [Wikipedia — 2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
- [Wikipedia — Evil bit](https://en.wikipedia.org/wiki/Evil_bit)
