---
id: uwb
type: protocol
name: Ultra-Wideband
abbreviation: UWB
etymology: "[U]ltra-[W]ide[b]and — a transmitter is legally UWB under FCC §15.503 only if its fractional bandwidth is at least 0.20 of centre frequency or its absolute −10 dB bandwidth is at least 500 MHz"
category: wireless
year: 2019
rfc: IEEE 802.15.4z-2020 (HRP UWB) / FiRa MAC
standards_body: IEEE 802.15 Working Group / FiRa Consortium / Car Connectivity Consortium / CSA
podcast_target_minutes: 22
related_book_chapters:
  - wireless/uwb
related_protocols: [bluetooth, wifi, nfc, tls]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Apple_AirTag.svg/330px-Apple_AirTag.svg.png
    caption: "Apple's AirTag (30 April 2021, $29) is the product that put UWB into the public vocabulary. Inside is a U1 chip plus a BLE radio, with the Find My network of close to a billion participating Apple devices acting as a global crowdsourced locator. The U2-equipped second-generation AirTag shipped in January 2026 with 1.5 times longer Precision Finding range and an integrated speaker that is harder to physically remove — anti-stalking hardening directly motivated by the AirTag stalking cases of 2021–22."
    credit: Image — Wikimedia Commons (CC BY-SA)
visual_cues:
  - "A row of sub-nanosecond Gaussian monocycle pulses on a time axis, annotated with a 499.2 MHz channel bandwidth bracket below them, the BPRF mean rate of 64 MHz labelled, and the FCC EIRP ceiling of −41.3 dBm/MHz drawn as a dashed horizontal line across the spectrum on the right-hand panel."
  - "The DS-TWR three-message dance as a vertical timeline: initiator on the left, responder on the right, three diagonal arrows for Poll, Response, Final. All six timestamps t1–t6 labelled at their endpoints. Below the diagram, the cross-product formula T_round1·T_round2 minus T_reply1·T_reply2, divided by their sum, with a caption that reads 'cancels relative clock drift to first order — DS-TWR shrugs off 20 ppm crystal offset where SS-TWR would yield 1.2 metres of bias.'"
  - "A side-by-side comparison of two attack scenes. On the left, a 2022 Tesla Model 3 sitting in a driveway, an iPhone 25 metres away inside the house, and a $50 BLE relay device 3 metres from the car drawn as a small blue box — labelled 'BLE RSSI: a relay can shorten the apparent distance.' On the right, the same scene with a UWB anchor on the door pillar and the speed-of-light light cone drawn as a triangle around the legitimate phone — labelled 'UWB time-of-flight: a relay can only make the distance look longer, never shorter.'"
  - "A CCC Digital Key 3.0 unlock as an annotated swimlane: BLE advertising, GATT pairing with SPAKE2+, APDU exchange with the Secure Element, BLE-encrypted STS_KEY transport, then four UWB ranging frames (one Poll plus one Response plus one Final, drawn three times across multiple anchors), then ToF computation, then the door handle popping out. Total elapsed time labelled as 200 to 800 milliseconds across the bottom."
  - "An IEEE 802.15.4z HRP-ERDEV frame with packet configuration 1, drawn as horizontal coloured bands: SHR preamble (64 to 4096 symbols) then SFD (8 symbols) then PHR (19 bits) then PSDU (variable) then STS segment (32 to 2048 chips, shaded with a noise pattern to suggest the AES-128-CTR keystream) then FCS (16 bits). Callout to the STS band reads 'AES-128-CTR(STS_KEY, nonce ‖ counter) — distance commitment.'"
  - "An evolutionary tree of UWB silicon. Top: 1990s Time Domain and Pulse-LINK. Middle: Decawave DW1000 (2014) branching to Qorvo DW3000, NXP Trimension SR040/150/250, Samsung Exynos Connect U100, Apple U1 (16 nm, iPhone 11, 2019). Bottom: Apple U2 (7 nm, iPhone 15, 2023), STMicro ST64UWB (18 nm FD-SOI, first commercial 802.15.4ab silicon, late 2025/Q1 2026), 3db Access acquired by Infineon (2024). Arrows colour-coded by which products they enabled — AirTag, BMW iX, Aqara U400."
---

# UWB — Ultra-Wideband

## In one breath

UWB is not a data radio — it is a clock. Modern UWB transmits sub-nanosecond Gaussian-monocycle pulses across at least 500 MHz of spectrum so that two devices can measure the time-of-flight of a radio pulse and convert it to distance with 10 to 30 cm accuracy. Bluetooth RSSI and Wi-Fi RTT cannot match that. The point in 2026 is the security of the measurement, not just the precision: a relay can only make a UWB exchange look longer, never shorter. That single asymmetry is why your BMW unlocks itself when you walk up to it, why your AirTag can guide you to within an inch of your keys, and why the smart-lock industry just published Aliro 1.0.

## The pitch (cold-open)

On Valentine's Day 2002, the FCC opened a swathe of spectrum from 3.1 to 10.6 gigahertz to a technology nobody outside a few defence labs had really used. The bet failed almost immediately — Wi-Fi and Bluetooth ate every consumer use case the WiMedia Alliance dreamed up, and by 2009 consumer UWB was dead. Then on 10 September 2019, Apple slipped a tiny chip called the U1 into the iPhone 11 and didn't even mention it at the keynote. Two years later, an AirTag could find your keys behind the couch to the centimetre, and a BMW iX would unlock as you walked toward it. And then, in May 2022, an NCC Group researcher drove a parked Tesla away from 25 metres using $50 of Bluetooth dev boards — and gave every car-key engineer the strongest argument they would ever hear for replacing signal-strength proximity with cryptographically-bounded radio time-of-flight. This is the radio that came back because it stopped trying to send data and started trying to tell time.

