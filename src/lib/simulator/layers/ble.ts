import type { ProtocolLayer } from '../types';

/** BLE Link-Layer PDU (LE 1M / 2M uncoded). */
export function createBLELinkLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'BLE Link Layer',
		abbreviation: 'LL',
		osiLayer: 2,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Preamble',
				bits: 8,
				value: '0xAA',
				editable: false,
				description: 'Alternating bit pattern (0xAA on LE 1M) for receiver clock recovery'
			},
			{
				name: 'Access Address',
				bits: 32,
				value: overrides?.accessAddress ?? '0x8E89BED6',
				editable: false,
				description:
					'0x8E89BED6 for advertising channels; cryptographically random per-connection for data channels'
			},
			{
				name: 'LL Header',
				bits: 16,
				value: overrides?.llHeader ?? 'PDU=ADV_IND, len=22',
				editable: false,
				description:
					'PDU type + RFU + TxAdd + RxAdd + length on advertising; LLID/NESN/SN/MD on data'
			},
			{
				name: 'PDU Body',
				bits: 0,
				value: overrides?.body ?? 'AdvA + AdvData',
				editable: false,
				description: 'Type-specific body — ADV_IND carries AdvA + AdvData; data PDUs carry L2CAP'
			},
			{
				name: 'CRC',
				bits: 24,
				value: '0x4FAB12',
				editable: false,
				description: 'CRC-24, seeded by the Access Address; covers the LL header and payload'
			}
		]
	};
}

/** L2CAP framing (BLE side). */
export function createL2CAPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'L2CAP',
		abbreviation: 'L2CAP',
		osiLayer: 4,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Length',
				bits: 16,
				value: overrides?.length ?? 7,
				editable: false,
				description: 'Length of the L2CAP payload in bytes (excluding this 4-byte header)'
			},
			{
				name: 'CID',
				bits: 16,
				value: overrides?.cid ?? '0x0004 (ATT)',
				editable: false,
				description: 'Channel ID — 0x0004=ATT, 0x0005=LE Signaling, 0x0006=SMP, 0x0007=Security'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? 'ATT PDU',
				editable: false,
				description: 'CID-specific protocol payload — ATT, SMP, or signaling commands'
			}
		]
	};
}

/** ATT / GATT PDU. */
export function createATTLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'ATT (GATT)',
		abbreviation: 'ATT',
		osiLayer: 7,
		color: '#F59E0B',
		headerFields: [
			{
				name: 'Opcode',
				bits: 8,
				value: overrides?.opcode ?? '0x1B (Handle Value Notification)',
				editable: false,
				description:
					'ATT operation code — 0x0A=Read Request, 0x0B=Read Response, 0x12=Write Request, 0x1B=Notify, 0x1D=Indicate'
			},
			{
				name: 'Handle',
				bits: 16,
				value: overrides?.handle ?? '0x002A',
				editable: false,
				description:
					'Attribute handle — the address of a characteristic or descriptor in the GATT database'
			},
			{
				name: 'Value',
				bits: 0,
				value: overrides?.value ?? '01 48 00 (flags=0x01, HR=72 bpm)',
				editable: false,
				description: 'Characteristic value — format depends on the characteristic UUID'
			}
		]
	};
}
