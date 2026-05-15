---
id: the-ai-agent-layer
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: The AI Agent Layer (2024–)
synopsis: MCP, A2A, and the first new application layer in fifteen years.
podcast_target_minutes: 15
position_in_book: 17 of 75
listening_order:
  prev: story-of-the-internet/the-quic-redesign
  next: layer-2-3/ethernet
related_protocols: [websockets, http1, grpc, graphql, smtp, imap, xmpp, mqtt, mcp, a2a, http3, json-rpc, oauth2]
related_pioneers: []
related_outages: []
related_frontier: [mcp-streamable-http, a2a-linux-foundation]
related_rfcs: []
images: []
visual_cues:
  - "A timeline of the application layer from 1999 to 2026: XMPP/Jabber 1999, MQTT 1999, SMTP and IMAP holding their ground, HTTP/1.1 → /2 → /3, gRPC 2015, GraphQL open-sourced 2015, WebSockets 2011 — then a fifteen-year flat line, then MCP November 2024 and A2A April 2025 spiking up."
  - "An N-by-M grid versus an N-plus-M star. On the left, every AI host on the rows and every tool on the columns, each cell a bespoke integration. On the right, every host plugged into a central MCP socket, every tool plugged into the same socket — the matrix collapses to a hub."
  - "A two-protocol stack diagram. MCP labelled 'agent ↔ tools' wiring a single agent to file systems, databases, and APIs. A2A labelled 'agent ↔ agent' wiring a travel agent to flight, hotel, and car-rental sub-agents."
  - "A protocol-stack cross-section: HTTP/3 over QUIC at the transport layer, JSON-RPC 2.0 for message framing, OAuth 2.1 with PKCE for auth, and MCP and A2A drawn side-by-side at the very top — labelled 'the new L7'."
  - "Two adoption bars from mid-2026: MCP at roughly 78% enterprise adoption, A2A at roughly 23%, with a footnote on the 97-million-SDK-downloads-per-month figure for MCP."
---

# Part II, Chapter — The AI Agent Layer (2024–)

## The hook

For fifteen years after WebSockets shipped in 2011, the application layer of the internet was settled. HTTP in three versions, gRPC for service-to-service calls, GraphQL when you needed flexible queries, and an old guard of SMTP, IMAP, XMPP, and MQTT holding their niches. Nothing genuinely new happened at L7 between 2011 and 2024. Then, in November 2024, Anthropic published the Model Context Protocol — and five months later, in April 2025, Google followed with Agent-to-Agent. The first new application layer in fifteen years arrived because the internet had, for the first time, a new kind of client: a program that reasons.

## The story

### A Protocol Layer Designed for Software That Reasons

To understand why the agent protocols feel new, look at how settled the L7 picture had been. WebSockets, finalised in 2011, was the last clean greenfield protocol the web added. After that, the energy went into refining what already existed. HTTP went from /1.1 to /2 to /3, picking up multiplexing and then QUIC underneath it — the QUIC redesign episode is the chapter right before this one. gRPC, open-sourced by Google in 2015, packaged Protocol Buffers over HTTP/2 for internal service-to-service calls. GraphQL, open-sourced by Facebook in 2015, gave clients a query language so they could ask for exactly the fields they needed. The older protocols held their ground: SMTP from the 1980s still moves every email, IMAP still serves it, XMPP still backs enterprise chat and federated messaging, and MQTT — born at IBM in 1999 to monitor oil pipelines — became the lingua franca of IoT.

But for fifteen years there was no new top-of-stack protocol. The application-layer engineers did refinement, not invention. The reason is straightforward: there was no new kind of network participant that the existing protocols couldn't serve.

In November 2024, Anthropic published the Model Context Protocol — MCP. The premise was simple. AI coding assistants and chat agents needed a standard way to talk to tools — file systems, databases, internal APIs, GitHub, Slack — without each pair re-inventing the integration. Before MCP, every AI application needed custom code for every data source. Connecting an assistant to your database was a different project than connecting it to GitHub, which was different again from connecting it to Slack. An N-clients by M-tools matrix of bespoke glue. MCP collapsed that matrix to N plus M: each host implements the MCP client once, each tool exposes an MCP server once, and they all interoperate. Within a year the protocol had a streaming HTTP transport, thousands of servers in the registry, and first-class support across every major model provider — Claude, ChatGPT, Copilot, Cursor, VS Code, Replit. The mechanism — the JSON-RPC 2.0 wire format, the three-step initialization handshake, the host-client-server architecture — is the MCP episode's job.

