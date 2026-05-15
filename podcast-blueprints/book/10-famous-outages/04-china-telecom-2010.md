---
id: famous-outages/china-telecom-2010
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: China Telecom 2010
synopsis: 15% of the internet routed through a single AS for 18 minutes.
podcast_target_minutes: 12
position_in_book: chapter 68 of 75
listening_order:
  prev: famous-outages/pakistan-youtube-2008
  next: famous-outages/sack-panic-2019
related_protocols: [bgp, ip, tls]
related_pioneers: []
related_outages: []
related_frontier: [rpki-rov-50-percent, ech-rfc-9849]
related_rfcs: []
images: []
visual_cues:
  - "World map at 15:54 UTC on 8 April 2010 — arrows for 37,000 prefixes pulled toward a single node labeled AS 23724 China Telecom; counter ticking from 0 to 18 minutes."
  - "Pie chart of the global IPv4 routing table — a 15% slice highlighted, with logos for .mil, .gov, Dell, Yahoo, IBM, and Microsoft sitting inside the slice."
  - "Timeline strip — 15:54 announcement, automated detection within minutes by BGPmon and RIPE RIS, 16:12 upstream filters installed, 16:18 BGP convergence restored."
  - "Split-screen: 'accident' (a config push to an internal route table leaks to external peers) vs 'espionage' (a deliberate hijack disguised as the same thing) — same packets on the wire either way."
  - "Bar chart of RPKI ROV adoption climbing from near-zero in 2010 to over 50% of IPv4 prefixes in May 2024, annotated with .gov/.mil early signers and the 2018-2022 hyperscaler peering mandates."
---

# Part XI, Chapter — China Telecom 2010

## The hook

On 8 April 2010, at 15:54 UTC, one autonomous system in Beijing announced that it had the best path to roughly 37,000 IP prefixes. That is about 15% of the entire global routing table. For the next 18 minutes, traffic destined for U.S. military networks, several .gov domains, and household names like Dell, Yahoo, IBM, and Microsoft made a detour through China Telecom on its way to wherever it was actually going. Whether anyone meant for that to happen is still disputed.

## The story

### Brief, Massive, Unexplained

The announcement came from China Telecom, AS 23724. It claimed BGP routes for around 37,000 prefixes — about 15% of the global routing table — and the routes won. BGP works on a "best path" preference, and for those 18 minutes China Telecom was the best path for a remarkable share of the public internet.

How BGP picks a best path, and why "I have a shorter AS_PATH" is enough to redirect a continent, is the heart of the BGP episode. We will defer the mechanism there. What matters for the story is that the leak was caught fast. Automated route-monitoring services — BGPmon, RIPE RIS, RouteViews — flagged the anomaly within minutes. China Telecom's upstream providers installed filters around 16:12 UTC, and BGP convergence pushed the legitimate routes back into place by 16:18.

Eighteen minutes from start to clean. In BGP terms, that is a fast response. In intelligence terms, it is a long time.

### Accident or Espionage?

Two stories have been told about that morning, and both are still on the table.

China Telecom's official account was a routine misconfiguration during a software upgrade. The shape of the leak is consistent with that — an accidental redistribution of internal routes to external peers, the same failure mode behind the famous AS 7007 incident from 1997. A junior operator pushes a config; suddenly an internal table appears at the edge of the network, dressed up as legitimate global routes.

The U.S.-China Economic and Security Review Commission's 2010 annual report told it differently, or at least added a second possibility. They flagged the incident as a potential intelligence concern, and noted that 18 minutes of unauthorised observation of military traffic could yield real signals-intelligence value even if the payloads were encrypted.

Technical analyses, notably from Renesys — later Dyn — landed in an honest middle. The announcement pattern was consistent with both an accident and a deliberate hijack disguised as one. You cannot tell the two apart from the routing data alone.

What is unambiguous is the architectural lesson. BGP gives any AS the power to do this — accidentally or on purpose, in seconds. The protocol was designed in an era of mutual trust between a small number of network operators. By 2010 the internet had hundreds of thousands of AS-level relationships, and the trust model had not kept up.

### The "everything is encrypted" reply does not hold

A natural reaction to a BGP hijack is "but the data is encrypted, so what does it matter if a third party sees it?" Two reasons it matters.

First, cryptographic metadata. TLS handshake fingerprints, certificate chains, and the SNI — the hostname the client tells the server it wants — historically travelled in the clear. Anyone in the path could see which sites you were visiting, even when they could not see what you were saying. The TLS episode is the place to dig into how the handshake works and where ECH, Encrypted Client Hello, finally closes that gap.

Second, traffic analysis. Even on encrypted flows, packet sizes and timing leak intent. A burst of connections between a Pentagon IP address and a defence-contractor IP address, observed by a foreign AS, is intelligence regardless of the cipher in use. This is part of why ECH became a TLS frontier, and why secure routing became a U.S. government priority after April 2010.

