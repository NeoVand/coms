---
id: famous-outages/centurylink-2020
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: CenturyLink Flowspec 2020
synopsis: A BGP rule kills the BGP session that delivered it.
podcast_target_minutes: 12
position_in_book: 70 of 75
listening_order:
  prev: famous-outages/sack-panic-2019
  next: famous-outages/facebook-2021
related_protocols: [bgp]
related_pioneers: []
related_outages: [centurylink-flowspec-2020]
related_frontier: []
related_rfcs: [5575]
images: []
visual_cues:
  - "A single BGP UPDATE packet labeled 'Flowspec rule' arriving at a router, then the router dropping the next BGP keepalive that follows it — the rule eating its own delivery channel."
  - "World map showing CenturyLink AS 3356 footprint in red, with a small caption: '3.5% of global internet traffic dropped, 30 August 2020, ~5 hours.'"
  - "Side-by-side: a router's data-plane interface (blocked) and its out-of-band management port (open) — captioned 'the only way back in.'"
  - "A loop diagram: bad rule → BGP session dies → session re-establishes → rule re-delivered → session dies again."
---

# Part XI, Chapter — CenturyLink Flowspec 2020

## The hook
A control-plane rule that disables its own delivery mechanism is the worst kind of bug. There is no out-of-band channel to issue the fix. On 30 August 2020, one of the largest backbones on the internet pushed exactly that kind of rule, and it took five hours of manual work to undo it. While the engineers worked, about three and a half percent of all global internet traffic disappeared.

## The story

### A Rule That Killed Its Own Delivery Mechanism
On 30 August 2020, CenturyLink — Autonomous System 209, now branded Lumen, one of the largest tier-1 backbones in the United States — propagated a single BGP Flowspec rule across its global network.

Flowspec is a BGP extension. It lets operators install firewall-like packet filters by piggybacking them onto the same protocol that carries internet routes. RFC 5575 standardized it in 2009; RFC 8955 refreshed it later. The appeal is operational: thousands of routers can install a DDoS mitigation rule in seconds, because every router on the backbone already speaks BGP. How BGP itself works — sessions, keepalives, UPDATE messages, AS_PATH — is the subject of the BGP episode. Today's story only needs one fact about it: BGP runs over TCP port 179, and if the keepalives stop arriving, the session dies.

The rule that day was supposed to filter traffic for a single customer's DDoS protection. The catastrophic mistake was in the match criteria. They were too broad. They matched BGP control traffic itself.

Routers across the network received the rule. They applied it. They immediately began dropping the BGP keepalive packets that would have carried the next rule — including any rule that retracted this one. Sessions timed out. As they timed out, BGP withdrew every prefix learned through them. Then each session re-established, re-received the same poisoned Flowspec rule, and died again. The Cloudflare write-up the next day called it a control-plane infinite loop. The network was not down in the simple sense; it was thrashing.

### Five Hours of Manual Recovery
There was no automated way to retract the bad rule. The retraction mechanism was BGP, and BGP was the thing the rule had broken. Every affected router had to be touched by hand — either through out-of-band management or by physically connecting to a console.

Recovery took roughly five hours. During that window, Cloudflare measured a drop of about 3.5% of all global internet traffic. For a single backbone, that number is enormous. Cloudflare, Amazon, Microsoft, and most of the U.S. tier-1 customers reported downtime. SaaS providers, video calls, and games went sideways. Part of the recovery required CenturyLink to ask other tier-1s to de-peer with them temporarily, just to drain the BGP-update queue long enough for the bad rule to clear. Cloudflare's analysis became required reading in BGP operations the next morning.

There is a callout in the chapter that's worth saying out loud: out-of-band management is not optional. CenturyLink could only recover at all because every core router had a separate physical interface for administration that did not depend on the data plane. Without that, the fix would have meant truck rolls to every point of presence on the backbone. Modern operations treats out-of-band as a hard requirement, not a nice-to-have. Never assume the production network will be available to fix the production network.

