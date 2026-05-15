---
id: uwb
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: UWB — nanosecond pulses for centimetre ranging
synopsis: IEEE 802.15.4z, FiRa, CCC Digital Key 3.0, Apple U1 / U2, the 2022 Tesla BLE relay attack that motivated the move to UWB, and the Ghost Peak STS residual.
podcast_target_minutes: 15
position_in_book: 35 of 75
listening_order:
  prev: wireless/nfc
  next: wireless/zigbee
related_protocols: [uwb, bluetooth, wifi, nfc]
related_pioneers: [robert-scholtz, moe-win, srdjan-capkun]
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A side-by-side: Bluetooth RSSI as a fuzzy donut around a phone, versus a UWB time-of-flight ruler drawn in centimetres between phone and car door, with the speed of light annotated as the hard upper bound."
  - "A timeline of UWB consumer milestones: 14 February 2002 FCC First Report and Order, 31 August 2020 IEEE 802.15.4z, 10 September 2019 Apple U1 in iPhone 11, 30 April 2021 AirTag, July 2021 CCC Digital Key 3.0, 26 February 2026 Aliro 1.0."
  - "The five-beat ranging exchange: BLE advertise, BLE GATT pairing with STS_KEY transport, UWB Poll, UWB Response, UWB Final, distance — drawn as a swim-lane between phone and car."
  - "A relay attack diagram: parked Tesla Model 3, attacker with a $50 dev board next to the car, accomplice with a second board 25 metres away near the owner's phone, with a red X over the Bluetooth path and a green check over the UWB time-of-flight measurement that would have caught it."
  - "The Scrambled Timestamp Sequence frame layout: AES-128-CTR generates a pseudo-random pulse pattern injected as a distance commitment, with the Ghost Peak attack arrow showing the 4 percent residual that motivated 802.15.4ab."
---

# Part V, Chapter — UWB — nanosecond pulses for centimetre ranging

## The hook

UWB is not a data radio. It is a clock. Two devices fire sub-nanosecond impulses across more than 500 megahertz of spectrum, measure the time-of-flight of a radio pulse, and convert it to distance with 10 to 30 centimetres of accuracy. The point in 2026 is the security of the measurement, not just the precision. Bluetooth signal strength can be faked by a relay 25 metres away. The speed of light cannot.

## The story

### The physics — a clock, not a pipe

Modern UWB transmits Gaussian-monocycle impulses lasting under a nanosecond, spread across at least 500 megahertz of bandwidth. The whole point is to ask one question very precisely — when did this pulse arrive — and turn the answer into distance. Bluetooth received-signal-strength and Wi-Fi round-trip-time cannot match the precision, and they certainly cannot match the security guarantee. We cover the radio link details in the UWB protocol episode; this chapter is the story of how a niche radar idea became the unlock button on tens of millions of cars.

The physical layer is IEEE 802.15.4z-2020, ratified on 31 August 2020. The spectrum is unlicensed under FCC Part 15 Subpart F at minus 41.3 dBm per megahertz, across 3.1 to 10.6 gigahertz. That headroom is the legacy of the FCC First Report and Order issued on Valentine's Day 2002 — the regulatory door-opening that made consumer UWB possible at all. Two channels carry almost all real traffic: Channel 5 at 6489.6 megahertz and Channel 9 at 7987.2 megahertz, each 499.2 megahertz wide.

### The consumer arrival — Apple U1, AirTag, Digital Key

The consumer story starts on 10 September 2019, when Apple shipped the U1 chip in the iPhone 11. It went mass-market on 30 April 2021 with the twenty-nine-dollar AirTag, whose Precision Finding feature swept the world's awareness of UWB into a single product. Samsung followed with the Galaxy SmartTag Plus that same month.

In July 2021 the Car Connectivity Consortium published Digital Key 3.0, making UWB the fine-ranging leg of phone-as-a-key for vehicles. BMW iX shipped first; Mercedes EQS, Hyundai, Kia, and the VW ID.7 followed. On 26 February 2026 the Connectivity Standards Alliance published Aliro 1.0 — the Matter-equivalent for door locks — with NFC tap, BLE proximity, and BLE-plus-UWB ranged unlock as its three transports. NFC is covered in the previous chapter; the BLE proximity leg is the Bluetooth episode.

