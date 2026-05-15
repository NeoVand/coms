---
id: ultra-ethernet
type: chapter
part_id: frontier
part_label: XII
part_title: The Modern Frontier (2024–2026)
title: Ultra Ethernet
synopsis: Replacing RoCEv2 in AI training fabrics — Specification 1.0 published 11 June 2025.
podcast_target_minutes: 15
position_in_book: 78 of 75
listening_order:
  prev: frontier/rpki-aspa
  next: frontier/wifi-7-and-8
related_protocols: [ethernet, udp, ip, tcp, quic]
related_pioneers: []
related_outages: []
related_frontier: [ultra-ethernet-1-0, ethernet-800g]
related_rfcs: []
images: []
visual_cues:
  - "A timeline of UEC milestones: 19 July 2023 — Consortium founded under the Linux Foundation by AMD, Arista, Broadcom, Cisco, Eviden, HPE, Intel, Meta, Microsoft. 11 June 2025 — Specification 1.0 published, 562 pages. June 2025 — AMD Pensando Pollara 400 GbE, the first UEC-compliant NIC, deployed at Oracle Cloud."
  - "A side-by-side comparison panel. Left: RoCEv2 — InfiniBand transport encapsulated in UDP port 4791 over IP and Ethernet, single-path ECMP, lossless via PFC, stateful per-connection, DCQCN congestion control. Right: Ultra Ethernet Transport — packet spraying across all paths, selective retransmission, in-network telemetry-driven congestion, optional credit-based flow control, connectionless ephemeral state for millions of endpoints."
  - "A datacenter rack diagram showing Broadcom Tomahawk 6 — a single 102.4 Tbps switch chip — fanned out three ways: 64 ports at 1.6 terabit, 128 ports at 800 gigabit, 256 ports at 400 gigabit. Caption: one chip, June 2025."
  - "The Jensen Huang power chart. A bar at 180 megawatts labelled 'pluggable optics for 1M GPUs', next to a much shorter bar labelled 'co-packaged optics in Quantum-X Photonics and Spectrum-X Photonics'. Caption: why the optics moved into the switch package."
  - "The Google Jupiter evolution diagram from SIGCOMM 2022. Old Clos with electrical spine on the left; on the right, a direct-connect mesh of aggregation blocks linked by MEMS Optical Circuit Switches under SDN control. Annotations: 5x speed and capacity, 30 percent lower CapEx, 41 percent lower power, more than 13 petabits per second of bisection bandwidth as of 2024."
---

# Part XII, Chapter — Ultra Ethernet

## The hook

Scaling one million GPUs with traditional pluggable optics would burn roughly one hundred and eighty megawatts of power for the optics alone. That is the Jensen Huang argument from Computex 2024, and it is why NVIDIA pivoted to co-packaged optics in Quantum-X Photonics and Spectrum-X Photonics. It is also a clue to the bigger story in this chapter. AI training is now important enough to drive a brand-new datacenter transport — the same kind of pressure that produced Ethernet for office networking in 1973, TCP/IP for inter-network research in 1981, and QUIC for the modern web in 2012. This chapter is about that transport. It is called Ultra Ethernet, and Specification 1.0 landed on 11 June 2025.

## The story

### A New Transport for AI Datacenters

Training a large language model is a networking problem before it is a computing problem. Hundreds of thousands of GPUs have to talk to each other at terabits per second, and they have to do it with microsecond tail latency. The dominant transport for that work today is RoCEv2 — RDMA over Converged Ethernet. It was designed for HPC clusters of a few thousand nodes, and at GPT-scale it shows its age. Head-of-line blocking. Congestion-control issues. Operational complexity. Once a fabric crosses one hundred thousand endpoints, the assumptions that made RoCEv2 elegant start to bend.

The response is the Ultra Ethernet Consortium. It was founded on 19 July 2023 under the Linux Foundation, by nine companies you would expect to see in the same room only when something big is at stake — AMD, Arista, Broadcom, Cisco, Eviden, HPE, Intel, Meta, and Microsoft. NVIDIA joined later, despite its long allegiance to InfiniBand. By the middle of 2025 the consortium had grown past ninety-seven members.

The deliverable arrived on 11 June 2025. Specification 1.0 — about five hundred and sixty pages — is the first major ground-up rethink of how Ethernet carries RDMA traffic. It defines Ultra Ethernet Transport, or UET. The mechanism is a deliberate inversion of RoCEv2's choices. Packet spraying with multipath, instead of a single ECMP-pinned flow. Selective retransmission, instead of go-back-N. In-network telemetry-driven congestion control. Optional credit-based flow control. And ephemeral, connectionless transport state, so that a single switch can track millions of endpoints without per-flow tables. The full mechanism story belongs to the Ethernet episode and to a future UET episode of its own. What matters here is that this is a new transport for a new workload, and it ships.

