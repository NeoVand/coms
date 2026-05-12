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

Two technologies broke through. **[[wifi|Wi-Fi]]** (IEEE 802.11, 1997) took [[ethernet|Ethernet]]'s shared-medium model — CSMA/CD on coax — and adapted it for radio: CSMA/CA (Collision *Avoidance*, because radios can't detect collisions while transmitting), RTS/CTS handshakes for hidden terminals, encryption built in because the air can't be physically secured. Today it carries most consumer traffic.

**[[bluetooth|Bluetooth]]** (1999) took the *opposite* approach: tiny piconets, frequency-hopping 1,600 times per second to dodge interference, master-slave (now Central/Peripheral) topology, microamp-scale power budgets. Different goals, different design — and together they cover every wireless surface from streaming 4K video to a hearing aid sipping power from a coin cell.`
		},
		{
			type: 'pioneers',
			title: 'The Architects of the Air',
			people: [
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
						"Dutch engineer who designed the [[bluetooth|Bluetooth]] radio at Ericsson Lund in 1994–97. Tasked with replacing the RS-232 cable to a mobile-phone headset; his frequency-hopping piconet design became the foundation of every [[bluetooth|Bluetooth]] chip ever made. European Inventor Award Lifetime Achievement finalist (2015)."
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
						'Proposed the name "[[bluetooth|Bluetooth]]" at a 1997 SIG meeting after Harald "Blåtand" Gormsson, the 10th-century Danish king who united Denmark and Norway — analogous to the SIG\'s goal of uniting Ericsson, IBM, Intel, Nokia, and Toshiba behind one short-range wireless standard. The name was supposed to be a placeholder. It stuck.'
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
						'Norman Abramson at the University of Hawaii builds ALOHAnet, the first wireless packet network — connecting islands via radio at 9.6 kbps. The "random access" idea (transmit whenever you have data; retransmit on collision) directly inspired [[ethernet|Ethernet]] CSMA/CD and, by extension, [[wifi|Wi-Fi]] CSMA/CA.'
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
						'Ericsson, IBM, Intel, Nokia, and Toshiba sign the [[bluetooth|Bluetooth]] Special Interest Group charter in May 1998 to standardise short-range wireless. The first commercial product (a hands-free headset) ships at COMDEX 1999.',
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
						'[[bluetooth|Bluetooth]] Core 4.0 (December 2009 → 2010 products) adds **Bluetooth Low Energy** (originally Nokia\'s *Wibree*). Different radio, different framing (L2CAP/ATT/GATT) — wearables, beacons, AirTag-class trackers all sit on top of this layer.',
					protocolId: 'bluetooth'
				},
				{
					year: 2020,
					title: 'Wi-Fi 6 (802.11ax) — efficiency era',
					description:
						'OFDMA, BSS Coloring, Target Wake Time. Not faster per-link — better at hundreds of devices sharing the airwaves. The architecture that finally fits stadium / convention-hall density.',
					protocolId: 'wifi'
				},
				{
					year: 2024,
					title: 'Bluetooth 6.0 — Channel Sounding',
					description:
						'Adopted 3 September 2024. Phase-based + RTT distance measurement on a new LE 2M 2BT PHY — centimetre-class accuracy up to ~150 m. The protocol-level answer to UWB for digital keys, anti-stalking, and finder applications.',
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
						'On 28 January 2026 Frankfurt Airport became the first airport to broadcast all gate announcements over **Auracast** — LC3-based one-to-many LE Audio. The first real-world replacement for analog hearing loops.',
					protocolId: 'bluetooth'
				}
			]
		},
		{
			type: 'narrative',
			title: 'Cutting the Cord — How Wi-Fi Works',
			text: `[[wifi|Wi-Fi]] brought [[ethernet|Ethernet]]'s shared-medium model to the airwaves, but radio introduced challenges that cables never had. The wireless medium is shared — you can't run a dedicated cable to each device — so [[wifi|Wi-Fi]] uses **CSMA/CA** (Collision *Avoidance*) instead of CSMA/CD: devices announce intent to transmit and wait for clear airtime rather than detecting collisions after the fact.

