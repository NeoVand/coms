---
id: async-iot
type: category
name: Async / IoT
description: Message-oriented protocols designed for decoupled, asynchronous communication. Essential for IoT devices, microservices, and event-driven architectures.
podcast_target_minutes: 30
protocols: [mqtt, amqp, coap, stomp, xmpp, kafka]
related_pioneers: []
related_book_chapters:
  - async-iot/mqtt
  - async-iot/amqp
  - async-iot/kafka
  - async-iot/coap
related_outages: []
related_frontier: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/IBM_system_360.JPG/500px-IBM_system_360.JPG"
    caption: "Enterprise mainframes like the IBM System/360 drove the need for reliable message queuing — connecting business systems that couldn't afford to lose a single transaction."
    credit: "Photo: Waelder / CC BY-SA 2.5, via Wikimedia Commons"
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Raspberry_Pi_3_Model_B.JPG/500px-Raspberry_Pi_3_Model_B.JPG"
    caption: "Devices like the Raspberry Pi brought MQTT from oil pipelines to maker workshops — running Mosquitto brokers on $35 hardware and connecting billions of IoT sensors."
    credit: "Photo: Jose.gil / CC BY-SA 4.0, via Wikimedia Commons"
visual_cues:
  - "A side-by-side of a publish-subscribe broker and a Kafka log. Left: three sensors arrowing into a central broker box, three subscribers (Dashboard, Alert System, Database) arrowing out, captioned 'consumed = deleted.' Right: an append-only log labelled offsets 0, 42, 50, with three consumer groups reading at different positions, captioned 'replayable.'"
  - "An MQTT control packet drawn to scale next to an HTTP/1.1 GET. The MQTT fixed header is two bytes wide, labelled 'minimum control packet: 2 bytes total.' The HTTP request beside it sprawls across multiple lines with headers."
  - "A timeline running 1993 to 2026 with eight pinned events: 1993 IBM MQ Series, 1999 MQTT v1 over satellite, 1999 jabberd released, 2003 AMQP at JPMorgan, 2007 RabbitMQ, 2011 Kafka open-sourced, 2014 RFC 7252 CoAP, 2025 Kafka 4.0 removes ZooKeeper, 2026 KIP-1150 Diskless Topics accepted."
  - "The MQTT QoS ladder: QoS 0 as a single arrow (PUBLISH), QoS 1 as a two-step (PUBLISH, PUBACK), QoS 2 as a four-step (PUBLISH, PUBREC, PUBREL, PUBCOMP). Each row labelled with its tradeoff: 'fastest, may lose,' 'guaranteed, may duplicate,' 'exactly once, 4x overhead.'"
  - "A decision-tree poster captioned 'MQTT for things, AMQP for transactions, Kafka for logs, NATS for services, CoAP for sensors, XMPP for federation, STOMP for browsers.' Each leaf shows a small icon — sensor, bank, log file, microservice, microcontroller, chat bubble, web browser."
  - "A schematic of the AWS Kinesis cascade on November 25, 2020. A capacity addition at 2:44 AM PST triggers thread-limit exhaustion across thousands of front-end servers. Cognito, CloudWatch, IoT Core, EventBridge, AutoScaling, Lambda all greyed out. A dotted arrow shows the 17-hour recovery ending at 10:23 PM PST."
  - "Kafka's KIP-848 rebalance comparison. Top: classic protocol, 10 consumers and 900 partitions, 103 seconds, captioned 'stop-the-world.' Bottom: cooperative incremental rebalance, same scenario, 5 seconds, captioned 'broker-driven.'"
---

# Async / IoT

## In one breath

Async / IoT is the family of message-oriented protocols that let senders and receivers stop waiting on each other. Six protocols sit here — MQTT, AMQP, CoAP, STOMP, XMPP, and Kafka — and they cover everything from a 2-byte sensor reading on a satellite link to trillions of events a day flowing through Netflix, Uber, and Airbnb. If a system anywhere on the modern internet decouples producers from consumers in time, it is almost certainly speaking one of these.

## The pitch

In 1999, two engineers — one at IBM, one at a small British company called Arcom — were trying to keep an oil pipeline alive over a satellite link. The bandwidth was awful, the connection dropped, the receiver had less memory than your microwave. So they wrote the smallest messaging protocol they could imagine: a 2-byte header, a publish, a subscribe, and a "last will" message the broker would send if you died. Twenty-six years later, that same protocol is what your Tesla uses to phone home, what Facebook Messenger uses to deliver your birthday wishes, and what every smart light bulb in your house speaks behind your back. This episode is about that protocol and its five siblings — the family that quietly moves more bytes than HTTP ever will.

