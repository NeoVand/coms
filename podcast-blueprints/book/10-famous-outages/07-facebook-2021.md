---
id: famous-outages/facebook-2021
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: Facebook 2021 — The Cascade
synopsis: BGP, DNS, badge readers — six hours of compounding failure.
podcast_target_minutes: 15
position_in_book: chapter 71 of 75
listening_order:
  prev: famous-outages/centurylink-2020
  next: famous-outages/rogers-2022
related_protocols: [bgp, dns, ip, oauth2]
related_pioneers: []
related_outages: [facebook-2021]
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "World map with AS 32934 prefixes blinking out one by one between 15:39 and 15:42 UTC on 4 October 2021."
  - "A cascade diagram with five boxes — backbone, BGP, DNS, internal tools, badge readers — falling like dominoes from a single command at the top."
  - "A data centre door with an offline badge reader, an engineer with bolt cutters, and a security escort beside them."
  - "Two architecture diagrams side by side — 'on paper' showing five independent boxes, 'in operation' showing all five wired to the same backbone."
  - "A single terminal prompt running a maintenance command, with a 'blast radius preview' overlay showing the global impact."
---

# Part XI, Chapter — Facebook 2021 — The Cascade

## The hook
On 4 October 2021, an industry observer summed it up in one line: *"Facebook went away. Their badge readers went away. They literally could not get into the building to fix the badge readers."* One command, six hours, three and a half billion users disconnected. This is the story of how a routine maintenance script turned every safety mechanism in Meta's network into a bigger problem.

## The story

### A Routine Maintenance Command, Then Six Hours
At 15:39 UTC on 4 October 2021, a Facebook engineer ran a routine maintenance command on the backbone connecting Facebook's data centres. The command was supposed to assess capacity by temporarily withdrawing one backbone link's BGP advertisements, then putting them back. How BGP actually announces and withdraws routes is the whole second half of the BGP episode — for now, just remember that BGP is how the internet learns which networks reach which.

The command had a bug. Instead of touching one link, it withdrew every BGP route Facebook advertised, globally. Within minutes, every facebook.com, instagram.com, and whatsapp.com lookup returned NXDOMAIN. Three and a half billion users disconnected.

That was the easy part of the cascade.

### The DNS Black Hole
Facebook's authoritative DNS servers lived inside the data centres that had just lost their BGP advertisements. Resolvers around the world tried to query them, and got nothing back, because the IP addresses no longer routed anywhere. Cached records expired in minutes, not hours, and once they did, DNS resolution for Facebook's domains failed worldwide.

Without DNS, Facebook's internal systems went with it. Workplace, the calendar, internal monitoring, the OAuth flow that signed engineers in, the company directory — all of it stopped resolving. Engineers could not reach their own infrastructure remotely. They could not even confirm from the outside that the outage was BGP-related, because their monitoring tools could not look up internal hostnames.

If you want the full picture of how DNS authoritative servers, resolvers, and TTL caching fit together, that is the DNS episode. The point here is what happens when a company's own front door is locked behind its own broken network.

### The Badge Readers
The next layer of cascade is the part that made the outage famous outside engineering. Facebook's physical security infrastructure — the door badge readers at the data centres themselves — depended on the same authentication system that had just disappeared.

Engineers drove to the data centres physically. They could not get into the buildings. The badge system was offline. They had to be escorted in by on-site security staff who could manually override the locks. Once inside, they had to find the specific machines that needed manual intervention — and the data-centre wayfinding tools were also offline. Engineers were reportedly dispatched with bolt cutters.

The first BGP fix went in around 21:00 UTC. DNS prefix advertisements came back at 21:05. Recovery completed by 22:30. Six hours of compounding disaster, traceable to a single bad command.

### Independent on the diagram, same fate in operation
The lesson the industry took away was simple to state and brutal in practice: dependencies that look independent on the architecture diagram are often the same dependency in operation. BGP, DNS, badge readers, build systems, monitoring — Facebook's diagram showed them as separate concerns. In practice, all five depended on the same underlying network. When the network disappeared, all five disappeared together. Meta's post-mortem the next day documented every step, and the industry collectively learned to ask the same question of every operationally-critical system: what depends on the network?

## The figures

### The Facebook Disappearance
A routine maintenance command on Meta's global backbone took down its DNS, then its websites, then its employees' badge readers — all because the safety mechanism worked exactly as designed. Meta runs tens of thousands of miles of fibre between its data centres as a private global backbone. Its DNS servers live in smaller edge facilities with a defensive rule: if a DNS server cannot reach the data centres, it withdraws its own BGP advertisements so nobody routes queries to a server that cannot answer. The reasoning was sound — but on 4 October, every edge server triggered that rule at once.

