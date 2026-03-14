import type { SimulationConfig } from '../types';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createICMPLayer } from '../layers/icmp';

export const icmpPing: SimulationConfig = {
	protocolId: 'icmp',
	title: 'ICMP — Ping and Traceroute',
	description:
		'Watch how ping uses Echo Request/Reply to test reachability, then see how traceroute exploits TTL expiry to discover each hop along the path. ICMP sits directly on IP — no TCP or UDP needed.',
	tier: 'client',
	actors: [
		{ id: 'source', label: 'Your Computer', icon: 'client', position: 'left' },
		{ id: 'router', label: 'Router (hop 1)', icon: 'router', position: 'center' },
		{ id: 'target', label: 'Target Host', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'targetIp',
			label: 'Target IP',
			type: 'text',
			defaultValue: '93.184.216.34',
			placeholder: 'e.g. 93.184.216.34'
		}
	],
	steps: [
		{
			id: 'echo-request-1',
			label: 'Echo Request (seq=1)',
			description:
				'Ping sends an ICMP Echo Request (Type 8) to the target. The packet contains an Identifier (to match this ping session) and a Sequence number (incrementing with each ping). A timestamp payload is included so the reply can measure round-trip time. Notice: no TCP or UDP layer — ICMP is encapsulated directly in IP with protocol number 1.',
			fromActor: 'source',
			toActor: 'target',
			duration: 800,
			highlight: ['Type', 'Identifier', 'Sequence'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					protocol: 1,
					ttl: 64
				}),
				createICMPLayer({
					type: '8 (Echo Request)',
					code: 0,
					identifier: '0x1234',
					sequence: 1,
					data: 'Timestamp: 1710412800'
				})
			]
		},
		{
			id: 'echo-reply-1',
			label: 'Echo Reply (seq=1)',
			description:
				'The target host responds with an ICMP Echo Reply (Type 0). It echoes back the same Identifier, Sequence, and data payload. The source calculates round-trip time by comparing the timestamp. The reply confirms: the target is alive, the path works in both directions, and the network is routing correctly.',
			fromActor: 'target',
			toActor: 'source',
			duration: 800,
			highlight: ['Type', 'Identifier', 'Sequence'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 1,
					ttl: 56
				}),
				createICMPLayer({
					type: '0 (Echo Reply)',
					code: 0,
					identifier: '0x1234',
					sequence: 1,
					data: 'RTT: 12.4 ms'
				})
			]
		},
		{
			id: 'echo-request-2',
			label: 'Echo Request (seq=2)',
			description:
				'The second ping increments the Sequence number to 2. Ping typically sends 4 requests and reports statistics: min/avg/max RTT and packet loss percentage. Each request-reply pair independently measures the path, so intermittent issues can be detected.',
			fromActor: 'source',
			toActor: 'target',
			duration: 800,
			highlight: ['Type', 'Sequence'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					protocol: 1,
					ttl: 64
				}),
				createICMPLayer({
					type: '8 (Echo Request)',
					code: 0,
					identifier: '0x1234',
					sequence: 2,
					data: 'Timestamp: 1710412801'
				})
			]
		},
		{
			id: 'echo-reply-2',
			label: 'Echo Reply (seq=2)',
			description:
				'Second reply returns successfully. The TTL decreased from 64 to 56, meaning the packet crossed 8 network hops. Consistent RTT across pings indicates a stable path. Variable RTT might indicate congestion or asymmetric routing.',
			fromActor: 'target',
			toActor: 'source',
			duration: 800,
			highlight: ['Type', 'Sequence', 'Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 1,
					ttl: 56
				}),
				createICMPLayer({
					type: '0 (Echo Reply)',
					code: 0,
					identifier: '0x1234',
					sequence: 2,
					data: 'RTT: 11.8 ms'
				})
			]
		},
		{
			id: 'traceroute-ttl1',
			label: 'Traceroute TTL=1',
			description:
				'Traceroute begins by sending an ICMP Echo Request with TTL=1. Every router that forwards a packet decrements the TTL. When TTL hits zero, the router MUST drop the packet and send back an ICMP Time Exceeded message. By starting with TTL=1, traceroute forces the first router to reveal itself.',
			fromActor: 'source',
			toActor: 'router',
			duration: 1000,
			highlight: ['Type', 'Sequence'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					protocol: 1,
					ttl: 1
				}),
				createICMPLayer({
					type: '8 (Echo Request)',
					code: 0,
					identifier: '0x5678',
					sequence: 1,
					data: 'Traceroute probe'
				})
			]
		},
		{
			id: 'time-exceeded',
			label: 'Time Exceeded',
			description:
				'The router at hop 1 decrements TTL to 0, drops the packet, and sends back ICMP Type 11 (Time Exceeded), Code 0 (TTL expired in transit). Critically, the response includes the original IP header — so traceroute knows which probe this response belongs to. The source now knows hop 1 is 10.0.0.1 and measures its RTT.',
			fromActor: 'router',
			toActor: 'source',
			duration: 1000,
			highlight: ['Type', 'Code', 'Data'],
			layers: [
				createEthernetLayer({ srcMac: 'CC:DD:EE:FF:00:11', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({
					srcIp: '10.0.0.1',
					dstIp: '192.168.1.100',
					protocol: 1,
					ttl: 64
				}),
				createICMPLayer({
					type: '11 (Time Exceeded)',
					code: '0 (TTL expired)',
					identifier: '',
					sequence: '',
					data: 'Original: 192.168.1.100 → 93.184.216.34, TTL was 1'
				})
			]
		},
		{
			id: 'traceroute-ttl2',
			label: 'Traceroute TTL=2',
			description:
				'Traceroute increments TTL to 2 and sends another probe. Hop 1 decrements to 1 and forwards. The next router would decrement to 0 and send Time Exceeded. But in this case, TTL=2 is enough to reach the target directly. Each TTL increment reveals one more hop in the path.',
			fromActor: 'source',
			toActor: 'target',
			duration: 1000,
			highlight: ['Type', 'Sequence'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					protocol: 1,
					ttl: 2
				}),
				createICMPLayer({
					type: '8 (Echo Request)',
					code: 0,
					identifier: '0x5678',
					sequence: 2,
					data: 'Traceroute probe'
				})
			]
		},
		{
			id: 'traceroute-reply',
			label: 'Echo Reply (reached!)',
			description:
				'The target is reached and responds with a normal Echo Reply instead of Time Exceeded. This tells traceroute the destination has been found — no more probes needed. The complete path is mapped: hop 1 = 10.0.0.1 (router), hop 2 = 93.184.216.34 (target). Real traceroutes often show 10-20 hops across the internet.',
			fromActor: 'target',
			toActor: 'source',
			duration: 1000,
			highlight: ['Type', 'Code', 'Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 1,
					ttl: 55
				}),
				createICMPLayer({
					type: '0 (Echo Reply)',
					code: 0,
					identifier: '0x5678',
					sequence: 2,
					data: 'Destination reached — traceroute complete'
				})
			]
		}
	]
};
