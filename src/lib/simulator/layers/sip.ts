import type { ProtocolLayer } from '../types';

export function createSIPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'SIP Message',
		abbreviation: 'SIP',
		osiLayer: 7,
		color: '#14B8A6',
		headerFields: [
			{
				name: 'Method',
				bits: 0,
				value: overrides?.method ?? 'INVITE',
				editable: false,
				description:
					'SIP method — INVITE, ACK, BYE, CANCEL, REGISTER, OPTIONS'
			},
			{
				name: 'Status',
				bits: 0,
				value: overrides?.status ?? '',
				editable: false,
				description:
					'Response status code — 1xx provisional, 2xx success, 3xx redirect, 4xx/5xx error'
			},
			{
				name: 'From',
				bits: 0,
				value: overrides?.from ?? '',
				editable: false,
				description:
					'Caller SIP URI — identifies the initiator of the request (sip:user@domain)'
			},
			{
				name: 'To',
				bits: 0,
				value: overrides?.to ?? '',
				editable: false,
				description:
					'Callee SIP URI — identifies the intended recipient of the request'
			},
			{
				name: 'Call-ID',
				bits: 0,
				value: overrides?.callId ?? '',
				editable: false,
				description:
					'Unique call identifier — groups all messages belonging to the same dialog'
			},
			{
				name: 'Body',
				bits: 0,
				value: overrides?.body ?? '',
				editable: false,
				description:
					'Message body — typically SDP for media negotiation in INVITE/200 OK'
			}
		]
	};
}
