---
id: pubsub-patterns
type: journey
title: Pub/Sub Patterns
scope: async-iot
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [mqtt, amqp, kafka]
related_protocols: [mqtt, amqp, kafka]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: MQTT, then AMQP, then Kafka — with a scale bar underneath running from constrained device on the left to internet-scale event stream on the right"
  - "MQTT broker in the middle, with sensors fanning in on the left publishing to hierarchical topics like home/kitchen/temperature, and dashboards fanning out on the right subscribed to home/+/temperature"
  - "AMQP routing diagram: producer on the left sending to an exchange, the exchange splitting messages out to multiple queues via direct, fanout, topic and headers bindings, with consumers pulling from each queue"
  - "Kafka commit log shown as a long horizontal append-only tape, partitioned into parallel lanes, with consumer groups reading at different offsets — one near the head, one replaying from the beginning"
  - "Side-by-side scale comparison: MQTT's 2-byte minimum publish overhead next to AMQP's exchange-and-binding graph next to LinkedIn's 7 trillion messages a day through Kafka"
---

# Pub/Sub Patterns

## In one breath
This is the journey across three answers to the same idea: let producers
shout into a broker and let consumers listen, without the two ever
needing to know about each other. MQTT does it for tiny devices on bad
networks. AMQP does it for enterprise systems that cannot afford to
lose a message. Kafka does it for the kind of event firehose that
powers a modern data platform. Same shape, three very different scales.

## The hook (cold-open)
A temperature sensor on an oil rig, a payment going through a bank's
order system, and seven trillion events a day flowing through LinkedIn.
On the surface these have nothing to do with each other. Underneath,
they are all the same pattern — a publisher dropping a message into a
broker, and one or more subscribers picking it up later. In the next
few minutes we are going to walk three protocols that all solve that
pattern, each at a wildly different scale, and see why one shape needed
three different designs.

## The journey

### Step 1 — MQTT: Lightweight IoT (MQTT)
MQTT was designed for the harshest conditions: sensors on oil rigs with
satellite uplinks, medical devices with intermittent cellular, smart
home gadgets on flaky WiFi. The whole protocol is binary and
extraordinarily compact — a minimal publish message is just two bytes
of overhead. Clients publish to hierarchical topics, like
home/kitchen/temperature, and subscribe with wildcards, like
home/+/temperature for every room at once. Three quality-of-service
levels let you pick how careful you want to be: QoS 0 is
fire-and-forget, QoS 1 is acknowledged delivery, QoS 2 is exactly-once.
The broker handles all the routing, so publishers and subscribers never
need to know about each other — that decoupling is the whole point.
MQTT even has a Last Will message, sent automatically by the broker if
a device drops off the network without saying goodbye. The full
mechanism — packet formats, session state, retained messages, all of
it — is in the MQTT episode. Here we just need the silhouette:
two-byte overhead, hierarchical topics, three QoS levels, broker in
the middle.

MQTT excels at getting small messages from constrained devices to a
broker. But enterprise systems need more sophisticated message routing.
What if you need to route by content, fan out to multiple queues,
implement priority ordering, or guarantee transactional processing
with dead-letter handling?

### Step 2 — AMQP: Enterprise Messaging (AMQP)
AMQP — the Advanced Message Queuing Protocol — is the
industrial-strength messaging protocol for enterprise systems. The
routing model is its real party trick: producers do not send messages
to queues. They send messages to exchanges, and exchanges route them
to queues based on bindings. Different exchange types unlock different
patterns. Direct exchanges do point-to-point. Fanout exchanges
broadcast to every bound queue. Topic exchanges do pattern-based
routing. Headers exchanges route on message attributes. Messages can
be persistent, so they survive a broker restart. Consumers acknowledge
once they have actually processed a message, and reject it if
something goes wrong — rejected messages get dead-lettered for error
handling instead of vanishing. This is the architecture behind
financial trading systems, healthcare data pipelines, and e-commerce
order processing, where losing a message can mean losing money or
endangering lives. The full mechanism — frames, channels, the
exchange-binding-queue graph — is in the AMQP episode. Here the shape
to remember is: a routing layer in front of the queues, and delivery
guarantees the business side actually cares about.

