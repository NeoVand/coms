---
id: failure-modes
type: chapter
part_id: patterns-failures
part_label: X
part_title: How Networks Actually Behave
title: Failure Modes
synopsis: Bufferbloat, ossification, head-of-line, microloops, MTU black holes — the bestiary every operator learns by being burned.
podcast_target_minutes: 18
position_in_book: 62 of 75
listening_order:
  prev: patterns-failures/patterns
  next: patterns-failures/congestion-history
related_protocols: [tcp, sctp, mptcp, quic, udp, http3, icmp, ip, dns, bgp]
related_pioneers: []
related_outages: [as-7007-1997, pakistan-youtube-2008, china-telecom-2010, facebook-2021, rogers-2022, sack-panic-2019, centurylink-flowspec-2020]
related_frontier: [l4s-comcast-launch, rpki-rov-50-percent]
related_rfcs: [4821]
images: []
visual_cues:
  - "A bestiary-style illustration: seven labelled creatures arranged like medieval marginalia — Bufferbloat as a balloon swallowing packets, Ossification as a stone troll inspecting headers, Head-of-Line Blocking as a single car stalled at a red light with traffic backed up, Microloop as two arrows pointing at each other, MTU Black Hole as a low bridge with a missing warning sign, Slowloris as a sloth holding open a door, BGP Hijack as a pirate flag flown over an Autonomous System number."
  - "A latency-vs-time chart for one home internet link: the green line is throughput, climbing fast. The red line is round-trip time, climbing past one full second while throughput looks fine. A small annotation: 'sender sees no loss; user sees a stuttering video call.'"
  - "A diagram of a packet trying to cross three middleboxes — a NAT, a firewall, a deep-packet-inspection box. The TCP packet with a new option is stripped at the second box; the QUIC packet inside UDP, encrypted, sails through all three."
  - "A timeline of seven outages in this chapter: AS 7007 (April 1997), Pakistan/YouTube (Feb 2008), China Telecom (April 2010), CenturyLink Flowspec (August 2020), SACK Panic disclosure (June 2019), Facebook (Oct 2021), Rogers (July 2022). Each marked with a one-line failure mode."
  - "A diagram of the Facebook 2021 cascade: backbone command at 15:39 UTC, BGP withdrawals at 15:40, DNS SERVFAIL at 15:42, apps cascade at 15:50, badge readers fail by 16:00, recovery at 21:00."
---

# Part X, Chapter — Failure Modes

## The hook

The interesting failures are the ones where everything is "working" but nothing is good. The cable is plugged in. The server is up. The packets are flowing. And yet — your video call stutters, the database query takes thirty seconds, the page load fails five percent of the time. These are the failures worth naming, because each one has a distinctive signature and a known fix once you recognise it.

## The story

### The Bestiary

Some failures are obvious. A cable is cut. A server is down. A process crashed. Those trip every monitoring alarm at once and they are easy to diagnose for exactly that reason.

The other kind is what this chapter is about. The packets keep flowing. The dashboards stay green. The user experience falls apart. There is a finite list of these, and operators learn it by being burned by one after another. Naming the failure mode is most of the diagnosis. Once you can say "this is bufferbloat" or "this is an MTU black hole," the fix is mechanical.

### Bufferbloat — Latency Without Loss

Bufferbloat is what happens when there is too much buffering in routers and modems. A naive engineer thinks more buffer is better — bursts won't cause loss. But TCP's congestion-control loop *needs* loss as its signal to slow down. With huge buffers, packets pile up in router queues for seconds before they are dropped. The sender keeps pushing because no loss is reported.

The result is the symptom every household recognises. Your video call stutters because someone in the next room started a download. The download is happily filling a two-hundred-millisecond buffer with bursts; your video, sharing the same buffer, sits behind two hundred milliseconds of someone else's traffic.

Jim Gettys named the problem in 2010 — he was at Bell Labs, measuring 1.2-second latencies on his home connection — and spent the next decade getting it fixed. The cure was active queue management: CoDel from RFC 8289, PIE from RFC 8033, fq_codel as the Linux default since kernel 4.x. These shrink queues by dropping packets early when latency rises, signalling congestion to senders before the queue grows. The deeper fix is L4S, which uses ECN marking to keep queues sub-millisecond even at full link utilisation, and which Comcast launched in production in late January 2025 — the L4S launch entry on the Frontier page has the full deployment timeline.

