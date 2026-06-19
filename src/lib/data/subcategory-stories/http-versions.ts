import type { SubcategoryStory } from './types';

export const httpVersionsStory: SubcategoryStory = {
	subcategoryId: 'http-versions',
	tagline:
		'Thirty years of one protocol — from a text-based handshake on a NeXT cube to encrypted multiplexed streams over [[quic|QUIC]]',
	sections: [
		{
			type: 'narrative',
			title: 'One Protocol, Three Lifetimes',
			text: `In December 1990, [[pioneer:tim-berners-lee|Tim Berners-Lee]] sat down at a black NeXT cube at {{cern|CERN}} and wrote both a web browser and a web server. The protocol that connected them — a single line of text — was [[http1|HTTP/0.9]]: \`GET /index.html\`. The server replied with the document and closed the connection. That was the entire specification.\n\nFrom that one-line origin grew the most-used application protocol in human history. But HTTP didn't get there by staying still. It went through three lifetimes — each forced by the previous one's success.\n\n**[[http1|HTTP/1.1]]** (1997) is what most people picture when they hear "HTTP": text headers, one request per connection, \`Keep-Alive\` to dodge the {{tcp-handshake|three-way handshake}} on every request. It powered the entire web for nearly two decades. It also has a fatal flaw that gets worse as pages get bigger: {{head-of-line-blocking|head-of-line blocking}}. One slow image stalls every request behind it.\n\n**[[http2|HTTP/2]]** (2015) was Google's answer. Binary frames, full multiplexing over a single connection, header compression with {{hpack|HPACK}}, server push. It started as a Chrome-only experiment called {{spdy|SPDY}}, proved itself in production, and was adopted almost wholesale by the {{ietf|IETF}}. The problem it didn't solve: it still runs over [[tcp|TCP]], and TCP itself has head-of-line blocking at the transport layer. A single dropped packet stalls every stream on the connection.\n\n**[[http3|HTTP/3]]** (2022) does the unthinkable: it abandons TCP. Instead, it runs over [[quic|QUIC]], a new transport protocol built on top of [[udp|UDP]]. QUIC owns the streams, owns the encryption (always [[tls|TLS]] 1.3, no opt-out), and — critically — a lost packet only stalls its own stream, not the whole connection. It also escapes the {{ossification|ossification}} trap: middleboxes can't peek into encrypted QUIC packets, so the protocol can keep evolving.\n\nEach version solved the previous one's pain point. Each created new ones. That's the story.`
		},
		{
			type: 'pioneers',
			title: 'The Three Architects',
			people: [
				{
					id: 'tim-berners-lee',
					name: 'Tim Berners-Lee',
					years: '1955–',
					title: 'Inventor of the World Wide Web',
					org: 'CERN / W3C / MIT',
					contribution:
						'Wrote the first web browser, web server, and HTML specification in late 1990. The original HTTP was a single `GET` line returning a document — no headers, no status codes, no methods. By 1996 [[http1|HTTP/1.0]] had grown headers and `POST`; [[http1|HTTP/1.1]] followed in 1997 with persistent connections that kept the web from drowning in {{tcp-handshake|TCP handshakes}}.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Tim_Berners-Lee_April_2009.jpg/330px-Tim_Berners-Lee_April_2009.jpg'
				},
				{
					id: 'mike-belshe',
					name: 'Mike Belshe',
					years: '–',
					title: 'Co-creator of SPDY → HTTP/2',
					org: 'Google',
					contribution:
						'In 2009 designed {{spdy|SPDY}} at Google with Roberto Peon — a binary, multiplexed, header-compressed replacement for [[http1|HTTP/1.1]] proving that one connection could carry many concurrent streams. SPDY shipped in Chrome in 2010; the {{ietf|IETF}} httpbis working group adopted SPDY/2 as the basis for [[http2|HTTP/2]] in 2012; RFC 7540 published in May 2015.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mike_Belshe_SALT_Conference.jpg/330px-Mike_Belshe_SALT_Conference.jpg'
				},
				{
					id: 'jim-roskind',
					name: 'Jim Roskind',
					years: '–',
					title: 'Designer of QUIC',
					org: 'Google',
					contribution:
						"Designed the original [[quic|QUIC]] at Google starting in 2012 — a fundamentally new transport over [[udp|UDP]] that solved [[http2|HTTP/2]]'s transport-layer {{head-of-line-blocking|head-of-line blocking}} by giving each stream its own loss-recovery context. The {{ietf|IETF}} took over standardization in 2016; [[http3|HTTP/3]] became RFC 9114 in June 2022. Roskind's key insight: encryption belongs *inside* the transport, not above it.",
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Jim_Roskind_2016.jpg/330px-Jim_Roskind_2016.jpg'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1990,
					title: 'HTTP/0.9 — The One-Line Protocol',
					description:
						'[[pioneer:tim-berners-lee|Berners-Lee]] writes the first web server on a NeXT cube at {{cern|CERN}}. The entire HTTP spec: `GET /path`. Server returns the document and closes.'
				},
				{
					year: 1996,
					title: 'HTTP/1.0 (RFC 1945)',
					description:
						'Headers arrive. Status codes. `POST`. Content-Type. Each request still opens a new [[tcp|TCP]] connection — the {{three-way-handshake|three-way handshake}} happens for every image on a page.'
				},
				{
					year: 1997,
					title: 'HTTP/1.1 (RFC 2068, later 7230–7235)',
					description:
						'Persistent connections (`Keep-Alive`) become the default. Pipelining is *specified* but breaks in practice. Chunked encoding, virtual hosts via `Host:` header, range requests. This is the HTTP that ran the web for 18 years.'
				},
				{
					year: 2009,
					title: 'SPDY at Google',
					description:
						"[[pioneer:mike-belshe|Mike Belshe]] and Roberto Peon ship {{spdy|SPDY}} in Chrome. Binary frames, multiplexed streams over one connection, header compression, server push. The web didn't need a new protocol — it needed [[http1|HTTP/1.1]] without its bottlenecks."
				},
				{
					year: 2012,
					title: 'IETF Adopts SPDY → HTTP/2',
					description:
						'The httpbis working group starts the next HTTP version using SPDY/2 as the base. Mozilla, Microsoft, and Apple all sign on. The biggest change since 1997 is now an industry consensus.'
				},
				{
					year: 2013,
					title: 'QUIC at Google',
					description:
						'[[pioneer:jim-roskind|Jim Roskind]] starts [[quic|QUIC]] — a UDP-based transport that bundles encryption, congestion control, and stream multiplexing into one. By 2017, ~7% of all Google traffic already runs on QUIC.'
				},
				{
					year: 2015,
					title: 'HTTP/2 Published (RFC 7540)',
					description:
						"Binary framing, multiplexing, {{hpack|HPACK}} header compression, server push (rarely used in practice). Solves [[http1|HTTP/1.1]]'s application-layer {{head-of-line-blocking|HoL blocking}}. Doesn't solve TCP's."
				},
				{
					year: 2016,
					title: 'IETF QUIC Working Group',
					description:
						'The IETF takes over QUIC from Google. The wire format is redesigned around [[tls|TLS]] 1.3 from the start. Standardization takes six years and 34 drafts.'
				},
				{
					year: 2021,
					title: 'QUIC v1 Published (RFC 9000)',
					description:
						'The transport is finally standardized: connection migration, 0-RTT, per-stream loss recovery, mandatory encryption. The longest-running IETF transport effort since [[tcp|TCP]] itself.'
				},
				{
					year: 2022,
					title: 'HTTP/3 Published (RFC 9114)',
					description:
						'HTTP over QUIC. {{qpack|QPACK}} replaces HPACK (which assumed in-order delivery). All major browsers ship support; Cloudflare, Google, and Facebook flip the switch. By 2024, ~30% of all web traffic runs HTTP/3.'
				}
			]
		},
		{
			type: 'callout',
			title: 'The Head-of-Line Blocking Saga',
			text: `Each HTTP version is, in some sense, a reaction to head-of-line blocking at a different layer.\n\n**[[http1|HTTP/1.1]]**: HoL blocking *at the application layer*. One request per connection means a slow response stalls the next request on that socket. Browsers worked around this by opening 6 parallel connections per origin.\n\n**[[http2|HTTP/2]]**: solves application-layer HoL with stream multiplexing — hundreds of concurrent requests over one connection. But it still runs over [[tcp|TCP]], and a single lost packet stalls *all* streams until TCP recovers it. HoL just moved down a layer.\n\n**[[http3|HTTP/3]]**: solves transport-layer HoL by moving streams *into* [[quic|QUIC]]. Each stream has its own loss-recovery context. One stream waiting for a retransmit doesn't block the others. The buck finally stops.`
		},
		{
			type: 'animated-sequence',
			title: 'Three Pages, Three Protocols',
			definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: HTTP/1.1 — one request at a time per connection
    C->>S: GET /index.html
    S-->>C: 200 OK HTML
    C->>S: GET /style.css
    S-->>C: 200 OK CSS
    C->>S: GET /app.js waits for CSS
    S-->>C: 200 OK JS
    Note over C,S: HTTP/2 — multiplexed over one TCP connection
    C->>S: Stream 1, GET /index.html
    C->>S: Stream 3, GET /style.css
    C->>S: Stream 5, GET /app.js
    S-->>C: Frames from Stream 1, 3, 5 interleaved
    Note over C,S: HTTP/3 — multiplexed over QUIC, no TCP HoL
    C->>S: Stream 0, GET /index.html
    C->>S: Stream 4, GET /style.css, independent loss recovery
    C->>S: Stream 8, GET /app.js, independent loss recovery
    S-->>C: Streams delivered in any order, loss on one does not stall others`,
			caption:
				"Same three requests, three protocols. In [[http1|HTTP/1.1]] they're serialized. In [[http2|HTTP/2]] they multiplex but share one TCP socket. In [[http3|HTTP/3]] each stream has its own loss recovery on top of [[quic|QUIC]].",
			steps: {
				0: '**[[http1|HTTP/1.1]] — serial requests on one connection.** With Keep-Alive, the client can reuse a TCP connection for many requests, but only one can be in flight at a time.',
				1: 'Client sends a **GET for the HTML**. Browser starts the page load.',
				2: 'Server returns the **HTML**. Only now can the browser see what other resources it needs.',
				3: 'Client sends **GET for the CSS** on the same connection.',
				4: 'Server returns the **CSS**. The JS request had to wait.',
				5: 'Client sends **GET for app.js** — pipelining was *specified* but in practice broken by servers and proxies, so browsers serialize. To compensate, browsers open **six parallel connections per origin**.',
				6: 'Server returns the **JS**. Latency stacks: 3 RTTs minimum for 3 small resources.',
				7: '**[[http2|HTTP/2]] — binary multiplexing.** All three requests fly down a single connection at once, each on its own stream ID. Server response frames are interleaved on the way back.',
				8: 'Client opens **stream 1** for the HTML — sent immediately, no waiting for prior requests.',
				9: 'Client opens **stream 3** for the CSS — sent in parallel with stream 1.',
				10: 'Client opens **stream 5** for the JS — also in parallel.',
				11: 'Server returns **interleaved frames** from all three streams. The page can start rendering as soon as the HTML frames arrive — no head-of-line blocking *at the application layer*. But all three streams share one TCP connection, and a single dropped TCP packet stalls all of them.',
				12: '**[[http3|HTTP/3]] — multiplexing without TCP HoL.** Each stream is owned by [[quic|QUIC]] (over UDP), with its own loss-recovery context. Stream 0 stalling does not affect stream 4 or 8.',
				13: 'Client opens **stream 0** for the HTML over QUIC.',
				14: "Client opens **stream 4** for the CSS — if a UDP packet carrying stream 4 is lost, QUIC retransmits only that stream's data.",
				15: 'Client opens **stream 8** for the JS — same independence.',
				16: '**Streams arrive in any order**, and packet loss on one does not stall the others. The HoL ghost that haunted HTTP for 25 years is finally exorcised — at the cost of moving reliable transport into user space.'
			}
		},
		{
			type: 'narrative',
			title: 'The Ossification Trap',
			text: `There's a subtle reason [[http3|HTTP/3]] runs on [[quic|QUIC]] over [[udp|UDP]] rather than on a new TCP-like protocol: **{{ossification|protocol ossification}}**. The internet's middleboxes — firewalls, NATs, deep-packet-inspection appliances — only understand [[tcp|TCP]] and [[udp|UDP]]. Anything else gets blocked. Worse, those middleboxes peek inside TCP headers and reject anything that doesn't look exactly like 1990s TCP. Try to add a new TCP option, and a few percent of the internet silently drops your packets.\n\nQUIC's defense: encrypt everything. Not just the payload — the *transport headers* too. Middleboxes can see a UDP packet going to port 443 and that's it. They can't inspect the QUIC framing, so they can't reject things they don't recognize. Future QUIC versions can change the wire format and middleboxes won't notice.\n\nThe price: implementing QUIC means re-implementing reliable transport in user space, since the kernel doesn't help. The reward: a transport that can evolve.`
		},
		{
			type: 'callout',
			title: 'Why HTTP/2 Server Push Mostly Died',
			text: `One of [[http2|HTTP/2]]'s big features was *server push*: a server could send resources to the client before the client asked for them. The idea was that if the client requests \`/index.html\`, the server can push \`/style.css\` and \`/app.js\` proactively.\n\nIn practice: it almost never helped. Servers couldn't predict what the client already had cached, so they re-sent things the client didn't need. The browser cache and the push cache fought each other. Chrome removed server push support in 2022. [[http3|HTTP/3]] kept the feature for compatibility but nobody uses it. The lesson: a clever optimization that requires guessing client state usually loses to just letting the client ask.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `[[http3|HTTP/3]] is shipping but not finished. Active work in 2025:\n\n- **{{webtransport|WebTransport}}**: bidirectional streams over QUIC, exposed to browsers — a possible replacement for [[websockets|WebSockets]] where you want UDP-like semantics with TLS.\n- **{{masque|MASQUE}}**: tunnel arbitrary protocols inside QUIC, used by iCloud Private Relay and similar privacy products.\n- **HTTP/2 over QUIC**: not actually a thing, but it's a useful reminder that the framing layer (HTTP) and the transport (TCP/QUIC) are now genuinely separable.\n- **Multipath QUIC**: the same [[mptcp|MPTCP]] idea — use multiple network paths in parallel — but for QUIC, which is much easier to evolve than TCP.\n\nThe deeper trend: HTTP is now the universal application protocol, and the interesting evolution is happening at the *transport* layer beneath it. After 35 years, the protocol that started as \`GET /index.html\` runs more of the world's traffic than any other single protocol — and the next chapter is being written by the people who decided TCP wasn't good enough anymore.`
		}
	]
};
