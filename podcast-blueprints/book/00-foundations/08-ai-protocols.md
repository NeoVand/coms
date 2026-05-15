---
id: foundations/ai-protocols
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: Protocols for AI Agents
synopsis: MCP and A2A — the new layer of protocols designed for AI agents.
podcast_target_minutes: 15
position_in_book: chapter 9 of 75
listening_order:
  prev: foundations/encryption-basics
  next: story-of-the-internet/before-the-internet
related_protocols: [websockets, http1, grpc, graphql, sse, smtp, imap, xmpp, mqtt, mcp, a2a, json-rpc, dns, tcp]
related_pioneers: []
related_outages: []
related_frontier: [a2a-linux-foundation, mcp-streamable-http]
related_rfcs: []
images: []
visual_cues:
  - "A timeline from 2011 to 2026 showing WebSockets at 2011, then a fifteen-year flat stretch with HTTP, gRPC, GraphQL, SSE, SMTP, IMAP, XMPP, MQTT labelled along it, then a sharp inflection at November 2024 with MCP and April 2025 with A2A."
  - "An N-by-M grid of AI hosts and tools collapsing into an N-plus-M hub-and-spoke as MCP slots in between them."
  - "A two-layer stack diagram — top layer agents talking to each other over A2A, bottom layer each agent talking to its tools over MCP, both layers labelled JSON-RPC 2.0 over HTTP-or-stdio."
  - "A side-by-side comparison of specification page counts: JSON-RPC 2.0 at 6 pages, gRPC at 50-plus, GraphQL at 200-plus, MQTT 5 at 130-plus."
  - "An MCP server as a tiny executable, under 100 lines of code, exposing read_file, write_file, list_directory tools to a host process over stdio."
---

# Part I, Chapter — Protocols for AI Agents

## The hook

For fifteen years, the application layer of the internet did not get a new protocol. From WebSockets in 2011 through to late 2024, every meaningful application rode on HTTP, gRPC, GraphQL, SSE, or one of the older mail and messaging protocols. Then in November 2024, Anthropic published the Model Context Protocol. Five months later, Google published Agent-to-Agent. By 2026, MCP servers numbered in the thousands, A2A was supported by every major agent framework, and the application layer had a new floor for the first time in a decade and a half.

## The story

### The First New Application Layer in Fifteen Years

The starting fact is the gap. After WebSockets shipped in 2011 — the protocol that let a browser hold a full-duplex connection open to a server, more on the mechanism in the WebSockets episode — the application layer of the internet was settled. HTTP did the heavy lifting, in three versions. gRPC handled service-to-service. GraphQL gave clients flexible queries. SSE streamed events one way over plain HTTP. The older protocols still ran the world they already ran: SMTP for mail, IMAP for inboxes, XMPP for federated chat, MQTT for IoT. Nothing genuinely new appeared in the window between 2011 and late 2024.

What changed was not the network. What changed was that AI coding assistants and chat agents started needing to talk to tools — file systems, databases, GitHub, Postgres, Slack, internal APIs. Every integration was being hand-written. With N AI hosts and M tools, the industry was building an N-times-M matrix of bespoke connectors. Each pair was a separate engineering project.

In November 2024, Anthropic published the Model Context Protocol. The premise was simple. Standardise the contract. Each AI host implements the MCP client once. Each tool implements the MCP server once. The matrix collapses from N times M to N plus M. The MCP episode covers the wire format and the initialisation handshake; the chapter story is that this is the first time since WebSockets that someone published an application-layer protocol and the rest of the industry actually picked it up.

In April 2025, Google published Agent-to-Agent — A2A — at Cloud Next, backed by more than 100 partners including Atlassian, Microsoft, Salesforce, SAP, and LangChain. A2A handled the case MCP did not address: how AI agents discover each other, delegate tasks, and stream events back. A travel agent delegating to a flight agent and a hotel agent. An HR agent coordinating with payroll and IT provisioning. The unit of work in A2A is a Task — submitted, working, completed, failed, cancelled, or waiting on input. The mechanism — Agent Cards, skills, artifacts, the opacity model that treats other agents as black boxes — is the A2A episode.

