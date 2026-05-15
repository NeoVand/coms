---
id: kafka
type: protocol
name: Apache Kafka Wire Protocol
abbreviation: Kafka
etymology: "named after Franz [K]afka — Jay Kreps wanted a name that fit a system optimized for writing"
category: async-iot
year: 2011
rfc: null
standards_body: apache
podcast_target_minutes: 22
related_book_chapters:
  - foundations/client-server-p2p
  - async-iot/kafka
  - patterns-failures/patterns
related_protocols: [tcp, tls]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Kafka_Job_Queue_Architecture_diagram.svg/500px-Kafka_Job_Queue_Architecture_diagram.svg.png", caption: "Kafka architecture — producers write records to topic partitions distributed across brokers. Consumer groups read independently at their own pace using offsets, and data persists in the append-only log for replay.", credit: "Wikimedia Commons / CC BY-SA 4.0" }
visual_cues:
  - "A single partition drawn as a horizontal append-only tape with offsets 0, 1, 2 ... 1547, a producer arrow stamping new records on the right end and three consumer-group cursors at different offsets reading left-to-right at their own pace"
  - "Side-by-side rebalance timelines: classic protocol bar 103 seconds long, KIP-848 bar 5 seconds long, both labeled 10 consumers / 900 partitions"
  - "ZooKeeper tombstone — a gravestone marked Kafka 4.0, 18 March 2025, with KRaft replacing it as a small Raft quorum drawn off to the side"
  - "Tiered storage diagram: hot recent segments on local SSD on the broker, older segments offloaded to an S3 bucket, with a 150 GB/s aggregate throughput tag"
  - "The Datadog 8 March 2023 outage timeline: an Ubuntu systemd patch icon, a routing table being wiped, then Kafka and ZooKeeper boxes going dark across all five regions for 24 hours"
  - "Wire-format strip showing a v2 RecordBatch: baseOffset, batchLength, CRC32C, attributes, then a packed array of compressed records — labeled to show that compression now operates on the whole batch, not each record"
---

# Kafka — The Apache Kafka Wire Protocol

## In one breath

Kafka is a binary wire protocol, layered on long-lived TCP connections, that moves event records between producers, consumers, and a cluster of brokers that each store partitions of an append-only log. It started as LinkedIn's fix for an unmanageable pile of point-to-point ETL in 2010, was open-sourced in 2011, and now sits in front of an enormous fraction of the world's event traffic — LinkedIn alone moves more than seven trillion messages a day through it, on what began as a three-person project. If you want to understand how a modern streaming system actually talks on the wire, this is the protocol to read.

## The pitch (cold-open)

Every credit-card swipe at a Fortune 500, every Uber ride dispatched, every Netflix recommendation has a non-trivial chance of passing through one piece of software. It is called Apache Kafka, and Jay Kreps named it after Franz Kafka because, in his own words on Quora, it is a system optimized for writing. In March 2025 the project finally cut its umbilical cord to ZooKeeper, sped up consumer rebalances by twenty times, and started learning how to behave like a queue. Nine months later, IBM agreed to buy the company that commercializes it for eleven billion dollars. The plumbing of the internet just got a new landlord.

## How it actually works

Kafka is a binary protocol over TCP. Every request and response is length-prefixed: a four-byte big-endian size, then the payload. The default broker port is 9092, with 9093 typically reserved for a TLS listener. There is no UDP path and no in-place upgrade; if you want encryption, the TLS handshake happens before any Kafka frame goes on the wire.

A client first opens a TCP connection to any broker — any one will do — and sends an `ApiVersionsRequest` v0. The broker replies with a list of supported `(api_key, min_version, max_version)` tuples. This is what lets Kafka clusters do zero-downtime rolling upgrades: the client always knows what the broker on the other end of the socket can speak.

The client then sends a `MetadataRequest`. The response is a small map of the universe: every broker, every topic, every partition, and which broker is the leader for each partition. The client caches that and uses it to send produce and fetch traffic directly to the right broker. If a leader moves, the client refreshes the metadata and retries.

Producing a record is then a `ProduceRequest` to the partition leader. The producer batches records by topic and partition, compresses the batch with one of gzip, snappy, lz4, or zstd, and ships it. The leader writes to its log, waits for replication according to the `acks` setting, and replies with the base offset where the records landed. With `acks=all`, the broker waits for every in-sync replica before acknowledging — this is the durability sweet spot that pairs with the idempotent producer and is the basis for exactly-once semantics.

Consuming is a `FetchRequest` specifying topic, partition, and the offset the consumer wants to read from. The broker streams records from that offset forward, using the OS page cache and `sendfile(2)` to copy bytes from disk straight to the socket without ever touching the JVM heap — that zero-copy path is one of the main reasons Kafka throughput per broker reads in the hundreds of megabytes per second. The consumer tracks its own position and commits offsets back to the broker as it goes; the broker stores those in the internal `__consumer_offsets` topic.