## How it actually works

The wireless chapter on UWB walks through the regulatory and historical arc — Henning Harmuth's non-sinusoidal-waveform theory in the 1960s, the FCC's First Report and Order in 2002, the IEEE 802.15.3a deadlock that killed consumer MB-OFDM at Waikoloa in January 2006, and the quiet 802.15.4a ratification in 2007 that nobody noticed at the time. Listen to that episode for the story; this one stays on mechanism.

UWB has three layers of concern: the impulse-radio physical layer, the ranging protocols on top, and the cryptographic primitive that makes the ranging trustworthy.

### Header at a glance

An IEEE 802.15.4a/4z HRP-ERDEV frame, in packet configuration 1, lays out as:

- **SHR (Synchronisation Header)** — 64 to 4096 preamble symbols followed by an 8-symbol Start-of-Frame Delimiter. The receiver acquires symbol timing on the preamble and traditionally takes the first-path arrival timestamp on the SFD. Longer preamble gives better sensitivity at the cost of air time.
- **PHR (PHY Header)** — 19 bits in HRP. Two bits for data rate (00 = 850 kbps, 01 = 6.81 Mbps, 10 = 27 Mbps), seven bits for frame length, one ranging-frame indicator, three reserved or spreading bits, and six bits of SECDED parity.
- **PSDU** — the MAC frame, up to 127 bytes. For DS-TWR this carries the timestamp payload (t2 and t3 in the Response; t1, t4, t5 in the Final).
- **STS segment** — one, two, or four segments of 32 to 2048 chips each, generated by AES-128 in Counter mode over the per-session STS_KEY and a per-frame nonce. This is the cryptographic timestamp anchor. Position in the frame is configurable: packet configuration 1 puts it after the PSDU, configuration 2 between SHR and PHR, configuration 3 is STS-only.
- **FCS / CRC-16** — 16 bits, integrity over the PSDU.

The two channels everyone actually uses are Channel 5 at 6489.6 MHz and Channel 9 at 7987.2 MHz, each 499.2 MHz wide. Average power spectral density is capped at −41.3 dBm/MHz under FCC §15.519 — essentially the §15.209 background-unintentional-radiator threshold. UWB devices may not emit more than ordinary unintentional radiators do, despite being intentional transmitters. That tiny power budget is what makes UWB unobtrusive enough to be unlicensed.

### State machine in three sentences

A consumer UWB ranging session is not a connection in the TCP sense — it is a short scheduled burst, bracketed by a longer-lived BLE session that does the hard work of discovery, authentication, and key transport. The CCC Digital Key 3.0 state machine runs IDLE → BLE_DISCOVERY → BLE_AUTH → UWB_SESSION_KEY_TRANSFER → UWB_RANGING_ACTIVE → DISTANCE_CHECK → UNLOCK_GRANTED or UNLOCK_DENIED, with NFC_FALLBACK as a side branch when BLE or UWB fails or the phone's battery is critically low. The ranging round itself is just three RFRAMEs (Poll, Response, Final) inside the active state, and a typical end-to-end unlock takes 200 to 800 milliseconds.

### Reliability, security, and the four ranging paradigms

There are four ranging paradigms in production. **SS-TWR** (Single-Sided Two-Way Ranging) is two messages — Poll, Response — and the initiator subtracts the responder's stated reply delay before halving. With 20 ppm crystals and a 200 µs reply delay, that yields about 4 ns of error, which is roughly 1.2 metres of bias. Nobody ships SS-TWR for anything that matters.

**DS-TWR** (Double-Sided Two-Way Ranging) is three messages. Poll, Response (carrying t2 and t3), Final (carrying t1, t4, t5). The cross-product `(T_round1·T_round2 − T_reply1·T_reply2) / (T_round1 + T_round2 + T_reply1 + T_reply2)` cancels the relative clock drift to first order. This is the production method in 802.15.4z — Apple, BMW, NXP, Qorvo all run it. Multiply ToF by the speed of light (about 0.299792458 m/ns) and you have a distance.

**TDoA** (Time Difference of Arrival) is the infrastructure flavour. A tag chirps once; three or more time-synchronised anchors compute the difference of arrival times. This is what Sonitor runs in hospitals and Zebra runs in warehouses, with anchors hard-wired and PTP-grade clock distribution.

**AoA / PDoA** (Phase-Difference of Arrival) is direction. Two antennas spaced about λ/2 apart — roughly 1.9 cm at 8 GHz — compare phase to derive angle. AirTag Precision Finding combines DS-TWR distance with PDoA direction across the iPhone's multiple internal antennas.

The security primitive is **STS — the Scrambled Timestamp Sequence**. The vulnerability that 802.15.4a shipped with in 2007 is that its preamble and SFD patterns are public. An attacker can predict the next pulse and inject an early replica that the receiver locks onto, shortening apparent distance. That is the Cicada and Early-Detect / Late-Commit attack family, and Tippenhauer, Luecken, Kuhn, and Capkun demonstrated it through 2014–2019.

802.15.4z replaces the predictable preamble-derived timestamp with a 32-to-2048-chip pulse sequence whose positions come from AES-128 in Counter mode keyed by a per-session STS_KEY and a per-frame nonce. An attacker without the key sees noise; the receiver, holding the same key, generates the expected sequence locally and cross-correlates with a sharp autocorrelation peak that is fresh every frame. That is the **distance commitment** that defeats the BLE-RSSI relay class of attack — because while a relay can stretch a UWB exchange, the speed of light caps how short it can make it look.

## Where it shows up in production

