import type { ProtocolLayer } from '../types';

export function createARPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'ARP Message',
		abbreviation: 'ARP',
		osiLayer: 2,
		color: '#F472B6',
		headerFields: [
			{
				name: 'Hardware Type',
				bits: 16,
				value: overrides?.hwType ?? '1 (Ethernet)',
				editable: false,
				description: 'Link layer type — 1 for Ethernet, 6 for IEEE 802'
			},
			{
				name: 'Protocol Type',
				bits: 16,
				value: overrides?.protoType ?? '0x0800 (IPv4)',
				editable: false,
				description: 'Network protocol being resolved — 0x0800 for IPv4'
			},
			{
				name: 'HW Addr Len',
				bits: 8,
				value: overrides?.hwLen ?? 6,
				editable: false,
				description: 'Hardware address length — 6 bytes for MAC addresses'
			},
			{
				name: 'Proto Addr Len',
				bits: 8,
				value: overrides?.protoLen ?? 4,
				editable: false,
				description: 'Protocol address length — 4 bytes for IPv4 addresses'
			},
			{
				name: 'Operation',
				bits: 16,
				value: overrides?.operation ?? '1 (Request)',
				editable: false,
				description: 'ARP operation — 1 = Request, 2 = Reply',
				color: '#F472B6'
			},
			{
				name: 'Sender MAC',
				bits: 48,
				value: overrides?.senderMac ?? '00:1A:2B:3C:4D:5E',
				editable: false,
				description: 'MAC address of the device sending this ARP message'
			},
			{
				name: 'Sender IP',
				bits: 32,
				value: overrides?.senderIp ?? '192.168.1.100',
				editable: true,
				description: 'IP address of the sender'
			},
			{
				name: 'Target MAC',
				bits: 48,
				value: overrides?.targetMac ?? '00:00:00:00:00:00',
				editable: false,
				description:
					'MAC address of the target — all zeros in requests (unknown)'
			},
			{
				name: 'Target IP',
				bits: 32,
				value: overrides?.targetIp ?? '192.168.1.50',
				editable: true,
				description: 'IP address being resolved'
			}
		]
	};
}
