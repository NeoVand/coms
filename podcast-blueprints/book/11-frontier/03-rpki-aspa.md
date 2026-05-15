---
id: frontier/rpki-aspa
type: chapter
part_id: frontier
part_label: XII
part_title: The Modern Frontier (2024–2026)
title: RPKI + ASPA
synopsis: Cryptographic BGP, finally arriving — 50% of IPv4 covered May 2024.
podcast_target_minutes: 15
position_in_book: chapter 77 of 75
listening_order:
  prev: frontier/ipv6-mostly
  next: frontier/ultra-ethernet
related_protocols: [bgp, ip, ipv6, tcp]
related_pioneers: []
related_outages: [as-7007-1997, pakistan-youtube-2008, china-telecom-2010, facebook-2021]
related_frontier: [rpki-rov-50-percent]
related_rfcs: [8205, 9234]
images: []
visual_cues:
  - "Line chart: percent of IPv4 prefixes with valid ROAs from 2011 to 2026, with the May 2024 50% crossover annotated."
  - "Diagram: a BGP UPDATE flowing through a router that checks the prefix and origin AS against an RPKI cache, then drops the invalid route."
  - "Diagram: an AS_PATH where the origin is legitimate but an upstream leaks the route sideways — ASPA verification catches the unauthorised provider hop."
  - "Screenshot mockup of the RIPE NCC portal showing a ROA edit form, with a 2FA prompt overlaid as the missing safeguard."
  - "World map of the 27 June 2024 1.1.1.1/32 hijack, highlighting the 70 countries and ~300 networks that lost the resolver."
---

# Part XII, Chapter — RPKI + ASPA

## The hook
Orange España, 3 January 2024. A threat actor calling himself Snow used credentials harvested by infostealer malware to log in to Orange Spain's RIPE NCC account. He edited the Route Origin Authorisations so that Orange's own legitimate prefixes became RPKI-invalid. It was the first major outage caused by RPKI being too strict — against a ROA set the attacker had modified. The fix is not in the cryptography. The fix is two-factor authentication on the Regional Internet Registry portals.

## The story

### The Decade-Long Slow Win
BGP without origin authentication is the architectural reason every route hijack of the last twenty-five years was possible. AS 7007 in 1997, Pakistan and YouTube in 2008, China Telecom in 2010, the Facebook disappearance in 2021 — every one of those incidents worked because no router on earth could verify whether a given autonomous system was actually entitled to announce a given prefix. We cover the mechanism of BGP itself in the BGP episode; here the story is what finally got built on top of it.

The system is RPKI — Resource Public Key Infrastructure. Prefix-holders publish cryptographically signed Route Origin Authorisations that say, in effect, "AS X is authorised to originate prefix Y." The runtime check on a BGP router is called ROV, Route Origin Validation, and it drops or de-preferences any advertisement that fails. None of that is new. What's new is that, in May 2024, RPKI ROA coverage crossed 50% of IPv4 prefixes for the first time. IPv6 had crossed earlier, in late 2023. By December 2024 about 54% of IPv4 and IPv6 prefixes were ROA-covered, and roughly 74% of IP traffic was destined for ROA-covered networks. Those numbers come from MANRS and Kentik. After fifteen years of single-digit and then teen-percent coverage, the curve is finally accelerating.

### The 2024-2025 Standards Cleanup
The IETF cleared a long backlog while the deployment curve was bending.

RFC 9582, published in May 2024, replaced RFC 6482 as the ROA profile. The author list reads Snijders, Maddison, Lepinski, Kong, Kent. It clarifies the X.509 extensions, fixes errata, and mandates canonicalisation.

RFC 9687, in November 2024, added a SendHoldTimer to the BGP finite state machine. It closes the so-called "BGP zombie" failure mode, where a TCP socket stops draining and withdrawn routes linger forever. The TCP behaviour underneath that is the subject of the TCP episode.

RFC 9774, in May 2025, formally deprecates AS_SET and AS_CONFED_SET with a normative MUST NOT. Speakers must "treat-as-withdraw" any UPDATE that contains them.

ASPA — Autonomous System Provider Authorization — is the next pillar, and as of May 2026 it is still an Internet-Draft. The current versions are draft-ietf-sidrops-aspa-verification-25 from October 2025 and draft-ietf-sidrops-aspa-profile-26 from April 2026. Cisco ran an Early Field Trial of ASPA on IOS-XR in 2025. OpenBGPD, BIRD 2.16 and later, and Routinator already have ASPA support. SIDROPS chair Job Snijders has signalled the working group is, in his phrase, close to last call.

What ASPA closes is the route-leak hole that origin validation alone cannot fix. The case is the one where AS X really does legitimately originate the prefix, but its upstream then leaks the route through an unintended path. RPKI says nothing about that. ASPA does.

### BGPsec is dead
There was an earlier, more ambitious attempt. BGPsec, RFC 8205, published in 2017, signed the entire AS_PATH hop by hop. Deployment is negligible. The combinatorial signature size, the lack of router silicon support, and the absence of any incremental-deployment benefit have left it almost entirely unimplemented. ASPA and RFC 9234 — BGP Roles plus the Only-To-Customer attribute — ate its lunch. The lesson is not subtle. A security protocol that requires every participant to deploy before any of them benefit will not get deployed. RPKI plus ROV plus ASPA wins because each step is independently useful to the operator who takes it.

### When RPKI Backfires, And When It Doesn't
The Orange España incident from the cold open is one of two cautionary tales from 2024.