## The arc

### Phase 1 — The mainframe-era middleware

The story begins not with sensors but with banks. In 1993 IBM shipped MQ Series — the dominant guaranteed-delivery messaging product of the 1990s. TIBCO Rendezvous, also from the late 1980s and early 1990s, took the high-volume, multicast, fan-out niche, most famously in financial market data distribution. These were proprietary wires guarded by enterprise sales teams. Sun's JMS specification arrived in 2001 and tried to abstract over them with a Java API, but JMS is an API, not a wire format, so it didn't break vendor lock-in.

### Phase 2 — Oil pipelines in the desert

In early 1999, Andy Stanford-Clark at IBM and Arlen Nipper of Arcom Control Systems sketched what became MQTT, originally codenamed "Argo." Their customer was Phillips 66; the problem was monitoring oil pipelines via expensive, intermittent satellite links. The constraints were minimal bandwidth, tolerate disconnection, preserve battery — exactly the constraints of the smartphones and connected cars that hadn't been invented yet. The MQTT v2 they finished later in 1999 — DISCONNECT, UNSUBSCRIBE, PING, will-messages, keepalives — stayed essentially stable for the next ten years. The mechanism story lives in the MQTT episode.

### Phase 3 — The open-standards rebellion

Three currents converged between 1999 and 2014. On 4 January 1999, Jeremie Miller released `jabberd`, an open and federated alternative to AOL, MSN, and ICQ. The IETF formalised the wire as RFC 3920 and 3921 in 2004 and revised it as RFC 6120, 6121, and 7622 in 2011. In parallel, in 2003, John O'Hara at JPMorgan Chase started designing AMQP because he was tired of paying license fees and being unable to interoperate between TIBCO, IBM MQ, and Microsoft MSMQ. JPMorgan contracted iMatix — Pieter Hintjens — to write a C broker; in 2005 a working group of 23 firms including Cisco, Red Hat, Bank of America, and Goldman Sachs formed; AMQP 1.0 was released in October 2011 and ratified as an OASIS Standard in October 2012, then as ISO/IEC 19464 in 2014. Hintjens famously distributed his memo "What is wrong with AMQP (and how to fix it)" in 2008, left the working group, and built ZeroMQ — a brokerless library — instead. STOMP appeared at Codehaus around 2005 because scripting-language developers wanted to talk to brokers without 50-page binary specs. STOMP 1.2 dates to 2012.

### Phase 4 — The log revolution

Around 2010 at LinkedIn, Jay Kreps, Jun Rao, and Neha Narkhede looked at activity-event ingestion — billions of events a day — and decided that traditional message queues like ActiveMQ and RabbitMQ gave too many guarantees for too high a cost, while log aggregators like Scribe and Flume gave too few. They built Kafka, named after Franz Kafka because Jay Kreps liked the writer and the system was "optimised for writing." The seminal paper, "Kafka: a Distributed Messaging System for Log Processing," appeared at NetDB 2011. Kafka was open-sourced that same year. Kreps, Narkhede, and Rao founded Confluent in 2014 with $500K in seed money from LinkedIn; Confluent went public in June 2021 with a valuation north of $9 billion. Jay Kreps' 2013 essay "The Log: What Every Software Engineer Should Know About Real-time Data's Unifying Abstraction" is arguably the most-read systems-architecture essay of the decade. The deep mechanics live in the Kafka episode.

### Phase 5 — IETF standardisation for tiny things

While the log revolution was happening, the IETF CoRE working group was solving a different problem: HTTP was too heavy for 8-bit microcontrollers. RFC 7252, edited by Zach Shelby, Klaus Hartke, and Carsten Bormann, was published in June 2014 — the same year OASIS ratified MQTT 3.1.1. CoAP is REST for tiny things: UDP transport with optional reliability via confirmable messages, a 4-byte header, URIs, GET/POST/PUT/DELETE, and a stateless mapping to HTTP for proxy interop. The CoAP episode walks the wire format and the observe extension.

### Phase 6 — Cloud-native messaging

