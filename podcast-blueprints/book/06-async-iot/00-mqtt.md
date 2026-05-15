---
id: async-iot/mqtt
type: chapter
part_id: async-iot
part_label: VII
part_title: Async / IoT
title: MQTT
synopsis: Sensors, satellites, and 2-byte publish overhead — designed in 1999 to instrument oil pipelines.
podcast_target_minutes: 15
position_in_book: chapter 46 of 75
listening_order:
  prev: web-api/mcp-and-a2a
  next: async-iot/amqp
related_protocols: [mqtt, quic]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A 1999 oil pipeline diagram with VSAT satellite uplinks marked in kilobits per second, every byte priced, with a 2-byte MQTT fixed header overlay."
  - "Side-by-side packet diagrams of the smallest possible MQTT control packet at 2 bytes versus a typical TCP+TLS handshake byte count."
  - "Pub/sub topology with one broker in the center, sensors publishing to topics like farm/north/soil-moisture on the left, and a dashboard plus an irrigation controller subscribing on the right."
  - "Timeline from the 1999 Argo draft through MQ Integrator Pervasive Device Protocol in late 1999, MQTT 3.1 royalty-free in 2010, OASIS 3.1.1 on 29 October 2014, ISO/IEC 20922 in 2016, MQTT 5.0 on 7 March 2019, and Sparkplug 3.0 as ISO/IEC 20237:2023 on 7 November 2023."
  - "A logo wall — Facebook Messenger, Tesla, Ring, AWS IoT Core, Matter — labeled by the year each adopted MQTT, anchored by Lucy Zhang's 2011 Messenger decision."
---

# Part VII, Chapter — MQTT

## The hook

MQTT was drafted in 1999 by Andy Stanford-Clark of IBM and Arlen Nipper of Arcom Control Systems to instrument Phillips 66 oil pipelines over a brand-new VSAT satellite link. The fixed header is 2 bytes. That was not aesthetic — it was a budget item. This is the chapter on the protocol that was designed for the worst network on earth and ended up running Facebook Messenger, Tesla cars, and the Matter smart-home standard.

## The story

### Designed for the Worst Network on Earth

MQTT stands for Message Queuing Telemetry Transport, and it was drafted in early 1999 by Andy Stanford-Clark at IBM Hursley and Arlen Nipper at Arcom Control Systems. The job was to instrument Phillips 66 oil pipelines over a VSAT satellite link that was brand new at the time. The constraint set was brutal. Satellite links measured in kilobits per second, priced per byte. Devices that ran for years on a single battery. Network drops measured in hours, not seconds.

The internal name during the first draft was the Argo Lightweight On The Wire Protocol. By later in 1999 it was renamed MQ Integrator Pervasive Device Protocol — MQIpdp — before the team finally settled on MQTT in version 3 in 2000. The MQ prefix is a vestige of IBM MQSeries, IBM's enterprise message queue product, even though MQTT itself does not implement queues. OASIS, when it took over the standard, formally treats MQTT as the protocol name itself rather than an acronym, and has done so since 2013.

The 2-byte fixed header is the headline number. The smallest possible Control Packet — a PINGREQ, the keepalive that tells the broker the device is still alive — is 2 bytes total. Every other design choice in the protocol falls out of that per-byte thrift. That is what made MQTT viable on a satellite uplink in 1999, and it is what makes it viable on a battery-powered cellular IoT module in 2026.

### How It Works — and the Sparkplug ISO Standard

The architecture is publish-subscribe through a central broker. Sensors publish to topics with hierarchical names like `farm/north/soil-moisture`. Subscribers — a dashboard, an irrigation controller, an analytics pipeline — receive every message published to topics that match their subscription. Producers and consumers do not need to know about each other. The broker handles routing.

MQTT defines three quality-of-service levels: at-most-once, at-least-once, and exactly-once. The application picks the trade between reliability and bandwidth. A persistent session survives disconnections, so when a sleeping sensor wakes up an hour later and reconnects, the broker delivers any messages it missed. How that session state and the publish acknowledgement flow actually work on the wire is the MQTT protocol episode.

Two patterns now considered universal in messaging systems were invented inside MQTT in 1999. Last Will and Testament is a message a client hands to the broker on connect, and the broker publishes it on the client's behalf if the client dies ungracefully. Every other subscriber learns immediately that the sensor is offline, without polling, even though the failed sensor cannot send anything itself. Retained messages are the broker holding onto the latest value on a topic, so a late subscriber gets the current state on subscribe rather than waiting for the next publish. Both ideas trace back to that 1999 draft.

