---
id: bluetooth
type: protocol
name: Bluetooth
abbreviation: BT
etymology: "[B]lue[t]ooth — named in 1997 by Jim Kardach at Intel after Harald Blåtand Gormsson, the 10th-century Danish king who united Denmark and Norway. The logo is a bind-rune of his Younger-Futhark initials, [H]agall (ᚼ) and [B]jarkan (ᛒ)."
category: wireless
year: 1999
rfc: Bluetooth Core Specification 6.1 (May 2025); 6.0 adopted 3 September 2024
standards_body: Bluetooth Special Interest Group (SIG)
podcast_target_minutes: 22
related_book_chapters:
  - wireless/the-shared-medium
  - wireless/bluetooth
related_protocols: [wifi, ipv6, tls, mdns-dns-sd, cellular, nfc, zigbee, uwb]
related_pioneers: [jaap-haartsen, sven-mattisson, jim-kardach]
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bluetooth.svg/250px-Bluetooth.svg.png
    caption: The Bluetooth logo is a bind-rune combining Hagall (ᚼ) and Bjarkan (ᛒ), the Younger-Futhark initials of Harald Blåtand. Jim Kardach at Intel proposed the name in 1997 as a placeholder during a SIG meeting; marketing never replaced it.
    credit: Wikimedia Commons / Public Domain (Bluetooth SIG trademark)
visual_cues:
  - "Two stacked timelines on the same time axis, 1999 to 2026. Top track is BR/EDR Classic, marked with milestones for Core 1.0 (1999), 2.1 Secure Simple Pairing (2007), and a steady horizontal block for A2DP audio. Bottom track is BLE, starting at Core 4.0 (December 2009), then 4.2 LE Secure Connections, 5.0 LE 2M and Coded, 5.2 LE Audio, 5.4 PAwR, and a bright marker at 6.0 Channel Sounding (3 September 2024). A vertical caption between them: 'Same brand. No shared bits over the air.'"
  - "A 2.4 GHz spectrum strip from 2402 to 2480 MHz. The 79 BR/EDR channels are tiny 1 MHz vertical bars. Overlaid on top, the 40 BLE channels as 2 MHz bars, with 37, 38, and 39 highlighted at 2402, 2426, and 2480 MHz. Behind both, three pale Wi-Fi 1/6/11 humps centred at 2412, 2437, and 2462 MHz. Caption: 'BLE advertising sits in the gaps Wi-Fi leaves.'"
  - "A 14-step BLE connect-pair-read sequence diagram with two columns labelled Phone (Central) and Sensor (Peripheral). Arrows for ADV_IND on channels 37/38/39, CONNECT_IND, LL feature/length/PHY exchange, SMP P-256 ECDH, AES-CCM start (drawn as a lock icon snapping shut), ATT MTU exchange to 247, ATT Read of handle 0x002A returning 74 bpm. Above the lock, a dotted line marks 'cleartext / encrypted' boundary."
  - "A garage scene split-screen. Left: a Tesla Model 3 with its BLE proximity arc reaching about 2 metres. Right: an attacker with a $50 BLE relay dongle 25 m away inside a house. Two more $50 dongles forward Link Layer ciphertext over a long red dotted line; the car's RSSI gauge reads 'close enough.' Caption: 'May 2022 — NCC Group / Sultan Qasim Khan.'"
  - "Two earbuds and a hearing aid arranged in a triangle around a phone. Solid lines from phone to earbuds labelled CIS (unicast LE Audio, LC3 codec). A tower icon broadcasts a BIS labelled 'Auracast' to the hearing aid plus three other listeners scattered around it. Frankfurt Airport gate-board silhouette in the background. Date stamp: 28 January 2026."
  - "Two devices labelled Initiator and Reflector exchanging Channel Sounding events on the new LE 2M 2BT PHY. One pass shows unmodulated tones at multiple frequencies (Phase-Based Ranging) with a small phase-difference dial. Second pass shows two timestamped packets bouncing back and forth (Round-Trip Time). A tape measure between the devices reads '~10 cm accuracy at 150 m.'"
---

# BT — Bluetooth (BR/EDR and BLE)

## In one breath

Bluetooth is two protocols braided into one brand. BR/EDR Classic, the 1999 frequency-hopping master/slave wire-replacement, still carries A2DP audio, HFP voice, and every wireless keyboard. BLE, added in Core 4.0 in December 2009 from Nokia's Wibree design, runs the rest of the small-radio internet — AirPods control planes, AirTags, Matter commissioning, hearing aids, smart locks. Both share the 2.4 GHz ISM band and a SIG, and they share no bits over the air. Roughly 4.7 billion Bluetooth ICs ship every year.

## The pitch

In 1994, in a research building in Lund, Sweden, two Ericsson engineers were trying to cut the cable off a mobile-phone headset. They picked an unregulated radio band, made the radio jump 1,600 times a second to dodge interference, and named the result after a 10th-century Danish king. Three decades later, that radio sits in over four billion chips shipped every year — earbuds, car keys, hearing aids, the AirTag in your jacket. In September 2024 it learned a new trick: measuring distance to centimetre accuracy, on the radio you already have. In January 2026 Frankfurt Airport stopped piping gate calls through ceiling speakers and started broadcasting them, encrypted, to every Auracast-capable hearing aid in the terminal. The story of how Bluetooth tried to replace a serial cable and ended up running the small-radio internet — that belongs to the Bluetooth chapter episode in the wireless part of the book. This episode is about how the two stacks actually work today, where they break, and what shipped in the last two years.

## How it actually works

Treat BR/EDR and BLE as parallel sub-stacks. They share only the SIG, the 2.4 GHz band, and on combo chips the antenna.

