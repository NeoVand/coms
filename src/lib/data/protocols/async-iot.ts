import type { Protocol } from '../types';

export const asyncIotProtocols: Protocol[] = [
	{
		id: 'mqtt',
		name: 'MQTT',
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
			caption: 'Subscribe to temperature readings from any room — the broker handles routing'
		},
		performance: {
			latency: 'Sub-second for QoS 0; 1-2 RTTs for QoS 1; 2 RTTs for QoS 2',
			throughput: 'Brokers handle millions of messages/sec; protocol overhead is minimal',
			overhead: '2-byte fixed header minimum — one of the lightest protocols in existence'
		},
		microInteraction: 'publish-subscribe',
		connections: ['tcp', 'websockets', 'amqp'],
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
		overview: `AMQP is the heavyweight champion of message queuing protocols. While MQTT is designed for constrained IoT devices, AMQP is designed for enterprise backends where reliability and sophisticated routing matter more than minimal overhead.

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
			caption:
				'RabbitMQ with pika — publish durable messages and consume with acknowledgments',
			alternatives: [
				{
					language: 'typescript',
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
		microInteraction: 'publish-subscribe',
		connections: ['tcp', 'tls', 'mqtt'],
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
		overview: `CoAP brings the familiar REST model (GET, POST, PUT, DELETE) to the world of constrained IoT devices — think microcontrollers with 10KB of RAM on lossy, low-power wireless networks. It runs over UDP instead of TCP, uses a compact binary format, and adds built-in support for resource observation (subscribe to changes).

The design mirrors HTTP closely enough that translating between CoAP and HTTP is straightforward, enabling IoT devices to integrate with web infrastructure through simple proxies. But unlike HTTP, CoAP supports multicast (discover all devices on a network), observation (get notified when a sensor value changes), and block-wise transfer (for large payloads on constrained links).

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
				}
			]
		},
		performance: {
			latency: 'No connection setup (UDP) — single RTT for confirmable, zero for non-confirmable',
			throughput: 'Low throughput by design — optimized for small, infrequent messages',
			overhead: '4-byte base header. Total message often under 100 bytes.'
		},
		microInteraction: 'query-response',
		connections: ['udp', 'mqtt'],
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
		year: 2009,
		rfc: undefined,
		oneLiner: 'A dead-simple text protocol for message brokers — the HTTP of messaging.',
		overview: `STOMP is to message queuing what HTTP is to the web — a simple, text-based protocol that any language can implement easily. While AMQP has complex binary framing and MQTT has its binary headers, STOMP uses plain text commands like CONNECT, SUBSCRIBE, SEND, and ACK.

This simplicity is STOMP's superpower. You can literally telnet to a STOMP broker and type messages by hand. It's supported by most major message brokers (RabbitMQ, ActiveMQ, Apollo) as an alternative to their native protocols, making it a great choice when you need messaging but don't want to learn a complex protocol.

STOMP is commonly used in web applications via WebSocket bridges — the Spring Framework's messaging support, for example, uses STOMP over WebSockets for real-time server-to-browser communication.`,
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

client.activate();`,
			caption:
				'STOMP over WebSockets — text-based messaging that you could debug with browser DevTools',
			alternatives: [
				{
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
    content_type='application/json'
)`
				}
			]
		},
		performance: {
			latency: 'Similar to the underlying broker; STOMP itself adds minimal latency',
			throughput: 'Text encoding is less efficient than binary protocols like AMQP',
			overhead: 'Text framing is verbose compared to MQTT/AMQP, but very readable'
		},
		microInteraction: 'publish-subscribe',
		connections: ['tcp', 'websockets', 'amqp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Streaming_Text_Oriented_Messaging_Protocol',
			official: 'https://stomp.github.io/'
		}
	}
];