Between 2015 and 2022 the cloud-native era reshaped the field. NATS, originally written by Derek Collison for Cloud Foundry and rewritten in Go in 2014, was accepted into the CNCF in March 2018. Apache Pulsar — created at Yahoo in 2013 and donated to the ASF in 2016 — brought a tiered architecture with separate broker and BookKeeper storage. MQTT 5.0 was ratified by OASIS in 2019, adding properties, reason codes, shared subscriptions, and session and message expiry. RabbitMQ matured AMQP 1.0 support and added Streams. The Eclipse Sparkplug working group — Cirrus Link, HiveMQ, Chevron, Inductive Automation — standardised an MQTT topic namespace and Protobuf payload for industrial SCADA.

### Phase 7 — Diskless and decoupled

In August 2023, WarpStream's "Kafka is dead, long live Kafka" post launched the diskless-Kafka movement: stateless agents writing directly to S3-class object stores, no local disks, no inter-AZ replication fees. Confluent acquired WarpStream in September 2024. On 18 March 2025, Kafka 4.0 finalised the removal of ZooKeeper that began with KIP-500 in 2019, and made KIP-848's cooperative incremental rebalance protocol generally available. Kafka 4.1 in September 2025 brought share groups (KIP-932) in preview. On 2 March 2026, the Apache Kafka community accepted KIP-1150 (Diskless Topics) with a 9-binding and 5-non-binding vote — formally validating WarpStream's architecture. Aiven shipped its commercial implementation, Inkless, ahead of the merge.

### The cast

The architects of this field include Andy Stanford-Clark, Arlen Nipper, Jeremie Miller, John O'Hara, Pieter Hintjens, Jay Kreps, Neha Narkhede, Jun Rao, Carsten Bormann, Zach Shelby, Klaus Hartke, Roger Light, Derek Collison, and Martin Kleppmann — whose 2017 and 2024 book *Designing Data-Intensive Applications* is the field's textbook.

## The people

### Andy Stanford-Clark

Born in 1966. Co-inventor of MQTT and an IBM Distinguished Engineer. With Arlen Nipper at Arcom, he designed the protocol for oil-pipeline telemetry over satellite in 1999, then helped open-source it and shepherd it through OASIS standardisation.

### Arlen Nipper

Brought embedded-systems and SCADA expertise to MQTT's design while at Arcom Control Systems. Later co-founded Cirrus Link Solutions to commercialise MQTT for industrial IoT.

### John O'Hara

Conceived AMQP at JPMorgan Chase in 2003 to break vendor lock-in in financial messaging, then convinced major banks and tech companies to collaborate on an open standard.

### Pieter Hintjens

Born 1962, died 2016. Built the first open-source AMQP broker, OpenAMQ, at iMatix and later created ZeroMQ — a brokerless messaging library. A passionate open-source advocate; he grew critical of AMQP's complexity and eventually left the working group, distributing his memo "What is wrong with AMQP (and how to fix it)" in 2008.

### Alexis Richardson

Co-founded Rabbit Technologies, the company behind RabbitMQ — the most widely deployed AMQP broker. Later became CEO of Weaveworks, bringing messaging patterns to cloud-native.

### Jeremie Miller

Released `jabberd` on 4 January 1999 as an open, federated alternative to AOL, MSN, and ICQ. The Jabber wire format became XMPP through the IETF — RFCs 3920 and 3921 in 2004, then 6120, 6121, and 7622 in 2011.

### Jay Kreps

Co-created Kafka at LinkedIn around 2010 with Jun Rao and Neha Narkhede. Co-founded Confluent in 2014. His 2013 essay "The Log: What Every Software Engineer Should Know About Real-time Data's Unifying Abstraction" provided the conceptual frame for the entire post-2013 streaming wave.

### Neha Narkhede

Co-creator of Kafka at LinkedIn and co-founder of Confluent in 2014. Co-author of *Kafka: The Definitive Guide*.

### Jun Rao

Co-creator of Kafka at LinkedIn. Co-founder of Confluent. Co-author of the seminal NetDB 2011 paper.

### Zach Shelby

Primary editor of the CoAP specification, RFC 7252, and co-founder of the IETF CoRE Working Group. Did the work at Sensinode and later ARM, bridging web standards and IoT.

### Carsten Bormann

Co-edited the CoAP specification at Universität Bremen and co-created CBOR — the efficient binary serialisation format used throughout the IoT ecosystem.

### Klaus Hartke

Co-author of RFC 7252 alongside Shelby and Bormann. One of the engineers who carried CoAP from draft through publication.

### Roger Light

Created Mosquitto, the most widely deployed open-source MQTT broker — running on everything from Raspberry Pis to production servers. Now at Cedalo by way of the Eclipse Foundation.

