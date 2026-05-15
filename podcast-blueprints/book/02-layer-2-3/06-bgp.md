---
id: bgp
type: chapter
part_id: layer-2-3
part_label: III
part_title: Layer 2-3 Foundations
title: BGP
synopsis: Three napkins, every transit relationship, no built-in trust.
podcast_target_minutes: 15
position_in_book: 24 of 75
listening_order:
  prev: layer-2-3/icmp
  next: transport/tcp
related_protocols: [bgp, tcp, tls, ip, ipv6]
related_pioneers: [yakov-rekhter]
related_outages: [as-7007-1997, rogers-2022, facebook-2021, pakistan-youtube-2008]
related_frontier: [rpki-rov-50-percent]
related_rfcs: [4271, 1105]
images:
  - src: ""
    caption: "Photocopies of the original three napkins, framed at Cisco's Milpitas office."
    credit: "Cisco archives"
visual_cues:
  - "Three handwritten napkins on a cafeteria table, IETF 12 in Austin, January 1989. Yakov Rekhter and Kirk Lougheed sketching the FSM and message types. Coffee rings on the corners."
  - "A world map with about 100,000 coloured blobs, each labelled with an AS number, lines of varying weight running between them — the AS-level graph of the public internet."
  - "A timeline of the four big BGP outages in this chapter: AS 7007 (1997), Pakistan-YouTube (2008), Rogers (2022), Facebook (2021). Each annotated with the single misconfigured command that did the damage."
  - "The 16-byte all-ones Marker field at the start of a BGP message, drawn as 128 little 1-bits in a row, with a strikethrough and the label 'placeholder for an authentication digest that never shipped.'"
  - "An RPKI ROV adoption curve from 2014 to 2026 climbing through 50% of IPv4 prefixes in May 2024 and reaching ~54% by 2026, with a parallel line showing ~74% of IP traffic destined for ROA-covered networks."
---

# Part III, Chapter — BGP

## The hook

BGP doesn't have a real authentication story. Thirty-plus years after it was sketched on three cafeteria napkins, the 16-byte all-ones field at the start of every BGP message is still there — originally a placeholder for an authentication digest that never shipped. The protocol that holds the entire public internet together runs on trust. This is the chapter on what that has cost us, and what's finally being done about it.

## The story

### The Two-Napkin Protocol

January 1989, IETF 12, Austin, Texas. Yakov Rekhter from IBM Watson and Kirk Lougheed from Cisco sat down for lunch. The previous routing protocol, EGP, had become unmanageable, and the internet was about to outgrow it. They sketched a replacement on cafeteria napkins. The originals went in the trash. Cisco's archivist preserved photocopies that still hang in Milpitas. The sketch expanded to three handwritten sheets — which is why "two-napkin protocol" is also called the "three-napkin protocol."

That sketch became BGP-1, published as RFC 1105 in June 1989. Then BGP-4 in RFC 1771 in 1995. The current standard is RFC 4271 from 2006, still authored by Rekhter and colleagues. The protocol has been backwards-compatible for over thirty years across more than 100,000 autonomous systems. There's a separate Yakov Rekhter episode — the man whose lunchtime sketch the entire internet routes on.

The 16-byte all-ones Marker field at the start of every BGP message was originally a placeholder for an authentication digest. It is now vestigial. Modern authentication for BGP lives below it — TCP-MD5 or TCP-AO on the underlying connection — or above it, in RPKI, BGPsec, and ASPA. Inside BGP itself, the bits are still all ones. Hence the running joke that BGP doesn't have a real authentication story for thirty-plus years.

How the BGP session itself works — OPEN, KEEPALIVE, UPDATE messages, the path-vector AS_PATH, the eBGP-versus-iBGP distinction, the recursive resolution through OSPF or IS-IS — is the BGP protocol episode. This chapter is about the politics, the napkins, and the failures.

One thing worth flagging because every BGP operator burns a few hours on it at some point: the Multi-Exit Discriminator, MED, is meaningful only between paths from the same neighbour AS. Comparing MEDs across different neighbour ASes is meaningless. The standard does not enforce that. You have to know.

