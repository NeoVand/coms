import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createSTOMPLayer } from '../layers/stomp';

export const stompSubscription: SimulationConfig = {
	protocolId: 'stomp',
	title: 'STOMP — Simple Text Messaging',
	description:
		'Watch how STOMP provides messaging with a dead-simple text protocol. Any developer who can read HTTP can read STOMP — commands, headers, and a body separated by newlines. It is the easiest way to connect to brokers like RabbitMQ and ActiveMQ.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'broker', label: 'STOMP Broker', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'destination',
			label: 'Destination',
			type: 'text',
			defaultValue: '/queue/orders',
			placeholder: 'e.g. /topic/prices'
		}
	],
	steps: [
		{
			id: 'connect',
			label: 'CONNECT',
			description:
				'The client sends a CONNECT frame with login credentials and protocol version. STOMP frames are human-readable text: a command line, headers as key:value pairs, a blank line, an optional body, and a null character terminator. This simplicity is STOMP\'s main advantage.',
			fromActor: 'client',
			toActor: 'broker',
			duration: 800,
			highlight: ['Command', 'Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53000, dstPort: 61613, flags: 'PSH,ACK' }),
				createSTOMPLayer({
					command: 'CONNECT',
					destination: '',
					contentType: '',
					receipt: '',
					subscription: '',
					body: 'accept-version:1.2, host:broker.example.com, login:guest'
				})
			]
		},
		{
			id: 'connected',
			label: 'CONNECTED',
			description:
				'The broker responds with CONNECTED, confirming the session is established. The version header confirms which STOMP protocol version will be used. The server may also provide a session ID and a heart-beat negotiation for keep-alive pings.',
			fromActor: 'broker',
			toActor: 'client',
			duration: 600,
			highlight: ['Command', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 61613, dstPort: 53000, flags: 'PSH,ACK' }),
				createSTOMPLayer({
					command: 'CONNECTED',
					destination: '',
					contentType: '',
					receipt: '',
					subscription: '',
					body: 'version:1.2, server:RabbitMQ/3.12, session:session-42, heart-beat:10000,10000'
				})
			]
		},
		{
			id: 'subscribe',
			label: 'SUBSCRIBE',
			description:
				'The client subscribes to a destination to receive messages. The subscription ID is required so the client can match incoming MESSAGE frames to the subscription that triggered them. The ack mode controls whether messages need explicit acknowledgment.',
			fromActor: 'client',
			toActor: 'broker',
			duration: 800,
			highlight: ['Command', 'Destination', 'Subscription'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 53000, dstPort: 61613, flags: 'PSH,ACK' }),
				createSTOMPLayer({
					command: 'SUBSCRIBE',
					destination: '/queue/orders',
					contentType: '',
					receipt: '',
					subscription: 'sub-0',
					body: 'ack:client-individual'
				})
			]
		},
		{
			id: 'message',
			label: 'MESSAGE',
			description:
				'The broker delivers a message to the subscribed client. The MESSAGE frame includes the subscription ID, a unique message-id for acknowledgment, and the destination it was published to. The body carries the actual message payload. The client must send ACK if using client acknowledgment mode.',
			fromActor: 'broker',
			toActor: 'client',
			duration: 1000,
			highlight: ['Command', 'Destination', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 61613, dstPort: 53000, flags: 'PSH,ACK' }),
				createSTOMPLayer({
					command: 'MESSAGE',
					destination: '/queue/orders',
					contentType: 'application/json',
					receipt: '',
					subscription: 'sub-0',
					body: '{"orderId": "ORD-5678", "item": "widget", "qty": 3}'
				})
			]
		}
	]
};
