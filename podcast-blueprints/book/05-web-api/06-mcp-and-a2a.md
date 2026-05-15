---
id: web-api/mcp-and-a2a
type: chapter
part_id: web-api
part_label: VI
part_title: Web / API
title: MCP and A2A
synopsis: The protocol layer for AI agents — built deliberately boring on top of JSON-RPC, HTTP, and SSE.
podcast_target_minutes: 15
position_in_book: chapter 45 of 75
listening_order:
  prev: web-api/websockets-and-sse
  next: async-iot/mqtt
related_protocols: [websockets, mcp, a2a, json-rpc, sse, tcp, ip, tls, oauth2, http3]
related_pioneers: []
related_outages: []
related_frontier: [mcp-streamable-http, a2a-linux-foundation]
related_rfcs: [8446, 6749]
images: []
visual_cues:
  - "Before/after diagram — left panel shows N AI hosts each wired by hand to M tools (the N times M mesh of bespoke connectors); right panel shows N hosts and M tools all speaking MCP, collapsing the wiring to N plus M."
  - "Timeline of new application protocols since 2011 — RFC 6455 WebSocket in December 2011, then a fifteen-year gap, then MCP on 25 November 2024 and A2A on 9 April 2025 stacked at the right edge."
  - "Three-role architecture diagram for MCP — Host (the AI app) containing a Client (the protocol handler for one session) talking to multiple Servers (filesystem, database, CRM) over JSON-RPC 2.0, with stdio on one side and Streamable HTTP on the other."
  - "Side-by-side of MCP and A2A — MCP labelled 'agent to tool, fully transparent — tools, resources, prompts'; A2A labelled 'agent to agent, opaque black box — skills and artifacts'; both sitting on JSON-RPC 2.0 plus HTTP plus SSE plus TLS 1.3 plus OAuth 2.1."
  - "An MCP transport timeline — 25 November 2024 ships with stdio plus HTTP+SSE (two endpoints, awkward), then 26 March 2025 deprecates HTTP+SSE in favour of Streamable HTTP (single /mcp endpoint), with mid-2026 host removal deadlines marked on the right."
---

# Part VI, Chapter — MCP and A2A

## The hook

For fifteen years after WebSocket landed in 2011, no genuinely new application protocol shipped. Then 2024 happened twice. MCP, the Model Context Protocol, dropped from Anthropic on 25 November 2024. A2A, Google's Agent-to-Agent protocol, followed on 9 April 2025. Both built deliberately boring — JSON-RPC 2.0 over HTTP and SSE, with TLS 1.3 and OAuth 2.0 underneath — and both moved into the Linux Foundation by mid-2025. This chapter is the story of how the AI integration layer became real internet plumbing in less than eighteen months.

## The story

### A standard way for agents to reach tools

Until 2024, an AI assistant that wanted to read your files, query your database, or call your APIs needed a custom integration per tool per assistant. Anthropic shipped Claude with file access. Cursor shipped with editor integration. Every developer rebuilt the same plumbing. With N AI hosts and M tools, the industry was building N times M bespoke connectors. The combinatorics did not scale.

MCP collapses N times M to N plus M. A tool server — filesystem, database, CRM, anything — speaks MCP. Any MCP-aware client — Claude, Cursor, ChatGPT, your own agent — can use it. Capability discovery, tool calling, prompt templates, and resources are first-class concepts. The wire format is JSON-RPC 2.0. The transport is either standard input and output for local tools spawned as subprocesses, or HTTP for remote ones. The full mechanism — the three-step initialization handshake, the tool discovery flow, how a host negotiates capabilities with a server — is the MCP episode.

### The transport churn

MCP shipped on 25 November 2024 with two transports. Stdio was process-local, used for servers spawned as subprocesses by the host. The remote story was HTTP plus SSE — two endpoints, one slash-sse for the long-lived server-to-client stream, one slash-messages for client-to-server POSTs.

The two-endpoint design was awkward in production. Clients had to maintain two connections. Session affinity was hard. The resume story across reconnects was unspecified. Long-lived SSE connections behind proxies broke in the usual ways. Two-channel state was a pain to manage.

The 26 March 2025 spec replaced HTTP plus SSE with Streamable HTTP — a single slash-mcp endpoint where POST responses can either be plain JSON or upgrade into an SSE stream depending on the Accept header. The old transport was explicitly deprecated. Major hosts including Atlassian Rovo and Keboola set HTTP plus SSE removal deadlines for mid-2026.

SSE itself is not gone in MCP — it is now an optional response mode of Streamable HTTP. WebSocket is not an official MCP transport as of May 2026, but SEP-1288 from August 2025 is an active proposal to add one. The controversy is around how to convey the Mcp-Session-Id header — browser WebSocket APIs cannot read post-handshake headers — and how authentication should work.