Consumer groups make this concurrent. A group of consumers shares a topic, with each partition assigned to exactly one consumer in the group. A broker called the group coordinator owns the membership state and hands out partition assignments. If a consumer dies, its partitions get reassigned to the survivors. Records stay in the log for the configured retention — days, weeks, sometimes forever — and any consumer can rewind and replay history. That replayability, more than anything else, is what separates Kafka from a traditional message queue.

### Header at a glance

Every Kafka request starts with the same small request header, plus a body that is one of dozens of API key shapes.

- `Size` — `INT32`, big-endian, the length of everything that follows. Kafka's framing.
- `api_key` — `INT16`, picks the request type. Produce is 0, Fetch is 1, Metadata is 3, ApiVersions is 18, the new `ConsumerGroupHeartbeat` from KIP-848 is 68.
- `api_version` — `INT16`, lets the broker dispatch the right schema for that request type. Versions are negotiated up front via `ApiVersions`.
- `correlation_id` — `INT32`, an arbitrary number the client picks. The broker echoes it back so the client can match a response to its request on a pipelined connection.
- `client_id` — nullable string, since v1 of the header. Shows up in broker logs and metrics.
- A trailing tagged-fields buffer in v2 of the header — a varint count followed by `(tag, length, value)` triples. KIP-482 added this so future fields can be slipped in without bumping the request version. Every "flexible" request uses it.

For records themselves, the unit on the wire since Kafka 0.11 is the v2 `RecordBatch`: a base offset, a batch length, a partition leader epoch, a CRC32C (Castagnoli) checksum over the rest, attributes for compression and timestamps and transaction flags, a producer ID and epoch and base sequence (for idempotence and transactions), then a length-prefixed array of records. Compression now applies to the whole batch, not record by record — this is the big win of v2 and the foundation that idempotence and transactions were built on.

### State machine in three sentences

A Kafka connection is a long-lived TCP socket with strict request-ordering per connection and pipelined responses. The interesting state machine is not on the connection — it is the consumer group, where members move between Empty, PreparingRebalance, CompletingRebalance, and Stable, coordinated by a broker-side group coordinator. KRaft, Kafka's own Raft variant for metadata, runs another state machine of voter / observer / leader transitions on the controller quorum.

### Reliability, flow, and security mechanics

Replication is leader-and-follower per partition. One replica is leader, handles all reads and writes; the others fetch and replicate. The set of replicas judged caught up enough to be eligible for leader election is the in-sync replica set, the ISR. The high watermark is the highest offset replicated to every ISR member — that is the cutoff visible to consumers. The log end offset is one past the last appended record. KIP-101 added a leader epoch and `OffsetForLeaderEpochRequest`, so a returning follower can ask the leader where its last epoch ended and truncate cleanly to that point — closing a window where high-watermark-only truncation could lose committed data on unclean leader election.

The idempotent producer obtains a producer ID via `InitProducerId` and increments a per-partition sequence number on every batch. The broker rejects out-of-order or duplicated sequences, so retries are safe even with multiple in-flight requests. This has been on by default since Kafka 3.0 in September 2021. Transactions go further: the client calls `AddPartitionsToTxn`, optionally `AddOffsetsToTxn`, then `EndTxn`, and the broker writes a `WriteTxnMarkers` control batch to every affected partition so consumers in `read_committed` mode skip aborted data. That is what KIP-98 calls exactly-once semantics, and it is what Kafka Streams pipelines run on top of.

Security stacks layer by layer. The transport can be PLAINTEXT or SSL (which means TLS — Kafka kept the older name). Authentication runs over SASL with mechanisms PLAIN, SCRAM-SHA-256/512, GSSAPI (Kerberos), or OAUTHBEARER (OAuth 2.0). Cloud installs lean OAUTHBEARER; enterprise on-prem leans Kerberos. TLS hostname verification has been the default since Kafka 2.0 — KIP-294. A `SaslHandshakeRequest` picks the mechanism, then a series of `SaslAuthenticate` exchanges complete the auth.

## Where it shows up in production

LinkedIn is still the largest publicly disclosed deployment: more than 100 clusters, more than 4,000 brokers, around seven million partitions, and more than seven trillion messages a day, per LinkedIn engineering's 2019 blog post. That number has not been publicly updated, so treat it as a floor. Netflix runs the Keystone pipeline on Kafka — trillions of events a day. Uber built uReplicator and runs aggregated multi-region clusters. Cloudflare, Robinhood, Airbnb, Shopify, and Pinterest all run Kafka behind their analytics and event-driven services. Goldman Sachs has publicly cited sub-five-millisecond p99 end-to-end latency for trading workloads through Confluent.

