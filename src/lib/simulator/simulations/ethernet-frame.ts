import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createARPLayer } from '../layers/arp';

export const ethernetFrame: SimulationConfig = {
	protocolId: 'ethernet',
	title: 'Ethernet — Frame Switching on a LAN',
	description:
		'See how Ethernet frames are constructed, switched by MAC address learning, and delivered on a local area network. The switch builds its forwarding table by observing source MACs, floods unknown destinations, and unicasts once the mapping is learned.',
	tier: 'client',
	actors: [
		{ id: 'host-a', label: 'Host A', icon: 'client', position: 'left' },
		{ id: 'switch', label: 'Switch', icon: 'router', position: 'center' },
		{ id: 'host-b', label: 'Host B', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'arp-request',
			label: 'ARP Request (broadcast)',
			description:
				'Host A needs to send data to 192.168.1.50 but only knows the IP — not the MAC address. It broadcasts an ARP Request to the special destination FF:FF:FF:FF:FF:FF, which means every device on the LAN will receive it. The EtherType 0x0806 tells the switch this is an ARP frame, not regular IP traffic.',
			fromActor: 'host-a',
			toActor: 'switch',
			duration: 800,
			highlight: ['Dst MAC', 'Operation', 'Target IP'],
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
			id: 'arp-flood',
			label: 'Switch Floods ARP',
			description:
				'The switch receives the broadcast frame and records that MAC 00:1A:2B:3C:4D:5E is reachable on port 1 — this is MAC address learning. Since the destination is the broadcast address, the switch floods the frame out all ports except the one it arrived on. Every connected host will see this ARP Request.',
			fromActor: 'switch',
			toActor: 'host-b',
			duration: 800,
			highlight: ['Dst MAC', 'Sender MAC'],
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
				'Host B recognizes its own IP (192.168.1.50) in the ARP Request and sends a unicast ARP Reply directly to Host A\'s MAC. The reply contains Host B\'s MAC address AA:BB:CC:DD:EE:FF, which is the information Host A was looking for. This is unicast — only the requesting host receives it.',
			fromActor: 'host-b',
			toActor: 'host-a',
			duration: 800,
			highlight: ['Dst MAC', 'Operation', 'Sender MAC'],
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
			label: 'Data Frame (Host A → Switch)',
			description:
				'Now that Host A knows Host B\'s MAC, it constructs a proper Ethernet frame with the correct destination MAC AA:BB:CC:DD:EE:FF. The EtherType reverts to 0x0800 (IPv4) since this is a regular data packet. The IP payload is encapsulated inside the Ethernet frame — this is Layer 2 encapsulation of a Layer 3 packet.',
			fromActor: 'host-a',
			toActor: 'switch',
			duration: 600,
			highlight: ['Dst MAC', 'Src MAC'],
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
			id: 'switch-forward',
			label: 'Switch Forwards to Host B',
			description:
				'The switch looks up destination MAC AA:BB:CC:DD:EE:FF in its forwarding table and finds a match — it learned this MAC when Host B sent the ARP Reply. Instead of flooding, the switch forwards the frame only to Host B\'s port. This is the efficiency of a switch over a hub: unicast traffic stays on the relevant port.',
			fromActor: 'switch',
			toActor: 'host-b',
			duration: 600,
			highlight: ['Dst MAC'],
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
			id: 'response-frame',
			label: 'Response Frame (Host B → Switch)',
			description:
				'Host B processes the received data and sends a response back. The Ethernet frame has swapped source and destination MACs — Host B\'s MAC is now the source, Host A\'s MAC is the destination. The switch already has both MACs in its forwarding table, so this frame will be switched efficiently.',
			fromActor: 'host-b',
			toActor: 'switch',
			duration: 600,
			highlight: ['Dst MAC', 'Src MAC'],
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
		},
		{
			id: 'response-forward',
			label: 'Switch Forwards to Host A',
			description:
				'The switch forwards the response directly to Host A\'s port using its learned MAC table entry. Both directions are now fully learned — no more flooding is needed for traffic between these two hosts. The forwarding table entries will age out after a timeout (typically 300 seconds) if no traffic is seen.',
			fromActor: 'switch',
			toActor: 'host-a',
			duration: 600,
			highlight: ['Dst MAC'],
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
