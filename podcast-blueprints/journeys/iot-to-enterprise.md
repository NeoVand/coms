---
id: iot-to-enterprise
type: journey
title: IoT to Enterprise
scope: async-iot
podcast_target_minutes: 15
step_count: 4
protocols_in_order: [coap, mqtt, stomp, amqp]
related_protocols: [coap, mqtt, stomp, amqp]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: CoAP on a sensor, then MQTT at a gateway, then STOMP into a browser dashboard, then AMQP into the enterprise back end"
  - "Stacked tiers showing what each protocol carries: a 4-byte CoAP header on UDP at the device, MQTT topics fanning out at the broker, a plain-text STOMP frame in a browser, and an AMQP exchange routing to three queues"
  - "An MQTT topic tree like factory/floor-2/press-7/temperature with wildcard subscriptions factory/floor-2/# and factory/+/+/temperature highlighted"
  - "An AMQP exchange splitting one inbound stream into three labelled queues: monitoring alerts, ERP integration, data lake ingestion"
  - "End-to-end timeline: a single temperature reading travelling sensor to broker to dashboard to enterprise queue, with each protocol coloured in"
---

# IoT to Enterprise

## In one breath
This is the journey one sensor reading takes from a microcontroller on a
factory floor all the way into a business's enterprise systems. Four
messaging protocols cooperate — CoAP to speak from the device, MQTT to
fan readings out at the gateway, STOMP to plug a browser dashboard in,
and AMQP to route data into the systems that actually run the business.
It's the cleanest demonstration that messaging is not one protocol but a
ladder of them, each sized for a different scale.

## The hook (cold-open)
A temperature sensor on press number seven, on the second floor of a
factory, takes a reading. A few hundred milliseconds later, that same
number has lit up an alert on a maintenance team's dashboard, updated a
chart on a web monitor, and dropped into a queue feeding the company's
ERP. Four different messaging protocols have already done their work —
each one designed for a different scale, from a 10-kilobyte
microcontroller to an enterprise message bus. In the next few minutes
we'll walk that path one protocol at a time, and watch the messaging
ladder do its job.

## The journey

### Step 1 — Constrained Devices (CoAP)
The journey starts on the smallest machine in the building. CoAP, the
Constrained Application Protocol, brings REST-style semantics to
devices too small and power-limited for HTTP — microcontrollers with
about ten kilobytes of RAM, sometimes running on batteries that need to
last for years. It runs over UDP with a fixed header of just four
bytes, and supports the familiar verbs: GET, PUT, POST, DELETE on
resources identified by URIs. For a web developer it looks like a tiny
HTTP. For the device, every saved byte and every avoided round trip
matters. CoAP also has an Observe option that lets a client register
once for notifications when a resource changes — a temperature sensor,
say — instead of paying the cost of polling. It supports multicast for
discovering devices on a local network, and DTLS for encrypted
communication where the device can afford it. The full mechanism, the
binary header layout, the option encoding, the retransmission rules and
how Observe actually works, is in the CoAP episode. Here we just need
the picture: HTTP shrunk down for a world where every byte and every
milliwatt counts.

CoAP works brilliantly for one device talking to one client. But a real
deployment has thousands of these sensors, each publishing readings
every few seconds, often over flaky cellular or satellite links.
Something has to aggregate all those streams, hold on to messages when
a device drops off, and route data to the right consumers without each
sensor needing to know who any of them are.

### Step 2 — Device Gateway (MQTT)
That something is MQTT. A gateway sits at the edge, translating CoAP
messages from the local sensors into MQTT publishes, and sending them
to a broker that handles all the subscriptions and routing. The trick
that makes MQTT feel right for this is the topic hierarchy. A reading
gets published to a topic like factory/floor-2/press-7/temperature, and
subscribers ask for whatever slice they care about: factory/floor-2/#
to listen to everything on the second floor, factory/+/+/temperature to
follow temperatures across all floors and machines. QoS levels let the
publisher choose how hard the broker should work to make sure the
message arrives, which matters over unreliable cellular and satellite
links. The broker tracks which devices are still alive with periodic
keep-alive pings, and when a device drops, a Last Will message it
registered ahead of time gets published on its behalf — so an alert
fires immediately instead of after some silent timeout. The full
mechanism — QoS 0, 1 and 2, retained messages, sessions, the wire
format — is in the MQTT episode. Here we just need to know it is the
central nervous system of the deployment, the place every device's
data flows through.

MQTT moves IoT data reliably from the edge into central systems. But
the systems that actually use that data — web dashboards, analytics
tools, older internal applications — often cannot speak MQTT directly.
They need a protocol that bridges the gap, one a web developer can
integrate in an afternoon.

