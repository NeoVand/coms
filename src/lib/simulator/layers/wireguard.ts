import type { ProtocolLayer, HeaderField } from '../types';

/** WireGuard message header. Handshake messages (type 1/2) carry a Sender Index;
 *  Transport Data (type 4) has no sender index — it is Receiver Index + 64-bit Counter. */
export function createWireGuardLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	const isTransport = overrides?.counter !== undefined;
	const head: HeaderField[] = [
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
		}
	];

	const body: HeaderField[] = isTransport
		? [
				{
					name: 'Receiver Index',
					bits: 32,
					value: overrides?.receiverIndex ?? '0xABCD1234',
					editable: false,
					description: "The peer's session index this data packet is bound to"
				},
				{
					name: 'Counter',
					bits: 64,
					value: overrides?.counter ?? 0,
					editable: false,
					description:
						'Per-packet counter — serves as both the AEAD nonce and the anti-replay sequence'
				}
			]
		: [
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
					description: 'Echoed back in the Handshake Response; zero in the initial handshake'
				}
			];

	return {
		name: 'WireGuard',
		abbreviation: 'WG',
		osiLayer: 3,
		color: '#2DD4BF',
		headerFields: [
			...head,
			...body,
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
