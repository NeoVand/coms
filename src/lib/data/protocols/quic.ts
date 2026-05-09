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
		'UDP-based transport with built-in {{encryption|encryption}} and {{multiplexing|multiplexing}} — the future of the web.',
	overview: `QUIC is what happens when Google looks at [[tcp|TCP]]+[[tls|TLS]] and says "we can do better." It runs on top of [[udp|UDP]] but provides [[tcp|TCP]]-like reliability, [[tls|TLS 1.3]] {{encryption|encryption}}, and [[http2|HTTP/2]]-style {{multiplexing|multiplexing}} — all in a single protocol. The result: faster connections, no {{head-of-line-blocking|head-of-line blocking}}, and seamless {{connection-migration|connection migration}}.

The key insight is combining the transport {{handshake|handshake}} with the [[tls|TLS]] {{handshake|handshake}}. [[tcp|TCP]]+[[tls|TLS 1.3]] requires 2 round trips before data flows (1 RTT for [[tcp|TCP]] handshake + 1 RTT for [[tls|TLS]]); QUIC does it in 1 {{rtt|RTT}} (or 0 RTT for repeat connections). It also solves [[tcp|TCP]]'s {{head-of-line-blocking|head-of-line blocking}} problem: in [[http2|HTTP/2]] over [[tcp|TCP]], a single lost packet blocks ALL streams. In QUIC, streams are independent — a lost packet only affects its own stream.

QUIC powers [[http3|HTTP/3]], which is the latest version of HTTP. Major browsers and services (Google, Facebook, Cloudflare) already use it heavily. It's the most significant transport protocol innovation in decades.`,
	howItWorks: [
		{
			title: 'Initial handshake (1 RTT)',
			description:
				'Client sends a QUIC Initial packet containing a [[tls|TLS]] ClientHello. Server responds with its Initial + {{handshake|Handshake}} packets. Connection is established in a single round trip with {{encryption|encryption}} from the start.'
		},
		{
			title: '0-RTT resumption',
			description:
				'For repeat connections, the client can send data immediately using a cached key — zero round trips. The server can process it before the {{handshake|handshake}} completes.'
		},
		{
			title: 'Multiplexed streams',
			description:
				"Multiple independent streams share one connection. Each stream has its own {{flow-control|flow control}}. Packet loss on one stream doesn't block others."
		},
		{
			title: 'Connection migration',
			description:
				'Connections are identified by a {{connection-migration|Connection ID}}, not the IP/port tuple. If your phone switches from [[wifi|Wi-Fi]] to cellular, the QUIC connection survives.'
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
		caption: 'QUIC combines transport + {{encryption|encryption}} in one step, enabling faster connections',
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
			"Google's data center in The Dalles, Oregon — where QUIC was born. Google developed QUIC internally starting in 2012 to replace [[tcp|TCP]]+[[tls|TLS]], deploying it across Chrome and YouTube before standardizing it as [[rfc:9000|RFC 9000]].",
		credit: 'Photo: Google / CC BY 2.0, via Wikimedia Commons'
	},

	recentChanges: [
		{
			date: '2025-Q1',
			title: 'QUIC carries 35% of top 10M websites',
			description:
				'W3Techs measurements show QUIC adoption crossed 35% of the top 10 million websites — up from 27% a year earlier. Cloudflare, Fastly, and Akamai serve QUIC universally.',
			source: { url: 'https://w3techs.com/technologies/details/ce-quic', label: 'W3Techs' }
		},
		{
			date: '2024-Q4',
			title: 'Meta reports >75% of internet traffic on QUIC',
			description:
				'Facebook, Instagram, and WhatsApp web/mobile now serve the majority of bytes via QUIC and [[http3|HTTP/3]], with [[tcp|TCP]] retained mainly for legacy clients.'
		},
		{
			date: '2024-09',
			title: 'Multipath QUIC reaches stable IETF draft',
			description:
				'draft-ietf-quic-multipath progressed to stable; multipath QUIC inherits [[mptcp|MPTCP]]\'s algorithmic ideas inside a transport that actually traverses middleboxes. Apple, Google, and several mobile carriers are running interop events.',
			source: {
				url: 'https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/',
				label: 'IETF Datatracker'
			}
		},
		{
			date: '2024-2025',
			title: 'MoQ Transport interop events',
			description:
				'Media-over-QUIC (Twitch, Cisco Webex, Cloudflare Stream, Meta) running quarterly interop events. Sub-second live-streaming over QUIC with native late-join and per-stream prioritisation.'
		}
	],

	realWorldDeployments: [
		{
			org: 'Google (Chrome, YouTube, Search)',
			scale: 'Default since 2017',
			description:
				'gQUIC deployed in Chrome / YouTube from 2013; IETF QUIC default for chrome.com and youtube.com since 2020. Google says >50% of all Chrome traffic uses QUIC.'
		},
		{
			org: 'Meta',
			scale: '>75% of web/mobile bytes',
			description:
				'Facebook, Instagram, WhatsApp serve majority of traffic via QUIC. mvfst (Meta\'s QUIC implementation) is open-source.'
		},
		{
			org: 'Cloudflare',
			scale: 'All HTTPS traffic',
			description:
				'quiche library powers QUIC at Cloudflare\'s edge for every HTTPS site behind their CDN. Connection-coalescing and {{zero-rtt|0-RTT}} enabled by default.'
		},
		{
			org: 'Apple',
			scale: 'iOS 18+ / macOS 15+',
			description:
				'Network.framework offers native QUIC; Safari 18 enables [[http3|HTTP/3]] by default. CloudKit and iCloud sync use QUIC for low-{{latency|latency}} mobile updates.'
		}
	],

	funFacts: [
		{
			title: 'QUIC was originally an internal Google name',
			text: 'QUIC stood for "Quick [[udp|UDP]] Internet Connections" inside Google. The IETF working group dropped the expansion entirely — [[rfc:9000|RFC 9000]] just calls it "QUIC" with no expansion. The protocol\'s name is now an unexplained four-letter word, like "HTTP" or "[[tcp|TCP]]."'
		},
		{
			title: 'Connection IDs let your phone roam',
			text: 'A QUIC connection is identified by a **64-bit Connection ID**, not by the (src IP, src port, dst IP, dst port) four-tuple [[tcp|TCP]] uses. When your phone moves between Wi-Fi and cellular, the underlying IP changes — but the QUIC connection survives. The receiver matches the new packet by Connection ID. This is why [[http3|HTTP/3]] video calls do not stutter on handoff.'
		},
		{
			title: 'QUIC encrypts almost the entire packet',
			text: '[[tcp|TCP]] segment headers are visible to anyone on the path — sequence numbers, ACK numbers, window sizes. QUIC encrypts almost everything except the Connection ID, packet number, and a few framing bits. This blocks decades of network-side observation tools (and is why some operators still resist QUIC).'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Some networks block UDP / QUIC',
				text: 'Corporate firewalls, school networks, and a small fraction of mobile carriers block [[udp|UDP]] on port 443. Browsers fall back to [[tcp|TCP]]+[[http2|HTTP/2]], but the fallback adds 1-2 RTTs of detection. If you need consistent QUIC, validate connectivity before you depend on it.'
			},
			{
				title: 'Connection migration breaks middleboxes',
				text: 'Some {{stateful|stateful}} middleboxes ({{nat|NAT}} routers, transparent proxies) drop a connection when its source IP suddenly changes — they assume it\'s a new flow. QUIC\'s Path Validation fixes this when both endpoints support it; the path-probing {{handshake|handshake}} is [[rfc:9000|RFC 9000]] §8.'
			},
			{
				title: 'Higher CPU than kernel TCP',
				text: 'QUIC {{encryption|encryption}} + user-space implementation costs roughly 2× CPU per byte versus a tuned kernel [[tcp|TCP]] stack. CDNs offload to TLS-acceleration NICs (kTLS); plain servers should expect higher load.'
			}
		]
	}
};
