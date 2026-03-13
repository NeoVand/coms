import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

export const tcpHandshake: SimulationConfig = {
	protocolId: 'tcp',
	title: 'TCP 3-Way Handshake',
	description:
		'Watch how TCP establishes a reliable connection before any data is sent. ' +
		'Each step builds the packet from application data down through every network layer.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'clientSeq',
			label: 'Client Initial Seq #',
			type: 'number',
			defaultValue: '1000',
			placeholder: 'e.g. 1000'
		},
		{
			id: 'message',
			label: 'Message to Send',
			type: 'text',
			defaultValue: 'Hello, server!',
			placeholder: 'Type a message...'
		}
	],
	steps: [
		{
			id: 'syn',
			label: 'SYN',
			description:
				'Client initiates a connection by sending a SYN segment with its initial sequence number (ISN). No data is sent yet — this is the "knock on the door."',
			fromActor: 'client',
			toActor: 'server',
			duration: 1200,
			highlight: ['Flags', 'Seq #'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49152, dstPort: 80, seq: 1000, ack: 0, flags: 'SYN' })
			]
		},
		{
			id: 'syn-ack',
			label: 'SYN-ACK',
			description:
				'Server acknowledges the client\'s SYN and sends its own SYN. The ACK number equals the client\'s sequence + 1, confirming receipt.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1200,
			highlight: ['Flags', 'Seq #', 'Ack #'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({
					srcPort: 80,
					dstPort: 49152,
					seq: 5000,
					ack: 1001,
					flags: 'SYN,ACK'
				})
			]
		},
		{
			id: 'ack',
			label: 'ACK',
			description:
				'Client completes the handshake by acknowledging the server\'s SYN. The connection is now ESTABLISHED — both sides agree on sequence numbers.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Flags', 'Ack #'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({
					srcPort: 49152,
					dstPort: 80,
					seq: 1001,
					ack: 5001,
					flags: 'ACK'
				})
			]
		},
		{
			id: 'data',
			label: 'DATA',
			description:
				'With the connection established, the client sends application data inside a TCP segment. The sequence number advances by the number of bytes sent.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1200,
			highlight: ['Seq #', 'Flags'],
			data: 'Hello, server!',
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6, totalLength: 74 }),
				createTCPLayer({
					srcPort: 49152,
					dstPort: 80,
					seq: 1001,
					ack: 5001,
					flags: 'PSH,ACK'
				}),
				{
					name: 'Application Data',
					abbreviation: 'DATA',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{
							name: 'Payload',
							bits: 0,
							value: 'Hello, server!',
							editable: false,
							description: 'The actual message being sent (14 bytes of UTF-8 text)'
						}
					]
				}
			]
		},
		{
			id: 'data-ack',
			label: 'ACK',
			description:
				'Server acknowledges receipt of the data. The ACK number advances by the number of bytes received (14), confirming all data arrived intact.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Ack #'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({
					srcPort: 80,
					dstPort: 49152,
					seq: 5001,
					ack: 1015,
					flags: 'ACK'
				})
			]
		},
		{
			id: 'fin',
			label: 'FIN',
			description:
				'Client initiates connection teardown by sending a FIN segment. This tells the server: "I have no more data to send."',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Flags'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({
					srcPort: 49152,
					dstPort: 80,
					seq: 1015,
					ack: 5001,
					flags: 'FIN,ACK'
				})
			]
		},
		{
			id: 'fin-ack',
			label: 'FIN-ACK',
			description:
				'Server acknowledges the FIN and sends its own FIN. Both sides agree the connection is closing gracefully.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Flags', 'Ack #'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({
					srcPort: 80,
					dstPort: 49152,
					seq: 5001,
					ack: 1016,
					flags: 'FIN,ACK'
				})
			]
		}
	]
};
