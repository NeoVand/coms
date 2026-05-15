---
id: mqtt
type: protocol
name: MQTT
abbreviation: MQTT
etymology: "[M]essage [Q]ueuing [T]elemetry [T]ransport — but no longer an acronym since 2013"
category: async-iot
year: 1999
rfc: null
standards_body: oasis
podcast_target_minutes: 22
related_book_chapters:
  - foundations/packets
  - foundations/client-server-p2p
  - foundations/ai-protocols
  - story-of-the-internet/the-ai-agent-layer
  - async-iot/mqtt
  - async-iot/amqp
  - async-iot/coap
  - patterns-failures/patterns
related_protocols: [tcp, websockets, tls, amqp, coap, quic]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/MQTT_protocol_example_without_QoS.svg/500px-MQTT_protocol_example_without_QoS.svg.png
    caption: The MQTT publish/subscribe pattern — a sensor publishes a temperature reading to a topic on the broker, and any subscribed client receives it automatically. The publisher and subscribers never need to know about each other.
    credit: Image — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "An illustrated MQTT Fixed Header — two bytes, with byte one split into the 4-bit Control Packet type and four type-specific flag bits, byte two showing the Variable Byte Integer Remaining Length with its high-bit continuation marker. Caption: 'The reason MQTT works on a satellite link.'"
  - "A side-by-side QoS comparison: QoS 0 as a single arrow (PUBLISH), QoS 1 as two arrows (PUBLISH, PUBACK), QoS 2 as the four-step PUBLISH / PUBREC / PUBREL / PUBCOMP handshake. Latency labels: 1 RTT, 1-2 RTTs, 2 RTTs."
  - "A topic tree drawn as a directory: factory/line1/oven/temp on one branch, home/kitchen/temperature on another, with a + wildcard highlighted matching one level and a # wildcard absorbing everything below."
  - "A fan-out diagram showing one publisher, one Mosquitto broker icon, and many subscribers — a smartphone, a dashboard, an AI agent, an irrigation controller — receiving the same retained message instantly on subscribe."
  - "A Wireshark capture of a CONNECT packet: the bytes 10 2f 00 04 4d 51 54 54 05 c2 ... annotated to show MQTT magic, Protocol Level 5, Connect Flags 0xC2, Keep Alive 60s."
  - "A world map showing the Avast 32,000 unprotected brokers and Trend Micro's 78,549 broker scan, with one pin saying 'Phillips 66 oil pipelines, 1999 — where it all began.'"
---

# MQTT — Message Queuing Telemetry Transport

## In one breath

MQTT is the lightweight publish-subscribe protocol that runs the Internet of Things — and a lot more. A two-byte fixed header, three quality-of-service levels, a central broker that fans messages from publishers to subscribers without either side knowing the other exists. It was drafted in 1999 to instrument oil pipelines over a satellite link priced per byte; twenty-seven years later it carries Facebook Messenger, Tesla telemetry, Audi vehicle connectivity, and the MQTT integration that runs on roughly 48% of all Home Assistant installs.

## The pitch

In 1999 two engineers — Andy Stanford-Clark at IBM Hursley in England and Arlen Nipper at Arcom Control Systems in Kentucky — were trying to monitor thousands of miles of Phillips 66 oil pipeline through a brand-new VSAT satellite link that cost a small fortune per byte. The protocol they sketched on whiteboards, originally codenamed "Argo Lightweight On The Wire Protocol," had a fixed header of two bytes and no checksum. Today that same protocol carries your Messenger pings, your Tesla phoning home, and the bulk of industrial telemetry on Earth. This episode is what MQTT looks like on the wire in 2026: the packet types, the QoS state machines, the brokers that hit 200 million concurrent connections, and the CVE wave that hit libmosquitto in 2024.

## How it actually works

An MQTT client opens a TCP connection to a broker, sends a CONNECT packet, gets a CONNACK back, then either subscribes to topics or starts publishing. Messages flow through the broker; the publisher never knows who is subscribed. The simulator on this protocol's page walks you through it: the device opens TCP to port 1883 and sends a CONNECT with a client ID, optional credentials, a keep-alive interval, and a "clean session" flag. The broker validates and responds with CONNACK and return code 0. The client sends SUBSCRIBE for `sensors/temperature` at QoS 1; the broker responds with SUBACK echoing the packet ID and the granted QoS. The client publishes a JSON payload with the same topic; at QoS 1 the broker acknowledges with a PUBACK carrying the same packet ID. That is the entire happy path of an IoT device's life.

### Header at a glance

The MQTT Fixed Header is two to five bytes — the smallest application-layer header in production use.

