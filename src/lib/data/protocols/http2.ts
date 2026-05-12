import type { Protocol } from '../types';

export const http2: Protocol = {
	id: 'http2',
	name: 'HyperText Transfer Protocol 2',
	abbreviation: 'HTTP/2',
	categoryId: 'web-api',
	port: 443,
	year: 2015,
	rfc: 'RFC 9113',
	oneLiner: 'Multiplexed, binary HTTP — many requests flying over one connection simultaneously.',
	overview: `[[http2|HTTP/2]] was designed to fix [[http1|HTTP/1.1]]'s biggest pain points without changing the semantics developers know and love. You still use GET, POST, headers, and {{status-code|status codes}} — but under the hood, everything is different. The protocol is {{binary-framing|binary (not text)}}, {{multiplexing|multiplexed}} (many requests share one connection), and supports {{header|header}} compression ({{hpack|HPACK}}) and {{server-push|server push}} (now deprecated — Chrome removed support in Chrome 106; 103 {{early-hints|Early Hints}} is the recommended replacement).

{{multiplexing|Multiplexing}} is the killer feature: instead of waiting for each response before sending the next request, [[http2|HTTP/2]] interleaves multiple {{request-response|request-response}} pairs as "{{stream|streams}}" on a single [[tcp|TCP]] connection. This eliminates the need for multiple connections and dramatically improves page load times for resource-heavy sites.

While the [[http2|HTTP/2]] spec (RFC 9113) doesn't mandate [[tls|TLS]], all browsers require HTTPS for [[http2|HTTP/2]] connections (h2). Unencrypted [[http2|HTTP/2]] (h2c) is only used in server-to-server communication.

However, [[http2|HTTP/2]] still runs on [[tcp|TCP]], which means [[tcp|TCP]]-level {{head-of-line-blocking|head-of-line blocking}} persists — a single lost [[tcp|TCP]] {{packet|packet}} blocks all streams. This is what motivated [[http3|HTTP/3]] and [[quic|QUIC]].`,
	howItWorks: [
		{
			title: 'Connection & settings',
			description:
				'After [[tcp|TCP]]+[[tls|TLS]] {{handshake|handshake}}, client and server {{exchange|exchange}} SETTINGS frames establishing max concurrent streams, window sizes, etc.'
		},
		{
			title: 'Binary framing',
			description:
				'All communication is split into small {{binary-framing|binary frames}}. Each frame belongs to a numbered stream. Multiple streams are interleaved on the same connection.'
		},
		{
			title: 'Header compression',
			description:
				'{{hpack|HPACK}} compression reduces header overhead dramatically. Common headers are encoded as small integers. Repeated headers reference a shared table.'
		},
		{
			title: 'Multiplexed responses',
			description:
				"Server sends response frames for multiple requests concurrently. A large image download doesn't block a small API response."
		}
	],
	useCases: [
		'Modern websites with many resources (images, scripts, styles)',
		'Single-page applications with many API calls',
		'[[grpc|gRPC]] (uses [[http2|HTTP/2]] as transport)',
		'Mobile applications (single connection saves battery)',
		'Microservice-to-microservice communication'
	],
	codeExample: {
		language: 'python',
		code: `import httpx

# httpx supports HTTP/2 natively
client = httpx.Client(http2=True)

response = client.get("https://example.com/api/data")
print(f"HTTP version: {response.http_version}")  # HTTP/2
print(f"Status: {response.status_code}")
print(f"Body: {response.text}")

client.close()`,
		caption: '[[http2|HTTP/2]] multiplexes requests over a single connection with {{binary-framing|binary framing}}',
		alternatives: [
			{
				language: 'javascript',
				code: `const http2 = require('node:http2');

// Connect to an HTTP/2 server
const client = http2.connect('https://example.com');

// Multiplexed: multiple requests on one connection
const req = client.request({ ':path': '/api/data' });

req.on('response', (headers) => {
  console.log('Status:', headers[':status']);
});

let data = '';
req.on('data', (chunk) => { data += chunk; });
req.on('end', () => {
  console.log('Response:', data);
  client.close();
});
req.end();`
			},
			{
				language: 'cli',
				code: `# Force HTTP/2 with curl
curl --http2 -v https://example.com/api/data

# Check if a server supports HTTP/2
curl -sI --http2 https://example.com | grep -i "http/2"

# HTTP/2 with verbose protocol details
curl --http2 -v https://example.com 2>&1 | grep "< HTTP"`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'SETTINGS Frame',
						code: `Frame: SETTINGS (type=0x04)\nLength: 18  |  Flags: 0x00  |  Stream: 0\n  HEADER_TABLE_SIZE: 4096\n  MAX_CONCURRENT_STREAMS: 100\n  INITIAL_WINDOW_SIZE: 65535`
					},
					{
						title: 'HEADERS + DATA',
						code: `Frame: HEADERS (type=0x01)\nLength: 43  |  Flags: END_HEADERS  |  Stream: 1\n  :method: GET\n  :path: /api/users/42\n  :scheme: https\n  :authority: api.example.com\n\nFrame: DATA (type=0x00)\nLength: 127  |  Flags: END_STREAM  |  Stream: 1\n  {"id": 42, "name": "Alice Chen", ...}`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Same connection setup as HTTP/1.1 + TLS, but much lower latency for concurrent requests',
		throughput: 'Single connection carries all requests — no connection overhead waste',
		overhead:
			'HPACK compresses headers by 30-76% compared to HTTP/1.1, depending on traffic patterns'
	},
	connections: ['http1', 'http3', 'tcp', 'tls', 'grpc', 'sse'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/[[http2|HTTP/2]]',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9113'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/HTTP_pipelining2.svg/500px-HTTP_pipelining2.svg.png',
		alt: 'Diagram comparing HTTP/1.1 sequential requests, pipelining, and HTTP/2 multiplexing over a single connection',
		caption:
			'The evolution from [[http1|HTTP/1.1]] to [[http2|HTTP/2]] — sequential requests waste time waiting, pipelining helped but still suffered {{head-of-line-blocking|head-of-line blocking}}. [[http2|HTTP/2]] {{multiplexing|multiplexing}} sends multiple requests and responses simultaneously over a single connection using {{binary-framing|binary framing}}.',
		credit: 'Image: Wikimedia Commons / Public Domain'
	}
};
