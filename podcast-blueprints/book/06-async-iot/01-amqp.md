---
id: async-iot/amqp
type: chapter
part_id: async-iot
part_label: VII
part_title: Async / IoT
title: AMQP
synopsis: Banking-grade messaging — JPMorgan Chase, John O'Hara, and "two billion dollars in collateral calls before he could blink."
podcast_target_minutes: 15
position_in_book: chapter 47 of 75
listening_order:
  prev: async-iot/mqtt
  next: async-iot/kafka
related_protocols: [amqp, tcp, websockets, mqtt]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A 2003 trading-floor diagram at JPMorgan Chase in London, with a SWIFT-derivatives gateway feeding a single message that triggers a two-billion-dollar collateral-call cascade."
  - "Side-by-side wire formats: AMQP 0-9-1 with the literal 0xCE frame-end sentinel byte highlighted, AMQP 1.0 with an authoritative SIZE field instead."
  - "Exchange-to-queue routing fan-out diagram for AMQP 0-9-1 — direct, topic, fanout, and headers exchanges feeding durable queues over multiplexed channels on a single TCP connection."
  - "A timeline from 2003 (O'Hara at JPMorgan) through 2007 (ACM Queue paper, 300 million messages per day) to 2011 (AMQP 1.0 release), 2012 (OASIS), 2014 (ISO/IEC 19464), 2024 (RabbitMQ 4.0 GA), and 2026 (Khepri mandatory in 4.3)."
  - "An AMQP-versus-MQTT split panel: a database-shaped broker labeled 'sized, replicated, monitored' for AMQP, and a small router-shaped broker labeled 'stateless' for MQTT."
---

# Part VII, Chapter — AMQP

## The hook

Alexis Richardson, the Rabbit Technologies founder, said it best in March 2025. "If you read AMQP 1.0, it's called Advanced Message Queue Protocol, but there are no queues in it." That is the puzzle of this chapter. AMQP 0-9-1 and AMQP 1.0 share a name and almost nothing else, and the story of how a bank's wire-level plumbing turned into two completely different protocols runs through JPMorgan Chase, a two-billion-dollar collateral call, an IBM licensing fight, and a public walkout.

## The story

### Wire-Level Banking Plumbing

AMQP — the Advanced Message Queuing Protocol — was originated in 2003 by John O'Hara at JPMorgan Chase in London. The trigger story O'Hara told at QCon London in 2025 was watching the first message in a SWIFT-derivatives gateway "make two billion dollars in collateral calls before he could blink." That is the kind of moment that makes a bank decide it needs to own its messaging fabric.

The commercial driver, per Alexis Richardson in March 2025, was simpler still. The point was, in his words, "to bypass paying for IBM's MQ — you had to buy a license to use the protocol because it wasn't an open protocol." JPMorgan didn't want to pay extortionate per-CPU licensing for messaging. So the bank built its own wire protocol and pushed it into the open.

The first mission-critical AMQP deployment went live in mid-2006. O'Hara's 2007 ACM Queue paper, DOI 10.1145/1255421.1255424, reported that the system "served 2,000 users and processes 300 million messages per day." That was the proof point. A bank's internal protocol now had a real production track record.

### AMQP 0-9-1 Versus AMQP 1.0 — Two Different Protocols

Here is the part that trips up almost every engineer who comes to AMQP for the first time. AMQP 0-9-1 and AMQP 1.0 are completely different protocols sharing a name. 0-9-1 prescribes exchanges, queues, and bindings as a fixed broker model. 1.0 is a symmetric peer-to-peer transfer protocol with zero queues defined in the spec. If you learn one and assume the other works the same way, you will be wrong about almost everything.

AMQP 0-9-1 is the version most engineers actually mean when they say AMQP. It defines exchanges that route messages to queues. The routing rule depends on the exchange type: direct uses an exact routing-key match, topic uses wildcard pattern matching on routing keys, fanout broadcasts to every bound queue regardless of the routing key, and headers routes on message header attributes instead of routing keys. Durable queues survive broker restarts. Channels multiplex multiple logical sessions over a single TCP connection so a busy client doesn't open a connection per consumer. The wire format uses a literal 0xCE frame-end sentinel byte — not a checksum, just a marker the parser uses to confirm the framing didn't slide.

AMQP 1.0 is the other protocol. It was released on 30 October 2011, OASIS-standardised on 31 October 2012, and ratified as ISO/IEC 19464:2014 in April 2014. It dropped the sentinel and uses an authoritative SIZE field for framing. AMQP itself adds no application-level checksum and relies entirely on TCP's. How TCP delivers the bytes underneath all of this — sequence numbers, retransmission, congestion control — is the TCP episode.

The 0-9-1 working group was effectively dead by 2010. Pieter Hintjens, the iMatix CEO, circulated a paper in 2008 titled "What is wrong with AMQP (and how to fix it)," walked out of the standards effort, and built ZeroMQ instead. Hintjens died by voluntary euthanasia on 4 October 2016. His final blog post was titled "A Protocol for Dying." The history of standards bodies is full of consensus that holds; this one didn't, and the schism is why we ended up with two protocols under one name.

### RabbitMQ 4.0 Made AMQP 1.0 a Core Protocol

