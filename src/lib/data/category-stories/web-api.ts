import type { CategoryStory } from './types';

export const webApiStory: CategoryStory = {
	categoryId: 'web-api',
	tagline: "From a physicist's hypertext idea to the platform that runs the world",
	sections: [
		{
			type: 'narrative',
			title: 'A Proposal That Changed Everything',
			text: `March 1989, CERN, Geneva. Tim Berners-Lee writes a proposal titled 'Information Management: A Proposal.' His boss writes 'Vague, but exciting' on the cover. This modest document describes a system of linked documents accessible over the network \u2014 the World Wide Web. At its heart: HTTP, a simple protocol where a client sends a request and a server sends a response.

The first version, HTTP/0.9, supported just one command: GET. No headers, no content types, no status codes. Just 'give me this document.' It was beautifully simple, and it was enough to start a revolution. [[http1]]`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/First_Web_Server.jpg/600px-First_Web_Server.jpg',
			alt: 'The NeXT computer used by Tim Berners-Lee at CERN, the world\'s first web server',
			caption:
				'The NeXT cube at CERN — the first web server and web browser, built by Tim Berners-Lee in 1990. The handwritten label reads "This machine is a server. DO NOT POWER IT DOWN!!"',
			credit: 'Photo: Coolcaesar / CC BY-SA 3.0, via Wikimedia Commons'
		},
		{
			type: 'pioneers',
			title: "The Web's Creators",
			people: [
				{
					name: 'Tim Berners-Lee',
					years: '1955\u2013',
					title: 'Inventor of the World Wide Web',
					org: 'CERN / W3C',
					contribution:
						'Created HTTP, HTML, and URLs \u2014 the three pillars of the web. Built the first web browser and server in 1990.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LS3_4919_%28cropped%29.jpg/330px-LS3_4919_%28cropped%29.jpg'
				},
				{
					name: 'Roy Fielding',
					years: '1965\u2013',
					title: 'Architect of HTTP/1.1 & REST',
					org: 'UC Irvine / Apache Foundation',
					contribution:
						'Co-authored the HTTP/1.1 specification (RFC 2616) and defined REST in his 2000 doctoral dissertation, shaping how modern APIs are designed.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Roy_Fielding_%28cropped%29.jpg/330px-Roy_Fielding_%28cropped%29.jpg'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1989,
					title: 'Tim Berners-Lee Proposes the WWW',
					description:
						'A CERN internal proposal describes a distributed hypertext system. The internet is about to become accessible to everyone.'
				},
				{
					year: 1991,
					title: 'HTTP/0.9 and the First Web Page',
					description:
						'The first web server goes live at CERN. HTTP/0.9 supports only GET \u2014 no headers, no POST, no status codes.'
				},
				{
					year: 1996,
					title: 'HTTP/1.0 \u2014 RFC 1945',
					description:
						'Headers, content types, and status codes arrive. The web can now serve images, forms, and different file types.'
				},
				{
					year: 1997,
					title: 'HTTP/1.1 \u2014 RFC 2068',
					description:
						'Persistent connections, chunked transfer, and host headers. The workhorse protocol that would serve the web for 18 years.',
					protocolId: 'http1'
				},
				{
					year: 1998,
					title: 'SOAP — XML Web Services',
					description:
						'Microsoft, IBM, and others introduce SOAP: XML-wrapped RPC calls with formal WSDL contracts. Enterprise web services become the dominant integration pattern.',
					protocolId: 'soap'
				},
				{
					year: 2000,
					title: "Roy Fielding's REST Dissertation",
					description:
						"Chapter 5 of Fielding's PhD thesis defines Representational State Transfer. It would take years for the industry to fully embrace it.",
					protocolId: 'rest'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The API Revolution',
			text: `Roy Fielding didn't set out to change how software was built. His dissertation was about understanding the web's architecture. But Chapter 5 \u2014 'Representational State Transfer' \u2014 described a set of constraints that, when followed, made web services scalable, simple, and loosely coupled. [[rest]] wasn't a protocol or a standard; it was a style. Use HTTP verbs (GET, POST, PUT, DELETE), use URLs as resource identifiers, make interactions stateless. It was the anti-SOAP \u2014 no XML envelopes, no complex schemas, just clean HTTP.

The API economy exploded. Every startup, every tech giant began exposing [[rest]] APIs. But REST had limitations: over-fetching (getting more data than you need) and under-fetching (needing multiple requests). Facebook's mobile team felt this acutely \u2014 their News Feed required dozens of endpoints per page load. In 2012, Lee Byron, Dan Schafer, and Nick Schrock began building [[graphql]], a query language that let clients ask for exactly the data they needed.

Meanwhile, Google's internal RPC system 'Stubby' was handling billions of requests per day. When they open-sourced it as [[grpc]] in 2016, it brought efficient binary serialization (Protocol Buffers), streaming, and HTTP/2 multiplexing to the microservices world.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Ginevra%2C_centro_visitatori_del_cern%2C_primo_server_della_storia_%281989%29%2C_02.JPG/600px-Ginevra%2C_centro_visitatori_del_cern%2C_primo_server_della_storia_%281989%29%2C_02.JPG',
			alt: "Tim Berners-Lee's 1989 proposal 'Information Management: A Proposal' displayed at the CERN visitors center",
			caption:
				"Berners-Lee's 1989 proposal on display at CERN — the document his supervisor Mike Sendall marked \"Vague, but exciting.\" It described HTTP, HTML, and URLs before any of them existed.",
			credit: 'Photo: Sailko / CC BY 3.0, via Wikimedia Commons'
		},
		{
			type: 'diagram',
			definition: `graph TD
  C[Client needs data]
  C --> R["REST"]
  C --> G["GraphQL"]
  C --> P["gRPC"]
  R -->|"3 requests"| R1["GET /users
GET /posts
GET /friends"]
  G -->|"1 query"| G1["{ user, posts, friends }"]
  P -->|"1 binary call"| P1["GetUser protobuf"]`,
			caption:
				'REST needs multiple round trips. GraphQL fetches exact data in one query. gRPC uses efficient binary serialization.'
		},
		{
			type: 'pioneers',
			title: 'The Protocol Innovators',
			people: [
				{
					name: 'Mike Belshe',
					years: '',
					title: 'Co-creator of SPDY',
					org: 'Google',
					contribution:
						'Led the development of SPDY, the experimental protocol that proved multiplexing could dramatically speed up the web, directly leading to HTTP/2.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mike_Belshe_SALT_Conference.jpg/330px-Mike_Belshe_SALT_Conference.jpg'
				},
				{
					name: 'Roberto Peon',
					years: '',
					title: 'Co-creator of SPDY & HPACK',
					org: 'Google',
					contribution:
						"Co-designed SPDY and created HPACK header compression, solving HTTP/1.1's header bloat problem for HTTP/2."
				},
				{
					name: 'Ian Fette',
					years: '',
					title: 'WebSocket Protocol Editor',
					org: 'Google',
					contribution:
						'Primary editor of the WebSocket protocol (RFC 6455), enabling full-duplex communication between browsers and servers.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2009,
					title: 'Google Begins SPDY',
					description:
						"Frustrated by HTTP/1.1's limitations, Google experiments with a multiplexed, compressed alternative. It works."
				},
				{
					year: 2011,
					title: 'WebSocket Protocol \u2014 RFC 6455',
					description:
						'Full-duplex communication arrives in browsers. Real-time web applications no longer need polling hacks.',
					protocolId: 'websockets'
				},
				{
					year: 2012,
					title: 'GraphQL Development Begins at Facebook',
					description:
						'The mobile News Feed needs a better way to fetch data. A query language for APIs is born.',
					protocolId: 'graphql'
				},
				{
					year: 2015,
					title: 'HTTP/2 \u2014 RFC 7540',
					description:
						"SPDY's ideas become an official standard: binary framing, multiplexing, server push, header compression.",
					protocolId: 'http2'
				},
				{
					year: 2015,
					title: 'GraphQL Open-Sourced',
					description:
						'Facebook releases GraphQL to the world. The developer community rapidly adopts it.',
					protocolId: 'graphql'
				},
				{
					year: 2016,
					title: 'gRPC 1.0 Released',
					description:
						'Google open-sources its internal RPC framework, built on HTTP/2 and Protocol Buffers.',
					protocolId: 'grpc'
				},
				{
					year: 2022,
					title: 'HTTP/3 \u2014 RFC 9114',
					description:
						'HTTP moves from TCP to QUIC. Multiplexing without head-of-line blocking. The transport layer is finally fixed.',
					protocolId: 'http3'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The Real-Time Web',
			text: `The original web was request-response: click a link, wait for a page. But modern applications need live data \u2014 chat messages, stock tickers, collaborative editing. [[websockets]] solved this by upgrading an HTTP connection into a persistent, full-duplex channel. For simpler use cases where only the server needs to push updates, [[sse|Server-Sent Events]] offered a lighter alternative over plain HTTP.

The evolution from [[http1]] to [[http2]] to [[http3]] tells a story of learning from real-world pain. Each generation addressed specific bottlenecks: persistent connections, multiplexing, and finally, fixing the transport layer itself with [[quic]].`
		},
		{
			type: 'pioneers',
			title: 'The API Architects',
			people: [
				{
					name: 'Lee Byron',
					years: '',
					title: 'Creator of GraphQL',
					org: 'Facebook / Meta',
					contribution:
						'Primary designer and evangelist of GraphQL. Built the reference implementation and led its open-source release.'
				},
				{
					name: 'Dan Schafer',
					years: '',
					title: 'Co-creator of GraphQL',
					org: 'Facebook / Meta',
					contribution:
						"Co-designed GraphQL's type system and query execution model, solving the mobile data-fetching problem."
				},
				{
					name: 'Nick Schrock',
					years: '',
					title: 'Co-creator of GraphQL',
					org: 'Facebook / Meta',
					contribution:
						"Co-created GraphQL and led the team that built it for Facebook's mobile applications."
				},
				{
					name: 'Ian Hickson',
					years: '1976\u2013',
					title: 'Creator of Server-Sent Events',
					org: 'Opera / Google / WHATWG',
					contribution:
						'Defined Server-Sent Events as part of the HTML5 specification, enabling simple server-to-client push over HTTP.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg/120px-Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg'
				},
				{
					name: 'Louis Ryan',
					years: '',
					title: 'gRPC Technical Lead',
					org: 'Google',
					contribution:
						"Led the development of gRPC from Google's internal Stubby system to an open-source RPC framework used across the industry."
				}
			]
		},
		{
			type: 'callout',
			title: 'From 1 Command to Millions',
			text: 'HTTP/0.9 had exactly one command: GET. Today, the web handles over 5 billion HTTP requests per second globally. Each generation of HTTP addressed real bottlenecks discovered through massive scale deployment \u2014 from connection reuse in HTTP/1.1, to multiplexing in HTTP/2, to transport-layer encryption in HTTP/3.'
		},
		{
			type: 'narrative',
			title: 'The AI Protocol Revolution',
			text: `In late 2024, a new class of protocols emerged \u2014 not for humans calling APIs, but for AI agents using tools and collaborating with each other. The catalyst was a deceptively simple problem: every AI application needed custom code for every integration. Connecting Claude to your database was a different project than connecting it to GitHub, which was different from Slack. An N\u00D7M matrix of bespoke integrations that didn't scale.

Anthropic's answer was [[mcp|MCP]] (Model Context Protocol) \u2014 a universal interface built on [[json-rpc|JSON-RPC]] 2.0 that lets any AI host discover and use any tool through a standard protocol. Define a tool once as an MCP server, and Claude, ChatGPT, Cursor, and VS Code can all use it. MCP collapsed the integration matrix from N\u00D7M to N+M. Within months, thousands of MCP servers existed for everything from databases to cloud infrastructure.

But MCP solved only half the puzzle. It connected agents to tools \u2014 what about connecting agents to *each other*? Google's [[a2a|A2A]] (Agent-to-Agent Protocol), announced in April 2025, addressed this. Where MCP is vertical (agent \u2192 tools), A2A is horizontal (agent \u2192 agent). A travel coordinator agent uses A2A to delegate to flight, hotel, and car rental agents \u2014 each of which uses MCP internally to access their own tools and databases. Both protocols chose [[json-rpc|JSON-RPC]] 2.0 as their wire format, and both moved to the Linux Foundation by the end of 2025, cementing them as open industry standards.`
		},
		{
			type: 'diagram',
			definition: `graph TD
  U["User / AI App"]
  U -->|"MCP"| T1["Database Tool"]
  U -->|"MCP"| T2["GitHub Tool"]
  U -->|"MCP"| T3["Slack Tool"]
  U -->|"A2A"| A1["Travel Agent"]
  U -->|"A2A"| A2["Research Agent"]
  A1 -->|"MCP"| T4["Flight API"]
  A1 -->|"MCP"| T5["Hotel API"]
  A2 -->|"MCP"| T6["Web Search"]`,
			caption:
				'MCP connects agents to tools (vertical). A2A connects agents to agents (horizontal). Each agent uses MCP internally for its own tools.'
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2005,
					title: 'JSON-RPC 2.0',
					description:
						'A minimal RPC protocol using JSON \u2014 method calls, results, notifications, and batches. The wire format that MCP and A2A would later build upon.',
					protocolId: 'json-rpc'
				},
				{
					year: 2024,
					title: 'MCP \u2014 Model Context Protocol',
					description:
						'Anthropic releases MCP, a universal interface for connecting AI applications to tools and data. Claude Desktop ships with MCP support.',
					protocolId: 'mcp'
				},
				{
					year: 2025,
					title: 'A2A \u2014 Agent-to-Agent Protocol',
					description:
						'Google announces A2A at Cloud Next, backed by 100+ partners. AI agents can now discover and collaborate with each other across vendors.',
					protocolId: 'a2a'
				},
				{
					year: 2025,
					title: 'Both Protocols Join the Linux Foundation',
					description:
						'MCP moves to the Agentic AI Foundation (AAIF) and A2A launches as a Linux Foundation project, establishing open governance for AI protocols.'
				},
				{
					year: 2026,
					title: 'A2A v1.0 and the Agentic Era',
					description:
						'A2A reaches v1.0 stability. MCP surpasses 97 million monthly SDK downloads. The two-protocol foundation of agentic AI is established.',
					protocolId: 'a2a'
				}
			]
		},
		{
			type: 'callout',
			title: 'MCP + A2A: Not a Competition',
			text: '[[mcp|MCP]] and [[a2a|A2A]] are complementary, not competing. [[mcp|MCP]] is how an agent uses its tools (like a worker using a hammer and saw). [[a2a|A2A]] is how agents collaborate (like workers coordinating on a construction site). A travel booking system uses [[a2a|A2A]] for the coordinator to delegate to specialist agents, and each specialist uses [[mcp|MCP]] to access flight databases, hotel APIs, and payment systems.'
		}
	]
};