**Apple AirTag.** Launched 30 April 2021 at $29 single, $99 four-pack. BLE for the Find My network ping, U1 UWB for the centimetre Precision Finding inside about 5 metres. The Find My network of approaching a billion participating Apple devices is the world's largest crowdsourced locator. Apple does not publish unit shipments; third-party estimates sit in the tens of millions per year between 2022 and 2025. The second-generation AirTag shipped in January 2026 with the U2 chip, 1.5 times longer Precision Finding range, a louder and harder-to-remove speaker, and Apple Watch Series 9-and-later support.

**BMW Digital Key Plus.** Announced 13 January 2021, customer rollout from early 2022. The first production CCC Digital Key 3.0 vehicle. BMW jointly developed the spec with Apple and the CCC, and was the first OEM to receive CCC Digital Key Certification. Available now on iX, i7, X5/X6/X7, 7 Series, 5 Series, and the MINI Countryman in markets where the feature is enabled. The walk-up unlock is the canonical UX: BLE detects you, UWB confirms which side of the door you are on, the handle pops out as you reach for it.

**Mercedes-Benz EQS / S-Class** runs NFC-plus-UWB CCC Digital Key 3.0 across the flagship lineup with NXP SR1xx silicon in the vehicle anchors. NFC handles the dead-battery fallback; UWB handles walk-up authentication. **Hyundai Ioniq 5 and Kia EV6** moved from Digital Key 2.0 (NFC-only) to 3.0-class UWB on later trims and 2024-plus model years. **Volkswagen ID.7** shipped UWB digital key in 2024.

**Aqara U400 plus Apple Home Key plus Aliro 1.0.** The Aqara U400 is the first commercial smart lock to ship with UWB. It started Apple-Home-Key-only — meaning the experience worked only for iPhone owners. Aliro 1.0, published by the CSA on 26 February 2026, comes via firmware update announced at CES 2026, and the same lock will work hands-free with Android, Samsung, and any Aliro-compliant wallet. Launch partners include Apple, Google, Samsung, ASSA ABLOY, NXP, Infineon, STMicroelectronics, Silicon Labs, Nordic Semiconductor, plus smart-lock makers Schlage, Avia, Nuki, Xthings.

**Samsung Galaxy SmartTag+.** Shipped April 2021, the first non-Apple UWB tracker. Works with Galaxy S21+, S21 Ultra, Note 20 Ultra, S22/S23/S24 (UWB-equipped models) for AR-based directional finding via SmartThings Find. Samsung's Exynos Connect U100 in-house silicon shipped in the Note 20 Ultra in August 2020 — Samsung was technically first to a phone with UWB silicon, just a year after Apple's U1.

**Industrial RTLS.** Sonitor runs clinical-grade hospital asset tracking — patients, equipment, surgical instruments. Zebra Technologies runs warehouse forklift and pallet tracking at high anchor density. Apex Locate focuses on manufacturing. These are TDoA-anchor deployments at typical density of one anchor per 20 to 30 square metres for centimetre accuracy, with anchors wired over Ethernet using PTP-grade clock distribution. Cisco partnered with Sewio in October 2019 to integrate UWB into wireless access points; the strategy has been slow to mature.

**The iPhone install base** is the largest UWB ecosystem in the world. Apple shipped over a billion iPhones from the iPhone 11 onwards by mid-decade — though the iPhone SE 1/2/3, the iPhone 16e, and the iPhone 17e do not include a UWB chip. ABI Research projects UWB penetration in smartphones rising from 27% in 2025 to 52% by 2030.

## Things that go wrong

**The 2008–2009 collapse of MB-OFDM Wireless USB** is the founding cautionary tale and the wireless chapter on UWB tells the full story: three years of deadlock in IEEE 802.15.3a between the WiMedia Alliance's Multi-Band OFDM camp (Intel-led) and the UWB Forum's Direct-Sequence camp (Freescale-led), 24 failed down-select votes, the Waikoloa interim on 19 January 2006 where the task group voted to recommend its own dissolution, and the WiMedia Alliance closing in 2009. Wireless USB shipped anyway, then died anyway.

What did not die was the impulse-radio camp's 802.15.4a amendment, ratified quietly in 2007 with almost no one paying attention. That seed grew into 4z (2020), into FiRa, into every U1-equipped iPhone. The lesson the chapter lands on is brutal: the standards-body politics killed the use case UWB was being designed for, and saved the use case nobody had bothered to predict.

**The 2022 NCC Group Tesla Model 3 BLE relay** is the case for UWB. On 15 May 2022 NCC Group's Sultan Qasim Khan publicly disclosed a link-layer BLE relay against Tesla Model 3 / Y phone-as-a-key (CVSS 6.8). Roughly $50 of Bluetooth dev boards. About 8 ms of relay latency, well under Tesla's 30 ms GATT threshold. Test setup: 2020 Model 3, iPhone 13 mini 25 metres from the car, relay device 3 metres from the car — vehicle unlocked and driven away. The same technique works against Kwikset/Weiser Kevo smart locks. Tesla's stopgap was PIN-to-Drive; the deeper industry response was the adoption of UWB-backed CCC Digital Key 3.0. RSSI proximity assumes an attacker cannot relay the radio with low enough latency. Cryptographically-bounded distance ranging cannot be relay-attacked because the speed of light caps how short the apparent distance can become.

**Ghost Peak (USENIX Security 2022)** showed that STS is not a silver bullet without careful receiver design. Patrick Leu, Giovanni Camurati, Alexander Heinrich, Marc Roeschlin, Claudio Anliker, Matthias Hollick, and Srdjan Capkun — out of ETH Zurich and TU Darmstadt — built the first practical distance-reduction attack against deployed Apple U1-to-U1 ranging and U1-to-NXP / Qorvo combinations. Reduces 12 metres to 0 metres at up to 4% success per ranging round, with a $65 attacker device. The technique exploits how STS receivers integrate correlation peaks: randomly injected STS-like signals get misread as a low-power early copy of the real signal. Apple's response — Luo, Kalkanli, Zhou, Zhan, Cohen, arXiv:2312.03964 (December 2023) — is a redesigned STS receiver design with a security proof under the documented attack model. It is a rare instance of Apple silicon engineers publishing peer-reviewable threat analysis. The redesign work eventually fed into IEEE 802.15.4ab, with NBA-MMS as the next-round defence.

