import type { SimulationConfig } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

export const udpDatagram: SimulationConfig = {
	protocolId: 'udp',
	title: 'UDP — Fire and Forget',
	description:
		'See how UDP sends datagrams without establishing a connection. No handshake, no acknowledgment, no guarantee of delivery — and that is by design.',
	tier: 'client',
	actors: [
		{ id: 'sender', label: 'Sender', icon: 'client', position: 'left' },
		{ id: 'receiver', label: 'Receiver', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'dstPort',
			label: 'Destination Port',
			type: 'number',
			defaultValue: '9000',
			placeholder: 'e.g. 9000'
		}
	],
	steps: [
		{
			id: 'dgram-1',
			label: 'Datagram #1',
			description:
				'UDP sends the first datagram immediately — no connection setup needed. Notice the minimal 8-byte header compared to TCP\'s 20 bytes.',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 800,
			highlight: ['Src Port', 'Dst Port', 'Length'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49152, dstPort: 9000, length: 30 }),
				{
					name: 'Application Data',
					abbreviation: 'DATA',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Payload', bits: 0, value: 'Packet #1: Hello!', editable: false, description: 'Application payload — sent without waiting for acknowledgment' }
					]
				}
			]
		},
		{
			id: 'dgram-2',
			label: 'Datagram #2',
			description:
				'The second datagram is sent right away — UDP doesn\'t wait for the first one to be acknowledged. Each datagram is independent.',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 800,
			highlight: ['Length'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49152, dstPort: 9000, length: 32 }),
				{
					name: 'Application Data',
					abbreviation: 'DATA',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Payload', bits: 0, value: 'Packet #2: World!', editable: false, description: 'Another independent datagram' }
					]
				}
			]
		},
		{
			id: 'dgram-3-lost',
			label: 'Datagram #3 (LOST)',
			description:
				'This datagram is lost in transit! With UDP, neither the sender nor receiver knows about the loss. There is no retransmission — the data is simply gone.',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 1200,
			highlight: ['Checksum'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17, ttl: 0 }),
				createUDPLayer({ srcPort: 49152, dstPort: 9000, length: 28 }),
				{
					name: 'Application Data',
					abbreviation: 'DATA',
					osiLayer: 7,
					color: '#ef4444',
					headerFields: [
						{ name: 'Payload', bits: 0, value: 'Packet #3: Lost!', editable: false, description: 'This datagram never arrives — lost in the network', color: '#ef4444' }
					]
				}
			]
		},
		{
			id: 'dgram-4',
			label: 'Datagram #4',
			description:
				'The sender keeps going, unaware that datagram #3 was lost. This is the trade-off: UDP is fast because it doesn\'t wait, but unreliable.',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 800,
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49152, dstPort: 9000, length: 35 }),
				{
					name: 'Application Data',
					abbreviation: 'DATA',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Payload', bits: 0, value: 'Packet #4: Still here', editable: false, description: 'The sender continues without knowing about the loss' }
					]
				}
			]
		},
		{
			id: 'dgram-5',
			label: 'Datagram #5',
			description:
				'Final datagram sent. The receiver got packets 1, 2, 4, and 5 — but not 3. If ordering matters, the application must handle that itself (UDP doesn\'t).',
			fromActor: 'sender',
			toActor: 'receiver',
			duration: 800,
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49152, dstPort: 9000, length: 26 }),
				{
					name: 'Application Data',
					abbreviation: 'DATA',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{ name: 'Payload', bits: 0, value: 'Packet #5: Done', editable: false, description: 'Last datagram — receiver reconstructs what it can' }
					]
				}
			]
		}
	]
};