BR/EDR uses 79 channels of 1 MHz each between 2.402 and 2.480 GHz. It hops across them 1,600 times per second under a pseudo-random pattern keyed off the piconet master's clock and BD_ADDR. The basic rate is GFSK at 1 Mbps; Enhanced Data Rate adds π/4-DQPSK for 2 Mbps and 8-DPSK for 3 Mbps in the payload portion of the packet only — the access code and header stay GFSK so a basic-rate-only receiver can still decode the addressing bits. Time is divided into 625-microsecond slots. The Central transmits on even slots, the Peripheral replies on odd slots. A connection starts with Inquiry — ID packets carrying the General Inquiry Access Code 0x9E8B33 hopped fast across all 79 channels — followed by an FHS reply that hands over the BD_ADDR and clock, then a Page that synchronises to the Peripheral's hopping pattern, then LMP feature negotiation, Secure Simple Pairing, SDP service discovery, and finally L2CAP plus a profile like A2DP, HFP, HID, or RFCOMM serial. Setup typically takes about five seconds.

BLE uses 40 channels of 2 MHz each in the same band. Channels 37, 38, and 39 — at 2402, 2426, and 2480 MHz — are the primary advertising channels, placed specifically to dodge the centres of Wi-Fi channels 1, 6, and 11. The other 37 channels (0 to 36) are data channels used inside a connection, hopping once per connection event. There are now four PHY variants: LE 1M (the original 1 Msym/s), LE 2M (added in 5.0, double rate, half the airtime per byte), LE Coded with S=2 or S=8 (FEC trades throughput for about four times the range, down to 125 kbps at S=8), and LE 2M 2BT, added in 6.0 specifically for Channel Sounding.

A BLE Peripheral broadcasts ADV_IND packets on the three advertising channels at intervals from 20 ms up to 10.24 seconds. A Central scans those channels. When the Central decides to connect it sends CONNECT_IND on the same advertising channel where it heard the ADV_IND. That single packet — 34 bytes of payload — is the most important in BLE: it carries the per-connection 32-bit Access Address, the CRC seed, the channel map, the hop increment, the connection interval (between 7.5 ms and 4 seconds, in 1.25 ms units), the Peripheral latency, and the supervision timeout. From that moment both radios switch to the data channels.

Inside the connection, BLE devices exchange L2CAP packets. The Attribute Protocol lives on L2CAP CID 0x0004 and provides read, write, notify, and indicate operations against 16-bit handles. GATT layers semantic structure on top — services, characteristics, descriptors — with 16-bit SIG-assigned UUIDs or 128-bit vendor UUIDs. Pairing runs on L2CAP CID 0x0006 under the Security Manager Protocol; LE Secure Connections, available since 4.2, performs ECDH on Curve P-256 to derive a Long-Term Key, after which the Link Layer is encrypted with AES-CCM with a four-byte MIC and a 39-bit packet counter for replay protection.

LE Audio, added in Core 5.2 in December 2019, runs over Isochronous Channels: Connected Isochronous Streams (CIS) for unicast earbuds and hearing aids, and Broadcast Isochronous Streams (BIS) for one-to-many public broadcast. LC3 is the mandatory codec, replacing SBC and saving roughly 50% battery versus A2DP. Auracast is the SIG brand for the BIS-based public-venue broadcast.

Channel Sounding, added in Core 6.0 on 3 September 2024, schedules ranging events between two devices that already have a normal LL connection. It runs on the new LE 2M 2BT PHY. Two techniques run together: Phase-Based Ranging measures phase differences across multiple frequencies, similar to FMCW radar; Round-Trip Time measures time-of-flight on timestamped packets, with calibration to remove controller turn-around latency. The combination targets centimetre-class accuracy up to about 150 metres. The intended use is digital car keys, smart locks, and anti-stalking tags — anywhere you need to know that the peer is actually here and not relayed across the street.

### Header at a glance

A BLE Link Layer PDU on LE 1M or 2M, uncoded, looks like this on the wire. One byte of preamble (two on LE 2M) — alternating bits, 0xAA on LE 1M, for AGC and clock recovery. Four bytes of Access Address — the fixed value 0x8E89BED6 on the three advertising channels, a random per-connection 32-bit value otherwise. Two bytes of LL header. A PDU body of up to 255 bytes. Three bytes of CRC, polynomial x²⁴+x¹⁰+x⁹+x⁶+x⁴+x³+x+1, seeded by the CRCInit field of CONNECT_IND. Optionally, a 16 to 160 microsecond Constant Tone Extension carrying unwhitened ones for AoA/AoD direction-finding, added in 5.1.

The two-byte LL header tells you what kind of PDU it is. Advertising-channel headers carry the PDU type in four bits — ADV_IND, ADV_DIRECT_IND, ADV_NONCONN_IND, SCAN_REQ, SCAN_RSP, CONNECT_IND, ADV_SCAN_IND, and from 5.0 onwards ADV_EXT_IND. Data-channel headers carry a 2-bit LLID (data continuation, data start, or LL control), a 1-bit NESN (next expected sequence number) and 1-bit SN (sequence number) — that's the whole ARQ, in two bits — a More Data flag, and a length.

Total stack overhead per Notify on a default connection is a sobering 24 bytes for 3 bytes of payload: 1 preamble + 4 Access Address + 2 LL header + 4 L2CAP + 3 ATT header + 3 payload + 4 MIC + 3 CRC. That's why the MTU defaults below matter so much.