### Why JSON-RPC 2.0

Both MCP and A2A picked JSON-RPC 2.0 as their wire format. The full spec is six pages. The boringness is the point. Microsoft's Language Server Protocol — the thing that powers code intelligence in VS Code, Neovim, and virtually every modern editor — uses JSON-RPC. Ethereum nodes use it. Bitcoin Core uses it. The Chrome DevTools Protocol uses it. Every editor tooling system from VS Code to Neovim already speaks it.

For a brand-new protocol layer where adoption is the existential risk, picking the lowest-overhead, highest-interoperability RPC format that already worked in every language was the right move. MCP and A2A could have invented binary protocols with schemas. Instead they let the message shape be a transport-level concern and put their innovation in what the messages mean. The full origin story — JSON-RPC's 2005 birth as a lightweight alternative to SOAP, version 2.0 in 2010, notifications, batch requests, transport agnosticism — is the JSON-RPC episode.

### A2A — agent to agent

A2A handles the case MCP did not address: collaboration between agents rather than between an agent and a tool. A modern AI system increasingly needs multiple specialised agents working together. A travel agent delegates to flight, hotel, and car rental agents. An HR agent coordinates with payroll, benefits, and IT provisioning agents. A2A is the standard protocol for that.

Google announced A2A on 9 April 2025 at Cloud Next, backed by over a hundred technology partners including Atlassian, Microsoft, Salesforce, SAP, and LangChain. The protocol runs at Layer 7 over HTTP over TCP and IP, like MCP. It uses JSON-RPC 2.0 plus HTTP plus SSE for streaming, plus webhooks for push notifications — explicitly not WebSocket. Custom HTTP headers like A2A-Version and A2A-Extensions carry control metadata. Authentication leans on TLS 1.3 — RFC 8446 — and OAuth 2.0 — RFC 6749 — rather than defining a new scheme.

A key design principle is opacity. Agents are treated as black boxes. You don't see their internal reasoning, tool usage, or prompt chains. You see their skills — what they can do — and their artifacts — what they produce. That is fundamentally different from MCP, where the server's tools and resources are fully transparent. Discovery happens through Agent Cards, JSON metadata documents served at slash dot well-known slash agent dot json that describe an agent's identity, capabilities, skills, and authentication requirements. The fundamental unit of work is a Task with a defined lifecycle — submitted, working, completed, or failed, canceled, or input-required when the agent needs more information. The full mechanism is the A2A episode.

### Open governance, and what 2026 looks like

A2A moved to the Linux Foundation in June 2025. In December 2025, Anthropic donated MCP to the Agentic AI Foundation, a Linux Foundation directed fund co-founded with Block and OpenAI. Both protocols are now under the same umbrella — multi-vendor commons rather than single-company bets.

By early 2026, MCP was processing over 97 million SDK downloads per month. The registry has thousands of public MCP servers. Native support shipped across Claude, ChatGPT, Cursor, Windsurf, and most agent frameworks. A2A has version 1.0 out and is supported by every major agent framework as the bridge between agent ecosystems. Mid-2026 industry analyses report MCP at roughly 78% enterprise adoption versus A2A at roughly 23% — the boundary between agent and tool remains fuzzy and the multi-agent collaboration use cases are still emerging.

These protocols are recognisably internet. They run over HTTP/3 when available. They use JSON-RPC for message framing. They lean on OAuth 2.1 with PKCE and Resource Indicators from RFC 8707 for token scoping. They are built by treating an autonomous program that reasons as a first-class network participant — the way the original web treated a document on another machine as a first-class participant. Whether they last, or get replaced by something better in five years, is the open question of the moment.

## The figures

### MCP Streamable HTTP Transport

MCP shipped on 25 November 2024 with stdio and HTTP plus SSE as transports. The HTTP plus SSE design — one POST endpoint, one long-lived SSE endpoint — had operational issues with proxies and two-channel state, and was deprecated in March 2025 in favour of Streamable HTTP. Streamable HTTP is one HTTP endpoint that can return either a single JSON-RPC response or upgrade to SSE for streaming. Single channel, simpler proxy story, easier to deploy on serverless. Combined with the same March 2025 spec adding OAuth 2.1 with PKCE, dynamic client registration, and Resource Indicators from RFC 8707 for token scoping, MCP became a real internet protocol — not just a local stdio convention.

### A2A Donated to the Linux Foundation

