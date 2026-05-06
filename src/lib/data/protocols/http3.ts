import type { Protocol } from '../types';

export const http3: Protocol = {
	id: 'http3',
	name: 'HyperText Transfer Protocol 3',
	abbreviation: 'HTTP/3',
	categoryId: 'web-api',
	port: 443,
	year: 2022,
	rfc: 'RFC 9114',
	oneLiner: 'HTTP over QUIC — faster connections, no head-of-line blocking, built-in encryption.',
	overview: `HTTP/3 is the latest evolution of HTTP, replacing [[tcp|TCP]] with [[quic|QUIC]] as its transport layer. This seemingly simple swap has profound implications: connections establish faster (1 {{rtt|RTT}} vs 2-3), lost {{packet|packets}} don't block unrelated streams, and connections survive network changes (Wi-Fi to cellular).

The API for developers is identical — same methods, headers, and status codes. The difference is entirely at the transport level. HTTP/3 uses [[quic|QUIC]]'s independent {{stream|streams}} to solve the {{head-of-line-blocking|head-of-line blocking}} that plagued [[http2|HTTP/2]] over [[tcp|TCP]]. Each HTTP request maps to a [[quic|QUIC]] stream; if one packet is lost, only that stream waits for {{retransmission|retransmission}}.

Adoption is accelerating: Google, Cloudflare, Facebook, and most {{cdn|CDNs}} support it. By 2025, ~35% of web traffic uses HTTP/3.`,
	howItWorks: [
		{
			title: 'QUIC handshake (1 RTT)',
			description:
				'Transport and encryption are established in a single round trip. Returning clients can even send data immediately (0 RTT).'
		},
		{
			title: 'QPACK header compression',
			description:
				"Like HTTP/2's HPACK but adapted for QUIC's out-of-order delivery. Uses separate encoder/decoder streams."
		},
		{
			title: 'Independent streams',
			description:
				'Each request/response is a separate QUIC stream. Packet loss on one stream has zero impact on others.'
		},
		{
			title: 'Connection migration',
			description:
				"If the client's IP changes (mobile network switch), the connection continues seamlessly via QUIC Connection IDs."
		}
	],
	useCases: [
		'Modern web browsing (Chrome, Firefox, Safari support it)',
		'Mobile-first applications',
		'High-latency networks (satellite, remote areas)',
		'CDN and edge computing',
		'Real-time collaboration tools'
	],
	codeExample: {
		language: 'cli',
		code: `# curl supports HTTP/3 natively with --http3
curl --http3 -v https://cloudflare-quic.com

# Check if a server advertises HTTP/3 via Alt-Svc
curl -sI https://cloudflare-quic.com \\
  | grep -i alt-svc
# alt-svc: h3=":443"; ma=86400

# Force HTTP/3 only (fail if not supported)
curl --http3-only https://cloudflare-quic.com`,
		caption: 'HTTP/3 uses QUIC transport — clients discover it via the Alt-Svc header',
		alternatives: [
			{
				language: 'javascript',
				code: `// Browsers auto-negotiate HTTP/3 when available
const response = await fetch('https://cloudflare-quic.com');
console.log('Status:', response.status);

// Check Alt-Svc header for HTTP/3 support
const altSvc = response.headers.get('alt-svc');
console.log('Alt-Svc:', altSvc);
// h3=":443"; ma=86400

// Performance observer can detect protocol version
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Protocol:', entry.nextHopProtocol);
    // "h3" for HTTP/3, "h2" for HTTP/2
  }
});
observer.observe({ type: 'resource' });`
			},
			{
				language: 'python',
				code: `import asyncio
from aioquic.asyncio import connect
from aioquic.h3.connection import H3Connection
from aioquic.quic.configuration import QuicConfiguration

async def fetch_h3():
    config = QuicConfiguration(is_client=True)
    config.verify_mode = False  # for testing only

    async with connect("cloudflare-quic.com", 443,
                       configuration=config) as quic:
        h3 = H3Connection(quic._quic)
        stream_id = quic._quic.get_next_available_stream_id()
        h3.send_headers(stream_id, [
            (b":method", b"GET"),
            (b":path", b"/"),
            (b":scheme", b"https"),
            (b":authority", b"cloudflare-quic.com"),
        ])

asyncio.run(fetch_h3())`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'SETTINGS Frame',
						code: `QUIC Stream: 0x00 (Control)\nFrame: SETTINGS (type=0x04)\n  QPACK_MAX_TABLE_CAPACITY: 4096\n  MAX_FIELD_SECTION_SIZE: 8192`
					},
					{
						title: 'Request Stream',
						code: `QUIC Stream: 0x04 (Bidirectional)\nFrame: HEADERS (type=0x01)\n  :method = GET\n  :path = /api/users/42\n  :scheme = https\n  :authority = api.example.com\n  accept = application/json\n\nFrame: DATA (type=0x00)\n  (empty body — GET request)\n\n--- Server Response ---\nFrame: HEADERS (type=0x01)\n  :status = 200\n  content-type = application/json\n\nFrame: DATA (type=0x00)\n  {"id": 42, "name": "Alice Chen"}`
					}
				]
			}
		]
	},
	performance: {
		latency: '1 RTT to first data (vs 2-3 for HTTP/2+TLS). 0 RTT on reconnection.',
		throughput: 'Better than HTTP/2 on lossy networks; comparable on clean networks',
		overhead:
			'Slightly higher per-packet than TCP due to QUIC encryption, offset by fewer round trips'
	},
	connections: ['http2', 'quic', 'tls', 'udp', 'rest'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/HTTP/3',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9114'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Googleplex-Patio-Aug-2014.JPG/500px-Googleplex-Patio-Aug-2014.JPG',
		alt: 'The Googleplex campus in Mountain View, California, where QUIC and HTTP/3 were developed',
		caption:
			"The Googleplex in Mountain View — birthplace of QUIC and HTTP/3. Google engineers designed these protocols to eliminate TCP's head-of-line blocking and speed up the web for billions of users.",
		credit: 'Photo: The Pancake of Heaven! / CC BY-SA 4.0, via Wikimedia Commons'
	}
};
