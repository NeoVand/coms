import type { ProtocolLayer } from '../types';

export function createHTTP3FrameLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'HTTP/3 Frame',
		abbreviation: 'H3',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Type',
				bits: 0,
				value: overrides?.type ?? 'HEADERS (0x01)',
				editable: false,
				description:
					'Frame type as a variable-length integer — DATA (0x00), HEADERS (0x01), SETTINGS (0x04), GOAWAY (0x07)…'
			},
			{
				name: 'Length',
				bits: 0,
				value: overrides?.length ?? 64,
				editable: false,
				description:
					'Payload length as a variable-length integer (1–8 bytes). Unlike HTTP/2, HTTP/3 frames carry no flags and no stream ID — stream identity and end-of-stream (FIN) live in the enclosing QUIC STREAM frame'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '…',
				editable: false,
				description:
					'Frame payload — for HEADERS, header fields compressed with QPACK (HPACK’s HTTP/3 successor, redesigned to avoid head-of-line blocking)'
			}
		]
	};
}