The BR/EDR baseband packet has three sections: a 72-bit Access Code (preamble 4, sync word 64 derived from the LAP, trailer 4); a 54-bit header (transmitted as 18 information bits times a 1/3 FEC, carrying a 3-bit LT_ADDR, a 4-bit type code, FLOW, ARQN, SEQN, and an 8-bit HEC); and a payload of up to 2,745 bits. The packet types form a small zoo: ID and POLL/NULL for link maintenance, FHS for handing over BD_ADDR and clock during paging, DM/DH packets for ACL data (M = medium-rate 2/3 FEC, H = high-rate no FEC, with the suffix giving slot span), HV1/HV2/HV3 for SCO voice at 64 kbps, EV3/EV4/EV5 for eSCO with retransmissions.

### State machine in three sentences

A BLE Link Layer endpoint sits in Standby until something asks it to start Advertising, Scanning, or Initiating; from Advertising it transitions to Connection-Peripheral on receiving CONNECT_IND, and from Initiating it transitions to Connection-Central on sending CONNECT_IND. Inside a connection, both sides drive their own state through repeated connection events on the data channels, with the Central anchoring the timing. The connection ends on LL_TERMINATE_IND from either side, or when the supervision timeout fires — and the spec requires that timeout to be greater than (1 + Peripheral latency) × connection interval × 2, or the LL refuses the parameters.

### Reliability, flow, and security mechanics

BLE reliability is austere by design. The Link Layer ARQ is one bit each of NESN and SN, ack-on-the-next-event style, with the CRC catching corruption and a retransmit on the next connection event. Flow control above that is the Peripheral latency parameter: a Peripheral may skip up to 499 consecutive connection events to save power, accepting that long latency in exchange. Reliability above ATT is split: Notifications are unacknowledged at the application layer (rely on LL ARQ), Indications add a per-PDU confirmation at the cost of one round trip per sample.

Encryption on BLE runs at the Link Layer. After SMP completes pairing — Just Works, Passkey Entry, Numeric Comparison, or Out-of-Band — both sides hold a Long-Term Key. LL_ENC_REQ and LL_ENC_RSP exchange the session-key diversification material; from then on every payload is AES-CCM encrypted with a 4-byte MIC appended, and the 39-bit packet counter prevents replay. Bonding stores the LTK for future reconnections; Resolvable Private Addresses, rotated under control of the Identity Resolving Key, prevent long-term tracking by passive observers.

On BR/EDR, encryption is similar in shape but not in ancestry. Legacy PIN pairing, deprecated, used PIN-seeded E0/E1; Secure Simple Pairing in 2.1 introduced ECDH on P-192 with four association models; Secure Connections in 4.1 upgraded the curve to P-256 and the MAC to AES-CMAC. The Core spec now requires a 7-byte minimum encryption key length — that is the post-KNOB rule.

## Where it shows up in production

**Apple AirPods** are the single largest commercial deployment. Launched December 2016. Third-party estimates put 2024 shipments at roughly 110 million units and 24.5 billion dollars in revenue, with cumulative shipments since 2017 above 550 million. Apple does not publish AirPods unit numbers directly, so treat those figures as estimates from Statista, Counterpoint, and the World-of-Statistics summary, not as Apple disclosures. AirPods use proprietary Apple H1 and H2 chip extensions on top of standard BR/EDR and BLE; the actual media still rides Bluetooth Classic A2DP for music and HFP for voice on all but the newest Pro models, which add LE Audio CIS where supported.

**The Apple Find My network** turns roughly two and a half billion active Apple devices into a relay for any nearby Bluetooth beacon. AirTag launched April 2021; AirTag 2 shipped in January 2026 with the U2 chip, upgraded Bluetooth, and an integrated speaker designed to make tamper-removal physically harder. Google Find My Device launched in April 2024 on the Android device base and is spec-aligned with Apple under DULT.

**Tesla phone-as-key** uses BLE passive entry on every Model 3 and Model Y since 2018. It is the high-profile victim of the May 2022 NCC Group link-layer relay attack — covered in Things that go wrong below. The protocol-level fix is Channel Sounding in Bluetooth 6.0; CCC Digital Key follow-on versions are expected to mandate it.

**The hearing-aid industry** — Sonova, GN ReSound, Demant, Starkey Edge AI, Phonak — has shipped LE Audio across every major brand from 2024 onwards. CIS carries the call-and-music audio at roughly half the battery cost of the previous proprietary protocols. BIS carries Auracast public-venue broadcast. ABI Research's forecast, cited by the SIG, calls for more than 30 million Bluetooth and OTC hearing aids shipping annually by 2029, and 1.5 million Auracast-enabled venues by 2029. Treat those as ABI forecasts cited by the SIG, not measured shipments.

**Auracast deployments** moved from demo to deployment in 2025–2026. Samsung TVs have shipped Auracast broadcast as standard since August 2023; LG's 2025 OLED and QNED line followed; CES 2025 had multiple commercial demonstrations in transit and retail. The headline event was 28 January 2026, when **Frankfurt Airport** became the first airport in the world to broadcast all gate announcements over Auracast through Sittig PAXModular IP paging stations. Travellers with Auracast-capable hearing aids or earbuds tune in directly. No infrastructure handoff. No app required. It is the first major real-world replacement for the analogue hearing-loop.

**Matter commissioning** has made BLE mandatory on every Thread or Wi-Fi Matter device since Matter 1.0. The phone scans for a Matter advertiser, scans the QR or numeric pairing code, sets up a secure BLE channel via Password-Authenticated Session Establishment, then pushes the operational Wi-Fi or Thread credentials through that channel. Matter 1.4.2, late 2025, added Wi-Fi USD commissioning so pure Wi-Fi devices can drop the BLE radio for roughly 30 to 50 cents of BoM saving — but Thread and battery devices still need it.