An [[wifi|802.11]] frame carries three or four MAC addresses (receiver, transmitter, destination, and sometimes source) compared to [[ethernet|Ethernet]]'s two. The {{access-point|access point}} bridges between worlds: it receives encrypted [[wifi|Wi-Fi]] frames from wireless clients, decrypts and strips the [[wifi|802.11]] header, then wraps the {{payload|payload}} in a standard [[ethernet|Ethernet]] frame for the wired network. This seamless bridging is why your laptop doesn't care whether it's plugged in or on [[wifi|Wi-Fi]] — [[ip|IP]] works the same either way.`
		},
		{
			type: 'diagram',
			title: 'Wired vs Wireless — Ethernet and Wi-Fi Frame Comparison',
			definition: `graph TD
  subgraph EthFrame["Ethernet Frame (Layer 2 — Wired)"]
    E1["Dst MAC — 6 bytes"]
    E2["Src MAC — 6 bytes"]
    E3["EtherType — 2 bytes"]
    E4["Payload — 46-1500 bytes"]
    E5["FCS — 4 bytes"]
    E1 --- E2 --- E3 --- E4 --- E5
  end
  subgraph WiFiFrame["802.11 Frame (Layer 2 — Wireless)"]
    W1["Frame Control — 2 bytes"]
    W2["Duration — 2 bytes"]
    W3["Addr 1: Receiver — 6 bytes"]
    W4["Addr 2: Transmitter — 6 bytes"]
    W5["Addr 3: Destination — 6 bytes"]
    W6["Seq Control — 2 bytes"]
    W7["Encrypted Payload"]
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
			text: `Where [[wifi|Wi-Fi]] reaches across rooms at hundreds of megabits, [[bluetooth|Bluetooth]] is *personal*. Its design lives within 10 metres and microamps. **BR/EDR** ("Classic") hops 1,600 times per second across 79 × 1 MHz channels in the 2.4 GHz ISM band, dodging interference from microwave ovens and Wi-Fi by design — the cost is a slightly chaotic radio that's hard to capture cleanly. It still carries the A2DP audio in every set of wireless headphones.

**Bluetooth Low Energy** is a completely different radio bolted onto the same brand. 40 × 2 MHz channels, three primary advertising channels (37/38/39) chosen specifically to avoid [[wifi|Wi-Fi]] channels 1/6/11, GFSK-only modulation, attribute-protocol GATT layered on L2CAP. The 2010 redesign that makes AirPods last six hours, AirTags last a year, and hearing aids last a week per battery. The two stacks share no bits over the air — a dual-mode chip runs both side by side.

The future of [[bluetooth|Bluetooth]] in 2026 is **Channel Sounding** (centimetre-class distance ranging for digital car keys and anti-stalking) and **Auracast** (broadcast LE Audio replacing analog hearing loops). Both shipped in the last 24 months. The 1994 cable-replacement project is now load-bearing for keyless entry, hearing accessibility, and the smart-home commissioning bootstrap that hands Wi-Fi credentials to every new IoT device.`
		},
		{
			type: 'callout',
			title: 'Why are Wi-Fi and Bluetooth on the same band?',
			text: 'Both [[wifi|Wi-Fi]] and [[bluetooth|Bluetooth]] live in the 2.4 GHz **ISM (Industrial, Scientific, Medical)** band — globally unlicensed, free for any device to transmit on. The crowding is real: a microwave oven leaks 2.4 GHz energy strong enough to mute nearby [[bluetooth|Bluetooth]] earbuds. Modern coexistence in combo chips (e.g. Broadcom, Qualcomm, Apple H1/H2) uses **time-division arbitration** at the silicon level — [[bluetooth|Bluetooth]] gives up airtime when [[wifi|Wi-Fi]] needs it, and vice versa. [[wifi|Wi-Fi]] 6E and 7 escape to 6 GHz; [[bluetooth|Bluetooth]] does not — it stays at 2.4 GHz where every consumer device with a battery already lives.'
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
