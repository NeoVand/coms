/**
 * Part V — Wireless.
 *
 * Bits through the air — from ALOHAnet (1971) to Wi-Fi 8, Bluetooth 6.0,
 * 5G-Advanced, and Starlink Direct-to-Cell. Nine chapters cover the
 * shared-medium foundations, the six member protocols (Wi-Fi, Bluetooth,
 * Cellular, NFC, UWB, Zigbee), the cross-cutting wireless-security
 * lineage, and the spectrum frontier through 2030. The pedagogical arc:
 * a reader who has understood TCP-on-Ethernet now meets a medium that
 * is shared by default, lossy by physics, and adversarial when crowded.
 */

import type { BookPart } from '../types';

export const wireless: BookPart = {
	id: 'wireless',
	title: 'Wireless',
	label: 'V',
	description:
		'Bits through the air — from ALOHAnet to Wi-Fi 8, from a 1994 Ericsson headset cable to billions of AirPods, and from a 1973 patent to the NFC tap on every payment terminal.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'the-shared-medium',
			title: 'The shared medium',
			synopsis:
				'Why wireless is a fundamentally different problem from wired — the medium is shared, signals fade, and physics actively conspires against you.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Wired networks fail when something breaks. Wireless networks fail because the medium is shared with everything else operating in the same band — including, sometimes, an attacker. Every architectural choice in this part of the book exists to make a hostile medium predictable.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Three problems wired networks never have to solve',
							text: `Plug an [[ethernet|Ethernet]] cable in and the physics is finished. The wire carries your bits, only your bits, with a known impedance and a {{checksum|CRC}} that catches the occasional bit flip. The bottom four bytes of an [[ethernet|Ethernet]] frame have been the same since 1980 for exactly that reason — once the medium is dedicated to you, there is almost nothing left to negotiate.

Wireless never gets that gift. **The medium is shared by everything operating in the same band** — your laptop, your neighbour's laptop, the microwave oven leaking 2.4 GHz energy from the kitchen, the baby monitor down the hall, a [[bluetooth|Bluetooth]] earbud, a [[zigbee|Zigbee]] light bulb, and, on a bad day, a deliberate jammer. **Every transmission radiates outward**, falling off as 1/r² in free space and much faster through walls and water, so the same packet that is perfectly readable at three metres is statistical noise at thirty. **Every receiver gets every signal the antenna can pick up**, then has to figure out which of them is the one you wanted — and which copies of *that* one, bounced off the floor and ceiling and a parked car, arrived a few nanoseconds later and partially cancelled the direct path.

Wired networking is a problem with a known solution. Wireless networking is three intertwined problems — sharing, fading, and {{multipath|multipath}} — that the entire stack from PHY to application has to compensate for at every layer.`
						},
						{
							type: 'narrative',
							title: "CSMA/CA — the bedrock trick",
							text: `Wired [[ethernet|Ethernet]] uses **CSMA/CD** (Collision *Detection*): a station listens while it transmits, and the moment another station's signal collides with its own on the wire, both back off and retry. That trick is **impossible on radio**. Your own transmitter saturates your own receiver — a wireless NIC literally cannot hear another station while it is sending. Every wireless MAC therefore uses **{{csma-ca|CSMA/CA}}** — listen *before* you talk, plus a randomised back-off if the channel was busy, plus a mandatory {{ack|ACK}} after every {{unicast|unicast}} frame so the sender knows whether it got through.

[[wifi|Wi-Fi]] calls it DCF (Distributed Coordination Function). Before each frame, a station senses the channel for a DIFS interval (28–34 µs), picks a random slot from a contention window (initial CW = 15, doubled on collision up to 1023), and transmits if still idle. Every successful frame is ACKed after a SIFS gap (~10 µs); no ACK in time is presumed to mean collision and the sender retries from a larger window. The ratio of *protocol overhead* to *payload bytes* on a busy 802.11 channel routinely exceeds 50% — which is why a Wi-Fi 6 access point's nominal 9.6 Gbit/s shows up as 1–2 Gbit/s of real throughput in a crowded room.

[[zigbee|Zigbee]] and [[zigbee|Thread]] use a similar unslotted CSMA-CA on {{ieee-802-15-4|IEEE 802.15.4}}. [[bluetooth|Bluetooth]] dodges the problem by **{{frequency-hopping|frequency-hopping}}** — 1,600 hops/sec on BR/EDR — so collisions on any single channel are statistically rare. [[cellular|Cellular]] does not contend at all on the downlink; the base station schedules every slot.`
						},
						{
							type: 'callout',
							title: 'The hidden-terminal problem in one sentence',
							text: 'On a wired bus, every station hears every other station. On a radio, station A and station C may both hear {{access-point|AP}} B but **not each other** — so they both think the channel is clear, both transmit at once, and both collide at B. The **{{hidden-terminal|RTS/CTS}}** option exists because of this; so does [[bluetooth|BLE]]\'s master-clocked frequency hopping; so does every [[cellular|cellular]] RAN\'s centralised uplink scheduler. The same physics ripples through every wireless protocol design.'
						},
						{
							type: 'narrative',
							title: 'The 2.4 GHz coexistence dance',
							text: `Four protocol families share the unlicensed 2.4 GHz **{{ism-band|ISM band}}**: [[wifi|Wi-Fi]] (20 MHz channels centred at 2412 / 2437 / 2462 MHz — the canonical 1/6/11 trio), [[bluetooth|Bluetooth]] BR/EDR (79 × 1 MHz channels hopping 1,600/sec), [[bluetooth|BLE]] (40 × 2 MHz channels), and [[zigbee|Zigbee]] / Thread on {{ieee-802-15-4|IEEE 802.15.4}} (16 × 2 MHz channels at 11–26). Plus microwave ovens, baby monitors, cordless phones, USB-3 hubs, and every other device any regulator ever granted Part 15 to.

They coexist by a series of small accommodations. **Modern combo chips** (Apple H-series, Broadcom, Qualcomm) put Wi-Fi and Bluetooth radios on the same die and arbitrate {{airtime|airtime}} in firmware, time-slicing so one starves the other only briefly. **Zigbee dodges Wi-Fi**: channels 15, 20, 25, and 26 sit in the gaps between Wi-Fi 1/6/11, and the single most common cause of unreliable Zigbee is a coordinator dongle plugged into a Wi-Fi router's USB port whose switched-mode PSU radiates broadband 2.4 GHz noise. **BLE picks its advertising channels carefully** — 37/38/39 sit at 2402, 2426, and 2480 MHz, deliberately outside Wi-Fi 1/6/11; the 37 data channels rely on adaptive frequency hopping to dodge active access points. **The 5/6 GHz escape valve** is where Wi-Fi 5, 6, 6E, 7, and 8 increasingly live, leaving 2.4 GHz to IoT.

[[cellular|Cellular]] bands are **licensed**, which is why your phone's 4G/5G radio does not fight with your Wi-Fi even in the same physical space — different spectrum entirely. The price of that predictability is the billions paid at every national spectrum auction.`
						},
						{
							type: 'narrative',
							title: 'The power–range–throughput triangle',
							text: `Every wireless protocol picks two corners of a three-way trade-off: **transmit power, range, and throughput**. You can have any two cheaply; the third is what the spec is really negotiating, and that triangle is why we have six wireless protocols in this Part instead of one.

[[nfc|NFC]] picks **low power + low range** — passive cards harvest microwatts from the reader's field at ≤10 cm and trade everything for a 13.56 MHz carrier that physics caps at ~424 kbit/s. [[bluetooth|BLE]] picks **low power + medium throughput** — coin-cell devices at 1–2 Mbit/s over 10 m. [[wifi|Wi-Fi]] picks **high throughput + medium range** — gigabit speeds at 30 m, but only because the AP burns hundreds of milliwatts of TX power and runs off mains electricity. [[cellular|Cellular]] picks **range + throughput** at the cost of power and licensed spectrum — 50 km from the right base station, ~1–10 Gbit/s in FR1, but you do not run a base station on a coin cell. [[uwb|UWB]] sits in a corner of its own: **wide bandwidth + low average power** by trading time-of-flight precision for any meaningful data rate. It is a clock, not a data radio.

**Edholm's law of bandwidth** — wireless data rates double roughly every 18 months — is what keeps the table moving. Every protocol in this Part has shipped two or three generation upgrades since 2010 to keep its corner of the triangle in tension.`
						},
						{
							type: 'callout',
							title: 'The bootstrap pattern: no wireless protocol works alone',
							text: 'Almost every consumer wireless interaction in 2026 chains *multiple* radios. **[[uwb|UWB]] ranging** never starts without [[bluetooth|BLE]] first — the lock or car advertises a service UUID over BLE, the phone runs SPAKE2+ authentication and ships the STS_KEY over the encrypted GATT channel, only then does UWB power on for a three-message ranging round. **[[bluetooth|Bluetooth]] / [[wifi|Wi-Fi]] handover** is bootstrapped by [[nfc|NFC]] — a 4 cm tap carries the BLE MAC + SMP OOB key or the Wi-Fi SSID + WPA key in an NDEF record. **[[zigbee|Zigbee]] + Thread** are commissioned over BLE (Zigbee Direct) or Wi-Fi ({{matter|Matter}} setup); once commissioned they run their own mesh. **[[cellular|Cellular]] data** falls back to [[wifi|Wi-Fi]] Calling when the carrier signal is weak — IPsec ePDG tunnel from the UE to the carrier core over any IP link, including the airport Wi-Fi you just joined. The radio with the **best discovery + power profile** does the bootstrap; the radio with the **right property for the workload** (range, throughput, precision, security) does the actual session. Each chapter that follows is one corner of that bigger picture.'
						},
						{
							type: 'narrative',
							title: 'A note on chapter 2 — Wi-Fi appears twice',
							text: `[[wifi|Wi-Fi]] gets a chapter in Part III (Layer 2–3) and another one here. That is on purpose. Part III's chapter is about Wi-Fi as a **layer-2 fabric** — the bit that bridges 802.11 frames to [[ethernet|Ethernet]] and lets [[ip|IP]] forget the medium underneath. This Part's chapter is about Wi-Fi as a **radio** — CSMA/CA, MLO, the 6 GHz politics, the {{krack|KRACK}} → Dragonblood → SSID-Confusion lineage of attacks that only make sense once you understand the shared-medium problem above. Two halves of the same protocol, one from the cable's perspective and one from the airwaves'.`
						}
					]
				},
				{ kind: 'category-story', categoryId: 'wireless', sectionIndex: 0 },
				{ kind: 'category-story', categoryId: 'wireless', sectionIndex: 1 }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'wifi',
			title: 'Wi-Fi',
			synopsis:
				'802.11 from 1997 to Wi-Fi 8 — CSMA/CA, the move to 5 / 6 GHz, OFDMA, MLO, and the KRACK story that put WPA2 on every CTO\'s radar.',
			slots: [
				{ kind: 'protocol', id: 'wifi', facets: ['overview', 'header', 'incidents'] },
				{
					kind: 'pull-quote',
					text: "Wi-Fi shares the 2.4 GHz ISM band with Bluetooth. Modern combo chips do time-division arbitration at the silicon level so the two don't starve each other. The escape to 5 and 6 GHz on the Wi-Fi side has eased the crowding; Bluetooth stays at 2.4 GHz where every battery-powered consumer device already lives — and so do Zigbee and Thread.",
					attribution: 'Wi-Fi protocol page'
				},
				{ kind: 'simulation', protocolId: 'wifi' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'bluetooth',
			title: 'Bluetooth — Classic, LE, and the 6.0 ranging future',
			synopsis:
				'BR/EDR, BLE, GATT, LE Audio + Auracast, and Channel Sounding. Plus the KNOB / BIAS / BLUFFS lineage that broke session security three times in five years.',
			slots: [
				{ kind: 'protocol', id: 'bluetooth', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'jaap-haartsen' },
				{ kind: 'pioneer', id: 'jim-kardach' },
				{ kind: 'simulation', protocolId: 'bluetooth' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'cellular',
			title: 'Cellular — 4G LTE + 5G NR + the 3GPP machine',
			synopsis:
				'One node for the radio (LTE-Uu, NR-Uu) and the core (EPC → 5GC SBA) because the release calendar is the same. VoLTE/Wi-Fi calling, NB-IoT/LTE-M, and the SS7/Diameter failure case.',
			slots: [
				{ kind: 'protocol', id: 'cellular', facets: ['overview', 'header'] },
				{ kind: 'pioneer', id: 'marty-cooper' },
				{ kind: 'pioneer', id: 'andrew-viterbi' },
				{
					kind: 'pull-quote',
					text: 'The control plane of every modern carrier on Earth is now an HTTP/2 microservice fabric — and every backhaul hop is wrapped in IPsec ESP per 3GPP TS 33.501. The single largest enterprise IPsec deployment on Earth runs inside this layer.',
					attribution: 'Cellular protocol page'
				},
				{ kind: 'simulation', protocolId: 'cellular' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'nfc',
			title: 'NFC — 4 cm of wireless that runs the global payment rails',
			synopsis:
				'ISO 18092, Type 1–5 tags, EMV, transit, Apple Pay, CCC Digital Key, Aliro 1.0, and the Charles Walton-to-Apple-Pay arc that took 31 years.',
			slots: [
				{ kind: 'protocol', id: 'nfc', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'charles-walton' },
				{ kind: 'pioneer', id: 'franz-amtmann' },
				{ kind: 'pioneer', id: 'karsten-nohl' },
				{
					kind: 'pull-quote',
					text: 'Sixteen bytes of ASCII — ZigBeeAlliance09, the default Zigbee Trust Center link key — baked into the specification of one of the most widely deployed wireless protocols on Earth. Generations of Wireshark users have memorised that hex string.',
					attribution: 'Zigbee protocol page — but the moral applies across wireless'
				},
				{ kind: 'simulation', protocolId: 'nfc' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'uwb',
			title: 'UWB — nanosecond pulses for centimetre ranging',
			synopsis:
				'IEEE 802.15.4z, FiRa, CCC Digital Key 3.0, Apple U1 / U2, the 2022 Tesla BLE relay attack that motivated the move to UWB, and the Ghost Peak STS residual.',
			slots: [
				{ kind: 'protocol', id: 'uwb', facets: ['overview', 'header'] },
				{ kind: 'pioneer', id: 'robert-scholtz' },
				{ kind: 'pioneer', id: 'moe-win' },
				{ kind: 'pioneer', id: 'srdjan-capkun' },
				{
					kind: 'pull-quote',
					text: 'UWB is not a data radio — it is a clock. Modern UWB transmits sub-nanosecond impulses across ≥500 MHz of spectrum so two devices can measure the time-of-flight of a radio pulse with 10–30 cm accuracy. The point in 2026 is the security of the measurement, not just the precision.',
					attribution: 'UWB protocol page'
				},
				{ kind: 'simulation', protocolId: 'uwb' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'zigbee',
			title: 'Zigbee, Thread, and the Matter bridge',
			synopsis:
				'IEEE 802.15.4 mesh, Zigbee PRO R23 (Dynamic Link Key, Trust Center Swap-Out), the Hue installed base, and how Matter bridges Zigbee semantics onto IP.',
			slots: [
				{ kind: 'protocol', id: 'zigbee', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'bob-heile' },
				{ kind: 'pioneer', id: 'tobin-richardson' },
				{
					kind: 'pull-quote',
					text: "Philips Hue's 2012 Apple Store launch never said \"Zigbee\" out loud. The press release mentioned ZigBee LightLink exactly once; the in-store materials, packaging, and iOS app strenuously avoided the term. The customer was sold *web-enabled* lighting. The canonical example of a successful protocol whose user-visible brand is the product, not the standard.",
					attribution: 'Zigbee protocol page'
				},
				{ kind: 'simulation', protocolId: 'zigbee' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'security-across-the-wireless-family',
			title: 'Security across the wireless family',
			synopsis:
				'KRACK, BLUFFS, KNOB/BIAS, FragAttacks, SS7 / Diameter abuse, MIFARE Crypto1, the 2022 Tesla BLE relay, and the Ghost Peak UWB STS attack — one chapter tying the wireless attack lineage together.',
			slots: []
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'spectrum-and-the-frontier',
			title: 'Spectrum, regulation, and what comes next',
			synopsis:
				'6 GHz Wi-Fi, mmWave, Ligado/L-band, the 47-day-cert cliff, WRC-27, Ambient IoT, Wi-Fi 8, 6G targets, and Starlink Direct-to-Cell. The wireless frontier through 2030.',
			slots: []
		}
	]
};
