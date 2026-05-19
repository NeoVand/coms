/**
 * Part X — Famous Outages.
 *
 * Ten incidents told as stories — what broke, what cascaded, and
 * what the industry learned. Each chapter is a multi-section read
 * with setup, mechanics, lesson, and links to the related Outage
 * registry entry, RFC fixes, and similar incidents.
 */

import type { BookPart } from '../types';

export const famousOutages: BookPart = {
	id: 'famous-outages',
	title: 'Famous Outages',
	label: 'XI',
	description:
		'Ten incidents told as stories — what broke, what cascaded, and what the industry learned.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'arpanet-1980',
			title: 'ARPANET 1980 — The First Major Crash',
			synopsis: 'A garbled status message brings {{arpanet|ARPANET}} down.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The first lesson the internet had to learn the hard way: protocols must defend against malformed input even from "trusted" peers — especially in the periodic background traffic that nobody watches.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Three Bits, A Whole Network Down',
							text: `On 27 October 1980, {{arpanet|ARPANET}} — the entire research internet of the time, a few hundred host machines connected through {{bbn|BBN}}'s IMPs (Interface Message Processors) — went dark for a full day. The cause was three bits in a periodic status update.

The IMPs ran a distance-vector routing protocol. Every few seconds, each {{imp|IMP}} told its neighbours "I am alive, here are my reachable destinations and the cost of each." A faulty {{imp|IMP}} at Harvard sent a status update where one of its sequence numbers had three bits flipped — turning a single message into something that looked like **three different valid versions of the same announcement**, each claiming to be the most recent.

Receiving IMPs applied their tie-breaking rule (pick the most recent) — but each one picked a different version, then propagated its choice. The network entered a state where every {{imp|IMP}} believed a different version of the topology was canonical. Routes flapped. Loops formed. Throughput collapsed.`
						},
						{
							type: 'narrative',
							title: 'The Six-Hour Diagnosis',
							text: `Eric Rosen at {{bbn|BBN}} spent the next six hours instrumenting the wire and reading {{imp|IMP}} code. The bug was not in the routing algorithm — it was in the **input validation**: the code that received a status update assumed any malformed-looking {{sequence-number|sequence number}} was simply newer than what it had. It never considered the possibility that a single bad {{imp|IMP}} could create three legal-looking versions simultaneously.

The fix was to install patched {{imp|IMP}} software that rejected sequence numbers from impossible state transitions, then reboot every {{imp|IMP}} on the network. Three hours of rollout, five years of organisational change. Rosen wrote up the post-mortem as **[[rfc:789|RFC 789]]** — *"Vulnerabilities of Network Control Protocols: An Example"* — published in July 1981. It is one of the earliest detailed engineering post-mortems published openly, and the template for every "service A took down service B because of an unhandled edge case" report since.`
						},
						{
							type: 'callout',
							title: 'Postel\'s Law had limits',
							text: '**Be conservative in what you send, be liberal in what you accept.** A beautiful guideline — until "liberal" means accepting a malformed message and propagating it network-wide. The 1980 collapse forced the field to admit Postel\'s Law has an important exception: be **strict** in what you accept from anything that isn\'t under your operational control. The modern interpretation: be liberal with **format**, strict with **semantics**.'
						}
					]
				},
				{ kind: 'rfc', number: '789' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'What This Incident Taught the Industry',
							text: `Three changes that are now standard date back to lessons from this incident.

**Periodic background traffic gets first-class testing.** Before 1980, routing keepalives were considered "infrastructure" — they ran in the background and engineers debugged them only when things broke. After 1980, every routing protocol's keepalive path was instrumented and fuzzed alongside the main code paths. Modern equivalents: [[bgp|BGP]] route-refresh, [[ospf|OSPF]] link-state advertisements, BFD keepalives — all heavily tested.

**Public post-mortems became the norm.** [[rfc:789|RFC 789]] established that engineering organisations publish detailed root-cause analyses of their incidents. The Google SRE book, the Cloudflare incident reports, the Facebook 2021 write-up — all descendants of this practice.

**Sequence-number arithmetic is paranoid by default.** Modern protocols reject any {{sequence-number|sequence number}} that is impossibly far in the past or future, instead of trusting wall-clock-style ordering. [[tcp|TCP]]\'s [[rfc:9293|PAWS]] (Protection Against Wrapped Sequences, [[rfc:7323|RFC 7323]]) is one example.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ARPA_Network%2C_Logical_Map%2C_September_1973.jpg/500px-ARPA_Network%2C_Logical_Map%2C_September_1973.jpg',
							alt: 'ARPANET logical map, September 1973 — a few dozen sites linked by IMPs across the United States.',
							caption:
								'The {{arpanet|ARPANET}} logical map, September 1973. Seven years later, this same network — by then a few hundred host machines — went dark for a full day when three bits flipped in a single periodic status update at one Harvard {{imp|IMP}}. Every {{bgp|BGP}} keepalive, every [[ospf|OSPF]] LSA, every Cloudflare incident report is in some sense a descendant of [[rfc:789|RFC 789]], the post-mortem Eric Rosen at {{bbn|BBN}} wrote after this network spent six hours diagnosing itself.',
							credit: 'Image: DARPA / public domain, via Wikimedia Commons'
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'as-7007-1997',
			title: 'AS 7007 1997',
			synopsis: 'A Florida ISP de-aggregates the entire [[bgp|BGP]] table.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Most-specific wins, by definition. {{autonomous-system|AS}} 7007 didn\'t hijack anything on purpose — it simply announced everything as a /24, and the entire internet routed through a single underpowered Florida router.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Florida Router That Ate the Internet',
							text: `On 25 April 1997, an MAI Network Services router in Florida ({{autonomous-system|AS}} 7007) received the global [[bgp|BGP]] {{routing-table|routing table}} from its upstream — about 50,000 prefixes at the time — and, due to a misconfiguration in a packet inspection appliance, **redistributed every entry as a /24 originating from itself**.

[[bgp|BGP]]'s tie-breaking rule is "most-specific prefix wins." A /24 is more specific than a /16 or a /8. So when {{autonomous-system|AS}} 7007 announced "I am the next hop for 8.8.8.0/24" — and 8.8.10.0/24, and 8.8.11.0/24, and tens of thousands more — every [[bgp|BGP]] router on the planet preferred those new, more-specific routes over the legitimate aggregated announcements.`
						},
						{
							type: 'narrative',
							title: 'The Cascade',
							text: `Within minutes, the rest of the internet was sending **the entire internet's traffic** through a single underpowered Florida router. Of course it collapsed under load — the device had nowhere near the forwarding capacity of a tier-1 backbone.

What made the recovery so painful was that there was no way to tell [[bgp|BGP]] "drop those announcements" centrally. Every upstream provider had to manually install filters rejecting the bogus /24s from {{autonomous-system|AS}} 7007. Sprint took the lead on the global cleanup — pulling cable, updating filter lists, waiting for [[bgp|BGP]] convergence. Most of the global internet was unreachable for over an hour.`
						},
						{
							type: 'callout',
							title: 'Three controls that did not exist in 1997',
							text: '**Max-prefix limits** — automatically drop a [[bgp|BGP]] session that announces an unreasonable number of routes. **Prefix filters** — only accept announcements for prefixes a customer is documented to own. **[[frontier:rpki-rov-50-percent|RPKI/ROV]]** — cryptographically validate the origin {{autonomous-system|AS}} before accepting a route. None of these were standard practice in 1997. All three exist now in large part because of incidents like {{autonomous-system|AS}} 7007.'
						}
					]
				},
				{ kind: 'outage', id: 'as-7007-1997' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why It Took Twenty-Five Years to Fix',
							text: `{{rpki|RPKI}} was specified in 2008. It took until 2026 to cross **50% of advertised [[ip|IP]] space covered**. The reason is the structure of [[bgp|BGP]] deployment.

For {{rpki|RPKI}} to fix the {{autonomous-system|AS}} 7007 problem, two parties have to participate: the prefix-holder must publish a Route Origin Authorisation (ROA), and the receiving router must enforce {{rov|Route Origin Validation}} ({{rov|ROV}}). For the first decade after specification, only a handful of large networks ran {{rov|ROV}}. Smaller operators pointed out — correctly — that running {{rov|ROV}} with low ROA coverage means dropping legitimate routes from peers who haven\'t signed yet. So nobody enforced. Without enforcement, signing your prefixes had no upside. Classic chicken-and-egg.

What broke the deadlock was a series of high-profile incidents (2018 Amazon Route 53 / MyEtherWallet hijack, 2018 Iranian Telegram hijack, 2019 SafeHost / China Telecom leak) that made unsigned networks look negligent. By 2022, the major hyperscalers and tier-1s were enforcing. By 2026, [[frontier:rpki-rov-50-percent|over 50%]] of advertised [[ip|IP]] space was covered. {{aspa|ASPA}} — the {{autonomous-system|AS}}-path validation extension — is the next chapter.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Internet_map_1024.jpg/500px-Internet_map_1024.jpg',
							alt: 'A 2005 visualisation of the global internet routing topology — each line a BGP peering relationship.',
							caption:
								'The global [[bgp|BGP]] routing topology, visualised. Every line is a {{peering|peering}} relationship; every node an {{autonomous-system|AS}}. **{{autonomous-system|AS}} 7007** in Florida did not hijack anything on purpose — it simply announced *every prefix in the global table* as a /24 originating from itself, and "most-specific wins" did the rest. For a few hours in April 1997 every line in a picture like this pointed at a single underpowered router in Florida.',
							credit: 'Image: The Opte Project / Wikimedia Commons, CC BY 2.5'
						}
					]
				},
				{ kind: 'frontier', id: 'rpki-rov-50-percent' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'mitnick-1994',
			title: 'Mitnick vs Shimomura 1994',
			synopsis: '[[tcp|TCP]] sequence-prediction attack on Christmas Day.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When TCP Trusted Its Own Sequence Numbers',
							text: `On Christmas Day 1994, Kevin Mitnick attacked Tsutomu Shimomura's home computer at the San Diego Supercomputer Center using a **[[tcp|TCP]] sequence-prediction attack**. Early [[tcp|TCP]] implementations chose initial sequence numbers (ISNs) from a counter that incremented by 128,000 every second, plus 64,000 every connection. That formula, published in [[rfc:9293|RFC 793]] (1981), was deliberately predictable — Postel and Cerf wanted ISNs to be reproducible during debugging.

The flaw: if you knew the rough current value, you could **forge** an entire connection that the victim would believe was legitimate. The attack went:

1. Send a {{syn-flood|SYN flood}} to a trusted internal host, exhausting its ability to respond.
2. Send a SYN to the target, source-spoofed to come from the trusted host.
3. The target sends SYN-{{ack|ACK}} to the (silent) trusted host, choosing a fresh ISN.
4. Predict that ISN by knowing the formula plus a sample.
5. Send a forged {{ack|ACK}} back to the target with the predicted {{sequence-number|sequence number}}.
6. The target sees a valid {{ack|ACK}} and the connection is "established." You now have a [[tcp|TCP]] connection appearing to come from the trusted host.

Mitnick used this to land a forged connection from a host listed in Shimomura's \`.rhosts\` file, which gave him root access without authentication.`
						},
						{
							type: 'callout',
							title: 'rsh / rlogin trust was the multiplier',
							text: '[[tcp|TCP]] sequence prediction by itself is not catastrophic — it just lets you forge a connection. The reason this attack worked is that Berkeley Unix\'s \`.rhosts\` mechanism trusted **the source {{ip-address|IP address}}** of an incoming connection as authentication. Forge the source [[ip|IP]], get the trust. [[ssh|SSH]] (which Tatu Ylönen wrote in 1995, partly in response to incidents like this one) replaced \`.rhosts\` with cryptographic identity — even a perfectly forged [[tcp|TCP]] connection cannot impersonate someone without their {{private-key|private key}}.'
						},
						{
							type: 'narrative',
							title: 'The Manhunt',
							text: `Shimomura, a security researcher, took the intrusion personally. He spent two months tracing the attack back to Mitnick — using passive monitoring of compromised hosts, traffic analysis to triangulate Mitnick's dial-up POPs, and ultimately direction-finding equipment to locate his physical address in Raleigh, North Carolina. Mitnick was arrested on 15 February 1995. The story became Shimomura's 1996 book *Takedown* and a Hollywood movie.

The technical legacy outlived the celebrity. **[[rfc:1948|RFC 1948]]** (Steve Bellovin, 1996) replaced the predictable ISN formula with a hashed function of the connection four-tuple plus a per-boot secret. **RFC 6528** (Larry Joncheray + Fernando Gont, 2012) tightened it further. Modern stacks use cryptographically-random ISNs per [[rfc:9293|RFC 9293]] §3.4.1; predicting them is computationally infeasible.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kevin_Mitnick.jpg/500px-Kevin_Mitnick.jpg',
							alt: 'Kevin Mitnick, 1990s-era hacker convicted in 1995, later a security consultant.',
							caption:
								'Kevin Mitnick — the attacker. Arrested 15 February 1995 in Raleigh, North Carolina after a two-month manhunt by Tsutomu Shimomura. By the late 2000s Mitnick had become a security consultant and author; he died on 16 July 2023. The technical legacy of his Christmas 1994 [[tcp|TCP]] sequence-prediction attack lives on in **[[rfc:1948|RFC 1948]]** and the cryptographically-random ISNs every modern stack uses.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA 3.0'
						}
					]
				},
				{ kind: 'protocol', id: 'tcp' },
				{ kind: 'protocol', id: 'ssh' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why This Incident Changed Authentication',
							text: `Before 1995, "this connection comes from a trusted [[ip|IP]]" was treated as sufficient authentication on most internal networks. After 1995, the entire industry moved toward **cryptographic** authentication that didn't depend on transport-layer trust.

[[ssh|SSH]] replaced rsh/rlogin/telnet within five years. [[tls|TLS]] added per-connection cryptographic verification on top of [[tcp|TCP]]. Modern zero-trust architectures take this further: **every connection** is treated as untrusted until cryptographically authenticated, regardless of source [[ip|IP]]. The Mitnick attack is the canonical example of why "the source [[ip|IP]] says it's a trusted host" is never enough.`
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'pakistan-youtube-2008',
			title: 'Pakistan/YouTube 2008',
			synopsis: 'A domestic block leaks globally via [[bgp|BGP]].',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[bgp|BGP]] has no built-in concept of "this announcement should stay inside my country." Pakistan\'s domestic block became the world\'s outage in three minutes flat.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Domestic Block, A Global Outage',
							text: `On 24 February 2008, the Pakistan Telecommunications Authority ordered domestic ISPs to block YouTube — the immediate cause was a video the government considered blasphemous. Pakistan Telecom ({{autonomous-system|AS}} 17557) implemented the block using the standard "Remotely Triggered Blackhole" (RTBH) technique: inject a more-specific [[bgp|BGP]] route for YouTube\'s prefix into their internal network, pointing it at a null interface. Any traffic destined for YouTube would be silently dropped at the Pakistan Telecom edge.

This is fine — **as long as you don't propagate the route outside your network**.`
						},
						{
							type: 'narrative',
							title: 'The Leak',
							text: `Pakistan Telecom's upstream provider was PCCW Global ({{autonomous-system|AS}} 3491), a major Hong Kong-based {{transit|transit}}. PCCW Global was not filtering incoming [[bgp|BGP]] from Pakistan Telecom — they accepted the bogus, more-specific YouTube route and propagated it onward to every PCCW {{peer|peer}}. From there it went global.

Within three minutes of the original injection, the entire internet believed the best path to YouTube\'s prefix was through Pakistan Telecom. Every YouTube request anywhere on the planet was being null-routed by a router in Karachi. YouTube\'s authoritative [[dns|DNS]] continued to resolve correctly; the actual [[tcp|TCP]] connections just disappeared into a black hole.

YouTube was offline globally for two hours. PCCW Global eventually identified the bogus route and applied filtering, after which [[bgp|BGP]] convergence took another 30 minutes to restore reachability.`
						},
						{
							type: 'callout',
							title: 'The fix that took fifteen years',
							text: 'After Pakistan/YouTube, **prefix filtering between providers and customers** went from "best practice" to "industry default" within a year. The deeper structural fix — **[[frontier:rpki-rov-50-percent|RPKI / Route Origin Validation]]** — let any router cryptographically verify that an {{autonomous-system|AS}} was authorised to originate a prefix, regardless of how the announcement reached them. {{rpki|RPKI}} was specified in 2008 (the same year as Pakistan/YouTube). It took until 2026 to cross 50% deployment.'
						}
					]
				},
				{ kind: 'outage', id: 'pakistan-youtube-2008' },
				{ kind: 'frontier', id: 'rpki-rov-50-percent' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why "Most Specific Wins" Is Both Genius and Curse',
							text: `[[bgp|BGP]]\'s "most specific prefix wins" rule has a beautiful property: it lets traffic engineering work without coordination. If your origin announces a /16 and your {{cdn|CDN}} announces a /20 inside that block, every router automatically prefers the {{cdn|CDN}} — no negotiation needed.

The same rule is what made Pakistan/YouTube possible. A /24 inside YouTube\'s /22 wins, regardless of who is announcing it. The combination of "most specific wins" + "no origin validation" + "global propagation" turned every upstream provider into a single point of failure for every downstream customer\'s prefix integrity.

This is the structural reason [[bgp|BGP]] needs cryptography to fix it, not just better operational hygiene. Hygiene catches typos; cryptography catches deliberate hijacks. {{rpki|RPKI}} provides the cryptography. {{aspa|ASPA}} (the {{autonomous-system|AS}}-path validation extension, in {{ietf|IETF}} draft) closes the route-leak hole that origin validation alone cannot fix — where {{autonomous-system|AS}} X **does** legitimately originate the prefix, but its upstream then leaks the route through an unintended path.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Arpanet_logical_map%2C_march_1977.png/500px-Arpanet_logical_map%2C_march_1977.png',
							alt: 'ARPANET logical map, March 1977 — sites in the US plus a node at London.',
							caption:
								'The {{arpanet|ARPANET}} in March 1977 — a network small enough that one Pakistan-Telecom-class misconfiguration would have been caught manually within minutes. By 2008 the global [[bgp|BGP]] {{routing-table|routing table}} had grown to ~250,000 prefixes, and Pakistan Telecom\'s null-route on a single /24 of YouTube space silently became the world\'s outage in **three minutes flat**. Scale changes what counts as a recoverable error.',
							credit: 'Image: DARPA / public domain, via Wikimedia Commons'
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'china-telecom-2010',
			title: 'China Telecom 2010',
			synopsis: '15% of the internet routed through a single {{autonomous-system|AS}} for 18 minutes.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Brief, Massive, Unexplained',
							text: `On 8 April 2010 at 15:54 UTC, China Telecom ({{autonomous-system|AS}} 23724) announced [[bgp|BGP]] routes for approximately **37,000 prefixes** — about **15% of the global {{routing-table|routing table}}** — claiming to be the best path. For 18 minutes, traffic destined for U.S. military networks (.mil), several .gov domains, and major commercial sites (Dell, Yahoo, IBM, Microsoft) was traversing China Telecom's network on its way to the legitimate destination.

The leak was caught by automated monitoring (BGPmon, RIPE RIS, RouteViews) within minutes. China Telecom\'s upstreams installed filters around 16:12 UTC, and [[bgp|BGP]] convergence restored normal routing by 16:18.`
						},
						{
							type: 'narrative',
							title: 'Accident or Espionage?',
							text: `Whether the incident was deliberate or accidental remains disputed.

The U.S.-China Economic and Security Review Commission's 2010 annual report flagged the incident as a potential intelligence concern, noting that 18 minutes of unauthorised observation of military traffic could yield significant signals-intelligence value, even if the traffic was encrypted (cryptographic metadata, traffic-volume patterns, source/destination IPs).

China Telecom's official response described it as a routine misconfiguration during a software upgrade. Several technical analyses (notably from Renesys / Dyn) concluded the announcement pattern was **consistent with both** an accidental redistribution of internal routes to external peers (the {{autonomous-system|AS}} 7007 mechanism) **and** a deliberate route hijack disguised as a misconfiguration.

The technical fact is unambiguous: 15% of the global internet's traffic had a brief, unauthorised observer in the path. Whether or not the observer was deliberate, the architectural lesson is the same — **[[bgp|BGP]] gives any {{autonomous-system|AS}} the power to do this, accidentally or on purpose, in seconds**.`
						},
						{
							type: 'callout',
							title: 'The "everything is encrypted" reply does not hold',
							text: 'A natural reaction to {{bgp-hijack|BGP hijack}} incidents is "but the data is encrypted, so what does it matter if a third party sees it?" Two reasons it matters. First, **cryptographic metadata** ({{tls-handshake|TLS handshake}} fingerprints, {{certificate-chain|certificate chains}}, {{sni|SNI}} hostnames) reveals more than people realise. Second, **traffic analysis** — even on encrypted flows, packet sizes and timing leak intent. A connection burst between a Pentagon [[ip|IP]] and a defence contractor [[ip|IP]], observed by a foreign {{autonomous-system|AS}}, is intelligence regardless of cipher. This is part of why {{ech|ECH (Encrypted Client Hello)}} is a current [[tls|TLS]] frontier.'
						}
					]
				},
				{ kind: 'frontier', id: 'rpki-rov-50-percent' },
				{ kind: 'frontier', id: 'ech-rfc-9849' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why This Incident Funded RPKI Deployment',
							text: `China Telecom 2010 was a turning point for U.S. government interest in **secure routing** infrastructure. The Department of Homeland Security funded several {{rpki|RPKI}} deployment efforts in the years following. The .gov and .mil top-level domains became some of the earliest large-scale ROA signers — a politically straightforward action that materially improved the security of U.S. federal traffic.

The deeper challenge was always private-sector adoption. Government agencies could mandate {{rpki|RPKI}} for their own networks, but the bulk of internet traffic flows through commercial ISPs and content networks. The shift came in 2018-2022 when major hyperscalers (Cloudflare, Google, Amazon, Meta) made {{rpki|RPKI}} a publicly-stated requirement for their {{peering|peering}} arrangements. Networks that wanted to {{peer|peer}} at scale had to sign their prefixes; those that wouldn't became increasingly isolated. By 2026, [[frontier:rpki-rov-50-percent|over 50%]] of advertised [[ip|IP]] space is covered.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Arpanet_1974.svg/500px-Arpanet_1974.svg.png',
							alt: 'ARPANET in 1974 — early packet-switched network topology.',
							caption:
								'The {{arpanet|ARPANET}} in 1974, when "the {{routing-table|routing table}}" was a handful of dozens of nodes you could fit on one printed page. By April 2010, China Telecom\'s 18-minute leak of **37,000 prefixes** — ~15% of the global {{routing-table|routing table}} — meant US military traffic, .gov traffic, and traffic to Yahoo / Microsoft / IBM was transiently observable through a single {{autonomous-system|AS}} in Beijing. The architecture of [[bgp|BGP]] makes this possible, accidentally or on purpose, in *seconds*.',
							credit: 'Image: Wikimedia Commons / public domain'
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'sack-panic-2019',
			title: 'SACK Panic 2019',
			synopsis: 'A single [[tcp|TCP]] packet panics the Linux kernel.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'A protocol option in widespread use for 23 years had a remote-trigger denial-of-service bug nobody noticed. The lesson: code stability is not code correctness.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Integer Overflow in the Most Critical Data Path',
							text: `In June 2019, Netflix security researcher Jonathan Looney found that a maliciously crafted [[tcp|TCP]] packet with carefully chosen Selective Acknowledgement ({{sack|SACK}}) options could trigger an integer overflow in the Linux kernel's [[tcp|TCP]] stack, leading to a kernel panic.

The bug, **CVE-2019-11477** ("{{sack|SACK}} Panic"), affected every Linux kernel from 2.6.29 (2009) through 5.1 (2019) — **ten years of unpatched code in the heart of every Linux server on the internet**. A single [[tcp|TCP]] packet, no authentication required, would crash any vulnerable host. Service providers, cloud hyperscalers, container hosts, embedded systems — all simultaneously vulnerable.

The disclosure was coordinated across Red Hat, Canonical, SUSE, Debian, AWS, Google, and the Linux kernel team. Patches shipped within hours of public disclosure on 17 June 2019, but the full deployment took weeks across the global Linux fleet.`
						},
						{
							type: 'narrative',
							title: 'How a 23-Year-Old Option Survived Undetected',
							text: `The {{sack|SACK}} option itself ([[rfc:2018|RFC 2018]], October 1996) had been working correctly for **23 years**. The bug was not in {{sack|SACK}}\'s logic; it was in a specific edge-case interaction with the **frags_per_skb** limit, increased in 2009 to support larger send buffers.

When {{sack|SACK}} indicated a large number of non-contiguous holes in the receive window, the kernel\'s logic for splitting the retransmit buffer into smaller skbs (socket buffers) miscalculated a 16-bit length field. The miscalculation overflowed, the kernel asserted, and the BUG_ON() panicked the system.

The bug had been present in production code since 2009. It survived because:
1. The trigger required a specific combination of [[tcp|TCP]] options that no real client sent in normal traffic.
2. The Linux test suite did not fuzz {{sack|SACK}} option boundaries.
3. Most performance benchmarks did not exercise the path.
4. {{sack|SACK}} was considered "battle-tested" — engineers focused new attention on newer code paths instead.

Looney found it by writing a fuzzer that combined {{sack|SACK}} with [[tcp|TCP]]\'s other options in unusual sequences. The same fuzzer found three additional related bugs (CVE-2019-11478, 11479, 11479) that were patched in the same coordinated disclosure.`
						},
						{
							type: 'callout',
							title: 'Code stability ≠ code correctness',
							text: '**Code that has not changed in years is code that has not been re-tested in years.** The networking community before 2019 had implicitly trusted "battle-tested" code more than freshly-shipped code. {{sack|SACK}} Panic reversed that intuition. Modern Linux kernel development now includes continuous fuzzing of the network stack (syzkaller is the Google-led effort). Most CVE-quality bugs found since 2019 in the kernel\'s [[tcp|TCP]] path have come from this fuzzing infrastructure, not from human review.'
						}
					]
				},
				{ kind: 'outage', id: 'sack-panic-2019' },
				{ kind: 'protocol', id: 'tcp' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'What Changed After SACK Panic',
							text: `Three operational changes are now standard in production Linux fleets.

**Continuous fuzzing of network code paths.** syzkaller runs against every Linux kernel commit, generating millions of random syscall + packet sequences per day. Most CVEs in the kernel\'s [[tcp|TCP]]/[[ip|IP]] stack since 2019 have been found this way, not by humans.

**Faster CVE response in distributed Linux environments.** Pre-2019, large fleets often took weeks to roll out a kernel patch — full reboot rotations, slow validation cycles. {{sack|SACK}} Panic forced the industry to invest in **live patching** (Red Hat\'s kpatch, Canonical\'s Livepatch, SUSE\'s kGraft) that can apply security fixes to a running kernel without reboot. By 2026, hyperscalers routinely live-patch kernel CVEs across millions of hosts within hours.

**Per-feature kill switches.** The {{sack|SACK}} Panic patch is gated behind a sysctl (\`net.ipv4.tcp_sack\`) so operators can disable {{sack|SACK}} entirely if a future bug surfaces — without waiting for a kernel update. Modern kernel networking is full of such switches: an emergency lever for every major optional feature.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/250px-Tux.svg.png',
							alt: 'Tux — the Linux mascot, a chubby cartoon penguin.',
							caption:
								'**Tux**, the Linux mascot, drawn by Larry Ewing in 1996. Behind that cheerful penguin sits a [[tcp|TCP]] stack on every internet-facing Linux server on Earth — and from 2009 to 2019 every one of them was a single crafted [[tcp|TCP]] packet away from \`kernel panic\`. The fix shipped 17 June 2019; the lesson — **code stability is not code correctness** — has reshaped Linux kernel networking testing since.',
							credit: 'Image: Larry Ewing / lewing@isc.tamu.edu, public domain, via Wikimedia Commons'
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'centurylink-2020',
			title: 'CenturyLink Flowspec 2020',
			synopsis: 'A [[bgp|BGP]] rule kills the [[bgp|BGP]] session that delivered it.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'A control-plane rule that disables its own delivery mechanism is the worst kind of bug — there is no out-of-band channel to issue the fix.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Rule That Killed Its Own Delivery Mechanism',
							text: `On 30 August 2020, CenturyLink ({{autonomous-system|AS}} 209 — one of the largest tier-1 backbones in the U.S., now branded Lumen) propagated a [[bgp|BGP]] **Flowspec** rule across its global network.

Flowspec ([[rfc:5575|RFC 5575]], RFC 8955) lets operators install {{firewall|firewall}}-like rules through [[bgp|BGP]] — useful for distributing DDoS mitigation rules across thousands of routers in seconds. The rule in question was supposed to filter traffic for one customer\'s DDoS protection.

The catastrophic mistake: the rule\'s match criteria included [[bgp|BGP]] control traffic itself. Routers received the rule, applied it, and immediately began dropping the [[bgp|BGP]] keepalive packets carrying the next rule. [[bgp|BGP]] sessions timed out across the network. As sessions dropped, [[bgp|BGP]] withdrew every prefix learned through them. The network entered a cascading-failure mode.`
						},
						{
							type: 'narrative',
							title: 'Five Hours of Manual Recovery',
							text: `Once the bad rule had propagated, there was no automated way to retract it — the very mechanism for retracting Flowspec rules ([[bgp|BGP]]) was the mechanism the rule had broken. Every router needed to be touched manually, either via out-of-band management or by physically connecting a console.

Recovery took **five hours**. During that window, approximately **3.5% of all global internet traffic dropped** — a massive number for a single backbone. Cloudflare, Amazon, Microsoft, and most of the U.S. tier-1 customers reported downtime. Cloudflare\'s detailed write-up the next day became required reading in [[bgp|BGP]] operations.`
						},
						{
							type: 'callout',
							title: 'Out-of-band management is not optional',
							text: 'CenturyLink\'s recovery was only possible because every core router had **out-of-band management** — a separate physical interface for administration that did not depend on the data plane. Without that, the recovery would have required physical site visits to every PoP. Modern operations treats OOB as a hard requirement, not a "nice to have." The rule of thumb: never assume the production network will be available to fix the production network.'
						}
					]
				},
				{ kind: 'outage', id: 'centurylink-flowspec-2020' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Architectural Concern That Remains',
							text: `CenturyLink rolled out automated controls preventing self-blocking rules. The broader industry adopted similar guards. But the underlying architectural concern — **the same protocol distributes both data and the rules governing data** — has no clean fix.

[[bgp|BGP]] is the universal control plane for internet routing. Flowspec rides on [[bgp|BGP]] because that\'s what every router already speaks. The alternative — a separate out-of-band protocol for distributing filter rules — would require new infrastructure on every router on the internet. The economic friction is too high; nobody is going to deploy it.

So we live with the architectural fragility and add operational guards. Every modern router\'s Flowspec implementation now refuses to install rules that would drop [[bgp|BGP]]\'s own ports (179) or the matching {{peer|peer}} addresses. Each new generation of routers adds more such guards. The lesson is incremental rather than fundamental: when you build a control plane on top of itself, every change to the control plane needs to be reviewed for self-consistency — manually, before it ships.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/ARPANET_first_router.jpg/500px-ARPANET_first_router.jpg',
							alt: 'A BBN Interface Message Processor — the original ARPANET router, ancestor of every BGP-speaking device on the modern internet.',
							caption:
								'A {{bbn|BBN}} {{imp|Interface Message Processor}} — the original {{arpanet|ARPANET}} router. Every modern [[bgp|BGP]]-speaking router carries the same architectural DNA: a control plane that builds the {{routing-table|forwarding table}} from messages it receives over the *same wires* it eventually forwards user data over. CenturyLink\'s 2020 Flowspec self-block is the canonical example of how that elegant unification can blow up when a single rule disables its own delivery mechanism.',
							credit: 'Photo: Steve Jurvetson, CC BY 2.0, via Wikimedia Commons'
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'facebook-2021',
			title: 'Facebook 2021 — The Cascade',
			synopsis: '[[bgp|BGP]], [[dns|DNS]], badge readers — six hours of compounding failure.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Facebook went away. Their badge readers went away. They literally could not get into the building to fix the badge readers.',
					attribution: 'Industry observer, October 2021'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Routine Maintenance Command, Then Six Hours',
							text: `On 4 October 2021 at 15:39 UTC, a Facebook engineer ran a routine maintenance command on the backbone connecting Facebook's data centres. The command was supposed to assess capacity by temporarily withdrawing a single backbone link\'s [[bgp|BGP]] advertisements, then restoring them.

The command had a bug. It withdrew **all** of Facebook\'s [[bgp|BGP]] route advertisements globally — not just for the one link it was supposed to assess. Within minutes, every facebook.com, instagram.com, and whatsapp.com lookup returned NXDOMAIN. **3.5 billion users disconnected.**

That was the easy part of the cascade.`
						},
						{
							type: 'narrative',
							title: 'The DNS Black Hole',
							text: `Facebook\'s authoritative [[dns|DNS]] servers were inside the data centres that just lost their [[bgp|BGP]] advertisements. Resolvers around the world tried to query them — and got nothing back, because the [[ip|IP]] addresses no longer routed anywhere.

After a brief period of cached responses, every cached record expired (typical TTLs are minutes, not hours). [[dns|DNS]] resolution for Facebook\'s domains failed worldwide. **Without [[dns|DNS]]**, Facebook\'s internal systems — Workplace, Calendar, internal monitoring, [[oauth2|OAuth]], the company directory — all failed. Engineers could not reach their own infrastructure remotely. They could not even verify that the outage was [[bgp|BGP]]-related, because their monitoring tools couldn\'t resolve internal hostnames.`
						},
						{
							type: 'narrative',
							title: 'The Badge Readers',
							text: `The next layer of cascade was the part that made the outage famous in the broader world. Facebook\'s **physical security infrastructure** — door badge readers at the data centres — depended on the same authentication system that had just disappeared.

Engineers headed to the data centres physically. They could not enter the buildings. The badge system was offline. They had to be physically escorted in by on-site security staff who could manually override the locks. Then, once inside, they had to find the specific machines that needed manual intervention — and the data-centre wayfinding tools were also offline.

The first [[bgp|BGP]] fix went in around 21:00 UTC. Recovery took until 22:30 — six hours of compounding disaster traceable to a single bad command.`
						},
						{
							type: 'callout',
							title: 'Independent on the diagram, same fate in operation',
							text: '**Dependencies that look independent on the architecture diagram are often the same dependency in operation.** [[bgp|BGP]], [[dns|DNS]], badge readers, build systems, monitoring — Facebook\'s diagram showed them as separate concerns. In practice, all five depended on the same underlying network, and when the network disappeared, all five disappeared together. The post-mortem documented every cascade step, and the industry collectively learned to ask "what depends on the network?" of every operationally-critical system.'
						}
					]
				},
				{ kind: 'outage', id: 'facebook-2021' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'What Changed After Facebook 2021',
							text: `Three structural changes rolled through the industry in the eighteen months after the outage.

**Out-of-band recovery for authoritative [[dns|DNS]].** Facebook (and others) moved to a model where authoritative [[dns|DNS]] for their critical domains is reachable through multiple independent network paths — including paths that do not depend on the company\'s own backbone. Cloudflare and AWS Route 53 both saw enterprise growth as customers moved [[dns|DNS]] to "if our network is down, our [[dns|DNS]] is still up."

**Physical access systems on independent networks.** Badge readers, door locks, environmental controls, fire suppression — anything that needs to work during a network outage — now runs on dedicated, isolated networks at most hyperscalers. The lesson: physical security cannot depend on the network whose data centre it secures.

**Maintenance command audit.** The [[bgp|BGP]] withdrawal command was supposed to be limited in scope but the safety check did not catch the broader effect. Facebook (and others) added a **"blast radius preview"** layer to all maintenance tooling — show me, in plain English, what this command will affect across the global network, and require explicit confirmation if the answer is more than a small number of devices.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Facebook_Headquarters_Menlo_Park.jpg/500px-Facebook_Headquarters_Menlo_Park.jpg',
							alt: 'Facebook (Meta) Headquarters campus in Menlo Park, California.',
							caption:
								'**Meta\'s Menlo Park campus** — the building whose [[bgp|BGP]] advertisements vanished from the global {{routing-table|routing table}} for nearly six hours on **4 October 2021**. Engineers had to physically reach the data centres to fix the problem; once there, they discovered the badge readers were offline too, because the access-control system depended on the same Facebook [[dns|DNS]] that no longer resolved. The outage is the canonical reference for *"what depends on the network you are about to break?"*',
							credit: 'Photo: LPS.1, CC0, via Wikimedia Commons'
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'rogers-2022',
			title: 'Rogers 2022 — A Country Disconnected',
			synopsis: 'Fifteen hours, half of Canada offline — one [[bgp|BGP]]/OSPF redistribution mistake.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'When a single private company is the de facto national emergency-services backbone, regulatory infrastructure has to treat it as critical national infrastructure.',
					attribution: 'CRTC investigation, August 2022'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When the ISP Is the Country',
							text: `On 8 July 2022 at 04:45 EDT, Rogers Communications — the largest ISP and mobile carrier in Canada, serving over **11 million subscribers** — went down nationally. For 15 hours, Rogers customers had no internet, no mobile signal, no landline (Rogers also runs Canada\'s largest {{voip|VoIP}}-based home phone service through its Hi-Speed Internet bundles), no Interac debit transactions (Interac\'s national network runs over Rogers connectivity), and **no 911 service** in many regions.

The trigger was a misconfiguration during a planned maintenance update to the Rogers [[ip|IP]]/MPLS core. A bad route policy caused control-plane CPU exhaustion across Rogers\' core routers — they spent so much CPU recomputing routes in response to the bad policy that they had no cycles left to actually forward traffic.`
						},
						{
							type: 'narrative',
							title: 'A Country-Wide Cascade',
							text: `The downstream effects revealed how deeply a single carrier\'s connectivity had been woven into Canadian infrastructure.

**Banking and payments**: Interac\'s e-Transfer service stopped working nationwide. Most debit-card transactions failed. Some ATMs went offline. Several major retailers had to close because they could not accept payment.

**Healthcare**: Several hospital systems lost connectivity to Rogers-hosted services. Telehealth platforms that depended on Rogers {{voip|VoIP}} failed.

**Government services**: Service Canada\'s online portals were unreachable from Rogers networks. The Canada Border Services Agency reported delays at land crossings.

**Emergency services**: 911 calls failed in many areas. Some provinces issued public advisories telling residents to use neighbours\' phones, alternate networks, or visit fire stations directly.

Recovery required Rogers engineers to log in to individual core routers (over out-of-band management, which thankfully was separate) and manually roll back the change. By 21:00 EDT, partial service was restored. Full service took until 14 July — six days of intermittent issues for some customers.`
						},
						{
							type: 'callout',
							title: 'The deeper structural lesson',
							text: 'When a single private company\'s outage takes down national emergency services, the company is no longer just a private business — it is **critical national infrastructure**. The CRTC\'s post-incident investigation forced Rogers to enter mandatory **reciprocal-roaming agreements** with Bell and Telus, so that future single-carrier outages would not strand emergency calls. Other countries (Australia, the UK, Germany) used the Rogers incident as a reference point for similar regulatory action.'
						}
					]
				},
				{ kind: 'outage', id: 'rogers-2022' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Regulatory Aftermath',
							text: `The CRTC (Canadian Radio-television and Telecommunications Commission) issued a formal decision on 22 March 2023 requiring all major Canadian carriers to:

1. Implement **reciprocal roaming for emergency calls** within six months — so that a phone unable to reach its own carrier can still complete 911 calls through any competing carrier\'s tower.
2. Submit **detailed network architecture and dependency reports** annually, including every system that depends on the carrier\'s network for life-safety functions.
3. Maintain **out-of-band management** independent of the production network for all core routing infrastructure.
4. Conduct **annual outage simulations** with the federal government, including coordinated emergency-services failover.

These requirements are unusual in their specificity for a private telecommunications regulator. They reflect the structural change the Rogers outage forced: the recognition that some private companies have grown into roles that historically belonged to public utilities, with the same operational obligations.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Rogers_AT%26T_Centre.JPG/500px-Rogers_AT%26T_Centre.JPG',
							alt: 'The Rogers Communications Centre building in Toronto.',
							caption:
								'The **Rogers Communications Centre** in Toronto — the headquarters of the ISP whose 15-hour 8 July 2022 outage took **half of Canada** offline: no mobile, no Interac debit, no 911 in many regions, no landline for the millions of customers on Rogers {{voip|VoIP}} bundles. The CRTC ruling that followed is one of the strongest examples of a national regulator treating a private telecom as critical infrastructure with utility-grade operational obligations.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA 3.0'
						}
					]
				}
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'att-mobility-2024',
			title: 'AT&T Mobility 2024',
			synopsis: '[[cellular|125 million devices]], 25,000 failed 911 calls.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'A planned change, deployed simultaneously across the production fleet, with insufficient progressive-rollout controls. The same shape as Rogers 2022 — and the same lesson, learned again.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Twelve Hours, A Continent',
							text: `On 22 February 2024 at 03:30 ET, AT&T Mobility customers across the United States began losing service. Calls failed, SMS failed, mobile data failed. Within an hour, the outage was nationwide. The cause: a routine network upgrade incorrectly configured — pushed simultaneously across the production wireless core.

Approximately **125 million devices** became unreachable for **up to twelve hours**. Some regions came back faster (the West Coast was largely restored by 09:00 ET); others lingered into the early afternoon. Even after primary service returned, voice calls had elevated failure rates for another 24 hours as the network worked through queued traffic.`
						},
						{
							type: 'narrative',
							title: 'The 25,000 Failed 911 Calls',
							text: `The most consequential failure was 911. **An estimated 25,000 emergency calls were not connected during the outage** — a number AT&T disclosed in its FCC report.

Several states issued public advisories during the outage telling AT&T customers to:
- Use [[wifi|Wi-Fi]] calling (which routes through the home internet rather than the cellular network)
- Switch to a different carrier\'s SIM if available
- Use landlines if accessible
- Walk or drive to the nearest fire station, police station, or hospital

The FCC opened a formal investigation under the 2018 911 Reliability Rules. AT&T offered all affected customers a $5 service credit (about $625 million in aggregate) and reached a $13 million settlement with the FCC in November 2024 — the largest single-incident penalty for a U.S. wireless outage.`
						},
						{
							type: 'callout',
							title: 'Same shape as Rogers 2022',
							text: 'The shape of the AT&T failure mirrors [[outage:rogers-2022|Rogers 2022]] uncomfortably: a planned change, deployed simultaneously across the production fleet, with insufficient progressive-rollout controls. The lesson the industry should have internalised after Rogers — **never push a config change to the entire fleet at once** — had not propagated. AT&T\'s post-incident report committed to canary deployment for all core network changes within the year.'
						}
					]
				},
				{ kind: 'outage', id: 'att-mobility-2024' },
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Canary-Deployment Maturity Gap',
							text: `The web/cloud industry adopted canary deployments more than a decade ago — every meaningful change rolls out to 0.1%, then 1%, then 10%, then 100% of traffic, with automatic rollback on failure indicators. The telecom industry has lagged.

Reasons for the lag are structural. Wireless networks have **strong global consistency requirements** that don\'t align cleanly with canary deployment — you can\'t have one cell tower running a different version of the radio access network protocol than the towers next to it without breaking handoff. Some configuration changes are necessarily global. Some changes are necessarily simultaneous (e.g., security updates that close a known vulnerability).

Post-AT&T-2024, the industry consensus is that **most changes can be canaried** — even in wireless cores — and the small number that genuinely cannot should receive correspondingly more pre-deployment review. The architectural debate, ongoing, is whether the same caution should apply to security patches that need to ship fast: a mass-deployment outage and an unpatched-CVE outage are both bad in different ways, and the correct trade-off is not obvious.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/AT%26T_logo_2016.svg/500px-AT%26T_logo_2016.svg.png',
							alt: 'The AT&T globe logo.',
							caption:
								'**AT&T** — the carrier behind 22 February 2024 outage: a single misconfigured network upgrade pushed simultaneously across the production wireless core left **125 million devices** without service and **25,000 emergency 911 calls** unconnected. AT&T paid $625M in customer credits and $13M in FCC settlement — the largest single-incident penalty for a US wireless outage. The structural lesson — *never push a config change to the entire fleet at once* — was the same one [[outage:rogers-2022|Rogers 2022]] had taught two years earlier.',
							credit: 'Logo: AT&T Inc. / Wikimedia Commons (trademark)'
						}
					]
				}
			]
		}
	]
};
