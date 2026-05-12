import type { Protocol } from '../types';

export const bluetooth: Protocol = {
	id: 'bluetooth',
	name: 'Bluetooth',
	abbreviation: 'BT',
	categoryId: 'wireless',
	port: undefined,
	year: 1999,
	rfc: 'Bluetooth Core Spec 6.0',
	oneLiner:
		'Short-range 2.4 GHz wireless with two protocol stacks: Classic BR/EDR for streaming audio, and BLE for low-power sensors, trackers, hearing aids, and IoT commissioning.',
	overview: `[[bluetooth|Bluetooth]] is the most ubiquitous short-range wireless protocol on Earth — roughly 4.7 billion ICs shipped per year. It started as a 1994 Ericsson project in Lund, Sweden to replace the RS-232 cable to a mobile-phone headset; [[pioneer:jaap-haartsen|Jaap Haartsen]] and [[pioneer:sven-mattisson|Sven Mattisson]] did the original radio design, [[pioneer:jim-kardach|Jim Kardach]] at Intel proposed the name (after Harald "Blåtand" Gormsson, the 10th-century Danish king who united Denmark and Norway), and the [[bluetooth|Bluetooth]] Special Interest Group was founded in May 1998 by Ericsson, IBM, Intel, Nokia, and Toshiba. The first commercial product was a hands-free headset at COMDEX 1999; the first phone was the Ericsson T39 in 2001.

[[bluetooth|Bluetooth]] in 2026 is *two protocols braided into one brand*. **BR/EDR ("Classic")** is the 1999 frequency-hopping master/slave wire-replacement system — 79 × 1 MHz channels, 1,600 hops per second, GFSK + DPSK modulation. It still carries A2DP audio, HFP voice, HID (every wireless keyboard and mouse), and RFCOMM. **BLE (Bluetooth Low Energy)** was added in Core 4.0 (December 2009), derived from Nokia's *Wibree* design. Different radio (40 × 2 MHz channels), different link layer, different framing (L2CAP), different security (SMP), different application protocol (GATT). Both share the 2.4 GHz ISM band and a SIG, but they share **no bits over the air**.

The single biggest change in the last 24 months is **Bluetooth 6.0** (adopted 3 September 2024), which introduced **Channel Sounding** — phase-based + round-trip-time ranging delivering centimetre-class accuracy and explicitly targeting UWB's secure-access and digital-key niche. Simultaneously, **Auracast** (LC3-based broadcast LE Audio) went from spec to real deployments — Frankfurt Airport became the first airport to broadcast all gate announcements over Auracast on 28 January 2026. The Apple-Google **DULT** anti-stalking standard moved into IETF working-group drafts in 2024–2026. [[wifi|Wi-Fi]] is the protocol you stream from; [[bluetooth|Bluetooth]] is the protocol you carry with you.`,
	howItWorks: [
		{
			title: 'Frequency-hopping in the 2.4 GHz ISM band',
			description:
				"Both BR/EDR (79 × 1 MHz channels) and BLE (40 × 2 MHz channels) use the globally unlicensed 2.402–2.480 GHz ISM band. BR/EDR uses a pseudo-random frequency-hopping pattern, hopping 1,600 times per second, keyed off the piconet master's clock and BD_ADDR. BLE uses three primary advertising channels (37/38/39, carefully placed to avoid [[wifi|Wi-Fi]] channels 1/6/11) and 37 data channels (0–36) that hop once per connection event."
		},
		{
			title: 'Advertising and discovery (BLE)',
			description:
				'A BLE Peripheral broadcasts ADV_IND packets on ch 37/38/39 every 20 ms to 10.24 s. A Central scans those channels. A connection begins with the Central sending CONNECT_IND, which contains the Access Address, CRC seed, hop pattern, and connection-interval parameters (7.5 ms–4 s).'
		},
		{
			title: 'L2CAP framing and ATT/GATT (BLE)',
			description:
				'Inside a connection, BLE devices exchange L2CAP packets. The Attribute Protocol (ATT) lives on L2CAP CID 0x0004 and provides read/write/notify/indicate operations against 16-bit handles. GATT layers semantic structure on top — services, characteristics, descriptors — with 16-bit (SIG-assigned) or 128-bit (vendor) UUIDs. Default ATT MTU is 23 (a known trap — 20 bytes of payload per Notify); modern devices negotiate up to 247 or 517.'
		},
		{
			title: 'Pairing and encryption (SMP)',
			description:
				'The Security Manager Protocol (SMP, L2CAP CID 0x0006) performs pairing: Just Works, Passkey Entry, Numeric Comparison, or Out-of-Band. LE Secure Connections (4.2+) uses ECDH on Curve P-256 to derive a Long-Term Key (LTK); the link is then encrypted with AES-CCM at the Link Layer. Bonding stores the LTK for future reconnections; the address resolution scheme (RPA — Resolvable Private Address) prevents long-term tracking.'
		},
		{
			title: 'LE Audio and Auracast (5.2+)',
			description:
				'LE Audio runs over **Isochronous Channels** — Connected Isochronous Streams (CIS) for unicast earbuds/hearing aids, and Broadcast Isochronous Streams (BIS) for one-to-many public broadcast. **LC3** is the mandatory codec (replacing SBC and saving ~50% battery vs A2DP). **Auracast** is the SIG brand for BIS-based public-venue broadcast — airports, theatres, gyms, hearing-loop replacement.'
		},
		{
			title: 'Channel Sounding (6.0+)',
			description:
				'Two devices in a normal LL connection schedule **Channel Sounding** events on a new LE 2M 2BT PHY. They measure both signal **phase** across multiple frequencies (Phase-Based Ranging) and **round-trip time** of timestamped packets; the combination gives centimetre-class distance accuracy up to ~150 m. The intended use: digital car keys, smart locks, and anti-stalking tags — all of which need to know if the peer is actually *here* and not relayed via radio.'
		}
	],
	useCases: [
		'Wireless audio: headsets, earbuds (AirPods), car infotainment (A2DP / HFP / LE Audio)',
		'Wearables and fitness sensors: HRM straps, step counters, smartwatches',
		'Item finders: Apple AirTag, Samsung SmartTag, Tile (Find My / Find My Device networks)',
		'Commissioning bootstrap for Matter / Thread / [[wifi|Wi-Fi]] IoT devices',
		'Hearing aids and assistive listening (LE Audio + Auracast)',
		'Smart locks, digital car keys (Tesla, BMW, CCC Digital Key)',
		'Retail beacons (iBeacon / Eddystone) and Electronic Shelf Labels (PAwR)'
	],
	codeExample: {
		language: 'javascript',
		code: `// Web Bluetooth — request a heart-rate sensor and stream measurements.
// Note: Web Bluetooth is Chromium/Edge/Opera only as of 2026 (no Safari, no Firefox).
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['heart_rate'] }],
  optionalServices: ['battery_service']
});

const server = await device.gatt.connect();
const hrService = await server.getPrimaryService('heart_rate');
const hrChar = await hrService.getCharacteristic('heart_rate_measurement');

await hrChar.startNotifications();
hrChar.addEventListener('characteristicvaluechanged', (event) => {
  const value = event.target.value;            // DataView
  const flags = value.getUint8(0);
  const hr = flags & 0x01
    ? value.getUint16(1, /*little-endian*/ true)
    : value.getUint8(1);
  console.log(\`HR: \${hr} bpm\`);
});

device.addEventListener('gattserverdisconnected', () =>
  console.log('disconnected — exiting low-power mode'));`,
		caption:
			"A Web Bluetooth client subscribing to a Heart Rate Profile sensor. The handshake — advertising, connection, pairing, MTU exchange, characteristic discovery — happens inside the platform's BLE stack; the page sees only the GATT abstraction.",
		alternatives: [
			{
				language: 'python',
				code: `# bleak — the canonical Python BLE library, cross-platform (CoreBluetooth on
# macOS, BlueZ on Linux, WinRT on Windows). The Wibree → BLE design is so clean
# that the same code runs on every modern OS without a kernel driver.
import asyncio
from bleak import BleakClient, BleakScanner

HR_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb'
HR_MEAS    = '00002a37-0000-1000-8000-00805f9b34fb'

async def main():
    print('Scanning for BLE heart-rate sensors...')
    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: HR_SERVICE in (ad.service_uuids or []),
        timeout=10.0,
    )
    if not device:
        return
    print(f'Connecting to {device.name} ({device.address})')

    async with BleakClient(device) as client:
        def on_notify(_, data: bytearray):
            flags = data[0]
            hr = int.from_bytes(data[1:3], 'little') if flags & 0x01 else data[1]
            print(f'HR: {hr} bpm')
        await client.start_notify(HR_MEAS, on_notify)
        await asyncio.sleep(30)

asyncio.run(main())`
			},
			{
				language: 'cli',
				code: `# BlueZ — the Linux Bluetooth stack. \`bluetoothctl\` is the interactive CLI.
bluetoothctl
> scan on
[NEW] Device 24:0A:C4:XX:XX:XX HR Sensor
> pair 24:0A:C4:XX:XX:XX
> trust 24:0A:C4:XX:XX:XX
> connect 24:0A:C4:XX:XX:XX
> menu gatt
> list-attributes 24:0A:C4:XX:XX:XX
> select-attribute /org/bluez/hci0/dev_24_0A_C4_XX_XX_XX/service000d/char000e
> notify on

# gatttool — older but useful for scripting.
gatttool -b 24:0A:C4:XX:XX:XX --char-read --handle=0x000e

# Wireshark capture filters for BLE traffic from an nRF Sniffer:
#   btatt                       — all ATT operations
#   btatt.opcode == 0x1B        — Handle Value Notification
#   btsmp                       — Security Manager pairing
#   btle.advertising_address == ff:ee:dd:cc:bb:aa
#   bthci_cmd.opcode.ogf == 0x08  — LE controller commands`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'BLE Link Layer PDU (uncoded, LE 1M)',
						code: `0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+---------------+---------------+--------------------------------+
|   Preamble    |          Access Address (32 bits)              |
|    1 byte     |                                                |
+---------------+---+-----------+--------------------------------+
| LL Header  PDU-len|                  Payload (0..255 bytes)    |
|  (2 bytes)        |                                            |
+-------------------+--------------------------------------------+
|                          CRC (24 bits)                         |
+----------------------------------------------------------------+

Preamble:  0xAA on LE 1M (alternating bits to recover the clock)
Access Address:  0x8E89BED6 for ADV_*; random per-connection otherwise
LL Header.LLID: data, start frag, continuation frag, control PDU
LL Header.NESN/SN: 1-bit sequence/ack — full ARQ in 2 bits.
CRC: x^24 + x^10 + x^9 + x^6 + x^4 + x^3 + x + 1, seeded by Access Address.`
					},
					{
						title: 'BLE Advertisement (ADV_IND on ch 37)',
						code: `ADV_IND from C0:FF:EE:CA:FE:01:
  PHY:        LE 1M (2402 MHz, channel 37)
  Access:     0x8E89BED6 (advertising)
  Header:     PDU type 0 (ADV_IND), TxAdd=1 (random)
  AdvA:       C0:FF:EE:CA:FE:01
  AdvData:    Flags=0x06 (LE General Discoverable + BR/EDR not supported)
              Complete List of 16-bit UUIDs = 0x180D (Heart Rate)
              Complete Local Name = "HR Sensor"
  CRC:        ok

→ Central listening on ch 37 sees this every advInterval (default 1000 ms).`
					},
					{
						title: 'GATT Notify after connection',
						code: `LL Data PDU on connection event #137 (data ch 23):
  LLID=2 (L2CAP start), NESN=1, SN=0, length=8
  L2CAP header: CID=0x0004 (ATT), length=4
  ATT PDU:
    Opcode:  0x1B  (Handle Value Notification)
    Handle:  0x002A  (heart_rate_measurement)
    Value:   01 4A 00  (flags=0x01 → 16-bit value; HR=0x004A=74 bpm)

  Link encrypted with AES-CCM using the session key derived from LTK.
  Stack overhead per Notify: 1 (preamble) + 4 (AA) + 2 (LLhdr) + 4 (L2CAP)
                            + 3 (ATT hdr) + 3 (payload) + 4 (MIC) + 3 (CRC) = 24 bytes.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'BLE connection event latency 7.5 ms (min connection interval) to 4 s; with slave latency, *effective* RTT is N × connection-interval. Typical app-level RTT: 30–100 ms',
		throughput:
			'BR/EDR: up to 3 Mbps raw (EDR 3-DH5), ~2.1 Mbps app throughput. BLE: up to 2 Mbps raw on LE 2M; ~1.4 Mbps app with DLE + MTU 247. LE Coded S=8 trades down to ~125 kbps for ~4× range',
		overhead:
			'BLE LL adds 10 bytes per packet (1 preamble + 4 Access Address + 2 LL header + 3 CRC). ATT operation overhead: 3-byte ATT header + 4-byte L2CAP. Default ATT MTU = 23 → 20 bytes payload per Notify; negotiate up to 247 or 517'
	},
	connections: ['wifi', 'ipv6', 'tls', 'mdns-dns-sd'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Bluetooth',
		official: 'https://www.bluetooth.com/specifications/specs/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bluetooth.svg/250px-Bluetooth.svg.png',
		alt: 'The Bluetooth logo — a bind-rune combining Hagall (ᚼ) and Bjarkan (ᛒ), the initials of Harald Bluetooth in Younger Futhark',
		caption:
			"The Bluetooth logo is a bind-rune combining **Hagall** (ᚼ) and **Bjarkan** (ᛒ) — the initials of *Harald Blåtand*, the 10th-century Danish king who united Denmark and Norway. Jim Kardach at Intel proposed the name as a placeholder during a 1997 SIG meeting; it was never supposed to ship.",
		credit: 'Image: Wikimedia Commons / Public Domain (Bluetooth SIG trademark)'
	},

	recentChanges: [
		{
			date: '2024-09',
			title: 'Bluetooth 6.0 — Channel Sounding adopted',
			description:
				'Adopted 3 September 2024. Channel Sounding adds phase-based + RTT distance measurement on a new LE 2M 2BT PHY, achieving centimetre-class accuracy up to ~150 m. The protocol-level answer to UWB for digital-key, anti-stalking, and finder applications.',
			source: {
				url: 'https://www.bluetooth.com/blog/bluetooth-6-0-released/',
				label: 'Bluetooth SIG: 6.0 release'
			}
		},
		{
			date: '2025-05',
			title: 'Bluetooth Core Spec 6.1 — privacy and power improvements',
			description:
				'May 2025 release. Adds finer-grained Resolvable Private Address rotation control (privacy against long-term tracking) and ISOAL improvements for LE Audio battery life.',
			source: {
				url: 'https://www.bluetooth.com/specifications/specs/',
				label: 'Bluetooth SIG specifications portal'
			}
		},
		{
			date: '2026-01',
			title: 'Frankfurt Airport — first airport-wide Auracast deployment',
			description:
				'On 28 January 2026 Frankfurt Airport became the first airport to broadcast all gate announcements over **Auracast** — LC3-based one-to-many BLE Audio. Travellers with Auracast-capable hearing aids or earbuds tune in directly; no infrastructure handoff, no app required. The first major real-world replacement for the analog hearing loop.',
			source: {
				url: 'https://www.gn.com/Newsroom/News/2026/January/Frankfurt-Airport-Becomes-the-First-Airport-Worldwide-to-Use-Auracast',
				label: 'GN Group newsroom'
			}
		},
		{
			date: '2024-12',
			title: 'Apple-Google DULT anti-stalking draft → IETF',
			description:
				"The Detecting Unwanted Location Trackers (DULT) standard — born from the AirTag stalking saga — moved into IETF working-group drafts in late 2024. Standardises a 'Tracker has been with you' alert across Apple's Find My and Google's Find My Device networks regardless of vendor.",
			source: {
				url: 'https://datatracker.ietf.org/wg/dult/about/',
				label: 'IETF DULT working group'
			}
		},
		{
			date: '2023-11',
			title: 'BLUFFS attack (CVE-2023-24023)',
			description:
				"Daniele Antonioli's third major architectural attack on [[bluetooth|Bluetooth]] session security (after KNOB 2019 and BIAS 2020). Forces low-entropy session keys via downgrade during cross-session key derivation, breaking forward + future secrecy in BR/EDR Secure Connections. Affects every BR/EDR device shipped before mid-2024 firmware updates.",
			source: {
				url: 'https://francozappa.github.io/about-bluffs/',
				label: 'BLUFFS disclosure'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Apple AirPods + Find My network',
			scale: '>1 billion AirPod units shipped lifetime; ~3 billion Find My nodes',
			description:
				'The single largest commercial BLE deployment. AirPods use proprietary Apple H1/H2 chip extensions on top of BR/EDR + BLE; the Find My network turns every iPhone, iPad, and Mac into a relay for any nearby [[bluetooth|Bluetooth]] beacon (AirTag, AirPods, third-party Find My-certified accessories).'
		},
		{
			org: 'Bluetooth Special Interest Group',
			scale: '~4.7 billion Bluetooth ICs shipped annually (2024)',
			description:
				"The Bluetooth SIG's annual market report tracks every certified chip; 2024 forecast was ~4.7 billion units, climbing toward 5+ billion by 2027. Categories: audio (earbuds, hearing aids), wearables, smart home, automotive, industrial."
		},
		{
			org: 'Tesla / CCC Digital Key',
			scale: 'Every Tesla since Model 3 (2017); all CCC-certified vehicles from 2023+',
			description:
				"Tesla's phone-as-key uses BLE proximity + a proprietary protocol. The CCC (Car Connectivity Consortium) Digital Key 3.0 standardises BLE + UWB for OEM-agnostic deployment — and Channel Sounding (Bluetooth 6.0) is the protocol-level answer to the 2022 NCC Group BLE relay attack that opened a Model 3 from across the street."
		},
		{
			org: 'Hearing-aid industry (Sonova, GN ReSound, Demant)',
			scale: 'LE Audio + ASHA shipping in every major hearing-aid brand 2024+',
			description:
				"LE Audio's CIS (unicast) + BIS (broadcast) carry hearing-aid audio at battery costs ~50% lower than the previous proprietary protocols. Combined with Auracast for public-venue broadcast, it is the largest functional change in hearing-aid connectivity in two decades."
		}
	],

	funFacts: [
		{
			title: 'The name was a placeholder',
			text: 'Jim Kardach at Intel proposed "Bluetooth" in 1997 at a SIG meeting as a temporary working name — after **Harald "Blåtand" Gormsson**, the 10th-century Danish king who united Denmark and Norway, just as the SIG was trying to unite Ericsson, IBM, Intel, Nokia, and Toshiba behind one short-range wireless standard. The name was never supposed to ship. It did. The logo is a bind-rune of Harald\'s initials in Younger Futhark — ᚼ + ᛒ.'
		},
		{
			title: 'The "AirTag stalking" saga produced an IETF standard',
			text: "Starting in 2021, dozens of cases emerged of [[bluetooth|Bluetooth]] AirTags being slipped into bags, cars, and clothing to track people. Apple and Google — direct competitors — quietly co-authored the **DULT** (Detecting Unwanted Location Trackers) protocol, which moved into IETF working-group drafts in 2024. The result: cross-vendor 'a tracker has been moving with you' alerts that work across Apple's Find My and Google's Find My Device networks."
		},
		{
			title: 'KNOB, BIAS, BLUFFS — the same author broke Bluetooth three times',
			text: "Daniele Antonioli (then EURECOM, now PostDoc-and-faculty) is the lead author of the three architectural attacks that broke BR/EDR session security at the protocol level: **KNOB** (CVE-2019-9506, key-negotiation forcing 1-byte entropy), **BIAS** (CVE-2020-10135, impersonation across bonding), and **BLUFFS** (CVE-2023-24023, forward-secrecy breakage). Each required firmware updates from every chipmaker. The SIG's response: 7-byte minimum entropy by default, Secure Connections Only mode, and renewed Authentication-after-Bonding rules — but the architectural debt is still there."
		},
		{
			title: 'BR/EDR and BLE share a logo but not a single bit',
			text: "Despite the unified branding, **Bluetooth Classic and BLE share no bits over the air**. Different modulation (GFSK + DPSK for Classic, GFSK only for BLE 1M), different channel plan (79 × 1 MHz vs 40 × 2 MHz), different hopping (1,600/s vs once-per-connection-event), different framing, different security. A dual-mode chip runs both stacks side by side. The SIG estimates more than half of all shipping radios are dual-mode in 2024."
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'The default ATT MTU is 23 bytes',
				text: "Every BLE connection starts with ATT MTU = 23, which means only **20 bytes of payload per Notify** after the 3-byte ATT header. If you ship that default, your sensor stream is throughput-bound on overhead. **Cure:** request an MTU exchange (`ATT_Exchange_MTU_Request`) to 247 (one LL PDU with Data Length Extension) or 517 (the BLE maximum) as the first ATT operation after pairing. Most platforms now do this automatically — but verify with an nRF Sniffer capture."
			},
			{
				title: 'Connection interval × Slave latency × Supervision timeout',
				text: 'These three parameters interact in surprising ways. `Supervision Timeout ≥ (1 + Slave Latency) × Connection Interval × 2` per the spec, or the connection drops at the worst possible moment. **Cure:** for fitness wearables that talk every 100 ms, use connection-interval=15 ms, slave-latency=4, supervision-timeout=4 s. For battery-life-critical sensors, push interval longer (1 s+) and let slave-latency=0; never set both to extremes.'
			},
			{
				title: 'Wi-Fi coexistence on 2.4 GHz',
				text: "BLE channels 37/38/39 (advertising) sit at 2402, 2426, and 2480 MHz — carefully chosen to **avoid** [[wifi|Wi-Fi]] channels 1/6/11 (2412/2437/2462 MHz). But the 37 data channels (0–36) overlap. Modern combo chips do time-division arbitration internally; on a discrete radio, a saturated [[wifi|Wi-Fi]] AP can starve BLE for tens of seconds. **Cure:** if running mission-critical BLE next to enterprise Wi-Fi, fix the Wi-Fi APs to use 5/6 GHz where possible, or use **LE Coded S=8** which trades 8× more airtime for 8× better link budget — surviving interference where LE 1M won\'t."
			}
		]
	}
};
