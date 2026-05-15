---
id: famous-outages/pakistan-youtube-2008
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: Pakistan/YouTube 2008
synopsis: A domestic block leaks globally.
podcast_target_minutes: 12
position_in_book: chapter 67 of 75
listening_order:
  prev: famous-outages/mitnick-1994
  next: famous-outages/china-telecom-2010
related_protocols: [bgp, dns, tcp]
related_pioneers: []
related_outages: [pakistan-youtube-2008]
related_frontier: [rpki-rov-50-percent]
related_rfcs: []
images: []
visual_cues:
  - "World map, 24 February 2008: a red arrow leaving Karachi (AS 17557), passing through Hong Kong (PCCW, AS 3491), then fanning out to every continent — labelled 'three minutes'."
  - "Side-by-side BGP route table: YouTube's legitimate 208.65.152.0/22 vs Pakistan Telecom's 208.65.153.0/24, with the /24 highlighted as 'most specific wins'."
  - "Timeline bar showing the two-hour outage window plus a 30-minute BGP convergence tail after PCCW filtered."
  - "RPKI deployment curve from 2008 (specified) to 2024 (50% of IPv4 prefixes), with the Pakistan/YouTube event marked at the start."
  - "A diagram of YouTube's counter-hijack: a /25 announcement squeezing through to outcompete the rogue /24."
---

# Part XI, Chapter — Pakistan/YouTube 2008

## The hook
BGP has no built-in concept of "this announcement should stay inside my country." On 24 February 2008, Pakistan tried to block one video. Three minutes later, a router in Karachi was silently dropping every YouTube request on the planet. The block was supposed to be domestic. It went global instead.

## The story

### A Domestic Block, A Global Outage
On 24 February 2008, the Pakistan Telecommunications Authority ordered domestic ISPs to block YouTube. The trigger was a video the government considered blasphemous. The execution fell to Pakistan Telecom — Autonomous System 17557 — and the technique they reached for was a standard one: Remotely Triggered Blackhole, or RTBH.

Here is how RTBH works in one sentence: you inject a more-specific BGP route for the prefix you want to kill, and you point it at a null interface. The mechanics of BGP itself — the OPEN messages, the UPDATEs, the AS_PATH, the way it rides on top of TCP port 179 — are the territory of the BGP episode. What matters here is the rule the technique exploits: the most specific prefix wins. YouTube's address space at the time was 208.65.152.0/22. Pakistan Telecom announced 208.65.153.0/24, a slice inside it. Inside their network, every router preferred the more specific /24 and dropped the traffic on the floor.

This is fine — as long as you do not propagate the route outside your network. That was the assumption.

### The Leak
Pakistan Telecom's upstream was PCCW Global, AS 3491, a major Hong Kong-based transit provider. PCCW was not filtering inbound BGP from its customer. They accepted the bogus, more-specific YouTube route and passed it on to every PCCW peer. From the peers it went to their peers. From there it went global.

Within three minutes of the original injection, the entire internet believed the best path to YouTube was through Pakistan. YouTube's authoritative DNS kept resolving correctly — the mechanics of that lookup chain are the DNS episode — so browsers got the right IP address. The TCP connections those browsers tried to open just disappeared into the black hole at the Pakistan Telecom edge. How TCP detects and reacts to that silent failure is the TCP episode. From the user's perspective: YouTube simply did not load.

YouTube engineers fought back the only way you can fight in BGP — with a more specific prefix of their own. They started announcing a /25 carved out of the contested space, aiming to outcompete the rogue /24 on longest-prefix match wherever it propagated. The announcement spread. Service started to recover in patches.

PCCW Global eventually identified the bogus route and applied filtering. Once they stopped propagating it, BGP convergence took roughly another 30 minutes to flush the bad path out of routing tables worldwide. Total damage: about two hours of YouTube being globally unreachable, caused by one router in Karachi and one missing inbound filter in Hong Kong.

### Why "Most Specific Wins" Is Both Genius and Curse
BGP's longest-prefix-match rule is not a bug. It is one of the most useful properties the protocol has. If your origin announces a /16 and your CDN announces a /20 inside that block, every router on the planet automatically prefers the CDN — no negotiation, no signalling, no coordination. Traffic engineering for free.

The same rule is what made Pakistan/YouTube possible. A /24 inside YouTube's /22 wins everywhere it reaches, regardless of who is announcing it. Combine "most specific wins" with "no origin validation" and "global propagation," and every upstream provider on earth becomes a single point of failure for every downstream customer's prefix integrity.

