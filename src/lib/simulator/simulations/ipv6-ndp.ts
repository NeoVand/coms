import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv6Layer } from '../layers/ipv6';

export const ipv6Ndp: SimulationConfig = {
	protocolId: 'ipv6',
	title: 'IPv6 — Neighbor Discovery and Routing',
	description:
		'Watch an IPv6 packet traverse a network using Neighbor Discovery Protocol (NDP) instead of ARP. Unlike IPv4\'s broadcast-based ARP, NDP uses efficient solicited-node multicast to resolve addresses. Observe how the fixed 40-byte header simplifies router processing, and how Hop Limit (IPv6\'s TTL) decrements at each hop.',
	tier: 'client',
	actors: [
		{ id: 'source', label: 'Source Host', icon: 'client', position: 'left' },
		{ id: 'router', label: 'Router', icon: 'router', position: 'center' },
		{ id: 'dest', label: 'Destination', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'slaac',
			label: 'Autoconfigure Address (SLAAC)',
			description:
				'The source host performs Stateless Address Autoconfiguration (SLAAC). It sends a Router Solicitation (ICMPv6 Type 133) and receives a Router Advertisement (ICMPv6 Type 134) containing the /64 network prefix 2001:db8:1::. The host generates its own globally unique address by combining this prefix with its interface identifier (derived from its MAC address via EUI-64 or a random value for privacy). No DHCP server needed.',
			fromActor: 'source',
			toActor: 'source',
			duration: 800,
			highlight: ['Src IP'],
			layers: [
				createEthernetLayer({
					dstMac: '33:33:00:00:00:02',
					srcMac: '00:1A:2B:3C:4D:5E',
					etherType: '0x86DD'
				}),
				createIPv6Layer({
					srcIp: 'fe80::1a2b:3cff:fe4d:5e00',
					dstIp: 'ff02::2',
					nextHeader: 58,
					hopLimit: 255
				})
			]
		},
		{
			id: 'ndp-solicitation',
			label: 'Neighbor Solicitation (NDP)',
			description:
				'Before sending data, the source must resolve the router\'s IPv6 address to a MAC address. Instead of IPv4\'s ARP broadcast to FF:FF:FF:FF:FF:FF, IPv6 uses NDP Neighbor Solicitation (ICMPv6 Type 135) sent to the solicited-node multicast address ff02::1:ff00:1 — only the target and a handful of other nodes process this packet, not the entire network. This is dramatically more efficient than ARP broadcasts.',
			fromActor: 'source',
			toActor: 'router',
			duration: 600,
			highlight: ['Dst IP', 'Dst MAC'],
			layers: [
				createEthernetLayer({
					dstMac: '33:33:FF:00:00:01',
					srcMac: '00:1A:2B:3C:4D:5E',
					etherType: '0x86DD'
				}),
				createIPv6Layer({
					srcIp: '2001:db8:1::a1f2',
					dstIp: 'ff02::1:ff00:1',
					nextHeader: 58,
					hopLimit: 255
				})
			]
		},
		{
			id: 'ndp-advertisement',
			label: 'Neighbor Advertisement (reply)',
			description:
				'The router responds with a Neighbor Advertisement (ICMPv6 Type 136) containing its link-layer MAC address. The source now caches this mapping in its Neighbor Cache (IPv6\'s equivalent of the ARP cache). The Solicited flag is set, indicating this is a direct response. Unlike ARP\'s simple request/reply, NDP also supports Duplicate Address Detection (DAD) and Router Redirect.',
			fromActor: 'router',
			toActor: 'source',
			duration: 600,
			highlight: ['Src IP', 'Src MAC'],
			layers: [
				createEthernetLayer({
					dstMac: '00:1A:2B:3C:4D:5E',
					srcMac: 'CC:DD:EE:FF:00:01',
					etherType: '0x86DD'
				}),
				createIPv6Layer({
					srcIp: '2001:db8:1::1',
					dstIp: '2001:db8:1::a1f2',
					nextHeader: 58,
					hopLimit: 255
				})
			]
		},
		{
			id: 'send-packet',
			label: 'Send IPv6 Packet to Router',
			description:
				'The source constructs an IPv6 packet with Hop Limit=64 and sends it to the router. The destination 2001:db8:2::80 is outside the local /64 prefix, so the packet must be routed. Notice the IPv6 header is a fixed 40 bytes — no variable-length options, no header checksum. The EtherType 0x86DD identifies IPv6 (vs 0x0800 for IPv4). The Next Header field value 6 indicates TCP payload.',
			fromActor: 'source',
			toActor: 'router',
			duration: 600,
			highlight: ['Hop Limit', 'Dst IP', 'Next Header'],
			layers: [
				createEthernetLayer({
					dstMac: 'CC:DD:EE:FF:00:01',
					srcMac: '00:1A:2B:3C:4D:5E',
					etherType: '0x86DD'
				}),
				createIPv6Layer({
					srcIp: '2001:db8:1::a1f2',
					dstIp: '2001:db8:2::80',
					nextHeader: 6,
					hopLimit: 64
				})
			]
		},
		{
			id: 'router-process',
			label: 'Router Processes (Hop Limit 63)',
			description:
				'The router examines the IPv6 header. Unlike IPv4, there is no header checksum to recalculate — this was removed by design since upper layers (TCP, UDP) already have checksums. The router decrements Hop Limit from 64 to 63 (equivalent to IPv4\'s TTL). If Hop Limit reached 0, the router would send an ICMPv6 Time Exceeded message. It consults the routing table for 2001:db8:2::/64 and determines the outbound interface.',
			fromActor: 'router',
			toActor: 'router',
			duration: 800,
			highlight: ['Hop Limit'],
			layers: [
				createEthernetLayer({
					dstMac: 'CC:DD:EE:FF:00:01',
					srcMac: '00:1A:2B:3C:4D:5E',
					etherType: '0x86DD'
				}),
				createIPv6Layer({
					srcIp: '2001:db8:1::a1f2',
					dstIp: '2001:db8:2::80',
					nextHeader: 6,
					hopLimit: 63
				})
			]
		},
		{
			id: 'router-forward',
			label: 'Forward with New MACs',
			description:
				'The router re-encapsulates the IPv6 packet in a new Ethernet frame for the destination\'s network segment. Just like IPv4 routing: the IPv6 addresses stay constant end-to-end, but the Ethernet MACs change at every hop. The router\'s outbound MAC becomes the new source, and the destination\'s MAC (resolved via NDP on that segment) becomes the new destination. No fragmentation by routers — IPv6 requires the source to use Path MTU Discovery.',
			fromActor: 'router',
			toActor: 'dest',
			duration: 600,
			highlight: ['Src MAC', 'Dst MAC', 'Src IP', 'Dst IP'],
			layers: [
				createEthernetLayer({
					dstMac: 'DD:EE:FF:00:11:22',
					srcMac: 'EE:FF:00:11:22:33',
					etherType: '0x86DD'
				}),
				createIPv6Layer({
					srcIp: '2001:db8:1::a1f2',
					dstIp: '2001:db8:2::80',
					nextHeader: 6,
					hopLimit: 63
				})
			]
		},
		{
			id: 'dest-response',
			label: 'Destination Responds',
			description:
				'The destination receives the packet and verifies the Dst IP matches its own address. The Next Header value 6 indicates TCP, so the payload is passed up to the TCP stack. The response packet swaps source and destination IPv6 addresses, resets Hop Limit to 64, and traverses the reverse path. The 128-bit addresses ensure globally unique end-to-end addressing — no NAT translation tables anywhere in the path.',
			fromActor: 'dest',
			toActor: 'router',
			duration: 600,
			highlight: ['Src IP', 'Dst IP', 'Hop Limit'],
			layers: [
				createEthernetLayer({
					dstMac: 'EE:FF:00:11:22:33',
					srcMac: 'DD:EE:FF:00:11:22',
					etherType: '0x86DD'
				}),
				createIPv6Layer({
					srcIp: '2001:db8:2::80',
					dstIp: '2001:db8:1::a1f2',
					nextHeader: 6,
					hopLimit: 64
				})
			]
		}
	]
};
