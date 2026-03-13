import type { ProtocolLayer } from '../types';

export function createNTPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'NTP Packet',
		abbreviation: 'NTP',
		osiLayer: 7,
		color: '#F97316',
		headerFields: [
			{
				name: 'LI/VN/Mode',
				bits: 8,
				value: overrides?.flags ?? '0x23',
				editable: false,
				description:
					'Leap Indicator (2 bits), Version Number (3 bits), Mode (3 bits: 3=client, 4=server)'
			},
			{
				name: 'Stratum',
				bits: 8,
				value: overrides?.stratum ?? 0,
				editable: false,
				description:
					'Clock stratum — 0=unspecified, 1=primary (atomic/GPS), 2-15=secondary references'
			},
			{
				name: 'Poll',
				bits: 8,
				value: overrides?.poll ?? 6,
				editable: false,
				description:
					'Poll interval as log2 seconds — 6 means poll every 64 seconds'
			},
			{
				name: 'Precision',
				bits: 8,
				value: overrides?.precision ?? '-20',
				editable: false,
				description:
					'Clock precision as log2 seconds — -20 is approximately 1 microsecond'
			},
			{
				name: 'Reference ID',
				bits: 32,
				value: overrides?.refId ?? '',
				editable: false,
				description:
					'Identifies the time source — "GPS", "ATOM", or IP address of upstream server'
			},
			{
				name: 'Timestamps',
				bits: 0,
				value: overrides?.timestamps ?? '',
				editable: false,
				description:
					'Four 64-bit timestamps: Reference, Origin (T1), Receive (T2), Transmit (T3)'
			}
		]
	};
}
