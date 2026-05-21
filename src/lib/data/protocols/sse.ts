import type { Protocol } from '../types';

export const sse: Protocol = {
	id: 'sse',
	name: 'Server-Sent Events',
	abbreviation: 'SSE',
	categoryId: 'web-api',
	port: 443,
	year: 2006,
	rfc: 'WHATWG Living Standard',
	oneLiner: 'One-way real-time streaming from server to browser over plain {{http-method|HTTP}}.',
	overview: `[[sse|Server-Sent Events]] ([[sse|SSE]]) provide a simple, standardized way for servers to push updates to web clients over a single [[http1|HTTP]] connection. Unlike [[websockets|WebSockets]], [[sse|SSE]] is unidirectional — the server sends events, and the client listens. This simplicity is its strength.

[[sse|SSE]] uses plain [[http1|HTTP]], which means it works through {{proxy|proxies}}, {{load-balancing|load balancers}}, and {{firewall|firewalls}} without any special configuration. The browser's {{eventsource|EventSource API}} automatically handles reconnection, event IDs for resuming after disconnects, and {{content-negotiation|content type negotiation}}.

Each event is a text block with optional fields: event type, data {{payload|payload}}, {{id-identifier|ID}}, and retry interval. The format is deliberately simple — just {{utf8|UTF-8}} text with newline separators. This makes [[sse|SSE]] ideal for live feeds, notifications, and {{stream|streaming}} {{ai|AI}} responses where the server needs to push data but doesn't need to receive a stream back.`,
	howItWorks: [
		{
			title: 'HTTP connection',
			description:
				'Client opens a standard {{http-method|HTTP}} request with Accept: text/event-stream. The server responds with {{content-type|Content-Type}}: text/event-stream and keeps the connection open.'
		},
		{
			title: 'Event stream',
			description:
				'Server sends events as text blocks separated by blank lines. Each event has optional fields: "event:" (type), "data:" ({{payload|payload}}), "id:" (last event {{id-identifier|ID}}), and "retry:" (reconnection interval in ms).'
		},
		{
			title: 'Auto-reconnection',
			description:
				'If the connection drops, the browser automatically reconnects and sends the last event {{id-identifier|ID}} in a {{last-event-id|Last-Event-ID}} header, allowing the server to resume from where it left off.'
		},
		{
			title: 'Client processing',
			description:
				'The {{eventsource|EventSource API}} fires message events (or named events) that JavaScript handlers process. No polling, no complexity — just native browser event handling.'
		}
	],
	useCases: [
		'Live notification feeds and activity streams',
		'Real-time dashboards and monitoring displays',
		'Streaming AI/LLM responses token-by-token',
		'Stock tickers and sports score updates',
		'Server-side progress updates for long-running tasks'
	],
	codeExample: {
		language: 'python',
		code: `# Server — Flask SSE endpoint
from flask import Flask, Response
import time, json

app = Flask(__name__)

@app.route('/api/notifications')
def stream():
    def generate():
        while True:
            data = json.dumps({"time": time.time()})
            yield f"event: update\\ndata: {data}\\n\\n"
            time.sleep(1)
    return Response(generate(),
                    mimetype='text/event-stream')`,
		caption:
			'The {{eventsource|EventSource API}} handles connection management, reconnection, and event parsing automatically.',
		alternatives: [
			{
				language: 'javascript',
				code: `// Browser — listen for server-sent events
const source = new EventSource('/api/notifications');

source.onmessage = (event) => {
  console.log('New message:', event.data);
};

source.addEventListener('update', (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
});

source.onerror = () => {
  console.log('Connection lost, auto-reconnecting...');
};`
			},
			{
				language: 'cli',
				code: `# Stream SSE events with curl
curl -N -H "Accept: text/event-stream" \\
  https://example.com/api/notifications

# With reconnection (Last-Event-ID header)
curl -N \\
  -H "Accept: text/event-stream" \\
  -H "Last-Event-ID: 42" \\
  https://example.com/api/notifications

# Watch raw SSE event stream
curl -sN https://example.com/api/notifications \\
  | while read line; do echo "$line"; done`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Connection',
						code: `GET /events HTTP/1.1\nHost: api.example.com\nAccept: text/event-stream\nCache-Control: no-cache\nConnection: keep-alive\n\nHTTP/1.1 200 OK\nContent-Type: text/event-stream\nCache-Control: no-cache\nConnection: keep-alive`
					},
					{
						title: 'Event Stream',
						code: `: heartbeat\n\nevent: user.login\nid: evt-001\ndata: {"user": "Alice", "time": "14:32:01"}\n\nevent: message\nid: evt-002\ndata: {"from": "Alice", "text": "Hello!"}\ndata: {"continued": true}\n\n: 30s keepalive\nretry: 5000\n\nevent: user.logout\nid: evt-003\ndata: {"user": "Alice", "time": "14:45:12"}`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Sub-second (persistent connection)',
		throughput: 'Lightweight text streaming',
		overhead: 'Minimal — plain HTTP, no upgrade'
	},
	connections: ['a2a', 'http1', 'http2', 'mcp', 'websockets', 'graphql', 'rest'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Server-sent_events',
		official: 'https://html.spec.whatwg.org/multipage/server-sent-events.html'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg/500px-Ian_Hickson_at_CSS_Working_Group_Meeting_Day_Three.jpeg',
		alt: 'Ian Hickson at a CSS Working Group meeting, the author of the Server-Sent Events specification',
		caption:
			'[[pioneer:ian-hickson|Ian Hickson]] at a {{w3c|W3C}} Working Group meeting. As editor of the HTML5 specification, Hickson authored the [[sse|Server-Sent Events]] spec — giving browsers a native, lightweight way to receive real-time server pushes over plain {{http-method|HTTP}}.',
		credit: 'Photo: Molly Holzschlag / CC BY-SA 2.0, via Wikimedia Commons'
	}
};