The standardization timeline matters because it explains why MQTT is everywhere now. IBM released MQTT 3.1 royalty-free in 2010. MQTT 3.1.1 was approved by OASIS on 29 October 2014, with editors Andrew Banks and Rahul Gupta from IBM. ISO/IEC 20922 added the international stamp in 2016. MQTT 5.0 — 137 pages versus 81 for 3.1.1 — was published on 7 March 2019. And then in 2023 something new happened on top of the protocol. Sparkplug 3.0, the industrial-IoT application layer specification from Cirrus Link and the Eclipse Foundation, was ratified as ISO/IEC 20237:2023 on 7 November 2023. That was the first time an MQTT application layer became an international standard. Sparkplug 4.0 is in development inside the Eclipse working group as of late 2025.

### Facebook Messenger and the IoT Logo Wall

There is a callout in the chapter that gives the protocol its second life. Facebook Messenger has used MQTT since 2011. Lucy Zhang's team picked it with, in her words, just a few weeks until launch, to drop perceived send latency from seconds to hundreds of milliseconds on mobile. That is the moment MQTT crossed from oil-pipeline telemetry into consumer messaging at planetary scale.

The logo wall got long after that. Tesla's vehicles use MQTT to phone home. Ring doorbells run on it. AWS IoT Core is built on it. The Matter smart-home standard runs MQTT or its variants. Google Cloud IoT Core also ran on it — until Google retired the service on 16 August 2023, which we'll come back to in a minute.

### The 2024 CVE Wave and the QUIC Frontier

2024 brought a CVE wave. CVE-2024-10525 was an out-of-bounds read in libmosquitto, triggered by a crafted SUBACK packet, affecting versions 1.3.2 through 2.0.18 and fixed in 2.0.19 in October 2024. Alongside it, a 2024 broker double-free in bridge topic remapping. The lesson is the same one that MQTT 5.0 already embedded in its design: the protocol surface is intentionally small, but the implementations are intricate, and small protocols still ship complicated brokers.

The Google Cloud IoT Core retirement on 16 August 2023 is still driving architecture decisions in 2024 through 2026. Operators are migrating to AWS IoT, Azure Event Grid MQTT, EMQX, and HiveMQ. The lesson for IoT operators is that hyperscaler-managed IoT services have higher churn risk than the protocol itself. The protocol is twenty-six years old. The managed service was eight.

The frontier is MQTT over QUIC. There is no ratified OASIS standard as of May 2026. EMQX 5.x ships production support and is preparing a draft proposal through the OASIS MQTT Technical Committee, but the work is vendor-led, not standardised. A new MQTT-SN — the sensor-network variant — OASIS working draft was uploaded on 1 May 2025 by chair Ian Craggs. What QUIC actually changes underneath a transport — combining the transport handshake with the TLS handshake, killing head-of-line blocking, supporting connection migration — is the QUIC episode.

## What you'd see in the simulator

If you press play in the app, the simulator traces a publish-subscribe round trip end to end. An IoT device opens a connection to the broker. It subscribes to a topic. It publishes a sensor reading to another topic. The simulator highlights the 2-byte fixed header on every control packet so you can see why the byte budget works on a kilobit satellite link. You watch the broker route the published message to every subscriber whose subscription matches the topic. The keepalive PINGREQ — the smallest possible MQTT packet at 2 bytes total — appears between exchanges so the sleeping sensor can stay registered without burning bandwidth.

## Listening order

- **Before this chapter:** *MCP and A2A — the close of the Web and API part, where the agent-protocol world is still bound to HTTP and JSON-RPC. MQTT is what the same publish-subscribe instinct looks like when you start from a satellite link instead of a browser.*
- **After this chapter:** *AMQP — the other 1999-era message protocol, designed inside JPMorgan for financial messaging rather than oil pipelines. Same era, opposite end of the byte-budget spectrum.*

## Where to go deeper

- The MQTT protocol episode picks up the mechanism — the three quality-of-service levels on the wire, session persistence, retained messages, Last Will and Testament, and how the 2-byte fixed header is actually framed.
- The QUIC episode covers the transport that the MQTT-over-QUIC frontier is built on — the 1-RTT handshake, the elimination of head-of-line blocking, and connection migration across network changes.

## Visual cues for image generation

- A 1999 oil pipeline diagram with VSAT satellite uplinks marked in kilobits per second, every byte priced, with a 2-byte MQTT fixed header overlay.
- Side-by-side packet diagrams of the smallest possible MQTT control packet at 2 bytes versus a typical TCP plus TLS handshake byte count.
- A pub/sub topology with one broker in the center, sensors publishing to topics like `farm/north/soil-moisture` on the left, and a dashboard plus an irrigation controller subscribing on the right.
- A timeline from the 1999 Argo draft through MQ Integrator Pervasive Device Protocol in late 1999, MQTT 3.1 royalty-free in 2010, OASIS 3.1.1 on 29 October 2014, ISO/IEC 20922 in 2016, MQTT 5.0 on 7 March 2019, and Sparkplug 3.0 as ISO/IEC 20237:2023 on 7 November 2023.
- A logo wall — Facebook Messenger, Tesla, Ring, AWS IoT Core, Matter — labeled by the year each adopted MQTT, anchored by Lucy Zhang's 2011 Messenger decision.
