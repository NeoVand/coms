import type { CategoryStory } from './types';

export const wirelessStory: CategoryStory = {
	categoryId: 'wireless',
	tagline:
		'Bits through the air — from ALOHAnet to Wi-Fi 8, from a 1994 Ericsson headset cable to billions of AirPods',
	sections: [
		{
			type: 'narrative',
			title: 'When the Air Became a Wire',
			text: `Wired networking is a problem with a known solution: run a copper or fibre line, agree on a frame format, and you're done. Wireless networking is a problem with no clean solution — the medium is shared, every transmission reaches every receiver in range, and the laws of physics actively conspire against you. Echoes, fading, hidden terminals, interference from microwave ovens. Yet wireless is what makes the modern internet feel personal: you don't carry a Cat-6 cable in your pocket.

Two technologies broke through. **[[wifi|Wi-Fi]]** (IEEE [[wifi|802.11]], 1997) took [[ethernet|Ethernet]]'s shared-medium model — CSMA/CD on coax — and adapted it for radio: {{csma-ca|CSMA/CA}} (Collision *Avoidance*, because radios can't detect collisions while transmitting), RTS/CTS handshakes for hidden terminals, {{encryption|encryption}} built in because the air can't be physically secured. Today it carries most consumer traffic.

**[[bluetooth|Bluetooth]]** (1999) took the *opposite* approach: tiny piconets, frequency-hopping 1,600 times per second to dodge interference, master-slave (now Central/Peripheral) topology, microamp-scale power budgets. Different goals, different design.

And, sitting beside both of them in this category, **[[cellular|Cellular]]** — 4G LTE and {{5g-nr|5G NR}}, the {{3gpp|3GPP}} family that the rest of the world calls "the phone network." About 9 billion subscriptions in 2026. Where [[wifi|Wi-Fi]] is unlicensed and operated by whoever owns the building and [[bluetooth|Bluetooth]] is a personal-area network you carry in your pocket, [[cellular|cellular]] is **licensed {{spectrum|spectrum}}, carrier-operated, wide-area, mobile** — and architecturally it is one of the largest [[ipsec|IPsec]] + [[http2|HTTP/2]] microservice fabrics on Earth.

Together — Wi-Fi for local broadband, Bluetooth for personal-area, Cellular for wide-area — the three cover every wireless surface from streaming 4K video to a hearing aid sipping power from a coin cell to a phone connecting to a {{starlink|Starlink}} satellite 600 km overhead.`
		},
		{
			type: 'pioneers',
			title: 'The Architects of the Air',
			people: [
				{
					name: 'Marty Cooper',
					years: '1928–',
					title: 'Inventor of the handheld cellular phone',
					org: 'Motorola',
					contribution:
						'Led the Motorola DynaTAC team and placed the **first public handheld cellular call** on 3 April 1973, from Sixth Avenue in Manhattan — to Joel Engel at AT&T Bell Labs, his direct rival. *"Joel, this is Marty. I\'m calling you from a cell phone, a real handheld portable cell phone."* The DynaTAC weighed 2.5 lb and gave 35 minutes of talk after 10 hours of charging. 2013 Charles Stark Draper Prize; the *father of the handheld cell phone*.'
				},
				{
					name: 'Andrew Viterbi',
					years: '1935–',
					title: 'Viterbi algorithm; Qualcomm co-founder',
					org: 'Qualcomm',
					contribution:
						'Invented the **Viterbi algorithm** in 1967 — used in every cellular phone, every disk-drive read channel, every GPS receiver, and every speech recognizer. *On advice of a lawyer, Viterbi did not patent the algorithm.* Co-founded Qualcomm in 1985; led the company through the CDMA-vs-TDMA wars that culminated in CDMA\'s mathematical foundation becoming WCDMA inside UMTS. **IEEE Medal of Honor 2010**.'
				},
				{
					name: 'Vic Hayes',
					years: '1941–',
					title: 'Father of Wi-Fi',
					org: 'NCR / Agere Systems',
					contribution:
						'Chaired the IEEE [[wifi|802.11]] working group from 1990 to 2002, shepherding the wireless LAN standard from concept to global adoption. Known as the "Father of [[wifi|Wi-Fi]]" for his persistence in driving consensus across a fractious vendor ecosystem.'
				},
				{
					name: 'Jaap Haartsen',
					years: '1963–',
					title: 'Inventor of Bluetooth',
					org: 'Ericsson Mobile (Lund) / Plantronics',
					contribution:
						"Dutch engineer who designed the [[bluetooth|Bluetooth]] radio at Ericsson Lund in 1994–97. Tasked with replacing the RS-232 cable to a mobile-phone headset; his frequency-hopping {{piconet|piconet}} design became the foundation of every [[bluetooth|Bluetooth]] chip ever made. European Inventor Award Lifetime Achievement finalist (2015)."
				},
				{
					name: 'Sven Mattisson',
					years: '1956–',
					title: 'Co-inventor of Bluetooth',
					org: 'Ericsson Research / Sony Mobile',
					contribution:
						'Swedish engineer who owned the analog RF and CMOS implementation work that paired with Jaap Haartsen\'s digital baseband. The IC-level decisions that made [[bluetooth|Bluetooth]] manufacturable at consumer price points.'
				},
				{
					name: 'Jim Kardach',
					years: '1958–',
					title: 'Named Bluetooth',
					org: 'Intel',
					contribution:
						'Proposed the name "[[bluetooth|Bluetooth]]" at a 1997 SIG meeting after Harald "Blåtand" Gormsson, the 10th-century Danish king who united Denmark and Norway — analogous to the SIG\'s goal of uniting Ericsson, IBM, {{intel|Intel}}, Nokia, and Toshiba behind one short-range wireless standard. The name was supposed to be a placeholder. It stuck.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1971,
					title: 'ALOHAnet — the conceptual ancestor',
					description:
						'Norman Abramson at the University of Hawaii builds ALOHAnet, the first wireless packet network — connecting islands via radio at 9.6 kbps. The "random access" idea (transmit whenever you have data; retransmit on collision) directly inspired [[ethernet|Ethernet]] CSMA/CD and, by extension, [[wifi|Wi-Fi]] {{csma-ca|CSMA/CA}}.'
				},
				{
					year: 1973,
					title: 'First handheld cellular call — Motorola DynaTAC',
					description:
						"Marty Cooper of Motorola dials Joel Engel at AT&T Bell Labs from Sixth Avenue, Manhattan: *\"Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone.\"* The DynaTAC weighs 2.5 lb and gets 35 minutes of talk after 10 hours of charging.",
					protocolId: 'cellular'
				},
				{
					year: 1991,
					title: 'GSM goes live in Finland',
					description:
						"Radiolinja launches the world's first commercial GSM network in Finland — the 2G digital standard that European carriers built and that became the foundation of [[cellular|cellular]] worldwide. The CDMA-vs-GSM standards war won't resolve until WCDMA inside UMTS in the early 2000s.",
					protocolId: 'cellular'
				},
				{
					year: 1994,
					title: 'Bluetooth invented at Ericsson Lund',
					description:
						'Jaap Haartsen and Sven Mattisson begin work on a 2.4 GHz frequency-hopping radio to replace the RS-232 cable between mobile phones and headsets. The technical foundation of every [[bluetooth|Bluetooth]] chip ever shipped.',
					protocolId: 'bluetooth'
				},
				{
					year: 1997,
					title: 'IEEE 802.11 — first Wi-Fi standard',
					description:
						'The original [[wifi|802.11]] standard ratifies 2 Mbps wireless LAN. Slow and expensive — but proves wireless networking is viable. The Wi-Fi Alliance forms two years later to certify interoperability.',
					protocolId: 'wifi'
				},
				{
					year: 1998,
					title: 'Bluetooth SIG founded',
					description:
						'Ericsson, IBM, {{intel|Intel}}, Nokia, and Toshiba sign the [[bluetooth|Bluetooth]] Special Interest Group charter in May 1998 to standardise short-range wireless. The first commercial product (a hands-free headset) ships at COMDEX 1999.',
					protocolId: 'bluetooth'
				},
				{
					year: 2009,
					title: 'Wi-Fi 4 (802.11n) — MIMO arrives',
					description:
						'802.11n introduces multiple-input multiple-output antennas, reaching 600 Mbps and making [[wifi|Wi-Fi]] competitive with wired connections for most consumer uses.',
					protocolId: 'wifi'
				},
				{
					year: 2010,
					title: 'Bluetooth 4.0 / BLE',
					description:
						'[[bluetooth|Bluetooth]] Core 4.0 (December 2009 → 2010 products) adds **Bluetooth Low Energy** (originally Nokia\'s *Wibree*). Different radio, different framing ({{l2cap|L2CAP}}/ATT/{{gatt|GATT}}) — wearables, beacons, AirTag-class trackers all sit on top of this layer.',
					protocolId: 'bluetooth'
				},
				{
					year: 2020,
					title: 'Wi-Fi 6 (802.11ax) — efficiency era',
					description:
						'{{ofdma|OFDMA}}, {{bss-coloring|BSS Coloring}}, {{target-wake-time|Target Wake Time}}. Not faster per-link — better at hundreds of devices sharing the airwaves. The architecture that finally fits stadium / convention-hall density.',
					protocolId: 'wifi'
				},
				{
					year: 2008,
					title: '4G LTE Release 8 frozen — OFDMA arrives',
					description:
						"{{3gpp|3GPP}} freezes Release 8 in December 2008. **Long Term Evolution** abandons WCDMA's spreading codes for an {{ofdma|OFDMA}} + SC-FDMA air interface — the clean-sheet radio design that scales linearly with {{spectrum|spectrum}} width. The architectural substrate every {{5g-nr|5G NR}} design choice is later evolved from.",
					protocolId: 'cellular'
				},
				{
					year: 2018,
					title: '5G NR Release 15 freeze',
					description:
						"{{3gpp|3GPP}} Release 15 — the **first {{5g-nr|5G NR}} specification** — is frozen on 14 June 2018. Service-based {{5g-core|5G Core}}, flexible numerology, {{mmwave|mmWave}} (FR2) support, network slicing. First commercial 5G networks light up in 2019; first 5G-Standalone (no LTE anchor) deployments arrive in 2020–2021.",
					protocolId: 'cellular'
				},
				{
					year: 2024,
					title: 'Bluetooth 6.0 — Channel Sounding',
					description:
						'Adopted 3 September 2024. Phase-based + RTT distance measurement on a new LE 2M 2BT PHY — centimetre-class accuracy up to ~150 m. The protocol-level answer to [[uwb|UWB]] for digital keys, anti-stalking, and finder applications.',
					protocolId: 'bluetooth'
				},
				{
					year: 2025,
					title: 'Wi-Fi 7 (802.11be) ratified',
					description:
						'IEEE 802.11be ratified 22 July 2025: 320-MHz channels in 6 GHz, 4096-QAM, Multi-Link Operation, preamble puncturing. [[wifi|Wi-Fi]] 8 (802.11bn / Ultra High Reliability) is in draft for 2028 — not faster, but 25% better at the 95th percentile.',
					protocolId: 'wifi'
				},
				{
					year: 2026,
					title: 'Frankfurt Airport — first Auracast deployment',
					description:
						'On 28 January 2026 Frankfurt Airport became the first airport to {{broadcast|broadcast}} all gate announcements over **{{auracast|Auracast}}** — LC3-based one-to-many {{le-audio|LE Audio}}. The first real-world replacement for analog hearing loops.',
					protocolId: 'bluetooth'
				},
				{
					year: 2025,
					title: 'T-Mobile + SpaceX Direct-to-Cell launches commercially',
					description:
						"The first commercial **satellite-to-cell** service. Standard band n25/n26 phones connect to low-Earth-orbit {{starlink|Starlink}} satellites for SMS and emergency. {{apple|Apple}}\'s Globalstar partnership and AT&T's AST SpaceMobile follow similar patterns. Reshapes \"coverage\" as a concept: \"no signal\" no longer means *no signal*.",
					protocolId: 'cellular'
				}
			]
		},
		{
			type: 'callout',
			title: 'Definitive members list (ranked by deployment priority)',
			text: `Three are already in this category, four more are queued for the next research wave:\n\n1. **Wi-Fi** ([[wifi|802.11]]) — universal local broadband. *Shipped.*\n2. **Bluetooth** (BR/EDR + BLE) — personal-area + IoT commissioning. *Shipped.*\n3. **Cellular** (4G LTE + {{5g-nr|5G NR}}) — wide-area, licensed, mobile. ~9B subs. *Shipped.*\n4. **[[nfc|NFC]]** (ISO/IEC 18092) — contactless payment + {{transit|transit}} cards. *Queued.*\n5. **[[uwb|UWB]]** (IEEE 802.15.4z) — sub-decimetre ranging, AirTag Precision Finding, {{ccc-digital-key|CCC Digital Key}}. *Queued.*\n6. **{{thread|Thread}}** ({{ieee-802-15-4|IEEE 802.15.4}} + 6LoWPAN) — the IPv6-native smart-home mesh under {{matter|Matter}}. *Coming with {{matter|Matter}}+{{thread|Thread}} bundle.*\n7. **LoRaWAN** — sub-GHz {{lpwan|LPWAN}} for metering, agriculture, smart cities; 125M+ devices deployed by end-2025. *Queued.*\n8. **Zigbee** (CSA) — the legacy mesh that still runs the Philips Hue installed base. *Queued.*\n\n**Sidebars** rather than full pages: NB-IoT / LTE-M (inside the Cellular page), Z-Wave (inside Zigbee/{{thread|Thread}}), GNSS / NMEA 0183 (positioning, not a network). **Callouts only**: DECT NR+, WirelessHART/ISA100.11a, {{broadcast|broadcast}} (AM/FM/DAB+/ATSC 3.0), passive {{rfid|RFID}}, IrDA.`
		},
		{
			type: 'callout',
			title: 'Spectrum at a glance',
			text: `Every wireless protocol picks a band, and the band picks the trade-offs:\n\n- **Sub-GHz (433/868/915 MHz)** — long range, low data rate. Unlicensed in most regions. *LoRaWAN, Sigfox, Z-Wave, NB-IoT in 700 MHz.*\n- **2.4 GHz ISM** — global, unlicensed, crowded. *Wi-Fi b/g/n/ax, Bluetooth BR/EDR + BLE, Zigbee, {{thread|Thread}}, microwave-oven leakage, baby monitors.* Modern combo chips ({{apple|Apple}} H-series, {{broadcom|Broadcom}}, Qualcomm) do time-division arbitration to keep them all alive on one antenna.\n- **5 GHz / 6 GHz** — fast, less crowded. *Wi-Fi a/n/ac/ax/be (6E and 7).* The 6 GHz expansion in the US (FCC 2020) and EU (CEPT 2021) added 1200 MHz of unlicensed {{spectrum|spectrum}} — the biggest single {{bandwidth|bandwidth}} grant in 20 years.\n- **24–52 GHz {{mmwave|mmWave}}** — line-of-sight, gigabits. *Wi-Fi WiGig, {{5g-nr|5G NR}} FR2.* Loses 20 dB on a wet leaf; deployed mostly in stadiums and dense urban hotspots.\n- **Licensed cellular (600 MHz – 3.7 GHz mid-band)** — predictable QoS, carrier-operated. *4G LTE FR1, {{5g-nr|5G NR}} FR1.* {{spectrum|Spectrum}} auctioned for billions.\n- **[[uwb|UWB]] (6–8.5 GHz)** — wide {{bandwidth|bandwidth}}, ultra-low power, sub-decimetre ranging. *{{fira|FiRa Consortium}}, IEEE 802.15.4z.*\n- **Satellite L/S/Ka band** — global coverage. *{{starlink|Starlink}} {{direct-to-cell|Direct-to-Cell}} on n25/n26, AST SpaceMobile, {{apple|Apple}} Globalstar Emergency SOS.*`
		},
		{
			type: 'narrative',
			title: 'Cutting the Cord — How Wi-Fi Works',
			text: `[[wifi|Wi-Fi]] brought [[ethernet|Ethernet]]'s shared-medium model to the airwaves, but radio introduced challenges that cables never had. The wireless medium is shared — you can't run a dedicated cable to each device — so [[wifi|Wi-Fi]] uses **{{csma-ca|CSMA/CA}}** (Collision *Avoidance*) instead of CSMA/CD: devices announce intent to transmit and wait for clear {{airtime|airtime}} rather than detecting collisions after the fact.

An [[wifi|802.11]] frame carries three or four MAC addresses (receiver, transmitter, destination, and sometimes source) compared to [[ethernet|Ethernet]]'s two. The {{access-point|access point}} bridges between worlds: it receives encrypted [[wifi|Wi-Fi]] frames from wireless clients, decrypts and strips the [[wifi|802.11]] header, then wraps the {{payload|payload}} in a standard [[ethernet|Ethernet]] frame for the wired network. This seamless bridging is why your laptop doesn't care whether it's plugged in or on [[wifi|Wi-Fi]] — [[ip|IP]] works the same either way.`
		},
		{
			type: 'diagram',
			title: 'Wired vs Wireless — Ethernet and Wi-Fi Frame Comparison',
			definition: `graph TD
  subgraph EthFrame["[[ethernet|Ethernet]] Frame (Layer 2 — Wired)"]
    E1["Dst MAC — 6 bytes"]
    E2["Src MAC — 6 bytes"]
    E3["EtherType — 2 bytes"]
    E4["{{payload|Payload}} — 46-1500 bytes"]
    E5["FCS — 4 bytes"]
    E1 --- E2 --- E3 --- E4 --- E5
  end
  subgraph WiFiFrame["[[wifi|802.11]] Frame (Layer 2 — Wireless)"]
    W1["Frame Control — 2 bytes"]
    W2["Duration — 2 bytes"]
    W3["Addr 1: Receiver — 6 bytes"]
    W4["Addr 2: Transmitter — 6 bytes"]
    W5["Addr 3: Destination — 6 bytes"]
    W6["Seq Control — 2 bytes"]
    W7["Encrypted {{payload|Payload}}"]
    W8["FCS — 4 bytes"]
    W1 --- W2 --- W3 --- W4 --- W5 --- W6 --- W7 --- W8
  end
  EthFrame ~~~ WiFiFrame`,
			caption:
				'[[ethernet|Ethernet]] frames use two MAC addresses and are sent in the clear. [[wifi|Wi-Fi]] frames need three or four addresses (receiver, transmitter, destination, and optionally source) and encrypt the {{payload|payload}} — reflecting the complexity of shared airwaves vs dedicated cables.'
		},
		{
			type: 'narrative',
			title: 'Bluetooth — Personal Area, Personal Power Budget',
			text: `Where [[wifi|Wi-Fi]] reaches across rooms at hundreds of megabits, [[bluetooth|Bluetooth]] is *personal*. Its design lives within 10 metres and microamps. **BR/EDR** ("Classic") hops 1,600 times per second across 79 × 1 MHz channels in the 2.4 GHz {{ism-band|ISM band}}, dodging interference from microwave ovens and Wi-Fi by design — the cost is a slightly chaotic radio that's hard to capture cleanly. It still carries the A2DP audio in every set of wireless headphones.

**Bluetooth Low Energy** is a completely different radio bolted onto the same brand. 40 × 2 MHz channels, three primary advertising channels (37/38/39) chosen specifically to avoid [[wifi|Wi-Fi]] channels 1/6/11, GFSK-only modulation, attribute-protocol {{gatt|GATT}} layered on {{l2cap|L2CAP}}. The 2010 redesign that makes AirPods last six hours, AirTags last a year, and hearing aids last a week per battery. The two stacks share no bits over the air — a dual-mode chip runs both side by side.

The future of [[bluetooth|Bluetooth]] in 2026 is **{{channel-sounding|Channel Sounding}}** (centimetre-class distance ranging for digital car keys and anti-stalking) and **{{auracast|Auracast}}** ({{broadcast|broadcast}} {{le-audio|LE Audio}} replacing analog hearing loops). Both shipped in the last 24 months. The 1994 cable-replacement project is now load-bearing for keyless entry, hearing accessibility, and the smart-home commissioning bootstrap that hands Wi-Fi credentials to every new IoT device.`
		},
		{
			type: 'callout',
			title: 'Why are Wi-Fi and Bluetooth on the same band?',
			text: 'Both [[wifi|Wi-Fi]] and [[bluetooth|Bluetooth]] live in the 2.4 GHz **ISM (Industrial, Scientific, Medical)** band — globally unlicensed, free for any device to transmit on. The crowding is real: a microwave oven leaks 2.4 GHz energy strong enough to mute nearby [[bluetooth|Bluetooth]] earbuds. Modern coexistence in combo chips (e.g. {{broadcom|Broadcom}}, Qualcomm, {{apple|Apple}} H1/H2) uses **time-division arbitration** at the silicon level — [[bluetooth|Bluetooth]] gives up {{airtime|airtime}} when [[wifi|Wi-Fi]] needs it, and vice versa. [[wifi|Wi-Fi]] 6E and 7 escape to 6 GHz; [[bluetooth|Bluetooth]] does not — it stays at 2.4 GHz where every consumer device with a battery already lives.'
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bluetooth.svg/250px-Bluetooth.svg.png',
			alt: 'The Bluetooth logo — a bind-rune combining Hagall (ᚼ) and Bjarkan (ᛒ)',
			caption:
				'The [[bluetooth|Bluetooth]] logo is a bind-rune combining **Hagall** (ᚼ) and **Bjarkan** (ᛒ) — the initials of *Harald Blåtand*, the 10th-century Danish king who united Denmark and Norway in Younger Futhark. Jim Kardach proposed the name as a placeholder during a 1997 SIG meeting. It was never supposed to ship.',
			credit: 'Image: Wikimedia Commons / Public Domain (Bluetooth SIG trademark)'
		}
	]
};