### Derek Collison

Wrote NATS, originally for Cloud Foundry, and rewrote it in Go in 2014. Founded Synadia, the company behind NATS' commercial backing.

### Martin Kleppmann

Co-author with Jay Kreps of the 2015 IEEE Data Engineering Bulletin paper "Kafka, Samza and the Unix Philosophy of Distributed Data," and author of *Designing Data-Intensive Applications* — the field's textbook, with a second edition co-authored with Chris Riccomini in 2024 whose Chapter 11 is the reference for the entire log-based view.

## The protocols (a guided tour)

### MQTT — Message Queuing Telemetry Transport

The lightweight publish-subscribe protocol that became the lingua franca of IoT. Born in 1999 for oil-pipeline telemetry over satellite, MQTT's identity is its thrift: the fixed header is 2 bytes, the smallest control packet is 2 bytes total. Versions: 3.1 (royalty-free in 2010), 3.1.1 (OASIS 2014, ISO/IEC 20922), 5.0 (OASIS 2019, adding shared subscriptions, message expiry, reason codes, and topic aliases). MQTT-SN is a UDP and non-IP variant for Zigbee and 802.15.4 sensor meshes. Non-obvious: Facebook Messenger has used MQTT since 2011, because TCP and HTTP burned battery and bandwidth on phones. The MQTT episode covers the wire format, the three QoS levels, retained messages, last will and testament, and the journey from oil rig to your pocket.

### AMQP — Advanced Message Queuing Protocol

The enterprise messaging wire that came out of JPMorgan's frustration with vendor lock-in. Reach for it when you need financial-grade reliability across heterogeneous brokers, cross-vendor interoperability, or multi-protocol Azure Service Bus or RabbitMQ deployments. The catch: AMQP 1.0 is fundamentally different from AMQP 0-9-1 — the version RabbitMQ originally implemented. The 0-9-1 model prescribes a broker with exchanges, queues, and bindings; the 1.0 model is a peer-to-peer wire protocol with link-credit-based flow control and a self-describing type system, leaving the broker model to implementations. This split is one of the great schisms of messaging. RabbitMQ 4.0 in September 2024 made AMQP 1.0 a core protocol always enabled, and removed classic mirrored queues; RabbitMQ 4.3 in April 2026 introduced JMS Queues and 32 priority levels for quorum queues. The AMQP episode walks the broker model, the 0-9-1-versus-1.0 schism, and where each version actually runs in production.

### CoAP — Constrained Application Protocol

REST for tiny things. Reach for it when you have an 8-bit microcontroller and a 10s-of-kbit/s radio — 6LoWPAN sensor networks, smart-energy, building automation. RFC 7252 from June 2014 defines a UDP transport with optional reliability via confirmable messages, a 4-byte header, URIs, GET/POST/PUT/DELETE, content formats, and a stateless HTTP mapping for proxy interoperability. Security is layered through DTLS 1.3 (RFC 9147) or, increasingly, OSCORE (RFC 8613) with the EDHOC handshake (RFC 9528, March 2024) — a CoAP-native security stack designed not to rely on TLS handshakes that 8-bit chips can't afford. The CoAP episode covers the message format, the observe extension (RFC 7641), block-wise transfer (RFC 7959), and the OSCORE security stack.

### STOMP — Simple Text Oriented Messaging Protocol

The text-based broker protocol so simple you can debug it with telnet. Created at Codehaus around 2005 because scripting-language developers wanted to talk to brokers without 50-page binary specs; STOMP 1.2 dates to 2012. The frame format is a command line, headers, and a null-terminated body. The frames are SEND, SUBSCRIBE, UNSUBSCRIBE, BEGIN, COMMIT, ABORT, ACK, NACK, DISCONNECT, CONNECT, CONNECTED, MESSAGE, RECEIPT, and ERROR. Niche: the most common WebSocket-based broker protocol for browsers, via Spring's `@MessageMapping` STOMP-over-WebSocket and RabbitMQ's Web-STOMP plugin. The depth is deliberately low. The STOMP episode walks the frame format and the in-browser pub/sub use case.

### XMPP — Extensible Messaging and Presence Protocol

The open, XML-based messaging protocol born as Jabber on 4 January 1999. Reach for it when you want federated, decentralised chat or presence; XML-based extensibility; or server-to-server interoperability across administrative domains. Google Talk launched on XMPP in 2005. WhatsApp's protocol was derived from XMPP. Zoom uses XMPP-derivatives for chat. The core RFCs are 6120 (Core), 6121 (IM and Presence), and 7622 (Address Format). Niche: standards-based federation — the only family member that natively does cross-domain server-to-server like email does. The XMPP episode covers the XML stream, SASL, resource binding, and the federation model.

