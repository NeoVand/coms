---
id: ethernet
type: chapter
part_id: layer-2-3
part_label: III
part_title: Layer 2-3 Foundations
title: Ethernet
synopsis: From PARC coaxial cable to 800 GbE in AI training fabrics.
podcast_target_minutes: 15
position_in_book: 18 of 75
listening_order:
  prev: story-of-the-internet/the-ai-agent-layer
  next: layer-2-3/wifi
related_protocols: [ethernet, tcp, quic]
related_pioneers: [bob-metcalfe, david-boggs]
related_outages: [facebook-2021]
related_frontier: [ultra-ethernet-1-0, ethernet-800g]
related_rfcs: []
images:
  - src: ""
    caption: "Bob Metcalfe's hand-drawn diagram from the 22 May 1973 Alto Ethernet memo at Xerox PARC."
    credit: "Xerox PARC archives"
visual_cues:
  - "A side-by-side diagram of the Ethernet II frame in 1980 and in 2025 — six bytes destination MAC, six bytes source MAC, two bytes EtherType, up to 1500 bytes payload, four-byte CRC — labelled identical at 10 Mbps and 800 Gbps."
  - "Metcalfe's 22 May 1973 PARC memo, hand-drawn, with the word 'Ether' circled and an arrow pointing to a coaxial cable carrying packets between Alto workstations and a laser printer."
  - "A speed-doubling timeline: 2.94 Mbps (1973), 10 Mbps (1983), 100 Mbps (1995), 1 GbE (1999), 10 GbE (2002), 100 GbE (2010), 400 GbE (2017), 800 GbE (2024), 1.6 TbE (2026), each tagged with the IEEE 802.3 letter suffix."
  - "A Broadcom Tomahawk 6 die shot annotated as 102.4 Tbps, with port-count options fanned out: 64x1.6T, 128x800G, 256x400G, 512x200G."
  - "An AI training fabric: tens of thousands of GPUs wired in a fat-tree of 800 GbE links, with one labelled callout — 'NVIDIA Spectrum-X: ~95% effective throughput vs ~60% on best-effort Ethernet.'"
---

# Part III, Chapter — Ethernet

## The hook

Ethernet is the longest-running standard in computing that still runs the original spec. The 1973 PARC sketch and a 2025 Ultra Ethernet switch share the same frame format. Six bytes of destination MAC, six of source, two of EtherType, up to 1500 bytes of payload, four bytes of CRC. That layout has carried every wired packet you've ever sent.

## The story

### The Aloha Inheritance

In 1971, the University of Hawaii ran a wireless packet network called ALOHAnet that solved the multiple-access problem with brutal honesty: anyone can transmit at any time; if two stations collide, both back off a random interval and try again. The throughput was awful. Norman Abramson's original paper showed a maximum channel utilisation of 18 percent. But the architecture was right.

On 22 May 1973, Bob Metcalfe at Xerox PARC circulated the "Alto Ethernet" memo with hand-drawn diagrams. He named it after the discredited "luminiferous ether" so the medium could be coax, twisted pair, fiber, or radio — there's a Bob Metcalfe episode coming up that walks through that decision and the rest of his career. Combined with carrier sensing — listen before you transmit — and collision detection — stop the moment you hear a clash — CSMA/CD pushed wired-medium utilisation past 90 percent. Metcalfe and David Boggs had a 2.94 Mbps prototype running by 11 November 1973. The original speed was chosen because it matched the Alto's clock divided down. The David Boggs episode covers his hardware work and the PARC Universal Packet architecture that followed.

The IEEE standardised it as 802.3 in 1983, the same year as the ARPANET flag-day cutover from NCP to TCP/IP. Speeds doubled approximately every five years: 10 Mbps in 1983, 100 Mbps Fast Ethernet in 1995, 1 GbE in 1999, 10 GbE in 2002, 100 GbE in 2010, 400 GbE in 2017. Bob Metcalfe won the 2022 ACM A.M. Turing Award, announced March 2023, for the invention, standardization, and commercialization of Ethernet.

There's a nice piece of trivia about why every modern Ethernet frame is at least 64 bytes long. The original 10 Mbps coaxial Ethernet had to detect collisions before completing a frame transmission. Round-trip time across the maximum 2.5 km, four-repeater diameter is 51.2 microseconds. At 10 Mbps, that's exactly 64 bytes. Modern switched full-duplex Ethernet has no collisions — but the minimum stays for backwards compatibility. Forty-five years later, every 800 GbE frame still respects the slot-time math from a 10 Mbps shared coax in 1980.

### The Frame Format That Never Changed

Six bytes of destination MAC, six of source, two of EtherType, then up to 1500 bytes of payload, then a 4-byte CRC. That is the Ethernet II frame in 1980 and in 2025. Everything that scaled — bandwidth, switching, VLANs (802.1Q), jumbo frames — slid in around it without breaking the wire format. The mechanism story for how a switch learns MAC addresses, builds its forwarding table, and floods unknowns is the Ethernet protocol episode.

