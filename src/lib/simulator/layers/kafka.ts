import type { ProtocolLayer } from '../types';

export function createKafkaLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'Kafka Message',
		abbreviation: 'Kafka',
		osiLayer: 7,
		color: '#231F20',
		headerFields: [
			{
				name: 'API Key',
				bits: 16,
				value: overrides?.apiKey ?? 'Produce (0)',
				editable: false,
				description:
					'Request type — ApiVersions (18), Metadata (3), Produce (0), Fetch (1), etc.'
			},
			{
				name: 'API Version',
				bits: 16,
				value: overrides?.apiVersion ?? 9,
				editable: false,
				description:
					'Protocol version for this API — allows backward-compatible evolution'
			},
			{
				name: 'Correlation ID',
				bits: 32,
				value: overrides?.correlationId ?? 1,
				editable: false,
				description:
					'Client-assigned ID to match responses to requests across async pipelining'
			},
			{
				name: 'Client ID',
				bits: 0,
				value: overrides?.clientId ?? 'producer-1',
				editable: false,
				description:
					'Identifier for the client application — used in logging and quotas'
			},
			{
				name: 'Topic',
				bits: 0,
				value: overrides?.topic ?? 'orders',
				editable: false,
				description:
					'Topic name — the logical channel that messages are published to and consumed from'
			},
			{
				name: 'Partition',
				bits: 32,
				value: overrides?.partition ?? 0,
				editable: false,
				description:
					'Partition index — topics are split into partitions for parallel processing'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '',
				editable: false,
				description:
					'Message key/value pairs — typically serialized as JSON, Avro, or Protobuf'
			}
		]
	};
}
