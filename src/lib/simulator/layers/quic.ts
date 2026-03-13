import type { ProtocolLayer } from '../types';

export function createQUICLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'QUIC Packet',
		abbreviation: 'QUIC',
		osiLayer: 4,
		color: '#22D3EE',
		headerFields: [
			{
				name: 'Header Form',
				bits: 1,
				value: overrides?.headerForm ?? 'Long (1)',
				editable: false,
				description: 'Long header (1) for handshake packets, short header (0) for data'
			},
			{
				name: 'Type',
				bits: 2,
				value: overrides?.type ?? 'Initial',
				editable: false,
				description: 'Packet type — Initial, 0-RTT, Handshake, or Retry'
			},
			{
				name: 'Version',
				bits: 32,
				value: overrides?.version ?? 'QUICv1',
				editable: false,
				description: 'QUIC version — v1 (RFC 9000) or v2 (RFC 9369)'
			},
			{
				name: 'DCID',
				bits: 0,
				value: overrides?.dcid ?? '0xA1B2C3D4',
				editable: false,
				description: 'Destination Connection ID — identifies the recipient'
			},
			{
				name: 'SCID',
				bits: 0,
				value: overrides?.scid ?? '0xE5F60718',
				editable: false,
				description: 'Source Connection ID — identifies the sender (long header only)'
			},
			{
				name: 'Packet Number',
				bits: 32,
				value: overrides?.packetNumber ?? 0,
				editable: false,
				description: 'Packet number — monotonically increasing, used for loss detection'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? 'CRYPTO frame',
				editable: false,
				description: 'Encrypted payload containing QUIC frames (CRYPTO, STREAM, ACK, etc.)'
			}
		]
	};
}
