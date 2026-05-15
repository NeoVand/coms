---
id: srdjan-capkun
type: pioneer
name: Srdjan Čapkun
years: "c. 1972–"
title: "ETH Zurich professor; lead of the modern UWB ranging-security research programme"
org: "ETH Zurich — System Security Group"
podcast_target_minutes: 8
protocols: [uwb]
categories: []
related_book_chapters:
  - wireless/uwb
awards: []
image:
  src: null
  alt: "Portrait of Srdjan Čapkun in the ETH Zurich System Security Group lab"
  credit: null
visual_cues:
  - "Portrait of an ETH Zurich professor at a lab bench, a software-defined radio and two UWB development boards in front of him, an oscilloscope showing nanosecond impulse pulses behind"
  - "A pair of UWB devices twelve metres apart on a long corridor, an attacker rig labelled 'sixty-five-dollar device' in the middle, dotted lines collapsing the measured distance from twelve metres to zero"
  - "USENIX Security stage, 2022, a slide reading 'Ghost Peak — Practical Distance Reduction Attacks Against HRP UWB Ranging' with logos for Apple U1, NXP, and Qorvo underneath"
  - "Split composition: on the left, the IEEE 802.15.4z HRP frame structure with the STS field highlighted; on the right, the tightened cipher-suite text of the 802.15.4ab amendment, an arrow between them captioned 'the conversation that moved the standard'"
---

# Srdjan Čapkun

## In one sentence
Srdjan Čapkun is the ETH Zurich professor whose System Security Group spent the better part of a decade taking ultra-wideband ranging apart at the physical layer, and whose 2022 Ghost Peak attack collapsed twelve metres of measured distance to zero against the deployed Apple, NXP, and Qorvo radios that AirTag Precision Finding and BMW Digital Key sit on top of.

## The hook (cold-open)
In 2022, a team led out of ETH Zurich showed up at USENIX Security with a sixty-five-dollar device and a result that the UWB industry could not ignore. They aimed it at the HRP UWB ranging stack that Apple's U1 chip, NXP's automotive radios, and Qorvo's silicon all use — the radios behind AirTag Precision Finding, BMW Digital Key, and the Aliro hands-free unlock standard — and they reduced a real twelve-metre distance to zero, at success rates around four per cent, while the cryptographic timestamp-sequence protection was switched on. The paper was called Ghost Peak. The professor whose group did the work was Srdjan Čapkun.

## The work
Čapkun runs the System Security Group at ETH Zurich. The body of work below was produced with a recurring cast of students and collaborators — Mridula Singh, Patrick Leu, Giovanni Camurati, Marc Roeschlin, Claudio Anliker, and Alexander Heinrich at TU Darmstadt — and it is the academic record that the FiRa Consortium, the Car Connectivity Consortium, and the IEEE 802.15.4ab task group have been responding to. The protocol it lives on top of — the sub-nanosecond impulse-radio at six to nine gigahertz that measures time-of-flight to ten or thirty centimetres — is the one we cover in the UWB episode. What follows is the production: five papers, in four years, that named what the deployed silicon was actually doing wrong.

### UWB-ED and Pulse Reordering — 2019
In 2019 the group published two papers that opened the modern conversation. UWB-ED, at USENIX Security, was about detecting distance-enlargement attacks on ultra-wideband ranging — the class of attack where a relay stretches the apparent time-of-flight. UWB with Pulse Reordering, at NDSS the same year, went the other direction: it proposed a physical-layer construction that reordered the impulse pulses inside a ranging frame to make relay and physical-layer attacks harder to mount. The two papers together set the agenda — distance enlargement and distance reduction as the two failure modes the standard would have to defend against.

### Cicada++ — WiSec 2021
In 2021, at WiSec, the group published a security analysis of the IEEE 802.15.4z high-rate-pulse-repetition mode — the so-called HRP UWB time-of-flight measurement. The paper is filed under the name Cicada++. This is the moment the academic critique stops being about UWB in the abstract and starts being about the specific cipher-suite text of the 802.15.4z standard that Apple and the automotive industry had already chosen.

### Ghost Peak — USENIX Security 2022
The Ghost Peak paper at USENIX Security 2022 is the centre of gravity. It is the first practical distance-reduction attack against HRP UWB ranging as deployed in commercial silicon — explicitly named as Apple U1, NXP, and Qorvo HRP-STS — and it collapses twelve metres to zero with a hand-built sixty-five-dollar attacker device at success rates of around four per cent. The four-per-cent figure matters: a phone-sized car key that occasionally lets an attacker convince the car the key is at the door, on a ranging primitive specifically designed to defeat exactly that attack, is a real production problem, not a paper finding.

### Time for Change — USENIX Security 2023
The 2023 follow-up at USENIX Security, Time for Change, looked at how the clocks themselves break UWB secure ranging — the ways in which clock-drift behaviour at either end of the measurement opens up attack surface that the cipher-suite design did not anticipate. The throughline of the five papers is consistent: the security of UWB ranging is not a property of the cryptographic suite alone, it is a property of the physical layer, the receiver design, and the clock — and any of those can be the gap an attacker drives through.

### What changed because of it
Apple's published reference timestamp-sequence receiver — Luo, Kalkanli, Zhou, Zhan, and Cohen, posted to arXiv in December 2023 — is a direct response to this body of work. The IEEE 802.15.4ab amendment's tighter cipher-suite specification grew out of the same conversation. In other words, the production that came after the Čapkun papers is the next generation of UWB silicon and the next revision of the standard the silicon implements. That is the point of an ETH-style security research programme — the deployed stack moves because the academic critique was specific enough to act on.

## Where they appear in the book
- Part "Wireless," chapter on UWB — the nanosecond-impulse radio that AirTag Precision Finding, BMW Digital Key, and Aliro hands-free unlock all ride on. Čapkun's group is the source of the security story the chapter tells about HRP-STS, distance reduction, and the 802.15.4ab tightening.

## See also (other pioneer episodes)
For the protocol context underneath all of this — how sub-nanosecond impulse radio at six to nine gigahertz actually measures time-of-flight to ten or thirty centimetres, what high-rate-pulse-repetition mode is, and why AirTag Precision Finding and BMW Digital Key picked it — the next thing to play is the UWB episode. The pioneer episodes for the wireless ranging and contactless physical-layer engineers in the same chapter neighbourhood — the people who built the silicon and the standards that Čapkun's group has been pulling apart — sit alongside this one as the implementation half of the same story; this episode is the security half.

## Sources

### Papers
- [UWB-ED: Distance Enlargement Attack Detection in Ultra-Wideband — USENIX Security 2019](https://www.usenix.org/conference/usenixsecurity19)
- [UWB with Pulse Reordering: Securing Ranging against Relay and Physical-Layer Attacks — NDSS 2019](https://www.ndss-symposium.org/ndss2019/)
- [Security analysis of IEEE 802.15.4z/HRP UWB time-of-flight distance measurement (Cicada++) — WiSec 2021](https://dl.acm.org/doi/proceedings/10.1145/3448300)
- [Ghost Peak: Practical Distance Reduction Attacks Against HRP UWB Ranging — USENIX Security 2022](https://www.usenix.org/conference/usenixsecurity22)
- [Time for Change: How Clocks Break UWB Secure Ranging — USENIX Security 2023](https://www.usenix.org/conference/usenixsecurity23)
- [Apple STS reference receiver — Luo, Kalkanli, Zhou, Zhan, Cohen, arXiv:2312.03964 (Dec 2023)](https://arxiv.org/abs/2312.03964)

### Homepage
- [ETH Zurich System Security Group](https://syssec.ethz.ch/)
