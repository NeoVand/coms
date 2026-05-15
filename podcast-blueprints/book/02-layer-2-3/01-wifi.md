---
id: wifi
type: chapter
part_id: layer-2-3
part_label: III
part_title: Layer 2-3 Foundations
title: Wi-Fi
synopsis: CSMA/CA on the airwaves; from FCC Docket 81-413 to Wi-Fi 8.
podcast_target_minutes: 15
position_in_book: 19 of 75
listening_order:
  prev: layer-2-3/ethernet
  next: layer-2-3/arp-and-ndp
related_protocols: [wifi, ethernet]
related_pioneers: []
related_outages: []
related_frontier: [wifi-7-ratified]
related_rfcs: []
images:
  - src: ""
    caption: "FCC Docket 81-413, the 9 May 1985 order that opened the 902 MHz, 2.4 GHz, and 5.8 GHz ISM bands for unlicensed spread-spectrum use."
    credit: "FCC archives"
visual_cues:
  - "Three ISM bands as labeled bars on a frequency axis — 902 MHz, 2.4 GHz, 5.8 GHz — with a 1985 stamp from the FCC and Michael Marcus's name underneath."
  - "A timeline of Wi-Fi generations from 802.11 in 1997 at 2 Mbps to 802.11be (Wi-Fi 7) in 2024 at 46 Gbps, each generation as a step on a staircase."
  - "Mathy Vanhoef on a conference stage with a slide deck behind him: KRACK 2017, Dragonblood 2019, FragAttacks 2021, Framing Frames 2023, SSID Confusion 2024 — five summers, five Wi-Fi breaks."
  - "The TJX Marshalls store in Miami with a war-driving car parked outside, a WEP key floating above the antenna, and a counter ticking up to 94 million card records."
  - "A split map of the 6 GHz band: the US side green and labeled '1,200 MHz unlicensed since April 2020', the EU side red and labeled '6585-7125 MHz reassigned to mobile/5G, November 2025'."
---

# Part III, Chapter — Wi-Fi

## The hook

Mathy Vanhoef has broken Wi-Fi every two years on stage. KRACK in 2017. Dragonblood in 2019. FragAttacks in 2021. Framing Frames in 2023. SSID Confusion in 2024. The cadence is so reliable that the field plans security audits around his summer talks. This is the chapter on the protocol that runs on every laptop, phone, and thermostat on Earth, and somehow still gets dismantled every other August.

## The story

### The Regulatory Big Bang

Wi-Fi exists because of one FCC order. Docket 81-413, signed on 9 May 1985 and championed by an FCC engineer named Michael Marcus, opened three slices of spectrum — 902 MHz, 2.4 GHz, and 5.8 GHz — to unlicensed spread-spectrum use. No license, no auction, no telco gatekeeper. Without that order, no consumer wireless networking could have existed at all.

The IEEE 802.11 working group started up in 1990. The first standard shipped in 1997 at one and two megabits per second. The breakthroughs the public actually noticed were 802.11b in 1999 at eleven megabits and 802.11g in 2003 at fifty-four. By the time most listeners heard the word "Wi-Fi," the underlying physics had been sitting in an ISM band for almost two decades.

And here is the fundamental physical problem the standard had to solve. Radios cannot listen and transmit at the same time. So a Wi-Fi station cannot detect collisions the way wired Ethernet does — Ethernet's whole story, which is the previous chapter, is built around a transmitter that listens to the wire while it sends. Wi-Fi cannot do that. So instead of collision detection, it does collision avoidance: CSMA/CA. Before transmitting, a station waits a random backoff window scaled by how much traffic it senses. Every unicast frame must be acknowledged within microseconds, or the sender retransmits. The exact mechanism — beacons, association, the four-way handshake, the airtime arbitration — is the Wi-Fi protocol episode. For now the thing to hold onto is that half-duplex operation, mandatory acknowledgements, and shared spectrum together cap real-world Wi-Fi throughput at roughly sixty percent of the headline number on the box.

One small piece of trivia that engineers love getting wrong. "Wi-Fi" is not an acronym. Phil Belanger of the Wi-Fi Alliance confirmed in 2005 that the branding agency Interbrand picked the name from a list of ten candidates. "Wireless Fidelity" was a tagline retrofitted briefly by the WECA board and then dropped. The yin-yang logo is also Interbrand's work. There is no fidelity. There is just a name a brand consultancy liked.

### Wi-Fi 7 Is Here, Wi-Fi 8 Is Different