Jumbo frames at 9000 bytes, popularised by Alteon in 1998, are still technically non-standard 28 years later. The 1500-byte MTU from the 1980 DIX choice — DEC, Intel, Xerox — still rules in production internet links. Routers MUST support 1500. Jumbo frames MAY be supported per peering agreement. The conservative default has held because changing it requires every device on a path to agree, and one device that does not is a black hole.

The naming history is its own joke. The 802.3 letter suffixes ran out at "z" — that's 1000BASE-X — forcing 802.3aa, 802.3ab, and so on, eventually arriving at 802.3df for 800 GbE and 802.3dj for 1.6 TbE. The standards process kept producing letters faster than the alphabet could supply them.

### AI Training Fabrics — The Current Gold Rush

IEEE 802.3df-2024, the 800 GbE standard, was approved 16 February 2024 and published a month later. IEEE P802.3dj — 1.6 TbE at 200 Gb/s/lane PAM-4 — passed its third Working Group recirculation ballot on 16 December 2025 with 87 percent approval. Ratification is expected mid-2026.

The 2025 milestone in the silicon is Broadcom Tomahawk 6 — the world's first 102.4 Tbps single-chip switch — which shipped 3 June 2025. Tomahawk 6-Davisson, with co-packaged optics, shipped that October. A single chip can drive 64 by 1.6T, 128 by 800G, 256 by 400G, or 512 by 200G ports.

The Ultra Ethernet Consortium Specification 1.0 was published 11 June 2025 — about 560 pages. It's the first ground-up rethink of how Ethernet carries RDMA traffic for AI and HPC workloads. It defines Ultra Ethernet Transport, or UET: packet spraying with multipath, selective retransmission, in-network telemetry-driven congestion control, and ephemeral connectionless transport state for millions of endpoints.

650 Group estimates 91 percent of AI workloads will run on Ethernet by 2029. NVIDIA Spectrum-X delivers around 95 percent effective throughput for AI workloads, versus around 60 percent on best-effort Ethernet. The architectural significance is that AI training is now important enough to drive a new datacenter transport — the same kind of pressure that produced Ethernet in 1973 for office networking, TCP/IP in 1981 for inter-network research (covered in the TCP episode), and QUIC in 2012 for the modern web (covered in the QUIC episode).

## The figures

### Bob Metcalfe

Born 1946. Built the first 2.94 Mbps Ethernet in 1973 at Xerox PARC with David Boggs to connect Alto workstations to laser printers. Co-authored the seminal "Ethernet: Distributed Packet Switching for Local Computer Networks" in *Communications of the ACM*, July 1976. Co-authored the DIX (Digital, Intel, Xerox) Ethernet specification in 1980, which IEEE 802.3 ratified in 1983. Founded 3Com in 1979 to commercialize Ethernet. Four decades later, every wired network on the planet — from a home router to an 800 Gbps AI training cluster — runs Ethernet at the link layer. ACM Turing Award (2022), IEEE Medal of Honor (1996), National Medal of Technology (2003). There's a separate Bob Metcalfe episode.

### David Boggs

Born 1950, died 2022. Co-invented Ethernet at Xerox PARC with Bob Metcalfe in 1973, building the original 2.94 Mbps coaxial-cable system that connected Alto workstations. Designed and built much of the original PARC Ethernet hardware. Co-authored the 1976 CACM paper that introduced Ethernet to the world. Later developed the PARC Universal Packet (PUP) architecture and worked at DEC on early routing systems. There's a separate David Boggs episode.

### The Facebook Disappearance

October 4, 2021. A routine maintenance command on Meta's global backbone disconnected the data centres from each other. Meta's DNS edge servers, isolated from the data centres they needed to answer authoritatively, did exactly what they were designed to do — they withdrew their own BGP advertisements. From the outside, Facebook, Instagram, WhatsApp, and Oculus ceased to exist for roughly six hours. Three billion users dark. Public resolvers like 1.1.1.1 and 8.8.8.8 saw a 30x query surge. Internal tools depended on the same DNS. Badge readers depended on the same network. Engineers were reportedly dispatched to data centres with bolt cutters. Estimated revenue impact crossed $60 million; Mark Zuckerberg's net worth dropped by more than $6 billion in a day. The full account is in the Famous Outages part of the book.

### 800 GbE Standardised — IEEE 802.3df-2024

Approved 16 February 2024 and published in 2024. Defines 800 GbE and 400 GbE on 100 Gb-per-lane optics. IEEE P802.3dj — covering 200 Gb-per-lane, 1.6 TbE, and updates for 200/400/800 G — is targeting completion in July 2026, though slip risk has been publicly noted. AI training fabrics are the demand engine. "Lossless Ethernet" with RoCEv2 is replacing InfiniBand in many large GPU clusters because the operational tooling, vendor diversity, and per-port economics are all better. Full launch entry is on the Frontier page.