### A Catalogue of Famous Failures

If BGP trusts every neighbour by default, the consequence is a long catalogue of failures where one router somewhere on Earth becomes the apparent origin of large parts of the internet. Five of them deserve to be in your head.

April 25, 1997, 11:30 Eastern. MAI Network Services, AS 7007, a small Florida ISP, had a Bay Networks router whose forwarding table got dumped into BGP as if every entry were a route MAI originated. The router announced /24 fragments of much of the global routing table, claiming MAI was the origin AS for everything. Under BGP's longest-prefix-match rule, a /24 always beats a less-specific /16 or /8. The leaked /24s instantly became the preferred path globally for the prefixes they covered. MAI's upstream Sprint had no filters and propagated the routes to its peers. Within minutes a Florida ISP was the apparent origin of much of the internet's address space. Sprint's network couldn't handle the redirected traffic. Routers crashed. Sprint went largely dark. Even after MAI withdrew the routes, the cached propagation took hours to drain. AS 7007 has its own outage entry in the Famous Outages part of the book, and it's the canonical inspiration for max-prefix limits and prefix filtering.

February 24, 2008. Pakistan ordered ISPs to block YouTube domestically over a controversial video. Pakistan Telecom, AS 17557, decided to do this by null-routing YouTube inside its own AS — announce a more-specific BGP prefix for YouTube's address space so traffic gets dropped locally. The technique works fine if the announcement stays inside the AS. Pakistan Telecom's upstream PCCW, AS 3491, had no inbound filter. The /24 propagated globally. Suddenly the whole internet thought YouTube was in Pakistan. YouTube was unreachable for most of the internet for about two hours, until YouTube announced an even more specific /25 to outcompete the hijack and PCCW eventually blackholed the offending AS. That outage is the one that forced RPKI from research curiosity to operational priority. RPKI Route Origin Validation finally crossed 50% of IPv4 prefixes sixteen years later, in 2024.

October 4, 2021. Facebook, Instagram, WhatsApp, and Oculus all dark for roughly six hours. Three billion users. The full account is in the Facebook Disappearance entry in the Famous Outages part of the book, but the BGP-shaped lesson is this: an engineer ran a maintenance command intended to assess global backbone capacity. Meta's audit tooling had a bug and didn't stop it. The command took down the entire backbone. Meta's DNS servers, designed to defensively withdraw their own BGP advertisements when they couldn't reach the data centres, did exactly that. From the outside, Cloudflare and other observers saw a flood of BGP UPDATE messages from AS 32934 and then a wave of withdrawals of the IPv4 and IPv6 prefixes covering Facebook's DNS. Facebook ceased to exist on the internet. Internal tools depended on the same DNS. Badge readers depended on the same network. Engineers were reportedly dispatched to data centres with bolt cutters. Estimated revenue impact crossed $60 million. The BGP withdrawal was the symptom; the broken backbone was the cause; the lesson is that three layers — BGP, DNS, and physical access — failed in cascade because each one trusted the layer below.

July 8, 2022. Rogers Communications, AS 812, twelve million Canadians without service for twenty-six hours. Wireless, wireline, internet, and the Interac point-of-sale debit-card system that runs Canadian retail. A maintenance change to BGP route policy was meant to apply to a small set of routes; a missing filter let the entire BGP table — nearly a million prefixes — redistribute into OSPF, the intra-AS routing protocol. OSPF was never designed to carry a million routes. Core router CPUs and memory saturated. Routing software started crashing. The control plane melted. Wireless calls dropped. Interac terminals stopped working at every store running on Rogers. 911 went down. Recovery required engineers physically present at core sites, rolling back the change by hand, because the internal management network depended on the same data plane. The Rogers outage has its own entry in the Famous Outages part of the book; the CRTC's executive summary blamed missing route filters and a risk-scoring algorithm that down-graded the change from High to Low after earlier maintenance phases succeeded. Canada subsequently mandated mutual emergency-roaming agreements between carriers, on the principle that a single AS failing should not disconnect a country.