Bufferbloat took fifteen years to deploy at scale because every cheap home router on the planet had to be replaced or firmware-updated. We are mostly there now.

### Protocol Ossification — Why You Cannot Change TCP

Protocol ossification is the phenomenon where middleboxes — firewalls, NAT routers, transparent proxies, "next-gen" deep-packet-inspection appliances — inspect protocol headers and break anything that doesn't match what they expect.

The classic example is TCP. By 2015, you could not deploy a new TCP option globally because some non-trivial fraction of middleboxes would strip it, or worse, drop the connection. SCTP cannot traverse the public internet for the same reason: middleboxes drop unknown protocol numbers — the SCTP episode covers why a technically superior transport never escaped telecom infrastructure. Multipath TCP gets stripped to plain TCP by many middleboxes, which is the deployment story of the MPTCP episode.

The fix is the only fix. Tunnel inside something the middleboxes already accept. QUIC runs over UDP specifically because UDP traversal is well understood by middleboxes. Inside the UDP envelope, QUIC encrypts almost everything, so middleboxes can't inspect — and therefore can't ossify — the inner protocol. That is the architectural lesson of the 2010s, and it is the deeper subject of the QUIC and HTTP/3 episodes: encryption is what keeps a protocol evolvable.

### The Subtler Failures

**Head-of-line blocking.** A single lost packet stalls all subsequent in-order data. Severe in TCP. The entire reason HTTP/3 moved off TCP onto QUIC. Visible as latency spikes during loss events. The mechanism — per-stream ordering versus per-connection ordering — is the QUIC episode.

**Microloops.** A routing convergence event temporarily creates a loop where two routers think the path goes through each other. Packets bounce until TTL hits zero. Lasts a few seconds. Usually invisible unless you're tcpdumping.

**MTU black holes.** A path drops large packets but does not return the ICMP "Fragmentation Needed" message that would signal Path MTU. The connection hangs because retransmits also fail. Cure: enable PLPMTUD — Packetisation Layer Path MTU Discovery, RFC 4821 — which probes packet sizes at the application layer; or set TCP MSS clamping at network edges. The ICMP episode covers why ICMP gets filtered in the first place and what breaks when it does.

**Slowloris-style attacks.** Hold connections open with minimal data, exhausting the server's connection table without burning attacker bandwidth. Defended by per-IP connection limits, idle timeouts, and reverse proxies that buffer slow clients.

**Cache poisoning.** Inject malicious answers into a DNS resolver's cache so subsequent lookups go to the attacker's site. Largely cured by source-port randomisation — Dan Kaminsky's 2008 fix — and DNSSEC. The DNS episode unpacks the resolver hierarchy that makes this attack possible.

**BGP hijacks.** An autonomous system announces a prefix it does not own. Examples in the bestiary: AS 7007 in 1997, Pakistan and YouTube in 2008, China Telecom in 2010 — all three are covered in detail in the Famous Outages part of the book. The fix in flight is RPKI with Route Origin Validation, which finally crossed fifty percent of IPv4 prefixes in May 2024. The BGP episode covers the trust model that lets these hijacks happen.

**Cascading failures.** One failure increases load on healthy components, which then fail too. Examples: Facebook in October 2021, Rogers in July 2022 — both also in the Famous Outages part. Cure: rate-limiting and circuit-breakers at every layer. The SRE pattern is "fail fast, fail isolated."

### Reading a Stack Trace vs. Reading a Network

When code crashes, the stack trace tells you where. When a network misbehaves, there is no stack trace — just a histogram of latencies, a packet capture, and the question "which of the patterns in the bestiary is this?" Naming the failure modes is most of the diagnosis. Once you can say "this is bufferbloat" or "this is MTU black hole," the fix is mechanical. The whole purpose of this chapter is to populate that name table in your head.

## The figures

### SACK Panic — A One-Packet Linux Kernel Crash

In June 2019, Netflix's Jonathan Looney disclosed CVE-2019-11477 — an integer overflow in the Linux kernel's TCP stack triggered by a crafted Selective Acknowledgment pattern. With a small enough MSS, a single sk_buff could be split into more than 65,535 GSO segments and overflow a 16-bit counter, panicking the kernel. A single TCP packet, no authentication, instant remote denial of service across most Linux servers on the public internet. CVSS 7.5. The full account sits in the Famous Outages part of the book.

