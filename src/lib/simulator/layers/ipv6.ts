import type { ProtocolLayer } from '../types';

export function createIPv6Layer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'IPv6 Packet',
		abbreviation: 'IPv6',
		osiLayer: 3,
		color: '#F472B6',
		headerFields: [
			{
				name: 'Version',
				bits: 4,
				value: 6,
				editable: false,
				description: 'IP version — always 6 for IPv6'
			},
			{
				name: 'Traffic Class',
				bits: 8,
				value: 0,
				editable: false,
				description: 'Traffic class for QoS (equivalent to IPv4 ToS/DSCP)'
			},
			{
				name: 'Flow Label',
				bits: 20,
				value: '0x00000',
				editable: false,
				description: 'Flow label — identifies packets belonging to the same flow for QoS handling'
			},
			{
				name: 'Payload Length',
				bits: 16,
				value: overrides?.payloadLength ?? 40,
				editable: false,
				description: 'Length of the payload in bytes (does not include the 40-byte IPv6 header)'
			},
			{
				name: 'Next Header',
				bits: 8,
				value: overrides?.nextHeader ?? 6,
				editable: false,
				description: 'Identifies the next header — 6 (TCP), 17 (UDP), 58 (ICMPv6), 43 (Routing)'
			},
			{
				name: 'Hop Limit',
				bits: 8,
				value: overrides?.hopLimit ?? 64,
				editable: true,
				description: 'Hop Limit — decremented at each router, packet discarded at 0 (replaces IPv4 TTL)'
			},
			{
				name: 'Src IP',
				bits: 128,
				value: overrides?.srcIp ?? '2001:db8::1',
				editable: true,
				description: 'Source IPv6 address — 128-bit globally unique address'
			},
			{
				name: 'Dst IP',
				bits: 128,
				value: overrides?.dstIp ?? '2001:db8::2',
				editable: true,
				description: 'Destination IPv6 address — 128-bit globally unique address'
			}
		]
	};
}