The cloud landscape has crystallized in the last two years. AWS MSK and MSK Serverless support tiered storage, KIP-848, and KRaft, and currently support Kafka 3.8, 3.9, 4.0, and 4.1. Azure Event Hubs is Kafka-API compatible via emulation. Google Cloud's Managed Service for Apache Kafka launched preview in August 2024 and went GA in 2025. Aiven for Apache Kafka runs multi-cloud and donated the open-source tiered-storage S3 plugin that became the basis for KIP-1150.

There is also a thriving compatible-implementation market that does not run a JVM at all. Redpanda, in C++, uses thread-per-core and Raft per partition from day one — it speaks the Kafka API but had not yet shipped KIP-848 as of late 2025. WarpStream, written in Go, treats S3 as primary storage and runs leaderless brokers; Confluent acquired it on 9 September 2024. Bufstream, from Buf, takes the same shape but uses Spanner for metadata — its public benchmark hit 100 GiB/s of writes and 300 GiB/s of reads at p99 below one second. AutoMQ runs on EBS plus S3, re-licensed to Apache 2.0 in 2025, and proposed KIP-1183. Strimzi is the Kubernetes operator most large self-hosters land on.

## Things that go wrong

The Datadog outage on 8 March 2023 is the canonical Kafka-shaped incident of the period — and it was not actually a Kafka bug. Datadog ran Ubuntu 22.04 across AWS, GCP, and Azure with unattended-upgrades enabled. A routine systemd CVE patch went out, and at 06:00 UTC the patched daemon restarted `systemd-networkd` on every node. That restart silently flushed the IP routing rules that the Cilium CNI had installed. Tens of thousands of nodes lost networking simultaneously across all five regions. Kafka, ZooKeeper, the metadata stores, the dashboards — all dark for about 24 hours. Datadog disabled unattended-upgrades, hard-rebooted nodes, rebuilt Cilium routing from scratch, and committed to multi-region drills. Heroku had near-identical symptoms from the same patch class in June 2025. The lesson the field took away: a Kafka-shaped outage is rarely a Kafka outage; it is the network underneath. The Async / IoT chapter on Kafka tells the story in full.

The CVE wave of 2024-2025 is the other thread worth knowing. CVE-2023-25194 — the SASL JAAS `JndiLoginModule` RCE in the Kafka Connect REST API, later confirmed to apply to brokers — was the field's Log4Shell moment. CVE-2024-56128 was Kafka's SCRAM implementation skipping the server-nonce verification required by RFC 5802; exploitable only over plaintext, and fixed in 3.7.2, 3.8.1, and 3.9.0. CVE-2024-31141 made `FileConfigProvider`, `DirectoryConfigProvider`, and `EnvVarConfigProvider` arbitrary-read primitives for untrusted callers; the 3.8.0 fix was an opt-out via `org.apache.kafka.automatic.config.providers=none`. CVE-2025-27817 let SASL/OAUTHBEARER `token.endpoint.url` and `jwks.endpoint.url` settings turn into arbitrary-file-read and SSRF; fixed in 3.9.1 and 4.0.0, with the default for `org.apache.kafka.sasl.oauthbearer.allowed.urls` becoming empty (deny-all) in 4.0.

Rebalance storms were the other recurring failure mode of the late ZooKeeper era. Pre-KIP-848, large consumer groups in Kubernetes could flap during rolling deploys — every group member revoked every partition on every rebalance, and a deploy that touched ten pods in sequence could keep the group out of stable for minutes. Confluent and others spent a lot of blog-ink documenting how to tune around it; KIP-848 was in many ways the engineering response.

## Common pitfalls (for the practitioner)

Under-replicated partitions sitting non-zero are almost always disk or network saturation; if URP is climbing during steady traffic, look at iostat and broker network metrics before anything else.

`unclean.leader.election.enable=true` is the silent data-loss switch. Set it to false and leave it there. KIP-966 Eligible Leader Replicas, in preview as of Kafka 4.0, will give a more nuanced answer eventually — until then, false.

`max.in.flight.requests.per.connection > 1` combined with `retries > 0` and idempotence off is a reordering bug waiting to happen. The fix is just `enable.idempotence=true`, which is the default since 3.0 — but older clients still ship the old default, so check.

`auto.offset.reset=latest` will silently skip a backlog the first time a new consumer group starts on a topic. Set it to `earliest` if you actually care about the existing data.

A misconfigured `retention.ms` is silent data loss. Records older than the retention age out of the log; if no consumer has read them yet, they are gone. Compacted topics where tombstones never age out are the dual failure mode — the log just bloats.

`fetch.max.bytes` set high on the consumer plus slow per-record processing is an OOM waiting to happen. Tune it against your worst-case message size and your slowest processor.

Increasing partition count after the fact breaks key-based ordering. The hash space changes, and any keyed semantic — same user always lands on the same partition — re-keys. Plan the partition count up front.

