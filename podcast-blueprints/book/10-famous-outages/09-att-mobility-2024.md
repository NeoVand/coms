---
id: famous-outages/att-mobility-2024
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: AT&T Mobility 2024
synopsis: 125 million devices, 25,000 failed 911 calls.
podcast_target_minutes: 12
position_in_book: chapter 73 of 75
listening_order:
  prev: famous-outages/rogers-2022
  next: frontier/post-quantum
related_protocols: [wifi]
related_pioneers: []
related_outages: [rogers-2022, att-mobility-2024]
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "US map at 03:30 ET on 22 February 2024 with AT&T cell towers blinking out region by region over the first hour."
  - "A timeline bar showing 02:42 CT configuration push, 02:43 CT protect-mode trip, then a 12-hour grey band of nationwide outage."
  - "A split-screen comparison of Rogers 2022 and AT&T 2024 — same cascade shape, different country, two years apart."
  - "A canary-deployment diagram with 0.1 percent, 1 percent, 10 percent, 100 percent rings — and a red 'simultaneous to 100 percent' arrow cutting straight across them."
  - "A 911 dispatch console with 25,000 unanswered call attempts stacked next to a list of state advisories telling customers to walk to the nearest fire station."
---

# Part XI, Chapter — AT&T Mobility 2024

## The hook
On 22 February 2024 at 03:30 Eastern, one of the three large US wireless carriers stopped working. Within an hour, 125 million devices were unreachable. Twelve hours later, when service finally came back, 25,000 emergency 911 calls had failed to connect. The cause: a planned change, deployed simultaneously across the production fleet, with insufficient progressive-rollout controls. The same shape as Rogers 2022 — and the same lesson, learned again.

## The story

### Twelve Hours, A Continent
At 03:30 ET on 22 February 2024, AT&T Mobility customers across the United States began losing service. Calls failed. SMS failed. Mobile data failed. Within an hour, the outage was nationwide. The cause was a routine network upgrade that had been incorrectly configured and pushed simultaneously across the production wireless core.

Approximately 125 million devices became unreachable for up to twelve hours. Some regions came back faster — the West Coast was largely restored by 09:00 ET — and others lingered into the early afternoon. Even after primary service returned, voice calls had elevated failure rates for another 24 hours as the network worked through queued traffic.

The FCC report later pinned down the minute-by-minute. At 02:42 Central Time, the network change with the equipment configuration error went in. At 02:43, one minute later, the error tripped a self-protection threshold inside the mobility core. The network did exactly what it had been designed to do when it detects something seriously wrong: it entered "protect mode" and started disconnecting subscribers to limit damage. The damage it was limiting was itself.

### The 25,000 Failed 911 Calls
The most consequential failure was 911. An estimated 25,000 emergency calls were not connected during the outage — a number AT&T disclosed in its FCC report. Across the same window, more than 92 million voice calls were blocked.

Several states issued public advisories during the outage telling AT&T customers to use Wi-Fi calling, which routes through the home internet rather than the cellular network — the mechanism is part of the Wi-Fi episode. They also told customers to switch to a different carrier's SIM if available, to use landlines if accessible, and, if all else failed, to walk or drive to the nearest fire station, police station, or hospital. In 2024. In the United States.

The FCC opened a formal investigation under the 2018 911 Reliability Rules. AT&T offered all affected customers a five-dollar service credit — about 625 million dollars in aggregate — and reached a 13 million dollar settlement with the FCC in November 2024. That was the largest single-incident penalty for a US wireless outage on record.

### Same shape as Rogers 2022
The shape of the AT&T failure mirrors Rogers 2022 uncomfortably. A planned change, deployed simultaneously across the production fleet, with insufficient progressive-rollout controls. The full account of Rogers — twelve million Canadians offline for fifteen hours, Interac debit terminals dark across an entire country's retail — is the previous chapter in the Famous Outages part of the book. The lesson the industry should have internalised after Rogers, and the one this chapter opens on, is one short sentence: never push a config change to the entire fleet at once.

It had not propagated. AT&T's post-incident report committed to canary deployment for all core network changes within the year.

### The Canary-Deployment Maturity Gap
The web and cloud industry adopted canary deployments more than a decade ago. Every meaningful change rolls out to 0.1 percent of traffic, then 1 percent, then 10 percent, then 100 percent, with automatic rollback on failure indicators. The telecom industry has lagged.

The reasons for the lag are structural, not cultural. Wireless networks have strong global consistency requirements that don't align cleanly with canary deployment. You can't have one cell tower running a different version of the radio access network protocol than the towers next to it without breaking handoff. Some configuration changes are necessarily global. Some changes are necessarily simultaneous — security updates that close a known vulnerability, for example, where staggering the rollout means leaving part of the fleet exploitable for the duration.

