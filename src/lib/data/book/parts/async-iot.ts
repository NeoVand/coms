/**
 * Part VI — Async / IoT.
 *
 * Decoupled, message-oriented protocols for sensors, microservices,
 * and event streams. Multi-section chapters drawn from the per-protocol
 * research files in /research with citation-backed dates and deployments.
 */

import type { BookPart } from '../types';

export const asyncIot: BookPart = {
	id: 'async-iot',
	title: 'Async / IoT',
	label: 'VII',
	description:
		'Decoupled, {{pub-sub|message-oriented}} protocols for sensors, microservices, and event streams — [[mqtt|MQTT]], [[amqp|AMQP]], [[kafka|Kafka]], [[coap|CoAP]].',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'mqtt',
			title: 'MQTT',
			synopsis:
				'Sensors, satellites, and [[mqtt|2-byte publish overhead]] — designed in 1999 to instrument oil pipelines.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[mqtt|MQTT]] was drafted in 1999 by Andy Stanford-Clark of {{ibm|IBM}} and Arlen Nipper of Arcom Control Systems to instrument Phillips 66 oil pipelines over a brand-new VSAT satellite link. The 2-byte fixed header was not aesthetic — it was a budget item.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Designed for the Worst Network on Earth',
							text: `[[mqtt|MQTT]] (Message Queuing Telemetry Transport) was drafted in early 1999 by **Andy Stanford-Clark ({{ibm|IBM}} Hursley)** and **Arlen Nipper (Arcom Control Systems)** to instrument **Phillips 66 oil pipelines** over a brand-new VSAT satellite link.

The internal name was the "Argo Lightweight On The Wire Protocol." Version 2 (later 1999) was renamed **MQ Integrator Pervasive Device Protocol (MQIpdp)** before settling on [[mqtt|MQTT]] in v3 (2000). The "MQ" prefix is a **vestige of {{ibm|IBM}} MQSeries** ("Message Queue") even though [[mqtt|MQTT]] does not implement queues. OASIS formally treats "[[mqtt|MQTT]]" as the protocol name itself (not an acronym) since 2013.

The constraint was brutal: kilobits-per-second satellite links priced per byte, devices that ran for years on a single battery, network drops measured in hours. **The Fixed Header is 2 bytes**; the smallest possible Control Packet (e.g. PINGREQ) is 2 bytes total — the per-byte thrift that makes [[mqtt|MQTT]] viable on satellite/cellular IoT.`
						},
						{
							type: 'narrative',
							title: 'How It Works — and the Sparkplug ISO Standard',
							text: `[[mqtt|MQTT]] defines three quality-of-service levels (at-most-once, at-least-once, exactly-once) that let the application trade reliability for {{bandwidth|bandwidth}}. A persistent **session** survives disconnections — when a sleeping sensor wakes up an hour later and reconnects, the broker delivers any messages it missed.

The architecture is **{{mqtt-publish|publish}}-{{mqtt-subscribe|subscribe}}** through a central **broker**. Sensors {{mqtt-publish|publish}} to topics like \`farm/north/soil-moisture\`; subscribers (a dashboard, an irrigation controller) get every message published to topics matching their subscription. Producers and consumers do not need to know about each other.

[[mqtt|MQTT]] is also the historical template for two patterns now considered universal: **{{last-will|Last Will}} & Testament** (a message the broker sends on the device's behalf when it dies) and **retained messages** (the latest value on a {{topic|topic}}, kept by the broker for late subscribers). Both were invented in 1999.

{{ibm|IBM}} released **[[mqtt|MQTT]] 3.1 royalty-free in 2010**; **[[mqtt|MQTT]] 3.1.1** was approved by OASIS on **29 October 2014** (editors Andrew Banks and Rahul Gupta, {{ibm|IBM}}); **{{iso-iec|ISO/IEC}} 20922** was added in 2016; **[[mqtt|MQTT]] 5.0** was published **7 March 2019** (137 pages vs 81 for 3.1.1).

**Sparkplug 3.0** (Cirrus Link / Eclipse) was ratified as **{{iso-iec|ISO/IEC}} 20237:2023** on 7 November 2023 — the first time an [[mqtt|MQTT]] *application* layer became an international standard. **Sparkplug 4.0** is in development with the Eclipse working group as of late 2025.`
						},
						{
							type: 'callout',
							title: 'Facebook Messenger has used MQTT since 2011',
							text: '**Facebook Messenger has used [[mqtt|MQTT]] since 2011** — chosen with "just a few weeks until launch" by Lucy Zhang\'s team — to drop perceived send {{latency|latency}} from seconds to "hundreds of milliseconds" on mobile. Tesla\'s vehicles use [[mqtt|MQTT]] to phone home. Ring doorbells, {{aws|AWS}} IoT Core (until 16 August 2023, when {{google|Google}} Cloud IoT Core was retired), the {{matter|Matter}} smart-home standard, all run on [[mqtt|MQTT]] or its variants.'
						},
						{
							type: 'narrative',
							title: 'The 2024 CVE Wave and the QUIC Frontier',
							text: `2024 brought a {{cve|CVE}} wave: **{{cve|CVE}}-2024-10525** (libmosquitto {{oob|OOB}} read on crafted SUBACK; affects 1.3.2-2.0.18; fixed in 2.0.19, October 2024) plus a 2024 broker double-free in bridge {{topic|topic}} remapping. The lesson is the same one [[mqtt|MQTT]] 5.0 already embedded — the protocol surface is intentionally small but the implementations are intricate.

**{{google|Google}} Cloud IoT Core was retired 16 August 2023** — the deprecation still drives 2024-2026 architecture decisions and migrations to {{aws|AWS}} IoT, {{azure|Azure}} Event Grid [[mqtt|MQTT]], EMQX, and HiveMQ. The lesson for IoT operators: hyperscaler-managed IoT services have higher churn risk than the protocol itself.

**[[mqtt|MQTT]]-over-[[quic|QUIC]]** has *no* ratified OASIS standard as of May 2026; **EMQX 5.x ships production support** and is "preparing a draft proposal" through the OASIS [[mqtt|MQTT]] TC. The frontier is vendor-led, not standardised. A new [[mqtt|MQTT]]-SN OASIS working draft was uploaded **1 May 2025** by chair Ian Craggs.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/MQTT_protocol_example_without_QoS.svg/500px-MQTT_protocol_example_without_QoS.svg.png',
							alt: 'MQTT publish-subscribe diagram — sensor publishes to a topic on a broker; subscriber receives.',
							caption:
								'**[[mqtt|MQTT]]** {{pub-sub|publish/subscribe}} in one picture: a sensor publishes to {{topic|topic}} `farm/north/soil-moisture`; the broker forwards to every subscriber. **2-byte fixed header**, smallest control packet (PINGREQ) is 2 bytes total. Designed in 1999 by Andy Stanford-Clark and Arlen Nipper to instrument oil pipelines over kilobit-per-second satellite — the per-byte thrift makes it the protocol underneath every Tesla, Ring doorbell, Facebook Messenger (since 2011), and ~5B IoT devices.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
						}
					]
				},
				{ kind: 'protocol', id: 'mqtt' },
				{ kind: 'simulation', protocolId: 'mqtt' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'amqp',
			title: 'AMQP',
			synopsis:
				'[[amqp|Banking-grade messaging]] — JPMorgan Chase, John O\'Hara, and "two billion dollars in collateral calls before he could blink."',
			slots: [
				{
					kind: 'pull-quote',
					text: "If you read [[amqp|AMQP]] 1.0, it's called Advanced Message Queue Protocol, but there are no queues in it.",
					attribution: 'Alexis Richardson, March 2025'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Wire-Level Banking Plumbing',
							text: `[[amqp|AMQP]] (Advanced Message Queuing Protocol) was originated in **2003 by John O'Hara at JPMorgan Chase in London**. The trigger story O'Hara told at QCon London 2025 was watching the first message in a SWIFT-derivatives gateway "make two billion dollars in collateral calls before he could blink."

The commercial driver, per Alexis Richardson (Rabbit Technologies founder, March 2025): *"to bypass paying for {{ibm|IBM}}'s MQ — you had to buy a license to use the protocol because it wasn't an open protocol."* JPMorgan didn't want to pay extortionate per-{{cpu|CPU}} licensing for messaging.

The first mission-critical [[amqp|AMQP]] deployment (mid-2006) "served 2,000 users and processes 300 million messages per day" — published in O'Hara's 2007 {{acm-org|ACM}} Queue paper (DOI 10.1145/1255421.1255424).`
						},
						{
							type: 'narrative',
							title: 'AMQP 0-9-1 Versus AMQP 1.0 — Two Different Protocols',
							text: `**[[amqp|AMQP]] 0-9-1 and [[amqp|AMQP]] 1.0 are completely different protocols sharing a name.** 0-9-1 prescribes exchanges/queues/bindings. 1.0 is a symmetric {{peer-to-peer|peer-to-peer}} transfer protocol with **zero queues defined in the spec**.

[[amqp|AMQP]] 0-9-1 has **exchanges** that route messages to **queues** based on routing keys (direct), patterns ({{topic|topic}}), header values (headers), or fanout {{broadcast|broadcast}}. **Durable queues** survive broker restarts. **Channels** multiplex multiple logical sessions over a single [[tcp|TCP]] connection. The wire format uses a literal **\`0xCE\` frame-end sentinel** byte (not a {{checksum|checksum}}).

[[amqp|AMQP]] 1.0 was released **30 October 2011**; OASIS-standardised **31 October 2012**; **{{iso-iec|ISO/IEC}} 19464:2014** in April 2014. [[amqp|AMQP]] 1.0 dropped the sentinel and uses an authoritative \`SIZE\` field. [[amqp|AMQP]] itself adds no application-level {{checksum|checksum}} and relies entirely on [[tcp|TCP]]'s.

The 0-9-1 working group was dead by 2010 — Pieter Hintjens (iMatix CEO) circulated *"What is wrong with [[amqp|AMQP]] (and how to fix it)"* in 2008, walked out, and built **ZeroMQ** instead. Hintjens died by voluntary euthanasia on **4 October 2016**; his final blog post was titled *"A Protocol for Dying."*`
						},
						{
							type: 'callout',
							title: 'RabbitMQ 4.0 made AMQP 1.0 a core protocol',
							text: '**RabbitMQ 4.0 GA (18 September 2024)** made [[amqp|AMQP]] 1.0 a *core* protocol — single Erlang process per session vs 15 in 3.13, peak throughput "more than double" 3.13.x. **Classic mirrored queues were fully removed** after deprecation since 2021. **Khepri** (Raft-based metadata store) is **default in RabbitMQ 4.2.0** and **mandatory in 4.3 (April 2026)** — Mnesia is removed. RabbitMQ 4.3 also added JMS-style queues with {{sql|SQL}} message selectors.'
						},
						{
							type: 'narrative',
							title: 'The Broadcom Acquisition, And Where AMQP Goes Now',
							text: `**{{broadcom|Broadcom}} acquired VMware in November 2023**; on **31 May 2024 the RabbitMQ team announced 3.12.x and older "will no longer receive patches through community support"** — non-paying users must upgrade. License remains MPL-2.0.

**{{microsoft|Microsoft}} {{azure|Azure}} Service Bus uses [[amqp|AMQP]] 1.0 as its primary protocol**; Service Bus over [[amqp|AMQP]]-[[websockets|WebSockets]] tunnels through [[tcp|TCP]]/443 to be "equivalent to [[amqp|AMQP]] 5671 connections." This is the dominant cloud-managed [[amqp|AMQP]] deployment by message volume.

The trade-off versus [[mqtt|MQTT]] remains operational complexity. An [[amqp|AMQP]] broker is a database — you size it, replicate it, monitor it. An [[mqtt|MQTT]] broker is closer to a router — {{stateless|stateless}} and small. Banks use [[amqp|AMQP]] for trade messaging, where {{exactly-once-delivery|exactly-once delivery}} and audit trails are non-negotiable. Microservice architectures use it for command queues and asynchronous task dispatch. Choose [[amqp|AMQP]] when transactions {{matter|matter}}; choose [[mqtt|MQTT]] when scale and simplicity {{matter|matter}}.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/RabbitMQ_%2848853375337%29.jpg/500px-RabbitMQ_%2848853375337%29.jpg',
							alt: 'RabbitMQ logo / branding shown at a conference.',
							caption:
								'**RabbitMQ** — the most-deployed [[amqp|AMQP]] broker on Earth. The 4.0 GA release (18 September 2024) made [[amqp|AMQP]] 1.0 a *core* protocol, doubled throughput over 3.13, and removed classic mirrored queues. RabbitMQ 4.3 (April 2026) makes **Khepri** (Raft metadata) mandatory — Mnesia is gone. The protocol is two decades old; the implementation churn around it has not slowed down.',
							credit: 'Photo: Wikimedia Commons / CC BY-SA 2.0'
						}
					]
				},
				{ kind: 'protocol', id: 'amqp' },
				{ kind: 'comparison', pairIds: ['mqtt', 'amqp'] }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'kafka',
			title: 'Kafka',
			synopsis:
				'[[kafka|A distributed commit log]] as architecture unit — {{linkedin|LinkedIn}}, 2010, named after Franz [[kafka|Kafka]] because "it\'s a system optimized for writing."',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Jay Kreps named [[kafka|Kafka]] after Franz [[kafka|Kafka]] because "it\'s a system optimized for writing" and he liked the writer. {{linkedin|LinkedIn}} now runs >7 trillion messages/day across 4,000+ brokers and ~7M partitions.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Log Is the Database',
							text: `[[kafka|Apache Kafka]] was built at {{linkedin|LinkedIn}} around 2010 by **Jay Kreps, Neha Narkhede, and Jun Rao**; named after **Franz [[kafka|Kafka]]** because, per Kreps on Quora, "it's a system optimized for writing" and he liked the writer. Open-sourced 2011; graduated from Apache Incubator **23 October 2012**.

The architectural insight, articulated by Jay Kreps in his essay *"The Log: What every software engineer should know about real-time data's unifying abstraction,"* is that **a distributed, append-only log is the right primitive for asynchronous communication at scale**.

A [[kafka|Kafka]] **{{topic|topic}}** is a partitioned log. Producers append records; consumers read them at their own pace, tracking their position by {{offset|offset}}. The log is **persistent** — records are not deleted when consumed, they age out by retention policy (often days or weeks). That persistence enables **event sourcing**, **{{stream-processing|stream processing}}**, **replay**, and **multiple independent consumer groups** reading the same log for different purposes.`
						},
						{
							type: 'narrative',
							title: 'Kafka 4.0 — The End of ZooKeeper',
							text: `**[[kafka|Kafka]] 4.0 (18 March 2025) removed ZooKeeper entirely** — the end of a 10-year migration that began with KIP-500 in 2019. **KRaft** ([[kafka|Kafka]] Raft metadata) is now the only metadata mode. KIP-848 (new {{consumer-rebalance|consumer rebalance}} protocol) GA shipped in the same release.

**KIP-848 cuts rebalance times by an order of magnitude**: 10 consumers and 900 partitions take **5 seconds with KIP-848 versus 103 seconds with the classic protocol**.

**[[kafka|Kafka]] 3.9 (6 November 2024)** made **Tiered Storage GA** (KIP-405) — letting brokers offload old segments to S3 while keeping recent data on local disk. **[[kafka|Kafka]] 4.1 (4 September 2025)** promoted **KIP-932 Queues for [[kafka|Kafka]]** (share groups — per-record acknowledgement, [[amqp|AMQP]]-like semantics) to preview, with GA in 4.2. [[kafka|Kafka]] is finally adding the per-message acknowledgement model [[amqp|AMQP]] has had for two decades.

**{{linkedin|LinkedIn}} runs the largest publicly disclosed deployment**: 100+ clusters, 4,000+ brokers, ~7M partitions, **>7 trillion messages/day** (2019 {{linkedin|LinkedIn}} engineering blog; floor figure, never updated downward).`
						},
						{
							type: 'callout',
							title: 'Diskless Topics — KIP-1150',
							text: '**KIP-1150 "Diskless Topics"** was accepted by the Apache [[kafka|Kafka]] community on **2 March 2026** with 9 binding votes — the formal blessing of the WarpStream / AutoMQ / Aiven Inkless / Bufstream architecture that uses S3 as primary storage. Brokers become {{stateless|stateless}} cache servers; the log lives in object storage. Cost can drop 10-20× for high-retention workloads. The five-year implications for the broker market are still being argued.'
						},
						{
							type: 'narrative',
							title: 'Confluent Was Acquired by IBM',
							text: `**Confluent acquired WarpStream on 9 September 2024**. **{{ibm|IBM}} agreed to acquire Confluent for $11B at $31/share on 8 December 2025**, deal closed **17 March 2026**. Apache [[kafka|Kafka]] itself remains independent at the ASF.

The wire-level details that {{matter|matter}} operationally: [[kafka|Kafka]]'s reference congestion and storage stack is **CRC32C (Castagnoli)** for batch integrity, **gzip/snappy/lz4/zstd** compression, and **\`sendfile(2)\` zero-copy** fetches from page cache — its raw throughput edge over [[amqp|AMQP]]/RabbitMQ.

2024-2025 {{cve|CVE}} wave: **{{cve|CVE}}-2024-56128** ({{scram|SCRAM}} skipped server-{{nonce|nonce}} check, fixed 3.7.2/3.8.1/3.9.0); **{{cve|CVE}}-2025-27817** ({{sasl|SASL}}/OAUTHBEARER arbitrary file read/SSRF, fixed 3.9.1/4.0.0); the older **{{cve|CVE}}-2023-25194** JndiLoginModule RCE in {{mqtt-connect|Connect}} [[rest|REST]] {{api|API}} was the field's Log4Shell moment.

**Datadog 8 March 2023** outage (~24h, multi-region) was triggered when an Ubuntu 22.04 systemd-networkd {{bgp-update|update}} deleted Cilium-managed [[ip|IP]] routes on Kubernetes nodes hosting Datadog's [[kafka|Kafka]]/ZK pipeline — the canonical "messaging tier ripple effect" post-mortem of the period.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Kafka_Job_Queue_Architecture_diagram.svg/500px-Kafka_Job_Queue_Architecture_diagram.svg.png',
							alt: 'Kafka job-queue architecture diagram — producers writing to topics, brokers persisting partitions, consumer groups reading.',
							caption:
								'A **[[kafka|Kafka]]** topology: producers fan out into partitioned topics on brokers; consumer groups read from offsets independently. **{{linkedin|LinkedIn}} runs >7 trillion messages/day** across this architecture. [[kafka|Kafka]] 4.0 (18 March 2025) removed ZooKeeper after a six-year migration; **Diskless Topics (KIP-1150)** accepted March 2026 blesses the S3-as-primary-storage architecture (WarpStream, AutoMQ, Aiven Inkless, Bufstream) that could drop cost 10-20× for high-retention workloads.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
						}
					]
				},
				{ kind: 'protocol', id: 'kafka' },
				{ kind: 'simulation', protocolId: 'kafka' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'coap',
			title: 'CoAP',
			synopsis:
				'[[coap|REST shrunk for microcontrollers]] — and one of the most-deployed-at-scale uses turned out to be Chinese smartphones.',
			slots: [
				{
					kind: 'pull-quote',
					text: "NETSCOUT's January 2019 scan found 388,344 publicly-reachable [[coap|CoAP]] endpoints, 81% in China, but most were not IoT devices — they were Chinese smartphones running the QLC Chain {{peer-to-peer|peer-to-peer}} crypto stack.",
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'HTTP at 32 kB of RAM',
							text: `[[coap|CoAP]] (Constrained Application Protocol) was specified by the **{{ietf|IETF}} CoRE WG** chartered March 2010; base spec **[[rfc:7252|RFC 7252]]** published **June 2014** (Shelby, Hartke, Bormann). The intellectual lineage runs through **Sensinode (Oulu, Finland)** — acquired by **ARM in 2013** — and the **University of Bremen TZI** group.

[[coap|CoAP]] is what you build when you want [[rest|REST]] semantics on a 32 kB microcontroller talking over a 50 kbps mesh radio. It looks like [[http1|HTTP]] from a distance — GET, POST, PUT, DELETE, status codes, URIs — but the wire format is binary and it runs over [[udp|UDP]] instead of [[tcp|TCP]].

**The fixed header is 4 bytes**; a minimal Empty [[coap|CoAP]] message is 4 bytes total; a typical GET sits at 10-20 bytes — designed for {{ieee-802-15-4|IEEE 802.15.4}} frames that fragment [[ipv6|IPv6]] packets into ~80-byte chunks. [[coap|CoAP]] defines **four message types** (CON/NON/{{ack|ACK}}/RST) and a **2-byte Message {{id-identifier|ID}}** for de-duplication, with **0-8 byte Tokens** for matching responses across messages. Default [[udp|UDP]] port is **5683**, CoAPS over {{dtls|DTLS}} is **5684**.`
						},
						{
							type: 'callout',
							title: 'EDHOC — three messages, ~100 bytes',
							text: '**EDHOC ([[rfc:9000|RFC 9528]], March 2024)** — the biggest constrained-IoT crypto news of the period — gives full mutual authentication + {{forward-secrecy|forward secrecy}} in **three messages totalling ~100 bytes** for static-DH credentials, vs **~700+ bytes for a {{dtls|DTLS}} 1.3 {{ecc|ECC}} {{handshake|handshake}}**. For battery-powered devices that translates to *years* of additional life. Companion: **OSCORE ([[rfc:8613|RFC 8613]])** wraps the [[coap|CoAP]] {{payload|payload}} in COSE_Encrypt0/{{aes|AES}}-{{ccm-mode|CCM}} and is end-to-end-secure even across [[coap|CoAP]]↔{{http-method|HTTP}} proxies.'
						},
						{
							type: 'narrative',
							title: 'Where CoAP Actually Runs — And the Matter Misconception',
							text: `The "everyone gets this wrong" fact: **{{matter|Matter}} does NOT use [[coap|CoAP]]** for its main payloads. {{matter|Matter}} has its own Message Reliability Protocol on [[udp|UDP]]/5540. [[coap|CoAP]] is only used in **{{thread|Thread}} network management** (the "[[coap|CoAP]]-TMF" {{wireshark|Wireshark}} dissector). Older blog posts saying "{{thread|Thread}} uses [[coap|CoAP]]" are imprecise.

**The QLC Chain surprise**: NETSCOUT's January 2019 scan found **388,344 publicly-reachable [[coap|CoAP]] endpoints, 81% in China**, but most were *not* IoT devices — they were **Chinese smartphones running the QLC Chain {{peer-to-peer|peer-to-peer}} crypto stack**. [[coap|CoAP]]'s largest-deployed-at-scale use case for years was, embarrassingly, {{peer-to-peer|P2P}} crypto on phones.

**[[coap|CoAP]] reflection/amplification DDoS** (Jan-Mar 2019) had a measured **34× amplification factor** (21-byte \`GET /.well-known/core\` → ~720-byte response). The often-cited "3,300×" figure is *not* [[coap|CoAP]] — that was memcached in Feb 2018. The [[coap|CoAP]] number is real but smaller than the press coverage suggested.`
						},
						{
							type: 'narrative',
							title: 'The Frontier — Pub/Sub, And Tooling Decay',
							text: `**\`draft-ietf-core-coap-pubsub\`** advanced from -15 (Oct 2024) to -19 (Mar 2026) — a [[coap|CoAP]] {{pub-sub|publish/subscribe}} broker is now stable and approaching {{rfc-doc|RFC}} publication, the WG's belated answer to [[mqtt|MQTT]] brokers. [[coap|CoAP]] catching up to [[mqtt|MQTT]]'s pattern shows how late the constrained-IoT ecosystem moves.

**The Copper (Cu) Firefox plugin is dead** (since Firefox 57 killed XUL extensions in Nov 2017); successor Copper4Cr requires a Chrome App, which {{google|Google}} deprecated — leaving most [[coap|CoAP]] debugging on {{cli|CLI}} clients (libcoap, aiocoap, coap-cli). The browser-based [[coap|CoAP]] debugger is gone; if you are debugging [[coap|CoAP]] in 2026, you are doing it in a terminal.

2024 {{cve|CVE}}: **{{cve|CVE}}-2024-0962** (libcoap OSCORE stack overflow); 2026: **{{cve|CVE}}-2026-29013** (libcoap OSCORE Appendix-B.2 CBOR unwrap {{oob|OOB}} read, disclosed 17 April 2026, CVSS 8.8). The [[coap|CoAP]] implementation surface is small but the cryptographic library underneath (libcoap, libcose) is intricate — the same pattern as every other small protocol with a serious crypto add-on.

[[coap|CoAP]] has not displaced [[mqtt|MQTT]] in IoT, mostly because pub/sub is a more useful pattern for sensor networks than request/response. But where you need RESTful resource semantics on a constrained device — {{matter|Matter}} (smart-home devices), {{thread|Thread}} mesh networks, OMA LwM2M (mobile device management) — [[coap|CoAP]] is the answer.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/500px-Arduino_Uno_-_R3.jpg',
							alt: 'An Arduino Uno R3 microcontroller board.',
							caption:
								'An **Arduino Uno** — the genre of constrained device [[coap|CoAP]] was designed for. 32 kB of flash, 2 kB of {{ram|RAM}}, single-digit-milliamp budget. Running [[http1|HTTP/1.1]] on this is impossible; running [[coap|CoAP]] is comfortable — **4-byte header**, minimal Empty message is 4 bytes total, typical GET 10-20 bytes. The trick is fitting [[rest|REST]] semantics under the {{ieee-802-15-4|802.15.4}} {{frame|frame}} limit while [[ipv6|IPv6]] {{fragmentation|fragmentation}} works for you.',
							credit: 'Photo: SparkFun Electronics / Wikimedia Commons, CC BY 2.0'
						}
					]
				},
				{ kind: 'protocol', id: 'coap' },
				{ kind: 'comparison', pairIds: ['mqtt', 'coap'] }
			]
		}
	]
};