The SIG's chip-shipment baseline is roughly 4.7 billion Bluetooth ICs per year as of 2024, climbing toward 5 billion plus by 2027 in the SIG annual market update.

## Things that go wrong

The Bluetooth security history is the best protocol-design teaching material the IETF never wrote. Five of the eight famous incidents are spec failures, not implementation bugs.

**BlueBorne, September 2017.** Armis disclosed eight vulnerabilities across the Android, iOS, Windows, and Linux Bluetooth stacks. The Linux one, CVE-2017-1000251, was a kernel-level remote code execution in BlueZ's L2CAP code. iOS had CVE-2017-14315 in Apple's Low Energy Audio Protocol. Many of the bugs worked without pairing, just by being in radio range. Armis estimated 5.3 billion vulnerable devices at disclosure; about 2 billion were still unpatched a year later. Microsoft, Google, Apple, and the Linux distributions patched within weeks. The episode permanently changed how the Linux Bluetooth subsystem treats unauthenticated L2CAP packets.

**KNOB, 2019, CVE-2019-9506.** Daniele Antonioli at EURECOM looked at the unsigned LMP exchange that negotiates BR/EDR encryption-key entropy between 1 and 16 octets. The negotiation isn't authenticated. A nearby attacker can force the entropy down to 1 byte by injecting `LMP_encryption_key_size_req` packets and then brute-force the resulting E0 key. Every chip from Intel, Broadcom, Apple, Qualcomm, and Chicony tested vulnerable. The SIG amended the Core Spec to require a 7-byte minimum encryption key length.

**BIAS, 2020, CVE-2020-10135.** Same author. BR/EDR Secure Connections and Legacy Secure Connections authentication is unilateral — only one direction is verified at a time — and accepts a downgrade from Secure Connections to Legacy. An attacker who knows the BD_ADDR of a previously paired device can impersonate it without the long-term key, exploiting the role-switch and the unilateral challenge. Combined with KNOB, you authenticate as any paired device with weak crypto. The SIG patched the downgrade across 2020.

**BrakTooth, August 2021.** The ASSET Research Group at SUTD found 16 vulnerabilities, more than 20 CVEs, in commercial BR/EDR Link Manager stacks across 13 SoCs from Intel, Qualcomm, TI, Infineon, Silicon Labs, Espressif, and others. ESP32 (CVE-2021-28139) had arbitrary code execution via a missing bounds check. Roughly 1,400 commercial product listings affected, including the Microsoft Surface Pro 7, Laptop 3, Book 3, Go 2, and the Volvo FH infotainment system. Most vendors patched in late 2021 and 2022 — but Qualcomm reported that several vulnerable chipsets cannot be fixed because there is no firmware-update space available. Those modules remain vulnerable indefinitely. A teaching moment about embedded firmware update budgets.

**The Tesla BLE relay, 15 May 2022.** Tesla Model 3 and Model Y use BLE passive entry: the phone is the key, and the car infers proximity from RSSI and cryptographic-challenge round-trip latency. NCC Group's Sultan Qasim Khan realised the encrypted Link Layer PDUs can be relayed by forwarding ciphertext between two cheap dongles — the latency added is small enough that Tesla's mitigations don't trigger. He placed an iPhone 13 mini 25 metres from a 2020 Model 3, in a different room of a house, and unlocked and drove off the car with two fifty-dollar BLE relays. Tesla's official position: "relay attacks are a known limitation of the passive entry system." Two and a half years later, in September 2024, the SIG ratified Core 6.0 with Channel Sounding — a way of measuring distance at the physical layer, beneath the encryption, that an attacker cannot forge by relaying packets. The arc closes: a security failure became a feature in the spec.

**BLUFFS, November 2023, CVE-2023-24023.** Antonioli again — the third architectural break in five years. Bluetooth Forward and Future Secrecy. A Central can unilaterally set all session-key diversification values, and the random numbers used in derivation are not nonces, so the same weak session key can be forced across past, present, and future sessions. Compromise one session key, you compromise all of them. All 18 Bluetooth Classic devices tested were vulnerable. Affects Core Spec 4.2 through 5.4. The SIG advisory recommends rejecting service-level connections on encrypted baseband links with key strength below 7 octets, and below 16 for Mode 4 Level 4. Microsoft patched November 2023.

**The AirTag stalking saga, 2021–2026.** AirTag launched April 2021 with rudimentary mitigations: alerts for iPhone users, a beep that took three days to trigger and was easily muffled, and no cross-platform support. An Android user being stalked got no alert until Apple released the Tracker Detect app in December 2021. Repeated reported cases of AirTags slipped into bags, cars, and clothing followed; in 2024 a US federal judge in California allowed parts of a class-action against Apple to proceed. Apple and Google — direct competitors — co-authored the Detection of Unwanted Location Trackers protocol, submitted it as an IETF Internet-Draft in May 2023, and shipped cross-platform unwanted-tracker alerts on iOS 17.5 and Android 6+ in May 2024. The IETF DULT working group has since published `draft-ietf-dult-accessory-protocol-00` (4 November 2024) and is iterating on `draft-ietf-dult-threat-model`. AirTag 2, January 2026, integrated the speaker into the case body to make muffling physically harder.

The shape of the lesson: the Bluetooth security model assumed the radio is the perimeter. It isn't. For the longer historical arc — what each of these attacks taught the SIG, and how Channel Sounding closes the relay loop — defer to the Bluetooth chapter episode and the chapter on the shared medium in the wireless part.

## Common pitfalls (for the practitioner)