Schema Registry incompatible schema evolution is its own class of outage: a producer pushes a schema the consumer cannot read and the consumer-side topic just stops moving. The fix is enforcing forward and backward compatibility in the registry, not in code review.

## Debugging it

The CLI tools that ship with Kafka are the place to start. `kafka-consumer-groups.sh --describe --group <name>` shows lag and member state. `kafka-dump-log.sh` cracks open on-disk segments — useful for hunting tombstones or investigating corruption. `kafka-leader-election.sh` and `kafka-reassign-partitions.sh` are how you move things around in an emergency. `kcat` (formerly kafkacat) is the Swiss-army knife — produce, consume, list metadata, all from the shell.

Wireshark has a Kafka dissector; it tracks the protocol up to roughly Kafka 3.7 in the 4.5 release of Wireshark. It is invaluable for confirming what a client is actually putting on the wire when the client logs are not enough.

On the broker side, the JMX metrics that matter are `UnderReplicatedPartitions` (must be 0 in steady state), `OfflinePartitionsCount` (must be 0), `ActiveControllerCount` (exactly 1 cluster-wide), `RequestHandlerAvgIdlePercent` and `NetworkProcessorAvgIdlePercent` (keep at or above 0.3), and the ISR shrink and expand rates (flapping is trouble). Page-cache hit and disk usage are the bottom line. On consumers, watch `records-lag-max` and the rebalance rate.

Producer tuning that pays off: `acks=all` plus idempotence on, `linger.ms` between 5 and 20, `batch.size` between 64 KB and 256 KB, `compression.type=zstd`, `max.in.flight.requests.per.connection` at most 5 with idempotence on, and a `transactional.id` that is stable across producer restarts so the broker can fence zombies. On the consumer side, `group.protocol=consumer` to opt into KIP-848 for any group above ten members or any deploy-heavy workload, `session.timeout.ms` at least three times `heartbeat.interval.ms`, and `isolation.level=read_committed` if you have transactional producers upstream.

On the broker, `min.insync.replicas=2` with replication factor 3 and `acks=all`. Reserve about 6 GB of heap and leave the rest of RAM for the page cache — that page cache is Kafka's secret weapon and the entire reason the throughput numbers look the way they do.

## What's changing in 2026

KIP-1150 Diskless Topics was accepted by the Apache Kafka community on 2 March 2026 with nine binding +1s. The umbrella KIP formalizes a per-topic flag that pushes data straight to S3, GCS, or Azure Blob with leaderless writes — the architecture WarpStream, AutoMQ, Aiven Inkless, and Bufstream all converged on independently. Implementation is underway in three sub-KIPs (Core, Batch Coordinator, Compaction); a production-ready release in mainline Kafka is still pending. For high-retention workloads, the cost projections are 10 to 20 times lower. The five-year implications for the broker market are still being argued.

Kafka 4.1 shipped on 4 September 2025 and promoted KIP-932 Queues for Kafka — share groups, with per-record acknowledgement and durable shared subscriptions — to preview, with GA targeted for 4.2 in late 2025 / early 2026. Share groups give Kafka a queue-style semantic where partition count no longer caps consumer count, narrowing the gap with the AMQP model. 4.1 also brought the new Streams Rebalance Protocol (KIP-1071) into early access, extending the KIP-848 model to Kafka Streams.

Kafka 4.0 shipped on 18 March 2025 — the release that removed ZooKeeper entirely, after a migration that began with KIP-500 in 2019. KIP-848 GA shipped in the same release; an internal benchmark of 10 consumers and 900 partitions saw rebalance time drop from 103 seconds with the classic protocol to 5 seconds with KIP-848. KIP-932 Queues for Kafka entered early access. KIP-966 Eligible Leader Replicas entered preview. KIP-996 Pre-Vote landed for KRaft, reducing spurious elections. KIP-890 Transactions Server-Side Defense strengthened the transactional protocol. MirrorMaker 1 was removed and Log4j 1.x finally went away. The Async / IoT chapter on Kafka tells the long version of this transition.

Kafka 3.9 shipped on 6 November 2024 and made tiered storage GA via KIP-405 — letting brokers offload old log segments to S3 while keeping recent data on local disk. Apple, Datadog, and Slack all publicly tested it in the run-up. Aiven has reported 150 GB/s aggregate throughput in production. KIP-853 dynamic KRaft quorums also went GA in 3.9. 3.8, in July 2024, brought per-codec compression-level configs and JBOD with KRaft.

The corporate side of the story closed in March 2026. IBM agreed to acquire Confluent on 8 December 2025 for $11 billion at $31 per share; the deal closed on 17 March 2026. Apache Kafka itself stays independent at the ASF.

## Fun facts (host material)

The name. Kreps liked Franz Kafka and wanted a name that fit, in his own words on Quora, a system optimized for writing. It is, in the most literal sense, a writer's pun. The logo riffs on it.

