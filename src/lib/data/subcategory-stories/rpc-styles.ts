import type { SubcategoryStory } from './types';

export const rpcStylesStory: SubcategoryStory = {
	subcategoryId: 'rpc-styles',
	tagline:
		"Call a remote function like a local one — the dream of remote procedure call across forty years of attempts",
	sections: [
		{
			type: 'narrative',
			title: 'The Dream That Never Quite Dies',
			text: `In 1984, Andrew Birrell and Bruce Nelson at Xerox PARC published "Implementing Remote Procedure Calls." The idea was seductive: take a normal function call, marshal its arguments into a network message, send it to another machine, unmarshal the result back. The programmer wouldn't know the function ran on a different computer. **Remote procedure call (RPC)** would make distributed systems feel like local code.\n\nThe dream is older than the implementations. Every generation has tried to make it real:\n\n- **CORBA** (1991) — the OMG's grand vision. Language-neutral, platform-neutral, object-oriented RPC. Generated huge stubs, required IDL compilers, and shipped famously complex middleware. By 2005, mostly abandoned outside specific industries (defense, telecom).\n- **XML-RPC** (1998) and **[[soap|SOAP]]** (1999) — the XML era. WSDL for service description, complex type schemas, layers of \`<envelope>\` wrapping. Powered enterprise integration for a decade. Killed by [[rest|REST]] + JSON.\n- **[[json-rpc|JSON-RPC]]** (2005) — the deliberate minimalist response to SOAP. Five fields: \`jsonrpc\`, \`method\`, \`params\`, \`id\`, \`result\`/\`error\`. That's the whole spec.\n- **[[grpc|gRPC]]** (2015) — Google's modern revival. Protocol Buffers for typed schemas, [[http2|HTTP/2]] for transport, code generation for clients in a dozen languages. Now the default for internal microservice RPC at Google, Netflix, Square, Lyft, and most cloud-native startups.\n\nThe pattern is the same every time: somebody decides the previous generation's RPC framework is too heavy, ships a minimalist replacement, then watches it grow features until *it* is the heavy framework. RPC's gravitational pull is real — the dream of "just call the function" never goes away.`
		},
		{
			type: 'pioneers',
			title: 'The RPC Architects',
			people: [
				{
					name: 'Andrew Birrell & Bruce Nelson',
					years: '–',
					title: 'RPC Originators',
					org: 'Xerox PARC',
					contribution:
						'Co-authored "Implementing Remote Procedure Calls" (ACM TOCS, 1984) — the paper that defined the term and the basic architecture. Birrell stayed at PARC then DEC SRC; Nelson moved to a long career at Cisco. Their three-decade-old design (caller stub, server skeleton, marshalling, transport) is still the structure of every RPC framework shipping today, including [[grpc|gRPC]].'
				},
				{
					name: 'Don Box',
					years: '–',
					title: 'SOAP Co-author',
					org: 'Microsoft / Developer Division',
					contribution:
						'Co-authored the original SOAP 1.0 specification (1999) with Dave Winer, Bob Atkinson, Mohsen Al-Ghosein, and Satish Thatte. SOAP was meant to be a lightweight XML-based RPC for the web — the *Simple* in SOAP was sincere. It then accumulated WS-* extensions (WS-Security, WS-Addressing, WS-ReliableMessaging) until "simple" no longer applied. Box later became a vocal advocate for the simpler [[rest|REST]] + JSON style that displaced SOAP.'
				},
				{
					name: 'Louis Ryan',
					years: '–',
					title: 'gRPC Tech Lead',
					org: 'Google',
					contribution:
						"Led the [[grpc|gRPC]] project at Google starting in 2015. gRPC began as an internal Google framework called Stubby that had run Google's microservices since the mid-2000s. The 2015 open-source version was a rewrite using [[http2|HTTP/2]] and Protocol Buffers — both designed inside Google for similar reasons. gRPC is now the default RPC framework across the cloud-native ecosystem; the CNCF graduated it in 2017."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1984,
					title: 'Birrell & Nelson Define RPC',
					description:
						'The PARC paper that names the pattern and the architecture. Every later RPC framework follows its three-component model.'
				},
				{
					year: 1987,
					title: 'Sun RPC / ONC RPC',
					description:
						"Sun ships RPC as the foundation for NFS. XDR for marshalling, portmap for service discovery. The first widely-deployed RPC outside research."
				},
				{
					year: 1991,
					title: 'CORBA 1.0',
					description:
						"The Object Management Group's vision: language- and platform-neutral object RPC. Defined IIOP, IDL, naming services, transactions. Powerful, complex, eventually abandoned."
				},
				{
					year: 1998,
					title: 'XML-RPC Published',
					description:
						"Dave Winer's deliberately minimal XML-over-HTTP RPC. The spec fits on a napkin. Becomes the first widely-used \"RPC for the web.\""
				},
				{
					year: 1999,
					title: 'SOAP 1.0',
					description:
						"Microsoft + Userland + others publish [[soap|SOAP]] — XML-RPC reframed for enterprise. WSDL for service description; XML Schema for types. Adoption explodes through 2005."
				},
				{
					year: 2005,
					title: 'JSON-RPC 1.0',
					description:
						"[[json-rpc|JSON-RPC]] — the conscious reaction to SOAP's complexity. Five fields, JSON wire format, transport-neutral. Quietly powers Ethereum, Bitcoin, many editor/LSP protocols."
				},
				{
					year: 2008,
					title: 'Protocol Buffers Open-Sourced',
					description:
						"Google releases protobuf — the typed binary serialization format used internally since 2001. Schemas in \`.proto\` files generate strongly-typed code in C++, Java, Python, Go."
				},
				{
					year: 2015,
					title: 'gRPC 1.0',
					description:
						"Google open-sources [[grpc|gRPC]] — protobuf + HTTP/2 streaming + bidirectional streams + deadlines + cancellation. The clean-room successor to Stubby, Google's internal RPC framework."
				},
				{
					year: 2017,
					title: 'gRPC CNCF Graduation',
					description:
						"gRPC graduates from the CNCF, signaling production-grade across the cloud-native ecosystem. By 2020 it's the default for service-to-service RPC at most cloud-native companies."
				},
				{
					year: 2021,
					title: 'gRPC-Web Goes Mainstream',
					description:
						"Browsers can't speak HTTP/2 trailers directly, so [[grpc|gRPC]]-Web routes through a proxy (Envoy). Connect-Web (Buf, 2022) and improved tooling make typed RPC viable from web clients."
				},
				{
					year: 2024,
					title: 'Buf Connect Protocol',
					description:
						"Connect — a gRPC-compatible protocol that also speaks plain HTTP/JSON — splits the difference between gRPC and REST. Same .proto definitions, runs in browsers without a proxy."
				}
			]
		},
		{
			type: 'comparison',
			title: 'Three RPC Styles',
			axes: ['Wire format', 'Schema', 'Transport', 'Code generation', 'Where it dominates'],
			rows: [
				{
					label: '[[soap|SOAP]]',
					values: [
						'XML (envelopes, namespaces, schemas)',
						'WSDL + XSD',
						'Usually HTTP/1.1; sometimes SMTP, JMS',
						'Heavy — generated stubs in every language',
						'Legacy enterprise integration (banking, government, healthcare)'
					]
				},
				{
					label: '[[json-rpc|JSON-RPC]]',
					values: [
						'JSON',
						'None required',
						'Transport-neutral (HTTP, WebSocket, TCP, stdio)',
						'None (hand-write the call)',
						'Wallets, editors (LSP), blockchain nodes'
					]
				},
				{
					label: '[[grpc|gRPC]]',
					values: [
						'Protocol Buffers (binary)',
						'.proto IDL (typed, versioned)',
						'[[http2|HTTP/2]] streaming',
						"Heavy — generates clients in C++, Java, Go, Python, Ruby, JS, etc.",
						'Internal microservices at scale; mobile-to-backend with typed contracts'
					]
				}
			],
			note: "All three are RPC. They differ on *who pays for the type system*: [[soap|SOAP]] makes everyone pay heavily; [[json-rpc|JSON-RPC]] doesn't have one; [[grpc|gRPC]] makes you pay once at codegen time, then types are free."
		},
		{
			type: 'animated-sequence',
			title: 'gRPC Bidirectional Streaming',
			definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Unary RPC — like a function call
    C->>S: RouteRequest with start and end
    S-->>C: RouteResponse with distance and duration
    Note over C,S: Server streaming — one request, many responses
    C->>S: ListFeatures over a rectangle
    S-->>C: Feature 1
    S-->>C: Feature 2
    S-->>C: Feature 3
    Note over C,S: Bidirectional streaming — both sides send simultaneously
    C->>S: RouteChat message 1
    S-->>C: ack 1
    C->>S: message 2
    S-->>C: response and ack 2
    C->>S: message 3
    S-->>C: response and ack 3
    Note over C,S: Same HTTP/2 connection, streams interleave at the frame layer`,
			caption:
				"[[grpc|gRPC]] inherits [[http2|HTTP/2]]'s stream multiplexing — a single connection carries many concurrent calls, each with its own request and response stream. Unary, server-streaming, client-streaming, and bidirectional are all the same primitive.",
			steps: {
				0: '**Unary RPC.** The simplest mode: one request, one response. Looks like a function call. This is what 90% of gRPC traffic is.',
				1: 'Client sends a **RouteRequest** with start and end coordinates.',
				2: 'Server returns a **RouteResponse** with the distance and duration. Done.',
				3: '**Server streaming.** Client sends one request; server sends *many* responses. Useful when the response is conceptually a sequence (search results, live event feeds, batched data).',
				4: 'Client calls **ListFeatures** with a geographic rectangle. The server will return every feature inside.',
				5: 'Server sends **Feature 1**. The client can start processing it before the rest arrive.',
				6: 'Server sends **Feature 2**.',
				7: 'Server sends **Feature 3** and then closes the stream. The client knows there are no more.',
				8: '**Bidirectional streaming.** Both sides can send independently and asynchronously. This is the mode that makes gRPC powerful for real-time apps — and the one that browsers historically could not consume without gRPC-Web.',
				9: 'Client opens a **chat-like call** and sends message 1.',
				10: 'Server **acks**. The two streams are independent — server replies can come at any time, in any order relative to client messages.',
				11: 'Client sends message 2 — without waiting.',
				12: 'Server responds to and acks message 2 in one frame.',
				13: 'Client sends message 3.',
				14: 'Server responds. The two sides keep ping-ponging until either closes the stream.',
				15: '**One HTTP/2 connection** carries all of these calls (and dozens more in parallel for other RPCs). HTTP/2\'s frame multiplexing means small messages from different streams interleave without blocking each other.'
			}
		},
		{
			type: 'callout',
			title: 'Why SOAP Lost (and Where It Survives)',
			text: `By 2010, [[soap|SOAP]] was dead for new public APIs. The reasons stack up:\n\n- **The WS-* explosion.** SOAP started simple; then WS-Security, WS-Addressing, WS-ReliableMessaging, WS-AtomicTransaction, WS-Policy, WS-Coordination, WS-MetadataExchange each landed as separate specs. Implementations diverged. Interoperability promised by WSDL became fragile.\n- **XML was expensive.** Verbose envelopes, namespace declarations, type annotations. A 500-byte JSON payload was a 5 KB SOAP envelope. On slow links and small devices, the difference mattered.\n- **The "open" failed.** SOAP tooling was great if you were on .NET or J2EE — the languages WSDL was designed around. From Ruby, Python, Node.js, or browser JavaScript, SOAP was painful.\n- **REST was good enough.** [[rest|REST]] + JSON gave 80% of SOAP's value with 10% of the complexity.\n\nWhere SOAP survives: banking (SWIFT, ISO 20022), insurance, government B2B integrations, telecom OSS/BSS. Anywhere the integration was signed in 2007, the contract is still there. New SOAP development in 2025 is rare, but maintenance of existing SOAP estates is steady work.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[soap|SOAP]]\'s failure mode is **schema drift**. WSDL pinned the contract at design time, but when servers changed types or added required fields without coordinating client updates, clients broke. WSDL versioning was clunky, and there was no standard way to evolve a contract gracefully. Most enterprises wrote their own change-control processes around SOAP services.\n\n[[json-rpc|JSON-RPC]]\'s failure mode is **no contract at all**. Because there is no schema, what passes for an API is documentation — and documentation drifts from implementation. Wallets and blockchain nodes have lived with this for a decade; the workaround is "be very conservative about changing anything." Adding a field is usually safe; renaming is not.\n\n[[grpc|gRPC]]\'s failure mode is **proxy hostility**. HTTP/2 trailers (used for status) aren\'t spoken by browsers, by many corporate proxies, or by old load balancers. Production gRPC at the edge typically requires a proxy (Envoy) to translate. gRPC-Web and the newer Connect protocol exist precisely to escape this. The lesson: every RPC framework eventually meets a middlebox it can\'t pass through.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **Connect protocol** (Buf, 2024) — a [[grpc|gRPC]]-compatible protocol that also speaks plain HTTP/JSON, eliminating the browser-proxy problem. Same .proto files generate clients for both transports.\n- **Cap\'n Proto + Tonic + Twirp** — lighter alternatives to full gRPC, each with niche followings. Twirp keeps protobuf but drops streaming and HTTP/2 for simpler operations.\n- **OpenAPI codegen catching up** — Stainless, Speakeasy, Fern generate typed clients from OpenAPI specs that rival the gRPC developer experience. The line between "typed REST" and "JSON-over-HTTP RPC" is dissolving.\n- **Schema-on-the-wire** experiments (Cap\'n Proto, Apache Avro for streaming) keep niche traction in data pipelines and storage formats.\n- **The unsexy truth**: [[grpc|gRPC]] won internal microservice RPC. [[json-rpc|JSON-RPC]] won blockchain and editor protocols. [[soap|SOAP]] is in maintenance. New API design in 2025 picks gRPC if everything is yours and behind your edge; picks typed REST/OpenAPI if anything is public.`
		}
	]
};