### Step 3 — Simple Integration (STOMP)
STOMP, the Simple Text Oriented Messaging Protocol, is the HTTP of
messaging. It's entirely text-based and human-readable, which means you
can debug it with the same tools you'd use for HTTP — a netcat session
is enough to follow what's happening. The commands look like exactly
what they do: CONNECT, SUBSCRIBE, SEND, ACK. Anyone who already
understands HTTP can pick STOMP up in minutes. Where it really earns
its keep is in the browser. Web applications run STOMP over WebSockets,
which means a browser-based dashboard can subscribe directly to a feed
of IoT data and watch it update in real time, without any custom
gateway in the middle. Brokers like RabbitMQ and ActiveMQ speak STOMP
alongside their native protocols, so it slots straight into existing
infrastructure as the easy on-ramp for web frontends. The tradeoff,
honestly, is efficiency: text headers and no compression mean more
bytes on the wire than a binary protocol. The full mechanism — frame
format, the command set, content-length handling, how it rides on
WebSockets — is in the STOMP episode. Here we just need the role:
STOMP is the protocol you reach for when a browser needs to plug into
your messaging fabric and you don't want a project to do it.

STOMP makes integration easy, but enterprise data processing wants more
than easy. It wants content-based routing so that an alert reaches only
the right team. It wants transactional handling so that no order is
processed twice. It wants dead-letter queues for messages that failed,
and priority ordering for the time-sensitive ones. Those requirements
call for a full enterprise messaging protocol.

### Step 4 — Enterprise Processing (AMQP)
At the enterprise tier, AMQP — the Advanced Message Queuing Protocol —
provides the routing sophistication and the reliability guarantees that
business-critical systems demand. The same IoT data that came in over
MQTT gets handed to an AMQP exchange, which routes it by content,
priority, or routing key into different queues. Temperature alerts go
to the monitoring queue. Maintenance data goes to the ERP integration
queue. Raw telemetry goes to the data lake ingestion queue. One stream
in, three different downstream systems, each getting only what it
asked for. Transactional publishing means a batch of related messages
either all arrive or none of them do. Consumer acknowledgments mean
that if a processing node crashes mid-message, the broker just
redelivers it to another consumer — nothing gets dropped on the floor.
The full mechanism — exchange types, bindings, the channel model, the
delivery guarantees, the wire-level framing — is in the AMQP episode.
Here we just need the outcome: raw sensor data has been turned into
trustworthy business intelligence, fanned out to the systems that need
it, with the durability guarantees that let a company actually rely on
it.

## What the listener now understands
This is the messaging ladder doing its job. CoAP knows nothing about
brokers or topics; it just speaks REST in four-byte headers because the
device it lives on can't afford anything bigger. MQTT knows nothing
about browsers or enterprise routing; it just fans messages out by
topic to whichever subscribers asked for them. STOMP knows nothing about
sensors or queues; it just gives a browser a clean, text-based way to
plug into the fabric. AMQP knows nothing about microcontrollers; it
just routes and guarantees and acknowledges, the way a system of record
needs. Each protocol minds its own concern, sized for its own scale,
and trusts the next rung up to handle the rest. When a temperature
reading travels from a sensor on a press to a chart in a browser to a
queue feeding the ERP, what you're really seeing is four independently
designed messaging systems composing in the right order, across about
six orders of magnitude of computing power.

## Where this connects in the book
- The chapter on CoAP goes deep on the constrained-device world: the
  4-byte header, UDP transport, the Observe option, multicast
  discovery, and DTLS for the devices that can carry the cost.
- The chapter on MQTT unpacks the topic hierarchy, the three QoS
  levels, keep-alive and Last Will, and why those choices feel right
  for thousands of devices on flaky links.
- The chapter on STOMP covers the text-frame protocol, how it rides
  over WebSockets, and why it became the go-to on-ramp for browser
  dashboards into broker infrastructure.
- The chapter on AMQP walks through exchanges, bindings, transactional
  publishing and consumer acknowledgments — the machinery behind the
  routing and reliability that enterprise systems lean on.

## See also (other journeys and protocol episodes)

- If you want to hear the same four rungs stripped down to their
  essentials, the CoAP episode and the MQTT episode are the two to
  start with — they're the device-side foundation everything else in
  this journey depends on.

- The STOMP episode is the right next listen if the browser-dashboard
  step felt like the surprise — it's the one that most often makes
  engineers realise how little ceremony a real-time web feed actually
  needs.

- The AMQP episode picks up where this journey leaves off, on the
  enterprise side: exchanges, bindings, and the delivery guarantees
  that let a business build on top of a messaging fabric.

## Visual cues for image generation

- A four-node graph lighting up in sequence: CoAP on a sensor, then
  MQTT at a gateway, then STOMP into a browser dashboard, then AMQP
  into the enterprise back end.
- A stacked-tier diagram showing what each protocol carries: a 4-byte
  CoAP header on UDP at the device, MQTT topics fanning out at the
  broker, a plain-text STOMP frame in a browser, and an AMQP exchange
  routing to three queues.
- An MQTT topic tree like factory/floor-2/press-7/temperature with
  wildcard subscriptions factory/floor-2/# and factory/+/+/temperature
  highlighted alongside.
- An AMQP exchange splitting one inbound stream into three labelled
  queues: monitoring alerts, ERP integration, and data lake ingestion.
- An end-to-end timeline of one temperature reading travelling sensor
  to broker to dashboard to enterprise queue, with each protocol's
  slice coloured in.
