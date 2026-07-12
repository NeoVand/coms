import type { ProtocolLayer } from '../types';

export function createEthernetLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'Ethernet Frame',
		abbreviation: 'ETH',
		osiLayer: 2,
		color: '#FF9F67',
		headerFields: [
			{
				name: 'Dst MAC',
				bits: 48,
				value: overrides?.dstMac ?? 'A4:91:B1:47:C2:01',
				editable: true,
				description:
					"Destination MAC address — the next hop at Layer 2 (here the default gateway's NIC); frames are re-addressed at every router hop"
			},
			{
				name: 'Src MAC',
				bits: 48,
				value: overrides?.srcMac ?? '00:1A:2B:3C:4D:5E',
				editable: true,
				description: 'Source MAC address — identifies the sending network interface'
			},
			{
				name: 'EtherType',
				bits: 16,
				value: overrides?.etherType ?? '0x0800',
				editable: false,
				description: 'Protocol type — 0x0800 for IPv4, 0x86DD for IPv6'
			},
			{
				name: 'Payload',
				bits: 0,
				value: '...',
				editable: false,
				description: 'The encapsulated IP packet (46-1500 bytes)'
			},
			{
				name: 'FCS',
				bits: 32,
				value: '0x3A2B1C0D',
				editable: false,
				description: 'Frame Check Sequence — CRC-32 for error detection'
			}
		]
	};
}
