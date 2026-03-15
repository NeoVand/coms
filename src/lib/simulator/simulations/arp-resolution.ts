import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createARPLayer } from '../layers/arp';

export const arpResolution: SimulationConfig = {
	protocolId: 'arp',
	title: 'ARP — Address Resolution',
	description:
		'Watch how ARP bridges the gap between Layer 3 (IP) and Layer 2 (Ethernet). When a host needs to send an IP packet on the local network, it must first resolve the destination IP to a MAC address using a broadcast request and unicast reply, then cache the result for future use.',
	tier: 'client',
	actors: [
		{ id: 'host-a', label: 'Host A (192.168.1.100)', icon: 'client', position: 'left' },
		{ id: 'host-b', label: 'Host B (192.168.1.50)', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'cache-miss',
			label: 'ARP Cache Miss',
			description:
				'Host A has an IP packet destined for 192.168.1.50 but cannot send it yet — it needs a MAC address to construct the Ethernet frame. Host A checks its ARP cache (a table mapping IPs to MACs) and finds no entry for 192.168.1.50. This cache miss triggers the ARP resolution process before the IP packet can be transmitted.',
			fromActor: 'host-a',
			toActor: 'host-a',
			duration: 800,
			highlight: ['Dst IP'],
			layers: [
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '192.168.1.50'
				})
			]
		},
		{
			id: 'arp-request',
			label: 'ARP Request (broadcast)',
			description:
				'Host A broadcasts an ARP Request to the entire LAN segment using the Ethernet broadcast address FF:FF:FF:FF:FF:FF. The request asks "Who has 192.168.1.50? Tell 00:1A:2B:3C:4D:5E." The Target MAC is all zeros because that is exactly what we are trying to discover. Every host on the subnet receives and examines this request.',
			fromActor: 'host-a',
			toActor: 'host-b',
			duration: 800,
			highlight: ['Operation', 'Sender IP', 'Target IP'],
			layers: [
				createEthernetLayer({
					dstMac: 'FF:FF:FF:FF:FF:FF',
					srcMac: '00:1A:2B:3C:4D:5E',
					etherType: '0x0806'
				}),
				createARPLayer({
					operation: '1 (Request)',
					senderMac: '00:1A:2B:3C:4D:5E',
					senderIp: '192.168.1.100',
					targetMac: '00:00:00:00:00:00',
					targetIp: '192.168.1.50'
				})
			]
		},
		{
			id: 'arp-reply',
			label: 'ARP Reply (unicast)',
			description:
				'Host B recognizes its own IP in the Target IP field and responds with a unicast ARP Reply. The reply fills in the missing piece: Sender MAC AA:BB:CC:DD:EE:FF. Notice this is unicast (directly to Host A\'s MAC), not broadcast — only Host A receives the reply. Host B also caches Host A\'s IP-to-MAC mapping from the request, since it will likely need it soon.',
			fromActor: 'host-b',
			toActor: 'host-a',
			duration: 800,
			highlight: ['Operation', 'Sender MAC'],
			layers: [
				createEthernetLayer({
					dstMac: '00:1A:2B:3C:4D:5E',
					srcMac: 'AA:BB:CC:DD:EE:FF',
					etherType: '0x0806'
				}),
				createARPLayer({
					operation: '2 (Reply)',
					senderMac: 'AA:BB:CC:DD:EE:FF',
					senderIp: '192.168.1.50',
					targetMac: '00:1A:2B:3C:4D:5E',
					targetIp: '192.168.1.100'
				})
			]
		},
		{
			id: 'cache-update',
			label: 'ARP Cache Updated',
			description:
				'Host A stores the mapping 192.168.1.50 → AA:BB:CC:DD:EE:FF in its ARP cache. This entry has a timeout (typically 20 minutes on Linux, 2 minutes on Windows) after which it expires and must be re-resolved. The cache prevents repeated broadcasts for the same destination, reducing network overhead significantly.',
			fromActor: 'host-a',
			toActor: 'host-a',
			duration: 800,
			highlight: ['Sender MAC', 'Sender IP'],
			layers: [
				createEthernetLayer({
					dstMac: '00:1A:2B:3C:4D:5E',
					srcMac: 'AA:BB:CC:DD:EE:FF',
					etherType: '0x0806'
				}),
				createARPLayer({
					operation: '2 (Reply)',
					senderMac: 'AA:BB:CC:DD:EE:FF',
					senderIp: '192.168.1.50',
					targetMac: '00:1A:2B:3C:4D:5E',
					targetIp: '192.168.1.100'
				})
			]
		},
		{
			id: 'data-frame',
			label: 'IP Data Frame',
			description:
				'Now Host A can finally send the original IP packet. It constructs an Ethernet frame with the resolved destination MAC AA:BB:CC:DD:EE:FF and encapsulates the IP packet inside. The EtherType is 0x0800 (IPv4), signaling that the Ethernet payload contains an IP packet. This is the frame that was waiting on ARP to complete.',
			fromActor: 'host-a',
			toActor: 'host-b',
			duration: 600,
			highlight: ['Dst MAC', 'Src IP', 'Dst IP'],
			layers: [
				createEthernetLayer({
					dstMac: 'AA:BB:CC:DD:EE:FF',
					srcMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.100',
					dstIp: '192.168.1.50'
				})
			]
		},
		{
			id: 'response',
			label: 'Response (cache hit)',
			description:
				'Host B sends a response back to Host A. This time, no ARP is needed — Host B already cached Host A\'s MAC address when it processed the original ARP Request. This is a cache hit: the Ethernet frame is constructed immediately with the known destination MAC. Bidirectional communication now flows without any ARP overhead.',
			fromActor: 'host-b',
			toActor: 'host-a',
			duration: 600,
			highlight: ['Dst MAC', 'Src IP', 'Dst IP'],
			layers: [
				createEthernetLayer({
					dstMac: '00:1A:2B:3C:4D:5E',
					srcMac: 'AA:BB:CC:DD:EE:FF'
				}),
				createIPv4Layer({
					srcIp: '192.168.1.50',
					dstIp: '192.168.1.100'
				})
			]
		}
	]
};
