import type { Protocol } from '../types';

export const http3: Protocol = {
	id: 'http3',
	name: 'HyperText Transfer Protocol 3',
	abbreviation: 'HTTP/3',
	categoryId: 'web-api',
	port: 443,
	year: 2022,
	rfc: 'RFC 9114',
	oneLiner:
		'{{http-method|HTTP}} over [[quic|QUIC]] — faster connections, no {{head-of-line-blocking|head-of-line blocking}}, built-in {{encryption|encryption}}.',
	overview: `[[http3|HTTP/3]] is the latest evolution of {{http-method|HTTP}}, replacing [[tcp|TCP]] with [[quic|QUIC]] as its transport layer. This seemingly simple swap has profound implications: connections establish faster (1 {{rtt|RTT}} vs 2-3), lost {{packet|packets}} don't block unrelated streams, and connections survive network changes ([[wifi|Wi-Fi]] to cellular).

The {{api|API}} for developers is identical — same methods, headers, and status codes. The difference is entirely at the transport level. [[http3|HTTP/3]] uses [[quic|QUIC]]'s independent {{stream|streams}} to solve the {{head-of-line-blocking|head-of-line blocking}} that plagued [[http2|HTTP/2]] over [[tcp|TCP]]. Each {{http-method|HTTP}} request maps to a [[quic|QUIC]] stream; if one packet is lost, only that stream waits for {{retransmission|retransmission}}.

Adoption is accelerating: {{google|Google}}, {{cloudflare|Cloudflare}}, Facebook, and most {{cdn|CDNs}} support it. By 2025, ~35% of web traffic uses [[http3|HTTP/3]].`,
	howItWorks: [
		{
			title: 'QUIC handshake (1 RTT)',
			description:
				'Transport and {{encryption|encryption}} are established in a single round trip. Returning clients can even send data immediately (0 {{rtt|RTT}}).'
		},
		{
			title: 'QPACK header compression',
			description:
				"Like [[http2|HTTP/2]]'s {{hpack|HPACK}} but adapted for [[quic|QUIC]]'s out-of-order delivery. Uses separate encoder/decoder streams."
		},
		{
			title: 'Independent streams',
			description:
				'Each request/response is a separate [[quic|QUIC]] stream. Packet loss on one stream has zero impact on others.'
		},
		{
			title: 'Connection migration',
			description:
				"If the client's [[ip|IP]] changes (mobile network switch), the connection continues seamlessly via {{connection-migration|QUIC Connection IDs}}."
		}
	],
	useCases: [
		'Modern web browsing (Chrome, Firefox, Safari support it)',
		'Mobile-first applications',
		'High-latency networks (satellite, remote areas)',
		'{{cdn|CDN}} and edge computing',
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
		caption:
			'[[http3|HTTP/3]] uses [[quic|QUIC]] transport — clients discover it via the Alt-Svc header',
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
    config = QuicConfiguration(is_client=True, alpn_protocols=["h3"])
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
        ], end_stream=True)
        quic.transmit()  # actually put the packets on the wire

