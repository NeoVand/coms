import type { SubcategoryStory } from './types';

export const iotMessagingStory: SubcategoryStory = {
	subcategoryId: 'iot-messaging',
	tagline:
		"Talking to billions of constrained devices over flaky links — when every byte and every milliwatt matters",
	sections: [
		{
			type: 'narrative',
			title: 'When the Device Is the Constraint',
			text: `Most networking protocols assume the endpoint is a server or a workstation: gigabytes of RAM, gigahertz of CPU, mains power, a stable Ethernet link. IoT inverts every one of those assumptions. The endpoint is a temperature sensor on a windmill, a soil-moisture probe in a field, a smart-meter on the side of a house, an asset tracker glued to a pallet. It has 32 KB of RAM, an 8-bit MCU, a CR2032 battery that must last seven years, and a cellular link that drops out every other day.\n\nTwo protocols dominate this world:\n\n- **[[mqtt|MQTT]]** (1999) is a publish/subscribe protocol designed at IBM for SCADA systems running over satellite links. The wire format is brutally compact (a 2-byte header for most messages); the topic model is hierarchical strings; quality-of-service is built in (QoS 0/1/2). A broker in the middle does all the work; devices speak only to the broker. By 2020 it powered Facebook Messenger, AWS IoT Core, and approximately every commercial IoT platform that exists.\n- **[[coap|CoAP]]** (2014) is "[[http1|HTTP]] for constrained devices." It maps GET/POST/PUT/DELETE onto [[udp|UDP]] datagrams, supports observe-style streaming for resource changes, and packs the protocol into a few hundred bytes of RAM. The mental model: REST on a sensor. The CoRE working group at the IETF designed it specifically so a web developer who knows HTTP can reason about IoT without learning a new paradigm.\n\nThey aren't direct competitors. MQTT centralizes on a broker; CoAP is peer-to-peer. MQTT runs on [[tcp|TCP]]; CoAP on [[udp|UDP]]. MQTT is great when many devices fan out events to many backends. CoAP is great when a controller polls or observes individual devices on a constrained-radio mesh (6LoWPAN, Thread).`
		},
		{
			type: 'pioneers',
			title: 'The IoT Messaging Architects',
			people: [
				{
					name: 'Andy Stanford-Clark',
					years: '–',
					title: 'Co-inventor of MQTT',
					org: 'IBM',
					contribution:
						"Co-invented [[mqtt|MQTT]] at IBM in 1999 with Arlen Nipper. The original use case was telemetry from oil pipelines monitored by VSAT (satellite) — a connection that was expensive, low-bandwidth, and routinely flaky. MQTT\\'s minimalism (2-byte header, no acks required at QoS 0) and its broker-mediated pub/sub model were direct responses to those constraints. Stanford-Clark also pioneered residential applications — \"MQTT in the home\" demos in the mid-2000s — that previewed the smart-home era."
				},
				{
					name: 'Arlen Nipper',
					years: '–',
					title: 'Co-inventor of MQTT',
					org: 'Arcom / Cirrus Link / IBM',
					contribution:
						'Co-invented [[mqtt|MQTT]] with Stanford-Clark from the Arcom (industrial computing) side. After leaving the original employer, Nipper started Cirrus Link Solutions and championed MQTT for industrial use cases (Sparkplug for OT/IT convergence). MQTT was donated to the Eclipse Foundation in 2011 and standardized at OASIS as MQTT 3.1.1 (2014), then ISO/IEC 20922.'
				},
				{
					name: 'Carsten Bormann',
					years: '–',
					title: 'CoAP Co-author / CoRE WG Chair',
					org: 'Universität Bremen',
					contribution:
						"Co-authored [[coap|CoAP]] ([[rfc:7252|RFC 7252]], 2014) and chaired the IETF CoRE (Constrained RESTful Environments) working group that shaped it. Also a primary author of 6LoWPAN, the IPv6-over-low-power-wireless adaptation that lets battery-powered nodes participate in standard IP. Bormann\\'s broader contribution is the *design philosophy* of constrained networking: a tight bound on per-message overhead and per-node memory at every step."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1999,
					title: 'MQTT Born at IBM',
					description:
						"[[pioneer:andy-stanford-clark|Stanford-Clark]] and [[pioneer:arlen-nipper|Nipper]] design [[mqtt|MQTT]] for monitoring oil pipelines via satellite links. Constraints: expensive bandwidth, frequent disconnects, tiny embedded controllers."
				},
				{
					year: 2011,
					title: 'MQTT Donated to Eclipse',
					description:
						'IBM donates [[mqtt|MQTT]] to the Eclipse Foundation. Mosquitto (open-source broker) and Paho (client libraries) become the reference implementations.'
				},
				{
					year: 2013,
					title: 'Facebook Messenger Adopts MQTT',
					description:
						"Facebook ships MQTT in Messenger's mobile apps for chat-message delivery — a counterintuitive but brilliant fit. The same protocol designed for oil pipelines turns out to be perfect for low-latency push to phones on flaky mobile networks."
				},
				{
					year: 2014,
					title: 'MQTT 3.1.1 at OASIS',
					description:
						'OASIS publishes MQTT 3.1.1 — the version almost everyone still uses. Becomes ISO/IEC 20922 in 2016.'
				},
				{
					year: 2014,
					title: 'CoAP RFC 7252',
					description:
						'IETF publishes [[coap|CoAP]] — REST-on-UDP for constrained devices. Designed alongside Thread, 6LoWPAN, and the broader IPv6-for-IoT push.'
				},
				{
					year: 2016,
					title: 'AWS IoT Core Launches',
					description:
						"AWS picks MQTT as the primary protocol for AWS IoT Core. Azure, Google Cloud IoT (now deprecated), Alibaba Cloud IoT all follow with MQTT-first stacks."
				},
				{
					year: 2018,
					title: 'CoAP Observe (RFC 7641)',
					description:
						'CoAP gets a standardized observe mechanism — a client subscribes to a resource and receives updates when it changes. Closes one of the main feature gaps with MQTT.'
				},
				{
					year: 2019,
					title: 'MQTT 5 Published',
					description:
						"MQTT 5 adds shared subscriptions, message expiry, request/response patterns, properties (extensible metadata), reason codes. Most production deployments are still on 3.1.1 because of broker-side feature gating, but 5 is the path forward."
				},
				{
					year: 2022,
					title: 'Matter Launches with CoAP',
					description:
						"Matter (Apple/Google/Amazon's unified smart-home protocol) uses CoAP-over-Thread for its commissioning and device communication. The largest consumer-facing deployment of CoAP to date."
				},
				{
					year: 2024,
					title: 'MQTT over QUIC Drafts',
					description:
						'IETF drafts standardize MQTT over QUIC — better head-of-line behavior on lossy links, faster connection setup, multiplexing of multiple sessions. EMQX and HiveMQ have shipped early implementations.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'MQTT vs CoAP',
			axes: ['Architecture', 'Transport', 'Discovery', 'Reliability', 'Typical use'],
			rows: [
				{
					label: '[[mqtt|MQTT]]',
					values: [
						'Broker-mediated pub/sub',
						'[[tcp|TCP]] (with [[tls|TLS]]) — sometimes WebSocket',
						'Topic strings the publisher and subscriber agree on',
						'QoS 0 (at-most-once) / 1 (at-least-once) / 2 (exactly-once)',
						"Cloud-connected fleet telemetry, mobile push, smart-home cloud"
					]
				},
				{
					label: '[[coap|CoAP]]',
					values: [
						'Peer-to-peer (or via proxy)',
						'[[udp|UDP]] (with DTLS) — sometimes TCP',
						'Resource URIs + multicast discovery',
						'Confirmable / non-confirmable messages',
						"Constrained-radio meshes (Thread, 6LoWPAN), Matter, local control"
					]
				}
			],
			note: "MQTT requires a broker; CoAP can work device-to-device. If your devices already need a cloud connection (telemetry, OTA updates), MQTT's broker is free infrastructure. If they're strictly local (Matter / Thread), CoAP avoids the broker dependency entirely."
		},
		{
			type: 'animated-sequence',
			title: 'MQTT QoS Levels',
			definition: `sequenceDiagram
    participant P as Publisher
    participant B as Broker
    participant S as Subscriber
    Note over P,S: QoS 0 — fire and forget
    P->>B: PUBLISH msg
    B->>S: PUBLISH msg
    Note over P,S: No ack — message could be lost
    Note over P,S: QoS 1 — at least once
    P->>B: PUBLISH msg, id=42
    B-->>P: PUBACK id=42
    B->>S: PUBLISH msg, id=42
    S-->>B: PUBACK id=42
    Note over P,S: May be delivered more than once on retry
    Note over P,S: QoS 2 — exactly once via 4-way handshake
    P->>B: PUBLISH msg, id=99
    B-->>P: PUBREC id=99
    P->>B: PUBREL id=99
    B-->>P: PUBCOMP id=99
    Note over B,S: Broker also uses QoS 2 to the subscriber
    B->>S: PUBLISH msg, id=99
    S-->>B: PUBREC
    B->>S: PUBREL
    S-->>B: PUBCOMP`,
			caption:
				"[[mqtt|MQTT]] gives you three reliability tiers at the protocol level. Most production traffic is QoS 1 — the sweet spot of \"the broker will retry until acked\" without the 4-message overhead of QoS 2. QoS 2 is rare in practice because most apps prefer idempotent message handlers over exactly-once delivery semantics.",
			steps: {
				0: '**QoS 0 — fire and forget.** No acknowledgments, no retransmits. Cheapest, lightest, and zero guarantees. Used for telemetry where losing a sample is fine.',
				1: 'Publisher sends a **PUBLISH** to the broker. No message ID is used (because there will be no ack to correlate).',
				2: 'Broker forwards to any subscribed subscriber.',
				3: 'No acks anywhere. If the wireless link dropped the packet, the message is gone — the publisher will never know.',
				4: '**QoS 1 — at least once.** Adds acknowledgments. The publisher retries until the broker acks; the broker retries until each subscriber acks. The trade: a message may be *delivered more than once* if an ack is lost and the sender retries after the original arrived.',
				5: 'Publisher sends **PUBLISH with message id 42**. Starts a retransmit timer.',
				6: 'Broker stores the message durably (per the publisher\'s settings) and replies with **PUBACK 42**. Publisher can now discard its in-flight copy.',
				7: 'Broker delivers **PUBLISH 42** to the subscriber.',
				8: 'Subscriber acks with **PUBACK 42**. Broker is done.',
				9: '**Possible duplicate.** If the PUBACK from broker to publisher is lost, the publisher retries — the broker may publish the message twice. This is why QoS 1 demands idempotent message handling.',
				10: '**QoS 2 — exactly once.** A four-message handshake guarantees the message is delivered once and only once. The cost: 4 round-trips, more state on broker and client. Rarely used in practice.',
				11: 'Publisher sends **PUBLISH with id 99**.',
				12: 'Broker responds with **PUBREC 99** (PubReceived) — "I have it, hold the copy in case I retry."',
				13: 'Publisher sends **PUBREL 99** (PubRelease) — "OK you have it, you can release."',
				14: 'Broker confirms with **PUBCOMP 99** (PubComplete). Now both sides know the message is delivered exactly once between them.',
				15: '**Broker → subscriber leg.** The broker repeats the same four-way handshake to each subscriber, also at QoS 2. This is why QoS 2 costs the most.',
				16: 'Broker sends **PUBLISH 99** to the subscriber.',
				17: 'Subscriber: **PUBREC**.',
				18: 'Broker: **PUBREL**.',
				19: 'Subscriber: **PUBCOMP**. Exactly-once delivery achieved. Most production deployments instead use QoS 1 plus idempotent handlers, which is operationally simpler.'
			}
		},
		{
			type: 'callout',
			title: 'Why Facebook Messenger Runs MQTT',
			text: `In 2013 Facebook revealed that [[mqtt|MQTT]] was the transport for chat messages in their mobile Messenger app. This raised eyebrows — MQTT was designed for oil pipelines, why is the world's largest chat product using it?\n\nThe reasons are exactly the reasons MQTT was designed for industrial telemetry:\n\n- **Tiny header.** A standard MQTT message has a 2-byte fixed header. On a flaky cellular link, every byte matters for battery and bandwidth.\n- **Persistent session.** A connected mobile client maintains one long-lived TCP/TLS connection to the broker. Server can push instantly; client doesn't have to poll.\n- **Last-will-and-testament.** When a client unexpectedly disconnects, the broker publishes a pre-registered "I just went offline" message to subscribers. This is exactly how Messenger detects "user went offline" without polling.\n- **Wildcard subscriptions.** Subscribe to \`user/123/+\` to get every message type for one user; one subscription scales to many message types.\n- **Battery friendly.** Compared to HTTP polling, MQTT's persistent connection costs much less radio time on mobile.\n\nFacebook's WhatsApp also runs MQTT for the same reasons. The lesson: a protocol designed for *the most constrained possible client* generalizes well to *any constrained client*. Phones turned out to be constrained clients.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[mqtt|MQTT]]'s failure mode is **the broker as single point of failure**. The broker is the protocol's heart; if it dies, the whole fleet is silent. Production deployments cluster brokers (HiveMQ cluster, EMQX cluster, Amazon's sharded IoT Core) and shard topics, but the model is fundamentally centralized. Network partitions create the classic split-brain problems, and reconciling messages published on each side of a partition is non-trivial.\n\n[[coap|CoAP]]'s failure mode is **NAT and firewall traversal**. CoAP runs on UDP, and most home/enterprise NATs are aggressive about closing UDP "connections" after seconds of idle time. For battery-powered devices that wake every few minutes, this means the NAT mapping is gone every time they want to send. Workarounds (CoAP over DTLS keep-alives, proxied through a hub) exist but add complexity. The protocol's minimalism becomes a tax once you leave a Thread mesh and hit a real internet.\n\nBoth share a third failure mode: **device firmware sprawl**. Hundreds of MCU vendors, dozens of MQTT/CoAP libraries, varying TLS support, divergent interpretations of the spec. Interop is often a matter of "this client works with that broker but not the other one." The MQTT 5 specification text exists; the *behavior* on the wire is whatever the broker and library agreed on.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **MQTT over [[quic|QUIC]]** moves through IETF drafts. Better than MQTT-over-TCP on lossy mobile links — no transport-layer HoL blocking, faster reconnect after network change. EMQX, HiveMQ, NanoMQ have early implementations.\n- **Sparkplug B** continues spreading in industrial OT (factory floors, energy grids) — a layer on top of MQTT that defines device discovery, state, and command/control schemas. Bridges IT-style MQTT to OT-style protocols (Modbus, OPC UA).\n- **Matter / Thread adoption** drives more CoAP into consumer homes. Apple Home, Google Home, Amazon Alexa, SmartThings all support Matter now; CoAP is the wire protocol behind the curtains.\n- **MQTT-SN** (MQTT for Sensor Networks) — a UDP version of MQTT for the lowest-end devices — sees renewed interest as NB-IoT and LTE-M cellular IoT roll out.\n- **The convergence question**: should IoT consolidate on one protocol (probably MQTT) or maintain the broker-vs-peer-to-peer split? Practical answer for 2025 is probably both, indefinitely.`
		}
	]
};
