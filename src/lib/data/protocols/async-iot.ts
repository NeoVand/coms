import type { Protocol } from '../types';

export const asyncIotProtocols: Protocol[] = [
	{
		id: 'mqtt',
		name: 'Message Queuing Telemetry Transport',
		abbreviation: 'MQTT',
		categoryId: 'async-iot',
		port: 1883,
		year: 1999,
		rfc: undefined,
		oneLiner: 'Lightweight publish/subscribe messaging — the lingua franca of IoT.',
		overview: `MQTT (Message Queuing Telemetry Transport) was invented at IBM for monitoring oil pipelines over unreliable satellite links. Its design goals — minimal bandwidth, tiny code footprint, and unreliable network tolerance — make it perfect for IoT devices with limited resources.

The pattern is publish/subscribe: devices publish messages to named "topics," and other devices subscribe to topics they care about. A central broker handles routing. A temperature sensor publishes to "home/kitchen/temperature," and any interested dashboard or automation system subscribes to that topic.

MQTT's fixed header is just 2 bytes. It supports three quality-of-service levels (fire-and-forget, at-least-once, exactly-once), retained messages (new subscribers get the last value immediately), and "last will" messages (the broker publishes a message if a device disconnects unexpectedly).`,
		howItWorks: [
			{
				title: 'Connect to broker',
				description:
					'Client connects to the MQTT broker (like Mosquitto or HiveMQ) over TCP. It can specify a client ID, credentials, keep-alive interval, and a "last will" message.'
			},
			{
				title: 'Subscribe to topics',
				description:
					'Client subscribes to topic patterns like "home/+/temperature" (+ matches one level) or "home/#" (# matches any number of levels).'
			},
			{
				title: 'Publish messages',
				description:
					"Any client can publish a message to a topic. The broker receives it and forwards it to all matching subscribers. The publisher doesn't need to know who subscribes."
			},
			{
				title: 'QoS delivery',
				description:
					'QoS 0: fire-and-forget. QoS 1: acknowledged (at-least-once). QoS 2: four-step handshake (exactly-once). Choose based on data criticality.'
			}
		],
		useCases: [
			'Smart home automation (Home Assistant, SmartThings)',
			'Industrial IoT sensor networks',
			'Fleet tracking and telematics',
			'Remote patient monitoring',
			'Push notifications for mobile apps'
		],
		codeExample: {
			language: 'python',
			code: `import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883)
client.subscribe("home/+/temperature")
client.on_message = on_message

# Publish from another device:
# client.publish("home/kitchen/temperature", "22.5")

client.loop_forever()`,
			caption: 'Subscribe to temperature readings from any room — the broker handles routing',
			alternatives: [
				{
					language: 'javascript',
					code: `import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

client.on('connect', () => {
  // Subscribe to all room temperatures
  client.subscribe('home/+/temperature');

  // Publish a reading
  client.publish('home/kitchen/temperature', '22.5');
});

client.on('message', (topic, message) => {
  console.log(\`\${topic}: \${message.toString()}\`);
});`
				},
				{
					language: 'cli',
					code: `# Subscribe to a topic (mosquitto CLI)
mosquitto_sub -h broker.hivemq.com \\
  -t "home/+/temperature" -v

# Publish a message
mosquitto_pub -h broker.hivemq.com \\
  -t "home/kitchen/temperature" \\
  -m "22.5"

# Subscribe with QoS 1 (at-least-once)
mosquitto_sub -h broker.hivemq.com \\
  -t "home/#" -q 1 -v`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'CONNECT Packet',
							code: `Fixed Header:
  Packet Type: CONNECT (1)
  Remaining Length: 39

Variable Header:
  Protocol Name: MQTT
  Protocol Level: 5 (v5.0)
  Connect Flags: 0xC2
    Username: 1, Password: 1
    Clean Start: 1
  Keep Alive: 60s

Payload:
  Client ID: "sensor-A7B2"
  Username: "device01"
  Password: "••••••••"`
						},
						{
							title: 'PUBLISH Packet',
							code: `Fixed Header:
  Packet Type: PUBLISH (3)
  DUP: 0, QoS: 1, RETAIN: 0
  Remaining Length: 47

Variable Header:
  Topic: "home/living-room/temp"
  Packet ID: 1042

Payload:
  {"value": 22.5, "unit": "°C", "ts": 1710350400}`
						},
						{
							title: 'SUBSCRIBE Packet',
							code: `Fixed Header:
  Packet Type: SUBSCRIBE (8)
  Remaining Length: 31

Variable Header:
  Packet ID: 1043

Payload:
  Topic Filter: "home/+/temp"
    QoS: 1
  Topic Filter: "home/+/humidity"
    QoS: 0`
						}
					]
				}
			]
		},
		performance: {
			latency: 'Sub-second for QoS 0; 1-2 RTTs for QoS 1; 2 RTTs for QoS 2',
			throughput: 'Brokers handle millions of messages/sec; protocol overhead is minimal',
			overhead: '2-byte fixed header minimum — one of the lightest protocols in existence'
		},
		connections: ['tcp', 'websockets', 'tls', 'amqp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/MQTT',
			official: 'https://mqtt.org/'
		}
	},
	{
		id: 'amqp',
		name: 'Advanced Message Queuing Protocol',
		abbreviation: 'AMQP',
		categoryId: 'async-iot',
		port: 5672,
		year: 2006,
		rfc: undefined,
		oneLiner: 'Enterprise message queuing with routing, persistence, and guaranteed delivery.',
		overview: `AMQP is the heavyweight champion of message queuing protocols. While [[mqtt|MQTT]] is designed for constrained IoT devices, AMQP is designed for enterprise backends where reliability and sophisticated routing matter more than minimal overhead.

The protocol separates concerns beautifully: producers send messages to "exchanges," exchanges route messages to "queues" based on rules (direct, topic, fanout, headers), and consumers read from queues. This decoupling means you can change routing logic without touching producers or consumers.

RabbitMQ, the most popular AMQP broker, powers message-driven architectures at companies like Bloomberg, Instagram, and NASA. AMQP guarantees delivery, supports transactions, and provides fine-grained flow control — making it ideal for financial systems, order processing, and any workflow where losing a message is unacceptable.`,
		howItWorks: [
			{
				title: 'Connection and channels',
				description:
					'Client opens a TCP connection, then multiplexes multiple lightweight "channels" within it. Each channel is an independent communication stream.'
			},
			{
				title: 'Declare exchanges and queues',
				description:
					'Producers create exchanges (routing hubs). Consumers create queues (message buffers). Bindings connect exchanges to queues with routing rules.'
			},
			{
				title: 'Publish to exchange',
				description:
					'Producer sends messages to an exchange with a routing key. The exchange copies the message to all bound queues whose binding rules match.'
			},
			{
				title: 'Consume and acknowledge',
				description:
					'Consumer pulls messages from its queue. After processing, it sends an ACK. If the consumer crashes without ACK, the message is redelivered.'
			}
		],
		useCases: [
			'Order processing pipelines (e-commerce)',
			'Financial transaction processing',
			'Microservice event buses',
			'Background job processing',
			'Log aggregation and monitoring'
		],
		codeExample: {
			language: 'python',
			code: `import pika

# Connect to RabbitMQ broker
connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Declare a queue (idempotent)
channel.queue_declare(queue='tasks', durable=True)

# Publish a message
channel.basic_publish(
    exchange='',
    routing_key='tasks',
    body='Process order #1234',
    properties=pika.BasicProperties(delivery_mode=2)  # persistent
)
print("Message sent!")

# Consume messages
def callback(ch, method, properties, body):
    print(f"Received: {body.decode()}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(queue='tasks', on_message_callback=callback)
channel.start_consuming()`,
			caption: 'RabbitMQ with pika — publish durable messages and consume with acknowledgments',
			alternatives: [
				{
					language: 'javascript',
					code: `import amqplib from 'amqplib';

const conn = await amqplib.connect('amqp://localhost');
const channel = await conn.createChannel();

await channel.assertQueue('tasks', { durable: true });

// Publish
channel.sendToQueue('tasks',
  Buffer.from('Process order #1234'),
  { persistent: true }
);

// Consume
channel.consume('tasks', (msg) => {
  if (msg) {
    console.log('Received:', msg.content.toString());
    channel.ack(msg);
  }
});`
				},
				{
					language: 'cli',
					code: `# List queues and message counts
rabbitmqctl list_queues name messages

# Publish a message via the management API
rabbitmqadmin publish exchange=amq.default \\
  routing_key=tasks \\
  payload="Process order #1234"

# Consume a message
rabbitmqadmin get queue=tasks ackmode=ack_requeue_false

# List exchanges and bindings
rabbitmqadmin list exchanges
rabbitmqadmin list bindings`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Protocol Header',
							code: `AMQP Protocol Handshake:
  Client → Server:
    "AMQP" 0x00 0x00 0x09 0x01
    (Protocol: AMQP, Major: 0, Minor: 9, Revision: 1)

  Server → Client:
    Connection.Start
      Version: 0-9-1
      Mechanisms: PLAIN AMQPLAIN
      Locales: en_US`
						},
						{
							title: 'Basic.Publish',
							code: `Method: Basic.Publish
  Channel: 1
  Exchange: "notifications"
  Routing Key: "user.signup"
  Mandatory: false

Content Header:
  Class: Basic (60)
  Body Size: 86
  Properties:
    Content-Type: application/json
    Delivery-Mode: 2 (persistent)
    Message-ID: "msg-2f4a8b"
    Timestamp: 1710350400

Content Body:
  {"event": "signup", "user": "alice@example.com"}`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Connection setup is heavier than MQTT; message delivery is near-instant once connected',
			throughput: 'RabbitMQ handles ~30,000-50,000 msg/sec per queue; can scale with clustering',
			overhead:
				'Richer framing than MQTT (exchange routing, properties, headers). 8-byte frame header.'
		},
		connections: ['tcp', 'tls', 'websockets', 'mqtt', 'stomp', 'kafka'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol',
			official: 'https://www.amqp.org/'
		}
	},
	{
		id: 'coap',
		name: 'Constrained Application Protocol',
		abbreviation: 'CoAP',
		categoryId: 'async-iot',
		port: 5683,
		year: 2014,
		rfc: 'RFC 7252',
		oneLiner: 'HTTP for tiny devices — REST semantics over UDP for constrained IoT.',
		overview: `CoAP brings the familiar [[rest|REST]] model (GET, POST, PUT, DELETE) to the world of constrained IoT devices — think microcontrollers with 10KB of RAM on lossy, low-power wireless networks. It runs over [[udp|UDP]] instead of [[tcp|TCP]], uses a compact binary format, and adds built-in support for resource observation (subscribe to changes).

The design mirrors [[http1|HTTP]] closely enough that translating between CoAP and [[http1|HTTP]] is straightforward, enabling IoT devices to integrate with web infrastructure through simple proxies. But unlike [[http1|HTTP]], CoAP supports multicast (discover all devices on a network), observation (get notified when a sensor value changes), and block-wise transfer (for large payloads on constrained links).

CoAP is widely used in smart buildings, industrial automation, and city infrastructure where devices have extreme resource constraints but still need web-like interaction patterns.`,
		howItWorks: [
			{
				title: 'UDP-based messaging',
				description:
					"CoAP runs over UDP — no TCP handshake needed. Messages are tiny binary packets (4-byte base header). Confirmable messages get ACKs; non-confirmable don't."
			},
			{
				title: 'REST methods',
				description:
					'Supports GET, POST, PUT, DELETE just like HTTP. URIs identify resources. Content negotiation works via options (like HTTP headers but binary-encoded).'
			},
			{
				title: 'Observe pattern',
				description:
					'Client sends GET with an "Observe" option. Server then pushes notifications whenever the resource changes — like WebSockets but for constrained devices.'
			},
			{
				title: 'Resource discovery',
				description:
					'Devices expose /.well-known/core listing all their resources. Supports multicast discovery — find all temperature sensors on the network in one query.'
			}
		],
		useCases: [
			'Smart building automation (lighting, HVAC)',
			'Industrial sensor networks',
			'Smart city infrastructure (parking, waste)',
			'Wearable health devices',
			'Agricultural monitoring systems'
		],
		codeExample: {
			language: 'python',
			code: `import asyncio
from aiocoap import Context, Message, GET, PUT

async def main():
    context = await Context.create_client_context()

    # GET request — like HTTP but over UDP
    request = Message(code=GET,
        uri='coap://sensor.local/temperature')
    response = await context.request(request).response
    print(f"Temperature: {response.payload.decode()} C")

    # PUT request — update a resource
    request = Message(code=PUT,
        uri='coap://light.local/brightness',
        payload=b'75')
    response = await context.request(request).response
    print(f"Set brightness: {response.code}")

asyncio.run(main())`,
			caption:
				'CoAP uses REST-like methods (GET, PUT) over UDP — designed for constrained IoT devices',
			alternatives: [
				{
					language: 'javascript',
					code: `const coap = require('coap');

// GET request to a CoAP sensor
const req = coap.request('coap://sensor.local/temperature');

req.on('response', (res) => {
  console.log('Temperature:', res.payload.toString());

  // Observe — get notified of changes
  const observe = coap.request({
    hostname: 'sensor.local',
    pathname: '/temperature',
    observe: true
  });
  observe.on('response', (res) => {
    res.on('data', (d) => console.log('Update:', d.toString()));
  });
  observe.end();
});
req.end();`
				},
				{
					language: 'cli',
					code: `# GET a resource from a CoAP server
coap-client -m get coap://sensor.local/temperature

# PUT — update a resource
coap-client -m put -e "75" \\
  coap://light.local/brightness

# Observe a resource (get push notifications)
coap-client -m get -s 60 -B 60 \\
  coap://sensor.local/temperature

# Discover resources on a device
coap-client -m get coap://sensor.local/.well-known/core`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'GET Request',
							code: `CoAP Message (UDP):
  Version: 1
  Type: Confirmable (CON)
  Token Length: 4
  Code: 0.01 (GET)
  Message ID: 0x7D34
  Token: 0xFA4B2C01

  Options:
    Uri-Host: "sensor.local"
    Uri-Path: "temperature"
    Accept: application/json (50)

  Wire bytes:
    44 01 7d 34 fa 4b 2c 01
    39 73 65 6e 73 6f 72 2e
    6c 6f 63 61 6c ...`
						},
						{
							title: '2.05 Content Response',
							code: `CoAP Message (UDP):
  Version: 1
  Type: Acknowledgement (ACK)
  Token Length: 4
  Code: 2.05 (Content)
  Message ID: 0x7D34
  Token: 0xFA4B2C01

  Options:
    Content-Format: application/json (50)
    Max-Age: 30

  Payload Marker: 0xFF
  Payload:
    {"temp": 22.5, "unit": "C"}`
						}
					]
				}
			]
		},
		performance: {
			latency: 'No connection setup (UDP) — single RTT for confirmable, zero for non-confirmable',
			throughput: 'Low throughput by design — optimized for small, infrequent messages',
			overhead: '4-byte base header. Total message often under 100 bytes.'
		},
		connections: ['udp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Constrained_Application_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc7252'
		}
	},
	{
		id: 'stomp',
		name: 'Simple Text Oriented Messaging Protocol',
		abbreviation: 'STOMP',
		categoryId: 'async-iot',
		port: 61613,
		year: 2003,
		rfc: undefined,
		oneLiner: 'A dead-simple text protocol for message brokers — the HTTP of messaging.',
		overview: `STOMP is to message queuing what [[http1|HTTP]] is to the web — a simple, text-based protocol that any language can implement easily. While [[amqp|AMQP]] has complex binary framing and [[mqtt|MQTT]] has its binary headers, STOMP uses plain text commands like CONNECT, SUBSCRIBE, SEND, and ACK.

This simplicity is STOMP's superpower. You can literally telnet to a STOMP broker and type messages by hand. It's supported by most major message brokers (RabbitMQ, ActiveMQ, Apollo) as an alternative to their native protocols, making it a great choice when you need messaging but don't want to learn a complex protocol.

STOMP is commonly used in web applications via [[websockets|WebSocket]] bridges — the Spring Framework's messaging support, for example, uses STOMP over [[websockets|WebSockets]] for real-time server-to-browser communication.`,
		howItWorks: [
			{
				title: 'CONNECT',
				description:
					"Client sends a CONNECT frame with credentials. Server responds with CONNECTED. It's human-readable text — you could type it by hand."
			},
			{
				title: 'SUBSCRIBE',
				description:
					'Client subscribes to a destination (like a topic or queue). Each subscription gets an ID for tracking.'
			},
			{
				title: 'SEND',
				description:
					'Client sends a message to a destination. The body can be any content type — JSON, XML, plain text, binary.'
			},
			{
				title: 'MESSAGE delivery',
				description:
					'Broker delivers matching messages to subscribers as MESSAGE frames. Client can ACK/NACK for reliable delivery.'
			}
		],
		useCases: [
			'WebSocket-based real-time messaging',
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
			caption:
				'STOMP — text-based messaging that you could debug with browser DevTools',
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
      body: JSON.stringify({ task: 'process-order', id: 42 })
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
		}
	},
	{
		id: 'xmpp',
		name: 'Extensible Messaging and Presence Protocol',
		abbreviation: 'XMPP',
		categoryId: 'async-iot',
		port: 5222,
		year: 1999,
		rfc: 'RFC 6120',
		oneLiner:
			'The open, XML-based messaging protocol born as Jabber — federated chat before it was cool.',
		overview: `In January 1999, Jeremie Miller was tired of juggling four different instant messaging clients for four different walled-garden services. So he built Jabber — an open, federated messaging system where anyone could run a server and talk to anyone on any other server. That system became XMPP, and its ideas about federation and open standards shaped the future of messaging.

XMPP uses persistent XML streams between clients and servers over [[tcp|TCP]]. Messages, presence updates ("Alice is online"), and IQ (info/query) stanzas flow as XML fragments over these streams. The protocol is designed to be extensible — hundreds of XEPs (XMPP Extension Protocols) add capabilities from file transfer and multi-user chat to IoT device management.

Google Talk, the early versions of WhatsApp, Facebook Messenger (originally), and Apple's iMessage push notifications all used XMPP at some point. While many moved to proprietary protocols for scale, XMPP remains the backbone of countless enterprise chat systems, IoT platforms, and the federated messaging movement.`,
		howItWorks: [
			{
				title: 'TCP connection + stream negotiation',
				description:
					'Client opens a TCP connection to the server on port 5222, then opens an XML stream. The server responds with its own stream header, and they negotiate TLS and authentication.'
			},
			{
				title: 'Authentication and resource binding',
				description:
					'Client authenticates via SASL (typically SCRAM-SHA-1). After auth, the client binds a "resource" to distinguish multiple devices for the same account.'
			},
			{
				title: 'Stanza exchange',
				description:
					'Three types of XML stanzas flow: <message> for chat, <presence> for online/offline status, and <iq> (info/query) for request-response interactions.'
			},
			{
				title: 'Server-to-server federation',
				description:
					'When alice@server-a.com messages bob@server-b.com, Server A connects to Server B on port 5269 using TLS. Messages route between federated servers just like email.'
			},
			{
				title: 'Extensions (XEPs)',
				description:
					'The base protocol is minimal. Hundreds of XEPs add features: multi-user chat, HTTP file upload, message carbons, end-to-end encryption (OMEMO), and more.'
			}
		],
		useCases: [
			'Enterprise instant messaging (Cisco Jabber, Zoom Chat backend)',
			'IoT device communication and management',
			'Federated social messaging (Conversations, Dino)',
			'Real-time collaboration and presence systems',
			'Gaming chat and notification infrastructure'
		],
		codeExample: {
			language: 'python',
			code: `import slixmpp

class ChatBot(slixmpp.ClientXMPP):
    def __init__(self, jid, password):
        super().__init__(jid, password)
        self.add_event_handler("session_start", self.start)
        self.add_event_handler("message", self.on_message)

    async def start(self, event):
        self.send_presence()  # I'm online
        self.send_message(
            mto="bob@example.com",
            mbody="Hey Bob, XMPP still rocks!")

    def on_message(self, msg):
        if msg["type"] == "chat":
            print(f"{msg['from']}: {msg['body']}")

bot = ChatBot("alice@example.com", "secret")
bot.connect()
bot.process()`,
			caption: 'XMPP client — connect, announce presence, and send messages as XML stanzas',
			alternatives: [
				{
					language: 'javascript',
					code: `const { client, xml } = require('@xmpp/client');

const xmpp = client({
  service: 'xmpp://chat.example.com:5222',
  username: 'alice',
  password: 'secret'
});

xmpp.on('online', (address) => {
  console.log('Connected as', address.toString());
  xmpp.send(xml('presence')); // I'm online

  xmpp.send(
    xml('message', { to: 'bob@example.com', type: 'chat' },
      xml('body', {}, 'Hey Bob, XMPP still rocks!')
    )
  );
});

xmpp.on('stanza', (stanza) => {
  if (stanza.is('message') && stanza.getChild('body')) {
    const from = stanza.attrs.from;
    const body = stanza.getChildText('body');
    console.log(from + ': ' + body);
  }
});

xmpp.start().catch(console.error);`
				},
				{
					language: 'cli',
					code: `# Send a message using sendxmpp
echo "Hello Bob!" | sendxmpp -t bob@example.com

# Connect interactively with profanity
profanity -a alice@example.com

# Test XMPP server connectivity
nmap -sV -p 5222 chat.example.com

# Check SRV DNS records for XMPP
dig _xmpp-client._tcp.example.com SRV +short`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Stream Open',
							code: `Client → Server:
  <?xml version='1.0'?>
  <stream:stream
    to='example.com'
    xmlns='jabber:client'
    xmlns:stream='http://etherx.jabber.org/streams'
    version='1.0'>

Server → Client:
  <?xml version='1.0'?>
  <stream:stream
    from='example.com'
    id='session_42'
    xmlns='jabber:client'
    xmlns:stream='http://etherx.jabber.org/streams'
    version='1.0'>

  <stream:features>
    <mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>
      <mechanism>PLAIN</mechanism>
      <mechanism>SCRAM-SHA-1</mechanism>
    </mechanisms>
  </stream:features>`
						},
						{
							title: 'Message Stanza',
							code: `Client → Server:
  <message
    to='bob@example.com'
    from='alice@example.com/laptop'
    type='chat'
    id='msg-001'>
    <body>Hey Bob, are you there?</body>
    <active xmlns='http://jabber.org/protocol/chatstates'/>
  </message>

Server → Recipient:
  <message
    to='bob@example.com/phone'
    from='alice@example.com/laptop'
    type='chat'
    id='msg-001'>
    <body>Hey Bob, are you there?</body>
  </message>`
						},
						{
							title: 'Presence Stanza',
							code: `Client → Server (go online):
  <presence>
    <show>chat</show>
    <status>Available for messages</status>
    <priority>10</priority>
  </presence>

Server → Contacts (broadcast):
  <presence
    from='alice@example.com/laptop'
    to='bob@example.com'>
    <show>chat</show>
    <status>Available for messages</status>
  </presence>`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Near-instant over persistent TCP connections. Presence updates propagate in milliseconds.',
			throughput:
				'ejabberd handles 2+ million concurrent connections. XML overhead is the main cost.',
			overhead:
				'XML stanzas are verbose compared to binary protocols. Compression and WebSocket transport help.'
		},
		connections: ['tcp', 'tls', 'websockets'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/XMPP',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc6120',
			official: 'https://xmpp.org/'
		}
	},
	{
		id: 'kafka',
		name: 'Apache Kafka Wire Protocol',
		abbreviation: 'Kafka',
		categoryId: 'async-iot',
		port: 9092,
		year: 2011,
		oneLiner:
			"The distributed event streaming wire protocol — LinkedIn's answer to real-time data at massive scale.",
		overview: `Apache Kafka started as LinkedIn's internal project to handle the firehose of activity data — page views, searches, metrics — that their existing message queues couldn't keep up with. Jay Kreps, Neha Narkhede, and Jun Rao open-sourced it in 2011, and it quickly became the de facto platform for event streaming at scale.

Unlike traditional message queues where messages are pushed to consumers and deleted after delivery, Kafka uses an append-only log model: producers append records to topic partitions, and consumers read at their own pace using offsets. Multiple consumers can independently read the same data, and messages persist for a configurable retention period.

The protocol handles producer requests, fetch requests, metadata discovery, offset management, and consumer group coordination. Its efficiency comes from batching, zero-copy transfers, and sequential disk I/O. Kafka clusters routinely handle millions of messages per second with sub-10ms latency.`,
		howItWorks: [
			{
				title: 'Connect and discover topology',
				description:
					'Client opens a TCP connection to any broker and sends a Metadata request. The response contains the full cluster map: all brokers, topics, partitions, and partition leaders.'
			},
			{
				title: 'Produce records',
				description:
					'Producer batches records by topic-partition, compresses the batch, and sends a Produce request to the partition leader. The leader writes to its log and replicates before acknowledging.'
			},
			{
				title: 'Consume with offsets',
				description:
					'Consumer sends Fetch requests specifying topic, partition, and offset. The broker returns records from that offset forward. The consumer tracks its own position.'
			},
			{
				title: 'Consumer groups coordinate',
				description:
					'Consumers in the same group coordinate via a GroupCoordinator broker. Partitions are assigned to members. If a member fails, its partitions are rebalanced automatically.'
			},
			{
				title: 'Retained and replayable',
				description:
					'Records stay in the log for the configured retention period. Any consumer can rewind and replay history — unlike traditional queues where consumed messages are deleted.'
			}
		],
		useCases: [
			'Real-time event streaming and analytics pipelines',
			'Microservice event-driven architectures',
			'Log aggregation and centralized monitoring',
			'Change data capture (CDC) from databases',
			'Stream processing with Kafka Streams or Flink'
		],
		codeExample: {
			language: 'python',
			code: `from kafka import KafkaProducer, KafkaConsumer
import json

# Producer — send events
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode())

producer.send('user-events',
    key=b'user-123',
    value={'event': 'page_view', 'url': '/products'})
producer.flush()

# Consumer — read events
consumer = KafkaConsumer(
    'user-events',
    bootstrap_servers='localhost:9092',
    group_id='analytics',
    value_deserializer=lambda m: json.loads(m))

for message in consumer:
    print(f"[{message.partition}] {message.key}: {message.value}")`,
			caption: 'Kafka producer and consumer — event streaming with consumer groups',
			alternatives: [
				{
					language: 'javascript',
					code: `import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

// Producer — send events
const producer = kafka.producer();
await producer.connect();
await producer.send({
  topic: 'user-events',
  messages: [
    { key: 'user-123', value: JSON.stringify({
      event: 'page_view', url: '/products', ts: Date.now()
    })}
  ]
});

// Consumer — read events
const consumer = kafka.consumer({ groupId: 'analytics' });
await consumer.connect();
await consumer.subscribe({ topic: 'user-events' });
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log('[' + partition + '] ' +
      message.key + ': ' + message.value);
  }
});`
				},
				{
					language: 'cli',
					code: `# Create a topic
kafka-topics.sh --create --topic user-events \\
  --bootstrap-server localhost:9092 \\
  --partitions 3 --replication-factor 1

# Produce messages from command line
echo '{"event":"page_view"}' | \\
  kafka-console-producer.sh \\
  --broker-list localhost:9092 \\
  --topic user-events

# Consume messages from the beginning
kafka-console-consumer.sh \\
  --bootstrap-server localhost:9092 \\
  --topic user-events --from-beginning

# List consumer groups and lag
kafka-consumer-groups.sh \\
  --bootstrap-server localhost:9092 \\
  --describe --group analytics`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Produce Request',
							code: `Kafka Produce Request (API Key: 0):
  Correlation ID: 7
  Client ID: "producer-1"

  Topic: "user-events"
  Partition: 0
  Record Batch:
    Base Offset: 0
    Partition Leader Epoch: 5
    Magic: 2 (v2 format)
    Compression: snappy
    Timestamp Type: CreateTime

    Record 0:
      Key: "user-42"
      Value: {"event": "page_view", "url": "/home"}
      Headers:
        trace-id: "abc-123"`
						},
						{
							title: 'Fetch Response',
							code: `Kafka Fetch Response (API Key: 1):
  Correlation ID: 12
  Throttle Time: 0ms

  Topic: "user-events"
  Partition: 0
    Error: NONE (0)
    High Watermark: 1547
    Last Stable Offset: 1547

    Record Batch:
      Base Offset: 1542
      Records: 3

      Record 0: Key="user-42"
        {"event": "page_view", "url": "/home"}
      Record 1: Key="user-17"
        {"event": "click", "button": "signup"}
      Record 2: Key="user-42"
        {"event": "page_view", "url": "/pricing"}`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'End-to-end: 2-10ms typical. Batch accumulation adds configurable delay.',
			throughput:
				'Single broker: 100K-200K+ msg/sec. Clusters handle millions/sec with linear scaling.',
			overhead:
				'Binary protocol with batching and compression. Zero-copy optimization for reads.'
		},
		connections: ['tcp', 'tls', 'amqp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Apache_Kafka',
			official: 'https://kafka.apache.org/protocol/'
		}
	}
];
