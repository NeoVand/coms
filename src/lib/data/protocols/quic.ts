import type { Protocol } from '../types';

export const quic: Protocol = {
	id: 'quic',
	name: 'QUIC',
	abbreviation: 'QUIC',
	categoryId: 'transport',
	port: undefined,
	year: 2021,
	rfc: 'RFC 9000',
	oneLiner:
		'UDP-based transport with built-in encryption and multiplexing — the future of the web.',
	overview: `QUIC is what happens when Google looks at [[tcp|TCP]]+[[tls|TLS]] and says "we can do better." It runs on top of [[udp|UDP]] but provides [[tcp|TCP]]-like reliability, [[tls|TLS 1.3]] {{encryption|encryption}}, and [[http2|HTTP/2]]-style {{multiplexing|multiplexing}} — all in a single protocol. The result: faster connections, no {{head-of-line-blocking|head-of-line blocking}}, and seamless connection migration.

The key insight is combining the transport {{handshake|handshake}} with the [[tls|TLS]] handshake. [[tcp|TCP]]+[[tls|TLS 1.3]] requires 2 round trips before data flows (1 RTT for TCP handshake + 1 RTT for TLS); QUIC does it in 1 {{rtt|RTT}} (or 0 RTT for repeat connections). It also solves [[tcp|TCP]]'s head-of-line blocking problem: in [[http2|HTTP/2]] over [[tcp|TCP]], a single lost packet blocks ALL streams. In QUIC, streams are independent — a lost packet only affects its own stream.

QUIC powers [[http3|HTTP/3]], which is the latest version of HTTP. Major browsers and services (Google, Facebook, Cloudflare) already use it heavily. It's the most significant transport protocol innovation in decades.`,
	howItWorks: [
		{
			title: 'Initial handshake (1 RTT)',
			description:
				'Client sends a QUIC Initial packet containing a TLS ClientHello. Server responds with its Initial + Handshake packets. Connection is established in a single round trip with encryption from the start.'
		},
		{
			title: '0-RTT resumption',
			description:
				'For repeat connections, the client can send data immediately using a cached key — zero round trips. The server can process it before the handshake completes.'
		},
		{
			title: 'Multiplexed streams',
			description:
				"Multiple independent streams share one connection. Each stream has its own flow control. Packet loss on one stream doesn't block others."
		},
		{
			title: 'Connection migration',
			description:
				'Connections are identified by a Connection ID, not the IP/port tuple. If your phone switches from Wi-Fi to cellular, the QUIC connection survives.'
		}
	],
	useCases: [
		'HTTP/3 web browsing',
		'Mobile applications (connection migration)',
		'Video streaming platforms',
		'Cloud gaming',
		'API communication over unstable networks'
	],
	codeExample: {
		language: 'python',
		code: `import asyncio
from aioquic.asyncio import connect
from aioquic.quic.configuration import QuicConfiguration

async def main():
    config = QuicConfiguration(is_client=True)
    config.verify_mode = False  # for testing

    async with connect(
        'example.com', 443, configuration=config
    ) as protocol:
        # QUIC streams are independent
        reader, writer = await protocol.create_stream()
        writer.write(b"Hello over QUIC!")
        writer.write_eof()

        response = await reader.read()
        print(f"Response: {response}")

asyncio.run(main())`,
		caption: 'QUIC combines transport + encryption in one step, enabling faster connections',
		alternatives: [
			{
				language: 'javascript',
				code: `// QUIC has no stable native API in Node.js.
// Use fetch() — when the server supports HTTP/3,
// modern runtimes negotiate QUIC automatically.

const response = await fetch('https://cloudflare-quic.com', {
  method: 'GET',
  headers: { 'Accept': 'text/html' }
});

console.log('Status:', response.status);
console.log('Protocol:', response.headers.get('alt-svc'));
const body = await response.text();
console.log('Body length:', body.length);

// To explicitly request HTTP/3 from the CLI:
// curl --http3 https://cloudflare-quic.com`
			},
			{
				language: 'cli',
				code: `# Test QUIC connectivity with curl
curl --http3 -v https://cloudflare-quic.com

# Check QUIC support via Alt-Svc header
curl -sI https://google.com | grep -i alt-svc

# Use quiche-client for raw QUIC testing
quiche-client https://example.com:443

# Monitor QUIC traffic with tcpdump
sudo tcpdump -i any udp port 443`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Initial Handshake',
						code: `QUIC Initial Packet:
  Header Form: Long (1)
  Type: Initial (0x00)
  Version: 0x00000001
  DCID Len: 8  DCID: 0x8394c8f03e515708
  SCID Len: 0
  Token Length: 0
  Length: 1200
  Packet Number: 0

  Payload (CRYPTO frame):
    TLS ClientHello
      Version: TLS 1.3
      Cipher Suites: TLS_AES_128_GCM_SHA256
      ALPN: h3
      SNI: example.com`
					},
					{
						title: 'Short Header Data Packet',
						code: `QUIC Short Header Packet:
  Header Form: Short (0)
  DCID: 0x8394c8f03e515708
  Packet Number: 42

  STREAM Frame:
    Stream ID: 0 (client bidi)
    Offset: 0
    Length: 89
    Data: [HTTP/3 HEADERS frame]

  ACK Frame:
    Largest Acked: 41
    ACK Delay: 512µs
    ACK Ranges: [38-41]`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'1 RTT for new connections, 0 RTT for resumption — up to 2x faster connection setup (1-RTT vs 2-RTT for TCP+TLS 1.3)',
		throughput:
			'Comparable to TCP with better behavior on lossy networks due to independent streams',
		overhead: 'Higher per-packet than TCP due to encryption, but fewer round trips overall'
	},
	connections: ['tcp', 'udp', 'tls', 'http2', 'http3'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/QUIC',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9000',
		official: 'https://quicwg.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Google_Data_Center%2C_The_Dalles.jpg/500px-Google_Data_Center%2C_The_Dalles.jpg',
		alt: 'Google data center in The Dalles, Oregon, with rows of colorful server racks',
		caption:
			"Google's data center in The Dalles, Oregon — where QUIC was born. Google developed QUIC internally starting in 2012 to replace TCP+TLS, deploying it across Chrome and YouTube before standardizing it as RFC 9000.",
		credit: 'Photo: Google / CC BY 2.0, via Wikimedia Commons'
	}
};
