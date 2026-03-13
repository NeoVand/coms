import type { SimulationConfig } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createNTPLayer } from '../layers/ntp';

export const ntpSync: SimulationConfig = {
	protocolId: 'ntp',
	title: 'NTP — Network Time Synchronization',
	description:
		'See how NTP synchronizes clocks using four timestamps to calculate both the clock offset and network delay. This 48-byte UDP exchange keeps every device on the internet within milliseconds of the correct time.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'NTP Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'request',
			label: 'NTP Request',
			description:
				'The client sends a 48-byte NTP request over UDP. Mode 3 identifies this as a client request. The client records its transmit timestamp (T1) — this will be essential for calculating clock offset and round-trip delay after the response arrives.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['LI/VN/Mode', 'Timestamps'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49500, dstPort: 123 }),
				createNTPLayer({
					flags: '0x23 (LI:0, VN:4, Mode:3 Client)',
					stratum: 0,
					poll: 6,
					precision: '-20',
					refId: '(none)',
					timestamps: 'T1 = 2026-03-13 14:30:00.123456 UTC'
				})
			]
		},
		{
			id: 'response',
			label: 'NTP Response',
			description:
				'The server responds with its timestamps and stratum level. It records when the request arrived (T2) and when the response leaves (T3). Stratum 1 means this server syncs directly to an atomic clock or GPS. The client uses all four timestamps to calculate: Offset = ((T2-T1)+(T3-T4))/2 and Delay = (T4-T1)-(T3-T2).',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Stratum', 'Reference ID', 'Timestamps'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 123, dstPort: 49500 }),
				createNTPLayer({
					flags: '0x24 (LI:0, VN:4, Mode:4 Server)',
					stratum: 1,
					poll: 6,
					precision: '-24',
					refId: 'GPS',
					timestamps: 'T1=14:30:00.123456, T2=.123478, T3=.123502, Offset=+22us'
				})
			]
		}
	]
};
