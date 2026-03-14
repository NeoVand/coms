import type { ProtocolLayer } from '../types';

export function createBGPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'BGP Message',
		abbreviation: 'BGP',
		osiLayer: 7,
		color: '#DC2626',
		headerFields: [
			{
				name: 'Marker',
				bits: 128,
				value: overrides?.marker ?? '0xFF…FF (all ones)',
				editable: false,
				description:
					'Sync marker — 16 bytes of all 1s for authentication and synchronization'
			},
			{
				name: 'Length',
				bits: 16,
				value: overrides?.length ?? 29,
				editable: false,
				description:
					'Total message length in bytes (19–4096). Minimum 19 = header only (KEEPALIVE)'
			},
			{
				name: 'Type',
				bits: 8,
				value: overrides?.type ?? 'OPEN (1)',
				editable: false,
				description:
					'Message type — OPEN (1), UPDATE (2), NOTIFICATION (3), KEEPALIVE (4)',
				color: '#DC2626'
			},
			{
				name: 'AS Number',
				bits: 16,
				value: overrides?.asNumber ?? 'AS 65001',
				editable: false,
				description:
					'Autonomous System number — identifies the routing domain'
			},
			{
				name: 'Hold Time',
				bits: 16,
				value: overrides?.holdTime ?? 90,
				editable: false,
				description:
					'Hold timer in seconds — peer is considered dead if no message received within this time'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'Type-specific data — NLRI prefixes, path attributes, error codes'
			}
		]
	};
}