The 0.7 to 0.8 rewrite was painful precisely because 0.7 had no replication. People lost data when brokers failed, and Kafka almost did not recover its reputation. The 0.8 release in 2013 added the in-sync replica model and earned the project its current trust. Almost every distributed system goes through this moment; Kafka's was unusually public.

Jay Kreps' December 2013 essay "The Log: What every software engineer should know about real-time data's unifying abstraction" is the closest thing the field has to a manifesto. It is the reason a generation of engineers stopped reaching for a queue and started reaching for a log.

Dumb broker, smart consumer was a deliberate rejection of the JMS / RabbitMQ model. The broker tracks no per-consumer state on each message — only per-group offsets in `__consumer_offsets`. That is the single design choice that lets Kafka scale to millions of consumers on a single topic.

Kafka has a data structure literally called the request purgatory — for delayed requests waiting on a condition. It is in the broker code and shows up in JMX metrics. The naming committee deserves credit.

Neha Narkhede founded the fraud-detection startup Oscilar in 2021 after Confluent and is its CEO. Jay Kreps has been Confluent CEO since founding and stayed on through the IBM deal. Jun Rao continues as a Confluent technical leader and Kafka committer.

The KIP culture is itself worth knowing. Every change goes through a Kafka Improvement Proposal vote on `dev@kafka.apache.org`. Each KIP needs a discussion thread, a vote with at least three binding +1s and no -1s, and merges through committers. KIP-1150 — diskless — was approved on 2 March 2026 with nine binding +1s. The PMC is currently chaired by Mickael Maison at Red Hat.

## Where this connects in the book

- Part Foundations chapter "Client-Server vs Peer-to-Peer" — the broader question of communication patterns Kafka inhabits, and why a partitioned log is the natural fit for asynchronous fanout at scale.
- Part Async / IoT chapter "Kafka" — the long-form story: LinkedIn 2010, the 0.8 ISR rewrite, KIP-500 to KRaft, KIP-848 to fast rebalances, KIP-932 to queues, the WarpStream acquisition, and the IBM deal. This is the chapter to send anyone who wants the historical arc.
- Part How Networks Actually Behave chapter "Recurring Patterns" — Kafka's idempotent producer is one of the canonical examples of the idempotency-key pattern Stripe popularized for payments; the chapter ties it into the same family as TCP retransmits and HTTP idempotent verbs.

## See also (other protocol episodes)

If you have heard the TCP episode, Kafka is what TCP looks like when you build an entire ecosystem on persistent connections. Kafka clients open long-lived TCP sockets to brokers on port 9092 and never let them go — they amortize the handshake cost across millions of records and rely on TCP's reliable in-order delivery for batches, offset commits, and metadata exchanges. The OS page cache plus `sendfile(2)` zero-copy on top of that is what gives Kafka its raw throughput edge.

If you have heard the TLS episode, the way Kafka layers TLS is the older, stricter pattern. There is no STARTTLS, no upgrade-in-place — a Kafka listener is either PLAINTEXT or SSL from the first byte, with the TLS handshake completing before any Kafka frame is on the wire. Combined with SASL authentication, TLS also enables mutual authentication between clients and brokers and secures inter-broker replication across data centers.

The contrast worth drawing is Kafka against AMQP, the protocol RabbitMQ speaks. AMQP brokers route individual messages with rich exchanges and bindings, per-message acknowledgement, and dead-letter queues — the broker is smart and stores per-message state. Kafka is the opposite design: a partitioned append-only log where consume means read at an offset, not delete, and the broker tracks no per-consumer state on each record. Use AMQP when you want complex routing or per-message ACKs for task distribution; use Kafka when you want to replay history, hit millions of events per second, or fan one stream out to many independent consumer groups. KIP-932 Queues for Kafka is, for the first time, narrowing that gap from the Kafka side.

## Visual cues for image generation

- A single partition drawn as a horizontal append-only tape with offsets 0, 1, 2 ... 1547, a producer arrow stamping new records on the right end and three consumer-group cursors at different offsets reading left-to-right at their own pace.
- Side-by-side rebalance timelines: classic protocol bar 103 seconds long, KIP-848 bar 5 seconds long, both labeled 10 consumers and 900 partitions.
- A ZooKeeper tombstone marked Kafka 4.0, 18 March 2025, with KRaft replacing it as a small Raft quorum drawn off to the side.
- Tiered storage diagram: hot recent segments on local SSD on the broker, older segments offloaded to an S3 bucket, with a 150 GB/s aggregate throughput tag.
- The Datadog 8 March 2023 outage timeline: an Ubuntu systemd patch icon, a routing table being wiped, then Kafka and ZooKeeper boxes going dark across all five regions for 24 hours.
- A wire-format strip showing a v2 RecordBatch — baseOffset, batchLength, CRC32C, attributes, then a packed array of compressed records — labeled to show that compression operates on the whole batch, not each record.

## Sources

**Apache Kafka project**

