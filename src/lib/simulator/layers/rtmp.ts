import type { ProtocolLayer } from '../types';

export function createRTMPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'RTMP Message',
		abbreviation: 'RTMP',
		osiLayer: 7,
		color: '#E11D48',
		headerFields: [
			{
				name: 'Chunk Type',
				bits: 2,
				value: overrides?.chunkType ?? 'Type 0 (full)',
				editable: false,
				description:
					'Chunk header format — Type 0 (12 bytes, full), Type 1-3 (compressed headers)'
			},
			{
				name: 'Chunk Stream ID',
				bits: 6,
				value: overrides?.chunkStreamId ?? 3,
				editable: false,
				description:
					'Multiplexing channel — 2=protocol control, 3+=application messages'
			},
			{
				name: 'Message Type',
				bits: 8,
				value: overrides?.messageType ?? 'Command (20)',
				editable: false,
				description:
					'Message type — Command AMF0 (20), Audio (8), Video (9), Data (18), Control (1-6)'
			},
			{
				name: 'Stream ID',
				bits: 32,
				value: overrides?.streamId ?? 0,
				editable: false,
				description:
					'Message stream ID — 0 for control, 1+ for published streams'
			},
			{
				name: 'Timestamp',
				bits: 32,
				value: overrides?.timestamp ?? 0,
				editable: false,
				description:
					'Message timestamp in milliseconds — used for synchronization and playback timing'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'AMF-encoded command, audio/video data, or metadata'
			}
		]
	};
}
