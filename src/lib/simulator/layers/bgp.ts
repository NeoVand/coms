import type { ProtocolLayer, HeaderField } from '../types';

/** BGP message. The common header is only Marker/Length/Type (19 bytes);
 *  Version, My AS, Hold Time, and BGP Identifier are OPEN-body fields —
 *  KEEPALIVE and UPDATE messages carry none of them. */
export function createBGPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	const type = String(overrides?.type ?? 'OPEN (1)');
	const isOpen = type.startsWith('OPEN');

	const header: HeaderField[] = [
		{
			name: 'Marker',
			bits: 128,
			value: overrides?.marker ?? '0xFF…FF (all ones)',
			editable: false,
			description: 'Sync marker — 16 bytes of all 1s (legacy; retained for synchronization)'
		},
		{
			name: 'Length',
			bits: 16,
			value: overrides?.length ?? 29,
			editable: false,
			description: 'Total message length in bytes (19–4096). Minimum 19 = header only (KEEPALIVE)'
		},
		{
			name: 'Type',
			bits: 8,
			value: type,
			editable: false,
			description: 'Message type — OPEN (1), UPDATE (2), NOTIFICATION (3), KEEPALIVE (4)',
			color: '#DC2626'
		}
	];

	const openBody: HeaderField[] = [
		{
			name: 'Version',
			bits: 8,
			value: 4,
			editable: false,
			description: 'BGP version — 4 since 1994 (RFC 1771 / RFC 4271)'
		},
		{
			name: 'My AS',
			bits: 16,
			value: overrides?.asNumber ?? 'AS 65001',
			editable: false,
			description:
				"Sender's Autonomous System number (32-bit ASNs use AS_TRANS 23456 here + a capability)"
		},
		{
			name: 'Hold Time',
			bits: 16,
			value: overrides?.holdTime ?? 90,
			editable: false,
			description:
				'Proposed hold timer in seconds — peer is declared dead if no message arrives within it'
		},
		{
			name: 'BGP Identifier',
			bits: 32,
			value: overrides?.bgpId ?? '10.0.0.1',
			editable: false,
			description: "Router ID — the sender's 32-bit BGP identifier"
		}
	];

	return {
		name: isOpen ? 'BGP OPEN' : 'BGP Message',
		abbreviation: 'BGP',
		osiLayer: 7,
		color: '#DC2626',
		headerFields: [
			...header,
			...(isOpen ? openBody : []),
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description: isOpen
					? 'Optional Parameters — capabilities (multiprotocol, 4-byte ASN, graceful restart…)'
					: 'Type-specific data — withdrawn routes, path attributes, and NLRI prefixes'
			}
		]
	};
}
