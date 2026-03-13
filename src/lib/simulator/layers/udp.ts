import type { ProtocolLayer } from '../types';

export function createUDPLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'UDP Datagram',
		abbreviation: 'UDP',
		osiLayer: 4,
		color: '#39FF14',
		headerFields: [
			{
				name: 'Src Port',
				bits: 16,
				value: overrides?.srcPort ?? 49152,
				editable: true,
				description: 'Source port — sender\'s port number'
			},
			{
				name: 'Dst Port',
				bits: 16,
				value: overrides?.dstPort ?? 53,
				editable: true,
				description: 'Destination port — the service being contacted (53 = DNS)'
			},
			{
				name: 'Length',
				bits: 16,
				value: overrides?.length ?? 42,
				editable: false,
				description: 'Total length of UDP header + data in bytes'
			},
			{
				name: 'Checksum',
				bits: 16,
				value: '0xC3D4',
				editable: false,
				description: 'Optional checksum — covers header + data + pseudo-header'
			}
		]
	};
}