- **Byte 1, high nibble** — the 4-bit Control Packet type. Sixteen values: CONNECT (1), CONNACK (2), PUBLISH (3), PUBACK (4), PUBREC (5), PUBREL (6), PUBCOMP (7), SUBSCRIBE (8), SUBACK (9), UNSUBSCRIBE (10), UNSUBACK (11), PINGREQ (12), PINGRESP (13), DISCONNECT (14), and AUTH (15) added in MQTT 5. PUBREL and SUBSCRIBE require their low nibble be exactly 0010.
- **Byte 1, low nibble** — type-specific flags. For PUBLISH only: bit 3 is DUP (a retransmission), bits 2-1 are QoS (00, 01, or 10; 11 is invalid), bit 0 is RETAIN. So 0x33 means PUBLISH with QoS 1 and RETAIN set.
- **Bytes 2 to 5** — the Remaining Length field, encoded as a Variable Byte Integer. Each byte holds 7 bits of length plus a continuation bit. One to four bytes encode 0 through 268,435,455 — so the smallest possible packet (PINGREQ) is two bytes total and the largest is 256 MB. The encoding is the same scheme Google Protocol Buffers calls a varint.
- **Variable Header** — present in some packet types. The most common subfield is a 2-byte Packet Identifier carried by every QoS-greater-than-zero PUBLISH and every ACK that responds to it. In MQTT 5, the Variable Header is followed by a Properties section: a length, then typed key-value tuples for things like Topic Alias, Session Expiry Interval, Message Expiry Interval, and free-form User Properties.

There is no application-level checksum. MQTT relies on TCP's 16-bit checksum for integrity and on TLS for authenticated encryption when you add it.

### State machine in three sentences

MQTT itself is a stateful session protocol — but the state machine the practitioner cares about is per-message. QoS 0 is fire-and-forget: one PUBLISH, no acknowledgement, no state. QoS 1 is at-least-once: the sender stores the message until a PUBACK with the matching Packet Identifier arrives, retransmitting with DUP=1 on timeout — duplicates are possible and the application is expected to dedupe. QoS 2 is exactly-once via a four-step handshake: PUBLISH, PUBREC, PUBREL, PUBCOMP, with both sides tracking Packet Identifiers to suppress duplicates — the throughput cost is roughly half of QoS 1 because of the extra round-trips.

### Reliability, sessions, and security mechanics

The session is the unit of state that survives a TCP disconnection. In MQTT 3.1.1 a single Boolean `clean session` flag controlled whether the broker resumed your subscriptions and queued QoS-greater-than-zero messages on reconnect. MQTT 5.0, published by OASIS on 7 March 2019, split that into two pieces: `Clean Start` resets state at connect time, and the `Session Expiry Interval` property says how long the session lingers after disconnect — zero ends it immediately, 0xFFFFFFFF keeps it forever.

The **Last Will and Testament** is a message the broker publishes on the client's behalf when the client dies ungracefully. You configure it in the CONNECT packet — topic, payload, QoS, retain — and the broker fires it on abnormal disconnect. MQTT 5 added a `Will Delay Interval` so a brief Wi-Fi flap doesn't immediately fire the will.

**Retained messages** are stored at the broker per topic; the most recent retained payload on a topic is delivered immediately to anyone who subscribes. Publishing a zero-byte payload with retain set deletes the retained message. The pattern is "current state on a known topic, telemetry on an ephemeral one" — never retain a high-cardinality stream like temperature samples.

**Keep Alive** is an integer in seconds that the client picks at CONNECT time. The client must send something — a PUBLISH, a PINGREQ, anything — within that window. The broker grants 1.5× the value before declaring the client dead and firing the will. Defaults: 60 seconds for backend services, 30 to 120 seconds for Wi-Fi devices, 240 to 600 seconds for cellular battery devices to amortise the TLS handshake.

**Security** rides one layer down. Plain MQTT goes to TCP port 1883 with username and password sent in cleartext in the CONNECT payload. MQTT-over-TLS goes to port 8883 — TLS 1.2 or 1.3, with mutual TLS using X.509 client certificates as the recommended posture for IoT scale. AWS IoT Core enforces mutual TLS — every device gets a unique certificate. MQTT 5 also added the AUTH packet, which supports SASL-style enhanced authentication including SCRAM and Kerberos. Access control lists are broker-specific — Mosquitto has ACL files, EMQX has plugins, HiveMQ has an extension SDK — and misconfigured ACL files are the dominant cause of real-world exposures.

## Where it shows up in production

**Eclipse Mosquitto** is the de-facto reference open-source broker, written in C, fits in under 2 MB resident on a small box. The 2.x branch supports MQTT 5; the security log lists the 2024-10-25 fix, version 2.0.19, released October 2024. Mosquitto 2.0 (2020) made a deliberate UX choice in response to the Avast and Trend Micro exposure incidents: it defaults to localhost-only listeners with anonymous access disabled.

**HiveMQ** is the commercial Java broker. The headline number from their February 2023 benchmark report: **200 million concurrent connections** on a 40-node AWS cluster running HiveMQ 4.11, sustaining over 1 million messages per second, with about 37 minutes to ramp up the connection load. HiveMQ powers Audi's vehicle connectivity across Europe.

