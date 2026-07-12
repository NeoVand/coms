/**
 * Outages — famous incidents that taught the industry something.
 *
 * Each entry is a self-contained story: setup → mistake → cascade →
 * consequence → resolution → lesson. Cascade beats can name the
 * specific protocols that failed at each step, so the UI can light up
 * the affected nodes on the graph during a "replay" view.
 *
 * Pulled from §10 of the category research files (e.g., Facebook 2021,
 * AS 7007 1997, Pakistan/YouTube 2008, China Telecom 2010, CenturyLink
 * Flowspec 2020, Rogers 2022, AT&T Mobility 2024, SACK Panic 2019).
 *
 * Every factual claim must cite an authoritative source.
 */

import type { SourceLink } from './types';

export interface OutageActor {
	name: string;
	role: string;
}

export interface OutageBeat {
	/** Wall-clock or relative time, e.g., "15:39 UTC", "T+3 min". */
	time?: string;
	title: string;
	description: string;
	/** Protocols whose failure mode is illustrated by this beat. */
	protocols?: string[];
	color?: string;
}

export type OutageCategory =
	| 'configuration'
	| 'security'
	| 'software-bug'
	| 'hardware'
	| 'protocol-design'
	| 'human-error'
	| 'capacity';

export interface Outage {
	id: string;
	title: string;
	/** ISO date — `YYYY-MM-DD`. */
	date: string;
	/** Human-readable duration, e.g., "~6 hours". */
	duration?: string;
	/** Scope of impact, e.g., "Global", "1 ISP, 12M customers". */
	scale?: string;
	oneLiner: string;
	category?: OutageCategory;
	/** Protocol IDs that this outage exercised, broke, or hinged on. */
	affectedProtocols: string[];
	cast?: OutageActor[];
	/** How the system was supposed to work. */
	setup: string;
	/** What went wrong. */
	mistake: string;
	/** Step-by-step replay — used by the timeline/replay UI. */
	cascade?: OutageBeat[];
	consequence: string;
	resolution: string;
	/** The takeaway — what an engineer should learn from this. */
	lesson: string;
	sources: SourceLink[];
	image?: { src: string; alt: string; caption?: string; credit?: string };
}

