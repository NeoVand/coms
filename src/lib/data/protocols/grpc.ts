import type { Protocol } from '../types';

export const grpc: Protocol = {
	id: 'grpc',
	name: 'gRPC Remote Procedure Calls',
	abbreviation: 'gRPC',
	categoryId: 'web-api',
	port: 443,
	year: 2015,
	rfc: undefined,
	oneLiner: 'High-performance {{rpc|RPC}} framework using {{protocol-buffers|Protocol Buffers}} over [[http2|HTTP/2]].',
	overview: `[[grpc|gRPC]] is {{google|Google}}'s open-source framework for remote procedure calls. Instead of designing [[rest|REST]] endpoints and manually serializing {{json|JSON}}, you define your service and messages in {{protocol-buffers|Protocol Buffers}} (.proto files), and [[grpc|gRPC]] generates strongly-typed client and server code in 11 languages.

It uses [[http2|HTTP/2]] for transport, gaining {{multiplexing|multiplexing}} and {{header|header}} compression for free. Messages are serialized as {{protocol-buffers|Protocol Buffers}} — a binary format that's 3-10x smaller and 3-10x faster to parse than {{json|JSON}}. [[grpc|gRPC]] also natively supports {{stream|streaming}}: server-streaming, client-streaming, and bidirectional streaming.

[[grpc|gRPC]] dominates in microservice architectures where services are internal and performance matters. It's less common for public APIs (browsers can't easily use it), though [[grpc|gRPC]]-Web bridges that gap.`,
	howItWorks: [
		{
			title: 'Define service in .proto',
			description:
				'You write a .proto file defining your service methods and message types. This is the single source of truth for your {{api|API}} contract.'
		},
		{
			title: 'Generate code',
			description:
				'The {{protoc|protoc}} compiler generates client stubs and server interfaces in your language. Types are enforced at compile time.'
		},
		{
			title: 'Call like a local function',
			description:
				'Client code calls server methods as if they were local functions. [[grpc|gRPC]] handles {{serialization|serialization}}, [[http2|HTTP/2]] framing, and transport.'
		},
		{
			title: 'Streaming',
			description:
				'Beyond simple request/response, [[grpc|gRPC]] supports server-streaming (one request, many responses), client-streaming, and full bidirectional streaming.'
		}
	],
	useCases: [
		'Microservice-to-microservice communication',
		'Mobile backend APIs (efficient binary protocol)',
		'Real-time data streaming between services',
		'Polyglot architectures (11 language support)',
		'Kubernetes {{service-mesh|service mesh}} communication'
	],
	codeExample: {
		language: 'python',
		code: `import grpc
import user_pb2, user_pb2_grpc

# Connect to gRPC server
channel = grpc.insecure_channel('localhost:50051')
stub = user_pb2_grpc.UserServiceStub(channel)

# Unary call — like a function call
user = stub.GetUser(user_pb2.GetUserRequest(id=42))
print(f"{user.name} ({user.email})")

# Server streaming — receive multiple responses
for user in stub.ListUsers(user_pb2.ListUsersRequest()):
    print(f"User: {user.name}")`,
		caption:
			'One .proto file generates type-safe clients in Go, Python, Java, TypeScript, and more',
		alternatives: [
			{
				language: 'javascript',
				code: `const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('user.proto');
const proto = grpc.loadPackageDefinition(packageDef);

const client = new proto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Unary call
client.GetUser({ id: 42 }, (err, user) => {
  console.log(\`\${user.name} (\${user.email})\`);
});

// Server streaming
const stream = client.ListUsers({});
stream.on('data', (user) => console.log('User:', user.name));`
			},
			{
				language: 'cli',
				code: `# List available services
grpcurl -plaintext localhost:50051 list

# Describe a service
grpcurl -plaintext localhost:50051 describe UserService

# Call a unary method
grpcurl -plaintext -d '{"id": 42}' \\
  localhost:50051 UserService/GetUser

# Server streaming call
grpcurl -plaintext localhost:50051 UserService/ListUsers`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: '.proto Service Definition',
						code: `syntax = "proto3";\npackage users;\n\nservice UserService {\n  rpc GetUser (GetUserRequest) returns (User);\n  rpc ListUsers (ListUsersRequest) returns (stream User);\n}\n\nmessage GetUserRequest {\n  int32 id = 1;\n}\n\nmessage User {\n  int32 id = 1;\n  string name = 2;\n  string email = 3;\n}`
					},
					{
						title: 'gRPC Wire Frame (HTTP/2)',
						code: `HEADERS frame:\n  :method: POST\n  :path: /users.UserService/GetUser\n  :scheme: https\n  content-type: application/grpc\n  grpc-encoding: identity\n  te: trailers\n\nDATA frame:\n  Compressed: 0\n  Length: 5 bytes\n  Message: 0x08 0x2a  (field 1, varint 42)\n\nHEADERS frame (trailers):\n  grpc-status: 0\n  grpc-message: OK`
					}
				]
			}
		]
	},
	performance: {
		latency: 'HTTP/2 connection reuse + binary serialization = very low latency per call',
		throughput: 'Protobuf is 3-10x smaller than JSON; 3-10x faster to serialize/deserialize',
		overhead: 'HTTP/2 framing + protobuf encoding. Very efficient for structured data.'
	},
	connections: ['a2a', 'http2', 'json-rpc', 'mcp', 'tls', 'rest', 'soap'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/GRPC',
		official: 'https://grpc.io/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Google_Corkboard_Server_Rack.jpg/500px-Google_Corkboard_Server_Rack.jpg',
		alt: "Google's original corkboard server rack from 1999, now at the Computer History Museum",
		caption:
			"{{google|Google}}'s original 1999 server rack — built from corkboard and spare parts. {{google|Google}} later created [[grpc|gRPC]] to handle the massive scale of inter-service communication across its data centers, using {{protocol-buffers|Protocol Buffers}} and [[http2|HTTP/2]].",
		credit: 'Photo: Wikimedia Commons / CC BY 2.0'
	}
};