**EMQX** is the open-source and commercial Erlang broker that ships the most aggressive scale numbers in the IoT space. The 2021 EMQX 4.3 benchmark on a 5-node cluster (32 cores, 64 GB each): 10 million connections plus 10 million subscriptions, 1 million messages per second at QoS 0, 500,000 messages per second at QoS 1, with 4 to 5 millisecond average latency. A separate EMQX 5.x deep-dive on a 6-node cluster sustained 2 million concurrent **WebSocket** connections at roughly 100,000 messages per second with a sub-5-millisecond p99 latency. EMQX was also the first broker to ship production MQTT-over-QUIC.

**AWS IoT Core** is the canonical managed broker — MQTT 3.1.1 and MQTT 5, mutual TLS enforced, per-connection limit of 100 publishes per second, account-level limit of 20,000 publishes per second (2,000 in some regions), maximum message size 128 KB, billing in 5 KB increments at $1 per million messages in US East at the first billion. **Azure IoT Hub** and **Azure Event Grid MQTT broker** are Microsoft's equivalents — Event Grid added Sparkplug B support in 2024 and 2025 by enabling QoS 1, retain, and last-will-and-testament.

**Google Cloud IoT Core** was retired on **16 August 2023**. The shutdown is just outside the 24-month window but still drives architecture decisions in 2024 to 2026 — most customers migrated to AWS IoT Core, Azure IoT Hub, EMQX, or HiveMQ. The lesson the industry took away: hyperscaler-managed IoT services have higher churn risk than the protocol itself.

**Facebook Messenger** is the canonical mobile case study. Lucy Zhang and her team at Beluga — acquired by Facebook — chose MQTT over their existing HTTP and XMPP path "with just a few weeks until launch" in 2011 to drop perceived send latency from seconds to "hundreds of milliseconds" on flaky mobile networks. A protocol designed for satellite-uplinked oil pipelines turned out to be exactly what a 2G smartphone needed.

**Home Assistant** publishes its analytics. The MQTT integration is enabled on roughly **48% of all active Home Assistant installations**, ranking 11th out of all integrations and underpinning Zigbee2MQTT and many native device bridges. Smart-home is now MQTT's largest visible deployment by installation count.

**Industrial IoT** runs on the **Sparkplug B** specification — a topic namespace, Protocol Buffer payloads, birth/death certificates riding on Last Will and Testament — published by Cirrus Link and ratified as **ISO/IEC 20237:2023** on 7 November 2023. Sparkplug 4.0 has been in development at the Eclipse working group through 2024 and 2025, with a dedicated rebirth topic to fix one of the more painful operational corners of v3.

The deployment topologies are predictable: a single broker for prototypes, a clustered broker (HiveMQ replication, EMQX over Erlang distribution and Mnesia) for production, **Mosquitto bridges** for hierarchical IIoT — edge broker to site broker to cloud broker — and the increasingly common **Unified Namespace** pattern from Sparkplug, where every plant runs a local broker and all of them bridge into a corporate broker exposing a single namespace.

## Things that go wrong

**The Avast smart-home study (2018).** Researchers scanned the public internet and found roughly **49,000 MQTT brokers** on Shodan, of which about **32,000 had no password protection**. They subscribed to `#` from a single anonymous IP and watched 32,000 homes' worth of presence data in real time — door locks, away/home status, camera triggers, even the SMB shares of default Home Assistant configs. The lesson is the one Mosquitto 2.0 hard-coded into its defaults: an MQTT broker on the public internet without TLS, auth, and an ACL will be discovered and harvested within hours.

**The Trend Micro / Federico Maggi paper (2018) — *The Fragility of Industrial IoT's Data Backbone*.** Over a four-month internet-wide scan, the team collected **209,944,707 MQTT messages from 78,549 brokers**, plus 19 million CoAP messages on the side. The corpus included Fortune 500 retailer inventory, urgent PLC maintenance alerts in the clear, emails, RFID inventory, the works. The paper also disclosed CVE-2017-7653 (a Mosquitto DoS via malformed UTF-8 topics) and CVE-2018-17614 (an out-of-bounds write in an MQTT client). The headline number is now seven years old, but the **Shadowserver Foundation's daily Open MQTT Report**, running continuously since 2020, still finds tens of thousands of anonymous brokers — on 12 March 2020 the daily snapshot was 71,508 IPs responding, of which 41,558 (58%) allowed anonymous access.

