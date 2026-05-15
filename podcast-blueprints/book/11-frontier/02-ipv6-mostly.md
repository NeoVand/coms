---
id: ipv6-mostly
type: chapter
part_id: frontier
part_label: XII
part_title: The Modern Frontier (2024–2026)
title: IPv6-Mostly
synopsis: On 28 March 2026, Google's IPv6 dashboard recorded 50.1% for the first time.
podcast_target_minutes: 12
position_in_book: 76 of 84
listening_order:
  prev: frontier/l4s-everywhere
  next: frontier/rpki-aspa
related_protocols: [ipv6, ip, tls]
related_pioneers: []
related_outages: []
related_frontier: [ipv6-50-percent]
related_rfcs: [8925, 8781, 6877, 6434]
images: []
visual_cues:
  - "A line chart of Google's measured IPv6 share from 1995 to 2026, with a single labelled point at 28 March 2026, 50.1 percent — and faint lines below at 40 and 43 percent labelled Cloudflare and APNIC."
  - "A two-panel diagram of an IPv6-Mostly access network: capable client gets DHCPv4 Option 108 and skips IPv4; legacy client gets a private IPv4 lease that traverses a NAT64 PLAT at the carrier edge."
  - "A world map of mobile IPv6 share in 2026 — US 87 percent, France 86 percent, India 75-plus, China 77 percent of users — shaded by share."
  - "A receipt graphic with a single line item: $0.005 per public IPv4 address per hour, dated 1 February 2024 — the AWS price change that moved everything."
  - "A timeline labelled 1995 to 2045: RFC 1883, RFC 2460, T-Mobile 464XLAT 2014, Jio 2016, AWS pricing 2024, Google 50 percent 2026, Huston extrapolation 2045."
---

# Part XII, Chapter — IPv6-Mostly

## The hook

On 28 March 2026, Google's IPv6 statistics dashboard recorded 50.1 percent for the first time in its history. Twenty-eight years after RFC 2460. Long enough that the original spec, RFC 1883, predates the W3C. The transition the community has been promising since 1995 finally crossed half — at one vantage point, on one day, on one operator's network. This chapter is about that crossing, what made it happen, and Geoff Huston's October 2024 warning that the rest of the road may take until 2045.

## The story

### The 50% Crossing

The headline number lands cleanly. On 28 March 2026, Google's IPv6 dashboard recorded 50.1 percent — IPv6 briefly carried more of Google's measured user traffic than IPv4. The weekly average on either side of that peak sat in the 45-to-48 percent band. Cloudflare Radar measured 40.1 percent of HTTP requests in the same window. APNIC Labs measured 43.13 percent of networks IPv6-capable. Same trend, three different vantage points. The 50 percent number is a Google-specific snapshot, not a global average — but it is the milestone the community has been waiting for since IPv6 was specified in 1995.

The mechanism story for IPv6 itself — the 128-bit addresses, the fixed 40-byte header, the move from broadcast ARP to multicast Neighbor Discovery — lives in the IPv6 episode. This chapter is about deployment, not packets.

For most of the twenty-eight years between specification and 50 percent, deployment was painful. Early adopters had to maintain dual stacks. The operational cost was double. The upside was mostly future-proofing.

Adoption finally inflected when mobile carriers went IPv6-mostly for cellular subscribers. T-Mobile US moved its mobile core to IPv6-only with 464XLAT — Cameron Byrne presented the production case study at NANOG 61 in 2014, and that case study defined the pattern. Verizon and AT&T followed. By 2026, US mobile IPv6 averages around 87 percent. France 86 percent in February 2026. India between 67 and 80 percent, largely on the back of Reliance Jio's IPv6-first launch in 2016 — Jio crossed 237 million IPv6 users by 2017. China reports 865 million IPv6 users — about 77 percent of users, 34 percent of traffic — as of September 2025.

Mobile is the leading edge. Everything else is the long tail.

### AWS Started Charging — And Everything Moved

On 1 February 2024, AWS started charging $0.005 per public IPv4 address per hour. About $3.65 per month per address. Attached or unattached. It was the first hard financial push toward IPv6 from a hyperscaler at scale.

For organisations running thousands of VMs, the cost added up the moment the bill arrived. Within months, AWS workloads at scale began migrating to IPv6-only architectures, with NAT64 gateways translating to legacy IPv4 destinations. The economic forcing function did more for IPv6 deployment in 2024 than two decades of advocacy.