### What RoCEv2 Looks Like at GPT Scale

To understand why UEC exists, look at what RoCEv2 looks like in production at the high end. RoCEv2 encapsulates InfiniBand transport inside UDP, IP, and Ethernet, using UDP port 4791 — that is the protocol Meta runs on its twenty-four-thousand-GPU clusters to train Llama 3. The SIGCOMM 2024 paper from Meta walks through job-aware traffic engineering, and through one operational decision in particular that tells the whole story. They abandoned DCQCN — Datacenter Quantized Congestion Notification — in favour of collective-library-driven receiver pacing. Translation: they took congestion control out of the network and pushed it up into the AI framework. The mechanics of UDP and the framework of pacing belong to the UDP episode and to the broader congestion-control thread that runs through the TCP episode. The architectural point for this chapter is that an entire research and engineering organisation looked at the standard congestion-control story for these fabrics and decided it was the wrong layer.

UEC's design is the collective lesson of running RoCEv2 at this scale. Per-flow ECMP collapsing onto hot links. Congestion-control oscillations. The cost of stateful per-connection transport in a fabric with one hundred thousand endpoints. So Ultra Ethernet sprays packets across all paths automatically. Selective retransmission keeps a single dropped packet from stalling an entire collective operation. Connectionless transport state lets a switch track millions of endpoints without per-flow tables. AMD's Pensando Pollara 400 GbE is the first UEC-compliant NIC. It was announced in June 2025 and deployed at Oracle Cloud.

Around the new transport, switch silicon is moving fast. Broadcom Tomahawk 6 — one hundred and two point four terabits per second on a single chip — shipped in June 2025. Tomahawk 6-Davisson, with co-packaged optics, shipped in October 2025. A single chip can drive sixty-four ports at one point six terabit, one hundred and twenty-eight ports at eight hundred gigabit, two hundred and fifty-six ports at four hundred gigabit, or five hundred and twelve ports at two hundred gigabit. NVIDIA Spectrum-X, announced at Computex 2024 and deployed by xAI Colossus, by Microsoft, and by CoreWeave, reportedly delivers about ninety-five percent effective throughput on AI workloads, against about sixty percent on best-effort Ethernet. Spectrum-X1600, also at one hundred and two point four terabits per second, is expected in the second half of 2026.

### IEEE 802.3 — The Underlying Speed Bumps

UEC sits on top of an Ethernet that is itself sprinting. IEEE 802.3df-2024, the eight-hundred-gigabit Ethernet standard, was approved on 16 February 2024 and published in March 2024. The next step, IEEE P802.3dj — one point six terabit Ethernet, at two hundred gigabits per lane in PAM-4 — passed its third Working Group recirculation ballot on 16 December 2025 with eighty-seven percent approval. It is expected to be ratified in 2026.

This is where the Jensen Huang argument bites. Scaling to one million GPUs with traditional pluggable optics would consume roughly one hundred and eighty megawatts of power for the optics alone. That is why NVIDIA pivoted to co-packaged optics in Quantum-X Photonics and Spectrum-X Photonics. The optics move into the switch package itself, which eliminates the per-port pluggable transceiver and most of its power overhead.

Google made an analogous move at the topology layer. The SIGCOMM 2022 paper "Jupiter Evolving" describes the move from a Clos network with an electrical spine to a direct-connect mesh of aggregation blocks, joined by MEMS Optical Circuit Switches and managed by SDN. The reported result is five times the speed and capacity, thirty percent lower CapEx, forty-one percent lower power, and more than thirteen petabits per second of bisection bandwidth as of 2024.

There is a commercial layer to all of this too, and it is hard to overstate. The Ethernet switching market exceeded thirty billion dollars in 2021. Dell'Oro forecasts roughly eighty billion dollars over five years, driven by AI fabrics. That is the commercial reason UEC matters even more than the technical one. The architectural significance is that AI training has joined the short list of workloads important enough to drive a new datacenter transport. Office networking did it in 1973. Inter-network research did it in 1981. The modern web did it in 2012. AI training is doing it now.

## The figures

### Ultra Ethernet Consortium 1.0 Spec

