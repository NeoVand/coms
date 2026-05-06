---
prompt_source: deep-research-prompts.txt:5932-6108 (PROTOCOL · Kafka)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/a600bb2c-a8d1-44b7-a6de-0a4080d40f02
research_mode: claude.ai Research
---

# The Apache Kafka Wire Protocol — A Deep Field Guide (May 2026)

## Prerequisites and glossary

Before Kafka makes sense, an engineer needs the following building blocks. Each definition is followed by an authoritative explainer.

**Networking foundations**

- **OSI / TCP-IP layers** — Kafka lives at the application layer (L7), runs over TCP (L4) and optionally TLS (L6/L7). It does *not* use UDP. Reference: [Cloudflare's "OSI model"](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/).
- **TCP (Transmission Control Protocol)** — Connection-oriented, ordered, reliable byte stream. Kafka uses long-lived persistent TCP sockets. Reference: [RFC 9293](https://datatracker.ietf.org/doc/html/rfc9293).
- **Socket** — The OS endpoint for a network connection (IP+port pair on each side).
- **Header** — Fixed-format metadata at the start of a message (size, version, correlation ID).
- **Frame / length-prefix** — Kafka's "frame" is just `INT32` size + payload; not framed like HTTP/2 streams.
- **Datagram vs stream** — Datagram = independent packet (UDP); stream = ordered byte pipe (TCP). Kafka requires the latter.
- **Checksum / CRC32C** — A non-cryptographic integrity check. Kafka uses Castagnoli CRC32C on the record batch ([KIP-98 spec](https://kafka.apache.org/protocol)).
- **Handshake** — Initial negotiation: TCP three-way → optional TLS → optional SASL → ApiVersions.
- **Big-endian** — Byte order Kafka uses for all integers ([kafka.apache.org/protocol](https://kafka.apache.org/protocol)).

**Encoding primitives used by the wire protocol** (all from [kafka.apache.org/protocol](https://kafka.apache.org/protocol))

- `BOOLEAN, INT8/16/32/64, UINT16/32, FLOAT64, UUID` — Fixed-width.
- `VARINT / VARLONG` — Variable-length integer using ZigZag encoding (Protobuf-style); negative numbers map to small unsigned values via `(n << 1) ^ (n >> 31)`.
- `STRING` (`INT16` length + UTF-8 bytes), `NULLABLE_STRING` (-1 = null), `BYTES`, `NULLABLE_BYTES`, `RECORDS`.
- `COMPACT_STRING / COMPACT_BYTES / COMPACT_ARRAY` — Length stored as unsigned varint, with `0` reserved for null and the actual length being `length-1`. Used in *flexible* (tagged-field) versions only.
- `ARRAY` (legacy: `INT32` count) vs `COMPACT_ARRAY`.
- **Tagged fields / flexible versions (KIP-482)** — Every flexible message ends with a varint count of optional `(tag, length, value)` triples, allowing forward-compatible additions without bumping the request version. Spec: [KIP-482 wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-482%3A+The+Kafka+Protocol+should+Support+Optional+Tagged+Fields). [Apache](https://cwiki.apache.org/confluence/display/KAFKA/KIP-482:+The+Kafka+Protocol+should+Support+Optional+Tagged+Fields)

**Cryptographic and authentication primitives**

- **TLS 1.2/1.3** — Encrypts the byte stream and authenticates the server (and optionally the client via mTLS). [RFC 8446](https://datatracker.ietf.org/doc/html/rfc8446).
- **SASL (Simple Authentication and Security Layer)** — Pluggable auth framework. [RFC 4422](https://datatracker.ietf.org/doc/html/rfc4422).
- **SASL/PLAIN** — Username + password over TLS.
- **SASL/SCRAM-SHA-256 / 512** — Salted Challenge Response Auth ([RFC 5802](https://datatracker.ietf.org/doc/html/rfc5802)). Kafka's pre-3.9.0 implementation skipped server-nonce verification — see CVE-2024-56128. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-48980/Apache-Kafka.html)[Apache Kafka](https://kafka.apache.org/community/cve-list/)
- **SASL/GSSAPI = Kerberos** — Ticket-based enterprise auth. [RFC 4752](https://datatracker.ietf.org/doc/html/rfc4752).
- **SASL/OAUTHBEARER** — Bearer-token auth, increasingly default for cloud Kafka. [RFC 7628](https://datatracker.ietf.org/doc/html/rfc7628).

**Kafka domain vocabulary** (canonical: [kafka.apache.org/documentation](https://kafka.apache.org/documentation))

- **Broker** — A Kafka server process; stores partitions and serves clients.
- **Cluster / KRaft quorum** — Set of brokers + (since 4.0) a quorum of controller nodes running Kafka's Raft variant.
- **Controller** — The active leader of the metadata quorum. Pre-4.0 the controller was a broker chosen via ZooKeeper; today it is a dedicated KRaft role.
- **Topic** — A named log; logically partitioned.
- **Partition** — Ordered, append-only log; the unit of parallelism and replication.
- **Replica** — A copy of a partition on another broker.
- **Leader / Follower** — One replica is leader (handles all reads/writes); others fetch and replicate.
- **ISR (In-Sync Replica set)** — Replicas judged caught up enough to be eligible for leader election.
- **HWM (High Watermark) / LEO (Log End Offset)** — HWM = highest offset replicated to all ISR members and visible to consumers; LEO = next offset to be appended.
- **Leader epoch** — Monotonic counter bumped on every leader change; used to fence zombies and reconcile divergent logs (KIP-101).
- **Offset** — Sequential 64-bit position within a partition.
- **Log segment** — On-disk file holding a contiguous range of offsets.
- **Tombstone** — A record with `null` value used in compacted topics to signal "delete this key."
- **Compaction** — Retention policy that keeps only the latest value per key.
- **Producer** — Client that publishes records.
- **Idempotent producer** — Producer with PID + per-partition sequence numbers so the broker dedups retries (KIP-98). Default `enable.idempotence=true` since Kafka 3.0. [Conduktor](https://www.conduktor.io/glossary/exactly-once-semantics-in-kafka)
- **Transactional producer** — Spans multiple partitions atomically using `transactional.id`, producer epoch, and `WriteTxnMarkers` control batches (KIP-98).
- **EOS (Exactly-Once Semantics)** — Idempotence + transactions across read-process-write loops; v2 since 2.5.
- **Consumer / Consumer group** — Group of consumers that share partitions; coordinated by a broker-side group coordinator.
- **Rebalance** — Reassignment of partitions across group members. The classic "stop-the-world" version (eager) is replaced by cooperative (KIP-429) and now KIP-848's broker-driven incremental protocol. [Instaclustr](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)
- **Coordinator** — Broker hosting the `__consumer_offsets` (or transaction) partition that owns a group's state.
- **KRaft** — Kafka Raft Metadata mode, replacing ZooKeeper since 3.3, default since 3.8, exclusive since 4.0.
- **ZooKeeper / ZAB** — Old metadata store using Zookeeper Atomic Broadcast for ordered delivery; deprecated 3.5, removed 4.0.

## History and story

Kafka was built at LinkedIn in 2010 by **Jay Kreps, Neha Narkhede and Jun Rao** to replace a tangle of point-to-point ETL and message queues that could not handle activity-stream volumes. It was open-sourced in early 2011 and graduated from the Apache Incubator on **23 October 2012** ([Wikipedia / Apache Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)). Kreps named it after **Franz Kafka** because "it's a system optimized for writing" and he liked the writer's work — a piece of trivia confirmed by Kreps himself on Quora ([Wikipedia](https://en.wikipedia.org/wiki/Apache_Kafka)). The original NetDB '11 paper "Kafka: A Distributed Messaging System for Log Processing" remains the canonical academic reference ([NetDB '11 PDF](https://notes.stephenholiday.com/Kafka.pdf)). [Grokipedia + 3](https://grokipedia.com/page/Confluent)

The version timeline that matters:

- **0.7 (2012)** — No replication; people lost data when brokers failed.
- **0.8 (2013)** — Replication, ISR model.
- **0.9 (2015)** — New Java consumer, security (SSL, SASL/Kerberos), quotas, Kafka Connect.
- **0.10 (2016)** — Timestamps, Kafka Streams.
- **0.11 (June 2017)** — **Record batch v2 format** (KIP-98), idempotent + transactional producer, EOS, headers ([KIP-98 wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)).
- **1.0 (Nov 2017), 2.0 (2018)** — Hardening; ACLs, prefix ACLs.
- **2.1 (2018)** — `zstd` compression added.
- **2.3 (2019)** — Incremental cooperative rebalancing for Connect; KIP-482 tagged fields begin rolling out.
- **2.4 (Dec 2019)** — `IncrementalFetchRequest`, KIP-429 cooperative consumer rebalancing, follower fetching. [Instaclustr](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)
- **2.5 / 2.6 (2020)** — EOS v2, simpler transactional API.
- **2.8 (April 2021)** — KRaft early access (KIP-500 preview).
- **3.0 (Sept 2021)** — `enable.idempotence=true` by default; Java 8 deprecated.
- **3.3 (Oct 2022)** — KRaft marked production-ready for **new** clusters (KIP-833). [Confluent](https://www.confluent.io/blog/apache-kafka-3-3-0-new-features-and-updates/)
- **3.4–3.6 (2023)** — ZK→KRaft migration tooling; KIP-405 Tiered Storage early access in 3.6.
- **3.5 (June 2023)** — ZooKeeper formally **deprecated**.
- **3.7 (March 2024)** — KIP-848 consumer rebalance protocol in early access; official Apache/Kafka Docker image. [Instaclustr](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)[Confluent](https://www.confluent.io/blog/introducing-apache-kafka-3-8/)
- **3.8 (July 2024)** — Compression-level configs; JBOD with KRaft GA; first release where new KRaft clusters were the documented default path. [Medium](https://medium.com/pharos-production/whats-new-in-kafka-3-8-5d1c9f01dc51)[AWS](https://aws.amazon.com/about-aws/whats-new/2025/02/amazon-msk-apache-kafka-version-3-8/)
- **3.9 (6 November 2024)** — Last 3.x; **Tiered Storage GA**, KIP-853 dynamic KRaft quorums; "bridge release" for ZK→KRaft migration ([Apache Kafka 3.9 release blog](https://www.confluent.io/blog/introducing-apache-kafka-3-9/)). [Confluent + 3](https://www.confluent.io/blog/introducing-apache-kafka-3-9/)
- **4.0 (18 March 2025)** — **ZooKeeper removed entirely**; **KIP-848 GA** (new consumer protocol enabled on the broker); **KIP-932 Queues for Kafka in early access**; KIP-966 Eligible Leader Replicas in preview; KIP-996 Pre-Vote ([Kafka 4.0 announcement](https://kafka.apache.org/blog/2025/03/18/apache-kafka-4.0.0-release-announcement/)). [Java Code Geeks + 2](https://www.javacodegeeks.com/2026/02/kafka-4-0-kraft-the-end-of-zookeeper.html)
- **4.1 (4 September 2025)** — KIP-932 promoted to **preview**; new Streams Rebalance Protocol (KIP-1071) early access ([Confluent 4.1 blog](https://www.confluent.io/blog/introducing-apache-kafka-4-1/)). [Apache](https://cwiki.apache.org/confluence/display/KAFKA/Queues+for+Kafka+(KIP-932)+-+Preview+Release+Notes)[Confluent](https://www.confluent.io/blog/introducing-apache-kafka-4-1/)
- **4.2 (late 2025/early 2026)** — KIP-932 Queues for Kafka **GA**, continued KIP-848 improvements, MirrorMaker 1 removed ([Confluent Platform 8.2 release notes](https://docs.confluent.io/platform/current/release-notes/index.html)). [Confluent](https://docs.confluent.io/platform/current/release-notes/index.html)
- **KIP-1150 "Diskless Topics"** — accepted by the Apache Kafka community on **2 March 2026** with 9 binding votes ([Aiven blog](https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead)). Implementation underway via sub-KIPs (Core, Batch Coordinator, Compaction); production-ready release pending. [WarpStream](https://www.warpstream.com/ai-info)

**Politics & business turning points**

- **2014 (23–30 September)** — Kreps, Narkhede, Rao incorporate Confluent in Mountain View with $6.9M Series A from Benchmark and LinkedIn ([Wikipedia / Confluent](https://en.wikipedia.org/wiki/Confluent)). [Businessmodelcanvastemplate](https://businessmodelcanvastemplate.com/blogs/brief-history/confluent-brief-history)
- **December 2018** — **Confluent Community License** introduced for KSQL and friends, restricting cloud-as-a-service use; Kafka itself stays Apache 2.0 ([GeekWire](https://www.geekwire.com/2018/concerned-cloud-providers-confluent-becomes-latest-open-source-company-set-new-restrictions-usage/)). [GeekWire](https://www.geekwire.com/2018/concerned-cloud-providers-confluent-becomes-latest-open-source-company-set-new-restrictions-usage/)
- **November 2018** — AWS launches **MSK**, kicking off the open-source-vs-cloud debate.
- **2019** — **Redpanda** (then Vectorized) launches; C++ rewrite, Raft from day one, Kafka API compatible ([Redpanda](https://www.redpanda.com/data-streaming-platform-capabilities)). [Medium](https://medium.com/@bhagyarana80/real-world-redpanda-kafka-compatibility-fewer-headaches-bd74de489c06)
- **June 2021** — Confluent IPO at ~$10B valuation.
- **2023** — **WarpStream** launches: Go reimplementation, S3-as-storage, leaderless.
- **9 September 2024** — **Confluent acquires WarpStream** ([Confluent press release](https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/)). Acquired by Confluent. [Confluent](https://www.confluent.io/press-release/confluent-acquires-warpstream-to-advance-next-gen-byoc-data-streaming/)
- **August 2024** — **Google Cloud Managed Service for Apache Kafka** launches preview (GA 2025) ([Google blog](https://cloud.google.com/blog/products/data-analytics/new-managed-service-for-apache-kafka)). [Google Cloud](https://cloud.google.com/blog/products/data-analytics/new-managed-service-for-apache-kafka)
- **March 2025** — Kafka 4.0 ships; Confluent announces **Tableflow GA** (Iceberg materialization of topics) at Current 2025 ([Confluent blog](https://www.confluent.io/blog/tableflow-ga-kafka-snowflake-iceberg/)). [Confluent](https://www.confluent.io/blog/2025-q1-confluent-cloud-launch/)
- **8 December 2025** — **IBM agrees to acquire Confluent for $11B at $31/share**; deal closes **17 March 2026** ([IBM newsroom](https://newsroom.ibm.com/2026-03-17-ibm-completes-acquisition-of-confluent,-making-real-time-data-the-engine-of-enterprise-ai-and-agents)). Apache Kafka itself remains independent at the ASF. [sec + 3](https://www.sec.gov/Archives/edgar/data/0001699838/000169983826000004/cflt-20251231xexx991.htm)

## How it actually works

### Frame format

Kafka uses a **binary protocol over TCP**. Every request and response is length-prefixed: [Wikipedia](https://en.wikipedia.org/wiki/Apache_Kafka)[Apache Kafka](https://kafka.apache.org/42/design/protocol/)

```
RequestOrResponse => Size (RequestMessage | ResponseMessage)
Size => INT32 (big-endian, in bytes, not counting itself)
```

([kafka.apache.org/protocol](https://kafka.apache.org/protocol)).

### Request header

- **v0**: api_key(INT16) + api_version(INT16) + correlation_id(INT32)
- **v1**: + client_id(NULLABLE_STRING) [Apache Kafka](https://kafka.apache.org/42/design/protocol/)
- **v2**: + client_id(NULLABLE_STRING) + `_tagged_fields` (TAG_BUFFER) — used by all "flexible versions" since KIP-482 ([KIP-482 wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-482%3A+The+Kafka+Protocol+should+Support+Optional+Tagged+Fields)). [Apache](https://cwiki.apache.org/confluence/display/KAFKA/KIP-482:+The+Kafka+Protocol+should+Support+Optional+Tagged+Fields)

The broker enforces request ordering per connection and pipelines responses ([AxonOps Kafka Wire Protocol Spec](https://axonops.com/docs/data-platforms/kafka/architecture/client-connections/kafka-protocol/)).

### API keys (selection — current with 4.x)

| Key | Name |
|---|---|
| 0 | Produce |
| 1 | Fetch |
| 2 | ListOffsets |
| 3 | Metadata |
| 8 | OffsetCommit |
| 9 | OffsetFetch |
| 10 | FindCoordinator |
| 11 | JoinGroup |
| 12 | Heartbeat |
| 13 | LeaveGroup |
| 14 | SyncGroup |
| 15 | DescribeGroups |
| 16 | ListGroups |
| 17 | SaslHandshake |
| 18 | ApiVersions |
| 19 | CreateTopics |
| 22 | InitProducerId |
| 24 | AddPartitionsToTxn |
| 25 | AddOffsetsToTxn |
| 26 | EndTxn |
| 27 | WriteTxnMarkers |
| 36 | SaslAuthenticate |
| 50 | DescribeUserScramCredentials |
| 52 | Vote (KRaft) |
| 53 | BeginQuorumEpoch |
| 54 | EndQuorumEpoch |
| 55 | DescribeQuorum |
| 68 | ConsumerGroupHeartbeat (KIP-848) |
| 69 | ConsumerGroupDescribe |
| 70+ | ShareGroupHeartbeat / ShareGroupDescribe (KIP-932, currently unstable) |

Full list in `clients/src/main/resources/common/message/` of [the apache/kafka source tree](https://github.com/apache/kafka).

### Connection lifecycle

1. TCP connect (default port **9092**, dedicated TLS listener typically **9093**).
2. **ApiVersionsRequest v0** first — the client must send v0 to discover what the broker supports. Broker responds with supported (api_key, min_version, max_version) tuples ([Apache Kafka 4.0 protocol page](https://kafka.apache.org/40/protocol.html)). [Apache Kafka](https://kafka.apache.org/40/protocol.html)
3. If SASL listener: `SaslHandshakeRequest(mechanism)` then a series of `SaslAuthenticate` exchanges (or raw GSSAPI tokens for v0).
4. If SSL listener: TLS handshake happens **before** any Kafka frames.
5. `MetadataRequest` to discover topic→partition→leader mapping.
6. Steady-state `Produce` / `Fetch` loops; `Heartbeat` (or KIP-848 `ConsumerGroupHeartbeat`) for group membership.

### Record batch v2 (since 0.11 / KIP-98)

```
RecordBatch =>
 baseOffset:        INT64
 batchLength:       INT32
 partitionLeaderEpoch: INT32
 magic:             INT8 (=2)
 crc:               INT32 (CRC32C over fields after this point)
 attributes:        INT16 (compression, timestamp type, isTransactional, isControl, hasDeleteHorizon)
 lastOffsetDelta:   INT32
 baseTimestamp:     INT64
 maxTimestamp:      INT64
 producerId:        INT64
 producerEpoch:     INT16
 baseSequence:      INT32
 records:           [Record]   // length-prefixed varint count
Record =>
 length: VARINT
 attributes: INT8
 timestampDelta: VARLONG
 offsetDelta: VARINT
 keyLength: VARINT, key: BYTES
 valueLength: VARINT, value: BYTES
 headers: [Header]
```

([Apache Kafka protocol wiki: A Guide to the Kafka Protocol](https://cwiki.apache.org/confluence/display/KAFKA/A+Guide+To+The+Kafka+Protocol)). Compression now applies to whole batches, not single messages — the big win of v2.

### Producer flow

- `acks=0/1/all`. With **idempotence** enabled, the producer obtains a PID via `InitProducerId`, increments a **per-partition sequence number**, and the broker rejects out-of-order or duplicated sequences. With **transactions**, the client also calls `AddPartitionsToTxn`, optionally `AddOffsetsToTxn`, then `EndTxn`; the broker writes a `WriteTxnMarkers` control batch on each affected partition so consumers in `read_committed` mode skip aborted data ([KIP-98](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)). [Apache](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)[Confluent](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)

### Consumer group rebalance — old vs new

- **Classic eager (≤2.3)**: `FindCoordinator` → `JoinGroup` → `SyncGroup` → `Heartbeat`. All members revoke everything on each rebalance ("stop-the-world"). [Instaclustr](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)[Medium](https://suryateja9618.medium.com/a-brand-new-kafka-consumer-rebalance-protocol-6d1f619e148b)
- **Cooperative sticky (KIP-429, 2.4+)**: same RPCs, but only the partitions that need to move are revoked. [Instaclustr](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)[Confluent](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/)
- **KIP-848 (3.7 preview, 4.0 GA)**: a single `ConsumerGroupHeartbeat` (api_key 68) carries subscriptions, owned partitions and member epoch; the broker-side group coordinator is now the source of truth and pushes incremental assignments back. **No more SyncGroup.** Up to 20× faster rebalances ([Confluent KIP-848 blog](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/), [Instaclustr KIP-848 article](https://www.instaclustr.com/blog/rebalance-your-apache-kafka-partitions-with-the-next-generation-consumer-rebalance-protocol/)). Enabled with `group.protocol=consumer`. [Apache Software Foundation + 4](https://cwiki.apache.org/confluence/x/HhD1D)

### KRaft (KIP-500/595)

KRaft replaces ZooKeeper with a Raft variant tailored for Kafka:

- The `__cluster_metadata` topic-partition is replicated by controller voters.
- Replication is **pull-based** (followers `Fetch` from the leader) rather than canonical Raft's push-based AppendEntries — this lets KRaft reuse Kafka's log replication code ([KIP-595 wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-595%3A+A+Raft+Protocol+for+the+Metadata+Quorum)).
- Uses **leader epoch** instead of Raft's "term"; commits via majority quorum, not ISR.
- Pre-Vote (KIP-996) avoids spurious epoch bumps; KIP-853 enables dynamic voter membership.

### Replication, leader epoch, truncation

KIP-101 (and KIP-279) added `OffsetForLeaderEpochRequest` so a returning follower can ask the leader for the *end offset of its last leader epoch* and truncate cleanly to that point — fixing scenarios where high-watermark-only truncation could lose committed data on unclean leader election ([KIP-101 wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-101+-+Alter+Replication+Protocol+to+use+Leader+Epoch+rather+than+High+Watermark+for+Truncation)).

### Compression and integrity

- gzip, snappy, lz4, **zstd** (since 2.1), with per-codec levels since 3.8.
- CRC32C (Castagnoli) over each batch.

### Security

PLAINTEXT, SSL (TLS), SASL_PLAINTEXT, SASL_SSL with mechanisms PLAIN, SCRAM-SHA-256/512, GSSAPI, OAUTHBEARER, plus mTLS principal mapping. Hostname verification (`ssl.endpoint.identification.algorithm=HTTPS`) has been the **default since 2.0** ([KIP-294](https://cwiki.apache.org/confluence/display/KAFKA/KIP-294+-+Enable+TLS+hostname+verification+by+default)). [Apache Kafka](https://kafka.apache.org/25/security/encryption-and-authentication-using-ssl/)

### Error handling

Every response carries an `INT16` `error_code`. Examples: `NONE=0`, `OFFSET_OUT_OF_RANGE=1`, `UNKNOWN_TOPIC_OR_PARTITION=3`, `LEADER_NOT_AVAILABLE=5`, `NOT_LEADER_OR_FOLLOWER=6`, `REQUEST_TIMED_OUT=7`, `REPLICA_NOT_AVAILABLE=9`, `UNKNOWN_MEMBER_ID=25`, `FENCED_MEMBER_EPOCH`, etc. Clients distinguish retriable from non-retriable errors. Full list at [kafka.apache.org/protocol#protocol_error_codes](https://kafka.apache.org/protocol). [Apache Kafka](https://kafka.apache.org/42/design/protocol/)

### Mermaid sequence: produce-then-consume

GroupCoordinatorConsumerBroker (leader)ProducerGroupCoordinatorConsumerBroker (leader)Producer#mermaid-rg9{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rg9 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rg9 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rg9 .error-icon{fill:#CC785C;}#mermaid-rg9 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rg9 .edge-thickness-normal{stroke-width:1px;}#mermaid-rg9 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rg9 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rg9 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rg9 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rg9 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rg9 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rg9 .marker.cross{stroke:#A1A1A1;}#mermaid-rg9 svg{font-family:inherit;font-size:16px;}#mermaid-rg9 p{margin:0;}#mermaid-rg9 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rg9 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg9 .actor-line{stroke:#A1A1A1;}#mermaid-rg9 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rg9 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rg9 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rg9 .sequenceNumber{fill:#5e5e5e;}#mermaid-rg9 #sequencenumber{fill:#E5E5E5;}#mermaid-rg9 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rg9 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rg9 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rg9 .labelText,#mermaid-rg9 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg9 .loopText,#mermaid-rg9 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg9 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rg9 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rg9 .noteText,#mermaid-rg9 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg9 .activation0{fill:transparent;stroke:#00000000;}#mermaid-rg9 .activation1{fill:transparent;stroke:#00000000;}#mermaid-rg9 .activation2{fill:transparent;stroke:#00000000;}#mermaid-rg9 .actorPopupMenu{position:absolute;}#mermaid-rg9 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rg9 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rg9 .actor-man circle,#mermaid-rg9 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rg9 :root{--mermaid-font-family:inherit;}TCP+optional TLS+SASLApiVersionsRequest v0Supported APIsMetadataRequest(topics)leader=brokerX, epoch=eInitProducerId (idempotent)PID, epochProduceRequest(acks=all, batch v2)ProduceResponse(baseOffset)FindCoordinator(group)coord = brokerYConsumerGroupHeartbeat (KIP-848)assigned=[(t,p)]FetchRequest(fetchOffset)RecordsOffsetCommit

### Illustrative bytes — `ApiVersionsRequest v3` (flexible)

```
00 00 00 1A      # size=26
00 12            # api_key=18
00 03            # api_version=3
00 00 00 01      # correlation_id=1
00 09 6D 79 2D 63 6C 69 65 6E 74  # client_id="my-client" (NULLABLE_STRING)
00               # tagged-fields count (request header v2)
0A 6B 61 66 6B 61 2D 70 79         # client_software_name compact-string "kafka-py" (len=10-1=9)
04 32 2E 30 2E 30                  # client_software_version "2.0.0" (len=5-1=4 → wait len=6-1=5)
00               # tagged-fields count (body)
```

(Schema confirmed in [KIP-511 wiki](https://cwiki.apache.org/confluence/display/KAFKA/KIP-511%3A+Collect+and+Expose+Client%27s+Name+and+Version+in+the+Brokers); offsets are illustrative.)

### Illustrative `ProduceRequest v9` skeleton

```
size INT32
header v2 (api_key=0, version=9, corr_id, client_id, tag_buffer)
transactional_id COMPACT_NULLABLE_STRING
acks INT16 (-1 = all)
timeout_ms INT32
topic_data COMPACT_ARRAY [
  name COMPACT_STRING
  partition_data COMPACT_ARRAY [
     index INT32
     records COMPACT_RECORDS  (the v2 RecordBatch above)
     tag_buffer
  ]
  tag_buffer
]
tag_buffer
```

A reader who has digested this section, the JSON message specs in `clients/src/main/resources/common/message/`, and Ivan Yurchenko's [practical guide](https://ivanyu.me/blog/2024/09/08/kafka-protocol-practical-guide/) can implement a minimal Kafka client.

## Deep connections to other protocols

- **TCP** — Kafka's transport. Kafka uses long-lived persistent connections to amortize TCP setup cost and exploits OS page cache + `sendfile(2)` for zero-copy fetches. UDP is a non-starter because of ordering and reliability needs ([kafka.apache.org/protocol intro](https://kafka.apache.org/protocol)). [Apache Kafka](https://kafka.apache.org/40/protocol.html)
- **TLS** — Optional encryption + server (and optional client/mTLS) auth. Either a full handshake on a dedicated SSL listener (typical 9093) or never inline; Kafka does not do upgrade-in-place ([Apache Kafka security docs](https://kafka.apache.org/documentation/#security)).
- **SASL** — Authentication framework; concrete mechanisms PLAIN/SCRAM/GSSAPI/OAUTHBEARER are negotiated via `SaslHandshakeRequest` and exchanged via `SaslAuthenticate` (or raw tokens in v0).
- **Kerberos / GSSAPI** — Used by Hadoop-adjacent enterprise installs for strong, ticket-based auth.
- **OAUTHBEARER (OAuth 2.0)** — Increasingly the cloud default; recently extended in 2025 with OIDC metadata authentication for Azure-IMDS-style flows ([Confluent client updates](https://www.confluent.io/blog/kafka-client-updates-kip-848-oauth/)). [Confluent](https://www.confluent.io/blog/kafka-client-updates-kip-848-oauth/)
- **ZooKeeper / ZAB** — Historical metadata store. ZAB is a primary-backup atomic broadcast protocol; Kafka used Zookeeper to elect controllers, hold ACLs, store partition state. Replaced by KRaft; removed entirely in Kafka 4.0.
- **Raft / KRaft** — KIP-500 and KIP-595 introduced a Kafka-flavored Raft: pull-based replication, Kafka v2 record format on the metadata log, leader epoch as "term", PreVote (KIP-996), dynamic voters (KIP-853). Differs from canonical Raft mostly in transport direction and message format.
- **MQTT** — Lightweight pub/sub for IoT over TCP/TLS, with QoS 0/1/2, retained messages, last-will. Different domain (constrained devices, mobile networks). Bridged to Kafka via Kafka Connect MQTT source/sink or proxies. Kafka can absorb MQTT firehoses but is not itself MQTT compatible.
- **AMQP 0-9-1 / AMQP 1.0** — RabbitMQ's native protocol; broker-side routing through exchanges and bindings. Very different model: queues, individual ACKs, JMS-like semantics. **KIP-932 Queues for Kafka** narrows this gap with share groups (per-record acknowledgement and shared partition consumption) but does not adopt AMQP wire format ([Confluent / Andrew Schofield](https://medium.com/@andrew_schofield/queues-for-kafka-29afa8aeed86)). [Gunnar Morling](https://www.morling.dev/blog/kip-932-queues-for-kafka/)
- **Apache Pulsar binary protocol** — Direct competitor; protobuf-encoded; broker layer separate from BookKeeper storage layer; segmented log per partition; supports queue and stream semantics natively. Kafka-on-Pulsar (KoP) implements Kafka wire protocol on Pulsar ([StreamNative KoP blog](https://streamnative.io/blog/kafka-on-pulsar-bring-native-kafka-protocol-support-to-apache-pulsar)). [StreamNative + 3](https://streamnative.io/blog/kafka-on-pulsar-bring-native-kafka-protocol-support-to-apache-pulsar)
- **NATS / NATS JetStream** — Lightweight messaging, originally text protocol, JetStream adds persistence; far simpler model, lower throughput than Kafka but lower op cost.
- **gRPC / HTTP/2** — Not used by core Kafka. Used by Confluent REST Proxy, the Kafka REST proxy, Confluent Schema Registry, and some Confluent Cloud control-plane APIs.
- **HTTP/REST** — Same caveat: Confluent REST Proxy, Schema Registry, AKHQ, Conduktor — never the broker.
- **Avro / Protobuf / JSON Schema** — Encoding partners via a Schema Registry; Kafka itself is schema-agnostic and only sees opaque key/value bytes.
- **AWS S3 / GCS / Azure Blob** — Used by **KIP-405 Tiered Storage** (GA in 3.9) for offloading old log segments and by next-gen "diskless" architectures (WarpStream, AutoMQ, Bufstream, KIP-1150) where object storage is the *primary* store ([Aiven KIP-1150 deep dive](https://aiven.io/blog/guide-diskless-apache-kafka-kip-1150)).
- **Apache Iceberg / Delta Lake** — Not protocols, but **Tableflow** (Confluent, GA Q1 2025) materializes Kafka topics as Iceberg or Delta tables in object storage, blurring the line between streaming and lakehouse ([Confluent Tableflow GA blog](https://www.confluent.io/blog/tableflow-ga-kafka-snowflake-iceberg/)). [Confluent](https://docs.confluent.io/cloud/current/topics/tableflow/overview.html)
- **Related but missed by the prompt**: **JMX** (broker telemetry); **JAAS** (Java auth backplane SASL plugs into; CVE-2023-25194 lived here); **Cruise Control** (Linkedin partition rebalancer that uses Kafka admin protocol); **OpenTelemetry** (now wired through KIP-714 client metrics).

## Real-world deployment

**Major implementations**

- **Apache Kafka** — JVM (Scala+Java) reference broker. Source: [github.com/apache/kafka](https://github.com/apache/kafka).
- **librdkafka** — C/C++ client used by Python `confluent-kafka`, Go `confluent-kafka-go`, .NET, Rust, Node `node-rdkafka`. KIP-848 GA in librdkafka 2.12.
- **Sarama, kafka-go (Segment)** — Pure-Go clients.
- **kafka-python, aiokafka** — Pure-Python; Confluent's Python client (built on librdkafka) added native asyncio in 2025. [Confluent](https://www.confluent.io/blog/kafka-client-updates-kip-848-oauth/)
- **Confluent Platform / Confluent Cloud** — Now an **IBM company** as of 17 March 2026.
- **AWS MSK / MSK Serverless** — Tiered Storage, KIP-848, KRaft all supported; MSK supports Kafka 3.8/3.9/4.0/4.1 (last verified [docs.aws.amazon.com/msk](https://docs.aws.amazon.com/msk/latest/developerguide/supported-kafka-versions.html)).
- **Azure Event Hubs** — Kafka-API compatible (via emulation).
- **Google Cloud Managed Service for Apache Kafka** — Preview Aug 2024, **GA in 2025**, integrates with IAM, BigQuery, schema registry ([Google Cloud release notes](https://docs.cloud.google.com/managed-service-for-apache-kafka/docs/release-notes)). [Google Cloud](https://cloud.google.com/blog/products/data-analytics/new-managed-service-for-apache-kafka)[Google](https://docs.cloud.google.com/managed-service-for-apache-kafka/docs/overview)
- **Aiven for Apache Kafka** — Multi-cloud managed; donated open-source Tiered Storage S3 plugin and authored KIP-1150.
- **Redpanda** — C++ thread-per-core, Raft per partition from day one; Kafka API compatible. Did not yet support KIP-848 in late 2025 ([Redpanda issue #29223](https://github.com/redpanda-data/redpanda/issues/29223)). [Medium](https://medium.com/@bhagyarana80/real-world-redpanda-kafka-compatibility-fewer-headaches-bd74de489c06)[Karafka](https://karafka.io/docs/Kafka-New-Rebalance-Protocol/)
- **WarpStream** — Go, S3-backed, leaderless; acquired by Confluent in September 2024.
- **Bufstream** — Buf's diskless self-hosted Kafka API replacement; Spanner-backed metadata for scale ([Buf engineering blog](https://buf.build/blog/bufstream-on-spanner)). [Buf](https://buf.build/blog/bufstream-on-spanner)
- **AutoMQ** — Kafka fork on EBS+S3 (re-licensed Apache 2.0 in 2025); proposed KIP-1183. [GitHub](https://github.com/AutoMQ/automq/wiki/Apache-Kafka-vs.-Apache-Pulsar:-Differences-&-Comparison)
- **Strimzi** — Kubernetes operator for Kafka.

**Who runs Kafka at scale**

- **LinkedIn** — Origin and largest known deployment: 100+ clusters, 4,000+ brokers, ~7M partitions, **>7 trillion messages/day** as of the [2019 LinkedIn engineering blog](https://www.linkedin.com/blog/engineering/open-source/apache-kafka-trillion-messages); the figure is widely repeated in 2024–2025 follow-ups but has not been publicly updated, so treat it as a floor. [SoftwareMill](https://blog.softwaremill.com/who-and-why-uses-apache-kafka-10fd8c781f4d?gi=082bfdb7bd4d)
- **Netflix** — Keystone pipeline; trillions of events/day. [SoftwareMill](https://blog.softwaremill.com/who-and-why-uses-apache-kafka-10fd8c781f4d?gi=082bfdb7bd4d)
- **Uber** — uReplicator and aggregated multi-region clusters.
- **Apple, Datadog, Slack** — All publicly tested KIP-405 Tiered Storage during its run-up to GA ([Aiven 16-ways blog](https://aiven.io/blog/16-ways-tiered-storage-makes-kafka-better)).
- **Goldman Sachs** — Sub-5ms p99 end-to-end latency in trading (Confluent customer story). [Confluent](https://www.confluent.io/blog/introducing-apache-kafka-3-8/)
- **Cloudflare, Robinhood, Airbnb, Shopify, Pinterest** — Analytics and event-driven services.

**Performance characteristics**

- KIP-405 tiered storage: Aiven reports 150 GB/s aggregate in production; tests showed produce p99 21ms→25ms when enabled ([Aiven blog](https://aiven.io/blog/16-ways-tiered-storage-makes-kafka-better)).
- Bufstream + Spanner benchmark: 100 GiB/s writes, 300 GiB/s reads, p99 < 1s end-to-end ([Buf](https://buf.build/blog/bufstream-on-spanner)). [Buf](https://buf.build/blog/bufstream-on-spanner)
- Redpanda claims up to 10× lower tail latency than Kafka on the same hardware (vendor benchmark — treat with skepticism) ([Redpanda capabilities](https://www.redpanda.com/data-streaming-platform-capabilities)).
- Typical well-tuned Apache Kafka 4.x cluster: hundreds of MB/s per broker, sub-10ms p99 producer latency for small batches, depending on disk and replication factor.

**Topologies** — 3-replica with rack awareness; multi-region via **MirrorMaker 2** (KIP-382), Confluent Replicator, **Cluster Linking** (offset-preserving), or new diskless multi-region (Bufstream).

## Failure modes and famous incidents

**CVEs** (canonical list: [kafka.apache.org/cve-list](https://kafka.apache.org/cve-list)):

- **CVE-2023-25194** — SASL JAAS `JndiLoginModule` RCE/DoS via Kafka Connect REST API; later confirmed to apply to brokers too. Disallowed by default in 3.4 (and `LdapLoginModule` in 3.9.1/4.0.0) ([CVE list](https://kafka.apache.org/cve-list)). [Apache Kafka + 5](https://kafka.apache.org/community/cve-list/)
- **CVE-2024-31141** — Kafka clients' `FileConfigProvider`/`DirectoryConfigProvider`/`EnvVarConfigProvider` can be abused for arbitrary file/env read by untrusted callers; fixed by `org.apache.kafka.automatic.config.providers=none` in 3.8.0 ([IBM advisory](https://www.ibm.com/support/pages/security-bulletin-security-vulnerability-apache-kafka-clients-affects-ibm-business-automation-workflow-case-event-emitters-cve-2024-31141-0)). [IBM](https://www.ibm.com/support/pages/security-bulletin-security-vulnerability-apache-kafka-clients-affects-ibm-business-automation-workflow-case-event-emitters-cve-2024-31141-0)
- **CVE-2024-56128** — Kafka's SCRAM implementation skipped the server-nonce check required by RFC 5802; exploitable only over plaintext (i.e., SASL_PLAINTEXT). Fixed in 3.7.2/3.8.1/3.9.0 ([cvedetails / Apache advisory](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-48980/Apache-Kafka.html)). [CVE Details + 3](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-48980/version_id-617284/Apache-Kafka-2.3.0.html)
- **CVE-2025-27817** — Apache Kafka client SASL/OAUTHBEARER `token.endpoint.url`/`jwks.endpoint.url` allowed arbitrary file read/SSRF; fixed in 3.9.1/4.0.0 with `org.apache.kafka.sasl.oauthbearer.allowed.urls`; default became empty (deny-all) in 4.0 ([Apache CVE list](https://kafka.apache.org/cve-list)). [IBM +2 + 3](https://www.ibm.com/support/pages/security-bulletin-arbitrary-file-read-and-ssrf-unrestricted-url-configuration-apache-kafka-client-sasloauthbearer-settings-affects-watsonxdata)
- **CVE-2025-27818 / -27819** — Deserialization-of-untrusted-data issues in Confluent Platform components ([Confluent CONFSA-2025-02](https://support.confluent.io/)). [Confluent](https://support.confluent.io/hc/en-us/articles/39740309244180-CONFSA-2025-04-CVE-2025-27817-Confluent-Platform-and-Confluent-Cloud-Arbitrary-File-Read-and-Server-Side-Request-Forgery-SSRF-Vulnerability-via-unauthorized-changes-to-Kafka-Client-SASL-OAUTHBEARER-configuration)
- **CVE-2018-1288** — Authenticated client could craft a fetch that bypassed ACLs in some scenarios.
- **CVE-2021-44228 (Log4Shell)** — Indirect: Kafka brokers shipped Log4j 1.x but the wider ecosystem (connectors, dashboards, custom appenders) was widely affected. The full Log4j2 transition only completed with Kafka 4.0. [Apache Kafka](https://kafka.apache.org/community/cve-list/)[OpenLogic](https://www.openlogic.com/blog/upgrade-kafka-4-planning)

**Real-world outages**

- **Datadog, 8 March 2023** — Multi-region outage, all services down ~24h. Root cause: Ubuntu 22.04 systemd security update restarted `systemd-networkd`, which deleted Cilium-managed IP routes on Kubernetes nodes hosting Datadog's data pipeline (ZooKeeper-backed Kafka included, though the ZK quorum dynamics were exacerbating, not causal) ([Datadog post-mortem](https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/), [Pragmatic Engineer deep dive](https://newsletter.pragmaticengineer.com/p/inside-the-datadog-outage)).
- **Slack, 22 February 2022** — Cascading failure during a Consul rollout interacted with the Mcrib memcached manager and a query against a Vitess keyspace; not strictly a Kafka outage but archetypal of the messaging-tier ripple effects in the broader bus ([Slack engineering](https://slack.engineering/slacks-incident-on-2-22-22/)). [Slack](https://slack.engineering/slacks-incident-on-2-22-22/)
- **Slack, 4 January 2021** — Provision-service overload during autoscaling cascaded into a multi-hour outage; Kafka and dashboarding subsystems collateral damage ([Slack engineering](https://slack.engineering/slacks-outage-on-january-4th-2021/)). [Slack](https://slack.engineering/slacks-outage-on-january-4th-2021/)
- **Robinhood, January 2021** — During GameStop short squeeze, Robinhood's collateral and trading platform nearly collapsed; not a Kafka root cause, but they have publicly discussed Kafka-based pipelines straining at peak. [TechCrunch](https://techcrunch.com/2022/06/27/robinhood-report-meme-stock-gamestop/)
- **Heroku, June 2025** — Same systemd-on-Ubuntu pattern as Datadog 2023 ([Pragmatic Engineer](https://x.com/Pragmatic_Eng/status/1947769489937887510)). [X](https://x.com/Pragmatic_Eng/status/1947769489937887510)
- **Rebalance storms** — Pre-KIP-848, large consumer groups in Kubernetes were prone to flapping rebalances during rolling deploys; a major motivator of KIP-848 ([Confluent debug blog](https://www.confluent.io/blog/debug-apache-kafka-pt-3/), [Michal Drozd](https://www.michal-drozd.com/en/blog/kafka-consumer-rebalance-storm/)).

**Common pitfalls**

- Under-replicated partitions (URP) staying nonzero — usually disk or network saturation.
- `unclean.leader.election.enable=true` quietly losing data on power loss.
- `max.in.flight.requests.per.connection > 1` + `retries > 0` without idempotence ⇒ reordering — fixed by `enable.idempotence=true` (default since 3.0).
- Schema Registry **incompatible** schema evolution breaking downstream consumers.
- Mis-set `retention.ms` deleting unread data (silent loss).
- Compacted topics where tombstones never age out → bloated logs.
- Oversized `fetch.max.bytes` on consumer + slow processing → OOM.
- Increasing partitions forces re-keying for keyed semantics.

## Fun facts and anecdotes

- The name: **Kreps liked Franz Kafka** and wanted a name that fit "a system optimized for *writing*" — a pun. Kafka's logo motif riffs on this ([Wikipedia](https://en.wikipedia.org/wiki/Apache_Kafka)). [Wikipedia](https://en.wikipedia.org/wiki/Apache_Kafka)
- **The Log: What every software engineer should know about real-time data's unifying abstraction** (Jay Kreps, December 2013) is the closest thing the field has to a manifesto and is one reason Kafka changed how engineers think about state ([LinkedIn engineering](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)). [hariswb](https://hariswb.com/posts/summary-of-the-log/)
- The **0.7 → 0.8 rewrite** was painful precisely because 0.7 had no replication; people lost data and Kafka almost didn't recover its reputation. 0.8 added the ISR model and earned the project its current trust.
- The **v2 record batch format (KIP-98)** wasn't just "add fields" — it eliminated the recursive nested-message-for-compression hack of v1, made compression operate at batch granularity, and made idempotence/transactions possible at all.
- **"Dumb broker, smart consumer"** was a deliberate rejection of the JMS/RabbitMQ model — the broker tracks no per-consumer state on each message, only per-group offsets in `__consumer_offsets`. This is why Kafka scales to millions of consumers on a single topic.
- **Neha Narkhede** founded fraud-detection startup **Oscilar** in 2021 after Confluent and is now its CEO ([Wikipedia / Narkhede](https://en.wikipedia.org/wiki/Neha_Narkhede)). **Jay Kreps** has been Confluent CEO since founding and stayed on through the IBM deal. **Jun Rao** continues as a Confluent technical leader and Kafka committer. [Wikipedia](https://en.wikipedia.org/wiki/Neha_Narkhede)[Tracxn](https://tracxn.com/d/companies/confluent/__-MscAmnKAk9Sgax_b_fDjJcgW3xPc0DkslokE_ec5bs)
- **KIP culture**: Every change goes through a Kafka Improvement Proposal vote on `dev@kafka.apache.org`. Standout KIPs: **KIP-500** (kill ZooKeeper), **KIP-848** (consumer protocol), **KIP-932** (queues), **KIP-405** (tiered storage), **KIP-1150** (diskless). KIP-1150 was approved 2 March 2026 with 9 binding +1s ([Aiven](https://aiven.io/blog/kip-1150-accepted-and-the-road-ahead)). [WarpStream](https://www.warpstream.com/ai-info)
- The "Apache Kafka and the Next 700 Stream Processing Systems" talk title (Kreps) is a Strachey homage.
- The fact that Kafka's serialization is **not** Protobuf or Thrift was a deliberate choice; the protocol guide explicitly calls those packages out as overkill for "only a few messages" ([kafka.apache.org/protocol](https://kafka.apache.org/protocol)).
- Kafka has a data structure literally called the **"request purgatory"** — for delayed requests waiting on a condition. [Vintage is the New Old](https://www.vintageisthenewold.com/faq/why-is-kafka-named-kafka)

## Practical wisdom

**Producer tuning**

- `acks=all` + `enable.idempotence=true` (default 3.0+) is the safe baseline.
- `linger.ms=5–20`, `batch.size=64KB–256KB`, `compression.type=zstd` for best throughput-per-byte.
- `max.in.flight.requests.per.connection` ≤ 5 with idempotence on.
- `transactional.id` must be **stable across producer restarts** to fence zombies.

**Consumer tuning**

- KIP-848 (`group.protocol=consumer`) for any group >10 members or any deploy-heavy workload.
- `max.poll.records`, `max.poll.interval.ms` tuned to your slowest record processing.
- `fetch.min.bytes`, `fetch.max.wait.ms` for batching efficiency.
- `session.timeout.ms` ≥ 3× `heartbeat.interval.ms`.
- `isolation.level=read_committed` for transactional consumers.

**Broker tuning**

- `min.insync.replicas=2` with RF=3 and `acks=all`.
- `unclean.leader.election.enable=false` — full stop.
- `log.retention.ms` vs `log.retention.bytes` — both apply; whichever hits first wins.
- `segment.bytes` ~1GB typical; smaller for compacted topics.
- Reserve heap ~6 GB; the rest of RAM goes to **page cache** (Kafka's secret weapon).

**Defaults to be skeptical of (history)**

- `acks=1` was the default before idempotence and is still the default in older clients.
- `auto.offset.reset=latest` silently skips backlog.
- Pre-3.0: idempotence off; post-3.0: on.
- Pre-2.0: hostname verification off; post-2.0: on.

**Monitoring (broker JMX)**

- `UnderReplicatedPartitions` (URP) — must be 0 in steady state.
- `OfflinePartitionsCount` — must be 0.
- `ActiveControllerCount` — exactly 1 cluster-wide.
- `RequestHandlerAvgIdlePercent`, `NetworkProcessorAvgIdlePercent` — keep ≥ 0.3.
- `IsrShrinksPerSec`/`IsrExpandsPerSec` — flapping = trouble.
- `LogFlushRateAndTimeMs`, JVM GC time, page-cache hit, disk usage.
- Consumer-side: `records-lag-max`, rebalance rate.

**Debugging tools**

- `kafka-consumer-groups.sh --describe --group <g>` — lag and member state.
- `kafka-dump-log.sh` — inspect on-disk segments, find tombstones, investigate corruption.
- `kafka-leader-election.sh`, `kafka-reassign-partitions.sh`.
- `kcat` (formerly kafkacat) — Swiss-army CLI.
- Wireshark with the Kafka dissector (works to ~Kafka 3.7 in 4.5+) ([Ivan Yurchenko](https://ivanyu.me/blog/2024/09/08/kafka-protocol-practical-guide/)).

## Learning resources (current as of May 2026)

**Authoritative specs**

- [kafka.apache.org/40/protocol.html](https://kafka.apache.org/40/protocol.html) — Kafka 4.0 wire-protocol reference (advanced, 2025).
- [kafka.apache.org/42/design/protocol/](https://kafka.apache.org/42/design/protocol/) — 4.2 protocol page (advanced, 2025–2026).
- [Kafka source `clients/src/main/resources/common/message/`](https://github.com/apache/kafka/tree/trunk/clients/src/main/resources/common/message) — JSON message specs, ground truth (advanced, current).
- [KIP wiki](https://cwiki.apache.org/confluence/display/KAFKA/Kafka+Improvement+Proposals) — process and KIPs (intermediate, current).

**Books**

- *Kafka: The Definitive Guide, 2nd ed.* — Shapira, Palino, Sivaram, Petty, Gustafson (O'Reilly, 2021/2022) — intermediate. Chapter 8 (Exactly-Once Semantics) is the gold standard intro to KIP-98.
- *Designing Event-Driven Systems* — Ben Stopford (O'Reilly, 2018) — architecture (intermediate).
- *Mastering Kafka Streams and ksqlDB* — Mitch Seymour (O'Reilly, 2020) — advanced.
- *Kafka in Action* — Dylan Scott (Manning, 2022) — intro/intermediate.

**Papers**

- Kreps, Narkhede, Rao, *Kafka: A Distributed Messaging System for Log Processing*, NetDB '11 ([PDF](https://notes.stephenholiday.com/Kafka.pdf)). [Apache](https://cwiki.apache.org/confluence/display/KAFKA/Kafka+papers+and+presentations)
- Goodhope et al., *Building LinkedIn's Real-time Activity Data Pipeline*, IEEE Data Eng. Bull. 35(2), 2012 ([PDF](http://sites.computer.org/debull/A12june/pipeline.pdf)). [Springer](https://link.springer.com/referenceworkentry/10.1007/978-3-319-63962-8_196-2)
- Wang et al., *Building a Replicated Logging System with Apache Kafka*, PVLDB 8(12), 2015. [Apache Kafka](https://kafka.apache.org/community/books_and_papers/)
- Kleppmann & Kreps, *Kafka, Samza and the Unix Philosophy of Distributed Data*, IEEE Data Eng. Bull., 2015 ([PDF](https://martin.kleppmann.com/papers/kafka-debull15.pdf)). [Apache Kafka](https://kafka.apache.org/community/books_and_papers/)

**Long-form blogs (2024–2026)**

- Jay Kreps, *The Log* (2013) ([LinkedIn engineering](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)).
- *KIP-848 deep dive*, Confluent (2025) ([link](https://www.confluent.io/blog/kip-848-consumer-rebalance-protocol/)).
- *Kafka 3.9 / 4.0 / 4.1 release blogs*, Confluent (2024–2025).
- *Kafka tiered storage deep dive*, Red Hat Developer (2024) ([link](https://developers.redhat.com/articles/2024/03/13/kafka-tiered-storage-deep-dive)).
- *KRaft deep dive*, Red Hat Developer, Sep 2025 ([link](https://developers.redhat.com/articles/2025/09/17/deep-dive-apache-kafkas-kraft-protocol)).
- *Diskless Kafka / KIP-1150*, Aiven (2025–2026) ([link](https://aiven.io/blog/guide-diskless-apache-kafka-kip-1150)).
- LinkedIn Engineering, *How LinkedIn customizes Kafka for 7 trillion messages/day* ([link](https://www.linkedin.com/blog/engineering/open-source/apache-kafka-trillion-messages)).
- 2 Minute Streaming (Stanislav Kozlovski) — pithy, current Kafka explainers ([blog.2minutestreaming.com](https://blog.2minutestreaming.com/)).
- Ivan Yurchenko, *Kafka protocol practical guide*, Sep 2024 ([link](https://ivanyu.me/blog/2024/09/08/kafka-protocol-practical-guide/)).
- Jack Vanlightly's distributed-systems blog (replication and consensus) ([jack-vanlightly.com](https://jack-vanlightly.com/)).

**Video / podcasts**

- *Apache Kafka 101*, Tim Berglund, Confluent Developer YouTube — intro, current.
- Kafka Summit & Current 2024/2025 talks — Current 2025 (Bengaluru, London, Austin) sessions on KIP-848, KIP-932, Tableflow.
- Confluent's *Streaming Audio* podcast (now hosted by Kris Jenkins after Tim Berglund's transition) — KIP-848 GA episode (2025).
- *Get Kafka-Nated* podcast — 2025 finale episode on Confluent acquisition.

**University courses**

- MIT 6.5840 (formerly 6.824) Distributed Systems — Raft labs are directly applicable to KRaft.
- CMU 15-445 Database Systems — useful for log/storage internals.
- Berkeley CS 162 — OS fundamentals (page cache, sendfile).

**Tools**

- `kcat` (kcat.org) — CLI client.
- **AKHQ**, **Kafka UI** (Provectus), **Conduktor**, **Offset Explorer / Kafka Tool**, **kpow**, **Confluent Control Center**, **Strimzi** (Kubernetes), **Confluent Cloud Console**.
- Kafka REST Proxy (Confluent), Bufstream demo project.

## Where things are heading (2025–2026 frontier)

**Deprecated / removed**

- ZooKeeper — gone in 4.0.
- MirrorMaker 1 — removed in 4.0. [OpenLogic](https://www.openlogic.com/blog/upgrade-kafka-4-planning)
- v0/v1 message formats — long gone.
- Classic eager rebalance protocol — being phased out by KIP-848.
- Log4j 1.x — fully out by 4.0.
- Snappy compression — deprecated for new uses (no compression-level support). [Medium](https://medium.com/pharos-production/whats-new-in-kafka-3-8-5d1c9f01dc51)

**Active frontier**

- **KIP-1150 Diskless Topics** — accepted March 2026; per-topic flag pushes data straight to S3/GCS/Azure Blob, leaderless writes; companion KIPs 1163 (Core), 1164 (Batch Coordinator), 1165 (Compaction). Aiven's Inkless prototype is the reference implementation. [X](https://x.com/BdKozlovski/status/1912504414528552984)
- **KIP-932 Queues / Share groups** — early access in 4.0, preview in 4.1, **GA in 4.2**. Brings queue-style semantics to Kafka via durable shared subscriptions; partition count no longer caps consumer count. [Apache](https://cwiki.apache.org/confluence/display/KAFKA/Queues+for+Kafka+(KIP-932)+-+Preview+Release+Notes)[Gunnar Morling](https://www.morling.dev/blog/kip-932-queues-for-kafka/)
- **KIP-848** — GA in 4.0; future extensions include client-side custom assignors over the new protocol; KIP-1071 brings the same model to Kafka Streams. [Confluent](https://www.confluent.io/blog/introducing-apache-kafka-4-1/)
- **KIP-966 Eligible Leader Replicas** — preview in 4.0, prevents data loss on unclean leader election. [Confluent](https://www.confluent.io/blog/latest-apache-kafka-release/)
- **KIP-996 Pre-Vote** — reduces spurious KRaft elections. [Confluent](https://www.confluent.io/blog/latest-apache-kafka-release/)
- **KIP-853 Dynamic KRaft Voters** — production in 3.9.
- **KIP-858 KRaft JBOD** — production in 3.8.
- **KIP-890 Transactions Server-Side Defense** — strengthened transactional protocol shipped with 4.0. [Apache Kafka](https://kafka.apache.org/40/getting-started/upgrade/)
- **Tableflow** (Confluent) and **Apache Iceberg streaming writes** — turning Kafka into both transactional and analytical bedrock.
- **KIP-1008 ParKa (Parquet+Kafka)**, **KIP-1134 Virtual Clusters**, **KIP-1183 Unified Shared Storage** (AutoMQ) — under discussion.
- **AI / agentic streaming** — Confluent Intelligence (2025) and Tableflow→Databricks Unity / Snowflake Open Catalog integrations target real-time inference on event streams.

**Standards process** — Kafka is **not** an IETF protocol. The equivalent of an RFC working group is the **KIP** mailing-list process (`dev@kafka.apache.org`) governed by the Apache Kafka PMC. Each KIP requires a discussion thread, a vote with at least 3 binding +1s and no -1s, and merges through committers. The PMC is currently chaired by Mickael Maison (Red Hat), with David Jacot (Confluent) and Jun Rao among the most active committers in 2024–2026 ([Apache Kafka 3.9 release blog](https://www.confluent.io/blog/introducing-apache-kafka-3-9/), [Kafka 4.1 release blog](https://www.confluent.io/blog/introducing-apache-kafka-4-1/)).

## Hooks for the article, infographic, and podcast

**60-second narrated hook (for the ear)**

> "Every credit-card swipe at a Fortune 500, every Uber ride dispatched, every Netflix recommendation: there's a one-in-three chance it passed through the same piece of software. It's called Apache Kafka, and a kid named Jay Kreps named it after Franz Kafka because — and this is a real quote — 'it's a system optimized for writing.' In 2025, fifteen years after a small team at LinkedIn built it to fix a tangle of broken data pipelines, Kafka finally cut its umbilical cord to ZooKeeper, sped up consumer rebalances by twenty times, and learned how to act like a queue. And in March 2026, IBM bought the company that commercializes it for eleven billion dollars. The plumbing of the internet just got a new landlord."

**A striking statistic**

> LinkedIn alone moves more than **7 trillion messages per day** through Kafka, on a system originally written by a team of three. ([LinkedIn Engineering blog](https://www.linkedin.com/blog/engineering/open-source/apache-kafka-trillion-messages)) [ByteByteGo](https://blog.bytebytego.com/p/how-linkedin-customizes-its-7-trillion)

**A "pause and think" moment**

> Until November 2024, Kafka still shipped with `unclean.leader.election.enable=true` defaulting to *false* but `enable.idempotence` only flipped to *true* by default in **2021** (Kafka 3.0) — meaning every "exactly-once" production system from 2017 to 2021 was, by default, neither idempotent nor in-order under retries. Most teams never knew. ([KIP-185](https://cwiki.apache.org/confluence/display/KAFKA/KIP-185%3A+Make+exactly+once+in+order+delivery+per+partition+the+default+Producer+setting))

**A failure-story arc — Datadog, March 2023**

> *Setup.* Datadog runs Kubernetes clusters across AWS, GCP, and Azure, all on Ubuntu 22.04. Each region is independent by design — they do canary rollouts one at a time. *Mistake.* On the morning of March 7 2023, Ubuntu shipped a routine systemd CVE patch. Unattended-upgrades was on. *Consequence.* At 06:00 UTC on March 8, the patched systemd daemon restarted `systemd-networkd` on every node — and `systemd-networkd` v249 silently flushes the IP routing rules that the Cilium CNI had installed. Tens of thousands of nodes lost networking simultaneously across **all five regions**. Kafka, ZooKeeper, the metadata stores, the dashboards — all dark for 24 hours. *Resolution.* Datadog disabled unattended-upgrades, hard-rebooted nodes, rebuilt the Cilium routing tables from scratch, and committed to multi-region drills. Two years later, in June 2025, Heroku had near-identical symptoms from the same patch class. The lesson: a Kafka-shaped outage is rarely a Kafka outage; it's the network underneath. ([Datadog post-mortem](https://www.datadoghq.com/blog/2023-03-08-multiregion-infrastructure-connectivity-issue/), [Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/inside-the-datadog-outage)) [Datadog](https://www.datadoghq.com/blog/engineering/2023-03-08-deep-dive-into-platform-level-impact/)[X](https://x.com/Pragmatic_Eng/status/1947769489937887510)

---

*Notes on epistemic confidence:* Version dates and KIP statuses verified against Apache Kafka's blog and CVE list. The "7 trillion messages/day" figure for LinkedIn is from 2019 and remains the most recent public number, treat it as a floor. The IBM–Confluent close date (17 March 2026) is taken from IBM's own newsroom; the layoff figures circulating after it are unverified. KIP-1150 status reflects acceptance of the umbrella KIP, not a shipping diskless implementation in mainline Kafka — that work is ongoing through sub-KIPs.