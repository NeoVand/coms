---
prompt_source: deep-research-prompts.txt:526-694 (ASYNC / IOT)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/3af9b9b4-5d4a-46d8-8b2e-8e5c2c4047d6
research_mode: claude.ai Research
---

# The Async / IoT Family of Network Protocols: A Field Guide for Engineers (2026 Edition)

> A bird's-eye narrative of message-oriented protocols — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka and their relatives — with origin stories, mechanics, famous outages, and the 2024–2026 frontier.

---

## Prerequisites and glossary

Before any member of this family makes sense, an engineer needs a small vocabulary. These are the load-bearing concepts that recur across every protocol below.

- **Asynchronous messaging**: A communication style in which the sender does not block waiting for a synchronous response; the message system stores or forwards the message, decoupling sender and receiver in time. Contrast with HTTP request/response. Authoritative explainer: Hohpe & Woolf, *Enterprise Integration Patterns*, "Messaging" pattern ([https://www.enterpriseintegrationpatterns.com/patterns/messaging/Messaging.html](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Messaging.html)).
- **Publish/Subscribe (pub/sub)**: A pattern where producers ("publishers") emit messages to a logical channel/topic, and any number of consumers ("subscribers") receive matching messages without the publisher knowing who they are. ([https://www.enterpriseintegrationpatterns.com/patterns/messaging/PublishSubscribeChannel.html](https://www.enterpriseintegrationpatterns.com/patterns/messaging/PublishSubscribeChannel.html))
- **Point-to-point queue**: A pattern where a message is delivered to exactly one of N competing consumers — work-queue semantics. ([https://www.enterpriseintegrationpatterns.com/patterns/messaging/PointToPointChannel.html](https://www.enterpriseintegrationpatterns.com/patterns/messaging/PointToPointChannel.html))
- **Broker**: A server-side process that accepts messages from publishers and dispatches them to subscribers/consumers, optionally persisting them. Examples: Mosquitto (MQTT), RabbitMQ (AMQP), Kafka brokers.
- **Topic / channel / destination / subject**: The hierarchical or flat string that identifies the logical "address" a message is sent to. Topic semantics are protocol-specific: MQTT uses `/`-separated wildcards (`+`, `#`); Kafka topics are partitioned logs; STOMP destinations are opaque strings the broker interprets ([https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html)). [Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)
- **QoS levels**: Quality-of-service guarantees for delivery. MQTT defines QoS 0 (at-most-once), QoS 1 (at-least-once), QoS 2 (exactly-once). ([https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/](https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/)) [Blogger](https://massivetechinterview.blogspot.com/2015/10/facebook-messenger-mqtt.html)
- **Delivery semantics**: At-most-once (may lose), at-least-once (may duplicate), exactly-once (deduplicated end-to-end — almost always achieved through idempotency or transactional commits).
- **Last Will and Testament (LWT)**: A message stored by the broker on connect and published if the client disconnects ungracefully — an MQTT primitive that has been copied widely ([https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)).
- **Retained message**: An MQTT feature where the broker stores the most recent message on a topic and delivers it immediately to any new subscriber.
- **Consumer group**: A Kafka concept in which a set of consumers cooperatively divide partitions of a topic for parallel consumption; only one consumer in a group reads any given partition ([https://kafka.apache.org/41/operations/consumer-rebalance-protocol/](https://kafka.apache.org/41/operations/consumer-rebalance-protocol/)). [Codestudy](https://www.codestudy.net/blog/who-built-kafka/)
- **Partition / shard**: A horizontally scalable unit of a topic; ordering is guaranteed within a partition but not across them.
- **Offset**: A monotonically increasing position in a partitioned log (Kafka's central abstraction).
- **Backpressure**: Mechanism by which a slow consumer signals upstream to slow down — explicit in AMQP 1.0 link credit ([https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)), in Reactive Streams/RSocket request-N ([https://rsocket.io/about/protocol/](https://rsocket.io/about/protocol/)), in TCP windowing.
- **Idempotency key**: A producer-supplied identifier used by consumers (or brokers) to deduplicate retries.
- **Dead letter queue (DLQ)**: A side queue for messages that repeatedly fail processing.
- **Schema registry**: A separate service that stores Avro/Protobuf/JSON-Schema versions of message payloads, enabling forward/backward-compatible evolution. Confluent Schema Registry and Apicurio are the canonical implementations.
- **Constrained device**: An IoT term for a node with extremely limited RAM/CPU/power — typically 8-bit microcontrollers with kilobytes of RAM. CoAP is targeted at these devices (RFC 7252, [https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)). [Liu](https://pike.lysator.liu.se/docs/ietf/rfc/72/rfc7252.xml)
- **MOM (Message-Oriented Middleware)**: The umbrella term for the whole family — a category that traces back to IBM MQSeries (1993) and TIBCO Rendezvous ([https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/](https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/)). [Cloud Integration](https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/)
- **JMS**: The Java Message Service — an *API*, not a wire protocol. Often confused with the protocols below; it can be implemented over AMQP, STOMP, or proprietary wires. [BNC](https://www.networxsecurity.org/en/members-area/glossary/a/amqp.html)

---

## The arc of the group

The story of async messaging is a story about *decoupling*. Every protocol in this family was invented because somebody got tired of synchronous, tightly coupled, point-to-point integration breaking in the same way for the same reason.

**Phase 1 — Mainframe-era MOM (1980s–early 2000s).** IBM shipped MQSeries (now IBM MQ) in 1993; it was the dominant guaranteed-delivery messaging product of the 1990s. TIBCO Rendezvous, also late 1980s/early 1990s, occupied the high-volume, multicast, fan-out niche — most famously in financial market data distribution ([https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/](https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/)). These were proprietary wire protocols guarded by enterprise sales teams. Sun's JMS specification (2001) tried to abstract over them with a Java API, but JMS is an API, not a wire format, so it didn't break vendor lock-in. [Cloud Integration](https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/)[Cloud Integration](https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/)

**Phase 2 — The IoT genesis (1999).** In early 1999, Andy Stanford-Clark of IBM and Arlen Nipper of Arcom Control Systems sketched the first version of what became MQTT, originally called "Argo Lightweight On The Wire Protocol" after an IBM codename. Their customer was Phillips 66; the problem was monitoring oil pipelines via expensive, intermittent satellite links ([https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/), [https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-andy-stanfordclark-from-ibm](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-andy-stanfordclark-from-ibm)). The key constraints — minimal bandwidth, tolerate disconnection, preserve battery — would turn out to be exactly the constraints of the smartphones, sensors, and connected vehicles that hadn't been invented yet. MQTT v2 (later 1999) added DISCONNECT, UNSUBSCRIBE, PING, will-messages and keepalives; that "necessary and sufficient" version was stable for ten years ([https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)). [Wikipedia](https://en.wikipedia.org/wiki/MQTT)[LinkedIn](https://www.linkedin.com/pulse/mqtt-internet-things-chuck-fried)

**Phase 3 — Open standards rebellion (1999–2014).** Three currents converged:

- **XMPP/Jabber**: Jeremie Miller released `jabberd` on January 4, 1999, intending an open, federated alternative to AOL/MSN/ICQ. The IETF's XMPP Working Group formalized the Jabber wire format as RFC 3920/3921 in 2004, revised as RFC 6120/6121/7622 in 2011 ([https://xmpp.org/about/history/](https://xmpp.org/about/history/), [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/)). [Wikipedia](https://en.wikipedia.org/wiki/XMPP)[Wikipedia](https://en.wikipedia.org/wiki/XMPP)
- **AMQP**: Conceived in 2003 by John O'Hara at JPMorgan Chase, who was tired of paying license fees and being unable to interoperate between vendors. JPMC contracted iMatix (Pieter Hintjens) to write a C broker; in 2005 a working group of 23 firms (Cisco, Red Hat, Bank of America, Goldman Sachs, etc.) formed; AMQP 1.0 was released October 2011 and ratified as an OASIS Standard October 2012, then ISO/IEC 19464 in 2014 ([https://www.amqp.org/node/54](https://www.amqp.org/node/54), [https://www.amqp.org/node/102](https://www.amqp.org/node/102), [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)). A famous dead end: in 2008 Hintjens distributed his memo "What is wrong with AMQP (and how to fix it)", left the working group, and built ZeroMQ — a brokerless library — instead ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)).
- **STOMP**: Created at Codehaus around 2005 (initial spec referenced as 2006/Stomp 1.0; STOMP 1.2 dated 2012) explicitly because scripting-language developers wanted to talk to message brokers without 50-page binary specs. It's the one protocol in this family you can speak via `telnet` ([https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html)).

**Phase 4 — The log revolution (2010–2015).** At LinkedIn around 2010, Jay Kreps, Jun Rao and Neha Narkhede looked at activity-event ingestion (billions of events/day) and decided that traditional message queues — ActiveMQ, RabbitMQ — gave too many guarantees for too high a cost, while log aggregators (Scribe, Flume) gave too few. They built Kafka, named after Franz Kafka because Jay Kreps liked the writer and the system was "optimised for writing" ([https://www.linkedin.com/pulse/kafkas-origin-story-linkedin-tanvir-ahmed](https://www.linkedin.com/pulse/kafkas-origin-story-linkedin-tanvir-ahmed), [https://www.oreilly.com/library/view/data-lake-for/9781787281349/1ed43286-4179-4c35-b044-4c1b379753d3.xhtml](https://www.oreilly.com/library/view/data-lake-for/9781787281349/1ed43286-4179-4c35-b044-4c1b379753d3.xhtml)). The seminal paper, "Kafka: a Distributed Messaging System for Log Processing" (Kreps, Narkhede, Rao), appeared at NetDB 2011 ([https://notes.stephenholiday.com/Kafka.pdf](https://notes.stephenholiday.com/Kafka.pdf)). Kafka was open-sourced in 2011; Kreps, Narkhede and Rao founded Confluent in 2014 with $500K seed from LinkedIn ([https://www.cnbc.com/2021/06/01/linkedin-backed-confluent-files-s-1-as-yearly-sales-top-300-million.html](https://www.cnbc.com/2021/06/01/linkedin-backed-confluent-files-s-1-as-yearly-sales-top-300-million.html)); Confluent went public in June 2021 with a $9.1B+ valuation. Jay Kreps' 2013 essay "The Log: What Every Software Engineer Should Know About Real-time Data's Unifying Abstraction" ([https://kafka.apache.org/community/books_and_papers/](https://kafka.apache.org/community/books_and_papers/)) is arguably the most-read systems-architecture essay of the decade and provides the conceptual frame for the entire post-2013 streaming wave. [Odbms](https://www.odbms.org/2011/01/kafka-a-distributed-messaging-system-for-log-processing/)

**Phase 5 — IETF standardisation for tiny things (2010–2014).** In parallel, the IETF CoRE working group, recognising that HTTP was too heavy for 8-bit microcontrollers, produced CoAP. RFC 7252 (Shelby, Hartke, Bormann) was published June 2014 ([https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)) — the same year that OASIS ratified MQTT 3.1.1 as a standard. [Google Scholar](https://scholar.google.com/scholar_lookup?hl=en&publication_year=2014&author=Z.+Shelby&author=K.+Hartke&author=C.+Bormann&title=The+constrained+application+protocol+(CoAP))[Google Scholar](https://scholar.google.com/scholar_lookup?hl=en&publication_year=2014&author=Z.+Shelby&author=K.+Hartke&author=C.+Bormann&title=The+constrained+application+protocol+(CoAP))

**Phase 6 — Cloud-native messaging (2015–2022).** NATS (Derek Collison, originally written for Cloud Foundry, rewritten in Go 2014) was accepted into the CNCF in March 2018 at incubating maturity ([https://www.cncf.io/projects/nats/](https://www.cncf.io/projects/nats/)). Apache Pulsar (Yahoo, 2013, donated to ASF 2016) brought a tiered architecture (separate broker and BookKeeper storage). MQTT 5.0 was ratified by OASIS in 2019, adding properties, reason codes, shared subscriptions, session/message expiry. RabbitMQ matured AMQP 1.0 support and added Streams. The Eclipse Sparkplug working group (Cirrus Link, HiveMQ, Chevron, Inductive Automation, others) standardised an MQTT topic namespace and Protobuf payload for industrial SCADA — Sparkplug B ([https://sparkplug.eclipse.org/](https://sparkplug.eclipse.org/)). [Data flow notes](https://alexendrascott01-sduzw.wordpress.com/2025/09/11/apache-pulsar-vs-kafka-which-is-better/)

**Phase 7 — Diskless and decoupled (2023–2026).** WarpStream's August 2023 "Kafka is dead, long live Kafka" post launched the diskless-Kafka movement: stateless agents writing directly to S3-class object stores, no local disks, no inter-AZ replication fees ([https://www.warpstream.com/](https://www.warpstream.com/), [https://github.com/AutoMQ/automq/wiki/WarpStream-is-dead,-long-live-AutoMQ](https://github.com/AutoMQ/automq/wiki/WarpStream-is-dead,-long-live-AutoMQ)). Confluent acquired WarpStream in September 2024 ([https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/](https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/)). On March 2, 2026, the Apache Kafka community accepted KIP-1150 (Diskless Topics) — formally validating the architecture ([https://www.warpstream.com/ai-info](https://www.warpstream.com/ai-info)). Kafka 4.0 (March 18, 2025) finalised the removal of ZooKeeper that had begun with KIP-500 in 2019 ([https://www.instaclustr.com/blog/kafka-4-0-unveiled-key-changes-and-how-they-impact-developers/](https://www.instaclustr.com/blog/kafka-4-0-unveiled-key-changes-and-how-they-impact-developers/), [https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)). [Stock Titan](https://www.stocktitan.net/news/CFLT/confluent-acquires-warp-stream-to-advance-next-gen-byoc-data-7orq5aqb86cf.html)[Andrew Baker](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)

The architects of this *field* — distinct from the architects of any single protocol — include Andy Stanford-Clark, Arlen Nipper, Jeremie Miller, John O'Hara, Pieter Hintjens, Jay Kreps, Neha Narkhede, Jun Rao, Carsten Bormann, Zach Shelby, Klaus Hartke, Roger Light, Derek Collison, and Martin Kleppmann (whose 2017/2024 book *Designing Data-Intensive Applications* is the field's textbook).

---

## Members and their roles

### MQTT (1999) — IBM/Arcom; Andy Stanford-Clark, Arlen Nipper

When to reach for it: any time devices on flaky networks need to publish small messages reliably. MQTT's identity is its *thrift* — fixed header is 2 bytes, the smallest control packet is 2 bytes total ([https://massivetechinterview.blogspot.com/2015/10/facebook-messenger-mqtt.html](https://massivetechinterview.blogspot.com/2015/10/facebook-messenger-mqtt.html)). Niche: the de facto language of IoT, Industrial IoT (with Sparkplug B), and — non-obviously — chat apps; Facebook Messenger has used MQTT since 2011 because TCP/HTTP burned battery and bandwidth on phones ([https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/)). Versions: 3.1 (royalty-free 2010), 3.1.1 (OASIS 2014, ISO/IEC 20922), 5.0 (OASIS 2019). MQTT-SN is a UDP/non-IP variant for Zigbee and 802.15.4 sensor meshes ([https://mqtt.org/mqtt-specification/](https://mqtt.org/mqtt-specification/)). [Blogger](https://massivetechinterview.blogspot.com/2015/10/facebook-messenger-mqtt.html)[HackerEarth](https://www.hackerearth.com/blog/developers/mqtt-protocol/)

### AMQP (2006) — JPMorgan Chase / OASIS

When to reach for it: financial-grade reliability across heterogeneous brokers, cross-vendor interoperability, multi-protocol Azure Service Bus or RabbitMQ deployments. AMQP 1.0 is *fundamentally different* from AMQP 0-9-1 (the protocol RabbitMQ originally implemented): 0-9-1 prescribes a broker model with exchanges, queues, and bindings; 1.0 is just a peer-to-peer wire protocol with link credit-based flow control and a self-describing type system, leaving the broker model to implementations ([https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html), [https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview)). This split is one of the great schisms of messaging — a developer who says "AMQP" usually means whichever version their employer happened to deploy, and the two are largely incompatible.

### CoAP (2014) — IETF; Shelby, Hartke, Bormann

When to reach for it: 6LoWPAN sensor networks, smart-energy, building automation — anywhere you have an 8-bit MCU and a 10s-of-kbit/s radio (RFC 7252). CoAP is "REST for tiny things" — UDP transport (optional reliability via confirmable messages), 4-byte header, URIs, GET/POST/PUT/DELETE, content formats, and a stateless HTTP mapping for proxy interop. Niche: secured by DTLS or, increasingly, OSCORE (RFC 8613) with EDHOC handshake (RFC 9528, March 2024) — a CoAP-native security stack designed not to rely on TLS handshakes that 8-bit chips cannot afford ([https://medium.com/@IoTerop/oscore-the-end-to-end-security-protocol-for-iot-4498cf3aa50a](https://medium.com/@IoTerop/oscore-the-end-to-end-security-protocol-for-iot-4498cf3aa50a), [https://datatracker.ietf.org/doc/html/rfc9528](https://datatracker.ietf.org/doc/html/rfc9528)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc7252)[Ericsson](https://www.ericsson.com/en/blog/2019/11/oscore-iot-security-protocol)

### STOMP (2005, 1.2 in 2012) — Codehaus

When to reach for it: when you want a human-readable, telnet-debuggable protocol; when you're writing a Ruby/Python/Perl client and don't have a JMS or AMQP library ([https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html)). Niche: the most common WebSocket-based broker protocol for browsers (Spring's `@MessageMapping` STOMP-over-WebSocket, RabbitMQ's Web-STOMP plugin). Frame format: command line + headers + null-terminated body. Frames: `SEND, SUBSCRIBE, UNSUBSCRIBE, BEGIN, COMMIT, ABORT, ACK, NACK, DISCONNECT, CONNECT, CONNECTED, MESSAGE, RECEIPT, ERROR`. Depth: low; deliberately so. [Stomp](https://stomp.github.io/)

### XMPP (1999, IETF 2004/2011) — Jeremie Miller

When to reach for it: federated, decentralized chat or presence; XML-based extensibility; anywhere you want server-to-server interop across administrative domains. Whatsapp's protocol was derived from XMPP; Zoom uses XMPP-derivatives for chat; Google Talk launched on XMPP in 2005. The core RFCs are 6120 (Core), 6121 (IM and Presence), 7622 (Address Format) ([https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/)). Niche: standards-based federation — the only family member that natively does cross-domain server-to-server like email does. [Wikipedia](https://en.wikipedia.org/wiki/Jeremie_Miller)

### Kafka wire protocol (2011) — LinkedIn / Apache

When to reach for it: high-throughput log/event streaming; "system of record" event store; exactly-once-with-idempotency; CQRS/event-sourcing/CDC pipelines. The wire protocol is binary, framed, length-prefixed, version-negotiated; the magic is the persistent partitioned log abstraction. Niche: Kafka is a *log*, not a queue — it remembers messages for a configurable retention period; consumers track their own offsets. As of Apache Kafka 4.1 (Sep 2025), share groups (KIP-932) bring queue-like semantics to Kafka itself ([https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)).

### Members that belong to the family but were missing from the source list

- **NATS / NATS JetStream**: CNCF incubating since March 2018 ([https://www.cncf.io/projects/nats/](https://www.cncf.io/projects/nats/)); Core NATS is brokerless-feel pub-sub at sub-ms latency, JetStream adds persistence, key-value, object store, and at-least/exactly-once. In April–May 2025, Synadia attempted to relicense the server under BUSL and "withdraw" the project; the CNCF refused, and the parties reached a settlement on May 1, 2025 ensuring NATS remains Apache-2.0 and CNCF-governed — a watershed moment for foundation-vs-vendor licensing fights ([https://www.cncf.io/blog/2025/05/01/protecting-nats-and-the-integrity-of-open-source-cncfs-commitment-to-the-community/](https://www.cncf.io/blog/2025/05/01/protecting-nats-and-the-integrity-of-open-source-cncfs-commitment-to-the-community/)). [NATS.io](https://nats.io/)
- **RabbitMQ wire protocols**: AMQP 0-9-1 historically; AMQP 1.0 is now a *core* protocol always enabled in RabbitMQ 4.0 (Sep 2024) ([https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)). Plus STOMP, MQTT, and the RabbitMQ Stream protocol. [GitHub](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
- **ZeroMQ / ZMTP**: A library, not a broker — the "post-AMQP" rebellion led by Pieter Hintjens. Wire protocol ZMTP is small and brokerless; widely used inside scientific computing and CERN.
- **JMS**: An API, not a wire protocol. Often implemented over AMQP, STOMP, or vendor wires.
- **DDS / RTPS**: OMG's Data Distribution Service, formally adopted 2004 ([https://www.omg.org/omg-dds-portal/](https://www.omg.org/omg-dds-portal/), [https://en.wikipedia.org/wiki/Data_Distribution_Service](https://en.wikipedia.org/wiki/Data_Distribution_Service)). Wire protocol RTPS (Real-Time Publish-Subscribe). Niche: hard real-time, mission-critical systems with strict QoS — air-traffic control, naval combat systems, and (crucially) ROS 2, the dominant robotics middleware. [Vanderbilt](https://www.dre.vanderbilt.edu/~schmidt/PDF/dds-sos.pdf)[Dds-foundation](https://www.dds-foundation.org/)
- **Apache Pulsar binary protocol**: BookKeeper-backed; tiered storage native; multi-tenancy; geo-replication. Apache project since 2016 ([https://www.confluent.io/kafka-vs-pulsar/](https://www.confluent.io/kafka-vs-pulsar/)). Adoption remains far behind Kafka. [Data flow notes](https://alexendrascott01-sduzw.wordpress.com/2025/09/11/apache-pulsar-vs-kafka-which-is-better/)[Confluent](https://www.confluent.io/kafka-vs-pulsar/)
- **OPC UA**: Industrial automation; binary plus XML SOAP variants. Often coexists with MQTT/Sparkplug at the OT/IT boundary.
- **LwM2M (OMA)**: A device-management protocol layered on CoAP for cellular-IoT.
- **WebSocket (RFC 6455)**: Not a messaging protocol per se — a transport — but heavily used to carry MQTT, STOMP, AMQP, and bespoke JSON pubsub from browsers.
- **Server-Sent Events (SSE, WHATWG/W3C)**: HTTP-native, server-push-only; one-way, simple, and currently enjoying a renaissance for LLM token streaming.
- **gRPC streaming**: HTTP/2-framed bidi streams over Protobuf; not pub/sub but a streaming RPC pattern.
- **RSocket**: Reactive Streams over TCP/WebSocket/Aeron; developed by Netflix with Facebook and Pivotal contributors ([https://en.wikipedia.org/wiki/RSocket](https://en.wikipedia.org/wiki/RSocket), [https://rsocket.io/about/protocol/](https://rsocket.io/about/protocol/)). Five interaction models including request-stream and request-channel. Niche use, mostly in reactive Java shops. [GitHub + 3](https://github.com/conan-io/wishlist/issues/231)
- **Solace SMF**: Solace's proprietary wire protocol behind PubSub+, dominant in financial-services low-latency.
- **IBM MQ wire protocol (MQI/MQTT precursor)**: Closed but standards-influenced; the historical ancestor ([https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/](https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/)).
- **Redis Streams (RESP)**: Log-like data structure inside Redis with consumer groups, XADD/XREAD/XREADGROUP. RESP is technically the wire protocol.
- **EMQX-specific extensions**: Particularly MQTT over QUIC (RFC 9000 transport), pioneered in EMQX 5.0; OASIS standardisation in progress ([https://www.emqx.com/en/blog/mqtt-over-quic](https://www.emqx.com/en/blog/mqtt-over-quic)).
- **MQTT-SN**: For non-IP / ZigBee / LoRa sensor networks; OASIS technical committee active 2024 ([https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=mqtt-sn](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=mqtt-sn)). [ZedIoT](https://zediot.com/blog/mqtt-sn-protocol-explained/)
- **Sparkplug B**: An MQTT *application* layer, Eclipse Foundation, Protobuf payloads, Birth/Death certificates, report-by-exception. Used by Chevron and across IIoT ([https://sparkplug.eclipse.org/](https://sparkplug.eclipse.org/)).
- **Eclipse Zenoh**: A new pub/sub/query/compute protocol from ZettaScale, Eclipse 1.0.0 in October 2024, 5-byte minimum wire overhead, ROS-recognised, designed for edge through cloud ([https://newsroom.eclipse.org/news/announcements/eclipse-zenoh-100-debuts-redefining-connectivity-robotics-and-automotive](https://newsroom.eclipse.org/news/announcements/eclipse-zenoh-100-debuts-redefining-connectivity-robotics-and-automotive), [https://zenoh.io/](https://zenoh.io/)). [IoT Now + 2](https://www.iot-now.com/2024/10/22/147409-eclipse-foundation-releases-zenoh-1-0-0-for-robotics-and-iot/)
- **Apache Iggy (incubating)**: Rust-native, io_uring-based message streaming; entered Apache Incubator in February 2025 ([https://iggy.apache.org/](https://iggy.apache.org/), [https://robustmq.com/en/Blogs/34](https://robustmq.com/en/Blogs/34)). [RobustMQ](https://robustmq.com/en/Blogs/34)
- **Diskless Kafka-protocol implementations**: WarpStream (Confluent), AutoMQ, Aiven Inkless, Buf Bufstream, Redpanda — all speak the Kafka wire protocol but rearchitect storage on object storage ([https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/](https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/)).
- **MIMI (More Instant Messaging Interoperability)**: An IETF working group (drafts 2024–2025) building HTTPS+MLS-based interop between end-to-end-encrypted messengers, partly in response to the EU Digital Markets Act ([https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)). MLS itself (RFC 9420) is the cryptographic substrate. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-mimi-protocol-04)

---

## Internal taxonomy — how to mentally cluster the members

There is no single dimension that separates these protocols cleanly. Eight axes are useful:

| Axis | Endpoints |
|---|---|
| Reliability | Best-effort (CoAP non-confirmable, NATS core) ↔ At-least-once (MQTT QoS1, Kafka with acks=all) ↔ Exactly-once (MQTT QoS2, Kafka idempotent producer + transactions) |
| Pattern | Pure pub/sub (MQTT, NATS) ↔ Queue (AMQP 0-9-1, JMS) ↔ Log (Kafka, Pulsar, Iggy) ↔ Request-Reply (CoAP, RSocket, NATS) |
| Persistence | Volatile (NATS core, ZeroMQ) ↔ Durable broker (RabbitMQ classic) ↔ Replicated log (Kafka, Pulsar, NATS JetStream, RabbitMQ Streams) ↔ Object-storage-backed (WarpStream, AutoMQ, Bufstream) |
| Wire format | Text (STOMP, XMPP) ↔ Binary (MQTT, AMQP 1.0, Kafka, CoAP, DDS-RTPS, Sparkplug B) |
| Transport | UDP (CoAP, MQTT-SN, DDS) ↔ TCP (most) ↔ WebSocket (STOMP, MQTT, AMQP) ↔ QUIC (MQTT over QUIC, increasingly) |
| Architecture | Brokerless (NATS core, ZeroMQ, DDS, Zenoh) ↔ Single broker (Mosquitto) ↔ Clustered broker (Kafka, RabbitMQ, NATS JetStream) ↔ Federated (XMPP, MIMI, AMQP 1.0 routers) |
| Topology focus | Tree topics with wildcards (MQTT) ↔ Exchange-with-bindings (AMQP 0-9-1) ↔ Flat partitioned topics (Kafka) ↔ Subject-tree (NATS) ↔ Key-expression with content (Zenoh) |
| Constrained device fit | Excellent (MQTT, MQTT-SN, CoAP, Zenoh) ↔ Adequate (NATS) ↔ Poor (Kafka, AMQP 1.0, XMPP, Pulsar) |

**A decision tree (heuristic, not law):**

1. Tiny battery-powered MCU, intermittent radio? → **MQTT** (or MQTT-SN over Zigbee/LoRa, CoAP if you want REST semantics, OSCORE+EDHOC for security).
2. Industrial automation, plant floor, SCADA? → **MQTT + Sparkplug B** (or DDS for hard real-time control loops, or Zenoh if you're starting fresh in 2026).
3. Robotics? → **DDS** (ROS 2 default) or **Zenoh** (increasingly).
4. Browser-side push? → **WebSocket + STOMP** or **SSE** for one-way; **WebSocket + MQTT** for IoT dashboards.
5. Cross-org/financial messaging with transactional guarantees? → **AMQP 1.0** (RabbitMQ, Azure Service Bus, Solace).
6. Microservice-to-microservice low-latency request/response and pub/sub? → **NATS / NATS JetStream**.
7. Ingest billions of events/day, replay them, feed an analytics lake? → **Kafka** (or one of its diskless drop-ins: WarpStream, AutoMQ, Bufstream, Redpanda).
8. Federated chat, presence, XMPP-style? → **XMPP**, soon **MIMI/MLS**.
9. Reactive request-stream / request-channel between services? → **RSocket** or **gRPC streaming**.

A simpler one-liner: **MQTT for things, AMQP for transactions, Kafka for logs, NATS for services, CoAP for sensors, XMPP for federation, STOMP for browsers.**

---

## How this group interacts with other protocol groups

**Below in the stack:** Every member runs over Layer 4. MQTT, AMQP, STOMP, XMPP, Kafka, RSocket, gRPC streaming all default to TCP. CoAP, MQTT-SN and DDS-RTPS run on UDP. MQTT over QUIC (EMQX 5.0+, OASIS work in progress) rides QUIC for 0-RTT reconnect, NAT rebinding survival, and head-of-line-blocking elimination across multiple QUIC streams ([https://www.emqx.com/en/blog/mqtt-over-quic](https://www.emqx.com/en/blog/mqtt-over-quic)). Security is layered through TLS 1.3 (RFC 8446), DTLS 1.3 (RFC 9147) for UDP-based protocols, OSCORE (RFC 8613) and EDHOC (RFC 9528, March 2024) for constrained nodes. [EMQX](https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/introduction.html)

**Adjacent at the application layer:**

- **HTTP / HTTP/2 / HTTP/3**: Often the alternative; CoAP defines a stateless mapping to HTTP for proxies (RFC 7252). Tableflow-style architectures use HTTP-based catalog APIs (Iceberg REST) on top of Kafka topics. [IETF](https://datatracker.ietf.org/doc/rfc7252/)
- **gRPC streaming**: Frequently confused with messaging; really a streaming RPC framework over HTTP/2, not pub/sub. Useful for service-to-service request-stream patterns.
- **WebSocket (RFC 6455)**: A transport that carries STOMP, MQTT, AMQP into browsers.
- **GraphQL subscriptions**: Web-tier pub/sub, often layered on WebSocket; doesn't compete directly with broker protocols but consumes them.
- **WebRTC, RTP, SIP**: Real-time media; orthogonal but often co-deployed in chat platforms (XMPP's Jingle, RFC 6120 §1.4, was an early example).

**Utilities and security:**

- **DNS (and increasingly mDNS for IoT discovery, DNS-SD for CoAP)**: Service discovery and broker location.
- **OAuth 2.0, JWT, mTLS**: Authentication. MQTT 5.0 supports enhanced authentication (SASL-style); AMQP 1.0 uses SASL over the wire; Kafka supports SASL/OAUTHBEARER.
- **Schema registries (Confluent, Apicurio)**: Sit beside the broker, not inside it; carry Avro/Protobuf/JSON Schema versions referenced from message headers.

**Where this group sits in the OSI stack:** Application layer (L7). It depends on transport (L4: TCP/UDP/QUIC) and security (TLS/DTLS/OSCORE). Above it, *event-driven application architectures* depend on it — service meshes (Istio), event-sourcing/CQRS frameworks, stream processors (Flink, Spark Structured Streaming), table formats (Apache Iceberg via Tableflow).

**A non-obvious connection:** Apache Iceberg, a *table format*, has become coupled to Kafka/streaming through Confluent Tableflow ([https://www.confluent.io/blog/introducing-tableflow/](https://www.confluent.io/blog/introducing-tableflow/)) and competing implementations. Streaming and analytical batch are converging at the storage layer; the question "is this a Kafka topic or an Iceberg table?" is increasingly a deployment choice, not a design choice.

---

## Common patterns and failure modes

### Recurring design patterns

- **Heartbeats / keepalives**: MQTT PINGREQ/PINGRESP, AMQP empty frames, NATS PING/PONG, STOMP heart-beat header ([https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html)). Without them, half-open TCP connections become "zombie connections" that cost memory but never deliver. [Apache](https://artemis.apache.org/components/artemis/documentation/latest/stomp.html)
- **Last Will and Testament**: MQTT 1999 invention, since copied; the broker publishes a stored message when a client's connection dies abnormally.
- **Retained messages**: MQTT's "current value" trick — a retained message is delivered to every new subscriber instantly.
- **Durable subscriptions / consumer groups**: AMQP's durable queues, MQTT 5.0 session expiry, Kafka consumer groups, NATS JetStream durables.
- **Dead-letter queues**: Universal across AMQP brokers, RabbitMQ, ActiveMQ; Kafka uses convention rather than primitive.
- **Partition rebalancing**: Kafka's classic and (since KIP-848 in Kafka 3.7 EA, 4.0 GA, March 2025) cooperative incremental rebalance protocol replaces stop-the-world rebalances with broker-driven incremental ownership transfer ([https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/), [https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)). 10 consumers and 900 partitions: 5 seconds with KIP-848 versus 103 seconds with the classic protocol ([https://karafka.io/docs/Kafka-New-Rebalance-Protocol/](https://karafka.io/docs/Kafka-New-Rebalance-Protocol/)). [Karafka](https://karafka.io/docs/Kafka-New-Rebalance-Protocol/)
- **Backpressure**: AMQP 1.0 link credit, Reactive Streams request-N (RSocket), TCP windowing (others). [Rsocket](https://rsocket.io/about/protocol/)
- **Idempotency keys / message deduplication**: Kafka idempotent producer (PID + sequence number), MQTT packet-identifier semantics for QoS2, application-level UUIDs for everyone else.
- **Saga / outbox pattern**: A relational-database row written transactionally with a "to-publish" flag, read by a relay process, published to Kafka/AMQP. The de facto answer to dual-write inconsistency; popularised in Chris Richardson's *Microservices Patterns* (2018).
- **CQRS / event sourcing**: Kafka topics as the system of record; reads from materialised views built by stream processors.
- **Fan-out vs work-queue**: Pub/sub is fan-out; AMQP queues with competing consumers and Kafka consumer groups are work-queues. Sparkplug B explicitly uses MQTT pub/sub but constrains it for SCADA n:1 integration ([https://i-flow.io/en/ressources/what-is-sparkplug-b-pros-and-cons-of-the-standard/](https://i-flow.io/en/ressources/what-is-sparkplug-b-pros-and-cons-of-the-standard/)).

### Group-wide failure modes

- **Broker partitions / split-brain**: ZooKeeper-managed Kafka clusters were notorious for ZK quorum loss; KRaft (KIP-500, GA in Kafka 3.3 in 2022, ZooKeeper removed entirely in Kafka 4.0 in March 2025) consolidates metadata into the cluster itself ([https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)). [Instaclustr](https://www.instaclustr.com/blog/kafka-4-0-unveiled-key-changes-and-how-they-impact-developers/)
- **Head-of-line blocking**: A slow message holds up an entire ordered stream. MQTT over QUIC mitigates this by separating subscription-streams ([https://www.emqx.com/en/blog/mqtt-over-quic](https://www.emqx.com/en/blog/mqtt-over-quic)).
- **Slow-consumer problem**: A consumer that can't keep up forces the broker to buffer indefinitely or drop messages. Kafka's answer is consumer-controlled offsets and retention; AMQP's is consumer prefetch + flow control; RabbitMQ historically suffered when classic mirrored queues fell behind.
- **Message storms**: Reconnect storms after broker outages saturate CPU. Mitigations: jittered exponential backoff in clients.
- **Retention exhaustion**: Disk fills before old messages age out; Kafka's tiered storage (KIP-405, GA Kafka 3.6) and diskless variants address this directly.
- **Zombie connections**: Half-open TCP that brokers think are alive — heartbeats and TCP keepalives address them.
- **Duplicate-delivery cascades**: At-least-once delivery + retry storms = exponential message multiplication. Idempotency keys are the only real fix.
- **Ordering violations**: Cross-partition ordering is not guaranteed; engineers routinely misuse Kafka by assuming global order across partitions.
- **OOM from queue buildup**: Backpressure-less producers + stalled consumers = broker OOM.

A note on *metastable failure*: Slack's 2-22-22 incident is a near-textbook case where a cache-tier disturbance pushed the system into a self-reinforcing failure mode that needed external intervention to break ([https://slack.engineering/slacks-incident-on-2-22-22/](https://slack.engineering/slacks-incident-on-2-22-22/)). The same shape appears in many messaging outages.

---

## Industry timeline

- **1993** — IBM MQSeries v1 (eventually IBM MQ).
- **1997** — TIBCO Rendezvous dominant in finance fan-out.
- **1999** — MQTT v1 by Stanford-Clark and Nipper. Jeremie Miller releases jabberd. [XMPP](https://xmpp.org/about/history/)[Wikipedia](https://en.wikipedia.org/wiki/XMPP)
- **2001** — JMS 1.0.2 published.
- **2003** — John O'Hara at JPMC starts the AMQP project.
- **2004** — XMPP RFCs 3920/3921 published. DDS adopted by OMG.
- **2005** — STOMP appears at Codehaus.
- **2006** — AMQP 0-8 published; RabbitMQ founded by Rabbit Technologies.
- **2010** — IBM releases MQTT 3.1 royalty-free. Kafka first deployed at LinkedIn.
- **2011** — Kafka NetDB paper (Kreps, Narkhede, Rao); open-sourced. RabbitMQ acquired by VMware. AMQP 1.0 published. Facebook Messenger ships with MQTT (Lucy Zhang) ([https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/)). [Odbms](https://www.odbms.org/2011/01/kafka-a-distributed-messaging-system-for-log-processing/)[HackerEarth](https://www.hackerearth.com/blog/developers/mqtt-protocol/)
- **2012** — AMQP 1.0 ratified as OASIS Standard. STOMP 1.2.
- **2013** — IBM submits MQTT to OASIS. Apache Pulsar created at Yahoo. [MindMajix](https://mindmajix.com/apache-kafka-vs-apache-pulsar)
- **2014** — CoAP RFC 7252. MQTT 3.1.1 OASIS standard. ISO/IEC 19464 (AMQP). Confluent founded. Mosquitto donated to Eclipse.
- **2015** — Kafka becomes the de facto streaming standard.
- **2016** — Pulsar to Apache Incubator.
- **2018** — NATS into CNCF (March 15, 2018). MQTT 5.0 work intensifies. AWS launches MSK.
- **2019** — MQTT 5.0 ratified by OASIS. KIP-500 proposed.
- **2020** — KIP-500 Raft work merged. November 25 Kinesis outage cascades across us-east-1 ([https://aws.amazon.com/message/11201/](https://aws.amazon.com/message/11201/)). Pandemic-driven streaming surge.
- **2021** — Confluent IPO (June). Slack January 4 outage (TGW scaling) ([https://slack.engineering/slacks-outage-on-january-4th-2021/](https://slack.engineering/slacks-outage-on-january-4th-2021/)). Kafka 2.8 ships KRaft EA. [Towards Data Science](https://towardsdatascience.com/kafka-no-longer-requires-zookeeper-ebfbf3862104/)
- **2022** — KRaft GA in Kafka 3.3. Pulsar mature. EMQX 5.0 introduces MQTT over QUIC. AMQP 1.0 dominant in Azure Service Bus.
- **2023** — WarpStream "Kafka is dead, long live Kafka" (August). KIP-848 EA in Kafka 3.7. Iggy.rs side project begins. MQTT 5.0 widely adopted.
- **2024** — Tableflow announced (Confluent). RabbitMQ 4.0 ships (AMQP 1.0 as core protocol, classic queue mirroring removed). EDHOC RFC 9528 published (March). Eclipse Zenoh 1.0.0 (October). Confluent acquires WarpStream (September 9). AsyncAPI 3.0 released (December 2023, refined throughout 2024). Matter 1.4 (November). Synadia attempts NATS license change (April 2025), settled May 1, 2025. [Rabbitmq + 3](https://blog.rabbitmq.com/docs/4.0/whats-new)
- **2025** — Kafka 4.0 (March 18): ZooKeeper removed, KIP-848 GA. Kafka 4.1 (September): share groups (KIP-932) preview. Iggy joins Apache Incubator (February). Aiven proposes KIP-1150 (Diskless Topics). KIP-1176 (Slack), KIP-1183 (AutoMQ) propose alternative diskless designs. Confluent Tableflow Delta+Unity Catalog GA. NATS governance settled. PagerDuty Kafka outage August 28 ([https://www.pagerduty.com/eng/august-28-kafka-outages-what-happened-and-how-were-improving/](https://www.pagerduty.com/eng/august-28-kafka-outages-what-happened-and-how-were-improving/)). [Andrew Baker](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)[RobustMQ](https://robustmq.com/en/Blogs/34)
- **2026** — KIP-1150 accepted by Apache Kafka community on March 2 with 9 binding + 5 non-binding votes ([https://www.warpstream.com/ai-info](https://www.warpstream.com/ai-info)). Kafka 4.2 expected to mark Queues for Kafka production-ready. RabbitMQ 4.3 (April 2026) introduces JMS Queues (Tanzu) and 32 priority levels for quorum queues ([https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)). [Andrew Baker](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)[RabbitMQ](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)

Pushers across the field: **Apache Software Foundation** (Kafka, Pulsar, ActiveMQ, Iggy), **Eclipse Foundation** (Mosquitto, Paho, Sparkplug, Zenoh, Californium for CoAP), **OASIS** (MQTT, AMQP), **IETF** (CoAP, XMPP, MIMI, MLS), **CNCF** (NATS, AsyncAPI hosted), **OMG** (DDS), **Connectivity Standards Alliance** (Matter), and the commercial hyperscalers (Confluent, HiveMQ, Solace, Synadia, Cedalo, Buf, AutoMQ, Aiven, Redpanda, EMQ, RTI). The proportion of innovation coming from VC-funded vendors versus foundation-led communities has shifted sharply toward vendors in 2023–2026, with the NATS licensing scare and the diskless-Kafka KIP wars as flashpoints.

---

## Recommended learning paths (current as of May 2026)

A reasonable order: read Kleppmann, then the Kafka NetDB paper, then the MQTT and CoAP RFCs, then *Enterprise Integration Patterns*, then build something with NATS and Mosquitto in a weekend.

### Authoritative specifications (with section pointers)

- **MQTT 5.0** — OASIS Standard, 2019. [https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html) (Section 3 control packets; §4.6 retained messages; §3.1.2.5 will message). Last updated 2019.
- **MQTT 3.1.1** — ISO/IEC 20922:2016. [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html). 2014/2016.
- **MQTT-SN 1.2** — Pre-OASIS specification. [https://image.mqtt.cn/wp-content/uploads/2024/03/2024032209060883.pdf](https://image.mqtt.cn/wp-content/uploads/2024/03/2024032209060883.pdf). 1.2 from ~2013; OASIS work in progress 2024.
- **OASIS AMQP 1.0** — [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html) (Part 0 Overview; Part 2 Transport for sessions/links/flow control; Part 3 Messaging). 2012; ISO/IEC 19464:2014.
- **CoAP** — RFC 7252 (Shelby, Hartke, Bormann). [https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252) (§3 Message Format; §4 Message Transmission; §5 Request/Response; §10.1 HTTP Mapping). June 2014.
- **CoAP Observe** — RFC 7641. **CoAP Block-wise** — RFC 7959. **OSCORE** — RFC 8613. **EDHOC** — RFC 9528 (March 2024) [https://datatracker.ietf.org/doc/html/rfc9528](https://datatracker.ietf.org/doc/html/rfc9528). **DTLS 1.3** — RFC 9147.
- **STOMP 1.2** — [https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html). 2012, current.
- **XMPP Core** — RFC 6120 [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/) (§4 XML streams; §6 SASL; §7 Resource Binding); **XMPP IM/Presence** — RFC 6121; **Address Format** — RFC 7622. March 2011 / 2015.
- **Apache Kafka Protocol** — [https://kafka.apache.org/protocol](https://kafka.apache.org/protocol) (current; covers RPC framing, ConsumerGroupHeartbeat API for KIP-848, Produce/Fetch). Last updated continuously; major changes in Kafka 4.0 (March 2025).
- **OMG DDS 1.4** — [https://www.omg.org/spec/DDS/1.4/PDF](https://www.omg.org/spec/DDS/1.4/PDF). April 2015.
- **AsyncAPI 3.0.0** — [https://www.asyncapi.com/docs/reference/specification/v3.0.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0). December 2023.
- **MIMI Protocol drafts** — [https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/) (latest -05, October 2025).
- **Sparkplug 3.0** — Eclipse Foundation Specification Process. [https://sparkplug.eclipse.org/specification/](https://sparkplug.eclipse.org/specification/). 2022 release; v3.x current; v4 work ongoing.

### Books

- **Martin Kleppmann (with Chris Riccomini), *Designing Data-Intensive Applications*, 2nd ed.** O'Reilly, 2024 (early release through 2025). Chapter 11 covers stream processing and is the reference for the entire log-based view; the second edition cuts MapReduce coverage and adds cloud-era material ([https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/), [https://newsletter.pragmaticengineer.com/p/designing-data-intensive-applications](https://newsletter.pragmaticengineer.com/p/designing-data-intensive-applications)). **Intermediate–Advanced**. 2024. [GitHub](https://github.com/ps06756/Designing-Data-Intensive-Applications)[The Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/designing-data-intensive-applications)
- **Hohpe & Woolf, *Enterprise Integration Patterns*.** Addison-Wesley, 2003 — still the canonical pattern catalog for messaging. Free index at [https://www.enterpriseintegrationpatterns.com/](https://www.enterpriseintegrationpatterns.com/). **Intermediate**. 2003 (still the reference; 2024 e-edition updates).
- **Narkhede, Shapira, Palino & McCabe, *Kafka: The Definitive Guide*, 2nd ed.** O'Reilly, 2021. Predates KIP-848 and KRaft GA. **Intermediate**. 2021.
- **HiveMQ, *MQTT Essentials*** (free e-book; serial blog). [https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/](https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/). Continuously updated; 2024 covers MQTT 5.0 and Sparkplug. **Intro**. 2024.
- **Bormann, Hartke, Shelby, *CoAP and the IoT***, plus the IETF CoRE WG documents. Several edited monographs since 2014.

### Academic papers

- Kreps, Narkhede, Rao, "Kafka: a Distributed Messaging System for Log Processing." NetDB 2011. [https://notes.stephenholiday.com/Kafka.pdf](https://notes.stephenholiday.com/Kafka.pdf) — the founding text. **Advanced**. 2011. [Odbms](https://www.odbms.org/2011/01/kafka-a-distributed-messaging-system-for-log-processing/)
- Kleppmann & Kreps, "Kafka, Samza and the Unix Philosophy of Distributed Data." IEEE Data Eng. Bulletin, 2015. [https://martin.kleppmann.com/papers/kafka-debull15.pdf](https://martin.kleppmann.com/papers/kafka-debull15.pdf). 2015.
- Castro Fernandez, Pietzuch, Kreps et al., "Liquid: Unifying Nearline and Offline Big Data Integration." CIDR 2015. 2015.
- "Metastable Failures in Distributed Systems." Bronson, Charapko, Aghayev, Zhu, HotOS 2021 — repeatedly cited in Slack's post-mortems ([https://slack.engineering/slacks-incident-on-2-22-22/](https://slack.engineering/slacks-incident-on-2-22-22/)). **Advanced**. 2021.
- Eugster, Felber, Guerraoui, Kermarrec, "The Many Faces of Publish/Subscribe." ACM Computing Surveys, 2003 — the canonical pub/sub survey.

### Long-form engineering blog posts

- Jay Kreps, "The Log: What every software engineer should know about real-time data's unifying abstraction." LinkedIn Engineering, 2013 ([https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)). **Required reading.** 2013.
- Lucy Zhang, "Building Facebook Messenger." Engineering at Meta, August 12, 2011. [https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/). The MQTT-on-mobile origin story. 2011.
- "Slack's Outage on January 4th 2021." Slack Engineering, February 2021. [https://slack.engineering/slacks-outage-on-january-4th-2021/](https://slack.engineering/slacks-outage-on-january-4th-2021/). The TGW scaling story.
- "Slack's Incident on 2-22-22." Slack Engineering, 2022. [https://slack.engineering/slacks-incident-on-2-22-22/](https://slack.engineering/slacks-incident-on-2-22-22/). Cache + scatter-query metastable failure.
- "Summary of the Amazon Kinesis Event in the Northern Virginia (US-EAST-1) Region." AWS, November 25, 2020. [https://aws.amazon.com/message/11201/](https://aws.amazon.com/message/11201/). Thread-limit cascade.
- "How Discord Stores Trillions of Messages" (Cassandra→Scylla). 2023. Plus the original Cassandra-on-Kafka GCP outage post-mortem ([https://grafana.com/blog/2020/01/23/how-a-gcp-persistent-disk-incident-snowballed-into-a-23-hour-outage--and-taught-us-some-important-lessons/](https://grafana.com/blog/2020/01/23/how-a-gcp-persistent-disk-incident-snowballed-into-a-23-hour-outage--and-taught-us-some-important-lessons/)).
- "October 21 post-incident analysis." GitHub, 2018. [https://github.blog/news-insights/company-news/oct21-post-incident-analysis/](https://github.blog/news-insights/company-news/oct21-post-incident-analysis/). Orchestrator/Raft/MySQL split brain — adjacent to messaging but mechanistically identical. [GitHub](https://github.blog/news-insights/company-news/oct21-post-incident-analysis/)
- WarpStream blog series, 2023–2026. [https://www.warpstream.com/blog](https://www.warpstream.com/blog). The diskless architecture gospel.
- Kai Waehner, "The Rise of Diskless Kafka." 2025. [https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/](https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/). 2025.
- Confluent, "KIP-848: A New Consumer Rebalance Protocol for Apache Kafka 4.0." [https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/). 2025.
- "PagerDuty August 28, 2025 Kafka outages." [https://www.pagerduty.com/eng/august-28-kafka-outages-what-happened-and-how-were-improving/](https://www.pagerduty.com/eng/august-28-kafka-outages-what-happened-and-how-were-improving/). 2025.
- Cloudflare's QUIC and post-quantum-TLS series; Stripe's idempotency-key blog post (2017, still relevant).
- HiveMQ and EMQX blogs are the best continuously-updated MQTT operations references.

### YouTube / video

- Tim Berglund, "Apache Kafka in 6 Minutes" and the "Distributed Systems in One Lesson" series (Confluent Developer YouTube). Continuously maintained 2018–2025.
- Jay Kreps, "I Heart Logs" (2014). Foundational.
- Andy Stanford-Clark and Arlen Nipper interviews on Inductive Automation podcast ([https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-andy-stanfordclark-from-ibm](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-andy-stanfordclark-from-ibm)).
- Frédéric Desbiens, "zenoh: A Next-Generation Protocol for IoT and Edge Computing." YouTube, Eclipse Foundation. 2024. [YouTube](https://www.youtube.com/watch?v=8bHFEBfRJU8)
- Kafka Summit / Current 2024–2025 conference recordings (Confluent YouTube). KIP-848 deep dive talks, Tableflow keynote, KIP-1150 panels.

### Podcasts

- *Streaming Audio* by Confluent — episodes on KIP-500, KIP-848, Tableflow, Kora, Iceberg.
- *Software Engineering Daily* — RSocket with Ryland Degnan (2019); many MQTT/Kafka episodes.
- *The Monitoring Experts* — Roger Light on Mosquitto's history (Dec 2023). [Apple Podcasts](https://podcasts.apple.com/us/podcast/the-story-of-eclipse-mosquitto-mqtt-broker/id1656923231?i=1000637671351)
- *The Pragmatic Engineer* — Martin Kleppmann on the second edition of *Designing Data-Intensive Applications* (2024). [The Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/designing-data-intensive-applications)
- *Inductive Conversations* — MQTT origin stories with Stanford-Clark and Nipper.
- *Downtime Project* — episode on Slack's January 2021 outage.

### University courses (free)

- **MIT 6.5840 (formerly 6.824) Distributed Systems** — Robert Morris and Frans Kaashoek. [https://pdos.csail.mit.edu/6.824/](https://pdos.csail.mit.edu/6.824/). 2024 schedule. Raft, replicated state machines. **Advanced**.
- **CMU 15-445 / 15-721 Database Systems** — Andy Pavlo. [https://15445.courses.cs.cmu.edu/](https://15445.courses.cs.cmu.edu/). 2024. Storage and concurrency context for log-based systems.
- **CMU 15-440 Distributed Systems** — annually updated.
- **Stanford CS244** — Advanced Topics in Networking.
- **Berkeley CS162 / CS262**.

### Hands-on tools (last update)

- **HiveMQ public broker** at `broker.hivemq.com` and the test broker at `test.mosquitto.org` — free MQTT brokers for learning. Continuously available.
- **MQTT Explorer** — desktop GUI for MQTT. [https://mqtt-explorer.com](https://mqtt-explorer.com). Last major release 2024.
- **MQTTX** (EMQ) — cross-platform MQTT client. [https://mqttx.app](https://mqttx.app). Active 2025.
- **kcat (formerly kafkacat)** — command-line Kafka consumer/producer. [https://github.com/edenhill/kcat](https://github.com/edenhill/kcat). Active.
- **kafkactl**, **Kafka UI** (Kafbat / Provectus). Active 2025.
- **RabbitMQ Management UI** — built into the broker.
- **NATS CLI (`nats`)** — `https://github.com/nats-io/natscli`. Active.
- **Wireshark** with MQTT, AMQP 0-9-1, AMQP 1.0, CoAP, Kafka dissectors. Active.
- **Eclipse Paho** clients for MQTT in nearly every language.
- **Eclipse Californium** for CoAP.

### Conferences

- **Kafka Summit / Current** (formerly two events, merged in 2023). Confluent-anchored but increasingly multi-vendor in 2025–2026.
- **KubeCon + CloudNativeCon** — NATS, AsyncAPI, Knative Eventing.
- **QCon** — practitioner architecture talks.
- **IETF plenary** — three a year; CoRE, MIMI, MLS, QUIC working groups all relevant.
- **USENIX OSDI / NSDI / ATC** — academic systems.
- **SIGCOMM, SIGMOD** — networking and database academic.
- **RealTime Conf** — by ZettaScale and friends, increasingly the home of Zenoh.
- **Embedded World** — for IIoT/Sparkplug.

---

## Where things are heading (2025–2026 frontier)

The prevailing direction across 2024–2026 is **decoupling the log from the broker, the topic from the table, and the protocol from the implementation**.

**Diskless Kafka has won the architectural argument.** WarpStream pioneered, AutoMQ shipped a forked-Kafka diskless variant, Buf released Bufstream, Aiven proposed KIP-1150 (Diskless Topics), Slack proposed KIP-1176 (fast-tiering via cloud WAL), AutoMQ proposed KIP-1183 ([https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/](https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/)). On March 2, 2026 the Apache Kafka community accepted KIP-1150 with a 9-binding/5-non-binding vote ([https://www.warpstream.com/ai-info](https://www.warpstream.com/ai-info)). Aiven shipped its commercial implementation, Inkless, ahead of the merge. Confluent's acquisition of WarpStream (September 2024, [https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/](https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/)) is the single biggest commercial move in the family in 24 months. [Stock Titan](https://www.stocktitan.net/news/CFLT/confluent-acquires-warp-stream-to-advance-next-gen-byoc-data-7orq5aqb86cf.html)

**KRaft is over the line.** ZooKeeper is gone in Kafka 4.0 (March 18, 2025). Production migrations, especially on Amazon MSK, remain non-trivial — MSK does not support in-place ZK→KRaft migration, requiring a full cluster move ([https://www.kai-waehner.de/blog/2025/09/07/kafka-zookeeper-removal-amazon-msk-requires-migration/](https://www.kai-waehner.de/blog/2025/09/07/kafka-zookeeper-removal-amazon-msk-requires-migration/)). [Kai Waehner](https://www.kai-waehner.de/blog/2025/09/07/kafka-zookeeper-removal-amazon-msk-requires-migration/)

**KIP-848 is GA, KIP-932 share groups are next.** The new ConsumerGroupHeartbeat API moves rebalancing logic to the broker and makes rebalances fully incremental. Kafka 4.1 (September 2025) brings share groups in preview; Kafka 4.2 is expected to mark them production-ready ([https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)). [Instaclustr](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)[Andrew Baker](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)

**Iceberg-as-Kafka-storage.** Confluent Tableflow (GA March 2025), WarpStream Tableflow, AutoMQ's Iceberg-aware variants, Redpanda's Iceberg topics — the question is no longer "can a Kafka topic be a table?" but "what is the right materialization model?" ([https://www.confluent.io/blog/introducing-tableflow/](https://www.confluent.io/blog/introducing-tableflow/), [https://www.warpstream.com/blog/the-case-for-an-iceberg-native-database-why-spark-jobs-and-zero-copy-kafka-wont-cut-it](https://www.warpstream.com/blog/the-case-for-an-iceberg-native-database-why-spark-jobs-and-zero-copy-kafka-wont-cut-it)). [Confluent](https://www.confluent.io/blog/introducing-tableflow/)

**MQTT over QUIC.** EMQX 5.0 has shipped MQTT-over-QUIC since 2022; OASIS standardisation is in progress; 2024–2026 tested it heavily for connected vehicles ([https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond](https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond)). Expect an OASIS standard within 24 months.

**Sparkplug 4.x and richer SCADA semantics.** The Sparkplug working group, with Chevron, Cirrus Link, HiveMQ, Inductive Automation, is iterating on multi-broker semantics and aliasing ([https://sparkplug.eclipse.org/](https://sparkplug.eclipse.org/)).

**Zenoh as a serious entrant.** Eclipse Zenoh 1.0.0 (October 2024) and 1.5 "Hong" (>10M msg/sec) ([https://newsroom.eclipse.org/news/announcements/eclipse-zenoh-100-debuts-redefining-connectivity-robotics-and-automotive](https://newsroom.eclipse.org/news/announcements/eclipse-zenoh-100-debuts-redefining-connectivity-robotics-and-automotive)). Endorsed by ROS 2 community as a leading robotics protocol. The Zenoh authors openly position it as a successor to MQTT+DDS. [IoT Now + 2](https://www.iot-now.com/2024/10/22/147409-eclipse-foundation-releases-zenoh-1-0-0-for-robotics-and-iot/)

**Matter and the smart-home convergence.** Matter 1.4 (November 2024), 1.4.1 (May 2025), 1.4.2 (August 2025), 1.5 (Feb 2026) added cameras and refined credentials. Matter is application-layer over IPv6, Wi-Fi/Ethernet/Thread; it doesn't replace MQTT inside vendor backends but standardises the device-to-controller layer ([https://en.wikipedia.org/wiki/Matter_(standard)](https://en.wikipedia.org/wiki/Matter_(standard)), [https://datawiresolutions.com/blog/matter-thread-explained-2026](https://datawiresolutions.com/blog/matter-thread-explained-2026)). Thread 1.4 (Sep 2024) standardised credential-sharing across border routers; from January 1, 2026 Thread 1.3 certifications are no longer accepted. [Wikipedia](https://en.wikipedia.org/wiki/Matter_(standard))[Data Wire Solutions](https://datawiresolutions.com/blog/matter-thread-explained-2026)

**CoAP gets the security stack it always needed.** EDHOC (RFC 9528, March 2024) finally gives OSCORE a key-establishment handshake, removing OSCORE's biggest practical adoption blocker ([https://medium.com/@IoTerop/oscore-the-end-to-end-security-protocol-for-iot-4498cf3aa50a](https://medium.com/@IoTerop/oscore-the-end-to-end-security-protocol-for-iot-4498cf3aa50a)). [Medium](https://medium.com/@IoTerop/oscore-the-end-to-end-security-protocol-for-iot-4498cf3aa50a)

**Schema registries proliferate** beyond Confluent's: Apicurio, Buf Schema Registry, AWS Glue Schema Registry. Bufstream's pitch is Protobuf-native field-level RBAC.

**AsyncAPI 3.0 (December 2023).** Decouples channels from operations, introduces send/receive semantics replacing publish/subscribe, formalises request-reply for async — the "OpenAPI for messaging" is finally usable across MQTT, Kafka, AMQP, NATS uniformly ([https://www.asyncapi.com/blog/release-notes-3.0.0](https://www.asyncapi.com/blog/release-notes-3.0.0)). [AsyncAPI Initiative](https://www.asyncapi.com/blog/release-notes-3.0.0)[Atamel](https://atamel.dev/posts/2024/05-13_asyncapi_30_send_receive/)

**Iggy.rs.** Rust-native, io_uring, thread-per-core, multi-protocol (TCP/QUIC/WebSocket/HTTP). Joined Apache Incubator February 2025 ([https://iggy.apache.org/](https://iggy.apache.org/), [https://robustmq.com/en/Blogs/34](https://robustmq.com/en/Blogs/34)). Whether it graduates to top-level Apache or remains a Thoughtworks-radar curio depends on community growth in 2026. [Apache](https://iggy.apache.org/)[RobustMQ](https://robustmq.com/en/Blogs/34)

**E2E-encrypted messaging interop.** IETF MIMI working group's drafts ([https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)) build on MLS (RFC 9420) to let WhatsApp, iMessage, Signal, Matrix interop in group chats — partly forced by the EU Digital Markets Act. Latest drafts (-05, October 2025) are stabilising. Unlike XMPP, MIMI explicitly accommodates federated providers without trusting any of them with plaintext. [IETF + 3](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/00/)

**eBPF observability for messaging.** Pixie, Cilium-based tools, and OpenTelemetry are making it possible to trace Kafka and MQTT flows without sidecar proxies. Expect this to be standard practice by 2027.

**Pulsar's trajectory.** Pulsar's adoption has lagged Kafka substantially despite its architectural elegance; the 2025 community remains active but commercial backing is thinner than Kafka's ([https://www.confluent.io/kafka-vs-pulsar/](https://www.confluent.io/kafka-vs-pulsar/), [https://medium.com/@yashbatra11111/kafka-vs-pulsar-which-message-broker-actually-wins-at-scale-in-2025-fee6378a4ab1](https://medium.com/@yashbatra11111/kafka-vs-pulsar-which-message-broker-actually-wins-at-scale-in-2025-fee6378a4ab1)). Bet *cautiously* — Pulsar is great technology but you may be hiring against a small pool. [Confluent](https://www.confluent.io/kafka-vs-pulsar/)

**What will be obsolete in five years:** AMQP 0-9-1 in greenfield deployments (RabbitMQ now defaults to AMQP 1.0 + Streams); ZooKeeper-mode Kafka clusters; classic mirrored queues in RabbitMQ (already removed in 4.0 in 2024); long-form XMPP for any new consumer chat (replaced by MLS-based protocols and MIMI); home-grown JSON-over-WebSocket pubsub (replaced by MQTT-over-WebSocket + Sparkplug or NATS). [GitHub](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.0-beta.5)

---

## Hooks for the article, infographic, and podcast

**60-second narrated hook (written for the ear):**

> In 1999, two engineers — one at IBM, one at a small British company called Arcom — were trying to keep an oil pipeline alive over a satellite link. The bandwidth was awful. The connection dropped. The receiver had less memory than your microwave. So they wrote the smallest possible messaging protocol they could imagine: a 2-byte header, a publish, a subscribe, and a "last will" message the broker would send if you died. Twenty-six years later, that same protocol is what your Tesla uses to phone home, what Facebook Messenger uses to deliver your birthday wishes, and what every smart light bulb in your house speaks behind your back. The story of how MQTT got from an oil rig to your pocket is the story of an entire family of protocols that quietly run the modern internet — protocols you've never heard of, that move more bytes than HTTP ever will.

**A striking statistic:**
Confluent's 2021 IPO prospectus reported that over 70% of Fortune 500 companies were estimated to use Apache Kafka, and Kafka had been downloaded more than 5 million times since open-sourcing in 2011 ([https://www.cnbc.com/2021/06/01/linkedin-backed-confluent-files-s-1-as-yearly-sales-top-300-million.html](https://www.cnbc.com/2021/06/01/linkedin-backed-confluent-files-s-1-as-yearly-sales-top-300-million.html), [https://www.confluent.io/kafka-vs-pulsar/](https://www.confluent.io/kafka-vs-pulsar/)). The company was valued at $4.5B in its last private round and over $9B at IPO. *That's a single open-source project, born in a single team at LinkedIn, capitalised at the GDP of a small country.* [MindMajix](https://mindmajix.com/apache-kafka-vs-apache-pulsar)

**Pause-and-think moment:**
On November 25, 2020 — two days before Black Friday — AWS attempted a routine capacity addition to Amazon Kinesis. Adding new servers caused every existing front-end server to try to open new OS threads to talk to them. They hit the OS thread-count limit. The shard-map cache failed to build. *The entire shard-routing layer corrupted itself.* Cognito, CloudWatch, IoT Core, EventBridge, AutoScaling, Lambda — services that *use Kinesis as plumbing* — all degraded. The failure mode wasn't a bug in Kinesis's logic. It was a connection-per-thread design that worked perfectly for years and then, on one sunny Tuesday, failed because Kinesis had grown too successful ([https://aws.amazon.com/message/11201/](https://aws.amazon.com/message/11201/), [https://jackshirazi.medium.com/what-reliability-engineers-can-learn-from-amazons-november-2020-kinesis-outage-32edbb34d475](https://jackshirazi.medium.com/what-reliability-engineers-can-learn-from-amazons-november-2020-kinesis-outage-32edbb34d475)). *Successful systems fail in proportion to their success.* [Medium](https://jackshirazi.medium.com/what-reliability-engineers-can-learn-from-amazons-november-2020-kinesis-outage-32edbb34d475)

**Failure-story arc — the AWS Kinesis Cascade, November 25, 2020:**

*Setup.* It was the night before American Thanksgiving. AWS was adding capacity to Kinesis Data Streams in us-east-1 ahead of the holiday shopping surge. Kinesis is internal plumbing for half of AWS — it carries logs, metrics, IoT events, and Cognito auth telemetry. The change started at 2:44 AM PST and finished at 3:47 AM PST.

*The mistake — or rather, the latent design flaw.* Kinesis's front-end fleet was thousands of servers, and every front-end server held an OS-thread-per-peer mesh — a design choice from when the fleet was smaller and the success of Kinesis was unimaginable. When new capacity arrived, every existing server tried to spin up threads to all the new ones. The Linux thread limit was hit. New servers couldn't finish building their shard-map cache. They began routing requests to nowhere.

*Consequence.* By 5:15 AM PST, error rates spiked. By 7:51 AM, AWS had narrowed the cause but realised a fix required restarting the entire front-end fleet — which they could only do at a few hundred servers per hour because each restart had to settle into the mesh before the next. Cognito users couldn't authenticate; CloudWatch dashboards went blank during the outage; the AWS Service Health Dashboard *itself* was hosted on services downstream of Kinesis and couldn't be updated. Roku, Flickr, iRobot, Adobe Spark went dark. Engineers across the industry watched their own monitoring systems, hosted on AWS, fail to monitor anything.

*Resolution.* Full recovery completed at 10:23 PM PST — a 17-hour event. AWS committed to moving its CloudWatch traffic off the shared front-end fleet, accelerating front-end cellularisation, and increasing OS thread limits. The deeper lesson, articulated repeatedly since: *cellularisation, fault isolation, and avoiding all-to-all communication patterns are not optional at hyperscale.* The protocol family had a similar lesson several years earlier — Kafka's KIP-500 motivation included "we'd like to scale to millions of partitions; ZooKeeper can't"; KIP-848 motivation included "stop-the-world rebalances assume small fleets." The same structural issues, same architectural answer, decades apart.

A second arc, briefer, for the podcast: *Slack January 4, 2021 — the first working day after the holidays. Caches were cold, traffic spiked, an AWS Transit Gateway began dropping packets, Slack's auto-scaler tried to spin up 1,200 web servers in 14 minutes, hit the Linux open-files limit and an AWS quota, and made things worse. AWS promised to review TGW scaling. Slack added a New Year's Eve calendar reminder to pre-warm capacity* ([https://slack.engineering/slacks-outage-on-january-4th-2021/](https://slack.engineering/slacks-outage-on-january-4th-2021/)).

---

## Citations

1. [https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/](https://www.hivemq.com/blog/the-history-of-mqtt-part-1-the-origin/)
2. [https://en.wikipedia.org/wiki/MQTT](https://en.wikipedia.org/wiki/MQTT)
3. [https://en.wikipedia.org/wiki/Andy_Stanford-Clark](https://en.wikipedia.org/wiki/Andy_Stanford-Clark)
4. [https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-andy-stanfordclark-from-ibm](https://inductiveautomation.com/resources/podcast/the-coinventor-of-mqtt-andy-stanfordclark-from-ibm)
5. [https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/](https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/)
6. [https://www.linkedin.com/pulse/kafkas-origin-story-linkedin-tanvir-ahmed](https://www.linkedin.com/pulse/kafkas-origin-story-linkedin-tanvir-ahmed)
7. [https://www.frontier-enterprise.com/unleashing-kafka-insights-from-confluent-jun-rao/](https://www.frontier-enterprise.com/unleashing-kafka-insights-from-confluent-jun-rao/)
8. [https://en.wikipedia.org/wiki/Neha_Narkhede](https://en.wikipedia.org/wiki/Neha_Narkhede)
9. [https://www.cnbc.com/2021/06/01/linkedin-backed-confluent-files-s-1-as-yearly-sales-top-300-million.html](https://www.cnbc.com/2021/06/01/linkedin-backed-confluent-files-s-1-as-yearly-sales-top-300-million.html)
10. [https://kafka.apache.org/community/books_and_papers/](https://kafka.apache.org/community/books_and_papers/)
11. [https://notes.stephenholiday.com/Kafka.pdf](https://notes.stephenholiday.com/Kafka.pdf)
12. [https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)
13. [https://www.amqp.org/node/54](https://www.amqp.org/node/54)
14. [https://www.amqp.org/node/102](https://www.amqp.org/node/102)
15. [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)
16. [https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview)
17. [https://www.rfc-editor.org/rfc/rfc7252](https://www.rfc-editor.org/rfc/rfc7252)
18. [https://datatracker.ietf.org/doc/rfc7252/](https://datatracker.ietf.org/doc/rfc7252/)
19. [https://stomp.github.io/stomp-specification-1.2.html](https://stomp.github.io/stomp-specification-1.2.html)
20. [https://stomp.github.io/](https://stomp.github.io/)
21. [https://xmpp.org/about/history/](https://xmpp.org/about/history/)
22. [https://en.wikipedia.org/wiki/Jeremie_Miller](https://en.wikipedia.org/wiki/Jeremie_Miller)
23. [https://en.wikipedia.org/wiki/XMPP](https://en.wikipedia.org/wiki/XMPP)
24. [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/)
25. [https://www.rfc-editor.org/rfc/rfc6120.html](https://www.rfc-editor.org/rfc/rfc6120.html)
26. [https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/)
27. [https://kafka.apache.org/41/operations/consumer-rebalance-protocol/](https://kafka.apache.org/41/operations/consumer-rebalance-protocol/)
28. [https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)
29. [https://karafka.io/docs/Kafka-New-Rebalance-Protocol/](https://karafka.io/docs/Kafka-New-Rebalance-Protocol/)
30. [https://cwiki.apache.org/confluence/display/KAFKA/The+Next+Generation+of+the+Consumer+Rebalance+Protocol+(KIP-848)+-+Preview+Release+Notes](https://cwiki.apache.org/confluence/display/KAFKA/The+Next+Generation+of+the+Consumer+Rebalance+Protocol+(KIP-848)+-+Preview+Release+Notes)
31. [https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum)
32. [https://www.confluent.io/blog/how-to-prepare-for-kip-500-kafka-zookeeper-removal-guide/](https://www.confluent.io/blog/how-to-prepare-for-kip-500-kafka-zookeeper-removal-guide/)
33. [https://developer.confluent.io/learn/kraft/](https://developer.confluent.io/learn/kraft/)
34. [https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/](https://andrewbaker.ninja/2026/02/17/apache-kafka-4-x-what-kraft-and-zookeeper-removal-mean/)
35. [https://www.instaclustr.com/blog/kafka-4-0-unveiled-key-changes-and-how-they-impact-developers/](https://www.instaclustr.com/blog/kafka-4-0-unveiled-key-changes-and-how-they-impact-developers/)
36. [https://developers.redhat.com/blog/2026/01/08/kafka-monthly-digest-december-2025](https://developers.redhat.com/blog/2026/01/08/kafka-monthly-digest-december-2025)
37. [https://www.kai-waehner.de/blog/2025/09/07/kafka-zookeeper-removal-amazon-msk-requires-migration/](https://www.kai-waehner.de/blog/2025/09/07/kafka-zookeeper-removal-amazon-msk-requires-migration/)
38. [https://www.warpstream.com/](https://www.warpstream.com/)
39. [https://www.warpstream.com/ai-info](https://www.warpstream.com/ai-info)
40. [https://github.com/AutoMQ/automq/wiki/WarpStream-is-dead,-long-live-AutoMQ](https://github.com/AutoMQ/automq/wiki/WarpStream-is-dead,-long-live-AutoMQ)
41. [https://github.com/AutoMQ/automq/wiki/Top-12-Kafka-Alternative-2025-Pros-%26-Cons](https://github.com/AutoMQ/automq/wiki/Top-12-Kafka-Alternative-2025-Pros-%26-Cons)
42. [https://github.com/AutoMQ/automq/wiki/Difference-with-WarpStream](https://github.com/AutoMQ/automq/wiki/Difference-with-WarpStream)
43. [https://www.automq.com/blog/comparison-of-data-streaming-solutions](https://www.automq.com/blog/comparison-of-data-streaming-solutions)
44. [https://vutr.substack.com/p/how-to-choose-the-right-diskless](https://vutr.substack.com/p/how-to-choose-the-right-diskless)
45. [https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/](https://www.kai-waehner.de/blog/2025/08/11/the-rise-of-diskless-kafka-rethinking-brokers-storage-and-the-kafka-protocol/)
46. [https://x.com/BdKozlovski/status/1912504414528552984](https://x.com/BdKozlovski/status/1912504414528552984)
47. [https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/](https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/)
48. [https://www.confluent.io/blog/confluent-acquires-warpstream/](https://www.confluent.io/blog/confluent-acquires-warpstream/)
49. [https://techcrunch.com/2024/09/09/confluent-acquires-streaming-data-startup-warpstream/](https://techcrunch.com/2024/09/09/confluent-acquires-streaming-data-startup-warpstream/)
50. [https://www.warpstream.com/blog/warpstream-is-dead-long-live-warpstream](https://www.warpstream.com/blog/warpstream-is-dead-long-live-warpstream)
51. [https://www.warpstream.com/blog/the-case-for-an-iceberg-native-database-why-spark-jobs-and-zero-copy-kafka-wont-cut-it](https://www.warpstream.com/blog/the-case-for-an-iceberg-native-database-why-spark-jobs-and-zero-copy-kafka-wont-cut-it)
52. [https://www.confluent.io/blog/introducing-tableflow/](https://www.confluent.io/blog/introducing-tableflow/)
53. [https://www.confluent.io/product/tableflow/](https://www.confluent.io/product/tableflow/)
54. [https://docs.confluent.io/cloud/current/topics/tableflow/overview.html](https://docs.confluent.io/cloud/current/topics/tableflow/overview.html)
55. [https://www.confluent.io/blog/tableflow-delta-lake-databricks-unity-catalog-ga/](https://www.confluent.io/blog/tableflow-delta-lake-databricks-unity-catalog-ga/)
56. [https://medium.com/snowflake/unifying-streaming-and-analytics-how-confluent-tableflow-iceberg-and-snowflake-simplify-267dca9f20f2](https://medium.com/snowflake/unifying-streaming-and-analytics-how-confluent-tableflow-iceberg-and-snowflake-simplify-267dca9f20f2)
57. [https://www.iotforall.com/mqtt-over-quic-next-generation-iot-standard-protocol](https://www.iotforall.com/mqtt-over-quic-next-generation-iot-standard-protocol)
58. [https://www.emqx.com/en/blog/mqtt-over-quic](https://www.emqx.com/en/blog/mqtt-over-quic)
59. [https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond](https://www.emqx.com/en/blog/mqtt-trends-for-2025-and-beyond)
60. [https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/introduction.html](https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/introduction.html)
61. [https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/getting-started.html](https://docs.emqx.com/en/emqx/latest/mqtt-over-quic/getting-started.html)
62. [https://github.com/mquictt/mquictt](https://github.com/mquictt/mquictt)
63. [https://www.mdpi.com/1424-8220/22/10/3694](https://www.mdpi.com/1424-8220/22/10/3694)
64. [https://aws.amazon.com/message/11201/](https://aws.amazon.com/message/11201/)
65. [https://www.theregister.com/2020/11/25/aws_down/](https://www.theregister.com/2020/11/25/aws_down/)
66. [https://aws.amazon.com/premiumsupport/technology/pes/](https://aws.amazon.com/premiumsupport/technology/pes/)
67. [https://www.datacenterdynamics.com/en/news/aws-explains-what-went-wrong-us-east-1/](https://www.datacenterdynamics.com/en/news/aws-explains-what-went-wrong-us-east-1/)
68. [https://arpio.io/outage-tales-17-hour-aws-kinesis-outage/](https://arpio.io/outage-tales-17-hour-aws-kinesis-outage/)
69. [https://jackshirazi.medium.com/what-reliability-engineers-can-learn-from-amazons-november-2020-kinesis-outage-32edbb34d475](https://jackshirazi.medium.com/what-reliability-engineers-can-learn-from-amazons-november-2020-kinesis-outage-32edbb34d475)
70. [https://statusgator.com/blog/aws-outage-history/](https://statusgator.com/blog/aws-outage-history/)
71. [https://slack.engineering/slacks-outage-on-january-4th-2021/](https://slack.engineering/slacks-outage-on-january-4th-2021/)
72. [https://slack.engineering/slacks-incident-on-2-22-22/](https://slack.engineering/slacks-incident-on-2-22-22/)
73. [https://www.theregister.com/2021/02/02/slack_outage_aws_autoscaling/](https://www.theregister.com/2021/02/02/slack_outage_aws_autoscaling/)
74. [https://downtimeproject.com/podcast/episode-1-slack-vs-tgws/](https://downtimeproject.com/podcast/episode-1-slack-vs-tgws/)
75. [https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/](https://engineering.fb.com/2011/08/12/android/building-facebook-messenger/)
76. [https://www.hackerearth.com/blog/developers/mqtt-protocol/](https://www.hackerearth.com/blog/developers/mqtt-protocol/)
77. [https://massivetechinterview.blogspot.com/2015/10/facebook-messenger-mqtt.html](https://massivetechinterview.blogspot.com/2015/10/facebook-messenger-mqtt.html)
78. [https://www.cncf.io/projects/nats/](https://www.cncf.io/projects/nats/)
79. [https://www.cncf.io/blog/2025/05/01/protecting-nats-and-the-integrity-of-open-source-cncfs-commitment-to-the-community/](https://www.cncf.io/blog/2025/05/01/protecting-nats-and-the-integrity-of-open-source-cncfs-commitment-to-the-community/)
80. [https://landscape.cncf.io/stats?item=app-definition-and-development--streaming-messaging--nats](https://landscape.cncf.io/stats?item=app-definition-and-development--streaming-messaging--nats)
81. [https://nats.io/](https://nats.io/)
82. [https://en.wikipedia.org/wiki/NATS_Messaging](https://en.wikipedia.org/wiki/NATS_Messaging)
83. [https://cloudnativenow.com/topics/cloudnativeplatforms/no-cracks-in-nats-cncf-connects-for-cloud-comms/](https://cloudnativenow.com/topics/cloudnativeplatforms/no-cracks-in-nats-cncf-connects-for-cloud-comms/)
84. [https://sparkplug.eclipse.org/](https://sparkplug.eclipse.org/)
85. [https://sparkplug.eclipse.org/specification/](https://sparkplug.eclipse.org/specification/)
86. [https://www.eclipse.org/community/eclipse_newsletter/2021/february/1.php](https://www.eclipse.org/community/eclipse_newsletter/2021/february/1.php)
87. [https://flowfuse.com/blog/2024/08/using-mqtt-sparkplugb-with-node-red/](https://flowfuse.com/blog/2024/08/using-mqtt-sparkplugb-with-node-red/)
88. [https://docs.emqx.com/en/emqx/latest/data-integration/sparkplug.html](https://docs.emqx.com/en/emqx/latest/data-integration/sparkplug.html)
89. [https://i-flow.io/en/ressources/what-is-sparkplug-b-pros-and-cons-of-the-standard/](https://i-flow.io/en/ressources/what-is-sparkplug-b-pros-and-cons-of-the-standard/)
90. [https://blog.isa.org/iot-architecture-with-mqtt-sparkplugb](https://blog.isa.org/iot-architecture-with-mqtt-sparkplugb)
91. [https://newsroom.eclipse.org/news/announcements/eclipse-zenoh-100-debuts-redefining-connectivity-robotics-and-automotive](https://newsroom.eclipse.org/news/announcements/eclipse-zenoh-100-debuts-redefining-connectivity-robotics-and-automotive)
92. [https://www.iot-now.com/2024/10/22/147409-eclipse-foundation-releases-zenoh-1-0-0-for-robotics-and-iot/](https://www.iot-now.com/2024/10/22/147409-eclipse-foundation-releases-zenoh-1-0-0-for-robotics-and-iot/)
93. [https://projects.eclipse.org/projects/iot.zenoh](https://projects.eclipse.org/projects/iot.zenoh)
94. [https://projects.eclipse.org/projects/iot.zenoh/releases/1.5.0-hong/review](https://projects.eclipse.org/projects/iot.zenoh/releases/1.5.0-hong/review)
95. [https://zenoh.io/](https://zenoh.io/)
96. [https://github.com/eclipse-zenoh/zenoh](https://github.com/eclipse-zenoh/zenoh)
97. [https://www.sciencedirect.com/science/article/abs/pii/S2542660526000909](https://www.sciencedirect.com/science/article/abs/pii/S2542660526000909)
98. [https://en.wikipedia.org/wiki/Data_Distribution_Service](https://en.wikipedia.org/wiki/Data_Distribution_Service)
99. [https://www.omg.org/omg-dds-portal/](https://www.omg.org/omg-dds-portal/)
100. [https://www.omg.org/dds/](https://www.omg.org/dds/)
101. [https://www.dre.vanderbilt.edu/~schmidt/PDF/dds-sos.pdf](https://www.dre.vanderbilt.edu/~schmidt/PDF/dds-sos.pdf)
102. [https://www.eprosima.com/developer-resources/whitepapers/dds](https://www.eprosima.com/developer-resources/whitepapers/dds)
103. [https://www.dds-foundation.org/](https://www.dds-foundation.org/)
104. [https://en.wikipedia.org/wiki/RSocket](https://en.wikipedia.org/wiki/RSocket)
105. [https://rsocket.io/about/protocol/](https://rsocket.io/about/protocol/)
106. [https://github.com/rsocket/rsocket/blob/master/Protocol.md](https://github.com/rsocket/rsocket/blob/master/Protocol.md)
107. [https://softwareengineeringdaily.com/2019/01/22/rsocket-reactive-streaming-service-networking-with-ryland-degnan/](https://softwareengineeringdaily.com/2019/01/22/rsocket-reactive-streaming-service-networking-with-ryland-degnan/)
108. [https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/](https://cloudintegrations.wordpress.com/the-battle-for-the-enterprise-messaging-market/)
109. [https://www.peerspot.com/products/comparisons/ibm-mq_vs_tibco-rendezvous](https://www.peerspot.com/products/comparisons/ibm-mq_vs_tibco-rendezvous)
110. [https://github.com/apache/iggy](https://github.com/apache/iggy)
111. [https://iggy.apache.org/](https://iggy.apache.org/)
112. [https://blog.iggy.rs/posts/building-message-streaming-in-rust/](https://blog.iggy.rs/posts/building-message-streaming-in-rust/)
113. [https://robustmq.com/en/Blogs/34](https://robustmq.com/en/Blogs/34)
114. [https://news.ycombinator.com/item?id=38868115](https://news.ycombinator.com/item?id=38868115)
115. [https://www.asyncapi.com/blog/release-notes-3.0.0](https://www.asyncapi.com/blog/release-notes-3.0.0)
116. [https://www.asyncapi.com/docs/reference/specification/v3.0.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0)
117. [https://github.com/asyncapi/spec](https://github.com/asyncapi/spec)
118. [https://nordicapis.com/whats-new-in-asyncapi-v3-0/](https://nordicapis.com/whats-new-in-asyncapi-v3-0/)
119. [https://atamel.dev/posts/2024/05-13_asyncapi_30_send_receive/](https://atamel.dev/posts/2024/05-13_asyncapi_30_send_receive/)
120. [https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)
121. [https://datatracker.ietf.org/doc/html/draft-ietf-mimi-protocol-04](https://datatracker.ietf.org/doc/html/draft-ietf-mimi-protocol-04)
122. [https://datatracker.ietf.org/doc/html/draft-ietf-mimi-protocol-01](https://datatracker.ietf.org/doc/html/draft-ietf-mimi-protocol-01)
123. [https://datatracker.ietf.org/doc/html/draft-barnes-mimi-arch-03](https://datatracker.ietf.org/doc/html/draft-barnes-mimi-arch-03)
124. [https://datatracker.ietf.org/doc/html/draft-ietf-mimi-content-05](https://datatracker.ietf.org/doc/html/draft-ietf-mimi-content-05)
125. [https://datatracker.ietf.org/doc/draft-mahy-mimi-identity/](https://datatracker.ietf.org/doc/draft-mahy-mimi-identity/)
126. [https://datatracker.ietf.org/doc/html/rfc9528](https://datatracker.ietf.org/doc/html/rfc9528)
127. [https://medium.com/@IoTerop/oscore-the-end-to-end-security-protocol-for-iot-4498cf3aa50a](https://medium.com/@IoTerop/oscore-the-end-to-end-security-protocol-for-iot-4498cf3aa50a)
128. [https://www.ericsson.com/en/blog/2019/11/oscore-iot-security-protocol](https://www.ericsson.com/en/blog/2019/11/oscore-iot-security-protocol)
129. [https://core-wg.github.io/oscore-edhoc/draft-ietf-core-oscore-edhoc.html](https://core-wg.github.io/oscore-edhoc/draft-ietf-core-oscore-edhoc.html)
130. [https://mosquitto.org/](https://mosquitto.org/)
131. [https://github.com/eclipse-mosquitto/mosquitto](https://github.com/eclipse-mosquitto/mosquitto)
132. [https://www.emqx.com/en/blog/mosquitto-mqtt-broker-pros-cons-tutorial-and-modern-alternatives](https://www.emqx.com/en/blog/mosquitto-mqtt-broker-pros-cons-tutorial-and-modern-alternatives)
133. [https://www.emqx.com/en/blog/a-comprehensive-comparison-of-open-source-mqtt-brokers-in-2023](https://www.emqx.com/en/blog/a-comprehensive-comparison-of-open-source-mqtt-brokers-in-2023)
134. [https://blog.paessler.com/from-hobby-project-to-iot-cornerstone-the-story-of-mosquitto-mqtt-broker](https://blog.paessler.com/from-hobby-project-to-iot-cornerstone-the-story-of-mosquitto-mqtt-broker)
135. [https://podcasts.apple.com/us/podcast/the-story-of-eclipse-mosquitto-mqtt-broker/id1656923231?i=1000637671351](https://podcasts.apple.com/us/podcast/the-story-of-eclipse-mosquitto-mqtt-broker/id1656923231?i=1000637671351)
136. [https://mqtt.org/mqtt-specification/](https://mqtt.org/mqtt-specification/)
137. [https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=mqtt-sn](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=mqtt-sn)
138. [https://image.mqtt.cn/wp-content/uploads/2024/03/2024032209060883.pdf](https://image.mqtt.cn/wp-content/uploads/2024/03/2024032209060883.pdf)
139. [https://www.u-blox.com/en/blogs/insights/mqtt-sn](https://www.u-blox.com/en/blogs/insights/mqtt-sn)
140. [https://link.springer.com/article/10.1007/s10922-025-09916-1](https://link.springer.com/article/10.1007/s10922-025-09916-1)
141. [https://en.wikipedia.org/wiki/Matter_(standard)](https://en.wikipedia.org/wiki/Matter_(standard))
142. [https://datawiresolutions.com/blog/matter-thread-explained-2026](https://datawiresolutions.com/blog/matter-thread-explained-2026)
143. [https://matter-smarthome.de/en/development/the-matter-standard-2025-taking-stock/](https://matter-smarthome.de/en/development/the-matter-standard-2025-taking-stock/)
144. [https://matter-smarthome.de/en/development/the-matter-standard-in-2026-a-status-review/](https://matter-smarthome.de/en/development/the-matter-standard-in-2026-a-status-review/)
145. [https://www.dualmedia.com/matter-thread-smart-home-protocols-2026/](https://www.dualmedia.com/matter-thread-smart-home-protocols-2026/)
146. [https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
147. [https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.0-beta.5](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.0.0-beta.5)
148. [https://www.rabbitmq.com/blog/2024/08/28/quorum-queues-in-4.0](https://www.rabbitmq.com/blog/2024/08/28/quorum-queues-in-4.0)
149. [https://blog.rabbitmq.com/docs/4.0/whats-new](https://blog.rabbitmq.com/docs/4.0/whats-new)
150. [https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)
151. [https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/)
152. [https://newsletter.pragmaticengineer.com/p/designing-data-intensive-applications](https://newsletter.pragmaticengineer.com/p/designing-data-intensive-applications)
153. [https://lp.scylladb.com/designing-data-intensive-apps-book-offer](https://lp.scylladb.com/designing-data-intensive-apps-book-offer)
154. [https://martin.kleppmann.com/papers/kafka-debull15.pdf](https://martin.kleppmann.com/papers/kafka-debull15.pdf)
155. [https://github.blog/news-insights/company-news/oct21-post-incident-analysis/](https://github.blog/news-insights/company-news/oct21-post-incident-analysis/)
156. [https://medium.com/@tnale/how-githubs-database-self-destructed-in-43-seconds-d4b4f7b9a617](https://medium.com/@tnale/how-githubs-database-self-destructed-in-43-seconds-d4b4f7b9a617)
157. [https://www.linkedin.com/pulse/how-githubs-database-self-destructed-43-seconds-david-furman](https://www.linkedin.com/pulse/how-githubs-database-self-destructed-43-seconds-david-furman)
158. [https://grafana.com/blog/2020/01/23/how-a-gcp-persistent-disk-incident-snowballed-into-a-23-hour-outage--and-taught-us-some-important-lessons/](https://grafana.com/blog/2020/01/23/how-a-gcp-persistent-disk-incident-snowballed-into-a-23-hour-outage--and-taught-us-some-important-lessons/)
159. [https://www.pagerduty.com/eng/august-28-kafka-outages-what-happened-and-how-were-improving/](https://www.pagerduty.com/eng/august-28-kafka-outages-what-happened-and-how-were-improving/)
160. [https://machine-learning-made-simple.medium.com/why-social-media-giant-discord-ditched-the-cassandra-database-622d50794b25](https://machine-learning-made-simple.medium.com/why-social-media-giant-discord-ditched-the-cassandra-database-622d50794b25)
161. [https://www.confluent.io/blog/how-to-survive-a-kafka-outage/](https://www.confluent.io/blog/how-to-survive-a-kafka-outage/)
162. [https://www.confluent.io/kafka-vs-pulsar/](https://www.confluent.io/kafka-vs-pulsar/)
163. [https://medium.com/@yashbatra11111/kafka-vs-pulsar-which-message-broker-actually-wins-at-scale-in-2025-fee6378a4ab1](https://medium.com/@yashbatra11111/kafka-vs-pulsar-which-message-broker-actually-wins-at-scale-in-2025-fee6378a4ab1)
164. [https://quix.io/blog/kafka-vs-pulsar-comparison](https://quix.io/blog/kafka-vs-pulsar-comparison)
165. [https://medium.com/@gwrx2005/technical-analysis-of-robinhoods-platform-architecture-and-fintech-innovations-a2dbb95fd1ef](https://medium.com/@gwrx2005/technical-analysis-of-robinhoods-platform-architecture-and-fintech-innovations-a2dbb95fd1ef)
166. [https://blog.quastor.org/p/robinhoods-tech-stack](https://blog.quastor.org/p/robinhoods-tech-stack)
167. [https://www.coindesk.com/markets/2021/02/16/what-really-happened-when-robinhood-suspended-gamestop-trading](https://www.coindesk.com/markets/2021/02/16/what-really-happened-when-robinhood-suspended-gamestop-trading)
168. [https://www.enterpriseintegrationpatterns.com/patterns/messaging/Messaging.html](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Messaging.html)

*Note on caveats: Several claims in this report rely on vendor blogs (Confluent, EMQ, HiveMQ, WarpStream, AutoMQ) that have a commercial interest in their narrative. Where vendor sources made strong claims about competitor adoption, market share, or relative performance, I either cross-checked against neutral sources or flagged them as vendor-sourced. Pulsar adoption numbers in particular are contested between Confluent (which positions Kafka as dominant) and Pulsar advocates; the specific "5 million downloads" and "70% of Fortune 500" figures come from Confluent's S-1, which is a regulated disclosure document. The diskless-Kafka KIP-1150 vote count of "9 binding + 5 non-binding on March 2, 2026" comes from a WarpStream (now Confluent) blog and should be cross-checked against the Apache Kafka mailing list archive for definitive verification. Several historical numbers (e.g., Mosquitto download counts) are admitted by sources to be unmeasurable. Where I gave compositional history of Kafka's authors and dates, sources gave overlapping but slightly different framings — Kafka's first deployment is variously dated "around 2010" with open-sourcing in early 2011; this is what I report.*