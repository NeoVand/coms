import type { ProtocolLayer } from '../types';

export function createRTPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'RTP Packet',
		abbreviation: 'RTP',
		osiLayer: 7,
		color: '#EC4899',
		headerFields: [
			{
				name: 'V/P/X/CC',
				bits: 8,
				value: overrides?.flags ?? '0x80',
				editable: false,
				description:
					'Version (2), Padding (1), Extension (1), CSRC Count (4) — V=2 is current'
			},
			{
				name: 'M/PT',
				bits: 8,
				value: overrides?.payloadType ?? '111 (opus)',
				editable: false,
				description:
					'Marker bit (1) + Payload Type (7) — identifies the codec (e.g. 111=Opus, 96=H.264)'
			},
			{
				name: 'Sequence #',
				bits: 16,
				value: overrides?.seq ?? 1,
				editable: false,
				description:
					'Sequence number — increments per packet, used to detect loss and reorder'
			},
			{
				name: 'Timestamp',
				bits: 32,
				value: overrides?.timestamp ?? 160,
				editable: false,
				description:
					'Media timestamp — reflects sampling instant, used for synchronization and jitter calculation'
			},
			{
				name: 'SSRC',
				bits: 32,
				value: overrides?.ssrc ?? '0x12345678',
				editable: false,
				description:
					'Synchronization Source — uniquely identifies the stream sender within a session'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'Encoded media data — audio samples (Opus, G.711) or video frames (H.264, VP8)'
			}
		]
	};
}
