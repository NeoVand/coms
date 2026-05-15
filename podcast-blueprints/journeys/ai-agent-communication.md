---
id: ai-agent-communication
type: journey
title: How AI Agents Work Together
scope: web-api
podcast_target_minutes: 15
step_count: 4
protocols_in_order: [json-rpc, mcp, a2a, sse]
related_protocols: [json-rpc, mcp, a2a, sse]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: JSON-RPC, then MCP, then A2A, then SSE — with a stack diagram underneath showing wire format, tool layer, agent layer, transport"
  - "MCP host on the left connecting to a fan of MCP servers on the right — one labelled database, one git, one Slack — all speaking the same protocol"
  - "Coordinator agent in the middle delegating to three specialist agents — travel, research, booking — with Agent Cards floating above each"
  - "Vertical vs horizontal diagram: MCP arrows pointing down from one agent to its tools, A2A arrows pointing sideways between peer agents"
  - "Single SSE stream from a long-running tool call, ticking out progress notifications and partial results as labelled events on a timeline"
---

# How AI Agents Work Together

## In one breath
This is the journey behind every modern AI agent that actually does
something in the world. Four protocols stack up — JSON-RPC for the wire
format, MCP to connect an agent to its tools, A2A to connect agents to
each other, and SSE underneath to stream results back in real time.
Watching them in order is the cleanest demo of how a single chat box
ends up driving a database, a calendar, and three other agents at once.

## The hook (cold-open)
You ask an AI agent to book you a trip. In the next few seconds it
talks to a travel specialist, a research specialist, and a booking
specialist; each of those reaches into databases, calendars, and
payment systems on your behalf; and partial results keep streaming
back to your screen the whole time. Four protocols make that possible,
stacked on top of each other in a strict order. We're going to walk
the stack, one layer at a time.

## The journey

### Step 1 — JSON-RPC: The Wire Format (JSON-RPC)
Before any of the AI-specific protocols existed, JSON-RPC 2.0 was
already the wire format of choice for infrastructure. Ethereum nodes
spoke it. Bitcoin Core spoke it. The Language Server Protocol that
powers VS Code spoke it. The appeal was radical simplicity — send a
JSON object with a method name, some params, and an ID; get back a
result or an error with the same ID. No schema files. No code
generation. No binary encoding. When Anthropic and Google independently
designed their AI protocols, both reached for JSON-RPC 2.0 as the
foundation. Not because it was trendy. Because it was the simplest
thing that could possibly work. The full mechanism — request and
response shapes, batching, notifications, the ID correlation rules — is
in the JSON-RPC episode. Here we just need to know that every byte
that flows in the rest of this journey is a JSON-RPC envelope.

JSON-RPC gives us the framing, but it says nothing about which methods
should exist, what their parameters should look like, or how an AI
application should discover tools in the first place. A higher-level
protocol has to define the semantics of AI tool use.

### Step 2 — MCP: Connecting Agents to Tools (MCP)
The Model Context Protocol solves what the MCP authors call the N-by-M
integration problem. Before MCP, connecting Claude to your database
took custom code — different from connecting it to GitHub, different
again from Slack. MCP collapses all of that into one universal
interface. An MCP server exposes three things: tools — actions the
model can invoke; resources — data the model can read; and prompts —
templates the model can use. A three-step initialization handshake
negotiates capabilities between host and server. After that, the AI
host discovers what's on offer with a tools/list call and invokes
anything it likes with tools/call. A single host can talk to dozens of
MCP servers at once — one for your database, one for git, one for
Slack — and every one of them speaks the same protocol. The full
mechanism is in the MCP episode. Here we just need to know that this
is the layer where the agent learns what it can actually do.

MCP beautifully connects a single agent to its tools. But what about
the case where the task is too big for one agent — where you really
want a travel specialist and a research specialist and a booking
specialist, each with their own tools and their own expertise, working
together? A different protocol handles that layer of coordination.

### Step 3 — A2A: Connecting Agents to Agents (A2A)
The Agent-to-Agent Protocol picks up exactly where MCP leaves off. The
mental model is geometric: MCP is vertical, agent reaching down to
tools. A2A is horizontal, agent reaching sideways to peer agents. Each
A2A agent publishes an Agent Card at /.well-known/agent.json that
describes its skills and capabilities. A coordinator agent reads those
cards, picks specialists, and delegates work with message/send. The
specialists return structured results as Artifacts. Tasks have a full
lifecycle — submitted, working, input-required, completed — and the
coordinator watches that lifecycle play out over a streaming channel.
The design insight that makes the whole thing work is opacity. You
never see another agent's internal reasoning or its tool usage. You
only see its declared skills and its outputs. That's what lets agents
from different vendors, built on different frameworks, snap together
and collaborate without leaking their innards at each other. The full
mechanism is in the A2A episode. Here we just need to know that this
is the layer where agents find each other and divide up the work.

In a production system, A2A and MCP run side by side. The coordinator
uses A2A to delegate a sub-task to a specialist, and that specialist
turns around and uses MCP internally to reach its own tools. But both
protocols lean on the same real-time streaming mechanism underneath
to deliver incremental results back up the chain.

### Step 4 — SSE: Streaming AI Responses (SSE)
Server-Sent Events ties the whole stack together at the transport
level. When an MCP tool takes time to produce a result, the server
upgrades its HTTP response to an SSE stream and pushes progress
notifications and partial results out as events. When an A2A agent
works on a long task, it streams TaskStatusUpdate and
TaskArtifactUpdate events over SSE so the coordinator can watch the
work happen. Even the token-by-token streaming you see in every modern
chat interface is SSE under the hood. And the EventSource API has one
property that makes it perfect for this job: auto-reconnection. If the
connection drops mid-stream, the client reconnects and resumes from
the last event ID. No data lost. No user intervention needed. The
full mechanism is in the SSE episode. Here we just need to know that
this is the layer that turns a slow async task into a live progress
bar on your screen.

## What the listener now understands
This is how a single chat box ends up driving real systems in the real
world. JSON-RPC carries the bytes. MCP gives one agent access to its
tools. A2A lets agents recruit each other. SSE pushes the progress
back in real time. Each layer minds exactly its own concern and trusts
the others to mind theirs — the same layered-stack principle that runs
the rest of the internet, applied to a brand-new problem.

## Where this connects in the book
- The chapter on RPC styles pairs naturally with this journey — it
  sets up why JSON-RPC keeps winning whenever someone needs a wire
  format in a hurry.
- The chapter on real-time web transports pairs well too — it explains
  why SSE, not WebSockets, became the default streaming substrate
  underneath both MCP and A2A.

## See also (other journeys and protocol episodes)

- The "What Happens When You Type a URL" journey is the classic
  layered-stack walkthrough — DNS, TCP, TLS, HTTP cooperating to load
  a page. It's a useful mirror to this one: same principle, different
  problem domain.
- The "Wire to Web" journey runs the stack from Ethernet up. Listen
  back-to-back with this episode and you get the full picture — from
  electrons on a cable all the way up to two AI agents negotiating
  who's doing what.
- The MCP episode is the one to take next if any of this sounded
  interesting. It's the protocol most listeners will actually be
  building against in the next year.
- The A2A episode goes deeper on Agent Cards, the task lifecycle, and
  what opacity buys you when agents from different vendors have to
  cooperate.