**The AirTag stalking saga** is the dual-use lesson. The same characteristics that make AirTag useful — $29, year-long battery, anonymous global Find My relay, U1 centimetre tracking when in range — make it a stalking tool. Reports surfaced within months of launch: National Post in Canada documented AirTags placed on cars in shopping-mall lots for follow-home thefts; BBC News in January 2022 spoke to six women who had found AirTags on themselves or their belongings. Apple reduced the separation chirp time from 3 days to 8–24 hours, then released the Tracker Detect Android app in December 2021 (scan-only, no background detection). The real fix had to be cross-platform. Apple and Google jointly published draft-ledvina-apple-google-unwanted-trackers at IETF in May 2023. The IETF DULT (Detecting Unwanted Location Trackers) Working Group was chartered after Birds-of-a-Feather sessions at IETF 117 and 118 in 2023. Google's Find My Device network launched on Android on 8 April 2024 with native AirTag-class detection. The second-generation AirTag in January 2026 added the louder, harder-to-remove speaker as a hardware-level anti-stalking change. Hughes v. Apple, the class-action filed December 2022, failed class certification in March 2024, but more than thirty individual cases proceed.

## Common pitfalls (for the practitioner)

**Channel choice — start with Channel 5, plan for Channel 9.** UWB has 16 HRP channels but only two see real-world use: Channel 5 at 6489.6 MHz and Channel 9 at 7987.2 MHz. Older Qorvo DW1000 silicon supports only Channel 5; everything from DW3000, NXP SR150, and Apple U1 onwards supports both. Japanese regulations restrict 7.25 to 7.75 GHz, which clips Channel 9 in Japan. For interoperability fallback, support Channel 5 — it works everywhere. For isolation from 6 GHz Wi-Fi 6E, prefer Channel 9 where regulation allows and fall back to Channel 5 in Japan and a few other jurisdictions. CCC Digital Key 3.0 mandates both. Verify against ETSI EN 302 065 in the EU and Japanese radio law before launch.

**STS and cipher suite — turn it on, and watch the receiver.** Pre-STS UWB is exploitably vulnerable to distance-decrease attacks. Even 4z STS, naively implemented, was broken by Ghost Peak and Cicada++ at about 4% success. For any 2024-plus design: require STS in all production ranging modes; use FiRa's current cipher-suite recommendations rather than rolling your own; treat the STS receiver as a security-critical component subject to the same review as cryptographic code (Apple's published reference receiver in arXiv:2312.03964 is the current academic state of the art); plan for IEEE 802.15.4ab silicon support as it becomes available, particularly NBA-MMS, which significantly improves both link budget and anti-injection robustness.

**AoA antenna geometry — get the spacing right.** PDoA angle estimation requires at least two antennas spaced about λ/2 apart. At 6.5 GHz, λ/2 is about 2.3 cm; at 8 GHz, about 1.9 cm. Spacing larger than λ/2 introduces angular ambiguity; spacing significantly smaller degrades angular resolution. For 3D angle (azimuth plus elevation), use three antennas in an L-shape or 2D array. Apple's U1 antennas are placed along the iPhone frame for a reason; door-handle UWB anchors typically use planar PCB patches with carefully controlled ground planes.

**BLE-bootstrap fragility.** Every consumer UWB session opens over BLE. BLE pairing failures, GATT timeouts, or BLE link loss during the UWB session derail the whole interaction. Make UWB ranging idempotent — a failed ranging round should not invalidate the BLE session key; allow retries. Set BLE GATT response timers generously enough to allow STS_KEY transport before UWB starts (100 to 300 ms typical). Provide an NFC fallback for the unlock UX (the CCC Digital Key 3.0 design pattern) so that when BLE handshake fails or the device's battery is critically low, the NFC tap-to-unlock path keeps the user in their car. Log BLE and UWB transition failures separately for diagnostics — they look identical to the user but have different root causes.

**Line-of-sight is everything; NLOS gives positive distance bias.** UWB resolves multipath at about 1 ns, which is 30 cm. But in non-line-of-sight conditions through walls, people, or metal, the first path may be heavily attenuated and the receiver locks onto a later, stronger reflection — yielding a positive distance bias of tens of centimetres to a metre. Use first-path detection algorithms rather than peak detection. Modern chips expose first-path index and confidence metrics. Apply NLOS bias correction using channel-impulse-response features; recent Adaptive Kalman Filter work in MDPI Sensors 25(24):7682 (2025) shows 30 to 50% accuracy improvement. Place infrastructure anchors to maximise LOS to the working volume; ceiling mounts are typical in warehouse and hospital RTLS.

**Power consumption — UWB ranging is not cheap.** A single DS-TWR ranging round on a Qorvo DW3000 or NXP SR150 draws on the order of milliamps for 1 to 3 ms, versus BLE scan or advertise at hundreds of microamps. A 1 Hz ranging cadence adds about 3 mA average on a tag — material on a coin-cell-powered AirTag-class device. Range on demand only — gate UWB ranging on a BLE proximity event, not continuously. Use BPRF (about 64 MHz mean PRF) on the tag side rather than HPRF. Use 4ab NBA-MMS as it becomes available; the narrowband-assist signalling lets you wake the UWB radio only for scheduled millisecond slots. Profile end-to-end power before launch.

