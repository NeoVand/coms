import type { ProtocolLayer } from '../types';

export function createTLSRecordLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'TLS Record',
		abbreviation: 'TLS',
		osiLayer: 5,
		color: '#FACC15',
		headerFields: [
			{
				name: 'Content Type',
				bits: 8,
				value: overrides?.contentType ?? 'Handshake (22)',
				editable: false,
				description: 'Record type — Handshake (22), Application Data (23), Alert (21), Change Cipher Spec (20)'
			},
			{
				name: 'Version',
				bits: 16,
				value: overrides?.version ?? 'TLS 1.3',
				editable: false,
				description: 'Protocol version — TLS 1.3 (0x0303 on the wire for compatibility)'
			},
			{
				name: 'Length',
				bits: 16,
				value: overrides?.length ?? 512,
				editable: false,
				description: 'Length of the encrypted payload in bytes'
			},
			{
				name: 'Handshake Type',
				bits: 8,
				value: overrides?.handshakeType ?? 'ClientHello',
				editable: false,
				description: 'Type of handshake message — ClientHello, ServerHello, Certificate, Finished'
			},
			{
				name: 'Cipher Suite',
				bits: 16,
				value: overrides?.cipherSuite ?? 'AES-256-GCM',
				editable: false,
				description: 'Negotiated cipher suite for symmetric encryption'
			},
			{
				name: 'Extensions',
				bits: 0,
				value: overrides?.extensions ?? 'SNI, key_share, supported_versions',
				editable: false,
				description: 'TLS extensions — Server Name Indication, key shares, supported protocol versions'
			}
		]
	};
}
