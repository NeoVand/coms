import type { Protocol } from '../types';

export const graphql: Protocol = {
	id: 'graphql',
	name: 'Graph Query Language',
	abbreviation: 'GraphQL',
	categoryId: 'web-api',
	port: 443,
	year: 2015,
	rfc: undefined,
	oneLiner: 'Ask for exactly the data you need — no more, no less. A query language for APIs.',
	overview: `GraphQL was created at Facebook in 2012 and open-sourced in 2015. It's now maintained by the GraphQL Foundation under the Linux Foundation. Instead of the server deciding what data each endpoint returns, the client sends a query describing exactly what it wants. The server responds with precisely that shape of data — no over-fetching (getting fields you don't need) and no under-fetching (needing 5 [[rest|REST]] calls for one screen).

GraphQL has three operation types: queries (read data), mutations (write data), and subscriptions (real-time updates pushed from the server, typically over [[websockets|WebSockets]]). It operates over [[http1|HTTP]] (typically a single /graphql endpoint accepting both {{http-method|GET and POST}} requests). The query language lets you traverse relationships, request nested data, and combine what would be multiple [[rest|REST]] requests into a single query. It also has a strong type system — the schema defines every type, field, and relationship.

It shines for complex frontends (mobile apps, SPAs) that need flexible data fetching. It's less ideal for simple CRUD operations where [[rest|REST]]'s simplicity wins.`,
	howItWorks: [
		{
			title: 'Define schema',
			description:
				'Server defines a typed schema: types, fields, relationships, and resolvers. This is the API contract.'
		},
		{
			title: 'Client writes query',
			description:
				'Client requests exactly the fields it needs, including nested relationships. One query replaces multiple REST calls.'
		},
		{
			title: 'Server resolves',
			description:
				'GraphQL engine parses the query, validates it against the schema, and calls resolver functions for each field.'
		},
		{
			title: 'Shaped response',
			description:
				"The response mirrors the query structure exactly. If you asked for user.name and user.posts.title, that's all you get."
		}
	],
	useCases: [
		'Mobile applications (minimize bandwidth)',
		'Complex dashboard UIs with varied data needs',
		'API gateways aggregating multiple services',
		'Content management systems',
		'E-commerce product pages with relationships'
	],
	codeExample: {
		language: 'python',
		code: `import requests

query = """
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
      posts(limit: 5) { title }
    }
  }
"""

response = requests.post(
    "https://api.example.com/graphql",
    json={"query": query, "variables": {"id": "42"}}
)

data = response.json()["data"]
print(data["user"]["name"], data["user"]["posts"])`,
		caption: 'One GraphQL query replaces multiple REST calls — ask for exactly the data you need',
		alternatives: [
			{
				language: 'javascript',
				code: `const query = \`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
      posts(limit: 5) {
        title
        createdAt
      }
    }
  }
\`;

const response = await fetch('https://api.example.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    variables: { id: '42' }
  })
});

const { data } = await response.json();
console.log(data.user.name, data.user.posts);`
			},
			{
				language: 'cli',
				code: `# GraphQL query via curl
curl -X POST https://api.example.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ user(id: 42) { name email } }"}'

# With variables
curl -X POST https://api.example.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query($id: ID!) { user(id: $id) { name } }",
    "variables": {"id": "42"}
  }'

# Introspection — discover the schema
curl -X POST https://api.example.com/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ __schema { types { name } } }"}'`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Query Request',
						code: `POST /graphql HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\nAuthorization: Bearer eyJhbGci...\n\n{\n  "query": "query GetUser($id: ID!) { user(id: $id) { name email posts { title } } }",\n  "variables": { "id": "42" }\n}`
					},
					{
						title: 'Response',
						code: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "data": {\n    "user": {\n      "name": "Alice Chen",\n      "email": "alice@example.com",\n      "posts": [\n        { "title": "Getting Started with GraphQL" },\n        { "title": "Advanced Query Patterns" }\n      ]\n    }\n  }\n}`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Single HTTP round trip for complex data needs (vs multiple REST calls)',
		throughput: 'No over-fetching reduces payload size; but complex queries can stress the server',
		overhead: 'Query parsing + validation adds server-side cost. Caching is harder than REST.'
	},
	connections: ['http1', 'http2', 'json-rpc', 'websockets', 'rest', 'sse', 'soap'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/GraphQL',
		official: 'https://graphql.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Facebook_Headquarters_Menlo_Park.jpg/500px-Facebook_Headquarters_Menlo_Park.jpg',
		alt: 'Facebook headquarters in Menlo Park, California, where GraphQL was created',
		caption:
			"Facebook's headquarters in Menlo Park — where GraphQL was created in 2012 to power the News Feed on mobile. The query language solved the over-fetching problem that REST APIs couldn't.",
		credit: 'Photo: Marcin Wichary / CC BY 2.0, via Wikimedia Commons'
	}
};