**The 2024 Mosquitto CVE wave.** **CVE-2024-10525**, disclosed in October 2024, was a libmosquitto out-of-bounds read on a crafted SUBACK with no Reason Codes. It affects 1.3.2 through 2.0.18 and is fixed in 2.0.19. The interesting twist is the directionality: a malicious *broker* can corrupt memory in a benign client. The CVSS hits 7.2. The same year saw a broker double-free in bridge topic remapping in 2.0.0 through 2.0.18. The deeper lesson — repeated through CVE-2023-0809 (DoS via memory allocation on malformed pre-CONNECT packets), CVE-2023-3592 (memory leak on MQTT 5 CONNECT with invalid Will properties), CVE-2023-28366 (memory leak via duplicate-MID QoS 2), and the 2017 wave — is that MQTT's protocol surface is intentionally tiny but the implementation surface is intricate, and there is no substitute for fuzzing the parser.

**The SlowITe denial-of-service (2020).** The MQTT spec mandates the broker grant 1.5× the keepalive timeout before declaring a client dead. SlowITe weaponises that: an attacker holds connections open with the absolute minimum of traffic and exhausts the broker's file descriptors. It is a slow-loris attack and the cure is the standard cure — connection rate-limits, per-IP caps, and operating-system-level FD limits.

**EMQX CVE-2025-52136.** Admins could install arbitrary plugins via the dashboard. Defense-in-depth fix landed in EMQX 5.8.6. The pattern again: small protocol, big management surface.

## Common pitfalls (for the practitioner)

**Anonymous access on a public listener.** The default mistake. Symptom: an unknown subscriber with `#` watching everything you publish. Cure: TLS plus username/password plus an ACL file plus, for any production fleet, mutual TLS with per-device certificates.

**Wildcard subscription storms.** A careless `#` subscriber drowns itself in fan-out and on a busy broker can saturate the link. Symptom: a single subscriber pegging the broker's outbound. Cure: subscribe at the smallest filter that matches what you actually need, set `Receive Maximum` on small devices to bound in-flight messages (MQTT 5 default is 65,535 — set it to 5 to 20 on a microcontroller).

**Retained-message storms.** Publishing retained messages on every state change to a high-cardinality topic tree leaves the broker holding millions of retained payloads forever. Symptom: broker memory growing without bound, slow startup as it loads retained state. Cure: retain only "current state" topics like `device/X/online` and `device/X/firmware`; never retain telemetry. To purge a retained message, publish a zero-byte payload to the same topic with retain set.

**QoS 2 used for telemetry.** Cuts throughput by at least 50% for no benefit when the next reading replaces the lost one. Symptom: throughput half what your device can do, broker CPU dominated by PUBREC/PUBREL bookkeeping. Cure: use QoS 0 for telemetry, QoS 1 for commands and state changes (and dedupe at the application on a `messageId` or timestamp), and reserve QoS 2 for the genuinely exactly-once cases — billing events, dispense-medication, fire-suppress-trigger.

**Last-will misuse.** Short keepalive plus a flaky Wi-Fi link plus a will publish on every disconnect equals constant offline-event spam. Cure: lengthen keepalive, and on MQTT 5 set the `Will Delay Interval` to 30 seconds so brief flaps don't fire it.

**Client ID collisions.** Two devices sharing a `client.id` will steal each other's session on reconnect — the broker disconnects the older one. Symptom: mysterious disconnects, missed commands. Cure: a unique, persistent `client.id` per device with no rotation strategy that allows collisions.

**AWS IoT lifecycle ordering.** AWS docs explicitly warn that lifecycle messages "might be sent out of order" and that subscribers "might receive duplicate messages." Engineers who treat connect/disconnect events as a strict timeline are building on sand.

**Publishing to a wildcard.** `+` and `#` are subscription-only filters. Publishing to a topic that contains them is a configuration bug, not a feature.

## Debugging it

The CLI workhorses ship with Mosquitto: `mosquitto_sub -h <broker> -t '#' -v` against a small test broker dumps every topic the broker is willing to share with you. `mosquitto_pub` is the corresponding publisher, and `mosquitto_rr` does request-reply. **Wireshark's MQTT dissector** has been built in since version 2.0 and decodes MQTT 5 fully — capture on port 1883 (or decrypt 8883 with the broker's private key) and Wireshark will lay out every CONNECT, PUBLISH, and SUBACK byte for you.

**MQTTX** and **MQTTX CLI**, developed by the EMQX team, are the modern GUI and CLI testing clients with full MQTT 5 support — the `mqttx pub` and `mqttx sub` commands are the easiest way to hand-craft properties, user properties, and topic aliases for testing. **MQTT Explorer** is the popular GUI for visualising a topic tree as a directory and browsing retained messages.

The four numbers you must graph on any production broker:

- **Connected clients** — `$SYS/broker/clients/total` on Mosquitto. Watch for sudden cliffs.
- **Messages received and sent per second** — `$SYS/broker/load/messages/received/1min` and the `sent` equivalent. The ratio reveals fan-out load.
- **Queue depth per session** — broker-specific dashboards. A growing queue means a subscriber is too slow.
- **Retained-message count** — `$SYS/broker/retained messages/count`. A monotonic climb is your retained-message storm.