### Kafka — Apache Kafka Wire Protocol

The distributed event-streaming wire LinkedIn open-sourced in 2011. Reach for it when you need high-throughput log and event streaming, a "system of record" event store, exactly-once-with-idempotency, or CQRS, event-sourcing, and CDC pipelines. The wire is binary, framed, length-prefixed, and version-negotiated; the magic is the persistent partitioned log abstraction. Kafka is a log, not a queue — it remembers messages for a configurable retention period and consumers track their own offsets. As of Apache Kafka 4.1 in September 2025, share groups (KIP-932) bring queue-like semantics to Kafka itself; Kafka 4.2 is expected to mark them production-ready. The Kafka episode walks partitions, consumer groups, KRaft and the ZooKeeper removal, KIP-848's new rebalance protocol, and the diskless variants.

## Advanced topics (from the deep-dive)

### MQTT QoS levels

MQTT's three Quality of Service levels are a tradeoff between reliability and overhead. QoS 0 (at most once) is fire-and-forget — fastest, lowest overhead, but messages can be lost; suitable for sensor readings where the next update obsoletes the previous one. QoS 1 (at least once) gets a PUBACK from the broker; if the publisher doesn't see it, it retransmits, so delivery is guaranteed but duplicates can happen and the subscriber must handle idempotency. QoS 2 (exactly once) uses a four-step handshake — PUBLISH, PUBREC, PUBREL, PUBCOMP — that ensures no duplicates and no loss, at four times the overhead. QoS 2 is the right tool for billing events, financial transactions, and control commands where duplicates are unacceptable.

### Broker architectures: centralised versus distributed log

Message brokers come in two fundamental flavours. Centralised brokers — RabbitMQ, Mosquitto, ActiveMQ — route every message through a single logical broker that handles queuing, routing, acknowledgments, and dead-letter handling. They are simple to reason about, but the broker is a single point of failure and a potential bottleneck. Distributed commit logs — Kafka, Pulsar, Redpanda — store messages in ordered, partitioned, replicated logs; consumers track their own offset and can replay the entire history or catch up after downtime. Messages are retained for days or weeks, not deleted on delivery. The choice depends on the messaging pattern: complex routing with topic exchanges, headers-based filtering, and priority queues favours a traditional broker; ordered, replayable event streams at massive scale favours a distributed log.

### Exactly-once delivery — the holy grail

Exactly-once is the holy grail of messaging, and the hardest guarantee to achieve. The Two Generals Problem proves that exactly-once delivery is impossible over an unreliable network. Real systems substitute exactly-once *processing*: the system may deliver a message multiple times, but it ensures the effect happens only once. Three techniques carry the weight. Idempotent producers, as in Kafka, give every message a sequence number; the broker deduplicates based on producer ID plus sequence and discards retransmissions. The transactional outbox writes the message and a "processed" flag in the same database transaction — if the transaction commits, the message is processed exactly once; if it rolls back, neither the message nor the side effect persists. Dead-letter queues catch messages that fail after max retries, preventing poison messages from blocking the whole queue while preserving them for manual inspection.

### KRaft and KIP-848 — Kafka's coming-of-age

Two long-running KIPs landed in Kafka 4.0 on 18 March 2025. KIP-500 replaced ZooKeeper with KRaft, a self-managed Raft-based metadata quorum first proposed in 2019 and merged in 2020. ZooKeeper-managed Kafka clusters were notorious for ZK quorum loss; KRaft consolidates metadata into the cluster itself. Migration is non-trivial — Amazon MSK does not support in-place ZK-to-KRaft migration, so production users must move to a fresh cluster. KIP-848 replaces stop-the-world consumer rebalancing with a broker-driven, cooperative, incremental protocol via a new ConsumerGroupHeartbeat API. The numbers tell the story: 10 consumers and 900 partitions take 5 seconds with KIP-848 versus 103 seconds with the classic protocol.

### The diskless argument

