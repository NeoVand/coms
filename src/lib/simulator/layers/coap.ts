import type { ProtocolLayer } from '../types';

export function createCoAPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'CoAP Message',
		abbreviation: 'CoAP',
		osiLayer: 7,
		color: '#78C257',
		headerFields: [
			{
				name: 'Version',
				bits: 2,
				value: overrides?.version ?? 1,
				editable: false,
				description: 'CoAP version number — always 1 in the current specification'
			},
			{
				name: 'Type',
				bits: 2,
				value: overrides?.type ?? 'CON (0)',
				editable: false,
				description:
					'Message type — CON (confirmable), NON (non-confirmable), ACK, RST'
			},
			{
				name: 'Token Len',
				bits: 4,
				value: overrides?.tokenLen ?? 4,
				editable: false,
				description:
					'Length of the Token field in bytes (0-8) — used to match requests and responses'
			},
			{
				name: 'Code',
				bits: 8,
				value: overrides?.code ?? '0.01 GET',
				editable: false,
				description:
					'Method or response code — 0.01 GET, 0.02 POST, 2.05 Content, 2.04 Changed',
				color: '#78C257'
			},
			{
				name: 'Message ID',
				bits: 16,
				value: overrides?.messageId ?? '0x7D34',
				editable: false,
				description:
					'16-bit ID for matching ACKs to CON messages and detecting duplicates'
			},
			{
				name: 'Options',
				bits: 0,
				value: overrides?.options ?? '',
				editable: false,
				description:
					'CoAP options — Uri-Path, Content-Format, Observe, Max-Age, ETag'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'Message payload — typically CBOR or JSON, preceded by 0xFF marker'
			}
		]
	};
}
