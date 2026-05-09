import type { Protocol } from '../types';

export const kafka: Protocol = {
	id: 'kafka',
	name: 'Apache Kafka Wire Protocol',
	abbreviation: 'Kafka',
	categoryId: 'async-iot',
	port: 9092,
	year: 2011,
	rfc: undefined,
	oneLiner:
		"The distributed event streaming wire protocol — LinkedIn's answer to real-time data at massive scale.",
	overview: `Apache Kafka started as LinkedIn's internal project to handle the firehose of activity data — page views, searches, metrics — that their existing message queues couldn't keep up with. Jay Kreps, Neha Narkhede, and Jun Rao open-sourced it in 2011, and it quickly became the de facto platform for event streaming at scale.

Unlike traditional message queues where messages are pushed to consumers and deleted after delivery, Kafka uses an append-only log model: producers append records to {{topic|topic}} {{partition|partitions}}, and consumers read at their own pace using offsets. Multiple consumers can independently read the same data, and messages persist for a configurable retention period. Because consumers control their own read rate, {{backpressure|backpressure}} is handled naturally — slow consumers simply fall behind in the log without affecting producers or other consumer groups.

The protocol handles producer requests, fetch requests, metadata discovery, offset management, and consumer group coordination. Its efficiency comes from batching, zero-copy transfers, and sequential disk I/O. Kafka clusters routinely handle millions of messages per second with sub-10ms {{latency|latency}}.`,
	howItWorks: [
		{
			title: 'Connect and discover topology',
			description:
				'Client opens a [[tcp|TCP]] connection to any broker and sends a Metadata request. The response contains the full cluster map: all brokers, topics, partitions, and partition leaders.'
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
		latency: 'End-to-end: 2-10ms typical. Batch accumulation adds configurable delay.',
		throughput:
			'Single broker: 100K-200K+ msg/sec. Clusters handle millions/sec with linear scaling.',
		overhead: 'Binary protocol with batching and compression. Zero-copy optimization for reads.'
	},
	connections: ['tcp', 'tls'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Apache_Kafka',
		official: 'https://kafka.apache.org/protocol/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Kafka_Job_Queue_Architecture_diagram.svg/500px-Kafka_Job_Queue_Architecture_diagram.svg.png',
		alt: 'Architecture diagram showing Kafka producers writing to topic partitions across brokers, with consumer groups reading independently',
		caption:
			'Kafka architecture — producers write records to topic partitions distributed across brokers. Consumer groups read independently at their own pace using offsets, and data persists in the append-only log for replay.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
