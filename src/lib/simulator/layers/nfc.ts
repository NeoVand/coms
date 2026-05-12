import type { ProtocolLayer } from '../types';

/** ISO 14443-3 Type A frame (REQA / WUPA / SEL/NVB / ATQA / SAK / RATS / ATS / READ). */
export function createNFCALayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'ISO 14443-3 Type A',
		abbreviation: 'NFC-A',
		osiLayer: 2,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Carrier',
				bits: 0,
				value: '13.56 MHz, 100% ASK modified-Miller (reader→card) / OOK Manchester on 847.5 kHz subcarrier (card→reader)',
				editable: false,
				description: 'NFC-A physical layer — the same since ISO 14443-3 was published in 2000'
			},
			{
				name: 'Frame',
				bits: 0,
				value: overrides?.frame ?? 'REQA (7-bit short frame, 0x26)',
				editable: false,
				description:
					'14443-3 frame: short (7 bits, no parity, no CRC), standard (anti-collision, BCC, no CRC), or full (length-prefixed with CRC_A)'
			},
			{
				name: 'Direction',
				bits: 0,
				value: overrides?.direction ?? 'PCD → PICC',
				editable: false,
				description: 'PCD (Proximity Coupling Device, the reader) → PICC (Proximity Integrated Circuit Card, the tag)'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '0x26',
				editable: false,
				description: 'Frame-specific payload — REQA=0x26, WUPA=0x52, SEL=0x93/0x95/0x97, HLTA=0x50 0x00, etc.'
			},
			{
				name: 'CRC_A',
				bits: 16,
				value: overrides?.crc ?? '(none — short frame)',
				editable: false,
				description: 'CRC_A polynomial 0x8408, appended to standard and full frames; absent on short frames'
			}
		]
	};
}

/** NDEF record header — used in tag reads (T2T/T4T) and Connection Handover payloads. */
export function createNDEFLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'NDEF Record',
		abbreviation: 'NDEF',
		osiLayer: 6,
		color: '#F59E0B',
		headerFields: [
			{
				name: 'Header byte',
				bits: 8,
				value: overrides?.header ?? 'MB=1 ME=1 SR=1 IL=0 TNF=1 (Well-Known)',
				editable: false,
				description:
					'MB/ME=message begin/end, CF=chunk flag, SR=short record (payload-length is 1 byte vs 4), IL=ID-length present, TNF=type-name-format (1=Well-Known, 2=MIME, 3=Absolute URI, 4=External)'
			},
			{
				name: 'Type Length',
				bits: 8,
				value: overrides?.typeLen ?? 1,
				editable: false,
				description: 'Length of the TYPE field, in bytes'
			},
			{
				name: 'Payload Length',
				bits: 8,
				value: overrides?.payloadLen ?? 15,
				editable: false,
				description: '1 byte if SR=1 (short record), 4 bytes big-endian if SR=0'
			},
			{
				name: 'Type',
				bits: 8,
				value: overrides?.type ?? "'U' (URI Record)",
				editable: false,
				description:
					"Well-Known short codes: 'U'=URI, 'T'=Text, 'Sp'=Smart Poster, 'Hr'=Connection Handover Request, 'Hs'=Handover Select, 'Hc'=Handover Carrier"
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '0x03 example.com/info',
				editable: false,
				description:
					"For a URI record: first byte is the prefix code (0x01=http://www., 0x02=https://www., 0x03=http://, 0x04=https://, 0x05=tel:, 0x06=mailto:); remainder is the URI body"
			}
		]
	};
}

/** ISO 7816-4 APDU — the command/response unit used by EMV, eMRTDs, Aliro, CCC Digital Key. */
export function createAPDULayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'ISO 7816-4 APDU',
		abbreviation: 'APDU',
		osiLayer: 7,
		color: '#F59E0B',
		headerFields: [
			{
				name: 'CLA INS P1 P2',
				bits: 32,
				value: overrides?.header ?? '00 A4 04 00',
				editable: false,
				description:
					'4-byte command header: CLA class byte, INS instruction (A4=SELECT, B0=READ BINARY, AE=GENERATE AC, 88=INTERNAL AUTHENTICATE), P1+P2 parameters'
			},
			{
				name: 'Lc',
				bits: 8,
				value: overrides?.lc ?? '0E',
				editable: false,
				description: 'Length of command data (1 byte short / 3 bytes extended). Omitted if no data.'
			},
			{
				name: 'Data',
				bits: 0,
				value: overrides?.data ?? "32 50 41 59 2E 53 59 53 2E 44 44 46 30 31  (PPSE AID '2PAY.SYS.DDF01')",
				editable: false,
				description: 'Command body — for SELECT, the AID being selected; for GENERATE AC, the CDOL1 data'
			},
			{
				name: 'Le',
				bits: 8,
				value: overrides?.le ?? '00',
				editable: false,
				description: 'Expected response length. 0x00 means "up to 256 bytes". Absent means 0.'
			},
			{
				name: 'Response Data / SW1 SW2',
				bits: 16,
				value: overrides?.response ?? '... 90 00 (OK)',
				editable: false,
				description:
					'Response APDU: data + 2-byte status word. 9000=OK, 6982=security status not satisfied, 6985=conditions not satisfied, 6A82=file not found, 6300=warning'
			}
		]
	};
}
