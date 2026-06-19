import type { Protocol } from '../types';

export const amqp: Protocol = {
	id: 'amqp',
	name: 'Advanced Message Queuing Protocol',
	abbreviation: 'AMQP',
	categoryId: 'async-iot',
	port: 5672,
	year: 2006,
	rfc: undefined,
	oneLiner: 'Enterprise message queuing with routing, persistence, and guaranteed delivery.',
	overview: `[[amqp|AMQP]] is the heavyweight champion of message queuing protocols. While [[mqtt|MQTT]] is designed for constrained IoT devices, [[amqp|AMQP]] is designed for enterprise backends where reliability and sophisticated routing {{matter|matter}} more than minimal overhead.

The protocol separates concerns beautifully: producers send messages to "{{exchange|exchanges}}," exchanges route messages to "queues" based on rules, and consumers read from queues. This decoupling means you can change routing logic without touching producers or consumers. [[amqp|AMQP]] defines four {{exchange|exchange}} types: **direct** (routes by exact {{routing-key|routing key}} match), **{{topic|topic}}** (routes by wildcard pattern matching on routing keys), **fanout** (broadcasts to all bound queues regardless of {{routing-key|routing key}}), and **headers** (routes based on message header attributes instead of routing keys).

RabbitMQ, the most popular [[amqp|AMQP]] {{broker|broker}}, powers message-driven architectures at companies like Bloomberg, Instagram, and NASA. [[amqp|AMQP]] guarantees delivery, supports transactions, and provides fine-grained {{flow-control|flow control}} — making it ideal for financial systems, order processing, and any workflow where losing a message is unacceptable.`,
	howItWorks: [
		{
			title: 'Connection and channels',
			description:
				'Client opens a [[tcp|TCP]] connection, then multiplexes multiple lightweight "channels" within it. Each channel is an independent communication stream.'
		},
		{
			title: 'Declare exchanges and queues',
			description:
				'Producers create exchanges (routing hubs). Consumers create queues (message buffers). Bindings {{mqtt-connect|connect}} exchanges to queues with routing rules.'
		},
		{
			title: 'Publish to exchange',
			description:
				'Producer sends messages to an {{exchange|exchange}} with a {{routing-key|routing key}}. The {{exchange|exchange}} copies the message to all bound queues whose binding rules match.'
		},
		{
			title: 'Consume and acknowledge',
			description:
				'Consumer pulls messages from its queue. After processing, it sends an {{ack|ACK}}. If the consumer crashes without {{ack|ACK}}, the message is redelivered.'
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
			'RabbitMQ with pika — {{mqtt-publish|publish}} durable messages and consume with acknowledgments',
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
			'Richer framing than MQTT (exchange routing, properties, headers). 7-byte frame header in AMQP 0-9-1 (1 type + 2 channel + 4 size); AMQP 1.0 uses 8 bytes.'
	},
	connections: ['tcp', 'tls', 'websockets', 'mqtt', 'stomp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol',
		official: 'https://www.amqp.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Pieter_Hintjens_at_EuroPython2014_%28cropped%29.jpg/500px-Pieter_Hintjens_at_EuroPython2014_%28cropped%29.jpg',
		alt: 'Pieter Hintjens, CEO of iMatix and key AMQP contributor, speaking at EuroPython 2014',
		caption:
			'Pieter Hintjens, CEO of iMatix, was a driving force behind [[amqp|AMQP]] and the creator of ZeroMQ. His work on open messaging standards helped shape enterprise message queuing as we know it.',
		credit: 'Photo: EuroPython / CC BY 2.0, via Wikimedia Commons'
	}
};