UEC 1.0, released in June 2025, is the Ultra Ethernet Consortium's transport specification — a five-hundred-and-sixty-two-page open spec backed by AMD, Arista, Broadcom, Cisco, HPE, Intel, Meta, Microsoft, and dozens of partners, aimed at AI and HPC scale-out fabrics. It is connectionless, unordered, multipath with intelligent packet spray instead of single-path, with packet-trimming and selective retransmission. AMD's Pensando Pollara 400 is the first shipping NIC. The likely RoCEv2 successor for the next generation of GPU clusters — at the scale of one hundred thousand-plus accelerators training a single model, the assumptions baked into RoCEv2 become liabilities. There is more on the Frontier page entry for UEC 1.0.

### 800 GbE Standardised — IEEE 802.3df-2024

IEEE 802.3df-2024 was approved on 16 February 2024, defining eight-hundred-gigabit Ethernet alongside four-hundred-gigabit Ethernet on one-hundred-gigabit lanes. IEEE P802.3dj — covering two hundred gigabits per lane, one point six terabit Ethernet, and updates for two hundred, four hundred, and eight hundred gigabit — is targeting completion in July 2026, although slip risk has been publicly noted. AI training fabrics are the demand engine. Lossless Ethernet with RoCEv2 — Ethernet plus PFC and DCQCN — has been replacing InfiniBand in many large GPU clusters because the operational tooling, vendor diversity, and per-port economics are all better. UEC 1.0 is the next step on that arc.

## Listening order

- **Before this chapter:** "RPKI plus ASPA" — the previous Frontier chapter is about hardening the global routing table; this one is about replacing the transport inside the datacenter.
- **After this chapter:** "Wi-Fi 7 and 8" — the Frontier walks back out from the AI fabric to the air, and to the next two generations of consumer wireless.

## Where to go deeper

- The Ethernet episode picks up the framing, switching, and standards story end to end — from the 1973 PARC sketch through to the 802.3df work that underpins this chapter.
- The UDP episode covers the connectionless transport that UET inherits and reshapes — RoCEv2 itself rides on UDP port 4791.
- The IP episode covers the packet model that UEC's multipath spray fans out across.
- The TCP episode is where the long history of congestion control lives — slow start, AIMD, CUBIC, BBR — the thread that UEC's in-network telemetry-driven design is the latest twist on.
- The QUIC episode is the closest analogue from the public internet — a ground-up new transport on UDP, designed once an existing one stopped scaling for the dominant workload.

## Visual cues for image generation

- A timeline of UEC milestones: 19 July 2023 — Consortium founded under the Linux Foundation by AMD, Arista, Broadcom, Cisco, Eviden, HPE, Intel, Meta, Microsoft. 11 June 2025 — Specification 1.0 published, 562 pages. June 2025 — AMD Pensando Pollara 400 GbE, the first UEC-compliant NIC, deployed at Oracle Cloud.
- A side-by-side comparison panel. Left: RoCEv2 — InfiniBand transport encapsulated in UDP port 4791 over IP and Ethernet, single-path ECMP, lossless via PFC, stateful per-connection, DCQCN congestion control. Right: Ultra Ethernet Transport — packet spraying across all paths, selective retransmission, in-network telemetry-driven congestion, optional credit-based flow control, connectionless ephemeral state for millions of endpoints.
- A datacenter rack diagram showing Broadcom Tomahawk 6 — a single 102.4 Tbps switch chip — fanned out three ways: 64 ports at 1.6 terabit, 128 ports at 800 gigabit, 256 ports at 400 gigabit. Caption: one chip, June 2025.
- The Jensen Huang power chart. A bar at 180 megawatts labelled "pluggable optics for 1M GPUs", next to a much shorter bar labelled "co-packaged optics in Quantum-X Photonics and Spectrum-X Photonics". Caption: why the optics moved into the switch package.
- The Google Jupiter evolution diagram from SIGCOMM 2022. Old Clos with electrical spine on the left; on the right, a direct-connect mesh of aggregation blocks linked by MEMS Optical Circuit Switches under SDN control. Annotations: 5x speed and capacity, 30 percent lower CapEx, 41 percent lower power, more than 13 petabits per second of bisection bandwidth as of 2024.

## Sources

- [Ultra Ethernet Consortium](https://ultraethernet.org/)
- [Hoefler et al. — Ultra Ethernet design principles](https://arxiv.org/html/2508.08906v1)
- [IEEE P802.3dj task force](https://www.ieee802.org/3/dj/index.html)
- [Wikipedia — Terabit Ethernet](https://en.wikipedia.org/wiki/Terabit_Ethernet)
