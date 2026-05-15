---
id: bgp
type: protocol
name: Border Gateway Protocol
abbreviation: BGP
etymology: "[B]order [G]ateway [P]rotocol"
category: network-foundations
year: 1989
rfc: RFC 4271
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - foundations/addressing
  - layer-2-3/ipv4
  - layer-2-3/icmp
  - layer-2-3/bgp
  - transport/tcp
  - utilities-security/dns
  - patterns-failures/patterns
  - patterns-failures/failure-modes
  - famous-outages/arpanet-1980
  - famous-outages/as-7007-1997
  - famous-outages/pakistan-youtube-2008
  - famous-outages/china-telecom-2010
  - famous-outages/centurylink-2020
  - famous-outages/facebook-2021
  - frontier/rpki-aspa
  - how-to-learn-more/rfcs-to-read
  - how-to-learn-more/courses
  - how-to-learn-more/blogs
  - how-to-learn-more/tools
related_protocols: [tcp, dns, ip, ospf]
related_pioneers: [yakov-rekhter]
related_outages: [as-7007-1997, pakistan-youtube-2008, facebook-2021, centurylink-flowspec-2020]
related_frontier: []
related_rfcs: [5925, 1105, 2918, 5082]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ARPA_Network%2C_Logical_Map%2C_September_1973.jpg/500px-ARPA_Network%2C_Logical_Map%2C_September_1973.jpg
    caption: "ARPANET logical map, September 1973 — the early internet backbone whose successor, the multi-backbone commercial internet of 1989, made BGP necessary."
    credit: "Image — Bolt Beranek and Newman Inc. / Public Domain, via Wikimedia Commons"
visual_cues:
  - "A world map dotted with about eighty thousand colored regions — each one an Autonomous System. Thick lines connect the tier-1 transit providers (Lumen, Telia, NTT, GTT, Cogent, Tata) into a backbone mesh; thinner lines fan out to ISPs and content networks. Caption: 'BGP is how all of these talk to each other.'"
  - "An exploded view of a 19-byte BGP message header — sixteen bytes of all-ones marker, two bytes of length, one byte of type. The marker is greyed out and labelled 'vestigial — was meant to hold an authentication digest, never did.'"
  - "A sequence diagram between Router A in AS 65001 and Router B in AS 65002: TCP SYN, SYN-ACK, ACK on port 179, then OPEN both ways, then KEEPALIVE both ways, then UPDATE messages carrying NLRI 192.0.2.0/24 with AS_PATH 65001 and NEXT_HOP 10.0.0.1."
  - "A pyramid showing the BGP best-path selection ladder — twelve rungs from Cisco Weight at the top, through LOCAL_PREF, AS_PATH length, MED, eBGP-over-iBGP, IGP cost, oldest external route, lowest router ID, down to lowest neighbor IP at the bottom. The ladder is captioned 'walk down until something is decisive.'"
  - "A graph of the IPv4 default-free zone size from 1994 to 2026 — the curve climbs from a few thousand prefixes to over one million, with a vertical line at 12 August 2014 labelled 'The 512K Day' and another at September 2025 labelled '1,000,000 prefixes.'"
  - "A timeline of route-leak incidents: 1997 AS 7007, 2008 Pakistan/YouTube, 2010 China Telecom, 2018 MyEtherWallet, 2019 Verizon/DQE/steel-mill, 2020 CenturyLink Flowspec, 2021 Facebook self-withdrawal, 2024 Cloudflare 1.1.1.1, 2025 Junos/Arista Prefix-SID. A horizontal axis at the bottom shows 'RPKI ROV deployment %' rising from 0 to 54%."
---

# BGP — Border Gateway Protocol

## In one breath

BGP is the protocol that holds the internet together. The internet is not a single network — it is roughly eighty thousand independent networks called Autonomous Systems, each owned by a different ISP, hyperscaler, university, government, or enterprise, and BGP is how they tell each other which IP prefixes they can reach. Every modern packet that crosses from one network to another was steered by a BGP-learned route. There is no central authority and no built-in cryptography; the system runs on filters, conventions, and — increasingly — on RPKI.

## The pitch (cold-open)

In January 1989, two engineers — Yakov Rekhter from IBM and Kirk Lougheed from Cisco — sat in the cafeteria at IETF 12 in Austin, Texas, and sketched a routing protocol on the backs of three napkins. They thought it was a stop-gap. Thirty-seven years later, that sketch — the Border Gateway Protocol — runs every transit and peering relationship on the public internet, carrying about a million IPv4 prefixes and two hundred thousand IPv6 prefixes between roughly eighty thousand Autonomous Systems. It has no central authority. It runs on a kind of trust. And every now and then — say, when a Pittsburgh steel mill accidentally tells the world it is the best path to Cloudflare, or when a Facebook engineer runs the wrong maintenance command — that trust breaks, and a slice of the internet goes dark.

## How it actually works

A BGP session is just two routers, in two different autonomous systems, holding a long-lived TCP conversation on port 179 about which IP prefixes they can reach. Everything else is bookkeeping on top of that conversation.

The conversation has five message types and a small state machine. The first router opens a TCP connection — SYN, SYN-ACK, ACK on port 179. Both sides then send a BGP OPEN message, which carries the sender's AS number, a router ID (usually a loopback IPv4 address), a proposed hold time, and a list of capabilities like four-byte ASN support, route refresh, and the BGP roles defined in RFC 9234. They confirm the OPEN with a KEEPALIVE — the smallest BGP message, just a 19-byte header with no body. The session is now Established, and the two peers start exchanging UPDATE messages.

