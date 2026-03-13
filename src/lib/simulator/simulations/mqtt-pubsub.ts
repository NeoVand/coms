import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createMQTTLayer } from '../layers/mqtt';

export const mqttPubSub: SimulationConfig = {
	protocolId: 'mqtt',
	title: 'MQTT — Publish/Subscribe Messaging',
	description:
		'Trace how an IoT device connects to an MQTT broker, subscribes to a topic, and publishes a sensor reading. MQTT uses a 2-byte fixed header for minimal overhead on constrained devices.',
	tier: 'client',
	actors: [
		{ id: 'device', label: 'IoT Device', icon: 'device', position: 'left' },
		{ id: 'broker', label: 'MQTT Broker', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'topic',
			label: 'Topic',
			type: 'text',
			defaultValue: 'sensors/temperature',
			placeholder: 'e.g. home/kitchen/temp'
		}
	],
	steps: [
		{
			id: 'connect',
			label: 'CONNECT',
			description:
				'The IoT device opens a TCP connection to the broker and sends a CONNECT packet. This includes a client ID, optional credentials, a keep-alive interval, and a clean session flag. The 2-byte fixed header makes MQTT one of the lightest application protocols.',
			fromActor: 'device',
			toActor: 'broker',
			duration: 1000,
			highlight: ['Packet Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49200, dstPort: 1883, flags: 'PSH,ACK' }),
				createMQTTLayer({
					packetType: 'CONNECT (1)',
					flags: '0000',
					remainingLength: 39,
					packetId: 'N/A',
					topic: '',
					payload: 'ClientID: "sensor-A7B2", KeepAlive: 60s, Clean Start: 1'
				})
			]
		},
		{
			id: 'connack',
			label: 'CONNACK',
			description:
				'The broker validates the client\'s credentials and session state, then responds with CONNACK. A return code of 0 means the connection is accepted. The broker can also signal whether a previous session exists for this client ID.',
			fromActor: 'broker',
			toActor: 'device',
			duration: 800,
			highlight: ['Packet Type', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 1883, dstPort: 49200, flags: 'PSH,ACK' }),
				createMQTTLayer({
					packetType: 'CONNACK (2)',
					flags: '0000',
					remainingLength: 2,
					packetId: 'N/A',
					topic: '',
					payload: 'Session Present: 0, Return Code: 0 (Accepted)'
				})
			]
		},
		{
			id: 'subscribe',
			label: 'SUBSCRIBE',
			description:
				'The device subscribes to a topic filter. Wildcard + matches one level and # matches any remaining levels. Each subscription includes a requested QoS level that determines the delivery guarantee.',
			fromActor: 'device',
			toActor: 'broker',
			duration: 800,
			highlight: ['Topic', 'Packet ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49200, dstPort: 1883, flags: 'PSH,ACK' }),
				createMQTTLayer({
					packetType: 'SUBSCRIBE (8)',
					flags: '0010',
					remainingLength: 31,
					packetId: 1042,
					topic: 'sensors/temperature',
					payload: 'QoS: 1 (At Least Once)'
				})
			]
		},
		{
			id: 'suback',
			label: 'SUBACK',
			description:
				'The broker confirms the subscription and reports the granted QoS level. The granted QoS may be lower than requested if the broker has restrictions. The packet ID matches the SUBSCRIBE to correlate the response.',
			fromActor: 'broker',
			toActor: 'device',
			duration: 600,
			highlight: ['Packet ID', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 1883, dstPort: 49200, flags: 'PSH,ACK' }),
				createMQTTLayer({
					packetType: 'SUBACK (9)',
					flags: '0000',
					remainingLength: 3,
					packetId: 1042,
					topic: '',
					payload: 'Granted QoS: 1 (At Least Once)'
				})
			]
		},
		{
			id: 'publish',
			label: 'PUBLISH',
			description:
				'The device publishes a temperature reading. At QoS 1, the broker must acknowledge receipt. The RETAIN flag can be set so new subscribers immediately get the last value. The topic hierarchy enables flexible routing without broker configuration.',
			fromActor: 'device',
			toActor: 'broker',
			duration: 1000,
			highlight: ['Topic', 'Payload', 'Flags'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49200, dstPort: 1883, flags: 'PSH,ACK' }),
				createMQTTLayer({
					packetType: 'PUBLISH (3)',
					flags: '0010',
					remainingLength: 47,
					packetId: 1043,
					topic: 'sensors/temperature',
					payload: '{"value": 22.5, "unit": "C"}'
				})
			]
		},
		{
			id: 'puback',
			label: 'PUBACK',
			description:
				'The broker acknowledges receipt of the QoS 1 message. At QoS 0 there is no acknowledgment; at QoS 2 a four-step handshake ensures exactly-once delivery. QoS 1 balances reliability and simplicity for most IoT use cases.',
			fromActor: 'broker',
			toActor: 'device',
			duration: 600,
			highlight: ['Packet ID', 'Packet Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 1883, dstPort: 49200, flags: 'PSH,ACK' }),
				createMQTTLayer({
					packetType: 'PUBACK (4)',
					flags: '0000',
					remainingLength: 2,
					packetId: 1043,
					topic: '',
					payload: ''
				})
			]
		}
	]
};