Two more for the catalogue. June 24, 2019: Verizon, DQE, and Allegheny Technologies — a steel mill rerouted twenty thousand prefixes for about 2,400 networks via a Noction BGP optimizer leak. Cloudflare lost 15 percent of global traffic at peak. Cloudflare's blog post became canonical reading. Then August 12, 2014, the 512K Day: when the IPv4 default-free zone crossed 512,000 prefixes, older Cisco line cards with default 512K-route TCAMs failed silently. eBay, LastPass, Microsoft Azure had visible outages. Hardware capacity is part of routing-table economics. Three years ago, on May 20, 2025, a malformed BGP UPDATE with an all-zero RFC 8669 Prefix-SID attribute, originated by AS 9304 Hutchison or AS 135338 Starcloud, leaked to the public default-free zone — JunOS and Arista EOS crashed sessions, while IOS-XR, Nokia SR OS, and BIRD correctly applied RFC 7606 treat-as-withdraw. Implementation diversity matters.

There is a newer attack class as well. February 3, 2022: KlaySwap. The first known live attack that leveraged BGP to break the WebPKI. Attackers BGP-hijacked Kakao's prefix to obtain a valid TLS certificate for `developers.kakao.com` via domain-control validation, then replaced the JavaScript on the page to authorise user wallets to attacker contracts. Loss roughly 1.9 million dollars. A new failure class — DCV-via-BGP-hijack — and the argument for the multi-perspective issuance now used by Let's Encrypt. The mechanism story for TLS certificates is the TLS episode, but the BGP-shaped half of the lesson lives here: when you can hijack the route, you can mint the certificate.

### The 2024-2026 Cleanup Wave

Several long-pending RFCs have landed in the past two years, and the protocol is finally being given the security guardrails it should have had thirty years ago.

RFC 9582, May 2024, replaced RFC 6482 as the current Route Origin Authorisation profile. Snijders, Maddison, Lepinski, Kong, and Kent — clarifies X.509 extensions, fixes errata, mandates canonicalisation.

RFC 9687, November 2024, added a SendHoldTimer to the BGP finite-state machine. That closes the BGP zombie failure mode where a TCP socket stops draining and withdrawn routes linger forever.

RFC 9774, May 2025, formally deprecates AS_SET and AS_CONFED_SET with a normative MUST NOT. Speakers must treat-as-withdraw any UPDATE containing them.

ASPA, AS Provider Authorization, the path-hijack defence beyond RPKI's origin defence, is still an Internet-Draft as of May 2026 — `draft-ietf-sidrops-aspa-verification-25` from October 2025 and `draft-ietf-sidrops-aspa-profile-26` from April 2026. Cisco ran an Early Field Trial of ASPA on IOS-XR in 2025. SIDROPS chair Job Snijders has signalled the working group is close to last call.

The June 2024 FCC Notice of Proposed Rulemaking is the first-ever U.S. federal proposal to compel the nine largest broadband internet access providers — AT&T, Altice, Charter, Comcast, Cox, Lumen, T-Mobile, TDS/US Cellular, Verizon — to file BGP Routing Security Risk Management Plans and quarterly RPKI deployment reports. As of March 2024, only about 22 percent of US-originated routes had ROAs.

By 2026, roughly 54 percent of IPv4 prefixes and 54 percent of IPv6 prefixes are ROA-covered. About 74 percent of IP traffic is destined to ROA-covered networks, per Kentik. IPv4 first crossed 50 percent ROA coverage in May 2024. That's the entry on the Frontier page. And BIRD 3.0, January 2025, was the first stable multithreaded BGP implementation, scaling to 5,000-plus peers. The protocol is finally being given the security guardrails it should have had thirty years ago.

## The figures

### Yakov Rekhter

Born around 1950. Worked at IBM, then Cisco, then Juniper Networks. Co-created the Border Gateway Protocol with Kirk Lougheed at the 12th IETF meeting in Austin, Texas in January 1989, sketched on three sheets of paper at lunch. RFC 1105 published in June 1989. The current standard, RFC 4271 from 2006, is still authored by Rekhter and colleagues. He has shaped or co-authored most of the BGP extensions in use, including BGP-MPLS VPNs in RFC 4364 and many EVPN drafts. As of January 2026, BGP carries roughly 975,000 IPv4 and 225,000 IPv6 prefixes globally on a protocol he sketched on three napkins. IEEE Internet Award, 2014. There's a separate Yakov Rekhter episode.

