---
id: async-iot/kafka
type: chapter
part_id: async-iot
part_label: VII
part_title: Async / IoT
title: Kafka
synopsis: A distributed commit log as architecture unit — LinkedIn, 2010, named after Franz Kafka because "it's a system optimized for writing."
podcast_target_minutes: 15
position_in_book: chapter 48 of 75
listening_order:
  prev: async-iot/amqp
  next: async-iot/coap
related_protocols: [kafka, amqp, rest, ip]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A partitioned log timeline: producers appending records on the right, three consumer groups reading at independent offsets along the same partition, with retention measured in days rather than messages."
  - "Side-by-side timeline of Kafka platform shifts — KIP-500 in 2019, Tiered Storage GA in November 2024, Kafka 4.0 dropping ZooKeeper in March 2025, KIP-1150 Diskless accepted in March 2026."
  - "Bar chart contrasting rebalance time at 10 consumers and 900 partitions — 103 seconds with the classic protocol versus 5 seconds with KIP-848."
  - "Acquisition cascade: Confluent buys WarpStream in September 2024, IBM buys Confluent for $11B at $31/share in December 2025, deal closes March 2026, with Apache Kafka itself sitting outside the deal at the ASF."
  - "LinkedIn at scale: 100+ clusters, 4,000+ brokers, ~7M partitions, >7 trillion messages per day — laid out as a single nested-square infographic."
---

# Part VII, Chapter — Kafka

## The hook

Jay Kreps named Kafka after Franz Kafka because "it's a system optimized for writing" and he liked the writer. Fifteen years later LinkedIn runs more than seven trillion messages a day across over four thousand brokers and roughly seven million partitions. This is the chapter on how a distributed commit log became an architecture unit.

## The story

### The Log Is the Database

Apache Kafka was built at LinkedIn around 2010 by Jay Kreps, Neha Narkhede, and Jun Rao. It was open-sourced in 2011 and graduated from the Apache Incubator on 23 October 2012. The name came from Kreps on Quora: "it's a system optimized for writing," and he liked the writer.

The architectural insight, and the one that the chapter centres on, was articulated by Jay Kreps in his essay "The Log: What every software engineer should know about real-time data's unifying abstraction." The claim is that a distributed, append-only log is the right primitive for asynchronous communication at scale. Not a queue. Not a bus. A log.

A Kafka topic is a partitioned log. Producers append records. Consumers read at their own pace and track their position by offset. The log is persistent — records are not deleted when consumed; they age out by retention policy, often days or weeks. That single design choice unlocks event sourcing, stream processing, replay, and multiple independent consumer groups reading the same log for different purposes. The same firehose feeds the search index, the recommendation pipeline, and the audit trail without any of them knowing the others exist.

The wire-level mechanics — API keys, request and response framing, the binary versioning scheme that lets a 4.x client talk to a 3.x broker — belong in the Kafka episode, where they get the airtime they deserve.

### Kafka 4.0 — The End of ZooKeeper

Kafka 4.0 shipped on 18 March 2025, and it removed ZooKeeper entirely. That was the end of a ten-year migration that began with KIP-500 in 2019. KRaft — the Kafka Raft metadata protocol — is now the only metadata mode. The same release made KIP-848, the new consumer rebalance protocol, generally available.

KIP-848 cuts rebalance times by an order of magnitude. The chapter cites the canonical benchmark: ten consumers and nine hundred partitions take five seconds with KIP-848 versus one hundred and three seconds with the classic protocol. For any workload where consumer churn was a tax on throughput — and that was a lot of them — this is a different operational regime.

Kafka 3.9 had landed earlier, on 6 November 2024, and made Tiered Storage generally available through KIP-405. Brokers can now offload old log segments to S3 while keeping recent data on local disk. Kafka 4.1 followed on 4 September 2025 and promoted KIP-932, Queues for Kafka — share groups with per-record acknowledgement and AMQP-like semantics — to preview, with general availability targeted for 4.2. Two decades after AMQP, Kafka is finally adding the per-message acknowledgement model. The AMQP episode is the previous chapter; the contrast is exactly what motivated this work.

LinkedIn runs the largest publicly disclosed deployment. From their 2019 engineering blog: more than one hundred clusters, more than four thousand brokers, roughly seven million partitions, and more than seven trillion messages a day. That number is a floor. It has never been updated downward.

### Diskless Topics — KIP-1150

