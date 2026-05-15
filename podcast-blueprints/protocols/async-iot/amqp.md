---
id: amqp
type: protocol
name: Advanced Message Queuing Protocol
abbreviation: AMQP
etymology: "[A]dvanced [M]essage [Q]ueuing [P]rotocol"
category: async-iot
year: 2006
rfc: null
standards_body: oasis
podcast_target_minutes: 22
related_book_chapters:
  - foundations/client-server-p2p
  - async-iot/amqp
  - async-iot/kafka
related_protocols: [tcp, tls, websockets, mqtt, stomp, kafka]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Pieter_Hintjens_at_EuroPython2014_%28cropped%29.jpg/500px-Pieter_Hintjens_at_EuroPython2014_%28cropped%29.jpg
    caption: Pieter Hintjens, CEO of iMatix and a key contributor to early AMQP, speaking at EuroPython 2014. He later left the working group and built ZeroMQ instead.
    credit: Photo — EuroPython / CC BY 2.0, via Wikimedia Commons
visual_cues:
  - "A side-by-side of the two AMQP frame formats. Left: AMQP 0-9-1, with a labelled 1-byte type, 2-byte channel, 4-byte size, payload, and the literal sentinel byte 0xCE highlighted in red at the end. Right: AMQP 1.0, with an 8-byte header (SIZE, DOFF, TYPE, CHANNEL), extended header, and performative payload — no sentinel."
  - "An illustration of the four AMQP 0-9-1 exchange types. A producer sends one message; arrows fan out to bound queues. Direct (one queue, exact key match), Topic (two queues, wildcard pattern orders.*.eu), Fanout (every queue, key ignored), Headers (matched by a properties map)."
  - "A timeline of AMQP releases. 2003 origin at JPMorgan, 2006 first deployment, 2008 0-9-1 frozen, 2010 Hintjens walks out, October 2011 1.0 released, October 2012 OASIS standard, April 2014 ISO/IEC 19464, September 2024 RabbitMQ 4.0 native AMQP 1.0, April 2026 RabbitMQ 4.3 with Mnesia removed."
  - "A diagram contrasting AMQP, MQTT, and Kafka delivery models. AMQP shows a producer hitting a topic exchange that fans into two named queues drained by competing consumers. MQTT shows a single broker holding topics with subscribers attached directly. Kafka shows an append-only partitioned log read independently by two consumer groups at different offsets."
  - "A schematic of a RabbitMQ 4.x cluster on three nodes. A quorum queue replicated by the Ra Raft library, a stream replicated by the same Raft, and Khepri holding metadata also via Raft — captioned 'one consensus library, three replicated primitives.'"
  - "A close-up of a single AMQP 0-9-1 frame on the wire, byte-by-byte, with the 0xCE sentinel boxed and labelled 'tripwire — not a checksum.'"
---

# AMQP — Advanced Message Queuing Protocol

## In one breath

AMQP is the wire-level protocol behind enterprise message queuing. A producer connects to a broker over TCP, declares an exchange and a queue, publishes a message with a routing key, and the broker delivers it to one or more consumers with explicit acknowledgments. RabbitMQ is the reference implementation; Microsoft Azure Service Bus is the largest cloud deployment by volume. If your code touches order processing, financial messages, microservice command queues, or background jobs, there is a reasonable chance the bytes on the wire are AMQP.

## The pitch (cold-open)

In 2006, the first production AMQP broker — written in C by iMatix, deployed at JPMorgan — moved 300 million messages a day for 2,000 traders. Twenty years on, AMQP is a bit of a Russian doll. The name covers two completely different protocols: AMQP 0-9-1, frozen in 2008, with exchanges and queues baked into the spec; and AMQP 1.0, an OASIS standard since 2012 and an ISO standard since 2014, which is so different it has no queues in it at all. RabbitMQ shipped 4.0 in September 2024 and finally crossed over to native AMQP 1.0. This is the episode about how the bytes actually move, where it runs at scale, and what to debug when the broker goes red. The chapter episode on AMQP carries the human story.

## How it actually works

AMQP rides on a single TCP connection — port 5672 plain, port 5671 with TLS. Inside that one socket, the protocol multiplexes lightweight numbered streams called channels, so a process with hundreds of producer or consumer threads does not need hundreds of sockets. Everything else — declaring topology, publishing, consuming, acknowledging — is methods sent on a channel.

The 0-9-1 wire model and the 1.0 wire model are different protocols. We will walk both.

