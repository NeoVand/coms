import type { ProtocolLayer } from '../types';

export function createMQTTLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'MQTT Packet',
		abbreviation: 'MQTT',
		osiLayer: 7,
		color: '#10B981',
		headerFields: [
			{
				name: 'Packet Type',
				bits: 4,
				value: overrides?.packetType ?? 'CONNECT (1)',
				editable: false,
				description: 'MQTT control packet type — CONNECT, CONNACK, PUBLISH, SUBSCRIBE, etc.'
			},
			{
				name: 'Flags',
				bits: 4,
				value: overrides?.flags ?? '0000',
				editable: false,
				description:
					'Type-specific flags — DUP, QoS level, RETAIN for PUBLISH packets'
			},
			{
				name: 'Remaining Len',
				bits: 8,
				value: overrides?.remainingLength ?? 42,
				editable: false,
				description:
					'Remaining bytes after fixed header — variable-length encoding up to 256 MB'
			},
			{
				name: 'Packet ID',
				bits: 16,
				value: overrides?.packetId ?? 1,
				editable: false,
				description:
					'Packet identifier — used by QoS 1/2 and SUBSCRIBE/UNSUBSCRIBE for matching'
			},
			{
				name: 'Topic',
				bits: 0,
				value: overrides?.topic ?? 'sensors/temperature',
				editable: false,
				description:
					'Topic name — hierarchical path using / separators, supports + and # wildcards'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'Message payload — can be any binary data, commonly JSON or plain text'
			}
		]
	};
}
