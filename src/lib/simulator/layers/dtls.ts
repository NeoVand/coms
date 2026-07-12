import type { ProtocolLayer } from '../types';

/** DTLS record + handshake header. DTLS and STUN/RTP are demultiplexed on the
 *  same UDP port by their first byte (RFC 7983) — DTLS is NOT carried inside STUN. */
export function createDTLSLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'DTLS Record',
		abbreviation: 'DTLS',
		osiLayer: 5,
		color: '#FACC15',
		headerFields: [
			{
				name: 'Content Type',
				bits: 8,
				value: overrides?.contentType ?? 'Handshake (22)',
				editable: false,
				description: 'Record type — Handshake (22), Application Data (23), Alert (21)'
			},
			{
				name: 'Version',
				bits: 16,
				value: overrides?.version ?? 'DTLS 1.2 (0xFEFD)',
				editable: false,
				description: 'Protocol version — DTLS 1.2 is 0xFEFD, DTLS 1.3 is 0xFEFC'
			},
			{
				name: 'Epoch',
				bits: 16,
				value: overrides?.epoch ?? 0,
				editable: false,
				description:
					'Counter incremented on each cipher-state change — orders records across rekeys'
			},
			{
				name: 'Sequence Number',
				bits: 48,
				value: overrides?.sequence ?? 0,
				editable: false,
				description: 'Explicit 48-bit record sequence number (DTLS numbers records on the wire)'
			},
			{
				name: 'Handshake Type',
				bits: 8,
				value: overrides?.handshakeType ?? 'ClientHello (1)',
				editable: false,
				description: 'Handshake message — ClientHello, ServerHello, Certificate, Finished…'
			},
			{
				name: 'Body',
				bits: 0,
				value: overrides?.body ?? '',
				editable: false,
				description: 'Handshake body — cipher suites, key share, certificate, use_srtp extension'
			}
		]
	};
}
