import type { SimulationConfig } from '../types';
import { createBLELinkLayer, createL2CAPLayer, createATTLayer } from '../layers/ble';

export const bluetoothBleGatt: SimulationConfig = {
	protocolId: 'bluetooth',
	title: 'BLE Connect, Pair, and GATT Read',
	description:
		"Watch a phone (Central) discover a heart-rate sensor (Peripheral) on a BLE advertising channel, establish a connection, exchange MTU, pair with LE Secure Connections, and subscribe to notifications. This is the flow under every fitness tracker, AirTag, hearing aid, and Matter device commissioning over Bluetooth.",
	tier: 'client',
	actors: [
		{ id: 'central', label: 'Central (Phone)', icon: 'device', position: 'left' },
		{ id: 'peripheral', label: 'Peripheral (Sensor)', icon: 'device', position: 'right' }
	],
	userInputs: [
		{
			id: 'advInterval',
			label: 'Advertising interval (ms)',
			type: 'number',
			defaultValue: '1000',
			placeholder: '20–10240'
		},
		{
			id: 'attMtu',
			label: 'Target ATT MTU',
			type: 'number',
			defaultValue: '247',
			placeholder: '23–517'
		},
		{
			id: 'phy',
			label: 'PHY',
			type: 'select',
			defaultValue: '2M',
			options: ['1M', '2M', 'Coded S=2', 'Coded S=8']
		}
	],
	steps: [
		{
			id: 'adv',
			label: 'ADV_IND (Advertising)',
			description:
				"The Peripheral wakes from deep sleep and transmits ADV_IND on channel 37 (2402 MHz). The 31-byte advertising payload carries Flags, the 16-bit Heart Rate Service UUID (0x180D), and the local name 'HR Sensor'. Total airtime: ~376 µs.",
			fromActor: 'peripheral',
			toActor: 'central',
			duration: 1200,
			highlight: ['Access Address', 'LL Header', 'PDU Body'],
			layers: [
				createBLELinkLayer({
					accessAddress: '0x8E89BED6',
					llHeader: 'PDU=ADV_IND (0x0), len=22',
					body: 'AdvA=C0:FF:EE:CA:FE:01, AdvData=Flags+HRS UUID+Name'
				})
			]
		},
		{
			id: 'connreq',
			label: 'CONNECT_IND',
			description:
				'The Central decides to connect. CONNECT_IND on ch 37 carries the per-connection Access Address (32 random bits), CRC seed, channel map, hop increment, and connection-interval/slave-latency/supervision-timeout. From this moment both radios switch to the data channels (0–36).',
			fromActor: 'central',
			toActor: 'peripheral',
			duration: 1200,
			highlight: ['LL Header', 'PDU Body'],
			layers: [
				createBLELinkLayer({
					accessAddress: '0x8E89BED6',
					llHeader: 'PDU=CONNECT_IND (0x5), len=34',
					body: 'AA=0x12345678, hop=0x0A, interval=30ms, latency=0, timeout=2s'
				})
			]
		},
		{
			id: 'mtu',
			label: 'ATT MTU Exchange',
			description:
				"Default ATT MTU is **23** — that's the trap. One LL PDU with Data Length Extension can carry 247 bytes; the Central asks for 247 right after connection, and the Peripheral confirms its maximum. From here, every Read/Notify can carry 244 bytes of payload instead of 20.",
			fromActor: 'central',
			toActor: 'peripheral',
			duration: 1200,
			highlight: ['CID', 'Opcode'],
			layers: [
				createBLELinkLayer({
					accessAddress: '0x12345678',
					llHeader: 'LLID=2 (L2CAP start), len=7',
					body: 'L2CAP + ATT'
				}),
				createL2CAPLayer({ length: 3, cid: '0x0004 (ATT)', payload: 'ATT MTU Request' }),
				createATTLayer({
					opcode: '0x02 (Exchange MTU Request)',
					handle: '—',
					value: 'Client RX MTU = 247'
				})
			]
		},
		{
			id: 'pairing',
			label: 'SMP Pairing (LE Secure Connections)',
			description:
				'On L2CAP CID 0x0006, the Security Manager Protocol runs the LE Secure Connections pairing. ECDH on Curve P-256 derives a Long-Term Key. The user confirms a 6-digit numeric value on both screens (Numeric Comparison) — defeating relay attacks that bit the old Just Works pairing.',
			fromActor: 'central',
			toActor: 'peripheral',
			duration: 1400,
			highlight: ['CID', 'Payload'],
			layers: [
				createBLELinkLayer({
					accessAddress: '0x12345678',
					llHeader: 'LLID=2, len=11',
					body: 'L2CAP(SMP) + Pairing payload'
				}),
				createL2CAPLayer({
					length: 7,
					cid: '0x0006 (SMP)',
					payload: 'Pairing Request: SC + MITM + Numeric Comparison'
				})
			]
		},
		{
			id: 'encrypt',
			label: 'Link Encryption (AES-CCM)',
			description:
				'Once pairing completes, both sides derive a session key from the LTK and encrypt every subsequent LL PDU with AES-CCM. A 4-byte MIC is appended to each payload; replay protection is a 39-bit packet counter. The MIC failure rate is the standard "is the link healthy" canary.',
			fromActor: 'peripheral',
			toActor: 'central',
			duration: 1200,
			highlight: ['LL Header'],
			layers: [
				createBLELinkLayer({
					accessAddress: '0x12345678',
					llHeader: 'LLID=3 (LL control), Encrypted=YES',
					body: 'LL_ENC_RSP — link now encrypted'
				})
			]
		},
		{
			id: 'discover',
			label: 'GATT Discover Characteristic',
			description:
				'The Central walks the Peripheral\'s GATT database to find the Heart Rate Measurement characteristic. ATT "Read By Type Request" with UUID 0x2A37 returns the characteristic handle (here 0x002A).',
			fromActor: 'central',
			toActor: 'peripheral',
			duration: 1200,
			highlight: ['Opcode', 'Value'],
			layers: [
				createBLELinkLayer({
					accessAddress: '0x12345678',
					llHeader: 'LLID=2, len=11',
					body: 'L2CAP(ATT) + Read By Type'
				}),
				createL2CAPLayer({ length: 7, cid: '0x0004 (ATT)', payload: 'Read by Type Request' }),
				createATTLayer({
					opcode: '0x08 (Read By Type Request)',
					handle: '0x0001–0xFFFF',
					value: 'UUID = 0x2A37 (Heart Rate Measurement)'
				})
			]
		},
		{
			id: 'enable-notify',
			label: 'Enable Notifications (CCCD write)',
			description:
				'Writing 0x0001 to the Client Characteristic Configuration Descriptor (CCCD, UUID 0x2902) tells the Peripheral *push me updates*. No polling, no app-level loop — the radio wakes only on each notification interval.',
			fromActor: 'central',
			toActor: 'peripheral',
			duration: 1200,
			highlight: ['Opcode', 'Handle', 'Value'],
			layers: [
				createBLELinkLayer({
					accessAddress: '0x12345678',
					llHeader: 'LLID=2, len=11',
					body: 'L2CAP(ATT) + Write'
				}),
				createL2CAPLayer({ length: 7, cid: '0x0004 (ATT)', payload: 'ATT Write Request' }),
				createATTLayer({
					opcode: '0x12 (Write Request)',
					handle: '0x002B (CCCD)',
					value: '01 00 (enable notify)'
				})
			]
		},
		{
			id: 'notify',
			label: 'Handle Value Notification',
			description:
				'The peripheral pushes the current heart-rate value. No ACK at ATT — reliability comes from the LL ARQ (NESN/SN bits). For confirmed delivery, switch to Indication (opcode 0x1D) at the cost of one extra round trip per sample.',
			fromActor: 'peripheral',
			toActor: 'central',
			duration: 1400,
			highlight: ['Opcode', 'Handle', 'Value'],
			data: 'HR = 72 bpm',
			layers: [
				createBLELinkLayer({
					accessAddress: '0x12345678',
					llHeader: 'LLID=2, len=10',
					body: 'L2CAP(ATT) + Notify'
				}),
				createL2CAPLayer({ length: 6, cid: '0x0004 (ATT)', payload: 'ATT Notify' }),
				createATTLayer({
					opcode: '0x1B (Handle Value Notification)',
					handle: '0x002A',
					value: '01 48 00 → flags=0x01, HR=72 bpm'
				})
			]
		}
	]
};