### The Facebook Disappearance

October 4, 2021. A routine maintenance command on Meta's global backbone disconnected the data centres from each other. The DNS edge servers, isolated, withdrew their own BGP advertisements exactly as designed — a DNS server that can't answer shouldn't be reached. From the outside, Facebook, Instagram, WhatsApp, and Oculus ceased to exist for six hours. Public resolvers like 1.1.1.1 and 8.8.8.8 saw a 30x query surge. The full account, including the bolt-cutters detail and the $60M revenue impact, is in the Famous Outages part of the book.

### AS 7007 — The Day a Florida ISP Took Down the Internet

April 25, 1997. MAI Network Services, AS 7007, leaked a deaggregated copy of much of the global routing table as /24s; longest-prefix match made those /24s the preferred path everywhere; Sprint had no filters and propagated them. Sprint melted, the rest of the internet drained for hours. Vince Bono's apology email to NANOG that day is preserved in the archives — a remarkably calm and detailed admission that became a model for incident communication. Full entry in the Famous Outages part of the book.

### Pakistan Hijacks YouTube

February 24, 2008. Pakistan Telecom, AS 17557, tried to null-route YouTube domestically by announcing a more-specific /24. Upstream PCCW had no filter and propagated the route globally. YouTube unreachable from most of the internet for about two hours. The event that forced RPKI from research curiosity to operational priority. Full entry in the Famous Outages part of the book.

### Rogers — A Country Disconnected

July 8, 2022. A missing filter on a maintenance change let the full BGP table redistribute into OSPF. Core router CPUs saturated. The shared wireline-plus-wireless IP core meant everything fell, including 911 and Interac. Twelve million Canadians without service for a full business day. Full entry in the Famous Outages part of the book.

### RPKI ROV Crosses 50% of IPv4 Prefixes

May 2024 milestone. More than 50 percent of IPv4 routes had Route Origin Authorisations; roughly three-quarters of IP traffic was bound for RPKI-secured destinations. MANRS surpassed 1,190 participants in 2024. Cloudflare's measurement of enforcement — ASes that drop invalids — puts the directly-protected user population at about 261 million, but because almost every Tier-1 transit drops invalids, indirect validation suppresses invalid-route propagation by a factor of two to three. The full launch entry is on the Frontier page.

### RFC 4271 — A Border Gateway Protocol 4 (BGP-4)

Published 2006, edited by Yakov Rekhter, Tony Li, and Susan Hares. Standards Track. Obsoletes RFC 1771. The current normative reference for the protocol — message formats, the finite-state machine, attribute handling, path selection. Every modern BGP implementation cites this document.

### RFC 1105 — A Border Gateway Protocol (BGP)

Published June 1989, by Kirk Lougheed and Yakov Rekhter. Historic. Obsoleted by RFC 4271. The first published version of the protocol that came out of the napkin sketches at IETF 12 — the document that started it all.

## What you'd see in the simulator

The BGP simulation in the app shows route exchange between two autonomous systems. Press Play and you watch two routers in different ASes find each other on TCP port 179 and exchange OPEN messages — capabilities, AS numbers, hold timers, the works. Once the session is established, they begin trading UPDATE messages: each one announces a set of IP prefixes along with the AS_PATH, the sequence of autonomous systems to traverse to reach them. KEEPALIVE messages tick by every thirty seconds or so to prove the peer is still alive. As routes are added or withdrawn, the simulation shows the AS_PATH growing on each eBGP hop and the receiving router updating its routing table. This is the mechanic, in miniature, that the entire internet runs on.

## What it taught the industry

Three things sit downstream of this chapter.

