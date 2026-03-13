import type { ProtocolLayer } from '../types';

export function createSTUNLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'STUN Message',
		abbreviation: 'STUN',
		osiLayer: 7,
		color: '#34D399',
		headerFields: [
			{
				name: 'Type',
				bits: 16,
				value: overrides?.type ?? 'Binding Request',
				editable: false,
				description: 'STUN message type — Binding Request/Response for NAT traversal'
			},
			{
				name: 'Length',
				bits: 16,
				value: overrides?.length ?? 24,
				editable: false,
				description: 'Message length in bytes (excluding the 20-byte header)'
			},
			{
				name: 'Magic Cookie',
				bits: 32,
				value: '0x2112A442',
				editable: false,
				description: 'Fixed value 0x2112A442 — identifies this as a STUN message'
			},
			{
				name: 'Transaction ID',
				bits: 96,
				value: overrides?.transactionId ?? '0xA1B2...F3E4',
				editable: false,
				description: 'Random 96-bit ID to match requests with responses'
			},
			{
				name: 'Attribute',
				bits: 0,
				value: overrides?.attribute ?? 'XOR-MAPPED-ADDRESS',
				editable: false,
				description: 'STUN attribute — XOR-MAPPED-ADDRESS reveals the public IP:port as seen by the STUN server'
			}
		]
	};
}
