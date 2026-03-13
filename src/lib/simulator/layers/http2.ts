import type { ProtocolLayer } from '../types';

export function createHTTP2FrameLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'HTTP/2 Frame',
		abbreviation: 'H2',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Length',
				bits: 24,
				value: overrides?.length ?? 128,
				editable: false,
				description: 'Payload length in bytes (up to 16 MB per frame)'
			},
			{
				name: 'Type',
				bits: 8,
				value: overrides?.type ?? 'HEADERS (0x1)',
				editable: false,
				description: 'Frame type — HEADERS, DATA, SETTINGS, PUSH_PROMISE, PING, GOAWAY, etc.'
			},
			{
				name: 'Flags',
				bits: 8,
				value: overrides?.flags ?? 'END_HEADERS',
				editable: false,
				description: 'Frame flags — END_STREAM, END_HEADERS, PADDED, PRIORITY'
			},
			{
				name: 'Stream ID',
				bits: 31,
				value: overrides?.streamId ?? 1,
				editable: false,
				description: 'Stream identifier — odd for client-initiated, even for server push, 0 for connection'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? ':method: GET',
				editable: false,
				description: 'HPACK-compressed headers or raw data payload'
			}
		]
	};
}