Trust is not a routing feature. BGP was designed to take a neighbour's word for what they originated, and every catalogue entry in this chapter is a story about that assumption breaking. Prefix filters at every peering point became table stakes after AS 7007. Multi-perspective certificate issuance became a requirement after KlaySwap. RPKI Route Origin Validation, after twenty-five years of slow deployment, is finally past 50 percent of IPv4 prefixes — and ASPA, the path-hijack defence, is in last call. The protocol that runs the internet is finally being asked to verify rather than trust.

Single dependencies kill. Facebook 2021 and Rogers 2022 both have the same shape: a single layer fails, and every other layer that depended on it fails too because nobody noticed they had built a chain. Meta's badge readers depended on Meta's DNS, which depended on Meta's BGP, which depended on Meta's backbone. Rogers' management network depended on Rogers' data plane. The lesson — never have a single dependency chain run through your own product, and never have your country's payment system run through one carrier — is now a regulatory and architectural principle, not just a postmortem.

Implementation diversity matters. The May 2025 session-reset incident showed it cleanly: the same malformed UPDATE crashed JunOS and Arista EOS, and was correctly handled by IOS-XR, Nokia SR OS, and BIRD. Monoculture in the routing control plane is a single point of failure. Multithreaded implementations like BIRD 3.0 scaling to 5,000-plus peers, FCC reporting requirements, and the RPKI cleanup wave are all moving in the same direction — making the protocol that holds the internet together harder to break by accident.

## Listening order

- **Before this chapter:** *ICMP* — ping, traceroute, and the diagnostic backplane. The protocol you reach for when BGP is misbehaving and you need to know whether the path is actually broken or just routed somewhere strange.
- **After this chapter:** *TCP* — every BGP session runs over TCP port 179, relying on TCP's reliable delivery because routing information must never be lost or corrupted. The next chapter is about the protocol that BGP sits on top of.

## Where to go deeper

- **The BGP episode** picks up the mechanism story — the message formats, the OPEN/UPDATE/KEEPALIVE/NOTIFICATION exchange, the eBGP-versus-iBGP distinction, AS_PATH, route reflectors, the longest-prefix-match selection rule, and how BGP routes are recursively resolved through OSPF or IS-IS. If this chapter is the politics and the napkins, the BGP episode is the wire format.
- **The TCP episode** explains the substrate: every BGP session is a TCP connection on port 179. TCP-MD5 and TCP-AO are how operators authenticate that connection today.
- **The TLS episode** is where the KlaySwap story really lives — domain-control validation, the WebPKI, and why multi-perspective issuance now matters.
- **The IPv4 and IPv6 episodes** are where the prefixes BGP carries actually come from — the 32-bit and 128-bit address spaces, longest-prefix match at the forwarding plane, and why the size of the default-free zone is itself a hardware constraint.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [Wikipedia — AS 7007 incident](https://en.wikipedia.org/wiki/AS_7007_incident)
- [Bono — "7007 Explanation and Apology" (NANOG, April 1997)](https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html)
- [Cloudflare — view of the Rogers outage](https://blog.cloudflare.com/cloudflares-view-of-the-rogers-communications-outage-in-canada/)
- [CRTC — Assessment of Rogers Networks for Resiliency and Reliability](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)
- [Wikipedia — 2022 Rogers Communications outage](https://en.wikipedia.org/wiki/2022_Rogers_Communications_outage)
- [Cloudflare — Understanding how Facebook disappeared from the Internet](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Wikipedia — 2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
- [RIPE NCC — YouTube Hijacking case study](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
- [Wikipedia — Pakistan and YouTube](https://en.wikipedia.org/wiki/Pakistan_and_YouTube)
- [MANRS — RPKI ROV milestone](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)
- [Cloudflare — RPKI Updates](https://blog.cloudflare.com/rpki-updates-data/)
- [RFC 4271 — A Border Gateway Protocol 4 (BGP-4)](https://www.rfc-editor.org/rfc/rfc4271)
- [RFC 1105 — A Border Gateway Protocol (BGP)](https://www.rfc-editor.org/rfc/rfc1105)
- [Yakov Rekhter — Wikipedia](https://en.wikipedia.org/wiki/Yakov_Rekhter)