Post-AT&T-2024, the industry consensus is that most changes can be canaried, even in wireless cores, and the small number that genuinely cannot should receive correspondingly more pre-deployment review. The architectural debate, ongoing, is whether the same caution should apply to security patches that need to ship fast. A mass-deployment outage and an unpatched-CVE outage are both bad in different ways, and the correct trade-off is not obvious.

## The figures

### AT&T Mobility — Nationwide Wireless Down
A network change with an equipment configuration error pushed the AT&T mobility network into protect mode, disconnecting all wireless devices nationwide. Onward from 02:42 Central Time on 22 February 2024, the cascade ran in four beats: the bad configuration push, the protect-mode trip one minute later, the nationwide disconnect of more than 125 million devices, then a twelve-hour recovery cycle of configuration rollback and gradual reconnection — paced to avoid signalling overload from the entire fleet trying to re-attach at once. The FCC's post-mortem reads like every BGP outage post-mortem from the previous decade: insufficient peer review, missing controls, unscanned changes. The lesson, stated plainly in the chapter: a self-protection mechanism that disconnects users is a category that needs careful design. The threshold for protect mode should not be reachable by an operator's mistake — and if it is, recovery should not require twelve hours.

### Rogers — A Country Disconnected
Two years and seven months earlier, on 8 July 2022, a maintenance change to BGP route policy in Rogers Communications' IP core inadvertently allowed a full BGP table — nearly a million prefixes — to redistribute into OSPF, the intra-AS routing protocol Rogers used. OSPF was never designed to carry a million routes; the core router CPUs saturated, the control plane melted, and twelve million Canadians lost wireless, wireline, internet, and Interac point-of-sale debit-card service for roughly fifteen hours. The CRTC's 2024 executive summary identified missing route filters and lab testing skipped after a risk algorithm down-graded the change from "High" to "Low." Canada subsequently mandated mutual emergency-roaming agreements between carriers, on the principle that a single autonomous system failing should not disconnect a country. The full account is the previous chapter in this part of the book.

## What it taught the industry
The first thing it taught the industry is that the Rogers lesson had not generalised. Two configuration-pushed-to-the-entire-fleet outages, in two countries, in two years, on two different layers of the stack — Rogers in the IP routing core, AT&T in the wireless mobility core — produced almost identical headlines and almost identical post-mortems. The pattern is the change-management one, not the protocol one.

The second is that "protect mode" needs to be designed as a category, not as a feature. Self-protection mechanisms that disconnect users are necessary in carrier-scale networks; they exist precisely because the alternative — letting a misbehaving subsystem corrupt state across the whole core — is worse. But the threshold for entering protect mode should not be reachable by an operator's routine mistake, and the path back out should not take twelve hours.

The third is the canary-deployment debate the chapter closes on. Most changes in a wireless core can be canaried. The small number that genuinely cannot — security patches that must ship fleet-wide on the day of disclosure, configuration changes with strong global consistency requirements — should receive correspondingly more pre-deployment review. The trade-off between mass-deployment outages and unpatched-CVE outages is now an active design question for every wireless operator, not a settled one.

## Listening order

- **Before this chapter:** *"Rogers 2022 — A Country Disconnected"* — the previous outage episode and the direct ancestor of this one. Same shape: a planned change, deployed simultaneously across the production fleet, taking down a national carrier for most of a day.
- **After this chapter:** *"Post-Quantum TLS"* — the next episode pivots from the failures part of the book to the frontier, picking up the encryption migration that will reshape the next decade of the network.

## Where to go deeper
- The Wi-Fi episode covers the calling fallback that several US states told their citizens to use during the outage — how 802.11 carries voice through your home internet when the cellular network has disappeared.

## Visual cues for image generation
- US map at 03:30 ET on 22 February 2024 with AT&T cell towers blinking out region by region over the first hour.
- A timeline bar showing 02:42 CT configuration push, 02:43 CT protect-mode trip, then a 12-hour grey band of nationwide outage.
- A split-screen comparison of Rogers 2022 and AT&T 2024 — same cascade shape, different country, two years apart.
- A canary-deployment diagram with 0.1 percent, 1 percent, 10 percent, 100 percent rings — and a red "simultaneous to 100 percent" arrow cutting straight across them.
- A 911 dispatch console with 25,000 unanswered call attempts stacked next to a list of state advisories telling customers to walk to the nearest fire station.

## Sources
- [FCC — February 22, 2024 AT&T Mobility Network Outage Report](https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf)
- [AT&T — Network Update](https://about.att.com/pages/network-update)
- [Cloudflare — view of the Rogers outage](https://blog.cloudflare.com/cloudflares-view-of-the-rogers-communications-outage-in-canada/)
- [CRTC — Assessment of Rogers Networks for Resiliency and Reliability](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)
- [Wikipedia — 2022 Rogers Communications outage](https://en.wikipedia.org/wiki/2022_Rogers_Communications_outage)