UWB silicon has consolidated to five suppliers. Apple is captive — U1 on a 16-nanometre process, U2 on 7-nanometre in iPhone 15 and later. Qorvo carries the ex-Decawave DW1000 and DW3000 lineage. NXP ships its Trimension SR040, SR150, and SR250 parts. Samsung is captive with the Exynos Connect U100. A long tail rounds it out — STMicroelectronics, Microchip, Spark Microsystems, and 3db Access, which Infineon acquired in 2024. ABI projects UWB phone penetration rising from 27 percent in 2025 to 52 percent by 2030.

### Why time-of-flight beats signal strength — the 2022 Tesla relay

The reason UWB matters more than its raw precision is that it can prove proximity even when an attacker is actively trying to lie about it. In 2022 NCC Group's Sultan Qasim Khan demonstrated a Bluetooth Low Energy relay attack against a Tesla Model 3, scored CVSS 6.8. The setup was about fifty dollars of dev boards. One sat near the parked car; the other sat near the owner's phone, twenty-five metres away. The relay forwarded BLE traffic with low enough latency that the car believed the phone was right next to it. The car unlocked. The attacker drove it away.

That attack works because Bluetooth proximity is inferred from received signal strength, and any relay can shorten apparent distance simply by forwarding fast. Time-of-flight cannot be shortened by a relay. The speed of light is the hard upper bound. That is the entire reason CCC Digital Key 3.0 and Aliro chose UWB for the ranging leg. It is also why 802.15.4z exists as a security amendment, not just a precision one.

### The crypto move — Scrambled Timestamp Sequences

The cryptographic primitive that makes 802.15.4z secure is the Scrambled Timestamp Sequence, or STS — an AES-128 in counter mode pulse pattern injected into the ranging frame as a distance commitment. The earlier 802.15.4a from 2007 had no such commitment and was trivially vulnerable to early-detect, late-commit pulse-replay attacks. STS closed most of that gap. But not all of it.

In USENIX Security 2022, Patrick Leu and co-authors at ETH Zurich published Ghost Peak — a practical distance reduction attack against deployed Apple U1, NXP, and Qorvo HRP-STS ranging. With a sixty-five-dollar device, the attacker reduced an apparent twelve-metre gap to zero metres at roughly four percent success. Four percent does not sound like much. For a car door that you walk up to dozens of times a year, it is unacceptable.

That residual is exactly what the next standard fixes. IEEE 802.15.4ab — Draft D03 as of September 2025, ratification expected in early 2026 — introduces narrowband-assisted multi-millisecond ranging, called NBA-MMS, and a redesigned STS receiver. Apple's own published reference STS receiver, by Luo, Kalkanli, Zhou, Zhan, and Cohen on arXiv in December 2023, is a direct response to the Ghost Peak body of work.

## The figures

### Robert A. Scholtz

Born 1936. Professor at the University of Southern California Communication Sciences Institute and the theoretical founder of time-hopping impulse radio. His MILCOM 1993 paper, *Multiple-Access with Time-Hopping Impulse Modulation*, presented in Boston on 11 to 14 October 1993, defined the time-hopping spread-spectrum framework that lets many users share a UWB band. With his student Moe Win, he co-authored *Ultra-Wide Bandwidth Time-Hopping Spread-Spectrum Impulse Radio for Wireless Multiple-Access Communications* in IEEE Transactions on Communications, April 2000 — the most-cited UWB physical-layer paper in the field, and the one the FiRa Consortium's own *Introduction to Impulse Radio UWB* white paper cites as foundational. Theoretical grandfather of every modern UWB system, from the AirTag's U1 chip to BMW Digital Key Plus.

### Moe Z. Win

Born around 1962. Robert R. Taylor Professor at MIT and founding director of MIT's Wireless Information and Network Sciences Laboratory in LIDS. Five years at AT&T Research Laboratories and seven at NASA Jet Propulsion Laboratory before MIT; bachelor's from Texas A&M, master's in applied math and PhD in electrical engineering from USC under Robert Scholtz. IEEE Fellow; recipient of the IEEE Eric E. Sumner Award in 2006 for pioneering contributions to ultra-wide band communications science and technology, and the IEEE Kiyo Tomiyasu Award. Co-authored Dardari, Conti, Ferner, Giorgetti, Win — *Ranging With Ultrawide Bandwidth Signals in Multipath Environments*, in Proceedings of the IEEE volume 97 number 2, February 2009 — the canonical reference for UWB time-of-arrival ranging theory in multipath. Every modern double-sided two-way ranging implementation owes its multipath bias model to this paper.

### Srdjan Čapkun