**The default ATT MTU is 23 bytes.** Every BLE connection starts with ATT MTU = 23, which leaves only 20 bytes of payload per Notify after the 3-byte ATT header. If you ship that default, your sensor stream is throughput-bound on overhead. Cure: request `ATT_Exchange_MTU_Request` to 247 (which fits in one LL PDU with the 4.2 Data Length Extension) or 517 (the BLE maximum, fragmented across L2CAP) as the first ATT operation after pairing. Most modern platforms do this automatically — verify with an nRF Sniffer capture. The throughput tax for the naive case is 7× to 25×.

**Connection interval × Peripheral latency × supervision timeout interact.** Spec rule: `connSupervisionTimeout > (1 + connPeripheralLatency) × connInterval × 2`. Violate it and the LL rejects the parameters; live near the boundary and the connection drops at the worst possible moment. For a 1 Hz fitness sensor: interval 400 ms, latency 4, timeout 6 seconds. For a HID mouse or keyboard: interval 7.5 to 15 ms, latency 0, timeout 2 seconds — and read the Apple Accessory Design Guidelines first; iOS forces minimum 15 ms for non-HID. For a car-key-class device: interval 30 ms, latency 0, timeout 2 seconds. Low latency does not protect against link-layer relay; only Channel Sounding does.

**Wi-Fi coexistence on 2.4 GHz.** BLE advertising channels 37/38/39 dodge the centres of Wi-Fi 1/6/11, but the data channels overlap. Modern combo chips do time-division arbitration internally with PTA (Packet Traffic Arbitration) hints; on a discrete radio, a saturated Wi-Fi AP can starve BLE for tens of seconds. Don't use advertising intervals at exactly 100 ms or 1000 ms — those harmonics collide with common Wi-Fi beacon intervals. Add a 10–37 ms random jitter beyond the 0–10 ms the spec requires. Avoid making your connection interval equal to the Wi-Fi DTIM period. For mission-critical BLE next to enterprise Wi-Fi, push the APs onto 5 or 6 GHz, or use LE Coded S=8, which trades 8× more airtime for 8× better link budget and survives interference where LE 1M won't.

**The 31-byte advertising payload.** The classic ADV_IND payload caps at 31 bytes after the 6-byte AdvA. Three for Flags, eighteen for one 128-bit Service UUID, the rest for the local name — you almost always run out. Use a 16-bit Service UUID where possible, push extra into the Scan Response (another 31 bytes), or move to Extended Advertising in 5.0+, which extends to 254 bytes per advertising set on the secondary channels. Note: Coded PHY is not allowed on advertising channels 37/38/39 directly; you must use Extended Advertising with `ADV_EXT_IND` pointers.

**Pick the right pairing model for the IO capability.** Just Works has no MITM protection — anyone within radio range during pairing can MITM your health device. If both devices have a display and yes/no, use Numeric Comparison. If one has a keyboard and the other a display, use Passkey Entry. If you have NFC, QR, or shake-to-pair, use Out-of-Band. The anti-pattern is "we used Just Works because pairing is annoying" on a health device.

**The GATT cache trap.** iOS and Android cache the GATT database on the first connect. If you add a service or characteristic in firmware, the phone won't notice. Bump the Database Hash (5.1+) to force a re-read, or on older targets use the Service Changed characteristic at handle 0x0001 with the broadcast bit. Field engineers report this is the number-one reason a firmware push appears not to take.

**Mesh provisioning recovery.** Bluetooth Mesh provisioning is a multi-step procedure over either PB-ADV or PB-GATT. If it fails halfway, the unprovisioned-device beacon may stop until power-cycle. Always implement a 30-second provisioning watchdog that returns the node to unprovisioned state.

## Debugging it

**Wireshark filters that earn their keep:**

- `btatt` — every ATT operation
- `btatt.handle == 0x002a` — narrow to one specific characteristic
- `btatt.opcode == 0x1B` — Handle Value Notification only
- `btsmp` — Security Manager Protocol pairing
- `btl2cap.cid == 0x0004` — ATT channel
- `btl2cap.cid == 0x0006` — SMP channel
- `btle.advertising_address == ff:ee:dd:cc:bb:aa` — one advertiser
- `btle.access_address == 0x8e89bed6` — all advertising packets
- `bthci_cmd.opcode.ogf == 0x08` — LE controller commands

**Capture tools, May 2026.** The nRF Sniffer for Bluetooth LE — Nordic's nRF52840 dongle, around fifty dollars, free Wireshark plugin — is the best entry point for non-encrypted captures and can follow LL connections when you provide the legacy LTK. Sniffle, from Sultan Qasim Khan at NCC Group, runs on the TI CC1352 — same hardware used for the Tesla relay. The professional-grade options are the Ellisys Bluetooth Vanguard and Tracker, used by Apple, Nordic, and automotive OEMs to capture BR/EDR and BLE simultaneously across all 79 and 40 channels, and the Teledyne LeCroy Frontline Sodera. On macOS and iOS, PacketLogger from the Hardware IO Tools for Xcode gives you HCI capture without extra hardware.

**CLI on Linux.** `bluetoothctl` is the interactive front door for BlueZ — `scan on`, `pair`, `trust`, `connect`, `menu gatt`, `notify on`. `btmon` traces HCI in real time. `gatttool` is deprecated but still in many tutorials. `iw` and `dmesg | grep BTCOEX` will tell you whether the combo chip's PTA is actually arbitrating.

**Cross-platform Python.** The `bleak` library wraps CoreBluetooth on macOS, BlueZ on Linux, and WinRT on Windows behind one async API — the BLE stack is clean enough that the same script runs everywhere without a kernel driver. `nRF Connect for Desktop` and `nRF Connect for Mobile` give you a universal scanner and GATT browser.

## What's changing in 2026