Across 2024 and 2026 the prevailing direction is decoupling the log from the broker, the topic from the table, and the protocol from the implementation. WarpStream pioneered diskless Kafka in 2023. AutoMQ shipped a forked-Kafka diskless variant. Buf released Bufstream. Aiven proposed KIP-1150 (Diskless Topics). Slack proposed KIP-1176 (fast-tiering via cloud WAL). AutoMQ proposed KIP-1183. On 2 March 2026 the Apache Kafka community accepted KIP-1150 with a 9-binding and 5-non-binding vote. Confluent's acquisition of WarpStream in September 2024 was the single biggest commercial move in the family in 24 months. The architectural argument has been won.

### Recurring failure modes

The whole family fails in similar ways. Half-open TCP creates zombie connections that brokers think are alive — heartbeats and TCP keepalives fix them. Slow consumers force the broker to buffer indefinitely or drop messages — Kafka's answer is consumer-controlled offsets and retention; AMQP's is consumer prefetch and flow control. Reconnect storms after broker outages saturate CPU; mitigations are jittered exponential backoff in clients. Disk fills before old messages age out — Kafka's tiered storage (KIP-405, GA in Kafka 3.6) and the diskless variants address this directly. At-least-once plus retry storms equal exponential message multiplication; idempotency keys are the only real fix. Cross-partition ordering is not guaranteed; engineers routinely misuse Kafka by assuming global order across partitions. And metastable failures — Slack's 2-22-22 incident is a near-textbook case where a cache-tier disturbance pushed the system into a self-reinforcing failure mode that needed external intervention to break.

### The AWS Kinesis cascade — November 25, 2020

A pause-and-think moment for the field. Two days before Black Friday, AWS attempted a routine capacity addition to Kinesis Data Streams in us-east-1. The change started at 2:44 AM PST and finished at 3:47 AM PST. Kinesis's front-end fleet was thousands of servers, and every front-end server held an OS-thread-per-peer mesh — a design choice from when the fleet was smaller. When new capacity arrived, every existing server tried to spin up threads to all the new ones. The Linux thread limit was hit. New servers couldn't finish building their shard-map cache and began routing requests to nowhere. By 5:15 AM error rates spiked. By 7:51 AM AWS had narrowed the cause but realised a fix required restarting the entire front-end fleet — a few hundred servers per hour. Cognito users couldn't authenticate, CloudWatch dashboards went blank, the AWS Service Health Dashboard itself went down because it was hosted on services downstream of Kinesis. Roku, Flickr, iRobot, and Adobe Spark went dark. Full recovery completed at 10:23 PM PST — a 17-hour event. The deeper lesson, repeated since: cellularisation, fault isolation, and avoiding all-to-all communication patterns are not optional at hyperscale.

## Recurring themes

The first theme is **decoupling in time**. Every protocol in this family was invented because somebody got tired of synchronous, tightly coupled, point-to-point integration breaking in the same way for the same reason. The publish-subscribe pattern — where senders don't know their receivers and receivers don't know their senders — dates back to academic research in the 1980s. It journeyed from Wall Street trading floors (TIBCO) to IoT sensors (MQTT) to cloud-native microservices (AMQP, NATS, Kafka). Today it is one of the most important patterns in distributed systems, decoupling producers and consumers at global scale.

The second theme is **the queue versus the log**. Traditional message brokers like AMQP and MQTT treat messages as transient — once consumed, they're gone. Kafka inverted the model entirely: messages are an immutable, ordered log that consumers can replay at will. A consumer can read from the beginning, skip ahead, or maintain multiple read positions independently. This change unlocked event sourcing — where the event stream itself is the source of truth — and made Kafka the spine of modern data infrastructure at companies like Netflix, Uber, and Airbnb.

The third theme is **exactly-once is a process, not a delivery guarantee**. The Two Generals Problem proves end-to-end exactly-once delivery is impossible over an unreliable network. So the field substitutes idempotent producers, transactional outboxes, dead-letter queues, and consumer-side deduplication. Kafka's PID-plus-sequence-number is the cleanest implementation; everywhere else, application-level UUIDs do the same job. Engineers who wish for exactly-once delivery and don't get it ship duplicate-delivery cascades to production.

The fourth theme is **the same patterns recur in every member**. Heartbeats and keepalives prevent zombie connections. Last Will and Testament — an MQTT 1999 invention — has been copied widely; the broker publishes a stored message when a client's connection dies abnormally. Retained messages are MQTT's "current value" trick. Durable subscriptions and consumer groups carry state across reconnects in AMQP, MQTT 5.0, Kafka, and NATS JetStream. Backpressure is AMQP 1.0 link credit, Reactive Streams request-N in RSocket, TCP windowing for everyone else. The same design problems get solved over and over because messaging is a deep pattern, not a single protocol.

