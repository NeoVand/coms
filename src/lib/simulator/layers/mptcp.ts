import type { ProtocolLayer } from '../types';

export function createMPTCPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'MPTCP Option',
		abbreviation: 'MPTCP',
		osiLayer: 4,
		color: '#0EA5E9',
		headerFields: [
			{
				name: 'Subtype',
				bits: 4,
				value: overrides?.subtype ?? 'MP_CAPABLE (0)',
				editable: false,
				description:
					'MPTCP option subtype — MP_CAPABLE, MP_JOIN, DSS, ADD_ADDR, REMOVE_ADDR'
			},
			{
				name: 'Version',
				bits: 4,
				value: overrides?.version ?? 1,
				editable: false,
				description: 'MPTCP protocol version — 0 (RFC 6824) or 1 (RFC 8684)'
			},
			{
				name: 'Flags',
				bits: 8,
				value: overrides?.flags ?? 'H=1',
				editable: false,
				description:
					'Option flags — H (HMAC-SHA256), A (checksum), B (backup path), etc.'
			},
			{
				name: 'Sender Key',
				bits: 0,
				value: overrides?.senderKey ?? '',
				editable: false,
				description:
					'Sender\'s key — used to derive tokens and authenticate subflow joins'
			},
			{
				name: 'Subflow',
				bits: 0,
				value: overrides?.subflow ?? 'Primary',
				editable: false,
				description:
					'Which TCP subflow this belongs to — Primary (Wi-Fi) or Secondary (Cellular)'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'MPTCP-specific data — keys, tokens, data sequence mapping, address announcements'
			}
		]
	};
}
