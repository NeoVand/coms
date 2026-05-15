---
id: api-evolution
type: journey
title: From REST to AI Protocols
scope: global
podcast_target_minutes: 15
step_count: 5
protocols_in_order: [rest, grpc, json-rpc, mcp, a2a]
related_protocols: [rest, grpc, json-rpc, mcp, a2a]
related_book_chapters: []
visual_cues:
  - "Five-node graph lighting up in sequence along a 25-year timeline: REST in 2000, gRPC in 2015, JSON-RPC quietly humming alongside, MCP in November 2024, A2A in April 2025"
  - "Side-by-side payload comparison: a JSON REST response next to the same data as a Protocol Buffers wire frame, with a 3-10x size delta annotated"
  - "Stacked architecture diagram: HTTP and JSON at the bottom, JSON-RPC as a thin shared layer above, then MCP and A2A as twin pillars on top serving an LLM agent"
  - "Agent Card discovery flow: one agent reads another agent's published skills, delegates a task, and watches the lifecycle move from submitted to working to completed over an SSE stream"
  - "Two-pane diagram of the agentic foundation: MCP wiring an agent to tools and data on the left, A2A wiring agents to other agents on the right"
---

# From REST to API Protocols for AI

## In one breath
This is twenty-five years of API design told as one arc. REST gave the
web a simple, uniform vocabulary. gRPC made service-to-service calls
fast and typed. JSON-RPC quietly became the wire format underneath
critical infrastructure. And then, in the span of six months, MCP and
A2A turned APIs into something AI agents could discover and use on
their own.

## The hook (cold-open)
For two decades, the answer to "how should two services talk" was REST.
Then it was gRPC, sometimes. Then in November 2024, an AI lab shipped
a protocol called MCP, and within a year more than ten thousand servers
were speaking it. Five months after that, Google answered with a
protocol for agents talking to other agents. In this episode we walk
the five steps that took us from a 2000 dissertation to the protocol
stack of the agentic era — REST, gRPC, JSON-RPC, MCP, A2A — and we
watch the design pressure shift, step by step, from human developers to
autonomous machines.

## The journey

### Step 1 — REST: The Foundation (REST)
The story starts in 2000 with Roy Fielding's dissertation. Fielding
defined REST as an architectural style, not a protocol: use HTTP verbs
for operations, use URLs to name resources, and keep every request
stateless. That's it. The simplicity is what made it dominate the API
landscape for two decades — any language with an HTTP client could call
a REST API, no SDK required. There is a separate episode on Roy
Fielding for the full backstory, and the REST episode goes deep on the
constraints. The thing to hold on to here is who REST was designed
for: human developers building web applications. Over-fetching,
under-fetching, the lack of a machine-readable schema — all of those
were annoyances for a developer with a debugger, but later on they
turned into hard blockers for autonomous agents trying to discover and
invoke a capability they had never seen before.

REST served the web brilliantly for human-to-machine communication.
But as systems grew more complex, developers wanted richer patterns —
typed contracts they could enforce at compile time, more efficient
serialization on the wire, and more flexible ways to fetch exactly the
data they needed.

### Step 2 — gRPC: Typed, Efficient RPC (gRPC)
Inside Google, an internal RPC system called Stubby had been handling
billions of requests per day for years. In 2015, Google open-sourced a
descendant of it as gRPC, and three things came along with it. Protocol
Buffers, a binary serialization format three to ten times smaller than
JSON. HTTP/2 underneath, which meant real multiplexing on a single
connection. And true streaming, in both directions. For the first time
in the mainstream, API contracts were machine-enforced at compile time
through `.proto` files — break the contract, the build fails. The full
mechanism is in the gRPC episode, and the HTTP/2 episode covers the
transport. Here, the point is the tradeoff. gRPC asked you to accept
code generation, an HTTP/2 requirement, and binary payloads you
couldn't poke at with curl. In return, for service-to-service traffic
at scale, it was a revelation.

gRPC optimised hard for machine-to-machine efficiency. But that came
at a cost: you needed schema compilation, and it could not easily serve
browser clients. The question hanging in the air was whether something
could sit in between — human-readable like REST, but with typed
schemas and flexible querying.

### Step 3 — JSON-RPC: The Minimal Wire Format (JSON-RPC)
While REST and gRPC fought it out for mainstream APIs, a quieter
revolution was happening down in infrastructure. JSON-RPC 2.0 — a
one-page spec for calling a method by name over JSON — became the
backbone of Ethereum's blockchain API, of Bitcoin Core, and of
Microsoft's Language Server Protocol that nearly every modern editor
now speaks. The appeal was radical simplicity: no URL routing, no HTTP
verb semantics, no schema compilation. Just a method name, a params
object, and an ID so you can match the response to the request. The
JSON-RPC episode covers the spec end to end. The thing to notice now
is that the spec is so small, and so transport-agnostic — it runs over
HTTP, over WebSockets, over stdio, over raw TCP — that it became the
obvious foundation for whatever came next.

