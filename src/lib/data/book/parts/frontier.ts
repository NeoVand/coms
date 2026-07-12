/**
 * Part XI — The Modern Frontier (2024–2026).
 *
 * What is actively shipping or being standardised right now — the
 * things that will date this book in five years. Multi-section
 * chapters drawn from the per-protocol research files in /research.
 */

import type { BookPart } from '../types';

export const frontier: BookPart = {
	id: 'frontier',
	title: 'The Modern Frontier (2024–2026)',
	label: 'XII',
	description:
		'What is actively shipping or being {{ietf|standardised}} right now — the things that will date this book in five years.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'post-quantum',
			title: 'Post-Quantum TLS',
			synopsis:
				'{{pq-ciphersuite|X25519MLKEM768}} default in iOS 26 and Chrome — the first deployed post-quantum [[tls|TLS]] {{handshake|handshake}} on the public web.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Within four days of iOS 26 shipping in September 2025, post-quantum traffic share went from <2% to 11%. By December 2025 it was over 25%. The cryptographic community shipped useful primitives years before the hardware threat materialised — and the deployment ecosystem rolled them out in months.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Harvest Now, Decrypt Later',
							text: `A working quantum computer of useful size — roughly 2,300 logical qubits for 256-bit ECC (the ~4,100-qubit figure often cited is for RSA-2048) — could break the elliptic-curve key agreement that secures essentially all modern [[tls|TLS]]. Estimates of when such a machine arrives range from "ten years" to "never." But the threat is not future: an adversary recording your encrypted traffic **today** can store it indefinitely and decrypt it whenever a working quantum computer arrives. **Harvest now, decrypt later** (HNDL/SNDL) is the threat model that drives this entire chapter.

For data that needs to stay secret for decades — state secrets, medical records, long-lived contracts, identity documents — the threat is real now. Governments and large enterprises started planning the migration in the late 2010s; the standards finally landed in 2024.`
						},
						{
							type: 'narrative',
							title: 'NIST FIPS 203 and the Codepoint Disruption',
							text: `**{{nist|NIST}} published {{fips|FIPS}} 203 ({{ml-kem|ML-KEM}}) on 13 August 2024** — Kyber's final-form rename. The rename was not cosmetic: it forced a new [[tls|TLS]] codepoint **0x11EC for {{pq-ciphersuite|X25519MLKEM768}}**, and the old **codepoint 0x6399 (Kyber768) was invalidated**. Every browser/server/load balancer had to re-deploy because the wire format changed.

The deployment trick is **hybrid**: combine the existing {{x25519|X25519}} key {{exchange|exchange}} with {{ml-kem|ML-KEM}}-768 in such a way that an attacker has to break **both**. the {{x25519|X25519}}+{{ml-kem|ML-KEM}}-768 hybrid combines ~128-bit classical security (X25519) with {{nist|NIST}} Cat-3 {{pq|PQ}} (~AES-192-equivalent) — eliminating the HNDL window without sacrificing classical security if {{ml-kem|ML-KEM}} turns out to have an unexpected weakness.

Browser deployment moved fast. **Chrome 124 (April 2024)** made X25519Kyber768 default; **Chrome 131 (November 2024)** switched to the renamed {{pq-ciphersuite|X25519MLKEM768}}. Firefox 132, Edge 131, OpenJDK (JEP 527), and **OpenSSL 3.5 LTS (8 April 2025)** followed. OpenSSL 3.5's default keyshare is now \`X25519MLKEM768 + X25519\`.`
						},
						{
							type: 'callout',
							title: 'Apple iOS 26 cliff: <2% to 25% in 90 days',
							text: "**{{apple|Apple}} iOS 26 / iPadOS 26 / macOS Tahoe 26 / visionOS 26 (September 2025)** turned {{pq-ciphersuite|X25519MLKEM768}} on by default for all [[tls|TLS]] 1.3 in Network.framework. Within **four days** the iOS post-quantum traffic share went from <2% to 11%. By December 2025 it was >25%. {{apple|Apple}}'s scale plus the default-on shipping pattern is the fastest deployment of a new [[tls|TLS]] feature in the protocol's history."
						},
						{
							type: 'narrative',
							title: 'The Asymmetry — Browsers Ahead, Origins Behind',
							text: `**By the end of 2025, ~52% of all [[tls|TLS]] 1.3 connections to {{cloudflare|Cloudflare}} carried post-quantum hybrid key agreement** — but only **~3.7% of *origins*** support {{pq-ciphersuite|X25519MLKEM768}}. The asymmetry is the story.

The browser→edge {{handshake|handshake}} is now {{pq|PQ}} on a majority of human traffic. The edge→origin leg is the new frontier. **Akamai rolled out {{pq|PQ}} to-origin on 30 June 2025**; {{cloudflare|Cloudflare}} enabled {{pq|PQ}} key agreement by default in October 2022 for client connections. The long pole is the server side: every nginx, Apache, IIS, and proprietary {{http-method|HTTP}} server eventually needs an OpenSSL 3.5+ build with {{pq-ciphersuite|X25519MLKEM768}} support, then explicit configuration to enable it.

The cost: **{{ml-kem|ML-KEM}} ciphertext is 1088 bytes, {{public-key|public key}} 1184 bytes**. Most compatibility pain is from larger ClientHellos exceeding a single [[tcp|TCP]] {{mss|MSS}}. {{ml-kem|ML-KEM}}-768 shared-secret derivation runs in ~30µs on a modern x86 core — performance is not the concern; wire compatibility is.`
						},
						{
							type: 'narrative',
							title: 'What Comes After Key Agreement',
							text: `Pure-{{pq|PQ}} signatures are not yet feasible for the web: an ML-DSA-44 cert is ~5 KB and ML-DSA-65 ~9 KB. **{{cloudflare|Cloudflare}}'s Merkle Tree Certificates** (PLANTS WG) experiment is the most-discussed path; expect 2027-2028 before pure-{{pq|PQ}} [[tls|TLS]] auth is realistic at scale.

**{{ech|Encrypted Client Hello}}** was published as **[[frontier:ech-rfc-9849|RFC 9849]] in March 2026** after years of drafts. {{cloudflare|Cloudflare}} deploys {{ech|ECH}} for ~70% of websites it fronts. **Russia is already partly blocking {{ech|ECH}}** via \`ClientHelloOuter\` {{sni|SNI}} inspection (PETS FOCI 2025) — censorship resistance and metadata privacy are the same problem.

The **47-day-cert cliff**: {{certificate-authority|CA}}/Browser Forum **Ballot SC-081v3** (passed 11 April 2025, {{apple|Apple}}-sponsored, 29-yes / 0-no) phases [[tls|TLS]] cert validity from 398 days to **200 on 15 March 2026**, **100 on 15 March 2027**, **47 on 15 March 2029**, with DCV reuse falling to 10 days. Manual renewal is no longer an option — the entire web is moving to ACME-style automation. The deployment story for cryptography in the next five years is automation as much as algorithms.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Asymmetric_Cryptography.svg/500px-Asymmetric_Cryptography.svg.png',
							alt: 'Asymmetric cryptography diagram — public key encrypts, private key decrypts.',
							caption:
								'**Asymmetric cryptography** — the public-key / private-key dance underneath every [[tls|TLS]] connection. The classical primitives ({{rsa|RSA}}, {{ecdh|ECDH}} on {{curve25519|Curve25519}}, {{ecdsa|ECDSA}}) all break in polynomial time on a useful quantum computer. **{{nist|NIST}} published {{fips|FIPS}} 203 ({{ml-kem|ML-KEM}}) on 13 August 2024**; by end-2025 **>50% of [[tls|TLS]] 1.3 connections to {{cloudflare|Cloudflare}}** carried {{pq|PQ}}-hybrid {{pq-ciphersuite|X25519MLKEM768}} key {{exchange|exchange}}. Within four days of {{apple|Apple}} shipping iOS 26 in September 2025, the iPhone {{pq|PQ}} share jumped from <2% to 11%.',
							credit: 'Image: Wikimedia Commons / public domain'
						}
					]
				},
				{ kind: 'frontier', id: 'pq-tls-x25519mlkem768' },
				{ kind: 'frontier', id: 'ech-rfc-9849' },
				{ kind: 'protocol', id: 'tls' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'l4s-everywhere',
			title: 'L4S Everywhere',
			synopsis:
				'{{l4s|L4S}}: sub-millisecond queuing {{latency|latency}} for cooperating flows — Comcast launched in production January 2025.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'For 35 years, {{congestion-control|congestion control}} on the internet has been loss-based: when a packet is dropped, the sender slows down. By the time the packet is dropped, the queue is already full. {{l4s|L4S}} inverts the model.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Problem Bufferbloat Created',
							text: `The motivating problem for {{l4s|L4S}} is **{{bufferbloat|bufferbloat}}** — a term **Jim Gettys at Bell Labs coined in 2010-2011** in an {{acm-org|ACM}} Queue article after he measured 1.2-second latencies on home links. Cheap memory had made router and modem queues huge; full queues meant seconds of {{latency|latency}} before any loss signal reached senders. The community's response progressed from CoDel → FQ-CoDel → PIE → {{l4s|L4S}}.

For 35 years, {{congestion-control|congestion control}} on the internet has been **loss-based**: when a packet is dropped, the sender slows down. The mechanism works, but the cost is queueing delay — by the time the packet is dropped, the queue is already full and every packet behind it has been delayed.

**{{l4s|L4S}}** (Low-{{latency|Latency}}, Low-Loss, Scalable Throughput) was published in **January 2023** as **[[rfc:9330|RFC 9330]] (architecture), {{rfc-doc|RFC}} 9331 (ECT(1) signalling), {{rfc-doc|RFC}} 9332 (Dual-Queue Coupled {{aqm|AQM}})**. The architecture inverts the model.`
						},
						{
							type: 'narrative',
							title: 'How L4S Works — The ECT(1) Repurpose',
							text: `Cooperating senders mark their packets with **ECT(1)** — a previously-unused [[ip|IP]] codepoint (\`01\` in the {{ecn|ECN}} field). Routers with {{l4s|L4S}} support put those packets in a **separate, isolated queue** and use **explicit congestion {{notification|notification}}** ({{ecn|ECN}}) to signal earlier — before the queue grows. Senders react to the signal by paced back-off rather than half-the-window slash.

The result: **sub-millisecond queuing delay** even at 100% link utilisation, for flows that participate. Non-{{l4s|L4S}} flows in the classic queue see no degradation. It is the first congestion-control change that delivers an order-of-magnitude {{latency|latency}} improvement without coordination across all senders.

The reference scalable {{congestion-control|congestion control}} is **[[tcp|TCP]] Prague**. {{apple|Apple}} shipped **{{l4s|L4S}} support in iOS 17 / macOS Sonoma at WWDC June 2023** — the first mass-market client deployment.`
						},
						{
							type: 'callout',
							title: 'Comcast launched L4S in production January 2025',
							text: '**Comcast launched {{l4s|L4S}} in production in late January 2025**, in six US metros (Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville MD, San Francisco), with {{apple|Apple}}, {{nvidia|NVIDIA}} GeForce NOW, {{meta|Meta}}, and Valve as launch partners. **{{docsis|DOCSIS}} 4.0 cable modems are shipping {{l4s|L4S}}-capable {{aqm|AQM}} in 2024-2025**. This is the first large-scale deployment of the {{l4s|L4S}} architecture on a production access network.'
						},
						{
							type: 'narrative',
							title: 'WebRTC, AI, and the Active Spread',
							text: `**[[webrtc|WebRTC]] field trials are live in Chromium** behind the field trial flags \`WebRTC-RFC8888CongestionControlFeedback/Enabled\` and \`WebRTC-Bwe-ScreamV2/Enabled\`. Combined with [[rtp|RFC 8888]] feedback, {{l4s|L4S}} delivers **sub-1 ms queuing delay** for cooperating real-time flows. Benchmarked in IFIP Networking 2025 ("Performance Evaluation of {{l4s|L4S}} in XR Scenarios").

{{apple|Apple}} also added {{l4s|L4S}} signalling into APIs surfaced through **Network.framework** so apps inherit it without code changes — a deliberate strategy to bypass the slow uptake of new transport features.

The unresolved political fight is **{{l4s|L4S}}-vs-classic fairness**: Scalable {{congestion-control|Congestion Control}} flows starve out {{cubic|CUBIC}}/Reno in the same queue, which is why **Dual-Queue {{aqm|AQM}} is required** — the bottleneck must classify and isolate. The **{{bbrv3|BBRv3}}** community continues to {{mqtt-publish|publish}} papers on whether "scalable" and "classic" can ever share a single FIFO fairly.

{{l4s|L4S}} deployment as of mid-2026 is **infrastructure-shaped**: clients ({{apple|Apple}}, Chrome [[webrtc|WebRTC]]) and ISPs (Comcast {{docsis|DOCSIS}}) are ahead of the middle of the network. The long pole is server-side {{ecn|ECN}} handling and {{cdn|CDN}} {{aqm|AQM}} upgrades. The next 24 months will tell whether {{l4s|L4S}} is the new default or stays a niche feature for gaming and live media.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Cable_Modem.JPG/500px-Cable_Modem.JPG',
							alt: 'A DOCSIS cable modem — the kind of last-mile device that ships L4S-capable AQM in 2024-2025.',
							caption:
								"A consumer **cable modem** — the bit of hardware Comcast turned into the world's first production **{{l4s|L4S}}** deployment in **January 2025** across six US metros (Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville MD, San Francisco). {{docsis|DOCSIS}} 4.0 modems ship {{l4s|L4S}}-capable Dual-Queue {{aqm|AQM}}; {{apple|Apple}} iOS 17 / macOS Sonoma added {{l4s|L4S}} support in 2023. Sub-millisecond queuing delay at full link utilisation, finally, after 15 years of {{bufferbloat|bufferbloat}}.",
							credit: 'Photo: Wikimedia Commons / CC BY-SA'
						}
					]
				},
				{ kind: 'frontier', id: 'l4s-comcast-launch' },
				{ kind: 'rfc', number: '9330' },
				{ kind: 'frontier', id: 'bbrv3-default' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'ipv6-mostly',
			title: 'IPv6-Mostly',
			synopsis:
				"On 28 March 2026, {{google|Google}}'s [[ipv6|IPv6]] dashboard recorded 50.1% for the first time — and [[ip|IPv4]] crossed under.",
			slots: [
				{
					kind: 'pull-quote',
					text: 'Geoff Huston projected linear extrapolation puts [[ipv6|IPv6]] transition completion around late 2045 — and warned that v4/v6 coexistence may now be a steady state rather than a transition.',
					attribution: 'APNIC, October 2024'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The 50% Crossing',
							text: `**On 28 March 2026, {{google|Google}}'s [[ipv6|IPv6]] dashboard recorded 50.1% for the first time** — [[ipv6|IPv6]] briefly surpassed [[ip|IPv4]] in {{google|Google}}'s measured user base. {{apnic|APNIC}} Labs and {{cloudflare|Cloudflare}} Radar still place global [[ipv6|IPv6]] capability in the **40-43%** range; the 50% number is a {{google|Google}}-specific snapshot. But it is a milestone the community has been waiting for since 1995.

**[[ipv6|IPv6]]** was specified in 1995. For most of the next twenty-eight years, deployment was painful — early adopters had to maintain dual stacks, the operational cost was double, and the upside was mostly future-proofing.

Adoption inflected when **mobile carriers** went [[ipv6|IPv6]]-mostly for cellular subscribers. **T-Mobile US** moved its mobile core to [[ipv6|IPv6]]-only with {{four-six-four-xlat|464XLAT}} (Cameron Byrne, NANOG 61, 2014) — the production case study that defined the pattern. Verizon and AT&T followed. By 2026, **US mobile [[ipv6|IPv6]] averages ~87%**; **France 86%** ({{google|Google}}, Feb 2026); **India 67-80%** largely on the back of Reliance Jio's [[ipv6|IPv6]]-first launch in 2016 (>237M [[ipv6|IPv6]] users by 2017); **China 865M [[ipv6|IPv6]] users (77% of users); 34% of traffic** (Sept 2025).`
						},
						{
							type: 'narrative',
							title: 'AWS Started Charging — And Everything Moved',
							text: `**{{aws|AWS}} began charging $0.005/[[ip|IP]]/hour for every public [[ip|IPv4]] address on 1 February 2024** — the first hard *financial* push toward [[ipv6|IPv6]] from a hyperscaler at scale. ~$3.65/month per address, attached or not. For organisations running thousands of VMs, the cost added up immediately.

Within months, {{aws|AWS}} workloads at scale began migrating to [[ipv6|IPv6]]-only architectures with {{nat64|NAT64}} gateways for legacy [[ip|IPv4]] destinations. The economic forcing function did more for [[ipv6|IPv6]] deployment in 2024 than two decades of advocacy.

**{{meta|Meta}}** runs >99% of internal datacenter traffic over [[ipv6|IPv6]]; entire new clusters are [[ipv6|IPv6]]-only, serving [[ip|IPv4]] via L4/L7 load balancers. {{meta|Meta}} says **internal [[ipv6|IPv6]] is 10-15% faster than [[ip|IPv4]]** (and on one carrier mobile measurement, 40% faster), driven mostly by {{nat|NAT}} removal and caching.`
						},
						{
							type: 'callout',
							title: 'IPv6-Mostly is the deployment pattern',
							text: '**[[ipv6|IPv6]]-Mostly** is what most modern networks actually deploy: a single network using **DHCPv4 Option 108 ([[rfc:8925|RFC 8925]])** to tell capable clients "skip [[ip|IPv4]] entirely," **PREF64 in Router Advertisements ([[rfc:8781|RFC 8781]])** to advertise the {{nat64|NAT64}} prefix, and **{{four-six-four-xlat|464XLAT}} ([[rfc:6877|RFC 6877]])** {{clat-acr|CLAT}} for clients still needing [[ip|IPv4]]. **Fedora/NetworkManager auto-enable CLAT for [[ipv6|IPv6]]-mostly networks (2024); Windows 11 ships {{four-six-four-xlat|464XLAT}} CLAT.** The {{os|OS}} support is finally there.'
						},
						{
							type: 'narrative',
							title: 'The Long Tail — and Why It May Be Permanent',
							text: `**Geoff Huston ({{apnic|APNIC}}) projected in October 2024** that linear extrapolation puts [[ipv6|IPv6]] transition completion around **late 2045** — and warned that v4/v6 coexistence may now be a steady state rather than a transition. The remaining hurdle is enterprise: most large companies still run [[ip|IPv4]]-only internal networks. New infrastructure is built v6-first; old [[ip|IPv4]] islands age out slowly.

The 2024 {{rfc-doc|RFC}} backlog tells the story of where [[ipv6|IPv6]] work is happening:
- **{{rfc-doc|RFC}} 9637 (August 2024)** added \`3fff::/20\` as a second [[ipv6|IPv6]] documentation prefix on top of \`2001:db8::/32\`, large enough to model multi-{{autonomous-system|AS}} networks.
- **RFC 9673 (October 2024)** finally relaxed {{hop|Hop}}-by-{{hop|Hop}} Options handling so HBH options are deployable on real router silicon.
- **RFC 9602 (2024)** reserved \`5f00::/16\` for SRv6 SIDs.

**{{apple|Apple}} iCloud Private Relay** (October 2021 onward) prefers [[ipv6|IPv6]] egress when {{aaaa-record|AAAA}} exists; pure [[ip|IPv4]]-only enterprise networks frequently break Private Relay — the documented response is per-network opt-out, which is its own forcing function for [[ipv6|IPv6]] deployment in enterprises that want {{apple|Apple}} device compatibility.

The "everyone gets this wrong" detail: [[ipv6|IPv6]]'s mandatory-to-implement [[ipsec|IPsec]] requirement was **demoted to optional in [[rfc:6434|RFC 6434]] (2011)** — a frequent source of "but [[ipv6|IPv6]] is encrypted by default!" myth. [[ipv6|IPv6]] is not encrypted by default. The {{encryption|encryption}} story for [[ipv6|IPv6]] is the same as for [[ip|IPv4]]: [[tls|TLS]] at the application layer.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Internet_map_1024.jpg/500px-Internet_map_1024.jpg',
							alt: 'A 2005 visualisation of the global internet topology with each line a BGP peering relationship.',
							caption:
								"A snapshot of the global internet, each line a [[bgp|BGP]] {{peering|peering}} relationship. The 28-year migration of this graph to [[ipv6|IPv6]] addressing finally crossed **50.1%** of {{google|Google}}'s measured user base on **28 March 2026**. The driver was not advocacy; it was *economics* — {{aws|AWS}}'s **$0.005/{{ip-address|IP}}/hour charge from 1 February 2024** did more for v6 deployment in a year than two decades of standards work.",
							credit: 'Image: The Opte Project / Wikimedia Commons, CC BY 2.5'
						}
					]
				},
				{ kind: 'frontier', id: 'ipv6-50-percent' },
				{ kind: 'protocol', id: 'ipv6' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'rpki-aspa',
			title: 'RPKI + ASPA',
			synopsis:
				'{{rpki|Cryptographic BGP}}, finally arriving — 50% of [[ip|IPv4]] covered May 2024.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Orange España, 3 January 2024: a threat actor using infostealer-harvested credentials logged in to {{ripe-ncc|RIPE NCC}} and edited ROAs to make legitimate prefixes {{rpki|RPKI}}-invalid. The first major outage caused by {{rpki|RPKI}} being too strict against an attacker-modified {{roa|ROA}} set. Lesson: enforce 2FA on RIR portals.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Decade-Long Slow Win',
							text: `[[bgp|BGP]] without origin authentication is the architectural reason every [[bgp|BGP]] hijack of the last 25 years was possible: [[outage:as-7007-1997|AS 7007]], [[outage:pakistan-youtube-2008|Pakistan/YouTube]], [[outage:china-telecom-2010|China Telecom 2010]], and the 2022 KlaySwap/Amazon Route 53 hijack all worked because no router could verify whether an {{autonomous-system|AS}} was entitled to announce a prefix. (Facebook's 2021 outage, by contrast, was a self-inflicted route *withdrawal* — not a hijack.)

**{{rpki|RPKI}}** (Resource {{public-key|Public Key}} Infrastructure) lets prefix-holders {{mqtt-publish|publish}} cryptographically signed Route Origin Authorisations declaring "{{autonomous-system|AS}} X is authorised to originate prefix Y." **{{rov|ROV}}** ({{rov|Route Origin Validation}}) is the [[bgp|BGP]] router check that drops or de-preferences advertisements that fail {{rpki|RPKI}} validation.

**{{rpki|RPKI}} {{roa|ROA}} coverage crossed 50% of [[ip|IPv4]] prefixes for the first time in May 2024** ([[ipv6|IPv6]] had crossed earlier, in late 2023). By December 2024: **~54% of [[ip|IPv4]] and [[ipv6|IPv6]] prefixes {{roa|ROA}}-covered, ~74% of [[ip|IP]] traffic destined to {{roa|ROA}}-covered networks** (MANRS / Kentik). The coverage curve is finally accelerating.`
						},
						{
							type: 'narrative',
							title: 'The 2024-2025 Standards Cleanup',
							text: `Several long-pending RFCs landed:

**{{rfc-doc|RFC}} 9582 (May 2024)** replaced {{rfc-doc|RFC}} 6482 as the {{roa|ROA}} profile (Snijders, Maddison, Lepinski, Kong, Kent — clarifies X.509 extensions, fixes errata, mandates canonicalisation).

**RFC 9687 (November 2024)** added the **\`SendHoldTimer\`** to the [[bgp|BGP]] FSM — closing the "[[bgp|BGP]] zombie" failure mode where a [[tcp|TCP]] socket stops draining and withdrawn routes linger forever.

**RFC 9774 (May 2025)** formally **deprecates \`AS_SET\` and \`AS_CONFED_SET\`** with a normative MUST NOT — speakers must "treat-as-withdraw" any {{bgp-update|UPDATE}} containing them.

**{{aspa|ASPA}} ({{autonomous-system|Autonomous System}} Provider Authorization)** is *still* an Internet-Draft as of May 2026 — \`draft-ietf-sidrops-aspa-verification-25\` (Oct 2025) and \`draft-ietf-sidrops-aspa-profile-26\` (Apr 2026). {{cisco|Cisco}} ran an **Early Field Trial of {{aspa|ASPA}} on {{ios-xr|IOS-XR}} in 2025**; OpenBGPD, BIRD 2.16+, and Routinator have {{aspa|ASPA}} support. SIDROPS chair Job Snijders has signalled the WG is "close to last call."

{{aspa|ASPA}} closes the route-leak hole that origin validation alone cannot fix — where {{autonomous-system|AS}} X *does* legitimately originate the prefix, but its upstream then leaks the route through an unintended path.`
						},
						{
							type: 'callout',
							title: 'BGPsec is dead',
							text: '**BGPsec ([[rfc:8205|RFC 8205]], 2017)** has **negligible deployment** — the combinatorial signature size, lack of router silicon support, and zero incremental-deployment benefit have left it almost entirely unimplemented. {{aspa|ASPA}} and [[rfc:9234|RFC 9234]] ([[bgp|BGP]] Roles + OTC) ate its lunch. The lesson: a security protocol that requires every participant to deploy before any of them benefit will not get deployed. {{rpki|RPKI}} + {{rov|ROV}} + {{aspa|ASPA}} wins because each step is independently useful.'
						},
						{
							type: 'narrative',
							title: "When RPKI Backfires, And When It Doesn't",
							text: `**Orange España, 3 January 2024**: a threat actor "Snow" used infostealer-harvested credentials to log in to Orange Spain's {{ripe-ncc|RIPE NCC}} account and edited ROAs to make legitimate prefixes {{rpki|RPKI}}-invalid — the first major outage caused by **{{rpki|RPKI}} being too strict against an attacker-modified {{roa|ROA}} set**. Lesson: enforce 2FA on RIR portals. The vulnerability is not in {{rpki|RPKI}}; it is in the human-facing authentication surface around {{rpki|RPKI}}.

**{{cloudflare|Cloudflare}} 1.1.1.1 hijack (27 June 2024)**: Brazilian {{isp|ISP}} Eletronet (AS267613) announced **1.1.1.1/32**. {{cloudflare|Cloudflare}}'s {{roa|ROA}} set maxLength /24, so the more-specific /32 announcement **was {{rpki|RPKI}}-invalid** — yet Tier-1 {{peer|PEER}} 1 (AS1031) accepted and propagated it anyway. **300 networks in 70 countries lost 1.1.1.1.** The lesson: RPKI only helps if networks actually enforce Route Origin Validation (ROV) and drop invalid routes — most still don't.

The regulatory layer is moving too. **The {{fcc|FCC}} issued a Notice of Proposed Rulemaking on [[bgp|BGP]] Routing Security in June 2024** — the first US federal proposal to compel the nine largest {{bias-attack|BIAS}} providers (AT&T, Comcast, Verizon, T-Mobile, etc.) to file [[bgp|BGP]] Routing Security Risk Management Plans and quarterly {{rpki|RPKI}} reports. As of March 2024, only **~22% of US-originated routes had ROAs**.

**BIRD 3.0 (January 2025)** was the first stable multithreaded [[bgp|BGP]] implementation, scaling to 5,000+ peers; BIRD 2.16 (December 2024) shipped {{aspa|ASPA}} support. The [[ip|IPv4]] DFZ exceeded **~1.0 million prefixes** by late 2025; Geoff Huston's vantage point reported ~1.2M prefixes seen by 1,026 [[bgp|BGP]] peers at the start of 2026.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Arpanet_logical_map%2C_march_1977.png/500px-Arpanet_logical_map%2C_march_1977.png',
							alt: 'ARPANET logical map, March 1977 — the predecessor topology to BGP.',
							caption:
								'The {{arpanet|ARPANET}} in 1977 — a network small enough to print on one page and route through trust. The {{rpki|RPKI}} + {{rov|ROV}} + {{aspa|ASPA}} cleanup happening in 2024–2026 is finally giving [[bgp|BGP]] the *cryptographic* security guardrails its 1989 Two-Napkin Protocol sketch never had — half a century after the original design and 30 years into the commercial internet.',
							credit: 'Image: DARPA / public domain, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'frontier', id: 'rpki-rov-50-percent' },
				{ kind: 'protocol', id: 'bgp' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'ultra-ethernet',
			title: 'Ultra Ethernet',
			synopsis:
				'Replacing RoCEv2 in {{ai|AI}} training fabrics — [[ethernet|Ultra Ethernet]] Specification 1.0 published 11 June 2025.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Scaling 1M GPUs with traditional pluggable optics would consume ~180 MW of power for the optics alone. That is why {{nvidia|NVIDIA}} pivoted to co-packaged optics in Quantum-X Photonics and {{spectrum|Spectrum}}-X Photonics.',
					attribution: 'Jensen Huang argument, Computex 2024'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A New Transport for AI Datacenters',
							text: `Training a large language model requires **hundreds of thousands of GPUs talking to each other at terabits per second** with microsecond {{tail-latency|tail latency}}. The dominant transport — **RoCEv2** (RDMA over Converged [[ethernet|Ethernet]]) — was designed for HPC clusters of a few thousand nodes and shows its age at GPT-scale: {{head-of-line-blocking|head-of-line blocking}}, congestion-control issues, and operational complexity.

The **Ultra [[ethernet|Ethernet]] Consortium** was founded **19 July 2023** under the {{linux|Linux}} Foundation by **AMD, Arista, {{broadcom|Broadcom}}, {{cisco|Cisco}}, Eviden (Atos), HPE, {{intel|Intel}}, {{meta|Meta}}, and {{microsoft|Microsoft}}**. **{{nvidia|NVIDIA}} joined later** despite its InfiniBand allegiance. By mid-2025: 97+ members.

**{{uec|UEC}} Specification 1.0 was published 11 June 2025** — ~560 pages, the first major ground-up rethink of how [[ethernet|Ethernet]] carries RDMA traffic. Defines **Ultra [[ethernet|Ethernet]] Transport (UET)**: packet spraying with {{multipath|multipath}}, selective {{retransmission|retransmission}}, in-network telemetry-driven {{congestion-control|congestion control}}, optional credit-based {{flow-control|flow control}}, ephemeral/{{connectionless|connectionless}} transport state for millions of endpoints.`
						},
						{
							type: 'narrative',
							title: 'What RoCEv2 Looks Like at GPT Scale',
							text: `**RoCEv2** encapsulates InfiniBand transport in [[udp|UDP]]/[[ip|IP]]/[[ethernet|Ethernet]] ([[udp|UDP]] port 4791). It is what **{{meta|Meta}} runs on its 24,000-{{gpu|GPU}} clusters to train Llama 3** ({{sigcomm-conf|SIGCOMM}} 2024 paper). The paper details job-aware traffic engineering and the operational decision to abandon **DCQCN** (Datacenter Quantized Congestion {{notification|Notification}}) in favor of **collective-library-driven receiver {{pacing|pacing}}** — moving {{congestion-control|congestion control}} out of the network and into the {{ai|AI}} framework.

{{uec|UEC}}'s design comes from collective lessons of running RoCEv2 at this scale: per-flow ECMP collapsing onto hot links, congestion-control oscillations, the cost of {{stateful|stateful}} per-connection transport in a fabric with 100k+ endpoints. Ultra [[ethernet|Ethernet]]'s **packet spraying** spreads flows across all paths automatically; **selective {{retransmission|retransmission}}** keeps a single dropped packet from stalling a collective; **{{connectionless|connectionless}} transport state** lets a single switch track millions of endpoints without per-flow tables.

**AMD's Pensando Pollara 400 GbE is the first {{uec|UEC}}-compliant {{nic|NIC}}**, announced June 2025, deployed at Oracle Cloud.`
						},
						{
							type: 'callout',
							title: 'Switch silicon is moving fast',
							text: '**{{broadcom|Broadcom}} Tomahawk 6 (102.4 Tbps single-chip)** shipped June 2025; **Tomahawk 6-Davisson with co-packaged optics** shipped October 2025 — a single chip can drive 64×1.6T, 128×800G, 256×400G, or 512×200G ports. **{{nvidia|NVIDIA}} {{spectrum|Spectrum}}-X**, announced Computex 2023 and deployed by xAI Colossus, {{microsoft|Microsoft}}, and CoreWeave, reportedly delivers **~95% effective throughput vs ~60% on best-effort [[ethernet|Ethernet]]** for {{ai|AI}} workloads. **{{spectrum|Spectrum}}-X1600 (102.4 Tbps)** is expected 2H 2026.'
						},
						{
							type: 'narrative',
							title: 'IEEE 802.3 — The Underlying Speed Bumps',
							text: `**{{ieee-802-15-4|IEEE}} 802.3df-2024 (800 GbE)** was approved 16 February 2024 and published March 2024. **{{ieee-802-15-4|IEEE}} P802.3dj (1.6 TbE at 200 Gb/s/lane PAM-4)** passed its 3rd Working Group recirculation ballot **16 December 2025 with 87% approval** — expected ratified 2026.

The Jensen Huang argument: scaling 1M GPUs with traditional pluggable optics would consume **~180 MW** of power for the optics alone. That is why {{nvidia|NVIDIA}} pivoted to **co-packaged optics** in Quantum-X Photonics and {{spectrum|Spectrum}}-X Photonics (unveiled at GTC in March 2025) — the optics moves into the switch package itself, eliminating the per-port pluggable transceiver and its power overhead.

**{{google|Google}} Jupiter** ({{sigcomm-conf|SIGCOMM}} 2022 "Jupiter Evolving") moved from a Clos with electrical spine to a **direct-{{mqtt-connect|connect}} mesh of aggregation blocks via MEMS Optical Circuit Switches with SDN** — yielding **5× speed/capacity, 30% lower CapEx, 41% lower power**, supporting >13 Pb/s of bisection {{bandwidth|bandwidth}} as of 2024.

The commercial scale: **[[ethernet|Ethernet]] switching market exceeded $30B in 2021**; Dell'Oro forecasts ~$80B over five years driven by {{ai|AI}} fabrics — the *commercial* reason {{uec|UEC}} matters even more than the technical one. The architectural significance is that {{ai|AI}} training is now important enough to drive a new datacenter transport — the same kind of pressure that produced [[ethernet|Ethernet]] in 1973 for office networking, [[tcp|TCP/IP]] in 1981 for inter-network research, and [[quic|QUIC]] in 2012 for the modern web.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Eindr%C3%BCcke_von_der_COMPUTEX_2024_%28_%E6%9E%81%E5%AE%A2%E6%B9%BEGeekerwan%29_22.png/500px-Eindr%C3%BCcke_von_der_COMPUTEX_2024_%28_%E6%9E%81%E5%AE%A2%E6%B9%BEGeekerwan%29_22.png',
							alt: 'NVIDIA GB200 NVL72 GPU rack on display at COMPUTEX 2024.',
							caption:
								'The **{{nvidia|NVIDIA}} GB200 NVL72** Blackwell-architecture rack on display at COMPUTEX 2024 — the kind of {{ai|AI}}-training endpoint that drives the **[[frontier:ultra-ethernet-1-0|Ultra Ethernet Consortium]] 1.0** specification (published 11 June 2025). Hundreds of thousands of GPUs talking at terabits per second with microsecond {{tail-latency|tail latency}}; 650 Group estimates **91% of {{ai|AI}} workloads on [[ethernet|Ethernet]] by 2029**.',
							credit: 'Photo: Geekerwan / Wikimedia Commons, CC BY-SA 4.0'
						}
					]
				},
				{ kind: 'frontier', id: 'ultra-ethernet-1-0' },
				{ kind: 'frontier', id: 'ethernet-800g' },
				{ kind: 'protocol', id: 'ethernet' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'wifi-7-and-8',
			title: 'Wi-Fi 7 and 8',
			synopsis:
				"[[wifi|Wi-Fi]] 7's 320 MHz, then [[wifi|Wi-Fi]] 8's 25% better {{tail-latency|tail latency}} target — and the politics of 6 GHz.",
			slots: [
				{
					kind: 'pull-quote',
					text: '"[[wifi|Wi-Fi]]" was chosen by Interbrand from 10 candidate names and does NOT stand for "Wireless Fidelity" — that was a tagline retrofitted briefly by the WECA board and dropped. The yin-yang logo is also Interbrand\'s work.',
					attribution: 'Phil Belanger, 2005 Boing Boing confession'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Wi-Fi 7 Shipped',
							text: `**[[wifi|Wi-Fi]] Alliance launched [[wifi|Wi-Fi]] CERTIFIED 7 on 8 January 2024**; the {{ieee-802-15-4|IEEE}} 802.11be amendment was approved 26 September 2024 and **published 22 July 2025**. Headline features: **320 MHz channels, 4096-{{qam|QAM}}, Multi-Link Operation ({{mlo|MLO}}), preamble puncturing, Multi-RU.** Theoretical peak ~46 Gb/s; ~30 Gb/s required by the PAR.

**583 million [[wifi|Wi-Fi]] 7 devices shipped in 2025**; ABI projects 117.9 million [[wifi|Wi-Fi]] 7 enterprise APs in 2026 (up from 26.3M in 2024). The [[wifi|Wi-Fi]] Alliance reports **3.9 billion [[wifi|Wi-Fi]] devices forecast to ship in 2025** for a cumulative 48.8 billion lifetime.

**Multi-Link Operation ({{mlo|MLO}})** is the feature that matters most for ordinary users. A single connection can use 2.4, 5, and 6 GHz bands simultaneously, switching whichever is least congested per packet. {{tail-latency|Tail latency}} on a busy [[wifi|Wi-Fi]] network — the 99th-percentile delay that made video calls stutter and games lag — used to spike into hundreds of milliseconds when many devices contended. With {{mlo|MLO}}, a frame can be sent on whichever band is free; the median and tail both improve.`
						},
						{
							type: 'narrative',
							title: 'Wi-Fi 8 — A Reliability Upgrade, Not a Speed Upgrade',
							text: `**[[wifi|Wi-Fi]] 8 / 802.11bn — Ultra High Reliability** is explicitly **NOT a peak-speed upgrade**: same bands as [[wifi|Wi-Fi]] 7, same 320 MHz max, same ~46 Gb/s {{phy|PHY}} peak.

PAR objectives: **+25% throughput at given SINR, −25% 95th-percentile {{latency|latency}}, −25% MPDU loss across {{bss-coloring|BSS}} transitions**.

Headline features: **Multi-{{access-point|AP}} Coordination (Co-BF, Co-SR, Co-{{tdma|TDMA}}), Seamless Roaming Domain (SMD), Enhanced Long Range PPDU, Distributed Resource Units, Non-Primary Channel Access**. The pattern across all of these: optimise the existing speed budget for **{{tail-latency|tail latency}} and reliability** instead of headline throughput.

**[[wifi|Wi-Fi]] 8 is targeted for ratification September 2028**. As of the March 2026 plenary, TGbn was at Draft 1.3, with Draft 2.0 ballot targeted for May 2026 (Antwerp). **{{broadcom|Broadcom}} announced a [[wifi|Wi-Fi]] 8 chipset in October 2025**; **ASUS demoed a draft router at {{ces-show|CES}} 2026**; consumer launches expected mid-to-late 2026. A "[[wifi|Wi-Fi]] 9" successor study group started January 2026.`
						},
						{
							type: 'callout',
							title: 'The 6 GHz political fight',
							text: '**The US {{fcc|FCC}} freed 1,200 MHz on 23 April 2020**; on **23 February 2024** the {{fcc|FCC}} OET approved **seven {{afc|AFC}} system operators** (Qualcomm, Federated Wireless, Sony, Comsearch, [[wifi|Wi-Fi]] Alliance Services, Wireless Broadband Alliance, {{broadcom|Broadcom}}) for commercial Standard-Power {{afc|AFC}} operation. **First {{afc|AFC}}-certified [[wifi|Wi-Fi]] 7 {{access-point|AP}} (RUCKUS R770) was certified 16 April 2024.** But on **12 November 2025** the EU Radio {{spectrum|Spectrum}} Policy Group recommended assigning the **upper 6 GHz band (6585-7125 MHz) to mobile/5G**, holding 6425-6585 MHz pending {{wrc|WRC}}-27 — **effectively closing the upper band to [[wifi|Wi-Fi]] in the EU for the medium term**. The [[wifi|Wi-Fi]] Alliance "strongly disagrees."'
						},
						{
							type: 'narrative',
							title: 'The Folklore — Wi-Fi Was Never an Acronym',
							text: `Two pieces of [[wifi|Wi-Fi]] history that everyone gets wrong.

**"[[wifi|Wi-Fi]]" was chosen by Interbrand from 10 candidate names and does NOT stand for "Wireless Fidelity"** — that was a tagline retrofitted briefly by the WECA board and dropped. Phil Belanger's 2005 Boing Boing confession is the canonical source. The yin-yang logo is also Interbrand's work.

**The CSIRO patent windfall**: Australia's CSIRO held US Patent 5,487,069 (granted 23 January 1996) on radio-astronomy-derived OFDM/{{multipath|multipath}}. After Buffalo lost in 2005, CSIRO settled with 14 majors in 2009 (~US$205M) and again with AT&T/Verizon/T-Mobile in 2012 (~US$220M) — **lifetime royalties reportedly ~US$430M+, near US$1 billion by some industry estimates**. Patents expired 30 November 2013. Most of [[wifi|Wi-Fi]]'s mid-2010s deployment happened in the post-CSIRO-royalty era.

The 2024 security news: **{{ssid|SSID}} Confusion ({{cve|CVE}}-2023-52424, May 2024)**: Gollier & Vanhoef (WiSec 2024) showed the {{ssid|SSID}} is not part of the 4-way-{{handshake|handshake}} key derivation in many configurations, allowing downgrade-style trickery against any client {{os|OS}} — the most important new [[wifi|Wi-Fi]] flaw since FragAttacks.

The 5.9 GHz transition: **{{fcc|FCC}}'s Second Report and Order ({{fcc|FCC}} 24-106, November 2024)** finalised C-V2X for ITS and **mandated retirement of DSRC by 14 December 2026** — ending the 1999 DSRC monopoly that 802.11p was built on.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/802.11_MAC_Frame.svg/500px-802.11_MAC_Frame.svg.png',
							alt: 'The 802.11 Wi-Fi MAC frame format diagram.',
							caption:
								'The **[[wifi|802.11]] {{mac-address|MAC}} frame** has carried [[wifi|Wi-Fi]] since 1997. [[wifi|Wi-Fi]] 7 (802.11be, ratified 22 July 2025) adds 320 MHz channels, 4096-{{qam|QAM}}, and {{mlo|MLO}}; [[wifi|Wi-Fi]] 8 (802.11bn, targeted September 2028) keeps the same peak speed and squeezes for **+25% throughput at given SINR, −25% 95th-percentile {{latency|latency}}, −25% MPDU loss across {{bss-coloring|BSS}} transitions**. Headline numbers are over; tail-{{latency|latency}} consistency is the new frontier.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
						}
					]
				},
				{ kind: 'frontier', id: 'wifi-7-ratified' },
				{ kind: 'protocol', id: 'wifi' }
			]
		}
	]
};