- [Apache Kafka 4.0 protocol page](https://kafka.apache.org/40/protocol.html)
- [Apache Kafka 4.2 protocol page](https://kafka.apache.org/42/design/protocol/)
- [Apache Kafka protocol guide](https://kafka.apache.org/protocol)
- [A Guide to the Kafka Protocol (cwiki)](https://cwiki.apache.org/confluence/display/KAFKA/A+Guide+To+The+Kafka+Protocol)
- [Apache Kafka 4.0 release announcement](https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/)
- [Apache Kafka 4.0 upgrade notes](https://kafka.apache.org/40/getting-started/upgrade/)
- [Apache Kafka security docs](https://kafka.apache.org/documentation/#security)
- [Apache Kafka CVE list](https://kafka.apache.org/cve-list)
- [apache/kafka source — message specs](https://github.com/apache/kafka/tree/trunk/clients/src/main/resources/common/message)

**KIPs**

- [KIP-98 — Exactly Once Delivery and Transactional Messaging](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)
- [KIP-101 — Leader Epoch for truncation](https://cwiki.apache.org/confluence/display/KAFKA/KIP-101+-+Alter+Replication+Protocol+to+use+Leader+Epoch+rather+than+High+Watermark+for+Truncation)
- [KIP-185 — Idempotence as default](https://cwiki.apache.org/confluence/display/KAFKA/KIP-185%3A+Make+exactly+once+in+order+delivery+per+partition+the+default+Producer+setting)
- [KIP-294 — TLS hostname verification by default](https://cwiki.apache.org/confluence/display/KAFKA/KIP-294+-+Enable+TLS+hostname+verification+by+default)
- [KIP-482 — Optional Tagged Fields](https://cwiki.apache.org/confluence/display/KAFKA/KIP-482%3A+The+Kafka+Protocol+should+Support+Optional+Tagged+Fields)
- [KIP-511 — Client name and version](https://cwiki.apache.org/confluence/display/KAFKA/KIP-511%3A+Collect+and+Expose+Client%27s+Name+and+Version+in+the+Brokers)
- [KIP-595 — A Raft Protocol for the Metadata Quorum](https://cwiki.apache.org/confluence/display/KAFKA/KIP-595%3A+A+Raft+Protocol+for+the+Metadata+Quorum)
- [KIP-848 — Next-gen consumer rebalance protocol (cwiki)](https://cwiki.apache.org/confluence/x/HhD1D)
- [KIP-932 — Queues for Kafka — Preview Release Notes](https://cwiki.apache.org/confluence/display/KAFKA/Queues+for+Kafka+%28KIP-932%29+-+Preview+Release+Notes)
- [Kafka Improvement Proposals index](https://cwiki.apache.org/confluence/display/KAFKA/Kafka+Improvement+Proposals)

**RFCs**

- [RFC 9293 — Transmission Control Protocol](https://datatracker.ietf.org/doc/html/rfc9293)
- [RFC 8446 — TLS 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
- [RFC 5802 — SCRAM](https://datatracker.ietf.org/doc/html/rfc5802)
- [RFC 4422 — SASL](https://datatracker.ietf.org/doc/html/rfc4422)
- [RFC 4752 — SASL GSSAPI](https://datatracker.ietf.org/doc/html/rfc4752)
- [RFC 7628 — SASL OAUTHBEARER](https://datatracker.ietf.org/doc/html/rfc7628)

**Papers**

- [Kreps, Narkhede, Rao — Kafka: A Distributed Messaging System for Log Processing (NetDB '11)](https://notes.stephenholiday.com/Kafka.pdf)
- [Goodhope et al. — Building LinkedIn's Real-time Activity Data Pipeline (IEEE Data Eng. Bull. 2012)](http://sites.computer.org/debull/A12june/pipeline.pdf)
- [Kleppmann and Kreps — Kafka, Samza and the Unix Philosophy of Distributed Data (2015)](https://martin.kleppmann.com/papers/kafka-debull15.pdf)
- [Apache Kafka — books and papers index](https://kafka.apache.org/community/books_and_papers/)

**Vendor and engineering blogs**

- [Jay Kreps — The Log (LinkedIn engineering, 2013)](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
- [LinkedIn — How LinkedIn customizes Kafka for 7 trillion messages a day](https://www.linkedin.com/blog/engineering/open-source/apache-kafka-trillion-messages)
- [ByteByteGo — How LinkedIn customizes its 7 trillion](https://blog.bytebytego.com/p/how-linkedin-customizes-its-7-trillion)
- [Confluent — KIP-848 deep dive](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/)
- [Confluent — Exactly-once semantics in Apache Kafka](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
- [Confluent — Kafka 3.3 release notes](https://www.confluent.io/blog/apache-kafka-3-3-0-new-features-and-updates/)
- [Confluent — Kafka 3.8 release notes](https://www.confluent.io/blog/introducing-apache-kafka-3-8/)
- [Confluent — Kafka 3.9 release notes](https://www.confluent.io/blog/introducing-apache-kafka-3-9/)
- [Confluent — Kafka 4.1 release notes](https://www.confluent.io/blog/introducing-apache-kafka-4-1/)
- [Confluent — Latest Apache Kafka release blog](https://www.confluent.io/blog/latest-apache-kafka-release/)
- [Confluent — Tableflow GA](https://www.confluent.io/blog/tableflow-ga-kafka-snowflake-iceberg/)
- [Confluent — Kafka client updates: KIP-848 and OAuth](https://www.confluent.io/blog/kafka-client-updates-kip-848-oauth/)
- [Confluent — Debug Apache Kafka, part 3](https://www.confluent.io/blog/debug-apache-kafka-pt-3/)
- [Confluent — Confluent Cloud Q1 2025 launch](https://www.confluent.io/blog/2025-q1-confluent-cloud-launch/)
- [Confluent press release — Confluent acquires WarpStream](https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/)
- [Aiven — KIP-1150 accepted](https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead)
- [Aiven — Guide to diskless Apache Kafka](https://aiven.io/blog/guide-diskless-apache-kafka-kip-1150)
- [Aiven — 16 ways tiered storage makes Kafka better](https://aiven.io/blog/16-ways-tiered-storage-makes-kafka-better)
- [Buf — Bufstream on Spanner](https://buf.build/blog/bufstream-on-spanner)
- [WarpStream — AI / streaming overview](https://www.warpstream.com/ai-info)
- [Redpanda — data streaming platform capabilities](https://www.redpanda.com/data-streaming-platform-capabilities)
- [StreamNative — Kafka on Pulsar](https://streamnative.io/blog/kafka-on-pulsar-bring-native-kafka-protocol-support-to-apache-pulsar)
- [Google Cloud — Managed Service for Apache Kafka launch](https://cloud.google.com/blog/products/data-analytics/new-managed-service-for-apache-kafka)
- [Google Cloud — Managed Service for Apache Kafka overview](https://docs.cloud.google.com/managed-service-for-apache-kafka/docs/overview)
- [Google Cloud — release notes](https://docs.cloud.google.com/managed-service-for-apache-kafka/docs/release-notes)
- [AWS — MSK supported Kafka versions](https://docs.aws.amazon.com/msk/latest/developerguide/supported-kafka-versions.html)
- [AWS — MSK supports Kafka 3.8](https://aws.amazon.com/about-aws/whats-new/2025/02/amazon-msk-apache-kafka-version-3-8/)
- [Red Hat Developer — Kafka tiered storage deep dive](https://developers.redhat.com/articles/2024/03/13/kafka-tiered-storage-deep-dive)
- [Red Hat Developer — Deep dive into Kafka's KRaft protocol](https://developers.redhat.com/articles/2025/09/17/deep-dive-apache-kafkas-kraft-protocol)
- [Instaclustr — Next-generation consumer rebalance protocol](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)
- [Karafka — Kafka new rebalance protocol](https://karafka.io/docs/Kafka-New-Rebalance-Protocol/)
- [Conduktor — Exactly-once semantics in Kafka](https://www.conduktor.io/glossary/exactly-once-semantics-in-kafka)
- [AxonOps — Kafka wire protocol spec](https://axonops.com/docs/data-platforms/kafka/architecture/client-connections/kafka-protocol/)
- [Ivan Yurchenko — Kafka protocol practical guide](https://ivanyu.me/blog/2024/09/08/kafka-protocol-practical-guide/)
- [Andrew Schofield — Queues for Kafka](https://medium.com/@andrew_schofield/queues-for-kafka-29afa8aeed86)
- [Gunnar Morling — KIP-932 Queues for Kafka](https://www.morling.dev/blog/kip-932-queues-for-kafka/)
- [Jack Vanlightly — distributed-systems blog](https://jack-vanlightly.com/)
- [2 Minute Streaming — Stanislav Kozlovski](https://blog.2minutestreaming.com/)
- [SoftwareMill — Who and why uses Apache Kafka](https://blog.softwaremill.com/who-and-why-uses-apache-kafka-10fd8c781f4d)
- [Bhagyarana — Real-world Redpanda Kafka compatibility](https://medium.com/@bhagyarana80/real-world-redpanda-kafka-compatibility-fewer-headaches-bd74de489c06)
- [Pharos Production — What's new in Kafka 3.8](https://medium.com/pharos-production/whats-new-in-kafka-3-8-5d1c9f01dc51)
- [Surya Teja — A brand new Kafka consumer rebalance protocol](https://suryateja9618.medium.com/a-brand-new-kafka-consumer-rebalance-protocol-6d1f619e148b)
- [Michal Drozd — Kafka consumer rebalance storm](https://www.michal-drozd.com/en/blog/kafka-consumer-rebalance-storm/)
- [OpenLogic — Upgrading to Kafka 4 planning](https://www.openlogic.com/blog/upgrade-kafka-4-planning)
- [Java Code Geeks — Kafka 4.0, KRaft, the end of ZooKeeper](https://www.javacodegeeks.com/2026/02/kafka-4-0-kraft-the-end-of-zookeeper.html)
- [Confluent docs — Tableflow overview](https://docs.confluent.io/cloud/current/topics/tableflow/overview.html)
- [Confluent Platform — release notes](https://docs.confluent.io/platform/current/release-notes/index.html)
- [AutoMQ — Kafka vs Pulsar comparison](https://github.com/AutoMQ/automq/wiki/Apache-Kafka-vs.-Apache-Pulsar:-Differences-&-Comparison)
- [Redpanda issue 29223 — KIP-848 status](https://github.com/redpanda-data/redpanda/issues/29223)

**Security advisories**

- [IBM — security bulletin CVE-2024-31141](https://www.ibm.com/support/pages/security-bulletin-security-vulnerability-apache-kafka-clients-affects-ibm-business-automation-workflow-case-event-emitters-cve-2024-31141-0)
- [IBM — security bulletin CVE-2025-27817](https://www.ibm.com/support/pages/security-bulletin-arbitrary-file-read-and-ssrf-unrestricted-url-configuration-apache-kafka-client-sasloauthbearer-settings-affects-watsonxdata)
- [Confluent — CONFSA-2025-04 advisory](https://support.confluent.io/hc/en-us/articles/39740309244180-CONFSA-2025-04-CVE-2025-27817-Confluent-Platform-and-Confluent-Cloud-Arbitrary-File-Read-and-Server-Side-Request-Forgery-SSRF-Vulnerability-via-unauthorized-changes-to-Kafka-Client-SASL-OAUTHBEARER-configuration)
- [CVE Details — Apache Kafka vulnerability list](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-48980/Apache-Kafka.html)
- [Apache Kafka community — CVE list](https://kafka.apache.org/community/cve-list/)

**News**

- [IBM newsroom — IBM completes acquisition of Confluent (17 March 2026)](https://newsroom.ibm.com/2026-03-17-ibm-completes-acquisition-of-confluent,-making-real-time-data-the-engine-of-enterprise-ai-and-agents)
- [SEC filing — Confluent](https://www.sec.gov/Archives/edgar/data/0001699838/000169983826000004/cflt-20251231xexx991.htm)
- [GeekWire — Confluent Community License](https://www.geekwire.com/2018/concerned-cloud-providers-confluent-becomes-latest-open-source-company-set-new-restrictions-usage/)
- [TechCrunch — Robinhood meme stock report](https://techcrunch.com/2022/06/27/robinhood-report-meme-stock-gamestop/)
- [Datadog — multi-region infrastructure connectivity issue post-mortem](https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/)
- [Datadog engineering — deep dive into platform-level impact](https://www.datadoghq.com/blog/engineering/2023-03-08-deep-dive-into-platform-level-impact/)
- [Pragmatic Engineer — Inside the Datadog outage](https://newsletter.pragmaticengineer.com/p/inside-the-datadog-outage)
- [Pragmatic Engineer on X — Heroku 2025 systemd pattern](https://x.com/Pragmatic_Eng/status/1947769489937887510)
- [Slack engineering — 22 February 2022 incident](https://slack.engineering/slacks-incident-on-2-22-22/)
- [Slack engineering — 4 January 2021 outage](https://slack.engineering/slacks-outage-on-january-4th-2021/)
- [Stanislav Kozlovski on X — KIP-1150 acceptance](https://x.com/BdKozlovski/status/1912504414528552984)
- [Confluent business profile — Tracxn](https://tracxn.com/d/companies/confluent/__-MscAmnKAk9Sgax_b_fDjJcgW3xPc0DkslokE_ec5bs)
- [Confluent brief history — Business Model Canvas](https://businessmodelcanvastemplate.com/blogs/brief-history/confluent-brief-history)

**Wikipedia**

- [Wikipedia — Apache Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)
- [Wikipedia — Confluent](https://en.wikipedia.org/wiki/Confluent)
- [Wikipedia — Neha Narkhede](https://en.wikipedia.org/wiki/Neha_Narkhede)
- [Vintage is the New Old — Why is Kafka named Kafka](https://www.vintageisthenewold.com/faq/why-is-kafka-named-kafka)
- [Haris WB — Summary of The Log](https://hariswb.com/posts/summary-of-the-log/)
- [Grokipedia — Confluent](https://grokipedia.com/page/Confluent)
- [Cloudflare — OSI model glossary](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)
- [Springer — LinkedIn activity pipeline reference work entry](https://link.springer.com/referenceworkentry/10.1007/978-3-319-63962-8_196-2)
