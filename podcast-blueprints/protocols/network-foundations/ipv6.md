---
id: ipv6
type: protocol
name: Internet Protocol version 6
abbreviation: IPv6
etymology: "[I]nternet [P]rotocol version [6]"
category: network-foundations
year: 1998
rfc: RFC 8200
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - foundations/addressing
  - foundations/ports-sockets
  - story-of-the-internet/osi-vs-tcp-ip
  - layer-2-3/arp-and-ndp
  - layer-2-3/ipv4
  - layer-2-3/ipv6
  - layer-2-3/icmp
  - layer-2-3/bgp
  - async-iot/coap
  - frontier/ipv6-mostly
  - frontier/rpki-aspa
related_protocols: [ip, tcp, udp, ethernet, wifi, dns, dhcp, ospf, ipsec, icmp, arp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [2460, 8981]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ipv6_address_leading_zeros.svg/500px-Ipv6_address_leading_zeros.svg.png
    caption: IPv6 address notation — eight groups of four hexadecimal digits separated by colons. Leading zeros can be omitted and consecutive zero groups replaced with a double colon for brevity, so 2001:0db8:0000:0000:0000:0000:0000:0001 collapses to 2001:db8::1.
    credit: Image — Wikimedia Commons / CC BY-SA 3.0
visual_cues:
  - "The Google IPv6 dashboard line graph from 2008 to 2026, with a single vertical marker at 28 March 2026 where the curve crosses 50.1 percent for the first time. Mobile-carrier launches annotated as small dots along the curve — T-Mobile 2014, Reliance Jio 2016, AWS IPv4 charge February 2024."
  - "The fixed 40-byte IPv6 header drawn as a stack of six 32-bit rows: Version plus Traffic Class plus Flow Label on row one, Payload Length plus Next Header plus Hop Limit on row two, then four rows for the source address and four for the destination. A red 'X' over the missing checksum field that IPv4 had."
  - "A side-by-side: IPv4 ARP broadcast hitting every device on a /24 versus IPv6 NDP Neighbor Solicitation hitting only the solicited-node multicast group ff02::1:ff plus 24 bits. The same target reached, dramatically fewer woken devices."
  - "A SLAAC sequence diagram — host generates a tentative link-local fe80 address, sends a DAD Neighbor Solicitation from source colon-colon, then a Router Solicitation to ff02::2, receives a Router Advertisement carrying the /64 prefix and the M-O flags, then constructs one stable RFC 7217 address and one rotating RFC 8981 temporary address."
  - "A world map shaded by IPv6 adoption — France 86 percent, India 67-80 percent, China 77 percent of users, Germany 68 percent, US mobile around 87 percent — alongside a Google logo at 50.1 percent peak."
  - "A photo of the kame.net dancing turtle, with a caption that the FreeBSD, macOS and iOS IPv6 stacks all descend from the KAME Project, a 1998-2006 Japanese collaboration of Fujitsu, Hitachi, IIJ, NEC, Toshiba, Yokogawa, Keio and Tokyo."
---

# IPv6 — Internet Protocol version 6

## In one breath

IPv6 is the next-generation network-layer protocol of the internet — 128-bit addresses, a fixed 40-byte header, no checksum, no router fragmentation, and no broadcast. Its address space, three hundred and forty undecillion, is the answer to IPv4's exhaustion crisis. It has taken twenty-eight years to deploy, and on 28 March 2026 it crossed 50.1 percent of Google's traffic for the first time. Anyone running a service on the internet is now serving roughly half their users over IPv6 whether they know it or not.

## The pitch (cold-open)

Pick up your phone. There is a number on it that is not the one you call — it is the address your phone uses to find anything on the internet. For decades, all of those numbers came from a pool of about four billion. Vint Cerf picked the size in 1977 and has spent the years since publicly apologising for it. The internet ate the pool around 2011, and we have been living on address translation, NAT, and a leased IPv4 market ever since. Quietly, in the background, a successor named IPv6 — with three hundred and forty undecillion addresses — has been creeping into the wires. On 28 March 2026, for the first time in history, more than half of Google's traffic arrived over it. Half. Twenty-eight years after RFC 2460. This episode is about how that forty-byte header actually works on the wire, why it took longer than the entire Apollo programme to win, and what is finally pushing it over the line.

## How it actually works

The simulator's spine is a single packet leaving a host, traversing a router, and reaching its destination — with NDP and SLAAC handling everything ARP and DHCP used to do.

The first thing a fresh IPv6 host does on a new link is **Stateless Address Autoconfiguration**. It does not ask a server for an address. It builds one. It generates a tentative link-local address — `fe80::` plus a 64-bit interface identifier — and sends a Neighbor Solicitation from `::` to the solicited-node multicast group for that address, listening for any Neighbor Advertisement that would mean the address is already in use. That is **Duplicate Address Detection**. If nothing answers, the address is unique.

Next, the host sends a **Router Solicitation** — ICMPv6 type 133 — to `ff02::2`, the all-routers link-local multicast. A router replies with a **Router Advertisement** — ICMPv6 type 134 — carrying the /64 prefix for the link, the link MTU, the default-router lifetime, and the M and O flags that say whether to use SLAAC, DHCPv6 for everything-but-address, or full DHCPv6. Modern stacks then construct two global addresses: one stable RFC 7217 address derived by hashing the prefix with a per-network secret, and one or more rotating RFC 8981 temporary addresses with default lifetimes around one day preferred and two days valid. Each goes through DAD too. Plug in. Pick your address. No DHCP server needed.

To send to anything else on the link, the host needs a MAC. Where IPv4 would shout an ARP broadcast at every device on the segment, IPv6 sends a **Neighbor Solicitation** — ICMPv6 type 135 — to the destination's solicited-node multicast group. That group is `ff02::1:ff` plus the low 24 bits of the target address, mapped onto the Ethernet MAC `33:33:` plus the low 32 bits of the multicast address. Only the target and a handful of other nodes wake up. The target replies with a Neighbor Advertisement — type 136 — carrying its MAC. The result is cached in the **Neighbor Cache**, IPv6's equivalent of the ARP cache.

When the host actually sends a packet to a remote destination, the IPv6 header is fixed at 40 bytes. The router that receives it does not recompute a header checksum — there is none. It decrements **Hop Limit** by one, looks up the destination prefix, re-encapsulates the packet in a new Ethernet frame for the next link, and forwards. The IPv6 addresses stay constant end-to-end. The Ethernet MACs change at every hop. If the next link's MTU is too small, the router does not fragment. It drops and replies with **ICMPv6 Packet Too Big** — type 2 — carrying the next-hop MTU, and the source learns the path MTU.

### Header at a glance

The 40-byte fixed header has eight fields:

- **Version** (4 bits) — always `0110`, decimal 6.
- **Traffic Class** (8 bits) — DiffServ DSCP plus ECN, the same shape as IPv4's TOS byte.
- **Flow Label** (20 bits) — a per-flow identifier that RFC 6437 redefined as a flow hash, so routers can ECMP without parsing the L4 header.
- **Payload Length** (16 bits) — bytes after the 40-byte header. Maximum 65,535 unless the Jumbo Payload hop-by-hop option is in use.
- **Next Header** (8 bits) — the same numbering as IPv4's Protocol field. TCP is 6, UDP is 17, ICMPv6 is 58, or it is the value of the first extension header.
- **Hop Limit** (8 bits) — IPv4's TTL, renamed to be honest about what it does. Decrements per router; zero triggers ICMPv6 Time Exceeded.
- **Source** and **Destination** (128 bits each).

Notably absent: the IPv4 header checksum, the variable-length options field, and IHL. The header is fixed size. Hardware fast-path is happy.

Optional features ride on **extension headers**, chained via the Next Header field. The recommended order is Hop-by-Hop Options, Destination Options, Routing, Fragment, Authentication, ESP, final-destination Destination Options, then the upper-layer header. Only Hop-by-Hop is processed by every router on the path — and even that was relaxed by RFC 9673 in October 2024 because real router silicon could not deal with the original strictness. In the open internet, RFC 9098 and the Czyz study before it report 25-55 percent drop rates for packets carrying extension headers.

### State machine in three sentences

IPv6 itself is connectionless and effectively stateless at the network layer — there is no equivalent of a TCP state machine for an IP packet. The state that does exist lives in the host: the Neighbor Cache (state per neighbor: INCOMPLETE, REACHABLE, STALE, DELAY, PROBE per RFC 4861), the Destination Cache, the Prefix List, and the PMTU cache per destination. Hosts and routers keep all of this machinery via ICMPv6 — the protocol is structurally fine without it on paper, and operationally dead without it on a real link.

### Reliability, addressing, security mechanics

IPv6 is best-effort, like IPv4. Reliability is the upper layer's job — TCP for byte streams, QUIC for datagrams that need ordering, plain UDP for everything else. Two integrity changes are worth knowing. First, the IPv6 pseudo-header used for TCP and UDP checksums is different — 128-bit addresses plus a 32-bit upper-layer length and 24 zero bits plus the 8-bit next-header. Second, the UDP checksum is mandatory in IPv6, where it was optional in IPv4; RFC 6935 carved out a zero-checksum exception for some tunnel protocols.

Addresses come in three flavours. **Unicast** is one-to-one. **Multicast** — `ff00::/8` — is one-to-many; the important groups are `ff02::1` all-nodes link-local, `ff02::2` all-routers link-local, and `ff02::1:ffXX:XXXX` solicited-node. **Anycast** advertises the same address from many places and lets routing pick the nearest — the design behind every DNS root server and every CDN. Broadcast is gone.

Scopes layer on top. Link-local `fe80::/10` is required on every interface and never routed off-link. Unique-Local `fc00::/7` — in practice `fd00::/8` — is private. Global Unicast `2000::/3` is the routable internet — `2001::/16`, `2400::/12` for APNIC, `2600::/12` for ARIN. The text representation is governed by RFC 5952: lowercase hex, suppress leading zeros, compress the longest run of zero groups with `::`.

Encryption is **not** built in. IPsec was originally mandatory-to-implement, then demoted to optional by RFC 6434 in 2011 — a perennial source of the myth that IPv6 is encrypted by default. It is not. The encryption story is the same as for IPv4: TLS at the application layer.

## Where it shows up in production

**Mobile carriers** are the leading edge. T-Mobile US moved its mobile core to IPv6-only in 2014 — Cameron Byrne's NANOG 61 talk is the production case study that defined the pattern, using 464XLAT for the IPv4 long tail. Reliance Jio launched IPv6-first in India in 2016 and was past 237 million IPv6 users by 2017, the single biggest reason India's IPv6 share now runs 67-80 percent. By 2026 US mobile averages around 87 percent IPv6, T-Mobile around 93, France 86, China 865 million users — 77 percent of users, 34 percent of traffic — as of September 2025.

**Meta** runs more than 99 percent of internal datacenter traffic over IPv6. Whole new clusters are IPv6-only and serve IPv4 via L4 and L7 load balancers. Meta has measured internal IPv6 as 10-15 percent faster than IPv4, and on one carrier mobile measurement, 40 percent faster — almost all of it from removing NAT and improving caching, not from anything intrinsic to the protocol.

**AWS, Azure and GCP** are dual-stack everywhere. AWS shipped IPv6-only VPCs in 2021. The decisive move was on 1 February 2024, when AWS started charging $0.005 per public IPv4 address per hour — about $3.65 a month per address, attached or not. Within months, large customers began migrating to IPv6-only architectures with NAT64 gateways for the IPv4 long tail. The economic forcing function did more in 2024 than two decades of advocacy. **Microsoft Azure Fairwater**, presented at OCP Global Summit 2025, uses SRv6 as the fabric for what Microsoft describes as the largest AI back-end network in the world. **SoftBank** in December 2025 announced what it called the world's first commercial 5G deployment using SRv6 MUP — Mobile User Plane.

**Cloudflare** has 98 percent of customer sites with IPv6 enabled. Their 2024 Year in Review measured 28.5 percent of dual-stacked requests over IPv6; the 2025 number was around 30 percent. **Google** crossed 50.1 percent on 28 March 2026, peak; the typical day is 45-48 percent.

**Country level**, Google's measurement in February 2026 had France at 86 percent. APNIC has India at 67-80 percent. Germany sat at 68 in mid-2023. China's official September 2025 figure is 865 million IPv6 users — 77 percent of users, 34 percent of traffic. APNIC Labs, Cloudflare Radar and other independent measurements still place global IPv6 capability in the 40-43 percent range as of April 2026 — the Google 50 percent number is one source's snapshot.

## Things that go wrong

**CVE-2020-16898 — "Bad Neighbor."** October 2020. Microsoft's `tcpip.sys` mishandled an ICMPv6 Router Advertisement carrying an even-length **RDNSS** option from RFC 8106. The Length field is supposed to be odd. Send 4, and the parser misinterprets the next 8 bytes as a new option, whose type field the attacker controls. With a fragmented packet, attacker bytes overrun a 32-byte kernel pool buffer. CVSS 8.8. Reliable BSoD, with credible remote-code-execution claimed wormable. The exploit primitive is *send one router advertisement* — the most ordinary packet on an IPv6 LAN. Microsoft patched on the 13 October 2020 Patch Tuesday. The deeper lesson — that NDP runs in the kernel, before any user-space firewall sees it — is the one we cover in the chapter on ARP and NDP.

**CVE-2024-38063.** August 2024. Same `tcpip.sys`, this time an integer underflow in IPv6 fragment reassembly: a 16-bit overflow allocates 48 bytes; `memmove` copies up to 65,488 bytes from an attacker-controlled fragment payload. CVSS 9.8, "exploitable from anywhere on the link." MalwareTech reverse-engineered it publicly within days of the 13 August 2024 patch. Four years apart, almost beat-for-beat — IPv6 fragment reassembly remains one of the highest-stakes code paths on a Windows host.

**CVE-2023-6200.** A Linux ICMPv6 race condition between `icmpv6_init` registration and `fib6_run_gc`, fixed in 2024. Modest scope, but proof that even mature stacks still find IPv6 bugs.

**Facebook outage, 4 October 2021.** Not an IPv6 incident strictly, but the lesson matters here. A backbone-capacity audit command intended to probe paths executed across all backbone routers; an audit-tool bug failed to halt it. The backbone disconnected, and Facebook's DNS authoritative servers — designed to withdraw their BGP advertisements when they lose backbone reachability — withdrew both the IPv4 and IPv6 prefixes simultaneously. Six hours of dual-stack absence. The takeaway: parallel withdrawal of IPv4 and IPv6 means dual-stack is not redundancy when the same control plane controls both.

**Type 0 Routing Header amplification, 2007.** Biondi and Ebalard demonstrated bouncing packets between two IPv6 routers via RH0 to amplify traffic. Led to deprecation in RFC 5095, folded into RFC 8200.

**Apple iCloud Private Relay, October 2021 onward.** First Apple service designed end-to-end on QUIC plus IPv6-preferring egress. Pure IPv4-only enterprise networks frequently see it break. Apple's documented response is per-network opt-out — which has become its own forcing function for IPv6 deployment in any enterprise that wants Apple-device compatibility.

## Common pitfalls (for the practitioner)

**PMTUD black hole.** Symptom: TCP handshakes complete, then large transfers stall forever. Cause: a firewall somewhere is filtering ICMPv6 Packet Too Big — RFC 4890 lists what you may safely filter, and the short answer is "very little." Cure: stop blocking ICMPv6 across the board. The phrase "I disabled IPv6 to fix it" almost always means "my firewall was broken."

**Rogue Router Advertisement / SLAAC attack.** Any host on the link can claim to be the router, hand out a prefix, and route traffic. Cure: **RA Guard** on access switches per RFC 6105 and RFC 7113, plus ND inspection, plus DHCPv6 Shield from RFC 7610. Fernando Gont's RA Guard fragmented-evasion is closed by RFC 6980.

**NDP cache exhaustion.** A /64 subnet has 18 quintillion addresses; an attacker scanning them forces the router to allocate neighbor cache entries for each one. Cure: rate-limit NS, use /127 on point-to-point links, raise `net.ipv6.neigh.default.gc_thresh3`, minimise on-link /64 exposure.

**Happy Eyeballs masking IPv6 brokenness.** RFC 8305 races IPv4 and IPv6 with a 250 ms head start to v6, and the user feels nothing when v6 fails. The operator sees the latency tail and the failed connection counter. Watch them.

**ULA confusion.** `fc00::/7` is not magic privacy. Without proper RFC 6724 source-address selection rules, ULA addresses leak.

**DHCPv6 versus SLAAC mismatch.** The M and O flags in the Router Advertisement decide. Misconfigured, half your hosts get no addresses, the other half no DNS. The number-one enterprise gotcha is that **Android does not implement DHCPv6** — Lorenzo Colitti's long-standing position — so any network that depends on DHCPv6 for the address itself will not work for half the phones in the building.

**Disabling IPv6 to "fix" something.** Almost always masks a real bug while creating new ones. Windows is fragile if v6 is fully disabled, and macOS Happy Eyeballs degrades.

## Debugging it

Linux sysctls you will actually touch:

- `net.ipv6.conf.all.forwarding = 1` — enable routing.
- `net.ipv6.conf.all.accept_ra = 0|1|2` — `2` accepts RA even when forwarding.
- `net.ipv6.conf.all.use_tempaddr = 2` — RFC 8981 prefer temporary addresses.
- `net.ipv6.conf.all.addr_gen_mode = 2` — RFC 7217 stable privacy.
- `net.ipv6.conf.all.accept_redirects = 0` — disable on routers.
- `net.ipv6.conf.all.accept_source_route = 0` — always.
- `net.ipv6.neigh.default.gc_thresh3 = 8192` — raise on busy routers.
- `net.ipv6.conf.all.disable_ipv6 = 0` — never set this to 1 to "fix" things.

What to monitor: NDP cache size and churn (`ip -6 neigh | wc -l`); RA churn (unexpected RAs from non-router MACs); AAAA query failure rate at recursive resolvers; PMTU cache size (`ip -6 route show cache`); ICMPv6 PTB egress at your firewall.

CLI tools: `ip -6 addr / route / neigh` from iproute2; `mtr -6`; `tcpdump -ni eth0 'ip6 or proto ipv6-icmp'`; for SLAAC specifically, `tcpdump 'icmp6 and ip6[40] >= 133 and ip6[40] <= 137'`. Fernando Gont's `ipv6toolkit` ships `ndisc6`, `rdisc6`, `rltraceroute6`, and `addr6`. Wireshark filters: `ipv6.dst == ff02::1`, `icmpv6.type == 134`, `ipv6.flow != 0`. For end-host sanity, `test-ipv6.com`. For reachability from anywhere, RIPE Atlas probes and the APNIC Labs measurement script.

## What's changing in 2026

**28 March 2026** — Google's IPv6 dashboard recorded **50.1 percent** for the first time. The peak has not been sustained daily; values bounce 45-50 percent with weekend peaks. APNIC Labs and Cloudflare Radar still see global IPv6 capability in the 40-43 percent range. The headline is real. The ceiling is uneven.

**December 2025** — SoftBank announced what it described as the world's first commercial 5G deployment using **SRv6 MUP** (Mobile User Plane).

**OCP Global Summit 2025** — Microsoft presented Azure **Fairwater** with SRv6 as the fabric for what it called the largest AI back-end network in the world.

**October 2024 — RFC 9673** relaxed the Hop-by-Hop Options handling rules of RFC 8200, making HBH options actually deployable on real router silicon.

**August 2024 — RFC 9637** added `3fff::/20` as a second IPv6 documentation prefix on top of `2001:db8::/32`, large enough to model multi-AS networks.

**2024 — RFC 9602** reserved `5f00::/16` for SRv6 SIDs; **RFC 9800** defined compressed SRv6 segment lists (µSID).

**1 February 2024** — AWS began charging **$0.005 per public IPv4 address per hour**, about $3.65 a month, attached or not. The first hard financial push toward IPv6 from a hyperscaler at scale.

**2024** — APNIC was allocated a new /12 (`2410::/12`), giving it a contiguous `2400::/11` to delegate; signal of accelerating IPv6 demand in Asia-Pacific. IPv4 secondary-market prices have fallen from ~$32-36 in mid-2024 toward $20-22 by early 2026, with one /14 transferred at $9 per address — the post-exhaustion oversupply that IPv6 deployment is finally producing.

**December 2022 — Windows 11** finally implemented RFC 7217 stable-privacy interface IDs. EUI-64 MAC-derived addresses are no longer the default on any major OS — fifteen years after the privacy hole was widely known.

**Geoff Huston, October 2024** — projected on linear extrapolation that IPv6 transition completes around late 2045, and warned that v4/v6 coexistence may be a steady state rather than a transition. We unpack that argument in the chapter on IPv6-Mostly.

## Fun facts (host material)

**"It's my fault."** Vint Cerf has publicly blamed himself for the 32-bit address space, repeatedly. His most quotable version, at Linux.conf.au 2011: *"You all know that we are almost out of IPv4 address space. I am a little embarrassed about that because I was the guy who decided that 32-bit was enough for the Internet experiment. My only defense is that that choice was made in 1977, and I thought it was an experiment."* Five years later at Heidelberg he added: *"If I could have justified it, putting in a 128-bit address space would have been nice so we wouldn't have to go through this painful, 20-year process of going from IPv4 to IPv6."* The painful 20 years is now 28.

**Why "v6" not "v5":** Version 5 was already claimed by the experimental ST/ST-II Stream Protocol — a real-time transport designed at MIT and BBN in the 1970s. SIPP took 6 and won at the Toronto IETF on 25 July 1994. Version numbers 7, 8, and 9 went to the also-rans — TUBA, PIP, and CATNIP.

**Why 128 bits:** large enough that any 48-bit Ethernet MAC could be embedded in the bottom half — the **EUI-64** trick — leaving 64 bits for hierarchical aggregation. The "/64-per-link" rule that operators still curse is fundamentally an artefact of that decision. The privacy cost — that for almost two decades every SLAAC-configured device was effectively advertising its hardware MAC to every server it talked to — is the deeper reason we now have RFC 7217 and RFC 8981.

**The KAME turtle.** The **KAME Project** ran from 1998 to March 2006, a joint effort of Fujitsu, Hitachi, IIJ, NEC, Toshiba, Yokogawa, Keio University and the University of Tokyo, sub-project of WIDE, to produce a free reference IPv6 and IPsec stack. It is the ancestor of the IPv6 code in FreeBSD, NetBSD, OpenBSD, macOS, and iOS. The dancing turtle still appears at kame.net to visitors with native IPv6.

**RFC 6214 — IP over Avian Carriers, IPv6 edition.** Yes, this is published. It explicitly extends RFC 1149 to IPv6 with the line: *"As IPv6 has a significantly larger minimum link MTU, larger and more mature pigeons are required to avoid undue packet loss. A minimum age of 1 year is suggested."*

**RFC 5514 — IPv6 over Social Networks.** Eric Vyncke at Cisco, 1 April 2009. Each Facebook user becomes a router with a loopback; friend edges are point-to-point links. A working Facebook prototype was actually built. Its example prefix `2001:db8:face:b00c::/64` lives on in lab configs everywhere — and in 2024 the Linux kernel quietly removed `face:b00c` from a few internal traces because it was being mistaken for a real prefix in copy-pasted configs.

**The 6bone, `3ffe::/16`.** Started at the IETF in March 1996 outside the official process; the first tunnels linked G6 (France), UNI-C (Denmark), and WIDE (Japan). At its 2003 peak, more than 150 prefixes were routed at over 1,000 sites in 50+ countries. Phased out per RFC 3701; routing ceased on 6 June 2006 — date chosen so it could be celebrated as the first global IPv6 Day.

## Where this connects in the book

- **Part Foundations / Chapter "The Layer Model"** — where IPv6 fits in the seven-layer reference and the four-layer reality, and why "Network" still means "the IP layer."
- **Part Foundations / Chapter "Addressing & Identity"** — the longer story of how a packet finds your laptop, from MAC through IP through port to socket, and where 128-bit addresses change the picture.
- **Part Foundations / Chapter "Ports & Sockets"** — how `AF_INET6`, `sockaddr_in6`, the 4-tuple `(host, port, flowinfo, scope_id)`, and IPv4-mapped `::ffff:0:0/96` actually look in the socket API.
- **Part Story of the Internet / Chapter "The OSI vs TCP/IP War"** — David Clark's "rough consensus and running code" line and why CLNP's 20-byte addressing (the TUBA proposal) lost to Steve Deering's SIPP-128.
- **Part Layer 2-3 / Chapter "ARP and NDP"** — the deep dive on NDP, SEND, RA Guard, the 2024 Apple Wi-Fi MAC-rotation episode, and why ARP is approaching vestigial.
- **Part Layer 2-3 / Chapter "IPv4"** — the 32-bit experiment, the exhaustion timeline (IANA Feb 2011 through AFRINIC Apr 2017), CIDR, NAT, RFC 1918, and the AWS forcing function.
- **Part Layer 2-3 / Chapter "IPv6"** — the long-form history: BigTen retreat, Toronto IETF July 1994, RFC 1883/2460/8200, the 28-year transition, and the 50.1% crossing on 28 March 2026.
- **Part Layer 2-3 / Chapter "ICMP"** — Mike Muuss's one-night ping in December 1983, why dropping ICMP at the firewall is partially refusing to implement IP, and why ICMPv6 is integral rather than optional.
- **Part Layer 2-3 / Chapter "BGP"** — how MP-BGP carries IPv6 prefixes via AFI 2 SAFI 1, and the cleanup wave (RFC 9582, 9687, 9774) that finally arrived in 2024-2025.
- **Part Async / IoT / Chapter "CoAP"** — IPv6 on 802.15.4 fragmented down to 80-byte chunks, Thread mesh networks, and Matter's IPv6-only assumption.
- **Part Frontier / Chapter "IPv6-Mostly"** — the modern deployment recipe (DHCPv4 Option 108 + PREF64 + 464XLAT CLAT), the AWS IPv4 charge of 1 February 2024, Apple iCloud Private Relay, and Geoff Huston's late-2045 projection.
- **Part Frontier / Chapter "RPKI + ASPA"** — IPv6 ROA coverage crossed 50% in late 2023, sits at ~54% by end-2024, and the Orange España and Cloudflare 1.1.1.1 hijacks of 2024 that proved the human and config layers still matter.

## See also (other protocol episodes)

**The IPv4 episode.** This is the contrast everything else hangs on. 32-bit addresses, variable header with checksum and options, router fragmentation, broadcast, ARP, DHCP — and 4.3 billion address slots that ran out in February 2011. Listen to that episode first if you want to understand why every architectural decision in IPv6 was made as a deliberate refusal of an IPv4 mistake.

**The TCP episode.** TCP runs identically over IPv6 and IPv4 — same byte stream, same handshake, same congestion control. The only on-the-wire change is the pseudo-header used for the checksum, which now covers 128-bit addresses instead of 32-bit ones. Worth pairing this episode with TCP if you want to understand why "IPv6 is faster than IPv4" is almost always actually "removing NAT made TCP feel faster."

**The UDP episode.** Same story as TCP but with one twist: the UDP checksum is mandatory in IPv6, where it was optional in IPv4. RFC 6935 carved out a zero-checksum exception for some tunnel protocols.

**The Ethernet episode.** EtherType `0x86DD` carries IPv6, where `0x0800` carries IPv4. The multicast MAC mapping is `33:33:` plus the low 32 bits of the IPv6 multicast address — RFC 2464.

**The 802.11 / Wi-Fi episode.** Same L3 picture as Ethernet, but multicast on Wi-Fi is treated specially — APs may convert multicast NS to unicast for sleeping clients, which interacts badly with NDP under load.

**The DNS episode.** AAAA records carry the 128-bit addresses; the reverse zone is `ip6.arpa` with each nibble reversed. RFC 6724 picks the source address; Happy Eyeballs v2 (RFC 8305) races A and AAAA queries with a 250 ms head start to IPv6, and a v3 draft is in progress.

**The DHCP episode.** DHCPv6 (RFC 8415) is a different protocol from DHCPv4 — separate ports, separate options, distinct semantics. The M and O flags in the IPv6 Router Advertisement decide which combination of SLAAC and DHCPv6 the host runs. And, famously, Android does not implement DHCPv6 at all.

**The ICMP episode.** ICMPv6 is structurally part of IPv6, not an optional extra. NDP, SLAAC, MLD, and PMTUD all live on top of it. Firewalls that block ICMPv6 break IPv6 networking — the "Bad Neighbor" episode is one consequence of NDP running in the kernel before any application sees the packet.

**The ARP episode.** ARP (RFC 826, November 1982) is the simplest broadcast you can imagine; NDP is the same shape — solicitation, advertisement — moved onto ICMPv6 multicast and folded together with router discovery and SLAAC. The IPv6 redesign deletes broadcast and replaces it with solicited-node multicast.

## Visual cues for image generation

- The Google IPv6 dashboard line graph from 2008 to 2026, with a single vertical marker at 28 March 2026 where the curve crosses 50.1 percent for the first time. Mobile-carrier launches annotated as small dots — T-Mobile 2014, Reliance Jio 2016, AWS IPv4 charge February 2024.
- The fixed 40-byte IPv6 header drawn as a stack of six 32-bit rows: Version plus Traffic Class plus Flow Label on row one, Payload Length plus Next Header plus Hop Limit on row two, then four rows for source address and four for destination. A red 'X' over the missing checksum field that IPv4 had.
- Side-by-side: an IPv4 ARP broadcast hitting every device on a /24, versus an IPv6 NDP Neighbor Solicitation hitting only the solicited-node multicast group `ff02::1:ff` plus 24 bits of the target. Same target reached, dramatically fewer woken devices.
- A SLAAC sequence diagram — host generates a tentative `fe80::` link-local, sends a DAD Neighbor Solicitation from `::`, then a Router Solicitation to `ff02::2`, receives a Router Advertisement carrying the /64 prefix and the M-O flags, then constructs one stable RFC 7217 address and one rotating RFC 8981 temporary address.
- A world map shaded by IPv6 adoption — France 86 percent, India 67-80 percent, China 77 percent of users, Germany 68 percent, US mobile around 87 percent — alongside a Google logo at 50.1 percent peak.
- The kame.net dancing turtle, with a caption that the FreeBSD, macOS and iOS IPv6 stacks all descend from KAME, a 1998-2006 Japanese collaboration of Fujitsu, Hitachi, IIJ, NEC, Toshiba, Yokogawa, Keio and Tokyo.

## Sources

### RFCs

- [RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification (STD 86)](https://www.rfc-editor.org/rfc/rfc8200)
- [RFC 2460 — Internet Protocol, Version 6 (IPv6) Specification (obsoleted by 8200)](https://datatracker.ietf.org/doc/html/rfc2460)
- [RFC 8981 — Temporary Address Extensions for SLAAC in IPv6](https://www.rfc-editor.org/rfc/rfc8981.html)
- [RFC 4861 — Neighbor Discovery for IPv6](https://www.rfc-editor.org/rfc/rfc4861)
- [RFC 4862 — IPv6 Stateless Address Autoconfiguration](https://www.rfc-editor.org/rfc/rfc4862)
- [RFC 7217 — Stable Privacy Interface IDs](https://datatracker.ietf.org/doc/html/rfc7217)
- [RFC 5952 — IPv6 Address Text Representation](https://datatracker.ietf.org/doc/html/rfc5952)
- [RFC 8305 — Happy Eyeballs v2](https://datatracker.ietf.org/doc/html/rfc8305)
- [RFC 9099 — Operational Security Considerations for IPv6](https://datatracker.ietf.org/doc/rfc9099/)
- [RFC 9098 — Operational Implications of IPv6 Extension Header Drop](https://www.rfc-editor.org/rfc/rfc9098.html)
- [RFC 9637 — `3fff::/20` IPv6 Documentation Prefix](https://datatracker.ietf.org/doc/rfc9637/)
- [RFC 9673 — Hop-by-Hop Options Handling, updates RFC 8200](https://datatracker.ietf.org/doc/rfc9673/)
- [RFC 8986 — SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/)
- [RFC 8925 — IPv6-Only Preferred Option for DHCPv4 (Option 108)](https://datatracker.ietf.org/doc/rfc8925/)
- [RFC 6877 — 464XLAT](https://www.rfc-editor.org/rfc/rfc6877.html)
- [RFC 5514 — IPv6 over Social Networks](https://datatracker.ietf.org/doc/rfc5514/)
- [RFC 7113 — Implementation Advice for RA Guard](https://datatracker.ietf.org/doc/rfc7113/)
- [RFC 1752 — The Recommendation for the IP Next Generation Protocol](https://www.hjp.at/doc/rfc/rfc1752.html)

### Papers

- Czyz, Luckie, Allman, Beverly, Kreibich, Bailey — *Don't Forget to Lock the Back Door! A Characterization of IPv6 Network Security Policy* (NDSS 2016).
- Saidi, Gasser, Smaragdakis — *One bad apple can spoil your IPv6 privacy.* SIGCOMM CCR 52:2, 2022.
- Sattler et al. — *Lazy Eye Inspection: Capturing the State of Happy Eyeballs Implementations.* IMC 2025.
- Hsu, Feamster, Pearce, Li — *The Impact of IP Version on Household Internet Speed.* POMACS 9:3, 2025.
- [arXiv 2205.04193 — IPv6 measurement work](https://arxiv.org/pdf/2205.04193)

### Vendor and engineering blogs

- [APNIC Blog — Google hits 50% IPv6 (Apr 2026)](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
- [APNIC stats — IPv6 dashboard](https://stats.labs.apnic.net/ipv6/)
- [APNIC Labs — The IPv6 Transition (Oct 2024)](https://labs.apnic.net/index.php/2024/10/19/the-ipv6-transition/)
- [Geoff Huston / Potaroo — The IPv6 Transition](https://www.potaroo.net/ispcol/2024-10/ipv6-transition.html)
- [APNIC Blog — IPv6 deployment at APRICOT 2026](https://blog.apnic.net/2026/03/16/ipv6-deployment-at-apricot-2026-scanning-generative-ai-a-home-network-and-a-city/)
- [Cloudflare Radar 2024 Year in Review](https://blog.cloudflare.com/radar-2024-year-in-review/)
- [Cloudflare Radar 2025 Year in Review](https://radar.cloudflare.com/year-in-review/2025)
- [Cloudflare — IPv6 from a DNS POV](https://blog.cloudflare.com/ipv6-from-dns-pov/)
- [Cloudflare — 98% IPv6](https://blog.cloudflare.com/98-percent-ipv6/)
- [Cloudflare — iCloud Private Relay](https://blog.cloudflare.com/icloud-private-relay/)
- [Cloudflare — October 2021 Facebook outage](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Meta engineering — IPv6: it's time to get on board (2015)](https://engineering.fb.com/2015/09/14/networking-traffic/ipv6-it-s-time-to-get-on-board/)
- [Meta engineering — Legacy support on IPv6-only infra (2017)](https://engineering.fb.com/2017/01/17/production-engineering/legacy-support-on-ipv6-only-infra/)
- [Meta engineering — October 4 outage details (2021)](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [AWS — Public IPv4 charge announcement](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/)
- [RIPE Labs — AWS introduces charges for public IPv4 use](https://labs.ripe.net/author/dan-fidler/aws-introduces-charges-for-public-ipv4-use/)
- [RIPE Labs — Deploying IPv6-Mostly Access Networks (Caletka)](https://labs.ripe.net/author/ondrej_caletka_1/deploying-ipv6-mostly-access-networks/)
- [Internet Society — T-Mobile US goes IPv6-only with 464XLAT](https://www.internetsociety.org/deploy360/2014/case-study-t-mobile-us-goes-ipv6-only-using-464xlat/)
- [NANOG — Cameron Byrne, Breaking Free (T-Mobile)](https://archive.nanog.org/sites/default/files/wednesday_general_byrne_breakingfree_11.pdf)
- [Internet Society — Six years since World IPv6 Launch](https://www.internetsociety.org/news/press-releases/2018/six-years-since-world-launch-ipv6-now-dominant-internet-protocol-for-many/)
- [Fedora — IPv6-Mostly Support in NetworkManager](https://fedoraproject.org/wiki/Changes/IPv6-Mostly_Support_In_NetworkManager)
- [Infoblox — Configuring vNIOS for IPv6-only networks](https://www.infoblox.com/blog/ipv6-coe/configuring-infoblox-vnios-for-ipv6-only-networks/)
- [Infoblox — Why you must use ICMPv6 RAs](https://blogs.infoblox.com/ipv6-coe/why-you-must-use-icmpv6-router-advertisements-ras/)
- [Cisco Live 2025 — SRv6 case studies](https://www.ciscolive.com/c/dam/r/ciscolive/global-event/docs/2025/pdf/BRKENT-2520.pdf)
- [Segment-routing.net — SRv6 news](https://www.segment-routing.net/srv6-news)
- [Daniel Stenberg — Even happier eyeballs (2025)](https://daniel.haxx.se/blog/2025/08/04/even-happier-eyeballs/)
- [OneUptime — SLAAC overview](https://oneuptime.com/blog/post/2026-03-20-slaac-overview/view)
- [OneUptime — Temporary vs stable IPv6 addresses](https://oneuptime.com/blog/post/2026-03-20-temporary-vs-stable-ipv6-addresses/view)
- [OneUptime — Happy Eyeballs RFC 8305](https://oneuptime.com/blog/post/2026-03-20-happy-eyeballs-algorithm-rfc8305/view)
- [PacketPushers — IPv6 Buzz IPB166 — Reflections and Projections](https://packetpushers.net/podcasts/ipv6-buzz/ipb166-reflections-and-projections-for-ipv6-in-2024-and-2025/)
- [PacketPushers — IPv6 Buzz IPB160 — RFC 9637](https://packetpushers.net/podcasts/ipv6-buzz/ipb160-the-making-of-rfc-9637-ipv6-documentation-prefix/)
- [Bob Hinden — IPv6 Past, Present, Future (RIPE NCC)](https://www.ripe.net/support/training/ripe-ncc-educa/presentations/bob-hinden-ipv6-pastpresentfuture.pdf)
- [KAME Project newsletter (2005)](https://www.kame.net/newsletter/20051107/)
- [kame.net](https://www.kame.net/)

### Security advisories and writeups

- [McAfee — CVE-2020-16898 Bad Neighbor](https://www.mcafee.com/blogs/other-blogs/mcafee-labs/cve-2020-16898-bad-neighbor/)
- [Rapid7 — Bad Neighbor](https://www.rapid7.com/blog/post/2020/10/14/there-goes-the-neighborhood-dealing-with-cve-2020-16898-a-k-a-bad-neighbor/)
- [Trustwave SpiderLabs — Bad Neighbors](https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/bad-neighbors-can-break-windows-cve-2020-16898/)
- [SANS ISC — CVE-2020-16898 diary](https://isc.sans.edu/diary/CVE-2020-16898:+Windows+ICMPv6+Router+Advertisement+RRDNS+Option+Remote+Code+Execution+Vulnerability/26684)
- [GitHub — Bad Neighbor PoC (Advanced Threat Research)](https://github.com/advanced-threat-research/CVE-2020-16898)
- [MalwareTech — Exploiting CVE-2024-38063](https://malwaretech.com/2024/08/exploiting-CVE-2024-38063.html)
- [OPSWAT — CVE-2024-38063 breakdown](https://www.opswat.com/blog/comprehensive-breakdown-of-cve-2024-38063-a-critical-threat-in-the-windows-tcp-ip-stack)
- [Linux ICMPv6 CVE-2023-6200 writeup](https://u1f383.github.io/linux/2024/12/04/linux-kernel-icmpv6-and-cve-2023-6200.html)
- [6lab.cz — Rogue Router Advertisement attack](http://6lab.cz/rogue-router-advertisement-attack/)

### News

- [The Register — IPv6 50% on Google (Apr 2026)](https://www.theregister.com/2026/04/17/ipv6_50_percent_google/)
- [TechSpot — Google briefly reaches IPv6 parity](https://www.techspot.com/news/112108-google-briefly-reaches-ipv6-parity-half-users-connect.html)
- [PBX Science — 28 years to cross the line](https://pbxscience.com/28-years-to-cross-the-line-why-did-ipv6-take-so-long-to-reach-50/)
- [CloudNews — IPv6 beats IPv4 on Google](https://cloudnews.tech/ipv6-beats-ipv4-on-google-for-the-first-time-but-spain-is-still-far-from-the-real-shift/)
- [European Commission — SoftBank SRv6 MUP 5G](https://digital-strategy.ec.europa.eu/en/miscellaneous/japan-softbank-launches-worlds-first-5g-service-using-segment-routing-ipv6-mobile-user-plane)
- [Vint Cerf on IPv4 depletion (Engadget)](https://www.engadget.com/2011-01-26-vint-cerf-on-ipv4-depletion-who-the-hell-knew-how-much-address.html)
- [CIO — Vint Cerf's dream do-over](https://www.cio.com/article/3123438/vint-cerfs-dream-do-over-2-ways-hed-make-the-internet-different.html)
- [Zorinaq — Vint Cerf's "Internet experiment" quote](http://blog.zorinaq.com/vint-cerfs-internet-experiment-quote/)

### Wikipedia

- [IPv6](https://en.wikipedia.org/wiki/IPv6)
- [IPv6 deployment](https://en.wikipedia.org/wiki/IPv6_deployment)
- [IPv4 address exhaustion](https://en.wikipedia.org/wiki/IPv4_address_exhaustion)
- [World IPv6 Day and World IPv6 Launch Day](https://en.wikipedia.org/wiki/World_IPv6_Day_and_World_IPv6_Launch_Day)
- [6bone](https://en.wikipedia.org/wiki/6bone)
- [KAME Project](https://en.wikipedia.org/wiki/KAME_project)
- [Happy Eyeballs](https://en.wikipedia.org/wiki/Happy_Eyeballs)
- [April Fools' Day RFCs](https://en.wikipedia.org/wiki/April_Fools%27_Day_Request_for_Comments)
- [2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