Born around 1972. Professor at ETH Zurich and head of the System Security Group; the most influential single academic voice in modern UWB ranging security. With students and collaborators — Mridula Singh, Patrick Leu, Giovanni Camurati, Marc Roeschlin, Claudio Anliker, and Alexander Heinrich at TU Darmstadt — he produced the body of work that defined what FiRa, the CCC, and IEEE 802.15.4ab had to fix. *UWB-ED: Distance Enlargement Attack Detection in Ultra-Wideband* at USENIX Security 2019. *UWB with Pulse Reordering: Securing Ranging against Relay and Physical-Layer Attacks* at NDSS 2019. *Security analysis of IEEE 802.15.4z/HRP UWB time-of-flight distance measurement*, the Cicada++ paper, at WiSec 2021. *Ghost Peak: Practical Distance Reduction Attacks Against HRP UWB Ranging* at USENIX Security 2022 — the practical attack on deployed Apple U1, NXP, and Qorvo silicon, reducing twelve metres to zero at up to four percent success with sixty-five dollars of hardware. *Time for Change: How Clocks Break UWB Secure Ranging* at USENIX Security 2023. The 802.15.4ab amendment's tighter cipher-suite specification grew directly out of this conversation.

## What you'd see in the simulator

Press play on the UWB ranging simulator and you watch the five beats every consumer UWB session walks. First, the device advertises over Bluetooth Low Energy — that is how UWB even finds its peer, since UWB has no broadcast discovery of its own. Second, BLE GATT pairing transports the STS_KEY — the AES-128 seed that both ends will use to generate the scrambled pulse pattern. Third, the UWB Poll frame goes from initiator to responder. Fourth, the UWB Response frame comes back. Fifth, the UWB Final frame closes the double-sided two-way ranging exchange and both ends compute distance from the four timestamps. The same flow runs underneath AirTag Precision Finding, BMW Digital Key, the Aqara U400 hands-free door lock, and from February 2026 onward, Aliro 1.0 for everyone else.

## What it taught the industry

Three things sit downstream of this chapter.

The first is that proximity is a security primitive, not a UX nicety. The 2022 Tesla relay made it concrete — if your unlock decision is based on signal strength, a fifty-dollar relay can drive your car away. Time-of-flight ranging at the speed of light is the only physical answer, and that is why CCC Digital Key 3.0, Aliro, and a growing fraction of high-end consumer locks now require it. The Bluetooth episode covers the relay surface in more detail.

The second is that opening unlicensed spectrum can take twenty years to pay off. The FCC First Report and Order in February 2002 made consumer UWB legal. The Apple U1 in September 2019 made it consumer-relevant. That is seventeen and a half years between the regulatory door opening and the product moment. AirTag and Digital Key followed within twenty-four months of U1. The lag was not the silicon. It was the use case.

The third is that physical-layer security is iterative, not one-shot. 802.15.4a in 2007 had no STS and was attackable. 802.15.4z in 2020 added STS and closed most of the gap. Ghost Peak in 2022 found the four-percent residual. 802.15.4ab in 2026 redesigns the receiver to close it. Each round shipped because researchers — Čapkun's group most prominently — kept publishing the attacks that the standards bodies then had to answer.

## Listening order

- **Before this chapter:** *NFC — 4 cm of wireless that runs the global payment rails.* NFC sets up UWB by drawing the contrast — NFC's security model is "you have to be touching it"; UWB's is "you have to be at the cryptographically-attested distance".
- **After this chapter:** *Zigbee, Thread, and the Matter bridge.* The next family of low-power short-range radios — but optimised for sensors and meshing rather than ranging.

## Where to go deeper

- **The UWB protocol episode** picks up the mechanism — double-sided two-way ranging timestamps, the Channel 5 versus Channel 9 choice, HRP versus LRP physical layers, and the bit-level structure of the Scrambled Timestamp Sequence.
- **The Bluetooth episode** is the bootstrap path for every consumer UWB session — BLE advertise, GATT pairing, and the STS_KEY transport that hands UWB its cryptographic seed — and is also the radio whose RSSI weakness motivated the move to UWB in the first place.
- **The Wi-Fi episode** is the alternative ranging story — 802.11mc Fine Timing Measurement and 802.11az Next Generation Positioning — which is why some indoor-location stacks use Wi-Fi RTT instead of UWB.
- **The NFC episode** is the third leg of the Aliro lock transport stack and the previous chapter in this part.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