Meta now runs more than 99 percent of internal datacenter traffic over IPv6. Entire new clusters are IPv6-only and serve IPv4 clients via L4 and L7 load balancers. Meta's own measurements say internal IPv6 is 10 to 15 percent faster than IPv4 — and on one carrier mobile measurement, 40 percent faster. The speedup comes mostly from removing NAT and from better caching, not from the protocol itself.

### IPv6-Mostly is the deployment pattern

The phrase "IPv6-Mostly" describes what most modern networks actually deploy. A single network that tells capable clients to skip IPv4 entirely, while still serving the legacy stragglers that ask for an IPv4 lease.

Three RFCs make it work. DHCPv4 Option 108 — RFC 8925, 2020 — is the signal a DHCPv4 server sends to capable clients meaning "you don't need an IPv4 address; this network is IPv6-Only Preferred." PREF64 in Router Advertisements — RFC 8781, also 2020 — is how the router tells hosts which IPv6 prefix the network's NAT64 gateway uses. And 464XLAT — RFC 6877, 2013 — is the customer-side translator, the CLAT, that lets an IPv4-only application on the host run unchanged on an IPv6-only access network.

The OS support is finally there. Fedora and NetworkManager auto-enable CLAT for IPv6-mostly networks as of 2024. Windows 11 ships 464XLAT CLAT. Modern Android, iOS 9 and later, and macOS 13 and later all have CLAT as a first-class citizen. IPv6-only access networks now Just Work for IPv4 applications too — the cross-compatibility tax that paralysed the late-2000s migration is gone.

### The Long Tail — and Why It May Be Permanent

In October 2024, Geoff Huston at APNIC published the projection that defines the chapter's pull-quote. Linear extrapolation puts the IPv6 transition completing around late 2045. And — this is the part that matters — Huston warned that v4 and v6 coexistence may now be a steady state rather than a transition. The remaining hurdle is enterprise. Most large companies still run IPv4-only internal networks. New infrastructure is built v6-first. Old IPv4 islands age out slowly.

The 2024 RFC backlog is a fingerprint of where IPv6 work is happening now. RFC 9637, August 2024, added `3fff::/20` as a second IPv6 documentation prefix on top of `2001:db8::/32` — large enough to model multi-AS networks in examples and tutorials. RFC 9673, October 2024, finally relaxed Hop-by-Hop Options handling so HBH options are deployable on real router silicon — the original spec demanded a level of fast-path support no shipping ASIC actually had. RFC 9602, 2024, reserved `5f00::/16` for SRv6 SIDs. None of these are dramatic. All of them are the working details of a protocol that has finally crossed into routine maintenance.

Apple iCloud Private Relay, in service since October 2021, prefers IPv6 egress when an AAAA record exists. Pure IPv4-only enterprise networks frequently break Private Relay. The documented response is per-network opt-out, which is itself a forcing function for IPv6 deployment in any enterprise that wants Apple device compatibility.

The "everyone gets this wrong" detail. IPv6's mandatory-to-implement IPsec requirement was demoted to optional in RFC 6434, 2011. That is the source of the persistent "but IPv6 is encrypted by default" myth. IPv6 is not encrypted by default. The encryption story for IPv6 is the same as the encryption story for IPv4 — TLS at the application layer, which is the TLS episode's job. The address space changed. The trust model did not.

## The figures

### IPv6 Crosses 50% of Google's Traffic

The frontier entry. On 28 March 2026, IPv6 carried 50.1 percent of Google's traffic for the first time — twenty-eight years after RFC 2460. The economics that finally tipped it: AWS charging $0.005 per public IPv4 address per hour from February 2024, plus 464XLAT being a first-class citizen in modern Android, iOS 9 and later, macOS 13 and later, and Windows 11. The full launch entry sits on the Frontier page.

### RFC 8925 — IPv6-Only Preferred Option for DHCPv4

Published 2020, Proposed Standard. Authors Lorenzo Colitti, Jen Linkova, Michael Richardson, and Tomek Mrugalski. Defines DHCPv4 Option 108 — the signal a DHCPv4 server sends meaning "this network is IPv6-Only Preferred; if you can do IPv6-only, skip the IPv4 lease." The capable-client opt-out that makes a single physical network IPv6-Mostly without breaking the legacy clients on it.

