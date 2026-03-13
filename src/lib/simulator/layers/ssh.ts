import type { ProtocolLayer } from '../types';

export function createSSHLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'SSH Packet',
		abbreviation: 'SSH',
		osiLayer: 7,
		color: '#FB923C',
		headerFields: [
			{
				name: 'Packet Length',
				bits: 32,
				value: overrides?.packetLength ?? 256,
				editable: false,
				description: 'Length of the packet payload + padding (excluding length field itself)'
			},
			{
				name: 'Padding Length',
				bits: 8,
				value: overrides?.paddingLength ?? 8,
				editable: false,
				description: 'Random padding added to prevent traffic analysis (4-255 bytes)'
			},
			{
				name: 'Message Type',
				bits: 8,
				value: overrides?.messageType ?? 'KEXINIT (20)',
				editable: false,
				description: 'SSH message type — KEXINIT, KEXDH_INIT, NEWKEYS, SERVICE_REQUEST, USERAUTH_REQUEST, etc.'
			},
			{
				name: 'Algorithm',
				bits: 0,
				value: overrides?.algorithm ?? 'curve25519-sha256',
				editable: false,
				description: 'Key exchange or encryption algorithm in use'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? 'Key exchange data',
				editable: false,
				description: 'Message-specific payload — key exchange parameters, auth credentials, or encrypted data'
			}
		]
	};
}
