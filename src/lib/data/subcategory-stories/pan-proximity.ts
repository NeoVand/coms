import type { SubcategoryStory } from './types';

export const panProximityStory: SubcategoryStory = {
	subcategoryId: 'pan-proximity',
	tagline: 'Short-range wireless — four protocols for four different versions of "close"',
	sections: [
		{
			type: 'narrative',
			title: 'Different Definitions of "Nearby"',
			text: `Within ten meters of any office desk in 2025 there are probably a dozen wireless protocols in active use. Not Wi-Fi — different protocols, each optimized for a different mix of *range*, *power*, *bandwidth*, and *topology*. They're the Personal Area Network (PAN) and proximity family.\n\n- **[[bluetooth|Bluetooth]]** (1998–) covers ~10 meters at moderate power, up to ~3 Mbps on Classic BR/EDR and ~2 Mbps on the latest BLE. Originated as a cable replacement (named after a 10th-century Viking king who united warring tribes — the metaphor was uniting incompatible serial standards). Now the universal wireless for headphones, keyboards, fitness trackers, beacons, IoT.\n- **[[nfc|NFC]]** (2002–) covers ~4 *centimeters*. Almost-touching range, deliberately. Powers contactless payments (Apple Pay, Google Pay), transit cards, key fobs, tap-to-share, ID verification. The short range is the security feature.\n- **[[uwb|Ultra-Wideband]]** (UWB, mid-2000s commercial; revived 2019–) covers ~50 meters with *centimeter-accurate ranging*. Spread across a wide frequency band so it can be used alongside other protocols without interference. Apple AirTags, Samsung SmartTag+, BMW digital car keys, indoor positioning.\n- **[[zigbee|Zigbee]]** (2003–) covers tens of meters per hop, but builds **multi-hop mesh networks** so a single mesh can cover an entire building. Low power, low data rate, designed for battery-operated sensors and actuators. Powers smart-home devices (Philips Hue bulbs, IKEA Tradfri, Aqara sensors) and industrial automation.\n\nThese aren't alternatives. They're different points in a four-dimensional design space (range × bandwidth × power × topology). Your phone has hardware for all four. Your smart home runs three of them simultaneously. The fragmentation is a feature — no single protocol could serve all the use cases optimally.`
		},
		{
			type: 'pioneers',
			title: 'The Short-Range Wireless Architects',
			people: [
				{
					id: 'jaap-haartsen',
					name: 'Jaap Haartsen',
					years: '1963–',
					title: '"Father of Bluetooth"',
					org: 'Ericsson',
					contribution:
						'Designed [[bluetooth|Bluetooth]] at Ericsson in 1994. The original use case was eliminating the cable between a phone and a headset; the architecture (small piconets, frequency hopping for interference resilience, master/slave roles) scaled to almost any short-range use case. The protocol was named for the 10th-century Danish king Harald Bluetooth, who united Scandinavian tribes — the metaphor was uniting incompatible mobile-device standards. Haartsen and his Ericsson team partnered with IBM, Intel, Nokia, and Toshiba to form the Bluetooth SIG in 1998.'
				},
				{
					id: 'charles-walton',
					name: 'Charles Walton',
					years: '1921–2011',
					title: '"Father of RFID"',
					org: 'Independent / Proximity Devices',
					contribution:
						"Patented (1973) the first portable RFID system — a passive, battery-less tag that could be read by a nearby reader. The patent expired in 1990; the technology underpinned everything from livestock tracking to building access control to (eventually) [[nfc|NFC]] payment. NFC is structurally a descendant of Walton\\'s RFID — same near-field magnetic coupling, same passive-tag option, with bidirectional data exchange added on top. Walton reportedly earned about $3 million in license fees from the patent."
				},
				{
					id: 'larry-fullerton',
					name: 'Larry Fullerton',
					years: '–',
					title: 'UWB Pioneer',
					org: 'Time Domain / Independent',
					contribution:
						"Founded Time Domain in 1987 and led much of the commercial development of [[uwb|ultra-wideband]] radio. Fullerton\\'s research showed that short, low-power pulses spread across a wide frequency band could carry data and measure precise distances without interfering with narrowband transmissions. The FCC approved commercial UWB use in 2002 based largely on this work; UWB then faded for a decade before being revived by Apple in 2019 for AirTag-class precision-finding applications."
				},
				{
					id: 'bob-heile',
					name: 'Bob Heile',
					years: '–',
					title: 'Zigbee Chair',
					org: 'Wi-SUN Alliance / Zigbee Alliance / CSA',
					contribution:
						"Chaired the Zigbee Alliance (now Connectivity Standards Alliance) through its formative years; co-founded the Wi-SUN Alliance for outdoor mesh networks. [[zigbee|Zigbee]] solved a problem the IETF wouldn\\'t for years: how to do low-power *mesh* networking on tiny batteries. Battery-powered nodes can\\'t maintain Wi-Fi sessions; Bluetooth wasn\\'t mesh-aware. Zigbee built routing into the protocol stack so messages could hop through many devices without any one device burning much battery."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1973,
					title: 'RFID First Patent',
					description:
						'[[pioneer:charles-walton|Walton]] patents the first portable RFID system — passive tags read by nearby readers. The basis for NFC three decades later.'
				},
				{
					year: 1994,
					title: 'Bluetooth Conceived at Ericsson',
					description:
						'[[pioneer:jaap-haartsen|Haartsen]] starts [[bluetooth|Bluetooth]] at Ericsson as a cable-replacement technology for phones and accessories.'
				},
				{
					year: 1998,
					title: 'Bluetooth SIG Founded',
					description:
						'Ericsson, IBM, Intel, Nokia, Toshiba form the Bluetooth Special Interest Group. Bluetooth 1.0 ships in 1999.'
				},
				{
					year: 2002,
					title: 'FCC Approves Commercial UWB',
					description:
						'Federal Communications Commission opens unlicensed [[uwb|ultra-wideband]] operation in the 3.1–10.6 GHz range. Time Domain, Freescale, Intel all start commercial UWB development.'
				},
				{
					year: 2004,
					title: 'NFC Forum Founded',
					description:
						'Nokia, Philips, and Sony form the NFC Forum to standardize what would become contactless payment, transit, and proximity-pairing on phones.'
				},
				{
					year: 2002,
					title: 'Zigbee Alliance Formed',
					description:
						'[[zigbee|Zigbee]] launches as a low-power mesh networking standard for sensors and actuators. ZigBee 1.0 ships in 2004.'
				},
				{
					year: 2004,
					title: 'NFC RFID Standards (ISO/IEC 18092)',
					description:
						"NFC standardized at ISO. Supports passive tags (like Walton's RFID), reader/writer mode, and peer-to-peer mode."
				},
				{
					year: 2010,
					title: 'Bluetooth 4.0 — BLE',
					description:
						'Bluetooth Low Energy (BLE) ships — a fundamental redesign for sub-milliwatt power, suitable for coin-cell batteries lasting years. The breakthrough that makes "the IoT" practical for sensor-class devices.'
				},
				{
					year: 2014,
					title: 'Apple Pay Launches',
					description:
						'Apple Pay uses NFC for in-store contactless payment. Drives mainstream consumer awareness of NFC; within two years, every major Android phone has matching support.'
				},
				{
					year: 2017,
					title: 'Bluetooth Mesh',
					description:
						'Bluetooth SIG adds mesh networking, competing directly with Zigbee for smart-home and industrial use cases.'
				},
				{
					year: 2019,
					title: 'Apple iPhone 11 — U1 Chip / UWB',
					description:
						'Apple ships UWB in iPhone 11 with the U1 chip. The first mainstream consumer device with precision-ranging UWB. AirDrop becomes direction-aware; AirTags ship in 2021 using UWB for precise finding.'
				},
				{
					year: 2020,
					title: 'BMW Digital Key Plus — UWB Car Access',
					description:
						"BMW launches Digital Key Plus using UWB. Your iPhone is now a car key with precise proximity awareness (the car detects when you walk up to it from outside, vs sit in the driver's seat)."
				},
				{
					year: 2022,
					title: 'Matter Launches (Thread + Wi-Fi)',
					description:
						"Apple, Google, Amazon, and Samsung's unified smart-home protocol uses Thread (an IPv6 mesh, similar layer to Zigbee) and Wi-Fi. Zigbee continues to coexist; new devices increasingly bridge to Matter."
				},
				{
					year: 2024,
					title: 'Bluetooth 6.0 — Channel Sounding',
					description:
						'Bluetooth gains UWB-like precision ranging via Channel Sounding. The boundary between BT and UWB blurs for proximity use cases.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'Four Short-Range Wireless Protocols',
			axes: ['Range', 'Throughput', 'Power', 'Topology', 'Canonical use'],
			rows: [
				{
					label: '[[bluetooth|Bluetooth]]',
					values: [
						'~10 m (Class 2); ~100 m (Class 1)',
						'~2 Mbps (BLE) / ~3 Mbps (Classic BR/EDR)',
						'BLE: μW–mW; classic: tens of mW',
						'Star (piconet, master + ≤7 slaves); now mesh too',
						'Headphones, keyboards, fitness trackers, beacons'
					]
				},
				{
					label: '[[nfc|NFC]]',
					values: [
						'~4 cm',
						'~424 Kbps',
						"Passive tag: zero (powered by reader's field)",
						'Reader + passive tag, or peer-to-peer',
						'Contactless payment, transit, key cards, tap-to-share'
					]
				},
				{
					label: '[[uwb|UWB]]',
					values: [
						'~50 m line of sight',
						'~110 Mbps (rarely used at full rate)',
						'Tens of mW per measurement, idle off',
						'Anchor + tag, or peer-to-peer',
						'Precise indoor/asset location, AirTag-class finding, secure car key'
					]
				},
				{
					label: '[[zigbee|Zigbee]]',
					values: [
						'~10–30 m per hop, building-scale via mesh',
						'~250 Kbps',
						'μW–mW (designed for coin-cell years)',
						'Mesh — every router-class node forwards for others',
						'Smart-home (bulbs, sensors, switches), industrial automation'
					]
				}
			],
			note: 'These four genuinely complement each other. A smart home in 2025 commonly runs Zigbee (sensors and bulbs), Bluetooth (phone-to-device pairing, key fobs), Wi-Fi (cameras, speakers, hubs), and possibly NFC (tap-to-pair, key fobs) and UWB (precise unlocking) all simultaneously.'
		},
		{
			type: 'animated-sequence',
			title: 'BLE Advertising and Connection',
			definition: `sequenceDiagram
    participant P as Peripheral
    participant C as Central
    Note over P,C: Phase 1 — Advertising, peripheral broadcasts identity
    P-->>P: every 100ms-1s, ADV_IND on channels 37, 38, 39
    Note over C: scanning on the same channels
    P-->>C: ADV_IND with UUID, name, RSSI
    C->>P: SCAN_REQ optional
    P-->>C: SCAN_RSP with extra data
    Note over P,C: Phase 2 — Connection request
    C->>P: CONNECT_REQ with interval, latency, timeout
    Note over P,C: Phase 3 — Data exchange on dedicated channel
    C->>P: empty PDU to start connection
    P-->>C: data PDU, e.g. heart rate notification
    C->>P: data PDU, e.g. read battery characteristic
    P-->>C: read response, 87 percent
    Note over P,C: Phase 4 — Connection sleep until next event
    Note over C: at next interval, both wake briefly, exchange, sleep
    Note over P,C: Average power, tens of μW — coin cell lasts months or years`,
			caption:
				"[[bluetooth|BLE]]'s advertising-then-connect dance is what lets sensor-class devices run on coin cells for years. The peripheral broadcasts a small ADV packet at long intervals; the central scans and connects on demand. Once connected, both sides wake briefly per connection interval and sleep otherwise. Average current is microamps.",
			steps: {
				0: '**Phase 1 — Advertising.** A BLE peripheral (smartwatch, sensor, beacon) advertises its presence by broadcasting on three known channels. The central (your phone) scans those channels passively.',
				1: "Peripheral wakes every 100ms–1s and **broadcasts an ADV_IND packet** on channels 37, 38, and 39 (BLE's three advertising channels). When sleeping, it draws microamps.",
				2: '**Central scans** the same three channels. Most of the time central is also off; it wakes to scan briefly. Both sides spend almost no time on.',
				3: "Central catches an ADV_IND. The packet carries a UUID identifying the device or service, the peripheral's name, and its signal strength (RSSI).",
				4: "Central may optionally send a **SCAN_REQ** to ask for more advertising data the peripheral didn't fit in the initial ADV.",
				5: 'Peripheral replies with **SCAN_RSP** carrying additional metadata.',
				6: '**Phase 2 — Connection request.** Central decides to connect.',
				7: 'Central sends **CONNECT_REQ** with connection parameters: how often the two will exchange data (interval), how many intervals the peripheral can skip if it has nothing to say (latency), how long without contact before the connection is declared dead (supervision timeout).',
				8: '**Phase 3 — Data exchange.** The two now hop together across the remaining 37 data channels, encrypted if pairing was done.',
				9: 'Central sends an **empty PDU** to "start the conversation" — the very first connection event after CONNECT_REQ.',
				10: 'Peripheral sends **a data PDU** — e.g. a heart-rate notification from a GATT characteristic.',
				11: 'Central sends a **data PDU** — e.g. a read request for the battery level characteristic.',
				12: 'Peripheral responds with the **read value: 87%**.',
				13: '**Phase 4 — Sleep.** Both sides go back to sleep until the next connection interval.',
				14: '**Wake, exchange, sleep.** Every interval (configurable, often 50ms–4s), both sides wake briefly, exchange any pending data, and sleep again. Average current is microamps even at high data rates.',
				15: '**The result.** A heart-rate sensor that streams notifications every second can run on a CR2032 coin cell for years. That power profile is what makes "smart" everything possible.'
			}
		},
		{
			type: 'callout',
			title: 'Why Short Range Is a Feature',
			text: `Engineering instinct says "longer range is always better." For short-range wireless, that instinct is wrong. Short range is a *feature*, not a limitation.\n\n**[[nfc|NFC]]'s 4 cm is a security primitive.** Your phone can't be NFC-eavesdropped from across the room. To skim your contactless card, an attacker must physically touch (or come within a few cm of) you. Compare this to RFID-equipped passport designs, which were *deliberately* given short range so they couldn't be remotely scanned. Range is part of the threat model.\n\n**[[zigbee|Zigbee]]'s short per-hop range enables mesh resilience.** A bulb 100 meters from the controller can't hear it directly — but six bulbs in between can each hop the message. If one bulb fails, the mesh routes around it. A long-range broadcast protocol would have one giant collision domain; the short-range mesh is built around it.\n\n**[[uwb|UWB]]'s wide bandwidth at low power gives centimeter ranging.** Most radios measure distance crudely (signal strength, basically); UWB pulses are so short that the propagation time can be measured directly. Time-of-flight measurement at GHz bandwidths gives ~10 cm precision. AirTags would be much less useful if they could only tell you "somewhere in your house"; the precise-finding mode lets your iPhone show you a direction arrow.\n\n**[[bluetooth|Bluetooth]]'s 10 meter range matches the form factor.** Your earbuds need to talk to your phone in your pocket, not your phone two rooms away. Higher power would waste battery; longer range would expose more devices to interference.\n\nEach of these protocols is *deliberately* short range because that's what their use case demands. The "long range is better" instinct comes from cellular and Wi-Fi, where coverage is the value proposition. For proximity wireless, *limited* coverage *is* the value proposition.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[bluetooth|Bluetooth]]'s failure mode is **pairing UX**. The classic Bluetooth pairing flow (long press the button, find on the phone, enter PIN, accept) is consistently rated one of the worst UX moments in consumer electronics. Apple's Magic Pairing (a proprietary extension) made AirPods drastically better than generic BT pairing. The BT SIG's answer — Cross-Transport Key Derivation, Fast Pair — addresses some of the worst, but generic Bluetooth pairing is still a frequent support call. Security-wise, multiple specs (KNOB, BIAS, BLUFFS, BLESA) have shown serial weaknesses in BT pairing crypto; the SIG patches and the cycle continues.\n\n[[nfc|NFC]]'s failure mode is **the misread**. NFC requires near-touching alignment between reader antenna and tag antenna. Misaligned passes — bag tap-to-pay on an awkwardly-angled reader — fail silently. Modern phones include haptic feedback for successful taps; older systems just left you wondering if it worked. NFC has no security failure mode worth mentioning — the 4 cm range is the defense.\n\n[[uwb|UWB]]'s failure mode is **multipath**. Indoor environments reflect radio waves off walls; UWB's precision ranging can be confused by which path it measured. Modern UWB chipsets (Apple U1, Qorvo, NXP) include channel impulse response analysis to handle multipath, but "first-arrival" detection in cluttered environments is still hard.\n\n[[zigbee|Zigbee]]'s failure mode is **interoperability**. The Zigbee spec is large; the application-layer profiles (Zigbee Home Automation, Zigbee Light Link, Zigbee 3.0) overlap and historically didn't interoperate. A Hue bulb didn't talk to a Lightify bulb didn't talk to a Wink hub. The Zigbee Alliance's answer in 2017 — Zigbee 3.0 — converged the profiles, but the install base is fragmented. Matter (2022, on top of Thread, not Zigbee) is an explicit answer to the interop mess — same goal, fresh start, better governance.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **Bluetooth LE Audio + Auracast** broadcasts audio to many earbud-equipped listeners at once. Use cases: airport announcements, gym TVs, audio assistive listening in theaters. Slowly rolling out as new hardware ships.\n- **Bluetooth 6.0 Channel Sounding** brings precision ranging to BT, blurring the line with [[uwb|UWB]]. Expect "find my" features that work without a dedicated UWB chip in future devices.\n- **UWB everywhere** — UWB chips are spreading from flagship phones to mid-tier, from cars to smart-home hubs. The next 3–5 years will normalize centimeter-accurate ranging as a phone primitive.\n- **Matter / Thread continued growth** — most new smart-home devices ship Matter-over-Thread. Zigbee's install base is huge but the new growth is Matter. Many bridges (Hue, SmartThings, Aqara) translate between Zigbee and Matter.\n- **NFC for digital identity** — driver's licenses, passports, and government IDs are increasingly carried as NFC-readable credentials on phones. Apple Wallet IDs in US states; the EU's eIDAS 2.0 framework expects NFC-based national ID by 2026.\n- **The interesting frontier**: precision proximity. Knowing not just "the user is nearby" but "the user is sitting in the driver's seat" or "the user is approaching the front door from outside" is the next-generation interaction primitive. UWB plus BT plus mature multipath handling is what enables it.`
		}
	]
};