**Regional regulatory masks.** US Part 15.519 caps average PSD at −41.3 dBm/MHz across 3.1 to 10.6 GHz. ETSI EN 302 065 in Europe is similar with stricter Detect-and-Avoid in some sub-bands. Japan applies a different mask with restrictions in 7.25 to 7.75 GHz overlapping Channel 9; Apple's iPhone reduces or disables UWB features (Precision Finding, Find People) in Japan and a handful of other countries. Korea and individual jurisdictions further constrain commercial UWB. For a global product: geo-fence UWB features based on locale; default to Channel 5 in Japan; support a no-UWB mode for countries where UWB is not permitted at all.

## Debugging it

UWB does not have a friendly pcap story. The Wireshark IEEE 802.15.4 dissector handles the 4z MAC frame but cannot decode the PHY-level STS keystream without the key. Useful filters: `wpan` for all 802.15.4 traffic, `wpan.frame_type == 0x01` for data frames (ranging frames are data with the RFRAME flag), `wpan.fcf.ranging_capable` for the ranging-capable indication in the FCF, `wpan.security_enabled` for frames with auxiliary security headers.

For the actual ranging side, the Qorvo DW3000 evaluation board exposes raw PSDU plus first-path index plus STS-quality metric over USB. Snoop on a DW3000 dev board's serial console with `minicom -D /dev/ttyACM0 -b 115200`; the firmware decodes ranging rounds and prints distance per round (`RX RFRAME seq=0 from 0x0102 STS_OK first_path_index=750 rssi=-67 dBm` followed by `DS-TWR result: distance = 1.42 m, std = 6.2 cm`).

FiRa UCI (the UWB Command Interface) is the standard host-to-UWB-subsystem protocol. UCI traffic over the AP's HCI USB transport can be captured with `hcidump -X -i hciX` for the BLE bootstrap and `nrfutil sniff --device /dev/ttyUSBn` for 802.15.4 sniffer mode (the nRF52840 is 4z-capable). On macOS paired with an iPhone, `sudo /usr/bin/sysdiagnose -A SysDiagnose -d` grabs UWB controller logs; search the bundle for the `NearbyInteraction` and `StaticArbitrator` subsystems.

For DS-TWR debugging end to end, capture both sides simultaneously with two sniffers and correlate by frame counter — the cross-product timing only makes sense when you can see both sides' timestamps. For the BLE-side handshake of a CCC Digital Key session, use a normal BLE sniffer (Nordic nRF Sniffer, Ellisys, Adafruit Bluefruit LE Sniffer); the UWB portion is invisible to BLE sniffers, so you need the UWB-chip sniffer in parallel.

## What's changing in 2026

**26 February 2026 — CSA Aliro 1.0 published.** The CSA's PKI-based access-control credential standard for door locks. Three transports: NFC tap, BLE proximity, BLE-plus-UWB ranged hands-free. ECDSA mutual authentication; credentials provisioned into Apple, Google, and Samsung wallets. First products: Aqara U400 (Aliro coming via firmware update) and Kwikset Halo Select Plus. The most consequential UWB-related deployment of 2026 — Aliro generalises the Apple Home Key user experience across Android.

**January 2026 — second-generation AirTag with U2.** 1.5 times longer Precision Finding range than the U1. Louder speaker that is harder to physically remove (anti-stalking hardware). Apple Watch Series 9-plus Precision Finding support.

**Late 2025 / Q1 2026 — STMicroelectronics ST64UWB.** The first commercial monolithic IEEE 802.15.4ab chip with integrated narrowband-assist, on 18 nm FD-SOI with about 3 dB link-budget gain over bulk-CMOS implementations. Forvia Hella, LG Innotek, and Marquardt have endorsed it for next-generation digital car keys.

**September 2025 — IEEE P802.15.4ab Draft D03.** The next-generation UWB amendment progressed to Draft D03 (D02 was March 2025). Ratification is expected early 2026 per ABI Research and STMicroelectronics. Headline additions: NBA-MMS (Narrow-Band-Assist Multi-Millisecond Sensing), where a narrowband control channel synchronises, wakes, and schedules UWB ranging — dramatically improving link budget and power; new radar/sensing modes for in-cabin child-presence detection (driven by EU Euro NCAP rules from 2025); LRP-plus-HRP dual-mode hardware support; tighter integrity options around STS. FiRa Consortium announced in October 2025 it will integrate 4ab enhancements into future specifications.

**July 2025 — CCC Digital Key 4.0 announced.** Tested at the 13th Plugfest hosted by Apple. Adds device-to-device key sharing across Android and iOS, validates backward compatibility with 3.0 vehicles. The CCC reports 115 vehicle and module products certified across 2025: BMW (first cert late 2024), Mercedes, Hyundai/Kia, Audi (new for 2025), VW, Porsche, GM, Ford, plus Chinese OEMs (NIO, XPENG, Geely brands). HRP UWB under 802.15.4z remains the secure default.

**8 April 2024 — Google Find My Device launches on Android** with native AirTag-class unwanted-tracker detection. The cross-platform interoperability the EFF and stalking advocates demanded — and the first concrete output of the IETF DULT collaboration that started in 2023.

**26 November 2024 — NXP Application Note AN12791 Rev. 1.9** on Bluetooth LE for CCC Digital Key R3, the current best free vendor-side reference for CCC implementations.

## Fun facts (host material)

The FCC adopted UWB regulations on Valentine's Day, 14 February 2002 — the First Report and Order in ET Docket 98-153 (FCC 02-48, 17 FCC Rcd 7435), released 22 April 2002, effective 15 July 2002. The −41.3 dBm/MHz EIRP limit is essentially the §15.209 background-unintentional-radiator threshold. UWB devices may not emit more than ordinary unintentional radiators do, despite being intentional transmitters. It was hard-won against GPS (operating at L1 = 1575.42 MHz), avionics, and DoD interests who feared aggregate interference into safety-of-life systems.

