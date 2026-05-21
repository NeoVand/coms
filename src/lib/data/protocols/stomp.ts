import type { Protocol } from '../types';

export const stomp: Protocol = {
	id: 'stomp',
	name: 'Simple Text Orientated Messaging Protocol',
	abbreviation: 'STOMP',
	categoryId: 'async-iot',
	port: 61613,
	year: 2003,
	rfc: undefined,
	oneLiner: 'A dead-simple text protocol for message brokers — the {{http-method|HTTP}} of messaging.',
	overview: `[[stomp|STOMP]] is to message queuing what [[http1|HTTP]] is to the web — a simple, text-based protocol that any language can implement easily. While [[amqp|AMQP]] has complex {{binary-framing|binary framing}} and [[mqtt|MQTT]] has its binary headers, [[stomp|STOMP]] uses plain text commands like {{mqtt-connect|CONNECT}}, {{mqtt-subscribe|SUBSCRIBE}}, SEND, and {{ack|ACK}}.

This simplicity is [[stomp|STOMP]]'s superpower. You can literally telnet to a [[stomp|STOMP]] {{broker|broker}} and type messages by hand. It's supported by most major message brokers (RabbitMQ, ActiveMQ, Apollo) as an alternative to their native protocols, making it a great choice when you need messaging but don't want to learn a complex protocol.

[[stomp|STOMP]] is commonly used in web applications via [[websockets|WebSocket]] bridges — the Spring Framework's messaging support, for example, uses [[stomp|STOMP]] over [[websockets|WebSockets]] for real-time server-to-browser communication.`,
	howItWorks: [
		{
			title: 'CONNECT',
			description:
				"Client sends a {{mqtt-connect|CONNECT}} frame with credentials. Server responds with CONNECTED. It's human-readable text — you could type it by hand."
		},
		{
			title: 'SUBSCRIBE',
			description:
				'Client subscribes to a destination (like a {{topic|topic}} or queue). Each subscription gets an {{id-identifier|ID}} for tracking.'
		},
		{
			title: 'SEND',
			description:
				'Client sends a message to a destination. The body can be any content type — {{json|JSON}}, {{xml|XML}}, plain text, binary.'
		},
		{
			title: 'MESSAGE delivery',
			description:
				'Broker delivers matching messages to subscribers as MESSAGE frames. Client can {{ack|ACK}}/{{nack|NACK}} for reliable delivery.'
		}
	],
	useCases: [
		'[[websockets|WebSocket]]-based real-time messaging',
		'Spring Framework server-push notifications',
		'Simple integration with message brokers',
		'Debug-friendly messaging (text-based)',
		'Cross-language microservice communication'
	],
	codeExample: {
		language: 'python',
		code: `import stomp

class MyListener(stomp.ConnectionListener):
    def on_message(self, frame):
        print(f"Received: {frame.body}")

conn = stomp.Connection([('localhost', 61613)])
conn.set_listener('', MyListener())
conn.connect('admin', 'admin', wait=True)

# Subscribe to a topic
conn.subscribe(destination='/topic/notifications', id=1, ack='auto')

# Send a message
conn.send(
    destination='/queue/tasks',
    body='{"task": "process-order", "id": 42}',
    content_type='application/json')`,
		caption: '[[stomp|STOMP]] — text-based messaging that you could debug with browser DevTools',
		alternatives: [
			{
				language: 'javascript',
				code: `import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: 'ws://localhost:15674/ws',
  onConnect: () => {
    // Subscribe to a destination
    client.subscribe('/topic/notifications', (message) => {
      console.log('Received:', message.body);
      message.ack();  // Acknowledge receipt
    });

    // Send a message — plain text, human-readable
    client.publish({
      destination: '/queue/tasks',
      headers: { 'content-type': 'application/json' },
      body: {{json|JSON}}.stringify({ task: 'process-order', id: 42 })
    });
  }
});

client.activate();`
			},
			{
				language: 'cli',
				code: `# Connect and subscribe using raw STOMP over TCP
# (you can literally type STOMP frames by hand)
telnet localhost 61613

# Or use socat for a quick test
echo -e "CONNECT\\naccept-version:1.2\\n\\n\\x00" \\
  | socat - TCP:localhost:61613

# ActiveMQ/RabbitMQ admin CLI
activemq-admin send --destination queue://tasks \\
  --body '{"task": "process-order", "id": 42}'`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'CONNECT Frame',
						code: `CONNECT
accept-version:1.2
host:broker.example.com
login:admin
passcode:••••••••
heart-beat:10000,10000

\u0000

--- Server Response ---

CONNECTED
version:1.2
server:ActiveMQ/5.16.0
heart-beat:10000,10000
session:session-12345

\u0000`
					},
					{
						title: 'SUBSCRIBE Frame',
						code: `SUBSCRIBE
id:sub-0
destination:/topic/notifications
ack:client

\u0000

--- Message Received ---

MESSAGE
subscription:sub-0
message-id:msg-42
destination:/topic/notifications
content-type:application/json

{"event": "order.placed", "id": 1042}
\u0000`
					},
					{
						title: 'SEND Frame',
						code: `SEND
destination:/queue/orders
content-type:application/json
receipt:msg-receipt-1

{"action": "create", "product": "Widget", "qty": 5}
\u0000

--- Server Receipt ---

RECEIPT
receipt-id:msg-receipt-1

\u0000`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Similar to the underlying broker; STOMP itself adds minimal latency',
		throughput: 'Text encoding is less efficient than binary protocols like AMQP',
		overhead: 'Text framing is verbose compared to MQTT/AMQP, but very readable'
	},
	connections: ['tcp', 'websockets', 'amqp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Streaming_Text_Oriented_Messaging_Protocol',
		official: 'https://stomp.github.io/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/RabbitMQ_%2848853375337%29.jpg/500px-RabbitMQ_%2848853375337%29.jpg',
		alt: 'RabbitMQ message broker presentation at a developer conference',
		caption:
			"A RabbitMQ conference talk — RabbitMQ is one of the most popular message brokers supporting [[stomp|STOMP]]. The protocol's text-based simplicity made it a natural bridge for web developers entering the messaging world.",
		credit: 'Photo: Exey Panteleev / CC BY 2.0, via Wikimedia Commons'
	}
};