Six months after A2A launched, both protocols moved into the Linux Foundation. Google donated A2A in June 2025; Anthropic donated MCP to the Agentic AI Foundation — an LF directed fund co-founded with Block and OpenAI — in December 2025. This is the inflection point worth marking: within a single year, two competing AI giants put their agent protocols into open governance, side by side, under the same umbrella. By early 2026, A2A 1.0 had shipped and MCP was processing more than 97 million SDK downloads per month. Mid-2026 industry analyses put MCP at roughly 78% enterprise adoption versus A2A at roughly 23% — the boundary between "agent" and "tool" is still fuzzy, and multi-agent collaboration is still an emerging use case. There is more on the donations themselves on the Frontier page, in the entry for A2A joining the Linux Foundation.

### Why JSON-RPC 2.0

Both MCP and A2A picked JSON-RPC 2.0 as their wire format. The choice is deliberate, and worth pausing over.

JSON-RPC 2.0 is, by application-protocol standards, boring. The specification is six pages. gRPC is 50-plus pages. GraphQL is 200-plus. MQTT 5 is 130-plus. A JSON-RPC request is a JSON object with a method name, parameters, and an id. A response is a JSON object with the same id and either a result or an error. Notifications are requests without an id that expect no reply. Batch requests are arrays of either. That is the entire protocol.

The boringness is the point. The Language Server Protocol — the thing that powers code intelligence in VS Code, Neovim, JetBrains, and basically every modern editor — uses JSON-RPC 2.0 over stdio. Ethereum's node API is JSON-RPC. Bitcoin Core speaks JSON-RPC. The Chrome DevTools Protocol uses it. Created in 2005 as a lightweight alternative to XML-based SOAP, JSON-RPC stayed deliberately small while the rest of the web API world piled on complexity. Version 2.0 in 2010 added the mandatory `"jsonrpc": "2.0"` field, standardised error codes, introduced notifications, and added batches. It has barely changed since. The full mechanism is in the JSON-RPC episode.

For a brand-new protocol layer where adoption is the existential risk, picking the format that already works in every language and every developer's mental model is the right move. MCP and A2A could have invented a binary protocol with schemas. Instead they let the message shape be a transport-level concern and put their innovation in what the messages mean.

### Same engineering principles, new domain

AI protocols follow patterns that look very familiar. Capability discovery, like DNS — a server lists what it can do, the client queries the list. Request-response messaging, like HTTP — each call has a method, parameters, a result. Stateful sessions, like TCP — a connection has an initialisation handshake, and subsequent calls share that context. Streaming, like SSE — long-running operations push progress events back to the caller. The engineering vocabulary is the same. What is new is the payload domain — describing tools, agents, capabilities, prompts, and resources.

### What An MCP Server Actually Looks Like

A minimal MCP server is a single executable, often under 100 lines of code, that speaks JSON-RPC over stdin and stdout for local servers, or HTTP plus SSE for remote ones — over the streamable HTTP transport finalised in March 2025. There is more on that transport switch in the Frontier entry on MCP Streamable HTTP.

When the agent starts, it spawns the server and sends an `initialize` request. The server responds with its capabilities — which tools, prompts, and resources it offers. The agent calls `tools/list` to learn the names and schemas. Later, when it actually wants to invoke one, it calls `tools/call` with the tool name and arguments. The server runs the work, returns the result, and the agent decides what to do next.

The shape is intentionally small. A filesystem MCP server has tools like `read_file`, `write_file`, `list_directory`. A GitHub MCP server has `list_issues`, `create_pr`, `merge_pr`. A Postgres MCP server has `query`, `execute`, `describe_table`. None of these servers know anything about Anthropic, Cursor, ChatGPT, or any specific agent. They just expose a contract. Any MCP-aware client can use any MCP-aware server — Claude, ChatGPT, Copilot, Cursor, VS Code, Replit. They all speak it.

The architecture's resemblance to the original HTTP story is not accidental. Berners-Lee invented HTTP as a small, composable contract that any client could speak to any server, and the most interesting question turned out to be what got built on top of it. MCP is the same shape, applied to agents and tools instead of browsers and documents — and like HTTP, the most interesting question is what gets built on top of it.

## The figures

