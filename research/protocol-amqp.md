---
prompt_source: deep-research-prompts.txt:5219-5398 (PROTOCOL · AMQP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/fe9330e7-1c36-4a92-8476-b6b783efe3d3
research_mode: claude.ai Research
---

# The Advanced Message Queuing Protocol (AMQP): A Field Manual for Engineers

*Compiled May 2026. Sources are inline as URLs / DOIs and gathered in the final Citations section. Where a claim cannot be traced to a verifiable public source, it is tagged `[needs source]` rather than fabricated.*

---

## Prerequisites and glossary

Before AMQP makes sense, a reader needs vocabulary from networking, encoding, cryptography, and message-oriented middleware. Each entry below is short, then linked to a canonical explainer.

**OSI / TCP-IP layering.** AMQP is an *application-layer* protocol that runs over TCP. The OSI seven-layer model (physical, data link, network, transport, session, presentation, application) is the standard mental model; the simpler four-layer TCP/IP model collapses session/presentation/application into one. AMQP cares about layer 7 and assumes a reliable, ordered byte stream from layer 4 (TCP). See [https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) and RFC 9293 (TCP) at [https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293).

**TCP (Transmission Control Protocol).** Connection-oriented byte-stream protocol providing ordering, retransmission, and flow control. AMQP "assumes an underlying reliable transport layer protocol such as Transmission Control Protocol (TCP)" ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**Socket.** The OS-level endpoint of a TCP connection, identified by (IP, port). When a RabbitMQ client "opens a connection," it ultimately calls socket() and connect() to TCP port 5672 (or 5671 over TLS). See [https://www.rabbitmq.com/docs/networking](https://www.rabbitmq.com/docs/networking).

**Port.** A 16-bit number multiplexing many sockets on one machine. AMQP's IANA-registered ports are 5672 (plain) and 5671 (AMQPS / TLS). [https://www.rabbitmq.com/docs/networking](https://www.rabbitmq.com/docs/networking) [CloudAMQP](https://www.cloudamqp.com/docs/amqp.html)

**Header.** Fixed-format metadata at the front of a frame or message that lets the receiver parse what follows. AMQP frames begin with a fixed-width header (type, channel, size in 0-9-1; size, DOFF, type, channel in 1.0). [https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf)

**Frame.** "A formally-defined package of connection data… always written and read contiguously - as a single unit - on the connection." AMQP's wire unit. (AMQP 0-9-1 spec, [https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf)) [RabbitMQ](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf)

**Datagram vs. stream.** A datagram is a self-contained unit (UDP); a stream is an ordered, unbounded sequence of bytes (TCP). AMQP rides a stream and superimposes its own framing. [https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293)

**Checksum.** Integer derived from a payload to detect corruption. AMQP relies on TCP's checksum; the protocol itself adds *no* application-level checksum, only a literal frame-end byte (`0xCE` in 0-9-1) used as a *sentinel*, not a checksum. [https://www.rabbitmq.com/amqp-0-9-1-errata](https://www.rabbitmq.com/amqp-0-9-1-errata)

**Handshake.** Multi-step exchange that sets up shared state. AMQP has *several* handshakes stacked: TCP three-way handshake → optional TLS handshake → optional SASL handshake → AMQP protocol-header exchange → Connection.Start/Start-Ok/Tune/Tune-Ok/Open/Open-Ok (0-9-1) or `open` performative (1.0). [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html)

**TLS (Transport Layer Security).** Cryptographic protocol providing authenticated, confidential channels over TCP. AMQP supports two patterns: implicit TLS (port 5671, TLS first, then AMQP), and explicit upgrade ("the server immediately offers a mandatory upgrade of connection to TLS using the AMQP-prescribed model"). [https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide) [Microsoft Learn](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide)

**SASL (Simple Authentication and Security Layer).** A pluggable authentication framework (RFC 4422) that lets a protocol negotiate among mechanisms such as PLAIN, EXTERNAL, ANONYMOUS, GSSAPI, SCRAM, OAUTHBEARER. AMQP 1.0 explicitly carries SASL frames during handshake. [https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html)

**Message broker.** Server that mediates between publishers and consumers, often providing routing, persistence, and acknowledgments. RabbitMQ is the canonical AMQP broker. [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts)

**Producer / Publisher.** Application that sends messages. **Consumer.** Application that receives them. [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts)

**Queue.** A named, possibly durable buffer holding messages until consumed. [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts)

**Exchange.** AMQP 0-9-1 routing primitive: publishers send messages to *exchanges*, not queues; the exchange decides which queue(s) get a copy. Types: direct, fanout, topic, headers. [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts) [CloudAMQP](https://www.cloudamqp.com/blog/part1-rabbitmq-for-beginners-what-is-rabbitmq.html)

**Binding.** "A link between a queue and an exchange," parametrised by routing keys and/or arguments. [https://www.cloudamqp.com/blog/part1-rabbitmq-for-beginners-what-is-rabbitmq.html](https://www.cloudamqp.com/blog/part1-rabbitmq-for-beginners-what-is-rabbitmq.html) [CloudAMQP](https://www.cloudamqp.com/blog/part1-rabbitmq-for-beginners-what-is-rabbitmq.html)

**Routing key.** A short string used by direct/topic exchanges to choose target queues (e.g. `orders.eu.priority`). [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts)

**Channel.** A "lightweight" logical connection multiplexed inside a single TCP connection. Multiple channels share one socket and one heartbeat. [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts)

**Virtual host (vhost).** A namespace inside a broker (queues, exchanges, permissions are scoped by vhost). RabbitMQ ships with the default vhost `/`. [https://www.rabbitmq.com/docs/access-control](https://www.rabbitmq.com/docs/access-control)

**Heartbeat.** Periodic empty frame to detect dead TCP peers (NAT timeouts, frozen processes). [https://www.rabbitmq.com/amqp-0-9-1-errata](https://www.rabbitmq.com/amqp-0-9-1-errata)

**Session, link, terminus, performative (AMQP 1.0).** A *session* is a bidirectional conversation inside a connection; *links* carry messages in one direction inside a session; a *terminus* is a source or target of a link (e.g. a queue, a topic). A *performative* is one of nine wire commands: `open, begin, attach, flow, transfer, disposition, detach, end, close`. [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html) [OASIS Open](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-transport-v1.0.html)

**Quorum queue / Stream / Khepri (RabbitMQ specific).** Quorum queues replicate data via Raft for safety; *streams* are append-only logs (Kafka-like, non-destructive consume); *Khepri* is the new Raft-based metadata store replacing Mnesia. [https://www.rabbitmq.com/docs/quorum-queues](https://www.rabbitmq.com/docs/quorum-queues), [https://www.rabbitmq.com/docs/streams](https://www.rabbitmq.com/docs/streams), [https://www.rabbitmq.com/docs/metadata-store](https://www.rabbitmq.com/docs/metadata-store) [Code BEAM Europe](https://codebeameurope.com/talks/khepri-replacing-mnesia-in-rabbitmq/)

**JMS (Java Message Service).** A Java API for messaging. *Not* a wire protocol — exactly the gap AMQP was designed to fill. [https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

---

## History and story

**Origin (2003-2006).** AMQP "was originated in 2003 by John O'Hara at JPMorgan Chase in London" ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). In O'Hara's own words from his 2007 ACM Queue paper: "AMQP was born out of my own experience and frustrations in developing front- and back-office processing systems at investment banks. It seemed to me that we were living in integration Groundhog Day - the same problems of connecting systems together would crop up with depressing regularity… each time the architecture of some system would be curtailed to allow for the fact that the chosen middleware was reassuringly expensive. From 1996 through to 2003 I was waiting for the solution to this obvious requirement to materialize as a standard… But that failed to happen, and I grew tired of waiting." ([https://queue.acm.org/detail.cfm?id=1255424](https://queue.acm.org/detail.cfm?id=1255424), DOI: 10.1145/1255421.1255424.) The paper notes the first mission-critical deployment in mid-2006: "That project paid for itself with its first deployment, serves 2,000 users, and processes 300 million messages per day." [Wikipedia + 2](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**The trigger story.** Speaking at QCon London 2025, O'Hara recalled the moment that crystallised the problem: while writing a SWIFT gateway for a derivatives trading system at JPMorgan, "I watched as the first… message came up in the system. The first thing it did was make two billion dollars in collateral calls… and I just stared at the screen and thought, 'Well, that's the most interesting console message I'll ever see'" ([https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/](https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/), [https://qconlondon.com/keynote/apr2025/advanced-message-queuing-politics](https://qconlondon.com/keynote/apr2025/advanced-message-queuing-politics)). [InfoQ](https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/)

**Why a *protocol*, not an API.** The financial industry needed durability, very high volume, and broker-vendor neutrality; existing solutions (IBM MQ Series, TIBCO, MSMQ) were proprietary at the wire level. JMS standardised an API but not the bytes — meaning a JMS client could talk to *any* JMS broker only if it shipped that vendor's JAR. AMQP would standardise the bytes themselves, the way SMTP and HTTP did. As the InfoQ launch piece put it: "AMQP is like the messaging middleware equivalent to HTTP" ([https://www.infoq.com/news/amq/](https://www.infoq.com/news/amq/)). Alexis Richardson, who later founded Rabbit Technologies, described the commercial driver bluntly in 2025: "to bypass paying for IBM's MQ"— "you had to buy a license to use the protocol because it wasn't an open protocol" ([https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)). [InfoQ](https://www.infoq.com/news/amq/)[RedMonk](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)

**Working group and iMatix (2004-2008).** "JPMorgan Chase contracted iMatix Corporation from mid-2004 to mid-2006 to develop a C broker and protocol documentation." The working group grew to 23 companies including JPMorgan, Bank of America, Barclays, Cisco, Credit Suisse, Deutsche Börse, Goldman Sachs, Red Hat, Microsoft, VMware (after acquiring Rabbit Technologies), Software AG, Solace, StormMQ, Novell, my-Channels, INETCO, and IIT Software ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). [CIO Wiki + 2](https://cio-wiki.org/wiki/Advanced_Message_Queuing_Protocol_(AMQP))

**Version line.** AMQP 0-8 (June 2006), 0-9 (Dec 2006), 0-10 (Feb 2008), 0-9-1 (Nov 2008) — all are "significantly different from the 1.0 specification" ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). 0-9-1 became the de-facto "RabbitMQ AMQP" because RabbitMQ stuck with it and wrote thousands of pages of documentation around it. [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**The split with iMatix (2008-2010).** "In 2008, Pieter Hintjens, CEO and chief software designer of iMatix, wrote an article called 'What is wrong with AMQP (and how to fix it)' and distributed it to the working group… By then, iMatix had already started work on ZeroMQ. In 2010, Hintjens announced that iMatix would leave the AMQP workgroup and did not plan to support AMQP/1.0 in favor of the significantly simpler and faster ZeroMQ" ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

Hintjens' verdict on the 1.0 redesign was scathing: "AMQP/0.9.1 is legally and technically dead… AMQP/1.0 is touted as an upgrade for AMQP/0.9.1 when it's not. The two operate at different layers… 95% of the AMQP community has invested in a dead standard. I count 4,528 repositories on GitHub that refer to AMQP. There are 244 that refer to AMQP/1.0." ([http://hintjens.com/blog:28](http://hintjens.com/blog:28)). His later interview was harsher still: "AMQP was great ten years ago when we invented it… Today AMQP is a mess. The popular version, AMQP 0.9, which RabbitMQ implements, is frozen. There's no process for improving it. It is a dead protocol. The official version is 1.0, a totally different protocol, which does not even do message queuing at all! It is just a very complex point-to-point transport protocol." ([https://github.com/zeromq/malamute/blob/master/AMQP.md](https://github.com/zeromq/malamute/blob/master/AMQP.md)). [Hintjens](http://hintjens.com/blog:28)[GitHub](https://github.com/zeromq/malamute/blob/master/AMQP.md)

**1.0 release and standardisation (2011-2014).** AMQP 1.0 was released by the working group on **30 October 2011** at a conference in New York with interoperability demos by Microsoft, Red Hat, VMware, Apache, INETCO and IIT Software; the next day OASIS announced a Technical Committee. AMQP 1.0 was approved as an OASIS Standard on 31 October 2012 ([https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)), and as **ISO/IEC 19464:2014** in April 2014 ([https://www.iso.org/standard/64955.html](https://www.iso.org/standard/64955.html), [https://www.oasis-open.org/2014/05/01/iso-and-iec-approve-oasis-amqp-advanced-message-queuing-protocol/](https://www.oasis-open.org/2014/05/01/iso-and-iec-approve-oasis-amqp-advanced-message-queuing-protocol/)). The OASIS 1.0 standard is published in five "Parts": Types, Transport, Messaging, Transactions, Security. [Wikipedia + 4](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**Adoption split.** RabbitMQ stayed on 0-9-1 because, per Simon MacMullen of the Rabbit team in 2012, "1.0 is a very different thing from 0-9-1… in some ways it's more like a super-STOMP - giving you less connection with broker internals but being more focussed on interoperability" ([https://groups.google.com/g/rabbitmq-discuss/c/9Hj0FzgyLQk](https://groups.google.com/g/rabbitmq-discuss/c/9Hj0FzgyLQk)). Apache Qpid (Java + C++ + Proton library) and ActiveMQ implemented 1.0; Microsoft Azure Service Bus chose 1.0 as its primary protocol ([https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview)); IBM MQ added AMQP 1.0 channels. [Google Groups](https://groups.google.com/g/rabbitmq-discuss/c/9Hj0FzgyLQk)[Microsoft Learn](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview)

**Pieter Hintjens, 1962-2016.** Born in Congo, raised in East Africa, Belgian software developer, FFII president, ZeroMQ founder. "In 2010, Hintjens was diagnosed with bile duct cancer, which was successfully surgically removed. However, in April 2016, his cancer returned, and was determined to be terminal. Hintjens died of voluntary euthanasia on 4 October 2016." ([https://en.wikipedia.org/wiki/Pieter_Hintjens](https://en.wikipedia.org/wiki/Pieter_Hintjens)). His final blog post "A Protocol for Dying" ([http://hintjens.com/blog:115](http://hintjens.com/blog:115)) and his final tweet — "I'm choosing euthanasia etd 1pm. I have no last words." — are widely cited in the open-source community. [Wikipedia + 2](https://en.wikipedia.org/wiki/Pieter_Hintjens)

**What changed in the last 24 months (May 2024 → May 2026).** This is the most volatile period in AMQP's history since 2011.

- **RabbitMQ 4.0 GA, 18 Sept 2024.** AMQP 1.0 became a *core* protocol — the old plugin became a no-op, peak throughput "more than double" 3.13.x on some workloads ([https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)). Native AMQP 1.0 uses a single Erlang process per session, vs. 15 in 3.13 ([https://www.cloudamqp.com/blog/rabbitmq-403.html](https://www.cloudamqp.com/blog/rabbitmq-403.html)). [GitHub + 2](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
- **Classic Mirrored Queues fully removed in 4.0** after deprecation since 2021 ([https://www.rabbitmq.com/docs/3.13/ha](https://www.rabbitmq.com/docs/3.13/ha)). Quorum queues (Raft-based) and streams are the replicated primitives. [GitHub + 2](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
- **Khepri** matured from experimental in 3.13 to fully supported in 4.0; **default in 4.2.0** for new deployments ([https://www.rabbitmq.com/docs/metadata-store](https://www.rabbitmq.com/docs/metadata-store), [https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.2.0](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.2.0)); **mandatory in 4.3.0** with Mnesia removed ([https://rabbitmq.substack.com/p/khepri-will-become-the-only-supported](https://rabbitmq.substack.com/p/khepri-will-become-the-only-supported)). [GitHub + 3](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
- **RabbitMQ 4.1, 4.2, 4.3.** 4.1 added AMQP 1.0 over WebSocket and Filter Expressions; 4.2 added SQL Filter Expressions on streams and made Khepri default; 4.3 (April 2026) added JMS-style queues with SQL message selectors, delayed retry, and Rejected outcome with queue name to AMQP 1.0 publishers ([https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)). [RabbitMQ](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)[RabbitMQ](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)
- **Broadcom acquisition impact.** After Broadcom acquired VMware (Nov 2023), the RabbitMQ team announced 31 May 2024 that "older Open Source release versions (for example, RabbitMQ 3.12.x and older) will no longer receive patches through community support" — community support for the 4.0.x series ended with the 4.1 release; non-paying users must upgrade to stay supported by the core team ([https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy](https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy), [https://www.rabbitmq.com/blog/tags/rabbit-mq-4-0](https://www.rabbitmq.com/blog/tags/rabbit-mq-4-0)). The MPL-2.0 license is unchanged. Alexis Richardson, in March 2025: "Broadcom is still employing RabbitMQ people. You can go and buy Broadcom RabbitMQ today… It's challenging Kafka in lots of ways" ([https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)). [GitHub + 4](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)
- **OASIS AMQP TC.** Continues to maintain claims-based-security extensions (CBS), filter expressions, etc., but the core 1.0 spec is unchanged since 2012.

---

## How it actually works

AMQP 0-9-1 and AMQP 1.0 are two different protocols sharing a name. We cover both.

### AMQP 0-9-1 wire model

**Protocol header.** Every connection starts with the client sending the 8-byte literal `'A','M','Q','P', 0, 0, 9, 1` ([https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf)). If the server doesn't speak that version, it replies with its preferred header and closes; the client may retry.

**Frame layout (0-9-1).** Every frame is:

```
0       1         3             7        size+7  size+8
+-------+---------+-------------+--...---+--------+
| type  | channel | size        | payload| 0xCE   |
+-------+---------+-------------+--...---+--------+
 octet   short     long          variable octet
```

That's: 1-byte type, 2-byte channel number, 4-byte payload size, payload, 1-byte frame-end sentinel `0xCE`. ([https://www.squaremobius.net/2013/11/12/amqp-codec-in-js.html](https://www.squaremobius.net/2013/11/12/amqp-codec-in-js.html), [https://www.rabbitmq.com/amqp-0-9-1-errata](https://www.rabbitmq.com/amqp-0-9-1-errata), [https://www.brianstorti.com/speaking-rabbit-amqps-frame-structure/](https://www.brianstorti.com/speaking-rabbit-amqps-frame-structure/).) The `0xCE` is a literal sentinel; if the byte after `size` bytes is anything else, the connection is broken and must be torn down.

**Frame types.** 1 = method, 2 = header (content header for messages), 3 = body (raw bytes of the payload), 4 (PDF) / 8 (XML) = heartbeat — note the spec inconsistency RabbitMQ documented at [https://www.rabbitmq.com/amqp-0-9-1-errata](https://www.rabbitmq.com/amqp-0-9-1-errata). [RabbitMQ](https://www.rabbitmq.com/amqp-0-9-1-errata)

**Connection negotiation (synchronous methods).**

```
C: AMQP\0\0\9\1                          (protocol header)
S: Connection.Start (server-properties, mechanisms, locales)
C: Connection.Start-Ok (client-properties, "PLAIN", credentials, "en_US")
S: Connection.Tune (channel-max, frame-max, heartbeat)
C: Connection.Tune-Ok (final values)
C: Connection.Open (vhost)
S: Connection.Open-Ok
```

(See AMQP 0-9-1 reference, [https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/docs/amqp-0-9-1-reference.md](https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/docs/amqp-0-9-1-reference.md).) `Tune` negotiates limits — channel-max, frame-max (largest single frame), heartbeat (in seconds, 0 disables). After `Open-Ok` the connection is live.

**Channel multiplexing.** All subsequent work happens on numbered channels (1..channel-max) carved out of the one TCP socket. `Channel.Open / Channel.Open-Ok` opens one. Channels are *not* threads — they are independent sequences of synchronous and asynchronous methods. A common anti-pattern is opening a channel per published message: each open is round-trip work and creates an Erlang process inside the broker.

**The AMQ model entities.** Once channels are open, the typical session declares topology and publishes/consumes:

- `Exchange.Declare(name, type, durable, …)` — type ∈ {direct, fanout, topic, headers}
- `Queue.Declare(name, durable, exclusive, auto-delete, …)`
- `Queue.Bind(queue, exchange, routing-key, args)`
- `Basic.Publish(exchange, routing-key, mandatory, immediate)` followed by a content-header frame and one or more body frames
- `Basic.Consume(queue, consumer-tag, no-ack, exclusive, …)` → server pushes `Basic.Deliver` frames followed by header + body
- `Basic.Ack / Basic.Nack / Basic.Reject` for explicit acknowledgments
- `Basic.Qos(prefetch-size, prefetch-count, global)` — sets back-pressure window

**Exchange types (0-9-1).**

- *Direct* — exact match on routing key. Used for work-queue patterns. [LinkedIn](https://www.linkedin.com/pulse/rabbitmq-features-architecture-huzaifa-asif)
- *Fanout* — copy to every bound queue, ignore routing key. Used for broadcast.
- *Topic* — wildcard match (`.` separates words; `*` = one word, `#` = zero or more). E.g. binding `orders.*.eu` matches `orders.book.eu` but not `orders.book.eu.priority`.
- *Headers* — match on a map of arguments instead of routing key.

([https://medium.com/@samuelowino/advanced-message-queueing-protocol-ampq-0-9-1-617209d2d6ec](https://medium.com/@samuelowino/advanced-message-queueing-protocol-ampq-0-9-1-617209d2d6ec), [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts).)

**Acknowledgments and reliability.**

- *Consumer ack modes:* automatic (broker drops the message after `basic.deliver`) or explicit (`basic.ack`/`basic.nack`/`basic.reject`). With explicit acks the message stays in an unacked state until the consumer confirms. ([https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts))
- *Publisher confirms* (RabbitMQ extension): after `confirm.select`, the broker sends `basic.ack`/`basic.nack` for each message it accepts/rejects.
- *Transactions* (`tx.select / tx.commit / tx.rollback`) batch publishes and acks atomically per-queue, but the spec warns "transactions that cover multiple queues may be non-atomic" — and they are 100x slower than publisher confirms in practice ([https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/docs/amqp-0-9-1-reference.md](https://github.com/rabbitmq/amqp-0.9.1-spec/blob/main/docs/amqp-0-9-1-reference.md)).

**Heartbeats.** Negotiated in `Connection.Tune`. Both sides MUST send a heartbeat frame at least every `heartbeat` seconds; if a peer sees no traffic for 2 × heartbeat, the connection is dead. [https://www.rabbitmq.com/amqp-0-9-1-errata](https://www.rabbitmq.com/amqp-0-9-1-errata)

**Error handling.** AMQP 0-9-1 has *channel exceptions* (close one channel, e.g. publishing to a non-existent exchange — reply code 404) and *connection exceptions* (kill the connection, e.g. frame error 501, syntax error 502). After a channel/connection close the peer must wait for the corresponding `*-Ok`.

### AMQP 1.0 wire model

AMQP 1.0 is *not* an upgrade. It is a "completely different messaging protocol" ([https://www.rabbitmq.com/amqp-0-9-1-protocol](https://www.rabbitmq.com/amqp-0-9-1-protocol)). Major shifts:

- **Symmetric peer-to-peer.** "AMQP does not define a wire-level distinction between 'clients' and 'brokers', the protocol is symmetric" ([https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)). [OASIS Open](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html)
- **Three nested abstractions.** Connection → Session → Link. A *session* "correlates two unidirectional channels to form a bidirectional, sequential conversation"; a *link* is unidirectional and carries messages between *termini* (a *source* or *target*, opaque to the protocol). [OASIS Open](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-transport-v1.0.html)
- **Credit-based flow control.** A receiver issues *link credit* via `flow` performatives; the sender may transfer that many messages and no more. This replaces 0-9-1's prefetch-count.
- **AMQP type system.** Self-describing primitive types (booleans, integers, floats, timestamps, UUIDs, strings, binary, symbols, lists, maps, arrays). The killer feature is the *described type*: any AMQP type can be tagged with a *descriptor* (a symbol or a `ulong`), turning it into a "described type" — the basis of all extensibility ([https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html)). [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)
- **Zero exchanges/queues in the spec.** AMQP 1.0 says nothing about how a broker routes; it only describes how two peers transfer messages over links to opaque targets. As Alexis Richardson noted, "If you read AMQP 1.0, it's called Advanced Message Queue Protocol, but there are no queues in it" ([https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)). [RedMonk](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)

**Frame format (1.0).** 8-byte header followed by an extended header and a frame body:

```
+0     +1    +2     +3
+-----------------------+
| SIZE                  |   uint32, total frame size
+-----------------------+
| DOFF | TYPE | CHANNEL |   doff = data offset in 4-byte units; type 0 = AMQP, 1 = SASL
+-----------------------+
| extended header (DOFF*4 - 8 bytes, ignored)             |
+---------------------------------------------------------+
| performative + payload                                  |
+---------------------------------------------------------+
```

([https://qpid.apache.org/amqp/type-reference.html](https://qpid.apache.org/amqp/type-reference.html), [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html).) Notice: no frame-end sentinel — `SIZE` is authoritative. The frame body is "a performative followed by an opaque payload"; the performative is encoded as a *described list* in the type system. [DZone](https://dzone.com/refcardz/amqp-essentials)[Amqp](https://www.amqp.org/sites/amqp.org/files/amqp.pdf)

**Protocol header (1.0).** "AMQP" + protocol-id + major + minor + revision. Three protocol-ids exist: `0` (AMQP), `2` (TLS), `3` (SASL). A typical handshake:

```
C: AMQP 3 1 0 0     (let's start SASL)
S: AMQP 3 1 0 0
S: SASL-MECHANISMS frame
C: SASL-INIT (mechanism, response)
S: SASL-OUTCOME
C: AMQP 0 1 0 0     (now switch to AMQP)
S: AMQP 0 1 0 0
C: open performative
S: open
C: begin (start session on channel N)
S: begin
C: attach (create link "name", role=sender, source=…, target=/queues/orders)
S: attach
S: flow (link-credit=200)
C: transfer (delivery-id=1, payload bytes…)
S: disposition (first=1, last=1, state=accepted, settled=true)
…
C: detach
C: end
C: close
```

(See [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html), [https://qpid.apache.org/amqp/type-reference.html](https://qpid.apache.org/amqp/type-reference.html), [https://dzone.com/refcardz/amqp-essentials](https://dzone.com/refcardz/amqp-essentials).)

**Performatives, in detail.** `open` carries connection capabilities and idle-timeout (the 1.0 equivalent of heartbeat). `begin` opens a session. `attach` creates a link with a `name`, a `handle` (numeric id within the session), a role (sender/receiver), and source/target termini. `flow` sets link-credit and other flow state. `transfer` carries one message (large messages can be split across multiple transfers; `more=true` indicates more frames to come). `disposition` updates the *delivery state* — terminal outcomes are `accepted`, `rejected`, `released`, `modified`. `detach`, `end`, `close` reverse the open sequence. ([https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html), [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-complete-v1.0-os.pdf](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-complete-v1.0-os.pdf) section 2.7.) [OASIS Open](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html)

**Settlement and QoS.** A *settled* delivery means the sender no longer tracks state. With unsettled deliveries, the receiver returns `disposition` to confirm processing. The combination of settle-mode and disposition gives at-most-once, at-least-once, and (with idempotency) exactly-once.

**SASL and TLS.** "AMQP… provides flow controlled, message-oriented communication with message-delivery guarantees… and authentication and/or encryption based on SASL and/or TLS" ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). The Microsoft guide makes the operational pattern explicit: connect on 5671 with TLS first, *or* connect on 5672 and the server "immediately offers a mandatory upgrade of connection to TLS using the AMQP-prescribed model" (protocol-id = 2, then renegotiate). After TLS, SASL announces mechanisms (PLAIN, EXTERNAL, ANONYMOUS, OAUTHBEARER, GSSAPI, SCRAM, …). PLAIN sends `\0username\0password` and is safe only inside TLS. ([https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html), [https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide).) [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**Comparing the two.**

| Aspect | AMQP 0-9-1 | AMQP 1.0 |
|---|---|---|
| Year frozen | 2008 | 2012 (OASIS), 2014 (ISO) |
| Topology in spec? | Yes (exchanges, queues, bindings) | No (opaque sources/targets) |
| Frame end | byte `0xCE` sentinel | `SIZE` field only |
| Roles | Asymmetric (client / broker) | Symmetric peer-to-peer |
| Session abstraction | Channel | Connection→Session→Link |
| Flow control | `basic.qos` prefetch | Link credit (per link) |
| Type system | 4 ad-hoc encodings ([https://www.squaremobius.net/2013/11/12/amqp-codec-in-js.html](https://www.squaremobius.net/2013/11/12/amqp-codec-in-js.html)) | Single self-describing type system w/ described types |
| Standards body | AMQP Working Group (frozen) | OASIS, ISO/IEC 19464:2014 |

### Mermaid sequence diagram

(Mermaid renders inline in many docs platforms; if not supported, the text alone reads as a labelled sequence.)

Broker (RabbitMQ)ClientBroker (RabbitMQ)Client#mermaid-rf7{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rf7 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rf7 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rf7 .error-icon{fill:#CC785C;}#mermaid-rf7 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rf7 .edge-thickness-normal{stroke-width:1px;}#mermaid-rf7 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rf7 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rf7 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rf7 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rf7 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rf7 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rf7 .marker.cross{stroke:#A1A1A1;}#mermaid-rf7 svg{font-family:inherit;font-size:16px;}#mermaid-rf7 p{margin:0;}#mermaid-rf7 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rf7 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf7 .actor-line{stroke:#A1A1A1;}#mermaid-rf7 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rf7 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rf7 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rf7 .sequenceNumber{fill:#5e5e5e;}#mermaid-rf7 #sequencenumber{fill:#E5E5E5;}#mermaid-rf7 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rf7 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rf7 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rf7 .labelText,#mermaid-rf7 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf7 .loopText,#mermaid-rf7 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf7 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rf7 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rf7 .noteText,#mermaid-rf7 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf7 .activation0{fill:transparent;stroke:#00000000;}#mermaid-rf7 .activation1{fill:transparent;stroke:#00000000;}#mermaid-rf7 .activation2{fill:transparent;stroke:#00000000;}#mermaid-rf7 .actorPopupMenu{position:absolute;}#mermaid-rf7 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rf7 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rf7 .actor-man circle,#mermaid-rf7 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rf7 :root{--mermaid-font-family:inherit;}TCP connect to :5672Heartbeats every 60s (empty frames)TCP FINAMQP\0\0\9\1   (protocol header)1Connection.Start (mechanisms="PLAIN", locales="en_US")2Connection.Start-Ok (PLAIN, "\0user\0pass")3Connection.Tune (channel-max=2047, frame-max=131072, heartbeat=60)4Connection.Tune-Ok (same or lower)5Connection.Open (vhost="/")6Connection.Open-Ok7Channel.Open (channel=1)8Channel.Open-Ok9Queue.Declare (queue="orders", durable=true)10Queue.Declare-Ok (queue, msg-count, consumer-count)11Exchange.Declare (exchange="orders.x", type="topic", durable=true)12Exchange.Declare-Ok13Queue.Bind (queue="orders", exchange="orders.x", routing-key="orders.eu.14Queue.Bind-Ok15Confirm.Select16Confirm.Select-Ok17Basic.Publish (exchange="orders.x", routing-key="orders.eu.priority")18Content-Header frame (class=Basic, body-size=128, props…)19Body frame (128 bytes payload)20Basic.Ack (delivery-tag=1, multiple=false)21Basic.Consume (queue="orders", consumer-tag="ct-1", no-ack=false)22Basic.Consume-Ok23Basic.Deliver + Header + Body24Basic.Ack (delivery-tag=42)25Channel.Close (200, "OK")26Channel.Close-Ok27Connection.Close (200, "OK")28Connection.Close-Ok29

---

## Deep connections to other protocols

**TCP.** AMQP runs *on top of* TCP. The AMQP spec assumes "an underlying reliable transport layer protocol such as Transmission Control Protocol (TCP)" ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). Heartbeats and idle-timeouts exist *because* TCP's keepalive is unreliable across NATs and firewalls. [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**TLS.** AMQP runs *over* TLS in two flavours: implicit (port 5671 — TCP→TLS→AMQP) and STARTTLS-style upgrade (the "AMQP-prescribed model" with protocol-id 2). Cert validation and SNI follow standard TLS. ([https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html).)

**WebSocket.** A complementary tunneling. Microsoft's Azure Service Bus uses "AMQP WebSockets binding [that] creates a tunnel over TCP port 443 that is then equivalent to AMQP 5671 connections" ([https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide)). RabbitMQ 4.1 added native AMQP 1.0 over WebSocket ([https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)). [Microsoft Learn](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide)

**MQTT.** A different protocol, *not* a subset. MQTT is purpose-built for IoT: 2-byte fixed headers, no exchanges or routing keys (only topic strings), three QoS levels, last-will and retained messages. AMQP 1.0 and MQTT 5 *coexist* — AMQP for backend integration, MQTT for constrained devices — and modern brokers like RabbitMQ speak both natively. "MQTT is lighter, simpler, and purpose-built for IoT" ([https://www.hivemq.com/blog/mqtt-vs-amqp-for-iot/](https://www.hivemq.com/blog/mqtt-vs-amqp-for-iot/), [https://www.emqx.com/en/blog/mqtt-vs-amqp-for-iot-communications](https://www.emqx.com/en/blog/mqtt-vs-amqp-for-iot-communications)). [IoT For All + 2](https://www.iotforall.com/mqtt-vs-amqp-for-iot-communications-head-to-head)

**STOMP.** Streaming Text-Oriented Messaging Protocol. ASCII-framed, deliberately simple, uses JMS-like "destinations". It complements AMQP for browser-based and scripting clients; RabbitMQ supports STOMP via plugin ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). [VMware Blogs](https://blogs.vmware.com/tanzu/native-amqp-1-0/)

**SASL.** AMQP 1.0 directly *embeds* SASL frames (protocol-id 3) for pluggable authentication; AMQP 0-9-1 negotiates mechanisms inside `Connection.Start` but only really uses PLAIN, AMQPLAIN, and EXTERNAL in the wild ([https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html), [https://swenotes.com/2025/09/27/simple-authentication-and-security-layer-sasl-a-practical-guide/](https://swenotes.com/2025/09/27/simple-authentication-and-security-layer-sasl-a-practical-guide/)).

**XMPP.** The Extensible Messaging and Presence Protocol — XML-based, designed for instant messaging and presence. Conceptually shares "stanzas vs. frames" but the wire model and use cases barely overlap. Listed in Wikipedia's AMQP article as an alternative wire protocol for messaging ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**JMS.** A *Java API*, not a wire protocol. Pre-AMQP, every JMS broker shipped its own bytes; the API hid that. AMQP was explicitly designed to fix that ("Unlike JMS, which defines an API and a set of behaviors that a messaging implementation must provide, AMQP is a wire-level protocol." [https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). The Apache Qpid JMS library presents a JMS API but speaks AMQP 1.0 on the wire ([https://qpid.apache.org/components/index.html](https://qpid.apache.org/components/index.html)). [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

**Kafka protocol.** An entirely different binary protocol over TCP, built around a *replicated commit log*. Kafka's append-only model and consumer-offset semantics are very different from AMQP queues. RabbitMQ Streams (since 3.9) brings Kafka-like log semantics into the RabbitMQ ecosystem with a separate binary stream protocol on ports 5552/5551 ([https://www.rabbitmq.com/docs/streams](https://www.rabbitmq.com/docs/streams), [https://www.rabbitmq.com/docs/networking](https://www.rabbitmq.com/docs/networking)). Kafka outperforms RabbitMQ on raw throughput; RabbitMQ wins on routing flexibility and per-message latency ([https://www.confluent.io/blog/kafka-fastest-messaging-system/](https://www.confluent.io/blog/kafka-fastest-messaging-system/), [https://quix.io/blog/apache-kafka-vs-rabbitmq-comparison](https://quix.io/blog/apache-kafka-vs-rabbitmq-comparison)).

**NATS.** Simpler text-based pub/sub protocol; lower latency, less reliability machinery than AMQP. Shares philosophical lineage with ZeroMQ (lightweight, opinionated). Different ecosystem.

**gRPC.** Request/response RPC over HTTP/2. Different problem domain — synchronous call/response with streaming, not durable async messaging. Sometimes layered as a *front* to an AMQP-driven backend.

**ZeroMQ.** *The* sibling project. Pieter Hintjens, frustrated with AMQP, co-created ZeroMQ at iMatix in 2007. ZeroMQ is a brokerless library (no server!), implementing patterns (REQ/REP, PUB/SUB, PUSH/PULL) directly in clients. It is intentionally not a standard protocol and not interoperable across vendors — the inverse trade of AMQP. ([https://en.wikipedia.org/wiki/Pieter_Hintjens](https://en.wikipedia.org/wiki/Pieter_Hintjens).) [Wikipedia](https://en.wikipedia.org/wiki/Pieter_Hintjens)

**HTTP/2.** Interesting comparison: both multiplex many "streams"/"channels" over one TCP connection, both use binary framing. HTTP/2 streams are bidirectional half-duplex with priority and flow control; AMQP 0-9-1 channels are similar in spirit but predate HTTP/2. AMQP 1.0's link-credit flow control and HTTP/2's WINDOW_UPDATE solve the same problem.

**QUIC.** UDP-based transport with built-in TLS and stream multiplexing. AMQP could in principle run over QUIC (the spec only requires "a reliable, ordered transport"), but mainstream brokers do not yet do so [needs source for any production AMQP-over-QUIC deployment].

**Apache Pulsar's binary protocol.** Pulsar uses its own protobuf-encoded binary protocol over TCP — closer in spirit to Kafka than AMQP. Pulsar can speak AMQP via the Starlight/AOP plugin, but it is not native.

---

## Real-world deployment

### Brokers

- **RabbitMQ** (Erlang). The most popular AMQP 0-9-1 broker; native AMQP 1.0 since 4.0 (Sept 2024). MPL-2.0 licensed ([https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy](https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy)). 13.6k stars on GitHub ([https://github.com/rabbitmq/rabbitmq-server](https://github.com/rabbitmq/rabbitmq-server)). Erlang choice: "RabbitMQ is built in Erlang OTP programming language, a technology tailored for building stable, reliable, fault tolerant and highly scalable systems" ([https://www.erlang-solutions.com/blog/an-introduction-to-rabbitmq-what-is-rabbitmq/](https://www.erlang-solutions.com/blog/an-introduction-to-rabbitmq-what-is-rabbitmq/)). Original Rabbit team's design talk: 5,000 LOC because "the domain of discourse of AMQP is very similar to Erlang/OTP" ([https://www.rabbitmq.com/resources/erlang-exchange-talk-final/ex](https://www.rabbitmq.com/resources/erlang-exchange-talk-final/ex)). [GitHub + 2](https://github.com/rabbitmq/rabbitmq-server/security/advisories)
- **Apache Qpid.** Two brokers — Broker-J (Java) and the legacy C++ broker — plus *Proton*, a low-level AMQP 1.0 toolkit in C, C++, Python, Ruby, .NET ([https://qpid.apache.org/proton/](https://qpid.apache.org/proton/), [https://qpid.apache.org/releases/qpid-broker-j-9.1.0/book/Java-Broker-Introduction.html](https://qpid.apache.org/releases/qpid-broker-j-9.1.0/book/Java-Broker-Introduction.html)). Broker-J supports *all* AMQP versions (0-8 through 1.0) plus automatic translation between them. [Apache Qpid + 2](https://qpid.apache.org/releases/qpid-broker-j-9.1.0/book/Java-Broker-Introduction.html)
- **Apache ActiveMQ Artemis.** AMQP 1.0 + OpenWire + STOMP + MQTT in one Java broker. Used in Red Hat AMQ Broker ([https://docs.redhat.com/en/documentation/red_hat_amq_broker/7.11/html/configuring_amq_broker/assembly-br-securing-brokers_configuring](https://docs.redhat.com/en/documentation/red_hat_amq_broker/7.11/html/configuring_amq_broker/assembly-br-securing-brokers_configuring)).
- **Microsoft Azure Service Bus.** "The Azure Service Bus cloud service uses the AMQP 1.0 as its primary means of communication" ([https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview)). [Microsoft Learn](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-overview)
- **IBM MQ.** Speaks its own proprietary protocol natively but exposes AMQP 1.0 channels for interop.
- **Solace PubSub+.** Commercial multi-protocol broker; AMQP 1.0 supported; was on the AMQP working group as Solace Systems ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)
- **StormMQ.** AMQP 0-9-1 broker; another working-group member.
- **LavinMQ.** A newer C++/Crystal AMQP 0-9-1 broker focused on millions of connections ([https://lavinmq.com/blog/the-amqp-091-protocol](https://lavinmq.com/blog/the-amqp-091-protocol)).

### Client libraries

- **pika** (Python, MIT-licensed; [https://github.com/pika/pika](https://github.com/pika/pika)) — the canonical AMQP 0-9-1 client.
- **amqplib** (Node.js; [https://www.squaremobius.net/2013/11/12/amqp-codec-in-js.html](https://www.squaremobius.net/2013/11/12/amqp-codec-in-js.html)).
- **RabbitMQ Java client** (`com.rabbitmq:amqp-client`) and the new RabbitMQ AMQP 1.0 Java + .NET clients introduced with 4.0 ([https://blogs.vmware.com/tanzu/introducing-vmware-tanzu-rabbitmq-4-0/](https://blogs.vmware.com/tanzu/introducing-vmware-tanzu-rabbitmq-4-0/)).
- **Bunny** (Ruby), **amqp-client** (.NET), **amqp091-go** (Go) — all 0-9-1.
- **Qpid Proton** for AMQP 1.0 in C/C++/Python/.NET ([https://qpid.apache.org/proton/](https://qpid.apache.org/proton/)).

### Who uses it at scale

- **JPMorgan Chase** — origin user; the first production deployment in 2006 served 2,000 traders and 300 million messages/day ([https://queue.acm.org/detail.cfm?id=1255424](https://queue.acm.org/detail.cfm?id=1255424)).
- **Goldman Sachs, Bank of America, Barclays, Credit Suisse, Deutsche Börse** — working-group members and users.
- **Instagram** — used RabbitMQ for feed delivery via Celery ([https://blogs.vmware.com/tanzu/how-instagram-feeds-work-celery-and-rabbitmq.html](https://blogs.vmware.com/tanzu/how-instagram-feeds-work-celery-and-rabbitmq.html), referenced via [https://groups.google.com/g/rabbitmq-users/c/_EaWdosorac](https://groups.google.com/g/rabbitmq-users/c/_EaWdosorac)).
- **Reddit, NY Times, Trivago, 500px** — RabbitMQ users ([https://groups.google.com/g/rabbitmq-users/c/_EaWdosorac](https://groups.google.com/g/rabbitmq-users/c/_EaWdosorac)). [Google Groups](https://groups.google.com/g/rabbitmq-users/c/_EaWdosorac)
- **NASA, CERN, Cisco, Microsoft, Samsung, Spotify** — listed as ZeroMQ users; many also use RabbitMQ/AMQP for adjacent workloads ([https://sdtimes.com/code-editor/sd-times-blog-zeromq-founder-pieter-hintjens-dies/](https://sdtimes.com/code-editor/sd-times-blog-zeromq-founder-pieter-hintjens-dies/)).
- **MapQuest** uses RabbitMQ topics to fan out updates to "tens of millions of users" ([https://www.cloudamqp.com/blog/when-to-use-rabbitmq-or-apache-kafka.html](https://www.cloudamqp.com/blog/when-to-use-rabbitmq-or-apache-kafka.html)). [CloudAMQP](https://www.cloudamqp.com/blog/when-to-use-rabbitmq-or-apache-kafka.html)
- The European Space Agency, Mozilla, AT&T are widely cited as RabbitMQ users [needs source for current scale figures].

### Performance numbers (verified)

- **VMware/Pivotal + Google Compute Engine, 2014:** a 30-node RabbitMQ cluster sustained "more than one million messages per second… (a sustained combined ingress/egress of over two million messages per second)" ([https://blogs.vmware.com/tanzu/rabbitmq-hits-one-million-messages-per-second-on-google-compute-engine/](https://blogs.vmware.com/tanzu/rabbitmq-hits-one-million-messages-per-second-on-google-compute-engine/)). [VMware Blogs](https://blogs.vmware.com/tanzu/rabbitmq-hits-one-million-messages-per-second-on-google-compute-engine/)
- **RabbitMQ team's own 4.0 benchmarks (Aug 2024):** on an Intel NUC (8 cores, 32 GB RAM), 99,413 msg/s for native AMQP 1.0 classic queues, 88,534 msg/s for AMQP 0.9.1; native AMQP 1.0 cuts memory use by ~56% vs. the 3.13 plugin ([https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks](https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks)). [RabbitMQ](https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks)
- **DanubeData (April 2026):** 120 K+ msg/s on managed infra with publisher confirms enabled ([https://danubedata.ro/blog/rabbitmq-performance-benchmarks-120k-messages-per-second-2026](https://danubedata.ro/blog/rabbitmq-performance-benchmarks-120k-messages-per-second-2026)).
- **PerfTest defaults:** "RabbitMQ Java client can achieve high rates for publishing (up to 80 to 90 K messages per second per connection)" with safety measures disabled ([https://perftest.rabbitmq.com/](https://perftest.rabbitmq.com/)). [Rabbitmq](https://perftest.rabbitmq.com/)
- **Confluent's contested study (2020):** found RabbitMQ "could not drive a throughput higher than 38 K messages/s" with mirrored queues at p99 ≈ 1 ms ([https://www.confluent.io/blog/kafka-fastest-messaging-system/](https://www.confluent.io/blog/kafka-fastest-messaging-system/)) — methodology was disputed by the RabbitMQ team and is now moot since mirrored queues were removed in 4.0. [Confluent](https://www.confluent.io/blog/kafka-fastest-messaging-system/)
- **Memory rule of thumb:** "Allocate 1 GB of RAM per 10,000 connections or queues" ([https://devopsdaily.eu/articles/2024/calculating-hardware-requirements-for-rabbitmq/](https://devopsdaily.eu/articles/2024/calculating-hardware-requirements-for-rabbitmq/)). [Devopsdaily](https://devopsdaily.eu/articles/2024/calculating-hardware-requirements-for-rabbitmq/)

### Topologies

- **Clustering** — multiple Erlang nodes form one logical broker; metadata is replicated via Mnesia (≤ 4.1) or Khepri (≥ 4.2 default). Messages pass through cluster nodes for delivery.
- **Classic mirrored queues** — *removed* in RabbitMQ 4.0. They had a homegrown replication algorithm prone to split-brain ([https://www.rabbitmq.com/docs/3.13/ha](https://www.rabbitmq.com/docs/3.13/ha)).
- **Quorum queues** — Raft-replicated; "30 000 message throughput (using 1 kb messages)… replicating data to all 3 nodes in a cluster", three times mirrored-queue throughput ([https://www.rabbitmq.com/docs/3.13/migrate-mcq-to-qq](https://www.rabbitmq.com/docs/3.13/migrate-mcq-to-qq)). [RabbitMQ](https://www.rabbitmq.com/docs/3.13/migrate-mcq-to-qq)
- **Streams** — append-only logs, non-destructive consume ([https://www.rabbitmq.com/docs/streams](https://www.rabbitmq.com/docs/streams)).
- **Federation / Shovel** — loose-coupled message movement across clusters / brokers, used for geo-distribution.

---

## Failure modes and famous incidents

### Concrete CVEs

- **CVE-2023-46118** (RabbitMQ server, Oct 2023, CVSS 4.9): "HTTP API did not enforce an HTTP request body limit, making it vulnerable for denial of service (DoS) attacks with very large messages." Patched in 3.11.24 / 3.12.7. [https://nvd.nist.gov/vuln/detail/cve-2023-46118](https://nvd.nist.gov/vuln/detail/cve-2023-46118), [https://www.cvedetails.com/cve/CVE-2023-46118/](https://www.cvedetails.com/cve/CVE-2023-46118/) [SUSE](https://www.suse.com/security/cve/CVE-2023-46118.html)[SUSE](https://www.suse.com/security/cve/CVE-2023-46118.html)
- **CVE-2023-46120** (RabbitMQ Java client, Oct 2023, CVSS 4.9): no message size limit in `maxBodyLength` lets a remote attacker cause OOM in consumers. Patched in 5.18.0 (and 5.14.3 / 5.16.1 / 5.17.1 backports). [https://security.snyk.io/vuln/SNYK-JAVA-COMRABBITMQ-6028124](https://security.snyk.io/vuln/SNYK-JAVA-COMRABBITMQ-6028124) [IBM](https://www.ibm.com/support/pages/security-bulletin-vulnerability-rabbitmq-java-client-affects-ibm-watsonxdata)[Snyk](https://security.snyk.io/vuln/SNYK-JAVA-COMRABBITMQ-6028124)
- **CVE-2022-31008** (RabbitMQ shovel/federation, June 2022, CVSS 5.5): Predictable seed in URI obfuscation — under exception conditions, "reasonably easily deobfuscatable data could appear in the node log." Patched in 3.10.2 / 3.9.18 / 3.8.32. [https://www.suse.com/security/cve/CVE-2022-31008.html](https://www.suse.com/security/cve/CVE-2022-31008.html) [CVE Details + 4](https://www.cvedetails.com/cve/CVE-2022-31008/)
- **CVE-2024-51988** (RabbitMQ, listed in [https://securityvulnerability.io/vendor/rabbitmq/latest-vulnerabilities](https://securityvulnerability.io/vendor/rabbitmq/latest-vulnerabilities)) — details are sparsely documented at the source.
- **CVE-2025-30219**, **CVE-2025-50200** (RabbitMQ server, 2025, CVSS 6.1 and 6.7): listed in [https://securityvulnerability.io/vendor/rabbitmq/latest-vulnerabilities](https://securityvulnerability.io/vendor/rabbitmq/latest-vulnerabilities); specifics behind each not detailed in the snippets — readers should consult NVD directly.
- **GHSA-pj33-75x5-32j4** (Nov 2024, moderate): "HTTP API's queue deletion endpoint does not verify that the user has a required permission" ([https://github.com/rabbitmq/rabbitmq-server/security/advisories](https://github.com/rabbitmq/rabbitmq-server/security/advisories)). [GitHub](https://github.com/rabbitmq/rabbitmq-server/security/advisories)
- **GHSA-g58g-82mw-9m3p** (March 2025, moderate): XSS in management UI error message (same source). [GitHub](https://github.com/rabbitmq/rabbitmq-server/security/advisories)
- **GHSA-gh3x-4x42-fvq8** (June 2025, moderate): Node can log Basic Auth header from an HTTP request (same source). [GitHub](https://github.com/rabbitmq/rabbitmq-server/security/advisories)
- **CVE-2025-32433** (Erlang/OTP SSH, CVSS 10.0): unauthenticated RCE in Erlang's SSH server. **Not exploitable in RabbitMQ** because RabbitMQ's distributed Erlang packages exclude the SSH library — the team published an explicit non-affected statement ([https://www.rabbitmq.com/blog/2025/04/24/rabbitmq-is-not-affected-by-cve-2025-32433](https://www.rabbitmq.com/blog/2025/04/24/rabbitmq-is-not-affected-by-cve-2025-32433)). [Broadcom](https://knowledge.broadcom.com/external/article/406230/impact-of-cve202532433-cve202522868-on.html)[Broadcom](https://knowledge.broadcom.com/external/article/406230/impact-of-cve202532433-cve202522868-on.html)
- **CVE-2015-8786** [needs source — appeared in the prompt as an example but is not specifically about RabbitMQ in any of the consulted indexes; treat as illustrative not factual].
- **Older notable**: CVE-2020-36282 (RabbitMQ JMS Client, CVSS 9.8), CVE-2019-18609 (rabbitmq-c, CVSS 9.8) ([https://securityvulnerability.io/vendor/rabbitmq/latest-vulnerabilities](https://securityvulnerability.io/vendor/rabbitmq/latest-vulnerabilities)). [Securityvulnerability](https://securityvulnerability.io/vendor/rabbitmq/latest-vulnerabilities)

### Famous outages and post-mortems

- **Alvaro Videla's "RabbitMQ Chat Post Mortem" (May 2011)** is one of the earliest publicly documented load tests of RabbitMQ: a single default-configured RabbitMQ instance survived a Reddit-driven flood, "routing more than 5000 messages per second using 86 MB of RAM" with 7,000 visitors in a day ([https://alvaro-videla.com/2011/05/rabbitmq-chat-post-mortem.html](https://alvaro-videla.com/2011/05/rabbitmq-chat-post-mortem.html)). [Alvaro-videla](https://alvaro-videla.com/2011/05/rabbitmq-chat-post-mortem.html)
- **Medium (July 2025) — "When RabbitMQ Goes Dark":** a real production-outage post-mortem teaching five lessons that recur in nearly every public incident: public Bitnami container images can be deleted from the registry causing ImagePullBackOff; a single StatefulSet replica = SPOF; CPU/memory metrics aren't enough — track queue depth, unacked messages, channel count; alert on pod restarts; build runbooks ([https://medium.com/@pandey.pradhyuman139/when-rabbitmq-goes-dark-5-critical-lessons-from-a-production-outage-46443081aa15](https://medium.com/@pandey.pradhyuman139/when-rabbitmq-goes-dark-5-critical-lessons-from-a-production-outage-46443081aa15)). [Medium](https://medium.com/@pandey.pradhyuman139/when-rabbitmq-goes-dark-5-critical-lessons-from-a-production-outage-46443081aa15)
- **Reddit's well-known pre-2018 outages frequently involved their RabbitMQ-based message queue layer**; primary public sources for the queue specifically are sparse [needs source for a named, dated Reddit RabbitMQ post-mortem]. Reddit's later October-2023 outage (5 hours) was about Kubernetes/networking, *not* RabbitMQ ([https://github.com/danluu/post-mortems](https://github.com/danluu/post-mortems)).
- **GitHub incidents involving message queues** are documented in their status history but a *named* AMQP-specific post-mortem from GitHub is not in the consulted public index [needs source for a named GitHub AMQP/RabbitMQ outage].
- **Mirrored-queue split-brain** is the most famous *class* of failure — leading directly to RabbitMQ deprecating and removing them. CloudAMQP's customer-data analysis is blunt: "we've even seen scenarios with our customers where RabbitMQ does not trigger the configured partition handling strategy at all even when there is a netsplit. Such scenarios usually require some human intervention, like a node redeploy" ([https://www.cloudamqp.com/blog/from-mnesia-to-khepri-part1.html](https://www.cloudamqp.com/blog/from-mnesia-to-khepri-part1.html)).
- **A representative real user thread, "Yet another RabbitMQ cluster crash"** ([https://groups.google.com/g/rabbitmq-users/c/blUwCWpqi5M](https://groups.google.com/g/rabbitmq-users/c/blUwCWpqi5M)), captures the operational pain of running mirrored queues on Windows in 2020-2021 — a major reason behind quorum queues and Khepri.

### Common pitfalls

- **Unbounded queues.** No `x-max-length` policy → backlog → broker OOM.
- **Poison messages.** Consumer keeps NACK-ing the same message which gets requeued forever. RabbitMQ 4.0 default of 20 redeliveries on quorum queues directly addresses this ([https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md)).
- **Mirrored-queue split-brain** (now obsolete; pre-4.0 only).
- **Connection / channel churn.** Opening a TCP connection or AMQP channel per message will make the broker miserable. "Reusing a channel — much more efficient" ([https://www.compilenrun.com/docs/middleware/rabbitmq/rabbitmq-advanced-topics/rabbitmq-protocol-analysis/](https://www.compilenrun.com/docs/middleware/rabbitmq/rabbitmq-advanced-topics/rabbitmq-protocol-analysis/)).
- **Default `guest:guest`** exposed remotely — see Practical Wisdom.
- **Prefetch = unlimited** (the default!) — one consumer hoovers the queue, others starve ([https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html](https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html)).
- **Mixing 0-9-1 and 1.0 features carelessly** — message headers don't translate cleanly across the two protocols within the same broker ([https://github.com/rabbitmq/rabbitmq-amqp1.0](https://github.com/rabbitmq/rabbitmq-amqp1.0)). [GitHub](https://github.com/rabbitmq/rabbitmq-amqp1.0)

---

## Fun facts and anecdotes

- **The trading-floor origin.** O'Hara's "two billion dollars in collateral calls" anecdote (above). The first production deployment served 2,000 users and 300 M msgs/day ([https://queue.acm.org/detail.cfm?id=1255424](https://queue.acm.org/detail.cfm?id=1255424)).
- **The 0xCE frame-end byte.** AMQP 0-9-1 ends every frame with the constant byte `0xCE`. There is no public design document explaining the choice [needs source for the rationale]. Engineers have speculated that it's distinctive enough to detect framing errors quickly, but the spec only mandates that the value be `%xCE` ([https://www.rabbitmq.com/amqp-0-9-1-errata](https://www.rabbitmq.com/amqp-0-9-1-errata)).
- **Default port 5672 / 5671.** 5672 is the IANA-registered AMQP port and 5671 is the AMQPS (TLS) port ([https://www.rabbitmq.com/docs/networking](https://www.rabbitmq.com/docs/networking)). The IANA service name for TLS is `amqps` and the port is "SECURE-PORT (5671)" per the OASIS security spec ([https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html](https://docs.oasis-open.org/amqp/core/v1.0/amqp-core-security-v1.0.html)). 5672 is *AMQP* spelled phonetically by way of nothing in particular [needs source for any official reasoning behind 5672 specifically]. [CloudAMQP](https://www.cloudamqp.com/docs/amqp.html)
- **Why Erlang for RabbitMQ.** "The domain of discourse of AMQP is very similar to Erlang/OTP… the actual implementation is identical to architecture… each of the nodes corresponds to a separate Erlang module, and process… ~5000 LOC" ([https://www.rabbitmq.com/resources/erlang-exchange-talk-final/ex](https://www.rabbitmq.com/resources/erlang-exchange-talk-final/ex)). Erlang's "let it crash" philosophy and OTP supervisors directly model AMQP's queue-as-process abstraction.
- **The "Advanced" in AMQP** refers to the goal of standing in for IBM MQ Series, TIBCO, and other "advanced" enterprise middleware — not to technical sophistication. The acronym was already taken by other queuing systems, so the working group prefixed "Advanced" ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)).
- **AMQP 1.0's described type for extensibility.** "A descriptor forms an association between a custom type, and an AMQP type… The resulting combination of the AMQP type and its descriptor is referred to as a described type… An application with no intimate knowledge can still understand the described types as AMQP types, decoding and processing them as such" ([https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html)). This is what lets new performatives, new outcomes, and vendor-specific message annotations be added without breaking interop. [OASIS Open](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-types-v1.0-os.html)
- **Pieter Hintjens' final tweet:** "I'm choosing euthanasia etd 1pm. I have no last words." ([https://twitter.com/hintjens/status/783254242052206592](https://twitter.com/hintjens/status/783254242052206592), archived in [https://en.wikipedia.org/wiki/Pieter_Hintjens](https://en.wikipedia.org/wiki/Pieter_Hintjens)). His blog "A Protocol for Dying" ([http://hintjens.com/blog:115](http://hintjens.com/blog:115)) is required reading for the open-source community.
- **The Hintjens vs. AMQP-WG flame war.** "AMQP/0.9.1 is legally and technically dead. The old spec is copyrighted by the AMQP Working Group and not remixable… AMQP/1.0 is great for big vendors, tragic for users" ([http://hintjens.com/blog:28](http://hintjens.com/blog:28)). The RabbitMQ team's response from Alexis Richardson on Hacker News: "Wtf? You may not like what we do with AMQP but I can assure that lots of people are very happy using it in its RabbitMQ incarnation" ([https://news.ycombinator.com/item?id=1239394](https://news.ycombinator.com/item?id=1239394)). [Hintjens](http://hintjens.com/blog:28)[Hacker News](https://news.ycombinator.com/item?id=1239394)
- **Gavin Roy's "controversial" view (RabbitMQ Summit 2019):** "I'm not a fan of AMQP 1.0. I think that the committee that made the protocol did a disservice by abandoning 0-10" ([https://www.cloudamqp.com/blog/panel-discussion-whats-new-and-whats-on-the-horizon-for-rabbitmq.html](https://www.cloudamqp.com/blog/panel-discussion-whats-new-and-whats-on-the-horizon-for-rabbitmq.html)). [CloudAMQP](https://www.cloudamqp.com/blog/panel-discussion-whats-new-and-whats-on-the-horizon-for-rabbitmq.html)
- **The interoperability demo.** On 30 October 2011, Microsoft, Red Hat, VMware, Apache, INETCO and IIT Software demonstrated AMQP 1.0 software talking to each other live in New York — the moment competing vendors agreed on the bytes ([https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)). [Wikipedia](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol)

---

## Practical wisdom

### Tuning parameters

- **Prefetch count (`basic.qos prefetch_count`).** Default is *unlimited* — almost always wrong. Start with `prefetch_count=1` for fair distribution among multiple consumers, then raise based on processing time. Heuristic: `prefetch ≈ round-trip / processing-time`. For a 125 ms RTT and 5 ms processing, prefetch ≈ 25. ([https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html](https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html), [https://www.rabbitmq.com/docs/consumer-prefetch](https://www.rabbitmq.com/docs/consumer-prefetch).) Use *consumer* prefetch (`global=false`), not channel-wide. [CloudAMQP + 3](https://www.cloudamqp.com/blog/how-to-optimize-the-rabbitmq-prefetch-count.html)
- **Heartbeat.** RabbitMQ recommends 60 s. Smaller (5-15 s) for low-latency failover; larger only if your network path is reliable.
- **`frame_max`.** Default 131,072 bytes (128 KiB). Smaller frames mean more frames per message; larger means more memory per channel.
- **`channel_max`.** Default 2,047 per connection. Treat each channel as light but not free; keep one per thread.
- **`vm_memory_high_watermark`.** Default 0.4. Set to 0.6 for dedicated RabbitMQ hosts ([https://www.compilenrun.com/docs/middleware/rabbitmq/rabbitmq-best-practices/rabbitmq-performance-tuning/](https://www.compilenrun.com/docs/middleware/rabbitmq/rabbitmq-best-practices/rabbitmq-performance-tuning/)).
- **AMQP 1.0 `max-link-credit`.** RabbitMQ default is 128, refilled at 64 remaining. Higher = higher single-link throughput but more in-flight memory ([https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks](https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks)).
- **Use quorum queues with `x-max-length` and `x-overflow=reject-publish`** to bound memory.

### Defaults to be skeptical of

- **`guest:guest`**. Created on first boot with admin rights on vhost `/`. By default restricted to localhost: "Allowing remote connections for the default user with well known default credentials is very strongly recommended against: doing so will dramatically reduce the security of the cluster" ([https://www.rabbitmq.com/docs/access-control](https://www.rabbitmq.com/docs/access-control)). Production rule: delete `guest`, create per-app users with minimum privileges. [RabbitMQ](https://www.rabbitmq.com/docs/access-control)
- **Default vhost `/`**. Fine for tests, dangerous for prod multi-tenancy. Create one vhost per environment / app.
- **Unlimited prefetch** (above).
- **No publisher confirms** — silently lose messages on failure unless you opt in (`confirm.select`).
- **Default password hashing SHA-256** — switch to SHA-512 with `password_hashing_module = rabbit_password_hashing_sha512` for 4.0+ ([https://www.rabbitmq.com/docs/passwords](https://www.rabbitmq.com/docs/passwords)). [CopyProgramming](https://copyprogramming.com/howto/rabbitmq-username-password)
- **Default management plugin port 15672 exposed.** Lock with firewall + TLS + non-default credentials; the management API trivially exposes the full topology.

### What to monitor

- **Queue depth** (messages_ready) — backlog growth = consumer can't keep up.
- **Unacked messages** — should be ≤ prefetch × consumer count; growth = stuck consumer.
- **Connection / channel count** — sudden spikes suggest churn anti-pattern.
- **Memory and disk alarms** — RabbitMQ blocks publishers when these fire.
- **File descriptor limit** — Linux default 1024 is far too low; raise to 65 K+ via `/etc/security/limits.conf` ([https://www.rabbitmq.com/docs/configure](https://www.rabbitmq.com/docs/configure)). [RabbitMQ](https://www.rabbitmq.com/docs/configure)
- **`fsync` rate** on quorum queues — low credit settings cause excessive fsyncs ([https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks](https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks)).
- **Erlang process count, memory by category, GC pauses** — Prometheus + the RabbitMQ exporter is the recommended path, not the management plugin under load ([https://www.rabbitmq.com/blog/2021/08/21/4.0-deprecation-announcements](https://www.rabbitmq.com/blog/2021/08/21/4.0-deprecation-announcements)).

### Debugging moves

- **`rabbitmqctl status`** for node + listener summary; `list_queues`, `list_consumers`, `list_connections` for live state.
- **Management UI** (port 15672) for ad-hoc inspection; **Prometheus + Grafana** for production metrics; the management API itself can be a metrics overhead at scale, hence the move to Prometheus.
- **`rabbitmqadmin` v2** (HTTP-API CLI) for definitions export/import and Blue-Green migrations ([https://www.rabbitmq.com/blog/2025/07/29/latest-benefits-of-rmq-and-migrating-to-qq-along-the-way](https://www.rabbitmq.com/blog/2025/07/29/latest-benefits-of-rmq-and-migrating-to-qq-along-the-way)).
- **`rabbitmq_tracing` plugin** for capturing wire traffic when a client misbehaves.
- **Wireshark** with the AMQP dissector for raw frame analysis ([https://www.compilenrun.com/docs/middleware/rabbitmq/rabbitmq-advanced-topics/rabbitmq-protocol-analysis/](https://www.compilenrun.com/docs/middleware/rabbitmq/rabbitmq-advanced-topics/rabbitmq-protocol-analysis/)).

### Common misconfigurations

- Auto-declaring queues from many short-lived processes ("queue churn") at high rate can exhaust the Erlang atom table at 5 million atoms ([https://www.rabbitmq.com/docs/quorum-queues](https://www.rabbitmq.com/docs/quorum-queues)). [RabbitMQ](https://www.rabbitmq.com/docs/quorum-queues)
- Setting `classic_queue.default_version=1` in 4.0+ → boot failure (CQv1 was removed) ([https://github.com/rabbitmq/rabbitmq-server/discussions/12321](https://github.com/rabbitmq/rabbitmq-server/discussions/12321)). [GitHub](https://github.com/rabbitmq/rabbitmq-server/discussions/12321)
- Persisting messages but declaring queues `durable=false` (or vice versa) — both must be set.
- Using transactions where publisher confirms suffice — orders of magnitude slower.
- Using `mandatory=true` without a `basic.return` handler — silently drops unroutable messages.

---

## Learning resources (current as of 2026)

### Primary specifications

| Resource | URL | Level | Year updated |
|---|---|---|---|
| OASIS AMQP 1.0 (Parts 0-5) | [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-overview-v1.0-os.html) | Advanced | 2012 (frozen, ratified ISO 2014) |
| ISO/IEC 19464:2014 | [https://www.iso.org/standard/64955.html](https://www.iso.org/standard/64955.html) | Reference | 2014 |
| AMQP 0-9-1 specification PDF | [https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf) | Advanced | 2008 |
| AMQP 0-9-1 reference (markdown + XML) | [https://github.com/rabbitmq/amqp-0.9.1-spec](https://github.com/rabbitmq/amqp-0.9.1-spec) | Advanced | 2024 (refresh) |
| RabbitMQ 0-9-1 errata | [https://www.rabbitmq.com/amqp-0-9-1-errata](https://www.rabbitmq.com/amqp-0-9-1-errata) | Advanced | live |

### Documentation

| Resource | URL | Level | Year |
|---|---|---|---|
| RabbitMQ docs (rabbitmq.com) | [https://www.rabbitmq.com/docs](https://www.rabbitmq.com/docs) | All | continuously updated; 4.3 docs as of April 2026 |
| AMQP 0-9-1 Model Explained | [https://www.rabbitmq.com/tutorials/amqp-concepts](https://www.rabbitmq.com/tutorials/amqp-concepts) | Intro | refreshed 2024 |
| Apache Qpid project docs | [https://qpid.apache.org/](https://qpid.apache.org/) | Intermediate | live |
| Microsoft Azure Service Bus AMQP guide | [https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-amqp-protocol-guide) | Intermediate | 2024 |
| RabbitMQ Khepri docs | [https://www.rabbitmq.com/docs/metadata-store](https://www.rabbitmq.com/docs/metadata-store) | Advanced | 2025-2026 |

### Books

- **Gavin Roy, "RabbitMQ in Depth"**, Manning, ISBN 9781617291005 ([https://www.manning.com/books/rabbitmq-in-depth](https://www.manning.com/books/rabbitmq-in-depth)). First edition 2017; remains the most thorough English-language treatment of the protocol's wire model and operations. Intermediate/advanced.
- **Alvaro Videla & Jason J. W. Williams, "RabbitMQ in Action"**, Manning, 2012. Intro/intermediate. Older but the protocol fundamentals are unchanged.
- **Sigismondo Boschi & Gabriele Santomaggio, "Mastering RabbitMQ"**, Packt, 2016. Intermediate.

### Engineering blogs (current, 2024-2026)

- **RabbitMQ blog** ([https://www.rabbitmq.com/blog](https://www.rabbitmq.com/blog)) — authoritative; "Native AMQP 1.0" (Aug 2024), "AMQP 1.0 Benchmarks" (Aug 2024), "AMQP 1.0 Flow Control" (Sept 2024), "Khepri default" (Sept 2025), 4.3 highlights (April 2026).
- **CloudAMQP blog** ([https://www.cloudamqp.com/blog/](https://www.cloudamqp.com/blog/)) — "From Mnesia to Khepri" series (3 parts, 2024-2025), "Best Practices" series, AMQP vs. MQTT (2024).
- **VMware/Tanzu blog** ([https://blogs.vmware.com/tanzu/](https://blogs.vmware.com/tanzu/)) — Tanzu RabbitMQ 4.0 (2024), 4.2 (2025).
- **Seventh State / Erlang Solutions** ([https://seventhstate.io/](https://seventhstate.io/), [https://www.erlang-solutions.com/blog/](https://www.erlang-solutions.com/blog/)) — "AMQP 0.9.1 vs 1.0" (2024), "Beyond Broadcom" (2025), Khepri internals.
- **InfoQ** — coverage of QCon 2025 O'Hara keynote ([https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/](https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/)).
- **RedMonk** — Alexis Richardson interview, March 2025 ([https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)).

### Talks (YouTube / conference recordings)

- **John O'Hara, "Advanced Message Queuing Politics", QCon London, April 2025** ([https://qconlondon.com/keynote/apr2025/advanced-message-queuing-politics](https://qconlondon.com/keynote/apr2025/advanced-message-queuing-politics), summary at [https://www.infoq.com/presentations/advanced-message-queuing/](https://www.infoq.com/presentations/advanced-message-queuing/)) — *the* primary-source narrative.
- **Michael Davis, "Khepri: Replacing Mnesia in RabbitMQ", Code BEAM Europe** ([https://codebeameurope.com/talks/khepri-replacing-mnesia-in-rabbitmq/](https://codebeameurope.com/talks/khepri-replacing-mnesia-in-rabbitmq/)).
- **RabbitMQ Summit 2023 / 2024 talks** — David Ansari on Native AMQP 1.0, Alvaro Videla's keynotes (referenced from [https://www.rabbitmq.com/blog/2024/08/05/native-amqp](https://www.rabbitmq.com/blog/2024/08/05/native-amqp)).
- **Pieter Hintjens, Changelog Interview #205, "A protocol for dying"** ([https://changelog.com/podcast/205](https://changelog.com/podcast/205)) — context for the AMQP/ZeroMQ split.

### Hands-on tools

- **PerfTest** ([https://perftest.rabbitmq.com/](https://perftest.rabbitmq.com/)) — official RabbitMQ benchmarker. Latest version 2024.
- **rabbitmqadmin v2** ([https://www.rabbitmq.com/docs](https://www.rabbitmq.com/docs)) — current generation HTTP-API CLI.
- **Quiver** ([https://github.com/ssorj/quiver](https://github.com/ssorj/quiver)) — AMQP 1.0 benchmark tool used in RabbitMQ's own 4.0 benchmarks.
- **pika** tutorials ([https://github.com/pika/pika](https://github.com/pika/pika)) — start with the official RabbitMQ tutorials in Python.
- **Apache Qpid Proton C++ examples** ([https://qpid.apache.org/proton/](https://qpid.apache.org/proton/)) — for raw AMQP 1.0 work.
- **Wireshark** AMQP dissector — built in.

### Academic and standards-process material

- John O'Hara, "Toward a Commodity Enterprise Middleware: Can AMQP enable a new era in messaging middleware?", *ACM Queue* 5(4), May 2007 — DOI **10.1145/1255421.1255424** ([https://queue.acm.org/detail.cfm?id=1255424](https://queue.acm.org/detail.cfm?id=1255424)). The seminal paper.
- K. Sachs et al., "Performance evaluation of message-oriented middleware using the SPECjms2007 benchmark", *Performance Evaluation* 66(8), 2009.
- "Towards benchmarking of AMQP", DEBS 2010 proceedings, ACM DOI 10.1145/1827418.1827438 ([https://dl.acm.org/doi/10.1145/1827418.1827438](https://dl.acm.org/doi/10.1145/1827418.1827438)).
- S. Vinoski, "Advanced Message Queuing Protocol", *IEEE Internet Computing* 10(6), 2006.

### Podcasts

- **The Changelog #205, "A protocol for dying with Pieter Hintjens"** ([https://changelog.com/podcast/205](https://changelog.com/podcast/205)) — 2016, but historically essential.
- **RedMonk Conversations, "RabbitMQ Was Designed for the Cloud Era" (Alexis Richardson)** — March 2025 ([https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)).

### University courses

No major university course is publicly available focused specifically on AMQP. Distributed-systems courses (MIT 6.824, CMU 15-712) treat message-broker design generally but not AMQP specifically. [needs source for any AMQP-specific university course in 2024-2026.]

---

## Where things are heading (2025-2026 frontier)

**RabbitMQ 4.x trajectory (most authoritative future signal).**

- **4.0 (Sept 2024).** Native AMQP 1.0 as core protocol; classic mirrored queues removed; Khepri fully supported; quorum-queue priorities; default redelivery limit = 20. ([https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md))
- **4.1.** AMQP 1.0 over WebSocket; AMQP 1.0 Filter Expressions; community support shifted (4.0.x became paid-only after 4.1) ([https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)).
- **4.2 (2025).** Khepri default for new clusters; SQL Filter Expressions on streams; local Shovels; cluster-wide exchange limits ([https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.2.0](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.2.0), [https://www.cloudamqp.com/blog/cloudamqp-announcing-rabbitmq-version-4-2.html](https://www.cloudamqp.com/blog/cloudamqp-announcing-rabbitmq-version-4-2.html)).
- **4.3 (April 2026).** JMS-style queues with SQL message selectors; queue browser; per-message delayed retry via `x-opt-delivery-time` (using AMQP 1.0 modified outcome); rejection reason in AMQP 1.0 Rejected outcome; protocol-specific consumer-timeout handling ([https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)).
- **Anticipated.** Mnesia is removed in 4.3; Khepri is mandatory ([https://rabbitmq.substack.com/p/khepri-will-become-the-only-supported](https://rabbitmq.substack.com/p/khepri-will-become-the-only-supported)). RabbitMQ 4.3 notes explicitly drop the deprecated `ram_node_type` and Mnesia partition-handling strategies ([https://github.com/rabbitmq/rabbitmq-server/releases](https://github.com/rabbitmq/rabbitmq-server/releases)). RabbitMQ 4.3 release series is "currently under active development" expected first half of 2026 ([https://www.rabbitmq.com/release-information](https://www.rabbitmq.com/release-information)).

**Streams and Khepri as a strategic shift.** Streams (since 3.9) gave RabbitMQ Kafka-like log semantics: append-only, non-destructive consume, replicated via Raft ([https://www.rabbitmq.com/docs/streams](https://www.rabbitmq.com/docs/streams)). Khepri brings the *metadata* into the same Raft world. The end-state, openly stated by the team, is that RabbitMQ 4.x is fundamentally a Raft-replicated multi-protocol broker: every replicated thing — queues (quorum), logs (streams), metadata (Khepri) — uses the same Ra Raft library. This makes RabbitMQ much more competitive with Kafka in event-driven workloads while preserving its routing flexibility ([https://blogs.vmware.com/tanzu/introducing-vmware-tanzu-rabbitmq-4-0/](https://blogs.vmware.com/tanzu/introducing-vmware-tanzu-rabbitmq-4-0/)).

**AMQP 1.0 vs. MQTT 5 vs. Kafka in the IoT / event-driven space.** As of 2026 the consensus is:

- *MQTT 5* dominates device-side IoT (constrained networks, lots of small clients).
- *AMQP 1.0* dominates enterprise middleware and cloud messaging (Azure Service Bus, IBM MQ, RabbitMQ, ActiveMQ Artemis, Solace).
- *Kafka* dominates high-throughput event streaming.

These coexist; modern brokers (RabbitMQ, Solace, ActiveMQ Artemis) speak two or three of these on the same port set. RabbitMQ's bet on native AMQP 1.0 + native MQTT 5 + Streams positions it as the multi-protocol bridge.

**OASIS AMQP TC.** Continues to publish profiles (Claims-Based Security, [https://docs.oasis-open.org/amqp/amqp-cbs/v1.0/csd01/amqp-cbs-v1.0-csd01.html](https://docs.oasis-open.org/amqp/amqp-cbs/v1.0/csd01/amqp-cbs-v1.0-csd01.html), and AMQP Filter Expressions). The core 1.0 spec is unchanged since 2012; the TC's role is now extension definition rather than core revision [needs source for any active 2025-2026 AMQP TC ballots].

**Broadcom-era open source.** Broadcom acquired VMware in November 2023; the RabbitMQ team's 31 May 2024 community-support policy change ([https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy](https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy)) signalled a tightening of who gets free patches: only "regularly contributing users and those who hold a valid commercial support license" for older series. The MPL-2.0 license is unchanged and the project is still on GitHub, but third-party support providers (Erlang Solutions / Seventh State, CloudAMQP) have stepped in for organisations that don't want to buy Broadcom support ([https://seventhstate.io/beyond-broadcom-an-alternative-for-supporting-open-source-rabbitmq/](https://seventhstate.io/beyond-broadcom-an-alternative-for-supporting-open-source-rabbitmq/)). Alexis Richardson, the original Rabbit Technologies founder, called it "kudos to Broadcom for being aware of these products" in March 2025 ([https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/](https://redmonk.com/blog/2025/03/31/rmc-rabbitmq-was-designed-for-the-cloud-era-with-alexis-richardson/)).

**Comparison with newer protocols.** None of NATS, Pulsar's binary protocol, or QUIC-native messaging has displaced AMQP at any major broker as of May 2026. The biggest competitive pressure on AMQP-the-protocol comes from Kafka-the-protocol; on AMQP-the-broker it comes from cloud-native managed services (SQS, SNS, EventBridge, Pub/Sub) that hide whatever protocol they use.

---

## Hooks for the article, infographic, and podcast

### 60-second narrated hook (the trading-floor origin)

> London, JPMorgan Chase, the early 2000s. A young engineer named John O'Hara is building a SWIFT gateway for a derivatives trading system. He flips it live. The first message comes through, and it triggers two billion dollars in collateral calls. He stares at the console and thinks: that's the most interesting console message I'll ever see.
> 
> The trading floor is held together by middleware that's "reassuringly expensive." Each new project means another vendor license, another integration headache. So O'Hara writes a memo, then a spec, then a letter to other banks. By 2006 he has 23 of the largest financial firms in the world — JPMorgan, Goldman, Bank of America, Barclays, Credit Suisse, Cisco, Red Hat, Microsoft, VMware — sitting around a table. They are going to standardise the *bytes* of business messaging the way HTTP standardised web traffic. They will call it the Advanced Message Queuing Protocol.
> 
> Twenty years later, every cloud you use — Azure, AWS, GCP — speaks AMQP somewhere. RabbitMQ, the most popular implementation, runs at scale at Instagram, Reddit, and the European Space Agency. And in 2024, after a decade of stalemate, RabbitMQ 4.0 finally crossed over to the AMQP 1.0 standard the rest of the industry chose. This is the story of the protocol that ate the back office.

(Sources: [https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/](https://www.infoq.com/news/2025/04/origin-advanced-message-queuing/), [https://queue.acm.org/detail.cfm?id=1255424](https://queue.acm.org/detail.cfm?id=1255424), [https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol), [https://www.rabbitmq.com/blog/2024/08/05/native-amqp](https://www.rabbitmq.com/blog/2024/08/05/native-amqp).)

### A striking statistic with source

> RabbitMQ has demonstrated **one million messages per second received and one million delivered — over two million msg/s aggregate — on a 30-node cluster** atop Google Compute Engine. Translation: 86 *billion* messages per day. (Pivotal/VMware engineering, [https://blogs.vmware.com/tanzu/rabbitmq-hits-one-million-messages-per-second-on-google-compute-engine/](https://blogs.vmware.com/tanzu/rabbitmq-hits-one-million-messages-per-second-on-google-compute-engine/).)

For an infographic, a more recent and reproducible single-node number: **120,000+ msg/s with publisher confirms enabled** on managed infrastructure ([https://danubedata.ro/blog/rabbitmq-performance-benchmarks-120k-messages-per-second-2026](https://danubedata.ro/blog/rabbitmq-performance-benchmarks-120k-messages-per-second-2026)), and **99,413 msg/s** on an Intel NUC running the official RabbitMQ benchmark suite ([https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks](https://www.rabbitmq.com/blog/2024/08/21/amqp-benchmarks)).

### A "pause and think" moment

> The single byte `0xCE` ends every AMQP 0-9-1 frame. Not a checksum. Not a length. A *literal*. If your parser sees anything else where `0xCE` should be, the connection is dead.
> 
> Now consider: AMQP runs over TCP. TCP already guarantees ordering, retransmission, and a checksum. The frame *size* field tells you exactly how many bytes the payload contains. So why have `0xCE` at all?
> 
> Because the protocol is older than your trust in TCP middleboxes. AMQP was designed in an era when banks ran proprietary gateways, NAT routers, and load balancers that would happily eat or mangle bytes mid-stream. `0xCE` is a tripwire. If your "trusted" infrastructure ever lies to you about a stream's contents, you find out one frame later — not after silently corrupting two billion dollars of collateral calls.
> 
> AMQP 1.0 quietly removed it, trusting `SIZE` alone. Hold that thought next time you're tempted to delete redundant validation.

(Sources: [https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf](https://www.rabbitmq.com/resources/specs/amqp0-9-1.pdf), [https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html](https://docs.oasis-open.org/amqp/core/v1.0/os/amqp-core-transport-v1.0-os.html).)

### A failure-story arc

**Setup.** A SaaS company runs a 3-node RabbitMQ 3.x cluster. Classic mirrored queues. Default `guest:guest`. Default unlimited prefetch. Containers managed by a single-replica Kubernetes StatefulSet. The Bitnami RabbitMQ image is referenced by `latest` tag.

**Mistake.** One Tuesday morning, the public Bitnami image is deleted from the registry. The pod restarts; ImagePullBackOff. Operators notice nothing — they monitor CPU and memory at the host level, not pod restarts. By lunchtime a network blip causes a second pod restart and a partial split-brain in the mirrored queues. Consumers continue to NACK a poison message which is requeued forever. Memory creeps up.

**Consequence.** At 14:00 the broker hits its memory high-watermark and flow-controls all publishers. Every microservice's outbound queue fills its in-memory buffer. The 12-service mesh deadlocks. SREs page out, find the cluster red, try to redeploy — and discover the container image is gone. They scramble for a snapshot. Down for ~2 hours.

**Resolution.** They migrate to (a) a private container registry for the image, (b) RabbitMQ 4.0 with quorum queues replacing mirrored queues — eliminating split-brain by Raft consensus, (c) an explicit `prefetch_count` per consumer, (d) a redelivery limit (RabbitMQ 4.0 default is 20) so poison messages dead-letter automatically, and (e) Prometheus alerts on queue depth, unacked count, and pod restarts. Khepri replaces Mnesia for metadata, eliminating the partition-handling guesswork.

(Composite drawn from [https://medium.com/@pandey.pradhyuman139/when-rabbitmq-goes-dark-5-critical-lessons-from-a-production-outage-46443081aa15](https://medium.com/@pandey.pradhyuman139/when-rabbitmq-goes-dark-5-critical-lessons-from-a-production-outage-46443081aa15), [https://www.cloudamqp.com/blog/from-mnesia-to-khepri-part1.html](https://www.cloudamqp.com/blog/from-mnesia-to-khepri-part1.html), [https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md](https://github.com/rabbitmq/rabbitmq-server/blob/main/release-notes/4.0.1.md), [https://groups.google.com/g/rabbitmq-users/c/blUwCWpqi5M](https://groups.google.com/g/rabbitmq-users/c/blUwCWpqi5M).)

---

## Recommendations for the editorial team (decision-ready, since this is source material)

1. **Lead with the human story, not the wire format.** O'Hara at JPMorgan, Hintjens at iMatix, the 2011 New York interop demo, Hintjens' "Protocol for Dying" — all in primary sources you can quote.
2. **Frame "AMQP" as two protocols, not one.** This is the single most common reader confusion and what trips experienced engineers. Every section should disambiguate 0-9-1 vs. 1.0.
3. **Make the 24-month news the spine of any "current state" article.** RabbitMQ 4.0 (Sept 2024) → 4.1 → 4.2 (Khepri default) → 4.3 (April 2026, Mnesia removed). Broadcom's policy change. Native AMQP 1.0.
4. **For the infographic:** the four-quadrant comparison (AMQP 0-9-1 vs. AMQP 1.0 vs. MQTT 5 vs. Kafka) is the most asked-about decision. Use the verified numbers above.
5. **For the podcast:** lead one episode with O'Hara's QCon London 2025 keynote (it is structured as a story); a second episode with Hintjens' archival material (his blog and the Changelog #205) for the dissent and human cost; a third with David Ansari (the engineer behind native AMQP 1.0 in RabbitMQ 4.0) on the technical inflection.
6. **Verify CVEs at NVD before quoting CVSS scores** — vendors and aggregators often disagree. We've cross-checked the major ones above.

---

## Caveats

- **The most volatile area is RabbitMQ versioning.** RabbitMQ 4.3.0 was released in April 2026 ([https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release](https://www.rabbitmq.com/blog/2026/04/23/rabbitmq-4.3-release)); minor numbers are moving roughly every six months. Anything in the "Where things are heading" section that talks about *future* releases is forward-looking — verify before publishing.
- **The Confluent benchmark vs. RabbitMQ.** Both Kafka-friendly and RabbitMQ-friendly benchmarks exist; the methodology matters more than the absolute number. Don't quote either side without naming the test setup.
- **`0xCE` design rationale, port number 5672 origin, several "fun facts."** I could not find a primary source explaining why `0xCE` specifically was chosen, or any official rationale for port 5672 beyond IANA registration. These are tagged `[needs source]` in the body.
- **Some named outage stories** ("Instagram's RabbitMQ scaling problems", a specific GitHub AMQP outage) are widely repeated in talks but I could not locate a *named, dated* primary post-mortem during this research pass. The outage examples in §6 above are the ones I *can* attribute. Treat broader claims about specific companies' AMQP outages with skepticism unless backed by a named post-mortem.
- **Pieter Hintjens' opinions about AMQP 1.0.** They are sharply expressed and well-sourced from his own blog ([http://hintjens.com/blog:28](http://hintjens.com/blog:28)) but they are *opinions* in an active controversy. Present them as such; the AMQP 1.0 OASIS standard has succeeded commercially regardless.
- **CVE-2015-8786** appeared in the prompt but did not surface as a RabbitMQ-specific CVE in the consulted indexes. If you need it, verify directly at [https://nvd.nist.gov](https://nvd.nist.gov) before citing.
- **Some Wikipedia material** (especially around early working-group membership numbers — "22" vs. "23" companies) is cross-cited with primary sources where possible. Where the only available source is Wikipedia, that's flagged inline.
- **Broadcom's intentions toward RabbitMQ open source** are inferred from policy changes and team statements, not from any binding declaration. The MPL-2.0 license cannot be revoked from existing code; that is a legal certainty. Future *new* code's licensing is theoretically a corporate decision.