### Why This Incident Funded RPKI Deployment

China Telecom 2010 was the turning point for U.S. government interest in secure routing infrastructure. In the years that followed, the Department of Homeland Security funded several RPKI deployment efforts. The Resource Public Key Infrastructure lets an AS cryptographically prove that it is authorised to originate a given IP prefix; combined with Route Origin Validation, routers can reject BGP announcements that contradict the published authorisations.

The .gov and .mil top-level domains became some of the earliest large-scale ROA signers. That was politically straightforward — the federal government could mandate it for its own networks — and it materially improved the security of U.S. federal traffic. But the bulk of the internet runs on commercial ISPs and content networks, and those did not move because of a DHS grant.

The shift came between 2018 and 2022. Major hyperscalers — Cloudflare, Google, Amazon, Meta — started making RPKI a publicly stated requirement for their peering arrangements. Networks that wanted to peer at scale had to sign their prefixes. Networks that would not became increasingly isolated. By 2026, more than 50% of advertised IPv4 space is covered, and roughly three-quarters of IP traffic is bound for an RPKI-secured destination.

Twelve years and a coalition of private platforms, prompted in part by 18 minutes one morning in Beijing.

## The figures

### RPKI ROV Crosses 50% of IPv4 Prefixes

By May 2024, more than half of IPv4 routes had ROAs, and roughly three-quarters of IP traffic was bound for an RPKI-secured destination. MANRS — the Mutually Agreed Norms for Routing Security initiative — surpassed 1,190 participants in 2024 and continued growing through 2025 under Global Cyber Alliance stewardship. Cloudflare's separate measurement of enforcement, the ASes that actually drop invalid routes, puts the directly protected user population at around 261 million, about 6.5%; but because almost every Tier-1 transit drops invalids, indirect validation suppresses invalid-route propagation by a factor of two to three. ASPA, the path-hijack defence beyond RPKI's origin defence, was in IETF SIDROPS last call as of April 2026.

### Encrypted Client Hello Published as RFC 9849

ECH hides the SNI and other ClientHello fields that previously let middleboxes and ISPs see which site you were visiting. It went through 25 IETF drafts and was finally published as RFC 9849 in 2025. Cloudflare deploys ECH for around 70% of the websites it fronts, and both Chrome and Firefox support it. The architecture: the server publishes an ECHConfig in DNS using an HTTPS resource record, the client encrypts the inner ClientHello to that key, and wraps it in an outer ClientHello that uses a generic "cloudflare-ech.com" SNI. From the network's perspective, every fronted site looks the same.

## Listening order

- **Before this chapter:** "Pakistan/YouTube 2008" — the BGP hijack that took YouTube globally offline for two hours, and the warm-up to this one.
- **After this chapter:** "SACK Panic 2019" — a different kind of outage, this time a TCP kernel bug rather than a routing leak.

## Where to go deeper

- The BGP episode picks up the mechanism — path-vector routing, eBGP versus iBGP, the OPEN/UPDATE/KEEPALIVE message flow, and how a best-path decision actually gets made.
- The IP episode covers what those 37,000 prefixes are made of — the IPv4 address space, longest-prefix match, TTL, and why a "more specific" announcement wins.
- The TLS episode handles the handshake, the SNI leakage problem, and where ECH fits — the cryptographic backstop that the "but it's all encrypted" reply was assuming and never quite had.

## Visual cues for image generation

- World map at 15:54 UTC on 8 April 2010 — arrows for 37,000 prefixes pulled toward a single node labeled AS 23724 China Telecom; counter ticking from 0 to 18 minutes.
- Pie chart of the global IPv4 routing table — a 15% slice highlighted, with logos for .mil, .gov, Dell, Yahoo, IBM, and Microsoft sitting inside the slice.
- Timeline strip — 15:54 announcement, automated detection within minutes by BGPmon and RIPE RIS, 16:12 upstream filters installed, 16:18 BGP convergence restored.
- Split-screen: "accident" (a config push to an internal route table leaks to external peers) vs "espionage" (a deliberate hijack disguised as the same thing) — same packets on the wire either way.
- Bar chart of RPKI ROV adoption climbing from near-zero in 2010 to over 50% of IPv4 prefixes in May 2024, annotated with .gov/.mil early signers and the 2018-2022 hyperscaler peering mandates.

## Sources

- [MANRS — RPKI ROV milestone](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)
- [Cloudflare — RPKI Updates](https://blog.cloudflare.com/rpki-updates-data/)
- [Feisty Duck — ECH approved for publication](https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication.html)
- [CISecurity — security control changes due to ECH](https://www.cisecurity.org/insights/blog/security-control-changes-due-to-tls-encrypted-clienthello)
