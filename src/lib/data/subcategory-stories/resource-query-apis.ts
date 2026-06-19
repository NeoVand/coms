import type { SubcategoryStory } from './types';

export const resourceQueryApisStory: SubcategoryStory = {
	subcategoryId: 'resource-query-apis',
	tagline:
		'Modeling data on the web — verbs and nouns ([[rest|REST]]) vs schemas and queries ([[graphql|GraphQL]])',
	sections: [
		{
			type: 'narrative',
			title: 'Two Philosophies of an API',
			text: `In 2000, [[pioneer:roy-fielding|Roy Fielding]] wrote his PhD dissertation. Chapter 5 — "Representational State Transfer" — gave a name to the architectural style the web *already worked by*: resources identified by URLs, manipulated through a fixed vocabulary of {{http-verbs|HTTP verbs}}, with hypermedia controls embedded in responses. Fielding wasn't proposing something new. He was articulating the constraints that made the web scale.\n\n**[[rest|REST]]** became the default way to design web APIs for the next two decades. Every CRUD app, every microservice, every SaaS integration spoke REST. The simplicity was the feature: any client that understood [[http1|HTTP]] could call any REST endpoint. Documentation was a sentence and a curl example.\n\nThen, in 2012, Facebook hit a wall. Their mobile app was making *dozens* of REST calls per screen — one for the user, one for the user's posts, one for each post's comments, one for each comment's author. On a flaky cellular link, this was a disaster: latency stacked roundtrip on roundtrip, and the app downloaded fields it didn't need (over-fetching) while still missing fields it did (under-fetching, requiring more calls).\n\n**[[graphql|GraphQL]]** was Facebook's answer, open-sourced in 2015. Instead of fixed endpoints returning fixed shapes, GraphQL exposes a *schema* — a typed graph of fields a client can navigate. Each request describes exactly the fields it wants, across as many entities as it needs, in one round trip. The shape of the response matches the shape of the query.\n\nThe two are not enemies. They answer different questions: REST asks "what resources does my domain have?"; GraphQL asks "what data does my client need?" Most teams today run both, and the choice between them is one of the most common arguments in modern API design.`
		},
		{
			type: 'pioneers',
			title: 'The API Style Architects',
			people: [
				{
					id: 'roy-fielding',
					name: 'Roy Fielding',
					years: '1965–',
					title: 'Inventor of REST',
					org: 'UC Irvine / Apache / Adobe',
					contribution:
						'Co-authored the [[http1|HTTP/1.0]] and [[http1|HTTP/1.1]] specifications in the late 1990s, then named the architectural style underlying the web in his 2000 PhD dissertation. The dissertation\'s Chapter 5 — 36 pages — is the entire formal definition of [[rest|REST]]. Co-founded the Apache HTTP Server Project. Fielding has spent 25 years gently noting that the vast majority of "REST APIs" violate his {{hateoas|HATEOAS}} constraint and are really just RPC-over-HTTP.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Roy_Fielding_%28cropped%29.jpg/330px-Roy_Fielding_%28cropped%29.jpg'
				},
				{
					name: 'Lee Byron',
					years: '–',
					title: 'Co-creator of GraphQL',
					org: 'Facebook / Robinhood / The Graph Foundation',
					contribution:
						'Designed [[graphql|GraphQL]] at Facebook in 2012 with Nick Schrock and Dan Schafer to solve the mobile-fetch problem. Open-sourced in 2015 at React Conf. Later moved to Robinhood to apply GraphQL to financial-services APIs; now stewards the language as part of the GraphQL Foundation. The original internal name was "SuperGraph" — "GraphQL" came later because the wire format was a *query language*, not just a graph API.'
				},
				{
					name: 'Sam Newman',
					years: '–',
					title: 'Microservices Author',
					org: 'Independent',
					contribution:
						"Author of *Building Microservices* (O'Reilly, 2015), the book that codified how to design [[rest|REST]] APIs for service boundaries. Newman's pragmatic take — \"REST is a constraint set, not a religion\" — became the dominant working interpretation for the cloud-native era. Most production REST APIs today follow Newman's pattern (resources, verbs, JSON over HTTPS) more than Fielding's strict dissertation definition."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2000,
					title: "Fielding's Dissertation Names REST",
					description:
						'[[pioneer:roy-fielding|Fielding]] formalizes the architectural style behind the web in *Architectural Styles and the Design of Network-based Software Architectures*. Six constraints: client-server, stateless, cacheable, uniform interface, layered system, code-on-demand.'
				},
				{
					year: 2006,
					title: 'AWS S3 Launches with REST API',
					description:
						'Amazon Web Services ships S3 with a [[rest|REST]] API alongside SOAP. Developers overwhelmingly choose REST. The lesson — "SOAP is for vendors, REST is for developers" — shapes a decade of API design.'
				},
				{
					year: 2008,
					title: 'REST Becomes the Default',
					description:
						'Twitter, Flickr, Google APIs all default to [[rest|REST]] + JSON. SOAP is on its way out for public-facing APIs. The pattern: a noun-shaped URL, a verb-shaped HTTP method, a JSON body.'
				},
				{
					year: 2012,
					title: 'Facebook Begins GraphQL',
					description:
						'Lee Byron, Nick Schrock, and Dan Schafer start GraphQL internally to fix mobile-app fetch storms. The original problem: a Facebook News Feed screen made 30+ REST calls on slow 3G.'
				},
				{
					year: 2015,
					title: 'GraphQL Open-Sourced',
					description:
						'Facebook releases [[graphql|GraphQL]] at React.js Conf. GitHub announces its API v4 will be GraphQL within months. The schema-typed, client-driven query model spreads fast.'
				},
				{
					year: 2018,
					title: 'GraphQL Foundation Forms',
					description:
						'Linux Foundation takes stewardship from Facebook. The community proves the spec can outlive its original maintainers — a recurring fear with single-vendor open source.'
				},
				{
					year: 2020,
					title: 'OpenAPI 3.1 / JSON Schema Convergence',
					description:
						'REST gets a typed-schema story too. OpenAPI 3.1 aligns with JSON Schema 2020-12. Tools like Speakeasy, Stainless, and Fern generate typed clients from OpenAPI specs — narrowing the developer-experience gap with GraphQL.'
				},
				{
					year: 2022,
					title: 'tRPC + End-to-End Types',
					description:
						'A wave of "GraphQL without GraphQL" — tRPC, Hono RPC, ts-rest — uses TypeScript inference to give clients end-to-end types without a separate schema language. Works only inside TypeScript monorepos, but where it works it\'s instant.'
				},
				{
					year: 2024,
					title: 'GraphQL Federation Matures',
					description:
						'Apollo Federation 2, GraphQL Mesh, and StepZen mature the "multiple subgraphs composed into one" pattern. GraphQL becomes the default API gateway for microservices at Netflix, Airbnb, Shopify.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'REST vs GraphQL',
			axes: ['Endpoint shape', 'Fetch behavior', 'Caching', 'Schema', 'Best when'],
			rows: [
				{
					label: '[[rest|REST]]',
					values: [
						'Many endpoints, one per resource',
						'Fixed response shape — possible over/under-fetch',
						'HTTP cache works by default (GET + ETag + Cache-Control)',
						'Optional (OpenAPI is convention, not required)',
						'CRUD over well-defined resources; public APIs; CDN-cacheable'
					]
				},
				{
					label: '[[graphql|GraphQL]]',
					values: [
						'One endpoint, schema-typed',
						'Client picks fields — exactly what is asked, nothing more',
						'Harder — usually app-level (Apollo Client, Relay) or persisted queries',
						'Mandatory typed schema (SDL)',
						'Mobile/web clients with deep object graphs; aggregating microservices'
					]
				}
			],
			note: '[[graphql|GraphQL]] solves the N+1 fetch problem at the cost of throwing away HTTP caching. [[rest|REST]] keeps HTTP caching but pays in client-side aggregation. Most teams pick based on whose problem is bigger.'
		},
		{
			type: 'animated-sequence',
			title: 'The Same Query, Two Ways',
			definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: REST — multiple roundtrips for nested data
    C->>S: GET /users/42
    S-->>C: user object with id, name, email
    C->>S: GET /users/42/posts
    S-->>C: array of post summaries
    C->>S: GET /posts/107/comments AND /posts/108/comments
    S-->>C: comments per post, separately
    Note over C,S: GraphQL — one roundtrip, exactly the fields requested
    C->>S: POST /graphql with nested user, posts, comments query
    S-->>C: nested JSON with everything requested`,
			caption:
				"Same data, two shapes. [[rest|REST]] makes the client orchestrate; [[graphql|GraphQL]] makes the server resolve. The cost of GraphQL's flexibility is that the server has to be ready for *any* query, which makes performance and authorization harder to reason about.",
			steps: {
				0: "**The REST way.** Each entity has its own URL. Fetching nested data — user, their posts, each post's comments — means several sequential requests because the client needs response N to know what to ask for in request N+1.",
				1: 'Client asks for the **user**.',
				2: "Server returns user fields. Now the client knows it can ask for this user's posts.",
				3: "Client asks for the **user's posts**.",
				4: "Server returns post summaries. Now the client has post IDs and can ask for each post's comments.",
				5: '**Client asks for comments — one request per post.** Or two requests, or fifty. The classic "N+1 query" problem of REST APIs.',
				6: 'Server returns comments for each post in separate responses. The client now has all the data — but it took multiple round-trips and most of the bytes were headers.',
				7: '**The GraphQL way.** One request describes the entire nested shape the client wants. The server resolves all of it at once and returns exactly what was asked for.',
				8: 'Client sends **one POST to /graphql** with a query body specifying user → posts → comments → author/body. The shape of the request mirrors the shape of the wanted response.',
				9: "Server returns **nested JSON** matching the query shape exactly. One round-trip; zero over-fetch (no fields the client didn't ask for); zero under-fetch (everything the client needed in one trip). The cost: the server has to be smart enough to resolve any arbitrary tree shape efficiently."
			}
		},
		{
			type: 'callout',
			title: 'HATEOAS — The Constraint Almost Nobody Implements',
			text: `Fielding's [[rest|REST]] dissertation has a constraint called **{{hateoas|HATEOAS}}**: Hypermedia As The Engine of Application State. The idea: a client should discover what actions are possible by following hyperlinks in the response, not by reading API documentation that hardcodes URL patterns.\n\nA strictly RESTful response to \`GET /orders/42\` would include not just the order data but links: "to cancel, POST to /orders/42/cancel"; "to add a line item, POST to /orders/42/items." The client would never construct a URL — it would follow the links the server hands it. Add a new state transition, and clients pick it up for free.\n\nAlmost nobody does this. Production "REST" APIs are pattern-based: clients know that \`POST /orders/{id}/cancel\` exists because it's documented, not because the order resource told them. Fielding has spent twenty years gently insisting these aren't REST APIs — they're "HTTP RPC." The world has gently ignored him. The pragmatic working definition of REST has won, even if the formal definition has not.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[rest|REST]]'s failure mode is **chatty clients**. A list view that shows 50 items, each with three sub-resources, is 151 HTTP calls if you do it the obvious way. Workarounds — \`?include=\` query parameters, JSON:API's sparse fieldsets, custom batch endpoints — accrete until your REST API is a tangle of escape hatches. Caching helps if the data is cacheable; if it's personalized, it doesn't.\n\n[[graphql|GraphQL]]'s failure mode is **expensive queries**. A client can ask for *anything* the schema allows, including \`users { friends { friends { friends { name } } } }\` — a query that explodes in cost. Solutions exist: query-cost analysis, persisted queries, automatic field-level rate-limiting — but they're all *additional work* the server has to do that REST avoids by simply not letting clients ask for arbitrary shapes. GraphQL also makes HTTP caching nearly useless: every query is a POST with a body, so CDNs can't cache it without a layer of indirection (persisted query hashes).\n\nThe two failure modes are mirror images. REST lets the server constrain everything but forces the client to coordinate. GraphQL lets the client request anything but forces the server to defend.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **GraphQL Federation** is becoming the default architecture for large API gateways — multiple teams own subgraphs that compose into one client-facing schema. Apollo Federation, StepZen, GraphQL Mesh.\n- **REST + types** is closing the developer-experience gap with GraphQL. OpenAPI 3.1, Stainless, Speakeasy, Fern all generate typed clients from REST specs that feel nearly as good as GraphQL codegen.\n- **tRPC and friends** keep growing inside TypeScript monorepos. End-to-end inferred types, no schema language, no codegen. The boundary: any client outside the monorepo needs a real API.\n- **JSON:API** quietly powers a lot of "strict REST with conventions" deployments — the spec is unfashionable but solves the "every REST API reinvents pagination" problem.\n- **The unsexy truth**: most companies run both. REST for public/partner APIs and CDN-cacheable reads. GraphQL for first-party mobile and web clients. Choosing one and using it for everything is rare in practice.`
		}
	]
};
