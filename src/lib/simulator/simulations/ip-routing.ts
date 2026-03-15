import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';

export const ipRouting: SimulationConfig = {
	protocolId: 'ip',
	title: 'IP — Packet Routing Across Networks',
	description:
		'Trace an IP packet as it travels hop-by-hop across network boundaries. At each router, the TTL is decremented and the Ethernet MACs change to reflect the new link — but the source and destination IPs remain constant end-to-end. This is the fundamental principle of IP routing.',
	tier: 'client',
	actors: [
		{ id: 'source', label: 'Source Host', icon: 'client', position: 'left' },
		{ id: 'router', label: 'Router', icon: 'router', position: 'center' },
		{ id: 'dest', label: 'Destination', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'construct',
			label: 'Construct IP Packet',
			description:
				'The source host constructs an IP packet with TTL=64 (the standard initial value on Linux). The destination IP 93.184.216.34 is not on the local 192.168.1.0/24 subnet, so the host knows it must send the packet to its default gateway. The Ethernet destination MAC is set to the router\'s MAC — not the final destination\'s MAC.',
			fromActor: 'source',
			toActor: 'source',
			duration: 800,
			highlight: ['Dst IP', 'TTL', 'Dst MAC'],
			layers: [
				createEthernetLayer({
					dstMac: 'CC:DD:EE:FF:00:11',
					srcMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					ttl: 64,
					protocol: 6
				})
			]
		},
		{
			id: 'send-to-gateway',
			label: 'Send to Default Gateway',
			description:
				'The packet is placed on the wire toward the default gateway (the router). The Ethernet frame is addressed to the router\'s MAC CC:DD:EE:FF:00:11, but the IP destination remains 93.184.216.34. This is the key insight: Layer 2 addressing is hop-by-hop, while Layer 3 addressing is end-to-end.',
			fromActor: 'source',
			toActor: 'router',
			duration: 600,
			highlight: ['Dst IP', 'TTL'],
			layers: [
				createEthernetLayer({
					dstMac: 'CC:DD:EE:FF:00:11',
					srcMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					ttl: 64,
					protocol: 6
				})
			]
		},
		{
			id: 'router-receives',
			label: 'Router Processes Packet',
			description:
				'The router strips the Ethernet frame, examines the IP header, and decrements TTL from 64 to 63. If TTL had reached 0, the router would drop the packet and send an ICMP Time Exceeded message. The router also recalculates the IP header checksum since the TTL field changed. It then consults its routing table to determine the next hop for 93.184.216.34.',
			fromActor: 'router',
			toActor: 'router',
			duration: 800,
			highlight: ['TTL'],
			layers: [
				createEthernetLayer({
					dstMac: 'CC:DD:EE:FF:00:11',
					srcMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					ttl: 63,
					protocol: 6
				})
			]
		},
		{
			id: 'router-forwards',
			label: 'Router Forwards (new MACs)',
			description:
				'The router re-encapsulates the IP packet in a brand-new Ethernet frame for the next link. Notice: the source and destination IPs are completely unchanged, but the Ethernet MACs are entirely different — the router\'s outbound interface MAC is now the source, and the next hop\'s MAC is the destination. This MAC rewriting happens at every hop.',
			fromActor: 'router',
			toActor: 'dest',
			duration: 600,
			highlight: ['Src MAC', 'Dst MAC', 'Src IP', 'Dst IP'],
			layers: [
				createEthernetLayer({
					dstMac: 'DD:EE:FF:00:11:22',
					srcMac: 'EE:FF:00:11:22:33'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					ttl: 63,
					protocol: 6
				})
			]
		},
		{
			id: 'destination-receives',
			label: 'Destination Receives',
			description:
				'The destination host receives the frame and checks that the Dst IP matches its own address (93.184.216.34) — this confirms the packet is intended for this host, not just passing through. The Protocol field value 6 indicates TCP, so the IP layer delivers the payload to the TCP stack for further processing.',
			fromActor: 'dest',
			toActor: 'dest',
			duration: 600,
			highlight: ['Dst IP', 'Protocol'],
			layers: [
				createEthernetLayer({
					dstMac: 'DD:EE:FF:00:11:22',
					srcMac: 'EE:FF:00:11:22:33'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '93.184.216.34',
					ttl: 63,
					protocol: 6
				})
			]
		},
		{
			id: 'response',
			label: 'Response Packet',
			description:
				'The destination sends a response with source and destination IPs swapped. TTL is reset to 64 since this is a new packet, not a forwarded one. The Ethernet MACs address the frame to the router on this link segment. The response will traverse the same routers in reverse (though the actual path may differ due to asymmetric routing).',
			fromActor: 'dest',
			toActor: 'router',
			duration: 600,
			highlight: ['Src IP', 'Dst IP', 'TTL'],
			layers: [
				createEthernetLayer({
					dstMac: 'EE:FF:00:11:22:33',
					srcMac: 'DD:EE:FF:00:11:22'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					ttl: 64,
					protocol: 6
				})
			]
		},
		{
			id: 'return-route',
			label: 'Return Route (TTL 63)',
			description:
				'The router decrements TTL from 64 to 63 and re-encapsulates with new Ethernet MACs for the source\'s local network. The source\'s MAC is now the Ethernet destination, and the router\'s LAN-side MAC is the source. The IP addresses remain 93.184.216.34 → 192.168.1.100, unchanged across the entire return path.',
			fromActor: 'router',
			toActor: 'source',
			duration: 600,
			highlight: ['Dst MAC', 'Src MAC', 'TTL'],
			layers: [
				createEthernetLayer({
					dstMac: '00:1A:2B:3C:4D:5E',
					srcMac: 'CC:DD:EE:FF:00:11'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					ttl: 63,
					protocol: 6
				})
			]
		}
	]
};