AMQP handles complex enterprise routing brilliantly. But what happens
when you need to process millions of events per second, replay
historical data, and scale horizontally across dozens of servers?
Enterprise message brokers were not designed for internet-scale event
streaming.

### Step 3 — Kafka: Event Streaming (Kafka)
Kafka reimagined messaging as a distributed commit log — an
append-only, immutable sequence of events that you can replay from any
point in time. Topics are split into partitions, partitions are spread
across a cluster, and each partition is replicated for fault
tolerance. Consumer groups give you parallel processing for free: each
consumer in a group reads from different partitions, so adding
consumers adds throughput. The deepest break with what came before is
retention. Traditional message queues delete a message once it has
been consumed. Kafka keeps events for a configurable period — days,
weeks, or forever — which means a brand new consumer can show up
tomorrow and reprocess the entire history. That single design choice
is what makes Kafka the substrate for event sourcing, change data
capture, stream processing pipelines, and real-time data platforms.
LinkedIn, where Kafka was born, runs more than seven trillion messages
a day through it. The full mechanism — partitions, offsets, the
replication protocol, consumer group rebalance — is in the Kafka
episode. Here the silhouette to keep is: an append-only log, sharded
and replicated, that anyone can replay from any offset.

## What the listener now understands
Three brokers, one pattern. Publishers do not know their subscribers,
subscribers do not know their publishers, and the broker in the middle
is what makes both sides simpler. The differences are about what the
broker is optimised for. MQTT optimises for the wire — two bytes of
overhead, tiny devices, lossy links, three QoS knobs. AMQP optimises
for the routing — exchanges, bindings, persistent queues, acks and
dead-letters, so an enterprise system can trust the broker with money
and lives. Kafka optimises for the log — append-only, partitioned,
replicated, retained, so a whole company can plug into the same stream
of events and replay it whenever it wants. Pick the broker that
matches the shape of your traffic, not the other way round.

## Where this connects in the book
- The chapter on MQTT goes deep on QoS levels, retained messages, and
  the Last Will mechanism that makes flaky-network devices feel
  reliable to the systems consuming them.
- The chapter on AMQP unpacks the exchange-binding-queue model in
  detail, including when each exchange type is the right one and how
  dead-letter queues are wired up in practice.
- The chapter on Kafka covers partitions, replication, consumer group
  rebalancing, and the operational reality of running an event log at
  LinkedIn-scale throughput.

## See also (other journeys and protocol episodes)

- If MQTT was the step that surprised you most, the MQTT episode is the
  right next listen. It is the protocol that most reliably makes
  engineers rethink what "lightweight" really means on the wire.

- The AMQP episode is the one to take if the routing model felt like
  the most interesting idea here. Exchanges, bindings and dead-letter
  queues turn out to be the vocabulary behind a lot of mission-critical
  systems you have probably touched without noticing.

- The Kafka episode picks up exactly where this journey leaves off —
  same pub/sub shape, but reframed as a replayable log instead of a
  queue, and operated at a scale that changes how you think about data
  pipelines altogether.

## Visual cues for image generation

- Three-node graph lighting up in sequence: MQTT, then AMQP, then
  Kafka — with a scale bar underneath running from constrained device
  on the left to internet-scale event stream on the right.
- MQTT broker in the middle, with sensors fanning in on the left
  publishing to hierarchical topics like home/kitchen/temperature, and
  dashboards fanning out on the right subscribed to home/+/temperature.
- AMQP routing diagram: producer on the left sending to an exchange,
  the exchange splitting messages out to multiple queues via direct,
  fanout, topic and headers bindings, with consumers pulling from each
  queue.
- Kafka commit log shown as a long horizontal append-only tape,
  partitioned into parallel lanes, with consumer groups reading at
  different offsets — one near the head, one replaying from the
  beginning.
- Side-by-side scale comparison: MQTT's two-byte minimum publish
  overhead next to AMQP's exchange-and-binding graph next to
  LinkedIn's seven trillion messages a day through Kafka.