## Where this connects in the book

- **The MQTT chapter** — the long-form pair to the MQTT episode, walking from the 1999 satellite link through Facebook Messenger to Sparkplug B and MQTT-over-QUIC.
- **The AMQP chapter** — JPMorgan's frustration, the 2008 Hintjens memo, and the great 0-9-1-versus-1.0 schism.
- **The Kafka chapter** — the LinkedIn origin, the NetDB paper, KRaft, KIP-848, KIP-1150, and the diskless rearchitecture.
- **The CoAP chapter** — the IETF CoRE working group, RFC 7252, the observe extension, and the OSCORE-plus-EDHOC security stack.

## See also (other category episodes)

The Transport episode is the layer immediately below this one. Every member of this family runs over Layer 4 — MQTT, AMQP, STOMP, XMPP, and Kafka default to TCP; CoAP, MQTT-SN, and DDS-RTPS run on UDP; MQTT-over-QUIC rides QUIC for 0-RTT reconnect, NAT-rebinding survival, and head-of-line-blocking elimination across multiple QUIC streams. The Transport episode covers what's underneath every wire here.

The Web/API episode is the synchronous cousin. HTTP, REST, GraphQL, and gRPC are about request and response — somebody waits. CoAP is the bridge: it brings REST semantics to constrained devices and even defines a stateless mapping to HTTP for proxy interoperability. WebSocket, covered in the Web/API category, is the transport that carries STOMP, MQTT, and AMQP into browsers.

The Utilities and Security episode is the layer of cross-cutting plumbing. TLS 1.3 (RFC 8446) and DTLS 1.3 (RFC 9147) protect almost everything in this family. OAuth 2.0, JWT, and mTLS handle authentication: MQTT 5.0 supports enhanced authentication, AMQP 1.0 uses SASL over the wire, Kafka supports SASL/OAUTHBEARER. DNS — and increasingly mDNS for IoT discovery and DNS-SD for CoAP — handles broker location.

## Visual cues for image generation

- A side-by-side of a publish-subscribe broker and a Kafka log. Left: three sensors arrowing into a central broker box, three subscribers (Dashboard, Alert System, Database) arrowing out, captioned "consumed = deleted." Right: an append-only log labelled offsets 0, 42, 50, with three consumer groups reading at different positions, captioned "replayable."
- An MQTT control packet drawn to scale next to an HTTP/1.1 GET. The MQTT fixed header is two bytes wide, labelled "minimum control packet: 2 bytes total." The HTTP request beside it sprawls across multiple lines with headers.
- A timeline running 1993 to 2026 with eight pinned events: 1993 IBM MQ Series, 1999 MQTT v1 over satellite, 1999 jabberd released, 2003 AMQP at JPMorgan, 2007 RabbitMQ, 2011 Kafka open-sourced, 2014 RFC 7252 CoAP, 2025 Kafka 4.0 removes ZooKeeper, 2026 KIP-1150 Diskless Topics accepted.
- The MQTT QoS ladder: QoS 0 as a single arrow (PUBLISH), QoS 1 as a two-step (PUBLISH, PUBACK), QoS 2 as a four-step (PUBLISH, PUBREC, PUBREL, PUBCOMP). Each row labelled with its tradeoff.
- A decision-tree poster captioned "MQTT for things, AMQP for transactions, Kafka for logs, NATS for services, CoAP for sensors, XMPP for federation, STOMP for browsers." Each leaf shows a small icon — sensor, bank, log file, microservice, microcontroller, chat bubble, web browser.
- A schematic of the AWS Kinesis cascade on 25 November 2020. A capacity addition at 2:44 AM PST triggers thread-limit exhaustion across thousands of front-end servers. Cognito, CloudWatch, IoT Core, EventBridge, AutoScaling, and Lambda all greyed out. A dotted arrow shows the 17-hour recovery ending at 10:23 PM PST.
- Kafka's KIP-848 rebalance comparison. Top: classic protocol, 10 consumers and 900 partitions, 103 seconds, captioned "stop-the-world." Bottom: cooperative incremental rebalance, same scenario, 5 seconds, captioned "broker-driven."

## Sources

### RFCs