### CenturyLink / Level 3 — The Flowspec Loop

On 30 August 2020, an incorrectly formatted BGP Flowspec rule pushed by Level 3 to mitigate a customer's DDoS matched BGP itself. The rule killed the BGP session that delivered it, the session re-established, the rule was re-pushed, the session died again. For roughly five hours, Level 3's tier-1 backbone churned in a control-plane infinite loop, and Cloudflare measured a 3.5 percent drop in worldwide internet traffic. Recovery required Level 3 to ask other tier-1s to de-peer temporarily so the bad rule could be removed. The detailed cascade is the Famous Outages chapter on this incident.

### The Facebook Disappearance

On 4 October 2021 at 15:39 UTC, a routine maintenance command on Meta's global backbone disconnected its data centres from each other. Meta's DNS edge servers, isolated from the rest of the network, did exactly what they were designed to do — they withdrew their own BGP advertisements so nobody would route queries to them. From the outside, Facebook ceased to exist. WhatsApp, Instagram, Messenger, and Oculus went dark. Public resolvers like 1.1.1.1 and 8.8.8.8 returned SERVFAIL. Internal tools, audit dashboards, and physical badge readers all failed because every product depended on the same DNS. Engineers were reportedly dispatched to data centres with bolt cutters. Recovery at around 21:00 UTC, six hours later. Three billion users affected. The Famous Outages part of the book has the full timeline.

### L4S Launches in Production at Comcast

In late January 2025, Comcast turned on L4S — Low Latency, Low Loss, Scalable throughput — for residential customers in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville, and San Francisco, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. The mechanism — DualQ Coupled AQM at the router, ECN marking instead of dropping, senders that react to marks like minor losses — delivers sub-millisecond queuing latency on a residential ISP. RFCs 9330, 9331, and 9332 had specified the architecture in January 2023; Apple shipped support in iOS 17, iPadOS 17, macOS Sonoma, and tvOS 17 the same year. The L4S launch entry on the Frontier page has the rollout details.

### RPKI ROV Crosses 50% of IPv4 Prefixes

By May 2024, more than half of all IPv4 routes had Route Origin Authorisations, and roughly three-quarters of IP traffic was bound for an RPKI-secured destination. Cloudflare's measurement of *enforcement* — autonomous systems that actually drop invalid routes — puts the directly protected user population at about 261 million, around 6.5 percent. But because almost every tier-1 transit drops invalids, indirect validation suppresses invalid-route propagation by a factor of two to three. ASPA — the path-hijack defence beyond RPKI's origin defence — is in IETF SIDROPS last call as of April 2026.

### RFC 4821 — Packetization Layer Path MTU Discovery

Mathis and Heffner, 2007, proposed standard. Specifies how a sender can probe for the path MTU at the application layer rather than relying on ICMP "Fragmentation Needed" messages — which is exactly the cure for the MTU black hole. PLPMTUD is what lets a connection survive when the network is silently dropping anything bigger than some threshold without telling you why.

## What it taught the industry

Three lessons came out of this bestiary and now shape how transport and routing engineers think.

**Local optimisation creates global pathologies.** Adding more buffer to a router seemed obviously good — bursts wouldn't cause loss. A whole industry's worth of vendors did the locally sensible thing, and the global result was a slower internet for fifteen years. The fix had to be structural: push buffers back down, add explicit signalling so the network could ask senders to slow down without throwing data away. The same shape of mistake produced ossification — every middlebox vendor independently decided to inspect TCP options to "improve security," and collectively they froze the protocol.

**Encryption is what keeps a protocol evolvable.** The middleboxes can't inspect what they can't decrypt, and what they can't inspect they can't ossify. QUIC put almost the entire transport inside an encrypted envelope on top of UDP for exactly this reason. The lesson now applies to every new protocol: design it so the only intermediaries that get to see your wire format are the ones you intend.

**Don't deploy a feature whose failure mode disables the channel that controls it.** That sentence is the lesson of the CenturyLink Flowspec loop, and it generalises. Facebook's DNS withdrawal in 2021 was the same shape of mistake one layer up — the safety mechanism worked exactly as designed, but every internal tool, including the badge readers, depended on the thing the safety mechanism was protecting. The Rogers outage in 2022 was a third instance — a BGP route policy change that flooded the intra-AS routing protocol, melting the very control plane the operators needed in order to roll the change back. The pattern is "in-band control" and the rule is: leave yourself an out-of-band path back in.

