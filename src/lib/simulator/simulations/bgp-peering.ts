import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createBGPLayer } from '../layers/bgp';

export const bgpPeering: SimulationConfig = {
	protocolId: 'bgp',
	title: 'BGP — Route Exchange Between Autonomous Systems',
	description:
		'Watch two routers in different autonomous systems establish a BGP session and exchange routing information. This is how the internet learns which networks can reach which other networks.',
	tier: 'client',
	actors: [
		{ id: 'routerA', label: 'Router A (AS 65001)', icon: 'router', position: 'left' },
		{ id: 'routerB', label: 'Router B (AS 65002)', icon: 'router', position: 'right' }
	],
	steps: [
		{
			id: 'open-a',
			label: 'OPEN (AS 65001)',
			description:
				'Router A initiates the BGP session by sending an OPEN message over the established TCP connection on port 179. The OPEN contains its AS number (65001), a proposed hold time (90 seconds), and its BGP identifier (typically its router IP). Both sides must agree on parameters before the session can proceed.',
			fromActor: 'routerA',
			toActor: 'routerB',
			duration: 1000,
			highlight: ['Type', 'AS Number', 'Hold Time', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '10.0.0.2', protocol: 6 }),
				createTCPLayer({ srcPort: 49500, dstPort: 179, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'OPEN (1)',
					length: 41,
					asNumber: 'AS 65001',
					holdTime: 90,
					payload: 'BGP ID: 10.0.0.1, Version: 4'
				})
			]
		},
		{
			id: 'open-b',
			label: 'OPEN (AS 65002)',
			description:
				'Router B responds with its own OPEN message, advertising AS 65002. BGP is symmetric — both peers must introduce themselves. The hold time is negotiated to the lower of the two proposed values. If version numbers or capabilities are incompatible, the peer sends a NOTIFICATION and tears down the session.',
			fromActor: 'routerB',
			toActor: 'routerA',
			duration: 1000,
			highlight: ['Type', 'AS Number', 'Hold Time', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '10.0.0.2', dstIp: '10.0.0.1', protocol: 6 }),
				createTCPLayer({ srcPort: 179, dstPort: 49500, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'OPEN (1)',
					length: 41,
					asNumber: 'AS 65002',
					holdTime: 90,
					payload: 'BGP ID: 10.0.0.2, Version: 4'
				})
			]
		},
		{
			id: 'keepalive-a',
			label: 'KEEPALIVE',
			description:
				'Router A confirms the session parameters by sending a KEEPALIVE. This is the smallest possible BGP message — just the 19-byte header with no payload. The KEEPALIVE serves double duty: it confirms the OPEN exchange and starts the hold timer. If either peer doesn\'t hear from the other within the hold time, the session is torn down.',
			fromActor: 'routerA',
			toActor: 'routerB',
			duration: 800,
			highlight: ['Type', 'Length'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '10.0.0.2', protocol: 6 }),
				createTCPLayer({ srcPort: 49500, dstPort: 179, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'KEEPALIVE (4)',
					length: 19,
					asNumber: '',
					holdTime: '',
					payload: 'Session confirmed'
				})
			]
		},
		{
			id: 'keepalive-b',
			label: 'KEEPALIVE',
			description:
				'Router B confirms with its own KEEPALIVE. The BGP session is now in the Established state — both peers are ready to exchange routing information. The transition from OpenConfirm to Established is when BGP gets interesting: routes start flowing.',
			fromActor: 'routerB',
			toActor: 'routerA',
			duration: 800,
			highlight: ['Type', 'Length'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '10.0.0.2', dstIp: '10.0.0.1', protocol: 6 }),
				createTCPLayer({ srcPort: 179, dstPort: 49500, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'KEEPALIVE (4)',
					length: 19,
					asNumber: '',
					holdTime: '',
					payload: 'Session confirmed'
				})
			]
		},
		{
			id: 'update-announce-a',
			label: 'UPDATE (announce)',
			description:
				'Router A announces its reachable networks via an UPDATE message. The NLRI (Network Layer Reachability Information) contains the prefix 192.168.0.0/16. The path attributes include the AS_PATH (just AS 65001 — one hop) and NEXT_HOP (10.0.0.1 — where to send traffic). Router B will add this route to its routing table.',
			fromActor: 'routerA',
			toActor: 'routerB',
			duration: 1000,
			highlight: ['Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '10.0.0.2', protocol: 6 }),
				createTCPLayer({ srcPort: 49500, dstPort: 179, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'UPDATE (2)',
					length: 52,
					asNumber: 'AS 65001',
					holdTime: '',
					payload: 'NLRI: 192.168.0.0/16, AS_PATH: 65001, NEXT_HOP: 10.0.0.1'
				})
			]
		},
		{
			id: 'update-announce-b',
			label: 'UPDATE (announce)',
			description:
				'Router B announces its own networks in return. The AS_PATH now shows AS 65002, and the NEXT_HOP points to Router B\'s address. When Router A receives this, it knows that to reach 172.16.0.0/12, it should send traffic to 10.0.0.2. This is how the internet\'s routing table is built — one UPDATE at a time.',
			fromActor: 'routerB',
			toActor: 'routerA',
			duration: 1000,
			highlight: ['Type', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '10.0.0.2', dstIp: '10.0.0.1', protocol: 6 }),
				createTCPLayer({ srcPort: 179, dstPort: 49500, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'UPDATE (2)',
					length: 48,
					asNumber: 'AS 65002',
					holdTime: '',
					payload: 'NLRI: 172.16.0.0/12, AS_PATH: 65002, NEXT_HOP: 10.0.0.2'
				})
			]
		},
		{
			id: 'update-withdraw',
			label: 'UPDATE (withdraw)',
			description:
				'Router A withdraws a previously announced route. Perhaps that network went down, or a better path was found. The Withdrawn Routes field lists the prefix being removed. Router B must remove this route from its table and propagate the withdrawal to its own peers — this cascading effect is how BGP convergence works.',
			fromActor: 'routerA',
			toActor: 'routerB',
			duration: 1000,
			highlight: ['Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '10.0.0.2', protocol: 6 }),
				createTCPLayer({ srcPort: 49500, dstPort: 179, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'UPDATE (2)',
					length: 27,
					asNumber: '',
					holdTime: '',
					payload: 'Withdrawn: 192.168.100.0/24'
				})
			]
		},
		{
			id: 'keepalive-periodic',
			label: 'KEEPALIVE',
			description:
				'BGP peers send periodic KEEPALIVEs (typically every 30 seconds) to prove they\'re still alive. If no message is received within the hold time (90 seconds), the peer is declared dead and all its routes are withdrawn. This is why BGP misconfiguration can cause massive internet outages — if a major ISP\'s session drops, thousands of routes disappear.',
			fromActor: 'routerA',
			toActor: 'routerB',
			duration: 800,
			highlight: ['Type', 'Length'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '10.0.0.2', protocol: 6 }),
				createTCPLayer({ srcPort: 49500, dstPort: 179, flags: 'PSH,ACK' }),
				createBGPLayer({
					type: 'KEEPALIVE (4)',
					length: 19,
					asNumber: '',
					holdTime: '',
					payload: 'Hold timer reset — session alive'
				})
			]
		}
	]
};
