import type { ProtocolLayer } from '../types';

export function createSTOMPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'STOMP Frame',
		abbreviation: 'STOMP',
		osiLayer: 7,
		color: '#D946EF',
		headerFields: [
			{
				name: 'Command',
				bits: 0,
				value: overrides?.command ?? 'CONNECT',
				editable: false,
				description:
					'STOMP command — CONNECT, CONNECTED, SEND, SUBSCRIBE, MESSAGE, ACK, DISCONNECT'
			},
			{
				name: 'Destination',
				bits: 0,
				value: overrides?.destination ?? '',
				editable: false,
				description:
					'Message destination — queue or topic path (e.g. /queue/orders, /topic/prices)'
			},
			{
				name: 'Content-Type',
				bits: 0,
				value: overrides?.contentType ?? '',
				editable: false,
				description:
					'MIME type of the body — application/json, text/plain, etc.'
			},
			{
				name: 'Receipt',
				bits: 0,
				value: overrides?.receipt ?? '',
				editable: false,
				description:
					'Receipt header — client requests server acknowledgment by including a receipt ID'
			},
			{
				name: 'Subscription',
				bits: 0,
				value: overrides?.subscription ?? '',
				editable: false,
				description:
					'Subscription ID — matches MESSAGE frames back to the SUBSCRIBE that created them'
			},
			{
				name: 'Body',
				bits: 0,
				value: overrides?.body ?? '',
				editable: false,
				description:
					'Frame body — the message payload, terminated by a null character (\\0)'
			}
		]
	};
}
