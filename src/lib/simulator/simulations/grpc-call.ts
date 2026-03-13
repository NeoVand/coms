import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';
import { createHTTP2FrameLayer } from '../layers/http2';
import { createGRPCLayer } from '../layers/grpc';

export const grpcCall: SimulationConfig = {
	protocolId: 'grpc',
	title: 'gRPC — Unary RPC Call',
	description:
		'Watch a gRPC unary call over HTTP/2. The client sends a single protobuf request and receives a single response — like a remote function call with strong typing and efficient binary serialization.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'gRPC Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'method',
			label: 'RPC Method',
			type: 'text',
			defaultValue: '/users.UserService/GetUser',
			placeholder: '/package.Service/Method'
		}
	],
	steps: [
		{
			id: 'headers-request',
			label: 'Request HEADERS',
			description:
				'Client sends HTTP/2 HEADERS frame with gRPC metadata. The :path contains the service and method name. content-type: application/grpc tells the server this is a gRPC call, not regular HTTP.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Payload', 'Stream ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52600, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'HEADERS (0x1)',
					flags: 'END_HEADERS',
					streamId: 1,
					payload:
						':method: POST, :path: /users.UserService/GetUser, content-type: application/grpc',
					length: 96
				})
			]
		},
		{
			id: 'data-request',
			label: 'Request DATA',
			description:
				'Client sends the protobuf-encoded request in an HTTP/2 DATA frame. gRPC adds a 5-byte prefix: 1 byte compression flag + 4 bytes message length, followed by the serialized protobuf.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Payload', 'Message Length'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52600, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'DATA (0x0)',
					flags: 'END_STREAM',
					streamId: 1,
					payload: 'gRPC length-prefixed message',
					length: 53
				}),
				createGRPCLayer({
					compressed: 0,
					messageLength: 48,
					service: '/users.UserService',
					method: 'GetUser',
					payload: '{ id: 1 }'
				})
			]
		},
		{
			id: 'headers-response',
			label: 'Response HEADERS',
			description:
				'Server sends response HEADERS with HTTP status 200. In gRPC, the HTTP status is always 200 for successfully processed calls — the actual gRPC status comes later in trailers.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52600, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'HEADERS (0x1)',
					flags: 'END_HEADERS',
					streamId: 1,
					payload: ':status: 200, content-type: application/grpc',
					length: 48
				})
			]
		},
		{
			id: 'data-response',
			label: 'Response DATA',
			description:
				'Server sends the protobuf response in a DATA frame. The message is binary-encoded using the protobuf schema — much smaller and faster to parse than JSON.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Payload', 'Message Length'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52600, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'DATA (0x0)',
					flags: 'NONE',
					streamId: 1,
					payload: 'gRPC length-prefixed message',
					length: 128
				}),
				createGRPCLayer({
					compressed: 0,
					messageLength: 123,
					service: '/users.UserService',
					method: 'GetUser',
					payload: '{ id: 1, name: "Alice", email: "alice@..." }'
				})
			]
		},
		{
			id: 'trailers',
			label: 'Trailers',
			description:
				'Server sends trailing HEADERS with grpc-status: 0 (OK). This is unique to gRPC — the final status is sent as HTTP/2 trailers after the response body, allowing errors even after data starts streaming.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Payload', 'Flags'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52600, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)'
				}),
				createHTTP2FrameLayer({
					type: 'HEADERS (0x1)',
					flags: 'END_STREAM, END_HEADERS',
					streamId: 1,
					payload: 'grpc-status: 0, grpc-message: OK',
					length: 32
				})
			]
		}
	]
};