Wi-Fi 7 launched on 8 January 2024, when the Wi-Fi Alliance opened certification. The underlying IEEE amendment, 802.11be, was approved on 26 September 2024 and published on 22 July 2025. The headline features are the kind of thing that fits on a marketing slide: 320 megahertz channels in the 6 gigahertz band, 4096-QAM, Multi-Link Operation, and preamble puncturing. Theoretical peak around forty-six gigabits per second. The minimum the standard required was thirty.

Now here is the thing everyone gets wrong about Multi-Link Operation. In shipping silicon, MLO is mostly a mode called eMLSR — Enhanced Multi-Link Single Radio. It is not true simultaneous transmit-receive across bands. eMLSR uses one radio time-sliced across multiple bands. Throughput does not add. What you actually get from MLO in real chips is latency consistency, not raw aggregate bandwidth. If you're picking gear because the box says "multi-link," that's the asterisk.

Wi-Fi 8 is going to confuse a lot of people, because it is explicitly not a peak-speed upgrade. 802.11bn uses the same bands as Wi-Fi 7, the same 320 megahertz max, the same forty-six gigabit physical layer peak. What Wi-Fi 8 promises instead is twenty-five percent more throughput at a given signal-to-interference-plus-noise ratio, twenty-five percent lower 95th-percentile latency, and twenty-five percent fewer dropped frames during roaming. The headline features are Multi-AP Coordination, a Seamless Roaming Domain, and Distributed Resource Units. Targeted ratification: September 2028. The interesting Wi-Fi work for the next four years is reliability, not megabits.

The scale this is shipping at is worth a number. In 2025 alone, the industry shipped 583 million Wi-Fi 7 devices. The full Wi-Fi device count for that year was 3.9 billion units. Cumulative lifetime: 48.8 billion. Annual global economic value attributed to Wi-Fi: 4.9 trillion dollars. This is a layer-two protocol that grew up to become a continent.

### Vanhoef Every Two Years

Back to the pull-quote. Mathy Vanhoef and the KU Leuven team have, for the better part of a decade, broken Wi-Fi on stage every two years like clockwork. KRACK in October 2017 — key reinstallation against the four-way handshake. Dragonblood in April 2019 — side channels in WPA3's SAE password derivation. FragAttacks in May 2021 — fragmentation and aggregation flaws in nearly every Wi-Fi device shipped. Framing Frames in March 2023. And then SSID Confusion, CVE-2023-52424, disclosed in May 2024 — which exposed the fact that the 802.11 standard does not require the SSID to enter the PMK or session-key derivation in many configuration paths. So a client can be tricked about which network it actually joined.

Five summers, five public dismantlings of the world's most-deployed link layer. The cadence is so reliable that, as the chapter puts it, the field plans audits around his talks.

### The 6 GHz Politics, And the TJX Story That Changed Everything

Two regulatory stories are running on top of all of this, and they pull in opposite directions.

In the United States, the FCC freed 1,200 megahertz of 6 gigahertz spectrum on 23 April 2020 — the largest unlicensed allocation in the agency's history. Then, on 23 February 2024, the FCC's Office of Engineering and Technology approved seven Automated Frequency Coordination operators — Qualcomm, Federated Wireless, Sony, Comsearch, the Wi-Fi Alliance Services arm, the Wireless Broadband Alliance, and Broadcom — to run commercial Standard Power AFC. The first AFC-certified Wi-Fi 7 access point, the RUCKUS R770, was certified on 16 April 2024. North America is open for business in 6 gigahertz.

Europe went the other way. On 12 November 2025, the EU Radio Spectrum Policy Group recommended assigning the upper 6 gigahertz band, 6585 to 7125 megahertz, to mobile and 5G, holding the slice from 6425 to 6585 pending the next World Radio Conference in 2027. That effectively closes the upper band to Wi-Fi in the EU for the medium term. The Wi-Fi Alliance, in a statement, "strongly disagrees." The political fight over who owns the upper 6 gigahertz band is one of the defining wireless arguments of the late 2020s.

And then there is the breach that, more than any cryptographic paper, taught the industry that wireless security was not a checkbox. TJX, the parent of Marshalls and TJ Maxx, disclosed on 17 January 2007 that attackers had war-driven a poorly secured Wi-Fi network at a Marshalls store in Miami starting in July 2005. The network was protected by WEP — the original, broken, 1997-vintage Wi-Fi encryption. Roughly 94 million customer card records were exfiltrated. TJX settled with 41 state attorneys general for 9.75 million dollars. The breach drove WPA2 mandates across the retail industry and effectively ended WEP deployment in any serious enterprise. This is one of the incidents we will come back to in the Famous Outages and Breaches part of the book.

One last development worth flagging. On 26 September 2025, the IEEE published 802.11bf — Wi-Fi sensing. The amendment standardises the use of channel state information for presence, motion, and even breathing detection, across the full 1 to 7.125 gigahertz range and above 45 gigahertz. Radio waves as occupancy sensors. The same hardware that carries your Zoom call can, in principle, tell whether someone is in the room and whether they are breathing.

