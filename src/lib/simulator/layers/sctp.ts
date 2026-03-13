import type { ProtocolLayer } from '../types';

export function createSCTPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'SCTP Packet',
		abbreviation: 'SCTP',
		osiLayer: 4,
		color: '#7C3AED',
		headerFields: [
			{
				name: 'Src Port',
				bits: 16,
				value: overrides?.srcPort ?? 49800,
				editable: false,
				description: 'Source port — identifies the sending application endpoint'
			},
			{
				name: 'Dst Port',
				bits: 16,
				value: overrides?.dstPort ?? 5000,
				editable: false,
				description: 'Destination port — identifies the receiving application endpoint'
			},
			{
				name: 'V-Tag',
				bits: 32,
				value: overrides?.vTag ?? '0x00000000',
				editable: false,
				description:
					'Verification Tag — prevents blind attacks, must match the association\'s tag'
			},
			{
				name: 'Chunk Type',
				bits: 8,
				value: overrides?.chunkType ?? 'INIT (1)',
				editable: false,
				description:
					'Chunk type — INIT, INIT-ACK, COOKIE-ECHO, COOKIE-ACK, DATA, SACK, HEARTBEAT',
				color: '#7C3AED'
			},
			{
				name: 'Chunk Flags',
				bits: 8,
				value: overrides?.chunkFlags ?? '0x00',
				editable: false,
				description: 'Chunk-specific flags — e.g. B/E bits for DATA fragmentation'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'Chunk data — initiation parameters, cookie, or application data'
			}
		]
	};
}