### Ultra Ethernet Consortium 1.0 Spec

Published 11 June 2025. A 562-page open spec by AMD, Arista, Broadcom, Cisco, HPE, Intel, Meta, Microsoft, and dozens of partners for AI/HPC scale-out fabrics. Connectionless, unordered, multipath — intelligent packet spray instead of single-path — with packet trimming and selective retransmission. AMD's Pensando Pollara 400 is the first shipping NIC. The likely RoCEv2 successor for the next generation of GPU clusters: at the scale of 100,000-plus accelerators training a single model, the assumptions baked into RoCEv2 (single-path, lossless via PFC, no out-of-order) become liabilities. Full entry on the Frontier page.

## What you'd see in the simulator

The Ethernet simulation in the app shows frame switching on a LAN. Press Play and you watch a station construct a frame — destination MAC, source MAC, EtherType, payload, CRC — and hand it to a switch. The switch, knowing nothing yet, floods the frame out every port except the one it arrived on. Along the way it learns: it remembers which port the source MAC came from, so the next time anyone sends to that MAC, the frame is unicast to a single port instead of flooded. After a few exchanges the switch's forwarding table is populated and the LAN settles into clean point-to-point delivery. That's the entire mechanism that made shared-coax Ethernet obsolete and turned every 10 Mbps collision domain into a switched full-duplex link.

## What it taught the industry

Three things sit downstream of this chapter.

The frame format is the contract. The DIX trio in 1980 picked a 14-byte header, a 1500-byte MTU, and a 4-byte CRC, and that contract has held across nine speed jumps and a dozen physical media. Bandwidth, switching, VLANs, jumbo frames, lossless RDMA — every advance slid in around the frame instead of breaking it. That is why a 1973 sketch and a 2025 Ultra Ethernet switch share a wire format. The lesson for protocol design is that the long-lived layer is the framing, not the speed.

Backwards compatibility costs are paid forever. The 64-byte minimum frame is a 1980 collision-domain artifact, kept alive in 800 GbE silicon because changing it would break something. The 1500-byte MTU has the same shape — jumbo frames have been deployable for 28 years and are still non-standard because every device on a path has to agree. The conservative default wins because the failure mode of changing it is silent black-holing.

AI training is the new pressure. The same kind of demand that produced Ethernet in 1973 for office networking — and TCP/IP in 1981 for inter-network research, and QUIC in 2012 for the modern web — is now producing Ultra Ethernet for hyperscale GPU fabrics. 91 percent of AI workloads on Ethernet by 2029, per the 650 Group estimate. 102.4 Tbps on a single switch chip. A 562-page open transport spec from a consortium that includes every major hyperscaler and silicon vendor. The protocol Bob Metcalfe sketched at PARC in 1973 is, fifty-two years later, the substrate of the model-training era.

## Listening order

- **Before this chapter:** *The AI Agent Layer (2024–)* — closes out the story of the internet by showing how agentic systems are reshaping demand on the wire. That demand is exactly what's driving the 800 GbE and Ultra Ethernet story you just heard.
- **After this chapter:** *Wi-Fi* — Ethernet's wireless cousin, which extends the same MAC-address world over 802.11 radio and bridges 802.11 frames to 802.3 frames at the access point.

## Where to go deeper

- **The Ethernet protocol episode** picks up the mechanism story — the frame fields in detail, MAC address learning at a switch, the difference between flooding and unicast forwarding, VLANs and 802.1Q tagging, and how full-duplex switching killed CSMA/CD.
- **The TCP episode** is the transport layer that rides on top of Ethernet for almost every reliable byte stream on the planet — connection setup, sequence numbers, retransmission, and the long evolution of congestion control from Tahoe through CUBIC to BBR.
- **The QUIC episode** is the 2012 Google-designed UDP-based transport that combines TLS 1.3 and HTTP/2-style multiplexing into a single 1-RTT handshake, and is now the basis for HTTP/3.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [Cloudflare — Understanding how Facebook disappeared from the Internet](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Wikipedia — 2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
- [Ultra Ethernet Consortium](https://ultraethernet.org/)
- [Hoefler et al. — Ultra Ethernet design principles](https://arxiv.org/html/2508.08906v1)
- [IEEE P802.3dj task force](https://www.ieee802.org/3/dj/index.html)
- [Wikipedia — Terabit Ethernet](https://en.wikipedia.org/wiki/Terabit_Ethernet)
- [Bob Metcalfe — Wikipedia](https://en.wikipedia.org/wiki/Robert_Metcalfe)
- [David Boggs — Wikipedia](https://en.wikipedia.org/wiki/David_Boggs)