In April 2025, Google followed with the Agent-to-Agent Protocol — A2A — for collaboration between agents. Capability discovery, task delegation, asynchronous event streams. The launch had over a hundred technology partners on day one, including Atlassian, Microsoft, Salesforce, SAP, and LangChain. In June 2025, A2A moved into the Linux Foundation. In December 2025, Anthropic donated MCP to the Agentic AI Foundation — a Linux Foundation directed fund co-founded by Anthropic, Block, and OpenAI. By early 2026, MCP was processing more than ninety-seven million SDK downloads per month. Mid-2026 industry analyses put MCP at roughly seventy-eight percent enterprise adoption against A2A at roughly twenty-three percent. The boundary between "agent" and "tool" is still fuzzy, and the multi-agent collaboration use cases are still emerging — but two protocols are clearly load-bearing.

These protocols are recognisably internet. They run over HTTP/3 — the HTTP/3 episode covers the QUIC underlay. They use JSON-RPC 2.0 for message framing — the JSON-RPC episode walks through the spec that fits on a single page and now powers the AI age. They lean on OAuth 2.1 with PKCE for authentication — the OAuth episode is where that flow is unpacked. The novelty is not at the wire level. The novelty is what's at the other end of the wire. The agent protocols treat "an autonomous program that reasons" as a first-class network participant — the way the original web treated "a document on another machine" as a first-class participant. Whether they last in this exact shape, or get replaced by something better in five years, is the open question of the moment. But the architectural move — adding a new client kind to the internet's address book and letting the rest of the stack absorb it — is already done.

## The figures

### MCP Streamable HTTP Transport

When Anthropic shipped MCP in November 2024, the protocol had two transports: stdio for local subprocess servers, and HTTP-plus-Server-Sent-Events for remote servers. The HTTP+SSE transport had operational problems — long-lived SSE connections behind proxies, two channels of state to manage — and was deprecated in March 2025 in favour of Streamable HTTP. Streamable HTTP is a single endpoint that can return either a one-shot JSON-RPC response or upgrade to an SSE stream when the server needs to push. Single channel, simpler proxy story, easier to deploy on serverless. The same March 2025 spec revision added OAuth 2.1 with PKCE, dynamic client registration, and Resource Indicators from RFC 8707 for token scoping. With those changes, MCP stopped being a local stdio convention and became a real internet protocol. The full account is on the Frontier page under MCP Streamable HTTP Transport.

### A2A Donated to the Linux Foundation

Google unveiled Agent2Agent on 9 April 2025 at Cloud Next with more than fifty partners and donated it to the Linux Foundation in June 2025. A2A is the agent-to-agent layer above MCP: where MCP wires an agent to its tools and data, A2A wires agents to each other so they can collaborate or delegate tasks across vendors. In December 2025, Anthropic donated MCP to the Agentic AI Foundation — the Linux Foundation directed fund co-founded with Block and OpenAI — putting both protocols under the same umbrella. Mid-2026 enterprise adoption stood at roughly seventy-eight percent for MCP and twenty-three percent for A2A. The fuller story sits on the Frontier page under A2A Donated to the Linux Foundation.

## Listening order

- **Before this chapter:** *The QUIC Redesign* — once HTTP/3 over QUIC is the substrate the deployed internet runs on, the next layer up has somewhere to land. The transport story hands off to the application story.
- **After this chapter:** *Ethernet* — Part II closes here on the application layer, and the book pivots down the stack to start the Layer 2 and 3 story with the wire format that has carried almost every packet in this chapter.

## Where to go deeper

- **The MCP episode** is the mechanism deep-dive — the JSON-RPC 2.0 wire format, the three-step initialization handshake, the host-client-server architecture, stdio versus Streamable HTTP, and how a single host connects to many servers at once.
- **The A2A episode** picks up the agent-to-agent half — Agent Cards served at /.well-known/agent.json, the submitted-to-completed task lifecycle, the deliberate opacity that treats other agents as black boxes exposing skills and artifacts.
- **The HTTP/3 episode** is the transport the agent protocols ride on — same HTTP API on top, QUIC underneath, roughly thirty-five percent of web traffic by 2025.
- **The JSON-RPC episode** is the one-page spec from 2005 that quietly became the de facto wire format of the AI age — also the protocol behind Ethereum, Bitcoin Core, and the Language Server Protocol.
- **The OAuth episode** unpacks the authorization-code flow with PKCE that MCP's March 2025 spec adopted — and the OpenID Connect identity layer that sits on top.
- **The WebSockets episode** is where the previous fifteen-year stretch of L7 stability began — the 2011 protocol that gave the web its first persistent, server-pushable channel.
- **The gRPC and GraphQL episodes** are the other two refinements of the post-WebSockets era — Protocol Buffers over HTTP/2 for internal RPC, and a query language for client-shaped responses.
- **The SMTP, IMAP, XMPP, and MQTT episodes** are the long-tail protocols that held their niches through the same fifteen years — email's two halves, federated XML messaging, and the two-byte fixed header that runs IoT.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