In 0-9-1, the simulator's reference handshake goes like this. The client opens TCP to port 5672 and sends the literal eight bytes `A`, `M`, `Q`, `P`, `0`, `0`, `9`, `1`. If the broker speaks that version, it replies with `Connection.Start` — listing supported SASL mechanisms (PLAIN and AMQPLAIN are the common ones), locales like `en_US`, and server properties. The client answers with `Connection.Start-Ok` carrying credentials. The broker then sends `Connection.Tune` proposing limits — channel max 2,047, frame max 131,072 bytes, heartbeat 60 seconds. Both sides agree, the client opens the virtual host with `Connection.Open`, and the connection is live.

Now the producer opens a channel with `Channel.Open`. It declares an exchange — say `orders` of type `topic`, marked durable so it survives broker restart. It declares a queue, also durable. It binds the queue to the exchange with a routing key pattern like `orders.*.eu`. Then it publishes. A `Basic.Publish` is actually three frames in sequence on the same channel: the method frame naming the exchange and routing key, a content header frame carrying properties (content type, delivery mode, message id, timestamp), and one or more body frames carrying the bytes. With delivery mode 2 — persistent — the broker writes the message to disk before acknowledging. On the consumer side, `Basic.Consume` registers interest in a queue; the broker pushes `Basic.Deliver` plus header plus body for each message; the consumer replies with `Basic.Ack` carrying the delivery tag. Until that ack arrives, the broker holds the message; if the consumer dies, the message is redelivered.

AMQP 1.0 is a different protocol. There is no exchange in the spec, no queue in the spec, and the protocol is symmetric — there is no wire-level distinction between client and broker. The abstractions are nested: a connection contains sessions, a session contains links, a link is a one-way pipe between two opaque endpoints called termini. The handshake stacks three sub-protocols. The client sends `AMQP 3 1 0 0` to ask for SASL, exchanges SASL frames to authenticate, then sends `AMQP 0 1 0 0` to switch to AMQP proper. After that come nine performatives — `open`, `begin`, `attach`, `flow`, `transfer`, `disposition`, `detach`, `end`, `close` — that drive everything. A receiver hands the sender link credit with `flow`; the sender uses that credit by sending `transfer` frames; the receiver confirms terminal state — `accepted`, `rejected`, `released`, `modified` — with `disposition`.

### Header at a glance

