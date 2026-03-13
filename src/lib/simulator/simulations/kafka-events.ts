import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createKafkaLayer } from '../layers/kafka';

export const kafkaEvents: SimulationConfig = {
	protocolId: 'kafka',
	title: 'Kafka — Event Streaming',
	description:
		'Follow a producer connecting to a Kafka broker, discovering topic metadata, and publishing an event. Kafka\'s binary wire protocol uses API keys and versioning for backward-compatible evolution.',
	tier: 'client',
	actors: [
		{ id: 'producer', label: 'Producer', icon: 'client', position: 'left' },
		{ id: 'broker', label: 'Kafka Broker', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'topic',
			label: 'Topic',
			type: 'text',
			defaultValue: 'orders',
			placeholder: 'e.g. user-events'
		}
	],
	steps: [
		{
			id: 'api-versions',
			label: 'ApiVersions',
			description:
				'The producer first asks which API versions the broker supports. This is always the first request in a Kafka connection — it lets the client discover what features are available and choose compatible request versions. This enables zero-downtime rolling upgrades of Kafka clusters.',
			fromActor: 'producer',
			toActor: 'broker',
			duration: 800,
			highlight: ['API Key', 'Client ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52800, dstPort: 9092, flags: 'PSH,ACK' }),
				createKafkaLayer({
					apiKey: 'ApiVersions (18)',
					apiVersion: 3,
					correlationId: 1,
					clientId: 'producer-1',
					topic: '',
					partition: '',
					payload: ''
				})
			]
		},
		{
			id: 'metadata-request',
			label: 'Metadata Request',
			description:
				'The producer requests metadata for the "orders" topic. The broker responds with the list of partitions, their leaders, and replica assignments. This information lets the producer send records directly to the correct broker — Kafka clients are topology-aware.',
			fromActor: 'producer',
			toActor: 'broker',
			duration: 800,
			highlight: ['API Key', 'Topic'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52800, dstPort: 9092, flags: 'PSH,ACK' }),
				createKafkaLayer({
					apiKey: 'Metadata (3)',
					apiVersion: 12,
					correlationId: 2,
					clientId: 'producer-1',
					topic: 'orders',
					partition: '',
					payload: ''
				})
			]
		},
		{
			id: 'metadata-response',
			label: 'Metadata Response',
			description:
				'The broker returns topic metadata including partition count, leader broker IDs, and ISR (in-sync replica) lists. The producer caches this to route future produce requests directly to partition leaders. If a leader changes, the client refreshes metadata automatically.',
			fromActor: 'broker',
			toActor: 'producer',
			duration: 800,
			highlight: ['Topic', 'Partition', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 9092, dstPort: 52800, flags: 'PSH,ACK' }),
				createKafkaLayer({
					apiKey: 'Metadata (3)',
					apiVersion: 12,
					correlationId: 2,
					clientId: '',
					topic: 'orders',
					partition: '0,1,2',
					payload: 'Partitions: 3, Leader: broker-0, ISR: [0,1,2]'
				})
			]
		},
		{
			id: 'produce',
			label: 'Produce',
			description:
				'The producer sends a batch of records to partition 0. Kafka batches multiple records into a single request for throughput. Each record has a key (for partitioning), value (the event data), headers, and a timestamp. The acks setting controls durability: acks=all waits for all ISR replicas.',
			fromActor: 'producer',
			toActor: 'broker',
			duration: 1000,
			highlight: ['API Key', 'Topic', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52800, dstPort: 9092, flags: 'PSH,ACK' }),
				createKafkaLayer({
					apiKey: 'Produce (0)',
					apiVersion: 9,
					correlationId: 3,
					clientId: 'producer-1',
					topic: 'orders',
					partition: 0,
					payload: 'key:"ORD-5678", value:{"item":"widget","qty":3}, acks:all'
				})
			]
		},
		{
			id: 'produce-ack',
			label: 'Produce ACK',
			description:
				'The broker acknowledges the produce request after all in-sync replicas have written the records. The response includes the base offset — the position in the partition\'s append-only log where the records were written. Consumers use offsets to track their read position.',
			fromActor: 'broker',
			toActor: 'producer',
			duration: 800,
			highlight: ['Partition', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 9092, dstPort: 52800, flags: 'PSH,ACK' }),
				createKafkaLayer({
					apiKey: 'Produce (0)',
					apiVersion: 9,
					correlationId: 3,
					clientId: '',
					topic: 'orders',
					partition: 0,
					payload: 'Base Offset: 1042, Log Append Time: 1710350400, Error: NONE'
				})
			]
		}
	]
};
