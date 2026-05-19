import type { Protocol } from '../types';

export const mcp: Protocol = {
	id: 'mcp',
	name: 'Model Context Protocol',
	abbreviation: 'MCP',
	categoryId: 'web-api',
	port: undefined,
	year: 2024,
	rfc: undefined,
	oneLiner:
		'A universal interface that lets AI applications discover and use tools, data, and prompts from any server.',
	overview: `[[mcp|MCP]] is the protocol that solved the AI integration problem. Before [[mcp|MCP]], every AI application needed custom code for every data source — connecting Claude to your database was a different project than connecting it to GitHub, which was different again from connecting it to Slack. An N-clients × M-tools matrix of bespoke integrations. [[mcp|MCP]] collapses this to N + M: each AI host implements the [[mcp|MCP]] client once, each tool implements the [[mcp|MCP]] server once, and they all interoperate.

{{anthropic|Anthropic}} released [[mcp|MCP]] in November 2024, and it was quickly adopted across the industry — Claude, ChatGPT, Copilot, Cursor, VS Code, and Replit all speak [[mcp|MCP]]. The protocol uses [[json-rpc|JSON-RPC]] 2.0 as its wire format, running over two transports: stdio (for local tools spawned as subprocesses) and Streamable HTTP (for remote servers, where responses can upgrade to [[sse|SSE]] streams). A three-step initialization {{handshake|handshake}} negotiates capabilities: the client declares what it supports ({{sampling|sampling}}, roots, elicitation), the server declares what it offers (tools, resources, prompts), and both sides confirm readiness.

The architecture has three roles: the **Host** (the AI application you interact with), the **Client** (a protocol handler inside the host that manages one session), and the **Server** (a lightweight process exposing tools, resources, and prompts). A single host can connect to many servers simultaneously. In December 2025, {{anthropic|Anthropic}} donated [[mcp|MCP]] to the Agentic AI Foundation under the {{linux|Linux}} Foundation, co-founded with Block and OpenAI. By early 2026, the protocol was processing over 97 million SDK downloads per month. [[a2a|A2A]] complements [[mcp|MCP]] — where [[mcp|MCP]] connects an agent to its tools, [[a2a|A2A]] connects agents to each other.`,
	howItWorks: [
		{
			title: 'Transport connection',
			description:
				'The host starts the [[mcp|MCP]] server — either spawning it as a local subprocess (stdio transport) or connecting to a remote HTTP endpoint (Streamable HTTP transport). No protocol messages flow yet.'
		},
		{
			title: 'Initialize handshake',
			description:
				'The client sends an "initialize" [[json-rpc|JSON-RPC]] request declaring its protocol version and capabilities ({{sampling|sampling}}, roots, elicitation). The server responds with its own version and capabilities (tools, resources, prompts). The client then sends a "notifications/initialized" {{notification|notification}} to confirm readiness.'
		},
		{
			title: 'Discovery',
			description:
				'The client calls "tools/list" to discover available tools (with {{json|JSON}} Schema input definitions), "resources/list" to find data sources, and "prompts/list" to find prompt templates. The LLM uses these to decide what to invoke.'
		},
		{
			title: 'Tool invocation',
			description:
				'When the LLM decides to use a tool, the client sends "tools/call" with the tool name and arguments. The server executes the tool and returns results as text, images, or structured data. Resources are read with "resources/read."'
		},
		{
			title: 'Session lifecycle',
			description:
				'The session stays open for multiple interactions. The server can send notifications (progress updates, resource changes). Either side can close the transport — for stdio, the host terminates the subprocess; for HTTP, the connection is closed.'
		}
	],
	useCases: [
		'IDE coding assistants accessing file systems, git, and databases (Cursor, VS Code)',
		'AI chatbots querying enterprise knowledge bases and CRMs',
		'Automated workflows connecting LLMs to APIs (Slack, GitHub, Jira)',
		'Multi-tool AI orchestration with dynamic tool discovery',
		'Local development tools exposing capabilities to AI agents'
	],
	codeExample: {
		language: 'python',
		code: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Demo Server")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Return a personalized greeting."""
    return f"Hello, {name}!"

@mcp.prompt()
def review_code(code: str) -> str:
    """Generate a code review prompt."""
    return f"Please review this code:\\n{code}"

# Run with: mcp run server.py
# Or: mcp dev server.py (for inspector UI)`,
		caption:
			'Three lines of decorator code expose a tool, a resource, and a prompt — the [[mcp|MCP]] SDK handles all the [[json-rpc|JSON-RPC]] plumbing.',
		alternatives: [
			{
				language: 'javascript',
				code: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "demo-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// Register a tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "add",
    description: "Add two numbers",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" }
      }
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => ({
  content: [{
    type: "text",
    text: String(req.params.arguments.a + req.params.arguments.b)
  }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);`
			},
			{
				language: 'cli',
				code: `# Install the MCP CLI
pip install mcp

# Run an MCP server
mcp run server.py

# Open the MCP Inspector (interactive debugging UI)
mcp dev server.py

# Test with curl (Streamable HTTP transport)
curl -X POST http://localhost:3000/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Install an MCP server in Claude Desktop
# Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
# { "mcpServers": { "demo": { "command": "python", "args": ["server.py"] } } }`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Initialize Handshake',
						code: `── Client → Server ──\n{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{"sampling":{},"roots":{"listChanged":true}},"clientInfo":{"name":"claude-desktop","version":"1.0"}},"id":1}\n\n── Server → Client ──\n{"jsonrpc":"2.0","result":{"protocolVersion":"2025-11-25","capabilities":{"tools":{"listChanged":true},"resources":{"subscribe":true},"prompts":{}},"serverInfo":{"name":"demo-server","version":"1.0.0"}},"id":1}\n\n── Client → Server (notification, no id) ──\n{"jsonrpc":"2.0","method":"notifications/initialized"}`
					},
					{
						title: 'Tool Discovery & Invocation',
						code: `── Client → Server ──\n{"jsonrpc":"2.0","method":"tools/list","id":2}\n\n── Server → Client ──\n{"jsonrpc":"2.0","result":{"tools":[{"name":"add","description":"Add two numbers","inputSchema":{"type":"object","properties":{"a":{"type":"number"},"b":{"type":"number"}}}}]},"id":2}\n\n── Client → Server ──\n{"jsonrpc":"2.0","method":"tools/call","params":{"name":"add","arguments":{"a":42,"b":23}},"id":3}\n\n── Server → Client ──\n{"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"65"}]},"id":3}`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'stdio transport has near-zero overhead (IPC, no network). Streamable HTTP adds one HTTP round trip per call. Tool execution time dominates.',
		throughput:
			'JSON-RPC 2.0 framing is lightweight. Throughput depends on the tool implementation — a database query tool is limited by the database, not MCP.',
		overhead:
			'Minimal protocol overhead — a tools/call request is ~100 bytes of JSON. The initialize handshake adds one round trip at session start.'
	},
	connections: ['a2a', 'grpc', 'http1', 'json-rpc', 'rest', 'sse', 'websockets'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Model_Context_Protocol',
		official: 'https://modelcontextprotocol.io/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Model_Context_Protocol_Component_diagram.svg',
		alt: 'Model Context Protocol component diagram showing the Host, Client, and Server architecture with tool, resource, and prompt primitives',
		caption:
			'The [[mcp|MCP]] architecture — a Host (AI application) creates Clients that connect 1:1 to Servers. Each Server exposes tools, resources, and prompts through a standard [[json-rpc|JSON-RPC]] interface. Created by {{anthropic|Anthropic}} in 2024 and donated to the {{linux|Linux}} Foundation in 2025.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