AMQP 0-9-1 frames are 1 byte of type, 2 bytes of channel number, 4 bytes of payload size, the payload, and a single closing byte that must be `0xCE`. Frame types are 1 for method, 2 for content header, 3 for body, and 8 for heartbeat (the spec also lists 4, which the RabbitMQ team's errata flags as an inconsistency).

AMQP 1.0 frames begin with an 8-byte header: a 4-byte size, a 1-byte data offset (in 4-byte units, so the extended header can grow), a 1-byte type (0 for AMQP, 1 for SASL), and a 2-byte channel. The frame body is one performative encoded as a described list, optionally followed by an opaque payload. There is no sentinel — the size field is authoritative. Quietly removing `0xCE` is one of the cleanest signals that 1.0 trusts its transport.

### State machine in three sentences

AMQP 0-9-1 has two layers of error scope rather than a classical state machine. A channel exception — for example, publishing to an exchange that doesn't exist (reply code 404) — closes that channel only, and the connection survives. A connection exception — a frame error (501) or syntax error (502) — kills the whole TCP connection and you start over. AMQP 1.0 cleans this up by giving every layer a symmetric open and close: `attach`/`detach` for links, `begin`/`end` for sessions, `open`/`close` for connections, with explicit error performatives.

### Reliability, flow control, and security

Reliability in AMQP is end-to-end and explicit. On the consumer side, you choose between automatic acknowledgment, where the broker drops the message the instant it sends it, and explicit acknowledgment, where the message stays in an unacked state until the consumer sends `basic.ack`, `basic.nack`, or `basic.reject`. On the publisher side, RabbitMQ adds a publisher-confirms extension — after `confirm.select`, the broker sends a per-message ack telling you the message was accepted (and persisted, if the queue is durable). Transactions exist (`tx.select`, `tx.commit`, `tx.rollback`) but are roughly a hundred times slower than publisher confirms, and they are non-atomic across multiple queues. Almost no production system uses them.

Flow control in 0-9-1 is `basic.qos`: the consumer sets a prefetch count, and the broker will not push more than that many unacked messages at a time. In 1.0 the model is link credit — the receiver hands the sender a number with `flow`, and the sender may transfer that many messages and then wait for more credit. Same idea, cleaner abstraction.

Security is layered. TLS wraps the connection in two ways: implicit on port 5671, where TLS is negotiated before the AMQP handshake, or in-protocol on 5672, where the server can offer a mandatory upgrade using the AMQP-prescribed model with protocol id 2. SASL handles authentication. PLAIN sends `\0username\0password` and is safe only inside TLS. EXTERNAL pulls identity from the TLS certificate. AMQP 1.0 explicitly carries SASL frames as a sub-protocol; 0-9-1 piggybacks on `Connection.Start`. Heartbeats — empty frames sent at the negotiated interval, default 60 seconds — kill connections that have silently died behind NATs and firewalls.

## Where it shows up in production

JPMorgan Chase is the origin user. The first mission-critical AMQP deployment, in mid-2006, served 2,000 traders and processed 300 million messages a day. John O'Hara documented it in his 2007 ACM Queue paper. Goldman Sachs, Bank of America, Barclays, Credit Suisse, and Deutsche Börse all sat on the original working group and run RabbitMQ or one of its peers in their trading and back-office stacks.

Microsoft Azure Service Bus uses AMQP 1.0 as its primary protocol. Microsoft also defined an AMQP-over-WebSocket binding that tunnels through TCP port 443 and is, in their words, equivalent to an AMQP 5671 connection — the way you escape a corporate firewall that only lets HTTPS out. By cloud message volume, Service Bus is almost certainly the largest AMQP deployment in the world.

RabbitMQ is the broker most engineers actually touch. Instagram used it through Celery to fan out feed updates. Reddit, the New York Times, Trivago, and 500px have all run RabbitMQ in production. MapQuest uses topic exchanges to broadcast updates to tens of millions of users. The European Space Agency, Mozilla, and AT&T are widely cited users. Apache Qpid (Java and C++ brokers, plus the Proton AMQP 1.0 toolkit), Apache ActiveMQ Artemis, IBM MQ (which exposes AMQP 1.0 channels alongside its proprietary protocol), Solace PubSub+, and the newer LavinMQ broker round out the ecosystem.

For raw numbers: in 2014 a 30-node RabbitMQ cluster on Google Compute Engine sustained more than one million messages per second received and one million delivered, for over two million messages per second aggregate — about 86 billion messages per day. The RabbitMQ team's August 2024 benchmarks on a single Intel NUC measured 99,413 messages per second for native AMQP 1.0 against classic queues, and 88,534 for AMQP 0-9-1. The DanubeData April 2026 benchmark reached 120,000 plus messages per second on managed infrastructure with publisher confirms on. Quorum queues, the Raft-replicated successor to mirrored queues, sustain about 30,000 one-kilobyte messages per second while replicating to all three nodes — three times the throughput of mirrored queues.

## Things that go wrong

The defining failure class is mirrored-queue split-brain. Until RabbitMQ 4.0, classic mirrored queues replicated state with a homegrown algorithm that did not handle network partitions cleanly. CloudAMQP's customer-incident write-up is blunt: scenarios exist where a netsplit happens, the configured partition-handling strategy does not even fire, and the only recovery is human — usually a node redeploy. Quorum queues, introduced earlier and made the only replicated option in 4.0, replace this with Raft consensus. The chapter episode on AMQP covers the human and corporate context behind that decision.

A representative real-world AMQP outage that any practitioner can learn from is the July 2025 Medium post-mortem titled "When RabbitMQ Goes Dark." A SaaS team ran a single-replica StatefulSet pinned to a public Bitnami container image by the `latest` tag. The image was deleted from the registry; the pod failed to restart with `ImagePullBackOff`. Operators were watching CPU and memory at the host level, not pod restarts or queue depth, so nobody noticed. A second restart triggered a partial split-brain in the mirrored queues. A poison message — a payload that deterministically crashes its consumer — was being NACKed and requeued forever. Memory crept up. At 14:00 the broker hit its high-water mark and flow-controlled all publishers; the twelve-service mesh deadlocked. The cluster was down for about two hours and the recovery required hunting down a snapshot of the deleted container image. The team's fix was a private registry, a move to RabbitMQ 4.0 with quorum queues, an explicit prefetch count per consumer, the new default redelivery limit of 20 so poison messages dead-letter automatically, and Prometheus alerts on queue depth and pod restarts.

The CVE history is mostly about denial-of-service. CVE-2023-46118 (RabbitMQ server, October 2023, CVSS 4.9) was a missing HTTP API request body limit that let an attacker submit very large messages and exhaust the broker; patched in 3.11.24 and 3.12.7. CVE-2023-46120 (the Java client, same month, CVSS 4.9) had no `maxBodyLength` on incoming messages, letting a hostile broker drive a consumer to OOM; patched in 5.18.0 with backports. CVE-2022-31008 (June 2022, CVSS 5.5) was a predictable seed in the shovel-and-federation URI obfuscation, where credentials could end up in node logs in reasonably-easy-to-deobfuscate form. The 2025 series — GHSA-pj33-75x5-32j4, GHSA-g58g-82mw-9m3p, GHSA-gh3x-4x42-fvq8 — covers an unauthenticated queue-deletion bug in the HTTP API, an XSS in the management UI's error pages, and a node logging an HTTP Basic Auth header. Worth reading the GitHub security advisories index directly. The April 2025 Erlang/OTP SSH RCE, CVE-2025-32433 with CVSS 10.0, did not affect RabbitMQ — RabbitMQ's distributed Erlang packages exclude the SSH library, and the team published an explicit non-affected statement.

## Common pitfalls (for the practitioner)

The default consumer prefetch is unlimited. A fast consumer connects, the broker hands it the entire queue, and every other consumer starves. Set `basic.qos prefetch_count` per consumer (`global=false`). A reasonable starting point is 1 for fair distribution, then raise it: roughly `round-trip / processing-time`. For a 125 ms RTT and 5 ms processing, prefetch around 25 is a sensible target.

Unbounded queues fill memory until the broker hits its high-water mark and stops accepting publishes. Set `x-max-length`, and pair it with `x-overflow=reject-publish` so producers learn about the backpressure rather than silently losing messages.

Default `guest:guest` is the most-cited gotcha. Created on first boot with admin rights to vhost `/`, restricted to localhost — but if you expose port 5672 to a network with `loopback_users` cleared, you have a wide-open broker. Production rule: delete `guest`, create per-application users, scope them to per-app vhosts.

Connection or channel churn — opening a TCP connection or AMQP channel per published message — will make the broker miserable. Channels are cheap, not free; reuse them.

`mandatory=true` without a `basic.return` handler silently drops unroutable messages. The flag tells the broker to bounce a message back if no queue matches; if you do not register a handler, the message vanishes.

Persistence is end-to-end. Marking a message persistent with delivery mode 2 does nothing if the queue itself is non-durable. Both must be set.

Mixing 0-9-1 and 1.0 features carelessly inside the same broker is a quiet trap. Message headers and properties do not always translate cleanly across the two protocols.

## Debugging it

The first move on any RabbitMQ host is `rabbitmqctl status` for node and listener summary, then `rabbitmqctl list_queues name messages messages_ready messages_unacknowledged`, `list_consumers`, and `list_connections` for live state. The management UI on port 15672 is fine for ad-hoc inspection, but at scale Prometheus and Grafana with the RabbitMQ Prometheus exporter is the recommended path; the management API itself becomes a metrics overhead under load.

For provisioning and Blue-Green migrations, `rabbitmqadmin` v2 — the HTTP-API CLI — handles definitions export and import. The `rabbitmq_tracing` plugin captures wire traffic when a misbehaving client lies about what it is doing. Wireshark has had a built-in AMQP dissector for years; point it at port 5672 and watch the methods scroll by.

Key things to alert on: queue depth growing (consumers can't keep up), unacked count growing past prefetch times consumer count (a stuck consumer), connection or channel count spiking (churn anti-pattern), memory and disk alarms (publishers about to be flow-controlled), file descriptor limits (Linux defaults to 1024 — raise to 65,000 plus in `/etc/security/limits.conf`), and on quorum queues the `fsync` rate (low link-credit settings cause excessive fsync calls).

## What's changing in 2026

RabbitMQ 4.3, released April 2026, added JMS-style queues with SQL message selectors, a queue browser, per-message delayed retry via `x-opt-delivery-time` using the AMQP 1.0 modified outcome, a rejection reason in the AMQP 1.0 Rejected outcome, and protocol-specific consumer-timeout handling. Mnesia is being removed in this series; Khepri, the Raft-based metadata store, is mandatory.

RabbitMQ 4.2, in 2025, made Khepri the default for new clusters, added SQL Filter Expressions on streams, local Shovels, and cluster-wide exchange limits.

RabbitMQ 4.1 introduced AMQP 1.0 over WebSocket and Filter Expressions. The 4.0.x community-support window closed when 4.1 shipped — a consequence of the May 2024 community-support policy change.

RabbitMQ 4.0, September 2024, was the inflection point. AMQP 1.0 became a core protocol — what had been a plugin became a no-op. A native AMQP 1.0 connection now uses one Erlang process per session against fifteen in 3.13, peak throughput on some workloads more than doubled, and memory dropped roughly 56 percent. Classic mirrored queues, deprecated since 2021, were fully removed. The default redelivery limit on quorum queues became 20, so poison messages dead-letter automatically.

The May 2024 community-support policy is the single biggest open-source-governance shift since the OASIS vote. The RabbitMQ team announced that older releases — 3.12.x and earlier — will no longer receive community patches; non-paying users must upgrade. The MPL-2.0 license is unchanged. Broadcom, which acquired VMware in November 2023, still employs the RabbitMQ core team and sells a commercial distribution. Third-party support providers such as Erlang Solutions and CloudAMQP have stepped in for organisations that don't want a Broadcom contract.

The strategic direction is one consensus library doing every replicated job: quorum queues for messages, streams for append-only logs, Khepri for metadata, all running on the same Ra Raft library. As Alexis Richardson put it in March 2026, RabbitMQ is challenging Kafka in a lot of ways. Kafka, for its part, is finally adding the per-message acknowledgment model AMQP has had for two decades — KIP-932 share groups in Kafka 4.1.

The OASIS AMQP TC is alive but quiet on the core. The 1.0 spec has not changed since 2012. Active work is on extension profiles — Claims-Based Security and Filter Expressions are the published ones.

## Fun facts (host material)

The byte `0xCE` ends every AMQP 0-9-1 frame. It is not a checksum and not a length — it is a literal sentinel. AMQP rides on TCP, which already gives you ordering and a checksum, and the frame's own size field tells the parser exactly how many bytes the payload contains. So why have it? Because the protocol was designed in an era when banks' "trusted" middleboxes — proprietary gateways, NAT routers, load balancers — would happily corrupt bytes mid-stream. `0xCE` is a tripwire. AMQP 1.0 quietly removed it, trusting the size field alone.

The "Advanced" in AMQP is positioning, not technology. The acronym referred to the goal of standing in for IBM's MQ Series, TIBCO, and the other "advanced" enterprise middleware suites. The plain "MQP" abbreviation was already taken by other queuing systems, so the working group prefixed "Advanced."

RabbitMQ's reference implementation is roughly 5,000 lines of Erlang. As the team put it in their early Erlang Exchange talk, the domain of discourse of AMQP — independent processes, supervised crashes, lightweight concurrency — is essentially identical to Erlang/OTP. Each AMQP node corresponds to a separate Erlang process, and OTP's supervision trees model AMQP's queue-as-process abstraction directly.

On 30 October 2011, in New York, Microsoft, Red Hat, VMware, Apache, INETCO, and IIT Software demonstrated AMQP 1.0 software talking to each other live. Competing vendors agreed on the bytes; OASIS announced a Technical Committee the next day. The standard was approved a year later, on 31 October 2012, and ratified as ISO/IEC 19464 in April 2014.

Pieter Hintjens, the iMatix CEO who shipped the first AMQP broker, walked out of the working group in 2010 over the 1.0 redesign. His verdict on his blog: "AMQP/0.9.1 is legally and technically dead. AMQP/1.0 is touted as an upgrade for AMQP/0.9.1 when it's not. The two operate at different layers." He went on to build ZeroMQ — a brokerless library that took the inverse trade. Hintjens died by voluntary euthanasia on 4 October 2016. His final blog post was titled "A Protocol for Dying."

Alexis Richardson, founder of Rabbit Technologies and a working-group veteran, summed up the AMQP 1.0 paradox in a March 2025 RedMonk interview: "If you read AMQP 1.0, it's called Advanced Message Queue Protocol, but there are no queues in it." The 1.0 spec describes how two peers transfer messages over links to opaque endpoints; the broker model is left to implementers. RabbitMQ implements one set of choices, Azure Service Bus implements another, and the protocol underneath is the same.

## Where this connects in the book

- The Foundations chapter "Client-Server vs Peer-to-Peer" — frames the asymmetric broker model that AMQP 0-9-1 prescribes and that AMQP 1.0 deliberately abandons in favour of symmetric peer-to-peer transfer.
- The Async / IoT chapter "AMQP" — the human story. JPMorgan, John O'Hara, the SWIFT-derivatives gateway, the two billion dollars in collateral calls, Hintjens and the iMatix split, the Broadcom acquisition, and where the protocol goes now. Defer all the long-form narrative there.
- The Async / IoT chapter "Kafka" — the comparative companion. How a distributed commit log differs from a queue, why the throughput edge exists, and why Kafka's KIP-932 share groups represent it converging on AMQP-style per-message acknowledgments after twenty years.

## See also (other protocol episodes)

If you have heard the TCP episode, the AMQP relationship is straightforward: AMQP assumes a reliable, ordered byte stream, opens one TCP connection per broker, and multiplexes everything else inside that single socket. Heartbeats and idle-timeouts exist because TCP keepalive is unreliable across NATs and firewalls. The TCP episode covers all of that; this episode picks up at the protocol header.

The TLS episode is the natural pair. AMQP wraps in two flavours — implicit on port 5671, where TLS is negotiated first and then the AMQP handshake runs, or in-protocol on port 5672 with an upgrade using AMQP protocol id 2. After TLS, SASL announces mechanisms and credentials flow.

The MQTT episode is the contrast that matters most for engineers. MQTT is purpose-built for constrained IoT devices: two-byte fixed headers, three QoS levels, no exchanges or routing keys, just topic strings, with last-will and retained messages. AMQP is the heavyweight side of the same coin — feature-rich, transactional, exchange-based routing, designed for back-office reliability. They coexist; modern brokers like RabbitMQ speak both natively. Pick AMQP when transactions and audit trails are non-negotiable; pick MQTT when scale and simplicity matter.

The STOMP episode is the simplicity counterpoint. STOMP is text-framed, deliberately small enough that you can hand-write a client in an afternoon. RabbitMQ supports STOMP via plugin. Choose STOMP when you want browser clients or scripting languages to talk to a broker without pulling in an AMQP library.

The WebSocket episode connects through Microsoft Azure Service Bus's AMQP-WebSocket binding, and through RabbitMQ 4.1's native AMQP 1.0 over WebSocket. Both let AMQP frames traverse HTTP-only firewalls on port 443.

The Kafka episode is the architectural sibling. Kafka is an append-only log; AMQP is a queue where consume means delete. Kafka wins on raw throughput and event replay; AMQP wins on per-message routing flexibility and explicit acknowledgments. RabbitMQ Streams since 3.9 brings Kafka-like semantics into the RabbitMQ ecosystem; Kafka's KIP-932 share groups bring AMQP-like semantics into Kafka. The two protocols are converging from opposite directions.

## Visual cues for image generation

- A side-by-side of the two AMQP frame formats. Left: AMQP 0-9-1, with a labelled 1-byte type, 2-byte channel, 4-byte size, payload, and the literal sentinel byte `0xCE` highlighted in red at the end. Right: AMQP 1.0, with an 8-byte header (SIZE, DOFF, TYPE, CHANNEL), extended header, and performative payload. No sentinel.
- An illustration of the four AMQP 0-9-1 exchange types. A producer sends one message; arrows fan out to bound queues. Direct (one queue, exact key match), Topic (two queues, wildcard pattern `orders.*.eu`), Fanout (every queue, key ignored), Headers (matched by a properties map).
- A timeline of AMQP releases. 2003 origin at JPMorgan; 2006 first deployment; 2008 0-9-1 frozen; 2010 Hintjens leaves; October 2011 1.0 released; October 2012 OASIS standard; April 2014 ISO/IEC 19464; September 2024 RabbitMQ 4.0 native AMQP 1.0; April 2026 RabbitMQ 4.3 with Mnesia removed.
- A diagram contrasting AMQP, MQTT, and Kafka delivery models. AMQP shows a producer hitting a topic exchange that fans into two named queues drained by competing consumers. MQTT shows a single broker with topics and direct subscribers. Kafka shows an append-only partitioned log read independently by two consumer groups at different offsets.
- A schematic of a RabbitMQ 4.x cluster on three nodes. A quorum queue replicated by Ra Raft, a stream replicated by the same Raft, and Khepri holding metadata also via Raft. Captioned: "one consensus library, three replicated primitives."
- A close-up of a single AMQP 0-9-1 frame on the wire, byte by byte, with the `0xCE` sentinel boxed and labelled "tripwire — not a checksum."

## Sources

### Standards and specifications
- [OASIS AMQP 1.0 — Overview](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)
- [OASIS AMQP 1.0 — Transport](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html)
- [OASIS AMQP 1.0 — Types](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html)
- [OASIS AMQP 1.0 — Security](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html)
- [OASIS AMQP CBS profile](https://docs.oasis-open.org/amqp/amqp-cbs/v1.0/csd01/amqp-cbs-v1.0-csd01.html)
- [ISO/IEC 19464:2014](https://www.iso.org/standard/64955.html)
- [AMQP 0-9-1 specification PDF](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf)
- [AMQP 0-9-1 reference (markdown)](https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/docs/amqp-0-9-1-reference.md)
- [RabbitMQ AMQP 0-9-1 errata](https://www.rabbitmq.com/amqp-0-9-1-errata)

### Papers
- [O'Hara, "Toward a Commodity Enterprise Middleware," ACM Queue 5(4), 2007](https://queue.acm.org/detail.cfm?id=1255424)
- [Towards benchmarking of AMQP, DEBS 2010](https://dl.acm.org/doi/10.1145/1827418.1827438)

### Vendor and engineering blogs
- [RabbitMQ blog — Native AMQP 1.0 (Aug 2024)](https://www.rabbitmq.com/blog/2024/08/05/native-amqp)
- [RabbitMQ blog — AMQP 1.0 benchmarks (Aug 2024)](https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks)
- [RabbitMQ blog — 4.3 release (April 2026)](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)
- [RabbitMQ blog — Community support policy (May 2024)](https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy)
- [RabbitMQ blog — Not affected by CVE-2025-32433](https://www.rabbitmq.com/blog/2025/04/24/rabbitmq-is-not-affected-by-cve-2025-32433)
- [RabbitMQ release notes — 4.0.1](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
- [RabbitMQ — Khepri metadata store](https://www.rabbitmq.com/docs/metadata-store)
- [RabbitMQ — Quorum queues](https://www.rabbitmq.com/docs/quorum-queues)
- [RabbitMQ — Streams](https://www.rabbitmq.com/docs/streams)
- [RabbitMQ — AMQP 0-9-1 model concepts](https://www.rabbitmq.com/tutorials/amqp-concepts)
- [RabbitMQ — Networking and ports](https://www.rabbitmq.com/docs/networking)
- [RabbitMQ — Access control](https://www.rabbitmq.com/docs/access-control)
- [RabbitMQ — Consumer prefetch](https://www.rabbitmq.com/docs/consumer-prefetch)
- [RabbitMQ — Erlang Exchange talk notes](https://www.rabbitmq.com/resources/erlang-exchange-talk-final/ex)
- [RabbitMQ Substack — Khepri will become the only supported store](https://rabbitmq.substack.com/p/khepri-will-become-the-only-supported)
- [VMware/Tanzu — One million msg/s on Google Compute Engine](https://blogs.vmware.com/tanzu/rabbitmq-hits-one-million-messages-per-second-on-google-compute-engine/)
- [VMware/Tanzu — Introducing Tanzu RabbitMQ 4.0](https://blogs.vmware.com/tanzu/introducing-vmware-tanzu-rabbitmq-4-0/)
- [VMware/Tanzu — Native AMQP 1.0](https://blogs.vmware.com/tanzu/native-amqp-1-0/)
- [VMware/Tanzu — How Instagram feeds work with Celery and RabbitMQ](https://blogs.vmware.com/tanzu/how-instagram-feeds-work-celery-and-rabbitmq.html)
- [CloudAMQP — RabbitMQ 4.0.3 highlights](https://www.cloudamqp.com/blog/rabbitmq-403.html)
- [CloudAMQP — RabbitMQ 4.2 announcement](https://www.cloudamqp.com/blog/cloudamqp-announcing-rabbitmq-version-4-2.html)
- [CloudAMQP — From Mnesia to Khepri (part 1)](https://www.cloudamqp.com/blog/from-mnesia-to-khepri-part1.html)
- [CloudAMQP — When to use RabbitMQ or Apache Kafka](https://www.cloudamqp.com/blog/when-to-use-rabbitmq-or-apache-kafka.html)
- [CloudAMQP — How to optimise the prefetch count](https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html)
- [CloudAMQP — Panel discussion, what's new for RabbitMQ](https://www.cloudamqp.com/blog/panel-discussion-whats-new-and-whats-on-the-horizon-for-rabbitmq.html)
- [CloudAMQP — RabbitMQ for beginners](https://www.cloudamqp.com/blog/part1-rabbitmq-for-beginners-what-is-rabbitmq.html)
- [CloudAMQP — AMQP docs](https://www.cloudamqp.com/docs/amqp.html)
- [Microsoft Learn — Azure Service Bus AMQP overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview)
- [Microsoft Learn — Azure Service Bus AMQP protocol guide](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide)
- [Apache Qpid project](https://qpid.apache.org/)
- [Apache Qpid Proton](https://qpid.apache.org/proton/)
- [Apache Qpid type reference](https://qpid.apache.org/amqp/type-reference.html)
- [Apache Qpid Broker-J introduction](https://qpid.apache.org/releases/qpid-broker-j-9.1.0/book/Java-Broker-Introduction.html)
- [Erlang Solutions — An introduction to RabbitMQ](https://www.erlang-solutions.com/blog/an-introduction-to-rabbitmq-what-is-rabbitmq/)
- [Seventh State — Beyond Broadcom](https://seventhstate.io/beyond-broadcom-an-alternative-for-supporting-open-source-rabbitmq/)
- [Confluent — Kafka the fastest messaging system](https://www.confluent.io/blog/kafka-fastest-messaging-system/)
- [LavinMQ — The AMQP 0-9-1 protocol](https://lavinmq.com/blog/the-amqp-091-protocol)
- [DanubeData — RabbitMQ 120k msg/s benchmark](https://danubedata.ro/blog/rabbitmq-performance-benchmarks-120k-messages-per-second-2026)
- [Brian Storti — Speaking Rabbit: AMQP frame structure](https://www.brianstorti.com/speaking-rabbit-amqps-frame-structure/)
- [Square Mobius — AMQP codec in JS](https://www.squaremobius.net/2013/11/12/amqp-codec-in-js.html)
- [Hintjens — What is wrong with AMQP](http://hintjens.com/blog:28)
- [Hintjens — A protocol for dying](http://hintjens.com/blog:115)
- [Quix — Apache Kafka vs RabbitMQ](https://quix.io/blog/apache-kafka-vs-rabbitmq-comparison)
- [HiveMQ — MQTT vs AMQP for IoT](https://www.hivemq.com/blog/mqtt-vs-amqp-for-iot/)
- [EMQX — MQTT vs AMQP for IoT communications](https://www.emqx.com/en/blog/mqtt-vs-amqp-for-iot-communications)

### News and interviews
- [InfoQ — Origin of Advanced Message Queuing (April 2025)](https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/)
- [InfoQ — AMQ launch (2007)](https://www.infoq.com/news/amq/)
- [InfoQ — Advanced Message Queuing politics talk page](https://www.infoq.com/presentations/advanced-message-queuing/)
- [QCon London — O'Hara keynote, April 2025](https://qconlondon.com/keynote/apr2025/advanced-message-queuing-politics)
- [RedMonk — Alexis Richardson interview, March 2025](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)
- [Code BEAM Europe — Khepri replacing Mnesia](https://codebeameurope.com/talks/khepri-replacing-mnesia-in-rabbitmq/)
- [Changelog #205 — A protocol for dying with Pieter Hintjens](https://changelog.com/podcast/205)
- [SD Times — ZeroMQ founder Pieter Hintjens dies](https://sdtimes.com/code-editor/sd-times-blog-zeromq-founder-pieter-hintjens-dies/)
- [OASIS announcement — ISO/IEC approve AMQP](https://www.oasis-open.org/2014/05/01/iso-and-iec-approve-oasis-amqp-advanced-message-queuing-protocol/)
- [Alvaro Videla — RabbitMQ chat post-mortem (2011)](https://alvaro-videla.com/2011/05/rabbitmq-chat-post-mortem.html)
- [Medium — When RabbitMQ goes dark (July 2025)](https://medium.com/@pandey.pradhyuman139/when-rabbitmq-goes-dark-5-critical-lessons-from-a-production-outage-46443081aa15)

### Security advisories
- [NVD — CVE-2023-46118](https://nvd.nist.gov/vuln/detail/cve-2023-46118)
- [SUSE — CVE-2023-46118](https://www.suse.com/security/cve/CVE-2023-46118.html)
- [SUSE — CVE-2022-31008](https://www.suse.com/security/cve/CVE-2022-31008.html)
- [Snyk — RabbitMQ Java client CVE-2023-46120](https://security.snyk.io/vuln/SNYK-JAVA-COMRABBITMQ-6028124)
- [GitHub — RabbitMQ security advisories](https://github.com/rabbitmq/rabbitmq-server/security/advisories)
- [Broadcom — Impact of CVE-2025-32433 on RabbitMQ](https://knowledge.broadcom.com/external/article/406230/impact-of-cve202532433-cve202522868-on.html)

### Wikipedia
- [Advanced Message Queuing Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)
- [Pieter Hintjens](https://en.wikipedia.org/wiki/Pieter_Hintjens)