There is a callout in the chapter on the engineering shift inside RabbitMQ, the dominant open-source AMQP broker. RabbitMQ 4.0 went generally available on 18 September 2024 and made AMQP 1.0 a core protocol — not a plugin layered over the 0-9-1 model. The result is a single Erlang process per session versus 15 in 3.13, and peak throughput "more than double" 3.13.x. Classic mirrored queues, deprecated since 2021, were fully removed in the same release. Khepri, a new Raft-based metadata store, is the default in RabbitMQ 4.2.0 and becomes mandatory in 4.3 in April 2026 — the long-running Mnesia store is removed entirely. RabbitMQ 4.3 also added JMS-style queues with SQL message selectors. After fifteen years of treating 1.0 as a side-channel, the most popular AMQP broker in the world finally rebuilt its core around it.

### The Broadcom Acquisition, And Where AMQP Goes Now

Broadcom acquired VMware in November 2023. On 31 May 2024 the RabbitMQ team announced that 3.12.x and older "will no longer receive patches through community support." Non-paying users have to upgrade. The license remains MPL-2.0, so the project itself stays open source, but the support boundary moved.

The dominant cloud-managed AMQP deployment by message volume today is not RabbitMQ. Microsoft Azure Service Bus uses AMQP 1.0 as its primary protocol. Service Bus over AMQP-WebSockets tunnels through TCP port 443 to be, in Microsoft's words, "equivalent to AMQP 5671 connections." The mechanism for how an HTTP request upgrades into a persistent full-duplex frame channel is the WebSocket episode; for AMQP, the point is that a 1.0 conversation can live inside a TLS-wrapped WebSocket and traverse any corporate firewall that already lets HTTPS through.

The trade-off versus MQTT remains operational complexity, and this is where the chapter sits the two protocols next to each other. An AMQP broker is a database. You size it, you replicate it, you monitor it. An MQTT broker is closer to a router — stateless and small. Banks use AMQP for trade messaging, where exactly-once delivery and audit trails are non-negotiable. Microservice architectures use it for command queues and asynchronous task dispatch. Choose AMQP when transactions matter; choose MQTT when scale and simplicity matter. The MQTT episode is the previous chapter, and it picks up the IoT side of that split in detail.

## What you'd see in the simulator

If you press play on the AMQP simulator in the app, you follow a single AMQP 0-9-1 connection through its lifecycle. The client opens a TCP connection to the broker and completes the AMQP handshake. It then opens a channel — the lightweight logical session that lets a single connection carry many independent conversations. The producer declares an exchange, the consumer declares a queue, and a binding glues the two together with a routing key. A publish flows from producer to exchange, the exchange applies its routing rule, the message lands in the queue, the consumer reads it, and an acknowledgment closes the loop. The point of the walkthrough is to show how AMQP separates the three concerns — routing in the exchange, buffering in the queue, consumption by the consumer — so each can be changed without touching the others.

## What it taught the industry

AMQP taught the industry two things that outlived its own messy two-protocol history. First, that a wire-level open standard could break a vendor's licensing lock on a critical piece of plumbing — JPMorgan got out from under per-CPU MQ pricing, and the protocol they wrote ended up powering Microsoft's cloud bus. Second, that "broker as database" is a real architectural commitment. Once you decide you need durable queues, transactions, exactly-once semantics, and audit trails, you have signed up to operate a stateful system with all the replication and monitoring that implies. AMQP made that trade explicit. Every messaging system that came after — including the one in the next chapter — had to pick a side of that line.

## Listening order

- **Before this chapter:** "MQTT" — the lightweight pub/sub protocol IBM built in 1999 for unreliable satellite links, and the half of the broker-as-router-versus-broker-as-database split that AMQP doesn't occupy.
- **After this chapter:** "Kafka" — what happens when you stop thinking of the broker as a queue at all and start thinking of it as a distributed commit log.

## Where to go deeper

- The AMQP episode picks up the mechanism story — the four exchange types, durable queues, channel multiplexing, the 0xCE frame-end sentinel, and how AMQP 0-9-1 and 1.0 actually differ on the wire.
- The TCP episode covers the reliability layer AMQP relies on for ordering and integrity, since AMQP itself adds no application checksum.
- The WebSocket episode covers the upgrade handshake and the persistent full-duplex frame channel that Azure Service Bus uses to tunnel AMQP 1.0 over port 443.
- The MQTT episode is the operational counterweight — 2-byte fixed header, three QoS levels, last-will messages, and the broker-as-router model that AMQP deliberately isn't.

## Visual cues for image generation

- A 2003 trading-floor diagram at JPMorgan Chase in London, with a SWIFT-derivatives gateway feeding a single message that triggers a two-billion-dollar collateral-call cascade.
- Side-by-side wire formats: AMQP 0-9-1 with the literal 0xCE frame-end sentinel byte highlighted, AMQP 1.0 with an authoritative SIZE field instead.
- Exchange-to-queue routing fan-out for AMQP 0-9-1 — direct, topic, fanout, and headers exchanges feeding durable queues over multiplexed channels on a single TCP connection.
- A timeline from 2003 through 2007, 2011, 2012, 2014, 2024, and 2026 marking O'Hara at JPMorgan, the ACM Queue paper, AMQP 1.0 release, OASIS standardisation, ISO/IEC 19464, RabbitMQ 4.0 GA, and Khepri mandatory in 4.3.
- An AMQP-versus-MQTT split panel: a database-shaped broker labeled "sized, replicated, monitored" for AMQP, and a small router-shaped broker labeled "stateless" for MQTT.