**28 January 2026 — Frankfurt Airport.** First airport in the world to broadcast all gate announcements over Auracast, through Sittig PAXModular IP paging stations. Partners include GN, Google, Samsung, and the Bluetooth SIG. The hearing-loop replacement just happened in production, in a major hub.

**January 2026 — AirTag 2.** Apple ships the second-generation AirTag with an integrated speaker designed to be physically harder to muffle, a U2 chip, and upgraded Bluetooth.

**Late 2025 — Matter 1.4.2.** The Connectivity Standards Alliance added Wi-Fi USD commissioning, removing the BLE-radio requirement for pure Wi-Fi Matter devices. Net effect: BLE remains universal in Thread and battery devices, but high-end Wi-Fi-only Matter products may drop the BLE radio to save 30 to 50 cents of BoM.

**May 2025 — Bluetooth Core 6.1.** Adds finer-grained Resolvable Private Address rotation control for privacy against long-term tracking, ISOAL improvements for LE Audio battery life, and errata.

**29 May 2024 — Neville Meijers becomes Bluetooth SIG CEO**, taking over from Mark Powell who had led the SIG since 2012. Meijers' tenure is the Channel Sounding and Auracast deployment era.

**May 2024 — DULT cross-platform alerts ship.** iOS 17.5 and Android 6+ enable joint Apple-Google unwanted-tracker alerts. The IETF DULT working group has since published `draft-ietf-dult-accessory-protocol-00` on 4 November 2024 and continues iterating on `draft-ietf-dult-threat-model`. Final RFC expected in late 2026 or 2027.

**3 September 2024 — Bluetooth Core 6.0 adopted.** Channel Sounding, Decision-Based Advertising Filtering, Monitoring Advertisers, ISOAL enhancements, the LL Extended Feature Set, and Frame Space Update. First commercial silicon — Nordic nRF54L15 and nRF54H20, Silicon Labs xG24 — became available in 2024 and 2025. The Apple iPhone 16 family and iPhone 17 series have reportedly added Channel Sounding support.

**The strategic bet.** Channel Sounding does what UWB does — sub-metre to centimetre ranging — on the BLE radio you already have, without adding UWB silicon. UWB shipped first in phones (Apple U1, 2019; Samsung Galaxy SmartTag+, 2021) and currently owns the high-precision-ranging market in flagships and digital car keys. If Channel Sounding performs at spec in deployed silicon, expect non-flagship phones and most automotive digital-key implementations to drop UWB by 2027 or 2028. Whether UWB survives in mainstream phones depends on whether automakers (FiRa and CCC) lock CS out of digital-key specs. Treat that as a forecast, not a fact.

## Fun facts (host material)

The Bluetooth logo is not an abstract design. It's a bind-rune, two Younger-Futhark runes overlaid: Hagall (ᚼ = H) and Bjarkan (ᛒ = B), Harald Bluetooth's initials. Every BLE-equipped phone is technically wearing a Viking monogram.

The name came from a Toronto pub crawl in 1997. After a failed sales pitch, Intel's Jim Kardach and Ericsson's Sven Mattisson talked Viking history. Mattisson had been reading Frans G. Bengtsson's novel *The Longships*; Kardach had ordered Gwyn Jones's *The Vikings* and found a picture of the Jelling runestone honouring Harald Blåtand, who had unified Denmark and Norway around 958 AD. "Just as Harald united Scandinavia," Kardach reasoned, "we intend to unite the PC and cellular industries with a short-range wireless link." He pitched "Bluetooth" as a code name. Marketing was supposed to find something cooler. They never did.

Daniele Antonioli broke Bluetooth three times. KNOB in 2019, BIAS in 2020, BLUFFS in 2023. Each one required firmware updates from every chipmaker. The SIG's response — 7-byte minimum entropy by default, Secure Connections Only mode, renewed Authentication-after-Bonding rules — closed the immediate holes but left the architectural debt in place.

BR/EDR and BLE share a logo and a brand and not a single bit. Different modulation, different channel plan, different hop pattern, different framing, different security. A dual-mode chip runs both stacks side by side. The SIG estimates more than half of all shipping radios are dual-mode in 2024.

The first commercial Bluetooth product won "Best of Show Technology Award" at COMDEX 1999. It was a hands-free mobile headset. The first Bluetooth phone reached store shelves as the Ericsson T39 in June 2001 — the T36 was an unreleased prototype.

Wibree was rebranded twice. Nokia Research Center released it in October 2006. The SIG renamed it Bluetooth Smart in 2011 for backward-compatibility marketing, and quietly retired "Smart" for "Bluetooth Low Energy" in 2016 because consumers couldn't tell the difference between "Smart" and "Smart Ready." The iPhone 4S, in October 2011, was the first smartphone with BLE. From that point on it was BLE — not Classic — that drove growth.

## Where this connects in the book

- **Part Wireless, chapter "The shared medium"** — why wireless is fundamentally different from wired networking, why every wireless protocol fights physics, and where Bluetooth sits in the family.
- **Part Wireless, chapter "Bluetooth — Classic, LE, and the 6.0 ranging future"** — the long historical arc from Lund 1994 through the SIG founding, the COMDEX 1999 launch, Wibree becoming BLE, iBeacon, Mesh, LE Audio, and the KNOB/BIAS/BLUFFS lineage, ending at Channel Sounding and the Auracast deployments.

## See also (other protocol episodes)

If you've heard the **Wi-Fi episode**, the contrast is everything. Wi-Fi is the protocol you stream from; Bluetooth is the protocol you carry with you. They share 2.4 GHz, every modern phone has a combo chip with one antenna time-multiplexed between them, and adaptive frequency hopping in Bluetooth exists specifically to coexist with Wi-Fi. BLE advertising channels 37/38/39 sit at 2402, 2426, and 2480 MHz — placed to dodge Wi-Fi 1/6/11.