The other is the Cloudflare 1.1.1.1 hijack on 27 June 2024. The Brazilian ISP Eletronet, AS267613, announced 1.1.1.1/32. Cloudflare had a valid ROA — but the ROA covered up to maxLength /24, and a /32 announcement is more specific than that, so it isn't RPKI-invalid. The Tier-1 PEER 1, AS1031, accepted the route and propagated it. Three hundred networks in seventy countries lost 1.1.1.1. The lesson is that maxLength matters; sloppy ROA configuration creates loopholes that ASPA cannot close either.

The regulatory layer is moving in parallel. In June 2024 the FCC issued a Notice of Proposed Rulemaking on BGP Routing Security — the first US federal proposal to compel the nine largest broadband internet access providers, AT&T, Comcast, Verizon, T-Mobile and the rest, to file BGP Routing Security Risk Management Plans and quarterly RPKI reports. As of March 2024, only about 22% of US-originated routes had ROAs. The American end of the curve is dragging the global average down.

The implementations themselves keep getting better. BIRD 3.0, in January 2025, was the first stable multithreaded BGP implementation, scaling to more than five thousand peers. BIRD 2.16 in December 2024 shipped ASPA support. The IPv4 default-free zone exceeded roughly one million prefixes by late 2025. Geoff Huston's vantage point reported about 1.2 million prefixes seen by 1,026 BGP peers at the start of 2026.

## The figures

### RPKI ROV Crosses 50% of IPv4 Prefixes
By May 2024, more than half of IPv4 routes had Route Origin Authorisations, and roughly three-quarters of IP traffic was bound for RPKI-secured destinations. MANRS surpassed 1,190 participants in 2024 and kept growing through 2025 under Global Cyber Alliance stewardship. Cloudflare's separate measurement of enforcement — the autonomous systems that actually drop invalids — puts the directly-protected user population at about 261 million, around 6.5%. But because almost every Tier-1 transit drops invalids, indirect validation suppresses invalid-route propagation by a factor of two to three. ASPA is in IETF SIDROPS last call as of April 2026.

### RFC 8205 — BGPsec Protocol Specification
Published in 2017 as standards-track, edited by Lepinski and Sriram. It specified hop-by-hop cryptographic signing of the entire BGP AS_PATH. The deployment story is the section above: it didn't happen.

### RFC 9234 — Route Leak Prevention and Detection Using Roles in UPDATE and OPEN Messages
Published in 2022 as a proposed standard, by Azimov, Bogomazov, Bush, Patel, and Sriram. It defines BGP peering roles — provider, customer, peer, route-server, route-server-client — and the Only-To-Customer attribute, so a leaked route can be detected at the next hop without signing every path element.

## What it taught the industry
Three things, mostly.

First: incremental security wins. BGPsec required everyone to deploy before anyone benefited. RPKI plus ROV gives each operator value the moment they sign their own ROAs and the moment they enforce on inbound. ASPA extends that pattern to path validation. The deployment curve only bends when the protocol respects the asymmetry of the rollout.

Second: the cryptography is rarely the weak link. Orange España was a credentials breach against a registry portal, not a break of the signing system. The fix is mundane operational hygiene — 2FA on the RIR portals — not new math.

Third: the configuration surface still bites. The 1.1.1.1 hijack worked through maxLength, a knob inside RPKI itself. The Facebook outage in 2021 — covered in its own chapter in the Famous Outages part of the book — was a backbone command, not a BGP attack, but the visible symptom was a BGP withdrawal. The protocols are catching up. The humans, the tools, and the audit systems still need to.

## Listening order
- **Before this chapter:** "IPv6-Mostly" — sets up the other half of the addressing-and-routing story now arriving in production.
- **After this chapter:** "Ultra Ethernet" — the data-centre fabric story, where a different kind of routing redesign is shipping.

## Where to go deeper
The BGP episode is where the mechanism lives — eBGP versus iBGP, AS_PATH, the OPEN and UPDATE and KEEPALIVE messages, longest-prefix match, and the simulator that walks you through a session between two autonomous systems. The IP and IPv6 episodes carry the addressing story that ROAs sit on top of. The TCP episode covers the transport underneath BGP, including the socket-draining behaviour that RFC 9687's SendHoldTimer is finally constraining. And the four hijack and outage stories named here — AS 7007, Pakistan and YouTube, China Telecom 2010, and the Facebook disappearance — each have their own chapter in the Famous Outages part of the book.

## Visual cues for image generation
- Line chart of IPv4 ROA coverage from 2011 through 2026 with the May 2024 50% crossover marked, and a second line showing percent of traffic bound for ROA-covered destinations crossing 74% in late 2024.
- Diagram of a BGP router consulting an RPKI validator cache, with three outcome lanes labelled Valid, Invalid, and NotFound, and the Invalid lane dropping into a trash icon.
- Side-by-side: an RPKI-only check passing a leaked route, and an ASPA check rejecting the same route because the upstream isn't on the origin AS's signed provider list.
- Annotated screenshot of an RIR portal ROA edit form with a 2FA prompt highlighted as the Orange España fix.
- Map of the 27 June 2024 1.1.1.1/32 hijack: AS267613 in Brazil as the source, AS1031 PEER 1 propagating, and 300 networks across 70 countries shaded as affected.

## Sources
- [MANRS — RPKI ROV milestone](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)
- [Cloudflare — RPKI Updates](https://blog.cloudflare.com/rpki-updates-data/)
- [RFC 8205 — BGPsec Protocol Specification](https://www.rfc-editor.org/rfc/rfc8205)
- [RFC 9234 — Route Leak Prevention and Detection Using Roles in UPDATE and OPEN Messages](https://www.rfc-editor.org/rfc/rfc9234)