The "U" in Apple's U1 and U2 stands for Ultra-Wideband. Apple's silicon naming convention runs by family letter — A-series application processor, M-series Mac, W-series wireless, H-series headphone, T-series secure enclave, S-series watch SiP, R-series Vision Pro. U1 (iPhone 11, September 2019) was the first Apple-designed UWB chip. U2, announced 12 September 2023, internal codename T2024, part number 339M00298, moved from 16 nm to 7 nm and was the first Apple silicon other than the A and M series to receive its own keynote slide.

FiRa stands for Fine Ranging — the original FiRa Consortium press release from 1 August 2019 made the etymology explicit. FiRa now certifies interoperability and runs the FiRa MAC profile for application-layer ranging configuration; member roster spans Apple, Samsung, NXP, Bosch, HID, Sony, and roughly 200 others.

AirTag spawned its own pop-culture genre on Twitter / X. Through 2021 and 2022, accounts amassed followers posting "found an AirTag in my jacket pocket at the airport / in my car after a date / in my luggage" threads. These stories drove enormous public awareness of UWB's existence — most non-engineers had never heard of UWB before they heard of AirTags — and accelerated the cross-industry safety standardisation that became the IETF DULT working group.

The iPhone 16e and 17e do not have UWB. Apple removed it from the e-lineup as a cost-down. Precision Finding for AirTag works on iPhone 11 through 17, except 16e and 17e (and the pre-iPhone-11 SE models). Anti-stalking unwanted-tracker detection still works via BLE on every iPhone. If you are scoping a UWB feature for an iOS app in 2026, gate on `NISession.isSupported` rather than assuming "modern iPhone implies UWB" — it will save you a support ticket later.

Smart-lock and EV-charging makers have had to file FCC waivers to mount UWB anchors on door frames and ground pads. Despite UWB being unlicensed under Part 15 Subpart F since 2002, the rule §15.519(a) requires UWB devices to be hand-held; outdoor-mounted antennas are prohibited. ASSA ABLOY, Schlage (ET Docket 22-248, granted 2023), Xthings (ET Docket 25-103), and Tesla (ET Docket 25-101 — for UWB transceivers on wireless-charging ground pads at 7.7 to 8.3 GHz) have each filed individual waiver petitions. Proof in microcosm that the 2002 spectrum compromise still has not fully accommodated the use cases that 2020s UWB enabled.

## Where this connects in the book

- **Part Wireless, Chapter "UWB — nanosecond pulses for centimetre ranging"** — IEEE 802.15.4z, FiRa, CCC Digital Key 3.0, Apple U1 and U2, the 2022 Tesla BLE relay attack that motivated the move to UWB, and the Ghost Peak STS residual. The chapter carries the full historical arc — Harmuth's non-sinusoidal-waveform theory, Scholtz and Win at USC and MIT, the FCC's 2002 First Report and Order, the IEEE 802.15.3a deadlock at Waikoloa, the quiet 2007 ratification of 4a, and Apple's silent 2019 U1 launch — alongside the unlock UX and the security-receiver redesign story.

## See also (other protocol episodes)

If you have heard the **Bluetooth episode**, the on-ramp story is everything. Almost no consumer UWB session is ever opened without BLE first — BLE has ubiquitous always-on advertising and standardised pairing; UWB has neither. The canonical pattern in CCC Digital Key 3.0 and Aliro 1.0 is BLE GAP advertising, then GATT service discovery and authentication, then session-key transport over the BLE encrypted channel, then BLE-signalled UWB ranging start. Tesla's 2022 BLE relay worked because Tesla had no UWB fallback. The CCC Digital Key 3.0 architecture is the answer to that attack.

The **Wi-Fi episode** is the closest competitor's story. Wi-Fi Fine Timing Measurement in IEEE 802.11mc, and the security-enhanced 802.11az with PASN, is the closest analogue to UWB ranging in mass-market silicon. Wi-Fi is already in every phone; UWB needs a dedicated chip. Wi-Fi runs at 80 to 160 MHz of bandwidth; UWB runs at 499.2 MHz. Wi-Fi FTM is 1 to 2 metres typical; UWB is 10 to 30 cm. Wi-Fi reuses existing APs (Cisco and Aruba support); UWB needs dedicated anchors. The honest verdict: Wi-Fi FTM is good enough for room-level indoor positioning; UWB wins for proximity-based authentication (car keys, smart locks) because centimetre precision and the STS distance commitment combine to produce a hard distance upper-bound that FTM cannot match today. 802.11az narrows the gap. They will most likely coexist.

The **NFC episode** is the third leg of CCC Digital Key 3.0 and Aliro 1.0. NFC is the fallback and fast-tap path: it is mandatory in both specs, BLE and UWB are optional add-ons. If your phone's battery is dead, NFC's passive readers can still wake the secure element and complete a credential exchange. NFC also provides the explicit tap-to-unlock UX that some users still prefer (Mercedes-Benz EQS, Hyundai Ioniq 5, Kia EV6, BMW Digital Key Card).

The **TLS episode** is the cryptography ancestor. STS is built on AES-128 in Counter mode, the same primitive family that underlies modern AEAD ciphers. The session-key transport over BLE that hands off STS_KEY rides the BLE-encrypted channel that GATT authentication established with SPAKE2+/PAKE — the same family of authenticated key-exchange protocols that lives inside TLS 1.3.

## Visual cues for image generation

(See the visual_cues field in the frontmatter — six prompts covering: the Gaussian-monocycle pulse train with the FCC EIRP mask; the DS-TWR three-message timeline with cross-product formula; the BLE-relay vs UWB-ToF side-by-side attack diagram; the CCC Digital Key 3.0 unlock swimlane; the IEEE 802.15.4z HRP-ERDEV frame anatomy; and the UWB silicon evolutionary tree.)