### The Architectural Concern That Remains
CenturyLink rolled out automated controls preventing self-blocking rules. The broader industry adopted similar guards. Every modern router's Flowspec implementation now refuses to install rules that would drop traffic to BGP's own port 179, or to the matching peer addresses. Each new generation of routers adds more such guards.

But the underlying architectural concern has no clean fix. The same protocol distributes both the data and the rules governing the data. Flowspec rides on BGP because BGP is what every router already speaks. The alternative — a separate, out-of-band protocol for distributing filter rules — would require new infrastructure on every router on the internet. The economic friction is too high. Nobody is going to deploy it.

So we live with the architectural fragility and add operational guards. The lesson is incremental rather than fundamental: when you build a control plane on top of itself, every change to the control plane needs to be reviewed for self-consistency, manually, before it ships.

## The figures

### CenturyLink / Level 3 — The Flowspec Loop
A BGP Flowspec rule pushed to mitigate a customer's DDoS killed the BGP session that delivered it, and Level 3's tier-1 backbone went into a control-plane infinite loop. Roughly five hours of severe disruption, a 3.5% drop in global internet traffic, and a recovery that required manual de-peering with other tier-1s before the bad rule could be cleared. This is the chapter's own embedded outage record — covered here in full because the chapter is the outage.

### RFC 5575 — Dissemination of Flow Specification Rules
Published in 2009 by P. Marques and co-authors, standards-track. It defined how to encode packet-filtering rules as BGP NLRI so they could be distributed across a network the same way routes are distributed. It is the spec that made Flowspec possible — and, on this day in 2020, the spec whose deployment model the industry learned to be more careful with. RFC 8955 later refreshed it.

## What it taught the industry
Two things changed after CenturyLink. First, Flowspec implementations now ship with built-in guards: they refuse to install rules that would match BGP's own port 179 or the addresses of established BGP peers. Operators added their own validation layers on top. Second, and more broadly, the incident hardened the industry's commitment to out-of-band management as a baseline requirement for any backbone-grade network. The deeper lesson — don't deploy a feature whose failure mode disables the channel that controls it — applies far beyond Flowspec. Any in-band control protocol is one bad rule away from the same trap.

## Listening order

- **Before this chapter:** *"SACK Panic 2019" — a kernel-level TCP bug that took down Linux fleets, setting up the theme that the protocols we trust most are the ones whose failures hurt the most.*
- **After this chapter:** *"Facebook 2021 — The Cascade" — another BGP withdrawal story, but at a single company's scale and with the additional twist that the engineers couldn't badge into the building to fix it.*

## Where to go deeper
The BGP episode picks up the mechanism story — sessions over TCP port 179, OPEN and UPDATE and KEEPALIVE messages, the eBGP/iBGP split, AS_PATH, and how Flowspec NLRI rides the same channel as routing updates. If you want to understand exactly why a single bad UPDATE could cascade across an entire tier-1 backbone, that's where to go.

## Visual cues for image generation
- A single BGP UPDATE packet labeled "Flowspec rule" arriving at a router, then the router dropping the next BGP keepalive that follows it.
- A world map showing CenturyLink AS 3356 footprint in red, captioned "3.5% of global internet traffic dropped, 30 August 2020, ~5 hours."
- Side-by-side ports on a router chassis: the data-plane interface blocked, the out-of-band management port open, captioned "the only way back in."
- A loop diagram: bad rule, BGP session dies, session re-establishes, rule re-delivered, session dies again.
- A timeline strip across five hours, with annotations for "rule pushed," "sessions thrashing," "manual de-peering with other tier-1s," "rule cleared," "re-peering."

## Sources
- [Cloudflare — August 30th 2020 CenturyLink/Level(3) outage analysis](https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/)
- [ThousandEyes — CenturyLink / Level 3 Outage Analysis](https://www.thousandeyes.com/blog/centurylink-level-3-outage-analysis)
- [RFC 5575 — Dissemination of Flow Specification Rules](https://www.rfc-editor.org/rfc/rfc5575)