asyncio.run(fetch_h3())`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'SETTINGS Frame',
						code: `QUIC Stream: 2 (client unidirectional — first byte 0x00 marks it the Control stream)\nFrame: SETTINGS (type=0x04)\n  QPACK_MAX_TABLE_CAPACITY: 4096\n  MAX_FIELD_SECTION_SIZE: 8192`
					},
					{
						title: 'Request Stream',
						code: `QUIC Stream: 0 (first client bidirectional — carries the request)\nFrame: HEADERS (type=0x01)\n  :method = GET\n  :path = /api/users/42\n  :scheme = https\n  :authority = api.example.com\n  accept = application/json\n\nFrame: DATA (type=0x00)\n  (empty body — GET request)\n\n--- Server Response ---\nFrame: HEADERS (type=0x01)\n  :status = 200\n  content-type = application/json\n\nFrame: DATA (type=0x00)\n  {"id": 42, "name": "Alice Chen"}`
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
			"The Googleplex in Mountain View — birthplace of [[quic|QUIC]] and [[http3|HTTP/3]]. {{google|Google}} engineers designed these protocols to eliminate [[tcp|TCP]]'s {{head-of-line-blocking|head-of-line blocking}} and speed up the web for billions of users.",
		credit: 'Photo: The Pancake of Heaven! / CC BY-SA 4.0, via Wikimedia Commons'
	},

	recentChanges: [
		{
			date: '2026',
			title: '~35% of top 10M websites support HTTP/3',
			description:
				'W3Techs measurements show [[http3|HTTP/3]] adoption past 35% of the top 10M websites — every {{cdn|CDN}}-fronted site, plus a growing share of origin-served sites with nginx 1.25+ or Caddy.'
		},
		{
			date: '2023-05',
			title: 'nginx 1.25 ships experimental HTTP/3',
			description:
				'After years of [[quic|QUIC]] plug-in modules, mainline nginx 1.25.0 ships an [[http3|HTTP/3]] module — still flagged experimental, and carried into the 1.26 stable branch (April 2024) with the same caveat.'
		},
		{
			date: '2022-01',
			title: 'WebTransport API ships in Chrome',
			description:
				'{{webtransport|WebTransport}} (the JavaScript {{api|API}} on top of [[http3|HTTP/3]] datagrams and streams) reached Chrome stable in Chrome 97. A [[websockets|WebSockets]] alternative for low-{{latency|latency}} client-server use cases.'
		}
	],

	realWorldDeployments: [
		{
			org: 'Cloudflare',
			scale: 'All HTTPS traffic',
			description:
				'[[http3|HTTP/3]] enabled by default for every site behind {{cloudflare|Cloudflare}}. Roughly 30% of HTTPS bytes served negotiate [[http3|HTTP/3]].'
		},
		{
			org: 'Google',
			scale: 'google.com / YouTube',
			description:
				"Default for chrome.com, youtube.com, and most {{google|Google}} web properties. {{google|Google}}'s investment is what drove [[quic|QUIC]] + [[http3|HTTP/3]] standardisation."
		},
		{
			org: 'Meta',
			scale: ">75% of Meta's traffic on QUIC",
			description:
				'Facebook, Instagram, WhatsApp move majority bytes via [[http3|HTTP/3]]. mvfst (their [[quic|QUIC]] stack) is open-source.'
		}
	],

	funFacts: [
		{
			title: 'HTTP/3 has the same semantics as HTTP/1.1',
			text: 'A GET request in [[http3|HTTP/3]] means exactly what it meant in [[http1|HTTP/1.1]] (1997). The verbs, status codes, headers, {{content-negotiation|content negotiation}}, and caching semantics are identical. Only the **wire encoding** changed — from text framing (1.1) to binary frames (2) to [[quic|QUIC]] streams (3). Reading [[rfc:9110|RFC 9110]] ({{http-method|HTTP}} Semantics) explains all three at once.'
		},
		{
			title: 'No more head-of-line blocking',
			text: 'In [[http2|HTTP/2]] over [[tcp|TCP]], a single dropped packet stalls **all** streams on the connection. [[http3|HTTP/3]] over [[quic|QUIC]] only stalls the stream that owned the lost data, because [[quic|QUIC]] streams are independent at the transport layer. This is the entire reason [[http3|HTTP/3]] exists.'
		},
		{
			title: 'Connection migration survives Wi-Fi/cellular handoff',
			text: 'When your phone moves between [[wifi|Wi-Fi]] and cellular, the underlying [[ip|IP]] changes — but the [[http3|HTTP/3]] connection survives because [[quic|QUIC]] identifies it by Connection {{id-identifier|ID}}, not [[ip|IP]]. A video call or live stream does not stutter on handoff.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Alt-Svc bootstrap requires a TCP+TLS round-trip',
				text: "A new client doesn't know to try [[http3|HTTP/3]] until it sees an Alt-Svc header in an [[http1|HTTP/1.1]] or [[http2|HTTP/2]] response — meaning the very first connection still pays the [[tcp|TCP]]+[[tls|TLS]] round-trip cost. The HTTPS [[dns|DNS]] record (HTTPS RR, [[rfc:9460|RFC 9460]]) closes this gap by advertising [[http3|HTTP/3]] support directly in [[dns|DNS]], but adoption is partial."
			},
			{
				title: 'CDN coverage is much better than origin coverage',
				text: '{{cloudflare|Cloudflare}}/Fastly/Akamai serve [[http3|HTTP/3]] universally; origin servers running older nginx, Apache, or IIS often do not. If your site sits behind a {{cdn|CDN}}, you have [[http3|HTTP/3]] for free. If you serve directly from origin, you need to deploy a recent nginx/Caddy/h2o build.'
			},
			{
				title: 'Some debugging tools have limited QUIC support',
				text: '{{wireshark|Wireshark}} dissects [[http3|HTTP/3]] (since 4.0), but only when you have the [[quic|QUIC]] session secrets. curl supports [[http3|HTTP/3]] with --http3 (in builds compiled with ngtcp2 — the default — or quiche). If you rely on tcpdump to debug [[http2|HTTP/2]], expect more friction with [[http3|HTTP/3]].'
			}
		]
	}
};
