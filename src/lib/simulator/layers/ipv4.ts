import type { ProtocolLayer } from '../types';

export function createIPv4Layer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'IPv4 Packet',
		abbreviation: 'IP',
		osiLayer: 3,
		color: '#C084FC',
		headerFields: [
			{
				name: 'Version',
				bits: 4,
				value: 4,
				editable: false,
				description: 'IP version — always 4 for IPv4'
			},
			{
				name: 'IHL',
				bits: 4,
				value: 5,
				editable: false,
				description: 'Internet Header Length — number of 32-bit words (5 = 20 bytes, no options)'
			},
			{
				name: 'ToS',
				bits: 8,
				value: 0,
				editable: false,
				description: 'Type of Service — quality of service indicators'
			},
			{
				name: 'Total Length',
				bits: 16,
				value: overrides?.totalLength ?? 60,
				editable: false,
				description: 'Total packet size in bytes (header + data)'
			},
			{
				name: 'ID',
				bits: 16,
				value: overrides?.id ?? 0x1A2B,
				editable: false,
				description: 'Identification — used for reassembling fragmented packets'
			},
			{
				name: 'Flags',
				bits: 3,
				value: '010',
				editable: false,
				description: 'Control flags — bit 1 (DF: Don\'t Fragment) is set'
			},
			{
				name: 'TTL',
				bits: 8,
				value: overrides?.ttl ?? 64,
				editable: true,
				description: 'Time to Live — decremented at each hop, packet discarded at 0'
			},
			{
				name: 'Protocol',
				bits: 8,
				value: overrides?.protocol ?? 6,
				editable: false,
				description: 'Upper-layer protocol — 6 for TCP, 17 for UDP'
			},
			{
				name: 'Checksum',
				bits: 16,
				value: '0xE4F2',
				editable: false,
				description: 'Header checksum — verified at each hop for integrity'
			},
			{
				name: 'Src IP',
				bits: 32,
				value: overrides?.srcIp ?? '192.168.1.100',
				editable: true,
				description: 'Source IP address — the sender'
			},
			{
				name: 'Dst IP',
				bits: 32,
				value: overrides?.dstIp ?? '93.184.216.34',
				editable: true,
				description: 'Destination IP address — the receiver'
			}
		]
	};
}
