import type { ProtocolLayer } from '../types';

export function createIKEv2Layer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'IKEv2',
		abbreviation: 'IKEv2',
		osiLayer: 7,
		color: '#2DD4BF',
		headerFields: [
			{
				name: 'Initiator SPI',
				bits: 64,
				value: overrides?.initSpi ?? '0x1122334455667788',
				editable: false,
				description:
					'64-bit Initiator Security Parameters Index — identifies the IKE SA on the initiator'
			},
			{
				name: 'Responder SPI',
				bits: 64,
				value: overrides?.respSpi ?? '0x0000000000000000',
				editable: false,
				description:
					'64-bit Responder SPI — zero until the responder picks one in the first IKE_SA_INIT response'
			},
			{
				name: 'Next Payload',
				bits: 8,
				value: overrides?.nextPayload ?? 'SA (33)',
				editable: false,
				description: 'Type of the first payload — SA, KE, Nonce, IDi, IDr, AUTH, CERT, N, D, etc.'
			},
			{
				name: 'Version',
				bits: 8,
				value: '2.0',
				editable: false,
				description: 'IKE major.minor version — 0x20 for IKEv2'
			},
			{
				name: 'Exchange Type',
				bits: 8,
				value: overrides?.exchangeType ?? 'IKE_SA_INIT (34)',
				editable: false,
				description:
					'34=IKE_SA_INIT, 35=IKE_AUTH, 36=CREATE_CHILD_SA, 37=INFORMATIONAL, 43=IKE_INTERMEDIATE'
			},
			{
				name: 'Flags',
				bits: 8,
				value: overrides?.flags ?? '0x08 (Initiator)',
				editable: false,
				description: 'I=Initiator, V=Version (must be 0), R=Response'
			},
			{
				name: 'Message ID',
				bits: 32,
				value: overrides?.messageId ?? 0,
				editable: false,
				description:
					'Counter that prevents replay; starts at 0 for IKE_SA_INIT and increments per request'
			},
			{
				name: 'Payloads',
				bits: 0,
				value: overrides?.payloads ?? 'SA + KE + Nonce',
				editable: false,
				description: 'Payload chain — each payload has its own header with the type of the next one'
			}
		]
	};
}

export function createESPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'ESP',
		abbreviation: 'ESP',
		osiLayer: 3,
		color: '#2DD4BF',
		headerFields: [
			{
				name: 'SPI',
				bits: 32,
				value: overrides?.spi ?? '0xC0FFEE01',
				editable: false,
				description:
					'Security Parameters Index — receiver looks up the SA (key, cipher) by this value'
			},
			{
				name: 'Sequence Number',
				bits: 32,
				value: overrides?.seq ?? 1,
				editable: false,
				description:
					'Anti-replay counter — receiver maintains a sliding window (default 32, prod tune ≥1024)'
			},
			{
				name: 'IV / Nonce',
				bits: 64,
				value: overrides?.iv ?? '0x4F3D2A1B5E7C8901',
				editable: false,
				description: '8-byte explicit nonce for AES-GCM / ChaCha20-Poly1305 AEAD ciphers'
			},
			{
				name: 'Encrypted Payload',
				bits: 0,
				value: overrides?.payload ?? '<encrypted inner IP packet + ESP trailer>',
				editable: false,
				description:
					'In tunnel mode: the entire inner IP packet plus an ESP trailer (padding + next-header byte)'
			},
			{
				name: 'ICV (Auth Tag)',
				bits: 128,
				value: '0x9A8B7C6D5E4F3A2B 1122334455667788',
				editable: false,
				description: '16-byte AEAD authentication tag — receiver MUST verify before decrypting'
			}
		]
	};
}
