import type { ProtocolLayer } from '../types';

export function createWebSocketFrameLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'WebSocket Frame',
		abbreviation: 'WS',
		osiLayer: 7,
		color: '#A78BFA',
		headerFields: [
			{
				name: 'FIN',
				bits: 1,
				value: overrides?.fin ?? 1,
				editable: false,
				description: 'Final fragment — 1 means this is the last (or only) frame in a message'
			},
			{
				name: 'Opcode',
				bits: 4,
				value: overrides?.opcode ?? 'Text (0x1)',
				editable: false,
				description: 'Frame type — 0x1 Text, 0x2 Binary, 0x8 Close, 0x9 Ping, 0xA Pong'
			},
			{
				name: 'Mask',
				bits: 1,
				value: overrides?.mask ?? 1,
				editable: false,
				description: 'Masking flag — client→server frames MUST be masked, server→client MUST NOT'
			},
			{
				name: 'Payload Length',
				bits: 7,
				value: overrides?.payloadLength ?? 16,
				editable: false,
				description: 'Payload length — 0-125 inline, 126 = 16-bit extended, 127 = 64-bit extended'
			},
			{
				name: 'Masking Key',
				bits: 32,
				value: overrides?.maskingKey ?? '0x37FA21C8',
				editable: false,
				description: 'Random 32-bit key XORed with payload to prevent proxy cache poisoning'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? 'Hello WebSocket!',
				editable: false,
				description: 'Application data — text (UTF-8) or binary, masked if client-sent'
			}
		]
	};
}