## Sources

**Specifications and standards**

- [FCC First Report and Order ET Docket 98-153, FCC 02-48 (14 Feb 2002)](https://transition.fcc.gov/Bureaus/Engineering_Technology/Orders/2002/fcc02048.pdf)
- [47 CFR Part 15 Subpart F — UWB](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-15/subpart-F)
- [IEEE 802.15.4z-2020](https://standards.ieee.org/ieee/802.15.4z/10230/) — IEEE GET / members-only; published 31 Aug 2020
- [IEEE P802.15.4ab Draft D03 (Sept 2025)](https://ieeexplore.ieee.org/document/11179932)
- [IEEE P802.15.4ab Draft D02 (Mar 2025)](https://ieeexplore.ieee.org/document/10982429/)
- [FiRa Consortium](https://www.firaconsortium.org/) — interoperability profile on top of 4z
- [CCC Digital Key Release 3 v1.1 specification](https://carconnectivity.org/car-connectivity-consortium-makes-digital-key-release-3-v1-1-specification-available-to-the-public/)
- [Common Criteria PP 0119 v2 — CCC Digital Key Protection Profile](https://www.commoncriteriaportal.org/nfs/ccpfiles/files/ppfiles/pp0119V2b_pdf.pdf)
- [CSA Aliro 1.0](https://csa-iot.org/all-solutions/aliro/) — published 26 Feb 2026
- [ETSI EN 302 065 (multi-part)](https://www.etsi.org/standards-search?search=302+065) — EU UWB regulatory standard
- [draft-ietf-dult-accessory-protocol](https://datatracker.ietf.org/doc/draft-ietf-dult-accessory-protocol/)
- [FCC Schlage Lock UWB waiver order, DA 23-442, ET Docket 22-248](https://docs.fcc.gov/public/attachments/DA-23-442A1.pdf)
- [FCC Tesla UWB waiver order, DA 25-168, ET Docket 25-101](https://docs.fcc.gov/public/attachments/DA-26-168A1.pdf)

**Academic papers**

- [R. A. Scholtz, "Multiple Access with Time-Hopping Impulse Modulation," IEEE MILCOM '93 (Oct 1993)](http://ultra.usc.edu/assets/002/35813.pdf)
- [Win and Scholtz, "Ultra-Wide Bandwidth Time-Hopping Spread-Spectrum Impulse Radio," IEEE Trans. Commun. Apr 2000](https://winslab.lids.mit.edu/wp-content/papercite-data/pdf/winsch-j00.pdf)
- [Dardari, Conti, Ferner, Giorgetti, Win, "Ranging With Ultrawide Bandwidth Signals in Multipath Environments," Proc. IEEE Feb 2009](https://dspace.mit.edu/bitstream/handle/1721.1/58971/Dardari-2009-Ranging%20with%20ultrawide%20bandwidth%20signals%20in%20multipath%20environments.pdf)
- [Singh, Leu, Abdou, Capkun, "UWB-ED," USENIX Security 2019](https://www.usenix.org/conference/usenixsecurity19/presentation/singh)
- [Singh, Leu, Capkun, "UWB with Pulse Reordering," NDSS 2019](https://www.ndss-symposium.org/wp-content/uploads/2019/02/ndss2019_06B-2_Singh_paper.pdf)
- [Leu, Camurati, Heinrich, Roeschlin, Anliker, Hollick, Capkun, "Ghost Peak," USENIX Security 2022](https://www.usenix.org/system/files/sec22fall_leu.pdf)
- [Luo, Kalkanli, Zhou, Zhan, Cohen (Apple), "Secure Ranging with IEEE 802.15.4z HRP UWB," arXiv:2312.03964 (Dec 2023)](https://arxiv.org/pdf/2312.03964)
- [Domuta et al., "Timestamp Estimation in P802.15.4z Amendment," Sensors 20(18):5422 (2020)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7571033/)
- ["Precise Ranging: Modeling Bias and Variance of DS-TWR with TDoA Extraction under Multipath and NLOS Effects," arXiv:2410.12826 (2024)](https://arxiv.org/pdf/2410.12826)
- ["Reducing Two-Way Ranging Variance by Signal-Timing Optimization," arXiv:2211.00538 (2022)](https://arxiv.org/pdf/2211.00538)
- ["Adaptive Kalman Filter-Based UWB Location Tracking with Optimized DS-TWR in Workshop NLOS Environments," MDPI Sensors 25(24):7682 (2025)](https://www.mdpi.com/1424-8220/25/24/7682)

**Vendor and engineering blogs**

- [Apple Support — Ultra Wideband security in iOS](https://support.apple.com/guide/security/ultra-wideband-security-in-ios-sec1e6108efd/web)
- [Apple Support — Learn about Ultra Wideband availability](https://support.apple.com/en-us/109512)
- [Apple Developer — Nearby Interaction framework](https://developer.apple.com/documentation/nearbyinteraction)
- [Android Developers — android.uwb package](https://developer.android.com/reference/android/uwb/package-summary)
- [Keysight — An Overview of the IEEE 802.15.4 HRP UWB Standard](https://www.keysight.com/blogs/en/tech/rfmw/2021/07/28/an-overview-of-the-ieee-802154-hrp-uwb-standard)
- [Rohde & Schwarz — Exploring the future of UWB / IEEE 802.15.4ab white paper](https://www.rohde-schwarz.com/us/solutions/wireless-communications-testing/landingpages/white-paper-exploring-the-future-of-uwb-comprehensive-insights-into-ieee-802.15.4ab_258350.html)
- [STMicroelectronics — ST64UWB blog post](https://blog.st.com/st64uwb/)
- [LitePoint — UWB Is Here to Stay: Now What?](https://www.litepoint.com/blog/uwb-is-here-to-stay-now-what/)
- [NXP — Trimension secure UWB](https://www.nxp.com/products/wireless-connectivity/secure-uwb)
- [NXP Application Note AN12791 Rev. 1.9 — Bluetooth LE CCC Digital Key R3 (Nov 2024)](https://mcuxpresso.nxp.com/mcuxsdk/latest/html/_static/wireless/CCC/Bluetooth_Low_Energy_CCC_Digital_Key_Application_Note.pdf)
- [Qorvo — DW3000 product page](https://www.qorvo.com/products/p/DW3000)
- [NCC Group — Tesla BLE phone-as-a-key relay advisory (15 May 2022)](https://research.nccgroup.com/2022/05/15/technical-advisory-tesla-ble-phone-as-a-key-passive-entry-vulnerable-to-relay-attacks/)
- [CITP Princeton — Privacy implications of the Apple U1 chip and ultra-wideband](https://blog.citp.princeton.edu/2019/12/21/every-move-you-make-ill-be-watching-you-privacy-implications-of-the-apple-u1-chip-and-ultra-wideband/)
- [iFixit — Inside the tech in Apple's U1 chip](https://www.ifixit.com/News/33257/inside-the-tech-in-apples-ultra-wideband-u1-chip)
- [EFF — Apple and Google Collaborate on Detecting Unwanted Location Trackers (May 2023)](https://www.eff.org/deeplinks/2023/05/victory-apple-and-google-collaborate-detecting-unwanted-location-trackers)
- [GitHub — br101/zephyr-dw3000-examples](https://github.com/br101/zephyr-dw3000-examples)
- [GitHub — foldedtoad/dwm3000](https://github.com/foldedtoad/dwm3000)

**News**

- [MacRumors — iPhone 11 Models Feature 'U1' Ultra Wideband Chip (10 Sept 2019)](https://www.macrumors.com/2019/09/10/iphone-11-and-11-pro-support-ultra-wideband/)
- [Apple Newsroom — Apple introduces AirTag (20 Apr 2021)](https://www.apple.com/newsroom/2021/04/apple-introduces-airtag/)
- [MacRumors — New AirTag's Improved Precision Finding (26 Jan 2026)](https://www.macrumors.com/2026/01/26/new-airtag-longer-precision-finding/)
- [BleepingComputer — Hackers can steal your Tesla Model 3, Y using new Bluetooth attack (May 2022)](https://www.bleepingcomputer.com/news/security/hackers-can-steal-your-tesla-model-3-y-using-new-bluetooth-attack/)
- [TechCrunch — Bluetooth attack can remotely unlock Teslas and smart locks (18 May 2022)](https://techcrunch.com/2022/05/18/bluetooth-attack-unlock-tesla/)
- [The Register — BLE phone-as-a-key vuln allows access to Tesla Model 3 (17 May 2022)](https://www.theregister.com/2022/05/17/ble_vulnerability_lets_attackers_steal/)
- [9to5Mac — iPhone 15 ultrawide-band chip (8 Sept 2023)](https://9to5mac.com/2023/09/08/iphone-15-ultrawide-band-chip/)
- [9to5Mac — iPhone 15 Precision Finding to 60 m (24 Sept 2023)](https://9to5mac.com/2023/09/24/iphone-15-precision-finding-u2-chip/)
- [BMW Group Press — Digital Key Plus with UWB on the BMW iX (13 Jan 2021)](https://www.press.bmwgroup.com/global/article/detail/T0324128EN/bmw-announces-bmw-digital-key-plus-with-ultra-wideband-technology-coming-to-the-bmw-ix?language=en)
- [BMW Group Press — first OEM with CCC Digital Key certificate](https://www.press.bmwgroup.com/global/article/detail/T0443788EN/bmw-group-is-first-automobile-manufacturer-to-receive-the-car-connectivity-consortium-ccc-digital-key%E2%84%A2%EF%B8%8F-certificate?language=en)
- [CSA — Introducing Aliro 1.0 (26 Feb 2026)](https://csa-iot.org/newsroom/introducing-aliro-1-0-a-unified-standard-to-transform-the-access-control-ecosystem/)
- [AppleInsider — Apple Home Key comes to everyone with Aliro launch (26 Feb 2026)](https://appleinsider.com/articles/26/02/26/apple-home-key-comes-to-everyone-everywhere-with-aliro-launch)
- [Google Blog — Find My Device launch (8 Apr 2024)](https://blog.google/products/android/google-find-my-device-network/)
- [audioXpress — STMicroelectronics Launches First IEEE 802.15.4ab UWB Chip Family](https://audioxpress.com/news/stmicroelectronics-launches-first-ieee-802-15-4ab-uwb-chip-family-with-integrated-narrowband-assist)
- [WirelessDesignOnline — IEEE UWB Standards Group Disbands (2006)](https://www.wirelessdesignonline.com/doc/ieee-uwb-standards-group-disbands-market-to-s-0001)
- [VicOne — From Fob to Phone: How CCC Digital Key 4.0 Shapes Automotive Cybersecurity](https://vicone.com/blog/from-fob-to-phone-how-ccc-digital-key-40-shapes-automotive-cybersecurity)

**Wikipedia**

- [Wikipedia — Ultra-wideband](https://en.wikipedia.org/wiki/Ultra-wideband)
- [Wikipedia — FiRa Consortium](https://en.wikipedia.org/wiki/FiRa_Consortium)
- [Wikipedia — IEEE 802.15](https://en.wikipedia.org/wiki/IEEE_802.15)
- [Wikipedia — AirTag](https://en.wikipedia.org/wiki/AirTag)