## The figures

### Wi-Fi 7 (IEEE 802.11be) Ratified

802.11be was published on 22 July 2025 after more than five years of drafting. The headline features are 320-megahertz channels in 6 gigahertz, 4096-QAM at twelve bits per symbol, Multi-Link Operation across 2.4, 5, and 6 gigahertz simultaneously, preamble puncturing to skip interfered subcarriers without losing the whole channel, and restricted Target Wake Time. The Wi-Fi Alliance opened certification on 8 January 2024. By late April 2026 the Alliance reported more than 500 million Wi-Fi 7-certified devices shipped, and IDC was projecting 120 million Wi-Fi 7 access-point shipments by the end of 2026. Wi-Fi 8 — 802.11bn, branded Ultra High Reliability — reached Draft 1.0 in July 2025, with final ratification scheduled for March 2028. There is more on this in the Frontier section of the book.

## What you'd see in the simulator

Press play and the simulator walks the full Wi-Fi association lifecycle. First, the access point is broadcasting beacon frames on its channel, advertising the network. The client picks one and starts authentication — in the WPA3 case, that means SAE, the Simultaneous Authentication of Equals exchange that replaced the old pre-shared-key handshake. Once authenticated, the client associates and is handed an Association ID, its short-form identifier on this BSS. Then the four-way handshake runs to derive the encryption keys for the session. And finally, with keys in place, real data begins flowing — every frame queued under CSMA/CA, every unicast frame acknowledged, the access point bridging from 802.11 over the air to 802.3 on the wire toward the rest of the network. The exact frame formats and the cryptographic detail of SAE belong in the Wi-Fi protocol episode.

## What it taught the industry

Wi-Fi taught the industry three lessons that stuck.

First, that an unlicensed spectrum allocation is one of the most consequential pieces of regulation a government can sign. One docket from the FCC in 1985 produced a 4.9-trillion-dollar annual economy by 2025.

Second, that branding can outlive engineering. "Wi-Fi" is not an acronym. "Wireless Fidelity" was never the protocol. The name is a logo from a brand agency that the entire planet now uses unselfconsciously.

Third, and this is the bitter one — that complexity in a security protocol almost guarantees you a Mathy Vanhoef talk in two years. KRACK, Dragonblood, FragAttacks, Framing Frames, and SSID Confusion all exploit edges and corners of an enormously complicated standard. The Wi-Fi 8 design choice — to spend the next four years on reliability and roaming rather than peak speed — is partly an admission that piling more features onto an already brittle stack has costs.

## Listening order

- **Before this chapter:** "Ethernet" — the wired layer-two story whose framing, addressing, and switching Wi-Fi was explicitly built to extend over the air.
- **After this chapter:** "ARP and NDP" — once an access point has bridged a wireless frame onto the wire, somebody has to map the destination IP to a MAC. That is the next chapter.

## Where to go deeper

- The Wi-Fi protocol episode picks up the mechanism story — beacons, the SAE authentication exchange, the four-way handshake, CSMA/CA backoff, and the four-address frame format that makes wireless bridging work.
- The Ethernet protocol episode covers the wired side that the access point translates to and from — the EtherType field, switch MAC learning, and the jump from shared coax to switched full-duplex links.
- The Frontier section has the full Wi-Fi 7 ratification entry, with the device-shipment and access-point-shipment numbers updated as the certifications roll out.

## Visual cues for image generation

- A frequency-axis diagram with the three 1985 ISM bands — 902 MHz, 2.4 GHz, 5.8 GHz — boxed and labeled, with a stamp reading "FCC Docket 81-413, 9 May 1985, Michael Marcus."
- A staircase chart of Wi-Fi generations: 802.11 in 1997 at 2 Mbps, 802.11b in 1999 at 11, 802.11g in 2003 at 54, Wi-Fi 4 in 2009 at 600, Wi-Fi 5 in 2014 at 1 Gbps, Wi-Fi 6 in 2020, Wi-Fi 7 in 2024 at 46 Gbps.
- Mathy Vanhoef on a conference stage with five tombstones behind him: KRACK 2017, Dragonblood 2019, FragAttacks 2021, Framing Frames 2023, SSID Confusion 2024.
- A war-driving scene outside a Marshalls store in Miami, 2005, with a laptop antenna picking up a WEP-protected SSID and a counter rolling toward 94 million records.
- A split-screen map of the 6 GHz band: US side, "1,200 MHz unlicensed, April 2020"; EU side, "6585-7125 MHz reassigned to mobile, November 2025."
