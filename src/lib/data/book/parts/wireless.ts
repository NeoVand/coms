/**
 * Part IV — Wireless.
 *
 * Bits through the air — from ALOHAnet (1971) to Wi-Fi 8, Bluetooth 6.0,
 * 5G-Advanced, and Starlink Direct-to-Cell. Six member protocols cover
 * personal-area (Bluetooth, NFC, UWB, Zigbee), local (Wi-Fi), and wide-
 * area (Cellular) wireless. The pedagogical arc: a reader who's
 * understood TCP-on-Ethernet now needs to understand what TCP does on a
 * *lossy* link before tackling HTTP/3.
 *
 * Each chapter curates existing content — protocol pages, pioneer cards,
 * outage entries, simulations — into a continuous reading order. Slots
 * are how the book composes that existing graph; see book/types.ts.
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
				'Why wireless networking is a different problem from wired networking — the medium is shared, signals fade, and physics actively conspires against you.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Wireless is the only major networking problem with no clean solution: the medium is shared, every transmission reaches every receiver in range, and the laws of physics actively conspire against you.',
					attribution: 'Wireless category story'
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