Google unveiled Agent2Agent on 9 April 2025 at Cloud Next with more than fifty partners and donated it to the Linux Foundation in June 2025. A2A is the agent-to-agent layer above MCP — where MCP wires an agent to its tools and data, A2A wires agents to each other so they can collaborate or delegate tasks across vendors. In December 2025, Anthropic donated MCP to the Agentic AI Foundation under the Linux Foundation, co-founded with Block and OpenAI. MCP and A2A now sit under the same umbrella.

### RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3

Published in 2018 and edited by Eric Rescorla. Proposed standard. It defines TLS 1.3, the version of TLS that cut the handshake from two round trips to one, removed legacy insecure algorithms, and introduced the HKDF-based key schedule in section 7.1. A2A leans on it directly for transport security. The full mechanism is the TLS episode.

### RFC 6749 — The OAuth 2.0 Authorization Framework

Published in 2012 and edited by Dick Hardt. Standards track. It defines OAuth 2.0 — the authorization framework that lets an app grant scoped, time-limited access to your data without ever seeing your password. A2A uses it directly for agent-to-agent authentication, and MCP's March 2025 spec adds OAuth 2.1 with PKCE and dynamic client registration on top. The full mechanism — the authorization code flow, PKCE, refresh tokens, the OAuth-versus-OIDC distinction — is the OAuth episode.

## What you'd see in the simulator

If you pressed play on the MCP simulator in the app, you would watch a single MCP session unfold from start to finish over JSON-RPC 2.0. The host opens the channel and sends an initialize request, declaring what it supports — sampling, roots, elicitation. The server responds with what it offers — tools, resources, prompts — and both sides confirm readiness. That is the three-step initialization handshake.

Once initialised, the host asks the server which tools it has. The server returns the list, with names, descriptions, and JSON Schema for each tool's inputs. The host picks one and calls it. The server runs the tool and returns the result as a JSON-RPC response. Every message on the wire is a plain JSON object — method, params, id, result, error — exactly the shape that VS Code, Neovim, Ethereum, and Bitcoin Core have been moving over JSON-RPC for years.

## What it taught the industry

The first lesson is that the right way to ship a brand-new protocol layer is to invent as little as possible. MCP and A2A could have shipped binary wire formats, custom schema systems, bespoke transports. Instead they picked a six-page RPC spec from 2010, bolted it to HTTP and SSE, and let TLS 1.3 and OAuth 2.0 do the security. The innovation was in what the messages mean — capability discovery, tool calling, agent cards, task lifecycles — not in how they are framed. Adoption followed because every language already had the building blocks.

The second lesson is that transports are mistakes you make in public. MCP's first transport — HTTP plus SSE on two endpoints — survived four months before the spec replaced it with Streamable HTTP. The major hosts then announced removal deadlines for mid-2026. Shipping fast and rev'ing the transport in the open turned out to be cheaper than designing it right the first time, because the protocol semantics did not have to change.

The third lesson is about open governance arriving early. Both protocols sat under the Linux Foundation within their first year. That is unusually fast for a single-vendor protocol — and it is what made it credible to call MCP and A2A the foundation of the agentic AI era rather than two competing company bets.

## Listening order

- **Before this chapter:** "WebSockets and SSE" — sets up the server-push story and ends on the SSE-for-LLM-streaming renaissance that MCP and A2A both build on.
- **After this chapter:** "MQTT" — pivots from the AI-agent web to the asynchronous and IoT side of messaging, where pub/sub and lightweight brokers replace request-response.

## Where to go deeper

- The MCP episode picks up the mechanism — the three-step initialization handshake, capability negotiation, the Host / Client / Server architecture, and the move from HTTP plus SSE to Streamable HTTP.
- The A2A episode covers Agent Cards, the Task lifecycle from submitted through working to completed, the opacity principle, and how A2A's multi-agent model differs from MCP's tool model.
- The JSON-RPC episode is the wire format underneath both — the six-page spec, version 2.0, notifications, batch requests, and the LSP / Ethereum / Bitcoin lineage that made it the obvious pick.
- The SSE episode covers the streaming-response mode that Streamable HTTP upgrades into, including auto-reconnect and Last-Event-ID resumption.
- The OAuth 2.0 episode covers the authorization-code flow with PKCE that MCP's March 2025 spec adopts and that A2A leans on for agent authentication.
- The TLS episode covers the 1.3 handshake — RFC 8446 — that secures every MCP and A2A connection on the wire.
- The HTTP/3 episode picks up the QUIC-based transport that MCP and A2A both ride when it is available.

## Sources

- [MCP spec — transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Stack Overflow blog — MCP auth](https://stackoverflow.blog/2026/01/21/is-that-allowed-authentication-and-authorization-in-model-context-protocol/)
- [Linux Foundation — A2A project](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [Wikipedia — MCP](https://en.wikipedia.org/wiki/Model_Context_Protocol)
- [RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
- [RFC 6749 — The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
