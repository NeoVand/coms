---
id: json-rpc
type: protocol
name: JSON Remote Procedure Call
abbreviation: JSON-RPC
etymology: "[J]ava[S]cript [O]bject [N]otation [R]emote [P]rocedure [C]all — the JSON era's deliberately minimal answer to XML-RPC and SOAP"
category: web-api
year: 2005
rfc: null
standards_body: jsonrpc.org (Matt Morley, 2010); JSON itself standardised as RFC 8259
podcast_target_minutes: 22
related_book_chapters:
  - foundations/ai-protocols
  - story-of-the-internet/the-ai-agent-layer
  - web-api/mcp-and-a2a
related_protocols: [a2a, http1, mcp, websockets, rest, grpc, graphql, soap, sse, tcp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [8259]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/1/18/RPC_overview.png
    caption: The classic Remote Procedure Call model that JSON-RPC inherits — a client calls a function by name, parameters are serialised and sent over the network, and the server executes the method and returns the result. JSON-RPC strips this model down to pure JSON, with no IDL, no code generation, and no binary encoding.
    credit: Image — Wikimedia Commons / Public Domain
visual_cues:
  - "A single HTML page screenshot of jsonrpc.org/specification, scaled small in the centre of the slide. To its left, a stack of ten thick SOAP 1.2 Part 1 binders with a label '100+ pages'. The caption reads 'JSON-RPC 2.0, finalised 2010 by Matt Morley — unchanged in 16 years.'"
  - "A request and response side by side as raw JSON, syntax-highlighted. Left: {\"jsonrpc\":\"2.0\",\"method\":\"subtract\",\"params\":[42,23],\"id\":1}. Right: {\"jsonrpc\":\"2.0\",\"result\":19,\"id\":1}. A bright arrow connects the two id fields. Bottom caption: 'The id is the only correlation. Everything else is method dispatch.'"
  - "A horizontal layer diagram. Bottom row: TCP, Unix socket, stdio pipe, WebSocket, HTTP/1.1, HTTP/2, Streamable HTTP. Middle row: a single thin band labelled 'JSON-RPC 2.0 — request, response, notification, batch'. Top row: side-by-side boxes for Bitcoin Core, Ethereum (Geth, Erigon, Nethermind, Besu, Reth), Solana, LSP (rust-analyzer, gopls, clangd, pyright), DAP, Stratum, MCP, A2A. Caption: 'Transport-agnostic. The same wire format under sixteen ecosystems.'"
  - "A timeline running 1998 to 2025. Markers: 1998 Dave Winer ships XML-RPC; June 2003 SOAP 1.2 W3C Recommendation; 2005 JSON-RPC 1.0 on json-rpc.org; 2010 Matt Morley finalises 2.0; June 27 2016 Microsoft announces LSP; November 25 2024 Anthropic open-sources MCP; April 9 2025 Google launches A2A; December 9 2025 MCP donated to the Linux Foundation. Caption: 'Sixteen years dormant, then the AI agent layer landed on top.'"
  - "A red-overlay slide titled 'CVE-2025-49596 — MCP Inspector RCE, CVSS 9.4'. A diagram shows a malicious webpage opened in the developer's browser, talking to localhost:6277 on the MCP Inspector proxy via 0.0.0.0 / DNS rebinding, which then spawns arbitrary commands on the host. Below: 'Fixed in 0.14.1 with session-token auth. Pattern: stdio is not sandboxed. The LLM is not the user.'"
  - "An infographic of the five reserved error codes lined up vertically: -32700 Parse error, -32600 Invalid Request, -32601 Method not found, -32602 Invalid params, -32603 Internal error, plus the band -32000 to -32099 'server error, application-defined'. A footnote: 'The numbers are XML-RPC heritage, mirrored on purpose so implementations could be ported.'"
---

# JSON-RPC — JSON Remote Procedure Call

## In one breath

JSON-RPC is a one-page spec for calling functions over a network: send a JSON object with a method name, parameters, and an id, get back a JSON object with the same id and either a result or an error. It has no transport of its own and no schema, which is why the same fifteen-year-old format now carries Bitcoin and Ethereum node APIs, every Language Server Protocol session in VS Code and Neovim, Microsoft's Debug Adapter Protocol, Anthropic's Model Context Protocol, and Google's Agent2Agent Protocol. If you write software that touches a blockchain, an editor, or an AI agent in 2026, you are already on JSON-RPC.

## The pitch (cold-open)

In 1998, Dave Winer at UserLand Software got tired of waiting for Microsoft politics to clear and shipped XML-RPC — a tiny RPC protocol on two pages — as part of Frontier 5.1. Twenty-six years later, in November 2024, two engineers at Anthropic picked up its great-grandchild, a forgotten 2010 spec called JSON-RPC 2.0, and made it the wire format for the Model Context Protocol — the standard that connects AI agents to every tool and database. By December 2025, OpenAI had adopted MCP, Google had built A2A on the same foundation, and Anthropic, Block, and OpenAI had handed all of it to the Linux Foundation. The JSON-RPC spec has not been revised since 2010. The HTML page is still one screen long. This episode is about what is in those few hundred bytes, why everyone keeps choosing them, and how the same minimalism that made it survive is now its single largest source of CVEs.

## How it actually works

The JSON-RPC story we tell on this page is the mechanism, not the genealogy. The story of how RPC got to this point — Sun RPC, CORBA, XML-RPC, SOAP, the WS-* tower, the JSON era — belongs to the chapter episode on Protocols for AI Agents and the Web/API chapter on MCP and A2A. We point to those when they come up.

A JSON-RPC interaction is built from four kinds of messages and nothing else: a request, a response, a notification, and a batch. A request is a JSON object with four fields. `jsonrpc` is the literal string `"2.0"`. `method` is the function name; names beginning with `rpc.` are reserved for protocol extensions like OpenRPC's `rpc.discover`. `params` is either an array (positional arguments) or an object (named arguments) — never both at once, and many libraries only support one shape. `id` is a string, number, or null that the client picks to match the response. A response carries the same `id` plus either `result` or `error`, never both, never neither.

Dispatch is trivial. The server parses the JSON, looks up the method name in its handler table, validates the parameters, and calls the handler. There is no URL routing, no HTTP verb semantics, no envelope wrapping, no schema-validation step, no negotiation. The complete request to subtract 23 from 42 is sixty bytes on the wire: `{"jsonrpc":"2.0","method":"subtract","params":[42,23],"id":1}`. The response is thirty-eight: `{"jsonrpc":"2.0","result":19,"id":1}`.

If the request omits the `id` entirely, it is a notification — fire and forget. The server processes it and the spec says it MUST NOT reply, including inside batches. This is how Language Server Protocol pushes diagnostics, how MCP sends `notifications/initialized`, and how every editor that ships text-changed events without waiting for an acknowledgment works.

A batch is a JSON array of one or more requests and notifications in a single transport unit. The server returns an array of responses, but it is allowed to answer in any order, so clients must correlate by `id`. Notifications produce no entry. A batch of pure notifications produces no body at all — the spec says return nothing, not an empty array.

Finally, JSON-RPC says nothing about the transport. The same message can ride over an HTTP POST to a single endpoint (Ethereum, Bitcoin), a long-lived TCP socket with newline-delimited frames (Stratum mining), a WebSocket (most blockchain providers' subscription endpoints), or stdin and stdout pipes between a parent process and a child (LSP, DAP, local MCP servers).

### Header at a glance

JSON-RPC has no header of its own. Its framing is whatever the transport decides:

- **HTTP/1.1** — `POST` to one URL with `Content-Type: application/json`, the JSON-RPC object as the body, and HTTP status 200 even when the application returned an error. The error lives inside the response body, not in the status line.
- **MCP stdio** — newline-delimited JSON. The MCP spec says messages "are delimited by newlines, and MUST NOT contain embedded newlines." A stray `console.log` from your server corrupts the stream — write logs to stderr or to a file.
- **LSP and DAP** — an HTTP-style header block precedes each payload: `Content-Length: <bytes>\r\n\r\n<UTF-8 JSON>`, optionally with `Content-Type: application/vscode-jsonrpc; charset=utf-8`. DAP looks like LSP but uses a different envelope (`seq`, `type`, `command`/`event`/`response`); Microsoft's own docs say DAP is "similar to but not compatible with the JSON-RPC used in the LSP."
- **WebSocket** — JSON-RPC frames flow either direction over the persistent socket. This is what unlocks server-pushed notifications without the client having to poll.
- **MCP Streamable HTTP** — one `/mcp` endpoint that accepts both `POST` and `GET`. POST responses are either plain JSON or upgrade to `text/event-stream` for incremental results, depending on the `Accept` header. Sessions are tracked via `Mcp-Session-Id`; closing one is a `DELETE` with that header.

The character encoding is UTF-8. RFC 8259, edited by Tim Bray and published as Internet Standard 90 in December 2017, makes UTF-8 the only interoperable encoding for JSON exchanged between systems. MCP's transport spec restates this as a hard requirement.

### State machine in three sentences

Pure JSON-RPC has no state machine. Each request/response pair is independent — no session, no handshake, no ordering guarantee beyond what the transport gives you. Every higher-level protocol (LSP, DAP, MCP, A2A, Stratum) adds its own lifecycle on top: typically an `initialize` request, an `initialized` notification, a long phase of operational requests and notifications in both directions, then a transport-specific shutdown — for MCP over HTTP that is a `DELETE` to the `/mcp` endpoint with the `Mcp-Session-Id` header.

### Reliability, errors, and security mechanics

JSON-RPC has no checksums, no retries, no encryption. It inherits all of those from below: TCP for ordered delivery, TLS for confidentiality, OAuth or mutual TLS or RPC cookies for authentication. What it does standardise is errors.

The error object has three fields: `code` (a required integer), `message` (a required short string), and `data` (optional, server-defined). Codes from minus 32768 to minus 32000 are reserved. Five are named: minus 32700 for "Parse error" (invalid JSON), minus 32600 for "Invalid Request" (the JSON parsed but is not a valid request object), minus 32601 for "Method not found", minus 32602 for "Invalid params", minus 32603 for "Internal error". The range minus 32000 to minus 32099 is "implementation-defined server error" and is where applications put their own codes. The choice of minus 32700 specifically is XML-RPC heritage — the XML-RPC "Fault Code Interoperability" community spec from the late 1990s assigned that number to parse errors, and JSON-RPC 2.0 mirrored it on purpose so implementations could be ported without surprises.

Where security gets added depends on where you are. Ethereum and Bitcoin nodes default to localhost only and rely on RPC cookies or basic auth. MCP's June 2025 spec mandated OAuth 2.1 for remote servers; the November 2025 release added the OAuth 2.1 client-credentials flow for machine-to-machine. A2A delegates auth entirely to its underlying HTTP layer and to OAuth 2.0 (RFC 6749) and TLS 1.3 (RFC 8446). The protocol itself trusts whoever sent the bytes.

## Where it shows up in production

**Ethereum execution clients.** Every node — Geth (historically around 74% of validators), Nethermind (about 13%), Besu (about 9%), Erigon, Reth — exposes JSON-RPC over HTTP, WebSocket, or a Unix IPC socket. The method namespaces are underscored prefixes: `eth_`, `net_`, `web3_`, `admin_`, `debug_`. The whole API is standardised in EIP-1474 and published as an OpenRPC document at `ethereum.github.io/execution-apis`. Every wallet, every dApp, every L2 rollup, every block explorer talks this exact dialect. Providers like Infura, Alchemy, QuickNode, Ankr, and Flashbots run replicated, load-balanced JSON-RPC clusters; Alchemy alone claims it processes $4.2 trillion of transaction value annually and bills on "compute units" because `getBalance` is far cheaper than an archive query.

**Bitcoin Core.** `bitcoind` ships with JSON-RPC enabled by default on TCP port 8332 (testnet 18332, regtest 18443). The Bitcoin Core docs explicitly warn that "the RPC interface has not been hardened to withstand arbitrary Internet traffic" — bind to localhost or tunnel via SSH. Compromised exposed `bitcoind` endpoints are a recurring theft vector.

**Solana.** Solana's JSON-RPC has the same shape as Ethereum's but adds a parallel WebSocket subscription API for `logsSubscribe`, `slotSubscribe`, and `blockSubscribe`. With 400 ms block times, providers compete on tail latency in the tens of milliseconds — Helius and other vendors advertise sub-100 ms p95 for `getBalance`-class calls.

**Stratum mining.** The Bitcoin and Ethereum mining-pool protocol is, per EIP-1571, "an instance of JSON-RPC-2.0" sent over a long-lived TCP socket as newline-delimited JSON. EIP-1571 worked out the bandwidth: a typical `mining.notify` message is around 240 bytes, and dispatching one work unit per block to 50,000 connected sockets adds up to roughly 1.88 TB per month per pool. Stratum V2 replaces the JSON wire with an authenticated, encrypted binary one and "cuts bandwidth use by about 60% for pools and 70% for miners."

**Language Server Protocol.** Microsoft, Red Hat, and Codenvy announced LSP at DevNation in San Francisco on June 27, 2016 and explicitly chose JSON-RPC "due to its simplicity and existing libraries." LSP turned the M-editors-times-N-languages problem into M plus N. The current spec is 3.17. In production this is `rust-analyzer`, `clangd`, `gopls`, `pyright`, `typescript-language-server`, `omnisharp`, `ccls`, talking JSON-RPC framed by `Content-Length` headers to VS Code, Visual Studio, JetBrains IDEs, Neovim's built-in `vim.lsp`, Emacs `lsp-mode` and `eglot`, Sublime LSP, and Helix. VS Code alone runs billions of editor sessions per year on this plumbing.

**Debug Adapter Protocol.** Microsoft's debugging analog to LSP, hosted at `microsoft.github.io/debug-adapter-protocol` since August 2018. Same `Content-Length` framing, JSON-RPC-shaped but not strictly compliant. GDB's mainline added support via `gdb -i=dap`. Adopted by VS Code, IntelliJ, Eclipse, Emacs `dape` and `dap-mode`, plus `debugpy` and LLDB.

**Model Context Protocol.** Anthropic open-sourced MCP on November 25, 2024 and the spec opens by saying it "takes some inspiration from the Language Server Protocol." Every MCP message — `initialize`, `tools/list`, `tools/call`, `resources/read`, `notifications/initialized` — is a JSON-RPC 2.0 object over either stdio (newline-delimited) or Streamable HTTP. By March 2026, Anthropic reported 97 million monthly SDK downloads and more than 10,000 active servers — vendor numbers, not independently audited, but they capture the trajectory. Production deployments include Claude Desktop, Claude Code, ChatGPT desktop and Apps (September 2025), Cursor, Windsurf, VS Code Copilot, the GitHub MCP server, and Cloudflare-hosted servers for Atlassian, Sentry, PayPal, Webflow, Linear, and Supabase.

**Agent2Agent Protocol.** Google announced A2A on April 9, 2025 with more than 50 founding partners and donated it to the Linux Foundation in June; the supporter list grew past 150 organisations. JSON-RPC 2.0 over HTTPS is the default binding. Agents publish an Agent Card at `/.well-known/agent.json` describing their skills and supported auth flows; clients send `message/send` for unary calls or `message/sendSubscribe` for SSE-streamed responses. Production support is in Microsoft Semantic Kernel, Google Agent Engine, plus partner integrations with Atlassian, Box, MongoDB, PayPal, Salesforce, SAP, ServiceNow, and Workday — though Galileo's analyst note from early 2025 cautions that "A2A protocol remains in early adoption phase with limited production deployment evidence."

**Other long-tail deployments.** OpenStack and OpenDaylight use JSON-RPC for SDN/NFV control planes. Microsoft's SQL Tools Service (Azure Data Studio) speaks JSON-RPC. Cisco NSO exposes a JSON-RPC API at `/jsonrpc` for YANG-modeled network operations. Kodi, FreeIPA, Monero wallet, Litecoin Core, and Hyperledger Burrow all expose JSON-RPC APIs.

## Things that go wrong

**The Geth out-of-order EIP DoS, February 2024.** Independent researcher Jason Matthyser, working with iosiro, found that activating EIP-2929 instructions while disabling EIP-150 inside the `block override` parameter of an `eth_call` payload would crash a Geth node at zero cost. `eth_call` is a read-only method nobody charges gas for, exposed to the public internet by default. Shodan listed more than 550 exposed mainnet Geth nodes; every major RPC provider — Infura, Alchemy, QuickNode, Ankr, Flashbots — was vulnerable. The only safe filter would have been to "block `eth_call` entirely, which would have been highly impractical." The bug was not in JSON-RPC; the bug was that an application built atop JSON-RPC trusted that read-only methods are read-only, a habit JSON-RPC's "any method can do anything" semantics quietly invites. Geth v1.13.12 (Edolus) shipped the fix. Coordinated disclosure went through SEAL 911 because the Ethereum Foundation initially considered it out of bug-bounty scope.

**The Nethermind outage, January 2024.** A single-client bug took roughly 8% of Ethereum validators offline and triggered small staking penalties. A separate Besu outage earlier the same month sparked Coinbase's pledge to add Nethermind and Erigon to its validator stack — the canonical "client diversity matters" lesson, all of it played out over JSON-RPC.

**The 2018 open-`geth` ETH theft.** Operators ran nodes with `--rpcaddr 0.0.0.0` and unlocked accounts; attackers scanned the internet and called `eth_sendTransaction` to drain funds. The `pwngeth` toolkit industrialised it. The lesson: bind address defaults exist for a reason.

**The MCP Inspector RCE, CVE-2025-49596.** Anthropic's own MCP Inspector — versions before 0.14.1 — had no authentication between the React UI and the proxy. Any malicious webpage in the developer's browser could invoke MCP commands over stdio via DNS rebinding or `0.0.0.0` tricks and execute arbitrary commands on the host. Disclosed by Oligo Security with CVSS 9.4, fixed in 0.14.1 by adding session-token auth.

**The Anthropic Filesystem MCP Server CVEs, mid-2025.** Cymulate's Elad Beber found two bugs in the official Filesystem MCP server: CVE-2025-53109, a directory-containment bypass at CVSS 7.3, and CVE-2025-53110, a symlink bypass leading to local privilege escalation at CVSS 8.4. The protocol was fine. The implementation that Anthropic itself recommended in its quickstart was not. The pattern: when an LLM has the right to call tools on your filesystem, who is the user — you, or the tool descriptor written by someone else?

**The OX Security "by-design" RCE family, April 2026.** Researchers at OX argued that MCP's STDIO configuration semantics give a direct configuration-to-command-execution path across every official SDK language. The same architectural pattern produced CVE-2026-22252 in LibreChat, CVE-2026-22688 in WeKnora, CVE-2025-54994 in `@akoskm/create-mcp-server-stdio`, and CVE-2025-54136 in Cursor. OX's count: more than 7,000 publicly accessible servers and more than 150 million downloads in scope.

**Drive-by HTTP RCEs, 2026.** CVE-2026-30615 in Windsurf was zero-user-interaction RCE via attacker-controlled HTML modifying a local MCP configuration. CVE-2026-33252 in the Go MCP SDK accepted browser-generated cross-site POSTs to its Streamable HTTP transport without `Origin` validation. CVE-2026-35568 in the Java MCP SDK was DNS rebinding against locally-bound MCP servers.

**The MCP TypeScript SDK cross-client data leak.** A single transport instance reused across clients caused JSON-RPC `id` collisions and routing of responses to the wrong client. This is not a new bug — it is the classic JSON-RPC failure when sessions are multiplexed and `id`s are small monotonic integers.

**The Asana confused-deputy bug, 2025.** Caching MCP responses without re-verifying tenant context allowed cross-tenant disclosure. **The Postmark MCP server, 2025**, was the first observed in-the-wild malicious MCP server, exfiltrating data to an attacker Slack workspace via a hardcoded bot token. **The WordPress AI Engine plugin, June 2025**, exposed more than 100,000 sites to privilege escalation via an MCP vulnerability. **The Supabase + Cursor incident, mid-2025**, was prompt-injection inside a support ticket that caused an agent with service-role database access to leak integration tokens into a public thread.

**Trend Micro's 2025 scan.** Of 1,467 exposed MCP servers found on the internet, 1,227 still ran the deprecated SSE transport, and 70 hosts exposed an `execute_sql` tool to the public internet. The pattern across all of these incidents is the same: implementers treat "local stdio" as if it were inherently safe and "the LLM is the user" as if LLM-controlled inputs were trusted. Both assumptions break.

**The Parity multi-sig disasters, 2017.** These are smart-contract bugs, not JSON-RPC bugs, but every interaction was over JSON-RPC. On July 19, 2017, an `initWallet` reentrancy in Parity Multisig 1.5+ stole roughly 150,000 ETH from three wallets. On November 6, the user `devops199` triggered `initWallet` then `kill()` on the Parity library contract, freezing roughly 514,000 ETH across 598 wallets — 60% of which belonged to the Web3 Foundation's Polkadot ICO. The chapter on the AI agent layer references these as the canonical "the protocol was fine, the application wasn't" stories.

**Stratum mining attacks.** Recabarren and Carbunar's "Hardening Stratum, the Bitcoin Pool Mining Protocol" (arXiv 1703.06545) documented passive (StraTap, ISP Log) and active (BiteCoin, WireGhost) attacks against Stratum's plaintext JSON-RPC over TCP. Stratum V2 replaced the JSON wire with an authenticated, encrypted binary one, partly in response.

## Common pitfalls (for the practitioner)

**Returning HTTP 4xx or 5xx for application errors.** The spec says return 200 with an error object inside the body. Libraries expecting this will mis-handle a 400.

**Sending `error` and `result` in the same response.** Spec forbids it. Send exactly one.

**Replying to a notification.** A request without an `id` MUST NOT receive a response, including inside a batch. Many naive servers reply anyway.

**Mixing positional and named params in one call.** `params` is either an array or an object, not both. Servers are required to honour `params: {}` (named) only if the library actually supports it.

**Numeric `id` collisions on long-lived connections.** Many libraries default to monotonically-increasing integers per process. On WebSockets that span process restarts, ids collide and responses route to the wrong handler. Use UUIDs — jayson supports an `idGenerator` hook.

**Reusing one MCP transport across multiple clients.** Same root cause as id collisions; this was the TypeScript SDK CVE.

**Default body-size limits.** jayson and Express's `body-parser` default to about 1 MB. At 50 bytes per request, that is 20,000 calls in one batch — a built-in amplification vector. Cap explicitly in middleware.

**Default timeouts.** jayson's WebSocket transport defaults to 60 s. For blockchain RPCs that is far too long for `getBalance` and far too short for `eth_call` simulating a complex trace. Configure per method.

**HTTP keep-alive off.** Without it, every RPC opens a fresh TCP+TLS connection. Ethereum providers explicitly recommend reusing the same provider object — and note that ethers' `JsonRpcProvider` sends an extra `eth_chainId` per call while `StaticJsonRpcProvider` does not.

**Bind address.** Bitcoin and Geth default to localhost only. `--rpcaddr 0.0.0.0` is the canonical foot-gun.

**`console.log` from an MCP server over stdio.** stdout *is* the JSON-RPC stream. Logging to it corrupts every message. Write logs to stderr or to a file.

**`DANGEROUSLY_OMIT_AUTH=true` on MCP Inspector.** It does what the variable says.

**Leaving Ethereum's `personal_*` namespace enabled with unlocked accounts.** This is the 2018 ETH-theft pattern.

**`id: null` versus missing `id`.** In JSON-RPC 1.0, `null` meant notification. In 2.0, *missing* means notification, and `null` is reserved for responses to malformed requests. Many libraries still mishandle this — test both.

## Debugging it

**`curl` is the universal client.** Every JSON-RPC server is one POST away. `curl -s -X POST http://localhost:4000/rpc -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"subtract","params":[42,23],"id":1}'`.

**For MCP servers,** run `npx @modelcontextprotocol/inspector <command>` — pin to v0.14.1 or later for the post-CVE auth fix. The inspector lets you list tools, invoke them by hand, and watch the raw JSON-RPC.

**For LSP,** set the VS Code "Output" panel's LSP trace to "verbose"; it prints the raw JSON-RPC frames in both directions.

**For Ethereum,** enable the `debug` namespace and use `debug_traceCall` for opaque reverts.

**For batch debugging,** bracket the failure: send a batch of one, then two, then your real size. Cuts root-cause time dramatically.

**What to monitor in production.** Per-method latency rather than aggregate (a `getBlock` and a `getLogs` have wildly different cost; mixing them hides outliers). Error-code distribution: a spike in minus 32601 ("Method not found") usually means client/server version skew; a spike in minus 32602 ("Invalid params") means schema drift. Batch-size outliers correlate with abuse and accidental N+1 queries. Unmatched response `id`s — orphan responses — indicate either bugs or attacks. For MCP and A2A, monitor tool-invocation rate per (host, server, tool) and treat tool descriptions as untrusted, tool inputs as adversarial.

**Libraries worth knowing.** Node and browser: `jayson` (v4.3.0 as of January 2026, supports HTTP, HTTPS, TCP, TLS, fork, browser); `simple-jsonrpc-js`; `multi-transport-jsonrpc`. Python: `jsonrpcserver` and `jsonrpcclient` from Beau Barker, `python-jsonrpc`, `jsonrpclib`, `python-lsp-jsonrpc`. Go: stdlib `net/rpc/jsonrpc`, `onrik/ethrpc` for Ethereum, `gorilla/rpc/v2/json2`. .NET: Microsoft's `vs-streamjsonrpc` and `JSON-RPC.NET`. Rust: `jsonrpsee`, `jsonrpc-core`. Java/Kotlin: Eclipse `lsp4j`. Swift: `JSONRPCKit`.

## What's changing in 2026

**MCP spec 2025-11-25, the one-year-anniversary release.** Adds the **Tasks** primitive for asynchronous "call now, fetch later" execution — finally giving MCP a clean async story for long-running tool calls. Also adds a formal extensions framework, the OAuth client-credentials machine-to-machine flow (SEP-1046), URL-mode elicitation (SEP-1036), and statelessness improvements.

**Anthropic donates MCP to the Linux Foundation, December 9, 2025.** The new Agentic AI Foundation also took in Block's `goose` and OpenAI's `AGENTS.md`. Platinum members include AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, and OpenAI. JSON-RPC's plumbing is now multi-vendor commons.

**Google donates A2A to the Linux Foundation, June 2025.** Same logic, same destination, ahead of MCP by half a year.

**MCP HTTP+SSE transport on a death march.** Spec 2025-03-26 deprecated it in favour of Streamable HTTP at a single `/mcp` endpoint. Atlassian Rovo set its hard cutoff for June 30, 2026; Keboola for April 1, 2026. ChatGPT already only accepts Streamable HTTP servers.

**MCP spec 2025-06-18.** Added OAuth 2.1 authorisation, structured tool outputs, and elicitation — the spec release that made MCP enterprise-grade.

**OpenAI adopts MCP, March 26, 2025.** Sam Altman publicly committed to support across the OpenAI Agents SDK, ChatGPT desktop, and the Responses API.

**Google announces A2A, April 9, 2025.** JSON-RPC 2.0 over HTTPS plus SSE for streaming, with more than 50 founding partners.

**MCP spec 2025-03-26.** Introduced Streamable HTTP. The first SDK release with `StreamableHTTPServerTransport` was `@modelcontextprotocol/sdk` v1.10.0 on April 17, 2025.

**MCP launches, November 25, 2024.** David Soria Parra and Justin Spahr-Summers, working at Anthropic, ship the spec and SDKs; design explicitly modelled on LSP.

**MCP Apps / SEP-1865, early 2026.** Interactive UI surfaces — React dashboards, forms, visualisations — delivered through MCP, layered above JSON-RPC. **MCP Bundles (`.mcpb`)** as the npm-equivalent distribution format for local servers, standardised in the November 2025 release.

**MCP Registry, September 2025.** A community-driven catalog of public MCP servers; agents browse-before-connect via `/.well-known/mcp` discovery.

**Hot research.** Prompt-injection-resistant tool descriptions; "Code Mode" agents that *generate* code calling MCP tools (Anthropic claims 98.7% token reduction — vendor figure); MCPTox-style benchmarks for tool-misuse evaluation. The Eth Rangers recap from April 2026 reported 14 bugs across Geth, Besu, Erigon, Nethermind, and Reth allowing asymmetric CPU consumption of around 4×, denied propagation, and crashes via flooding. There is no JSON-RPC 3.0 — the underlying spec at `jsonrpc.org/specification` has not changed since 2010, and nothing on the IETF or AAIF roadmap suggests it will.

## Fun facts (host material)

**The whole spec is one HTML page.** Open `jsonrpc.org/specification` in a browser. It fits on a single page. The SOAP 1.2 Part 1 spec runs over 100. That contrast is the protocol's entire pitch.

**Why error code minus 32700, specifically?** Pure XML-RPC heritage. The "Fault Code Interoperability" community spec from the late 1990s assigned minus 32700 to "Parse error: not well formed." JSON-RPC 2.0's authors deliberately mirrored those numbers so implementations could be ported without surprising users. The Wikipedia article on JSON-RPC notes the "pre-defined error codes which follow those defined for XML-RPC."

**MCP was prototyped over a Thanksgiving 2024 weekend.** On Latent Space's "One Year of MCP" episode, David Soria Parra describes the protocol as starting from "Thanksgiving hacking sessions" inside Anthropic, motivated by "how do I scale dev tooling faster than the company grows."

**MCP's spec opens by crediting LSP.** The first paragraph at `modelcontextprotocol.io/specification/2025-11-25` says MCP "takes some inspiration from the Language Server Protocol, which standardizes how to add support for programming languages across a whole ecosystem of development tools." The AI agent internet is, structurally, a 2024 reskinning of a 2016 IDE plumbing protocol.

**Tim Bray, the same Tim Bray who edited XML, edited the final JSON RFC.** In his blog post announcing RFC 8259 — Internet Standard 90 — Bray wrote, "I think this is the last specification of JSON that anyone will ever publish." Eight years later, that is still true.

**`rpc.discover`.** OpenRPC's discovery method is named `rpc.discover` precisely because JSON-RPC 2.0 reserves the `rpc.` prefix for protocol extensions — "the rpc. prefix is a reserved method prefix for JSON-RPC 2.0 Specification system extensions" (EIP-1901). It is the rare case of a reserved namespace that someone actually used the way the spec intended.

**Dave Winer's defection made everything downstream possible.** Don Box, in "A Brief History of SOAP" from April 2001, writes that Winer "went out on his own and shipped the XML-RPC specification based on subsetting the original SOAP type system" because Microsoft politics had shelved SOAP. Without that defection, JSON-RPC's whole ancestry doesn't exist.

**VS Code's own debug protocol deliberately did not use JSON-RPC.** In a 2016 GitHub thread, the Microsoft team considered moving DAP to JSON-RPC for "v2.0" and marked the issue `wont-fix`, citing original-design constraints. DAP and LSP — both Microsoft, both shipped within two years of each other — ended up *almost* but not *quite* the same wire protocol.

## Where this connects in the book

- **Foundations / Chapter "Protocols for AI Agents"** — the introductory framing of MCP and A2A as the new layer of protocols designed for AI agents, sitting on top of JSON-RPC, HTTP, and OAuth 2.1.
- **Story of the Internet / Chapter "The AI Agent Layer (2024–)"** — the historical arc: fifteen years of nothing genuinely new at L7 after WebSockets in 2011, then MCP in November 2024 and A2A in April 2025 landed back-to-back on the same JSON-RPC plumbing and into the Linux Foundation by mid-2025. This is the chapter that owns the long story.
- **Web / API / Chapter "MCP and A2A"** — the deep dive into the agent protocol layer: MCP's two-transport launch, the awkward HTTP+SSE design, the 2025-03-26 move to Streamable HTTP, A2A's JSON-RPC + HTTPS + SSE choice, why both protocols deliberately picked "boring" JSON-RPC 2.0 rather than inventing a new format, and the "boringness is the point" callout.

## See also (other protocol episodes)

- **REST.** REST organises around nouns and resource URLs and HTTP verbs; JSON-RPC organises around verbs and a single endpoint. REST is better for cacheable, browseable resource APIs; JSON-RPC is better for action-oriented APIs and infrastructure. The MCP team's pithy version: "REST is for nouns, JSON-RPC is for verbs." If you have heard the REST episode, this is the contrast that explains why Ethereum, LSP, and MCP chose differently.
- **gRPC.** gRPC uses Protocol Buffers over HTTP/2 with a `.proto` build step and code generation. Vendor benchmarks suggest roughly 3–4× lower median latency and 60–80% smaller payloads than JSON-RPC over HTTP/1.1. JSON-RPC trades that throughput for human-readable messages, transport flexibility (stdio works), and the ability to debug with `curl`. MCP and A2A explicitly made the same trade as Ethereum did — readability and browser-friendliness over raw throughput.
- **GraphQL.** GraphQL replaces resource design with query design; JSON-RPC replaces it with method design. They are not direct competitors but both have eaten REST share in different niches. Geth shipped a GraphQL endpoint that turned into a CVE for memory exhaustion — listen to the GraphQL episode for the broader query-language story.
- **SOAP.** Same fundamental idea — RPC over a structured wire format — but SOAP wraps everything in XML envelopes with WSDL contracts and the WS-* tower. A simple SOAP call is around 500 bytes; the equivalent JSON-RPC call is around 60. SOAP survives in regulated enterprise (banking, healthcare, government); JSON-RPC won the lightweight-web-RPC category outright. The SOAP episode is the cautionary tale.
- **HTTP/1.1.** The most common JSON-RPC transport. POST to one URL with `Content-Type: application/json`, status 200 even when the application errored. JSON-RPC says nothing about HTTP semantics — it is intentionally un-RESTful.
- **WebSockets.** The transport that unlocks bidirectional JSON-RPC. After the upgrade, both sides can send requests, responses, and notifications at any time. This is how LSP servers send diagnostics and how MCP servers push progress updates without polling.
- **SSE.** MCP's first remote transport (November 2024) used SSE plus a separate POST endpoint. The 2025-03-26 spec deprecated that for Streamable HTTP, where SSE became an *optional response mode* of a unified `/mcp` endpoint. A2A still uses SSE for streaming partial results.
- **MCP.** Uses JSON-RPC 2.0 as its wire format, full stop. UTF-8 over either stdio (newline-delimited) or Streamable HTTP. Adds capability negotiation; the three primitives Tools, Resources, and Prompts; sampling that lets the server request LLM completions from the client; elicitation; the asynchronous Tasks primitive; and OAuth 2.1. The MCP episode is the deep dive on the primitives and lifecycle.
- **A2A.** Same wire format, different layer of the stack. Each agent publishes an Agent Card at `/.well-known/agent.json`; clients send `message/send` or `message/sendSubscribe`. MCP is vertical (agent to tools); A2A is horizontal (agent to agents). The two are explicitly complementary — listen to the A2A episode for the multi-agent picture.
- **TCP.** Everything above runs over TCP unless told otherwise. JSON-RPC inherits TCP's ordered-byte-stream semantics for free; that is the substrate every framing decision builds on.

## Visual cues for image generation

- A single HTML page screenshot of `jsonrpc.org/specification`, scaled small in the centre of the slide; to its left, a stack of ten thick SOAP 1.2 binders labelled "100+ pages." Caption: "JSON-RPC 2.0, finalised 2010 by Matt Morley — unchanged in 16 years."
- Two raw JSON blocks side by side, syntax-highlighted: request `{"jsonrpc":"2.0","method":"subtract","params":[42,23],"id":1}` on the left, response `{"jsonrpc":"2.0","result":19,"id":1}` on the right, with a bright arrow connecting the two `id` fields. Caption: "The id is the only correlation. Everything else is method dispatch."
- A horizontal layer diagram. Bottom row: TCP, Unix socket, stdio pipe, WebSocket, HTTP/1.1, HTTP/2, Streamable HTTP. Middle row: a single thin band labelled "JSON-RPC 2.0 — request, response, notification, batch." Top row: side-by-side boxes for Bitcoin Core, Ethereum (Geth, Erigon, Nethermind, Besu, Reth), Solana, LSP (rust-analyzer, gopls, clangd, pyright), DAP, Stratum, MCP, A2A. Caption: "Transport-agnostic. The same wire format under sixteen ecosystems."
- A timeline running 1998 to 2025 with markers at 1998 (Dave Winer ships XML-RPC), June 2003 (SOAP 1.2 W3C Recommendation), 2005 (JSON-RPC 1.0), 2010 (Matt Morley finalises 2.0), June 27 2016 (LSP), November 25 2024 (MCP), April 9 2025 (A2A), and December 9 2025 (MCP donated to the Linux Foundation). Caption: "Sixteen years dormant, then the AI agent layer landed on top."
- A red-overlay slide titled "CVE-2025-49596 — MCP Inspector RCE, CVSS 9.4." A diagram shows a malicious webpage opened in the developer's browser, talking to localhost:6277 on the MCP Inspector proxy via 0.0.0.0 / DNS rebinding, which then spawns arbitrary commands on the host. Below: "Fixed in 0.14.1 with session-token auth. Pattern: stdio is not sandboxed. The LLM is not the user."
- An infographic of the five reserved error codes lined up vertically: minus 32700 Parse error, minus 32600 Invalid Request, minus 32601 Method not found, minus 32602 Invalid params, minus 32603 Internal error, plus the band minus 32000 to minus 32099 "server error, application-defined." Footnote: "The numbers are XML-RPC heritage, mirrored on purpose so implementations could be ported."

## Sources

### Specifications and RFCs

- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [JSON-RPC 1.0 Specification (historical)](https://www.simple-is-better.org/rpc/)
- [JSON-RPC 1.1 Working Draft (historical)](https://www.jsonrpc.org/historical/json-rpc-1-1-wd.html)
- [JSON-RPC 2.0 Object Specification (historical, MPCM)](https://www.jsonrpc.org/historical/json-rpc-object-specification.html)
- [RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format (Bray, 2017)](https://datatracker.ietf.org/doc/html/rfc8259)
- [OpenRPC Specification](https://spec.open-rpc.org/)
- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP Specification 2025-03-26 — Transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [EIP-1571 — EthereumStratum/2.0.0](https://eips.ethereum.org/EIPS/eip-1571)
- [EIP-1901 — Add OpenRPC Service Discovery to JSON-RPC Services](https://eips.ethereum.org/EIPS/eip-1901)

### Papers and academic research

- [Recabarren and Carbunar — Hardening Stratum, the Bitcoin Pool Mining Protocol (arXiv 1703.06545)](https://arxiv.org/pdf/1703.06545)
- [Eth Rangers recap, April 2026](https://blog.ethereum.org/en/2026/04/16/eth-rangers-recap)

### Vendor and engineering blogs

- [iosiro — Geth out-of-order EIP application denial of service](https://iosiro.com/blog/geth-out-of-order-eip-application-denial-of-service)
- [Oligo Security — Critical RCE in Anthropic MCP Inspector (CVE-2025-49596)](https://www.oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596)
- [Cymulate — EscapeRoute, Anthropic Filesystem MCP CVEs (CVE-2025-53109/53110)](https://cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/)
- [Trend Micro — Update on exposed MCP servers](https://www.trendmicro.com/vinfo/us/security/news/vulnerabilities-and-exploits/update-on-exposed-mcp-servers-the-threat-widens-to-the-cloud)
- [Praetorian — MCP server security: the hidden AI attack surface](https://www.praetorian.com/blog/mcp-server-security-the-hidden-ai-attack-surface/)
- [StackOne — MCP: where it's been, where it's going](https://www.stackone.com/blog/mcp-where-its-been-where-its-going/)
- [Penligent — Anthropic MCP vulnerability: 7,000 servers and the case for continuous red-teaming](https://www.penligent.ai/hackinglabs/anthropic-mcp-vulnerability-7000-servers-and-the-case-for-continuous-red-teaming/)
- [Cloudflare — Build and deploy remote MCP servers to Cloudflare](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/)
- [Auth0 — Why MCP's move away from SSE simplifies security](https://auth0.com/blog/mcp-streamable-http/)
- [Anthropic — Donating the Model Context Protocol and establishing the Agentic AI Foundation](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)
- [WorkOS — MCP 2025-11-25 spec update](https://workos.com/blog/mcp-2025-11-25-spec-update)
- [Microsoft VS Code — A common protocol for languages (LSP launch)](https://code.visualstudio.com/blogs/2016/06/27/common-language-protocol)
- [Microsoft VS Code — New home for the Debug Adapter Protocol](https://code.visualstudio.com/blogs/2018/08/07/debug-adapter-protocol-website)
- [Geth docs — JSON-RPC server](https://geth.ethereum.org/docs/interacting-with-geth/rpc)
- [Bitcoin Core — JSON-RPC interface](https://github.com/bitcoin/bitcoin/blob/master/doc/JSON-RPC-interface.md)
- [Alchemy — Solana RPC overview](https://www.alchemy.com/overviews/solana-rpc)
- [QuickNode — Guide to efficient RPC requests](https://www.quicknode.com/guides/quicknode-products/apis/guide-to-efficient-rpc-requests)
- [Stratum V2 protocol](https://stratumprotocol.org/)
- [Glama — Why MCP uses JSON-RPC instead of REST or gRPC](https://glama.ai/blog/2025-08-13-why-mcp-uses-json-rpc-instead-of-rest-or-g-rpc)
- [Don Box — A brief history of SOAP](https://medium.com/omniaprotocol/wtf-is-json-rpc-c8843f9fb80e)
- [Tim Bray — The last JSON spec (RFC 8259, STD 90)](https://www.tbray.org/ongoing/When/201x/2017/12/14/RFC-8259-STD-90)
- [Latent Space — One Year of MCP with David Soria Parra](https://www.latent.space/p/one-year-of-mcp-with-david-soria)
- [The New Stack — Why the Model Context Protocol won](https://thenewstack.io/why-the-model-context-protocol-won/)
- [Toolradar — Streamable HTTP vs SSE](https://toolradar.com/blog/streamable-http-vs-sse)
- [Snyk — How to debug an MCP server with Anthropic Inspector](https://snyk.io/articles/how-to-debug-mcp-server-with-anthropic-inspector/)
- [Apono — What is Agent2Agent (A2A) Protocol and how to adopt it](https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/)
- [Galileo AI — Google Agent2Agent (A2A) protocol guide](https://galileo.ai/blog/google-agent2agent-a2a-protocol-guide)
- [Zeeve — How to secure Ethereum JSON-RPC from vulnerabilities](https://www.zeeve.io/blog/how-to-secure-ethereum-json-rpc-from-vulnerabilities/)
- [Anakin — gRPC vs REST benchmarks](https://anakin.ai/blog/45-grpc-vs-rest/)

### News

- [The Hacker News — Anthropic MCP design vulnerability (April 2026)](https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html)
- [CoinDesk — Bug on Ethereum's Nethermind sparks client-diversity discussion](https://www.coindesk.com/tech/2024/01/22/bug-on-ethereums-nethermind-software-sparks-discussion-of-client-diversity-risks)
- [CoinDesk — Coinbase moves to improve Ethereum's client diversity](https://www.coindesk.com/tech/2024/02/28/coinbase-moves-to-improve-ethereums-client-diversity-by-adding-nethermind-erigon)
- [Phoronix — GDB adds Debug Adapter Protocol support](https://www.phoronix.com/news/GDB-Debug-Adapter-Protocol)
- [Atlassian Community — HTTP+SSE deprecation notice](https://community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484)

### Wikipedia and reference

- [Wikipedia — JSON](https://en.wikipedia.org/wiki/JSON)
- [Wikipedia — JSON-RPC](https://en.wikipedia.org/wiki/JSON-RPC)
- [Wikipedia — XML-RPC](https://en.wikipedia.org/wiki/XML-RPC)
- [Wikipedia — Web Application Messaging Protocol](https://en.wikipedia.org/wiki/Web_Application_Messaging_Protocol)
- [HandWiki — SOAP](https://handwiki.org/wiki/SOAP)
- [Bitcoin Wiki — JSON-RPC API reference](https://en.bitcoin.it/wiki/API_reference_(JSON-RPC))