## Listening order

- **Before this chapter:** *Recurring Patterns* — sets up the cross-protocol abstractions (handshakes, retransmits, queues, control planes) that this chapter then shows breaking in named, recognisable ways.
- **After this chapter:** *A History of Congestion Control* — zooms into the single most important loop in this bestiary, the one that bufferbloat exposed, and walks the algorithms from Tahoe in 1988 to BBRv3 today.

## Where to go deeper

- The TCP episode picks up the mechanism story for everything in this chapter that touches reliability — sequence numbers, retransmits, SACK, MSS, the loss-based feedback loop that bufferbloat broke.
- The QUIC and HTTP/3 episodes are the architectural answer to ossification and head-of-line blocking — UDP transport, encrypted envelope, per-stream loss recovery, fused TLS handshake.
- The UDP episode is what makes the QUIC tunnel possible — the small, well-traversed envelope that middleboxes already accept.
- The ICMP episode covers why filtering ICMP creates MTU black holes, and why operators keep doing it anyway.
- The DNS episode covers the resolver hierarchy and caching that makes cache poisoning a pattern, and DNSSEC the mitigation.
- The BGP episode covers the trust model that AS 7007, Pakistan/YouTube, and China Telecom all exploited by accident, and the RPKI rollout that is finally closing the gap.
- The IP episode covers the TTL counter that contains microloops, the addressing model that NAT distorted, and the fragmentation fields that PMTUD probes.
- The SCTP and MPTCP episodes are the case studies for ossification — two technically capable transports that the public internet refused to carry.

## Sources

- [Wikipedia — AS 7007 incident](https://en.wikipedia.org/wiki/AS_7007_incident)
- [Bono — "7007 Explanation and Apology" (NANOG, April 1997)](https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html)
- [RIPE NCC — YouTube Hijacking case study](https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/)
- [Wikipedia — Pakistan and YouTube](https://en.wikipedia.org/wiki/Pakistan_and_YouTube)
- [US-China Economic and Security Review Commission — 2010 Report to Congress (§5)](https://www.uscc.gov/sites/default/files/annual_reports/2010-Report-to-Congress.pdf)
- [Wikipedia — IP hijacking (notable cases)](https://en.wikipedia.org/wiki/IP_hijacking#Notable_cases)
- [ThousandEyes — The 2010 China Telecom BGP incident](https://blog.thousandeyes.com/the-2010-china-telecom-bgp-incident/)
- [Cloudflare — Understanding how Facebook disappeared from the Internet](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Wikipedia — 2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
- [Cloudflare — view of the Rogers outage](https://blog.cloudflare.com/cloudflares-view-of-the-rogers-communications-outage-in-canada/)
- [CRTC — Assessment of Rogers Networks for Resiliency and Reliability](https://crtc.gc.ca/eng/publications/reports/xona2024.htm)
- [Wikipedia — 2022 Rogers Communications outage](https://en.wikipedia.org/wiki/2022_Rogers_Communications_outage)
- [Netflix Security Bulletin — TCP SACK PANIC](https://github.com/Netflix/security-bulletins/blob/master/advisories/third-party/2019-001.md)
- [Red Hat — TCP SACK PANIC vulnerability](https://access.redhat.com/security/vulnerabilities/tcpsack)
- [Cloudflare — August 30th 2020 CenturyLink/Level(3) outage analysis](https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/)
- [ThousandEyes — CenturyLink / Level 3 Outage Analysis](https://www.thousandeyes.com/blog/centurylink-level-3-outage-analysis)
- [RCR Wireless — Comcast L4S launch](https://www.rcrwireless.com/20250129/uncategorized/comcast-l4s)
- [Nokia Bell Labs — L4S](https://www.nokia.com/bell-labs/research/l4s/)
- [MANRS — RPKI ROV milestone](https://manrs.org/2024/05/rpki-rov-deployment-reaches-major-milestone/)
- [Cloudflare — RPKI Updates](https://blog.cloudflare.com/rpki-updates-data/)
- [RFC 4821 — Packetization Layer Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc4821)