export const outages: Outage[] = [
	{
		id: 'facebook-2021',
		title: 'The Facebook Disappearance',
		date: '2021-10-04',
		duration: '~6 hours',
		scale: 'Global — 3 billion users; Facebook, Instagram, WhatsApp, Oculus all dark',
		oneLiner:
			"A routine maintenance command on {{meta|Meta}}'s global backbone took down its [[dns|DNS]], then its websites, then its employees' badge readers — all because the safety mechanism worked exactly as designed.",
		category: 'configuration',
		affectedProtocols: ['bgp', 'dns', 'tcp'],
		cast: [
			{ name: 'Meta (AS 32934)', role: 'Operator' },
			{ name: 'Cloudflare', role: 'External monitor (1.1.1.1)' },
			{ name: 'ThousandEyes', role: 'External monitor' }
		],
		setup:
			'{{meta|Meta}} runs tens of thousands of miles of fibre between its data centres — a global private backbone. Its [[dns|DNS]] servers live in smaller "edge" facilities, programmed with a defensive safety: if a [[dns|DNS]] server cannot reach the data centres (and therefore cannot answer authoritatively), it withdraws its own [[bgp|BGP]] advertisements so nobody routes queries to it. The reasoning was sound: a [[dns|DNS]] server that can\'t answer shouldn\'t be reached.',
		mistake:
			"During routine maintenance an engineer issued a command intended to assess the availability of global backbone capacity. {{meta|Meta}}'s audit tooling — designed to catch destructive commands — had a bug, and didn't stop it. The command took down the entire backbone.",
		cascade: [
			{
				time: '15:39 UTC',
				title: 'Backbone collapse',
				description:
					"The maintenance command disconnected {{meta|Meta}}'s data centres from each other. The [[dns|DNS]] edge servers, isolated, did exactly what they were designed to do.",
				protocols: ['bgp']
			},
			{
				time: '15:40 UTC',
				title: 'BGP withdrawals',
				description:
					"{{cloudflare|Cloudflare}} and other observers detect a flood of [[bgp|BGP]] {{bgp-update|UPDATE}} messages from {{autonomous-system|AS}} 32934 — and then a wave of WITHDRAWALs of the [[ip|IPv4]] and [[ipv6|IPv6]] prefixes covering Facebook's [[dns|DNS]] servers. From the outside, Facebook ceases to exist.",
				protocols: ['bgp', 'dns']
			},
			{
				time: '15:42 UTC',
				title: 'DNS goes dark',
				description:
					'Public resolvers like 1.1.1.1 and 8.8.8.8 start returning SERVFAIL for facebook.com. Apps and humans retry aggressively, generating a 30× [[dns|DNS]] query surge on public resolvers.',
				protocols: ['dns']
			},
			{
				time: '15:50 UTC',
				title: 'Apps cascade',
				description:
					'WhatsApp, Instagram, Messenger, Oculus all go dark — every product depending on the Facebook backbone or [[dns|DNS]].',
				protocols: ['tcp', 'tls']
			},
			{
				time: '~16:00 UTC',
				title: 'Internal tools disappear too',
				description:
					'{{meta|Meta}} engineers cannot get into the network to fix it because their internal tools depend on the same [[dns|DNS]], and their physical badge readers depend on the same network. Engineers are reportedly dispatched to data centres with bolt cutters.'
			},
			{
				time: '21:00 UTC',
				title: 'Backbone restored',
				description:
					'After roughly six hours, {{meta|Meta}} re-establishes backbone connectivity. [[dns|DNS]] prefix advertisements return at 21:05 {{utc-time|UTC}}. Cached [[dns|DNS]] clears worldwide over the next several hours.',
				protocols: ['bgp', 'dns']
			}
		],
		consequence:
			'Estimated revenue impact crosses $60M. Mark Zuckerberg\'s net worth drops by more than $6B in a day. In developing countries where Facebook\'s "Free Basics" program is the de-facto internet, communication, business, and humanitarian work pause for seven hours.',
		resolution:
			"{{meta|Meta}}'s post-mortem the next day acknowledges configuration tooling and audit-bypass as the root cause; the [[bgp|BGP]] withdrawal was the *symptom* of the larger backbone failure, not its cause.",
		lesson:
			'Three layers — [[bgp|BGP]], [[dns|DNS]], and physical access — fail in cascade because each one trusts the layer below it. Never have a single dependency chain run through your own product. The defensive safety ([[dns|DNS]] withdraws on failure) is sound; the issue is that *every* product, including badge readers and audit tools, depended on the same [[dns|DNS]].',
		sources: [
			{
				url: 'https://blog.cloudflare.com/october-2021-facebook-outage/',
				label: 'Cloudflare — Understanding how Facebook disappeared from the Internet'
			},
			{
				url: 'https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/',
				label: 'Meta Engineering — More details about the October 4 outage'
			},
			{
				url: 'https://en.wikipedia.org/wiki/2021_Facebook_outage',
				label: 'Wikipedia — 2021 Facebook outage'
			}
		]
	},
	{
		id: 'as-7007-1997',
		title: 'AS 7007 — The Day a Florida ISP Took Down the Internet',
		date: '1997-04-25',
		duration: '~2 hours, with aftershocks for days',
		scale: 'Global — Sprint and large parts of the internet went dark',
		oneLiner:
			"A small Florida {{isp|ISP}}'s misconfigured router de-aggregated the entire global {{routing-table|routing table}} into /24s and re-originated them all as itself.",
		category: 'configuration',
		affectedProtocols: ['bgp'],
		setup:
			'In 1997 [[bgp|BGP]] had been the inter-domain routing protocol for about eight years (BGP-4 itself since 1994). It assumes neighbours announce only what they own. There were almost no upstream filters: if a customer announced something, the upstream took it.',
		mistake:
			"MAI Network Services ({{autonomous-system|AS}} 7007) had a Bay Networks router whose forwarding table got dumped into [[bgp|BGP]] as if every entry were a route the {{autonomous-system|AS}} originated. The router didn't just announce its own prefixes — it announced /24 fragments of the entire global {{routing-table|routing table}}, claiming MAI was the origin {{autonomous-system|AS}} for everything.",
		cascade: [
			{
				title: 'Specific prefixes win',
				description:
					"Under [[bgp|BGP]]'s longest-prefix-match rule, a /24 always beats a less-specific /16 or /8. The leaked /24s instantly became the preferred path globally for the prefixes they covered."
			},
			{
				title: 'Sprint propagates',
				description:
					"MAI's upstream Sprint had no filters and propagated the routes to its peers, who propagated them onwards. Within minutes a Florida {{isp|ISP}} was the apparent origin of much of the internet's address space."
			},
			{
				title: 'Sprint melts',
				description:
					"Sprint's network couldn't handle the redirected traffic. Routers crashed. Sprint went largely dark."
			},
			{
				title: "Withdrawals don't help",
				description:
					'Even after MAI withdrew the routes, the propagation took hours to drain — the bad routes had been cached widely.'
			}
		],
		consequence:
			'Multi-hour partial outage of the public internet. Sprint customers especially affected. The first time the [[bgp|BGP]] community truly understood that a single misconfigured router anywhere on earth could take down the entire internet.',
		resolution:
			"Vince Bono's apology email to NANOG that day is preserved in the archives — a remarkably calm and detailed admission that became a model for incident communication.",
		lesson:
			'[[bgp|BGP]] trusts every neighbour by default. Without prefix filters at every {{peering|peering}} point, a single broken router can become the apparent origin of the entire internet. Prompted the slow rollout of route filters across {{transit|transit}} providers, but the protocol-level fix ({{rpki|RPKI}} {{rov|ROV}}) took another 25 years to reach 50% deployment.',
		sources: [
			{
				url: 'https://en.wikipedia.org/wiki/AS_7007_incident',
				label: 'Wikipedia — AS 7007 incident'
			},
			{
				url: 'https://archive.nanog.org/mailinglist/mailarchives/old_archive/1997-04/msg00444.html',
				label: 'Bono — "7007 Explanation and Apology" (NANOG, April 1997)'
			}
		]
	},
	{
		id: 'pakistan-youtube-2008',
		title: 'Pakistan Hijacks YouTube',
		date: '2008-02-24',
		duration: '~2 hours',
		scale: 'Global — YouTube unreachable from most of the internet',
		oneLiner:
			"Pakistan tried to block YouTube domestically. Its upstream provider didn't filter, and the block leaked to the whole internet.",
		category: 'configuration',
		affectedProtocols: ['bgp'],
		setup:
			"Pakistan ordered ISPs to block YouTube in response to a controversial video. Pakistan Telecom ({{autonomous-system|AS}} 17557) decided to do this by null-routing YouTube domestically: announce a more-specific [[bgp|BGP]] prefix for YouTube's address space inside its own {{autonomous-system|AS}} so traffic gets dropped. The technique works fine if the announcement stays inside the {{autonomous-system|AS}}.",
		mistake:
			"Pakistan Telecom announced 208.65.153.0/24 — more specific than YouTube's 208.65.152.0/22, so under longest-prefix match it would win locally. But Pakistan Telecom's upstream PCCW ({{autonomous-system|AS}} 3491) had no inbound filter and propagated the route globally. Suddenly the whole internet thought YouTube was in Pakistan.",
		cascade: [
			{
				title: '/24 wins globally',
				description:
					"PCCW's lack of filter let the /24 propagate to the rest of the world. Every router that learned both routes preferred the /24.",
				protocols: ['bgp']
			},
			{
				title: 'YouTube goes dark',
				description:
					'Traffic for the affected prefix headed to Pakistan, where it was null-routed. YouTube was unreachable for most of the internet for ~2 hours.',
				protocols: ['bgp', 'tcp']
			},
			{
				title: 'YouTube counters with /25',
				description:
					'YouTube announced an even more specific /25 to outcompete the hijack on the longest-prefix-match rule. The announcement spread; service started to recover.',
				protocols: ['bgp']
			},
			{
				title: 'PCCW blackholes',
				description:
					'PCCW eventually blackholed traffic to {{autonomous-system|AS}} 17557 to stop propagating the hijack.'
			}
		],
		consequence:
			"YouTube unreachable globally for hours. {{ripe-ncc|RIPE NCC}}'s RIS data became the canonical post-mortem source. Demonstrated that a domestic political decision in one country could globally take down a major web property.",
		resolution:
			"YouTube announced more-specific prefixes to outcompete the hijack. PCCW eventually filtered Pakistan Telecom's announcements. The whole event drained over ~2 hours.",
		lesson:
			'Forced {{rpki|RPKI}} from research curiosity to operational priority. Demonstrated definitively that [[bgp|BGP]] trust between ASes had to be replaced with cryptographic verification of who could originate which prefix. {{rpki|RPKI}} {{rov|ROV}} deployment finally crossed 50% of [[ip|IPv4]] prefixes 16 years later, in 2024.',
		sources: [
			{
				url: 'https://www.ripe.net/about-us/news/youtube-hijacking-a-ripe-ncc-ris-case-study/',
				label: 'RIPE NCC — YouTube Hijacking case study'
			},
			{
				url: 'https://en.wikipedia.org/wiki/Pakistan_and_YouTube',
				label: 'Wikipedia — Pakistan and YouTube'
			}
		]
	},
	{
		id: 'china-telecom-2010',
		title: 'China Telecom — 18 Minutes of the Internet',
		date: '2010-04-08',
		duration: '~18 minutes',
		scale: 'Global — ~50,000 prefixes (~15% of all internet routes) re-routed via AS 23724',
		oneLiner:
			"For 18 minutes, China Telecom advertised tens of thousands of prefixes it did not own — and a meaningful slice of the world's internet traffic took an unscheduled detour through Beijing.",
		category: 'configuration',
		affectedProtocols: ['bgp'],
		cast: [
			{ name: 'China Telecom (AS 23724)', role: 'Origin of the leaked routes' },
			{
				name: 'US-China Economic and Security Review Commission',
				role: 'Post-incident reporter'
			}
		],
		setup:
			'In 2010 [[bgp|BGP]] still ran on a near-universal trust model. Tier-1 {{transit|transit}} providers were expected to filter what their customers announced — many did, many did not, and there was no cryptographic check at the protocol level. Any {{autonomous-system|AS}} could announce any prefix; the network would believe the most-specific advertisement that reached it.',
		mistake:
			'On 8 April 2010 at 15:50 {{utc-time|UTC}}, AS 23724 (China Telecom) announced roughly 50,000 prefixes belonging to other networks — about 15% of the global {{routing-table|routing table}}. The advertisements propagated to several large international {{transit|transit}} peers that did not have inbound filters in place.',
		cascade: [
			{
				time: '15:50 UTC',
				title: 'Mass announcement',
				description:
					'AS 23724 begins originating ~50,000 prefixes it does not own — covering networks operated by Dell, {{apple|Apple}}, large US government agencies, and many others.',
				protocols: ['bgp']
			},
			{
				time: '15:50–16:08 UTC',
				title: 'Global propagation',
				description:
					'The leaked routes travel through unfiltered {{transit|transit}} relationships. For the next ~18 minutes, traffic for the affected prefixes that traverses certain paths is steered through China Telecom infrastructure before being delivered (or, in some cases, dropped).',
				protocols: ['bgp']
			},
			{
				time: '16:08 UTC',
				title: 'Withdrawal',
				description:
					'The bogus announcements are withdrawn. Routing convergence drains the bad paths over the next several minutes.'
			}
		],
		consequence:
			'For an 18-minute window, a measurable share of internet traffic — including traffic to and from US government and military networks — followed paths that included China Telecom AS 23724. Whether the event was a misconfiguration, a deliberate test, or something else has never been definitively settled. The 2010 US-China Economic and Security Review Commission report made the incident widely known.',
		resolution:
			'No technical resolution beyond the withdrawal itself. The structural fix — {{rpki|RPKI}} Route Origin Authorisations and {{rov|ROV}} enforcement at {{peering|peering}} points — was already specified but a decade away from broad deployment.',
		lesson:
			'Plain [[bgp|BGP]] advertises trust. A single {{autonomous-system|AS}} can globally redirect an arbitrary slice of internet traffic in minutes, with no protocol-level barrier to detection. China Telecom 2010 became one of the most-cited examples in the slow industry case for [[frontier:rpki-rov-50-percent|RPKI/ROV]], which finally crossed 50% of advertised {{ip-address|IP}} space in 2024 — fourteen years later.',
		sources: [
			{
				url: 'https://www.uscc.gov/sites/default/files/annual_reports/2010-Report-to-Congress.pdf',
				label: 'US-China Economic and Security Review Commission — 2010 Report to Congress (§5)'
			},
			{
				url: 'https://en.wikipedia.org/wiki/IP_hijacking#Notable_cases',
				label: 'Wikipedia — IP hijacking (notable cases)'
			},
			{
				url: 'https://blog.thousandeyes.com/the-2010-china-telecom-bgp-incident/',
				label: 'ThousandEyes — The 2010 China Telecom BGP incident'
			}
		]
	},
	{
		id: 'nsfnet-1986-collapse',
		title: 'The 1986 Congestion Collapse',
		date: '1986-10',
		duration: 'Recurrent through October 1986; root cause fixed in 4.3BSD-Tahoe (1988)',
		scale:
			'NSFNET — three-IMP-hop path between Lawrence Berkeley Lab and UC Berkeley dropped from 32 kbps to 40 bps (1000× degradation)',
		oneLiner:
			'The first time the internet broke under its own weight — and the congestion-control algorithms [[pioneer:van-jacobson|Van Jacobson]] published in 1988 to keep it from happening again.',
		category: 'protocol-design',
		affectedProtocols: ['tcp'],
		cast: [
			{ name: 'Van Jacobson (LBL)', role: "Co-author of the SIGCOMM '88 fix" },
			{
				name: 'Mike Karels (UC Berkeley CSRG)',
				role: 'Co-author; shipped the fixes in 4.3BSD-Tahoe'
			}
		],
		setup:
			'In 1986 the early internet ran [[tcp|TCP]] without any {{congestion-control|congestion-control}} feedback loop. The original {{bsd|BSD}} [[tcp|TCP]] retransmitted aggressively when {{ack|ACKs}} were late: a missing {{ack|ACK}} at time *t* meant "the packet is probably gone, send again." Across the link from Lawrence Berkeley Lab to UC Berkeley — a path of three {{imp|IMP}} hops, less than 400 yards of physical distance — that policy worked fine until traffic levels rose.',
		mistake:
			'There was no mistake — the protocol itself was the bug. As load grew, queues at the IMPs filled, {{ack|ACKs}} took longer, senders interpreted the delay as loss and {{retransmission|retransmitted}}, the {{retransmission|retransmissions}} filled queues further, and the network entered a positive-feedback loop where every additional packet made delivery less likely. Throughput on the LBL-to-UCB path collapsed from 32 kbps to 40 bps — a 1000× degradation across a 400-yard path.',
		cascade: [
			{
				title: 'Senders retransmit on timeout',
				description:
					"{{bsd|BSD}} [[tcp|TCP]]'s {{retransmission|retransmission}} timer fires aggressively when {{ack|ACKs}} are late. Each retransmit adds load to an already-saturated path.",
				protocols: ['tcp']
			},
			{
				title: 'Queues fill; ACKs delay further',
				description:
					'Queues at the IMPs grow. Round-trip times increase. Senders\' notion of "late" is now itself late — every packet looks lost.',
				protocols: ['tcp']
			},
			{
				title: 'Throughput collapse',
				description:
					'The network is doing nothing but carrying duplicates. Goodput approaches zero. The LBL-UCB path measures 40 bps where it had measured 32 kbps.'
			}
		],
		consequence:
			'The first proof that a protocol designed for a small, lightly-loaded research network could fail catastrophically under production load. NSFNET regional links became unusable for hours at a time through October 1986. The internet engineering community accepted that an end-to-end {{congestion-control|congestion-control}} loop was not optional.',
		resolution:
			'[[pioneer:van-jacobson|Van Jacobson]] and Mike Karels at Berkeley spent six months instrumenting the wire and reading the {{bsd|BSD}} source. Their 1988 {{sigcomm-conf|SIGCOMM}} paper — *{{congestion-avoidance|Congestion Avoidance}} and Control* — introduced a cluster of algorithms — **{{slow-start|slow start}}**, **{{aimd|AIMD}} {{congestion-avoidance|congestion avoidance}}**, **fast retransmit**, **{{exponential-backoff|exponential RTO backoff}}**, and a refined **{{rtt|RTT}} estimator**. These shipped in 4.3BSD-Tahoe and propagated to every [[tcp|TCP]] stack on earth; **fast recovery** was the defining addition two years later in TCP Reno (1990).',
		lesson:
			"Conservation of packets — put one packet into the network only when an {{ack|ACK}} confirms a previous one has left it — is the load-bearing principle that has held for forty years. Every later {{congestion-control|congestion-control}} algorithm (Reno, NewReno, Vegas, [[rfc:9438|CUBIC]], Compound, {{bbr|BBR}} v1/v2/v3, Prague over [[frontier:l4s-comcast-launch|L4S]]) is a refinement of Jacobson's six.",
		sources: [
			{
				url: 'https://ee.lbl.gov/papers/congavoid.pdf',
				label: "Jacobson — Congestion Avoidance and Control (SIGCOMM '88)"
			},
			{
				url: 'https://en.wikipedia.org/wiki/Network_congestion#Congestive_collapse',
				label: 'Wikipedia — Congestive collapse'
			},
			{ url: 'https://www.rfc-editor.org/rfc/rfc5681', label: 'RFC 5681 — TCP Congestion Control' }
		]
	},
	{
		id: 'centurylink-flowspec-2020',
		title: 'CenturyLink / Level 3 — The Flowspec Loop',
		date: '2020-08-30',
		duration: '~5 hours',
		scale: 'Global — 3.5% drop in worldwide internet traffic',
		oneLiner:
			"A [[bgp|BGP]] Flowspec rule pushed to mitigate a customer's DDoS killed the [[bgp|BGP]] session that delivered it — and Level 3's tier-1 backbone went into a control-plane infinite loop.",
		category: 'software-bug',
		affectedProtocols: ['bgp', 'tcp'],
		cast: [
			{ name: 'CenturyLink / Level 3 (AS 3356)', role: 'Tier-1 transit operator' },
			{ name: 'Cloudflare', role: 'External monitor + customer' }
		],
		setup:
			"Level 3 (now CenturyLink) ran one of the world's largest tier-1 {{transit|transit}} networks. To mitigate DDoS attacks for customers, they used [[bgp|BGP]] Flowspec — a [[bgp|BGP]] extension ([[rfc:5575|RFC 5575]]) that distributes packet-filtering rules across the network the same way [[bgp|BGP]] distributes routes.",
		mistake:
			"An incorrectly-formatted Flowspec rule pushed to mitigate a customer's DDoS blocked [[bgp|BGP]] itself. The rule killed the [[bgp|BGP]] session that delivered it. The session re-established. The rule was re-pushed. The session died again.",
		cascade: [
			{
				title: 'Bad Flowspec rule pushed',
				description:
					"Operators push a Flowspec rule intended to drop a customer's attack traffic. The rule's match criteria are too broad — they accidentally match [[bgp|BGP]] itself.",
				protocols: ['bgp']
			},
			{
				title: 'BGP sessions drop',
				description:
					"Routers across the Level 3 backbone start dropping the rule's match — which includes their own [[bgp|BGP]] keepalives. [[bgp|BGP]] sessions die across the entire backbone.",
				protocols: ['bgp', 'tcp']
			},
			{
				title: 'Sessions re-establish',
				description:
					'Each [[bgp|BGP]] session times out, retries, and re-establishes. As soon as it does, it re-receives the same Flowspec rule. The cycle restarts.',
				protocols: ['bgp']
			},
			{
				title: 'Tier-1 collapse',
				description:
					'The continuous churn means routes never converge. Customers across the Level 3 footprint experience massive packet loss. {{cloudflare|Cloudflare}} measures a 3.5% drop in *global* internet traffic.'
			},
			{
				title: 'Manual de-peering needed',
				description:
					'Level 3 has to ask other tier-1s to de-{{peer|peer}} with them temporarily to drain the [[bgp|BGP]]-{{bgp-update|update}} queue and let the bad rule be removed.'
			}
		],
		consequence:
			"~5 hours of severe disruption across one of the world's largest backbones. {{cloudflare|Cloudflare}} publicly reported a 3.5% drop in global internet traffic. Many SaaS providers, video calls, and games hit by the cascading failures.",
		resolution:
			'Level 3 manually de-peered with other tier-1s to break the [[bgp|BGP]]-{{bgp-update|update}} loop, removed the bad Flowspec rule, then re-peered.',
		lesson:
			"Don't deploy a feature whose failure mode disables the channel that controls it. [[bgp|BGP]] Flowspec is powerful — and Flowspec rules that touch [[bgp|BGP]] itself can lock you out of your own network. The same lesson applies to any in-band control protocol.",
		sources: [
			{
				url: 'https://blog.cloudflare.com/analysis-of-todays-centurylink-level-3-outage/',
				label: 'Cloudflare — August 30th 2020 CenturyLink/Level(3) outage analysis'
			},
			{
				url: 'https://www.thousandeyes.com/blog/centurylink-level-3-outage-analysis',
				label: 'ThousandEyes — CenturyLink / Level 3 Outage Analysis'
			}
		]
	},
	{
		id: 'rogers-2022',
		title: 'Rogers — A Country Disconnected',
		date: '2022-07-08',
		duration: '~15 hours',
		scale:
			'12+ million Canadians lost wireless, wireline, internet, and Interac debit-card service',
		oneLiner:
			'A maintenance change to [[bgp|BGP]] route policy in the [[ip|IP]] core inadvertently allowed a full [[bgp|BGP]] table redistribution into [[ospf|OSPF]] — overwhelming the core router CPUs and crashing the entire network.',
		category: 'configuration',
		affectedProtocols: ['bgp'],
		cast: [{ name: 'Rogers Communications (AS 812)', role: 'Operator' }],
		setup:
			"Rogers ran one of Canada's three national telecom networks — wireless, wireline, internet, and the Interac point-of-sale debit card system that runs Canadian retail. The [[ip|IP]] core used [[bgp|BGP]] for inter-{{autonomous-system|AS}} routing and [[ospf|OSPF]] for intra-{{autonomous-system|AS}} routing — the standard separation.",
		mistake:
			'A maintenance change to [[bgp|BGP]] route policy in the [[ip|IP]] core was meant to apply to a small set of routes. A missing filter let the entire [[bgp|BGP]] table — nearly a million prefixes — redistribute into [[ospf|OSPF]], the intra-{{autonomous-system|AS}} routing protocol.',
		cascade: [
			{
				title: 'BGP-into-OSPF flood',
				description:
					"[[ospf|OSPF]] was never designed to carry a million routes. Every core router started flooding link-state updates trying to compute shortest-path trees over routes it shouldn't have known about.",
				protocols: ['bgp']
			},
			{
				title: 'Core CPU saturation',
				description:
					'Core router CPUs and memory saturated. Routing software started crashing. The control plane melted.'
			},
			{
				title: 'Country offline',
				description:
					"Wireless calls dropped. Wireline internet went dark. Interac debit-card terminals stopped working at every store running on Rogers — meaning a large fraction of Canadian retail couldn't take payment for the day."
			},
			{
				title: 'Manual recovery',
				description:
					'Restoring service required physically connecting to core routers and rolling back the change — a 15-hour effort.'
			}
		],
		consequence:
			"12+ million customers without service for a full business day. Hospitals, 911 operations, point-of-sale systems, government services impacted. {{crtc|CRTC}}'s 2024 executive summary identified missing route filters and lab-testing skipped due to an algorithm down-grading risk from 'High' to 'Low' after earlier phases succeeded.",
		resolution:
			'Manual rollback of the offending policy change, with engineers physically present at core sites.',
		lesson:
			'A single national telecom outage can take down payment systems, hospitals, and emergency services. Canada subsequently mandated mutual emergency-roaming agreements between carriers, on the principle that a single {{autonomous-system|AS}} failing should not disconnect a country.',
		sources: [
			{
				url: 'https://blog.cloudflare.com/cloudflares-view-of-the-rogers-communications-outage-in-canada/',
				label: 'Cloudflare — view of the Rogers outage'
			},
			{
				url: 'https://crtc.gc.ca/eng/publications/reports/xona2024.htm',
				label: 'CRTC — Assessment of Rogers Networks for Resiliency and Reliability'
			},
			{
				url: 'https://en.wikipedia.org/wiki/2022_Rogers_Communications_outage',
				label: 'Wikipedia — 2022 Rogers Communications outage'
			}
		]
	},
	{
		id: 'att-mobility-2024',
		title: 'AT&T Mobility — Nationwide Wireless Down',
		date: '2024-02-22',
		duration: '~12 hours',
		scale: '125M+ devices, 92M+ blocked voice calls, 25K+ failed 911 calls',
		oneLiner:
			"A network change with an equipment configuration error pushed the AT&T mobility network into 'protect mode,' disconnecting all wireless devices nationwide.",
		category: 'configuration',
		affectedProtocols: [],
		cast: [{ name: 'AT&T Mobility', role: 'Operator' }],
		setup:
			"AT&T Mobility is one of the three large US national wireless carriers. The mobility network has elaborate self-protection mechanisms — when the system detects something seriously wrong, it can enter a defensive 'protect mode' that disconnects subscribers to limit damage.",
		mistake:
			'At 02:42 CT, a network change with an equipment configuration error tripped the protect-mode threshold. The network defended itself by disconnecting every wireless device.',
		cascade: [
			{
				time: '02:42 CT',
				title: 'Configuration error',
				description: 'A network change with an equipment configuration error is pushed.'
			},
			{
				time: '02:43 CT',
				title: 'Protect mode',
				description:
					"The error trips the network's self-protection threshold. The mobility core enters 'protect mode' and starts disconnecting devices."
			},
			{
				title: 'Nationwide outage',
				description:
					'125M+ wireless devices lose service. Voice calls fail nationwide. 911 calls cannot be placed by AT&T mobility customers in many areas.'
			},
			{
				title: 'Recovery cycle',
				description: '12 hours to fully restore service across the country.'
			}
		],
		consequence:
			'125M+ devices affected. 92M+ blocked voice calls. 25K+ failed 911 calls. The {{fcc|FCC}} report reads like every [[bgp|BGP]] outage post-mortem: insufficient {{peer|peer}} review, missing controls, unscanned changes.',
		resolution:
			'Configuration rollback and gradual reconnection of subscribers to avoid signalling overload.',
		lesson:
			'"Self-protection mechanisms that disconnect users" is a category that needs careful design. The threshold for protect mode should not be reachable by an operator\'s mistake — and if it is, recovery should not require 12 hours.',
		sources: [
			{
				url: 'https://docs.fcc.gov/public/attachments/DOC-404154A1.pdf',
				label: 'FCC — February 22, 2024 AT&T Mobility Network Outage Report'
			},
			{
				url: 'https://about.att.com/pages/network-update',
				label: 'AT&T — Network Update'
			}
		]
	},
	{
		id: 'sack-panic-2019',
		title: 'SACK Panic — A One-Packet Linux Kernel Crash',
		date: '2019-06-17',
		duration: 'Disclosed; many systems exposed for weeks while patching',
		scale: 'Most Linux servers on the internet (CVSS 7.5)',
		oneLiner:
			"Netflix's Jonathan Looney found that the right [[tcp|TCP]] {{sack|SACK}} option pattern would crash the {{linux|Linux}} kernel — a single [[tcp|TCP]] packet, no authentication, instant remote denial of service.",
		category: 'software-bug',
		affectedProtocols: ['tcp'],
		cast: [
			{ name: 'Jonathan Looney (Netflix)', role: 'Discoverer' },
			{ name: 'Linux Kernel TCP maintainers', role: 'Vendors' }
		],
		setup:
			'[[tcp|TCP]] {{sack|Selective Acknowledgment}} ({{sack|SACK}}, [[rfc:2018|RFC 2018]]) lets the receiver tell the sender exactly which non-contiguous byte ranges have arrived. The {{linux|Linux}} kernel tracks these as a queue of skb (socket buffer) ranges. The data structure includes a 16-bit gso_segs counter for the segments-in-flight on a single sk_buff.',
		mistake:
			'With a small enough {{mss|MSS}} — easily set by a remote {{peer|peer}} — a single sk_buff could be split into more than 65,535 GSO segments. The 16-bit counter overflowed. The kernel hit an integer overflow in tcp_skb_cb, triggering a panic.',
		cascade: [
			{
				title: 'Patch crafted',
				description:
					'A remote attacker establishes a [[tcp|TCP]] connection, advertises a tiny {{mss|MSS}}, and triggers the kernel to compute gso_segs > 65,535.'
			},
			{
				title: 'Integer overflow',
				description: 'tcp_gso_segs overflows. The kernel panics. The server reboots.'
			},
			{
				title: 'CVE-2019-11477 (CVSS 7.5)',
				description:
					"Disclosed alongside {{cve|CVE}}-2019-11478 ({{sack|SACK}} Slowness) and {{cve|CVE}}-2019-11479 (excessive resource consumption from low {{mss|MSS}}) in Netflix's coordinated disclosure of June 17, 2019.",
				protocols: ['tcp']
			}
		],
		consequence:
			'Most {{linux|Linux}} servers on the public internet were vulnerable. CVSS 7.5 (high). Operators scrambled to patch; many disabled {{sack|SACK}} as an interim mitigation, accepting performance degradation to avoid the crash.',
		resolution:
			'Mainline kernel patch shipped within days. Mitigations: disable {{sack|SACK}} (`net.ipv4.tcp_sack=0`) or enforce a minimum {{mss|MSS}} via the new `net.ipv4.tcp_min_snd_mss` sysctl.',
		lesson:
			"Decades-old [[tcp|TCP]] code paths still hide remote-DoS bugs. The post-disclosure work led to better [[tcp|TCP]] fuzzing infrastructure and to RACK-TLP ([[rfc:8985|RFC 8985]], Feb 2021) replacing the older 'three duplicate ACKs' loss-detection rule.",
		sources: [
			{
				url: 'https://github.com/Netflix/security-bulletins/blob/master/advisories/third-party/2019-001.md',
				label: 'Netflix Security Bulletin — TCP SACK PANIC'
			},
			{
				url: 'https://access.redhat.com/security/vulnerabilities/tcpsack',
				label: 'Red Hat — TCP SACK PANIC vulnerability'
			}
		]
	}
];

export const outageMap = new Map(outages.map((o) => [o.id, o]));

export function getOutageById(id: string): Outage | undefined {
	return outageMap.get(id);
}

export function getOutagesForProtocol(protocolId: string): Outage[] {
	return outages.filter((o) => o.affectedProtocols.includes(protocolId));
}