The **UWB episode** is the strategic mirror: UWB owns sub-metre ranging today (AirTag Precision Finding, CCC Digital Key 3.0), and Bluetooth 6.0 Channel Sounding is positioned to take that work back onto the BLE radio you already have. The way the two protocols share roles in BLE-discovers-then-UWB-ranges is most of how AirTags work.

The **NFC episode** matters because NFC tap-to-pair is one of the SSP Out-of-Band methods, and Google Fast Pair uses an unauthenticated BLE advertisement plus an NFC-or-tap UI to bootstrap pairing without a Settings menu round-trip.

The **Zigbee episode** sets up the comparison BLE Mesh wants to win. Zigbee and Thread both run on IEEE 802.15.4 (different MAC, same 2.4 GHz band); Bluetooth Mesh runs over BLE advertisements with a managed-flooding relay model. BLE Mesh wins on device population (every BLE radio in the field is a candidate) and commissioning UX; Thread wins on routing efficiency and IPv6-native integration; Zigbee wins on installed base in legacy lighting.

The **TLS episode** is the protocol Bluetooth had to reinvent. TLS assumes a TCP stream and a CA-anchored cert chain; BLE has neither. SMP is BLE's purpose-built pairing protocol — ECDH on P-256 in LE Secure Connections, short integer passkeys instead of x.509 trust, and an LTK that drives AES-CCM at the Link Layer. Matter, conversely, runs full TLS-equivalent (PASE/CASE) on top of BLE GATT during commissioning — proving that you can run modern crypto over an attribute protocol if you must.

The **IPv6 episode** matters because Thread and most Matter operational traffic run IPv6 over 6LoWPAN, and BLE is just the bootstrap that hands the device its IPv6 identity.

The **mDNS / DNS-SD episode** is the handoff partner: the pattern across Google Cast setup, HomeKit, Matter commissioning, and almost every smart-speaker setup app is "discover the device over BLE advertising, set up Wi-Fi, then re-discover the device over mDNS/DNS-SD on Wi-Fi for higher-bandwidth traffic."

## Visual cues for image generation

- Two stacked timelines on the same time axis, 1999 to 2026. Top: BR/EDR Classic with Core 1.0, 2.1 SSP, A2DP. Bottom: BLE starting at Core 4.0 (December 2009), then 4.2, 5.0, 5.2 LE Audio, 5.4 PAwR, and a bright marker at 6.0 Channel Sounding (3 September 2024). Caption between them: "Same brand. No shared bits over the air."
- A 2.4 GHz spectrum strip from 2402 to 2480 MHz, showing the 79 BR/EDR 1 MHz channels as tiny bars, the 40 BLE 2 MHz channels overlaid (with 37/38/39 highlighted at 2402, 2426, 2480), and pale Wi-Fi 1/6/11 humps centred at 2412, 2437, 2462. Caption: "BLE advertising sits in the gaps Wi-Fi leaves."
- A 14-step BLE connect-pair-read sequence diagram with two columns (Phone Central, Sensor Peripheral). Arrows for ADV_IND on 37/38/39, CONNECT_IND, LL feature/length/PHY exchange, SMP P-256 ECDH, AES-CCM start as a snapping lock, ATT MTU exchange to 247, ATT Read of handle 0x002A returning 74 bpm. A horizontal dotted line marks the cleartext-to-encrypted boundary.
- A garage scene split-screen. Left: a Tesla Model 3 with its BLE proximity arc reaching about two metres. Right: an attacker with a fifty-dollar BLE relay dongle 25 metres away inside a house. Two more relay dongles forward Link Layer ciphertext over a long red dotted line; the car's RSSI gauge reads "close enough." Date stamp: May 2022 — NCC Group / Sultan Qasim Khan.
- Two earbuds and a hearing aid arranged in a triangle around a phone. Solid lines from phone to earbuds labelled CIS (unicast LE Audio, LC3 codec). A tower icon broadcasts a BIS labelled "Auracast" to the hearing aid plus three other listeners around it. A Frankfurt Airport gate-board silhouette in the background. Date stamp: 28 January 2026.
- Two devices labelled Initiator and Reflector exchanging Channel Sounding events on the new LE 2M 2BT PHY. One pass shows unmodulated tones at multiple frequencies (Phase-Based Ranging) with a small phase-difference dial. Second pass shows two timestamped packets bouncing back and forth (Round-Trip Time). A tape measure between them reads "~10 cm accuracy at 150 m."

## Sources

### Standards and specifications

