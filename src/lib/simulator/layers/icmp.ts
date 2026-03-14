import type { ProtocolLayer } from '../types';

export function createICMPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'ICMP Message',
		abbreviation: 'ICMP',
		osiLayer: 3,
		color: '#0EA5E9',
		headerFields: [
			{
				name: 'Type',
				bits: 8,
				value: overrides?.type ?? 8,
				editable: false,
				description:
					'Message type — 0: Echo Reply, 3: Dest Unreachable, 8: Echo Request, 11: Time Exceeded',
				color: '#0EA5E9'
			},
			{
				name: 'Code',
				bits: 8,
				value: overrides?.code ?? 0,
				editable: false,
				description:
					'Subtype code — for Type 3: 0=Net, 1=Host, 3=Port unreachable'
			},
			{
				name: 'Checksum',
				bits: 16,
				value: overrides?.checksum ?? '0x4D2A',
				editable: false,
				description:
					'Error-checking value covering the entire ICMP message'
			},
			{
				name: 'Identifier',
				bits: 16,
				value: overrides?.identifier ?? '0x1234',
				editable: false,
				description:
					'Identifies the ping session — matches requests to replies'
			},
			{
				name: 'Sequence',
				bits: 16,
				value: overrides?.sequence ?? 1,
				editable: false,
				description:
					'Sequence number — increments with each ping in a session'
			},
			{
				name: 'Data',
				bits: 0,
				value: overrides?.data ?? '',
				editable: false,
				description:
					'Optional payload — ping echoes this back, unreachable includes original IP header'
			}
		]
	};
}