This is the structural reason BGP needs cryptography to fix it, not just better operational hygiene. Hygiene catches typos. Cryptography catches deliberate hijacks. RPKI provides the cryptography for who is allowed to originate a prefix. ASPA — currently in IETF draft — extends that to who is allowed to be in the AS_PATH, closing the route-leak hole that origin validation alone cannot close.

## The figures

### Pakistan Hijacks YouTube
Pakistan Telecom (AS 17557) injected 208.65.153.0/24 to null-route YouTube domestically; PCCW (AS 3491) failed to filter, and the /24 won under longest-prefix match across the entire internet for about two hours on 24 February 2008. The full incident report — the cascade, the counter-hijack with a /25, PCCW's eventual blackhole of AS 17557 — is the dedicated outage chapter in the Famous Outages part of the book.

### RPKI ROV Crosses 50% of IPv4 Prefixes
By May 2024, more than half of all IPv4 prefixes had Route Origin Authorisations published, and roughly three-quarters of IP traffic was bound for an RPKI-secured destination. Cloudflare's measurement of strict enforcement — ASes that actually drop invalid routes — puts the directly protected user population near 261 million, around 6.5%, but because almost every Tier-1 transit drops invalids, indirect validation suppresses bad routes by a factor of two to three. ASPA, the path-hijack defence beyond origin validation, is in IETF SIDROPS last call as of April 2026. The full deployment story is on the Frontier page under the RPKI ROV milestone entry.

## What it taught the industry
After Pakistan/YouTube, prefix filtering between providers and customers went from "best practice" to "industry default" within a year. PCCW's missing inbound filter became the canonical example of why you do not blindly trust a customer's BGP announcements, no matter how well you know them.

The deeper structural fix took much longer. RPKI — Resource Public Key Infrastructure — lets any router cryptographically verify that an AS is authorised to originate a given prefix, regardless of how the announcement reached it. RPKI was specified in 2008, the same year as Pakistan/YouTube. It took until 2024, sixteen years later, to cross 50% of IPv4 prefixes. RIPE NCC's RIS data became the canonical post-mortem source for the original incident, and that data is still cited every time a new BGP hijack appears in the news.

The lesson the industry absorbed slowly: BGP trust between autonomous systems had to be replaced with cryptographic verification of who could originate which prefix. Hygiene was not enough. The protocol's foundational assumption — that other operators would only announce what they were entitled to — could no longer hold an internet that now carried payments, governments, and almost every form of human communication.

## Listening order

- **Before this chapter:** "Mitnick vs Shimomura 1994" — a story about exploiting trust at the TCP layer; this chapter scales the same lesson up to inter-domain routing.
- **After this chapter:** "China Telecom 2010" — another large-scale BGP route leak, two years later, against an internet that had still not deployed the cryptographic fix.

## Where to go deeper

- The BGP episode picks up the mechanism story — eBGP versus iBGP, AS_PATH, longest-prefix match, KEEPALIVEs over TCP port 179, and how route reflectors keep large ASes loop-free.
- The DNS episode covers why YouTube's name kept resolving even while the packets vanished — the recursive resolver chain, root and TLD servers, and aggressive caching.
- The TCP episode explains what a silent black hole actually looks like to a connection trying to open — the SYNs, the retransmits, the eventual timeout.

## Visual cues for image generation
- Map of the propagation: AS 17557 in Karachi to AS 3491 in Hong Kong to the world, annotated with "three minutes."
- A BGP routing table snippet showing 208.65.152.0/22 vs 208.65.153.0/24, with "longest prefix wins" called out.
- A two-hour outage timeline with the YouTube /25 counter-announcement and PCCW's filter as labelled events.
- RPKI deployment curve from 2008 (specified) to 2024 (50% of IPv4 prefixes crossed), with Pakistan/YouTube anchoring the start.
- A simple null-interface diagram showing what RTBH does inside one AS — and what happens when that route escapes.

## Sources
- [RIPE NCC — YouTube Hijacking: A RIPE NCC RIS case study](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
- [Wikipedia — Pakistan and YouTube](https://en.wikipedia.org/wiki/Pakistan_and_YouTube)
- [MANRS — RPKI ROV deployment reaches major milestone](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)
- [Cloudflare — RPKI Updates](https://blog.cloudflare.com/rpki-updates-data/)