- [Bluetooth SIG specifications portal](https://www.bluetooth.com/specifications/specs/)
- [Bluetooth Core Specification 5.4 — HTML browse](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/)
- [Bluetooth SIG — Baseband specification](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/br-edr-controller/baseband-specification.html)
- [Bluetooth SIG — Link Layer specification](https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core-54/out/en/low-energy-controller/link-layer-specification.html)
- [Bluetooth SIG — Channel Sounding overview](https://www.bluetooth.com/learn-about-bluetooth/recent-enhancements/channel-sounding/)
- [Bluetooth SIG — BLUFFS vulnerability advisory](https://www.bluetooth.com/learn-about-bluetooth/key-attributes/bluetooth-security/bluffs-vulnerability/)
- [IETF DULT working group — accessory protocol draft](https://datatracker.ietf.org/doc/html/draft-ietf-dult-accessory-protocol-00)
- [IETF DULT working group — threat model draft](https://datatracker.ietf.org/doc/draft-ietf-dult-threat-model/)
- [Connectivity Standards Alliance — Matter 1.4.2](https://csa-iot.org/newsroom/matter-1-4-2-enhancing-security-and-scalability-for-smart-homes/)

### Security papers and disclosures

- [KNOB attack — official site](https://knobattack.com/)
- [BIAS — Bluetooth Impersonation Attacks (Antonioli)](https://francozappa.github.io/about-bias/)
- [BLUFFS — Bluetooth Forward and Future Secrecy attacks](https://github.com/francozappa/bluffs)
- [Armis — BlueBorne technical white paper](https://media.armis.com/pdfs/wp-blueborne-bluetooth-vulnerabilities-en.pdf)
- [SUTD — BrakTooth disclosure](https://www.sutd.edu.sg/technical-release-listing/bluetooth-devices-proven-to-be-vulnerable-to-unfixable-security-vulnerabilities)
- [NCC Group — Tesla BLE phone-as-key relay advisory](https://research.nccgroup.com/2022/05/15/technical-advisory-tesla-ble-phone-as-a-key-passive-entry-vulnerable-to-relay-attacks/)
- [University of Hawai'i — CVE-2019-9506 KNOB summary](https://westoahu.hawaii.edu/cyber/vulnerability-research/vulnerabilities-weekly-summaries/cve-2019-9506-bluetooth-devices-vulnerable-to-key-negotiation-of-bluetooth-knob-attacks/)
- [NIST — CVE-2023-24023 BLUFFS](https://nvd.nist.gov/vuln/detail/cve-2023-24023)

### Vendor and engineering blogs

- [Hackaday — Bluetooth 6.0 Core Specification Released](https://hackaday.com/2024/09/06/bluetooth-version-6-0-core-specification-released/)
- [CNX-Software — Bluetooth 6.0 Channel Sounding features](https://www.cnx-software.com/2024/09/04/bluetooth-6-0-features-accurate-two-way-ranging-using-channel-sounding-latency-reduction-improved-scanning-efficiency-and-more/)
- [Lansitec — Bluetooth 6.0 and 6.1 for IoT, Audio, Wearables](https://www.lansitec.com/blogs/bluetooth-6-0-and-6-1-what-the-new-core-specs-mean-for-iot-audio-and-wearables/)
- [BLEFYI — Bluetooth 5.4 vs 6.0](https://blefyi.com/compare/bluetooth-5-4-vs-bluetooth-6-0/)
- [Novel Bits — A Deep Dive into BLE Packets and Events](https://novelbits.io/deep-dive-ble-packets-events/)
- [Nordic Semiconductor DevAcademy](https://academy.nordicsemi.com)
- [Nordic Semiconductor — Apple Find My network](https://www.nordicsemi.com/Products/Technologies/Apple-Find-My-network)
- [Silicon Labs — Matter commissioning docs](https://docs.silabs.com/matter/latest/matter-overview-guides/matter-commissioning)
- [Ericsson — Bluetooth: Born in our backyard, raised by the world](https://www.ericsson.com/en/blog/north-america/2022/ericsson-bluetooth)
- [Nokia — How Nokia triggered the global rise of Bluetooth LE](https://www.nokia.com/blog/how-nokia-triggered-the-global-rise-of-bluetooth-le/)
- [GN Group — ReSound Auracast hearing aids](https://www.resound.com/en-us/hearing-aids/auracast-hearing-aids)
- [Bluetooth SIG — Auracast for hearing aids](https://www.bluetooth.com/blog/auracast-broadcast-audio-will-transform-listening-experiences-for-those-using-hearing-aids/)
- [Bluetooth SIG — Origin of the name](https://www.bluetooth.com/about-us/bluetooth-origin/)

### News

- [GN Group — Frankfurt Airport first to use Auracast (28 Jan 2026)](https://www.gn.com/Newsroom/News/2026/January/Frankfurt-Airport-Becomes-the-First-Airport-Worldwide-to-Use-Auracast)
- [The Hacker News — BrakTooth flaws](https://thehackernews.com/2021/09/new-braktooth-flaws-leave-millions-of.html)
- [The Hacker News — BLUFFS attack](https://thehackernews.com/2023/12/new-bluffs-bluetooth-attack-expose.html)
- [Bitdefender — Apple and Google join forces against AirTag stalking](https://www.bitdefender.com/en-us/blog/hotforsecurity/apple-and-google-join-forces-to-combat-airtag-stalking)
- [TechCrunch — Bluetooth attack can remotely unlock Teslas and smart locks](https://techcrunch.com/2022/05/18/bluetooth-attack-unlock-tesla/)
- [Snopes — Is 'Bluetooth' Technology Named After a Viking King?](https://www.snopes.com/fact-check/bluetooth-etymology/)
- [Digital Music News — Apple AirPods 2023 sales](https://www.digitalmusicnews.com/2024/12/22/apple-raked-in-18-billion-in-airpods-sales-for-2023/)
- [MacRumors — Apple 2.2 billion active devices](https://www.macrumors.com/2024/02/01/apple-2-2-billion-active-devices/)

### Wikipedia

- [Bluetooth](https://en.wikipedia.org/wiki/Bluetooth)
- [Bluetooth Low Energy](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy)
- [Bluetooth Special Interest Group](https://en.wikipedia.org/wiki/Bluetooth_Special_Interest_Group)
- [Jaap Haartsen](https://en.wikipedia.org/wiki/Jaap_Haartsen)
- [Harald Bluetooth](https://en.wikipedia.org/wiki/Harald_Bluetooth)
- [AirTag](https://en.wikipedia.org/wiki/AirTag)
- [BlueBorne (security vulnerability)](https://en.wikipedia.org/wiki/BlueBorne_(security_vulnerability))
- [National Inventors Hall of Fame — Jaap Haartsen](https://www.invent.org/inductees/jaap-c-haartsen)
