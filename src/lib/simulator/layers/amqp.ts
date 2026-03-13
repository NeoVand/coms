import type { ProtocolLayer } from '../types';

export function createAMQPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'AMQP Frame',
		abbreviation: 'AMQP',
		osiLayer: 7,
		color: '#FF6600',
		headerFields: [
			{
				name: 'Frame Type',
				bits: 8,
				value: overrides?.frameType ?? 'Method (1)',
				editable: false,
				description:
					'AMQP frame type — 1=Method, 2=Content Header, 3=Content Body, 8=Heartbeat'
			},
			{
				name: 'Channel',
				bits: 16,
				value: overrides?.channel ?? 0,
				editable: false,
				description:
					'Channel number — 0 for connection-level, 1+ for application channels'
			},
			{
				name: 'Class.Method',
				bits: 0,
				value: overrides?.method ?? 'Connection.Start',
				editable: false,
				description:
					'AMQP class and method — Connection.Start, Channel.Open, Basic.Publish, etc.'
			},
			{
				name: 'Payload Size',
				bits: 32,
				value: overrides?.payloadSize ?? 128,
				editable: false,
				description:
					'Size of the method arguments or content body in bytes'
			},
			{
				name: 'Properties',
				bits: 0,
				value: overrides?.properties ?? '',
				editable: false,
				description:
					'Message properties — content-type, delivery-mode, correlation-id, headers'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description: 'Method arguments or message body content'
			}
		]
	};
}