The cascade is dated to the minute. At 15:39 UTC, the maintenance command disconnected the data centres from each other. By 15:40, Cloudflare and other observers saw a flood of BGP UPDATE messages from AS 32934, then a wave of WITHDRAWALs covering the IPv4 and IPv6 prefixes of Facebook's DNS servers. From the outside, Facebook ceased to exist. By 15:42, public resolvers like 1.1.1.1 and 8.8.8.8 were returning SERVFAIL for facebook.com, and apps and humans retrying generated a 30× DNS query surge on those resolvers. By 15:50, WhatsApp, Instagram, Messenger, and Oculus had all gone dark. By around 16:00, Meta's own engineers could not get into the network to fix it, because their internal tools depended on the same DNS and their badge readers depended on the same network. Backbone connectivity was restored around 21:00 UTC; DNS came back at 21:05.

Estimated revenue impact crossed 60 million dollars. Mark Zuckerberg's net worth dropped by more than six billion dollars in a day. In developing countries where Facebook's "Free Basics" program is the de-facto internet, communication, business, and humanitarian work paused for seven hours. Meta's post-mortem named configuration tooling and audit-bypass as the root cause; the BGP withdrawal was the symptom of a larger backbone failure, not the cause.

The full account, with the cast — Meta as AS 32934, Cloudflare and ThousandEyes as the external monitors who told the world what was happening — is the centrepiece of this part of the book. This chapter episode is its narrative spine.

## What it taught the industry
Three structural changes rolled through the industry in the eighteen months after the outage.

The first was out-of-band recovery for authoritative DNS. Facebook, and others, moved to a model where authoritative DNS for their critical domains is reachable through multiple independent network paths — including paths that do not depend on the company's own backbone. Cloudflare and AWS Route 53 both saw enterprise growth as customers moved DNS to a posture of "if our network is down, our DNS is still up." The mechanics of authoritative versus recursive DNS belong to the DNS episode; the point here is the operational rule that came out of October 2021.

The second was physical access systems on independent networks. Badge readers, door locks, environmental controls, fire suppression — anything that has to work during a network outage now runs on dedicated, isolated networks at most hyperscalers. The lesson, stated as plainly as the post-mortem could state it: physical security cannot depend on the network whose data centre it secures.

The third was maintenance command audit. The BGP withdrawal command was supposed to be limited in scope, but the safety check did not catch the broader effect. Facebook, and others, added a "blast radius preview" layer to all maintenance tooling. Show me, in plain English, what this command will affect across the global network, and require explicit confirmation if the answer is more than a small number of devices.

## Listening order

- **Before this chapter:** *"CenturyLink Flowspec 2020"* — the previous outage episode, where a single Flowspec rule rippled across a tier-1 backbone, sets up the same theme: one command, global blast radius.
- **After this chapter:** *"Rogers 2022 — A Country Disconnected"* — the next outage episode, where a single carrier's failure took down banking, 911, and payment terminals across an entire country, picks up exactly where this one leaves off.

## Where to go deeper
- The BGP episode picks up the mechanism story — UPDATE and WITHDRAWAL messages, AS_PATH, eBGP versus iBGP, the path-vector model that made Facebook vanish from the global routing table in seconds.
- The DNS episode covers the hierarchy — root, TLD, authoritative — and why TTLs measured in minutes mean a backbone outage becomes a global resolution outage as soon as caches expire.
- The IP episode covers the IPv4 and IPv6 prefixes that AS 32934 withdrew, and how routers actually carry a packet hop by hop once a prefix is reachable again.
- The OAuth episode covers the delegated authorization flow that quietly underpinned Workplace, the company directory, and the badge system — and why losing the identity provider takes everything that trusts it down with it.

## Visual cues for image generation
- World map with AS 32934 prefixes blinking out one by one between 15:39 and 15:42 UTC on 4 October 2021.
- A cascade diagram with five boxes — backbone, BGP, DNS, internal tools, badge readers — falling like dominoes from a single command at the top.
- A data centre door with an offline badge reader, an engineer with bolt cutters, and a security escort beside them.
- Two architecture diagrams side by side — "on paper" showing five independent boxes, "in operation" showing all five wired to the same backbone.
- A single terminal prompt running a maintenance command, with a "blast radius preview" overlay showing the global impact.

## Sources
- [Cloudflare — Understanding how Facebook disappeared from the Internet](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Wikipedia — 2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
