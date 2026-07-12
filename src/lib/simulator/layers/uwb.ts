import type { ProtocolLayer } from '../types';

/** IEEE 802.15.4z UWB PHY frame — the impulse-radio envelope. */
export function createUWBPHYLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'IEEE 802.15.4z PHY',
		abbreviation: 'UWB',
		osiLayer: 1,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Channel',
				bits: 0,
				value: overrides?.channel ?? 'Ch 9 — 7987.2 MHz, 499.2 MHz BW',
				editable: false,
				description:
					'Channel 9 (7987.2 MHz) is the FiRa-mandatory worldwide channel (incl. Japan); Channel 5 (6489.6 MHz) is not permitted in Japan and overlaps Wi-Fi 6E'
			},
			{
				name: 'Mode',
				bits: 0,
				value: overrides?.mode ?? 'BPRF mean PRF = 62.4 MHz, 6.81 Mbps data rate',
				editable: false,
				description:
					'BPRF (mean PRF 62.4 MHz) for tag-side power; HPRF (124.8/249.6 MHz) for anchor-side processing gain'
			},
			{
				name: 'SHR (Preamble + SFD)',
				bits: 0,
				value: overrides?.shr ?? '64 sync symbols + 8-symbol SFD',
				editable: false,
				description:
					'Synchronisation Header: receiver acquires symbol timing and detects "frame here". First-path-arrival timestamp is taken on the SFD.'
			},
			{
				name: 'PHR',
				bits: 19,
				value: overrides?.phr ?? 'len=12, RFRAME=1, rate=10 (6.81 Mbps)',
				editable: false,
				description:
					'PHY Header: 7-bit frame length, 1-bit ranging-frame flag (RFRAME), 2-bit data rate, 6-bit SECDED parity'
			},
			{
				name: 'PSDU (data field)',
				bits: 0,
				value: overrides?.psdu ?? 'MAC frame: ranging seq, peer addr',
				editable: false,
				description: 'Variable-length data field — carries the MAC frame (MPDU) when present'
			},
			{
				name: 'STS',
				bits: 0,
				value: overrides?.sts ?? '32 chips × AES-128-CTR(STS_KEY, nonce || ctr)',
				editable: false,
				description:
					'Scrambled Timestamp Sequence — cryptographic distance commitment. Pulse positions are determined by an AES-128-CTR keystream; an attacker without the key cannot predict the next chip.'
			},
			{
				name: 'FCS',
				bits: 16,
				value: '0x1234',
				editable: false,
				description:
					'16-bit CRC-16 — the last two octets of the MAC frame inside the PSDU; it does not cover the STS'
			}
		]
	};
}

/** FiRa MAC ranging frame — application-layer ranging session context. */
export function createFiRaLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'FiRa MAC',
		abbreviation: 'FiRa',
		osiLayer: 7,
		color: '#F59E0B',
		headerFields: [
			{
				name: 'Session ID',
				bits: 32,
				value: overrides?.sessionId ?? '0x0001A2B3',
				editable: false,
				description: 'FiRa session identifier — agreed in the BLE OOB handshake before UWB starts'
			},
			{
				name: 'Ranging Round',
				bits: 16,
				value: overrides?.round ?? 0x002a,
				editable: false,
				description:
					'Index of the ranging round within the session — increments per Poll/Response/Final triplet'
			},
			{
				name: 'Frame Type',
				bits: 8,
				value: overrides?.frameType ?? 'Poll (00)',
				editable: false,
				description: 'DS-TWR frame role: 00=Poll, 01=Response, 02=Final, 03=Final Data'
			},
			{
				name: 'Timestamps',
				bits: 0,
				value: overrides?.timestamps ?? 't1 = TX timestamp',
				editable: false,
				description:
					'Poll carries t1 (TX); Response carries t2, t3 (RX of Poll + TX of Response); Final carries t1, t4, t5 — enabling the responder to compute ToF via the DS-TWR cross-product.'
			},
			{
				name: 'Initiator / Responder',
				bits: 16,
				value: overrides?.peer ?? 'Init=0x4321 → Resp=0x1234',
				editable: false,
				description:
					'16-bit short addresses of the initiator and responder for this ranging exchange'
			}
		]
	};
}