- [RFC 6120 — XMPP Core](https://datatracker.ietf.org/doc/rfc6120/)
- [RFC 7252 — The Constrained Application Protocol (CoAP)](https://www.rfc-editor.org/rfc/rfc7252)
- [RFC 9528 — EDHOC](https://datatracker.ietf.org/doc/html/rfc9528)

### Specifications

- [OASIS MQTT v5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- [OASIS MQTT v3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [OASIS AMQP 1.0 Overview](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)
- [STOMP 1.2 specification](https://stomp.github.io/stomp-specification-1.2.html)
- [Apache Kafka Protocol](https://kafka.apache.org/protocol)
- [Eclipse Sparkplug specification](https://sparkplug.eclipse.org/specification/)
- [AsyncAPI 3.0.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0)
- [MIMI Protocol drafts](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)

### Papers

- [Kreps, Narkhede & Rao — Kafka: a Distributed Messaging System for Log Processing (NetDB 2011)](https://notes.stephenholiday.com/Kafka.pdf)
- [Kleppmann & Kreps — Kafka, Samza and the Unix Philosophy of Distributed Data (2015)](https://martin.kleppmann.com/papers/kafka-debull15.pdf)

### Vendor / engineering blogs

- [HiveMQ — The History of MQTT, Part 1](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)
- [Engineering at Meta — Building Facebook Messenger](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/)
- [LinkedIn Engineering — The Log: What Every Software Engineer Should Know](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
- [WarpStream blog](https://www.warpstream.com/blog)
- [Confluent — Introducing Tableflow](https://www.confluent.io/blog/introducing-tableflow/)
- [Confluent — KIP-848: A New Consumer Rebalance Protocol](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/)
- [Confluent — Confluent acquires WarpStream](https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/)
- [Kai Waehner — The Rise of Diskless Kafka](https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/)
- [Andrew Baker — Apache Kafka 4.x: what KRaft and ZooKeeper removal mean](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)
- [Karafka — Kafka New Rebalance Protocol](https://karafka.io/docs/Kafka-New-Rebalance-Protocol/)
- [EMQX — MQTT over QUIC](https://www.emqx.com/en/blog/mqtt-over-quic)
- [RabbitMQ 4.0 release notes](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
- [RabbitMQ 4.3 release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)
- [CNCF — Protecting NATS](https://www.cncf.io/blog/2025/05/01/protecting-nats-and-the-integrity-of-open-source-cncfs-commitment-to-the-community/)
- [Eclipse Newsroom — Zenoh 1.0.0](https://newsroom.eclipse.org/news/announcements/eclipse-zenoh-100-debuts-redefining-connectivity-robotics-and-automotive)
- [PagerDuty — August 28 Kafka outages](https://www.pagerduty.com/eng/august-28-kafka-outages-what-happened-and-how-were-improving/)
- [Slack Engineering — Slack's outage on January 4th 2021](https://slack.engineering/slacks-outage-on-january-4th-2021/)
- [Slack Engineering — Slack's incident on 2-22-22](https://slack.engineering/slacks-incident-on-2-22-22/)
- [AWS — Summary of the Amazon Kinesis Event in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/11201/)
- [Inductive Automation — The co-inventor of MQTT, Andy Stanford-Clark](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-andy-stanfordclark-from-ibm)
- [Enterprise Integration Patterns — Messaging](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Messaging.html)

### News

- [CNBC — LinkedIn-backed Confluent files S-1 as yearly sales top $300 million](https://www.cnbc.com/2021/06/01/linkedin-backed-confluent-files-s-1-as-yearly-sales-top-300-million.html)
- [TechCrunch — Confluent acquires streaming data startup WarpStream](https://techcrunch.com/2024/09/09/confluent-acquires-streaming-data-startup-warpstream/)
- [The Register — AWS down (25 November 2020)](https://www.theregister.com/2020/11/25/aws_down/)

### Wikipedia

- [MQTT](https://en.wikipedia.org/wiki/MQTT)
- [Andy Stanford-Clark](https://en.wikipedia.org/wiki/Andy_Stanford-Clark)
- [Advanced Message Queuing Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)
- [XMPP](https://en.wikipedia.org/wiki/XMPP)
- [Jeremie Miller](https://en.wikipedia.org/wiki/Jeremie_Miller)
- [Neha Narkhede](https://en.wikipedia.org/wiki/Neha_Narkhede)
- [NATS Messaging](https://en.wikipedia.org/wiki/NATS_Messaging)
- [Data Distribution Service](https://en.wikipedia.org/wiki/Data_Distribution_Service)
- [RSocket](https://en.wikipedia.org/wiki/RSocket)
- [Matter (standard)](https://en.wikipedia.org/wiki/Matter_(standard))