JSON-RPC proved that method-oriented RPC over plain JSON was powerful
enough to carry critical infrastructure. So when the AI revolution
arrived and demanded new protocols for tool use and agent
collaboration, the wire format question already had an answer.

### Step 4 — MCP: AI-Native Tool Access (MCP)
In November 2024, Anthropic released the Model Context Protocol — the
first protocol designed specifically for AI applications. MCP is built
on JSON-RPC 2.0, which is why the previous step matters. On top of
that wire format, MCP defines three things: dynamic tool discovery, in
which `tools/list` returns JSON Schema definitions an LLM can read and
understand on the fly; resource access for files, database rows, and
API responses; and prompt templates the server can offer to the
client. The key insight was that AI applications do not just need
APIs. They need self-describing APIs that an LLM can discover,
understand, and invoke autonomously, with no human in the loop writing
glue code first. Within a year, Claude, ChatGPT, Copilot, Cursor, and
VS Code all spoke MCP, and there were over ten thousand MCP servers in
production. The full mechanism is in the MCP episode.

MCP solved the integration problem by connecting an AI agent to the
tools and data it needs. But the next challenge was bigger. How do
you get multiple AI agents — potentially from different vendors, built
on different frameworks — to actually collaborate on a task?

### Step 5 — A2A: AI-Native Agent Collaboration (A2A)
Google's answer arrived in April 2025: the Agent-to-Agent Protocol.
Where MCP connects agents to tools, A2A connects agents to each other.
The model is straightforward. An agent publishes its skills in an
Agent Card. Other agents discover that card, delegate a task to it,
and receive structured results back — all without knowing anything
about the internal implementation of the agent on the other side. The
task lifecycle — submitted, then working, then completed — runs over
Server-Sent Events, which gives the streaming primitive that
multi-agent systems need to coordinate. The A2A episode goes deep on
the lifecycle, and the SSE episode covers the streaming transport
underneath. The headline is that MCP and A2A together form the
two-protocol foundation of the agentic AI era, and both have been
donated to the Linux Foundation as open industry standards.

## What the listener now understands
Five protocols, twenty-five years, one consistent pattern: each
generation answered the limits of the last. REST gave us a uniform
vocabulary for the human web. gRPC made internal services fast and
typed. JSON-RPC quietly became the small, sharp wire format that
everything else could be built on top of. MCP took that wire format
and added the self-description an LLM needs to use a tool it has never
seen before. A2A then took the same posture and pointed it sideways,
so that agents could find and delegate to other agents. The arc is
the audience changing — from a developer reading docs, to a build
system enforcing a schema, to an autonomous agent discovering a
capability at runtime. The protocols got smaller and more declarative
as the consumer got smarter.

## Where this connects in the book
- The chapter on REST goes back to Fielding's 2000 dissertation and
  unpacks the constraints — uniform interface, statelessness, cacheability
  — that made the style spread.
- The chapter on gRPC covers Protocol Buffers, the .proto contract, and
  why HTTP/2 multiplexing is what makes streaming RPC practical.
- The chapter on JSON-RPC walks through the one-page spec and the long
  list of places it ended up running underneath, from Ethereum to the
  Language Server Protocol.
- The chapter on MCP unpacks tool discovery, resources, and prompt
  templates, and how all three sit on JSON-RPC 2.0.
- The chapter on A2A covers Agent Cards, the task lifecycle, and the
  SSE streaming model that lets agents coordinate over time.

## See also (other journeys and protocol episodes)

- If this arc made you want the foundations under it, the REST episode
  and the JSON-RPC episode are the two to take next. REST is the
  vocabulary the rest of the web inherited; JSON-RPC is the small wire
  format that quietly made MCP and A2A possible.

- The gRPC episode is the right listen if the typed-contract step felt
  like the most consequential design move. It's the protocol that
  taught the industry to take schemas seriously.

- For the new agentic layer, listen to the MCP and A2A episodes back
  to back. MCP is the agent-to-tool half; A2A is the agent-to-agent
  half. Together they're what most people mean now when they say "the
  agent stack."

## Visual cues for image generation

- Five-node graph lighting up in sequence along a 25-year timeline:
  REST in 2000, gRPC in 2015, JSON-RPC humming quietly throughout,
  MCP in November 2024, A2A in April 2025.
- Side-by-side payload comparison: a JSON REST response next to the
  same data encoded as Protocol Buffers, with the three-to-ten-times
  size delta annotated.
- Stacked architecture diagram: HTTP and JSON at the bottom, JSON-RPC
  as a thin shared layer above, then MCP and A2A as twin pillars on
  top, serving a single LLM agent at the apex.
- Agent Card discovery flow: one agent reads another agent's published
  skills, delegates a task, and watches the lifecycle move from
  submitted to working to completed over an SSE stream.
- Two-pane diagram of the agentic foundation: MCP wiring an agent to
  tools and data on the left, A2A wiring agents to other agents on
  the right.
