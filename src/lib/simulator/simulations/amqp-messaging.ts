import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createAMQPLayer } from '../layers/amqp';

export const amqpMessaging: SimulationConfig = {
	protocolId: 'amqp',
	title: 'AMQP — Enterprise Message Queuing',
	description:
		'Follow an AMQP 0-9-1 connection through the handshake, channel setup, and message delivery. AMQP separates the concerns of routing (exchanges), buffering (queues), and consumption (consumers) for enterprise-grade reliability.',
	tier: 'client',
	actors: [
		{ id: 'producer', label: 'Producer', icon: 'client', position: 'left' },
		{ id: 'broker', label: 'RabbitMQ', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'exchange',
			label: 'Exchange',
			type: 'text',
			defaultValue: 'orders',
			placeholder: 'e.g. notifications'
		}
	],
	steps: [
		{
			id: 'protocol-header',
			label: 'Protocol Header',
			description:
				'The client begins by sending the AMQP protocol header: the literal bytes "AMQP" followed by the version numbers (0-0-9-1). This is not a normal frame — it is a raw byte sequence that tells the broker which AMQP version the client speaks.',
			fromActor: 'producer',
			toActor: 'broker',
			duration: 800,
			highlight: ['Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52700, dstPort: 5672, flags: 'PSH,ACK' }),
				createAMQPLayer({
					frameType: 'Protocol Header',
					channel: 0,
					method: 'AMQP 0-0-9-1',
					payloadSize: 8,
					properties: '',
					payload: '"AMQP" 0x00 0x00 0x09 0x01'
				})
			]
		},
		{
			id: 'connection-start',
			label: 'Connection.Start',
			description:
				'The broker responds with Connection.Start, advertising its supported authentication mechanisms (PLAIN, AMQPLAIN), locales, and server properties. This negotiation phase lets clients and brokers agree on capabilities before any messaging begins.',
			fromActor: 'broker',
			toActor: 'producer',
			duration: 800,
			highlight: ['Class.Method', 'Properties'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 5672, dstPort: 52700, flags: 'PSH,ACK' }),
				createAMQPLayer({
					frameType: 'Method (1)',
					channel: 0,
					method: 'Connection.Start',
					payloadSize: 256,
					properties: 'Mechanisms: PLAIN AMQPLAIN, Locales: en_US, Version: 0-9-1',
					payload: ''
				})
			]
		},
		{
			id: 'connection-tune',
			label: 'Connection.Tune',
			description:
				'After authentication (Connection.Start-Ok), the broker sends Connection.Tune to negotiate connection parameters: maximum frame size, maximum number of channels, and heartbeat interval. These protect both sides from resource exhaustion.',
			fromActor: 'broker',
			toActor: 'producer',
			duration: 800,
			highlight: ['Class.Method', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 5672, dstPort: 52700, flags: 'PSH,ACK' }),
				createAMQPLayer({
					frameType: 'Method (1)',
					channel: 0,
					method: 'Connection.Tune',
					payloadSize: 12,
					properties: '',
					payload: 'Max Channels: 2047, Max Frame: 131072, Heartbeat: 60s'
				})
			]
		},
		{
			id: 'channel-open',
			label: 'Channel.Open',
			description:
				'The producer opens a channel within the connection. AMQP multiplexes multiple lightweight channels over a single TCP connection. Each channel is an independent work stream with its own flow control, avoiding the overhead of separate TCP connections.',
			fromActor: 'producer',
			toActor: 'broker',
			duration: 600,
			highlight: ['Class.Method', 'Channel'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52700, dstPort: 5672, flags: 'PSH,ACK' }),
				createAMQPLayer({
					frameType: 'Method (1)',
					channel: 1,
					method: 'Channel.Open',
					payloadSize: 0,
					properties: '',
					payload: ''
				})
			]
		},
		{
			id: 'basic-publish',
			label: 'Basic.Publish',
			description:
				'The producer publishes a message to the "orders" exchange with routing key "order.created". The message has three AMQP frames: the Method frame, a Content Header with properties (delivery-mode 2 = persistent), and a Content Body with the actual data.',
			fromActor: 'producer',
			toActor: 'broker',
			duration: 1200,
			highlight: ['Class.Method', 'Properties', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52700, dstPort: 5672, flags: 'PSH,ACK' }),
				createAMQPLayer({
					frameType: 'Method (1) + Content',
					channel: 1,
					method: 'Basic.Publish',
					payloadSize: 86,
					properties: 'Exchange: orders, Routing-Key: order.created, Delivery-Mode: 2 (persistent)',
					payload: '{"event": "order.created", "orderId": "ORD-1234", "total": 59.99}'
				})
			]
		},
		{
			id: 'basic-deliver',
			label: 'Basic.Deliver',
			description:
				'The broker routes the message to a bound queue and delivers it to a connected consumer. Basic.Deliver includes a delivery tag that the consumer uses to acknowledge receipt. Until acknowledged, the broker retains the message, guaranteeing at-least-once delivery.',
			fromActor: 'broker',
			toActor: 'producer',
			duration: 1000,
			highlight: ['Class.Method', 'Properties', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 5672, dstPort: 52700, flags: 'PSH,ACK' }),
				createAMQPLayer({
					frameType: 'Method (1) + Content',
					channel: 1,
					method: 'Basic.Deliver',
					payloadSize: 86,
					properties: 'Consumer-Tag: ctag-1, Delivery-Tag: 1, Exchange: orders, Routing-Key: order.created',
					payload: '{"event": "order.created", "orderId": "ORD-1234", "total": 59.99}'
				})
			]
		}
	]
};
