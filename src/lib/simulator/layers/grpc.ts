import type { ProtocolLayer } from '../types';

export function createGRPCLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'gRPC Message',
		abbreviation: 'gRPC',
		osiLayer: 7,
		color: '#F472B6',
		headerFields: [
			{
				name: 'Compressed',
				bits: 8,
				value: overrides?.compressed ?? 0,
				editable: false,
				description: 'Compression flag — 0 = uncompressed, 1 = compressed with grpc-encoding'
			},
			{
				name: 'Message Length',
				bits: 32,
				value: overrides?.messageLength ?? 48,
				editable: false,
				description: 'Length of the serialized protobuf message in bytes'
			},
			{
				name: 'Service',
				bits: 0,
				value: overrides?.service ?? '/users.UserService',
				editable: false,
				description: 'Fully qualified gRPC service name'
			},
			{
				name: 'Method',
				bits: 0,
				value: overrides?.method ?? 'GetUser',
				editable: false,
				description: 'RPC method name — defines the request/response types'
			},
			{
				name: 'Content-Type',
				bits: 0,
				value: overrides?.contentType ?? 'application/grpc+proto',
				editable: false,
				description: 'Always application/grpc for gRPC, with +proto or +json suffix'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? '{ id: 1 }',
				editable: false,
				description: 'Protocol Buffer encoded message (serialized binary, shown as pseudo-JSON)'
			}
		]
	};
}
