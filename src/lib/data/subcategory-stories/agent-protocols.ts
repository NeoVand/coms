import type { SubcategoryStory } from './types';

export const agentProtocolsStory: SubcategoryStory = {
	subcategoryId: 'agent-protocols',
	tagline:
		"Protocols emerging in real time for AI agents — designed in public, in months instead of years",
	sections: [
		{
			type: 'narrative',
			title: 'A New Family, Designed in Public',
			text: `Almost every protocol in this app was designed by an IETF working group across years of drafts. **[[mcp|MCP]]** (Model Context Protocol) and **[[a2a|A2A]]** (Agent-to-Agent) are different. They emerged in 2024–2025, driven by single companies (Anthropic for MCP, Google for A2A), iterated in GitHub repos in weeks rather than working groups over years, and reached widespread adoption faster than any networking protocol in living memory.\n\nThey answer two adjacent but different questions:\n\n- **[[mcp|MCP]]** asks: *how does a single AI agent connect to its tools, data, and resources?* Anthropic published the spec in November 2024 as a JSON-RPC-based protocol for "letting models reach the world." A model wants to read a file? Call an MCP server that exposes filesystem operations. Query a database? Talk to a database MCP server. Read GitHub issues? GitHub ships an MCP server. The protocol standardizes the shape of "tool" so any model can use any tool that speaks the protocol.\n- **[[a2a|A2A]]** asks: *how do multiple AI agents work together?* Google announced it in April 2025 to handle the cross-agent case MCP intentionally doesn't address. A travel-planning agent needs to delegate flight booking to a flight-booking agent owned by a different vendor. A2A defines how agents discover each other, describe their capabilities, exchange messages, and hand off tasks.\n\nNeither protocol is finished. Both are likely to look quite different in two years. What's notable is *how fast* — and how visibly — they're being built. The repos are public; the design discussions are public; the implementations land within days of the spec changing. This is what protocol design looks like when speed-of-shipping matters as much as careful design.`
		},
		{
			type: 'pioneers',
			title: 'The Agent Architects',
			people: [
				{
					name: 'David Soria Parra',
					years: '–',
					title: 'MCP Lead Designer',
					org: 'Anthropic',
					contribution:
						"Led the [[mcp|MCP]] design and initial implementation at Anthropic, drawing on the Language Server Protocol (LSP) as a structural model — LSP standardized editor-to-language-server communication a decade ago, and MCP applies the same client-server-via-[[json-rpc|JSON-RPC]] pattern to AI tools. The November 2024 launch shipped reference servers (filesystem, GitHub, Slack, Postgres) alongside the spec, which mattered: people could *use* MCP the day it was announced."
				},
				{
					name: 'Justin Hill',
					years: '–',
					title: 'MCP Protocol Co-Author',
					org: 'Anthropic',
					contribution:
						"Co-authored the [[mcp|MCP]] specification and helped shape the resource/tool/prompt abstraction that became the protocol's core. The choice to keep MCP transport-agnostic — stdio for local subprocesses, HTTP+SSE for remote, anything pluggable — let the protocol be both lightweight (one Python script) and scalable (a hosted SaaS) without redesign."
				},
				{
					name: 'Surya Pratheek Vadlamani',
					years: '–',
					title: 'A2A Lead',
					org: 'Google Cloud',
					contribution:
						'Led the [[a2a|Agent-to-Agent]] protocol design at Google, announced April 2025. A2A built explicitly on top of standards rather than reinventing them: HTTP for transport, JSON-RPC over [[sse|SSE]] for streaming, OAuth 2.0 for auth, OpenAPI-like agent cards for capability discovery. The deliberate decision to *not* compete with MCP — A2A handles cross-agent, MCP handles agent-to-tools — set up a clean two-protocol division of labor.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2022,
					title: 'ChatGPT Launches',
					description:
						'OpenAI ships ChatGPT in November 2022. Within six months, the question "how do I let the model use my tools/data?" becomes the dominant integration problem in the industry.'
				},
				{
					year: 2023,
					title: 'Function Calling Becomes Standard',
					description:
						'OpenAI ships function calling in June; Anthropic ships tool use in November. Every model API now has *some* way to declare callable tools. None of them are interoperable — each provider has its own JSON shape.'
				},
				{
					year: 2024,
					title: 'MCP Announced',
					description:
						'Anthropic publishes the [[mcp|Model Context Protocol]] in November 2024. JSON-RPC, transport-agnostic, with three core abstractions: resources (data), tools (actions), prompts (templates). Reference servers ship alongside the spec.'
				},
				{
					year: 2025,
					title: 'MCP Adoption Explodes (Q1)',
					description:
						"Within months, MCP servers exist for GitHub, Slack, Linear, Notion, Postgres, Sentry, Figma, Stripe, Datadog, and ~hundreds more. Claude Desktop and Cursor ship MCP support. The protocol is shipping in production before the spec hits 1.0."
				},
				{
					year: 2025,
					title: 'A2A Announced (April)',
					description:
						'Google announces [[a2a|Agent2Agent]] at Cloud Next 2025. 50+ launch partners including Salesforce, SAP, Workday, ServiceNow, and Atlassian. Designed to complement MCP, not compete with it.'
				},
				{
					year: 2025,
					title: 'OpenAI Adopts MCP (March)',
					description:
						'OpenAI announces MCP support in the Agents SDK and ChatGPT desktop. Even Anthropic\'s competitor ships the Anthropic-designed protocol — a sign of how strong the network effect already is.'
				},
				{
					year: 2025,
					title: 'MCP Spec Becomes 2025-06-18 / SEP Process',
					description:
						"The protocol moves from rapid-iteration to a Specification Enhancement Proposal (SEP) process — explicit versioning, formal change control, multi-vendor governance discussions. Growing-up begins."
				},
				{
					year: 2025,
					title: 'A2A v0.2 (June)',
					description:
						"A2A 0.2 adds richer streaming via [[sse|SSE]], improved task state model (submitted → working → completed/canceled/failed), and standardized agent cards for capability discovery. The first iteration that companies are running across vendor boundaries in production."
				}
			]
		},
		{
			type: 'comparison',
			title: 'MCP vs A2A',
			axes: ['Scope', 'Transport', 'Core abstraction', 'Discovery', 'Maturity'],
			rows: [
				{
					label: '[[mcp|MCP]]',
					values: [
						'Agent ↔ tools/data (one agent, many resources)',
						'[[json-rpc|JSON-RPC]] over stdio or HTTP+SSE',
						'Resources, tools, prompts',
						'Static config or registry; each client lists servers',
						"~1 year old (Nov 2024); ecosystem of hundreds of servers"
					]
				},
				{
					label: '[[a2a|A2A]]',
					values: [
						'Agent ↔ agent (across systems/vendors)',
						'HTTP + SSE for streaming, JSON-RPC for messages',
						'Tasks, messages, agent cards',
						'Agent cards advertise capabilities (similar to OpenAPI)',
						"~6 months old (Apr 2025); rapid early adoption"
					]
				}
			],
			note: 'These are designed to *compose*: an agent uses [[mcp|MCP]] to talk to its own tools, and uses [[a2a|A2A]] to delegate work to other agents. A travel-planning agent might call MCP servers for its calendar and email, then call out via A2A to a flight-booking agent for the actual reservation.'
		},
		{
			type: 'animated-sequence',
			title: 'A Tool Call via MCP',
			definition: `sequenceDiagram
    participant U as User
    participant M as Model
    participant H as Host App
    participant S as MCP Server
    Note over U,H: User asks the host app to list files
    U->>H: message
    H->>S: initialize
    S-->>H: server info and capabilities
    H->>S: tools/list
    S-->>H: list of available tools
    H->>M: user message and tool catalog
    M-->>H: tool_use call for list_files
    H->>S: tools/call list_files
    S-->>H: result with file names
    H->>M: tool_result
    M-->>H: text response describing files
    H->>U: assistant message`,
			caption:
				"[[mcp|MCP]]'s flow has four actors: user, model, host (the app the user is using), and one or more MCP servers. The model never talks to servers directly — the host orchestrates. This separation is what lets the same MCP server work with Claude, GPT, or any other model.",
			steps: {
				0: '**The user prompts the host app** (Claude Desktop, Cursor, Zed, a custom agent...) with a natural-language request — here, "list the files in ~/Documents."',
				1: 'User message flows into the **host app** — the only piece that talks to both the model AND the MCP servers. The model never reaches a server directly.',
				2: '**Host initializes the MCP server** if it has not already (one-time per session). This negotiates protocol version and capabilities.',
				3: 'Server replies with its **info and capabilities** — what protocol version it speaks, what classes of features (tools, resources, prompts) it offers.',
				4: 'Host calls **tools/list** to discover what tools the server exposes.',
				5: 'Server returns a **list of available tools** with their JSON Schema input definitions. The host now knows exactly what the model can ask for.',
				6: 'Host passes the **user message + tool catalog** to the model in a single LLM call. The model sees the available tools as if they were its own functions.',
				7: 'Model decides to call **list_files**. This is a structured "tool_use" output — not free text — including the argument values.',
				8: 'Host translates the model\'s decision into **tools/call** on the MCP server. The model itself never sees the server.',
				9: 'Server executes the tool (reads the filesystem) and returns the **result** as text or structured content.',
				10: 'Host feeds the **tool_result** back to the model as if completing the function call.',
				11: 'Model produces a **natural-language response** describing the result. ("Your Documents folder has report.pdf, notes.md, ...")',
				12: 'Host delivers the **assistant message** to the user. From the user\'s perspective, it was one conversation.'
			}
		},
		{
			type: 'callout',
			title: 'Why MCP Looks Like LSP',
			text: `[[mcp|MCP]]'s design is unusually clean for a year-old protocol. The reason is that it isn't really new. It's the **Language Server Protocol** (LSP) — the standard that lets VS Code use the same language servers as Vim, Sublime, Emacs, and JetBrains — with the editor swapped out for an AI model.\n\nLSP defines client/server roles, [[json-rpc|JSON-RPC]] message framing, capability negotiation during initialization, lifecycle methods (initialize, shutdown), notification vs request semantics, transport-agnostic operation (stdio or socket). MCP defines the same things with slightly different vocabulary: "tools" instead of "code actions," "resources" instead of "text documents," "prompts" instead of "snippets." The structural similarity is intentional.\n\nLSP shipped in 2016 and is now standard across every modern editor. The bet behind MCP is that the same architectural pattern — *standardize the protocol, let everyone implement their side* — will work for AI tools. So far the bet is paying off: an MCP server written for Claude works in Cursor, in GPT-4o's desktop client, in custom agents, and in third-party hosts, without any per-host adaptation. That is the LSP playbook running again.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[mcp|MCP]]'s failure mode is **security**. The protocol gives models broad capability to take action — read files, call APIs, send emails. A model that has been prompt-injected (a malicious string in a document it reads) can use that capability against the user. The standard mitigations — user confirmation for sensitive actions, sandboxing, capability scoping — are not in the protocol; they're left to host apps to implement. Quality varies wildly. The category that the protocol enables — universal tool access for models — is exactly the category most ripe for abuse.\n\n[[a2a|A2A]]'s failure mode is **delegation chains**. An agent delegates to another agent, which delegates to a third, which calls back to the first. Tracking what user authorized what, what data flows where, and who is liable when something goes wrong is genuinely unsolved. A2A's OAuth-based auth gives the basics — each delegation can be scoped — but the operational reality of "this prompt crossed five agent boundaries; which one hallucinated?" is hard.\n\nBoth families also share a **spec-velocity** failure mode: the protocol changes monthly, and implementations split between "current spec" and "the spec from when I wrote this." For a year or two this will continue; eventually the protocols will stabilize the way HTTP did, but we're not there yet.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **MCP authorization** — the November 2024 spec was light on auth. The 2025-06 spec introduces standardized OAuth 2.1 flows for HTTP-transported MCP servers. Expect this to be a major focus through 2026.\n- **MCP for non-text resources** — current MCP is text-centric. Audio, images, structured binary, and streaming media are early targets. The protocol's extensibility (resources can be any MIME type) is the right shape; tooling has to catch up.\n- **A2A registries** — early A2A is mostly statically configured. A registry — a "DNS for agents" — is the obvious next step but raises hard governance questions about who runs it.\n- **Cross-protocol bridges** — agents that speak A2A to other agents and MCP to their own tools. The composition is the point; the bridges are non-trivial.\n- **Standards-body uptake** — both protocols are currently single-vendor. Anthropic and Google have both signaled openness to formal standards-body governance (W3C, IETF). Whether that happens, and when, will shape whether agent protocols become *the* interoperability layer or just *an* interoperability layer.\n\nThis is the first new protocol family in this app where the next chapter is genuinely unwritten. Check back in a year.`
		}
	]
};