### MCP architects — the Anthropic team, 2024 onward

Published the Model Context Protocol in November 2024 with a deliberate decision to make it open and vendor-neutral from day one. Within a year, MCP had thousands of public servers and native support across every major agent framework. In December 2025 the team donated the protocol to the Agentic AI Foundation under the Linux Foundation, co-founded with Block and OpenAI.

### A2A architects — the Google A2A team, 2025 onward

Published Agent-to-Agent in April 2025 to handle the collaboration-between-agents case that MCP did not address. Six months later they moved it into the Linux Foundation, deliberately preventing any single company — including Google — from controlling the agent layer. By early 2026 every major agent framework spoke A2A.

### A2A Donated to the Linux Foundation

Google unveiled A2A on 9 April 2025 at Cloud Next with more than 50 partners, and donated it to the Linux Foundation in June 2025. In December 2025, Anthropic donated MCP to the Agentic AI Foundation, a Linux Foundation directed fund co-founded by Anthropic, Block, and OpenAI. Both protocols now sit under the same umbrella, and mid-2026 enterprise adoption sits at roughly 78% for MCP and 23% for A2A.

### MCP Streamable HTTP Transport

MCP shipped in November 2024 with two transports: stdio for local subprocess servers, and HTTP plus SSE for remote ones. The HTTP-plus-SSE transport had operational problems — long-lived SSE connections behind proxies, two-channel state to manage — and was deprecated in March 2025 in favour of Streamable HTTP, a single endpoint that returns either a JSON-RPC response or upgrades to SSE for streaming. Combined with the same spec revision adding OAuth 2.1 with PKCE, dynamic client registration, and Resource Indicators for token scoping, MCP became a real internet protocol rather than just a local stdio convention.

## Listening order

- **Before this chapter:** "Encryption Basics" — sets up the cryptographic substrate that the new agent protocols inherit, including the OAuth 2.1 and PKCE story that MCP picked up in its 2025 transport revision.
- **After this chapter:** "Before the Internet" — closes Foundations and pivots into the historical narrative arc, starting in the era before any of this existed.

## Where to go deeper

- The MCP episode picks up the mechanism — the initialise handshake, capability negotiation, the host-client-server architecture, and the stdio versus streamable HTTP transports.
- The A2A episode covers Agent Cards served at `/.well-known/agent.json`, the Task lifecycle, the opacity model that treats other agents as black boxes, and the streaming-and-webhook delivery story.
- The JSON-RPC episode is the wire-format primer — methods, ids, notifications, batches, and why a six-page spec ended up under both the Language Server Protocol and the new AI agent layer.
- The SSE episode covers server-sent events as the streaming substrate that the original MCP HTTP transport leaned on, and that A2A still uses for streaming task updates.
- The WebSockets episode is the bookend on the other side — the last new application-layer protocol before the fifteen-year gap that this chapter opens with.
- The HTTP episode is the architectural ancestor — small, composable, anyone-to-anyone — that the MCP design quite consciously echoes.

## Visual cues for image generation

- A timeline from 2011 to 2026 showing WebSockets at 2011, a flat fifteen-year stretch with HTTP, gRPC, GraphQL, SSE, SMTP, IMAP, XMPP, and MQTT labelled along it, then a sharp inflection at November 2024 for MCP and April 2025 for A2A.
- An N-by-M grid of AI hosts on one axis and tools on the other, every cell filled with a bespoke connector, collapsing into an N-plus-M hub-and-spoke once MCP slots in between.
- A two-layer stack — agents talking to each other over A2A on top, each agent talking to its own tools over MCP on the bottom, both layers labelled JSON-RPC 2.0 over HTTP-or-stdio.
- A specification page-count comparison bar chart: JSON-RPC 2.0 at 6 pages, gRPC at 50-plus, GraphQL at 200-plus, MQTT 5 at 130-plus.
- A minimal MCP server illustrated as a tiny executable under 100 lines of code, exposing `read_file`, `write_file`, and `list_directory` tools to a host process over a stdio pipe.

## Sources

- [Linux Foundation — A2A project](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [Wikipedia — Model Context Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [MCP spec — transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Stack Overflow blog — MCP authentication and authorization](https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/)
