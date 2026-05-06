import type { Protocol } from '../types';

export const a2a: Protocol = {
	id: 'a2a',
	name: 'Agent-to-Agent Protocol',
	abbreviation: 'A2A',
	categoryId: 'web-api',
	port: undefined,
	year: 2025,
	rfc: undefined,
	oneLiner:
		'An open protocol that lets AI agents discover each other, delegate tasks, and collaborate — even across different frameworks and vendors.',
	overview: `A2A solves the problem that [[mcp|MCP]] doesn't: how do AI agents talk to *each other*? MCP connects an agent to its tools and data sources, but modern AI systems increasingly need multiple specialized agents working together — a travel agent delegating to flight, hotel, and car rental agents; an HR agent coordinating with payroll, benefits, and IT provisioning agents. A2A provides the standard protocol for this multi-agent collaboration.

Google announced A2A in April 2025 at Cloud Next, backed by over 100 technology partners including Atlassian, Microsoft, Salesforce, SAP, and LangChain. The protocol uses [[json-rpc|JSON-RPC]] 2.0 over [[http1|HTTP]], with [[sse|SSE]] for streaming and webhooks for push notifications. A key design principle is {{opacity|opacity}}: agents are treated as black boxes. You don't see their internal reasoning, tool usage, or prompt chains — you see their **skills** (what they can do) and their **artifacts** (what they produce). This is fundamentally different from MCP, where the server's tools and resources are fully transparent.

Discovery happens through **Agent Cards** — JSON metadata documents served at \`/.well-known/agent.json\` that describe an agent's identity, capabilities, skills, and authentication requirements. The fundamental unit of work is a **Task**, which progresses through a defined lifecycle: submitted → working → completed (or failed, canceled, or input-required when the agent needs more information). In June 2025, A2A moved to the Linux Foundation, and version 1.0 shipped in early 2026. Together with [[mcp|MCP]], A2A forms the two-protocol foundation of the agentic AI era — MCP for tool use, A2A for agent collaboration.`,
	howItWorks: [
		{
			title: 'Agent discovery',
			description:
				"A client agent fetches the remote agent's Agent Card from /.well-known/agent.json. The card describes the agent's name, skills, supported capabilities (streaming, push notifications), and authentication requirements (API key, OAuth 2.0, OpenID Connect)."
		},
		{
			title: 'Send a message',
			description:
				'The client sends a JSON-RPC request to the remote agent\'s endpoint using "message/send" (synchronous) or "message/stream" (streaming via SSE). The message contains Parts — TextPart, FilePart, or DataPart — describing what the client needs.'
		},
		{
			title: 'Task lifecycle',
			description:
				'The remote agent creates a Task and begins processing. The task progresses through states: submitted → working → completed. If the agent needs more information, it returns "input-required" and the client sends additional messages to the same task.'
		},
		{
			title: 'Artifacts returned',
			description:
				'As the agent works, it produces Artifacts — structured outputs composed of Parts (text, files, data). Artifacts can be streamed incrementally via SSE or returned all at once in the final response.'
		},
		{
			title: 'Async & push',
			description:
				'For long-running tasks, the agent can send push notifications to a client-provided webhook URL, allowing the client to disconnect and receive updates later. Tasks can also be canceled or queried for status.'
		}
	],
	useCases: [
		'Multi-agent travel booking (coordinator delegates to flight, hotel, car agents)',
		'Enterprise workflow orchestration across departments (HR, IT, payroll)',
		'Customer service routing to specialized agents (billing, technical, returns)',
		'Cross-vendor AI collaboration (agents from different companies working together)',
		'Supply chain negotiation between procurement and supplier agents'
	],
	codeExample: {
		language: 'python',
		code: `from a2a.server.agent_execution import AgentExecutor
from a2a.server.events import EventQueue
from a2a.types import AgentCard, AgentSkill

class TravelAgent(AgentExecutor):
    async def execute(self, context, event_queue: EventQueue):
        # Process the user's request
        request = context.get_user_message()
        flights = await self.search_flights(request)

        # Return results as an artifact
        event_queue.enqueue_event(
            new_artifact_event(parts=[
                TextPart(text=f"Found {len(flights)} flights"),
                DataPart(data={"flights": flights})
            ])
        )

# Define the Agent Card
card = AgentCard(
    name="Travel Agent",
    url="http://localhost:9000",
    version="1.0.0",
    skills=[
        AgentSkill(id="flights", name="Flight Search",
                   description="Search and book flights")
    ],
    capabilities={"streaming": True}
)`,
		caption:
			'An A2A agent publishes its skills in an Agent Card and handles tasks via an executor — the SDK manages JSON-RPC, streaming, and task lifecycle.',
		alternatives: [
			{
				language: 'javascript',
				code: `// A2A Client — discover and call a remote agent
const cardRes = await fetch(
  'http://travel-agent:9000/.well-known/agent.json'
);
const agentCard = await cardRes.json();
console.log('Skills:', agentCard.skills);

// Send a task to the agent
const response = await fetch(agentCard.url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'message/send',
    params: {
      message: {
        role: 'user',
        messageId: 'msg-001',
        parts: [{
          kind: 'text',
          text: 'Find flights from NYC to London next week'
        }]
      }
    },
    id: 1
  })
});

const { result: task } = await response.json();
console.log('Task status:', task.status.state);
console.log('Artifacts:', task.artifacts);`
			},
			{
				language: 'cli',
				code: `# Discover an agent's capabilities
curl -s http://localhost:9000/.well-known/agent.json | jq

# Send a task to an agent
curl -X POST http://localhost:9000 \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "message/send",
    "params": {
      "message": {
        "role": "user",
        "messageId": "msg-001",
        "parts": [{"kind": "text", "text": "Find flights NYC to London"}]
      }
    },
    "id": 1
  }'

# Stream results via SSE
curl -N -X POST http://localhost:9000 \\
  -H "Content-Type: application/json" \\
  -H "Accept: text/event-stream" \\
  -d '{"jsonrpc":"2.0","method":"message/stream","params":{...},"id":2}'`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Agent Card (/.well-known/agent.json)',
						code: `{\n  "name": "Travel Agent",\n  "description": "Books flights, hotels, and car rentals",\n  "url": "https://travel.example.com/a2a",\n  "version": "1.0.0",\n  "protocolVersion": "1.0",\n  "capabilities": {\n    "streaming": true,\n    "pushNotifications": true\n  },\n  "skills": [\n    {\n      "id": "flights",\n      "name": "Flight Search",\n      "description": "Search and book flights worldwide"\n    }\n  ],\n  "securitySchemes": [\n    { "type": "oauth2", "authorizationUrl": "https://travel.example.com/oauth/authorize" }\n  ]\n}`
					},
					{
						title: 'Task Lifecycle (message/send)',
						code: `── Client → Agent ──\n{"jsonrpc":"2.0","method":"message/send","params":{"message":{"role":"user","messageId":"msg-001","parts":[{"kind":"text","text":"Find flights NYC to London"}]}},"id":1}\n\n── Agent → Client (task in progress) ──\n{"jsonrpc":"2.0","result":{"id":"task-42","status":{"state":"working","message":"Searching 3 airlines..."},"artifacts":[]},"id":1}\n\n── Agent → Client (task completed) ──\n{"jsonrpc":"2.0","result":{"id":"task-42","status":{"state":"completed"},"artifacts":[{"artifactId":"art-001","name":"flight_options","parts":[{"kind":"text","text":"Found 3 flights"},{"kind":"data","data":{"flights":[{"airline":"BA","price":450},{"airline":"AA","price":520}]}}]}]},"id":1}`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'HTTP round-trip latency per message. Tasks are designed for longer-lived interactions (seconds to hours). SSE streaming provides real-time progress without polling.',
		throughput:
			'JSON-RPC over HTTP — similar to REST API throughput. gRPC transport option (v0.3+) available for high-volume scenarios.',
		overhead:
			'Agent Card discovery adds one HTTP request at startup. Task lifecycle management adds minimal state overhead per task.'
	},
	connections: ['grpc', 'http1', 'json-rpc', 'mcp', 'rest', 'sse', 'websockets'],
	links: {
		official: 'https://a2a-protocol.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/IntelligentAgent-Learning.svg',
		alt: 'Diagram of an intelligent agent interacting with its environment — perceiving through sensors, acting through actuators, with an internal learning and decision-making loop',
		caption:
			'The intelligent agent model from Russell & Norvig — an agent perceives its environment, reasons about it, and takes actions. A2A standardizes how these agents discover each other, delegate tasks, and exchange results across organizational boundaries.',
		credit: 'Image: Wikimedia Commons / Public Domain, based on Russell & Norvig'
	}
};
