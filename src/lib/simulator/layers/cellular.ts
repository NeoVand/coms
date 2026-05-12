import type { ProtocolLayer } from '../types';

/** NAS-5GS message (UE ↔ AMF mobility/session signalling). */
export function createNASLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'NAS-5GS',
		abbreviation: 'NAS',
		osiLayer: 7,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Security Header',
				bits: 4,
				value: overrides?.secHdr ?? '0 (plain)',
				editable: false,
				description:
					'0 = plain NAS, 1 = integrity-protected, 2 = integrity + ciphered, 3 = SMC, 4 = SMC complete'
			},
			{
				name: 'Procedure Discriminator',
				bits: 4,
				value: '0x7E (5GMM)',
				editable: false,
				description: '0x7E = 5G Mobility Management, 0x2E = 5G Session Management'
			},
			{
				name: 'Message Type',
				bits: 8,
				value: overrides?.msgType ?? '0x41 (Registration Request)',
				editable: false,
				description:
					'0x41 Reg Req, 0x42 Reg Accept, 0x43 Reg Complete, 0x56 Auth Req, 0x57 Auth Resp, 0x5D Security Mode Cmd, 0xC1 PDU Session Est Req'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? 'SUCI + Requested NSSAI + UE security capabilities',
				editable: false,
				description: 'Message-type-specific information elements (NAS IEs)'
			}
		]
	};
}

/** NGAP message — control-plane between gNB and AMF, carried on SCTP/38412. */
export function createNGAPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'NGAP',
		abbreviation: 'NGAP',
		osiLayer: 7,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Procedure Code',
				bits: 8,
				value: overrides?.procCode ?? '15 (Initial UE Message)',
				editable: false,
				description:
					'15 = Initial UE Message, 4 = Downlink NAS Transport, 29 = Initial Context Setup, 0 = PDU Session Resource Setup'
			},
			{
				name: 'AMF-UE-NGAP-ID',
				bits: 40,
				value: overrides?.amfId ?? '0x00000000FF',
				editable: false,
				description: 'AMF-assigned UE identifier (40-bit) — set after the first response'
			},
			{
				name: 'RAN-UE-NGAP-ID',
				bits: 32,
				value: overrides?.ranId ?? '0x00003039',
				editable: false,
				description: 'gNB-assigned UE identifier (32-bit) — local to the gNB'
			},
			{
				name: 'NAS-PDU',
				bits: 0,
				value: overrides?.nasPdu ?? '<NAS message bytes>',
				editable: false,
				description: 'Nested NAS-5GS message — the actual UE↔AMF dialogue'
			}
		]
	};
}

/** GTP-U user-plane tunnel header (UDP/2152, N3 between gNB and UPF). */
export function createGTPULayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'GTP-U',
		abbreviation: 'GTP-U',
		osiLayer: 4,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Version + PT + Flags',
				bits: 8,
				value: '0x34 (v1, GTP, E=1)',
				editable: false,
				description: 'Version=1, Protocol Type=GTP, E flag set when an Extension Header (PDU Session Container) follows'
			},
			{
				name: 'Message Type',
				bits: 8,
				value: '0xFF (G-PDU)',
				editable: false,
				description: '0xFF = G-PDU (user-plane data); other types carry tunnel management'
			},
			{
				name: 'Length',
				bits: 16,
				value: overrides?.length ?? 1380,
				editable: false,
				description: 'Length of the GTP-U payload + extension headers, excluding the 8-byte mandatory header'
			},
			{
				name: 'TEID',
				bits: 32,
				value: overrides?.teid ?? '0xC0FFEE01',
				editable: false,
				description: 'Tunnel Endpoint Identifier — identifies which PDU session this packet belongs to'
			},
			{
				name: 'PDU Session Container',
				bits: 0,
				value: overrides?.qfi ?? 'QFI=9 (QoS flow)',
				editable: false,
				description: 'Extension header carrying the QoS Flow Identifier; maps to the DRB on the air interface'
			},
			{
				name: 'Inner IP Packet',
				bits: 0,
				value: overrides?.inner ?? 'IPv6 src=UE dst=internet — TCP/UDP/QUIC payload',
				editable: false,
				description: "The UE's actual IP packet — what an application sees as 'the internet connection'"
			}
		]
	};
}
