/**
 * Part X — Famous Outages.
 *
 * Ten incidents told as stories — what broke, what cascaded, and
 * what the industry learned. Each chapter is a story-with-narrative
 * that links to the full Outage entry for the complete cast and
 * timeline.
 */

import type { BookPart } from '../types';

export const famousOutages: BookPart = {
	id: 'famous-outages',
	title: 'Famous Outages',
	label: 'X',
	description:
		'Ten incidents told as stories — what broke, what cascaded, and what the industry learned.',
	chapters: [
		{
			id: 'arpanet-1980',
			title: 'ARPANET 1980 — The First Major Crash',
			synopsis: 'A garbled status message brings the network down.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Garbled Bits, Network-Wide Cascade',
							text: `On 27 October 1980, ARPANET — the entire research internet of the time — went down for a full day. The cause was three bits in a status update message between routers (then called IMPs).

The IMPs ran a distance-vector routing protocol that periodically exchanged "I am alive, here are my neighbours" messages. A faulty IMP at Harvard sent a message that was simultaneously claiming three different versions of itself, and the IMPs receiving it concluded that **all three versions were valid and the most recent one should be picked**. They each picked a different one, then propagated their choice. The network entered a state where every IMP believed a different version was canonical.

The fix was manual: take the network down, install a new version of the IMP software that ignored impossible message states, bring everything back up. Six hours of debugging, three hours of rollout.

What this incident taught: protocols must defend against malformed input even from "trusted" peers, and especially in the periodic background traffic that nobody watches in normal operation. It is also why **post-mortem culture** is now standard at every serious operator — [[rfc:789|RFC 789]] (Eric Rosen, BBN) is one of the earliest detailed engineering post-mortems published openly.`
						}
					]
				}
			]
		},
		{
			id: 'as-7007-1997',
			title: 'AS 7007 1997',
			synopsis: 'A Florida ISP de-aggregates the entire BGP table.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Most-Specific Wins, By Definition',
							text: `On 25 April 1997, an MAI Network Services router in Florida (AS 7007) received the global [[bgp|BGP]] routing table from its upstream and, due to a misconfiguration in a packet inspection appliance, **redistributed every entry as a /24 originating from itself**. BGP's most-specific-prefix-wins rule meant the rest of the internet now believed AS 7007 was the best path to almost everything.

Within minutes, the rest of the world was sending the entire internet's traffic through a single underpowered Florida router. It collapsed under load. Most of the global internet became unreachable for over an hour. Recovery required upstream providers to install manual filters rejecting the bogus advertisements; Sprint took the lead on the global cleanup.

The lesson built into modern BGP operations: **prefix filtering** at every BGP session, **maximum-prefix limits** that automatically drop a session sending an unreasonable number of routes, and (today) **[[frontier:rpki-rov-50-percent|RPKI/ROV]]** that cryptographically validates origin. None of these existed in 1997. All of them exist now because of incidents like this.`
						}
					]
				},
				{ kind: 'outage', id: 'as-7007-1997' },
				{ kind: 'frontier', id: 'rpki-rov-50-percent' }
			]
		},
		{
			id: 'mitnick-1994',
			title: 'Mitnick vs Shimomura 1994',
			synopsis: 'TCP sequence-prediction attack on Christmas Day.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When TCP Trusted Its Own Sequence Numbers',
							text: `On 25 December 1994, Kevin Mitnick attacked Tsutomu Shimomura's computer at the San Diego Supercomputer Center with a **TCP sequence-prediction attack**. Early [[tcp|TCP]] implementations chose initial sequence numbers from a counter incremented by a fixed amount per second — making them predictable. If you knew the rough current value, you could forge an entire connection that the victim would believe was legitimate.

Mitnick used this to forge a connection from a trusted internal host, then exploit the .rhosts trust relationship to log in as root without authenticating. Shimomura, a security researcher, took it personally. The two-month manhunt that followed (documented in Shimomura's book **Takedown**) led to Mitnick's February 1995 arrest.

The fix in [[tcp|TCP]] is now standard: initial sequence numbers are picked from a cryptographically random source per connection (RFC 1948, then [[rfc:9293|RFC 9293]]). Predicting them is computationally infeasible. The rsh/rcp trust model that the attack exploited is also dead — replaced by [[ssh|SSH]] (which Tatu Ylönen wrote, partly in response to attacks like this one).`
						}
					]
				}
			]
		},
		{
			id: 'pakistan-youtube-2008',
			title: 'Pakistan/YouTube 2008',
			synopsis: 'A domestic block leaks globally.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When BGP Has No Authority',
							text: `On 24 February 2008, the Pakistan Telecommunications Authority ordered ISPs to block YouTube domestically. Pakistan Telecom (AS 17557) implemented the block by injecting a more-specific [[bgp|BGP]] route for YouTube's prefix into their network — pointing it at a null. This is the standard "RTBH" technique for filtering traffic and is fine **as long as you don't propagate the route outside your network**.

PT's upstream provider, PCCW Global, did not filter incoming BGP from PT. The bogus route propagated globally. Within minutes, the entire internet believed the best path to YouTube was through Pakistan, and every YouTube request anywhere on the planet was being null-routed by Pakistan Telecom.

YouTube was offline globally for two hours. PCCW Global eventually withdrew the route and applied filtering. The incident led to widespread adoption of more rigorous **prefix filtering** between providers and customers, and to the multi-decade [[frontier:rpki-rov-50-percent|RPKI deployment]] that now lets origin claims be cryptographically verified.`
						}
					]
				},
				{ kind: 'outage', id: 'pakistan-youtube-2008' }
			]
		},
		{
			id: 'china-telecom-2010',
			title: 'China Telecom 2010',
			synopsis: '15% of the internet routed through a single AS for 18 minutes.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Brief, Massive, Unexplained',
							text: `On 8 April 2010, China Telecom (AS 23724) announced [[bgp|BGP]] routes for approximately **37,000 prefixes** — about **15% of the global routing table** — claiming to be the best path to those networks. For 18 minutes, traffic destined for U.S. military, financial, and major commercial sites was traversing China Telecom's network before being forwarded to its real destination.

Whether the incident was deliberate or accidental remains disputed. The U.S.-China Economic and Security Review Commission's 2010 report flagged it as an intelligence concern; China Telecom's official response described it as a routine misconfiguration. The technical fact is unambiguous: 15% of the global internet's traffic had a brief, unauthorised observer in the path.

This incident accelerated the U.S. government's interest in **secure routing** infrastructure and was instrumental in the early funding of [[frontier:rpki-rov-50-percent|RPKI deployment]]. The architectural lesson is unchanged from [[outage:as-7007-1997|AS 7007]] and [[outage:pakistan-youtube-2008|Pakistan/YouTube]]: BGP without origin authentication is a system where any AS can intercept traffic to any prefix, accidentally or deliberately, in seconds.`
						}
					]
				},
				{ kind: 'frontier', id: 'rpki-rov-50-percent' }
			]
		},
		{
			id: 'sack-panic-2019',
			title: 'SACK Panic 2019',
			synopsis: 'A single TCP packet panics the Linux kernel.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Integer Overflow in the Most Critical Data Path',
							text: `In June 2019, Netflix security researchers found that a maliciously crafted [[tcp|TCP]] packet with carefully chosen Selective Acknowledgement (SACK) options could trigger an integer overflow in the Linux kernel's TCP stack, leading to a kernel panic. The bug, CVE-2019-11477 ("SACK Panic"), affected every Linux kernel from 2.6.29 (2009) through 5.1 (2019) — ten years of unpatched code in the heart of every Linux server on the internet.

A single packet, no authentication, would crash any vulnerable host. Service providers, cloud hyperscalers, container hosts — all simultaneously vulnerable. The patch had to be coordinated across every major Linux distribution and applied within hours of public disclosure to prevent mass exploitation.

What makes SACK Panic instructive is that the underlying SACK mechanism (RFC 2018, 1996) had been working correctly for 23 years. The bug was in a specific edge case interaction with the **frags_per_skb** limit increased in 2009. Twenty-three years of wide deployment did not surface the bug because nobody had thought to look for that exact interaction. The lesson: **fuzzing** the kernel TCP stack is now standard at every major operator, and there is now a much higher rate of CVE discovery in code that had been "stable" for a decade.`
						}
					]
				},
				{ kind: 'outage', id: 'sack-panic-2019' }
			]
		},
		{
			id: 'centurylink-2020',
			title: 'CenturyLink Flowspec 2020',
			synopsis: 'A BGP rule kills the BGP session that delivered it.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Rule That Killed the Connection That Distributed It',
							text: `On 30 August 2020, CenturyLink (AS 209, one of the largest tier-1 backbones) propagated a BGP **Flowspec** rule across its global network. Flowspec lets operators install firewall-like rules through BGP — useful for DDoS mitigation. The rule in question instructed every router to drop traffic matching certain criteria.

The catastrophic mistake: the criteria matched **the BGP control-plane traffic itself**. Routers received the rule, applied it, and immediately dropped the BGP keepalives carrying the next rule. The session timed out, BGP withdrew everything, the network entered an unstable cascading-failure mode that took **five hours** to resolve.

About 3.5% of all global internet traffic dropped during the incident. Cloudflare, Amazon, Microsoft, and most of the U.S. tier-1 customers were affected. The fix: human operators had to physically log in to routers and disable the bad rule.

The lesson is uncomfortable: the BGP control plane and the BGP-distributed firewall rules share a fate. A rule can disable its own delivery mechanism. CenturyLink rolled out automated controls preventing self-blocking rules; the broader industry adopted similar guards. But the underlying architectural concern — that the same protocol distributes both data and the rules governing data — remains.`
						}
					]
				},
				{ kind: 'outage', id: 'centurylink-flowspec-2020' }
			]
		},
		{
			id: 'facebook-2021',
			title: 'Facebook 2021 — The Cascade',
			synopsis: 'BGP, DNS, badge readers — six hours of compounding failure.',
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
							title: 'A Routine Maintenance Command, Then Six Hours of Compounding Disaster',
							text: `On 4 October 2021 at 15:39 UTC, a Facebook engineer ran a routine maintenance command on the backbone connecting Facebook's data centres. The command had a bug. It withdrew Facebook's [[bgp|BGP]] route advertisements globally — within minutes, every facebook.com, instagram.com, and whatsapp.com lookup failed. 3.5 billion users disconnected.

That was the easy part of the cascade. Facebook's authoritative [[dns|DNS]] servers were inside the data centres that just lost their BGP advertisements. Without DNS, the company's internal systems — Workplace, Calendar, internal monitoring — also failed. Engineers could not reach their own infrastructure remotely.

They went to the data centres physically. The data centre badge readers were behind the same authentication infrastructure that just disappeared. They could not enter the buildings. Engineers had to be physically escorted by security to access servers that needed manual intervention.

Recovery took six hours. The longest user-facing outage in Facebook's history. The post-mortem documented every cascade step, and the industry collectively learned a lesson that had been latent for years: **dependencies that look independent on the diagram are often the same dependency in operation.** BGP, DNS, badge readers, build systems, monitoring — all share a fate when one of them takes down the network.`
						}
					]
				},
				{ kind: 'outage', id: 'facebook-2021' }
			]
		},
		{
			id: 'rogers-2022',
			title: 'Rogers 2022 — A Country Disconnected',
			synopsis: 'Fifteen hours, half of Canada offline.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'When the ISP Is the Country',
							text: `On 8 July 2022 at 04:45 EDT, Rogers Communications — the largest ISP and mobile carrier in Canada, serving over 11 million subscribers — went down nationally. For 15 hours, Rogers customers had no internet, no mobile signal, no landline (Rogers also runs Canada's largest VoIP-based home phone service), no Interac debit transactions (Interac runs over Rogers connectivity), and no 911 service.

The trigger: a misconfiguration during a planned maintenance update to the Rogers IP/MPLS core. A bad route policy caused control-plane CPU exhaustion across Rogers' core routers. The cascade was domestic but total — banks, airports, government services, hospitals.

Recovery required Rogers engineers to log in to individual core routers (over out-of-band management, which was thankfully separate) and roll back the change manually. The CRTC (Canada's telecom regulator) opened an investigation that resulted in mandatory reciprocal-roaming agreements between Rogers and competitors so that future single-carrier outages would not strand emergency calls.

The structural lesson: when a single private company is the de facto national emergency-services backbone, regulatory infrastructure has to treat it as critical national infrastructure.`
						}
					]
				},
				{ kind: 'outage', id: 'rogers-2022' }
			]
		},
		{
			id: 'att-mobility-2024',
			title: 'AT&T Mobility 2024',
			synopsis: '125 million devices, 25,000 failed 911 calls.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Bad Update, A National Network',
							text: `On 22 February 2024 at 03:30 ET, AT&T Mobility customers nationwide began losing service. Calls failed, SMS failed, mobile data failed. The cause: a routine network upgrade incorrectly configured — pushed simultaneously across the production wireless core. Approximately 125 million devices became unreachable for **up to twelve hours**.

The most consequential failure was 911. **An estimated 25,000 emergency calls were not connected** during the outage. Several states issued public advisories telling AT&T customers to use Wi-Fi calling, alternate networks, or landlines. AT&T offered a $5 credit per affected customer; the FCC opened an investigation that resulted in a $13 million settlement.

The shape of the failure mirrors [[outage:rogers-2022|Rogers 2022]] uncomfortably: a planned change, deployed simultaneously across the production fleet, with insufficient progressive-rollout controls. Modern carriers now deploy core changes in **canary cells** — a small fraction of the network for hours of validation before broader rollout. The industry's debate, ongoing, is whether the same caution should apply to security patches that need to ship fast: a mass-deployment outage and an unpatched-CVE outage are both bad in different ways.`
						}
					]
				},
				{ kind: 'outage', id: 'att-mobility-2024' }
			]
		}
	]
};
