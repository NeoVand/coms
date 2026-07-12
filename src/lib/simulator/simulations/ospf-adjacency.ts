import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createOSPFLayer } from '../layers/ospf';

export const ospfAdjacency: SimulationConfig = {
	protocolId: 'ospf',
	title: 'OSPF Adjacency — Cold Boot to Full',
	description:
		'Watch two routers walk the eight-state OSPF adjacency machine, synchronise their link-state databases, and converge. The protocol runs directly on IP (protocol 89) using link-local multicast 224.0.0.5 — no TCP, no UDP.',
	tier: 'server',
	actors: [
		{ id: 'r1', label: 'Router R1', icon: 'router', position: 'left' },
		{ id: 'r2', label: 'Router R2', icon: 'router', position: 'right' }
	],
	userInputs: [
		{
			id: 'r1Id',
			label: 'R1 Router-ID',
			type: 'text',
			defaultValue: '1.1.1.1',
			placeholder: 'e.g. 1.1.1.1'
		},
		{
			id: 'r2Id',
			label: 'R2 Router-ID',
			type: 'text',
			defaultValue: '2.2.2.2',
			placeholder: 'e.g. 2.2.2.2'
		}
	],
	steps: [
		{
			id: 'hello1',
			label: 'Hello (Init)',
			description:
				"R1 multicasts a Hello to 224.0.0.5 with TTL=1. It's not yet seen R2's Hello so the Neighbours list is empty. The HelloInterval (10 s) and DeadInterval (40 s) MUST match exactly between neighbours.",
			fromActor: 'r1',
			toActor: 'r2',
			duration: 1200,
			highlight: ['Type', 'Router ID', 'Body'],
			layers: [
				createEthernetLayer({ dstMac: '01:00:5E:00:00:05' }),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '224.0.0.5', protocol: 89, ttl: 1 }),
				createOSPFLayer({
					type: 'Hello (1)',
					length: 44,
					routerId: '1.1.1.1',
					body: 'HelloInterval=10, DeadInterval=40, Nbrs=[]'
				})
			]
		},
		{
			id: 'hello2',
			label: 'Hello (2-Way)',
			description:
				"R2 has received R1's Hello and replies with its own — including R1 in its Neighbours list. R1 will see itself in this Hello and transition Init → 2-Way.",
			fromActor: 'r2',
			toActor: 'r1',
			duration: 1200,
			highlight: ['Router ID', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66', dstMac: '01:00:5E:00:00:05' }),
				createIPv4Layer({ srcIp: '10.0.0.2', dstIp: '224.0.0.5', protocol: 89, ttl: 1 }),
				createOSPFLayer({
					type: 'Hello (1)',
					length: 48,
					routerId: '2.2.2.2',
					body: 'HelloInterval=10, DeadInterval=40, Nbrs=[1.1.1.1]'
				})
			]
		},
		{
			id: 'dbd-master',
			label: 'DBD (ExStart)',
			description:
				"ExStart — both sides negotiate who is Master. Higher Router-ID wins; here R2 sets MS=1 with init bit I=1. R1 will yield and accept R2's initial sequence number.",
			fromActor: 'r2',
			toActor: 'r1',
			duration: 1200,
			highlight: ['Type', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '10.0.0.2', dstIp: '10.0.0.1', protocol: 89, ttl: 1 }),
				createOSPFLayer({
					type: 'DBD (2)',
					length: 32,
					routerId: '2.2.2.2',
					body: 'I=1, M=1, MS=1, Seq=0x1A2B'
				})
			]
		},
		{
			id: 'dbd-exchange',
			label: 'DBD (Exchange)',
			description:
				'Exchange — subsequent DBDs carry **LSA headers** (32-bit sequence, 16-bit age, 16-bit checksum), not full LSAs. Each side now knows what the other has and what it needs.',
			fromActor: 'r1',
			toActor: 'r2',
			duration: 1200,
			highlight: ['Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '10.0.0.2', protocol: 89, ttl: 1 }),
				createOSPFLayer({
					type: 'DBD (2)',
					length: 64,
					routerId: '1.1.1.1',
					body: 'I=0, M=0, MS=0, Seq=0x1A2B (slave echoes the master DD seq) + 2 LSA hdrs (Router-LSA, Network-LSA)'
				})
			]
		},
		{
			id: 'lsr',
			label: 'LSR (Loading)',
			description:
				"Loading — R1 asks R2 for the full LSAs it's missing. Each Link State Request carries the LSA's type, ID, and advertising router.",
			fromActor: 'r1',
			toActor: 'r2',
			duration: 1200,
			highlight: ['Type', 'Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '10.0.0.2', protocol: 89, ttl: 1 }),
				createOSPFLayer({
					type: 'LSR (3)',
					length: 36,
					routerId: '1.1.1.1',
					body: 'Req: [Router-LSA RID=2.2.2.2, Network-LSA ID=10.0.0.2]'
				})
			]
		},
		{
			id: 'lsu',
			label: 'LSU',
			description:
				"R2 ships the full LSAs in a Link State Update. Each LSA carries a 32-bit sequence number (starting 0x80000001), a 16-bit age, a 16-bit checksum, and the payload (this router's links, costs, IDs).",
			fromActor: 'r2',
			toActor: 'r1',
			duration: 1300,
			highlight: ['Type', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '10.0.0.2', dstIp: '10.0.0.1', protocol: 89, ttl: 1 }),
				createOSPFLayer({
					type: 'LSU (4)',
					length: 132,
					routerId: '2.2.2.2',
					body: '2 LSAs: Router-LSA (3 links), Network-LSA (DR=2.2.2.2)'
				})
			]
		},
		{
			id: 'lsack',
			label: 'LSAck (Full)',
			description:
				'R1 acknowledges every LSA. OSPF implements reliable delivery on top of raw IP — no TCP underneath. Both routers are now Full: identical LSDB, ready to run Dijkstra.',
			fromActor: 'r1',
			toActor: 'r2',
			duration: 1000,
			highlight: ['Type', 'Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.1', dstIp: '224.0.0.5', protocol: 89, ttl: 1 }),
				createOSPFLayer({
					type: 'LSAck (5)',
					length: 64,
					routerId: '1.1.1.1',
					body: 'Ack: [Router-LSA seq=0x80000001, Network-LSA seq=0x80000001]'
				})
			]
		},
		{
			id: 'spf',
			label: 'Run Dijkstra → install routes',
			description:
				'Each router independently runs SPF on the now-identical topology graph. The RFC 8405 back-off keeps SPF from thrashing on rapid churn: INITIAL=50 ms, SHORT_WAIT=200 ms, LONG_WAIT=5 s. The result installs into the FIB; packets start forwarding on the chosen tree.',
			fromActor: 'r1',
			toActor: 'r2',
			duration: 1400,
			highlight: ['Body'],
			data: 'SPF tree from R1: → R2 cost 10 (direct); → 10.0.0.0/24 via R2',
			layers: [
				{
					name: 'SPF Computation',
					abbreviation: 'SPF',
					osiLayer: 3,
					color: '#F472B6',
					headerFields: [
						{
							name: 'Algorithm',
							bits: 0,
							value: 'Dijkstra (E.W. Dijkstra, 1956)',
							editable: false,
							description:
								'The shortest-path-first algorithm — every link-state router runs it locally on its own LSDB'
						},
						{
							name: 'Throttle',
							bits: 0,
							value: 'RFC 8405: 50 / 200 / 5000 ms',
							editable: false,
							description:
								'SPF back-off: INITIAL, SHORT_WAIT, LONG_WAIT — prevents thrashing on rapid topology churn'
						},
						{
							name: 'Result',
							bits: 0,
							value: 'Shortest-path tree from R1 installed into FIB',
							editable: false,
							description:
								'The forwarding information base — what hardware actually uses to forward packets'
						}
					]
				}
			]
		}
	]
};
