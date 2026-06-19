import type { ProtocolLayer } from '../types';

/** WireGuard message header — type, reserved, sender index (handshake) or counter (transport). */
export function createWireGuardLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'WireGuard',
		abbreviation: 'WG',
		osiLayer: 3,
		color: '#2DD4BF',
		headerFields: [
			{
				name: 'Type',
				bits: 8,
				value: overrides?.type ?? '1 (Handshake Init)',
				editable: false,
				description:
					'1 = Handshake Initiation, 2 = Handshake Response, 3 = Cookie Reply, 4 = Transport Data'
			},
			{
				name: 'Reserved',
				bits: 24,
				value: '0x000000',
				editable: false,
				description: 'Zero padding — kept for byte-alignment, unused'
			},
			{
				name: 'Sender Index',
				bits: 32,
				value: overrides?.senderIndex ?? '0xABCD1234',
				editable: false,
				description:
					'Random 32-bit identifier the receiver echoes back; lets peers track parallel handshakes'
			},
			{
				name: 'Receiver Index',
				bits: 32,
				value: overrides?.receiverIndex ?? '0x00000000',
				editable: false,
				description:
					'Echoed back in Handshake Response and Transport Data; zero in the initial handshake'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? 'Ephemeral pub + encrypted static + TAI64N + MAC1 + MAC2',
				editable: false,
				description:
					'Message-type-specific body — handshake fields, cookie, or AEAD-encrypted inner IP packet'
			}
		]
	};
}
