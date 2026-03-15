import type { ProtocolLayer } from '../types';

export function createWiFiLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: '802.11 Frame',
		abbreviation: 'WiFi',
		osiLayer: 2,
		color: '#F472B6',
		headerFields: [
			{
				name: 'Frame Control',
				bits: 16,
				value: overrides?.frameControl ?? '0x0841',
				editable: false,
				description:
					'Frame type and control bits — Data (0x08), To DS, Protected Frame',
				color: '#F472B6'
			},
			{
				name: 'Duration',
				bits: 16,
				value: overrides?.duration ?? 314,
				editable: false,
				description:
					'NAV duration in microseconds — other stations defer transmission for this period'
			},
			{
				name: 'Addr 1 (RA)',
				bits: 48,
				value: overrides?.addr1 ?? 'AA:BB:CC:DD:EE:FF',
				editable: true,
				description:
					'Receiver Address — the immediate next recipient (usually the access point)'
			},
			{
				name: 'Addr 2 (TA)',
				bits: 48,
				value: overrides?.addr2 ?? '00:1A:2B:3C:4D:5E',
				editable: true,
				description: 'Transmitter Address — the station sending this frame'
			},
			{
				name: 'Addr 3 (DA)',
				bits: 48,
				value: overrides?.addr3 ?? 'CC:DD:EE:FF:00:11',
				editable: true,
				description:
					'Destination Address — the final destination on the network'
			},
			{
				name: 'Seq Control',
				bits: 16,
				value: overrides?.seqControl ?? '0x0010',
				editable: false,
				description:
					'Fragment and sequence number for reassembly and duplicate detection'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '...',
				editable: false,
				description:
					'Encrypted data payload (up to 2304 bytes with WPA2/3 encryption)'
			},
			{
				name: 'FCS',
				bits: 32,
				value: overrides?.fcs ?? '0x7B3A1D0E',
				editable: false,
				description: 'Frame Check Sequence — CRC-32 for error detection'
			}
		]
	};
}