### RFC 8781 — Discovering PREF64 in Router Advertisements

Published 2020, Proposed Standard. Authors Lorenzo Colitti and Jen Linkova. Defines the Router Advertisement option that tells hosts which IPv6 prefix the network's NAT64 gateway uses. The piece of the IPv6-Mostly stack that lets the host's CLAT know where to send synthesised packets.

### RFC 6877 — 464XLAT

Published 2013, Informational. Authors Masataka Mawatari, Masanobu Kawashima, Cameron Byrne — the same Cameron Byrne whose NANOG 61 case study in 2014 defined the production deployment pattern. Specifies the combination of stateful and stateless translation that lets an IPv4-only application run unmodified on an IPv6-only access network. CLAT on the host translates IPv4 to IPv6; PLAT — a NAT64 — at the carrier edge translates IPv6 back to IPv4.

### RFC 6434 — IPv6 Node Requirements

Published 2011, Informational. Authors Ed Jankiewicz, John Loughney, Thomas Narten. The RFC that demoted IPsec from mandatory-to-implement to optional. Source of the persistent myth that IPv6 is encrypted by default. It is not. Encryption for IPv6 is TLS at the application layer, the same as for IPv4.

## What it taught the industry

Three things are now permanent.

**Economics moves IPv6, advocacy does not.** Two decades of "you really should deploy IPv6" produced steady but slow growth. One AWS line item — $0.005 per address per hour — produced a wave of IPv6-only architectures inside a year. The transition was waiting for someone to make IPv4 cost real money at scale. AWS did, in February 2024.

**Mobile carriers proved the deployment pattern, then everyone copied it.** T-Mobile's 2014 NANOG presentation on IPv6-only with 464XLAT was the existence proof. Reliance Jio's 2016 launch was the scale proof — 237 million IPv6 users by 2017. By 2026 the pattern — DHCPv4 Option 108, PREF64 in RAs, 464XLAT CLAT on the host — is what every modern access network ships. The OS support that lagged for a decade is now first-class on every major platform.

**Coexistence may be the steady state.** Geoff Huston's October 2024 projection — completion around 2045 if the trend stays linear — is also a warning that the trend may not stay linear. Enterprise IPv4 islands age out slowly. New infrastructure is born v6-first. The internet may simply run both protocols in parallel for the foreseeable future, with NAT64 and 464XLAT as permanent connective tissue rather than transition tools.

## Listening order

- **Before this chapter:** *L4S Everywhere* — the previous frontier entry, on the explicit-signalling congestion-control rollout. It pairs naturally with this chapter because both are stories about a long-promised technology finally shipping at scale in the same window.
- **After this chapter:** *RPKI + ASPA* — the next frontier entry, on origin and path validation for BGP. The deployment shape is similar — a decade of advocacy, then a tipping point — but the protocol layer is different, and the pressure comes from outages rather than pricing.

## Where to go deeper

- **The IPv6 episode** picks up the mechanism story — 128-bit addresses, the fixed 40-byte header, no router fragmentation, Neighbor Discovery instead of ARP, SLAAC for autoconfiguration. If you wanted the why of the deployment, this chapter; if you want the how of every IPv6 packet on the wire, the IPv6 episode.
- **The IP episode** is the IPv4 counterpart — the 20-byte header, TTL, NAT, the 4.3-billion-address space that ran out in 2011. It is the protocol IPv6-Mostly is gradually replacing.
- **The TLS episode** is where the "IPv6 is encrypted by default" myth gets corrected at length. The encryption layer for IPv6 is the same as the encryption layer for IPv4 — TLS at the application layer.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [Google IPv6 statistics](https://www.google.com/intl/en/ipv6/statistics.html)
- [APNIC — Google hits 50% IPv6](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
- [RFC 8925 — IPv6-Only Preferred Option for DHCPv4](https://www.rfc-editor.org/rfc/rfc8925)
- [RFC 8781 — Discovering PREF64 in Router Advertisements](https://www.rfc-editor.org/rfc/rfc8781)
- [RFC 6877 — 464XLAT: Combination of Stateful and Stateless Translation](https://www.rfc-editor.org/rfc/rfc6877)
- [RFC 6434 — IPv6 Node Requirements](https://www.rfc-editor.org/rfc/rfc6434)
