---
prompt_source: deep-research-prompts.txt:4674-4857 (PROTOCOL · JSON-RPC)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/b87ae524-683a-428a-882a-a00e9220f2dc
research_mode: claude.ai Research
---

# JSON-RPC: The Quiet Protocol That Now Carries the AI Agent Internet

A research report for engineers — last updated 2026-05-05.

---

## 1. Prerequisites and Glossary

JSON-RPC is a "stateless, light-weight remote procedure call (RPC) protocol" that piggybacks on JSON for encoding and is deliberately **transport-agnostic** — it can run "within the same process, over sockets, over http, or in many various message passing environments" (jsonrpc.org/specification). To understand it, an engineer needs the following vocabulary: [JSON-RPC + 2](https://www.jsonrpc.org/specification)

- **OSI / TCP-IP layers.** A simplified model where the **transport layer** (TCP, UDP, QUIC) moves bytes reliably (or not) between hosts and the **application layer** (HTTP, SSH, JSON-RPC) gives those bytes meaning. JSON-RPC sits at the application layer and explicitly does not specify a transport.
- **Socket.** An OS-level endpoint of a network connection identified by (IP address, port). On Unix, sockets can also be local files (Unix domain sockets) — the way Bitcoin Core and `geth`'s IPC channel work (geth.ethereum.org/docs/interacting-with-geth/rpc).
- **Header.** Bytes that prefix a payload to describe it. HTTP, LSP, and DAP all wrap JSON-RPC bodies in headers like `Content-Length: <bytes>\r\n\r\n` (microsoft.github.io/language-server-protocol).
- **Checksum / hash.** A short value computed from a longer value to detect corruption or, in cryptographic forms (SHA-256, keccak256), to commit to it. JSON-RPC itself has no checksums; the underlying transport (TCP, TLS) provides them.
- **Handshake.** A protocol-level negotiation at the beginning of a connection. JSON-RPC has no handshake of its own, but layers on top of it (LSP `initialize`, MCP `initialize`, A2A Agent Cards, Stratum `mining.subscribe`) define one.
- **Stream vs. frame vs. datagram.** A *stream* is an ordered, reliable sequence of bytes (TCP); a *datagram* is a single self-contained packet (UDP); a *frame* is a delimited unit inside a stream (WebSocket frame, LSP `Content-Length`-delimited frame). JSON-RPC messages are framed by the transport — newlines for stdio in MCP, `Content-Length` headers in LSP/DAP, HTTP request bodies for HTTP.
- **RPC (remote procedure call).** Make a function call on another machine look like a local one. The idea dates to the 1970s; SunRPC (1980s) and CORBA (1991) are direct ancestors. JSON-RPC is the deliberately-minimal modern reincarnation (medium.com/omniaprotocol/wtf-is-json-rpc-c8843f9fb80e). [Medium](https://medium.com/omniaprotocol/wtf-is-json-rpc-c8843f9fb80e)
- **JSON.** A human-readable data interchange format originally specified by Douglas Crockford in the early 2000s, standardized as RFC 8259 (Bray, Ed., December 2017, DOI 10.17487/RFC8259) and ECMA-404. JSON-RPC requires UTF-8 encoding when JSON is exchanged between systems "that are not part of a closed ecosystem" (rfc-editor.org/info/rfc8259). [Wikipedia + 3](https://en.wikipedia.org/wiki/JSON)
- **UTF-8.** The dominant variable-width Unicode encoding (RFC 3629). RFC 8259 makes UTF-8 the only interoperable encoding for JSON; MCP's spec specifies that "JSON-RPC messages MUST be UTF-8 encoded" (modelcontextprotocol.io/specification/2025-03-26/basic/transports). [IETF](https://datatracker.ietf.org/doc/html/rfc8259)[Model Context Protocol](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- **Unicode.** The character-set standard that JSON strings reference; JSON.org notes JSON strings are "a sequence of zero or more Unicode characters" (en.wikipedia.org/wiki/JSON). [IETF](https://datatracker.ietf.org/doc/html/rfc8259)
- **Request / Response.** A pair: client sends a structured call, server sends a structured reply correlated by `id`. JSON-RPC 2.0 defines these as objects with required `jsonrpc: "2.0"`, `method`, optional `params`, and `id` for requests; `jsonrpc`, exactly one of `result` or `error`, and matching `id` for responses (jsonrpc.org/specification). [JSON-RPC](https://www.jsonrpc.org/specification)[JSON-RPC](https://www.jsonrpc.org/specification)
- **Notification.** A request with no `id`. The server "MUST NOT reply" — including inside batches (jsonrpc.org/specification). Useful for fire-and-forget events; LSP and MCP both rely heavily on them (e.g., `textDocument/didChange`, `notifications/initialized`). [JSON-RPC](https://www.jsonrpc.org/specification)
- **Batch.** A JSON array of request objects sent in a single transport unit. The server returns an array of responses, possibly in a different order — clients must correlate by `id` (jsonrpc.org/specification).
- **Idempotency.** Whether repeating a call has the same effect as making it once. JSON-RPC the protocol does not define idempotency; the *application's* method names do. Bitcoin's `getbalance` is idempotent; `sendrawtransaction` is not.
- **Method namespace.** Method names beginning with `rpc.` are reserved for protocol extensions (jsonrpc.org/specification). Ethereum uses underscored prefixes — `eth_`, `net_`, `web3_`, `admin_` — for namespacing (geth.ethereum.org/docs/interacting-with-geth/rpc). [JSON-RPC](https://www.jsonrpc.org/specification)
- **Error object.** `{ code, message, data? }` where `code` is a number. Reserved ranges follow next section.

---

## 2. History and Story

### 2.1 Origin (2005)

JSON itself was specified and popularized by Douglas Crockford in the early 2000s; the first JSON message was sent by Crockford and Chip Morningstar in April 2001 (en.wikipedia.org/wiki/JSON). Once JSON existed, doing remote procedure calls over it was an obvious move. The first JSON-RPC 1.0 specification was published in 2005 on json-rpc.org under a Trac wiki, defining a minimal request/response/notification model with `method`, `params`, `id`, `result`, `error` (jsonrpc.org/specification_v1). [Wikipedia](https://en.wikipedia.org/wiki/JSON)

JSON-RPC was a deliberate reaction to **XML-RPC** (Dave Winer, UserLand Software, 1998) and especially to its baroque descendant **SOAP**. In Don Box's "A Brief History of SOAP" (xml.com/pub/a/ws/2001/04/04/soap.html), Box recounts that he, Bob Atkinson, Mohsen Al-Ghosein (Microsoft) and Dave Winer designed what became SOAP in early 1998, but Microsoft politics around the COM/MTS team and the XML-Data group delayed shipping. "Unwilling to let the slow process of getting MS to act on SOAP beyond a press release, Dave Winer went out on his own and shipped the XML-RPC specification based on subsetting the original SOAP type system." Winer published XML-RPC as part of UserLand's Frontier 5.1 in June 1998 (en.wikipedia.org/wiki/XML-RPC). SOAP grew up into a W3C Recommendation (1.2 in June 2003) and the WS-* tower; many engineers found it bloated. JSON-RPC was the JSON-era answer to "the same idea, only simple." [Wikipedia + 2](https://en.wikipedia.org/wiki/XML-RPC)

### 2.2 Versions

- **1.0 (2005)** — published on the original json-rpc.org Trac. Peer-to-peer in spirit (clients and servers symmetric), `id: null` used for notifications, no `jsonrpc` version field (jsonrpc.org/specification_v1). [Simple-is-better](https://www.simple-is-better.org/rpc/)
- **1.1 Working Draft (2006–2008)** — by Atif Aziz et al.; introduced `system.describe`, named parameters and a service-description model. It "did not reach W3C Recommendation status" and **never finalized**; a parallel "1.1 ALT" was also floated (jsonrpc.org/historical/json-rpc-1-1-wd.html, jsonrpc.org/historical/jsonrpc12_proposal.html). [JSON-RPC](https://www.jsonrpc.org/historical/json-rpc-1-1-wd.html)
- **2.0 working draft → final spec (March 2010, finalized later in 2010)** — a "working progress from Matthew P. C. Morley (MPCM) based on the original spec," explicitly removing transport assumptions, adding the `jsonrpc: "2.0"` discriminator, batch requests, named parameters, and the modern error-object format (jsonrpc.org/historical/json-rpc-object-specification.html). Its "About" page on the archive notes "the current version of the specification can be found at JSON-RPC 2.0, which is hosted by Matt Morley (MPCM)" (jsonrpc.org/archive_json-rpc.org/about.html). [JSON-RPC](https://www.jsonrpc.org/historical/json-rpc-object-specification.html)[JSON-RPC](https://www.jsonrpc.org/archive_json-rpc.org/about.html)

### 2.3 Why it survived

JSON-RPC kept living because it was small enough to re-implement in a weekend, transport-agnostic enough to drop into anything, and free of the WS-* governance baggage. From 2010–2024 it powered three quietly enormous deployments:

1. **Blockchain RPC.** Bitcoin Core (`bitcoind`) shipped a JSON-RPC interface from very early Satoshi-era versions on TCP port 8332 (developer.bitcoin.org/examples/intro.html). Ethereum codified it as the de-facto execution-client API standard in EIP-1474 (eips.ethereum.org/EIPS/eip-1474), and Solana, Polkadot, Cosmos and most others followed (solana.com/docs/rpc). [Bitcoin Wiki](https://en.bitcoin.it/wiki/API_reference_(JSON-RPC))
2. **Language Server Protocol (LSP).** Microsoft's "A Common Protocol for Languages" (June 27, 2016) announced LSP, jointly with Red Hat and Codenvy, and explicitly chose JSON-RPC as the wire format "due to its simplicity and existing libraries" (code.visualstudio.com/blogs/2016/06/27/common-language-protocol; github.com/microsoft/language-server-protocol/wiki/Protocol-History). Latest spec is LSP 3.17 (microsoft.github.io/language-server-protocol). [GitHub + 2](https://github.com/microsoft/language-server-protocol/wiki/Protocol-History)
3. **Debug Adapter Protocol (DAP).** Microsoft's sister protocol, hosted at microsoft.github.io/debug-adapter-protocol since 2018, uses the same `Content-Length`-framed JSON message format but is "similar to but not compatible with the JSON-RPC used in the LSP" (code.visualstudio.com/blogs/2018/08/07/debug-adapter-protocol-website). GDB's mainline added DAP support via `gdb -i=dap` (phoronix.com/news/GDB-Debug-Adapter-Protocol). [Visual Studio Code](https://code.visualstudio.com/blogs/2018/08/07/debug-adapter-protocol-website)[Phoronix](https://www.phoronix.com/news/GDB-Debug-Adapter-Protocol)

### 2.4 What changed in the last 24 months (May 2024 → May 2026)

This is the dramatic part of the story — JSON-RPC went from "specialty plumbing" to "the wire protocol of the AI agent internet."

- **November 25, 2024 — Anthropic open-sources MCP.** The Model Context Protocol "uses JSON-RPC 2.0 messages to establish communication" between AI hosts, clients, and servers; its design is explicitly inspired by LSP (modelcontextprotocol.io/specification/2025-11-25). It was created at Anthropic by **David Soria Parra** and **Justin Spahr-Summers** (en.wikipedia.org/wiki/Model_Context_Protocol). [Model Context Protocol + 3](https://modelcontextprotocol.io/specification/2025-11-25)
- **March 26, 2025 — MCP spec 2025-03-26.** Introduces **Streamable HTTP** transport, deprecates the original HTTP+SSE transport from 2024-11-05, and consolidates to a single `/mcp` endpoint that supports `POST`/`GET` and optional SSE upgrades (modelcontextprotocol.io/specification/2025-03-26/basic/transports; blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/). [Toolradar](https://toolradar.com/blog/streamable-http-vs-sse)
- **April 9, 2025 — Google announces A2A.** The Agent2Agent Protocol launched with 50+ founding partners, runs on "HTTP, SSE, JSON-RPC" (developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/). Google donated A2A to the Linux Foundation in June 2025; its supporter list grew to 150+ organizations (dev.to/agentsindex/googles-a2a-protocol-how-ai-agents-communicate-across-frameworks-52jj). [DEV Community](https://dev.to/agentsindex/googles-a2a-protocol-how-ai-agents-communicate-across-frameworks-52jj)[DEV Community](https://dev.to/agentsindex/googles-a2a-protocol-how-ai-agents-communicate-across-frameworks-52jj)
- **March 26, 2025 — OpenAI adopts MCP.** Sam Altman publicly committed to MCP support in OpenAI's Agents SDK, ChatGPT desktop and Responses API (thenewstack.io/why-the-model-context-protocol-won/). [The New Stack](https://thenewstack.io/why-the-model-context-protocol-won/)[Apple Podcasts](https://podcasts.apple.com/us/podcast/the-creators-of-model-context-protocol/id1674008350?i=1000702137438)
- **April 17, 2025 — `@modelcontextprotocol/sdk` v1.10.0** was the first SDK release with `StreamableHTTPServerTransport` (toolradar.com/blog/streamable-http-vs-sse). [Fka](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
- **June 18, 2025 — MCP spec 2025-06-18.** Adds OAuth 2.1 authorization, structured tool outputs, and elicitation (modelcontextprotocol.info/blog/mcp-next-version-update/). [Substack +2](https://www.latent.space/p/one-year-of-mcp-with-david-soria)
- **November 25, 2025 — MCP spec 2025-11-25 (one-year anniversary release).** Adds the **Tasks** primitive for asynchronous "call-now, fetch-later" execution, formal extensions framework, OAuth client-credentials machine-to-machine flow (SEP-1046), URL-mode elicitation (SEP-1036), and statelessness improvements (blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/; workos.com/blog/mcp-2025-11-25-spec-update). [WorkOS + 3](https://workos.com/blog/mcp-2025-11-25-spec-update)
- **December 9, 2025 — Anthropic donates MCP to the Linux Foundation's new Agentic AI Foundation (AAIF)**, alongside Block's `goose` and OpenAI's `AGENTS.md`; Platinum members include AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI (anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation; linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation; techcrunch.com/2025/12/09/openai-anthropic-and-block-join-new-linux-foundation-effort-to-standardize-the-ai-agent-era/). [Spotify + 2](https://open.spotify.com/episode/1hA0iIjZ90yaFLVTX4NkJs)
- **By March 2026** — MCP reportedly surpasses 97 million monthly SDK downloads and 10,000+ active servers (anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation; dev.to/x4nent/complete-guide-to-mcp-model-context-protocol-in-2026-architecture-implementation-and-4a11). These figures come from Anthropic and the New Stack and should be read as ecosystem-vendor numbers rather than independently audited. [DEV Community + 2](https://dev.to/x4nent/complete-guide-to-mcp-model-context-protocol-in-2026-architecture-implementation-and-4a11)
- **Mid-2026 deadline** — Atlassian Rovo MCP HTTP+SSE endpoint shutdown June 30, 2026; Keboola April 1, 2026 (community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484; toolradar.com/blog/streamable-http-vs-sse). [Atlassian Community](https://community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484)[Toolradar](https://toolradar.com/blog/streamable-http-vs-sse)

There is no JSON-RPC **3.0** — the underlying spec at jsonrpc.org/specification has not changed. What changed is what gets layered on top.

### 2.5 Politics and design alternatives that lost

- **XML-RPC** lost on weight; SOAP lost on simplicity, governance, and tooling cost.
- **JSON-RPC 1.1** lost to 1.2/2.0 because it bundled service description into the wire format; the community preferred a smaller core plus optional schemas (now lived out by **OpenRPC**).
- **JSON-Pure** ("REST without verbs except POST") lost cultural ground to formal JSON-RPC 2.0 once Ethereum, LSP, and MCP standardized on the latter.
- For the AI-agent niche, the explicit design alternatives **gRPC** and **REST** were rejected by MCP and A2A. The MCP team's argument is that REST's noun model fits resources poorly for tool calls, gRPC's binary framing is hostile to browsers and to debugging, and JSON-RPC's "verbs over JSON" maps directly to LLM tool-calling semantics (glama.ai/blog/2025-08-13-why-mcp-uses-json-rpc-instead-of-rest-or-g-rpc). [DEV Community](https://dev.to/om_shree_0709/why-mcp-uses-json-rpc-instead-of-rest-or-grpc-1gpo)

---

## 3. How It Actually Works

JSON-RPC 2.0 is short enough to read in twenty minutes and you should — but here is the operational summary an implementer needs.

### 3.1 Message types

**Request object** — a JSON object with:

- `jsonrpc` — required string, exactly `"2.0"`.
- `method` — required string. Names beginning `rpc.` are reserved. [JSON-RPC](https://www.jsonrpc.org/specification)
- `params` — optional structured value: an Array (positional) or Object (named). Mixing positional and named in one call is not possible. [JSON-RPC + 2](https://www.jsonrpc.org/specification)
- `id` — optional. String, Number, or Null. If absent, the request is a Notification. Spec discourages Null and fractional numbers (jsonrpc.org/specification). [JSON-RPC](https://www.jsonrpc.org/specification)

**Response object**:

- `jsonrpc` — required, `"2.0"`. [JSON-RPC](https://www.jsonrpc.org/specification)
- Exactly one of `result` (any JSON value defined by the method) or `error` (Error object). Both present, or both absent, is illegal. [JSON-RPC](https://www.jsonrpc.org/specification)
- `id` — required; must equal the request's `id`. If the server cannot detect the id (e.g., parse error on the request), `id` MUST be Null.

**Notification** — a Request without `id`. Server MUST NOT reply, including within batches.

**Batch** — a JSON array containing 1+ Request/Notification objects. Server returns an array of Responses (omitting Notifications). Order of responses is *not* required to match request order — correlate by `id`. If the array is empty, or the batch itself is malformed JSON, the server returns a single Response with `id: null` and an error. If the batch contains only Notifications, the server "MUST NOT return an empty Array and should return nothing at all" (jsonrpc.org/specification). [JSON-RPC](https://www.jsonrpc.org/specification)

**Error object**:

- `code` — required integer.
- `message` — required short string.
- `data` — optional, any JSON value, server-defined.

### 3.2 Reserved error codes

Codes from −32768 to −32000 are reserved (jsonrpc.org/specification). The named ones:

| Code | Name | Meaning |
|---|---|---|
| −32700 | Parse error | Server received invalid JSON. |
| −32600 | Invalid Request | The JSON sent is not a valid Request object. |
| −32601 | Method not found | Method does not exist or is not available. |
| −32602 | Invalid params | Invalid method parameters. |
| −32603 | Internal error | Internal JSON-RPC error. |
| −32000 to −32099 | Server error | Reserved for implementation-defined server errors. |

The choice of **−32700 specifically** is direct XML-RPC heritage: XML-RPC standardized parse-error code −32700 in the late-1990s "Fault Code Interoperability" community spec, and JSON-RPC 2.0's authors deliberately mirrored those numbers so that implementations could be ported without surprising users. The Wikipedia article on JSON-RPC notes the "pre-defined error codes which follow those defined for XML-RPC" (en.wikipedia.org/wiki/JSON-RPC). [Wikipedia](https://en.wikipedia.org/wiki/JSON-RPC)

### 3.3 On-the-wire bytes

A typical request, e.g., to subtract two numbers, when sent over HTTP looks like:

```
POST /rpc HTTP/1.1
Host: example.com
Content-Type: application/json
Content-Length: 76

{"jsonrpc":"2.0","method":"subtract","params":[42,23],"id":1}
```

And the response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 38

{"jsonrpc":"2.0","result":19,"id":1}
```

Over **stdio (MCP, LSP, DAP)**, framing differs:

- **MCP stdio**: messages "are delimited by newlines, and MUST NOT contain embedded newlines" — pure newline-delimited JSON (modelcontextprotocol.io/specification/2025-03-26/basic/transports). [Model Context Protocol](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- **LSP / DAP**: an HTTP-style header block precedes each payload: `Content-Length: <bytes>\r\n\r\n<UTF-8 JSON>`, with optional `Content-Type: application/vscode-jsonrpc; charset=utf-8` (microsoft.github.io/language-server-protocol; freecodecamp.org/news/language-server-protocol-and-the-future-of-ide/). [Grokipedia](https://grokipedia.com/page/Language_Server_Protocol)

### 3.4 State machine

Pure JSON-RPC has no session: each Request/Response pair is independent. State is added by layers above. MCP's lifecycle, for example, is:

1. **Initialize** — client sends `initialize` with capabilities; server responds with its capabilities.
2. **Initialized** — client sends `notifications/initialized`.
3. **Operation** — arbitrary tool calls, resource reads, prompt requests; bidirectional notifications (e.g., `notifications/resources/updated`).
4. **Shutdown** — transport-specific (close the stream, close the HTTP session by sending `DELETE` to the MCP endpoint with the `Mcp-Session-Id` header).

LSP follows the same pattern with `initialize` → `initialized` → many request/response and notification exchanges → `shutdown` then `exit`.

### 3.5 Mermaid sequence diagram of message flow (typical MCP tool call)

MCP ServerMCP Client (per-server)Host App (e.g. Claude Desktop)MCP ServerMCP Client (per-server)Host App (e.g. Claude Desktop)#mermaid-rge{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rge .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rge .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rge .error-icon{fill:#CC785C;}#mermaid-rge .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rge .edge-thickness-normal{stroke-width:1px;}#mermaid-rge .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rge .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rge .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rge .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rge .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rge .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rge .marker.cross{stroke:#A1A1A1;}#mermaid-rge svg{font-family:inherit;font-size:16px;}#mermaid-rge p{margin:0;}#mermaid-rge .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rge text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rge .actor-line{stroke:#A1A1A1;}#mermaid-rge .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rge .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rge #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rge .sequenceNumber{fill:#5e5e5e;}#mermaid-rge #sequencenumber{fill:#E5E5E5;}#mermaid-rge #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rge .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rge .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rge .labelText,#mermaid-rge .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rge .loopText,#mermaid-rge .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rge .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rge .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rge .noteText,#mermaid-rge .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rge .activation0{fill:transparent;stroke:#00000000;}#mermaid-rge .activation1{fill:transparent;stroke:#00000000;}#mermaid-rge .activation2{fill:transparent;stroke:#00000000;}#mermaid-rge .actorPopupMenu{position:absolute;}#mermaid-rge .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rge .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rge .actor-man circle,#mermaid-rge line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rge :root{--mermaid-font-family:inherit;}--- session established ---spawn / connect (stdio or HTTP){"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}{"jsonrpc":"2.0","id":1,"result":{"capabilities":{...}}}{"jsonrpc":"2.0","method":"notifications/initialized"}user asks a question{"jsonrpc":"2.0","id":2,"method":"tools/list"}{"jsonrpc":"2.0","id":2,"result":{"tools":[...]}}{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"query_db","arguments":{...}}}{"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"..."}]}}{"jsonrpc":"2.0","method":"notifications/progress","params":{...}}{"jsonrpc":"2.0","id":4,"method":"shutdown"}

### 3.6 Edge cases and traps

- **`id: null` vs missing `id`.** In 1.0, `null` meant notification; in 2.0, *missing* means notification, and `null` is reserved for responses to malformed requests. Many libraries still mishandle this — always test with both.
- **Batch ordering.** Server may answer in any order. Clients MUST correlate by `id`.
- **Batch of notifications.** Returns nothing. Do not confuse "no body" with timeout.
- **Mixed positional/named params.** Forbidden in one call.
- **Numeric `id` collisions.** If a client uses small integers and the server keeps long-lived connections, ids can collide. Use UUIDs (jayson's default RFC4122-style id) on long-lived connections. [GitHub](https://github.com/iammapping/jayson)
- **Transport framing.** MCP forbids embedded newlines on stdio; LSP forbids missing `Content-Length`. Violations corrupt the stream.
- **`rpc.` prefix.** Reserved for protocol extensions. OpenRPC uses `rpc.discover` (eips.ethereum.org/EIPS/eip-1901). [GitHub](https://github.com/ethereum/EIPs/issues/1902)

---

## 4. Deep Connections to Other Protocols

### 4.1 XML-RPC (1998 — direct ancestor)

The spiritual and structural parent. Dave Winer (UserLand Software) shipped XML-RPC in Frontier 5.1 in June 1998 after Microsoft politics stalled what would later become SOAP (en.wikipedia.org/wiki/XML-RPC; xml.com/pub/a/ws/2001/04/04/soap.html). XML-RPC defined the *shape* — methodCall → methodResponse → fault, fault codes including −32700 — that JSON-RPC subsetted in 2005. Its spec famously fits on two pages. Without XML-RPC there is no JSON-RPC. [Wikipedia](https://en.wikipedia.org/wiki/XML-RPC)[owlapps](https://www.owlapps.net/owlapps_apps/articles?id=80850&lang=en)

### 4.2 SOAP

SOAP grew from the same 1998 design table (Winer, Don Box, Bob Atkinson, Mohsen Al-Ghosein) but was held inside Microsoft until September 1999 and reached W3C Recommendation as 1.2 in June 2003 (handwiki.org/wiki/SOAP). Where SOAP added envelopes, XML Schema, WS-* extensions and WSDL, JSON-RPC kept the original spirit of "tiny RPC." Today SOAP survives in legacy enterprise integrations; JSON-RPC won the "lightweight web RPC" category outright. [HandWiki](https://handwiki.org/wiki/SOAP)

### 4.3 HTTP/1.1

The most common JSON-RPC transport: client `POST`s a JSON-RPC body with `Content-Type: application/json` (Ethereum, Bitcoin, Solana) or `application/json-rpc`. JSON-RPC says nothing about HTTP semantics — every endpoint is a single URL, every call uses `POST`, HTTP status is mostly 200 even on application errors. This is intentionally un-RESTful.

### 4.4 WebSocket

A common bidirectional transport. WebSocket gives you a framed, full-duplex byte channel and JSON-RPC messages flow either way; jayson and most blockchain RPC providers support WS endpoints (geth.ethereum.org/docs/interacting-with-geth/rpc; github.com/tedeh/jayson). WAMP (below) standardizes JSON-RPC-like semantics on top of WebSocket.

### 4.5 Server-Sent Events (SSE)

A unidirectional stream from server to client over HTTP. MCP's first remote transport (2024-11-05) used SSE plus a separate POST endpoint for client→server traffic; this was deprecated in favor of Streamable HTTP in 2025-03-26 (modelcontextprotocol.io/specification/2025-03-26/basic/transports; auth0.com/blog/mcp-streamable-http/). A2A still uses SSE for streaming partial results from the remote agent (a2a-protocol.org/latest/specification/). [The AI Agent Factory](https://agentfactory.panaversity.org/docs/TypeScript-Language-Realtime-Interaction/async-patterns-streaming/streamable-http-mcp-standard)

### 4.6 REST (philosophical alternative)

REST organizes around nouns/resources and HTTP verbs (GET/POST/PUT/DELETE). JSON-RPC organizes around verbs/procedures. The MCP team articulates the trade succinctly: "REST is for nouns while JSON-RPC is for verbs," and tool-calling semantics fit the latter (glama.ai/blog/2025-08-13-why-mcp-uses-json-rpc-instead-of-rest-or-g-rpc). REST is better for cacheable, browseable resource APIs; JSON-RPC is better for action-oriented APIs, especially those with many parameters or complex types. [Glama](https://glama.ai/blog/2025-08-13-why-mcp-uses-json-rpc-instead-of-rest-or-g-rpc)

### 4.7 gRPC (binary RPC alternative)

Google's HTTP/2 + Protocol Buffers RPC framework. Benchmarks suggest 3–4× lower median latency and ~60–80% smaller payloads vs JSON-RPC over HTTP/1.1 (anakin.ai/blog/45-grpc-vs-rest/). JSON-RPC trades that performance for human readability, browser-friendliness, and debugability — the same trade A2A and MCP made (a2a-protocol.org/latest/specification/). [Anakin](https://anakin.ai/blog/45-grpc-vs-rest/)[Tirnav](https://tirnav.com/blog/json-vs-grpc-performance-benchmark)

### 4.8 GraphQL

A query-language alternative with a typed schema, single endpoint, client-specified shapes. GraphQL replaces *resource design* with *query design*; JSON-RPC replaces it with *method design*. They are not direct competitors but both have eaten REST share in different niches. Geth even shipped a GraphQL endpoint (CVE-flagged for memory exhaustion — see §6).

### 4.9 MCP — Model Context Protocol (Anthropic, Nov 2024)

Uses JSON-RPC 2.0 as its wire format, full stop. The 2025-11-25 spec mandates UTF-8 JSON-RPC over either stdio (newline-delimited) or Streamable HTTP (modelcontextprotocol.io/specification/2025-11-25). MCP adds: capability negotiation; three primitives (Tools, Resources, Prompts); a sampling primitive that lets the server request LLM completions from the client; elicitation; the new asynchronous Tasks primitive; OAuth 2.1 authorization. By April 2025 MCP had crossed roughly 81,000 GitHub stars and was supported by Claude, ChatGPT, Cursor, Gemini, Microsoft Copilot, VS Code (dev.to/x4nent/complete-guide-to-mcp-model-context-protocol-in-2026-architecture-implementation-and-4a11). Anthropic explicitly cites LSP as the design model (modelcontextprotocol.io/specification/2025-11-25). [Model Context Protocol + 5](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)

### 4.10 A2A — Agent2Agent (Google, April 2025)

JSON-RPC 2.0 over HTTPS for synchronous request/response, SSE for streaming partial results. Each A2A agent publishes an **Agent Card** at `/.well-known/agent.json` describing its skills and supported auth flows; clients send `message/send` or `message/sendSubscribe` JSON-RPC calls (a2a-protocol.org/latest/specification/; codelabs.developers.google.com/intro-a2a-purchasing-concierge). MCP and A2A are explicitly **complementary**: "MCP defines how agents interact with tools, while A2A defines how agents collaborate with each other" (dev.to/x4nent/complete-guide-to-mcp-model-context-protocol-in-2026-architecture-implementation-and-4a11). Google donated A2A to the Linux Foundation in June 2025 and the supporter count climbed to 150+ organizations. [Apono](https://www.apono.io/blog/what-is-agent2agent-a2a-protocol-and-how-to-adopt-it/)[DEV Community](https://dev.to/x4nent/complete-guide-to-mcp-model-context-protocol-in-2026-architecture-implementation-and-4a11)

### 4.11 LSP — Language Server Protocol (Microsoft, June 2016)

Announced at DevNation in San Francisco, jointly with Red Hat and Codenvy. Picked JSON-RPC "due to its simplicity and existing libraries" (code.visualstudio.com/blogs/2016/06/27/common-language-protocol; github.com/microsoft/language-server-protocol/wiki/Protocol-History). LSP turned the M editors × N languages problem into M + N. Latest specification version is 3.17 (microsoft.github.io/language-server-protocol). Frames JSON-RPC with an HTTP-like `Content-Length` header. [Visual Studio Code + 2](https://code.visualstudio.com/blogs/2016/06/27/common-language-protocol)

### 4.12 DAP — Debug Adapter Protocol (Microsoft, 2018 web release)

A debugging analog to LSP. Uses the same `Content-Length`-framed JSON message format but a different envelope (`{"seq", "type", "command"|"event"|"response"}`); the Microsoft team explicitly notes it is "similar to but not compatible with the JSON-RPC used in the LSP" (code.visualstudio.com/blogs/2018/08/07/debug-adapter-protocol-website). Spec at version 1.71.0 as of writing (microsoft.github.io/debug-adapter-protocol/). Adopted by GDB, LLDB, IntelliJ, Eclipse, Emacs. [GitHub](https://microsoft.github.io/debug-adapter-protocol//specification.html)[GitHub](https://microsoft.github.io/debug-adapter-protocol/)

### 4.13 Ethereum JSON-RPC (massive deployment)

Every execution client — Geth, Erigon, Nethermind, Besu, Reth — exposes a JSON-RPC interface over HTTP, WebSocket, or Unix IPC, with namespaces like `eth_`, `net_`, `web3_`, `admin_` (geth.ethereum.org/docs/interacting-with-geth/rpc). Standardized in EIP-1474 ("Remote procedure call specification") and the Ethereum Execution APIs OpenRPC document at ethereum.github.io/execution-apis/. `eth_chainId` was added in EIP-695. Every wallet, every dApp, every block explorer, every L2 rollup talks JSON-RPC — this is one of the most heavily-trafficked JSON-RPC deployments on Earth, with providers like Infura, Alchemy, QuickNode operating large clusters of nodes behind it. [go-ethereum + 2](https://geth.ethereum.org/docs/interacting-with-geth/rpc)

### 4.14 Bitcoin JSON-RPC

`bitcoind` enables JSON-RPC by default on TCP port 8332 (testnet 18332, regtest 18443) (developer.bitcoin.org/examples/intro.html; github.com/bitcoin/bitcoin/blob/master/doc/JSON-RPC-interface.md). Bitcoin's docs warn that "the RPC interface has not been hardened to withstand arbitrary Internet traffic" — bind to localhost or use SSH tunnels. [Bitcoin Wiki + 2](https://en.bitcoin.it/wiki/API_reference_(JSON-RPC))

### 4.15 Solana JSON-RPC

Solana exposes JSON-RPC for read APIs (`getBalance`, `getTokenAccountBalance`, `getBlock`, `getRecentPerformanceSamples`, etc.) plus a parallel WebSocket subscription API (`logsSubscribe`, `slotSubscribe`, `blockSubscribe`) (solana.com/docs/rpc; docs.solana.com/developing/clients/jsonrpc-api). Solana's 400 ms block time means RPC providers compete on tail latency in the tens of milliseconds; benchmarks routinely report sub-100 ms p95 (alchemy.com/overviews/solana-rpc; jshelbyj.medium.com/latency-testing-solana-rpc-apis-providers-67efbc5d2c9f). [Medium](https://jshelbyj.medium.com/latency-testing-solana-rpc-apis-providers-67efbc5d2c9f)[Alchemy](https://www.alchemy.com/overviews/solana-rpc)

### 4.16 Other blockchain RPCs

Polkadot/Substrate, Cosmos/CometBFT, Sui, Aptos, Tron, Monero, Litecoin all expose JSON-RPC interfaces. Stratum, the Bitcoin and Ethereum mining-pool protocol, is itself "an instance of JSON-RPC-2.0" over a long-lived TCP socket with newline-delimited JSON (eips.ethereum.org/EIPS/eip-1571; github.com/aeternity/protocol/blob/master/STRATUM.md). [Ethereum](https://eips.ethereum.org/EIPS/eip-1571)

### 4.17 OpenRPC (schema/discovery for JSON-RPC)

The OpenAPI-equivalent for JSON-RPC. OpenRPC documents are JSON files describing methods, params, results, errors using JSON Schema; servers implement `rpc.discover` (a method reserved by JSON-RPC's `rpc.` prefix rule) to serve the document (spec.open-rpc.org; eips.ethereum.org/EIPS/eip-1901; open-rpc.org). Ethereum's official Execution APIs are an OpenRPC document. [spec](https://spec.open-rpc.org/)[Ethereum](https://eips.ethereum.org/EIPS/eip-1901)

### 4.18 WAMP — Web Application Messaging Protocol

A WebSocket subprotocol (registered with IANA) that adds *routed* RPC and Pub/Sub on top of WebSocket using JSON (or MessagePack) serialization. Not strictly JSON-RPC but heavily inspired by it; differs in introducing a router between caller and callee (en.wikipedia.org/wiki/Web_Application_Messaging_Protocol; wamp-proto.org/intro.html). [Webot](https://webot.org/info/en/?search=Web_Application_Messaging_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Web_Application_Messaging_Protocol)

### 4.19 JSON-RPC over WebSockets, JSON-Pure, JSON-WSP, SOAPjr

Fringe variants. JSON-WSP added a service description specification; JSON-Pure was an attempt at "REST without verbs"; SOAPjr was a hybrid (en.wikipedia.org/wiki/JSON-RPC). None achieved meaningful adoption.

### 4.20 Other systems worth noting

- **OpenStack and OpenDaylight** use JSON-RPC heavily for SDN/NFV control planes.
- **Microsoft SQL Tools Service** (used by Azure Data Studio) speaks JSON-RPC for SQL query and management (github.com/shanejonas/awesome-json-rpc). [GitHub](https://github.com/shanejonas/awesome-json-rpc)
- **Cisco NSO** exposes a JSON-RPC API over `/jsonrpc` for YANG-modeled network operations (nso-docs.cisco.com).
- **Kodi**, **FreeIPA**, **Monero** wallet, **Litecoin Core**, **Burrow** (Hyperledger) all expose JSON-RPC APIs (github.com/shanejonas/awesome-json-rpc). [GitHub](https://github.com/shanejonas/awesome-json-rpc)

---

## 5. Real-World Deployment

### 5.1 Named libraries

- **Node.js / browser:** `jayson` (npm; v4.3.0 as of Jan 2026; "JSON-RPC 1.0/2.0 compliant server and client" with HTTP, HTTPS, TCP, TLS, fork, browser interfaces) — github.com/tedeh/jayson; npmjs.com/package/jayson. `simple-jsonrpc-js` for browser. `multi-transport-jsonrpc`. `node-mole-rpc` for transport-agnostic use. [npm](https://www.npmjs.com/package/jayson)[npm](https://www.npmjs.com/package/jayson)
- **Python:** `jsonrpcserver` and `jsonrpcclient` by Beau Barker (explodinglabs.com/jsonrpcserver/), `python-jsonrpc` (gerold-penz/python-jsonrpc), `jsonrpclib` (joshmarshall/jsonrpclib — xmlrpclib-style API), `python-lsp-jsonrpc` (forked from Palantir's python-jsonrpc-server, maintained by the Spyder team). [GitHub + 4](https://github.com/explodinglabs/jsonrpcserver)
- **Go:** Standard library `net/rpc/jsonrpc`; `onrik/ethrpc` for Ethereum specifically; `gorilla/rpc/v2/json2` for JSON-RPC 2.0. [GitHub](https://github.com/onrik/ethrpc)
- **.NET:** Microsoft's `vs-streamjsonrpc` ("JSON-RPC 2.0 over any .NET Stream, WebSocket, or Pipe") and `JSON-RPC.NET`. [GitHub](https://github.com/shanejonas/awesome-json-rpc)
- **Rust:** `jsonrpsee`, `jsonrpc-core`, `jsonrpc-http-server` (Parity's family).
- **Java/Kotlin:** Eclipse `lsp4j` (LSP-flavored JSON-RPC).
- **Swift:** `JSONRPCKit`.

### 5.2 Named systems running JSON-RPC at scale

- **Ethereum execution clients** — Geth (≈74% of validators historically), Nethermind (~13%), Besu (~9%), Erigon (~3%), Reth (coindesk.com/tech/2024/02/28/coinbase-moves-to-improve-ethereums-client-diversity-by-adding-nethermind-erigon). Every wallet, indexer, and dApp talks Ethereum JSON-RPC. [CoinDesk](https://www.coindesk.com/tech/2024/02/28/coinbase-moves-to-improve-ethereums-client-diversity-by-adding-nethermind-erigon)
- **Ethereum RPC providers** — Infura, Alchemy ($4.2T processed annually per Alchemy's own marketing — alchemy.com/overviews/solana-rpc), QuickNode, Ankr, Flashbots, Helius (Solana-focused), Triton, BlockBlaster. [Alchemy](https://www.alchemy.com/overviews/solana-rpc)
- **Bitcoin Core** — every full node by default. Many wallets, exchanges, and indexers depend on it.
- **Solana** — `solana-test-validator`, Surfpool, Jito-Solana validator forks, plus all the cloud RPC providers.
- **LSP servers in production** — VS Code (Microsoft, billions of sessions), Visual Studio, JetBrains IDEs (via lsp4ij), Neovim (built-in `vim.lsp`), Emacs `lsp-mode`/`eglot`, Sublime LSP, Helix. Servers include `rust-analyzer`, `clangd`, `gopls`, `pyright`, `typescript-language-server`, `omnisharp`, `ccls`. The Microsoft developer-experience stack alone uses LSP across Visual Studio and VS Code (learn.microsoft.com/en-us/visualstudio/extensibility/language-server-protocol).
- **DAP** in production: VS Code's debugger UI, `debugpy`, GDB (`gdb -i=dap`), LLDB, Eclipse, Emacs `dape`/`dap-mode`.
- **MCP** — Claude Desktop (the canonical reference client); Claude Code; ChatGPT desktop and Apps (sept 2025); Cursor; Windsurf; VS Code Copilot; GitHub MCP server; Cloudflare-hosted servers (mcp.atlassian.com, Sentry, PayPal, Webflow, Linear, Supabase). Anthropic claims 97 M monthly SDK downloads as of late 2025 and 10,000+ active servers (anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation). [MCP Analytics + 2](https://mcpanalytics.blog/blog/cloudflare-remote-mcp-server-tutorial/)
- **A2A** — Google Agent Engine, Microsoft Semantic Kernel integration, Atlassian, Box, MongoDB, PayPal, Salesforce, SAP, ServiceNow, Workday participating; "as of early 2025, A2A protocol remains in early adoption phase with limited production deployment evidence" (galileo.ai/blog/google-agent2agent-a2a-protocol-guide). [Galileo AI](https://galileo.ai/blog/google-agent2agent-a2a-protocol-guide)

### 5.3 Deployment topologies

- **Local stdio.** Editor/IDE spawns a server process (LSP, DAP, local MCP), pipes JSON-RPC over stdin/stdout. Simple, fast, no auth needed. Default for development tooling.
- **Loopback HTTP with basic auth.** Bitcoin Core on `127.0.0.1:8332`, Geth on `localhost:8545`. Authentication via username/password (Bitcoin uses RPC Auth cookies generated each run) or by simply never exposing the port (developer.bitcoin.org/examples/intro.html; geth.ethereum.org/docs/interacting-with-geth/rpc).
- **Cloud RPC clusters.** Ethereum/Solana RPC providers run replicated, load-balanced JSON-RPC clusters — many millions of requests per second across the industry. Providers like QuickNode and Alchemy bill on "compute units" because not all JSON-RPC methods are equal cost (`getBalance` ≈ 20 CUs at Alchemy; archive queries far more) (alchemy.com/overviews/solana-rpc). [Alchemy](https://www.alchemy.com/overviews/solana-rpc)
- **Streamable HTTP behind WAFs and load balancers.** MCP's 2025-03-26 transport explicitly designed to work behind standard CDNs, WAFs, and L7 load balancers — a key reason SSE was deprecated (auth0.com/blog/mcp-streamable-http/). [Auth0](https://auth0.com/blog/mcp-streamable-http/)
- **Cloudflare Workers / Durable Objects.** A first-class platform for remote MCP servers since March 2025, with workers-oauth-provider, McpAgent, and mcp-remote (blog.cloudflare.com/remote-model-context-protocol-servers-mcp/; developers.cloudflare.com/agents/guides/remote-mcp-server/). [Cloudflare](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/)

### 5.4 Performance numbers (with sources)

- **gRPC vs JSON-RPC/REST**: benchmarks from anakin.ai/blog/45-grpc-vs-rest/ (a vendor blog — read with appropriate skepticism) report gRPC at ~12 ms median vs REST/JSON at ~45 ms median for a sample petstore API; gRPC handled ~4× the requests per second with 38% less CPU. [Anakin](https://anakin.ai/blog/45-grpc-vs-rest/)
- **Solana RPC**: Helius and other providers advertise sub-100 ms p95 for `getBalance`-class calls; Triton's Thorofare benchmark suite measures shred propagation, replay time, and account-update propagation as more meaningful metrics than raw RPC round trips (blog.triton.one/how-to-benchmark-solana-rpc-endpoints/).
- **Stratum mining**: a "normal mining.notify message weighs roughly 240 bytes; assuming dispatch of 1 work per block to 50,000 connected TCP sockets means transmission of roughly 1.88 TB of data a month" (eips.ethereum.org/EIPS/eip-1571). Stratum V2 uses a binary format and "cuts bandwidth use by about 60% for pools and 70% for miners" (stratumprotocol.org). [Ethereum](https://eips.ethereum.org/EIPS/eip-1571)[Stratumprotocol](https://stratumprotocol.org/)

---

## 6. Failure Modes and Famous Incidents

### 6.1 Ethereum JSON-RPC: the never-ending DoS surface

- **CVE-2024 family — Geth EIP-application DoS (Feb 2024).** Researcher Jason Matthyser disclosed via iosiro a bug where activating EIP-2929 instructions while disabling EIP-150 through `block overrides` in an `eth_call` payload would crash a Geth node "at zero cost." At disclosure it affected "the majority of Ethereum Mainnet RPC providers, including Infura, Alchemy, QuickNode, Ankr, and Flashbots"; Shodan showed 550+ exposed mainnet nodes. Fixed in Geth v1.13.12 (iosiro.com/blog/geth-out-of-order-eip-application-denial-of-service). [Iosiro + 3](https://iosiro.com/blog/geth-out-of-order-eip-application-denial-of-service)
- **CVE-2023-40591 (Geth ≤ 1.12.x)** — DoS in pre-merge handling, fixed in 1.12.1-stable (cvedetails.com). [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-17524/Ethereum.html)
- **Geth GraphQL endpoint memory exhaustion (Geth ≤ 1.13.4)** — crafted GraphQL query causes memory consumption and daemon hang. Note the vendor's stance that the "graphql endpoint [is not] designed to withstand attacks by hostile clients" (cvedetails.com). [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-17524/opdos-1/Ethereum.html)
- **Mempool DoS family.** Multiple Geth versions allowed "5120 pending transactions of a high gas price from one account that all fully spend the full balance" to purge a victim's mempool (DETER attack family) — fixed in current versions but the broader ADAMS class continues to spawn new variants (arxiv.org/html/2312.02642v3). [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-17524/opdos-1/Ethereum.html)
- **2018 — Open `geth` RPC ETH theft.** Misconfigured geth nodes with `--rpcaddr 0.0.0.0` and unlocked accounts let attackers call `eth_sendTransaction` and drain funds; the `pwngeth` toolkit and similar scanners industrialized this (github.com/maxzzze/pwngeth). [Zeeve](https://www.zeeve.io/blog/how-to-secure-ethereum-json-rpc-from-vulnerabilities/)[Zeeve](https://www.zeeve.io/blog/how-to-secure-ethereum-json-rpc-from-vulnerabilities/)
- **EPoD ("Ethereum Packet of Death")** — geth ≤ 1.8.11 crashed on a `GetBlockHeadersMsg` with `Skip = -1` (cvedetails.com/vulnerability-list/vendor_id-17524). [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-17524/opdos-1/Ethereum.html)
- **Nethermind January 2024 outage** — an execution-client bug took out ~8% of Ethereum validators; small staking penalties followed. A second Besu outage earlier the same month sparked Coinbase's commitment to multi-client diversity (coindesk.com/tech/2024/01/22/bug-on-ethereums-nethermind-software-sparks-discussion-of-client-diversity-risks). [CoinDesk](https://www.coindesk.com/tech/2024/02/28/coinbase-moves-to-improve-ethereums-client-diversity-by-adding-nethermind-erigon)[CoinDesk](https://www.coindesk.com/tech/2024/01/22/bug-on-ethereums-nethermind-software-sparks-discussion-of-client-diversity-risks)
- **2026 ETH Rangers research** found 14 bugs across Geth, Besu, Erigon, Nethermind, Reth allowing asymmetric CPU consumption (4× asymmetry), denied information propagation, and node crashes via flooding (blog.ethereum.org/en/2026/04/16/eth-rangers-recap). [Ethereum Foundation](https://blog.ethereum.org/en/2026/04/16/eth-rangers-recap)

### 6.2 The Parity multi-sig disasters (not JSON-RPC bugs but they happened *over* JSON-RPC)

These are smart-contract bugs, not JSON-RPC bugs, but every interaction was via JSON-RPC and they remain the most-cited failure stories in the ecosystem:

- **July 19, 2017** — `initWallet` reentrant in Parity Multisig 1.5+; ~150,000 ETH (~$30M then; ~$600M at later prices) stolen from three high-profile wallets (parity.io/blog/the-multi-sig-hack-a-postmortem/; blog.openzeppelin.com/on-the-parity-wallet-multisig-hack-405a8c12e8f7).
- **November 6, 2017** — user `devops199` triggered `initWallet` then `kill()` on the Parity library contract, freezing ~514,000 ETH (~$156M then) across 598 wallets, 60% of which belonged to the Web3 Foundation's Polkadot ICO (elementus.io/blog-post/which-icos-are-affected-by-the-parity-wallet-bug; medium.com/chain-cloud-company-blog/parity-multisig-hack-again-b46771eaa838). [Medium + 2](https://medium.com/chain-cloud-company-blog/parity-multisig-hack-again-b46771eaa838)

### 6.3 Stratum (mining) attacks

Recabarren and Carbunar's "Hardening Stratum, the Bitcoin Pool Mining Protocol" (arxiv.org/pdf/1703.06545) documented passive (StraTap, ISP Log) and active (BiteCoin / WireGhost) attacks exploiting Stratum's plaintext JSON-RPC over TCP. Stratum V2 (Čapek, Moravec, Corallo) replaced the JSON wire with an authenticated, encrypted binary one (stratumprotocol.org). [arxiv](https://arxiv.org/pdf/1703.06545)[Stratumprotocol](https://stratumprotocol.org/)

### 6.4 Bitcoin Core RPC exposure

Bitcoin Core's docs warn that "the RPC interface has not been hardened to withstand arbitrary Internet traffic, so changing the above settings to expose it to the Internet (even using something like a Tor onion service) could expose you to unconsidered vulnerabilities" (github.com/bitcoin/bitcoin/blob/master/doc/JSON-RPC-interface.md). Compromises of exposed `bitcoind` RPC endpoints are a recurring theft vector. [GitHub](https://github.com/bitcoin/bitcoin/blob/master/doc/JSON-RPC-interface.md)

### 6.5 The MCP CVE wave (2025–2026)

MCP's first year was a security education for the AI industry. Highlights:

- **CVE-2025-49596 — MCP Inspector RCE (CVSS 9.4).** Anthropic's own MCP Inspector (versions < 0.14.1) had no auth between the React UI and the proxy, allowing any malicious webpage to invoke MCP commands over stdio via DNS rebinding/0.0.0.0 tricks and execute arbitrary commands on the developer's machine. Disclosed by Oligo Security, fixed in 0.14.1 with session-token authentication (oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596; thehackernews.com/2025/07/critical-vulnerability-in-anthropics.html). [Oligo Security](https://www.oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596)[Oligo Security](https://www.oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596)
- **CVE-2025-53109 / CVE-2025-53110 — Anthropic Filesystem MCP Server.** Cymulate's Elad Beber found a directory-containment bypass (CVSS 7.3) and a symlink bypass leading to local privilege escalation (CVSS 8.4) (cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/). [Cymulate](https://cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/)
- **CVE-2025-49596 / CVE-2026-22252 (LibreChat) / CVE-2026-22688 (WeKnora) / CVE-2025-54994 (`@akoskm/create-mcp-server-stdio`) / CVE-2025-54136 (Cursor)** — same architectural pattern: STDIO command-injection via attacker-controlled config (thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html). [The Hacker News](https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html)
- **CVE-2026-30615 (Windsurf)** — zero-user-interaction RCE via attacker-controlled HTML modifying local MCP configuration (thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html). [Penligent](https://www.penligent.ai/hackinglabs/anthropic-mcp-vulnerability-7000-servers-and-the-case-for-continuous-red-teaming/)
- **CVE-2026-33252 (Go MCP SDK)** — Streamable HTTP transport accepted browser-generated cross-site POSTs without `Origin` validation, enabling drive-by tool execution (penligent.ai/hackinglabs/anthropic-mcp-vulnerability-7000-servers-and-the-case-for-continuous-red-teaming/). [Penligent](https://www.penligent.ai/hackinglabs/anthropic-mcp-vulnerability-7000-servers-and-the-case-for-continuous-red-teaming/)
- **CVE-2026-35568 (Java MCP SDK)** — DNS rebinding against locally-bound MCP servers (penligent.ai/hackinglabs/...).
- **CVE-2025-68143 (`mcp-server-git`)** — unrestricted `git_init` could create repositories at arbitrary filesystem locations (penligent.ai/hackinglabs/...). [Penligent](https://www.penligent.ai/hackinglabs/anthropic-mcp-vulnerability-7000-servers-and-the-case-for-continuous-red-teaming/)
- **OX Security's "by design" RCE family (April 2026).** Researchers at OX argued that Anthropic's MCP STDIO configuration semantics give a direct configuration-to-command-execution path across every official SDK language; affects 7,000+ publicly accessible servers and 150M+ downloads (thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html). [The Hacker News](https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html)[The Hacker News](https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html)
- **Asana "Confused Deputy" (2025)** — caching MCP responses without re-verifying tenant context allowed cross-tenant disclosure (stackone.com/blog/mcp-where-its-been-where-its-going/). [StackOne](https://www.stackone.com/blog/mcp-where-its-been-where-its-going/)
- **Postmark MCP server (2025)** — first observed in-the-wild malicious MCP server, exfiltrating data to attacker Slack workspace via a hardcoded bot token (praetorian.com/blog/mcp-server-security-the-hidden-ai-attack-surface/). [Praetorian](https://www.praetorian.com/blog/mcp-server-security-the-hidden-ai-attack-surface/)
- **WordPress AI Engine plugin (June 2025)** — over 100,000 sites exposed to privilege escalation via an MCP vulnerability (pub.towardsai.net/mcp-is-dead-ece45c1f80bb). [Towards AI](https://pub.towardsai.net/mcp-is-dead-ece45c1f80bb?gi=9268354a1c51)
- **Supabase + Cursor (mid-2025)** — prompt-injection via support-ticket content caused an agent with service-role database access to leak integration tokens to a public thread (pub.towardsai.net/mcp-is-dead-ece45c1f80bb). [Towards AI](https://pub.towardsai.net/mcp-is-dead-ece45c1f80bb?gi=9268354a1c51)
- **MCP TypeScript SDK cross-client data leak** — a single transport instance reused across clients caused JSON-RPC message-id collisions and response routing errors between clients (penligent.ai/...). This is a *classic* JSON-RPC pitfall: id collision when sessions are multiplexed. [Penligent](https://www.penligent.ai/hackinglabs/anthropic-mcp-vulnerability-7000-servers-and-the-case-for-continuous-red-teaming/)
- **Trend Micro scanning (2025)** — found 1,467 exposed MCP servers, of which 1,227 still ran the deprecated SSE transport, and 70 hosts exposed an `execute_sql` tool to the public internet (trendmicro.com/vinfo/us/security/news/vulnerabilities-and-exploits/update-on-exposed-mcp-servers-the-threat-widens-to-the-cloud). [Trend Micro + 2](https://www.trendmicro.com/vinfo/us/security/news/vulnerabilities-and-exploits/update-on-exposed-mcp-servers-the-threat-widens-to-the-cloud)

The pattern across these incidents is striking: implementers treat "local stdio" as if it were inherently safe, and "the LLM is the user" as if LLM-controlled inputs were trusted. Both assumptions break.

### 6.6 Batch-amplification attacks (general)

JSON-RPC batches are a generic amplification vector: a client can submit one TCP-level message containing thousands of expensive queries. Default batch-size limits in jayson and similar libraries default to 1 MB body, which can already encode tens of thousands of requests. Many production deployments have learned this the hard way and now cap batch size in middleware. [GitHub](https://github.com/mhingston/jayson)

---

## 7. Fun Facts and Anecdotes

- **Why error code −32700 specifically?** It's an XML-RPC heritage error code. The XML-RPC "Fault Code Interoperability" community spec from the late 1990s assigned −32700 to "Parse error: not well formed." JSON-RPC 2.0 deliberately mirrored those codes to ease porting (en.wikipedia.org/wiki/JSON-RPC).
- **The 1.1 spec that never finalized.** Atif Aziz et al. drafted JSON-RPC 1.1 with `system.describe`, named parameters, and a service-description model; it was published as a Working Draft on json-rpc.org but the community preferred Matt Morley's smaller 2.0, and 1.1 was abandoned. Service description eventually returned, in spirit, as **OpenRPC** in 2018 (jsonrpc.org/historical/json-rpc-1-1-wd.html). [Simple-is-better](https://www.simple-is-better.org/rpc/)
- **Dave Winer's defection.** Don Box, in "A Brief History of SOAP," writes that Winer "went out on his own and shipped the XML-RPC specification based on subsetting the original SOAP type system" because Microsoft politics had shelved SOAP. Without that defection, JSON-RPC's whole ancestry doesn't exist.
- **MCP was prototyped over a Thanksgiving 2024 weekend.** In Latent Space's "One Year of MCP" episode, David Soria Parra describes the protocol as starting from "Thanksgiving hacking sessions" inside Anthropic, motivated by "how do I scale dev tooling faster than the company grows" (latent.space/p/one-year-of-mcp-with-david-soria). [Substack](https://www.latent.space/p/one-year-of-mcp-with-david-soria)[Apple Podcasts](https://podcasts.apple.com/ke/podcast/one-year-of-mcp-with-david-soria-parra-and-aaif/id1674008350?i=1000742901858)
- **MCP explicitly modeled on LSP.** The MCP specification opens by saying "MCP takes some inspiration from the Language Server Protocol, which standardizes how to add support for programming languages across a whole ecosystem of development tools" (modelcontextprotocol.io/specification/2025-11-25). That is, the AI-agent internet is a 2024 reskinning of a 2016 IDE plumbing protocol. [Model Context Protocol](https://modelcontextprotocol.io/specification/2025-11-25)
- **JSON-RPC 2.0 is one HTML page.** The whole spec at jsonrpc.org/specification fits on a single web page. By contrast, the SOAP 1.2 part 1 specification runs to over 100 pages.
- **`rpc.discover`.** OpenRPC's discovery method is named `rpc.discover` precisely because JSON-RPC 2.0 reserves the `rpc.` prefix for protocol extensions — "the rpc. prefix is a reserved method prefix for JSON-RPC 2.0 Specification system extensions" (eips.ethereum.org/EIPS/eip-1901). [GitHub](https://github.com/ethereum/EIPs/issues/1902)
- **Tim Bray, the same Tim Bray who edited XML, edited the final JSON RFC.** In his blog post announcing RFC 8259 (STD 90), Bray writes "I think this is the last specification of JSON that anyone will ever publish" (tbray.org/ongoing/When/201x/2017/12/14/RFC-8259-STD-90). [ongoing by Tim Bray](https://www.tbray.org/ongoing/When/201x/2017/12/14/RFC-8259-STD-90)
- **The "USB-C of AI" line.** Anthropic and many MCP advocates use this metaphor; it survived even into Google Cloud and OpenAI marketing (cloud.google.com/discover/what-is-model-context-protocol). [Bitsight](https://www.bitsight.com/blog/exposed-mcp-servers-reveal-new-ai-vulnerabilities)[Anthropic](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)
- **MCP's name was chosen partly because it overloads "MCP" — Master Control Program from Tron.** Less officially attested but widely repeated in the community.
- **VS Code's debug protocol (DAP) deliberately *did not* use JSON-RPC.** The Microsoft team wrote in a 2016 GitHub thread that they considered JSON-RPC for DAP "v2.0" but marked it `wont-fix`, citing original-design constraints (github.com/microsoft/debug-adapter-protocol/issues/226). DAP and LSP, both Microsoft, ended up *almost* but not *quite* the same wire protocol. [GitHub](https://github.com/microsoft/debug-adapter-protocol/issues/226)

---

## 8. Practical Wisdom

### 8.1 Tuning parameters and defaults to be skeptical of

- **Body-size limits.** Defaults around 1 MB are common (jayson default, Express body-parser default). At 50 bytes per request, that's 20,000 calls in a single batch. Cap explicitly.
- **Numeric ids.** Many libraries default to monotonically-increasing integers per process. On long-lived WebSocket connections that span process restarts, this causes id collisions. Switch to UUIDs (jayson supports an `idGenerator` hook). [GitHub](https://github.com/iammapping/jayson)
- **Default timeout.** jayson's WebSocket transport defaults to 60 s timeout; for blockchain RPCs, this is far too long for `getBalance` and far too short for `eth_call` simulating a complex trace. Configure per-method. [GitHub](https://github.com/mhingston/jayson)
- **HTTP keepalive.** Without it, every RPC opens a new TCP+TLS connection. Ethereum providers explicitly recommend reusing the same provider object — note that `JsonRpcProvider` sends an extra `eth_chainId` per call, while `StaticJsonRpcProvider` does not (quicknode.com/guides/quicknode-products/apis/guide-to-efficient-rpc-requests). [QuickNode](https://www.quicknode.com/guides/quicknode-products/apis/guide-to-efficient-rpc-requests)
- **MCP stdio: never `console.log` from an MCP server.** stdout *is* the JSON-RPC stream. Use stderr for logs, or write to a file (snyk.io/articles/how-to-debug-mcp-server-with-anthropic-inspector/; apigene.ai/blog/how-to-test-mcp-server). [Apigene](https://apigene.ai/blog/how-to-test-mcp-server)[Snyk](https://snyk.io/articles/how-to-debug-mcp-server-with-anthropic-inspector/)
- **Bind address.** Bitcoin and Geth default to localhost-only — keep it that way. `--rpcaddr 0.0.0.0` is the canonical foot-gun (zeeve.io/blog/how-to-secure-ethereum-json-rpc-from-vulnerabilities/; geth.ethereum.org/docs/interacting-with-geth/rpc).

### 8.2 What to monitor

- **Per-method latency, not aggregate.** A `getBlock` and a `getLogs` have wildly different cost; mixing them hides outliers.
- **Error-code distribution.** Spike in −32601 (method not found) often means a client/server version skew. Spike in −32602 (invalid params) means schema drift.
- **Batch sizes.** Outliers correlate with abuse and/or accidental N+1 queries.
- **id collisions and orphan responses.** Log unmatched responses; they indicate either bugs or attacks.
- **For MCP/A2A:** monitor tool-invocation rate per (host, server, tool). The current consensus security pattern is to treat tool descriptions as untrusted and tool inputs as adversarial (owasp.org cheat sheet via webfuse.com/mcp-cheat-sheet). [Model Context Protocol](https://modelcontextprotocol.io/specification/2025-11-25)

### 8.3 Debugging moves

- `curl` with `-d` and JSON. Every JSON-RPC server is one curl away.
- For MCP: `npx @modelcontextprotocol/inspector <command>` (≥ v0.14.1 for security) to manually invoke tools and inspect schemas (github.com/modelcontextprotocol/inspector). [GitHub](https://github.com/W3EvolutionsLLC/anthropic-mcp-inspector)
- For LSP: VS Code's "Output" panel set to LSP trace = "verbose" prints the raw JSON-RPC.
- For Ethereum: enable `debug` namespace and use `debug_traceCall` for opaque reverts.
- For batch debugging: send batch of one, then two, then real size — bracket where things break.

### 8.4 Common misconfigurations

- Returning HTTP 4xx/5xx for application errors (breaks library expectations — JSON-RPC says return 200 with an error object).
- Sending `error` and `result` both. Spec forbids it.
- Replying to notifications. Spec forbids it.
- Treating array-shaped `params` and object-shaped `params` as interchangeable. Servers are required to honor `params: {}` (named) only if the library supports it.
- Reusing one MCP transport across clients (the TypeScript SDK CVE).
- Running MCP Inspector with `DANGEROUSLY_OMIT_AUTH=true` (oligo.security). [GitHub](https://github.com/modelcontextprotocol/inspector)
- For Ethereum: leaving `personal_*` namespace enabled with unlocked accounts (the 2018 ETH-theft pattern).

### 8.5 Transport choices, decision rule

- **Local dev tool / single-machine plugin**: stdio.
- **Browser app / mobile / no subprocess**: HTTP (JSON-RPC over POST) or, if you need server-push, Streamable HTTP.
- **Many small bidirectional events (chat, logs, mining)**: WebSocket or Streamable HTTP.
- **High-throughput server-to-server with strict typing**: gRPC, not JSON-RPC.
- **Discoverable, schema-validated public API**: JSON-RPC + OpenRPC.

---

## 9. Learning Resources (current as of May 2026)

### 9.1 Authoritative specifications

- **JSON-RPC 2.0 Specification** — jsonrpc.org/specification (Matt Morley, finalized 2010, unchanged; the canonical document). *Intro.*
- **JSON-RPC 1.0 Specification (2005)** — jsonrpc.org/specification_v1. *Historical / intro.*
- **JSON-RPC 1.1 Working Draft (Aziz et al., never finalized)** — jsonrpc.org/historical/json-rpc-1-1-wd.html. *Historical.*
- **RFC 8259** — *The JavaScript Object Notation (JSON) Data Interchange Format*, T. Bray Ed., December 2017, DOI 10.17487/RFC8259, datatracker.ietf.org/doc/html/rfc8259. Internet Standard 90. *Intermediate.* [IETF](https://datatracker.ietf.org/doc/rfc8259/bibtex/)[Wikipedia](https://en.wikipedia.org/wiki/JSON)
- **RFC 7159** — Same title, March 2014, T. Bray Ed., obsoleted by 8259 but still cited by older specs (rfc-editor.org/info/rfc7159). *Historical.*
- **OpenRPC Specification** — spec.open-rpc.org. Based on JSON Schema Draft 07. *Intermediate.* [spec](https://spec.open-rpc.org/)
- **MCP Specification 2025-11-25 (latest)** — modelcontextprotocol.io/specification/2025-11-25. *Intermediate to advanced.* 2025 release.
- **MCP Specification 2025-03-26** — modelcontextprotocol.io/specification/2025-03-26 (introduces Streamable HTTP). *Intermediate.*
- **A2A Protocol Specification** — a2a-protocol.org/latest/specification/. *Intermediate.* Updated 2026.
- **EIP-1474 — Ethereum Remote Procedure Call Specification** — eips.ethereum.org/EIPS/eip-1474. *Advanced.*
- **EIP-1571 — EthereumStratum/2.0.0** — eips.ethereum.org/EIPS/eip-1571. *Advanced.*
- **EIP-1901 — Add OpenRPC Service Discovery to JSON-RPC Services** — eips.ethereum.org/EIPS/eip-1901. *Intermediate.*
- **LSP Specification 3.17** — microsoft.github.io/language-server-protocol. *Intermediate.* (Latest spec version.)
- **DAP Specification 1.71** — microsoft.github.io/debug-adapter-protocol/specification.html. *Intermediate.*
- **Ethereum Execution APIs (OpenRPC document)** — ethereum.github.io/execution-apis. *Advanced.*
- **Solana RPC reference** — solana.com/docs/rpc. *Intermediate.* Updated 2026.
- **WAMP v2 spec** — wamp-proto.org. *Advanced.*
- **draft-yang-json-rpc-02 (IETF)** — datatracker.ietf.org/doc/html/draft-yang-json-rpc-02. YANG modeling for JSON-RPC; never reached RFC. *Advanced / niche.*

### 9.2 Engineering blog posts (2024–2026 currency where possible)

- Cloudflare — "Build and deploy Remote Model Context Protocol (MCP) servers to Cloudflare," March 25, 2025 (blog.cloudflare.com/remote-model-context-protocol-servers-mcp/). *Intermediate.* [Cloudflare](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/)
- Cloudflare — "Scaling MCP adoption: Our reference architecture for simpler, safer and cheaper enterprise deployments of MCP," 2025 (blog.cloudflare.com/enterprise-mcp/). *Advanced.*
- Auth0 — "Why MCP's Move Away from Server Sent Events Simplifies Security," 2025 (auth0.com/blog/mcp-streamable-http/). *Intermediate.*
- Anthropic — "Donating the Model Context Protocol and establishing the Agentic AI Foundation," December 9, 2025 (anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation). *Intro.*
- MCP Maintainers — "One Year of MCP: November 2025 Spec Release," Nov 25, 2025 (blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/). *Intermediate.*
- Microsoft VS Code — "A Common Protocol for Languages," June 27, 2016 (code.visualstudio.com/blogs/2016/06/27/common-language-protocol). *Intro.* Historical but foundational.
- Microsoft VS Code — "New home for the Debug Adapter Protocol," August 2018 (code.visualstudio.com/blogs/2018/08/07/debug-adapter-protocol-website). *Intro.*
- iosiro — "Geth Out-of-Order EIP Application Denial-of-Service," 2024 (iosiro.com/blog/geth-out-of-order-eip-application-denial-of-service). *Advanced.*
- Oligo Security — "Critical RCE Vulnerability in Anthropic MCP Inspector," 2025 (oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596). *Advanced.*
- Trend Micro — "Update on Exposed MCP Servers," 2025 (trendmicro.com/vinfo/us/security/news/vulnerabilities-and-exploits/update-on-exposed-mcp-servers-the-threat-widens-to-the-cloud). *Intermediate.*
- StackOne — "MCP: What's Working, What's Broken, and What Comes Next," 2025–2026 (stackone.com/blog/mcp-where-its-been-where-its-going/). *Intermediate.*
- The New Stack — "Why the Model Context Protocol Won," 2025 (thenewstack.io/why-the-model-context-protocol-won/). *Intro.*
- Don Box — "A Brief History of SOAP," April 2001 (xml.com/pub/a/ws/2001/04/04/soap.html). *Intro / historical.*
- Geth docs — "JSON-RPC Server" (geth.ethereum.org/docs/interacting-with-geth/rpc). *Intermediate.*
- Bitcoin Core — "JSON-RPC interface" (github.com/bitcoin/bitcoin/blob/master/doc/JSON-RPC-interface.md). *Intermediate.*
- Tim Bray — "The Last JSON Spec" (tbray.org/ongoing/When/201x/2017/12/14/RFC-8259-STD-90). *Intro / historical.*
- Praetorian — "MCP Server Security: The Hidden AI Attack Surface," 2025 (praetorian.com/blog/mcp-server-security-the-hidden-ai-attack-surface/). *Advanced.*

### 9.3 Academic / research

- Recabarren & Carbunar, "Hardening Stratum, the Bitcoin Pool Mining Protocol," arXiv 1703.06545 (arxiv.org/pdf/1703.06545). *Advanced.*
- "Improving Google A2A Protocol: Protecting Sensitive Data and Mitigating Unintended Harms in Multi-Agent Systems," arXiv 2505.12490 (arxiv.org/pdf/2505.12490), May 2025. *Advanced.*
- "Understanding Ethereum Mempool Security under Asymmetric DoS by Symbolized Stateful Fuzzing" (mpfuzz / DETER successors), arXiv 2312.02642 (arxiv.org/html/2312.02642v3). *Advanced.*
- "Attack and Defence of Ethereum Remote APIs," researchgate.net/publication/330351717. *Intermediate.*

### 9.4 Podcasts and conference talks

- **Latent Space — "The Creators of Model Context Protocol"** — David Soria Parra and Justin Spahr-Summers, March 4, 2025 (latent.space, podcast on Apple/Spotify). *Intro / origin story.*
- **Latent Space — "One Year of MCP"** — December 27, 2025, with Soria Parra, Nick Cooper (OpenAI), Brad Howes (Block/Goose), Jim Zemlin (Linux Foundation) (latent.space/p/one-year-of-mcp-with-david-soria). *Intermediate.*
- **a16z AI + a16z — "MCP Co-Creator on the Next Wave of LLM Innovation"** with Yoko Li and David Soria Parra (a16z.com/podcast/mcp-co-creator-on-the-next-wave-of-llm-innovation/). *Intro.*
- **YouTube — "The Future of MCP," David Soria Parra, Anthropic** (youtube.com/watch?v=v3Fr2JR47KA). *Intermediate.*
- Microsoft DevNation 2016 keynote announcing LSP (referenced in the VS Code blog above). *Intro.*
- MCP Dev Summit talks (2025–2026) hosted by Obot.ai, donated to AAIF — series ongoing (linuxfoundation.org press release).

### 9.5 Hands-on tools

- **OpenRPC Playground** — playground.open-rpc.org. *Intermediate.* In-browser editor + live JSON-RPC inspector.
- **OpenRPC Inspector** — github.com/open-rpc/inspector. *Intermediate.*
- **MCP Inspector** — github.com/modelcontextprotocol/inspector (run via `npx @modelcontextprotocol/inspector`; ensure ≥ 0.14.1). *Intro.*
- **jayson** — github.com/tedeh/jayson. *Intro.*
- **`web3.js` / `ethers.js` / `viem`** — Ethereum JSON-RPC wrappers. *Intermediate.*
- **`@solana/web3.js` and `@solana/kit`** — Solana JSON-RPC wrappers. *Intermediate.*
- **Postman** — supports JSON-RPC as a request type since 2023 (free, GUI). *Intro.*
- **`curl`** — the universal JSON-RPC client. Always available. *Intro.*
- **MCP Bundles (`.mcpb`)** — November 2025 standard for distributing local MCP servers as a ZIP + `manifest.json` (workos.com/blog/mcp-2025-11-25-spec-update). *Intermediate.*
- **Cloudflare's `mcp-remote`, `McpAgent`, `workers-oauth-provider`** — for hosting remote MCP (developers.cloudflare.com/agents/guides/remote-mcp-server/). *Intermediate.*

### 9.6 University courses

There is no flagship course dedicated to JSON-RPC, but RPC concepts are covered in:

- **MIT 6.5840 / 6.824 Distributed Systems** — labs use Go's `net/rpc`. ocw.mit.edu and pdos.csail.mit.edu/6.824. *Advanced.*
- **Stanford CS244B Distributed Systems** — touches RPC frameworks. *Advanced.*
- **Princeton COS 418** — Distributed Systems, RPC lectures.
- For LSP/IDE plumbing specifically, the Toptal "Language Server Protocol Tutorial: From VSCode to Vim" is a solid practical primer (toptal.com/developers/javascript/language-server-protocol-tutorial). *Intermediate.*

---

## 10. Where Things Are Heading (2025–2026 Frontier)

### 10.1 Active deprecations

- **MCP HTTP+SSE transport** is on a strict death march. Spec 2025-03-26 deprecated it; major hosts are setting hard cutoff dates: Atlassian Rovo June 30, 2026; Keboola April 1, 2026 (community.atlassian.com/forums/Atlassian-Remote-MCP-Server/HTTP-SSE-Deprecation-Notice/ba-p/3205484; toolradar.com/blog/streamable-http-vs-sse). ChatGPT already only accepts Streamable HTTP servers.
- **JSON-RPC 1.0** — effectively gone; some old Bitcoin clients still default to it (jayson defaults to 2.0).
- **Stratum V1** is being displaced by V2 in mining.

### 10.2 Replacements on the rise

- **Streamable HTTP** as the only MCP remote transport going forward.
- **OAuth 2.1 + Protected Resource Metadata + OpenID Connect** as the MCP and A2A authn/authz default; the June 2025 MCP spec made this enterprise-grade and the November 2025 spec layered on M2M client-credentials and URL-mode elicitation (modelcontextprotocol.info/blog/mcp-next-version-update/; workos.com/blog/mcp-2025-11-25-spec-update).
- **MCP Tasks (async)** — the November 2025 release introduced `taskId`-based call-now-fetch-later semantics, finally giving MCP a clean async story for long-running tool calls (blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/; subramanya.ai/2025/12/01/mcp-enterprise-readiness-how-the-2025-11-25-spec-closes-the-production-gap/).
- **MCP Apps / SEP-1865 (early 2026)** — interactive UI surfaces (React dashboards, forms, visualizations) delivered through MCP, layered above JSON-RPC (en.wikipedia.org/wiki/Model_Context_Protocol).
- **MCP Bundles (`.mcpb`)** as the npm-equivalent distribution format for local MCP servers.

### 10.3 Hot research / standards work

- **MCP Registry** — a community-driven catalog launched September 2025; agents can browse-before-connect via `/.well-known/mcp` discovery (modelcontextprotocol.info/blog/mcp-next-version-update/).
- **A2A ↔ MCP interop** — the AAIF and MCP/A2A working groups are converging on shared identity and discovery (tedt.org/MCPs-2026-Roadmap/).
- **OpenRPC** continues to grow as the schema layer; Ethereum, MetaMask, Bitcoin Core, and many EVM L2s now ship OpenRPC documents.
- **IETF activity** — there is no active IETF working group on JSON-RPC itself; the YANG-RPC draft (`draft-yang-json-rpc-02`) lapsed in 2018. Any standardization energy now flows through Linux Foundation's AAIF.
- **Security research** — MCPTox-style benchmarks, prompt-injection-resistant tool descriptions, "Code Mode" agents that *generate code* calling MCP tools (claimed 98.7% token reduction by Anthropic per stackone.com/blog/mcp-where-its-been-where-its-going/; vendor figure, treat with caution).

### 10.4 The big picture

JSON-RPC the spec hasn't changed in 16 years. What changed is that an entire generation of new infrastructure — AI agents, blockchains, modern IDEs — sits on top of it. The most likely next milestone isn't a JSON-RPC 3.0; it's MCP becoming the standard service interface across enterprise software, with A2A as its peer for agent-to-agent traffic and JSON-RPC 2.0 as the unchanged plumbing under both.

---

## 11. Hooks for the Article, Infographic, and Podcast

### 11.1 60-second narrated hook (for the ear)

> "In 1998, Dave Winer, fed up with Microsoft politics, shipped a tiny RPC protocol called XML-RPC. Twenty-six years later, in November 2024, two engineers at Anthropic — David Soria Parra and Justin Spahr-Summers — picked up its great-grandchild, a forgotten 2010 spec called JSON-RPC 2.0, and made it the wire format for connecting AI agents to every tool and database on the internet. They called it the Model Context Protocol. By the end of 2025, OpenAI had adopted it. Google had built A2A on the same foundation. Microsoft had been quietly using JSON-RPC for nine years to power VS Code's language servers — billions of editor sessions worth of traffic. In December 2025, Anthropic, OpenAI, and Block donated their protocols to the Linux Foundation. In the year MCP shipped, JSON-RPC went from invisible plumbing to the most important protocol you've never read. And the spec is still one HTML page long."

### 11.2 A striking statistic with source

> "By March 2026, MCP — running JSON-RPC 2.0 over stdio and Streamable HTTP — was clocking 97 million monthly SDK downloads, with over 10,000 active servers in production, just 16 months after its November 2024 launch. The previous record for that kind of adoption velocity belonged to no one." (Source: Anthropic AAIF announcement, December 9, 2025, anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation. Note: vendor figure.) [Modelcontextprotocol](https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/)

### 11.3 Pause-and-think moment with source

> "Anthropic's Filesystem MCP Server — the official one, written by Anthropic, recommended in Anthropic's own quickstart guide — shipped two CVEs in mid-2025 (CVE-2025-53109, CVSS 8.4; CVE-2025-53110, CVSS 7.3) that allowed any malicious tool descriptor to escape its sandbox via symlinks and execute arbitrary code on a developer's machine. The protocol was fine. The implementation was not. Pause: when you give an LLM the right to call tools on your filesystem, who is the user — you, or the tool descriptor written by someone else?" (Source: Cymulate, cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/.)

### 11.4 A failure-story arc

- **Setup.** February 14, 2024. Ethereum has a half-trillion-dollar economy on it. The Geth client runs the majority of Ethereum mainnet validators. Independent researcher Jason Matthyser is poking at `eth_call`'s `block override` parameter — a feature that lets you simulate transactions against a hypothetical state.
- **Mistake.** Geth, when it processes a `block override` that activates EIP-2929 while disabling EIP-150, takes a code path the maintainers didn't expect. Worse, this can be triggered through `eth_call` — a *read-only* JSON-RPC method that nobody charges gas for and most providers expose to the public internet.
- **Consequence.** Matthyser's payload, perhaps 100 bytes of JSON, crashes a Geth node. At zero cost. Repeated. iosiro escalates through SEAL 911 because the Ethereum Foundation initially says it's out of bug-bounty scope. Shodan lists 550+ exposed mainnet Geth nodes; every major RPC provider — Infura, Alchemy, QuickNode, Ankr, Flashbots — is vulnerable. A single laptop could deny service to most of Ethereum's user base for an unbounded period. The only safe filter would be to "block `eth_call` entirely, which would have been highly impractical."
- **Resolution.** Coordinated disclosure. Geth v1.13.12 (Edolus) ships a fix. Providers patch. The bug was not in JSON-RPC. The bug was that an application built atop JSON-RPC trusted that read-only methods are read-only — a habit JSON-RPC's "any method can do anything" semantics quietly invites. (Source: iosiro.com/blog/geth-out-of-order-eip-application-denial-of-service.)

---

## Caveats

- **Vendor figures, treat appropriately.** The "97 million monthly SDK downloads" and "10,000+ active servers" numbers come from Anthropic and partners. There is no independent audit. They are also growth-stage numbers — interpret as direction, not quantity.
- **MCP is moving fast.** Any specific client/server name in this report could be stale within a release cycle; the SurePrompts guide explicitly calls this out (sureprompts.com/blog/model-context-protocol-mcp-complete-guide-2026). The protocol is the durable bet.
- **Some 2026-dated CVEs (e.g., CVE-2026-30615, CVE-2026-33252, CVE-2026-35568) are reported by individual security firms (OX Security, Penligent) and may not yet be in NVD with full assigned details at the time of writing.** They are reported here as currently disclosed by those firms; verify against NVD before incident response.
- **A2A maturity.** Galileo notes "A2A protocol remains in early adoption phase with limited production deployment evidence" (galileo.ai/blog/google-agent2agent-a2a-protocol-guide). Most announced partner integrations have not been verified in production.
- **JSON-RPC 1.1 history is murky.** Multiple drafts existed (Working Draft, ALT, 1.2 proposal); the historical pages on jsonrpc.org are inconsistent. Where dates are imprecise above, that imprecision is in the sources.
- **Bitcoin Core's first JSON-RPC release date.** Widely attested as Satoshi-era but a precise commit date is not consistently sourced; the protocol was present in early v0.x releases.
- **Mermaid diagram** is illustrative; an actual MCP `tools/call` may also include progress notifications, sampling round-trips, and elicitation events depending on the server.
- **Performance numbers**: gRPC vs JSON benchmarks are vendor blog numbers and depend heavily on payload shape and HTTP version; the qualitative claim (gRPC is faster, JSON-RPC more readable) is robust, the specific multipliers are not.
- **DAP not being JSON-RPC** is a recurring confusion in secondary sources. Microsoft's own documentation says DAP is "similar to but not compatible with the JSON-RPC used in the LSP" — DAP uses a `seq`/`type`-based envelope, not the `jsonrpc`/`id` envelope. Several blog posts get this wrong; the report follows Microsoft's own statement.
- **"JSON-RPC 3.0" does not exist.** Periodically rumored; as of May 2026, the spec at jsonrpc.org/specification has not been revised since 2010.