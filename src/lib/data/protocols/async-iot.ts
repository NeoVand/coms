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
		connections: ['tcp', 'websockets', 'amqp']
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
		performance: {
			latency:
				'Connection setup is heavier than MQTT; message delivery is near-instant once connected',
			throughput: 'RabbitMQ handles ~30,000-50,000 msg/sec per queue; can scale with clustering',
			overhead:
				'Richer framing than MQTT (exchange routing, properties, headers). 8-byte frame header.'
		},
		microInteraction: 'publish-subscribe',
		connections: ['tcp', 'tls', 'mqtt']
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
		performance: {
			latency: 'No connection setup (UDP) — single RTT for confirmable, zero for non-confirmable',
			throughput: 'Low throughput by design — optimized for small, infrequent messages',
			overhead: '4-byte base header. Total message often under 100 bytes.'
		},
		microInteraction: 'query-response',
		connections: ['udp', 'mqtt']
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
		performance: {
			latency: 'Similar to the underlying broker; STOMP itself adds minimal latency',
			throughput: 'Text encoding is less efficient than binary protocols like AMQP',
			overhead: 'Text framing is verbose compared to MQTT/AMQP, but very readable'
		},
		microInteraction: 'publish-subscribe',
		connections: ['tcp', 'websockets', 'amqp']
	}
];
