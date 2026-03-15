## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, tailwindcss, playwright, sveltekit-adapter, mcp

---

## Dev Navigation Helper (`window.__dev`)

In dev mode (`npm run dev`), a `window.__dev` object is exposed for agent and testing use. It lets you navigate to any protocol, switch tabs, step through simulations, and scroll — all via `preview_eval`.

**Available methods:**

| Method | Description |
|---|---|
| `__dev.go(id, view?)` | Navigate to a protocol/category by ID. `view` is `'learn'` (default) or `'simulate'`. |
| `__dev.step(n?)` | Click Step Forward `n` times (default 1). |
| `__dev.play()` | Click the Play button to start the simulation. |
| `__dev.scrollTo(text)` | Scroll to a heading containing `text` (e.g., `'Encapsulation'`). |
| `__dev.ls()` | List all node IDs and types. |
| `__dev.appState` | Direct access to the AppState instance. |
| `__dev.nodes` | Array of all GraphNode objects. |

**Typical agent workflow for verifying a simulation:**

```js
// 1. Wait for page load, then navigate
new Promise(r => setTimeout(r, 2000)).then(() => {
  window.__dev.go('tls', 'simulate');   // open TLS in simulate tab
});

// 2. Step through and inspect
window.__dev.step(3);                   // advance 3 steps

// 3. Scroll to see encapsulation cards
window.__dev.scrollTo('Encapsulation');

// 4. Or just play the whole simulation
window.__dev.play();
```

**Important:** Always wait ~2s after page reload for the app to mount before using `__dev`. The helper is only available in dev mode — it's tree-shaken out of production builds.

**Protocol IDs with simulations:** `tcp`, `dns`, `http1`, `udp`, `tls`, `http2`, `http3`, `websockets`, `grpc`, `ssh`, `rest`, `webrtc`, `json-rpc`, `mcp`, `a2a`

**All protocol IDs:** `tcp`, `udp`, `quic`, `sctp`, `mptcp`, `http1`, `http2`, `http3`, `websockets`, `grpc`, `graphql`, `sse`, `rest`, `json-rpc`, `mcp`, `a2a`, `mqtt`, `amqp`, `coap`, `stomp`, `xmpp`, `kafka`, `webrtc`, `rtp`, `sip`, `hls`, `rtmp`, `sdp`, `dash`, `tls`, `ssh`, `dns`, `dhcp`, `ntp`, `smtp`, `ftp`

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
