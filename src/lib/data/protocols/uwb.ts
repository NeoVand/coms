import type { Protocol } from '../types';

export const uwb: Protocol = {
	id: 'uwb',
	name: 'Ultra-Wideband',
	abbreviation: 'UWB',
	categoryId: 'wireless',
	port: undefined,
	year: 2019,
	rfc: 'IEEE 802.15.4z-2020 (HRP UWB) / FiRa MAC',
	oneLiner:
		'Sub-nanosecond impulse-radio at 6–9 GHz that measures {{tof-ranging|time-of-flight}} to 10–30 cm — AirTag Precision Finding, BMW Digital Key, and {{aliro|Aliro}} hands-free unlock all ride this.',
	overview: `**[[uwb|UWB]] is not a data radio — it is a clock.** Modern UWB transmits sub-nanosecond Gaussian-monocycle impulses across ≥500 MHz of {{spectrum|spectrum}} so that two devices can measure the **{{tof-ranging|time-of-flight of a radio pulse}}** and convert it to distance with 10–30 cm accuracy. [[bluetooth|Bluetooth]] {{rssi|RSSI}} and [[wifi|Wi-Fi]] {{rtt|RTT}} cannot match that — and the whole point in 2026 is the *security* of the measurement, not just the precision. The physical layer is **{{ieee-802-15-4|IEEE 802.15.4z-2020}}** (ratified 31 August 2020); the {{spectrum|spectrum}} is unlicensed under FCC Part 15 Subpart F at **−41.3 dBm/MHz** across 3.1–10.6 GHz, the legacy of the FCC's First Report and Order on Valentine's Day 2002. The two channels everyone actually uses are **Channel 5** (6489.6 MHz) and **Channel 9** (7987.2 MHz), each 499.2 MHz wide.

The consumer story begins on **10 September 2019** when {{apple|Apple}} shipped the **U1 chip** in the iPhone 11. It went mass-market on **30 April 2021** with the $29 **AirTag**, whose Precision Finding feature swept the world's awareness of UWB into one product. Samsung followed with the **Galaxy SmartTag+** in April 2021. **{{ccc-digital-key|CCC Digital Key 3.0}}** (July 2021) made UWB the fine-ranging leg of phone-as-a-key for vehicles — BMW iX shipped first; Mercedes EQS, Hyundai/Kia, and VW ID.7 followed. On **26 February 2026** the CSA published **{{aliro|Aliro 1.0}}** — the "{{matter|Matter}} for door locks" — with [[nfc|NFC]] tap + {{ble|BLE}} proximity + BLE/UWB ranged as its three transports. UWB silicon has consolidated to five suppliers: {{apple|Apple}} captive (U1 16 nm, **U2** 7 nm in iPhone 15+), **Qorvo** (ex-Decawave DW1000/DW3000), **NXP** Trimension SR040/SR150/SR250, Samsung captive (Exynos Connect U100), and a long tail of STMicroelectronics, Microchip, Spark Microsystems, and **3db Access** (Infineon acquired 2024). ABI projects UWB phone penetration rising from **27 % in 2025 to 52 % by 2030**.

The reason UWB matters more than its raw precision is that it can **prove proximity even when an attacker tries to lie about it**. The **2022 NCC Group Tesla Model 3 BLE relay** (CVSS 6.8) — Sultan Qasim Khan unlocking and driving away a parked Tesla from 25 m using $50 of dev boards — showed why {{rssi|RSSI}}-based proximity is fundamentally broken: a {{replay-attack|relay}} can shorten apparent distance with low-{{latency|latency}} forwarding. {{tof-ranging|Time-of-flight}} cannot be shortened by a relay; the speed of light is the hard upper bound. The cryptographic primitive that makes 802.15.4z secure is the **{{sts|Scrambled Timestamp Sequence (STS)}}** — an AES-128-CTR-generated pulse pattern injected into the ranging frame as a distance commitment. Pre-STS UWB (802.15.4a, 2007) was vulnerable to early-detect/late-commit pulse-replay; even STS was shown attackable at ~4 % success in **Ghost Peak** (Leu et al., USENIX Security 2022), which motivated **IEEE 802.15.4ab** (Draft D03 September 2025, ratification expected early 2026) with **NBA-MMS** narrowband-assisted multi-millisecond ranging and a redesigned STS receiver.`,
	howItWorks: [
		{
			title: 'Impulse-radio physical layer — Gaussian monocycles, not a carrier',
			description:
				"Instead of modulating a continuous carrier, **IR-UWB** transmits sub-nanosecond Gaussian-monocycle (or doublet) pulses spaced across the available {{spectrum|spectrum}}. A symbol is built from a burst of pulses at one of two time-slot positions (BPM) with chosen polarity (BPSK) — *Burst-Position Modulation + Binary Phase-Shift Keying*. The mean pulse-repetition frequency is **BPRF ≈ 64 MHz** in the default 802.15.4z mode or **HPRF 124.8 / 249.6 MHz** in higher-power modes. Data rates: 850 kbps, 6.81 Mbps, or 27 Mbps — most ranging deployments use **6.81 Mbps** because shorter {{frame|frame}} air-time reduces clock-drift error. The 499.2 MHz channel {{bandwidth|bandwidth}} and the ≥0.2 fractional-{{bandwidth|bandwidth}} requirement is what makes a UWB transmitter *legally UWB* under FCC Part 15.519."
		},
		{
			title: 'The four ranging paradigms — TWR, DS-TWR, TDoA, AoA',
			description:
				"**{{twr|SS-TWR}} (Single-Sided Two-Way Ranging):** Poll → Response. Initiator measures round-trip, subtracts the responder's reply delay (sent in the response {{payload|payload}}), divides by 2. *Highly sensitive to relative clock drift* — a 20 ppm crystal with a 200 µs reply delay yields ~4 ns of error = ~1.2 m. **{{twr|DS-TWR}} (Double-Sided Two-Way Ranging):** Three messages Poll → Response → Final. The cross-product `(T_round1 × T_round2 - T_reply1 × T_reply2) / (T_round1 + T_round2 + T_reply1 + T_reply2)` cancels clock drift to first order — the production method in 802.15.4z. **TDoA:** Tag chirps once, ≥3 time-synchronised anchors compute the difference of arrival — used for warehouse/hospital RTLS where anchors are wired. **AoA / PDoA:** Two antennas spaced ~λ/2 (≈ 1.9 cm at 8 GHz) compare phase to derive angle — AirTag Precision Finding combines DS-TWR distance with PDoA direction."
		},
		{
			title: 'STS — Scrambled Timestamp Sequence, the cryptographic distance bound',
			description:
				"The vulnerability that 802.15.4a (2007) shipped with: its preamble and SFD patterns are public, so an attacker can predict the next pulse and inject an early replica that the receiver locks onto, shortening apparent distance — the *Cicada* / *Early-Detect / Late-Commit* family. **{{sts|STS}} in 802.15.4z** replaces the predictable preamble-derived timestamp with a 32–2048-chip pulse sequence whose positions are generated by **AES-128 in {{aead|Counter mode}}** keyed by a per-session STS_KEY and a per-frame {{nonce|nonce}}. An attacker without the key sees noise; they cannot predict the next chip and cannot reliably early-replay. The receiver, holding the same key, generates the expected sequence locally and cross-correlates — sharp autocorrelation peak with a fresh code every frame. This is the **distance commitment** that defeats the BLE-{{rssi|RSSI}} {{replay-attack|relay}} class of attack."
		},
		{
			title: 'BLE bootstraps every UWB session — the indispensable on-ramp',
			description:
				"Almost no consumer UWB session is ever opened without {{ble|BLE}} first. The reason is power and discovery: BLE has ubiquitous always-on advertising and standardised pairing; UWB has neither. The canonical pattern in **{{ccc-digital-key|CCC Digital Key 3.0}}** and **{{aliro|Aliro 1.0}}**: **(1)** BLE GAP advertising with the application's service UUID; **(2)** {{gatt|GATT}} {{service-discovery|service discovery}} + authentication (SPAKE2+/PAKE for Digital Key; OOB pairing for AirTag); **(3)** session-key transport over the BLE {{encryption|encrypted}} channel — phone and reader {{exchange|exchange}} **STS_KEY** and ranging parameters via {{apdu|APDU-over-GATT}}; **(4)** BLE-signalled UWB ranging start at a scheduled time slot; **(5)** ranging happens, results returned over BLE. The FCC waiver Schlage filed (ET Docket 22-248, granted 2023) describes this exact sequence in regulator-vetted form."
		},
		{
			title: 'CCC Digital Key 3.0 — the canonical UWB unlock flow',
			description:
				"BMW iX shipped first in early 2022. The vehicle has multiple **UWB anchors** (typically B-pillar and one per door) plus a BLE radio; the phone has U1/U2 ({{apple|Apple}}) or NXP/Qorvo silicon plus its BLE radio. The unlock sequence: BLE Advertising → BLE pairing + {{gatt|GATT}} auth → {{apdu|APDU}} {{exchange|exchange}} where the vehicle authenticates the Digital Key applet in the phone's {{ese|Secure Element}} and derives session keys → BLE transfers the UWB session key (STS_KEY) and ranging schedule → UWB Poll/Response/Final DS-TWR ranging fires across multiple anchors → vehicle computes ToF on each anchor, checks the distance is below threshold *and* the credential is valid → BLE returns Unlock granted/denied. [[nfc|NFC]] remains the fallback for battery-dead phones. **{{ccc-digital-key|CCC Digital Key}} 4.0** (announced July 2025, tested at the 13th Plugfest hosted by {{apple|Apple}}) adds cross-platform key sharing across Android and iOS."
		},
		{
			title: 'The competition — Wi-Fi FTM (802.11mc/11az) and the honest verdict',
			description:
				"**[[wifi|Wi-Fi]] Fine Timing Measurement (FTM)** in IEEE 802.11mc and the security-enhanced **802.11az** is the closest analogue to UWB ranging in mass-market silicon. *Native silicon:* Wi-Fi is already in every phone vs. a dedicated UWB chip. *{{bandwidth|Bandwidth}}:* Wi-Fi 80–160 MHz vs. UWB 499.2 MHz. *Accuracy:* Wi-Fi 1–2 m typical vs. UWB 10–30 cm. *Secure ranging:* Wi-Fi 11az TB/NTB with PASN vs. UWB STS. *Infrastructure:* Wi-Fi reuses existing APs ({{cisco|Cisco}}/Aruba support) vs. dedicated UWB anchors. **Honest verdict:** FTM is *good enough* for room-level indoor positioning; **UWB wins for proximity-based authentication** (car keys, smart locks) because cm-precision *and* the STS distance commitment combine to produce a hard distance upper-bound that FTM cannot match today. 802.11az narrows the gap. They will most likely coexist."
		},
		{
			title: 'Regional masks — design for the strictest you must support',
			description:
				"FCC Part 15.519 caps average PSD at **−41.3 dBm/MHz** across 3.1–10.6 GHz. ETSI EN 302 065 in Europe is similar with stricter Detect-and-Avoid requirements in some sub-bands. **Japan** applies a different mask with restrictions in **7.25–7.75 GHz**, overlapping Channel 9 — {{apple|Apple}}'s iPhone reduces or disables UWB features (Precision Finding, Find People) in Japan and a handful of other countries. Per-country radio law in Korea and individual jurisdictions further constrains commercial UWB. For a global product, design to: **(a)** geo-fence UWB features based on locale; **(b)** default to **Channel 5** in Japan; **(c)** support a *no-UWB* mode for countries where UWB is not permitted at all (consult {{apple|Apple}} Support's UWB-availability list for the current jurisdictional state)."
		}
	],
	useCases: [
		'Item finding with cm-class direction — Apple AirTag, Samsung SmartTag+, Find My / Find My Device',
		'Phone-as-a-key for vehicles — {{ccc-digital-key|CCC Digital Key 3.0 / 4.0}} on BMW, Mercedes, Hyundai/Kia, VW',
		'Hands-free door unlock — Apple Home Key + Aqara U400 / Schlage Encode Plus / Level Lock+ / Ultraloq, now {{aliro|Aliro 1.0}}',
		'Indoor RTLS — hospital asset tracking (Sonitor), warehouse forklifts (Zebra), manufacturing (Apex Locate)',
		'V2P / in-cabin child-presence detection — emerging under Euro NCAP rules from 2025',
		'Wireless-charging-pad alignment — Tesla FCC ET 25-101 waiver for ground-pad UWB alignment to inductive coils',
		'AR / VR controller tracking — Spark Microsystems and Apple Vision Pro accessory ecosystem'
	],
	codeExample: {
		language: 'javascript',
		code: `// Apple Nearby Interaction (iOS 14+) — the framework that abstracts UWB ranging.
// This is roughly what AirTag Precision Finding, BMW Digital Key, and Aqara U400
// all build on top of. The actual ranging happens in U1/U2 silicon; the framework
// exposes distance and direction to the app.
import NearbyInteraction
import MultipeerConnectivity

class RangingSession: NSObject, NISessionDelegate {
  let session = NISession()
  var peerToken: NIDiscoveryToken?

  override init() {
    super.init()
    session.delegate = self
    // Send our own NIDiscoveryToken to the peer via an out-of-band channel
    // (BLE GATT, MultipeerConnectivity, or your own signalling layer).
    if let token = session.discoveryToken {
      sendTokenToPeer(token)
    }
  }

  func startRangingWith(peerToken: NIDiscoveryToken) {
    let config = NINearbyPeerConfiguration(peerToken: peerToken)
    config.isCameraAssistanceEnabled = true   // U2 + ARKit fusion for sub-degree bearing
    session.run(config)
  }

  // Called every ~10 Hz with fresh distance + direction estimates.
  func session(_ session: NISession, didUpdate nearbyObjects: [NINearbyObject]) {
    guard let obj = nearbyObjects.first else { return }
    if let distance = obj.distance {
      print("UWB peer is \\(distance) m away")            // metres, ~10 cm precision
    }
    if let direction = obj.direction {
      print("Bearing vector: \\(direction)")              // 3D unit vector, AoA + ARKit
    }
  }
}`,
		caption:
			"{{apple|Apple}}'s Nearby Interaction framework is the public API every iOS UWB app uses. The U1/U2 silicon handles DS-TWR + PDoA; the framework returns distance in metres and a 3D direction vector at ~10 Hz. AirTag Precision Finding, BMW Digital Key, and the AR experiences in {{apple|Apple}} Vision Pro accessories all sit on top of this. The same NIDiscoveryToken-over-BLE pattern is what {{aliro|Aliro}} 1.0 generalises across Android and Samsung wallets.",
		alternatives: [
			{
				language: 'python',
				code: `# Qorvo DW3000 + Zephyr — the canonical embedded UWB toolchain (br101's port).
# This is what a custom UWB anchor or a smart-lock ranging side looks like.
# Repository: github.com/br101/zephyr-dw3000-examples

# DS-TWR initiator pseudo-flow (real code lives in C; this is the algorithm):
def ds_twr_initiator(dw3000, responder_id, sts_key):
    # 1. Configure STS for secure ranging (4z packet config 1, BPRF mode)
    dw3000.set_sts_key(sts_key)
    dw3000.set_sts_iv(generate_nonce_96())
    dw3000.set_packet_config(1)                        # PHR | data | STS | FCS

    # 2. Send Poll, timestamp at TX
    poll_frame = build_ranging_frame(seq=0, dest=responder_id)
    t1 = dw3000.tx_with_timestamp(poll_frame)

    # 3. Receive Response, the responder echoes t2,t3 (its RX of Poll + TX of Response)
    rx = dw3000.rx_timeout(50_000)                     # 50 µs wait
    t4 = rx.timestamp_rx
    t2, t3 = parse_response(rx.payload)

    # 4. Send Final, carry t1, t4 plus the new TX timestamp t5
    final_frame = build_final(t1, t4, seq=2)
    t5 = dw3000.tx_with_timestamp(final_frame)

    # 5. Responder computes ToF via the cross-product (cancels clock drift):
    #    ToF = (T_round1 × T_round2 - T_reply1 × T_reply2) /
    #          (T_round1 + T_round2 + T_reply1 + T_reply2)
    #    where T_round1=t4-t1, T_reply1=t3-t2, T_round2=t6-t3, T_reply2=t5-t4
    #
    # Distance = ToF × c ≈ ToF × 0.299792458 m/ns
    return  # final ToF computed at responder, returned over BLE`
			},
			{
				language: 'cli',
				code: `# Decoding a UWB ranging session captured with a Qorvo DW3000 evaluation board.
# The PHR field's ranging bit (RFRAME flag) marks ranging frames; STS-bearing
# frames carry up to 2048-chip ciphertext after the payload.

# Snoop on a DW3000 dev board's serial console — the firmware decodes ranging
# rounds and prints distance per round:
minicom -D /dev/ttyACM0 -b 115200
# RX RFRAME seq=0 from 0x0102 STS_OK first_path_index=750 rssi=-67 dBm
# RX RFRAME seq=1 from 0x0102 STS_OK first_path_index=750 rssi=-67 dBm
# DS-TWR result: distance = 1.42 m, std = 6.2 cm

# Wireshark dissector recognises 802.15.4z frames; the relevant filters:
#   wpan                              all 802.15.4
#   wpan.frame_type == 0x01           data frames (ranging frames are data with RFRAME flag)
#   wpan.fcf.ranging_capable          ranging-capable indication in FCF
#   wpan.security_enabled             frames with auxiliary security header

# FiRa UCI (UWB Command Interface) is the standard host-to-UWB-subsystem protocol.
# UCI traffic over the AP's HCI USB transport can be captured with:
hcidump -X -i hciX                    # raw HCI (BLE bootstrap)
nrfutil sniff --device /dev/ttyUSBn   # 802.15.4 sniffer mode (4z-capable on nRF52840)

# Apple's sysdiagnose grabs UWB controller logs:
sudo /usr/bin/sysdiagnose -A SysDiagnose -d  # macOS host paired with an iPhone
# Search for 'NearbyInteraction' and 'StaticArbitrator' subsystems in the bundle.`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'HRP-ERDEV UWB frame — packet configuration 1 (data + STS)',
						code: `+----------+------------+-----+--------------+--------------+----------+
|  SHR     | preamble + | PHR |    PSDU      |     STS      |   FCS    |
|          | SFD        |     |  (data field)|              |          |
+----------+------------+-----+--------------+--------------+----------+
  64–4096    8 symbols   19b      variable     32–4×512       16b CRC-16
  symbols                                      chips/segment

PHR (PHY Header, 19 bits HRP):
  bits 0–6   Frame Length (PSDU length in bytes, MSB first)
  bit  7     Ranging frame indicator (RFRAME) — this frame is for ranging
  bits 8–9   Data Rate                (00 = 850 kbps, 01 = 6.81 Mbps, 10 = 27 Mbps)
  bits 10–12 Spreading factor / reserved
  bits 13–18 SECDED parity over the previous 13 bits

STS segment:
  Up to 4 segments × 32–512 chips each, generated by AES-128-CTR(STS_KEY, nonce || ctr).
  Position of each high-energy pulse is determined by the keystream — an attacker
  without STS_KEY sees only noise.

Packet configurations:
  PC=0   No STS (legacy 4a-compatible; insecure for ranging)
  PC=1   STS after PHR + PSDU
  PC=2   STS between SHR and PHR  (no clear-text PHR-prefix to early-replay against)
  PC=3   STS only — pure ranging frame, no data payload`
					},
					{
						title: 'DS-TWR cross-product — why three messages cancel clock drift',
						code: `Initiator (clock A)                  Responder (clock B)
   |                                         |
   | t1 = TX timestamp                       |
   | ----- Poll ----->                       |
   |                       t2 = RX timestamp |
   |                                         |
   |                  (reply delay T_reply1) |
   |                                         |
   |                       t3 = TX timestamp |
   | <----- Response (carries t2, t3) ------ |
   | t4 = RX timestamp                       |
   |                                         |
   | (reply delay T_reply2)                  |
   |                                         |
   | t5 = TX timestamp                       |
   | ----- Final (carries t1, t4, t5) -----> |
   |                       t6 = RX timestamp |
   |                                         |
   |                       Compute ToF       |

T_round1 = t4 - t1     (initiator's round-trip on Poll/Response)
T_reply1 = t3 - t2     (responder's processing delay)
T_round2 = t6 - t3     (responder's round-trip on Response/Final)
T_reply2 = t5 - t4     (initiator's processing delay)

           T_round1 × T_round2  -  T_reply1 × T_reply2
ToF  =  ─────────────────────────────────────────────────
           T_round1 + T_round2  +  T_reply1 + T_reply2

Distance = ToF × c ≈ ToF × 0.299792458 m/ns.
The cross-product form cancels relative clock drift to first order — DS-TWR is
roughly insensitive to 20 ppm crystal offsets, while SS-TWR would yield ~1.2 m
of bias under the same conditions.`
					},
					{
						title: 'AirTag Precision Finding ranging round (illustrative)',
						code: `─── 1. BLE Advertising on ch 37 (AirTag → iPhone) ────────────────────────────
ADV_NONCONN_IND from AirTag:
  PHY:        LE 1M (2402 MHz)
  AdvData:    Apple Find My service data + ephemeral public key
  Repeat:     every 2 s (Find My beacon cadence)

─── 2. BLE GATT connection + session-key transport ────────────────────────────
iPhone connects, executes Find My ranging-session handshake over GATT
(Apple-proprietary cipher suite; one APDU exchange derives STS_KEY).
Both sides know STS_KEY = K_session before any UWB activity.

─── 3. UWB DS-TWR — Channel 9 (7987.2 MHz, 499.2 MHz BW), BPRF mode ──────────
Poll       RFRAME, seq=0, STS segment (32 chips, AES-CTR keystream)
Response   RFRAME, seq=1, STS segment, payload carries t2, t3
Final      RFRAME, seq=2, STS segment, payload carries t1, t4, t5
           → AirTag computes ToF + cross-product → distance d_meters
           → AirTag also derives AoA via PDoA between iPhone's two U2 antennas

─── 4. Result back over BLE ──────────────────────────────────────────────────
GATT notify on Apple Find My characteristic:
  distance:   1.42 m
  bearing:    +12° azimuth, −3° elevation (relative to iPhone's screen normal)
  STS:        valid (cross-correlation peak well above threshold)

Total session: ~200–400 ms from BLE Advertising to first distance estimate.
Continuous Precision Finding refreshes at ~10 Hz on Apple silicon.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Single DS-TWR ranging round ~1–3 ms on Qorvo DW3000 / NXP SR150; full BLE+UWB unlock session 200–800 ms end-to-end; Apple Nearby Interaction refreshes at ~10 Hz steady-state',
		throughput:
			'850 kbit/s, 6.81 Mbit/s, or 27 Mbit/s data rates on HRP UWB — but UWB is not a data radio. Ranging-frame air-time is the relevant metric: ~150–500 µs per RFRAME at 6.81 Mbps, 6–10× longer at 850 kbps',
		overhead:
			'~64–4096 preamble symbols + 8-symbol SFD + 19-bit PHR + STS segment (32–2048 chips) + 16-bit FCS. STS is mandatory overhead for secure ranging — turning it off recovers nothing useful in 2026 deployments'
	},
	connections: ['bluetooth', 'wifi', 'nfc', 'tls'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Ultra-wideband',
		official: 'https://www.firaconsortium.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Apple_AirTag.svg/330px-Apple_AirTag.svg.png',
		alt: 'An Apple AirTag held between thumb and forefinger — the consumer product that mass-introduced UWB precision finding in April 2021.',
		caption:
			"{{apple|Apple}}'s **AirTag** (30 April 2021, $29) is the product that put UWB into the public vocabulary. Inside is a U1 chip plus a BLE radio, with the Find My network of ~1 billion participating {{apple|Apple}} devices acting as a global crowdsourced locator. The U2-equipped second-generation AirTag shipped in January 2026 with 1.5× longer Precision Finding range and an integrated speaker that is harder to physically remove (an anti-stalking hardening directly motivated by the AirTag stalking cases of 2021–22).",
		credit: 'Image: Wikimedia Commons (CC BY-SA)'
	},

	recentChanges: [
		{
			date: '2023-09',
			title: 'Apple U2 chip ships in iPhone 15 — 1.5× longer Precision Finding range',
			description:
				"{{apple|Apple}} introduced the **U2 ultra-wideband chip** alongside the iPhone 15 family on **12 September 2023**. 7 nm (vs U1's 16 nm), internal codename T2024, part number 339M00298. **1.5× longer Precision Finding range** vs the U1. The U2 also shipped in {{apple|Apple}} Watch Series 9 / Watch Ultra 2 — the first time an Apple Watch could itself act as a UWB initiator for Precision Finding. AirTag 2 (January 2026) carries the U2 alongside the anti-stalking hardware updates.",
			source: {
				url: 'https://www.apple.com/newsroom/2023/09/apple-debuts-iphone-15-and-iphone-15-plus/',
				label: 'Apple newsroom: iPhone 15 launch'
			}
		},
		{
			date: '2022-05',
			title: 'NCC Group Tesla Model 3 BLE relay attack — the case for UWB',
			description:
				"On **15 May 2022** NCC Group's **Sultan Qasim Khan** publicly disclosed a link-layer BLE relay against Tesla Model 3 / Y phone-as-a-key (CVSS 6.8 AV:A/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N). ~$50 of Bluetooth dev boards, ~8 ms relay {{latency|latency}}, below Tesla's ~30 ms {{gatt|GATT}} threshold. Test: 2020 Model 3, iPhone 13 mini 25 m from the car, relay device 3 m from the car — vehicle unlocked and driven away. The same technique works against Kwikset/Weiser Kevo. Tesla recommended PIN-to-Drive as a stopgap; the deeper industry response was the adoption of **UWB-backed {{ccc-digital-key|CCC Digital Key}} 3.0** — cryptographic distance bounds the speed of light cannot relay around.",
			source: {
				url: 'https://research.nccgroup.com/2022/05/15/technical-advisory-tesla-ble-phone-as-a-key-passive-entry-vulnerable-to-relay-attacks/',
				label: 'NCC Group: Tesla BLE relay advisory'
			}
		},
		{
			date: '2022-08',
			title: 'Ghost Peak (USENIX Security 2022) — STS is not enough on its own',
			description:
				"Patrick Leu, Giovanni Camurati, Alexander Heinrich, Marc Roeschlin, Claudio Anliker, Matthias Hollick, and Srdjan Capkun published **Ghost Peak: Practical Distance Reduction Attacks Against HRP UWB Ranging** at **USENIX Security 2022**. First practical distance reduction against deployed **{{apple|Apple}} U1 ⇄ U1** and **U1 ⇄ NXP / Qorvo** combinations. Reduces 12 m to 0 m at up to ~4 % success rate with a **$65 attacker device**. The technique exploits how STS receivers integrate correlation peaks — randomly injected STS-like signals are misread as a low-power early copy of the real signal. Triggered {{apple|Apple}}'s published response paper (arXiv:2312.03964) and the redesign work that eventually fed into IEEE 802.15.4ab.",
			source: {
				url: 'https://www.usenix.org/system/files/sec22fall_leu.pdf',
				label: 'Ghost Peak — USENIX Security 2022 paper'
			}
		},
		{
			date: '2025-09',
			title: 'IEEE 802.15.4ab Draft D03 — narrowband-assisted UWB',
			description:
				"The next-generation UWB amendment progressed to **Draft D03 in September 2025** (D02 March 2025), with ratification expected **early 2026** per ABI Research and STMicroelectronics. Headline additions: **NBA-MMS** (Narrow-Band-Assist Multi-Millisecond Sensing) — a narrowband control channel synchronises, wakes, and schedules UWB ranging, dramatically improving link budget and power; new **radar/sensing modes** for in-cabin child-presence detection (driven by EU Euro NCAP rules from 2025); LRP+HRP dual-mode hardware support; tighter integrity options around STS. STMicroelectronics' **ST64UWB** (announced Q1 2026, 18 nm FD-SOI) is the first commercial 4ab silicon, with ~3 dB link-budget gain over bulk-CMOS designs.",
			source: {
				url: 'https://ieeexplore.ieee.org/document/11179932/',
				label: 'IEEE P802.15.4ab Draft D03'
			}
		},
		{
			date: '2025-07',
			title: 'CCC Digital Key 4.0 announced — cross-platform key sharing',
			description:
				"The **Car Connectivity Consortium** announced Digital Key 4.0 in July 2025 and validated it at the **13th Plugfest hosted by {{apple|Apple}}**. Adds **device-to-device key sharing across Android and iOS**, validates backward compatibility with 3.0 vehicles, and keeps the requirement that devices support at least one of [[nfc|NFC]], BLE, or UWB. HRP UWB under 802.15.4z remains the secure default. **115 vehicle/module products** were certified across 2025 alone; BMW (first cert late 2024), Mercedes, Hyundai/Kia, Audi (new for 2025), VW, Porsche, GM, Ford, and Chinese OEMs (NIO, XPENG, Geely brands).",
			source: {
				url: 'https://carconnectivity.org/',
				label: 'Car Connectivity Consortium'
			}
		},
		{
			date: '2026-02',
			title: 'Aliro 1.0 finalised — "Matter for door locks" with UWB',
			description:
				"On **26 February 2026** the CSA published **{{aliro|Aliro 1.0}}**, a PKI-based access-control credential standard with **[[nfc|NFC]] (tap) + BLE (proximity) + BLE+UWB (ranged, hands-free)** as its three transports. ECDSA mutual authentication; credentials provisioned into {{apple|Apple}}, {{google|Google}}, and Samsung wallets. First products: **Aqara U400** (first smart lock with UWB; {{aliro|Aliro}} coming via firmware update) and **Kwikset Halo Select Plus**. Launch partners include {{apple|Apple}}, {{google|Google}}, Samsung, ASSA ABLOY, NXP, Infineon, STMicroelectronics, Silicon Labs, Nordic Semiconductor, plus smart-lock makers Schlage, Avia, Nuki, Xthings. {{aliro|Aliro}} generalises the Apple Home Key UX across Android — the most consequential UWB-related deployment of 2026.",
			source: {
				url: 'https://csa-iot.org/all-solutions/aliro/',
				label: 'CSA: Aliro 1.0'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Apple AirTag',
			scale: 'Tens of millions of units annually 2022–2025 (Apple does not publish official figures)',
			description:
				"Launched **30 April 2021** at $29 single / $99 four-pack. BLE for the Find My network ping + U1 UWB for the cm-class Precision Finding when you are within ~5 m. The Find My network of approaching ~1 billion participating {{apple|Apple}} devices is the world's largest crowdsourced locator. AirTag is, per {{apple|Apple}}'s own marketing, the best-selling item tracker on Earth. The second-generation AirTag shipped **January 2026** with U2, 1.5× longer Precision Finding range, a louder and harder-to-remove speaker (hardware anti-stalking), and Apple Watch Series 9+ Precision Finding support."
		},
		{
			org: 'BMW Digital Key Plus',
			scale: 'First production CCC Digital Key 3.0 UWB vehicle; available on iX, i7, X5/X6/X7, 7 Series, 5 Series, MINI Countryman',
			description:
				"Announced **13 January 2021**; customer rollout from early 2022. **First production {{ccc-digital-key|CCC Digital Key}} 3.0 UWB vehicle**. BMW jointly developed the spec with {{apple|Apple}} and the CCC. BMW Group was the first OEM to receive {{ccc-digital-key|CCC Digital Key}} Certification for its UWB-based digital vehicle access. The UX: walk up to the car, the doors unlock as you reach the handle (BLE detects you, UWB confirms which side of the door you are on); inside, set the phone down anywhere and start the car (no key-fob ritual)."
		},
		{
			org: 'Mercedes-Benz EQS / S-Class',
			scale: 'NFC+UWB CCC Digital Key 3.0 across the flagship lineup',
			description:
				"Mercedes-Benz partnered with {{apple|Apple}} on the Wallet-based Digital Key for the EQS and S-Class from 2022. **NXP SR1xx** silicon family in the vehicle anchors. The Mercedes Digital Key was one of the first deployed cases of an NFC-fallback + UWB-precision unlock — battery-dead phones still get in via [[nfc|NFC]] tap; otherwise UWB walk-up authentication takes over."
		},
		{
			org: 'Aqara U400 + Apple Home Key + Aliro',
			scale: 'First smart lock shipped with UWB support (2025); Aliro 1.0 firmware update post-CES 2026',
			description:
				"**Aqara U400** is the first commercial smart lock to ship with UWB. Initially {{apple|Apple}}-Home-Key-only — meaning the experience worked only for iPhone owners. With **{{aliro|Aliro}} 1.0** (CSA, 26 February 2026) coming via firmware update — announced at CES 2026 — the same lock will work hands-free with Android, Samsung, and any {{aliro|Aliro}}-compliant wallet. The {{apple|Apple}} Home Key experience (tap or walk up; door unlocks if your iPhone is the authenticated bearer) is what {{aliro|Aliro}} generalises across vendors."
		},
		{
			org: 'Samsung Galaxy SmartTag+ + Galaxy S21+ family',
			scale: 'First non-Apple UWB tracker; UWB on every Galaxy flagship from S21 Ultra onward',
			description:
				"**Samsung Galaxy SmartTag+** shipped **April 2021** — the first non-{{apple|Apple}} UWB tracker. Works with Galaxy S21+ / S21 Ultra / Note 20 Ultra / S22/S23/S24 (UWB-equipped models) for AR-based directional finding via SmartThings Find. Samsung's **Exynos Connect U100** in-house UWB silicon also shipped in the Note 20 Ultra (August 2020) before the SmartTag+ release — Samsung was technically *first to a phone* with UWB silicon, just a year after {{apple|Apple}}'s U1."
		},
		{
			org: 'Industrial / hospital RTLS — Sonitor, Zebra, Apex Locate',
			scale: 'TDoA anchor deployments; typical anchor density 1 per ~20–30 m² for cm-class accuracy',
			description:
				"**Sonitor** runs clinical-grade hospital asset tracking (patients, equipment, surgical instruments). **Zebra Technologies** runs warehouse forklift and pallet tracking at high anchor density. **Apex Locate** focuses on manufacturing. These are TDoA-anchor deployments (multiple time-synchronised receivers measure the time difference of arrival of a single tag's pulse) rather than {{peer-to-peer|peer-to-peer}} ranging — anchors connect over wired [[ethernet|Ethernet]] with PTP-grade clock distribution. **{{cisco|Cisco}} partnered with Sewio in October 2019** to integrate UWB into wireless access points, but the strategy has been slow to mature."
		},
		{
			org: 'UWB-equipped iPhone install base',
			scale: '>1 B iPhones from iPhone 11 (Sep 2019) onward; ABI projects 27 % → 52 % UWB phone penetration 2025–2030',
			description:
				"{{apple|Apple}} shipped >1 billion iPhones from the iPhone 11 (10 September 2019) onward by mid-decade. Not every iPhone has UWB — **iPhone SE 1/2/3, iPhone 16e, and iPhone 17e** do not include a UWB chip — but the FiRa-compatible UWB device install base is the largest of any UWB ecosystem worldwide, dwarfing the Samsung Galaxy UWB-flagship base. The U1 cohort spans iPhone 11 through iPhone 14, AirTag (1st gen), HomePod mini, {{apple|Apple}} Watch Series 6+, and the AirPods Pro 2 case. The U2 cohort: iPhone 15/16/17 (excluding 16e/17e), AirTag 2."
		}
	],

	funFacts: [
		{
			title: 'The FCC adopted UWB regulations on Valentine\'s Day, 14 February 2002',
			text: "The First Report and Order in ET Docket 98-153 (**FCC 02-48**, 17 FCC Rcd 7435), adopted **14 February 2002**, released **22 April 2002**, effective **15 July 2002**, was hard-won against GPS (operating at L1=1575.42 MHz), avionics, and DoD interests who feared aggregate interference into safety-of-life systems. The **−41.3 dBm/MHz** EIRP limit is essentially the §15.209 background-unintentional-radiator threshold — UWB devices may not emit *more than ordinary unintentional radiators do*, despite being intentional transmitters."
		},
		{
			title: 'IEEE 802.15.3a is one of the most public failures of an IEEE 802 task group',
			text: "After three years of deadlock between **MB-OFDM** ({{intel|Intel}} + WiMedia Alliance) and **DS-UWB** (Freescale + UWB Forum), neither side could win the 75 % supermajority required to ratify. At the Waikoloa, HI interim on **19 January 2006** the task group voted to **recommend its own dissolution**. The joint UWB Forum / WiMedia Alliance statement that *a more prudent course of action is necessary* became a textbook example of standards-body coalition deadlock. WiMedia formally dissolved in 2009, transferring its specs to USB-IF, Bluetooth SIG, and the Wireless USB Promoter Group. What did not die: the 802.15.4a impulse-radio side that became 4z, became FiRa, became every U1-equipped iPhone."
		},
		{
			title: 'The "U" in Apple\'s U1 / U2 stands for Ultra-Wideband',
			text: "{{apple|Apple}}'s silicon naming convention runs by family letter — **A**-series application processor, **M**-series Mac, **W**-series wireless, **H**-series headphone, **T**-series secure enclave/T2, **S**-series watch SiP, **R**-series Vision Pro. **U1** (shipped iPhone 11, September 2019) was the first {{apple|Apple}}-designed UWB chip. **U2** (announced 12 September 2023, internal codename T2024, part number 339M00298) moved from 16 nm to 7 nm and was the first Apple silicon other than the A/M-series to receive its own keynote slide."
		},
		{
			title: 'AirTag spawned its own pop-culture genre on Twitter / X',
			text: "Through 2021–2022, accounts amassed followers posting *found an AirTag in my jacket pocket at the airport / in my car after a date / in my luggage* threads. These stories drove enormous public awareness of UWB's existence — most non-engineers had never heard of UWB before they heard of AirTags — and accelerated cross-industry safety standardisation. The result: the **{{ietf|IETF}} DULT (Detecting Unwanted Location Trackers)** working group, the cross-vendor *tracker has been moving with you* alerts that work across {{apple|Apple}}'s Find My and {{google|Google}}'s Find My Device networks regardless of vendor, and the AirTag 2's hardware anti-tampering."
		},
		{
			title: 'Apple silicon engineers published their security response on arXiv',
			text: "**Secure Ranging with IEEE 802.15.4z HRP UWB** (Luo, Kalkanli, Zhou, Zhan, Cohen — arXiv:2312.03964, December 2023) is a rare instance of {{apple|Apple}} silicon engineers publishing a {{peer|peer}}-reviewable response to academic security research — specifically the Singh / Leu / Capkun lineage from ETH Zurich. The paper specifies an STS receiver design and proves its security and asymptotic optimality under the documented attack model. The cultural significance is almost as large as the technical: {{apple|Apple}} does not normally publish protocol-level threat analysis, and the act of doing so signalled that UWB security was sufficiently competitive to require open {{exchange|exchange}} with academia."
		},
		{
			title: 'FiRa stands for "Fine Ranging"',
			text: "The original {{fira|FiRa Consortium}} press release from **1 August 2019** made the etymology explicit: *the FiRa name, which stands for Fine Ranging, highlights UWB technology's unique ability to deliver unprecedented accuracy when measuring the distance or determining the relative position of a target*. FiRa now certifies interoperability and runs the FiRa MAC profile for application-layer ranging configuration; member roster spans {{apple|Apple}}, Samsung, NXP, Bosch, HID, Sony, and roughly 200 others."
		},
		{
			title: 'The iPhone 16e and 17e do not have UWB',
			text: "{{apple|Apple}} removed UWB from the *e* line-up as a cost-down. This creates an awkward {{fragmentation|fragmentation}}: **Precision Finding for AirTag works on iPhone 11–17, except the 16e and 17e** (and the pre-iPhone-11 SE models). Anti-stalking unwanted-tracker detection still works via BLE on every iPhone. If you are scoping a UWB feature for an iOS app in 2026, gating on `NISession.isSupported` rather than assuming *modern iPhone implies UWB* will save you a support ticket later."
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Channel choice — start with Channel 5, plan for Channel 9',
				text: "UWB has 16 HRP channels but only **two see real-world use**: Channel 5 (6489.6 MHz) and Channel 9 (7987.2 MHz), each 499.2 MHz wide. Older silicon (Qorvo DW1000) supports only Channel 5; everything from DW3000 / NXP SR150 / {{apple|Apple}} U1 onwards supports both. Japanese regulations restrict 7.25–7.75 GHz, which **clips Channel 9 in Japan**. For interoperability fallback, support Channel 5 — it works everywhere. For isolation from 6 GHz Wi-Fi 6E (which is squeezing the 5.925–7.125 GHz band increasingly hard), **prefer Channel 9 where regulation allows and fall back to Channel 5 in Japan and a few other jurisdictions**. {{ccc-digital-key|CCC Digital Key}} 3.0 mandates both. Verify against ETSI EN 302 065 (EU) and Japanese radio law before launch."
			},
			{
				title: 'STS / cipher suite — turn it on, and watch the receiver',
				text: "**802.15.4a UWB (pre-STS) is exploitably vulnerable to distance-decrease attacks.** Even 4z STS, naïvely implemented, was broken by Ghost Peak (2022) and Cicada++ at ~4 % success. For any 2024+ design: **(a)** require STS in all production ranging modes; **(b)** use FiRa's current cipher-suite recommendations rather than rolling your own; **(c)** treat the STS receiver as a security-critical component subject to the same review as cryptographic code ({{apple|Apple}}'s published reference receiver, arXiv:2312.03964, is the current academic state of the art); **(d)** plan for IEEE 802.15.4ab silicon support as it becomes available, particularly NBA-MMS which significantly improves both link budget and anti-injection robustness."
			},
			{
				title: 'AoA antenna geometry — get the spacing right',
				text: "Phase-difference-of-arrival angle estimation requires ≥2 antennas spaced **~λ/2**. At 6.5 GHz, λ/2 ≈ 2.3 cm; at 8 GHz, λ/2 ≈ 1.9 cm. **Spacing larger than λ/2 introduces angular ambiguity. Spacing significantly smaller degrades angular resolution.** Use the canonical ~λ/2 spacing. For 3D angle estimation (azimuth + elevation), use three antennas in an L-shape or 2D array. Beware of the antenna's near-field interaction with the phone body / car door — {{apple|Apple}}'s U1 antennas are placed along the iPhone frame for a reason; door-handle UWB anchors typically use planar PCB patches with carefully controlled ground planes."
			},
			{
				title: 'BLE-bootstrap fragility — design for graceful failure',
				text: "Every consumer UWB session opens over [[bluetooth|BLE]]. BLE pairing failures, {{gatt|GATT}} timeouts, or BLE link loss during the UWB session derail the whole interaction. **(a)** Make UWB ranging {{idempotent|idempotent}} — a failed ranging round should not invalidate the BLE session key; allow retries. **(b)** Set BLE {{gatt|GATT}} response timers generously enough to allow STS_KEY transport before UWB starts (~100–300 ms typical). **(c)** Provide an [[nfc|NFC]] fallback for the unlock UX ({{ccc-digital-key|CCC Digital Key}} 3.0 design pattern) — if BLE {{handshake|handshake}} fails or the device's battery is critically low, the [[nfc|NFC]] tap-to-unlock path keeps the user in their car. **(d)** Log BLE/UWB transition failures separately for diagnostics — they look identical to the user but have different root causes."
			},
			{
				title: 'Line-of-sight is everything; NLOS gives you positive distance bias',
				text: "UWB resolves {{multipath|multipath}} at ~1 ns = 30 cm, but in **non-line-of-sight (NLOS)** conditions through walls/people/metal, the first path may be heavily attenuated and the receiver locks onto a later, stronger reflection. Result: a **positive distance bias of 10s of cm to a metre**. Use first-path detection algorithms rather than peak-detection — modern chips expose first-path index and confidence metrics. Apply NLOS bias correction using channel-impulse-response (CIR) features; recent Adaptive Kalman Filter work shows 30–50 % accuracy improvement. Place infrastructure anchors to maximise LOS to the working volume; ceiling mounts are typical in warehouse/hospital RTLS."
			},
			{
				title: 'Power consumption — UWB ranging is not cheap',
				text: "A single DS-TWR ranging round on a Qorvo DW3000 or NXP SR150 draws on the order of **milliamps for ~1–3 ms**, vs. BLE scan/advertise at hundreds of microamps. A 1 Hz ranging cadence adds ~3 mA average on a tag — material on a coin-cell-powered AirTag-class device. **(a)** Range on demand only — gate UWB ranging on a BLE proximity event, not continuously. **(b)** Use BPRF (~64 MHz mean PRF) for tag-side rather than HPRF. **(c)** Use 4ab NBA-MMS as it becomes available — the narrowband-assist {{signaling|signaling}} lets you wake the UWB radio only for scheduled millisecond slots. **(d)** Profile end-to-end power before launch; UWB ranging's contribution to product battery life is real and easy to underestimate."
			}
		]
	}
};