Plus broker CPU, memory, file-descriptor count, and TLS session reuse rate.

The public test brokers — `test.mosquitto.org` (1883, 8883, 8884), `broker.hivemq.com:1883`, `broker.emqx.io:1883` — are fine for development. Treat anything you publish to them as world-readable, because it is.

## What's changing in 2026

**MQTT-over-QUIC (vendor-led, 2024 to 2026).** EMQX 5.x ships production MQTT-over-QUIC and is "preparing a draft proposal" through the OASIS MQTT TC. As of May 2026 there is **no ratified OASIS standard** — this is vendor work. The argument is strong for mobile and cellular IoT: zero-RTT reconnect, no head-of-line blocking, integrated TLS 1.3, faster handover when the device's IP changes. Expect a working OASIS draft in 2026; a ratified standard is more likely 2027 or later. The QUIC episode has the transport-side story.

**Sparkplug 4.0 (Eclipse working group, 2024-2025).** Roadmap targeted a release candidate for late 2024 or early 2025; the public develop branch lives on GitHub. The biggest changes are a dedicated rebirth topic — today rebirths ride on command messages, which is an ACL nightmare — and decoupling birth metadata from values to avoid resending the same metadata each connection. Sparkplug 3.0 was ratified as **ISO/IEC 20237:2023** on 7 November 2023, the first time an MQTT *application* layer became an international standard.

**MQTT-SN (May 2025).** A new MQTT-SN working draft snapshot was uploaded to the OASIS subcommittee on **1 May 2025** by chair Ian Craggs. MQTT-SN remains a non-OASIS-standard specification but the activity suggests it is moving toward formalisation. Combined with the rise of NB-IoT and LoRa, expect more cellular MQTT-SN gateways in production.

**Mosquitto 2.0.19 (October 2024).** Closes CVE-2024-10525 — the libmosquitto out-of-bounds read on crafted SUBACK. If you ship libmosquitto in a product, your minimum supported version is now 2.0.19.

**Azure Event Grid MQTT broker (2024-2025).** Added the Sparkplug B prerequisites — QoS 1, Retain, Last Will and Testament — bringing the Microsoft side of the Sparkplug story to parity with EMQX and HiveMQ.

**RabbitMQ 3.13 (February 2024).** Added MQTT 5 support, including session and message expiry, will delay, and subscription identifiers. QoS 2 and shared subscriptions are still not supported.

**MQTT 5.1 (no ratified standard).** Vendor blogs reference candidate features — subscription filters, batch publishing, MQTT/RT, MQTT Streams — but as of May 2026 these are vendor proposals, not OASIS standards. Treat any "MQTT 5.1" reference in a vendor post as roadmap, not deployed standard.

**Edge computing integrations.** HiveMQ Edge, EMQX NanoMQ, Mosquitto on Yocto Linux, AWS Greengrass with local MQTT, Azure IoT Edge — the dominant 2026 pattern is broker-at-edge plus bridge-to-cloud, with Sparkplug B as the lingua franca between them.

**Kafka and Pulsar bridges.** Native Kafka producer in EMQX 5.x, the HiveMQ Kafka Extension on Enterprise, Confluent's MQTT source connector — all matured 2024 to 2025. The architectural pattern "MQTT at edge, Kafka in core, ksqlDB or Flink for processing" is now textbook.

**The OAuth / OIDC layer.** The 2025-2026 conversation has shifted from username/password and client certificates to OAuth 2.0 and OIDC token-based auth layered over MQTT 5's AUTH packet.

## Fun facts (host material)

**The name is no longer an acronym.** "MQ Telemetry Transport" was retired by OASIS in 2013; **"MQTT" is now just the protocol's name**. The OASIS Technical Committee name still says "Message Queuing Telemetry Transport" out of historical inertia, but the spec itself stopped expanding the abbreviation more than a decade ago.

**The original codename was "Argo,"** after an IBM product. Version 2 in 1999 was briefly renamed "MQ Integrator Pervasive Device Protocol" — MQIpdp, a name that did not survive — before settling on MQTT in v3 in 2000. The "MQ" prefix is itself a vestige of IBM's MQSeries product line, where it stood for "Message Queue." MQTT does not actually implement queues; it is pub/sub through and through.

**Andy's house tweets the ferry.** Andy Stanford-Clark famously hooked his home automation up to Twitter via MQTT in the late 2000s, including the Isle of Wight Red Jet ferry's status. He earned "patron saint of MQTT" status in the community. Stanford-Clark and Nipper still attend Eclipse Foundation events; 2024 was the 25th anniversary, and HiveMQ ran a "Silver Jubilee" campaign.