A callout in the chapter flags what may be the next platform shift. KIP-1150, Diskless Topics, was accepted by the Apache Kafka community on 2 March 2026 with nine binding votes. It is the formal blessing of the architecture pioneered by WarpStream, AutoMQ, Aiven Inkless, and Bufstream — using S3 as primary storage, with brokers acting as stateless cache servers. The log lives in object storage. Cost can drop ten to twenty times for high-retention workloads. The five-year implications for the broker market are still being argued in public.

### Confluent Was Acquired by IBM

The corporate landscape moved at the same time as the protocol. Confluent acquired WarpStream on 9 September 2024. IBM agreed to acquire Confluent for eleven billion dollars at thirty-one dollars a share on 8 December 2025, and the deal closed on 17 March 2026. Apache Kafka itself remains independent at the Apache Software Foundation — that is the line the community has held throughout.

A few wire-level details that matter operationally, and that this chapter touches in passing rather than explains. Kafka's reference congestion and storage stack uses CRC32C — Castagnoli — for batch integrity. Compression options are gzip, snappy, lz4, and zstd. Fetches use the `sendfile(2)` zero-copy path straight out of the page cache. That stack is where Kafka's raw throughput edge over AMQP and RabbitMQ comes from. The mechanism is the Kafka episode; the comparison is the AMQP episode.

The 2024 and 2025 CVE wave is also worth naming. CVE-2024-56128 was the SCRAM authentication bug — the server-nonce check was being skipped — fixed in 3.7.2, 3.8.1, and 3.9.0. CVE-2025-27817 was a SASL OAUTHBEARER arbitrary file read and SSRF, fixed in 3.9.1 and 4.0.0. And the older CVE-2023-25194 — a JndiLoginModule remote code execution in the Kafka Connect REST API — was the field's Log4Shell moment. The REST episode covers the API style that Connect exposes; the protocol details of these CVEs sit in the Kafka episode.

The Datadog outage of 8 March 2023 belongs in this chapter as the canonical messaging-tier ripple-effect post-mortem of the period. It ran roughly twenty-four hours, multi-region, and was triggered when an Ubuntu 22.04 systemd-networkd update deleted Cilium-managed IP routes on the Kubernetes nodes hosting Datadog's Kafka and ZooKeeper pipeline. The packet-level mechanics of how IP routing actually works underneath all of this is the IP episode. The full post-mortem belongs in the Famous Outages part of the book.

## What you'd see in the simulator

The Event Streaming simulator follows a producer connecting to a Kafka broker, discovering topic metadata, and publishing an event. You press play and the producer opens a TCP connection to a broker. The first request asks for metadata: which broker is the leader for which partition of the topic you want to write to. The broker replies with the partition layout. The producer then sends a produce request to the partition leader, carrying a batch of records framed by an API key and a version number — that versioning is what lets a new client talk to an older broker, and the other way round. The broker appends the batch to the log, replicates it, and replies with the assigned offset. The exchange is binary, batched, and designed so the disk write is sequential and the network read is zero-copy. The full mechanism — every API key, the exact framing, the replication protocol — is the Kafka episode.

## What it taught the industry

Kafka taught the industry to treat the log itself as the architecture. The lesson from Jay Kreps's essay, fifteen years on, is that a durable, partitioned, replayable log lets independent systems share state without coupling to each other. Search, recommendations, billing, and audit can each consume the same stream at their own pace, and a new consumer can be bolted on tomorrow by reading from offset zero. That is a different shape of system from a queue, and it changed how a generation of backend teams designs.

It also taught the industry that ZooKeeper-style external coordinators are a tax that can eventually be paid off — KRaft, ten years in the making, finally proved that. And it taught the industry that the storage layer of a streaming system is not fixed: tiered storage in 3.9 and diskless topics in KIP-1150 have moved the centre of gravity from local SSD to object storage, and the cost curves have moved with it.

## Listening order

- **Before this chapter:** "AMQP" — sets up the queue-and-routing model that Kafka deliberately did not build, so the contrast with the append-only log lands cleanly.
- **After this chapter:** "CoAP" — pivots from the datacenter messaging tier to the constrained-device side of asynchronous communication.

## Where to go deeper

- The Kafka episode picks up the protocol mechanism in detail — API keys, request and response framing, KRaft metadata, KIP-848 rebalance, the binary versioning scheme.
- The AMQP episode covers the exchange, queue, and per-message acknowledgement model that Kafka spent a decade not having and is now adding through share groups.
- The REST episode covers the architectural style that Kafka Connect's management API exposes — the same API surface where the JndiLoginModule CVE landed.
- The IP episode covers the packet-level routing that the Datadog outage tripped over when systemd-networkd deleted the Cilium-managed routes.