An UPDATE carries two things: a list of withdrawn prefixes and a list of newly reachable prefixes — the NLRI, Network Layer Reachability Information — together with the path attributes describing those new prefixes. The headline attributes are AS_PATH (the sequence of AS numbers the route has traversed), NEXT_HOP (the IP address to send traffic to), LOCAL_PREF (the operator's local policy preference), and MED (a hint to neighbors about which entry point to prefer). One UPDATE can carry one set of attributes plus many prefixes that share them, which is what keeps the wire efficient when an entire region of the internet changes at once.

KEEPALIVEs flow every thirty seconds or so to prove the session is alive; if no message arrives within the negotiated hold time — ninety seconds in RFC 4271, one hundred eighty in Cisco's default — the session resets and every prefix learned through that peer is withdrawn. NOTIFICATION messages signal fatal errors and tear the session down on the spot.

The fundamental distinction in operations is between eBGP and iBGP. eBGP runs between routers in different ASes — this is the inter-domain routing that connects the internet, and on every eBGP hop the AS_PATH is prepended with the sender's AS number so loops are visible. iBGP runs between routers inside the same AS, and it does not modify the AS_PATH. That choice is what forces large iBGP networks to either run a full mesh of sessions, or use route reflectors (RFC 4456), or use confederations (RFC 5065), to prevent routes from looping internally.

### Header at a glance

Every BGP message starts with a 19-byte fixed header.

- 16 bytes of Marker, all ones (0xFF…FF). It was originally a placeholder for an authentication digest. It is now vestigial — modern authentication lives below BGP, in TCP-MD5 or TCP-AO, or above BGP, in RPKI.
- 2 bytes of Length, total message length from header to end of body. Standard maximum is 4096 bytes; the extended-message capability raises it to 65535.
- 1 byte of Type. Type 1 is OPEN, 2 is UPDATE, 3 is NOTIFICATION, 4 is KEEPALIVE, 5 is ROUTE-REFRESH (RFC 2918).

The OPEN body adds version (always 4), the sender's two-byte AS number (or AS_TRANS = 23456 for a four-byte ASN talking to a legacy peer), hold time, the 32-bit BGP identifier, and a list of optional capabilities. The UPDATE body carries withdrawn-routes length, withdrawn routes, total path-attribute length, the path attributes themselves, and finally the NLRI prefixes. A KEEPALIVE is exactly 19 bytes — header only, type 4. A NOTIFICATION carries an error code, a subcode, and optional data; sending one terminates the session.

### State machine in three sentences

A BGP session walks through six states: Idle, Connect, Active, OpenSent, OpenConfirm, Established. Idle is "I am willing to peer"; Connect and Active are "I am trying to bring up TCP"; OpenSent and OpenConfirm are "we are exchanging OPENs and the first KEEPALIVE"; Established is "we are exchanging routes." Any error or hold-timer expiry drops the session back to Idle and withdraws every prefix learned through it — which is exactly why a single misconfigured filter on one large peer can vanish thousands of routes from the global table in seconds.

### Reliability, security, and best-path selection

BGP runs on TCP because routing information must never be lost, duplicated, or reordered. The cost is head-of-line blocking — a slow processor at either end stalls everything. RFC 9687, published in November 2024, added a SendHoldTimer to the BGP state machine specifically to fix the "BGP zombie" failure mode, where a TCP socket stops draining and historical implementations would happily wait forever, leaving withdrawn routes lingering in peers' tables.

Authentication is patchy. TCP-MD5 (RFC 2385) was the original session-protection mechanism and is now deprecated. TCP-AO (RFC 5925) is the modern replacement; native Linux support shipped in kernel 6.7 in January 2024. GTSM (RFC 5082) is the cheap defense — set the IP TTL on eBGP packets to 255 and reject anything below 254, which prevents off-path attackers from spoofing eBGP traffic. Real cryptographic origin protection lives outside BGP, in RPKI; we will get to that.

When a router has more than one path to the same prefix, it walks down the best-path ladder: Cisco Weight (locally configured, highest wins), then LOCAL_PREF (highest wins), then locally originated routes, then shortest AS_PATH, then lowest ORIGIN, then lowest MED (only between paths from the same neighbor AS), then eBGP over iBGP, then lowest IGP cost to the next hop, then oldest external route, then lowest router ID, then shortest cluster-list, then lowest neighbor IP. It stops at the first decisive tiebreaker. Most operational misconfigurations are at one of the top three rungs.

## Where it shows up in production

Tier-1 transits — Lumen, Telia/Arelion, NTT (AS 2914), GTT, Cogent, Tata, Zayo — each carry the full default-free zone on every border router. About one million IPv4 prefixes plus two hundred thousand IPv6 prefixes, all the time. Memory and route-processor capacity on the line cards is the binding constraint, and the FIB has to do a million-entry longest-prefix-match in roughly seventy nanoseconds at 10 Tb/s, which is why these routers use TCAM-style hardware for the lookups.

Cloudflare runs BGP anycast across more than 335 cities. The same /24s are announced from hundreds of POPs simultaneously, and BGP plus the routing system pulls each user to the nearest one. Cloudflare's looking-glass posts and the annual blog series on BGP incidents are some of the most field-tested operational writing in the discipline.

The hyperscalers run some of the largest BGP networks in the world. Google is AS 15169, AWS is AS 16509, Microsoft is AS 8075, Meta is AS 32934, Akamai is AS 20940. AWS Direct Connect, Azure ExpressRoute, and GCP Cloud Interconnect all use BGP to peer with customer networks. Inside the data center, Meta's 2021 NSDI paper — "Running BGP in Data Centers at Scale" — documented their decision to use BGP-4 with hierarchical AS numbering as the only routing protocol inside the fabric, replacing OSPF entirely. That design is now common across the industry and is the reason FRRouting, the open-source fork of Quagga, has a huge production footprint via SONiC and similar Linux-based network operating systems.

Internet Exchange Points run BIRD or OpenBGPD route servers so that each member network can pick up routes from many peers over a single session. RFC 7947 codifies the route-server semantics. BIRD 3.0, released in January 2025, was the first stable multithreaded version and scales to more than five thousand peers — the kind of fan-out that AMS-IX, DE-CIX, and LINX need.

The numbers as of early 2026 are worth holding in your head. The default-free zone exceeded one million IPv4 prefixes in September 2025. Geoff Huston's APNIC vantage point in AS 131072 was seeing roughly 1.2 million IPv4 prefixes from 1,026 BGP peers at the start of 2026. There are about eighty thousand active ASes visible in BGP, out of roughly 120,000 allocated. Daily churn under normal conditions runs 15,000–25,000 IPv4 withdrawals; less than 5% of unstable prefixes generate fully half of all updates, and fifty origin ASes account for a third. Most of the internet is, in fact, very stable; a small minority generates almost all the noise.

## Things that go wrong

BGP outages have their own folklore. The detailed retellings live in the chapter episodes — what follows is the compressed mechanism of each one and where to find the full story.

**AS 7007, 25 April 1997.** A misconfigured Bay Networks router at MAI Network Services in Florida dumped its forwarding table into BGP as if every entry were a route AS 7007 originated. The leak came out as /24s, which beat every legitimate /16 and /8 under longest-prefix match, and within minutes the entire internet was funneling traffic through one underpowered Florida router. Sprint and large parts of the global net went dark for hours. The full story — including Vince Bono's apology email to NANOG, which became the template for incident communication — is in the famous-outages chapter on AS 7007.

**Pakistan/YouTube, 24 February 2008.** Pakistan Telecom (AS 17557) tried to null-route YouTube domestically by injecting a more-specific 208.65.153.0/24 inside its own AS. Its upstream PCCW (AS 3491) had no inbound filter, propagated the route globally, and YouTube went dark for about two hours — every YouTube request on the planet was being silently dropped in Karachi. The famous-outages chapter on Pakistan/YouTube covers it in detail and is the entry point for understanding why "more specific wins" is both genius and curse.

**China Telecom, 8 April 2010.** AS 23724 announced about 37,000 prefixes — roughly 15% of the global table — for eighteen minutes, including U.S. military and government networks. Whether it was an accident or an intelligence operation has never been settled; the technical fact that any AS can do this in seconds is the point. The famous-outages chapter on China Telecom is the canonical retelling.

**CenturyLink Flowspec, 30 August 2020.** CenturyLink (AS 209) pushed a BGP Flowspec rule across its tier-1 backbone to mitigate a customer's DDoS. The rule's match criteria were too broad — they accidentally matched BGP itself, including the keepalives carrying the next rule. Sessions died, re-established, re-received the rule, died again. Cloudflare measured a 3.5% drop in global internet traffic over the five-hour cascade. CenturyLink had to ask other tier-1s to de-peer temporarily so the BGP-update queue could drain. The chapter on CenturyLink Flowspec 2020 walks through the full loop and the architectural lesson — never deploy a feature whose failure mode disables the channel that controls it.

**Facebook, 4 October 2021.** A Meta engineer ran a routine command intended to assess global backbone capacity. A bug in the change-audit tool failed to catch a side effect: the command disconnected Meta's entire backbone. Meta's edge DNS servers, configured to withdraw their BGP advertisements when they could not reach the data centers, did exactly that. Within minutes facebook.com, instagram.com, and whatsapp.com were SERVFAIL globally; Cloudflare's 1.1.1.1 saw a 30× spike in queries; engineers could not badge into the buildings because the badge readers depended on the same DNS. Recovery took roughly six and a half hours, mostly because access to the routers themselves had to be physical. The famous-outages chapter on the Facebook 2021 cascade is the full story.

**Verizon × DQE × Allegheny Technologies, 24 June 2019.** A Pittsburgh ISP ran a Noction BGP optimizer that fragmented internet routes into more-specifics inside its network. It announced these to its customer Allegheny Technologies, a steel manufacturer, whose static route to Verizon had no inbound filter. Verizon redistributed the leak to the world. About 20,000 prefixes for 2,400 networks were rerouted through a steel mill. Cloudflare lost 15% of global traffic at peak.

**KlaySwap, 3 February 2022.** Attackers BGP-hijacked Kakao's prefix to obtain a valid TLS certificate for `developers.kakao.com` via Domain Control Validation, then served replacement JavaScript that authorized user wallets to attacker-controlled smart contracts. Loss: about $1.9 million. This was the first known live attack that used BGP to break the WebPKI, and it is a major reason Let's Encrypt now does multi-perspective issuance.

**Rogers Communications, 8 July 2022.** Phase six of a seven-phase IP core upgrade deleted a routing filter on three distribution routers. Every possible internet route then flooded into the core. Memory and CPU saturated, BGP sessions dropped, and the wireless plus wireline shared core collapsed. Twelve million Canadians lost mobile, home internet, and 911 service for twenty-six hours. The Xona Partners review for the CRTC concluded the failure was preventable with overload protection and out-of-band management.

**Junos and Arista Prefix-SID reset, 20 May 2025.** A malformed UPDATE carrying an all-zero RFC 8669 Prefix-SID attribute (number 40) leaked onto the public DFZ. Junos and Arista EOS crashed sessions on receipt; IOS-XR, Nokia SR OS, and BIRD correctly applied RFC 7606 "treat-as-withdraw." It was a textbook reminder that vendor implementation diversity is a feature, not a bug, and that RFC 7606 still is not uniformly applied to every attribute type.

**Cloudflare 1.1.1.1, 27 June 2024 and 14 July 2025.** The first was a hijack — a Brazilian ISP, Eletronet (AS 267613), originated 1.1.1.1/32. Cloudflare's ROA covered up to maxLength /24, so a /32 was not RPKI-invalid; PEER 1 (AS 1031) accepted and propagated. Three hundred networks in seventy countries lost 1.1.1.1. The second was Cloudflare's own internal misconfiguration that withdrew 1.1.1.0/24 for about an hour. Different mechanisms, same lesson: ROA maxLength matters, and a missing route can look exactly like a hijack.

## Common pitfalls (for the practitioner)

**No prefix filters means catastrophic leaks.** Without max-prefix limits and explicit allow-lists, a single misconfigured customer can announce the entire global table to you, which you will then propagate to your peers. AS 7007 was the canonical case; the Verizon/DQE incident in 2019 was the modern dress. Cure: max-prefix on every BGP session, explicit prefix-list filters from customers, and tear the session down automatically if a peer suddenly sends ten times its normal count.

**Hard reset versus soft reset.** A hard reset of a BGP session withdraws every route and re-learns them, visible to the entire internet. A soft reset (route-refresh capability, RFC 2918) just reapplies policy without dropping the session. Always prefer soft reset when you change a filter policy — your global peers will not notice.

**MED across ASes.** MED is meaningful only between paths from the same neighbor AS. Comparing MEDs across different neighbor ASes is meaningless and routinely misconfigured. Every BGP operator burns a few hours on this once.

**AS-path prepending used too aggressively.** Prepending your own AS multiple times makes the path longer to discourage inbound traffic, but it is just a longer path — sometimes it loses to a shorter leaked path. Geoff Huston's 2025 update-churn data shows a small number of pathological prependers generate a third of all BGP updates.

**GTSM gotcha.** If you enable RFC 5082 GTSM on your end and your peer does not, the session simply never establishes. Check both ends.

**Static routes redistributed into BGP.** The Rogers 2022 trigger.

**Allow-all import on a route reflector.** Trusting your own iBGP because it is "internal" is how internal mistakes become external incidents.

**Sister-network blind trust.** The 2024 Orange España incident — a threat actor used credentials harvested by infostealer malware to log in to Orange Spain's RIPE NCC account, then edited ROAs to make legitimate prefixes RPKI-invalid. The vulnerability was the human-facing authentication on the RIR portal. Lesson: enforce 2FA on every RIR account.

**Route flap dampening misconfiguration.** The default RFD parameters were deprecated by RIPE-378 back in 2006; modern recommendation is RFC 7196 / RIPE-580.

**ROAs that do not cover hijacks.** A maxLength of /24 on a /24 ROA does not protect against a /32 hijack — the 1.1.1.1 incident in June 2024 is the cleanest demonstration.

## Debugging it

The day-to-day commands are vendor-specific but conceptually identical: `show ip bgp summary` and `show ip bgp X.X.X.X` on Cisco, `show route protocol bgp` on Junos, `show ip bgp summary` on FRR. Wireshark dissects BGP cleanly; the dissector understands every attribute type and the message-type filter `bgp` does what you expect.

For looking at the global view from someone else's vantage point, the looking-glass services are the standard tool — Hurricane Electric at lg.he.net and bgp.he.net, Cogent's looking glass, NTT's, RIPE RIS Live at ris-live.ripe.net for streaming updates, and bgp.tools for live propagation views. CAIDA's BGPstream is the standard for retrospective MRT analysis, working off the long-running RouteViews and RIPE RIS dumps. RouteViews has been collecting since 1997; RIS since 2001; together they are the closest the internet has to a continuous historical log of itself.

For monitoring your own routers, BMP — the BGP Monitoring Protocol, RFC 7854 — streams the router's BGP state out to a collector (OpenBMP, Kentik, ThousandEyes, Cisco Crosswork). It is the modern alternative to screen-scraping CLI. Combine it with BFD (RFC 5880) for sub-second peer-down detection — do not trust the 90-second hold timer for fast failover.

For lab work, Containerlab spins up a multi-router BGP topology with FRR, BIRD, or SR-Linux in under a minute on a laptop. It is the way to learn the protocol now.

## What's changing in 2026

**RPKI ROV crosses 50% of advertised IP space.** As of early 2026, NIST's RPKI Monitor and Cloudflare's isbgpsafeyet.com show roughly 54% of IPv4 prefixes and 54% of IPv6 prefixes covered by signed Route Origin Authorisations, and about 74% of IP traffic is destined to ROA-covered networks. IPv4 first crossed 50% in May 2024; IPv6 had crossed earlier, in late 2023. Most tier-1 transits now enforce ROV on incoming announcements — the question has shifted from "will the big networks deploy?" to "when do the smaller transits catch up?"

**RFC 9774 deprecates AS_SET and AS_CONFED_SET (May 2025).** Speakers must "treat-as-withdraw" any UPDATE containing them, retiring a piece of BGP that has been "considered harmful" for a decade.

**RFC 9687 closes the BGP zombie hole (November 2024).** The new SendHoldTimer tears the session down if your TCP socket stops draining — the failure mode that left withdrawn routes lingering in peers' tables for months at a time.

**RFC 9582 refreshes the ROA profile (May 2024).** Replaces RFC 6482, clarifies X.509 extensions, and mandates a canonicalisation procedure. Authors: Snijders, Maddison, Lepinski, Kong, Kent.

**ASPA approaches IETF last call.** AS Provider Authorization extends RPKI from origin validation to AS-path validation, closing the route-leak hole that origin validation alone cannot fix. As of May 2026, draft-ietf-sidrops-aspa-verification-25 (October 2025) and draft-ietf-sidrops-aspa-profile-26 (April 2026) are the live drafts; SIDROPS chair Job Snijders has signalled the working group is "close to last call." Cisco IOS-XR ran an Early Field Trial in 2025; OpenBGPD, BIRD 2.16+, and Routinator already have ASPA support.

**RFC 9234 BGP Roles + OTC is doing real work right now.** Routers negotiate Provider, Customer, Peer, or Route-Server roles inline at session establishment, and the Only-To-Customer attribute prevents accidental upward leaks. Cloudflare's September 2025 APNIC blog post argues this is the cheapest, most actionable defense for transit operators. Already in BIRD, FRR, IOS-XR, and Junos.

**FCC Notice of Proposed Rulemaking (June 2024).** First U.S. federal proposal to compel the nine largest BIAS providers (AT&T, Altice, Charter, Comcast, Cox, Lumen, T-Mobile, TDS/US Cellular, Verizon) to file BGP Routing Security Risk Management Plans and quarterly RPKI deployment reports. As of March 2024, only about 22% of U.S.-originated routes had ROAs.

**TCP-AO finally lands in Linux 6.7 (January 2024).** Native TCP Authentication Option (RFC 5925) gives BGP sessions a modern replacement for deprecated TCP-MD5. Cisco IOS-XR and Junos already had it; Linux was the long pole.

**BIRD 3.0 ships multithreaded (January 2025).** First stable multithreaded BIRD, scaling to 5,000+ peers. The IXP route-server world quietly upgrades.

**BGPsec is dead in the water.** Negligible production deployment. The combinatorial signature size, the lack of fast crypto in router silicon, and the absence of incremental-deployment benefit have left it almost entirely unimplemented. ASPA and RFC 9234 have eaten its lunch.

**Quantum threats to RPKI.** RPKI relies on RSA-2048 signatures. SIDROPS has multiple drafts in flight — `draft-doesburg-sidrops-nullscheme`, `draft-doesburg-2025-pqc`, `schulmann-2025-pruning` (iRPKI) — plus an academic pqRPKI proposal that uses Merkle Tree Ladders to amortize the much larger post-quantum signature sizes (Falcon and ML-DSA blow up repository size dramatically). NIST finalized ML-DSA, ML-KEM, and SLH-DSA on 13 August 2024; FN-DSA draft FIPS 206 was submitted 28 August 2025. The transition will be slow.

**ML for BGP anomaly detection in production.** Cristel Pelsser's GILL, the DFOH paper (Detecting Forged Origin Hijacks), and MVP (Multi-View Pivots) all came out of the 2024–2025 research cycle. Production deployments at Kentik, Catchpoint, and Cloudflare Radar use inferred AS relationships to flag valley-free violations in real time.

## Fun facts (host material)

**The napkin location, verified.** January 1989, IETF 12, Austin, Texas. Yakov Rekhter from IBM's T.J. Watson Research Center and Kirk Lougheed from Cisco met at lunch in the cafeteria. Cisco co-founder Len Bosack was at the table. They sketched the protocol on the back of two napkins — expanded shortly after to three handwritten sheets, hence "Two-Napkin" or sometimes "Three-Napkin" Protocol. The originals went in the trash; Cisco's archivist preserved photocopies, which now hang on a wall at Cisco in Milpitas. Six months later the sketch was published as RFC 1105.

**The 16-byte all-ones Marker is vestigial.** It was originally a placeholder for an authentication digest that never materialized. Modern authentication is below BGP (TCP-MD5, TCP-AO) or above (RPKI, BGPsec, ASPA). The running joke that BGP doesn't have a real authentication story for 30+ years rests on this single field.

**BGP has no built-in authentication.** When AS A says "I can reach 8.8.8.0/24 in two hops," AS B has to choose whether to believe it. There is no cryptographic proof in the protocol itself. This is the architectural reason every BGP hijack of the last 25 years was possible — AS 7007, Pakistan/YouTube, China Telecom, Facebook 2021, KlaySwap. RPKI is a bolted-on PKI, not an in-band signature.

**Yakov Rekhter has authored more than eighty RFCs.** Beyond BGP itself: BGP/MPLS L3VPNs (RFC 4364), CIDR (RFC 4632), much of MPLS, RSVP-TE, and many EVPN drafts. The internet runs on a protocol he sketched on three napkins, and he kept going.

**The 512K Day, 12 August 2014.** The IPv4 default-free zone crossed 512,000 prefixes. Older Cisco line cards with default 512K-route TCAMs failed silently. eBay, LastPass, and Microsoft Azure had visible outages. Lesson: pay attention to your hardware FIB ceiling years in advance — the table only grows.

**`<AS>:666` is a black-hole community.** Some networks accept the BGP community ending in 666 to drop traffic to a prefix at the carrier — a DDoS mitigation idiom popularized by RFC 7999 (BLACKHOLE community). One of the few places routing engineers get to be playful in a config file.

**BGP zombies are real.** Routes that should have been withdrawn but persist because a TCP socket stopped draining. Geoff Huston dedicated a full APNIC podcast episode to them in March 2025; the underlying failure mode is what RFC 9687's SendHoldTimer was created to fix.

**RFC 1925, "The Twelve Networking Truths" (April 1996).** Truth #11: "Every old idea will be proposed again with a different name and a different presentation, regardless of whether it works." A surprising amount of BGP work is rediscovery — ASPA is in part RFC 1965 BGP Confederations revisited with cryptography.

## Where this connects in the book

- **Foundations / "The Layer Model"** — where BGP sits in the seven-layer mental model and why an "application-layer" protocol that runs over TCP turns out to be the universal control plane for L3.
- **Foundations / "Addressing & Identity"** — IPs, ASNs, prefixes, the namespaces BGP advertises and the ones it depends on.
- **Layer 2-3 / "IPv4"** — the 32-bit address space whose roughly one million advertised prefixes BGP carries; CIDR co-evolved with BGP-4 in the mid-1990s.
- **Layer 2-3 / "ICMP"** — the diagnostic backplane, and a reminder that ICMP's parent GGP (RFC 823) was the grand-uncle of BGP via EGP.
- **Layer 2-3 / "BGP"** — the full chapter on the napkin sketch, the catalogue of famous failures, and the 2024–2026 cleanup wave.
- **Transport / "TCP"** — why BGP rides on TCP for reliability, the head-of-line cost, and how the BGP zombie failure mode comes from TCP zero-window stalls.
- **Utilities & Security / "DNS"** — the BGP/DNS co-dependency that made the 2021 Facebook outage cascade so spectacular.
- **How Networks Actually Behave / "Recurring Patterns"** — keepalives, sliding windows, and the other primitives BGP shares with every other long-lived protocol.
- **How Networks Actually Behave / "Failure Modes"** — where BGP hijacks, microloops, and cascading failures sit in the broader bestiary.
- **Famous Outages / "ARPANET 1980 — The First Major Crash"** — the original "three bits in a routing update killed everything," and the start of the public-postmortem tradition.
- **Famous Outages / "AS 7007 1997"** — the Florida router that ate the internet, and the canonical inspiration for max-prefix limits.
- **Famous Outages / "Pakistan/YouTube 2008"** — a domestic block becoming the world's outage in three minutes flat.
- **Famous Outages / "China Telecom 2010"** — 15% of the internet's traffic with an unauthorized observer for eighteen minutes.
- **Famous Outages / "CenturyLink Flowspec 2020"** — the BGP rule that killed the BGP session that delivered it.
- **Famous Outages / "Facebook 2021 — The Cascade"** — BGP, DNS, and badge readers, six hours of compounding failure.
- **The Modern Frontier / "RPKI + ASPA"** — cryptographic BGP arriving at last, the RPKI 50% milestone in May 2024, and the ASPA drafts approaching last call.
- **How to Learn More / "RFCs Worth Reading"** — RFC 4271 (BGP-4), with a nod to Section 5 (path attributes) where most of the engineering interest lives.
- **How to Learn More / "Courses"** — Berkeley CS168 builds a small BGP simulator; Princeton COS 461 (Jennifer Rexford) is strong on inter-domain routing.
- **How to Learn More / "Blogs"** — Cloudflare's incident write-ups and Geoff Huston's annual "BGP in 2025" essay on APNIC Labs.
- **How to Learn More / "Tools"** — Wireshark for the wire, FRRouting and BIRD for the daemon, Containerlab for topologies, RIPE Atlas for measurement, bgp.tools for the modern looking glass.

## See also (other protocol episodes)

- **TCP.** BGP runs on top of TCP port 179, relying on TCP's reliable, in-order, congestion-controlled byte stream. The cost is head-of-line blocking — a slow processor on either end stalls everything, which is exactly the failure mode that produced "BGP zombies" and the new SendHoldTimer in RFC 9687. If you have heard the TCP episode, the contrast with BGP's stateful long-lived session is everything.
- **DNS.** BGP and DNS are co-dependent in a way that makes outages spectacular. DNS lookups need BGP-supplied routes to find a resolver; authoritative DNS servers are reachable only because BGP advertises their prefixes. The Facebook 2021 cascade is the textbook case — a backbone change caused the edge DNS servers to withdraw their own BGP routes (they were configured to do so when isolated from the data centers), and from the outside Facebook ceased to exist. The DNS episode covers the other side of this dependency.
- **IPv4 (and IPv6).** BGP-4 was originally IPv4-only; the Multiprotocol BGP extensions in RFC 4760 generalized it through MP_REACH_NLRI and the AFI/SAFI tag. IPv4 unicast is AFI=1, SAFI=1; IPv6 unicast is AFI=2, SAFI=1. Modern hyperscalers run IPv6-only data-center underlays using RFC 8950 to advertise IPv4 NLRI with an IPv6 next hop. The IPv4 and IPv6 episodes give the full address-space story.
- **OSPF (and IS-IS).** The interior gateway protocols. BGP carries reachability between Autonomous Systems; OSPF (campus, enterprise, mid-tier ISP) and IS-IS (tier-1 backbones) carry reachability inside one. BGP's NEXT_HOP is typically resolved through the IGP — the IGP tells the router how to reach the BGP next hop. Every modern internet packet that crosses AS boundaries was routed by both protocols in concert.

## Visual cues for image generation

- A world map dotted with about eighty thousand colored regions — each one an Autonomous System. Thick lines connect the tier-1 transit providers (Lumen, Telia, NTT, GTT, Cogent, Tata) into a backbone mesh; thinner lines fan out to ISPs and content networks. Caption: "BGP is how all of these talk to each other."
- An exploded view of a 19-byte BGP message header — sixteen bytes of all-ones Marker, two bytes of Length, one byte of Type. The Marker is greyed out and labelled "vestigial — meant to hold an authentication digest, never did."
- A sequence diagram between Router A (AS 65001) and Router B (AS 65002): TCP SYN, SYN-ACK, ACK on port 179; then OPEN both ways; then KEEPALIVE both ways; then UPDATE messages carrying NLRI 192.0.2.0/24 with AS_PATH 65001 and NEXT_HOP 10.0.0.1. State labels in the margin: Idle, Connect, OpenSent, OpenConfirm, Established.
- A pyramid of the BGP best-path selection ladder — twelve rungs from Cisco Weight at the top, through LOCAL_PREF, AS_PATH length, MED, eBGP-over-iBGP, IGP cost, oldest external, lowest router ID, down to lowest neighbor IP at the bottom. Captioned "walk down until something is decisive."
- A graph of the IPv4 default-free zone size from 1994 to 2026 — the curve climbs from a few thousand prefixes to over one million, with a vertical line at 12 August 2014 labelled "The 512K Day" and another at September 2025 labelled "1,000,000 prefixes."
- A timeline of route-leak incidents along the top: 1997 AS 7007, 2008 Pakistan/YouTube, 2010 China Telecom, 2018 MyEtherWallet, 2019 Verizon/DQE/steel-mill, 2020 CenturyLink Flowspec, 2021 Facebook self-withdrawal, 2024 Cloudflare 1.1.1.1, 2025 Junos/Arista Prefix-SID. Beneath it, an "RPKI ROV deployment %" axis rising from 0 in 2008 to 54% in 2026.

## Sources

### RFCs

- [RFC 4271 — A Border Gateway Protocol 4 (BGP-4)](https://datatracker.ietf.org/doc/html/rfc4271)
- [RFC 1105 — A Border Gateway Protocol (BGP)](https://datatracker.ietf.org/doc/rfc1105/)
- [RFC 2918 — Route Refresh Capability for BGP-4](https://www.rfc-editor.org/rfc/rfc2918)
- [RFC 5082 — The Generalized TTL Security Mechanism (GTSM)](https://datatracker.ietf.org/doc/html/rfc5082)
- [RFC 5925 — The TCP Authentication Option](https://datatracker.ietf.org/doc/html/rfc5925)
- [RFC 6793 — BGP Support for Four-Octet AS Number Space](https://datatracker.ietf.org/doc/html/rfc6793)
- [RFC 4760 — Multiprotocol Extensions for BGP-4](https://datatracker.ietf.org/doc/html/rfc4760)
- [RFC 4456 — BGP Route Reflection](https://datatracker.ietf.org/doc/html/rfc4456)
- [RFC 5065 — Autonomous System Confederations for BGP](https://datatracker.ietf.org/doc/html/rfc5065)
- [RFC 8092 — BGP Large Communities](https://datatracker.ietf.org/doc/html/rfc8092)
- [RFC 7454 / BCP 194 — BGP Operations and Security](https://datatracker.ietf.org/doc/html/rfc7454)
- [RFC 9234 — Route Leak Prevention via OPEN Roles and OTC](https://www.rfc-editor.org/rfc/rfc9234.html)
- [RFC 9494 — Long-Lived Graceful Restart for BGP](https://datatracker.ietf.org/doc/rfc9494/)
- [RFC 9552 — BGP-LS, refreshed](https://www.rfc-editor.org/rfc/rfc9552.html)
- [RFC 9582 — A Profile for Route Origin Authorizations](https://datatracker.ietf.org/doc/rfc9582/)
- [RFC 9687 — BGP-4 Send Hold Timer](https://datatracker.ietf.org/doc/rfc9687/)
- [RFC 9774 — Deprecation of AS_SET and AS_CONFED_SET](https://datatracker.ietf.org/doc/rfc9774/)
- [RFC 8205 — BGPsec Protocol Specification](https://datatracker.ietf.org/doc/rfc8205/)
- [RFC 5880 — Bidirectional Forwarding Detection (BFD)](https://datatracker.ietf.org/doc/html/rfc5880)
- [RFC 7854 — BGP Monitoring Protocol (BMP)](https://datatracker.ietf.org/doc/html/rfc7854)
- [RFC 8950 — IPv4 NLRI with IPv6 Next Hop](https://datatracker.ietf.org/doc/html/rfc8950)
- [RFC 7999 — BLACKHOLE Community](https://datatracker.ietf.org/doc/html/rfc7999)
- [draft-ietf-sidrops-aspa-verification](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-verification/)
- [draft-ietf-sidrops-aspa-profile](https://datatracker.ietf.org/doc/draft-ietf-sidrops-aspa-profile/)

### Papers

- [Abhashkumar et al., "Running BGP in Data Centers at Scale," NSDI 2021](https://www.usenix.org/conference/nsdi21/presentation/abhashkumar)
- [Gao & Rexford, "Stable Internet Routing Without Global Coordination," IEEE/ACM ToN 2001](https://doi.org/10.1109/90.974523)
- [SIDN Labs, "Post-Quantum Cryptography for the RPKI"](https://www.sidnlabs.nl/downloads/6mCHukPGqoY0ojSMqfIadD/3dd4a89b54d6eb38bf634076505eec8c/PQC_for_the_RPKI.pdf)

### Vendor and engineering blogs

- [Cloudflare — Understanding How Facebook Disappeared from the Internet (Oct 2021)](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Cloudflare — How Verizon and a BGP Optimizer Knocked Large Parts of the Internet Offline (2019)](https://blog.cloudflare.com/how-verizon-and-a-bgp-optimizer-knocked-large-parts-of-the-internet-offline-today/)
- [Cloudflare — 1.1.1.1 incident on June 27, 2024](https://blog.cloudflare.com/cloudflare-1111-incident-on-june-27-2024/)
- [Cloudflare — Route leak incident on January 22, 2026](https://blog.cloudflare.com/route-leak-incident-january-22-2026/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Meta Research — Steering Oceans of Content (Edge Fabric, 2017)](https://research.fb.com/blog/2017/08/steering-oceans-of-content-to-the-world/)
- [APNIC — Geoff Huston, "BGP in 2025"](https://blog.apnic.net/2026/01/08/bgp-in-2025/)
- [APNIC — Geoff Huston, "BGP updates in 2025"](https://blog.apnic.net/2026/01/09/bgp-updates-in-2025/)
- [APNIC — RPKI's 2025 Year in Review](https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/)
- [APNIC — Night of the BGP Zombies (podcast, March 2025)](https://blog.apnic.net/2025/03/06/podcast-night-of-the-bgp-zombies/)
- [APNIC — Preventing route leaks made simple: BGP Roleplay](https://blog.apnic.net/2025/09/05/preventing-route-leaks-made-simple-bgp-roleplay/)
- [Ben Cartwright-Cox — Junos/Arista session-reset incident analysis](https://blog.benjojo.co.uk/post/bgp-attr-40-junos-arista-session-reset-incident)
- [Ivan Pepelnjak — BGP Graceful Restart Considered Harmful](https://blog.ipspace.net/2024/01/bgp-graceful-restart-harmful/)
- [Kentik — Cloudflare's DNS downtime: BGP hijacks were never to blame](https://www.kentik.com/blog/cloudflares-dns-downtime-why-bgp-hijacks-were-never-to-blame/)
- [Kentik — A Brief History of the Internet's Biggest BGP Incidents](https://www.kentik.com/blog/a-brief-history-of-the-internets-biggest-bgp-incidents/)
- [MANRS — RPKI growth in 2024](https://manrs.org/2025/01/rpki-growth-2024/)
- [Computer History Museum — The Two-Napkin Protocol](https://computerhistory.org/blog/the-two-napkin-protocol/)
- [Cisco — The Two-Napkin Protocol](https://weare.cisco.com/c/r/weare/amazing-stories/amazing-things/two-napkin.html)
- [Internet Society — BGPsec: Reality Now (2017)](https://www.internetsociety.org/blog/2017/10/bgpsec-reality-now/)
- [RIPE NCC — YouTube Hijacking case study](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
- [ThousandEyes — Cloudflare outage analysis (July 14, 2025)](https://www.thousandeyes.com/blog/cloudflare-outage-analysis-july-14-2025)

### News and regulatory

- [SecurityWeek — BGP flaw can be exploited for prolonged internet outages](https://www.securityweek.com/bgp-flaw-can-be-exploited-for-prolonged-internet-outages/)
- [Bleeping Computer — Cloudflare misconfiguration behind recent BGP route leak](https://www.bleepingcomputer.com/news/security/cloudflare-misconfiguration-behind-recent-bgp-route-leak/)
- [The Register — MyEtherWallet DNS hijack (April 2018)](https://www.theregister.com/2018/04/24/myetherwallet_dns_hijack/)
- [CRTC — Xona Partners Rogers outage review (2024)](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)
- [CBC News — Rogers outage: human error and system deficiencies](https://www.cbc.ca/news/politics/rogers-outage-human-error-system-deficiencies-1.7255641)
- [FCC — Notice of Proposed Rulemaking on BGP Routing Security (June 2024)](https://docs.fcc.gov/public/attachments/DOC-402609A1.pdf)
- [Federal Register — Reporting on Border Gateway Protocol Risk Mitigation Progress](https://www.federalregister.gov/documents/2024/06/17/2024-13048/reporting-on-border-gateway-protocol-risk-mitigation-progress-secure-internet-routing)

### Wikipedia

- [Wikipedia — Border Gateway Protocol](https://en.wikipedia.org/wiki/Border_Gateway_Protocol)
- [Wikipedia — AS 7007 incident](https://en.wikipedia.org/wiki/AS_7007_incident)
- [Wikipedia — BGP hijacking](https://en.wikipedia.org/wiki/BGP_hijacking)
- [Wikipedia — Yakov Rekhter](https://en.wikipedia.org/wiki/Yakov_Rekhter)
- [Wikipedia — Autonomous system (Internet)](https://en.wikipedia.org/wiki/Autonomous_system_%28Internet%29)