**Microsoft once called MQTT "horribly limited."** Clemens Vasters wrote a public blog post excoriating MQTT 3.1.1 in 2014. Microsoft then joined the OASIS TC in July 2015 specifically to push for what became MQTT 5.0 — Vasters's AMQP-influenced opinions visibly shaped the feature list (properties, user properties, reason codes, flow control). The first public review of 5.0 was 9 August 2017; the final standard published 7 March 2019.

**The Variable Byte Integer is a varint.** The 1-to-4 byte 7-bit-plus-continuation encoding for Remaining Length is the same scheme Google Protocol Buffers uses for its varints — chosen so that small packets are 2 bytes total but a single packet can still grow to 256 MB.

**Facebook on the choice.** Per a now-archived Meta engineering post, MQTT was used because "it was specifically designed for applications like sending telemetry data to and from space probes, so it is designed to use bandwidth and batteries sparingly." A protocol for satellite oil pipelines, picked for a phone in your pocket.

**MQTT-SN was originally MQTT-S.** The "S" was renamed "SN" — for Sensor Networks — to clarify that it does not mean "Secure." It is not. Security is left to whatever lower layer is carrying it.

## Where this connects in the book

- **MQTT** (Part Async/IoT) — the long-form chapter on MQTT itself: the 1999 origin at IBM Hursley and Arcom, the Argo codename, the path from royalty-free release in 2010 through OASIS 3.1.1 in 2014 to ISO/IEC 20922 in 2016 to the 137-page MQTT 5.0 in 2019, and the Sparkplug ISO/IEC 20237:2023 ratification. Pair this episode with that chapter — the chapter is where the historical narrative lives.
- **AMQP** (Part Async/IoT) — John O'Hara at JPMorgan in 2003, Pieter Hintjens, Alexis Richardson, "two billion dollars in collateral calls before he could blink," and the RabbitMQ 4.0 transition. The chapter on the choice between MQTT and AMQP is the AMQP episode.
- **CoAP** (Part Async/IoT) — REST shrunk for microcontrollers, 4-byte header, runs over UDP. The CoAP episode covers the QLC Chain surprise (388,344 endpoints, 81% in China, mostly *not* IoT), the EDHOC and OSCORE crypto stack, and why pub/sub draft RFCs are the WG's belated answer to MQTT.
- **Packets and Encapsulation** (Part Foundations) — the chapter that explains how an MQTT PUBLISH ends up wrapped in a TCP segment inside an IP packet inside an Ethernet frame.
- **Client-Server vs Peer-to-Peer** (Part Foundations) — the chapter on why broker-mediated pub/sub is its own architectural pattern, distinct from REST and from peer-to-peer.
- **Protocols for AI Agents** (Part Foundations) and **The AI Agent Layer 2024-** (Part Story of the Internet) — these chapters list MQTT among the long-tail application-layer protocols holding their niches while MCP and A2A define the new layer.
- **Recurring Patterns** (Part How Networks Actually Behave) — the chapter that names the patterns: handshakes (CONNECT/CONNACK is a textbook example), keepalives (MQTT's keep-alive timer is canonical), and the publish/subscribe pattern itself. The chapter's pull-quote actually names MQTT alongside TLS, SSH, and SCTP as protocols whose handshake you understand 80% of before reading the spec.

## See also (other protocol episodes)

**MQTT versus AMQP.** AMQP is what you build when banking-grade messaging is the brief — exchanges, queues, bindings, routing keys, transactions, dead-letter queues, the works. MQTT is what you build when the brief is "minimum bytes on a satellite link." HiveMQ summarises it cleanly: AMQP provides more capability than MQTT for general-purpose message queuing, at the expense of efficiency and complexity. MQTT lacks AMQP's exchanges and transactions; AMQP lacks MQTT's last will and retained messages. Choose AMQP when transactional ordering and audit trails are non-negotiable (trade messaging, ERP integration); choose MQTT when scale and per-byte simplicity matter (constrained devices, satellite, cellular IoT). The AMQP episode is the deep dive.

**MQTT versus CoAP.** Both are IoT protocols, and they make exactly opposite architectural choices. MQTT is pub/sub through a central broker, runs on TCP for reliable in-order delivery, has a 2-byte minimum header. CoAP is REST-like request/response between devices, runs on UDP for low overhead, has a 4-byte fixed header. MQTT is many-to-many through a broker; CoAP is one-to-one device-to-device. The Eclipse and HiveMQ framing is "complementary" — CoAP suits transient sensors that wake, GET, sleep; MQTT suits always-on or push-driven workloads with fan-out. Matter and Thread use CoAP for management; almost everything else IoT runs MQTT. The CoAP episode covers the rest of the story.

**MQTT plus TCP.** MQTT requires "ordered, lossless, bi-directional connections" and TCP supplies all three — retransmission, sequencing, and a 16-bit checksum that MQTT relies on instead of carrying its own. The default TCP port is 1883. The TCP episode explains why head-of-line blocking on a single TCP connection is what motivates the QUIC migration that EMQX is now driving for MQTT.

**MQTT plus TLS.** MQTT-over-TLS uses port **8883** — the TLS 1.2 or 1.3 handshake completes before the MQTT CONNECT is sent, then every PUBLISH, SUBSCRIBE, and PUBACK is encrypted. AWS IoT Core enforces TLS *and* mutual TLS — every device gets a unique X.509 certificate. The TLS handshake adds one RTT and is amortised over a long-lived MQTT connection; the per-byte steady-state overhead is negligible. The TLS episode covers what the handshake actually negotiates.

**MQTT over WebSocket.** MQTT can be tunneled inside WebSocket binary frames (RFC 6455), which makes it usable from a browser. The MQTT 5.0 specification normatively references RFC 6455 and dedicates its Section 6 to "Using WebSocket as a network transport." Common ports are 8083 (ws) and 8084 (wss). EMQX's 6-node cluster benchmark of 2 million concurrent MQTT-over-WebSocket connections at sub-5-millisecond p99 latency is the production data point. The WebSocket episode explains why a TCP socket can pretend to be a stream of message frames.

**MQTT versus Kafka.** Kafka is a distributed log — partitioned, persistent, replayable — optimised for high-throughput backend stream processing. Kafka clients are heavy: offset management, consumer groups, stateful and resource-hungry. They are unsuitable for an ESP32. The mainstream 2025-2026 architecture is **MQTT at the edge, bridge in the middle, Kafka in the backend** for analytics — with the bridge built into EMQX or HiveMQ Enterprise, or running as a Kafka Connect source. Different jobs, complementary protocols.

**MQTT versus MQTT-SN.** A sibling protocol designed by the same authors for non-TCP/IP networks — runs over UDP, serial, or Zigbee, uses 2-byte numeric topic IDs instead of strings, supports a "QoS -1" for fire-and-forget without prior connection, and needs an MQTT-SN gateway to bridge to a regular MQTT broker. The May 2025 OASIS draft is the most recent activity. If you are doing battery-constrained constrained-network IoT, MQTT-SN is the variant to read about.

## Sources

**Specifications and standards**

- [OASIS MQTT 5.0 Specification](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- [OASIS MQTT 3.1.1 Specification](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [ISO/IEC 20922:2016 (MQTT 3.1.1)](https://www.iso.org/standard/69466.html)
- [ISO/IEC 20237:2023 (Sparkplug 3.0)](https://www.iso.org/standard/86204.html)
- [Eclipse Sparkplug Specification](https://sparkplug.eclipse.org/specification/)
- [Eclipse Sparkplug GitHub (4.0 develop branch)](https://github.com/eclipse-sparkplug/sparkplug)
- [MQTT-SN OASIS working draft, May 2025](https://groups.oasis-open.org/discussion/mqtt-sn-working-draft-snapshot-may-1st-2025-uploaded)

**Papers**

- [Trend Micro / Maggi — The Fragility of Industrial IoT's Data Backbone](https://documents.trendmicro.com/assets/white_papers/wp-the-fragility-of-industrial-IoTs-data-backbone.pdf)
- [MDPI — Security Analysis of MQTT-SN](https://www.mdpi.com/2076-3417/12/21/10991)
- [MDPI — Delay and Energy Consumption of MQTT over QUIC](https://www.mdpi.com/1424-8220/22/10/3694)
- [IEEE Xplore — Comparative Analysis: Kafka vs MQTT (2024)](https://ieeexplore.ieee.org/document/10602689)

**Vendor and engineering blogs**

- [HiveMQ MQTT Essentials](https://www.hivemq.com/mqtt-essentials/)
- [HiveMQ — History of MQTT, Part 1](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)
- [HiveMQ — History of MQTT, Part 3 (MQTT 5)](https://www.hivemq.com/blog/the-history-of-mqtt-part-3-mqtt5-next-generation-mqtt/)
- [HiveMQ — MQTT Packets: A Comprehensive Guide](https://www.hivemq.com/blog/mqtt-packets-comprehensive-guide/)
- [HiveMQ — Achieving 200 million concurrent connections](https://www.hivemq.com/resources/achieving-200-mil-concurrent-connections-with-hivemq/)
- [HiveMQ — Celebrating 25 years of MQTT](https://www.hivemq.com/blog/celebrating-25-years-of-mqtt-silver-jubilee-milestone-for-iot-iiot/)
- [HiveMQ — MQTT vs AMQP for IoT](https://www.hivemq.com/blog/mqtt-vs-amqp-for-iot/)
- [HiveMQ — MQTT vs CoAP for IoT](https://www.hivemq.com/blog/mqtt-vs-coap-for-iot/)
- [HiveMQ — MQTT vs Kafka](https://www.hivemq.com/blog/mqtt-vs-kafka-real-time-bidirectional-data-processing/)
- [EMQX — Introduction to MQTT 5](https://www.emqx.com/en/blog/introduction-to-mqtt-5)
- [EMQX — MQTT 5.0 Control Packets, Part 1: CONNECT and CONNACK](https://www.emqx.com/en/blog/mqtt-5-0-control-packets-01-connect-connack)
- [EMQX — MQTT 5.0 Control Packets, Part 2: PUBLISH and PUBACK](https://www.emqx.com/en/blog/mqtt-5-0-control-packets-02-publish-puback)
- [EMQX — MQTT over QUIC](https://www.emqx.com/en/blog/mqtt-over-quic)
- [EMQX — A Deep Dive into WebSocket Performance](https://www.emqx.com/en/blog/a-deep-dive-into-emqx-s-websocket-performance)
- [EMQX — 4.3 Ten Million Connections Test Report](https://www.emqx.com/en/resources/emqx-v-4-3-0-ten-million-connections-performance-test-report)
- [EMQX — MQTT Trends for 2025 and Beyond](https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond)
- [EMQX — Sparkplug bridging IT and OT](https://www.emqx.com/en/blog/mqtt-sparkplug-bridging-it-and-ot-in-industry-4-0)
- [Microsoft Learn — Azure Event Grid Sparkplug support](https://learn.microsoft.com/en-us/azure/event-grid/sparkplug-support)
- [AWS IoT Core MQTT documentation](https://docs.aws.amazon.com/iot/latest/developerguide/mqtt.html)
- [AWS IoT Core pricing](https://aws.amazon.com/iot-core/pricing/)
- [Eclipse Newsletter — Sparkplug 3.0 international standard, 4.0 on the way](https://newsroom.eclipse.org/eclipse-newsletter/2023/december/sparkplug-30-now-international-standard-%E2%80%94-and-40-way)
- [Steve's Internet Guide — MQTT](http://www.steves-internet-guide.com/mqtt/)
- [Steve's Internet Guide — MQTT v5](http://www.steves-internet-guide.com/mqttv5/)
- [Cedalo — MQTT Packet Guide](https://www.cedalo.com/blog/mqtt-packet-guide)
- [RabbitMQ — MQTT 5 in 3.13](https://www.rabbitmq.com/blog/2023/07/21/mqtt5)
- [Inductive Automation podcast — Arlen Nipper, the co-inventor of MQTT](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-arlen-nipper-from-cirrus-link-solutions)
- [Facebook Engineering — Building Facebook Messenger (2011)](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/)

**News, security, and references**

- [Eclipse Mosquitto security advisories](https://mosquitto.org/security/)
- [GitHub Advisory — CVE-2024-10525 (libmosquitto SUBACK)](https://github.com/advisories/GHSA-cm54-mprw-5279)
- [GitHub Advisory — CVE-2025-52136 (EMQX plugin install)](https://github.com/advisories/GHSA-qh53-xj96-333x)
- [CVE Details — Eclipse Mosquitto](https://www.cvedetails.com/vulnerability-list/vendor_id-10410/product_id-45945/Eclipse-Mosquitto.html)
- [CVE Details — EMQX](https://www.cvedetails.com/vulnerability-list/vendor_id-24776/Emqx.html)
- [Avast — MQTT vulnerabilities and hacking smart homes](https://blog.avast.com/mqtt-vulnerabilities-hacking-smart-homes)
- [Shadowserver — Open MQTT Report](https://www.shadowserver.org/news/open-mqtt-report-expanding-the-hunt-for-vulnerable-iot-devices/)
- [TXOne — Risks of exposed MQTT brokers](https://www.txone.com/blog/mqtt-series-2-potential-risks-of-exposed-mqtt-brokers/)
- [The Stack — Google Cloud IoT Core retired](https://www.thestack.technology/google-cloud-iot-core-retired-killed-by-google/)
- [Tech Monitor — Insecure Internet of Things](https://www.techmonitor.ai/technology/data/insecure-internet-of-things)
- [Help Net Security — Flaws in IoT protocols](https://www.helpnetsecurity.com/2018/12/05/flaws-iot-protocols/)
- [How-To Geek — Why people use MQTT in Home Assistant](https://www.howtogeek.com/reasons-people-use-mqtt-in-home-assistant/)
- [Home Assistant — MQTT integration](https://www.home-assistant.io/integrations/mqtt/)

**Wikipedia and tools**

- [Wikipedia — MQTT](https://en.wikipedia.org/wiki/MQTT)
- [Wikipedia — Andy Stanford-Clark](https://en.wikipedia.org/wiki/Andy_Stanford-Clark)
- [Eclipse Paho client libraries](https://eclipse.dev/paho/)
- [paho-mqtt on PyPI](https://pypi.org/project/paho-mqtt/)
- [MQTTX](https://mqttx.app/)
- [MQTT Explorer](http://mqtt-explorer.com/)
- [Wireshark MQTT dissector](https://www.wireshark.org/docs/dfref/m/mqtt.html)
